// Painel de perguntas (plano 008, item 4; T5 e T7): do contexto da tela ao pedido de `/api/explicar`, e a leitura do
// fluxo de eventos da execução real, por `fetch` na própria origem com o JWT só no cabeçalho `Authorization`. Cada
// mensagem do fluxo é validada antes de chegar à tela; mensagem fora do formato encerra a leitura sem exibir nada dela.
// Nada é gravado no navegador. A pergunta usa só o recorte e a lente aplicados na tela; não muda os filtros.
import type { Janela, TipoLente } from './lentes/contrato.ts';
import type { ClasseArea } from './lentes/carregar-areas.ts';
import type { Operador } from './lentes/combinacao.ts';

export const ROTA_EXPLICAR = '/api/explicar';
export const TIPO_FLUXO = 'application/x-ndjson';
export const LIMITE_PERGUNTA = 2000;
/** Municípios por pedido de disponibilidade (o mesmo limite do servidor). */
export const LIMITE_MUNICIPIOS = 142;
/** Teto do fluxo lido (eventos e resultado com as evidências): acima disso, a leitura para sem exibir nada. */
export const LIMITE_FLUXO_BYTES = 8 * 1024 * 1024;

/** Perguntas prontas de D4 e o texto livre. */
export type Pergunta = 'destaque' | 'periodos' | 'lacunas' | 'livre';

export const PERGUNTAS: Record<Exclude<Pergunta, 'livre'>, string> = {
  destaque: 'Por que esta célula foi destacada?',
  periodos: 'O que mudou entre estes períodos?',
  lacunas: 'Há lacunas nos dados?',
};

// --- Pedido (o formato fechado do servidor) ------------------------------------------------------------------------

export type ConfigLente =
  | { tipo: TipoLente }
  | { tipo: 'combinacao'; lentes: TipoLente[]; operador: Operador }
  | { tipo: 'sobreposicao'; classe: ClasseArea };

export type Recorte =
  | { tipo: 'selecao'; janela: Janela; municipio: number | null; lente: ConfigLente }
  | { tipo: 'periodos'; a: Janela; b: Janela; municipio: number | null; lente: ConfigLente | null }
  | { tipo: 'municipios'; janela: Janela; a: number; b: number; lente: ConfigLente | null }
  | { tipo: 'disponibilidade'; janela: Janela; municipios: number[] };

export interface PedidoExplicacao {
  pergunta: string;
  carga: { id: number; identidade: string };
  recorte: Recorte;
}

/** O que está na tela agora: recorte aplicado, lente aplicada, destaque aberto e comparação calculada. */
export interface ContextoTela {
  carga: { id: number; identidade: string };
  janela: Janela;
  municipio: number | null;
  lente: ConfigLente | null;
  destaque: { id: string; rotulo: string; municipios: number[] } | null;
  comparacao: { modo: 'periodos'; a: Janela; b: Janela } | { modo: 'municipios'; a: number; b: number } | null;
}

/** Recorte da pergunta, ou o motivo de ela não estar disponível no contexto atual. */
export type Escolha = { recorte: Recorte; descricao: string } | { indisponivel: string };

const recorteComparacao = (c: ContextoTela): Escolha | null => {
  const k = c.comparacao;
  if (!k) return null;
  if (k.modo === 'periodos') {
    return { recorte: { tipo: 'periodos', a: k.a, b: k.b, municipio: c.municipio, lente: c.lente }, descricao: 'a comparação de dois períodos' };
  }
  return { recorte: { tipo: 'municipios', janela: c.janela, a: k.a, b: k.b, lente: c.lente }, descricao: 'a comparação de dois municípios' };
};

const disponibilidade = (c: ContextoTela, municipios: number[], descricao: string): Escolha =>
  ({ recorte: { tipo: 'disponibilidade', janela: c.janela, municipios: [...new Set(municipios)].slice(0, LIMITE_MUNICIPIOS) }, descricao });

/**
 * Recorte de cada pergunta (T7: só habilitada com contexto suficiente). A ordem é fixa e explícita; nada é inventado
 * para a pergunta caber, e o texto livre segue a mesma ordem da tela (comparação, destaque ou lente, município).
 */
export function escolherRecorte(p: Pergunta, c: ContextoTela): Escolha {
  const selecao = c.lente ? { recorte: { tipo: 'selecao', janela: c.janela, municipio: c.municipio, lente: c.lente } as Recorte } : null;
  switch (p) {
    case 'destaque':
      if (!c.lente || !c.destaque) return { indisponivel: 'Escolha uma lente e abra um destaque.' };
      return { recorte: selecao!.recorte, descricao: 'o destaque aberto' };
    case 'periodos':
      if (c.comparacao?.modo !== 'periodos') return { indisponivel: 'Compare dois períodos em Filtros › Comparar.' };
      return recorteComparacao(c)!;
    case 'lacunas': {
      const comp = recorteComparacao(c);
      if (comp) return comp;
      if (c.destaque?.municipios.length) return disponibilidade(c, c.destaque.municipios, 'os municípios do destaque aberto');
      if (c.municipio !== null) return disponibilidade(c, [c.municipio], 'o município da Consulta');
      if (selecao) return { recorte: selecao.recorte, descricao: 'os destaques da lente' };
      return { indisponivel: 'Escolha um município, uma lente ou uma comparação.' };
    }
    case 'livre': {
      const comp = recorteComparacao(c);
      if (comp) return comp;
      if (selecao) return { recorte: selecao.recorte, descricao: c.destaque ? 'o destaque aberto' : 'os destaques da lente' };
      if (c.municipio !== null) return disponibilidade(c, [c.municipio], 'a disponibilidade do município da Consulta');
      return { indisponivel: 'Escolha uma lente, um município ou uma comparação para dar contexto à pergunta.' };
    }
  }
}

/** Texto enviado: a pergunta e, para o destaque, qual está aberto (o servidor recalcula tudo; nenhum número vai junto). */
export function textoPergunta(p: Pergunta, c: ContextoTela, livre: string): string {
  if (p === 'livre') return livre.trim();
  if (p === 'destaque' && c.destaque) return `${PERGUNTAS.destaque} Destaque aberto: ${c.destaque.rotulo} (${c.destaque.id}).`;
  return PERGUNTAS[p];
}

export function montarPedido(p: Pergunta, c: ContextoTela, livre = ''): PedidoExplicacao | { indisponivel: string } {
  const e = escolherRecorte(p, c);
  if ('indisponivel' in e) return e;
  const pergunta = textoPergunta(p, c, livre);
  if (!pergunta) return { indisponivel: 'Escreva a pergunta.' };
  if ([...pergunta].length > LIMITE_PERGUNTA) return { indisponivel: `A pergunta passa de ${LIMITE_PERGUNTA} caracteres.` };
  return { pergunta, carga: c.carga, recorte: e.recorte };
}

/** Identidade do contexto: mudou, a pergunta em curso é cancelada e a resposta exibida sai (nenhuma resposta obsoleta). */
export const chaveContexto = (sessao: number, c: ContextoTela | null): string => JSON.stringify([sessao, c]);

// --- Mensagens do fluxo --------------------------------------------------------------------------------------------

export type PapelAgente = 'principal' | 'lentes' | 'disponibilidade';
export type Subagente = Exclude<PapelAgente, 'principal'>;
export type EstadoExecucao = 'completa' | 'parcial' | 'incompleta' | 'fora_do_alcance';
export type Ferramenta = 'explicar_selecao' | 'comparar_periodos' | 'comparar_municipios' | 'consultar_disponibilidade' | 'ler_detalhes';

export type Evento =
  | { tipo: 'acesso_validado' }
  | { tipo: 'agente_iniciado'; papel: 'principal' }
  | { tipo: 'chamada_modelo'; papel: PapelAgente; ordem: number }
  | { tipo: 'delegacao'; papel: Subagente }
  | { tipo: 'delegacao_recusada'; papel: Subagente }
  | { tipo: 'subagente_iniciado'; papel: Subagente }
  | { tipo: 'ferramenta_concluida'; papel: Subagente; ferramenta: Ferramenta; evidencia: string }
  | { tipo: 'ferramenta_recusada'; papel: Subagente }
  | { tipo: 'subagente_concluido'; papel: Subagente; estado: 'concluido' | 'falha' }
  | { tipo: 'sintese_iniciada' }
  | { tipo: 'concluido'; estado: EstadoExecucao }
  | { tipo: 'erro'; codigo: string };

export interface Afirmacao { texto: string; referencias: string[] }

export interface Analise {
  papel: Subagente;
  estado: 'concluida' | 'falha';
  motivo?: string;
  afirmacoes: Afirmacao[];
  rejeitadas: number;
  limites: string[];
}

export interface EvidenciaRecebida { ferramenta: Ferramenta; papel: Subagente; dados: unknown }

export interface Execucao {
  modelo: string;
  total_chamadas: number;
  chamadas: { ordem: number; papel: PapelAgente; ms: number; repeticoes: number }[];
  uso: { entrada: number; saida: number; raciocinio: number; verificado: boolean };
}

export interface Resposta {
  estado: EstadoExecucao;
  afirmacoes: Afirmacao[];
  limites: string[];
  notas: string[];
  geradoPorIa: boolean;
  aviso: string;
  analises: Analise[];
  evidencias: Map<string, EvidenciaRecebida>;
  execucao: Execucao;
}

/** Desfecho de uma pergunta: resposta conferida, falha com código do servidor, ou fluxo fora do formato. */
export type Desfecho =
  | { tipo: 'resposta'; resposta: Resposta }
  | { tipo: 'falha'; status: number; codigo: string; texto: string; analises: Analise[]; evidencias: Map<string, EvidenciaRecebida>; execucao: Execucao | null }
  | { tipo: 'formato' };

type Objeto = Record<string, unknown>;
const objeto = (x: unknown): x is Objeto => typeof x === 'object' && x !== null && !Array.isArray(x);
const texto = (x: unknown): x is string => typeof x === 'string';
const textos = (x: unknown): x is string[] => Array.isArray(x) && x.every(texto);
const inteiro = (x: unknown, min = 0): x is number => Number.isSafeInteger(x) && (x as number) >= min;
const um = <T extends string>(x: unknown, valores: readonly T[]): x is T => valores.includes(x as T);

const SUBAGENTES = ['lentes', 'disponibilidade'] as const;
const PAPEIS = ['principal', ...SUBAGENTES] as const;
const ESTADOS = ['completa', 'parcial', 'incompleta', 'fora_do_alcance'] as const;
const FERRAMENTAS = ['explicar_selecao', 'comparar_periodos', 'comparar_municipios', 'consultar_disponibilidade', 'ler_detalhes'] as const;
const ID_EVIDENCIA = /^E[1-9]\d{0,2}$/;
const CODIGO = /^[a-z_]{1,40}$/;

/** Evento válido ou `null`: só os tipos e campos que o servidor emite, sem nenhum campo a mais. */
export function validarEvento(x: unknown): Evento | null {
  if (!objeto(x) || !texto(x['tipo'])) return null;
  const chaves = Object.keys(x).sort().join(',');
  const so = (...k: string[]): boolean => chaves === ['tipo', ...k].sort().join(',');
  switch (x['tipo']) {
    case 'acesso_validado': case 'sintese_iniciada':
      return so() ? (x as Evento) : null;
    case 'agente_iniciado':
      return so('papel') && x['papel'] === 'principal' ? (x as Evento) : null;
    case 'chamada_modelo':
      return so('papel', 'ordem') && um(x['papel'], PAPEIS) && inteiro(x['ordem'], 1) && (x['ordem'] as number) <= 6 ? (x as Evento) : null;
    case 'delegacao': case 'delegacao_recusada': case 'subagente_iniciado': case 'ferramenta_recusada':
      return so('papel') && um(x['papel'], SUBAGENTES) ? (x as Evento) : null;
    case 'ferramenta_concluida':
      return so('papel', 'ferramenta', 'evidencia') && um(x['papel'], SUBAGENTES) && um(x['ferramenta'], FERRAMENTAS)
        && texto(x['evidencia']) && ID_EVIDENCIA.test(x['evidencia']) ? (x as Evento) : null;
    case 'subagente_concluido':
      return so('papel', 'estado') && um(x['papel'], SUBAGENTES) && um(x['estado'], ['concluido', 'falha'] as const) ? (x as Evento) : null;
    case 'concluido':
      return so('estado') && um(x['estado'], ESTADOS) ? (x as Evento) : null;
    case 'erro':
      return so('codigo') && texto(x['codigo']) && CODIGO.test(x['codigo']) ? (x as Evento) : null;
    default:
      return null;
  }
}

const afirmacoes = (x: unknown): Afirmacao[] | null =>
  (Array.isArray(x) && x.every((a) => objeto(a) && texto(a['texto']) && textos(a['referencias']))
    ? x.map((a: Objeto) => ({ texto: a['texto'] as string, referencias: a['referencias'] as string[] })) : null);

function analises(x: unknown): Analise[] | null {
  if (!Array.isArray(x)) return null;
  const r: Analise[] = [];
  for (const a of x) {
    if (!objeto(a) || !um(a['papel'], SUBAGENTES) || !um(a['estado'], ['concluida', 'falha'] as const) || !inteiro(a['rejeitadas'])
      || !textos(a['limites']) || ('motivo' in a && !texto(a['motivo']))) return null;
    const af = afirmacoes(a['afirmacoes']);
    if (!af) return null;
    r.push({ papel: a['papel'], estado: a['estado'], ...(texto(a['motivo']) ? { motivo: a['motivo'] } : {}), afirmacoes: af, rejeitadas: a['rejeitadas'] as number, limites: a['limites'] as string[] });
  }
  return r;
}

function evidencias(x: unknown): Map<string, EvidenciaRecebida> | null {
  if (!objeto(x)) return null;
  const m = new Map<string, EvidenciaRecebida>();
  for (const [id, e] of Object.entries(x)) {
    if (!ID_EVIDENCIA.test(id) || !objeto(e) || !um(e['ferramenta'], FERRAMENTAS) || !um(e['papel'], SUBAGENTES) || !('dados' in e)) return null;
    m.set(id, { ferramenta: e['ferramenta'], papel: e['papel'], dados: e['dados'] });
  }
  return m;
}

function execucao(x: unknown): Execucao | null {
  if (!objeto(x) || !texto(x['modelo']) || !inteiro(x['total_chamadas']) || !Array.isArray(x['chamadas']) || !objeto(x['uso'])) return null;
  const chamadas: Execucao['chamadas'] = [];
  for (const c of x['chamadas']) {
    if (!objeto(c) || !inteiro(c['ordem'], 1) || !um(c['papel'], PAPEIS) || !inteiro(c['ms']) || !inteiro(c['repeticoes'])) return null;
    chamadas.push({ ordem: c['ordem'] as number, papel: c['papel'], ms: c['ms'] as number, repeticoes: c['repeticoes'] as number });
  }
  const u = x['uso'];
  if (!inteiro(u['entrada']) || !inteiro(u['saida']) || !inteiro(u['raciocinio']) || typeof u['verificado'] !== 'boolean') return null;
  return {
    modelo: x['modelo'], total_chamadas: x['total_chamadas'] as number, chamadas,
    uso: { entrada: u['entrada'] as number, saida: u['saida'] as number, raciocinio: u['raciocinio'] as number, verificado: u['verificado'] },
  };
}

/** Corpo da mensagem final (ou da resposta sem fluxo): resultado conferido, falha com código, ou fora do formato. */
export function validarFim(status: number, corpo: unknown): Desfecho {
  if (!objeto(corpo)) return { tipo: 'formato' };
  if (status === 200) {
    const r = corpo['resposta'];
    if (!um(corpo['estado'], ESTADOS) || !objeto(r)) return { tipo: 'formato' };
    const af = afirmacoes(r['afirmacoes']);
    const an = analises(corpo['analises']);
    const ev = evidencias(corpo['evidencias']);
    const ex = execucao(corpo['execucao']);
    if (!af || !an || !ev || !ex || !textos(r['limites']) || !textos(r['notas']) || typeof r['gerado_por_ia'] !== 'boolean' || !texto(r['aviso'])) return { tipo: 'formato' };
    return {
      tipo: 'resposta',
      resposta: { estado: corpo['estado'], afirmacoes: af, limites: r['limites'], notas: r['notas'], geradoPorIa: r['gerado_por_ia'], aviso: r['aviso'], analises: an, evidencias: ev, execucao: ex },
    };
  }
  if (!texto(corpo['erro']) || !CODIGO.test(corpo['erro']) || !texto(corpo['texto'])) return { tipo: 'formato' };
  // Falha do provedor no meio: o que já foi conferido continua acessível (sem síntese).
  const an = 'analises' in corpo ? analises(corpo['analises']) : [];
  const ev = 'evidencias' in corpo ? evidencias(corpo['evidencias']) : new Map<string, EvidenciaRecebida>();
  const ex = 'execucao' in corpo ? execucao(corpo['execucao']) : null;
  if (!an || !ev || ('execucao' in corpo && !ex)) return { tipo: 'formato' };
  return { tipo: 'falha', status, codigo: corpo['erro'], texto: corpo['texto'], analises: an, evidencias: ev, execucao: ex };
}

/**
 * Lê o fluxo linha a linha: eventos válidos vão a `aoEvento` na ordem em que chegam; a última mensagem é o fim. Linha
 * fora do formato, evento depois do fim, fluxo sem fim ou acima do teto: `formato`, sem exibir nada do resultado.
 */
export async function lerFluxo(corpo: ReadableStream<Uint8Array>, aoEvento: (e: Evento) => void): Promise<Desfecho> {
  const leitor = corpo.getReader();
  const decodificador = new TextDecoder('utf-8', { fatal: true });
  let resto = '';
  let lidos = 0;
  let fim: Desfecho | null = null;
  const linha = (l: string): boolean => {
    if (!l.trim()) return true;
    if (fim) return false;
    let m: unknown;
    try { m = JSON.parse(l); } catch { return false; }
    if (!objeto(m)) return false;
    if (m['tipo'] === 'evento' && Object.keys(m).length === 2) {
      const e = validarEvento(m['evento']);
      if (!e) return false;
      aoEvento(e);
      return true;
    }
    if (m['tipo'] === 'fim' && Object.keys(m).length === 3 && inteiro(m['status'], 100)) {
      fim = validarFim(m['status'] as number, m['corpo']);
      return fim.tipo !== 'formato';
    }
    return false;
  };
  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      lidos += value.byteLength;
      if (lidos > LIMITE_FLUXO_BYTES) { void leitor.cancel(); return { tipo: 'formato' }; }
      resto += decodificador.decode(value, { stream: true });
      for (let i = resto.indexOf('\n'); i >= 0; i = resto.indexOf('\n')) {
        const ok = linha(resto.slice(0, i));
        resto = resto.slice(i + 1);
        if (!ok) { void leitor.cancel(); return { tipo: 'formato' }; }
      }
    }
    resto += decodificador.decode();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return { tipo: 'formato' };
  }
  if (resto.trim() && !linha(resto)) return { tipo: 'formato' };
  return fim ?? { tipo: 'formato' };
}

/**
 * Envia a pergunta e acompanha a execução. Acessos negados e erros anteriores à execução chegam como resposta HTTP
 * comum (JSON); a execução, como fluxo. O cancelamento (`sinal`) fecha a conexão, e o servidor não começa nenhuma
 * chamada nova ao provedor. `AbortError` é propagado para o chamador distinguir cancelamento de falha.
 */
export async function perguntar(
  pedido: PedidoExplicacao,
  token: string,
  sinal: AbortSignal,
  aoEvento: (e: Evento) => void,
  f: typeof fetch = fetch,
): Promise<Desfecho> {
  const r = await f(ROTA_EXPLICAR, {
    method: 'POST', signal: sinal, cache: 'no-store', credentials: 'omit',
    headers: { 'content-type': 'application/json', accept: TIPO_FLUXO, authorization: `Bearer ${token}` },
    body: JSON.stringify(pedido),
  });
  const tipo = r.headers.get('content-type') ?? '';
  if (r.ok && tipo.startsWith(TIPO_FLUXO) && r.body) return lerFluxo(r.body, aoEvento);
  if (!tipo.startsWith('application/json')) return { tipo: 'falha', status: r.status, codigo: 'servico_indisponivel', texto: 'O serviço de explicação não respondeu como esperado.', analises: [], evidencias: new Map(), execucao: null };
  let corpo: unknown;
  try { corpo = await r.json(); } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return { tipo: 'formato' };
  }
  return validarFim(r.status, corpo);
}
