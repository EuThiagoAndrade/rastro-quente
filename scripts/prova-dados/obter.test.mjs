import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { escolherProduto, executar, janelas, lerChave, lerDisponibilidade, sanitizar, SAIDA, urlFirms } from './obter.mjs';

const CHAVE = 'CHAVE-FICTICIA-0123abcd';
const sha = (texto) => createHash('sha256').update(texto).digest('hex');
const AGORA = () => new Date('2026-11-03T12:00:00Z');
const limpar = (dir) => rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });

const resposta = (corpo, { status = 200, cabecalhos = {} } = {}) =>
  new Response(corpo, { status, headers: { 'content-length': String(Buffer.byteLength(corpo)), ...cabecalhos } });

async function montar({ firms = null, itens = [], chave = null } = {}) {
  const raiz = await mkdtemp(path.join(tmpdir(), 'rq-obter-'));
  const fontesPath = path.join(raiz, 'fontes.json');
  await writeFile(fontesPath, JSON.stringify({ itens, firms }));
  if (chave) {
    await mkdir(path.join(raiz, 'local', 'prova-dados'), { recursive: true });
    await writeFile(path.join(raiz, 'local', 'prova-dados', '.env'), `MAP_KEY=${chave}\n`);
  }
  return { raiz, fontesPath };
}

const itemInpe = () => ({
  id: 'inpe-x', tipo: 'inpe-focos', fonte: 'INPE', url: 'https://exemplo.invalido/focos.csv', destino: 'inpe/focos.csv',
  obtidoEm: null, tamanho: null, sha256: null, lastModified: null, etag: null,
});

const firmsCfg = () => ({
  retangulo: '-61.6334,-10.0495,-58.9384,-8.7966',
  sensores: ['VIIRS_SNPP'],
  intervalo: { inicio: '2026-08-01', fim: '2026-08-12' },
  dayRange: 5,
  produtos: null,
  disponibilidade: null,
});

test('janelas cobrem o intervalo sem lacuna nem sobreposição', () => {
  const j = janelas('2026-08-01', '2026-11-01', 5);
  assert.equal(j.length, 19);
  assert.deepEqual(j[0], { data: '2026-08-01', dias: 5 });
  assert.deepEqual(j.at(-1), { data: '2026-10-30', dias: 2 });
  assert.equal(j.reduce((s, x) => s + x.dias, 0), 92);
  for (let i = 1; i < j.length; i += 1) {
    const fimAnterior = Date.parse(`${j[i - 1].data}T00:00:00Z`) + j[i - 1].dias * 86_400_000;
    assert.equal(Date.parse(`${j[i].data}T00:00:00Z`), fimAnterior);
  }
  assert.deepEqual(janelas('2026-08-01', '2026-08-04', 1).map((x) => x.data), ['2026-08-01', '2026-08-02', '2026-08-03']);
  assert.throws(() => janelas('2026-08-01', '2026-08-10', 6), /DAY_RANGE/);
  assert.throws(() => janelas('2026-08-01', '2026-08-10', 0), /DAY_RANGE/);
});

test('produto FIRMS: SP só quando cobre todo o intervalo; nunca mistura', () => {
  const disp = lerDisponibilidade(
    'data_id,min_date,max_date\nVIIRS_SNPP_SP,2012-01-19,2026-10-31\nVIIRS_SNPP_NRT,2026-08-01,2026-11-03\nVIIRS_NOAA20_SP,2018-01-01,2026-09-15\nVIIRS_NOAA20_NRT,2026-08-01,2026-11-03\n',
  );
  assert.equal(escolherProduto('VIIRS_SNPP', disp, '2026-08-01', '2026-11-01'), 'VIIRS_SNPP_SP');
  assert.equal(escolherProduto('VIIRS_NOAA20', disp, '2026-08-01', '2026-11-01'), 'VIIRS_NOAA20_NRT');
  assert.equal(escolherProduto('VIIRS_NOAA21', disp, '2026-08-01', '2026-11-01'), 'VIIRS_NOAA21_NRT');
  assert.throws(() => lerDisponibilidade('a,b\n1,2\n'), /data_availability/);
});

test('sanitizar troca a chave e a forma codificada', () => {
  assert.equal(sanitizar(`a ${CHAVE} b ${encodeURIComponent(CHAVE)}`, CHAVE), 'a {MAP_KEY} b {MAP_KEY}');
  assert.equal(sanitizar('sem chave', null), 'sem chave');
  assert.equal(urlFirms('{MAP_KEY}', 'VIIRS_SNPP_NRT', '1,2,3,4', 5, '2026-08-01'),
    'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/1,2,3,4/5/2026-08-01');
});

test('lerChave: ausente, vazia e com aspas', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'rq-env-'));
  assert.equal(await lerChave(path.join(dir, '.env')), null);
  await writeFile(path.join(dir, '.env'), 'OUTRA=1\nMAP_KEY="abc123"\n');
  assert.equal(await lerChave(path.join(dir, '.env')), 'abc123');
  await writeFile(path.join(dir, '.env'), 'MAP_KEY=\n');
  assert.equal(await lerChave(path.join(dir, '.env')), null);
  await limpar(dir);
});

test('obter é idempotente: com o mesmo SHA-256 não baixa de novo', async () => {
  const { raiz, fontesPath } = await montar({ itens: [itemInpe()] });
  let chamadas = 0;
  const fetchFn = async () => {
    chamadas += 1;
    return resposta('id,lat\n1,2\n', { cabecalhos: { 'last-modified': 'Sun, 01 Nov 2026 23:56:43 GMT' } });
  };
  const r1 = await executar({ raiz, fontesPath, fetchFn, agora: AGORA });
  assert.equal(r1.codigo, SAIDA.OK);
  assert.equal(r1.resumo.baixado, 1);
  const registro = JSON.parse(await readFile(fontesPath, 'utf8')).itens[0];
  assert.equal(registro.sha256, sha('id,lat\n1,2\n'));
  assert.equal(registro.tamanho, 11);
  assert.equal(registro.obtidoEm, '2026-11-03T12:00:00.000Z');
  assert.equal(registro.lastModified, 'Sun, 01 Nov 2026 23:56:43 GMT');

  const r2 = await executar({ raiz, fontesPath, fetchFn, agora: AGORA });
  assert.equal(r2.resumo.inalterado, 1);
  assert.equal(chamadas, 1);
  await limpar(raiz);
});

test('obter para e informa quando o SHA-256 do arquivo local diverge', async () => {
  const { raiz, fontesPath } = await montar({ itens: [itemInpe()] });
  const fetchFn = async () => resposta('id,lat\n1,2\n');
  await executar({ raiz, fontesPath, fetchFn, agora: AGORA });
  await writeFile(path.join(raiz, 'local', 'prova-dados', 'brutos', 'inpe', 'focos.csv'), 'adulterado\n');
  const r = await executar({ raiz, fontesPath, fetchFn, agora: AGORA });
  assert.equal(r.codigo, SAIDA.ERRO);
  assert.match(r.erro, /SHA-256 divergente/);
  await limpar(raiz);
});

test('obter para quando o servidor passa a servir conteúdo diferente do registrado', async () => {
  const item = { ...itemInpe(), tamanho: 11, sha256: sha('id,lat\n1,2\n') };
  const { raiz, fontesPath } = await montar({ itens: [item] });
  const r = await executar({ raiz, fontesPath, fetchFn: async () => resposta('id,lat\n9,9\n'), agora: AGORA });
  assert.equal(r.codigo, SAIDA.ERRO);
  assert.match(r.erro, /SHA-256 divergente ao baixar/);
  await limpar(raiz);
});

test('download truncado é recusado', async () => {
  const { raiz, fontesPath } = await montar({ itens: [itemInpe()] });
  const truncado = async () =>
    new Response('curto', { status: 200, headers: { 'content-length': '999' } });
  const r = await executar({ raiz, fontesPath, fetchFn: truncado, agora: AGORA });
  assert.equal(r.codigo, SAIDA.ERRO);
  assert.match(r.erro, /incompleto|Falha/);
  await limpar(raiz);
});

test('FIRMS sem MAP_KEY fica pendente e não faz requisição', async () => {
  const { raiz, fontesPath } = await montar({ itens: [], firms: firmsCfg() });
  let chamadas = 0;
  const r = await executar({ raiz, fontesPath, fetchFn: async () => { chamadas += 1; return resposta(''); }, agora: AGORA });
  assert.equal(r.codigo, SAIDA.PENDENTE);
  assert.equal(chamadas, 0);
  await limpar(raiz);
});

function fetchFirms({ falhar = false, corpoErro = null } = {}) {
  const urls = [];
  const fn = async (url) => {
    urls.push(url);
    if (falhar) throw new Error(`conexão recusada em ${url}`);
    if (url.includes('/data_availability/')) {
      return resposta('data_id,min_date,max_date\nVIIRS_SNPP_NRT,2026-08-01,2026-11-03\n');
    }
    if (corpoErro) return resposta(corpoErro);
    return resposta('latitude,longitude,acq_date,acq_time\n-9.1,-60.2,2026-08-01,0112\n');
  };
  fn.urls = urls;
  return fn;
}

test('FIRMS com chave: janelas consecutivas, URL real só na requisição e registro sanitizado', async () => {
  const { raiz, fontesPath } = await montar({ itens: [], firms: firmsCfg(), chave: CHAVE });
  const fetchFn = fetchFirms();
  const r = await executar({ raiz, fontesPath, fetchFn, agora: AGORA });
  assert.equal(r.codigo, SAIDA.OK);
  const area = fetchFn.urls.filter((u) => u.includes('/api/area/'));
  assert.equal(area.length, 3);
  assert.ok(area.every((u) => u.includes(CHAVE)));
  assert.ok(area[0].endsWith('/VIIRS_SNPP_NRT/-61.6334,-10.0495,-58.9384,-8.7966/5/2026-08-01'));
  assert.ok(area[2].endsWith('/1/2026-08-11'));

  const fontes = JSON.parse(await readFile(fontesPath, 'utf8'));
  assert.equal(fontes.firms.produtos.VIIRS_SNPP, 'VIIRS_SNPP_NRT');
  assert.equal(fontes.itens.length, 3);
  assert.ok(fontes.itens.every((i) => i.url.includes('{MAP_KEY}') && i.sha256));

  // idempotência com chave: nada é baixado de novo
  const antes = fetchFn.urls.length;
  const r2 = await executar({ raiz, fontesPath, fetchFn, agora: AGORA });
  assert.equal(r2.resumo.inalterado, 3);
  assert.equal(fetchFn.urls.length, antes);
  await limpar(raiz);
});

test('sanitização: a chave não aparece em fontes.json, proveniência, log nem erro', async () => {
  const cenarios = [
    { nome: 'sucesso', opcoes: {} },
    { nome: 'falha de rede com a URL na mensagem', opcoes: { falhar: true } },
    { nome: 'API que devolve a chave no corpo do erro', opcoes: { corpoErro: `Invalid MAP_KEY ${CHAVE}` } },
  ];
  for (const { nome, opcoes } of cenarios) {
    const { raiz, fontesPath } = await montar({ itens: [], firms: firmsCfg(), chave: CHAVE });
    const saida = [];
    const original = console.log;
    console.log = (...args) => saida.push(args.join(' '));
    let r;
    try {
      r = await executar({ raiz, fontesPath, fetchFn: fetchFirms(opcoes), agora: AGORA });
    } finally {
      console.log = original;
    }
    const arquivos = [fontesPath, path.join(raiz, 'local', 'prova-dados', 'proveniencia.json')];
    const textos = [...saida, String(r.erro), ...(await Promise.all(arquivos.map((a) => readFile(a, 'utf8').catch(() => ''))))];
    for (const t of textos) {
      assert.ok(!t.includes(CHAVE) && !t.includes(encodeURIComponent(CHAVE)), `chave vazou no cenário: ${nome}`);
    }
    await limpar(raiz);
  }
});

test('resposta de erro do FIRMS não é gravada como bruto', async () => {
  const { raiz, fontesPath } = await montar({ itens: [], firms: firmsCfg(), chave: CHAVE });
  const r = await executar({ raiz, fontesPath, fetchFn: fetchFirms({ corpoErro: 'Invalid MAP_KEY.' }), agora: AGORA });
  assert.equal(r.codigo, SAIDA.ERRO);
  assert.match(r.erro, /Resposta inesperada do FIRMS/);
  const fontes = JSON.parse(await readFile(fontesPath, 'utf8'));
  assert.ok(fontes.itens.every((i) => i.sha256 === null));
  await limpar(raiz);
});
