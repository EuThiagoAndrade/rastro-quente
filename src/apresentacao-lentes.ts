// Apresentação das lentes de seleção (plano 004): estado, metadados, parâmetros, lista de destaques,
// painel de motivo e evidência, e limitações. Todo valor entra por textContent. Nunca "coberto".
import { $, h } from './apresentacao.ts';
import { textoCobertura } from './lentes/cobertura.ts';
import type { Destaque, ResultadoLente } from './lentes/contrato.ts';
import { fmtNumero, humanizar, ROTULO_CLASSE } from './formato.ts';

export type EstadoLente =
  | { tipo: 'nenhuma' }
  | { tipo: 'carregando'; etapa: 'registros' | 'disponibilidade'; feitos: number; total: number }
  | { tipo: 'completo'; segundos: number }
  | { tipo: 'sem_destaques'; segundos: number }
  | { tipo: 'cobertura_nao_verificada' }
  | { tipo: 'contorno_indisponivel' }
  | { tipo: 'leitura_inconsistente'; motivo: string }
  | { tipo: 'falha' }
  | { tipo: 'cancelada'; motivo: string };

export interface ManipuladoresLente {
  tentarDeNovo(): void;
  selecionar(id: string): void;
  consultarMunicipio(codigo: number): void;
}

const segundos = (s: number): string => s.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function textoEstado(e: EstadoLente): string {
  switch (e.tipo) {
    case 'nenhuma': return 'Nenhuma lente aplicada.';
    case 'carregando': return e.etapa === 'registros'
      ? `Carregando: registros ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)}…`
      : `Carregando: disponibilidade ${fmtNumero(e.feitos)} de ${fmtNumero(e.total)} municípios…`;
    case 'completo': return `Lente concluída em ${segundos(e.segundos)} s.`;
    case 'sem_destaques': return `Lente concluída em ${segundos(e.segundos)} s, sem destaques nesta janela.`;
    case 'cobertura_nao_verificada': return 'Lente aplicada, mas a cobertura de alguns destaques não foi verificada (falha na leitura da disponibilidade). Os destaques não dependem da disponibilidade; tente de novo para qualificá-los.';
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

function rotuloDestaque(d: Destaque): string {
  const valor = `${fmtNumero(d.evidencia.valor)} detecções`;
  const unidade = d.unidade.tipo === 'municipio' ? d.unidade.nome : `Célula ${d.unidade.sul} a ${d.unidade.norte} · ${d.unidade.oeste} a ${d.unidade.leste}`;
  return d.ordem ? `${d.ordem}. ${unidade} — ${valor}` : `${unidade} — ${valor}`;
}

function painel(d: Destaque, m: ManipuladoresLente): HTMLElement {
  const c = d.cobertura;
  const corpo = h('div', { id: 'lente-painel', class: 'painel-lente', 'data-destaque': d.id_destaque },
    h('h3', { tabindex: '-1', id: 'lente-painel-titulo' }, d.unidade.tipo === 'municipio' ? d.unidade.nome : rotuloDestaque(d)),
    h('p', { id: 'lente-motivo' }, h('strong', {}, 'Motivo: '), d.motivo),
    h('p', { id: 'lente-evidencia' }, h('strong', {}, 'Evidência: '), `${fmtNumero(d.evidencia.deteccoes.length)} detecções (registros principais da janela)${d.evidencia.datas.length ? `; datas: ${d.evidencia.datas.join(', ')}` : ''}.`),
    h('p', { id: 'lente-cobertura', 'data-cobertura': c.estado }, h('strong', {}, 'Disponibilidade: '), textoCobertura(c)),
  );
  if (c.estado === 'completa' && c.demais_dias.length) {
    corpo.append(h('details', { class: 'detalhes' }, h('summary', {}, `Dias que contam contra (${c.demais_dias.length})`),
      h('ul', { class: 'lista-simples', id: 'lente-dias' }, ...c.demais_dias.map((dia) => h('li', { 'data-classe': dia.classe },
        `${dia.dia}: ${ROTULO_CLASSE[dia.classe].rotulo}`,
        h('ul', {}, ...dia.municipios.map((x) => h('li', {}, `município ${x.codigo}: ${ROTULO_CLASSE[x.classe].rotulo}${x.motivos.length ? ` (${x.motivos.map(humanizar).join('; ')})` : ''}`))))))));
  }
  if (d.ressalvas.length) corpo.append(h('ul', { class: 'lista-simples', id: 'lente-ressalvas' }, ...d.ressalvas.map((r) => h('li', {}, r))));
  if (d.unidade.tipo === 'municipio') {
    const codigo = d.unidade.codigo;
    const b = h('button', { type: 'button', id: 'botao-lente-consultar', class: 'botao botao--secundario' }, 'Consultar este município');
    b.addEventListener('click', () => m.consultarMunicipio(codigo));
    corpo.append(h('div', { class: 'acoes' }, b));
  }
  return corpo;
}

export function renderResultadoLente(r: ResultadoLente, selecionado: string | null, m: ManipuladoresLente): void {
  const corpo = $('lente-corpo');
  corpo.replaceChildren();
  corpo.append(
    h('p', { id: 'lente-escopo', class: 'ajuda' },
      `Janela: ${r.janela.inicio} a ${r.janela.fim} (${r.janela.referencia}) · carga nº ${r.carga.id} · recorte: todo o estado de Mato Grosso (o filtro de município não se aplica às lentes) · método ${r.versao_metodo}.`),
    h('dl', { class: 'definicoes', id: 'lente-parametros' }, ...r.parametros.flatMap((p) => [h('dt', {}, p.nome), h('dd', {}, p.valor)])),
  );
  if (r.ordenacao) corpo.append(h('p', { id: 'lente-ordenacao', class: 'etiqueta' }, `Lista ${r.ordenacao.rotulo}.`));
  for (const o of r.observacoes) corpo.append(h('p', { class: 'ajuda lente-observacao' }, o));
  if (r.destaques.length) {
    const lista = h('ol', { class: 'destaques', id: 'lente-destaques' });
    for (const d of r.destaques) {
      const b = h('button', { type: 'button', class: 'botao-nome', 'data-id': d.id_destaque, 'aria-pressed': String(d.id_destaque === selecionado) }, rotuloDestaque(d));
      b.addEventListener('click', () => m.selecionar(d.id_destaque));
      lista.append(h('li', {}, b, h('span', { class: 'etiqueta', 'data-cobertura': d.cobertura.estado }, textoCobertura(d.cobertura))));
    }
    corpo.append(lista);
    const escolhido = r.destaques.find((d) => d.id_destaque === selecionado);
    if (escolhido) corpo.append(painel(escolhido, m));
  }
  corpo.append(h('h3', {}, 'Limitações da lente'), h('ul', { class: 'lista-simples', id: 'lente-limitacoes' }, ...r.limitacoes.map((l) => h('li', {}, l))));
}
