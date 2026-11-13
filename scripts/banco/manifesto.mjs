// Ciclo 003, issue #22 — manifesto canônico e linhas da carga (sem acesso a banco).
// Lê as saídas do item 1 (fontes fixadas, relatório, CSV) e monta o manifesto cuja identidade é o
// SHA-256 do JSON canônico: fontes e hashes, janela, envelope, método, hashes das saídas e totais.
// Timestamps de execução e UUIDs nunca entram na identidade.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AVISOS, BRUTOS, FONTES, LOCAL, SAIDAS, lerJson } from '../prototipo/caminhos.mjs';

export const FORMATO_MANIFESTO = 'rq-manifesto-1';
export const QUALIDADES_EXIBICAO = ['maxima', 'intermediaria', 'minima'];
export const EXIBICAO_PADRAO = 'intermediaria';
const SATELITE = 'AQUA_M-T';

export const sha256 = (dados) => createHash('sha256').update(dados).digest('hex');

// JSON canônico: chaves ordenadas, sem espaços; recusa valores que não são JSON puro.
export function canonico(valor) {
  if (valor === null || typeof valor === 'number' || typeof valor === 'boolean' || typeof valor === 'string') return JSON.stringify(valor);
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  if (typeof valor === 'object') {
    return `{${Object.keys(valor).sort().filter((k) => valor[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(',')}}`;
  }
  throw new Error(`Valor não canonizável: ${typeof valor}`);
}

export const identidadeDe = (manifesto) => sha256(canonico(manifesto));

// CSV com aspas duplas (RFC 4180) como o escreve processar.mjs. Devolve { cabecalho, linhas } de objetos.
export function lerCsv(texto) {
  const registros = [];
  let campo = '';
  let linha = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') {
      linha.push(campo);
      campo = '';
    } else if (c === '\n') {
      linha.push(campo);
      registros.push(linha);
      linha = [];
      campo = '';
    } else if (c !== '\r') campo += c;
  }
  if (campo !== '' || linha.length) {
    linha.push(campo);
    registros.push(linha);
  }
  const [cabecalho, ...resto] = registros;
  return {
    cabecalho,
    linhas: resto.map((r, n) => {
      if (r.length !== cabecalho.length) throw new Error(`CSV com ${r.length} colunas na linha ${n + 2}; esperado ${cabecalho.length}.`);
      return Object.fromEntries(cabecalho.map((k, j) => [k, r[j]]));
    }),
  };
}

const exigir = (condicao, mensagem) => {
  if (!condicao) throw new Error(mensagem);
};
const inteiroOuNulo = (v) => (v === '' || v === undefined ? null : Number(v));
const iso = (v) => new Date(v).toISOString().replace('.000Z', 'Z');

// Lê do disco as saídas do item 1 e confere, byte a byte, o que será carregado.
export async function carregarEntradas({ exibicao = EXIBICAO_PADRAO, semAreas = false, raizes = {} } = {}) {
  exigir(QUALIDADES_EXIBICAO.includes(exibicao), `Qualidade de exibição desconhecida: ${exibicao}`);
  const caminhos = { fontes: FONTES, avisos: AVISOS, saidas: SAIDAS, brutos: BRUTOS, relatorio: path.join(LOCAL, 'relatorio.json'), ...raizes };
  const fontes = await lerJson(caminhos.fontes);
  const avisos = await lerJson(caminhos.avisos);
  const relatorio = await lerJson(caminhos.relatorio);
  const ler = async (arquivo) => {
    const dados = await readFile(arquivo);
    return { dados, sha256: sha256(dados) };
  };
  const saidas = {};
  for (const nome of ['deteccoes.csv', 'disponibilidade.csv', ...(semAreas ? [] : ['areas.json', 'deteccoes_areas.csv'])]) saidas[nome] = await ler(path.join(caminhos.saidas, nome));
  const item = (id) => {
    const i = fontes.itens.find((x) => x.id === id);
    exigir(i, `Item de fonte ausente em fontes.json: ${id}`);
    return i;
  };
  const brutos = {};
  for (const id of [`ibge-malha-mt-municipios-${exibicao}`, 'ibge-malha-mt-municipios-maxima', 'ibge-municipios-mt']) {
    const arquivo = await ler(path.join(caminhos.brutos, item(id).destino));
    exigir(arquivo.sha256 === item(id).sha256, `SHA-256 de ${item(id).destino} diverge de fontes.json. Parado.`);
    brutos[id] = arquivo;
  }
  return { fontes, avisos, relatorio, saidas, brutos, exibicao, semAreas };
}

// Confere o encadeamento fontes → relatório → saídas e devolve { manifesto, identidade, dados }.
export function construirCarga(entradas) {
  const { fontes, avisos, relatorio, saidas, brutos, exibicao, revisao = 1 } = entradas;
  exigir(Number.isInteger(revisao) && revisao >= 1, 'A revisão do manifesto é um inteiro maior ou igual a 1.');
  exigir(relatorio.situacao === 'Pronto' && relatorio.paradas?.length === 0, 'Relatório do item 1 com parada ou ausente. Parado.');
  exigir(fontes.janela && fontes.envelope, 'Janela ou envelope não fixados em fontes.json.');
  exigir(fontes.contrato.satelite === SATELITE, `Satélite inesperado: ${fontes.contrato.satelite}`);

  // 1. Insumos: fontes.json e relatório precisam concordar em cada hash.
  for (const i of fontes.itens) {
    const r = relatorio.insumos.find((x) => x.id === i.id);
    exigir(r && r.sha256 === i.sha256, `Relatório não corresponde a fontes.json no item ${i.id}. Parado.`);
  }
  // 2. Saídas: o conteúdo lido é o que o relatório descreve.
  for (const [nome, arquivo] of Object.entries(saidas)) {
    const r = relatorio.saidas.find((x) => x.arquivo === nome);
    exigir(r && r.sha256 === arquivo.sha256 && r.bytes === arquivo.dados.length, `Saída ${nome} diverge do relatório. Parado.`);
  }

  // 3. Linhas.
  const deteccoesCsv = lerCsv(saidas['deteccoes.csv'].dados.toString('utf8'));
  const disponibilidadeCsv = lerCsv(saidas['disponibilidade.csv'].dados.toString('utf8'));
  const idsFonte = new Set(fontes.itens.map((i) => i.id));
  const deteccoes = deteccoesCsv.linhas.map((l) => {
    exigir(idsFonte.has(l.fonte), `Detecção de fonte desconhecida: ${l.fonte}`);
    exigir(['principal', 'envelope'].includes(l.escopo), `Escopo inesperado: ${l.escopo}`);
    exigir(['dentro', 'borda'].includes(l.posicao), `Posição inesperada: ${l.posicao}`);
    return {
      id_tecnico: l.id_tecnico, fonte_chave: l.fonte, linha: Number(l.linha), id_fonte: l.id_fonte === '' ? null : l.id_fonte,
      escopo: l.escopo, data_hora_gmt: `${l.data_hora_gmt.replace(' ', 'T')}Z`, latitude: Number(l.lat), longitude: Number(l.lon),
      municipio_codigo: Number(l.municipio_ibge), posicao: l.posicao === 'dentro' ? 'interior' : 'borda',
      municipio_inpe: inteiroOuNulo(l.municipio_inpe), estado_inpe: inteiroOuNulo(l.estado_inpe),
    };
  });
  const disponibilidade = disponibilidadeCsv.linhas.map((l) => ({
    dia: l.dia_gmt, satelite: l.satelite, municipio_codigo: Number(l.municipio_ibge), classe: l.classe,
    motivos: l.motivos.split('|'), alcance_historico: l.historico, avisos: l.avisos === '' ? [] : l.avisos.split('|'),
  }));

  const nomes = Object.fromEntries(JSON.parse(brutos['ibge-municipios-mt'].dados.toString('utf8')).map((m) => [String(m.id), m.nome]));
  const malha = JSON.parse(brutos[`ibge-malha-mt-municipios-${exibicao}`].dados.toString('utf8'));
  const municipios = malha.features.map((f) => {
    const codigo = Number(f.properties.codarea);
    exigir(nomes[String(codigo)], `Município ${codigo} sem nome na lista de localidades.`);
    return { codigo, nome: nomes[String(codigo)], geometria_exibicao: f.geometry };
  }).sort((a, b) => a.codigo - b.codigo);
  const codigos = new Set(municipios.map((m) => m.codigo));
  exigir(codigos.size === municipios.length, 'Município repetido na malha de exibição.');
  exigir(deteccoes.every((d) => codigos.has(d.municipio_codigo)), 'Detecção em município fora da malha de exibição.');
  exigir(disponibilidade.every((d) => codigos.has(d.municipio_codigo)), 'Disponibilidade em município fora da malha de exibição.');

  const comAreas = !entradas.semAreas;
  if (comAreas) exigir(saidas['areas.json'] && saidas['deteccoes_areas.csv'], 'Saídas de áreas ausentes. Parado.');
  const fonteArea = Object.fromEntries(fontes.itens.filter((i) => i.papel === 'areas').map((i) => [i.fonte, i.id]));
  const areas = comAreas ? JSON.parse(saidas['areas.json'].dados.toString('utf8')).map((a) => {
    exigir(fonteArea[a.fonte], `Fonte da área ausente: ${a.fonte}`);
    return { ...a, fonte_chave: fonteArea[a.fonte] };
  }) : [];
  const deteccoes_areas = comAreas ? lerCsv(saidas['deteccoes_areas.csv'].dados.toString('utf8')).linhas.map((v) => ({
    id_tecnico: v.id_tecnico, area_fonte: v.fonte, area_codigo: v.codigo, posicao: v.posicao,
  })) : [];
  if (comAreas) {
    exigir(areas.length === relatorio.areas?.total && deteccoes_areas.length === relatorio.areas?.vinculos, 'Totais de áreas divergem do relatório.');
  }

  // 4. Totais conferidos contra o relatório e contra as linhas lidas.
  const totais = {
    principal: deteccoes.filter((d) => d.escopo === 'principal').length,
    envelope: deteccoes.filter((d) => d.escopo === 'envelope').length,
    municipios: municipios.length,
    disponibilidade: disponibilidade.length,
  };
  if (comAreas) { totais.areas = areas.length; totais.vinculos_area = deteccoes_areas.length; }
  exigir(totais.principal === relatorio.totais.principal && totais.envelope === relatorio.totais.envelope, 'Totais de detecções divergem do relatório.');
  exigir(totais.municipios === relatorio.territorio.municipiosNaMalha, 'Municípios divergem do relatório.');
  exigir(totais.disponibilidade === relatorio.disponibilidade.municipioDias, 'Disponibilidade diverge do relatório.');

  // 5. Manifesto canônico.
  const regra = avisos.decisaoH3?.regra;
  exigir(regra, 'Regra de histórico (H3) não registrada em avisos.json. Parado.');
  const janela = { inicio: iso(`${fontes.janela.inicio}T00:00:00Z`), fim: iso(`${fontes.janela.fim}T00:00:00Z`) };
  const envelope = fontes.envelope.depois ? { inicio: iso(fontes.envelope.depois.inicio), fim: iso(fontes.envelope.depois.fim) } : null;
  const metodo = {
    formato: 'rq-metodo-1', kb: 'KB-004', classificacao: 'maxima', exibicao, regra_historico: regra, revisao,
    desvio_horas_sensibilidade: fontes.envelope.desvioHoras,
  };
  if (comAreas) {
    exigir(fonteArea.cnuc && fonteArea.funai, 'As duas fontes de áreas são obrigatórias.');
    metodo.areas = 'areas-006-v1';
    metodo.parametros_areas = {
      leitura: { formato: 'shp_polygon', crs: 'SIRGAS_2000_geografico', codificacao: { cnuc: 'utf-8', funai: 'iso-8859-1' }, null_shape: 'somente_registro_excluido' },
      classes: ['protecao_integral', 'uso_sustentavel', 'terra_indigena'],
      exclusoes: ['rppn', 'zona_amortecimento', 'inativa', 'em_estudo'],
      pertencimento: 'poligono_integral_borda_incluida_principal', selecao: 'rotulo_mt_ou_vinculo',
      exibicao: { algoritmo: 'douglas_peucker_anel_fechado', tolerancias_graus: [0.005, 0.001, 0.0005, 0.00025, 0.000125, 0],
        casas_geral: 4, casas_real: [5, 6, 8, 14], recuo_buraco_graus: 0.0000001,
        limite_reparo_graus: 0.0000008, validar_topologia: true, preservar_aneis_pequenos: true },
    };
  }
  const fontesCarga = fontes.itens.filter((i) => comAreas || i.papel !== 'areas');
  const manifesto = {
    formato: FORMATO_MANIFESTO,
    satelite: SATELITE,
    janela, envelope, fuso_sensibilidade: fontes.envelope.fuso,
    metodo,
    fontes: fontesCarga.map((i) => ({ chave: i.id, papel: i.papel, url: i.url, sha256: i.sha256, bytes: i.tamanho })).sort((a, b) => a.chave.localeCompare(b.chave)),
    saidas: Object.entries(saidas).filter(([arquivo]) => comAreas || !['areas.json', 'deteccoes_areas.csv'].includes(arquivo)).map(([arquivo, s]) => ({ arquivo, sha256: s.sha256 })).sort((a, b) => a.arquivo.localeCompare(b.arquivo)),
    totais,
  };

  const condicao = (fonte) => {
    const c = fontes.condicoesDeUso.fontes.find((x) => x.fonte.startsWith(fonte));
    return c ? `${c.uso}: ${c.resumo}` : 'não registrada';
  };
  const dados = {
    fontes: fontesCarga.map((i) => ({ chave: i.id, papel: i.papel, url: i.url, sha256: i.sha256, bytes: i.tamanho, obtida_em: i.obtidoEm, condicoes_uso: condicao(i.fonte) })),
    malhas: [
      { uso: 'classificacao', fonte_chave: 'ibge-malha-mt-municipios-maxima', qualidade: 'maxima', parametros: { calculo: 'integral', coordenadas: 'originais' } },
      { uso: 'exibicao', fonte_chave: `ibge-malha-mt-municipios-${exibicao}`, qualidade: exibicao, parametros: { uso: 'visual', simplificada: exibicao !== 'maxima' } },
    ],
    municipios, deteccoes, disponibilidade, areas, deteccoes_areas,
  };
  return { manifesto, identidade: identidadeDe(manifesto), dados };
}

// Campos do manifesto aprovado e da carga (mesma ordem de privado.manifestos_aprovados).
export function camposDaCarga(manifesto, identidade) {
  return {
    identidade, satelite: manifesto.satelite, janela_inicio: manifesto.janela.inicio, janela_fim: manifesto.janela.fim,
    envelope_inicio: manifesto.envelope?.inicio ?? null, envelope_fim: manifesto.envelope?.fim ?? null,
    fuso_sensibilidade: manifesto.fuso_sensibilidade, metodo: manifesto.metodo,
    total_principal: manifesto.totais.principal, total_envelope: manifesto.totais.envelope,
    total_municipios: manifesto.totais.municipios, total_disponibilidade: manifesto.totais.disponibilidade,
    total_areas: manifesto.totais.areas ?? null, total_vinculos_area: manifesto.totais.vinculos_area ?? null,
  };
}

const literal = (v) => (v === null ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replaceAll("'", "''")}'`);

// SQL administrativo (D1 do responsável): o proprietário revisa e executa; o EX não aprova a própria carga.
export function sqlAprovacao(manifesto, identidade) {
  const c = camposDaCarga(manifesto, identidade);
  const colunas = Object.keys(c);
  const valores = colunas.map((k) => (k === 'metodo' ? `${literal(JSON.stringify(c[k]))}::jsonb` : literal(c[k])));
  return `-- Manifesto aprovado da carga ${identidade}\n-- Executar como proprietário do banco, depois de revisar o plano.\n`
    + `insert into privado.manifestos_aprovados (${colunas.join(', ')})\nvalues (${valores.join(', ')});\n`;
}

// Bytes do conteúdo serializado a gravar, por tabela (base da estimativa de consumo).
export function bytesDoPayload(dados) {
  return Object.fromEntries(Object.entries(dados).map(([k, v]) => [k, Buffer.byteLength(JSON.stringify(v))]));
}
