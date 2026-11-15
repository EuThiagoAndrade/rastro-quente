// Topo (plano 007, T13; visual da referência V13): botão de tema (lua/sol) e diálogos nativos "Sobre os dados" e
// "Como ler esta tela". A tela abre sempre no tema claro, como na V13; a troca vale só enquanto a página estiver
// aberta (nada é gravado no navegador, ADR-007).

export const temaEscuro = (): boolean => document.documentElement.dataset['tema'] === 'escuro';

export function iniciarTema(): void {
  const botao = document.getElementById('botao-tema');
  if (!botao) return;
  const sincronizar = () => {
    const escuro = temaEscuro();
    const rotulo = escuro ? 'Usar tema claro' : 'Usar tema escuro';
    botao.setAttribute('aria-pressed', String(escuro));
    botao.setAttribute('aria-label', rotulo);
    botao.title = rotulo;
  };
  botao.addEventListener('click', () => {
    document.documentElement.dataset['tema'] = temaEscuro() ? 'claro' : 'escuro';
    sincronizar();
  });
  sincronizar();
}

/** Liga um botão a um `<dialog>` modal: abre com foco dentro e devolve o foco ao botão ao fechar (Esc ou botão). */
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
