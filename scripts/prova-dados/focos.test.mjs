import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { instanteGmt, lerFocos, mesDoInstante } from './focos.mjs';

const gmt = (t) => mesDoInstante(instanteGmt(t), 0);
const cuiaba = (t) => mesDoInstante(instanteGmt(t), -4);

// [instante GMT, mês em GMT, mês no horário de Cuiabá (UTC−4)], calculados à mão.
const TRANSICOES = [
  ['2026-07-31 23:59:59', null, null],
  ['2026-08-01 00:00:00', '2026-08', null],
  ['2026-08-01 03:59:59', '2026-08', null],
  ['2026-08-01 04:00:00', '2026-08', '2026-08'],
  ['2026-08-31 23:59:59', '2026-08', '2026-08'],
  ['2026-09-01 00:00:00', '2026-09', '2026-08'],
  ['2026-09-01 03:59:59', '2026-09', '2026-08'],
  ['2026-09-01 04:00:00', '2026-09', '2026-09'],
  ['2026-09-30 23:59:59', '2026-09', '2026-09'],
  ['2026-10-01 00:00:00', '2026-10', '2026-09'],
  ['2026-10-01 03:59:59', '2026-10', '2026-09'],
  ['2026-10-01 04:00:00', '2026-10', '2026-10'],
  ['2026-10-31 23:59:59', '2026-10', '2026-10'],
  ['2026-11-01 00:00:00', null, '2026-10'],
  ['2026-11-01 03:59:59', null, '2026-10'],
  ['2026-11-01 04:00:00', null, null],
];

test('mês em GMT e em UTC−4 nas transições do início, de cada virada e do fim do trimestre', () => {
  for (const [t, g, c] of TRANSICOES) {
    assert.equal(gmt(t), g, `GMT ${t}`);
    assert.equal(cuiaba(t), c, `Cuiabá ${t}`);
  }
});

test('data_hora_gmt inválida é recusada', () => {
  assert.throws(() => instanteGmt('2026-09-01T00:00:00Z'), /inválida/);
  assert.throws(() => instanteGmt('01/09/2026 00:00'), /inválida/);
});

test('lerFocos: espaços antes dos números, aspas com vírgula, linhas vazias e CRLF', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'rq-focos-'));
  const arquivo = path.join(dir, 'f.csv');
  await writeFile(
    arquivo,
    'id,lat,lon,data_hora_gmt,satelite,municipio,estado,pais,municipio_id,estado_id,pais_id\r\n' +
      'a1,  -9.100000, -60.200000,2026-09-01 04:00:00,AQUA_M-T,"SÃO, X",MATO GROSSO,Brasil,5103254,51,33\r\n' +
      '\r\n' +
      'a2,-9.5,-60.5,2026-09-02 10:30:00, GOES-19 ,Y,MATO GROSSO,Brasil,5103254,51,33\r\n',
  );
  const lidos = [];
  for await (const f of lerFocos(arquivo)) lidos.push(f);
  assert.equal(lidos.length, 2);
  assert.deepEqual(lidos[0], {
    id: 'a1', lat: -9.1, lon: -60.2, ms: Date.UTC(2026, 8, 1, 4), dia: '2026-09-01', satelite: 'AQUA_M-T', municipioId: '5103254', estadoId: '51',
  });
  assert.equal(lidos[1].satelite, 'GOES-19');
  await writeFile(arquivo, 'id,lat\n1,2\n');
  await assert.rejects(async () => { for await (const _ of lerFocos(arquivo)); }, /ausente/);
  await writeFile(arquivo, 'id,lat,lon,data_hora_gmt,satelite,municipio,estado,pais,municipio_id,estado_id\nx,abc,1,2026-09-01 00:00:00,A,B,C,D,E,F\n');
  await assert.rejects(async () => { for await (const _ of lerFocos(arquivo)); }, /Coordenada inválida/);
  await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
});
