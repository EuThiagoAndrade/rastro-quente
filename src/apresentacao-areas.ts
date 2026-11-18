// Apresentação das áreas protegidas (plano 006, item 4, T23 e T24): legenda e atribuição da camada, área
// selecionada com o botão do contorno real, e o resultado da lente de sobreposição (lista paginada de células,
// painel com o motivo por área, evidência paginada, ressalvas, cobertura e limitações). Ordem fixa pela posição
// da célula; nenhuma ordem, intensidade ou número por classe ou por área. Todo valor entra por textContent.
import { $, h, textoAtribuicaoArea } from './apresentacao.ts';
import { CELULAS_POR_PAGINA, paginaValida } from './apresentacao-combinacao.ts';
import { linhaMunicipio, nomeMunicipio } from './apresentacao-lentes.ts';
import {
  comporListaLente, comporDetalheLente, acaoPeriodo, acoesDestaque, caixaRessalvas, detalhesEvidencia, detalhesTecnicos, ficha, metadados,
  etiquetaCobertura, mostrarExplicacao, municipioDoRecorte, renderResumoLente, resumoClassesDaCobertura, resumoMaiorValor,
  rotularAbaDestaques, tabelaPaginadaEvidencia, textoRecorteLente,
} from './apresentacao-resultado.ts';
import type { ClasseArea } from './lentes/carregar-areas.ts';
import { textoCobertura } from './lentes/cobertura.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import {
  CLASSES_AREA, LIMITACOES_SOBREPOSICAO, nomeArea, ROTULO_CLASSE, TEXTO_SEM_CAMADA, textoSemDestaques,
  type AreaSobreposicao, type DestaqueSobreposicao, type ResultadoSobreposicao,
} from './lentes/sobreposicao.ts';
import { fmtNumero, ROTULO_CLASSE as ROTULO_DISPONIBILIDADE } from './formato.ts';
import type { Fonte } from './tipos.ts';

/** Descrição textual do sinal de cada classe no mapa (a cor nunca é o único sinal). */
export const SINAL_CLASSE: Record<ClasseArea, string> = {
  protecao_integral: 'contorno contínuo verde, hachura inclinada para a direita',
  uso_sustentavel: 'contorno tracejado lilás, hachura inclinada para a esquerda',
  terra_indigena: 'contorno pontilhado rosa, hachura vertical',
};

const NOME_FONTE: Record<string, string> = { cnuc: 'CNUC (MMA)', funai: 'FUNAI' };

/** Fonte de uma área pela chave `<fonte>:<código>`, para exibição. */
const fonteDaChave = (chave: string): string => NOME_FONTE[chave.split(':')[0] ?? ''] ?? 'fonte';

/** Fontes de papel `areas` da carga, com retrato, data e condições de uso (atribuição de T24). */
export const fontesDeAreas = (fontes: Fonte[]): Fonte[] => fontes.filter((f) => f.papel === 'areas');

// --- Camada no mapa -----------------------------------------------------------------------------------

export type EstadoAreas =
  | { tipo: 'oculta' }
  | { tipo: 'carregando' }
  | { tipo: 'visivel'; total: number }
  | { tipo: 'sem_camada' }
  | { tipo: 'leitura_inconsistente'; motivo: string }
  | { tipo: 'falha' };

/**
 * Estado da camada (ciclo 009, D5): só o atributo `data-estado-areas`, sem texto nem botão; numa falha ou sem
 * camada, a caixa da camada fica desmarcada e religá-la tenta de novo.
 */
export function renderEstadoAreas(e: EstadoAreas): void {
  $('mapa-areas').dataset['estadoAreas'] = e.tipo;
}

/**
 * Legenda das três classes no item de áreas da "Legenda" do mapa (ciclo 009, C2), com a contagem exibida, o aviso
 * de T19 e a atribuição da KB-006.
 */
export function renderLegendaAreas(porClasse: Record<ClasseArea, number> | null, fontes: Fonte[]): void {
  const alvo = $('areas-legenda');
  // As classes também entram na "Legenda" do mapa enquanto a camada está ligada (issue #71, BL-012).
  $('legenda-areas').hidden = !porClasse;
  if (!porClasse) {
    alvo.replaceChildren();
    return;
  }
  alvo.replaceChildren(
    h('ul', { class: 'legenda', 'aria-label': 'Classes das áreas protegidas' },
      ...CLASSES_AREA.map((c) => h('li', { 'data-classe': c },
        h('span', { class: `legenda__amostra legenda__amostra--${c}`, 'aria-hidden': 'true' }),
        `${ROTULO_CLASSE[c][0]?.toUpperCase()}${ROTULO_CLASSE[c].slice(1)} (${SINAL_CLASSE[c]}): ${fmtNumero(porClasse[c])} ${porClasse[c] === 1 ? 'área' : 'áreas'}`))),
    h('p', { class: 'legenda__nota', id: 'areas-aviso' },
      'Áreas de outros estados que entram em Mato Grosso só aparecem quando contêm detecção desta carga. Não entram RPPN, terras indígenas em estudo e zonas de amortecimento. O contorno é simplificado (até cerca de 550 m); a classificação usa o polígono integral. Estar dentro de uma área protegida não indica infração, autoria nem situação fundiária.'),
    h('ul', { class: 'lista-simples legenda__nota', id: 'areas-atribuicao', 'aria-label': 'Atribuição das áreas protegidas' },
      ...fontesDeAreas(fontes).map((f) => h('li', {}, textoAtribuicaoArea(f)))),
  );
}

/** Dados de uma área para o quadro de área selecionada. */
export interface AreaExibida {
  chave: string;
  nome: string;
  classe: ClasseArea;
  categoria_ou_fase: string | null;
  esfera: string | null;
  qualidade_poligono: string | null;
}

export type EstadoContorno = 'nenhum' | 'carregando' | 'exibido' | 'falha';

export function renderAreaSelecionada(a: AreaExibida | null, verContorno: (chave: string) => void): void {
  const alvo = $('areas-selecao');
  if (!a) {
    alvo.replaceChildren();
    alvo.hidden = true;
    return;
  }
  alvo.hidden = false;
  const b = h('button', { type: 'button', id: 'botao-contorno-real', class: 'botao botao--secundario' }, 'Ver contorno real');
  b.addEventListener('click', () => verContorno(a.chave));
  alvo.replaceChildren(
    h('h3', { id: 'areas-selecao-titulo', tabindex: '-1' }, `Área selecionada: ${nomeArea(a)}`),
    h('dl', { class: 'definicoes' }, ...atributosArea(a).flatMap(([t, v]) => [h('dt', {}, t), h('dd', {}, v)])),
    h('div', { class: 'acoes' }, b),
    h('p', { id: 'areas-contorno-estado', class: 'ajuda', role: 'status', 'data-contorno': 'nenhum' }),
  );
}

const TEXTO_CONTORNO_AREA: Record<EstadoContorno, string> = {
  nenhum: '',
  carregando: 'Carregando o contorno real desta área…',
  exibido: 'Contorno real desta área exibido no mapa (traço branco).',
  falha: 'Contorno real indisponível agora; o contorno simplificado e os dados da área continuam válidos.',
};

/** Atualiza só o estado do contorno da área selecionada, sem refazer o quadro (o foco fica no botão). */
export function atualizarContornoArea(e: EstadoContorno): void {
  const p = document.getElementById('areas-contorno-estado');
  if (!p) return;
  p.dataset['contorno'] = e;
  p.textContent = TEXTO_CONTORNO_AREA[e];
}

function atributosArea(a: AreaExibida): [string, string][] {
  const linhas: [string, string][] = [['Classe', ROTULO_CLASSE[a.classe]]];
  if (a.classe === 'terra_indigena') linhas.push(['Fase', a.categoria_ou_fase ?? 'não informada']);
  else linhas.push(['Categoria', a.categoria_ou_fase ?? 'não informada'], ['Esfera', a.esfera ?? 'não informada']);
  linhas.push(['Qualidade do polígono', a.qualidade_poligono ?? 'não informada pela fonte'], ['Fonte', fonteDaChave(a.chave)]);
  return linhas;
}

// --- Lente de sobreposição ----------------------------------------------------------------------------

export interface ContextoSobreposicao {
  nomes: Map<number, string>;
  registros: Map<string, RegistroLente>;
  pagina: number;
  paginaEvidencia: number;
  /** Retângulos desenhados na camada de destaques. */
  noMapa: number;
  /** Contornos reais da célula selecionada. */
  contornos: EstadoContorno;
}

export interface ManipuladoresSobreposicao {
  selecionar(id: string): void;
  mostrarNoMapa(id: string): Promise<boolean>;
  pagina(pagina: number): void;
  paginaEvidencia(pagina: number): void;
  selecionarArea(a: AreaSobreposicao): void;
}

const bordas = (d: DestaqueSobreposicao): string =>
  d.unidade.tipo === 'celula_005' ? `${d.unidade.sul} a ${d.unidade.norte} · ${d.unidade.oeste} a ${d.unidade.leste}` : '';

const idCelula = (d: DestaqueSobreposicao): string => (d.unidade.tipo === 'celula_005' ? d.unidade.id : '');

const deteccoes = (n: number): string => `${fmtNumero(n)} ${n === 1 ? 'detecção' : 'detecções'}`;

/** Rótulo da célula na lista: posição, detecções vinculadas e as áreas, sem número de áreas. */
const rotuloCelula = (d: DestaqueSobreposicao): string =>
  `Célula ${idCelula(d)} (${bordas(d)}) — ${deteccoes(d.evidencia.valor)} dentro de ${d.areas.map(nomeArea).join('; ')}`;

function itemArea(a: AreaSobreposicao, m: ManipuladoresSobreposicao): HTMLElement {
  const b = h('button', { type: 'button', class: 'botao botao--secundario botao-area', 'data-chave': a.chave }, `Ver dados e contorno de ${nomeArea(a)}`);
  b.addEventListener('click', () => m.selecionarArea(a));
  const li = h('li', { class: 'area-citada', 'data-chave': a.chave },
    h('h4', {}, nomeArea(a)),
    h('p', { class: 'area-citada__atributos' }, atributosArea(a).map(([t, v]) => `${t}: ${v}`).join(' · ')),
    h('p', { class: 'area-citada__evidencia' }, `${deteccoes(a.deteccoes.length)} desta célula na janela vinculada${a.deteccoes.length === 1 ? '' : 's'} a esta área${a.na_borda ? `; ${deteccoes(a.na_borda)} sobre o limite` : ''}.`));
  if (a.ressalvas.length) li.append(h('ul', { class: 'lista-simples ressalvas-area' }, ...a.ressalvas.map((r) => h('li', {}, r))));
  li.append(h('div', { class: 'acoes' }, b));
  return li;
}

function tabelaEvidencia(d: DestaqueSobreposicao, ctx: ContextoSobreposicao, m: ManipuladoresSobreposicao): HTMLElement {
  return tabelaPaginadaEvidencia(d.evidencia.deteccoes, ctx, m.paginaEvidencia, 'Detecções da evidência da célula', {
    nome: 'Áreas',
    valor: (id) => d.areas.filter((a) => a.deteccoes.includes(id)).map(nomeArea).join('; '),
  });
}

const TEXTO_CONTORNOS: Record<EstadoContorno, string> = {
  nenhum: '',
  carregando: 'Carregando o contorno real das áreas desta célula…',
  exibido: 'Contorno real das áreas desta célula exibido no mapa (traço branco).',
  falha: 'Contorno real indisponível agora para alguma área desta célula; a célula, o motivo e a evidência continuam válidos.',
};

/** Atualiza só o estado dos contornos da célula aberta, sem refazer o painel (o foco fica onde está). */
export function atualizarContornosPainel(e: EstadoContorno): void {
  const p = document.getElementById('lente-contornos');
  if (!p) return;
  p.dataset['contornos'] = e;
  p.textContent = TEXTO_CONTORNOS[e];
}

function painel(r: ResultadoSobreposicao, d: DestaqueSobreposicao, ctx: ContextoSobreposicao, m: ManipuladoresSobreposicao): HTMLElement {
  const c = d.cobertura;
  const corpo = h('div', { id: 'lente-painel', class: 'painel-lente', 'data-destaque': d.id_destaque },
    h('h3', { tabindex: '-1', id: 'lente-painel-titulo' }, `Célula ${idCelula(d)} (${bordas(d)})`),
    ficha([['Célula 0,05°', idCelula(d)], ['Detecções da evidência', fmtNumero(d.evidencia.valor)],
      ['Município(s)', c.municipios.map((x) => ctx.nomes.get(x) ?? String(x)).join('; ')], ['Limites', bordas(d)]]),
    h('section', { class: 'criterio', 'data-tipo': 'sobreposicao', 'aria-label': 'Critério: sobreposição com áreas protegidas' },
      h('h4', {}, `Sobreposição · ${ROTULO_CLASSE[r.classe]}`),
      h('p', { id: 'lente-motivo' }, h('strong', {}, 'Motivo: '), d.motivo),
      h('p', { id: 'lente-evidencia' }, h('strong', {}, 'Evidência: '),
        `${deteccoes(d.evidencia.valor)} da janela dentro de ${ROTULO_CLASSE[r.classe]} (registros principais; pertencimento calculado com o polígono integral).`)),
    h('ul', { class: 'lista-simples areas-citadas', id: 'lente-areas', 'aria-label': 'Áreas da classe com detecção nesta célula' }, ...d.areas.map((a) => itemArea(a, m))),
    h('p', { id: 'lente-contornos', class: 'ajuda', role: 'status', 'data-contornos': ctx.contornos }, TEXTO_CONTORNOS[ctx.contornos]),
    h('p', { id: 'lente-cobertura', 'data-cobertura': c.estado }, h('strong', {}, 'Disponibilidade: '), textoCobertura(c)),
    resumoClassesDaCobertura(c),
    h('p', { id: 'lente-municipios' }, h('strong', {}, 'Municípios considerados na disponibilidade: '),
      `${c.municipios.map((x) => nomeMunicipio(x, ctx.nomes)).join('; ')}. São os municípios de todas as detecções da célula na janela; um dia só conta como sem evidência de lacuna se todos estiverem assim.`),
  );
  if (c.estado === 'completa' && c.demais_dias.length) {
    corpo.append(h('details', { class: 'detalhes' }, h('summary', {}, `Dias que contam contra (${c.demais_dias.length})`),
      h('ul', { class: 'lista-simples', id: 'lente-dias' }, ...c.demais_dias.map((dia) => h('li', { 'data-classe': dia.classe },
        `${dia.dia}: ${ROTULO_DISPONIBILIDADE[dia.classe].rotulo}`,
        h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, ctx.nomes)))))))));
  }
  corpo.append(caixaRessalvas(h('p', { id: 'lente-aviso-dominio' }, LIMITACOES_SOBREPOSICAO[0] ?? '')),
    acoesDestaque(d.id_destaque, d.evidencia.deteccoes.length, m.mostrarNoMapa),
    detalhesEvidencia(d.id_destaque, d.evidencia.deteccoes.length, tabelaEvidencia(d, ctx, m)),
    metadados({ carga: r.carga, janela: r.janela, versao: r.versao_metodo }));
  comporDetalheLente(corpo, `Este lugar teve ${fmtNumero(d.evidencia.deteccoes.length)} focos vinculados a áreas de ${ROTULO_CLASSE[r.classe]}. ${d.motivo}`, 'Por que este lugar aparece na lista?', c);
  return corpo;
}

export function renderResultadoSobreposicao(
  r: ResultadoSobreposicao,
  selecionado: string | null,
  ctx: ContextoSobreposicao,
  m: ManipuladoresSobreposicao,
): void {
  const corpo = $('lente-corpo');
  corpo.replaceChildren();
  rotularAbaDestaques(r.destaques.length);
  renderResumoLente({
    titulo: 'Sobreposição com áreas protegidas',
    pergunta: `Onde há detecções vinculadas a áreas de ${ROTULO_CLASSE[r.classe]}?`,
    resposta: r.estado === 'sem_camada'
      ? 'A camada de áreas protegidas está indisponível nesta carga.'
      : 'Tiveram focos vinculados a áreas da classe selecionada.',
    quantidade: r.estado === 'sem_camada' ? null : r.destaques.length, unidade: 'celula', janela: r.janela, ordem: 'norte→sul, oeste→leste; não é ranking',
    municipio: municipioDoRecorte(r.recorte, ctx.nomes),
  });
  corpo.append(
    h('p', { id: 'lente-classe' }, h('strong', {}, 'Classe aplicada: '), `${ROTULO_CLASSE[r.classe]}.`),
  );
  if (r.estado === 'sem_camada') {
    corpo.append(h('p', { id: 'lente-sem-camada', class: 'aviso-estado' }, `${TEXTO_SEM_CAMADA[0]?.toUpperCase()}${TEXTO_SEM_CAMADA.slice(1)}.`));
  } else if (r.estado === 'sem_destaques') {
    corpo.append(h('p', { id: 'lente-sem-destaques', class: 'ajuda' }, textoSemDestaques(r.classe)), h('div', { class: 'acoes' }, acaoPeriodo()));
  } else {
    corpo.append(h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, 'Lista na ordem das células, de norte a sul e de oeste a leste; não é ranking.'));
    const total = r.destaques.length;
    const pagina = paginaValida(ctx.pagina, total);
    const de = pagina * CELULAS_POR_PAGINA;
    const visiveis = r.destaques.slice(de, de + CELULAS_POR_PAGINA);
    const paginas = Math.ceil(total / CELULAS_POR_PAGINA);
    corpo.append(h('p', { id: 'lente-celulas-info', class: 'ajuda', tabindex: '-1' },
      `Células ${fmtNumero(de + 1)} a ${fmtNumero(de + visiveis.length)} de ${fmtNumero(total)}.`));
    const lista = h('ol', { class: 'destaques lista-celulas', id: 'lente-destaques', start: String(de + 1), 'aria-label': 'Células da sobreposição (alternativa em texto ao mapa)' });
    for (const d of visiveis) {
      const b = h('button', { type: 'button', class: 'botao-nome', 'data-id': d.id_destaque, 'aria-pressed': String(d.id_destaque === selecionado) }, rotuloCelula(d));
      b.addEventListener('click', () => m.selecionar(d.id_destaque));
      lista.append(h('li', {}, b, etiquetaCobertura(d.cobertura)));
    }
    corpo.append(lista, resumoMaiorValor(r.destaques.map((d) => d.evidencia.deteccoes.length), 'detecções vinculadas por célula'),
      h('p', { id: 'lente-mapa-info', class: 'ajuda' },
        `Mapa: ${fmtNumero(ctx.noMapa)} ${ctx.noMapa === 1 ? 'célula desenhada' : 'células desenhadas'} como retângulos de 0,05° na camada de destaques. Esta lista é a alternativa em texto ao mapa.`));
    if (paginas > 1) {
      const anterior = h('button', { type: 'button', id: 'celulas-anterior', class: 'botao botao--secundario', disabled: pagina === 0 }, 'Células anteriores');
      const proxima = h('button', { type: 'button', id: 'celulas-proxima', class: 'botao botao--secundario', disabled: pagina >= paginas - 1 }, 'Próximas células');
      anterior.addEventListener('click', () => m.pagina(pagina - 1));
      proxima.addEventListener('click', () => m.pagina(pagina + 1));
      corpo.append(h('div', { class: 'acoes' }, anterior, proxima));
    }
  }
  corpo.append(detalhesTecnicos(
    h('p', { id: 'lente-escopo', class: 'ajuda' },
      `Janela: ${r.janela.inicio} a ${r.janela.fim} (${r.janela.referencia}) · carga nº ${r.carga.id} · ${textoRecorteLente(r.recorte, ctx.nomes)} · método ${r.versao_metodo}.`),
    h('dl', { class: 'definicoes', id: 'lente-parametros' }, ...r.parametros.flatMap((p) => [h('dt', {}, p.nome), h('dd', {}, p.valor)]))),
    h('h3', { class: 'rotulo-secao' }, 'Limitações da lente'), h('ul', { class: 'lista-simples nota', id: 'lente-limitacoes' }, ...r.limitacoes.map((l) => h('li', {}, l))));
  comporListaLente(corpo, 'Os focos registrados ficam dentro dos limites das áreas disponíveis na base. Toque em um lugar para ver os focos e as áreas relacionadas.');
  const escolhido = r.destaques.find((d) => d.id_destaque === selecionado);
  mostrarExplicacao(escolhido ? painel(r, escolhido, ctx, m) : null, 'Por que esta célula?');
}
