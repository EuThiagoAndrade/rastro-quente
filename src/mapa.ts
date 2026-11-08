// Mapa vetorial (Leaflet 1.9.4), sem tiles de terceiros: fundo escuro próprio, limites municipais
// discretos, detecções em laranja e seleção com contorno azul claro tracejado. A representação de
// exibição não define pertencimento: as contagens vêm do banco, calculadas com a malha integral.
import * as L from 'leaflet';
import type { Limite, Registro } from './tipos.ts';

const COR_DETECCAO = '#f97316';
const COR_BORDA_PONTO = '#fff7ed';
const COR_LIMITE = '#6f9a88';
const COR_SELECAO = '#93c5fd';

export interface Mapa {
  definirPontos(registros: Registro[]): void;
  definirLimites(limites: Limite[], selecionado: number | null): void;
  limparLimites(): void;
  limparTudo(): void;
  selecionarRegistro(id: string | null): boolean;
  enquadrar(): void;
  permitirArrastar(ativo: boolean): void;
  arrastoAtivo(): boolean;
  aoSelecionar(f: (id: string) => void): void;
  contagem(): { pontos: number; limites: number };
}

export function criarMapa(elemento: HTMLElement): Mapa {
  const mapa = L.map(elemento, {
    preferCanvas: true, minZoom: 3, maxZoom: 14, zoomSnap: 0.5, attributionControl: true,
  });
  mapa.attributionControl.setPrefix(false);
  mapa.attributionControl.addAttribution('Leaflet 1.9.4 · sem mapa-base de terceiros');
  mapa.setView([-13, -56], 5);

  const camadaLimites = L.layerGroup().addTo(mapa);
  const camadaPontos = L.layerGroup().addTo(mapa);
  const camadaSelecao = L.layerGroup().addTo(mapa);
  const marcadores = new Map<string, L.CircleMarker>();
  let selecionadoId: string | null = null;
  let aoSelecionarF: (id: string) => void = () => {};
  let limitesBounds: L.LatLngBounds | null = null;
  let pontosBounds: L.LatLngBounds | null = null;

  const estiloPonto = (selecionado: boolean): L.CircleMarkerOptions => selecionado
    ? { radius: 10, color: COR_SELECAO, weight: 4, fillColor: COR_DETECCAO, fillOpacity: 1 }
    : { radius: 5, color: COR_BORDA_PONTO, weight: 1, fillColor: COR_DETECCAO, fillOpacity: 0.9 };

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

  return {
    definirPontos(registros) {
      camadaPontos.clearLayers();
      camadaSelecao.clearLayers();
      marcadores.clear();
      selecionadoId = null;
      const pontos: L.LatLngTuple[] = [];
      for (const r of registros) {
        const m = L.circleMarker([r.latitude, r.longitude], estiloPonto(false));
        m.on('click', () => aoSelecionarF(r.id_tecnico));
        m.addTo(camadaPontos);
        marcadores.set(r.id_tecnico, m);
        pontos.push([r.latitude, r.longitude]);
      }
      pontosBounds = pontos.length ? L.latLngBounds(pontos) : null;
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
    contagem: () => ({ pontos: marcadores.size, limites: camadaLimites.getLayers().length }),
  };
}
