// Centro da tela (plano 007, item 3): densidade (DS-1, DS-2) e série do período (SR-1 a SR-4). Dados fictícios
// escritos à mão; os valores esperados vêm do plano, não do código. Grade T1: índice = piso de coordenada × 20.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES_DENSIDADE, classeDensidade, densidadePorCelula } from '../../src/densidade.ts';
import { diasDoPeriodo, montarSerie } from '../../src/serie.ts';

const rotulos = (contagens) => contagens.map((n) => CLASSES_DENSIDADE[classeDensidade(n)].rotulo);

test('DS-1: classes fixas nas fronteiras 1, 2, 3, 4, 9, 10, 24 e 25', () => {
  assert.deepEqual(rotulos([1, 2, 3, 4, 9, 10, 24, 25]), ['1', '2–3', '2–3', '4–9', '4–9', '10–24', '10–24', '25 ou mais']);
  assert.equal(rotulos([44])[0], '25 ou mais', 'máximo da carga real (T8)');
});

test('DS-1: a classe vem da contagem por célula, não de um máximo relativo ao recorte', () => {
  // Células: lat −11,52 → −231; −11,48 → −230 (mesma longitude −56,48). Uma célula com 1 e outra com 3.
  const reg = (id, lat) => ({ id_tecnico: id, data_hora_gmt: '2026-10-02T12:00:00Z', latitude: lat, longitude: -56.48, municipio_codigo: 1 });
  const { celulas } = densidadePorCelula([reg('a', -11.52), reg('b', -11.48), reg('c', -11.48), reg('d', -11.48)], '2026-10-01', '2026-10-31');
  const porId = Object.fromEntries(celulas.map((c) => [c.celula.id, [c.contagem, CLASSES_DENSIDADE[c.classe].rotulo]]));
  assert.deepEqual(porId, { 'c-231_-1130': [1, '1'], 'c-230_-1130': [3, '2–3'] });
});

test('DS-2: 7 registros principais e 2 só de sensibilidade somam 7, igual a principal.total', () => {
  const principal = [
    ['p1', '2026-10-01T00:00:00Z', -11.52], ['p2', '2026-10-01T10:00:00Z', -11.52], ['p3', '2026-10-15T12:00:00Z', -11.48],
    ['p4', '2026-10-20T12:00:00Z', -11.42], ['p5', '2026-10-31T03:59:59Z', -11.42], ['p6', '2026-10-31T12:00:00Z', -11.38],
    ['p7', '2026-10-31T23:59:59Z', -11.38],
  ];
  // Só a sensibilidade America/Cuiaba alcança estes dois (depois do fim do período GMT).
  const sensibilidade = [['s1', '2026-11-01T00:00:00Z', -11.52], ['s2', '2026-11-01T03:30:00Z', -11.48]];
  const reg = ([id, instante, lat]) => ({ id_tecnico: id, data_hora_gmt: instante, latitude: lat, longitude: -56.48, municipio_codigo: 1 });
  const resumo = { principal: { total: 7 } };
  const d = densidadePorCelula([...principal, ...sensibilidade].map(reg), '2026-10-01', '2026-10-31');
  assert.equal(d.total, 7);
  assert.equal(d.celulas.reduce((a, c) => a + c.contagem, 0), resumo.principal.total);
  assert.deepEqual(d.celulas.map((c) => c.contagem).sort(), [1, 2, 2, 2]);
});

test('SR-1: período de 31 dias tem 31 barras diárias', () => {
  const s = montarSerie('2026-10-01', '2026-10-31', [{ dia: '2026-10-05', total: 4 }, { dia: '2026-10-31', total: 1 }]);
  assert.equal(s.unidade, 'dia');
  assert.equal(s.barras.length, 31);
  assert.equal(s.barras[4].total, 4);
  assert.equal(s.barras[30].chave, '2026-10-31');
  assert.equal(s.total, 5);
  assert.equal(s.temParcial, false);
});

test('SR-2: 32 dias, de 2026-07-31 a 2026-08-31: 2 barras mensais, julho com * (1 dia), soma = principal.total', () => {
  const serieDiaria = diasDoPeriodo('2026-07-31', '2026-08-31').map((dia, i) => ({ dia, total: i % 3 }));
  const principalTotal = serieDiaria.reduce((a, d) => a + d.total, 0);
  const s = montarSerie('2026-07-31', '2026-08-31', serieDiaria);
  assert.equal(serieDiaria.length, 32);
  assert.equal(s.unidade, 'mes');
  assert.deepEqual(s.barras.map((b) => [b.chave, b.parcial]), [['2026-07', true], ['2026-08', false]]);
  assert.equal(s.barras[0].total, 0, 'julho só com o dia 31 (índice 0 → total 0)');
  assert.equal(s.barras.reduce((a, b) => a + b.total, 0), principalTotal);
  assert.equal(s.total, principalTotal);
  assert.equal(s.temParcial, true);
});

test('SR-3: mês parcial sem nenhuma detecção é barra zero com *, sem texto de lacuna', () => {
  const s = montarSerie('2026-07-20', '2026-08-31', [{ dia: '2026-08-10', total: 3 }]);
  assert.deepEqual(s.barras.map((b) => [b.chave, b.total, b.parcial]), [['2026-07', 0, true], ['2026-08', 3, false]]);
  assert.equal(s.total, 3);
  assert.ok(!Object.keys(s.barras[0]).some((k) => /lacuna|disponib/i.test(k)), 'zero não vira lacuna');
});

test('SR-4: registros só de sensibilidade num dia não entram na série', () => {
  // 2026-11-01 só aparece no envelope America/Cuiaba; o período GMT termina em 2026-10-31.
  const s = montarSerie('2026-10-01', '2026-10-31', [{ dia: '2026-10-31', total: 2 }, { dia: '2026-11-01', total: 5 }]);
  assert.equal(s.barras.length, 31);
  assert.ok(!s.barras.some((b) => b.chave === '2026-11-01'));
  assert.equal(s.total, 2);
  const m = montarSerie('2026-09-01', '2026-10-31', [{ dia: '2026-10-31', total: 2 }, { dia: '2026-11-01', total: 5 }]);
  assert.deepEqual(m.barras.map((b) => [b.chave, b.total]), [['2026-09', 0], ['2026-10', 2]]);
});
