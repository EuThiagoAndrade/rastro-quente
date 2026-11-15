// Recorte aplicado (plano 007, T16): a última combinação válida de período e município. Lógica pura, sem DOM.
// O formulário aplica ao mudar; enquanto o período digitado for inválido, a tela continua no recorte aplicado.
// Atalhos de período como na referência V13: meses de calendário que terminam no mês do último dia da janela.

export interface Janela {
  inicio: string;
  fim: string;
}

export type Atalho = 'ano' | 'u6' | 'u3' | 'u1';

const DIA_MS = 86_400_000;
const diaUtc = (dia: string): number => Date.parse(`${dia}T00:00:00Z`);

/** Erro do período digitado ou `null` se ele pode ser aplicado (dias GMT, dentro da janela da versão). */
export function validarPeriodo(inicio: string, fim: string, janela: Janela): string | null {
  if (!inicio || !fim) return 'Informe o início e o fim do período (dias GMT).';
  if (inicio > fim) return 'O início do período não pode ser depois do fim.';
  if (inicio < janela.inicio || fim > janela.fim) return `O período precisa estar dentro da janela da versão: ${janela.inicio} a ${janela.fim}.`;
  return null;
}

/**
 * Período de um atalho: "Últimos N meses" começa no dia 1 do (N−1)º mês antes do mês do fim da janela e termina no
 * último dia da janela; nunca antes do primeiro dia dela. "ano" é a janela inteira.
 */
export function periodoDoAtalho(atalho: Atalho, janela: Janela): Janela {
  if (atalho === 'ano') return { ...janela };
  const meses = Number(atalho.slice(1));
  const [a, m] = janela.fim.split('-').map(Number) as [number, number];
  const inicio = new Date(Date.UTC(a, m - meses, 1)).toISOString().slice(0, 10);
  return { inicio: inicio < janela.inicio ? janela.inicio : inicio, fim: janela.fim };
}

/** Atalho que produz exatamente o período, ou `null` (intervalo personalizado); o primeiro na ordem ano, u6, u3, u1. */
export function atalhoDoPeriodo(periodo: Janela, janela: Janela): Atalho | null {
  for (const a of ['ano', 'u6', 'u3', 'u1'] as const) {
    const p = periodoDoAtalho(a, janela);
    if (p.inicio === periodo.inicio && p.fim === periodo.fim) return a;
  }
  return null;
}

/** "2026-10-01 a 2026-10-31". */
export const textoPeriodo = (p: Janela): string => `${p.inicio} a ${p.fim}`;

/** "01/10/2026 a 31/10/2026 · 31 dias GMT" (resumo do período, como na V13). */
export function resumoPeriodo(p: Janela): string {
  const br = (d: string) => d.split('-').reverse().join('/');
  const dias = Math.round((diaUtc(p.fim) - diaUtc(p.inicio)) / DIA_MS) + 1;
  return `${br(p.inicio)} a ${br(p.fim)} · ${dias} ${dias === 1 ? 'dia GMT' : 'dias GMT'}`;
}

/** Recorte como frase curta: "Todo Mato Grosso · 2026-10-01 a 2026-10-31" ou "Município Alfa · …". */
export function textoRecorte(p: Janela, municipio: string | null): string {
  return `${municipio ?? 'Todo Mato Grosso'} · ${textoPeriodo(p)}`;
}
