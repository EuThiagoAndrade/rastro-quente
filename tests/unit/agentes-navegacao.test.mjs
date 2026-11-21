import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destinoDoPedido, escolherRecorte } from '../../src/agentes.ts';

const ctx = { carga: { id: 1, identidade: 'ficticia' }, janela: { inicio: '2026-01-01', fim: '2026-01-31' }, municipio: 1, lente: { tipo: 'recorrencia' }, destaque: { id: 'a', rotulo: 'Lugar fictício', municipios: [1] }, comparacao: null };
const destino = (tipo, c) => destinoDoPedido(tipo, c, escolherRecorte(tipo, c).recorte);
test('destinos acompanham o recorte efetivo do pedido', () => {
  assert.deepEqual(destino('destaque', ctx), { aba: 'destaques', destaque: true });
  assert.deepEqual(destino('lacunas', ctx), { aba: 'destaques', destaque: true });
  assert.deepEqual(destino('lacunas', { ...ctx, destaque: { ...ctx.destaque, municipios: [] } }), { aba: 'municipios', destaque: false });
  assert.deepEqual(destino('livre', { ...ctx, destaque: null }), { aba: 'destaques', destaque: false });
  assert.deepEqual(destino('livre', { ...ctx, lente: null, destaque: null }), { aba: 'municipios', destaque: false });
  const comparacao = { ...ctx, comparacao: { modo: 'periodos', a: ctx.janela, b: ctx.janela } };
  assert.deepEqual(destino('livre', comparacao), { aba: 'comparacao', destaque: false });
});
