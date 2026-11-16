// Cliente REST do Gemini (plano 008, T6), só no servidor e desligado por padrão: a função só o cria com a configuração
// completa e `RQ_IA_HABILITADA=true`. Usa o fetch nativo, sem SDK. Transporte: `POST v1beta/interactions` com
// `store=false`, sem execução em segundo plano e sem `previous_interaction_id`; a continuidade de uma execução reenvia em
// memória os passos recebidos (inclusive `thought` e `function_call`, exatamente como vieram) e os `function_result`.
// Formato conferido na referência pública da Interactions API em 2026-11-16 (resposta em `steps`, texto em
// `model_output.content[].text`, uso em `usage.total_*_tokens`); a compatibilidade real com o modelo fixado é provada
// na prova local do item 3. Nenhuma chave, JWT ou dado de conta entra no corpo enviado; a chave vai só no cabeçalho.
import { ErroHttp } from './resposta.ts';

export const ENDPOINT_GEMINI = 'https://generativelanguage.googleapis.com/v1beta/interactions';
/** Corpo completo de uma chamada (instruções, ferramentas, histórico e evidências), medido em bytes UTF-8 (T6). */
export const LIMITE_ENVIO_BYTES = 64 * 1024;
/** Detalhe do erro de HTTP 503 (sobrecarga temporária do modelo), o único que a orquestração repete. */
export const SOBRECARGA = 'sobrecarga';
export const LIMITE_SAIDA_TOKENS = 1500;

export type Passo = Record<string, unknown> & { type: string };

export interface DeclaracaoFuncao {
  type: 'function';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** Uma chamada ao modelo: o histórico vai inteiro em `input` (sem estado no provedor). */
export interface Interacao {
  sistema: string;
  entrada: Passo[];
  ferramentas?: DeclaracaoFuncao[];
  /** `any` obriga chamada de função (restrita a `permitidas`); `none` proíbe. */
  escolha?: { modo: 'any'; permitidas: string[] } | 'none';
  /** JSON Schema da resposta final (saída estruturada). */
  esquema?: Record<string, unknown>;
}

export interface ChamadaFuncao {
  id: string;
  nome: string;
  argumentos: Record<string, unknown>;
}

export interface Uso {
  entrada: number | null;
  saida: number | null;
  raciocinio: number | null;
}

export interface RespostaInteracao {
  /** Passos do modelo como recebidos, para reenvio na continuidade. */
  passos: Passo[];
  chamadas: ChamadaFuncao[];
  /** Texto de `model_output` (o JSON da saída estruturada, quando pedida). */
  texto: string;
  /** Uso informado pelo provedor; `null` quando ausente (consumo não verificado). */
  uso: Uso | null;
}

export interface Provedor {
  readonly modelo: string;
  interagir(i: Interacao, sinal: AbortSignal): Promise<RespostaInteracao>;
}

export const bytesUtf8 = (s: string): number => new TextEncoder().encode(s).byteLength;

/** Corpo da chamada; recusado antes do envio se passar de 64 KiB (código próprio, sem chamada). */
export function corpoInteracao(modelo: string, i: Interacao): string {
  const generation_config: Record<string, unknown> = { max_output_tokens: LIMITE_SAIDA_TOKENS };
  if (i.escolha === 'none') generation_config['tool_choice'] = 'none';
  else if (i.escolha) generation_config['tool_choice'] = { allowed_tools: { mode: 'any', tools: i.escolha.permitidas } };
  const corpo = JSON.stringify({
    model: modelo,
    store: false,
    system_instruction: i.sistema,
    input: i.entrada,
    ...(i.ferramentas?.length ? { tools: i.ferramentas } : {}),
    ...(i.esquema ? { response_format: { type: 'text', mime_type: 'application/json', schema: i.esquema } } : {}),
    generation_config,
  });
  if (bytesUtf8(corpo) > LIMITE_ENVIO_BYTES) throw new ErroHttp('limite_envio');
  return corpo;
}

const numero = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const objeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** Interpreta a resposta; formato inesperado é saída inválida (nunca repassada ao usuário). */
export function lerResposta(j: unknown): RespostaInteracao {
  if (!objeto(j) || !Array.isArray(j['steps'])) throw new ErroHttp('saida_invalida');
  const status = j['status'];
  if (status !== 'completed' && status !== 'requires_action') throw new ErroHttp('saida_invalida');
  const passos = (j['steps'] as unknown[]).filter((p): p is Passo => objeto(p) && typeof p['type'] === 'string');
  const chamadas: ChamadaFuncao[] = [];
  const textos: string[] = [];
  for (const p of passos) {
    if (p.type === 'function_call') {
      if (typeof p['id'] !== 'string' || typeof p['name'] !== 'string' || !objeto(p['arguments'])) throw new ErroHttp('saida_invalida');
      chamadas.push({ id: p['id'], nome: p['name'], argumentos: p['arguments'] });
    } else if (p.type === 'model_output' && Array.isArray(p['content'])) {
      for (const c of p['content'] as unknown[]) if (objeto(c) && c['type'] === 'text' && typeof c['text'] === 'string') textos.push(c['text']);
    }
  }
  const u = objeto(j['usage']) ? j['usage'] : null;
  return {
    passos: passos.filter((p) => p.type !== 'user_input' && p.type !== 'function_result'),
    chamadas, texto: textos.join('').trim(),
    uso: u ? { entrada: numero(u['total_input_tokens']), saida: numero(u['total_output_tokens']), raciocinio: numero(u['total_thought_tokens']) } : null,
  };
}

export function criarGemini(cfg: { chave: string; modelo: string }, buscar: typeof fetch = fetch): Provedor {
  return {
    modelo: cfg.modelo,
    async interagir(i, sinal) {
      const corpo = corpoInteracao(cfg.modelo, i);
      let r: Response;
      try {
        r = await buscar(ENDPOINT_GEMINI, {
          method: 'POST', signal: sinal, body: corpo,
          headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.chave },
        });
      } catch (e) {
        if (sinal.aborted) throw e;
        throw new ErroHttp('provedor_indisponivel');
      }
      // O cliente não repete; a orquestração repete uma vez só a sobrecarga (503). O corpo de erro não é repassado.
      if (r.status === 429) throw new ErroHttp('cota_provedor');
      if (!r.ok) throw new ErroHttp('provedor_indisponivel', r.status === 503 ? SOBRECARGA : undefined);
      return lerResposta(await r.json().catch(() => null));
    },
  };
}
