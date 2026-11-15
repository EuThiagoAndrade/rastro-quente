// Casos de referência da lente de sobreposição e do leitor das áreas (plano 006, item 3): SB-1 a SB-16. Os valores
// esperados vêm do plano e de tests/fixtures/lentes/sobreposicao.json, escritos à mão; nenhum é gerado pelo código.
// A lente recebe vínculos prontos (T22); o leitor (T25) é exercitado com fontes fictícias em memória.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ErroEntradaSobreposicao, LIMITACOES_SOBREPOSICAO, municipiosDaSobreposicao, qualificarSobreposicao, sobreposicao,
  TEXTO_SEM_CAMADA, textoSemDestaques, VERSAO_SOBREPOSICAO,
} from '../../src/lentes/sobreposicao.ts';
import { lerAreas, LIMITE_PAGINA_AREAS } from '../../src/lentes/carregar-areas.ts';
import { AVISO_DOMINIO, ErroLente, VERSAO_METODO } from '../../src/lentes/contrato.ts';
import { destinoErro } from '../../src/lentes/carregar.ts';
import { diasDaJanela, textoCobertura } from '../../src/lentes/cobertura.ts';
import { ErroCombinacao, LENTES_CANONICAS, validarEscolha } from '../../src/lentes/combinacao.ts';
import { ErroConsulta } from '../../src/erros.ts';

const FX = JSON.parse(readFileSync(new URL('../fixtures/lentes/sobreposicao.json', import.meta.url), 'utf8'));
const CARGA = { id: 7, identidade: 'a'.repeat(64) };
const LINHA_CARGA = { ...CARGA, total_areas: FX.areas.length, total_vinculos_area: FX.vinculos.length };
const id = (letra) => FX.celulas[letra].id;
const fimExclusivo = (fim) => new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().replace('.000Z', 'Z');

function entrada(janela = FX.janela, registros = FX.registros) {
  const lista = registros.map(([id_tecnico, data_hora_gmt, celula, municipio_codigo]) => ({
    id_tecnico, data_hora_gmt, latitude: FX.celulas[celula].lat, longitude: FX.celulas[celula].lon, municipio_codigo,
  })).filter((r) => r.data_hora_gmt >= `${janela.inicio}T00:00:00Z` && r.data_hora_gmt < fimExclusivo(janela.fim));
  return {
    carga: CARGA, janela, registros: lista, totalResumo: lista.length,
    nomes: new Map(Object.entries(FX.municipios).map(([c, n]) => [Number(c), n])),
  };
}

const area = (a, carga_id = CARGA.id) => ({ carga_id, ...a });
const vinculo = ([id_tecnico, area_fonte, area_codigo, posicao], carga_id = CARGA.id) => ({ carga_id, id_tecnico, area_fonte, area_codigo, posicao });

function camada({ areas = FX.areas, vinculos = FX.vinculos } = {}) {
  return { estado: 'completa', carga: { ...LINHA_CARGA, total_areas: areas.length, total_vinculos_area: vinculos.length }, areas: areas.map((a) => area(a)), vinculos: vinculos.map((v) => vinculo(v)) };
}

const celulas = (r) => r.destaques.map((d) => d.unidade.id);
const destaque = (r, letra) => r.destaques.find((d) => d.unidade.id === id(letra));

test('SB-1: proteção integral — P destacada com evidência 1 (p1) e motivo por área', () => {
  const r = sobreposicao(entrada(), camada(), 'protecao_integral');
  const p = destaque(r, 'P');
  assert.equal(r.estado, 'com_destaques');
  assert.equal(r.lente, 'sobreposicao');
  assert.equal(r.versao_metodo, 'sobreposicao-007-v1');
  assert.equal(VERSAO_SOBREPOSICAO, 'sobreposicao-007-v1');
  assert.equal(p.id_destaque, 'sobreposicao:protecao_integral:celula_005:c-200_-1200');
  assert.deepEqual(p.evidencia, { deteccoes: ['p1'], valor: 1, datas: [] });
  assert.equal(p.motivo, '1 de 7 detecções desta célula dentro de A1 (proteção integral, parque, estadual)');
  assert.deepEqual(p.areas, [{
    chave: 'cnuc:A1', nome: 'A1', classe: 'protecao_integral', categoria_ou_fase: 'parque', esfera: 'estadual',
    qualidade_poligono: 'Polígono corresponde ao memorial descritivo', deteccoes: ['p1'], na_borda: 0, ressalvas: [],
  }]);
  assert.deepEqual(p.ressalvas, []);
});

test('SB-2: Q não é destacada — nenhuma detecção da janela tem vínculo (S1, e não S2)', () => {
  const r = sobreposicao(entrada(), camada(), 'protecao_integral');
  assert.equal(destaque(r, 'Q'), undefined);
});

test('SB-3: borda — T e R trazem a ressalva de 1 detecção sobre o limite', () => {
  const r = sobreposicao(entrada(), camada(), 'protecao_integral');
  const borda = '1 detecção exatamente sobre o limite da área';
  for (const letra of ['T', 'R']) {
    const d = destaque(r, letra);
    assert.equal(d.areas[0].na_borda, 1, letra);
    assert.deepEqual(d.areas[0].ressalvas, [borda], letra);
    assert.deepEqual(d.ressalvas, [`A1: ${borda}`], letra);
  }
  assert.equal(destaque(r, 'T').motivo, '1 de 1 detecção desta célula dentro de A1 (proteção integral, parque, estadual)');
});

test('SB-4: duas classes — R nas duas, cada resultado só com a própria classe', () => {
  const pi = destaque(sobreposicao(entrada(), camada(), 'protecao_integral'), 'R');
  assert.deepEqual(pi.evidencia.deteccoes, ['r1', 'r2']);
  assert.equal(pi.motivo, '2 de 2 detecções desta célula dentro de A1 (proteção integral, parque, estadual)');
  assert.deepEqual(pi.areas.map((a) => a.chave), ['cnuc:A1']);
  const us = sobreposicao(entrada(), camada(), 'uso_sustentavel');
  assert.deepEqual(celulas(us), [id('R')]);
  const r = destaque(us, 'R');
  assert.deepEqual(r.evidencia.deteccoes, ['r1', 'r2']);
  assert.equal(r.motivo, '2 de 2 detecções desta célula dentro de A2 (uso sustentável, APA, federal)');
  assert.deepEqual(r.ressalvas, ['A2: limite estimado pelo órgão gestor; a posição exata pode diferir']);
  assert.ok(!JSON.stringify(us.destaques).includes('proteção integral'), 'nenhum destaque cita a outra classe');
  assert.ok(!JSON.stringify(pi).includes('uso sustentável'));
});

test('SB-5: duas áreas da mesma classe — entradas em ordem de chave e evidência em união', () => {
  const c = camada({ areas: [...FX.areas, FX.area_a2_linha], vinculos: [...FX.vinculos, ['r2', 'cnuc', "A2'", 'interior']] });
  const r = destaque(sobreposicao(entrada(), c, 'uso_sustentavel'), 'R');
  assert.deepEqual(r.areas.map((a) => [a.chave, a.deteccoes]), [['cnuc:A2', ['r1', 'r2']], ["cnuc:A2'", ['r2']]]);
  assert.deepEqual(r.evidencia, { deteccoes: ['r1', 'r2'], valor: 2, datas: [] });
  assert.equal(r.motivo, "2 de 2 detecções desta célula dentro de A2 (uso sustentável, APA, federal); 1 de 2 detecções desta célula dentro de A2' (uso sustentável, APA, federal)");
});

test('SB-6: terra indígena — só S, com fase; A4 (em estudo) não existe para a lente', () => {
  const r = sobreposicao(entrada(), camada(), 'terra_indigena');
  assert.deepEqual(celulas(r), [id('S')]);
  const s = destaque(r, 'S');
  assert.equal(s.motivo, '1 de 1 detecção desta célula dentro da Terra Indígena A3 (fase: regularizada)');
  assert.deepEqual(s.areas.map((a) => [a.chave, a.categoria_ou_fase, a.esfera, a.qualidade_poligono]), [['funai:A3', 'regularizada', null, null]]);
});

test('SB-7: janela — x1 (15/09) não conta em outubro; de 01/09 a 31/10, Q entra com x1', () => {
  assert.equal(destaque(sobreposicao(entrada(), camada(), 'protecao_integral'), 'Q'), undefined);
  const r = sobreposicao(entrada({ inicio: '2026-09-01', fim: '2026-10-31' }), camada(), 'protecao_integral');
  const q = destaque(r, 'Q');
  assert.deepEqual(q.evidencia.deteccoes, ['x1']);
  assert.equal(q.motivo, '1 de 4 detecções desta célula dentro de A1 (proteção integral, parque, estadual)');
});

test('SB-8: sem destaques — estado, texto de T23 e aviso de domínio', () => {
  const r = sobreposicao(entrada({ inicio: '2026-08-01', fim: '2026-08-31' }), camada(), 'terra_indigena');
  assert.equal(r.estado, 'sem_destaques');
  assert.deepEqual(r.destaques, []);
  assert.equal(textoSemDestaques('terra_indigena'), 'Nenhuma célula com detecção dentro de terra indígena nesta janela. Isso não indica ausência de focos nem de risco.');
  assert.ok(r.limitacoes[0].startsWith(AVISO_DOMINIO));
  assert.ok(r.limitacoes[0].endsWith('Estar dentro de uma área protegida não indica infração, autoria nem situação fundiária.'));
});

test('SB-9: ordem T5 (norte→sul, oeste→leste), sem campo de ordem por área ou contagem', () => {
  const r = sobreposicao(entrada(), camada(), 'protecao_integral');
  assert.deepEqual(celulas(r), [id('R'), id('P'), id('T')]);
  for (const d of r.destaques) assert.equal(d.ordem, undefined);
  assert.equal('ordenacao' in r, false);
  assert.ok(r.limitacoes.includes('A lista não é ranking: a classe ou o número de detecções não indica gravidade nem prioridade.'));
});

test('SB-10: cobertura de P sobre M1 e M2 (todas as 7 detecções); pendente e falha; seleção não muda', () => {
  const r = sobreposicao(entrada(), camada(), 'protecao_integral');
  assert.deepEqual(destaque(r, 'P').cobertura, { estado: 'pendente', municipios: [9910001, 9910002] });
  assert.deepEqual(municipiosDaSobreposicao(r), [9910001, 9910002]);
  const dias = (restrito) => new Map(diasDaJanela(FX.janela).map((dia) => [dia, dia === restrito
    ? { dia, classe: 'lacuna_conhecida', motivos: ['aviso_incidente'] } : { dia, classe: 'sem_evidencia_de_lacuna', motivos: [] }]));
  const disp = new Map([[9910001, { estado: 'ok', dias: dias(null) }], [9910002, { estado: 'ok', dias: dias('2026-10-10') }]]);
  const q = qualificarSobreposicao(r, disp);
  assert.equal(textoCobertura(destaque(q, 'P').cobertura), '30 de 31 dias sem evidência de lacuna (cobertura não comprovada)');
  assert.deepEqual(celulas(q), celulas(r));
  const pendente = qualificarSobreposicao(r, new Map([[9910001, { estado: 'ok', dias: dias(null) }]]));
  assert.equal(destaque(pendente, 'P').cobertura.estado, 'pendente');
  const falha = qualificarSobreposicao(r, new Map([[9910001, { estado: 'ok', dias: dias(null) }], [9910002, { estado: 'falha', motivo: 'falha fictícia' }]]));
  assert.equal(textoCobertura(destaque(falha, 'P').cobertura), 'cobertura não verificada: falha fictícia');
});

test('SB-11: entrada inconsistente (outra carga, área inexistente) e classe inválida', () => {
  const outra = camada();
  outra.vinculos = [...outra.vinculos, vinculo(['p2', 'cnuc', 'A1', 'interior'], 8)];
  assert.throws(() => sobreposicao(entrada(), outra, 'protecao_integral'), ErroLente);
  assert.throws(() => sobreposicao(entrada(), camada({ vinculos: [...FX.vinculos, ['p2', 'cnuc', 'ZZ', 'interior']] }), 'protecao_integral'), ErroLente);
  const areaOutra = camada();
  areaOutra.areas = [...areaOutra.areas.slice(1), area(FX.areas[0], 8)];
  assert.throws(() => sobreposicao(entrada(), areaOutra, 'protecao_integral'), ErroLente);
  assert.throws(() => sobreposicao(entrada(), { ...camada(), carga: { ...LINHA_CARGA, id: 8 } }, 'protecao_integral'), ErroLente);
  assert.throws(() => sobreposicao(entrada(), camada(), 'rppn'), (x) => x instanceof ErroEntradaSobreposicao && /entrada inválida/.test(x.message));
});

test('SB-12: determinismo — registros, vínculos e áreas embaralhados dão o mesmo resultado', () => {
  const embaralhar = (xs) => xs.map((x, i) => [((i * 7) + 3) % xs.length, x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  for (const classe of ['protecao_integral', 'uso_sustentavel', 'terra_indigena']) {
    const a = sobreposicao(entrada(), camada(), classe);
    const b = sobreposicao(entrada(FX.janela, embaralhar([...FX.registros].reverse())),
      camada({ areas: embaralhar([...FX.areas].reverse()), vinculos: embaralhar([...FX.vinculos].reverse()) }), classe);
    assert.deepEqual(b, a, classe);
  }
});

test('SB-13: combinação intacta — sobreposição é lente desconhecida e C1 não muda', () => {
  assert.throws(() => validarEscolha(['sobreposicao', 'recorrencia'], 'e'), (x) => x instanceof ErroCombinacao && /lente desconhecida/.test(x.message));
  assert.deepEqual(LENTES_CANONICAS, ['concentracao', 'recorrencia', 'persistencia']);
  assert.equal(VERSAO_METODO, 'lentes-007-v1');
});

// --- Leitor T25 ------------------------------------------------------------------------------------

/**
 * Fontes fictícias em memória, com a ordem da chave primária. `carga` é a sequência de respostas da linha da carga
 * (a última se repete); `alterar` modifica cada página de vínculos antes de devolvê-la.
 */
function fontes({ linhas = [LINHA_CARGA], areas = FX.areas.map((a) => area(a)), vinculos = FX.vinculos.map((v) => vinculo(v)),
  alterar = (pg) => pg, sondagem = 'autorizado', vigente = CARGA.id, proibirTabelas = false } = {}) {
  const chamadas = { carga: 0, areas: [], vinculos: [], sondar: 0, vigente: 0 };
  const ordenar = (xs, chave) => [...xs].sort((a, b) => (chave(a) < chave(b) ? -1 : chave(a) > chave(b) ? 1 : 0));
  const pagina = (xs, desloc, limite) => (xs.length && desloc >= xs.length ? { fora_da_faixa: true } : { linhas: xs.slice(desloc, desloc + limite), total: xs.length });
  const aOrd = ordenar(areas, (a) => `${a.fonte}|${a.codigo}`);
  const vOrd = ordenar(vinculos, (v) => `${v.id_tecnico}|${v.area_fonte}|${v.area_codigo}`);
  const f = {
    chamadas,
    async carga() { const r = linhas[Math.min(chamadas.carga, linhas.length - 1)]; chamadas.carga += 1; return r; },
    async areas(_c, desloc, limite) {
      if (proibirTabelas) throw new Error('areas não deveria ser lida');
      chamadas.areas.push(desloc);
      return pagina(aOrd, desloc, limite);
    },
    async vinculos(_c, desloc, limite) {
      if (proibirTabelas) throw new Error('deteccoes_areas não deveria ser lida');
      chamadas.vinculos.push(desloc);
      return alterar(pagina(vOrd, desloc, limite), desloc);
    },
    async sondar() { chamadas.sondar += 1; if (sondagem instanceof Error) throw sondagem; return sondagem; },
    async vigente() { chamadas.vigente += 1; return vigente; },
  };
  return f;
}

test('T25: leitura completa da fixture, com as linhas da carga e todos os vínculos', async () => {
  const f = fontes();
  const l = await lerAreas(f, CARGA.id, () => true);
  assert.equal(l.estado, 'completa');
  assert.equal(l.areas.length, 5);
  assert.equal(l.vinculos.length, 8);
  assert.deepEqual([f.chamadas.areas, f.chamadas.vinculos, f.chamadas.sondar], [[0], [0], 0]);
  const r = sobreposicao(entrada(), l, 'protecao_integral');
  assert.deepEqual(r.conferencia, { registros_lidos: 14, ids_distintos: 14, total_resumo: 14, areas_lidas: 5, vinculos_lidos: 8 });
  assert.equal(await lerAreas(fontes(), CARGA.id, () => false), null, 'aplicação invalidada no meio');
});

test('SB-14: carga sem camada — sem_camada, sem ErroLente e sem ler areas nem deteccoes_areas', async () => {
  const f = fontes({ linhas: [{ ...CARGA, total_areas: null, total_vinculos_area: null }], proibirTabelas: true });
  const l = await lerAreas(f, CARGA.id, () => true);
  assert.equal(l.estado, 'sem_camada');
  const r = sobreposicao(entrada(), l, 'terra_indigena');
  assert.equal(r.estado, 'sem_camada');
  assert.deepEqual(r.destaques, []);
  assert.equal(TEXTO_SEM_CAMADA, 'esta versão dos dados não tem a camada de áreas protegidas');
  await assert.rejects(lerAreas(fontes({ linhas: [{ ...CARGA, total_areas: 5, total_vinculos_area: null }] }), CARGA.id, () => true), ErroLente);
});

/** SB-15: 1.201 vínculos; a única evidência da célula Z (proteção integral) é o vínculo de posição 1.150. */
function cenario1201() {
  const ids = Array.from({ length: 1201 }, (_, i) => `v${String(i).padStart(4, '0')}`);
  const registros = ids.map((x, i) => [x, '2026-10-15T12:00:00Z', i === 1149 ? 'P' : 'S', 9910001]);
  const areas = [area({ ...FX.areas[0], codigo: 'Z1', nome: 'Z1' }), area({ ...FX.areas[2], codigo: 'T1', nome: 'T1' })];
  const vinculos = ids.map((x, i) => vinculo([x, i === 1149 ? 'cnuc' : 'funai', i === 1149 ? 'Z1' : 'T1', 'interior']));
  const linha = { ...CARGA, total_areas: 2, total_vinculos_area: 1201 };
  return { registros, areas, vinculos, linha };
}

test('SB-15: paginação completa — duas páginas, 1.201 vínculos e Z destacada com evidência 1', async () => {
  const c = cenario1201();
  const f = fontes({ linhas: [c.linha], areas: c.areas, vinculos: c.vinculos });
  const l = await lerAreas(f, CARGA.id, () => true);
  assert.equal(LIMITE_PAGINA_AREAS, 1000);
  assert.deepEqual(f.chamadas.vinculos, [0, 1000]);
  assert.equal(l.vinculos.length, 1201);
  const r = sobreposicao(entrada(FX.janela, c.registros), l, 'protecao_integral');
  assert.deepEqual(celulas(r), [id('P')]);
  assert.deepEqual(destaque(r, 'P').evidencia.deteccoes, ['v1149']);
});

test('SB-16: leitura incompleta → leitura_inconsistente; linha da carga ausente → diagnóstico', async () => {
  const c = cenario1201();
  const segunda = (fn) => (pg, desloc) => (desloc === 1000 ? fn(pg) : pg);
  const casos = {
    'segunda página com 200 linhas': segunda((pg) => ({ ...pg, linhas: pg.linhas.slice(0, 200) })),
    'contagem exata 1.200': (pg) => ({ ...pg, total: 1200 }),
    'vínculo repetido entre páginas': segunda((pg) => ({ ...pg, linhas: [c.vinculos[0], ...pg.linhas.slice(1)] })),
    'linha de outra carga': segunda((pg) => ({ ...pg, linhas: [{ ...pg.linhas[0], carga_id: 8 }, ...pg.linhas.slice(1)] })),
  };
  for (const [nome, alterar] of Object.entries(casos)) {
    const f = fontes({ linhas: [c.linha], areas: c.areas, vinculos: c.vinculos, alterar });
    await assert.rejects(lerAreas(f, CARGA.id, () => true), ErroLente, nome);
    assert.equal(f.chamadas.sondar, 0, `${nome}: linha da carga presente, sem diagnóstico`);
  }

  const curta = segunda((pg) => ({ ...pg, linhas: pg.linhas.slice(0, 200) }));
  const ausente = async (opcoes) => {
    try {
      await lerAreas(fontes({ linhas: [c.linha, null], areas: c.areas, vinculos: c.vinculos, alterar: curta, ...opcoes }), CARGA.id, () => true);
    } catch (x) {
      return x instanceof ErroConsulta ? x.tipo : x instanceof ErroLente ? 'leitura_inconsistente' : x;
    }
    return 'sem erro';
  };
  assert.deepEqual([
    await ausente({ sondagem: 'negado' }),
    await ausente({ sondagem: 'sem_publicacao' }),
    await ausente({ sondagem: 'autorizado', vigente: 99 }),
    await ausente({ sondagem: 'autorizado', vigente: CARGA.id }),
    await ausente({ sondagem: new ErroConsulta('sessao_expirada', 'jwt expirado') }),
  ], ['acesso_negado', 'sem_publicacao', 'versao_substituida', 'leitura_inconsistente', 'sessao_expirada']);
  for (const tipo of ['acesso_negado', 'sem_publicacao', 'sessao_expirada']) assert.equal(destinoErro(tipo, 'pagina'), 'global', tipo);
  assert.equal(destinoErro('versao_substituida', 'pagina'), 'versao');

  // R3-1: a resposta 416 (deslocamento além do total visível) conta como página curta.
  const r416 = await ausente({ sondagem: 'negado', alterar: segunda(() => ({ fora_da_faixa: true })) });
  assert.equal(r416, 'acesso_negado');
  // Perda de acesso desde a primeira página: zero linhas e contagem zero.
  const r0 = await ausente({ sondagem: 'negado', alterar: () => ({ linhas: [], total: 0 }) });
  assert.equal(r0, 'acesso_negado');
});

test('T25: vínculo para área não lida é leitura inconsistente', async () => {
  const f = fontes({ areas: FX.areas.slice(1).map((a) => area(a)), linhas: [{ ...LINHA_CARGA, total_areas: 4 }] });
  await assert.rejects(lerAreas(f, CARGA.id, () => true), ErroLente);
});

test('Limitações de T23 e parâmetros da lente', () => {
  const r = sobreposicao(entrada(), camada(), 'protecao_integral');
  assert.deepEqual(r.limitacoes, LIMITACOES_SOBREPOSICAO);
  for (const trecho of ['retrato datado da fonte', 'polígono integral da fonte', 'Não entram: RPPN', 'SIRGAS 2000', 'não é ranking']) {
    assert.ok(r.limitacoes.some((x) => x.includes(trecho)), trecho);
  }
  assert.deepEqual(r.parametros.map((p) => p.nome), ['Unidade', 'Classe', 'Regra', 'Pertencimento']);
  assert.deepEqual(r.recorte, { tipo: 'estado', municipio: null });
});
