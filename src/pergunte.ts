// "Pergunte ao mapa" (ciclo 012, issue #113): a pergunta em linguagem natural vira os filtros que já existem
// (período, município, lente, classe de área, comparação) e o pedido de animação. Módulo puro, sem DOM, usado pelo
// navegador e pela rota `/api/interpretar`. A IA só traduz texto em filtros: nenhum número sai daqui. A saída da IA e
// a do interpretador local passam pelo mesmo validador antes de tocar a tela; campo inválido é descartado e avisado.
import type { ClasseArea } from './lentes/carregar-areas.ts';
import type { Janela } from './recorte.ts';

export const LIMITE_PERGUNTA_MAPA = 300;
export const ROTA_INTERPRETAR = '/api/interpretar';
/** Tempo máximo de espera pela IA no navegador; depois disso o interpretador local assume. */
export const TEMPO_LIMITE_IA_MS = 20_000;

export const TIPOS = ['consulta', 'recusa_autoria', 'recusa_previsao', 'sem_dado', 'fora_da_janela', 'nao_entendi'] as const;
export type TipoInterpretacao = (typeof TIPOS)[number];
export const LENTES_PERGUNTA = ['nenhuma', 'concentracao', 'recorrencia', 'persistencia', 'sobreposicao', 'combinacao'] as const;
export type LentePergunta = (typeof LENTES_PERGUNTA)[number];
/** Lentes que a combinação cruza (as três da seção "Cruzar critérios"), na ordem canônica. */
export const LENTES_COMBINAVEIS = ['concentracao', 'recorrencia', 'persistencia'] as const;
export type LenteCombinavel = (typeof LENTES_COMBINAVEIS)[number];
export interface Combinacao {
  lentes: LenteCombinavel[];
  operador: 'e' | 'ou';
}
const CLASSES: readonly ClasseArea[] = ['protecao_integral', 'uso_sustentavel', 'terra_indigena'];

export type Comparar = { modo: 'periodos'; b: Janela } | { modo: 'municipios'; municipio_b: number };

/** Interpretação já validada: só valores que a tela aceita. `periodo: null` mantém o período aplicado. */
export interface Interpretacao {
  tipo: TipoInterpretacao;
  periodo: Janela | null;
  /** `null`: Todo Mato Grosso (nenhum município citado). */
  municipio: number | null;
  lente: LentePergunta;
  classe: ClasseArea | null;
  /** Só com `lente: 'combinacao'`: duas ou mais lentes e o operador. */
  combinacao: Combinacao | null;
  animar: boolean;
  comparar: Comparar | null;
  motivo: string;
}

export interface ContextoPergunta {
  janela: Janela;
  municipios: readonly { codigo: number; nome: string }[];
}

/**
 * Formato trocado com a IA (saída estruturada) e produzido pelo interpretador local: plano, sem nulos, para caber no
 * esquema do provedor. Texto vazio e código 0 significam "não citado".
 */
export interface InterpretacaoBruta {
  tipo: string;
  inicio: string;
  fim: string;
  municipio_codigo: number;
  lente: string;
  classe_area: string;
  lentes_combinacao: string[];
  operador: string;
  animar: boolean;
  comparar_modo: string;
  b_inicio: string;
  b_fim: string;
  municipio_b: number;
  motivo: string;
}

export const ESQUEMA_INTERPRETACAO = {
  type: 'object',
  additionalProperties: false,
  required: ['tipo', 'inicio', 'fim', 'municipio_codigo', 'lente', 'classe_area', 'lentes_combinacao', 'operador', 'animar', 'comparar_modo', 'b_inicio', 'b_fim', 'municipio_b', 'motivo'],
  properties: {
    tipo: { type: 'string', enum: [...TIPOS] },
    inicio: { type: 'string', description: 'AAAA-MM-DD ou vazio se a pergunta não cita período' },
    fim: { type: 'string', description: 'AAAA-MM-DD inclusivo ou vazio' },
    municipio_codigo: { type: 'integer', description: 'código da lista; 0 para todo Mato Grosso' },
    lente: { type: 'string', enum: [...LENTES_PERGUNTA] },
    classe_area: { type: 'string', enum: ['nenhuma', ...CLASSES] },
    lentes_combinacao: { type: 'array', items: { type: 'string', enum: [...LENTES_COMBINAVEIS] }, description: 'só com lente "combinacao": duas ou mais lentes; senão vazio' },
    operador: { type: 'string', enum: ['nenhum', 'e', 'ou'] },
    animar: { type: 'boolean' },
    comparar_modo: { type: 'string', enum: ['nenhuma', 'periodos', 'municipios'] },
    b_inicio: { type: 'string' },
    b_fim: { type: 'string' },
    municipio_b: { type: 'integer' },
    motivo: { type: 'string', description: 'frase curta em português, sem números' },
  },
} as const;

/** Instrução de sistema da rota: janela e lista pública de municípios. Nenhum dado de detecção vai ao modelo. */
export function instrucaoSistema(ctx: ContextoPergunta): string {
  return [
    'Você é o interpretador de perguntas do Rastro Quente, que mostra detecções de calor (focos de calor) do satélite AQUA_M-T em Mato Grosso.',
    'Sua única tarefa é traduzir a pergunta do técnico nos filtros da tela. Não responda à pergunta, não invente números e não descreva dados.',
    `A janela de dados vai de ${ctx.janela.inicio} a ${ctx.janela.fim} (dias GMT). Mês citado sem ano usa o ano em que esse mês cai dentro da janela.`,
    'tipo: "consulta" quando houver filtros; "recusa_autoria" para perguntas sobre quem causou, culpa, crime, infração, multa ou responsável; "recusa_previsao" para previsão, risco ou futuro; "sem_dado" para bioma, chuva, vento, umidade, área queimada, intensidade ou temperatura; "fora_da_janela" quando o período pedido não cabe na janela; "nao_entendi" quando nada da pergunta vira filtro.',
    'lente: "concentracao" (onde há mais detecções; só sem município), "recorrencia" (voltam mês após mês), "persistencia" (dias seguidos), "sobreposicao" (dentro de áreas protegidas, com classe_area), "combinacao" quando a pergunta pede duas ou mais dessas três lentes juntas (concentração, recorrência, persistência), com lentes_combinacao e operador ("e": o lugar destacado por todas; "ou": por pelo menos uma; padrão "e"), ou "nenhuma". Fora da combinação, lentes_combinacao fica vazio e operador "nenhum".',
    'classe_area: "terra_indigena" para terra indígena ou TI; "protecao_integral" para parque, estação ecológica, reserva biológica ou unidade de conservação de proteção integral; "uso_sustentavel" para APA, reserva extrativista, floresta nacional ou uso sustentável; senão "nenhuma".',
    'animar: true quando a pergunta pede evolução, dia a dia, ao longo do tempo ou animação.',
    'comparar_modo: "periodos" ou "municipios" só quando a pergunta compara; B tem o mesmo número de dias de A.',
    'motivo: uma frase curta explicando a interpretação, sem números de detecções.',
    'Municípios (código: nome):',
    ctx.municipios.map((m) => `${m.codigo}: ${m.nome}`).join('; '),
  ].join('\n');
}

// --- Datas ----------------------------------------------------------------------------------------------------------

const DIA_MS = 86_400_000;
const DIA = /^\d{4}-\d{2}-\d{2}$/;
const diaValido = (x: unknown): x is string =>
  typeof x === 'string' && DIA.test(x) && new Date(`${x}T00:00:00Z`).toISOString().slice(0, 10) === x;
const somarDias = (dia: string, n: number): string => new Date(Date.parse(`${dia}T00:00:00Z`) + n * DIA_MS).toISOString().slice(0, 10);
const duracao = (j: Janela): number => Math.round((Date.parse(`${j.fim}T00:00:00Z`) - Date.parse(`${j.inicio}T00:00:00Z`)) / DIA_MS) + 1;
const fimDoMes = (ano: number, mes: number): string => new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10);
const inicioDoMes = (ano: number, mes: number): string => `${ano}-${String(mes).padStart(2, '0')}-01`;

/** Remove acentos e caixa, para casar nomes de município e palavras-chave. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9/]+/g, ' ').trim();
}

const MESES: [RegExp, number][] = [
  [/\bjan(eiro)?\b/, 1], [/\bfev(ereiro)?\b/, 2], [/\bmarco\b/, 3], [/\babr(il)?\b/, 4], [/\bmai(o)?\b/, 5], [/\bjun(ho)?\b/, 6],
  [/\bjul(ho)?\b/, 7], [/\bago(sto)?\b/, 8], [/\bset(embro)?\b/, 9], [/\bout(ubro)?\b/, 10], [/\bnov(embro)?\b/, 11], [/\bdezembro\b/, 12],
];

/** Ano do mês: o citado na pergunta; senão, o último ano em que o mês toca a janela. */
function anoDoMes(mes: number, janela: Janela, anoCitado: number | null): number | null {
  if (anoCitado !== null) return anoCitado;
  const a0 = Number(janela.inicio.slice(0, 4));
  const a1 = Number(janela.fim.slice(0, 4));
  for (let a = a1; a >= a0; a -= 1) if (fimDoMes(a, mes) >= janela.inicio && inicioDoMes(a, mes) <= janela.fim) return a;
  return null;
}

/** Período citado na pergunta normalizada; `fora` quando foi citado mas não toca a janela. */
function periodoCitado(t: string, janela: Janela): { periodo: Janela | null; periodos: Janela[]; fora: boolean } {
  const anoCitado = /\b(20\d\d)\b/.exec(t)?.[1];
  const ano = anoCitado ? Number(anoCitado) : null;
  // Datas dd/mm ou dd/mm/aaaa.
  const datas = [...t.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g)].flatMap((m) => {
    const a = m[3] ? Number(m[3]) : anoDoMes(Number(m[2]), janela, ano);
    if (a === null) return [];
    const d = `${a}-${String(Number(m[2])).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
    return diaValido(d) ? [d] : [];
  });
  if (datas.length) {
    const ordenadas = [...datas].sort();
    const p = { inicio: ordenadas[0]!, fim: ordenadas.at(-1)! };
    return { periodo: p, periodos: [p], fora: p.fim < janela.inicio || p.inicio > janela.fim };
  }
  const relativo = /\bultim[oa]s? (\d{1,3}) dias\b/.exec(t);
  if (relativo) return { periodo: { inicio: maior(somarDias(janela.fim, 1 - Number(relativo[1])), janela.inicio), fim: janela.fim }, periodos: [], fora: false };
  if (/\bultima semana\b/.test(t)) return { periodo: { inicio: maior(somarDias(janela.fim, -6), janela.inicio), fim: janela.fim }, periodos: [], fora: false };
  if (/\bultimo mes\b/.test(t)) return { periodo: { inicio: maior(somarDias(janela.fim, -29), janela.inicio), fim: janela.fim }, periodos: [], fora: false };
  if (/\b(janela inteira|todo o periodo|ano inteiro|toda a janela)\b/.test(t)) return { periodo: { ...janela }, periodos: [], fora: false };
  // Meses, na ordem em que aparecem.
  const meses = MESES.flatMap(([re, n]) => {
    const m = re.exec(t);
    return m ? [{ pos: m.index, n }] : [];
  }).sort((a, b) => a.pos - b.pos);
  if (meses.length) {
    const periodos: Janela[] = [];
    let fora = false;
    for (const { n } of meses) {
      const a = anoDoMes(n, janela, ano);
      if (a === null) { fora = true; continue; }
      periodos.push({ inicio: inicioDoMes(a, n), fim: fimDoMes(a, n) });
    }
    if (!periodos.length) return { periodo: null, periodos: [], fora: true };
    const inicio = periodos.map((p) => p.inicio).sort()[0]!;
    const fim = periodos.map((p) => p.fim).sort().at(-1)!;
    return { periodo: { inicio, fim }, periodos, fora: fora && periodos.length === 0 };
  }
  if (ano !== null) {
    const p = { inicio: `${ano}-01-01`, fim: `${ano}-12-31` };
    return { periodo: p, periodos: [p], fora: p.fim < janela.inicio || p.inicio > janela.fim };
  }
  return { periodo: null, periodos: [], fora: false };
}

const maior = (a: string, b: string): string => (a > b ? a : b);
const menor = (a: string, b: string): string => (a < b ? a : b);

// --- Interpretador local (sem IA) ------------------------------------------------------------------------------------

const AUTORIA = /\b(quem (causou|provocou|colocou|ateou|queimou|fez|foi|e o responsavel)|culpad\w*|crime\w*|criminos\w*|infra(cao|coes|tor)\w*|autor(ia|es)?|responsave(l|is) (pel|por)\w*|multa\w*|incendiari\w*|denunci\w*)\b/;
const PREVISAO = /\b(vai (queimar|pegar fogo|ter|acontecer|aumentar)|vao (queimar|aumentar)|amanha|proxim[oa]s? (dias?|semanas?|mes|meses|ano)|previs\w*|prever|preve|risco|futur\w*|deve queimar)\b/;
const SEM_DADO = /\b(bioma\w*|chuva\w*|chov\w*|vento\w*|umidade|area queimada|areas queimadas|hectares?|intensidade|frp|temperatura\w*|cicatri\w*|seca|clima)\b/;
const ANIMAR = /\b(evolu\w*|anima\w*|dia a dia|dia apos dia a|ao longo|linha do tempo|reproduz\w*|como (as deteccoes |os focos )?(avanc|cresc|aument|se espalh)\w*)\b/;
const COMPARAR = /\b(compar\w*|diferen\w*|versus|vs|em relacao)\b/;

/** Municípios citados, do nome mais longo ao mais curto, sem sobreposição no texto. */
function municipiosCitados(t: string, municipios: ContextoPergunta['municipios']): number[] {
  const candidatos = municipios.map((m) => ({ codigo: m.codigo, nome: normalizar(m.nome) }))
    .filter((m) => m.nome.length >= 3).sort((a, b) => b.nome.length - a.nome.length);
  let resto = ` ${t} `;
  const achados: { codigo: number; pos: number }[] = [];
  for (const m of candidatos) {
    const i = resto.indexOf(` ${m.nome} `);
    if (i < 0) continue;
    achados.push({ codigo: m.codigo, pos: i });
    resto = `${resto.slice(0, i + 1)}${'#'.repeat(m.nome.length)}${resto.slice(i + 1 + m.nome.length)}`;
  }
  return achados.sort((a, b) => a.pos - b.pos).map((a) => a.codigo);
}

function lenteCitada(t: string): { lente: LentePergunta; classe: ClasseArea | null; combinacao: Combinacao | null } {
  let classe: ClasseArea | null = null;
  if (/\b(terras? indigenas?|ti|tis|indigenas?|aldeias?)\b/.test(t)) classe = 'terra_indigena';
  else if (/\b(uso sustentavel|apa|apas|resex|reservas? extrativistas?|flona|florestas? nacionais?)\b/.test(t)) classe = 'uso_sustentavel';
  else if (/\b(protecao integral|parques?|estac(ao|oes) ecologicas?|esec|reservas? biologicas?|rebio|unidades? de conservacao|ucs?)\b/.test(t)) classe = 'protecao_integral';
  else if (/\bareas? protegidas?\b/.test(t)) classe = 'protecao_integral';
  const padroes: Record<LenteCombinavel, RegExp> = {
    concentracao: /\b(concentra\w*|mais (deteccoes|focos)|maior(es)? (numero|quantidade)|ranking|onde ha mais|quais municipios)\b/,
    recorrencia: /\b(recorr\w*|volta\w*|repet\w*|mes apos mes|todo mes|reincid\w*)\b/,
    persistencia: /\b(persist\w*|seguid\w*|consecutiv\w*|sem pausa|continu\w*|dia apos dia)\b/,
  };
  const citadas = LENTES_COMBINAVEIS.filter((l) => padroes[l].test(t));
  // Duas ou mais lentes citadas: combinação; "ou", "qualquer" ou "pelo menos uma" pedem o operador "ou".
  if (citadas.length >= 2) {
    const operador = /\b(ou|qualquer\w*|pelo menos uma)\b/.test(t) ? 'ou' : 'e';
    return { lente: 'combinacao', classe, combinacao: { lentes: citadas, operador } };
  }
  if (citadas.length === 1) return { lente: citadas[0]!, classe, combinacao: null };
  if (classe) return { lente: 'sobreposicao', classe, combinacao: null };
  return { lente: 'nenhuma', classe: null, combinacao: null };
}

/** Interpretador por regras, no navegador: entra quando a IA está desligada, demora ou falha. */
export function interpretarLocal(pergunta: string, ctx: ContextoPergunta): InterpretacaoBruta {
  const t = normalizar(pergunta.slice(0, LIMITE_PERGUNTA_MAPA));
  const vazio: InterpretacaoBruta = {
    tipo: 'nao_entendi', inicio: '', fim: '', municipio_codigo: 0, lente: 'nenhuma', classe_area: 'nenhuma',
    lentes_combinacao: [], operador: 'nenhum', animar: false,
    comparar_modo: 'nenhuma', b_inicio: '', b_fim: '', municipio_b: 0, motivo: '',
  };
  if (AUTORIA.test(t)) return { ...vazio, tipo: 'recusa_autoria', motivo: 'A pergunta pede autoria ou responsabilidade.' };
  if (PREVISAO.test(t)) return { ...vazio, tipo: 'recusa_previsao', motivo: 'A pergunta pede previsão.' };
  if (SEM_DADO.test(t)) return { ...vazio, tipo: 'sem_dado', motivo: 'A pergunta cita um dado que não está na base.' };
  const p = periodoCitado(t, ctx.janela);
  const municipios = municipiosCitados(t, ctx.municipios);
  const { lente, classe, combinacao } = lenteCitada(t);
  const animar = ANIMAR.test(t);
  const compara = COMPARAR.test(t);
  const r: InterpretacaoBruta = {
    ...vazio, tipo: 'consulta', lente, classe_area: classe ?? 'nenhuma', animar,
    lentes_combinacao: combinacao?.lentes ?? [], operador: combinacao?.operador ?? 'nenhum',
  };
  if (p.fora && !p.periodo) return { ...vazio, tipo: 'fora_da_janela', motivo: 'O período citado está fora da janela de dados.' };
  if (p.periodo) {
    if (p.fora) return { ...vazio, tipo: 'fora_da_janela', motivo: 'O período citado está fora da janela de dados.' };
    r.inicio = p.periodo.inicio;
    r.fim = p.periodo.fim;
  }
  r.municipio_codigo = municipios[0] ?? 0;
  if (compara && municipios.length >= 2) {
    r.comparar_modo = 'municipios';
    r.municipio_b = municipios[1]!;
  } else if (compara && p.periodos.length >= 2) {
    const [a, b] = p.periodos as [Janela, Janela];
    r.inicio = a.inicio;
    r.fim = a.fim;
    r.comparar_modo = 'periodos';
    r.b_inicio = b.inicio;
    r.b_fim = somarDias(b.inicio, duracao(a) - 1);
  }
  const entendeu = r.inicio || r.municipio_codigo || r.lente !== 'nenhuma' || r.animar || r.comparar_modo !== 'nenhuma'
    || /\b(mato grosso|estado|todo o estado|deteccoes|focos)\b/.test(t);
  if (!entendeu) return { ...vazio, motivo: 'Nenhum período, município ou lente foi reconhecido.' };
  r.motivo = animar ? 'Pedido de evolução no tempo.' : r.lente !== 'nenhuma' ? 'Pedido de padrão por lente.' : 'Pedido de consulta.';
  return r;
}

// --- Validador comum ------------------------------------------------------------------------------------------------

const texto = (x: unknown, max: number): string => (typeof x === 'string' ? x.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/**
 * Valida a interpretação (da IA ou local) contra a janela e a lista de municípios: datas dentro da janela, município
 * por código, valores enumerados. Campo inválido é descartado e descrito em `descartados`; nunca é aplicado.
 */
export function validarInterpretacao(bruto: unknown, ctx: ContextoPergunta): { interpretacao: Interpretacao; descartados: string[] } {
  const o = (typeof bruto === 'object' && bruto !== null && !Array.isArray(bruto) ? bruto : {}) as Record<string, unknown>;
  const descartados: string[] = [];
  const codigos = new Set(ctx.municipios.map((m) => m.codigo));
  const tipo = TIPOS.includes(o['tipo'] as TipoInterpretacao) ? (o['tipo'] as TipoInterpretacao) : 'nao_entendi';
  if (!TIPOS.includes(o['tipo'] as TipoInterpretacao)) descartados.push('tipo da interpretação desconhecido');
  const motivo = texto(o['motivo'], 200);
  const base: Interpretacao = { tipo, periodo: null, municipio: null, lente: 'nenhuma', classe: null, combinacao: null, animar: false, comparar: null, motivo };
  if (tipo !== 'consulta') return { interpretacao: base, descartados };

  const j = ctx.janela;
  const inicio = o['inicio'];
  const fim = o['fim'];
  if (inicio || fim) {
    if (!diaValido(inicio) || !diaValido(fim) || inicio > fim) descartados.push('período inválido');
    else if (fim < j.inicio || inicio > j.fim) return { interpretacao: { ...base, tipo: 'fora_da_janela' }, descartados };
    else {
      base.periodo = { inicio: maior(inicio, j.inicio), fim: menor(fim, j.fim) };
      if (base.periodo.inicio !== inicio || base.periodo.fim !== fim) descartados.push(`período ajustado à janela de dados (${j.inicio} a ${j.fim})`);
    }
  }
  const m = o['municipio_codigo'];
  if (m !== 0 && m !== undefined && m !== null) {
    if (Number.isSafeInteger(m) && codigos.has(m as number)) base.municipio = m as number;
    else descartados.push('município fora da lista da versão de dados');
  }
  const lente = o['lente'];
  if (LENTES_PERGUNTA.includes(lente as LentePergunta)) base.lente = lente as LentePergunta;
  else if (lente !== undefined) descartados.push('lente desconhecida');
  const classe = o['classe_area'];
  if (CLASSES.includes(classe as ClasseArea)) base.classe = classe as ClasseArea;
  else if (classe !== undefined && classe !== 'nenhuma' && classe !== '') descartados.push('classe de área desconhecida');
  if (base.lente === 'sobreposicao' && !base.classe) {
    base.classe = 'protecao_integral';
    descartados.push('classe de área não citada: usada Proteção integral');
  }
  if (base.lente !== 'sobreposicao') base.classe = null;
  if (base.lente === 'concentracao' && base.municipio !== null) {
    base.lente = 'nenhuma';
    descartados.push('a concentração compara municípios e só vale para Todo Mato Grosso');
  }
  if (base.lente === 'combinacao') {
    const lista: unknown[] = Array.isArray(o['lentes_combinacao']) ? o['lentes_combinacao'] : [];
    if (lista.some((l) => !LENTES_COMBINAVEIS.includes(l as LenteCombinavel))) descartados.push('lente desconhecida na combinação');
    let lentes: LenteCombinavel[] = LENTES_COMBINAVEIS.filter((l) => lista.includes(l));
    if (lentes.includes('concentracao') && base.municipio !== null) {
      lentes = lentes.filter((l) => l !== 'concentracao');
      descartados.push('com município, a concentração sai da combinação');
    }
    const operador = o['operador'] === 'ou' ? 'ou' : 'e';
    if (o['operador'] !== 'e' && o['operador'] !== 'ou') descartados.push('operador não citado: usado "e"');
    if (lentes.length >= 2) base.combinacao = { lentes, operador };
    else if (lentes.length === 1) {
      base.lente = lentes[0]!;
      descartados.push('a combinação precisa de pelo menos 2 lentes: aplicada só a que restou');
    } else {
      base.lente = 'nenhuma';
      descartados.push('combinação sem lentes válidas');
    }
  }
  base.animar = o['animar'] === true;

  const modo = o['comparar_modo'];
  if (modo === 'municipios') {
    const b = o['municipio_b'];
    if (base.municipio === null) descartados.push('comparação de municípios sem o município A');
    else if (!Number.isSafeInteger(b) || !codigos.has(b as number) || b === base.municipio) descartados.push('município B inválido');
    else base.comparar = { modo: 'municipios', municipio_b: b as number };
  } else if (modo === 'periodos') {
    const bi = o['b_inicio'];
    const bf = o['b_fim'];
    const a = base.periodo;
    if (!a) descartados.push('comparação de períodos sem o período A');
    else if (!diaValido(bi) || !diaValido(bf) || bi > bf || bi < j.inicio || bf > j.fim) descartados.push('período B fora da janela de dados');
    else if (duracao({ inicio: bi, fim: bf }) !== duracao(a)) descartados.push('período B com número de dias diferente de A');
    else base.comparar = { modo: 'periodos', b: { inicio: bi, fim: bf } };
  } else if (modo !== undefined && modo !== 'nenhuma') descartados.push('modo de comparação desconhecido');

  if (!base.periodo && base.municipio === null && base.lente === 'nenhuma' && !base.animar && !base.comparar && descartados.length) {
    return { interpretacao: { ...base, tipo: 'nao_entendi' }, descartados };
  }
  return { interpretacao: base, descartados };
}

// --- Chamada à rota ---------------------------------------------------------------------------------------------

export type DesfechoIa = { tipo: 'ok'; bruto: unknown; reserva: boolean } | { tipo: 'desligada' } | { tipo: 'falha'; codigo: string };

/** Quem interpretou: o modelo principal, o modelo reserva (ciclo 013) ou o interpretador local, sem IA. */
export type OrigemInterpretacao = 'ia' | 'ia_reserva' | 'local';

export const ROTULO_ORIGEM: Record<OrigemInterpretacao, string> = {
  ia: 'Interpretado por IA',
  ia_reserva: 'Interpretado por IA (modelo reserva)',
  local: 'Interpretado sem IA',
};

/** Nota quando a IA falha e o interpretador local assume; a sobrecarga do provedor tem nota própria (ciclo 013). */
export function notaFalhaIa(codigo: string): string {
  if (codigo === 'provedor_sobrecarregado') return 'A IA está sobrecarregada no momento; o interpretador local assumiu. Tente de novo em alguns minutos.';
  if (codigo === 'tempo_esgotado') return 'A IA não respondeu a tempo; o interpretador local assumiu.';
  return 'A IA não respondeu como esperado; o interpretador local assumiu.';
}

/**
 * Pede a interpretação à rota `/api/interpretar` na própria origem, com o JWT só no cabeçalho. Qualquer falha (IA
 * desligada, tempo esgotado, provedor, rede, formato) devolve o motivo: quem chama usa o interpretador local.
 */
export async function pedirInterpretacao(
  pergunta: string,
  carga: { id: number; identidade: string },
  token: string,
  sinal: AbortSignal,
  f: typeof fetch = fetch,
): Promise<DesfechoIa> {
  let r: Response;
  try {
    r = await f(ROTA_INTERPRETAR, {
      method: 'POST', signal: sinal, cache: 'no-store', credentials: 'omit',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ pergunta: pergunta.slice(0, LIMITE_PERGUNTA_MAPA), carga }),
    });
  } catch {
    return { tipo: 'falha', codigo: sinal.aborted ? 'tempo_esgotado' : 'rede' };
  }
  let corpo: unknown = null;
  try { corpo = await r.json(); } catch { /* formato inesperado */ }
  const o = (typeof corpo === 'object' && corpo !== null ? corpo : {}) as Record<string, unknown>;
  if (r.status === 503 && o['erro'] === 'ia_desabilitada') return { tipo: 'desligada' };
  if (!r.ok || !('interpretacao' in o)) return { tipo: 'falha', codigo: typeof o['erro'] === 'string' ? o['erro'] : `http_${r.status}` };
  return { tipo: 'ok', bruto: o['interpretacao'], reserva: o['reserva'] === true };
}

/** Texto do aviso para os tipos que não aplicam filtros. */
export const AVISO_TIPO: Record<Exclude<TipoInterpretacao, 'consulta'>, string> = {
  recusa_autoria: 'O Rastro Quente não indica autoria, dano nem infração: detecções de calor não comprovam incêndio, dano, autoria ou infração. Posso mostrar as detecções do recorte.',
  recusa_previsao: 'O Rastro Quente não faz previsão: mostra só as detecções já registradas no período.',
  sem_dado: 'Esse dado não está na base. A base tem as detecções de calor do AQUA_M-T, os limites municipais, as áreas protegidas e a disponibilidade dos dados.',
  fora_da_janela: 'O período pedido está fora da janela de dados',
  nao_entendi: 'Não entendi a pergunta. Cite um município, um mês ou um padrão (concentração, recorrência, persistência, terra indígena).',
};
