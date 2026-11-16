// Handler da explicação (plano 008, T4 e T5). Ordem fixa: habilitação → método e origem → formato e limites → JWT
// (Supabase Auth) → autorização vigente provada por consulta sob RLS → carga fixada (eco conferido) → orquestração dos
// agentes (ferramentas, revalidação antes de cada envio de evidências ao provedor) → revalidação → resposta. Desligada, responde 503 antes de ler corpo, sessão ou qualquer serviço. O cliente
// Supabase é criado por pedido, com a chave pública e o JWT do usuário: sem service_role, senha de banco ou sessão
// compartilhada. Logs só com etapa, código e duração.
//
// Fluxo de eventos (plano 008, T7; item 4): com `Accept: application/x-ndjson`, depois da matriz T4 (os acessos negados
// continuam respostas HTTP comuns, sem fluxo e sem provedor), a resposta é um fluxo de linhas JSON na própria resposta
// HTTP: `{"tipo":"evento","evento":…}` a cada etapa real da orquestração, sem conteúdo, e por fim
// `{"tipo":"fim","status":N,"corpo":…}`, com o mesmo status e corpo da resposta sem fluxo. Fechar o fluxo cancela a
// execução: nenhuma chamada nova ao provedor começa depois disso.
import type { SupabaseClient } from '@supabase/supabase-js';
import { lerCargaVigente, lerMunicipios, sondarAcesso } from '../src/consulta.ts';
import { ErroConsulta, type TipoErro } from '../src/erros.ts';
import { primeiroDiaGmt, ultimoDiaGmt } from '../src/formato.ts';
import { ErroLente } from '../src/lentes/contrato.ts';
import type { CargaDetalhe } from '../src/tipos.ts';
import type { ConfigLigada, ConfigServidor } from './config.ts';
import { FalhaProvedor, orquestrar, type Evento, type Resultado } from './agentes.ts';
import { executarFerramenta, validarRecorte, type Contexto } from './ferramentas.ts';
import type { Provedor } from './gemini.ts';
import { Orcamento } from './orcamento.ts';
import { lerCorpo, validarPedido, type Pedido } from './pedido.ts';
import { erro, ErroHttp, fluxo, json, textoErro, TIPO_FLUXO, type CodigoErro } from './resposta.ts';

export const AVISO_IA = 'Gerado por IA a partir das evidências abaixo; pode conter erros. Confira as evidências. Detecções não comprovam incêndio, dano, autoria ou infração.';

export interface Dependencias {
  config: ConfigServidor;
  /** Cliente por pedido: chave pública, JWT do usuário e o sinal da operação em curso em cada requisição. */
  criarCliente(config: ConfigLigada, token: string, sinal: () => AbortSignal): SupabaseClient;
  provedor(config: ConfigLigada): Provedor;
  /** Execução das ferramentas (os testes envolvem a real para simular revogação ou troca de carga no meio). */
  executar?: (ctx: Contexto, nome: string, args: Record<string, unknown>) => Promise<unknown>;
  /** Eventos por etapa da execução real (o painel do item 4 os consome); sem conteúdo. */
  emitir?: (e: Evento) => void;
  registrar?: (evento: { etapa: string; ms: number; codigo?: string; chamadas?: number; tokens?: number | null }) => void;
}

const DE_CONSULTA: Record<TipoErro, CodigoErro> = {
  acesso_negado: 'acesso_negado', sessao_expirada: 'nao_autenticado', versao_substituida: 'versao_substituida',
  sem_publicacao: 'sem_publicacao', entrada_invalida: 'entrada_invalida', fonte_indisponivel: 'fonte_indisponivel',
};

function classificar(e: unknown): ErroHttp {
  if (e instanceof ErroHttp) return e;
  if (e instanceof ErroConsulta) return new ErroHttp(DE_CONSULTA[e.tipo]);
  if (e instanceof ErroLente) return new ErroHttp('leitura_inconsistente');
  return new ErroHttp('fonte_indisponivel');
}

/** Origem, quando presente, precisa ser a própria ou uma configurada; ausência não autentica nada (T4). */
function origemPermitida(request: Request, config: ConfigLigada): boolean {
  const origem = request.headers.get('origin');
  if (origem === null) return true;
  return origem === new URL(request.url).origin || config.origens.includes(origem);
}

/** Autorização vigente provada sob RLS: a carga vigente só aparece para o responsável autorizado. */
async function autorizar(cliente: SupabaseClient): Promise<CargaDetalhe> {
  const carga = await lerCargaVigente(cliente);
  if (carga) return carga;
  const s = await sondarAcesso(cliente);
  throw new ErroHttp(s === 'sem_publicacao' ? 'sem_publicacao' : 'acesso_negado');
}

/** Revalidação antes de enviar evidências ao provedor e antes da resposta final: acesso e mesma carga. */
async function revalidar(cliente: SupabaseClient, carga: CargaDetalhe): Promise<void> {
  const atual = await autorizar(cliente);
  if (atual.id !== carga.id || atual.identidade !== carga.identidade) throw new ErroHttp('versao_substituida');
}

/** Corpo da resposta: afirmações conferidas, notas fixas, análises, evidências por identificador e a execução real. */
export function corpoResultado(r: Resultado, modelo: string) {
  const soma = (k: 'entrada' | 'saida' | 'raciocinio') => r.chamadas.reduce((t, c) => t + (c.uso?.[k] ?? 0), 0);
  return {
    estado: r.estado,
    classificacao: r.classificacao,
    resposta: {
      afirmacoes: r.afirmacoes, limites: r.limites, notas: r.notas,
      gerado_por_ia: r.afirmacoes.length > 0 || r.analises.some((a) => a.afirmacoes.length > 0), aviso: AVISO_IA,
    },
    analises: r.analises,
    evidencias: Object.fromEntries(r.evidencias.map((e) => [e.id, { ferramenta: e.ferramenta, papel: e.papel, dados: e.dados }])),
    execucao: {
      modelo, total_chamadas: r.chamadas.length, chamadas: r.chamadas,
      // Consumo verificado só quando o provedor informou o uso de todas as chamadas.
      uso: { entrada: soma('entrada'), saida: soma('saida'), raciocinio: soma('raciocinio'), verificado: r.chamadas.length > 0 && r.chamadas.every((c) => c.uso !== null) },
      etapas: r.etapas,
    },
  };
}

export async function tratarExplicar(request: Request, deps: Dependencias): Promise<Response> {
  const config = deps.config;
  const registrar = deps.registrar ?? (() => {});
  const t0 = performance.now();
  // Log: só etapa, código, duração, número de chamadas e tokens agregados; nunca pergunta, resposta ou dados.
  const fim = (r: Response, etapa: string, x?: Resultado): Response => {
    const tokens = x ? x.chamadas.reduce((t, c) => t + (c.uso?.entrada ?? 0) + (c.uso?.saida ?? 0) + (c.uso?.raciocinio ?? 0), 0) : null;
    registrar({ etapa, ms: Math.round(performance.now() - t0), codigo: String(r.status), ...(x ? { chamadas: x.chamadas.length, tokens } : {}) });
    return r;
  };
  // Desligada: nada é lido, nem o corpo nem a sessão, em qualquer método ou identidade.
  if (!config.habilitada) return fim(erro('ia_desabilitada'), 'desligada');
  if (request.method !== 'POST') return fim(erro('metodo_nao_permitido'), 'metodo');
  if (!origemPermitida(request, config)) return fim(erro('origem_negada'), 'origem');
  let pedido: Pedido;
  try {
    pedido = validarPedido(await lerCorpo(request));
  } catch (e) {
    const x = classificar(e);
    return fim(erro(x.codigo, x.detalhe), 'pedido');
  }
  // JWT só no cabeçalho, nunca na URL.
  const token = /^Bearer ([A-Za-z0-9._-]+)$/.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!token) return fim(erro('nao_autenticado'), 'sessao');
  // O cancelamento do fluxo pelo cliente vale como cancelamento do pedido.
  const cancelamento = new AbortController();
  const orcamento = new Orcamento(AbortSignal.any([request.signal, cancelamento.signal]));
  const cliente = deps.criarCliente(config, token, () => orcamento.sinalAtual);
  let ctx: Contexto;
  try {
    const usuario = await cliente.auth.getUser(token);
    if (usuario.error || !usuario.data.user || usuario.data.user.role !== 'authenticated') return fim(erro('nao_autenticado'), 'sessao');
    const vigente = await autorizar(cliente);
    // Eco da carga: o pedido feito sobre outra versão não é misturado com a vigente.
    if (pedido.carga.id !== vigente.id || pedido.carga.identidade !== vigente.identidade) throw new ErroHttp('versao_substituida');
    const municipios = await lerMunicipios(cliente, vigente.id);
    ctx = {
      cliente, carga: vigente, pedido, orcamento, nomes: new Map(municipios.map((m) => [m.codigo, m.nome])),
      janelaCarga: { inicio: primeiroDiaGmt(vigente.janela_inicio), fim: ultimoDiaGmt(vigente.janela_fim) },
    };
    validarRecorte(ctx);
  } catch (e) {
    const x = classificar(e);
    return fim(erro(x.codigo, x.codigo === 'entrada_invalida' ? x.detalhe : undefined), 'erro');
  }

  const executarOrquestracao = async (emitir?: (e: Evento) => void): Promise<Response> => {
    const vigente = ctx.carga;
    try {
      const executar = deps.executar ?? ((c: Contexto, nome: string, args: Record<string, unknown>) => executarFerramenta(c, nome, args));
      const provedor = deps.provedor(config);
      const r = await orquestrar({
        pedido, orcamento, provedor,
        executar: (nome, args) => executar(ctx, nome, args),
        revalidar: () => revalidar(cliente, vigente),
        ...(config.gemini.intervaloMs ? { intervaloMs: config.gemini.intervaloMs } : {}),
        ...(emitir ? { emitir } : {}),
      });
      await revalidar(cliente, vigente);
      return fim(json(200, corpoResultado(r, provedor.modelo)), 'concluida', r);
    } catch (e) {
      // Falha do provedor: o que já foi conferido continua acessível, depois de revalidar acesso e carga; nenhuma síntese.
      if (e instanceof FalhaProvedor) {
        try {
          await revalidar(cliente, vigente);
        } catch (e2) {
          return fim(erro(classificar(e2).codigo), 'erro');
        }
        const c = corpoResultado(e.parcial, config.gemini.modelo);
        return fim(json(e.codigo === 'cota_provedor' ? 429 : 502, {
          erro: e.codigo, texto: textoErro(e.codigo), analises: c.analises, evidencias: c.evidencias, execucao: c.execucao,
        }), 'provedor', e.parcial);
      }
      const x = classificar(e);
      return fim(erro(x.codigo, x.codigo === 'entrada_invalida' ? x.detalhe : undefined), 'erro');
    }
  };

  if (!(request.headers.get('accept') ?? '').includes(TIPO_FLUXO)) return executarOrquestracao(deps.emitir);
  return fluxo(async (enviar) => {
    const r = await executarOrquestracao((e) => { deps.emitir?.(e); enviar({ tipo: 'evento', evento: e }); });
    enviar({ tipo: 'fim', status: r.status, corpo: await r.json() });
  }, () => cancelamento.abort());
}
