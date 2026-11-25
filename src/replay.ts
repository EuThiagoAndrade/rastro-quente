// Mapa vivo (ciclo 012, issue #113): reprodução dia a dia das detecções de calor já lidas do recorte. Lógica pura,
// sem DOM. Só fatia os registros por dia GMT (`data_hora_gmt`): a soma dos quadros é o total do recorte. Nada de
// trajeto, deslocamento ou rumo; cor e opacidade só distinguem o dia atual dos anteriores (não indicam intensidade).
import type { RegistroLente } from './lentes/contrato.ts';
import { diasDoPeriodo } from './serie.ts';
import type { ClasseDisponibilidade, Disponibilidade } from './tipos.ts';

/** Acima disto, a barra sugere restringir o recorte (o desenho continua possível). */
export const LIMITE_FLUIDEZ = 5000;
export const VELOCIDADES = [1, 2, 4] as const;
export type Velocidade = (typeof VELOCIDADES)[number];
/** Duração de um dia na velocidade 1×. */
export const PASSO_MS = 900;

export interface Quadro {
  dia: string;
  doDia: number;
  acumuladas: number;
}

export interface Reproducao {
  dias: string[];
  porDia: Map<string, RegistroLente[]>;
  quadros: Quadro[];
  total: number;
}

export const diaGmt = (r: Pick<RegistroLente, 'data_hora_gmt'>): string => r.data_hora_gmt.slice(0, 10);

/** Quadros diários do período (um por dia GMT, inclusive os sem detecção). Registros fora do período não entram. */
export function montarReproducao(registros: readonly RegistroLente[], inicio: string, fim: string): Reproducao {
  const dias = diasDoPeriodo(inicio, fim);
  const porDia = new Map<string, RegistroLente[]>(dias.map((d) => [d, []]));
  for (const r of registros) porDia.get(diaGmt(r))?.push(r);
  let acumuladas = 0;
  const quadros = dias.map((dia) => {
    const doDia = porDia.get(dia)?.length ?? 0;
    acumuladas += doDia;
    return { dia, doDia, acumuladas };
  });
  return { dias, porDia, quadros, total: acumuladas };
}

/** Dias de cobertura não comprovada (lacuna conhecida ou incidência indeterminada) do município do recorte. */
export function diasSemCobertura(d: Disponibilidade | null | undefined): Map<string, Exclude<ClasseDisponibilidade, 'sem_evidencia_de_lacuna'>> {
  const m = new Map<string, Exclude<ClasseDisponibilidade, 'sem_evidencia_de_lacuna'>>();
  for (const x of d?.dias ?? []) {
    if (x.classe === 'lacuna_conhecida') m.set(x.dia, 'lacuna_conhecida');
    else if (x.classe === 'incidencia_indeterminada' && !m.has(x.dia)) m.set(x.dia, 'incidencia_indeterminada');
  }
  return m;
}

/** Faixa de idade (dias desde a detecção até o dia exibido): 0 é o dia atual; as outras só esmaecem. */
export function faixaIdade(idade: number): 0 | 1 | 2 | 3 {
  if (idade <= 0) return 0;
  if (idade <= 2) return 1;
  if (idade <= 6) return 2;
  return 3;
}

/** "2026-08-14" → "14/08". */
export const diaCurto = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
