// Configuração pública do cliente. Só a URL do projeto e a chave publicável (anon) entram no bundle;
// nenhuma credencial administrativa, do executor ou de OAuth chega aqui.

export interface Configuracao {
  urlSupabase: string;
  chavePublicavel: string;
  /** Login por e-mail e senha: só em build local de desenvolvimento/teste (VITE_AUTH_SENHA_LOCAL=true). */
  senhaLocal: boolean;
}

interface Env {
  VITE_SUPABASE_URL?: string | undefined;
  VITE_SUPABASE_CHAVE_PUBLICAVEL?: string | undefined;
  VITE_AUTH_SENHA_LOCAL?: string | undefined;
}

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);

export function lerConfiguracao(env: Env): Configuracao | null {
  const url = (env.VITE_SUPABASE_URL ?? '').trim();
  const chave = (env.VITE_SUPABASE_CHAVE_PUBLICAVEL ?? '').trim();
  if (!url || !chave) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  // Fora do loopback, só HTTPS.
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && LOOPBACK.has(u.hostname))) return null;
  const senhaLocal = env.VITE_AUTH_SENHA_LOCAL === 'true' && LOOPBACK.has(u.hostname);
  return { urlSupabase: u.origin, chavePublicavel: chave, senhaLocal };
}
