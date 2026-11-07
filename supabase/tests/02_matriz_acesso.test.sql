-- Ciclo 003, issue #21 — matriz AN/RP/OA/EX por SQL, com dados e UUIDs fictícios (G2).
-- Sequência: primeiro login sem autorização → cadastro administrativo → leitura RP → revogação.
-- Autorização nunca por e-mail ou metadado: OA traz e-mail e metadados que imitam o RP.
-- Cargas: A publicada e vigente; B em preparação (parcial); C publicada e depois retirada.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(79);

-- Identidades fictícias (domínio reservado .test). Não representam pessoas.
insert into auth.users (id, aud, role, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'authenticated', 'authenticated', 'rp@exemplo.test'),
  ('00000000-0000-4000-8000-0000000000a2', 'authenticated', 'authenticated', 'oa@exemplo.test');

-- Manifestos aprovados por administração externa (proprietário), antes da carga pelo EX.
insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
values
  (repeat('a', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z',
   'America/Cuiaba', '{"regra_historico": "ficticia"}', 3, 1, 2, 62),
  (repeat('d', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', null, null,
   'America/Cuiaba', '{}', 5, 0, 1, 31),
  (repeat('c', 64), 'AQUA_M-T', '2026-09-01T00:00Z', '2026-09-02T00:00Z', null, null,
   'America/Cuiaba', '{}', 1, 0, 1, 1);

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
    '{"regra_historico": "ficticia"}', 3, 1, 2, 62)
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
  select c.id, d::date, 'AQUA_M-T', k.codigo, 'sem_evidencia_de_lacuna', array['historico_nao_verificado', 'sem_aviso_incidente'], 'parcial'
  from c, generate_series('2026-10-01'::date, '2026-10-31'::date, interval '1 day') d, (values (9900001), (9900002)) k(codigo)
$$, 'EX grava a grade D1 completa (31 dias × 2 municípios)');

select lives_ok($$
  update public.cargas set estado = 'publicada' where identidade = repeat('a', 64)
$$, 'EX publica carga completa e conforme ao manifesto aprovado');

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
select throws_ok($$ create temporary table x (i int) $$, '42501', null, 'EX não cria tabelas temporárias');
select throws_ok($$ alter table public.deteccoes disable row level security $$, '42501', null, 'EX não desativa RLS');
select throws_ok($$ drop policy rp_le_deteccoes on public.deteccoes $$, '42501', null, 'EX não remove políticas');
select throws_ok($$ alter role rq_executor bypassrls $$, '42501', null, 'EX não se concede BYPASSRLS');

-- Carga B incompleta: tem linhas em todas as tabelas filhas, fica em preparação e não pode ser
-- publicada nem tornada vigente.
select lives_ok($$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('d', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', 5, 0, 1, 31)
$$, 'EX cria carga B em preparação');
select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('d', 64))
  insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
  select c.id, k, 'ficticia', 'https://exemplo.test/' || k, repeat('b', 64), 1, '2026-11-02T00:00Z', 'fictícia'
  from c, unnest(array['focos', 'malha_max', 'malha_min']) k
$$, 'EX grava fontes da carga B');
select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('d', 64))
  insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
  select c.id, 'classificacao', 'malha_max', 'maxima' from c union all select c.id, 'exibicao', 'malha_min', 'minima' from c
$$, 'EX grava malhas da carga B');
select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('d', 64))
  insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
  select c.id, 9900001, 'Município Fictício A', '{}' from c
$$, 'EX grava municípios da carga B');
select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('d', 64))
  insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
  select c.id, 'b1', 'focos', 1, 'principal', '2026-10-05T18:00Z', -10, -55, 9900001, 'interior' from c
$$, 'EX grava uma das cinco detecções da carga B');
select lives_ok($$
  with c as (select id from public.cargas where identidade = repeat('d', 64))
  insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
  select c.id, '2026-10-05', 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado'], 'parcial' from c
$$, 'EX grava um dos 31 município-dias da carga B');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('d', 64) $$,
  '23514', 'carga_incompleta: principal 1 de 5', 'carga parcial não é publicada, mesmo com manifesto aprovado');
select throws_ok($$ update public.publicacao_vigente set carga_id = (select id from public.cargas where identidade = repeat('d', 64)) $$,
  '23503', null, 'carga em preparação não se torna vigente');

-- Carga C: completa, publicada e depois retirada (não vigente). As linhas permanecem até a limpeza.
select lives_ok($$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('c', 64), 'AQUA_M-T', '2026-09-01T00:00Z', '2026-09-02T00:00Z', 1, 0, 1, 1);
  insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
  select id, k, 'ficticia', 'https://exemplo.test/' || k, repeat('b', 64), 1, '2026-11-02T00:00Z', 'fictícia'
  from public.cargas, unnest(array['focos', 'malha_max', 'malha_min']) k where identidade = repeat('c', 64);
  insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
  select id, 'classificacao', 'malha_max', 'maxima' from public.cargas where identidade = repeat('c', 64)
  union all select id, 'exibicao', 'malha_min', 'minima' from public.cargas where identidade = repeat('c', 64);
  insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
  select id, 9900001, 'Município Fictício A', '{}' from public.cargas where identidade = repeat('c', 64);
  insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
  select id, 'c1', 'focos', 1, 'principal', '2026-09-01T18:00Z', -10, -55, 9900001, 'interior' from public.cargas where identidade = repeat('c', 64);
  insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
  select id, '2026-09-01', 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado'], 'parcial'
  from public.cargas where identidade = repeat('c', 64);
  update public.cargas set estado = 'publicada' where identidade = repeat('c', 64);
  update public.cargas set estado = 'retirada' where identidade = repeat('c', 64);
$$, 'EX publica e retira a carga C, que não é a vigente');
reset role;

-- IDs capturados pelo administrador (RLS os esconde do RP) e controle: as linhas existem.
select set_config('teste.carga_b', (select id::text from public.cargas where identidade = repeat('d', 64)), true);
select set_config('teste.carga_c', (select id::text from public.cargas where identidade = repeat('c', 64)), true);
select is(
  (select array[(select count(*) from public.fontes f where f.carga_id = c.id), (select count(*) from public.malhas f where f.carga_id = c.id),
                (select count(*) from public.municipios f where f.carga_id = c.id), (select count(*) from public.deteccoes f where f.carga_id = c.id),
                (select count(*) from public.disponibilidade f where f.carga_id = c.id)]::int[]
   from public.cargas c where c.id = current_setting('teste.carga_b')::bigint),
  array[3, 2, 1, 1, 1], 'controle: a carga B em preparação tem linhas nas cinco tabelas filhas');
select is(
  (select array[(select count(*) from public.fontes f where f.carga_id = c.id), (select count(*) from public.malhas f where f.carga_id = c.id),
                (select count(*) from public.municipios f where f.carga_id = c.id), (select count(*) from public.deteccoes f where f.carga_id = c.id),
                (select count(*) from public.disponibilidade f where f.carga_id = c.id)]::int[]
   from public.cargas c where c.id = current_setting('teste.carga_c')::bigint and c.estado = 'retirada'),
  array[3, 2, 1, 1, 1], 'controle: a carga C retirada mantém linhas nas cinco tabelas filhas');

-- AN: sem leitura, sem escrita, sem consultas.
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select * from public.deteccoes $$, '42501', null, 'AN não lê detecções');
select throws_ok($$ select * from public.cargas $$, '42501', null, 'AN não lê cargas');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', null, 'AN não executa consultar_resumo');
select throws_ok($$ select public.consultar_deteccoes('2026-10-01', '2026-10-31') $$, '42501', null, 'AN não executa consultar_deteccoes');
select throws_ok($$ select public.consultar_disponibilidade('2026-10-01', '2026-10-31') $$, '42501', null, 'AN não executa consultar_disponibilidade');
select throws_ok($$ insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('e', 64), 'AQUA_M-T', now(), now() + interval '1 day', 0, 0, 1, 0) $$, '42501', null, 'AN não grava');
reset role;

-- OA: autenticado, com e-mail e metadados que imitam o RP; nunca lê.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000a2", "role": "authenticated", "email": "rp@exemplo.test", "user_metadata": {"papel": "RP", "responsavel": true}, "app_metadata": {"papel": "RP"}}';
select is((select count(*)::int from public.deteccoes), 0, 'OA não vê detecções');
select is((select count(*)::int from public.publicacao_vigente), 0, 'OA não vê a publicação vigente');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'OA: consultar_resumo nega acesso');
select throws_ok($$ select public.consultar_deteccoes('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'OA: consultar_deteccoes nega acesso');
select throws_ok($$ select public.consultar_disponibilidade('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'OA: consultar_disponibilidade nega acesso');
select throws_ok($$ delete from public.deteccoes $$, '42501', null, 'OA não apaga');
select throws_ok($$ insert into privado.responsaveis_autorizados values ('00000000-0000-4000-8000-0000000000a2') $$, '42501', null, 'OA não se autoriza');
select throws_ok($$ select * from privado.manifestos_aprovados $$, '42501', null, 'OA não lê manifestos aprovados');
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
  'RP não lê linhas da carga em preparação (via cargas)');
select is((public.consultar_resumo('2026-10-01', '2026-10-31') -> 'principal' ->> 'total')::int, 3, 'RP: consultar_resumo devolve o total principal');
select is((public.consultar_deteccoes('2026-10-01', '2026-10-31') ->> 'total')::int, 3, 'RP: consultar_deteccoes devolve o total exato');
select is((public.consultar_disponibilidade('2026-10-01', '2026-10-31') -> 'carga' ->> 'id')::bigint,
  (select carga_id from public.publicacao_vigente), 'RP: consultar_disponibilidade usa a carga vigente');

-- Tabelas filhas pelo ID, sem JOIN com cargas: preparação (B) e retirada (C) ficam invisíveis.
select is((select count(*)::int from public.cargas where id in (current_setting('teste.carga_b')::bigint, current_setting('teste.carga_c')::bigint)), 0,
  'RP não lê cargas em preparação ou retirada pelo ID');
select is((select count(*)::int from public.fontes where carga_id = current_setting('teste.carga_b')::bigint), 0, 'RP: fontes da carga em preparação, pelo ID, vazias');
select is((select count(*)::int from public.malhas where carga_id = current_setting('teste.carga_b')::bigint), 0, 'RP: malhas da carga em preparação, pelo ID, vazias');
select is((select count(*)::int from public.municipios where carga_id = current_setting('teste.carga_b')::bigint), 0, 'RP: municípios da carga em preparação, pelo ID, vazios');
select is((select count(*)::int from public.deteccoes where carga_id = current_setting('teste.carga_b')::bigint), 0, 'RP: detecções da carga em preparação, pelo ID, vazias');
select is((select count(*)::int from public.disponibilidade where carga_id = current_setting('teste.carga_b')::bigint), 0, 'RP: disponibilidade da carga em preparação, pelo ID, vazia');
select is((select count(*)::int from public.fontes where carga_id = current_setting('teste.carga_c')::bigint), 0, 'RP: fontes da carga retirada, pelo ID, vazias');
select is((select count(*)::int from public.malhas where carga_id = current_setting('teste.carga_c')::bigint), 0, 'RP: malhas da carga retirada, pelo ID, vazias');
select is((select count(*)::int from public.municipios where carga_id = current_setting('teste.carga_c')::bigint), 0, 'RP: municípios da carga retirada, pelo ID, vazios');
select is((select count(*)::int from public.deteccoes where carga_id = current_setting('teste.carga_c')::bigint), 0, 'RP: detecções da carga retirada, pelo ID, vazias');
select is((select count(*)::int from public.disponibilidade where carga_id = current_setting('teste.carga_c')::bigint), 0, 'RP: disponibilidade da carga retirada, pelo ID, vazia');
select throws_ok(format('select public.consultar_resumo(%L, %L, null, %s)', '2026-10-01', '2026-10-31', current_setting('teste.carga_b')),
  'P0002', 'carga_indisponivel', 'RP: consultar_resumo recusa a carga em preparação');
select throws_ok(format('select public.consultar_deteccoes(%L, %L, null, %s)', '2026-09-01', '2026-09-01', current_setting('teste.carga_c')),
  'P0002', 'carga_indisponivel', 'RP: consultar_deteccoes recusa a carga retirada');
select throws_ok(format('select public.consultar_disponibilidade(%L, %L, null, %s)', '2026-10-01', '2026-10-31', current_setting('teste.carga_b')),
  'P0002', 'carga_indisponivel', 'RP: consultar_disponibilidade recusa a carga em preparação');

select throws_ok($$ insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('f', 64), 'AQUA_M-T', now(), now() + interval '1 day', 0, 0, 1, 0) $$, '42501', null, 'RP não grava diretamente');
select throws_ok($$ update public.publicacao_vigente set carga_id = carga_id $$, '42501', null, 'RP não troca a publicação');
select throws_ok($$ delete from privado.responsaveis_autorizados $$, '42501', null, 'RP não altera a lista de autorização');
select throws_ok($$ insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo,
  total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('f', 64), 'AQUA_M-T', now(), now(), 'UTC', '{}', 0, 0, 1, 0) $$, '42501', null, 'RP não aprova manifestos');
reset role;

-- Revogação administrativa: a próxima consulta da mesma sessão já é negada.
delete from privado.responsaveis_autorizados where user_id = '00000000-0000-4000-8000-0000000000a1';

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000a1", "role": "authenticated"}';
select is((select count(*)::int from public.deteccoes), 0, 'RP revogado não vê detecções');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'RP revogado: consultar_resumo nega acesso');
select throws_ok($$ select public.consultar_deteccoes('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'RP revogado: consultar_deteccoes nega acesso');
select throws_ok($$ select public.consultar_disponibilidade('2026-10-01', '2026-10-31') $$, '42501', 'acesso_negado', 'RP revogado: consultar_disponibilidade nega acesso');
reset role;

select * from finish();
rollback;
