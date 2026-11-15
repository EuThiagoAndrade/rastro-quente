// Lente de concentração (U1, K1, Q4, Q8, D16, T5): contagem de registros principais da janela por
// município; destaca os municípios com contagem > 0 e maior ou igual à do N-ésimo colocado (N=10),
// incluindo todos os empatados no corte. Única lente que ordena, com o rótulo de contagem.
import { conferirEntrada } from './comum.ts';
import {
  ErroLente, LIMITACOES_COMUNS, ROTULO_ORDENACAO, VERSAO_METODO, type Destaque, type EntradaLente, type ResultadoLente,
} from './contrato.ts';

export const N_PADRAO = 10;

export const LIMITACOES_CONCENTRACAO = ['Contagem absoluta favorece municípios grandes.'];

const comparadorNome = new Intl.Collator('pt-BR');

/** Recusa da concentração fora do recorte estadual (plano 007, T4, RC-7). */
export const ERRO_CONCENTRACAO_MUNICIPAL = 'concentração exige recorte estadual';

export function concentracao(e: EntradaLente, n: number = N_PADRAO): ResultadoLente {
  // T4: a concentração compara municípios; com um só município no recorte, não se aplica.
  if (e.recorte?.tipo === 'municipio') throw new ErroLente(ERRO_CONCENTRACAO_MUNICIPAL);
  const conferencia = conferirEntrada(e);
  const porMunicipio = new Map<number, string[]>();
  for (const r of e.registros) {
    const lista = porMunicipio.get(r.municipio_codigo);
    if (lista) lista.push(r.id_tecnico);
    else porMunicipio.set(r.municipio_codigo, [r.id_tecnico]);
  }
  const nome = (c: number) => e.nomes.get(c) ?? String(c);
  // T5: contagem decrescente; empate por nome e depois por código, só para exibição.
  const ordenados = [...porMunicipio.entries()]
    .map(([codigo, ids]) => ({ codigo, ids: [...ids].sort(), total: ids.length }))
    .sort((a, b) => b.total - a.total || comparadorNome.compare(nome(a.codigo), nome(b.codigo)) || a.codigo - b.codigo);
  // D16: corte na contagem do N-ésimo colocado, com todos os empatados; 0 detecção nunca entra.
  const corte = ordenados.length >= n ? (ordenados[n - 1]?.total ?? 1) : 1;
  const escolhidos = ordenados.filter((m) => m.total > 0 && m.total >= corte);
  const observacoes: string[] = [];
  if (escolhidos.length > n) observacoes.push(`${escolhidos.length} municípios por empate no ${n}º lugar.`);
  else if (escolhidos.length < n) observacoes.push(`Só ${escolhidos.length} municípios têm detecções na janela.`);
  const destaques: Destaque[] = escolhidos.map((m, i) => ({
    id_destaque: `concentracao:municipio:${m.codigo}`,
    unidade: { tipo: 'municipio', codigo: m.codigo, nome: nome(m.codigo) },
    motivo: `${m.total} detecções na janela (dias GMT), entre os municípios com mais detecções (corte em ${n}, com empatados).`,
    evidencia: { deteccoes: m.ids, valor: m.total, datas: [] },
    ordem: i + 1,
    cobertura: { estado: 'pendente', municipios: [m.codigo] },
    ressalvas: [],
  }));
  return {
    lente: 'concentracao',
    versao_metodo: VERSAO_METODO,
    carga: e.carga,
    janela: { ...e.janela, referencia: 'dias GMT inclusivos' },
    recorte: { tipo: 'estado', municipio: null },
    parametros: [
      { nome: 'Unidade', valor: 'município (código IBGE)' },
      { nome: 'Medida', valor: 'contagem de detecções principais na janela' },
      { nome: 'Corte', valor: `os ${n} primeiros, com todos os empatados no ${n}º lugar; município com 0 detecção nunca entra` },
    ],
    estado: destaques.length ? 'com_destaques' : 'sem_destaques',
    ordenacao: { criterio: 'contagem de detecções', rotulo: ROTULO_ORDENACAO },
    observacoes,
    destaques,
    conferencia,
    limitacoes: [...LIMITACOES_COMUNS, ...LIMITACOES_CONCENTRACAO],
  };
}
