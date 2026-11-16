// Ciclo 008, item 3 (issue #79) — prova real local com o Gemini (plano 008, T9), antes do merge. Handler real em
// processo, Supabase local (Auth e RLS reais) com a fixture fictícia do E2E e o cliente REST real contra
// `v1beta/interactions` com o modelo fixado. A chave vem só de `RQ_GEMINI_CHAVE` no ambiente local ignorado (`.env`);
// nunca é impressa, registrada ou enviada no corpo. Pré-requisitos: ação externa da issue #79 concluída (projeto,
// cotas e chave) e banco local vazio (`npm run prova:agentes` faz `supabase db reset`).
//
// Uso: `npm run prova:agentes` (casos mínimos de T9: R1, R2, P1 e F1) ou `npm run prova:agentes -- R3 F2` (casos
// escolhidos de `casos.mjs`). Intervalo entre casos em `RQ_PROVA_INTERVALO_MS` (padrão 30 s), para respeitar o RPM.
// O relatório (JSON) traz endpoint, modelo, papéis e ordem das chamadas, ferramentas, eventos, estado, uso e tempo;
// nunca a chave, o JWT ou dados de conta. O texto gerado aparece para a conferência humana dos fatos.
import { sqlAdmin, statusLocal } from '../banco/local.mjs';
import { CONTAS, cadastrarRp, criarConta, removerConta, tokenDe } from '../../tests/e2e/contas.mjs';
import { IDENTIDADE, SQL_LIMPEZA, sqlFixture } from '../../tests/e2e/fixture.mjs';
import { tratarExplicar } from '../../servidor/explicar.ts';
import { criarCliente } from '../../api/explicar.ts';
import { criarGemini, ENDPOINT_GEMINI } from '../../servidor/gemini.ts';
import { MODELO_FIXADO } from '../../servidor/config.ts';
import { CASOS, RECORTES } from './casos.mjs';

const chave = process.env.RQ_GEMINI_CHAVE ?? '';
if (!chave) {
  process.stderr.write('RQ_GEMINI_CHAVE ausente: conclua a ação externa da issue #79 e grave a chave só no .env local (ignorado).\n');
  process.exit(2);
}
const pedidos = process.argv.slice(2);
const escolhidos = pedidos.length ? CASOS.filter((c) => pedidos.includes(c.id)) : CASOS.filter((c) => ['R1', 'R2', 'P1', 'F1'].includes(c.id));
const intervalo = Number(process.env.RQ_PROVA_INTERVALO_MS ?? 30_000);
const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

const L = statusLocal();
if (sqlAdmin('select count(*) from public.cargas;') !== '0') throw new Error('Banco local deve estar vazio; rode `npm run prova:agentes` (faz `supabase db reset`).');

const relatorio = { geradoEm: new Date().toISOString(), endpoint: ENDPOINT_GEMINI, modelo: MODELO_FIXADO, casos: [] };
try {
  sqlAdmin(sqlFixture());
  const cargaId = Number(sqlAdmin(`select id from public.cargas where identidade = '${IDENTIDADE}';`));
  await criarConta(L, 'rp', {});
  cadastrarRp();
  const token = await tokenDe('rp');
  const config = { habilitada: true, supabaseUrl: L.api, chavePublica: L.anon, gemini: { chave, modelo: MODELO_FIXADO }, origens: [] };
  for (const [i, caso] of escolhidos.entries()) {
    if (i > 0) await esperar(intervalo);
    // Metadados de cada envio real (sem corpo): store, ferramentas, saída estruturada, bytes e status HTTP.
    const envios = [];
    const buscar = async (url, init) => {
      const corpo = JSON.parse(String(init.body));
      const r = await fetch(url, init);
      envios.push({
        url, status: r.status, bytes: Buffer.byteLength(String(init.body)), store: corpo.store,
        ferramentas: (corpo.tools ?? []).map((t) => t.name), saida_estruturada: Boolean(corpo.response_format),
        tool_choice: corpo.generation_config?.tool_choice ?? null, chave_no_corpo: String(init.body).includes(chave), jwt_no_corpo: String(init.body).includes(token),
      });
      return r;
    };
    const t0 = performance.now();
    const resposta = await tratarExplicar(new Request('http://127.0.0.1/api/explicar', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ pergunta: caso.pergunta, carga: { id: cargaId, identidade: IDENTIDADE }, recorte: RECORTES[caso.recorte] }),
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
      id: caso.id, recorte: caso.recorte, pergunta: caso.pergunta, esperado: caso.esperado, http: resposta.status,
      estado: j.estado ?? null, erro: j.erro ?? null, classificacao: j.classificacao ?? null, delegacoes,
      chamadas: j.execucao?.chamadas ?? null, uso: j.execucao?.uso ?? null, ms: Math.round(performance.now() - t0),
      ferramentas: etapas.filter((e) => e.tipo === 'ferramenta_concluida').map((e) => `${e.papel}:${e.ferramenta}`),
      recusadas: etapas.filter((e) => e.tipo === 'ferramenta_recusada').length,
      analises: (j.analises ?? []).map((a) => ({ papel: a.papel, estado: a.estado, motivo: a.motivo ?? null, afirmacoes: a.afirmacoes.length, rejeitadas: a.rejeitadas })),
      resposta: j.resposta ?? null, envios, conferencia, passou: Object.values(conferencia).every(Boolean),
    });
    process.stderr.write(`${caso.id}: HTTP ${resposta.status}, ${j.estado ?? j.erro}, ${envios.length} chamada(s)\n`);
  }
} finally {
  for (const nome of Object.keys(CONTAS)) await removerConta(L, nome).catch(() => {});
  sqlAdmin(SQL_LIMPEZA);
}
relatorio.passou = relatorio.casos.every((c) => c.passou);
process.stdout.write(`${JSON.stringify(relatorio, null, 2)}\n`);
