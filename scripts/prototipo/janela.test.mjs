import assert from 'node:assert/strict';
import test from 'node:test';
import { contarConsulta, desvioFixo, envelopeDaJanela, escolherJanela, intervalosDaConsulta, mesCompleto } from './janela.mjs';

const AGORA = Date.parse('2026-11-07T20:00:00Z');
const publicado = (lastModified) => ({ status: 200, lastModified });

function sondasAte(ultimo, n, lastModifiedDe) {
  const s = {};
  let [a, m] = ultimo.split('-').map(Number);
  for (let i = 0; i < n; i += 1) {
    const mes = `${a}-${String(m).padStart(2, '0')}`;
    s[mes] = publicado(lastModifiedDe(mes));
    m -= 1;
    if (m === 0) [a, m] = [a - 1, 12];
  }
  return s;
}
// Publicação no dia 1 do mês seguinte, como nos arquivos do INPE.
const noMesSeguinte = (mes) => {
  const [a, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(m === 12 ? a + 1 : a, m === 12 ? 0 : m, 1, 23, 56)).toUTCString();
};

test('mês em formação não entra; janela são os 12 meses completos anteriores', () => {
  const s = sondasAte('2026-10', 14, noMesSeguinte);
  s['2026-11'] = publicado('Sat, 07 Nov 2026 17:56:13 GMT');
  assert.equal(mesCompleto('2026-11', s['2026-11'], AGORA), false);
  assert.equal(mesCompleto('2026-10', s['2026-10'], AGORA), true);
  const j = escolherJanela(s, AGORA);
  assert.equal(j.inicio, '2025-11-01');
  assert.equal(j.fim, '2026-11-01');
  assert.equal(j.meses.length, 12);
  assert.equal(j.meses[0], '2025-11');
});

test('reprocessamento posterior ao fim do mês continua aceito', () => {
  const s = sondasAte('2026-10', 12, noMesSeguinte);
  s['2026-01'] = publicado('Fri, 17 Jul 2026 14:51:14 GMT');
  assert.equal(escolherJanela(s, AGORA).inicio, '2025-11-01');
});

test('mês ausente no meio não é pulado: falha em vez de substituir', () => {
  const s = sondasAte('2026-10', 14, noMesSeguinte);
  s['2026-03'] = { status: 404, lastModified: null };
  assert.throws(() => escolherJanela(s, AGORA), /2026-03 ausente ou incompleto/);
});

test('consulta de outubro: principal GMT e sensibilidade deslocada 4 h', () => {
  const r = intervalosDaConsulta('2026-10-01', '2026-10-31');
  assert.deepEqual(r.principal.map((ms) => new Date(ms).toISOString()), ['2026-10-01T00:00:00.000Z', '2026-11-01T00:00:00.000Z']);
  assert.deepEqual(r.sensibilidade.map((ms) => new Date(ms).toISOString()), ['2026-10-01T04:00:00.000Z', '2026-11-01T04:00:00.000Z']);
  assert.equal(r.desvioHoras, -4);
});

test('virada de ano e ano bissexto com fim exclusivo', () => {
  const v = intervalosDaConsulta('2025-12-31', '2026-01-01');
  assert.deepEqual(v.principal.map((ms) => new Date(ms).toISOString()), ['2025-12-31T00:00:00.000Z', '2026-01-02T00:00:00.000Z']);
  const b = intervalosDaConsulta('2028-02-01', '2028-02-29');
  assert.equal(new Date(b.principal[1]).toISOString(), '2028-03-01T00:00:00.000Z');
  assert.throws(() => intervalosDaConsulta('2026-10-02', '2026-10-01'), /invertido/);
});

test('horário de verão (Cuiabá, 2018) é detectado e para', () => {
  assert.equal(desvioFixo('2025-11-01', '2026-11-02'), -4);
  assert.throws(() => desvioFixo('2018-10-01', '2018-12-01'), /desvios/);
});

test('envelope da janela: quatro horas depois do fim, nenhum antes do início', () => {
  const e = envelopeDaJanela({ inicio: '2025-11-01', fim: '2026-11-01' });
  assert.equal(e.antes, null);
  assert.deepEqual(e.depois, { inicio: '2026-11-01T00:00:00.000Z', fim: '2026-11-01T04:00:00.000Z' });
});

test('exemplo aceito: principal 100, sensibilidade 100 − 3 + 5 = 102, diferença +2; envelope fora do principal', () => {
  const ms = (iso) => Date.parse(iso);
  const registros = [];
  for (let i = 0; i < 3; i += 1) registros.push({ ms: ms(`2026-10-01T0${i}:30:00Z`), escopo: 'principal' });
  for (let i = 0; i < 97; i += 1) registros.push({ ms: ms('2026-10-15T18:00:00Z'), escopo: 'principal' });
  for (let i = 0; i < 5; i += 1) registros.push({ ms: ms(`2026-11-01T0${i % 4}:10:00Z`), escopo: 'envelope' });
  registros.push({ ms: ms('2026-11-01T04:00:00Z'), escopo: 'envelope' }); // fim exclusivo da sensibilidade
  const r = contarConsulta(registros, '2026-10-01', '2026-10-31');
  assert.equal(r.principal.total, 100);
  assert.equal(r.sensibilidade.total, 102);
  assert.equal(r.diferenca, 2);
  assert.equal(r.sensibilidade.fuso, 'America/Cuiaba');
});
