// Ciclo 013 (issue #115): as duas colunas não rolam na horizontal, com todas as seções abertas e o mouse sobre os
// itens. O transbordo existia sempre; a barra transparente da coluna só ganhava cor com o hover.
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { entrar, escolherLente } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

/** Elementos que passam da largura útil da coluna, e a medida da própria coluna. */
function medirColuna(id) {
  const c = document.getElementById(id);
  const caixa = c.getBoundingClientRect();
  const estilo = getComputedStyle(c);
  const direita = caixa.right - parseFloat(estilo.borderRightWidth);
  const esquerda = caixa.left + parseFloat(estilo.borderLeftWidth);
  const fora = [];
  for (const el of c.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (getComputedStyle(el).position === 'absolute' && el.closest('.so-leitor')) continue;
    if (r.right > direita + 0.5 || r.left < esquerda - 0.5) {
      fora.push(`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''} (${Math.round(r.left - esquerda)}…${Math.round(r.right - direita)})`);
    }
  }
  return { scrollWidth: c.scrollWidth, clientWidth: c.clientWidth, fora };
}

for (const [width, height] of [[1440, 900], [1280, 720]]) {
  test(`colunas sem rolagem horizontal, seções abertas e hover (${width}×${height})`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await entrar(page, 'rp');
    await escolherLente(page, 'concentracao');
    await page.locator('#filtros details.secao').evaluateAll((ds) => { for (const d of ds) d.open = true; });
    // Itens visíveis da coluna (os rótulos só para leitor de tela ficam de fora: não recebem o mouse).
    const itens = page.locator('#filtros .opcao-lente, #filtros label:not(.so-leitor), #filtros summary');
    const total = await itens.count();
    for (let i = 0; i < total; i++) {
      const item = itens.nth(i);
      if (!(await item.isVisible())) continue;
      await item.scrollIntoViewIfNeeded();
      await item.hover({ force: true });
      const m = await page.evaluate(medirColuna, 'filtros');
      expect(m.fora, `coluna esquerda: elementos fora (item ${i})`).toEqual([]);
      expect(m.scrollWidth, 'coluna esquerda: rolagem horizontal').toBeLessThanOrEqual(m.clientWidth);
    }
    for (const aba of ['aba-destaques', 'aba-municipios']) {
      await page.locator(`#${aba}`).click();
      await page.locator('#resultado').hover();
      const d = await page.evaluate(medirColuna, 'resultado');
      expect(d.fora, `coluna direita (${aba}): elementos fora`).toEqual([]);
      expect(d.scrollWidth, `coluna direita (${aba}): rolagem horizontal`).toBeLessThanOrEqual(d.clientWidth);
    }
  });
}
