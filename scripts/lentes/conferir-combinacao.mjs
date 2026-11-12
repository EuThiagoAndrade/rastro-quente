// Ciclo 005, issue #42 — conferência independente da combinação de lentes com a carga REAL local
// (`npm run conferir:combinacao`). Dois caminhos que não compartilham código de cálculo:
//   A. RPC → TypeScript: as RPCs existentes sob RLS (RP fictício) alimentam o carregador e `combinar`, que calcula
//      as lentes escolhidas sobre a entrada conferida (T8), e `qualificarCombinacao` com a disponibilidade lida;
//   B. SQL escrito à parte, como administrador, direto nas tabelas, sem importar `src/lentes/`. A grade T1 vem do
//      TEXTO decimal de `saidas/deteccoes.csv`, em `numeric` (nunca via double). O SQL calcula, por célula, os três
//      critérios (concentração por projeção P1, recorrência e persistência), a seleção "e"/"ou" de cada combinação,
//      a evidência em união, os municípios da cobertura, o "N de M" e as ressalvas por lente.
// Compara, em quatro janelas e nas 8 combinações (3 pares e as três, com "e" e "ou"), o estado, as células, os
// critérios de cada célula, a evidência por critério e em união, os municípios, a cobertura e as ressalvas; confere
// também os números da exploração da ideação. Diferença → código 1 (parada do plano). Grava
// `local/dados-prototipo/conferencia-combinacao.json` e imprime só agregados públicos.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { sqlAdmin } from '../banco/local.mjs';
import { L, criarRp, limpar, publicarCargaReal } from './carga-real.mjs';
import { lerRegistros, validarDisponibilidade } from '../../src/lentes/carregar.ts';
import { combinar, municipiosDaCombinacao, qualificarCombinacao } from '../../src/lentes/combinacao.ts';
import { celulaDe } from '../../src/lentes/grade.ts';

const SAIDAS = path.join(LOCAL, 'saidas');
const RAIZ = path.resolve(import.meta.dirname, '../..');
const PROJETO = /^project_id\s*=\s*"([^"]+)"/m.exec(readFileSync(path.join(RAIZ, 'supabase/config.toml'), 'utf8'))[1];

/** Como `sqlAdmin`, numa sessão só (as tabelas temporárias vivem enquanto dura a chamada), com saída grande. */
const sqlSessao = (sql) => execFileSync('docker', ['exec', '-i', `supabase_db_${PROJETO}`, 'psql', '-U', 'postgres', '-d', 'postgres',
  '-v', 'ON_ERROR_STOP=1', '-q', '-At'], { input: sql, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const fimExclusivo = (fim) => new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
const md5 = (texto) => createHash('md5').update(texto).digest('hex');

const LETRA = { concentracao: 'c', recorrencia: 'r', persistencia: 'p' };
const PARES = [['concentracao', 'recorrencia'], ['concentracao', 'persistencia'], ['recorrencia', 'persistencia']];
const COMBINACOES = [...PARES, ['concentracao', 'recorrencia', 'persistencia']]
  .flatMap((lentes) => ['e', 'ou'].map((operador) => ({ lentes, operador, chave: `${operador}:${lentes.map((l) => LETRA[l]).join('')}` })));

/** Números da exploração da ideação (calibração, não valores esperados) que o SQL tem de reproduzir. */
const EXPLORACAO = {
  inteira: { 'e:crp': 6, 'ou:crp': 1116, 'e:cr': 77, 'e:cp': 31, 'e:rp': 9, 'ou:cr': 1090, 'ou:rp': 201 },
  'ago–out/2026': { 'e:crp': 1, 'e:cr': 14, 'e:cp': 22, 'e:rp': 2 },
};

// --- Caminho A: RPC → TypeScript ------------------------------------------------------------------

function rpc(token) {
  return async (nome, corpo) => {
    const r = await fetch(`${L.api}/rest/v1/rpc/${nome}`, {
      method: 'POST',
      headers: { apikey: L.anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(`${nome}: ${r.status} ${JSON.stringify(json)}`);
    return json;
  };
}

async function caminhoRpc(chamar, carga, janela, nomes) {
  const base = (f) => ({ p_inicio: f.inicio, p_fim: f.fim, p_municipio: f.municipio, p_carga: f.carga });
  const fontes = {
    resumo: (f) => chamar('consultar_resumo', base(f)),
    pagina: (f, limite, deslocamento) => chamar('consultar_deteccoes', { ...base(f), p_limite: limite, p_deslocamento: deslocamento }),
    disponibilidade: (f) => chamar('consultar_disponibilidade', base(f)),
  };
  const pedido = { carga: carga.id, janela };
  const lido = await lerRegistros(fontes, pedido, () => true);
  const entrada = { carga: { id: carga.id, identidade: carga.identidade }, janela, registros: lido.registros, totalResumo: lido.totalResumo, nomes };
  const brutos = new Map(COMBINACOES.map((x) => [x.chave, combinar(entrada, x.lentes, x.operador)]));
  const disp = new Map();
  for (const codigo of new Set([...brutos.values()].flatMap(municipiosDaCombinacao))) {
    const d = await fontes.disponibilidade({ carga: carga.id, inicio: janela.inicio, fim: janela.fim, municipio: codigo });
    disp.set(codigo, { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, carga.satelite, d) });
  }
  const resultados = new Map([...brutos].map(([k, r]) => [k, qualificarCombinacao(r, disp)]));
  return { registros: lido.registros, resultados, municipiosDisponibilidade: disp.size };
}

// --- Caminho B: SQL independente ------------------------------------------------------------------

const MESES = "array['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']";
const PIOR = "max(case v.classe when 'lacuna_conhecida' then 2 when 'incidencia_indeterminada' then 1 else 0 end)";
const CLASSE = "case p when 2 then 'lacuna_conhecida' else 'incidencia_indeterminada' end";

/** SQL de uma janela (índice `i`), sobre a tabela temporária `cel` (célula de cada id_tecnico pelo texto da fonte). */
function sqlJanela(carga, j, i) {
  const filtro = `x.carga_id = ${carga.id} and x.escopo = 'principal'
    and x.data_hora_gmt >= timestamptz '${j.inicio}T00:00:00Z' and x.data_hora_gmt < timestamptz '${fimExclusivo(j.fim)}T00:00:00Z'`;
  const disp = `v.carga_id = ${carga.id} and v.satelite = '${carga.satelite}' and v.dia between date '${j.inicio}' and date '${j.fim}'`;
  const combinacoes = COMBINACOES.map(({ chave, operador, lentes }) => {
    const letras = lentes.map((l) => LETRA[l]);
    const cond = letras.join(operador === 'e' ? ' and ' : ' or ');
    const indisponivel = letras.includes('r') ? `(select n from mt${i}) < 3` : 'false';
    return `
select 'I|${i}|${chave}' where ${indisponivel};
select 'S|${i}|${chave}|' || f.klat || '|' || f.klon || '|' ||
  concat_ws(',', ${letras.map((l) => `case when f.${l} then '${l}' end`).join(', ')}) || '|' ||
  count(distinct e.id) || '|' || md5(string_agg(distinct e.id, ',' order by e.id))
from fl${i} f join ev${i} e using (klat, klon)
where not (${indisponivel}) and (${cond}) and e.crit in (${letras.map((l) => `'${l}'`).join(', ')})
group by f.klat, f.klon, f.c, f.r, f.p;`;
  }).join('\n');
  return `
create temp table d${i} as
select x.id_tecnico collate "C" as id, c.klat, c.klon, x.municipio_codigo as m,
  (x.data_hora_gmt at time zone 'UTC')::date as dia, to_char(x.data_hora_gmt at time zone 'UTC', 'YYYY-MM') as mes
from public.deteccoes x join cel c on c.id = x.id_tecnico where ${filtro};
create temp table mt${i} as
select count(*)::int as n from generate_series(date_trunc('month', date '${j.inicio}'), date_trunc('month', date '${j.fim}'), interval '1 month');
-- Concentração: contagem por município; corte na contagem do 10º, com empatados; 0 detecção nunca entra.
create temp table conc${i} as
with c as (select m, count(*) as n from d${i} group by m), corte as (select n from c order by n desc offset 9 limit 1)
select m, n from c where n > 0 and n >= coalesce((select n from corte), 1);
-- Persistência: ilhas de dias consecutivos por célula (dia − número da linha é constante numa ilha), corte em 3.
create temp table seq${i} as
with dd as (select klat, klon, dia, count(*) as n from d${i} group by klat, klon, dia),
ilhas as (select klat, klon, dia, n, dia - (row_number() over (partition by klat, klon order by dia))::int as g from dd)
select klat, klon, min(dia) as ini, max(dia) as fim, count(*)::int as dias, sum(n)::int as n from ilhas group by klat, klon, g having count(*) >= 3;
-- Marcas por célula: c (pelo menos 1 detecção de município destacado), r (3 ou mais meses, se a janela tocar 3), p (alguma sequência).
create temp table fl${i} as
select klat, klon,
  bool_or(m in (select m from conc${i})) as c,
  (select n from mt${i}) >= 3 and count(distinct mes) >= 3 as r,
  exists (select 1 from seq${i} s where s.klat = d.klat and s.klon = d.klon) as p
from d${i} d group by klat, klon;
-- Evidência por critério: concentração, só as detecções de município destacado; recorrência, todas as da célula;
-- persistência, as dos dias de alguma sequência.
create temp table ev${i} as
select d.klat, d.klon, d.id, 'c' as crit from d${i} d join fl${i} f using (klat, klon) where f.c and d.m in (select m from conc${i})
union all select d.klat, d.klon, d.id, 'r' from d${i} d join fl${i} f using (klat, klon) where f.r
union all select d.klat, d.klon, d.id, 'p' from d${i} d join seq${i} s using (klat, klon) where d.dia between s.ini and s.fim;
select 'M|${i}|' || n from mt${i};
${combinacoes}
-- Detalhe da concentração por município destacado na célula, com o motivo; e a ressalva de projeção.
with t as (select klat, klon, count(*) as total from d${i} group by klat, klon),
pm as (select d.klat, d.klon, d.m, count(*) as k, md5(string_agg(d.id, ',' order by d.id)) as h
  from d${i} d join conc${i} c using (m) group by d.klat, d.klon, d.m)
select 'KC|${i}|' || pm.klat || '|' || pm.klon || '|' ||
  string_agg(pm.m || '|' || pm.k || '|' || pm.h || '|' || pm.k || ' ' || case when pm.k = 1 then 'detecção' else 'detecções' end ||
    ' nesta célula de ' || mu.nome || ', município destacado pela concentração (' || c.n || ' ' ||
    case when c.n = 1 then 'detecção' else 'detecções' end || ' na janela; corte em 10, com empatados)', '#' order by pm.m) || '|' ||
  coalesce(case when t.total > sum(pm.k) then 'a célula também tem ' || (t.total - sum(pm.k)) || ' de ' || t.total ||
    ' detecções de município não destacado pela concentração' end, '')
from pm join conc${i} c using (m) join t using (klat, klon)
  join public.municipios mu on mu.carga_id = ${carga.id} and mu.codigo = pm.m
group by pm.klat, pm.klon, t.total;
-- Detalhe da recorrência: meses, detecções e a ressalva de cada mês parcial tocado pela célula (D14).
with r as (select d.klat, d.klon, d.mes, count(*) as n from d${i} d join fl${i} f using (klat, klon) where f.r group by d.klat, d.klon, d.mes),
mp as (select klat, klon, mes, to_date(mes || '-01', 'YYYY-MM-DD') as ini, (to_date(mes || '-01', 'YYYY-MM-DD') + interval '1 month' - interval '1 day')::date as fim from r)
select 'KR|${i}|' || r.klat || '|' || r.klon || '|' || count(*) || '|' || string_agg(r.mes, ',' order by r.mes) || '|' || sum(r.n) || '|' ||
  (select md5(string_agg(d.id, ',' order by d.id)) from d${i} d where d.klat = r.klat and d.klon = r.klon) || '|' ||
  coalesce(string_agg(case when greatest(date '${j.inicio}', mp.ini) <> mp.ini or least(date '${j.fim}', mp.fim) <> mp.fim then
    'inclui mês parcial: ' || (${MESES})[extract(month from mp.ini)::int] || '/' || extract(year from mp.ini) ||
    ' (janela de ' || to_char(greatest(date '${j.inicio}', mp.ini), 'DD/MM') || ' a ' || to_char(least(date '${j.fim}', mp.fim), 'DD/MM') || ')' end,
    '#' order by r.mes), '')
from r join mp using (klat, klon, mes) group by r.klat, r.klon;
-- Municípios de todas as detecções da célula (D13) e a classe mais restritiva por dia (T7), para as células marcadas.
create temp table ms${i} as select klat, klon, array_agg(distinct m order by m) as ms from d${i} group by klat, klon;
create temp table pior${i} as
select f.klat, f.klon, v.dia, ${PIOR} as p
from fl${i} f join ms${i} using (klat, klon) join public.disponibilidade v on v.municipio_codigo = any (ms${i}.ms)
where (f.c or f.r or f.p) and ${disp}
group by f.klat, f.klon, v.dia;
select 'KV|${i}|' || p.klat || '|' || p.klon || '|' || array_to_string(ms.ms, ',') || '|' ||
  count(*) filter (where p.p = 0) || '/' || count(*) || '|' ||
  md5(coalesce(string_agg(case when p.p > 0 then p.dia || '=' || ${CLASSE} end, ',' order by p.dia), ''))
from pior${i} p join ms${i} ms using (klat, klon) group by p.klat, p.klon, ms.ms;
-- Detalhe da persistência, sequência a sequência: dias, detecções e ressalvas de borda (T4) e por classe (D15, T7).
with ids as (select s.klat, s.klon, s.ini, md5(string_agg(d.id, ',' order by d.id)) as h
  from seq${i} s join d${i} d using (klat, klon) where d.dia between s.ini and s.fim group by s.klat, s.klon, s.ini),
res as (
  select s.klat, s.klon, s.ini, string_agg(
    case when p.dia between s.ini and s.fim then 'inclui ' else 'adjacente a ' end
    || case p.p when 2 then 'dia com lacuna conhecida' else 'dia indeterminado' end
    || ' (' || to_char(p.dia, 'DD/MM') || ')'
    || case when p.dia between s.ini and s.fim then '' else '; pode ser mais longa' end, '#' order by p.dia) as txt
  from seq${i} s join pior${i} p using (klat, klon)
  where p.p > 0 and p.dia between s.ini - 1 and s.fim + 1
  group by s.klat, s.klon, s.ini)
select 'KP|${i}|' || s.klat || '|' || s.klon || '|' || s.ini || '|' || s.fim || '|' || s.dias || '|' || s.n || '|' || ids.h || '|' ||
  coalesce(concat_ws('#', case when s.ini = date '${j.inicio}' or s.fim = date '${j.fim}' then 'sequência no limite da janela; pode ser mais longa' end, res.txt), '')
from seq${i} s join ids using (klat, klon, ini) left join res using (klat, klon, ini);`;
}

function caminhoSql(carga, janelas) {
  const csv = readFileSync(path.join(SAIDAS, 'deteccoes.csv'), 'utf8').trim().split(/\r?\n/);
  const cab = csv[0].split(',');
  const [iId, iLat, iLon] = ['id_tecnico', 'lat', 'lon'].map((c) => cab.indexOf(c));
  const linhas = csv.slice(1).map((l) => l.split(','));
  const valores = linhas.map((c) => `('${c[iId]}','${c[iLat]}','${c[iLon]}')`).join(',\n');
  // Grade T1 em numeric, a partir do texto da fonte: floor(x · 20) é exato para decimais.
  const saida = sqlSessao(`
create temp table fonte (id text, lat text, lon text);
insert into fonte values
${valores};
create temp table cel as select id, floor(lat::numeric * 20)::bigint as klat, floor(lon::numeric * 20)::bigint as klon from fonte;
select 'C|' || id || '|' || klat || '|' || klon from cel;
${janelas.map((j, i) => sqlJanela(carga, j, i)).join('\n')}`);
  const celulas = new Map();
  const porJanela = janelas.map(() => ({ meses: 0, indisponiveis: new Set(), selecao: new Map(), conc: new Map(), rec: new Map(), cob: new Map(), pers: new Map() }));
  for (const l of saida.split('\n')) {
    const p = l.split('|');
    if (p[0] === 'C') { celulas.set(p[1], `c${p[2]}_${p[3]}`); continue; }
    const j = porJanela[Number(p[1])];
    const cel = `c${p[2]}_${p[3]}`;
    if (p[0] === 'M') j.meses = Number(p[2]);
    else if (p[0] === 'I') j.indisponiveis.add(p[2]);
    else if (p[0] === 'S') {
      const chave = p[2];
      const c = `c${p[3]}_${p[4]}`;
      if (!j.selecao.has(chave)) j.selecao.set(chave, new Map());
      j.selecao.get(chave).set(c, `${p[5]}|${p[6]}|${p[7]}`);
    } else if (p[0] === 'KC') {
      // m|k|h|motivo repetidos por município (separados por '#'), e a ressalva no fim.
      const corpo = p.slice(4, -1).join('|');
      j.conc.set(cel, { destaques: corpo, ressalva: p.at(-1) });
    } else if (p[0] === 'KR') j.rec.set(cel, `${p[4]}|${p[5]}|${p[6]}|${p[7]}|${p[8]}`);
    else if (p[0] === 'KV') j.cob.set(cel, `${p[4]}|${p[5]}|${p[6]}`);
    else if (p[0] === 'KP') {
      if (!j.pers.has(cel)) j.pers.set(cel, []);
      j.pers.get(cel).push(`${p[4]}|${p[5]}|${p[6]}|${p[7]}|${p[8]}|${p[9]}`);
    }
  }
  for (const j of porJanela) for (const [k, v] of j.pers) j.pers.set(k, v.sort().join('~'));
  return { celulas, porJanela };
}

// --- Comparação -----------------------------------------------------------------------------------

const md5Ids = (ids) => md5(ids.join(','));

function textoTs(x) {
  const conc = x.criterios.find((k) => k.lente === 'concentracao');
  const rec = x.criterios.find((k) => k.lente === 'recorrencia');
  const pers = x.criterios.find((k) => k.lente === 'persistencia');
  const c = x.cobertura;
  return {
    selecao: `${x.criterios.map((k) => LETRA[k.lente]).join(',')}|${x.evidencia.deteccoes.length}|${md5Ids(x.evidencia.deteccoes)}`,
    conc: conc && {
      destaques: conc.destaques.map((d) => `${d.id_destaque.split(':')[2]}|${d.evidencia.deteccoes.length}|${md5Ids(d.evidencia.deteccoes)}|${d.motivo}`).join('#'),
      ressalva: conc.ressalvas.join('#'),
    },
    rec: rec && rec.destaques.map((d) => `${d.evidencia.datas.length}|${d.evidencia.datas.join(',')}|${d.evidencia.deteccoes.length}|${md5Ids(d.evidencia.deteccoes)}|${d.ressalvas.join('#')}`).join(''),
    pers: pers && pers.destaques.map((d) => `${d.evidencia.datas[0]}|${d.evidencia.datas.at(-1)}|${d.evidencia.datas.length}|${d.evidencia.deteccoes.length}|${md5Ids(d.evidencia.deteccoes)}|${d.ressalvas.join('#')}`).sort().join('~'),
    cob: c.estado === 'completa'
      ? `${c.municipios.join(',')}|${c.dias_sem_evidencia_de_lacuna}/${c.dias_janela}|${md5(c.demais_dias.map((y) => `${y.dia}=${y.classe}`).join(','))}`
      : `${c.municipios.join(',')}|${c.estado}`,
  };
}

function compararCombinacao(r, sql, chave) {
  const div = [];
  const sel = sql.selecao.get(chave) ?? new Map();
  if (sql.indisponiveis.has(chave)) {
    if (r.estado !== 'indisponivel' || r.celulas.length) div.push(`${chave}: SQL indisponível, TS ${r.estado}`);
    return div;
  }
  const esperadoEstado = sel.size ? 'com_celulas' : 'sem_celulas';
  if (r.estado !== esperadoEstado) div.push(`${chave}: estado TS ${r.estado} × SQL ${esperadoEstado}`);
  if (r.celulas.length !== sel.size) div.push(`${chave}: TS ${r.celulas.length} células × SQL ${sel.size}`);
  for (const x of r.celulas) {
    const id = x.unidade.id;
    const t = textoTs(x);
    const s = sel.get(id);
    if (s === undefined) { div.push(`${chave}: TS ${id} sem par no SQL`); continue; }
    if (t.selecao !== s) div.push(`${chave} ${id}: seleção TS ${t.selecao} × SQL ${s}`);
    if (t.conc) {
      const k = sql.conc.get(id);
      if (!k || k.destaques !== t.conc.destaques || k.ressalva !== t.conc.ressalva) div.push(`${chave} ${id}: concentração TS ${JSON.stringify(t.conc)} × SQL ${JSON.stringify(k)}`);
    }
    if (t.rec !== undefined && t.rec !== sql.rec.get(id)) div.push(`${chave} ${id}: recorrência TS ${t.rec} × SQL ${sql.rec.get(id)}`);
    if (t.pers !== undefined && t.pers !== sql.pers.get(id)) div.push(`${chave} ${id}: persistência TS ${t.pers} × SQL ${sql.pers.get(id)}`);
    if (t.cob !== sql.cob.get(id)) div.push(`${chave} ${id}: cobertura TS ${t.cob} × SQL ${sql.cob.get(id)}`);
  }
  const ts = new Set(r.celulas.map((x) => x.unidade.id));
  for (const id of sel.keys()) if (!ts.has(id)) div.push(`${chave}: SQL ${id} sem par no TS`);
  // T13: norte→sul, depois oeste→leste.
  const ordem = r.celulas.map((x) => x.unidade.id.slice(1).split('_').map(Number));
  for (let i = 1; i < ordem.length; i += 1) {
    const [a1, b1] = ordem[i - 1];
    const [a2, b2] = ordem[i];
    if (!(a1 > a2 || (a1 === a2 && b1 < b2))) { div.push(`${chave}: ordem T13 quebrada em ${i}`); break; }
  }
  return div.slice(0, 20);
}

function resumoCombinacao(r) {
  const cob = {};
  for (const x of r.celulas) {
    const c = x.cobertura;
    const k = c.estado === 'completa' ? `${c.dias_sem_evidencia_de_lacuna} de ${c.dias_janela}` : c.estado;
    cob[k] = (cob[k] ?? 0) + 1;
  }
  const porCriterios = {};
  for (const x of r.celulas) {
    const k = x.criterios.map((y) => y.lente).join('+');
    porCriterios[k] = (porCriterios[k] ?? 0) + 1;
  }
  return {
    estado: r.estado,
    celulas: r.celulas.length,
    deteccoesNaEvidencia: r.celulas.reduce((s, x) => s + x.evidencia.deteccoes.length, 0),
    municipiosNaCobertura: municipiosDaCombinacao(r).length,
    celulasComMaisDeUmMunicipio: r.celulas.filter((x) => x.municipios.length > 1).length,
    celulasComRessalvaDeProjecao: r.celulas.filter((x) => x.criterios.some((y) => y.lente === 'concentracao' && y.ressalvas.length)).length,
    porCriterios,
    cobertura: cob,
    indisponibilidade: r.indisponibilidade.map((x) => x.texto),
  };
}

// --- Execução -------------------------------------------------------------------------------------

let rp = null;
const relatorio = { geradoEm: new Date().toISOString(), commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(), janelas: [] };
let falhou = false;
try {
  const carga = publicarCargaReal(40);
  relatorio.carga = { id: carga.id, identidade: carga.identidade, janela: carga.janela };
  rp = await criarRp('rp-conferencia-combinacao@exemplo.test');
  const chamar = rpc(await rp.token());
  const nomes = new Map(sqlAdmin(`select codigo || '|' || nome from public.municipios where carga_id = ${carga.id};`).split('\n').map((l) => { const [c, n] = l.split('|'); return [Number(c), n]; }));
  const janelas = [
    ['inteira', carga.janela],
    ['ago–out/2026', { inicio: '2026-08-01', fim: '2026-10-31' }],
    ['out/2026', { inicio: '2026-10-01', fim: '2026-10-31' }],
    ['15/07–14/09/2026 (bordas parciais)', { inicio: '2026-07-15', fim: '2026-09-14' }],
  ];
  const fonte = caminhoSql(carga, janelas.map(([, j]) => j));
  let todosRegistros = null;
  for (const [i, [nome, janela]] of janelas.entries()) {
    const a = await caminhoRpc(chamar, carga, janela, nomes);
    if (nome === 'inteira') todosRegistros = a.registros;
    const sql = fonte.porJanela[i];
    const item = { janela: nome, inicio: janela.inicio, fim: janela.fim, total: a.registros.length, mesesTocados: sql.meses, combinacoes: {}, divergencias: [] };
    for (const { chave } of COMBINACOES) {
      const r = a.resultados.get(chave);
      const div = compararCombinacao(r, sql, chave);
      item.divergencias.push(...div);
      item.combinacoes[chave] = { ...resumoCombinacao(r), celulasSql: sql.indisponiveis.has(chave) ? 'indisponível' : (sql.selecao.get(chave)?.size ?? 0) };
    }
    for (const [chave, esperado] of Object.entries(EXPLORACAO[nome] ?? {})) {
      const n = sql.selecao.get(chave)?.size ?? 0;
      if (n !== esperado) item.divergencias.push(`exploração ${chave}: SQL ${n} × ideação ${esperado}`);
    }
    item.municipiosComDisponibilidadeLida = a.municipiosDisponibilidade;
    item.celulasUniaoDasTres = a.resultados.get('ou:crp').celulas.map((x) => ({ celula: x.unidade.id, criterios: x.criterios.map((y) => y.lente), municipios: x.municipios }));
    if (item.divergencias.length) falhou = true;
    relatorio.janelas.push(item);
  }
  // Grade T1 por id_tecnico: texto da fonte (numeric) × caminho RPC → TypeScript.
  const diferentes = todosRegistros.filter((r) => fonte.celulas.get(r.id_tecnico) !== celulaDe(r.latitude, r.longitude).id);
  relatorio.grade = { deteccoesComparadas: todosRegistros.length, celulasDiferentes: diferentes.length };
  if (diferentes.length) falhou = true;
  relatorio.identidadeNoFim = sqlAdmin(`select identidade from public.cargas where id = ${carga.id};`);
  if (relatorio.identidadeNoFim !== carga.identidade) { falhou = true; relatorio.erro = 'identidade da carga mudou durante a conferência'; }
} finally {
  await limpar(rp);
}
relatorio.resultado = falhou ? 'divergente' : 'conferido';
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'conferencia-combinacao.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ ...relatorio, janelas: relatorio.janelas.map((j) => ({ ...j, celulasUniaoDasTres: undefined })) }, null, 2)}\n`);
if (falhou) process.exitCode = 1;
