// Ciclo 013 (issue #115) — `RQ_GEMINI_MODELO_RESERVA`: só vale exatamente o modelo reserva, sem alias; ausente ou com
// outro valor, a reserva fica desligada e a IA continua ligada como antes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerConfigServidor, MODELO_RESERVA } from '../../servidor/config.ts';

const BASE = {
  RQ_IA_HABILITADA: 'true', RQ_SUPABASE_URL: 'http://127.0.0.1:54321', RQ_SUPABASE_CHAVE_PUBLICAVEL: 'publica',
  RQ_GEMINI_CHAVE: 'ficticia', RQ_GEMINI_MODELO: 'gemini-3.1-flash-lite',
};

test('reserva ligada só com o modelo exato', () => {
  assert.equal(MODELO_RESERVA, 'gemini-3.5-flash');
  const c = lerConfigServidor({ ...BASE, RQ_GEMINI_MODELO_RESERVA: 'gemini-3.5-flash' });
  assert.equal(c.habilitada, true);
  assert.equal(c.gemini.modeloReserva, 'gemini-3.5-flash');
});

test('reserva ausente, vazia, com alias ou outro modelo: desligada, e a IA continua ligada', () => {
  for (const valor of [undefined, '', 'gemini-flash-latest', 'gemini-3.5-flash ', 'GEMINI-3.5-FLASH', 'gemini-3.1-flash-lite']) {
    const c = lerConfigServidor({ ...BASE, RQ_GEMINI_MODELO_RESERVA: valor });
    assert.equal(c.habilitada, true, String(valor));
    assert.equal('modeloReserva' in c.gemini, false, String(valor));
  }
});

test('a reserva não liga a IA desligada', () => {
  assert.deepEqual(lerConfigServidor({ RQ_GEMINI_MODELO_RESERVA: 'gemini-3.5-flash' }), { habilitada: false });
});
