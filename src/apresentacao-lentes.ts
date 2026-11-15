// Apresentação das lentes de seleção (plano 004): estado, metadados, parâmetros, lista de destaques,
// painel de motivo e evidência, e limitações. Todo valor entra por textContent. Nunca "coberto".
// Os estados da combinação (plano 005, T11) dividem o mesmo cartão e o mesmo `data-estado-lente`.
// Desde o plano 007 (item 2), a lista fica na aba Destaques e o painel abre na vista de explicação (V13).
import { $, h, tabela } from './apresentacao.ts';
import {
  caixaRessalvas, detalhesEvidencia, esquecerEvidencias, ficha, metadados, mostrarExplicacao, renderResumoLente, rotularAbaDestaques,
} from './apresentacao-resultado.ts';
import { ressalvasDeClasse, textoCobertura } from './lentes/cobertura.ts';
import { textoSemCelulas } from './lentes/combinacao.ts';
import type { Destaque, DiaRestritivo, RegistroLente, ResultadoLente, TipoLente } from './lentes/contrato.ts';
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
  // Combinação com menos de 2 lentes (T16): nada é calculado; a aba diz o que falta.
  | { tipo: 'incompleta'; texto: string }
  | { tipo: 'carregando'; etapa: 'registros' | 'areas' | 'disponibilidade'; feitos: number; total: number }
  | { tipo: 'completo'; segundos: number; combinacao?: boolean }
  | { tipo: 'sem_destaques'; segundos: number }
  | { tipo: 'janela_insuficiente'; segundos: number; texto: string }
  | { tipo: 'cobertura_nao_verificada'; combinacao?: boolean }
  // Combinação (plano 005, T11): sem células no "e" e no "ou", lente escolhida sem aplicação na janela e
  // versão de dados substituída durante ou depois da aplicação.
  | { tipo: 'sem_celulas_em_comum'; segundos: number }
  | { tipo: 'sem_celulas_destacadas'; segundos: number }
  | { tipo: 'indisponivel'; segundos: number; textos: string[] }
  // `lente`: a sobreposição (plano 006, T24) usa o mesmo estado, com o texto da lente.
  | { tipo: 'versao_substituida'; lente?: boolean }
  // Sobreposição sobre carga sem a camada de áreas (`total_areas` nulo): não é erro (T24, SB-14).
  | { tipo: 'sem_camada'; segundos: number }
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
    case 'nenhuma': return 'Nenhuma lente escolhida.';
    case 'incompleta': return e.texto;
    case 'carregando': return e.etapa === 'registros'
      ? `Carregando: registros ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)}…`
      : e.etapa === 'areas' ? 'Carregando: áreas protegidas e vínculos da carga…'
        : `Carregando: disponibilidade ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)} municípios…`;
    case 'completo': return `${e.combinacao ? 'Combinação concluída' : 'Lente concluída'} em ${segundos(e.segundos)} s.`;
    case 'sem_destaques': return `Lente concluída em ${segundos(e.segundos)} s, sem destaques nesta janela.`;
    case 'janela_insuficiente': return `Janela insuficiente: ${e.texto} Nenhum destaque; escolha uma janela maior.`;
    case 'cobertura_nao_verificada': return e.combinacao
      ? 'Combinação calculada, mas a cobertura de algumas células não foi verificada (falha na leitura da disponibilidade). As células não dependem da disponibilidade; tente de novo para qualificá-las.'
      : 'Lente calculada, mas a cobertura de alguns destaques não foi verificada (falha na leitura da disponibilidade). Os destaques não dependem da disponibilidade; tente de novo para qualificá-los.';
    case 'sem_celulas_em_comum': return `Combinação concluída em ${segundos(e.segundos)} s. ${textoSemCelulas('e')}`;
    case 'sem_celulas_destacadas': return `Combinação concluída em ${segundos(e.segundos)} s. ${textoSemCelulas('ou')}`;
    case 'indisponivel': return `Combinação indisponível nesta janela: ${e.textos.join('; ')}. Nenhuma célula foi calculada; escolha uma janela maior ou outras lentes.`;
    case 'versao_substituida': return `${e.lente ? 'Lente cancelada' : 'Combinação cancelada'}: a versão de dados foi substituída; recarregue a versão vigente e escolha a lente de novo.`;
    case 'sem_camada': return `Lente concluída em ${segundos(e.segundos)} s: esta versão dos dados não tem a camada de áreas protegidas.`;
    case 'contorno_indisponivel': return 'Lente calculada, mas o contorno de algum município destacado está indisponível no mapa; a lista e a explicação continuam válidas.';
    case 'leitura_inconsistente': return `Leitura inconsistente (${e.motivo}). Nenhum destaque foi exibido; tente de novo.`;
    case 'falha': return 'Fonte de dados indisponível. Nenhum destaque foi exibido; isso não indica ausência de detecções. Tente de novo.';
    case 'cancelada': return `Lente cancelada: ${e.motivo}`;
  }
}

export function renderEstadoLente(e: EstadoLente, m: ManipuladoresLente): void {
  const cartao = $('cartao-lentes');
  cartao.dataset['estadoLente'] = e.tipo;
  const alvo = $('lente-estado');
  // Sem lente, o estado vazio da aba (V13) diz o que fazer; o texto do estado fica só para o leitor de tela.
  // Tom de aviso só para o que pede atenção; conclusões e progresso ficam em texto de apoio.
  const calmo = ['carregando', 'incompleta', 'completo', 'sem_destaques', 'sem_celulas_em_comum', 'sem_celulas_destacadas'].includes(e.tipo);
  const classe = e.tipo === 'nenhuma' ? 'so-leitor' : calmo ? 'ajuda' : 'aviso-estado';
  alvo.replaceChildren(h('p', { class: classe }, textoEstado(e)));
  $('lente-vazio').hidden = e.tipo !== 'nenhuma';
  if (e.tipo === 'falha' || e.tipo === 'leitura_inconsistente' || e.tipo === 'cobertura_nao_verificada') {
    const b = h('button', { type: 'button', id: 'botao-lente-tentar', class: 'botao botao--secundario' }, 'Tentar de novo');
    b.addEventListener('click', () => m.tentarDeNovo());
    alvo.append(h('div', { class: 'acoes' }, b));
  }
}

/** Tira lista, explicação, resumo e o número da aba (nada de resultado antigo como se fosse atual, T16). */
export function limparCorpoLente(): void {
  $('lente-corpo').replaceChildren();
  mostrarExplicacao(null);
  renderResumoLente(null);
  rotularAbaDestaques(null);
  esquecerEvidencias();
}

export const TITULO_LENTE: Record<TipoLente, string> = {
  concentracao: 'Concentração',
  recorrencia: 'Recorrência',
  persistencia: 'Persistência',
};

/** Ressalva de contagem absoluta, junto do resultado da concentração (T15). */
export const RESSALVA_CONTAGEM = 'Contagem absoluta favorece municípios grandes; a ordem não indica prioridade, gravidade nem risco.';

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

function painel(r: ResultadoLente, d: Destaque, ctx: ContextoLente, m: ManipuladoresLente): HTMLElement {
  const lente = r.lente;
  const c = d.cobertura;
  const datas = lente === 'recorrencia' ? d.evidencia.datas.map(rotuloMes)
    : lente === 'persistencia' ? d.evidencia.datas.map(dataBr) : d.evidencia.datas;
  const rotuloDatas = lente === 'recorrencia' ? 'meses' : lente === 'persistencia' ? 'dias GMT' : 'datas';
  const n = d.evidencia.deteccoes.length;
  const u = d.unidade;
  const corpo = h('div', { id: 'lente-painel', class: 'painel-lente', 'data-destaque': d.id_destaque },
    h('h3', { tabindex: '-1', id: 'lente-painel-titulo' }, rotuloUnidade(d)),
    ficha(u.tipo === 'municipio'
      ? [['Município', u.nome], ['Código IBGE', String(u.codigo)], ['Detecções da evidência', fmtNumero(n)], ['Posição na lista', d.ordem ? `${d.ordem}º, por contagem` : '—']]
      : [['Célula 0,05°', u.id], ['Detecções da evidência', fmtNumero(n)],
        ['Município(s)', c.municipios.map((x) => ctx.nomes.get(x) ?? String(x)).join('; ')], ['Limites', `${u.sul} a ${u.norte} · ${u.oeste} a ${u.leste}`]]),
    h('p', { class: 'nota' }, `Destacado por: ${TITULO_LENTE[lente]}.`),
    h('section', { class: 'criterio', 'data-lente': lente, 'aria-label': `Critério: ${TITULO_LENTE[lente]}` },
      h('h4', {}, TITULO_LENTE[lente]),
      h('p', { id: 'lente-motivo' }, h('strong', {}, 'Motivo: '), d.motivo),
      h('p', { id: 'lente-evidencia' }, h('strong', {}, 'Evidência: '), `${fmtNumero(n)} detecções (registros principais da janela)${datas.length ? `; ${rotuloDatas}: ${datas.join(', ')}` : ''}.`)),
    h('p', { id: 'lente-cobertura', 'data-cobertura': c.estado }, h('strong', {}, 'Disponibilidade: '), textoCobertura(c)),
  );
  if (u.tipo === 'celula_005') {
    corpo.append(h('p', { id: 'lente-municipios', class: 'nota' }, h('strong', {}, 'Municípios considerados na disponibilidade: '),
      `${c.municipios.map((x) => nomeMunicipio(x, ctx.nomes)).join('; ')}. São os municípios das detecções da célula na janela; um dia só conta como sem evidência de lacuna se todos estiverem assim.`));
  }
  if (c.estado === 'completa' && c.demais_dias.length) {
    corpo.append(h('details', { class: 'detalhes' }, h('summary', {}, `Dias que contam contra (${c.demais_dias.length})`),
      h('ul', { class: 'lista-simples', id: 'lente-dias' }, ...c.demais_dias.map((dia) => h('li', { 'data-classe': dia.classe },
        `${dia.dia}: ${ROTULO_CLASSE[dia.classe].rotulo}`,
        h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, ctx.nomes)))))))));
  }
  let ressalvas: HTMLElement | null = null;
  if (lente === 'concentracao') {
    ressalvas = h('ul', { class: 'lista-simples', id: 'lente-ressalvas' }, h('li', {}, RESSALVA_CONTAGEM));
  } else if (d.ressalvas.length) {
    // Na persistência, cada ressalva por classe (D15, T7) leva aos municípios do dia, com classe e motivos.
    const dias = new Map(lente === 'persistencia'
      ? ressalvasDeClasse(d.evidencia.datas, r.janela, c).flatMap((x) => (x.dia ? [[x.texto, x.dia] as const] : []))
      : []);
    ressalvas = h('ul', { class: 'lista-simples', id: 'lente-ressalvas' }, ...d.ressalvas.map((txt) => {
      const dia = dias.get(txt);
      return dia
        ? h('li', { 'data-classe': dia.classe }, txt, h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, ctx.nomes)))))
        : h('li', {}, txt);
    }));
  }
  corpo.append(caixaRessalvas(ressalvas));
  if (u.tipo === 'municipio') {
    const codigo = u.codigo;
    const b = h('button', { type: 'button', id: 'botao-lente-consultar', class: 'botao botao--secundario' }, 'Consultar este município');
    b.addEventListener('click', () => m.consultarMunicipio(codigo));
    corpo.append(h('div', { class: 'acoes' }, b));
  } else {
    corpo.append(detalhesEvidencia(d.id_destaque, n, tabelaEvidencia(d, ctx, m)));
  }
  corpo.append(metadados({ carga: r.carga, janela: r.janela, versao: r.versao_metodo }));
  return corpo;
}

export function renderResultadoLente(r: ResultadoLente, selecionado: string | null, ctx: ContextoLente, m: ManipuladoresLente): void {
  const corpo = $('lente-corpo');
  corpo.replaceChildren();
  const municipios = r.lente === 'concentracao';
  rotularAbaDestaques(r.destaques.length);
  renderResumoLente({
    nome: TITULO_LENTE[r.lente], quantidade: r.destaques.length, unidade: municipios ? 'municipio' : 'celula', janela: r.janela,
    ordem: municipios ? 'por contagem; não é ranking' : 'norte→sul, oeste→leste; não é ranking',
  });
  if (municipios) corpo.append(h('p', { id: 'lente-ressalva-contagem', class: 'ressalva-contagem' }, RESSALVA_CONTAGEM));
  if (r.ordenacao) corpo.append(h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, `Lista ${r.ordenacao.rotulo}.`));
  else if (r.destaques.length) {
    corpo.append(h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, r.lente === 'persistencia'
      ? 'Lista pela data de início da sequência e depois pela ordem das células, de norte a sul e de oeste a leste; não é ranking.'
      : 'Lista na ordem das células, de norte a sul e de oeste a leste; não é ranking.'));
  }
  for (const o of r.observacoes) corpo.append(h('p', { class: 'ajuda lente-observacao' }, o));
  if (r.destaques.length) {
    const lista = h('ol', { class: 'destaques lista-celulas', id: 'lente-destaques', 'aria-label': 'Destaques da lente (alternativa em texto ao mapa)' });
    for (const d of r.destaques) {
      const b = h('button', { type: 'button', class: 'botao-nome', 'data-id': d.id_destaque, 'aria-pressed': String(d.id_destaque === selecionado) }, rotuloDestaque(r.lente, d));
      b.addEventListener('click', () => m.selecionar(d.id_destaque));
      lista.append(h('li', {}, b, h('span', { class: 'etiqueta', 'data-cobertura': d.cobertura.estado }, textoCobertura(d.cobertura))));
    }
    corpo.append(lista);
  }
  corpo.append(
    h('dl', { class: 'metadados', id: 'lente-parametros' }, ...r.parametros.flatMap((p) => [h('dt', {}, p.nome), h('dd', {}, p.valor)])),
    h('p', { id: 'lente-escopo', class: 'nota' },
      `Janela: ${r.janela.inicio} a ${r.janela.fim} (${r.janela.referencia}) · carga nº ${r.carga.id} · recorte: todo o estado de Mato Grosso (o filtro de município não se aplica às lentes) · método ${r.versao_metodo}.`),
    h('h3', { class: 'rotulo-secao' }, 'Limitações da lente'),
    h('ul', { class: 'lista-simples nota', id: 'lente-limitacoes' }, ...r.limitacoes.map((l) => h('li', {}, l))));
  const escolhido = r.destaques.find((d) => d.id_destaque === selecionado);
  mostrarExplicacao(escolhido ? painel(r, escolhido, ctx, m) : null, municipios ? 'Por que este município?' : 'Por que esta célula?');
}
