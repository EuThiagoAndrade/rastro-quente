// Issue #71 (trilha curta, BL-011 a BL-016): altura da página, barras proporcionais, mapa ampliado, controles do mapa,
// "Consulta" recolhida e foco verde. Fixtures fictícias (Município Alfa 60, Beta 30, Gama 10 detecções).
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirOpcoesMapa, entrar } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

test('computador: a página tem a altura da tela, sem espaço depois do rodapé', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-painel', 'pronto');
  await expect(page.locator('#serie .serie__barra').first()).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(900);
});

test('aba Municípios: nome e contagem agrupados em cada linha, conforme proposta do ciclo 010', async ({ page }) => {
  await entrar(page, 'rp');
  await page.locator('#aba-municipios').click();
  await expect(page.locator('#lista-municipios .num')).toHaveText(['60', '30', '10']);
  await expect(page.locator('#lista-municipios .sub-nome')).toHaveText(['60 focos', '30 focos', '10 focos']);
  await expect(page.locator('#lista-municipios .barra')).toHaveCount(0);
});

test('mapa ampliado ocupa a altura da tela', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await entrar(page, 'rp');
  await page.locator('#botao-ampliar').click();
  await expect(page.locator('body')).toHaveClass(/mapa-ampliado/);
  const mapa = await page.locator('.mapa-cartao').boundingBox();
  expect(mapa.height).toBeGreaterThan(900 * 0.7);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(900);
});

test('painel "Mapa" ao lado de "Camadas": fechado, só duas pílulas; aberto, fundo, lista e enquadrar', async ({ page }) => {
  await entrar(page, 'rp');
  const painel = page.locator('#opcoes-mapa');
  await expect(painel.locator(':scope > summary')).toHaveText('Mapa');
  for (const id of ['#fundo-satelite', '#fundo-nenhum', '#botao-lista-focos', '#botao-enquadrar']) await expect(page.locator(id)).toBeHidden();
  const mapa = await painel.boundingBox();
  const camadas = await page.locator('#camadas').boundingBox();
  expect(Math.abs(mapa.y - camadas.y)).toBeLessThan(2);
  expect(mapa.x + mapa.width).toBeLessThanOrEqual(camadas.x);
  await painel.locator(':scope > summary').click();
  for (const id of ['#fundo-nenhum', '#botao-lista-focos', '#botao-enquadrar']) await expect(page.locator(id)).toBeVisible();
  await page.locator('#botao-lista-focos').click();
  await expect(page.locator('#botao-lista-focos')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#lista-focos')).toBeVisible();
});

test('"Consulta" recolhida não mostra resumo e o foco da interface é verde', async ({ page }) => {
  await entrar(page, 'rp');
  const consulta = page.locator('#secao-consulta');
  await consulta.locator('summary').click();
  await expect(consulta).not.toHaveAttribute('open', '');
  await expect(consulta.locator('summary')).toHaveText('Consulta');
  await expect(page.locator('#form-consulta')).not.toContainText('As lentes ainda usam todo Mato Grosso');
  await consulta.locator('summary').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const cor = await consulta.locator('summary').evaluate((s) => getComputedStyle(s).outlineColor);
  expect(cor).toBe('rgb(63, 107, 85)');
});

test.describe('painel "Mapa" em tela pequena (R3-1)', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 640 } });

  test('a 320 px com texto a 200%, o menu cabe no cartão e rola até a última opção', async ({ page }) => {
    await entrar(page, 'rp');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await abrirOpcoesMapa(page, true);
    const menu = page.locator('#opcoes-mapa .painel-mapa');
    const cartao = await page.locator('.mapa-cartao').boundingBox();
    await expect.poll(async () => {
      const m = await menu.boundingBox();
      return m.y + m.height <= cartao.y + cartao.height + 1 && m.y >= cartao.y;
    }).toBe(true);
    for (const id of ['#botao-arrastar', '#botao-enquadrar']) {
      const botao = page.locator(id);
      await botao.scrollIntoViewIfNeeded();
      const b = await botao.boundingBox();
      const m = await menu.boundingBox();
      expect(b.y).toBeGreaterThanOrEqual(m.y - 1);
      expect(b.y + b.height).toBeLessThanOrEqual(m.y + m.height + 1);
    }
    await page.locator('#botao-enquadrar').tap();
  });
});
