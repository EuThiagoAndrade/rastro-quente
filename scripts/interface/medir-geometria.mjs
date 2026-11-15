// Ciclo 003, issue #23 — medição da primeira exibição e da navegação da geometria em celular, com a carga
// REAL do item 1 no banco local e a interface construída (`npm run medir:interface`).
// Perfil declarado: Chrome do sistema, viewport 390×844 com toque, rede "Slow 4G" emulada (latência de 150 ms,
// 1,6 Mbit/s de descida, 750 kbit/s de subida) e CPU 4× mais lenta, via CDP. O Supabase local não comprime
// respostas: "bruta" é o que trafegou; "gzip estimado" é `gzip -6` local. Grava `local/dados-prototipo/medicao-interface.json`
// (ignorado pelo Git) e imprime só agregados: nenhum dado de detecção, nome ou identificador.
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { requisitar, sqlAdmin, statusLocal, verificadorScram } from '../banco/local.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const CARGA = path.join(RAIZ, 'scripts/banco/carga.mjs');
const L = statusLocal();
const URL_EX = `postgresql://rq_executor@127.0.0.1:${L.bancoPorta}/postgres`;
const BASE = 'http://127.0.0.1:5173';
const REDE = { offline: false, latency: 150, downloadThroughput: Math.round((1.6 * 1024 * 1024) / 8), uploadThroughput: Math.round((750 * 1024) / 8) };
const CPU = 4;
const senhaEx = randomBytes(24).toString('base64url');
const senhaRp = randomBytes(18).toString('base64url');
const EMAIL = 'rp-medicao-ui@exemplo.test';

if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npx supabase db reset`.');

const cli = (args) => JSON.parse(execFileSync(process.execPath, [CARGA, ...args], {
  encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, RQ_EXECUTOR_PASSWORD: senhaEx },
}));

function carregar(exibicao, revisao) {
  const opcoes = ['--alvo', URL_EX, '--exibicao', exibicao, '--revisao', String(revisao)];
  const sql = path.join(LOCAL, `aprovacao-interface-${exibicao}.sql`);
  const plano = cli(['plan', ...opcoes, '--sql', sql]);
  if (plano.paradas.length) throw new Error(`plano com parada: ${plano.paradas}`);
  sqlAdmin(readFileSync(sql, 'utf8'));
  const r = cli(['apply', ...opcoes, '--identidade', plano.identidade]);
  if (r.result !== 'executed') throw new Error(`apply: ${r.result}`);
  return plano.identidade;
}

async function esperarServidor() {
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(BASE)).ok) return; } catch { /* ainda subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('servidor da interface não subiu');
}

// Coleta bytes e requisições REST de um cenário via eventos de rede do CDP.
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
      const geom = feitas.filter((f) => f.url.includes('geometria_exibicao'));
      const soma = (xs) => ({ requisicoes: xs.length, bytes: xs.reduce((s, x) => s + x.bytes, 0) });
      return { total: soma(feitas), geometria: soma(geom), outras: soma(feitas.filter((f) => !geom.includes(f))) };
    },
    /** Soma das requisições (sem pré-voo) cuja URL decodificada satisfaz `pred`. */
    filtrar(pred) {
      const xs = feitas.filter((f) => f.metodo !== 'OPTIONS' && pred(decodeURIComponent(f.url)));
      return { requisicoes: xs.length, bytes: xs.reduce((s, x) => s + x.bytes, 0) };
    },
  };
}

async function medirQualidade(browser, qualidade, cargaId) {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  const c = coletor(cdp);

  // Login sem limitação; a medição começa com a sessão já guardada, como numa visita de retorno.
  await page.goto(BASE);
  await page.locator('#l-email').fill(EMAIL);
  await page.locator('#l-senha').fill(senhaRp);
  await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
  await page.locator('#total-principal').waitFor();

  await cdp.send('Network.emulateNetworkConditions', REDE);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const r = { qualidade };

  // 1. Abertura (sem geometria): recarrega a página e espera o total aparecer.
  c.zerar();
  let t0 = performance.now();
  await page.reload();
  await page.locator('#total-principal').waitFor({ timeout: 120_000 });
  r.abertura = { ms: Math.round(performance.now() - t0), ...c.resumo() };

  // 2. Navegação a um município (geometria de um município): o de mais detecções e o de maior geometria.
  const alvos = {
    maisDetecoes: sqlAdmin(`select municipio_codigo from public.deteccoes where carga_id = ${cargaId} group by 1 order by count(*) desc limit 1;`),
    maiorGeometria: sqlAdmin(`select codigo from public.municipios where carga_id = ${cargaId} order by octet_length(geometria_exibicao::text) desc limit 1;`),
  };
  r.municipio = {};
  for (const [nome, codigo] of Object.entries(alvos)) {
    await page.reload();
    await page.locator('#total-principal').waitFor({ timeout: 120_000 });
    // Plano 007 (T16): sem botão "Consultar"; o município se aplica ao mudar (seção Consulta fechada em tela estreita).
    if ((await page.locator('#secao-consulta').getAttribute('open')) === null) await page.locator('#secao-consulta > summary').click();
    c.zerar();
    t0 = performance.now();
    await page.locator('#f-municipio').selectOption(codigo);
    await page.waitForFunction(() => /Limites municipais carregados: 1\b/.test(document.getElementById('mapa-contagem')?.textContent ?? ''), null, { timeout: 120_000 });
    const ms = Math.round(performance.now() - t0);
    r.municipio[nome] = { ms, ...c.resumo() };
  }

  // 3. Conjunto de limites do estado, por pedido do usuário.
  await page.reload();
  await page.locator('#total-principal').waitFor({ timeout: 120_000 });
  c.zerar();
  t0 = performance.now();
  await page.getByRole('button', { name: 'Mostrar limites municipais' }).click();
  await page.waitForFunction(() => /Limites municipais carregados: 142\b/.test(document.getElementById('mapa-contagem')?.textContent ?? ''), null, { timeout: 180_000 });
  r.conjunto = { ms: Math.round(performance.now() - t0), ...c.resumo() };
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await contexto.close();
  return r;
}

// Ciclo 006, issue #52 — camada de áreas protegidas: visão geral (teto de 0,6 MB brutos, Q8) e o contorno real da
// maior área, isolado (sem teto; tempo e bytes registrados). Mesmo perfil de rede e CPU; sessão já guardada.
const TETO_VISAO_GERAL = 600_000;
async function medirAreas(browser, cargaId) {
  const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, locale: 'pt-BR' });
  const page = await contexto.newPage();
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const c = coletor(cdp);
  await page.goto(BASE);
  await page.locator('#l-email').fill(EMAIL);
  await page.locator('#l-senha').fill(senhaRp);
  await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
  await page.locator('#total-principal').waitFor({ timeout: 120_000 });
  await cdp.send('Network.emulateNetworkConditions', REDE);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const finais = ['visivel', 'sem_camada', 'falha', 'leitura_inconsistente'];

  // 1. Visão geral: do clique em "Mostrar áreas protegidas" até a camada desenhada.
  c.zerar();
  let t0 = performance.now();
  await page.getByRole('button', { name: 'Mostrar áreas protegidas' }).click();
  await page.waitForFunction((f) => f.includes(document.getElementById('mapa-areas')?.dataset.estadoAreas ?? ''), finais, { timeout: 120_000, polling: 50 });
  const visao = {
    ms: Math.round(performance.now() - t0),
    estado: await page.locator('#mapa-areas').getAttribute('data-estado-areas'),
    areasNoMapa: await page.locator('#mapa path[data-chave]').count(),
    areas: c.filtrar((u) => u.includes('/rest/v1/areas?')),
    vinculos: c.filtrar((u) => u.includes('/rest/v1/deteccoes_areas')),
    total: c.filtrar(() => true),
  };
  visao.dentroDoTeto = visao.estado === 'visivel' && visao.areas.bytes <= TETO_VISAO_GERAL;

  // 2. Contorno real da maior área (pela geometria real guardada), isolado.
  const chave = sqlAdmin(`select fonte || ':' || codigo from public.areas where carga_id = ${cargaId} order by octet_length(geometria_real::text) desc limit 1;`);
  const bytesNoBanco = Number(sqlAdmin(`select octet_length(geometria_real::text) from public.areas where carga_id = ${cargaId} and fonte || ':' || codigo = '${chave}';`));
  await page.locator(`#mapa path[data-chave="${chave}"]`).first().dispatchEvent('click');
  await page.locator('#botao-contorno-real').waitFor();
  c.zerar();
  t0 = performance.now();
  await page.locator('#botao-contorno-real').click();
  await page.waitForFunction(() => ['exibido', 'falha'].includes(document.getElementById('areas-contorno-estado')?.dataset.contorno ?? ''), null, { timeout: 180_000, polling: 50 });
  const maiorContorno = {
    ms: Math.round(performance.now() - t0),
    estado: await page.locator('#areas-contorno-estado').getAttribute('data-contorno'),
    bytesTextoNoBanco: bytesNoBanco,
    contorno: c.filtrar((u) => u.includes('geometria_real')),
  };
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await contexto.close();

  // Corpo bruto da visão geral pela API (mesma consulta da camada) e gzip estimado, para contexto.
  const select = 'carga_id,fonte,codigo,nome,classe,categoria,fase,modalidade,esfera,qualidade,geometria_geral';
  const r = await fetch(`${L.api}/rest/v1/areas?select=${select}&carga_id=eq.${cargaId}&order=carga_id,fonte,codigo`, { headers: { apikey: L.anon, Authorization: `Bearer ${await tokenRp()}`, Prefer: 'count=exact', Range: '0-999' } });
  const corpo = Buffer.from(await r.arrayBuffer());
  visao.corpoBrutoBytes = corpo.length;
  visao.corpoGzipEstimadoBytes = gzipSync(corpo, { level: 6 }).length;
  return { tetoVisaoGeralBytes: TETO_VISAO_GERAL, visaoGeral: visao, maiorContorno };
}

// --- Execução ----------------------------------------------------------------------------------------
sqlAdmin(`alter role rq_executor login password '${verificadorScram(senhaEx)}';`);
const u = await requisitar(L.api, '/auth/v1/admin/users', { metodo: 'POST', chave: L.servico, token: L.servico, corpo: { email: EMAIL, password: senhaRp, email_confirm: true } });
if (u.status !== 200) throw new Error(`usuário fictício: ${u.status}`);
sqlAdmin(`insert into privado.responsaveis_autorizados values ('${u.json.id}');`);
const servidor = spawn(process.execPath, [path.join(RAIZ, 'scripts/interface/servir-e2e.mjs')], { stdio: ['ignore', 'ignore', 'inherit'] });
const relatorio = {
  geradoEm: new Date().toISOString(),
  perfil: { navegador: 'Chrome do sistema (Playwright, channel chrome)', viewport: '390x844 com toque', rede: 'Slow 4G emulada: latência 150 ms, 1,6 Mbit/s descida, 750 kbit/s subida', cpu: `${CPU}x mais lenta (CDP)`, observacao: 'Supabase local sem compressão; gzip é estimativa' },
  qualidades: [],
};
try {
  await esperarServidor();
  const browser = await chromium.launch({ channel: 'chrome' });
  relatorio.perfil.versaoChrome = browser.version();
  let revisao = 20;
  let ultimaCarga = null;
  for (const qualidade of ['minima', 'intermediaria', 'maxima']) {
    const identidade = carregar(qualidade, revisao);
    revisao += 1;
    const id = sqlAdmin(`select id from public.cargas where identidade = '${identidade}';`);
    // Tamanho bruto e gzip estimado da geometria (conjunto) e de um município mediano, para contexto.
    const chamada = await fetch(`${L.api}/rest/v1/municipios?select=codigo,geometria_exibicao&carga_id=eq.${id}`, { headers: { apikey: L.anon, Authorization: `Bearer ${await tokenRp()}` } });
    const corpo = Buffer.from(await chamada.arrayBuffer());
    const medida = await medirQualidade(browser, qualidade, id);
    medida.conjuntoBrutoBytes = corpo.length;
    medida.conjuntoGzipEstimadoBytes = gzipSync(corpo, { level: 6 }).length;
    relatorio.qualidades.push(medida);
    ultimaCarga = id;
  }
  // A camada não depende da qualidade da malha municipal: medida uma vez, na última carga publicada.
  relatorio.areas = await medirAreas(browser, ultimaCarga);
  relatorio.areas.identidade = sqlAdmin(`select identidade from public.cargas where id = ${ultimaCarga};`);
  await browser.close();
} finally {
  servidor.kill();
  sqlAdmin(`alter role rq_executor nologin password null;
begin;
delete from public.publicacao_vigente;
update public.cargas set estado = 'retirada' where estado = 'publicada';
delete from public.deteccoes_areas; delete from public.areas;
delete from public.disponibilidade; delete from public.deteccoes; delete from public.municipios; delete from public.malhas; delete from public.fontes;
delete from public.cargas; delete from privado.manifestos_aprovados;
delete from privado.responsaveis_autorizados where user_id = '${u.json.id}';
commit;`);
  await requisitar(L.api, `/auth/v1/admin/users/${u.json.id}`, { metodo: 'DELETE', chave: L.servico, token: L.servico });
}
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'medicao-interface.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);

async function tokenRp() {
  const t = await requisitar(L.api, '/auth/v1/token?grant_type=password', { metodo: 'POST', chave: L.anon, corpo: { email: EMAIL, password: senhaRp } });
  return t.json.access_token;
}
