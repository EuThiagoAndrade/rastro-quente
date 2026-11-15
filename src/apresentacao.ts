// Apresentação: monta o DOM a partir do estado. Todo valor vindo da fonte (nomes, ids, motivos, avisos,
// URLs) entra por textContent, nunca como marcação. Sem dados ilustrativos: sem dado, só estado vazio.
import {
  AVISO_SIMPLIFICACAO, fmtBytes, fmtDataHoraGmt, fmtDiferenca, fmtIntervaloGmt, fmtNumero, humanizar,
  ROTULO_ALCANCE, ROTULO_CLASSE,
} from './formato.ts';
import { resumoPeriodo, textoPeriodo, textoRecorte, type Janela } from './recorte.ts';
import { montarSerie, rotuloBarra, type BarraSerie } from './serie.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import type { CargaDetalhe, ClasseDisponibilidade, Disponibilidade, Fonte, Malha, MunicipioItem, Resumo } from './tipos.ts';

type Filho = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  atributos: Record<string, string | boolean | undefined> = {},
  ...filhos: Filho[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(atributos)) {
    if (v === undefined || v === false) continue;
    e.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos) if (f !== null && f !== undefined && f !== false) e.append(f);
  return e;
}

export const $ = <T extends HTMLElement>(id: string): T => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`elemento #${id} ausente`);
  return e as T;
};

const limpar = (e: HTMLElement) => e.replaceChildren();

export function tabela(legenda: string, cabecalho: string[], linhas: Filho[][], rotulo: string): HTMLElement {
  const t = h('table', {}, h('caption', { class: 'so-leitor' }, legenda),
    h('thead', {}, h('tr', {}, ...cabecalho.map((c) => h('th', { scope: 'col' }, c)))),
    h('tbody', {}, ...linhas.map((l) => h('tr', {}, ...l.map((c) => h('td', {}, c))))));
  // Região rolável própria: a rolagem 2D é a exceção admitida para tabelas, nunca da página.
  return h('div', { class: 'rolavel', role: 'region', tabindex: '0', 'aria-label': rotulo }, t);
}

// --- Acesso e sessão -----------------------------------------------------------------------------

export type Acesso =
  | { tipo: 'config_ausente' }
  | { tipo: 'iniciando' }
  | { tipo: 'anonimo'; motivo?: 'saiu' | 'expirada'; erro?: string }
  | { tipo: 'verificando' }
  | { tipo: 'negado' }
  | { tipo: 'sem_publicacao' }
  | { tipo: 'fonte_indisponivel' }
  | { tipo: 'autorizado' };

export interface ManipuladoresAcesso {
  google(): void;
  senha(email: string, senha: string): void;
  tentarNovamente(): void;
  senhaLocal: boolean;
}

const ROTULO_SESSAO: Record<Acesso['tipo'], string> = {
  config_ausente: 'Sem configuração',
  iniciando: 'Verificando sessão…',
  anonimo: 'Sem sessão',
  verificando: 'Verificando autorização…',
  negado: 'Sessão sem autorização',
  sem_publicacao: 'Sessão autorizada, sem versão publicada',
  fonte_indisponivel: 'Sessão ativa, fonte indisponível',
  autorizado: 'Sessão autorizada',
};

export function renderAcesso(a: Acesso, m: ManipuladoresAcesso): void {
  $('sessao-estado').textContent = ROTULO_SESSAO[a.tipo];
  $('botao-sair').hidden = !['verificando', 'negado', 'sem_publicacao', 'fonte_indisponivel', 'autorizado'].includes(a.tipo);
  $('conteudo').hidden = a.tipo !== 'autorizado';
  // Chips e diálogos do topo mostram dados da versão: só existem com acesso autorizado (T13).
  for (const id of ['topo-chips', 'botao-sobre', 'botao-como-ler']) $(id).hidden = a.tipo !== 'autorizado';
  const secao = $('acesso');
  const corpo = $('acesso-corpo');
  secao.hidden = a.tipo === 'autorizado';
  secao.dataset['estado'] = a.tipo;
  limpar(corpo);
  switch (a.tipo) {
    case 'config_ausente':
      corpo.append(h('p', { class: 'aviso-estado' }, 'Configuração ausente: o build precisa de VITE_SUPABASE_URL e VITE_SUPABASE_CHAVE_PUBLICAVEL (ver docs/runbook.md). Nenhum dado é exibido sem ela.'));
      break;
    case 'iniciando':
    case 'verificando':
      corpo.append(h('p', {}, a.tipo === 'iniciando' ? 'Verificando a sessão…' : 'Verificando se esta conta tem autorização…'));
      break;
    case 'anonimo': {
      if (a.motivo === 'saiu') corpo.append(h('p', { class: 'aviso-estado' }, 'Você saiu. Os dados da consulta foram removidos da tela.'));
      if (a.motivo === 'expirada') corpo.append(h('p', { class: 'aviso-estado' }, 'Sua sessão expirou. Os dados da consulta foram removidos da tela; entre novamente para continuar.'));
      if (a.erro) corpo.append(h('p', { class: 'erro', role: 'alert' }, a.erro));
      corpo.append(
        h('p', {}, 'Entre com sua conta Google para consultar. Contas sem autorização não recebem dados.'),
        h('div', { class: 'acoes' }, ((): HTMLElement => {
          const b = h('button', { type: 'button', id: 'botao-google', class: 'botao botao--primario' }, 'Entrar com o Google');
          b.addEventListener('click', () => { b.disabled = true; b.textContent = 'Abrindo o Google…'; m.google(); });
          return b;
        })()),
      );
      // Constante de build: no build de produção o formulário inteiro sai do bundle.
      if (import.meta.env.VITE_AUTH_SENHA_LOCAL === 'true' && m.senhaLocal) {
        const email = h('input', { id: 'l-email', type: 'email', autocomplete: 'username', required: true });
        const senha = h('input', { id: 'l-senha', type: 'password', autocomplete: 'current-password', required: true });
        const f = h('form', { id: 'form-local', class: 'form-local', novalidate: true },
          h('h3', {}, 'Entrar com e-mail e senha (somente ambiente local)'),
          h('div', { class: 'campos' },
            h('div', { class: 'campo' }, h('label', { for: 'l-email' }, 'E-mail'), email),
            h('div', { class: 'campo' }, h('label', { for: 'l-senha' }, 'Senha'), senha)),
          h('div', { class: 'acoes' }, h('button', { type: 'submit', class: 'botao botao--secundario' }, 'Entrar com e-mail e senha')));
        f.addEventListener('submit', (ev) => { ev.preventDefault(); m.senha(email.value, senha.value); });
        corpo.append(f);
      }
      break;
    }
    case 'negado':
      corpo.append(h('p', { class: 'aviso-estado' }, 'Acesso negado. Esta conta entrou, mas não está autorizada a ver os dados. Nenhum dado foi carregado.'));
      break;
    case 'sem_publicacao':
      corpo.append(h('p', { class: 'aviso-estado' }, 'Não há versão de dados publicada ainda. Isso não indica ausência de detecções.'));
      break;
    case 'fonte_indisponivel':
      corpo.append(h('p', { class: 'aviso-estado' }, 'Fonte de dados indisponível no momento. Isso não indica ausência de detecções; tente novamente.'),
        ((): HTMLElement => {
          const b = h('button', { type: 'button', id: 'botao-tentar', class: 'botao botao--primario' }, 'Tentar novamente');
          b.addEventListener('click', () => m.tentarNovamente());
          return h('div', { class: 'acoes' }, b);
        })());
      break;
    case 'autorizado':
      break;
  }
}

// --- Filtros ---------------------------------------------------------------------------------------

export function renderFiltros(carga: CargaDetalhe, municipios: MunicipioItem[], janela: { inicio: string; fim: string }): void {
  const sel = $<HTMLSelectElement>('f-municipio');
  sel.replaceChildren(h('option', { value: '' }, 'Todo Mato Grosso'),
    ...municipios.map((m) => h('option', { value: String(m.codigo) }, m.nome)));
  for (const id of ['f-inicio', 'f-fim']) {
    const i = $<HTMLInputElement>(id);
    i.min = janela.inicio;
    i.max = janela.fim;
  }
  $('f-ajuda').textContent = `Dias GMT, dentro da janela da versão: ${janela.inicio} a ${janela.fim} (carga ${carga.id}).`;
}

/** Chips do topo: satélite e fontes da versão (T13). Só com acesso autorizado. */
export function renderTopo(carga: CargaDetalhe, fontes: Fonte[]): void {
  const nomes = ['IBGE'];
  if (fontes.some((f) => f.chave.startsWith('cnuc'))) nomes.push('CNUC');
  if (fontes.some((f) => f.chave.startsWith('funai'))) nomes.push('FUNAI');
  $('topo-chips').replaceChildren(
    h('li', { class: 'chip', id: 'chip-satelite' }, 'Satélite ', h('strong', {}, carga.satelite), ' · INPE'),
    h('li', { class: 'chip', id: 'chip-fontes' }, `Fontes: ${nomes.join(' · ')}`));
}

/**
 * Recorte aplicado (T16) no título da seção Consulta, no escopo da coluna de filtros e nos atalhos. Com o período
 * digitado inválido, a linha "Mostrando" diz qual recorte a tela continua mostrando.
 */
export function renderRecorte(aplicado: Janela, municipio: string | null, invalido: boolean): void {
  $('consulta-aplicada').textContent = textoRecorte(aplicado, municipio);
  $('periodo-resumo').textContent = resumoPeriodo(aplicado);
  // Antes do item 4 as lentes são estaduais: a coluna diz isso, sem atribuir ao município resultados do estado.
  $('filtros-escopo').textContent = `Uma lente por vez · todo Mato Grosso · ${textoPeriodo(aplicado)}`;
  const mostrando = $('f-mostrando');
  mostrando.hidden = !invalido;
  mostrando.textContent = invalido ? `Mostrando ${textoRecorte(aplicado, municipio)}: o período digitado ainda não foi aplicado.` : '';
}

export function mostrarErroFiltro(texto: string | null): void {
  const e = $('f-erro');
  e.hidden = texto === null;
  e.textContent = texto ?? '';
  for (const id of ['f-inicio', 'f-fim']) {
    if (texto === null) $(id).removeAttribute('aria-invalid');
    else $(id).setAttribute('aria-invalid', 'true');
  }
}

// --- Estado da consulta e resumo -------------------------------------------------------------------

export type EstadoConsulta =
  | { tipo: 'ocioso' }
  | { tipo: 'carregando' }
  | { tipo: 'zero' }
  | { tipo: 'versao_substituida' }
  | { tipo: 'fonte_indisponivel' }
  | { tipo: 'entrada_invalida' }
  | { tipo: 'inconsistente' };

const TEXTO_ESTADO: Record<Exclude<EstadoConsulta['tipo'], 'ocioso'>, string> = {
  carregando: 'Consultando…',
  zero: 'Nenhuma detecção neste recorte (total 0). Zero detecções não comprova ausência de fogo nem cobertura; veja a disponibilidade.',
  versao_substituida: 'A versão de dados consultada foi substituída por outra. Recarregue a versão vigente para continuar; os resultados antigos foram removidos.',
  fonte_indisponivel: 'Fonte de dados indisponível. Isso não indica ausência de detecções; os resultados anteriores foram removidos. Tente novamente.',
  entrada_invalida: 'A consulta foi recusada: confira o município e as datas.',
  inconsistente: 'Os resultados desta consulta não coincidem entre si (total e registros). Nada foi exibido; tente novamente.',
};

export function renderEstadoConsulta(e: EstadoConsulta, aoRecarregar: () => void, aoRepetir: () => void): void {
  const alvo = $('estado-consulta');
  limpar(alvo);
  alvo.dataset['estado'] = e.tipo;
  if (e.tipo === 'ocioso') return;
  alvo.append(h('p', { class: e.tipo === 'carregando' ? 'ajuda' : 'aviso-estado' }, TEXTO_ESTADO[e.tipo]));
  if (e.tipo === 'versao_substituida') {
    const b = h('button', { type: 'button', id: 'botao-recarregar', class: 'botao botao--primario' }, 'Carregar a versão vigente');
    b.addEventListener('click', aoRecarregar);
    alvo.append(h('div', { class: 'acoes' }, b));
  }
  // Sem botão "Consultar" (T16): a mesma consulta se repete por aqui.
  if (e.tipo === 'fonte_indisponivel' || e.tipo === 'inconsistente') {
    const b = h('button', { type: 'button', id: 'botao-repetir-consulta', class: 'botao botao--primario' }, 'Tentar novamente');
    b.addEventListener('click', aoRepetir);
    alvo.append(h('div', { class: 'acoes' }, b));
  }
}

function numeroCartao(titulo: string, id: string, valor: string, ...extras: Filho[]): HTMLElement {
  return h('div', { class: 'numero' }, h('dt', {}, titulo), h('dd', { class: 'numero__valor', id }, valor),
    ...extras.map((x) => h('dd', { class: 'etiqueta' }, x)));
}

export function renderResumo(r: Resumo, municipioNome: string | null): void {
  const corpo = $('resumo-corpo');
  limpar(corpo);
  const s = r.sensibilidade;
  const sensib: HTMLElement = s.completa && s.total !== null && s.diferenca !== null
    ? numeroCartao('Sensibilidade — America/Cuiaba', 'sens-total', fmtNumero(s.total),
      h('span', {}, 'Diferença para o total GMT: ', h('strong', { id: 'sens-diferenca' }, fmtDiferenca(s.diferenca))),
      h('span', { id: 'sens-intervalo' }, `Intervalo (${s.fuso}): ${fmtIntervaloGmt(s.intervalo.inicio, s.intervalo.fim)}`))
    : numeroCartao('Sensibilidade — America/Cuiaba', 'sens-total', 'Pendente',
      h('span', { id: 'sens-pendencia' }, 'Fonte de fronteira incompleta para este intervalo: sem valor calculado. Não é zero e não é um valor parcial.'),
      h('span', { id: 'sens-intervalo' }, `Intervalo (${s.fuso}): ${fmtIntervaloGmt(s.intervalo.inicio, s.intervalo.fim)}`));
  corpo.append(
    h('p', { id: 'resumo-escopo', class: 'ajuda' }, municipioNome ? `Município: ${municipioNome}` : 'Escopo: todo o estado de Mato Grosso'),
    h('dl', { class: 'numeros' },
      numeroCartao('Total principal — GMT', 'total-principal', fmtNumero(r.principal.total),
        h('span', { id: 'principal-intervalo' }, `Intervalo (GMT): ${fmtIntervaloGmt(r.principal.intervalo.inicio, r.principal.intervalo.fim)}`)),
      sensib),
    h('p', { class: 'ajuda' }, 'A sensibilidade é um campo separado: registros além do fim do período GMT entram só nela e não aparecem no mapa, na lista de focos, na série nem no total principal.'),
    h('p', { id: 'versao-consultada', class: 'ajuda' },
      `Versão consultada: carga nº ${r.carga.id} · ${r.carga.satelite} · janela ${fmtIntervaloGmt(r.carga.janela_gmt.inicio, r.carga.janela_gmt.fim)} · Última atualização (publicação): ${fmtDataHoraGmt(r.carga.publicada_em)}`),
  );
}

// --- Série e municípios -----------------------------------------------------------------------------

/**
 * Série do período (T9, T19): barras diárias até 31 dias GMT; mensais acima, só com os dias do período, e o mês
 * cortado com `*`. Barras como na V13 (valor, coluna e rótulo); `data-total` = soma das barras = `principal.total`.
 */
export function renderSerie(r: Resumo): void {
  const corpo = $('serie-corpo');
  limpar(corpo);
  const s = montarSerie(r.periodo.inicio, r.periodo.fim, r.principal.serie_diaria);
  const mensal = s.unidade === 'mes';
  const max = Math.max(1, ...s.barras.map((b) => b.total));
  const n = s.barras.length;
  const descricao = (b: BarraSerie): string => mensal
    ? `${rotuloBarra(b)}: ${fmtNumero(b.total)} ${b.total === 1 ? 'detecção' : 'detecções'}${b.parcial ? ' (mês parcial: só os dias do período)' : ''}`
    : `${b.chave}: ${fmtNumero(b.total)} ${b.total === 1 ? 'detecção' : 'detecções'}`;
  // Altura pelo CSSOM: a CSP (`style-src 'self'`) bloqueia o atributo `style`.
  const coluna = (px: number): HTMLElement => {
    const c = h('span', { class: 'serie__coluna', 'aria-hidden': 'true' });
    c.style.height = `${px}px`;
    return c;
  };
  // Na diária, o rótulo aparece no primeiro e no último dia e a cada 5 dias, para caber na largura.
  const comRotulo = (i: number, b: BarraSerie) => mensal || i === 0 || i === n - 1 || Number(b.chave.slice(8, 10)) % 5 === 0;
  const barras = h('div', {
    id: 'serie', class: `serie serie--${s.unidade}`, role: 'list', 'aria-label': mensal ? 'Detecções por mês GMT' : 'Detecções por dia GMT',
    'data-total': String(s.total), 'data-unidade': s.unidade, 'data-barras': String(n),
  }, ...s.barras.map((b, i) => h('div', {
    class: `serie__barra${b.parcial ? ' parcial' : ''}`, role: 'listitem', title: descricao(b), 'data-chave': b.chave, 'data-total': String(b.total),
  },
  h('span', { class: 'so-leitor' }, descricao(b)),
  mensal ? h('span', { class: 'serie__valor', 'aria-hidden': 'true' }, b.parcial && b.total === 0 ? '0 no período' : fmtNumero(b.total)) : null,
  coluna(b.total === 0 ? 0 : Math.max(2, (b.total / max) * 64)),
  h('span', { class: 'serie__rotulo', 'aria-hidden': 'true' }, comRotulo(i, b) ? `${mensal ? rotuloBarra(b).slice(0, 3) : b.chave.slice(8, 10)}${b.parcial ? '*' : ''}` : ''))));
  corpo.append(
    h('p', { class: 'serie-nota' }, mensal ? 'Detecções por mês · GMT · só os meses do período escolhido' : 'Detecções por dia · GMT · períodos de até 31 dias'),
    barras,
    h('p', { id: 'serie-legenda', class: 'nota' },
      `${fmtNumero(s.total)} detecções no período (principal, sem o envelope da sensibilidade). Maior ${mensal ? 'mês' : 'dia'}: ${fmtNumero(max === 1 && s.total === 0 ? 0 : max)}.`,
      s.temParcial ? ' * mês parcial: só os dias do período.' : ''),
    h('details', { class: 'detalhes' }, h('summary', {}, 'Ver a série como tabela'),
      tabela(mensal ? 'Detecções por mês GMT' : 'Detecções por dia GMT', [mensal ? 'Mês (GMT)' : 'Dia (GMT)', 'Detecções'],
        s.barras.map((b) => [mensal ? `${rotuloBarra(b)}${b.parcial ? ' * (mês parcial)' : ''}` : b.chave, mensal && b.parcial && b.total === 0 ? '0 no período' : fmtNumero(b.total)]),
        mensal ? 'Tabela da série mensal' : 'Tabela da série diária')),
  );
}

/** Legenda da densidade (T8): aparece só com a camada ligada; `data-total` = soma das contagens (T19). */
export function renderLegendaDensidade(visivel: boolean, total: number | null, celulas: number): void {
  const item = $('legenda-densidade');
  item.hidden = !visivel;
  if (total === null) {
    delete item.dataset['total'];
    item.dataset['celulas'] = '0';
  } else {
    item.dataset['total'] = String(total);
    item.dataset['celulas'] = String(celulas);
  }
}

// --- Disponibilidade --------------------------------------------------------------------------------

const CLASSES: ClasseDisponibilidade[] = ['lacuna_conhecida', 'incidencia_indeterminada', 'sem_evidencia_de_lacuna'];

export function renderDisponibilidade(d: Disponibilidade, nomeMunicipio: string | null): void {
  const corpo = $('disp-corpo');
  limpar(corpo);
  corpo.append(
    h('p', {}, h('strong', {}, 'Cobertura não comprovada. '), 'Nenhuma classe comprova cobertura plena nem ausência de fogo; a disponibilidade é separada da presença de detecção.'),
    h('p', { class: 'ajuda' }, nomeMunicipio === null
      ? `Visão estadual em ${d.unidade}, por classe. Não existe um status único para Mato Grosso.`
      : `Município: ${nomeMunicipio}. Unidade: ${d.unidade}.`),
    h('div', { id: 'disp-classes', class: 'blocos' },
      ...CLASSES.map((c) => h('div', { class: `bloco classe classe--${c}`, 'data-classe': c },
        h('span', { class: 'classe__simbolo', 'aria-hidden': 'true' }, ROTULO_CLASSE[c].simbolo),
        h('span', { class: 'classe__nome' }, ROTULO_CLASSE[c].rotulo),
        h('strong', { class: 'classe__valor' }, fmtNumero(d.municipio_dias_por_classe[c] ?? 0))))),
    h('div', { id: 'disp-alcance', class: 'blocos' },
      ...(['verificado', 'parcial', 'indisponivel'] as const).map((a) => h('div', { class: 'bloco', 'data-alcance': a },
        h('span', { class: 'classe__nome' }, ROTULO_ALCANCE[a]),
        h('strong', { class: 'classe__valor' }, fmtNumero(d.municipio_dias_por_alcance[a] ?? 0))))),
  );
  if (d.dias) {
    corpo.append(h('details', { class: 'detalhes', open: true }, h('summary', {}, `Dias do município (${d.dias.length})`),
      tabela('Disponibilidade por dia GMT', ['Dia (GMT)', 'Classe', 'Histórico', 'Motivos e avisos'],
        d.dias.map((x) => [
          x.dia,
          h('span', { class: `classe classe--${x.classe}`, 'data-classe': x.classe }, h('span', { 'aria-hidden': 'true' }, `${ROTULO_CLASSE[x.classe].simbolo} `), ROTULO_CLASSE[x.classe].rotulo),
          ROTULO_ALCANCE[x.alcance_historico],
          h('span', {}, [...x.motivos.map(humanizar), ...x.avisos.map((a) => `aviso: ${a}`), x.aviso_textual ?? ''].filter(Boolean).join('; ')),
        ]), 'Tabela de disponibilidade do município')));
  }
}

// --- Mapa (textos de apoio) ---------------------------------------------------------------------------

export function renderAvisoMapa(malhas: Malha[]): void {
  const e = $('mapa-aviso');
  const exib = malhas.find((m) => m.uso === 'exibicao');
  const simplificado = !!exib && exib.qualidade !== 'maxima';
  e.hidden = !simplificado;
  e.textContent = simplificado ? AVISO_SIMPLIFICACAO : '';
}

/** Pontos no mapa (T7): todos os do recorte, depois da leitura completa; nunca parcial. */
export type EstadoPontos =
  | { tipo: 'nenhum' }
  | { tipo: 'carregando'; lidos: number; total: number }
  | { tipo: 'completo'; total: number }
  | { tipo: 'erro' };

export function renderContagemMapa(e: EstadoPontos, limites: number): void {
  $('conteudo').dataset['estadoPontos'] = e.tipo;
  const lim = ` Limites municipais carregados: ${fmtNumero(limites)}.`;
  $('mapa-contagem').textContent = e.tipo === 'nenhum' ? 'Sem consulta.'
    : e.tipo === 'carregando' ? `Carregando os pontos do recorte: ${fmtNumero(e.lidos)} de ${fmtNumero(e.total)} detecções…${lim}`
      : e.tipo === 'erro' ? `Pontos indisponíveis: a leitura dos registros do recorte falhou e nenhum ponto foi desenhado pela metade.${lim}`
        : `Pontos no mapa: todas as ${fmtNumero(e.total)} detecções do recorte.${lim}`;
}

export function renderSelecao(r: RegistroLente | null, nome: string | null): void {
  $('mapa-selecao').textContent = r
    ? `Selecionado: ${fmtDataHoraGmt(r.data_hora_gmt)} · ${nome ?? r.municipio_codigo} · ${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)} · identificador ${r.id_tecnico}`
    : '';
}

export function mostrarErroMapa(texto: string | null): void {
  const e = $('mapa-erro');
  e.hidden = texto === null;
  e.textContent = texto ?? '';
}

// --- Proveniência --------------------------------------------------------------------------------------

function valorTexto(v: unknown): string {
  return typeof v === 'string' ? v : JSON.stringify(v);
}

/** Atribuição de uma fonte de áreas protegidas (T24): fonte, retrato, data de obtenção e condições de uso. */
export function textoAtribuicaoArea(f: Fonte): string {
  const nome = f.chave.startsWith('cnuc') ? 'CNUC (MMA)' : f.chave.startsWith('funai') ? 'FUNAI' : f.chave;
  return `${nome}: retrato ${f.chave}, obtido em ${fmtDataHoraGmt(f.obtida_em)}; ${f.condicoes_uso}`;
}

export function renderProveniencia(c: CargaDetalhe, fontes: Fonte[], malhas: Malha[]): void {
  const corpo = $('proveniencia-corpo');
  limpar(corpo);
  const item = (t: string, ...v: Filho[]) => [h('dt', {}, t), h('dd', {}, ...v)];
  // Atribuição das áreas protegidas (plano 006, T24): fonte, retrato, data e condições de uso.
  const areas = fontes.filter((f) => f.papel === 'areas');
  corpo.append(
    h('dl', { class: 'definicoes', id: 'versao-dados' },
      ...item('Versão (carga)', `nº ${c.id}`),
      ...item('Identidade', h('code', {}, c.identidade)),
      ...item('Satélite', c.satelite),
      ...item('Janela principal (GMT)', fmtIntervaloGmt(c.janela_inicio, c.janela_fim)),
      ...item('Envelope da sensibilidade', c.envelope_inicio && c.envelope_fim ? `${fmtIntervaloGmt(c.envelope_inicio, c.envelope_fim)}; ${fmtNumero(c.total_envelope)} registros, fora de todo total principal` : 'Sem envelope nesta versão'),
      ...item('Fuso da sensibilidade', c.fuso_sensibilidade),
      ...item('Totais declarados', `${fmtNumero(c.total_principal)} principais · ${fmtNumero(c.total_envelope)} no envelope · ${fmtNumero(c.total_municipios)} municípios · ${fmtNumero(c.total_disponibilidade)} município-dias`),
      ...item('Última atualização (publicação)', fmtDataHoraGmt(c.publicada_em)),
      ...item('Método', Object.entries(c.metodo).map(([k, v]) => `${k}: ${valorTexto(v)}`).join(' · ') || 'não informado'),
      ...(areas.length ? item('Áreas protegidas (atribuição)', h('ul', { class: 'lista-simples', id: 'proveniencia-areas' },
        ...areas.map((f) => h('li', {}, textoAtribuicaoArea(f))))) : [])),
    h('details', { class: 'detalhes' }, h('summary', {}, `Fontes (${fontes.length})`),
      tabela('Fontes da versão', ['Chave', 'Papel', 'URL', 'SHA-256', 'Bytes', 'Obtida em', 'Condições de uso'],
        fontes.map((f) => [f.chave, f.papel, f.url, h('code', {}, f.sha256), fmtBytes(f.bytes), fmtDataHoraGmt(f.obtida_em), f.condicoes_uso]), 'Tabela de fontes')),
    h('ul', { class: 'lista-simples', id: 'malhas' },
      ...malhas.map((m) => h('li', {}, `Malha de ${m.uso === 'exibicao' ? 'exibição' : 'classificação'}: ${m.qualidade} (fonte ${m.fonte_chave}${Object.keys(m.parametros).length ? `; ${valorTexto(m.parametros)}` : ''})`))),
    h('h3', {}, 'Limitações'),
    h('ul', { class: 'lista-simples' },
      h('li', {}, areas.length
        ? 'Escopo: somente AQUA_M-T, 12 meses completos, Mato Grosso. Não há outros satélites, imóveis nem ranking. Unidades de conservação e terras indígenas entram só como contexto territorial, por pedido; estar dentro de uma delas não indica infração, autoria nem situação fundiária.'
        : 'Escopo: somente AQUA_M-T, 12 meses completos, Mato Grosso. Não há outros satélites, imóveis, unidades de conservação nem ranking.'),
      h('li', {}, 'Dias, totais e séries são GMT. A sensibilidade em America/Cuiaba é separada e pode diferir do total principal.'),
      h('li', {}, 'Detecção de calor não comprova incêndio, dano, autoria ou infração. A ausência de detecção não comprova ausência de fogo.'),
      h('li', {}, 'Disponibilidade: três classes por município-dia GMT; "sem evidência de lacuna" significa cobertura não comprovada.'),
      h('li', {}, 'Os limites do mapa podem ser uma representação simplificada; o pertencimento territorial das contagens usa a malha integral.')),
  );
}

export function limparResultados(): void {
  for (const id of ['resumo-corpo', 'serie-corpo', 'disp-corpo', 'municipios-corpo', 'estado-consulta', 'lista-focos-corpo']) {
    const e = document.getElementById(id);
    if (e) limpar(e);
  }
  $('mapa-contagem').textContent = '';
  $('mapa-selecao').textContent = '';
  for (const id of ['f-municipio']) $<HTMLSelectElement>(id).replaceChildren();
  limpar($('proveniencia-corpo'));
  limpar($('topo-chips'));
  for (const id of ['consulta-aplicada', 'filtros-escopo', 'f-mostrando', 'periodo-resumo']) $(id).textContent = '';
  $('f-mostrando').hidden = true;
}
