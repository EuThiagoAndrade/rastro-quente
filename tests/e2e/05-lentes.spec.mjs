// Ciclo 004, issues #33, #34 e #35 — lentes de concentração, recorrência e persistência, cobertura, recorte da consulta (ciclo 007, item 4), concorrência (R1-4), destino dos
// erros (R2-1) e respostas em trânsito após versão substituída (R3-1). Valores esperados derivados à mão
// da fixture fictícia (tests/e2e/fixture.mjs), sem usar a interface: em outubro/2026, Alfa 60, Beta 30 e
// Gama 10 detecções; disponibilidade em 31 dias: Alfa com lacuna nos dias 1 e 2 (29 de 31), Beta
// indeterminada nos dias 1 a 3 (28 de 31) e Gama sem lacuna em todos (31 de 31).
import { test, expect } from '@playwright/test';
import { sqlAdmin } from '../../scripts/banco/local.mjs';
import { cadastrarRp } from './contas.mjs';
import { abrirDestaque, abrirSecao, consultar, entrar, escolherLente } from './ajuda.mjs';
import { MUNICIPIOS, SQL_LIMPEZA, sqlFixture, sqlFixturePersistencia, sqlFixtureRecorrencia } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });
// A spec 04 publica uma segunda versão e não a desfaz: restaura a fixture original pelo mesmo protocolo.
test.beforeAll(() => {
  sqlAdmin(SQL_LIMPEZA);
  sqlAdmin(sqlFixture());
  cadastrarRp();
});

const cartao = (page) => page.locator('#cartao-lentes');
const itens = (page) => page.locator('#lente-destaques > li');

/** Escolher a lente já calcula (A3, T16): não há botão "Aplicar lente". */
async function aplicar(page, lente = 'concentracao') {
  await escolherLente(page, lente);
}

const corpoRpc = (route) => JSON.parse(route.request().postData() ?? '{}');

/**
 * Segura a primeira chamada que casar com `filtro` até `soltar()`; as demais seguem normalmente.
 * Com `resposta`, a chamada retida é liberada com ela em vez da resposta real.
 */
async function reter(page, rpc, filtro = () => true, resposta = null) {
  let soltar;
  const liberado = new Promise((r) => { soltar = r; });
  let retida = false;
  let chegou;
  const chegada = new Promise((r) => { chegou = r; });
  await page.route(`**/rest/v1/rpc/${rpc}`, async (route) => {
    if (!retida && filtro(corpoRpc(route))) {
      retida = true;
      chegou();
      const resp = resposta ? null : await route.fetch();
      await liberado;
      await route.fulfill(resposta ?? { response: resp }).catch(() => {});
    } else {
      await route.continue();
    }
  });
  return { soltar: () => soltar(), chegada };
}

test('concentração: lista ordenada por contagem, parâmetros, cobertura e painel de motivo e evidência', async ({ page }) => {
  await entrar(page, 'rp');
  await aplicar(page);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-estado')).toContainText(/Lente concluída em \d+,\d s/);
  await expect(itens(page)).toHaveCount(3);
  // T15 e ciclo 009: aba "Lentes · N", título da opção ativa e a ressalva de contagem absoluta junto do resultado.
  await expect(page.locator('#aba-destaques')).toHaveText('Lentes · 3');
  await expect(page.locator('#aba-destaques')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#t-destaques')).toHaveText('Concentração');
  await expect(page.locator('#resumo-lente-numero')).toHaveText('3 municípios');
  await expect(page.locator('#resumo-lente')).toContainText('Quais municípios concentram mais detecções?');
  await expect(page.locator('#lente-ressalva-contagem')).toHaveText('Contagem absoluta favorece municípios grandes; a ordem não indica prioridade, gravidade nem risco.');
  expect(await itens(page).locator('.botao-nome').allInnerTexts())
    .toEqual(['1. Município Alfa — 60 detecções', '2. Município Beta — 30 detecções', '3. Município Gama — 10 detecções']);
  expect(await itens(page).locator('.etiqueta').allInnerTexts()).toEqual([
    '29 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
    '28 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
    '31 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
  ]);
  await expect(page.locator('#lente-ordenacao')).toHaveText('Lista ordenado por contagem de detecções, não por prioridade, gravidade ou risco.');
  await expect(page.locator('#lente-parametros')).toContainText('com todos os empatados no 10º lugar');
  await expect(page.locator('#lente-escopo')).toContainText('recorte: todo o estado de Mato Grosso');
  await expect(page.locator('#lente-escopo')).toContainText('método lentes-007-v1');
  await expect(page.locator('#resumo-lente-recorte')).toContainText('em todo Mato Grosso');
  await expect(page.locator('#lente-escopo')).toContainText('2026-10-01 a 2026-10-31');
  await expect(page.locator('#lente-limitacoes')).toContainText('não comprovam incêndio, dano, autoria ou infração');
  await expect(page.locator('#lente-limitacoes')).toContainText('Contagem absoluta favorece municípios grandes.');
  expect(await cartao(page).innerText()).not.toMatch(/\bcoberto\b/i);

  // Explicação do primeiro destaque (RC-12, interface): motivo, evidência e os dias que contam contra, com a classe.
  await abrirDestaque(page, 0);
  await expect(page.locator('#vista-lista')).toBeHidden();
  await expect(page.locator('#lente-painel-titulo')).toBeFocused();
  await expect(page.locator('#t-explicacao')).toHaveText('Por que este município?');
  await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', `concentracao:municipio:${MUNICIPIOS.alfa.codigo}`);
  await expect(page.locator('#lente-ressalvas')).toContainText('Contagem absoluta favorece municípios grandes');
  await expect(page.locator('#lente-motivo')).toContainText('60 detecções na janela');
  await expect(page.locator('#lente-evidencia')).toContainText('60 detecções');
  await page.getByRole('button', { name: 'Mostrar no mapa' }).click();
  await expect(page.locator('#vista-explicacao')).toBeVisible();
  await page.getByRole('button', { name: 'Ver os focos' }).click();
  await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–20 de 60 detecções da evidência.');
  await expect(page.locator('#lente-evidencia-info')).toBeFocused();
  await page.getByText('Dias que contam contra (2)').click();
  expect(await page.locator('#lente-dias > li').evaluateAll((l) => l.map((x) => x.dataset.classe))).toEqual(['lacuna_conhecida', 'lacuna_conhecida']);
  await expect(page.locator('#lente-dias')).toContainText('2026-10-01: Lacuna conhecida');
  // "← Voltar aos destaques": a lista volta e o foco vai ao item aberto.
  await page.getByRole('button', { name: 'Voltar aos destaques' }).click();
  await expect(page.locator('#vista-lista')).toBeVisible();
  await expect(itens(page).first().locator('.botao-nome')).toBeFocused();
  // Reabre a explicação para consultar o município.
  await abrirDestaque(page, 0);

  // "Consultar este município" aplica o filtro; com município, a concentração não se aplica (ciclo 007, T4): a lente
  // volta a "nenhuma" e a aba vai para Municípios.
  await page.getByRole('button', { name: 'Consultar este município' }).click();
  await expect(page.locator('#filtros-escopo')).toContainText('Município Alfa');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '60');
  await expect(page.locator('input[name="l-lente"][value="nenhuma"]')).toBeChecked();
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(page.locator('#aba-municipios')).toHaveAttribute('aria-selected', 'true');
  await expect(itens(page)).toHaveCount(0);
});

test('T4: com município (Gama), a concentração fica desabilitada com o texto de A2, também na combinação', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: MUNICIPIOS.gama.codigo });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '10');
  await abrirSecao(page, 'secao-lente');
  await expect(page.locator('input[name="l-lente"][value="concentracao"]')).toBeDisabled();
  await expect(page.locator('#concentracao-indisponivel')).toHaveText('Compara municípios: disponível só com Todo Mato Grosso');
  await expect(page.locator('#filtros-escopo')).toHaveText('Uma lente por vez · Município Gama · 2026-10-01 a 2026-10-31');
  await expect(page.locator('input[name="l-comb"][value="concentracao"]')).toBeDisabled();
  await expect(page.locator('input[name="l-comb"][value="concentracao"]')).not.toBeChecked();
  // De volta a Todo Mato Grosso, a concentração volta a ser escolhível.
  await consultar(page, { municipio: null });
  await expect(page.locator('input[name="l-lente"][value="concentracao"]')).toBeEnabled();
  await expect(page.locator('#concentracao-indisponivel')).toBeHidden();
});

test('concorrência: aplicação antiga retida não aparece depois da nova (duas concentrações)', async ({ page }) => {
  await entrar(page, 'rp');
  // Primeiro cálculo na janela 01–10/10, retido no resumo da lente.
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await expect(page.locator('#filtros-escopo')).toContainText('2026-10-01 a 2026-10-10');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
  const r = await reter(page, 'consultar_resumo');
  await aplicar(page);
  await r.chegada;
  // Nova janela: a lente é recalculada sozinha depois da consulta (T16) e termina antes.
  await consultar(page, { fim: '2026-10-31' });
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-escopo')).toContainText('2026-10-01 a 2026-10-31');
  expect(await itens(page).locator('.botao-nome').allInnerTexts())
    .toEqual(['1. Município Alfa — 60 detecções', '2. Município Beta — 30 detecções', '3. Município Gama — 10 detecções']);
});

test('concorrência: "Nenhuma" durante a leitura cancela; a resposta atrasada não aparece', async ({ page }) => {
  await entrar(page, 'rp');
  const r = await reter(page, 'consultar_resumo');
  await aplicar(page);
  await r.chegada;
  await escolherLente(page, 'nenhuma');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(itens(page)).toHaveCount(0);
});

test('concorrência: logout durante a leitura limpa tudo; novo login não traz a lente antiga', async ({ page }) => {
  await entrar(page, 'rp');
  const r = await reter(page, 'consultar_resumo');
  await aplicar(page);
  await r.chegada;
  await page.locator('#botao-sair').click();
  await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'anonimo');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await entrar(page, 'rp');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(itens(page)).toHaveCount(0);
});

test('página com registro duplicado é leitura inconsistente: nem mapa parcial nem destaque parcial', async ({ page }) => {
  await page.route('**/rest/v1/rpc/consultar_deteccoes', async (route) => {
    if (corpoRpc(route).p_limite !== 1000) return route.continue();
    const resp = await route.fetch();
    const json = await resp.json();
    json.registros[json.registros.length - 1] = json.registros[0];
    await route.fulfill({ response: resp, json });
  });
  await entrar(page, 'rp', { esperar: false });
  // A leitura completa da consulta (T7) é recusada: nenhum ponto é desenhado pela metade.
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'inconsistente');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'erro');
  await expect(page.locator('#mapa-contagem')).toContainText('nenhum ponto foi desenhado pela metade');
  await aplicar(page);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'leitura_inconsistente');
  await expect(page.locator('#lente-estado')).toContainText('id_tecnico repetido');
  await expect(itens(page)).toHaveCount(0);
});

test('falha da fonte na disponibilidade de um município: só os destaques dele ficam sem cobertura verificada', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_disponibilidade', async (route) => {
    if (corpoRpc(route).p_municipio !== MUNICIPIOS.beta.codigo) return route.continue();
    await route.fulfill({ status: 503, json: { message: 'indisponivel' } });
  });
  await aplicar(page);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'cobertura_nao_verificada');
  expect(await itens(page).locator('.etiqueta').allInnerTexts()).toEqual([
    '29 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
    'cobertura não verificada: fonte indisponível',
    '31 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
  ]);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
});

test('R2-1: acesso negado na disponibilidade, depois de a lista aparecer, limpa tela, lente e memória', async ({ page }) => {
  await entrar(page, 'rp');
  const negado = { status: 403, json: { code: '42501', message: 'acesso_negado' } };
  const r = await reter(page, 'consultar_disponibilidade', () => true, negado);
  await aplicar(page);
  await r.chegada;
  await expect(itens(page)).toHaveCount(3);
  r.soltar();
  await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'negado');
  await expect(page.locator('#conteudo')).toBeHidden();
  await expect(itens(page)).toHaveCount(0);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
});

test('R2-1: sessão expirada na disponibilidade limpa tudo; após novo login, nenhum destaque antigo', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_disponibilidade', (route) => route.fulfill({ status: 401, json: { code: 'PGRST301', message: 'JWT expired' } }));
  await aplicar(page);
  await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'anonimo');
  await expect(page.locator('#acesso-corpo')).toContainText('Sua sessão expirou');
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await entrar(page, 'rp');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(itens(page)).toHaveCount(0);
});

test('R2-1: carga indisponível no resumo de uma segunda aplicação limpa lente e memória; depois relê tudo', async ({ page }) => {
  await entrar(page, 'rp');
  await aplicar(page);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await page.route('**/rest/v1/rpc/consultar_resumo', (route) => route.fulfill({ status: 500, json: { code: 'P0002', message: 'carga_indisponivel' } }));
  await aplicar(page, 'recorrencia');
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'versao_substituida');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'cancelada');
  await expect(itens(page)).toHaveCount(0);
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'erro');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  // A memória saiu junto: a versão vigente é lida de novo, página por página.
  const paginas = [];
  page.on('request', (q) => { if (q.url().includes('/rpc/consultar_deteccoes') && JSON.parse(q.postData() ?? '{}').p_limite === 1000) paginas.push(q); });
  await page.getByRole('button', { name: 'Carregar a versão vigente' }).click();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  await aplicar(page);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(paginas.length).toBeGreaterThan(0);
});

test('R3-1: página antiga liberada depois de "versão substituída" não repovoa o mapa nem a lista de focos', async ({ page }) => {
  await entrar(page, 'rp');
  const r = await reter(page, 'consultar_deteccoes', (b) => b.p_municipio === MUNICIPIOS.alfa.codigo);
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await r.chegada;
  // A consulta seguinte recebe "carga indisponível".
  await page.route('**/rest/v1/rpc/consultar_resumo', (route) => route.fulfill({ status: 500, json: { code: 'P0002', message: 'carga_indisponivel' } }));
  await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'versao_substituida');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'erro');
  await expect(page.locator('#mapa-contagem')).not.toContainText('todas as 60');
});

test('lente acessível: teclado e 360 px sem rolagem horizontal da página', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await entrar(page, 'rp');
  await abrirSecao(page, 'secao-lente');
  await page.locator('input[name="l-lente"][value="concentracao"]').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('input[name="l-lente"][value="concentracao"]')).toBeChecked();
  // Escolher já calcula; a aba Destaques abre sozinha.
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#aba-destaques')).toHaveAttribute('aria-selected', 'true');
  const alvo = await itens(page).first().locator('.botao-nome').boundingBox();
  expect(alvo.height).toBeGreaterThanOrEqual(44);
  await itens(page).first().locator('.botao-nome').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#lente-painel-titulo')).toBeFocused();
  const largura = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(largura[0]).toBeLessThanOrEqual(largura[1]);
  await page.locator('#botao-voltar').focus();
  await page.keyboard.press('Enter');
  await expect(itens(page).first().locator('.botao-nome')).toBeFocused();
});

// --- Issue #34: recorrência por célula de 0,05° -------------------------------------------------------
// Carga fictícia de três meses (tests/e2e/fixture.mjs, sqlFixtureRecorrencia), com valores esperados
// derivados à mão: células A (3 meses, 3 detecções, Alfa e Beta), B (3 meses, 23, Alfa) e D (3 meses, 3,
// Gama); C só em ago e set. Cobertura: A 90 de 92 (união D13), B 91 de 92, D 92 de 92.
test.describe('recorrência', () => {
  test.beforeAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixtureRecorrencia());
  });
  test.afterAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixture());
  });

  const ROTULOS_JANELA_INTEIRA = [
    'Célula -11.50 a -11.45 · -56.00 a -55.95 — 3 meses GMT (3 detecções)',
    'Célula -11.55 a -11.50 · -56.50 a -56.45 — 3 meses GMT (23 detecções)',
    'Célula -11.65 a -11.60 · -54.55 a -54.50 — 3 meses GMT (3 detecções)',
  ];

  test('recorte municipal (ciclo 007, item 4): em Alfa a célula de divisa perde o destaque; em Beta, nenhum destaque', async ({ page }) => {
    await entrar(page, 'rp');
    await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
    await expect(page.locator('#serie')).toHaveAttribute('data-total', '25');
    await aplicar(page, 'recorrencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    // Só a célula B (3 meses, 23 detecções, toda de Alfa); a célula A tem só ago e set em Alfa (out é de Beta).
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual([ROTULOS_JANELA_INTEIRA[1]]);
    await expect(page.locator('#resumo-lente-recorte')).toContainText('calculada só com os focos de Município Alfa');
    await expect(page.locator('#lente-limitacoes')).toContainText('Células na divisa podem perder destaque, porque só contam os focos de Município Alfa.');
    await abrirDestaque(page, 0);
    await expect(page.locator('#lente-escopo')).toContainText('recorte: só os focos de Município Alfa');
    await expect(page.locator('#lente-municipios')).toContainText('Município Alfa (9900001)');
    await expect(page.locator('#lente-municipios')).not.toContainText('Beta');
    // Cartão do município: células destacadas no recorte (CM-2, item 4).
    await page.locator('#aba-municipios').click();
    await expect(page.locator('#cartao-destacadas')).toHaveText('1');
    // Beta: a lente é recalculada no novo recorte, sem destaques.
    await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'sem_destaques');
    await expect(itens(page)).toHaveCount(0);
  });

  test('células com 3 meses GMT, ordem por célula sem ranking, cobertura por união e evidência paginada', async ({ page }) => {
    await entrar(page, 'rp');
    await expect(page.locator('#serie')).toHaveAttribute('data-total', '35');
    await aplicar(page, 'recorrencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual(ROTULOS_JANELA_INTEIRA);
    expect(await itens(page).locator('.etiqueta').allInnerTexts()).toEqual([
      '90 de 92 dias sem evidência de lacuna (cobertura não comprovada)',
      '91 de 92 dias sem evidência de lacuna (cobertura não comprovada)',
      '92 de 92 dias sem evidência de lacuna (cobertura não comprovada)',
    ]);
    await expect(page.locator('#lente-ordenacao')).toContainText('não é ranking');
    await expect(page.locator('#lente-parametros')).toContainText('pelo menos 3 meses GMT distintos');
    await expect(page.locator('#lente-limitacoes')).toContainText('a célula não segue divisas');
    await expect(page.locator('#lente-limitacoes')).toContainText('A cobertura da célula usa os municípios das detecções');
    expect(await cartao(page).innerText()).not.toMatch(/\bcoberto\b/i);

    // Célula na divisa: municípios usados na cobertura (D13) e os dois dias que contam contra, com a classe.
    await abrirDestaque(page, 0);
    await expect(page.locator('#t-explicacao')).toHaveText('Por que esta célula?');
    await expect(page.locator('#lente-ficha')).toContainText('c-230_-1120');
    await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', 'recorrencia:celula_005:c-230_-1120');
    await expect(page.locator('#lente-motivo')).toContainText('Detecções em 3 meses GMT distintos na janela: ago/2026, set/2026 e out/2026.');
    await expect(page.locator('#lente-municipios')).toContainText('Município Alfa (9900001); Município Beta (9900002)');
    await page.getByText('Dias que contam contra (2)').click();
    expect(await page.locator('#lente-dias > li').evaluateAll((l) => l.map((x) => x.dataset.classe))).toEqual(['lacuna_conhecida', 'incidencia_indeterminada']);
    await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–3 de 3 detecções da evidência.');
    await expect(page.locator('#lente-evidencia-tabela tbody tr')).toHaveCount(3);

    // Evidência paginada na célula com 23 detecções.
    await abrirDestaque(page, 1);
    await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–20 de 23 detecções da evidência.');
    await page.getByRole('button', { name: 'Próximas detecções' }).click();
    await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 21–23 de 23 detecções da evidência.');
    await expect(page.locator('#lente-evidencia-tabela tbody tr')).toHaveCount(3);
    await expect(page.locator('#lente-evidencia-info')).toBeFocused();
  });

  test('janela com bordas parciais (15/08 a 14/10) roda e marca os meses parciais (D14)', async ({ page }) => {
    await entrar(page, 'rp');
    await consultar(page, { inicio: '2026-08-15', fim: '2026-10-14' });
    await aplicar(page, 'recorrencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual([
      'Célula -11.50 a -11.45 · -56.00 a -55.95 — 3 meses GMT (3 detecções)',
      'Célula -11.55 a -11.50 · -56.50 a -56.45 — 3 meses GMT (16 detecções)',
    ]);
    expect(await itens(page).locator('.etiqueta').allInnerTexts()).toEqual([
      '60 de 61 dias sem evidência de lacuna (cobertura não comprovada)',
      '61 de 61 dias sem evidência de lacuna (cobertura não comprovada)',
    ]);
    await expect(page.locator('#lente-corpo')).toContainText('A janela toca 3 meses GMT: ago/2026 (parcial), set/2026 e out/2026 (parcial).');
    await abrirDestaque(page, 0);
    await expect(page.locator('#lente-meses > li')).toHaveText([
      'ago/2026 (parcial) · 1 detecção',
      'set/2026 · 1 detecção',
      'out/2026 (parcial) · 1 detecção',
    ]);
    expect(await page.locator('#lente-ressalvas > li').allInnerTexts()).toEqual([
      'inclui mês parcial: ago/2026 (janela de 15/08 a 31/08)',
      'inclui mês parcial: out/2026 (janela de 01/10 a 14/10)',
    ]);
  });

  test('janela que toca 2 meses GMT mostra "janela insuficiente", sem destaques', async ({ page }) => {
    await entrar(page, 'rp');
    await consultar(page, { inicio: '2026-08-15', fim: '2026-09-30' });
    await aplicar(page, 'recorrencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'janela_insuficiente');
    await expect(page.locator('#lente-estado')).toContainText('A janela toca 2 meses GMT; a recorrência exige pelo menos 3.');
    await page.getByRole('button', { name: 'Alterar o período' }).click();
    await expect(page.locator('#secao-consulta')).toHaveAttribute('open', '');
    await expect(page.locator('#f-inicio')).toBeFocused();
    await expect(page.locator('#f-inicio')).toHaveValue('2026-08-15');
    await expect(itens(page)).toHaveCount(0);
    await expect(page.locator('#lente-limitacoes')).toBeVisible();
  });

  test('concorrência: recorrência escolhida com a concentração ainda em leitura; só a recorrência aparece', async ({ page }) => {
    await entrar(page, 'rp');
    const r = await reter(page, 'consultar_resumo');
    await aplicar(page, 'concentracao');
    await r.chegada;
    await aplicar(page, 'recorrencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    r.soltar();
    await page.waitForTimeout(500);
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    await expect(page.locator('#lente-ordenacao')).toContainText('não é ranking');
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual(ROTULOS_JANELA_INTEIRA);
  });
});

// --- Issue #35: persistência por célula de 0,05° ------------------------------------------------------
// Carga fictícia de outubro/2026 (tests/e2e/fixture.mjs, sqlFixturePersistencia), com valores esperados
// derivados à mão: Q 01–03 (borda), P 10–12 (divisa, lacuna conhecida no dia 11 e dia 13 indeterminado sem
// detecção), Q 20–23 (segunda sequência da mesma célula) e R 29–31 (borda, dia 30 indeterminado); S com 05,
// 06 e 08 não forma sequência. Cobertura: Q 30 de 31, P 28 de 31 (união), R 30 de 31.
test.describe('persistência', () => {
  test.beforeAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixturePersistencia());
  });
  test.afterAll(() => {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixture());
  });

  const ROTULOS = [
    'Célula -11.55 a -11.50 · -56.50 a -56.45 — 3 dias GMT seguidos, 01/10/2026 a 03/10/2026 (3 detecções)',
    'Célula -11.50 a -11.45 · -56.00 a -55.95 — 3 dias GMT seguidos, 10/10/2026 a 12/10/2026 (3 detecções)',
    'Célula -11.55 a -11.50 · -56.50 a -56.45 — 4 dias GMT seguidos, 20/10/2026 a 23/10/2026 (5 detecções)',
    'Célula -11.65 a -11.60 · -54.55 a -54.50 — 3 dias GMT seguidos, 29/10/2026 a 31/10/2026 (3 detecções)',
  ];
  const textosRessalvas = (page) => page.locator('#lente-ressalvas > li').evaluateAll((l) => l.map((x) => x.firstChild.textContent));

  test('sequências por célula, ordem por início sem ranking, ressalvas por classe (D15, T7) e de borda (T4)', async ({ page }) => {
    await entrar(page, 'rp');
    await expect(page.locator('#serie')).toHaveAttribute('data-total', '17');
    await aplicar(page, 'persistencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual(ROTULOS);
    expect(await itens(page).locator('.etiqueta').allInnerTexts()).toEqual([
      '30 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
      '28 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
      '30 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
      '30 de 31 dias sem evidência de lacuna (cobertura não comprovada)',
    ]);
    await expect(page.locator('#lente-ordenacao')).toContainText('pela data de início da sequência');
    await expect(page.locator('#lente-ordenacao')).toContainText('não é ranking');
    await expect(page.locator('#resumo-lente-numero')).toHaveText('4 sequências em 3 células');
    await expect(page.locator('#aba-destaques')).toHaveText('Lentes · 4');
    await expect(page.locator('#lente-parametros')).toContainText('pelo menos 3 dias GMT consecutivos');
    await expect(page.locator('#lente-parametros')).toContainText('só um dia sem detecção na célula interrompe');
    await expect(page.locator('#lente-limitacoes')).toContainText('a célula não segue divisas');
    expect(await cartao(page).innerText()).not.toMatch(/\bcoberto\b/i);

    // Primeira sequência: toca o início da janela (T4).
    await abrirDestaque(page, 0);
    await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', 'persistencia:celula_005:c-231_-1130:2026-10-01');
    expect(await textosRessalvas(page)).toEqual(['sequência no limite da janela; pode ser mais longa']);

    // Célula na divisa: a classe da célula no dia 11 é lacuna conhecida, com a classe e os motivos de cada município.
    await abrirDestaque(page, 1);
    await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', 'persistencia:celula_005:c-230_-1120:2026-10-10');
    await expect(page.locator('#lente-motivo')).toContainText('Detecções em 3 dias GMT consecutivos na célula, de 10/10/2026 a 12/10/2026.');
    await expect(page.locator('#lente-evidencia')).toContainText('dias GMT: 10/10/2026, 11/10/2026, 12/10/2026');
    await expect(page.locator('#lente-municipios')).toContainText('Município Alfa (9900001); Município Beta (9900002)');
    const ressalvas = page.locator('#lente-ressalvas > li');
    expect(await ressalvas.evaluateAll((l) => l.map((x) => x.dataset.classe))).toEqual(['lacuna_conhecida', 'incidencia_indeterminada']);
    expect(await textosRessalvas(page)).toEqual([
      'inclui dia com lacuna conhecida (11/10)',
      'adjacente a dia indeterminado (13/10); pode ser mais longa',
    ]);
    await expect(ressalvas.first()).toContainText('Município Alfa (9900001): Lacuna conhecida (aviso cobre municipio)');
    await expect(ressalvas.first()).toContainText('Município Beta (9900002): Incidência indeterminada (historico ausente ou incompleto)');
    await expect(ressalvas.nth(1)).toContainText('Município Beta (9900002): Incidência indeterminada (aviso parcial no municipio)');
    await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–3 de 3 detecções da evidência.');

    // Segunda sequência da mesma célula de 01–03 (T6): destaque próprio, sem ressalva.
    await abrirDestaque(page, 2);
    await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', 'persistencia:celula_005:c-231_-1130:2026-10-20');
    await expect(page.locator('#lente-ressalvas')).toHaveCount(0);
    await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–5 de 5 detecções da evidência.');

    // Última sequência: toca o fim da janela e inclui um dia indeterminado.
    await abrirDestaque(page, 3);
    expect(await textosRessalvas(page)).toEqual([
      'sequência no limite da janela; pode ser mais longa',
      'inclui dia indeterminado (30/10)',
    ]);

    // Sem a detecção de Beta na divisa nem a sequência de Gama, só restam as duas sequências de Alfa em Q.
    await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
    await expect(page.locator('#resumo-lente-numero')).toHaveText('2 sequências em 1 célula');
    await expect(page.locator('#aba-destaques')).toHaveText('Lentes · 2');
  });

  test('falha da disponibilidade de um município: ressalvas de disponibilidade não verificadas, seleção mantida', async ({ page }) => {
    await entrar(page, 'rp');
    await page.route('**/rest/v1/rpc/consultar_disponibilidade', async (route) => {
      if (corpoRpc(route).p_municipio !== MUNICIPIOS.gama.codigo) return route.continue();
      await route.fulfill({ status: 503, json: { message: 'indisponivel' } });
    });
    await aplicar(page, 'persistencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'cobertura_nao_verificada');
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual(ROTULOS);
    await expect(itens(page).nth(3).locator('.etiqueta')).toHaveText('cobertura não verificada: fonte indisponível');
    await abrirDestaque(page, 3);
    expect(await textosRessalvas(page)).toEqual([
      'sequência no limite da janela; pode ser mais longa',
      'ressalvas de disponibilidade ainda não verificadas',
    ]);
    await expect(page.locator('#lente-cobertura')).not.toContainText(/\d+ de \d+/);
  });

  test('concorrência: persistência escolhida com a recorrência ainda em leitura; só a persistência aparece', async ({ page }) => {
    await entrar(page, 'rp');
    const r = await reter(page, 'consultar_resumo');
    await aplicar(page, 'recorrencia');
    await r.chegada;
    await aplicar(page, 'persistencia');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    r.soltar();
    await page.waitForTimeout(500);
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
    await expect(page.locator('#lente-ordenacao')).toContainText('pela data de início da sequência');
    expect(await itens(page).locator('.botao-nome').allInnerTexts()).toEqual(ROTULOS);
  });
});
