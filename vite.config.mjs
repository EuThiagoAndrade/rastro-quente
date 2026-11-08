// Ciclo 003, issue #23 — aplicação estática (sem servidor intermediário). Porta fixa para coincidir
// com o `site_url` do Auth local (supabase/config.toml). O bundle não recebe dados nem segredos:
// só a URL e a chave publicável do Supabase (VITE_*), definidas no momento do build.
import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: process.env.RQ_OUT_DIR ?? 'dist', emptyOutDir: true, sourcemap: false, target: 'es2022' },
  server: { port: 5173, strictPort: true, host: '127.0.0.1' },
  preview: { port: 5173, strictPort: true, host: '127.0.0.1' },
});
