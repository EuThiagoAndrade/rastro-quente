// Mapa-base de terceiros (plano 007, item 5, T12; ADR-010): imagem de satélite e nomes da Esri, ou "Sem fundo".
// Só regras puras aqui (chave, modelos de URL, atribuição e contagem de falhas); as camadas Leaflet ficam em mapa.ts.
// A chave é pública (vai no bundle) e restrita ao domínio pela Esri; nunca é versionada.

export type Fundo = 'satelite' | 'nenhum';

/** Os dois únicos hosts de tiles liberados em `img-src` da CSP (vercel.json). */
export const HOST_IMAGEM = 'ibasemaps-api.arcgis.com';
export const HOST_NOMES = 'static-map-tiles-api.arcgis.com';

/** World Imagery (serviço de camadas de mapa-base), tiles de 256 px, ordem z/y/x, `token` na consulta. */
export const URL_IMAGEM = `https://${HOST_IMAGEM}/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token={token}`;
/** Nomes sobre imagem (serviço de tiles estáticos), tiles de 512 px: no Leaflet, `tileSize: 512` e `zoomOffset: -1`. */
export const URL_NOMES = `https://${HOST_NOMES}/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/imagery/labels/static/tile/{z}/{y}/{x}?token={token}`;

/** Política de referência só nas imagens de tile: envia só a origem (a política global continua `no-referrer`). */
export const POLITICA_REFERENCIA = 'strict-origin-when-cross-origin';

/** Atribuição exigida pela Esri, conferida em 2026-11-15 (metadados públicos do World Imagery e página da camada de nomes). */
export const ATRIBUICAO_IMAGEM = 'Powered by Esri · Imagem: Esri, Vantor, Earthstar Geographics e GIS User Community';
export const ATRIBUICAO_NOMES = 'Nomes: Esri, TomTom, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors e GIS User Community';
export const ATRIBUICAO_SEM_FUNDO = 'sem mapa-base de terceiros';

export const AVISO_SEM_CHAVE = 'Satélite indisponível: mapa-base não configurado neste ambiente.';
export const AVISO_FALHA = 'Fundo de satélite indisponível agora.';
export const AVISO_FALHA_NOMES = 'Nomes sobre o satélite indisponíveis agora; a imagem continua.';

/** Camada do fundo de satélite: a imagem ou os nomes por cima dela. */
export type ParteFundo = 'imagem' | 'nomes';

/** Erros de tile seguidos, na mesma vista, que trocam o fundo para "Sem fundo" (chave rejeitada, cota, rede). */
export const LIMITE_ERROS_SEGUIDOS = 4;

/** Chave pública do build (`VITE_ESRI_CHAVE`); vazia ou só espaços = sem chave. */
export function lerChaveEsri(env: { VITE_ESRI_CHAVE?: string | undefined }): string | null {
  const chave = (env.VITE_ESRI_CHAVE ?? '').trim();
  return chave ? chave : null;
}

/** Fundo inicial: satélite só com chave (como na V13); sem chave, "Sem fundo". */
export function fundoInicial(chave: string | null): Fundo {
  return chave ? 'satelite' : 'nenhum';
}

/**
 * Contagem de erros seguidos na mesma vista: um tile carregado zera; mudar de vista zera; ao atingir o limite, a
 * contagem avisa uma única vez (até ser zerada).
 */
export class ContadorFalhas {
  private seguidos = 0;
  private avisado = false;

  private readonly limite: number;

  constructor(limite = LIMITE_ERROS_SEGUIDOS) {
    this.limite = limite;
  }

  /** Registra um erro; devolve `true` só no erro que atinge o limite. */
  erro(): boolean {
    this.seguidos += 1;
    if (this.seguidos >= this.limite && !this.avisado) {
      this.avisado = true;
      return true;
    }
    return false;
  }

  carregou(): void {
    this.seguidos = 0;
  }

  /** Nova vista (fim de movimento ou zoom) ou fundo religado. */
  zerar(): void {
    this.seguidos = 0;
    this.avisado = false;
  }
}
