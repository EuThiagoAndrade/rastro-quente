// Classificação dos erros da API em estados distintos da interface. O PostgREST local responde HTTP 500
// para P0002 (`sem_publicacao`, `carga_indisponivel`); por isso a mensagem do contrato vale mais que o status.

export type TipoErro =
  | 'acesso_negado'
  | 'sessao_expirada'
  | 'versao_substituida'
  | 'sem_publicacao'
  | 'entrada_invalida'
  | 'fonte_indisponivel';

export interface ErroApi {
  message?: string | undefined;
  code?: string | undefined;
  details?: string | undefined;
}

const ENTRADA = new Set([
  'periodo_obrigatorio', 'periodo_invertido', 'periodo_fora_da_janela',
  'municipio_inexistente', 'limite_invalido', 'deslocamento_invalido',
]);

export function classificarErro(erro: ErroApi | null | undefined, status: number): TipoErro {
  const mensagem = erro?.message ?? '';
  const codigo = erro?.code ?? '';
  if (status === 401 && (codigo === 'PGRST301' || codigo === 'PGRST303' || /jwt/i.test(mensagem))) return 'sessao_expirada';
  if (mensagem === 'acesso_negado' || codigo === '42501') return 'acesso_negado';
  if (mensagem === 'carga_indisponivel') return 'versao_substituida';
  if (mensagem === 'sem_publicacao') return 'sem_publicacao';
  if (ENTRADA.has(mensagem)) return 'entrada_invalida';
  return 'fonte_indisponivel';
}

export class ErroConsulta extends Error {
  readonly tipo: TipoErro;
  constructor(tipo: TipoErro, mensagem: string) {
    super(mensagem);
    this.tipo = tipo;
  }
}
