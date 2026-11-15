// Aba Municípios (plano 007, T11): números do cartão do município e ordenação da lista estadual. Lógica pura, sem
// DOM. Unidade do que se conta (R2-2): sempre células distintas da grade T1, nunca destaques ou sequências; a
// concentração destaca municípios e não conta células. Só registros principais do recorte aplicado (T19).
import { celulaDe } from './lentes/grade.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import type { Resumo } from './tipos.ts';

/** Destaques da lente ativa reduzidos ao que a aba usa: células distintas, ou municípios na ordem D16. */
export type DestaquesAtivos =
  | { unidade: 'celula'; celulas: string[]; recorte: 'estado' | 'municipio' }
  | { unidade: 'municipio'; municipios: number[] };

export type OrdemMunicipios = 'deteccoes' | 'destaques' | 'nome';

/** Células distintas, na ordem em que aparecem (duas sequências na mesma célula contam uma vez). */
export const celulasDistintas = (ids: readonly string[]): string[] => [...new Set(ids)];

export interface NumerosMunicipio {
  focos: number;
  dias: number;
  /** `null` enquanto a leitura completa do recorte não terminou. */
  celulas: number | null;
}

/**
 * Cartão do município (CM-1): focos = `principal.total` do resumo do recorte; dias = dias da série com total > 0;
 * células = células T1 distintas dos registros principais do município dentro do período (a leitura completa).
 */
export function numerosMunicipio(
  resumo: Resumo,
  registros: readonly RegistroLente[] | null,
): NumerosMunicipio {
  const municipio = resumo.municipio;
  const inicio = `${resumo.periodo.inicio}T00:00:00Z`;
  const fim = new Date(Date.parse(`${resumo.periodo.fim}T00:00:00Z`) + 86_400_000).toISOString().replace('.000Z', 'Z');
  const celulas = registros === null ? null : new Set(registros
    .filter((r) => r.municipio_codigo === municipio && r.data_hora_gmt >= inicio && r.data_hora_gmt < fim)
    .map((r) => celulaDe(r.latitude, r.longitude).id)).size;
  return {
    focos: resumo.principal.total,
    dias: resumo.principal.serie_diaria.filter((d) => d.total > 0).length,
    celulas,
  };
}

/**
 * Linha "Células destacadas" do cartão (CM-2 a CM-4, CM-6). Sem lente: "—". Concentração: a linha não aparece (`null`).
 * Lente no recorte do município (item 4): células distintas destacadas. Lente estadual (só se o recorte não bater):
 * "—" com a nota, para não atribuir ao município resultados de fora do recorte.
 */
export function linhaCelulasDestacadas(ativos: DestaquesAtivos | null): { valor: string; nota: string | null } | null {
  if (ativos === null) return { valor: '—', nota: null };
  if (ativos.unidade === 'municipio') return null;
  if (ativos.recorte === 'municipio') return { valor: String(celulasDistintas(ativos.celulas).length), nota: null };
  return { valor: '—', nota: 'lente calculada em todo Mato Grosso' };
}

export interface LinhaMunicipio {
  codigo: number;
  nome: string;
  total: number;
  /** Células destacadas com detecção do município; `null` sem lente por célula. */
  celulas: number | null;
  /** Destacado pela concentração. */
  destacado: boolean;
}

const nomes = new Intl.Collator('pt-BR');

/**
 * Lista estadual da aba Municípios (CM-5, CM-6): municípios com detecção no período (`por_municipio`).
 * Por destaques da lente: uma célula destacada conta em cada município com detecção principal nela (não pela
 * geometria); com a concentração, os destacados vêm primeiro, na ordem D16, e depois os demais por detecções.
 * Sem lente, a ordem por destaques é a por detecções. Desempates por nome.
 */
export function listaMunicipios(
  porMunicipio: Resumo['principal']['por_municipio'],
  ordem: OrdemMunicipios,
  ativos: DestaquesAtivos | null,
  registros: readonly RegistroLente[],
): LinhaMunicipio[] {
  let contagem: Map<number, number> | null = null;
  if (ativos?.unidade === 'celula') {
    const destacadas = new Set(ativos.celulas);
    const porCodigo = new Map<number, Set<string>>();
    for (const r of registros) {
      const id = celulaDe(r.latitude, r.longitude).id;
      if (!destacadas.has(id)) continue;
      const s = porCodigo.get(r.municipio_codigo) ?? new Set<string>();
      s.add(id);
      porCodigo.set(r.municipio_codigo, s);
    }
    contagem = new Map([...porCodigo].map(([c, s]) => [c, s.size]));
  }
  const posicaoD16 = new Map(ativos?.unidade === 'municipio' ? ativos.municipios.map((c, i) => [c, i]) : []);
  const linhas: LinhaMunicipio[] = porMunicipio.filter((m) => m.total > 0).map((m) => ({
    codigo: m.codigo, nome: m.nome, total: m.total,
    celulas: contagem ? (contagem.get(m.codigo) ?? 0) : null,
    destacado: posicaoD16.has(m.codigo),
  }));
  const porNome = (a: LinhaMunicipio, b: LinhaMunicipio) => nomes.compare(a.nome, b.nome) || a.codigo - b.codigo;
  const porTotal = (a: LinhaMunicipio, b: LinhaMunicipio) => b.total - a.total || porNome(a, b);
  if (ordem === 'nome') return linhas.sort(porNome);
  if (ordem === 'deteccoes' || ativos === null) return linhas.sort(porTotal);
  if (ativos.unidade === 'municipio') {
    return linhas.sort((a, b) => {
      const pa = posicaoD16.get(a.codigo);
      const pb = posicaoD16.get(b.codigo);
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      return porTotal(a, b);
    });
  }
  return linhas.sort((a, b) => (b.celulas ?? 0) - (a.celulas ?? 0) || porTotal(a, b));
}
