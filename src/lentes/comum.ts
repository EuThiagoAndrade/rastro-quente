// Partes comuns a todas as lentes: conferência da entrada e aplicação do qualificador de cobertura.
import { qualificarCobertura } from './cobertura.ts';
import { ErroLente, type DisponibilidadeMunicipio, type EntradaLente, type ResultadoLente } from './contrato.ts';

/** Fim exclusivo (00:00Z do dia seguinte ao último dia GMT da janela). */
export const fimExclusivo = (fim: string): string =>
  new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().replace('.000Z', 'Z');

/** Confere a entrada (C-3, C-4): toda detecção na janela, ids únicos e total igual ao do resumo. */
export function conferirEntrada(e: EntradaLente): ResultadoLente['conferencia'] {
  const inicio = `${e.janela.inicio}T00:00:00Z`;
  const fim = fimExclusivo(e.janela.fim);
  for (const r of e.registros) {
    if (!(r.data_hora_gmt >= inicio && r.data_hora_gmt < fim)) throw new ErroLente(`registro fora da janela: ${r.id_tecnico}`);
  }
  const ids = new Set(e.registros.map((r) => r.id_tecnico)).size;
  if (ids !== e.registros.length || e.registros.length !== e.totalResumo) {
    throw new ErroLente(`conferência divergente: ${e.registros.length} registros, ${ids} ids, resumo ${e.totalResumo}`);
  }
  return { registros_lidos: e.registros.length, ids_distintos: ids, total_resumo: e.totalResumo };
}

/** Aplica a cobertura aos destaques (função pura; devolve um novo resultado). */
export function qualificar(r: ResultadoLente, disponibilidade: Map<number, DisponibilidadeMunicipio>): ResultadoLente {
  return {
    ...r,
    destaques: r.destaques.map((d) => ({ ...d, cobertura: qualificarCobertura(d.cobertura.municipios, r.janela, disponibilidade) })),
  };
}

/** Municípios cuja disponibilidade é necessária para qualificar os destaques. */
export const municipiosNecessarios = (r: ResultadoLente): number[] =>
  [...new Set(r.destaques.flatMap((d) => d.cobertura.municipios))].sort((a, b) => a - b);

/** Estado agregado da qualificação: completo só quando todo destaque tem cobertura completa. */
export function estadoQualificacao(r: ResultadoLente): 'completa' | 'pendente' | 'falha' {
  if (r.destaques.some((d) => d.cobertura.estado === 'falha')) return 'falha';
  if (r.destaques.some((d) => d.cobertura.estado === 'pendente')) return 'pendente';
  return 'completa';
}
