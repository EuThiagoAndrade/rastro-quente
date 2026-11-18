// Coluna de resultado (plano 007, item 2): abas Destaques e Municípios (padrão de abas acessível), lista ↔
// explicação com "Voltar aos destaques", resumo da lente, cartão do município, lista estadual ordenável e a
// "Lista de focos" (T21). Todo valor da fonte entra por textContent.
import { $, h, tabela } from './apresentacao.ts';
import { fmtDataHoraGmt, fmtNumero, larguraProporcional, ROTULO_CLASSE, ROTULO_DIVERGENCIA } from './formato.ts';
import { textoCobertura } from './lentes/cobertura.ts';
import type { Cobertura, RegistroLente } from './lentes/contrato.ts';
import { linhaCelulasDestacadas, listaMunicipios, maioresMunicipios, numerosMunicipio, type DestaquesAtivos, type OrdemMunicipios } from './municipios.ts';
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
  pergunta: string;
  resposta: string;
  quantidade: number | null;
  celulasDaPersistencia?: number;
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
  $('t-destaques').textContent = r.titulo;
  const n = r.quantidade;
  const celulas = r.celulasDaPersistencia;
  const unidade = r.unidade === 'celula' ? (n === 1 ? 'célula' : 'células') : (n === 1 ? 'município' : 'municípios');
  const numero = n === null ? null : celulas === undefined ? `${fmtNumero(n)} ${unidade}`
    : `${fmtNumero(n)} ${n === 1 ? 'sequência' : 'sequências'} em ${fmtNumero(celulas)} ${celulas === 1 ? 'célula' : 'células'}`;
  const recorte = r.municipio === null ? 'todo Mato Grosso' : r.municipio;
  const periodo = `entre ${dataBr(r.janela.inicio)} e ${dataBr(r.janela.fim)} (GMT)`;
  const frase = n === 1 && celulas === undefined
    ? r.resposta.replace('Tiveram', 'Teve').replace('Foram destacados', 'Foi destacado').replace('Atenderam', 'Atendeu')
    : r.resposta;
  const resposta = h('p', { class: 'lente-resposta' },
    n === null ? r.resposta : n === 0
      ? `Nenhum destaque atingiu o critério no período escolhido. ${r.resposta}`
      : `Em ${recorte}, `);
  if (n !== null && n > 0) {
    resposta.append(h('strong', { id: 'resumo-lente-numero' }, numero ?? ''), ` ${frase.charAt(0).toLowerCase()}${frase.slice(1).replace(/\.$/, '')} ${periodo}.`);
  } else if (numero !== null) {
    resposta.prepend(h('strong', { id: 'resumo-lente-numero' }, numero), '. ');
  }
  alvo.replaceChildren(
    h('p', { class: 'lente-pergunta' }, r.pergunta), resposta,
    h('p', { class: 'so-leitor', id: 'resumo-lente-recorte' }, `${r.municipio === null ? 'em todo Mato Grosso' : `calculada só com os focos de ${r.municipio}`} · ${periodo}`));

}

export function blocoLente(titulo: string, ajuda: string, ...conteudo: HTMLElement[]): HTMLElement {
  return h('section', { class: 'lente-bloco' }, h('h3', { class: 'lente-bloco-titulo' }, titulo),
    h('p', { class: 'lente-bloco-para' }, ajuda), ...conteudo);
}

export function cartaoAcao(botao: HTMLButtonElement, explicacao: string): HTMLElement {
  return h('div', { class: 'lente-acao' }, botao, h('p', {}, explicacao));
}

/** Agrupa a lista e os dados técnicos na mesma composição da proposta aprovada. */
export function comporListaLente(corpo: HTMLElement, explicacao: string): void {
  const lista = corpo.querySelector<HTMLOListElement>('#lente-destaques');
  const tecnicos = corpo.querySelector<HTMLDetailsElement>('details[data-tecnico]');
  const limitacoes = corpo.querySelector<HTMLElement>('#lente-limitacoes');
  const tituloLimitacoes = limitacoes?.previousElementSibling;
  if (limitacoes && tecnicos) {
    if (tituloLimitacoes) tecnicos.append(tituloLimitacoes);
    tecnicos.append(limitacoes);
  }
  const maior = corpo.querySelector<HTMLElement>('[data-maior-valor]');
  if (maior) $('resumo-lente').querySelector('.lente-resposta')?.append(' ', maior);
  const entende = blocoLente('O que isso quer dizer?', 'Entenda o resultado antes de escolher um lugar.',
    h('p', { class: 'nota' }, explicacao),
    h('p', { class: 'nota' }, h('strong', {}, 'Focos de calor não comprovam incêndio, dano ou responsável.')));
  corpo.prepend(entende);
  if (lista) {
    for (const botao of lista.querySelectorAll<HTMLButtonElement>('button[data-id]')) {
      const texto = botao.textContent ?? '';
      botao.setAttribute('aria-label', texto);
      const partes = texto.split(' — ');
      const metrica = partes[1] ?? '';
      const unidade = partes[0] ?? '';
      const celula = unidade.startsWith('Célula ');
      const titulo = celula ? `Lugar — ${metrica.split(' (')[0]}` : texto;
      botao.replaceChildren(h('strong', {}, titulo));
      if (celula) botao.append(h('small', {}, unidade));
      const parenteses = metrica.indexOf(' (');
      if (parenteses >= 0) botao.append(h('small', {}, metrica.slice(parenteses + 2).replace(/\)$/, '')));
    }
    const bloco = blocoLente('Lugares encontrados', 'Toque em um lugar para entender por que ele aparece.');
    lista.before(bloco);
    bloco.append(lista);
    const ordem = corpo.querySelector<HTMLElement>('#lente-ordenacao');
    if (ordem) bloco.append(ordem);
  } else {
    entende.hidden = true;
  }
  for (const botao of corpo.querySelectorAll<HTMLButtonElement>('.acoes > button')) {
    if (botao.textContent === 'Alterar o período') botao.parentElement?.replaceWith(
      cartaoAcao(botao, 'Escolha outras datas para fazer uma nova consulta.'));
  }
}

/** A explicação abre com a resposta, seguida da evidência visual e da disponibilidade. */
export function comporDetalheLente(corpo: HTMLElement, resposta: string, pergunta: string, dadosCobertura: Cobertura): void {
  const titulo = corpo.querySelector<HTMLElement>('#lente-painel-titulo');
  if (!titulo) return;
  const primeiraFrase = resposta.indexOf('. ');
  const textoResposta = h('p', { class: 'lente-resposta' },
    h('strong', {}, primeiraFrase < 0 ? resposta : resposta.slice(0, primeiraFrase + 1)),
    primeiraFrase < 0 ? '' : resposta.slice(primeiraFrase + 1));
  titulo.after(h('p', { class: 'lente-pergunta' }, pergunta), textoResposta);
  const ficha = corpo.querySelector<HTMLElement>('#lente-ficha');
  const metadados = corpo.querySelector<HTMLDetailsElement>('#lente-detalhes-tecnicos');
  if (ficha && metadados) {
    const municipio = [...ficha.querySelectorAll('div')].find((item) => item.querySelector('dt')?.textContent === 'Município(s)')?.querySelector('dd')?.textContent;
    if (municipio) titulo.textContent = `Lugar em ${municipio}`;
    metadados.append(ficha);
  }
  const cobertura = corpo.querySelector<HTMLElement>('#lente-cobertura');
  if (cobertura) {
    const bloco = blocoLente('Faltou alguma informação?', 'Veja se há dias que podem afetar este resultado.');
    bloco.id = 'lente-disponibilidade';
    cobertura.before(bloco);
    const classes = corpo.querySelector<HTMLElement>('.lente-classes');
    const detalhes = h('details', { class: 'detalhes', id: 'lente-disponibilidade-detalhes' },
      h('summary', {}, 'Ver disponibilidade por classe e município'));
    const municipios = corpo.querySelector<HTMLElement>('#lente-municipios');
    const dias = corpo.querySelector<HTMLElement>('#lente-dias')?.closest('details');
    if (dadosCobertura.estado === 'completa') {
      const n = dadosCobertura.demais_dias.length;
      bloco.append(h('p', { class: n ? 'lente-alerta' : 'nota' },
        n
          ? `Em ${fmtNumero(n)} ${n === 1 ? 'dia houve' : 'dias houve'} falta de dados ou incerteza nesta unidade. Pode ter havido focos não registrados nesses dias.`
          : 'Nenhum dia com lacuna conhecida ou incidência indeterminada nesta unidade. Mesmo assim, não há garantia de que todos os focos foram detectados.'));
      detalhes.append(cobertura);
    } else {
      bloco.append(cobertura);
    }
    if (classes) detalhes.append(classes);
    if (municipios) detalhes.append(municipios);
    if (dias) detalhes.append(dias);
    if (metadados) metadados.append(detalhes);
  }
  const criterios = [...corpo.querySelectorAll<HTMLElement>(':scope > .criterio')];
  if (criterios.length === 1 && metadados) metadados.append(criterios[0]!);
  const meses = corpo.querySelector<HTMLElement>('#lente-meses')?.closest('section');
  const disponibilidade = corpo.querySelector<HTMLElement>('#lente-disponibilidade');
  if (meses && disponibilidade) disponibilidade.before(meses);
  const destacadaPor = [...corpo.querySelectorAll<HTMLElement>(':scope > p')].find((p) => p.textContent?.startsWith('Destacado por:'));
  if (destacadaPor && metadados) metadados.append(destacadaPor);
  const ressalvas = corpo.querySelector<HTMLElement>('#lente-caixa-ressalvas');
  if (ressalvas && metadados) metadados.append(ressalvas);
  const evidencia = corpo.querySelector<HTMLElement>('#lente-evidencia-detalhes');
  if (evidencia && metadados) metadados.querySelector('summary')?.after(evidencia);
  const tituloVista = $('t-explicacao');
  tituloVista.classList.add('so-leitor');
}

export function acaoPeriodo(): HTMLButtonElement {
  const b = h('button', { type: 'button', class: 'botao botao--secundario' }, 'Alterar o período');
  b.addEventListener('click', () => {
    $<HTMLDetailsElement>('secao-consulta').open = true;
    const periodo = $<HTMLSelectElement>('f-periodo');
    (periodo.value === 'personalizado' ? $('f-inicio') : periodo).focus();
  });
  return b;
}

export function etiquetaCobertura(c: Cobertura): HTMLElement {
  const texto = c.estado === 'completa'
    ? c.demais_dias.length === 0 ? 'sem lacuna conhecida'
      : `${fmtNumero(c.demais_dias.length)} ${c.demais_dias.length === 1 ? 'dia precisa' : 'dias precisam'} de atenção`
    : textoCobertura(c);
  return h('span', { class: 'etiqueta lente-selo', 'data-cobertura': c.estado,
    'data-atencao': String(c.estado !== 'completa' || c.demais_dias.length > 0), 'aria-label': textoCobertura(c) }, texto);
}

export function resumoClassesDaCobertura(c: Cobertura): HTMLElement | null {
  if (c.estado !== 'completa') return null;
  const contagens = {
    sem_evidencia_de_lacuna: c.dias_sem_evidencia_de_lacuna,
    lacuna_conhecida: 0,
    incidencia_indeterminada: 0,
  };
  for (const dia of c.demais_dias) contagens[dia.classe] += 1;
  const classes = ['sem_evidencia_de_lacuna', 'lacuna_conhecida', 'incidencia_indeterminada'] as const;
  return h('dl', { class: 'lente-classes', 'aria-label': 'Dias GMT por classe de disponibilidade' },
    ...classes.map((classe) => {
      const n = contagens[classe];
      return h('div', {}, h('dt', {}, ROTULO_CLASSE[classe].rotulo), h('dd', {}, `${fmtNumero(n)} ${n === 1 ? 'dia GMT' : 'dias GMT'}`));
    }));
}

export function resumoMaiorValor(valores: readonly number[], medida: string): HTMLElement {
  const maior = valores.reduce((n, valor) => Math.max(n, valor), 0);
  const empatados = valores.filter((valor) => valor === maior).length;
  return h('span', { 'data-maior-valor': 'true' },
    `Maior valor observado: ${fmtNumero(maior)} ${medida}${empatados > 1 ? ` (${fmtNumero(empatados)} destaques empatados)` : ''}.`);
}

export function detalhesTecnicos(...conteudo: HTMLElement[]): HTMLElement {
  return h('details', { class: 'detalhes', 'data-tecnico': 'true' }, h('summary', {}, 'Ver detalhes técnicos e limitações'), ...conteudo);
}

export function acoesDestaque(id: string, n: number, mostrarNoMapa: (id: string) => Promise<boolean>): HTMLElement {
  const mapa = h('button', { id: 'lente-mostrar-mapa', type: 'button', class: 'botao botao--primario' }, 'Mostrar no mapa');
  const focos = h('button', { id: 'lente-ver-focos', type: 'button', class: 'botao botao--secundario', 'aria-controls': 'lente-evidencia-detalhes' }, n === 1 ? 'Ver o foco' : `Ver os ${fmtNumero(n)} focos`);
  const estado = h('p', { class: 'aviso-estado', role: 'status', hidden: true });
  mapa.addEventListener('click', async () => {
    estado.hidden = await mostrarNoMapa(id);
    estado.textContent = estado.hidden ? '' : 'Geometria do destaque indisponível no mapa.';
  });
  focos.addEventListener('click', () => {
    const evidencia = $<HTMLDetailsElement>('lente-evidencia-detalhes');
    $<HTMLDetailsElement>('lente-detalhes-tecnicos').open = true;
    evidencia.open = true;
    evidenciaAberta.add(id);
    $('lente-evidencia-info').focus();
  });
  return h('div', { class: 'lente-acoes' },
    cartaoAcao(mapa, 'Localize este lugar no mapa para ver onde ele fica.'),
    cartaoAcao(focos, 'Confira os registros que explicam por que este lugar foi destacado.'), estado);
}

const EVIDENCIA_POR_PAGINA = 20;

export function tabelaPaginadaEvidencia(
  ids: readonly string[],
  ctx: { registros: Map<string, RegistroLente>; nomes: Map<number, string>; paginaEvidencia: number },
  mudarPagina: (pagina: number) => void,
  titulo: string,
  coluna?: { nome: string; valor(id: string): string },
  uniao = false,
): HTMLElement {
  const total = ids.length;
  const paginas = Math.max(1, Math.ceil(total / EVIDENCIA_POR_PAGINA));
  const pagina = Math.min(Math.max(0, ctx.paginaEvidencia), paginas - 1);
  const de = pagina * EVIDENCIA_POR_PAGINA;
  const linhas = ids.slice(de, de + EVIDENCIA_POR_PAGINA).map((id) => {
    const r = ctx.registros.get(id);
    const campos = r
      ? [fmtDataHoraGmt(r.data_hora_gmt), `${ctx.nomes.get(r.municipio_codigo) ?? 'município'} (${r.municipio_codigo})`, String(r.latitude), String(r.longitude)]
      : ['—', '—', '—', '—'];
    return [...campos, ...(coluna ? [coluna.valor(id)] : []), id];
  });
  const anterior = h('button', { type: 'button', id: 'evidencia-anterior', class: 'botao botao--secundario', disabled: pagina === 0 }, 'Detecções anteriores');
  const proxima = h('button', { type: 'button', id: 'evidencia-proxima', class: 'botao botao--secundario', disabled: pagina >= paginas - 1 }, 'Próximas detecções');
  anterior.addEventListener('click', () => mudarPagina(pagina - 1));
  proxima.addEventListener('click', () => mudarPagina(pagina + 1));
  return h('div', { id: 'lente-evidencia-tabela' },
    h('p', { id: 'lente-evidencia-info', class: 'ajuda', tabindex: '-1' }, `Mostrando ${fmtNumero(total === 0 ? 0 : de + 1)}–${fmtNumero(de + linhas.length)} de ${fmtNumero(total)} detecções da evidência${uniao ? ' em união' : ''}.`),
    tabela(titulo, ['Data e hora (GMT)', 'Município', 'Latitude', 'Longitude', ...(coluna ? [coluna.nome] : []), 'ID técnico'], linhas, 'Tabela de detecções da evidência'),
    h('div', { class: 'acoes' }, anterior, proxima));
}

/** Mostra a explicação de um destaque (ou volta à lista, com `null`). */
export function mostrarExplicacao(painel: HTMLElement | null, titulo = 'Por que este destaque?'): void {
  const alvo = $('lente-explicacao');
  if (painel) {
    const ativo = document.activeElement;
    const anterior = alvo.querySelector<HTMLElement>('#lente-painel');
    const mesmoDestaque = anterior?.dataset['destaque'] === painel.dataset['destaque'];
    const foco = mesmoDestaque && ativo instanceof HTMLElement && alvo.contains(ativo) ? ativo.id : '';
    if (mesmoDestaque) {
      for (const id of ['lente-detalhes-tecnicos', 'lente-disponibilidade-detalhes']) {
        const detalhes = painel.querySelector<HTMLDetailsElement>(`#${id}`);
        if (detalhes) detalhes.open = alvo.querySelector<HTMLDetailsElement>(`#${id}`)?.open ?? false;
      }
    }
    alvo.replaceChildren(painel);
    if (foco) document.getElementById(foco)?.focus({ preventScroll: true });
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
  detalhe: { codigo: number; mapa: 'ocioso' | 'carregando' | 'exibido' | 'ausente' | 'falha' } | null;
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
  inspecionar(codigo: number): void;
  voltar(): void;
  mostrarNoMapa(): void;
  verDestaques(): void;
}

const ROTULO_ORDEM: Record<OrdemMunicipios, string> = { deteccoes: 'Detecções', destaques: 'Destaques da lente', nome: 'Nome' };

function cartaoMunicipio(ctx: ContextoMunicipios): HTMLElement {
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
  return h('div', { class: 'cartao-mun', id: 'cartao-municipio' }, h('h3', { class: 'so-leitor' }, ctx.nomeMunicipio ?? ''), dl,
    leitura === 'erro' ? h('p', { class: 'aviso-estado' }, 'A leitura dos registros do recorte falhou; as células com foco não foram contadas. Os demais números continuam válidos.') : null);
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

function detalheMunicipio(ctx: ContextoMunicipios, m: ManipuladoresMunicipios): void {
  const corpo = $('municipios-corpo');
  const codigo = ctx.resumo.municipio ?? ctx.detalhe?.codigo;
  const municipal = ctx.resumo.municipio !== null;
  const linha = listaMunicipios(ctx.resumo.principal.por_municipio, ctx.ordem, ctx.ativos, ctx.registrosLente).find((l) => l.codigo === codigo);
  const nome = municipal ? ctx.nomeMunicipio : linha?.nome;
  if (!nome || codigo === undefined) return;
  const voltar = h('button', { type: 'button', id: municipal ? 'botao-todo-estado' : 'municipio-voltar', class: 'botao botao--secundario' },
    municipal ? 'Ver todo Mato Grosso' : '← Voltar aos municípios');
  voltar.addEventListener('click', () => municipal ? m.escolher(null) : m.voltar());
  const titulo = h('h3', { id: 'municipio-detalhe-titulo', tabindex: '-1' }, nome);
  const resposta = municipal
    ? `${fmtNumero(ctx.resumo.principal.total)} detecções no recorte de ${nome}.`
    : `${nome} tem ${fmtNumero(linha?.total ?? 0)} detecções no resultado estadual.`;
  corpo.replaceChildren(voltar, titulo,
    h('p', { class: 'lente-pergunta' }, 'O que os dados mostram neste município?'),
    h('p', { class: 'lente-resposta' }, h('strong', {}, resposta)), periodoMunicipios(ctx),
    h('p', { class: 'nota', id: 'mun-explica' }, municipal
      ? `Números calculados só com os focos de ${nome} no período. As lentes também usam só esses focos.`
      : 'Inspeção do resultado de todo Mato Grosso. O período, os filtros e o contexto do agente continuam os mesmos.'));
  if (municipal) corpo.append(cartaoMunicipio(ctx));
  else {
    const dados = h('dl', { id: 'municipio-estadual-numeros', class: 'definicoes' },
      h('dt', {}, 'Detecções no período'), h('dd', {}, fmtNumero(linha?.total ?? 0)));
    if (ctx.ativos?.unidade === 'celula') dados.append(
      h('dt', {}, `Células em destaques estaduais (${ctx.nomeLente ?? 'lente'})`), h('dd', {}, fmtNumero(linha?.celulas ?? 0)));
    if (ctx.ativos?.unidade === 'municipio') dados.append(
      h('dt', {}, 'Participação na concentração estadual'), h('dd', {}, linha?.destacado ? 'Município destacado' : 'Fora dos destaques'));
    corpo.append(dados, h('p', { class: 'nota' }, 'Dias com detecção e células com foco ficam disponíveis ao consultar o município.'));
  }
  const explicacao = blocoLente('O que isso quer dizer?', 'As medidas descrevem registros diferentes.');
  explicacao.append(h('p', { class: 'nota' }, municipal
    ? 'Detecções são registros de calor; dias contam datas GMT distintas; células são lugares da grade de 0,05°. Células na divisa podem perder destaque quando só os focos deste município entram na lente.'
    : 'A participação nos destaques estaduais não é o resultado de refazer a lente só com os focos deste município. Uma célula destacada conta em cada município com detecção nela.'),
    h('p', { class: 'nota' }, 'Contagem absoluta favorece municípios grandes. Não indica prioridade, gravidade nem risco. Detecções não comprovam incêndio, dano, autoria ou infração.'));
  corpo.append(explicacao);
  const mapa = h('button', { id: 'municipio-mostrar-mapa', type: 'button', class: 'botao botao--primario', 'aria-disabled': String(ctx.detalhe?.mapa === 'carregando') }, 'Mostrar no mapa');
  mapa.addEventListener('click', m.mostrarNoMapa);
  const estado = ctx.detalhe?.mapa ?? 'ocioso';
  const mensagens = { ocioso: '', carregando: 'Carregando a geometria do município…', exibido: 'Município localizado no mapa. Os filtros foram preservados.', ausente: 'Geometria do município indisponível nesta carga.', falha: 'Não foi possível carregar a geometria. Tente novamente.' };
  const acoes = h('div', { class: 'lente-acoes' }, cartaoAcao(mapa, 'Enquadra este município sem mudar os filtros, as camadas ou a seleção.'),
    h('p', { id: 'municipio-mapa-estado', class: 'nota', role: 'status', 'data-estado': estado }, mensagens[estado]));
  if (!municipal) {
    const consultar = h('button', { id: 'municipio-consultar', type: 'button', class: 'botao botao--secundario' }, 'Consultar município');
    consultar.addEventListener('click', () => m.escolher(codigo));
    acoes.append(cartaoAcao(consultar, `Aplica ${nome} à consulta, ao mapa e às lentes compatíveis. Mantém o período.`));
  }
  const destaques = h('button', { id: 'municipio-ver-destaques', type: 'button', class: 'botao botao--secundario' }, 'Ver destaques');
  destaques.addEventListener('click', m.verDestaques);
  acoes.append(cartaoAcao(destaques, municipal
    ? `Abre Lentes no recorte aplicado de ${nome}.`
    : 'Abre Lentes no resultado de todo Mato Grosso. Para o resultado municipal, use “Consultar município” antes. Concentração só existe no estado.'));
  corpo.append(acoes, detalhesTecnicos(
    h('p', {}, `Código municipal: ${codigo}. Carga nº ${ctx.resumo.carga.id}. Satélite: ${ctx.resumo.carga.satelite}. Datas em GMT. Grade T1 de 0,05°.`),
    h('p', {}, 'A geometria de exibição pode ser simplificada; ela não altera as contagens. Fontes, versão e limitações completas estão em “Sobre os dados”, no topo.')));
}

function periodoMunicipios(ctx: ContextoMunicipios): HTMLElement {
  return h('p', { class: 'nota', id: 'municipios-periodo' }, `${ctx.resumo.periodo.inicio} a ${ctx.resumo.periodo.fim} · GMT · ${ctx.resumo.municipio === null ? 'Todo Mato Grosso' : ctx.nomeMunicipio ?? 'Município'}`);
}

function desenharMunicipios(ctx: ContextoMunicipios, m: ManipuladoresMunicipios): void {
  const corpo = $('municipios-corpo');
  const comMunicipio = ctx.resumo.municipio !== null;
  $('t-municipios').textContent = comMunicipio ? 'Município no período' : 'Municípios no período';
  $('t-municipios').classList.toggle('so-leitor', comMunicipio || ctx.detalhe !== null);
  if (comMunicipio || ctx.detalhe) {
    detalheMunicipio(ctx, m);
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
    + ' Toque num município para ver os detalhes, sem alterar os filtros. A ordem não indica prioridade, gravidade nem risco.';
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
    b.addEventListener('click', () => m.inspecionar(l.codigo));
    return h('li', {}, b);
  }));
  const maiores = maioresMunicipios(linhas);
  const maior = maiores[0]?.total ?? 0;
  corpo.replaceChildren(
    h('p', { class: 'lente-pergunta' }, 'Onde foram registradas mais detecções no período?'),
    h('p', { class: 'lente-resposta', id: 'municipios-resposta' }, h('strong', {}, linhas.length
      ? `${fmtNumero(ctx.resumo.principal.total)} detecções em ${fmtNumero(linhas.length)} ${linhas.length === 1 ? 'município' : 'municípios'}.`
      : 'Nenhuma detecção neste período em Mato Grosso.'),
      maiores.length ? ` Maior contagem: ${maiores.map((l) => l.nome).join(', ')} — ${fmtNumero(maior)} ${maiores.length > 1 ? 'em cada município (empate)' : 'detecções'}.` : ' Isso não comprova ausência de fogo nem cobertura.'),
    periodoMunicipios(ctx), blocoLente('O que isso quer dizer?', 'Contagem absoluta favorece municípios grandes; não mede risco nem gravidade.'),
    h('p', { class: 'nota', id: 'mun-explica' }, explica),
    blocoLente('Municípios encontrados', 'Abra um município para inspecionar os dados e escolher uma ação.'), ordem);
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
    h('summary', { id: 'lente-evidencia-resumo' }, n === 1 ? 'Ver a detecção que sustenta o destaque' : `Ver as ${fmtNumero(n)} detecções que sustentam o destaque`),
    conteudo);
  d.addEventListener('toggle', () => { if (!d.isConnected) return; if (d.open) evidenciaAberta.add(id); else evidenciaAberta.delete(id); });
  return d;
}

/** Metadados curtos ao fim da explicação. */
export function metadados(r: { carga: { id: number; identidade: string }; janela: { inicio: string; fim: string }; versao: string }): HTMLElement {
  const item = (t: string, v: string) => [h('dt', {}, t), h('dd', {}, v)];
  const dados = h('dl', { class: 'metadados', id: 'lente-metadados' },
    ...item('Pertencimento', 'calculado com o polígono integral; o mapa é só exibição'),
    ...item('Versão', `carga nº ${r.carga.id} · identidade ${r.carga.identidade}`),
    ...item('Período', `${dataBr(r.janela.inicio)} a ${dataBr(r.janela.fim)} (dias GMT)`),
    ...item('Método', r.versao));
  const fonte = h('button', { id: 'lente-proveniencia', type: 'button', class: 'botao botao--secundario' }, 'Sobre os dados');
  fonte.addEventListener('click', () => {
    const dialogo = $<HTMLDialogElement>('dialogo-sobre');
    dialogo.addEventListener('close', () => fonte.focus({ preventScroll: true }), { once: true });
    $('botao-sobre').click();
  });
  return h('details', { class: 'detalhes', id: 'lente-detalhes-tecnicos' }, h('summary', { id: 'lente-metadados-resumo' }, 'Ver detalhes técnicos e limitações'), dados, fonte);
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
