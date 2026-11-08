// Contas fictícias do E2E (e-mails `.test`). As senhas são geradas na hora, guardadas só em memória do
// processo e nunca impressas. Administração (cadastro/revogação do RP) por SQL, fora da aplicação.
import { randomBytes } from 'node:crypto';
import { requisitar, sqlAdmin, statusLocal } from '../../scripts/banco/local.mjs';

export const CONTAS = {
  rp: { email: 'rp-e2e@exemplo.test', id: null },
  oa: { email: 'oa-e2e@exemplo.test', id: null },
};

const idPorEmail = (email) => sqlAdmin(`select id from auth.users where email = '${email}';`);

export async function criarConta(L, nome, metadados) {
  const c = CONTAS[nome];
  const r = await requisitar(L.api, '/auth/v1/admin/users', {
    metodo: 'POST', chave: L.servico, token: L.servico,
    corpo: { email: c.email, password: randomBytes(18).toString('base64url'), email_confirm: true, user_metadata: metadados },
  });
  if (r.status !== 200) throw new Error(`conta fictícia ${nome}: ${r.status}`);
  c.id = r.json.id;
}

export async function removerConta(L, nome) {
  const c = CONTAS[nome];
  const id = c.id ?? idPorEmail(c.email);
  if (id) await requisitar(L.api, `/auth/v1/admin/users/${id}`, { metodo: 'DELETE', chave: L.servico, token: L.servico });
}

// Nova senha para a conta (fora do alcance do navegador até o preenchimento do formulário).
export async function senhaDe(nome) {
  const L = statusLocal();
  const c = CONTAS[nome];
  const id = c.id ?? idPorEmail(c.email);
  const senha = randomBytes(18).toString('base64url');
  const r = await requisitar(L.api, `/auth/v1/admin/users/${id}`, { metodo: 'PUT', chave: L.servico, token: L.servico, corpo: { password: senha } });
  if (r.status !== 200) throw new Error(`senha da conta ${nome}: ${r.status}`);
  c.id = id;
  return senha;
}

export const emailDe = (nome) => CONTAS[nome].email;

export function cadastrarRp() {
  const id = CONTAS.rp.id ?? idPorEmail(CONTAS.rp.email);
  sqlAdmin(`insert into privado.responsaveis_autorizados (user_id) values ('${id}') on conflict do nothing;`);
}

export function revogarRp() {
  const id = CONTAS.rp.id ?? idPorEmail(CONTAS.rp.email);
  sqlAdmin(`delete from privado.responsaveis_autorizados where user_id = '${id}';`);
}

/** Token de acesso da conta, para chamar a API diretamente (sem a interface). */
export async function tokenDe(nome) {
  const L = statusLocal();
  const senha = await senhaDe(nome);
  const r = await requisitar(L.api, '/auth/v1/token?grant_type=password', {
    metodo: 'POST', chave: L.anon, corpo: { email: CONTAS[nome].email, password: senha },
  });
  if (r.status !== 200) throw new Error(`token da conta ${nome}: ${r.status}`);
  return r.json.access_token;
}
