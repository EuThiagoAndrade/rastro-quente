// Recorte aplicado (plano 007, T16): a última combinação válida de período e município. Lógica pura, sem DOM.
// O formulário aplica ao mudar; enquanto o período digitado for inválido, a tela continua no recorte aplicado.

export interface Janela {
  inicio: string;
  fim: string;
}

export type Atalho = 'janela' | '30' | '7';

const DIA_MS = 86_400_000;

const diaUtc = (dia: string): number => Date.parse(`${dia}T00:00:00Z`);
const paraDia = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Erro do período digitado ou `null` se ele pode ser aplicado (dias GMT, dentro da janela da versão). */
export function validarPeriodo(inicio: string, fim: string, janela: Janela): string | null {
  if (!inicio || !fim) return 'Informe o início e o fim do período (dias GMT).';
  if (inicio > fim) return 'O início do período não pode ser depois do fim.';
  if (inicio < janela.inicio || fim > janela.fim) return `O período precisa estar dentro da janela da versão: ${janela.inicio} a ${janela.fim}.`;
  return null;
}

/**
 * Período de um atalho, contado a partir do último dia GMT da janela da versão e cortado no primeiro dia dela.
 * "30" são os 30 dias finais (fim e os 29 anteriores), não um mês de calendário.
 */
export function periodoDoAtalho(atalho: Atalho, janela: Janela): Janela {
  if (atalho === 'janela') return { ...janela };
  const dias = Number(atalho);
  const inicio = paraDia(Math.max(diaUtc(janela.inicio), diaUtc(janela.fim) - (dias - 1) * DIA_MS));
  return { inicio, fim: janela.fim };
}

/** Atalho que produz exatamente o período, para marcar o chip; o primeiro na ordem janela, 30, 7. */
export function atalhoDoPeriodo(periodo: Janela, janela: Janela): Atalho | null {
  for (const a of ['janela', '30', '7'] as const) {
    const p = periodoDoAtalho(a, janela);
    if (p.inicio === periodo.inicio && p.fim === periodo.fim) return a;
  }
  return null;
}

/** "2026-10-01 a 2026-10-31". */
export const textoPeriodo = (p: Janela): string => `${p.inicio} a ${p.fim}`;

/** Recorte como frase curta: "Todo Mato Grosso · 2026-10-01 a 2026-10-31" ou "Município Alfa · …". */
export function textoRecorte(p: Janela, municipio: string | null): string {
  return `${municipio ?? 'Todo Mato Grosso'} · ${textoPeriodo(p)}`;
}
