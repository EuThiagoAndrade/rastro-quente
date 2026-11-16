// Ciclo 008, item 2 (issue #78) — prova local do pacote da função (plano 008, T4). Lê `.vercel/output` gerado por
// `npx --no-install vercel build --standalone` (CLI fixada), acha a função de /api/explicar, confere runtime Node 24 e
// o handler declarado em `.vc-config.json`, copia só o pacote para uma pasta temporária fora do checkout (sem acesso a
// `src/` nem ao `node_modules` do repositório) e o executa num subprocesso Node, atrás de um servidor HTTP local.
// 1) Desligada: 503 em GET e POST, sem nenhuma saída de rede. 2) Ligada só neste teste: Supabase local com a fixture
// fictícia do E2E, JWT real, provedor simulado (o fetch para o Gemini é interceptado; o handler não é trocado); as
// evidências do pacote têm de ser iguais às do código-fonte. Imprime caminho do handler, versão da CLI, hash do
// pacote e resultados, sem variáveis reais. Pré-requisito: banco local vazio (`npx supabase db reset`).
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sqlAdmin, statusLocal } from '../banco/local.mjs';
import { CONTAS, cadastrarRp, criarConta, removerConta, tokenDe } from '../../tests/e2e/contas.mjs';
import { IDENTIDADE, SQL_LIMPEZA, sqlFixture } from '../../tests/e2e/fixture.mjs';
import { tratarExplicar } from '../../servidor/explicar.ts';
import { criarCliente } from '../../api/explicar.ts';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const FUNCOES = path.join(RAIZ, '.vercel/output/functions');

function arquivos(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? arquivos(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  }).sort();
}

/** A função de /api/explicar pela estrutura emitida pela CLI; formato não reconhecido reprova. */
function localizarFuncao() {
  const dir = path.join(FUNCOES, 'api/explicar.func');
  if (!existsSync(path.join(dir, '.vc-config.json'))) throw new Error('função api/explicar não encontrada em .vercel/output (rode o build standalone)');
  const config = JSON.parse(readFileSync(path.join(dir, '.vc-config.json'), 'utf8'));
  if (config.launcherType !== 'Nodejs') throw new Error(`launcher não reconhecido: ${config.launcherType}`);
  if (config.runtime !== 'nodejs24.x') throw new Error(`runtime diferente de Node 24: ${config.runtime}`);
  if (!config.handler || !existsSync(path.join(dir, config.handler))) throw new Error('handler declarado ausente no pacote');
  return { dir, config };
}

function hashPacote(dir) {
  const h = createHash('sha256');
  for (const f of arquivos(dir)) { h.update(f); h.update('\0'); h.update(readFileSync(path.join(dir, f))); }
  return h.digest('hex');
}

// Executor do pacote: intercepta o fetch (registra as saídas; responde pelo Gemini) antes de importar o handler.
const EXECUTOR = `
import http from 'node:http';
import { pathToFileURL } from 'node:url';
const saidas = [];
const original = globalThis.fetch;
globalThis.fetch = async (entrada, init) => {
  const url = String(entrada instanceof Request ? entrada.url : entrada);
  const host = new URL(url).host;
  saidas.push({ host, corpo: host === 'generativelanguage.googleapis.com' ? String(init?.body ?? '') : undefined });
  if (host === 'generativelanguage.googleapis.com') {
    return new Response(JSON.stringify({ outputs: [{ type: 'text', text: 'Texto simulado do pacote.' }], usage: { total_input_tokens: 1, total_output_tokens: 1 } }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return original(entrada, init);
};
const modulo = await import(pathToFileURL(process.argv[2]).href);
const servidor = http.createServer(async (req, res) => {
  if (req.url === '/__saidas') { res.end(JSON.stringify(saidas)); return; }
  const partes = [];
  for await (const p of req) partes.push(p);
  const request = new Request('http://' + req.headers.host + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(partes) });
  const f = modulo[req.method];
  const r = await f(request);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
});
servidor.listen(0, '127.0.0.1', () => process.stdout.write('PORTA ' + servidor.address().port + '\\n'));
`;

function iniciar(pacote, env) {
  const pasta = mkdtempSync(path.join(os.tmpdir(), 'rq-executor-'));
  const executor = path.join(pasta, 'executor.mjs');
  writeFileSync(executor, EXECUTOR);
  // Ambiente mínimo: nada do ambiente local entra além do PATH do sistema e das variáveis do caso.
  const filho = spawn(process.execPath, [executor, path.join(pacote.dir, pacote.config.handler)], {
    cwd: pacote.dir, env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, ...env }, stdio: ['ignore', 'pipe', 'inherit'],
  });
  return new Promise((ok, erro) => {
    let saida = '';
    filho.stdout.on('data', (d) => {
      saida += d;
      const m = /PORTA (\d+)/.exec(saida);
      if (m) ok({ base: `http://127.0.0.1:${m[1]}`, parar: () => { filho.kill(); rmSync(pasta, { recursive: true, force: true }); } });
    });
    filho.on('exit', (c) => erro(new Error(`executor terminou (${c})`)));
  });
}

const relatorio = { geradoEm: new Date().toISOString(), cli: JSON.parse(readFileSync(path.join(RAIZ, 'node_modules/vercel/package.json'), 'utf8')).version };
const original = localizarFuncao();
relatorio.handler = `api/explicar.func/${original.config.handler}`;
relatorio.runtime = original.config.runtime;
relatorio.arquivos = arquivos(original.dir).length;
relatorio.hashPacote = hashPacote(original.dir);
// Cópia isolada do pacote, fora do checkout.
const isolada = mkdtempSync(path.join(os.tmpdir(), 'rq-pacote-'));
cpSync(original.dir, isolada, { recursive: true });
const pacote = { dir: isolada, config: original.config };
assert.equal(hashPacote(isolada), relatorio.hashPacote);
assert.ok(!arquivos(isolada).some((f) => f.startsWith('local/') || /(^|\/)\.env/.test(f)), 'sem local/ nem .env no pacote');

const L = statusLocal();
let executor;
try {
  // 1) Desligada.
  executor = await iniciar(pacote, {});
  for (const metodo of ['GET', 'POST']) {
    const r = await fetch(`${executor.base}/api/explicar`, { method: metodo, body: metodo === 'POST' ? '{}' : undefined });
    assert.equal(r.status, 503, metodo);
    assert.equal((await r.json()).erro, 'ia_desabilitada');
  }
  const saidasDesligada = await (await fetch(`${executor.base}/__saidas`)).json();
  assert.deepEqual(saidasDesligada, [], 'desligada: nenhuma saída de rede');
  executor.parar();
  relatorio.desligada = { status: 503, saidasDeRede: 0 };

  // 2) Ligada só neste teste, com Supabase local e provedor simulado.
  if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npx supabase db reset`.');
  sqlAdmin(sqlFixture());
  const cargaId = Number(sqlAdmin(`select id from public.cargas where identidade = '${IDENTIDADE}';`));
  await criarConta(L, 'rp', {});
  await criarConta(L, 'oa', { papel: 'RP', responsavel: true });
  cadastrarRp();
  const rp = await tokenDe('rp');
  const oa = await tokenDe('oa');
  executor = await iniciar(pacote, {
    RQ_IA_HABILITADA: 'true', RQ_SUPABASE_URL: L.api, RQ_SUPABASE_CHAVE_PUBLICAVEL: L.anon,
    RQ_GEMINI_CHAVE: 'chave-ficticia-de-teste', RQ_GEMINI_MODELO: 'gemini-3.8-flash',
  });
  const pedido = {
    pergunta: 'O que mudou entre estes períodos?', carga: { id: cargaId, identidade: IDENTIDADE },
    recorte: { tipo: 'periodos', a: { inicio: '2026-10-01', fim: '2026-10-10' }, b: { inicio: '2026-10-11', fim: '2026-10-20' }, municipio: null, lente: { tipo: 'concentracao' } },
  };
  const chamar = (token) => fetch(`${executor.base}/api/explicar`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(pedido) });
  const negado = await chamar(oa);
  assert.equal(negado.status, 403);
  assert.equal((await (await fetch(`${executor.base}/__saidas`)).json()).filter((s) => s.host === 'generativelanguage.googleapis.com').length, 0, 'negado: nenhuma chamada ao provedor');
  const r = await chamar(rp);
  assert.equal(r.status, 200);
  const doPacote = await r.json();
  const saidas = await (await fetch(`${executor.base}/__saidas`)).json();
  const gemini = saidas.filter((s) => s.host === 'generativelanguage.googleapis.com');
  assert.equal(gemini.length, 1, 'uma chamada ao provedor simulado');
  assert.equal(JSON.parse(gemini[0].corpo).store, false);
  assert.ok(!gemini[0].corpo.includes(rp), 'o JWT não vai ao provedor');
  // Mesmo pedido pelo código-fonte, em processo: as evidências têm de ser iguais.
  const fonte = await tratarExplicar(new Request('http://x/api/explicar', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${rp}` }, body: JSON.stringify(pedido),
  }), {
    config: { habilitada: true, supabaseUrl: L.api, chavePublica: L.anon, gemini: { chave: 'x', modelo: 'gemini-3.8-flash' }, origens: [] },
    criarCliente, provedor: () => ({ gerar: async () => ({ texto: 'x', uso: null }) }),
  });
  assert.deepEqual(doPacote.evidencias, (await fonte.json()).evidencias, 'pacote igual ao cálculo do código-fonte');
  assert.equal(doPacote.evidencias.a.total, 55);
  assert.equal(doPacote.evidencias.b.total, 43);
  relatorio.ligada = {
    negado: 403, permitido: 200, chamadasProvedor: gemini.length, storeFalse: true,
    evidencias: { a: doPacote.evidencias.a.total, b: doPacote.evidencias.b.total, contagem: doPacote.evidencias.contagem }, igualAoCodigoFonte: true,
  };
} finally {
  executor?.parar();
  for (const nome of Object.keys(CONTAS)) await removerConta(L, nome).catch(() => {});
  sqlAdmin(SQL_LIMPEZA);
  rmSync(isolada, { recursive: true, force: true });
}
relatorio.resultado = 'conferido';
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);
