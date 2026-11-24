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
    env: { ...process.env, RQ_OUT_DIR: SAIDA, VITE_SUPABASE_URL: 'https://projeto-exemplo.supabase.co', VITE_SUPABASE_CHAVE_PUBLICAVEL: ANON, VITE_AUTH_SENHA_LOCAL: '', VITE_ESRI_CHAVE: '' },
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

test('sem fonte web, analytics ou outro serviço; tiles só dos dois hosts da Esri', () => {
  const texto = lista.filter((f) => /\.(html|js|css)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const proibido of ['fonts.googleapis', 'fonts.gstatic', 'google-analytics', 'googletagmanager', 'tile.openstreetmap', 'tiles.', 'unpkg.com', 'cdn.jsdelivr']) {
    assert.ok(!texto.includes(proibido), `não deve conter "${proibido}"`);
  }
  assert.ok(!/<link[^>]+href="https?:/.test(readFileSync(path.join(SAIDA, 'index.html'), 'utf8')), 'sem CSS externo');
  const hosts = new Set([...texto.matchAll(/[\w.-]+\.arcgis\.com/g)].map((m) => m[0]));
  assert.deepEqual([...hosts].sort(), ['ibasemaps-api.arcgis.com', 'static-map-tiles-api.arcgis.com']);
});

test('nenhuma chave da Esri versionada; build sem VITE_ESRI_CHAVE não embute chave', () => {
  const r = spawnSync('git', ['ls-files'], { cwd: RAIZ, encoding: 'utf8' });
  assert.equal(r.status, 0);
  for (const f of r.stdout.split(/\r?\n/).filter((x) => x && !x.startsWith('local/'))) {
    let conteudo;
    try { conteudo = readFileSync(path.join(RAIZ, f), 'utf8'); } catch { continue; }
    assert.ok(!/^\s*VITE_ESRI_CHAVE\s*=\s*\S/m.test(conteudo), `valor de VITE_ESRI_CHAVE em ${f}`);
    // Chaves de API da Esri (Location Platform) começam por AAPK ou AAPT.
    assert.ok(!/AAP[KT][\w-]{20,}/.test(conteudo), `chave da Esri em ${f}`);
  }
  const js = lista.filter((f) => f.endsWith('.js')).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.ok(!/AAP[KT][\w-]{20,}/.test(js));
});

test('o upload (.vercelignore) exclui local/ e o Git ignora o build', () => {
  const vercel = readFileSync(path.join(RAIZ, '.vercelignore'), 'utf8').split(/\r?\n/);
  assert.ok(vercel.includes('local/'));
  const git = readFileSync(path.join(RAIZ, '.gitignore'), 'utf8').split(/\r?\n/);
  assert.ok(git.includes('dist/') && git.includes('dist-e2e/') && git.includes('/local/'));
});

test('vercel.json: build estático, CSP restrita ao Supabase e aos tiles da Esri, sem segredo e sem previews fora de main', () => {
  const texto = readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8');
  const v = JSON.parse(texto);
  assert.equal(v.outputDirectory, 'dist');
  assert.equal(v.buildCommand, 'npm run build');
  assert.equal(v.installCommand, 'npm ci');
  assert.equal(v.git.deploymentEnabled.main, true);
  assert.equal(v.git.deploymentEnabled['**'], false, 'branches e PRs não geram deploy');
  assert.ok(!('env' in v) && !('build' in v), 'variáveis ficam no painel da Vercel, nunca no arquivo');
  // Issue #81 (plano 008, T6): só a função de explicação, com 300 s (máximo do Hobby com Fluid compute); o orçamento
  // interno de 270 s encerra 30 s antes. Ciclo 012 (issue #113): a interpretação da pergunta, com 30 s (o provedor tem
  // 20 s e o navegador usa o interpretador local depois disso).
  assert.deepEqual(v.functions, { 'api/explicar.ts': { maxDuration: 300 }, 'api/interpretar.ts': { maxDuration: 30 } });
  assert.ok(!/(service_role|rq_executor|eyJ[\w-]+\.|sb_secret_|postgres(ql)?:\/\/)/i.test(texto), 'sem segredo');
  const gerais = Object.fromEntries(v.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value]));
  const csp = Object.fromEntries(gerais['Content-Security-Policy'].split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...r]) => [k, r]));
  assert.deepEqual(csp['default-src'], ["'none'"]);
  assert.deepEqual(csp['script-src'], ["'self'"]);
  assert.deepEqual(csp['connect-src'], ["'self'", 'https://*.supabase.co']);
  // Mapa-base (issue #64, ADR-010): `img-src` só ganha os dois hosts de tiles da Esri, sem curinga.
  assert.deepEqual(csp['img-src'], ["'self'", 'data:', 'https://ibasemaps-api.arcgis.com', 'https://static-map-tiles-api.arcgis.com']);
  assert.ok(!JSON.stringify(csp).includes('unsafe-'), 'sem unsafe-inline/unsafe-eval');
  assert.deepEqual(csp['frame-ancestors'], ["'none'"]);
  assert.equal(gerais['X-Content-Type-Options'], 'nosniff');
  assert.equal(gerais['Referrer-Policy'], 'no-referrer');
  const cache = Object.fromEntries(v.headers.filter((h) => h.headers.some((x) => x.key === 'Cache-Control')).map((h) => [h.source, h.headers[0].value]));
  assert.match(cache['/assets/(.*)'], /immutable/);
  assert.equal(cache['/'], 'no-cache');
  assert.equal(cache['/index.html'], 'no-cache');
});

test('o upload (.vercelignore) também exclui credenciais, dependências e resultados', () => {
  const vercel = readFileSync(path.join(RAIZ, '.vercelignore'), 'utf8').split(/\r?\n/);
  for (const item of ['local/', '.env', '.env.*', 'node_modules/', 'dist/', 'test-results/']) assert.ok(vercel.includes(item), item);
});

test('função de explicação (ciclo 008): nada do servidor no bundle e nenhuma chave do Gemini versionada', () => {
  const texto = lista.filter((f) => /\.(html|js|css)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const proibido of ['RQ_GEMINI', 'RQ_IA_HABILITADA', 'RQ_SUPABASE', 'generativelanguage.googleapis.com', 'x-goog-api-key']) {
    assert.ok(!texto.includes(proibido), `não deve conter "${proibido}"`);
  }
  const r = spawnSync('git', ['ls-files'], { cwd: RAIZ, encoding: 'utf8' });
  assert.equal(r.status, 0);
  for (const f of r.stdout.split(/\r?\n/).filter((x) => x && !x.startsWith('local/'))) {
    let conteudo;
    try { conteudo = readFileSync(path.join(RAIZ, f), 'utf8'); } catch { continue; }
    assert.ok(!/^\s*(VITE_)?RQ_GEMINI_CHAVE\s*=\s*\S/m.test(conteudo), `valor de RQ_GEMINI_CHAVE em ${f}`);
    assert.ok(!/VITE_[A-Z_]*GEMINI/.test(conteudo), `variável do Gemini com prefixo VITE em ${f}`);
    // Chaves de API do Google começam por AIza.
    assert.ok(!/AIza[\w-]{30,}/.test(conteudo), `chave do Google em ${f}`);
  }
});
