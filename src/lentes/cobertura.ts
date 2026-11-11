// Qualificador de cobertura (V2, Q7, D13, T3, T7): não seleciona e não tem limiar. Um dia só conta como
// "sem evidência de lacuna" se todos os municípios considerados estiverem `sem_evidencia_de_lacuna`
// naquele dia (união conservadora, D13); a classe do dia da unidade é a mais restritiva entre eles
// (precedência D1, T7), e o painel preserva a classe e os motivos de cada município. Falha de leitura
// nunca vira "N de M" parcial.
import type { ClasseDisponibilidade } from '../tipos.ts';
import type { Cobertura, DiaRestritivo, DisponibilidadeMunicipio, Janela } from './contrato.ts';

const PRECEDENCIA: Record<ClasseDisponibilidade, number> = {
  lacuna_conhecida: 2,
  incidencia_indeterminada: 1,
  sem_evidencia_de_lacuna: 0,
};

/** Dias GMT da janela, inclusivos, em ordem. */
export function diasDaJanela(janela: Janela): string[] {
  const dias: string[] = [];
  const fim = Date.parse(`${janela.fim}T00:00:00Z`);
  for (let t = Date.parse(`${janela.inicio}T00:00:00Z`); t <= fim; t += 86_400_000) {
    dias.push(new Date(t).toISOString().slice(0, 10));
  }
  return dias;
}

/** Classe do dia da unidade e detalhe por município; `null` se algum município não tiver o dia. */
export function classeDoDia(
  dia: string,
  municipios: number[],
  disponibilidade: Map<number, DisponibilidadeMunicipio>,
): DiaRestritivo | { dia: string; classe: 'sem_evidencia_de_lacuna' } | null {
  let pior: ClasseDisponibilidade = 'sem_evidencia_de_lacuna';
  const detalhe: DiaRestritivo['municipios'] = [];
  for (const codigo of municipios) {
    const d = disponibilidade.get(codigo);
    if (!d || d.estado !== 'ok') return null;
    const x = d.dias.get(dia);
    if (!x) return null;
    detalhe.push({ codigo, classe: x.classe, motivos: x.motivos });
    if (PRECEDENCIA[x.classe] > PRECEDENCIA[pior]) pior = x.classe;
  }
  if (pior === 'sem_evidencia_de_lacuna') return { dia, classe: pior };
  return { dia, classe: pior, municipios: detalhe };
}

export function qualificarCobertura(
  municipiosDaUnidade: number[],
  janela: Janela,
  disponibilidade: Map<number, DisponibilidadeMunicipio>,
): Cobertura {
  const municipios = [...new Set(municipiosDaUnidade)].sort((a, b) => a - b);
  for (const codigo of municipios) {
    const d = disponibilidade.get(codigo);
    if (d?.estado === 'falha') return { estado: 'falha', municipios, motivo: d.motivo };
  }
  if (municipios.some((c) => !disponibilidade.has(c))) return { estado: 'pendente', municipios };
  const dias = diasDaJanela(janela);
  const demais: DiaRestritivo[] = [];
  for (const dia of dias) {
    const c = classeDoDia(dia, municipios, disponibilidade);
    // Dia ausente numa disponibilidade "ok" não deveria existir (T3 valida antes); se ocorrer, é falha.
    if (c === null) return { estado: 'falha', municipios, motivo: 'leitura incompleta' };
    if (c.classe !== 'sem_evidencia_de_lacuna') demais.push(c as DiaRestritivo);
  }
  return {
    estado: 'completa',
    municipios,
    dias_janela: dias.length,
    dias_sem_evidencia_de_lacuna: dias.length - demais.length,
    demais_dias: demais,
  };
}

export const RESSALVA_NAO_VERIFICADA = 'ressalvas de disponibilidade ainda não verificadas';

/** Ressalva por classe (D15, T7) e o dia restritivo da unidade a que ela se refere, com cada município. */
export interface RessalvaDeClasse {
  texto: string;
  dia: DiaRestritivo | null;
}

/** Dia GMT seguinte (ou anterior, com `passo` −1). */
export const somarDia = (dia: string, passo: number): string =>
  new Date(Date.parse(`${dia}T00:00:00Z`) + passo * 86_400_000).toISOString().slice(0, 10);

/**
 * Ressalvas por classe de uma sequência (tabela "Ressalvas por classe" do plano 004): os dias da sequência
 * (com detecção) e os vizinhos imediatos dentro da janela (sem detecção, porque a sequência é maximal) que
 * não estão `sem_evidencia_de_lacuna` na unidade. O texto preserva a classe observada (T7). Enquanto a
 * cobertura não está completa, uma única ressalva substitui as de D15; nunca se infere detecção.
 */
export function ressalvasDeClasse(diasSequencia: string[], janela: Janela, cobertura: Cobertura): RessalvaDeClasse[] {
  if (cobertura.estado !== 'completa') return [{ texto: RESSALVA_NAO_VERIFICADA, dia: null }];
  const primeiro = diasSequencia[0];
  const ultimo = diasSequencia.at(-1);
  if (primeiro === undefined || ultimo === undefined) return [];
  const restritivos = new Map(cobertura.demais_dias.map((d) => [d.dia, d]));
  const antes = somarDia(primeiro, -1);
  const depois = somarDia(ultimo, 1);
  const candidatos: { dia: string; vizinho: boolean }[] = [
    ...(antes >= janela.inicio ? [{ dia: antes, vizinho: true }] : []),
    ...diasSequencia.map((dia) => ({ dia, vizinho: false })),
    ...(depois <= janela.fim ? [{ dia: depois, vizinho: true }] : []),
  ];
  const ressalvas: RessalvaDeClasse[] = [];
  for (const { dia, vizinho } of candidatos) {
    const r = restritivos.get(dia);
    if (!r) continue;
    const ddmm = `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
    const classe = r.classe === 'lacuna_conhecida' ? 'dia com lacuna conhecida' : 'dia indeterminado';
    ressalvas.push({ texto: vizinho ? `adjacente a ${classe} (${ddmm}); pode ser mais longa` : `inclui ${classe} (${ddmm})`, dia: r });
  }
  return ressalvas;
}

/** Texto do qualificador; nunca "coberto". */
export function textoCobertura(c: Cobertura): string {
  if (c.estado === 'pendente') return 'cobertura: carregando';
  if (c.estado === 'falha') return `cobertura não verificada: ${c.motivo}`;
  return `${c.dias_sem_evidencia_de_lacuna} de ${c.dias_janela} dias sem evidência de lacuna (cobertura não comprovada)`;
}
