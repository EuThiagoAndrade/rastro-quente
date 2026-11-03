import assert from 'node:assert/strict';
import test from 'node:test';
import { casar, chaveDe } from './casar.mjs';

test('chaveDe arredonda a 3 casas', () => {
  assert.equal(chaveDe('2026-10-12', '1741', -9.12349, -60.9996), '2026-10-12|1741|-9.123|-61.000');
});

test('casar: multiconjunto, só de um lado, só do outro', () => {
  const r = casar(['a', 'a', 'b', 'c'], ['a', 'b', 'b', 'd']);
  assert.equal(r.casados, 2); // a uma vez, b uma vez
  assert.deepEqual(r.soA, ['a', 'c']);
  assert.deepEqual(r.soB, ['b', 'd']);
  assert.deepEqual(casar([], []), { casados: 0, soA: [], soB: [] });
});
