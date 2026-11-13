// Sessão e acesso pela interface, com Auth local: AN, OA, RP (primeiro login → cadastro → leitura),
// logout, respostas atrasadas, revogação, expiração, fonte indisponível e armazenamento.
import { test, expect } from '@playwright/test';
import { requisitar, statusLocal } from '../../scripts/banco/local.mjs';
import { cadastrarRp, revogarRp, tokenDe } from './contas.mjs';
import { consultar, entrar, observarRest } from './ajuda.mjs';

test.describe.configure({ mode: 'serial' });

const DADO = /Município Alfa|Município Beta|Município Gama|INPE-/;

test('AN: sem sessão só há a tela de entrada, sem chamadas de dados', async ({ page }) => {
  const rest = observarRest(page);
  await page.goto('/');
  await expect(page.locator('#acesso[data-estado="anonimo"]')).toBeVisible();
  await expect(page.locator('#conteudo')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Entrar com o Google' })).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(DADO);
  expect(rest, 'nenhuma chamada de dados sem sessão').toEqual([]);

  // Direto na API: AN não executa consulta nem lê tabela.
  const L = statusLocal();
  const c = await requisitar(L.api, '/rest/v1/rpc/consultar_resumo', { metodo: 'POST', chave: L.anon, corpo: { p_inicio: '2026-10-01', p_fim: '2026-10-31' } });
  expect(c.status).toBe(401);
  const t = await requisitar(L.api, '/rest/v1/deteccoes?select=id_tecnico&limit=1', { chave: L.anon });
  expect([401, 403]).toContain(t.status);
});

test('Teclado: o primeiro Tab leva ao atalho para o conteúdo e depois ao login', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#botao-google')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.pular')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#botao-google')).toBeFocused();
});

test('Google: o botão inicia o fluxo PKCE e volta para o próprio app', async ({ page }) => {
  let destino = null;
  await page.route('**/auth/v1/authorize**', async (rota) => {
    destino = new URL(rota.request().url());
    await rota.fulfill({ status: 200, contentType: 'text/html', body: '<p>autorização simulada</p>' });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar com o Google' }).click();
  await expect.poll(() => destino).not.toBeNull();
  expect(destino.searchParams.get('provider')).toBe('google');
  expect(destino.searchParams.get('redirect_to')).toBe('http://127.0.0.1:5173/');
  expect(destino.searchParams.get('code_challenge')).toBeTruthy();
  expect(destino.searchParams.get('code_challenge_method')).toBe('s256');
});

test('Falha no retorno do login aparece como erro, sem dados', async ({ page }) => {
  await page.goto('/?error=access_denied&error_description=Login+cancelado');
  await expect(page.locator('#acesso-corpo .erro')).toContainText('Login cancelado');
  await expect(page.locator('#conteudo')).toBeHidden();
  expect(new URL(page.url()).search).toBe('');
});

test('OA: autenticado com metadados de RP não recebe dados, nem pela API direta', async ({ page }) => {
  await entrar(page, 'oa', { esperar: 'negado' });
  await expect(page.locator('#acesso-corpo')).toContainText('Acesso negado');
  await expect(page.locator('#sessao-estado')).toHaveText('Sessão sem autorização');
  await expect(page.locator('#conteudo')).toBeHidden();
  expect(await page.locator('body').innerText()).not.toMatch(DADO);

  const L = statusLocal();
  const token = await tokenDe('oa');
  const r = await requisitar(L.api, '/rest/v1/rpc/consultar_resumo', { metodo: 'POST', chave: L.anon, token, corpo: { p_inicio: '2026-10-01', p_fim: '2026-10-31' } });
  expect(r.status).toBe(403);
  expect(r.json.message).toBe('acesso_negado');
  const t = await requisitar(L.api, '/rest/v1/deteccoes?select=id_tecnico&limit=3', { chave: L.anon, token });
  expect(t.json).toEqual([]);
});

test('RP: primeiro login sem cadastro é negado; depois do cadastro lê os dados', async ({ page }) => {
  await entrar(page, 'rp', { esperar: 'negado' });
  await expect(page.locator('#conteudo')).toBeHidden();
  expect(await page.locator('body').innerText()).not.toMatch(DADO);

  cadastrarRp(); // administração externa, pelo UUID
  await page.reload();
  await expect(page.locator('#total-principal')).toHaveText('100');
  await expect(page.locator('#sessao-estado')).toHaveText('Sessão autorizada');
  await expect(page.locator('#acesso')).toBeHidden();
});

test('Logout limpa a tela, o estado e a sessão guardada', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(page.locator('#lista-municipios')).toBeAttached();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.locator('#acesso[data-estado="anonimo"]')).toContainText('Você saiu');
  await expect(page.locator('#total-principal')).toHaveCount(0);
  await expect(page.locator('#conteudo')).toBeHidden();
  expect(await page.locator('body').innerText()).not.toMatch(DADO);
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('auth-token')))).toEqual([]);
  // Recarregar não restaura nada.
  await page.reload();
  await expect(page.locator('#acesso[data-estado="anonimo"]')).toBeVisible();
  await expect(page.locator('#total-principal')).toHaveCount(0);
});

test('Resposta atrasada não repovoa a tela depois do logout', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_resumo', async (rota) => {
    await new Promise((r) => setTimeout(r, 1500));
    await rota.continue();
  });
  await consultar(page, { municipio: 9900001 });
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.locator('#acesso[data-estado="anonimo"]')).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(page.locator('#total-principal')).toHaveCount(0);
  await expect(page.locator('#conteudo')).toBeHidden();
  expect(await page.locator('body').innerText()).not.toMatch(DADO);
});

test('Revogação: a consulta seguinte vira acesso negado e a tela é limpa', async ({ page }) => {
  await entrar(page, 'rp');
  revogarRp();
  try {
    await consultar(page, { municipio: 9900002 });
    await expect(page.locator('#acesso[data-estado="negado"]')).toBeVisible();
    await expect(page.locator('#conteudo')).toBeHidden();
    await expect(page.locator('#total-principal')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toMatch(DADO);
  } finally {
    cadastrarRp();
  }
});

test('Sessão expirada é um estado próprio e remove os dados', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_resumo', (rota) => rota.fulfill({
    status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST301', message: 'JWT expired' }),
  }));
  await consultar(page, { municipio: 9900001 });
  await expect(page.locator('#acesso[data-estado="anonimo"]')).toContainText('Sua sessão expirou');
  await expect(page.locator('#conteudo')).toBeHidden();
  await expect(page.locator('#total-principal')).toHaveCount(0);
  expect(await page.locator('body').innerText()).not.toMatch(DADO);
  await expect(page.getByRole('button', { name: 'Entrar com o Google' })).toBeVisible();
});

test('Fonte indisponível (HTTP 503 e falha de rede) é distinta de zero e de acesso negado', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_resumo', (rota) => rota.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"indisponível"}' }));
  await consultar(page, {});
  const estado = page.locator('#estado-consulta');
  await expect(estado).toHaveAttribute('data-estado', 'fonte_indisponivel');
  await expect(estado).toContainText('Fonte de dados indisponível');
  await expect(page.locator('#total-principal')).toHaveCount(0);
  await expect(page.locator('#acesso')).toBeHidden();

  await page.unroute('**/rest/v1/rpc/consultar_resumo');
  await page.route('**/rest/v1/rpc/consultar_resumo', (rota) => rota.abort('failed'));
  await consultar(page, {});
  await expect(estado).toHaveAttribute('data-estado', 'fonte_indisponivel');

  await page.unroute('**/rest/v1/rpc/consultar_resumo');
  await consultar(page, {});
  await expect(page.locator('#total-principal')).toHaveText('100');
  await expect(estado).toHaveAttribute('data-estado', 'ocioso');
});

test('Armazenamento: nenhum dado de consulta em localStorage, sessionStorage, Cache ou IndexedDB', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: 9900001 });
  await expect(page.locator('#total-principal')).toHaveText('60');
  const guardado = await page.evaluate(async () => {
    const pares = [];
    for (const [nome, s] of [['local', localStorage], ['sessao', sessionStorage]]) {
      for (let i = 0; i < s.length; i += 1) { const k = s.key(i); pares.push([nome, k, s.getItem(k)]); }
    }
    const caches_ = 'caches' in self ? await caches.keys() : [];
    const bancos = indexedDB.databases ? (await indexedDB.databases()).map((b) => b.name) : [];
    return { pares, caches_, bancos };
  });
  expect(guardado.caches_).toEqual([]);
  for (const [, chave, valor] of guardado.pares) {
    expect(valor, chave).not.toMatch(/Município|INPE-|9900001|ee{60}/);
  }
  expect(guardado.pares.filter(([, k]) => !k.includes('auth-token') && !k.includes('code-verifier'))).toEqual([]);
});
