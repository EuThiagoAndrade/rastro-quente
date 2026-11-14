// Ciclo 006, issue #51 — fontes do leitor T25 (`src/lentes/carregar-areas.ts`) sobre a API real, com o
// cliente supabase-js e a sessão de um usuário (RLS integral). Usado pelo teste da API local e pela conferência
// local da lente. A resposta HTTP 416 (`PGRST103`) vira `fora_da_faixa` (R3-1); os demais erros são
// classificados como na interface. A sondagem é a existente (`sondarAcesso`).
import { createClient } from '@supabase/supabase-js';
import { sondarAcesso } from '../../src/consulta.ts';
import { classificarErro, ErroConsulta } from '../../src/erros.ts';

const COLUNAS_AREA = 'carga_id,fonte,codigo,nome,classe,categoria,fase,modalidade,esfera,qualidade';
const COLUNAS_VINCULO = 'carga_id,id_tecnico,area_fonte,area_codigo,posicao';

export function clienteSessao(api, chaveAnon, token) {
  return createClient(api, chaveAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function falha(r) {
  throw new ErroConsulta(classificarErro(r.error, r.status), r.error?.message ?? `HTTP ${r.status}`);
}

async function pagina(consulta, desloc, limite) {
  const r = await consulta.range(desloc, desloc + limite - 1);
  if (r.status === 416 && r.error?.code === 'PGRST103') return { fora_da_faixa: true };
  if (r.error) falha(r);
  if (!Number.isInteger(r.count)) throw new ErroConsulta('fonte_indisponivel', 'contagem exata ausente');
  return { linhas: r.data ?? [], total: r.count };
}

/** Fontes de T25 com um cliente já autenticado; `aoLerVinculos(desloc)` permite intervir entre páginas no teste. */
export function fontesAreas(c, { aoLerVinculos = async () => {} } = {}) {
  return {
    async carga(id) {
      const r = await c.from('cargas').select('id,identidade,total_areas,total_vinculos_area').eq('id', id);
      if (r.error) falha(r);
      return r.data[0] ?? null;
    },
    areas: (carga, desloc, limite, comGeometria) => pagina(
      c.from('areas').select(comGeometria ? `${COLUNAS_AREA},geometria_geral` : COLUNAS_AREA, { count: 'exact' })
        .eq('carga_id', carga).order('carga_id').order('fonte').order('codigo'),
      desloc, limite),
    async vinculos(carga, desloc, limite) {
      await aoLerVinculos(desloc);
      return pagina(
        c.from('deteccoes_areas').select(COLUNAS_VINCULO, { count: 'exact' })
          .eq('carga_id', carga).order('carga_id').order('id_tecnico').order('area_fonte').order('area_codigo'),
        desloc, limite);
    },
    sondar: () => sondarAcesso(c),
    async vigente() {
      const r = await c.from('publicacao_vigente').select('carga_id');
      if (r.error) falha(r);
      return r.data[0]?.carga_id ?? null;
    },
  };
}
