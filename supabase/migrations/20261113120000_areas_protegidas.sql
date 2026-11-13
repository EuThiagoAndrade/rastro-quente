-- Ciclo 006, issue #50: persistência aditiva das áreas e vínculos.
alter table public.cargas add column total_areas integer, add column total_vinculos_area integer,
  add constraint cargas_totais_areas check ((total_areas is null) = (total_vinculos_area is null) and (total_areas is null or (total_areas >= 1 and total_vinculos_area >= 0)));
alter table privado.manifestos_aprovados add column total_areas integer, add column total_vinculos_area integer,
  add constraint manifestos_totais_areas check ((total_areas is null) = (total_vinculos_area is null) and (total_areas is null or (total_areas >= 1 and total_vinculos_area >= 0)));
grant insert (total_areas, total_vinculos_area) on public.cargas to rq_executor;

create table public.areas (
  carga_id bigint not null, fonte text not null check (fonte in ('cnuc', 'funai')),
  codigo text not null, fonte_chave text not null, nome text not null, classe text not null,
  categoria text, fase text, modalidade text, esfera text, qualidade text, origem_rotulo text not null,
  geometria_geral jsonb not null, geometria_real jsonb not null,
  primary key (carga_id, fonte, codigo),
  foreign key (carga_id, fonte_chave) references public.fontes (carga_id, chave) on delete cascade
);
create table public.deteccoes_areas (
  carga_id bigint not null, id_tecnico text not null, area_fonte text not null, area_codigo text not null,
  posicao text not null check (posicao in ('interior', 'borda')),
  primary key (carga_id, id_tecnico, area_fonte, area_codigo),
  foreign key (carga_id, id_tecnico) references public.deteccoes (carga_id, id_tecnico) on delete cascade,
  foreign key (carga_id, area_fonte, area_codigo) references public.areas (carga_id, fonte, codigo) on delete cascade
);
alter table public.areas enable row level security;
alter table public.deteccoes_areas enable row level security;
revoke all on public.areas, public.deteccoes_areas from public, anon, authenticated, service_role;
grant select on public.areas, public.deteccoes_areas to authenticated;
grant select, insert, delete on public.areas, public.deteccoes_areas to rq_executor;
create trigger proteger_linhas before insert or update or delete on public.areas for each row execute function privado.proteger_linhas_da_carga();
create trigger proteger_linhas before insert or update or delete on public.deteccoes_areas for each row execute function privado.proteger_linhas_da_carga();
create policy rp_le_areas on public.areas for select to authenticated using ((select privado.eh_responsavel()) and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));
create policy rp_le_deteccoes_areas on public.deteccoes_areas for select to authenticated using ((select privado.eh_responsavel()) and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));
create policy ex_le_areas on public.areas for select to rq_executor using (true);
create policy ex_grava_areas on public.areas for insert to rq_executor with check (true);
create policy ex_remove_areas on public.areas for delete to rq_executor using (true);
create policy ex_le_deteccoes_areas on public.deteccoes_areas for select to rq_executor using (true);
create policy ex_grava_deteccoes_areas on public.deteccoes_areas for insert to rq_executor with check (true);
create policy ex_remove_deteccoes_areas on public.deteccoes_areas for delete to rq_executor using (true);

create or replace function privado.controlar_carga()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  n bigint;
  m privado.manifestos_aprovados;
  dias integer;
begin
  if tg_op = 'INSERT' then
    if new.estado <> 'preparacao' or new.publicada_em is not null or new.retirada_em is not null then
      raise exception 'carga_deve_iniciar_em_preparacao' using errcode = '23514';
    end if;
    return new;
  end if;

  if (to_jsonb(new) - array['estado', 'publicada_em', 'retirada_em'])
     is distinct from (to_jsonb(old) - array['estado', 'publicada_em', 'retirada_em']) then
    raise exception 'carga_imutavel' using errcode = '23514';
  end if;

  if new.estado is not distinct from old.estado then
    if new.publicada_em is distinct from old.publicada_em or new.retirada_em is distinct from old.retirada_em then
      raise exception 'carga_imutavel' using errcode = '23514';
    end if;
    return new;
  end if;

  if (old.estado, new.estado) not in (('preparacao', 'publicada'), ('preparacao', 'retirada'), ('publicada', 'retirada')) then
    raise exception 'transicao_de_carga_invalida: % -> %', old.estado, new.estado using errcode = '23514';
  end if;

  if new.estado = 'publicada' then
    -- RS-1: o gatilho roda depois de o UPDATE bloquear a linha da carga em modo exclusivo, e toda
    -- gravação de linha da carga mantém FOR SHARE nela até o commit. Em READ COMMITTED, cada
    -- consulta abaixo usa um snapshot novo, tirado depois desse bloqueio; em REPEATABLE READ ou
    -- SERIALIZABLE o snapshot seria o do início da transação e poderia estar obsoleto.
    if pg_catalog.current_setting('transaction_isolation') <> 'read committed' then
      raise exception 'publicacao_exige_read_committed: isolamento %', pg_catalog.current_setting('transaction_isolation')
        using errcode = '55000';
    end if;

    -- RS-3: a carga precisa corresponder, campo a campo, a um manifesto aprovado administrativamente.
    select * into m from privado.manifestos_aprovados a where a.identidade = new.identidade;
    if not found then
      raise exception 'manifesto_nao_aprovado' using errcode = '23514';
    end if;
    if (new.satelite, new.janela_inicio, new.janela_fim, new.envelope_inicio, new.envelope_fim, new.fuso_sensibilidade,
        new.metodo, new.total_principal, new.total_envelope, new.total_municipios, new.total_disponibilidade, new.total_areas, new.total_vinculos_area)
       is distinct from
       (m.satelite, m.janela_inicio, m.janela_fim, m.envelope_inicio, m.envelope_fim, m.fuso_sensibilidade,
        m.metodo, m.total_principal, m.total_envelope, m.total_municipios, m.total_disponibilidade, m.total_areas, m.total_vinculos_area) then
      raise exception 'manifesto_divergente' using errcode = '23514';
    end if;

    -- RS-3: grade D1 completa — um registro por município e dia GMT da janela, no satélite da carga.
    if (new.janela_inicio at time zone 'UTC')::time <> '00:00' or (new.janela_fim at time zone 'UTC')::time <> '00:00' then
      raise exception 'carga_inconsistente: janela fora de dias GMT inteiros' using errcode = '23514';
    end if;
    dias := (new.janela_fim at time zone 'UTC')::date - (new.janela_inicio at time zone 'UTC')::date;
    if new.total_disponibilidade <> new.total_municipios * dias then
      raise exception 'carga_incompleta: grade D1 declarada % de % (% municípios × % dias)',
        new.total_disponibilidade, new.total_municipios * dias, new.total_municipios, dias using errcode = '23514';
    end if;

    select count(*) into n from public.deteccoes d where d.carga_id = new.id and d.escopo = 'principal';
    if n <> new.total_principal then
      raise exception 'carga_incompleta: principal % de %', n, new.total_principal using errcode = '23514';
    end if;
    select count(*) into n from public.deteccoes d where d.carga_id = new.id and d.escopo = 'envelope';
    if n <> new.total_envelope then
      raise exception 'carga_incompleta: envelope % de %', n, new.total_envelope using errcode = '23514';
    end if;
    select count(*) into n from public.municipios mu where mu.carga_id = new.id;
    if n <> new.total_municipios then
      raise exception 'carga_incompleta: municipios % de %', n, new.total_municipios using errcode = '23514';
    end if;
    -- Com a chave (carga, município, dia, satélite), o satélite e os dias conferidos abaixo,
    -- contagem igual a municípios × dias implica a grade completa.
    select count(*) into n from public.disponibilidade v where v.carga_id = new.id;
    if n <> new.total_disponibilidade then
      raise exception 'carga_incompleta: disponibilidade % de %', n, new.total_disponibilidade using errcode = '23514';
    end if;
    if exists (
      select 1 from public.deteccoes d
      where d.carga_id = new.id
        and ((d.escopo = 'principal' and (d.data_hora_gmt < new.janela_inicio or d.data_hora_gmt >= new.janela_fim))
          or (d.escopo = 'envelope' and (new.envelope_inicio is null
                or d.data_hora_gmt < new.envelope_inicio or d.data_hora_gmt >= new.envelope_fim)))
    ) then
      raise exception 'carga_inconsistente: detecção fora do intervalo do seu escopo' using errcode = '23514';
    end if;
    if exists (
      select 1 from public.disponibilidade v
      where v.carga_id = new.id
        and (v.satelite <> new.satelite
          or v.dia < (new.janela_inicio at time zone 'UTC')::date
          or v.dia >= (new.janela_fim at time zone 'UTC')::date)
    ) then
      raise exception 'carga_inconsistente: disponibilidade fora da janela ou do satélite' using errcode = '23514';
    end if;
    if (select count(*) from public.malhas ma where ma.carga_id = new.id) <> 2 then
      raise exception 'carga_incompleta: malhas de classificação e exibição' using errcode = '23514';
    end if;
    if (select count(*) from public.areas where carga_id = new.id) <> coalesce(new.total_areas, 0)
       or (select count(*) from public.deteccoes_areas where carga_id = new.id) <> coalesce(new.total_vinculos_area, 0) then
      raise exception 'carga_inconsistente: totais de áreas ou vínculos' using errcode = '23514';
    end if;
    if exists (select 1 from public.deteccoes_areas va join public.deteccoes d
      on (d.carga_id, d.id_tecnico) = (va.carga_id, va.id_tecnico)
      where va.carga_id = new.id and d.escopo <> 'principal') then
      raise exception 'carga_inconsistente: vínculo ao envelope' using errcode = '23514';
    end if;
    new.publicada_em := now();
  else
    new.retirada_em := now();
  end if;
  return new;
end;
$$;
revoke all on function privado.controlar_carga() from public, anon, authenticated, service_role;

create or replace function privado.conferir_papel_executor(p_papel name)
returns void
language plpgsql
set search_path = ''
as $$
declare
  papel oid;
  banco oid;
  problemas text[] := '{}';
  permitidas oid[] := array[
    'public.cargas'::regclass, 'public.publicacao_vigente'::regclass, 'public.fontes'::regclass,
    'public.malhas'::regclass, 'public.municipios'::regclass, 'public.deteccoes'::regclass,
    'public.disponibilidade'::regclass, 'public.areas'::regclass, 'public.deteccoes_areas'::regclass, 'privado.manifestos_aprovados'::regclass]::oid[];
  esquemas oid[] := array['public'::regnamespace, 'privado'::regnamespace]::oid[];
  previstos text[] := array[
    'schema public USAGE', 'schema privado USAGE',
    'public.cargas SELECT', 'public.cargas.estado UPDATE',
    'public.cargas.identidade INSERT', 'public.cargas.satelite INSERT', 'public.cargas.janela_inicio INSERT',
    'public.cargas.janela_fim INSERT', 'public.cargas.envelope_inicio INSERT', 'public.cargas.envelope_fim INSERT',
    'public.cargas.fuso_sensibilidade INSERT', 'public.cargas.metodo INSERT', 'public.cargas.total_principal INSERT',
    'public.cargas.total_areas INSERT', 'public.cargas.total_vinculos_area INSERT',
    'public.cargas.total_envelope INSERT', 'public.cargas.total_municipios INSERT', 'public.cargas.total_disponibilidade INSERT',
    'public.publicacao_vigente SELECT', 'public.publicacao_vigente INSERT',
    'public.publicacao_vigente.carga_id UPDATE', 'public.publicacao_vigente.atualizada_em UPDATE',
    'public.fontes SELECT', 'public.fontes INSERT', 'public.fontes DELETE',
    'public.malhas SELECT', 'public.malhas INSERT', 'public.malhas DELETE',
    'public.municipios SELECT', 'public.municipios INSERT', 'public.municipios DELETE',
    'public.deteccoes SELECT', 'public.deteccoes INSERT', 'public.deteccoes DELETE',
    'public.disponibilidade SELECT', 'public.disponibilidade INSERT', 'public.disponibilidade DELETE',
    'public.areas SELECT', 'public.areas INSERT', 'public.areas DELETE',
    'public.deteccoes_areas SELECT', 'public.deteccoes_areas INSERT', 'public.deteccoes_areas DELETE',
    'privado.manifestos_aprovados SELECT'];
  extras text;
begin
  select r.oid into papel from pg_catalog.pg_roles r where r.rolname = p_papel;
  if papel is null then
    raise exception 'papel_executor_ausente: %', p_papel using errcode = '42704';
  end if;
  select d.oid into banco from pg_catalog.pg_database d where d.datname = pg_catalog.current_database();

  -- LOGIN não é conferido: fica desligado fora das janelas de carga e é ligado pelo responsável (D3).
  if exists (select 1 from pg_catalog.pg_roles r where r.oid = papel
             and (r.rolsuper or r.rolcreatedb or r.rolcreaterole or r.rolreplication or r.rolbypassrls
                  or r.rolinherit)) then
    problemas := array_append(problemas, 'atributos privilegiados');
  end if;
  if exists (select 1 from pg_catalog.pg_auth_members m where m.member = papel) then
    problemas := array_append(problemas, 'membro de outro papel');
  end if;
  if exists (select 1 from pg_catalog.pg_auth_members m join pg_catalog.pg_roles x on x.oid = m.member
             where m.roleid = papel and not x.rolsuper and x.rolname <> current_user) then
    problemas := array_append(problemas, 'outros papéis são membros dele');
  end if;
  if exists (select 1 from pg_catalog.pg_shdepend s
             where s.refclassid = 'pg_catalog.pg_authid'::regclass and s.refobjid = papel
               and s.dbid in (0, banco) and s.deptype = 'o') then
    problemas := array_append(problemas, 'proprietário de objetos');
  end if;
  if exists (select 1 from pg_catalog.pg_db_role_setting c where c.setrole = papel) then
    problemas := array_append(problemas, 'configuração própria (ALTER ROLE … SET)');
  end if;
  -- Privilégios ou políticas fora das tabelas e schemas previstos (inclui banco, sequências,
  -- funções, tipos, privilégios padrão e qualquer tabela de outro schema).
  if exists (select 1 from pg_catalog.pg_shdepend s
             where s.refclassid = 'pg_catalog.pg_authid'::regclass and s.refobjid = papel
               and s.dbid in (0, banco) and s.deptype <> 'o'
               and not (s.deptype = 'a' and s.classid = 'pg_catalog.pg_class'::regclass and s.objid = any(permitidas))
               and not (s.deptype = 'a' and s.classid = 'pg_catalog.pg_namespace'::regclass and s.objid = any(esquemas))
               and not (s.deptype = 'r' and s.classid = 'pg_catalog.pg_policy'::regclass
                        and exists (select 1 from pg_catalog.pg_policy p where p.oid = s.objid and p.polrelid = any(permitidas)))) then
    problemas := array_append(problemas, 'privilégio ou política fora das tabelas previstas');
  end if;
  -- Nas tabelas e schemas previstos: nada além do conjunto previsto, e sem opção de concessão.
  select string_agg(x.item, ', ' order by x.item) into extras
  from (
    select format('%s.%s %s', n.nspname, c.relname, a.privilege_type) as item, a.is_grantable
    from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace,
      lateral pg_catalog.aclexplode(c.relacl) a
    where c.oid = any(permitidas) and a.grantee = papel
    union all
    select format('%s.%s.%s %s', n.nspname, c.relname, t.attname, a.privilege_type), a.is_grantable
    from pg_catalog.pg_attribute t join pg_catalog.pg_class c on c.oid = t.attrelid
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace,
      lateral pg_catalog.aclexplode(t.attacl) a
    where c.oid = any(permitidas) and a.grantee = papel
    union all
    select format('schema %s %s', n.nspname, a.privilege_type), a.is_grantable
    from pg_catalog.pg_namespace n, lateral pg_catalog.aclexplode(n.nspacl) a
    where n.oid = any(esquemas) and a.grantee = papel
  ) x
  where x.is_grantable or x.item <> all(previstos);
  if extras is not null then
    problemas := array_append(problemas, ('privilégio não previsto: ' || extras));
  end if;
  if exists (select 1 from pg_catalog.pg_namespace n where pg_catalog.has_schema_privilege(papel, n.oid, 'CREATE')) then
    problemas := array_append(problemas, 'CREATE em schema');
  end if;
  if pg_catalog.has_database_privilege(papel, banco, 'CREATE') or pg_catalog.has_database_privilege(papel, banco, 'TEMP') then
    problemas := array_append(problemas, 'CREATE ou TEMP no banco');
  end if;

  if cardinality(problemas) > 0 then
    raise exception 'papel_executor_incompativel: %', array_to_string(problemas, '; ')
      using errcode = '42501', hint = 'Revisar o papel administrativamente; a migração não o corrige às cegas.';
  end if;
end;
$$;
revoke all on function privado.conferir_papel_executor(name) from public, anon, authenticated, service_role;

create or replace function privado.auditar_exposicao()
returns setof text
language sql
stable
set search_path = ''
as $$
  select format('extensão %s no schema %s', e.extname, n.nspname)
  from pg_catalog.pg_extension e join pg_catalog.pg_namespace n on n.oid = e.extnamespace
  where n.nspname in ('public', 'privado')
  union all
  select format('função %s.%s executável por %s', n.nspname, p.proname, r.papel)
  from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace,
    unnest(array['anon', 'authenticated']) r(papel)
  where n.nspname = 'public'
    and pg_catalog.has_function_privilege(r.papel, p.oid, 'EXECUTE')
    and not (r.papel = 'authenticated'
             and p.oid in ('public.consultar_resumo(date, date, integer, bigint)'::regprocedure,
                           'public.consultar_deteccoes(date, date, integer, bigint, integer, integer)'::regprocedure,
                           'public.consultar_disponibilidade(date, date, integer, bigint)'::regprocedure))
  union all
  select format('relação %s.%s fora do contrato', n.nspname, c.relname)
  from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'privado') and c.relkind in ('r', 'p', 'v', 'm', 'f')
    and c.oid not in ('public.cargas'::regclass, 'public.publicacao_vigente'::regclass, 'public.fontes'::regclass,
                      'public.malhas'::regclass, 'public.municipios'::regclass, 'public.deteccoes'::regclass,
                      'public.disponibilidade'::regclass, 'public.areas'::regclass, 'public.deteccoes_areas'::regclass, 'privado.responsaveis_autorizados'::regclass,
                      'privado.manifestos_aprovados'::regclass)
  union all
  select 'rq_executor com LOGIN ligado' from pg_catalog.pg_roles where rolname = 'rq_executor' and rolcanlogin
  order by 1;
$$;
revoke all on function privado.auditar_exposicao() from public, anon, authenticated, service_role;

select privado.conferir_papel_executor('rq_executor');
