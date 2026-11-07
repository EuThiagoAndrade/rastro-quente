-- Ciclo 003, issue #21 — contrato de consulta com dados fictícios.
-- Caso do plano: principal 100, 3 registros nas 4 primeiras horas e 5 no envelope → Cuiabá 102 (+2).
-- Totais exatos fora da paginação, erros explícitos, envelope fora do principal e troca de versão sem mistura.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(39);

insert into auth.users (id, aud, role, email)
values ('00000000-0000-4000-8000-0000000000b1', 'authenticated', 'authenticated', 'rp@exemplo.test');
insert into privado.responsaveis_autorizados (user_id) values ('00000000-0000-4000-8000-0000000000b1');

-- Carga A: outubro de 2026 com envelope de 4 h após o fim.
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  total_principal, total_envelope, total_municipios, total_disponibilidade)
values (repeat('1', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z', 100, 5, 2, 62);

insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
select c.id, k.chave, 'ficticia', 'https://exemplo.test/' || k.chave, repeat('2', 64), 1, '2026-11-02T00:00Z', 'fictícia'
from public.cargas c, (values ('focos'), ('malha_max'), ('malha_min')) k(chave) where c.identidade = repeat('1', 64);
insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
select c.id, k.uso, k.fonte, k.q from public.cargas c,
  (values ('classificacao', 'malha_max', 'maxima'), ('exibicao', 'malha_min', 'minima')) k(uso, fonte, q)
where c.identidade = repeat('1', 64);
-- Nomes em ordem inversa aos códigos, para conferir a ordem alfabética.
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, k.codigo, k.nome, '{}' from public.cargas c,
  (values (9900001, 'Beta Fictício'), (9900002, 'Alfa Fictício')) k(codigo, nome)
where c.identidade = repeat('1', 64);

insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, id_fonte, escopo, data_hora_gmt,
  latitude, longitude, municipio_codigo, posicao, municipio_inpe, estado_inpe)
select c.id, 'a' || lpad(k.n::text, 3, '0'), 'focos', k.n, 'f' || k.n, k.escopo, k.t, -10, -55, k.mun, 'interior', k.mun, 99
from public.cargas c, (
  select n, 'principal' as escopo, '2026-10-01T01:00Z'::timestamptz as t, 9900001 as mun from generate_series(1, 3) n
  union all
  select n, 'principal', '2026-10-31T23:00Z', 9900002 from generate_series(4, 5) n
  union all
  select n, 'principal', '2026-10-02T18:00Z'::timestamptz + ((n - 6) % 29) * interval '1 day',
    case when n % 2 = 0 then 9900001 else 9900002 end
  from generate_series(6, 100) n
  union all
  select n, 'envelope', '2026-11-01T01:00Z'::timestamptz + (n - 100) * interval '1 minute', 9900001 from generate_series(101, 105) n
) k
where c.identidade = repeat('1', 64);

insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
select c.id, d::date, 'AQUA_M-T', m.codigo,
  case when m.codigo = 9900001 and d::date = '2026-10-10' then 'incidencia_indeterminada' else 'sem_evidencia_de_lacuna' end,
  case when m.codigo = 9900001 and d::date = '2026-10-10' then array['interrupcao_aqua_nasa', 'historico_nao_verificado']
       else array['historico_nao_verificado', 'sem_aviso_incidente'] end,
  'parcial'
from public.cargas c, generate_series('2026-10-01'::date, '2026-10-31'::date, interval '1 day') d,
  (values (9900001), (9900002)) m(codigo)
where c.identidade = repeat('1', 64);

-- Fixture: o administrador aprova o manifesto declarado (a conferência é tema de 02 e 04).
insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
select identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade
from public.cargas where identidade = repeat('1', 64);
update public.cargas set estado = 'publicada' where identidade = repeat('1', 64);
insert into public.publicacao_vigente (carga_id) select id from public.cargas where identidade = repeat('1', 64);

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000b1", "role": "authenticated"}';

create temporary table r_out as select public.consultar_resumo('2026-10-01', '2026-10-31') as r;

select is((select (r -> 'principal' ->> 'total')::int from r_out), 100, 'total principal GMT = 100');
select is((select r -> 'principal' -> 'intervalo' from r_out),
  '{"inicio": "2026-10-01T00:00:00Z", "fim": "2026-11-01T00:00:00Z"}'::jsonb, 'intervalo principal [01/10 00:00Z, 01/11 00:00Z)');
select is((select r -> 'sensibilidade' -> 'intervalo' from r_out),
  '{"inicio": "2026-10-01T04:00:00Z", "fim": "2026-11-01T04:00:00Z"}'::jsonb, 'intervalo de sensibilidade deslocado para America/Cuiaba');
select is((select (r -> 'sensibilidade' ->> 'total')::int from r_out), 102, 'sensibilidade Cuiabá = 100 − 3 + 5 = 102');
select is((select (r -> 'sensibilidade' ->> 'diferenca')::int from r_out), 2, 'diferença +2');
select is((select r -> 'sensibilidade' ->> 'fuso' from r_out), 'America/Cuiaba', 'fuso da sensibilidade identificado');
select is((select r -> 'principal' ->> 'fuso' from r_out), 'GMT', 'fuso principal identificado');
select is((select (r -> 'carga' ->> 'id')::bigint from r_out), (select carga_id from public.publicacao_vigente), 'resposta fixa a carga vigente');
select is((select jsonb_array_length(r -> 'principal' -> 'serie_diaria') from r_out), 31, 'série diária GMT com os 31 dias, inclusive zeros');
select is((select sum((e ->> 'total')::int)::int from r_out, jsonb_array_elements(r -> 'principal' -> 'serie_diaria') e), 100,
  'série diária soma o total principal');
select is((select (r -> 'principal' -> 'serie_diaria' -> 30 ->> 'total')::int from r_out), 2,
  'último dia da série sem os 5 registros do envelope');
select is((select r -> 'principal' -> 'por_municipio' -> 0 ->> 'nome' from r_out), 'Alfa Fictício',
  'municípios em ordem alfabética, sem ranking');
select is((select sum((e ->> 'total')::int)::int from r_out, jsonb_array_elements(r -> 'principal' -> 'por_municipio') e), 100,
  'totais por município somam o total principal');

-- Fronteira final: o dia 31 não recebe o envelope no principal, mas a sensibilidade sim.
select is((public.consultar_resumo('2026-10-31', '2026-10-31') -> 'principal' ->> 'total')::int, 2, 'fronteira final: principal sem envelope');
select is((public.consultar_resumo('2026-10-31', '2026-10-31') -> 'sensibilidade' ->> 'total')::int, 7, 'fronteira final: sensibilidade com envelope');
select is((public.consultar_resumo('2026-10-01', '2026-10-31', 9900001) -> 'principal' ->> 'total')::int, 51, 'filtro por município');

-- Registros paginados com total exato.
select is((public.consultar_deteccoes('2026-10-01', '2026-10-31', null, null, 10, 0) ->> 'total')::int, 100, 'total exato independe da página');
select is(jsonb_array_length(public.consultar_deteccoes('2026-10-01', '2026-10-31', null, null, 10, 0) -> 'registros'), 10, 'página respeita o limite');
select is(jsonb_array_length(public.consultar_deteccoes('2026-10-01', '2026-10-31', null, null, 10, 95) -> 'registros'), 5, 'última página parcial');
select is((public.consultar_deteccoes('2026-10-31', '2026-10-31') ->> 'total')::int, 2, 'registros do envelope fora da tabela principal');
select is(public.consultar_deteccoes('2026-10-01', '2026-10-01', null, null, 1, 0) -> 'registros' -> 0 ->> 'data_hora_gmt',
  '2026-10-01T01:00:00Z', 'instante em GMT explícito');

-- Disponibilidade D1.
select is(public.consultar_disponibilidade('2026-10-01', '2026-10-31') -> 'municipio_dias_por_classe',
  '{"lacuna_conhecida": 0, "incidencia_indeterminada": 1, "sem_evidencia_de_lacuna": 61}'::jsonb, 'município-dias por classe');
select is((public.consultar_disponibilidade('2026-10-01', '2026-10-31') -> 'municipio_dias_por_alcance' ->> 'parcial')::int, 62, 'alcance do histórico preservado');
select is(public.consultar_disponibilidade('2026-10-10', '2026-10-11', 9900001) -> 'dias' -> 0 -> 'motivos',
  '["interrupcao_aqua_nasa", "historico_nao_verificado"]'::jsonb, 'dia indeterminado com motivos');
select is(public.consultar_disponibilidade('2026-10-10', '2026-10-11', 9900001) -> 'dias' -> 1 ->> 'aviso_textual',
  'cobertura não comprovada', 'sem evidência de lacuna traz "cobertura não comprovada"');

-- Erros explícitos.
select throws_ok($$ select public.consultar_resumo('2026-10-31', '2026-10-01') $$, '22023', 'periodo_invertido', 'período invertido');
select throws_ok($$ select public.consultar_resumo('2026-09-30', '2026-10-01') $$, '22023', 'periodo_fora_da_janela', 'início antes da janela');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-11-01') $$, '22023', 'periodo_fora_da_janela', 'dia do envelope não é selecionável');
select throws_ok($$ select public.consultar_resumo(null, '2026-10-01') $$, '22023', 'periodo_obrigatorio', 'período obrigatório');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31', 1234567) $$, '22023', 'municipio_inexistente', 'município inexistente');
select throws_ok($$ select public.consultar_deteccoes('2026-10-01', '2026-10-31', null, null, 1001, 0) $$, '22023', 'limite_invalido', 'limite técnico da página');
select throws_ok($$ select public.consultar_deteccoes('2026-10-01', '2026-10-31', null, null, 10, -1) $$, '22023', 'deslocamento_invalido', 'deslocamento negativo');
select throws_ok($$ select public.consultar_resumo('2026-10-01', '2026-10-31', null, -1) $$, 'P0002', 'carga_indisponivel', 'carga inexistente');
reset role;

-- Carga B: nova versão, sem envelope (sensibilidade do fim de outubro fica incompleta).
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade)
values (repeat('3', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', 10, 0, 1, 31);
insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
select c.id, k.chave, 'ficticia', 'https://exemplo.test/' || k.chave, repeat('4', 64), 1, '2026-11-03T00:00Z', 'fictícia'
from public.cargas c, (values ('focos'), ('malha_max'), ('malha_min')) k(chave) where c.identidade = repeat('3', 64);
insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
select c.id, k.uso, k.fonte, k.q from public.cargas c,
  (values ('classificacao', 'malha_max', 'maxima'), ('exibicao', 'malha_min', 'minima')) k(uso, fonte, q)
where c.identidade = repeat('3', 64);
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, 9900001, 'Beta Fictício', '{}' from public.cargas c where c.identidade = repeat('3', 64);
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
select c.id, 'b' || n, 'focos', n, 'principal', '2026-10-15T18:00Z', -10, -55, 9900001, 'interior'
from public.cargas c, generate_series(1, 10) n where c.identidade = repeat('3', 64);
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
select c.id, d::date, 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado', 'sem_aviso_incidente'], 'parcial'
from public.cargas c, generate_series('2026-10-01'::date, '2026-10-31'::date, interval '1 day') d where c.identidade = repeat('3', 64);

-- Identificadores guardados pelo administrador, pois o RP não enxerga cargas fora de publicação.
select set_config('teste.carga_a', (select id::text from public.cargas where identidade = repeat('1', 64)), true);
select set_config('teste.carga_b', (select id::text from public.cargas where identidade = repeat('3', 64)), true);

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000b1", "role": "authenticated"}';
select throws_ok(format('select public.consultar_resumo(%L, %L, null, %s)', '2026-10-01', '2026-10-31',
  current_setting('teste.carga_b')), 'P0002', 'carga_indisponivel', 'carga em preparação não é legível');
reset role;

-- Fixture: o administrador aprova o manifesto declarado (a conferência é tema de 02 e 04).
insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
select identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade
from public.cargas where identidade = repeat('3', 64);
update public.cargas set estado = 'publicada' where identidade = repeat('3', 64);
update public.publicacao_vigente set carga_id = (select id from public.cargas where identidade = repeat('3', 64)), atualizada_em = now();

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000b1", "role": "authenticated"}';
select is((public.consultar_resumo('2026-10-01', '2026-10-31') -> 'principal' ->> 'total')::int, 10, 'vigente passa a ser a carga B');
select is(public.consultar_resumo('2026-10-01', '2026-10-31') -> 'sensibilidade' -> 'completa', 'false'::jsonb,
  'sem envelope, sensibilidade do fim da janela é declarada incompleta');
select is(public.consultar_resumo('2026-10-01', '2026-10-31') -> 'sensibilidade' -> 'total', 'null'::jsonb,
  'sensibilidade incompleta não vira número');
select is((public.consultar_resumo('2026-10-01', '2026-10-31', null, current_setting('teste.carga_a')::bigint)
  -> 'principal' ->> 'total')::int, 100, 'consulta fixada na carga A continua sem mistura');
reset role;

update public.cargas set estado = 'retirada' where identidade = repeat('1', 64);

set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-0000000000b1", "role": "authenticated"}';
select throws_ok(format('select public.consultar_resumo(%L, %L, null, %s)', '2026-10-01', '2026-10-31',
  current_setting('teste.carga_a')), 'P0002', 'carga_indisponivel', 'carga retirada deixa de ser legível');
reset role;

select * from finish();
rollback;
