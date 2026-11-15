// Memória de recortes (plano 007, T6): leituras completas e conferidas de registros, com a disponibilidade por
// município já validada, guardadas só em variáveis da página (nunca em localStorage, sessionStorage, IndexedDB
// ou cache HTTP). Chave: geração da sessão, carga, início, fim e município. Até 3 recortes; o mais antigo sai.
// O resumo é sempre relido antes de qualquer reuso (lerRegistros); quem limpa a memória é o controlador, junto
// com a geração da sessão (logout, expiração, revogação, troca ou indisponibilidade de carga).
import type { DisponibilidadeMunicipio } from './lentes/contrato.ts';
import type { Registro } from './tipos.ts';

export const MAX_RECORTES = 3;

export interface RecorteMemoria {
  carga: number;
  inicio: string;
  fim: string;
  municipio: number | null;
}

export interface LeituraRecorte {
  chave: string;
  registros: Registro[];
  totalResumo: number;
  /** Disponibilidade por município, só a validada (falhas não são guardadas). */
  disponibilidade: Map<number, DisponibilidadeMunicipio>;
}

export const chaveRecorte = (sessao: number, r: RecorteMemoria): string =>
  `${sessao}|${r.carga}|${r.inicio}|${r.fim}|${r.municipio ?? 'estado'}`;

export class MemoriaRecortes {
  private itens: LeituraRecorte[] = [];
  private readonly maximo: number;

  constructor(maximo: number = MAX_RECORTES) {
    this.maximo = maximo;
  }

  /** Leitura guardada na chave, que passa a ser a mais recente; `null` se não houver. */
  obter(chave: string): LeituraRecorte | null {
    const i = this.itens.findIndex((x) => x.chave === chave);
    if (i < 0) return null;
    const [item] = this.itens.splice(i, 1);
    if (!item) return null;
    this.itens.push(item);
    return item;
  }

  /** Guarda (ou substitui) a leitura da chave como a mais recente e descarta as mais antigas além do máximo. */
  guardar(leitura: LeituraRecorte): LeituraRecorte {
    this.itens = this.itens.filter((x) => x.chave !== leitura.chave);
    this.itens.push(leitura);
    while (this.itens.length > this.maximo) this.itens.shift();
    return leitura;
  }

  limpar(): void {
    this.itens = [];
  }

  get chaves(): string[] {
    return this.itens.map((x) => x.chave);
  }
}
