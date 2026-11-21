import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cruzarCriterios, calcularPadroes } from '../../servidor/cruzar-criterios.ts';

test('cruzamento conta cada critério uma vez por célula', () => {
  assert.deepEqual(cruzarCriterios([
    { criterio: 'recorrencia', celulas: ['X', 'Y'] },
    { criterio: 'persistencia', celulas: ['X', 'X'] },
    { criterio: 'sobreposicao', celulas: ['X', 'X'] },
  ]), { estado: 'com_achados', celulas: [{ id: 'X', criterios: ['recorrencia', 'persistencia', 'sobreposicao'] }] });
});

test('distingue ausência de cruzamento de critérios insuficientes', () => {
  assert.equal(cruzarCriterios([{ criterio: 'persistencia', celulas: ['X'] }]).estado, 'dados_insuficientes');
  assert.equal(cruzarCriterios([{ criterio: 'persistencia', celulas: ['X'] }, { criterio: 'recorrencia', celulas: ['Y'] }]).estado, 'sem_achados');
  assert.throws(() => cruzarCriterios([{ criterio: 'sobreposicao', celulas: ['X'] }, { criterio: 'sobreposicao', celulas: ['X'] }]));
});

import { diasDaJanela } from '../../src/lentes/cobertura.ts';
const carga = { id: 1, identidade: 'f'.repeat(64), total_areas: null, total_vinculos_area: null };
const semCamada = { estado: 'sem_camada', carga };
function entrada(municipio = null, janela = { inicio: '2026-08-01', fim: '2026-10-31' }) {
  // X: três meses, duas sequências distintas. Y: só meses distintos. Uma detecção por data.
  const registros = [
    ...['2026-08-02', '2026-09-02', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-10', '2026-10-11', '2026-10-12'].map((d, i) => ({ id_tecnico: `x${i}`, data_hora_gmt: `${d}T12:00:00Z`, latitude: -12.52, longitude: -56.48, municipio_codigo: 9900001 })),
    ...['2026-08-02', '2026-09-02', '2026-10-02'].map((d, i) => ({ id_tecnico: `y${i}`, data_hora_gmt: `${d}T12:00:00Z`, latitude: -12.52, longitude: -56.43, municipio_codigo: 9900001 })),
  ].filter((r) => r.data_hora_gmt.slice(0, 10) >= janela.inicio && r.data_hora_gmt.slice(0, 10) <= janela.fim);
  return { carga, janela, recorte: { tipo: municipio === null ? 'estado' : 'municipio', municipio }, registros, totalResumo: registros.length, nomes: new Map([[9900001, 'Município Fictício']]) };
}
function disponibilidade(e) {
  return new Map([[9900001, { estado: 'ok', dias: new Map(diasDaJanela(e.janela).map((dia) => [dia, { classe: 'sem_evidencia_de_lacuna', motivos: [] }])) }]]);
}
test('métodos reais: projeção municipal por célula, recorrência e sequências repetidas contam uma vez', () => {
  const e = entrada();
  const r = calcularPadroes(e, semCamada, disponibilidade(e));
  assert.deepEqual(r.celulas, [
    { id: 'c-251_-1129', criterios: ['concentracao', 'recorrencia'] },
    { id: 'c-251_-1130', criterios: ['concentracao', 'recorrencia', 'persistencia'] },
  ]);
  const municipal = entrada(9900001);
  assert.deepEqual(calcularPadroes(municipal, semCamada, disponibilidade(municipal)).celulas, [{ id: 'c-251_-1130', criterios: ['recorrencia', 'persistencia'] }]);
});
test('janela não elegível e camada ausente deixam um só critério municipal; falha de leitura nunca dá achados parciais', () => {
  const e = entrada(9900001, { inicio: '2026-10-01', fim: '2026-10-31' });
  const r = calcularPadroes(e, semCamada, disponibilidade(e));
  assert.equal(r.estado, 'dados_insuficientes');
  assert.deepEqual(r.criterios_disponiveis, ['persistencia']);
  assert.throws(() => calcularPadroes(e, semCamada, new Map()), /disponibilidade incompleta/);
  assert.throws(() => calcularPadroes({ ...e, totalResumo: 999 }, semCamada, disponibilidade(e)));
});
test('classes distintas de sobreposição formam um único critério, mesmo sem lente ativa', () => {
  const e = entrada(9900001, { inicio: '2026-10-01', fim: '2026-10-31' });
  const areas = ['protecao_integral', 'uso_sustentavel', 'terra_indigena'].map((classe, i) => ({ carga_id: 1, fonte: i === 2 ? 'funai' : 'cnuc', codigo: `A${i}`, nome: `Área Fictícia ${i}`, classe, qualidade: null, categoria: null, fase: null, modalidade: null, esfera: null }));
  const camada = { estado: 'completa', carga: { ...carga, total_areas: 3, total_vinculos_area: 3 }, areas, vinculos: areas.map((a) => ({ carga_id: 1, id_tecnico: 'x2', area_fonte: a.fonte, area_codigo: a.codigo, posicao: 'interior' })) };
  const r = calcularPadroes(e, camada, disponibilidade(e));
  assert.deepEqual(r.celulas, [{ id: 'c-251_-1130', criterios: ['persistencia', 'sobreposicao'] }]);
  assert.deepEqual(r.criterios_disponiveis, ['persistencia', 'sobreposicao']);
});
