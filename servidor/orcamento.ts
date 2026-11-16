// Orçamento de uma execução (plano 008, T6): 270 s no total, 120 s cumulativos de leitura e cálculo, 120 s cumulativos
// de geração (até 20 s por chamada) e o encerramento controlado antes do limite da função. Cada operação respeita também
// o tempo global restante e o cancelamento do pedido. Leituras de todas as ferramentas consomem os mesmos 120 s.
import { ErroHttp } from './resposta.ts';

export const LIMITES = { totalMs: 270_000, leituraMs: 120_000, geracaoMs: 120_000, porGeracaoMs: 20_000 };

export type Fase = 'leitura' | 'geracao';

export class Orcamento {
  private readonly inicio: number;
  private readonly gasto: Record<Fase, number> = { leitura: 0, geracao: 0 };
  private readonly agora: () => number;
  private readonly limites: typeof LIMITES;
  /** Sinal da operação em curso (o cliente Supabase o usa em cada requisição). */
  sinalAtual: AbortSignal;

  readonly pedido: AbortSignal;

  constructor(pedido: AbortSignal, agora: () => number = () => performance.now(), limites = LIMITES) {
    this.pedido = pedido;
    this.agora = agora;
    this.inicio = agora();
    this.limites = limites;
    this.sinalAtual = pedido;
  }

  restante(fase: Fase): number {
    const global = this.limites.totalMs - (this.agora() - this.inicio);
    const daFase = (fase === 'leitura' ? this.limites.leituraMs : this.limites.geracaoMs) - this.gasto[fase];
    return Math.min(global, daFase, fase === 'geracao' ? this.limites.porGeracaoMs : Number.POSITIVE_INFINITY);
  }

  /** Executa `f` dentro do orçamento da fase; esgotado ou cancelado vira erro próprio, nunca resultado parcial. */
  async executar<T>(fase: Fase, f: (sinal: AbortSignal) => Promise<T>): Promise<T> {
    if (this.pedido.aborted) throw new ErroHttp('cancelada');
    const ms = this.restante(fase);
    if (ms <= 0) throw new ErroHttp('tempo_esgotado');
    const tempo = AbortSignal.timeout(Math.ceil(ms));
    const sinal = AbortSignal.any([this.pedido, tempo]);
    const anterior = this.sinalAtual;
    this.sinalAtual = sinal;
    const t0 = this.agora();
    try {
      return await f(sinal);
    } catch (e) {
      if (this.pedido.aborted) throw new ErroHttp('cancelada');
      if (tempo.aborted) throw new ErroHttp('tempo_esgotado');
      throw e;
    } finally {
      this.gasto[fase] += this.agora() - t0;
      this.sinalAtual = anterior;
    }
  }
}
