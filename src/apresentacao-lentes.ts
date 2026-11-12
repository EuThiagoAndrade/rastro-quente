// Apresentação das lentes de seleção (plano 004): estado, metadados, parâmetros, lista de destaques,
// painel de motivo e evidência, e limitações. Todo valor entra por textContent. Nunca "coberto".
// Os estados da combinação (plano 005, T11) dividem o mesmo cartão e o mesmo `data-estado-lente`.
import { $, h, tabela } from './apresentacao.ts';
import { ressalvasDeClasse, textoCobertura } from './lentes/cobertura.ts';
import { textoSemCelulas } from './lentes/combinacao.ts';
import type { Destaque, DiaRestritivo, Janela, RegistroLente, ResultadoLente, TipoLente } from './lentes/contrato.ts';
import { rotuloMes } from './lentes/recorrencia.ts';
import { fmtDataHoraGmt, fmtNumero, humanizar, ROTULO_CLASSE } from './formato.ts';

/** Detecções da evidência de célula por página do painel. */
export const EVIDENCIA_POR_PAGINA = 20;

/** O que o painel precisa além do resultado: nomes, registros em memória e a página da evidência. */
export interface ContextoLente {
  nomes: Map<number, string>;
  registros: Map<string, RegistroLente>;
  paginaEvidencia: number;
}

export type EstadoLente =
  | { tipo: 'nenhuma' }
  | { tipo: 'carregando'; etapa: 'registros' | 'disponibilidade'; feitos: number; total: number }
  | { tipo: 'completo'; segundos: number; combinacao?: boolean }
  | { tipo: 'sem_destaques'; segundos: number }
  | { tipo: 'janela_insuficiente'; segundos: number; texto: string }
  | { tipo: 'cobertura_nao_verificada'; combinacao?: boolean }
  // Combinação (plano 005, T11): sem células no "e" e no "ou", lente escolhida sem aplicação na janela e
  // versão de dados substituída durante ou depois da aplicação.
  | { tipo: 'sem_celulas_em_comum'; segundos: number }
  | { tipo: 'sem_celulas_destacadas'; segundos: number }
  | { tipo: 'indisponivel'; segundos: number; textos: string[] }
  | { tipo: 'versao_substituida' }
  | { tipo: 'contorno_indisponivel' }
  | { tipo: 'leitura_inconsistente'; motivo: string }
  | { tipo: 'falha' }
  | { tipo: 'cancelada'; motivo: string };

export interface ManipuladoresLente {
  tentarDeNovo(): void;
  selecionar(id: string): void;
  consultarMunicipio(codigo: number): void;
  paginaEvidencia(pagina: number): void;
}

const segundos = (s: number): string => s.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function textoEstado(e: EstadoLente): string {
  switch (e.tipo) {
    case 'nenhuma': return 'Nenhuma lente aplicada.';
    case 'carregando': return e.etapa === 'registros'
      ? `Carregando: registros ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)}…`
      : `Carregando: disponibilidade ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)} municípios…`;
    case 'completo': return `${e.combinacao ? 'Combinação concluída' : 'Lente concluída'} em ${segundos(e.segundos)} s.`;
    case 'sem_destaques': return `Lente concluída em ${segundos(e.segundos)} s, sem destaques nesta janela.`;
    case 'janela_insuficiente': return `Janela insuficiente: ${e.texto} Nenhum destaque; escolha uma janela maior.`;
    case 'cobertura_nao_verificada': return e.combinacao
      ? 'Combinação aplicada, mas a cobertura de algumas células não foi verificada (falha na leitura da disponibilidade). As células não dependem da disponibilidade; tente de novo para qualificá-las.'
      : 'Lente aplicada, mas a cobertura de alguns destaques não foi verificada (falha na leitura da disponibilidade). Os destaques não dependem da disponibilidade; tente de novo para qualificá-los.';
    case 'sem_celulas_em_comum': return `Combinação concluída em ${segundos(e.segundos)} s. ${textoSemCelulas('e')}`;
    case 'sem_celulas_destacadas': return `Combinação concluída em ${segundos(e.segundos)} s. ${textoSemCelulas('ou')}`;
    case 'indisponivel': return `Combinação indisponível nesta janela: ${e.textos.join('; ')}. Nenhuma célula foi calculada; escolha uma janela maior ou outras lentes.`;
    case 'versao_substituida': return 'Combinação cancelada: a versão de dados foi substituída; recarregue a versão vigente e aplique de novo.';
    case 'contorno_indisponivel': return 'Lente aplicada, mas o contorno de algum município destacado está indisponível no mapa; a lista e o painel continuam válidos.';
    case 'leitura_inconsistente': return `Leitura inconsistente (${e.motivo}). Nenhum destaque foi exibido; tente de novo.`;
    case 'falha': return 'Fonte de dados indisponível. Nenhum destaque foi exibido; isso não indica ausência de detecções. Tente de novo.';
    case 'cancelada': return `Lente cancelada: ${e.motivo}`;
  }
}

export function renderEstadoLente(e: EstadoLente, m: ManipuladoresLente): void {
  const cartao = $('cartao-lentes');
  cartao.dataset['estadoLente'] = e.tipo;
  const alvo = $('lente-estado');
  alvo.replaceChildren(h('p', { class: e.tipo === 'carregando' || e.tipo === 'nenhuma' ? 'ajuda' : 'aviso-estado' }, textoEstado(e)));
  if (e.tipo === 'falha' || e.tipo === 'leitura_inconsistente' || e.tipo === 'cobertura_nao_verificada') {
    const b = h('button', { type: 'button', id: 'botao-lente-tentar', class: 'botao botao--secundario' }, 'Tentar de novo');
    b.addEventListener('click', () => m.tentarDeNovo());
    alvo.append(h('div', { class: 'acoes' }, b));
  }
}

export function limparCorpoLente(): void {
  $('lente-corpo').replaceChildren();
}

export const nomeMunicipio = (codigo: number, nomes: Map<number, string>): string => `${nomes.get(codigo) ?? 'município'} (${codigo})`;

function rotuloUnidade(d: Destaque): string {
  return d.unidade.tipo === 'municipio' ? d.unidade.nome : `Célula ${d.unidade.sul} a ${d.unidade.norte} · ${d.unidade.oeste} a ${d.unidade.leste}`;
}

/** "2026-10-12" → "12/10/2026". */
export const dataBr = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;

function rotuloDestaque(lente: TipoLente, d: Destaque): string {
  const deteccoes = `${fmtNumero(d.evidencia.deteccoes.length)} detecções`;
  const datas = d.evidencia.datas;
  const valor = lente === 'recorrencia' ? `${fmtNumero(d.evidencia.valor)} meses GMT (${deteccoes})`
    : lente === 'persistencia' ? `${fmtNumero(d.evidencia.valor)} dias GMT seguidos, ${dataBr(datas[0] ?? '')} a ${dataBr(datas.at(-1) ?? '')} (${deteccoes})`
      : deteccoes;
  return d.ordem ? `${d.ordem}. ${rotuloUnidade(d)} — ${valor}` : `${rotuloUnidade(d)} — ${valor}`;
}

/** Tabela paginada das detecções que sustentam um destaque de célula, declarando "N de M". */
function tabelaEvidencia(d: Destaque, ctx: ContextoLente, m: ManipuladoresLente): HTMLElement {
  const total = d.evidencia.deteccoes.length;
  const paginas = Math.max(1, Math.ceil(total / EVIDENCIA_POR_PAGINA));
  const pagina = Math.min(Math.max(0, ctx.paginaEvidencia), paginas - 1);
  const de = pagina * EVIDENCIA_POR_PAGINA;
  const ids = d.evidencia.deteccoes.slice(de, de + EVIDENCIA_POR_PAGINA);
  const linhas = ids.map((id) => {
    const r = ctx.registros.get(id);
    return r
      ? [fmtDataHoraGmt(r.data_hora_gmt), nomeMunicipio(r.municipio_codigo, ctx.nomes), String(r.latitude), String(r.longitude), id]
      : ['—', '—', '—', '—', id];
  });
  const anterior = h('button', { type: 'button', id: 'evidencia-anterior', class: 'botao botao--secundario', disabled: pagina === 0 }, 'Detecções anteriores');
  const proxima = h('button', { type: 'button', id: 'evidencia-proxima', class: 'botao botao--secundario', disabled: pagina >= paginas - 1 }, 'Próximas detecções');
  anterior.addEventListener('click', () => m.paginaEvidencia(pagina - 1));
  proxima.addEventListener('click', () => m.paginaEvidencia(pagina + 1));
  return h('div', { id: 'lente-evidencia-tabela' },
    h('p', { id: 'lente-evidencia-info', class: 'ajuda', tabindex: '-1' }, `Mostrando ${fmtNumero(total === 0 ? 0 : de + 1)}–${fmtNumero(de + ids.length)} de ${fmtNumero(total)} detecções da evidência.`),
    tabela('Detecções da evidência do destaque', ['Data e hora (GMT)', 'Município', 'Latitude', 'Longitude', 'ID técnico'], linhas, 'Tabela de detecções da evidência'),
    h('div', { class: 'acoes' }, anterior, proxima));
}

/** Município do dia, com a classe e os motivos daquele município, sem fundir motivos (T7). */
export const linhaMunicipio = (x: DiaRestritivo['municipios'][number], nomes: Map<number, string>): string =>
  `${nomeMunicipio(x.codigo, nomes)}: ${ROTULO_CLASSE[x.classe].rotulo}${x.motivos.length ? ` (${x.motivos.map(humanizar).join('; ')})` : ''}`;

function painel(lente: TipoLente, janela: Janela, d: Destaque, ctx: ContextoLente, m: ManipuladoresLente): HTMLElement {
  const c = d.cobertura;
  const datas = lente === 'recorrencia' ? d.evidencia.datas.map(rotuloMes)
    : lente === 'persistencia' ? d.evidencia.datas.map(dataBr) : d.evidencia.datas;
  const rotuloDatas = lente === 'recorrencia' ? 'meses' : lente === 'persistencia' ? 'dias GMT' : 'datas';
  const corpo = h('div', { id: 'lente-painel', class: 'painel-lente', 'data-destaque': d.id_destaque },
    h('h3', { tabindex: '-1', id: 'lente-painel-titulo' }, rotuloUnidade(d)),
    h('p', { id: 'lente-motivo' }, h('strong', {}, 'Motivo: '), d.motivo),
    h('p', { id: 'lente-evidencia' }, h('strong', {}, 'Evidência: '), `${fmtNumero(d.evidencia.deteccoes.length)} detecções (registros principais da janela)${datas.length ? `; ${rotuloDatas}: ${datas.join(', ')}` : ''}.`),
    h('p', { id: 'lente-cobertura', 'data-cobertura': c.estado }, h('strong', {}, 'Disponibilidade: '), textoCobertura(c)),
  );
  if (d.unidade.tipo === 'celula_005') {
    corpo.append(h('p', { id: 'lente-municipios' }, h('strong', {}, 'Municípios considerados na disponibilidade: '),
      `${c.municipios.map((x) => nomeMunicipio(x, ctx.nomes)).join('; ')}. São os municípios das detecções da célula na janela; um dia só conta como sem evidência de lacuna se todos estiverem assim.`));
  }
  if (c.estado === 'completa' && c.demais_dias.length) {
    corpo.append(h('details', { class: 'detalhes' }, h('summary', {}, `Dias que contam contra (${c.demais_dias.length})`),
      h('ul', { class: 'lista-simples', id: 'lente-dias' }, ...c.demais_dias.map((dia) => h('li', { 'data-classe': dia.classe },
        `${dia.dia}: ${ROTULO_CLASSE[dia.classe].rotulo}`,
        h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, ctx.nomes)))))))));
  }
  if (d.ressalvas.length) {
    // Na persistência, cada ressalva por classe (D15, T7) leva aos municípios do dia, com classe e motivos.
    const dias = new Map(lente === 'persistencia'
      ? ressalvasDeClasse(d.evidencia.datas, janela, c).flatMap((x) => (x.dia ? [[x.texto, x.dia] as const] : []))
      : []);
    corpo.append(h('ul', { class: 'lista-simples', id: 'lente-ressalvas' }, ...d.ressalvas.map((r) => {
      const dia = dias.get(r);
      return dia
        ? h('li', { 'data-classe': dia.classe }, r, h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, ctx.nomes)))))
        : h('li', {}, r);
    })));
  }
  if (d.unidade.tipo === 'municipio') {
    const codigo = d.unidade.codigo;
    const b = h('button', { type: 'button', id: 'botao-lente-consultar', class: 'botao botao--secundario' }, 'Consultar este município');
    b.addEventListener('click', () => m.consultarMunicipio(codigo));
    corpo.append(h('div', { class: 'acoes' }, b));
  } else {
    corpo.append(tabelaEvidencia(d, ctx, m));
  }
  return corpo;
}

export function renderResultadoLente(r: ResultadoLente, selecionado: string | null, ctx: ContextoLente, m: ManipuladoresLente): void {
  const corpo = $('lente-corpo');
  corpo.replaceChildren();
  corpo.append(
    h('p', { id: 'lente-escopo', class: 'ajuda' },
      `Janela: ${r.janela.inicio} a ${r.janela.fim} (${r.janela.referencia}) · carga nº ${r.carga.id} · recorte: todo o estado de Mato Grosso (o filtro de município não se aplica às lentes) · método ${r.versao_metodo}.`),
    h('dl', { class: 'definicoes', id: 'lente-parametros' }, ...r.parametros.flatMap((p) => [h('dt', {}, p.nome), h('dd', {}, p.valor)])),
  );
  if (r.ordenacao) corpo.append(h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, `Lista ${r.ordenacao.rotulo}.`));
  else if (r.destaques.length) {
    corpo.append(h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, r.lente === 'persistencia'
      ? 'Lista pela data de início da sequência e depois pela ordem das células, de norte a sul e de oeste a leste; não é ranking.'
      : 'Lista na ordem das células, de norte a sul e de oeste a leste; não é ranking.'));
  }
  for (const o of r.observacoes) corpo.append(h('p', { class: 'ajuda lente-observacao' }, o));
  if (r.destaques.length) {
    const lista = h('ol', { class: 'destaques', id: 'lente-destaques' });
    for (const d of r.destaques) {
      const b = h('button', { type: 'button', class: 'botao-nome', 'data-id': d.id_destaque, 'aria-pressed': String(d.id_destaque === selecionado) }, rotuloDestaque(r.lente, d));
      b.addEventListener('click', () => m.selecionar(d.id_destaque));
      lista.append(h('li', {}, b, h('span', { class: 'etiqueta', 'data-cobertura': d.cobertura.estado }, textoCobertura(d.cobertura))));
    }
    corpo.append(lista);
    const escolhido = r.destaques.find((d) => d.id_destaque === selecionado);
    if (escolhido) corpo.append(painel(r.lente, r.janela, escolhido, ctx, m));
  }
  corpo.append(h('h3', {}, 'Limitações da lente'), h('ul', { class: 'lista-simples', id: 'lente-limitacoes' }, ...r.limitacoes.map((l) => h('li', {}, l))));
}
