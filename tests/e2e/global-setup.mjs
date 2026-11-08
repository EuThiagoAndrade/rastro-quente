// Prepara e desfaz a fixture fictícia do E2E: versão publicada com três municípios inventados e duas
// contas de teste (RP e OA, e-mails .test) criadas e removidas pelo próprio teste.
import { requisitar, sqlAdmin, statusLocal } from '../../scripts/banco/local.mjs';
import { SQL_LIMPEZA, sqlFixture } from './fixture.mjs';
import { CONTAS, criarConta, removerConta } from './contas.mjs';

export default async function globalSetup() {
  const ocupado = sqlAdmin('select count(*) from public.cargas;');
  if (ocupado !== '0') throw new Error('Banco local deve estar vazio; rode `npx supabase db reset` (npm run test:e2e já faz).');
  sqlAdmin(sqlFixture());
  const L = statusLocal();
  // OA traz metadados editáveis que imitam o RP: não podem conceder acesso.
  await criarConta(L, 'rp', {});
  await criarConta(L, 'oa', { papel: 'RP', responsavel: true });
  return async () => {
    for (const nome of Object.keys(CONTAS)) await removerConta(L, nome);
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin("delete from privado.responsaveis_autorizados where user_id in (select id from auth.users where email like '%@exemplo.test');");
  };
}

export { requisitar };
