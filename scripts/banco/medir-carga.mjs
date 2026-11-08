// Ciclo 003, issue #22 — medição integral da carga REAL do item 1 no banco local (Supabase local, PG 17):
// banco lógico, tabelas, índices, TOAST, disco do contêiner, WAL, temporários, tráfego e duração da carga
// pela CLI de produção (`carga.mjs`), pico com duas versões, efeito da expiração e das três qualidades de
// geometria de exibição, além das respostas da API para o RP (bytes brutos, gzip estimado e requisições).
// Roda sobre `local/dados-prototipo/` (fora do Git), no banco local recém-reiniciado (`npm run medir:carga`).
// Grava `local/dados-prototipo/medicao-carga.json` e imprime só agregados: nenhum dado de detecção.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { bytesNoConteiner, requisitar, sqlAdmin, statusLocal, verificadorScram } from './local.mjs';

const CARGA = path.resolve(import.meta.dirname, 'carga.mjs');
const RP_EMAIL = 'rp-medicao@exemplo.test';
const DADOS = '/var/lib/postgresql/data';
const L = statusLocal();
const URL_EX = `postgresql://rq_executor@127.0.0.1:${L.bancoPorta}/postgres`;
const senhaEx = randomBytes(24).toString('base64url');

if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npx supabase db reset`.');

function cli(args) {
  const saida = execFileSync(process.execPath, [CARGA, ...args], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, RQ_EXECUTOR_PASSWORD: senhaEx },
  });
  return JSON.parse(saida);
}

// Instantâneo do banco: lógico, por tabela (heap, TOAST, índices), disco do contêiner, WAL e temporários.
function instantaneo() {
  const j = JSON.parse(sqlAdmin(`select jsonb_build_object(
    'bancoLogicoBytes', pg_database_size('postgres'),
    'publicTotalBytes', (select coalesce(sum(pg_total_relation_size(c.oid)), 0) from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'),
    'tabelas', (select jsonb_object_agg(c.relname, jsonb_build_object('linhasVivas', s.n_live_tup, 'linhasMortas', s.n_dead_tup, 'heapBytes', pg_relation_size(c.oid),
        'toastBytes', coalesce(pg_total_relation_size(nullif(c.reltoastrelid, 0)), 0), 'indicesBytes', pg_indexes_size(c.oid), 'totalBytes', pg_total_relation_size(c.oid)))
      from pg_class c join pg_stat_user_tables s on s.relid = c.oid where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'),
    'lsn', pg_current_wal_lsn()::text,
    'tempBytes', (select temp_bytes from pg_stat_database where datname = 'postgres'),
    'tempArquivos', (select temp_files from pg_stat_database where datname = 'postgres'))::text;`));
  j.discoDadosBytes = bytesNoConteiner(DADOS);
  j.discoWalBytes = bytesNoConteiner(`${DADOS}/pg_wal`);
  return j;
}

const walEntre = (a, b) => Number(sqlAdmin(`select pg_wal_lsn_diff('${b.lsn}'::pg_lsn, '${a.lsn}'::pg_lsn)::bigint;`));
const diferenca = (a, b) => ({
  bancoLogicoBytes: b.bancoLogicoBytes - a.bancoLogicoBytes, publicTotalBytes: b.publicTotalBytes - a.publicTotalBytes,
  discoDadosBytes: b.discoDadosBytes - a.discoDadosBytes, discoWalBytes: b.discoWalBytes - a.discoWalBytes,
  walGeradoBytes: walEntre(a, b), tempBytes: b.tempBytes - a.tempBytes, tempArquivos: b.tempArquivos - a.tempArquivos,
});

// Uma carga completa pela CLI: plan (orçamento), aprovação administrativa, apply, medição antes/depois.
function carregar(rotulo, { exibicao, revisao }) {
  const opcoes = ['--alvo', URL_EX, '--exibicao', exibicao, '--revisao', String(revisao)];
  const arquivoSql = path.join(LOCAL, `aprovacao-${rotulo}.sql`);
  const antes = instantaneo();
  const planoInicio = performance.now();
  const plano = cli(['plan', ...opcoes, '--sql', arquivoSql]);
  const planoMs = Math.round(performance.now() - planoInicio);
  if (plano.paradas.length) throw new Error(`plano com parada: ${plano.paradas}`);
  sqlAdmin(readFileSync(arquivoSql, 'utf8'));
  const r = cli(['apply', ...opcoes, '--identidade', plano.identidade]);
  const depois = instantaneo();
  const d = diferenca(antes, depois);
  return {
    rotulo, exibicao, revisao, identidade: plano.identidade, resultado: r.result, planoMs, applyMs: r.ms, tentativas: r.tentativas,
    trafegoCliente: r.metricas, rssPicoCliente: r.memoria.maxRssBytes,
    payloadBytes: plano.bytesPayload, payloadPorTabela: plano.bytesPorTabela,
    estimativaPlano: plano.orcamento, persistidoPublicBytes: d.publicTotalBytes,
    razaoPersistidoPorPayload: Number((d.publicTotalBytes / plano.bytesPayload).toFixed(3)),
    delta: d, antes: { bancoLogicoBytes: antes.bancoLogicoBytes }, depois,
  };
}

// --- API do RP --------------------------------------------------------------------------------
async function criarRp() {
  const senha = randomBytes(18).toString('base64url');
  const r = await requisitar(L.api, '/auth/v1/admin/users', { metodo: 'POST', chave: L.servico, token: L.servico, corpo: { email: RP_EMAIL, password: senha, email_confirm: true } });
  if (r.status !== 200) throw new Error(`usuário fictício: ${r.status}`);
  sqlAdmin(`insert into privado.responsaveis_autorizados values ('${r.json.id}');`);
  const t = await requisitar(L.api, '/auth/v1/token?grant_type=password', { metodo: 'POST', chave: L.anon, corpo: { email: RP_EMAIL, password: senha } });
  return { id: r.json.id, token: t.json.access_token };
}

async function chamar(rp, metodo, caminho, corpo) {
  const ini = performance.now();
  const h = { apikey: L.anon, Authorization: `Bearer ${rp.token}`, 'Accept-Encoding': 'gzip' };
  if (corpo) h['Content-Type'] = 'application/json';
  const r = await fetch(`${L.api}${caminho}`, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined });
  const buf = Buffer.from(await r.arrayBuffer());
  return {
    status: r.status, ms: Math.round(performance.now() - ini), bytesBrutos: buf.length, bytesGzipEstimado: gzipSync(buf, { level: 6 }).length,
    cabecalhoContentEncoding: r.headers.get('content-encoding'), cabecalhoContentLength: r.headers.get('content-length'),
  };
}

const soma = (rs) => ({ requisicoes: rs.length, bytesBrutos: rs.reduce((s, r) => s + r.bytesBrutos, 0), bytesGzipEstimado: rs.reduce((s, r) => s + r.bytesGzipEstimado, 0), msTotal: rs.reduce((s, r) => s + r.ms, 0) });

async function medirApi(rp, cargaId) {
  const municipioTop = sqlAdmin(`select municipio_codigo from public.deteccoes where carga_id = ${cargaId} group by 1 order by count(*) desc limit 1;`);
  const rpc = (nome, corpo) => chamar(rp, 'POST', `/rest/v1/rpc/${nome}`, corpo);
  const janela = { p_inicio: '2025-11-01', p_fim: '2026-10-31' };
  const consultas = {
    resumoJanelaInteira: await rpc('consultar_resumo', janela),
    resumoMesMunicipio: await rpc('consultar_resumo', { p_inicio: '2026-10-01', p_fim: '2026-10-31', p_municipio: Number(municipioTop) }),
    deteccoesPagina1000: await rpc('consultar_deteccoes', { ...janela, p_limite: 1000, p_deslocamento: 0 }),
    disponibilidadeJanelaInteira: await rpc('consultar_disponibilidade', janela),
    disponibilidadeMunicipio365Dias: await rpc('consultar_disponibilidade', { ...janela, p_municipio: Number(municipioTop) }),
  };
  const listaMunicipios = await chamar(rp, 'GET', `/rest/v1/municipios?select=codigo,nome&carga_id=eq.${cargaId}&order=nome`);
  const todasGeometrias = await chamar(rp, 'GET', `/rest/v1/municipios?select=codigo,geometria_exibicao&carga_id=eq.${cargaId}`);
  const codigos = sqlAdmin(`select codigo from public.municipios where carga_id = ${cargaId} order by codigo;`).split('\n');
  const porMunicipio = [];
  for (const c of codigos) porMunicipio.push(await chamar(rp, 'GET', `/rest/v1/municipios?select=codigo,geometria_exibicao&carga_id=eq.${cargaId}&codigo=eq.${c}`));
  const tamanhos = porMunicipio.map((r) => r.bytesBrutos).sort((a, b) => a - b);
  const dezEmDemanda = soma(porMunicipio.slice(0, 10));
  const q = (p) => tamanhos[Math.min(tamanhos.length - 1, Math.floor(p * tamanhos.length))];
  return {
    consultas, listaMunicipios, geometriaConjuntoEmUmaRequisicao: todasGeometrias,
    geometriaPorMunicipio: { ...soma(porMunicipio), minimoBytes: tamanhos[0], medianaBytes: q(0.5), p90Bytes: q(0.9), maximoBytes: tamanhos.at(-1) },
    geometriaDezMunicipiosEmDemanda: dezEmDemanda,
    aberturaComGeometriaDoConjunto: soma([consultas.resumoJanelaInteira, listaMunicipios, todasGeometrias]),
    aberturaSemGeometria: soma([consultas.resumoJanelaInteira, listaMunicipios]),
  };
}

// Tamanho persistido da geometria de exibição (com compressão TOAST) por município e do conjunto.
const geometriaPersistida = (cargaId) => JSON.parse(sqlAdmin(`select jsonb_build_object('municipios', count(*), 'bytesPersistidosToast', sum(pg_column_size(geometria_exibicao)),
  'bytesTexto', sum(octet_length(geometria_exibicao::text)), 'medianaPersistida', percentile_disc(0.5) within group (order by pg_column_size(geometria_exibicao)),
  'maximoPersistido', max(pg_column_size(geometria_exibicao)))::text from public.municipios where carga_id = ${cargaId};`));

function expirarEVacuo() {
  const antes = instantaneo();
  const exp = cli(['expirar', '--alvo', URL_EX]);
  const aposExpirar = instantaneo();
  sqlAdmin('vacuum (analyze) public.fontes, public.malhas, public.municipios, public.deteccoes, public.disponibilidade, public.cargas;');
  const aposVacuo = instantaneo();
  return {
    cargasExpiradas: exp.cargas.length, linhasRemovidas: exp.cargas.reduce((s, c) => s + Object.values(c.linhas).reduce((a, n) => a + n, 0), 0),
    antes: { publicTotalBytes: antes.publicTotalBytes, bancoLogicoBytes: antes.bancoLogicoBytes, discoDadosBytes: antes.discoDadosBytes },
    aposExpirarSemVacuo: { publicTotalBytes: aposExpirar.publicTotalBytes, bancoLogicoBytes: aposExpirar.bancoLogicoBytes, linhasMortas: Object.values(aposExpirar.tabelas).reduce((s, t) => s + t.linhasMortas, 0) },
    aposVacuo: { publicTotalBytes: aposVacuo.publicTotalBytes, bancoLogicoBytes: aposVacuo.bancoLogicoBytes, discoDadosBytes: aposVacuo.discoDadosBytes, linhasMortas: Object.values(aposVacuo.tabelas).reduce((s, t) => s + t.linhasMortas, 0) },
  };
}

// --- Execução ---------------------------------------------------------------------------------
sqlAdmin(`alter role rq_executor login password '${verificadorScram(senhaEx)}';`);
const rp = await criarRp();
const relatorio = { geradoEm: new Date().toISOString(), ferramentas: { node: process.version, postgres: sqlAdmin("select current_setting('server_version');"), cli: 'node scripts/banco/carga.mjs (pg 8.23.1)' }, base: instantaneo() };
try {
  const idDe = (identidade) => sqlAdmin(`select id from public.cargas where identidade = '${identidade}';`);
  relatorio.cargaA = carregar('intermediaria-r1', { exibicao: 'intermediaria', revisao: 1 });
  relatorio.cargaA.geometriaPersistida = geometriaPersistida(idDe(relatorio.cargaA.identidade));
  relatorio.cargaA.api = await medirApi(rp, idDe(relatorio.cargaA.identidade));

  // Reexecução: nenhuma linha nova, nenhuma publicação nova (idempotência medida).
  const antesRe = instantaneo();
  const re = cli(['apply', '--alvo', URL_EX, '--exibicao', 'intermediaria', '--revisao', '1', '--identidade', relatorio.cargaA.identidade]);
  relatorio.reexecucao = { resultado: re.result, ms: re.ms, publicTotalBytesDelta: instantaneo().publicTotalBytes - antesRe.publicTotalBytes, consultas: re.metricas.consultas };

  // Pico: versão anterior retirada (linhas ainda presentes) + versão nova publicada.
  relatorio.cargaB = carregar('intermediaria-r2', { exibicao: 'intermediaria', revisao: 2 });
  relatorio.pico = { publicTotalBytes: relatorio.cargaB.depois.publicTotalBytes, bancoLogicoBytes: relatorio.cargaB.depois.bancoLogicoBytes, discoDadosBytes: relatorio.cargaB.depois.discoDadosBytes, discoWalBytes: relatorio.cargaB.depois.discoWalBytes };
  relatorio.expiracao = expirarEVacuo();

  // Três qualidades de geometria de exibição: persistido, carga e API.
  relatorio.geometrias = {};
  for (const [i, q] of ['minima', 'maxima'].entries()) {
    const c = carregar(`${q}-r1`, { exibicao: q, revisao: 10 + i });
    const id = idDe(c.identidade);
    relatorio.geometrias[q] = { applyMs: c.applyMs, payloadMunicipiosBytes: c.payloadPorTabela.municipios, persistido: geometriaPersistida(id), delta: { publicTotalBytes: c.delta.publicTotalBytes, walGeradoBytes: c.delta.walGeradoBytes }, api: await medirApi(rp, id) };
  }
  relatorio.geometrias.intermediaria = { applyMs: relatorio.cargaA.applyMs, payloadMunicipiosBytes: relatorio.cargaA.payloadPorTabela.municipios, persistido: relatorio.cargaA.geometriaPersistida, api: relatorio.cargaA.api };
  relatorio.final = instantaneo();
} finally {
  sqlAdmin(`alter role rq_executor nologin password null;
begin;
delete from public.publicacao_vigente;
update public.cargas set estado = 'retirada' where estado = 'publicada';
delete from public.disponibilidade; delete from public.deteccoes; delete from public.municipios; delete from public.malhas; delete from public.fontes;
delete from public.cargas; delete from privado.manifestos_aprovados;
delete from privado.responsaveis_autorizados where user_id = '${rp.id}';
commit;`);
  await requisitar(L.api, `/auth/v1/admin/users/${rp.id}`, { metodo: 'DELETE', chave: L.servico, token: L.servico });
}
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'medicao-carga.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(resumir(relatorio), null, 2)}\n`);

function resumir(r) {
  const mb = (n) => Number((n / 1e6).toFixed(2));
  const carga = (c) => ({
    resultado: c.resultado, applyMs: c.applyMs, tentativas: c.tentativas, payloadMB: mb(c.payloadBytes), persistidoPublicMB: mb(c.persistidoPublicBytes), razaoPersistidoPorPayload: c.razaoPersistidoPorPayload,
    estimativaPlanoMB: mb(c.estimativaPlano.estimativaNova), walGeradoMB: mb(c.delta.walGeradoBytes), tempBytes: c.delta.tempBytes, deltaBancoLogicoMB: mb(c.delta.bancoLogicoBytes),
    deltaDiscoDadosMB: mb(c.delta.discoDadosBytes), trafegoCliente: { consultas: c.trafegoCliente.consultas, conexoes: c.trafegoCliente.conexoes, enviadoMB: mb(c.trafegoCliente.bytesEnviados), recebidoKB: Math.round(c.trafegoCliente.bytesRecebidos / 1e3) },
    rssPicoClienteMB: mb(c.rssPicoCliente),
  });
  return {
    base: { bancoLogicoMB: mb(r.base.bancoLogicoBytes), discoDadosMB: mb(r.base.discoDadosBytes) }, cargaA: carga(r.cargaA), reexecucao: r.reexecucao, cargaB: carga(r.cargaB),
    pico: { publicMB: mb(r.pico.publicTotalBytes), bancoLogicoMB: mb(r.pico.bancoLogicoBytes), discoDadosMB: mb(r.pico.discoDadosBytes), discoWalMB: mb(r.pico.discoWalBytes) },
    expiracao: r.expiracao, final: { bancoLogicoMB: mb(r.final.bancoLogicoBytes), discoDadosMB: mb(r.final.discoDadosBytes) },
    geometrias: Object.fromEntries(Object.entries(r.geometrias).map(([q, g]) => [q, {
      persistidoToastMB: mb(g.persistido.bytesPersistidosToast), textoMB: mb(g.persistido.bytesTexto), medianaPersistidaKB: Math.round(g.persistido.medianaPersistida / 1e3), maximoPersistidoKB: Math.round(g.persistido.maximoPersistido / 1e3),
      apiConjunto1Req: { brutosKB: Math.round(g.api.geometriaConjuntoEmUmaRequisicao.bytesBrutos / 1e3), gzipKB: Math.round(g.api.geometriaConjuntoEmUmaRequisicao.bytesGzipEstimado / 1e3), ms: g.api.geometriaConjuntoEmUmaRequisicao.ms },
      apiPorMunicipio142Req: { brutosKB: Math.round(g.api.geometriaPorMunicipio.bytesBrutos / 1e3), gzipKB: Math.round(g.api.geometriaPorMunicipio.bytesGzipEstimado / 1e3), medianaKB: Math.round(g.api.geometriaPorMunicipio.medianaBytes / 1e3), maximoKB: Math.round(g.api.geometriaPorMunicipio.maximoBytes / 1e3) },
      dezMunicipios: { requisicoes: 10, brutosKB: Math.round(g.api.geometriaDezMunicipiosEmDemanda.bytesBrutos / 1e3), gzipKB: Math.round(g.api.geometriaDezMunicipiosEmDemanda.bytesGzipEstimado / 1e3) },
    }])),
    apiIntermediaria: Object.fromEntries(Object.entries(r.cargaA.api.consultas).map(([k, v]) => [k, { status: v.status, brutosKB: Math.round(v.bytesBrutos / 1e3), gzipKB: Math.round(v.bytesGzipEstimado / 1e3), ms: v.ms }])),
    aberturas: { semGeometria: r.cargaA.api.aberturaSemGeometria, comGeometriaDoConjunto: r.cargaA.api.aberturaComGeometriaDoConjunto },
  };
}
