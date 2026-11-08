// Ciclo 003, issue #22 — executor de carga com o papel EX real (login SQL por SCRAM) no banco local,
// com cargas fictícias (códigos 99000xx): idempotência, falhas antes/durante/depois do commit,
// concorrência, leitura do RP durante a carga, expiração e alvo/orçamento. Requer `npx supabase start`;
// roda em `npm run test:rls`. O banco precisa estar vazio (o reset do npm script garante).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { setTimeout as esperar } from 'node:timers/promises';
import { alvoExecutorLocal, sqlAdmin, tentarSqlAdmin, verificadorScram } from './local.mjs';
import {
  TETO_BANCO_BYTES, aplicar, avaliarOrcamento, classificar, criarFabrica, expirar, novasMetricas, planejar, resolverAlvo, resumoDaVigente,
} from './carga.mjs';
import { FORMATO_MANIFESTO, camposDaCarga, identidadeDe, sqlAprovacao } from './manifesto.mjs';

const RP = '00000000-0000-4000-8000-0000000000d1';
let senha;
let metricas;
let novoCliente;

// Carga fictícia coerente com o schema: N municípios × 2 dias GMT, detecções principais, D1 completa.
function cargaFicticia(rotulo, { revisao = 1, deteccoes = 3, municipios = 2, shaFonte = 'a' } = {}) {
  const dias = ['2026-10-01', '2026-10-02'];
  const codigos = Array.from({ length: municipios }, (_, i) => 9900001 + i);
  const manifesto = {
    formato: FORMATO_MANIFESTO, satelite: 'AQUA_M-T', janela: { inicio: '2026-10-01T00:00:00Z', fim: '2026-10-03T00:00:00Z' }, envelope: null,
    fuso_sensibilidade: 'America/Cuiaba', metodo: { formato: 'teste', rotulo, revisao },
    fontes: [{ chave: 'focos', papel: 'principal', url: 'https://exemplo.test/focos', sha256: shaFonte.repeat(64), bytes: 1 }],
    saidas: [], totais: { principal: deteccoes, envelope: 0, municipios, disponibilidade: municipios * dias.length },
  };
  const dados = {
    fontes: ['focos', 'malha_max', 'malha_min'].map((chave) => ({ chave, papel: 'ficticia', url: `https://exemplo.test/${chave}`, sha256: 'b'.repeat(64), bytes: 1, obtida_em: '2026-11-02T00:00:00Z', condicoes_uso: 'fictícia' })),
    malhas: [
      { uso: 'classificacao', fonte_chave: 'malha_max', qualidade: 'maxima', parametros: {} },
      { uso: 'exibicao', fonte_chave: 'malha_min', qualidade: 'minima', parametros: {} },
    ],
    municipios: codigos.map((codigo) => ({ codigo, nome: `Município Fictício ${codigo}`, geometria_exibicao: { type: 'Polygon', coordinates: [] } })),
    deteccoes: Array.from({ length: deteccoes }, (_, n) => ({
      id_tecnico: `${rotulo}:${n + 1}`, fonte_chave: 'focos', linha: n + 1, id_fonte: null, escopo: 'principal',
      data_hora_gmt: `2026-10-01T1${n % 10}:00:00Z`, latitude: -10 - n * 0.01, longitude: -55, municipio_codigo: codigos[n % municipios],
      posicao: 'interior', municipio_inpe: null, estado_inpe: 51,
    })),
    disponibilidade: dias.flatMap((dia) => codigos.map((m) => ({
      dia, satelite: 'AQUA_M-T', municipio_codigo: m, classe: 'sem_evidencia_de_lacuna', motivos: ['historico_nao_verificado'], alcance_historico: 'verificado', avisos: [],
    }))),
  };
  return { manifesto, identidade: identidadeDe(manifesto), dados };
}

const aprovar = (c) => sqlAdmin(sqlAprovacao(c.manifesto, c.identidade));
const aplicarCarga = (c, gancho) => aplicar({ novoCliente, manifesto: c.manifesto, identidade: c.identidade, dados: c.dados, gancho });
const cargasDe = (c) => sqlAdmin(`select count(*) from public.cargas where identidade = '${c.identidade}';`);
const estadoDe = (c) => sqlAdmin(`select coalesce(max(estado), 'ausente') from public.cargas where identidade = '${c.identidade}';`);
const vigente = () => sqlAdmin('select coalesce((select c.identidade from public.publicacao_vigente v join public.cargas c on c.id = v.carga_id), \'nenhuma\');');
const linhas = (c) => sqlAdmin(`select (select count(*) from public.deteccoes d join public.cargas x on x.id = d.carga_id where x.identidade = '${c.identidade}') || '/'
  || (select count(*) from public.disponibilidade d join public.cargas x on x.id = d.carga_id where x.identidade = '${c.identidade}');`);
const publicadas = () => sqlAdmin("select count(*) from public.cargas where estado = 'publicada';");

// O que o RP enxerga: ids das cargas legíveis e a identidade da versão que a consulta usa.
const comoRp = (sql) => sqlAdmin(`begin; set local role authenticated; set local request.jwt.claims = '{"sub": "${RP}", "role": "authenticated"}'; ${sql} rollback;`);
const rpEnxerga = () => comoRp("select coalesce(string_agg(identidade, ',' order by id), '') from public.cargas;");
const rpResumo = () => comoRp("select public.consultar_resumo('2026-10-01', '2026-10-02') -> 'carga' ->> 'identidade';");

async function esperarBloqueios(n) {
  for (let i = 0; i < 400; i++) {
    if (Number(sqlAdmin("select count(*) from pg_stat_activity where usename = 'rq_executor' and wait_event_type = 'Lock';")) >= n) return;
    await esperar(25);
  }
  throw new Error(`esperados ${n} bloqueio(s) de trava do EX`);
}
// Sinal para sincronizar duas operações: a primeira avisa que chegou ao ponto e a segunda só começa depois.
const sinal = () => {
  let avisar;
  const chegou = new Promise((r) => { avisar = r; });
  return [chegou, avisar];
};
const matar = (pid) => sqlAdmin(`select pg_terminate_backend(${pid});`);

function limpar() {
  tentarSqlAdmin(`begin;
delete from public.publicacao_vigente;
update public.cargas set estado = 'retirada' where estado = 'publicada';
delete from public.disponibilidade; delete from public.deteccoes; delete from public.municipios; delete from public.malhas; delete from public.fontes;
delete from public.cargas;
delete from privado.manifestos_aprovados;
commit;`);
}

before(() => {
  assert.equal(sqlAdmin('select count(*) from public.cargas;'), '0', 'banco local deve estar vazio; rode `npx supabase db reset`.');
  senha = randomBytes(24).toString('base64url');
  sqlAdmin(`alter role rq_executor login password '${verificadorScram(senha)}';
insert into auth.users (id, aud, role) values ('${RP}', 'authenticated', 'authenticated');
insert into privado.responsaveis_autorizados values ('${RP}');`);
  metricas = novasMetricas();
  novoCliente = criarFabrica(alvoExecutorLocal(senha), metricas);
});

after(() => {
  limpar();
  sqlAdmin(`delete from privado.responsaveis_autorizados where user_id = '${RP}'; delete from auth.users where id = '${RP}';
alter role rq_executor nologin password null;`);
});

test('alvo: exige URL sem senha, papel EX, TLS fora do loopback e senha no ambiente', () => {
  const env = { RQ_EXECUTOR_PASSWORD: 'segredo-de-teste' };
  assert.throws(() => resolverAlvo(undefined, env), /--alvo/);
  assert.throws(() => resolverAlvo('postgresql://rq_executor:abc@127.0.0.1:5432/postgres', env), /não pode conter senha/);
  assert.throws(() => resolverAlvo('postgresql://postgres@127.0.0.1:5432/postgres', env), /rq_executor/);
  assert.throws(() => resolverAlvo('postgresql://rq_executor@db.exemplo.test:5432/postgres', env), /sslmode=require/);
  assert.throws(() => resolverAlvo('http://rq_executor@127.0.0.1/x', env), /postgresql/);
  assert.throws(() => resolverAlvo('postgresql://rq_executor@127.0.0.1:5432/postgres', {}), /RQ_EXECUTOR_PASSWORD/);
  const local = resolverAlvo('postgresql://rq_executor@127.0.0.1:55322/postgres', env);
  assert.deepEqual([local.host, local.port, local.user, local.database, local.ssl], ['127.0.0.1', 55322, 'rq_executor', 'postgres', false]);
  const remoto = resolverAlvo('postgresql://rq_executor@db.exemplo.test/postgres?sslmode=require', env);
  assert.deepEqual([remoto.host, remoto.port, remoto.ssl], ['db.exemplo.test', 5432, true]);
  try {
    resolverAlvo('postgresql://rq_executor:segredo-de-teste@127.0.0.1/x', env);
  } catch (e) {
    assert.doesNotMatch(e.message, /segredo-de-teste/, 'o erro não repete a senha');
  }
});

test('orçamento: igualdade ao teto passa, acima para, estimativa insuficiente para', () => {
  const folga = avaliarOrcamento({ consumoExistente: 100_000_000, bytesPayload: 15_000_000, fator: 2 });
  assert.equal(folga.picoPrevisto, 130_000_000);
  assert.equal(folga.parar, false);
  assert.equal(folga.margem, TETO_BANCO_BYTES - 130_000_000);
  assert.equal(avaliarOrcamento({ consumoExistente: TETO_BANCO_BYTES - 200, bytesPayload: 100, fator: 2 }).parar, false, 'igual ao teto: não para');
  assert.equal(avaliarOrcamento({ consumoExistente: TETO_BANCO_BYTES - 199, bytesPayload: 100, fator: 2 }).parar, true, 'um byte acima: para');
  assert.equal(avaliarOrcamento({ consumoExistente: NaN, bytesPayload: 100 }).motivo, 'estimativa_insuficiente_para_provar_margem');
  assert.equal(avaliarOrcamento({ consumoExistente: 1, bytesPayload: 0 }).parar, true);
});

test('plan: orçamento com o consumo existente, pendência de aprovação e nenhuma escrita', async () => {
  const a = cargaFicticia('plano');
  const antes = sqlAdmin('select count(*) from public.cargas;');
  const plano = await planejar({ novoCliente, manifesto: a.manifesto, identidade: a.identidade, dados: a.dados });
  assert.deepEqual(plano.paradas, []);
  assert.deepEqual(plano.pendencias, ['manifesto_nao_aprovado']);
  assert.ok(plano.orcamento.consumoExistente > 0 && plano.orcamento.picoPrevisto > plano.orcamento.consumoExistente);
  assert.equal(plano.alvo.carga.situacao, 'ausente');
  assert.equal(plano.alvo.vigente, null);
  assert.equal(sqlAdmin('select count(*) from public.cargas;'), antes, 'plan não grava');
  aprovar(a);
  assert.deepEqual((await planejar({ novoCliente, manifesto: a.manifesto, identidade: a.identidade, dados: a.dados })).pendencias, []);
  const sem = await planejar({ novoCliente: null, manifesto: a.manifesto, identidade: a.identidade, dados: a.dados });
  assert.deepEqual(sem.paradas, ['sem_consulta_ao_alvo'], 'sem consulta ao alvo não há prova de margem');
  sqlAdmin(`delete from privado.manifestos_aprovados where identidade = '${a.identidade}';`);
});

test('apply: sem manifesto aprovado ou com manifesto divergente não deixa resíduo', async () => {
  const sem = cargaFicticia('sem-aprovacao');
  const r1 = await aplicarCarga(sem);
  assert.equal(r1.result, 'not_executed');
  assert.equal(r1.motivo, 'manifesto_nao_aprovado');
  assert.equal(cargasDe(sem), '0');

  // O administrador aprovou outro total sob a mesma identidade: a publicação recusa e tudo é desfeito.
  const div = cargaFicticia('divergente');
  const campos = { ...camposDaCarga(div.manifesto, div.identidade), total_principal: div.manifesto.totais.principal + 1 };
  sqlAdmin(`insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo,
    total_principal, total_envelope, total_municipios, total_disponibilidade)
    values ('${campos.identidade}', 'AQUA_M-T', '${campos.janela_inicio}', '${campos.janela_fim}', 'America/Cuiaba', '${JSON.stringify(campos.metodo)}'::jsonb,
    ${campos.total_principal}, 0, ${campos.total_municipios}, ${campos.total_disponibilidade});`);
  const r2 = await aplicarCarga(div);
  assert.equal(r2.result, 'not_executed');
  assert.match(r2.erro, /manifesto_divergente/);
  assert.equal(cargasDe(div), '0', 'transação desfeita: nem a carga, nem as linhas');
  assert.equal(sqlAdmin('select count(*) from public.deteccoes;'), '0');
  assert.equal(vigente(), 'nenhuma');
});

test('apply: executa, e a reexecução reconcilia sem duplicar linhas nem publicação', async () => {
  const a = cargaFicticia('A');
  aprovar(a);
  const r1 = await aplicarCarga(a);
  assert.equal(r1.result, 'executed', JSON.stringify(r1));
  assert.deepEqual(r1.contagens, { principal: 3, envelope: 0, municipios: 2, disponibilidade: 4 });
  assert.equal(estadoDe(a), 'publicada');
  assert.equal(vigente(), a.identidade);
  const resumo1 = await resumo();

  const r2 = await aplicarCarga(a);
  assert.equal(r2.result, 'already_executed_and_reconciled');
  assert.equal(r2.motivo, 'carga_ja_publicada');
  assert.equal(cargasDe(a), '1');
  assert.equal(linhas(a), '3/4');
  assert.equal(publicadas(), '1');
  assert.deepEqual(await resumo(), resumo1, 'conteúdo idêntico depois da reexecução');
  assert.equal(r1.cargaId, r2.cargaId);
});

async function resumo() {
  const c = await novoCliente();
  try {
    return await resumoDaVigente(c);
  } finally {
    await c.end();
  }
}

test('falha antes e durante: a última versão íntegra continua vigente e o RP não vê a preparação', async () => {
  const a = cargaFicticia('A');
  const b = cargaFicticia('B', { deteccoes: 5 });
  aprovar(b);
  assert.equal(rpEnxerga(), a.identidade);

  // Antes de gravar a primeira linha de dados e no meio (depois das detecções): exceção do cliente.
  for (const ponto of ['apos_carga', 'apos_deteccoes']) {
    const r = await aplicarCarga(b, async (p) => {
      if (p === ponto) throw new Error(`falha simulada em ${ponto}`);
    });
    assert.equal(r.result, 'not_executed', ponto);
    assert.equal(r.motivo, 'falha_antes_do_commit');
    assert.equal(cargasDe(b), '0', `${ponto}: nada gravado`);
    assert.equal(vigente(), a.identidade);
    assert.equal(estadoDe(a), 'publicada');
  }

  // Durante: a conexão cai de verdade (backend encerrado pelo administrador) no meio das inserções.
  const kill = await aplicarCarga(b, async (p, { pid }) => {
    if (p === 'apos_disponibilidade') matar(pid);
  });
  assert.equal(kill.result, 'not_executed', JSON.stringify(kill));
  assert.equal(kill.motivo, 'falha_antes_do_commit');
  assert.equal(cargasDe(b), '0');
  assert.equal(vigente(), a.identidade);
  assert.equal(rpResumo(), a.identidade, 'consulta do RP segue na versão anterior');
  assert.equal(rpEnxerga(), a.identidade);

  // Com a transação aberta e tudo gravado, o RP ainda não observa a carga nova; depois do commit, observa.
  let visto;
  const ok = await aplicarCarga(b, async (p) => {
    if (p === 'antes_commit') visto = { cargas: rpEnxerga(), resumo: rpResumo(), preparacaoParaOEx: linhas(b) };
  });
  assert.equal(ok.result, 'executed', JSON.stringify(ok));
  assert.deepEqual(visto, { cargas: a.identidade, resumo: a.identidade, preparacaoParaOEx: '0/0' }, 'preparação invisível para RP e para outras sessões');
  assert.equal(vigente(), b.identidade);
  assert.equal(estadoDe(a), 'retirada');
  assert.equal(rpResumo(), b.identidade);
  assert.equal(rpEnxerga(), b.identidade, 'a retirada deixa de ser legível');
  assert.equal(publicadas(), '1');
  assert.equal(linhas(b), '5/4');
});

test('falha depois do commit: reconciliada pela identidade, sem republicar', async () => {
  const b = cargaFicticia('B', { deteccoes: 5 });
  const c = cargaFicticia('C', { deteccoes: 4 });
  aprovar(c);

  // Resposta do COMMIT perdida: a carga existe e a conferência pela identidade a reconhece.
  const r = await aplicarCarga(c, async (p) => {
    if (p === 'depois_commit') throw new Error('conexão perdida depois do commit');
  });
  assert.equal(r.result, 'already_executed_and_reconciled', JSON.stringify(r));
  assert.equal(r.motivo, 'commit_confirmado_pela_identidade');
  assert.equal(cargasDe(c), '1');
  assert.equal(vigente(), c.identidade);
  assert.equal(estadoDe(b), 'retirada');
  const reexec = await aplicarCarga(c);
  assert.equal(reexec.result, 'already_executed_and_reconciled');
  assert.equal(cargasDe(c), '1');
  assert.equal(publicadas(), '1');

  // Conexão cai entre o último passo e o COMMIT: o commit não ocorreu; a conferência prova a ausência.
  const d = cargaFicticia('D', { deteccoes: 2 });
  aprovar(d);
  const perdida = await aplicarCarga(d, async (p, { pid }) => {
    if (p === 'antes_commit') matar(pid);
  });
  assert.equal(perdida.result, 'not_executed', JSON.stringify(perdida));
  assert.equal(perdida.motivo, 'commit_nao_ocorreu_reexecutavel');
  assert.equal(cargasDe(d), '0');
  assert.equal(vigente(), c.identidade, 'a versão anterior permanece íntegra');
  const de_novo = await aplicarCarga(d);
  assert.equal(de_novo.result, 'executed');
  assert.equal(vigente(), d.identidade);
  assert.equal(publicadas(), '1');
});

test('concorrência: mesma identidade em duas conexões publica uma única vez', async () => {
  const e = cargaFicticia('E', { deteccoes: 6 });
  aprovar(e);
  const [chegou, avisar] = sinal();
  const primeira = aplicarCarga(e, async (p) => {
    if (p === 'apos_deteccoes') {
      avisar();
      await esperarBloqueios(1); // a segunda ficou aguardando a identidade única
    }
  });
  await chegou;
  const segunda = aplicarCarga(e);
  const [r1, r2] = await Promise.all([primeira, segunda]);
  assert.deepEqual([r1.result, r2.result].sort(), ['already_executed_and_reconciled', 'executed']);
  assert.equal(cargasDe(e), '1');
  assert.equal(linhas(e), '6/4');
  assert.equal(publicadas(), '1');
  assert.equal(vigente(), e.identidade);
});

test('concorrência: identidades distintas se serializam pela vigente; vence quem confirma por último', async () => {
  const f = cargaFicticia('F', { deteccoes: 2 });
  const g = cargaFicticia('G', { deteccoes: 3 });
  aprovar(f);
  aprovar(g);
  const [chegou, avisar] = sinal();
  const primeira = aplicarCarga(f, async (p) => {
    if (p === 'antes_commit') {
      avisar();
      await esperarBloqueios(1); // G já gravou tudo e aguarda a trava da vigente
    }
  });
  await chegou;
  const segunda = aplicarCarga(g);
  const [r1, r2] = await Promise.all([primeira, segunda]);
  assert.equal(r1.result, 'executed', JSON.stringify(r1));
  assert.equal(r2.result, 'executed', JSON.stringify(r2));
  assert.equal(publicadas(), '1');
  assert.equal(vigente(), g.identidade);
  assert.equal(estadoDe(f), 'retirada');
  assert.equal(linhas(f), '2/4');
  assert.equal(linhas(g), '3/4');
});

test('concorrência: primeira publicação ainda sem vigente — a perdedora refaz e retira a outra', async () => {
  limpar();
  const h = cargaFicticia('H', { deteccoes: 2 });
  const i = cargaFicticia('I', { deteccoes: 3 });
  aprovar(h);
  aprovar(i);
  const [chegou, avisar] = sinal();
  const primeira = aplicarCarga(h, async (p) => {
    if (p === 'antes_commit') {
      avisar();
      await esperarBloqueios(1); // I tentou criar a vigente (chave única) e aguarda
    }
  });
  await chegou;
  const segunda = aplicarCarga(i);
  const [r1, r2] = await Promise.all([primeira, segunda]);
  assert.equal(r1.result, 'executed', JSON.stringify(r1));
  assert.equal(r2.result, 'executed', JSON.stringify(r2));
  assert.ok(r2.tentativas >= 2, 'a segunda refez a carga depois do conflito na vigente');
  assert.equal(publicadas(), '1');
  assert.equal(vigente(), i.identidade);
  assert.equal(estadoDe(h), 'retirada');
});

test('retirada não volta e preparação residual não é limpa às cegas', async () => {
  const antiga = cargaFicticia('H', { deteccoes: 2 });
  const r = await aplicarCarga(antiga);
  assert.equal(r.result, 'not_executed');
  assert.equal(r.motivo, 'carga_retirada', 'versão retirada nunca é republicada; nova versão usa nova revisão');

  // Preparação confirmada por outro meio (fora do protocolo): o EX para, sem apagar nada.
  const residual = cargaFicticia('residual');
  aprovar(residual);
  const cmd = await novoCliente();
  try {
    const c = camposDaCarga(residual.manifesto, residual.identidade);
    await cmd.query(`insert into public.cargas (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo, total_principal,
      total_envelope, total_municipios, total_disponibilidade) values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)`,
    [c.identidade, c.satelite, c.janela_inicio, c.janela_fim, c.fuso_sensibilidade, JSON.stringify(c.metodo), c.total_principal, c.total_envelope, c.total_municipios, c.total_disponibilidade]);
    assert.equal((await classificar(cmd, residual.identidade)).situacao, 'ambigua');
  } finally {
    await cmd.end();
  }
  const parada = await aplicarCarga(residual);
  assert.equal(parada.result, 'ambiguous_human_intervention_required');
  assert.equal(parada.motivo, 'carga_preparacao_sem_conclusao');
  assert.equal(estadoDe(residual), 'preparacao');
  sqlAdmin(`update public.cargas set estado = 'retirada' where identidade = '${residual.identidade}';`);
});

test('versão nova: correção de fonte e mudança de janela geram identidade e carga novas', async () => {
  const base = cargaFicticia('V');
  const corrigida = cargaFicticia('V', { shaFonte: 'c' });
  const reversao = cargaFicticia('V', { revisao: 2 });
  assert.equal(new Set([base.identidade, corrigida.identidade, reversao.identidade]).size, 3);
  aprovar(base);
  aprovar(corrigida);
  aprovar(reversao);
  assert.equal((await aplicarCarga(base)).result, 'executed');
  assert.equal((await aplicarCarga(corrigida)).result, 'executed');
  assert.equal(vigente(), corrigida.identidade);
  assert.equal(estadoDe(base), 'retirada');
  // Reversão: mesmo conteúdo da primeira, com nova revisão aprovada.
  assert.equal((await aplicarCarga(reversao)).result, 'executed');
  assert.equal(vigente(), reversao.identidade);
  assert.equal(publicadas(), '1');
});

test('expirar: simula, remove só linhas de cargas retiradas e preserva a vigente e o registro', async () => {
  const vigenteAntes = await resumo();
  const retiradas = Number(sqlAdmin("select count(*) from public.cargas where estado = 'retirada';"));
  assert.ok(retiradas >= 3);
  const simulado = await expirar({ novoCliente, simular: true });
  assert.equal(simulado.simulado, true);
  assert.equal(simulado.cargas.length, retiradas);
  assert.ok(simulado.cargas.some((c) => c.linhas.deteccoes > 0), 'a simulação conta, não apaga');
  assert.equal(sqlAdmin("select count(*) > 0 from public.deteccoes d join public.cargas c on c.id = d.carga_id where c.estado = 'retirada';"), 't');

  const real = await expirar({ novoCliente });
  assert.equal(real.cargas.length, retiradas);
  assert.equal(sqlAdmin("select count(*) from public.deteccoes d join public.cargas c on c.id = d.carga_id where c.estado = 'retirada';"), '0');
  assert.equal(sqlAdmin("select count(*) from public.cargas where estado = 'retirada';"), String(retiradas), 'registro da carga permanece');
  assert.deepEqual(await resumo(), vigenteAntes, 'a vigente não muda');
  assert.deepEqual((await expirar({ novoCliente })).cargas.map((c) => Object.values(c.linhas).reduce((s, n) => s + n, 0)), real.cargas.map(() => 0), 'idempotente');
  assert.ok(Number(sqlAdmin('select count(*) from privado.manifestos_aprovados;')) > 0, 'manifestos aprovados permanecem');
});

test('o EX não consegue aprovar o próprio manifesto nem publicar carga fora do manifesto', async () => {
  const x = cargaFicticia('X');
  const c = await novoCliente();
  try {
    const negado = await c.query(`insert into privado.manifestos_aprovados (identidade, satelite, janela_inicio, janela_fim, fuso_sensibilidade, metodo,
      total_principal, total_envelope, total_municipios, total_disponibilidade) values ('${x.identidade}', 'AQUA_M-T', now(), now(), 'x', '{}', 0, 0, 1, 0)`).catch((e) => e);
    assert.match(String(negado.message), /permission denied/);
  } finally {
    await c.end();
  }
  assert.equal((await aplicarCarga(x)).motivo, 'manifesto_nao_aprovado');
  // Métricas do cliente acumulam por operação (base da medição de tráfego).
  assert.ok(metricas.conexoes > 10 && metricas.consultas > 100 && metricas.bytesEnviados > 0 && metricas.bytesRecebidos > 0);
});
