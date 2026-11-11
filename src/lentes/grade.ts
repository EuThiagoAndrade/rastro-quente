// Grade T1 de 0,05° (plano 004): ancorada em 0° de latitude e de longitude; célula = intervalo semiaberto
// [k·0,05; (k+1)·0,05) em cada eixo, bordas sul e oeste incluídas. Índice calculado por aritmética
// decimal exata sobre o valor canônico (representação decimal mais curta do double), nunca por
// divisão em ponto flutuante. A verificação abaixo protege só essa conversão: dígitos perdidos na
// ingestão não são detectáveis aqui, e sim pela conferência por id_tecnico contra o texto da fonte.
import type { Unidade } from './contrato.ts';

export class ErroCoordenada extends Error {}

const MAX_SIGNIFICATIVOS = 15;

/** Valor canônico de uma coordenada: inteiro decimal e escala (número de casas). */
export function canonico(x: number): { inteiro: bigint; casas: number; texto: string } {
  if (!Number.isFinite(x)) throw new ErroCoordenada(`coordenada não finita: ${String(x)}`);
  const texto = String(x);
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(texto);
  if (!m) throw new ErroCoordenada(`coordenada fora da forma decimal simples: ${texto}`);
  const sinal = m[1] === '-' ? -1n : 1n;
  const parteInteira = m[2] ?? '0';
  const fracao = m[3] ?? '';
  const significativos = (parteInteira + fracao).replace(/^0+/, '').length;
  if (significativos > MAX_SIGNIFICATIVOS) {
    throw new ErroCoordenada(`coordenada com mais de ${MAX_SIGNIFICATIVOS} algarismos significativos: ${texto}`);
  }
  return { inteiro: sinal * BigInt(parteInteira + fracao), casas: fracao.length, texto };
}

/** Divisão inteira com piso (BigInt trunca em direção a zero). */
function divPiso(a: bigint, b: bigint): bigint {
  const q = a / b;
  return a % b !== 0n && (a < 0n) !== (b < 0n) ? q - 1n : q;
}

/** k tal que x ∈ [k·0,05; (k+1)·0,05). */
export function indiceGrade(x: number): number {
  const { inteiro, casas } = canonico(x);
  // x / 0,05 = x · 20 = inteiro · 20 / 10^casas
  return Number(divPiso(inteiro * 20n, 10n ** BigInt(casas)));
}

/** k·0,05 como texto decimal exato com duas casas (k·5 centésimos). */
export function bordaGrade(k: number): string {
  const centesimos = BigInt(k) * 5n;
  const negativo = centesimos < 0n;
  const abs = negativo ? -centesimos : centesimos;
  const inteiro = abs / 100n;
  const resto = String(abs % 100n).padStart(2, '0');
  return `${negativo && abs !== 0n ? '-' : ''}${inteiro}.${resto}`;
}

export type Celula = Extract<Unidade, { tipo: 'celula_005' }>;

export function celulaDe(latitude: number, longitude: number): Celula {
  const kLat = indiceGrade(latitude);
  const kLon = indiceGrade(longitude);
  return {
    tipo: 'celula_005',
    id: `c${kLat}_${kLon}`,
    sul: bordaGrade(kLat),
    norte: bordaGrade(kLat + 1),
    oeste: bordaGrade(kLon),
    leste: bordaGrade(kLon + 1),
  };
}
