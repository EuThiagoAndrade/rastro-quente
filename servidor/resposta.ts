// Respostas HTTP da função: JSON (ou fluxo de linhas JSON, a pedido) e sempre `no-store`, sem CORS amplo e sem eco do conteúdo recebido. Erros levam só
// um código e um texto fixo do código; nunca corpo de rede, pilha, JWT ou segredo.

export type CodigoErro =
  | 'ia_desabilitada'
  | 'metodo_nao_permitido'
  | 'origem_negada'
  | 'corpo_excessivo'
  | 'entrada_invalida'
  | 'nao_autenticado'
  | 'acesso_negado'
  | 'sem_publicacao'
  | 'versao_substituida'
  | 'tempo_esgotado'
  | 'cancelada'
  | 'fonte_indisponivel'
  | 'leitura_inconsistente'
  | 'provedor_indisponivel'
  | 'cota_provedor'
  | 'saida_invalida'
  | 'limite_envio';

const STATUS: Record<CodigoErro, number> = {
  ia_desabilitada: 503,
  metodo_nao_permitido: 405,
  origem_negada: 403,
  corpo_excessivo: 413,
  entrada_invalida: 400,
  nao_autenticado: 401,
  acesso_negado: 403,
  sem_publicacao: 409,
  versao_substituida: 409,
  tempo_esgotado: 504,
  cancelada: 499,
  fonte_indisponivel: 502,
  leitura_inconsistente: 502,
  provedor_indisponivel: 502,
  cota_provedor: 429,
  saida_invalida: 502,
  limite_envio: 502,
};

const TEXTO: Record<CodigoErro, string> = {
  ia_desabilitada: 'A explicação por IA está desligada neste ambiente; a comparação e as lentes continuam disponíveis.',
  metodo_nao_permitido: 'Método não permitido.',
  origem_negada: 'Origem não permitida.',
  corpo_excessivo: 'Pedido maior que o limite.',
  entrada_invalida: 'Pedido inválido.',
  nao_autenticado: 'Sessão ausente ou inválida.',
  acesso_negado: 'Acesso negado.',
  sem_publicacao: 'Não há versão de dados publicada.',
  versao_substituida: 'A versão de dados mudou; recarregue a versão vigente.',
  tempo_esgotado: 'O tempo da explicação acabou antes de examinar todas as evidências; nada conclusivo foi gerado.',
  cancelada: 'Pedido cancelado.',
  fonte_indisponivel: 'Fonte de dados indisponível.',
  leitura_inconsistente: 'Leitura inconsistente dos dados; nada parcial foi usado.',
  provedor_indisponivel: 'O provedor de IA não respondeu; as evidências continuam disponíveis na aplicação.',
  cota_provedor: 'A cota do provedor de IA se esgotou; nada foi repetido automaticamente. Uma nova tentativa consome nova cota.',
  saida_invalida: 'O provedor de IA devolveu uma resposta fora do formato; nada dela foi usado.',
  limite_envio: 'As evidências passam do limite de envio ao provedor; nenhuma síntese foi gerada a partir de amostra.',
};

const CABECALHOS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };

export function json(status: number, corpo: unknown, extras: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CABECALHOS, ...extras } });
}

export const textoErro = (codigo: CodigoErro): string => TEXTO[codigo];

export function erro(codigo: CodigoErro, detalhe?: string): Response {
  return json(STATUS[codigo], { erro: codigo, texto: TEXTO[codigo], ...(detalhe ? { detalhe } : {}) },
    codigo === 'metodo_nao_permitido' ? { allow: 'POST' } : {});
}

/** Erro já classificado, levado até o handler. `detalhe` só com texto do próprio código (nunca da entrada). */
export class ErroHttp extends Error {
  readonly codigo: CodigoErro;
  readonly detalhe: string | undefined;
  constructor(codigo: CodigoErro, detalhe?: string) {
    super(codigo);
    this.codigo = codigo;
    this.detalhe = detalhe;
  }
}

/** Tipo do fluxo de eventos (uma mensagem JSON por linha), pedido pelo cliente em `Accept`. */
export const TIPO_FLUXO = 'application/x-ndjson';

/**
 * Resposta em fluxo: `produzir` envia mensagens (cada uma vira uma linha JSON) e termina; `cancelar` é chamado se o
 * cliente fechar o fluxo antes do fim. Status 200: o resultado e o seu status vão na última mensagem.
 */
export function fluxo(produzir: (enviar: (mensagem: unknown) => void) => Promise<void>, cancelar: () => void): Response {
  const codificador = new TextEncoder();
  let aberto = true;
  const corpo = new ReadableStream<Uint8Array>({
    start(c) {
      const enviar = (m: unknown): void => { if (aberto) c.enqueue(codificador.encode(`${JSON.stringify(m)}\n`)); };
      void produzir(enviar).then(
        () => { if (aberto) { aberto = false; c.close(); } },
        () => { if (aberto) { aberto = false; c.error(new Error('fluxo interrompido')); } },
      );
    },
    cancel() {
      aberto = false;
      cancelar();
    },
  });
  return new Response(corpo, { status: 200, headers: { ...CABECALHOS, 'content-type': `${TIPO_FLUXO}; charset=utf-8` } });
}
