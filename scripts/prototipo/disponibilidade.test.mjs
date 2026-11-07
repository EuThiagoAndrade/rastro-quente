import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { alcanceDoHistorico, classificarMunicipioDia, diasPorClasse, disponibilidadeMunicipal, incidenciaDoAviso, lerInterrupcoesAqua } from './disponibilidade.mjs';
import { criarMalhaMunicipal } from './territorio.mjs';

const malha = criarMalhaMunicipal(JSON.parse(await readFile(new URL('../../tests/fixtures/prototipo/municipios_ficticios.geojson', import.meta.url), 'utf8')));
const [X, Y, Z, W] = malha.municipios;
// Exemplo fictício do plano: falta de AQUA_M-T a oeste de 58,5°O. X inteiro a oeste, Y cortado, Z e W a leste.
const OESTE = { id: 'aviso-oeste', dias: ['2026-10-05'], satelites: ['AQUA_M-T'], delimitacao: { tipo: 'semiplano', eixo: 'lon', lado: 'menor', valor: -58.5 } };
const SEM_AREA = { id: 'aviso-sem-area', dias: ['2026-10-06'], satelites: ['AQUA_M-T'], delimitacao: { tipo: 'nao_delimitada' } };

test('aviso parcial X/Y/Z: lacuna, indeterminada e sem incidência', () => {
  assert.deepEqual(incidenciaDoAviso(OESTE, X), { classe: 'lacuna_conhecida', motivo: 'aviso_abrange_municipio' });
  assert.deepEqual(incidenciaDoAviso(OESTE, Y), { classe: 'incidencia_indeterminada', motivo: 'aviso_incidencia_parcial' });
  assert.deepEqual(incidenciaDoAviso(OESTE, Z), { classe: 'sem_incidencia', motivo: 'aviso_fora_do_municipio' });
  const z = classificarMunicipioDia({ avisosDoDia: [OESTE], municipio: Z, historico: 'verificado' });
  assert.equal(z.classe, 'sem_evidencia_de_lacuna');
  assert.equal(z.aviso, 'cobertura não comprovada');
});

test('aviso sem área delimitada: indeterminada em todos os municípios', () => {
  for (const m of [X, Y, Z, W]) {
    assert.equal(classificarMunicipioDia({ avisosDoDia: [SEM_AREA], municipio: m, historico: 'verificado' }).classe, 'incidencia_indeterminada');
  }
});

test('validação humana prevalece sobre a regra automática', () => {
  const validado = { ...SEM_AREA, validacaoHumana: { municipios: { 9900003: 'sem_incidencia', 9900001: 'lacuna_conhecida' } } };
  assert.equal(classificarMunicipioDia({ avisosDoDia: [validado], municipio: Z, historico: 'verificado' }).classe, 'sem_evidencia_de_lacuna');
  assert.equal(classificarMunicipioDia({ avisosDoDia: [validado], municipio: X, historico: 'verificado' }).classe, 'lacuna_conhecida');
  assert.equal(classificarMunicipioDia({ avisosDoDia: [validado], municipio: Y, historico: 'verificado' }).classe, 'incidencia_indeterminada');
});

test('histórico ausente (H1): indeterminada com motivo próprio; lacuna conhecida preserva a incompletude', () => {
  const z = classificarMunicipioDia({ avisosDoDia: [], municipio: Z, historico: 'indisponivel' });
  assert.equal(z.classe, 'incidencia_indeterminada');
  assert.deepEqual(z.motivos, ['historico_ausente_ou_incompleto']);
  const x = classificarMunicipioDia({ avisosDoDia: [OESTE], municipio: X, historico: 'parcial' });
  assert.equal(x.classe, 'lacuna_conhecida');
  assert.deepEqual(x.motivos, ['aviso_abrange_municipio', 'historico_ausente_ou_incompleto']);
  assert.equal(x.historico, 'parcial');
});

test('precedência: lacuna > indeterminada > sem evidência, com todos os motivos', () => {
  const r = classificarMunicipioDia({ avisosDoDia: [{ ...SEM_AREA, dias: OESTE.dias }, OESTE], municipio: X, historico: 'verificado' });
  assert.equal(r.classe, 'lacuna_conhecida');
  assert.deepEqual(r.motivos, ['aviso_sem_area_delimitada', 'aviso_abrange_municipio']);
});

test('30 dias sem aviso em histórico verificado não viram 30 dias cobertos', () => {
  const dias = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);
  const linhas = disponibilidadeMunicipal({ dias, satelite: 'AQUA_M-T', municipios: [Z], avisos: [OESTE], historicoDoDia: () => 'verificado' });
  assert.deepEqual(diasPorClasse(linhas), { lacuna_conhecida: 0, incidencia_indeterminada: 0, sem_evidencia_de_lacuna: 30 });
  assert.ok(linhas.every((l) => l.aviso === 'cobertura não comprovada'));
  assert.ok(!('coberto' in diasPorClasse(linhas)));
});

test('aviso de outro satélite não incide', () => {
  const outro = { ...OESTE, satelites: ['NOAA-20'] };
  const [l] = disponibilidadeMunicipal({ dias: OESTE.dias, satelite: 'AQUA_M-T', municipios: [X], avisos: [outro], historicoDoDia: () => 'verificado' });
  assert.equal(l.classe, 'sem_evidencia_de_lacuna');
});

test('alcance H3: conta município-dias, dias e meses e exige parada com histórico parcial', () => {
  const dias = ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'];
  const historicoDoDia = (d) => ({ '2026-09-29': 'verificado', '2026-09-30': 'verificado', '2026-10-01': 'parcial', '2026-10-02': 'indisponivel' })[d];
  const a = alcanceDoHistorico({ dias, municipios: [X, Y, Z], historicoDoDia });
  assert.deepEqual(a.municipioDias, { verificado: 6, parcial: 3, indisponivel: 3 });
  assert.deepEqual(a.dias, { verificado: 2, parcial: 1, indisponivel: 1 });
  assert.deepEqual(a.meses, { verificado: 1, parcial: 1, indisponivel: 0 });
  assert.equal(a.exigeParadaH3, true);
  assert.equal(alcanceDoHistorico({ dias, municipios: [X], historicoDoDia: () => 'verificado' }).exigeParadaH3, false);
});

test('tabela de interrupções da NASA é lida em UTC', () => {
  const html = '<table><tr><th>Year-Day</th></tr><tr>\n<td>2026-290</td>\n<td>October 17, 2026</td><td>13:45:00</td><td>18:00:00</td><td>EDOS Outage</td></tr></table>';
  assert.deepEqual(lerInterrupcoesAqua(html), [{ dia: '2026-10-17', inicio: '13:45:00', fim: '18:00:00', comentario: 'EDOS Outage' }]);
});
