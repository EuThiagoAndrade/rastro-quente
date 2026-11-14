// Leitor das áreas protegidas e dos vínculos (plano 006, T25, R2-3, R3-1). Lê a linha da carga fixada,
// pagina `areas` e `deteccoes_areas` pela chave primária completa, com contagem exata, e confere cada página
// contra os totais declarados na carga. Nunca devolve resultado parcial: divergência é "leitura
// inconsistente" (ErroLente) e a ausência da linha da carga é diagnosticada pela sondagem de acesso e pela
// publicação vigente, porque a RLS a oculta tanto na perda de acesso quanto na troca de versão.
// Módulo puro: a rede fica nas fontes injetadas, como em `carregar.ts`.
import { ErroConsulta } from '../erros.ts';
import { ErroLente } from './contrato.ts';

export const LIMITE_PAGINA_AREAS = 1000;

export type FonteArea = 'cnuc' | 'funai';
export type ClasseArea = 'protecao_integral' | 'uso_sustentavel' | 'terra_indigena';
export type PosicaoVinculo = 'interior' | 'borda';

/** Linha da carga fixada, com os totais da camada (nulos numa carga sem camada). */
export interface CargaAreas {
  id: number;
  identidade: string;
  total_areas: number | null;
  total_vinculos_area: number | null;
}

/** Atributos guardados de uma área (T17); a geometria geral só vem quando pedida (camada). */
export interface AreaLida {
  carga_id: number;
  fonte: FonteArea;
  codigo: string;
  nome: string;
  classe: ClasseArea;
  categoria: string | null;
  fase: string | null;
  modalidade: string | null;
  esfera: string | null;
  qualidade: string | null;
  geometria_geral?: unknown;
}

export interface VinculoLido {
  carga_id: number;
  id_tecnico: string;
  area_fonte: FonteArea;
  area_codigo: string;
  posicao: PosicaoVinculo;
}

/**
 * Página de uma tabela: as linhas e a contagem exata informada pela API. `fora_da_faixa` é a resposta HTTP 416
 * (`PGRST103`, deslocamento além do total visível), que conta como página curta (R3-1).
 */
export type PaginaTabela<T> = { linhas: T[]; total: number } | { fora_da_faixa: true };

export interface FontesAreas {
  /** Linha da carga em `cargas`; `null` quando a RLS não a mostra. */
  carga(id: number): Promise<CargaAreas | null>;
  /** Página de `areas` da carga, ordenada por (carga_id, fonte, codigo). */
  areas(carga: number, deslocamento: number, limite: number, comGeometria: boolean): Promise<PaginaTabela<AreaLida>>;
  /** Página de `deteccoes_areas` da carga, ordenada por (carga_id, id_tecnico, area_fonte, area_codigo). */
  vinculos(carga: number, deslocamento: number, limite: number): Promise<PaginaTabela<VinculoLido>>;
  /** Sondagem existente (`sondarAcesso`): erro de sessão propaga como ErroConsulta. */
  sondar(): Promise<'negado' | 'sem_publicacao' | 'autorizado'>;
  /** Carga da publicação vigente; `null` se não houver linha visível. */
  vigente(): Promise<number | null>;
}

export type LeituraAreas =
  | { estado: 'sem_camada'; carga: CargaAreas }
  | { estado: 'completa'; carga: CargaAreas; areas: AreaLida[]; vinculos: VinculoLido[] };

/** Anomalia que exige reler a linha da carga antes de decidir (T25, passo 4). */
class Anomalia extends Error {}

export const chaveArea = (fonte: string, codigo: string): string => `${fonte}:${codigo}`;
const chaveVinculo = (v: VinculoLido): string => `${v.id_tecnico}|${chaveArea(v.area_fonte, v.area_codigo)}`;

/**
 * Diagnóstico da ausência da linha da carga (R2-3): `negado` → acesso_negado; `sem_publicacao` → sem_publicacao;
 * `autorizado` com vigente diferente → versao_substituida; com vigente igual → leitura inconsistente.
 */
export async function diagnosticarAusencia(fontes: FontesAreas, carga: number): Promise<never> {
  const acesso = await fontes.sondar();
  if (acesso === 'negado') throw new ErroConsulta('acesso_negado', 'linha da carga oculta: acesso negado');
  if (acesso === 'sem_publicacao') throw new ErroConsulta('sem_publicacao', 'linha da carga oculta: sem publicação');
  const vigente = await fontes.vigente();
  if (vigente !== carga) throw new ErroConsulta('versao_substituida', 'carga fixada deixou de ser a vigente');
  throw new ErroLente('linha da carga vigente oculta');
}

/** Lê todas as páginas de uma tabela, conferindo total, tamanho, carga e unicidade (T25, passo 3). */
async function lerTabela<T extends { carga_id: number }>(
  carga: number,
  declarado: number,
  pagina: (deslocamento: number) => Promise<PaginaTabela<T>>,
  chave: (x: T) => string,
  atual: () => boolean,
): Promise<T[] | null> {
  const linhas: T[] = [];
  const vistas = new Set<string>();
  for (let desloc = 0; desloc < declarado || desloc === 0; desloc += LIMITE_PAGINA_AREAS) {
    const pg = await pagina(desloc);
    if (!atual()) return null;
    if ('fora_da_faixa' in pg) throw new Anomalia('página fora da faixa (416)');
    if (pg.total !== declarado) throw new Anomalia(`total ${pg.total} diferente do declarado ${declarado}`);
    if (pg.linhas.length !== Math.min(LIMITE_PAGINA_AREAS, Math.max(0, declarado - desloc))) {
      throw new Anomalia(`página com ${pg.linhas.length} linhas no deslocamento ${desloc}`);
    }
    for (const x of pg.linhas) {
      if (x.carga_id !== carga) throw new ErroLente('linha de outra carga');
      const k = chave(x);
      if (vistas.has(k)) throw new Anomalia(`chave repetida: ${k}`);
      vistas.add(k);
      linhas.push(x);
    }
    if (declarado === 0) break;
  }
  return linhas;
}

/**
 * Lê a camada de áreas da carga fixada (T25). `comGeometria` inclui a geometria geral (camada); a lente lê só os
 * atributos. Devolve `null` se a aplicação foi invalidada no meio. Erros de chamada (ErroConsulta) propagam com o
 * tipo; o diagnóstico da ausência lança ErroConsulta de destino global ou de versão; divergências viram ErroLente.
 */
export async function lerAreas(
  fontes: FontesAreas,
  carga: number,
  atual: () => boolean,
  comGeometria = false,
): Promise<LeituraAreas | null> {
  const linha = await fontes.carga(carga);
  if (!atual()) return null;
  if (linha === null) return diagnosticarAusencia(fontes, carga);
  if (linha.id !== carga) throw new ErroLente('linha de outra carga');
  const { total_areas: tA, total_vinculos_area: tV } = linha;
  if (tA === null && tV === null) return { estado: 'sem_camada', carga: linha };
  if (tA === null || tV === null) throw new ErroLente('totais da camada com nulidade parcial');
  try {
    const areas = await lerTabela(carga, tA, (d) => fontes.areas(carga, d, LIMITE_PAGINA_AREAS, comGeometria),
      (a) => chaveArea(a.fonte, a.codigo), atual);
    if (areas === null) return null;
    const vinculos = await lerTabela(carga, tV, (d) => fontes.vinculos(carga, d, LIMITE_PAGINA_AREAS), chaveVinculo, atual);
    if (vinculos === null) return null;
    const chaves = new Set(areas.map((a) => chaveArea(a.fonte, a.codigo)));
    for (const v of vinculos) {
      if (!chaves.has(chaveArea(v.area_fonte, v.area_codigo))) throw new ErroLente(`vínculo para área não lida: ${chaveVinculo(v)}`);
    }
    return { estado: 'completa', carga: linha, areas, vinculos };
  } catch (x) {
    if (!(x instanceof Anomalia)) throw x;
    // Passo 4: página curta, total divergente ou chave repetida → relê a linha da carga.
    const releitura = await fontes.carga(carga);
    if (!atual()) return null;
    if (releitura === null) return diagnosticarAusencia(fontes, carga);
    throw new ErroLente(`leitura inconsistente das áreas: ${x.message}`);
  }
}
