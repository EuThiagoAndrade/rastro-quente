import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { agregar, CONFIG, crescimento, executar, montarSaida, serializar } from './contar.mjs';
import { lerFocos } from './focos.mjs';
import { criarTerritorio } from './geo.mjs';
import { sha256Arquivo } from './obter.mjs';

const FIXTURES = new URL('../../tests/fixtures/prova-dados/', import.meta.url);
const CSV = new URL('focos_ficticio.csv', FIXTURES);
const GEOJSON = new URL('colniza_ficticio.geojson', FIXTURES);
const CFG = { ...CONFIG, municipioAlvo: '9999999', estadoAlvo: '99' };
const limpar = (dir) => rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
const meses = (a, s, o) => ({ '2026-08': a, '2026-09': s, '2026-10': o });

const territorio = async () => criarTerritorio(JSON.parse(await readFile(GEOJSON, 'utf8')));
const agregarFixture = async () => agregar(lerFocos(CSV), await territorio(), CFG);

// Todos os valores esperados abaixo foram calculados à mão a partir de tests/fixtures/prova-dados/focos_ficticio.csv.
test('séries P, E e Mu por mês em GMT (D1 d, D2 c, D3 c, D4 a)', async () => {
  const s = montarSaida(await agregarFixture(), [], CFG);
  assert.deepEqual(s.leitura, { registrosLidos: 32, foraDasJanelasGmtECuiaba: 2, idsDuplicadosEmColniza: 1 });
  assert.deepEqual(s.series.P, { ...meses(4, 10, 3), total: 17 });
  assert.deepEqual(s.series.E, s.series.P); // D2 c: P = E
  assert.deepEqual(s.series.Mu, { ...meses(4, 10, 3), total: 17 });
});

test('divergências de D2: diferença simétrica entre município e polígono', async () => {
  const d = montarSaida(await agregarFixture(), [], CFG).divergencias;
  assert.equal(d.apenasNoCampoMunicipioId, 2); // d3 (fora) e d4 (buraco)
  assert.equal(d.apenasNoPoligono, 2); // d2 (outro município) e d6 (vértice, outro município)
  assert.equal(d.pontosNaBorda, 2); // d5 e d6, contados como dentro
  assert.deepEqual(d.lista.map((x) => [x.id, x.apenas, x.posicao]), [
    ['d2', 'poligono', 'dentro'],
    ['d3', 'campo_municipio_id', 'fora'],
    ['d4', 'campo_municipio_id', 'fora'],
    ['d6', 'poligono', 'borda'],
  ]);
});

test('exemplo de D2 do plano: 100 por município, 97 dentro, 3 fora, 1 dentro com outro município → 98 e 4 divergências', async () => {
  const t = criarTerritorio({ type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] });
  const registro = (i, lon, lat, municipioId) => ({ id: `x${i}`, lat, lon, ms: Date.UTC(2026, 8, 10, 12), dia: '2026-09-10', satelite: 'AQUA_M-T', municipioId, estadoId: '99' });
  const registros = [];
  for (let i = 0; i < 97; i += 1) registros.push(registro(i, 5, 5, '9999999')); // dentro e no município
  registros.push(registro(97, 10.004, 5, '9999999'), registro(98, 10.004, 6, '9999999')); // a menos de 500 m da divisa
  registros.push(registro(99, 10.03, 5, '9999999')); // cerca de 3 km, em outro município
  registros.push(registro(100, 5, 5, '8888888')); // dentro do polígono, com outro município
  const r = await agregar((async function* () { yield* registros; })(), t, CFG);
  const s = montarSaida(r, [], CFG);
  assert.equal(s.series.Mu['2026-09'], 100);
  assert.equal(s.series.E['2026-09'], 98);
  assert.equal(s.divergencias.apenasNoCampoMunicipioId, 3);
  assert.equal(s.divergencias.apenasNoPoligono, 1);
  assert.equal(s.divergencias.lista.length, 4);
});

test('sensibilidade de fuso: UTC−4 troca registros de mês e traz os de 2026-11-01 antes das 04:00', async () => {
  const f = montarSaida(await agregarFixture(), [], CFG).sensibilidadeFuso;
  assert.deepEqual(f.cuiaba.P, { ...meses(4, 9, 4), total: 17 });
  assert.deepEqual(f.cuiaba.Mu, { ...meses(4, 9, 4), total: 17 });
  assert.deepEqual(f.diferencaCuiabaMenosGmt.P, meses(0, -1, 1));
});

test('séries auxiliares: VIIRS por satélite (SNPP = NPP-375 + NPP-375D), todos os satélites e MT', async () => {
  const s = montarSaida(await agregarFixture(), [], CFG);
  assert.deepEqual(s.series.V.SNPP, { ...meses(0, 3, 0), total: 3 });
  assert.deepEqual(s.series.V.NOAA20, { ...meses(0, 1, 0), total: 1 });
  assert.deepEqual(s.series.V.NOAA21, { ...meses(0, 0, 0), total: 0 });
  assert.deepEqual(s.series.todosOsSatelites['GOES-19'], { ...meses(0, 0, 3), total: 3 });
  assert.deepEqual(s.series.todosOsSatelitesSoma, { ...meses(4, 14, 6), total: 24 });
  assert.deepEqual(s.crescimento.mtPorSatelite['AQUA_M-T'], { ...meses(4, 12, 3), total: 19 }); // d7 tem outro estado
});

test('detecção por dia (GMT, polígono) alimenta a cobertura do satélite principal', async () => {
  const r = await agregarFixture();
  assert.deepEqual(r.deteccaoPorDia['AQUA_M-T'], {
    '2026-08-01': 3, '2026-08-31': 1, '2026-09-01': 3, '2026-09-10': 6, '2026-09-30': 1, '2026-10-01': 2, '2026-10-31': 1,
  });
  const avisos = [{ data: '2026-09-10', satelites: ['AQUA_M-T'], classe: 'lacuna_conhecida', evidencia: 'fictício' }];
  const c = montarSaida(r, avisos, CFG).cobertura;
  assert.deepEqual(c.C, { d: 1, p: 1 });
  assert.equal(c.porSatelite['AQUA_M-T'].cruzada['com_registro|lacuna_conhecida'], 1); // dia com registro e lacuna
  assert.equal(c.porSatelite['AQUA_M-T'].coberturaNaoComprovada, 92 - 7);
});

test('crescimento: diferenças e razões observadas, sem limiar', () => {
  assert.deepEqual(crescimento(meses(100, 150, 300)), {
    valores: meses(100, 150, 300),
    diferencas: { ago_para_set: 50, set_para_out: 150, ago_para_out: 200 },
    razoes: { ago_para_set: 1.5, set_para_out: 2, ago_para_out: 3 },
    aumentouEmCadaMes: true,
  });
  const c = crescimento(meses(0, 5, 3));
  assert.equal(c.razoes.ago_para_set, null);
  assert.equal(c.aumentouEmCadaMes, false);
});

test('execução completa: duas execuções produzem saída idêntica byte a byte; SHA-256 divergente para', async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), 'rq-contar-'));
  const brutos = path.join(raiz, 'local', 'prova-dados', 'brutos');
  await mkdir(path.join(brutos, 'inpe'), { recursive: true });
  await mkdir(path.join(brutos, 'ibge'), { recursive: true });
  await copyFile(CSV, path.join(brutos, 'inpe', 'focos.csv'));
  await copyFile(GEOJSON, path.join(brutos, 'ibge', 'malha.geojson'));
  const item = async (id, tipo, destino) => ({ id, tipo, destino, tamanho: 1, sha256: await sha256Arquivo(path.join(brutos, destino)) });
  const fontesPath = path.join(raiz, 'fontes.json');
  const fontes = {
    itens: [await item('inpe-x', 'inpe-focos', 'inpe/focos.csv'), await item('ibge-x', 'ibge-malha', 'ibge/malha.geojson')],
    levantamento: { inpe: { avisosDoPeriodo: { avisos: [{ data: '2026-09-10', satelites: ['AQUA_M-T'], incidencia: { classe: 'incidencia_indeterminada', evidencia: 'fictício' } }] } } },
  };
  await writeFile(fontesPath, JSON.stringify(fontes));
  // A configuração real usa o município de Colniza; na fixture ele não existe, então Mu = 0 e todas as divergências são "só polígono".
  const a = await executar({ raiz, fontesPath, saida: path.join(raiz, 'a.json') });
  const b = await executar({ raiz, fontesPath, saida: path.join(raiz, 'b.json') });
  assert.equal(a.sha256, b.sha256);
  assert.equal(await readFile(a.destino, 'utf8'), await readFile(b.destino, 'utf8'));
  assert.equal(serializar(a.saida), await readFile(a.destino, 'utf8'));
  assert.equal(a.saida.insumos.length, 2);
  assert.equal(a.saida.series.Mu.total, 0);
  assert.equal(a.saida.cobertura.C.d, 1);

  await writeFile(path.join(brutos, 'inpe', 'focos.csv'), 'adulterado\n');
  await assert.rejects(executar({ raiz, fontesPath, saida: path.join(raiz, 'c.json') }), /diverge de fontes\.json/);
  await limpar(raiz);
});

test('serializar ordena as chaves e é estável', () => {
  assert.equal(serializar({ b: 1, a: { d: 1, c: [{ z: 1, y: 2 }] } }), '{\n  "a": {\n    "c": [\n      {\n        "y": 2,\n        "z": 1\n      }\n    ],\n    "d": 1\n  },\n  "b": 1\n}\n');
});
