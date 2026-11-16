// Ciclo 003, issue #23 — servidor do E2E: constrói a interface contra o Supabase local e a serve em
// 127.0.0.1:5173 (a porta do `site_url` do Auth local). A URL e a chave publicável vêm de `supabase status`
// em tempo de execução; nada disso é versionado. O build de teste habilita o login por senha local
// (VITE_AUTH_SENHA_LOCAL) — o build de produção não o inclui.
// Ciclo 007, issue #64 — com `--esri`, um segundo build recebe um valor FICTÍCIO em VITE_ESRI_CHAVE e é servido em
// 127.0.0.1:5174, para o E2E do mapa-base com os hosts de tiles interceptados. Nenhuma chave real entra no E2E.
// Ciclo 008, issue #80 — sem `--esri`, `/api/explicar` é o handler real com o provedor simulado
// (scripts/interface/api-e2e.mjs, em 127.0.0.1:5180), encaminhado pelo `vite preview` na mesma origem.
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { statusLocal } from '../banco/local.mjs';
import { iniciarApiE2e } from './api-e2e.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const VITE = path.join(RAIZ, 'node_modules/vite/bin/vite.js');
const ESRI = process.argv.includes('--esri');
const PORTA = ESRI ? '5174' : '5173';
const SAIDA = ESRI ? 'dist-e2e-esri' : 'dist-e2e';
const L = statusLocal();
const PORTA_API = '5180';
const env = {
  ...process.env,
  VITE_SUPABASE_URL: L.api,
  VITE_SUPABASE_CHAVE_PUBLICAVEL: L.anon,
  VITE_AUTH_SENHA_LOCAL: 'true',
  RQ_OUT_DIR: SAIDA,
  VITE_ESRI_CHAVE: ESRI ? 'chave-ficticia-e2e' : '',
  RQ_CABECALHOS_DO_DEPLOY: '1', // issue #24: serve os cabeçalhos (CSP) de vercel.json
  RQ_API_E2E: ESRI ? '' : `http://127.0.0.1:${PORTA_API}`,
};

const build = spawnSync(process.execPath, [VITE, 'build'], { cwd: RAIZ, env, stdio: ['ignore', 'ignore', 'inherit'] });
if (build.status !== 0) process.exit(build.status ?? 1);

const api = ESRI ? null : await iniciarApiE2e({ porta: Number(PORTA_API), supabaseUrl: L.api, chavePublica: L.anon, origem: `http://127.0.0.1:${PORTA}` });

const servidor = spawn(process.execPath, [VITE, 'preview', '--outDir', SAIDA, '--port', PORTA, '--strictPort', '--host', '127.0.0.1'],
  { cwd: RAIZ, env, stdio: ['ignore', 'inherit', 'inherit'] });
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => { servidor.kill(); api?.close(); });
servidor.on('exit', (codigo) => process.exit(codigo ?? 0));
