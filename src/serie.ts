// Série do período (plano 007, T9 e T19). Lógica pura, sem DOM. Só a série principal em dia GMT (`serie_diaria`),
// nunca o envelope da sensibilidade: a soma das barras é igual a `principal.total` do mesmo recorte.

/** Períodos de até este número de dias GMT usam barras diárias; acima disso, mensais. */
export const LIMITE_DIARIO = 31;

export interface BarraSerie {
  /** `aaaa-mm-dd` na série diária; `aaaa-mm` na mensal. */
  chave: string;
  total: number;
  /** Mês cortado pelo período (só na mensal): leva `*` e a nota de mês parcial. */
  parcial: boolean;
}

export interface Serie {
  unidade: 'dia' | 'mes';
  barras: BarraSerie[];
  total: number;
  /** Algum mês parcial: a nota "mês parcial: só os dias do período" aparece. */
  temParcial: boolean;
}

const DIA_MS = 86_400_000;
const somaDia = (dia: string, n: number): string => new Date(Date.parse(`${dia}T00:00:00Z`) + n * DIA_MS).toISOString().slice(0, 10);
const ultimoDiaDoMes = (mes: string): string => {
  const [a, m] = mes.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
};

/** Dias GMT do período, inclusive nas duas pontas. */
export function diasDoPeriodo(inicio: string, fim: string): string[] {
  const dias: string[] = [];
  for (let d = inicio; d <= fim; d = somaDia(d, 1)) dias.push(d);
  return dias;
}

/**
 * Barras da série (SR-1 a SR-4). Até 31 dias: uma barra por dia do período (zero quando não há detecção). Acima:
 * uma barra por mês tocado pelo período, somando só os dias dentro dele; mês cortado é `parcial`, mesmo com zero.
 * Dias fora do período (como os que só a sensibilidade America/Cuiaba alcança) nunca entram.
 */
export function montarSerie(inicio: string, fim: string, serieDiaria: readonly { dia: string; total: number }[]): Serie {
  const dias = diasDoPeriodo(inicio, fim);
  const porDia = new Map<string, number>();
  for (const d of serieDiaria) if (d.dia >= inicio && d.dia <= fim) porDia.set(d.dia, (porDia.get(d.dia) ?? 0) + d.total);
  const total = [...porDia.values()].reduce((a, b) => a + b, 0);
  if (dias.length <= LIMITE_DIARIO) {
    return { unidade: 'dia', barras: dias.map((d) => ({ chave: d, total: porDia.get(d) ?? 0, parcial: false })), total, temParcial: false };
  }
  const meses = new Map<string, number>();
  for (const d of dias) {
    const mes = d.slice(0, 7);
    meses.set(mes, (meses.get(mes) ?? 0) + (porDia.get(d) ?? 0));
  }
  const barras = [...meses].map(([mes, t]) => ({
    chave: mes, total: t, parcial: inicio > `${mes}-01` || fim < ultimoDiaDoMes(mes),
  }));
  return { unidade: 'mes', barras, total, temParcial: barras.some((b) => b.parcial) };
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-07" → "jul/2026"; "2026-07-31" → "31/07". Rótulos em dia ou mês GMT. */
export function rotuloBarra(b: BarraSerie): string {
  if (b.chave.length === 7) return `${MESES[Number(b.chave.slice(5, 7)) - 1]}/${b.chave.slice(0, 4)}`;
  return `${b.chave.slice(8, 10)}/${b.chave.slice(5, 7)}`;
}
