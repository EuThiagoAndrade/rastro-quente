// Casos de referência das lentes (plano 004, itens 1 a 3): C, G, L, V, E, X, R e P. Os valores esperados vêm das
// fixtures fictícias de tests/fixtures/lentes/ e do plano, escritos à mão; nenhum é gerado pelo código.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { concentracao } from '../../src/lentes/concentracao.ts';
import { recorrencia } from '../../src/lentes/recorrencia.ts';
import { persistencia } from '../../src/lentes/persistencia.ts';
import { qualificar, municipiosNecessarios, estadoQualificacao } from '../../src/lentes/comum.ts';
import { qualificarCobertura, ressalvasDeClasse, textoCobertura } from '../../src/lentes/cobertura.ts';
import { ErroLente } from '../../src/lentes/contrato.ts';
import { bordaGrade, celulaDe, ErroCoordenada, indiceGrade } from '../../src/lentes/grade.ts';
import {
  AcumuladorPaginas, LIMITE_PAGINA, destinoErro, lerRegistros, validarDisponibilidade, validarResumo,
} from '../../src/lentes/carregar.ts';

const fixture = (nome) => JSON.parse(readFileSync(new URL(`../fixtures/lentes/${nome}`, import.meta.url), 'utf8'));
const CARGA = { id: 7, identidade: 'f'.repeat(64) };

/** Registros fictícios: `n` detecções por município, em dias e horas distintos dentro da janela. */
function registros(municipios, janela) {
  const lista = [];
  for (const m of municipios) {
    for (let i = 0; i < m.deteccoes; i += 1) {
      const dia = String(1 + (i % 28)).padStart(2, '0');
      const mes = janela.inicio.slice(0, 7);
      lista.push({
        id_tecnico: `fx${m.codigo}:${String(i).padStart(4, '0')}`,
        data_hora_gmt: `${mes}-${dia}T${String(10 + (i % 10)).padStart(2, '0')}:00:00Z`,
        latitude: -12.5, longitude: -56.5, municipio_codigo: m.codigo,
      });
    }
  }
  return lista;
}

const entrada = (caso, janela, extra = {}) => {
  const regs = registros(caso.municipios, janela);
  return {
    carga: CARGA, janela, registros: regs, totalResumo: regs.length,
    nomes: new Map(caso.municipios.map((m) => [m.codigo, m.nome])), ...extra,
  };
};

// --- Concentração ----------------------------------------------------------------------------------

test('C-1, C-2 e C-5: corte com empatados, município sem detecção fora e ponto de entrada de produção (N=10)', () => {
  const { janela, casos } = fixture('concentracao.json');
  for (const caso of casos) {
    // C-5 não informa N: usa o ponto de entrada de produção.
    const r = caso.n === undefined ? concentracao(entrada(caso, janela)) : concentracao(entrada(caso, janela), caso.n);
    assert.deepEqual(r.destaques.map((d) => [d.unidade.codigo, d.evidencia.valor]), caso.esperado.destaques, caso.id);
    assert.deepEqual(r.observacoes, caso.esperado.observacoes, caso.id);
    assert.deepEqual(r.destaques.map((d) => d.ordem), caso.esperado.destaques.map((_, i) => i + 1), caso.id);
    assert.equal(r.ordenacao?.rotulo, 'ordenado por contagem de detecções, não por prioridade, gravidade ou risco');
    assert.equal(r.estado, 'com_destaques');
    for (const d of r.destaques) {
      assert.equal(d.evidencia.deteccoes.length, d.evidencia.valor, `${caso.id}: evidência = contagem`);
      assert.equal(d.cobertura.estado, 'pendente');
      assert.equal(d.id_destaque, `concentracao:municipio:${d.unidade.codigo}`);
    }
  }
});

test('C-3: borda da janela — 23:59:59Z do último dia entra; 00:00:00Z do dia seguinte é rejeitado', () => {
  const janela = { inicio: '2026-10-01', fim: '2026-10-31' };
  const base = { carga: CARGA, janela, nomes: new Map([[9910001, 'Fictício A']]) };
  const dentro = { id_tecnico: 'b1', data_hora_gmt: '2026-10-31T23:59:59Z', latitude: -12.5, longitude: -56.5, municipio_codigo: 9910001 };
  const fora = { ...dentro, id_tecnico: 'b2', data_hora_gmt: '2026-11-01T00:00:00Z' };
  const ok = concentracao({ ...base, registros: [dentro], totalResumo: 1 });
  assert.deepEqual(ok.destaques.map((d) => d.evidencia.valor), [1]);
  assert.throws(() => concentracao({ ...base, registros: [dentro, fora], totalResumo: 2 }), ErroLente);
});

test('C-4: conferência divergente (total do resumo ou ids repetidos) não produz resultado', () => {
  const { janela, casos } = fixture('concentracao.json');
  const e = entrada(casos[0], janela);
  assert.throws(() => concentracao({ ...e, totalResumo: e.totalResumo + 1 }), ErroLente);
  const repetido = [...e.registros, e.registros[0]];
  assert.throws(() => concentracao({ ...e, registros: repetido, totalResumo: repetido.length }), ErroLente);
});

// --- Grade T1 --------------------------------------------------------------------------------------

test('G-1: grade de 0,05° dos dois lados das bordas, com coordenadas negativas', () => {
  const sul = (lat) => celulaDe(lat, -56.5).sul;
  assert.equal(sul(-15.00), '-15.00');
  assert.equal(sul(-15.0499), '-15.05');
  assert.equal(sul(-15.05), '-15.05');
  assert.equal(sul(-15.0501), '-15.10');
  const oeste = (lon) => celulaDe(-12.5, lon).oeste;
  assert.equal(oeste(-56.05), '-56.05');
  assert.equal(oeste(-56.0500001), '-56.10');
  // Divisão em ponto flutuante daria -1120,9999999999998; o índice exato é -1121.
  assert.equal(indiceGrade(-56.05), -1121);
  assert.equal(bordaGrade(0), '0.00');
  assert.equal(bordaGrade(-1), '-0.05');
  assert.equal(celulaDe(-15.05, -56.05).norte, '-15.00');
  assert.equal(celulaDe(-15.05, -56.05).leste, '-56.00');
});

test('G-2: valor canônico; notação exponencial, não finito e mais de 15 algarismos são rejeitados', () => {
  assert.equal(celulaDe(-12.34567, -56.5).sul, '-12.35');
  for (const x of [1e-7, Number.NaN, 0.1 + 0.2]) assert.throws(() => indiceGrade(x), ErroCoordenada, String(x));
});

// --- Carregador ------------------------------------------------------------------------------------

const PEDIDO = { carga: 7, janela: { inicio: '2026-10-01', fim: '2026-10-31' } };
const cargaResumo = { id: 7, identidade: 'x', satelite: 'AQUA_M-T', janela_gmt: { inicio: '', fim: '' }, publicada_em: '' };
const periodo = { inicio: '2026-10-01', fim: '2026-10-31', referencia: 'dias GMT inclusivos' };

function pagina(regs, { total, deslocamento = 0, municipio = null, carga = 7, limite = LIMITE_PAGINA } = {}) {
  return { carga: { ...cargaResumo, id: carga }, periodo, municipio, total, limite, deslocamento, registros: regs };
}

function regsSeq(n, prefixo = 'r') {
  return Array.from({ length: n }, (_, i) => ({
    id_tecnico: `${prefixo}${String(i).padStart(5, '0')}`,
    data_hora_gmt: new Date(Date.UTC(2026, 9, 1, 0, 0, i)).toISOString().replace('.000Z', 'Z'),
    latitude: -12.5, longitude: -56.5, municipio_codigo: 9910001,
  }));
}

test('L-1: duas páginas com os mesmos 1.000 registros e total 2.000 → leitura inconsistente', () => {
  const acc = new AcumuladorPaginas(PEDIDO, 2000);
  const mil = regsSeq(1000);
  acc.adicionar(pagina(mil, { total: 2000 }), 0);
  assert.throws(() => acc.adicionar(pagina(mil, { total: 2000, deslocamento: 1000 }), 1000), ErroLente);
});

test('L-2: eco divergente (deslocamento, município ou carga) → leitura inconsistente', () => {
  const dez = regsSeq(10);
  assert.throws(() => new AcumuladorPaginas(PEDIDO, 10).adicionar(pagina(dez, { total: 10, deslocamento: 5 }), 0), ErroLente);
  assert.throws(() => new AcumuladorPaginas(PEDIDO, 10).adicionar(pagina(dez, { total: 10, municipio: 9910001 }), 0), ErroLente);
  assert.throws(() => new AcumuladorPaginas(PEDIDO, 10).adicionar(pagina(dez, { total: 10, carga: 8 }), 0), ErroLente);
  assert.throws(() => new AcumuladorPaginas(PEDIDO, 10).adicionar(pagina(dez, { total: 10, limite: 100 }), 0), ErroLente);
  // Ordem decrescente dentro da página também é inconsistente.
  assert.throws(() => new AcumuladorPaginas(PEDIDO, 10).adicionar(pagina([...dez].reverse(), { total: 10 }), 0), ErroLente);
});

test('L-3: resumo de outro recorte (município) é recusado; o estadual passa e a leitura completa', async () => {
  const resumo = (municipio, total) => ({ carga: cargaResumo, periodo, municipio, principal: { total } });
  assert.throws(() => validarResumo(PEDIDO, resumo(9910001, 4)), ErroLente);
  assert.equal(validarResumo(PEDIDO, resumo(null, 10)), 10);
  const dez = regsSeq(10);
  const fontes = {
    resumo: async (f) => { assert.equal(f.municipio, null); return resumo(null, 10); },
    pagina: async (f, limite, desloc) => { assert.equal(f.municipio, null); return pagina(dez.slice(desloc, desloc + limite), { total: 10, deslocamento: desloc }); },
    disponibilidade: async () => { throw new Error('não usado'); },
  };
  const lido = await lerRegistros(fontes, PEDIDO, () => true);
  assert.equal(lido?.registros.length, 10);
  assert.equal(lido?.totalResumo, 10);
  // Invalidação no meio: devolve null, sem resultado parcial.
  assert.equal(await lerRegistros(fontes, PEDIDO, () => false), null);
});

// --- Cobertura -------------------------------------------------------------------------------------

function disponibilidadeDe(caso) {
  const mapa = new Map();
  const dias = [];
  const fim = Date.parse(`${caso.janela.fim}T00:00:00Z`);
  for (let t = Date.parse(`${caso.janela.inicio}T00:00:00Z`); t <= fim; t += 86_400_000) dias.push(new Date(t).toISOString().slice(0, 10));
  for (const codigo of caso.municipios) {
    const restritivos = new Map(caso.restritivos[String(codigo)] ?? []);
    mapa.set(codigo, {
      estado: 'ok',
      dias: new Map(dias.map((d) => {
        const classe = restritivos.get(d) ?? 'sem_evidencia_de_lacuna';
        return [d, { dia: d, classe, motivos: [`motivo_ficticio_${codigo}`] }];
      })),
    });
  }
  return mapa;
}

test('V-1, V-2 e V-4: N de M, união conservadora (D13) e classe mais restritiva preservando cada município (T7)', () => {
  for (const caso of fixture('cobertura.json').casos) {
    const c = qualificarCobertura(caso.municipios, caso.janela, disponibilidadeDe(caso));
    assert.equal(textoCobertura(c), caso.esperado.texto, caso.id);
    assert.ok(!textoCobertura(c).includes('coberto'), `${caso.id}: nunca "coberto"`);
    assert.equal(c.estado, 'completa');
    assert.deepEqual(c.demais_dias.map((d) => [d.dia, d.classe]), caso.esperado.demais, caso.id);
    if (caso.esperado.municipios_do_dia) {
      const dia = c.demais_dias[0];
      assert.deepEqual(dia.municipios.map((m) => [m.codigo, m.classe]), caso.esperado.municipios_do_dia, caso.id);
      assert.deepEqual(dia.municipios.map((m) => m.motivos), [['motivo_ficticio_9910001'], ['motivo_ficticio_9910002']]);
    }
  }
});

test('V-3: integridade T3 — dia faltante ou repetido é falha de leitura, nunca "9 de 10"', () => {
  const pedido = { carga: 7, janela: { inicio: '2026-10-01', fim: '2026-10-10' } };
  const per = { inicio: '2026-10-01', fim: '2026-10-10', referencia: 'dias GMT inclusivos' };
  const dia = (d) => ({ dia: d, satelite: 'AQUA_M-T', classe: 'sem_evidencia_de_lacuna', motivos: [], alcance_historico: 'verificado', avisos: [], aviso_textual: null });
  const dias = Array.from({ length: 10 }, (_, i) => dia(`2026-10-${String(i + 1).padStart(2, '0')}`));
  const resp = (lista) => ({ carga: cargaResumo, periodo: per, municipio: 9910001, unidade: 'x', municipio_dias_por_classe: {}, municipio_dias_por_alcance: {}, dias: lista, nota: '' });
  assert.equal(validarDisponibilidade(pedido, 9910001, 'AQUA_M-T', resp(dias)).size, 10);
  assert.throws(() => validarDisponibilidade(pedido, 9910001, 'AQUA_M-T', resp(dias.slice(0, 9))), /dia faltante/);
  assert.throws(() => validarDisponibilidade(pedido, 9910001, 'AQUA_M-T', resp([...dias.slice(0, 9), dias[0]])), /dia repetido/);
  assert.throws(() => validarDisponibilidade(pedido, 9910001, 'AQUA_M-T', resp(dias.map((d) => ({ ...d, satelite: 'OUTRO' })))), /outro satélite/);
  // No qualificador, a falha do município vira "cobertura não verificada", sem N de M.
  const c = qualificarCobertura([9910001], pedido.janela, new Map([[9910001, { estado: 'falha', motivo: 'leitura incompleta' }]]));
  assert.equal(c.estado, 'falha');
  assert.equal(textoCobertura(c), 'cobertura não verificada: leitura incompleta');
});

test('qualificação: pendente até chegar a disponibilidade; completa só com todos os municípios', () => {
  const { janela, casos } = fixture('concentracao.json');
  const r = concentracao(entrada(casos[1], janela));
  assert.deepEqual(municipiosNecessarios(r), [9910001, 9910002]);
  assert.equal(estadoQualificacao(r), 'pendente');
  const umSo = disponibilidadeDe({ janela, municipios: [9910001], restritivos: {} });
  assert.equal(estadoQualificacao(qualificar(r, umSo)), 'pendente');
  const ambos = disponibilidadeDe({ janela, municipios: [9910001, 9910002], restritivos: {} });
  const q = qualificar(r, ambos);
  assert.equal(estadoQualificacao(q), 'completa');
  assert.equal(textoCobertura(q.destaques[0].cobertura), '31 de 31 dias sem evidência de lacuna (cobertura não comprovada)');
  // A qualificação não altera a seleção.
  assert.deepEqual(q.destaques.map((d) => d.id_destaque), r.destaques.map((d) => d.id_destaque));
});

// --- Destino dos erros (R2-1) -------------------------------------------------------------------

test('E-1: destino de cada tipo de erro por origem da chamada', () => {
  const origens = ['resumo', 'pagina', 'disponibilidade', 'geometria'];
  for (const o of origens) {
    for (const t of ['acesso_negado', 'sessao_expirada', 'sem_publicacao']) assert.equal(destinoErro(t, o), 'global', `${t}/${o}`);
    assert.equal(destinoErro('versao_substituida', o), 'versao', o);
  }
  for (const t of ['fonte_indisponivel', 'entrada_invalida', 'leitura_inconsistente']) {
    assert.equal(destinoErro(t, 'resumo'), 'falha_lente');
    assert.equal(destinoErro(t, 'pagina'), 'falha_lente');
    assert.equal(destinoErro(t, 'disponibilidade'), 'falha_qualificador');
    assert.equal(destinoErro(t, 'geometria'), 'falha_contorno');
  }
});

// --- Determinismo ----------------------------------------------------------------------------------

test('X-1: mesmos registros em ordem embaralhada produzem resultado idêntico', () => {
  const { janela, casos } = fixture('concentracao.json');
  const e = entrada(casos[2], janela);
  const embaralhado = [...e.registros].sort((a, b) => (a.id_tecnico.split('').reverse().join('') < b.id_tecnico.split('').reverse().join('') ? -1 : 1));
  assert.notDeepEqual(embaralhado.map((r) => r.id_tecnico), e.registros.map((r) => r.id_tecnico));
  assert.deepEqual(concentracao({ ...e, registros: embaralhado }), concentracao(e));
});

// --- Recorrência (item 2) --------------------------------------------------------------------------

const entradaRecorrencia = (caso) => {
  const registros = caso.registros.map(([id_tecnico, data_hora_gmt, latitude, longitude, municipio_codigo]) =>
    ({ id_tecnico, data_hora_gmt, latitude, longitude, municipio_codigo }));
  return { carga: CARGA, janela: caso.janela, registros, totalResumo: registros.length, nomes: new Map() };
};

test('R-1 a R-4: meses GMT distintos por célula, mês GMT, mês parcial (D14) e janela insuficiente', () => {
  for (const caso of fixture('recorrencia.json').casos) {
    const r = recorrencia(entradaRecorrencia(caso));
    const esp = caso.esperado;
    assert.equal(r.estado, esp.estado, caso.id);
    assert.equal(r.ordenacao, null, `${caso.id}: a recorrência não ordena por medida`);
    assert.deepEqual(r.destaques.map((d) => ({
      id_destaque: d.id_destaque, unidade: d.unidade, valor: d.evidencia.valor, datas: d.evidencia.datas,
      deteccoes: d.evidencia.deteccoes, municipios: d.cobertura.municipios, motivo: d.motivo, ressalvas: d.ressalvas,
    })), esp.destaques, caso.id);
    for (const d of r.destaques) assert.equal(d.cobertura.estado, 'pendente', caso.id);
    if (esp.meses) assert.deepEqual(r.janela.meses, esp.meses, caso.id);
    if (esp.observacoes) assert.deepEqual(r.observacoes, esp.observacoes, caso.id);
    assert.ok(r.limitacoes.includes('A cobertura da célula usa os municípios das detecções, não a área da célula.'), caso.id);
  }
});

test('recorrência: coordenada fora da forma canônica não é classificada (leitura inconsistente)', () => {
  const caso = fixture('recorrencia.json').casos[1];
  const e = entradaRecorrencia(caso);
  e.registros[0] = { ...e.registros[0], latitude: 1e-7 };
  assert.throws(() => recorrencia(e), ErroLente);
});

test('recorrência: conferência divergente não produz resultado', () => {
  const e = entradaRecorrencia(fixture('recorrencia.json').casos[0]);
  assert.throws(() => recorrencia({ ...e, totalResumo: e.totalResumo + 1 }), ErroLente);
});

test('X-1 (recorrência): ordem embaralhada produz resultado idêntico; união D13 qualifica a célula', () => {
  const caso = fixture('recorrencia.json').casos[0];
  const e = entradaRecorrencia(caso);
  assert.deepEqual(recorrencia({ ...e, registros: [...e.registros].reverse() }), recorrencia(e));
  // A célula X tem focos em 9910001 e 9910002: um dia restritivo em cada um conta contra (D13).
  const r = recorrencia(e);
  const disp = disponibilidadeDe({
    janela: caso.janela, municipios: [9910001, 9910002, 9910003],
    restritivos: { 9910001: [['2026-08-10', 'lacuna_conhecida']], 9910002: [['2026-09-20', 'incidencia_indeterminada']] },
  });
  const q = qualificar(r, disp);
  assert.deepEqual(q.destaques.map((d) => textoCobertura(d.cobertura)), [
    '92 de 92 dias sem evidência de lacuna (cobertura não comprovada)',
    '90 de 92 dias sem evidência de lacuna (cobertura não comprovada)',
  ]);
  assert.deepEqual(q.destaques.map((d) => d.id_destaque), r.destaques.map((d) => d.id_destaque));
});

// --- Persistência (item 3) -------------------------------------------------------------------------

/** Disponibilidade da fixture de persistência: dias restritivos listados e municípios em falha. */
function disponibilidadePersistencia(caso) {
  const mapa = disponibilidadeDe({ janela: caso.janela, municipios: caso.disponibilidade.municipios, restritivos: caso.disponibilidade.restritivos });
  for (const codigo of caso.disponibilidade.falha) mapa.set(codigo, { estado: 'falha', motivo: 'fonte indisponível' });
  return mapa;
}

test('P-1 a P-8: sequências por célula (T6), D15, ressalvas por classe (T7), borda (T4), ordem (T5) e cobertura não verificada', () => {
  for (const caso of fixture('persistencia.json').casos) {
    const r = persistencia(entradaRecorrencia(caso));
    const esp = caso.esperado;
    assert.equal(r.estado, esp.estado, caso.id);
    assert.equal(r.ordenacao, null, `${caso.id}: a persistência não ordena por medida`);
    assert.deepEqual(r.destaques.map((d, i) => ({
      id_destaque: d.id_destaque, ...(esp.destaques[i]?.unidade ? { unidade: d.unidade } : {}), valor: d.evidencia.valor, datas: d.evidencia.datas,
      deteccoes: d.evidencia.deteccoes, municipios: d.cobertura.municipios, motivo: d.motivo, ressalvas: d.ressalvas,
    })), esp.destaques, caso.id);
    for (const d of r.destaques) assert.equal(d.cobertura.estado, 'pendente', caso.id);
    assert.ok(r.limitacoes.includes('A cobertura da célula usa os municípios das detecções, não a área da célula.'), caso.id);

    const q = qualificar(r, disponibilidadePersistencia(caso));
    // A disponibilidade só qualifica: a seleção é a mesma.
    assert.deepEqual(q.destaques.map((d) => d.id_destaque), r.destaques.map((d) => d.id_destaque), caso.id);
    assert.deepEqual(q.destaques.map((d) => ({ cobertura: textoCobertura(d.cobertura), ressalvas: d.ressalvas })),
      esp.qualificado.map(({ cobertura, ressalvas }) => ({ cobertura, ressalvas })), caso.id);
    for (const d of q.destaques) {
      assert.ok(!textoCobertura(d.cobertura).includes('coberto'), `${caso.id}: nunca "coberto"`);
      if (d.cobertura.estado !== 'completa') assert.ok(!/\d+ de \d+/.test(textoCobertura(d.cobertura)), `${caso.id}: sem N de M parcial`);
    }
    esp.qualificado.forEach((x, i) => {
      if (!x.dias_das_ressalvas) return;
      const d = q.destaques[i];
      const dias = ressalvasDeClasse(d.evidencia.datas, r.janela, d.cobertura)
        .map((y) => [y.dia.dia, y.dia.classe, y.dia.municipios.map((m) => [m.codigo, m.classe])]);
      assert.deepEqual(dias, x.dias_das_ressalvas, `${caso.id}: municípios de cada dia das ressalvas`);
    });
  }
});

test('persistência: enquanto a cobertura está pendente, uma ressalva substitui as de D15; a de T4 permanece', () => {
  const caso = fixture('persistencia.json').casos.find((c) => c.id === 'P-6');
  const q = qualificar(persistencia(entradaRecorrencia(caso)), new Map());
  assert.deepEqual(q.destaques.map((d) => d.ressalvas), [
    ['sequência no limite da janela; pode ser mais longa', 'ressalvas de disponibilidade ainda não verificadas'],
    ['ressalvas de disponibilidade ainda não verificadas'],
    ['ressalvas de disponibilidade ainda não verificadas'],
    ['sequência no limite da janela; pode ser mais longa', 'ressalvas de disponibilidade ainda não verificadas'],
  ]);
  assert.equal(estadoQualificacao(q), 'pendente');
});

test('persistência: coordenada fora da forma canônica e conferência divergente não produzem resultado', () => {
  const e = entradaRecorrencia(fixture('persistencia.json').casos[0]);
  assert.throws(() => persistencia({ ...e, totalResumo: e.totalResumo + 1 }), ErroLente);
  const ruim = { ...e, registros: e.registros.map((x, i) => (i === 0 ? { ...x, longitude: Number.NaN } : x)) };
  assert.throws(() => persistencia(ruim), ErroLente);
});

test('X-1 (persistência): ordem embaralhada produz resultado idêntico', () => {
  const e = entradaRecorrencia(fixture('persistencia.json').casos.find((c) => c.id === 'P-6'));
  assert.deepEqual(persistencia({ ...e, registros: [...e.registros].reverse() }), persistencia(e));
});
