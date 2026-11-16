// Handler da explicação (plano 008, T4). Ordem fixa: habilitação → método e origem → formato e limites → JWT (Supabase
// Auth) → autorização vigente provada por consulta sob RLS → carga fixada (eco conferido) → ferramentas → revalidação →
// provedor → revalidação → resposta. Desligada, responde 503 antes de ler corpo, sessão ou qualquer serviço. O cliente
// Supabase é criado por pedido, com a chave pública e o JWT do usuário: sem service_role, senha de banco ou sessão
// compartilhada. Logs só com etapa, código e duração.
import type { SupabaseClient } from '@supabase/supabase-js';
import { lerCargaVigente, lerMunicipios, sondarAcesso } from '../src/consulta.ts';
import { ErroConsulta, type TipoErro } from '../src/erros.ts';
import { primeiroDiaGmt, ultimoDiaGmt } from '../src/formato.ts';
import { ErroLente } from '../src/lentes/contrato.ts';
import type { CargaDetalhe } from '../src/tipos.ts';
import type { ConfigLigada, ConfigServidor } from './config.ts';
import { executarFerramenta, FERRAMENTA_DO_PEDIDO, type Contexto } from './ferramentas.ts';
import type { Provedor } from './gemini.ts';
import { Orcamento } from './orcamento.ts';
import { lerCorpo, validarPedido, type Pedido } from './pedido.ts';
import { erro, ErroHttp, json, type CodigoErro } from './resposta.ts';

export const AVISO_IA = 'Gerado por IA a partir das evidências abaixo; pode conter erros. Confira as evidências. Detecções não comprovam incêndio, dano, autoria ou infração.';

export interface Dependencias {
  config: ConfigServidor;
  /** Cliente por pedido: chave pública, JWT do usuário e o sinal da operação em curso em cada requisição. */
  criarCliente(config: ConfigLigada, token: string, sinal: () => AbortSignal): SupabaseClient;
  provedor(config: ConfigLigada): Provedor;
  /** Execução das ferramentas (os testes envolvem a real para simular revogação ou troca de carga no meio). */
  executar?: (ctx: Contexto, nome: string) => Promise<unknown>;
  registrar?: (evento: { etapa: string; ms: number; codigo?: string }) => void;
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

export async function tratarExplicar(request: Request, deps: Dependencias): Promise<Response> {
  const config = deps.config;
  const registrar = deps.registrar ?? (() => {});
  const t0 = performance.now();
  const fim = (r: Response, etapa: string): Response => {
    registrar({ etapa, ms: Math.round(performance.now() - t0), codigo: String(r.status) });
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
  const orcamento = new Orcamento(request.signal);
  const cliente = deps.criarCliente(config, token, () => orcamento.sinalAtual);
  let evidencias: unknown = null;
  try {
    const usuario = await cliente.auth.getUser(token);
    if (usuario.error || !usuario.data.user || usuario.data.user.role !== 'authenticated') return fim(erro('nao_autenticado'), 'sessao');
    const carga = await autorizar(cliente);
    // Eco da carga: o pedido feito sobre outra versão não é misturado com a vigente.
    if (pedido.carga.id !== carga.id || pedido.carga.identidade !== carga.identidade) throw new ErroHttp('versao_substituida');
    const municipios = await lerMunicipios(cliente, carga.id);
    const ctx: Contexto = {
      cliente, carga, pedido, orcamento, nomes: new Map(municipios.map((m) => [m.codigo, m.nome])),
      janelaCarga: { inicio: primeiroDiaGmt(carga.janela_inicio), fim: ultimoDiaGmt(carga.janela_fim) },
    };
    const executar = deps.executar ?? ((c: Contexto, nome: string) => executarFerramenta(c, nome));
    evidencias = await executar(ctx, FERRAMENTA_DO_PEDIDO[pedido.recorte.tipo]);
    await revalidar(cliente, carga);
    const geracao = await orcamento.executar('geracao', (sinal) => deps.provedor(config).gerar({ pergunta: pedido.pergunta, evidencias }, sinal));
    await revalidar(cliente, carga);
    return fim(json(200, {
      resposta: { texto: geracao.texto, gerado_por_ia: true, aviso: AVISO_IA },
      evidencias, uso: geracao.uso,
    }), 'concluida');
  } catch (e) {
    const x = classificar(e);
    // Falha do provedor: as evidências já conferidas e revalidadas continuam acessíveis; nenhuma síntese.
    if (x.codigo === 'provedor_indisponivel' && evidencias !== null) {
      return fim(json(502, { erro: x.codigo, texto: 'O provedor de IA não respondeu; as evidências continuam disponíveis.', evidencias }), 'provedor');
    }
    return fim(erro(x.codigo, x.codigo === 'entrada_invalida' ? x.detalhe : undefined), 'erro');
  }
}
