// Tipos do contrato de consulta (supabase/migrations/20261107210200_consultas.sql).

export interface CargaResumo {
  id: number;
  identidade: string;
  satelite: string;
  janela_gmt: { inicio: string; fim: string };
  publicada_em: string;
}

export interface Periodo {
  inicio: string;
  fim: string;
  referencia: string;
}

export interface Intervalo {
  inicio: string;
  fim: string;
}

export interface Resumo {
  carga: CargaResumo;
  periodo: Periodo;
  municipio: number | null;
  principal: {
    fuso: string;
    intervalo: Intervalo;
    total: number;
    serie_diaria: { dia: string; total: number }[];
    por_municipio: { codigo: number; nome: string; total: number }[];
  };
  sensibilidade: {
    fuso: string;
    intervalo: Intervalo;
    completa: boolean;
    total: number | null;
    diferenca: number | null;
  };
}

export interface Registro {
  id_tecnico: string;
  id_fonte: string | null;
  fonte_chave: string;
  linha: number;
  data_hora_gmt: string;
  latitude: number;
  longitude: number;
  municipio_codigo: number;
  posicao: 'interior' | 'borda';
  municipio_inpe: number | null;
  estado_inpe: number | null;
  divergencia_inpe: 'inpe_outra_uf_na_malha' | 'inpe_outro_municipio' | null;
}

export interface PaginaDeteccoes {
  carga: CargaResumo;
  periodo: Periodo;
  municipio: number | null;
  total: number;
  limite: number;
  deslocamento: number;
  registros: Registro[];
}

export type ClasseDisponibilidade = 'lacuna_conhecida' | 'incidencia_indeterminada' | 'sem_evidencia_de_lacuna';
export type AlcanceHistorico = 'verificado' | 'parcial' | 'indisponivel';

export interface DiaDisponibilidade {
  dia: string;
  satelite: string;
  classe: ClasseDisponibilidade;
  motivos: string[];
  alcance_historico: AlcanceHistorico;
  avisos: string[];
  aviso_textual: string | null;
}

export interface Disponibilidade {
  carga: CargaResumo;
  periodo: Periodo;
  municipio: number | null;
  unidade: string;
  municipio_dias_por_classe: Record<ClasseDisponibilidade, number>;
  municipio_dias_por_alcance: Record<AlcanceHistorico, number>;
  dias: DiaDisponibilidade[] | null;
  nota: string;
}

export interface CargaDetalhe {
  id: number;
  identidade: string;
  satelite: string;
  janela_inicio: string;
  janela_fim: string;
  envelope_inicio: string | null;
  envelope_fim: string | null;
  fuso_sensibilidade: string;
  metodo: Record<string, unknown>;
  total_principal: number;
  total_envelope: number;
  total_municipios: number;
  total_disponibilidade: number;
  publicada_em: string;
}

export interface Fonte {
  chave: string;
  papel: string;
  url: string;
  sha256: string;
  bytes: number;
  obtida_em: string;
  condicoes_uso: string;
}

export interface Malha {
  uso: 'classificacao' | 'exibicao';
  fonte_chave: string;
  qualidade: string;
  parametros: Record<string, unknown>;
}

export interface MunicipioItem {
  codigo: number;
  nome: string;
}

export interface Limite {
  codigo: number;
  nome: string;
  geometria_exibicao: unknown;
}
