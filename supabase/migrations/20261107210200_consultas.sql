-- Ciclo 003, issue #21 — contrato de consulta do protótipo.
-- Funções security invoker (RLS do chamador vale integralmente), search_path vazio,
-- execução só para authenticated. Cada resposta fixa a versão (carga) usada.
-- Datas de filtro são dias GMT inclusivos; o principal exclui o envelope, inclusive na fronteira
-- final; a sensibilidade America/Cuiaba é campo separado, na mesma carga.

-- Resolve e valida a carga e o período. Erros explícitos:
-- 42501 acesso_negado; 22023 parâmetro/período inválido; P0002 sem publicação ou carga indisponível.
create function privado.carga_da_consulta(p_inicio date, p_fim date, p_carga bigint)
returns public.cargas
language plpgsql
stable
set search_path = ''
as $$
declare
  c public.cargas;
  primeiro_dia date;
  ultimo_dia date;
begin
  if not (select privado.eh_responsavel()) then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;
  if p_inicio is null or p_fim is null then
    raise exception 'periodo_obrigatorio' using errcode = '22023',
      hint = 'Informe p_inicio e p_fim como datas GMT inclusivas.';
  end if;
  if p_inicio > p_fim then
    raise exception 'periodo_invertido' using errcode = '22023';
  end if;
  if p_carga is null then
    select k.* into c
    from public.publicacao_vigente v
    join public.cargas k on k.id = v.carga_id;
    if not found then
      raise exception 'sem_publicacao' using errcode = 'P0002';
    end if;
  else
    -- RLS só expõe cargas publicadas: preparação, retirada ou inexistente dão o mesmo erro.
    select k.* into c from public.cargas k where k.id = p_carga;
    if not found then
      raise exception 'carga_indisponivel' using errcode = 'P0002';
    end if;
  end if;
  primeiro_dia := (c.janela_inicio at time zone 'UTC')::date;
  ultimo_dia := ((c.janela_fim at time zone 'UTC') - interval '1 microsecond')::date;
  if p_inicio < primeiro_dia or p_fim > ultimo_dia then
    raise exception 'periodo_fora_da_janela' using errcode = '22023',
      detail = format('Dias GMT disponíveis: %s a %s.', primeiro_dia, ultimo_dia);
  end if;
  return c;
end;
$$;

create function privado.conferir_municipio(p_carga bigint, p_municipio integer)
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if p_municipio is not null and not exists (
    select 1 from public.municipios m where m.carga_id = p_carga and m.codigo = p_municipio
  ) then
    raise exception 'municipio_inexistente' using errcode = '22023';
  end if;
end;
$$;

create function privado.iso_utc(t timestamptz)
returns text
language sql
immutable
set search_path = ''
as $$
  select to_char(t at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
$$;

create function privado.descrever_carga(c public.cargas)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id,
    'identidade', c.identidade,
    'satelite', c.satelite,
    'janela_gmt', jsonb_build_object('inicio', privado.iso_utc(c.janela_inicio), 'fim', privado.iso_utc(c.janela_fim)),
    'publicada_em', privado.iso_utc(c.publicada_em)
  );
$$;

-- Totais exatos (fora de qualquer paginação), série diária GMT, totais por município em ordem
-- alfabética (sem ranking) e sensibilidade America/Cuiaba na mesma carga.
create function public.consultar_resumo(
  p_inicio date,
  p_fim date,
  p_municipio integer default null,
  p_carga bigint default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  c public.cargas;
  ini timestamptz;
  fim timestamptz;
  s_ini timestamptz;
  s_fim timestamptz;
  total bigint;
  s_total bigint;
  completa boolean;
  serie jsonb;
  por_municipio jsonb;
begin
  c := privado.carga_da_consulta(p_inicio, p_fim, p_carga);
  perform privado.conferir_municipio(c.id, p_municipio);

  ini := p_inicio::timestamp at time zone 'UTC';
  fim := (p_fim + 1)::timestamp at time zone 'UTC';
  s_ini := p_inicio::timestamp at time zone c.fuso_sensibilidade;
  s_fim := (p_fim + 1)::timestamp at time zone c.fuso_sensibilidade;

  select count(*) into total
  from public.deteccoes d
  where d.carga_id = c.id and d.escopo = 'principal'
    and d.data_hora_gmt >= ini and d.data_hora_gmt < fim
    and (p_municipio is null or d.municipio_codigo = p_municipio);

  -- Sensibilidade só é calculada se a carga cobre todo o intervalo deslocado (janela + envelope).
  completa := s_ini >= c.janela_inicio and s_fim <= coalesce(c.envelope_fim, c.janela_fim);
  if completa then
    select count(*) into s_total
    from public.deteccoes d
    where d.carga_id = c.id
      and d.data_hora_gmt >= s_ini and d.data_hora_gmt < s_fim
      and (p_municipio is null or d.municipio_codigo = p_municipio);
  end if;

  select jsonb_agg(jsonb_build_object('dia', g.dia, 'total', coalesce(x.n, 0)) order by g.dia)
  into serie
  from (select generate_series(p_inicio, p_fim, interval '1 day')::date as dia) g
  left join (
    select (d.data_hora_gmt at time zone 'UTC')::date as dia, count(*) as n
    from public.deteccoes d
    where d.carga_id = c.id and d.escopo = 'principal'
      and d.data_hora_gmt >= ini and d.data_hora_gmt < fim
      and (p_municipio is null or d.municipio_codigo = p_municipio)
    group by 1
  ) x on x.dia = g.dia;

  select coalesce(jsonb_agg(jsonb_build_object('codigo', m.codigo, 'nome', m.nome, 'total', coalesce(x.n, 0))
    order by m.nome, m.codigo), '[]'::jsonb)
  into por_municipio
  from public.municipios m
  left join (
    select d.municipio_codigo, count(*) as n
    from public.deteccoes d
    where d.carga_id = c.id and d.escopo = 'principal'
      and d.data_hora_gmt >= ini and d.data_hora_gmt < fim
    group by 1
  ) x on x.municipio_codigo = m.codigo
  where m.carga_id = c.id and (p_municipio is null or m.codigo = p_municipio);

  return jsonb_build_object(
    'carga', privado.descrever_carga(c),
    'periodo', jsonb_build_object('inicio', p_inicio, 'fim', p_fim, 'referencia', 'dias GMT inclusivos'),
    'municipio', p_municipio,
    'principal', jsonb_build_object(
      'fuso', 'GMT',
      'intervalo', jsonb_build_object('inicio', privado.iso_utc(ini), 'fim', privado.iso_utc(fim)),
      'total', total,
      'serie_diaria', serie,
      'por_municipio', por_municipio
    ),
    'sensibilidade', jsonb_build_object(
      'fuso', c.fuso_sensibilidade,
      'intervalo', jsonb_build_object('inicio', privado.iso_utc(s_ini), 'fim', privado.iso_utc(s_fim)),
      'completa', completa,
      'total', s_total,
      'diferenca', case when completa then s_total - total end
    )
  );
end;
$$;

-- Registros principais paginados, com total exato independente da página.
create function public.consultar_deteccoes(
  p_inicio date,
  p_fim date,
  p_municipio integer default null,
  p_carga bigint default null,
  p_limite integer default 500,
  p_deslocamento integer default 0
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  c public.cargas;
  ini timestamptz;
  fim timestamptz;
  total bigint;
  registros jsonb;
begin
  c := privado.carga_da_consulta(p_inicio, p_fim, p_carga);
  perform privado.conferir_municipio(c.id, p_municipio);
  if p_limite is null or p_limite < 1 or p_limite > 1000 then
    raise exception 'limite_invalido' using errcode = '22023', hint = 'p_limite entre 1 e 1000.';
  end if;
  if p_deslocamento is null or p_deslocamento < 0 then
    raise exception 'deslocamento_invalido' using errcode = '22023';
  end if;

  ini := p_inicio::timestamp at time zone 'UTC';
  fim := (p_fim + 1)::timestamp at time zone 'UTC';

  select count(*) into total
  from public.deteccoes d
  where d.carga_id = c.id and d.escopo = 'principal'
    and d.data_hora_gmt >= ini and d.data_hora_gmt < fim
    and (p_municipio is null or d.municipio_codigo = p_municipio);

  select coalesce(jsonb_agg(to_jsonb(r) - 'ordem' order by r.ordem), '[]'::jsonb)
  into registros
  from (
    select
      row_number() over (order by d.data_hora_gmt, d.id_tecnico) as ordem,
      d.id_tecnico,
      d.id_fonte,
      d.fonte_chave,
      d.linha,
      privado.iso_utc(d.data_hora_gmt) as data_hora_gmt,
      d.latitude,
      d.longitude,
      d.municipio_codigo,
      d.posicao,
      d.municipio_inpe,
      d.estado_inpe,
      case
        when d.estado_inpe is distinct from d.municipio_codigo / 100000 then 'inpe_outra_uf_na_malha'
        when d.municipio_inpe is distinct from d.municipio_codigo then 'inpe_outro_municipio'
      end as divergencia_inpe
    from public.deteccoes d
    where d.carga_id = c.id and d.escopo = 'principal'
      and d.data_hora_gmt >= ini and d.data_hora_gmt < fim
      and (p_municipio is null or d.municipio_codigo = p_municipio)
    order by d.data_hora_gmt, d.id_tecnico
    limit p_limite offset p_deslocamento
  ) r;

  return jsonb_build_object(
    'carga', privado.descrever_carga(c),
    'periodo', jsonb_build_object('inicio', p_inicio, 'fim', p_fim, 'referencia', 'dias GMT inclusivos'),
    'municipio', p_municipio,
    'total', total,
    'limite', p_limite,
    'deslocamento', p_deslocamento,
    'registros', registros
  );
end;
$$;

-- Disponibilidade D1 em município-dias GMT por classe e alcance; dias detalhados só para um município.
create function public.consultar_disponibilidade(
  p_inicio date,
  p_fim date,
  p_municipio integer default null,
  p_carga bigint default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  c public.cargas;
  por_classe jsonb;
  por_alcance jsonb;
  dias jsonb;
begin
  c := privado.carga_da_consulta(p_inicio, p_fim, p_carga);
  perform privado.conferir_municipio(c.id, p_municipio);

  select jsonb_object_agg(k.classe, coalesce(x.n, 0))
  into por_classe
  from (values ('lacuna_conhecida'), ('incidencia_indeterminada'), ('sem_evidencia_de_lacuna')) k(classe)
  left join (
    select v.classe, count(*) as n
    from public.disponibilidade v
    where v.carga_id = c.id and v.dia between p_inicio and p_fim
      and (p_municipio is null or v.municipio_codigo = p_municipio)
    group by 1
  ) x on x.classe = k.classe;

  select jsonb_object_agg(k.alcance, coalesce(x.n, 0))
  into por_alcance
  from (values ('verificado'), ('parcial'), ('indisponivel')) k(alcance)
  left join (
    select v.alcance_historico, count(*) as n
    from public.disponibilidade v
    where v.carga_id = c.id and v.dia between p_inicio and p_fim
      and (p_municipio is null or v.municipio_codigo = p_municipio)
    group by 1
  ) x on x.alcance_historico = k.alcance;

  if p_municipio is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'dia', v.dia,
      'satelite', v.satelite,
      'classe', v.classe,
      'motivos', to_jsonb(v.motivos),
      'alcance_historico', v.alcance_historico,
      'avisos', to_jsonb(v.avisos),
      'aviso_textual', case when v.classe = 'sem_evidencia_de_lacuna' then 'cobertura não comprovada' end
    ) order by v.dia, v.satelite), '[]'::jsonb)
    into dias
    from public.disponibilidade v
    where v.carga_id = c.id and v.municipio_codigo = p_municipio and v.dia between p_inicio and p_fim;
  end if;

  return jsonb_build_object(
    'carga', privado.descrever_carga(c),
    'periodo', jsonb_build_object('inicio', p_inicio, 'fim', p_fim, 'referencia', 'dias GMT inclusivos'),
    'municipio', p_municipio,
    'unidade', 'município-dia GMT',
    'municipio_dias_por_classe', por_classe,
    'municipio_dias_por_alcance', por_alcance,
    'dias', dias,
    'nota', 'Disponibilidade é separada da presença de detecção; nenhuma classe comprova cobertura.'
  );
end;
$$;

revoke all on function privado.carga_da_consulta(date, date, bigint) from public, anon, authenticated, service_role;
revoke all on function privado.conferir_municipio(bigint, integer) from public, anon, authenticated, service_role;
revoke all on function privado.iso_utc(timestamptz) from public, anon, authenticated, service_role;
revoke all on function privado.descrever_carga(public.cargas) from public, anon, authenticated, service_role;
grant execute on function privado.carga_da_consulta(date, date, bigint) to authenticated;
grant execute on function privado.conferir_municipio(bigint, integer) to authenticated;
grant execute on function privado.iso_utc(timestamptz) to authenticated;
grant execute on function privado.descrever_carga(public.cargas) to authenticated;

revoke all on function public.consultar_resumo(date, date, integer, bigint) from public, anon, authenticated, service_role;
revoke all on function public.consultar_deteccoes(date, date, integer, bigint, integer, integer) from public, anon, authenticated, service_role;
revoke all on function public.consultar_disponibilidade(date, date, integer, bigint) from public, anon, authenticated, service_role;
grant execute on function public.consultar_resumo(date, date, integer, bigint) to authenticated;
grant execute on function public.consultar_deteccoes(date, date, integer, bigint, integer, integer) to authenticated;
grant execute on function public.consultar_disponibilidade(date, date, integer, bigint) to authenticated;
