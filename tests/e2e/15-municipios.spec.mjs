// Issue #98: verificações focadas da navegação municipal, com a fixture fictícia comum.
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { alternarCamada, consultar, entrar, escolherLente } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

for (const [width, height, escuro] of [[1440, 900, false], [390, 844, true]]) {
  test(`lista → detalhe → mapa → consulta municipal (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await entrar(page, 'rp');
    if (escuro) await page.getByRole('button', { name: 'Usar tema escuro' }).click();
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    await expect(page.locator('#municipios-resposta')).toContainText('100 detecções em 3 municípios');
    await expect(page.locator('#municipios-resposta')).toContainText('Município Alfa — 60');
    await expect(page.locator('#municipios-periodo')).toContainText('2026-10-01 a 2026-10-31');
    await page.locator('[data-ordem="nome"]').click();
    const linha = page.locator('#lista-municipios button[data-codigo="9900002"]');
    const contexto = await page.locator('#pergunta-contexto').textContent();
    await linha.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#municipio-detalhe-titulo')).toBeFocused();
    await expect(page.locator('#municipio-estadual-numeros')).toContainText('30');
    await expect(page.locator('#cartao-dias')).toHaveCount(0);
    await expect(page.locator('#f-municipio')).toHaveValue('');
    await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
    await expect(page.locator('#pergunta-contexto')).toHaveText(contexto);
    await page.locator('#municipio-mostrar-mapa').click();
    await expect(page.locator('#municipio-mapa-estado')).toHaveAttribute('data-estado', 'exibido');
    await expect(page.locator('#f-municipio')).toHaveValue('');
    await page.locator('#municipio-voltar').click();
    await expect(linha).toBeFocused();
    await expect(page.locator('[data-ordem="nome"]')).toHaveAttribute('aria-pressed', 'true');
    await linha.click();
    await page.locator('#municipio-consultar').click();
    await expect(page.locator('#cartao-focos')).toHaveText('30');
    await expect(page.locator('#cartao-dias')).toHaveText('10');
    await expect(page.locator('#cartao-celulas')).toHaveAttribute('data-estado', 'completo');
    await expect(page.locator('#f-municipio')).toHaveValue('9900002');
    await expect(page.locator('#municipio-consultar')).toHaveCount(0);
    await page.locator('#municipio-ver-destaques').click();
    await expect(page.locator('#aba-destaques')).toHaveAttribute('aria-selected', 'true');
    await page.locator('#aba-municipios').click();
    await page.getByRole('button', { name: 'Ver todo Mato Grosso' }).click();
    await expect(page.locator('#lista-municipios button')).toHaveCount(3);
    await expect(page.locator('#municipio-detalhe-titulo')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/municipios-lista-${width}.png` });
    await linha.click();
    await page.screenshot({ path: `test-results/municipios-detalhe-${width}.png` });
  });
}

test('geometria sob demanda: falha, ausência, nova tentativa e retorno tardio descartado', async ({ page }) => {
  let modo = 'ausente';
  let liberar;
  await page.route('**/rest/v1/municipios?**', async (route) => {
    if (!new URL(route.request().url()).searchParams.get('select')?.includes('geometria_exibicao')) return route.continue();
    if (!new URL(route.request().url()).searchParams.has('codigo')) return route.fulfill({ json: [] });
    if (modo === 'falha') return route.fulfill({ status: 500, json: { message: 'falha fictícia' } });
    if (modo === 'tardio') await new Promise((resolve) => { liberar = resolve; });
    if (modo === 'sucesso' || modo === 'tardio') return route.continue();
    return route.fulfill({ json: [] });
  });
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-limites', 'completo');
  await alternarCamada(page, 'c-limites');
  await page.locator('#lista-municipios button[data-codigo="9900001"]').click();
  await page.locator('#municipio-mostrar-mapa').click();
  await expect(page.locator('#municipio-mapa-estado')).toHaveAttribute('data-estado', 'ausente');
  modo = 'falha';
  await page.locator('#municipio-mostrar-mapa').click();
  await expect(page.locator('#municipio-mapa-estado')).toHaveAttribute('data-estado', 'falha');
  modo = 'tardio';
  await page.locator('#municipio-mostrar-mapa').click();
  await expect(page.locator('#municipio-mapa-estado')).toHaveAttribute('data-estado', 'carregando');
  await page.locator('#municipio-voltar').click();
  const recebido = page.waitForResponse((r) => r.url().includes('geometria_exibicao') && r.url().includes('codigo='));
  liberar();
  await recebido;
  await expect(page.locator('#municipio-detalhe-titulo')).toHaveCount(0);
  modo = 'sucesso';
  await page.locator('#lista-municipios button[data-codigo="9900001"]').click();
  await page.locator('#municipio-mostrar-mapa').click();
  await expect(page.locator('#municipio-mapa-estado')).toHaveAttribute('data-estado', 'exibido');
  await expect(page.locator('#c-limites')).not.toBeChecked();
  await expect(page.locator('#f-municipio')).toHaveValue('');
  await consultar(page, { inicio: '2026-10-25', fim: '2026-10-31' });
  await expect(page.locator('#municipios-resposta')).toContainText('Nenhuma detecção');
  await expect(page.locator('#municipio-detalhe-titulo')).toHaveCount(0);
});

test('destaques estaduais permanecem identificados na inspeção', async ({ page }) => {
  await entrar(page, 'rp');
  await escolherLente(page, 'concentracao');
  await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
  await page.locator('#aba-municipios').click();
  await page.locator('#lista-municipios button[data-codigo="9900001"]').click();
  await expect(page.locator('#municipio-estadual-numeros')).toContainText('Participação na concentração estadual');
  await expect(page.locator('#municipios-corpo')).toContainText('Concentração só existe no estado');
  await page.locator('#municipio-ver-destaques').click();
  await expect(page.locator('#resumo-lente-recorte')).toContainText('em todo Mato Grosso');
  await expect(page.locator('#f-municipio')).toHaveValue('');
});
