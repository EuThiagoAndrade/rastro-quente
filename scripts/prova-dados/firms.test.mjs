import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { contarFirms, lerFirms } from './firms.mjs';
import { criarTerritorio } from './geo.mjs';

const F1 = new URL('../../tests/fixtures/prova-dados/firms_ficticio_1.csv', import.meta.url);
const F2 = new URL('../../tests/fixtures/prova-dados/firms_ficticio_2.csv', import.meta.url);
const GEOJSON = new URL('../../tests/fixtures/prova-dados/colniza_ficticio.geojson', import.meta.url);

test('lerFirms: acq_time sem zeros à esquerda vira HHMM', async () => {
  const lidos = [];
  for await (const r of lerFirms(F1)) lidos.push(r);
  assert.equal(lidos.length, 4);
  assert.deepEqual(lidos.map((r) => r.hhmm), ['0457', '1734', '0012', '0100']);
  assert.equal(lidos[0].chave, '2|2|2026-08-05|0457');
});

// Calculado à mão: arquivo 1 (f1 dentro em agosto; f2 dentro em setembro; f3 na divisa em setembro; f4 no buraco em setembro)
// e arquivo 2 (f5 fora do polígono em outubro; f6 em 2026-11-01; f7 repete f1 de outro arquivo).
test('contarFirms: polígono, divisa, retângulo, fora do trimestre e repetidos entre janelas', async () => {
  const t = criarTerritorio(JSON.parse(await readFile(GEOJSON, 'utf8')));
  const r = await contarFirms([F1, F2], t);
  assert.deepEqual(r.porMes, { '2026-08': 2, '2026-09': 2, '2026-10': 0 });
  assert.deepEqual(r.retangulo, { '2026-08': 2, '2026-09': 3, '2026-10': 1 });
  assert.equal(r.foraDoTrimestre, 1);
  assert.equal(r.repetidosEntreJanelas, 1);
  assert.equal(r.pontosNaBorda, 1);
});
