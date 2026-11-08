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

export async function consultar(page, { municipio, inicio, fim } = {}) {
  if (municipio !== undefined) await page.locator('#f-municipio').selectOption(municipio === null ? '' : String(municipio));
  if (inicio) await page.locator('#f-inicio').fill(inicio);
  if (fim) await page.locator('#f-fim').fill(fim);
  await page.getByRole('button', { name: 'Consultar' }).click();
}

export const numero = async (page, id) => (await page.locator(`#${id}`).innerText()).trim();

/** Soma de rede apenas das chamadas à API de dados (REST). */
export function observarRest(page) {
  const chamadas = [];
  page.on('request', (r) => { if (r.url().includes('/rest/v1/')) chamadas.push(`${r.method()} ${decodeURIComponent(r.url())}`); });
  return chamadas;
}
