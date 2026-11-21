import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destinoDoPedido, escolherRecorte, montarPedido, IDS_PERGUNTAS } from '../../src/agentes.ts';
const ctx = { carga: { id: 1, identidade: 'a'.repeat(64) }, janela: { inicio: '2026-01-01', fim: '2026-01-31' }, municipio: null, lente: null, destaque: null, comparacao: null };
test('perguntas usam o recorte aplicado, inclusive estado sem lente, sem texto livre', () => {
  assert.equal(IDS_PERGUNTAS.length, 5);
  for (const p of ['panorama', 'padroes', 'cuidados', 'proximos']) {
    assert.deepEqual(montarPedido(p, ctx), { pergunta_id: p, carga: ctx.carga, recorte: { tipo: 'selecao', janela: ctx.janela, municipio: null, lente: null } });
  }
  assert.match(escolherRecorte('mudanca', ctx).indisponivel, /Compare dois períodos/);
});
test('comparação não escolhe lado implicitamente e municípios não admitem perguntas', () => {
  const c = { ...ctx, comparacao: { modo: 'periodos', a: ctx.janela, b: ctx.janela } };
  for (const p of ['panorama', 'padroes', 'proximos']) assert.match(escolherRecorte(p, c).indisponivel, /período único/);
  for (const p of ['mudanca', 'cuidados']) assert.equal(escolherRecorte(p, c).recorte.tipo, 'periodos');
  for (const p of IDS_PERGUNTAS) assert.match(escolherRecorte(p, { ...ctx, comparacao: { modo: 'municipios', a: 1, b: 2 } }).indisponivel, /Saia da comparação/);
  assert.deepEqual(destinoDoPedido('cuidados', ctx, montarPedido('cuidados', ctx).recorte), { aba: 'municipios', destaque: false });
  assert.deepEqual(destinoDoPedido('mudanca', c, montarPedido('mudanca', c).recorte), { aba: 'comparacao', destaque: false });
});

test('comparação incompleta não vira período único implicitamente', () => {
  for (const p of IDS_PERGUNTAS) assert.match(escolherRecorte(p, { ...ctx, comparacaoIncompleta: true }).indisponivel, /comparação válida/);
});
