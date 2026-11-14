// Ciclo 006, issue #51 — conferência independente da lente de sobreposição com a carga REAL local
// (`npm run conferir:sobreposicao`). Parte do banco vazio e publica a carga pela CLI (revisão 1, exibição
// intermediária: a mesma identidade da carga hospedada). Dois caminhos que não compartilham código de cálculo:
//   A. API → TypeScript: RP fictício sob RLS; `lerRegistros` (RPCs) e `lerAreas` (T25, tabelas pela API) alimentam
//      `sobreposicao`, e `qualificarSobreposicao` aplica a disponibilidade lida;
//   B. SQL escrito à parte, como administrador, sem importar `src/lentes/`: células em `numeric` a partir do TEXTO
//      decimal de `saidas/deteccoes.csv`, vínculos de `saidas/deteccoes_areas.csv` e atributos de `saidas/areas.json`;
//      calcula, por classe e célula, a evidência, as áreas citadas, o motivo, as ressalvas, os municípios e a cobertura.
// Compara célula a célula nas três classes e em três janelas, e confere o número de células da janela inteira com a
// etapa 2 da conferência do item 1 (mesmos insumos). Diferença → código 1 (parada do plano). Grava
// `local/dados-prototipo/conferencia-sobreposicao.json` e imprime só agregados por classe.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { L, criarRp, limpar, publicarCargaReal } from './carga-real.mjs';
import { clienteSessao, fontesAreas } from './fontes-areas.mjs';
import { consultarDeteccoes, consultarDisponibilidade, consultarResumo } from '../../src/consulta.ts';
import { lerRegistros, validarDisponibilidade } from '../../src/lentes/carregar.ts';
import { lerAreas } from '../../src/lentes/carregar-areas.ts';
import { municipiosDaSobreposicao, qualificarSobreposicao, sobreposicao } from '../../src/lentes/sobreposicao.ts';
import { celulaDe } from '../../src/lentes/grade.ts';

const SAIDAS = path.join(LOCAL, 'saidas');
const RAIZ = path.resolve(import.meta.dirname, '../..');
const PROJETO = /^project_id\s*=\s*"([^"]+)"/m.exec(readFileSync(path.join(RAIZ, 'supabase/config.toml'), 'utf8'))[1];
const sqlSessao = (sql) => execFileSync('docker', ['exec', '-i', `supabase_db_${PROJETO}`, 'psql', '-U', 'postgres', '-d', 'postgres',
  '-v', 'ON_ERROR_STOP=1', '-q', '-At'], { input: sql, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const fimExclusivo = (fim) => new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
const md5 = (texto) => createHash('md5').update(texto).digest('hex');
const sha256 = (arquivo) => createHash('sha256').update(readFileSync(arquivo)).digest('hex');
const q = (s) => (s === null || s === undefined ? 'null' : `'${String(s).replaceAll("'", "''")}'`);

const CLASSES = ['protecao_integral', 'uso_sustentavel', 'terra_indigena'];
/** Identidade da carga hospedada (task da issue #50) e insumos da etapa 2 (006_research_conferencia_areas.md). */
const IDENTIDADE_HOSPEDADA = 'd0739e4e5e5d853e673748c13502357bc0b2e0a72c588ed88e32801f86756813';
const INSUMOS_ETAPA2 = {
  'deteccoes.csv': '7a50aaaff7756b6a551b10d84f69353e2b6ed6e5a079e3f13d8c7ea9c4248f40',
  'deteccoes_areas.csv': '6857b3ef73a592eccf61178ed751a5ae6dce7bb76fbc8d498572c60a11c083ba',
};
/** Células por classe na janela inteira, etapa 2 da conferência do item 1 (R3-2). */
const CELULAS_ETAPA2 = { protecao_integral: 39, uso_sustentavel: 74, terra_indigena: 747 };

// --- Caminho A: API → TypeScript ------------------------------------------------------------------

async function caminhoApi(c, carga, janela) {
  const fontes = {
    resumo: (f) => consultarResumo(c, f),
    pagina: (f, limite, deslocamento) => consultarDeteccoes(c, f, limite, deslocamento),
    disponibilidade: (f) => consultarDisponibilidade(c, f),
  };
  const pedido = { carga: carga.id, janela };
  const lido = await lerRegistros(fontes, pedido, () => true);
  const camada = await lerAreas(fontesAreas(c), carga.id, () => true);
  if (camada.estado !== 'completa') throw new Error(`camada de áreas: ${camada.estado}`);
  const entrada = { carga: { id: carga.id, identidade: carga.identidade }, janela, registros: lido.registros, totalResumo: lido.totalResumo, nomes: new Map() };
  const brutos = new Map(CLASSES.map((k) => [k, sobreposicao(entrada, camada, k)]));
  const disp = new Map();
  for (const codigo of new Set([...brutos.values()].flatMap(municipiosDaSobreposicao))) {
    const d = await fontes.disponibilidade({ carga: carga.id, inicio: janela.inicio, fim: janela.fim, municipio: codigo });
    disp.set(codigo, { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, carga.satelite, d) });
  }
  return { registros: lido.registros, camada, resultados: new Map([...brutos].map(([k, r]) => [k, qualificarSobreposicao(r, disp)])) };
}

// --- Caminho B: SQL independente ------------------------------------------------------------------

const PIOR = "max(case v.classe when 'lacuna_conhecida' then 2 when 'incidencia_indeterminada' then 1 else 0 end)";
const CLASSE_DIA = "case p when 2 then 'lacuna_conhecida' else 'incidencia_indeterminada' end";
const ROTULO = "case va.classe when 'protecao_integral' then 'proteção integral' when 'uso_sustentavel' then 'uso sustentável' end";
const NOME = "case va.classe when 'terra_indigena' then 'Terra Indígena ' || va.nome else va.nome end";
const PLURAL = (n, um, varios) => `${n} || case when ${n} = 1 then ' ${um}' else ' ${varios}' end`;

function sqlJanela(carga, j, i) {
  const filtro = `x.carga_id = ${carga.id} and x.escopo = 'principal'
    and x.data_hora_gmt >= timestamptz '${j.inicio}T00:00:00Z' and x.data_hora_gmt < timestamptz '${fimExclusivo(j.fim)}T00:00:00Z'`;
  const disp = `v.carga_id = ${carga.id} and v.satelite = '${carga.satelite}' and v.dia between date '${j.inicio}' and date '${j.fim}'`;
  return `
create temp table d${i} as
select x.id_tecnico collate "C" as id, c.klat, c.klon, x.municipio_codigo as m
from public.deteccoes x join cel c on c.id = x.id_tecnico where ${filtro};
create temp table t${i} as select klat, klon, count(*) as total, array_agg(distinct m order by m) as ms from d${i} group by klat, klon;
-- Vínculos da janela com a área e a célula da detecção; vínculo fora da janela não entra (S1).
create temp table va${i} as
select a.classe, d.klat, d.klon, d.id, (a.fonte || ':' || a.codigo) collate "C" as chave,
  a.nome, a.categoria, a.fase, a.esfera, a.qualidade, vi.posicao
from vinc vi join ar a using (fonte, codigo) join d${i} d on d.id = vi.id;
-- Por área da célula: detecções, borda, trecho do motivo (T23) e ressalvas (T22), cada ressalva com o nome exibido.
create temp table pa${i} as
select va.classe, va.klat, va.klon, va.chave, count(*) as k, count(*) filter (where va.posicao = 'borda') as borda,
  md5(string_agg(va.id, ',' order by va.id)) as h,
  count(*) || ' de ' || ${PLURAL('min(t.total)', 'detecção', 'detecções')} || ' desta célula dentro ' ||
  min(case when va.classe = 'terra_indigena' then 'da Terra Indígena ' || va.nome || coalesce(' (fase: ' || va.fase || ')', '')
    else 'de ' || va.nome || ' (' || concat_ws(', ', ${ROTULO}, va.categoria, va.esfera) || ')' end) as trecho,
  nullif(concat_ws('#',
    min(case va.qualidade when 'Polígono é uma estimativa dos limites da UC' then ${NOME} || ': limite estimado pelo órgão gestor; a posição exata pode diferir'
      when 'Polígono é uma representação esquemática da localização da UC' then ${NOME} || ': representação esquemática da localização; a posição pode diferir muito' end),
    case when count(*) filter (where va.posicao = 'borda') > 0 then
      min(${NOME}) || ': ' || ${PLURAL("count(*) filter (where va.posicao = 'borda')", 'detecção', 'detecções')} || ' exatamente sobre o limite da área' end), '') as ressalvas
from va${i} va join t${i} t using (klat, klon)
group by va.classe, va.klat, va.klon, va.chave;
select 'S|${i}|' || p.classe || '|' || p.klat || '|' || p.klon || '|' ||
  (select count(distinct id) || '|' || md5(string_agg(distinct id, ',' order by id)) from va${i} v where v.classe = p.classe and v.klat = p.klat and v.klon = p.klon) || '|' ||
  string_agg(p.chave || '=' || p.k || '/' || p.borda || '/' || p.h, ',' order by p.chave) || '|' ||
  string_agg(p.trecho, '; ' order by p.chave) || '|' ||
  coalesce(string_agg(p.ressalvas, '#' order by p.chave), '') || '|' ||
  min(array_to_string(t.ms, ','))
from pa${i} p join t${i} t using (klat, klon) group by p.classe, p.klat, p.klon;
-- Cobertura das células destacadas em alguma classe (D13): municípios de todas as detecções da célula na janela.
create temp table pior${i} as
select t.klat, t.klon, v.dia, ${PIOR} as p
from t${i} t join public.disponibilidade v on v.municipio_codigo = any (t.ms)
where (t.klat, t.klon) in (select klat, klon from pa${i}) and ${disp}
group by t.klat, t.klon, v.dia;
select 'V|${i}|' || klat || '|' || klon || '|' || count(*) filter (where p = 0) || '/' || count(*) || '|' ||
  md5(coalesce(string_agg(case when p > 0 then dia || '=' || ${CLASSE_DIA} end, ',' order by dia), ''))
from pior${i} group by klat, klon;`;
}

function caminhoSql(carga, janelas) {
  const linhasCsv = (arquivo) => readFileSync(path.join(SAIDAS, arquivo), 'utf8').trim().split(/\r?\n/).map((l) => l.split(','));
  const [cabD, ...det] = linhasCsv('deteccoes.csv');
  const [iId, iLat, iLon] = ['id_tecnico', 'lat', 'lon'].map((c) => cabD.indexOf(c));
  const [cabV, ...vinc] = linhasCsv('deteccoes_areas.csv');
  const [jId, jFonte, jCodigo, jPos] = ['id_tecnico', 'fonte', 'codigo', 'posicao'].map((c) => cabV.indexOf(c));
  const areas = JSON.parse(readFileSync(path.join(SAIDAS, 'areas.json'), 'utf8'));
  const saida = sqlSessao(`
create temp table fonte (id text, lat text, lon text);
insert into fonte values
${det.map((c) => `('${c[iId]}','${c[iLat]}','${c[iLon]}')`).join(',\n')};
create temp table cel as select id collate "C" as id, floor(lat::numeric * 20)::bigint as klat, floor(lon::numeric * 20)::bigint as klon from fonte;
create temp table vinc (id text collate "C", fonte text, codigo text, posicao text);
insert into vinc values
${vinc.map((c) => `('${c[jId]}',${q(c[jFonte])},${q(c[jCodigo])},${q(c[jPos])})`).join(',\n')};
create temp table ar (fonte text, codigo text, nome text, classe text, categoria text, fase text, esfera text, qualidade text);
insert into ar values
${areas.map((a) => `(${[a.fonte, a.codigo, a.nome, a.classe, a.categoria, a.fase, a.esfera, a.qualidade].map(q).join(',')})`).join(',\n')};
select 'C|' || id || '|' || klat || '|' || klon from cel;
${janelas.map((j, i) => sqlJanela(carga, j, i)).join('\n')}`);
  const celulas = new Map();
  const porJanela = janelas.map(() => ({ selecao: new Map(CLASSES.map((k) => [k, new Map()])), cob: new Map() }));
  for (const l of saida.split('\n')) {
    const p = l.split('|');
    if (p[0] === 'C') { celulas.set(p[1], `c${p[2]}_${p[3]}`); continue; }
    const j = porJanela[Number(p[1])];
    if (p[0] === 'S') j.selecao.get(p[2]).set(`c${p[3]}_${p[4]}`, p.slice(5).join('|'));
    else if (p[0] === 'V') j.cob.set(`c${p[2]}_${p[3]}`, `${p[4]}|${p[5]}`);
  }
  return { celulas, porJanela, vinculosCsv: vinc.length, areasJson: areas.length };
}

// --- Comparação -----------------------------------------------------------------------------------

function textoTs(d) {
  const ids = d.evidencia.deteccoes;
  const c = d.cobertura;
  return {
    selecao: [
      `${ids.length}|${md5(ids.join(','))}`,
      d.areas.map((a) => `${a.chave}=${a.deteccoes.length}/${a.na_borda}/${md5(a.deteccoes.join(','))}`).join(','),
      d.motivo,
      d.ressalvas.join('#'),
      c.municipios.join(','),
    ].join('|'),
    cob: c.estado === 'completa'
      ? `${c.dias_sem_evidencia_de_lacuna}/${c.dias_janela}|${md5(c.demais_dias.map((y) => `${y.dia}=${y.classe}`).join(','))}`
      : c.estado,
  };
}

function comparar(r, sql, classe) {
  const div = [];
  const sel = sql.selecao.get(classe);
  const esperado = sel.size ? 'com_destaques' : 'sem_destaques';
  if (r.estado !== esperado) div.push(`${classe}: estado TS ${r.estado} × SQL ${esperado}`);
  if (r.destaques.length !== sel.size) div.push(`${classe}: TS ${r.destaques.length} células × SQL ${sel.size}`);
  for (const d of r.destaques) {
    const id = d.unidade.id;
    const t = textoTs(d);
    const s = sel.get(id);
    if (s === undefined) { div.push(`${classe}: TS ${id} sem par no SQL`); continue; }
    if (t.selecao !== s) div.push(`${classe} ${id}: TS ${t.selecao} × SQL ${s}`);
    if (t.cob !== sql.cob.get(id)) div.push(`${classe} ${id}: cobertura TS ${t.cob} × SQL ${sql.cob.get(id)}`);
  }
  const ts = new Set(r.destaques.map((d) => d.unidade.id));
  for (const id of sel.keys()) if (!ts.has(id)) div.push(`${classe}: SQL ${id} sem par no TS`);
  // T5: norte→sul, depois oeste→leste.
  const ordem = r.destaques.map((d) => d.unidade.id.slice(1).split('_').map(Number));
  for (let i = 1; i < ordem.length; i += 1) {
    const [a1, b1] = ordem[i - 1];
    const [a2, b2] = ordem[i];
    if (!(a1 > a2 || (a1 === a2 && b1 < b2))) { div.push(`${classe}: ordem T5 quebrada em ${i}`); break; }
  }
  return div.slice(0, 20);
}

function resumo(r) {
  const cob = {};
  for (const d of r.destaques) {
    const c = d.cobertura;
    const k = c.estado === 'completa' ? `${c.dias_sem_evidencia_de_lacuna} de ${c.dias_janela}` : c.estado;
    cob[k] = (cob[k] ?? 0) + 1;
  }
  return {
    estado: r.estado,
    celulas: r.destaques.length,
    deteccoesNaEvidencia: r.destaques.reduce((s, d) => s + d.evidencia.valor, 0),
    areasCitadas: new Set(r.destaques.flatMap((d) => d.areas.map((a) => a.chave))).size,
    celulasComMaisDeUmaArea: r.destaques.filter((d) => d.areas.length > 1).length,
    celulasComRessalva: r.destaques.filter((d) => d.ressalvas.length).length,
    celulasComBorda: r.destaques.filter((d) => d.areas.some((a) => a.na_borda > 0)).length,
    municipiosNaCobertura: municipiosDaSobreposicao(r).length,
    cobertura: cob,
  };
}

// --- Execução -------------------------------------------------------------------------------------

let rp = null;
const relatorio = { geradoEm: new Date().toISOString(), commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(), janelas: [] };
let falhou = false;
relatorio.insumos = Object.fromEntries(Object.keys(INSUMOS_ETAPA2).map((a) => [a, sha256(path.join(SAIDAS, a))]));
for (const [a, h] of Object.entries(INSUMOS_ETAPA2)) {
  if (relatorio.insumos[a] !== h) { falhou = true; relatorio.erro = `insumo ${a} diferente do da etapa 2`; }
}
try {
  const carga = publicarCargaReal(1);
  relatorio.carga = { id: carga.id, identidade: carga.identidade, janela: carga.janela, igualHospedada: carga.identidade === IDENTIDADE_HOSPEDADA };
  if (carga.identidade !== IDENTIDADE_HOSPEDADA) { falhou = true; relatorio.erro = 'identidade local diferente da hospedada'; }
  rp = await criarRp('rp-conferencia-sobreposicao@exemplo.test');
  const c = clienteSessao(L.api, L.anon, await rp.token());
  const janelas = [
    ['inteira', carga.janela],
    ['ago–out/2026', { inicio: '2026-08-01', fim: '2026-10-31' }],
    ['out/2026', { inicio: '2026-10-01', fim: '2026-10-31' }],
  ];
  const fonte = caminhoSql(carga, janelas.map(([, j]) => j));
  let todos = null;
  for (const [i, [nome, janela]] of janelas.entries()) {
    const a = await caminhoApi(c, carga, janela);
    if (nome === 'inteira') {
      todos = a.registros;
      relatorio.camada = { areasLidas: a.camada.areas.length, vinculosLidos: a.camada.vinculos.length, areasJson: fonte.areasJson, vinculosCsv: fonte.vinculosCsv };
      if (a.camada.areas.length !== fonte.areasJson || a.camada.vinculos.length !== fonte.vinculosCsv) falhou = true;
    }
    const item = { janela: nome, inicio: janela.inicio, fim: janela.fim, total: a.registros.length, classes: {}, divergencias: [] };
    for (const classe of CLASSES) {
      const r = a.resultados.get(classe);
      item.divergencias.push(...comparar(r, fonte.porJanela[i], classe));
      item.classes[classe] = { ...resumo(r), celulasSql: fonte.porJanela[i].selecao.get(classe).size };
      if (nome === 'inteira' && r.destaques.length !== CELULAS_ETAPA2[classe]) {
        item.divergencias.push(`${classe}: ${r.destaques.length} células × etapa 2 ${CELULAS_ETAPA2[classe]}`);
      }
    }
    if (item.divergencias.length) falhou = true;
    relatorio.janelas.push(item);
  }
  const diferentes = todos.filter((r) => fonte.celulas.get(r.id_tecnico) !== celulaDe(r.latitude, r.longitude).id);
  relatorio.grade = { deteccoesComparadas: todos.length, celulasDiferentes: diferentes.length };
  if (diferentes.length) falhou = true;
  const [identidadeFim] = execFileSync('docker', ['exec', '-i', `supabase_db_${PROJETO}`, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c',
    `select identidade from public.cargas where id = ${carga.id};`], { encoding: 'utf8' }).trim().split('\n');
  relatorio.identidadeNoFim = identidadeFim;
  if (identidadeFim !== carga.identidade) { falhou = true; relatorio.erro = 'identidade da carga mudou durante a conferência'; }
} finally {
  await limpar(rp);
}
relatorio.resultado = falhou ? 'divergente' : 'conferido';
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'conferencia-sobreposicao.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);
if (falhou) process.exitCode = 1;
