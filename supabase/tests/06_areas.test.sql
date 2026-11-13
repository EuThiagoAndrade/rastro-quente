-- Ciclo 003, issue #21 — matriz AN/RP/OA/EX por SQL, com dados e UUIDs fictícios (G2).
-- Sequência: primeiro login sem autorização → cadastro administrativo → leitura RP → revogação.
-- Autorização nunca por e-mail ou metadado: OA traz e-mail e metadados que imitam o RP.
-- Cargas: A publicada e vigente; B em preparação (parcial); C publicada e depois retirada.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(29);

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

update privado.manifestos_aprovados set total_areas = 1, total_vinculos_area = 1 where identidade = repeat('a', 64);

-- Somente neste teste (desfeito no rollback): permite ao postgres assumir o papel EX.
-- Também concede ao EX o uso do schema do pgTAP, para registrar os resultados.
grant rq_executor to postgres with inherit false, set true;
grant usage on schema extensions to rq_executor;

-- EX: monta e publica a carga A (fictícia) dentro do protocolo.
set local role rq_executor;

select lives_ok($$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
    metodo, total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area)
  values (repeat('a', 64), 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z',
    '{"regra_historico": "ficticia"}', 3, 1, 2, 62, 1, 1)
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


select lives_ok($$ insert into public.areas (carga_id, fonte, codigo, fonte_chave, nome, classe, origem_rotulo, geometria_geral, geometria_real)
  select id, 'cnuc', 'A1', 'focos', 'Área fictícia', 'protecao_integral', 'rotulo', '{}', '{}' from public.cargas where identidade = repeat('a', 64) $$, 'EX insere área');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('a', 64) $$,
  '23514', 'carga_inconsistente: totais de áreas ou vínculos', 'publicação recusa vínculo faltante');

reset role;
select lives_ok($$
  insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
    select repeat('e',64), satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade from public.cargas where identidade = repeat('a',64);
  insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim, fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade)
    select identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim, fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade from public.cargas where identidade = repeat('e',64);
  insert into public.fontes select b.id, f.chave, f.papel, f.url, f.sha256, f.bytes, f.obtida_em, f.condicoes_uso from public.fontes f join public.cargas a on a.id=f.carga_id cross join public.cargas b where a.identidade=repeat('a',64) and b.identidade=repeat('e',64);
  insert into public.malhas select b.id, m.uso, m.fonte_chave, m.qualidade, m.parametros from public.malhas m join public.cargas a on a.id=m.carga_id cross join public.cargas b where a.identidade=repeat('a',64) and b.identidade=repeat('e',64);
  insert into public.municipios select b.id, m.codigo, m.nome, m.geometria_exibicao from public.municipios m join public.cargas a on a.id=m.carga_id cross join public.cargas b where a.identidade=repeat('a',64) and b.identidade=repeat('e',64);
  insert into public.deteccoes select b.id, d.id_tecnico, d.fonte_chave, d.linha, d.id_fonte, d.escopo, d.data_hora_gmt, d.latitude, d.longitude, d.municipio_codigo, d.posicao, d.municipio_inpe, d.estado_inpe from public.deteccoes d join public.cargas a on a.id=d.carga_id cross join public.cargas b where a.identidade=repeat('a',64) and b.identidade=repeat('e',64);
  insert into public.disponibilidade select b.id, d.dia, d.satelite, d.municipio_codigo, d.classe, d.motivos, d.alcance_historico, d.avisos from public.disponibilidade d join public.cargas a on a.id=d.carga_id cross join public.cargas b where a.identidade=repeat('a',64) and b.identidade=repeat('e',64);
  insert into public.areas select b.id, ar.fonte, ar.codigo, ar.fonte_chave, ar.nome, ar.classe, ar.categoria, ar.fase, ar.modalidade, ar.esfera, ar.qualidade, ar.origem_rotulo, ar.geometria_geral, ar.geometria_real from public.areas ar join public.cargas a on a.id=ar.carga_id cross join public.cargas b where a.identidade=repeat('a',64) and b.identidade=repeat('e',64)
$$, 'carga sem camada com filho é preparada');
select throws_ok($$ update public.cargas set estado='publicada' where identidade=repeat('e',64) $$, '23514', 'carga_inconsistente: totais de áreas ou vínculos', 'totais nulos recusam filhos');
set local role rq_executor;

select throws_ok($$ insert into public.deteccoes_areas (carga_id, id_tecnico, area_fonte, area_codigo, posicao)
  select id, 't1', 'cnuc', 'inexistente', 'interior' from public.cargas where identidade = repeat('a', 64) $$,
  '23503', null, 'vínculo não aponta para área ausente');
select lives_ok($$ insert into public.deteccoes_areas (carga_id, id_tecnico, area_fonte, area_codigo, posicao)
  select id, 't4', 'cnuc', 'A1', 'interior' from public.cargas where identidade = repeat('a', 64) $$, 'EX insere vínculo de envelope antes da conferência');
select throws_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('a', 64) $$, '23514', 'carga_inconsistente: vínculo ao envelope', 'publicação recusa vínculo ao envelope');
select lives_ok($$ delete from public.deteccoes_areas $$, 'EX remove vínculo de carga em preparação');
select lives_ok($$ insert into public.deteccoes_areas select id, 't1', 'cnuc', 'A1', 'borda' from public.cargas where identidade = repeat('a', 64) $$, 'EX insere vínculo principal');
select lives_ok($$ update public.cargas set estado = 'publicada' where identidade = repeat('a', 64) $$, 'EX publica totais válidos');
select throws_ok($$ delete from public.deteccoes_areas $$, '23514', 'carga_publicada_nao_pode_perder_linhas', 'EX não remove vínculo publicado');
select throws_ok($$ delete from public.areas $$, '23514', 'carga_publicada_nao_pode_perder_linhas', 'EX não remove área publicada');
select throws_ok($$ update public.areas set nome = 'outro' $$, '42501', null, 'EX não atualiza área');
reset role;
select throws_ok($$ insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area)
values (repeat('f',64), 'AQUA_M-T', '2026-10-01', '2026-10-02', 0, 0, 1, 1, 1, null) $$, '23514', null, 'totais exigem nulidade conjunta');
select throws_ok($$ insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area)
values (repeat('f',64), 'AQUA_M-T', '2026-10-01', '2026-10-02', 'America/Cuiaba', '{}', 0, 0, 1, 1, 1, null) $$, '23514', null, 'manifesto exige nulidade conjunta');
select ok(not has_table_privilege('anon','public.areas','select') and not has_table_privilege('service_role','public.areas','select'), 'AN e service_role sem acesso à área');
select ok(not has_table_privilege('anon','public.deteccoes_areas','select') and not has_table_privilege('service_role','public.deteccoes_areas','select'), 'AN e service_role sem acesso ao vínculo');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a2', true);
select is((select count(*)::int from public.areas), 0, 'OA não lê áreas');
select is((select count(*)::int from public.deteccoes_areas), 0, 'OA não lê vínculos');
reset role;
insert into privado.responsaveis_autorizados (user_id) values ('00000000-0000-4000-8000-0000000000a1');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
select is((select count(*)::int from public.areas), 1, 'RP lê área publicada');
select is((select count(*)::int from public.deteccoes_areas), 1, 'RP lê vínculo publicado');
reset role;
revoke usage on schema extensions from rq_executor;
select lives_ok($$ select privado.conferir_papel_executor('rq_executor') $$, 'auditoria de privilégios EX');
select is((select count(*)::int from privado.auditar_exposicao()), 0, 'auditoria de exposição');
select * from finish();
rollback;
