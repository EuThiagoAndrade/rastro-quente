import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { selecionar, tabelaCandidatos } from './candidatos.mjs';
import { CONFIG } from './contar.mjs';
import { lerFocos } from './focos.mjs';
import { criarTerritorio } from './geo.mjs';

const FIXTURES = new URL('../../tests/fixtures/prova-dados/', import.meta.url);
const CFG = { ...CONFIG, municipioAlvo: '9999999', estadoAlvo: '99' };

async function rodar(opcoes) {
  const t = criarTerritorio(JSON.parse(await readFile(new URL('colniza_ficticio.geojson', FIXTURES), 'utf8')));
  return selecionar(lerFocos(new URL('focos_ficticio.csv', FIXTURES)), t, CFG, opcoes);
}

// Na fixture, os pontos de P mais próximos do limite (distância 0) são os de divisa d5 (aresta) e d6 (vértice).
test('candidatos: divisa, fora da divisa, meses e bordas de mês, com o motivo de cada um', async () => {
  const { candidatos, totais } = await rodar({ naDivisa: 2, foraDaDivisa: 1, porMes: 1, auxiliares: 1, margemGraus: 20 });
  assert.deepEqual(totais, { P_dentro: 17, P_fora_na_margem: 3, NOAA20_dentro: 1 });
  const por = (id) => candidatos.find((c) => c.id === id);
  assert.match(por('d5').motivo, /mais próximos da divisa/);
  assert.match(por('d6').motivo, /mais próximos da divisa/);
  assert.equal(por('d5').distanciaM, 0);
  // o fora mais próximo do limite é d4 (centro do buraco, ~110,6 km); d3 e d7 ficam mais longe
  assert.ok(candidatos.some((c) => c.script === 'fora' && /P fora/.test(c.motivo)));
  // borda de mês: 2026-08-01 e 2026-09-01 têm registros de P na fixture
  assert.ok(candidatos.some((c) => /borda de mês/.test(c.motivo) && c.dia === '2026-08-01'));
  assert.ok(candidatos.some((c) => /NOAA-20/.test(c.motivo)));
  // r03 (2026-07-31) e r13 a r15 (novembro) ficam fora das janelas de GMT
  assert.ok(!candidatos.some((c) => ['r03', 'r13', 'r14', 'r15'].includes(c.id)));
});

test('seleção determinística e tabela com todas as colunas', async () => {
  const a = await rodar({});
  const b = await rodar({});
  assert.deepEqual(a, b);
  const t = tabelaCandidatos(a.candidatos).split('\n');
  assert.equal(t.length, a.candidatos.length + 2);
  assert.match(t[0], /id INPE.*instante GMT.*satélite.*polígono \(script\).*por que foi sugerido/);
});
