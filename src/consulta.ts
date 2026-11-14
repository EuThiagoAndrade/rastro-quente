// Consultas ao contrato do banco, sempre sob a sessão do usuário (RLS vale integralmente).
// Cada chamada fixa a carga (versão) quando ela é conhecida.
import type { SupabaseClient } from '@supabase/supabase-js';
import { classificarErro, ErroConsulta, type ErroApi } from './erros.ts';
import type { AreaLida, FontesAreas, PaginaTabela, VinculoLido } from './lentes/carregar-areas.ts';
import type {
  CargaDetalhe, Disponibilidade, Fonte, Limite, Malha, MunicipioItem, PaginaDeteccoes, Resumo,
} from './tipos.ts';

interface RespostaSdk<T> {
  data: T | null;
  error: ErroApi | null;
  status: number;
}

function desembrulhar<T>(r: RespostaSdk<T>): T {
  if (r.error) throw new ErroConsulta(classificarErro(r.error, r.status), r.error.message ?? 'erro');
  if (r.data === null) throw new ErroConsulta('fonte_indisponivel', 'resposta vazia');
  return r.data;
}

/** Carga vigente: só o RP enxerga a linha; lista vazia é "sem acesso ou sem publicação". */
export async function lerCargaVigente(c: SupabaseClient): Promise<CargaDetalhe | null> {
  const v = desembrulhar((await c.from('publicacao_vigente').select('carga_id')) as unknown as RespostaSdk<{ carga_id: number }[]>);
  const id = v[0]?.carga_id;
  if (id === undefined) return null;
  const cargas = desembrulhar((await c.from('cargas').select(
    'id,identidade,satelite,janela_inicio,janela_fim,envelope_inicio,envelope_fim,fuso_sensibilidade,metodo,total_principal,total_envelope,total_municipios,total_disponibilidade,publicada_em',
  ).eq('id', id)) as unknown as RespostaSdk<CargaDetalhe[]>);
  const carga = cargas[0];
  if (!carga) throw new ErroConsulta('versao_substituida', 'carga vigente indisponível');
  return carga;
}

/** Distingue OA (acesso negado) de RP sem publicação, usando um período inválido de propósito. */
export async function sondarAcesso(c: SupabaseClient): Promise<'negado' | 'sem_publicacao' | 'autorizado'> {
  const r = (await c.rpc('consultar_resumo', { p_inicio: '2000-01-01', p_fim: '2000-01-01' })) as unknown as RespostaSdk<unknown>;
  if (!r.error) return 'autorizado';
  const tipo = classificarErro(r.error, r.status);
  if (tipo === 'acesso_negado') return 'negado';
  if (tipo === 'sem_publicacao') return 'sem_publicacao';
  if (tipo === 'entrada_invalida') return 'autorizado';
  throw new ErroConsulta(tipo, r.error.message ?? 'erro');
}

export async function lerMunicipios(c: SupabaseClient, carga: number): Promise<MunicipioItem[]> {
  return desembrulhar((await c.from('municipios').select('codigo,nome').eq('carga_id', carga).order('nome')
    .order('codigo')) as unknown as RespostaSdk<MunicipioItem[]>);
}

export async function lerProveniencia(c: SupabaseClient, carga: number): Promise<{ fontes: Fonte[]; malhas: Malha[] }> {
  const fontes = desembrulhar((await c.from('fontes').select('chave,papel,url,sha256,bytes,obtida_em,condicoes_uso')
    .eq('carga_id', carga).order('chave')) as unknown as RespostaSdk<Fonte[]>);
  const malhas = desembrulhar((await c.from('malhas').select('uso,fonte_chave,qualidade,parametros')
    .eq('carga_id', carga).order('uso')) as unknown as RespostaSdk<Malha[]>);
  return { fontes, malhas };
}

export interface Filtro {
  carga: number;
  inicio: string;
  fim: string;
  municipio: number | null;
}

const base = (f: Filtro) => ({ p_inicio: f.inicio, p_fim: f.fim, p_municipio: f.municipio, p_carga: f.carga });

export async function consultarResumo(c: SupabaseClient, f: Filtro): Promise<Resumo> {
  return desembrulhar((await c.rpc('consultar_resumo', base(f))) as unknown as RespostaSdk<Resumo>);
}

export async function consultarDeteccoes(c: SupabaseClient, f: Filtro, limite: number, deslocamento: number): Promise<PaginaDeteccoes> {
  return desembrulhar((await c.rpc('consultar_deteccoes', { ...base(f), p_limite: limite, p_deslocamento: deslocamento })) as unknown as RespostaSdk<PaginaDeteccoes>);
}

export async function consultarDisponibilidade(c: SupabaseClient, f: Filtro): Promise<Disponibilidade> {
  return desembrulhar((await c.rpc('consultar_disponibilidade', base(f))) as unknown as RespostaSdk<Disponibilidade>);
}

/** Geometria de exibição sob demanda: um município ou todos (uma requisição). */
export async function lerLimites(c: SupabaseClient, carga: number, municipio: number | null): Promise<Limite[]> {
  let q = c.from('municipios').select('codigo,nome,geometria_exibicao').eq('carga_id', carga);
  if (municipio !== null) q = q.eq('codigo', municipio);
  return desembrulhar((await q.order('codigo')) as unknown as RespostaSdk<Limite[]>);
}

// --- Áreas protegidas (plano 006, T24 e T25) -------------------------------------------------------------

const COLUNAS_AREA = 'carga_id,fonte,codigo,nome,classe,categoria,fase,modalidade,esfera,qualidade';
const COLUNAS_VINCULO = 'carga_id,id_tecnico,area_fonte,area_codigo,posicao';

interface RespostaContada<T> extends RespostaSdk<T> {
  count: number | null;
}

interface ConsultaPaginavel {
  range(de: number, ate: number): PromiseLike<unknown>;
}

/** Página com contagem exata; a resposta HTTP 416 (`PGRST103`) vira `fora_da_faixa` (R3-1). */
async function paginaContada<T>(q: ConsultaPaginavel, deslocamento: number, limite: number): Promise<PaginaTabela<T>> {
  const r = (await q.range(deslocamento, deslocamento + limite - 1)) as RespostaContada<T[]>;
  if (r.status === 416 && r.error?.code === 'PGRST103') return { fora_da_faixa: true };
  if (r.error) throw new ErroConsulta(classificarErro(r.error, r.status), r.error.message ?? 'erro');
  if (typeof r.count !== 'number' || !Number.isInteger(r.count)) throw new ErroConsulta('fonte_indisponivel', 'contagem exata ausente');
  return { linhas: r.data ?? [], total: r.count };
}

/** Fontes do leitor T25 sobre a API, sob a sessão do usuário (RLS integral). */
export function fontesAreas(c: SupabaseClient): FontesAreas {
  return {
    async carga(id) {
      const linhas = desembrulhar((await c.from('cargas').select('id,identidade,total_areas,total_vinculos_area').eq('id', id)) as unknown as RespostaSdk<
        { id: number; identidade: string; total_areas: number | null; total_vinculos_area: number | null }[]>);
      return linhas[0] ?? null;
    },
    areas: (carga, deslocamento, limite, comGeometria) => paginaContada<AreaLida>(
      c.from('areas').select(comGeometria ? `${COLUNAS_AREA},geometria_geral` : COLUNAS_AREA, { count: 'exact' })
        .eq('carga_id', carga).order('carga_id').order('fonte').order('codigo'),
      deslocamento, limite),
    vinculos: (carga, deslocamento, limite) => paginaContada<VinculoLido>(
      c.from('deteccoes_areas').select(COLUNAS_VINCULO, { count: 'exact' })
        .eq('carga_id', carga).order('carga_id').order('id_tecnico').order('area_fonte').order('area_codigo'),
      deslocamento, limite),
    sondar: () => sondarAcesso(c),
    async vigente() {
      const v = desembrulhar((await c.from('publicacao_vigente').select('carga_id')) as unknown as RespostaSdk<{ carga_id: number }[]>);
      return v[0]?.carga_id ?? null;
    },
  };
}

/** Contorno real de uma área, sob demanda (uma requisição por área); `null` se a RLS não mostra a linha. */
export async function lerContornoReal(c: SupabaseClient, carga: number, fonte: string, codigo: string): Promise<unknown | null> {
  const linhas = desembrulhar((await c.from('areas').select('geometria_real').eq('carga_id', carga).eq('fonte', fonte)
    .eq('codigo', codigo)) as unknown as RespostaSdk<{ geometria_real: unknown }[]>);
  if (linhas.length > 1) throw new ErroConsulta('fonte_indisponivel', 'área repetida');
  return linhas[0]?.geometria_real ?? null;
}
