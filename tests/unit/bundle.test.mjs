// Inspeção do bundle de produção e do que é enviado ao deploy: constrói sem o login local e sem segredos,
// e confere que não há `local/`, credenciais, dados territoriais nem o formulário de senha de teste.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const SAIDA = mkdtempSync(path.join(os.tmpdir(), 'rq-bundle-'));
// Chave publicável fictícia (JWT de papel anon, sem valor real).
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const ANON = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ role: 'anon', iss: 'exemplo' })}.assinatura`;

function arquivos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivos(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

let lista;
before(() => {
  const r = spawnSync(process.execPath, [path.join(RAIZ, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', SAIDA, '--emptyOutDir'], {
    cwd: RAIZ, encoding: 'utf8',
    env: { ...process.env, RQ_OUT_DIR: SAIDA, VITE_SUPABASE_URL: 'https://projeto-exemplo.supabase.co', VITE_SUPABASE_CHAVE_PUBLICAVEL: ANON, VITE_AUTH_SENHA_LOCAL: '' },
  });
  assert.equal(r.status, 0, r.stderr);
  lista = arquivos(SAIDA);
});

test('só HTML, JS, CSS e imagens do Leaflet; sem mapas de código nem dados', () => {
  const extensoes = new Set(lista.map((f) => path.extname(f)));
  for (const e of extensoes) assert.ok(['.html', '.js', '.css', '.png', '.svg'].includes(e), `extensão inesperada: ${e}`);
  assert.ok(!lista.some((f) => f.endsWith('.map')), 'sem sourcemaps');
  assert.ok(!lista.some((f) => /\.(json|geojson|csv|sqlite|db|sql)$/.test(f)), 'sem dados');
  const total = lista.reduce((s, f) => s + statSync(f).size, 0);
  assert.ok(total < 1_500_000, `bundle pequeno: ${total} bytes`);
});

test('nenhum caminho local, segredo ou credencial no bundle', () => {
  const texto = lista.filter((f) => /\.(html|js|css)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const proibido of ['local/dados-prototipo', 'local/brainstorm', 'local/prototipo', 'service_role', 'SERVICE_ROLE', 'rq_executor', 'RQ_EXECUTOR', 'SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET', 'responsaveis_autorizados']) {
    assert.ok(!texto.includes(proibido), `não deve conter "${proibido}"`);
  }
  // Todo JWT embutido é de papel anon.
  for (const [jwt] of texto.matchAll(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g)) {
    const papel = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8')).role;
    assert.equal(papel, 'anon', 'só a chave publicável');
  }
  assert.ok(texto.includes('projeto-exemplo.supabase.co'), 'a URL pública do projeto é embutida');
});

test('build de produção não traz o login por senha de teste', () => {
  const texto = lista.filter((f) => f.endsWith('.js')).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.ok(!texto.includes('somente ambiente local'), 'formulário de senha ausente');
  assert.ok(texto.includes('Entrar com o Google'));
});

test('sem fonte web, analytics, tiles de terceiros ou outro serviço', () => {
  const texto = lista.filter((f) => /\.(html|js|css)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const proibido of ['fonts.googleapis', 'fonts.gstatic', 'google-analytics', 'googletagmanager', 'tile.openstreetmap', 'tiles.', 'unpkg.com', 'cdn.jsdelivr']) {
    assert.ok(!texto.includes(proibido), `não deve conter "${proibido}"`);
  }
  assert.ok(!/<link[^>]+href="https?:/.test(readFileSync(path.join(SAIDA, 'index.html'), 'utf8')), 'sem CSS externo');
});

test('o upload (.vercelignore) exclui local/ e o Git ignora o build', () => {
  const vercel = readFileSync(path.join(RAIZ, '.vercelignore'), 'utf8').split(/\r?\n/);
  assert.ok(vercel.includes('local/'));
  const git = readFileSync(path.join(RAIZ, '.gitignore'), 'utf8').split(/\r?\n/);
  assert.ok(git.includes('dist/') && git.includes('dist-e2e/') && git.includes('/local/'));
});
