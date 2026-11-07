// Ciclo 003, issue #21 — papel EX com login SQL real (senha por SCRAM, via TCP), dados fictícios.
// Correções da revisão G2: RS-1 (publicação concorrente com duas conexões), RS-4 (id da carga)
// e restrição de DDL, inclusive objetos temporários. Requer `npx supabase start`; roda em `npm run test:rls`.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { setTimeout as esperar } from 'node:timers/promises';
import { sqlAdmin, tentarSqlAdmin, tentarLogin, verificadorScram, SessaoSql } from './local.mjs';

const PREFIXO = 'e'.repeat(62);
const IDENT = { remocao: `${PREFIXO}01`, insercao: `${PREFIXO}02`, posterior: `${PREFIXO}03`, sequencia: `${PREFIXO}04` };
const DOS_TESTES = `select id from public.cargas where identidade like '${PREFIXO}%'`;

let s1;
let s2;
let senha;
const auditoria = () => sqlAdmin('select * from privado.auditar_exposicao();').split('\n').filter(Boolean);

// Carga mínima completa: 1 município × 1 dia GMT, 1 detecção principal, D1 completa.
const montar = (ident) => `
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
values ('${ident}', 'AQUA_M-T', '2026-10-01T00:00Z', '2026-10-02T00:00Z', 1, 0, 1, 1);
insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
select id, k, 'ficticia', 'https://exemplo.test/' || k, repeat('b', 64), 1, '2026-11-02T00:00Z', 'fictícia'
from public.cargas, unnest(array['focos', 'malha_max', 'malha_min']) k where identidade = '${ident}';
insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
select id, 'classificacao', 'malha_max', 'maxima' from public.cargas where identidade = '${ident}'
union all select id, 'exibicao', 'malha_min', 'minima' from public.cargas where identidade = '${ident}';
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select id, 9900001, 'Município Fictício', '{}' from public.cargas where identidade = '${ident}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
select id, 'd1', 'focos', 1, 'principal', '2026-10-01T12:00Z', -10, -55, 9900001, 'interior' from public.cargas where identidade = '${ident}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
select id, '2026-10-01', 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado'], 'verificado'
from public.cargas where identidade = '${ident}';
select id from public.cargas where identidade = '${ident}';`;

const detectar = (id, tecnico) => `insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt,
  latitude, longitude, municipio_codigo, posicao) values (${id}, '${tecnico}', 'focos', 9, 'principal', '2026-10-01T13:00Z', -10, -55, 9900001, 'interior');`;
const publicar = (id) => `update public.cargas set estado = 'publicada' where id = ${id};`;
const situacao = (id) => sqlAdmin(`select estado || ' ' || (select count(*) from public.deteccoes where carga_id = ${id}) from public.cargas where id = ${id};`);

async function montarCarga(ident) {
  const r = await s1.enviar(montar(ident));
  assert.equal(r.erros, '', r.erros);
  return r.saida;
}

// Espera até a outra conexão do EX ficar bloqueada aguardando trava de linha.
async function esperarBloqueio() {
  for (let i = 0; i < 400; i++) {
    if (sqlAdmin(`select count(*) from pg_stat_activity where usename = 'rq_executor' and wait_event_type = 'Lock';`) === '1') return;
    await esperar(25);
  }
  throw new Error('a publicação não ficou aguardando a trava da carga');
}

before(() => {
  assert.equal(sqlAdmin('select count(*) from public.cargas;'), '0', 'banco local deve estar vazio; rode `npx supabase db reset`.');
  // Janela de carga (D3): LOGIN ligado com senha gerada na hora, gravada só como verificador
  // SCRAM; não é impressa nem guardada. Fecha no after().
  senha = randomBytes(24).toString('base64url');
  sqlAdmin(`alter role rq_executor login password '${verificadorScram(senha)}';`);
  // Manifestos aprovados pelo administrador antes da carga.
  sqlAdmin(`insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo,
    total_principal, total_envelope, total_municipios, total_disponibilidade)
    select i, 'AQUA_M-T', '2026-10-01T00:00Z', '2026-10-02T00:00Z', 'America/Cuiaba', '{}', 1, 0, 1, 1
    from unnest(array['${IDENT.remocao}', '${IDENT.insercao}', '${IDENT.posterior}']) i;`);
  s1 = new SessaoSql('rq_executor', senha);
  s2 = new SessaoSql('rq_executor', senha);
});

after(async () => {
  await s1?.fechar();
  await s2?.fechar();
  sqlAdmin(`alter role rq_executor nologin password null;
begin;
update public.cargas set estado = 'retirada' where identidade like '${PREFIXO}%' and estado = 'publicada';
delete from public.fontes where carga_id in (${DOS_TESTES});
delete from public.municipios where carga_id in (${DOS_TESTES});
delete from public.cargas where identidade like '${PREFIXO}%';
delete from privado.manifestos_aprovados where identidade like '${PREFIXO}%';
commit;`);
});

test('EX: login SQL real, sem DDL nem objetos temporários', async () => {
  assert.equal((await s1.enviar('select session_user, current_user;')).saida, 'rq_executor|rq_executor');
  const negados = [
    'create table public.rq_x (i int);',
    'create temporary table rq_t (i int);',
    'create temporary view rq_v as select 1;',
    'create schema rq_s;',
    "create function public.rq_f() returns int language sql as 'select 1';",
    'create view public.rq_v as select 1;',
    'create index on public.deteccoes (linha);',
    'alter table public.deteccoes disable row level security;',
    'drop policy ex_le_deteccoes on public.deteccoes;',
    'create policy rq_p on public.deteccoes for select using (true);',
    'grant select on public.deteccoes to anon;',
    "comment on table public.cargas is 'x';",
    'truncate public.deteccoes;',
    'alter role rq_executor bypassrls;',
    'set role service_role;',
    'set role postgres;',
    'set session authorization postgres;',
    'select * from privado.responsaveis_autorizados;',
    `delete from privado.manifestos_aprovados;`,
    "select privado.conferir_papel_executor('rq_executor');",
  ];
  for (const sql of negados) {
    const r = await s1.enviar(sql);
    // GRANT sem opção de concessão só emite aviso e não concede nada (conferido abaixo).
    assert.match(r.erros, /ERROR: {2}(permission denied|must be owner|must be superuser|must be member)|WARNING: {2}no privileges were granted/,
      `${sql} → ${r.erros || 'aceito'}`);
  }
  assert.equal(sqlAdmin(`select has_table_privilege('anon', 'public.deteccoes', 'SELECT');`), 'f', 'anon continua sem privilégio');
  assert.equal((await s1.enviar('select current_user;')).saida, 'rq_executor', 'o EX continua sendo ele mesmo');
  assert.equal(sqlAdmin(`select count(*) from pg_shdepend where refobjid = 'rq_executor'::regrole and deptype = 'o';`), '0', 'EX não é dono de nada');
});

// D3 (opção a): o supautils do Supabase cria "extensões privilegiadas" como supabase_admin para
// qualquer papel com login, sem exigir CREATE e sem gatilhos de evento; nenhuma migração impede.
// Controle aceito pelo responsável: EX sem LOGIN fora da janela de carga e auditoria pós-carga.
test('D3: EX sem login fora da janela; extensão criada na janela aparece na auditoria', async () => {
  sqlAdmin('alter role rq_executor nologin;');
  try {
    const fechada = tentarLogin('rq_executor', senha);
    assert.equal(fechada.ok, false, 'login recusado com a janela fechada');
    assert.match(fechada.erro, /not permitted to log in/, fechada.erro);
  } finally {
    sqlAdmin('alter role rq_executor login;');
  }
  assert.deepEqual(tentarLogin('rq_executor', senha), { ok: true, saida: 'rq_executor', erro: '' });
  assert.deepEqual(auditoria(), ['rq_executor com LOGIN ligado'], 'janela aberta, nada exposto');

  // Lacuna da plataforma, aceita com controle: o EX consegue instalar a extensão.
  const r = await s1.enviar('create extension seg;');
  try {
    assert.equal(r.erros, '', 'supautils aceita a extensão para o EX (comportamento da plataforma)');
    const achados = auditoria();
    assert.ok(achados.includes('extensão seg no schema public'), achados.join('; '));
    assert.ok(achados.includes('função public.seg_center executável por anon'), achados.join('; '));
  } finally {
    tentarSqlAdmin('drop extension if exists seg;');
  }
  assert.deepEqual(auditoria(), ['rq_executor com LOGIN ligado'], 'remoção administrativa limpa a exposição');
});

test('RS-4: EX não escolhe o id da carga; a inserção normal usa a sequência', async () => {
  const proximo = sqlAdmin(`select coalesce(max(id), 0) + 1 from public.cargas;`);
  const colunas = 'identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade';
  const valores = `'${IDENT.sequencia}', 'AQUA_M-T', '2026-10-01T00:00Z', '2026-10-02T00:00Z', 0, 0, 1, 1`;
  const override = await s1.enviar(`insert into public.cargas (id, ${colunas}) overriding system value values (${proximo}, ${valores}) returning id;`);
  assert.match(override.erros, /permission denied for table cargas/, override.erros);
  for (const [coluna, valor] of [['estado', "'publicada'"], ['criada_em', "'2020-01-01'"], ['publicada_em', 'now()']]) {
    const r = await s1.enviar(`insert into public.cargas (${coluna}, ${colunas}) values (${valor}, ${valores});`);
    assert.match(r.erros, /permission denied for table cargas/, `${coluna}: ${r.erros}`);
  }
  const normal = await s1.enviar(`insert into public.cargas (${colunas}) values (${valores}) returning id, estado;`);
  assert.equal(normal.erros, '');
  const [id, estado] = normal.saida.split('|');
  assert.ok(Number(id) >= Number(proximo), `id ${id} vem da sequência`);
  assert.equal(estado, 'preparacao');
});

test('RS-1: remoção concorrente não deixa publicar contagem obsoleta', async () => {
  const id = await montarCarga(IDENT.remocao);

  // Publicador em REPEATABLE READ com snapshot anterior à remoção: recusado.
  assert.equal((await s2.enviar(`begin isolation level repeatable read; select count(*) from public.deteccoes where carga_id = ${id};`)).saida, '1');
  assert.equal((await s1.enviar(`delete from public.deteccoes where carga_id = ${id};`)).erros, '');
  const rr = await s2.enviar(publicar(id));
  assert.match(rr.erros, /publicacao_exige_read_committed: isolamento repeatable read/, rr.erros);
  await s2.enviar('rollback;');
  // SERIALIZABLE também é recusado: a regra é um snapshot por consulta, depois da trava.
  const ser = await s2.enviar(`begin isolation level serializable; ${publicar(id)}`);
  assert.match(ser.erros, /publicacao_exige_read_committed: isolamento serializable/, ser.erros);
  await s2.enviar('rollback;');
  assert.equal(situacao(id), 'preparacao 0');

  // READ COMMITTED: a publicação espera a remoção em curso e confere o estado já confirmado.
  assert.equal((await s1.enviar(detectar(id, 'd1'))).erros, '');
  assert.equal((await s1.enviar(`begin; delete from public.deteccoes where carga_id = ${id};`)).erros, '');
  const pendente = s2.enviar(publicar(id));
  await esperarBloqueio();
  await s1.enviar('commit;');
  const rc = await pendente;
  assert.match(rc.erros, /carga_incompleta: principal 0 de 1/, rc.erros);
  assert.equal(situacao(id), 'preparacao 0', 'carga continua em preparação, sem publicação');
});

test('RS-1: inserção concorrente não deixa publicar contagem obsoleta', async () => {
  const id = await montarCarga(IDENT.insercao);

  assert.equal((await s2.enviar(`begin isolation level repeatable read; select count(*) from public.deteccoes where carga_id = ${id};`)).saida, '1');
  assert.equal((await s1.enviar(detectar(id, 'extra'))).erros, '');
  const rr = await s2.enviar(publicar(id));
  assert.match(rr.erros, /publicacao_exige_read_committed: isolamento repeatable read/, rr.erros);
  await s2.enviar('rollback;');
  assert.equal(situacao(id), 'preparacao 2');
  assert.equal((await s1.enviar(`delete from public.deteccoes where carga_id = ${id} and id_tecnico = 'extra';`)).erros, '');

  assert.equal((await s1.enviar(`begin; ${detectar(id, 'extra')}`)).erros, '');
  const pendente = s2.enviar(publicar(id));
  await esperarBloqueio();
  await s1.enviar('commit;');
  const rc = await pendente;
  assert.match(rc.erros, /carga_incompleta: principal 2 de 1/, rc.erros);
  assert.equal(situacao(id), 'preparacao 2');

  // Controle: com a contagem real igual à declarada, a publicação em READ COMMITTED passa.
  assert.equal((await s1.enviar(`delete from public.deteccoes where carga_id = ${id} and id_tecnico = 'extra';`)).erros, '');
  assert.equal((await s2.enviar(publicar(id))).erros, '');
  assert.equal(situacao(id), 'publicada 1');
});

test('RS-1: gravação concorrente com a publicação não entra na carga publicada', async () => {
  const id = await montarCarga(IDENT.posterior);

  // A publicação trava a carga primeiro; a inserção espera e encontra a carga publicada.
  assert.equal((await s2.enviar(`begin; ${publicar(id)}`)).erros, '');
  const pendente = s1.enviar(detectar(id, 'tardia'));
  await esperarBloqueio();
  await s2.enviar('commit;');
  const rc = await pendente;
  assert.match(rc.erros, /carga_nao_esta_em_preparacao/, rc.erros);

  // Em REPEATABLE READ, com snapshot anterior a uma mudança de estado concorrente, a trava na
  // carga falha por serialização em vez de usar o estado obsoleto.
  assert.equal((await s1.enviar(`begin isolation level repeatable read; select estado from public.cargas where id = ${id};`)).saida, 'publicada');
  assert.equal((await s2.enviar(`update public.cargas set estado = 'retirada' where id = ${id};`)).erros, '');
  const rr = await s1.enviar(detectar(id, 'tardia'));
  assert.match(rr.erros, /could not serialize access due to concurrent update/, rr.erros);
  await s1.enviar('rollback;');
  assert.equal(situacao(id), 'retirada 1');
});
