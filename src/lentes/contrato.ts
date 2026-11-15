// Contrato de lente de seleção C1 (plano 004, KB do ciclo 004). Todo resultado é função pura de:
// carga, janela, parâmetros fixos, registros principais da janela e disponibilidade dos municípios.
// Mesma entrada, mesma saída, com ordem estável. Destaques orientam avaliação técnica; não comprovam
// incêndio, dano, autoria ou infração.
import type { ClasseDisponibilidade } from '../tipos.ts';

/** Muda junto com qualquer parâmetro ou regra (nova decisão de G1 e novo plano). */
export const VERSAO_METODO = 'lentes-007-v1';

export type TipoLente = 'concentracao' | 'recorrencia' | 'persistencia';

/** Registro principal da janela, como devolvido por `consultar_deteccoes`. */
export interface RegistroLente {
  id_tecnico: string;
  data_hora_gmt: string;
  latitude: number;
  longitude: number;
  municipio_codigo: number;
}

/** Dia de disponibilidade D1 de um município, já validado pela integridade T3. */
export interface DiaLente {
  dia: string;
  classe: ClasseDisponibilidade;
  motivos: string[];
}

/** Disponibilidade por município: dias validados, ou a falha de leitura daquele município. */
export type DisponibilidadeMunicipio = { estado: 'ok'; dias: Map<string, DiaLente> } | { estado: 'falha'; motivo: string };

export interface Janela {
  inicio: string;
  fim: string;
}

/**
 * Recorte da entrada (plano 007, T1): o estado inteiro ou um município (código IBGE). No recorte municipal, a lente
 * usa só as detecções do município no período; nenhum cálculo muda, só o conjunto de entrada.
 */
export type Recorte = { tipo: 'estado'; municipio: null } | { tipo: 'municipio'; municipio: number };

export const RECORTE_ESTADUAL: Recorte = { tipo: 'estado', municipio: null };

/** Recorte de um código de município (`null` é o estado inteiro). */
export const recorteDe = (municipio: number | null | undefined): Recorte =>
  municipio == null ? { tipo: 'estado', municipio: null } : { tipo: 'municipio', municipio };

export interface CargaLente {
  id: number;
  identidade: string;
}

export type Unidade =
  | { tipo: 'municipio'; codigo: number; nome: string }
  | { tipo: 'celula_005'; id: string; sul: string; oeste: string; norte: string; leste: string };

/** Dia que não está `sem_evidencia_de_lacuna`, com a classe da unidade (T7) e a de cada município. */
export interface DiaRestritivo {
  dia: string;
  classe: Exclude<ClasseDisponibilidade, 'sem_evidencia_de_lacuna'>;
  municipios: { codigo: number; classe: ClasseDisponibilidade; motivos: string[] }[];
}

export type Cobertura =
  | { estado: 'pendente'; municipios: number[] }
  | { estado: 'falha'; municipios: number[]; motivo: string }
  | {
    estado: 'completa';
    municipios: number[];
    dias_janela: number;
    dias_sem_evidencia_de_lacuna: number;
    demais_dias: DiaRestritivo[];
  };

export interface Destaque {
  /** Lente + unidade (+ dia inicial na persistência). Com carga, janela e versão, chave para a combinação futura. */
  id_destaque: string;
  unidade: Unidade;
  motivo: string;
  evidencia: { deteccoes: string[]; valor: number; datas: string[] };
  ordem?: number;
  cobertura: Cobertura;
  ressalvas: string[];
}

export interface Parametro {
  nome: string;
  valor: string;
}

/** Mês GMT tocado pela janela (D14): `inicio` e `fim` são os dias da janela dentro do mês. */
export interface MesJanela {
  mes: string;
  parcial: boolean;
  inicio: string;
  fim: string;
}

export interface ResultadoLente {
  lente: TipoLente;
  versao_metodo: string;
  carga: CargaLente;
  /** Na recorrência, `meses` traz os meses GMT tocados, com a marca de parcial (D14). */
  janela: Janela & { referencia: 'dias GMT inclusivos'; meses?: MesJanela[] };
  recorte: Recorte;
  parametros: Parametro[];
  estado: 'com_destaques' | 'sem_destaques' | 'janela_insuficiente';
  ordenacao: null | { criterio: string; rotulo: string };
  /** Observações sobre o corte (por exemplo, empatados incluídos). */
  observacoes: string[];
  destaques: Destaque[];
  conferencia: { registros_lidos: number; ids_distintos: number; total_resumo: number };
  limitacoes: string[];
}

/** Entrada comum das lentes: registros já lidos e conferidos pelo carregador. */
export interface EntradaLente {
  carga: CargaLente;
  janela: Janela;
  registros: RegistroLente[];
  totalResumo: number;
  nomes: Map<number, string>;
  /** Ausente é o estado inteiro (T1). */
  recorte?: Recorte;
}

/** Leitura inconsistente: a lente não é exibida (sem destaques parciais). */
export class ErroLente extends Error {
  readonly tipo = 'leitura_inconsistente' as const;
}

export const AVISO_DOMINIO =
  'Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração.';

export const LIMITACOES_COMUNS = [
  AVISO_DOMINIO,
  'Contagem principal em dias GMT; a sensibilidade America/Cuiaba aparece só no resumo da consulta.',
  'Disponibilidade não comprova cobertura.',
];

/** Limitações das lentes por célula (Q3, D13). */
export const LIMITACOES_CELULA = [
  'Focos vizinhos em células diferentes não são lidos como o mesmo local; a célula não segue divisas.',
  'A cobertura da célula usa os municípios das detecções, não a área da célula.',
];

/** Limitação do resultado no recorte municipal (T5). */
export const limitacaoRecorte = (nomeMunicipio: string): string =>
  `Células na divisa podem perder destaque, porque só contam os focos de ${nomeMunicipio}.`;

/** Limitações extras do recorte: nenhuma no estado; a da divisa no município (T5). */
export function limitacoesDoRecorte(e: EntradaLente): string[] {
  const r = e.recorte ?? RECORTE_ESTADUAL;
  if (r.tipo === 'estado') return [];
  return [limitacaoRecorte(e.nomes.get(r.municipio) ?? `município ${r.municipio}`)];
}

export const ROTULO_ORDENACAO = 'ordenado por contagem de detecções, não por prioridade, gravidade ou risco';
