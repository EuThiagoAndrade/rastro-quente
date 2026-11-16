// Ciclo 003, issue #23 — aplicação estática (sem servidor intermediário). Porta fixa para coincidir
// com o `site_url` do Auth local (supabase/config.toml). O bundle não recebe dados nem segredos:
// só a URL e a chave publicável do Supabase (VITE_*), definidas no momento do build.
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Issue #24 — só no E2E (RQ_CABECALHOS_DO_DEPLOY=1): o `vite preview` serve os cabeçalhos de `vercel.json`
// (CSP incluída), para provar que a interface funciona sob a mesma política do deploy. A única troca é o
// `https://*.supabase.co` da CSP pela origem do Supabase local.
function cabecalhosDoDeploy() {
  if (!process.env.RQ_CABECALHOS_DO_DEPLOY) return undefined;
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
  const origemApi = new URL(process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321').origin;
  const todos = config.headers.find((h) => h.source === '/(.*)').headers;
  return Object.fromEntries(todos.map(({ key, value }) => [key, value.replace('https://*.supabase.co', origemApi)]));
}

export default defineConfig({
  build: { outDir: process.env.RQ_OUT_DIR ?? 'dist', emptyOutDir: true, sourcemap: false, target: 'es2022' },
  server: { port: 5173, strictPort: true, host: '127.0.0.1' },
  preview: {
    port: 5173, strictPort: true, host: '127.0.0.1', headers: cabecalhosDoDeploy(),
    // Issue #80 — só no E2E (RQ_API_E2E): `/api` vai ao handler real com o provedor simulado, na mesma origem.
    proxy: process.env.RQ_API_E2E ? { '/api': { target: process.env.RQ_API_E2E } } : undefined,
  },
});
