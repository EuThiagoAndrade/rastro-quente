// Ciclo 009, issue #91 (BL-017): rótulos das lentes, aba "Lentes" com o título da opção ativa, centro sem os cartões
// "No mapa", "Detecções no período" e "Disponibilidade dos dados", área selecionada só quando há área e mapa mais
// alto. Fixtures fictícias (Município Alfa 60, Beta 30, Gama 10 detecções).
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirListaFocos, entrar, escolherLente } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

// Altura de `.mapa-cartao` em `main` (171e078), medida em 1.366 × 768 com o mesmo login (task da issue #91).
const ALTURA_ANTES_1366 = 329;

test('coluna esquerda: rótulo "Lentes" antes de "Seleção"; as demais seções não mudam', async ({ page }) => {
  await entrar(page, 'rp');
  const rotulo = page.locator('#t-lentes');
  await expect(rotulo).toHaveText('Lentes');
  await expect(page.locator('#secao-lente > summary')).toHaveText(/^Seleção/);
  await expect(page.locator('#secao-contexto > summary')).toHaveText(/^Contexto territorial/);
  await expect(page.locator('#secao-cruzar > summary')).toHaveText(/^Cruzar critérios/);
  await expect(page.locator('#secao-comparar > summary')).toHaveText(/^Comparar/);
  // Ordem do documento: o rótulo vem antes das três seções de lente, que vêm antes de "Comparar".
  const ordem = await page.evaluate(() => ['t-lentes', 'secao-lente', 'secao-contexto', 'secao-cruzar', 'secao-comparar']
    .map((id) => document.getElementById(id)).every((e, i, l) => i === 0 || (l[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)));
  expect(ordem).toBe(true);
});

test('aba "Lentes": título da opção ativa nos cinco casos e "Lentes" sem lente', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(page.locator('#aba-destaques')).toHaveText('Lentes');
  await expect(page.locator('#t-destaques')).toHaveText('Lentes');
  const casos = [['concentracao', 'Concentração'], ['recorrencia', 'Recorrência'], ['persistencia', 'Persistência'],
    ['sobreposicao', 'Sobreposição com áreas protegidas'], ['combinacao', 'Combinação de lentes']];
  for (const [valor, titulo] of casos) {
    await escolherLente(page, valor);
    // Com ou sem resultado (a recorrência pede 3 meses e a fixture tem 1), o título diz a opção ativa.
    await expect(page.locator('#cartao-lentes')).not.toHaveAttribute('data-estado-lente', /nenhuma|carregando/);
    await expect(page.locator('#t-destaques')).toHaveText(titulo);
    await expect(page.locator('#aba-destaques')).toHaveText(/^Lentes( · \d+)?$/);
  }
  await escolherLente(page, 'nenhuma');
  await expect(page.locator('#t-destaques')).toHaveText('Lentes');
});

test('centro: só a série abaixo do mapa; contagem e seleção só para leitor de tela', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
  for (const nome of ['No mapa', 'Detecções no período (dias GMT)', 'Disponibilidade dos dados']) {
    await expect(page.getByRole('heading', { name: nome })).toHaveCount(0);
  }
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  await expect(page.getByText('Ver a série como tabela')).toBeVisible();
  // Alternativa em texto do mapa (DESIGN.md): presente para leitor de tela, sem aparência visual.
  await expect(page.locator('#mapa-contagem')).toContainText('Pontos no mapa: todas as 100 detecções do recorte.');
  const caixa = await page.locator('.rodape-mapa > .so-leitor').boundingBox();
  expect(caixa === null || (caixa.width <= 1 && caixa.height <= 1)).toBe(true);
  await expect(page.locator('#areas-selecao')).toBeHidden();
});

test('altura do mapa: maior no computador, 600 px no notebook e 480 px no celular; a "Lista de focos" continua visível', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await entrar(page, 'rp');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  const computador = await page.locator('.mapa-cartao').boundingBox();
  expect(computador.height).toBeGreaterThan(ALTURA_ANTES_1366);
  await abrirListaFocos(page);
  const titulo = await page.locator('#t-lista-focos').boundingBox();
  expect(titulo.y).toBeGreaterThanOrEqual(0);
  expect(titulo.y + titulo.height).toBeLessThanOrEqual(768);

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect.poll(async () => (await page.locator('.mapa-cartao').boundingBox()).height).toBe(600);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect.poll(async () => (await page.locator('.mapa-cartao').boundingBox()).height).toBe(480);
});

test('"Como ler esta tela" cita a aba Lentes e mantém a ressalva de disponibilidade', async ({ page }) => {
  await entrar(page, 'rp');
  await page.getByRole('button', { name: 'Como ler esta tela' }).click();
  const dialogo = page.locator('#dialogo-como-ler');
  await expect(dialogo).toContainText('aba Lentes');
  await expect(dialogo).not.toContainText('aba Destaques');
  await expect(dialogo).toContainText('Disponibilidade é separada da presença de detecção');
  await expect(page.locator('#mapa')).toHaveAttribute('aria-label', /aba Lentes/);
});
