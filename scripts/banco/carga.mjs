// Ciclo 003, issue #22 — executor de carga (EX): plan, apply, expirar e resumo.
// Mecanismo escolhido: UMA transação READ COMMITTED no cliente `pg` (ver ADR-006): carga em
// preparação, linhas, publicação, troca da versão vigente e retirada da anterior confirmam juntas.
// Identidade única + trava de linha da publicação vigente tratam a concorrência; commit ambíguo é
// reconciliado pela identidade da carga. Nenhum `force`, limpeza destrutiva ou lote/checkpoint.
// O alvo vem de `--alvo` (URL sem senha) e a senha do EX só de RQ_EXECUTOR_PASSWORD.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import pg from 'pg';
import { EXIBICAO_PADRAO, bytesDoPayload, camposDaCarga, carregarEntradas, construirCarga, sqlAprovacao } from './manifesto.mjs';

export const TETO_BANCO_BYTES = 400_000_000;
// Fator sobre os bytes do JSON a gravar para estimar o persistido (tabelas, TOAST e índices; sem WAL).
// Medido com a carga integral do item 1: 1,14–1,15 (ADR-006). Usa-se 1,5, cerca de 30% de folga.
export const FATOR_PERSISTENCIA = 1.5;
const PONTOS_CONSTRAINT_CONCORRENTE = new Set(['cargas_identidade_key', 'publicacao_vigente_pkey']);
const TABELAS_FILHAS = ['fontes', 'malhas', 'municipios', 'deteccoes', 'disponibilidade'];
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

// --- Alvo e conexão -------------------------------------------------------------------------

// Alvo explícito, sem senha na URL. Fora do loopback exige TLS.
export function resolverAlvo(texto, ambiente = process.env) {
  if (!texto) throw new Error('Informe o alvo com --alvo postgresql://rq_executor@HOST:PORTA/BANCO.');
  const u = new URL(texto);
  if (!['postgres:', 'postgresql:'].includes(u.protocol)) throw new Error('O alvo precisa ser uma URL postgresql://.');
  if (u.password) throw new Error('A URL do alvo não pode conter senha; use a variável RQ_EXECUTOR_PASSWORD.');
  // O pooler do Supabase exige `papel.<referência do projeto>`; o papel continua sendo o EX.
  if (!/^rq_executor(\.[a-z0-9]{8,32})?$/.test(decodeURIComponent(u.username))) throw new Error('O alvo deve usar o papel rq_executor (EX), nunca outra credencial.');
  const local = LOOPBACK.has(u.hostname);
  const modo = u.searchParams.get('sslmode');
  if (!local && !['require', 'verify-ca', 'verify-full'].includes(modo)) throw new Error('Alvo fora do loopback exige sslmode=require (ou verify-*).');
  const senha = ambiente.RQ_EXECUTOR_PASSWORD;
  if (!senha) throw new Error('Defina RQ_EXECUTOR_PASSWORD no ambiente do processo (nunca como argumento).');
  return {
    host: u.hostname.replace(/^\[|\]$/g, ''), port: Number(u.port || 5432), user: decodeURIComponent(u.username), password: senha,
    database: decodeURIComponent(u.pathname.slice(1)) || 'postgres', ssl: local ? false : true, local,
  };
}

export const novasMetricas = () => ({ conexoes: 0, consultas: 0, bytesEnviados: 0, bytesRecebidos: 0 });

// Fábrica de clientes: cada tentativa usa conexão própria; as métricas somam todas.
export function criarFabrica(config, metricas = novasMetricas()) {
  const { local: _local, ...cfg } = config;
  return async function novoCliente() {
    const c = new pg.Client({ ...cfg, application_name: 'rq-carga', connectionTimeoutMillis: 15000 });
    c.on('error', () => {}); // fim abrupto da conexão aparece na consulta em curso, não como exceção solta
    const consultar = c.query.bind(c);
    c.query = (...a) => {
      metricas.consultas += 1;
      return consultar(...a);
    };
    const encerrar = c.end.bind(c);
    c.end = async () => {
      const s = c.connection?.stream;
      if (s) {
        metricas.bytesEnviados += s.bytesWritten ?? 0;
        metricas.bytesRecebidos += s.bytesRead ?? 0;
      }
      return encerrar();
    };
    await c.connect();
    metricas.conexoes += 1;
    await consultar("set statement_timeout = '600s'");
    c.pid = (await consultar('select pg_backend_pid() as pid')).rows[0].pid;
    return c;
  };
}

async function fechar(c) {
  try {
    await c.end();
  } catch { /* conexão já encerrada */ }
}

// --- Estado de uma carga pela identidade ----------------------------------------------------

const SQL_ESTADO = `
select c.id, c.estado, coalesce((select v.carga_id = c.id from public.publicacao_vigente v), false) as vigente,
  c.total_principal, c.total_envelope, c.total_municipios, c.total_disponibilidade,
  (select count(*) from public.deteccoes d where d.carga_id = c.id and d.escopo = 'principal')::int as principal,
  (select count(*) from public.deteccoes d where d.carga_id = c.id and d.escopo = 'envelope')::int as envelope,
  (select count(*) from public.municipios m where m.carga_id = c.id)::int as municipios,
  (select count(*) from public.disponibilidade v where v.carga_id = c.id)::int as disponibilidade
from public.cargas c where c.identidade = $1`;

// ausente | concluida | retirada | ambigua (carga em preparação ou publicada fora da vigência).
export async function classificar(c, identidade) {
  const r = (await c.query(SQL_ESTADO, [identidade])).rows[0];
  if (!r) return { situacao: 'ausente' };
  const contagens = { principal: r.principal, envelope: r.envelope, municipios: r.municipios, disponibilidade: r.disponibilidade };
  const completa = r.principal === r.total_principal && r.envelope === r.total_envelope
    && r.municipios === r.total_municipios && r.disponibilidade === r.total_disponibilidade;
  if (r.estado === 'retirada') return { situacao: 'retirada', cargaId: Number(r.id), contagens };
  if (r.estado === 'publicada' && r.vigente && completa) return { situacao: 'concluida', cargaId: Number(r.id), contagens };
  return { situacao: 'ambigua', cargaId: Number(r.id), estado: r.estado, vigente: r.vigente, completa, contagens };
}

// --- Inserção -------------------------------------------------------------------------------

const INSERCOES = {
  fontes: `insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
    select $1, x.chave, x.papel, x.url, x.sha256, x.bytes, x.obtida_em, x.condicoes_uso
    from jsonb_to_recordset($2::jsonb) as x(chave text, papel text, url text, sha256 text, bytes bigint, obtida_em timestamptz, condicoes_uso text)`,
  malhas: `insert into public.malhas (carga_id, uso, fonte_chave, qualidade, parametros)
    select $1, x.uso, x.fonte_chave, x.qualidade, x.parametros
    from jsonb_to_recordset($2::jsonb) as x(uso text, fonte_chave text, qualidade text, parametros jsonb)`,
  municipios: `insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
    select $1, x.codigo, x.nome, x.geometria_exibicao
    from jsonb_to_recordset($2::jsonb) as x(codigo int, nome text, geometria_exibicao jsonb)`,
  deteccoes: `insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt, latitude, longitude,
      municipio_codigo, posicao, municipio_inpe, estado_inpe)
    select $1, x.id_tecnico, x.fonte_chave, x.linha, x.id_fonte, x.escopo, x.data_hora_gmt, x.latitude, x.longitude,
      x.municipio_codigo, x.posicao, x.municipio_inpe, x.estado_inpe
    from jsonb_to_recordset($2::jsonb) as x(id_tecnico text, fonte_chave text, linha int, id_fonte text, escopo text, data_hora_gmt timestamptz,
      latitude float8, longitude float8, municipio_codigo int, posicao text, municipio_inpe int, estado_inpe int)`,
  disponibilidade: `insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico, avisos)
    select $1, x.dia, x.satelite, x.municipio_codigo, x.classe, array(select jsonb_array_elements_text(x.motivos)),
      x.alcance_historico, array(select jsonb_array_elements_text(x.avisos))
    from jsonb_to_recordset($2::jsonb) as x(dia date, satelite text, municipio_codigo int, classe text, motivos jsonb, alcance_historico text, avisos jsonb)`,
};

const SQL_CARGA = `insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim, fuso_sensibilidade,
    metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12) returning id`;

// --- apply ----------------------------------------------------------------------------------

// Resultados (contrato de handoff v2): executed | already_executed_and_reconciled |
// ambiguous_human_intervention_required | not_executed. `gancho(ponto, { pid })` existe para os
// testes de falha; em produção é nulo.
export async function aplicar({ novoCliente, manifesto, identidade, dados, gancho = async () => {} }) {
  const inicio = performance.now();
  const campos = camposDaCarga(manifesto, identidade);
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const r = await tentar({ novoCliente, campos, identidade, dados, gancho });
    if (r) return { identidade, tentativas: tentativa, ms: Math.round(performance.now() - inicio), ...r };
  }
  return { identidade, tentativas: 3, ms: Math.round(performance.now() - inicio), result: 'ambiguous_human_intervention_required', motivo: 'concorrencia_nao_resolvida' };
}

// Devolve o resultado, ou null para repetir (concorrência resolvida por outra conexão).
async function tentar({ novoCliente, campos, identidade, dados, gancho }) {
  const c = await novoCliente();
  let commitEnviado = false;
  const ctx = { pid: c.pid };
  try {
    const antes = await classificar(c, identidade);
    if (antes.situacao === 'concluida') return { result: 'already_executed_and_reconciled', motivo: 'carga_ja_publicada', cargaId: antes.cargaId, contagens: antes.contagens };
    if (antes.situacao === 'retirada') return { result: 'not_executed', motivo: 'carga_retirada', cargaId: antes.cargaId };
    if (antes.situacao === 'ambigua') return { result: 'ambiguous_human_intervention_required', motivo: `carga_${antes.estado}_sem_conclusao`, cargaId: antes.cargaId, contagens: antes.contagens };

    const aprovado = (await c.query('select 1 from privado.manifestos_aprovados where identidade = $1', [identidade])).rowCount === 1;
    if (!aprovado) return { result: 'not_executed', motivo: 'manifesto_nao_aprovado' };

    await c.query('begin isolation level read committed');
    await gancho('inicio', ctx);
    const v = campos;
    const { rows } = await c.query(SQL_CARGA, [v.identidade, v.satelite, v.janela_inicio, v.janela_fim, v.envelope_inicio, v.envelope_fim,
      v.fuso_sensibilidade, JSON.stringify(v.metodo), v.total_principal, v.total_envelope, v.total_municipios, v.total_disponibilidade]);
    const id = Number(rows[0].id);
    await gancho('apos_carga', ctx);
    for (const tabela of TABELAS_FILHAS) {
      await c.query(INSERCOES[tabela], [id, JSON.stringify(dados[tabela])]);
      await gancho(`apos_${tabela}`, ctx);
    }
    const anterior = (await c.query('select carga_id from public.publicacao_vigente for update')).rows[0]?.carga_id ?? null;
    await c.query("update public.cargas set estado = 'publicada' where id = $1", [id]);
    if (anterior === null) await c.query('insert into public.publicacao_vigente (carga_id) values ($1)', [id]);
    else await c.query('update public.publicacao_vigente set carga_id = $1, atualizada_em = now() where unica', [id]);
    if (anterior !== null && Number(anterior) !== id) await c.query("update public.cargas set estado = 'retirada' where id = $1", [anterior]);
    await gancho('antes_commit', ctx);
    commitEnviado = true;
    await c.query('commit');
    await gancho('depois_commit', ctx);
    return { result: 'executed', cargaId: id, anteriorRetirada: anterior === null ? null : Number(anterior), contagens: (await classificar(c, identidade)).contagens };
  } catch (e) {
    await c.query('rollback').catch(() => {});
    if (!commitEnviado && PONTOS_CONSTRAINT_CONCORRENTE.has(e.constraint)) return null; // outra conexão venceu; reavaliar pela identidade
    return reconciliar({ novoCliente, identidade, commitEnviado, erro: e });
  } finally {
    await fechar(c);
  }
}

// Depois de um erro: confere pela identidade, em conexão nova, o que realmente aconteceu.
async function reconciliar({ novoCliente, identidade, commitEnviado, erro }) {
  const base = { erro: String(erro.message).slice(0, 300), codigoErro: erro.code ?? null };
  let verificada;
  const c = await novoCliente().catch(() => null);
  if (!c) {
    return commitEnviado
      ? { result: 'ambiguous_human_intervention_required', motivo: 'commit_sem_confirmacao_e_sem_conexao', ...base }
      : { result: 'not_executed', motivo: 'falha_antes_do_commit_sem_conexao', ...base };
  }
  try {
    verificada = await classificar(c, identidade);
  } catch (e) {
    return { result: 'ambiguous_human_intervention_required', motivo: 'conferencia_falhou', ...base, erroConferencia: String(e.message).slice(0, 200) };
  } finally {
    await fechar(c);
  }
  if (verificada.situacao === 'concluida') return { result: 'already_executed_and_reconciled', motivo: commitEnviado ? 'commit_confirmado_pela_identidade' : 'concluida_por_outra_conexao', cargaId: verificada.cargaId, contagens: verificada.contagens, ...base };
  if (verificada.situacao === 'ausente') return { result: 'not_executed', motivo: commitEnviado ? 'commit_nao_ocorreu_reexecutavel' : 'falha_antes_do_commit', ...base };
  return { result: 'ambiguous_human_intervention_required', motivo: `estado_${verificada.situacao}_apos_erro`, cargaId: verificada.cargaId, ...base };
}

// --- plan -----------------------------------------------------------------------------------

export function avaliarOrcamento({ consumoExistente, bytesPayload, fator = FATOR_PERSISTENCIA, teto = TETO_BANCO_BYTES }) {
  if (!Number.isFinite(consumoExistente) || !Number.isFinite(bytesPayload) || bytesPayload <= 0) {
    return { parar: true, motivo: 'estimativa_insuficiente_para_provar_margem' };
  }
  const estimativaNova = Math.ceil(bytesPayload * fator);
  // A versão vigente permanece durante a carga: o pico soma o consumo existente e a nova versão.
  const pico = consumoExistente + estimativaNova;
  return { consumoExistente, estimativaNova, picoPrevisto: pico, teto, margem: teto - pico, fator, parar: pico > teto, motivo: pico > teto ? 'pico_acima_do_teto_de_banco' : null };
}

export async function consultarAlvo(c, identidade) {
  const { rows } = await c.query(`select pg_database_size(current_database())::bigint as bytes,
    (select v.carga_id from public.publicacao_vigente v) as vigente_id,
    (select ca.identidade from public.publicacao_vigente v join public.cargas ca on ca.id = v.carga_id) as vigente_identidade,
    exists (select 1 from privado.manifestos_aprovados where identidade = $1) as aprovado,
    current_setting('server_version') as postgres`, [identidade]);
  const r = rows[0];
  return { consumoExistente: Number(r.bytes), vigente: r.vigente_id === null ? null : { id: Number(r.vigente_id), identidade: r.vigente_identidade }, aprovado: r.aprovado, postgres: r.postgres, carga: await classificar(c, identidade) };
}

export async function planejar({ novoCliente, manifesto, identidade, dados }) {
  const bytesPorTabela = bytesDoPayload(dados);
  const bytesPayload = Object.values(bytesPorTabela).reduce((s, n) => s + n, 0);
  const plano = { identidade, totais: manifesto.totais, janela: manifesto.janela, envelope: manifesto.envelope, metodo: manifesto.metodo, bytesPayload, bytesPorTabela, pendencias: [], paradas: [] };
  if (!novoCliente) {
    plano.alvo = null;
    plano.orcamento = avaliarOrcamento({ consumoExistente: NaN, bytesPayload });
    plano.paradas.push('sem_consulta_ao_alvo');
    return plano;
  }
  const c = await novoCliente();
  try {
    const alvo = await consultarAlvo(c, identidade);
    plano.alvo = { postgres: alvo.postgres, vigente: alvo.vigente, carga: alvo.carga };
    plano.orcamento = avaliarOrcamento({ consumoExistente: alvo.consumoExistente, bytesPayload });
    if (alvo.carga.situacao === 'concluida') plano.pendencias.push('carga_ja_publicada_reexecucao_nao_altera');
    if (alvo.carga.situacao === 'retirada') plano.paradas.push('carga_retirada');
    if (alvo.carga.situacao === 'ambigua') plano.paradas.push('carga_em_estado_ambiguo');
    if (!alvo.aprovado && alvo.carga.situacao !== 'concluida') plano.pendencias.push('manifesto_nao_aprovado');
    if (plano.orcamento.parar) plano.paradas.push(plano.orcamento.motivo);
  } finally {
    await fechar(c);
  }
  return plano;
}

// --- expirar --------------------------------------------------------------------------------

// Apaga as LINHAS de cargas retiradas (a carga e o manifesto ficam como registro). Nunca toca na vigente.
export async function expirar({ novoCliente, simular = false }) {
  const c = await novoCliente();
  try {
    await c.query('begin isolation level read committed');
    const cargas = (await c.query(`select id, identidade from public.cargas ca where estado = 'retirada'
      and not exists (select 1 from public.publicacao_vigente v where v.carga_id = ca.id) order by id`)).rows;
    const removidas = [];
    for (const ca of cargas) {
      const n = {};
      for (const tabela of ['disponibilidade', 'deteccoes', 'municipios', 'malhas', 'fontes']) {
        n[tabela] = simular
          ? (await c.query(`select count(*)::int as n from public.${tabela} where carga_id = $1`, [ca.id])).rows[0].n
          : (await c.query(`delete from public.${tabela} where carga_id = $1`, [ca.id])).rowCount;
      }
      removidas.push({ id: Number(ca.id), identidade: ca.identidade, linhas: n });
    }
    await c.query(simular ? 'rollback' : 'commit');
    return { simulado: simular, cargas: removidas };
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    await fechar(c);
  }
}

// --- resumo de conteúdo (comparação entre reconstruções) ------------------------------------

const EXPRESSOES = {
  fontes: ['chave, papel, url, sha256, bytes, obtida_em, condicoes_uso', 'chave'],
  malhas: ['uso, fonte_chave, qualidade, parametros', 'uso'],
  municipios: ['codigo, nome, geometria_exibicao', 'codigo'],
  deteccoes: ['id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe', 'id_tecnico'],
  disponibilidade: ['dia, satelite, municipio_codigo, classe, motivos, alcance_historico, avisos', 'municipio_codigo, dia, satelite'],
};

// Contagem e SHA-256 do conteúdo de cada tabela da carga vigente, sem a chave da carga (id varia).
export async function resumoDaVigente(c) {
  const id = (await c.query('select carga_id from public.publicacao_vigente')).rows[0]?.carga_id;
  if (id === undefined) return null;
  const carga = (await c.query(`select identidade, estado, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim, fuso_sensibilidade,
    metodo, total_principal, total_envelope, total_municipios, total_disponibilidade from public.cargas where id = $1`, [id])).rows[0];
  const tabelas = {};
  for (const [tabela, [colunas, ordem]] of Object.entries(EXPRESSOES)) {
    const r = (await c.query(`select count(*)::int as n, encode(sha256(convert_to(coalesce(string_agg(row(${colunas})::text, E'\\n' order by ${ordem}), ''), 'UTF8')), 'hex') as h
      from public.${tabela} where carga_id = $1`, [id])).rows[0];
    tabelas[tabela] = { linhas: r.n, sha256: r.h };
  }
  return { identidade: carga.identidade, estado: carga.estado, totais: { principal: carga.total_principal, envelope: carga.total_envelope, municipios: carga.total_municipios, disponibilidade: carga.total_disponibilidade }, tabelas };
}

// --- CLI ------------------------------------------------------------------------------------

function opcao(args, nome, padrao) {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : padrao;
}

async function carregar(args) {
  const exibicao = opcao(args, '--exibicao', EXIBICAO_PADRAO);
  const revisao = Number(opcao(args, '--revisao', 1));
  const entradas = await carregarEntradas({ exibicao });
  return construirCarga({ ...entradas, revisao });
}

export async function executarCli(args) {
  const [comando, ...resto] = args;
  const alvoTexto = opcao(resto, '--alvo');
  const offline = resto.includes('--offline');
  const imprimir = (o) => process.stdout.write(`${JSON.stringify(o, null, 2)}\n`);
  if (comando === 'plan') {
    const { manifesto, identidade, dados } = await carregar(resto);
    const sql = opcao(resto, '--sql');
    if (sql) await writeFile(sql, sqlAprovacao(manifesto, identidade));
    const fabrica = offline ? null : criarFabrica(resolverAlvo(alvoTexto));
    const plano = await planejar({ novoCliente: fabrica, manifesto, identidade, dados });
    plano.sqlAprovacao = sql ?? 'use --sql arquivo.sql para gravar o SQL administrativo de aprovação';
    imprimir(plano);
    process.exitCode = plano.paradas.length ? 3 : 0;
  } else if (comando === 'apply') {
    const { manifesto, identidade, dados } = await carregar(resto);
    if (opcao(resto, '--identidade') !== identidade) {
      throw new Error(`Informe --identidade ${identidade} (a do plano revisado). O apply não segue sem essa conferência.`);
    }
    const metricas = novasMetricas();
    const novoCliente = criarFabrica(resolverAlvo(alvoTexto), metricas);
    const plano = await planejar({ novoCliente, manifesto, identidade, dados });
    if (plano.paradas.length) {
      imprimir({ result: 'not_executed', motivo: 'plano_com_parada', paradas: plano.paradas, orcamento: plano.orcamento });
      process.exitCode = 3;
      return;
    }
    const r = await aplicar({ novoCliente, manifesto, identidade, dados });
    imprimir({ ...r, metricas, memoria: { maxRssBytes: process.resourceUsage().maxRSS * 1024 } });
    process.exitCode = r.result === 'executed' || r.result === 'already_executed_and_reconciled' ? 0 : r.result === 'not_executed' ? 3 : 4;
  } else if (comando === 'expirar') {
    imprimir(await expirar({ novoCliente: criarFabrica(resolverAlvo(alvoTexto)), simular: resto.includes('--simular') }));
  } else if (comando === 'resumo') {
    const novoCliente = criarFabrica(resolverAlvo(alvoTexto));
    const c = await novoCliente();
    try {
      imprimir(await resumoDaVigente(c));
    } finally {
      await fechar(c);
    }
  } else {
    process.stderr.write('Uso: node scripts/banco/carga.mjs <plan [--offline] [--sql arq] | apply --identidade HEX | expirar [--simular] | resumo> --alvo URL [--exibicao q] [--revisao n]\n');
    process.exitCode = 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  executarCli(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`erro: ${e.message}\n`);
    process.exitCode = 2;
  });
}
