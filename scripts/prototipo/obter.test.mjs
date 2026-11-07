import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { garantirItem, itensDaJanela } from './obter.mjs';
import { instanteValido } from './leitura.mjs';
import { compararContagens } from './conferir.mjs';
import { atribuir, criarMalhaMunicipal } from './territorio.mjs';

const resposta = (texto, cabecalhos = {}) => new Response(texto, { status: 200, headers: { 'content-length': String(Buffer.byteLength(texto)), ...cabecalhos } });

test('itens da janela: 12 mensais, envelope diário, conferência e fontes territoriais', () => {
  const meses = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
  const itens = itensDaJanela({ meses }, { antes: null, depois: { inicio: '2026-11-01T00:00:00.000Z', fim: '2026-11-01T04:00:00.000Z' } }, '2026-11-07T00:00:00Z');
  assert.equal(itens.filter((i) => i.papel === 'principal').length, 12);
  assert.equal(itens.find((i) => i.papel === 'envelope').url.endsWith('focos_diario_br_20261101.csv'), true);
  assert.equal(itens.find((i) => i.papel === 'conferencia').destino, 'inpe/focos_mensal_br_202611_parcial_20261107.csv');
  assert.ok(itens.every((i) => !/key|token|senha/i.test(i.url)));
});

test('obtenção registra hash e recusa divergência', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'prototipo-'));
  try {
    const item = { id: 't', url: 'https://exemplo.invalid/a.csv', destino: 'x/a.csv', sha256: null };
    const r = await garantirItem(item, dir, { fetchFn: async () => resposta('abc', { 'last-modified': 'Sun, 01 Nov 2026 00:00:00 GMT' }), agora: () => new Date('2026-11-07T00:00:00Z') });
    assert.equal(r.estado, 'baixado');
    assert.equal(item.sha256, createHash('sha256').update('abc').digest('hex'));
    assert.equal(item.tamanho, 3);
    assert.equal(await readFile(path.join(dir, 'x/a.csv'), 'utf8'), 'abc');
    assert.equal((await garantirItem(item, dir)).estado, 'inalterado');
    const outro = { ...item, destino: 'x/b.csv' };
    await assert.rejects(garantirItem(outro, dir, { fetchFn: async () => resposta('xyz') }), /SHA-256 divergente/);
    await assert.rejects(garantirItem({ ...item, destino: 'x/c.csv', sha256: null }, dir, { fetchFn: async () => new Response('ab', { status: 200, headers: { 'content-length': '5' } }) }), /incompleto/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('data/hora inexistente é inválida', () => {
  assert.equal(instanteValido('2026-02-30 10:00:00'), null);
  assert.equal(instanteValido('2026-10-01 24:00:00'), null);
  assert.equal(instanteValido('2028-02-29 23:59:59'), Date.UTC(2028, 1, 29, 23, 59, 59));
});

test('malha com código repetido é recusada; ponto fora do retângulo não é testado', () => {
  const f = (codarea) => ({ type: 'Feature', properties: { codarea }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] } });
  assert.throws(() => criarMalhaMunicipal({ type: 'FeatureCollection', features: [f('1234567'), f('1234567')] }), /repetido/);
  const malha = criarMalhaMunicipal({ type: 'FeatureCollection', features: [f('1234567')] });
  assert.deepEqual(atribuir(malha, 5, 5), { tipo: 'fora' });
  assert.deepEqual(atribuir(malha, 0.5, 0.5), { tipo: 'municipio', codigo: '1234567', posicao: 'dentro' });
});

test('comparação de contagens aponta diferenças por chave', () => {
  assert.deepEqual(compararContagens({ a: 1, b: 2 }, { a: 1, b: 3, c: 1 }), [{ chave: 'b', esperado: 2, obtido: 3 }, { chave: 'c', esperado: 0, obtido: 1 }]);
});
