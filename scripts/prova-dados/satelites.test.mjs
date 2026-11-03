import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { dividirLinha, valoresDeSatelite } from './satelites.mjs';

test('dividirLinha respeita aspas e aspas duplas', () => {
  assert.deepEqual(dividirLinha('1,"A, B",x'), ['1', 'A, B', 'x']);
  assert.deepEqual(dividirLinha('1,"diz ""oi""",'), ['1', 'diz "oi"', '']);
});

test('valoresDeSatelite conta por valor, ignora linhas vazias e aceita CRLF', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'rq-sat-'));
  const arquivo = path.join(dir, 'f.csv');
  await writeFile(arquivo, 'id,lat,satelite,municipio\r\n1,0,AQUA_M-T,"X, Y"\r\n\r\n2,0, GOES-19 ,Z\r\n3,0,AQUA_M-T,W\r\n');
  assert.deepEqual(await valoresDeSatelite(arquivo), { 'AQUA_M-T': 2, 'GOES-19': 1 });
  await writeFile(arquivo, 'id,lat\n1,0\n');
  await assert.rejects(valoresDeSatelite(arquivo), /satelite/);
  await rm(dir, { recursive: true, force: true, maxRetries: 5 });
});
