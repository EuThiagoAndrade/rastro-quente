// Issue #71 (trilha curta, BL-011 a BL-016): altura da página, barras proporcionais, mapa ampliado, controles do mapa,
// "Consulta" recolhida e foco verde. Fixtures fictícias (Município Alfa 60, Beta 30, Gama 10 detecções).
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { entrar } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

test('computador: a página tem a altura da tela, sem espaço depois do rodapé', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-painel', 'pronto');
  await expect(page.locator('#serie .serie__barra').first()).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(900);
});

test('aba Municípios: a barra é proporcional ao número', async ({ page }) => {
  await entrar(page, 'rp');
  await page.locator('#aba-municipios').click();
  await expect(page.locator('#lista-municipios .num')).toHaveText(['60', '30', '10']);
  const larguras = await page.locator('#lista-municipios .barra').evaluateAll((l) => l.map((b) => b.getBoundingClientRect().width));
  expect(larguras[1] / larguras[0]).toBeCloseTo(0.5, 1);
  expect(larguras[2] / larguras[0]).toBeCloseTo(1 / 6, 1);
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
