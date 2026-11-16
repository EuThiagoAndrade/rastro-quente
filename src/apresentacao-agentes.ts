// Painel de perguntas (plano 008, item 4; DESIGN.md): perguntas prontas e texto livre ligados ao contexto da tela,
// etapas reais da execução (só eventos recebidos do servidor, sem animação nem raciocínio do modelo), resposta com as
// afirmações conferidas, notas fixas, aviso "Gerado por IA" e as evidências por identificador. Todo texto vindo do
// servidor ou do modelo entra por textContent: nenhum HTML nem link livre é renderizado.
import { $, h } from './apresentacao.ts';
import type { Analise, Desfecho, Escolha, EstadoExecucao, Evento, EvidenciaRecebida, Execucao, Ferramenta, Pergunta, Resposta, Subagente } from './agentes.ts';
import { fmtNumero } from './formato.ts';

export type EstadoPerguntas =
  | { tipo: 'ociosa' }
  | { tipo: 'executando'; pergunta: string; etapas: Evento[] }
  | { tipo: 'resposta'; pergunta: string; etapas: Evento[]; resposta: Resposta }
  | { tipo: 'falha'; pergunta: string; etapas: Evento[]; desfecho: Extract<Desfecho, { tipo: 'falha' }> }
  | { tipo: 'formato'; pergunta: string; etapas: Evento[] }
  | { tipo: 'rede'; pergunta: string; etapas: Evento[] }
  | { tipo: 'cancelada'; pergunta: string; etapas: Evento[] }
  | { tipo: 'descartada' };

export interface ManipuladoresPerguntas {
  tentarDeNovo(): void;
  /** Leva ao detalhamento determinístico que sustenta a evidência (aba Destaques ou Comparação). */
  abrirDetalhamento(ferramenta: Ferramenta): void;
}

const PAPEL: Record<Subagente | 'principal', string> = {
  principal: 'agente principal', lentes: 'subagente de lentes e evidências', disponibilidade: 'subagente de disponibilidade',
};

export const NOME_FERRAMENTA: Record<Ferramenta, string> = {
  explicar_selecao: 'destaques da lente', comparar_periodos: 'comparação de períodos', comparar_municipios: 'comparação de municípios',
  consultar_disponibilidade: 'disponibilidade por município', ler_detalhes: 'detalhes das detecções',
};

const ESTADO: Record<EstadoExecucao, string> = {
  completa: 'Resposta completa', parcial: 'Resposta parcial', incompleta: 'Resposta incompleta: nem todas as análises necessárias foram conferidas',
  fora_do_alcance: 'Pergunta fora do alcance',
};

/** Texto de cada etapa real; só o que o servidor informou. */
export function textoEtapa(e: Evento): string {
  switch (e.tipo) {
    case 'acesso_validado': return 'Acesso e versão dos dados validados';
    case 'agente_iniciado': return 'Agente principal iniciado';
    case 'chamada_modelo': return `Chamada ${e.ordem} ao modelo (${PAPEL[e.papel]})`;
    case 'delegacao': return `Principal delegou ao ${PAPEL[e.papel]}`;
    case 'delegacao_recusada': return `Delegação ao ${PAPEL[e.papel]} recusada: não se aplica a este recorte`;
    case 'subagente_iniciado': return `${PAPEL[e.papel][0]!.toUpperCase()}${PAPEL[e.papel].slice(1)} iniciado`;
    case 'ferramenta_concluida': return `Ferramenta executada: ${NOME_FERRAMENTA[e.ferramenta]} (evidência ${e.evidencia})`;
    case 'ferramenta_recusada': return `Ferramenta recusada ao ${PAPEL[e.papel]}`;
    case 'subagente_concluido': return e.estado === 'concluido' ? `Análise do ${PAPEL[e.papel]} conferida` : `Análise do ${PAPEL[e.papel]} falhou`;
    case 'sintese_iniciada': return 'Síntese do agente principal iniciada';
    case 'concluido': return `Execução concluída: ${ESTADO[e.estado].toLowerCase()}`;
    case 'erro': return `Execução interrompida (${e.codigo})`;
  }
}

const IDS_PRONTAS: Record<Exclude<Pergunta, 'livre'>, string> = { destaque: 'pergunta-destaque', periodos: 'pergunta-periodos', lacunas: 'pergunta-lacunas' };

/** Habilita cada pergunta só com contexto suficiente e diz o porquê ao lado; durante a execução, nada novo começa. */
export function renderDisponibilidade(escolhas: Record<Pergunta, Escolha>, comparar: string | null, ocupado: boolean): void {
  for (const [p, id] of Object.entries(IDS_PRONTAS) as [Exclude<Pergunta, 'livre'>, string][]) {
    const e = escolhas[p];
    const motivo = 'indisponivel' in e ? e.indisponivel : null;
    $<HTMLButtonElement>(id).disabled = ocupado || motivo !== null;
    const nota = $(`${id}-motivo`);
    nota.textContent = motivo ?? '';
    nota.hidden = motivo === null;
  }
  $<HTMLButtonElement>('acao-comparar-municipios').disabled = ocupado || comparar !== null;
  const notaComparar = $('acao-comparar-municipios-motivo');
  notaComparar.textContent = comparar ?? '';
  notaComparar.hidden = comparar === null;
  const livre = escolhas.livre;
  $<HTMLButtonElement>('botao-perguntar').disabled = ocupado || 'indisponivel' in livre;
  $('pergunta-contexto').textContent = 'indisponivel' in livre ? livre.indisponivel : `A pergunta escrita usa ${livre.descricao}, como estão na tela.`;
  $('botao-cancelar-pergunta').hidden = !ocupado;
}

function lista(itens: string[], rotulo: string, classe = 'lista-simples'): HTMLElement | null {
  if (!itens.length) return null;
  return h('div', {}, h('p', { class: 'rotulo-secao' }, rotulo), h('ul', { class: classe }, ...itens.map((t) => h('li', {}, t))));
}

function afirmacoes(af: Resposta['afirmacoes'], evidencias: Map<string, EvidenciaRecebida>): HTMLElement {
  return h('ul', { class: 'afirmacoes' }, ...af.map((a) => h('li', {},
    h('span', {}, a.texto),
    h('span', { class: 'referencias' }, `Evidências: ${a.referencias.map((r) => {
      const id = /^E\d+/.exec(r)?.[0];
      const e = id ? evidencias.get(id) : undefined;
      return e ? `${r} (${NOME_FERRAMENTA[e.ferramenta]})` : r;
    }).join('; ')}`))));
}

function blocoAnalises(analises: Analise[], evidencias: Map<string, EvidenciaRecebida>): HTMLElement | null {
  if (!analises.length) return null;
  return h('details', { class: 'perguntas__bloco' },
    h('summary', {}, 'Análises dos subagentes'),
    ...analises.map((a) => h('div', { class: 'analise' },
      h('p', {}, h('strong', {}, `${PAPEL[a.papel][0]!.toUpperCase()}${PAPEL[a.papel].slice(1)}: `),
        a.estado === 'concluida' ? 'análise conferida' : `falhou${a.motivo ? ` (${a.motivo})` : ''}`,
        a.rejeitadas ? ` · ${fmtNumero(a.rejeitadas)} afirmação(ões) rejeitada(s) na conferência` : ''),
      a.afirmacoes.length ? afirmacoes(a.afirmacoes, evidencias) : null,
      lista(a.limites, 'Limites da análise'))));
}

function blocoEvidencias(evidencias: Map<string, EvidenciaRecebida>, m: ManipuladoresPerguntas): HTMLElement | null {
  if (!evidencias.size) return null;
  return h('details', { class: 'perguntas__bloco', id: 'perguntas-evidencias' },
    h('summary', {}, `Evidências das ferramentas (${evidencias.size})`),
    h('p', { class: 'nota' }, 'Resultados das ferramentas determinísticas, calculados no servidor com os mesmos módulos desta tela. O detalhamento completo continua nas abas.'),
    ...[...evidencias].map(([id, e]) => {
      const abrir = h('button', { type: 'button', class: 'botao botao--secundario botao--compacto' }, 'Ver o detalhamento na tela');
      abrir.addEventListener('click', () => m.abrirDetalhamento(e.ferramenta));
      return h('details', { class: 'evidencia', 'data-evidencia': id },
        h('summary', {}, `${id} · ${NOME_FERRAMENTA[e.ferramenta]} · ${PAPEL[e.papel]}`),
        e.ferramenta === 'ler_detalhes' ? null : abrir,
        h('pre', { class: 'evidencia__dados', tabindex: '0', 'aria-label': `Dados da evidência ${id}` }, JSON.stringify(e.dados, null, 2)));
    }));
}

function blocoExecucao(x: Execucao | null): HTMLElement | null {
  if (!x) return null;
  const ms = x.chamadas.reduce((t, c) => t + c.ms, 0);
  const repeticoes = x.chamadas.reduce((t, c) => t + c.repeticoes, 0);
  return h('details', { class: 'perguntas__bloco' },
    h('summary', {}, 'Execução'),
    h('ul', { class: 'lista-simples' },
      h('li', {}, `Modelo: ${x.modelo}`),
      h('li', {}, `Chamadas ao modelo: ${fmtNumero(x.total_chamadas)} (${x.chamadas.map((c) => PAPEL[c.papel]).join(', ')})${repeticoes ? `; ${fmtNumero(repeticoes)} repetição(ões) após sobrecarga do provedor` : ''}`),
      h('li', {}, `Tempo nas chamadas: ${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`),
      h('li', {}, x.uso.verificado
        ? `Uso informado pelo provedor: ${fmtNumero(x.uso.entrada)} tokens de entrada, ${fmtNumero(x.uso.saida)} de saída, ${fmtNumero(x.uso.raciocinio)} de raciocínio`
        : 'Uso de tokens não verificado: o provedor não informou o uso de todas as chamadas.')));
}

function etapas(lista: Evento[]): HTMLElement {
  return h('ol', { class: 'etapas', id: 'perguntas-etapas', 'aria-label': 'Etapas da execução' }, ...lista.map((e) => h('li', { 'data-etapa': e.tipo }, textoEtapa(e))));
}

const tentar = (m: ManipuladoresPerguntas, nota: string): HTMLElement => {
  const b = h('button', { type: 'button', class: 'botao', id: 'pergunta-tentar' }, 'Tentar de novo');
  b.addEventListener('click', () => m.tentarDeNovo());
  return h('div', { class: 'acoes' }, b, h('p', { class: 'nota' }, nota));
};

/** Filhos presentes (os blocos opcionais podem faltar). */
const presentes = (...x: (Node | string | null)[]): (Node | string)[] => x.filter((y): y is Node | string => y !== null);

const NOTA_COTA = 'Uma nova tentativa faz novas chamadas ao modelo e consome nova cota do provedor.';

/** Estado do painel: `data-estado-perguntas` em `#painel-perguntas` e o conteúdo da execução e da resposta. */
export function renderPerguntas(e: EstadoPerguntas, m: ManipuladoresPerguntas): void {
  const painel = $('painel-perguntas');
  painel.dataset['estadoPerguntas'] = e.tipo === 'falha' && e.desfecho.codigo === 'ia_desabilitada' ? 'desligada' : e.tipo;
  const estado = $('perguntas-estado');
  const corpo = $('perguntas-corpo');
  painel.setAttribute('aria-busy', String(e.tipo === 'executando'));
  if (e.tipo === 'ociosa') { estado.textContent = ''; corpo.replaceChildren(); return; }
  if (e.tipo === 'descartada') {
    estado.textContent = 'A seleção mudou: a pergunta anterior foi cancelada e a resposta saiu da tela.';
    corpo.replaceChildren();
    return;
  }
  const titulo = h('p', { class: 'perguntas__pergunta' }, h('strong', {}, 'Pergunta: '), e.pergunta);
  switch (e.tipo) {
    case 'executando': {
      const ultima = e.etapas.at(-1);
      estado.textContent = ultima ? `Executando: ${textoEtapa(ultima)}.` : 'Enviando a pergunta…';
      corpo.replaceChildren(titulo, etapas(e.etapas));
      return;
    }
    case 'cancelada':
      estado.textContent = 'Pergunta cancelada; nada da resposta foi exibido.';
      corpo.replaceChildren(titulo, etapas(e.etapas));
      return;
    case 'formato':
      estado.textContent = 'A resposta do serviço veio fora do formato; nada dela foi exibido.';
      corpo.replaceChildren(titulo, etapas(e.etapas), tentar(m, NOTA_COTA));
      return;
    case 'rede':
      estado.textContent = 'O serviço de explicação não respondeu. A consulta, as lentes e a comparação continuam disponíveis.';
      corpo.replaceChildren(titulo, etapas(e.etapas), tentar(m, NOTA_COTA));
      return;
    case 'falha': {
      const d = e.desfecho;
      const desligada = d.codigo === 'ia_desabilitada';
      estado.textContent = desligada ? 'Explicação por IA desligada neste ambiente.' : 'A pergunta não foi respondida.';
      corpo.replaceChildren(...presentes(
        titulo,
        h('p', { class: 'aviso-estado', 'data-codigo': d.codigo }, d.texto),
        e.etapas.length ? etapas(e.etapas) : null,
        d.analises.length || d.evidencias.size ? h('p', { class: 'nota' }, 'O que já foi conferido antes da falha continua abaixo; não houve síntese.') : null,
        blocoAnalises(d.analises, d.evidencias),
        blocoEvidencias(d.evidencias, m),
        blocoExecucao(d.execucao),
        desligada ? null : tentar(m, NOTA_COTA),
      ));
      return;
    }
    case 'resposta': {
      const r = e.resposta;
      estado.textContent = `${ESTADO[r.estado]}.`;
      corpo.replaceChildren(...presentes(
        titulo,
        etapas(e.etapas),
        h('div', { class: 'resposta-ia', 'data-estado-resposta': r.estado },
          h('p', { class: 'resposta-ia__estado' }, ESTADO[r.estado]),
          r.geradoPorIa ? h('p', { class: 'marca-ia' }, h('span', { class: 'marca-ia__etiqueta' }, 'Gerado por IA'), ' ', r.aviso) : null,
          r.notas.length ? h('div', { class: 'aviso-estado notas-ia' }, ...r.notas.map((n) => h('p', {}, n))) : null,
          r.afirmacoes.length ? afirmacoes(r.afirmacoes, r.evidencias) : null,
          lista(r.limites, 'Limites da resposta')),
        blocoAnalises(r.analises, r.evidencias),
        blocoEvidencias(r.evidencias, m),
        blocoExecucao(r.execucao),
        r.estado === 'completa' || r.estado === 'fora_do_alcance' ? null : tentar(m, NOTA_COTA),
      ));
    }
  }
}
