import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { agregarK, calcularM, classificar, classificarCaso, conclusao, executar, exigirImplementado, tabelaCasos, validarDecisoes } from './comparar.mjs';
import { sha256Arquivo } from './obter.mjs';

const REAL = JSON.parse(await readFile(new URL('./decisoes.json', import.meta.url), 'utf8'));
const FIXTURES = new URL('../../tests/fixtures/prova-dados/', import.meta.url);
const clonar = (x) => JSON.parse(JSON.stringify(x));
const com = (mudar) => { const d = clonar(REAL); mudar(d.decisoes); return d; };
const limpar = (dir) => rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });

const D5 = (formula, toleranciaPercentual) => ({ formula, toleranciaPercentual });

// Exemplo de D5 do plano: agosto A=950 B=1200; setembro A=1200 B=1150; outubro A=1200 B=950.
test('D5: fórmulas F1 e F2 e as tolerâncias dos exemplos do plano', () => {
  const casos = [[950, 1200], [1200, 1150], [1200, 950]];
  const esperado = (formula, tol) => casos.map(([a, b]) => classificar(a, b, D5(formula, tol)));
  assert.deepEqual(esperado('F1', 25).map((c) => [c.percentual, c.resultado]), [[26.32, 'diverge'], [4.17, 'concorda'], [20.83, 'concorda']]);
  assert.deepEqual(esperado('F2', 25).map((c) => [c.percentual, c.resultado]), [[20.83, 'concorda'], [4.17, 'concorda'], [20.83, 'concorda']]);
  assert.deepEqual(esperado('F1', 10).map((c) => c.resultado), ['diverge', 'concorda', 'diverge']);
  assert.deepEqual(esperado('F2', 10).map((c) => c.resultado), ['diverge', 'concorda', 'diverge']);
});

test('D5: denominador zero e limite exato da tolerância', () => {
  assert.deepEqual(classificar(0, 0, D5('F2', 25)), { formula: 'F2', A: 0, B: 0, percentual: null, resultado: 'concorda' });
  assert.deepEqual(classificar(0, 5, D5('F2', 25)), { formula: 'F2', A: 0, B: 5, percentual: null, resultado: 'diverge' });
  assert.deepEqual(classificar(7, 0, D5('F1', 25)).resultado, 'diverge');
  assert.equal(classificar(100, 75, D5('F2', 25)).resultado, 'concorda'); // exatamente 25%: concorda (≤)
  assert.equal(classificar(100, 74, D5('F2', 25)).resultado, 'diverge');
});

// Exemplo de D9 do plano, igual nos três meses, F1 com 10%: SNPP 400/410 (2,5%), NOAA-20 380/390 (2,6%), NOAA-21 300/200 (33,3%).
function exemploD9(extra = {}) {
  const sats = { SNPP: [400, 410], NOAA20: [380, 390], NOAA21: [300, 200], ...extra };
  const um = Object.fromEntries(Object.entries(sats).map(([s, v]) => [s, v && classificar(v[0], v[1], D5('F1', 10))]));
  return { '2026-08': um, '2026-09': um, '2026-10': um };
}

test('D9: S1, S2 e S3 com os valores do exemplo do plano', () => {
  const dec = (S, E = 'E1') => ({ D5: D5('F1', 10), D9: { agregacaoSatelites: S, comparacaoIndisponivel: E } });
  assert.equal(agregarK(exemploD9(), dec('S1')).K, 0);
  assert.equal(agregarK(exemploD9(), dec('S2')).K, 3);
  assert.equal(agregarK(exemploD9(), dec('S3')).K, 3); // soma A = 1080, B = 1000, 7,4%
});

test('D9: E1 exclui e declara o satélite sem comparação; E2 deixa K indeterminado; sem comparável, indeterminado', () => {
  const dec = (E) => ({ D5: D5('F1', 10), D9: { agregacaoSatelites: 'S2', comparacaoIndisponivel: E } });
  const semNoaa21 = exemploD9({ NOAA21: null });
  const e1 = agregarK(semNoaa21, dec('E1'));
  assert.equal(e1.K, 3); // 2 de 2 concordam
  assert.deepEqual(e1.porMes['2026-08'].excluidos, ['NOAA21']);
  assert.deepEqual(e1.porMes['2026-08'].comparaveis, ['NOAA20', 'SNPP']);
  const e2 = agregarK(semNoaa21, dec('E2'));
  assert.equal(e2.K, null);
  assert.equal(e2.porMes['2026-08'].resultado, 'indeterminado');
  const nenhum = agregarK({ '2026-08': { SNPP: null }, '2026-09': { SNPP: null }, '2026-10': { SNPP: null } }, dec('E1'));
  assert.equal(nenhum.K, null);
});

test('D9: S2 exige maioria estrita (1 de 2 não concorda)', () => {
  const dec = { D5: D5('F1', 10), D9: { agregacaoSatelites: 'S2', comparacaoIndisponivel: 'E1' } };
  const mes = { SNPP: classificar(400, 410, dec.D5), NOAA21: classificar(300, 200, dec.D5) };
  const k = agregarK({ '2026-08': mes, '2026-09': mes, '2026-10': mes }, dec);
  assert.equal(k.K, 0);
});

test('decisões reais do plano são aceitas e implementadas', () => {
  const d = validarDecisoes(REAL);
  exigirImplementado(d);
  assert.equal(d.D5.formula, 'F2');
  assert.equal(d.D5.toleranciaPercentual, 25);
});

test('combinações não admitidas são recusadas', () => {
  // D6 só b com D7 a ou b
  assert.throws(() => validarDecisoes(com((d) => { d.D6.escolhas = ['b']; })), /D7 a ou b com D6 sem a nem c/);
  assert.throws(() => validarDecisoes(com((d) => { d.D6.escolhas = ['b']; d.D7.escolha = 'a'; })), /D7 a ou b/);
  validarDecisoes(com((d) => { d.D6.escolhas = ['b']; d.D7.escolha = 'c'; })); // só D7 c é compatível
  // S3 com D5 c
  assert.throws(() => validarDecisoes(com((d) => { d.D9.agregacaoSatelites = 'S3'; d.D5.escolha = 'c'; })), /S3 com D5 c/);
  // D4 b
  assert.throws(() => validarDecisoes(com((d) => { d.D4.escolha = 'b'; })), /nova versão do plano/);
  // E obrigatória com D6 a; H obrigatória com dois métodos; D6 vazia
  assert.throws(() => validarDecisoes(com((d) => { d.D9.comparacaoIndisponivel = null; })), /E1 ou E2/);
  assert.throws(() => validarDecisoes(com((d) => { d.D6.escolhas = ['a', 'c']; })), /H1 ou H2/);
  assert.throws(() => validarDecisoes(com((d) => { d.D6.escolhas = []; })), /ao menos uma/);
});

test('o que as decisões excluem não é implementado e é recusado, sem escolher no lugar do responsável', () => {
  const dois = validarDecisoes(com((d) => { d.D6.escolhas = ['a', 'c']; d.D9.agregacaoMetodos = 'H2'; }));
  assert.throws(() => exigirImplementado(dois), /D6 diferente de a/);
  assert.throws(() => exigirImplementado(validarDecisoes(com((d) => { d.D5.escolha = 'c'; }))), /D5/);
});

const passo = (resultado) => ({ resultado });
const caso = (id, p1, p2, p3) => ({ id, lat: -9.1, lon: -60.2, instanteGmt: '2026-09-01 18:00:00', satelite: 'AQUA_M-T', p1: passo(p1), p2: passo(p2), p3: passo(p3) });
const muitos = (n, c, r = ['confere', 'confere', 'confere']) => Array.from({ length: n }, (_, i) => caso(`${c}${i}`, ...r));

test('caso: confere, não confere ou inconclusivo', () => {
  assert.equal(classificarCaso(caso('a', 'confere', 'confere', 'confere')), 'confere');
  assert.equal(classificarCaso(caso('a', 'confere', 'nao_confere', 'confere')), 'nao_confere');
  assert.equal(classificarCaso(caso('a', 'confere', 'inconclusivo', 'confere')), 'inconclusivo');
  assert.equal(classificarCaso(caso('a', 'nao_confere', 'inconclusivo', 'confere')), 'nao_confere');
  assert.throws(() => classificarCaso(caso('a', 'confere', 'talvez', 'confere')), /resultado válido/);
});

// Exemplo 1 de D8: 18 casos, 16 conferem, 1 não confere, 1 inconclusivo. Exemplo 2: 10 casos, todos inconclusivos.
test('M de D8: alternativas a, b e c com os exemplos 1 e 2 do plano', () => {
  const ex1 = [...muitos(16, 'c'), caso('n', 'confere', 'nao_confere', 'confere'), caso('i', 'inconclusivo', 'confere', 'confere')];
  const ex2 = muitos(10, 'i', ['inconclusivo', 'confere', 'confere']);
  const d8 = (escolha) => ({ escolha, minimoConclusivos: 10, maximoCasos: 20 });
  assert.equal(calcularM(ex1, d8('a')).M, 94.1); // 16 / 17
  assert.equal(calcularM(ex1, d8('b')).M, 88.9); // 16 / 18
  assert.equal(calcularM(ex1, d8('c')).M, 94.1);
  assert.equal(calcularM(ex2, d8('a')).M, null); // 0 conclusivos
  assert.equal(calcularM(ex2, d8('b')).M, 0); // 0 / 10
  assert.equal(calcularM(ex2, d8('c')).M, null);
  // c: 6 conclusivos, todos conferindo, 6 < 10 e M é indeterminado
  const seis = [...muitos(6, 'c'), ...muitos(4, 'i', ['inconclusivo', 'confere', 'confere'])];
  assert.equal(calcularM(seis, d8('c')).M, null);
  assert.deepEqual(calcularM(ex1, d8('a')), { M: 94.1, casos: 18, confere: 16, naoConfere: 1, inconclusivos: 1, conclusivos: 17 });
  assert.equal(calcularM([], d8('c')).M, null);
  assert.throws(() => calcularM(muitos(21, 'x'), d8('c')), /Mais de 20/);
});

test('conclusão de D7 b: viável, inviável e evidência insuficiente', () => {
  const d7 = REAL.decisoes.D7;
  const base = { U: true, C: 1, K: 3, M: 95, divergenciasExplicadas: true };
  assert.equal(conclusao(base, d7).conclusao, 'viável');
  // exemplo do plano: U atendido, K = 2 de 3, M = 94,1%; C-d = 3 viável, C-p = 4 inviável
  assert.equal(conclusao({ ...base, C: 3, K: 2, M: 94.1 }, d7).conclusao, 'viável');
  assert.match(conclusao({ ...base, C: 4, K: 2, M: 94.1 }, d7).motivo, /C = 4/);
  assert.equal(conclusao({ ...base, C: 4, K: 2, M: 94.1 }, d7).conclusao, 'inviável');
  assert.equal(conclusao({ ...base, M: 88.9 }, d7).conclusao, 'inviável');
  assert.equal(conclusao({ ...base, K: 1 }, d7).conclusao, 'inviável');
  assert.equal(conclusao({ ...base, K: 2, divergenciasExplicadas: false }, d7).conclusao, 'inviável');
  assert.equal(conclusao({ ...base, U: false }, d7).conclusao, 'inviável');
  // K ou M indeterminados: nunca viável ou inviável, mesmo com C acima do limite
  assert.equal(conclusao({ ...base, M: null }, d7).conclusao, 'evidência insuficiente');
  assert.equal(conclusao({ ...base, K: null, C: 9 }, d7).conclusao, 'evidência insuficiente');
  assert.match(conclusao({ ...base, K: null, M: null }, d7).motivo, /K e M/);
});

test('tabela de casos traz todos os campos do roteiro', () => {
  const c = { ...caso('abc', 'confere', 'confere', 'inconclusivo'), visualizador: 'BDQueimadas (acesso 2026-11-04)', esperado: 'dentro', script: 'dentro', conferidoPor: 'Responsável', data: '2026-11-04', motivo: 'resolução' };
  c.p3 = { resultado: 'inconclusivo', motivo: 'sem hora' };
  const t = tabelaCasos([c]).split('\n');
  assert.equal(t.length, 3);
  assert.match(t[0], /id INPE.*instante GMT.*P1 catálogo.*P2 território.*P3 período/);
  assert.match(t[2], /`abc`.*inconclusivo \(sem hora\).*Responsável, 2026-11-04/);
});

// Execução completa sobre fixtures: só o SNPP tem arquivos do FIRMS (E1 exclui NOAA-20 e NOAA-21, com declaração).
test('execução completa: E1, K, M indeterminado, evidência insuficiente e saída idêntica; insumo divergente para', async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), 'rq-comparar-'));
  const brutos = path.join(raiz, 'local', 'prova-dados', 'brutos');
  const saidas = path.join(raiz, 'local', 'prova-dados', 'saidas');
  await mkdir(path.join(brutos, 'ibge'), { recursive: true });
  await mkdir(path.join(brutos, 'firms'), { recursive: true });
  await mkdir(saidas, { recursive: true });
  await copyFile(new URL('colniza_ficticio.geojson', FIXTURES), path.join(brutos, 'ibge', 'malha.geojson'));
  await copyFile(new URL('firms_ficticio_1.csv', FIXTURES), path.join(brutos, 'firms', 'a.csv'));
  await copyFile(new URL('firms_ficticio_2.csv', FIXTURES), path.join(brutos, 'firms', 'b.csv'));
  const sha = (arq) => sha256Arquivo(path.join(brutos, arq));
  const fontes = {
    itens: [
      { id: 'ibge-x', tipo: 'ibge-malha', destino: 'ibge/malha.geojson', sha256: await sha('ibge/malha.geojson') },
      { id: 'firms-VIIRS_SNPP_NRT-2026-08-01', tipo: 'firms-area', destino: 'firms/a.csv', sha256: await sha('firms/a.csv') },
      { id: 'firms-VIIRS_SNPP_NRT-2026-08-06', tipo: 'firms-area', destino: 'firms/b.csv', sha256: await sha('firms/b.csv') },
    ],
    firms: { produtos: { VIIRS_SNPP: 'VIIRS_SNPP_NRT' } },
  };
  const fontesPath = path.join(raiz, 'fontes.json');
  await writeFile(fontesPath, JSON.stringify(fontes));
  const zeros = (a, s, o) => ({ '2026-08': a, '2026-09': s, '2026-10': o });
  await writeFile(path.join(saidas, 'contagem.json'), JSON.stringify({
    insumos: [{ id: 'ibge-x', sha256: fontes.itens[0].sha256 }],
    series: { V: { SNPP: zeros(2, 3, 0), NOAA20: zeros(5, 5, 5), NOAA21: zeros(5, 5, 5) } },
    cobertura: { C: { d: 1, p: 1 } },
  }));
  const casosPath = path.join(raiz, 'casos.json');
  await writeFile(casosPath, JSON.stringify({ casos: [], explicacoesDeK: {} }));
  const opcoes = { raiz, fontesPath, decisoesPath: fileURLToPath(new URL('./decisoes.json', import.meta.url)), casosPath };
  const a = await executar({ ...opcoes, saida: path.join(raiz, 'a.json') });
  const b = await executar({ ...opcoes, saida: path.join(raiz, 'b.json') });
  assert.equal(a.sha256, b.sha256);
  const r = a.resultado;
  // FIRMS SNPP no polígono: agosto 2, setembro 2, outubro 0; INPE (fictício) 2, 3 e 0
  assert.deepEqual(r.comparacoes['2026-08'].SNPP, { A: 2, B: 2, formula: 'F2', percentual: 0, resultado: 'concorda' });
  assert.equal(r.comparacoes['2026-09'].SNPP.resultado, 'diverge'); // |3 − 2| / 3 = 33,33%
  assert.equal(r.comparacoes['2026-10'].SNPP.resultado, 'concorda'); // 0 = 0
  assert.equal(r.comparacoes['2026-08'].NOAA20, null);
  assert.deepEqual(r.K.porMes['2026-08'].excluidos, ['NOAA20', 'NOAA21']);
  assert.equal(r.K.K, 2);
  assert.equal(r.firms.NOAA20.disponivel, false);
  assert.equal(r.casos.M, null);
  assert.equal(r.conclusao, 'evidência insuficiente');
  assert.equal(r.componentes.C, 1);

  await writeFile(path.join(brutos, 'firms', 'a.csv'), 'adulterado\n');
  await assert.rejects(executar({ ...opcoes, saida: path.join(raiz, 'c.json') }), /diverge de fontes\.json/);
  await limpar(raiz);
});
