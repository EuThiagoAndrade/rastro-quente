// Sessão: cliente Supabase (somente chave publicável), login Google (PKCE), login local de teste e logout.
// A sessão fica no armazenamento do próprio SDK; dados de consulta nunca são gravados em armazenamento.
import { createClient, type AuthChangeEvent, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { Configuracao } from './config.ts';

export type EventoSessao = 'com_sessao' | 'sem_sessao' | 'saiu';

export interface Sessao {
  cliente: SupabaseClient;
  entrarComGoogle(): Promise<string | null>;
  entrarComSenha(email: string, senha: string): Promise<string | null>;
  sair(): Promise<void>;
  /** Encerra só localmente (sessão expirada ou revogada no servidor). */
  encerrarLocal(): Promise<void>;
  aoMudar(f: (evento: EventoSessao, sessao: Session | null) => void): void;
}

export function criarSessao(config: Configuracao): Sessao {
  const cliente = createClient(config.urlSupabase, config.chavePublicavel, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    // Nenhuma resposta de consulta fica em cache do navegador.
    global: { fetch: (entrada, opcoes) => fetch(entrada, { ...opcoes, cache: 'no-store' }) },
  });
  let ouvinte: ((evento: EventoSessao, sessao: Session | null) => void) | null = null;
  let saidaExplicita = false;

  cliente.auth.onAuthStateChange((evento: AuthChangeEvent, sessao: Session | null) => {
    // Fora do callback: o SDK não permite chamar a API de dentro dele.
    setTimeout(() => {
      if (!ouvinte) return;
      if (evento === 'SIGNED_OUT') {
        ouvinte(saidaExplicita ? 'saiu' : 'sem_sessao', null);
        saidaExplicita = false;
      } else if (sessao && (evento === 'INITIAL_SESSION' || evento === 'SIGNED_IN')) {
        ouvinte('com_sessao', sessao);
      } else if (!sessao && evento === 'INITIAL_SESSION') {
        ouvinte('sem_sessao', null);
      }
    }, 0);
  });

  return {
    cliente,
    aoMudar(f) {
      ouvinte = f;
    },
    async entrarComGoogle() {
      const { error } = await cliente.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}${location.pathname}` },
      });
      return error ? 'Não foi possível iniciar o login com o Google.' : null;
    },
    async entrarComSenha(email, senha) {
      if (!config.senhaLocal) return 'Login por senha indisponível neste ambiente.';
      const { error } = await cliente.auth.signInWithPassword({ email, password: senha });
      return error ? 'E-mail ou senha incorretos.' : null;
    },
    async sair() {
      saidaExplicita = true;
      await cliente.auth.signOut();
    },
    async encerrarLocal() {
      await cliente.auth.signOut({ scope: 'local' });
    },
  };
}
