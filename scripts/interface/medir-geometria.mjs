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
    await page.locator('#f-municipio').selectOption(codigo);
    c.zerar();
    t0 = performance.now();
    await page.getByRole('button', { name: 'Consultar' }).click();
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
  }
  await browser.close();
} finally {
  servidor.kill();
  sqlAdmin(`alter role rq_executor nologin password null;
begin;
delete from public.publicacao_vigente;
update public.cargas set estado = 'retirada' where estado = 'publicada';
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
