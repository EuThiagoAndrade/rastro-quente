// Densidade por célula (plano 007, T8 e T19). Lógica pura, sem DOM. Contagem de detecções principais do recorte
// aplicado por célula T1 (0,05°), em cinco classes fixas, iguais em qualquer filtro: a mesma cor significa sempre o
// mesmo número. É contagem, não gravidade; não entra em lente, ordenação nem explicação.
import { celulaDe, type Celula } from './lentes/grade.ts';
import type { RegistroLente } from './lentes/contrato.ts';

/** Classes fixas: 1 · 2–3 · 4–9 · 10–24 · 25 ou mais (limite inferior de cada uma). */
export const CLASSES_DENSIDADE = [
  { minimo: 1, rotulo: '1' },
  { minimo: 2, rotulo: '2–3' },
  { minimo: 4, rotulo: '4–9' },
  { minimo: 10, rotulo: '10–24' },
  { minimo: 25, rotulo: '25 ou mais' },
] as const;

export const LEGENDA_DENSIDADE = 'Detecções por célula: contagem, não gravidade';

/** Índice da classe (0 a 4) de uma contagem ≥ 1 (DS-1). */
export function classeDensidade(contagem: number): number {
  let i = 0;
  for (let k = 0; k < CLASSES_DENSIDADE.length; k++) if (contagem >= CLASSES_DENSIDADE[k]!.minimo) i = k;
  return i;
}

export interface CelulaDensidade {
  celula: Celula;
  contagem: number;
  classe: number;
}

/**
 * Contagem por célula dos registros principais do período GMT `[inicio, fim]` (DS-2). Registros fora do período
 * (como os que só a sensibilidade America/Cuiaba alcança) não contam: a soma é igual a `principal.total`.
 */
export function densidadePorCelula(registros: readonly RegistroLente[], inicio: string, fim: string): { celulas: CelulaDensidade[]; total: number } {
  const de = `${inicio}T00:00:00Z`;
  const ate = new Date(Date.parse(`${fim}T00:00:00Z`) + 86_400_000).toISOString().replace('.000Z', 'Z');
  const porId = new Map<string, { celula: Celula; contagem: number }>();
  let total = 0;
  for (const r of registros) {
    if (r.data_hora_gmt < de || r.data_hora_gmt >= ate) continue;
    const c = celulaDe(r.latitude, r.longitude);
    const atual = porId.get(c.id);
    if (atual) atual.contagem++;
    else porId.set(c.id, { celula: c, contagem: 1 });
    total++;
  }
  return { celulas: [...porId.values()].map((x) => ({ ...x, classe: classeDensidade(x.contagem) })), total };
}
