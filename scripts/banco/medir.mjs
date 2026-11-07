// Ciclo 003, issue #21 — medição base do banco local com volume sintético e fictício
// na cardinalidade medida no item 1 (10.640 detecções, 142 municípios, 365 dias × 142 de
// disponibilidade). Tudo numa transação desfeita ao final: nada permanece no banco.
// Não mede carga real, geometria real nem banco hospedado (itens 3 e 5).
// Uso: npx supabase db reset && node scripts/banco/medir.mjs
import { sqlAdmin } from './local.mjs';

const VERTICES = Number(process.argv[2] ?? 316); // ≈ 44.839 / 142 (malha intermediária do item 1)

const SQL = `
begin;
create temporary table medidas (etapa text, ms numeric) on commit drop;

do $$
declare t timestamptz := clock_timestamp(); cid bigint;
begin
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
    total_principal, total_envelope, total_municipios, total_disponibilidade)
  values (repeat('7', 64), 'AQUA_M-T', '2025-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z',
    10640, 0, 142, 51830) returning id into cid;
  insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
  select cid, 'fonte_' || n, 'ficticia', 'https://exemplo.test/fonte/' || n, repeat('8', 64), 1000000, now(), 'fictícia'
  from generate_series(1, 22) n;
  insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
  values (cid, 'classificacao', 'fonte_1', 'maxima'), (cid, 'exibicao', 'fonte_2', 'intermediaria');
  -- Polígonos sintéticos com ${VERTICES} vértices em 6 casas decimais (não são municípios reais).
  insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
  select cid, 9900000 + m, 'Município Fictício ' || m,
    jsonb_build_object('type', 'Polygon', 'coordinates', jsonb_build_array(
      (select jsonb_agg(jsonb_build_array(round((-55 + m * 0.01 + cos(v * 2 * pi() / ${VERTICES}) * 0.3)::numeric, 6),
                                          round((-12 + sin(v * 2 * pi() / ${VERTICES}) * 0.3)::numeric, 6)) order by v)
       from generate_series(0, ${VERTICES}) v)))
  from generate_series(1, 142) m;
  insert into medidas values ('carga_fontes_municipios', extract(epoch from clock_timestamp() - t) * 1000);

  t := clock_timestamp();
  insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt,
    latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe)
  select cid, 'abcdef0123456789:' || n, 'fonte_' || (1 + n % 12), n, md5(n::text), 'principal',
    '2025-11-01T17:00Z'::timestamptz + (n % 365) * interval '1 day' + (n % 240) * interval '1 minute',
    -12 + (n % 1000) * 0.001234, -55 + (n % 997) * 0.001234, 9900001 + n % 142, 'interior', 9900001 + n % 142, 99
  from generate_series(1, 10640) n;
  insert into medidas values ('deteccoes_10640', extract(epoch from clock_timestamp() - t) * 1000);

  t := clock_timestamp();
  insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico, avisos)
  select cid, d::date, 'AQUA_M-T', 9900000 + m,
    case when extract(doy from d)::int % 5 = 0 then 'incidencia_indeterminada' else 'sem_evidencia_de_lacuna' end,
    case when extract(doy from d)::int % 5 = 0 then array['interrupcao_aqua_nasa', 'historico_nao_verificado']
         else array['historico_nao_verificado', 'sem_aviso_incidente'] end,
    'parcial', '{}'
  from generate_series('2025-11-01'::date, '2026-10-31'::date, interval '1 day') d, generate_series(1, 142) m;
  insert into medidas values ('disponibilidade_51830', extract(epoch from clock_timestamp() - t) * 1000);

  -- Manifesto aprovado pelo administrador (fixture fictícia; exigido pela publicação).
  insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
    fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
  select identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
    fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade
  from public.cargas where id = cid;

  t := clock_timestamp();
  update public.cargas set estado = 'publicada' where id = cid;
  insert into public.publicacao_vigente (carga_id) values (cid);
  insert into medidas values ('publicacao_com_conferencias', extract(epoch from clock_timestamp() - t) * 1000);
end $$;

insert into auth.users (id, aud, role) values ('00000000-0000-4000-8000-0000000000c1', 'authenticated', 'authenticated');
insert into privado.responsaveis_autorizados values ('00000000-0000-4000-8000-0000000000c1');
grant insert on medidas to authenticated;
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000c1", "role": "authenticated"}';
do $$
declare t timestamptz; r jsonb;
begin
  t := clock_timestamp(); r := public.consultar_resumo('2025-11-01', '2026-10-31');
  insert into medidas values ('rp_resumo_janela_inteira', extract(epoch from clock_timestamp() - t) * 1000);
  if (r -> 'principal' ->> 'total')::int <> 10640 then raise exception 'total inesperado'; end if;
  t := clock_timestamp(); r := public.consultar_resumo('2026-10-01', '2026-10-31', 9900001);
  insert into medidas values ('rp_resumo_mes_municipio', extract(epoch from clock_timestamp() - t) * 1000);
  t := clock_timestamp(); r := public.consultar_deteccoes('2025-11-01', '2026-10-31', null, null, 1000, 9000);
  insert into medidas values ('rp_deteccoes_pagina_1000_desloc_9000', extract(epoch from clock_timestamp() - t) * 1000);
  t := clock_timestamp(); r := public.consultar_disponibilidade('2025-11-01', '2026-10-31');
  insert into medidas values ('rp_disponibilidade_janela_inteira', extract(epoch from clock_timestamp() - t) * 1000);
  t := clock_timestamp(); r := public.consultar_disponibilidade('2025-11-01', '2026-10-31', 9900001);
  insert into medidas values ('rp_disponibilidade_municipio_365_dias', extract(epoch from clock_timestamp() - t) * 1000);
end $$;
reset role;

select jsonb_pretty(jsonb_build_object(
  'postgres', current_setting('server_version'),
  'vertices_por_municipio', ${VERTICES},
  'tabelas', (select jsonb_object_agg(c.relname, jsonb_build_object(
      'linhas', (xpath('/table/row/n/text()', query_to_xml(format('select count(*) as n from public.%I', c.relname), false, false, '')))[1]::text::bigint,
      'heap_bytes', pg_relation_size(c.oid),
      'toast_bytes', coalesce(pg_total_relation_size(nullif(c.reltoastrelid, 0)), 0),
      'indices_bytes', pg_indexes_size(c.oid),
      'total_bytes', pg_total_relation_size(c.oid)))
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'),
  'public_total_bytes', (select sum(pg_total_relation_size(c.oid)) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'),
  'banco_total_bytes', pg_database_size(current_database()),
  'tempos_ms', (select jsonb_object_agg(etapa, round(ms, 1)) from medidas)
));
rollback;
`;

const saida = sqlAdmin(SQL);
process.stdout.write(saida.slice(saida.indexOf('{')) + '\n');
