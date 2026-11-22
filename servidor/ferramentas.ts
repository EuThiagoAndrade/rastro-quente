// Catálogo fechado de ferramentas determinísticas (plano 008, T4 e T5). Cada ferramenta relê os dados sob o JWT do
// usuário (RLS integral), confere a leitura pelo carregador e calcula com os mesmos módulos de produção do navegador;
// nenhum número do cliente é aceito. Os argumentos só podem referenciar o pedido validado: o modelo não troca carga,
// datas, municípios, classe, lente, URL, papel ou credencial. O detalhe é paginado (até 100 registros); totais e
// classificações são calculados sobre o conjunto completo e a resposta diz quando a página não é o todo.
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  compararPeriodos, conferirZero, disponibilidadePorMunicipio, ErroComparacao, leiturasDeDisponibilidade,
  textoDisponibilidadeMunicipio, unidadesDe, validarPeriodos, ROTULO_CLASSIFICACAO,
  type ConferenciaZero, type Lado, type ResultadoComparavel, type UnidadeLado,
} from '../src/comparacao.ts';
import {
  consultarDeteccoes, consultarDisponibilidade, consultarResumo, fontesAreas, type Filtro,
} from '../src/consulta.ts';
import { ErroConsulta } from '../src/erros.ts';
import { lerAreas, type LeituraAreas } from '../src/lentes/carregar-areas.ts';
import {
  CONCORRENCIA_DISPONIBILIDADE, emParalelo, lerPaginas, validarDisponibilidade, validarResumo, type FontesLente, type PedidoLente,
} from '../src/lentes/carregar.ts';
import { textoCobertura } from '../src/lentes/cobertura.ts';
import { combinar, qualificarCombinacao } from '../src/lentes/combinacao.ts';
import { qualificar } from '../src/lentes/comum.ts';
import { concentracao } from '../src/lentes/concentracao.ts';
import { ErroLente, recorteDe, type DisponibilidadeMunicipio, type EntradaLente, type Janela, type ResultadoLente } from '../src/lentes/contrato.ts';
import { persistencia } from '../src/lentes/persistencia.ts';
import { mesesDaJanela, recorrencia } from '../src/lentes/recorrencia.ts';
import { qualificarSobreposicao, sobreposicao, type ResultadoSobreposicao } from '../src/lentes/sobreposicao.ts';
import type { CargaDetalhe, Registro, Resumo } from '../src/tipos.ts';
import type { Orcamento } from './orcamento.ts';
import type { ConfigLente, Pedido } from './pedido.ts';
import { ErroHttp } from './resposta.ts';
import { distribuicaoTemporal } from './distribuicao-temporal.ts';
import { calcularPadroes } from './cruzar-criterios.ts';

export const LIMITE_DETALHE = 100;

export interface Contexto {
  cliente: SupabaseClient;
  carga: CargaDetalhe;
  /** Janela GMT da carga (dias inclusivos). */
  janelaCarga: Janela;
  nomes: Map<number, string>;
  pedido: Pedido;
  orcamento: Orcamento;
}

export type NomeFerramenta = 'explicar_selecao' | 'comparar_periodos' | 'consultar_disponibilidade' | 'ler_detalhes' | 'distribuicao_temporal' | 'cruzar_padroes';

/** Descrição do catálogo para o modelo (item 3): nomes e argumentos admitidos, todos presos ao pedido validado. */
export const CATALOGO: Record<NomeFerramenta, { descricao: string; argumentos: Record<string, string> }> = {
  explicar_selecao: { descricao: 'Destaques da lente no recorte do pedido, com motivo, evidência e cobertura.', argumentos: {} },
  comparar_periodos: { descricao: 'Comparação determinística dos dois períodos do pedido (comparacao-008-v1).', argumentos: {} },
  consultar_disponibilidade: { descricao: 'Disponibilidade por município e dia, sem agregação, nos municípios do pedido.', argumentos: {} },
  ler_detalhes: { descricao: 'Registros de detecção de um lado do pedido, paginados em até 100.', argumentos: { lado: 'A ou B (seleção: A)', pagina: 'inteiro ≥ 0' } },
  distribuicao_temporal: { descricao: 'Contagens por dia e mês GMT do período único, incluindo todos os máximos empatados.', argumentos: {} },
  cruzar_padroes: { descricao: 'Células presentes em pelo menos dois critérios distintos aplicáveis ao recorte.', argumentos: {} },
};

// --- Leitura sob JWT --------------------------------------------------------------------------------------------

const fontes = (c: SupabaseClient): FontesLente => ({
  resumo: (f) => consultarResumo(c, f),
  pagina: (f, limite, deslocamento) => consultarDeteccoes(c, f, limite, deslocamento),
  disponibilidade: (f) => consultarDisponibilidade(c, f),
});

const leituras = new WeakMap<Contexto, Map<string, Promise<{ resumo: Resumo; registros: Registro[] }>>>();

/** Resumo e todas as páginas de um recorte, conferidos; reaproveitados na mesma execução. */
function lerRecorte(ctx: Contexto, filtro: Filtro): Promise<{ resumo: Resumo; registros: Registro[] }> {
  const chave = `${filtro.inicio}|${filtro.fim}|${filtro.municipio ?? ''}`;
  let mapa = leituras.get(ctx);
  if (!mapa) { mapa = new Map(); leituras.set(ctx, mapa); }
  const existente = mapa.get(chave);
  if (existente) return existente;
  const p = ctx.orcamento.executar('leitura', async (sinal) => {
    const pedido: PedidoLente = { carga: filtro.carga, janela: { inicio: filtro.inicio, fim: filtro.fim }, municipio: filtro.municipio };
    const resumo = await consultarResumo(ctx.cliente, filtro);
    const total = validarResumo(pedido, resumo);
    const registros = await lerPaginas(fontes(ctx.cliente), pedido, total, () => !sinal.aborted);
    if (!registros || sinal.aborted) throw new Error('interrompida');
    if (registros.some((r) => !ctx.nomes.has(r.municipio_codigo))) throw new ErroHttp('leitura_inconsistente');
    return { resumo, registros };
  });
  mapa.set(chave, p);
  return p;
}

const disponibilidades = new WeakMap<Contexto, Map<string, DisponibilidadeMunicipio>>();

/**
 * Disponibilidade dos municípios pedidos (concorrência 4); falha fica no município, nunca vira classe. Respostas
 * completas da mesma execução e janela são reaproveitadas (o subagente de disponibilidade e o de lentes leem os mesmos
 * municípios); nada parcial entra no reaproveitamento.
 */
async function lerDisponibilidade(ctx: Contexto, filtro: Filtro, codigos: readonly number[]): Promise<Map<number, DisponibilidadeMunicipio>> {
  const pedido: PedidoLente = { carga: filtro.carga, janela: { inicio: filtro.inicio, fim: filtro.fim } };
  let cache = disponibilidades.get(ctx);
  if (!cache) { cache = new Map(); disponibilidades.set(ctx, cache); }
  const chave = (codigo: number) => `${filtro.inicio}|${filtro.fim}|${codigo}`;
  const disp = new Map<number, DisponibilidadeMunicipio>();
  const faltam: number[] = [];
  for (const codigo of codigos) {
    const x = cache.get(chave(codigo));
    if (x) disp.set(codigo, x); else faltam.push(codigo);
  }
  if (!faltam.length) return disp;
  const lidos = new Map<number, DisponibilidadeMunicipio>();
  await ctx.orcamento.executar('leitura', async (sinal) => {
    await emParalelo(faltam, CONCORRENCIA_DISPONIBILIDADE, () => !sinal.aborted, async (codigo) => {
    try {
      const r = await consultarDisponibilidade(ctx.cliente, { ...filtro, municipio: codigo });
      lidos.set(codigo, { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, ctx.carga.satelite, r) });
    } catch (e) {
      if (e instanceof ErroConsulta && e.tipo !== 'fonte_indisponivel' && e.tipo !== 'entrada_invalida') throw e;
      lidos.set(codigo, { estado: 'falha', motivo: e instanceof ErroLente ? e.message : 'fonte indisponível' });
    }
    });
    // Interrompida pelo orçamento ou pelo pedido: nada parcial sai daqui (o orçamento classifica o motivo).
    if (sinal.aborted) throw new Error('interrompida');
  });
  for (const [codigo, x] of lidos) {
    disp.set(codigo, x);
    if (x.estado === 'ok') cache.set(chave(codigo), x);
  }
  return disp;
}

let camadaCache: WeakMap<Contexto, Promise<LeituraAreas | null>> = new WeakMap();
const lerCamada = (ctx: Contexto): Promise<LeituraAreas | null> => {
  const x = camadaCache.get(ctx) ?? ctx.orcamento.executar('leitura', (sinal) => lerAreas(fontesAreas(ctx.cliente), ctx.carga.id, () => !sinal.aborted));
  camadaCache.set(ctx, x);
  return x;
};
/** Só para testes: esquece camadas lidas. */
export const esquecerCamadas = (): void => { camadaCache = new WeakMap(); };

// --- Cálculo --------------------------------------------------------------------------------------------------

async function calcular(ctx: Contexto, cfg: ConfigLente, janela: Janela, municipio: number | null, registros: Registro[]): Promise<ResultadoComparavel> {
  const e: EntradaLente = {
    carga: { id: ctx.carga.id, identidade: ctx.carga.identidade }, janela, registros, totalResumo: registros.length,
    nomes: ctx.nomes, recorte: recorteDe(municipio),
  };
  if (cfg.tipo === 'combinacao') return combinar(e, cfg.lentes, cfg.operador);
  if (cfg.tipo === 'sobreposicao') {
    const camada = await lerCamada(ctx);
    if (!camada) throw new ErroHttp('cancelada');
    return sobreposicao(e, camada, cfg.classe);
  }
  return { concentracao, recorrencia, persistencia }[cfg.tipo](e);
}

function qualificado(r: ResultadoComparavel, disp: Map<number, DisponibilidadeMunicipio>): ResultadoComparavel {
  if ('tipo' in r) return qualificarCombinacao(r, disp);
  if (r.lente === 'sobreposicao') return qualificarSobreposicao(r as ResultadoSobreposicao, disp);
  return qualificar(r as ResultadoLente, disp);
}

const municipiosDe = (r: ResultadoComparavel): number[] => [...new Set(unidadesDe(r).flatMap((u) => u.municipios))].sort((a, b) => a - b);

const todos = (ctx: Contexto): number[] => [...ctx.nomes.keys()].sort((a, b) => a - b);

function dentroDaCarga(ctx: Contexto, j: Janela): void {
  if (j.inicio < ctx.janelaCarga.inicio || j.fim > ctx.janelaCarga.fim) throw new ErroHttp('entrada_invalida', 'período fora da versão dos dados');
}

function municipioValido(ctx: Contexto, m: number | null): void {
  if (m !== null && !ctx.nomes.has(m)) throw new ErroHttp('entrada_invalida', 'município fora desta versão dos dados');
}

// --- Saídas resumidas (fatos para a síntese; referências para o detalhe) ------------------------------------------

function unidadeResumo(u: UnidadeLado | null): unknown {
  if (!u) return null;
  return {
    destaques: u.destaques.map((d) => ({ id: d.id_destaque, motivo: d.motivo, deteccoes: d.deteccoes.length, datas: d.datas, ressalvas: d.ressalvas })),
    cobertura: textoCobertura(u.cobertura),
  };
}

const nomeUnidade = (u: UnidadeLado['unidade']): string => (u.tipo === 'municipio' ? `${u.nome} (${u.codigo})` : `célula ${u.id}`);

function pagina<T>(itens: T[]): { itens: T[]; total: number; completo: boolean } {
  return { itens: itens.slice(0, LIMITE_DETALHE), total: itens.length, completo: itens.length <= LIMITE_DETALHE };
}

// --- Ferramentas ------------------------------------------------------------------------------------------------

async function distribuicaoTemporalF(ctx: Contexto): Promise<unknown> {
  const r = ctx.pedido.recorte;
  if (r.tipo !== 'selecao') throw new ErroHttp('entrada_invalida', 'ferramenta fora do pedido');
  dentroDaCarga(ctx, r.janela);
  municipioValido(ctx, r.municipio);
  const filtro: Filtro = { carga: ctx.carga.id, inicio: r.janela.inicio, fim: r.janela.fim, municipio: r.municipio };
  const { registros } = await lerRecorte(ctx, filtro);
  return { ferramenta: 'distribuicao_temporal', janela: r.janela, municipio: r.municipio, ...distribuicaoTemporal(registros), selecao: await explicarSelecao(ctx) };
}

async function cruzarPadroesF(ctx: Contexto): Promise<unknown> {
  const r = ctx.pedido.recorte;
  if (r.tipo !== 'selecao') throw new ErroHttp('entrada_invalida', 'ferramenta fora do pedido');
  dentroDaCarga(ctx, r.janela);
  municipioValido(ctx, r.municipio);
  const filtro: Filtro = { carga: ctx.carga.id, inicio: r.janela.inicio, fim: r.janela.fim, municipio: r.municipio };
  const { registros } = await lerRecorte(ctx, filtro);
  const entrada: EntradaLente = { carga: { id: ctx.carga.id, identidade: ctx.carga.identidade }, janela: r.janela, registros, totalResumo: registros.length, nomes: ctx.nomes, recorte: recorteDe(r.municipio) };
  const municipios = [...new Set(registros.map((x) => x.municipio_codigo))].sort((a, b) => a - b);
  const disp = await lerDisponibilidade(ctx, filtro, r.municipio === null ? municipios : [r.municipio]);
  if ([...disp.values()].some((d) => d.estado !== 'ok')) throw new ErroHttp('leitura_inconsistente');
  const camada = await lerCamada(ctx);
  if (!camada) throw new ErroHttp('cancelada');
  const resultado = calcularPadroes(entrada, camada, disp);
  return { ferramenta: 'cruzar_padroes', janela: r.janela, municipio: r.municipio, ...resultado, disponibilidade: disponibilidadePorMunicipio(r.municipio === null ? municipios : [r.municipio], r.janela, disp).map((x) => linhaMunicipio(ctx, x)), limitacao: 'Células não seguem divisas; critérios não indicam gravidade ou prioridade.' };
}

async function explicarSelecao(ctx: Contexto): Promise<unknown> {
  const r = ctx.pedido.recorte;
  if (r.tipo !== 'selecao') throw new ErroHttp('entrada_invalida', 'ferramenta fora do pedido');
  dentroDaCarga(ctx, r.janela);
  municipioValido(ctx, r.municipio);
  const filtro: Filtro = { carga: ctx.carga.id, inicio: r.janela.inicio, fim: r.janela.fim, municipio: r.municipio };
  const { registros } = await lerRecorte(ctx, filtro);
  if (!r.lente) return { ferramenta: 'explicar_selecao', janela: r.janela, municipio: r.municipio, total_deteccoes: registros.length, lente: null, limitacoes: ['Zero observado não comprova ausência de fogo; disponibilidade é avaliada separadamente.'] };
  const bruto = await calcular(ctx, r.lente, r.janela, r.municipio, registros);
  const resultado = qualificado(bruto, await lerDisponibilidade(ctx, filtro, municipiosDe(bruto)));
  const unidades = unidadesDe(resultado);
  return {
    ferramenta: 'explicar_selecao', janela: r.janela, municipio: r.municipio, total_deteccoes: registros.length,
    versao: 'tipo' in resultado ? [resultado.versao_combinacao, resultado.versao_metodo] : [resultado.versao_metodo],
    estado: resultado.estado,
    unidades: pagina(unidades.map((u) => ({ chave: u.chave, unidade: nomeUnidade(u.unidade), ...unidadeResumo(u) as object }))),
    limitacoes: resultado.limitacoes,
  };
}

async function lado(ctx: Contexto, filtro: Filtro, cfg: ConfigLente | null, janela: Janela) {
  const { resumo, registros } = await lerRecorte(ctx, filtro);
  const bruto = cfg ? await calcular(ctx, cfg, janela, filtro.municipio, registros) : null;
  return { filtro, resumo, registros, bruto, recorte: filtro.municipio === null ? todos(ctx) : [filtro.municipio] };
}

async function qualificarLados(ctx: Contexto, lados: Awaited<ReturnType<typeof lado>>[]) {
  const disp: Map<number, DisponibilidadeMunicipio>[] = [];
  for (const [i, l] of lados.entries()) {
    const pedidos = leiturasDeDisponibilidade([{
      lado: (i === 0 ? 'A' : 'B') as Lado, destaques: l.bruto ? municipiosDe(l.bruto) : [], zero: l.registros.length === 0, lidos: new Set(),
    }], l.recorte, l.filtro.municipio !== null);
    disp.push(await lerDisponibilidade(ctx, l.filtro, pedidos.map((p) => p.codigo)));
  }
  const zero = (l: Awaited<ReturnType<typeof lado>>, d: Map<number, DisponibilidadeMunicipio>): ConferenciaZero =>
    (l.registros.length === 0 ? conferirZero(l.recorte, { inicio: l.filtro.inicio, fim: l.filtro.fim }, d) : { estado: 'nao_necessaria' });
  return lados.map((l, i) => {
    const d = disp[i] ?? new Map();
    return { ...l, disp: d, resultado: l.bruto ? qualificado(l.bruto, d) : null, zero: zero(l, d) };
  });
}

async function compararPeriodosF(ctx: Contexto): Promise<unknown> {
  const r = ctx.pedido.recorte;
  if (r.tipo !== 'periodos') throw new ErroHttp('entrada_invalida', 'ferramenta fora do pedido');
  municipioValido(ctx, r.municipio);
  const v = validarPeriodos(ctx.janelaCarga, r.a, r.b);
  const fa: Filtro = { carga: ctx.carga.id, inicio: r.a.inicio, fim: r.a.fim, municipio: r.municipio };
  const fb: Filtro = { ...fa, inicio: r.b.inicio, fim: r.b.fim };
  const [la, lb] = await qualificarLados(ctx, await Promise.all([lado(ctx, fa, r.lente, r.a), lado(ctx, fb, r.lente, r.b)]));
  if (!la || !lb) throw new ErroHttp('leitura_inconsistente');
  const c = compararPeriodos(
    { janela: r.a, total: la.registros.length, resultado: la.resultado, zero: la.zero },
    { janela: r.b, total: lb.registros.length, resultado: lb.resultado, zero: lb.zero }, v);
  return {
    ferramenta: 'comparar_periodos', versao: c.versao, a: { janela: r.a, total: c.a.total, unidades: c.a.unidades.length },
    b: { janela: r.b, total: c.b.total, unidades: c.b.unidades.length }, dias: v.dias, dias_em_comum: v.diasEmComum.length,
    conclusao: c.conclusao, contagem: c.contagem, diferenca_total: c.diferencaTotal,
    meses: c.meses && { a: c.meses.a.map((m) => m.mes + (m.parcial ? ' (parcial)' : '')), b: c.meses.b.map((m) => m.mes + (m.parcial ? ' (parcial)' : '')) },
    itens: pagina(c.itens.map((i) => ({
      chave: i.chave, unidade: nomeUnidade(i.unidade), classificacao: ROTULO_CLASSIFICACAO[i.classificacao], a: unidadeResumo(i.a), b: unidadeResumo(i.b),
      disponibilidade_a: i.disponibilidadeA.estado === 'avaliada' ? textoCobertura(i.disponibilidadeA.cobertura) : 'não avaliável',
      disponibilidade_b: i.disponibilidadeB.estado === 'avaliada' ? textoCobertura(i.disponibilidadeB.cobertura) : 'não avaliável',
    }))),
    ressalvas: c.ressalvas,
  };
}

const linhaMunicipio = (ctx: Contexto, x: ReturnType<typeof disponibilidadePorMunicipio>[number]) => ({
  municipio: `${ctx.nomes.get(x.codigo) ?? ''} (${x.codigo})`, texto: textoDisponibilidadeMunicipio(x), ...(x.estado === 'completa' ? { por_classe: x.porClasse } : {}),
});

// Issue #111 (decisão G1, opção A): com lista longa, a análise cita só alguns municípios com ressalva comprovada.
// Frases fixas sem algarismos: nada aqui pode sustentar uma contagem de municípios na conferência.
export const MAX_MUNICIPIOS_CITADOS = 8;
export const LISTA_PARCIAL = 'Lista longa: a análise cita só alguns municípios com ressalva comprovada; os demais ficam só nesta evidência, sem contagem nem resumo.';
export const SEM_RESSALVA = 'Nenhum município desta lista tem lacuna conhecida ou incidência indeterminada; isso não comprova cobertura.';

/**
 * Marca cada município com `ressalva` (lacuna conhecida ou incidência indeterminada nas classes avaliadas) e, com mais
 * de 8 municípios, acrescenta `lista_parcial` ou, se todos foram avaliados e nenhum tem ressalva, `sem_ressalva`.
 * Não soma nem agrupa municípios.
 */
export function marcarRessalvas<T extends { por_classe?: { lacuna_conhecida: number; incidencia_indeterminada: number } }>(municipios: readonly T[]) {
  const marcados = municipios.map((m) => ({ ...m, ressalva: Boolean(m.por_classe && (m.por_classe.lacuna_conhecida > 0 || m.por_classe.incidencia_indeterminada > 0)) }));
  if (marcados.length <= MAX_MUNICIPIOS_CITADOS) return { municipios: marcados };
  const semNenhuma = marcados.every((m) => m.por_classe && !m.ressalva);
  return { municipios: marcados, ...(semNenhuma ? { sem_ressalva: SEM_RESSALVA } : { lista_parcial: LISTA_PARCIAL }) };
}

const NOTA_DISPONIBILIDADE = 'Disponibilidade não comprova cobertura; cada município tem as próprias classes, sem agregação.';
export const SEM_MUNICIPIOS = 'Nenhum município a conferir neste lado: sem destaques (sem lente aplicada ou lente sem destaques). Isto não indica falta de dados.';

function textoZero(z: ConferenciaZero): string | null {
  if (z.estado === 'nao_necessaria') return null;
  if (z.estado === 'completa') return z.lacunaTotal ? 'lado sem detecções e com lacuna conhecida em todos os dias de todos os municípios do recorte: comparação indisponível' : 'lado sem detecções; conferência de todos os municípios do recorte concluída, sem lacuna total';
  if (z.estado === 'falha') return `lado sem detecções; conferência dos municípios não concluída (${z.motivo}): nada conclusivo`;
  return 'lado sem detecções; conferência dos municípios não concluída: nada conclusivo';
}

/**
 * Disponibilidade por município e dia, sem agregação (T3, CP-18): no pedido de disponibilidade, os municípios
 * pedidos; na seleção e nas comparações, só os municípios exigidos pelos destaques de cada lado (todos os do recorte
 * num lado sem detecções), com o alcance declarado. Nunca declara disponibilidade estadual ao examinar uma seleção.
 */
async function consultarDisponibilidadeF(ctx: Contexto): Promise<unknown> {
  const r = ctx.pedido.recorte;
  let lados: { lado: Lado; janela: Janela; municipio: number | null; codigos: number[]; disp: Map<number, DisponibilidadeMunicipio>; zero: ConferenciaZero }[];
  if (r.tipo === 'selecao') {
    dentroDaCarga(ctx, r.janela);
    municipioValido(ctx, r.municipio);
    const filtro: Filtro = { carga: ctx.carga.id, inicio: r.janela.inicio, fim: r.janela.fim, municipio: r.municipio };
    const { registros } = await lerRecorte(ctx, filtro);
    const codigos = r.municipio !== null ? [r.municipio] : r.lente ? municipiosDe(await calcular(ctx, r.lente, r.janela, null, registros)) : [...new Set(registros.map((x) => x.municipio_codigo))].sort((a, b) => a - b);
    lados = [{ lado: 'A', janela: r.janela, municipio: r.municipio, codigos, disp: await lerDisponibilidade(ctx, filtro, codigos), zero: { estado: 'nao_necessaria' } }];
  } else {
    let filtros: [Filtro, Filtro];
    let janelas: [Janela, Janela];
    municipioValido(ctx, r.municipio);
    validarPeriodos(ctx.janelaCarga, r.a, r.b);
    const fa: Filtro = { carga: ctx.carga.id, inicio: r.a.inicio, fim: r.a.fim, municipio: r.municipio };
    filtros = [fa, { ...fa, inicio: r.b.inicio, fim: r.b.fim }];
    janelas = [r.a, r.b];
    const q = await qualificarLados(ctx, await Promise.all([0, 1].map((i) => lado(ctx, filtros[i]!, r.lente, janelas[i]!))));
    lados = q.map((l, i) => ({
      lado: (i === 0 ? 'A' : 'B') as Lado, janela: janelas[i]!, municipio: l.filtro.municipio,
      codigos: [...l.disp.keys()].sort((x, y) => x - y), disp: l.disp, zero: l.zero,
    }));
  }
  const ressalvas: unknown[] = [];
  for (const l of lados) {
    if ([...l.disp.values()].some((d) => d.estado !== 'ok') || l.disp.size !== l.codigos.length) throw new ErroHttp('leitura_inconsistente');
    const filtro: Filtro = { carga: ctx.carga.id, inicio: l.janela.inicio, fim: l.janela.fim, municipio: l.municipio };
    if (r.lente) {
      const { registros } = await lerRecorte(ctx, filtro);
      const resultado = qualificado(await calcular(ctx, r.lente, l.janela, l.municipio, registros), l.disp);
      ressalvas.push({ lado: l.lado, unidades: unidadesDe(resultado).map((u) => ({ unidade: nomeUnidade(u.unidade), cobertura: textoCobertura(u.cobertura), destaques: u.destaques.map((d) => ({ motivo: d.motivo, datas: d.datas, ressalvas: d.ressalvas })) })) });
    }
    const parciais = mesesDaJanela(l.janela).filter((m) => m.parcial);
    if (parciais.length) ressalvas.push({ lado: l.lado, meses_parciais: parciais });
  }
  if (r.tipo === 'periodos') ressalvas.push({ comparacao: await compararPeriodosF(ctx) });
  const estadual = lados.some((l) => l.municipio === null);
  return {
    ferramenta: 'consultar_disponibilidade',
    ressalvas,
    estado: lados.some((l) => l.codigos.length === 0) && r.tipo === 'selecao' && !r.lente ? 'dados_insuficientes' : 'avaliada',
    alcance: estadual
      ? r.tipo === 'selecao' && !r.lente ? 'subconjunto dos municípios associados às detecções do recorte; lista explícita em lados; não é disponibilidade estadual completa' : 'municípios exigidos pelos destaques de cada lado (todos os do recorte só num lado sem detecções); não é disponibilidade estadual completa'
      : 'municípios do recorte do pedido',
    lados: lados.map((l) => ({
      lado: l.lado, janela: l.janela,
      ...marcarRessalvas(disponibilidadePorMunicipio(l.codigos, l.janela, l.disp).map((x) => linhaMunicipio(ctx, x))),
      // Issue #81: lista vazia por alcance (sem destaques) foi lida pelo modelo como falta de dados.
      ...(l.codigos.length ? {} : { sem_municipios: r.tipo === 'selecao' && !r.lente ? 'Sem detecções no recorte: disponibilidade estadual não avaliada; dados insuficientes para concluir sobre a ausência.' : SEM_MUNICIPIOS }),
      ...(textoZero(l.zero) ? { conferencia_sem_deteccoes: textoZero(l.zero) } : {}),
    })),
    nota: NOTA_DISPONIBILIDADE,
  };
}

/** Registros públicos de um lado do pedido, paginados em até 100; o total é o do conjunto completo. */
async function lerDetalhes(ctx: Contexto, args: { lado?: unknown; pagina?: unknown }): Promise<unknown> {
  const r = ctx.pedido.recorte;
  const lado = args.lado ?? 'A';
  const p = args.pagina ?? 0;
  if ((lado !== 'A' && lado !== 'B') || !Number.isSafeInteger(p) || (p as number) < 0) throw new ErroHttp('entrada_invalida', 'argumentos de ler_detalhes');
  let filtro: Filtro;
  if (r.tipo === 'selecao' && lado === 'A') filtro = { carga: ctx.carga.id, inicio: r.janela.inicio, fim: r.janela.fim, municipio: r.municipio };
  else if (r.tipo === 'periodos') { const j = lado === 'A' ? r.a : r.b; filtro = { carga: ctx.carga.id, inicio: j.inicio, fim: j.fim, municipio: r.municipio }; }
  else throw new ErroHttp('entrada_invalida', 'ler_detalhes fora do pedido');
  dentroDaCarga(ctx, { inicio: filtro.inicio, fim: filtro.fim });
  municipioValido(ctx, filtro.municipio);
  const { registros } = await lerRecorte(ctx, filtro);
  const inicio = (p as number) * LIMITE_DETALHE;
  return {
    ferramenta: 'ler_detalhes', lado, pagina: p, total: registros.length,
    completo: inicio === 0 && registros.length <= LIMITE_DETALHE,
    registros: registros.slice(inicio, inicio + LIMITE_DETALHE).map((x) => ({
      id: x.id_tecnico, data_hora_gmt: x.data_hora_gmt, latitude: x.latitude, longitude: x.longitude,
      municipio: `${ctx.nomes.get(x.municipio_codigo) ?? ''} (${x.municipio_codigo})`,
    })),
  };
}

/**
 * Recorte fixado contra a carga vigente antes de qualquer chamada ao provedor (T4): período dentro da versão, igual
 * duração dos períodos e municípios válidos. Pedido inválido não chega ao modelo.
 */
export function validarRecorte(ctx: Contexto): void {
  const r = ctx.pedido.recorte;
  try {
    if (r.municipio !== null && (r.lente?.tipo === 'concentracao' || (r.lente?.tipo === 'combinacao' && r.lente.lentes.includes('concentracao')))) throw new ErroHttp('entrada_invalida', 'concentração exige recorte estadual');
    if (r.tipo === 'periodos') { municipioValido(ctx, r.municipio); validarPeriodos(ctx.janelaCarga, r.a, r.b); return; }
    dentroDaCarga(ctx, r.janela);
    municipioValido(ctx, r.municipio);
  } catch (e) {
    if (e instanceof ErroComparacao) throw new ErroHttp('entrada_invalida', e.message);
    throw e;
  }
}

/** Executa uma ferramenta do catálogo; nome fora do catálogo ou argumento fora do pedido é recusado. */
export async function executarFerramenta(ctx: Contexto, nome: string, args: Record<string, unknown> = {}): Promise<unknown> {
  if (!Object.hasOwn(CATALOGO, nome)) throw new ErroHttp('entrada_invalida', 'ferramenta fora do catálogo');
  if (!ferramentasPermitidas(ctx.pedido).includes(nome as NomeFerramenta)) throw new ErroHttp('entrada_invalida', 'ferramenta fora do pedido');
  const admitidos = Object.keys(CATALOGO[nome as NomeFerramenta].argumentos);
  if (Object.keys(args).some((k) => !admitidos.includes(k))) throw new ErroHttp('entrada_invalida', 'argumento não admitido');
  try {
    switch (nome as NomeFerramenta) {
      case 'explicar_selecao': return await explicarSelecao(ctx);
      case 'comparar_periodos': return await compararPeriodosF(ctx);
      case 'consultar_disponibilidade': return await consultarDisponibilidadeF(ctx);
      case 'ler_detalhes': return await lerDetalhes(ctx, args);
      case 'distribuicao_temporal': return await distribuicaoTemporalF(ctx);
      case 'cruzar_padroes': return await cruzarPadroesF(ctx);
    }
  } catch (e) {
    if (e instanceof ErroComparacao) throw new ErroHttp('entrada_invalida', e.message);
    throw e;
  }
}

/** Ferramenta principal de cada tipo de pedido (item 2: uma por execução; a orquestração entra no item 3). */
export const FERRAMENTA_DO_PEDIDO: Record<Pedido['recorte']['tipo'], NomeFerramenta> = {
  selecao: 'explicar_selecao', periodos: 'comparar_periodos',
};

/** Ferramentas determinísticas pertinentes ao ID; nenhuma seleção livre pelo modelo. */
export function ferramentasPermitidas(p: Pedido): NomeFerramenta[] {
  switch (p.pergunta_id) {
    case 'panorama': return ['distribuicao_temporal', 'explicar_selecao', 'consultar_disponibilidade'];
    case 'mudanca': return ['comparar_periodos', 'consultar_disponibilidade'];
    case 'padroes': return ['cruzar_padroes', 'consultar_disponibilidade'];
    case 'cuidados': return ['consultar_disponibilidade'];
    case 'proximos': return ['cruzar_padroes', 'distribuicao_temporal', 'consultar_disponibilidade'];
  }
}
