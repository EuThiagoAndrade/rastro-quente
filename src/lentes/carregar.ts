// Carregador das lentes (plano 004, R1-1, R1-4, R2-1, T3): lê o resumo e todas as páginas de registros
// no recorte M1-a (estado inteiro, p_municipio null), com a carga fixada, e a disponibilidade por
// município. Cada resposta é conferida antes de entrar; qualquer divergência é "leitura inconsistente",
// sem destaques parciais. Erros que afetam sessão ou versão nunca ficam locais (destinoErro).
import type { Filtro } from '../consulta.ts';
import type { TipoErro } from '../erros.ts';
import type { Disponibilidade, PaginaDeteccoes, Resumo } from '../tipos.ts';
import { diasDaJanela } from './cobertura.ts';
import { ErroLente, type DiaLente, type Janela, type RegistroLente } from './contrato.ts';

export const LIMITE_PAGINA = 1000;
export const CONCORRENCIA_DISPONIBILIDADE = 4;

export interface FontesLente {
  resumo(f: Filtro): Promise<Resumo>;
  pagina(f: Filtro, limite: number, deslocamento: number): Promise<PaginaDeteccoes>;
  disponibilidade(f: Filtro): Promise<Disponibilidade>;
}

export interface PedidoLente {
  carga: number;
  janela: Janela;
}

/** Filtro do recorte M1-a: estado inteiro, mesma carga e janela. */
export const filtroEstadual = (p: PedidoLente): Filtro =>
  ({ carga: p.carga, inicio: p.janela.inicio, fim: p.janela.fim, municipio: null });

function exigir(condicao: boolean, motivo: string): void {
  if (!condicao) throw new ErroLente(motivo);
}

/** Confere o resumo do mesmo recorte e devolve o total principal. */
export function validarResumo(p: PedidoLente, r: Resumo): number {
  exigir(r.carga.id === p.carga, 'resumo de outra carga');
  exigir(r.periodo.inicio === p.janela.inicio && r.periodo.fim === p.janela.fim, 'resumo de outro período');
  exigir(r.municipio === null, 'resumo de outro recorte (município)');
  return r.principal.total;
}

/**
 * Ordem conferível no cliente: `data_hora_gmt` não decrescente. O desempate por `id_tecnico` segue a
 * collation do banco (en_US via ICU, que ignora pontuação e caixa) e não é reproduzível aqui;
 * duplicação e omissão são pegas pela unicidade de `id_tecnico` e pela contagem igual ao total.
 */
const naoDepois = (a: RegistroLente, b: RegistroLente): boolean => a.data_hora_gmt <= b.data_hora_gmt;

/**
 * Acumula páginas conferindo eco, total, tamanho, unicidade e ordem temporal, também entre páginas.
 * Exemplo do revisor: duas páginas com os mesmos 1.000 registros não somam 2.000.
 */
export class AcumuladorPaginas {
  readonly registros: RegistroLente[] = [];
  private readonly ids = new Set<string>();
  private readonly pedido: PedidoLente;
  private readonly totalResumo: number;

  constructor(pedido: PedidoLente, totalResumo: number) {
    this.pedido = pedido;
    this.totalResumo = totalResumo;
  }

  adicionar(pg: PaginaDeteccoes, deslocamento: number): void {
    const p = this.pedido;
    exigir(pg.carga.id === p.carga, 'página de outra carga');
    exigir(pg.periodo.inicio === p.janela.inicio && pg.periodo.fim === p.janela.fim, 'página de outro período');
    exigir(pg.municipio === null, 'página de outro recorte (município)');
    exigir(pg.limite === LIMITE_PAGINA && pg.deslocamento === deslocamento, 'página com limite ou deslocamento diferente do pedido');
    exigir(pg.total === this.totalResumo, 'total da página diferente do resumo');
    exigir(pg.registros.length === Math.min(LIMITE_PAGINA, Math.max(0, pg.total - deslocamento)), 'página com número de registros inesperado');
    for (const r of pg.registros) {
      exigir(!this.ids.has(r.id_tecnico), 'id_tecnico repetido entre páginas');
      const anterior = this.registros.at(-1);
      exigir(!anterior || naoDepois(anterior, r), 'ordem dos registros não crescente');
      this.ids.add(r.id_tecnico);
      this.registros.push({
        id_tecnico: r.id_tecnico, data_hora_gmt: r.data_hora_gmt, latitude: r.latitude, longitude: r.longitude,
        municipio_codigo: r.municipio_codigo,
      });
    }
  }

  completo(): boolean {
    return this.registros.length === this.totalResumo;
  }
}

/**
 * Lê resumo e páginas. O resumo é sempre relido (confere carga e total); registros já validados na
 * mesma sessão, carga, janela e recorte são reaproveitados só se o total for o mesmo.
 * Devolve `null` se a aplicação foi invalidada no meio (geração mudou).
 * Erros de chamada (ErroConsulta) propagam com o tipo; divergências viram ErroLente.
 */
export async function lerRegistros(
  fontes: FontesLente,
  pedido: PedidoLente,
  atual: () => boolean,
  progresso: (lidos: number, total: number) => void = () => {},
  reaproveitar: { registros: RegistroLente[]; totalResumo: number } | null = null,
): Promise<{ registros: RegistroLente[]; totalResumo: number; reaproveitado: boolean } | null> {
  const filtro = filtroEstadual(pedido);
  const resumo = await fontes.resumo(filtro);
  if (!atual()) return null;
  const total = validarResumo(pedido, resumo);
  if (reaproveitar && reaproveitar.totalResumo === total && reaproveitar.registros.length === total) {
    return { ...reaproveitar, reaproveitado: true };
  }
  const acc = new AcumuladorPaginas(pedido, total);
  progresso(0, total);
  for (let desloc = 0; desloc < total || desloc === 0; desloc += LIMITE_PAGINA) {
    const pg = await fontes.pagina(filtro, LIMITE_PAGINA, desloc);
    if (!atual()) return null;
    acc.adicionar(pg, desloc);
    progresso(acc.registros.length, total);
    if (total === 0) break;
  }
  exigir(acc.completo(), 'leitura incompleta dos registros');
  return { registros: acc.registros, totalResumo: total, reaproveitado: false };
}

/** Integridade T3: exatamente um dia por dia GMT da janela, no satélite da carga, sem repetição. */
export function validarDisponibilidade(
  pedido: PedidoLente,
  municipio: number,
  satelite: string,
  d: Disponibilidade,
): Map<string, DiaLente> {
  exigir(d.carga.id === pedido.carga, 'disponibilidade de outra carga');
  exigir(d.periodo.inicio === pedido.janela.inicio && d.periodo.fim === pedido.janela.fim, 'disponibilidade de outro período');
  exigir(d.municipio === municipio, 'disponibilidade de outro município');
  const esperados = new Set(diasDaJanela(pedido.janela));
  const dias = new Map<string, DiaLente>();
  for (const x of d.dias ?? []) {
    exigir(x.satelite === satelite, 'leitura incompleta: dia de outro satélite');
    exigir(esperados.has(x.dia), 'leitura incompleta: dia fora da janela');
    exigir(!dias.has(x.dia), 'leitura incompleta: dia repetido');
    dias.set(x.dia, { dia: x.dia, classe: x.classe, motivos: x.motivos });
  }
  exigir(dias.size === esperados.size, 'leitura incompleta: dia faltante');
  return dias;
}

/** Destino de cada tipo de erro por origem da chamada da lente (R2-1, caso E-1). */
export type DestinoErro = 'global' | 'versao' | 'falha_lente' | 'falha_qualificador' | 'falha_contorno';
export type OrigemChamada = 'resumo' | 'pagina' | 'disponibilidade' | 'geometria';

export function destinoErro(tipo: TipoErro | 'leitura_inconsistente', origem: OrigemChamada): DestinoErro {
  if (tipo === 'acesso_negado' || tipo === 'sessao_expirada' || tipo === 'sem_publicacao') return 'global';
  if (tipo === 'versao_substituida') return 'versao';
  if (origem === 'disponibilidade') return 'falha_qualificador';
  if (origem === 'geometria') return 'falha_contorno';
  return 'falha_lente';
}

/** Executa tarefas com concorrência limitada, parando de iniciar novas se a aplicação foi invalidada. */
export async function emParalelo<T>(itens: T[], limite: number, atual: () => boolean, tarefa: (x: T) => Promise<void>): Promise<void> {
  let proximo = 0;
  const trabalhador = async (): Promise<void> => {
    while (proximo < itens.length && atual()) {
      const x = itens[proximo];
      proximo += 1;
      if (x !== undefined) await tarefa(x);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limite, itens.length) }, trabalhador));
}
