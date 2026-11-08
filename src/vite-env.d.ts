/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_CHAVE_PUBLICAVEL?: string;
  readonly VITE_AUTH_SENHA_LOCAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
