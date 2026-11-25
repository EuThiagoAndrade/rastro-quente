// Ciclo 013 (issue #115) — prova real local da interpretação da "Pergunte ao mapa" com o Gemini. Roda o catálogo de
// perguntas abaixo contra um modelo (padrão: o modelo reserva) e confere cada interpretação, depois do validador comum,
// contra o resultado esperado. Sem banco: a janela é a do teste unitário e os municípios usam nomes públicos com
// códigos fictícios. Chave só no `.env` local (ignorado); a saída registra pergunta, resultado e duração, nunca a chave.
//
//   npm run prova:interpretar                         → gemini-3.5-flash
//   RQ_PROVA_MODELO=gemini-3.1-flash-lite npm run prova:interpretar
import { criarGemini } from '../../servidor/gemini.ts';
import { MODELO_FIXADO, MODELO_RESERVA } from '../../servidor/config.ts';
import { ESQUEMA_INTERPRETACAO, instrucaoSistema, validarInterpretacao } from '../../src/pergunte.ts';

const chave = process.env.RQ_GEMINI_CHAVE ?? '';
if (!chave) {
  process.stderr.write('RQ_GEMINI_CHAVE ausente: grave a chave só no .env local (ignorado).\n');
  process.exit(2);
}
const modelo = process.env.RQ_PROVA_MODELO || MODELO_RESERVA;
if (modelo !== MODELO_RESERVA && modelo !== MODELO_FIXADO) {
  process.stderr.write(`RQ_PROVA_MODELO deve ser ${MODELO_RESERVA} ou ${MODELO_FIXADO}.\n`);
  process.exit(2);
}
/** Espaço entre chamadas: 5 s, abaixo das 15 por minuto do nível gratuito (ADR-011). */
const INTERVALO_MS = 5_000;

const ctx = {
  janela: { inicio: '2025-11-01', fim: '2026-10-31' },
  municipios: [
    { codigo: 1, nome: 'Nova Nazaré' }, { codigo: 2, nome: 'Campinápolis' }, { codigo: 3, nome: 'Nova Maringá' },
    { codigo: 4, nome: 'Barra do Garças' }, { codigo: 5, nome: 'Colniza' }, { codigo: 6, nome: 'Cuiabá' },
  ],
};

/** Pergunta e o que a interpretação validada precisa ter (só os campos citados são conferidos). */
const CATALOGO = [
  ['Como as detecções evoluíram em Nova Nazaré em agosto de 2026?', { tipo: 'consulta', municipio: 1, periodo: { inicio: '2026-08-01', fim: '2026-08-31' }, animar: true }],
  ['Mostre a evolução das detecções em Campinápolis em agosto', { tipo: 'consulta', municipio: 2, periodo: { inicio: '2026-08-01', fim: '2026-08-31' }, animar: true }],
  ['Onde as detecções persistiram em Nova Maringá entre agosto e setembro?', { tipo: 'consulta', municipio: 3, lente: 'persistencia', periodo: { inicio: '2026-08-01', fim: '2026-09-30' } }],
  ['Quais detecções caem em terra indígena em agosto?', { tipo: 'consulta', lente: 'sobreposicao', classe: 'terra_indigena', periodo: { inicio: '2026-08-01', fim: '2026-08-31' } }],
  ['Onde há mais detecções em setembro?', { tipo: 'consulta', lente: 'concentracao', periodo: { inicio: '2026-09-01', fim: '2026-09-30' } }],
  ['Detecções em Colniza de 10/08 a 15/08', { tipo: 'consulta', municipio: 5, periodo: { inicio: '2026-08-10', fim: '2026-08-15' } }],
  ['Compare Colniza e Campinápolis em agosto', { tipo: 'consulta', municipio: 5, comparar: { modo: 'municipios', municipio_b: 2 } }],
  ['Onde há persistência e recorrência em Colniza em outubro?', { tipo: 'consulta', municipio: 5, lente: 'combinacao' }],
  ['Quem causou esse fogo?', { tipo: 'recusa_autoria' }],
  ['Qual fazendeiro é culpado pela queimada em Colniza?', { tipo: 'recusa_autoria' }],
  ['Vai queimar amanhã em Colniza?', { tipo: 'recusa_previsao' }],
  ['Qual a área queimada em Cuiabá?', { tipo: 'sem_dado' }],
  ['Focos em terra indígena em 2024', { tipo: 'fora_da_janela' }],
  ['bom dia', { tipo: 'nao_entendi' }],
];

const confere = (obtido, esperado) => Object.entries(esperado)
  .filter(([k, v]) => JSON.stringify(obtido?.[k]) !== JSON.stringify(v))
  .map(([k, v]) => `${k}: esperado ${JSON.stringify(v)}, obtido ${JSON.stringify(obtido?.[k])}`);

const provedor = criarGemini({ chave, modelo });
const sistema = instrucaoSistema(ctx);
let certos = 0;
let falhas = 0;
console.log(`Prova real da interpretação — modelo ${modelo}, ${CATALOGO.length} perguntas\n`);
for (const [i, [pergunta, esperado]] of CATALOGO.entries()) {
  if (i > 0) await new Promise((ok) => setTimeout(ok, INTERVALO_MS));
  const t0 = performance.now();
  try {
    const r = await provedor.interagir({
      sistema,
      entrada: [{ type: 'user_input', content: [{ type: 'text', text: pergunta }] }],
      esquema: ESQUEMA_INTERPRETACAO,
    }, AbortSignal.timeout(20_000));
    const ms = Math.round(performance.now() - t0);
    const { interpretacao, descartados } = validarInterpretacao(JSON.parse(r.texto), ctx);
    const dif = confere(interpretacao, esperado);
    if (dif.length === 0) certos++;
    console.log(`${dif.length === 0 ? 'OK  ' : 'DIF '} ${String(ms).padStart(5)} ms  ${pergunta}`);
    for (const d of dif) console.log(`        ${d}`);
    if (descartados.length) console.log(`        descartados: ${descartados.join('; ')}`);
  } catch (e) {
    falhas++;
    const ms = Math.round(performance.now() - t0);
    console.log(`ERRO ${String(ms).padStart(5)} ms  ${pergunta}\n        ${e?.codigo ?? e?.name ?? 'erro'}${e?.detalhe ? ` (${e.detalhe})` : ''}`);
  }
}
console.log(`\nResultado: ${certos}/${CATALOGO.length} conferidas, ${falhas} falha(s) do provedor.`);
