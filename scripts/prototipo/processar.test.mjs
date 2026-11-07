import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { criarTerritorio } from '../prova-dados/geo.mjs';
import { agregar, conferirEnvelope, medirMalha, recortar, relatorioIdFonte } from './processar.mjs';
import { criarMalhaMunicipal } from './territorio.mjs';

const FIX = (nome) => new URL(`../../tests/fixtures/prototipo/${nome}`, import.meta.url);
const json = async (nome) => JSON.parse(await readFile(FIX(nome), 'utf8'));
const caminho = (nome) => decodeURIComponent(FIX(nome).pathname).replace(/^\/([A-Za-z]:)/, '$1');

async function rodar(fontes) {
  const malha = criarMalhaMunicipal(await json('municipios_ficticios.geojson'));
  const contornoEstadual = criarTerritorio(await json('contorno_ficticio.geojson'));
  return recortar({ fontesFocos: fontes, malha, contornoEstadual, satelite: 'AQUA_M-T', estado: '99', envelope: { inicio: '2026-11-01T00:00:00.000Z', fim: '2026-11-01T04:00:00.000Z' } });
}

const MENSAL = { id: 'mensal-202610', papel: 'principal', sha256: 'a'.repeat(64), arquivo: caminho('focos_ficticio_202610.csv'), mes: '2026-10' };
const DIARIO = { id: 'diario-20261101', papel: 'envelope', sha256: 'b'.repeat(64), arquivo: caminho('focos_ficticio_diario_20261101.csv') };

// Valores esperados calculados à mão a partir das fixtures (comentários das linhas no teste).
test('recorte: município único, divergências, buraco, divisa ambígua, borda, mês e envelope', async () => {
  const r = await rodar([MENSAL, DIARIO]);
  assert.deepEqual(r.leitura['mensal-202610'], { linhas: 13, outroSatelite: 1, satelite: 12, invalidas: 0, persistidas: 7, excluidas: { fora_de_mt: 3, ambiguo_aguarda_decisao: 1, fora_do_mes_do_arquivo: 1 } });
  assert.deepEqual(r.leitura['diario-20261101'], { linhas: 3, outroSatelite: 1, satelite: 2, invalidas: 0, persistidas: 1, excluidas: { fora_do_envelope: 1 } });
  const por = Object.fromEntries(['principal', 'envelope'].map((e) => [e, r.registros.filter((x) => x.escopo === e).map((x) => `${x.idFonte}:${x.municipio}:${x.posicao}`)]));
  assert.deepEqual(por.principal, ['f01:9900001:dentro', 'f02:9900002:dentro', 'f05:9900003:borda', 'rep:9900003:dentro', 'rep:9900003:dentro', 'null:9900004:dentro', 'f12:9900003:dentro']);
  assert.deepEqual(por.envelope, ['e01:9900003:dentro']);
  // f04 sobre a divisa X/Y: não escolhe município.
  assert.equal(r.ambiguos.length, 1);
  assert.deepEqual(r.ambiguos[0].municipios.map((m) => m.codigo), ['9900001', '9900002']);
  // f02 (INPE diz Z), f03 (buraco de W) e f13 (vão entre Y e Z, dentro do contorno).
  assert.deepEqual(r.divergencias.contagem, { 'principal:inpe_outro_municipio': 1, 'principal:inpe_no_estado_fora_da_malha': 2, 'principal:no_contorno_estadual_sem_municipio': 2 });
  assert.deepEqual(r.exclusoes, { fora_de_mt: 3, ambiguo_aguarda_decisao: 1, fora_do_mes_do_arquivo: 1, fora_do_envelope: 1 });
  // Identidade técnica: hash da fonte + linha; linhas repetidas continuam distintas.
  const reps = r.registros.filter((x) => x.idFonte === 'rep').map((x) => x.idTecnico);
  assert.deepEqual(reps, [`${'a'.repeat(16)}:6`, `${'a'.repeat(16)}:7`]);
});

test('id_fonte repetido e vazio são mantidos e contabilizados', async () => {
  const r = await rodar([MENSAL]);
  const id = relatorioIdFonte(r.registros);
  assert.equal(id.vazios, 1);
  assert.equal(id.idsRepetidos, 1);
  assert.equal(id.linhasComIdRepetido, 2);
  assert.equal(r.registros.length, 7);
});

test('agregação: envelope só na sensibilidade, nunca no total principal', async () => {
  const r = await rodar([MENSAL, DIARIO]);
  const a = agregar(r.registros, { inicio: '2026-10-01', fim: '2026-11-01', meses: ['2026-10'] }, -4);
  assert.equal(a.total, 7);
  assert.equal(a.envelope, 1);
  assert.deepEqual(a.estadoPorMes, { '2026-10': 7 });
  assert.deepEqual(a.cuiaba.estadoPorMes, { '2026-10': 8 });
  assert.deepEqual(a.diferencaCuiabaMenosGmtPorMes, { '2026-10': 1 });
  assert.deepEqual(a.municipioPorMes, { 9900001: { '2026-10': 1 }, 9900002: { '2026-10': 1 }, 9900003: { '2026-10': 4 }, 9900004: { '2026-10': 1 } });
  assert.equal(a.bordas, 1);
});

test('linha inválida do satélite do recorte é relatada, nunca aceita em silêncio', async () => {
  const r = await rodar([{ ...MENSAL, id: 'invalido', arquivo: caminho('focos_ficticio_invalido.csv') }]);
  assert.deepEqual(r.invalidas.map((x) => `${x.linha}:${x.motivo}`), ['1:latitude_invalida', '2:longitude_invalida', '3:data_hora_gmt_invalida', '4:numero_de_colunas_9_esperado_16']);
  assert.equal(r.registros.length, 1);
});

test('arquivo sem a coluna id é incompatível', async () => {
  await assert.rejects(rodar([{ ...MENSAL, arquivo: caminho('focos_ficticio_sem_id.csv') }]), /coluna "id" ausente/);
});

test('conferência do envelope compara multiconjuntos', () => {
  const r = (id) => ({ idFonte: id, dataHoraGmt: 'x', lat: '1', lon: '2', municipio: '9' });
  assert.equal(conferirEnvelope([], []).identicos, true);
  assert.deepEqual(conferirEnvelope([r('a'), r('a')], [r('a')]), { envelope: 2, conferencia: 1, soNoEnvelope: 1, soNaConferencia: 0, identicos: false });
});

test('medição de malha por município e conjunto', async () => {
  const colecao = await json('municipios_ficticios.geojson');
  const m = medirMalha(colecao, 1036);
  assert.equal(m.municipios, 4);
  assert.equal(m.vertices, 5 + 5 + 5 + 15);
  assert.equal(m.porMunicipio['9900004'].vertices, 15);
  assert.equal(m.bytesPorMunicipio.soma, Object.values(m.porMunicipio).reduce((s, x) => s + x.bytes, 0));
});
