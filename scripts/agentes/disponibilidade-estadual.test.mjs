// Issue #111 — panorama do estado inteiro com muitos municípios na disponibilidade, sem rede.
// Fixture gerada com 141 municípios fictícios (G3). Na produção, a análise de contexto e qualidade falhou com
// `saida_invalida` e o panorama ficou sem síntese. Decisão G1 (opção A): citar no máximo 8 municípios com ressalva
// (lacuna conhecida ou incidência indeterminada), declarar a lista parcial e não somar nem agrupar municípios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conferirAfirmacao, indexar, orquestrar, INSTRUCOES, NOTAS } from '../../servidor/agentes.ts';
import { marcarRessalvas, LISTA_PARCIAL, SEM_RESSALVA } from '../../servidor/ferramentas.ts';
import { lerResposta } from '../../servidor/gemini.ts';
import { Orcamento } from '../../servidor/orcamento.ts';

const N = 141;
const nome = (i) => `Município Fictício ${String(i + 1).padStart(3, '0')} (${9900001 + i})`;
const avaliado = (i, ind, lac = 0) => ({
  municipio: nome(i),
  texto: `${31 - ind - lac} de 31 dias sem evidência de lacuna${ind ? `, ${ind} com incidência indeterminada` : ''}${lac ? `, ${lac} com lacuna conhecida` : ''} (cobertura não comprovada)`,
  por_classe: { sem_evidencia_de_lacuna: 31 - ind - lac, incidencia_indeterminada: ind, lacuna_conhecida: lac },
});
/** A cada 7, 9 dias com incidência indeterminada; o índice 3 com 2 dias de lacuna conhecida; o índice 5 não avaliado. */
function linha(i) {
  if (i === 5) return { municipio: nome(i), texto: 'disponibilidade não verificada no período' };
  return avaliado(i, i % 7 === 0 ? 9 : 0, i === 3 ? 2 : 0);
}
const MUNICIPIOS = Array.from({ length: N }, (_, i) => linha(i));
// Referência calculada à parte da implementação: múltiplos de 7 de 0 a 140 (21) e o índice 3; o 5 (não avaliado) fica fora.
const ESPERADO = [0, 3, ...Array.from({ length: 20 }, (_, k) => 7 * (k + 1))];

const JANELA = { inicio: '2026-10-01', fim: '2026-10-31' };
const TEMPORAL = { ferramenta: 'distribuicao_temporal', janela: JANELA, municipio: null, total: 761, dias_com_deteccao: 26, dias: { maximo: 86, periodos_maximos: ['2026-10-25'] } };
const disponibilidade = (lado) => ({
  ferramenta: 'consultar_disponibilidade', ressalvas: [], estado: 'avaliada',
  alcance: 'subconjunto dos municípios associados às detecções do recorte; lista explícita em lados; não é disponibilidade estadual completa',
  lados: [{ lado: 'A', janela: JANELA, ...lado }],
  nota: 'Disponibilidade não comprova cobertura; cada município tem as próprias classes, sem agregação.',
});
const comMarcas = disponibilidade(marcarRessalvas(MUNICIPIOS));
const marcados = (lado) => lado.municipios.flatMap((m, i) => (m.ressalva ? [i] : []));

test('caso de referência: marca só lacuna conhecida e incidência indeterminada, sem soma nem agrupamento', () => {
  const r = marcarRessalvas(MUNICIPIOS);
  assert.deepEqual(marcados(r), ESPERADO);
  assert.equal(r.municipios[5].ressalva, false);
  assert.equal(r.lista_parcial, LISTA_PARCIAL);
  assert.equal(r.sem_ressalva, undefined);
  assert.doesNotMatch(LISTA_PARCIAL + SEM_RESSALVA, /\d/);
  // Até 8 municípios: só as marcas, sem lista parcial.
  const curta = marcarRessalvas(MUNICIPIOS.slice(0, 8));
  assert.deepEqual(marcados(curta), [0, 3, 7]);
  assert.equal(curta.lista_parcial, undefined);
  // Lista longa sem ressalva: frase fixa; com um não avaliado, a frase não é afirmada.
  const limpos = Array.from({ length: 10 }, (_, i) => avaliado(i, 0));
  assert.equal(marcarRessalvas(limpos).sem_ressalva, SEM_RESSALVA);
  assert.equal(marcarRessalvas(limpos).lista_parcial, undefined, 'sem ressalva, não há lista parcial de ressalvas');
  assert.equal(marcarRessalvas([...limpos, linha(5)]).lista_parcial, LISTA_PARCIAL);
  assert.equal(marcarRessalvas([...limpos, linha(5)]).sem_ressalva, undefined);
  // Cada lado é marcado com a própria lista.
  assert.deepEqual(marcados(marcarRessalvas(MUNICIPIOS.slice(7, 20))), [0, 7]);
});

test('conferência: os campos novos não sustentam contagem de municípios; a declaração sem algarismos passa', () => {
  const idx = indexar([{ id: 'E2', ferramenta: 'consultar_disponibilidade', dados: comMarcas }]);
  const lista = ['E2.lados[0].lista_parcial'];
  assert.equal(conferirAfirmacao({ texto: 'A lista é parcial: 22 municípios têm ressalva e só 7 foram citados.', referencias: lista }, idx), 'número divergente');
  assert.equal(conferirAfirmacao({ texto: 'A lista é parcial: cita no máximo 8 municípios.', referencias: lista }, idx), 'número divergente');
  assert.equal(conferirAfirmacao({ texto: 'A lista é parcial: os demais municípios ficam só na evidência.', referencias: lista }, idx), null);
  const vazio = indexar([{ id: 'E2', ferramenta: 'consultar_disponibilidade', dados: disponibilidade(marcarRessalvas(Array.from({ length: 10 }, (_, i) => avaliado(i, 0)))) }]);
  assert.equal(conferirAfirmacao({ texto: 'Nenhum município desta lista tem lacuna conhecida ou incidência indeterminada; isso não comprova cobertura.', referencias: ['E2.lados[0].sem_ressalva'] }, vazio), null);
});

/** Provedor local: o subagente de contexto responde com `responderDisponibilidade(id, dados)`. */
function provedor(responderDisponibilidade) {
  const texto = (obj) => lerResposta({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify(obj) }] }] });
  const chamar = (nomeF, id) => lerResposta({ status: 'requires_action', steps: [{ type: 'function_call', id, name: nomeF, arguments: {} }] });
  return {
    modelo: 'local-sem-rede',
    interagir: async (i) => {
      const papel = Object.entries(INSTRUCOES).find(([, t]) => t === i.sistema)?.[0];
      if (papel === 'principal') return lerResposta({ status: 'requires_action', steps: [{ type: 'function_call', id: 'p1', name: 'delegar', arguments: { analistas: ['lentes', 'disponibilidade'], classificacao: 'respondivel' } }] });
      if (papel === 'sintese') {
        const analises = JSON.parse(i.entrada[0].content[0].text.split('Análises conferidas (dados): ')[1].split('\n')[0]);
        const [a, b] = analises.map((x) => x.afirmacoes[0]);
        return texto({ classificacao: 'respondivel', afirmacoes: [{ texto: `${a.texto} ${b.texto}`, referencias: [...a.referencias, ...b.referencias] }], limites: [] });
      }
      const resultado = i.entrada.find((p) => p.type === 'function_result');
      if (!resultado) return chamar(papel === 'lentes' ? 'distribuicao_temporal' : 'consultar_disponibilidade', `f-${papel}`);
      const { evidencia, dados } = JSON.parse(resultado.result[0].text);
      if (papel === 'lentes') return texto({ afirmacoes: [{ texto: 'No período foram 761 detecções, com máximo diário de 86.', referencias: [`${evidencia}.total`, `${evidencia}.dias.maximo`] }], limites: [] });
      return texto(responderDisponibilidade(evidencia, dados));
    },
  };
}

const panorama = (prov, dados) => orquestrar({
  pedido: { pergunta_id: 'panorama', carga: { id: 1, identidade: 'f'.repeat(64) }, recorte: { tipo: 'selecao', janela: JANELA, municipio: null, lente: null } },
  orcamento: new Orcamento(new AbortController().signal), provedor: prov,
  executar: async (nomeF) => (nomeF === 'distribuicao_temporal' ? TEMPORAL : dados), revalidar: async () => {},
});
const topico = (ev, dados, i) => ({ texto: `${dados.lados[0].municipios[i].municipio}: ${dados.lados[0].municipios[i].texto}.`, referencias: [`${ev}.lados[0].municipios[${i}]`] });

test('defeito reproduzido: um tópico por município com ressalva passa do teto de 8 e o panorama fica sem síntese', async () => {
  const umPorMunicipio = (ev, dados) => ({ afirmacoes: ESPERADO.map((i) => topico(ev, dados, i)), limites: [] });
  const r = await panorama(provedor(umPorMunicipio), disponibilidade({ municipios: MUNICIPIOS }));
  assert.equal(r.analises.find((a) => a.papel === 'disponibilidade').estado, 'falha');
  assert.equal(r.estado, 'incompleta');
  assert.deepEqual(r.afirmacoes, []);
});

test('correção: até 8 municípios marcados, lista parcial declarada e aviso fixo garantido pelo servidor', async () => {
  const instr = INSTRUCOES.disponibilidade;
  assert.match(instr, /no máximo 8 municípios com "ressalva": true no total da resposta, somando os lados/);
  assert.match(instr, /lista_parcial/);
  assert.match(instr, /localize-o pelo nome/);
  const ate8 = (comLimitacao) => (ev, dados) => ({
    afirmacoes: marcados(dados.lados[0]).slice(0, 8).map((i, k) => ({
      ...topico(ev, dados, i),
      ...(k === 0 && comLimitacao ? { limitacao: { texto: 'A lista é parcial: os demais municípios ficam só na evidência.', referencias: [`${ev}.lados[0].lista_parcial`] } } : {}),
    })),
    limites: ['Disponibilidade não comprova cobertura.'],
  });
  for (const comLimitacao of [true, false]) {
    const r = await panorama(provedor(ate8(comLimitacao)), comMarcas);
    const contexto = r.analises.find((a) => a.papel === 'disponibilidade');
    assert.equal(contexto.estado, 'concluida');
    assert.equal(contexto.afirmacoes.length, 8);
    assert.equal(Boolean(contexto.afirmacoes[0].limitacao), comLimitacao);
    assert.ok(r.notas.includes(NOTAS.listaParcial), 'aviso de lista parcial mesmo sem a limitação do modelo');
    assert.equal(r.estado, 'completa');
    assert.equal(r.afirmacoes.length, 1);
  }
});
