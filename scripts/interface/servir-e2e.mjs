// Ciclo 003, issue #23 — servidor do E2E: constrói a interface contra o Supabase local e a serve em
// 127.0.0.1:5173 (a porta do `site_url` do Auth local). A URL e a chave publicável vêm de `supabase status`
// em tempo de execução; nada disso é versionado. O build de teste habilita o login por senha local
// (VITE_AUTH_SENHA_LOCAL) — o build de produção não o inclui.
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { statusLocal } from '../banco/local.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const VITE = path.join(RAIZ, 'node_modules/vite/bin/vite.js');
const L = statusLocal();
const env = {
  ...process.env,
  VITE_SUPABASE_URL: L.api,
  VITE_SUPABASE_CHAVE_PUBLICAVEL: L.anon,
  VITE_AUTH_SENHA_LOCAL: 'true',
  RQ_OUT_DIR: 'dist-e2e',
};

const build = spawnSync(process.execPath, [VITE, 'build'], { cwd: RAIZ, env, stdio: ['ignore', 'ignore', 'inherit'] });
if (build.status !== 0) process.exit(build.status ?? 1);

const servidor = spawn(process.execPath, [VITE, 'preview', '--outDir', 'dist-e2e', '--port', '5173', '--strictPort', '--host', '127.0.0.1'],
  { cwd: RAIZ, env, stdio: ['ignore', 'inherit', 'inherit'] });
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => servidor.kill());
servidor.on('exit', (codigo) => process.exit(codigo ?? 0));
