// Ciclo 012 (issue #113) — mapa vivo e ficha: quadros diários por dia GMT (a soma é o total do recorte), dias de
// cobertura não comprovada e os números, o roteiro e a síntese da ficha. Registros fictícios; esperados à mão.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diasSemCobertura, faixaIdade, montarReproducao } from '../../src/replay.ts';
import { resumirFicha, roteiroAveriguacao, sinteseDeterministica } from '../../src/ficha.ts';

const reg = (id, iso, lat = -12, lon = -56) => ({ id_tecnico: id, data_hora_gmt: iso, latitude: lat, longitude: lon, municipio_codigo: 1 });
// 01/08: 2 · 02/08: 0 · 03/08: 3 (uma às 23:59 GMT) · 04/08: 1. Uma detecção fora do período (31/07) não entra.
const REGISTROS = [
  reg('a', '2026-08-01T03:00:00Z'), reg('b', '2026-08-01T17:00:00Z'),
  reg('c', '2026-08-03T00:00:00Z', -12.1, -56.2), reg('d', '2026-08-03T12:00:00Z'), reg('e', '2026-08-03T23:59:00Z', -11.9, -55.9),
  reg('f', '2026-08-04T04:00:00Z'),
];

test('um quadro por dia GMT do período, com o dia e o acumulado', () => {
  const r = montarReproducao([...REGISTROS, reg('x', '2026-07-31T23:00:00Z')], '2026-08-01', '2026-08-04');
  assert.deepEqual(r.dias, ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04']);
  assert.deepEqual(r.quadros.map((q) => [q.doDia, q.acumuladas]), [[2, 2], [0, 2], [3, 5], [1, 6]]);
  assert.equal(r.total, 6);
  // A soma dos quadros é o total do recorte (os registros do período).
  assert.equal(r.quadros.reduce((s, q) => s + q.doDia, 0), REGISTROS.length);
});

test('faixas de idade: só o dia atual em destaque', () => {
  assert.deepEqual([0, 1, 2, 3, 6, 7, 30].map(faixaIdade), [0, 1, 1, 2, 2, 3, 3]);
});

test('dias sem cobertura comprovada: lacuna conhecida e incidência indeterminada', () => {
  const disp = { dias: [
    { dia: '2026-08-01', classe: 'sem_evidencia_de_lacuna' }, { dia: '2026-08-02', classe: 'incidencia_indeterminada' },
    { dia: '2026-08-03', classe: 'lacuna_conhecida' },
  ] };
  assert.deepEqual([...diasSemCobertura(disp)], [['2026-08-02', 'incidencia_indeterminada'], ['2026-08-03', 'lacuna_conhecida']]);
  assert.equal(diasSemCobertura({ dias: null }).size, 0);
});

test('ficha: total, dias, primeiro e último, pico, cobertura e extensão', () => {
  const sem = new Map([['2026-08-02', 'incidencia_indeterminada']]);
  const r = resumirFicha(REGISTROS, { inicio: '2026-08-01', fim: '2026-08-04' }, sem);
  assert.equal(r.total, 6);
  assert.equal(r.diasPeriodo, 4);
  assert.equal(r.diasComDeteccao, 3);
  assert.deepEqual([r.primeiro, r.ultimo], ['2026-08-01', '2026-08-04']);
  assert.deepEqual(r.pico, { dia: '2026-08-03', total: 3 });
  assert.deepEqual(r.semCobertura, ['2026-08-02']);
  // Latitudes de -12,1 a -11,9: 0,2° ≈ 22,3 km.
  assert.equal(Math.round(r.extensaoKm.norteSul * 10) / 10, 22.3);
  const s = sinteseDeterministica(r, 'Município A', { inicio: '2026-08-01', fim: '2026-08-04' });
  assert.equal(s, 'Entre 01/08/2026 e 04/08/2026 (4 dias GMT), Município A tem 6 detecções de calor em 3 dias, da primeira em 01/08/2026 à última em 04/08/2026. O maior número em um dia foi 3, em 03/08/2026. 1 dia tem cobertura não comprovada. Detecções não comprovam incêndio, dano, autoria ou infração.');
});

test('roteiro conforme o contexto', () => {
  const tiFora = roteiroAveriguacao({ areas: { estado: 'lidas', areas: [{ nome: 'TI X', classe: 'terra_indigena', deteccoes: 4 }], fora: 2 }, persistencia: true, semCobertura: 1, total: 6 });
  assert.ok(tiFora.some((p) => p.includes('CAR/SIMCAR') && p.includes('autorização de queima')));
  assert.ok(tiFora.some((p) => p.includes('FUNAI')));
  assert.ok(!tiFora.some((p) => p.includes('órgão gestor')));
  assert.ok(tiFora.some((p) => p.startsWith('Persistência')));
  assert.ok(tiFora.some((p) => p.includes('VIIRS')));
  const uc = roteiroAveriguacao({ areas: { estado: 'lidas', areas: [{ nome: 'Parque Y', classe: 'protecao_integral', deteccoes: 6 }], fora: 0 }, persistencia: false, semCobertura: 0, total: 6 });
  assert.ok(uc.some((p) => p.includes('órgão gestor')));
  assert.ok(!uc.some((p) => p.includes('CAR/SIMCAR do local')));
  const semAreas = roteiroAveriguacao({ areas: { estado: 'falha' }, persistencia: false, semCobertura: 0, total: 6 });
  assert.match(semAreas[0], /não conferidas/);
});
