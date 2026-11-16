// Configuração do servidor (plano 008, T4 e T6): só variáveis do servidor, nunca com prefixo VITE. A IA fica desligada
// por padrão; qualquer variável ausente ou inválida também a desliga. Nada aqui é registrado em log.

export const MODELO_FIXADO = 'gemini-3.8-flash';

export interface ConfigLigada {
  habilitada: true;
  supabaseUrl: string;
  chavePublica: string;
  gemini: { chave: string; modelo: string };
  /** Origens admitidas além da própria (validação de origem não substitui autenticação). */
  origens: string[];
}

export type ConfigServidor = ConfigLigada | { habilitada: false };

export type Ambiente = Record<string, string | undefined>;

const url = (x: string | undefined): string | null => {
  if (!x) return null;
  try {
    const u = new URL(x);
    return u.protocol === 'https:' || u.hostname === '127.0.0.1' || u.hostname === 'localhost' ? x.replace(/\/$/, '') : null;
  } catch {
    return null;
  }
};

/**
 * `RQ_IA_HABILITADA=true` liga a função; `RQ_SUPABASE_URL` e `RQ_SUPABASE_CHAVE_PUBLICAVEL` são a configuração
 * pública do Supabase (a sessão é a do usuário); `RQ_GEMINI_CHAVE` e `RQ_GEMINI_MODELO` (exatamente o modelo fixado,
 * sem alias) são do provedor; `RQ_ORIGENS` lista origens extras separadas por vírgula.
 */
export function lerConfigServidor(env: Ambiente): ConfigServidor {
  if (env['RQ_IA_HABILITADA'] !== 'true') return { habilitada: false };
  const supabaseUrl = url(env['RQ_SUPABASE_URL']);
  const chavePublica = env['RQ_SUPABASE_CHAVE_PUBLICAVEL'] ?? '';
  const chave = env['RQ_GEMINI_CHAVE'] ?? '';
  const modelo = env['RQ_GEMINI_MODELO'] ?? '';
  if (!supabaseUrl || !chavePublica || !chave || modelo !== MODELO_FIXADO) return { habilitada: false };
  const origens = (env['RQ_ORIGENS'] ?? '').split(',').map((x) => x.trim()).filter((x) => url(x) !== null);
  return { habilitada: true, supabaseUrl, chavePublica, gemini: { chave, modelo }, origens };
}
