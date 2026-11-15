// Mapa vetorial (Leaflet 1.9.4): fundo escuro próprio ou, com chave, imagem de satélite e nomes da Esri
// (plano 007, item 5; ADR-010), sempre por baixo de tudo; limites municipais discretos, detecções em laranja e seleção com contorno azul claro tracejado. A representação de
// exibição não define pertencimento: as contagens vêm do banco, calculadas com a malha integral.
import * as L from 'leaflet';
import {
  ATRIBUICAO_IMAGEM, ATRIBUICAO_NOMES, ATRIBUICAO_SEM_FUNDO, ContadorFalhas, POLITICA_REFERENCIA, URL_IMAGEM, URL_NOMES,
  type Fundo, type ParteFundo,
} from './fundo.ts';
import type { ClasseArea } from './lentes/carregar-areas.ts';
import type { RegistroLente } from './lentes/contrato.ts';
import type { Limite } from './tipos.ts';

/** Zoom máximo do mapa: abaixo do último nível dos dois serviços da Esri (imagem até 23; nomes até 22 em 512 px). */
export const MAX_ZOOM = 14;

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

/** Densidade (plano 007, T8): uma cor por classe fixa (1 · 2–3 · 4–9 · 10–24 · 25+); mesmos valores de `--densidade-*`. */
export const CORES_DENSIDADE = ['#fed7aa', '#fdba74', '#f97316', '#c2410c', '#7c2d12'] as const;

/** Célula da densidade já classificada (classe 0 a 4). */
export interface CelulaDensidadeMapa {
  retangulo: [[number, number], [number, number]];
  classe: number;
}

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
  /** Densidade por célula (T8), abaixo dos pontos; a camada só aparece com `mostrarDensidade(true)`. */
  definirDensidade(celulas: CelulaDensidadeMapa[]): void;
  mostrarDensidade(ativo: boolean): void;
  /** Camada "Detecções individuais" (pontos e anel de seleção). */
  mostrarPontos(ativo: boolean): void;
  /**
   * Mapa-base (T12): "satelite" liga imagem e nomes com a chave; "nenhum" remove as duas camadas (os tiles em voo
   * são cancelados pelo Leaflet) e nenhum pedido novo vai à Esri. `aoFalhar` é chamado uma vez por camada quando
   * os erros seguidos na mesma vista atingem o limite: com "nomes", a camada de nomes já saiu e a imagem continua;
   * com "imagem", quem chama decide trocar para "nenhum".
   */
  definirFundo(fundo: Fundo, chave: string | null, aoFalhar: (parte: ParteFundo) => void): void;
  /** Recalcula o tamanho depois de ampliar ou reduzir o mapa. */
  redimensionar(): void;
  focar(): void;
  contagem(): { pontos: number; limites: number; destaques: number; areas: number; contornos: number; densidade: number };
}

export function criarMapa(elemento: HTMLElement): Mapa {
  const mapa = L.map(elemento, {
    preferCanvas: true, minZoom: 3, maxZoom: MAX_ZOOM, zoomSnap: 0.5, attributionControl: true, zoomControl: false,
  });
  // Zoom no canto inferior direito, como na referência V13; o topo do mapa fica para as ferramentas.
  L.control.zoom({ position: 'bottomright' }).addTo(mapa);
  mapa.attributionControl.setPrefix('Leaflet 1.9.4');
  mapa.attributionControl.addAttribution(ATRIBUICAO_SEM_FUNDO);
  mapa.setView([-13, -56], 5);
  // A legenda aberta fica acima da atribuição, que é sempre visível (ADR-010; issue #71, R1-1): a altura real da
  // atribuição vai para `--altura-atribuicao` no cartão do mapa (CSSOM, permitido pela CSP).
  const cartao = elemento.closest<HTMLElement>('.mapa-cartao');
  const atribuicao = mapa.attributionControl.getContainer();
  if (cartao && atribuicao && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => cartao.style.setProperty('--altura-atribuicao', `${atribuicao.offsetHeight}px`)).observe(atribuicao);
  }

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

  // Densidade em painel próprio, abaixo dos limites, destaques e pontos, com canvas próprio e sem interação.
  mapa.createPane('densidade').style.zIndex = '340';
  const rendererDensidade = L.canvas({ pane: 'densidade' });
  const camadaDensidade = L.layerGroup();

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

  // Mapa-base no painel de tiles (abaixo de todas as camadas vetoriais), criado só quando ligado.
  // Uma contagem de falhas por camada: se só os nomes falham, a imagem continua (issue #71, BL-010).
  let fundoCamadas: L.TileLayer[] = [];
  const falhas: Record<ParteFundo, ContadorFalhas> = { imagem: new ContadorFalhas(), nomes: new ContadorFalhas() };
  let aoFalharFundo: (parte: ParteFundo) => void = () => {};
  mapa.on('moveend', () => { falhas.imagem.zerar(); falhas.nomes.zerar(); });

  function removerFundo(): void {
    // Sem `off()`: o Leaflet usa ouvintes de 'remove' na própria camada para desligar os eventos dela no mapa e a
    // atribuição; removê-los deixava a camada presa ao mapa e quebrava o redesenho dos pontos ao arrastar.
    const antigas = fundoCamadas;
    fundoCamadas = [];
    for (const c of antigas) mapa.removeLayer(c);
  }

  function criarCamadaFundo(parte: ParteFundo, url: string, chave: string, extra: L.TileLayerOptions): L.TileLayer {
    const camada = L.tileLayer(url, {
      token: chave, maxZoom: MAX_ZOOM, referrerPolicy: POLITICA_REFERENCIA, className: 'fundo-mapa-camada', ...extra,
    } as L.TileLayerOptions);
    // Eventos tardios de uma camada já removida não contam.
    camada.on('tileload', () => { if (fundoCamadas.includes(camada)) falhas[parte].carregou(); });
    camada.on('tileerror', () => {
      if (!fundoCamadas.includes(camada) || !falhas[parte].erro()) return;
      if (parte === 'nomes') {
        // Só os nomes saem; a imagem fica.
        fundoCamadas = fundoCamadas.filter((c) => c !== camada);
        mapa.removeLayer(camada);
      }
      aoFalharFundo(parte);
    });
    return camada;
  }

  return {
    definirFundo(fundo, chave, aoFalhar) {
      removerFundo();
      falhas.imagem.zerar();
      falhas.nomes.zerar();
      aoFalharFundo = aoFalhar;
      if (fundo === 'satelite' && chave) {
        mapa.attributionControl.removeAttribution(ATRIBUICAO_SEM_FUNDO);
        fundoCamadas = [
          criarCamadaFundo('imagem', URL_IMAGEM, chave, { attribution: ATRIBUICAO_IMAGEM }),
          criarCamadaFundo('nomes', URL_NOMES, chave, { attribution: ATRIBUICAO_NOMES, tileSize: 512, zoomOffset: -1 }),
        ];
        for (const c of fundoCamadas) c.addTo(mapa);
        elemento.dataset.fundo = 'satelite';
      } else {
        mapa.attributionControl.removeAttribution(ATRIBUICAO_SEM_FUNDO);
        mapa.attributionControl.addAttribution(ATRIBUICAO_SEM_FUNDO);
        elemento.dataset.fundo = 'nenhum';
      }
    },
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
      camadaDensidade.clearLayers();
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
    definirDensidade(celulas) {
      camadaDensidade.clearLayers();
      for (const c of celulas) {
        L.rectangle(c.retangulo, {
          pane: 'densidade', renderer: rendererDensidade, interactive: false, stroke: false,
          fillColor: CORES_DENSIDADE[c.classe] ?? CORES_DENSIDADE[0], fillOpacity: 0.85,
        }).addTo(camadaDensidade);
      }
    },
    mostrarDensidade(ativo) {
      if (ativo) camadaDensidade.addTo(mapa);
      else camadaDensidade.remove();
    },
    mostrarPontos(ativo) {
      for (const c of [camadaPontos, camadaSelecao]) {
        if (ativo) c.addTo(mapa);
        else c.remove();
      }
    },
    redimensionar() {
      mapa.invalidateSize({ pan: false });
    },
    focar() {
      elemento.focus({ preventScroll: true });
    },
    contagem: () => ({
      pontos: marcadores.size, limites: camadaLimites.getLayers().length, destaques: destaques.size,
      areas: camadaAreas.getLayers().length, contornos: camadaContornos.getLayers().length,
      densidade: camadaDensidade.getLayers().length,
    }),
  };
}
