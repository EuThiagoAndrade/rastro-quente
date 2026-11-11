// Lente de persistência (U2, Q6 refinada por D15, D13, T1, T4, T5, T6): por célula de 0,05° (grade T1),
// os dias GMT com detecção principal na janela; destaca cada sequência de 3 ou mais dias GMT consecutivos
// como destaque próprio (T6). Só um dia SEM detecção na célula interrompe a sequência (D15); um dia com
// detecção nunca interrompe, qualquer que seja sua classe. Por isso a disponibilidade não muda a seleção:
// ela só gera as ressalvas por classe (D15, T7), aplicadas na qualificação (cobertura.ts). A sequência que
// toca a borda da janela recebe a ressalva T4. Não se infere detecção em dia sem informação. Ordem T5: data
// de início, depois a célula (norte→sul, oeste→leste); nunca pela medida.
import { somarDia } from './cobertura.ts';
import { conferirEntrada } from './comum.ts';
import {
  ErroLente, LIMITACOES_CELULA, LIMITACOES_COMUNS, VERSAO_METODO,
  type Destaque, type EntradaLente, type ResultadoLente,
} from './contrato.ts';
import { celulaDe, ErroCoordenada, indiceGrade } from './grade.ts';

export const DIAS_MINIMOS = 3;

export const RESSALVA_BORDA = 'sequência no limite da janela; pode ser mais longa';

/** "2026-10-12" → "12/10/2026". */
const dataBr = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;

interface Celula {
  kLat: number;
  kLon: number;
  lat: number;
  lon: number;
  municipios: Set<number>;
  porDia: Map<string, string[]>;
}

/** Sequências maximais de dias consecutivos (dias já ordenados e distintos). */
function sequencias(dias: string[]): string[][] {
  const seqs: string[][] = [];
  let atual: string[] = [];
  for (const dia of dias) {
    const ultimo = atual.at(-1);
    if (ultimo !== undefined && somarDia(ultimo, 1) === dia) atual.push(dia);
    else {
      if (atual.length) seqs.push(atual);
      atual = [dia];
    }
  }
  if (atual.length) seqs.push(atual);
  return seqs;
}

export function persistencia(e: EntradaLente): ResultadoLente {
  const conferencia = conferirEntrada(e);
  const porCelula = new Map<string, Celula>();
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
      c = { kLat, kLon, lat: r.latitude, lon: r.longitude, municipios: new Set(), porDia: new Map() };
      porCelula.set(chave, c);
    }
    // Municípios de todas as detecções da célula na janela (D13), não só os da sequência.
    c.municipios.add(r.municipio_codigo);
    const dia = r.data_hora_gmt.slice(0, 10);
    const ids = c.porDia.get(dia);
    if (ids) ids.push(r.id_tecnico);
    else c.porDia.set(dia, [r.id_tecnico]);
  }

  const escolhidas: { c: Celula; dias: string[] }[] = [];
  for (const c of porCelula.values()) {
    for (const dias of sequencias([...c.porDia.keys()].sort())) {
      if (dias.length >= DIAS_MINIMOS) escolhidas.push({ c, dias });
    }
  }
  // T5: data de início; depois norte→sul (índice de latitude decrescente) e oeste→leste.
  escolhidas.sort((a, b) => (a.dias[0] ?? '').localeCompare(b.dias[0] ?? '') || b.c.kLat - a.c.kLat || a.c.kLon - b.c.kLon);

  const destaques: Destaque[] = escolhidas.map(({ c, dias }) => {
    const unidade = celulaDe(c.lat, c.lon);
    const inicio = dias[0] ?? '';
    const fim = dias.at(-1) ?? '';
    // T4: começa no primeiro ou termina no último dia da janela.
    const borda = inicio === e.janela.inicio || fim === e.janela.fim;
    return {
      id_destaque: `persistencia:celula_005:${unidade.id}:${inicio}`,
      unidade,
      motivo: `Detecções em ${dias.length} dias GMT consecutivos na célula, de ${dataBr(inicio)} a ${dataBr(fim)}.`,
      evidencia: { deteccoes: dias.flatMap((d) => c.porDia.get(d) ?? []).sort(), valor: dias.length, datas: dias },
      cobertura: { estado: 'pendente', municipios: [...c.municipios].sort((a, b) => a - b) },
      ressalvas: borda ? [RESSALVA_BORDA] : [],
    };
  });

  return {
    lente: 'persistencia',
    versao_metodo: VERSAO_METODO,
    carga: e.carga,
    janela: { ...e.janela, referencia: 'dias GMT inclusivos' },
    recorte: { tipo: 'estado', municipio: null },
    parametros: [
      { nome: 'Unidade', valor: 'célula de 0,05° de lado, ancorada em 0° de latitude e longitude (bordas sul e oeste incluídas)' },
      { nome: 'Medida', valor: 'dias GMT consecutivos com detecção principal na célula, dentro da janela' },
      { nome: 'Corte', valor: `pelo menos ${DIAS_MINIMOS} dias GMT consecutivos; cada sequência é um destaque próprio` },
      { nome: 'Interrupção', valor: 'só um dia sem detecção na célula interrompe; dia com detecção conta qualquer que seja a classe de disponibilidade' },
    ],
    estado: destaques.length ? 'com_destaques' : 'sem_destaques',
    ordenacao: null,
    observacoes: [],
    destaques,
    conferencia,
    limitacoes: [...LIMITACOES_COMUNS, ...LIMITACOES_CELULA],
  };
}
