// Formatação pura (sem DOM): números, datas em GMT e rótulos do contrato.
import type { AlcanceHistorico, ClasseDisponibilidade } from './tipos.ts';

const numero = new Intl.NumberFormat('pt-BR');

export const fmtNumero = (n: number): string => numero.format(n);

/** "+2", "−3" ou "0": diferença com sinal explícito. */
export function fmtDiferenca(n: number): string {
  if (n > 0) return `+${numero.format(n)}`;
  if (n < 0) return `−${numero.format(-n)}`;
  return '0';
}

/** "2026-10-15T18:00:00Z" → "2026-10-15 18:00 GMT". */
export function fmtDataHoraGmt(iso: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]} GMT` : iso;
}

export const fmtIntervaloGmt = (inicio: string, fim: string): string =>
  `${fmtDataHoraGmt(inicio)} (inclusive) a ${fmtDataHoraGmt(fim)} (exclusive)`;

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export const ROTULO_CLASSE: Record<ClasseDisponibilidade, { rotulo: string; simbolo: string }> = {
  lacuna_conhecida: { rotulo: 'Lacuna conhecida', simbolo: '✕' },
  incidencia_indeterminada: { rotulo: 'Incidência indeterminada', simbolo: '?' },
  sem_evidencia_de_lacuna: { rotulo: 'Sem evidência de lacuna', simbolo: '○' },
};

export const ROTULO_ALCANCE: Record<AlcanceHistorico, string> = {
  verificado: 'Histórico verificado',
  parcial: 'Histórico parcial',
  indisponivel: 'Histórico indisponível',
};

/** Motivos e avisos chegam como identificadores da fonte; vão ao DOM só como texto. */
export const humanizar = (motivo: string): string => motivo.replaceAll('_', ' ');

export const ROTULO_DIVERGENCIA: Record<string, string> = {
  inpe_outra_uf_na_malha: 'INPE atribui outra UF',
  inpe_outro_municipio: 'INPE atribui outro município',
};

export const AVISO_SIMPLIFICACAO =
  'Limites simplificados para visualização; contagens usam a malha integral. Pontos próximos à divisa podem aparentar outro pertencimento.';

/** Último dia GMT inclusivo de uma janela com fim exclusivo (00:00Z do dia seguinte). */
export function ultimoDiaGmt(fimExclusivoIso: string): string {
  const t = new Date(fimExclusivoIso).getTime() - 1;
  return new Date(t).toISOString().slice(0, 10);
}

export const primeiroDiaGmt = (inicioIso: string): string => new Date(inicioIso).toISOString().slice(0, 10);
