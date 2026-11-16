// Ciclo 008, item 3 (issue #79) — provedor simulado no formato bruto da Interactions API (`steps`, `usage`), sem rede
// e sem chave. Responde pelo papel identificado nas instruções do corpo: o principal delega aos dois subagentes; cada
// subagente pede a primeira ferramenta admitida e depois cita o primeiro número da evidência recebida; a síntese
// repete a primeira afirmação conferida. `respostaSimulada` não importa nada: a prova do pacote injeta seu código no
// executor isolado.

export function respostaSimulada(corpo) {
  const sis = String(corpo.system_instruction ?? '');
  const papel = sis.includes('agora sintetiza') ? 'sintese' : sis.includes('agente principal') ? 'principal' : sis.includes('analista de lentes') ? 'lentes' : 'disponibilidade';
  const usage = { total_input_tokens: 10, total_output_tokens: 5, total_thought_tokens: 0, total_tokens: 15 };
  const chamada = (name, args, id) => ({ type: 'function_call', id, name, arguments: args });
  const texto = (obj) => ({ status: 'completed', usage, steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify(obj) }] }] });
  if (papel === 'principal') {
    return { status: 'requires_action', usage, steps: [chamada('delegar', { analistas: ['lentes', 'disponibilidade'], classificacao: 'respondivel' }, 'p1')] };
  }
  if (papel === 'sintese') {
    const linha = corpo.input[0].content[0].text.split('\n').find((l) => l.startsWith('Análises conferidas (dados): '));
    const analises = JSON.parse(linha.slice('Análises conferidas (dados): '.length));
    return texto({ classificacao: 'respondivel', afirmacoes: [analises[0].afirmacoes[0]], limites: [] });
  }
  const escolha = corpo.generation_config?.tool_choice;
  if (escolha && escolha !== 'none') {
    return { status: 'requires_action', usage, steps: [{ type: 'thought', signature: 'assinatura-simulada' }, chamada(escolha.allowed_tools.tools[0], {}, `f-${papel}`)] };
  }
  const resultado = corpo.input.find((p) => p.type === 'function_result' && !p.is_error);
  const { evidencia, dados } = JSON.parse(resultado.result[0].text);
  const folha = (v, caminho) => {
    if (typeof v === 'number') return [caminho, v];
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i += 1) { const x = folha(v[i], `${caminho}[${i}]`); if (x) return x; } return null; }
    if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) { const y = folha(x, `${caminho}.${k}`); if (y) return y; } }
    return null;
  };
  const achado = folha(dados, evidencia);
  const afirmacao = achado ? { texto: `Valor conferido: ${achado[1]}.`, referencias: [achado[0]] } : { texto: 'Conforme a evidência recebida.', referencias: [evidencia] };
  return texto({ afirmacoes: [afirmacao], limites: [] });
}

/** `fetch` simulado do provedor: conta as chamadas e guarda os corpos enviados. */
export function fetchSimulado(registro = { corpos: [] }, falharNa = null) {
  return async (_url, init) => {
    registro.corpos.push(String(init.body));
    if (falharNa === registro.corpos.length) return new Response('{"error":{"message":"falha simulada"}}', { status: 503 });
    return new Response(JSON.stringify(respostaSimulada(JSON.parse(String(init.body)))), { status: 200, headers: { 'content-type': 'application/json' } });
  };
}
