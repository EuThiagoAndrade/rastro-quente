// Apresentação do "Pergunte ao mapa" e da barra do mapa vivo (ciclo 012, issue #113): "Entendi assim" com o botão ✎
// de cada item, avisos de recusa e limite, e o rótulo e as marcas de cobertura da reprodução. Só DOM, por textContent.
import { $, h } from './apresentacao.ts';
import { fmtNumero } from './formato.ts';
import type { ClasseArea } from './lentes/carregar-areas.ts';
import { AVISO_TIPO, type Interpretacao, type TipoInterpretacao } from './pergunte.ts';
import { resumoPeriodo, type Janela } from './recorte.ts';
import { diaCurto, LIMITE_FLUIDEZ, type Reproducao } from './replay.ts';
import type { ClasseDisponibilidade } from './tipos.ts';

/** Controle existente que o ✎ abre e foca. */
export type Alvo = 'periodo' | 'municipio' | 'lente' | 'classe' | 'animar' | 'comparar';

export interface ItemEntendi {
  rotulo: string;
  valor: string;
  alvo: Alvo;
}

const NOME_LENTE: Record<string, string> = {
  nenhuma: 'Nenhuma', concentracao: 'Concentração', recorrencia: 'Recorrência', persistencia: 'Persistência',
  sobreposicao: 'Sobreposição com áreas protegidas', combinacao: 'Combinação de lentes',
};
const NOME_CLASSE: Record<ClasseArea, string> = {
  protecao_integral: 'Proteção integral', uso_sustentavel: 'Uso sustentável', terra_indigena: 'Terra indígena',
};

/** Itens do "Entendi assim": o que foi aplicado em cada controle (o período ausente mantém o aplicado). */
export function itensEntendi(i: Interpretacao, aplicado: Janela, nome: (codigo: number | null) => string): ItemEntendi[] {
  const itens: ItemEntendi[] = [
    { rotulo: 'Período', valor: i.periodo ? resumoPeriodo(i.periodo) : `mantido: ${resumoPeriodo(aplicado)}`, alvo: 'periodo' },
    { rotulo: 'Município', valor: nome(i.municipio), alvo: 'municipio' },
    {
      rotulo: 'Lente', alvo: 'lente',
      valor: i.combinacao
        ? `Combinação: ${i.combinacao.lentes.map((l) => NOME_LENTE[l]).join(i.combinacao.operador === 'e' ? ' e ' : ' ou ')} (${i.combinacao.operador === 'e' ? 'e: destacada por todas' : 'ou: destacada por pelo menos uma'})`
        : NOME_LENTE[i.lente] ?? i.lente,
    },
  ];
  if (i.classe) itens.push({ rotulo: 'Classe de área', valor: NOME_CLASSE[i.classe], alvo: 'classe' });
  itens.push({ rotulo: 'Modo', valor: i.animar ? 'Animação dia a dia' : 'Mapa estático', alvo: 'animar' });
  if (i.comparar) {
    itens.push({
      rotulo: 'Comparação', alvo: 'comparar',
      valor: i.comparar.modo === 'periodos' ? `com ${resumoPeriodo(i.comparar.b)}` : `com ${nome(i.comparar.municipio_b)}`,
    });
  }
  return itens;
}

export interface ManipuladoresEntendi {
  editar(alvo: Alvo): void;
  ficha(): void;
  mostrarDeteccoes(): void;
}

export function limparPergunte(): void {
  for (const id of ['p-entendi', 'p-aviso']) {
    const e = $(id);
    e.replaceChildren();
    e.hidden = true;
  }
}

/** "Entendi assim": itens com ✎, a origem (IA ou regras locais), o que foi descartado e a ficha. */
export function renderEntendi(itens: ItemEntendi[], origem: 'ia' | 'local', notaOrigem: string | null, descartados: string[], m: ManipuladoresEntendi): void {
  const caixa = $('p-entendi');
  caixa.hidden = false;
  caixa.dataset['origem'] = origem;
  const filhos: (HTMLElement | null)[] = [
    h('div', { class: 'entendi__cabeca' },
      h('h3', { id: 't-entendi', class: 'rotulo-secao', tabindex: '-1' }, 'Entendi assim'),
      h('span', { class: 'entendi__origem', 'data-origem': origem }, origem === 'ia' ? 'Interpretado por IA' : 'Interpretado sem IA')),
    notaOrigem ? h('p', { class: 'nota' }, notaOrigem) : null,
    h('ul', { class: 'entendi__itens' }, ...itens.map((x) => {
      const editar = h('button', { type: 'button', class: 'entendi__editar', 'aria-label': `Editar ${x.rotulo.toLowerCase()}`, title: `Editar ${x.rotulo.toLowerCase()}`, 'data-alvo': x.alvo }, '✎');
      editar.addEventListener('click', () => m.editar(x.alvo));
      return h('li', { 'data-item': x.alvo }, h('span', { class: 'entendi__rotulo' }, x.rotulo), h('span', { class: 'entendi__valor' }, x.valor), editar);
    })),
    descartados.length ? h('p', { class: 'nota entendi__descartados' }, `Não aplicado: ${descartados.join('; ')}.`) : null,
    h('p', { class: 'nota' }, 'Os números vêm do mesmo motor das lentes; a interpretação só preenche os filtros.'),
  ];
  caixa.replaceChildren(...filhos.filter((x): x is HTMLElement => x !== null));
  const ficha = h('button', { id: 'botao-ficha-pergunta', type: 'button', class: 'botao botao--secundario entendi__ficha' }, 'Gerar ficha para averiguação');
  ficha.addEventListener('click', () => m.ficha());
  caixa.append(ficha);
}

/** Aviso de recusa, dado ausente, janela ou "não entendi"; a autoria oferece mostrar as detecções. */
export function renderAvisoPergunta(tipo: Exclude<TipoInterpretacao, 'consulta'>, janela: Janela, origem: 'ia' | 'local', m: ManipuladoresEntendi): void {
  const caixa = $('p-aviso');
  caixa.hidden = false;
  caixa.dataset['tipo'] = tipo;
  const texto = tipo === 'fora_da_janela' ? `${AVISO_TIPO[tipo]}: a janela disponível vai de ${resumoPeriodo(janela)}.` : AVISO_TIPO[tipo];
  caixa.replaceChildren(h('p', { class: 'aviso-estado', role: 'alert' }, texto),
    h('p', { class: 'nota' }, origem === 'ia' ? 'Interpretado por IA.' : 'Interpretado sem IA.'));
  if (tipo === 'recusa_autoria') {
    const b = h('button', { type: 'button', class: 'botao botao--secundario botao--compacto' }, 'Mostrar as detecções');
    b.addEventListener('click', () => m.mostrarDeteccoes());
    caixa.append(b);
  }
}

export function estadoPergunte(texto: string, ocupado: boolean): void {
  $('p-estado').textContent = texto;
  $<HTMLButtonElement>('p-enviar').disabled = ocupado;
  $('secao-pergunte').setAttribute('aria-busy', String(ocupado));
}

// --- Barra do mapa vivo ----------------------------------------------------------------------------------------------

const ROTULO_SEM_COBERTURA: Record<Exclude<ClasseDisponibilidade, 'sem_evidencia_de_lacuna'>, string> = {
  lacuna_conhecida: 'lacuna conhecida',
  incidencia_indeterminada: 'incidência indeterminada',
};

/** Marcas dos dias de cobertura não comprovada sobre o controle deslizante (posição pelo CSSOM, permitido pela CSP). */
export function renderMarcas(rep: Reproducao, sem: ReadonlyMap<string, unknown>, temMunicipio: boolean): void {
  const marcas = $('rep-marcas');
  marcas.replaceChildren();
  const n = rep.dias.length;
  rep.dias.forEach((d, i) => {
    if (!sem.has(d)) return;
    const m = h('span', { class: 'reproducao__marca', title: `${diaCurto(d)}: cobertura não comprovada` });
    m.style.left = `${n <= 1 ? 50 : (i / (n - 1)) * 100}%`;
    marcas.append(m);
  });
  const nota = $('rep-nota');
  const textos: string[] = [];
  if (!temMunicipio) textos.push('Escolha um município para marcar os dias de cobertura não comprovada.');
  else if (sem.size) textos.push(`▲ ${fmtNumero(sem.size)} ${sem.size === 1 ? 'dia' : 'dias'} de cobertura não comprovada no período.`);
  if (rep.total > LIMITE_FLUIDEZ) textos.push(`Recorte grande (${fmtNumero(rep.total)} detecções): a reprodução pode ficar lenta; restrinja o período ou o município.`);
  nota.textContent = textos.join(' ');
  nota.hidden = !textos.length;
}

export function renderQuadro(rep: Reproducao, i: number, sem: ReadonlyMap<string, Exclude<ClasseDisponibilidade, 'sem_evidencia_de_lacuna'>>): void {
  const q = rep.quadros[i];
  if (!q) return;
  const texto = `${diaCurto(q.dia)} · ${fmtNumero(q.doDia)} no dia · ${fmtNumero(q.acumuladas)} acumuladas`;
  $('rep-rotulo').textContent = texto;
  const faixa = $<HTMLInputElement>('rep-dia');
  faixa.value = String(i);
  faixa.setAttribute('aria-valuetext', texto);
  const classe = sem.get(q.dia);
  const aviso = $('rep-aviso');
  aviso.textContent = classe ? `Cobertura não comprovada neste dia (${ROTULO_SEM_COBERTURA[classe]}): ausência de detecção não indica ausência de calor.` : '';
  aviso.hidden = !classe;
  $('reproducao').dataset['dia'] = q.dia;
  $('reproducao').dataset['acumuladas'] = String(q.acumuladas);
}

export function renderTocando(tocando: boolean): void {
  const b = $('rep-tocar');
  b.textContent = tocando ? '❚❚ Pausar' : '▶ Tocar';
  b.setAttribute('aria-label', tocando ? 'Pausar' : 'Tocar');
  $('reproducao').dataset['tocando'] = String(tocando);
}

export function renderVelocidade(v: number): void {
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-vel]')) b.setAttribute('aria-pressed', String(Number(b.dataset['vel']) === v));
}

/** Marca na série (só na diária) o dia exibido; `null` limpa. */
export function marcarSerie(dia: string | null): void {
  for (const b of document.querySelectorAll('.serie__barra--atual')) b.classList.remove('serie__barra--atual');
  if (dia) document.querySelector(`#serie .serie__barra[data-chave="${dia}"]`)?.classList.add('serie__barra--atual');
}
