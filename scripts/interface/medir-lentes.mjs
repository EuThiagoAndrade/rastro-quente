// Ciclo 004, issues #33 e #34 — medição das lentes com a carga REAL local (`npm run medir:lentes`), pelo procedimento
// do plano 004 ("Orçamento e procedimento de medição"). Perfil do ADR-007: Chrome do sistema, 390×844 com
// toque, latência de 150 ms, 1,6 Mbit/s de descida, 750 kbit/s de subida e CPU 4× mais lenta (CDP).
// A interface fala com a API local por um proxy em node:http: na passagem "bruta" ele só repassa (a API
// local não comprime); na "comprimida" aplica gzip nível 6 quando o navegador aceita. O tempo comprimido é
// medido, não estimado. Início: clique em "Aplicar lente"; fim: `data-estado-lente="completo"` (ou
// "sem_destaques"). Cache desligado e contexto novo por execução; login antes do início. 3 execuções
// válidas por lente e passagem (mediana), prazo de 120 s, no máximo 6 tentativas. Imprime só agregados.
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
const LENTES = ['concentracao', 'recorrencia'];
const FINAIS = ['completo', 'sem_destaques', 'janela_insuficiente', 'cobertura_nao_verificada', 'contorno_indisponivel', 'leitura_inconsistente', 'falha', 'cancelada'];

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
      const parte = (f) => (f.url.includes('consultar_disponibilidade') ? 'disponibilidade' : f.url.includes('geometria_exibicao') ? 'geometria' : 'registros');
      const soma = (xs) => ({ requisicoes: xs.length, bytes: xs.reduce((s, x) => s + x.bytes, 0) });
      const dados = feitas.filter((f) => f.metodo !== 'OPTIONS');
      return {
        total: soma(feitas), preflight: soma(feitas.filter((f) => f.metodo === 'OPTIONS')),
        registros: soma(dados.filter((f) => parte(f) === 'registros')),
        disponibilidade: soma(dados.filter((f) => parte(f) === 'disponibilidade')),
        geometria: soma(dados.filter((f) => parte(f) === 'geometria')),
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

async function executar(browser, rp, lente) {
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
    await page.locator('#total-principal').waitFor({ timeout: PRAZO_MS });
    await page.locator('#l-lente').selectOption(lente);
    await cdp.send('Network.emulateNetworkConditions', REDE);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    c.zerar();
    const t0 = performance.now();
    await page.locator('#botao-lente').click();
    let estado = 'prazo';
    try {
      await page.waitForFunction((finais) => finais.includes(document.getElementById('cartao-lentes')?.dataset.estadoLente ?? ''), FINAIS, { timeout: PRAZO_MS, polling: 50 });
      estado = await page.locator('#cartao-lentes').getAttribute('data-estado-lente');
    } catch { /* prazo */ }
    const segundos = Math.round((performance.now() - t0) / 100) / 10;
    const textoApp = (await page.locator('#lente-estado').innerText().catch(() => '')).trim();
    const valida = estado === 'completo' || estado === 'sem_destaques';
    return { valida, estado, segundos, textoApp, ...c.resumo() };
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
  orcamento: ORCAMENTO, prazoMs: PRAZO_MS, lentes: [],
};
let excedeu = false;
try {
  const carga = publicarCargaReal(40);
  relatorio.carga = { id: carga.id, identidade: carga.identidade, janela: carga.janela };
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
  for (const lente of LENTES) {
    const porPassagem = {};
    for (const passagem of ['bruta', 'comprimida']) {
      modo = passagem;
      const validas = [];
      const invalidas = [];
      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS && validas.length < VALIDAS; tentativa += 1) {
        const r = await executar(browser, rp, lente);
        if (r.valida) validas.push(r);
        else invalidas.push({ tentativa, estado: r.estado, segundos: r.segundos });
      }
      porPassagem[passagem] = {
        validas: validas.length, invalidas,
        medianaSegundos: validas.length >= VALIDAS ? mediana(validas.map((v) => v.segundos)) : null,
        maxSegundos: validas.length ? Math.max(...validas.map((v) => v.segundos)) : null,
        maxBytes: validas.length ? Math.max(...validas.map((v) => v.total.bytes)) : null,
        execucoes: validas.map((v) => ({ segundos: v.segundos, textoApp: v.textoApp, total: v.total, preflight: v.preflight, registros: v.registros, disponibilidade: v.disponibilidade, geometria: v.geometria })),
      };
    }
    const b = porPassagem.bruta;
    const c = porPassagem.comprimida;
    const dentro = c.medianaSegundos !== null && c.medianaSegundos <= ORCAMENTO.segundosComprimida && b.maxBytes !== null && b.maxBytes <= ORCAMENTO.bytesBrutos && b.validas >= VALIDAS;
    if (!dentro) excedeu = true;
    relatorio.lentes.push({ lente, dentroDoOrcamento: dentro, ...porPassagem });
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
process.stdout.write(`${JSON.stringify({ ...relatorio, lentes: relatorio.lentes.map((l) => ({ lente: l.lente, dentroDoOrcamento: l.dentroDoOrcamento, bruta: { ...l.bruta, execucoes: undefined }, comprimida: { ...l.comprimida, execucoes: undefined } })) }, null, 2)}\n`);
if (excedeu) process.exitCode = 1;
