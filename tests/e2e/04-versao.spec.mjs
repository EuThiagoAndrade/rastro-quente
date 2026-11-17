// Troca de versão no meio da sessão: a versão fixada some, a tela é limpa e nada é misturado.
// Deve ser o último arquivo: a troca retira a versão da fixture (a limpeza global remove tudo).
import { test, expect } from '@playwright/test';
import { sqlAdmin } from '../../scripts/banco/local.mjs';
import { cadastrarRp } from './contas.mjs';
import { consultar, entrar } from './ajuda.mjs';
import { sqlVersaoNova } from './fixture.mjs';

test('versão substituída: resultados antigos saem e a vigente é carregada sem mistura', async ({ page }) => {
  cadastrarRp();
  await entrar(page, 'rp');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  const cargaAntiga = sqlAdmin("select id from public.cargas where identidade like 'eeee%1';");

  sqlAdmin(sqlVersaoNova()); // publicação nova, versão antiga retirada

  await consultar(page, { municipio: 9900001 });
  const estado = page.locator('#estado-consulta');
  await expect(estado).toHaveAttribute('data-estado', 'versao_substituida');
  await expect(estado).toContainText('foi substituída');
  await expect(page.locator('#serie')).toHaveCount(0);
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'erro');
  await expect(page.locator('#lista-focos-itens')).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(/INPE-/);

  await page.getByRole('button', { name: 'Carregar a versão vigente' }).click();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '1');
  await expect(page.locator('#f-inicio')).toHaveValue('2026-09-01');
  await expect(page.locator('#f-fim')).toHaveValue('2026-09-01');
  await expect(page.locator('#versao-dados')).not.toContainText(new RegExp(`nº ${cargaAntiga}(\D|$)`));
  await expect(page.locator('#f-municipio option')).toHaveCount(2); // todo o estado + Alfa
});
