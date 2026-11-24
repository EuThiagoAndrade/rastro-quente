// Handler do "Pergunte ao mapa" (ciclo 012, issue #113): `/api/interpretar` traduz a pergunta nos filtros da tela com
// uma única chamada ao Gemini, em saída estruturada e sem ferramentas. Mesma ordem de validações de `/api/explicar`:
// habilitação → método e origem → formato e limites → JWT → autorização vigente sob RLS → eco da carga. Ao modelo vão
// só a pergunta, a janela e os nomes públicos de município; nenhum dado de detecção nem identificação do usuário. O
// log registra etapa, código, duração e tokens, nunca a pergunta.
import type { SupabaseClient } from '@supabase/supabase-js';
import { lerMunicipios } from '../src/consulta.ts';
import { ErroConsulta, type TipoErro } from '../src/erros.ts';
import { primeiroDiaGmt, ultimoDiaGmt } from '../src/formato.ts';
import { ESQUEMA_INTERPRETACAO, instrucaoSistema, LIMITE_PERGUNTA_MAPA, validarInterpretacao, type ContextoPergunta } from '../src/pergunte.ts';
import type { ConfigLigada, ConfigServidor } from './config.ts';
import { autorizar, origemPermitida } from './explicar.ts';
import type { Provedor } from './gemini.ts';
import { erro, ErroHttp, json, type CodigoErro } from './resposta.ts';

/** Corpo pequeno: a pergunta (até 300 caracteres) e a identificação da carga. */
export const LIMITE_CORPO_INTERPRETAR = 4 * 1024;
/** Tempo máximo da chamada ao provedor; o navegador espera o mesmo e então usa o interpretador local. */
export const TEMPO_PROVEDOR_MS = 20_000;

export interface DependenciasInterpretar {
  config: ConfigServidor;
  criarCliente(config: ConfigLigada, token: string, sinal: () => AbortSignal): SupabaseClient;
  provedor(config: ConfigLigada): Provedor;
  registrar?: (evento: { etapa: string; ms: number; codigo?: string; tokens?: number | null }) => void;
}

const DE_CONSULTA: Record<TipoErro, CodigoErro> = {
  acesso_negado: 'acesso_negado', sessao_expirada: 'nao_autenticado', versao_substituida: 'versao_substituida',
  sem_publicacao: 'sem_publicacao', entrada_invalida: 'entrada_invalida', fonte_indisponivel: 'fonte_indisponivel',
};

function classificar(e: unknown): ErroHttp {
  if (e instanceof ErroHttp) return e;
  if (e instanceof ErroConsulta) return new ErroHttp(DE_CONSULTA[e.tipo]);
  if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError')) return new ErroHttp('tempo_esgotado');
  return new ErroHttp('fonte_indisponivel');
}

const invalido = (campo: string): never => { throw new ErroHttp('entrada_invalida', campo); };

/** Pedido fechado: `{ pergunta, carga: { id, identidade } }`, sem campos extras. */
export function validarPedidoInterpretar(texto: string): { pergunta: string; carga: { id: number; identidade: string } } {
  let o: unknown;
  try { o = JSON.parse(texto); } catch { return invalido('JSON'); }
  if (typeof o !== 'object' || o === null || Array.isArray(o)) return invalido('pedido');
  const p = o as Record<string, unknown>;
  if (Object.keys(p).some((k) => k !== 'pergunta' && k !== 'carga')) return invalido('pedido: campo não admitido');
  const pergunta = p['pergunta'];
  if (typeof pergunta !== 'string' || !pergunta.trim() || pergunta.length > LIMITE_PERGUNTA_MAPA) return invalido('pergunta');
  const c = p['carga'];
  if (typeof c !== 'object' || c === null || Array.isArray(c)) return invalido('carga');
  const carga = c as Record<string, unknown>;
  if (Object.keys(carga).some((k) => k !== 'id' && k !== 'identidade')) return invalido('carga: campo não admitido');
  if (!Number.isSafeInteger(carga['id']) || (carga['id'] as number) <= 0) return invalido('carga.id');
  if (typeof carga['identidade'] !== 'string' || !/^[0-9a-f]{64}$/.test(carga['identidade'])) return invalido('carga.identidade');
  return { pergunta: pergunta.trim(), carga: { id: carga['id'] as number, identidade: carga['identidade'] } };
}

async function lerCorpoLimitado(request: Request): Promise<string> {
  if (Number(request.headers.get('content-length') ?? '0') > LIMITE_CORPO_INTERPRETAR) throw new ErroHttp('corpo_excessivo');
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > LIMITE_CORPO_INTERPRETAR) throw new ErroHttp('corpo_excessivo');
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return invalido('UTF-8'); }
}

export async function tratarInterpretar(request: Request, deps: DependenciasInterpretar): Promise<Response> {
  const config = deps.config;
  const registrar = deps.registrar ?? (() => {});
  const t0 = performance.now();
  const fim = (r: Response, etapa: string, tokens?: number | null): Response => {
    registrar({ etapa, ms: Math.round(performance.now() - t0), codigo: String(r.status), ...(tokens !== undefined ? { tokens } : {}) });
    return r;
  };
  if (!config.habilitada) return fim(erro('ia_desabilitada'), 'desligada');
  if (request.method !== 'POST') return fim(erro('metodo_nao_permitido'), 'metodo');
  if (!origemPermitida(request, config)) return fim(erro('origem_negada'), 'origem');
  let pedido: ReturnType<typeof validarPedidoInterpretar>;
  try {
    pedido = validarPedidoInterpretar(await lerCorpoLimitado(request));
  } catch (e) {
    const x = classificar(e);
    return fim(erro(x.codigo, x.detalhe), 'pedido');
  }
  const token = /^Bearer ([A-Za-z0-9._-]+)$/.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!token) return fim(erro('nao_autenticado'), 'sessao');
  const sinal = AbortSignal.any([request.signal, AbortSignal.timeout(TEMPO_PROVEDOR_MS + 5_000)]);
  const cliente = deps.criarCliente(config, token, () => sinal);
  let ctx: ContextoPergunta;
  try {
    const usuario = await cliente.auth.getUser(token);
    if (usuario.error || !usuario.data.user || usuario.data.user.role !== 'authenticated') return fim(erro('nao_autenticado'), 'sessao');
    const vigente = await autorizar(cliente);
    if (pedido.carga.id !== vigente.id || pedido.carga.identidade !== vigente.identidade) throw new ErroHttp('versao_substituida');
    const municipios = await lerMunicipios(cliente, vigente.id);
    ctx = { janela: { inicio: primeiroDiaGmt(vigente.janela_inicio), fim: ultimoDiaGmt(vigente.janela_fim) }, municipios };
  } catch (e) {
    const x = classificar(e);
    return fim(erro(x.codigo, x.codigo === 'entrada_invalida' ? x.detalhe : undefined), 'erro');
  }
  let tokens: number | null = null;
  try {
    const provedor = deps.provedor(config);
    const r = await provedor.interagir({
      sistema: instrucaoSistema(ctx),
      entrada: [{ type: 'user_input', content: [{ type: 'text', text: pedido.pergunta }] }],
      esquema: ESQUEMA_INTERPRETACAO as unknown as Record<string, unknown>,
    }, AbortSignal.any([sinal, AbortSignal.timeout(TEMPO_PROVEDOR_MS)]));
    tokens = r.uso ? (r.uso.entrada ?? 0) + (r.uso.saida ?? 0) + (r.uso.raciocinio ?? 0) : null;
    let bruto: unknown;
    try { bruto = JSON.parse(r.texto); } catch { throw new ErroHttp('saida_invalida'); }
    // A saída passa pelo validador comum; nada inválido chega à tela (o navegador valida de novo).
    if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) throw new ErroHttp('saida_invalida');
    validarInterpretacao(bruto, ctx);
    return fim(json(200, { interpretacao: bruto, modelo: provedor.modelo }), 'concluida', tokens);
  } catch (e) {
    const x = classificar(e);
    return fim(erro(x.codigo), 'provedor', tokens);
  }
}
