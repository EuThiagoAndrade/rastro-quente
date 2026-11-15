// Helpers comuns do E2E.
import { expect } from '@playwright/test';
import { emailDe, senhaDe } from './contas.mjs';

export const JANELA = { inicio: '2026-10-01', fim: '2026-10-31' };

/** Entra pelo formulário de senha local (somente no build de teste). */
export async function entrar(page, nome, { esperar = 'dados' } = {}) {
  await page.goto('/');
  await page.locator('#l-email').fill(emailDe(nome));
  await page.locator('#l-senha').fill(await senhaDe(nome));
  await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
  if (esperar === 'dados') await expect(page.locator('#total-principal')).toBeVisible();
  else if (esperar) await expect(page.locator(`#acesso[data-estado="${esperar}"]`)).toBeVisible();
}

/** Abre uma seção recolhível dos filtros (fechada por padrão em tela estreita, T17). */
export async function abrirSecao(page, id) {
  const secao = page.locator(`#${id}`);
  if ((await secao.getAttribute('open')) === null) await secao.locator(':scope > summary').click();
  await expect(secao).toHaveAttribute('open', '');
}

/**
 * Muda o recorte pelos filtros (T16): não há botão "Consultar"; cada campo se aplica ao mudar. Recorte igual ao
 * aplicado não consulta de novo; para repetir uma consulta que falhou, use o botão "Tentar novamente".
 */
export async function consultar(page, { municipio, inicio, fim } = {}) {
  await abrirSecao(page, 'secao-consulta');
  if (municipio !== undefined) await page.locator('#f-municipio').selectOption(municipio === null ? '' : String(municipio));
  if (inicio) await page.locator('#f-inicio').fill(inicio);
  if (fim) await page.locator('#f-fim').fill(fim);
}

/** Marca a lente no rádio da sua seção (Lente de seleção, Contexto territorial ou Cruzar critérios). */
export async function escolherLente(page, valor) {
  const radio = page.locator(`input[name="l-lente"][value="${valor}"]`);
  const secao = await radio.evaluate((e) => e.closest('details')?.id);
  if (secao) await abrirSecao(page, secao);
  await radio.check();
}

export const numero = async (page, id) => (await page.locator(`#${id}`).innerText()).trim();

/** Soma de rede apenas das chamadas à API de dados (REST). */
export function observarRest(page) {
  const chamadas = [];
  page.on('request', (r) => { if (r.url().includes('/rest/v1/')) chamadas.push(`${r.method()} ${decodeURIComponent(r.url())}`); });
  return chamadas;
}
