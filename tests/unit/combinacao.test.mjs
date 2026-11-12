// Casos de referência da combinação de lentes (plano 005, item 1): CB-1 a CB-16. Os valores esperados estão em
// tests/fixtures/lentes/combinacao.json, escritos à mão a partir do plano; nenhum é gerado pelo código. As lentes
// são calculadas pelas funções do ciclo 004 dentro de `combinar` (T8), com n = 1 na concentração.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calcularCombinacao, combinar, ErroCombinacao, LIMITACAO_INTERSECAO, LIMITACAO_OPERADOR, LIMITACAO_PROJECAO,
  municipiosDaCombinacao, PARAMETRO_PROJECAO, qualificarCombinacao, textoSemCelulas, VERSAO_COMBINACAO,
} from '../../src/lentes/combinacao.ts';
import { persistencia } from '../../src/lentes/persistencia.ts';
import { diasDaJanela, textoCobertura } from '../../src/lentes/cobertura.ts';
import { ErroLente, VERSAO_METODO } from '../../src/lentes/contrato.ts';

const FX = JSON.parse(readFileSync(new URL('../fixtures/lentes/combinacao.json', import.meta.url), 'utf8'));
const CARGA = { id: 7, identidade: 'c'.repeat(64) };
const N = 1;
const TRES = ['concentracao', 'recorrencia', 'persistencia'];
const id = (letra) => FX.celulas[letra].unidade.id;

const fimExclusivo = (fim) => new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().replace('.000Z', 'Z');

/** Entrada com os registros da fixture (mais os extras) que caem na janela; total do resumo igual. */
function entrada({ janela = FX.janela_base, extras = [], registros } = {}) {
  const lista = (registros ?? [...FX.registros, ...extras]).map(([id_tecnico, data_hora_gmt, celula, municipio_codigo]) => ({
    id_tecnico, data_hora_gmt, latitude: FX.celulas[celula].lat, longitude: FX.celulas[celula].lon, municipio_codigo,
  })).filter((r) => r.data_hora_gmt >= `${janela.inicio}T00:00:00Z` && r.data_hora_gmt < fimExclusivo(janela.fim));
  return {
    carga: CARGA, janela, registros: lista, totalResumo: lista.length,
    nomes: new Map(Object.entries(FX.municipios).map(([c, n]) => [Number(c), n])),
  };
}

/** Disponibilidade fictícia: todo dia da janela sem evidência de lacuna, salvo os restritivos; ausentes e falhas. */
function disponibilidade(janela, { restritivos = {}, ausentes = [], falha = [] } = {}) {
  const mapa = new Map();
  for (const codigo of Object.keys(FX.municipios).map(Number)) {
    if (ausentes.includes(codigo)) continue;
    if (falha.includes(codigo)) { mapa.set(codigo, { estado: 'falha', motivo: 'falha fictícia de leitura' }); continue; }
    const r = restritivos[codigo] ?? {};
    const dias = new Map(diasDaJanela(janela).map((dia) => {
      const x = r[dia];
      return [dia, x ? { dia, classe: x[0], motivos: x.slice(1) } : { dia, classe: 'sem_evidencia_de_lacuna', motivos: [] }];
    }));
    mapa.set(codigo, { estado: 'ok', dias });
  }
  return mapa;
}

const resumo = (r) => r.celulas.map((c) => [c.unidade.id, c.criterios.map((x) => x.lente)]);
const esperadoResumo = (lista) => lista.map(([letra, lentes]) => [id(letra), lentes]);
const celula = (r, letra) => r.celulas.find((c) => c.unidade.id === id(letra));

test('CB-1: interseção das três — só A, com os três critérios na ordem canônica', () => {
  const c = FX.casos['CB-1'];
  const r = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  assert.equal(r.estado, c.esperado.estado);
  assert.deepEqual(resumo(r), esperadoResumo(c.esperado.celulas));
  assert.equal(r.tipo, 'combinacao');
  assert.equal(r.versao_combinacao, 'combinacao-005-v1');
  assert.equal(VERSAO_COMBINACAO, 'combinacao-005-v1');
  assert.equal(r.versao_metodo, VERSAO_METODO);
  assert.deepEqual(r.recorte, { tipo: 'estado', municipio: null });
  assert.deepEqual(r.conferencia, { registros_lidos: 34, ids_distintos: 34, total_resumo: 34 });
  assert.deepEqual(r.indisponibilidade, []);
  // Limitações da combinação: a de interseção só no "e"; a de projeção só com a concentração.
  for (const l of [LIMITACAO_OPERADOR.e, LIMITACAO_PROJECAO, LIMITACAO_INTERSECAO, 'Contagem absoluta favorece municípios grandes.']) {
    assert.ok(r.limitacoes.includes(l), l);
  }
  assert.ok(r.parametros.some((p) => p.origem === 'combinacao' && p.valor === PARAMETRO_PROJECAO));
  // Antes da qualificação, toda célula tem cobertura pendente; sem campo de contagem, ordem ou ordenação (T13).
  for (const x of r.celulas) {
    assert.equal(x.cobertura.estado, 'pendente');
    for (const k of ['ordem', 'ordenacao', 'pontuacao', 'numero_lentes']) assert.equal(k in x, false, k);
  }
  assert.equal('ordenacao' in r, false);
});

test('CB-2: união das três — seis células na ordem T13, cada uma com as lentes que a destacaram', () => {
  const c = FX.casos['CB-2'];
  const r = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  assert.equal(r.estado, c.esperado.estado);
  assert.deepEqual(resumo(r), esperadoResumo(c.esperado.celulas));
  assert.ok(!r.limitacoes.includes(LIMITACAO_INTERSECAO));
  // R2-1: a limitação geral descreve o efeito do operador e mantém o aviso de que a lista não é ranking.
  assert.ok(r.limitacoes.includes(LIMITACAO_OPERADOR.ou));
  assert.ok(!r.limitacoes.includes(LIMITACAO_OPERADOR.e));
  for (const t of Object.values(LIMITACAO_OPERADOR)) {
    assert.match(t, /não mais verdadeira|sem torná-la mais verdadeira/);
    assert.match(t, /A lista não é ranking: células destacadas por mais lentes não são mais graves nem prioritárias\.$/);
  }
  assert.deepEqual(municipiosDaCombinacao(r), [9920001, 9920002, 9920003]);
});

test('CB-3: pares com "e"', () => {
  for (const p of FX.casos['CB-3'].pares) {
    const r = calcularCombinacao(entrada(), p.lentes, 'e', N);
    assert.deepEqual(r.celulas.map((x) => x.unidade.id), p.celulas.map(id), p.lentes.join('+'));
    assert.deepEqual(r.lentes, p.lentes);
    for (const x of r.celulas) assert.deepEqual(x.criterios.map((k) => k.lente), p.lentes);
    assert.equal(r.limitacoes.includes(LIMITACAO_PROJECAO), p.lentes.includes('concentracao'));
  }
});

test('CB-4: projeção P1 e evidência por critério na célula A', () => {
  const c = FX.casos['CB-4'];
  const r = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  const a = celula(r, c.celula);
  assert.equal(a.id_combinado, c.esperado.id_combinado);
  assert.deepEqual(a.unidade, FX.celulas.A.unidade);
  assert.deepEqual(a.criterios, c.esperado.criterios);
  assert.deepEqual(a.evidencia.deteccoes, c.esperado.evidencia);
  assert.deepEqual(a.municipios, c.esperado.municipios);
  assert.deepEqual(a.cobertura, { estado: 'pendente', municipios: c.esperado.municipios });
});

test('CB-5: projeção com 1 detecção — C entra pela concentração, sem ressalva de projeção', () => {
  const c = FX.casos['CB-5'];
  const r = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  const x = celula(r, c.celula);
  assert.deepEqual(x.criterios, c.esperado.criterios);
  assert.deepEqual(x.municipios, c.esperado.municipios);
});

test('CB-6: empate D16 — M1 e M2 destacados; um destaque por município, em ordem de código', () => {
  const c = FX.casos['CB-6'];
  const r = calcularCombinacao(entrada({ extras: c.extras }), c.lentes, c.operador, N);
  assert.deepEqual(resumo(r), esperadoResumo(c.esperado.celulas));
  const destacados = new Set(r.celulas.flatMap((x) => x.criterios.filter((k) => k.lente === 'concentracao')
    .flatMap((k) => k.destaques.map((d) => Number(d.id_destaque.split(':')[2])))));
  assert.deepEqual([...destacados].sort(), c.esperado.destacados);
  for (const [letra, esp] of Object.entries(c.esperado.concentracao)) {
    const k = celula(r, letra).criterios.find((x) => x.lente === 'concentracao');
    assert.deepEqual(k.ressalvas, esp.ressalvas, letra);
    assert.deepEqual(k.destaques.map((d) => ({ id_destaque: d.id_destaque, motivo: d.motivo, deteccoes: d.evidencia.deteccoes })), esp.destaques, letra);
  }
});

test('CB-7: persistência por célula; ressalvas por classe calculadas sequência a sequência', () => {
  const c = FX.casos['CB-7'];
  const bruto = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  const r = qualificarCombinacao(bruto, disponibilidade(FX.janela_base, c.disponibilidade));
  const e = r.celulas.filter((x) => x.unidade.id === id(c.celula));
  assert.equal(e.length, 1, 'um único item E');
  assert.deepEqual(e[0].criterios, c.esperado.criterios);
  assert.deepEqual(e[0].evidencia.deteccoes, c.esperado.evidencia);
  assert.equal(textoCobertura(e[0].cobertura), c.esperado.cobertura);
  // O bruto não muda (função pura).
  assert.equal(celula(bruto, 'E').cobertura.estado, 'pendente');
  assert.deepEqual(celula(bruto, 'E').criterios[0].destaques.map((d) => d.ressalvas), [[], []]);
});

test('CB-8: janela de um mês — combinação com a recorrência indisponível; sem ela, calculada', () => {
  const c = FX.casos['CB-8'];
  const e = entrada({ janela: c.janela });
  for (const x of c.indisponiveis) {
    const r = calcularCombinacao(e, x.lentes, x.operador, N);
    assert.equal(r.estado, 'indisponivel', x.lentes.join('+'));
    assert.deepEqual(r.celulas, []);
    assert.deepEqual(r.indisponibilidade, c.indisponibilidade);
  }
  const k = c.calculada;
  const r = calcularCombinacao(e, k.lentes, k.operador, N);
  assert.equal(r.estado, 'com_celulas');
  assert.deepEqual(resumo(r), esperadoResumo(k.celulas));
  const conc = celula(r, 'A').criterios[0];
  assert.deepEqual(conc.ressalvas, k.concentracao_A.ressalvas);
  assert.deepEqual(conc.destaques.map((d) => d.motivo), [k.concentracao_A.motivo]);
  assert.deepEqual(conc.destaques[0].evidencia.deteccoes, k.concentracao_A.deteccoes);
});

test('CB-9: sem células em comum ("e") e união com a concentração ("ou")', () => {
  const c = FX.casos['CB-9'];
  const e = entrada({ janela: c.janela });
  assert.equal(persistencia(e).estado, 'sem_destaques');
  const rE = calcularCombinacao(e, c.lentes, 'e', N);
  assert.equal(rE.estado, c.esperado.e.estado);
  assert.deepEqual(rE.celulas, []);
  assert.equal(textoSemCelulas(rE.operador), c.esperado.e.texto);
  const rOu = calcularCombinacao(e, c.lentes, 'ou', N);
  assert.equal(rOu.estado, c.esperado.ou.estado);
  assert.deepEqual(resumo(rOu), esperadoResumo(c.esperado.ou.celulas));
});

test('CB-10: cobertura da célula pela união dos municípios de todas as detecções (V1)', () => {
  const c = FX.casos['CB-10'];
  const r = qualificarCombinacao(calcularCombinacao(entrada(), c.lentes, c.operador, N), disponibilidade(FX.janela_base, c.disponibilidade));
  const a = celula(r, c.celula);
  assert.deepEqual(a.cobertura, c.esperado.cobertura);
  assert.equal(textoCobertura(a.cobertura), c.esperado.texto);
  // Os dias restritivos não são vizinhos da sequência de 05 a 07/10.
  assert.deepEqual(a.criterios.find((x) => x.lente === 'persistencia').destaques[0].ressalvas, c.esperado.ressalvas_persistencia);
});

test('CB-11: cobertura pendente e falha — a seleção e os critérios não mudam', () => {
  const c = FX.casos['CB-11'];
  const bruto = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  for (const etapa of c.etapas) {
    const r = qualificarCombinacao(bruto, disponibilidade(FX.janela_base, etapa.disponibilidade));
    assert.deepEqual(resumo(r), esperadoResumo(c.esperado.celulas));
    const a = celula(r, c.celula);
    assert.equal(a.cobertura.estado, etapa.estado);
    assert.equal(textoCobertura(a.cobertura), etapa.texto);
    assert.deepEqual(a.criterios.find((x) => x.lente === 'persistencia').destaques[0].ressalvas, c.esperado.ressalvas_persistencia);
    // Concentração e recorrência sem ressalva de disponibilidade.
    assert.deepEqual(a.criterios.find((x) => x.lente === 'recorrencia').destaques[0].ressalvas, []);
    assert.deepEqual(a.criterios.find((x) => x.lente === 'concentracao').destaques[0].ressalvas, []);
  }
});

test('CB-12: ressalvas por lente — mês parcial na recorrência e borda na persistência', () => {
  const c = FX.casos['CB-12'];
  const r = qualificarCombinacao(
    calcularCombinacao(entrada({ janela: c.janela }), c.lentes, c.operador, N),
    disponibilidade(c.janela, c.disponibilidade),
  );
  assert.deepEqual(resumo(r), esperadoResumo(c.esperado.celulas));
  assert.deepEqual(celula(r, 'A').criterios, c.esperado.criterios);
});

test('CB-13: entrada inconsistente lança ErroLente; escolha inválida lança ErroCombinacao', () => {
  const base = entrada();
  const dez = { ...base, registros: base.registros.slice(0, 10), totalResumo: 9 };
  assert.throws(() => calcularCombinacao(dez, TRES, 'ou', N), ErroLente);
  const exponencial = { ...base, registros: base.registros.map((r, i) => (i === 0 ? { ...r, latitude: 1e-7 } : r)) };
  assert.throws(() => calcularCombinacao(exponencial, TRES, 'ou', N), ErroLente);
  // A coordenada inválida também é rejeitada quando a única lente de célula escolhida é a persistência.
  assert.throws(() => calcularCombinacao(exponencial, ['concentracao', 'persistencia'], 'e', N), ErroLente);
  for (const x of FX.casos['CB-13'].invalidas) {
    assert.throws(() => calcularCombinacao(base, x.lentes, x.operador, N), ErroCombinacao, JSON.stringify(x));
    assert.throws(() => combinar(base, x.lentes, x.operador), ErroCombinacao, JSON.stringify(x));
  }
});

test('CB-14: determinismo — registros embaralhados e lentes em outra ordem dão o mesmo resultado', () => {
  const c = FX.casos['CB-14'];
  const base = entrada();
  const embaralhados = { ...base, registros: [...base.registros].reverse().sort((a, b) => (a.id_tecnico.charCodeAt(4) % 3) - (b.id_tecnico.charCodeAt(4) % 3)) };
  assert.notDeepEqual(embaralhados.registros.map((r) => r.id_tecnico), base.registros.map((r) => r.id_tecnico));
  const [r1, r2] = c.ordens.map((ordem, i) => calcularCombinacao(i === 0 ? base : embaralhados, ordem, c.operador, N));
  assert.deepEqual(r2, r1);
  assert.deepEqual(r1.lentes, c.esperado.lentes);
  assert.deepEqual(r1.celulas.map((x) => x.id_combinado), c.esperado.ids);
  // As três em ordens diferentes.
  assert.deepEqual(
    calcularCombinacao(embaralhados, ['persistencia', 'concentracao', 'recorrencia'], 'ou', N),
    calcularCombinacao(base, TRES, 'ou', N),
  );
});

test('CB-15: P1, e não maioria — F entra pela concentração com 1 de 3 detecções', () => {
  const c = FX.casos['CB-15'];
  const r = calcularCombinacao(entrada(), c.lentes, c.operador, N);
  const f = celula(r, c.celula);
  assert.deepEqual(f.criterios, c.esperado.criterios);
  assert.deepEqual(f.municipios, c.esperado.municipios);
});

test('CB-16: união vazia — as três rodam sem destaques; "ou" e "e" ficam sem células, não indisponíveis', () => {
  const c = FX.casos['CB-16'];
  const e = entrada({ janela: c.janela });
  assert.equal(e.registros.length, 0);
  for (const op of ['ou', 'e']) {
    const r = calcularCombinacao(e, c.lentes, op, N);
    assert.equal(r.estado, 'sem_celulas', op);
    assert.deepEqual(r.indisponibilidade, []);
    assert.deepEqual(r.celulas, []);
    assert.equal(textoSemCelulas(op), c.esperado[op]);
  }
});

test('Ponto de entrada de produção: concentração com N=10 (os três municípios fictícios entram)', () => {
  const r = combinar(entrada(), ['concentracao', 'recorrencia'], 'ou');
  // Com N=10 e só 3 municípios na janela, todos entram: toda célula tem o critério da concentração.
  assert.deepEqual(r.celulas.map((x) => x.criterios[0].lente), r.celulas.map(() => 'concentracao'));
  assert.equal(r.celulas.length, 6);
  assert.ok(r.parametros.some((p) => p.origem === 'concentracao' && p.valor.startsWith('os 10 primeiros')));
});
