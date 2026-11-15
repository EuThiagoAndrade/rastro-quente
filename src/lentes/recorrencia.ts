// Lente de recorrência (U2, Q5, D13, D14, T1, T5): conta, por célula de 0,05° (grade T1), os meses GMT
// distintos com detecção principal na janela. Destaca as células com detecções em pelo menos 3 meses.
// Todo mês GMT tocado pela janela conta, inclusive o parcial, que é marcado (D14); janela que toca menos
// de 3 meses GMT é `janela_insuficiente`, sem destaques. Não ordena por medida (Q8): a lista segue o
// código da célula, norte→sul e depois oeste→leste (T5). A disponibilidade só qualifica (D13).
import { conferirEntrada } from './comum.ts';
import {
  ErroLente, LIMITACOES_CELULA, LIMITACOES_COMUNS, limitacoesDoRecorte, RECORTE_ESTADUAL, VERSAO_METODO,
  type Destaque, type EntradaLente, type Janela, type MesJanela, type ResultadoLente,
} from './contrato.ts';
import { celulaDe, ErroCoordenada, indiceGrade } from './grade.ts';

export const K_MESES = 3;

const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-08" → "ago/2026". */
export const rotuloMes = (mes: string): string => `${NOMES_MES[Number(mes.slice(5, 7)) - 1] ?? mes}/${mes.slice(0, 4)}`;

/** "2026-08-15" → "15/08". */
const diaMes = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** "a, b e c". */
export function listar(itens: string[]): string {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

/** Último dia (YYYY-MM-DD) do mês "YYYY-MM". */
function ultimoDiaDoMes(mes: string): string {
  const t = Date.UTC(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0);
  return new Date(t).toISOString().slice(0, 10);
}

function proximoMes(mes: string): string {
  const t = Date.UTC(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 1);
  return new Date(t).toISOString().slice(0, 7);
}

/** Meses GMT tocados pela janela (dias GMT inclusivos), com a marca de parcial (D14). */
export function mesesDaJanela(janela: Janela): MesJanela[] {
  const meses: MesJanela[] = [];
  for (let mes = janela.inicio.slice(0, 7); mes <= janela.fim.slice(0, 7); mes = proximoMes(mes)) {
    const primeiro = `${mes}-01`;
    const ultimo = ultimoDiaDoMes(mes);
    const inicio = janela.inicio > primeiro ? janela.inicio : primeiro;
    const fim = janela.fim < ultimo ? janela.fim : ultimo;
    meses.push({ mes, parcial: inicio !== primeiro || fim !== ultimo, inicio, fim });
  }
  return meses;
}

/** Texto de um mês parcial: "ago/2026 (janela de 15/08 a 31/08)". */
export const textoMesParcial = (m: MesJanela): string => `${rotuloMes(m.mes)} (janela de ${diaMes(m.inicio)} a ${diaMes(m.fim)})`;

export function recorrencia(e: EntradaLente): ResultadoLente {
  const conferencia = conferirEntrada(e);
  const meses = mesesDaJanela(e.janela);
  const parciais = meses.filter((m) => m.parcial);
  const observacoes = [
    `A janela toca ${meses.length} ${meses.length === 1 ? 'mês GMT' : 'meses GMT'}: ${listar(meses.map((m) => rotuloMes(m.mes) + (m.parcial ? ' (parcial)' : '')))}.`,
  ];
  if (parciais.length) {
    observacoes.push(`Mês parcial conta como mês tocado: ${listar(parciais.map(textoMesParcial))}.`);
  }
  const base = {
    lente: 'recorrencia' as const,
    versao_metodo: VERSAO_METODO,
    carga: e.carga,
    janela: { ...e.janela, referencia: 'dias GMT inclusivos' as const, meses },
    recorte: e.recorte ?? RECORTE_ESTADUAL,
    parametros: [
      { nome: 'Unidade', valor: 'célula de 0,05° de lado, ancorada em 0° de latitude e longitude (bordas sul e oeste incluídas)' },
      { nome: 'Medida', valor: 'meses GMT distintos com detecção principal na célula, dentro da janela' },
      { nome: 'Corte', valor: `pelo menos ${K_MESES} meses GMT distintos; mês tocado pela janela conta, e o parcial é marcado` },
      { nome: 'Janela mínima', valor: `a janela precisa tocar pelo menos ${K_MESES} meses GMT` },
    ],
    ordenacao: null,
    conferencia,
    limitacoes: [...LIMITACOES_COMUNS, ...LIMITACOES_CELULA, ...limitacoesDoRecorte(e)],
  };
  if (meses.length < K_MESES) {
    observacoes.unshift(`A janela toca ${meses.length} ${meses.length === 1 ? 'mês GMT' : 'meses GMT'}; a recorrência exige pelo menos ${K_MESES}.`);
    return { ...base, estado: 'janela_insuficiente', observacoes, destaques: [] };
  }

  const porCelula = new Map<string, { kLat: number; kLon: number; lat: number; lon: number; ids: string[]; meses: Set<string>; municipios: Set<number> }>();
  for (const r of e.registros) {
    let kLat: number;
    let kLon: number;
    try {
      kLat = indiceGrade(r.latitude);
      kLon = indiceGrade(r.longitude);
    } catch (x) {
      // T1: coordenada fora da forma canônica não é classificada; a lente não é exibida.
      if (x instanceof ErroCoordenada) throw new ErroLente(`coordenada inválida em ${r.id_tecnico}: ${x.message}`);
      throw x;
    }
    const chave = `${kLat}_${kLon}`;
    let c = porCelula.get(chave);
    if (!c) {
      c = { kLat, kLon, lat: r.latitude, lon: r.longitude, ids: [], meses: new Set(), municipios: new Set() };
      porCelula.set(chave, c);
    }
    c.ids.push(r.id_tecnico);
    c.meses.add(r.data_hora_gmt.slice(0, 7));
    c.municipios.add(r.municipio_codigo);
  }

  const parcialPorMes = new Map(meses.map((m) => [m.mes, m]));
  // T5: norte→sul (índice de latitude decrescente) e depois oeste→leste; nunca pela medida.
  const escolhidas = [...porCelula.values()]
    .filter((c) => c.meses.size >= K_MESES)
    .sort((a, b) => b.kLat - a.kLat || a.kLon - b.kLon);
  const destaques: Destaque[] = escolhidas.map((c) => {
    const unidade = celulaDe(c.lat, c.lon);
    const mesesCelula = [...c.meses].sort();
    const parciaisCelula = mesesCelula.flatMap((m) => {
      const x = parcialPorMes.get(m);
      return x?.parcial ? [x] : [];
    });
    return {
      id_destaque: `recorrencia:celula_005:${unidade.id}`,
      unidade,
      motivo: `Detecções em ${mesesCelula.length} meses GMT distintos na janela: ${listar(mesesCelula.map((m) => rotuloMes(m) + (parcialPorMes.get(m)?.parcial ? ' (parcial)' : '')))}.`,
      evidencia: { deteccoes: [...c.ids].sort(), valor: mesesCelula.length, datas: mesesCelula },
      cobertura: { estado: 'pendente', municipios: [...c.municipios].sort((a, b) => a - b) },
      ressalvas: parciaisCelula.map((m) => `inclui mês parcial: ${textoMesParcial(m)}`),
    };
  });
  return { ...base, estado: destaques.length ? 'com_destaques' : 'sem_destaques', observacoes, destaques };
}
