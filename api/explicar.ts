// Função Node da Vercel (plano 008, item 2): `/api/explicar`. Desligada por padrão (503 em qualquer método). Toda a
// lógica fica em `servidor/`, fora do grafo do navegador; aqui só a ligação com o ambiente e o cliente Supabase por
// pedido, com a chave pública e o JWT do usuário (sem service_role).
import { createClient } from '@supabase/supabase-js';
import { lerConfigServidor, type ConfigLigada } from '../servidor/config.ts';
import { tratarExplicar, type Dependencias } from '../servidor/explicar.ts';
import { criarGemini } from '../servidor/gemini.ts';

export function criarCliente(config: ConfigLigada, token: string, sinal: () => AbortSignal) {
  return createClient(config.supabaseUrl, config.chavePublica, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (entrada, init) => fetch(entrada, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, sinal()]) : sinal() }),
    },
  });
}

const dependencias = (): Dependencias => ({
  config: lerConfigServidor(process.env),
  criarCliente,
  provedor: (config) => criarGemini(config.gemini),
  registrar: (e) => console.info(JSON.stringify({ funcao: 'explicar', ...e })),
});

const tratar = (request: Request): Promise<Response> => tratarExplicar(request, dependencias());

export const GET = tratar;
export const POST = tratar;
export const PUT = tratar;
export const PATCH = tratar;
export const DELETE = tratar;
export const OPTIONS = tratar;
export const HEAD = tratar;
