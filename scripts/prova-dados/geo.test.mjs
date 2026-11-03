import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { classificarPonto, criarTerritorio } from './geo.mjs';

const FIXTURE = new URL('../../tests/fixtures/prova-dados/colniza_ficticio.geojson', import.meta.url);

// Polígono fictício: quadrado (0,0)-(10,10) com buraco (4,4)-(6,6) e um segundo quadrado (12,0)-(14,2).
// Pontos escritos como [longitude, latitude]; resultados calculados à mão.
const CASOS = [
  [[2, 2], 'dentro'],
  [[9.999, 9.999], 'dentro'],
  [[13, 1], 'dentro'], // segundo polígono do multipolígono
  [[5, 5], 'fora'], // dentro do buraco
  [[11, 5], 'fora'], // entre os dois polígonos
  [[-1, 5], 'fora'],
  [[5, 11], 'fora'],
  [[0, 0], 'borda'], // vértice
  [[10, 5], 'borda'], // aresta
  [[5, 0], 'borda'],
  [[4, 5], 'borda'], // borda do buraco
  [[6, 6], 'borda'], // vértice do buraco
  [[12, 1], 'borda'], // aresta do segundo polígono
  [[10.000001, 5], 'fora'],
];

test('ponto no polígono: interior, buraco, multipolígono, vértice e divisa', async () => {
  const t = criarTerritorio(JSON.parse(await readFile(FIXTURE, 'utf8')));
  assert.deepEqual(t.bbox, [0, 0, 14, 10]);
  assert.equal(t.vertices, 15);
  for (const [[lon, lat], esperado] of CASOS) {
    assert.equal(classificarPonto(lon, lat, t), esperado, `(${lon}, ${lat})`);
  }
});

test('triângulo com ponto na altura de um vértice (caso do ray casting)', () => {
  const t = criarTerritorio({ type: 'Polygon', coordinates: [[[0, 0], [4, 2], [0, 4], [0, 0]]] });
  assert.equal(classificarPonto(1, 2, t), 'dentro'); // mesma latitude do vértice (4,2)
  assert.equal(classificarPonto(5, 2, t), 'fora');
  assert.equal(classificarPonto(4, 2, t), 'borda');
});

test('geometria não suportada e GeoJSON vazio são recusados', () => {
  assert.throws(() => criarTerritorio({ type: 'Point', coordinates: [0, 0] }), /não suportada/);
  assert.throws(() => criarTerritorio({ type: 'FeatureCollection', features: [] }), /sem polígonos/);
});

test('distância ao limite em metros (cálculo à mão: 0,01° de longitude no equador ≈ 1113,2 m)', async () => {
  const { distanciaAoLimiteM } = await import('./geo.mjs');
  const t = criarTerritorio({ type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] });
  // ponto (0,5; 0,01): a aresta mais próxima é y = 0, a 0,01° de latitude = 1105,74 m
  assert.ok(Math.abs(distanciaAoLimiteM(0.5, 0.01, t) - 1105.74) < 0.5);
  assert.ok(Math.abs(distanciaAoLimiteM(0.01, 0.5, t) - 1113.2) < 1);
  assert.equal(distanciaAoLimiteM(0, 0, t), 0); // vértice
  assert.ok(Math.abs(distanciaAoLimiteM(-0.01, 0.5, t) - 1113.2) < 1); // fora também mede ao limite
});
