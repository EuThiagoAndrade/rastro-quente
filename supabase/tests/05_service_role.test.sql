-- Ciclo 003, issue #24 — service_role sem privilégio nas tabelas do produto, e o resto da matriz intacto.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(5);

select is(
  (select count(*)::int
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) p(priv)
   where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
     and has_table_privilege('service_role', c.oid, p.priv)),
  0, 'service_role sem nenhum privilégio em tabela do schema public');

select is(
  (select count(*)::int
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'S'
     and (has_sequence_privilege('service_role', c.oid, 'USAGE') or has_sequence_privilege('service_role', c.oid, 'SELECT')
          or has_sequence_privilege('service_role', c.oid, 'UPDATE'))),
  0, 'service_role sem privilégio em sequência do schema public');

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'privado') and has_function_privilege('service_role', p.oid, 'EXECUTE')),
  0, 'service_role não executa função de public nem de privado');

-- A revogação não tocou os demais papéis: RP segue com as três consultas; EX segue com o que tinha.
select ok(
  has_function_privilege('authenticated', 'public.consultar_resumo(date, date, integer, bigint)'::regprocedure, 'EXECUTE')
  and has_function_privilege('authenticated', 'public.consultar_deteccoes(date, date, integer, bigint, integer, integer)'::regprocedure, 'EXECUTE')
  and has_function_privilege('authenticated', 'public.consultar_disponibilidade(date, date, integer, bigint)'::regprocedure, 'EXECUTE'),
  'authenticated mantém as três consultas');

select ok(
  has_table_privilege('rq_executor', 'public.cargas', 'SELECT')
  and has_table_privilege('rq_executor', 'public.deteccoes', 'INSERT')
  and not has_table_privilege('rq_executor', 'privado.responsaveis_autorizados', 'SELECT'),
  'EX mantém seus privilégios e continua sem a lista RP');

select * from finish();
rollback;
