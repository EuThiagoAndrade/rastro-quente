// Consultas ao contrato do banco, sempre sob a sessão do usuário (RLS vale integralmente).
// Cada chamada fixa a carga (versão) quando ela é conhecida.
import type { SupabaseClient } from '@supabase/supabase-js';
import { classificarErro, ErroConsulta, type ErroApi } from './erros.ts';
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
