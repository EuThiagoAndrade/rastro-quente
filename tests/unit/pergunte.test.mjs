// Ciclo 012 (issue #113) — interpretador local e validador comum do "Pergunte ao mapa". Municípios e janela
// fictícios com nomes acentuados; valores esperados escritos à mão a partir das regras do plano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpretarLocal, normalizar, validarInterpretacao, instrucaoSistema, ESQUEMA_INTERPRETACAO } from '../../src/pergunte.ts';

const ctx = {
  janela: { inicio: '2025-11-01', fim: '2026-10-31' },
  municipios: [
    { codigo: 1, nome: 'Nova Nazaré' }, { codigo: 2, nome: 'Campinápolis' }, { codigo: 3, nome: 'Nova Maringá' },
    { codigo: 4, nome: 'Barra do Garças' }, { codigo: 5, nome: 'Colniza' }, { codigo: 6, nome: 'Nova' },
  ],
};
const ler = (q) => validarInterpretacao(interpretarLocal(q, ctx), ctx);

test('normaliza acentos e caixa', () => {
  assert.equal(normalizar('Campinápolis, AGOSTO!'), 'campinapolis agosto');
});

test('as três perguntas do roteiro viram os filtros esperados', () => {
  assert.deepEqual(ler('Como as detecções evoluíram em Nova Nazaré em agosto de 2026?').interpretacao, {
    tipo: 'consulta', periodo: { inicio: '2026-08-01', fim: '2026-08-31' }, municipio: 1, lente: 'nenhuma', classe: null, combinacao: null,
    animar: true, comparar: null, motivo: 'Pedido de evolução no tempo.',
  });
  const b = ler('Mostre a evolução das detecções em Campinápolis em agosto').interpretacao;
  assert.deepEqual([b.periodo, b.municipio, b.animar], [{ inicio: '2026-08-01', fim: '2026-08-31' }, 2, true]);
  const c = ler('Onde as detecções persistiram em Nova Maringá entre agosto e setembro?').interpretacao;
  assert.deepEqual([c.periodo, c.municipio, c.lente, c.animar], [{ inicio: '2026-08-01', fim: '2026-09-30' }, 3, 'persistencia', false]);
});

test('o nome mais longo vence ("Nova Maringá" não vira "Nova")', () => {
  assert.equal(ler('focos em Nova Maringá').interpretacao.municipio, 3);
  assert.equal(ler('focos em Nova').interpretacao.municipio, 6);
});

test('mês sem ano usa o ano em que o mês cai na janela', () => {
  assert.deepEqual(ler('detecções em Colniza em novembro').interpretacao.periodo, { inicio: '2025-11-01', fim: '2025-11-30' });
  assert.deepEqual(ler('detecções em Colniza de 10/08 a 15/08').interpretacao.periodo, { inicio: '2026-08-10', fim: '2026-08-15' });
  // "dez" é número, não dezembro.
  assert.equal(ler('dez dias de focos em Colniza').interpretacao.periodo, null);
});

test('recusas de autoria e previsão, dado ausente e fora da janela', () => {
  assert.equal(ler('Quem causou esse fogo?').interpretacao.tipo, 'recusa_autoria');
  assert.equal(ler('Qual fazendeiro é culpado pela queimada?').interpretacao.tipo, 'recusa_autoria');
  assert.equal(ler('Vai queimar amanhã em Colniza?').interpretacao.tipo, 'recusa_previsao');
  assert.equal(ler('Qual o risco de fogo em setembro?').interpretacao.tipo, 'recusa_previsao');
  assert.equal(ler('Qual a área queimada em Colniza?').interpretacao.tipo, 'sem_dado');
  assert.equal(ler('Choveu em agosto?').interpretacao.tipo, 'sem_dado');
  assert.equal(ler('Focos em terra indígena em 2024').interpretacao.tipo, 'fora_da_janela');
  assert.equal(ler('bom dia').interpretacao.tipo, 'nao_entendi');
});

test('lentes, classe de área e comparações', () => {
  const ti = ler('Quais detecções caem em terra indígena em agosto?').interpretacao;
  assert.deepEqual([ti.lente, ti.classe], ['sobreposicao', 'terra_indigena']);
  assert.equal(ler('Onde há mais detecções em setembro?').interpretacao.lente, 'concentracao');
  assert.equal(ler('Onde os focos voltam mês após mês?').interpretacao.lente, 'recorrencia');
  const cm = ler('Compare Colniza e Campinápolis em agosto').interpretacao;
  assert.deepEqual([cm.municipio, cm.comparar], [5, { modo: 'municipios', municipio_b: 2 }]);
  const cp = ler('Compare agosto e setembro em Colniza').interpretacao;
  assert.deepEqual(cp.periodo, { inicio: '2026-08-01', fim: '2026-08-31' });
  // B com o mesmo número de dias de A (31), começando em setembro.
  assert.deepEqual(cp.comparar, { modo: 'periodos', b: { inicio: '2026-09-01', fim: '2026-10-01' } });
});

test('validador: datas fora da janela, município inexistente e enumerados inválidos são descartados', () => {
  const base = { tipo: 'consulta', inicio: '', fim: '', municipio_codigo: 0, lente: 'nenhuma', classe_area: 'nenhuma', animar: false, comparar_modo: 'nenhuma', b_inicio: '', b_fim: '', municipio_b: 0, motivo: '' };
  assert.equal(validarInterpretacao({ ...base, inicio: '2024-01-01', fim: '2024-01-31' }, ctx).interpretacao.tipo, 'fora_da_janela');
  const ajustado = validarInterpretacao({ ...base, inicio: '2025-10-15', fim: '2025-11-10' }, ctx);
  assert.deepEqual(ajustado.interpretacao.periodo, { inicio: '2025-11-01', fim: '2025-11-10' });
  assert.match(ajustado.descartados[0], /ajustado à janela/);
  const r = validarInterpretacao({ ...base, inicio: '2026-02-30', fim: '2026-03-01', municipio_codigo: 999, lente: 'magica', classe_area: 'xyz', animar: true }, ctx);
  assert.equal(r.interpretacao.periodo, null);
  assert.equal(r.interpretacao.municipio, null);
  assert.equal(r.interpretacao.lente, 'nenhuma');
  assert.equal(r.interpretacao.classe, null);
  assert.deepEqual(r.descartados, ['período inválido', 'município fora da lista da versão de dados', 'lente desconhecida', 'classe de área desconhecida']);
  // Concentração com município: a interface nunca a pede.
  const conc = validarInterpretacao({ ...base, municipio_codigo: 5, lente: 'concentracao' }, ctx);
  assert.equal(conc.interpretacao.lente, 'nenhuma');
  // Comparação de períodos com B de outra duração não é aplicada.
  const cmp = validarInterpretacao({ ...base, inicio: '2026-08-01', fim: '2026-08-31', comparar_modo: 'periodos', b_inicio: '2026-09-01', b_fim: '2026-09-30' }, ctx);
  assert.equal(cmp.interpretacao.comparar, null);
  assert.ok(cmp.descartados.includes('período B com número de dias diferente de A'));
  // Formato desconhecido e campos extras não quebram nada.
  assert.equal(validarInterpretacao('texto', ctx).interpretacao.tipo, 'nao_entendi');
  assert.equal(validarInterpretacao({ tipo: 'apagar_tudo' }, ctx).interpretacao.tipo, 'nao_entendi');
});

test('o prompt leva só janela e municípios; o esquema é fechado', () => {
  const p = instrucaoSistema(ctx);
  assert.match(p, /2025-11-01 a 2026-10-31/);
  assert.match(p, /3: Nova Maringá/);
  assert.equal(ESQUEMA_INTERPRETACAO.additionalProperties, false);
  assert.deepEqual([...ESQUEMA_INTERPRETACAO.required].sort(), Object.keys(ESQUEMA_INTERPRETACAO.properties).sort());
});

test('combinação de lentes pela pergunta: duas ou mais lentes, operador e concentração com município', () => {
  const e = ler('Onde há persistência e recorrência em Colniza em agosto?').interpretacao;
  assert.equal(e.lente, 'combinacao');
  assert.deepEqual(e.combinacao, { lentes: ['recorrencia', 'persistencia'], operador: 'e' });
  const ou = ler('Onde os focos persistem ou voltam mês após mês em setembro?').interpretacao;
  assert.deepEqual(ou.combinacao, { lentes: ['recorrencia', 'persistencia'], operador: 'ou' });
  // Sem município, as três lentes entram.
  const tres = ler('Onde há concentração, recorrência e persistência em agosto?').interpretacao;
  assert.deepEqual(tres.combinacao, { lentes: ['concentracao', 'recorrencia', 'persistencia'], operador: 'e' });
  // Com município, a concentração sai; com duas restantes, continua combinação.
  const r = ler('Concentração, recorrência e persistência em Colniza');
  assert.deepEqual(r.interpretacao.combinacao, { lentes: ['recorrencia', 'persistencia'], operador: 'e' });
  assert.ok(r.descartados.includes('com município, a concentração sai da combinação'));
  // Com município e só uma lente restante, aplica essa lente e avisa.
  const uma = ler('Concentração e persistência em Colniza');
  assert.equal(uma.interpretacao.lente, 'persistencia');
  assert.equal(uma.interpretacao.combinacao, null);
});

test('validador da combinação: lentes inválidas, menos de duas e operador ausente', () => {
  const base = { tipo: 'consulta', inicio: '', fim: '', municipio_codigo: 0, lente: 'combinacao', classe_area: 'nenhuma', lentes_combinacao: [], operador: 'nenhum', animar: false, comparar_modo: 'nenhuma', b_inicio: '', b_fim: '', municipio_b: 0, motivo: '' };
  const r = validarInterpretacao({ ...base, lentes_combinacao: ['persistencia', 'sobreposicao', 'recorrencia'] }, ctx);
  assert.deepEqual(r.interpretacao.combinacao, { lentes: ['recorrencia', 'persistencia'], operador: 'e' });
  assert.ok(r.descartados.includes('lente desconhecida na combinação'));
  assert.ok(r.descartados.includes('operador não citado: usado "e"'));
  assert.equal(validarInterpretacao({ ...base, lentes_combinacao: [] }, ctx).interpretacao.lente, 'nenhuma');
  // Combinação nunca sobra em outra lente.
  assert.equal(validarInterpretacao({ ...base, lente: 'persistencia', lentes_combinacao: ['recorrencia', 'persistencia'], operador: 'e' }, ctx).interpretacao.combinacao, null);
});

// --- Ciclo 013 (issue #115): sobrecarga e modelo reserva no navegador ----------------------------------------------

test('nota de falha: sobrecarga tem nota própria; tempo e outras falhas mantêm as notas atuais', async () => {
  const { notaFalhaIa } = await import('../../src/pergunte.ts');
  assert.equal(notaFalhaIa('provedor_sobrecarregado'), 'A IA está sobrecarregada no momento; o interpretador local assumiu. Tente de novo em alguns minutos.');
  assert.equal(notaFalhaIa('tempo_esgotado'), 'A IA não respondeu a tempo; o interpretador local assumiu.');
  assert.equal(notaFalhaIa('provedor_indisponivel'), 'A IA não respondeu como esperado; o interpretador local assumiu.');
  assert.equal(notaFalhaIa('cota_provedor'), 'A IA não respondeu como esperado; o interpretador local assumiu.');
});

test('pedirInterpretacao: reserva informada, sobrecarga (503) não é IA desligada', async () => {
  const { pedirInterpretacao, ROTULO_ORIGEM } = await import('../../src/pergunte.ts');
  const resp = (status, corpo) => async () => new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } });
  const carga = { id: 1, identidade: 'a'.repeat(64) };
  const sinal = new AbortController().signal;
  assert.deepEqual(await pedirInterpretacao('p', carga, 't', sinal, resp(200, { interpretacao: { tipo: 'consulta' }, modelo: 'gemini-3.5-flash', reserva: true })),
    { tipo: 'ok', bruto: { tipo: 'consulta' }, reserva: true });
  assert.deepEqual(await pedirInterpretacao('p', carga, 't', sinal, resp(200, { interpretacao: { tipo: 'consulta' }, modelo: 'gemini-3.1-flash-lite', reserva: false })),
    { tipo: 'ok', bruto: { tipo: 'consulta' }, reserva: false });
  assert.deepEqual(await pedirInterpretacao('p', carga, 't', sinal, resp(503, { erro: 'provedor_sobrecarregado' })),
    { tipo: 'falha', codigo: 'provedor_sobrecarregado' });
  assert.deepEqual(await pedirInterpretacao('p', carga, 't', sinal, resp(503, { erro: 'ia_desabilitada' })), { tipo: 'desligada' });
  assert.equal(ROTULO_ORIGEM.ia_reserva, 'Interpretado por IA (modelo reserva)');
});
