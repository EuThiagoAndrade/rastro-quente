-- Ciclo 003, issue #21 — autorização: lista privada RP, papel executor EX, políticas e grants.
-- Matriz do plano 003: AN e OA não leem; RP lê somente cargas publicadas; EX grava dentro do
-- protocolo de carga; ninguém altera autorização, schema ou grants pela aplicação.
-- Nenhum UUID real, e-mail ou senha nesta migração. O cadastro do RP é administração externa.

-- Schema privado, fora da API (config.toml expõe só public).
create schema privado;
revoke all on schema privado from public;
-- authenticated precisa de USAGE para avaliar as políticas que chamam privado.eh_responsavel().
grant usage on schema privado to authenticated;

-- Lista administrativa de responsáveis autorizados, chaveada pelo UUID de auth.users.
-- Nunca por e-mail, nome ou metadado editável pelo usuário.
create table privado.responsaveis_autorizados (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cadastrado_em timestamptz not null default now()
);
alter table privado.responsaveis_autorizados enable row level security;
revoke all on table privado.responsaveis_autorizados from public, anon, authenticated, service_role;

-- Única função security definer: responde apenas se o usuário da sessão está na lista.
-- Identidade vem de auth.uid() (claim sub do JWT assinado), search_path vazio, nomes qualificados.
create function privado.eh_responsavel()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from privado.responsaveis_autorizados r
    where r.user_id = (select auth.uid())
  );
$$;
revoke all on function privado.eh_responsavel() from public, anon, authenticated, service_role;
grant execute on function privado.eh_responsavel() to authenticated;

-- Papel executor EX: LOGIN sem senha (o responsável define a senha fora do repositório),
-- não proprietário, sem BYPASSRLS, sem herança e sem papéis de administração.
-- Papel preexistente com qualquer atributo privilegiado interrompe a migração (sem corrigir às cegas).
do $$
begin
  if not exists (select 1 from pg_catalog.pg_roles where rolname = 'rq_executor') then
    create role rq_executor login nosuperuser nocreatedb nocreaterole noreplication nobypassrls noinherit;
  elsif exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'rq_executor'
      and (rolsuper or rolcreatedb or rolcreaterole or rolreplication or rolbypassrls or rolinherit)
  ) then
    raise exception 'rq_executor preexistente com atributo privilegiado; revisar administrativamente';
  end if;
end
$$;

grant usage on schema public to rq_executor;
grant select, insert on table public.cargas to rq_executor;
grant update (estado) on table public.cargas to rq_executor;
grant select, insert, update (carga_id, atualizada_em) on table public.publicacao_vigente to rq_executor;
grant select, insert, delete on table
  public.fontes, public.malhas, public.municipios, public.deteccoes, public.disponibilidade
  to rq_executor;

-- Leitura pela aplicação: somente SELECT para authenticated; RLS restringe ao RP.
grant select on table
  public.cargas, public.publicacao_vigente, public.fontes, public.malhas,
  public.municipios, public.deteccoes, public.disponibilidade
  to authenticated;

-- Invariantes da carga, válidas para qualquer papel (inclusive EX):
-- carga nasce em preparação; transições só preparacao→publicada, preparacao→retirada e
-- publicada→retirada; campos da carga são imutáveis; a publicação confere contagens e escopos.
create function privado.controlar_carga()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  n bigint;
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
    select count(*) into n from public.deteccoes d where d.carga_id = new.id and d.escopo = 'principal';
    if n <> new.total_principal then
      raise exception 'carga_incompleta: principal % de %', n, new.total_principal using errcode = '23514';
    end if;
    select count(*) into n from public.deteccoes d where d.carga_id = new.id and d.escopo = 'envelope';
    if n <> new.total_envelope then
      raise exception 'carga_incompleta: envelope % de %', n, new.total_envelope using errcode = '23514';
    end if;
    select count(*) into n from public.municipios m where m.carga_id = new.id;
    if n <> new.total_municipios then
      raise exception 'carga_incompleta: municipios % de %', n, new.total_municipios using errcode = '23514';
    end if;
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
    if (select count(*) from public.malhas m where m.carga_id = new.id) <> 2 then
      raise exception 'carga_incompleta: malhas de classificação e exibição' using errcode = '23514';
    end if;
    new.publicada_em := now();
  else
    new.retirada_em := now();
  end if;
  return new;
end;
$$;
revoke all on function privado.controlar_carga() from public, anon, authenticated, service_role;

create trigger controlar_carga
before insert or update on public.cargas
for each row execute function privado.controlar_carga();

-- Linhas de dados só entram em carga em preparação e nunca mudam depois de gravadas;
-- só saem de carga não publicada. FOR SHARE serializa com a publicação concorrente.
create function privado.proteger_linhas_da_carga()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  estado_carga text;
  alvo bigint;
begin
  if tg_op = 'UPDATE' then
    raise exception 'linha_de_carga_imutavel' using errcode = '23514';
  end if;
  alvo := case when tg_op = 'DELETE' then old.carga_id else new.carga_id end;
  select c.estado into estado_carga from public.cargas c where c.id = alvo for share;
  if tg_op = 'INSERT' and estado_carga is distinct from 'preparacao' then
    raise exception 'carga_nao_esta_em_preparacao' using errcode = '23514';
  end if;
  if tg_op = 'DELETE' and estado_carga = 'publicada' then
    raise exception 'carga_publicada_nao_pode_perder_linhas' using errcode = '23514';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
revoke all on function privado.proteger_linhas_da_carga() from public, anon, authenticated, service_role;

create trigger proteger_linhas before insert or update or delete on public.fontes
for each row execute function privado.proteger_linhas_da_carga();
create trigger proteger_linhas before insert or update or delete on public.malhas
for each row execute function privado.proteger_linhas_da_carga();
create trigger proteger_linhas before insert or update or delete on public.municipios
for each row execute function privado.proteger_linhas_da_carga();
create trigger proteger_linhas before insert or update or delete on public.deteccoes
for each row execute function privado.proteger_linhas_da_carga();
create trigger proteger_linhas before insert or update or delete on public.disponibilidade
for each row execute function privado.proteger_linhas_da_carga();

-- Políticas do RP (papel authenticated + lista privada). OA autenticado não satisfaz nenhuma.
create policy rp_le_cargas_publicadas on public.cargas
  for select to authenticated
  using ((select privado.eh_responsavel()) and estado = 'publicada');

create policy rp_le_publicacao_vigente on public.publicacao_vigente
  for select to authenticated
  using ((select privado.eh_responsavel()));

create policy rp_le_fontes on public.fontes
  for select to authenticated
  using ((select privado.eh_responsavel())
    and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));

create policy rp_le_malhas on public.malhas
  for select to authenticated
  using ((select privado.eh_responsavel())
    and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));

create policy rp_le_municipios on public.municipios
  for select to authenticated
  using ((select privado.eh_responsavel())
    and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));

create policy rp_le_deteccoes on public.deteccoes
  for select to authenticated
  using ((select privado.eh_responsavel())
    and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));

create policy rp_le_disponibilidade on public.disponibilidade
  for select to authenticated
  using ((select privado.eh_responsavel())
    and exists (select 1 from public.cargas c where c.id = carga_id and c.estado = 'publicada'));

-- Políticas do EX: lê o necessário à carga e à reconciliação; grava dentro dos grants acima.
-- As invariantes de estado ficam nos gatilhos, que valem para qualquer papel.
create policy ex_le_cargas on public.cargas for select to rq_executor using (true);
create policy ex_cria_cargas on public.cargas for insert to rq_executor with check (estado = 'preparacao');
create policy ex_muda_estado_carga on public.cargas for update to rq_executor using (true) with check (true);

create policy ex_le_publicacao on public.publicacao_vigente for select to rq_executor using (true);
create policy ex_cria_publicacao on public.publicacao_vigente for insert to rq_executor with check (true);
create policy ex_troca_publicacao on public.publicacao_vigente for update to rq_executor using (true) with check (true);

create policy ex_le_fontes on public.fontes for select to rq_executor using (true);
create policy ex_grava_fontes on public.fontes for insert to rq_executor with check (true);
create policy ex_remove_fontes on public.fontes for delete to rq_executor using (true);

create policy ex_le_malhas on public.malhas for select to rq_executor using (true);
create policy ex_grava_malhas on public.malhas for insert to rq_executor with check (true);
create policy ex_remove_malhas on public.malhas for delete to rq_executor using (true);

create policy ex_le_municipios on public.municipios for select to rq_executor using (true);
create policy ex_grava_municipios on public.municipios for insert to rq_executor with check (true);
create policy ex_remove_municipios on public.municipios for delete to rq_executor using (true);

create policy ex_le_deteccoes on public.deteccoes for select to rq_executor using (true);
create policy ex_grava_deteccoes on public.deteccoes for insert to rq_executor with check (true);
create policy ex_remove_deteccoes on public.deteccoes for delete to rq_executor using (true);

create policy ex_le_disponibilidade on public.disponibilidade for select to rq_executor using (true);
create policy ex_grava_disponibilidade on public.disponibilidade for insert to rq_executor with check (true);
create policy ex_remove_disponibilidade on public.disponibilidade for delete to rq_executor using (true);
