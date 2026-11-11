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

/** Texto do qualificador; nunca "coberto". */
export function textoCobertura(c: Cobertura): string {
  if (c.estado === 'pendente') return 'cobertura: carregando';
  if (c.estado === 'falha') return `cobertura não verificada: ${c.motivo}`;
  return `${c.dias_sem_evidencia_de_lacuna} de ${c.dias_janela} dias sem evidência de lacuna (cobertura não comprovada)`;
}
