// Fixture fictícia do E2E (ciclo 003, issue #23): três municípios inventados (códigos 99000xx, polígonos
// retangulares), 100 detecções principais, 5 no envelope e a grade D1 completa. Nenhum dado real.
// Valores esperados são independentes da interface: principal 100; sensibilidade 100 − 3 + 5 = 102 (+2).
// Alfa 60 (3 nas quatro primeiras horas), Beta 30 (+5 no envelope), Gama 10.
export const PREFIXO = 'e'.repeat(63);
export const IDENTIDADE = `${PREFIXO}1`;
export const IDENTIDADE_NOVA = `${PREFIXO}2`;
export const MUNICIPIOS = {
  alfa: { codigo: 9900001, nome: 'Município Alfa', lon: [-57, -56] },
  beta: { codigo: 9900002, nome: 'Município Beta', lon: [-56, -55] },
  gama: { codigo: 9900003, nome: 'Município Gama', lon: [-55, -54] },
};
export const XSS_ID = '<img src=x onerror="window.__xss=1">';
export const XSS_AVISO = '<script>window.__xss=2</script>';

const poligono = ([a, b]) => JSON.stringify({ type: 'Polygon', coordinates: [[[a, -12], [b, -12], [b, -11], [a, -11], [a, -12]]] });

// Detecções: [id_tecnico, municipio, instante, escopo, id_fonte, municipio_inpe, estado_inpe]
function deteccoes() {
  const linhas = [];
  let n = 0;
  const add = (m, instante, escopo, idFonte, inpe = MUNICIPIOS[m].codigo, estadoInpe = 99) => {
    n += 1;
    const [a, b] = MUNICIPIOS[m].lon;
    const lon = (a + b) / 2 + ((n % 7) - 3) * 0.05;
    const lat = -11.5 + ((n % 5) - 2) * 0.08;
    linhas.push({ id: `fx${String(n).padStart(3, '0')}`, m, instante, escopo, lat, lon, idFonte, inpe, estadoInpe, linha: n });
  };
  // Alfa: 3 nas quatro primeiras horas (fora da sensibilidade) e 57 depois.
  for (const h of [1, 2, 3]) add('alfa', `2026-10-01T0${h}:00:00Z`, 'principal', `INPE-A${h}`);
  for (let i = 1; i <= 57; i += 1) {
    const dia = 2 + (i % 20);
    const idFonte = i === 5 ? XSS_ID : i === 6 ? null : `INPE-A${i + 3}`;
    const inpe = i === 7 ? MUNICIPIOS.beta.codigo : MUNICIPIOS.alfa.codigo;
    const estadoInpe = i === 8 ? 11 : 99;
    add('alfa', `2026-10-${String(dia).padStart(2, '0')}T12:${String(i % 60).padStart(2, '0')}:00Z`, 'principal', idFonte, inpe, estadoInpe);
  }
  for (let i = 1; i <= 30; i += 1) add('beta', `2026-10-${String(5 + (i % 10)).padStart(2, '0')}T09:${String(i % 60).padStart(2, '0')}:00Z`, 'principal', `INPE-B${i}`);
  for (let i = 1; i <= 10; i += 1) add('gama', `2026-10-${String(2 + i).padStart(2, '0')}T15:00:00Z`, 'principal', `INPE-G${i}`);
  // Envelope: cinco registros de Beta nas quatro horas após o fim da janela GMT.
  for (const [i, hm] of ['00:30', '01:00', '01:30', '02:00', '03:00'].entries()) add('beta', `2026-11-01T${hm}:00Z`, 'envelope', `INPE-E${i + 1}`);
  return linhas;
}

const aspas = (s) => `'${String(s).replaceAll("'", "''")}'`;

function disponibilidade() {
  const linhas = [];
  for (let dia = 1; dia <= 31; dia += 1) {
    const d = `2026-10-${String(dia).padStart(2, '0')}`;
    // Alfa (X): aviso cobre o município nos dias 1 e 2.
    linhas.push(dia <= 2
      ? { m: 'alfa', d, classe: 'lacuna_conhecida', motivos: ['aviso_cobre_municipio'], alcance: 'verificado', avisos: ['aviso ficticio 1: falta de AQUA_M-T a oeste de 58 graus O'] }
      : { m: 'alfa', d, classe: 'sem_evidencia_de_lacuna', motivos: ['sem_aviso_incidente'], alcance: 'verificado', avisos: [] });
    // Beta (Y): aviso parcial nos dias 1 e 2; histórico ausente no dia 3.
    linhas.push(dia <= 2
      ? { m: 'beta', d, classe: 'incidencia_indeterminada', motivos: ['aviso_parcial_no_municipio'], alcance: 'verificado', avisos: [XSS_AVISO] }
      : dia === 3
        ? { m: 'beta', d, classe: 'incidencia_indeterminada', motivos: ['historico_ausente_ou_incompleto'], alcance: 'indisponivel', avisos: [] }
        : { m: 'beta', d, classe: 'sem_evidencia_de_lacuna', motivos: ['sem_aviso_incidente'], alcance: 'verificado', avisos: [] });
    // Gama (Z): sem evidência de lacuna; o último dia com histórico parcial.
    linhas.push(dia === 31
      ? { m: 'gama', d, classe: 'sem_evidencia_de_lacuna', motivos: ['historico_nao_verificado'], alcance: 'parcial', avisos: [] }
      : { m: 'gama', d, classe: 'sem_evidencia_de_lacuna', motivos: ['sem_aviso_incidente'], alcance: 'verificado', avisos: [] });
  }
  return linhas;
}

const aprovar = (ident) => `
insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
select identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade
from public.cargas where identidade = '${ident}';`;

const fontes = (ident) => `
insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
select c.id, k.chave, k.papel, 'https://exemplo.test/' || k.chave, repeat('9', 64), 1234, '2026-11-02T00:00Z', 'fonte fictícia, uso livre'
from public.cargas c, (values ('focos', 'focos'), ('malha_max', 'malha de classificação'), ('malha_min', 'malha de exibição')) k(chave, papel)
where c.identidade = '${ident}';
insert into public.malhas (carga_id, uso, fonte_chave, qualidade, parametros)
select c.id, k.uso, k.fonte, k.q, k.p::jsonb from public.cargas c,
  (values ('classificacao', 'malha_max', 'maxima', '{}'), ('exibicao', 'malha_min', 'intermediaria', '{"tolerancia":"ficticia"}')) k(uso, fonte, q, p)
where c.identidade = '${ident}';`;

// VALUES com literais de texto resolveriam para text: cada tipo vai explícito no literal.
const tsz = (t) => `'${t}'::timestamptz`;

export function sqlFixture() {
  const m = Object.values(MUNICIPIOS);
  const d = deteccoes();
  const disp = disponibilidade();
  const linhasD = d.map((x) => `('${x.id}', 'focos', ${x.linha}, ${x.idFonte === null ? 'null::text' : aspas(x.idFonte)}, '${x.escopo}', ${tsz(x.instante)}, ${x.lat}::float8, ${x.lon}::float8, ${MUNICIPIOS[x.m].codigo}, '${x.linha % 11 === 0 ? 'borda' : 'interior'}', ${x.inpe}, ${x.estadoInpe})`).join(',\n');
  const linhasV = disp.map((x) => `('${x.d}'::date, 'AQUA_M-T', ${MUNICIPIOS[x.m].codigo}, '${x.classe}', array[${x.motivos.map(aspas).join(',')}]::text[], '${x.alcance}', array[${x.avisos.map(aspas).join(',')}]::text[])`).join(',\n');
  return `
begin;
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  total_principal, total_envelope, total_municipios, total_disponibilidade, metodo)
values ('${IDENTIDADE}', 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z',
  100, 5, 3, ${disp.length}, '{"regra_historico":"H1 fictícia","versao_kb":"KB-004"}');
${fontes(IDENTIDADE)}
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, v.codigo, v.nome, v.geom::jsonb from public.cargas c, (values
${m.map((x) => `  (${x.codigo}, '${x.nome}', '${poligono(x.lon)}')`).join(',\n')}
) v(codigo, nome, geom) where c.identidade = '${IDENTIDADE}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe)
select c.id, v.* from public.cargas c, (values
${linhasD}
) v where c.identidade = '${IDENTIDADE}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico, avisos)
select c.id, v.* from public.cargas c, (values
${linhasV}
) v where c.identidade = '${IDENTIDADE}';
${aprovar(IDENTIDADE)}
update public.cargas set estado = 'publicada' where identidade = '${IDENTIDADE}';
insert into public.publicacao_vigente (carga_id) select id from public.cargas where identidade = '${IDENTIDADE}';
commit;`;
}

// Segunda versão, para o teste de troca de versão: um município, um dia, uma detecção.
export function sqlVersaoNova() {
  return `
begin;
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
values ('${IDENTIDADE_NOVA}', 'AQUA_M-T', '2026-09-01T00:00Z', '2026-09-02T00:00Z', 1, 0, 1, 1);
${fontes(IDENTIDADE_NOVA)}
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, 9900001, 'Município Alfa', '${poligono(MUNICIPIOS.alfa.lon)}'::jsonb from public.cargas c where c.identidade = '${IDENTIDADE_NOVA}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
select c.id, 'nova1', 'focos', 1, 'principal', '2026-09-01T18:00Z', -11.5, -56.5, 9900001, 'interior' from public.cargas c where c.identidade = '${IDENTIDADE_NOVA}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
select c.id, '2026-09-01', 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['sem_aviso_incidente'], 'verificado' from public.cargas c where c.identidade = '${IDENTIDADE_NOVA}';
${aprovar(IDENTIDADE_NOVA)}
update public.cargas set estado = 'publicada' where identidade = '${IDENTIDADE_NOVA}';
update public.publicacao_vigente set carga_id = (select id from public.cargas where identidade = '${IDENTIDADE_NOVA}'), atualizada_em = now() where unica;
update public.cargas set estado = 'retirada' where identidade = '${IDENTIDADE}';
commit;`;
}

// Remoção pelo próprio protocolo: sai da vigência, é retirada, perde as linhas e o registro.
export const SQL_LIMPEZA = `
begin;
delete from public.publicacao_vigente where carga_id in (select id from public.cargas where identidade like '${PREFIXO}%');
update public.cargas set estado = 'retirada' where identidade like '${PREFIXO}%' and estado = 'publicada';
delete from public.fontes where carga_id in (select id from public.cargas where identidade like '${PREFIXO}%');
delete from public.municipios where carga_id in (select id from public.cargas where identidade like '${PREFIXO}%');
delete from public.cargas where identidade like '${PREFIXO}%';
delete from privado.manifestos_aprovados where identidade like '${PREFIXO}%';
commit;`;

// Ciclo 004, issue #34 — carga fictícia de três meses (ago a out/2026) para a lente de recorrência. Mesmos
// códigos inventados; limites retangulares com a divisa Alfa/Beta em −55,98 (dentro de uma célula de
// 0,05°), para exercitar a união D13. Valores esperados derivados à mão (grade T1: índice = piso de
// coordenada × 20):
// - célula A [−11,50; −11,45) × [−56,00; −55,95): ago e set em Alfa, out em Beta → 3 meses, 3 detecções;
// - célula B [−11,55; −11,50) × [−56,50; −56,45): Alfa, 1 em ago, 1 em set e 21 em out (01 a 21) → 3 meses, 23;
// - célula C [−11,65; −11,60) × [−55,35; −55,30): Beta, 3 em ago e 3 em set → 2 meses, sem destaque;
// - célula D [−11,65; −11,60) × [−54,55; −54,50): Gama, 01/08 00:00Z, 30/09 23:59:59Z e 31/10 23:00Z → 3 meses, 3.
// Total 35 (Alfa 25, Beta 7, Gama 3). Disponibilidade em 92 dias: Alfa lacuna em 10/08, Beta indeterminada em
// 20/09, Gama sem lacuna em todos. Cobertura: A 90 de 92 (união), B 91 de 92, D 92 de 92.
export const IDENTIDADE_RECORRENCIA = `${PREFIXO}3`;
export const JANELA_RECORRENCIA = { inicio: '2026-08-01', fim: '2026-10-31' };
const LIMITES_RECORRENCIA = { alfa: [-57, -55.98], beta: [-55.98, -55], gama: [-55, -54] };

function deteccoesRecorrencia() {
  const linhas = [];
  const add = (id, m, instante, lat, lon) => linhas.push({ id, m, instante, lat, lon, linha: linhas.length + 1 });
  add('ra1', 'alfa', '2026-08-20T12:00:00Z', -11.48, -55.99);
  add('ra2', 'alfa', '2026-09-10T12:00:00Z', -11.48, -55.99);
  add('ra3', 'beta', '2026-10-05T12:00:00Z', -11.48, -55.96);
  add('rb01', 'alfa', '2026-08-25T12:00:00Z', -11.52, -56.48);
  add('rb02', 'alfa', '2026-09-15T12:00:00Z', -11.52, -56.48);
  for (let d = 1; d <= 21; d += 1) add(`rb${String(d + 2).padStart(2, '0')}`, 'alfa', `2026-10-${String(d).padStart(2, '0')}T12:00:00Z`, -11.52, -56.47);
  for (const dia of ['2026-08-03', '2026-08-04', '2026-08-05', '2026-09-03', '2026-09-04', '2026-09-05']) add(`rc${dia.slice(5)}`, 'beta', `${dia}T09:00:00Z`, -11.61, -55.33);
  add('rd1', 'gama', '2026-08-01T00:00:00Z', -11.62, -54.52);
  add('rd2', 'gama', '2026-09-30T23:59:59Z', -11.62, -54.52);
  add('rd3', 'gama', '2026-10-31T23:00:00Z', -11.62, -54.52);
  return linhas;
}

function disponibilidadeRecorrencia() {
  const linhas = [];
  for (let t = Date.parse('2026-08-01T00:00:00Z'); t <= Date.parse('2026-10-31T00:00:00Z'); t += 86_400_000) {
    const d = new Date(t).toISOString().slice(0, 10);
    for (const m of ['alfa', 'beta', 'gama']) {
      const restrita = (m === 'alfa' && d === '2026-08-10') ? ['lacuna_conhecida', 'aviso_cobre_municipio']
        : (m === 'beta' && d === '2026-09-20') ? ['incidencia_indeterminada', 'aviso_parcial_no_municipio'] : null;
      linhas.push(restrita
        ? { m, d, classe: restrita[0], motivos: [restrita[1]] }
        : { m, d, classe: 'sem_evidencia_de_lacuna', motivos: ['sem_aviso_incidente'] });
    }
  }
  return linhas;
}

/** Publica a carga de recorrência no lugar da vigente (a limpeza e a restauração ficam com quem chama). */
export function sqlFixtureRecorrencia() {
  return sqlCargaCelulas(IDENTIDADE_RECORRENCIA, '2026-08-01T00:00Z', '2026-11-01T00:00Z', deteccoesRecorrencia(), disponibilidadeRecorrencia());
}

/** Carga fictícia com os limites retangulares das cargas por célula (recorrência e persistência). */
function sqlCargaCelulas(id, inicio, fimExclusivo, d, disp) {
  const linhasD = d.map((x) => `('${x.id}', 'focos', ${x.linha}, 'INPE-R${x.linha}', 'principal', ${tsz(x.instante)}, ${x.lat}::float8, ${x.lon}::float8, ${MUNICIPIOS[x.m].codigo}, 'interior', ${MUNICIPIOS[x.m].codigo}, 99)`).join(',\n');
  const linhasV = disp.map((x) => `('${x.d}'::date, 'AQUA_M-T', ${MUNICIPIOS[x.m].codigo}, '${x.classe}', array[${x.motivos.map(aspas).join(',')}]::text[], 'verificado', array[]::text[])`).join(',\n');
  return `
begin;
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade, metodo)
values ('${id}', 'AQUA_M-T', '${inicio}', '${fimExclusivo}', ${d.length}, 0, 3, ${disp.length}, '{"regra_historico":"H1 fictícia","versao_kb":"KB-004"}');
${fontes(id)}
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, v.codigo, v.nome, v.geom::jsonb from public.cargas c, (values
${Object.entries(MUNICIPIOS).map(([k, x]) => `  (${x.codigo}, '${x.nome}', '${poligono(LIMITES_RECORRENCIA[k])}')`).join(',\n')}
) v(codigo, nome, geom) where c.identidade = '${id}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe)
select c.id, v.* from public.cargas c, (values
${linhasD}
) v where c.identidade = '${id}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico, avisos)
select c.id, v.* from public.cargas c, (values
${linhasV}
) v where c.identidade = '${id}';
${aprovar(id)}
update public.cargas set estado = 'publicada' where identidade = '${id}';
insert into public.publicacao_vigente (carga_id) select id from public.cargas where identidade = '${id}';
commit;`;
}

// Ciclo 004, issue #35 — carga fictícia de outubro/2026 para a lente de persistência, com os mesmos limites da
// carga de recorrência (divisa Alfa/Beta em −55,98). Valores esperados derivados à mão (grade T1: índice =
// piso de coordenada × 20; janela de 01/10 a 31/10, 31 dias):
// - célula Q [−11,55; −11,50) × [−56,50; −56,45), Alfa: 01–03 (toca o início da janela, T4) e 20–23, com duas
//   detecções no dia 21 → 2 destaques (T6), de 3 dias/3 detecções e de 4 dias/5 detecções;
// - célula P [−11,50; −11,45) × [−56,00; −55,95), na divisa: 10 (Alfa), 11 (Beta) e 12 (Alfa) → 3 dias/3 detecções.
//   No dia 11, Alfa lacuna conhecida e Beta indeterminada → "inclui dia com lacuna conhecida (11/10)" (T7);
//   o dia 13, sem detecção, Beta indeterminada → "adjacente a dia indeterminado (13/10); pode ser mais longa";
// - célula R [−11,65; −11,60) × [−54,55; −54,50), Gama: 29, 30 e 31 (às 23:59:59Z), com Gama indeterminada no
//   dia 30 → "inclui dia indeterminado (30/10)" e a ressalva T4 (toca o fim da janela);
// - célula S [−11,65; −11,60) × [−55,35; −55,30), Beta: 05, 06 e 08; dia 07 sem detecção e Beta indeterminada →
//   nenhum destaque (sem inferência).
// Total 17 (Alfa 10, Beta 4, Gama 3). Ordem T5: Q 01/10, P 10/10, Q 20/10 e R 29/10. Disponibilidade: Alfa lacuna
// em 11/10; Beta indeterminada em 07, 11 e 13/10; Gama indeterminada em 30/10. Cobertura (31 dias): Q 30 de 31
// (Alfa), P 28 de 31 (união Alfa e Beta: 07, 11 e 13), R 30 de 31 (Gama).
export const IDENTIDADE_PERSISTENCIA = `${PREFIXO}4`;

function deteccoesPersistencia() {
  const linhas = [];
  const add = (id, m, instante, lat, lon) => linhas.push({ id, m, instante, lat, lon, linha: linhas.length + 1 });
  for (const d of ['01', '02', '03']) add(`pq${d}`, 'alfa', `2026-10-${d}T12:00:00Z`, -11.52, -56.48);
  for (const d of ['20', '21', '22', '23']) add(`pq${d}`, 'alfa', `2026-10-${d}T12:00:00Z`, -11.52, -56.48);
  add('pq21b', 'alfa', '2026-10-21T18:00:00Z', -11.52, -56.47);
  add('pp10', 'alfa', '2026-10-10T12:00:00Z', -11.48, -55.99);
  add('pp11', 'beta', '2026-10-11T12:00:00Z', -11.48, -55.96);
  add('pp12', 'alfa', '2026-10-12T12:00:00Z', -11.48, -55.99);
  add('pr29', 'gama', '2026-10-29T08:00:00Z', -11.62, -54.52);
  add('pr30', 'gama', '2026-10-30T08:00:00Z', -11.62, -54.52);
  add('pr31', 'gama', '2026-10-31T23:59:59Z', -11.62, -54.52);
  for (const d of ['05', '06', '08']) add(`ps${d}`, 'beta', `2026-10-${d}T09:00:00Z`, -11.61, -55.33);
  return linhas;
}

function disponibilidadePersistencia() {
  const restritos = {
    alfa: { '2026-10-11': ['lacuna_conhecida', 'aviso_cobre_municipio'] },
    beta: {
      '2026-10-07': ['incidencia_indeterminada', 'aviso_parcial_no_municipio'],
      '2026-10-11': ['incidencia_indeterminada', 'historico_ausente_ou_incompleto'],
      '2026-10-13': ['incidencia_indeterminada', 'aviso_parcial_no_municipio'],
    },
    gama: { '2026-10-30': ['incidencia_indeterminada', 'aviso_parcial_no_municipio'] },
  };
  const linhas = [];
  for (let dia = 1; dia <= 31; dia += 1) {
    const d = `2026-10-${String(dia).padStart(2, '0')}`;
    for (const m of ['alfa', 'beta', 'gama']) {
      const r = restritos[m][d];
      linhas.push(r ? { m, d, classe: r[0], motivos: [r[1]] } : { m, d, classe: 'sem_evidencia_de_lacuna', motivos: ['sem_aviso_incidente'] });
    }
  }
  return linhas;
}

/** Publica a carga de persistência no lugar da vigente (a limpeza e a restauração ficam com quem chama). */
export function sqlFixturePersistencia() {
  return sqlCargaCelulas(IDENTIDADE_PERSISTENCIA, '2026-10-01T00:00Z', '2026-11-01T00:00Z', deteccoesPersistencia(), disponibilidadePersistencia());
}

// Ciclo 005, issue #43 — carga fictícia de junho a outubro/2026 (153 dias GMT) para a combinação de lentes, com
// 12 municípios inventados (99000xx). Valores esperados derivados à mão (grade T1: índice = piso de coordenada × 20;
// concentração com N = 10):
// - contagens: Alfa 70, Beta 20, Gama 12, Delta 11, Epsilon 10, Zeta 9, Eta 8, Teta 7, Iota 6, Capa 5 → os 10
//   destacados, sem empate no 10º; Lambda 2 e Mi 1 não são destacados. Total 161;
// - célula X c-221_-1140 [−11,05; −11,00) × [−57,00; −56,95): Alfa em 20/08, 20/09, 05/10, 06/10 e 07/10 e Mi em
//   25/10 → concentração por projeção (5 de Alfa; ressalva "1 de 6"), recorrência (3 meses, 6 detecções) e
//   persistência (05–07/10, 3 detecções). Cobertura por Alfa e Mi: 151 de 153;
// - célula Y c-221_-1138 [−11,05; −11,00) × [−56,90; −56,85): Beta em 05–07/09 e 20–22/09 → concentração e duas
//   sequências; Beta indeterminada em 08/09 e com lacuna conhecida em 19/09 → cada sequência com a sua ressalva
//   (R1-1). Cobertura 151 de 153;
// - célula Z c-223_-1140: Gama em 10/08, 10/09 e 10/10 → concentração e recorrência. Cobertura 153 de 153;
// - célula W c-225_-1140: Lambda (não destacado) em 15 e 16/08 → nenhuma lente;
// - 144 células de preenchimento, uma detecção cada (Alfa 65, Beta 14, Gama 9, Delta 11, Epsilon 10, Zeta 9, Eta 8,
//   Teta 7, Iota 6, Capa 5), em 9 faixas de 16 células ao sul de −11,50, de 01/08 a 30/09 → só concentração.
// Janela inteira: "as três, e" = X; "as três, ou" = 147 células (X, Y, Z e as 144), em 3 páginas de 50;
// "concentração e recorrência" = X e Z; "concentração e persistência" = X e Y; "recorrência e persistência" = X.
// Agosto, "concentração e persistência": sem célula em comum. 01/06 a 31/08, "recorrência ou persistência": sem
// células destacadas (a janela toca 3 meses). Outubro, "recorrência e persistência": indisponível.
export const IDENTIDADE_COMBINACAO = `${PREFIXO}5`;
export const MUNICIPIOS_COMBINACAO = {
  alfa: { codigo: 9900001, nome: 'Município Alfa', preenchimento: 65 },
  beta: { codigo: 9900002, nome: 'Município Beta', preenchimento: 14 },
  gama: { codigo: 9900003, nome: 'Município Gama', preenchimento: 9 },
  delta: { codigo: 9900004, nome: 'Município Delta', preenchimento: 11 },
  epsilon: { codigo: 9900005, nome: 'Município Epsilon', preenchimento: 10 },
  zeta: { codigo: 9900006, nome: 'Município Zeta', preenchimento: 9 },
  eta: { codigo: 9900007, nome: 'Município Eta', preenchimento: 8 },
  teta: { codigo: 9900008, nome: 'Município Teta', preenchimento: 7 },
  iota: { codigo: 9900009, nome: 'Município Iota', preenchimento: 6 },
  capa: { codigo: 9900010, nome: 'Município Capa', preenchimento: 5 },
  lambda: { codigo: 9900011, nome: 'Município Lambda', preenchimento: 0 },
  mi: { codigo: 9900012, nome: 'Município Mi', preenchimento: 0 },
};

function deteccoesCombinacao() {
  const linhas = [];
  const add = (id, m, instante, lat, lon) => linhas.push({ id, m, instante, lat, lon, linha: linhas.length + 1 });
  add('cx1', 'alfa', '2026-08-20T12:00:00Z', -11.02, -56.98);
  add('cx2', 'alfa', '2026-09-20T12:00:00Z', -11.02, -56.98);
  for (const d of ['05', '06', '07']) add(`cx10${d}`, 'alfa', `2026-10-${d}T12:00:00Z`, -11.02, -56.98);
  add('cx6', 'mi', '2026-10-25T12:00:00Z', -11.03, -56.97);
  for (const d of ['05', '06', '07', '20', '21', '22']) add(`cy09${d}`, 'beta', `2026-09-${d}T09:00:00Z`, -11.02, -56.88);
  for (const m of ['08', '09', '10']) add(`cz${m}`, 'gama', `2026-${m}-10T15:00:00Z`, -11.12, -56.98);
  add('cw15', 'lambda', '2026-08-15T12:00:00Z', -11.22, -56.98);
  add('cw16', 'lambda', '2026-08-16T12:00:00Z', -11.22, -56.98);
  // Preenchimento: coordenadas em centésimos inteiros, para a forma decimal canônica (T1).
  let i = 0;
  for (const [m, x] of Object.entries(MUNICIPIOS_COMBINACAO)) {
    for (let k = 0; k < x.preenchimento; k += 1, i += 1) {
      const lat = (-1152 - 5 * Math.floor(i / 16)) / 100;
      const lon = (-5698 + 5 * (i % 16)) / 100;
      const dia = new Date(Date.parse('2026-08-01T12:00:00Z') + (i % 61) * 86_400_000).toISOString().replace('.000Z', 'Z');
      add(`cf${String(i).padStart(3, '0')}`, m, dia, lat, lon);
    }
  }
  return linhas;
}

function disponibilidadeCombinacao() {
  const restritos = {
    alfa: { '2026-08-03': ['lacuna_conhecida', 'aviso_cobre_municipio'] },
    mi: { '2026-08-07': ['incidencia_indeterminada', 'aviso_parcial_no_municipio'] },
    beta: {
      '2026-09-08': ['incidencia_indeterminada', 'aviso_parcial_no_municipio'],
      '2026-09-19': ['lacuna_conhecida', 'aviso_cobre_municipio'],
    },
  };
  const linhas = [];
  for (let t = Date.parse('2026-06-01T00:00:00Z'); t <= Date.parse('2026-10-31T00:00:00Z'); t += 86_400_000) {
    const d = new Date(t).toISOString().slice(0, 10);
    for (const m of Object.keys(MUNICIPIOS_COMBINACAO)) {
      const r = restritos[m]?.[d];
      linhas.push(r ? { m, d, classe: r[0], motivos: [r[1]] } : { m, d, classe: 'sem_evidencia_de_lacuna', motivos: ['sem_aviso_incidente'] });
    }
  }
  return linhas;
}

/** Publica a carga da combinação no lugar da vigente (a limpeza e a restauração ficam com quem chama). */
export function sqlFixtureCombinacao() {
  const id = IDENTIDADE_COMBINACAO;
  const d = deteccoesCombinacao();
  const disp = disponibilidadeCombinacao();
  const mun = Object.values(MUNICIPIOS_COMBINACAO);
  const codigo = (m) => MUNICIPIOS_COMBINACAO[m].codigo;
  const linhasD = d.map((x) => `('${x.id}', 'focos', ${x.linha}, 'INPE-C${x.linha}', 'principal', ${tsz(x.instante)}, ${x.lat}::float8, ${x.lon}::float8, ${codigo(x.m)}, 'interior', ${codigo(x.m)}, 99)`).join(',\n');
  const linhasV = disp.map((x) => `('${x.d}'::date, 'AQUA_M-T', ${codigo(x.m)}, '${x.classe}', array[${x.motivos.map(aspas).join(',')}]::text[], 'verificado', array[]::text[])`).join(',\n');
  const faixa = (i) => [-58 + i * 0.25, -58 + (i + 1) * 0.25];
  return `
begin;
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade, metodo)
values ('${id}', 'AQUA_M-T', '2026-06-01T00:00Z', '2026-11-01T00:00Z', ${d.length}, 0, ${mun.length}, ${disp.length}, '{"regra_historico":"H1 fictícia","versao_kb":"KB-004"}');
${fontes(id)}
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, v.codigo, v.nome, v.geom::jsonb from public.cargas c, (values
${mun.map((x, i) => `  (${x.codigo}, '${x.nome}', '${poligono(faixa(i))}')`).join(',\n')}
) v(codigo, nome, geom) where c.identidade = '${id}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe)
select c.id, v.* from public.cargas c, (values
${linhasD}
) v where c.identidade = '${id}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico, avisos)
select c.id, v.* from public.cargas c, (values
${linhasV}
) v where c.identidade = '${id}';
${aprovar(id)}
update public.cargas set estado = 'publicada' where identidade = '${id}';
insert into public.publicacao_vigente (carga_id) select id from public.cargas where identidade = '${id}';
commit;`;
}
