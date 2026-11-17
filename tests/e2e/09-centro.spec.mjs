// Ciclo 007, issue #62 — centro da tela: limites (em 02-consulta), densidade por célula (T8), série diária e mensal
// com meses parciais (T9), somas iguais ao total principal (T19) e mapa ampliado (T17). Fixtures fictícias: a padrão
// (outubro/2026, 100 principais e 5 só no envelope da sensibilidade) e a da recorrência (agosto a outubro/2026).
import { test, expect } from '@playwright/test';
import { sqlAdmin } from '../../scripts/banco/local.mjs';
import { cadastrarRp } from './contas.mjs';
import { alternarCamada, consultar, entrar } from './ajuda.mjs';
import { MUNICIPIOS, SQL_LIMPEZA, sqlFixture, sqlFixtureRecorrencia } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });
test.beforeAll(() => cadastrarRp());

const serie = (page) => page.locator('#serie');
const somaBarras = async (page) => (await serie(page).locator('.serie__barra').evaluateAll((bs) => bs.map((b) => Number(b.dataset.total))))
  .reduce((a, b) => a + b, 0);

test('densidade: começa desligada; ligada, legenda "contagem, não gravidade" e soma = total principal', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
  await expect(page.locator('#c-densidade')).not.toBeChecked();
  await expect(page.locator('#legenda-densidade')).toBeHidden();

  await alternarCamada(page, 'c-densidade');
  await page.locator('.flutuante--legenda > summary').click();
  const legenda = page.locator('#legenda-densidade');
  await expect(legenda).toBeVisible();
  await expect(legenda).toContainText('Detecções por célula: contagem, não gravidade');
  await expect(legenda.locator('.escala-densidade > span')).toHaveText(['1', '2–3', '4–9', '10–24', '25 ou mais']);
  // O envelope (5 registros só da sensibilidade) não entra: 100, e não 105.
  await expect(legenda).toHaveAttribute('data-total', '100');
  expect(Number(await legenda.getAttribute('data-celulas'))).toBeGreaterThan(0);

  // Segue o recorte aplicado: Alfa tem 60.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '60');
  await expect(legenda).toHaveAttribute('data-total', '60');

  // Desligar esconde a legenda; "Detecções individuais" desliga os pontos sem mudar os números.
  await alternarCamada(page, 'c-densidade');
  await expect(legenda).toBeHidden();
  await alternarCamada(page, 'c-pontos');
  await expect(page.locator('#c-pontos')).not.toBeChecked();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '60');
});

test('série diária: 31 barras na janela de 31 dias e 6 num intervalo de 6 dias, somando o total principal', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(serie(page)).toHaveAttribute('data-unidade', 'dia');
  await expect(serie(page).locator('.serie__barra')).toHaveCount(31);
  await expect(serie(page)).toHaveAttribute('data-total', '100');
  expect(await somaBarras(page)).toBe(100);
  await expect(page.locator('.serie__barra.parcial')).toHaveCount(0);

  await consultar(page, { inicio: '2026-10-05', fim: '2026-10-10' });
  await expect(page.locator('#periodo-resumo')).toContainText('6 dias GMT');
  await expect(serie(page).locator('.serie__barra')).toHaveCount(6);
  const total = await page.locator('#serie').getAttribute('data-total');
  await expect(serie(page)).toHaveAttribute('data-total', total);
  expect(String(await somaBarras(page))).toBe(total);
});

test('mapa ampliado: colunas laterais saem, foco no mapa; Esc volta com o foco no botão', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await entrar(page, 'rp');
  const botao = page.locator('#botao-ampliar');
  await expect(botao).toHaveAttribute('aria-label', 'Ampliar mapa');
  await botao.click();
  await expect(page.locator('body')).toHaveClass(/mapa-ampliado/);
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  await expect(botao).toHaveAttribute('aria-label', 'Reduzir mapa');
  await expect(page.locator('#filtros')).toBeHidden();
  await expect(page.locator('#resultado')).toBeHidden();
  await expect(page.locator('#mapa')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/mapa-ampliado/);
  await expect(page.locator('#filtros')).toBeVisible();
  await expect(botao).toBeFocused();
  // O mesmo botão também volta.
  await botao.click();
  await botao.click();
  await expect(page.locator('#resultado')).toBeVisible();
  await expect(botao).toBeFocused();
});

test.describe('série mensal (fixture de agosto a outubro/2026)', () => {
  test.beforeAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixtureRecorrencia());
  });
  test.afterAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixture());
  });

  test('janela inteira: 3 barras mensais sem mês parcial; 15/08 a 14/10: agosto e outubro com *', async ({ page }) => {
    await entrar(page, 'rp');
    await expect(page.locator('#serie')).toHaveAttribute('data-total', '35');
    await expect(serie(page)).toHaveAttribute('data-unidade', 'mes');
    await expect(serie(page).locator('.serie__barra')).toHaveCount(3);
    await expect(serie(page).locator('.serie__rotulo')).toHaveText(['ago', 'set', 'out']);
    await expect(serie(page)).toHaveAttribute('data-total', '35');
    expect(await somaBarras(page)).toBe(35);
    await expect(page.locator('#serie-legenda')).not.toContainText('mês parcial');

    await consultar(page, { inicio: '2026-08-15', fim: '2026-10-14' });
    await expect(serie(page).locator('.serie__barra')).toHaveCount(3);
    await expect(serie(page).locator('.serie__rotulo')).toHaveText(['ago*', 'set', 'out*']);
    await expect(serie(page).locator('.serie__barra.parcial')).toHaveCount(2);
    await expect(page.locator('#serie-legenda')).toContainText('* mês parcial: só os dias do período.');
    const total = await page.locator('#serie').getAttribute('data-total');
    await expect(serie(page)).toHaveAttribute('data-total', total);
    expect(String(await somaBarras(page))).toBe(total);
    // A tabela é a alternativa em texto, com o mês parcial escrito.
    await page.locator('#serie-corpo summary').click();
    await expect(page.locator('#serie-corpo tbody tr td:first-child')).toHaveText(['ago/2026 * (mês parcial)', 'set/2026', 'out/2026 * (mês parcial)']);
  });
});
