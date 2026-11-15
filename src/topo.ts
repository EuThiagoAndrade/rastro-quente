// Topo (plano 007, T13 e T17): alternância de tema e diálogos nativos "Sobre os dados" e "Como ler esta tela".
// O tema segue a preferência do sistema; a alternância vale só enquanto a página estiver aberta (nada é gravado
// no navegador, como todo o resto da interface, ADR-007).

const escuroNoSistema = (): MediaQueryList => window.matchMedia('(prefers-color-scheme: dark)');

/** Tema efetivo: o escolhido na alternância ou, sem escolha, o do sistema. */
export function temaEscuro(): boolean {
  const escolhido = document.documentElement.dataset['tema'];
  return escolhido ? escolhido === 'escuro' : escuroNoSistema().matches;
}

export function iniciarTema(): void {
  const botao = document.getElementById('botao-tema');
  if (!botao) return;
  const sincronizar = () => botao.setAttribute('aria-pressed', String(temaEscuro()));
  botao.addEventListener('click', () => {
    document.documentElement.dataset['tema'] = temaEscuro() ? 'claro' : 'escuro';
    sincronizar();
  });
  escuroNoSistema().addEventListener('change', sincronizar);
  sincronizar();
}

/** Liga um botão a um `<dialog>` modal: abre com foco dentro e devolve o foco ao botão ao fechar (Esc ou "Fechar"). */
export function ligarDialogo(botaoId: string, dialogoId: string): void {
  const botao = document.getElementById(botaoId);
  const dialogo = document.getElementById(dialogoId);
  if (!(botao && dialogo instanceof HTMLDialogElement)) return;
  botao.addEventListener('click', () => {
    if (!dialogo.open) dialogo.showModal();
  });
  for (const fechar of dialogo.querySelectorAll<HTMLButtonElement>('[data-fechar]')) {
    fechar.addEventListener('click', () => dialogo.close());
  }
  dialogo.addEventListener('close', () => {
    if (!botao.hidden) botao.focus();
  });
}

/** Fecha todos os diálogos (logout, expiração, perda de acesso). */
export function fecharDialogos(): void {
  for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
}
