// Ciclo 003, issue #22 — reconstrução da carga REAL do item 1 em banco local novo, pela CLI de produção:
// migrações → aprovação administrativa do manifesto → `apply` → `resumo` idêntico ao da carga original.
// Também derruba o banco no meio do `apply` e reconstrói do zero. Registra durações e etapas que dependem
// do operador. Usa `local/dados-prototipo/` (fora do Git) e grava `local/dados-prototipo/reconstrucao.json`.
// Uso: npx supabase db reset && node scripts/banco/reconstruir.mjs
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';
import { LOCAL } from '../prototipo/caminhos.mjs';
import { criarBancoDescartavel, removerBanco } from './bancos-descartaveis.mjs';
import { sqlAdmin, statusLocal, verificadorScram } from './local.mjs';

const CARGA = path.resolve(import.meta.dirname, 'carga.mjs');
const PORTA = statusLocal().bancoPorta;
const url = (banco) => `postgresql://rq_executor@127.0.0.1:${PORTA}/${banco}`;
const senha = randomBytes(24).toString('base64url');
const ambiente = { ...process.env, RQ_EXECUTOR_PASSWORD: senha };
const PARAMETROS = ['--exibicao', 'intermediaria', '--revisao', '1'];

if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npx supabase db reset`.');

const cli = (args) => JSON.parse(execFileSync(process.execPath, [CARGA, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: ambiente }));
const cronometrar = (fn) => {
  const t = performance.now();
  const r = fn();
  return { r, ms: Math.round(performance.now() - t) };
};

// Etapas 1–3 da reconstrução num banco: aprovação administrativa e apply pela CLI.
function carregarNo(banco) {
  const sql = path.join(LOCAL, `aprovacao-reconstrucao-${banco}.sql`);
  const plano = cronometrar(() => cli(['plan', '--alvo', url(banco), ...PARAMETROS, '--sql', sql]));
  if (plano.r.paradas.length) throw new Error(`plano com parada: ${plano.r.paradas}`);
  const aprovacao = cronometrar(() => sqlAdmin(readFileSync(sql, 'utf8'), banco));
  const apply = cronometrar(() => cli(['apply', '--alvo', url(banco), ...PARAMETROS, '--identidade', plano.r.identidade]));
  return { identidade: plano.r.identidade, planoMs: plano.ms, aprovacaoMs: aprovacao.ms, applyMs: apply.ms, resultado: apply.r.result, tentativas: apply.r.tentativas };
}
const resumo = (banco) => cli(['resumo', '--alvo', url(banco)]);

const relatorio = { geradoEm: new Date().toISOString(), etapasDoOperador: [], passos: {} };
const bancos = ['rq_reconstrucao_real', 'rq_reconstrucao_real2'];
bancos.forEach(removerBanco);
sqlAdmin(`alter role rq_executor login password '${verificadorScram(senha)}';`);
try {
  // Referência: carga no banco principal.
  const original = carregarNo('postgres');
  const referencia = resumo('postgres');
  relatorio.passos.original = original;

  // Reconstrução completa em banco novo.
  const migracoes = cronometrar(() => criarBancoDescartavel('rq_reconstrucao_real'));
  const nova = carregarNo('rq_reconstrucao_real');
  const reconstruido = resumo('rq_reconstrucao_real');
  relatorio.passos.reconstrucao = { migracoesAplicadas: migracoes.r.length, migracoesMs: migracoes.ms, ...nova, totalMs: migracoes.ms + nova.planoMs + nova.aprovacaoMs + nova.applyMs, identicoAoOriginal: JSON.stringify(referencia) === JSON.stringify(reconstruido), tabelas: Object.fromEntries(Object.entries(reconstruido.tabelas).map(([k, v]) => [k, v.linhas])) };

  // Perda do banco no meio do apply (processo filho real) e reconstrução do zero.
  criarBancoDescartavel('rq_reconstrucao_real2');
  const sql2 = path.join(LOCAL, 'aprovacao-reconstrucao-real2.sql');
  const plano2 = cli(['plan', '--alvo', url('rq_reconstrucao_real2'), ...PARAMETROS, '--sql', sql2]);
  sqlAdmin(readFileSync(sql2, 'utf8'), 'rq_reconstrucao_real2');
  const filho = spawn(process.execPath, [CARGA, 'apply', '--alvo', url('rq_reconstrucao_real2'), ...PARAMETROS, '--identidade', plano2.identidade], { env: ambiente, stdio: ['ignore', 'pipe', 'pipe'] });
  let saida = '';
  filho.stdout.on('data', (d) => { saida += d; });
  const terminou = new Promise((resolve) => filho.on('close', (codigo) => resolve(codigo)));
  const inicioQueda = performance.now();
  for (let i = 0; i < 2000; i++) {
    const ativo = sqlAdmin(`select count(*) from pg_stat_activity where datname = 'rq_reconstrucao_real2' and usename = 'rq_executor' and query like 'insert into public.disponibilidade%';`);
    if (ativo !== '0') break;
    await esperar(5);
  }
  removerBanco('rq_reconstrucao_real2');
  const codigoSaida = await terminou;
  const quedaMs = Math.round(performance.now() - inicioQueda);
  const resultadoQueda = JSON.parse(saida || '{}');
  const retomada = cronometrar(() => {
    criarBancoDescartavel('rq_reconstrucao_real2');
    return carregarNo('rq_reconstrucao_real2');
  });
  relatorio.passos.perdaDoBancoNoMeio = {
    codigoSaidaDoApply: codigoSaida, resultadoDoApply: resultadoQueda.result, motivo: resultadoQueda.motivo, ateAQuedaMs: quedaMs,
    retomadaDoZeroMs: retomada.ms, retomada: retomada.r, identicoAoOriginal: JSON.stringify(resumo('rq_reconstrucao_real2')) === JSON.stringify(referencia),
  };
  relatorio.etapasDoOperador = [
    'Abrir a janela de login do EX e definir a senha fora do repositório (alter role rq_executor login password …)',
    'Revisar o plano e executar o SQL administrativo de aprovação do manifesto, como proprietário do banco',
    'Conferir as fontes fixadas em local/dados-prototipo/brutos (SHA-256 de fontes.json) e as saídas do item 1 (hashes do relatório)',
    'Executar apply com a identidade do plano revisado e fechar a janela de login do EX',
    'Auth, contas, segredos e cadastro do RP NÃO são restaurados por esta recarga: ficam com o responsável (item 5)',
  ];
} finally {
  bancos.forEach(removerBanco);
  sqlAdmin(`alter role rq_executor nologin password null;
begin;
delete from public.publicacao_vigente;
update public.cargas set estado = 'retirada' where estado = 'publicada';
delete from public.disponibilidade; delete from public.deteccoes; delete from public.municipios; delete from public.malhas; delete from public.fontes;
delete from public.cargas; delete from privado.manifestos_aprovados;
commit;`);
}
await mkdir(LOCAL, { recursive: true });
await writeFile(path.join(LOCAL, 'reconstrucao.json'), `${JSON.stringify(relatorio, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);
