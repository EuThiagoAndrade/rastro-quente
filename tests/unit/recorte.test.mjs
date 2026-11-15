// Casos de referência do recorte das lentes (plano 007, item 4): RC-1 a RC-11. Valores esperados escritos à mão a
// partir do plano, com municípios fictícios A (1) e B (2) e células na grade T1; nenhum é gerado pelo código. A entrada
// municipal é a mesma entrada estadual filtrada pelo município, como a RPC devolve com `p_municipio`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { concentracao } from '../../src/lentes/concentracao.ts';
import { recorrencia } from '../../src/lentes/recorrencia.ts';
import { persistencia } from '../../src/lentes/persistencia.ts';
import { qualificar } from '../../src/lentes/comum.ts';
import { calcularCombinacao, ErroCombinacao, VERSAO_COMBINACAO } from '../../src/lentes/combinacao.ts';
import { sobreposicao, VERSAO_SOBREPOSICAO } from '../../src/lentes/sobreposicao.ts';
import { diasDaJanela } from '../../src/lentes/cobertura.ts';
import { ErroLente, RECORTE_ESTADUAL, recorteDe, VERSAO_METODO } from '../../src/lentes/contrato.ts';

const CARGA = { id: 7, identidade: 'e'.repeat(64) };
const A = 1;
const B = 2;
const NOMES = new Map([[A, 'Município A'], [B, 'Município B']]);
// Célula de divisa D (registros de A e de B), célula só de A (S) e célula de outra posição (O).
const CELULA = { D: [-12.52, -56.52], S: [-12.72, -56.72], O: [-13.02, -57.02] };
const JANELA = { inicio: '2026-01-01', fim: '2026-08-31' };

/** Registros `[id, data_hora_gmt, célula, município]`; entrada do estado ou só do município do recorte. */
function entrada(lista, municipio = null, janela = JANELA) {
  const registros = lista
    .map(([id_tecnico, data_hora_gmt, celula, municipio_codigo]) => ({
      id_tecnico, data_hora_gmt, latitude: CELULA[celula][0], longitude: CELULA[celula][1], municipio_codigo,
    }))
    .filter((r) => municipio === null || r.municipio_codigo === municipio);
  return {
    carga: CARGA, janela, registros, totalResumo: registros.length, nomes: NOMES,
    ...(municipio === null ? {} : { recorte: recorteDe(municipio) }),
  };
}

const celulas = (r) => r.destaques.map((d) => d.unidade.id);
const ID_D = 'c-251_-1131';

test('versões do plano 007 (T2)', () => {
  assert.equal(VERSAO_METODO, 'lentes-007-v1');
  assert.equal(VERSAO_COMBINACAO, 'combinacao-007-v1');
  assert.equal(VERSAO_SOBREPOSICAO, 'sobreposicao-007-v1');
});

const RC1 = [
  ['a1', '2026-01-10T10:00:00Z', 'D', A], ['a2', '2026-03-05T10:00:00Z', 'D', A], ['b1', '2026-05-02T10:00:00Z', 'D', B],
  ['a3', '2026-08-10T10:00:00Z', 'S', A], ['a4', '2026-08-11T10:00:00Z', 'S', A], ['b2', '2026-08-12T10:00:00Z', 'S', B],
  ['b3', '2026-02-01T10:00:00Z', 'O', B],
];

test('RC-1: no recorte estadual, explícito ou ausente, o resultado é o mesmo e o recorte continua estadual', () => {
  const sem = entrada(RC1);
  const com = { ...entrada(RC1), recorte: RECORTE_ESTADUAL };
  for (const f of [recorrencia, persistencia, (e) => concentracao(e, 1)]) {
    const a = f(sem);
    const b = f(com);
    assert.deepEqual(b, a);
    assert.deepEqual(a.recorte, { tipo: 'estado', municipio: null });
    assert.equal(a.versao_metodo, 'lentes-007-v1');
    assert.ok(!a.limitacoes.some((x) => x.includes('divisa podem perder')), 'sem limitação municipal no estado');
  }
  for (const lentes of [['concentracao', 'recorrencia'], ['concentracao', 'persistencia'], ['recorrencia', 'persistencia'], ['concentracao', 'recorrencia', 'persistencia']]) {
    for (const op of ['e', 'ou']) {
      const a = calcularCombinacao(sem, lentes, op, 1);
      assert.deepEqual(calcularCombinacao(com, lentes, op, 1), a);
      assert.deepEqual(a.recorte, { tipo: 'estado', municipio: null });
      assert.equal(a.versao_combinacao, 'combinacao-007-v1');
    }
  }
});

test('RC-2: recorrência na divisa — estado destaca (3 meses); A (2) e B (1) não', () => {
  const lista = [['a1', '2026-01-10T10:00:00Z', 'D', A], ['a2', '2026-03-05T10:00:00Z', 'D', A], ['b1', '2026-05-02T10:00:00Z', 'D', B]];
  assert.deepEqual(celulas(recorrencia(entrada(lista))), [ID_D]);
  const ra = recorrencia(entrada(lista, A));
  assert.equal(ra.estado, 'sem_destaques');
  assert.deepEqual(ra.recorte, { tipo: 'municipio', municipio: A });
  assert.ok(ra.limitacoes.includes('Células na divisa podem perder destaque, porque só contam os focos de Município A.'));
  assert.equal(recorrencia(entrada(lista, B)).estado, 'sem_destaques');
});

test('RC-3: célula só de A — estado e A destacam com evidência 3; em B a célula não aparece', () => {
  const lista = [['a1', '2026-01-10T10:00:00Z', 'S', A], ['a2', '2026-03-10T10:00:00Z', 'S', A], ['a3', '2026-05-10T10:00:00Z', 'S', A]];
  for (const e of [entrada(lista), entrada(lista, A)]) {
    const r = recorrencia(e);
    assert.equal(r.destaques.length, 1);
    assert.equal(r.destaques[0].evidencia.valor, 3);
    assert.deepEqual(r.destaques[0].evidencia.deteccoes, ['a1', 'a2', 'a3']);
  }
  const rb = recorrencia(entrada(lista, B));
  assert.deepEqual(rb.destaques, []);
  assert.equal(rb.conferencia.registros_lidos, 0);
});

test('RC-4: persistência na divisa — estado destaca (3 dias); A (2) e B (1) não', () => {
  const lista = [['a1', '2026-08-10T10:00:00Z', 'D', A], ['a2', '2026-08-11T10:00:00Z', 'D', A], ['b1', '2026-08-12T10:00:00Z', 'D', B]];
  const est = persistencia(entrada(lista));
  assert.equal(est.destaques.length, 1);
  assert.equal(est.destaques[0].evidencia.valor, 3);
  assert.equal(persistencia(entrada(lista, A)).estado, 'sem_destaques');
  assert.equal(persistencia(entrada(lista, B)).estado, 'sem_destaques');
});

test('RC-5: persistência — A com 4 focos em 4 dias destaca com evidência só de A; B não', () => {
  const lista = [
    ['a1', '2026-08-10T10:00:00Z', 'D', A], ['a2', '2026-08-11T10:00:00Z', 'D', A],
    ['a3', '2026-08-12T10:00:00Z', 'D', A], ['a4', '2026-08-13T10:00:00Z', 'D', A], ['b1', '2026-08-14T10:00:00Z', 'D', B],
  ];
  const ra = persistencia(entrada(lista, A));
  assert.equal(ra.destaques.length, 1);
  assert.deepEqual(ra.destaques[0].evidencia.deteccoes, ['a1', 'a2', 'a3', 'a4']);
  assert.deepEqual(ra.destaques[0].cobertura.municipios, [A]);
  assert.equal(persistencia(entrada(lista, B)).estado, 'sem_destaques');
});

test('RC-6: sobreposição integral na divisa — estado e A destacam com evidência 1; B não', () => {
  const FX = JSON.parse(readFileSync(new URL('../fixtures/lentes/sobreposicao.json', import.meta.url), 'utf8'));
  const area = FX.areas.find((a) => a.classe === 'protecao_integral');
  const camada = {
    estado: 'completa',
    carga: { ...CARGA, total_areas: 1, total_vinculos_area: 1 },
    areas: [{ carga_id: CARGA.id, ...area }],
    vinculos: [{ carga_id: CARGA.id, id_tecnico: 'a1', area_fonte: area.fonte, area_codigo: area.codigo, posicao: 'dentro' }],
  };
  const lista = [['a1', '2026-08-10T10:00:00Z', 'D', A], ['b1', '2026-08-10T12:00:00Z', 'D', B]];
  for (const e of [entrada(lista), entrada(lista, A)]) {
    const r = sobreposicao(e, camada, 'protecao_integral');
    assert.equal(r.destaques.length, 1);
    assert.deepEqual(r.destaques[0].evidencia, { deteccoes: ['a1'], valor: 1, datas: [] });
  }
  const rb = sobreposicao(entrada(lista, B), camada, 'protecao_integral');
  assert.equal(rb.estado, 'sem_destaques');
  assert.deepEqual(rb.recorte, { tipo: 'municipio', municipio: B });
});

test('RC-7: concentração no recorte de A — ErroLente "concentração exige recorte estadual"', () => {
  assert.throws(() => concentracao(entrada(RC1, A)), (x) => x instanceof ErroLente && x.message === 'concentração exige recorte estadual');
});

test('RC-8: combinação concentração + recorrência no recorte de A — ErroCombinacao', () => {
  assert.throws(() => calcularCombinacao(entrada(RC1, A), ['concentracao', 'recorrencia'], 'e', 1), ErroCombinacao);
});

test('RC-9: combinação recorrência e persistência ("e") em A — célula com recorrência só somando B não entra', () => {
  // Estado: D tem 3 meses (jan e mar de A, mai de B) e uma sequência de 3 dias de A em agosto.
  const lista = [
    ['a1', '2026-01-10T10:00:00Z', 'D', A], ['b1', '2026-05-02T10:00:00Z', 'D', B],
    ['a2', '2026-08-10T10:00:00Z', 'D', A], ['a3', '2026-08-11T10:00:00Z', 'D', A], ['a4', '2026-08-12T10:00:00Z', 'D', A],
  ];
  const est = calcularCombinacao(entrada(lista), ['recorrencia', 'persistencia'], 'e', 1);
  assert.deepEqual(est.celulas.map((c) => c.unidade.id), [ID_D]);
  const ra = calcularCombinacao(entrada(lista, A), ['recorrencia', 'persistencia'], 'e', 1);
  assert.equal(ra.estado, 'sem_celulas');
  assert.deepEqual(ra.recorte, { tipo: 'municipio', municipio: A });
});

test('RC-10: recorte de A com 2 meses GMT — recorrência em janela_insuficiente, sem destaques', () => {
  const janela = { inicio: '2026-07-01', fim: '2026-08-31' };
  const r = recorrencia(entrada([['a1', '2026-07-10T10:00:00Z', 'S', A], ['a2', '2026-08-10T10:00:00Z', 'S', A]], A, janela));
  assert.equal(r.estado, 'janela_insuficiente');
  assert.deepEqual(r.destaques, []);
});

test('RC-11: cobertura no recorte de A não considera o dia indeterminado de B', () => {
  const lista = [
    ['a1', '2026-08-10T10:00:00Z', 'D', A], ['a2', '2026-08-11T10:00:00Z', 'D', A],
    ['a3', '2026-08-12T10:00:00Z', 'D', A], ['b1', '2026-08-20T10:00:00Z', 'D', B],
  ];
  const disp = new Map();
  for (const codigo of [A, B]) {
    const dias = new Map(diasDaJanela(JANELA).map((dia) => [dia, { dia, classe: 'sem_evidencia_de_lacuna', motivos: [] }]));
    if (codigo === B) dias.set('2026-08-11', { dia: '2026-08-11', classe: 'incidencia_indeterminada', motivos: ['fictício'] });
    disp.set(codigo, { estado: 'ok', dias });
  }
  const est = qualificar(persistencia(entrada(lista)), disp).destaques[0];
  assert.deepEqual(est.cobertura.municipios, [A, B]);
  assert.equal(est.cobertura.demais_dias.length, 1);
  const ra = qualificar(persistencia(entrada(lista, A)), disp).destaques[0];
  assert.deepEqual(ra.cobertura.municipios, [A]);
  assert.equal(ra.cobertura.estado, 'completa');
  assert.deepEqual(ra.cobertura.demais_dias, []);
  assert.deepEqual(ra.ressalvas, []);
});

test('recorte municipal recusa registro de outro município (eco conferido)', () => {
  const e = { ...entrada(RC1), recorte: recorteDe(A) };
  assert.throws(() => recorrencia(e), (x) => x instanceof ErroLente && /outro município/.test(x.message));
});
