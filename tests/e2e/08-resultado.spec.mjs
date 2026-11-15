// Ciclo 007, issue #61 — coluna de resultado, leitura completa do recorte e memória de recortes. PG-1 (mais de uma
// página), LF-1 (dois registros na mesma coordenada, só teclado, sem lente) e T6 (troca de lente sem reler páginas;
// revogação esvazia a memória). Valores esperados derivados à mão das fixtures fictícias (tests/e2e/fixture.mjs).
import { test, expect } from '@playwright/test';
import { sqlAdmin } from '../../scripts/banco/local.mjs';
import { cadastrarRp, revogarRp } from './contas.mjs';
import { abrirBalao, abrirOpcoesMapa, consultar, entrar, escolherLente } from './ajuda.mjs';
import { MUNICIPIOS, SQL_LIMPEZA, sqlFixture, sqlFixturePaginas } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });

const corpo = (q) => JSON.parse(q.postData() ?? '{}');

/** Conta as chamadas às RPCs de dados: páginas (`p_limite` 1.000) e resumos. */
function contarRpc(page) {
  const c = { paginas: [], resumos: [] };
  page.on('request', (q) => {
    if (q.url().includes('/rpc/consultar_deteccoes')) c.paginas.push(corpo(q));
    else if (q.url().includes('/rpc/consultar_resumo')) c.resumos.push(corpo(q));
  });
  return c;
}

test.describe('fixture comum (100 detecções)', () => {
  test.beforeAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixture());
    cadastrarRp();
  });

  test('T6: trocar de lente no mesmo recorte relê o resumo e nenhuma página; a primeira lente reusa a leitura da consulta', async ({ page }) => {
    const c = contarRpc(page);
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    expect(c.paginas).toHaveLength(1);
    await escolherLente(page, 'concentracao');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
    expect(c.paginas, 'a lente usa a leitura completa da consulta (Todo Mato Grosso)').toHaveLength(1);
    const resumos = c.resumos.length;
    await escolherLente(page, 'recorrencia');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', /janela_insuficiente|completo|sem_destaques/);
    expect(c.paginas, 'troca de lente: 0 páginas').toHaveLength(1);
    expect(c.resumos.length - resumos, 'troca de lente: 1 resumo relido').toBe(1);
    // A aba Municípios ordena pelos destaques da lente ativa (concentração: destacados primeiro, na ordem do resultado).
    await escolherLente(page, 'concentracao');
    await page.locator('#aba-municipios').click();
    await page.locator('[data-ordem="destaques"]').click();
    await expect(page.locator('#mun-explica')).toContainText('Os destacados pela lente "Concentração" primeiro');
    await expect(page.locator('#lista-municipios .sub-nome').first()).toContainText('destacado pela concentração');
    expect(c.paginas).toHaveLength(1);
  });

  test('T6: revogação com a memória preenchida leva a acesso negado, esvazia a memória e um novo acesso relê as páginas', async ({ page }) => {
    const c = contarRpc(page);
    await entrar(page, 'rp');
    await escolherLente(page, 'concentracao');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
    revogarRp();
    try {
      await escolherLente(page, 'recorrencia');
      await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'negado');
      await expect(page.locator('#conteudo')).toBeHidden();
      await expect(page.locator('#lente-destaques > li')).toHaveCount(0);
    } finally {
      cadastrarRp();
    }
    const antes = c.paginas.length;
    await page.getByRole('button', { name: 'Sair' }).click();
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    expect(c.paginas.length, 'memória vazia: a consulta relê as páginas').toBeGreaterThan(antes);
  });

  test('cartão do município (item 4): a lente usa o recorte e a linha conta as células destacadas no município', async ({ page }) => {
    await entrar(page, 'rp');
    // Concentração no estado: a linha de células não aparece (CM-6).
    await escolherLente(page, 'concentracao');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
    await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
    await expect(page.locator('#cartao-focos')).toHaveText('60');
    // Com município, a concentração sai: lente "nenhuma" e "—" (T4, CM-2).
    await expect(page.locator('input[name="l-lente"][value="nenhuma"]')).toBeChecked();
    await expect(page.locator('#cartao-destacadas')).toHaveText('—');
    await escolherLente(page, 'recorrencia');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'janela_insuficiente');
    await page.locator('#aba-municipios').click();
    await expect(page.locator('#cartao-destacadas')).toHaveText('0');
    await expect(page.locator('#mun-explica')).toContainText('As lentes também usam só esses focos.');
  });
});

test.describe('carga de 1.001 detecções', () => {
  test.beforeAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixturePaginas());
    cadastrarRp();
  });
  test.afterAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixture());
  });

  test('PG-1: 1.001 pontos de 2 páginas lidas uma vez; a célula do último registro conta no cartão', async ({ page }) => {
    const c = contarRpc(page);
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    await expect(page.locator('#mapa-contagem')).toContainText('Pontos no mapa: todas as 1.001 detecções do recorte.');
    expect(c.paginas.map((p) => p.p_deslocamento)).toEqual([0, 1000]);
    await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
    await expect(page.locator('#cartao-celulas')).toHaveAttribute('data-estado', 'completo');
    await expect(page.locator('#cartao-focos')).toHaveText('1.001');
    await expect(page.locator('#cartao-celulas')).toHaveText('2');
    expect(c.paginas.filter((p) => p.p_municipio === MUNICIPIOS.alfa.codigo).map((p) => p.p_deslocamento)).toEqual([0, 1000]);
    // De volta a Todo Mato Grosso: a memória reaproveita as páginas; só o resumo é relido.
    await page.getByRole('button', { name: 'Ver todo Mato Grosso' }).click();
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    expect(c.paginas).toHaveLength(4);
  });

  test('LF-1: sem lente, só teclado — "Lista de focos" distingue os dois registros da mesma coordenada; balão com os dois', async ({ page }) => {
    await entrar(page, 'rp');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'nenhuma');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    await abrirOpcoesMapa(page);
    await page.locator('#botao-lista-focos').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#t-lista-focos')).toBeFocused();
    // Página da ordem por dia e hora onde estão lf1 e lf2 (15/10): avança só por teclado.
    while (!(await page.locator('#lista-focos-itens button[data-id="lf1"]').count())) {
      await page.locator('#focos-proxima').focus();
      await page.keyboard.press('Enter');
    }
    const anuncio = page.locator('#mapa-selecao');
    for (const [id, hora] of [['lf1', '2026-10-15 03:10 GMT'], ['lf2', '2026-10-15 15:40 GMT']]) {
      const linha = page.locator(`#lista-focos-itens button[data-id="${id}"]`);
      await linha.focus();
      await page.keyboard.press(id === 'lf1' ? 'Enter' : 'Space');
      await expect(linha).toHaveAttribute('aria-pressed', 'true');
      await expect(anuncio).toHaveAttribute('role', 'status');
      await expect(anuncio).toHaveText(`Selecionado: ${hora} · Município Alfa · -11.53000, -56.47000 · identificador ${id}`);
    }
    await expect(page.locator('#lista-focos-itens button[aria-pressed="true"]')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#lista-focos')).toBeHidden();
    await expect(page.locator('#botao-lista-focos')).toBeFocused();
    // No mapa, tocar no ponto abre o balão com os dois registros.
    const balao = await abrirBalao(page, 'lf2');
    await expect(balao.locator('li')).toHaveCount(2);
    await expect(balao).toContainText('2 detecções neste ponto');
    await expect(balao.locator('li[data-id="lf1"]')).toContainText('2026-10-15 03:10 GMT');
    await expect(balao.locator('li[data-id="lf2"]')).toContainText('2026-10-15 15:40 GMT');
  });
});
