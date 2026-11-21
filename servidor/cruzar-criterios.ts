import { combinar, qualificarCombinacao } from '../src/lentes/combinacao.ts';
import { qualificar } from '../src/lentes/comum.ts';
import { ErroLente, type EntradaLente, type DisponibilidadeMunicipio } from '../src/lentes/contrato.ts';
import { persistencia } from '../src/lentes/persistencia.ts';
import { mesesDaJanela } from '../src/lentes/recorrencia.ts';
import { CLASSES_AREA, sobreposicao, qualificarSobreposicao } from '../src/lentes/sobreposicao.ts';
import { textoCobertura } from '../src/lentes/cobertura.ts';
import type { LeituraAreas } from '../src/lentes/carregar-areas.ts';
/** Cruza critérios já calculados e completos; cada critério conta uma vez por célula. */
export function cruzarCriterios(criterios: readonly { criterio: string; celulas: readonly string[] }[]) {
  if (new Set(criterios.map((c) => c.criterio)).size !== criterios.length) throw new Error('critério repetido');
  if (criterios.length < 2) return { estado: 'dados_insuficientes' as const, celulas: [] };
  const porCelula = new Map<string, string[]>();
  for (const { criterio, celulas } of criterios) {
    for (const celula of new Set(celulas)) {
      const presentes = porCelula.get(celula) ?? [];
      presentes.push(criterio);
      porCelula.set(celula, presentes);
    }
  }
  const celulas = [...porCelula].filter(([, presentes]) => presentes.length >= 2)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, presentes]) => ({ id, criterios: presentes }));
  return { estado: celulas.length ? 'com_achados' as const : 'sem_achados' as const, celulas };
}

/** Critérios de produção sobre a mesma entrada completa, independentes da lente escolhida na tela. */
export function calcularPadroes(entrada: EntradaLente, camada: LeituraAreas, disp: Map<number, DisponibilidadeMunicipio>) {
  const municipio = entrada.recorte?.municipio ?? null;
  const municipios = municipio === null ? [...new Set(entrada.registros.map((r) => r.municipio_codigo))] : [municipio];
  if (municipios.some((m) => disp.get(m)?.estado !== 'ok')) throw new ErroLente('disponibilidade incompleta para cruzamento');
  const lentes: import('../src/lentes/contrato.ts').TipoLente[] = [];
  if (municipio === null) lentes.unshift('concentracao');
  if (mesesDaJanela(entrada.janela).length >= 3) lentes.push('recorrencia');
  lentes.push('persistencia');
  const criterios: { criterio: string; celulas: string[] }[] = [];
  const detalhes: unknown[] = [];
  if (lentes.length >= 2) {
    const resultado = qualificarCombinacao(combinar(entrada, lentes, 'ou'), disp);
    if (resultado.estado === 'indisponivel') throw new ErroLente('critério indisponível');
    for (const lente of lentes) criterios.push({ criterio: lente, celulas: resultado.celulas.filter((c) => c.criterios.some((x) => x.lente === lente)).map((c) => c.unidade.id) });
    detalhes.push(...resultado.celulas.map((c) => ({ unidade: c.unidade.id, criterios: c.criterios, municipios: c.municipios, cobertura: textoCobertura(c.cobertura) })));
  } else {
    const resultado = qualificar(persistencia(entrada), disp);
    criterios.push({ criterio: 'persistencia', celulas: resultado.destaques.flatMap((d) => d.unidade.tipo === 'celula_005' ? [d.unidade.id] : []) });
    detalhes.push(...resultado.destaques.map((d) => ({ unidade: d.unidade, motivo: d.motivo, evidencia: d.evidencia, ressalvas: d.ressalvas })));
  }
  if (camada.estado === 'completa') {
    const resultados = CLASSES_AREA.map((classe) => qualificarSobreposicao(sobreposicao(entrada, camada, classe), disp));
    criterios.push({ criterio: 'sobreposicao', celulas: resultados.flatMap((x) => x.destaques.flatMap((d) => d.unidade.tipo === 'celula_005' ? [d.unidade.id] : [])) });
    detalhes.push(...resultados.flatMap((x) => x.destaques.map((d) => ({ unidade: d.unidade, classe: x.classe, motivo: d.motivo, evidencia: d.evidencia, areas: d.areas, ressalvas: d.ressalvas }))));
  }
  return { ...cruzarCriterios(criterios), criterios_disponiveis: criterios.map((c) => c.criterio), detalhes };
}
