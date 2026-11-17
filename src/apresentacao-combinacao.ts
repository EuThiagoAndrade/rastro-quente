// Apresentação da combinação de lentes (plano 005, item 2): configuração aplicada, versões, carga, parâmetros,
// lista paginada de células, painel por critério (um item por destaque original) com cobertura da célula e
// evidência em união, e limitações. Ordem fixa pela posição da célula; nenhum número de lentes, pontuação ou
// ordem por critério (T13). Todo valor entra por textContent. Nunca "coberto".
import { $, h, tabela } from './apresentacao.ts';
import { dataBr, EVIDENCIA_POR_PAGINA, linhaMunicipio, nomeMunicipio } from './apresentacao-lentes.ts';
import {
  caixaRessalvas, detalhesEvidencia, ficha, metadados, mostrarExplicacao, municipioDoRecorte, renderResumoLente, rotularAbaDestaques, textoRecorteLente,
} from './apresentacao-resultado.ts';
import { ressalvasDeClasse, textoCobertura } from './lentes/cobertura.ts';
import {
  LENTES_CANONICAS, NOME_LENTE, textoSemCelulas,
  type CelulaCombinada, type CriterioCelula, type DestaqueNaCelula, type Operador, type ResultadoCombinacao,
} from './lentes/combinacao.ts';
import type { Janela, RegistroLente, TipoLente } from './lentes/contrato.ts';
import { rotuloMes } from './lentes/recorrencia.ts';
import { fmtDataHoraGmt, fmtNumero, ROTULO_CLASSE } from './formato.ts';

/** Células por página da lista (Q9): a união das três chega a 1.116 células na janela inteira. */
export const CELULAS_POR_PAGINA = 50;

export const DESCRICAO_OPERADOR: Record<Operador, string> = {
  e: 'e: células destacadas por todas as lentes escolhidas',
  ou: 'ou: células destacadas por pelo menos uma das lentes escolhidas',
};

const TITULO_LENTE: Record<TipoLente, string> = {
  concentracao: 'Concentração',
  recorrencia: 'Recorrência',
  persistencia: 'Persistência',
};

export const ORDEM_FIXA = 'Ordem fixa pela posição da célula (norte→sul, oeste→leste); não é ranking.';

/** "concentração e recorrência", "concentração ou recorrência ou persistência". */
export const descreverLentes = (lentes: readonly TipoLente[], operador: Operador): string =>
  lentes.map((l) => NOME_LENTE[l]).join(` ${operador} `);

/** Lentes que destacaram a célula, por nome e na ordem canônica, sem contagem (T13). */
const nomesDosCriterios = (c: CelulaCombinada): string => c.criterios.map((x) => NOME_LENTE[x.lente]).join(', ');

export interface ContextoCombinacao {
  nomes: Map<number, string>;
  registros: Map<string, RegistroLente>;
  pagina: number;
  paginaEvidencia: number;
  /** Retângulos efetivamente desenhados na camada de destaques do mapa. */
  noMapa: number;
}

export interface ManipuladoresCombinacao {
  selecionar(id: string): void;
  pagina(pagina: number): void;
  paginaEvidencia(pagina: number): void;
}

const bordas = (c: CelulaCombinada): string =>
  `${c.unidade.sul} a ${c.unidade.norte} · ${c.unidade.oeste} a ${c.unidade.leste}`;

/** Página válida da lista, para um total de células. */
export function paginaValida(pagina: number, total: number): number {
  const paginas = Math.max(1, Math.ceil(total / CELULAS_POR_PAGINA));
  return Math.min(Math.max(0, pagina), paginas - 1);
}

function textoEvidencia(lente: TipoLente, d: DestaqueNaCelula): string {
  const n = d.evidencia.deteccoes.length;
  const base = `${fmtNumero(n)} ${n === 1 ? 'detecção' : 'detecções'} nesta célula`;
  if (lente === 'recorrencia') return `${base}; meses: ${d.evidencia.datas.map(rotuloMes).join(', ')}.`;
  if (lente === 'persistencia') return `${base}; dias GMT: ${d.evidencia.datas.map(dataBr).join(', ')}.`;
  return `${base}.`;
}

function itemDestaque(lente: TipoLente, d: DestaqueNaCelula, celula: CelulaCombinada, janela: Janela, nomes: Map<number, string>): HTMLElement {
  const li = h('li', { class: 'destaque-original', 'data-destaque': d.id_destaque },
    h('p', { class: 'destaque-original__motivo' }, h('strong', {}, 'Motivo: '), d.motivo),
    h('p', { class: 'destaque-original__evidencia' }, h('strong', {}, 'Evidência: '), textoEvidencia(lente, d)));
  if (d.ressalvas.length) {
    // Na persistência, cada ressalva por classe leva aos municípios do dia, com classe e motivos (T7), sequência a sequência.
    const dias = new Map(lente === 'persistencia'
      ? ressalvasDeClasse(d.evidencia.datas, janela, celula.cobertura).flatMap((x) => (x.dia ? [[x.texto, x.dia] as const] : []))
      : []);
    li.append(h('ul', { class: 'lista-simples ressalvas-destaque' }, ...d.ressalvas.map((r) => {
      const dia = dias.get(r);
      return dia
        ? h('li', { 'data-classe': dia.classe }, r, h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, nomes)))))
        : h('li', {}, r);
    })));
  }
  return li;
}

function blocoCriterio(x: CriterioCelula, celula: CelulaCombinada, janela: Janela, nomes: Map<number, string>): HTMLElement {
  const bloco = h('section', { class: 'criterio', 'data-lente': x.lente, 'aria-label': `Critério: ${NOME_LENTE[x.lente]}` },
    h('h4', {}, TITULO_LENTE[x.lente]));
  if (x.ressalvas.length) bloco.append(h('ul', { class: 'lista-simples ressalvas-criterio' }, ...x.ressalvas.map((r) => h('li', {}, r))));
  bloco.append(h('ul', { class: 'lista-simples destaques-originais' }, ...x.destaques.map((d) => itemDestaque(x.lente, d, celula, janela, nomes))));
  return bloco;
}

/** Tabela paginada da evidência em união, com a coluna "Lentes" (quais critérios cada detecção sustenta). */
function tabelaUniao(c: CelulaCombinada, ctx: ContextoCombinacao, m: ManipuladoresCombinacao): HTMLElement {
  const sustenta = new Map<string, TipoLente[]>();
  for (const x of c.criterios) {
    for (const d of x.destaques) {
      for (const id of d.evidencia.deteccoes) {
        const l = sustenta.get(id) ?? [];
        if (!l.includes(x.lente)) l.push(x.lente);
        sustenta.set(id, l);
      }
    }
  }
  const total = c.evidencia.deteccoes.length;
  const paginas = Math.max(1, Math.ceil(total / EVIDENCIA_POR_PAGINA));
  const pagina = Math.min(Math.max(0, ctx.paginaEvidencia), paginas - 1);
  const de = pagina * EVIDENCIA_POR_PAGINA;
  const ids = c.evidencia.deteccoes.slice(de, de + EVIDENCIA_POR_PAGINA);
  const linhas = ids.map((id) => {
    const lentes = LENTES_CANONICAS.filter((l) => sustenta.get(id)?.includes(l)).map((l) => NOME_LENTE[l]).join(', ');
    const r = ctx.registros.get(id);
    return r
      ? [fmtDataHoraGmt(r.data_hora_gmt), nomeMunicipio(r.municipio_codigo, ctx.nomes), String(r.latitude), String(r.longitude), lentes, id]
      : ['—', '—', '—', '—', lentes, id];
  });
  const anterior = h('button', { type: 'button', id: 'evidencia-anterior', class: 'botao botao--secundario', disabled: pagina === 0 }, 'Detecções anteriores');
  const proxima = h('button', { type: 'button', id: 'evidencia-proxima', class: 'botao botao--secundario', disabled: pagina >= paginas - 1 }, 'Próximas detecções');
  anterior.addEventListener('click', () => m.paginaEvidencia(pagina - 1));
  proxima.addEventListener('click', () => m.paginaEvidencia(pagina + 1));
  return h('div', { id: 'lente-evidencia-tabela' },
    h('p', { id: 'lente-evidencia-info', class: 'ajuda', tabindex: '-1' }, `Mostrando ${fmtNumero(total === 0 ? 0 : de + 1)}–${fmtNumero(de + ids.length)} de ${fmtNumero(total)} detecções da evidência em união.`),
    tabela('Detecções da evidência da célula, em união', ['Data e hora (GMT)', 'Município', 'Latitude', 'Longitude', 'Lentes', 'ID técnico'], linhas, 'Tabela de detecções da evidência da célula'),
    h('div', { class: 'acoes' }, anterior, proxima));
}

function painelCelula(r: ResultadoCombinacao, c: CelulaCombinada, ctx: ContextoCombinacao, m: ManipuladoresCombinacao): HTMLElement {
  const cob = c.cobertura;
  const corpo = h('div', { id: 'lente-painel', class: 'painel-lente', 'data-destaque': c.id_combinado },
    h('h3', { tabindex: '-1', id: 'lente-painel-titulo' }, `Célula ${c.unidade.id} (${bordas(c)})`),
    ficha([['Célula 0,05°', c.unidade.id], ['Detecções da evidência', fmtNumero(c.evidencia.deteccoes.length)],
      ['Município(s)', cob.municipios.map((x) => ctx.nomes.get(x) ?? String(x)).join('; ')], ['Limites', bordas(c)]]),
    h('p', { id: 'lente-celula-lentes' }, h('strong', {}, 'Destacada por: '), `${nomesDosCriterios(c)}.`),
    h('p', { id: 'lente-operador', class: 'nota' }, r.operador === 'e'
      ? `Operador "e": a célula entrou porque todas as lentes escolhidas (${descreverLentes(r.lentes, 'e')}) a destacaram.`
      : `Operador "ou": basta uma das lentes escolhidas (${descreverLentes(r.lentes, 'ou')}); estas a destacaram: ${nomesDosCriterios(c)}.`),
    ...c.criterios.map((x) => blocoCriterio(x, c, r.janela, ctx.nomes)),
    h('p', { id: 'lente-cobertura', 'data-cobertura': cob.estado }, h('strong', {}, 'Disponibilidade da célula: '), textoCobertura(cob)),
    h('p', { id: 'lente-municipios' }, h('strong', {}, 'Municípios considerados na disponibilidade: '),
      `${cob.municipios.map((x) => nomeMunicipio(x, ctx.nomes)).join('; ')}. São os municípios de todas as detecções da célula na janela, inclusive os que nenhuma lente usou; um dia só conta como sem evidência de lacuna se todos estiverem assim.`),
  );
  if (cob.estado === 'completa' && cob.demais_dias.length) {
    corpo.append(h('details', { class: 'detalhes' }, h('summary', {}, `Dias que contam contra (${cob.demais_dias.length})`),
      h('ul', { class: 'lista-simples', id: 'lente-dias' }, ...cob.demais_dias.map((dia) => h('li', { 'data-classe': dia.classe },
        `${dia.dia}: ${ROTULO_CLASSE[dia.classe].rotulo}`,
        h('ul', {}, ...dia.municipios.map((x) => h('li', {}, linhaMunicipio(x, ctx.nomes)))))))));
  }
  corpo.append(caixaRessalvas(null), detalhesEvidencia(c.id_combinado, c.evidencia.deteccoes.length, tabelaUniao(c, ctx, m)),
    metadados({ carga: r.carga, janela: r.janela, versao: `${r.versao_combinacao} sobre ${r.versao_metodo}` }));
  return corpo;
}

export function renderResultadoCombinacao(
  r: ResultadoCombinacao,
  selecionado: string | null,
  ctx: ContextoCombinacao,
  m: ManipuladoresCombinacao,
): void {
  const corpo = $('lente-corpo');
  corpo.replaceChildren();
  const n = r.estado === 'com_celulas' ? r.celulas.length : 0;
  rotularAbaDestaques(n);
  renderResumoLente({ titulo: 'Combinação de lentes', nome: `Combinação: ${descreverLentes(r.lentes, r.operador)}`, quantidade: n, unidade: 'celula', janela: r.janela, ordem: 'norte→sul, oeste→leste; não é ranking', municipio: municipioDoRecorte(r.recorte, ctx.nomes) });
  if (r.estado === 'com_celulas') corpo.append(h('p', { class: 'criterio' }, `${fmtNumero(n)} lugares foram destacados ${r.operador === 'e' ? 'por todos os critérios escolhidos' : 'por pelo menos um dos critérios escolhidos'}.`), h('p', { class: 'nota' }, 'Toque em um lugar para entender quais critérios o destacaram.'));
  // Cabeçalho: sempre a configuração do resultado, nunca a do formulário (R1-7).
  corpo.append(
    h('p', { id: 'lente-configuracao' }, h('strong', {}, 'Combinação aplicada: '),
      `${descreverLentes(r.lentes, r.operador)} (operador ${DESCRICAO_OPERADOR[r.operador]}).`),
    h('p', { id: 'lente-escopo', class: 'ajuda' },
      `Janela: ${r.janela.inicio} a ${r.janela.fim} (${r.janela.referencia}) · carga nº ${r.carga.id} · ${textoRecorteLente(r.recorte, ctx.nomes)} · combinação ${r.versao_combinacao} sobre o método ${r.versao_metodo}.`),
    h('dl', { class: 'definicoes', id: 'lente-parametros' }, ...r.parametros.flatMap((p) => [
      h('dt', {}, `${p.origem === 'combinacao' ? 'Combinação' : TITULO_LENTE[p.origem]} — ${p.nome}`), h('dd', {}, p.valor)])),
    h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, ORDEM_FIXA),
  );
  if (r.estado === 'indisponivel') {
    corpo.append(h('ul', { class: 'lista-simples', id: 'lente-indisponibilidade' }, ...r.indisponibilidade.map((x) => h('li', {}, `${x.texto}.`))));
  } else if (r.estado === 'sem_celulas') {
    corpo.append(h('p', { id: 'lente-sem-celulas', class: 'ajuda' }, textoSemCelulas(r.operador)));
  } else {
    const total = r.celulas.length;
    const pagina = paginaValida(ctx.pagina, total);
    const de = pagina * CELULAS_POR_PAGINA;
    const visiveis = r.celulas.slice(de, de + CELULAS_POR_PAGINA);
    const paginas = Math.ceil(total / CELULAS_POR_PAGINA);
    corpo.append(h('p', { id: 'lente-celulas-info', class: 'ajuda', tabindex: '-1' },
      `Células ${fmtNumero(de + 1)} a ${fmtNumero(de + visiveis.length)} de ${fmtNumero(total)}.`));
    const lista = h('ol', { class: 'destaques lista-celulas', id: 'lente-destaques', start: String(de + 1), 'aria-label': 'Células da combinação (alternativa em texto ao mapa)' });
    for (const [indice, c] of visiveis.entries()) {
      const b = h('button', { type: 'button', class: 'botao-nome', 'data-id': c.id_combinado, 'aria-pressed': String(c.id_combinado === selecionado) },
        `Lugar ${fmtNumero(de + indice + 1)} — lentes: ${nomesDosCriterios(c)}`);
      b.addEventListener('click', () => m.selecionar(c.id_combinado));
      lista.append(h('li', {}, b, h('span', { class: 'etiqueta', 'data-cobertura': c.cobertura.estado }, textoCobertura(c.cobertura))));
    }
    corpo.append(lista,
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
  corpo.append(h('h3', { class: 'rotulo-secao' }, 'Limitações da combinação'), h('ul', { class: 'lista-simples nota', id: 'lente-limitacoes' }, ...r.limitacoes.map((l) => h('li', {}, l))));
  const escolhida = r.estado === 'com_celulas' ? r.celulas.find((c) => c.id_combinado === selecionado) : undefined;
  mostrarExplicacao(escolhida ? painelCelula(r, escolhida, ctx, m) : null, 'Por que este lugar aparece?');
}
