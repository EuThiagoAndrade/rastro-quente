// Acesso ao Supabase local do protótipo (ciclo 003, issue #21), somente para testes e medições
// com dados fictícios. Lê URLs e chaves de demonstração do próprio `supabase status`; nada é gravado
// ou impresso. Administração (lista RP, cargas fictícias) via psql dentro do contêiner local.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import path from 'node:path';

const CONTEINER_DB = 'supabase_db_rastro-quente';
const CLI = path.resolve(import.meta.dirname, '../../node_modules/supabase/dist/supabase.js');

export function statusLocal() {
  let saida;
  try {
    saida = execFileSync(process.execPath, [CLI, 'status', '-o', 'json'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    throw new Error('Supabase local indisponível. Rode `npx supabase start` (ver ADR-005).');
  }
  const inicio = saida.indexOf('{');
  const fim = saida.lastIndexOf('}');
  const s = JSON.parse(saida.slice(inicio, fim + 1));
  const api = s.API_URL;
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(api)) throw new Error('API local inesperada; os testes só rodam em 127.0.0.1.');
  return { api, anon: s.ANON_KEY, servico: s.SERVICE_ROLE_KEY, segredoJwt: s.JWT_SECRET };
}

// Executa SQL como administrador local (postgres) e devolve a saída sem alinhamento.
export function sqlAdmin(sql) {
  return execFileSync('docker', ['exec', '-i', CONTEINER_DB, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1', '-q', '-At'], { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

export async function requisitar(base, caminho, { metodo = 'GET', chave, token, corpo, cabecalhos = {} } = {}) {
  const h = { apikey: chave, ...cabecalhos };
  if (token) h.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(base + caminho, { method: metodo, headers: h, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  const texto = await r.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { json = null; }
  return { status: r.status, json, texto };
}

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

// Token HS256 assinado com o segredo de demonstração local (para o caso de token expirado).
export function assinarJwt(payload, segredo) {
  const cabecalho = b64url({ alg: 'HS256', typ: 'JWT' });
  const corpo = b64url(payload);
  const assinatura = createHmac('sha256', segredo).update(`${cabecalho}.${corpo}`).digest('base64url');
  return `${cabecalho}.${corpo}.${assinatura}`;
}

// Troca o payload mantendo cabeçalho e assinatura originais (token adulterado).
export function adulterarJwt(token, mudar) {
  const [cabecalho, corpo, assinatura] = token.split('.');
  const payload = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'));
  return `${cabecalho}.${b64url(mudar(payload))}.${assinatura}`;
}

export function lerJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
}
