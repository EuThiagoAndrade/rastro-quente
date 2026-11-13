// Ciclo 003, issue #22 — manifesto canônico, identidade da carga e linhas, sem banco e com fixtures fictícias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FORMATO_MANIFESTO, camposDaCarga, canonico, construirCarga, identidadeDe, lerCsv, sha256, sqlAprovacao } from './manifesto.mjs';

const EXIBICAO = 'minima';
const geojson = (codigos) => JSON.stringify({
  type: 'FeatureCollection',
  features: codigos.map((c) => ({ type: 'Feature', properties: { codarea: String(c) }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]] } })),
});

// Entradas mínimas e coerentes: 2 municípios fictícios × 2 dias, 3 detecções (1 delas de envelope).
function entradasFicticias({ revisao = 1 } = {}) {
  const cabecalhoDet = 'id_tecnico,fonte,linha,id_fonte,data_hora_gmt,lat,lon,municipio_ibge,posicao,municipio_inpe,estado_inpe,escopo';
  const det = [
    cabecalhoDet,
    'aaaa:2,inpe-mensal-202610,2,id-1,2026-10-01 18:00:00,-10.5,-55.5,9900001,dentro,9900001,51,principal',
    'aaaa:3,inpe-mensal-202610,3,,2026-10-02 18:30:00,-11.5,-56.5,9900002,borda,,,principal',
    'bbbb:1,inpe-diario-20261101,1,id-3,2026-11-03 01:00:00,-12.5,-57.5,9900001,dentro,9900001,51,envelope',
  ].join('\n');
  const disp = ['dia_gmt,satelite,municipio_ibge,classe,motivos,historico,avisos,aviso_textual']
    .concat(['2026-10-01', '2026-10-02'].flatMap((d) => [9900001, 9900002].map((m) => `${d},AQUA_M-T,${m},sem_evidencia_de_lacuna,historico_nao_verificado|sem_aviso_incidente,parcial,${m === 9900002 ? 'av1:indeterminada' : ''},"cobertura, não comprovada"`)))
    .join('\n');
  const brutos = {
    'ibge-malha-mt-municipios-minima': Buffer.from(geojson([9900002, 9900001])),
    'ibge-malha-mt-municipios-maxima': Buffer.from(geojson([9900001, 9900002])),
    'ibge-municipios-mt': Buffer.from(JSON.stringify([{ id: 9900001, nome: 'Município Fictício Um' }, { id: 9900002, nome: 'Município Fictício Dois' }])),
  };
  const itens = [
    { id: 'inpe-mensal-202610', papel: 'principal', fonte: 'INPE', url: 'https://exemplo.test/mensal', tamanho: 10, sha256: 'a'.repeat(64), obtidoEm: '2026-11-07T10:00:00Z' },
    { id: 'inpe-diario-20261101', papel: 'envelope', fonte: 'INPE', url: 'https://exemplo.test/diario', tamanho: 5, sha256: 'b'.repeat(64), obtidoEm: '2026-11-07T10:01:00Z' },
    ...Object.entries(brutos).map(([id, b]) => ({ id, papel: 'territorio', fonte: 'IBGE', url: `https://exemplo.test/${id}`, tamanho: b.length, sha256: sha256(b), obtidoEm: '2026-11-07T10:02:00Z' })),
  ];
  const saidas = { 'deteccoes.csv': { dados: Buffer.from(det) }, 'disponibilidade.csv': { dados: Buffer.from(disp) } };
  for (const s of Object.values(saidas)) s.sha256 = sha256(s.dados);
  return {
    fontes: {
      contrato: { satelite: 'AQUA_M-T' }, janela: { inicio: '2026-10-01', fim: '2026-10-03' },
      envelope: { fuso: 'America/Cuiaba', desvioHoras: -4, depois: { inicio: '2026-10-03T00:00:00.000Z', fim: '2026-10-03T04:00:00.000Z' } },
      itens, condicoesDeUso: { fontes: [{ fonte: 'INPE (Programa)', uso: 'permitido', resumo: 'fictício' }, { fonte: 'IBGE (malhas)', uso: 'permitido', resumo: 'fictício' }] },
    },
    avisos: { decisaoH3: { regra: 'H2_teste' } },
    relatorio: {
      situacao: 'Pronto', paradas: [],
      insumos: itens.map((i) => ({ id: i.id, sha256: i.sha256 })),
      saidas: Object.entries(saidas).map(([arquivo, s]) => ({ arquivo, sha256: s.sha256, bytes: s.dados.length })),
      totais: { principal: 2, envelope: 1 }, territorio: { municipiosNaMalha: 2 }, disponibilidade: { municipioDias: 4 },
    },
    semAreas: true, saidas, brutos: Object.fromEntries(Object.entries(brutos).map(([id, b]) => [id, { dados: b, sha256: sha256(b) }])), exibicao: EXIBICAO, revisao,
  };
}

test('canonico: ordem de chaves não altera; valor não JSON é recusado', () => {
  assert.equal(canonico({ b: 1, a: [2, { d: null, c: 'x' }] }), canonico({ a: [2, { c: 'x', d: null }], b: 1 }));
  assert.equal(canonico({ a: undefined, b: 1 }), '{"b":1}');
  assert.throws(() => canonico({ a: () => 1 }), /não canonizável/);
});

test('lerCsv: aspas, vírgula em campo, CRLF e coluna a menos', () => {
  const r = lerCsv('a,b\r\n1,"x, ""y"""\r\n2,\r\n');
  assert.deepEqual(r.linhas, [{ a: '1', b: 'x, "y"' }, { a: '2', b: '' }]);
  assert.throws(() => lerCsv('a,b\n1\n'), /1 colunas na linha 2/);
});

test('construirCarga: mapeia as linhas, confere os totais e deriva a identidade', () => {
  const { manifesto, identidade, dados } = construirCarga(entradasFicticias());
  assert.equal(manifesto.formato, FORMATO_MANIFESTO);
  assert.deepEqual(manifesto.totais, { principal: 2, envelope: 1, municipios: 2, disponibilidade: 4 });
  assert.match(identidade, /^[0-9a-f]{64}$/);
  assert.equal(identidade, identidadeDe(manifesto));
  assert.deepEqual(dados.deteccoes[1], {
    id_tecnico: 'aaaa:3', fonte_chave: 'inpe-mensal-202610', linha: 3, id_fonte: null, escopo: 'principal', data_hora_gmt: '2026-10-02T18:30:00Z',
    latitude: -11.5, longitude: -56.5, municipio_codigo: 9900002, posicao: 'borda', municipio_inpe: null, estado_inpe: null,
  });
  assert.equal(dados.deteccoes[0].posicao, 'interior', 'dentro vira interior');
  assert.deepEqual(dados.municipios.map((m) => m.codigo), [9900001, 9900002], 'municípios em ordem de código');
  assert.deepEqual(dados.disponibilidade.find((d) => d.municipio_codigo === 9900002).avisos, ['av1:indeterminada']);
  assert.deepEqual(dados.disponibilidade[0].motivos, ['historico_nao_verificado', 'sem_aviso_incidente']);
  assert.equal(dados.malhas.find((m) => m.uso === 'exibicao').fonte_chave, 'ibge-malha-mt-municipios-minima');
  assert.equal(dados.fontes.length, 5);
  assert.equal(dados.fontes[0].condicoes_uso, 'permitido: fictício');
  assert.equal(manifesto.envelope.inicio, '2026-10-03T00:00:00Z');
  assert.equal(identidade, construirCarga(entradasFicticias()).identidade, 'determinística');
});

test('identidade: muda com fonte, janela, método (revisão) e hash de saída; não com timestamp de obtenção', () => {
  const base = construirCarga(entradasFicticias()).identidade;
  assert.notEqual(construirCarga(entradasFicticias({ revisao: 2 })).identidade, base, 'revisão');

  const fonte = entradasFicticias();
  fonte.fontes.itens[0].sha256 = 'c'.repeat(64);
  fonte.relatorio.insumos[0].sha256 = 'c'.repeat(64);
  assert.notEqual(construirCarga(fonte).identidade, base, 'correção de fonte');

  const janela = entradasFicticias();
  janela.fontes.janela.fim = '2026-10-04';
  janela.fontes.envelope.depois = { inicio: '2026-10-04T00:00:00.000Z', fim: '2026-10-04T04:00:00.000Z' };
  janela.relatorio.disponibilidade.municipioDias = 4;
  assert.notEqual(construirCarga(janela).identidade, base, 'janela');

  const saida = entradasFicticias();
  saida.saidas['deteccoes.csv'].dados = Buffer.from(`${saida.saidas['deteccoes.csv'].dados}\n`);
  saida.saidas['deteccoes.csv'].sha256 = sha256(saida.saidas['deteccoes.csv'].dados);
  saida.relatorio.saidas[0] = { arquivo: 'deteccoes.csv', sha256: saida.saidas['deteccoes.csv'].sha256, bytes: saida.saidas['deteccoes.csv'].dados.length };
  assert.notEqual(construirCarga(saida).identidade, base, 'conteúdo das saídas (correção de método)');

  const tempo = entradasFicticias();
  tempo.fontes.itens[0].obtidoEm = '2030-01-01T00:00:00Z';
  assert.equal(construirCarga(tempo).identidade, base, 'timestamp não é identidade');
});

test('construirCarga: recusa relatório com parada, saída adulterada, total divergente e regra H3 ausente', () => {
  const parada = entradasFicticias();
  parada.relatorio.situacao = 'Parado';
  assert.throws(() => construirCarga(parada), /parada ou ausente/);

  const adulterada = entradasFicticias();
  adulterada.saidas['disponibilidade.csv'].dados = Buffer.from(`${adulterada.saidas['disponibilidade.csv'].dados}x`);
  adulterada.saidas['disponibilidade.csv'].sha256 = sha256(adulterada.saidas['disponibilidade.csv'].dados);
  assert.throws(() => construirCarga(adulterada), /disponibilidade\.csv diverge do relatório/);

  const total = entradasFicticias();
  total.relatorio.totais.principal = 3;
  assert.throws(() => construirCarga(total), /Totais de detecções divergem/);

  const h3 = entradasFicticias();
  h3.avisos = {};
  assert.throws(() => construirCarga(h3), /H3/);

  const insumo = entradasFicticias();
  insumo.relatorio.insumos[0].sha256 = 'd'.repeat(64);
  assert.throws(() => construirCarga(insumo), /Relatório não corresponde a fontes\.json/);

  const revisao = entradasFicticias({ revisao: 0 });
  assert.throws(() => construirCarga(revisao), /revisão/);
});

test('sqlAprovacao: um INSERT com a mesma identidade e os mesmos campos da carga, sem segredo', () => {
  const { manifesto, identidade } = construirCarga(entradasFicticias());
  const sql = sqlAprovacao(manifesto, identidade);
  const campos = camposDaCarga(manifesto, identidade);
  assert.match(sql, /^-- Manifesto aprovado da carga [0-9a-f]{64}\n/);
  assert.match(sql, /insert into privado\.manifestos_aprovados \(identidade, satelite, janela_inicio,/);
  assert.ok(sql.includes(`'${identidade}'`));
  assert.ok(sql.includes(`'${JSON.stringify(campos.metodo)}'::jsonb`));
  assert.equal(sql.match(/insert into/g).length, 1);
  assert.doesNotMatch(sql, /password|senha|secret/i);
});

test('áreas: identidade e totais incluem saídas; rollback omite camada e preserva entradas', () => {
  const e = entradasFicticias();
  e.semAreas = false;
  const fontes = [
    { id: 'cnuc-teste', papel: 'areas', fonte: 'cnuc', url: 'https://exemplo.test/cnuc', tamanho: 1, sha256: 'c'.repeat(64), obtidoEm: '2026-11-07T10:00:00Z' },
    { id: 'funai-teste', papel: 'areas', fonte: 'funai', url: 'https://exemplo.test/funai', tamanho: 1, sha256: 'd'.repeat(64), obtidoEm: '2026-11-07T10:00:00Z' },
  ];
  e.fontes.itens.push(...fontes);
  e.relatorio.insumos.push(...fontes.map((i) => ({ id: i.id, sha256: i.sha256 })));
  e.saidas['areas.json'] = { dados: Buffer.from(JSON.stringify([{ fonte: 'cnuc', codigo: 'A1', nome: 'Área fictícia', classe: 'protecao_integral', origem_rotulo: 'rotulo', geometria_geral: {}, geometria_real: {} }])) };
  e.saidas['deteccoes_areas.csv'] = { dados: Buffer.from('id_tecnico,fonte,codigo,posicao\naaaa:2,cnuc,A1,borda\n') };
  for (const nome of ['areas.json', 'deteccoes_areas.csv']) {
    const v = e.saidas[nome]; v.sha256 = sha256(v.dados);
    e.relatorio.saidas.push({ arquivo: nome, sha256: v.sha256, bytes: v.dados.length });
  }
  e.relatorio.areas = { total: 1, vinculos: 1 };
  const incompleta = { ...e, saidas: { ...e.saidas } };
  delete incompleta.saidas['areas.json'];
  assert.throws(() => construirCarga(incompleta), /Saídas de áreas ausentes/);
  const normal = construirCarga(e);
  assert.equal(normal.manifesto.metodo.areas, 'areas-006-v1');
  assert.equal(normal.manifesto.totais.areas, 1);
  assert.equal(normal.manifesto.totais.vinculos_area, 1);
  assert.equal(normal.dados.areas[0].fonte_chave, 'cnuc-teste');
  assert.deepEqual(normal.dados.deteccoes_areas[0], { id_tecnico: 'aaaa:2', area_fonte: 'cnuc', area_codigo: 'A1', posicao: 'borda' });
  const rollback = construirCarga({ ...e, semAreas: true, revisao: 2 });
  assert.notEqual(rollback.identidade, normal.identidade);
  assert.equal(camposDaCarga(rollback.manifesto, rollback.identidade).total_areas, null);
  assert.equal(rollback.manifesto.metodo.areas, undefined);
  assert.equal(rollback.dados.areas.length, 0);
  e.relatorio.areas.vinculos = 2;
  assert.throws(() => construirCarga(e), /Totais de áreas divergem/);
});
