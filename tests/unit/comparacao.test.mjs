// Casos de referência da comparação (plano 008, T8): CP-1 a CP-17 e CM-1 a CM-6. Os valores esperados foram escritos à
// mão a partir das fixtures fictícias abaixo e de tests/fixtures/comparacao/referencia.json, antes do comparador; nenhum
// é gerado pela função sob teste. Cada lado é calculado pelas lentes de produção, sem cópia de fórmula.
// CP-18 (IA contextual) pertence aos itens 2 e 3 e não é exercitado aqui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  compararMunicipios, compararPeriodos, concluir, conferirIdentidade, conferirZero, contextoCombinacao, contextoConcentracao,
  disponibilidadePorMunicipio, ErroComparacao, leiturasDeDisponibilidade, RESSALVA_ABSOLUTA, RESSALVA_DIVISA, RESSALVA_MESES,
  textoDisponibilidadeMunicipio, unidadesDe, validarMunicipios, validarPeriodos, VERSAO_COMPARACAO,
} from '../../src/comparacao.ts';
import { concentracao } from '../../src/lentes/concentracao.ts';
import { persistencia, RESSALVA_BORDA } from '../../src/lentes/persistencia.ts';
import { recorrencia } from '../../src/lentes/recorrencia.ts';
import { combinar } from '../../src/lentes/combinacao.ts';
import { sobreposicao } from '../../src/lentes/sobreposicao.ts';
import { qualificar } from '../../src/lentes/comum.ts';
import { diasDaJanela } from '../../src/lentes/cobertura.ts';
import { emParalelo, lerRegistros, LIMITE_PAGINA } from '../../src/lentes/carregar.ts';
import { ErroLente } from '../../src/lentes/contrato.ts';
import { ErroConsulta } from '../../src/erros.ts';
import { numerosMunicipio } from '../../src/municipios.ts';

const FX = JSON.parse(readFileSync(new URL('../fixtures/comparacao/referencia.json', import.meta.url), 'utf8'));
const CARGA = FX.carga;
const NOMES = new Map(Object.entries(FX.municipios).map(([c, n]) => [Number(c), n]));
const COLNIZA = 9908001;
const DELTA = 9908002;
const EPSILON = 9908003;
const id = (c) => FX.celulas[c].id;

let seq = 0;
/** Registro fictício na célula `c`, no dia GMT `dia`, do município `m`. */
const reg = (c, dia, m = COLNIZA, hora = '12') => {
  seq += 1;
  return { id_tecnico: `cp${String(seq).padStart(5, '0')}`, data_hora_gmt: `${dia}T${hora}:00:00Z`, latitude: FX.celulas[c].lat, longitude: FX.celulas[c].lon, municipio_codigo: m };
};
const dias = (mes, ...ds) => ds.map((d) => `${mes}-${String(d).padStart(2, '0')}`);
const entrada = (janela, registros, municipio = null) => ({
  carga: CARGA, janela, registros, totalResumo: registros.length, nomes: NOMES,
  recorte: municipio === null ? { tipo: 'estado', municipio: null } : { tipo: 'municipio', municipio },
});

/** Disponibilidade de um município na janela: `classe(dia, i)` dá a classe do i-ésimo dia. */
function disp(janela, classe = () => 'sem_evidencia_de_lacuna') {
  const m = new Map();
  diasDaJanela(janela).forEach((dia, i) => m.set(dia, { dia, classe: classe(dia, i), motivos: [] }));
  return { estado: 'ok', dias: m };
}

const A10 = { inicio: '2026-10-01', fim: '2026-10-10' };
const B10 = { inicio: '2026-10-11', fim: '2026-10-20' };
const NADA = { estado: 'nao_necessaria' };
const lado = (janela, resultado, zero = NADA) => ({ janela, total: resultado?.conferencia.registros_lidos ?? 0, resultado, zero });
const classes = (c) => c.itens.map((i) => [i.unidade.tipo === 'municipio' ? i.unidade.codigo : i.unidade.id, i.classificacao]);

// --- T1: pedidos ---------------------------------------------------------------------------------------------------

test('CP-3: janelas 10/11 dias, fora da carga, cargas, parâmetros e recortes divergentes são recusados', () => {
  assert.throws(() => validarPeriodos(FX.janela_carga, A10, { inicio: '2026-10-11', fim: '2026-10-21' }),
    (e) => e instanceof ErroComparacao && /mesmo número de dias GMT \(A tem 10, B tem 11\)/.test(e.message));
  assert.throws(() => validarPeriodos(FX.janela_carga, A10, { inicio: '2027-01-01', fim: '2027-01-10' }), /fora da versão/);
  assert.throws(() => validarPeriodos(FX.janela_carga, A10, { inicio: '2026-10-20', fim: '2026-10-11' }), /início depois do fim/);
  assert.throws(() => validarPeriodos(FX.janela_carga, A10, { inicio: '2026-02-30', fim: '2026-03-10' }), /data inválida/);
  const ra = persistencia(entrada(A10, [reg('c1', '2026-10-02')]));
  const outraCarga = persistencia({ ...entrada(B10, [reg('c1', '2026-10-12')]), carga: FX.outra_carga });
  const outraLente = recorrencia(entrada(B10, [reg('c1', '2026-10-12')]));
  const outroRecorte = persistencia(entrada(B10, [reg('c1', '2026-10-12')], COLNIZA));
  for (const rb of [outraCarga, outraLente, outroRecorte]) {
    assert.throws(() => conferirIdentidade('temporal', ra, rb), ErroComparacao);
    assert.throws(() => compararPeriodos(lado(A10, ra), lado(B10, rb), validarPeriodos(FX.janela_carga, A10, B10)), ErroComparacao);
  }
  // Só um lado com lente também é recusado.
  assert.throws(() => compararPeriodos(lado(A10, ra), lado(B10, null), validarPeriodos(FX.janela_carga, A10, B10)), ErroComparacao);
});

test('CP-1: persistência — c1 saiu, c2 permaneceu, c3 entrou; evidências separadas por período', () => {
  const ra = persistencia(entrada(A10, [
    ...dias('2026-10', 2, 3, 4).map((d) => reg('c1', d)), ...dias('2026-10', 5, 6, 7).map((d) => reg('c2', d)),
  ]));
  const rb = persistencia(entrada(B10, [
    ...dias('2026-10', 12, 13, 14).map((d) => reg('c2', d)), ...dias('2026-10', 15, 16, 17).map((d) => reg('c3', d)),
  ]));
  const c = compararPeriodos(lado(A10, ra), lado(B10, rb), validarPeriodos(FX.janela_carga, A10, B10));
  assert.equal(c.versao, 'comparacao-008-v1');
  assert.equal(VERSAO_COMPARACAO, 'comparacao-008-v1');
  assert.deepEqual(c.conclusao, { estado: 'conclusiva' });
  assert.deepEqual(classes(c), [[id('c1'), 'saiu'], [id('c2'), 'permaneceu'], [id('c3'), 'entrou']]);
  assert.deepEqual(c.contagem, { entrou: 1, saiu: 1, permaneceu: 1 });
  const c2 = c.itens[1];
  assert.deepEqual(c2.a.destaques.map((d) => d.datas), [['2026-10-05', '2026-10-06', '2026-10-07']]);
  assert.deepEqual(c2.b.destaques.map((d) => d.datas), [['2026-10-12', '2026-10-13', '2026-10-14']]);
  assert.equal(c.diferencaTotal, 0);
  assert.equal(c.itens[0].disponibilidadeB.estado, 'nao_avaliavel');
  assert.equal(c.itens[2].disponibilidadeA.estado, 'nao_avaliavel');
});

test('CP-2: duas sequências em c1 em A e uma em B — uma célula permaneceu, sequências preservadas', () => {
  const ra = persistencia(entrada(A10, [...dias('2026-10', 2, 3, 4, 6, 7, 8).map((d) => reg('c1', d))]));
  const rb = persistencia(entrada(B10, [...dias('2026-10', 12, 13, 14, 15).map((d) => reg('c1', d))]));
  assert.equal(ra.destaques.length, 2);
  const c = compararPeriodos(lado(A10, ra), lado(B10, rb), validarPeriodos(FX.janela_carga, A10, B10));
  assert.deepEqual(classes(c), [[id('c1'), 'permaneceu']]);
  const [item] = c.itens;
  assert.deepEqual(item.a.destaques.map((d) => d.datas.length), [3, 3]);
  assert.deepEqual(item.b.destaques.map((d) => d.datas.length), [4]);
  // As identidades dos destaques diferem (incluem a data inicial); a unidade é a mesma.
  assert.notEqual(item.a.destaques[0].id_destaque, item.b.destaques[0].id_destaque);
});

// --- T3: zero, ausência e disponibilidade --------------------------------------------------------------------------

test('CP-4: zero íntegro sem lacuna preserva o zero; zero com lacuna em todos os dias do município fica indisponível; zero com indeterminados não infere ausência', () => {
  const ra = persistencia(entrada(A10, dias('2026-10', 2, 3, 4).map((d) => reg('c1', d)), COLNIZA));
  const rb = persistencia(entrada(B10, [], COLNIZA));
  const v = validarPeriodos(FX.janela_carga, A10, B10);
  const zero = (classe) => conferirZero([COLNIZA], B10, new Map([[COLNIZA, disp(B10, classe)]]));

  const integro = compararPeriodos(lado(A10, ra), lado(B10, rb, zero()), v);
  assert.deepEqual(integro.conclusao, { estado: 'conclusiva' });
  assert.deepEqual(classes(integro), [[id('c1'), 'saiu']]);
  assert.equal(integro.b.total, 0);
  assert.ok(integro.ressalvas.includes('Lado B: zero detecção observada; não é evidência de ausência de fogo nem, sozinho, de ausência de dados.'));
  assert.ok(!integro.ressalvas.some((r) => r.includes('o zero não indica ausência real')));

  const lacuna = compararPeriodos(lado(A10, ra), lado(B10, rb, zero(() => 'lacuna_conhecida')), v);
  assert.equal(lacuna.conclusao.estado, 'indisponivel');
  assert.equal(lacuna.conclusao.motivo, 'lacuna_total');
  assert.deepEqual(lacuna.itens, []);
  assert.equal(lacuna.diferencaTotal, null);
  // Fatos observados continuam separados.
  assert.equal(lacuna.a.unidades.length, 1);
  assert.equal(lacuna.b.total, 0);

  const indeterminado = compararPeriodos(lado(A10, ra), lado(B10, rb, zero((_, i) => (i < 3 ? 'incidencia_indeterminada' : 'sem_evidencia_de_lacuna'))), v);
  assert.deepEqual(indeterminado.conclusao, { estado: 'conclusiva' });
  assert.ok(indeterminado.ressalvas.includes('Lado B: há dias com lacuna conhecida ou incidência indeterminada; o zero não indica ausência real.'));
});

test('CP-5: página duplicada, total divergente e versão retirada não produzem lado parcial nem zero', async () => {
  const pedido = { carga: CARGA.id, janela: A10, municipio: null };
  const resumo = (total) => ({ carga: { id: CARGA.id }, periodo: { inicio: A10.inicio, fim: A10.fim }, municipio: null, principal: { total } });
  const pagina = (registros, total, deslocamento) => ({
    carga: { id: CARGA.id }, periodo: { inicio: A10.inicio, fim: A10.fim }, municipio: null, total, limite: LIMITE_PAGINA, deslocamento, registros,
  });
  const r1 = reg('c1', '2026-10-02');
  const duplicada = { resumo: async () => resumo(2), pagina: async (_f, _l, d) => pagina([r1, r1], 2, d), disponibilidade: async () => { throw new Error('não usado'); } };
  await assert.rejects(lerRegistros(duplicada, pedido, () => true), ErroLente);
  const divergente = { ...duplicada, resumo: async () => resumo(3), pagina: async (_f, _l, d) => pagina([r1], 1, d) };
  await assert.rejects(lerRegistros(divergente, pedido, () => true), ErroLente);
  const retirada = { ...duplicada, resumo: async () => { throw new ErroConsulta('versao_substituida', 'carga_indisponivel'); } };
  await assert.rejects(lerRegistros(retirada, pedido, () => true), (e) => e instanceof ErroConsulta && e.tipo === 'versao_substituida');
});

test('CP-6: recorrência com A tocando 3 meses e B só 2 (40 dias cada) — indisponível por janela insuficiente de B, sem saída', () => {
  const a = { inicio: '2026-08-25', fim: '2026-10-03' };
  const b = { inicio: '2026-09-01', fim: '2026-10-10' };
  const v = validarPeriodos(FX.janela_carga, a, b);
  assert.equal(v.dias, 40);
  const ra = recorrencia(entrada(a, ['2026-08-26', '2026-09-10', '2026-10-02'].map((d) => reg('c1', d))));
  const rb = recorrencia(entrada(b, ['2026-09-10', '2026-10-02'].map((d) => reg('c1', d))));
  assert.equal(ra.estado, 'com_destaques');
  assert.equal(rb.estado, 'janela_insuficiente');
  const c = compararPeriodos(lado(a, ra), lado(b, rb), v);
  assert.equal(c.conclusao.estado, 'indisponivel');
  assert.equal(c.conclusao.motivo, 'aplicacao_indisponivel');
  assert.deepEqual(c.conclusao.textos, ['Lado B: A janela toca 2 meses GMT; a recorrência exige pelo menos 3.']);
  assert.deepEqual(c.itens, []);
  assert.deepEqual(c.contagem, { entrou: 0, saiu: 0, permaneceu: 0 });
});

test('CP-7: persistência com sequência na borda e lacuna vizinha — resultado original e ressalvas preservados', () => {
  const ra = persistencia(entrada(A10, dias('2026-10', 1, 2, 3).map((d) => reg('c1', d))));
  const qa = qualificar(ra, new Map([[COLNIZA, disp(A10, (dia) => (dia === '2026-10-04' ? 'lacuna_conhecida' : 'sem_evidencia_de_lacuna'))]]));
  const rb = persistencia(entrada(B10, dias('2026-10', 11, 12, 13).map((d) => reg('c1', d))));
  const c = compararPeriodos(lado(A10, qa), lado(B10, rb), validarPeriodos(FX.janela_carga, A10, B10));
  const [item] = c.itens;
  assert.equal(item.classificacao, 'permaneceu');
  assert.deepEqual(item.a.destaques[0].ressalvas, [RESSALVA_BORDA, 'adjacente a dia com lacuna conhecida (04/10); pode ser mais longa']);
  assert.deepEqual(item.b.destaques[0].ressalvas, [RESSALVA_BORDA]);
  assert.equal(item.disponibilidadeA.estado, 'avaliada');
  assert.equal(item.disponibilidadeA.cobertura.dias_sem_evidencia_de_lacuna, 9);
});

/** `n` registros do município `m` em dias distintos de A10/B10 (`base` = primeiro dia). */
const lote = (m, n, base) => Array.from({ length: n }, (_, i) => reg('c1', `2026-10-${String(base + (i % 10)).padStart(2, '0')}`, m, String(10 + Math.floor(i / 10)).padStart(2, '0')));

test('CP-8: concentração com empate no décimo e corte diferente por período — classificação pelo município', () => {
  // Municípios fictícios 9909001..9909012. A: 9 com 30..22, 9909010 e 9909011 com 10 (empate no 10º) → 11 destacados, corte 10.
  // B: os 9 primeiros iguais, 9909010 com 5, 9909011 com 4, 9909012 com 8 → 10 destacados, corte 8.
  const cod = (i) => 9909000 + i;
  const regsA = [...Array.from({ length: 9 }, (_, i) => lote(cod(i + 1), 30 - i, 1)).flat(), ...lote(cod(10), 10, 1), ...lote(cod(11), 10, 1)];
  const regsB = [...Array.from({ length: 9 }, (_, i) => lote(cod(i + 1), 30 - i, 11)).flat(), ...lote(cod(10), 5, 11), ...lote(cod(11), 4, 11), ...lote(cod(12), 8, 11)];
  const ra = concentracao(entrada(A10, regsA));
  const rb = concentracao(entrada(B10, regsB));
  assert.equal(ra.destaques.length, 11);
  assert.equal(rb.destaques.length, 10);
  const c = compararPeriodos(lado(A10, ra), lado(B10, rb), validarPeriodos(FX.janela_carga, A10, B10));
  const esperado = [
    ...Array.from({ length: 9 }, (_, i) => [cod(i + 1), 'permaneceu']), [cod(10), 'saiu'], [cod(11), 'saiu'], [cod(12), 'entrou'],
  ];
  assert.deepEqual(classes(c), esperado);
  assert.equal(c.itens[9].a.destaques[0].deteccoes.length, 10);
  assert.deepEqual(ra.observacoes, ['11 municípios por empate no 10º lugar.']);
});

test('CP-9: combinação e sobreposição — configuração igual compara campo a campo; divergente é recusada', () => {
  const regs = (base) => [...dias('2026-10', base, base + 1, base + 2).map((d) => reg('c1', d)), ...dias('2026-10', base, base + 1, base + 2).map((d) => reg('c2', d))];
  const ea = entrada(A10, regs(2));
  const eb = entrada(B10, regs(12));
  const ca = combinar(ea, ['concentracao', 'persistencia'], 'e');
  const cb = combinar(eb, ['concentracao', 'persistencia'], 'e');
  const c = compararPeriodos(lado(A10, ca), lado(B10, cb), validarPeriodos(FX.janela_carga, A10, B10));
  // Igualdade com a aplicação isolada.
  assert.deepEqual(c.a.unidades, unidadesDe(combinar(ea, ['concentracao', 'persistencia'], 'e')));
  assert.deepEqual(classes(c), [[id('c2'), 'permaneceu'], [id('c1'), 'permaneceu']]);
  assert.throws(() => conferirIdentidade('temporal', ca, combinar(eb, ['concentracao', 'persistencia'], 'ou')), /lente, versão ou parâmetros/);
  assert.throws(() => conferirIdentidade('temporal', ca, combinar(eb, ['concentracao', 'recorrencia'], 'e')), ErroComparacao);

  const fx = JSON.parse(readFileSync(new URL('../fixtures/lentes/sobreposicao.json', import.meta.url), 'utf8'));
  const carga = { id: 7, identidade: 'a'.repeat(64) };
  const camada = {
    estado: 'completa', carga: { ...carga, total_areas: fx.areas.length, total_vinculos_area: fx.vinculos.length },
    areas: fx.areas.map((a) => ({ carga_id: 7, ...a })),
    vinculos: fx.vinculos.map(([id_tecnico, area_fonte, area_codigo, posicao]) => ({ carga_id: 7, id_tecnico, area_fonte, area_codigo, posicao })),
  };
  const es = {
    carga, janela: fx.janela, nomes: new Map(), recorte: { tipo: 'estado', municipio: null },
    registros: fx.registros.map(([id_tecnico, data_hora_gmt, celula, municipio_codigo]) => ({ id_tecnico, data_hora_gmt, latitude: fx.celulas[celula].lat, longitude: fx.celulas[celula].lon, municipio_codigo }))
      .filter((r) => r.data_hora_gmt >= `${fx.janela.inicio}T00:00:00Z` && r.data_hora_gmt.slice(0, 10) <= fx.janela.fim),
  };
  es.totalResumo = es.registros.length;
  const sa = sobreposicao(es, camada, 'protecao_integral');
  const sb = sobreposicao(es, camada, 'protecao_integral');
  const vs = validarPeriodos(fx.janela, fx.janela, fx.janela);
  const cs = compararPeriodos(lado(fx.janela, sa), lado(fx.janela, sb), vs);
  assert.ok(cs.itens.length > 0);
  assert.ok(cs.itens.every((i) => i.classificacao === 'permaneceu'));
  assert.throws(() => conferirIdentidade('temporal', sa, sobreposicao(es, camada, 'terra_indigena')), ErroComparacao);
});

test('CP-10: célula destacada em A (Colniza), B zero com 4/10 dias indeterminados — saiu, B não avaliável, seção municipal separada', () => {
  const ra = persistencia(entrada(A10, dias('2026-10', 4, 5, 6).map((d) => reg('c1', d)), COLNIZA));
  const rb = persistencia(entrada(B10, [], COLNIZA));
  const dispB = new Map([[COLNIZA, disp(B10, (_, i) => (i < 4 ? 'incidencia_indeterminada' : 'sem_evidencia_de_lacuna'))]]);
  const c = compararPeriodos(lado(A10, ra), lado(B10, rb, conferirZero([COLNIZA], B10, dispB)), validarPeriodos(FX.janela_carga, A10, B10));
  assert.deepEqual(classes(c), [[id('c1'), 'saiu']]);
  assert.deepEqual(c.itens[0].disponibilidadeB, { estado: 'nao_avaliavel' });
  const [linha] = disponibilidadePorMunicipio([COLNIZA], B10, dispB);
  assert.equal(textoDisponibilidadeMunicipio(linha), '6 de 10 dias sem evidência de lacuna, 4 com incidência indeterminada (cobertura não comprovada)');
  assert.ok(!c.ressalvas.some((r) => /desaparec|redução/.test(r)));
});

test('CP-11: 9/10 dias de lacuna mantém a classificação observada com limite; 10/10 e zero no recorte torna a comparação indisponível', () => {
  const ra = persistencia(entrada(A10, dias('2026-10', 4, 5, 6).map((d) => reg('c1', d)), COLNIZA));
  const rb = persistencia(entrada(B10, [], COLNIZA));
  const v = validarPeriodos(FX.janela_carga, A10, B10);
  const nove = new Map([[COLNIZA, disp(B10, (_, i) => (i < 9 ? 'lacuna_conhecida' : 'sem_evidencia_de_lacuna'))]]);
  const c9 = compararPeriodos(lado(A10, ra), lado(B10, rb, conferirZero([COLNIZA], B10, nove)), v);
  assert.deepEqual(classes(c9), [[id('c1'), 'saiu']]);
  assert.ok(c9.ressalvas.includes('Lado B: há dias com lacuna conhecida ou incidência indeterminada; o zero não indica ausência real.'));
  const dez = new Map([[COLNIZA, disp(B10, () => 'lacuna_conhecida')]]);
  const c10 = compararPeriodos(lado(A10, ra), lado(B10, rb, conferirZero([COLNIZA], B10, dez)), v);
  assert.equal(c10.conclusao.motivo, 'lacuna_total');
  assert.deepEqual(c10.itens, []);
  assert.equal(c10.b.total, 0);
});

/** 142 municípios fictícios (9901000..9901141), com Colniza fictício em 9901000. */
const ESTADO = Array.from({ length: 142 }, (_, i) => 9901000 + i);

test('CP-12: B estadual sem detecção em c1, 142 municípios com disponibilidade mista — célula não avaliável, sem agregação', () => {
  const ra = persistencia(entrada(A10, dias('2026-10', 4, 5, 6).map((d) => reg('c1', d, ESTADO[0]))));
  const rb = persistencia(entrada(B10, dias('2026-10', 14, 15, 16).map((d) => reg('c3', d, ESTADO[5]))));
  const c = compararPeriodos(lado(A10, ra), lado(B10, rb), validarPeriodos(FX.janela_carga, A10, B10));
  assert.deepEqual(classes(c), [[id('c1'), 'saiu'], [id('c3'), 'entrou']]);
  assert.deepEqual(c.itens[0].disponibilidadeB, { estado: 'nao_avaliavel' });
  const dispB = new Map(ESTADO.map((m, i) => [m, disp(B10, (_, d) => (i === 0 ? 'lacuna_conhecida' : i % 3 === 0 && d === 0 ? 'incidencia_indeterminada' : 'sem_evidencia_de_lacuna'))]));
  const linhas = disponibilidadePorMunicipio(ESTADO, B10, dispB);
  assert.equal(linhas.length, 142);
  assert.equal(linhas[0].indisponivel, true);
  assert.equal(linhas.filter((l) => l.indisponivel).length, 1);
  assert.deepEqual(linhas[3].porClasse, { sem_evidencia_de_lacuna: 9, incidencia_indeterminada: 1, lacuna_conhecida: 0 });
  // Colniza indisponível individualmente não torna o estado indisponível.
  assert.deepEqual(conferirZero(ESTADO, B10, dispB), { estado: 'completa', lacunaTotal: false, diasRestritivos: true });
});

test('CP-13: B estadual zero com 10/10 dias de lacuna nos 142 municípios — indisponível; invertendo A/B também (sem entrada)', () => {
  const ra = persistencia(entrada(A10, dias('2026-10', 4, 5, 6).map((d) => reg('c1', d, ESTADO[0]))));
  const rb = persistencia(entrada(B10, []));
  const lacuna = new Map(ESTADO.map((m) => [m, disp(B10, () => 'lacuna_conhecida')]));
  const zero = conferirZero(ESTADO, B10, lacuna);
  assert.deepEqual(zero, { estado: 'completa', lacunaTotal: true, diasRestritivos: true });
  const v = validarPeriodos(FX.janela_carga, A10, B10);
  const c = compararPeriodos(lado(A10, ra), lado(B10, rb, zero), v);
  assert.equal(c.conclusao.motivo, 'lacuna_total');
  assert.equal(c.contagem.saiu, 0);
  const lacunaA = new Map(ESTADO.map((m) => [m, disp(A10, () => 'lacuna_conhecida')]));
  const invertido = compararPeriodos(lado(A10, persistencia(entrada(A10, [])), conferirZero(ESTADO, A10, lacunaA)),
    lado(B10, persistencia(entrada(B10, dias('2026-10', 14, 15, 16).map((d) => reg('c1', d, ESTADO[0]))))), v);
  assert.equal(invertido.conclusao.motivo, 'lacuna_total');
  assert.equal(invertido.contagem.entrou, 0);
});

test('CP-14: janelas idênticas só permanecem com diferença zero; janelas com 5 dias em comum são aplicações independentes', () => {
  const regs = dias('2026-10', 4, 5, 6, 7).map((d) => reg('c1', d));
  const v = validarPeriodos(FX.janela_carga, A10, A10);
  assert.deepEqual(v, { dias: 10, diasEmComum: diasDaJanela(A10), coincidentes: true });
  const c = compararPeriodos(lado(A10, persistencia(entrada(A10, regs))), lado(A10, persistencia(entrada(A10, regs))), v);
  assert.deepEqual(classes(c), [[id('c1'), 'permaneceu']]);
  assert.equal(c.diferencaTotal, 0);
  assert.ok(c.ressalvas.includes('Períodos idênticos: os dois lados usam os mesmos dados.'));

  const b = { inicio: '2026-10-06', fim: '2026-10-15' };
  const vs = validarPeriodos(FX.janela_carga, A10, b);
  assert.deepEqual(vs.diasEmComum, ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10']);
  assert.equal(vs.coincidentes, false);
  const ra = persistencia(entrada(A10, regs));
  const rb = persistencia(entrada(b, dias('2026-10', 6, 7).map((d) => reg('c1', d))));
  const cs = compararPeriodos(lado(A10, ra), lado(b, rb), vs);
  assert.equal(cs.a.total, 4);
  assert.equal(cs.b.total, 2);
  assert.equal(cs.diferencaTotal, -2);
  assert.deepEqual(classes(cs), [[id('c1'), 'saiu']]);
  assert.ok(cs.ressalvas.includes('Os períodos compartilham 5 dias (06/10/2026 a 10/10/2026); cada lado é uma aplicação independente e as contagens não se somam.'));
});

test('CP-15: recorrência em 90 dias tocando 3 e 4 meses — ambas suficientes, 3/4, meses parciais e ressalva de calendário', () => {
  const a = { inicio: '2025-11-01', fim: '2026-01-29' };
  const b = { inicio: '2025-11-15', fim: '2026-02-12' };
  const v = validarPeriodos(FX.janela_carga, a, b);
  assert.equal(v.dias, 90);
  const ra = recorrencia(entrada(a, ['2025-11-20', '2025-12-10', '2026-01-10'].map((d) => reg('c1', d))));
  const rb = recorrencia(entrada(b, ['2025-11-20', '2025-12-10', '2026-01-10', '2026-02-05'].map((d) => reg('c1', d))));
  const c = compararPeriodos(lado(a, ra), lado(b, rb), v);
  assert.deepEqual(classes(c), [[id('c1'), 'permaneceu']]);
  assert.equal(ra.destaques[0].evidencia.valor, 3);
  assert.equal(rb.destaques[0].evidencia.valor, 4);
  assert.deepEqual(c.meses.a.map((m) => [m.mes, m.parcial]), [['2025-11', false], ['2025-12', false], ['2026-01', true]]);
  assert.deepEqual(c.meses.b.map((m) => [m.mes, m.parcial]), [['2025-11', true], ['2025-12', false], ['2026-01', false], ['2026-02', true]]);
  assert.ok(c.ressalvas.includes(RESSALVA_MESES));
});

test('CP-16: resultado inicial lê só os municípios dos destaques; a lista completa lê 284 com concorrência global 4', async () => {
  const lados = [
    { lado: 'A', destaques: [ESTADO[1], ESTADO[2]], zero: false, lidos: new Set() },
    { lado: 'B', destaques: [ESTADO[2], ESTADO[3]], zero: false, lidos: new Set() },
  ];
  const inicial = leiturasDeDisponibilidade(lados, ESTADO, false);
  assert.equal(inicial.length, 4);
  const completa = leiturasDeDisponibilidade(lados, ESTADO, true);
  assert.equal(completa.length, 284);
  let emVoo = 0;
  let maximo = 0;
  let feitos = 0;
  await emParalelo(completa, 4, () => true, async () => {
    emVoo += 1;
    maximo = Math.max(maximo, emVoo);
    await new Promise((r) => setTimeout(r, 1));
    emVoo -= 1;
    feitos += 1;
  });
  assert.equal(feitos, 284);
  assert.equal(maximo, 4);
  // Já lidos não são repetidos.
  assert.equal(leiturasDeDisponibilidade([{ ...lados[0], lidos: new Set(ESTADO) }], ESTADO, true).length, 0);
});

test('CP-17: lado estadual zero confere 142 (ambos zero, 284); cancelar ou falhar no 142º não conclui nem prova lacuna', async () => {
  const um = leiturasDeDisponibilidade([
    { lado: 'A', destaques: [ESTADO[1]], zero: false, lidos: new Set() }, { lado: 'B', destaques: [], zero: true, lidos: new Set() },
  ], ESTADO, false);
  assert.equal(um.filter((x) => x.lado === 'B').length, 142);
  const ambos = leiturasDeDisponibilidade([
    { lado: 'A', destaques: [], zero: true, lidos: new Set() }, { lado: 'B', destaques: [], zero: true, lidos: new Set() },
  ], ESTADO, false);
  assert.equal(ambos.length, 284);

  // Cancelamento depois de 141 respostas: a 142ª nunca chega.
  const lidos = new Map();
  let ativo = true;
  await emParalelo(ESTADO, 4, () => ativo, async (m) => {
    if (lidos.size >= 141) { ativo = false; return; }
    lidos.set(m, disp(B10, () => 'lacuna_conhecida'));
  });
  const pendente = conferirZero(ESTADO, B10, lidos);
  assert.deepEqual(pendente, { estado: 'pendente', feitos: 141, total: 142 });
  const ra = persistencia(entrada(A10, dias('2026-10', 4, 5, 6).map((d) => reg('c1', d, ESTADO[0]))));
  const rb = persistencia(entrada(B10, []));
  const v = validarPeriodos(FX.janela_carga, A10, B10);
  const aguardando = compararPeriodos(lado(A10, ra), lado(B10, rb, pendente), v);
  assert.deepEqual(aguardando.conclusao, { estado: 'aguardando_disponibilidade', lados: ['B'] });
  assert.deepEqual(aguardando.itens, []);
  assert.equal(aguardando.diferencaTotal, null);
  const cancelada = compararPeriodos(lado(A10, ra), lado(B10, rb, { estado: 'cancelada' }), v);
  assert.equal(cancelada.conclusao.motivo, 'falha_conferencia');
  const falha = new Map(lidos);
  falha.set(ESTADO[141], { estado: 'falha', motivo: 'fonte indisponível' });
  const comFalha = compararPeriodos(lado(A10, ra), lado(B10, rb, conferirZero(ESTADO, B10, falha)), v);
  assert.equal(comFalha.conclusao.motivo, 'falha_conferencia');
  assert.notEqual(comFalha.conclusao.motivo, 'lacuna_total');
  // Precedência: lacuna total comprovada num lado vence a pendência do outro.
  assert.equal(concluir([{ lado: 'A', resultado: null, zero: { estado: 'completa', lacunaTotal: true, diasRestritivos: true } },
    { lado: 'B', resultado: null, zero: pendente }]).motivo, 'lacuna_total');
});

// --- T2: comparação de municípios ----------------------------------------------------------------------------------

/** Resumo mínimo do recorte municipal (só os campos que `numerosMunicipio` usa). */
const resumoDe = (municipio, janela, registros) => {
  const porDia = new Map();
  for (const r of registros) porDia.set(r.data_hora_gmt.slice(0, 10), (porDia.get(r.data_hora_gmt.slice(0, 10)) ?? 0) + 1);
  return {
    municipio, periodo: janela,
    principal: { total: registros.length, serie_diaria: diasDaJanela(janela).map((dia) => ({ dia, total: porDia.get(dia) ?? 0 })) },
  };
};
const ladoMunicipal = (codigo, registros, janela = A10) => ({
  codigo, nome: NOMES.get(codigo), numeros: numerosMunicipio(resumoDe(codigo, janela, registros), registros),
  resultado: persistencia(entrada(janela, registros, codigo)), zero: NADA,
});

test('CM-1: municípios com 20/40 detecções, 4/5 dias e 3/6 células — números e B−A sem taxa', () => {
  // A: 20 detecções em 4 dias (5 por dia), em c1..c3. B: 40 detecções em 5 dias (8 por dia), em c1..c6.
  const regsA = dias('2026-10', 1, 3, 5, 7).flatMap((d) => Array.from({ length: 5 }, (_, i) => reg(['c1', 'c2', 'c3'][i % 3], d, COLNIZA, String(10 + i))));
  const regsB = dias('2026-10', 1, 3, 5, 7, 9).flatMap((d) => Array.from({ length: 8 }, (_, i) => reg(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'][i % 6], d, DELTA, String(10 + i))));
  const c = compararMunicipios(A10, ladoMunicipal(COLNIZA, regsA), ladoMunicipal(DELTA, regsB));
  assert.deepEqual(c.a.numeros, { focos: 20, dias: 4, celulas: 3 });
  assert.deepEqual(c.b.numeros, { focos: 40, dias: 5, celulas: 6 });
  assert.deepEqual(c.diferenca, { focos: 20, dias: 1, celulas: 3 });
  assert.equal(c.ressalvas[0], RESSALVA_ABSOLUTA);
  assert.ok(!JSON.stringify(c).match(/taxa por|gravidade alta|causa provável/));
});

test('CM-2: célula de divisa — A nos dias 1/2 e B no dia 3: 2/1 dias, 1/1 célula, nenhuma sequência; sem persistência estadual', () => {
  const regsA = dias('2026-10', 1, 2).map((d) => reg('divisa', d, COLNIZA));
  const regsB = dias('2026-10', 3).map((d) => reg('divisa', d, DELTA));
  const c = compararMunicipios(A10, ladoMunicipal(COLNIZA, regsA), ladoMunicipal(DELTA, regsB));
  assert.deepEqual(c.a.numeros, { focos: 2, dias: 2, celulas: 1 });
  assert.deepEqual(c.b.numeros, { focos: 1, dias: 1, celulas: 1 });
  assert.equal(c.a.unidades.length, 0);
  assert.equal(c.b.unidades.length, 0);
  assert.deepEqual(c.itens, []);
  assert.ok(c.ressalvas.includes(RESSALVA_DIVISA));
  // Aplicação estadual independente teria 1 sequência de 3 dias — não faz parte da operação municipal.
  assert.equal(persistencia(entrada(A10, [...regsA, ...regsB])).destaques.length, 1);
});

test('CM-2b: célula de divisa destacada nos dois municípios não é somada como célula única', () => {
  const regsA = dias('2026-10', 1, 2, 3).map((d) => reg('divisa', d, COLNIZA));
  const regsB = dias('2026-10', 5, 6, 7).map((d) => reg('divisa', d, DELTA));
  const c = compararMunicipios(A10, ladoMunicipal(COLNIZA, regsA), ladoMunicipal(DELTA, regsB));
  assert.deepEqual(c.itens.map((i) => [i.unidade.id, i.presenca]), [[id('divisa'), 'nos_dois']]);
  assert.notDeepEqual(c.itens[0].a.destaques[0].deteccoes, c.itens[0].b.destaques[0].deteccoes);
});

test('CM-3: dois municípios fora do top 10 estadual não são destacados por recomputar o top 10 sobre o par', () => {
  const cod = (i) => 9909100 + i;
  const regs = [...Array.from({ length: 10 }, (_, i) => lote(cod(i), 20 - i, 1)).flat(), ...lote(COLNIZA, 3, 1), ...lote(DELTA, 2, 1)];
  const r = concentracao(entrada(A10, regs));
  const contagens = new Map();
  for (const x of regs) contagens.set(x.municipio_codigo, (contagens.get(x.municipio_codigo) ?? 0) + 1);
  const ctx = contextoConcentracao(r, contagens, [{ lado: 'A', codigo: COLNIZA, nome: 'A' }, { lado: 'B', codigo: DELTA, nome: 'B' }]);
  assert.equal(ctx.corte, 11);
  assert.equal(ctx.destacados, 10);
  assert.deepEqual(ctx.municipios.map((m) => [m.codigo, m.total, m.posicao]), [[COLNIZA, 3, null], [DELTA, 2, null]]);
});

test('CM-4: disponibilidade distinta entre os municípios — duas qualificações preservadas, sem causa', () => {
  const dispMap = new Map([
    [COLNIZA, disp(A10, (_, i) => (i < 2 ? 'lacuna_conhecida' : 'sem_evidencia_de_lacuna'))],
    [DELTA, disp(A10, (_, i) => (i < 3 ? 'incidencia_indeterminada' : 'sem_evidencia_de_lacuna'))],
  ]);
  const [a, b] = disponibilidadePorMunicipio([COLNIZA, DELTA], A10, dispMap);
  assert.equal(textoDisponibilidadeMunicipio(a), '8 de 10 dias sem evidência de lacuna, 2 com lacuna conhecida (cobertura não comprovada)');
  assert.equal(textoDisponibilidadeMunicipio(b), '7 de 10 dias sem evidência de lacuna, 3 com incidência indeterminada (cobertura não comprovada)');
});

test('CM-5: o mesmo município nos dois lados — resultado idêntico, diferença zero e explicação da seleção repetida', () => {
  const regs = dias('2026-10', 1, 2, 3).map((d) => reg('c1', d, EPSILON));
  const c = compararMunicipios(A10, ladoMunicipal(EPSILON, regs), ladoMunicipal(EPSILON, regs));
  assert.equal(c.mesmoMunicipio, true);
  assert.deepEqual(c.diferenca, { focos: 0, dias: 0, celulas: 0 });
  assert.ok(c.itens.every((i) => i.presenca === 'nos_dois'));
  assert.equal(c.ressalvas[0], 'O mesmo município foi escolhido nos dois lados: resultados idênticos e diferença zero.');
  assert.deepEqual(validarMunicipios(EPSILON, EPSILON, new Set([EPSILON])), { mesmo: true });
  assert.throws(() => validarMunicipios(null, EPSILON, new Set([EPSILON])), ErroComparacao);
  assert.throws(() => validarMunicipios(EPSILON, 1, new Set([EPSILON])), /fora desta versão/);
});

test('CM-6: o contexto estadual exige a lente em todo Mato Grosso; nenhuma concentração com recorte municipal', () => {
  assert.throws(() => concentracao(entrada(A10, [reg('c1', '2026-10-02')], COLNIZA)), ErroLente);
  const municipal = persistencia(entrada(A10, [reg('c1', '2026-10-02')], COLNIZA));
  assert.throws(() => contextoConcentracao(municipal, new Map(), []), ErroComparacao);
  // Combinação com concentração em todo o estado: só as células com detecção de A ou B, sem mudar a seleção.
  const regs = [...dias('2026-10', 1, 2, 3).map((d) => reg('c1', d, COLNIZA)), ...dias('2026-10', 1, 2, 3).map((d) => reg('c2', d, EPSILON))];
  const r = combinar(entrada(A10, regs), ['concentracao', 'persistencia'], 'e');
  const ctx = contextoCombinacao(r, new Map(regs.map((x) => [x.id_tecnico, x])), [{ lado: 'A', codigo: COLNIZA }, { lado: 'B', codigo: DELTA }]);
  assert.equal(r.celulas.length, 2);
  assert.deepEqual(ctx.celulas.map((c) => [c.celula.unidade.id, c.lados]), [[id('c1'), ['A']]]);
});
