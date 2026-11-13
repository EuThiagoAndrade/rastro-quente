// Ciclo 003, issue #21 — matriz AN/RP/OA pela API real local (PostgREST + Auth), com identidades
// e dados fictícios: as três consultas por papel e as tabelas filhas pelo ID de cargas em
// preparação e retiradas. Requer `npx supabase start`; roda em `npm run test:rls`.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { statusLocal, sqlAdmin, requisitar, assinarJwt, adulterarJwt, lerJwt } from './local.mjs';

const IDENTIDADE = 'f'.repeat(63) + '1';
const PREPARACAO = 'f'.repeat(63) + '2'; // carga parcial, nunca publicada
const RETIRADA = 'f'.repeat(63) + '3'; // carga completa, publicada e retirada
const DA_API = `select id from public.cargas where identidade like '${'f'.repeat(63)}%'`;
const TOTAL_PRINCIPAL = 1005; // acima do max_rows (1000) para conferir o limite técnico da API
const TABELAS_FILHAS = ['fontes', 'malhas', 'municipios', 'deteccoes', 'disponibilidade', 'areas', 'deteccoes_areas'];
const RPCS = ['consultar_resumo', 'consultar_deteccoes', 'consultar_disponibilidade'];

// Carga pequena (1 município × 1 dia de setembro) com linhas em todas as tabelas filhas.
const cargaPequena = (ident, totalPrincipal) => `
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area)
values ('${ident}', 'AQUA_M-T', '2026-09-01T00:00Z', '2026-09-02T00:00Z', ${totalPrincipal}, 0, 1, 1, 1, 1);
insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
select c.id, k.chave, 'ficticia', 'https://exemplo.test/' || k.chave, repeat('9', 64), 1, '2026-11-02T00:00Z', 'fictícia'
from public.cargas c, (values ('focos'), ('malha_max'), ('malha_min')) k(chave) where c.identidade = '${ident}';
insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
select c.id, k.uso, k.fonte, k.q from public.cargas c,
  (values ('classificacao', 'malha_max', 'maxima'), ('exibicao', 'malha_min', 'minima')) k(uso, fonte, q)
where c.identidade = '${ident}';
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, 9900001, 'Município Fictício', '{}' from public.cargas c where c.identidade = '${ident}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
select c.id, 'api-' || c.id, 'focos', 1, 'principal', '2026-09-01T18:00Z', -10, -55, 9900001, 'interior'
from public.cargas c where c.identidade = '${ident}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
select c.id, '2026-09-01', 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado'], 'parcial'
from public.cargas c where c.identidade = '${ident}';
insert into public.areas (carga_id, fonte, codigo, fonte_chave, nome, classe, origem_rotulo, geometria_geral, geometria_real)
select id, 'cnuc', 'A', 'focos', 'Área fictícia', 'protecao_integral', 'rotulo', '{}', '{}' from public.cargas where identidade = '${ident}';
insert into public.deteccoes_areas select id, 'api-' || id, 'cnuc', 'A', 'interior' from public.cargas where identidade = '${ident}';`;

// Fixture: o administrador aprova o manifesto declarado (a conferência é tema dos testes SQL).
const aprovar = (ident) => `
insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area)
select identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  fuso_sensibilidade, metodo, total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area
from public.cargas where identidade = '${ident}';`;

const FIXTURE = `
begin;
insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, envelope_inicio, envelope_fim,
  total_principal, total_envelope, total_municipios, total_disponibilidade, total_areas, total_vinculos_area)
values ('${IDENTIDADE}', 'AQUA_M-T', '2026-10-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T00:00Z', '2026-11-01T04:00Z',
  ${TOTAL_PRINCIPAL}, 2, 1, 31, 1, 1);
insert into public.fontes (carga_id, chave, papel, url, sha256, bytes, obtida_em, condicoes_uso)
select c.id, k.chave, 'ficticia', 'https://exemplo.test/' || k.chave, repeat('9', 64), 1, '2026-11-02T00:00Z', 'fictícia'
from public.cargas c, (values ('focos'), ('malha_max'), ('malha_min')) k(chave) where c.identidade = '${IDENTIDADE}';
insert into public.malhas (carga_id, uso, fonte_chave, qualidade)
select c.id, k.uso, k.fonte, k.q from public.cargas c,
  (values ('classificacao', 'malha_max', 'maxima'), ('exibicao', 'malha_min', 'minima')) k(uso, fonte, q)
where c.identidade = '${IDENTIDADE}';
insert into public.municipios (carga_id, codigo, nome, geometria_exibicao)
select c.id, 9900001, 'Município Fictício', '{}' from public.cargas c where c.identidade = '${IDENTIDADE}';
insert into public.deteccoes (carga_id, id_tecnico, fonte_chave, linha, escopo, data_hora_gmt, latitude, longitude, municipio_codigo, posicao)
select c.id, 'api' || n, 'focos', n, case when n > ${TOTAL_PRINCIPAL} then 'envelope' else 'principal' end,
  case when n > ${TOTAL_PRINCIPAL} then '2026-11-01T01:00Z'::timestamptz else '2026-10-15T18:00Z'::timestamptz end,
  -10, -55, 9900001, 'interior'
from public.cargas c, generate_series(1, ${TOTAL_PRINCIPAL + 2}) n where c.identidade = '${IDENTIDADE}';
insert into public.disponibilidade (carga_id, dia, satelite, municipio_codigo, classe, motivos, alcance_historico)
select c.id, d::date, 'AQUA_M-T', 9900001, 'sem_evidencia_de_lacuna', array['historico_nao_verificado', 'sem_aviso_incidente'], 'parcial'
from public.cargas c, generate_series('2026-10-01'::date, '2026-10-31'::date, interval '1 day') d where c.identidade = '${IDENTIDADE}';
insert into public.areas (carga_id, fonte, codigo, fonte_chave, nome, classe, origem_rotulo, geometria_geral, geometria_real)
select id, 'cnuc', 'A', 'focos', 'Área fictícia', 'protecao_integral', 'rotulo', '{}', '{}' from public.cargas where identidade = '${IDENTIDADE}';
insert into public.deteccoes_areas select id, 'api1', 'cnuc', 'A', 'interior' from public.cargas where identidade = '${IDENTIDADE}';
${aprovar(IDENTIDADE)}
update public.cargas set estado = 'publicada' where identidade = '${IDENTIDADE}';
insert into public.publicacao_vigente (carga_id) select id from public.cargas where identidade = '${IDENTIDADE}';
${cargaPequena(PREPARACAO, 5)}
${cargaPequena(RETIRADA, 1)}
${aprovar(RETIRADA)}
update public.cargas set estado = 'publicada' where identidade = '${RETIRADA}';
update public.cargas set estado = 'retirada' where identidade = '${RETIRADA}';
commit;`;

// Remoção pelo próprio protocolo: sai da vigência, é retirada, perde as linhas e o registro.
const LIMPEZA = `
begin;
delete from public.publicacao_vigente where carga_id in (${DA_API});
update public.cargas set estado = 'retirada' where id in (${DA_API}) and estado = 'publicada';
delete from public.fontes where carga_id in (${DA_API});
delete from public.municipios where carga_id in (${DA_API});
delete from public.cargas where id in (${DA_API});
delete from privado.manifestos_aprovados where identidade like '${'f'.repeat(63)}%';
commit;`;

let L;
const usuarios = {};
const senha = () => randomBytes(18).toString('base64url');

async function criarUsuario(email, metadados = {}) {
  const r = await requisitar(L.api, '/auth/v1/admin/users', {
    metodo: 'POST', chave: L.servico, token: L.servico,
    corpo: { email, password: senha(), email_confirm: true, user_metadata: metadados },
  });
  assert.equal(r.status, 200, `criação de usuário fictício: ${r.texto}`);
  return r.json.id;
}

// Sessão com senha gerada na hora; a senha não é guardada nem impressa.
async function entrar(id, email) {
  const nova = senha();
  const a = await requisitar(L.api, `/auth/v1/admin/users/${id}`, { metodo: 'PUT', chave: L.servico, token: L.servico, corpo: { password: nova } });
  assert.equal(a.status, 200, a.texto);
  const r = await requisitar(L.api, '/auth/v1/token?grant_type=password', { metodo: 'POST', chave: L.anon, corpo: { email, password: nova } });
  assert.equal(r.status, 200, r.texto);
  return r.json.access_token;
}

const ler = (token, caminho) => requisitar(L.api, `/rest/v1/${caminho}`, { chave: L.anon, token });
const rpc = (token, nome, corpo) => requisitar(L.api, `/rest/v1/rpc/${nome}`, { metodo: 'POST', chave: L.anon, token, corpo });
const OUTUBRO = { p_inicio: '2026-10-01', p_fim: '2026-10-31' };
const ids = {};

// As três consultas, com o mesmo período, para a matriz de papéis.
async function consultarTodas(token) {
  const r = {};
  for (const nome of RPCS) r[nome] = await rpc(token, nome, OUTUBRO);
  return r;
}

function todasNegadas(respostas, quem) {
  for (const [nome, r] of Object.entries(respostas)) {
    assert.equal(r.status, 403, `${quem} ${nome}: ${r.status} ${r.texto}`);
    assert.equal(r.json.message, 'acesso_negado', `${quem} ${nome}`);
  }
}

before(async () => {
  L = statusLocal();
  const ocupado = sqlAdmin('select count(*) from public.cargas;');
  assert.equal(ocupado, '0', 'banco local deve estar vazio; rode `npx supabase db reset`.');
  sqlAdmin(FIXTURE);
  ids.preparacao = sqlAdmin(`select id from public.cargas where identidade = '${PREPARACAO}';`);
  ids.retirada = sqlAdmin(`select id from public.cargas where identidade = '${RETIRADA}' and estado = 'retirada';`);
  assert.ok(ids.preparacao && ids.retirada, 'cargas em preparação e retirada montadas');
  usuarios.rp = { email: 'rp-api@exemplo.test' };
  usuarios.oa = { email: 'oa-api@exemplo.test' };
  usuarios.rp.id = await criarUsuario(usuarios.rp.email);
  // OA traz metadados editáveis que imitam o RP.
  usuarios.oa.id = await criarUsuario(usuarios.oa.email, { papel: 'RP', responsavel: true, email_rp: usuarios.rp.email });
});

after(async () => {
  if (!L) return;
  for (const u of Object.values(usuarios)) {
    if (u.id) await requisitar(L.api, `/auth/v1/admin/users/${u.id}`, { metodo: 'DELETE', chave: L.servico, token: L.servico });
  }
  sqlAdmin(LIMPEZA);
});

test('AN: sem sessão, nenhuma tabela, consulta ou lista privada', async () => {
  for (const t of ['cargas', 'deteccoes', 'disponibilidade', 'publicacao_vigente']) {
    const r = await ler(undefined, `${t}?select=*`);
    assert.ok([401, 403].includes(r.status), `${t}: ${r.status}`);
    assert.ok(!Array.isArray(r.json), `${t} não devolve linhas`);
  }
  for (const [nome, c] of Object.entries(await consultarTodas(undefined))) {
    assert.equal(c.status, 401, `${nome}: ${c.status} ${c.texto}`);
    assert.equal(c.json.code, '42501', `${nome}: sem permissão de execução`);
  }
  const p = await ler(undefined, 'responsaveis_autorizados?select=*');
  assert.equal(p.status, 404, 'schema privado não é exposto');
});

test('OA: autenticado com metadados de RP não lê nem grava', async () => {
  const token = await entrar(usuarios.oa.id, usuarios.oa.email);
  assert.equal(lerJwt(token).user_metadata.papel, 'RP', 'o token traz o metadado editável');
  const d = await ler(token, 'deteccoes?select=id_tecnico&limit=5');
  assert.equal(d.status, 200);
  assert.deepEqual(d.json, []);
  todasNegadas(await consultarTodas(token), 'OA');
  for (const t of TABELAS_FILHAS) {
    const r = await ler(token, `${t}?select=carga_id&carga_id=in.(${ids.preparacao},${ids.retirada})`);
    assert.deepEqual([r.status, r.json], [200, []], `OA ${t} pelo ID`);
  }
  const w = await requisitar(L.api, '/rest/v1/deteccoes?id_tecnico=eq.api1', { metodo: 'DELETE', chave: L.anon, token, cabecalhos: { Prefer: 'return=minimal' } });
  assert.ok([401, 403].includes(w.status), `delete: ${w.status}`);
  assert.equal(sqlAdmin(`select count(*) from public.deteccoes where id_tecnico = 'api1';`), '1', 'linha preservada');
});

test('RP: primeiro login → cadastro → leitura → revogação', async () => {
  let token = await entrar(usuarios.rp.id, usuarios.rp.email);

  // Primeiro login, ainda sem cadastro: nenhum dado.
  assert.deepEqual((await ler(token, 'deteccoes?select=id_tecnico&limit=5')).json, []);
  todasNegadas(await consultarTodas(token), 'RP sem cadastro');

  // Cadastro administrativo pelo UUID (fora da aplicação).
  sqlAdmin(`insert into privado.responsaveis_autorizados (user_id) values ('${usuarios.rp.id}');`);

  for (const [nome, r] of Object.entries(await consultarTodas(token))) {
    assert.equal(r.status, 200, `RP ${nome}: ${r.texto}`);
    assert.equal(String(r.json.carga.id), sqlAdmin('select carga_id from public.publicacao_vigente;'), `RP ${nome} usa a carga vigente`);
  }

  for (const tabela of ['areas', 'deteccoes_areas']) {
    const r = await ler(token, `${tabela}?select=carga_id`);
    assert.equal(r.status, 200);
    assert.equal(r.json.length, 1, `RP lê ${tabela} publicada`);
  }

  // Tabelas filhas pelo ID de cargas em preparação e retirada, sem JOIN com cargas.
  for (const [estado, id] of Object.entries({ preparacao: ids.preparacao, retirada: ids.retirada })) {
    assert.ok(Number(sqlAdmin(`select count(*) from public.deteccoes where carga_id = ${id};`)) > 0, `controle: a carga ${estado} tem linhas`);
    const c = await ler(token, `cargas?select=id&id=eq.${id}`);
    assert.deepEqual([c.status, c.json], [200, []], `RP cargas ${estado} pelo ID`);
    for (const t of TABELAS_FILHAS) {
      const r = await ler(token, `${t}?select=carga_id&carga_id=eq.${id}`);
      assert.deepEqual([r.status, r.json], [200, []], `RP ${t} da carga ${estado} pelo ID`);
    }
    for (const nome of RPCS) {
      const r = await rpc(token, nome, { p_inicio: '2026-09-01', p_fim: '2026-09-01', p_carga: Number(id) });
      // Sem dados: erro explícito. O PostgREST da pilha local não mapeia P0002 e responde 500 (ver task #21).
      assert.equal(r.json?.message, 'carga_indisponivel', `RP ${nome} com a carga ${estado}: ${r.status} ${r.texto}`);
      assert.equal(r.json?.code, 'P0002', `RP ${nome} com a carga ${estado}`);
      assert.notEqual(r.status, 200, `RP ${nome} com a carga ${estado}`);
    }
  }

  const resumo = await rpc(token, 'consultar_resumo', OUTUBRO);
  assert.equal(resumo.status, 200, resumo.texto);
  assert.equal(resumo.json.principal.total, TOTAL_PRINCIPAL, 'total exato, independente do limite de linhas');
  assert.equal(resumo.json.sensibilidade.total, TOTAL_PRINCIPAL + 2);

  const linhas = await ler(token, 'deteccoes?select=id_tecnico');
  assert.equal(linhas.status, 200);
  assert.equal(linhas.json.length, 1000, 'max_rows limita a resposta de tabela');

  const pagina = await rpc(token, 'consultar_deteccoes', { ...OUTUBRO, p_limite: 1000, p_deslocamento: 1000 });
  assert.equal(pagina.json.total, TOTAL_PRINCIPAL);
  assert.equal(pagina.json.registros.length, 5);

  const erro = await rpc(token, 'consultar_resumo', { p_inicio: '2026-10-31', p_fim: '2026-10-01' });
  assert.equal(erro.status, 400);
  assert.equal(erro.json.message, 'periodo_invertido');
  const fora = await rpc(token, 'consultar_resumo', { p_inicio: '2026-10-01', p_fim: '2026-11-01' });
  assert.equal(fora.status, 400);
  assert.equal(fora.json.message, 'periodo_fora_da_janela');
  const limite = await rpc(token, 'consultar_deteccoes', { ...OUTUBRO, p_limite: 5000 });
  assert.equal(limite.status, 400);
  assert.equal(limite.json.message, 'limite_invalido');

  // RP lê, mas não grava, não troca publicação e não alcança a lista privada.
  const ins = await requisitar(L.api, '/rest/v1/municipios', { metodo: 'POST', chave: L.anon, token, corpo: { carga_id: 1, codigo: 9900009, nome: 'x', geometria_exibicao: {} } });
  assert.ok([401, 403].includes(ins.status), `insert: ${ins.status}`);
  const troca = await requisitar(L.api, '/rest/v1/publicacao_vigente?unica=eq.true', { metodo: 'PATCH', chave: L.anon, token, corpo: { carga_id: 999 } });
  assert.ok([401, 403].includes(troca.status), `patch: ${troca.status}`);
  const helper = await rpc(token, 'eh_responsavel', {});
  assert.equal(helper.status, 404, 'helper privado não é RPC exposta');

  // Token adulterado (mesma assinatura) e token expirado são recusados.
  const adulterado = adulterarJwt(token, (p) => ({ ...p, sub: usuarios.oa.id }));
  assert.equal((await ler(adulterado, 'deteccoes?select=id_tecnico&limit=1')).status, 401);
  const agora = Math.floor(Date.now() / 1000);
  const base = { ...lerJwt(token) };
  const valido = assinarJwt({ ...base, iat: agora - 10, exp: agora + 300 }, L.segredoJwt);
  const aceito = await ler(valido, 'deteccoes?select=id_tecnico&limit=1');
  assert.equal(aceito.status, 200, 'controle: token íntegro assinado localmente é aceito');
  const expirado = assinarJwt({ ...base, iat: agora - 7200, exp: agora - 3600 }, L.segredoJwt);
  assert.equal((await ler(expirado, 'deteccoes?select=id_tecnico&limit=1')).status, 401);

  // Revogação: a mesma sessão deixa de ler na consulta seguinte.
  sqlAdmin(`delete from privado.responsaveis_autorizados where user_id = '${usuarios.rp.id}';`);
  assert.deepEqual((await ler(token, 'deteccoes?select=id_tecnico&limit=5')).json, []);
  todasNegadas(await consultarTodas(token), 'RP revogado');
  token = null;
});
