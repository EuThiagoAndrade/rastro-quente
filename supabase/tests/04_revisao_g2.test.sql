-- Ciclo 003, issue #21 — correções da revisão G2 da PR #26, por SQL e com dados fictícios.
-- RS-3: publicação exige manifesto aprovado (fora do alcance do EX) e grade D1 completa.
-- RS-2: a conferência do papel executor recusa associação, propriedade, configuração e privilégio
-- incompatíveis. Papéis de teste fictícios, criados e desfeitos nesta transação.
-- RS-1, RS-4 e DDL com login real do EX: scripts/banco/executor.test.mjs; migração com papel
-- preexistente: scripts/banco/migracao.test.mjs.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(25);

grant rq_executor to postgres with inherit false, set true;
grant usage on schema extensions to rq_executor;

-- Monta, como EX, uma carga de 1 município × N dias com D1 parcial ou completa.
create function pg_temp.montar(p_ident text, p_inicio timestamptz, p_fim timestamptz, p_disp_declarada integer, p_disp_linhas integer)
returns void language sql as $$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (p_ident, 'AQUA_M-T', p_inicio, p_fim, 1, 0, 1, p_disp_declarada);
  insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
  select id, k, 'ficticia', 'https://exemplo.test/' || k, repeat('b', 64), 1, '2026-11-02T00:00Z', 'fictícia'
  from public.cargas, unnest(array['focos', 'malha_max', 'malha_min']) k where identidade = p_ident;
  insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
  select id, 'classificacao', 'malha_max', 'maxima' from public.cargas where identidade = p_ident
  union all select id, 'exibicao', 'malha_min', 'minima' from public.cargas where identidade = p_ident;
  insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
  select id, 9900001, 'Município Fictício', '{}' from public.cargas where identidade = p_ident;
  insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
  select id, 'x1', 'focos', 1, 'principal', p_inicio + interval '12 hours', -10, -55, 9900001, 'interior'
  from public.cargas where identidade = p_ident;
  insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
  select c.id, (p_inicio at time zone 'UTC')::date + d, 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado'], 'parcial'
  from public.cargas c, generate_series(0, p_disp_linhas - 1) d where c.identidade = p_ident;
$$;
grant execute on function pg_temp.montar(text, timestamptz, timestamptz, integer, integer) to rq_executor;

create function pg_temp.aprovar(p_ident text, p_inicio timestamptz, p_fim timestamptz, p_disp integer, p_principal integer default 1)
returns void language sql as $$
  insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo,
    total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (p_ident, 'AQUA_M-T', p_inicio, p_fim, 'America/Cuiaba', '{}', p_principal, 0, 1, p_disp);
$$;

-- Manifestos aprovados pelo administrador.
select pg_temp.aprovar(repeat('1', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 0);  -- aprova D1 vazia (erro do manifesto)
select pg_temp.aprovar(repeat('2', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 2);  -- grade declarada menor que 1 × 3
select pg_temp.aprovar(repeat('3', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 3, 7);  -- diverge da carga no total principal
select pg_temp.aprovar(repeat('5', 64), '2026-10-01T03:00Z', '2026-10-04T03:00Z', 3);  -- janela fora de dias GMT inteiros
select pg_temp.aprovar(repeat('6', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 3);  -- conforme

set local role rq_executor;

select lives_ok($$
  select pg_temp.montar(repeat('1', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 0, 0);
  select pg_temp.montar(repeat('2', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 2, 2);
  select pg_temp.montar(repeat('3', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 3, 3);
  select pg_temp.montar(repeat('4', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 3, 3);
  select pg_temp.montar(repeat('5', 64), '2026-10-01T03:00Z', '2026-10-04T03:00Z', 3, 3);
  select pg_temp.montar(repeat('6', 64), '2026-10-01T00:00Z', '2026-10-04T00:00Z', 3, 3);
$$, 'EX monta seis cargas fictícias em preparação');

select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('1', 64) $$,
  '23514', 'carga_incompleta: grade D1 declarada 0 de 3 (1 municípios × 3 dias)',
  'RS-3: carga sem nenhuma linha D1 não é publicada, mesmo com total declarado e aprovado igual a 0');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('2', 64) $$,
  '23514', 'carga_incompleta: grade D1 declarada 2 de 3 (1 municípios × 3 dias)',
  'RS-3: grade D1 com município-dia faltante não é publicada');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('3', 64) $$,
  '23514', 'manifesto_divergente', 'RS-3: carga que difere do manifesto aprovado não é publicada');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('4', 64) $$,
  '23514', 'manifesto_nao_aprovado', 'RS-3: carga sem manifesto aprovado não é publicada');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('5', 64) $$,
  '23514', 'carga_inconsistente: janela fora de dias GMT inteiros', 'RS-3: janela fora de dias GMT inteiros não é publicada');
select lives_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('6', 64) $$,
  'RS-3: carga completa e conforme ao manifesto é publicada');

select is((select count(*)::int from privado.manifestos_aprovados), 5, 'EX lê os manifestos aprovados');
select throws_ok($$ insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo,
  total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('4', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-10-04T00:00Z', 'America/Cuiaba', '{}', 1, 0, 1, 3) $$,
  '42501', null, 'EX não aprova o próprio manifesto');
select throws_ok($$ update privado.manifestos_aprovados set total_disponibilidade = 0 $$, '42501', null, 'EX não altera manifesto aprovado');
select throws_ok($$ delete from privado.manifestos_aprovados $$, '42501', null, 'EX não apaga manifesto aprovado');
select throws_ok($$ select privado.conferir_papel_executor('rq_executor') $$, '42501', null, 'EX não executa a conferência administrativa');
reset role;

-- RS-2: conferência do papel executor diante de papéis fictícios incompatíveis.
create role rq_teste_limpo login noinherit;
select lives_ok($$ select privado.conferir_papel_executor('rq_teste_limpo') $$, 'papel sem privilégio algum passa na conferência');

create role rq_teste_associado login noinherit;
grant service_role to rq_teste_associado with inherit false, set true;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_associado') $$, '42501',
  'papel_executor_incompativel: membro de outro papel', 'associação a service_role (INHERIT FALSE, SET TRUE) é recusada');

create role rq_teste_alvo login noinherit;
grant rq_teste_alvo to authenticated;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_alvo') $$, '42501',
  'papel_executor_incompativel: outros papéis são membros dele', 'papel do qual authenticated é membro é recusado');

create role rq_teste_herda login inherit;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_herda') $$, '42501',
  'papel_executor_incompativel: atributos privilegiados', 'atributo INHERIT é recusado');

create role rq_teste_dono login noinherit;
grant rq_teste_dono to postgres with inherit false, set true;
create schema rq_teste_esquema authorization rq_teste_dono;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_dono') $$, '42501',
  'papel_executor_incompativel: proprietário de objetos; CREATE em schema', 'propriedade de objeto é recusada');

create role rq_teste_lista login noinherit;
grant select on privado.responsaveis_autorizados to rq_teste_lista;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_lista') $$, '42501',
  'papel_executor_incompativel: privilégio ou política fora das tabelas previstas', 'privilégio na lista RP é recusado');

create role rq_teste_extra login noinherit;
grant update on public.deteccoes to rq_teste_extra;
grant select on public.cargas to rq_teste_extra with grant option;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_extra') $$, '42501',
  'papel_executor_incompativel: privilégio não previsto: public.cargas SELECT, public.deteccoes UPDATE',
  'privilégio além do previsto ou com opção de concessão é recusado');

create role rq_teste_config login noinherit;
alter role rq_teste_config set search_path = public, pg_temp;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_config') $$, '42501',
  'papel_executor_incompativel: configuração própria (ALTER ROLE … SET)', 'configuração por papel é recusada');

create role rq_teste_temp login noinherit;
select set_config('teste.banco', current_database(), true);
do $$ begin execute format('grant temporary on database %I to rq_teste_temp', current_setting('teste.banco')); end $$;
select throws_ok($$ select privado.conferir_papel_executor('rq_teste_temp') $$, '42501',
  'papel_executor_incompativel: privilégio ou política fora das tabelas previstas; CREATE em schema; CREATE ou TEMP no banco',
  'TEMP no banco é recusado');

select throws_ok($$ select privado.conferir_papel_executor('rq_teste_inexistente') $$, '42704',
  'papel_executor_ausente: rq_teste_inexistente', 'papel ausente é recusado');

-- D3: a auditoria aponta o que uma janela de carga com login poderia deixar exposto.
alter role rq_executor login;
create extension seg schema public;  -- como o supautils faria para o EX com login: dono supabase_admin
select ok(
  (select array_agg(a) from privado.auditar_exposicao() a) @> array[
    'extensão seg no schema public', 'função public.seg_center executável por anon',
    'função public.seg_center executável por authenticated', 'rq_executor com LOGIN ligado'],
  'auditoria aponta extensão em public, funções expostas e EX com LOGIN ligado');
drop extension seg;
create view public.rq_teste_vista as select 1 as x;
select is((select array_agg(a) from privado.auditar_exposicao() a),
  array['relação public.rq_teste_vista fora do contrato', 'rq_executor com LOGIN ligado'],
  'auditoria aponta relação fora do contrato');
drop view public.rq_teste_vista;
alter role rq_executor nologin;
select is((select count(*)::int from privado.auditar_exposicao()), 0, 'auditoria volta vazia ao fechar a janela');

select * from finish();
rollback;
