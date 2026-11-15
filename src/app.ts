// Controlador: sessão, versão fixada, consulta, paginação, mapa e estados. Duas gerações descartam
// respostas obsoletas: a da sessão (login, logout, expiração, negação) e a da consulta (a última vence).
// Nenhum dado de consulta é gravado em armazenamento; sair, expirar ou perder o acesso limpa a tela.
import {
  $, criarPainelRegistros, mostrarErroFiltro, mostrarErroMapa, renderAcesso, renderAvisoMapa, renderContagemMapa,
  renderDisponibilidade, renderEstadoConsulta, renderFiltros, renderMunicipios, renderProveniencia, renderRecorte, renderResumo,
  renderSelecao, renderSerie, renderTopo, limparResultados, type Acesso, type EstadoConsulta, type PainelRegistros,
} from './apresentacao.ts';
import {
  limparCorpoLente, renderEstadoLente, renderResultadoLente, type EstadoLente, type ManipuladoresLente,
} from './apresentacao-lentes.ts';
import {
  CELULAS_POR_PAGINA, paginaValida, renderResultadoCombinacao, type ManipuladoresCombinacao,
} from './apresentacao-combinacao.ts';
import {
  atualizarContornoArea, atualizarContornosPainel, renderAreaSelecionada, renderEstadoAreas, renderLegendaAreas,
  renderResultadoSobreposicao, type AreaExibida, type EstadoContorno, type ManipuladoresSobreposicao,
} from './apresentacao-areas.ts';
import { lerConfiguracao } from './config.ts';
import { chaveArea, diagnosticarAusencia, lerAreas, type AreaLida, type ClasseArea } from './lentes/carregar-areas.ts';
import {
  CLASSES_AREA, municipiosDaSobreposicao, qualificarSobreposicao, sobreposicao, type AreaSobreposicao,
  type DestaqueSobreposicao, type ResultadoSobreposicao,
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
  CONCORRENCIA_DISPONIBILIDADE, destinoErro, emParalelo, lerRegistros, validarDisponibilidade,
  type FontesLente, type OrigemChamada, type PedidoLente,
} from './lentes/carregar.ts';
import {
  ErroLente, type DisponibilidadeMunicipio, type RegistroLente, type ResultadoLente, type TipoLente,
} from './lentes/contrato.ts';
import {
  consultarDeteccoes, consultarDisponibilidade, consultarResumo, fontesAreas, lerCargaVigente, lerContornoReal, lerLimites,
  lerMunicipios, lerProveniencia, sondarAcesso, type Filtro,
} from './consulta.ts';
import { ErroConsulta, type TipoErro } from './erros.ts';
import { primeiroDiaGmt, ultimoDiaGmt } from './formato.ts';
import { periodoDoAtalho, validarPeriodo, type Atalho, type Janela } from './recorte.ts';
import { fecharDialogos, iniciarTema, ligarDialogo } from './topo.ts';
import { criarMapa, type AreaMapa, type DestaqueMapa, type Mapa } from './mapa.ts';
import { criarSessao, type EventoSessao, type Sessao } from './sessao.ts';
import type {
  CargaDetalhe, Disponibilidade, Fonte, Limite, Malha, MunicipioItem, PaginaDeteccoes, Resumo,
} from './tipos.ts';

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
  pagina: PaginaDeteccoes;
  disponibilidade: Disponibilidade;
}

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

/** Configuração da combinação, lida do formulário uma única vez, no clique em "Aplicar lente" (R1-7). */
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

/** Lentes disponíveis no seletor; cada uma é função pura da mesma entrada. */
const LENTES = { concentracao, recorrencia, persistencia } as const;

/** Memória reaproveitável entre lentes, enquanto sessão, carga, janela e recorte forem os mesmos. */
interface MemoriaLente {
  chave: string;
  registros: RegistroLente[];
  totalResumo: number;
  disponibilidade: Map<number, DisponibilidadeMunicipio>;
}

const chaveLente = (p: PedidoLente): string => `${p.carga}|${p.janela.inicio}|${p.janela.fim}|estado`;

/** Lente marcada nos rádios das seções de lente (Lente de seleção, Contexto territorial, Cruzar critérios). */
const lenteEscolhida = (): string => document.querySelector<HTMLInputElement>('input[name="l-lente"]:checked')?.value ?? 'nenhuma';

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
  private selecionado: string | null = null;
  private mapa: Mapa | null = null;
  private painel: PainelRegistros;
  private limites = new Map<number, Limite>();
  private todosOsLimites = false;
  private geracaoSessao = 0;
  private geracaoConsulta = 0;
  // Terceira geração (plano 004, R1-4): cada aplicação de lente, `Nenhuma`, nova janela, troca de versão
  // ou mudança de sessão a incrementa; respostas de uma aplicação antiga são descartadas.
  private geracaoLente = 0;
  private lente: LenteAplicada | null = null;
  private combinacao: CombinacaoAplicada | null = null;
  // Configuração da combinação em aplicação ou exibida; base do aviso de formulário alterado (R1-7).
  private configCombinacao: ConfigCombinacao | null = null;
  private pedidoLente: PedidoLente | null = null;
  // Sobreposição (plano 006): resultado exibido e classe em aplicação ou exibida (base do "tentar de novo").
  private sobreposicao: SobreposicaoAplicada | null = null;
  private classeSobreposicao: ClasseArea | null = null;
  // Camada de áreas: visão geral em memória, geração própria (mostrar/ocultar) e área selecionada.
  private camadaAreas: CamadaAreas | null = null;
  private geracaoAreas = 0;
  private areaSelecionada: AreaExibida | null = null;
  // Contornos reais por `carga|chave`, em voo ou lidos; limpos como os limites municipais (ADR-007).
  private contornos = new Map<string, Promise<unknown>>();
  private memoriaLente: MemoriaLente | null = null;
  private usuarioAutorizado = false;
  private motivoPendente: 'saiu' | 'expirada' | undefined;
  private erroCallback: string | undefined;
  private tamanho = 100;

  constructor(private readonly senhaLocal: boolean, private readonly sessao: Sessao) {
    this.painel = criarPainelRegistros({
      pagina: (d) => void this.mudarPagina(d),
      tamanho: (n) => { this.tamanho = n; void this.mudarPagina(0); },
      selecionar: (id) => this.selecionar(id),
    });
  }

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
    $('botao-lente').addEventListener('click', () => void this.aplicarLente());
    // Escolher "Nenhuma lente" cancela a lente na hora, inclusive durante a leitura.
    for (const r of document.querySelectorAll<HTMLInputElement>('input[name="l-lente"]')) {
      r.addEventListener('change', () => {
        const valor = lenteEscolhida();
        this.mostrarEscolhaLente();
        this.atualizarLimpar();
        this.mostrarValidacaoLente(null);
        if (valor === 'nenhuma') this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
        else this.atualizarAvisoConfig();
      });
    }
    // Editar as lentes ou o operador não cancela nem muda a combinação aplicada; só avisa (R1-7).
    $('lente-combinacao').addEventListener('change', () => {
      this.mostrarValidacaoLente(null);
      this.atualizarAvisoConfig();
    });
    $('lente-sobreposicao').addEventListener('change', () => this.mostrarValidacaoLente(null));
    $('botao-limites').addEventListener('click', () => void this.alternarLimites());
    $('botao-areas').addEventListener('click', () => void this.alternarAreas());
    $('botao-enquadrar').addEventListener('click', () => this.mapa?.enquadrar());
    const arrastar = $('botao-arrastar');
    arrastar.addEventListener('click', () => {
      const ativo = arrastar.getAttribute('aria-pressed') !== 'true';
      arrastar.setAttribute('aria-pressed', String(ativo));
      this.mapa?.permitirArrastar(ativo);
    });
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
      renderTopo(carga, prov.fontes);
      renderProveniencia(carga, prov.fontes, prov.malhas);
      renderAvisoMapa(prov.malhas);
      $<HTMLInputElement>('f-inicio').value = this.dados.janela.inicio;
      $<HTMLInputElement>('f-fim').value = this.dados.janela.fim;
      $<HTMLSelectElement>('f-periodo').value = 'ano';
      $('intervalo').hidden = true;
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
    this.usuarioAutorizado = false;
    this.dados = null;
    this.resultado = null;
    this.aplicado = null;
    fecharDialogos();
    $('conteudo').dataset['estadoPainel'] = 'carregando';
    this.selecionado = null;
    this.limites.clear();
    this.todosOsLimites = false;
    this.mapa?.limparTudo();
    this.painel.atualizar(null, new Map(), null);
    limparResultados();
    renderAvisoMapa([]);
    mostrarErroMapa(null);
    mostrarErroFiltro(null);
    $('botao-limites').setAttribute('aria-pressed', 'false');
    // Sessão, acesso ou publicação mudaram: a lente e toda a memória reaproveitável saem junto (R2-1).
    this.limparLente({ memoria: true, estado: { tipo: 'nenhuma' } });
    this.limparAreas();
  }

  // --- Consulta --------------------------------------------------------------------------------------

  private garantirMapa(): void {
    if (this.mapa) return;
    this.mapa = criarMapa($('mapa'));
    this.mapa.aoSelecionar((id) => this.selecionar(id));
    this.mapa.aoSelecionarDestaque((id) => this.selecionarDestaque(id));
    this.mapa.aoSelecionarArea((chave) => this.selecionarAreaDaCamada(chave));
    if (window.matchMedia('(pointer: coarse)').matches) {
      // Em tela de toque, um dedo rola a página; o mapa só arrasta quando o usuário ativa.
      this.mapa.permitirArrastar(false);
      $('botao-arrastar').hidden = false;
    }
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
    this.atualizarLimpar();
  }

  /** "Limpar tudo" só fica ativo fora do padrão (janela inteira, todo o estado, nenhuma lente), como na V13. */
  private atualizarLimpar(): void {
    const a = this.aplicado;
    const j = this.dados?.janela;
    const padrao = !a || !j || (a.inicio === j.inicio && a.fim === j.fim && a.municipio === null
      && $<HTMLSelectElement>('f-periodo').value === 'ano' && lenteEscolhida() === 'nenhuma');
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
    this.aplicado = novo;
    this.mostrarRecorte(periodo === null);
    if (novo.inicio === atual.inicio && novo.fim === atual.fim && novo.municipio === atual.municipio) return;
    void this.consultar();
  }

  private aplicarAtalho(atalho: Atalho): void {
    if (!this.dados) return;
    $<HTMLSelectElement>('f-periodo').value = atalho;
    const p = periodoDoAtalho(atalho, this.dados.janela);
    $<HTMLInputElement>('f-inicio').value = p.inicio;
    $<HTMLInputElement>('f-fim').value = p.fim;
    this.aplicarFormulario();
  }

  /** "Limpar tudo": período, município e lente voltam ao padrão (janela inteira, todo o estado, nenhuma lente). */
  private limparFiltros(): void {
    if (!this.dados) return;
    $<HTMLInputElement>('f-inicio').value = this.dados.janela.inicio;
    $<HTMLInputElement>('f-fim').value = this.dados.janela.fim;
    $<HTMLSelectElement>('f-periodo').value = 'ano';
    $('intervalo').hidden = true;
    $<HTMLSelectElement>('f-municipio').value = '';
    const nenhuma = document.querySelector<HTMLInputElement>('input[name="l-lente"][value="nenhuma"]');
    if (nenhuma) nenhuma.checked = true;
    this.mostrarEscolhaLente();
    this.mostrarValidacaoLente(null);
    this.limparLente({ memoria: false, estado: { tipo: 'nenhuma' } });
    this.aplicarFormulario();
  }

  /** Grupos da combinação e da sobreposição só com a lente deles marcada; etiqueta "ativa" na seção da lente. */
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
    const p = this.pedidoLente;
    if (p && (p.carga !== filtro.carga || p.janela.inicio !== filtro.inicio || p.janela.fim !== filtro.fim)) {
      this.limparLente({ memoria: false, estado: { tipo: 'cancelada', motivo: 'a janela da consulta mudou; aplique a lente de novo.' } });
    }
    const g = this.geracaoSessao;
    const c = ++this.geracaoConsulta;
    const atual = () => g === this.geracaoSessao && c === this.geracaoConsulta;
    this.resultado = null;
    this.selecionado = null;
    this.mapa?.limparTudo();
    this.painel.atualizar(null, dados.nomes, null);
    renderSelecao(null, null);
    mostrarErroMapa(null);
    this.estado({ tipo: 'carregando' });
    try {
      const cliente = this.sessao.cliente;
      const [resumo, pagina, disponibilidade] = await Promise.all([
        consultarResumo(cliente, filtro),
        consultarDeteccoes(cliente, filtro, this.tamanho, 0),
        consultarDisponibilidade(cliente, filtro),
      ]);
      if (!atual()) return;
      const mesmaVersao = [resumo.carga.id, pagina.carga.id, disponibilidade.carga.id].every((id) => id === filtro.carga);
      if (!mesmaVersao || pagina.total !== resumo.principal.total) {
        this.estado({ tipo: 'inconsistente' });
        return;
      }
      this.resultado = { filtro, resumo, pagina, disponibilidade };
      const nome = filtro.municipio === null ? null : (dados.nomes.get(filtro.municipio) ?? String(filtro.municipio));
      this.estado(resumo.principal.total === 0 ? { tipo: 'zero' } : { tipo: 'ocioso' });
      renderResumo(resumo, nome);
      renderSerie(resumo);
      renderMunicipios(resumo, dados.municipios, (codigo) => this.escolherMunicipio(codigo));
      renderDisponibilidade(disponibilidade, nome);
      this.mostrarPagina(pagina);
      // M1 (T14): filtros, cartão da série e municípios prontos, independentemente de limites e geometria.
      $('conteudo').dataset['estadoPainel'] = 'pronto';
      await this.atualizarLimites(atual);
    } catch (e) {
      if (!atual()) return;
      this.aoFalharConsulta(e);
    }
  }

  private aoFalharConsulta(e: unknown): void {
    const tipo: TipoErro = e instanceof ErroConsulta ? e.tipo : 'fonte_indisponivel';
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
            : { tipo: 'cancelada', motivo: 'a versão de dados foi substituída; recarregue a versão vigente e aplique a lente de novo.' },
      });
      // A camada e os contornos eram da versão substituída.
      this.limparAreas();
    }
    this.resultado = null;
    this.mapa?.limparTudo();
    this.painel.atualizar(null, new Map(), null);
    for (const id of ['resumo-corpo', 'serie-corpo', 'disp-corpo', 'municipios-corpo']) $(id).replaceChildren();
    renderContagemMapa(0, null, 0);
    this.estado({ tipo: tipo === 'versao_substituida' ? 'versao_substituida' : tipo === 'entrada_invalida' ? 'entrada_invalida' : 'fonte_indisponivel' });
  }

  private mostrarPagina(pagina: PaginaDeteccoes): void {
    const dados = this.dados;
    if (!dados) return;
    this.painel.atualizar(pagina, dados.nomes, this.selecionado);
    this.mapa?.definirPontos(pagina.registros);
    renderContagemMapa(pagina.registros.length, pagina.total, this.mapa?.contagem().limites ?? 0);
  }

  private async mudarPagina(deslocamento: number): Promise<void> {
    const r = this.resultado;
    if (!r || !this.dados) return;
    const g = this.geracaoSessao;
    const c = this.geracaoConsulta;
    const atual = () => g === this.geracaoSessao && c === this.geracaoConsulta;
    try {
      const pagina = await consultarDeteccoes(this.sessao.cliente, r.filtro, this.tamanho, deslocamento);
      if (!atual()) return;
      if (pagina.carga.id !== r.filtro.carga || pagina.total !== r.resumo.principal.total) {
        this.estado({ tipo: 'inconsistente' });
        return;
      }
      this.selecionado = null;
      renderSelecao(null, null);
      this.resultado = { ...r, pagina };
      this.mostrarPagina(pagina);
      this.mapa?.enquadrar();
    } catch (e) {
      if (!atual()) return;
      this.aoFalharConsulta(e);
    }
  }

  private escolherMunicipio(codigo: number): void {
    $<HTMLSelectElement>('f-municipio').value = String(codigo);
    this.aplicarFormulario();
    const titulo = $('t-resumo');
    titulo.tabIndex = -1;
    titulo.scrollIntoView({ block: 'start' });
    titulo.focus();
  }

  private selecionar(id: string): void {
    const r = this.resultado;
    if (!r || !this.dados) return;
    const registro = r.pagina.registros.find((x) => x.id_tecnico === id);
    if (!registro) return;
    this.selecionado = id;
    this.mapa?.selecionarRegistro(id);
    this.painel.marcarSelecao(id);
    renderSelecao(registro, this.dados.nomes.get(registro.municipio_codigo) ?? null);
  }

  // --- Lentes de seleção (plano 004) -----------------------------------------------------------------

  private manipuladoresLente(): ManipuladoresLente {
    return {
      tentarDeNovo: () => {
        // A combinação repete a configuração aplicada, não a do formulário (R1-7).
        if (this.configCombinacao) void this.aplicarCombinacao(this.configCombinacao);
        else if (this.classeSobreposicao) void this.aplicarSobreposicao(this.classeSobreposicao);
        else void this.aplicarLente();
      },
      selecionar: (id) => this.selecionarDestaque(id),
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
  }

  /** Invalida a aplicação em curso e limpa lista, camada, painel e (se pedido) a memória reaproveitável. */
  private limparLente(o: { memoria: boolean; estado: EstadoLente }): void {
    this.geracaoLente++;
    this.lente = null;
    this.combinacao = null;
    this.configCombinacao = null;
    this.sobreposicao = null;
    this.classeSobreposicao = null;
    this.pedidoLente = null;
    if (o.memoria) this.memoriaLente = null;
    this.mapa?.limparDestaques();
    // Contornos reais e área selecionada exibidos pela lente saem com ela.
    this.mapa?.definirContornos([]);
    this.areaSelecionada = null;
    renderAreaSelecionada(null, () => {});
    limparCorpoLente();
    this.estadoLente(o.estado);
    this.atualizarAvisoConfig();
  }

  private fontesLente(): FontesLente {
    const c = this.sessao.cliente;
    return {
      resumo: (f) => consultarResumo(c, f),
      pagina: (f, limite, deslocamento) => consultarDeteccoes(c, f, limite, deslocamento),
      disponibilidade: (f) => consultarDisponibilidade(c, f),
    };
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
  }

  private selecionarDestaque(id: string): void {
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
    l.selecionado = id;
    l.paginaEvidencia = 0;
    this.mostrarLente();
    this.mapa?.selecionarDestaque(id);
    document.getElementById('lente-painel-titulo')?.focus();
  }

  private async aplicarLente(): Promise<void> {
    const dados = this.dados;
    const escolhida = lenteEscolhida();
    this.mostrarValidacaoLente(null);
    if (escolhida === 'combinacao') {
      const config = this.lerConfigCombinacao();
      // Menos de 2 lentes: só o aviso; não incrementa `geracaoLente` nem toca a aplicação em curso (R1-7).
      if (!config) {
        this.mostrarValidacaoLente('Escolha pelo menos 2 lentes para combinar.');
        return;
      }
      await this.aplicarCombinacao(config);
      return;
    }
    if (escolhida === 'sobreposicao') {
      const marcada = document.querySelector<HTMLInputElement>('input[name="l-classe"]:checked')?.value;
      const classe = CLASSES_AREA.find((c) => c === marcada);
      // Sem classe escolhida: só o aviso; a aplicação em curso não muda.
      if (!classe) {
        this.mostrarValidacaoLente('Escolha a classe de área protegida.');
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
    // Período do recorte aplicado (T16); o município do filtro não se aplica às lentes até o item 4 (M1-a).
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
    const pedido: PedidoLente = { carga: dados.carga.id, janela: { inicio: filtro.inicio, fim: filtro.fim } };
    this.pedidoLente = pedido;
    const g = this.geracaoSessao;
    const gl = this.geracaoLente;
    const atual = () => g === this.geracaoSessao && gl === this.geracaoLente;
    const inicio = performance.now();
    const chave = chaveLente(pedido);
    const anterior = this.memoriaLente?.chave === chave ? this.memoriaLente : null;
    let resultado: ResultadoLente;
    let mem: MemoriaLente;
    try {
      const lido = await lerRegistros(this.fontesLente(), pedido, atual,
        (feitos, total) => { if (atual()) this.estadoLente({ tipo: 'carregando', etapa: 'registros', feitos, total }); },
        anterior);
      if (!lido || !atual()) return;
      mem = lido.reaproveitado && anterior ? anterior
        : { chave, registros: lido.registros, totalResumo: lido.totalResumo, disponibilidade: new Map() };
      this.memoriaLente = mem;
      resultado = calcular({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: pedido.janela,
        registros: mem.registros, totalResumo: mem.totalResumo, nomes: dados.nomes,
      });
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.mapa?.limparDestaques();
      limparCorpoLente();
      this.estadoLente(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }

    // Disponibilidade já validada nesta memória + a desta aplicação (falhas não são guardadas).
    const disponibilidade = new Map(mem.disponibilidade);
    this.lente = {
      pedido, resultado: qualificar(resultado, disponibilidade), selecionado: null, paginaEvidencia: 0,
      porId: new Map(mem.registros.map((x) => [x.id_tecnico, x])),
    };
    this.mostrarLente();

    let contornoFalhou = false;
    const contornos = this.desenharDestaques(resultado, atual).catch((e: unknown) => {
      if (atual() && this.erroDaLente(e, 'geometria') === 'local') contornoFalhou = true;
    });
    const faltam = municipiosNecessarios(resultado).filter((c) => !disponibilidade.has(c));
    let feitos = 0;
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
      this.lente.resultado = qualificar(resultado, disponibilidade);
      this.mostrarLente();
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
    if (!this.mapa || !this.dados) return;
    const codigos = r.destaques.flatMap((d) => (d.unidade.tipo === 'municipio' ? [d.unidade.codigo] : []));
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
    this.mapa.definirDestaques(r.destaques.flatMap((d): DestaqueMapa[] => {
      if (d.unidade.tipo === 'municipio') {
        const l = this.limites.get(d.unidade.codigo);
        return l ? [{ id: d.id_destaque, geometria: l.geometria_exibicao }] : [];
      }
      const u = d.unidade;
      return [{ id: d.id_destaque, retangulo: [[Number(u.sul), Number(u.oeste)], [Number(u.norte), Number(u.leste)]] }];
    }));
    this.mapa.enquadrarDestaques();
    if (erro !== null) throw erro;
  }

  // --- Combinação de lentes (plano 005, item 2) -----------------------------------------------------

  private mostrarValidacaoLente(texto: string | null): void {
    const p = $('lente-validacao');
    p.textContent = texto ?? '';
    p.hidden = texto === null;
  }

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

  /** Aviso enquanto o formulário diferir da combinação em aplicação ou exibida (R1-7). */
  private atualizarAvisoConfig(): void {
    const c = this.configCombinacao;
    let difere = false;
    if (c) {
      const f = this.lerFormularioCombinacao();
      difere = lenteEscolhida() !== 'combinacao' || f.operador !== c.operador || f.lentes.join('+') !== c.lentes.join('+');
    }
    $('lente-aviso-config').hidden = !difere;
  }

  private manipuladoresCombinacao(): ManipuladoresCombinacao {
    return {
      selecionar: (id) => this.selecionarCelula(id),
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
  }

  /** Seleciona a célula (pela lista ou pelo mapa) e leva a lista à página dela. */
  private selecionarCelula(id: string): void {
    const c = this.combinacao;
    if (!c) return;
    const i = c.resultado.celulas.findIndex((x) => x.id_combinado === id);
    if (i < 0) return;
    c.selecionado = id;
    c.pagina = Math.floor(i / CELULAS_POR_PAGINA);
    c.paginaEvidencia = 0;
    this.mostrarCombinacao();
    this.mapa?.selecionarDestaque(id);
    document.getElementById('lente-painel-titulo')?.focus();
  }

  /**
   * Uma leitura (com o reaproveitamento da memória), `combinar` sobre a entrada conferida (T8), que calcula as
   * lentes escolhidas, e a disponibilidade dos municípios das células. A configuração fica gravada no resultado.
   */
  private async aplicarCombinacao(config: ConfigCombinacao): Promise<void> {
    const dados = this.dados;
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
    this.configCombinacao = config;
    this.atualizarAvisoConfig();
    const pedido: PedidoLente = { carga: dados.carga.id, janela: { inicio: filtro.inicio, fim: filtro.fim } };
    this.pedidoLente = pedido;
    const g = this.geracaoSessao;
    const gl = this.geracaoLente;
    const atual = () => g === this.geracaoSessao && gl === this.geracaoLente;
    const inicio = performance.now();
    const chave = chaveLente(pedido);
    const anterior = this.memoriaLente?.chave === chave ? this.memoriaLente : null;
    let resultado: ResultadoCombinacao;
    let mem: MemoriaLente;
    try {
      const lido = await lerRegistros(this.fontesLente(), pedido, atual,
        (feitos, total) => { if (atual()) this.estadoLente({ tipo: 'carregando', etapa: 'registros', feitos, total }); },
        anterior);
      if (!lido || !atual()) return;
      mem = lido.reaproveitado && anterior ? anterior
        : { chave, registros: lido.registros, totalResumo: lido.totalResumo, disponibilidade: new Map() };
      this.memoriaLente = mem;
      resultado = combinar({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: pedido.janela,
        registros: mem.registros, totalResumo: mem.totalResumo, nomes: dados.nomes,
      }, config.lentes, config.operador);
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.mapa?.limparDestaques();
      limparCorpoLente();
      this.estadoLente(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }

    // Disponibilidade já validada nesta memória + a desta aplicação (falhas não são guardadas).
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

    const faltam = municipiosDaCombinacao(resultado).filter((c) => !disponibilidade.has(c));
    let feitos = 0;
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
      this.combinacao.resultado = qualificarCombinacao(resultado, disponibilidade);
      this.mostrarCombinacao();
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
  }

  /** Abre a célula (pela lista ou pelo mapa) e baixa o contorno real de cada área citada (R1-6). */
  private selecionarCelulaSobreposicao(id: string): void {
    const s = this.sobreposicao;
    if (!s) return;
    const i = s.resultado.destaques.findIndex((d) => d.id_destaque === id);
    const d = s.resultado.destaques[i];
    if (!d) return;
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
   * Leitura dos registros (com a memória), da camada da carga por T25 (sem geometria), a lente (T22) sobre a
   * entrada conferida e a disponibilidade dos municípios das células (D13). Uma classe por aplicação.
   */
  private async aplicarSobreposicao(classe: ClasseArea): Promise<void> {
    const dados = this.dados;
    const filtro = this.aplicado;
    if (!dados || !filtro) return;
    this.limparLente({ memoria: false, estado: { tipo: 'carregando', etapa: 'registros', feitos: 0, total: 0 } });
    this.classeSobreposicao = classe;
    const pedido: PedidoLente = { carga: dados.carga.id, janela: { inicio: filtro.inicio, fim: filtro.fim } };
    this.pedidoLente = pedido;
    const g = this.geracaoSessao;
    const gl = this.geracaoLente;
    const atual = () => g === this.geracaoSessao && gl === this.geracaoLente;
    const inicio = performance.now();
    const chave = chaveLente(pedido);
    const anterior = this.memoriaLente?.chave === chave ? this.memoriaLente : null;
    let resultado: ResultadoSobreposicao;
    let mem: MemoriaLente;
    try {
      const lido = await lerRegistros(this.fontesLente(), pedido, atual,
        (feitos, total) => { if (atual()) this.estadoLente({ tipo: 'carregando', etapa: 'registros', feitos, total }); },
        anterior);
      if (!lido || !atual()) return;
      mem = lido.reaproveitado && anterior ? anterior
        : { chave, registros: lido.registros, totalResumo: lido.totalResumo, disponibilidade: new Map() };
      this.memoriaLente = mem;
      this.estadoLente({ tipo: 'carregando', etapa: 'areas', feitos: 0, total: 0 });
      const camada = await lerAreas(fontesAreas(this.sessao.cliente), pedido.carga, atual);
      if (!camada || !atual()) return;
      resultado = sobreposicao({
        carga: { id: dados.carga.id, identidade: dados.carga.identidade }, janela: pedido.janela,
        registros: mem.registros, totalResumo: mem.totalResumo, nomes: dados.nomes,
      }, camada, classe);
    } catch (e) {
      if (!atual() || this.erroDaLente(e, 'pagina') === 'global') return;
      this.mapa?.limparDestaques();
      limparCorpoLente();
      this.estadoLente(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' });
      return;
    }

    // Disponibilidade já validada nesta memória + a desta aplicação (falhas não são guardadas).
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
    if (resultado.estado === 'sem_camada') {
      this.estadoLente({ tipo: 'sem_camada', segundos: (performance.now() - inicio) / 1000 });
      return;
    }

    const faltam = municipiosDaSobreposicao(resultado).filter((c) => !disponibilidade.has(c));
    let feitos = 0;
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
      this.sobreposicao.resultado = qualificarSobreposicao(resultado, disponibilidade);
      this.mostrarSobreposicao();
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

  // --- Camada de áreas protegidas, sob demanda (plano 006, T24) -----------------------------------------

  /** Remove camada, legenda, área selecionada, contornos e a memória das áreas; invalida leituras em voo. */
  private limparAreas(): void {
    this.geracaoAreas++;
    this.camadaAreas = null;
    this.contornos.clear();
    this.areaSelecionada = null;
    this.mapa?.definirAreas([]);
    this.mapa?.definirContornos([]);
    $('botao-areas').setAttribute('aria-pressed', 'false');
    renderLegendaAreas(null, []);
    renderAreaSelecionada(null, () => {});
    renderEstadoAreas({ tipo: 'oculta' }, () => {});
  }

  private async alternarAreas(): Promise<void> {
    if ($('botao-areas').getAttribute('aria-pressed') !== 'true') {
      await this.mostrarAreas();
      return;
    }
    // Ocultar: a visão geral fica na memória para a próxima abertura na mesma carga e sessão.
    this.geracaoAreas++;
    $('botao-areas').setAttribute('aria-pressed', 'false');
    this.mapa?.definirAreas([]);
    renderLegendaAreas(null, []);
    renderEstadoAreas({ tipo: 'oculta' }, () => {});
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
    const botao = $('botao-areas');
    botao.setAttribute('aria-pressed', 'true');
    const g = this.geracaoSessao;
    const ga = ++this.geracaoAreas;
    const atual = () => g === this.geracaoSessao && ga === this.geracaoAreas;
    const tentar = () => void this.mostrarAreas();
    let camada = this.camadaAreas;
    if (camada?.carga !== dados.carga.id) {
      renderEstadoAreas({ tipo: 'carregando' }, tentar);
      try {
        const lido = await lerAreas(fontesAreas(this.sessao.cliente), dados.carga.id, atual, true);
        if (!lido || !atual()) return;
        if (lido.estado === 'sem_camada') {
          botao.setAttribute('aria-pressed', 'false');
          renderEstadoAreas({ tipo: 'sem_camada' }, tentar);
          return;
        }
        camada = { carga: dados.carga.id, areas: lido.areas };
        this.camadaAreas = camada;
      } catch (e) {
        if (!atual() || this.erroDaLente(e, 'geometria') === 'global') return;
        botao.setAttribute('aria-pressed', 'false');
        renderEstadoAreas(e instanceof ErroLente ? { tipo: 'leitura_inconsistente', motivo: e.message } : { tipo: 'falha' }, tentar);
        return;
      }
    }
    const areas = camada.areas;
    this.mapa?.definirAreas(areas.map((a) => ({ chave: chaveArea(a.fonte, a.codigo), classe: a.classe, geometria: a.geometria_geral })));
    const porClasse: Record<ClasseArea, number> = { protecao_integral: 0, uso_sustentavel: 0, terra_indigena: 0 };
    for (const a of areas) porClasse[a.classe] += 1;
    renderLegendaAreas(porClasse, dados.fontes);
    renderEstadoAreas({ tipo: 'visivel', total: areas.length }, tentar);
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
      if (this.todosOsLimites) await this.carregarLimites(null, atual);
      else if (alvo !== null) await this.carregarLimites(alvo, atual);
      if (!atual()) return;
      mostrarErroMapa(null);
    } catch (e) {
      if (!atual()) return;
      // Falha só nos limites: os pontos e os números seguem válidos.
      if (e instanceof ErroConsulta && (e.tipo === 'acesso_negado' || e.tipo === 'sessao_expirada')) {
        this.tratarErroGlobal(e);
        return;
      }
      mostrarErroMapa('Limites municipais indisponíveis agora; os pontos e os números continuam válidos.');
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
    renderContagemMapa(r.pagina.registros.length, r.pagina.total, this.mapa.contagem().limites);
  }

  private async alternarLimites(): Promise<void> {
    const botao = $('botao-limites');
    const ativar = botao.getAttribute('aria-pressed') !== 'true';
    const g = this.geracaoSessao;
    const c = this.geracaoConsulta;
    const atual = () => g === this.geracaoSessao && c === this.geracaoConsulta;
    this.todosOsLimites = ativar;
    botao.setAttribute('aria-pressed', String(ativar));
    if (!this.resultado) return;
    try {
      if (ativar) await this.carregarLimites(null, atual);
      if (!atual()) return;
      mostrarErroMapa(null);
    } catch (e) {
      if (!atual()) return;
      this.todosOsLimites = false;
      botao.setAttribute('aria-pressed', 'false');
      if (e instanceof ErroConsulta && (e.tipo === 'acesso_negado' || e.tipo === 'sessao_expirada')) {
        this.tratarErroGlobal(e);
        return;
      }
      mostrarErroMapa('Limites municipais indisponíveis agora; os pontos e os números continuam válidos.');
    }
    this.desenharLimites();
  }
}
