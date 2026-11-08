// Ciclo 003, issue #22 — reconstrução em banco local novo (só migrações + manifesto aprovado + apply),
// com carga fictícia: o conteúdo reconstruído é idêntico (manifesto, contagens e SHA-256 por tabela);
// perda da conexão e perda do banco no meio da carga, e retomada pelo mesmo caminho.
// Requer `npx supabase start`; roda em `npm run test:rls`.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { alvoExecutorLocal, sqlAdmin, verificadorScram } from './local.mjs';
import { criarBancoDescartavel, removerBanco } from './bancos-descartaveis.mjs';
import { aplicar, criarFabrica, resumoDaVigente } from './carga.mjs';
import { FORMATO_MANIFESTO, identidadeDe, sqlAprovacao } from './manifesto.mjs';

const BANCOS = ['rq_reconstrucao_a', 'rq_reconstrucao_b', 'rq_reconstrucao_c'];
let senha;

// Carga fictícia média: 25 municípios × 4 dias e 400 detecções, com vírgulas e acentos nos textos.
function carga() {
  const municipios = 25;
  const dias = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
  const codigos = Array.from({ length: municipios }, (_, i) => 9900001 + i);
  const manifesto = {
    formato: FORMATO_MANIFESTO, satelite: 'AQUA_M-T', janela: { inicio: '2026-10-01T00:00:00Z', fim: '2026-10-05T00:00:00Z' }, envelope: { inicio: '2026-10-05T00:00:00Z', fim: '2026-10-05T04:00:00Z' },
    fuso_sensibilidade: 'America/Cuiaba', metodo: { formato: 'teste', rotulo: 'reconstrucao', revisao: 1 },
    fontes: [{ chave: 'focos', papel: 'principal', url: 'https://exemplo.test/focos', sha256: 'a'.repeat(64), bytes: 1 }],
    saidas: [], totais: { principal: 400, envelope: 2, municipios, disponibilidade: municipios * dias.length },
  };
  const dados = {
    fontes: ['focos', 'malha_max', 'malha_min'].map((chave) => ({ chave, papel: 'ficticia', url: `https://exemplo.test/${chave}`, sha256: 'b'.repeat(64), bytes: 1, obtida_em: '2026-11-02T00:00:00Z', condicoes_uso: 'fictícia, "uso" livre; acentuação: ção' })),
    malhas: [
      { uso: 'classificacao', fonte_chave: 'malha_max', qualidade: 'maxima', parametros: { calculo: 'integral' } },
      { uso: 'exibicao', fonte_chave: 'malha_min', qualidade: 'minima', parametros: { uso: 'visual' } },
    ],
    municipios: codigos.map((codigo) => ({ codigo, nome: `Município Fictício ${codigo}, "Ç"`, geometria_exibicao: { type: 'Polygon', coordinates: [[[-55, -10], [-55, -11], [-54, -11], [-55, -10]]] } })),
    deteccoes: Array.from({ length: 402 }, (_, n) => ({
      id_tecnico: `rec:${n + 1}`, fonte_chave: 'focos', linha: n + 1, id_fonte: n % 7 === 0 ? null : `id-${n % 50}`, escopo: n < 400 ? 'principal' : 'envelope',
      data_hora_gmt: n < 400 ? `2026-10-0${1 + (n % 4)}T1${n % 8}:${String(n % 60).padStart(2, '0')}:00Z` : '2026-10-05T01:00:00Z',
      latitude: -10 - (n % 100) * 0.0123456, longitude: -55 + (n % 90) * 0.0098765, municipio_codigo: codigos[n % municipios],
      posicao: n % 13 === 0 ? 'borda' : 'interior', municipio_inpe: n % 5 === 0 ? null : codigos[n % municipios], estado_inpe: 51,
    })),
    disponibilidade: dias.flatMap((dia) => codigos.map((m, i) => ({
      dia, satelite: 'AQUA_M-T', municipio_codigo: m, classe: i % 9 === 0 ? 'incidencia_indeterminada' : 'sem_evidencia_de_lacuna',
      motivos: i % 9 === 0 ? ['interrupcao_aqua_nasa', 'historico_nao_verificado'] : ['historico_nao_verificado', 'sem_aviso_incidente'], alcance_historico: 'parcial', avisos: i % 9 === 0 ? ['av1:indeterminada'] : [],
    }))),
  };
  return { manifesto, identidade: identidadeDe(manifesto), dados };
}

const fabricaDe = (banco) => criarFabrica({ ...alvoExecutorLocal(senha), database: banco });
const montar = (banco, c) => {
  criarBancoDescartavel(banco);
  sqlAdmin(sqlAprovacao(c.manifesto, c.identidade), banco);
};
const carregar = (banco, c, gancho) => aplicar({ novoCliente: fabricaDe(banco), manifesto: c.manifesto, identidade: c.identidade, dados: c.dados, gancho });
async function resumoDe(banco) {
  const cliente = await fabricaDe(banco)();
  try {
    return await resumoDaVigente(cliente);
  } finally {
    await cliente.end();
  }
}

before(() => {
  for (const b of BANCOS) removerBanco(b);
  senha = randomBytes(24).toString('base64url');
  sqlAdmin(`alter role rq_executor login password '${verificadorScram(senha)}';`);
});

after(() => {
  for (const b of BANCOS) removerBanco(b);
  sqlAdmin('alter role rq_executor nologin password null;');
});

test('reconstrução: dois bancos novos, só migrações + manifesto + apply, têm o mesmo conteúdo', async () => {
  const c = carga();
  montar('rq_reconstrucao_a', c);
  assert.equal((await carregar('rq_reconstrucao_a', c)).result, 'executed');
  const a = await resumoDe('rq_reconstrucao_a');
  assert.equal(a.identidade, c.identidade);
  assert.deepEqual(a.totais, { principal: 400, envelope: 2, municipios: 25, disponibilidade: 100 });
  assert.deepEqual(Object.fromEntries(Object.entries(a.tabelas).map(([k, v]) => [k, v.linhas])), { fontes: 3, malhas: 2, municipios: 25, deteccoes: 402, disponibilidade: 100 });

  montar('rq_reconstrucao_b', c);
  assert.equal((await carregar('rq_reconstrucao_b', c)).result, 'executed');
  assert.deepEqual(await resumoDe('rq_reconstrucao_b'), a, 'manifesto, registros e totais reproduzidos, com os mesmos SHA-256 por tabela');
});

test('perda da conexão e perda do banco no meio da carga: sem publicação parcial; reconstrução e retomada reproduzem o conteúdo', async () => {
  const c = carga();
  const referencia = await resumoDe('rq_reconstrucao_a');
  montar('rq_reconstrucao_c', c);

  // 1. Perda da conexão (backend encerrado): a conferência pela identidade prova que nada foi publicado.
  const queda = await carregar('rq_reconstrucao_c', c, async (p, { pid }) => {
    if (p === 'apos_deteccoes') sqlAdmin(`select pg_terminate_backend(${pid});`);
  });
  assert.equal(queda.result, 'not_executed');
  assert.equal(queda.motivo, 'falha_antes_do_commit');
  assert.equal(sqlAdmin('select count(*) from public.cargas;', 'rq_reconstrucao_c'), '0');

  // 2. Perda do banco antes do COMMIT: o resultado é ambíguo e sem conexão para conferir; nada é presumido.
  const sem = await carregar('rq_reconstrucao_c', c, async (p) => {
    if (p === 'antes_commit') removerBanco('rq_reconstrucao_c');
  });
  assert.equal(sem.result, 'ambiguous_human_intervention_required');
  assert.equal(sem.motivo, 'commit_sem_confirmacao_e_sem_conexao');

  // 3. Perda do banco no meio das inserções: falha antes do commit, sem conexão para conferir.
  montar('rq_reconstrucao_c', c);
  const meio = await carregar('rq_reconstrucao_c', c, async (p) => {
    if (p === 'apos_municipios') removerBanco('rq_reconstrucao_c');
  });
  assert.equal(meio.result, 'not_executed');
  assert.equal(meio.motivo, 'falha_antes_do_commit_sem_conexao');

  // 4. Reconstrução do zero e retomada: o conteúdo é o mesmo do banco de referência.
  montar('rq_reconstrucao_c', c);
  assert.equal((await carregar('rq_reconstrucao_c', c)).result, 'executed');
  assert.deepEqual(await resumoDe('rq_reconstrucao_c'), referencia);
});
