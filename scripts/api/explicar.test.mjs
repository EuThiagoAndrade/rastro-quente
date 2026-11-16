// Ciclo 008, item 2 (issue #78) — handler real de /api/explicar por HTTP local, com Supabase local (Auth e RLS reais),
// fixture fictícia do E2E (Município Alfa 60, Beta 30, Gama 10 detecções em outubro de 2026) e provedor simulado que
// conta as chamadas. Matriz T4: acessos negados terminam sem nenhuma chamada ao provedor. Roda em `npm run test:api`
// (que faz `supabase db reset`). Valores esperados contados à mão em tests/e2e/fixture.mjs: de 01 a 10/10, 55
// detecções; de 11 a 20/10, 43.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { adulterarJwt, assinarJwt, lerJwt, sqlAdmin, statusLocal } from '../banco/local.mjs';
import { CONTAS, cadastrarRp, criarConta, removerConta, revogarRp, tokenDe } from '../../tests/e2e/contas.mjs';
import { IDENTIDADE, SQL_LIMPEZA, sqlFixture, sqlVersaoNova } from '../../tests/e2e/fixture.mjs';
import { tratarExplicar } from '../../servidor/explicar.ts';
import { executarFerramenta, LIMITE_DETALHE } from '../../servidor/ferramentas.ts';
import { ErroHttp } from '../../servidor/resposta.ts';
import { criarCliente, POST, GET } from '../../api/explicar.ts';
import { corpoGeracao, LIMITE_ENVIO_BYTES } from '../../servidor/gemini.ts';
import { lerConfigServidor } from '../../servidor/config.ts';

const L = statusLocal();
let servidor;
let base;
let tokens = {};
let cargaId;
const chamadas = { provedor: 0, clientes: 0 };
let deps;

const configLigada = () => ({ habilitada: true, supabaseUrl: L.api, chavePublica: L.anon, gemini: { chave: 'chave-ficticia-de-teste', modelo: 'gemini-3.8-flash' }, origens: [] });

/** Provedor simulado: conta chamadas e devolve um texto fixo (nenhuma rede). */
const provedorSimulado = (falhar = false) => () => ({
  async gerar(entrada) {
    chamadas.provedor += 1;
    if (falhar) throw new ErroHttp('provedor_indisponivel');
    assert.ok(typeof entrada.pergunta === 'string');
    return { texto: 'Texto simulado.', uso: { entrada: 10, saida: 3 } };
  },
});

function depsPadrao(extra = {}) {
  return {
    config: configLigada(),
    criarCliente: (c, t, s) => { chamadas.clientes += 1; return criarCliente(c, t, s); },
    provedor: provedorSimulado(),
    ...extra,
  };
}

/** Adaptador node:http → Request/Response do handler (o mesmo contrato de Request/Response da função). */
function iniciarServidor() {
  return new Promise((ok) => {
    servidor = http.createServer(async (req, res) => {
      const partes = [];
      for await (const p of req) partes.push(p);
      const corpo = Buffer.concat(partes);
      const controle = new AbortController();
      res.on('close', () => { if (!res.writableEnded) controle.abort(); });
      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method, headers: req.headers, signal: controle.signal,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : corpo,
      });
      const r = await tratarExplicar(request, deps);
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    servidor.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${servidor.address().port}`; ok(); });
  });
}

const PEDIDO = () => ({
  pergunta: 'O que mudou entre estes períodos?',
  carga: { id: cargaId, identidade: IDENTIDADE },
  recorte: { tipo: 'periodos', a: { inicio: '2026-10-01', fim: '2026-10-10' }, b: { inicio: '2026-10-11', fim: '2026-10-20' }, municipio: null, lente: { tipo: 'concentracao' } },
});

async function chamar({ token, corpo = PEDIDO(), metodo = 'POST', cabecalhos = {}, bruto } = {}) {
  const h = { 'content-type': 'application/json', ...cabecalhos };
  if (token) h.authorization = `Bearer ${token}`;
  const r = await fetch(`${base}/api/explicar`, { method: metodo, headers: h, body: metodo === 'GET' ? undefined : (bruto ?? JSON.stringify(corpo)) });
  const json = await r.json().catch(() => null);
  return { status: r.status, json, cabecalhos: r.headers };
}

function zerar() { chamadas.provedor = 0; chamadas.clientes = 0; }

before(async () => {
  if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npm run test:api` (faz `supabase db reset`).');
  sqlAdmin(sqlFixture());
  cargaId = Number(sqlAdmin(`select id from public.cargas where identidade = '${IDENTIDADE}';`));
  await criarConta(L, 'rp', {});
  await criarConta(L, 'oa', { papel: 'RP', responsavel: true });
  cadastrarRp();
  tokens = { rp: await tokenDe('rp'), oa: await tokenDe('oa') };
  deps = depsPadrao();
  await iniciarServidor();
});

after(async () => {
  servidor?.close();
  for (const nome of Object.keys(CONTAS)) await removerConta(L, nome);
  sqlAdmin(SQL_LIMPEZA);
});

test('desligada: 503 em qualquer método e identidade, sem ler corpo, sessão, Supabase ou provedor', async () => {
  deps = depsPadrao({ config: { habilitada: false } });
  zerar();
  for (const metodo of ['GET', 'POST', 'PUT', 'DELETE']) {
    const r = await chamar({ metodo, token: tokens.rp });
    assert.equal(r.status, 503, metodo);
    assert.equal(r.json.erro, 'ia_desabilitada');
    assert.equal(r.cabecalhos.get('cache-control'), 'no-store');
  }
  // Corpo que falharia se fosse lido.
  const corpoArmado = new ReadableStream({ pull() { throw new Error('corpo lido'); } });
  const r = await tratarExplicar(new Request('http://x/api/explicar', { method: 'POST', body: corpoArmado, duplex: 'half' }), deps);
  assert.equal(r.status, 503);
  assert.deepEqual(chamadas, { provedor: 0, clientes: 0 });
  // A entrada real da função, sem variáveis de ambiente, também fica desligada.
  assert.deepEqual(lerConfigServidor({}), { habilitada: false });
  assert.deepEqual(lerConfigServidor({ RQ_IA_HABILITADA: 'true', RQ_SUPABASE_URL: L.api, RQ_SUPABASE_CHAVE_PUBLICAVEL: 'x', RQ_GEMINI_CHAVE: 'x', RQ_GEMINI_MODELO: 'gemini-latest' }), { habilitada: false });
  for (const f of [POST, GET]) assert.equal((await f(new Request('http://x/api/explicar', { method: 'POST', body: '{}' }))).status, 503);
  deps = depsPadrao();
});

test('sem JWT, JWT adulterado, expirado ou de papel administrativo: 401, sem dados e sem provedor', async () => {
  zerar();
  const agora = Math.floor(Date.now() / 1000);
  const expirado = assinarJwt({ ...lerJwt(tokens.rp), iat: agora - 7200, exp: agora - 3600 }, L.segredoJwt);
  const adulterado = adulterarJwt(tokens.oa, (p) => ({ ...p, sub: lerJwt(tokens.rp).sub }));
  for (const [nome, token] of [['ausente', undefined], ['adulterado', adulterado], ['expirado', expirado], ['service_role', L.servico], ['anon', L.anon]]) {
    const r = await chamar({ token });
    assert.equal(r.status, 401, nome);
    assert.equal(r.json.erro, 'nao_autenticado', nome);
    assert.ok(!('evidencias' in r.json), nome);
  }
  // JWT na URL não é aceito.
  const r = await fetch(`${base}/api/explicar?access_token=${tokens.rp}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(PEDIDO()) });
  assert.equal(r.status, 401);
  assert.equal(chamadas.provedor, 0);
});

test('autenticado fora da lista de responsáveis: 403 pela RLS, sem dados e sem provedor', async () => {
  zerar();
  const r = await chamar({ token: tokens.oa });
  assert.equal(r.status, 403);
  assert.equal(r.json.erro, 'acesso_negado');
  assert.ok(!('evidencias' in r.json));
  assert.equal(chamadas.provedor, 0);
});

test('responsável com pedido válido: evidências relidas no servidor e uma chamada ao provedor', async () => {
  zerar();
  const r = await chamar({ token: tokens.rp });
  assert.equal(r.status, 200);
  assert.equal(r.cabecalhos.get('cache-control'), 'no-store');
  assert.equal(r.cabecalhos.get('access-control-allow-origin'), null, 'sem CORS amplo');
  const e = r.json.evidencias;
  assert.equal(e.ferramenta, 'comparar_periodos');
  assert.equal(e.versao, 'comparacao-008-v1');
  assert.equal(e.a.total, 55);
  assert.equal(e.b.total, 43);
  assert.equal(e.diferenca_total, -12);
  assert.deepEqual(e.contagem, { entrou: 0, saiu: 0, permaneceu: 3 });
  assert.equal(r.json.resposta.gerado_por_ia, true);
  assert.match(r.json.resposta.aviso, /Gerado por IA/);
  assert.equal(chamadas.provedor, 1);
});

test('formato e limites: método, origem, corpo excessivo, JSON, campo extra e pergunta longa são recusados antes da sessão', async () => {
  zerar();
  assert.equal((await chamar({ metodo: 'GET', token: tokens.rp })).status, 405);
  assert.equal((await chamar({ token: tokens.rp, cabecalhos: { origin: 'https://outro.exemplo.test' } })).status, 403);
  assert.equal((await chamar({ token: tokens.rp, bruto: 'x'.repeat(16 * 1024 + 1) })).status, 413);
  assert.equal((await chamar({ token: tokens.rp, bruto: '{' })).json.erro, 'entrada_invalida');
  // Números enviados pelo cliente não entram: o esquema é fechado.
  assert.equal((await chamar({ token: tokens.rp, corpo: { ...PEDIDO(), total: 999 } })).status, 400);
  assert.equal((await chamar({ token: tokens.rp, corpo: { ...PEDIDO(), pergunta: 'a'.repeat(2001) } })).status, 400);
  const semCampo = PEDIDO();
  semCampo.recorte.lente = { tipo: 'combinacao', lentes: ['concentracao'], operador: 'e' };
  assert.equal((await chamar({ token: tokens.rp, corpo: semCampo })).status, 400);
  // Período fora da versão: recusado sob a sessão, sem provedor.
  const fora = PEDIDO();
  fora.recorte.b = { inicio: '2026-11-01', fim: '2026-11-10' };
  assert.equal((await chamar({ token: tokens.rp, corpo: fora })).json.erro, 'entrada_invalida');
  // Mensagens não ecoam o texto recebido.
  const eco = await chamar({ token: tokens.rp, corpo: { ...PEDIDO(), pergunta: 'a'.repeat(2001), extra: '<script>' } });
  assert.ok(!JSON.stringify(eco.json).includes('<script>'));
  assert.equal(chamadas.provedor, 0);
});

test('eco da carga adulterado: 409, sem misturar versões e sem provedor', async () => {
  zerar();
  const r = await chamar({ token: tokens.rp, corpo: { ...PEDIDO(), carga: { id: cargaId, identidade: 'f'.repeat(64) } } });
  assert.equal(r.status, 409);
  assert.equal(r.json.erro, 'versao_substituida');
  assert.equal(chamadas.provedor, 0);
});

test('ferramentas: catálogo fechado, argumentos presos ao pedido e detalhe paginado em até 100 com o total completo', async () => {
  let ctx;
  deps = depsPadrao({ executar: async (c, nome) => { ctx = c; return executarFerramenta(c, nome); } });
  assert.equal((await chamar({ token: tokens.rp })).status, 200);
  const d = await executarFerramenta(ctx, 'ler_detalhes', { lado: 'B', pagina: 0 });
  assert.equal(d.total, 43);
  assert.equal(d.registros.length, 43);
  assert.equal(d.completo, true);
  assert.ok(d.registros.every((x) => x.data_hora_gmt >= '2026-10-11' && x.data_hora_gmt < '2026-10-21'));
  assert.equal(LIMITE_DETALHE, 100);
  await assert.rejects(executarFerramenta(ctx, 'executar_sql', {}), (e) => e instanceof ErroHttp && e.detalhe === 'ferramenta fora do catálogo');
  await assert.rejects(executarFerramenta(ctx, 'ler_detalhes', { carga: 1 }), (e) => e instanceof ErroHttp && e.detalhe === 'argumento não admitido');
  await assert.rejects(executarFerramenta(ctx, 'ler_detalhes', { lado: 'C' }), ErroHttp);
  await assert.rejects(executarFerramenta(ctx, 'explicar_selecao', {}), (e) => e.detalhe === 'ferramenta fora do pedido');
  const disp = await executarFerramenta({ ...ctx, pedido: { ...ctx.pedido, recorte: { tipo: 'disponibilidade', janela: { inicio: '2026-10-01', fim: '2026-10-10' }, municipios: [9900001] } } }, 'consultar_disponibilidade');
  assert.equal(disp.municipios[0].texto, '8 de 10 dias sem evidência de lacuna, 2 com lacuna conhecida (cobertura não comprovada)');
  assert.match(disp.alcance, /não é disponibilidade estadual/);
  deps = depsPadrao();
});

test('falha do provedor: 502 com as evidências conferidas, sem síntese', async () => {
  zerar();
  deps = depsPadrao({ provedor: provedorSimulado(true) });
  const r = await chamar({ token: tokens.rp });
  assert.equal(r.status, 502);
  assert.equal(r.json.erro, 'provedor_indisponivel');
  assert.equal(r.json.evidencias.a.total, 55);
  assert.ok(!('resposta' in r.json));
  deps = depsPadrao();
});

test('limite de envio: corpo acima de 64 KiB é recusado antes de chamar o provedor', () => {
  assert.throws(() => corpoGeracao('gemini-3.8-flash', { pergunta: 'p', evidencias: 'x'.repeat(LIMITE_ENVIO_BYTES) }), ErroHttp);
  assert.ok(corpoGeracao('gemini-3.8-flash', { pergunta: 'p', evidencias: { a: 1 } }).includes('"store":false'));
});

test('responsável revogado durante a execução: 403, resposta descartada e nenhuma chamada ao provedor', async () => {
  zerar();
  deps = depsPadrao({ executar: async (c, nome) => { const r = await executarFerramenta(c, nome); revogarRp(); return r; } });
  const r = await chamar({ token: tokens.rp });
  assert.equal(r.status, 403);
  assert.ok(!('evidencias' in r.json));
  assert.equal(chamadas.provedor, 0);
  cadastrarRp();
  deps = depsPadrao();
});

// Último: troca a versão vigente (a limpeza global remove tudo).
test('carga substituída durante a execução: 409, sem sintetizar versões misturadas', async () => {
  zerar();
  deps = depsPadrao({ executar: async (c, nome) => { const r = await executarFerramenta(c, nome); sqlAdmin(sqlVersaoNova()); return r; } });
  const r = await chamar({ token: tokens.rp });
  assert.equal(r.status, 409);
  assert.equal(r.json.erro, 'versao_substituida');
  assert.ok(!('evidencias' in r.json));
  assert.equal(chamadas.provedor, 0);
});
