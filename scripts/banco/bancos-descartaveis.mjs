// Ciclo 003, issue #22 — bancos locais descartáveis, reconstruídos só a partir de `supabase/migrations/`.
// Papéis são do cluster: o rq_executor criado pelo reset é o mesmo em qualquer banco novo (como em
// migracao.test.mjs). Cada banco recebe um esboço mínimo de auth, as migrações em ordem e nada mais.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { sqlAdmin, tentarSqlAdmin } from './local.mjs';

const PASTA = path.resolve(import.meta.dirname, '../../supabase/migrations');
const ESBOCO_AUTH = `create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`;

// Cria o banco do zero e devolve as migrações aplicadas. Falha se o nome já existir.
// A migração de correção G2 fecha o LOGIN do EX (papel do cluster, não do banco): se a janela de carga
// estava aberta, ela é reaberta ao final, como o operador faz depois de migrar (ordem do runbook).
export function criarBancoDescartavel(nome) {
  if (!/^rq_[a-z0-9_]+$/.test(nome)) throw new Error(`Nome de banco descartável inválido: ${nome}`);
  const janelaAberta = sqlAdmin("select rolcanlogin from pg_roles where rolname = 'rq_executor';") === 't';
  sqlAdmin(`create database ${nome};`);
  sqlAdmin(ESBOCO_AUTH, nome);
  const aplicadas = [];
  for (const m of readdirSync(PASTA).filter((f) => f.endsWith('.sql')).sort()) {
    sqlAdmin(readFileSync(path.join(PASTA, m), 'utf8'), nome);
    aplicadas.push(m);
  }
  if (janelaAberta) sqlAdmin('alter role rq_executor login;');
  return aplicadas;
}

export const removerBanco = (nome) => tentarSqlAdmin(`drop database if exists ${nome} with (force);`);
