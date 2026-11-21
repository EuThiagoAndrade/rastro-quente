// Ciclo 011, issue #107 — dois casos fictícios com Gemini real sob o handler, Auth e RLS locais.
// Só executar após autorização e confirmação humana do nível gratuito/cota registradas na task.
// Limites: 12 chamadas respondidas, até 24 tentativas; sem repetição de casos nem troca de modelo.
// Credencial apenas no .env ignorado. O relatório registra medições e resultados, nunca segredos.
import { sqlAdmin, statusLocal } from '../banco/local.mjs';
import { CONTAS, cadastrarRp, criarConta, removerConta, tokenDe } from '../../tests/e2e/contas.mjs';
import { IDENTIDADE, SQL_LIMPEZA, sqlFixture } from '../../tests/e2e/fixture.mjs';
import { tratarExplicar } from '../../servidor/explicar.ts';
import { criarCliente } from '../../api/explicar.ts';
import { criarGemini, ENDPOINT_GEMINI } from '../../servidor/gemini.ts';
import { MODELO_FIXADO } from '../../servidor/config.ts';
import { CASOS, RECORTES } from './casos.mjs';
import { conferirAfirmacao, indexar, INSTRUCOES, normalizarReferencia } from '../../servidor/agentes.ts';

const diagnostico = process.env.RQ_PROVA_DIAGNOSTICO === '1';

const chave = process.env.RQ_GEMINI_CHAVE ?? '';
if (!chave) {
  process.stderr.write('RQ_GEMINI_CHAVE ausente: conclua a ação externa da issue #107 e grave a chave só no .env local (ignorado).\n');
  process.exit(2);
}
// A autorização e a confirmação da cota são precondições humanas do plano 011.
if (process.env.RQ_PROVA_011_AUTORIZADA !== 'true' || process.env.RQ_PROVA_011_GRATUITO_CONFIRMADO !== 'true') {
  throw new Error('Prova 011 requer autorização explícita e confirmação do nível gratuito/cota para até 12 chamadas respondidas e 24 tentativas.');
}
if (process.argv.length > 2) throw new Error('Prova 011 tem exatamente dois casos; não admite ampliação por argumentos.');
const somentePanorama = process.env.RQ_PROVA_011_PANORAMA_UNICO === 'true';
const casosMinimos = [CASOS.find((c) => c.id === 'panorama'), { id: 'insuficiente', pergunta_id: 'panorama', recorte: 'insuficiente', esperado: { estado: 'incompleta', delegacoes: ['lentes', 'disponibilidade'] } }];
const escolhidos = somentePanorama ? casosMinimos.slice(0, 1) : casosMinimos;
let tentativas = 0;
const limiteTentativas = somentePanorama ? 12 : process.env.RQ_PROVA_011_RETESTE === 'true' ? 22 : 24;
const inicioProva = performance.now();
const intervalo = Number(process.env.RQ_PROVA_INTERVALO_MS ?? 60_000);
// Espaçamento entre inícios de chamadas (principal, subagentes em paralelo e síntese) registrado na task da issue
// #107: 13 s, no máximo 5 envios por minuto, abaixo dos 15 RPM do ADR-011. Padrão da prova; menos que isso é recusado.
const ESPACAMENTO_MINIMO_MS = 13_000;
const intervaloChamadas = Number(process.env.RQ_GEMINI_INTERVALO_MS || ESPACAMENTO_MINIMO_MS);
if (!Number.isInteger(intervaloChamadas) || intervaloChamadas < ESPACAMENTO_MINIMO_MS || intervaloChamadas > 20_000) {
  throw new Error(`RQ_GEMINI_INTERVALO_MS deve ficar entre ${ESPACAMENTO_MINIMO_MS} e 20000 ms na prova 011.`);
}
const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** Motivo de cada afirmação das saídas estruturadas, conferida contra as evidências devolvidas (só diagnóstico). */
function rejeicoes(envios, evidencias) {
  if (!evidencias) return [];
  const indice = indexar(Object.entries(evidencias).map(([id, e]) => ({ id, ferramenta: e.ferramenta, dados: e.dados })));
  return envios.filter((e) => e.saida_estruturada).flatMap((e) => (e.saida ?? []).flatMap((txt) => {
    try {
      return (JSON.parse(txt).afirmacoes ?? []).map((a) => {
        const referencias = (a.referencias ?? []).map((r) => normalizarReferencia(r, indice));
        return { papel: e.papel, texto: a.texto, referencias, motivo: conferirAfirmacao({ texto: a.texto, referencias }, indice) };
      });
    } catch {
      return [{ papel: e.papel, motivo: 'saída não é JSON', texto: txt.slice(0, 300) }];
    }
  }));
}

const L = statusLocal();
if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npm run prova:agentes` (faz `supabase db reset`).');

const relatorio = { geradoEm: new Date().toISOString(), endpoint: ENDPOINT_GEMINI, modelo: MODELO_FIXADO, intervalo_chamadas_ms: intervaloChamadas, casos: [] };
try {
  sqlAdmin(sqlFixture());
  const cargaId = Number(sqlAdmin(`select id from public.cargas where identidade = '${IDENTIDADE}';`));
  await criarConta(L, 'rp', {});
  cadastrarRp();
  const token = await tokenDe('rp');
  const config = { habilitada: true, supabaseUrl: L.api, chavePublica: L.anon, gemini: { chave, modelo: MODELO_FIXADO, intervaloMs: intervaloChamadas }, origens: [] };
  for (const [i, caso] of escolhidos.entries()) {
    if (i > 0) await esperar(intervalo);
    // Metadados de cada envio real (sem corpo): store, ferramentas, saída estruturada, bytes e status HTTP.
    const envios = [];
    const buscar = async (url, init) => {
      if (++tentativas > limiteTentativas) throw new Error('Teto de tentativas autorizadas atingido.');
      const corpo = JSON.parse(String(init.body));
      const t = performance.now();
      const meta = () => ({ inicio_ms: Math.round(t - inicioProva), papel: Object.entries(INSTRUCOES).find(([, v]) => v === corpo.system_instruction)?.[0] ?? null });
      let r;
      try {
        r = await fetch(url, init);
      } catch (e) {
        // Chamada interrompida (tempo ou cancelamento): registrada com o tamanho do envio, sem o corpo.
        envios.push({ url, status: `interrompida (${e?.name ?? 'erro'})`, ms: Math.round(performance.now() - t), bytes: Buffer.byteLength(String(init.body)), ...meta(), saida_estruturada: Boolean(corpo.response_format), store: corpo.store });
        throw e;
      }
      let saida;
      if (diagnostico) {
        const bruto = await r.clone().json().catch(() => null);
        saida = (bruto?.steps ?? []).flatMap((p) => (p.type === 'model_output' ? (p.content ?? []).map((c) => c.text ?? '') : p.type === 'function_call' ? [`function_call ${p.name} ${JSON.stringify(p.arguments)}`] : []));
      }
      envios.push({
        ...(diagnostico ? { saida } : {}),
        ms: Math.round(performance.now() - t), ...meta(),
        url, status: r.status, bytes: Buffer.byteLength(String(init.body)), store: corpo.store,
        ferramentas: (corpo.tools ?? []).map((t) => t.name), saida_estruturada: Boolean(corpo.response_format),
        tool_choice: corpo.generation_config?.tool_choice ?? null, chave_no_corpo: String(init.body).includes(chave), jwt_no_corpo: String(init.body).includes(token),
      });
      return r;
    };
    const t0 = performance.now();
    const resposta = await tratarExplicar(new Request('http://127.0.0.1/api/explicar', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ pergunta_id: caso.pergunta_id, carga: { id: cargaId, identidade: IDENTIDADE }, recorte: RECORTES[caso.recorte] }),
    }), { config, criarCliente, provedor: (c) => criarGemini(c.gemini, buscar) });
    const j = await resposta.json();
    const etapas = j.execucao?.etapas ?? [];
    const delegacoes = etapas.filter((e) => e.tipo === 'delegacao').map((e) => e.papel);
    const conferencia = {
      estado: (j.estado ?? j.erro) === caso.esperado.estado,
      delegacoes: !caso.esperado.delegacoes || caso.esperado.delegacoes.every((p) => delegacoes.includes(p)),
      teto: (j.execucao?.total_chamadas ?? envios.length) <= 6,
      sem_segredo: envios.every((e) => !e.chave_no_corpo && !e.jwt_no_corpo),
      store_false: envios.every((e) => e.store === false),
    };
    relatorio.casos.push({
      id: caso.id, recorte: caso.recorte, pergunta_id: caso.pergunta_id, esperado: caso.esperado, http: resposta.status,
      estado: j.estado ?? null, erro: j.erro ?? null, classificacao: j.classificacao ?? null, delegacoes,
      chamadas: j.execucao?.chamadas ?? null, uso: j.execucao?.uso ?? null, ms: Math.round(performance.now() - t0),
      ferramentas: etapas.filter((e) => e.tipo === 'ferramenta_concluida').map((e) => `${e.papel}:${e.ferramenta}`),
      recusadas: etapas.filter((e) => e.tipo === 'ferramenta_recusada').length,
      analises: (j.analises ?? []).map((a) => ({ papel: a.papel, estado: a.estado, motivo: a.motivo ?? null, afirmacoes: a.afirmacoes.length, rejeitadas: a.rejeitadas })),
      resposta: j.resposta ?? null, envios, conferencia, passou: Object.values(conferencia).every(Boolean),
      ...(diagnostico ? { evidencias: j.evidencias ?? null, rejeicoes: rejeicoes(envios, j.evidencias) } : {}),
    });
    if (resposta.status !== 200) { process.stderr.write(`Prova inconclusiva: HTTP ${resposta.status}; interrompida sem repetir casos.\n`); break; }
    process.stderr.write(`${caso.id}: HTTP ${resposta.status}, ${j.estado ?? j.erro}, ${envios.length} chamada(s)\n`);
  }
} finally {
  for (const nome of Object.keys(CONTAS)) await removerConta(L, nome).catch(() => {});
  sqlAdmin(SQL_LIMPEZA);
}
relatorio.passou = relatorio.casos.length === escolhidos.length && relatorio.casos.every((c) => c.passou);
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);
