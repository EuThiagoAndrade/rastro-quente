// Apresentação: monta o DOM a partir do estado. Todo valor vindo da fonte (nomes, ids, motivos, avisos,
// URLs) entra por textContent, nunca como marcação. Sem dados ilustrativos: sem dado, só estado vazio.
import {
  AVISO_SIMPLIFICACAO, fmtBytes, fmtDataHoraGmt, fmtDiferenca, fmtIntervaloGmt, fmtNumero, humanizar,
  ROTULO_ALCANCE, ROTULO_CLASSE, ROTULO_DIVERGENCIA,
} from './formato.ts';
import type {
  CargaDetalhe, ClasseDisponibilidade, Disponibilidade, Fonte, Malha, MunicipioItem, PaginaDeteccoes, Registro, Resumo,
} from './tipos.ts';

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

function tabela(legenda: string, cabecalho: string[], linhas: Filho[][], rotulo: string): HTMLElement {
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
  sel.replaceChildren(h('option', { value: '' }, 'Todo o estado de Mato Grosso'),
    ...municipios.map((m) => h('option', { value: String(m.codigo) }, m.nome)));
  for (const id of ['f-inicio', 'f-fim']) {
    const i = $<HTMLInputElement>(id);
    i.min = janela.inicio;
    i.max = janela.fim;
  }
  $('f-ajuda').textContent = `Datas em dias GMT. Janela da versão consultada: ${janela.inicio} a ${janela.fim} (carga ${carga.id}).`;
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

export function renderEstadoConsulta(e: EstadoConsulta, aoRecarregar: () => void): void {
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
    h('p', { class: 'ajuda' }, 'A sensibilidade é um campo separado: registros além do fim do período GMT entram só nela e não aparecem no mapa, na tabela, na série nem no total principal.'),
    h('p', { id: 'versao-consultada', class: 'ajuda' },
      `Versão consultada: carga nº ${r.carga.id} · ${r.carga.satelite} · janela ${fmtIntervaloGmt(r.carga.janela_gmt.inicio, r.carga.janela_gmt.fim)} · Última atualização (publicação): ${fmtDataHoraGmt(r.carga.publicada_em)}`),
  );
}

// --- Série e municípios -----------------------------------------------------------------------------

const SVG = 'http://www.w3.org/2000/svg';

export function renderSerie(r: Resumo): void {
  const corpo = $('serie-corpo');
  limpar(corpo);
  const dias = r.principal.serie_diaria;
  const max = Math.max(1, ...dias.map((d) => d.total));
  const maior = dias.reduce((a, d) => (d.total > a.total ? d : a), dias[0] ?? { dia: '—', total: 0 });
  const larg = 4;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${Math.max(1, dias.length) * larg} 100`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'grafico');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Barras diárias em GMT: ${fmtNumero(r.principal.total)} detecções em ${dias.length} dias; maior dia ${maior.dia} (${fmtNumero(maior.total)}).`);
  dias.forEach((d, i) => {
    const hgt = (d.total / max) * 96;
    const barra = document.createElementNS(SVG, 'rect');
    barra.setAttribute('x', String(i * larg));
    barra.setAttribute('width', String(larg - 1));
    barra.setAttribute('y', String(100 - hgt));
    barra.setAttribute('height', String(hgt));
    barra.setAttribute('class', 'grafico__barra');
    svg.append(barra);
  });
  corpo.append(
    h('p', { class: 'ajuda' }, `Detecções por dia GMT (principal, sem o envelope). Maior valor: ${fmtNumero(max)}.`),
    svg,
    h('p', { class: 'etiqueta grafico__eixo' }, h('span', {}, dias[0]?.dia ?? ''), h('span', {}, dias.at(-1)?.dia ?? '')),
    h('details', { class: 'detalhes' }, h('summary', {}, 'Ver a série como tabela'),
      tabela('Detecções por dia GMT', ['Dia (GMT)', 'Detecções'], dias.map((d) => [d.dia, fmtNumero(d.total)]), 'Tabela da série diária')),
  );
}

export function renderMunicipios(r: Resumo, catalogo: MunicipioItem[], aoEscolher: (codigo: number) => void): void {
  const corpo = $('municipios-corpo');
  limpar(corpo);
  const totais = new Map(r.principal.por_municipio.map((m) => [m.codigo, m.total]));
  const filtrado = r.municipio !== null;
  corpo.append(h('p', { class: 'ajuda' }, filtrado
    ? 'Município selecionado. Escolha "Todo o estado" nos filtros para ver os totais de todos. Lista em ordem alfabética, sem ranking.'
    : 'Lista em ordem alfabética, sem ranking ambiental. Toque no nome para consultar o município.'));
  const lista = h('ul', { class: 'municipios', id: 'lista-municipios' });
  for (const m of catalogo) {
    const total = totais.get(m.codigo);
    const b = h('button', { type: 'button', class: 'botao-nome', 'data-codigo': String(m.codigo), 'aria-pressed': String(r.municipio === m.codigo) }, m.nome);
    b.addEventListener('click', () => aoEscolher(m.codigo));
    lista.append(h('li', {}, b, h('span', { class: 'etiqueta' }, total === undefined ? 'Detecções no período (GMT): —' : `Detecções no período (GMT): ${fmtNumero(total)}`)));
  }
  corpo.append(h('details', { class: 'detalhes', open: !filtrado ? false : undefined }, h('summary', {}, `Ver os ${catalogo.length} municípios`), lista));
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

// --- Registros --------------------------------------------------------------------------------------

export interface ManipuladoresRegistros {
  pagina(deslocamento: number): void;
  tamanho(limite: number): void;
  selecionar(id: string): void;
}

export interface PainelRegistros {
  atualizar(p: PaginaDeteccoes | null, nomes: Map<number, string>, selecionado: string | null): void;
  limite(): number;
  marcarSelecao(id: string | null): void;
}

export function criarPainelRegistros(m: ManipuladoresRegistros): PainelRegistros {
  const corpo = $('registros-corpo');
  limpar(corpo);
  const tamanho = h('select', { id: 'f-tamanho' },
    ...[50, 100, 500, 1000].map((n) => h('option', { value: String(n), selected: n === 100 ? true : undefined }, String(n))));
  const info = h('p', { id: 'registros-info', class: 'ajuda', role: 'status' });
  const anterior = h('button', { type: 'button', id: 'pagina-anterior', class: 'botao botao--secundario' }, 'Página anterior');
  const proxima = h('button', { type: 'button', id: 'pagina-proxima', class: 'botao botao--secundario' }, 'Próxima página');
  const tab = h('div', { id: 'registros-tabela' });
  corpo.append(
    h('div', { class: 'campo campo--curto' }, h('label', { for: 'f-tamanho' }, 'Registros por página'), tamanho),
    info, tab,
    h('div', { class: 'acoes' }, anterior, proxima));
  let atual: PaginaDeteccoes | null = null;
  tamanho.addEventListener('change', () => m.tamanho(Number(tamanho.value)));
  anterior.addEventListener('click', () => { if (atual) m.pagina(Math.max(0, atual.deslocamento - atual.limite)); });
  proxima.addEventListener('click', () => { if (atual) m.pagina(atual.deslocamento + atual.limite); });

  function linha(r: Registro, nomes: Map<number, string>, selecionado: string | null): Filho[] {
    const b = h('button', { type: 'button', class: 'botao botao--secundario botao--compacto', 'data-id': r.id_tecnico, 'aria-pressed': String(r.id_tecnico === selecionado) },
      r.id_tecnico === selecionado ? 'Selecionada' : 'Ver no mapa');
    b.addEventListener('click', () => m.selecionar(r.id_tecnico));
    return [
      b, fmtDataHoraGmt(r.data_hora_gmt), nomes.get(r.municipio_codigo) ?? String(r.municipio_codigo),
      r.latitude.toFixed(5), r.longitude.toFixed(5), r.posicao === 'borda' ? 'Na borda' : 'Interior',
      r.divergencia_inpe ? (ROTULO_DIVERGENCIA[r.divergencia_inpe] ?? r.divergencia_inpe) : 'Sem divergência',
      r.id_fonte ?? 'sem id na fonte',
    ];
  }

  return {
    limite: () => Number(tamanho.value),
    atualizar(p, nomes, selecionado) {
      atual = p;
      limpar(tab);
      anterior.disabled = !p || p.deslocamento === 0;
      proxima.disabled = !p || p.deslocamento + p.limite >= p.total;
      if (!p) {
        info.textContent = '';
        return;
      }
      const de = p.total === 0 ? 0 : p.deslocamento + 1;
      const ate = p.deslocamento + p.registros.length;
      info.textContent = `Mostrando ${fmtNumero(de)}–${fmtNumero(ate)} de ${fmtNumero(p.total)} registros (todos os registros do período estão nas páginas; o mapa mostra esta mesma página).`;
      if (p.registros.length) {
        tab.append(tabela('Registros de detecção da página', ['Mapa', 'Data e hora (GMT)', 'Município', 'Latitude', 'Longitude', 'Posição', 'Divergência INPE', 'ID da fonte'],
          p.registros.map((r) => linha(r, nomes, selecionado)), 'Tabela de registros de detecção'));
      }
    },
    marcarSelecao(id) {
      for (const b of tab.querySelectorAll<HTMLButtonElement>('button[data-id]')) {
        const ativo = b.dataset['id'] === id;
        b.setAttribute('aria-pressed', String(ativo));
        b.textContent = ativo ? 'Selecionada' : 'Ver no mapa';
        b.closest('tr')?.classList.toggle('selecionada', ativo);
      }
    },
  };
}

// --- Mapa (textos de apoio) ---------------------------------------------------------------------------

export function renderAvisoMapa(malhas: Malha[]): void {
  const e = $('mapa-aviso');
  const exib = malhas.find((m) => m.uso === 'exibicao');
  const simplificado = !!exib && exib.qualidade !== 'maxima';
  e.hidden = !simplificado;
  e.textContent = simplificado ? AVISO_SIMPLIFICACAO : '';
}

export function renderContagemMapa(mostrados: number, total: number | null, limites: number): void {
  $('mapa-contagem').textContent = total === null
    ? 'Sem consulta.'
    : `Pontos no mapa: ${fmtNumero(mostrados)} de ${fmtNumero(total)} detecções do período${mostrados < total ? ' (visualização parcial: use a paginação ou um recorte menor)' : ''}. Limites municipais carregados: ${fmtNumero(limites)}.`;
}

export function renderSelecao(r: Registro | null, nome: string | null): void {
  $('mapa-selecao').textContent = r
    ? `Selecionada: ${r.id_fonte ?? 'sem id na fonte'} · ${fmtDataHoraGmt(r.data_hora_gmt)} · ${nome ?? r.municipio_codigo} · ${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`
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

export function renderProveniencia(c: CargaDetalhe, fontes: Fonte[], malhas: Malha[]): void {
  const corpo = $('proveniencia-corpo');
  limpar(corpo);
  const item = (t: string, ...v: Filho[]) => [h('dt', {}, t), h('dd', {}, ...v)];
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
      ...item('Método', Object.entries(c.metodo).map(([k, v]) => `${k}: ${valorTexto(v)}`).join(' · ') || 'não informado')),
    h('details', { class: 'detalhes' }, h('summary', {}, `Fontes (${fontes.length})`),
      tabela('Fontes da versão', ['Chave', 'Papel', 'URL', 'SHA-256', 'Bytes', 'Obtida em', 'Condições de uso'],
        fontes.map((f) => [f.chave, f.papel, f.url, h('code', {}, f.sha256), fmtBytes(f.bytes), fmtDataHoraGmt(f.obtida_em), f.condicoes_uso]), 'Tabela de fontes')),
    h('ul', { class: 'lista-simples', id: 'malhas' },
      ...malhas.map((m) => h('li', {}, `Malha de ${m.uso === 'exibicao' ? 'exibição' : 'classificação'}: ${m.qualidade} (fonte ${m.fonte_chave}${Object.keys(m.parametros).length ? `; ${valorTexto(m.parametros)}` : ''})`))),
    h('h3', {}, 'Limitações'),
    h('ul', { class: 'lista-simples' },
      h('li', {}, 'Escopo: somente AQUA_M-T, 12 meses completos, Mato Grosso. Não há outros satélites, imóveis, unidades de conservação nem ranking.'),
      h('li', {}, 'Dias, totais e séries são GMT. A sensibilidade em America/Cuiaba é separada e pode diferir do total principal.'),
      h('li', {}, 'Detecção de calor não comprova incêndio, dano, autoria ou infração. A ausência de detecção não comprova ausência de fogo.'),
      h('li', {}, 'Disponibilidade: três classes por município-dia GMT; "sem evidência de lacuna" significa cobertura não comprovada.'),
      h('li', {}, 'Os limites do mapa podem ser uma representação simplificada; o pertencimento territorial das contagens usa a malha integral.')),
  );
}

export function limparResultados(): void {
  for (const id of ['resumo-corpo', 'serie-corpo', 'disp-corpo', 'municipios-corpo', 'estado-consulta', 'registros-tabela']) {
    const e = document.getElementById(id);
    if (e) limpar(e);
  }
  $('registros-info').textContent = '';
  $('mapa-contagem').textContent = '';
  $('mapa-selecao').textContent = '';
  for (const id of ['f-municipio']) $<HTMLSelectElement>(id).replaceChildren();
  limpar($('proveniencia-corpo'));
}
