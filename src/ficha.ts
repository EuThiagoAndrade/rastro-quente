// Ficha para averiguação (ciclo 012, issue #113): do recorte na tela a um documento imprimível que o técnico leva a
// campo. Números sempre do recorte já lido e conferido (os mesmos registros do mapa); roteiro e síntese são
// determinísticos. A ficha não é gravada: é montada no navegador e salva pelo próprio navegador (Salvar como PDF).
// Valores da fonte entram por textContent, nunca como marcação.
import { h } from './apresentacao.ts';
import { CLASSES_DENSIDADE, densidadePorCelula, LEGENDA_DENSIDADE } from './densidade.ts';
import { fmtNumero } from './formato.ts';
import type { ClasseArea } from './lentes/carregar-areas.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import { diaGmt } from './replay.ts';
import { diasDoPeriodo } from './serie.ts';
import type { Janela } from './recorte.ts';

const KM_POR_GRAU = 111.32;
const br = (d: string): string => d.split('-').reverse().join('/');

export interface ResumoFicha {
  total: number;
  diasPeriodo: number;
  diasComDeteccao: number;
  primeiro: string | null;
  ultimo: string | null;
  pico: { dia: string; total: number } | null;
  semCobertura: string[];
  centro: { lat: number; lon: number } | null;
  extensaoKm: { norteSul: number; lesteOeste: number } | null;
  porDia: { dia: string; total: number }[];
}

/** Números da ficha a partir dos registros do alvo (recorte ou destaque), por dia GMT. */
export function resumirFicha(registros: readonly RegistroLente[], periodo: Janela, semCobertura: ReadonlyMap<string, unknown>): ResumoFicha {
  const dias = diasDoPeriodo(periodo.inicio, periodo.fim);
  const contagem = new Map<string, number>(dias.map((d) => [d, 0]));
  for (const r of registros) {
    const d = diaGmt(r);
    if (contagem.has(d)) contagem.set(d, contagem.get(d)! + 1);
  }
  const porDia = [...contagem].map(([dia, total]) => ({ dia, total }));
  const com = porDia.filter((d) => d.total > 0);
  const pico = com.reduce<{ dia: string; total: number } | null>((p, d) => (!p || d.total > p.total ? d : p), null);
  let centro: ResumoFicha['centro'] = null;
  let extensaoKm: ResumoFicha['extensaoKm'] = null;
  if (registros.length) {
    const lats = registros.map((r) => r.latitude);
    const lons = registros.map((r) => r.longitude);
    const lat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const lon = lons.reduce((a, b) => a + b, 0) / lons.length;
    centro = { lat, lon };
    extensaoKm = {
      norteSul: (Math.max(...lats) - Math.min(...lats)) * KM_POR_GRAU,
      lesteOeste: (Math.max(...lons) - Math.min(...lons)) * KM_POR_GRAU * Math.cos((lat * Math.PI) / 180),
    };
  }
  return {
    total: com.reduce((s, d) => s + d.total, 0), diasPeriodo: dias.length, diasComDeteccao: com.length,
    primeiro: com[0]?.dia ?? null, ultimo: com.at(-1)?.dia ?? null, pico,
    semCobertura: dias.filter((d) => semCobertura.has(d)), centro, extensaoKm, porDia,
  };
}

export interface AreaNaFicha {
  /** `fonte:codigo`, a mesma chave dos contornos do mapa. */
  chave: string;
  nome: string;
  classe: ClasseArea;
  deteccoes: number;
}

/** Áreas lidas (com a contagem de detecções do alvo em cada uma) ou o motivo de não constarem. */
export type AreasFicha = { estado: 'lidas'; areas: AreaNaFicha[]; fora: number } | { estado: 'sem_camada' | 'falha' };

export const ROTULO_AREA: Record<ClasseArea, string> = {
  protecao_integral: 'Proteção integral', uso_sustentavel: 'Uso sustentável', terra_indigena: 'Terra indígena',
};

/** Roteiro sugerido, determinístico, conforme o contexto do alvo. Orienta a averiguação; não conclui nada. */
export function roteiroAveriguacao(c: { areas: AreasFicha; persistencia: boolean; semCobertura: number; total: number }): string[] {
  const passos: string[] = [];
  if (c.total === 0) passos.push('Não há detecções no alvo: confirmar o recorte antes de qualquer deslocamento.');
  if (c.areas.estado === 'lidas') {
    if (c.areas.fora > 0) passos.push('Fora de áreas protegidas: consultar o CAR/SIMCAR do local e verificar se há autorização de queima controlada vigente.');
    if (c.areas.areas.some((a) => a.classe === 'terra_indigena')) passos.push('Em terra indígena: comunicar e articular com a FUNAI antes de qualquer ação em campo.');
    if (c.areas.areas.some((a) => a.classe !== 'terra_indigena')) passos.push('Em unidade de conservação: acionar o órgão gestor da unidade, conforme a esfera (federal, estadual ou municipal).');
  } else {
    passos.push('Áreas protegidas não conferidas nesta ficha: verificar o CAR/SIMCAR, a FUNAI e o órgão gestor conforme o local.');
  }
  if (c.persistencia) passos.push('Persistência de 3 dias seguidos ou mais no mesmo quadrado: priorizar imagem posterior para ver se houve alteração continuada.');
  if (c.semCobertura > 0) passos.push('Há dias de cobertura não comprovada no período: ausência de detecção nesses dias não indica ausência de calor.');
  passos.push('Conferir as detecções com outro sensor (VIIRS, pelo FIRMS) no mesmo período.');
  passos.push('Conferir imagem de satélite posterior ao último dia com detecção, datada, antes da vistoria.');
  return passos;
}

/** Síntese montada só com os números conferidos; sempre presente, com ou sem IA. */
export function sinteseDeterministica(r: ResumoFicha, local: string, periodo: Janela): string {
  const n = (x: number, um: string, varios: string) => `${fmtNumero(x)} ${x === 1 ? um : varios}`;
  const base = `Entre ${br(periodo.inicio)} e ${br(periodo.fim)} (${n(r.diasPeriodo, 'dia GMT', 'dias GMT')}), ${local} tem ${n(r.total, 'detecção de calor', 'detecções de calor')}`;
  if (r.total === 0) return `${base}. Nenhum dia com detecção no período.`;
  const pico = r.pico ? ` O maior número em um dia foi ${fmtNumero(r.pico.total)}, em ${br(r.pico.dia)}.` : '';
  const cobertura = r.semCobertura.length ? ` ${n(r.semCobertura.length, 'dia tem', 'dias têm')} cobertura não comprovada.` : '';
  return `${base} em ${n(r.diasComDeteccao, 'dia', 'dias')}, da primeira em ${br(r.primeiro!)} à última em ${br(r.ultimo!)}.${pico}${cobertura} Detecções não comprovam incêndio, dano, autoria ou infração.`;
}

// --- Montagem do diálogo ----------------------------------------------------------------------------------------

export interface Ficha {
  geradaEm: Date;
  carga: { id: number; identidade: string };
  pergunta: string | null;
  interpretacao: { linhas: string[]; origem: 'ia' | 'ia_reserva' | 'local' } | null;
  filtros: string[];
  alvo: string;
  local: string;
  periodo: Janela;
  registros: readonly RegistroLente[];
  resumo: ResumoFicha;
  areas: AreasFicha;
  roteiro: string[];
  sintese: string;
  mapa: MapaFicha;
}

/** Geometria GeoJSON para o mini mapa: limite de município ou contorno de área protegida. */
export interface GeometriaFicha {
  rotulo: string;
  classe: 'municipio' | ClasseArea;
  geometria: unknown;
}

/** O que o mini mapa desenha além da densidade (ciclo 013, D10), e o que não pôde ser lido. */
export interface MapaFicha {
  limites: GeometriaFicha[];
  areas: GeometriaFicha[];
  avisos: string[];
}

/**
 * Anéis `[lon, lat]` de uma geometria GeoJSON (Polygon, MultiPolygon, GeometryCollection ou Feature). Formato
 * inesperado não lança: devolve só os anéis válidos.
 */
export function aneis(g: unknown): [number, number][][] {
  if (typeof g !== 'object' || g === null) return [];
  const o = g as Record<string, unknown>;
  const valido = (anel: unknown): anel is [number, number][] => Array.isArray(anel) && anel.length >= 3
    && anel.every((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  const dePoligono = (p: unknown): [number, number][][] => (Array.isArray(p) ? p.filter(valido) : []);
  switch (o['type']) {
    case 'Feature': return aneis(o['geometry']);
    case 'GeometryCollection': return Array.isArray(o['geometries']) ? o['geometries'].flatMap(aneis) : [];
    case 'Polygon': return dePoligono(o['coordinates']);
    case 'MultiPolygon': return Array.isArray(o['coordinates']) ? o['coordinates'].flatMap(dePoligono) : [];
    default: return [];
  }
}

const SVG = 'http://www.w3.org/2000/svg';
function svg(tag: string, atributos: Record<string, string | number>): SVGElement {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(atributos)) e.setAttribute(k, String(v));
  return e;
}

/**
 * Mini mapa (ciclo 013, D10): limite dos municípios das detecções do alvo, contorno das áreas protegidas com detecções
 * e a densidade por célula (a mesma da camada do mapa: células de 0,05°, cinco classes fixas, contagem e não
 * gravidade). Sem fundo de terceiros; projeção simples com a escala corrigida pela latitude, enquadrada nos
 * municípios ou, sem eles, nas células.
 */
export function miniMapa(registros: readonly RegistroLente[], periodo: Janela, m: MapaFicha): Element {
  const L = 360;
  const A = 240;
  const celulas = densidadePorCelula(registros, periodo.inicio, periodo.fim).celulas;
  const limites = m.limites.map((g) => ({ ...g, aneis: aneis(g.geometria) })).filter((g) => g.aneis.length);
  const areas = m.areas.map((g) => ({ ...g, aneis: aneis(g.geometria) })).filter((g) => g.aneis.length);
  const raiz = svg('svg', {
    viewBox: `0 0 ${L} ${A}`, class: 'ficha__mini-mapa', role: 'img',
    'aria-label': `Mini mapa sem fundo: ${celulas.length} ${celulas.length === 1 ? 'célula' : 'células'} com detecções`
      + (limites.length ? `, limite de ${limites.map((g) => g.rotulo).join(', ')}` : '')
      + (areas.length ? `, ${areas.length} ${areas.length === 1 ? 'área protegida' : 'áreas protegidas'}` : ''),
  });
  raiz.append(svg('rect', { x: 0, y: 0, width: L, height: A, class: 'ficha__mapa-fundo' }));
  const pontos: [number, number][] = limites.length
    ? limites.flatMap((g) => g.aneis.flat())
    : celulas.flatMap((c): [number, number][] => [[Number(c.celula.oeste), Number(c.celula.sul)], [Number(c.celula.leste), Number(c.celula.norte)]]);
  if (!pontos.length) return raiz;
  let [s, n, o, l] = [Infinity, -Infinity, Infinity, -Infinity];
  for (const [lon, lat] of pontos) {
    if (lat < s) s = lat;
    if (lat > n) n = lat;
    if (lon < o) o = lon;
    if (lon > l) l = lon;
  }
  const cos = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const larg = Math.max((l - o) * cos, 0.02);
  const alt = Math.max(n - s, 0.02);
  const escala = Math.min((L - 24) / larg, (A - 24) / alt);
  const cx = (o + l) / 2;
  const cy = (s + n) / 2;
  const x = (lon: number) => L / 2 + (lon - cx) * cos * escala;
  const y = (lat: number) => A / 2 - (lat - cy) * escala;
  // Caminho com os vértices a menos de 0,5 px do anterior descartados: contornos detalhados ficam leves.
  const caminho = (rs: [number, number][][]): string => rs.map((anel) => {
    let ultimo: [number, number] | null = null;
    const partes: string[] = [];
    for (const [lon, lat] of anel) {
      const p: [number, number] = [x(lon), y(lat)];
      if (ultimo && Math.abs(p[0] - ultimo[0]) < 0.5 && Math.abs(p[1] - ultimo[1]) < 0.5) continue;
      partes.push(`${partes.length ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`);
      ultimo = p;
    }
    return `${partes.join('')}Z`;
  }).join('');
  // Áreas: o preenchimento fica sob as células e o contorno sobre elas, para não sumir onde há detecções.
  const caminhosAreas = areas.map((a) => ({ classe: a.classe, d: caminho(a.aneis) }));
  for (const a of caminhosAreas) raiz.append(svg('path', { d: a.d, class: `ficha__area ficha__area--${a.classe}`, 'fill-rule': 'evenodd' }));
  for (const c of celulas) {
    const x0 = x(Number(c.celula.oeste));
    const y0 = y(Number(c.celula.norte));
    raiz.append(svg('rect', {
      x: x0.toFixed(1), y: y0.toFixed(1),
      width: Math.max(x(Number(c.celula.leste)) - x0, 1).toFixed(1), height: Math.max(y(Number(c.celula.sul)) - y0, 1).toFixed(1),
      class: `ficha__celula ficha__celula--${c.classe}`, 'data-contagem': c.contagem,
    }));
  }
  for (const a of caminhosAreas) raiz.append(svg('path', { d: a.d, class: `ficha__area-contorno ficha__area--${a.classe}`, 'fill-rule': 'evenodd' }));
  for (const g of limites) raiz.append(svg('path', { d: caminho(g.aneis), class: 'ficha__limite', 'fill-rule': 'evenodd' }));
  const km = larg * KM_POR_GRAU;
  const barraKm = km > 200 ? 50 : km > 40 ? 10 : km > 8 ? 2 : 0.5;
  const px = (barraKm / KM_POR_GRAU) * escala;
  raiz.append(svg('line', { x1: 10, y1: A - 10, x2: 10 + px, y2: A - 10, class: 'ficha__escala' }));
  const t = svg('text', { x: 14 + px, y: A - 6, class: 'ficha__escala-texto' });
  t.textContent = `${barraKm} km`;
  raiz.append(t);
  const norte = svg('text', { x: L - 14, y: 16, class: 'ficha__escala-texto' });
  norte.textContent = 'N';
  raiz.append(norte);
  return raiz;
}

/** Legenda do mini mapa: as cinco classes fixas da densidade, o limite municipal e as classes de área presentes. */
function legendaMiniMapa(m: MapaFicha): Element {
  const classes = [...new Set(m.areas.map((a) => a.classe))].filter((c): c is ClasseArea => c !== 'municipio');
  return h('div', { class: 'ficha__legenda' },
    h('p', { class: 'nota' }, `${LEGENDA_DENSIDADE} (células de 0,05°, cerca de 5,5 km).`),
    h('ul', { class: 'ficha__legenda-itens' },
      ...CLASSES_DENSIDADE.map((c, i) => h('li', {}, h('span', { class: `ficha__amostra ficha__amostra--dens-${i}`, 'aria-hidden': 'true' }), c.rotulo)),
      m.limites.length ? h('li', {}, h('span', { class: 'ficha__amostra ficha__amostra--limite', 'aria-hidden': 'true' }), m.limites.length === 1 ? 'Limite do município' : 'Limites dos municípios') : null,
      ...classes.map((c) => h('li', {}, h('span', { class: `ficha__amostra ficha__amostra--${c}`, 'aria-hidden': 'true' }), ROTULO_AREA[c]))));
}

function miniSerie(r: ResumoFicha): Element {
  const L = 320;
  const A = 80;
  const raiz = svg('svg', { viewBox: `0 0 ${L} ${A}`, class: 'ficha__mini-serie', role: 'img', 'aria-label': 'Detecções por dia GMT no período' });
  const max = Math.max(1, ...r.porDia.map((d) => d.total));
  const w = L / Math.max(1, r.porDia.length);
  r.porDia.forEach((d, i) => {
    if (r.semCobertura.includes(d.dia)) raiz.append(svg('rect', { x: (i * w).toFixed(1), y: 0, width: Math.max(w - 1, 1).toFixed(1), height: A - 12, class: 'ficha__sem-cobertura' }));
    const hgt = d.total ? Math.max(2, (d.total / max) * (A - 16)) : 0;
    raiz.append(svg('rect', { x: (i * w).toFixed(1), y: (A - 12 - hgt).toFixed(1), width: Math.max(w - 1, 1).toFixed(1), height: hgt.toFixed(1), class: 'ficha__barra' }));
  });
  for (const [i, d] of [[0, r.porDia[0]], [r.porDia.length - 1, r.porDia.at(-1)]] as const) {
    if (!d) continue;
    const t = svg('text', { x: i === 0 ? 0 : L, y: A - 1, 'text-anchor': i === 0 ? 'start' : 'end', class: 'ficha__escala-texto' });
    t.textContent = br(d.dia).slice(0, 5);
    raiz.append(t);
  }
  return raiz;
}

const secao = (titulo: string, ...filhos: (Node | string | null)[]): HTMLElement =>
  h('section', { class: 'ficha__secao' }, h('h3', {}, titulo), ...filhos);
const lista = (itens: string[], numerada = false): HTMLElement =>
  h(numerada ? 'ol' : 'ul', {}, ...itens.map((x) => h('li', {}, x)));
const par = (rotulo: string, valor: string): HTMLElement[] => [h('dt', {}, rotulo), h('dd', {}, valor)];

export function renderFicha(corpo: HTMLElement, f: Ficha): void {
  const r = f.resumo;
  const quando = `${f.geradaEm.toLocaleDateString('pt-BR')} ${f.geradaEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const km = (x: number) => (x < 1 ? '< 1 km' : `${x.toFixed(x < 10 ? 1 : 0).replace('.', ',')} km`);
  const areas = f.areas.estado === 'lidas'
    ? f.areas.areas.length
      ? lista([...f.areas.areas.map((a) => `${a.nome} (${ROTULO_AREA[a.classe]}): ${fmtNumero(a.deteccoes)} ${a.deteccoes === 1 ? 'detecção' : 'detecções'}`),
        `Fora de áreas protegidas: ${fmtNumero(f.areas.fora)}`])
      : h('p', {}, 'Nenhuma detecção do alvo dentro de áreas protegidas da camada (CNUC e FUNAI).')
    : h('p', { class: 'nota' }, f.areas.estado === 'sem_camada' ? 'A versão de dados não tem a camada de áreas protegidas.' : 'Não foi possível ler as áreas protegidas agora; confira o local antes da vistoria.');
  corpo.replaceChildren(
    h('header', { class: 'ficha__cabeca' },
      h('p', { class: 'ficha__sobretitulo' }, 'Rastro Quente · Ficha para averiguação'),
      h('p', { class: 'nota' }, `Gerada em ${quando} · versão de dados ${f.carga.id} (${f.carga.identidade.slice(0, 12)}…)`)),
    secao('1. Origem do pedido',
      f.pergunta ? h('p', {}, h('strong', {}, 'Pergunta: '), `“${f.pergunta}”`) : h('p', {}, 'Gerada a partir dos filtros da tela.'),
      f.interpretacao ? h('p', { class: 'nota' }, `Interpretação (${{ ia: 'por IA', ia_reserva: 'por IA, modelo reserva', local: 'sem IA' }[f.interpretacao.origem]}): ${f.interpretacao.linhas.join(' · ')}`) : null,
      h('p', {}, h('strong', {}, 'Filtros aplicados: '), f.filtros.join(' · ')),
      h('p', {}, h('strong', {}, 'Alvo: '), f.alvo)),
    secao('2. Local',
      h('dl', { class: 'ficha__pares' },
        ...par('Município', f.local),
        ...par('Centro aproximado', r.centro ? `${r.centro.lat.toFixed(4)}, ${r.centro.lon.toFixed(4)} (lat, lon)` : '—'),
        ...par('Extensão aproximada', r.extensaoKm ? `${km(r.extensaoKm.norteSul)} norte–sul × ${km(r.extensaoKm.lesteOeste)} leste–oeste` : '—')),
      h('p', { class: 'ficha__rotulo' }, 'Áreas protegidas (detecções do alvo dentro de cada uma, inclusive na borda)'), areas),
    secao('3. Evidências',
      h('dl', { class: 'ficha__pares' },
        ...par('Detecções de calor', fmtNumero(r.total)),
        ...par('Dias com detecção', `${fmtNumero(r.diasComDeteccao)} de ${fmtNumero(r.diasPeriodo)} dias GMT`),
        ...par('Primeiro e último dia', r.primeiro ? `${br(r.primeiro)} a ${br(r.ultimo!)}` : '—'),
        ...par('Pico diário', r.pico ? `${fmtNumero(r.pico.total)} em ${br(r.pico.dia)}` : '—'),
        ...par('Dias de cobertura não comprovada', r.semCobertura.length ? `${fmtNumero(r.semCobertura.length)} (${r.semCobertura.map((d) => br(d).slice(0, 5)).join(', ')})` : 'nenhum no recorte do município ou recorte estadual')),
      h('div', { class: 'ficha__figuras' }, h('figure', { class: 'ficha__figura' }, miniMapa(f.registros, f.periodo, f.mapa), legendaMiniMapa(f.mapa)), miniSerie(r)),
      ...f.mapa.avisos.map((a) => h('p', { class: 'nota' }, a)),
      h('p', { class: 'nota' }, 'Mini mapa sem imagem de fundo. Na série, as faixas claras marcam dias de cobertura não comprovada.')),
    secao('4. Síntese', h('p', {}, f.sintese)),
    secao('5. Roteiro de averiguação sugerido', lista(f.roteiro, true)),
    secao('6. Ressalvas', lista([
      'Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração.',
      'Totais em dia GMT (o dia local de Cuiabá começa 4 horas depois).',
      'Disponibilidade é separada da detecção: nenhuma classe comprova cobertura.',
      'A imagem de satélite da Esri, quando usada na tela, não é datada: não serve como evidência do período.',
    ])),
    secao('7. Conclusão do técnico',
      h('fieldset', { class: 'ficha__conclusao' }, h('legend', {}, 'Parecer'),
        ...['Procedente para vistoria', 'Não procedente', 'Inconclusivo'].map((t) =>
          h('label', { class: 'opcao' }, h('input', { type: 'radio', name: 'ficha-parecer', value: t }), ` ${t}`))),
      h('label', { class: 'ficha__campo' }, 'Observações', h('textarea', { rows: '4', name: 'ficha-observacoes' })),
      h('div', { class: 'ficha__assinatura' },
        h('label', { class: 'ficha__campo' }, 'Responsável', h('input', { type: 'text', name: 'ficha-responsavel', autocomplete: 'off' })),
        h('label', { class: 'ficha__campo' }, 'Matrícula', h('input', { type: 'text', name: 'ficha-matricula', autocomplete: 'off' })),
        h('label', { class: 'ficha__campo' }, 'Data', h('input', { type: 'date', name: 'ficha-data' })))),
  );
}
