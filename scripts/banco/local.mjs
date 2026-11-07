// Acesso ao Supabase local do protótipo (ciclo 003, issue #21), somente para testes e medições
// com dados fictícios. Lê URLs e chaves de demonstração do próprio `supabase status`; nada é gravado
// ou impresso. Administração (lista RP, manifestos, cargas fictícias) via psql dentro do contêiner local.
// SUPABASE_WORKDIR (opcional) aponta outra pasta com `supabase/config.toml`, para uma pilha descartável.
import { execFileSync, spawn } from 'node:child_process';
import { createHash, createHmac, pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const PASTA = path.resolve(process.env.SUPABASE_WORKDIR ?? RAIZ);
const CLI = path.join(RAIZ, 'node_modules/supabase/dist/supabase.js');
const PROJETO = /^project_id\s*=\s*"([^"]+)"/m.exec(readFileSync(path.join(PASTA, 'supabase/config.toml'), 'utf8'))[1];
const CONTEINER_DB = `supabase_db_${PROJETO}`;

export function statusLocal() {
  let saida;
  try {
    saida = execFileSync(process.execPath, [CLI, 'status', '-o', 'json', '--workdir', PASTA], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    throw new Error('Supabase local indisponível. Rode `npx supabase start` (ver ADR-005).');
  }
  const inicio = saida.indexOf('{');
  const fim = saida.lastIndexOf('}');
  const s = JSON.parse(saida.slice(inicio, fim + 1));
  const api = s.API_URL;
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(api)) throw new Error('API local inesperada; os testes só rodam em 127.0.0.1.');
  return { api, anon: s.ANON_KEY, servico: s.SERVICE_ROLE_KEY, segredoJwt: s.JWT_SECRET };
}

// Executa SQL como administrador local (postgres) e devolve a saída sem alinhamento.
export function sqlAdmin(sql, banco = 'postgres') {
  return execFileSync('docker', ['exec', '-i', CONTEINER_DB, 'psql', '-U', 'postgres', '-d', banco,
    '-v', 'ON_ERROR_STOP=1', '-q', '-At'], { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

// Como sqlAdmin, mas devolve { ok, saida, erro } em vez de lançar exceção.
export function tentarSqlAdmin(sql, banco = 'postgres') {
  try {
    return { ok: true, saida: sqlAdmin(sql, banco), erro: '' };
  } catch (e) {
    return { ok: false, saida: String(e.stdout ?? ''), erro: String(e.stderr ?? e.message) };
  }
}

// Verificador SCRAM-SHA-256 (RFC 5802/7677): a senha em claro não chega ao servidor nem aos logs.
export function verificadorScram(senha, iteracoes = 4096) {
  const sal = randomBytes(16);
  const salgada = pbkdf2Sync(senha, sal, iteracoes, 32, 'sha256');
  const chaveCliente = createHmac('sha256', salgada).update('Client Key').digest();
  const chaveArmazenada = createHash('sha256').update(chaveCliente).digest();
  const chaveServidor = createHmac('sha256', salgada).update('Server Key').digest();
  return `SCRAM-SHA-256$${iteracoes}:${sal.toString('base64')}$${chaveArmazenada.toString('base64')}:${chaveServidor.toString('base64')}`;
}

// Endereço do banco na rede Docker: conexões por ele exigem senha (scram-sha-256 no pg_hba local).
function enderecoDb() {
  return execFileSync('docker', ['inspect', '-f', '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}', CONTEINER_DB],
    { encoding: 'utf8' }).trim().split(/\s+/)[0];
}

// Tentativa avulsa de login por senha via TCP; devolve { ok, saida, erro } sem lançar exceção.
export function tentarLogin(usuario, senha, banco = 'postgres') {
  try {
    const saida = execFileSync('docker', ['exec', '-e', 'PGPASSWORD', CONTEINER_DB, 'psql', '-h', enderecoDb(), '-U', usuario,
      '-d', banco, '-At', '-c', 'select session_user;'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PGPASSWORD: senha } }).trim();
    return { ok: true, saida, erro: '' };
  } catch (e) {
    return { ok: false, saida: '', erro: String(e.stderr ?? e.message) };
  }
}

// Sessão SQL real (login por senha via TCP), mantida aberta para testes com várias conexões.
// Cada comando termina num marcador; erros do servidor ficam em `erros`, sem interromper a sessão.
export class SessaoSql {
  #p; #saida = ''; #erros = ''; #seq = 0;

  constructor(usuario, senha, banco = 'postgres') {
    this.#p = spawn('docker', ['exec', '-i', '-e', 'PGPASSWORD', CONTEINER_DB, 'psql', '-h', enderecoDb(), '-U', usuario,
      '-d', banco, '-At', '-q', '-v', 'ON_ERROR_STOP=0', '-v', 'VERBOSITY=default'],
    { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PGPASSWORD: senha } });
    this.#p.stdout.setEncoding('utf8').on('data', (d) => { this.#saida += d; });
    this.#p.stderr.setEncoding('utf8').on('data', (d) => { this.#erros += d; });
  }

  // Envia o SQL e devolve uma promessa resolvida quando o servidor terminar de responder.
  enviar(sql, prazoMs = 20000) {
    const marca = `__fim_${++this.#seq}__`;
    const inicioSaida = this.#saida.length;
    const inicioErros = this.#erros.length;
    this.#p.stdin.write(`${sql}\n\\echo ${marca}\n`);
    return new Promise((resolve, reject) => {
      const limite = Date.now() + prazoMs;
      const conferir = () => {
        const i = this.#saida.indexOf(marca, inicioSaida);
        if (i >= 0) {
          resolve({ saida: this.#saida.slice(inicioSaida, i).trim(), erros: this.#erros.slice(inicioErros).trim() });
        } else if (Date.now() > limite) {
          reject(new Error(`sessão sem resposta: ${this.#erros.slice(inicioErros)}`));
        } else {
          setTimeout(conferir, 20);
        }
      };
      conferir();
    });
  }

  async fechar() {
    this.#p.stdin.end();
    await new Promise((r) => this.#p.once('close', r));
  }
}

export async function requisitar(base, caminho, { metodo = 'GET', chave, token, corpo, cabecalhos = {} } = {}) {
  const h = { apikey: chave, ...cabecalhos };
  if (token) h.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(base + caminho, { method: metodo, headers: h, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  const texto = await r.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { json = null; }
  return { status: r.status, json, texto };
}

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

// Token HS256 assinado com o segredo de demonstração local (para o caso de token expirado).
export function assinarJwt(payload, segredo) {
  const cabecalho = b64url({ alg: 'HS256', typ: 'JWT' });
  const corpo = b64url(payload);
  const assinatura = createHmac('sha256', segredo).update(`${cabecalho}.${corpo}`).digest('base64url');
  return `${cabecalho}.${corpo}.${assinatura}`;
}

// Troca o payload mantendo cabeçalho e assinatura originais (token adulterado).
export function adulterarJwt(token, mudar) {
  const [cabecalho, corpo, assinatura] = token.split('.');
  const payload = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'));
  return `${cabecalho}.${b64url(mudar(payload))}.${assinatura}`;
}

export function lerJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
}
