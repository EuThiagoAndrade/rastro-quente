// Lente de sobreposição com áreas protegidas (plano 006, T22, T23, S1, D13, T5). Para a classe escolhida, uma
// célula T1 de 0,05° é destacada se tiver pelo menos uma detecção principal da janela vinculada a uma área da
// classe. Os vínculos vêm prontos da carga (T18, polígono integral) e são lidos por `carregar-areas.ts` (T25);
// a lente não recalcula geometria. Não ordena por área nem por contagem: a lista segue a T5. Fica fora de
// `TipoLente` e da combinação (K1), com versão própria. Estar dentro de uma área protegida orienta a avaliação
// técnica; não comprova incêndio, dano, autoria, infração nem situação fundiária.
import { qualificarCobertura } from './cobertura.ts';
import { conferirEntrada } from './comum.ts';
import {
  AVISO_DOMINIO, ErroLente, LIMITACOES_CELULA, LIMITACOES_COMUNS,
  type CargaLente, type Destaque, type DisponibilidadeMunicipio, type EntradaLente, type Janela, type Parametro, type ResultadoLente,
} from './contrato.ts';
import { chaveArea, type AreaLida, type ClasseArea, type LeituraAreas } from './carregar-areas.ts';
import { celulaDe, ErroCoordenada, indiceGrade } from './grade.ts';

export const VERSAO_SOBREPOSICAO = 'sobreposicao-006-v1';

export const CLASSES_AREA: readonly ClasseArea[] = ['protecao_integral', 'uso_sustentavel', 'terra_indigena'];

export const ROTULO_CLASSE: Record<ClasseArea, string> = {
  protecao_integral: 'proteção integral',
  uso_sustentavel: 'uso sustentável',
  terra_indigena: 'terra indígena',
};

/** Valores de `quali_pol` do CNUC (T17) e a ressalva de cada um (T22); nulo na terra indígena. */
export const QUALIDADE_MEMORIAL = 'Polígono corresponde ao memorial descritivo';
export const QUALIDADE_ESTIMATIVA = 'Polígono é uma estimativa dos limites da UC';
export const QUALIDADE_ESQUEMATICA = 'Polígono é uma representação esquemática da localização da UC';
const RESSALVA_QUALIDADE = new Map<string, string | null>([
  [QUALIDADE_MEMORIAL, null],
  [QUALIDADE_ESTIMATIVA, 'limite estimado pelo órgão gestor; a posição exata pode diferir'],
  [QUALIDADE_ESQUEMATICA, 'representação esquemática da localização; a posição pode diferir muito'],
]);

export const TEXTO_SEM_CAMADA = 'esta versão dos dados não tem a camada de áreas protegidas';

/** T23: texto do estado sem destaques. */
export const textoSemDestaques = (classe: ClasseArea): string =>
  `Nenhuma célula com detecção dentro de ${ROTULO_CLASSE[classe]} nesta janela. Isso não indica ausência de focos nem de risco.`;

/** T23: limitações; a primeira é a de domínio com o acréscimo sobre áreas protegidas. */
export const LIMITACOES_SOBREPOSICAO = [
  `${AVISO_DOMINIO} Estar dentro de uma área protegida não indica infração, autoria nem situação fundiária.`,
  ...LIMITACOES_COMUNS.slice(1),
  ...LIMITACOES_CELULA,
  'Os limites são um retrato datado da fonte (CNUC e FUNAI; versão e data no cartão de Proveniência) e mudam por ato oficial.',
  'A classificação usa o polígono integral da fonte; o mapa mostra um contorno simplificado (tolerância de até cerca de 550 m), e o contorno real pode ser aberto por área.',
  'Não entram: RPPN, terras indígenas em estudo, zonas de amortecimento e unidades sem polígono no CNUC. Áreas de outros estados que entram em Mato Grosso só aparecem quando contêm detecção desta carga.',
  'SIRGAS 2000 nas áreas e WGS84 nas detecções; a diferença é desprezível nesta escala.',
  'A lista não é ranking: a classe ou o número de detecções não indica gravidade nem prioridade.',
];

/** Entrada inválida (classe fora das três): a lente não é exibida. */
export class ErroEntradaSobreposicao extends ErroLente {}

/** Uma área da classe com vínculo na célula (T22). */
export interface AreaSobreposicao {
  /** `<fonte>:<código>`, única na carga; usada para baixar o contorno real. */
  chave: string;
  nome: string;
  classe: ClasseArea;
  categoria_ou_fase: string | null;
  /** Só na unidade de conservação; nula na terra indígena. */
  esfera: string | null;
  qualidade_poligono: string | null;
  /** `id_tecnico` da célula e da janela vinculados à área, ordenados. */
  deteccoes: string[];
  /** Quantos desses vínculos são `borda`. */
  na_borda: number;
  ressalvas: string[];
}

export interface DestaqueSobreposicao extends Destaque {
  areas: AreaSobreposicao[];
}

export interface ResultadoSobreposicao {
  lente: 'sobreposicao';
  versao_metodo: string;
  classe: ClasseArea;
  carga: CargaLente;
  janela: Janela & { referencia: 'dias GMT inclusivos' };
  recorte: { tipo: 'estado'; municipio: null };
  parametros: Parametro[];
  estado: 'com_destaques' | 'sem_destaques' | 'sem_camada';
  destaques: DestaqueSobreposicao[];
  conferencia: ResultadoLente['conferencia'] & { areas_lidas: number; vinculos_lidos: number };
  limitacoes: string[];
}

export function validarClasse(classe: string): ClasseArea {
  const c = CLASSES_AREA.find((x) => x === classe);
  if (!c) throw new ErroEntradaSobreposicao(`entrada inválida: classe desconhecida (${classe})`);
  return c;
}

const plural = (n: number, um: string, varios: string): string => `${n} ${n === 1 ? um : varios}`;

/** Nome exibido: a terra indígena leva o prefixo "Terra Indígena". */
export const nomeArea = (a: { classe: ClasseArea; nome: string }): string =>
  a.classe === 'terra_indigena' ? `Terra Indígena ${a.nome}` : a.nome;

/** T23: trecho do motivo de uma área. */
function trechoMotivo(a: AreaSobreposicao, totalCelula: number): string {
  const base = `${a.deteccoes.length} de ${plural(totalCelula, 'detecção', 'detecções')} desta célula dentro`;
  if (a.classe === 'terra_indigena') {
    return `${base} da ${nomeArea(a)}${a.categoria_ou_fase ? ` (fase: ${a.categoria_ou_fase})` : ''}`;
  }
  const atributos = [ROTULO_CLASSE[a.classe], a.categoria_ou_fase, a.esfera].filter((x) => x);
  return `${base} de ${a.nome} (${atributos.join(', ')})`;
}

function ressalvasDaArea(area: AreaLida, naBorda: number): string[] {
  const ressalvas: string[] = [];
  if (area.qualidade !== null) {
    if (!RESSALVA_QUALIDADE.has(area.qualidade)) throw new ErroLente(`qualidade de polígono desconhecida em ${chaveArea(area.fonte, area.codigo)}`);
    const r = RESSALVA_QUALIDADE.get(area.qualidade);
    if (r) ressalvas.push(r);
  }
  if (naBorda > 0) ressalvas.push(`${plural(naBorda, 'detecção', 'detecções')} exatamente sobre o limite da área`);
  return ressalvas;
}

export const PARAMETROS_SOBREPOSICAO = (classe: ClasseArea): Parametro[] => [
  { nome: 'Unidade', valor: 'célula de 0,05° de lado, ancorada em 0° de latitude e longitude (bordas sul e oeste incluídas)' },
  { nome: 'Classe', valor: ROTULO_CLASSE[classe] },
  { nome: 'Regra', valor: 'a célula é destacada se tiver pelo menos 1 detecção principal da janela dentro de área da classe, com a borda incluída' },
  { nome: 'Pertencimento', valor: 'calculado na carga com o polígono integral da fonte; o contorno exibido não é usado' },
];

interface CelulaAcumulada {
  kLat: number;
  kLon: number;
  lat: number;
  lon: number;
  ids: string[];
  municipios: Set<number>;
  areas: Map<string, { area: AreaLida; ids: string[]; borda: number }>;
}

/**
 * Aplica a lente à entrada conferida e à camada lida por T25 (função pura). Área, vínculo ou linha da carga de
 * outra carga, vínculo para área não lida e vínculo repetido lançam ErroLente; classe fora das três lança
 * ErroEntradaSobreposicao. Vínculos de detecções fora da janela são ignorados.
 */
export function sobreposicao(e: EntradaLente, camada: LeituraAreas, classeEscolhida: string): ResultadoSobreposicao {
  const classe = validarClasse(classeEscolhida);
  const conferencia = conferirEntrada(e);
  if (camada.carga.id !== e.carga.id || camada.carga.identidade !== e.carga.identidade) {
    throw new ErroLente('camada de áreas de outra carga');
  }
  const base = {
    lente: 'sobreposicao' as const,
    versao_metodo: VERSAO_SOBREPOSICAO,
    classe,
    carga: e.carga,
    janela: { ...e.janela, referencia: 'dias GMT inclusivos' as const },
    recorte: { tipo: 'estado' as const, municipio: null },
    parametros: PARAMETROS_SOBREPOSICAO(classe),
    limitacoes: [...LIMITACOES_SOBREPOSICAO],
  };
  if (camada.estado === 'sem_camada') {
    return { ...base, estado: 'sem_camada', destaques: [], conferencia: { ...conferencia, areas_lidas: 0, vinculos_lidos: 0 } };
  }

  const areas = new Map<string, AreaLida>();
  for (const a of camada.areas) {
    if (a.carga_id !== e.carga.id) throw new ErroLente('área de outra carga');
    const k = chaveArea(a.fonte, a.codigo);
    if (areas.has(k)) throw new ErroLente(`área repetida: ${k}`);
    if (!CLASSES_AREA.includes(a.classe)) throw new ErroLente(`classe de área desconhecida em ${k}`);
    areas.set(k, a);
  }

  const porCelula = new Map<string, CelulaAcumulada>();
  const celulaDoId = new Map<string, CelulaAcumulada>();
  for (const r of e.registros) {
    let kLat: number;
    let kLon: number;
    try {
      kLat = indiceGrade(r.latitude);
      kLon = indiceGrade(r.longitude);
    } catch (x) {
      if (x instanceof ErroCoordenada) throw new ErroLente(`coordenada inválida em ${r.id_tecnico}: ${x.message}`);
      throw x;
    }
    const chave = `${kLat}_${kLon}`;
    let c = porCelula.get(chave);
    if (!c) {
      c = { kLat, kLon, lat: r.latitude, lon: r.longitude, ids: [], municipios: new Set(), areas: new Map() };
      porCelula.set(chave, c);
    }
    c.ids.push(r.id_tecnico);
    c.municipios.add(r.municipio_codigo);
    celulaDoId.set(r.id_tecnico, c);
  }

  const vistos = new Set<string>();
  for (const v of camada.vinculos) {
    if (v.carga_id !== e.carga.id) throw new ErroLente('vínculo de outra carga');
    const k = chaveArea(v.area_fonte, v.area_codigo);
    const area = areas.get(k);
    if (!area) throw new ErroLente(`vínculo para área não lida: ${v.id_tecnico} → ${k}`);
    const kv = `${v.id_tecnico}|${k}`;
    if (vistos.has(kv)) throw new ErroLente(`vínculo repetido: ${kv}`);
    vistos.add(kv);
    if (area.classe !== classe) continue;
    const c = celulaDoId.get(v.id_tecnico);
    if (!c) continue; // detecção fora da janela
    let x = c.areas.get(k);
    if (!x) {
      x = { area, ids: [], borda: 0 };
      c.areas.set(k, x);
    }
    x.ids.push(v.id_tecnico);
    if (v.posicao === 'borda') x.borda += 1;
  }

  // T5: norte→sul (índice de latitude decrescente) e depois oeste→leste; nunca por área ou contagem.
  const escolhidas = [...porCelula.values()].filter((c) => c.areas.size > 0).sort((a, b) => b.kLat - a.kLat || a.kLon - b.kLon);
  const destaques: DestaqueSobreposicao[] = escolhidas.map((c) => {
    const unidade = celulaDe(c.lat, c.lon);
    const lista: AreaSobreposicao[] = [...c.areas.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([chave, { area, ids, borda }]) => ({
        chave,
        nome: area.nome,
        classe: area.classe,
        categoria_ou_fase: area.classe === 'terra_indigena' ? area.fase : area.categoria,
        esfera: area.classe === 'terra_indigena' ? null : area.esfera,
        qualidade_poligono: area.qualidade,
        deteccoes: [...ids].sort(),
        na_borda: borda,
        ressalvas: ressalvasDaArea(area, borda),
      }));
    const evidencia = [...new Set(lista.flatMap((a) => a.deteccoes))].sort();
    return {
      id_destaque: `sobreposicao:${classe}:celula_005:${unidade.id}`,
      unidade,
      motivo: lista.map((a) => trechoMotivo(a, c.ids.length)).join('; '),
      evidencia: { deteccoes: evidencia, valor: evidencia.length, datas: [] },
      cobertura: { estado: 'pendente', municipios: [...c.municipios].sort((a, b) => a - b) },
      ressalvas: lista.flatMap((a) => a.ressalvas.map((r) => `${nomeArea(a)}: ${r}`)),
      areas: lista,
    };
  });
  return {
    ...base,
    estado: destaques.length ? 'com_destaques' : 'sem_destaques',
    destaques,
    conferencia: { ...conferencia, areas_lidas: camada.areas.length, vinculos_lidos: camada.vinculos.length },
  };
}

/** Aplica a cobertura (D13) aos destaques; a seleção não muda. */
export function qualificarSobreposicao(r: ResultadoSobreposicao, disponibilidade: Map<number, DisponibilidadeMunicipio>): ResultadoSobreposicao {
  return {
    ...r,
    destaques: r.destaques.map((d) => ({ ...d, cobertura: qualificarCobertura(d.cobertura.municipios, r.janela, disponibilidade) })),
  };
}

export const municipiosDaSobreposicao = (r: ResultadoSobreposicao): number[] =>
  [...new Set(r.destaques.flatMap((d) => d.cobertura.municipios))].sort((a, b) => a - b);
