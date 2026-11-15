// Ciclo 004, issues #33, #34 e #35 — medição das lentes com a carga REAL local (`npm run medir:lentes`), pelo procedimento
// do plano 004 ("Orçamento e procedimento de medição"). Ciclo 005, issue #43: mede também as 8 configurações da
// combinação (os 3 pares e as três lentes, com "e" e com "ou"), repetindo as três lentes, com a mesma regra de aceite
// e de parada, e registra por configuração o número de células e de municípios da cobertura.
// Perfil do ADR-007: Chrome do sistema, 390×844 com
// toque, latência de 150 ms, 1,6 Mbit/s de descida, 750 kbit/s de subida e CPU 4× mais lenta (CDP).
// A interface fala com a API local por um proxy em node:http: na passagem "bruta" ele só repassa (a API
// local não comprime); na "comprimida" aplica gzip nível 6 quando o navegador aceita. O tempo comprimido é
// medido, não estimado. Início: clique em "Aplicar lente"; fim: `data-estado-lente="completo"` (ou
// "sem_destaques" e, na combinação, "sem_celulas_em_comum" ou "sem_celulas_destacadas"). Cache desligado e contexto novo por execução; login antes do início. 3 execuções
// válidas por lente e passagem (mediana), prazo de 120 s, no máximo 6 tentativas. Imprime só agregados.
// Ciclo 007, issue #60 — cenário M1 ("abertura", plano 007, T14): sessão já guardada, contexto novo; da recarga da
// página até `data-estado-painel="pronto"` (filtros, série e municípios prontos). 5 execuções válidas por passagem,
// mediana comprimida ≤ 5 s. Só ele: `npm run medir:lentes -- abertura`.
// Ciclo 007, issue #61 — a lente é calculada ao escolher (sem botão) e a consulta lê o recorte inteiro (T7).
// M3 (configurações "frias"): contexto novo, rede e CPU limitadas desde o login; a configuração é marcada e a lente
// escolhida assim que o painel fica pronto, com a leitura completa da consulta ainda em curso (a lente espera por ela,
// sem ler de novo). Início: escolha da lente; fim: o estado final da lente. M2 (`troca`): mesma página e recorte
// estadual, depois da leitura completa e da persistência; da escolha da recorrência ao estado final, ≤ 3 s. M4
// (`pontos`): recarga com a sessão guardada; do painel pronto a `data-estado-pontos="completo"`, ≤ 20 s.
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { sqlAdmin } from '../banco/local.mjs';
import { L, criarRp, limpar, publicarCargaReal } from '../lentes/carga-real.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const VITE = path.join(RAIZ, 'node_modules/vite/bin/vite.js');
const BASE = 'http://127.0.0.1:5173';
const REDE = { offline: false, latency: 150, downloadThroughput: Math.round((1.6 * 1024 * 1024) / 8), uploadThroughput: Math.round((750 * 1024) / 8) };
const CPU = 4;
const PRAZO_MS = 120_000;
const VALIDAS = 3;
const MAX_TENTATIVAS = 6;
const ORCAMENTO = { segundosComprimida: 20.0, bytesBrutos: 10_000_000 };
const ABERTURA = { validas: 5, segundosComprimida: 5.0 };
const TROCA = { validas: 5, segundosComprimida: 3.0 };
const PONTOS = { validas: 5, segundosComprimida: 20.0 };
const LENTES = ['concentracao', 'recorrencia', 'persistencia'];
const PARES_E_TRES = [['concentracao', 'recorrencia'], ['concentracao', 'persistencia'], ['recorrencia', 'persistencia'], LENTES];
const CLASSES = ['protecao_integral', 'uso_sustentavel', 'terra_indigena'];
/**
 * As três lentes, repetidas, as 8 configurações da combinação (plano 005, R1-6) e, no ciclo 006 (issue #52), a
 * sobreposição nas três classes. Um argumento opcional limita às configurações cujo nome começa com ele
 * (por exemplo, `sobreposicao`), sem mudar a regra de aceite.
 */
const TODAS = [
  { nome: 'abertura', abertura: true },
  { nome: 'troca', troca: true },
  { nome: 'pontos', pontos: true },
  ...LENTES.map((l) => ({ nome: l, lente: l })),
  ...PARES_E_TRES.flatMap((lentes) => ['e', 'ou'].map((operador) => ({ nome: `${lentes.join('+')} (${operador})`, lente: 'combinacao', lentes, operador }))),
  ...CLASSES.map((classe) => ({ nome: `sobreposicao:${classe}`, lente: 'sobreposicao', classe })),
];
const SO = process.argv[2] ?? '';
const CONFIGURACOES = TODAS.filter((c) => c.nome.startsWith(SO));
if (!CONFIGURACOES.length) throw new Error(`nenhuma configuração começa com "${SO}"`);
const FINAIS = ['completo', 'sem_destaques', 'janela_insuficiente', 'cobertura_nao_verificada', 'contorno_indisponivel', 'leitura_inconsistente', 'falha', 'cancelada',
  'sem_celulas_em_comum', 'sem_celulas_destacadas', 'indisponivel', 'versao_substituida', 'sem_camada'];
const VALIDOS = ['completo', 'sem_destaques', 'sem_celulas_em_comum', 'sem_celulas_destacadas'];

// --- Proxy de compressão ---------------------------------------------------------------------------
let modo = 'bruta';
const api = new URL(L.api);
const proxy = http.createServer((req, res) => {
  const pedaços = [];
  req.on('data', (c) => pedaços.push(c));
  req.on('end', () => {
    const encaminhado = http.request({
      host: api.hostname, port: api.port, path: req.url, method: req.method,
      headers: { ...req.headers, host: api.host, 'accept-encoding': 'identity' },
    }, (r) => {
      const corpo = [];
      r.on('data', (c) => corpo.push(c));
      r.on('end', () => {
        let dados = Buffer.concat(corpo);
        const cabecalhos = { ...r.headers };
        delete cabecalhos['content-length'];
        delete cabecalhos['transfer-encoding'];
        if (modo === 'comprimida' && /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? '')) && dados.length > 0 && !r.headers['content-encoding']) {
          dados = gzipSync(dados, { level: 6 });
          cabecalhos['content-encoding'] = 'gzip';
          cabecalhos.vary = 'Accept-Encoding';
        }
        cabecalhos['content-length'] = String(dados.length);
        res.writeHead(r.statusCode ?? 502, cabecalhos);
        res.end(dados);
      });
    });
    encaminhado.on('error', () => { res.writeHead(502); res.end(); });
    encaminhado.end(Buffer.concat(pedaços));
  });
});

// --- Coleta por CDP --------------------------------------------------------------------------------
function coletor(cdp) {
  let ativas = new Map();
  let feitas = [];
  cdp.on('Network.requestWillBeSent', (e) => {
    if (e.request.url.includes('/rest/v1/')) ativas.set(e.requestId, { url: e.request.url, metodo: e.request.method });
  });
  cdp.on('Network.loadingFinished', (e) => {
    const a = ativas.get(e.requestId);
    if (a) { feitas.push({ ...a, bytes: e.encodedDataLength }); ativas.delete(e.requestId); }
  });
  return {
    zerar() { ativas = new Map(); feitas = []; },
    resumo() {
      // Áreas: linha da carga, áreas e vínculos lidos por T25 (sobreposição) e contornos reais.
      const ehArea = (u) => u.includes('/rest/v1/areas') || u.includes('/rest/v1/deteccoes_areas') || u.includes('/rest/v1/cargas') || u.includes('/rest/v1/publicacao_vigente');
      const parte = (f) => (f.url.includes('consultar_disponibilidade') ? 'disponibilidade' : f.url.includes('geometria_exibicao') ? 'geometria'
        : f.url.includes('geometria_real') ? 'contornos' : ehArea(f.url) ? 'areas' : 'registros');
      const soma = (xs) => ({ requisicoes: xs.length, bytes: xs.reduce((s, x) => s + x.bytes, 0) });
      const dados = feitas.filter((f) => f.metodo !== 'OPTIONS');
      return {
        total: soma(feitas), preflight: soma(feitas.filter((f) => f.metodo === 'OPTIONS')),
        registros: soma(dados.filter((f) => parte(f) === 'registros')),
        disponibilidade: soma(dados.filter((f) => parte(f) === 'disponibilidade')),
        geometria: soma(dados.filter((f) => parte(f) === 'geometria')),
        areas: soma(dados.filter((f) => parte(f) === 'areas')),
        contornos: soma(dados.filter((f) => parte(f) === 'contornos')),
      };
    },
  };
}

async function esperarServidor() {
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('servidor da interface não subiu');
}

async function executar(browser, rp, config, indice = 0) {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const c = coletor(cdp);
  try {
    await page.goto(BASE);
    await page.locator('#l-email').fill(rp.email);
    await page.locator('#l-senha').fill(rp.senha);
    await cdp.send('Network.emulateNetworkConditions', REDE);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    c.zerar();
    await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
    await page.locator('#conteudo[data-estado-painel="pronto"]').waitFor({ timeout: PRAZO_MS });
    // Configuração marcada antes de escolher a lente (um cálculo só) e seção aberta, sem cliques intermediários.
    const radio = page.locator(`input[name="l-lente"][value="${config.lente}"]`);
    const pontosAntes = await page.evaluate((cfg) => {
      const marcar = (sel, v) => { const e = document.querySelector(sel); if (e) e.checked = v; };
      if (cfg.lente === 'combinacao') {
        for (const l of ['concentracao', 'recorrencia', 'persistencia']) marcar(`input[name="l-comb"][value="${l}"]`, cfg.lentes.includes(l));
        marcar(`input[name="l-operador"][value="${cfg.operador}"]`, true);
      }
      if (cfg.lente === 'sobreposicao') marcar(`input[name="l-classe"][value="${cfg.classe}"]`, true);
      const secao = document.querySelector(`input[name="l-lente"][value="${cfg.lente}"]`)?.closest('details');
      if (secao) secao.open = true;
      return document.getElementById('conteudo')?.dataset.estadoPontos ?? '';
    }, { lente: config.lente, lentes: config.lentes ?? [], operador: config.operador ?? 'e', classe: config.classe ?? '' });
    const t0 = performance.now();
    await radio.check();
    let estado = 'prazo';
    try {
      await page.waitForFunction((finais) => finais.includes(document.getElementById('cartao-lentes')?.dataset.estadoLente ?? ''), FINAIS, { timeout: PRAZO_MS, polling: 50 });
      estado = await page.locator('#cartao-lentes').getAttribute('data-estado-lente');
    } catch { /* prazo */ }
    const segundos = Math.round((performance.now() - t0) / 100) / 10;
    const textoApp = (await page.locator('#lente-estado').innerText().catch(() => '')).trim();
    const valida = VALIDOS.includes(estado ?? '');
    // Combinação e sobreposição: número de células declarado pela lista ("Células 1 a 50 de M.").
    const info = config.lente === 'combinacao' || config.lente === 'sobreposicao' ? await page.locator('#lente-celulas-info').innerText().catch(() => '') : '';
    const celulas = /de ([\d.]+)\.$/.exec(info.trim())?.[1]?.replaceAll('.', '') ?? null;
    const resumo = c.resumo();
    // Abertura de célula (R1-8), fora do aceite: contornos reais de cada área do destaque, depois do estado completo.
    const aberturas = [];
    // Uma célula-alvo por execução, em contexto novo: a memória de contornos começa vazia em cada abertura.
    for (const alvo of valida && config.alvos?.length ? [config.alvos[indice % config.alvos.length]] : []) {
      while (!(await page.locator(`#lente-destaques button[data-id="${alvo.id}"]`).count())) {
        if (!(await page.locator('#celulas-proxima:not([disabled])').count())) break;
        await page.locator('#celulas-proxima').click();
      }
      c.zerar();
      const t1 = performance.now();
      await page.locator(`#lente-destaques button[data-id="${alvo.id}"]`).click();
      await page.waitForFunction(() => ['exibido', 'falha'].includes(document.getElementById('lente-contornos')?.dataset.contornos ?? ''), null, { timeout: PRAZO_MS, polling: 50 });
      const estadoContornos = await page.locator('#lente-contornos').getAttribute('data-contornos');
      aberturas.push({ alvo: alvo.tipo, areas: alvo.areas, estado: estadoContornos, ms: Math.round(performance.now() - t1), contornos: c.resumo().contornos });
    }
    return { valida, estado, segundos, textoApp, pontosAntes, celulas: celulas === null ? null : Number(celulas), ...resumo, aberturas };
  } finally {
    await contexto.close();
  }
}

/** M1 (T14): recarga com a sessão guardada até o painel pronto. */
async function executarAbertura(browser, rp) {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const c = coletor(cdp);
  try {
    await page.goto(BASE);
    await page.locator('#l-email').fill(rp.email);
    await page.locator('#l-senha').fill(rp.senha);
    await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
    await page.locator('#conteudo[data-estado-painel="pronto"]').waitFor({ timeout: PRAZO_MS });
    await cdp.send('Network.emulateNetworkConditions', REDE);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    c.zerar();
    const t0 = performance.now();
    await page.reload();
    let estado = 'prazo';
    try {
      await page.waitForFunction(() => { const e = document.getElementById('conteudo'); return !!e && !e.hidden && ['pronto', 'erro'].includes(e.dataset.estadoPainel ?? ''); }, null, { timeout: PRAZO_MS, polling: 50 });
      estado = await page.locator('#conteudo').getAttribute('data-estado-painel');
    } catch { /* prazo */ }
    const segundos = Math.round((performance.now() - t0) / 100) / 10;
    return { valida: estado === 'pronto', estado, segundos, ...c.resumo() };
  } finally {
    await contexto.close();
  }
}

/** M2 (T14): na mesma página e recorte estadual, depois da leitura completa e da persistência, troca para a recorrência. */
async function executarTroca(browser, rp) {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const c = coletor(cdp);
  const estadoFinal = async () => {
    await page.waitForFunction((finais) => finais.includes(document.getElementById('cartao-lentes')?.dataset.estadoLente ?? ''), FINAIS, { timeout: PRAZO_MS, polling: 50 });
    return page.locator('#cartao-lentes').getAttribute('data-estado-lente');
  };
  try {
    await page.goto(BASE);
    await page.locator('#l-email').fill(rp.email);
    await page.locator('#l-senha').fill(rp.senha);
    await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
    await page.locator('#conteudo[data-estado-pontos="completo"]').waitFor({ timeout: PRAZO_MS });
    await page.evaluate(() => { const s = document.getElementById('secao-lente'); if (s) s.open = true; });
    await page.locator('input[name="l-lente"][value="persistencia"]').check();
    await estadoFinal();
    await cdp.send('Network.emulateNetworkConditions', REDE);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    c.zerar();
    const t0 = performance.now();
    await page.locator('input[name="l-lente"][value="recorrencia"]').check();
    let estado = 'prazo';
    try { estado = await estadoFinal(); } catch { /* prazo */ }
    const segundos = Math.round((performance.now() - t0) / 100) / 10;
    return { valida: VALIDOS.includes(estado ?? ''), estado, segundos, ...c.resumo() };
  } finally {
    await contexto.close();
  }
}

/** M4 (T14): recarga com a sessão guardada; do painel pronto até todos os pontos do estado. */
async function executarPontos(browser, rp) {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const c = coletor(cdp);
  try {
    await page.goto(BASE);
    await page.locator('#l-email').fill(rp.email);
    await page.locator('#l-senha').fill(rp.senha);
    await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
    await page.locator('#conteudo[data-estado-pontos="completo"]').waitFor({ timeout: PRAZO_MS });
    await cdp.send('Network.emulateNetworkConditions', REDE);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    c.zerar();
    await page.reload();
    await page.waitForFunction(() => { const e = document.getElementById('conteudo'); return !!e && !e.hidden && e.dataset.estadoPainel === 'pronto'; }, null, { timeout: PRAZO_MS, polling: 50 });
    const t0 = performance.now();
    let estado = 'prazo';
    try {
      await page.waitForFunction(() => ['completo', 'erro'].includes(document.getElementById('conteudo')?.dataset.estadoPontos ?? ''), null, { timeout: PRAZO_MS, polling: 50 });
      estado = await page.locator('#conteudo').getAttribute('data-estado-pontos');
    } catch { /* prazo */ }
    const segundos = Math.round((performance.now() - t0) / 100) / 10;
    const texto = (await page.locator('#mapa-contagem').innerText().catch(() => '')).trim();
    return { valida: estado === 'completo', estado, segundos, texto, ...c.resumo() };
  } finally {
    await contexto.close();
  }
}

const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

// --- Execução --------------------------------------------------------------------------------------
let rp = null;
let servidor = null;
const relatorio = {
  geradoEm: new Date().toISOString(),
  commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
  perfil: { navegador: 'Chrome do sistema (Playwright, channel chrome)', viewport: '390x844 com toque', rede: 'latência 150 ms, 1,6 Mbit/s descida, 750 kbit/s subida', cpu: `${CPU}x mais lenta (CDP)`, cache: 'desligado, contexto novo por execução', proxy: 'node:http local; bruta = repasse sem compressão; comprimida = gzip nível 6' },
  orcamento: ORCAMENTO, prazoMs: PRAZO_MS, configuracoes: [],
};
let excedeu = false;
try {
  const carga = publicarCargaReal(40);
  relatorio.carga = { id: carga.id, identidade: carga.identidade, janela: carga.janela };
  // Células-alvo da abertura (R1-8), por classe: a de mais áreas e a de maior soma de bytes de contorno real.
  for (const config of CONFIGURACOES.filter((x) => x.lente === 'sobreposicao')) {
    const sql = (ordem) => sqlAdmin(`with v as (
  select distinct floor(d.latitude::numeric * 20)::int as la, floor(d.longitude::numeric * 20)::int as lo, a.fonte, a.codigo, octet_length(a.geometria_real::text) as b
  from public.deteccoes_areas v join public.deteccoes d on (d.carga_id, d.id_tecnico) = (v.carga_id, v.id_tecnico)
  join public.areas a on (a.carga_id, a.fonte, a.codigo) = (v.carga_id, v.area_fonte, v.area_codigo)
  where v.carga_id = ${carga.id} and d.escopo = 'principal' and a.classe = '${config.classe}')
select la, lo, count(*), sum(b) from v group by la, lo order by ${ordem}, la desc, lo limit 1;`).split('|').map(Number);
    config.alvos = [['mais_areas', 'count(*) desc, sum(b) desc'], ['maior_soma_bytes', 'sum(b) desc']].map(([tipo, ordem]) => {
      const [la, lo, areas, bytes] = sql(ordem);
      return { tipo, id: `sobreposicao:${config.classe}:celula_005:c${la}_${lo}`, areas, bytesContornoNoBanco: bytes };
    });
  }
  rp = await criarRp('rp-medicao-lentes@exemplo.test');
  await new Promise((ok, erro) => { proxy.once('error', erro); proxy.listen(0, '127.0.0.1', ok); });
  const portaProxy = proxy.address().port;
  const env = { ...process.env, VITE_SUPABASE_URL: `http://127.0.0.1:${portaProxy}`, VITE_SUPABASE_CHAVE_PUBLICAVEL: L.anon, VITE_AUTH_SENHA_LOCAL: 'true', RQ_OUT_DIR: 'dist-e2e' };
  const build = spawnSync(process.execPath, [VITE, 'build'], { cwd: RAIZ, env, stdio: ['ignore', 'ignore', 'inherit'] });
  if (build.status !== 0) throw new Error('build da interface falhou');
  servidor = spawn(process.execPath, [VITE, 'preview', '--outDir', 'dist-e2e', '--port', '5173', '--strictPort', '--host', '127.0.0.1'], { cwd: RAIZ, env, stdio: ['ignore', 'ignore', 'inherit'] });
  await esperarServidor();
  const browser = await chromium.launch({ channel: 'chrome' });
  relatorio.perfil.versaoChrome = browser.version();
  for (const config of CONFIGURACOES) {
    if (config.troca || config.pontos) {
      const regra = config.troca ? TROCA : PONTOS;
      const rodar = config.troca ? executarTroca : executarPontos;
      const porPassagem = {};
      for (const passagem of ['bruta', 'comprimida']) {
        modo = passagem;
        const validas = [];
        const invalidas = [];
        for (let tentativa = 1; tentativa <= regra.validas + 3 && validas.length < regra.validas; tentativa += 1) {
          const r = await rodar(browser, rp);
          if (r.valida) validas.push(r);
          else invalidas.push({ tentativa, estado: r.estado, segundos: r.segundos });
        }
        porPassagem[passagem] = {
          validas: validas.length, invalidas,
          medianaSegundos: validas.length >= regra.validas ? mediana(validas.map((v) => v.segundos)) : null,
          maxSegundos: validas.length ? Math.max(...validas.map((v) => v.segundos)) : null,
          maxBytes: validas.length ? Math.max(...validas.map((v) => v.total.bytes)) : null,
          execucoes: validas.map((v) => ({ segundos: v.segundos, texto: v.texto, total: v.total, registros: v.registros, disponibilidade: v.disponibilidade })),
        };
      }
      const cm = porPassagem.comprimida;
      const dentro = cm.medianaSegundos !== null && cm.medianaSegundos <= regra.segundosComprimida;
      if (!dentro) excedeu = true;
      relatorio.configuracoes.push({ configuracao: config.nome, orcamento: regra, dentroDoOrcamento: dentro, ...porPassagem });
      process.stderr.write(`${config.nome} (${config.troca ? 'M2' : 'M4'}): ${dentro ? 'dentro' : 'FORA'} (comprimida ${cm.medianaSegundos} s; bruta ${porPassagem.bruta.medianaSegundos} s)\n`);
      continue;
    }
    if (config.abertura) {
      const porPassagem = {};
      for (const passagem of ['bruta', 'comprimida']) {
        modo = passagem;
        const validas = [];
        const invalidas = [];
        for (let tentativa = 1; tentativa <= ABERTURA.validas + 3 && validas.length < ABERTURA.validas; tentativa += 1) {
          const r = await executarAbertura(browser, rp);
          if (r.valida) validas.push(r);
          else invalidas.push({ tentativa, estado: r.estado, segundos: r.segundos });
        }
        porPassagem[passagem] = {
          validas: validas.length, invalidas,
          medianaSegundos: validas.length >= ABERTURA.validas ? mediana(validas.map((v) => v.segundos)) : null,
          maxSegundos: validas.length ? Math.max(...validas.map((v) => v.segundos)) : null,
          maxBytes: validas.length ? Math.max(...validas.map((v) => v.total.bytes)) : null,
          execucoes: validas.map((v) => ({ segundos: v.segundos, total: v.total, registros: v.registros, disponibilidade: v.disponibilidade, geometria: v.geometria })),
        };
      }
      const cm = porPassagem.comprimida;
      const dentro = cm.medianaSegundos !== null && cm.medianaSegundos <= ABERTURA.segundosComprimida;
      if (!dentro) excedeu = true;
      relatorio.configuracoes.push({ configuracao: config.nome, orcamento: ABERTURA, dentroDoOrcamento: dentro, ...porPassagem });
      process.stderr.write(`abertura (M1): ${dentro ? 'dentro' : 'FORA'} (comprimida ${cm.medianaSegundos} s; bruta ${porPassagem.bruta.medianaSegundos} s)\n`);
      continue;
    }
    const porPassagem = {};
    for (const passagem of ['bruta', 'comprimida']) {
      modo = passagem;
      const validas = [];
      const invalidas = [];
      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS && validas.length < VALIDAS; tentativa += 1) {
        const r = await executar(browser, rp, config, validas.length);
        if (r.valida) validas.push(r);
        else invalidas.push({ tentativa, estado: r.estado, segundos: r.segundos, textoApp: r.textoApp });
      }
      porPassagem[passagem] = {
        validas: validas.length, invalidas,
        medianaSegundos: validas.length >= VALIDAS ? mediana(validas.map((v) => v.segundos)) : null,
        maxSegundos: validas.length ? Math.max(...validas.map((v) => v.segundos)) : null,
        maxBytes: validas.length ? Math.max(...validas.map((v) => v.total.bytes)) : null,
        execucoes: validas.map((v) => ({ segundos: v.segundos, textoApp: v.textoApp, pontosAntes: v.pontosAntes, celulas: v.celulas, total: v.total, preflight: v.preflight, registros: v.registros, disponibilidade: v.disponibilidade, geometria: v.geometria, areas: v.areas, aberturas: v.aberturas })),
      };
    }
    const b = porPassagem.bruta;
    const c = porPassagem.comprimida;
    const dentro = c.medianaSegundos !== null && c.medianaSegundos <= ORCAMENTO.segundosComprimida && b.maxBytes !== null && b.maxBytes <= ORCAMENTO.bytesBrutos && b.validas >= VALIDAS;
    if (!dentro) excedeu = true;
    // Municípios da cobertura: chamadas de disponibilidade (uma por município, com a memória vazia em cada contexto).
    const todas = [...b.execucoes, ...c.execucoes];
    const municipios = [...new Set(todas.map((v) => v.disponibilidade.requisicoes))];
    const celulas = [...new Set(todas.map((v) => v.celulas))];
    // Abertura de célula: registrada por passagem e alvo, sem teto (Q8, R1-8).
    const aberturas = Object.entries(porPassagem).flatMap(([passagem, x]) => x.execucoes.flatMap((v) => v.aberturas.map((a) => ({ passagem, ...a }))));
    const areas = [...new Set(todas.map((v) => JSON.stringify(v.areas)))].map((x) => JSON.parse(x));
    relatorio.configuracoes.push({ configuracao: config.nome, dentroDoOrcamento: dentro, celulas, municipios, alvos: config.alvos, aberturas, areasLidas: areas, ...porPassagem });
    process.stderr.write(`${config.nome}: ${dentro ? 'dentro' : 'FORA'} (comprimida ${c.medianaSegundos} s; bruta, maior total ${b.maxBytes} bytes)\n`);
  }
  await browser.close();
  relatorio.identidadeNoFim = sqlAdmin(`select identidade from public.cargas where id = ${carga.id};`);
  if (relatorio.identidadeNoFim !== carga.identidade) { excedeu = true; relatorio.erro = 'identidade da carga mudou durante a medição'; }
} finally {
  servidor?.kill();
  if (proxy.listening) proxy.close();
  await limpar(rp);
}
relatorio.resultado = excedeu ? 'parado' : 'dentro_do_orcamento';
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'medicao-lentes.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ ...relatorio, configuracoes: relatorio.configuracoes.map((l) => ({ configuracao: l.configuracao, dentroDoOrcamento: l.dentroDoOrcamento, celulas: l.celulas, municipios: l.municipios, alvos: l.alvos, aberturas: l.aberturas, areasLidas: l.areasLidas, bruta: { ...l.bruta, execucoes: undefined }, comprimida: { ...l.comprimida, execucoes: undefined } })) }, null, 2)}\n`);
if (excedeu) process.exitCode = 1;
