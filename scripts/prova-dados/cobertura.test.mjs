import assert from 'node:assert/strict';
import test from 'node:test';
import { cobertura, diasDoIntervalo } from './cobertura.mjs';

const dias = diasDoIntervalo('2026-08-01', '2026-09-01'); // 31 dias

// Exemplo de D7 do plano, com dois satélites X e Y (fictícios):
// dia 12: X tem 1 registro e um aviso de lacuna parcial; dia 20: lacuna em X e em Y; dia 25: incidência indeterminada em Y.
// Resultado esperado: C-d = 3 (dias 12, 20 e 25) e C-p = 4 (12-X, 20-X, 20-Y, 25-Y).
const AVISOS = [
  { data: '2026-08-12', satelites: ['X'], classe: 'lacuna_conhecida', evidencia: 'faixa toca parte do polígono' },
  { data: '2026-08-20', satelites: ['X', 'Y'], classe: 'lacuna_conhecida', evidencia: 'faixa cobre o polígono' },
  { data: '2026-08-25', satelites: ['Y'], classe: 'incidencia_indeterminada', evidencia: 'imagem sem resolução' },
  { data: '2026-08-05', satelites: ['X'], classe: 'sem_incidencia', evidencia: 'faixa toca o retângulo mas não o polígono' },
];
const DETECCOES = { X: { '2026-08-12': 1, '2026-08-03': 2 }, Y: {} };

test('C-d e C-p do exemplo de D7', () => {
  const c = cobertura({ dias, satelites: ['X', 'Y'], deteccoes: DETECCOES, avisos: AVISOS });
  assert.deepEqual(c.C, { d: 3, p: 4 });
});

test('detecção e disponibilidade são independentes; tabela cruzada de X', () => {
  const { porSatelite } = cobertura({ dias, satelites: ['X', 'Y'], deteccoes: DETECCOES, avisos: AVISOS });
  const x = porSatelite.X;
  const dia = (d) => x.dias.find((l) => l.dia === d);
  assert.deepEqual(dia('2026-08-12'), { dia: '2026-08-12', registros: 1, deteccao: 'com_registro', disponibilidade: 'lacuna_conhecida' });
  assert.equal(dia('2026-08-20').deteccao, 'sem_registro');
  assert.equal(dia('2026-08-20').disponibilidade, 'lacuna_conhecida');
  // aviso cuja faixa toca o retângulo mas não o polígono: sem incidência, sem lacuna e sem prova de cobertura
  assert.equal(dia('2026-08-05').disponibilidade, 'sem_evidencia_de_lacuna');
  assert.deepEqual(x.cruzada, {
    'com_registro|lacuna_conhecida': 1,
    'com_registro|sem_evidencia_de_lacuna': 1,
    'sem_registro|lacuna_conhecida': 1,
    'sem_registro|sem_evidencia_de_lacuna': 28,
  });
  assert.equal(Object.values(x.cruzada).reduce((s, v) => s + v, 0), 31);
  // sem registro e sem evidência de lacuna é cobertura não comprovada, nunca "coberto"
  assert.equal(x.coberturaNaoComprovada, 28);
});

test('registro de outro satélite não muda os atributos de um satélite de P', () => {
  const { porSatelite } = cobertura({ dias, satelites: ['X'], deteccoes: { X: {}, Y: { '2026-08-12': 9 } }, avisos: [] });
  assert.equal(porSatelite.X.dias.find((l) => l.dia === '2026-08-12').deteccao, 'sem_registro');
});

test('com um só satélite C-d = C-p; sem avisos C = 0; classe inválida é recusada', () => {
  const um = cobertura({ dias, satelites: ['X'], deteccoes: {}, avisos: AVISOS });
  assert.deepEqual(um.C, { d: 2, p: 2 });
  assert.deepEqual(cobertura({ dias, satelites: ['X'], deteccoes: {}, avisos: [] }).C, { d: 0, p: 0 });
  assert.throws(() => cobertura({ dias, satelites: ['X'], deteccoes: {}, avisos: [{ data: '2026-08-01', satelites: ['X'], classe: 'talvez' }] }), /classe inválida/);
});

test('dias do intervalo: início inclusivo e fim exclusivo', () => {
  assert.equal(diasDoIntervalo('2026-08-01', '2026-11-01').length, 92);
  assert.deepEqual(diasDoIntervalo('2026-08-30', '2026-09-02'), ['2026-08-30', '2026-08-31', '2026-09-01']);
});
