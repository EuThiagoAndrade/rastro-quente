-- Ciclo 003, issue #21 — matriz AN/RP/OA/EX por SQL, com dados e UUIDs fictícios (G2).
-- Sequência: primeiro login sem autorização → cadastro administrativo → leitura RP → revogação.
-- Autorização nunca por e-mail ou metadado: OA traz e-mail e metadados que imitam o RP.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(47);

-- Identidades fictícias (domínio reservado .test). Não representam pessoas.
insert into auth.users (id, aud, role, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'rp@exemplo.test'),
  ('00000000-0000-4000-8000-0000000000a2', 'authenticated', 'authenticated', 'oa@exemplo.test');

-- Somente neste teste (desfeito no rollback): permite ao postgres assumir o papel EX.
-- Também concede ao EX o uso do schema do pgTAP, para registrar os resultados.
grant rq_executor to postgres with inherit false, set true;
grant usage on schema extensions to rq_executor;

-- EX: monta e publica a carga A (fictícia) dentro do protocolo.
set local role rq_executor;

select lives_ok($$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
    metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('a', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z',
    '{"regra_historico": "ficticia"}', 3, 1, 2, 2)
$$, 'EX cria carga em preparação');

select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('a', 64))
  insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
  select c.id, k.chave, k.papel, 'https://exemplo.test/' || k.chave, repeat('b', 64), 10, '2026-11-02T00:00Z', 'fictícia'
  from c, (values ('focos', 'focos_principal'), ('malha_max', 'malha'), ('malha_min', 'malha')) k(chave, papel)
$$, 'EX grava fontes');

select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('a', 64))
  insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
  select c.id, 'classificacao', 'malha_max', 'maxima' from c
  union all select c.id, 'exibicao', 'malha_min', 'minima' from c
$$, 'EX grava malhas de classificação e exibição');

select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('a', 64))
  insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
  select c.id, k.codigo, k.nome, '{"type":"Polygon","coordinates":[[[0,0],[1,0],[1,1],[0,0]]]}'
  from c, (values (9900001, 'Município Fictício A'), (9900002, 'Município Fictício B')) k(codigo, nome)
$$, 'EX grava municípios');

select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('a', 64))
  insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt,
    latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe)
  select c.id, k.id_tecnico, 'focos', k.linha, k.id_fonte, k.escopo, k.t::timestamptz, -10.5, -55.5, 9900001, 'interior', 9900001, 99
  from c, (values
    ('t1', 1, 'f1', 'principal', '2026-10-05T18:00Z'),
    ('t2', 2, 'f1', 'principal', '2026-10-06T18:00Z'),
    ('t3', 3, null, 'principal', '2026-10-31T23:00Z'),
    ('t4', 4, 'f4', 'envelope', '2026-11-01T02:00Z')
  ) k(id_tecnico, linha, id_fonte, escopo, t)
$$, 'EX grava detecções, com id_fonte repetido e nulo preservados');

select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('a', 64))
  insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
  select c.id, '2026-10-05', 'AQUA_M-T', k.codigo, 'sem_evidencia_de_lacuna', array['historico_nao_verificado', 'sem_aviso_incidente'], 'parcial'
  from c, (values (9900001), (9900002)) k(codigo)
$$, 'EX grava disponibilidade');

select lives_ok($$
  update public.cargas set estado = 'publicada' where identidade = repeat('a', 64)
$$, 'EX publica carga completa');

select lives_ok($$
  insert into public.publicacao_vigente (carga_id) select id from public.cargas where identidade = repeat('a', 64)
$$, 'EX define a publicação vigente');

-- EX fora da sua atribuição.
select throws_ok($$
  insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
  select id, 't9', 'focos', 9, 'principal', '2026-10-07T18:00Z', 0, 0, 9900001, 'interior' from public.cargas where identidade = repeat('a', 64)
$$, '23514', 'carga_nao_esta_em_preparacao', 'EX não acrescenta linhas a carga publicada');

select throws_ok($$ update public.deteccoes set latitude = 0 $$, '42501', null, 'EX não altera detecções');
select throws_ok($$ delete from public.deteccoes $$, '23514', 'carga_publicada_nao_pode_perder_linhas', 'EX não apaga linhas de carga publicada');
select throws_ok($$ truncate public.deteccoes $$, '42501', null, 'EX não trunca tabelas');
select throws_ok($$ update public.cargas set identidade = repeat('c', 64) $$, '42501', null, 'EX não altera a identidade da carga');
select throws_ok($$ update public.cargas set estado = 'preparacao' $$, '23514', null, 'EX não reabre carga publicada');
select throws_ok($$ update public.cargas set estado = 'retirada' $$, '23503', null, 'EX não retira a carga vigente');
select throws_ok($$ delete from public.cargas $$, '42501', null, 'EX não apaga cargas');
select throws_ok($$ select * from privado.responsaveis_autorizados $$, '42501', null, 'EX não lê a lista RP');
select throws_ok($$ insert into privado.responsaveis_autorizados values ('00000000-0000-4000-8000-0000000000a2') $$, '42501', null, 'EX não altera a lista RP');
select throws_ok($$ select privado.eh_responsavel() $$, '42501', null, 'EX não usa o helper de autorização');
select throws_ok($$ create table public.x (i int) $$, '42501', null, 'EX não cria tabelas');
select throws_ok($$ alter table public.deteccoes disable row level security $$, '42501', null, 'EX não desativa RLS');
select throws_ok($$ drop policy rp_le_deteccoes on public.deteccoes $$, '42501', null, 'EX não remove políticas');
select throws_ok($$ alter role rq_executor bypassrls $$, '42501', null, 'EX não se concede BYPASSRLS');

-- Carga B incompleta: fica em preparação e não pode ser publicada nem tornada vigente.
select lives_ok($$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('d', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', 5, 0, 1, 0)
$$, 'EX cria carga B em preparação');
select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('d', 64))
  insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
  select c.id, 9900001, 'Município Fictício A', '{}' from c
$$, 'EX grava parte da carga B');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('d', 64) $$,
  '23514', null, 'carga parcial não é publicada');
select throws_ok($$ update public.publicacao_vigente set carga_id = (select id from public.cargas where identidade = repeat('d', 64)) $$,
  '23503', null, 'carga em preparação não se torna vigente');
reset role;

-- AN: sem leitura, sem escrita, sem consultas.
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select * from public.deteccoes $$, '42501', null, 'AN não lê detecções');
select throws_ok($$ select * from public.cargas $$, '42501', null, 'AN não lê cargas');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', null, 'AN não executa consultas');
select throws_ok($$ insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('e', 64), 'AQUA_M-T', now(), now() + interval '1 day', 0, 0, 1, 0) $$, '42501', null, 'AN não grava');
reset role;

-- OA: autenticado, com e-mail e metadados que imitam o RP; nunca lê.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000a2", "role": "authenticated", "email": "rp@exemplo.test", "user_metadata": {"papel": "RP", "responsavel": true}, "app_metadata": {"papel": "RP"}}';
select is((select count(*)::int from public.deteccoes), 0, 'OA não vê detecções');
select is((select count(*)::int from public.publicacao_vigente), 0, 'OA não vê a publicação vigente');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'OA recebe acesso negado explícito');
select throws_ok($$ delete from public.deteccoes $$, '42501', null, 'OA não apaga');
select throws_ok($$ insert into privado.responsaveis_autorizados values ('00000000-0000-4000-8000-0000000000a2') $$, '42501', null, 'OA não se autoriza');
reset role;

-- RP no primeiro login, antes do cadastro administrativo: mesmo resultado de OA.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select is((select count(*)::int from public.deteccoes), 0, 'RP sem cadastro não vê detecções');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'RP sem cadastro recebe acesso negado');
reset role;

-- Cadastro administrativo (fora da aplicação) pelo UUID.
insert into privado.responsaveis_autorizados (user_id) values ('00000000-0000-4000-8000-0000000000a1');

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select is((select count(*)::int from public.cargas), 1, 'RP vê somente a carga publicada');
select is((select count(*)::int from public.deteccoes), 4, 'RP lê as detecções da carga publicada (principal e envelope)');
select is((select count(*)::int from public.municipios m join public.cargas c on c.id = m.carga_id where c.identidade = repeat('d', 64)), 0,
  'RP não lê linhas da carga em preparação');
select is((public.consultar_resumo('2026-10-01', '2026-10-31') -> 'principal' ->> 'total')::int, 3, 'RP consulta o total principal');
select throws_ok($$ insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('f', 64), 'AQUA_M-T', now(), now() + interval '1 day', 0, 0, 1, 0) $$, '42501', null, 'RP não grava diretamente');
select throws_ok($$ update public.publicacao_vigente set carga_id = carga_id $$, '42501', null, 'RP não troca a publicação');
select throws_ok($$ delete from privado.responsaveis_autorizados $$, '42501', null, 'RP não altera a lista de autorização');
reset role;

-- Revogação administrativa: a próxima consulta da mesma sessão já é negada.
delete from privado.responsaveis_autorizados where user_id = '00000000-0000-4000-8000-0000000000a1';

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select is((select count(*)::int from public.deteccoes), 0, 'RP revogado não vê detecções');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'RP revogado recebe acesso negado');
reset role;

select * from finish();
rollback;
