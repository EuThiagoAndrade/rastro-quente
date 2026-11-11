// Ciclo 004, issue #33 — publica a carga REAL de `local/dados-prototipo/` num Supabase local VAZIO, pela
// mesma CLI e papel executor do ciclo 003 (como scripts/interface/medir-geometria.mjs), e cria um RP
// fictício para chamar as RPCs sob RLS. Usado só por scripts locais (conferência e medição das lentes):
// nada disso roda na CI nem grava dado real fora de `local/`.
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { requisitar, sqlAdmin, statusLocal, verificadorScram } from '../banco/local.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const CARGA = path.join(RAIZ, 'scripts/banco/carga.mjs');

export const L = statusLocal();

/** Publica a carga real (exibição `intermediaria`) e devolve id, identidade, satélite e janela. */
export function publicarCargaReal(revisao) {
  if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio (o script npm já roda `supabase db reset`).');
  const senhaEx = randomBytes(24).toString('base64url');
  sqlAdmin(`alter role rq_executor login password '${verificadorScram(senhaEx)}';`);
  const alvo = `postgresql://rq_executor@127.0.0.1:${L.bancoPorta}/postgres`;
  const cli = (args) => JSON.parse(execFileSync(process.execPath, [CARGA, ...args], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, RQ_EXECUTOR_PASSWORD: senhaEx },
  }));
  const opcoes = ['--alvo', alvo, '--exibicao', 'intermediaria', '--revisao', String(revisao)];
  const sql = path.join(LOCAL, `aprovacao-lentes-r${revisao}.sql`);
  const plano = cli(['plan', ...opcoes, '--sql', sql]);
  if (plano.paradas.length) throw new Error(`plano com parada: ${plano.paradas}`);
  sqlAdmin(readFileSync(sql, 'utf8'));
  const r = cli(['apply', ...opcoes, '--identidade', plano.identidade]);
  if (r.result !== 'executed') throw new Error(`apply: ${r.result}`);
  sqlAdmin('alter role rq_executor nologin password null;');
  const [id, satelite, inicio, fim] = sqlAdmin(`select id, satelite, to_char(janela_inicio at time zone 'UTC', 'YYYY-MM-DD'), to_char((janela_fim at time zone 'UTC') - interval '1 day', 'YYYY-MM-DD') from public.cargas where identidade = '${plano.identidade}';`).split('|');
  return { id: Number(id), identidade: plano.identidade, satelite, janela: { inicio, fim } };
}

/** RP fictício (e-mail .test, senha gerada e nunca impressa), autorizado pela lista administrativa. */
export async function criarRp(email) {
  const senha = randomBytes(18).toString('base64url');
  const u = await requisitar(L.api, '/auth/v1/admin/users', { metodo: 'POST', chave: L.servico, token: L.servico, corpo: { email, password: senha, email_confirm: true } });
  if (u.status !== 200) throw new Error(`usuário fictício: ${u.status}`);
  sqlAdmin(`insert into privado.responsaveis_autorizados values ('${u.json.id}');`);
  const token = async () => {
    const t = await requisitar(L.api, '/auth/v1/token?grant_type=password', { metodo: 'POST', chave: L.anon, corpo: { email, password: senha } });
    return t.json.access_token;
  };
  return { id: u.json.id, email, senha, token };
}

/** Remove a carga, o RP fictício e as aprovações, deixando o banco local vazio. */
export async function limpar(rp) {
  sqlAdmin(`alter role rq_executor nologin password null;
begin;
delete from public.publicacao_vigente;
update public.cargas set estado = 'retirada' where estado = 'publicada';
delete from public.disponibilidade; delete from public.deteccoes; delete from public.municipios; delete from public.malhas; delete from public.fontes;
delete from public.cargas; delete from privado.manifestos_aprovados;
${rp ? `delete from privado.responsaveis_autorizados where user_id = '${rp.id}';` : ''}
commit;`);
  if (rp) await requisitar(L.api, `/auth/v1/admin/users/${rp.id}`, { metodo: 'DELETE', chave: L.servico, token: L.servico });
}
