/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_CHAVE_PUBLICAVEL?: string;
  readonly VITE_AUTH_SENHA_LOCAL?: string;
  /** Chave pública da Esri, restrita ao domínio (ADR-010); vazia = sem mapa-base de satélite. */
  readonly VITE_ESRI_CHAVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
