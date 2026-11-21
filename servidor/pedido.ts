import { PERGUNTAS, type Pergunta } from '../src/perguntas.ts';
// Formato do pedido (plano 008, T4): esquema fechado, sem campos extras, com limites. O pedido identifica a carga (eco
// conferido com a vigente sob RLS), o recorte e a configuração; o servidor relê e recalcula tudo, sem aceitar números
// do cliente. Nenhum texto do pedido volta em mensagens de erro.
import { CLASSES_AREA } from '../src/lentes/sobreposicao.ts';
import { LENTES_CANONICAS, type Operador } from '../src/lentes/combinacao.ts';
import type { ClasseArea } from '../src/lentes/carregar-areas.ts';
import type { Janela, TipoLente } from '../src/lentes/contrato.ts';
import { ErroHttp } from './resposta.ts';

export const LIMITE_CORPO_BYTES = 16 * 1024;
export const LIMITE_PERGUNTA = 2000;
export const LIMITE_MUNICIPIOS = 142;

export type ConfigLente =
  | { tipo: TipoLente }
  | { tipo: 'combinacao'; lentes: TipoLente[]; operador: Operador }
  | { tipo: 'sobreposicao'; classe: ClasseArea };

export type Recorte =
  | { tipo: 'selecao'; janela: Janela; municipio: number | null; lente: ConfigLente | null }
  | { tipo: 'periodos'; a: Janela; b: Janela; municipio: number | null; lente: ConfigLente | null };

export interface Pedido {
  pergunta_id: Pergunta;
  carga: { id: number; identidade: string };
  recorte: Recorte;
}

type Objeto = Record<string, unknown>;

const invalido = (campo: string): never => { throw new ErroHttp('entrada_invalida', campo); };

function objeto(x: unknown, campo: string, chaves: readonly string[]): Objeto {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return invalido(campo);
  const o = x as Objeto;
  for (const k of Object.keys(o)) if (!chaves.includes(k)) invalido(`${campo}: campo não admitido`);
  return o;
}

const inteiro = (x: unknown, campo: string): number => (Number.isSafeInteger(x) && (x as number) > 0 ? (x as number) : invalido(campo));

const DIA = /^\d{4}-\d{2}-\d{2}$/;
function dia(x: unknown, campo: string): string {
  if (typeof x !== 'string' || !DIA.test(x) || new Date(`${x}T00:00:00Z`).toISOString().slice(0, 10) !== x) return invalido(campo);
  return x;
}

function janela(x: unknown, campo: string): Janela {
  const o = objeto(x, campo, ['inicio', 'fim']);
  const j = { inicio: dia(o['inicio'], `${campo}.inicio`), fim: dia(o['fim'], `${campo}.fim`) };
  if (j.inicio > j.fim) invalido(campo);
  return j;
}

const municipioOuEstado = (x: unknown, campo: string): number | null => (x === null ? null : inteiro(x, campo));

function lente(x: unknown, campo: string): ConfigLente {
  const o = objeto(x, campo, ['tipo', 'lentes', 'operador', 'classe']);
  const tipo = o['tipo'];
  if (tipo === 'combinacao') {
    const lentes = o['lentes'];
    if (!Array.isArray(lentes) || lentes.length < 2 || lentes.some((l) => !LENTES_CANONICAS.includes(l as TipoLente)) || new Set(lentes).size !== lentes.length) {
      return invalido(`${campo}.lentes`);
    }
    if (o['operador'] !== 'e' && o['operador'] !== 'ou') return invalido(`${campo}.operador`);
    if ('classe' in o) invalido(`${campo}: campo não admitido`);
    return { tipo, lentes: LENTES_CANONICAS.filter((l) => lentes.includes(l)), operador: o['operador'] };
  }
  if (tipo === 'sobreposicao') {
    if (!CLASSES_AREA.includes(o['classe'] as ClasseArea) || 'lentes' in o || 'operador' in o) return invalido(`${campo}.classe`);
    return { tipo, classe: o['classe'] as ClasseArea };
  }
  if (!LENTES_CANONICAS.includes(tipo as TipoLente) || Object.keys(o).length !== 1) return invalido(`${campo}.tipo`);
  return { tipo: tipo as TipoLente };
}

function recorte(x: unknown): Recorte {
  const base = objeto(x, 'recorte', ['tipo', 'janela', 'a', 'b', 'municipio', 'municipios', 'lente']);
  const comLente = (v: unknown) => (v === null ? null : lente(v, 'recorte.lente'));
  switch (base['tipo']) {
    case 'selecao': {
      const o = objeto(x, 'recorte', ['tipo', 'janela', 'municipio', 'lente']);
      return { tipo: 'selecao', janela: janela(o['janela'], 'recorte.janela'), municipio: municipioOuEstado(o['municipio'], 'recorte.municipio'), lente: comLente(o['lente']) };
    }
    case 'periodos': {
      const o = objeto(x, 'recorte', ['tipo', 'a', 'b', 'municipio', 'lente']);
      return { tipo: 'periodos', a: janela(o['a'], 'recorte.a'), b: janela(o['b'], 'recorte.b'), municipio: municipioOuEstado(o['municipio'], 'recorte.municipio'), lente: comLente(o['lente']) };
    }
    default: return invalido('recorte.tipo');
  }
}

/** Valida o corpo já lido (texto UTF-8 dentro do limite). */
export function validarPedido(texto: string): Pedido {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return invalido('JSON');
  }
  const o = objeto(bruto, 'pedido', ['pergunta_id', 'carga', 'recorte']);
  const id = o['pergunta_id'];
  if (typeof id !== 'string' || !Object.hasOwn(PERGUNTAS, id)) return invalido('pergunta_id');
  const r = recorte(o['recorte']);
  if (id === 'mudanca' ? r.tipo !== 'periodos' : id !== 'cuidados' && r.tipo !== 'selecao') return invalido('pergunta incompatível com recorte');
  const c = objeto(o['carga'], 'carga', ['id', 'identidade']);
  const identidade = c['identidade'];
  if (typeof identidade !== 'string' || !/^[0-9a-f]{64}$/.test(identidade)) invalido('carga.identidade');
  return { pergunta_id: id as Pergunta, carga: { id: inteiro(c['id'], 'carga.id'), identidade: identidade as string }, recorte: r };
}

/** Lê o corpo com teto de bytes, sem confiar em `content-length`. */
export async function lerCorpo(request: Request): Promise<string> {
  const declarado = Number(request.headers.get('content-length') ?? '0');
  if (declarado > LIMITE_CORPO_BYTES) throw new ErroHttp('corpo_excessivo');
  if (!request.body) return invalido('corpo');
  const leitor = request.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > LIMITE_CORPO_BYTES) {
      await leitor.cancel();
      throw new ErroHttp('corpo_excessivo');
    }
    partes.push(value);
  }
  const bytes = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) { bytes.set(p, pos); pos += p.byteLength; }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return invalido('UTF-8');
  }
}
