// Ciclo 004, issue #33 — conferência independente das lentes com a carga REAL local (`npm run conferir:lentes`).
// Dois caminhos que não compartilham código de cálculo:
//   A. RPC → TypeScript: as RPCs existentes sob RLS (RP fictício) alimentam o carregador e o módulo src/lentes/;
//   B. SQL escrito à parte, como administrador, direto nas tabelas, e a grade T1 calculada em `numeric` a
//      partir do TEXTO decimal de `saidas/deteccoes.csv` (nunca via double).
// Compara destaque a destaque em quatro janelas e a célula de cada detecção por id_tecnico. Diferença → código 1
// (parada do plano). Grava `local/dados-prototipo/conferencia-lentes.json` e imprime só agregados públicos.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { sqlAdmin } from '../banco/local.mjs';
import { L, criarRp, limpar, publicarCargaReal } from './carga-real.mjs';
import { lerRegistros, validarDisponibilidade } from '../../src/lentes/carregar.ts';
import { concentracao } from '../../src/lentes/concentracao.ts';
import { municipiosNecessarios, qualificar } from '../../src/lentes/comum.ts';
import { canonico, celulaDe } from '../../src/lentes/grade.ts';

const SAIDAS = path.join(LOCAL, 'saidas');
const fimExclusivo = (fim) => new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

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
  let r = concentracao({ carga: { id: carga.id, identidade: carga.identidade }, janela, registros: lido.registros, totalResumo: lido.totalResumo, nomes });
  const disp = new Map();
  for (const codigo of municipiosNecessarios(r)) {
    const d = await fontes.disponibilidade({ carga: carga.id, inicio: janela.inicio, fim: janela.fim, municipio: codigo });
    disp.set(codigo, { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, carga.satelite, d) });
  }
  r = qualificar(r, disp);
  return { registros: lido.registros, resultado: r };
}

// --- Caminho B: SQL independente ------------------------------------------------------------------

function concentracaoSql(carga, janela) {
  const linhas = sqlAdmin(`
with c as (
  select municipio_codigo as m, count(*) as n from public.deteccoes
  where carga_id = ${carga.id} and escopo = 'principal'
    and data_hora_gmt >= timestamptz '${janela.inicio}T00:00:00Z' and data_hora_gmt < timestamptz '${fimExclusivo(janela.fim)}T00:00:00Z'
  group by 1
), corte as (select n from c order by n desc offset 9 limit 1)
select m || ':' || n from c where n > 0 and n >= coalesce((select n from corte), 1) order by m;`);
  return linhas ? linhas.split('\n').map((x) => x.split(':').map(Number)) : [];
}

function totalSql(carga, janela) {
  return Number(sqlAdmin(`select count(*) from public.deteccoes where carga_id = ${carga.id} and escopo = 'principal'
    and data_hora_gmt >= timestamptz '${janela.inicio}T00:00:00Z' and data_hora_gmt < timestamptz '${fimExclusivo(janela.fim)}T00:00:00Z';`));
}

function coberturaSql(carga, janela, codigos) {
  if (!codigos.length) return new Map();
  const linhas = sqlAdmin(`
select municipio_codigo, count(*) filter (where classe = 'sem_evidencia_de_lacuna'), count(*),
  coalesce(string_agg(case when classe <> 'sem_evidencia_de_lacuna' then dia || '=' || classe end, ',' order by dia), '')
from public.disponibilidade
where carga_id = ${carga.id} and satelite = '${carga.satelite}' and dia between date '${janela.inicio}' and date '${janela.fim}'
  and municipio_codigo in (${codigos.join(',')})
group by 1 order by 1;`);
  return new Map(linhas.split('\n').map((l) => {
    const [m, n, total, demais] = l.split('|');
    return [Number(m), { n: Number(n), m: Number(total), demais: demais ? demais.split(',') : [] }];
  }));
}

function celulasSqlDoTexto() {
  const csv = readFileSync(path.join(SAIDAS, 'deteccoes.csv'), 'utf8').trim().split(/\r?\n/);
  const cab = csv[0].split(',');
  const [iId, iLat, iLon] = ['id_tecnico', 'lat', 'lon'].map((c) => cab.indexOf(c));
  const linhas = csv.slice(1).map((l) => l.split(','));
  const valores = linhas.map((c) => `('${c[iId]}','${c[iLat]}','${c[iLon]}')`).join(',\n');
  // Grade T1 em numeric, a partir do texto da fonte: floor(x · 20) é exato para decimais.
  const saida = sqlAdmin(`
create temp table fonte (id text, lat text, lon text);
insert into fonte values
${valores};
select id || '|' || floor(lat::numeric * 20)::bigint || '|' || floor(lon::numeric * 20)::bigint from fonte;`);
  const textos = linhas.map((c) => [c[iLat], c[iLon]]).flat();
  const sig = (t) => t.replace('-', '').replace('.', '').replace(/^0+/, '').length;
  const decimais = (t) => (t.split('.')[1] ?? '').length;
  return {
    celulas: new Map(saida.split('\n').map((l) => { const [id, a, b] = l.split('|'); return [id, `c${a}_${b}`]; })),
    textoMaxSignificativos: Math.max(...textos.map(sig)),
    textoMaxDecimais: Math.max(...textos.map(decimais)),
  };
}

// --- Comparação -----------------------------------------------------------------------------------

function comparar(nome, carga, janela, a) {
  const divergencias = [];
  const r = a.resultado;
  const total = totalSql(carga, janela);
  if (total !== r.conferencia.total_resumo) divergencias.push(`total: SQL ${total}, resumo ${r.conferencia.total_resumo}`);
  const tsDestaques = r.destaques.map((d) => [d.unidade.codigo, d.evidencia.valor]).sort((x, y) => x[0] - y[0]);
  const sqlDestaques = concentracaoSql(carga, janela);
  if (JSON.stringify(tsDestaques) !== JSON.stringify(sqlDestaques)) divergencias.push(`concentração: TS ${JSON.stringify(tsDestaques)} × SQL ${JSON.stringify(sqlDestaques)}`);
  const cob = coberturaSql(carga, janela, r.destaques.map((d) => d.unidade.codigo));
  for (const d of r.destaques) {
    const c = d.cobertura;
    const s = cob.get(d.unidade.codigo);
    const demaisTs = c.estado === 'completa' ? c.demais_dias.map((x) => `${x.dia}=${x.classe}`) : null;
    if (!s || c.estado !== 'completa' || c.dias_sem_evidencia_de_lacuna !== s.n || c.dias_janela !== s.m || JSON.stringify(demaisTs) !== JSON.stringify(s.demais)) {
      divergencias.push(`cobertura ${d.unidade.codigo}: TS ${c.estado === 'completa' ? `${c.dias_sem_evidencia_de_lacuna}/${c.dias_janela}` : c.estado} × SQL ${s ? `${s.n}/${s.m}` : 'ausente'}`);
    }
  }
  return {
    janela: nome, inicio: janela.inicio, fim: janela.fim,
    total: r.conferencia.total_resumo,
    destaques: r.destaques.map((d) => ({
      codigo: d.unidade.codigo, nome: d.unidade.nome, deteccoes: d.evidencia.valor,
      cobertura: d.cobertura.estado === 'completa' ? `${d.cobertura.dias_sem_evidencia_de_lacuna} de ${d.cobertura.dias_janela}` : d.cobertura.estado,
    })),
    observacoes: r.observacoes,
    divergencias,
  };
}

// --- Execução -------------------------------------------------------------------------------------

let rp = null;
const relatorio = { geradoEm: new Date().toISOString(), commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(), janelas: [] };
let falhou = false;
try {
  const carga = publicarCargaReal(40);
  relatorio.carga = { id: carga.id, identidade: carga.identidade, janela: carga.janela };
  rp = await criarRp('rp-conferencia-lentes@exemplo.test');
  const chamar = rpc(await rp.token());
  const nomes = new Map(sqlAdmin(`select codigo || '|' || nome from public.municipios where carga_id = ${carga.id};`).split('\n').map((l) => { const [c, n] = l.split('|'); return [Number(c), n]; }));
  const pico = sqlAdmin(`select to_char(date_trunc('month', data_hora_gmt at time zone 'UTC'), 'YYYY-MM') from public.deteccoes where carga_id = ${carga.id} and escopo = 'principal' group by 1 order by count(*) desc limit 1;`);
  const ultimoDia = (ym) => new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const janelas = [
    ['inteira', carga.janela],
    [`mês de pico (${pico})`, { inicio: `${pico}-01`, fim: ultimoDia(pico) }],
    ['2 meses (ago–set/2026)', { inicio: '2026-08-01', fim: '2026-09-30' }],
    ['3 meses com bordas parciais (15/07–14/09/2026)', { inicio: '2026-07-15', fim: '2026-09-14' }],
  ];
  let todosRegistros = null;
  for (const [nome, janela] of janelas) {
    const a = await caminhoRpc(chamar, carga, janela, nomes);
    if (nome === 'inteira') todosRegistros = a.registros;
    const c = comparar(nome, carga, janela, a);
    if (c.divergencias.length) falhou = true;
    relatorio.janelas.push(c);
  }
  // Grade T1 por id_tecnico: texto da fonte (numeric) × caminho RPC → TypeScript.
  const fonte = celulasSqlDoTexto();
  let comparadas = 0;
  const diferentes = [];
  let canonMaxSig = 0;
  for (const r of todosRegistros) {
    const sqlCel = fonte.celulas.get(r.id_tecnico);
    if (!sqlCel) { diferentes.push(`${r.id_tecnico}: ausente na fonte`); continue; }
    const ts = celulaDe(r.latitude, r.longitude).id;
    comparadas += 1;
    if (ts !== sqlCel) diferentes.push(`${r.id_tecnico}: TS ${ts} × fonte ${sqlCel}`);
    for (const x of [r.latitude, r.longitude]) canonMaxSig = Math.max(canonMaxSig, canonico(x).texto.replace('-', '').replace('.', '').replace(/^0+/, '').length);
  }
  relatorio.grade = {
    deteccoesComparadas: comparadas, celulasDiferentes: diferentes.length, exemplosDiferentes: diferentes.slice(0, 5),
    textoFonteMaxAlgarismosSignificativos: fonte.textoMaxSignificativos, textoFonteMaxCasasDecimais: fonte.textoMaxDecimais,
    canonicoMaxAlgarismosSignificativos: canonMaxSig,
  };
  if (diferentes.length) falhou = true;
  relatorio.identidadeNoFim = sqlAdmin(`select identidade from public.cargas where id = ${carga.id};`);
  if (relatorio.identidadeNoFim !== carga.identidade) { falhou = true; relatorio.erro = 'identidade da carga mudou durante a conferência'; }
} finally {
  await limpar(rp);
}
relatorio.resultado = falhou ? 'divergente' : 'conferido';
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'conferencia-lentes.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);
if (falhou) process.exitCode = 1;
