// Ciclo 003, issue #21 — RS-2: migrações aplicadas com o papel EX já existente no cluster.
// Papéis são globais ao cluster: num banco novo, o rq_executor criado pelo reset é "preexistente".
// Cada caso cria um banco descartável, com um esboço mínimo de auth, aplica as migrações em ordem
// e o remove ao final. O caminho limpo (papel criado do zero) é o `supabase db reset`/`start`
// que precede os testes, conferido em 01_estrutura e 04_revisao_g2.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { sqlAdmin, tentarSqlAdmin } from './local.mjs';

const PASTA = path.resolve(import.meta.dirname, '../../supabase/migrations');
const MIGRACOES = readdirSync(PASTA).filter((m) => m.endsWith('.sql')).sort();
const ESBOCO_AUTH = `create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`;
const bancos = [];

// Cria o banco, prepara o caso e aplica as migrações; devolve a primeira falha, se houver.
function aplicar(banco, preparar = '') {
  tentarSqlAdmin(`drop database if exists ${banco};`);
  sqlAdmin(`create database ${banco};`);
  bancos.push(banco);
  sqlAdmin(ESBOCO_AUTH + preparar, banco);
  for (const m of MIGRACOES) {
    const r = tentarSqlAdmin(readFileSync(path.join(PASTA, m), 'utf8'), banco);
    if (!r.ok) return { migracao: m, erro: r.erro };
  }
  return null;
}

after(() => {
  for (const b of bancos) tentarSqlAdmin(`drop database if exists ${b} with (force);`);
  tentarSqlAdmin(`revoke service_role from rq_executor;`);
});

test('papel preexistente compatível: as migrações passam e a conferência aceita', () => {
  assert.equal(aplicar('rq_migracao_compativel'), null);
  assert.equal(sqlAdmin(`select privado.conferir_papel_executor('rq_executor');`, 'rq_migracao_compativel'), '');
});

test('papel preexistente associado a service_role (INHERIT FALSE, SET TRUE): migração interrompida', () => {
  sqlAdmin('grant service_role to rq_executor with inherit false, set true;');
  try {
    const falha = aplicar('rq_migracao_associado');
    assert.ok(falha, 'a migração deveria falhar');
    assert.equal(falha.migracao, MIGRACOES.at(-1), 'falha na migração de correção, depois de as anteriores aceitarem o papel');
    assert.match(falha.erro, /papel_executor_incompativel: membro de outro papel/);
  } finally {
    sqlAdmin('revoke service_role from rq_executor;');
  }
  assert.equal(sqlAdmin(`select count(*) from pg_auth_members where member = 'rq_executor'::regrole;`), '0');
});

test('papel preexistente com privilégio fora do previsto: migração interrompida', () => {
  const falha = aplicar('rq_migracao_privilegio', 'grant select on auth.users to rq_executor;');
  assert.ok(falha, 'a migração deveria falhar');
  assert.match(falha.erro, /papel_executor_incompativel: privilégio ou política fora das tabelas previstas/);
});

test('papel preexistente com configuração própria: migração interrompida', () => {
  // ALTER ROLE … IN DATABASE vale só para o banco descartável.
  const falha = aplicar('rq_migracao_configuracao', 'alter role rq_executor in database rq_migracao_configuracao set search_path = public;');
  assert.ok(falha, 'a migração deveria falhar');
  assert.match(falha.erro, /configuração própria/);
});
