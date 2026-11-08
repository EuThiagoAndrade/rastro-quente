// Controlador: sessão, versão fixada, consulta, paginação, mapa e estados. Duas gerações descartam
// respostas obsoletas: a da sessão (login, logout, expiração, negação) e a da consulta (a última vence).
// Nenhum dado de consulta é gravado em armazenamento; sair, expirar ou perder o acesso limpa a tela.
import {
  $, criarPainelRegistros, mostrarErroFiltro, mostrarErroMapa, renderAcesso, renderAvisoMapa, renderContagemMapa,
  renderDisponibilidade, renderEstadoConsulta, renderFiltros, renderMunicipios, renderProveniencia, renderResumo,
  renderSelecao, renderSerie, limparResultados, type Acesso, type EstadoConsulta, type PainelRegistros,
} from './apresentacao.ts';
import { lerConfiguracao } from './config.ts';
import {
  consultarDeteccoes, consultarDisponibilidade, consultarResumo, lerCargaVigente, lerLimites, lerMunicipios,
  lerProveniencia, sondarAcesso, type Filtro,
} from './consulta.ts';
import { ErroConsulta, type TipoErro } from './erros.ts';
import { primeiroDiaGmt, ultimoDiaGmt } from './formato.ts';
import { criarMapa, type Mapa } from './mapa.ts';
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

export function iniciar(): void {
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
  private selecionado: string | null = null;
  private mapa: Mapa | null = null;
  private painel: PainelRegistros;
  private limites = new Map<number, Limite>();
  private todosOsLimites = false;
  private geracaoSessao = 0;
  private geracaoConsulta = 0;
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
    $('form-consulta').addEventListener('submit', (ev) => { ev.preventDefault(); void this.consultar(); });
    $('botao-janela').addEventListener('click', () => {
      if (!this.dados) return;
      $<HTMLInputElement>('f-inicio').value = this.dados.janela.inicio;
      $<HTMLInputElement>('f-fim').value = this.dados.janela.fim;
      void this.consultar();
    });
    $('botao-limites').addEventListener('click', () => void this.alternarLimites());
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
      renderProveniencia(carga, prov.fontes, prov.malhas);
      renderAvisoMapa(prov.malhas);
      $<HTMLInputElement>('f-inicio').value = this.dados.janela.inicio;
      $<HTMLInputElement>('f-fim').value = this.dados.janela.fim;
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
  }

  // --- Consulta --------------------------------------------------------------------------------------

  private garantirMapa(): void {
    if (this.mapa) return;
    this.mapa = criarMapa($('mapa'));
    this.mapa.aoSelecionar((id) => this.selecionar(id));
    if (window.matchMedia('(pointer: coarse)').matches) {
      // Em tela de toque, um dedo rola a página; o mapa só arrasta quando o usuário ativa.
      this.mapa.permitirArrastar(false);
      $('botao-arrastar').hidden = false;
    }
  }

  private lerFiltro(): Filtro | null {
    if (!this.dados) return null;
    const inicio = $<HTMLInputElement>('f-inicio').value;
    const fim = $<HTMLInputElement>('f-fim').value;
    const { janela } = this.dados;
    let erro: string | null = null;
    if (!inicio || !fim) erro = 'Informe o início e o fim do período (dias GMT).';
    else if (inicio > fim) erro = 'O início do período não pode ser depois do fim.';
    else if (inicio < janela.inicio || fim > janela.fim) erro = `O período precisa estar dentro da janela da versão: ${janela.inicio} a ${janela.fim}.`;
    mostrarErroFiltro(erro);
    if (erro) {
      $(!inicio || inicio > fim || inicio < janela.inicio ? 'f-inicio' : 'f-fim').focus();
      return null;
    }
    const codigo = $<HTMLSelectElement>('f-municipio').value;
    return { carga: this.dados.carga.id, inicio, fim, municipio: codigo ? Number(codigo) : null };
  }

  private estado(e: EstadoConsulta): void {
    renderEstadoConsulta(e, () => void this.verificarAcesso());
  }

  private async consultar(): Promise<void> {
    const dados = this.dados;
    const filtro = this.lerFiltro();
    if (!dados || !filtro) return;
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
    void this.consultar();
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
