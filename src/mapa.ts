// Mapa vetorial (Leaflet 1.9.4), sem tiles de terceiros: fundo escuro próprio, limites municipais
// discretos, detecções em laranja e seleção com contorno azul claro tracejado. A representação de
// exibição não define pertencimento: as contagens vêm do banco, calculadas com a malha integral.
import * as L from 'leaflet';
import type { ClasseArea } from './lentes/carregar-areas.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import type { Limite } from './tipos.ts';

const COR_DETECCAO = '#f97316';
const COR_BORDA_PONTO = '#fff7ed';
const COR_LIMITE = '#6f9a88';
const COR_SELECAO = '#93c5fd';
const COR_DESTAQUE = '#fde68a';

/**
 * Áreas protegidas (plano 006, T24): cada classe tem cor, traço e hachura próprios, para que a cor nunca seja o
 * único sinal. Mesmos valores de `--area-*` em tokens.css. Nenhuma ordem ou intensidade entre as classes.
 */
export const ESTILO_AREA: Record<ClasseArea, { cor: string; traco: string | undefined; angulo: number }> = {
  protecao_integral: { cor: '#86efac', traco: undefined, angulo: 45 },
  uso_sustentavel: { cor: '#c4b5fd', traco: '8 5', angulo: -45 },
  terra_indigena: { cor: '#f9a8d4', traco: '2 5', angulo: 0 },
};
const COR_CONTORNO_REAL = '#ffffff';

/** Área da visão geral (geometria simplificada) ou contorno real, identificada por `<fonte>:<código>`. */
export interface AreaMapa {
  chave: string;
  classe: ClasseArea;
  geometria: unknown;
}

/** Destaque de lente no mapa: contorno do município (geometria de exibição) ou retângulo da célula. */
export interface DestaqueMapa {
  id: string;
  geometria?: unknown;
  retangulo?: [[number, number], [number, number]];
}

export interface Mapa {
  definirDestaques(itens: DestaqueMapa[]): void;
  selecionarDestaque(id: string | null): void;
  limparDestaques(): void;
  enquadrarDestaques(): void;
  aoSelecionarDestaque(f: (id: string) => void): void;
  /** Todos os pontos do recorte (T7), em canvas. */
  definirPontos(registros: readonly RegistroLente[]): void;
  /** Balão no ponto, com conteúdo montado por quem chama (textContent). */
  abrirBalao(latitude: number, longitude: number, conteudo: HTMLElement): void;
  fecharBalao(): void;
  definirLimites(limites: Limite[], selecionado: number | null): void;
  limparLimites(): void;
  limparTudo(): void;
  selecionarRegistro(id: string | null): boolean;
  enquadrar(): void;
  permitirArrastar(ativo: boolean): void;
  arrastoAtivo(): boolean;
  aoSelecionar(f: (id: string) => void): void;
  /** Visão geral das áreas (camada sob demanda); lista vazia remove a camada. */
  definirAreas(areas: AreaMapa[]): void;
  enquadrarAreas(): void;
  /** Contornos reais exibidos (abertura de célula ou área selecionada); lista vazia remove. */
  definirContornos(itens: AreaMapa[]): void;
  enquadrarContornos(): void;
  aoSelecionarArea(f: (chave: string) => void): void;
  contagem(): { pontos: number; limites: number; destaques: number; areas: number; contornos: number };
}

export function criarMapa(elemento: HTMLElement): Mapa {
  const mapa = L.map(elemento, {
    preferCanvas: true, minZoom: 3, maxZoom: 14, zoomSnap: 0.5, attributionControl: true, zoomControl: false,
  });
  // Zoom no canto inferior direito, como na referência V13; o topo do mapa fica para as ferramentas.
  L.control.zoom({ position: 'bottomright' }).addTo(mapa);
  mapa.attributionControl.setPrefix(false);
  mapa.attributionControl.addAttribution('Leaflet 1.9.4 · sem mapa-base de terceiros');
  mapa.setView([-13, -56], 5);

  // Áreas protegidas em painel próprio, abaixo dos destaques e dos pontos, desenhadas em SVG para permitir a
  // hachura por padrão (o canvas não a tem). Os contornos reais ficam no mesmo painel, por cima da visão geral.
  mapa.createPane('areas').style.zIndex = '350';
  const rendererAreas = L.svg({ pane: 'areas' });
  const camadaAreas = L.layerGroup().addTo(mapa);
  const camadaContornos = L.layerGroup().addTo(mapa);
  let aoSelecionarAreaF: (chave: string) => void = () => {};

  /** Padrões de hachura no SVG do painel, criados uma vez, depois que o renderizador existe. */
  function garantirHachuras(): void {
    const svg = mapa.getPane('areas')?.querySelector('svg');
    if (!svg || svg.querySelector('defs[data-hachuras]')) return;
    const ns = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(ns, 'defs');
    defs.setAttribute('data-hachuras', '');
    for (const [classe, e] of Object.entries(ESTILO_AREA)) {
      const padrao = document.createElementNS(ns, 'pattern');
      padrao.setAttribute('id', `hachura-${classe}`);
      padrao.setAttribute('patternUnits', 'userSpaceOnUse');
      padrao.setAttribute('width', '8');
      padrao.setAttribute('height', '8');
      padrao.setAttribute('patternTransform', `rotate(${e.angulo})`);
      const linha = document.createElementNS(ns, 'line');
      for (const [k, v] of [['x1', '0'], ['y1', '0'], ['x2', '0'], ['y2', '8'], ['stroke', e.cor], ['stroke-width', '2'], ['stroke-opacity', '0.55']]) linha.setAttribute(k as string, v as string);
      padrao.append(linha);
      defs.append(padrao);
    }
    svg.prepend(defs);
  }

  const camadaLimites = L.layerGroup().addTo(mapa);
  // Destaques da lente: camada própria, separada dos pontos da página de registros. A limpeza da
  // consulta comum (limparTudo) não a toca; o controlador limpa a lente explicitamente.
  const camadaDestaques = L.layerGroup().addTo(mapa);
  const destaques = new Map<string, L.Rectangle | L.GeoJSON>();
  let destaqueSelecionado: string | null = null;
  let aoSelecionarDestaqueF: (id: string) => void = () => {};
  const camadaPontos = L.layerGroup().addTo(mapa);
  const camadaSelecao = L.layerGroup().addTo(mapa);
  const marcadores = new Map<string, L.CircleMarker>();
  let selecionadoId: string | null = null;
  let aoSelecionarF: (id: string) => void = () => {};
  let limitesBounds: L.LatLngBounds | null = null;
  let pontosBounds: L.LatLngBounds | null = null;

  const estiloPonto = (selecionado: boolean): L.CircleMarkerOptions => selecionado
    ? { radius: 10, color: COR_SELECAO, weight: 4, fillColor: COR_DETECCAO, fillOpacity: 1 }
    : { radius: 4, color: COR_BORDA_PONTO, weight: 0.8, fillColor: COR_DETECCAO, fillOpacity: 0.9 };

  function aplicarSelecao(id: string | null): boolean {
    camadaSelecao.clearLayers();
    if (selecionadoId !== null) marcadores.get(selecionadoId)?.setStyle(estiloPonto(false));
    selecionadoId = null;
    if (id === null) return false;
    const m = marcadores.get(id);
    if (!m) return false;
    selecionadoId = id;
    m.setStyle(estiloPonto(true));
    m.bringToFront();
    // Anel tracejado: o indicador de seleção não depende só da cor.
    L.circleMarker(m.getLatLng(), { radius: 16, color: COR_SELECAO, weight: 3, dashArray: '4 4', fill: false, interactive: false })
      .addTo(camadaSelecao);
    mapa.panTo(m.getLatLng());
    return true;
  }

  // Destaque comum: contorno contínuo; selecionado: tracejado azul claro mais grosso (não só cor).
  const estiloDestaque = (selecionado: boolean): L.PathOptions => selecionado
    ? { color: COR_SELECAO, weight: 4, dashArray: '8 5', fillColor: COR_SELECAO, fillOpacity: 0.2 }
    : { color: COR_DESTAQUE, weight: 2, fillColor: COR_DESTAQUE, fillOpacity: 0.08 };

  return {
    definirDestaques(itens) {
      camadaDestaques.clearLayers();
      destaques.clear();
      destaqueSelecionado = null;
      for (const item of itens) {
        let camada: L.Rectangle | L.GeoJSON | null = null;
        if (item.retangulo) camada = L.rectangle(item.retangulo, estiloDestaque(false));
        else if (item.geometria) camada = L.geoJSON(item.geometria as never, { style: estiloDestaque(false) });
        if (!camada) continue;
        camada.on('click', () => aoSelecionarDestaqueF(item.id));
        camada.addTo(camadaDestaques);
        destaques.set(item.id, camada);
      }
    },
    selecionarDestaque(id) {
      if (destaqueSelecionado !== null) destaques.get(destaqueSelecionado)?.setStyle(estiloDestaque(false));
      destaqueSelecionado = null;
      const c = id === null ? undefined : destaques.get(id);
      if (!c || id === null) return;
      destaqueSelecionado = id;
      c.setStyle(estiloDestaque(true));
      c.bringToFront();
      const b = c.getBounds();
      if (b.isValid()) mapa.fitBounds(b, { padding: [24, 24], maxZoom: 11, animate: false });
    },
    limparDestaques() {
      camadaDestaques.clearLayers();
      destaques.clear();
      destaqueSelecionado = null;
    },
    enquadrarDestaques() {
      mapa.invalidateSize();
      let alvo: L.LatLngBounds | null = null;
      for (const c of destaques.values()) {
        const b = c.getBounds();
        if (b.isValid()) alvo = alvo ? alvo.extend(b) : b;
      }
      if (alvo?.isValid()) mapa.fitBounds(alvo, { padding: [24, 24], maxZoom: 11, animate: false });
    },
    aoSelecionarDestaque(f) {
      aoSelecionarDestaqueF = f;
    },
    definirPontos(registros) {
      camadaPontos.clearLayers();
      camadaSelecao.clearLayers();
      marcadores.clear();
      selecionadoId = null;
      const pontos: L.LatLngTuple[] = [];
      mapa.closePopup();
      for (const r of registros) {
        const m = L.circleMarker([r.latitude, r.longitude], estiloPonto(false));
        m.on('click', () => aoSelecionarF(r.id_tecnico));
        m.addTo(camadaPontos);
        marcadores.set(r.id_tecnico, m);
        pontos.push([r.latitude, r.longitude]);
      }
      pontosBounds = pontos.length ? L.latLngBounds(pontos) : null;
    },
    abrirBalao(latitude, longitude, conteudo) {
      L.popup({ maxWidth: 320, autoPanPadding: [24, 24] }).setLatLng([latitude, longitude]).setContent(conteudo).openOn(mapa);
    },
    fecharBalao() {
      mapa.closePopup();
    },
    definirLimites(limites, selecionado) {
      camadaLimites.clearLayers();
      limitesBounds = null;
      for (const l of limites) {
        const escolhido = l.codigo === selecionado;
        const camada = L.geoJSON(l.geometria_exibicao as never, {
          style: escolhido
            ? { color: COR_SELECAO, weight: 3, dashArray: '8 5', fillColor: COR_SELECAO, fillOpacity: 0.12 }
            : { color: COR_LIMITE, weight: 1, fillOpacity: 0 },
          interactive: false,
        }).addTo(camadaLimites);
        const b = camada.getBounds();
        if (b.isValid() && (selecionado === null || escolhido)) limitesBounds = limitesBounds ? limitesBounds.extend(b) : b;
      }
    },
    limparLimites() {
      camadaLimites.clearLayers();
      limitesBounds = null;
    },
    limparTudo() {
      mapa.closePopup();
      camadaLimites.clearLayers();
      camadaPontos.clearLayers();
      camadaSelecao.clearLayers();
      marcadores.clear();
      selecionadoId = null;
      limitesBounds = null;
      pontosBounds = null;
      mapa.setView([-13, -56], 5);
    },
    selecionarRegistro: aplicarSelecao,
    enquadrar() {
      mapa.invalidateSize();
      const alvo = limitesBounds && pontosBounds ? limitesBounds.extend(pontosBounds) : (limitesBounds ?? pontosBounds);
      if (alvo?.isValid()) mapa.fitBounds(alvo, { padding: [24, 24], maxZoom: 11, animate: false });
    },
    permitirArrastar(ativo) {
      if (ativo) mapa.dragging.enable();
      else mapa.dragging.disable();
    },
    arrastoAtivo: () => mapa.dragging.enabled(),
    aoSelecionar(f) {
      aoSelecionarF = f;
    },
    definirAreas(areas) {
      camadaAreas.clearLayers();
      for (const a of areas) {
        const e = ESTILO_AREA[a.classe];
        const camada = L.geoJSON(a.geometria as never, {
          pane: 'areas',
          style: { renderer: rendererAreas, color: e.cor, weight: 2, dashArray: e.traco, fillColor: `url(#hachura-${a.classe})`, fillOpacity: 1 },
        });
        camada.on('click', () => aoSelecionarAreaF(a.chave));
        camada.addTo(camadaAreas);
        // Identifica cada polígono desenhado pela chave da área (alternativa programática e teste).
        camada.eachLayer((l) => (l as L.Path).getElement?.()?.setAttribute('data-chave', a.chave));
      }
      garantirHachuras();
    },
    enquadrarAreas() {
      mapa.invalidateSize();
      let alvo: L.LatLngBounds | null = null;
      for (const c of camadaAreas.getLayers() as L.GeoJSON[]) {
        const b = c.getBounds();
        if (b.isValid()) alvo = alvo ? alvo.extend(b) : b;
      }
      if (alvo?.isValid()) mapa.fitBounds(alvo, { padding: [24, 24], maxZoom: 11, animate: false });
    },
    definirContornos(itens) {
      camadaContornos.clearLayers();
      for (const a of itens) {
        // Contorno real: traço branco sobre o traço da classe, sem preenchimento, e não interativo.
        L.geoJSON(a.geometria as never, {
          pane: 'areas', interactive: false,
          style: { renderer: rendererAreas, color: COR_CONTORNO_REAL, weight: 3, dashArray: ESTILO_AREA[a.classe].traco, fill: false },
        }).addTo(camadaContornos);
      }
    },
    enquadrarContornos() {
      mapa.invalidateSize();
      let alvo: L.LatLngBounds | null = null;
      for (const c of camadaContornos.getLayers() as L.GeoJSON[]) {
        const b = c.getBounds();
        if (b.isValid()) alvo = alvo ? alvo.extend(b) : b;
      }
      if (alvo?.isValid()) mapa.fitBounds(alvo, { padding: [24, 24], maxZoom: 13, animate: false });
    },
    aoSelecionarArea(f) {
      aoSelecionarAreaF = f;
    },
    contagem: () => ({
      pontos: marcadores.size, limites: camadaLimites.getLayers().length, destaques: destaques.size,
      areas: camadaAreas.getLayers().length, contornos: camadaContornos.getLayers().length,
    }),
  };
}
