// Função Node da Vercel (ciclo 012, issue #113): `/api/interpretar`. Desligada por padrão (503 em qualquer método),
// com as mesmas variáveis de `/api/explicar`. A lógica fica em `servidor/interpretar.ts`; aqui só a ligação com o
// ambiente e o cliente Supabase por pedido, com a chave pública e o JWT do usuário (sem service_role).
import { lerConfigServidor } from '../servidor/config.ts';
import { criarGemini } from '../servidor/gemini.ts';
import { tratarInterpretar, type DependenciasInterpretar } from '../servidor/interpretar.ts';
import { criarCliente } from './explicar.ts';

const dependencias = (): DependenciasInterpretar => ({
  config: lerConfigServidor(process.env),
  criarCliente,
  provedor: (config) => criarGemini(config.gemini),
  registrar: (e) => console.info(JSON.stringify({ funcao: 'interpretar', ...e })),
});

const tratar = (request: Request): Promise<Response> => tratarInterpretar(request, dependencias());

export const GET = tratar;
export const POST = tratar;
export const PUT = tratar;
export const PATCH = tratar;
export const DELETE = tratar;
export const OPTIONS = tratar;
export const HEAD = tratar;
