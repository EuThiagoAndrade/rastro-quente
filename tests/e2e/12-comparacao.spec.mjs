// Ciclo 008, item 1 (issue #77): comparação de dois períodos e de dois municípios, sem IA. Fixture fictícia do E2E
// (Município Alfa 60, Beta 30, Gama 10 detecções em outubro de 2026). Valores esperados contados à mão a partir de
// tests/e2e/fixture.mjs: de 01 a 10/10, Alfa 29, Beta 18, Gama 8 (55); de 11 a 20/10, Alfa 29, Beta 12, Gama 2 (43);
// de 22 a 31/10, nenhuma. Na janela inteira, Alfa tem 21 dias com detecção (01 a 21) e Beta 10 (05 a 14).
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirSecao, consultar, entrar, escolherLente } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

const MODO = (v) => `input[name="c-modo"][value="${v}"]`;

async function modo(page, valor) {
  await abrirSecao(page, 'secao-comparar');
  await page.locator(MODO(valor)).check();
}

async function periodoB(page, inicio, fim) {
  await page.locator('#cmp-b-inicio').fill(inicio);
  await page.locator('#cmp-b-fim').fill(fim);
  await page.locator('#cmp-b-fim').blur();
}

const celulas = (page) => page.locator('#comparacao-corpo table').first().locator('tbody tr');

test('dois períodos: A é o recorte aplicado, B de mesma duração; números lado a lado e B − A', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '55');
  await modo(page, 'periodos');
  await expect(page.locator('#aba-comparacao')).toBeVisible();
  await expect(page.locator('#aba-comparacao')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#cmp-a-periodo')).toContainText('01/10/2026 a 10/10/2026 (10 dias GMT)');
  // B padrão: o anterior não cabe na versão; vem o seguinte, de 11 a 20/10.
  await expect(page.locator('#cmp-b-inicio')).toHaveValue('2026-10-11');
  await expect(page.locator('#cmp-b-fim')).toHaveValue('2026-10-20');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(celulas(page).first().locator('td')).toHaveText(['Detecções (total principal)', '55', '43', '−12']);
  await expect(page.locator('#comparacao-conclusao')).toHaveAttribute('data-conclusao', 'conclusiva');
  await expect(page.locator('#comparacao-ressalvas')).toContainText('entrar ou sair não indica mudança real');
  // O mapa, a série e os municípios continuam em A.
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '55');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '55');
});

test('períodos de duração diferente são recusados, sem resultado comparativo', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await modo(page, 'periodos');
  await periodoB(page, '2026-10-11', '2026-10-21');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'recusada');
  await expect(page.locator('#cmp-erro')).toHaveText('os períodos precisam ter o mesmo número de dias GMT (A tem 10, B tem 11)');
  await expect(page.locator('#comparacao-corpo')).toBeEmpty();
});

test('lente nos dois lados: unidades classificadas, evidências por lado e mapa alternado com rótulo', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await escolherLente(page, 'concentracao');
  await modo(page, 'periodos');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(page.locator('#comparacao-descricao')).toContainText('lente Concentração');
  // Os três municípios da fixture têm detecções nos dois períodos: todos ficam entre os destacados (menos de 10).
  await expect(page.locator('#comparacao-contagem')).toHaveText('0 apareceram só em B · 0 só em A · 3 nos dois períodos');
  const itens = page.locator('#comparacao-itens > li');
  await expect(itens).toHaveCount(3);
  await expect(itens.nth(0).locator('summary')).toHaveText('Município Alfa (9900001) — permaneceu nos destaques observados');
  await itens.nth(0).locator('summary').click();
  await expect(itens.nth(0)).toContainText('29 detecções na janela');
  await expect(itens.nth(0)).toContainText('Disponibilidade em A: 8 de 10 dias sem evidência de lacuna');
  await expect(itens.nth(0)).toContainText('Disponibilidade em B: 10 de 10 dias sem evidência de lacuna');
  // Mapa: A por padrão, B com rótulo inequívoco, e de volta.
  await expect(page.locator('#mapa-lado')).toContainText('Mapa: lado A (recorte aplicado) · 01/10/2026 a 10/10/2026 · todo Mato Grosso');
  await page.locator('#comparacao-mapa button[data-lado="B"]').click();
  await expect(page.locator('#comparacao-mapa button[data-lado="B"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#mapa-lado')).toContainText('Mapa: lado B · 11/10/2026 a 20/10/2026');
  await page.locator('#comparacao-mapa button[data-lado="A"]').click();
  await expect(page.locator('#mapa-lado')).toContainText('lado A');
  // A aba Destaques continua com a lente comum, no recorte A.
  await page.locator('#aba-destaques').click();
  await expect(page.locator('#aba-destaques')).toHaveText('Lentes · 3');
});

test('sem unidades destacadas nos dois lados, a aba diz isso em vez de uma lista vazia', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await escolherLente(page, 'persistencia');
  await modo(page, 'periodos');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(page.locator('#comparacao-sem-unidades')).toHaveText('Nenhuma unidade destacada em nenhum dos dois lados.');
});

test('lado estadual sem detecções: confere todos os municípios antes de concluir e preserva o zero observado', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await escolherLente(page, 'persistencia');
  await modo(page, 'periodos');
  await periodoB(page, '2026-10-22', '2026-10-31');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(page.locator('#comparacao-conclusao')).toHaveAttribute('data-conclusao', 'conclusiva');
  await expect(celulas(page).first().locator('td')).toHaveText(['Detecções (total principal)', '55', '0', '−55']);
  await expect(page.locator('#comparacao-ressalvas')).toContainText('Lado B: zero detecção observada; não é evidência de ausência de fogo');
  // Disponibilidade de todos os municípios, sob demanda, com as classes por município.
  await page.locator('#botao-lista-completa').click();
  await expect(page.locator('#comparacao-disponibilidade')).toHaveAttribute('data-estado-lista', 'completa');
  await expect(page.locator('#comparacao-disponibilidade tbody tr')).toHaveCount(3);
  await expect(page.locator('#comparacao-disponibilidade tbody tr').first()).toContainText('Município Alfa (9900001)');
  await expect(page.locator('#comparacao-disponibilidade tbody tr').first()).toContainText('8 de 10 dias sem evidência de lacuna, 2 com lacuna conhecida');
});

test('dois municípios: A é o da Consulta; contagens, dias e diferença; contexto estadual em seção própria', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: 9900001 });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '60');
  await modo(page, 'municipios');
  await expect(page.locator('#cmp-a-municipio')).toHaveText('A: Município Alfa, o município da Consulta.');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'incompleta');
  await page.locator('#cmp-municipio-b').selectOption('9900002');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(celulas(page).nth(0).locator('td')).toHaveText(['Detecções (total principal)', '60', '30', '−30']);
  await expect(celulas(page).nth(1).locator('td')).toHaveText(['Dias com detecção', '21', '10', '−11']);
  await expect(page.locator('#comparacao-disponibilidade tbody tr').nth(0).locator('td')).toHaveText(['A', 'Município Alfa (9900001)', '29 de 31 dias sem evidência de lacuna, 2 com lacuna conhecida (cobertura não comprovada)']);
  await expect(page.locator('#comparacao-disponibilidade tbody tr').nth(1).locator('td')).toHaveText(['B', 'Município Beta (9900002)', '28 de 31 dias sem evidência de lacuna, 3 com incidência indeterminada (cobertura não comprovada)']);
  await expect(page.locator('#comparacao-ressalvas')).toContainText('Contagens absolutas');
  await expect(page.locator('#comparacao-ressalvas')).toContainText('célula na divisa');
  // A concentração continua indisponível na consulta municipal comum (CM-6).
  await expect(page.locator('input[name="l-lente"][value="concentracao"]')).toBeDisabled();
  await page.locator('#botao-contexto-estadual').click();
  await expect(page.locator('#comparacao-contexto')).toHaveAttribute('data-estado-contexto', 'pronto');
  await expect(page.locator('#comparacao-contexto')).toContainText('Concentração estadual: 3 municípios destacados (corte em 10 detecções, com empatados).');
  await expect(page.locator('#comparacao-contexto tbody tr').nth(0).locator('td')).toHaveText(['A', 'Município Alfa (9900001)', '60', 'destacado (1º)']);
  await expect(page.locator('#comparacao-contexto tbody tr').nth(1).locator('td')).toHaveText(['B', 'Município Beta (9900002)', '30', 'destacado (2º)']);
  await expect(page.locator('input[name="l-lente"][value="concentracao"]')).toBeDisabled();
});

test('o mesmo município nos dois lados explica a seleção repetida, com diferença zero', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: 9900003 });
  await modo(page, 'municipios');
  await page.locator('#cmp-municipio-b').selectOption('9900003');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(page.locator('#comparacao-ressalvas')).toContainText('O mesmo município foi escolhido nos dois lados');
  await expect(celulas(page).nth(0).locator('td')).toHaveText(['Detecções (total principal)', '10', '10', '0']);
});

test('trocar o recorte refaz a comparação; "Limpar tudo" tira a aba; teclado entre as três abas', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await modo(page, 'periodos');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await expect(page.locator('#secao-comparar .marca-ativa')).toBeVisible();
  // Setas entre as abas visíveis.
  await page.locator('#aba-comparacao').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('#aba-destaques')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#aba-comparacao')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#aba-destaques')).toBeFocused();
  // Novo recorte A com a mesma duração de B: refeito.
  await consultar(page, { inicio: '2026-10-02', fim: '2026-10-11' });
  await expect(page.locator('#cmp-a-periodo')).toContainText('02/10/2026 a 11/10/2026');
  await page.locator('#aba-comparacao').click();
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await page.getByRole('button', { name: 'Limpar tudo' }).click();
  await expect(page.locator('#aba-comparacao')).toBeHidden();
  await expect(page.locator(MODO('nenhuma'))).toBeChecked();
  await expect(page.locator('#aba-municipios')).toHaveAttribute('aria-selected', 'true');
});

test('320 px e tema escuro: a aba de comparação cabe sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await modo(page, 'periodos');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await page.locator('#botao-tema').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.locator('#comparacao-mapa button[data-lado="B"]').click();
  await expect(page.locator('#mapa-lado')).toBeVisible();
  const rotulo = await page.locator('#mapa-lado').boundingBox();
  const mapa = await page.locator('.mapa-cartao').boundingBox();
  expect(rotulo.x + rotulo.width).toBeLessThanOrEqual(mapa.x + mapa.width);
});
