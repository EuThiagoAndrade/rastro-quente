import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conferirAfirmacao, indexar, lerAfirmacoes, ferramentasDe, delegacoesNecessarias } from '../../servidor/agentes.ts';
const indice = indexar([{ id: 'E1', dados: { a: { total: 10 }, b: { total: 15 }, diferenca_total: 5 }, ferramenta: 'comparar_periodos' }]);
test('números corretos não autorizam relação comparativa invertida', () => {
  const referencias = ['E1.a.total', 'E1.b.total'];
  assert.equal(conferirAfirmacao({ texto: 'As detecções diminuíram de 10 em A para 15 em B.', referencias }, indice), 'sentido comparativo invertido');
  assert.equal(conferirAfirmacao({ texto: 'As detecções aumentaram de 10 em A para 15 em B.', referencias }, indice), null);
});
test('limitação inválida descarta o tópico; sugestão opcional inválida não apaga a observação', () => {
  const af = { texto: 'A teve 10 detecções.', referencias: ['E1.a.total'] };
  const ler = (a) => lerAfirmacoes(JSON.stringify({ afirmacoes: [a], limites: [] }), indice, false);
  assert.equal(ler({ ...af, limitacao: { texto: 'Foram 99.', referencias: ['E1.a.total'] } }).afirmacoes.length, 0);
  const semSugestao = ler({ ...af, sugestao: { texto: 'Consultar disponibilidade.', referencias: [] } });
  assert.deepEqual(semSugestao.afirmacoes, [af]);
  assert.equal(semSugestao.sugestoesRejeitadas, 1);
  assert.equal(ler({ ...af, limitacao: { texto: 'O valor observado não comprova ausência de fogo.', referencias: ['E1.a.total'] } }).afirmacoes.length, 1);
  const r = lerAfirmacoes(JSON.stringify({ afirmacoes: [af], limites: ['Houve 99 incêndios.'] }), indice, false);
  assert.deepEqual(r.limites, []);
});
test('catálogo e delegações são específicos por pergunta', () => {
  const p = (pergunta_id) => ({ pergunta_id });
  assert.deepEqual(ferramentasDe('lentes', p('cuidados')), []);
  assert.deepEqual(delegacoesNecessarias(p('cuidados')), ['disponibilidade']);
  for (const id of ['panorama', 'mudanca', 'padroes', 'proximos']) assert.deepEqual(delegacoesNecessarias(p(id)), ['lentes', 'disponibilidade']);
  assert.deepEqual(ferramentasDe('lentes', p('padroes')), ['cruzar_padroes']);
  assert.deepEqual(ferramentasDe('lentes', p('mudanca')), ['comparar_periodos']);
});

test('tetos de tópicos, limites e referências continuam obrigatórios fora da gramática do provedor', () => {
  const af = { texto: 'A teve 10 detecções.', referencias: ['E1.a.total'] };
  const ler = (afirmacoes, limites = []) => lerAfirmacoes(JSON.stringify({ afirmacoes, limites }), indice, false);
  assert.throws(() => ler(Array.from({ length: 9 }, () => af)), (e) => e.codigo === 'saida_invalida');
  assert.throws(() => ler([af], Array(6).fill('Disponibilidade não comprova cobertura.')), (e) => e.codigo === 'saida_invalida');
  assert.equal(ler([{ ...af, referencias: Array(13).fill('E1.a.total') }]).afirmacoes.length, 0);
  assert.equal(ler([{ ...af, limitacao: { texto: 'Limite.', referencias: Array(13).fill('E1.a.total') } }]).afirmacoes.length, 0);
});

test('panorama não aceita média ou tendência que as ferramentas não calculam, mesmo com valores e referências existentes', () => {
  const idx = indexar([{ id: 'E1', dados: { total: 55, dias: { maximo: 7 } }, ferramenta: 'distribuicao_temporal' }]);
  assert.equal(conferirAfirmacao({ texto: 'As 55 detecções tiveram média diária ascendente até o máximo de 7.', referencias: ['E1.total', 'E1.dias.maximo'] }, idx), 'medida não fornecida pelas ferramentas');
  assert.equal(conferirAfirmacao({ texto: 'Foram observadas 55 detecções, com máximo diário de 7.', referencias: ['E1.total', 'E1.dias.maximo'] }, idx), null);
});

test('a formulação real sem lacunas reprova; a classe exata sem evidência de lacuna passa', () => {
  const idx = indexar([{ id: 'E3', dados: { lados: [{ municipios: [{ municipio: 'Município Gama (9900003)', texto: '10 de 10 dias sem evidência de lacuna (cobertura não comprovada)' }] }] }, ferramenta: 'consultar_disponibilidade' }]);
  const referencias = ['E3.lados[0].municipios[0]'];
  assert.equal(conferirAfirmacao({ texto: 'Gama registrou 10 dias de disponibilidade sem lacunas.', referencias }, idx), 'certeza de cobertura não comprovada');
  assert.equal(conferirAfirmacao({ texto: 'Gama registrou 10 dias sem evidência de lacuna.', referencias }, idx), null);
  assert.equal(conferirAfirmacao({ texto: 'Os 10 dias não comprovam cobertura completa.', referencias }, idx), null);
});

import { readFileSync } from 'node:fs';
import { orquestrar, INSTRUCOES } from '../../servidor/agentes.ts';
import { lerResposta } from '../../servidor/gemini.ts';
import { Orcamento } from '../../servidor/orcamento.ts';
async function reproduzirCaptura(arquivo) {
  const fx = JSON.parse(readFileSync(new URL(`../../tests/fixtures/agentes/${arquivo}`, import.meta.url), 'utf8'));
  const filas = new Map();
  for (const s of fx.saidas) { const q = filas.get(s.papel) ?? []; q.push(s.saida); filas.set(s.papel, q); }
  const ferramentas = Object.fromEntries(Object.values(fx.evidencias).map((e) => [e.ferramenta, e.dados]));
  let enviadoParaSintese;
  const r = await orquestrar({
    pedido: { pergunta_id: 'panorama', carga: { id: 1, identidade: 'f'.repeat(64) }, recorte: { tipo: 'selecao', janela: { inicio: '2026-10-01', fim: '2026-10-10' }, municipio: null, lente: null } },
    orcamento: new Orcamento(new AbortController().signal),
    provedor: { modelo: 'replay-local-sem-rede', interagir: async (i) => {
      const papel = Object.entries(INSTRUCOES).find(([, texto]) => texto === i.sistema)?.[0];
      if (papel === 'sintese') enviadoParaSintese = JSON.parse(i.entrada[0].content[0].text.split('Análises conferidas (dados): ')[1].split('\n')[0]);
      const textos = filas.get(papel)?.shift();
      assert.ok(textos, `chamada inesperada: ${papel}`);
      const steps = textos.map((texto, n) => {
        const chamada = /^function_call (\w+) (.*)$/.exec(texto);
        return chamada ? { type: 'function_call', id: `fixture-${papel}-${n}`, name: chamada[1], arguments: JSON.parse(chamada[2]) } : { type: 'model_output', content: [{ type: 'text', text: texto }] };
      });
      return lerResposta({ status: steps.some((s) => s.type === 'function_call') ? 'requires_action' : 'completed', steps });
    } },
    executar: async (nome) => ferramentas[nome], revalidar: async () => {},
  });
  return { r, enviadoParaSintese };
}

test('reprodução sem rede da resposta capturada preserva máximo temporal e barra a certeza indevida na síntese', async () => {
  const { r, enviadoParaSintese } = await reproduzirCaptura('panorama-011.json');
  const padroes = r.analises.find((a) => a.papel === 'lentes');
  assert.equal(padroes.afirmacoes.length, 2);
  const maximo = padroes.afirmacoes.find((a) => a.texto.includes('máximo'));
  assert.ok(maximo);
  assert.equal(maximo.sugestao, undefined);
  assert.ok(maximo.limitacao);
  assert.ok(enviadoParaSintese.find((a) => a.analista === 'lentes').afirmacoes.some((a) => a.texto.includes('máximo')));
  assert.ok(r.afirmacoes.every((a) => !a.texto.includes('sem lacunas')));
  assert.ok(r.notas.some((n) => n.includes('descartadas')));
  assert.deepEqual(r.afirmacoes, []);
  assert.equal(r.estado, 'incompleta');
  assert.ok(r.notas.some((n) => n.includes('evidência isolada')));
});

test('captura corrigida: limitação negativa não é uma afirmação de cobertura; os dois tópicos válidos sobrevivem', async () => {
  const { r } = await reproduzirCaptura('panorama-011-corrigido.json');
  assert.equal(r.afirmacoes.length, 2);
  assert.equal(r.estado, 'completa');
  assert.ok(r.afirmacoes[0].texto.includes('máximo diário de 7'));
  assert.ok(r.afirmacoes[1].texto.includes('sem evidência de lacuna'));
  assert.ok(r.afirmacoes[1].limitacao.texto.includes('impedindo concluir a cobertura total'));
  assert.ok(r.afirmacoes[1].sugestao);
  assert.ok(!r.notas.some((n) => n.includes('descartadas')));
});
