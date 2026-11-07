-- Ciclo 003, issue #21 — auditoria estrutural de RLS, grants, funções e papel EX (G2).
-- Vale para o conjunto de migrações: tabela ou função nova em public sem o mesmo cuidado reprova.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(25);

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity),
  0, 'toda tabela do schema public tem RLS ativo');

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p')),
  7, 'schema public tem exatamente as 7 tabelas do contrato');

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('v', 'm')),
  0, 'nenhuma view ou view materializada em public que possa contornar RLS');

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace,
     lateral unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) p(priv)
   where n.nspname = 'public' and c.relkind in ('r', 'p') and has_table_privilege('anon', c.oid, p.priv)),
  0, 'anon não tem privilégio em nenhuma tabela public');

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace,
     lateral unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) p(priv)
   where n.nspname = 'public' and c.relkind in ('r', 'p') and has_table_privilege('authenticated', c.oid, p.priv)),
  0, 'authenticated não escreve em nenhuma tabela public');

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind in ('r', 'p') and not has_table_privilege('authenticated', c.oid, 'SELECT')),
  0, 'authenticated tem SELECT nas tabelas public (RLS restringe ao RP)');

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'S'
     and (has_sequence_privilege('anon', c.oid, 'USAGE') or has_sequence_privilege('authenticated', c.oid, 'USAGE'))),
  0, 'anon e authenticated não usam sequências de public');

select ok(
  not has_schema_privilege('anon', 'public', 'CREATE')
  and not has_schema_privilege('authenticated', 'public', 'CREATE')
  and not has_schema_privilege('rq_executor', 'public', 'CREATE'),
  'nenhum papel da aplicação ou EX cria objetos em public');

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'privado') and p.prosecdef),
  1, 'há uma única função security definer nos schemas do projeto');

select ok(
  (select p.prosecdef and p.proconfig @> array['search_path=""']
   from pg_proc p where p.oid = 'privado.eh_responsavel()'::regprocedure),
  'a única security definer é privado.eh_responsavel, com search_path vazio');

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'privado')
     and not coalesce(p.proconfig @> array['search_path=""'], false)),
  0, 'toda função do projeto fixa search_path vazio');

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'privado')
     and (has_function_privilege('anon', p.oid, 'EXECUTE') or has_function_privilege('rq_executor', p.oid, 'EXECUTE'))),
  0, 'anon e EX não executam funções do projeto');

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'EXECUTE')),
  array['consultar_deteccoes', 'consultar_disponibilidade', 'consultar_resumo'],
  'authenticated executa somente as três consultas em public');

select ok(
  not has_table_privilege('authenticated', 'privado.responsaveis_autorizados', 'SELECT')
  and not has_table_privilege('anon', 'privado.responsaveis_autorizados', 'SELECT')
  and not has_table_privilege('service_role', 'privado.responsaveis_autorizados', 'SELECT')
  and not has_table_privilege('authenticated', 'privado.responsaveis_autorizados', 'INSERT')
  and not has_schema_privilege('anon', 'privado', 'USAGE')
  and not has_table_privilege('rq_executor', 'privado.responsaveis_autorizados', 'SELECT')
  and not has_table_privilege('rq_executor', 'privado.responsaveis_autorizados', 'INSERT'),
  'lista RP inacessível a anon, authenticated, service_role e EX');

select ok(
  (select c.relrowsecurity from pg_class c where c.oid = 'privado.responsaveis_autorizados'::regclass),
  'lista RP também tem RLS ativo');

select ok(
  (select not rolsuper and not rolbypassrls and not rolcreaterole and not rolcreatedb
     and not rolreplication and not rolinherit and not rolcanlogin
   from pg_roles where rolname = 'rq_executor'),
  'EX sem superusuário, BYPASSRLS, CREATEROLE, CREATEDB, replicação ou herança, e sem LOGIN fora da janela de carga (D3)');

select is(
  (select count(*)::int from pg_auth_members m where m.member = 'rq_executor'::regrole),
  0, 'EX não é membro de outro papel');

select is(
  (select count(*)::int from pg_class c where c.relowner = 'rq_executor'::regrole),
  0, 'EX não é proprietário de nenhum objeto');

select ok(
  has_table_privilege('rq_executor', 'public.deteccoes', 'INSERT')
  and not has_table_privilege('rq_executor', 'public.deteccoes', 'UPDATE')
  and not has_table_privilege('rq_executor', 'public.deteccoes', 'TRUNCATE')
  and not has_table_privilege('rq_executor', 'public.cargas', 'DELETE')
  and not has_column_privilege('rq_executor', 'public.cargas', 'identidade', 'UPDATE')
  and has_column_privilege('rq_executor', 'public.cargas', 'estado', 'UPDATE'),
  'EX grava linhas e muda só o estado da carga; não altera, trunca nem apaga cargas');

-- Correções da revisão G2 (migração 20261107230000).
select ok(
  (select c.relrowsecurity from pg_class c where c.oid = 'privado.manifestos_aprovados'::regclass)
  and not has_table_privilege('anon', 'privado.manifestos_aprovados', 'SELECT')
  and not has_table_privilege('authenticated', 'privado.manifestos_aprovados', 'SELECT')
  and not has_table_privilege('service_role', 'privado.manifestos_aprovados', 'SELECT')
  and has_table_privilege('rq_executor', 'privado.manifestos_aprovados', 'SELECT')
  and not has_table_privilege('rq_executor', 'privado.manifestos_aprovados', 'INSERT')
  and not has_table_privilege('rq_executor', 'privado.manifestos_aprovados', 'UPDATE')
  and not has_table_privilege('rq_executor', 'privado.manifestos_aprovados', 'DELETE'),
  'manifestos aprovados com RLS: EX só lê; AN, authenticated e service_role sem acesso (RS-3)');

select ok(
  not has_table_privilege('rq_executor', 'public.cargas', 'INSERT')
  and has_column_privilege('rq_executor', 'public.cargas', 'identidade', 'INSERT')
  and has_column_privilege('rq_executor', 'public.cargas', 'total_disponibilidade', 'INSERT')
  and not has_column_privilege('rq_executor', 'public.cargas', 'id', 'INSERT')
  and not has_column_privilege('rq_executor', 'public.cargas', 'estado', 'INSERT')
  and not has_column_privilege('rq_executor', 'public.cargas', 'criada_em', 'INSERT')
  and not has_column_privilege('rq_executor', 'public.cargas', 'publicada_em', 'INSERT')
  and not has_column_privilege('rq_executor', 'public.cargas', 'retirada_em', 'INSERT'),
  'EX insere cargas só pelas colunas de ingestão: sem id, estado ou datas (RS-4)');

select ok(
  not has_database_privilege('rq_executor', current_database(), 'TEMP')
  and not has_database_privilege('rq_executor', current_database(), 'CREATE')
  and has_database_privilege('authenticated', current_database(), 'TEMP')
  and has_database_privilege('service_role', current_database(), 'TEMP'),
  'EX sem TEMP nem CREATE no banco; os demais papéis mantêm TEMP');

select is(
  (select count(*)::int from pg_namespace n where has_schema_privilege('rq_executor', n.oid, 'CREATE')),
  0, 'EX não cria objetos em nenhum schema');

select lives_ok($$ select privado.conferir_papel_executor('rq_executor') $$,
  'conferência do papel EX passa no estado criado pelas migrações (RS-2)');

select is((select count(*)::int from privado.auditar_exposicao()), 0,
  'auditoria de exposição vazia no estado criado pelas migrações (D3)');

select * from finish();
rollback;
