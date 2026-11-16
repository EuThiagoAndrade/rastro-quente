// Aba Comparação (plano 008, item 1; KB-007; DESIGN.md): A e B lado a lado, conclusão comparativa separada dos fatos de
// cada lado, unidades classificadas com as evidências originais por lado, disponibilidade por município (sem agregação),
// contexto estadual e alternância do lado mostrado no mapa. Todo valor da fonte entra por textContent.
import { $, h, tabela } from './apresentacao.ts';
import {
  ROTULO_CLASSIFICACAO, ROTULO_PRESENCA, TEXTO_AGUARDANDO, TEXTO_NAO_AVALIAVEL, textoDisponibilidadeMunicipio,
  type ComparacaoMunicipal, type ComparacaoTemporal, type ContextoCombinacao, type ContextoConcentracao,
  type DisponibilidadeCelula, type DisponibilidadeDoMunicipio, type Lado, type UnidadeLado,
} from './comparacao.ts';
import { fmtDiferenca, fmtNumero } from './formato.ts';
import { textoCobertura } from './lentes/cobertura.ts';
import { NOME_LENTE } from './lentes/combinacao.ts';
import type { Unidade } from './lentes/contrato.ts';
import { rotuloMes } from './lentes/recorrencia.ts';

export const ITENS_POR_PAGINA = 50;

export type Modo = 'nenhuma' | 'periodos' | 'municipios';

/** Ciclo visível da lista de disponibilidade de todos os municípios (T7). */
export type EstadoLista =
  | { tipo: 'nao_solicitada' }
  | { tipo: 'carregando'; feitos: number; total: number }
  | { tipo: 'completa' }
  | { tipo: 'falha' };

export type EstadoComparacao =
  | { tipo: 'nenhuma' }
  | { tipo: 'incompleta'; texto: string }
  | { tipo: 'recusada'; texto: string }
  | { tipo: 'carregando'; etapa: 'registros' | 'areas' | 'disponibilidade'; feitos: number; total: number }
  | { tipo: 'pronta' }
  | { tipo: 'cobertura_nao_verificada' }
  | { tipo: 'leitura_inconsistente'; motivo: string }
  | { tipo: 'falha' };

const dataBr = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;
export const textoJanela = (j: { inicio: string; fim: string }): string => `${dataBr(j.inicio)} a ${dataBr(j.fim)}`;

function textoEstado(e: EstadoComparacao): string {
  switch (e.tipo) {
    case 'nenhuma': return 'Sem comparação.';
    case 'incompleta': return e.texto;
    case 'recusada': return `Comparação recusada: ${e.texto}. Nenhum resultado comparativo foi calculado.`;
    case 'carregando': return e.etapa === 'registros'
      ? `Carregando os dois lados: registros ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)}…`
      : e.etapa === 'areas' ? 'Carregando: áreas protegidas e vínculos da carga…'
        : `Carregando: disponibilidade ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)} municípios conferidos…`;
    case 'pronta': return 'Comparação calculada.';
    case 'cobertura_nao_verificada': return 'Comparação calculada, mas a disponibilidade de alguns municípios não foi verificada; tente de novo para qualificá-la.';
    case 'leitura_inconsistente': return `Leitura inconsistente (${e.motivo}). Nenhum lado foi exibido pela metade; tente de novo.`;
    case 'falha': return 'Fonte de dados indisponível. Nada foi comparado; isso não indica ausência de detecções. Tente de novo.';
  }
}

export function renderEstadoComparacao(e: EstadoComparacao, tentarDeNovo: () => void): void {
  $('painel-comparacao').dataset['estadoComparacao'] = e.tipo;
  const alvo = $('comparacao-estado');
  const calmo = e.tipo === 'carregando' || e.tipo === 'pronta' || e.tipo === 'incompleta';
  alvo.replaceChildren(h('p', { class: calmo ? 'ajuda' : 'aviso-estado' }, textoEstado(e)));
  if (e.tipo === 'falha' || e.tipo === 'leitura_inconsistente' || e.tipo === 'cobertura_nao_verificada') {
    const b = h('button', { type: 'button', id: 'botao-comparacao-tentar', class: 'botao botao--secundario' }, 'Tentar de novo');
    b.addEventListener('click', tentarDeNovo);
    alvo.append(h('div', { class: 'acoes' }, b));
  }
  if (e.tipo !== 'pronta' && e.tipo !== 'cobertura_nao_verificada' && e.tipo !== 'carregando') $('comparacao-corpo').replaceChildren();
}

/** Aba Comparação visível só com um modo escolhido; a aba some e devolve a coluna a Municípios ao sair. */
export function mostrarAbaComparacao(visivel: boolean): void {
  $('aba-comparacao').hidden = !visivel;
}

// --- Peças ---------------------------------------------------------------------------------------------------------

export const nomeUnidade = (u: Unidade): string => (u.tipo === 'municipio'
  ? `${u.nome} (${u.codigo})`
  : `Célula ${u.id} · ${u.sul}° a ${u.norte}° de latitude, ${u.oeste}° a ${u.leste}° de longitude`);

function textoDisponibilidade(d: DisponibilidadeCelula): string {
  return d.estado === 'nao_avaliavel' ? TEXTO_NAO_AVALIAVEL : textoCobertura(d.cobertura);
}

/** Evidências originais de um lado: motivo, datas, detecções e ressalvas de cada destaque, sem somar lados. */
function evidenciasDoLado(titulo: string, u: UnidadeLado | null, disponibilidade: string | null): HTMLElement {
  if (!u) {
    return h('div', { class: 'bloco' }, h('h4', {}, titulo), h('p', { class: 'nota' }, 'Sem destaque desta unidade neste lado.'),
      disponibilidade ? h('p', { class: 'nota' }, disponibilidade) : null);
  }
  return h('div', { class: 'bloco' }, h('h4', {}, titulo),
    h('ul', { class: 'lista-simples' }, ...u.destaques.map((d) => h('li', {},
      h('p', {}, d.motivo),
      h('p', { class: 'nota' }, `${fmtNumero(d.deteccoes.length)} ${d.deteccoes.length === 1 ? 'detecção' : 'detecções'}`
        + (d.datas.length ? ` · ${d.datas.map((x) => (x.length === 7 ? rotuloMes(x) : dataBr(x))).join(', ')}` : '')),
      d.ressalvas.length ? h('p', { class: 'nota' }, `Ressalvas: ${d.ressalvas.join('; ')}`) : null))),
    disponibilidade ? h('p', { class: 'nota' }, disponibilidade) : null);
}

function caixa(titulo: string, textos: string[], id: string): HTMLElement {
  return h('div', { class: 'ressalvas', id }, h('strong', {}, titulo), h('ul', {}, ...textos.map((t) => h('li', {}, t))));
}

function botoesMapa(lado: Lado, rotulos: Record<Lado, string>, mostrar: (l: Lado) => void): HTMLElement {
  const grupo = h('div', { class: 'ordem', role: 'group', 'aria-label': 'Lado mostrado no mapa', id: 'comparacao-mapa' });
  for (const l of ['A', 'B'] as const) {
    const b = h('button', { type: 'button', 'data-lado': l, 'aria-pressed': String(l === lado) }, `Mapa: ${rotulos[l]}`);
    b.addEventListener('click', () => mostrar(l));
    grupo.append(b);
  }
  return grupo;
}

function conclusaoTexto(c: ComparacaoTemporal['conclusao'], progresso: string | null): HTMLElement {
  if (c.estado === 'conclusiva') return h('p', { class: 'ajuda', id: 'comparacao-conclusao', 'data-conclusao': 'conclusiva' }, 'Conclusão comparativa disponível.');
  if (c.estado === 'aguardando_disponibilidade') {
    return h('p', { class: 'aviso-estado', id: 'comparacao-conclusao', 'data-conclusao': 'aguardando' },
      `${TEXTO_AGUARDANDO}: o lado ${c.lados.join(' e ')} não tem detecções e a disponibilidade de todos os municípios do recorte está sendo conferida${progresso ? ` (${progresso})` : ''}. Entrada, saída e diferença ficam suspensas até o fim.`);
  }
  const prefixo = c.motivo === 'falha_conferencia' ? 'Conclusão indisponível por falha de conferência'
    : c.motivo === 'lacuna_total' ? 'Comparação indisponível por lacuna conhecida' : 'Comparação indisponível nesta configuração';
  return h('div', { class: 'aviso-estado', id: 'comparacao-conclusao', 'data-conclusao': c.motivo },
    h('p', {}, `${prefixo}. Os fatos de cada lado continuam abaixo, separados.`), h('ul', {}, ...c.textos.map((t) => h('li', {}, t))));
}

function paginacao(total: number, pagina: number, ir: (p: number) => void): HTMLElement | null {
  const paginas = Math.ceil(total / ITENS_POR_PAGINA);
  if (paginas <= 1) return null;
  const anterior = h('button', { type: 'button', class: 'botao botao--secundario botao--compacto', disabled: pagina === 0 }, 'Anteriores');
  const proxima = h('button', { type: 'button', class: 'botao botao--secundario botao--compacto', disabled: pagina >= paginas - 1 }, 'Próximas');
  anterior.addEventListener('click', () => ir(pagina - 1));
  proxima.addEventListener('click', () => ir(pagina + 1));
  return h('div', { class: 'acoes' }, h('p', { class: 'nota', id: 'comparacao-pagina', tabindex: '-1' },
    `Unidades ${fmtNumero(pagina * ITENS_POR_PAGINA + 1)} a ${fmtNumero(Math.min(total, (pagina + 1) * ITENS_POR_PAGINA))} de ${fmtNumero(total)}`), anterior, proxima);
}

/** Uma unidade comparada: título com a classificação e, aberta, as evidências de A e B e a disponibilidade de cada lado. */
function itemUnidade(chave: string, unidade: Unidade, rotulo: string, aberta: boolean, a: HTMLElement, b: HTMLElement, aoAbrir: (chave: string, aberta: boolean) => void): HTMLElement {
  const d = h('details', { class: 'detalhes', 'data-chave': chave, open: aberta },
    h('summary', {}, `${nomeUnidade(unidade)} — ${rotulo}`), h('div', { class: 'blocos' }, a, b));
  d.addEventListener('toggle', () => aoAbrir(chave, d.open));
  return h('li', {}, d);
}

export interface ContextoComparacao {
  lente: string | null;
  mapa: Lado;
  pagina: number;
  abertas: ReadonlySet<string>;
  /** Disponibilidade do recorte por município e lado: municipal (sempre) ou estadual (com a lista pedida). */
  disponibilidade: { estado: EstadoLista; estadual: boolean; nomes: Map<number, string>; a: DisponibilidadeDoMunicipio[]; b: DisponibilidadeDoMunicipio[] };
  progressoZero: string | null;
  contexto: { estado: 'nao_solicitado' | 'carregando' | 'falha' } | { estado: 'pronto'; valor: ContextoConcentracao | ContextoCombinacao } | null;
  metadados: { carga: { id: number; identidade: string }; versaoMetodo: string | null };
}

export interface ManipuladoresComparacao {
  mostrarNoMapa(lado: Lado): void;
  pagina(p: number): void;
  abrir(chave: string, aberta: boolean): void;
  listaCompleta(): void;
  contextoEstadual(): void;
}

function secaoDisponibilidade(ctx: ContextoComparacao, m: ManipuladoresComparacao): HTMLElement {
  const d = ctx.disponibilidade;
  const secao = h('section', { class: 'bloco', id: 'comparacao-disponibilidade', 'data-estado-lista': d.estado.tipo, 'aria-labelledby': 't-comparacao-disp' },
    h('h3', { id: 't-comparacao-disp' }, d.estadual ? 'Disponibilidade de todos os municípios' : 'Disponibilidade do recorte'),
    h('p', { class: 'nota' }, 'Por município e por lado, com as classes de cada um; não é cobertura da célula nem soma dos municípios.'));
  if (d.estadual && d.estado.tipo === 'nao_solicitada') {
    const b = h('button', { type: 'button', class: 'botao botao--secundario', id: 'botao-lista-completa' }, 'Ver a disponibilidade de todos os municípios');
    b.addEventListener('click', () => m.listaCompleta());
    secao.append(h('p', { class: 'nota' }, 'Não solicitada: os destaques não dependem desta lista.'), h('div', { class: 'acoes' }, b));
    return secao;
  }
  if (d.estado.tipo === 'carregando') {
    secao.append(h('p', { class: 'ajuda', role: 'status' }, `Carregando: ${fmtNumero(d.estado.feitos)} de ${fmtNumero(d.estado.total)} municípios conferidos nos dois lados.`));
    return secao;
  }
  if (d.estado.tipo === 'falha') {
    secao.append(h('p', { class: 'aviso-estado' }, 'Falha na leitura de algum município: a lista está incompleta e nenhuma disponibilidade agregada é mostrada.'));
    if (d.estadual) {
      const b = h('button', { type: 'button', class: 'botao botao--secundario', id: 'botao-lista-completa' }, 'Tentar de novo');
      b.addEventListener('click', () => m.listaCompleta());
      secao.append(h('div', { class: 'acoes' }, b));
    }
  }
  const nome = (codigo: number) => `${d.nomes.get(codigo) ?? 'município'} (${codigo})`;
  const mesmos = d.a.length === d.b.length && d.a.every((x, i) => x.codigo === d.b[i]?.codigo);
  if (mesmos) {
    // Mesmo recorte nos dois períodos: uma linha por município, uma coluna por lado.
    secao.append(tabela('Disponibilidade por município e lado', ['Município', 'A', 'B'],
      d.a.map((x, i) => [nome(x.codigo), textoDisponibilidadeMunicipio(x), textoDisponibilidadeMunicipio(d.b[i] ?? x)]),
      'Disponibilidade por município e lado'));
  } else {
    // Dois municípios: uma linha por lado, cada uma com o próprio município.
    secao.append(tabela('Disponibilidade de cada município', ['Lado', 'Município', 'Disponibilidade'],
      [...d.a.map((x) => ['A', nome(x.codigo), textoDisponibilidadeMunicipio(x)]), ...d.b.map((x) => ['B', nome(x.codigo), textoDisponibilidadeMunicipio(x)])],
      'Disponibilidade de cada município'));
  }
  return secao;
}

function secaoContexto(ctx: ContextoComparacao, m: ManipuladoresComparacao): HTMLElement | null {
  const c = ctx.contexto;
  if (!c) return null;
  const secao = h('section', { class: 'bloco', id: 'comparacao-contexto', 'data-estado-contexto': c.estado, 'aria-labelledby': 't-comparacao-contexto' },
    h('h3', { id: 't-comparacao-contexto' }, 'Contexto estadual — municípios A e B'),
    h('p', { class: 'nota' }, 'Cálculo pedido em todo Mato Grosso, no mesmo período; não é resultado de cada município nem um top 10 entre os dois.'));
  if (c.estado === 'nao_solicitado' || c.estado === 'falha') {
    const b = h('button', { type: 'button', class: 'botao botao--secundario', id: 'botao-contexto-estadual' }, c.estado === 'falha' ? 'Tentar de novo' : 'Ver contexto estadual');
    b.addEventListener('click', () => m.contextoEstadual());
    if (c.estado === 'falha') secao.append(h('p', { class: 'aviso-estado' }, 'Falha no cálculo estadual; nada foi exibido pela metade.'));
    secao.append(h('div', { class: 'acoes' }, b));
    return secao;
  }
  if (c.estado === 'carregando') {
    secao.append(h('p', { class: 'ajuda', role: 'status' }, 'Calculando em todo Mato Grosso…'));
    return secao;
  }
  if (c.estado !== 'pronto') return secao;
  const v = c.valor;
  if (v.tipo === 'concentracao') {
    secao.append(
      h('p', {}, v.corte === null ? 'Nenhum município destacado pela concentração no estado.'
        : `Concentração estadual: ${fmtNumero(v.destacados)} municípios destacados (corte em ${fmtNumero(v.corte)} detecções, com empatados).`),
      ...v.observacoes.map((o) => h('p', { class: 'nota' }, o)),
      tabela('Participação dos municípios A e B na concentração estadual', ['Lado', 'Município', 'Detecções no estado', 'Na concentração'],
        v.municipios.map((x) => [x.lado, `${x.nome} (${x.codigo})`, fmtNumero(x.total), x.posicao === null ? 'não destacado' : `destacado (${x.posicao}º)`]),
        'Participação na concentração estadual'),
      h('p', { class: 'nota' }, 'Contagem absoluta favorece municípios grandes; a ordem não indica prioridade, gravidade nem risco.'));
  } else {
    secao.append(
      h('p', {}, `${fmtNumero(v.celulas.length)} ${v.celulas.length === 1 ? 'célula selecionada' : 'células selecionadas'} pela combinação estadual com detecções de A ou B.`),
      h('ul', { class: 'lista-simples' }, ...v.celulas.map((x) => h('li', {}, `${nomeUnidade(x.celula.unidade)} — com detecções de ${x.lados.join(' e ')}; critérios: ${x.celula.criterios.map((cr) => NOME_LENTE[cr.lente]).join(', ')}`))),
      h('p', { class: 'nota' }, 'Seleção estadual: a célula pode ser sustentada também por detecções de outros municípios; a lista só mostra as células com detecções de A ou B.'));
  }
  return secao;
}

function metadadosComparacao(ctx: ContextoComparacao): HTMLElement {
  const item = (t: string, v: string) => [h('dt', {}, t), h('dd', {}, v)];
  const c = ctx.metadados.carga;
  return h('dl', { class: 'metadados', id: 'comparacao-metadados' },
    ...item('Versão', `carga nº ${c.id} · identidade ${c.identidade.slice(0, 4)}…${c.identidade.slice(-4)}`),
    ...item('Método', [ctx.metadados.versaoMetodo, 'comparacao-008-v1'].filter(Boolean).join(' · ')));
}

/** Tabela A, B e B − A; a diferença só com conclusão comparativa. */
function tabelaNumeros(rotulos: Record<Lado, string>, linhas: [string, number | null, number | null, number | null][], conclusiva: boolean): HTMLElement {
  const v = (n: number | null) => (n === null ? 'carregando' : fmtNumero(n));
  return tabela(`Números de ${rotulos.A} e ${rotulos.B}`, ['', 'A', 'B', 'B − A'],
    linhas.map(([t, a, b, d]) => [t, v(a), v(b), conclusiva ? (d === null ? '—' : fmtDiferenca(d)) : 'suspensa']), 'Números de A e B');
}

export function renderComparacaoPeriodos(c: ComparacaoTemporal, ctx: ContextoComparacao, m: ManipuladoresComparacao): void {
  const rotulos: Record<Lado, string> = { A: `A · ${textoJanela(c.a.janela)}`, B: `B · ${textoJanela(c.b.janela)}` };
  const conclusiva = c.conclusao.estado === 'conclusiva';
  const corpo: (HTMLElement | null)[] = [
    h('p', { class: 'nota', id: 'comparacao-descricao' }, `Dois períodos de ${fmtNumero(c.validacao.dias)} dias GMT no mesmo recorte${ctx.lente ? `, lente ${ctx.lente}` : ', sem lente (só contagens)'}. A é o período aplicado na Consulta.`),
    botoesMapa(ctx.mapa, { A: 'A', B: 'B' }, m.mostrarNoMapa),
    h('p', { class: 'nota', id: 'comparacao-lados' }, `${rotulos.A} · ${rotulos.B}`),
    tabelaNumeros(rotulos, [
      ['Detecções (total principal)', c.a.total, c.b.total, c.diferencaTotal],
      ...(ctx.lente ? [['Unidades destacadas', c.a.unidades.length, c.b.unidades.length, conclusiva ? c.b.unidades.length - c.a.unidades.length : null] as [string, number, number, number | null]] : []),
    ], conclusiva),
    c.meses ? h('p', { class: 'nota', id: 'comparacao-meses' },
      `Meses GMT tocados — A: ${c.meses.a.map((x) => rotuloMes(x.mes) + (x.parcial ? ' (parcial)' : '')).join(', ')}; B: ${c.meses.b.map((x) => rotuloMes(x.mes) + (x.parcial ? ' (parcial)' : '')).join(', ')}.`) : null,
    conclusaoTexto(c.conclusao, ctx.progressoZero),
  ];
  if (ctx.lente && conclusiva) {
    corpo.push(h('p', { id: 'comparacao-contagem' }, `Entrou: ${fmtNumero(c.contagem.entrou)} · Saiu: ${fmtNumero(c.contagem.saiu)} · Permaneceu: ${fmtNumero(c.contagem.permaneceu)}`));
    const inicio = ctx.pagina * ITENS_POR_PAGINA;
    corpo.push(h('ul', { class: 'destaques', id: 'comparacao-itens' }, ...c.itens.slice(inicio, inicio + ITENS_POR_PAGINA).map((i) => itemUnidade(
      i.chave, i.unidade, ROTULO_CLASSIFICACAO[i.classificacao], ctx.abertas.has(i.chave),
      evidenciasDoLado(rotulos.A, i.a, `Disponibilidade em A: ${textoDisponibilidade(i.disponibilidadeA)}`),
      evidenciasDoLado(rotulos.B, i.b, `Disponibilidade em B: ${textoDisponibilidade(i.disponibilidadeB)}`), m.abrir))),
    paginacao(c.itens.length, ctx.pagina, m.pagina));
    if (!c.itens.length) corpo.push(h('p', { class: 'nota', id: 'comparacao-sem-unidades' }, 'Nenhuma unidade destacada em nenhum dos dois lados.'));
  } else if (ctx.lente) {
    // Sem conclusão: os fatos de cada lado continuam visíveis, separados.
    for (const [l, u] of [['A', c.a.unidades], ['B', c.b.unidades]] as const) {
      corpo.push(h('details', { class: 'detalhes', id: `comparacao-fatos-${l}` },
        h('summary', {}, `Destaques observados em ${rotulos[l]}: ${fmtNumero(u.length)}`),
        h('ul', { class: 'lista-simples' }, ...u.slice(0, ITENS_POR_PAGINA).map((x) => h('li', {}, nomeUnidade(x.unidade)))),
        u.length > ITENS_POR_PAGINA ? h('p', { class: 'nota' }, `Mostrando ${ITENS_POR_PAGINA} de ${fmtNumero(u.length)}; a lista completa está na aba Destaques e no mapa de cada lado.`) : null));
    }
  }
  corpo.push(secaoDisponibilidade(ctx, m), caixa('Ressalvas', c.ressalvas, 'comparacao-ressalvas'), metadadosComparacao(ctx));
  $('comparacao-corpo').replaceChildren(...corpo.filter((x): x is HTMLElement => x !== null));
}

export function renderComparacaoMunicipios(c: ComparacaoMunicipal, ctx: ContextoComparacao, m: ManipuladoresComparacao): void {
  const rotulos: Record<Lado, string> = { A: `A · ${c.a.nome}`, B: `B · ${c.b.nome}` };
  const conclusiva = c.conclusao.estado === 'conclusiva';
  const d = c.diferenca;
  const corpo: (HTMLElement | null)[] = [
    h('p', { class: 'nota', id: 'comparacao-descricao' }, `Dois municípios no período ${textoJanela(c.janela)}${ctx.lente ? `, lente ${ctx.lente} calculada em cada município` : ', sem lente (só contagens)'}. A é o município da Consulta.`),
    botoesMapa(ctx.mapa, { A: 'A', B: 'B' }, m.mostrarNoMapa),
    h('p', { class: 'nota', id: 'comparacao-lados' }, `${rotulos.A} · ${rotulos.B}`),
    tabelaNumeros(rotulos, [
      ['Detecções (total principal)', c.a.numeros.focos, c.b.numeros.focos, d?.focos ?? null],
      ['Dias com detecção', c.a.numeros.dias, c.b.numeros.dias, d?.dias ?? null],
      ['Células com detecção', c.a.numeros.celulas, c.b.numeros.celulas, d?.celulas ?? null],
      ...(ctx.lente ? [['Unidades destacadas', c.a.unidades.length, c.b.unidades.length, null] as [string, number, number, null]] : []),
    ], conclusiva),
    conclusaoTexto(c.conclusao, ctx.progressoZero),
  ];
  if (ctx.lente) {
    const inicio = ctx.pagina * ITENS_POR_PAGINA;
    corpo.push(h('ul', { class: 'destaques', id: 'comparacao-itens' }, ...c.itens.slice(inicio, inicio + ITENS_POR_PAGINA).map((i) => itemUnidade(
      i.chave, i.unidade, ROTULO_PRESENCA[i.presenca], ctx.abertas.has(i.chave),
      evidenciasDoLado(rotulos.A, i.a, null), evidenciasDoLado(rotulos.B, i.b, null), m.abrir))),
    paginacao(c.itens.length, ctx.pagina, m.pagina));
    if (!c.itens.length) corpo.push(h('p', { class: 'nota', id: 'comparacao-sem-unidades' }, 'Nenhuma unidade destacada em nenhum dos dois municípios.'));
  }
  corpo.push(secaoDisponibilidade(ctx, m), secaoContexto(ctx, m), caixa('Ressalvas', c.ressalvas, 'comparacao-ressalvas'), metadadosComparacao(ctx));
  $('comparacao-corpo').replaceChildren(...corpo.filter((x): x is HTMLElement => x !== null));
}

/** Rótulo do lado mostrado no mapa: inequívoco, sobre o próprio mapa (T7). */
export function renderLadoNoMapa(texto: string | null): void {
  const e = $('mapa-lado');
  e.textContent = texto ?? '';
  e.hidden = texto === null;
}
