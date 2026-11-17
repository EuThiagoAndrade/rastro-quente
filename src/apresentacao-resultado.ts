// Coluna de resultado (plano 007, item 2): abas Destaques e Municípios (padrão de abas acessível), lista ↔
// explicação com "Voltar aos destaques", resumo da lente, cartão do município, lista estadual ordenável e a
// "Lista de focos" (T21). Todo valor da fonte entra por textContent.
import { $, h } from './apresentacao.ts';
import { fmtDataHoraGmt, fmtNumero, larguraProporcional, ROTULO_DIVERGENCIA } from './formato.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import { linhaCelulasDestacadas, listaMunicipios, numerosMunicipio, type DestaquesAtivos, type OrdemMunicipios } from './municipios.ts';
import type { Registro, Resumo } from './tipos.ts';

export type Aba = 'destaques' | 'municipios' | 'comparacao';

const ABAS: readonly { aba: Aba; botao: string; painel: string }[] = [
  { aba: 'destaques', botao: 'aba-destaques', painel: 'cartao-lentes' },
  { aba: 'municipios', botao: 'aba-municipios', painel: 'painel-municipios' },
  // Comparação (ciclo 008): a aba só aparece com um modo de comparação escolhido.
  { aba: 'comparacao', botao: 'aba-comparacao', painel: 'painel-comparacao' },
];

/** Abre uma aba; com `focar`, o foco vai para o botão da aba (navegação por setas). */
export function abrirAba(aba: Aba, focar = false): void {
  for (const x of ABAS) {
    const ativa = x.aba === aba;
    const b = $(x.botao);
    b.setAttribute('aria-selected', String(ativa));
    b.tabIndex = ativa ? 0 : -1;
    $(x.painel).hidden = !ativa;
  }
  if (focar) $(ABAS.find((x) => x.aba === aba)?.botao ?? 'aba-municipios').focus();
}

export const abaAberta = (): Aba => ABAS.find((x) => $(x.botao).getAttribute('aria-selected') === 'true')?.aba ?? 'municipios';

/** Ligação das abas: clique e setas esquerda/direita, Home e End, só entre as abas visíveis. */
export function ligarAbas(aoAbrir: (aba: Aba) => void = () => {}): void {
  for (const x of ABAS) {
    const b = $(x.botao);
    b.addEventListener('click', () => { abrirAba(x.aba); aoAbrir(x.aba); });
    b.addEventListener('keydown', (ev) => {
      const visiveis = ABAS.filter((y) => !$(y.botao).hidden);
      const i = visiveis.findIndex((y) => y.aba === x.aba);
      const alvo = ev.key === 'ArrowRight' ? visiveis[(i + 1) % visiveis.length]
        : ev.key === 'ArrowLeft' ? visiveis[(i - 1 + visiveis.length) % visiveis.length]
          : ev.key === 'Home' ? visiveis[0] : ev.key === 'End' ? visiveis.at(-1) : undefined;
      if (!alvo) return;
      ev.preventDefault();
      abrirAba(alvo.aba, true);
      aoAbrir(alvo.aba);
    });
  }
}

/** Rótulo da aba: "Lentes · N" com um resultado; "Lentes" sem lente ou sem resultado (ciclo 009). */
export function rotularAbaDestaques(n: number | null): void {
  $('aba-destaques').textContent = n === null ? 'Lentes' : `Lentes · ${fmtNumero(n)}`;
}

export interface ResumoLente {
  /** Título do resultado na aba Lentes: a opção ativa (ciclo 009, BL-017). */
  titulo: string;
  nome: string;
  quantidade: number;
  unidade: 'celula' | 'municipio';
  janela: { inicio: string; fim: string };
  ordem: string;
  /** Nome do município do recorte da lente; `null` é todo Mato Grosso (plano 007, T5). */
  municipio: string | null;
}

/** Recorte da lente nos metadados (T5): todo o estado ou só os focos do município. */
export function textoRecorteLente(recorte: { tipo: 'estado' | 'municipio'; municipio: number | null }, nomes: Map<number, string>): string {
  if (recorte.tipo === 'estado' || recorte.municipio === null) return 'recorte: todo o estado de Mato Grosso';
  return `recorte: só os focos de ${nomes.get(recorte.municipio) ?? `município ${recorte.municipio}`}`;
}

/** Nome do município do recorte da lente, ou `null` no estado. */
export const municipioDoRecorte = (recorte: { tipo: 'estado' | 'municipio'; municipio: number | null }, nomes: Map<number, string>): string | null =>
  recorte.tipo === 'municipio' && recorte.municipio !== null ? (nomes.get(recorte.municipio) ?? `município ${recorte.municipio}`) : null;

const dataBr = (d: string) => d.split('-').reverse().join('/');

/** Bloco de resumo da lista (V13): nome da lente, quantidade e o recorte da lente (T5). */
export function renderResumoLente(r: ResumoLente | null): void {
  const alvo = $('resumo-lente');
  alvo.hidden = r === null;
  if (!r) {
    alvo.replaceChildren();
    $('t-destaques').textContent = 'Lentes';
    return;
  }
  const plural = r.unidade === 'celula' ? (r.quantidade === 1 ? 'lugar' : 'lugares') : (r.quantidade === 1 ? 'município' : 'municípios');
  $('t-destaques').textContent = r.titulo;
  const perguntas: Record<string, string> = { 'Concentração': 'Onde há mais focos acumulados?', 'Recorrência': 'Onde os focos voltam em meses diferentes no mesmo lugar?', 'Persistência': 'Onde os focos seguem dia após dia, sem pausa?', 'Sobreposição com áreas protegidas': 'Quais focos caem dentro de áreas protegidas?', 'Combinação de lentes': 'Onde mais de uma lente aponta para o mesmo lugar?' };
  alvo.replaceChildren(
    h('p', { class: 'nota' }, perguntas[r.titulo] ?? 'O que foi encontrado no período escolhido?'),
    h('div', { class: 'so-leitor', id: 'resumo-lente-numero' }, `${fmtNumero(r.quantidade)} ${plural}`),
    h('div', { class: 'nota', id: 'resumo-lente-recorte' }, `${r.municipio === null ? 'em todo Mato Grosso' : `calculada só com os focos de ${r.municipio}`} · ${dataBr(r.janela.inicio)} a ${dataBr(r.janela.fim)}`));
}

/** Mostra a explicação de um destaque (ou volta à lista, com `null`). */
export function mostrarExplicacao(painel: HTMLElement | null, titulo = 'Por que este destaque?'): void {
  const alvo = $('lente-explicacao');
  if (painel) {
    alvo.replaceChildren(painel);
    $('t-explicacao').textContent = titulo;
  } else {
    alvo.replaceChildren();
  }
  $('vista-lista').hidden = painel !== null;
  $('vista-explicacao').hidden = painel === null;
}

export const explicacaoAberta = (): boolean => !$('vista-explicacao').hidden;

// --- Aba Municípios ---------------------------------------------------------------------------------------

export interface ContextoMunicipios {
  resumo: Resumo;
  nomeMunicipio: string | null;
  ordem: OrdemMunicipios;
  ativos: DestaquesAtivos | null;
  nomeLente: string | null;
  /** Registros da leitura estadual da lente (contagem por destaques). */
  registrosLente: readonly RegistroLente[];
  /** Leitura completa do recorte aplicado: registros, carregando ou erro (T7). */
  leitura: readonly RegistroLente[] | 'carregando' | 'erro';
}

export interface ManipuladoresMunicipios {
  escolher(codigo: number | null): void;
  ordenar(ordem: OrdemMunicipios): void;
}

const ROTULO_ORDEM: Record<OrdemMunicipios, string> = { deteccoes: 'Detecções', destaques: 'Destaques da lente', nome: 'Nome' };

function cartaoMunicipio(ctx: ContextoMunicipios, m: ManipuladoresMunicipios): HTMLElement {
  const leitura = ctx.leitura;
  const n = numerosMunicipio(ctx.resumo, Array.isArray(leitura) ? leitura : null);
  const celulas = leitura === 'carregando' ? 'carregando' : leitura === 'erro' ? 'indisponível' : fmtNumero(n.celulas ?? 0);
  const linha = linhaCelulasDestacadas(ctx.ativos);
  const dl = h('dl', { id: 'cartao-municipio-numeros' },
    h('dt', {}, 'Focos no período'), h('dd', { id: 'cartao-focos' }, fmtNumero(n.focos)),
    h('dt', {}, 'Dias com foco'), h('dd', { id: 'cartao-dias' }, fmtNumero(n.dias)),
    h('dt', {}, 'Células com foco'), h('dd', { id: 'cartao-celulas', 'data-estado': Array.isArray(leitura) ? 'completo' : (leitura as 'carregando' | 'erro') }, celulas));
  if (linha) {
    dl.append(h('dt', {}, ctx.nomeLente ? `Células destacadas (${ctx.nomeLente})` : 'Células destacadas'),
      h('dd', { id: 'cartao-destacadas' }, linha.valor, linha.nota ? h('span', { class: 'cartao-mun__nota' }, linha.nota) : null));
  }
  const voltar = h('button', { type: 'button', id: 'botao-todo-estado', class: 'botao botao--secundario' }, 'Ver todo Mato Grosso');
  voltar.addEventListener('click', () => m.escolher(null));
  return h('div', { class: 'cartao-mun', id: 'cartao-municipio' }, h('h3', {}, ctx.nomeMunicipio ?? ''), dl,
    leitura === 'erro' ? h('p', { class: 'aviso-estado' }, 'A leitura dos registros do recorte falhou; as células com foco não foram contadas. Os demais números continuam válidos.') : null,
    voltar);
}

export function renderMunicipios(ctx: ContextoMunicipios, m: ManipuladoresMunicipios): void {
  const corpo = $('municipios-corpo');
  // Refazer a aba não tira o foco de quem está nela (a leitura completa chega depois e refaz o cartão).
  const ativo = document.activeElement;
  const seletor = ativo instanceof HTMLElement && corpo.contains(ativo)
    ? (ativo.id ? `#${ativo.id}` : ativo.dataset['ordem'] ? `[data-ordem="${ativo.dataset['ordem']}"]` : ativo.dataset['codigo'] ? `[data-codigo="${ativo.dataset['codigo']}"]` : null)
    : null;
  desenharMunicipios(ctx, m);
  if (seletor) corpo.querySelector<HTMLElement>(seletor)?.focus();
}

function desenharMunicipios(ctx: ContextoMunicipios, m: ManipuladoresMunicipios): void {
  const corpo = $('municipios-corpo');
  const comMunicipio = ctx.resumo.municipio !== null;
  $('t-municipios').textContent = comMunicipio ? 'Município no período' : 'Municípios no período';
  if (comMunicipio) {
    corpo.replaceChildren(
      h('p', { class: 'ajuda' }, 'O que foi registrado neste município?'),
      h('p', { class: 'nota', id: 'mun-explica' }, `Números calculados só com os focos de ${ctx.nomeMunicipio ?? 'município'} no período. As lentes também usam só esses focos.`),
      cartaoMunicipio(ctx, m));
    return;
  }
  const linhas = listaMunicipios(ctx.resumo.principal.por_municipio, ctx.ordem, ctx.ativos, ctx.registrosLente);
  const porCelula = ctx.ordem === 'destaques' && ctx.ativos?.unidade === 'celula';
  const valor = (l: (typeof linhas)[number]) => (porCelula ? (l.celulas ?? 0) : l.total);
  const max = Math.max(1, ...linhas.map(valor));
  const explica = `${fmtNumero(linhas.length)} ${linhas.length === 1 ? 'município' : 'municípios'} com detecção no período (todo o estado). `
    + (ctx.ordem === 'nome' ? 'Em ordem alfabética.'
      : ctx.ordem === 'destaques'
        ? (!ctx.ativos ? 'Escolha uma lente para ordenar pelos destaques; por enquanto, pela contagem de detecções.'
          : ctx.ativos.unidade === 'municipio' ? `Os destacados pela lente "${ctx.nomeLente ?? ''}" primeiro, na ordem do resultado; depois os demais, por detecções.`
            : `Ordenado pelo número de células destacadas pela lente "${ctx.nomeLente ?? ''}".`)
        : 'Ordenado pela contagem de detecções.')
    + ' Toque num município para filtrar a tela. A ordem não indica prioridade, gravidade nem risco.';
  const ordem = h('div', { class: 'ordem', role: 'group', 'aria-label': 'Ordenar por' },
    ...(['deteccoes', 'destaques', 'nome'] as const).map((o) => {
      const b = h('button', { type: 'button', 'data-ordem': o, 'aria-pressed': String(ctx.ordem === o) }, ROTULO_ORDEM[o]);
      b.addEventListener('click', () => m.ordenar(o));
      return b;
    }));
  const lista = h('ol', { class: 'lista-mun', id: 'lista-municipios' }, ...linhas.map((l, i) => {
    const detalhe = [
      porCelula ? `${fmtNumero(l.total)} detecções` : null,
      !porCelula && l.celulas !== null ? `${fmtNumero(l.celulas)} ${l.celulas === 1 ? 'célula destacada' : 'células destacadas'}` : null,
      l.destacado ? 'destacado pela concentração' : null,
    ].filter(Boolean).join(' · ');
    const b = h('button', { type: 'button', class: 'botao-municipio', 'data-codigo': String(l.codigo), 'aria-pressed': 'false' },
      h('span', { class: 'pos' }, ctx.ordem === 'nome' ? '' : `${i + 1}.`),
      h('span', { class: 'nome' }, l.nome, detalhe ? h('span', { class: 'sub-nome' }, detalhe) : null,
        ctx.ordem !== 'nome' ? barraProporcional(larguraProporcional(valor(l), max)) : null),
      h('span', { class: 'num' }, porCelula ? `${fmtNumero(l.celulas ?? 0)} ${(l.celulas ?? 0) === 1 ? 'célula' : 'células'}` : fmtNumero(l.total)));
    b.addEventListener('click', () => m.escolher(l.codigo));
    return h('li', {}, b);
  }));
  const resumo = linhas.length ? `No período, ${fmtNumero(linhas.length)} municípios tiveram focos registrados. ${fmtNumero(ctx.resumo.principal.total)} focos foram registrados no total.` : 'Nenhum município teve focos registrados neste período.';
  corpo.replaceChildren(h('p', { class: 'ajuda' }, 'Em quais municípios foram registrados mais focos?'), h('p', { class: 'criterio', id: 'municipios-resumo' }, resumo), h('p', { class: 'nota' }, 'A lista mostra os focos registrados no período. Municípios maiores podem reunir mais registros; a contagem não indica, por si só, maior gravidade.'), h('p', { class: 'nota', id: 'mun-explica' }, explica), ordem);
  if (porCelula) corpo.append(h('p', { class: 'nota', id: 'mun-regra' }, 'Uma célula destacada conta em cada município com detecção nela.'));
  corpo.append(lista);
}

// --- Lista de focos (T21) ---------------------------------------------------------------------------------

export const FOCOS_POR_PAGINA = 50;

export interface ManipuladoresFocos {
  selecionar(id: string): void;
  pagina(pagina: number): void;
}

/** Linha da lista e do balão: dia e hora GMT, município, latitude, longitude e identificador. */
export const textoRegistro = (r: RegistroLente, municipio: string): string =>
  `${fmtDataHoraGmt(r.data_hora_gmt)} · ${municipio} · ${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)} · ${r.id_tecnico}`;

export function renderListaFocos(
  registros: readonly RegistroLente[] | 'carregando' | 'erro',
  pagina: number,
  selecionado: string | null,
  nomes: Map<number, string>,
  m: ManipuladoresFocos,
): void {
  const corpo = $('lista-focos-corpo');
  if (registros === 'carregando' || registros === 'erro') {
    corpo.replaceChildren(h('p', { class: registros === 'erro' ? 'aviso-estado' : 'ajuda', id: 'lista-focos-info' },
      registros === 'erro' ? 'A leitura dos registros do recorte falhou; nenhum foco é listado pela metade.' : 'Carregando os registros do recorte…'));
    return;
  }
  const total = registros.length;
  const paginas = Math.max(1, Math.ceil(total / FOCOS_POR_PAGINA));
  const p = Math.min(Math.max(0, pagina), paginas - 1);
  const de = p * FOCOS_POR_PAGINA;
  const visiveis = registros.slice(de, de + FOCOS_POR_PAGINA);
  const lista = h('ol', { class: 'lista-focos__itens', id: 'lista-focos-itens', start: String(de + 1), 'aria-label': 'Focos do recorte, por dia e hora GMT' },
    ...visiveis.map((r) => {
      const nome = nomes.get(r.municipio_codigo) ?? String(r.municipio_codigo);
      const b = h('button', { type: 'button', class: 'botao-foco', 'data-id': r.id_tecnico, 'aria-pressed': String(r.id_tecnico === selecionado) },
        h('span', { class: 'botao-foco__hora' }, fmtDataHoraGmt(r.data_hora_gmt)),
        h('span', {}, nome),
        h('span', { class: 'botao-foco__coord' }, `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`),
        h('span', { class: 'botao-foco__id' }, r.id_tecnico));
      b.addEventListener('click', () => m.selecionar(r.id_tecnico));
      return h('li', {}, b);
    }));
  const anterior = h('button', { type: 'button', id: 'focos-anterior', class: 'botao botao--secundario', disabled: p === 0 }, 'Focos anteriores');
  const proxima = h('button', { type: 'button', id: 'focos-proxima', class: 'botao botao--secundario', disabled: p >= paginas - 1 }, 'Próximos focos');
  anterior.addEventListener('click', () => m.pagina(p - 1));
  proxima.addEventListener('click', () => m.pagina(p + 1));
  corpo.replaceChildren(
    h('p', { class: 'ajuda', id: 'lista-focos-info', tabindex: '-1' }, total === 0
      ? 'Nenhum foco neste recorte.'
      : `Focos ${fmtNumero(de + 1)} a ${fmtNumero(de + visiveis.length)} de ${fmtNumero(total)}, por dia e hora GMT. Selecione um para marcá-lo no mapa.`));
  if (total) corpo.append(lista);
  if (paginas > 1) corpo.append(h('div', { class: 'acoes' }, anterior, proxima));
}

/** Marca a linha selecionada sem refazer a lista (o foco fica onde está). */
export function marcarFoco(id: string | null): void {
  for (const b of document.querySelectorAll<HTMLButtonElement>('#lista-focos-itens button[data-id]')) {
    b.setAttribute('aria-pressed', String(b.dataset['id'] === id));
  }
}

/**
 * Conteúdo do balão do mapa: todos os registros da mesma coordenada (T7), cada um com dia e hora GMT, município,
 * coordenadas e identificador; também posição na borda, divergência do INPE e ID da fonte, que eram da tabela.
 */
export function balaoRegistros(registros: readonly Registro[], nomes: Map<number, string>): HTMLElement {
  return h('div', { class: 'balao', id: 'balao-registros' },
    h('strong', {}, registros.length === 1 ? 'Detecção de calor' : `${fmtNumero(registros.length)} detecções neste ponto`),
    h('ul', { class: 'lista-simples' }, ...registros.map((r) => h('li', { 'data-id': r.id_tecnico },
      h('span', { class: 'balao__hora' }, fmtDataHoraGmt(r.data_hora_gmt)),
      ` · ${nomes.get(r.municipio_codigo) ?? String(r.municipio_codigo)} · ${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`,
      h('br', {}),
      'Identificador: ', h('code', {}, r.id_tecnico),
      h('br', {}),
      `ID da fonte: ${r.id_fonte ?? 'sem id na fonte'} · ${r.posicao === 'borda' ? 'na borda do município' : 'interior do município'} · `
        + (r.divergencia_inpe ? (ROTULO_DIVERGENCIA[r.divergencia_inpe] ?? r.divergencia_inpe) : 'sem divergência do INPE')))),
    h('p', { class: 'nota' }, 'Detecção não comprova incêndio, dano, autoria ou infração.'));
}

// --- Peças da explicação (V13): ficha, ressalvas, evidência recolhível e metadados -------------------------

/** Ficha de dados curtos do destaque, em duas colunas. */
export function ficha(itens: [string, string][]): HTMLElement {
  return h('dl', { class: 'ficha', id: 'lente-ficha' }, ...itens.map(([t, v]) => h('div', {}, h('dt', {}, t), h('dd', {}, v))));
}

/** Caixa "Ressalvas": as do destaque (se houver) e sempre a frase de domínio. */
export function caixaRessalvas(lista: HTMLElement | null): HTMLElement {
  return h('div', { class: 'ressalvas', id: 'lente-caixa-ressalvas' }, h('strong', {}, 'Ressalvas'), lista,
    h('p', { class: 'ressalvas__dominio' }, 'Detecção e sobreposição não comprovam incêndio, dano, autoria ou infração; o destaque indica onde olhar.'));
}

/** Estado aberto das evidências por destaque, para a paginação não fechar o bloco (some com a lente). */
const evidenciaAberta = new Set<string>();

export function esquecerEvidencias(): void {
  evidenciaAberta.clear();
}

/** "Ver as N detecções que sustentam o destaque": evidência recolhível, que lembra se estava aberta. */
export function detalhesEvidencia(id: string, n: number, conteudo: HTMLElement): HTMLElement {
  const d = h('details', { class: 'detalhes', id: 'lente-evidencia-detalhes', open: evidenciaAberta.has(id) },
    h('summary', {}, n === 1 ? 'Ver a detecção que sustenta o destaque' : `Ver as ${fmtNumero(n)} detecções que sustentam o destaque`),
    conteudo);
  d.addEventListener('toggle', () => { if (d.open) evidenciaAberta.add(id); else evidenciaAberta.delete(id); });
  return d;
}

/** Metadados curtos ao fim da explicação. */
export function metadados(r: { carga: { id: number; identidade: string }; janela: { inicio: string; fim: string }; versao: string }): HTMLElement {
  const item = (t: string, v: string) => [h('dt', {}, t), h('dd', {}, v)];
  return h('dl', { class: 'metadados', id: 'lente-metadados' },
    ...item('Pertencimento', 'calculado com o polígono integral; o mapa é só exibição'),
    ...item('Versão', `carga nº ${r.carga.id} · identidade ${r.carga.identidade.slice(0, 4)}…${r.carga.identidade.slice(-4)}`),
    ...item('Período', `${dataBr(r.janela.inicio)} a ${dataBr(r.janela.fim)} (dias GMT)`),
    ...item('Método', r.versao));
}

/**
 * Barra proporcional ao valor (DESIGN.md, aba Municípios), sem barra para zero. A largura vai pelo CSSOM: a CSP (`style-src 'self'`)
 * bloqueia o atributo `style` em linha, o que deixava todas as barras do mesmo tamanho (issue #71, BL-016).
 */
function barraProporcional(largura: number | null): HTMLElement | null {
  if (largura === null) return null;
  const barra = h('span', { class: 'barra' });
  barra.style.width = `${largura}%`;
  return barra;
}
