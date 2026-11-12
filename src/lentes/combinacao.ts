// Combinação de lentes (plano 005: Q1 a Q9 e T8 a T14). O resultado combinado é por célula de 0,05° (grade T1):
// a célula entra pela concentração se tiver pelo menos 1 detecção de município destacado (P1), pela recorrência
// se for destaque dela e pela persistência se tiver pelo menos uma sequência (S1). "e" é a interseção e "ou" a
// união das células das 2 ou 3 lentes escolhidas. `combinar` calcula ela mesma as lentes, sobre a mesma entrada
// já lida e conferida (T8), e nunca recebe resultados prontos. Ordem fixa pela posição da célula (T13): não há
// pontuação, contagem de lentes nem ordem por critério. Combinar não torna a seleção mais verdadeira: "e" a
// torna mais específica e "ou" a amplia; destaques orientam avaliação técnica e não comprovam incêndio, dano,
// autoria ou infração.
import { qualificarCobertura, ressalvasDeClasse } from './cobertura.ts';
import { concentracao, LIMITACOES_CONCENTRACAO, N_PADRAO } from './concentracao.ts';
import {
  ErroLente, LIMITACOES_CELULA, LIMITACOES_COMUNS, VERSAO_METODO,
  type CargaLente, type Cobertura, type DisponibilidadeMunicipio, type EntradaLente, type Janela,
  type ResultadoLente, type TipoLente,
} from './contrato.ts';
import { celulaDe, ErroCoordenada, indiceGrade, type Celula } from './grade.ts';
import { persistencia } from './persistencia.ts';
import { recorrencia } from './recorrencia.ts';

/** Muda junto com qualquer regra da combinação (nova decisão de G1 e novo plano), T14. */
export const VERSAO_COMBINACAO = 'combinacao-005-v1';

export type Operador = 'e' | 'ou';

/** Ordem canônica (T10): a de qualquer lista de lentes do resultado, qualquer que seja a ordem da escolha. */
export const LENTES_CANONICAS: readonly TipoLente[] = ['concentracao', 'recorrencia', 'persistencia'];

export const NOME_LENTE: Record<TipoLente, string> = {
  concentracao: 'concentração',
  recorrencia: 'recorrência',
  persistencia: 'persistência',
};

export const PARAMETRO_PROJECAO = 'a célula entra pela concentração se tiver pelo menos 1 detecção de município destacado';

/** Limitação geral da combinação, com o efeito de cada operador (R2-1 do plano 005). */
export const LIMITACAO_OPERADOR: Record<Operador, string> = {
  e: 'Combinar critérios com "e" torna a seleção mais específica, não mais verdadeira: só entram as células destacadas por todas as lentes escolhidas. A lista não é ranking: células destacadas por mais lentes não são mais graves nem prioritárias.',
  ou: 'Combinar critérios com "ou" amplia a seleção, sem torná-la mais verdadeira: entram as células destacadas por qualquer das lentes escolhidas. A lista não é ranking: células destacadas por mais lentes não são mais graves nem prioritárias.',
};
export const LIMITACAO_PROJECAO =
  'A concentração entra na célula por projeção: a célula conta se tiver pelo menos 1 detecção de município destacado. A célula não segue divisas.';
export const LIMITACAO_INTERSECAO = 'Nenhuma célula em comum não indica ausência de focos nem de risco.';

/** Texto do estado `sem_celulas` (T11), que depende do operador. */
export function textoSemCelulas(operador: Operador): string {
  const inicio = operador === 'e'
    ? 'Nenhuma célula destacada por todas as lentes escolhidas nesta janela.'
    : 'Nenhuma célula destacada por qualquer das lentes escolhidas nesta janela.';
  return `${inicio} Isso não indica ausência de focos nem de risco.`;
}

/** Entrada inválida da combinação (menos de 2 lentes, lente repetida ou desconhecida, operador fora de "e" e "ou"). */
export class ErroCombinacao extends Error {
  readonly tipo = 'entrada_invalida' as const;
}

/** Destaque original que levou a célula a entrar, com a evidência restrita à célula (T9, T14). */
export interface DestaqueNaCelula {
  id_destaque: string;
  motivo: string;
  /** `datas`: vazias na concentração, os meses na recorrência, os dias da sequência na persistência. */
  evidencia: { deteccoes: string[]; datas: string[] };
  ressalvas: string[];
}

export interface CriterioCelula {
  lente: TipoLente;
  /** Só a ressalva de projeção, na concentração. */
  ressalvas: string[];
  destaques: DestaqueNaCelula[];
}

export interface CelulaCombinada {
  id_combinado: string;
  unidade: Celula;
  /** Um por lente que destacou a célula, na ordem canônica. No "e", um por lente escolhida. */
  criterios: CriterioCelula[];
  /** União ordenada das evidências de todos os destaques, sem repetição. */
  evidencia: { deteccoes: string[] };
  /** Municípios de todas as detecções da célula na janela (D13, T12). */
  municipios: number[];
  cobertura: Cobertura;
}

export interface ParametroCombinacao {
  origem: TipoLente | 'combinacao';
  nome: string;
  valor: string;
}

export interface ResultadoCombinacao {
  tipo: 'combinacao';
  versao_combinacao: string;
  versao_metodo: string;
  operador: Operador;
  lentes: TipoLente[];
  carga: CargaLente;
  janela: Janela & { referencia: 'dias GMT inclusivos' };
  recorte: { tipo: 'estado'; municipio: null };
  conferencia: ResultadoLente['conferencia'];
  parametros: ParametroCombinacao[];
  estado: 'com_celulas' | 'sem_celulas' | 'indisponivel';
  /** Lentes sem aplicação na janela (I1), com o texto de cada uma; vazia nos demais estados. */
  indisponibilidade: { lente: TipoLente; texto: string }[];
  celulas: CelulaCombinada[];
  limitacoes: string[];
}

/** Lentes e operador validados (T10), com as lentes na ordem canônica. */
export function validarEscolha(lentes: readonly string[], operador: string): { lentes: TipoLente[]; operador: Operador } {
  if (operador !== 'e' && operador !== 'ou') throw new ErroCombinacao(`operador inválido: ${operador}`);
  if (lentes.length < 2) throw new ErroCombinacao('escolha pelo menos 2 lentes');
  if (new Set(lentes).size !== lentes.length) throw new ErroCombinacao('lente repetida');
  for (const l of lentes) {
    if (!(LENTES_CANONICAS as readonly string[]).includes(l)) throw new ErroCombinacao(`lente desconhecida: ${l}`);
  }
  return { lentes: LENTES_CANONICAS.filter((l) => lentes.includes(l)), operador };
}

const plural = (n: number, um: string, varios: string): string => `${n} ${n === 1 ? um : varios}`;

/** "A janela toca 1 mês GMT; …." → "recorrência não se aplica a esta janela: a janela toca 1 mês GMT; …" */
function textoIndisponivel(r: ResultadoLente): string {
  const motivo = (r.observacoes[0] ?? 'a janela é insuficiente').replace(/\.$/, '');
  return `${NOME_LENTE[r.lente]} não se aplica a esta janela: ${motivo.charAt(0).toLowerCase()}${motivo.slice(1)}`;
}

interface CelulaRegistros {
  kLat: number;
  kLon: number;
  unidade: Celula;
  /** `id_tecnico` por município, na ordem de leitura. */
  porMunicipio: Map<number, string[]>;
  total: number;
}

/** Células T1 de todas as detecções da janela (a mesma grade das lentes). */
function celulasDosRegistros(e: EntradaLente): Map<string, CelulaRegistros> {
  const celulas = new Map<string, CelulaRegistros>();
  for (const r of e.registros) {
    let kLat: number;
    let kLon: number;
    try {
      kLat = indiceGrade(r.latitude);
      kLon = indiceGrade(r.longitude);
    } catch (x) {
      if (x instanceof ErroCoordenada) throw new ErroLente(`coordenada inválida em ${r.id_tecnico}: ${x.message}`);
      throw x;
    }
    const chave = `c${kLat}_${kLon}`;
    let c = celulas.get(chave);
    if (!c) {
      c = { kLat, kLon, unidade: celulaDe(r.latitude, r.longitude), porMunicipio: new Map(), total: 0 };
      celulas.set(chave, c);
    }
    const ids = c.porMunicipio.get(r.municipio_codigo);
    if (ids) ids.push(r.id_tecnico);
    else c.porMunicipio.set(r.municipio_codigo, [r.id_tecnico]);
    c.total += 1;
  }
  return celulas;
}

/** Critério da concentração por projeção P1 (T9): um destaque por município destacado com detecção na célula. */
function criterioConcentracao(c: CelulaRegistros, r: ResultadoLente, n: number): CriterioCelula | null {
  const destaques: DestaqueNaCelula[] = [];
  let doDestacado = 0;
  const porCodigo = new Map(r.destaques.flatMap((d) => d.unidade.tipo === 'municipio' ? [[d.unidade.codigo, { d, nome: d.unidade.nome }] as const] : []));
  // Um item por município destacado com detecção na célula, em ordem de código IBGE (T14).
  for (const codigo of [...c.porMunicipio.keys()].sort((a, b) => a - b)) {
    const x = porCodigo.get(codigo);
    if (!x) continue;
    const { d, nome } = x;
    const ids = [...(c.porMunicipio.get(codigo) ?? [])].sort();
    doDestacado += ids.length;
    destaques.push({
      id_destaque: d.id_destaque,
      motivo: `${plural(ids.length, 'detecção', 'detecções')} nesta célula de ${nome}, município destacado pela concentração (${plural(d.evidencia.valor, 'detecção', 'detecções')} na janela; corte em ${n}, com empatados)`,
      evidencia: { deteccoes: ids, datas: [] },
      ressalvas: [],
    });
  }
  if (!destaques.length) return null;
  const outros = c.total - doDestacado;
  const ressalvas = outros > 0
    ? [`a célula também tem ${outros} de ${c.total} detecções de município não destacado pela concentração`]
    : [];
  return { lente: 'concentracao', ressalvas, destaques };
}

/** Critério de uma lente por célula (recorrência e persistência): os destaques originais daquela célula. */
function criteriosPorCelula(r: ResultadoLente): Map<string, CriterioCelula> {
  const porCelula = new Map<string, CriterioCelula>();
  // A ordem dos destaques originais é preservada; na persistência, ela já é a da data de início (T5).
  for (const d of r.destaques) {
    if (d.unidade.tipo !== 'celula_005') continue;
    let c = porCelula.get(d.unidade.id);
    if (!c) {
      c = { lente: r.lente, ressalvas: [], destaques: [] };
      porCelula.set(d.unidade.id, c);
    }
    c.destaques.push({
      id_destaque: d.id_destaque,
      motivo: d.motivo,
      evidencia: { deteccoes: [...d.evidencia.deteccoes], datas: [...d.evidencia.datas] },
      ressalvas: [...d.ressalvas],
    });
  }
  for (const c of porCelula.values()) c.destaques.sort((a, b) => (a.evidencia.datas[0] ?? '').localeCompare(b.evidencia.datas[0] ?? ''));
  return porCelula;
}

const CALCULO: Record<TipoLente, (e: EntradaLente, n: number) => ResultadoLente> = {
  concentracao: (e, n) => concentracao(e, n),
  recorrencia: (e) => recorrencia(e),
  persistencia: (e) => persistencia(e),
};

/**
 * Combinação com o `n` da concentração fixado. Só os casos de referência usam este ponto de entrada; a produção
 * usa `combinar`, com N=10. A cobertura sai `pendente`; `qualificarCombinacao` a aplica depois.
 */
export function calcularCombinacao(
  e: EntradaLente,
  escolha: readonly string[],
  operadorEscolhido: string,
  n: number,
): ResultadoCombinacao {
  const { lentes, operador } = validarEscolha(escolha, operadorEscolhido);
  // T8: as lentes escolhidas são calculadas aqui, sobre a mesma entrada; cada uma confere a entrada (C-3, C-4).
  const resultados = new Map(lentes.map((l) => [l, CALCULO[l](e, n)]));
  const conferencia = resultados.get(lentes[0] as TipoLente)?.conferencia as ResultadoLente['conferencia'];
  const celulas = celulasDosRegistros(e);

  const parametros: ParametroCombinacao[] = lentes.flatMap((l) =>
    (resultados.get(l)?.parametros ?? []).map((p) => ({ origem: l, nome: p.nome, valor: p.valor })));
  if (lentes.includes('concentracao')) parametros.push({ origem: 'combinacao', nome: 'Projeção da concentração', valor: PARAMETRO_PROJECAO });
  const limitacoes = [
    ...LIMITACOES_COMUNS,
    ...LIMITACOES_CELULA,
    ...(lentes.includes('concentracao') ? LIMITACOES_CONCENTRACAO : []),
    LIMITACAO_OPERADOR[operador],
    ...(lentes.includes('concentracao') ? [LIMITACAO_PROJECAO] : []),
    ...(operador === 'e' ? [LIMITACAO_INTERSECAO] : []),
  ];
  const base = {
    tipo: 'combinacao' as const,
    versao_combinacao: VERSAO_COMBINACAO,
    versao_metodo: VERSAO_METODO,
    operador,
    lentes,
    carga: e.carga,
    janela: { ...e.janela, referencia: 'dias GMT inclusivos' as const },
    recorte: { tipo: 'estado' as const, municipio: null },
    conferencia,
    parametros,
    limitacoes,
  };

  // I1 (T11): lente escolhida sem aplicação na janela torna a combinação indisponível, com qualquer operador.
  const indisponibilidade = lentes.flatMap((l) => {
    const r = resultados.get(l);
    return r?.estado === 'janela_insuficiente' ? [{ lente: l, texto: textoIndisponivel(r) }] : [];
  });
  if (indisponibilidade.length) return { ...base, estado: 'indisponivel', indisponibilidade, celulas: [] };

  const criterios = new Map<TipoLente, Map<string, CriterioCelula>>();
  for (const l of lentes) {
    const r = resultados.get(l) as ResultadoLente;
    if (l === 'concentracao') {
      const m = new Map<string, CriterioCelula>();
      for (const [id, c] of celulas) {
        const x = criterioConcentracao(c, r, n);
        if (x) m.set(id, x);
      }
      criterios.set(l, m);
    } else {
      criterios.set(l, criteriosPorCelula(r));
    }
  }

  const escolhidas = [...celulas.values()]
    .filter((c) => {
      const presentes = lentes.filter((l) => criterios.get(l)?.has(c.unidade.id));
      return operador === 'e' ? presentes.length === lentes.length : presentes.length > 0;
    })
    // T13: norte→sul (índice de latitude decrescente) e depois oeste→leste.
    .sort((a, b) => b.kLat - a.kLat || a.kLon - b.kLon);

  const chaveLentes = lentes.join('+');
  const lista: CelulaCombinada[] = escolhidas.map((c) => {
    const criteriosCelula = lentes.flatMap((l) => {
      const x = criterios.get(l)?.get(c.unidade.id);
      return x ? [x] : [];
    });
    const deteccoes = [...new Set(criteriosCelula.flatMap((x) => x.destaques.flatMap((d) => d.evidencia.deteccoes)))].sort();
    const municipios = [...c.porMunicipio.keys()].sort((a, b) => a - b);
    return {
      id_combinado: `combinacao:${operador}:${chaveLentes}:celula_005:${c.unidade.id}`,
      unidade: c.unidade,
      criterios: criteriosCelula,
      evidencia: { deteccoes },
      municipios,
      cobertura: { estado: 'pendente', municipios },
    };
  });
  return { ...base, estado: lista.length ? 'com_celulas' : 'sem_celulas', indisponibilidade: [], celulas: lista };
}

/** Ponto de entrada de produção (T8): concentração com N=10. */
export function combinar(e: EntradaLente, lentes: readonly TipoLente[], operador: Operador): ResultadoCombinacao {
  return calcularCombinacao(e, lentes, operador, N_PADRAO);
}

/**
 * Aplica a cobertura comum da célula (V1, T12) e, na persistência, as ressalvas por classe de cada sequência,
 * calculadas sequência a sequência (R1-1). Função pura; aplicar sempre sobre o resultado de `combinar`, como
 * `qualificar` nas lentes. A seleção, os critérios e as demais ressalvas não mudam.
 */
export function qualificarCombinacao(
  r: ResultadoCombinacao,
  disponibilidade: Map<number, DisponibilidadeMunicipio>,
): ResultadoCombinacao {
  return {
    ...r,
    celulas: r.celulas.map((c) => {
      const cobertura = qualificarCobertura(c.municipios, r.janela, disponibilidade);
      const criterios = c.criterios.map((x) => x.lente !== 'persistencia' ? x : {
        ...x,
        destaques: x.destaques.map((d) => ({
          ...d,
          ressalvas: [...d.ressalvas, ...ressalvasDeClasse(d.evidencia.datas, r.janela, cobertura).map((y) => y.texto)],
        })),
      });
      return { ...c, cobertura, criterios };
    }),
  };
}

/** Municípios cuja disponibilidade é necessária para qualificar as células. */
export const municipiosDaCombinacao = (r: ResultadoCombinacao): number[] =>
  [...new Set(r.celulas.flatMap((c) => c.municipios))].sort((a, b) => a - b);
