// Controlador: sessão, versão fixada, consulta, leitura completa do recorte, mapa, lentes e estados. Gerações
// descartam respostas obsoletas: a da sessão (login, logout, expiração, negação), a da consulta (a última vence) e a
// da lente. Nenhum dado de consulta é gravado em armazenamento; a memória de recortes (T6) vive só em variáveis
// desta página e sai junto com a sessão, o acesso ou a versão.
import {
  $, mostrarErroFiltro, renderAcesso, renderContagemMapa,
  renderEstadoConsulta, renderFiltros, renderProveniencia, renderRecorte,
  renderConcentracaoDisponivel, renderLegendaDensidade, renderSelecao, renderSerie, renderTopo, limparResultados, type Acesso, type EstadoConsulta, type EstadoPontos,
} from './apresentacao.ts';
import {
  evidenciaMensal, limparCorpoLente, renderEstadoLente, renderResultadoLente, TITULO_LENTE, type EstadoLente, type ManipuladoresLente,
} from './apresentacao-lentes.ts';
import {
  CELULAS_POR_PAGINA, paginaValida, renderResultadoCombinacao, type ManipuladoresCombinacao,
} from './apresentacao-combinacao.ts';
import {
  atualizarContornoArea, atualizarContornosPainel, renderAreaSelecionada, renderEstadoAreas, renderLegendaAreas,
  renderResultadoSobreposicao, type AreaExibida, type EstadoContorno, type ManipuladoresSobreposicao,
} from './apresentacao-areas.ts';
import {
  abaAberta, abrirAba, balaoRegistros, explicacaoAberta, ligarAbas, marcarFoco, renderListaFocos, renderMunicipios,
} from './apresentacao-resultado.ts';
import {
  ITENS_POR_PAGINA, mostrarAbaComparacao, renderComparacaoMunicipios, renderComparacaoPeriodos, renderEstadoComparacao,
  nomeUnidade, renderLadoNoMapa, textoJanela, type ContextoComparacao, type EstadoComparacao, type EstadoLista, type Modo,
} from './apresentacao-comparacao.ts';
import {
  chaveUnidade, compararMunicipios, compararPeriodos, conferirZero, duracaoDias, contextoCombinacao, contextoConcentracao, disponibilidadePorMunicipio,
  ErroComparacao, leiturasDeDisponibilidade, unidadesDe, validarMunicipios, validarPeriodos,
  type ComparacaoMunicipal, type ComparacaoTemporal, type ConferenciaZero, type Lado, type ResultadoComparavel,
  type ValidacaoPeriodos,
} from './comparacao.ts';
import {
  PERGUNTAS, IDS_PERGUNTAS, chaveContexto, escolherRecorte, destinoDoPedido, montarPedido, perguntar, type ConfigLente as ConfigLenteIa, type ContextoTela, type Desfecho,
  type Escolha, type Evento as EventoIa, type Ferramenta, type Pergunta,
} from './agentes.ts';
import { renderDisponibilidade as renderDisponibilidadePerguntas, renderPerguntas, type EstadoPerguntas } from './apresentacao-agentes.ts';
import { lerConfiguracao } from './config.ts';
import { AVISO_FALHA, AVISO_FALHA_NOMES, AVISO_SEM_CHAVE, fundoInicial, lerChaveEsri, type Fundo } from './fundo.ts';
import { chaveArea, diagnosticarAusencia, lerAreas, type AreaLida, type ClasseArea } from './lentes/carregar-areas.ts';
import {
  CLASSES_AREA, municipiosDaSobreposicao, qualificarSobreposicao, ROTULO_CLASSE as ROTULO_AREA, sobreposicao,
  type AreaSobreposicao, type DestaqueSobreposicao, type ResultadoSobreposicao,
} from './lentes/sobreposicao.ts';
import { estadoQualificacao, municipiosNecessarios, qualificar } from './lentes/comum.ts';
import {
  combinar, LENTES_CANONICAS, municipiosDaCombinacao, qualificarCombinacao, validarEscolha,
  type Operador, type ResultadoCombinacao,
} from './lentes/combinacao.ts';
import { concentracao } from './lentes/concentracao.ts';
import { persistencia } from './lentes/persistencia.ts';
import { recorrencia } from './lentes/recorrencia.ts';
import {
  CONCORRENCIA_DISPONIBILIDADE, destinoErro, emParalelo, lerPaginas, lerRegistros, validarDisponibilidade, validarResumo,
  type FontesLente, type OrigemChamada, type PedidoLente,
} from './lentes/carregar.ts';
import {
  ErroLente, recorteDe, type DisponibilidadeMunicipio, type EntradaLente, type RegistroLente, type ResultadoLente, type TipoLente,
  type Unidade,
} from './lentes/contrato.ts';
import { chaveRecorte, MemoriaRecortes, type LeituraRecorte } from './memoria.ts';
import { celulasDistintas, numerosMunicipio, type DestaquesAtivos, type OrdemMunicipios } from './municipios.ts';
import {
  consultarDeteccoes, consultarDisponibilidade, consultarResumo, fontesAreas, lerCargaVigente, lerContornoReal, lerLimites,
  lerMunicipios, lerProveniencia, sondarAcesso, type Filtro,
} from './consulta.ts';
import { ErroConsulta, type TipoErro } from './erros.ts';
import { primeiroDiaGmt, ultimoDiaGmt } from './formato.ts';
import { periodoDoAtalho, validarPeriodo, type Atalho, type Janela } from './recorte.ts';
import type { LeituraAreas } from './lentes/carregar-areas.ts';
import { fecharDialogos, iniciarTema, ligarDialogo } from './topo.ts';
import { criarMapa, type AreaMapa, type DestaqueMapa, type Mapa } from './mapa.ts';
import { densidadePorCelula } from './densidade.ts';
import { criarSessao, type EventoSessao, type Sessao } from './sessao.ts';
import {
  interpretarLocal, pedirInterpretacao, TEMPO_LIMITE_IA_MS, validarInterpretacao, type Interpretacao,
} from './pergunte.ts';
import {
  estadoPergunte, itensEntendi, limparPergunte, marcarIa, marcarSerie, renderAvisoPergunta, renderEntendi, renderMarcas, renderQuadro,
  renderTocando, renderVelocidade, type Alvo, type ManipuladoresEntendi,
} from './apresentacao-pergunte.ts';
import { diasSemCobertura, montarReproducao, PASSO_MS, type Reproducao, type Velocidade } from './replay.ts';
import { renderFicha, resumirFicha, roteiroAveriguacao, sinteseDeterministica, type AreasFicha } from './ficha.ts';
import { resumoPeriodo } from './recorte.ts';
import type { ClasseDisponibilidade } from './tipos.ts';
import type { CargaDetalhe, Disponibilidade, Fonte, Limite, Malha, MunicipioItem, Registro, Resumo } from './tipos.ts';

interface Dados {
  carga: CargaDetalhe;
  municipios: MunicipioItem[];
  nomes: Map<number, string>;
  janela: { inicio: string; fim: string };
  fontes: Fonte[];
  malhas: Malha[];
}

interface Resultado {
  filtro: Filtro;
  resumo: Resumo;
  disponibilidade: Disponibilidade;
}

/** Leitura completa do recorte aplicado (T7): registros conferidos, em leitura ou com erro. */
type Pontos = Registro[] | 'carregando' | 'erro';

/** Lente aplicada: pedido (carga e janela), resultado e disponibilidade lida para qualificá-lo. */
interface LenteAplicada {
  pedido: PedidoLente;
  resultado: ResultadoLente;
  selecionado: string | null;
  /** Página da tabela de evidência do destaque de célula selecionado. */
  paginaEvidencia: number;
  /** Registros da aplicação por id_tecnico, para a tabela de evidência. */
  porId: Map<string, RegistroLente>;
}

/** Configuração da combinação, lida do formulário a cada mudança (T16). */
interface ConfigCombinacao {
  lentes: TipoLente[];
  operador: Operador;
}

/** Combinação aplicada (plano 005): pedido, resultado qualificado e navegação na lista e no painel. */
interface CombinacaoAplicada {
  pedido: PedidoLente;
  resultado: ResultadoCombinacao;
  selecionado: string | null;
  /** Página da lista de células (50 por página). */
  pagina: number;
  /** Página da tabela de evidência em união da célula selecionada. */
  paginaEvidencia: number;
  porId: Map<string, RegistroLente>;
}

/** Sobreposição aplicada (plano 006, T24): pedido, resultado qualificado, navegação e contornos da célula aberta. */
interface SobreposicaoAplicada {
  pedido: PedidoLente;
  resultado: ResultadoSobreposicao;
  selecionado: string | null;
  pagina: number;
  paginaEvidencia: number;
  porId: Map<string, RegistroLente>;
  contornos: EstadoContorno;
}

/** Visão geral da camada de áreas, lida uma vez por carga e sessão (T24, T25). */
interface CamadaAreas {
  carga: number;
  areas: AreaLida[];
}

/** Um lado da comparação (plano 008, item 1): recorte, resumo, leitura conferida, resultado bruto e disponibilidade. */
interface LadoAplicado {
  lado: Lado;
  filtro: Filtro;
  pedido: PedidoLente;
  resumo: Resumo;
  leitura: LeituraRecorte;
  /** Resultado da lente sem qualificação; `null` sem lente (só contagens). */
  bruto: ResultadoComparavel | null;
  /** Municípios do recorte deste lado: todos no estado, um no município. */
  recorte: number[];
  disp: Map<number, DisponibilidadeMunicipio>;
}

/** Lente escolhida, aplicada igual nos dois lados. */
interface LenteComparacao {
  nome: string;
  calcular(e: EntradaLente, camada: LeituraAreas | null): ResultadoComparavel;
  sobreposicao: boolean;
  combinacao: ConfigCombinacao | null;
}

/** Comparação aplicada: os dois lados e o estado da aba (mapa, página, unidades abertas, lista e contexto). */
interface ComparacaoAplicada {
  modo: Exclude<Modo, 'nenhuma'>;
  lados: [LadoAplicado, LadoAplicado];
  validacao: ValidacaoPeriodos | null;
  lente: LenteComparacao | null;
  mapa: Lado;
  pagina: number;
  abertas: Set<string>;
  lista: EstadoLista;
  contexto: ContextoComparacao['contexto'];
  resultado: ComparacaoTemporal | ComparacaoMunicipal | null;
}

/** Intervalo mínimo entre redesenhos da lista enquanto a disponibilidade chega (CPU lenta no celular, T14). */
const INTERVALO_QUALIFICACAO_MS = 750;

/** Devolve verdadeiro no máximo uma vez por intervalo; o redesenho final, depois do laço, mostra o estado completo. */
function limitador(intervaloMs: number): () => boolean {
  let ultimo = performance.now();
  return () => {
    const agora = performance.now();
    if (agora - ultimo < intervaloMs) return false;
    ultimo = agora;
    return true;
  };
}

/** Lentes disponíveis no seletor; cada uma é função pura da mesma entrada. */
const LENTES = { concentracao, recorrencia, persistencia } as const;

const marcado = (id: string): boolean => $<HTMLInputElement>(id).checked;
/** Modo de comparação marcado nos filtros (plano 008, item 1). */
const modoComparacao = (): Modo => (document.querySelector<HTMLInputElement>('input[name="c-modo"]:checked')?.value ?? 'nenhuma') as Modo;
const retangulo = (u: { sul: string; oeste: string; norte: string; leste: string }): [[number, number], [number, number]] =>
  [[Number(u.sul), Number(u.oeste)], [Number(u.norte), Number(u.leste)]];
const mapaAmpliado = (): boolean => document.body.classList.contains('mapa-ampliado');
/** `data-estado-limites` em `#conteudo` (M5, T14): `desligado`, `carregando`, `completo` ou `erro`. */
const estadoLimites = (e: 'desligado' | 'carregando' | 'completo' | 'erro'): void => { $('conteudo').dataset['estadoLimites'] = e; };

/** Lente marcada nos rádios das seções de lente (Seleção, Contexto territorial, Cruzar critérios). */
const lenteEscolhida = (): string => document.querySelector<HTMLInputElement>('input[name="l-lente"]:checked')?.value ?? 'nenhuma';

/** Título da aba Lentes pela opção marcada (ciclo 009, BL-017), também antes de haver resultado. */
const TITULO_OPCAO: Record<string, string> = {
  concentracao: 'Concentração', recorrencia: 'Recorrência', persistencia: 'Persistência',
  sobreposicao: 'Sobreposição com áreas protegidas', combinacao: 'Combinação de lentes',
};

const marcarNenhuma = (): void => {
  const e = document.querySelector<HTMLInputElement>('input[name="l-lente"][value="nenhuma"]');
  if (e) e.checked = true;
};

/** Configuração inicial das lentes, como na V13 (decisão do responsável na issue #61). */
function configuracaoPadrao(): void {
  const marcar = (seletor: string, valor: boolean) => {
    const e = document.querySelector<HTMLInputElement>(seletor);
    if (e) e.checked = valor;
  };
  marcar('input[name="l-lente"][value="nenhuma"]', true);
  marcar('input[name="l-classe"][value="protecao_integral"]', true);
  for (const l of LENTES_CANONICAS) marcar(`input[name="l-comb"][value="${l}"]`, l !== 'persistencia');
  marcar('input[name="l-operador"][value="e"]', true);
}

export function iniciar(): void {
  iniciarTema();
  ligarDialogo('botao-sobre', 'dialogo-sobre');
  ligarDialogo('botao-como-ler', 'dialogo-como-ler');
  // Tela estreita (T17): seções fechadas, inclusive a Consulta, que mostra o recorte aplicado no título.
  if (window.matchMedia('(max-width: 760px)').matches) $<HTMLDetailsElement>('secao-consulta').open = false;
  const config = lerConfiguracao(import.meta.env);
  const manipulador = { google() {}, senha() {}, tentarNovamente() {}, senhaLocal: false };
  if (!config) {
    renderAcesso({ tipo: 'config_ausente' }, manipulador);
    $('botao-sair').hidden = true;
    return;
  }
  new Controlador(config.senhaLocal, criarSessao(config)).iniciar();
}

class Controlador {
  private dados: Dados | null = null;
  private resultado: Resultado | null = null;
  /** Recorte aplicado (T16): a última combinação válida de período e município; a única que a tela usa. */
  private aplicado: Filtro | null = null;
  private pontos: Pontos = 'carregando';
  private selecionado: string | null = null;
  private paginaFocos = 0;
  private ordemMunicipios: OrdemMunicipios = 'deteccoes';
  private detalheMunicipio: { codigo: number; mapa: 'ocioso' | 'carregando' | 'exibido' | 'ausente' | 'falha' } | null = null;
  private rolagemMunicipios = 0;
  private mapa: Mapa | null = null;
  /** Mapa-base (T12): chave pública do build e fundo escolhido; sem chave, só "Sem fundo". */
  private readonly chaveEsri = lerChaveEsri(import.meta.env);
  private fundo: Fundo = fundoInicial(this.chaveEsri);
  private limites = new Map<number, Limite>();
  /** Camada "Limites municipais" (T10): ligada por padrão; desligada, só o contorno do município escolhido fica. */
  private todosOsLimites = true;
  /** Soma das contagens da densidade do recorte aplicado (T19); `null` antes da leitura completa. */
  private totalDensidade: number | null = null;
  private geracaoSessao = 0;
  private geracaoConsulta = 0;
  // Terceira geração (plano 004, R1-4): cada cálculo de lente, nova janela, troca de versão ou mudança de sessão a
  // incrementa; respostas de um cálculo antigo são descartadas.
  private geracaoLente = 0;
  private lente: LenteAplicada | null = null;
  private combinacao: CombinacaoAplicada | null = null;
  // Configuração da combinação em cálculo ou exibida; base do "tentar de novo".
  private configCombinacao: ConfigCombinacao | null = null;
  private pedidoLente: PedidoLente | null = null;
  // Sobreposição (plano 006): resultado exibido e classe em cálculo ou exibida (base do "tentar de novo").
  private sobreposicao: SobreposicaoAplicada | null = null;
  private classeSobreposicao: ClasseArea | null = null;
  // Camada de áreas: visão geral em memória, geração própria (mostrar/ocultar) e área selecionada.
  private camadaAreas: CamadaAreas | null = null;
  private geracaoAreas = 0;
  private areaSelecionada: AreaExibida | null = null;
  // Contornos reais por `carga|chave`, em voo ou lidos; limpos como os limites municipais (ADR-007).
  private contornos = new Map<string, Promise<unknown>>();
  /** Memória de recortes (T6): até 3 leituras completas, só nesta página. */
  private memoria = new MemoriaRecortes();
  /** Leituras completas em curso por chave (T7: cada recorte é lido uma vez; a lente espera a da consulta). */
  private leiturasEmVoo = new Map<string, Promise<LeituraRecorte | null>>();
  /** A concentração saiu da combinação ao escolher um município (T16): explica a combinação incompleta. */
  private concentracaoRetirada = false;
  /** A janela mudou com uma lente escolhida: recalcular depois da leitura da consulta (sobrevive a consultas seguidas). */
  private lentePendente = false;
  /** Posição da rolagem da coluna de resultado antes de abrir uma explicação (voltar ao mesmo ponto). */
  private rolagemLista = 0;
  // Comparação (plano 008, item 1): geração própria; resultado e leituras dos dois lados só nesta página.
  private geracaoComparacao = 0;
  private comparacao: ComparacaoAplicada | null = null;
  /** O mapa mostra o lado B da comparação (os pontos e destaques do recorte aplicado saíram dele). */
  private mapaComB = false;
  private usuarioAutorizado = false;
  private motivoPendente: 'saiu' | 'expirada' | undefined;
  private erroCallback: string | undefined;
  // Perguntas (plano 008, item 4): uma execução por aba, geração própria e o contexto da pergunta em curso ou da
  // resposta exibida. Mudou o contexto (seleção, filtro, lente, comparação, carga ou sessão), ela é cancelada e sai.
  private geracaoPergunta = 0;
  private perguntaEmCurso: AbortController | null = null;
  private chavePergunta: string | null = null;
  private ultimaPergunta: { tipo: Pergunta } | null = null;
  private destinoPergunta: { chave: string; aba: 'destaques' | 'comparacao' | 'municipios'; destaque: boolean } | null = null;
  private estadoPerguntas: EstadoPerguntas = { tipo: 'ociosa' };
  // Pergunte ao mapa (ciclo 012): geração própria, última pergunta interpretada e IA desligada (503) nesta sessão.
  private geracaoPergunte = 0;
  private perguntaMapa: { texto: string; interpretacao: Interpretacao; origem: 'ia' | 'local'; linhas: string[] } | null = null;
  private iaInterpretacaoDesligada = false;
  /** A pergunta pediu animação: abre a reprodução quando os pontos do novo recorte chegarem. */
  private animarAoCarregar = false;
  // Mapa vivo (ciclo 012): quadros do recorte aplicado, dia exibido, relógio e velocidade.
  private reproducao: {
    rep: Reproducao; i: number; tocando: boolean; relogio: number | undefined;
    sem: Map<string, Exclude<ClasseDisponibilidade, 'sem_evidencia_de_lacuna'>>;
  } | null = null;
  private velocidade: Velocidade = 1;
  /** A reprodução ampliou o mapa ao abrir: ao fechar, ele volta ao tamanho normal. */
  private ampliadoPelaReproducao = false;
  /** Camada de áreas lida para a ficha, por carga (a mesma leitura da sobreposição). */
  private areasFicha: { carga: number; leitura: LeituraAreas } | null = null;

  constructor(private readonly senhaLocal: boolean, private readonly sessao: Sessao) {}

  iniciar(): void {
    this.erroCallback = this.lerErroDoCallback();
    this.renderAcesso({ tipo: 'iniciando' });
    this.sessao.aoMudar((e, s) => this.aoMudarSessao(e, s?.user.id ?? null));
    $('botao-sair').addEventListener('click', () => void this.sair());
    // Sem botão "Consultar" (T16): período, atalhos e município se aplicam ao mudar.
    $('form-consulta').addEventListener('submit', (ev) => { ev.preventDefault(); this.aplicarFormulario(); });
    for (const id of ['f-inicio', 'f-fim', 'f-municipio']) $(id).addEventListener('change', () => this.aplicarFormulario());
    $('f-periodo').addEventListener('change', () => this.aoMudarPeriodo());
    $('botao-limpar').addEventListener('click', () => this.limparFiltros());
    // Lente calculada ao escolher (A3, T16): sem botão "Aplicar lente".
    for (const r of document.querySelectorAll<HTMLInputElement>('input[name="l-lente"]')) {
      r.addEventListener('change', () => {
        this.mostrarEscolhaLente();
        this.atualizarLimpar();
        if (lenteEscolhida() === 'nenhuma') {
          this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
          abrirAba('municipios');
          return;
        }
        abrirAba('destaques');
        void this.aplicarLente();
        this.aoMudarLenteComparacao();
      });
    }
    // Configuração da lente (classe, critérios, operador) vale ao mudar e recalcula no mesmo recorte (T16).
    $('lente-combinacao').addEventListener('change', () => {
      this.concentracaoRetirada = false;
      if (lenteEscolhida() === 'combinacao') { void this.aplicarLente(); this.aoMudarLenteComparacao(); }
    });
    $('lente-sobreposicao').addEventListener('change', () => {
      if (lenteEscolhida() === 'sobreposicao') { void this.aplicarLente(); this.aoMudarLenteComparacao(); }
    });
    // Comparação (plano 008, item 1): modo e lado B se aplicam ao mudar, como os demais filtros.
    for (const r of document.querySelectorAll<HTMLInputElement>('input[name="c-modo"]')) r.addEventListener('change', () => this.aoMudarModoComparacao());
    for (const id of ['cmp-b-inicio', 'cmp-b-fim', 'cmp-municipio-b']) $(id).addEventListener('change', () => void this.compararAgora());
    // Camadas (T8, T10): limites, áreas, detecções individuais e densidade.
    $('c-limites').addEventListener('change', () => void this.alternarLimites());
    $('c-areas').addEventListener('change', () => void this.alternarAreas());
    // Com a reprodução aberta, a camada estática fica fora do mapa até fechar (ela volta conforme a caixa).
    $('c-pontos').addEventListener('change', () => { if (!this.reproducao) this.mapa?.mostrarPontos(marcado('c-pontos')); });
    $('c-densidade').addEventListener('change', () => this.mostrarDensidade());
    // Ampliar mapa (T17): Esc ou o mesmo botão voltam, com o foco no botão.
    $('botao-ampliar').addEventListener('click', () => this.ampliarMapa(!mapaAmpliado()));
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && mapaAmpliado() && !document.querySelector('dialog[open]')) this.ampliarMapa(false);
    });
    $('botao-enquadrar').addEventListener('click', () => this.mapa?.enquadrar());
    // "Mapa" e "Camadas" (issue #71): um painel aberto por vez, para os menus não se sobreporem.
    const paineis = [$<HTMLDetailsElement>('opcoes-mapa'), $<HTMLDetailsElement>('camadas')];
    for (const p of paineis) {
      p.addEventListener('toggle', () => { if (p.open) for (const outro of paineis) if (outro !== p) outro.open = false; });
    }
    // Mapa-base (T12): "Satélite" só com chave; "Sem fundo" sempre disponível.
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-fundo]')) {
      b.addEventListener('click', () => {
        const fundo = b.dataset.fundo as Fundo;
        if (fundo === 'satelite' && !this.chaveEsri) return;
        this.escolherFundo(fundo, this.chaveEsri ? null : AVISO_SEM_CHAVE);
      });
    }
    this.escolherFundo(this.fundo, this.chaveEsri ? null : AVISO_SEM_CHAVE);
    $('botao-lista-focos').addEventListener('click', () => this.alternarListaFocos());
    $('botao-fechar-focos').addEventListener('click', () => this.fecharListaFocos());
    $('lista-focos').addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); this.fecharListaFocos(); } });
    $('botao-voltar').addEventListener('click', () => this.voltarAosDestaques());
    ligarAbas();
    for (const p of IDS_PERGUNTAS) $(`pergunta-${p}`).addEventListener('click', () => void this.perguntarAgora(p));
    $('botao-cancelar-pergunta').addEventListener('click', () => this.perguntaEmCurso?.abort());
    const arrastar = $('botao-arrastar');
    arrastar.addEventListener('click', () => {
      const ativo = arrastar.getAttribute('aria-pressed') !== 'true';
      arrastar.setAttribute('aria-pressed', String(ativo));
      this.mapa?.permitirArrastar(ativo);
    });
    this.ligarPergunte();
  }

  // --- Pergunte ao mapa, mapa vivo e ficha (ciclo 012, issue #113) ------------------------------------------------

  private ligarPergunte(): void {
    const campo = $<HTMLTextAreaElement>('p-pergunta');
    $('form-pergunte').addEventListener('submit', (ev) => { ev.preventDefault(); void this.perguntarMapa(campo.value); });
    // "×" no campo: apaga só o texto; os filtros aplicados continuam.
    const apagar = $<HTMLButtonElement>('p-apagar');
    campo.addEventListener('input', () => { apagar.hidden = campo.value === ''; this.atualizarLimpar(); });
    apagar.addEventListener('click', () => { campo.value = ''; apagar.hidden = true; campo.focus(); this.atualizarLimpar(); });
    campo.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); void this.perguntarMapa(campo.value); }
    });
    $('botao-animar').addEventListener('click', () => {
      // O menu "Mapa" fecha para não cobrir a barra.
      $<HTMLDetailsElement>('opcoes-mapa').open = false;
      if (this.reproducao) this.fecharReproducao(true);
      else this.abrirReproducao(false);
    });
    $('rep-tocar').addEventListener('click', () => this.alternarTocar());
    $('rep-fechar').addEventListener('click', () => this.fecharReproducao(true));
    $<HTMLInputElement>('rep-dia').addEventListener('input', (ev) => {
      this.pausar();
      this.irParaDia(Number((ev.target as HTMLInputElement).value));
    });
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-vel]')) {
      b.addEventListener('click', () => {
        this.velocidade = Number(b.dataset['vel']) as Velocidade;
        renderVelocidade(this.velocidade);
        if (this.reproducao?.tocando) { this.pausar(); this.tocar(); }
      });
    }
    // Série (desejável): clicar num dia leva a reprodução àquele dia.
    $('serie-corpo').addEventListener('click', (ev) => {
      const barra = (ev.target as HTMLElement).closest<HTMLElement>('.serie__barra[data-chave]');
      const r = this.reproducao;
      if (!barra || !r) return;
      const i = r.rep.dias.indexOf(barra.dataset['chave'] ?? '');
      if (i < 0) return;
      this.pausar();
      this.irParaDia(i);
    });
    // Esc fecha a reprodução antes de qualquer outro uso da tecla (mapa ampliado), fora dos diálogos.
    window.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Escape' || !this.reproducao || document.querySelector('dialog[open]')) return;
      ev.stopPropagation();
      this.fecharReproducao(true);
    }, true);
    $('botao-ficha-destaque').addEventListener('click', () => void this.abrirFicha('destaque', $('botao-ficha-destaque')));
    const dialogo = $<HTMLDialogElement>('dialogo-ficha');
    for (const b of dialogo.querySelectorAll<HTMLButtonElement>('[data-fechar]')) b.addEventListener('click', () => dialogo.close());
    $('ficha-imprimir').addEventListener('click', () => window.print());
  }

  private manipuladoresEntendi(): ManipuladoresEntendi {
    return {
      editar: (alvo) => this.editarItem(alvo),
      ficha: () => void this.abrirFicha('recorte', document.getElementById('botao-ficha-pergunta')),
      mostrarDeteccoes: () => {
        limparPergunte();
        this.abrirListaFocos();
        this.mapa?.enquadrar();
      },
    };
  }

  /**
   * Interpreta a pergunta (IA com tempo-limite; sem IA ou com falha, o interpretador local), valida contra a janela e
   * a lista de municípios e aplica nos controles existentes. Uma pergunta nova descarta a anterior em curso.
   */
  private async perguntarMapa(bruta: string): Promise<void> {
    const dados = this.dados;
    const texto = bruta.trim();
    if (!dados || !this.aplicado) return;
    if (!texto) { estadoPergunte('Escreva uma pergunta sobre as detecções de calor.', false); return; }
    const g = ++this.geracaoPergunte;
    const gs = this.geracaoSessao;
    const atual = () => g === this.geracaoPergunte && gs === this.geracaoSessao;
    limparPergunte();
    estadoPergunte('Interpretando a pergunta…', true);
    const ctx = { janela: dados.janela, municipios: dados.municipios };
    let bruto: unknown = null;
    let origem: 'ia' | 'local' = 'local';
    let notaOrigem: string | null = null;
    if (!this.iaInterpretacaoDesligada) {
      const { data } = await this.sessao.cliente.auth.getSession();
      const token = data.session?.access_token;
      if (!atual()) return;
      if (token) {
        const d = await pedirInterpretacao(texto, { id: dados.carga.id, identidade: dados.carga.identidade }, token, AbortSignal.timeout(TEMPO_LIMITE_IA_MS));
        if (!atual()) return;
        if (d.tipo === 'ok') { bruto = d.bruto; origem = 'ia'; }
        else if (d.tipo === 'desligada') { this.iaInterpretacaoDesligada = true; marcarIa(false); }
        else notaOrigem = d.codigo === 'tempo_esgotado' ? 'A IA não respondeu a tempo; o interpretador local assumiu.' : 'A IA não respondeu como esperado; o interpretador local assumiu.';
      }
    }
    if (bruto === null) bruto = interpretarLocal(texto, ctx);
    let { interpretacao, descartados } = validarInterpretacao(bruto, ctx);
    // Saída da IA sem nada aproveitável: as regras locais tentam antes de dizer "não entendi".
    if (origem === 'ia' && interpretacao.tipo === 'nao_entendi') {
      const local = validarInterpretacao(interpretarLocal(texto, ctx), ctx);
      if (local.interpretacao.tipo !== 'nao_entendi') { ({ interpretacao, descartados } = local); origem = 'local'; notaOrigem = 'A IA não reconheceu filtros; o interpretador local assumiu.'; }
    }
    estadoPergunte('', false);
    const m = this.manipuladoresEntendi();
    if (interpretacao.tipo !== 'consulta') {
      this.perguntaMapa = null;
      renderAvisoPergunta(interpretacao.tipo, dados.janela, origem, m);
      this.atualizarLimpar();
      return;
    }
    const itens = itensEntendi(interpretacao, this.aplicado, (c) => (c === null ? 'Todo Mato Grosso' : this.nomeMunicipio(c) ?? String(c)));
    this.perguntaMapa = { texto, interpretacao, origem, linhas: itens.map((x) => `${x.rotulo}: ${x.valor}`) };
    renderEntendi(itens, origem, notaOrigem, descartados, m);
    this.aplicarInterpretacao(interpretacao);
  }

  /** Preenche os controles existentes e dispara o mesmo caminho dos filtros; não há consulta paralela. */
  private aplicarInterpretacao(i: Interpretacao): void {
    const dados = this.dados;
    const antes = this.aplicado;
    if (!dados || !antes) return;
    this.fecharReproducao(false);
    if (i.periodo) {
      $<HTMLSelectElement>('f-periodo').value = 'personalizado';
      $('intervalo').hidden = false;
      $<HTMLInputElement>('f-inicio').value = i.periodo.inicio;
      $<HTMLInputElement>('f-fim').value = i.periodo.fim;
    }
    $<HTMLSelectElement>('f-municipio').value = i.municipio === null ? '' : String(i.municipio);
    // Lente: a anterior sai; a nova é calculada depois da leitura do recorte (ou já, se o recorte não mudar).
    const marcar = (seletor: string) => { const e = document.querySelector<HTMLInputElement>(seletor); if (e) e.checked = true; };
    if (this.lente || this.combinacao || this.sobreposicao) this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
    marcar(`input[name="l-lente"][value="${i.lente}"]`);
    if (i.classe) marcar(`input[name="l-classe"][value="${i.classe}"]`);
    if (i.combinacao) {
      for (const c of document.querySelectorAll<HTMLInputElement>('input[name="l-comb"]')) c.checked = (i.combinacao.lentes as string[]).includes(c.value);
      marcar(`input[name="l-operador"][value="${i.combinacao.operador}"]`);
      this.concentracaoRetirada = false;
    }
    this.mostrarEscolhaLente();
    if (i.lente !== 'nenhuma') this.lentePendente = true;
    // Comparação: o modo pedido, ou nenhuma.
    marcar(`input[name="c-modo"][value="${i.comparar?.modo ?? 'nenhuma'}"]`);
    $('comparar-periodos').hidden = i.comparar?.modo !== 'periodos';
    $('comparar-municipios').hidden = i.comparar?.modo !== 'municipios';
    if (i.comparar?.modo === 'periodos') {
      $<HTMLInputElement>('cmp-b-inicio').value = i.comparar.b.inicio;
      $<HTMLInputElement>('cmp-b-fim').value = i.comparar.b.fim;
    } else if (i.comparar?.modo === 'municipios') {
      $<HTMLSelectElement>('cmp-municipio-b').value = String(i.comparar.municipio_b);
    }
    this.animarAoCarregar = i.animar;
    this.aplicarFormulario();
    const a = this.aplicado;
    const mudou = !a || a.inicio !== antes.inicio || a.fim !== antes.fim || a.municipio !== antes.municipio;
    if (!mudou) {
      if (i.lente !== 'nenhuma') void this.aplicarLente();
      void this.compararAgora();
      if (this.animarAoCarregar && Array.isArray(this.pontos)) { this.animarAoCarregar = false; this.abrirReproducao(true); }
    }
    abrirAba(i.comparar ? 'comparacao' : i.lente !== 'nenhuma' ? 'destaques' : 'municipios');
    this.atualizarLimpar();
  }

  /** ✎: abre a seção do controle, foca e destaca brevemente. */
  private editarItem(alvo: Alvo): void {
    const abrir = (id: string) => { const d = document.getElementById(id); if (d instanceof HTMLDetailsElement) d.open = true; };
    let controle: HTMLElement | null = null;
    if (alvo === 'periodo' || alvo === 'municipio') {
      abrir('secao-consulta');
      controle = alvo === 'municipio' ? $('f-municipio')
        : $<HTMLSelectElement>('f-periodo').value === 'personalizado' ? $('f-inicio') : $('f-periodo');
    } else if (alvo === 'lente' || alvo === 'classe') {
      const marcado = document.querySelector<HTMLInputElement>(alvo === 'classe' ? 'input[name="l-classe"]:checked'
        : lenteEscolhida() === 'combinacao' ? 'input[name="l-comb"]:checked' : 'input[name="l-lente"]:checked:not([hidden])')
        ?? document.querySelector<HTMLInputElement>('#secao-lente input[name="l-lente"]');
      const secao = marcado?.closest('details');
      if (secao) secao.open = true;
      controle = marcado ?? null;
    } else if (alvo === 'comparar') {
      abrir('secao-comparar');
      controle = document.querySelector<HTMLInputElement>('input[name="c-modo"]:checked');
    } else {
      abrir('opcoes-mapa');
      controle = $('botao-animar');
    }
    if (!controle) return;
    const destaque = controle.closest<HTMLElement>('label, .opcao-lente') ?? controle;
    destaque.classList.remove('editando');
    void destaque.offsetWidth;
    destaque.classList.add('editando');
    window.setTimeout(() => destaque.classList.remove('editando'), 1800);
    controle.scrollIntoView({ block: 'nearest' });
    controle.focus();
  }

  /** Abre a barra do mapa vivo sobre os pontos já lidos do recorte aplicado; `tocar` já começa do primeiro dia. */
  private abrirReproducao(tocar: boolean): void {
    const p = this.pontos;
    const a = this.aplicado;
    if (!Array.isArray(p) || !a || !this.mapa) {
      $('p-estado').textContent = 'A reprodução abre quando as detecções do recorte terminarem de carregar.';
      return;
    }
    if (this.mapaComB) { void this.restaurarMapaA(); renderLadoNoMapa(null); }
    this.fecharReproducao(false);
    // O mapa vivo sempre abre com o mapa ampliado; ao fechar, ele volta ao tamanho anterior.
    if (!mapaAmpliado()) { this.ampliarMapa(true, false); this.ampliadoPelaReproducao = true; }
    const rep = montarReproducao(p, a.inicio, a.fim);
    const r = this.resultado;
    const disp = r && r.filtro.inicio === a.inicio && r.filtro.fim === a.fim && r.filtro.municipio === a.municipio ? r.disponibilidade : null;
    const sem = diasSemCobertura(disp);
    this.mapa.fecharBalao();
    this.mapa.iniciarReproducao(rep.dias, rep.porDia);
    // Depois que o navegador aplica o novo tamanho do mapa, enquadra os dados (pontos e limite do município).
    if (tocar || this.ampliadoPelaReproducao) this.enquadrarDepoisDoLayout();
    this.reproducao = { rep, i: 0, tocando: false, relogio: undefined, sem };
    const faixa = $<HTMLInputElement>('rep-dia');
    faixa.max = String(Math.max(0, rep.dias.length - 1));
    renderMarcas(rep, sem, a.municipio !== null);
    renderVelocidade(this.velocidade);
    $('reproducao').hidden = false;
    $('reproducao').dataset['total'] = String(rep.total);
    $('botao-animar').setAttribute('aria-expanded', 'true');
    $('conteudo').dataset['reproducao'] = 'aberta';
    this.irParaDia(tocar ? 0 : rep.dias.length - 1);
    if (tocar) this.tocar();
    else $('rep-tocar').focus({ preventScroll: true });
  }

  private irParaDia(i: number): void {
    const r = this.reproducao;
    if (!r) return;
    r.i = Math.max(0, Math.min(i, r.rep.dias.length - 1));
    this.mapa?.mostrarQuadro(r.i);
    renderQuadro(r.rep, r.i, r.sem);
    marcarSerie(r.rep.dias[r.i] ?? null);
  }

  private tocar(): void {
    const r = this.reproducao;
    if (!r) return;
    if (r.i >= r.rep.dias.length - 1) this.irParaDia(0);
    r.tocando = true;
    renderTocando(true);
    const passo = () => {
      const x = this.reproducao;
      if (!x || !x.tocando) return;
      if (x.i >= x.rep.dias.length - 1) { this.pausar(); return; }
      this.irParaDia(x.i + 1);
      x.relogio = window.setTimeout(passo, PASSO_MS / this.velocidade);
    };
    r.relogio = window.setTimeout(passo, PASSO_MS / this.velocidade);
  }

  private pausar(): void {
    const r = this.reproducao;
    if (!r) return;
    window.clearTimeout(r.relogio);
    r.relogio = undefined;
    r.tocando = false;
    renderTocando(false);
  }

  private alternarTocar(): void {
    if (this.reproducao?.tocando) this.pausar();
    else this.tocar();
  }

  /** Fecha a barra e devolve o mapa estático, intacto; `focar` leva o foco ao mapa. */
  private fecharReproducao(focar: boolean): void {
    if (!this.reproducao) return;
    this.pausar();
    this.reproducao = null;
    this.mapa?.encerrarReproducao(marcado('c-pontos'));
    $('reproducao').hidden = true;
    $('botao-animar').setAttribute('aria-expanded', 'false');
    delete $('conteudo').dataset['reproducao'];
    marcarSerie(null);
    renderTocando(false);
    if (this.ampliadoPelaReproducao && mapaAmpliado()) {
      this.ampliarMapa(false, false);
      this.enquadrarDepoisDoLayout();
    }
    this.ampliadoPelaReproducao = false;
    if (focar) this.mapa?.focar();
  }

  /** Redimensiona e enquadra no quadro seguinte ao da troca de tamanho do mapa (ampliar ou reduzir). */
  private enquadrarDepoisDoLayout(): void {
    requestAnimationFrame(() => requestAnimationFrame(() => this.mapa?.enquadrarAposZoom()));
  }

  /** Registros do alvo da ficha: o destaque aberto (evidência da lente) ou o recorte aplicado inteiro. */
  private alvoFicha(origem: 'recorte' | 'destaque'): { registros: RegistroLente[]; rotulo: string } | null {
    const p = this.pontos;
    if (!Array.isArray(p)) return null;
    if (origem === 'destaque') {
      const aberto = this.destaqueAberto();
      const ids = this.lente?.resultado.destaques.find((d) => d.id_destaque === aberto?.id)?.evidencia.deteccoes
        ?? this.combinacao?.resultado.celulas.find((c) => c.id_combinado === aberto?.id)?.evidencia.deteccoes
        ?? this.sobreposicao?.resultado.destaques.find((d) => d.id_destaque === aberto?.id)?.evidencia.deteccoes;
      if (aberto && ids) {
        const conjunto = new Set(ids);
        return { registros: p.filter((r) => conjunto.has(r.id_tecnico)), rotulo: `Destaque ${aberto.rotulo} (${$('t-destaques').textContent ?? 'lente'})` };
      }
    }
    return { registros: p, rotulo: 'Recorte aplicado inteiro' };
  }

  /** Lê (uma vez por carga) a camada de áreas e conta as detecções do alvo em cada área. */
  private async areasDaFicha(registros: readonly RegistroLente[], atual: () => boolean): Promise<AreasFicha> {
    const dados = this.dados;
    if (!dados) return { estado: 'falha' };
    try {
      if (this.areasFicha?.carga !== dados.carga.id) {
        const leitura = await lerAreas(fontesAreas(this.sessao.cliente), dados.carga.id, atual);
        if (!leitura || !atual()) return { estado: 'falha' };
        this.areasFicha = { carga: dados.carga.id, leitura };
      }
      const l = this.areasFicha.leitura;
      if (l.estado === 'sem_camada') return { estado: 'sem_camada' };
      const ids = new Set(registros.map((r) => r.id_tecnico));
      const porArea = new Map<string, Set<string>>();
      const dentro = new Set<string>();
      for (const v of l.vinculos) {
        if (!ids.has(v.id_tecnico)) continue;
        const k = chaveArea(v.area_fonte, v.area_codigo);
        if (!porArea.has(k)) porArea.set(k, new Set());
        porArea.get(k)!.add(v.id_tecnico);
        dentro.add(v.id_tecnico);
      }
      const nomes = new Map(l.areas.map((a) => [chaveArea(a.fonte, a.codigo), a]));
      const areas = [...porArea].flatMap(([k, s]) => {
        const a = nomes.get(k);
        return a ? [{ nome: a.nome, classe: a.classe, deteccoes: s.size }] : [];
      }).sort((x, y) => y.deteccoes - x.deteccoes || x.nome.localeCompare(y.nome, 'pt-BR'));
      return { estado: 'lidas', areas, fora: ids.size - dentro.size };
    } catch {
      return { estado: 'falha' };
    }
  }

  /** Monta e abre a ficha do recorte atual ou do destaque aberto. */
  private async abrirFicha(origem: 'recorte' | 'destaque', botao: HTMLElement | null): Promise<void> {
    const dados = this.dados;
    const a = this.aplicado;
    const dialogo = $<HTMLDialogElement>('dialogo-ficha');
    const alvo = this.alvoFicha(origem);
    if (!dados || !a || !alvo) {
      $('p-estado').textContent = 'A ficha fica disponível quando as detecções do recorte terminarem de carregar.';
      return;
    }
    const gs = this.geracaoSessao;
    const gc = this.geracaoConsulta;
    const atual = () => gs === this.geracaoSessao && gc === this.geracaoConsulta;
    const voltar = botao ?? $('botao-animar');
    dialogo.addEventListener('close', () => { if (document.contains(voltar)) voltar.focus(); }, { once: true });
    $('ficha-corpo').replaceChildren();
    $('ficha-estado').textContent = 'Montando a ficha e conferindo as áreas protegidas…';
    if (!dialogo.open) dialogo.showModal();
    const r = this.resultado;
    const disp = r && r.filtro.inicio === a.inicio && r.filtro.fim === a.fim && r.filtro.municipio === a.municipio ? r.disponibilidade : null;
    const sem = diasSemCobertura(disp);
    const periodo = { inicio: a.inicio, fim: a.fim };
    const resumo = resumirFicha(alvo.registros, periodo, sem);
    const areas = await this.areasDaFicha(alvo.registros, atual);
    if (!atual() || !dialogo.open) return;
    let persistente = false;
    try {
      persistente = persistencia({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: periodo, registros: [...alvo.registros],
        totalResumo: alvo.registros.length, nomes: dados.nomes, recorte: recorteDe(a.municipio),
      }).destaques.length > 0;
    } catch { /* sem persistência conferida, o passo não entra */ }
    const local = a.municipio === null ? 'Todo Mato Grosso' : this.nomeMunicipio(a.municipio) ?? String(a.municipio);
    const ctx = this.contextoPergunta();
    const respostaIa = this.estadoPerguntas.tipo === 'resposta' && this.chavePergunta !== null && this.chavePergunta === chaveContexto(this.geracaoSessao, ctx)
      ? this.estadoPerguntas.resposta.afirmacoes.map((x) => x.texto) : null;
    const lente = lenteEscolhida();
    const pm = this.perguntaMapa;
    renderFicha($('ficha-corpo'), {
      geradaEm: new Date(), carga: { id: dados.carga.id, identidade: dados.carga.identidade },
      pergunta: pm?.texto ?? null, interpretacao: pm ? { linhas: pm.linhas, origem: pm.origem } : null,
      filtros: [local, resumoPeriodo(periodo), `Lente: ${TITULO_OPCAO[lente] ?? 'nenhuma'}`,
        ...(modoComparacao() !== 'nenhuma' ? [`Comparação: ${modoComparacao() === 'periodos' ? 'dois períodos' : 'dois municípios'}`] : [])],
      alvo: `${alvo.rotulo} · ${alvo.registros.length} ${alvo.registros.length === 1 ? 'detecção' : 'detecções'}`,
      local, periodo, registros: alvo.registros, resumo, areas,
      roteiro: roteiroAveriguacao({ areas, persistencia: persistente, semCobertura: resumo.semCobertura.length, total: resumo.total }),
      sintese: sinteseDeterministica(resumo, local, periodo), sinteseIa: respostaIa,
    });
    $('ficha-estado').textContent = '';
    $('ficha-corpo').dataset['total'] = String(resumo.total);
  }

  // --- Sessão e acesso ---------------------------------------------------------------------------

  private lerErroDoCallback(): string | undefined {
    const parametros = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const descricao = parametros.get('error_description') ?? hash.get('error_description');
    if (parametros.has('error') || hash.has('error')) {
      history.replaceState(history.state, '', location.pathname);
      return `Falha no login${descricao ? `: ${descricao}` : '.'}`;
    }
    return undefined;
  }

  private manipuladores() {
    return {
      senhaLocal: this.senhaLocal,
      google: () => void this.entrarComGoogle(),
      senha: (email: string, senha: string) => void this.entrarComSenha(email, senha),
      tentarNovamente: () => void this.verificarAcesso(),
    };
  }

  private renderAcesso(a: Acesso): void {
    renderAcesso(a, this.manipuladores());
  }

  private async entrarComGoogle(): Promise<void> {
    const erro = await this.sessao.entrarComGoogle();
    if (erro) this.renderAcesso({ tipo: 'anonimo', erro });
  }

  private async entrarComSenha(email: string, senha: string): Promise<void> {
    const erro = await this.sessao.entrarComSenha(email, senha);
    if (erro) this.renderAcesso({ tipo: 'anonimo', erro });
  }

  private aoMudarSessao(evento: EventoSessao, usuario: string | null): void {
    if (evento === 'com_sessao') {
      // O SDK repete SIGNED_IN ao voltar à aba; sem mudança de acesso, nada a refazer.
      if (this.usuarioAutorizado && this.dados) return;
      void this.verificarAcesso();
      return;
    }
    void usuario;
    this.limparTudo();
    const motivo = evento === 'saiu' ? 'saiu' : this.motivoPendente;
    this.motivoPendente = undefined;
    const erro = this.erroCallback;
    this.erroCallback = undefined;
    this.renderAcesso({ tipo: 'anonimo', ...(motivo ? { motivo } : {}), ...(erro ? { erro } : {}) });
  }

  private async sair(): Promise<void> {
    // A tela é limpa antes da rede responder.
    this.limparTudo();
    this.renderAcesso({ tipo: 'anonimo', motivo: 'saiu' });
    await this.sessao.sair();
  }

  private async verificarAcesso(): Promise<void> {
    this.limparTudo();
    const g = this.geracaoSessao;
    this.renderAcesso({ tipo: 'verificando' });
    try {
      const carga = await lerCargaVigente(this.sessao.cliente);
      if (g !== this.geracaoSessao) return;
      if (!carga) {
        const s = await sondarAcesso(this.sessao.cliente);
        if (g !== this.geracaoSessao) return;
        this.renderAcesso({ tipo: s === 'negado' ? 'negado' : 'sem_publicacao' });
        return;
      }
      const [municipios, prov] = await Promise.all([
        lerMunicipios(this.sessao.cliente, carga.id), lerProveniencia(this.sessao.cliente, carga.id),
      ]);
      if (g !== this.geracaoSessao) return;
      this.dados = {
        carga, municipios, nomes: new Map(municipios.map((m) => [m.codigo, m.nome])),
        janela: { inicio: primeiroDiaGmt(carga.janela_inicio), fim: ultimoDiaGmt(carga.janela_fim) },
        fontes: prov.fontes, malhas: prov.malhas,
      };
      this.usuarioAutorizado = true;
      this.renderAcesso({ tipo: 'autorizado' });
      renderFiltros(carga, municipios, this.dados.janela);
      $<HTMLSelectElement>('cmp-municipio-b').replaceChildren(new Option('Escolha…', ''), ...municipios.map((m) => new Option(m.nome, String(m.codigo))));
      renderTopo(carga, prov.fontes);
      renderProveniencia(carga, prov.fontes, prov.malhas);
      $<HTMLInputElement>('f-inicio').value = this.dados.janela.inicio;
      $<HTMLInputElement>('f-fim').value = this.dados.janela.fim;
      $<HTMLSelectElement>('f-periodo').value = 'ano';
      $('intervalo').hidden = true;
      configuracaoPadrao();
      this.mostrarEscolhaLente();
      abrirAba('municipios');
      this.aplicado = { carga: carga.id, inicio: this.dados.janela.inicio, fim: this.dados.janela.fim, municipio: null };
      this.mostrarRecorte(false);
      this.garantirMapa();
      await this.consultar();
    } catch (e) {
      if (g !== this.geracaoSessao) return;
      this.tratarErroGlobal(e);
    }
  }

  private tratarErroGlobal(e: unknown): void {
    const tipo: TipoErro = e instanceof ErroConsulta ? e.tipo : 'fonte_indisponivel';
    this.limparTudo();
    if (tipo === 'sessao_expirada') {
      this.motivoPendente = 'expirada';
      this.renderAcesso({ tipo: 'anonimo', motivo: 'expirada' });
      void this.sessao.encerrarLocal();
    } else if (tipo === 'acesso_negado') {
      this.renderAcesso({ tipo: 'negado' });
    } else if (tipo === 'sem_publicacao') {
      this.renderAcesso({ tipo: 'sem_publicacao' });
    } else {
      this.renderAcesso({ tipo: 'fonte_indisponivel' });
    }
  }

  /** Remove da tela e da memória tudo o que veio de consultas; invalida respostas em voo. */
  private limparTudo(): void {
    this.geracaoSessao++;
    this.geracaoConsulta++;
    this.detalheMunicipio = null;
    this.usuarioAutorizado = false;
    this.dados = null;
    this.resultado = null;
    this.aplicado = null;
    this.pontos = 'carregando';
    fecharDialogos();
    $('conteudo').dataset['estadoPainel'] = 'carregando';
    this.selecionado = null;
    this.limites.clear();
    this.todosOsLimites = true;
    this.totalDensidade = null;
    this.ampliarMapa(false, false);
    this.mapa?.limparTudo();
    limparResultados();
    renderContagemMapa({ tipo: 'nenhum' }, 0);
    this.fecharListaFocos(false);
    mostrarErroFiltro(null);
    // Camadas voltam ao padrão: limites e detecções ligados, densidade desligada.
    for (const [id, v] of [['c-limites', true], ['c-pontos', true], ['c-densidade', false]] as const) $<HTMLInputElement>(id).checked = v;
    this.mapa?.mostrarPontos(true);
    this.mapa?.mostrarDensidade(false);
    renderLegendaDensidade(false, null, 0);
    delete $('conteudo').dataset['estadoLimites'];
    // Sessão, acesso ou publicação mudaram: a lente e toda a memória de recortes saem junto (R2-1, T6).
    this.limparLente({ memoria: true, estado: { tipo: 'nenhuma' } });
    this.limparAreas();
    this.redefinirComparacao();
    abrirAba('municipios');
    // Sessão, acesso ou versão mudaram: a pergunta e a resposta saem junto, sem aviso de seleção.
    this.descartarPergunta(false);
    this.atualizarPerguntas();
    // Pergunte ao mapa, mapa vivo e ficha (ciclo 012) saem junto.
    this.geracaoPergunte++;
    this.perguntaMapa = null;
    this.animarAoCarregar = false;
    this.areasFicha = null;
    this.fecharReproducao(false);
    limparPergunte();
    estadoPergunte('', false);
  }

  // --- Consulta --------------------------------------------------------------------------------------

  private garantirMapa(): void {
    if (this.mapa) return;
    this.mapa = criarMapa($('mapa'));
    this.mapa.aoSelecionar((id) => this.selecionarPonto(id));
    this.mapa.aoSelecionarDestaque((id) => this.selecionarDestaque(id));
    this.mapa.aoSelecionarArea((chave) => this.selecionarAreaDaCamada(chave));
    this.mapa.mostrarPontos(marcado('c-pontos'));
    this.mapa.mostrarDensidade(marcado('c-densidade'));
    this.escolherFundo(this.fundo, this.chaveEsri ? null : AVISO_SEM_CHAVE);
    if (window.matchMedia('(pointer: coarse)').matches) {
      // Em tela de toque, um dedo rola a página; o mapa só arrasta quando o usuário ativa.
      this.mapa.permitirArrastar(false);
      $('botao-arrastar').hidden = false;
    }
  }

  /** Troca o mapa-base (T12) e atualiza os botões e o aviso; falha da imagem volta para "Sem fundo", falha só dos nomes mantém a imagem. */
  private escolherFundo(fundo: Fundo, aviso: string | null): void {
    this.fundo = fundo;
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-fundo]')) {
      b.setAttribute('aria-pressed', String(b.dataset.fundo === fundo));
    }
    const satelite = $('fundo-satelite');
    if (this.chaveEsri) satelite.removeAttribute('aria-disabled');
    else satelite.setAttribute('aria-disabled', 'true');
    const caixa = $('aviso-fundo');
    caixa.textContent = aviso ?? '';
    caixa.hidden = !aviso;
    this.mapa?.definirFundo(fundo, this.chaveEsri, (parte) => {
      if (parte === 'imagem') {
        this.escolherFundo('nenhum', AVISO_FALHA);
        return;
      }
      caixa.textContent = AVISO_FALHA_NOMES;
      caixa.hidden = false;
    });
  }

  /** Período digitado, validado; inválido mostra o erro junto dos campos e devolve `null` (o recorte aplicado fica). */
  private lerPeriodo(): Janela | null {
    if (!this.dados) return null;
    const inicio = $<HTMLInputElement>('f-inicio').value;
    const fim = $<HTMLInputElement>('f-fim').value;
    const erro = validarPeriodo(inicio, fim, this.dados.janela);
    mostrarErroFiltro(erro);
    return erro ? null : { inicio, fim };
  }

  private nomeMunicipio(codigo: number | null): string | null {
    if (codigo === null) return null;
    return this.dados?.nomes.get(codigo) ?? String(codigo);
  }

  private mostrarRecorte(invalido: boolean): void {
    if (!this.dados || !this.aplicado) return;
    renderRecorte(this.aplicado, this.nomeMunicipio(this.aplicado.municipio), invalido);
    renderConcentracaoDisponivel(this.aplicado.municipio === null);
    this.atualizarLimpar();
  }

  /** "Limpar tudo" só fica ativo fora do padrão (janela inteira, todo o estado, nenhuma lente, nenhuma pergunta), como na V13. */
  private atualizarLimpar(): void {
    const a = this.aplicado;
    const j = this.dados?.janela;
    const padrao = !a || !j || (a.inicio === j.inicio && a.fim === j.fim && a.municipio === null
      && $<HTMLSelectElement>('f-periodo').value === 'ano' && lenteEscolhida() === 'nenhuma' && modoComparacao() === 'nenhuma'
      && this.perguntaMapa === null && $<HTMLTextAreaElement>('p-pergunta').value === '' && $('p-aviso').hidden === true);
    $<HTMLButtonElement>('botao-limpar').disabled = padrao;
  }

  /** Seletor de período (V13): atalho aplica na hora; "Intervalo personalizado" abre as datas, que aplicam ao mudar. */
  private aoMudarPeriodo(): void {
    const valor = $<HTMLSelectElement>('f-periodo').value;
    const personalizado = valor === 'personalizado';
    $('intervalo').hidden = !personalizado;
    if (personalizado) {
      this.aplicarFormulario();
      return;
    }
    this.aplicarAtalho(valor as Atalho);
  }

  /**
   * Aplicação ao mudar (T16): com período válido, o recorte aplicado passa a ser o do formulário; com período inválido,
   * só o município muda (se mudou) e a tela continua no período aplicado. Recorte igual ao aplicado não consulta de novo.
   */
  private aplicarFormulario(): void {
    const dados = this.dados;
    const atual = this.aplicado;
    if (!dados || !atual) return;
    const periodo = this.lerPeriodo();
    const codigo = $<HTMLSelectElement>('f-municipio').value;
    const novo: Filtro = {
      carga: dados.carga.id, inicio: periodo?.inicio ?? atual.inicio, fim: periodo?.fim ?? atual.fim, municipio: codigo ? Number(codigo) : null,
    };
    if (novo.municipio !== atual.municipio) this.retirarConcentracao(novo.municipio);
    this.aplicado = novo;
    this.mostrarRecorte(periodo === null);
    if (novo.inicio === atual.inicio && novo.fim === atual.fim && novo.municipio === atual.municipio) return;
    void this.consultar();
  }

  /**
   * Concentração com município (plano 007, T4 e T16): a interface nunca a pede. Ao escolher um município com a
   * concentração ativa, a lente volta a "nenhuma" e a aba vai para Municípios; na combinação, a concentração sai e,
   * se sobrar 1 critério, aparece o aviso próprio.
   */
  private retirarConcentracao(municipio: number | null): void {
    if (municipio === null) {
      this.concentracaoRetirada = false;
      return;
    }
    if (lenteEscolhida() === 'concentracao') {
      marcarNenhuma();
      this.mostrarEscolhaLente();
      this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
      abrirAba('municipios');
    }
    const caixa = document.querySelector<HTMLInputElement>('input[name="l-comb"][value="concentracao"]');
    if (caixa?.checked) {
      caixa.checked = false;
      this.concentracaoRetirada = true;
    }
  }

  private aplicarAtalho(atalho: Atalho): void {
    if (!this.dados) return;
    $<HTMLSelectElement>('f-periodo').value = atalho;
    const p = periodoDoAtalho(atalho, this.dados.janela);
    $<HTMLInputElement>('f-inicio').value = p.inicio;
    $<HTMLInputElement>('f-fim').value = p.fim;
    this.aplicarFormulario();
  }

  /** "Limpar tudo": período, município e lente voltam ao padrão da V13; a coluna volta à aba Municípios. */
  private limparFiltros(): void {
    if (!this.dados) return;
    $<HTMLInputElement>('f-inicio').value = this.dados.janela.inicio;
    $<HTMLInputElement>('f-fim').value = this.dados.janela.fim;
    $<HTMLSelectElement>('f-periodo').value = 'ano';
    $('intervalo').hidden = true;
    $<HTMLSelectElement>('f-municipio').value = '';
    configuracaoPadrao();
    this.mostrarEscolhaLente();
    this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
    this.redefinirComparacao();
    abrirAba('municipios');
    this.perguntaMapa = null;
    limparPergunte();
    $<HTMLTextAreaElement>('p-pergunta').value = '';
    $('p-apagar').hidden = true;
    this.aplicarFormulario();
    this.mostrarMunicipios();
  }

  /** Grupos da combinação e da sobreposição só com a lente deles marcada. */
  private mostrarEscolhaLente(): void {
    const valor = lenteEscolhida();
    $('lente-combinacao').hidden = valor !== 'combinacao';
    $('lente-sobreposicao').hidden = valor !== 'sobreposicao';
  }

  private estado(e: EstadoConsulta): void {
    renderEstadoConsulta(e, () => void this.verificarAcesso(), () => void this.consultar());
    if (e.tipo !== 'ocioso' && e.tipo !== 'zero') $('conteudo').dataset['estadoPainel'] = e.tipo === 'carregando' ? 'carregando' : 'erro';
  }

  private async consultar(): Promise<void> {
    const dados = this.dados;
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    // Novo recorte (período ou município): a lente é recalculada depois da leitura da consulta (T16, plano 007 T1).
    const p = this.pedidoLente;
    const recalcularLente = !!p && (p.carga !== filtro.carga || p.janela.inicio !== filtro.inicio || p.janela.fim !== filtro.fim
      || (p.municipio ?? null) !== filtro.municipio);
    if (recalcularLente) {
      this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
      this.lentePendente = true;
    }
    const g = this.geracaoSessao;
    const c = ++this.geracaoConsulta;
    this.detalheMunicipio = null;
    $('municipios-corpo').replaceChildren();
    const atual = () => g === this.geracaoSessao && c === this.geracaoConsulta;
    // Novo recorte A: a comparação em curso é descartada e refeita depois da leitura (T7).
    this.cancelarComparacao();
    this.fecharReproducao(false);
    this.resultado = null;
    this.pontos = 'carregando';
    this.selecionado = null;
    this.paginaFocos = 0;
    this.mapa?.limparTudo();
    this.totalDensidade = null;
    renderLegendaDensidade(marcado('c-densidade'), null, 0);
    renderSelecao(null, null);
    renderContagemMapa({ tipo: 'carregando', lidos: 0, total: 0 }, 0);
    this.mostrarListaFocos();
    this.estado({ tipo: 'carregando' });
    try {
      const cliente = this.sessao.cliente;
      const [resumo, disponibilidade] = await Promise.all([
        consultarResumo(cliente, filtro),
        consultarDisponibilidade(cliente, filtro),
      ]);
      if (!atual()) return;
      if (![resumo.carga.id, disponibilidade.carga.id].every((id) => id === filtro.carga)) {
        this.estado({ tipo: 'inconsistente' });
        return;
      }
      this.resultado = { filtro, resumo, disponibilidade };
      this.estado(resumo.principal.total === 0 ? { tipo: 'zero' } : { tipo: 'ocioso' });
      renderSerie(resumo);
      this.mostrarMunicipios();
      // M1 (T14): filtros, cartão da série e municípios prontos, independentemente de pontos, limites e geometria.
      $('conteudo').dataset['estadoPainel'] = 'pronto';
      // Limites pedidos depois do painel pronto, sem bloquear a consulta nem a lente (T10).
      void this.atualizarLimites(atual);
      await this.lerPontos(filtro, resumo, atual);
    } catch (e) {
      if (!atual()) return;
      this.aoFalharConsulta(e);
      return;
    }
    if (atual() && this.lentePendente && lenteEscolhida() !== 'nenhuma') void this.aplicarLente();
    if (atual()) void this.compararAgora();
  }

  /**
   * Leitura completa do recorte (T7), com a memória T6: o resumo já foi lido nesta consulta; páginas já lidas e
   * conferidas no mesmo recorte e com o mesmo total são reaproveitadas. Leitura inconsistente nunca vira mapa parcial.
   */
  private async lerPontos(filtro: Filtro, resumo: Resumo, atual: () => boolean): Promise<void> {
    const pedido: PedidoLente = { carga: filtro.carga, janela: { inicio: filtro.inicio, fim: filtro.fim }, municipio: filtro.municipio };
    const total = validarResumo(pedido, resumo);
    const chave = chaveRecorte(this.geracaoSessao, filtro);
    let leitura = this.memoria.obter(chave);
    if (!leitura || leitura.totalResumo !== total || leitura.registros.length !== total) {
      const guardada = leitura;
      const emVoo = (async () => {
        const registros = await lerPaginas(this.fontesLente(), pedido, total, atual,
          (lidos, t) => { if (atual()) renderContagemMapa({ tipo: 'carregando', lidos, total: t }, this.mapa?.contagem().limites ?? 0); });
        if (!registros || !atual()) return null;
        return this.memoria.guardar({ chave, registros, totalResumo: total, disponibilidade: guardada?.disponibilidade ?? new Map() });
      })();
      this.leiturasEmVoo.set(chave, emVoo);
      try {
        leitura = await emVoo;
      } finally {
        if (this.leiturasEmVoo.get(chave) === emVoo) this.leiturasEmVoo.delete(chave);
      }
      if (!leitura || !atual()) return;
    }
    this.pontos = leitura.registros;
    this.mapa?.definirPontos(leitura.registros);
    this.desenharDensidade(filtro);
    if (!this.limites.size || !this.mapa?.contagem().limites) this.mapa?.enquadrar();
    this.mostrarEstadoPontos();
    this.mostrarListaFocos();
    this.mostrarMunicipios();
    // Pergunte ao mapa (ciclo 012): a pergunta pediu animação deste recorte.
    if (this.animarAoCarregar) { this.animarAoCarregar = false; this.abrirReproducao(true); }
  }

  private mostrarEstadoPontos(): void {
    const p = this.pontos;
    const e: EstadoPontos = p === 'erro' ? { tipo: 'erro' } : p === 'carregando' ? { tipo: 'carregando', lidos: 0, total: this.resultado?.resumo.principal.total ?? 0 }
      : { tipo: 'completo', total: p.length };
    renderContagemMapa(e, this.mapa?.contagem().limites ?? 0);
  }

  private aoFalharConsulta(e: unknown): void {
    this.detalheMunicipio = null;
    const tipo: TipoErro | 'inconsistente' = e instanceof ErroLente ? 'inconsistente' : e instanceof ErroConsulta ? e.tipo : 'fonte_indisponivel';
    if (tipo === 'acesso_negado' || tipo === 'sessao_expirada' || tipo === 'sem_publicacao') {
      this.tratarErroGlobal(e);
      return;
    }
    if (tipo === 'versao_substituida') {
      // R3-1: invalida já as respostas em trânsito da consulta comum e da lente, e toda a memória da carga.
      this.geracaoConsulta++;
      this.limparLente({
        memoria: true,
        estado: this.configCombinacao
          ? { tipo: 'versao_substituida' }
          : this.classeSobreposicao
            ? { tipo: 'versao_substituida', lente: true }
            : { tipo: 'cancelada', motivo: 'a versão de dados foi substituída; recarregue a versão vigente e escolha a lente de novo.' },
      });
      // A camada e os contornos eram da versão substituída.
      this.limparAreas();
    }
    this.cancelarComparacao();
    this.animarAoCarregar = false;
    this.fecharReproducao(false);
    if (modoComparacao() !== 'nenhuma') this.estadoComparacao({ tipo: 'incompleta', texto: 'A consulta do recorte A falhou; a comparação espera o recorte A.' });
    this.resultado = null;
    this.pontos = 'erro';
    this.mapa?.limparTudo();
    for (const id of ['serie-corpo', 'municipios-corpo']) $(id).replaceChildren();
    renderContagemMapa({ tipo: 'erro' }, 0);
    this.mostrarListaFocos();
    this.estado({
      tipo: tipo === 'versao_substituida' ? 'versao_substituida' : tipo === 'entrada_invalida' ? 'entrada_invalida'
        : tipo === 'inconsistente' ? 'inconsistente' : 'fonte_indisponivel',
    });
  }

  private escolherMunicipio(codigo: number | null): void {
    $<HTMLSelectElement>('f-municipio').value = codigo === null ? '' : String(codigo);
    this.aplicarFormulario();
    const titulo = $('t-municipios');
    abrirAba('municipios');
    titulo.scrollIntoView({ block: 'nearest' });
    titulo.focus();
  }

  // --- Pontos, balão e "Lista de focos" (T7, T21) ------------------------------------------------------

  /** Toque num ponto: balão com todos os registros da mesma coordenada e o anel de seleção. */
  private selecionarPonto(id: string): void {
    const p = this.pontos;
    if (!Array.isArray(p) || !this.dados) return;
    const registro = p.find((x) => x.id_tecnico === id);
    if (!registro) return;
    const mesmos = p.filter((x) => x.latitude === registro.latitude && x.longitude === registro.longitude);
    this.selecionarRegistro(id);
    this.mapa?.abrirBalao(registro.latitude, registro.longitude, balaoRegistros(mesmos, this.dados.nomes));
  }

  /** Seleção de um registro (ponto ou linha da lista): anel no mapa, linha marcada e anúncio do registro. */
  private selecionarRegistro(id: string): void {
    const p = this.pontos;
    if (!Array.isArray(p) || !this.dados) return;
    const registro = p.find((x) => x.id_tecnico === id);
    if (!registro) return;
    this.selecionado = id;
    this.mapa?.selecionarRegistro(id);
    marcarFoco(id);
    renderSelecao(registro, this.dados.nomes.get(registro.municipio_codigo) ?? null);
  }

  private alternarListaFocos(): void {
    if ($('lista-focos').hidden) this.abrirListaFocos();
    else this.fecharListaFocos();
  }

  private abrirListaFocos(): void {
    $('lista-focos').hidden = false;
    $('botao-lista-focos').setAttribute('aria-expanded', 'true');
    this.mostrarListaFocos();
    $('t-lista-focos').focus();
  }

  private fecharListaFocos(focar = true): void {
    const aberta = !$('lista-focos').hidden;
    $('lista-focos').hidden = true;
    $('botao-lista-focos').setAttribute('aria-expanded', 'false');
    if (aberta && focar) $('botao-lista-focos').focus();
  }

  private mostrarListaFocos(): void {
    if ($('lista-focos').hidden || !this.dados) return;
    renderListaFocos(this.pontos, this.paginaFocos, this.selecionado, this.dados.nomes, {
      selecionar: (id) => this.selecionarRegistro(id),
      pagina: (pagina) => {
        this.paginaFocos = pagina;
        this.mostrarListaFocos();
        document.getElementById('lista-focos-info')?.focus();
      },
    });
  }

  // --- Aba Municípios (T11) -----------------------------------------------------------------------------

  /** Destaques da lente ativa no formato da aba (células distintas ou municípios na ordem D16). */
  private destaquesAtivos(): { ativos: DestaquesAtivos; nome: string; registros: RegistroLente[] } | null {
    if (this.lente) {
      const r = this.lente.resultado;
      const registros = [...this.lente.porId.values()];
      if (r.lente === 'concentracao') {
        return { ativos: { unidade: 'municipio', municipios: r.destaques.flatMap((d) => (d.unidade.tipo === 'municipio' ? [d.unidade.codigo] : [])) }, nome: TITULO_LENTE[r.lente], registros };
      }
      return { ativos: { unidade: 'celula', recorte: r.recorte.tipo, celulas: celulasDistintas(r.destaques.flatMap((d) => (d.unidade.tipo === 'celula_005' ? [d.unidade.id] : []))) }, nome: TITULO_LENTE[r.lente], registros };
    }
    if (this.combinacao) {
      const r = this.combinacao.resultado;
      return { ativos: { unidade: 'celula', recorte: r.recorte.tipo, celulas: celulasDistintas(r.celulas.map((c) => c.unidade.id)) }, nome: 'Combinação', registros: [...this.combinacao.porId.values()] };
    }
    if (this.sobreposicao) {
      const r = this.sobreposicao.resultado;
      return { ativos: { unidade: 'celula', recorte: r.recorte.tipo, celulas: celulasDistintas(r.destaques.flatMap((d) => (d.unidade.tipo === 'celula_005' ? [d.unidade.id] : []))) }, nome: `Sobreposição · ${ROTULO_AREA[r.classe]}`, registros: [...this.sobreposicao.porId.values()] };
    }
    return null;
  }

  private mostrarMunicipios(): void {
    const r = this.resultado;
    if (!r || !this.dados) return;
    const ativos = this.destaquesAtivos();
    if (r.filtro.municipio !== null && this.detalheMunicipio?.codigo !== r.filtro.municipio) {
      this.detalheMunicipio = { codigo: r.filtro.municipio, mapa: 'ocioso' };
    }
    renderMunicipios({
      detalhe: this.detalheMunicipio,
      resumo: r.resumo, nomeMunicipio: this.nomeMunicipio(r.filtro.municipio), ordem: this.ordemMunicipios,
      ativos: ativos?.ativos ?? null, nomeLente: ativos?.nome ?? null, registrosLente: ativos?.registros ?? [], leitura: this.pontos,
    }, {
      escolher: (codigo) => this.escolherMunicipio(codigo),
      inspecionar: (codigo) => {
        this.rolagemMunicipios = $('resultado').scrollTop;
        this.detalheMunicipio = { codigo, mapa: 'ocioso' };
        this.mostrarMunicipios();
        $('municipio-detalhe-titulo').focus();
      },
      voltar: () => {
        const codigo = this.detalheMunicipio?.codigo;
        this.detalheMunicipio = null;
        this.mostrarMunicipios();
        $('resultado').scrollTop = this.rolagemMunicipios;
        document.querySelector<HTMLElement>(`#lista-municipios button[data-codigo="${codigo}"]`)?.focus({ preventScroll: true });
      },
      mostrarNoMapa: () => void this.mostrarMunicipioNoMapa(),
      verDestaques: () => {
        abrirAba('destaques');
        $('t-destaques').focus();
      },
      ordenar: (ordem) => {
        this.ordemMunicipios = ordem;
        this.mostrarMunicipios();
        document.querySelector<HTMLElement>(`[data-ordem="${ordem}"]`)?.focus();
      },
    });
  }

  /** Câmera independente das camadas e do recorte; retorno tardio nunca repõe detalhe encerrado. */
  private async mostrarMunicipioNoMapa(): Promise<void> {
    const detalhe = this.detalheMunicipio;
    const dados = this.dados;
    if (!detalhe || !dados || detalhe.mapa === 'carregando') return;
    const g = this.geracaoSessao;
    const c = this.geracaoConsulta;
    const atual = () => g === this.geracaoSessao && c === this.geracaoConsulta && this.detalheMunicipio === detalhe;
    detalhe.mapa = 'carregando';
    this.mostrarMunicipios();
    try {
      await this.carregarLimites(detalhe.codigo, atual);
      if (!atual()) return;
      const limite = this.limites.get(detalhe.codigo);
      detalhe.mapa = limite && this.mapa?.enquadrarMunicipio(limite) ? 'exibido' : 'ausente';
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'geometria') === 'global') return;
      detalhe.mapa = 'falha';
    }
    if (!atual()) return;
    this.mostrarMunicipios();
    if (detalhe.mapa === 'exibido' && !window.matchMedia('(min-width: 1180px) and (min-height: 700px)').matches) {
      $('mapa').focus({ preventScroll: true });
      $('mapa').scrollIntoView({ block: 'center' });
    }
  }

  // --- Lentes de seleção (plano 004) -----------------------------------------------------------------

  private manipuladoresLente(): ManipuladoresLente {
    return {
      tentarDeNovo: () => {
        if (this.configCombinacao) void this.aplicarCombinacao(this.configCombinacao);
        else if (this.classeSobreposicao) void this.aplicarSobreposicao(this.classeSobreposicao);
        else void this.aplicarLente();
      },
      selecionar: (id) => this.selecionarDestaque(id),
      mostrarNoMapa: (id) => this.mostrarDestaqueNoMapa(id),
      consultarMunicipio: (codigo) => this.escolherMunicipio(codigo),
      paginaEvidencia: (pagina) => {
        if (!this.lente) return;
        this.lente.paginaEvidencia = pagina;
        this.mostrarLente();
        document.getElementById('lente-evidencia-info')?.focus();
      },
    };
  }

  private estadoLente(e: EstadoLente): void {
    renderEstadoLente(e, this.manipuladoresLente());
    // Sem resumo (calculando, janela insuficiente, falha), o título ainda diz qual opção está ativa.
    if ($('resumo-lente').hidden) $('t-destaques').textContent = TITULO_OPCAO[lenteEscolhida()] ?? 'Lentes';
  }

  /** Invalida o cálculo em curso e limpa lista, camada, explicação e (se pedido) a memória de recortes. */
  private limparLente(o: { memoria: boolean; estado: EstadoLente }): void {
    this.geracaoLente++;
    this.lente = null;
    this.combinacao = null;
    this.configCombinacao = null;
    this.sobreposicao = null;
    this.classeSobreposicao = null;
    this.pedidoLente = null;
    if (o.estado.tipo !== 'carregando') this.lentePendente = false;
    if (o.memoria) {
      this.memoria.limpar();
      this.leiturasEmVoo.clear();
    }
    this.mapa?.limparDestaques();
    // Contornos reais e área selecionada exibidos pela lente saem com ela.
    this.mapa?.definirContornos([]);
    this.areaSelecionada = null;
    renderAreaSelecionada(null, () => {});
    limparCorpoLente();
    this.estadoLente(o.estado);
    this.mostrarMunicipios();
    this.atualizarPerguntas();
  }

  private fontesLente(): FontesLente {
    const c = this.sessao.cliente;
    return {
      resumo: (f) => consultarResumo(c, f),
      pagina: (f, limite, deslocamento) => consultarDeteccoes(c, f, limite, deslocamento),
      disponibilidade: (f) => consultarDisponibilidade(c, f),
    };
  }

  /**
   * Leitura de uma lente no recorte aplicado (plano 007, T1) com a memória T6: o resumo é sempre relido; páginas já
   * lidas e conferidas no mesmo recorte e com o mesmo total são reaproveitadas, sem nova requisição.
   */
  private async lerParaLente(pedido: PedidoLente, atual: () => boolean): Promise<LeituraRecorte | null> {
    const chave = chaveRecorte(this.geracaoSessao, { carga: pedido.carga, inicio: pedido.janela.inicio, fim: pedido.janela.fim, municipio: pedido.municipio ?? null });
    // Leitura do mesmo recorte ainda em curso na consulta: espera por ela em vez de ler as páginas de novo. Uma falha
    // nela não é desta lente, que então lê por conta própria; o resumo é relido de todo jeito (T6).
    const emVoo = this.memoria.obter(chave) ? undefined : this.leiturasEmVoo.get(chave);
    if (emVoo) {
      this.estadoLente({ tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 });
      await emVoo.catch(() => null);
      if (!atual()) return null;
    }
    const anterior = this.memoria.obter(chave);
    const lido = await lerRegistros(this.fontesLente(), pedido, atual,
      (feitos, total) => { if (atual()) this.estadoLente({ tipo: 'carregando', etapa: 'registros', feitos, total }); },
      anterior);
    if (!lido || !atual()) return null;
    if (lido.reaproveitado && anterior) return anterior;
    return this.memoria.guardar({ chave, registros: lido.registros, totalResumo: lido.totalResumo, disponibilidade: new Map() });
  }

  /** Erro numa chamada da lente (R2-1): sessão, acesso e versão nunca ficam locais. */
  private erroDaLente(e: unknown, origem: OrigemChamada): 'global' | 'local' {
    const tipo = e instanceof ErroLente ? 'leitura_inconsistente' : e instanceof ErroConsulta ? e.tipo : 'fonte_indisponivel';
    const destino = destinoErro(tipo, origem);
    if (destino === 'global') {
      this.tratarErroGlobal(e);
      return 'global';
    }
    if (destino === 'versao') {
      this.aoFalharConsulta(new ErroConsulta('versao_substituida', 'carga_indisponivel'));
      return 'global';
    }
    return 'local';
  }

  private mostrarLente(): void {
    const l = this.lente;
    if (!l || !this.dados) return;
    renderResultadoLente(l.resultado, l.selecionado,
      { nomes: this.dados.nomes, registros: l.porId, paginaEvidencia: l.paginaEvidencia }, this.manipuladoresLente());
    this.atualizarPerguntas();
  }

  private async mostrarDestaqueNoMapa(id: string): Promise<boolean> {
    const atual = () => (this.lente?.selecionado ?? this.combinacao?.selecionado ?? this.sobreposicao?.selecionado) === id;
    if (this.mapaComB) {
      await this.restaurarMapaA();
      renderLadoNoMapa(null);
    }
    if (!atual() || !this.mapa?.selecionarDestaque(id)) return false;
    if (!window.matchMedia('(min-width: 1180px) and (min-height: 700px)').matches) {
      $('mapa').focus({ preventScroll: true });
      $('mapa').scrollIntoView({ block: 'center' });
    }
    return true;
  }

  /** Antes de abrir uma explicação: guarda a rolagem da lista e mostra a aba Destaques. */
  private prepararExplicacao(): void {
    // Abrir um destaque reduz o mapa ampliado, para a explicação aparecer (T17).
    if (mapaAmpliado()) this.ampliarMapa(false, false);
    if (!explicacaoAberta()) this.rolagemLista = $('resultado').scrollTop;
    abrirAba('destaques');
  }

  private selecionarDestaque(id: string): void {
    if (this.mapaComB) {
      this.abrirUnidadeComparacao(id);
      return;
    }
    if (this.sobreposicao) {
      this.selecionarCelulaSobreposicao(id);
      return;
    }
    if (this.combinacao) {
      this.selecionarCelula(id);
      return;
    }
    const l = this.lente;
    if (!l || !l.resultado.destaques.some((d) => d.id_destaque === id)) return;
    this.prepararExplicacao();
    l.selecionado = id;
    l.paginaEvidencia = 0;
    this.mostrarLente();
    this.mapa?.selecionarDestaque(id);
    document.getElementById('lente-painel-titulo')?.focus();
  }

  /** "← Voltar aos destaques": a lista volta no mesmo ponto, com o foco no item que estava aberto. */
  private voltarAosDestaques(): void {
    let id: string | null = null;
    if (this.lente) { id = this.lente.selecionado; this.lente.selecionado = null; this.mostrarLente(); }
    else if (this.combinacao) { id = this.combinacao.selecionado; this.combinacao.selecionado = null; this.mostrarCombinacao(); }
    else if (this.sobreposicao) {
      id = this.sobreposicao.selecionado;
      this.sobreposicao.selecionado = null;
      this.mapa?.definirContornos([]);
      this.mostrarSobreposicao();
    }
    this.mapa?.selecionarDestaque(null);
    $('resultado').scrollTop = this.rolagemLista;
    const alvo = id ? document.querySelector<HTMLElement>(`#lente-destaques button[data-id="${CSS.escape(id)}"]`) : null;
    (alvo ?? $('t-destaques')).focus({ preventScroll: true });
  }

  /** Configuração atual do formulário da lente; incompleta devolve o texto do que falta (T16). */
  private async aplicarLente(): Promise<void> {
    this.lentePendente = false;
    const dados = this.dados;
    const escolhida = lenteEscolhida();
    if (escolhida === 'combinacao') {
      const config = this.lerConfigCombinacao();
      if (!config) {
        const texto = this.concentracaoRetirada && this.aplicado?.municipio != null
          ? 'Com município, a concentração sai da combinação: escolha outra lente.'
          : 'Escolha pelo menos 2 lentes para combinar.';
        this.limparLente({ memoria: false, estado: { tipo: 'incompleta', texto } });
        return;
      }
      await this.aplicarCombinacao(config);
      return;
    }
    if (escolhida === 'sobreposicao') {
      const marcada = document.querySelector<HTMLInputElement>('input[name="l-classe"]:checked')?.value;
      const classe = CLASSES_AREA.find((c) => c === marcada);
      if (!classe) {
        this.limparLente({ memoria: false, estado: { tipo: 'incompleta', texto: 'Escolha a classe de área protegida.' } });
        return;
      }
      await this.aplicarSobreposicao(classe);
      return;
    }
    if (!Object.hasOwn(LENTES, escolhida)) {
      this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
      return;
    }
    const calcular = LENTES[escolhida as keyof typeof LENTES];
    // Recorte aplicado inteiro (T16): período e município (plano 007, T1).
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
    const pedido: PedidoLente = { carga: dados.carga.id, janela: { inicio: filtro.inicio, fim: filtro.fim }, municipio: filtro.municipio };
    this.pedidoLente = pedido;
    const g = this.geracaoSessao;
    const gl = this.geracaoLente;
    const atual = () => g === this.geracaoSessao && gl === this.geracaoLente;
    const inicio = performance.now();
    let resultado: ResultadoLente;
    let mem: LeituraRecorte;
    let porId: Map<string, RegistroLente>;
    try {
      const lido = await this.lerParaLente(pedido, atual);
      if (!lido) return;
      mem = lido;
      resultado = calcular({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: pedido.janela,
        registros: mem.registros, totalResumo: mem.totalResumo, nomes: dados.nomes, recorte: recorteDe(pedido.municipio),
      });
      porId = new Map(mem.registros.map((x) => [x.id_tecnico, x]));
      if (resultado.lente === 'recorrencia' && resultado.destaques.some((d) =>
        evidenciaMensal(resultado.janela, d.evidencia.deteccoes, porId) === null)) {
        throw new ErroLente('a evidência das células não corresponde aos meses GMT da janela');
      }
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.mapa?.limparDestaques();
      limparCorpoLente();
      this.estadoLente(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }

    // Disponibilidade já validada nesta memória + a deste cálculo (falhas não são guardadas).
    const disponibilidade = new Map(mem.disponibilidade);
    this.lente = {
      pedido, resultado: qualificar(resultado, disponibilidade), selecionado: null, paginaEvidencia: 0,
      porId,
    };
    this.mostrarLente();
    this.mostrarMunicipios();

    let contornoFalhou = false;
    const contornos = this.desenharDestaques(resultado, atual).catch((e: unknown) => {
      if (atual() && this.erroDaLente(e, 'geometria') === 'local') contornoFalhou = true;
    });
    const faltam = municipiosNecessarios(resultado).filter((c) => !disponibilidade.has(c));
    let feitos = 0;
    const redesenhar = limitador(INTERVALO_QUALIFICACAO_MS);
    if (faltam.length) this.estadoLente({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: faltam.length });
    await emParalelo(faltam, CONCORRENCIA_DISPONIBILIDADE, atual, async (codigo) => {
      let d: DisponibilidadeMunicipio;
      try {
        const resp = await consultarDisponibilidade(this.sessao.cliente,
          { carga: pedido.carga, inicio: pedido.janela.inicio, fim: pedido.janela.fim, municipio: codigo });
        if (!atual()) return;
        d = { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, dados.carga.satelite, resp) };
        mem.disponibilidade.set(codigo, d);
      } catch (e) {
        if (!atual() || this.erroDaLente(e, 'disponibilidade') === 'global') return;
        d = { estado: 'falha', motivo: e instanceof ErroLente ? e.message : 'fonte indisponível' };
      }
      disponibilidade.set(codigo, d);
      feitos += 1;
      if (!this.lente) return;
      // Redesenho da qualificação no máximo a cada INTERVALO_QUALIFICACAO_MS ms; o progresso segue por resposta.
      if (redesenhar()) {
        this.lente.resultado = qualificar(resultado, disponibilidade);
        this.mostrarLente();
      }
      this.estadoLente({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: faltam.length });
    });
    await contornos;
    if (!atual() || !this.lente) return;
    this.lente.resultado = qualificar(resultado, disponibilidade);
    this.mostrarLente();
    const segundos = (performance.now() - inicio) / 1000;
    if (resultado.estado === 'janela_insuficiente') this.estadoLente({ tipo: 'janela_insuficiente', segundos, texto: resultado.observacoes[0] ?? '' });
    else if (resultado.estado === 'sem_destaques') this.estadoLente({ tipo: 'sem_destaques', segundos });
    else if (estadoQualificacao(this.lente.resultado) !== 'completa') this.estadoLente({ tipo: 'cobertura_nao_verificada' });
    else if (contornoFalhou) this.estadoLente({ tipo: 'contorno_indisponivel' });
    else this.estadoLente({ tipo: 'completo', segundos });
  }

  /** Desenha os destaques no mapa; na concentração, com a geometria de exibição de cada município. */
  private async desenharDestaques(r: ResultadoLente, atual: () => boolean): Promise<void> {
    await this.desenharUnidades(r.destaques.map((d) => ({ id: d.id_destaque, unidade: d.unidade })), atual);
  }

  /** Unidades no mapa: município pela geometria de exibição (lida sob demanda), célula pelo retângulo da grade. */
  private async desenharUnidades(itens: { id: string; unidade: Unidade }[], atual: () => boolean): Promise<void> {
    if (!this.mapa || !this.dados) return;
    const codigos = itens.flatMap((d) => (d.unidade.tipo === 'municipio' ? [d.unidade.codigo] : []));
    let erro: unknown = null;
    await emParalelo(codigos.filter((c) => !this.limites.has(c)), CONCORRENCIA_DISPONIBILIDADE, atual, async (codigo) => {
      try {
        const lidos = await lerLimites(this.sessao.cliente, this.dados?.carga.id ?? -1, codigo);
        if (!atual()) return;
        for (const l of lidos) this.limites.set(l.codigo, l);
      } catch (e) {
        erro ??= e;
      }
    });
    if (!atual()) return;
    this.mapa.definirDestaques(itens.flatMap((d): DestaqueMapa[] => {
      if (d.unidade.tipo === 'municipio') {
        const l = this.limites.get(d.unidade.codigo);
        return l ? [{ id: d.id, geometria: l.geometria_exibicao }] : [];
      }
      return [{ id: d.id, retangulo: retangulo(d.unidade) }];
    }));
    this.mapa.enquadrarDestaques();
    if (erro !== null) throw erro;
  }

  // --- Combinação de lentes (plano 005, item 2) -----------------------------------------------------

  /** Lentes marcadas (na ordem canônica) e operador escolhido no formulário. */
  private lerFormularioCombinacao(): { lentes: TipoLente[]; operador: string } {
    const marcadas = new Set([...document.querySelectorAll<HTMLInputElement>('input[name="l-comb"]:checked')].map((x) => x.value));
    const operador = document.querySelector<HTMLInputElement>('input[name="l-operador"]:checked')?.value ?? 'e';
    return { lentes: LENTES_CANONICAS.filter((l) => marcadas.has(l)), operador };
  }

  private lerConfigCombinacao(): ConfigCombinacao | null {
    const f = this.lerFormularioCombinacao();
    if (f.lentes.length < 2) return null;
    return validarEscolha(f.lentes, f.operador);
  }

  private manipuladoresCombinacao(): ManipuladoresCombinacao {
    return {
      selecionar: (id) => this.selecionarCelula(id),
      mostrarNoMapa: (id) => this.mostrarDestaqueNoMapa(id),
      pagina: (pagina) => {
        if (!this.combinacao) return;
        this.combinacao.pagina = paginaValida(pagina, this.combinacao.resultado.celulas.length);
        this.mostrarCombinacao();
        document.getElementById('lente-celulas-info')?.focus();
      },
      paginaEvidencia: (pagina) => {
        if (!this.combinacao) return;
        this.combinacao.paginaEvidencia = pagina;
        this.mostrarCombinacao();
        document.getElementById('lente-evidencia-info')?.focus();
      },
    };
  }

  private mostrarCombinacao(): void {
    const c = this.combinacao;
    if (!c || !this.dados) return;
    renderResultadoCombinacao(c.resultado, c.selecionado,
      {
        nomes: this.dados.nomes, registros: c.porId, pagina: c.pagina, paginaEvidencia: c.paginaEvidencia,
        noMapa: this.mapa?.contagem().destaques ?? 0,
      },
      this.manipuladoresCombinacao());
    this.atualizarPerguntas();
  }

  /** Seleciona a célula (pela lista ou pelo mapa) e leva a lista à página dela. */
  private selecionarCelula(id: string): void {
    const c = this.combinacao;
    if (!c) return;
    const i = c.resultado.celulas.findIndex((x) => x.id_combinado === id);
    if (i < 0) return;
    this.prepararExplicacao();
    c.selecionado = id;
    c.pagina = Math.floor(i / CELULAS_POR_PAGINA);
    c.paginaEvidencia = 0;
    this.mostrarCombinacao();
    this.mapa?.selecionarDestaque(id);
    document.getElementById('lente-painel-titulo')?.focus();
  }

  /**
   * Uma leitura (com a memória T6), `combinar` sobre a entrada conferida (T8), que calcula as lentes escolhidas, e a
   * disponibilidade dos municípios das células. A configuração fica gravada no resultado.
   */
  private async aplicarCombinacao(config: ConfigCombinacao): Promise<void> {
    const dados = this.dados;
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
    this.configCombinacao = config;
    const pedido: PedidoLente = { carga: dados.carga.id, janela: { inicio: filtro.inicio, fim: filtro.fim }, municipio: filtro.municipio };
    this.pedidoLente = pedido;
    const g = this.geracaoSessao;
    const gl = this.geracaoLente;
    const atual = () => g === this.geracaoSessao && gl === this.geracaoLente;
    const inicio = performance.now();
    let resultado: ResultadoCombinacao;
    let mem: LeituraRecorte;
    try {
      const lido = await this.lerParaLente(pedido, atual);
      if (!lido) return;
      mem = lido;
      resultado = combinar({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: pedido.janela,
        registros: mem.registros, totalResumo: mem.totalResumo, nomes: dados.nomes, recorte: recorteDe(pedido.municipio),
      }, config.lentes, config.operador);
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.mapa?.limparDestaques();
      limparCorpoLente();
      this.estadoLente(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }

    const disponibilidade = new Map(mem.disponibilidade);
    this.combinacao = {
      pedido, resultado: qualificarCombinacao(resultado, disponibilidade), selecionado: null, pagina: 0, paginaEvidencia: 0,
      porId: new Map(mem.registros.map((x) => [x.id_tecnico, x])),
    };
    if (this.mapa) {
      this.mapa.definirDestaques(resultado.celulas.map((c): DestaqueMapa => ({
        id: c.id_combinado,
        retangulo: [[Number(c.unidade.sul), Number(c.unidade.oeste)], [Number(c.unidade.norte), Number(c.unidade.leste)]],
      })));
      this.mapa.enquadrarDestaques();
    }
    this.mostrarCombinacao();
    this.mostrarMunicipios();

    const faltam = municipiosDaCombinacao(resultado).filter((c) => !disponibilidade.has(c));
    let feitos = 0;
    const redesenhar = limitador(INTERVALO_QUALIFICACAO_MS);
    if (faltam.length) this.estadoLente({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: faltam.length });
    await emParalelo(faltam, CONCORRENCIA_DISPONIBILIDADE, atual, async (codigo) => {
      let d: DisponibilidadeMunicipio;
      try {
        const resp = await consultarDisponibilidade(this.sessao.cliente,
          { carga: pedido.carga, inicio: pedido.janela.inicio, fim: pedido.janela.fim, municipio: codigo });
        if (!atual()) return;
        d = { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, dados.carga.satelite, resp) };
        mem.disponibilidade.set(codigo, d);
      } catch (e) {
        if (!atual() || this.erroDaLente(e, 'disponibilidade') === 'global') return;
        d = { estado: 'falha', motivo: e instanceof ErroLente ? e.message : 'fonte indisponível' };
      }
      disponibilidade.set(codigo, d);
      feitos += 1;
      if (!this.combinacao) return;
      // Redesenho da qualificação no máximo a cada INTERVALO_QUALIFICACAO_MS ms; o progresso segue por resposta.
      if (redesenhar()) {
        this.combinacao.resultado = qualificarCombinacao(resultado, disponibilidade);
        this.mostrarCombinacao();
      }
      this.estadoLente({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: faltam.length });
    });
    if (!atual() || !this.combinacao) return;
    this.combinacao.resultado = qualificarCombinacao(resultado, disponibilidade);
    this.mostrarCombinacao();
    const segundos = (performance.now() - inicio) / 1000;
    const final = this.combinacao.resultado;
    if (final.estado === 'indisponivel') this.estadoLente({ tipo: 'indisponivel', segundos, textos: final.indisponibilidade.map((x) => x.texto) });
    else if (final.estado === 'sem_celulas') this.estadoLente({ tipo: final.operador === 'e' ? 'sem_celulas_em_comum' : 'sem_celulas_destacadas', segundos });
    else if (final.celulas.some((c) => c.cobertura.estado !== 'completa')) this.estadoLente({ tipo: 'cobertura_nao_verificada', combinacao: true });
    else this.estadoLente({ tipo: 'completo', segundos, combinacao: true });
  }

  // --- Sobreposição com áreas protegidas (plano 006, item 4) -------------------------------------------

  private manipuladoresSobreposicao(): ManipuladoresSobreposicao {
    return {
      selecionar: (id) => this.selecionarCelulaSobreposicao(id),
      mostrarNoMapa: (id) => this.mostrarDestaqueNoMapa(id),
      pagina: (pagina) => {
        if (!this.sobreposicao) return;
        this.sobreposicao.pagina = paginaValida(pagina, this.sobreposicao.resultado.destaques.length);
        this.mostrarSobreposicao();
        document.getElementById('lente-celulas-info')?.focus();
      },
      paginaEvidencia: (pagina) => {
        if (!this.sobreposicao) return;
        this.sobreposicao.paginaEvidencia = pagina;
        this.mostrarSobreposicao();
        document.getElementById('lente-evidencia-info')?.focus();
      },
      selecionarArea: (a: AreaSobreposicao) => this.selecionarArea({
        chave: a.chave, nome: a.nome, classe: a.classe, categoria_ou_fase: a.categoria_ou_fase, esfera: a.esfera,
        qualidade_poligono: a.qualidade_poligono,
      }),
    };
  }

  private mostrarSobreposicao(): void {
    const s = this.sobreposicao;
    if (!s || !this.dados) return;
    renderResultadoSobreposicao(s.resultado, s.selecionado, {
      nomes: this.dados.nomes, registros: s.porId, pagina: s.pagina, paginaEvidencia: s.paginaEvidencia,
      noMapa: this.mapa?.contagem().destaques ?? 0, contornos: s.contornos,
    }, this.manipuladoresSobreposicao());
    this.atualizarPerguntas();
  }

  /** Abre a célula (pela lista ou pelo mapa) e baixa o contorno real de cada área citada (R1-6). */
  private selecionarCelulaSobreposicao(id: string): void {
    const s = this.sobreposicao;
    if (!s) return;
    const i = s.resultado.destaques.findIndex((d) => d.id_destaque === id);
    const d = s.resultado.destaques[i];
    if (!d) return;
    this.prepararExplicacao();
    s.selecionado = id;
    s.pagina = Math.floor(i / CELULAS_POR_PAGINA);
    s.paginaEvidencia = 0;
    s.contornos = 'carregando';
    this.mostrarSobreposicao();
    this.mapa?.selecionarDestaque(id);
    document.getElementById('lente-painel-titulo')?.focus();
    void this.abrirContornosDaCelula(s, d);
  }

  private async abrirContornosDaCelula(s: SobreposicaoAplicada, d: DestaqueSobreposicao): Promise<void> {
    const g = this.geracaoSessao;
    const atual = () => g === this.geracaoSessao && this.sobreposicao === s && s.selecionado === d.id_destaque;
    let estado: EstadoContorno;
    try {
      const itens = await this.obterContornos(s.pedido.carga, d.areas.map((a) => ({ chave: a.chave, classe: a.classe })),
        () => g === this.geracaoSessao);
      if (!atual()) return;
      this.mapa?.definirContornos(itens);
      estado = 'exibido';
    } catch (e) {
      if (g !== this.geracaoSessao || this.erroDaLente(e, 'geometria') === 'global' || !atual()) return;
      this.mapa?.definirContornos([]);
      estado = 'falha';
    }
    s.contornos = estado;
    atualizarContornosPainel(estado);
  }

  /** Contornos reais das áreas pedidas, uma requisição por área ainda não lida nesta carga e sessão. */
  private async obterContornos(carga: number, areas: { chave: string; classe: ClasseArea }[], atual: () => boolean): Promise<AreaMapa[]> {
    const lidos = new Map<string, unknown>();
    let erro: unknown = null;
    await emParalelo(areas, CONCORRENCIA_DISPONIBILIDADE, atual, async (a) => {
      try {
        lidos.set(a.chave, await this.contornoReal(carga, a.chave));
      } catch (e) {
        erro ??= e;
      }
    });
    if (erro !== null) throw erro;
    return areas.flatMap((a) => (lidos.has(a.chave) ? [{ chave: a.chave, classe: a.classe, geometria: lidos.get(a.chave) }] : []));
  }

  private contornoReal(carga: number, chave: string): Promise<unknown> {
    const k = `${carga}|${chave}`;
    const existente = this.contornos.get(k);
    if (existente) return existente;
    const cliente = this.sessao.cliente;
    const separador = chave.indexOf(':');
    const pedido = (async () => {
      const geometria = await lerContornoReal(cliente, carga, chave.slice(0, separador), chave.slice(separador + 1));
      // Linha oculta: a RLS a esconde tanto na perda de acesso quanto na troca de versão (R2-3).
      return geometria ?? diagnosticarAusencia(fontesAreas(cliente), carga);
    })();
    this.contornos.set(k, pedido);
    // Falha não fica na memória: a próxima abertura tenta de novo.
    pedido.catch(() => { if (this.contornos.get(k) === pedido) this.contornos.delete(k); });
    return pedido;
  }

  /**
   * Leitura dos registros (com a memória T6), da camada da carga por T25 (sem geometria), a lente (T22) sobre a
   * entrada conferida e a disponibilidade dos municípios das células (D13). Uma classe por cálculo.
   */
  private async aplicarSobreposicao(classe: ClasseArea): Promise<void> {
    const dados = this.dados;
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
    this.classeSobreposicao = classe;
    const pedido: PedidoLente = { carga: dados.carga.id, janela: { inicio: filtro.inicio, fim: filtro.fim }, municipio: filtro.municipio };
    this.pedidoLente = pedido;
    const g = this.geracaoSessao;
    const gl = this.geracaoLente;
    const atual = () => g === this.geracaoSessao && gl === this.geracaoLente;
    const inicio = performance.now();
    let resultado: ResultadoSobreposicao;
    let mem: LeituraRecorte;
    try {
      const lido = await this.lerParaLente(pedido, atual);
      if (!lido) return;
      mem = lido;
      this.estadoLente({ tipo: 'carregando', etapa: 'areas', feitos: 0, total: 0 });
      const camada = await lerAreas(fontesAreas(this.sessao.cliente), pedido.carga, atual);
      if (!camada || !atual()) return;
      resultado = sobreposicao({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: pedido.janela,
        registros: mem.registros, totalResumo: mem.totalResumo, nomes: dados.nomes, recorte: recorteDe(pedido.municipio),
      }, camada, classe);
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.mapa?.limparDestaques();
      limparCorpoLente();
      this.estadoLente(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }

    const disponibilidade = new Map(mem.disponibilidade);
    this.sobreposicao = {
      pedido, resultado: qualificarSobreposicao(resultado, disponibilidade), selecionado: null, pagina: 0, paginaEvidencia: 0,
      porId: new Map(mem.registros.map((x) => [x.id_tecnico, x])), contornos: 'nenhum',
    };
    if (this.mapa) {
      this.mapa.definirDestaques(resultado.destaques.flatMap((d): DestaqueMapa[] => (d.unidade.tipo === 'celula_005'
        ? [{ id: d.id_destaque, retangulo: [[Number(d.unidade.sul), Number(d.unidade.oeste)], [Number(d.unidade.norte), Number(d.unidade.leste)]] }]
        : [])));
      this.mapa.enquadrarDestaques();
    }
    this.mostrarSobreposicao();
    this.mostrarMunicipios();
    if (resultado.estado === 'sem_camada') {
      this.estadoLente({ tipo: 'sem_camada', segundos: (performance.now() - inicio) / 1000 });
      return;
    }

    const faltam = municipiosDaSobreposicao(resultado).filter((c) => !disponibilidade.has(c));
    let feitos = 0;
    const redesenhar = limitador(INTERVALO_QUALIFICACAO_MS);
    if (faltam.length) this.estadoLente({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: faltam.length });
    await emParalelo(faltam, CONCORRENCIA_DISPONIBILIDADE, atual, async (codigo) => {
      let d: DisponibilidadeMunicipio;
      try {
        const resp = await consultarDisponibilidade(this.sessao.cliente,
          { carga: pedido.carga, inicio: pedido.janela.inicio, fim: pedido.janela.fim, municipio: codigo });
        if (!atual()) return;
        d = { estado: 'ok', dias: validarDisponibilidade(pedido, codigo, dados.carga.satelite, resp) };
        mem.disponibilidade.set(codigo, d);
      } catch (e) {
        if (!atual() || this.erroDaLente(e, 'disponibilidade') === 'global') return;
        d = { estado: 'falha', motivo: e instanceof ErroLente ? e.message : 'fonte indisponível' };
      }
      disponibilidade.set(codigo, d);
      feitos += 1;
      if (!this.sobreposicao) return;
      // Redesenho da qualificação no máximo a cada INTERVALO_QUALIFICACAO_MS ms; o progresso segue por resposta.
      if (redesenhar()) {
        this.sobreposicao.resultado = qualificarSobreposicao(resultado, disponibilidade);
        this.mostrarSobreposicao();
      }
      this.estadoLente({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: faltam.length });
    });
    if (!atual() || !this.sobreposicao) return;
    this.sobreposicao.resultado = qualificarSobreposicao(resultado, disponibilidade);
    this.mostrarSobreposicao();
    const segundos = (performance.now() - inicio) / 1000;
    if (resultado.estado === 'sem_destaques') this.estadoLente({ tipo: 'sem_destaques', segundos });
    else if (this.sobreposicao.resultado.destaques.some((d) => d.cobertura.estado !== 'completa')) this.estadoLente({ tipo: 'cobertura_nao_verificada' });
    else this.estadoLente({ tipo: 'completo', segundos });
  }

  // --- Comparação de períodos e municípios (plano 008, item 1; KB-007) --------------------------------------------

  /** Modo escolhido: mostra os campos do modo, preenche um B padrão, abre a aba e calcula. */
  private aoMudarModoComparacao(): void {
    const modo = modoComparacao();
    $('comparar-periodos').hidden = modo !== 'periodos';
    $('comparar-municipios').hidden = modo !== 'municipios';
    if (modo === 'periodos') this.periodoBPadrao();
    this.atualizarLimpar();
    void this.compararAgora();
    if (modo !== 'nenhuma') abrirAba('comparacao');
  }

  private aoMudarLenteComparacao(): void {
    if (modoComparacao() !== 'nenhuma') void this.compararAgora();
  }

  /** B padrão: o período imediatamente anterior a A, com a mesma duração; se não couber na versão, o seguinte. */
  private periodoBPadrao(): void {
    const a = this.aplicado;
    const j = this.dados?.janela;
    const inicioB = $<HTMLInputElement>('cmp-b-inicio');
    const fimB = $<HTMLInputElement>('cmp-b-fim');
    if (!a || !j || (inicioB.value && fimB.value)) return;
    const n = duracaoDias({ inicio: a.inicio, fim: a.fim });
    const dia = (base: string, passo: number) => new Date(Date.parse(`${base}T00:00:00Z`) + passo * 86_400_000).toISOString().slice(0, 10);
    const antes = { inicio: dia(a.inicio, -n), fim: dia(a.inicio, -1) };
    const depois = { inicio: dia(a.fim, 1), fim: dia(a.fim, n) };
    const b = antes.inicio >= j.inicio ? antes : depois.fim <= j.fim ? depois : null;
    if (!b) return;
    inicioB.value = b.inicio;
    fimB.value = b.fim;
  }

  /** Notas do lado A nos campos de comparação (sempre o recorte aplicado). */
  private mostrarLadoA(): void {
    const a = this.aplicado;
    if (!a) return;
    $('cmp-a-periodo').textContent = `A: período aplicado na Consulta, ${textoJanela(a)} (${duracaoDias(a)} dias GMT).`;
    $('cmp-a-municipio').textContent = a.municipio === null
      ? 'Escolha um município na Consulta para ser o A.'
      : `A: ${this.nomeMunicipio(a.municipio) ?? ''}, o município da Consulta.`;
  }

  private mostrarErroComparacao(texto: string | null): void {
    const e = $('cmp-erro');
    e.textContent = texto ?? '';
    e.hidden = texto === null;
  }

  private estadoComparacao(e: EstadoComparacao): void {
    renderEstadoComparacao(e, () => void this.compararAgora());
  }

  /** Volta o mapa ao recorte aplicado (lado A): pontos e destaques da lente comum. */
  private async restaurarMapaA(): Promise<void> {
    if (!this.mapaComB) return;
    this.mapaComB = false;
    this.mapa?.fecharBalao();
    if (Array.isArray(this.pontos)) this.mapa?.definirPontos(this.pontos);
    this.mapa?.limparDestaques();
    if (this.lente) await this.desenharDestaques(this.lente.resultado, () => !this.mapaComB).catch(() => {});
    else if (this.combinacao) this.mapa?.definirDestaques(this.combinacao.resultado.celulas.map((c) => ({ id: c.id_combinado, retangulo: retangulo(c.unidade) })));
    else if (this.sobreposicao) {
      this.mapa?.definirDestaques(this.sobreposicao.resultado.destaques.flatMap((d): DestaqueMapa[] => (d.unidade.tipo === 'celula_005' ? [{ id: d.id_destaque, retangulo: retangulo(d.unidade) }] : [])));
    }
  }

  /** Descarta o cálculo em curso e o resultado exibido; o modo escolhido continua (troca de recorte, falha de A). */
  private cancelarComparacao(): void {
    this.geracaoComparacao++;
    this.comparacao = null;
    void this.restaurarMapaA();
    renderLadoNoMapa(null);
    if (modoComparacao() !== 'nenhuma') this.estadoComparacao({ tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 });
    this.atualizarPerguntas();
  }

  /** Sessão, versão ou "Limpar tudo": sem comparação, campos vazios e a aba fora da coluna. */
  private redefinirComparacao(): void {
    const nenhuma = document.querySelector<HTMLInputElement>('input[name="c-modo"][value="nenhuma"]');
    if (nenhuma) nenhuma.checked = true;
    this.cancelarComparacao();
    for (const id of ['cmp-b-inicio', 'cmp-b-fim', 'cmp-municipio-b']) $<HTMLInputElement>(id).value = '';
    $('comparar-periodos').hidden = true;
    $('comparar-municipios').hidden = true;
    this.mostrarErroComparacao(null);
    this.estadoComparacao({ tipo: 'nenhuma' });
    mostrarAbaComparacao(false);
    if (abaAberta() === 'comparacao') abrirAba('municipios');
  }

  /** Lente do formulário para os dois lados; `{ incompleta }` quando falta escolha (nada é calculado). */
  private lenteDaComparacao(): LenteComparacao | null | { incompleta: string } {
    const escolhida = lenteEscolhida();
    if (escolhida === 'nenhuma') return null;
    if (escolhida === 'combinacao') {
      const config = this.lerConfigCombinacao();
      if (!config) return { incompleta: 'Escolha pelo menos 2 lentes para combinar.' };
      return {
        nome: `Combinação (${config.lentes.map((l) => TITULO_LENTE[l]).join(config.operador === 'e' ? ' e ' : ' ou ')})`,
        calcular: (e) => combinar(e, config.lentes, config.operador), sobreposicao: false, combinacao: config,
      };
    }
    if (escolhida === 'sobreposicao') {
      const marcada = document.querySelector<HTMLInputElement>('input[name="l-classe"]:checked')?.value;
      const classe = CLASSES_AREA.find((c) => c === marcada);
      if (!classe) return { incompleta: 'Escolha a classe de área protegida.' };
      return {
        nome: `Sobreposição · ${ROTULO_AREA[classe]}`, sobreposicao: true, combinacao: null,
        calcular: (e, camada) => {
          if (!camada) throw new ErroLente('camada de áreas não lida');
          return sobreposicao(e, camada, classe);
        },
      };
    }
    if (!Object.hasOwn(LENTES, escolhida)) return null;
    const lente = escolhida as keyof typeof LENTES;
    return { nome: TITULO_LENTE[lente], calcular: (e) => LENTES[lente](e), sobreposicao: false, combinacao: null };
  }

  /**
   * Leitura completa e conferida de um recorte, com a memória T6: o resumo é sempre relido; páginas já lidas no mesmo
   * recorte e com o mesmo total são reaproveitadas. Nada parcial sai daqui.
   */
  private async lerRecorteComparacao(
    filtro: Filtro,
    atual: () => boolean,
    progresso: (lidos: number, total: number) => void,
  ): Promise<{ pedido: PedidoLente; resumo: Resumo; leitura: LeituraRecorte } | null> {
    const pedido: PedidoLente = { carga: filtro.carga, janela: { inicio: filtro.inicio, fim: filtro.fim }, municipio: filtro.municipio };
    const chave = chaveRecorte(this.geracaoSessao, filtro);
    const emVoo = this.memoria.obter(chave) ? undefined : this.leiturasEmVoo.get(chave);
    if (emVoo) {
      await emVoo.catch(() => null);
      if (!atual()) return null;
    }
    const resumo = await consultarResumo(this.sessao.cliente, filtro);
    if (!atual()) return null;
    const total = validarResumo(pedido, resumo);
    let leitura = this.memoria.obter(chave);
    if (!leitura || leitura.totalResumo !== total || leitura.registros.length !== total) {
      const registros = await lerPaginas(this.fontesLente(), pedido, total, atual, progresso);
      if (!registros || !atual()) return null;
      leitura = this.memoria.guardar({ chave, registros, totalResumo: total, disponibilidade: leitura?.disponibilidade ?? new Map() });
    } else progresso(total, total);
    return { pedido, resumo, leitura };
  }

  /**
   * Calcula a comparação do modo escolhido: valida o pedido, lê os dois lados (mesma carga), aplica a mesma lente em
   * cada um, mostra o resultado inicial e qualifica com a disponibilidade, em concorrência global 4 (T3, T6, R3-1).
   */
  private async compararAgora(): Promise<void> {
    this.cancelarComparacao();
    const modo = modoComparacao();
    this.mostrarLadoA();
    this.mostrarErroComparacao(null);
    mostrarAbaComparacao(modo !== 'nenhuma');
    if (modo === 'nenhuma') {
      this.estadoComparacao({ tipo: 'nenhuma' });
      if (abaAberta() === 'comparacao') abrirAba('municipios');
      return;
    }
    const dados = this.dados;
    const a = this.aplicado;
    if (!dados || !a || !this.resultado) return;
    const g = this.geracaoSessao;
    const gc = this.geracaoComparacao;
    const atual = () => g === this.geracaoSessao && gc === this.geracaoComparacao;

    // Pedido (T1, T2): sem ajuste automático de datas; recusa sem resultado comparativo (CP-3).
    let filtroB: Filtro;
    let validacao: ValidacaoPeriodos | null = null;
    try {
      if (modo === 'periodos') {
        const inicio = $<HTMLInputElement>('cmp-b-inicio').value;
        const fim = $<HTMLInputElement>('cmp-b-fim').value;
        if (!inicio || !fim) {
          this.estadoComparacao({ tipo: 'incompleta', texto: 'Escolha o início e o fim do período B.' });
          return;
        }
        validacao = validarPeriodos(dados.janela, { inicio: a.inicio, fim: a.fim }, { inicio, fim });
        filtroB = { ...a, inicio, fim };
      } else {
        if (a.municipio === null) {
          this.estadoComparacao({ tipo: 'incompleta', texto: 'Escolha um município na Consulta para ser o A.' });
          return;
        }
        const b = $<HTMLSelectElement>('cmp-municipio-b').value;
        if (!b) {
          this.estadoComparacao({ tipo: 'incompleta', texto: 'Escolha o município B.' });
          return;
        }
        validarMunicipios(a.municipio, Number(b), new Set(dados.municipios.map((m) => m.codigo)));
        filtroB = { ...a, municipio: Number(b) };
      }
    } catch (e) {
      if (!(e instanceof ErroComparacao)) throw e;
      this.mostrarErroComparacao(e.message);
      this.estadoComparacao({ tipo: 'recusada', texto: e.message });
      return;
    }
    const lente = this.lenteDaComparacao();
    if (lente && 'incompleta' in lente) {
      this.estadoComparacao({ tipo: 'incompleta', texto: lente.incompleta });
      return;
    }

    // Registros dos dois lados (resultado inicial, teto de 120 s): progresso somado.
    const lidos = { A: 0, B: 0 };
    const totais = { A: 0, B: 0 };
    const progresso = (l: Lado) => (feitos: number, total: number) => {
      lidos[l] = feitos;
      totais[l] = total;
      if (atual()) this.estadoComparacao({ tipo: 'carregando', etapa: 'registros', feitos: lidos.A + lidos.B, total: totais.A + totais.B });
    };
    const todos = dados.municipios.map((m) => m.codigo);
    let lados: [LadoAplicado, LadoAplicado];
    try {
      const [la, lb] = await Promise.all([
        this.lerRecorteComparacao(a, atual, progresso('A')), this.lerRecorteComparacao(filtroB, atual, progresso('B')),
      ]);
      if (!la || !lb || !atual()) return;
      let camada: LeituraAreas | null = null;
      if (lente?.sobreposicao) {
        this.estadoComparacao({ tipo: 'carregando', etapa: 'areas', feitos: 0, total: 0 });
        camada = await lerAreas(fontesAreas(this.sessao.cliente), a.carga, atual);
        if (!camada || !atual()) return;
      }
      const montar = (lado: Lado, filtro: Filtro, l: NonNullable<typeof la>): LadoAplicado => ({
        lado, filtro, pedido: l.pedido, resumo: l.resumo, leitura: l.leitura,
        bruto: lente ? lente.calcular({
          carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: l.pedido.janela, registros: l.leitura.registros,
          totalResumo: l.leitura.totalResumo, nomes: dados.nomes, recorte: recorteDe(filtro.municipio),
        }, camada) : null,
        recorte: filtro.municipio === null ? todos : [filtro.municipio],
        disp: new Map(l.leitura.disponibilidade),
      });
      lados = [montar('A', a, la), montar('B', filtroB, lb)];
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.estadoComparacao(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }
    this.comparacao = {
      modo, lados, validacao, lente, mapa: 'A', pagina: 0, abertas: new Set(), lista: { tipo: 'nao_solicitada' },
      contexto: modo === 'municipios' ? { estado: 'nao_solicitado' } : null, resultado: null,
    };
    renderLadoNoMapa(this.textoLadoNoMapa('A'));
    this.mostrarComparacao();

    // Qualificação (R3-1: conta no teto de 360 s): municípios dos destaques e, num lado com zero, todo o recorte;
    // no recorte municipal, sempre o próprio município (seção municipal separada, T3).
    const pedidos = lados.flatMap((l) => leiturasDeDisponibilidade([{
      lado: l.lado, destaques: l.bruto ? this.municipiosDosDestaques(l.bruto) : [], zero: l.leitura.totalResumo === 0, lidos: new Set(l.disp.keys()),
    }], l.recorte, l.filtro.municipio !== null));
    await this.lerDisponibilidadeComparacao(pedidos, atual);
    if (!atual() || !this.comparacao) return;
    this.mostrarComparacao();
    if (!this.comparacao) return;
    const falhou = lados.some((l) => [...l.disp.values()].some((d) => d.estado === 'falha'));
    this.estadoComparacao(falhou ? { tipo: 'cobertura_nao_verificada' } : { tipo: 'pronta' });
  }

  private municipiosDosDestaques(r: ResultadoComparavel): number[] {
    return unidadesDe(r).flatMap((u) => u.municipios);
  }

  /** Lê a disponibilidade pedida nos dois lados com concorrência global 4; falha fica no município, nunca vira classe. */
  private async lerDisponibilidadeComparacao(
    pedidos: { lado: Lado; codigo: number }[],
    atual: () => boolean,
    aoProgredir?: (feitos: number) => void,
  ): Promise<void> {
    const c = this.comparacao;
    const dados = this.dados;
    if (!c || !dados || !pedidos.length) return;
    let feitos = 0;
    const redesenhar = limitador(INTERVALO_QUALIFICACAO_MS);
    const progresso = () => {
      if (aoProgredir) aoProgredir(feitos);
      else this.estadoComparacao({ tipo: 'carregando', etapa: 'disponibilidade', feitos, total: pedidos.length });
    };
    progresso();
    await emParalelo(pedidos, CONCORRENCIA_DISPONIBILIDADE, atual, async ({ lado, codigo }) => {
      const l = c.lados[lado === 'A' ? 0 : 1];
      let d: DisponibilidadeMunicipio;
      try {
        const resp = await consultarDisponibilidade(this.sessao.cliente, { ...l.filtro, municipio: codigo });
        if (!atual()) return;
        d = { estado: 'ok', dias: validarDisponibilidade(l.pedido, codigo, dados.carga.satelite, resp) };
        l.leitura.disponibilidade.set(codigo, d);
      } catch (e) {
        if (!atual() || this.erroDaLente(e, 'disponibilidade') === 'global') return;
        d = { estado: 'falha', motivo: e instanceof ErroLente ? e.message : 'fonte indisponível' };
      }
      l.disp.set(codigo, d);
      feitos += 1;
      if (!atual()) return;
      if (redesenhar()) this.mostrarComparacao();
      progresso();
    });
  }

  /** Resultado comparativo do estado atual dos dois lados (qualificação e conferência do zero incluídas). */
  private calcularComparacao(c: ComparacaoAplicada): ComparacaoTemporal | ComparacaoMunicipal {
    const qualificado = (l: LadoAplicado): ResultadoComparavel | null => {
      const r = l.bruto;
      if (!r) return null;
      if ('tipo' in r) return qualificarCombinacao(r, l.disp);
      if (r.lente === 'sobreposicao') return qualificarSobreposicao(r, l.disp);
      return qualificar(r, l.disp);
    };
    const zero = (l: LadoAplicado): ConferenciaZero =>
      (l.leitura.totalResumo === 0 ? conferirZero(l.recorte, l.pedido.janela, l.disp) : { estado: 'nao_necessaria' });
    const [la, lb] = c.lados;
    if (c.modo === 'periodos' && c.validacao) {
      return compararPeriodos(
        { janela: la.pedido.janela, total: la.leitura.totalResumo, resultado: qualificado(la), zero: zero(la) },
        { janela: lb.pedido.janela, total: lb.leitura.totalResumo, resultado: qualificado(lb), zero: zero(lb) },
        c.validacao);
    }
    const lado = (l: LadoAplicado) => ({
      codigo: l.filtro.municipio ?? 0, nome: this.nomeMunicipio(l.filtro.municipio) ?? '',
      numeros: numerosMunicipio(l.resumo, l.leitura.registros), resultado: qualificado(l), zero: zero(l),
    });
    return compararMunicipios(la.pedido.janela, lado(la), lado(lb));
  }

  private mostrarComparacao(): void {
    const c = this.comparacao;
    const dados = this.dados;
    if (!c || !dados) return;
    let r: ComparacaoTemporal | ComparacaoMunicipal;
    try {
      r = this.calcularComparacao(c);
    } catch (e) {
      if (!(e instanceof ErroComparacao)) throw e;
      this.comparacao = null;
      this.estadoComparacao({ tipo: 'recusada', texto: e.message });
      this.atualizarPerguntas();
      return;
    }
    c.resultado = r;
    const [la, lb] = c.lados;
    const estadual = c.modo === 'periodos' && la.filtro.municipio === null;
    const pendenteZero = c.lados.map((l) => (l.leitura.totalResumo === 0 ? conferirZero(l.recorte, l.pedido.janela, l.disp) : null))
      .find((z) => z?.estado === 'pendente');
    const listaVisivel = !estadual || c.lista.tipo !== 'nao_solicitada';
    const ctx: ContextoComparacao = {
      lente: c.lente?.nome ?? null, mapa: c.mapa, pagina: c.pagina, abertas: c.abertas,
      disponibilidade: {
        estado: c.lista, estadual, nomes: dados.nomes,
        a: listaVisivel ? disponibilidadePorMunicipio(la.recorte, la.pedido.janela, la.disp) : [],
        b: listaVisivel ? disponibilidadePorMunicipio(lb.recorte, lb.pedido.janela, lb.disp) : [],
      },
      progressoZero: pendenteZero?.estado === 'pendente' ? `${pendenteZero.feitos} de ${pendenteZero.total} municípios conferidos` : null,
      contexto: c.contexto,
      metadados: { carga: { id: dados.carga.id, identidade: dados.carga.identidade }, versaoMetodo: la.bruto ? this.versaoDe(la.bruto) : null },
    };
    const m = {
      mostrarNoMapa: (l: Lado) => this.mostrarLadoNoMapa(l),
      pagina: (p: number) => {
        c.pagina = Math.max(0, p);
        this.mostrarComparacao();
        document.getElementById('comparacao-pagina')?.focus();
      },
      abrir: (chave: string, aberta: boolean) => { if (aberta) c.abertas.add(chave); else c.abertas.delete(chave); },
      listaCompleta: () => void this.listaCompletaComparacao(),
      contextoEstadual: () => void this.contextoEstadualComparacao(),
    };
    // O foco fica onde estava ao redesenhar a qualificação.
    const ativo = document.activeElement instanceof HTMLElement && $('comparacao-corpo').contains(document.activeElement) ? document.activeElement.id : '';
    if (r.tipo === 'temporal') renderComparacaoPeriodos(r, ctx, m);
    else renderComparacaoMunicipios(r, ctx, m);
    if (ativo) document.getElementById(ativo)?.focus({ preventScroll: true });
    this.atualizarPerguntas();
  }

  // --- Perguntas aos agentes (plano 008, item 4; T7) ----------------------------------------------------------------

  /** Lente do formulário no formato do pedido; sem lente completa, `null` (o mesmo que a comparação calcularia). */
  private configLenteFormulario(): ConfigLenteIa | null {
    const escolhida = lenteEscolhida();
    if (escolhida === 'combinacao') {
      const c = this.lerConfigCombinacao();
      return c ? { tipo: 'combinacao', lentes: c.lentes, operador: c.operador } : null;
    }
    if (escolhida === 'sobreposicao') {
      const marcada = document.querySelector<HTMLInputElement>('input[name="l-classe"]:checked')?.value;
      const classe = CLASSES_AREA.find((c) => c === marcada);
      return classe ? { tipo: 'sobreposicao', classe } : null;
    }
    return Object.hasOwn(LENTES, escolhida) ? { tipo: escolhida as keyof typeof LENTES } : null;
  }

  /** Destaque aberto na aba Destaques (lente, combinação ou sobreposição), com os municípios das suas detecções. */
  private destaqueAberto(): ContextoTela['destaque'] {
    let id: string | null = null;
    let r: ResultadoComparavel | null = null;
    let unidade: Unidade | undefined;
    if (this.lente?.selecionado) {
      id = this.lente.selecionado;
      r = this.lente.resultado;
      unidade = this.lente.resultado.destaques.find((d) => d.id_destaque === id)?.unidade;
    } else if (this.combinacao?.selecionado) {
      id = this.combinacao.selecionado;
      r = this.combinacao.resultado;
      unidade = this.combinacao.resultado.celulas.find((c) => c.id_combinado === id)?.unidade;
    } else if (this.sobreposicao?.selecionado) {
      id = this.sobreposicao.selecionado;
      r = this.sobreposicao.resultado;
      unidade = this.sobreposicao.resultado.destaques.find((d) => d.id_destaque === id)?.unidade;
    }
    if (!id || !r || !unidade) return null;
    const chave = chaveUnidade(unidade);
    return { id, rotulo: nomeUnidade(unidade), municipios: unidadesDe(r).find((u) => u.chave === chave)?.municipios ?? [] };
  }

  /** O que está na tela agora; `null` sem acesso autorizado ou recorte aplicado. */
  private contextoPergunta(): ContextoTela | null {
    const dados = this.dados;
    const a = this.aplicado;
    if (!dados || !a || !this.usuarioAutorizado) return null;
    const c = this.comparacao?.resultado ? this.comparacao : null;
    const comLente = !!(this.lente || this.combinacao || this.sobreposicao);
    const [la, lb] = c?.lados ?? [];
    return {
      carga: { id: dados.carga.id, identidade: dados.carga.identidade },
      janela: { inicio: a.inicio, fim: a.fim },
      municipio: a.municipio,
      lente: comLente || c ? this.configLenteFormulario() : null,
      destaque: comLente ? this.destaqueAberto() : null,
      comparacaoIncompleta: modoComparacao() !== 'nenhuma' && (!c || !la || !lb),
      comparacao: !c || !la || !lb ? null
        : c.modo === 'periodos' ? { modo: 'periodos', a: la.pedido.janela, b: lb.pedido.janela }
          : { modo: 'municipios', a: la.filtro.municipio ?? 0, b: lb.filtro.municipio ?? 0 },
    };
  }

  /**
   * Recalcula o que cada pergunta pode usar agora. Se o contexto mudou desde a pergunta em curso ou a resposta exibida,
   * a execução é cancelada e a resposta sai da tela (nenhuma resposta obsoleta).
   */
  private atualizarPerguntas(): void {
    const ctx = this.contextoPergunta();
    if (this.chavePergunta !== null && chaveContexto(this.geracaoSessao, ctx) !== this.chavePergunta) this.descartarPergunta(true);
    const sem: Escolha = { indisponivel: 'Sem dados autorizados na tela.' };
    const escolhas = Object.fromEntries(IDS_PERGUNTAS
      .map((p) => [p, ctx ? escolherRecorte(p, ctx) : sem])) as Record<Pergunta, Escolha>;
    renderDisponibilidadePerguntas(escolhas, this.perguntaEmCurso !== null);
    const contexto = $('perguntas-contexto-aplicado');
    const nomesLente: Record<string, string> = { concentracao: 'Concentração', recorrencia: 'Recorrência', persistencia: 'Persistência', combinacao: 'Combinação', sobreposicao: 'Sobreposição' };
    const comparacao = ctx?.comparacao;
    const descricaoComparacao = !comparacao ? '' : comparacao.modo === 'periodos'
      ? ` · Comparação de períodos: ${comparacao.a.inicio} a ${comparacao.a.fim} e ${comparacao.b.inicio} a ${comparacao.b.fim}`
      : ` · Comparação de municípios: ${this.nomeMunicipio(comparacao.a)} e ${this.nomeMunicipio(comparacao.b)}`;
    contexto.replaceChildren();
    const titulo = document.createElement('strong');
    titulo.textContent = 'O que será usado na resposta';
    const descricao = document.createElement('p');
    descricao.textContent = ctx ? `${ctx.municipio === null ? 'Mato Grosso' : this.nomeMunicipio(ctx.municipio)} · ${ctx.janela.inicio} a ${ctx.janela.fim} · Lente: ${ctx.lente ? nomesLente[ctx.lente.tipo] : 'nenhuma'}${ctx.destaque ? ` · Destaque: ${ctx.destaque.rotulo}` : ''}${descricaoComparacao}` : 'Nenhum recorte autorizado aplicado.';
    const nota = document.createElement('p');
    nota.className = 'nota';
    nota.textContent = 'Para perguntar sobre outro município ou período, altere os filtros antes.';
    contexto.append(titulo, descricao, nota);
  }

  private mostrarPerguntas(e: EstadoPerguntas): void {
    this.estadoPerguntas = e;
    renderPerguntas(e, {
      rotuloResultado: this.destinoPergunta?.destaque ? 'Ver o lugar na tela' : 'Ver detalhes do resultado',
      abrirResultado: () => {
        const destino = this.destinoPergunta;
        if (!destino || destino.chave !== chaveContexto(this.geracaoSessao, this.contextoPergunta())) return;
        abrirAba(destino.aba, true);
      },
      tentarDeNovo: () => { const u = this.ultimaPergunta; if (u) void this.perguntarAgora(u.tipo); },
      abrirDetalhamento: (f) => this.abrirDetalhamento(f),
      temDetalhamento: (f) => this.temDetalhamento(f),
    });
  }

  /** Cancela a execução em curso e tira a resposta da tela; `avisar` diz que foi a seleção que mudou. */
  private descartarPergunta(avisar: boolean): void {
    this.geracaoPergunta++;
    this.perguntaEmCurso?.abort();
    this.perguntaEmCurso = null;
    this.chavePergunta = null;
    this.destinoPergunta = null;
    this.mostrarPerguntas(avisar && this.estadoPerguntas.tipo !== 'ociosa' && this.estadoPerguntas.tipo !== 'descartada' ? { tipo: 'descartada' } : { tipo: 'ociosa' });
  }

  /**
   * Há detalhamento determinístico na tela para a evidência? Fora da comparação, a disponibilidade não tem mais
   * cartão próprio (ciclo 009, D2): a evidência fica só no painel de perguntas.
   */
  private temDetalhamento(f: Ferramenta): boolean {
    if (f === 'ler_detalhes' || f === 'distribuicao_temporal' || f === 'cruzar_padroes') return false;
    if (f === 'consultar_disponibilidade') return this.comparacao !== null;
    return true;
  }

  /** Leva ao detalhamento determinístico da evidência, que continua completo na tela. */
  private abrirDetalhamento(f: Ferramenta): void {
    if (f === 'explicar_selecao') abrirAba('destaques', true);
    else if (f === 'comparar_periodos' || f === 'comparar_municipios' || (f === 'consultar_disponibilidade' && this.comparacao)) abrirAba('comparacao', true);
  }

  /**
   * Envia a pergunta com o JWT da sessão (só no cabeçalho) e mostra as etapas reais à medida que chegam. Sessão,
   * acesso e versão recusados pelo servidor nunca ficam locais: a tela inteira reage, como nas lentes.
   */
  private async perguntarAgora(tipo: Pergunta): Promise<void> {
    const ctx = this.contextoPergunta();
    if (!ctx || this.perguntaEmCurso) return;
    const pedido = montarPedido(tipo, ctx);
    if ('indisponivel' in pedido) {
      $('perguntas-estado').textContent = pedido.indisponivel;
      return;
    }
    const g = ++this.geracaoPergunta;
    const controle = new AbortController();
    this.perguntaEmCurso = controle;
    this.chavePergunta = chaveContexto(this.geracaoSessao, ctx);
    this.destinoPergunta = { chave: this.chavePergunta, ...destinoDoPedido(tipo, ctx, pedido.recorte) };
    this.ultimaPergunta = { tipo };
    const atual = () => g === this.geracaoPergunta;
    const etapas: EventoIa[] = [];
    this.mostrarPerguntas({ tipo: 'executando', pergunta: PERGUNTAS[pedido.pergunta_id], etapas: [] });
    this.atualizarPerguntas();
    $('perguntas-estado').scrollIntoView({ block: 'nearest' });
    let desfecho: Desfecho | 'rede';
    try {
      const { data } = await this.sessao.cliente.auth.getSession();
      const token = data.session?.access_token;
      if (!atual()) return;
      if (!token) {
        this.tratarErroGlobal(new ErroConsulta('sessao_expirada', 'explicação sem sessão'));
        return;
      }
      desfecho = await perguntar(pedido, token, controle.signal, (e) => {
        if (!atual()) return;
        etapas.push(e);
        this.mostrarPerguntas({ tipo: 'executando', pergunta: PERGUNTAS[pedido.pergunta_id], etapas: [...etapas] });
      });
    } catch {
      desfecho = 'rede';
    }
    if (!atual()) return;
    this.perguntaEmCurso = null;
    const base = { pergunta: PERGUNTAS[pedido.pergunta_id], etapas };
    if (controle.signal.aborted) this.mostrarPerguntas({ tipo: 'cancelada', ...base });
    else if (desfecho === 'rede') this.mostrarPerguntas({ tipo: 'rede', ...base });
    else if (desfecho.tipo === 'formato') this.mostrarPerguntas({ tipo: 'formato', ...base });
    else if (desfecho.tipo === 'resposta') this.mostrarPerguntas({ tipo: 'resposta', ...base, resposta: desfecho.resposta });
    else {
      const global: Partial<Record<string, TipoErro>> = { nao_autenticado: 'sessao_expirada', acesso_negado: 'acesso_negado', sem_publicacao: 'sem_publicacao' };
      const tipoGlobal = global[desfecho.codigo];
      if (tipoGlobal) { this.tratarErroGlobal(new ErroConsulta(tipoGlobal, 'explicação')); return; }
      if (desfecho.codigo === 'versao_substituida') { this.aoFalharConsulta(new ErroConsulta('versao_substituida', 'carga_indisponivel')); return; }
      this.mostrarPerguntas({ tipo: 'falha', ...base, desfecho });
    }
    // Sem execução em curso, a resposta fica até o contexto mudar; cancelada ou falha, também sai com ele.
    if (this.estadoPerguntas.tipo === 'cancelada') this.chavePergunta = null;
    this.atualizarPerguntas();
  }

  private versaoDe(r: ResultadoComparavel): string {
    return 'tipo' in r ? `${r.versao_combinacao} · ${r.versao_metodo}` : r.versao_metodo;
  }

  /** "Disponibilidade de todos os municípios" (T3, CP-16): os municípios do recorte nos dois lados, com progresso. */
  private async listaCompletaComparacao(): Promise<void> {
    const c = this.comparacao;
    if (!c || c.lista.tipo === 'carregando') return;
    const g = this.geracaoSessao;
    const gc = this.geracaoComparacao;
    const atual = () => g === this.geracaoSessao && gc === this.geracaoComparacao && this.comparacao === c;
    // Falhas anteriores são lidas de novo.
    for (const l of c.lados) for (const [codigo, d] of l.disp) if (d.estado === 'falha') l.disp.delete(codigo);
    const pedidos = c.lados.flatMap((l) => leiturasDeDisponibilidade([{ lado: l.lado, destaques: [], zero: false, lidos: new Set(l.disp.keys()) }], l.recorte, true));
    const total = c.lados.reduce((s, l) => s + l.recorte.length, 0);
    const jaLidos = total - pedidos.length;
    c.lista = { tipo: 'carregando', feitos: jaLidos, total };
    this.mostrarComparacao();
    await this.lerDisponibilidadeComparacao(pedidos, atual, (feitos) => {
      c.lista = { tipo: 'carregando', feitos: jaLidos + feitos, total };
      this.mostrarComparacao();
    });
    if (!atual()) return;
    const falhou = c.lados.some((l) => l.recorte.some((codigo) => l.disp.get(codigo)?.estado !== 'ok'));
    c.lista = falhou ? { tipo: 'falha' } : { tipo: 'completa' };
    this.mostrarComparacao();
    document.getElementById('t-comparacao-disp')?.focus();
  }

  /**
   * "Ver contexto estadual" na comparação de municípios (T2, D8, CM-6): a concentração (ou, com a combinação escolhida,
   * a combinação com a concentração) calculada em todo Mato Grosso no mesmo período, numa seção própria.
   */
  private async contextoEstadualComparacao(): Promise<void> {
    const c = this.comparacao;
    const dados = this.dados;
    if (!c || !dados || c.modo !== 'municipios') return;
    const g = this.geracaoSessao;
    const gc = this.geracaoComparacao;
    const atual = () => g === this.geracaoSessao && gc === this.geracaoComparacao && this.comparacao === c;
    c.contexto = { estado: 'carregando' };
    this.mostrarComparacao();
    const [la, lb] = c.lados;
    const escolhidos = [la, lb].map((l) => ({ lado: l.lado, codigo: l.filtro.municipio ?? 0, nome: this.nomeMunicipio(l.filtro.municipio) ?? '' }));
    try {
      const estado = await this.lerRecorteComparacao({ ...la.filtro, municipio: null }, atual, () => {});
      if (!estado || !atual()) return;
      const entrada: EntradaLente = {
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: estado.pedido.janela, registros: estado.leitura.registros,
        totalResumo: estado.leitura.totalResumo, nomes: dados.nomes, recorte: recorteDe(null),
      };
      const comb = c.lente?.combinacao;
      if (comb) {
        const lentes = LENTES_CANONICAS.filter((l) => l === 'concentracao' || comb.lentes.includes(l));
        const r = combinar(entrada, lentes, comb.operador);
        c.contexto = { estado: 'pronto', valor: contextoCombinacao(r, new Map(estado.leitura.registros.map((x) => [x.id_tecnico, x])), escolhidos) };
      } else {
        const contagens = new Map<number, number>();
        for (const x of estado.leitura.registros) contagens.set(x.municipio_codigo, (contagens.get(x.municipio_codigo) ?? 0) + 1);
        c.contexto = { estado: 'pronto', valor: contextoConcentracao(concentracao(entrada), contagens, escolhidos) };
      }
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      c.contexto = { estado: 'falha' };
    }
    this.mostrarComparacao();
    document.getElementById('t-comparacao-contexto')?.focus();
  }

  private textoLadoNoMapa(lado: Lado): string | null {
    const c = this.comparacao;
    if (!c) return null;
    const f = c.lados[lado === 'A' ? 0 : 1].filtro;
    const onde = f.municipio === null ? 'todo Mato Grosso' : (this.nomeMunicipio(f.municipio) ?? '');
    return `Mapa: lado ${lado}${lado === 'A' ? ' (recorte aplicado)' : ''} · ${textoJanela(f)} · ${onde}`;
  }

  /** Alterna o lado mostrado no mapa (T7): B troca pontos e destaques; A volta ao recorte aplicado. */
  private mostrarLadoNoMapa(lado: Lado): void {
    const c = this.comparacao;
    if (!c || !this.mapa) return;
    this.fecharReproducao(false);
    c.mapa = lado;
    if (lado === 'A') this.restaurarMapaA();
    else {
      const l = c.lados[1];
      this.mapaComB = true;
      this.mapa.fecharBalao();
      this.mapa.definirPontos(l.leitura.registros);
      this.mapa.limparDestaques();
      const gc = this.geracaoComparacao;
      const unidades = l.bruto ? unidadesDe(l.bruto) : [];
      void this.desenharUnidades(unidades.map((u) => ({ id: u.chave, unidade: u.unidade })), () => gc === this.geracaoComparacao && this.mapaComB)
        .catch(() => {});
    }
    this.mapa.enquadrar();
    $('mapa-lado').dataset['lado'] = lado;
    renderLadoNoMapa(this.textoLadoNoMapa(lado));
    this.mostrarComparacao();
    document.querySelector<HTMLElement>(`#comparacao-mapa button[data-lado="${lado}"]`)?.focus();
  }

  /** Toque numa unidade do lado B no mapa: abre essa unidade na aba Comparação. */
  private abrirUnidadeComparacao(chave: string): void {
    const c = this.comparacao;
    const r = c?.resultado;
    if (!c || !r) return;
    const i = r.itens.findIndex((x) => x.chave === chave);
    if (i < 0) return;
    if (mapaAmpliado()) this.ampliarMapa(false, false);
    c.abertas.add(chave);
    c.pagina = Math.floor(i / ITENS_POR_PAGINA);
    abrirAba('comparacao');
    this.mostrarComparacao();
    const alvo = document.querySelector<HTMLElement>(`#comparacao-itens details[data-chave="${CSS.escape(chave)}"] > summary`);
    alvo?.scrollIntoView({ block: 'nearest' });
    alvo?.focus();
  }

  // --- Camada de áreas protegidas, sob demanda (plano 006, T24) -----------------------------------------

  /** Remove camada, legenda, área selecionada, contornos e a memória das áreas; invalida leituras em voo. */
  private limparAreas(): void {
    this.geracaoAreas++;
    this.camadaAreas = null;
    this.contornos.clear();
    this.areaSelecionada = null;
    this.mapa?.definirAreas([]);
    this.mapa?.definirContornos([]);
    $<HTMLInputElement>('c-areas').checked = false;
    renderLegendaAreas(null, []);
    renderAreaSelecionada(null, () => {});
    renderEstadoAreas({ tipo: 'oculta' });
  }

  private async alternarAreas(): Promise<void> {
    if (marcado('c-areas')) {
      await this.mostrarAreas();
      return;
    }
    // Ocultar: a visão geral fica na memória para a próxima abertura na mesma carga e sessão.
    this.geracaoAreas++;
    this.mapa?.definirAreas([]);
    renderLegendaAreas(null, []);
    renderEstadoAreas({ tipo: 'oculta' });
    if (!this.sobreposicao?.selecionado) {
      this.mapa?.definirContornos([]);
      this.areaSelecionada = null;
      renderAreaSelecionada(null, () => {});
    }
  }

  /** Lê a visão geral uma vez (T25, com a geometria geral) e desenha as três classes com a legenda. */
  private async mostrarAreas(): Promise<void> {
    const dados = this.dados;
    if (!dados) return;
    const caixa = $<HTMLInputElement>('c-areas');
    caixa.checked = true;
    const g = this.geracaoSessao;
    const ga = ++this.geracaoAreas;
    const atual = () => g === this.geracaoSessao && ga === this.geracaoAreas;
    let camada = this.camadaAreas;
    if (camada?.carga !== dados.carga.id) {
      renderEstadoAreas({ tipo: 'carregando' });
      try {
        const lido = await lerAreas(fontesAreas(this.sessao.cliente), dados.carga.id, atual, true);
        if (!lido || !atual()) return;
        if (lido.estado === 'sem_camada') {
          caixa.checked = false;
          renderEstadoAreas({ tipo: 'sem_camada' });
          return;
        }
        camada = { carga: dados.carga.id, areas: lido.areas };
        this.camadaAreas = camada;
      } catch (e) {
        if (!atual() || this.erroDaLente(e, 'geometria') === 'global') return;
        caixa.checked = false;
        renderEstadoAreas(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
        return;
      }
    }
    const areas = camada.areas;
    this.mapa?.definirAreas(areas.map((a) => ({ chave: chaveArea(a.fonte, a.codigo), classe: a.classe, geometria: a.geometria_geral })));
    const porClasse: Record<ClasseArea, number> = { protecao_integral: 0, uso_sustentavel: 0, terra_indigena: 0 };
    for (const a of areas) porClasse[a.classe] += 1;
    renderLegendaAreas(porClasse, dados.fontes);
    renderEstadoAreas({ tipo: 'visivel', total: areas.length });
  }

  /** Toque numa área da camada: mostra os dados dela; o contorno real só vem pelo botão. */
  private selecionarAreaDaCamada(chave: string): void {
    const a = this.camadaAreas?.areas.find((x) => chaveArea(x.fonte, x.codigo) === chave);
    if (!a) return;
    const ti = a.classe === 'terra_indigena';
    this.selecionarArea({
      chave, nome: a.nome, classe: a.classe, categoria_ou_fase: ti ? a.fase : a.categoria, esfera: ti ? null : a.esfera,
      qualidade_poligono: a.qualidade,
    });
  }

  private selecionarArea(a: AreaExibida): void {
    this.areaSelecionada = a;
    renderAreaSelecionada(a, (chave) => void this.verContornoReal(chave));
    document.getElementById('areas-selecao-titulo')?.focus();
  }

  /** "Ver contorno real": baixa só aquela área (ou reaproveita a memória) e enquadra o contorno. */
  private async verContornoReal(chave: string): Promise<void> {
    const a = this.areaSelecionada;
    const dados = this.dados;
    if (!a || a.chave !== chave || !dados) return;
    const g = this.geracaoSessao;
    const atual = () => g === this.geracaoSessao && this.areaSelecionada === a;
    atualizarContornoArea('carregando');
    try {
      const [item] = await this.obterContornos(dados.carga.id, [{ chave, classe: a.classe }], () => g === this.geracaoSessao);
      if (!atual() || !item) return;
      this.mapa?.definirContornos([item]);
      this.mapa?.enquadrarContornos();
      atualizarContornoArea('exibido');
    } catch (e) {
      if (g !== this.geracaoSessao || this.erroDaLente(e, 'geometria') === 'global' || !atual()) return;
      atualizarContornoArea('falha');
    }
  }

  // --- Limites municipais, sob demanda ---------------------------------------------------------------------

  private async atualizarLimites(atual: () => boolean): Promise<void> {
    const r = this.resultado;
    if (!r || !this.mapa) return;
    const alvo = r.filtro.municipio;
    try {
      estadoLimites(this.todosOsLimites || alvo !== null ? 'carregando' : 'desligado');
      if (this.todosOsLimites) await this.carregarLimites(null, atual);
      else if (alvo !== null) await this.carregarLimites(alvo, atual);
      if (!atual()) return;
    } catch (e) {
      if (!atual()) return;
      estadoLimites('erro');
      // A camada fica desligada; religá-la tenta de novo.
      this.todosOsLimites = false;
      $<HTMLInputElement>('c-limites').checked = false;
      // Falha só nos limites: os pontos e os números seguem válidos.
      if (e instanceof ErroConsulta && (e.tipo === 'acesso_negado' || e.tipo === 'sessao_expirada')) {
        this.tratarErroGlobal(e);
        return;
      }
    }
    this.desenharLimites();
  }

  private async carregarLimites(municipio: number | null, atual: () => boolean): Promise<void> {
    if (!this.dados) return;
    if (municipio !== null && this.limites.has(municipio)) return;
    if (municipio === null && this.limites.size >= this.dados.municipios.length) return;
    const lidos = await lerLimites(this.sessao.cliente, this.dados.carga.id, municipio);
    if (!atual()) return;
    for (const l of lidos) this.limites.set(l.codigo, l);
  }

  private desenharLimites(): void {
    const r = this.resultado;
    if (!r || !this.mapa) return;
    const alvo = r.filtro.municipio;
    const visiveis = this.todosOsLimites
      ? [...this.limites.values()]
      : alvo !== null ? [this.limites.get(alvo)].filter((l): l is Limite => !!l) : [];
    this.mapa.definirLimites(visiveis, alvo);
    this.mapa.enquadrar();
    this.mostrarEstadoPontos();
    if ($('conteudo').dataset['estadoLimites'] !== 'erro') estadoLimites(this.todosOsLimites ? 'completo' : 'desligado');
  }

  // --- Densidade e mapa ampliado (T8, T17) ------------------------------------------------------------------

  /** Densidade do recorte aplicado, da mesma leitura completa dos pontos (só registros principais do período). */
  private desenharDensidade(filtro: Filtro): void {
    const p = this.pontos;
    if (!Array.isArray(p)) return;
    const d = densidadePorCelula(p, filtro.inicio, filtro.fim);
    this.mapa?.definirDensidade(d.celulas.map((c) => ({
      retangulo: [[Number(c.celula.sul), Number(c.celula.oeste)], [Number(c.celula.norte), Number(c.celula.leste)]], classe: c.classe,
    })));
    this.totalDensidade = d.total;
    renderLegendaDensidade(marcado('c-densidade'), d.total, d.celulas.length);
  }

  private mostrarDensidade(): void {
    const ativo = marcado('c-densidade');
    this.mapa?.mostrarDensidade(ativo);
    renderLegendaDensidade(ativo, this.totalDensidade, this.mapa?.contagem().densidade ?? 0);
  }

  /** Mapa ampliado: as colunas laterais saem; o foco vai para o mapa e, ao voltar, para o botão. */
  private ampliarMapa(ligar: boolean, focar = true): void {
    const antes = mapaAmpliado();
    document.body.classList.toggle('mapa-ampliado', ligar);
    const b = $('botao-ampliar');
    const rotulo = ligar ? 'Reduzir mapa' : 'Ampliar mapa';
    b.setAttribute('aria-pressed', String(ligar));
    b.setAttribute('aria-label', rotulo);
    b.title = ligar ? `${rotulo} (Esc)` : rotulo;
    this.mapa?.redimensionar();
    if (!focar || antes === ligar) return;
    if (ligar) this.mapa?.focar();
    else b.focus();
  }

  private async alternarLimites(): Promise<void> {
    const caixa = $<HTMLInputElement>('c-limites');
    const ativar = caixa.checked;
    const g = this.geracaoSessao;
    const c = this.geracaoConsulta;
    const atual = () => g === this.geracaoSessao && c === this.geracaoConsulta;
    this.todosOsLimites = ativar;
    if (!this.resultado) return;
    try {
      if (ativar) {
        estadoLimites('carregando');
        await this.carregarLimites(null, atual);
      }
      if (!atual()) return;
    } catch (e) {
      if (!atual()) return;
      this.todosOsLimites = false;
      caixa.checked = false;
      estadoLimites('erro');
      if (e instanceof ErroConsulta && (e.tipo === 'acesso_negado' || e.tipo === 'sessao_expirada')) {
        this.tratarErroGlobal(e);
        return;
      }
    }
    this.desenharLimites();
  }
}
