// Comparação determinística (plano 008, item 1; KB-007). Função pura sobre resultados já calculados pelas lentes de
// produção, uma aplicação por lado, com a mesma carga, versões e configuração. Nada aqui calcula lente, muda limiar
// ou soma lados: compara unidades destacadas (município na concentração, célula T1 nas demais) e decide se há
// conclusão comparativa (T3). Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração.
import { diasDaJanela } from './lentes/cobertura.ts';
import type { CelulaCombinada, ResultadoCombinacao } from './lentes/combinacao.ts';
import type {
  Cobertura, DisponibilidadeMunicipio, Janela, MesJanela, RegistroLente, ResultadoLente, TipoLente, Unidade,
} from './lentes/contrato.ts';
import { mesesDaJanela } from './lentes/recorrencia.ts';
import { TEXTO_SEM_CAMADA, type ResultadoSobreposicao } from './lentes/sobreposicao.ts';
import type { NumerosMunicipio } from './municipios.ts';
import type { ClasseDisponibilidade } from './tipos.ts';

export const VERSAO_COMPARACAO = 'comparacao-008-v1';

export type Lado = 'A' | 'B';
export type ResultadoComparavel = ResultadoLente | ResultadoCombinacao | ResultadoSobreposicao;

/** Pedido recusado (CP-3, CP-9): nenhum resultado comparativo é produzido. */
export class ErroComparacao extends Error {
  readonly tipo = 'pedido_recusado' as const;
}

function recusar(motivo: string): never {
  throw new ErroComparacao(motivo);
}

const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;
const diaValido = (d: string): boolean => FORMATO_DIA.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const dataBr = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;

/** Dias GMT inclusivos de uma janela válida. */
export function duracaoDias(j: Janela): number {
  return (Date.parse(`${j.fim}T00:00:00Z`) - Date.parse(`${j.inicio}T00:00:00Z`)) / 86_400_000 + 1;
}

// --- Pedidos (T1, T2) -------------------------------------------------------------------------------------------

export interface ValidacaoPeriodos {
  dias: number;
  /** Dias GMT presentes nas duas janelas (CP-14); os lados continuam aplicações independentes. */
  diasEmComum: string[];
  coincidentes: boolean;
}

/**
 * Dois períodos da mesma carga (T1): datas GMT válidas, início ≤ fim, dentro da janela da carga e com o mesmo número
 * de dias. Nada é ajustado para caber; janelas sobrepostas ou coincidentes são admitidas e identificadas.
 */
export function validarPeriodos(janelaCarga: Janela, a: Janela, b: Janela): ValidacaoPeriodos {
  for (const [lado, j] of [['A', a], ['B', b]] as const) {
    if (!diaValido(j.inicio) || !diaValido(j.fim)) recusar(`período ${lado} com data inválida`);
    if (j.inicio > j.fim) recusar(`período ${lado} com início depois do fim`);
    if (j.inicio < janelaCarga.inicio || j.fim > janelaCarga.fim) {
      recusar(`período ${lado} fora da versão dos dados (${dataBr(janelaCarga.inicio)} a ${dataBr(janelaCarga.fim)})`);
    }
  }
  const dias = duracaoDias(a);
  if (duracaoDias(b) !== dias) recusar(`os períodos precisam ter o mesmo número de dias GMT (A tem ${dias}, B tem ${duracaoDias(b)})`);
  const diasA = new Set(diasDaJanela(a));
  const diasEmComum = diasDaJanela(b).filter((d) => diasA.has(d));
  return { dias, diasEmComum, coincidentes: a.inicio === b.inicio && a.fim === b.fim };
}

/** Dois municípios explicitamente escolhidos e válidos na carga (T2); o mesmo nos dois lados é admitido (CM-5). */
export function validarMunicipios(a: number | null, b: number | null, validos: ReadonlySet<number>): { mesmo: boolean } {
  if (a === null) recusar('escolha o município A no recorte da consulta');
  if (b === null) recusar('escolha o município B');
  if (!validos.has(a as number) || !validos.has(b as number)) recusar('município fora desta versão dos dados');
  return { mesmo: a === b };
}

// --- Identidade da configuração (T1, CP-3, CP-9) ---------------------------------------------------------------

const ehCombinacao = (r: ResultadoComparavel): r is ResultadoCombinacao => 'tipo' in r && r.tipo === 'combinacao';
const ehSobreposicao = (r: ResultadoComparavel): r is ResultadoSobreposicao => 'lente' in r && r.lente === 'sobreposicao';

/** Configuração completa do resultado, campo a campo: tipo, versões, lentes, operador, classe e parâmetros. */
export function configuracaoDe(r: ResultadoComparavel): string {
  if (ehCombinacao(r)) {
    return JSON.stringify({ tipo: 'combinacao', versoes: [r.versao_combinacao, r.versao_metodo], lentes: r.lentes, operador: r.operador, parametros: r.parametros });
  }
  if (ehSobreposicao(r)) return JSON.stringify({ tipo: 'sobreposicao', versoes: [r.versao_metodo], classe: r.classe, parametros: r.parametros });
  return JSON.stringify({ tipo: r.lente, versoes: [r.versao_metodo], parametros: r.parametros });
}

/** Lentes da configuração (para a ressalva de meses tocados da recorrência, CP-15). */
export function lentesDe(r: ResultadoComparavel): (TipoLente | 'sobreposicao')[] {
  if (ehCombinacao(r)) return [...r.lentes];
  return [r.lente];
}

/**
 * Os dois lados são aplicações da mesma carga e configuração. Na comparação temporal, só a janela difere (mesmo
 * recorte); na municipal, só o município (mesma janela). Qualquer outra divergência recusa o pedido.
 */
export function conferirIdentidade(tipo: 'temporal' | 'municipal', a: ResultadoComparavel, b: ResultadoComparavel): void {
  if (a.carga.id !== b.carga.id || a.carga.identidade !== b.carga.identidade) recusar('os lados são de versões de dados diferentes');
  if (configuracaoDe(a) !== configuracaoDe(b)) recusar('os lados têm lente, versão ou parâmetros diferentes');
  if (tipo === 'temporal') {
    if (a.recorte.tipo !== b.recorte.tipo || a.recorte.municipio !== b.recorte.municipio) recusar('os períodos precisam do mesmo recorte');
    return;
  }
  if (a.janela.inicio !== b.janela.inicio || a.janela.fim !== b.janela.fim) recusar('os municípios precisam do mesmo período');
  if (a.recorte.tipo !== 'municipio' || b.recorte.tipo !== 'municipio') recusar('a comparação de municípios usa o recorte de cada município');
}

// --- Unidades de cada lado -------------------------------------------------------------------------------------

/** Destaque original como a lente o produziu, preservado por lado (CP-1, CP-2). */
export interface EvidenciaOriginal {
  id_destaque: string;
  motivo: string;
  deteccoes: string[];
  datas: string[];
  ressalvas: string[];
}

/** Unidade destacada num lado: a identidade é o município (código IBGE) ou a célula T1, nunca o id do destaque. */
export interface UnidadeLado {
  chave: string;
  unidade: Unidade;
  destaques: EvidenciaOriginal[];
  municipios: number[];
  cobertura: Cobertura;
}

export const chaveUnidade = (u: Unidade): string => (u.tipo === 'municipio' ? `municipio:${u.codigo}` : `celula:${u.id}`);

const evidenciaDaCelula = (c: CelulaCombinada): EvidenciaOriginal[] => c.criterios.flatMap((cr) => cr.destaques.map((d) => ({
  id_destaque: d.id_destaque, motivo: d.motivo, deteccoes: [...d.evidencia.deteccoes], datas: [...d.evidencia.datas],
  ressalvas: [...cr.ressalvas, ...d.ressalvas],
})));

/** Unidades destacadas de um resultado, na ordem da lente; duas sequências na mesma célula são uma unidade (T1). */
export function unidadesDe(r: ResultadoComparavel): UnidadeLado[] {
  const porChave = new Map<string, UnidadeLado>();
  if (ehCombinacao(r)) {
    for (const c of r.celulas) {
      porChave.set(chaveUnidade(c.unidade), {
        chave: chaveUnidade(c.unidade), unidade: c.unidade, destaques: evidenciaDaCelula(c), municipios: [...c.municipios], cobertura: c.cobertura,
      });
    }
    return [...porChave.values()];
  }
  for (const d of r.destaques) {
    const chave = chaveUnidade(d.unidade);
    const evidencia: EvidenciaOriginal = {
      id_destaque: d.id_destaque, motivo: d.motivo, deteccoes: [...d.evidencia.deteccoes], datas: [...d.evidencia.datas], ressalvas: [...d.ressalvas],
    };
    const existente = porChave.get(chave);
    if (existente) existente.destaques.push(evidencia);
    else porChave.set(chave, { chave, unidade: d.unidade, destaques: [evidencia], municipios: [...d.cobertura.municipios], cobertura: d.cobertura });
  }
  return [...porChave.values()];
}

/** Aplicação sem resultado nesta janela (recorrência insuficiente, combinação indisponível, camada ausente). */
export function indisponibilidadeDe(r: ResultadoComparavel): string[] | null {
  if (ehCombinacao(r)) return r.estado === 'indisponivel' ? r.indisponibilidade.map((x) => x.texto) : null;
  if (ehSobreposicao(r)) return r.estado === 'sem_camada' ? [TEXTO_SEM_CAMADA] : null;
  if (r.estado === 'janela_insuficiente') return [r.observacoes[0] ?? 'janela insuficiente'];
  return null;
}

// --- Zero, ausência e disponibilidade (T3) ---------------------------------------------------------------------

/** Conferência da disponibilidade de todos os municípios do recorte de um lado com zero detecção (CP-13, CP-17). */
export type ConferenciaZero =
  | { estado: 'nao_necessaria' }
  | { estado: 'pendente'; feitos: number; total: number }
  | { estado: 'falha'; motivo: string }
  | { estado: 'cancelada' }
  | { estado: 'completa'; lacunaTotal: boolean; diasRestritivos: boolean };

/**
 * Estado da conferência a partir da disponibilidade lida: completa só com todos os municípios e todos os dias
 * conferidos. Lacuna total exige lacuna conhecida em todos os dias de todos os municípios do recorte (D9).
 */
export function conferirZero(municipios: readonly number[], janela: Janela, disp: ReadonlyMap<number, DisponibilidadeMunicipio>): ConferenciaZero {
  const dias = diasDaJanela(janela);
  let feitos = 0;
  let todosLacuna = true;
  let restritivos = false;
  for (const codigo of municipios) {
    const d = disp.get(codigo);
    if (!d) continue;
    if (d.estado === 'falha') return { estado: 'falha', motivo: d.motivo };
    feitos += 1;
    for (const dia of dias) {
      const x = d.dias.get(dia);
      if (!x) return { estado: 'falha', motivo: 'leitura incompleta' };
      if (x.classe !== 'lacuna_conhecida') todosLacuna = false;
      if (x.classe !== 'sem_evidencia_de_lacuna') restritivos = true;
    }
  }
  if (feitos < municipios.length) return { estado: 'pendente', feitos, total: municipios.length };
  return { estado: 'completa', lacunaTotal: municipios.length > 0 && todosLacuna, diasRestritivos: restritivos };
}

/** Disponibilidade da célula num lado: avaliada pela cobertura do destaque; sem detecções no lado, não avaliável (D9). */
export type DisponibilidadeCelula = { estado: 'avaliada'; cobertura: Cobertura } | { estado: 'nao_avaliavel' };

export const TEXTO_NAO_AVALIAVEL = 'disponibilidade da célula não avaliável';

export type Conclusao =
  | { estado: 'conclusiva' }
  | { estado: 'aguardando_disponibilidade'; lados: Lado[] }
  | { estado: 'indisponivel'; motivo: 'aplicacao_indisponivel' | 'lacuna_total' | 'falha_conferencia'; textos: string[] };

export const TEXTO_AGUARDANDO = 'Conclusão aguardando disponibilidade';

interface EntradaConclusao {
  lado: Lado;
  resultado: ResultadoComparavel | null;
  zero: ConferenciaZero;
}

/**
 * Precedência: aplicação indisponível (CP-6) → lacuna total comprovada (CP-11, CP-13) → falha ou cancelamento da
 * conferência (CP-17, distinto de lacuna) → conferência pendente → conclusiva. Os fatos de cada lado continuam à parte.
 */
export function concluir(lados: readonly EntradaConclusao[]): Conclusao {
  const textosAplicacao = lados.flatMap((l) => {
    const t = l.resultado ? indisponibilidadeDe(l.resultado) : null;
    return t ? t.map((x) => `Lado ${l.lado}: ${x}`) : [];
  });
  if (textosAplicacao.length) return { estado: 'indisponivel', motivo: 'aplicacao_indisponivel', textos: textosAplicacao };
  const lacuna = lados.filter((l) => l.zero.estado === 'completa' && l.zero.lacunaTotal);
  if (lacuna.length) {
    return {
      estado: 'indisponivel', motivo: 'lacuna_total',
      textos: lacuna.map((l) => `Lado ${l.lado}: zero detecção com lacuna conhecida em todos os dias de todos os municípios do recorte.`),
    };
  }
  const falhas = lados.filter((l) => l.zero.estado === 'falha' || l.zero.estado === 'cancelada');
  if (falhas.length) {
    return {
      estado: 'indisponivel', motivo: 'falha_conferencia',
      textos: falhas.map((l) => `Lado ${l.lado}: a conferência da disponibilidade não terminou; isso não comprova lacuna.`),
    };
  }
  const pendentes = lados.filter((l) => l.zero.estado === 'pendente').map((l) => l.lado);
  if (pendentes.length) return { estado: 'aguardando_disponibilidade', lados: pendentes };
  return { estado: 'conclusiva' };
}

function ressalvasDeZero(lado: Lado, zero: ConferenciaZero): string[] {
  if (zero.estado !== 'completa' || zero.lacunaTotal) return [];
  const r = [`Lado ${lado}: zero detecção observada; não é evidência de ausência de fogo nem, sozinho, de ausência de dados.`];
  if (zero.diasRestritivos) r.push(`Lado ${lado}: há dias com lacuna conhecida ou incidência indeterminada; o zero não indica ausência real.`);
  return r;
}

// --- Comparação de períodos (T1, T3) ---------------------------------------------------------------------------

export type Classificacao = 'entrou' | 'saiu' | 'permaneceu';

export const ROTULO_CLASSIFICACAO: Record<Classificacao, string> = {
  entrou: 'entrou nos destaques observados',
  saiu: 'saiu dos destaques observados',
  permaneceu: 'permaneceu nos destaques observados',
};

export interface ItemTemporal {
  chave: string;
  unidade: Unidade;
  classificacao: Classificacao;
  a: UnidadeLado | null;
  b: UnidadeLado | null;
  disponibilidadeA: DisponibilidadeCelula;
  disponibilidadeB: DisponibilidadeCelula;
}

export interface LadoTemporal {
  janela: Janela;
  /** `principal.total` do recorte nesse período, conferido pelo carregador. */
  total: number;
  /** Resultado da lente nesse lado; `null` sem lente escolhida (só contagens). */
  resultado: ResultadoComparavel | null;
  zero: ConferenciaZero;
}

export interface ComparacaoTemporal {
  versao: typeof VERSAO_COMPARACAO;
  tipo: 'temporal';
  a: { janela: Janela; total: number; unidades: UnidadeLado[] };
  b: { janela: Janela; total: number; unidades: UnidadeLado[] };
  validacao: ValidacaoPeriodos;
  /** Meses GMT tocados por lado, quando a configuração inclui a recorrência (CP-15). */
  meses: { a: MesJanela[]; b: MesJanela[] } | null;
  conclusao: Conclusao;
  /** Vazio sem conclusão comparativa: entrada, saída e diferença ficam suspensas. */
  itens: ItemTemporal[];
  contagem: Record<Classificacao, number>;
  /** B − A do total principal; `null` sem conclusão comparativa. */
  diferencaTotal: number | null;
  ressalvas: string[];
}

export const RESSALVA_OBSERVADOS =
  'Compara destaques observados em cada período; entrar ou sair não indica mudança real do fenômeno, causa ou autoria.';
export const RESSALVA_MESES = 'Mesma duração, mas quantidades diferentes de meses GMT tocados; a comparação não normaliza esse efeito';

const disponibilidadeDe = (u: UnidadeLado | null): DisponibilidadeCelula =>
  (u ? { estado: 'avaliada', cobertura: u.cobertura } : { estado: 'nao_avaliavel' });

/** Compara dois períodos no mesmo recorte e configuração (já conferidos por `validarPeriodos`). */
export function compararPeriodos(a: LadoTemporal, b: LadoTemporal, validacao: ValidacaoPeriodos): ComparacaoTemporal {
  if ((a.resultado === null) !== (b.resultado === null)) recusar('só um dos lados tem lente');
  if (a.resultado && b.resultado) conferirIdentidade('temporal', a.resultado, b.resultado);
  const unidadesA = a.resultado ? unidadesDe(a.resultado) : [];
  const unidadesB = b.resultado ? unidadesDe(b.resultado) : [];
  const conclusao = concluir([{ lado: 'A', ...a }, { lado: 'B', ...b }]);
  const ressalvas = [RESSALVA_OBSERVADOS];
  if (validacao.coincidentes) ressalvas.push('Períodos idênticos: os dois lados usam os mesmos dados.');
  else if (validacao.diasEmComum.length) {
    const d = validacao.diasEmComum;
    ressalvas.push(`Os períodos compartilham ${d.length} ${d.length === 1 ? 'dia' : 'dias'} (${dataBr(d[0] ?? '')} a ${dataBr(d.at(-1) ?? '')}); cada lado é uma aplicação independente e as contagens não se somam.`);
  }
  let meses: ComparacaoTemporal['meses'] = null;
  if (a.resultado && lentesDe(a.resultado).includes('recorrencia')) {
    meses = { a: mesesDaJanela(a.janela), b: mesesDaJanela(b.janela) };
    if (meses.a.length !== meses.b.length) ressalvas.push(RESSALVA_MESES);
  }
  ressalvas.push(...ressalvasDeZero('A', a.zero), ...ressalvasDeZero('B', b.zero));

  const itens: ItemTemporal[] = [];
  if (conclusao.estado === 'conclusiva') {
    const deA = new Map(unidadesA.map((u) => [u.chave, u]));
    const deB = new Map(unidadesB.map((u) => [u.chave, u]));
    // Ordem: as de A na ordem da lente; depois as que só aparecem em B, na ordem da lente.
    for (const u of [...unidadesA, ...unidadesB.filter((x) => !deA.has(x.chave))]) {
      const ua = deA.get(u.chave) ?? null;
      const ub = deB.get(u.chave) ?? null;
      itens.push({
        chave: u.chave, unidade: u.unidade, classificacao: ua && ub ? 'permaneceu' : ua ? 'saiu' : 'entrou',
        a: ua, b: ub, disponibilidadeA: disponibilidadeDe(ua), disponibilidadeB: disponibilidadeDe(ub),
      });
    }
  }
  const contagem: Record<Classificacao, number> = { entrou: 0, saiu: 0, permaneceu: 0 };
  for (const i of itens) contagem[i.classificacao] += 1;
  return {
    versao: VERSAO_COMPARACAO, tipo: 'temporal',
    a: { janela: a.janela, total: a.total, unidades: unidadesA },
    b: { janela: b.janela, total: b.total, unidades: unidadesB },
    validacao, meses, conclusao, itens, contagem,
    diferencaTotal: conclusao.estado === 'conclusiva' ? b.total - a.total : null,
    ressalvas,
  };
}

// --- Comparação de municípios (T2) -----------------------------------------------------------------------------

export type Presenca = 'so_a' | 'so_b' | 'nos_dois';

export const ROTULO_PRESENCA: Record<Presenca, string> = {
  so_a: 'destacada só no município A',
  so_b: 'destacada só no município B',
  nos_dois: 'destacada nos dois municípios (célula de divisa, registros diferentes)',
};

export interface ItemMunicipal {
  chave: string;
  unidade: Unidade;
  presenca: Presenca;
  a: UnidadeLado | null;
  b: UnidadeLado | null;
}

export interface LadoMunicipal {
  codigo: number;
  nome: string;
  numeros: NumerosMunicipio;
  resultado: ResultadoComparavel | null;
  zero: ConferenciaZero;
}

export interface ComparacaoMunicipal {
  versao: typeof VERSAO_COMPARACAO;
  tipo: 'municipal';
  janela: Janela;
  mesmoMunicipio: boolean;
  a: { codigo: number; nome: string; numeros: NumerosMunicipio; unidades: UnidadeLado[] };
  b: { codigo: number; nome: string; numeros: NumerosMunicipio; unidades: UnidadeLado[] };
  conclusao: Conclusao;
  /** B − A; `null` sem conclusão comparativa (e células `null` enquanto a leitura completa não terminou). */
  diferenca: { focos: number; dias: number; celulas: number | null } | null;
  itens: ItemMunicipal[];
  ressalvas: string[];
}

export const RESSALVA_ABSOLUTA =
  'Contagens absolutas: municípios maiores tendem a ter mais detecções; a diferença não é taxa, gravidade, risco nem causa.';
export const RESSALVA_DIVISA =
  'Uma célula na divisa pode aparecer nos dois municípios, cada um com os próprios registros; não se soma como célula única.';

/** Compara dois municípios no mesmo período (T2), com os números e as lentes calculados em cada recorte municipal. */
export function compararMunicipios(janela: Janela, a: LadoMunicipal, b: LadoMunicipal): ComparacaoMunicipal {
  if ((a.resultado === null) !== (b.resultado === null)) recusar('só um dos lados tem lente');
  if (a.resultado && b.resultado) conferirIdentidade('municipal', a.resultado, b.resultado);
  const unidadesA = a.resultado ? unidadesDe(a.resultado) : [];
  const unidadesB = b.resultado ? unidadesDe(b.resultado) : [];
  const conclusao = concluir([{ lado: 'A', ...a }, { lado: 'B', ...b }]);
  const mesmo = a.codigo === b.codigo;
  const ressalvas = [RESSALVA_ABSOLUTA, RESSALVA_DIVISA];
  if (mesmo) ressalvas.unshift('O mesmo município foi escolhido nos dois lados: resultados idênticos e diferença zero.');
  ressalvas.push(...ressalvasDeZero('A', a.zero), ...ressalvasDeZero('B', b.zero));
  const itens: ItemMunicipal[] = [];
  const deA = new Map(unidadesA.map((u) => [u.chave, u]));
  const deB = new Map(unidadesB.map((u) => [u.chave, u]));
  for (const u of [...unidadesA, ...unidadesB.filter((x) => !deA.has(x.chave))]) {
    const ua = deA.get(u.chave) ?? null;
    const ub = deB.get(u.chave) ?? null;
    itens.push({ chave: u.chave, unidade: u.unidade, presenca: ua && ub ? 'nos_dois' : ua ? 'so_a' : 'so_b', a: ua, b: ub });
  }
  const celulas = a.numeros.celulas === null || b.numeros.celulas === null ? null : b.numeros.celulas - a.numeros.celulas;
  return {
    versao: VERSAO_COMPARACAO, tipo: 'municipal', janela, mesmoMunicipio: mesmo,
    a: { codigo: a.codigo, nome: a.nome, numeros: a.numeros, unidades: unidadesA },
    b: { codigo: b.codigo, nome: b.nome, numeros: b.numeros, unidades: unidadesB },
    conclusao,
    diferenca: conclusao.estado === 'conclusiva'
      ? { focos: b.numeros.focos - a.numeros.focos, dias: b.numeros.dias - a.numeros.dias, celulas }
      : null,
    itens, ressalvas,
  };
}

// --- Disponibilidade por município, sem agregação (T3, CP-10, CP-12, CM-4) --------------------------------------

export type DisponibilidadeDoMunicipio =
  | { codigo: number; estado: 'pendente' }
  | { codigo: number; estado: 'falha'; motivo: string }
  | { codigo: number; estado: 'completa'; dias: number; porClasse: Record<ClasseDisponibilidade, number>; indisponivel: boolean };

/** Uma linha por município, preservando as classes; nunca um "N de M" da célula. */
export function disponibilidadePorMunicipio(
  municipios: readonly number[],
  janela: Janela,
  disp: ReadonlyMap<number, DisponibilidadeMunicipio>,
): DisponibilidadeDoMunicipio[] {
  const dias = diasDaJanela(janela);
  return municipios.map((codigo): DisponibilidadeDoMunicipio => {
    const d = disp.get(codigo);
    if (!d) return { codigo, estado: 'pendente' };
    if (d.estado === 'falha') return { codigo, estado: 'falha', motivo: d.motivo };
    const porClasse: Record<ClasseDisponibilidade, number> = { sem_evidencia_de_lacuna: 0, incidencia_indeterminada: 0, lacuna_conhecida: 0 };
    for (const dia of dias) {
      const x = d.dias.get(dia);
      if (!x) return { codigo, estado: 'falha', motivo: 'leitura incompleta' };
      porClasse[x.classe] += 1;
    }
    return { codigo, estado: 'completa', dias: dias.length, porClasse, indisponivel: porClasse.lacuna_conhecida === dias.length };
  });
}

/** "6 de 10 dias sem evidência de lacuna, 4 com incidência indeterminada (cobertura não comprovada)". */
export function textoDisponibilidadeMunicipio(x: DisponibilidadeDoMunicipio): string {
  if (x.estado === 'pendente') return 'disponibilidade: carregando';
  if (x.estado === 'falha') return `disponibilidade não verificada: ${x.motivo}`;
  if (x.indisponivel) return `lacuna conhecida em todos os ${x.dias} dias: comparação indisponível para este município`;
  const partes = [`${x.porClasse.sem_evidencia_de_lacuna} de ${x.dias} dias sem evidência de lacuna`];
  if (x.porClasse.incidencia_indeterminada) partes.push(`${x.porClasse.incidencia_indeterminada} com incidência indeterminada`);
  if (x.porClasse.lacuna_conhecida) partes.push(`${x.porClasse.lacuna_conhecida} com lacuna conhecida`);
  return `${partes.join(', ')} (cobertura não comprovada)`;
}

/**
 * Leituras de disponibilidade por lado (T3, CP-16): no resultado inicial, só os municípios dos destaques e, num lado
 * com zero detecção, todos os municípios do recorte; com a lista completa pedida, todos os municípios nos dois lados.
 * Sem repetir o que já foi lido.
 */
export function leiturasDeDisponibilidade(
  lados: readonly { lado: Lado; destaques: readonly number[]; zero: boolean; lidos: ReadonlySet<number> }[],
  recorte: readonly number[],
  listaCompleta: boolean,
): { lado: Lado; codigo: number }[] {
  const pedidos: { lado: Lado; codigo: number }[] = [];
  for (const l of lados) {
    const codigos = listaCompleta || l.zero ? [...recorte] : [...new Set(l.destaques)].sort((x, y) => x - y);
    for (const codigo of codigos) if (!l.lidos.has(codigo)) pedidos.push({ lado: l.lado, codigo });
  }
  return pedidos;
}

// --- Contexto estadual na comparação de municípios (T2, D8, CM-3, CM-6) ----------------------------------------

export interface ContextoConcentracao {
  tipo: 'concentracao';
  /** Contagem do último município destacado (corte com empatados), ou `null` sem destaques. */
  corte: number | null;
  destacados: number;
  observacoes: string[];
  municipios: { lado: Lado; codigo: number; nome: string; total: number; posicao: number | null }[];
}

/**
 * Participação de A e B no resultado estadual da concentração, sem recalcular o top 10 sobre o par (CM-3). `total` é a
 * contagem do município no mesmo conjunto estadual.
 */
export function contextoConcentracao(
  r: ResultadoLente,
  contagens: ReadonlyMap<number, number>,
  escolhidos: readonly { lado: Lado; codigo: number; nome: string }[],
): ContextoConcentracao {
  if (r.lente !== 'concentracao' || r.recorte.tipo !== 'estado') recusar('o contexto estadual usa a concentração em todo Mato Grosso');
  const posicoes = new Map(r.destaques.flatMap((d) => (d.unidade.tipo === 'municipio' ? [[d.unidade.codigo, d.ordem ?? null] as const] : [])));
  return {
    tipo: 'concentracao',
    corte: r.destaques.at(-1)?.evidencia.valor ?? null,
    destacados: r.destaques.length,
    observacoes: [...r.observacoes],
    municipios: escolhidos.map((m) => ({ ...m, total: contagens.get(m.codigo) ?? 0, posicao: posicoes.get(m.codigo) ?? null })),
  };
}

export interface ContextoCombinacao {
  tipo: 'combinacao';
  celulas: { celula: CelulaCombinada; lados: Lado[] }[];
}

export const RESSALVA_CONTEXTO_COMBINACAO =
  'Seleção estadual: a célula pode ser sustentada também por detecções de outros municípios; a lista só mostra as células com detecções de A ou B.';

/**
 * Combinação com concentração em todo Mato Grosso (T2): as células com detecção de A ou B, com os critérios originais.
 * Filtrar o detalhamento não recalcula nem muda a seleção estadual.
 */
export function contextoCombinacao(
  r: ResultadoCombinacao,
  registros: ReadonlyMap<string, RegistroLente>,
  escolhidos: readonly { lado: Lado; codigo: number }[],
): ContextoCombinacao {
  if (r.recorte.tipo !== 'estado') recusar('o contexto estadual usa a combinação em todo Mato Grosso');
  const celulas: ContextoCombinacao['celulas'] = [];
  for (const c of r.celulas) {
    const municipios = new Set(c.evidencia.deteccoes.map((id) => registros.get(id)?.municipio_codigo));
    const lados = escolhidos.filter((m) => municipios.has(m.codigo)).map((m) => m.lado);
    if (lados.length) celulas.push({ celula: c, lados: [...new Set(lados)] });
  }
  return { tipo: 'combinacao', celulas };
}
