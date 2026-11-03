import assert from 'node:assert/strict';
import test from 'node:test';
import { desviosNoPeriodo } from './fuso.mjs';

test('Cuiabá é UTC−4 fixo de 2026-08-01 a 2026-11-01', () => {
  assert.deepEqual(desviosNoPeriodo('2026-08-01', '2026-11-02'), ['GMT-04:00']);
});

test('a conferência detecta horário de verão quando ele existe (verão de 2018 em Cuiabá)', () => {
  assert.deepEqual(desviosNoPeriodo('2018-10-01', '2018-12-01').sort(), ['GMT-03:00', 'GMT-04:00']);
});
