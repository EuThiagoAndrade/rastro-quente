// Ciclo 008, item 4 (issue #80) — `/api/explicar` do E2E: o handler real (servidor/explicar.ts), com o Supabase local
// (Auth e RLS reais, chave publicável) e o provedor simulado no formato bruto da Interactions API (cliente REST real,
// `fetch` simulado: nenhuma rede, nenhuma chave real). O `vite preview` do E2E encaminha `/api` para cá. Só para o
// E2E local; nada aqui é implantado.
//
// Controle do teste (só nesta porta, nunca pela interface): `POST /__e2e/provedor` com `{ "modo": … , "atrasoMs": n }`
//   - `normal`: o principal delega aos dois subagentes, como em scripts/agentes/simulado.mjs;
//   - `falha_lentes`: a análise do subagente de lentes volta fora do formato (falha só dele);
//   - `desligada`: a função fica desligada (503 `ia_desabilitada`, sem ler corpo nem sessão);
//   - `atrasoMs`: espera antes de cada resposta do provedor (cancelamento e respostas tardias).
// `GET /__e2e/provedor` devolve `{ chamadas }`, o número de chamadas recebidas pelo provedor simulado.
import http from 'node:http';
import { criarCliente } from '../../api/explicar.ts';
import { tratarExplicar } from '../../servidor/explicar.ts';
import { criarGemini } from '../../servidor/gemini.ts';
import { MODELO_FIXADO } from '../../servidor/config.ts';
import { respostaSimulada } from '../agentes/simulado.mjs';

const MODOS = new Set(['normal', 'falha_lentes', 'desligada']);

export function iniciarApiE2e({ porta, supabaseUrl, chavePublica, origem }) {
  const estado = { modo: 'normal', atrasoMs: 0, chamadas: 0 };

  const fetchProvedor = async (_url, init) => {
    estado.chamadas += 1;
    const corpo = JSON.parse(String(init.body));
    if (estado.atrasoMs) {
      await new Promise((ok, falha) => {
        const t = setTimeout(ok, estado.atrasoMs);
        init.signal?.addEventListener('abort', () => { clearTimeout(t); falha(init.signal.reason); }, { once: true });
      });
    }
    const sis = String(corpo.system_instruction ?? '');
    const analiseDeLentes = sis.includes('analista de lentes') && (corpo.generation_config?.tool_choice ?? 'none') === 'none';
    const resposta = estado.modo === 'falha_lentes' && analiseDeLentes
      ? { status: 'completed', usage: { total_input_tokens: 10, total_output_tokens: 5, total_thought_tokens: 0, total_tokens: 15 }, steps: [{ type: 'model_output', content: [{ type: 'text', text: 'isto não é JSON' }] }] }
      : respostaSimulada(corpo);
    return new Response(JSON.stringify(resposta), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const deps = () => ({
    config: estado.modo === 'desligada'
      ? { habilitada: false }
      : { habilitada: true, supabaseUrl, chavePublica, gemini: { chave: 'chave-ficticia-e2e', modelo: MODELO_FIXADO }, origens: [origem] },
    criarCliente,
    provedor: (config) => criarGemini(config.gemini, fetchProvedor),
  });

  const servidor = http.createServer(async (req, res) => {
    const partes = [];
    for await (const p of req) partes.push(p);
    const corpo = Buffer.concat(partes);
    if (req.url === '/__e2e/provedor') {
      if (req.method === 'POST') {
        const pedido = JSON.parse(corpo.toString('utf8') || '{}');
        if (!MODOS.has(pedido.modo ?? 'normal')) { res.writeHead(400).end(); return; }
        Object.assign(estado, { modo: pedido.modo ?? 'normal', atrasoMs: Number(pedido.atrasoMs ?? 0), chamadas: 0 });
      }
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ chamadas: estado.chamadas, modo: estado.modo }));
      return;
    }
    const controle = new AbortController();
    res.on('close', () => { if (!res.writableEnded) controle.abort(); });
    const request = new Request(`${origem}${req.url}`, {
      method: req.method, headers: req.headers, signal: controle.signal,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : corpo,
    });
    const r = await tratarExplicar(request, deps());
    res.writeHead(r.status, Object.fromEntries(r.headers));
    if (!r.body) { res.end(); return; }
    const leitor = r.body.getReader();
    res.on('close', () => { if (!res.writableEnded) void leitor.cancel().catch(() => {}); });
    try {
      for (;;) {
        const { done, value } = await leitor.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch {
      res.destroy();
    }
  });
  return new Promise((ok) => servidor.listen(porta, '127.0.0.1', () => ok(servidor)));
}
