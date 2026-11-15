// Ciclo 007, issue #64 — mapa-base (T12, ADR-010). Duas execuções separadas:
// - build sem VITE_ESRI_CHAVE (porta 5173): "Satélite" indisponível com aviso, "Sem fundo" padrão e nenhum pedido à Esri;
// - build com valor FICTÍCIO (porta 5174), com os dois hosts de tiles interceptados: tiles simulados, `referrerpolicy`,
//   atribuição, erro → "Sem fundo" com aviso, desligar interrompe novos pedidos e nenhum pedido acima do maxZoom.
// Nenhuma chave real e nenhum pedido sai para a Esri: toda rota dos dois hosts é atendida localmente.
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirOpcoesMapa, entrar } from './ajuda.mjs';

test.describe.configure({ mode: 'serial' });
test.beforeAll(() => cadastrarRp());

const HOSTS = /^https:\/\/(ibasemaps-api|static-map-tiles-api)\.arcgis\.com\//;
const IMAGEM = 'https://ibasemaps-api.arcgis.com/**';
const NOMES = 'https://static-map-tiles-api.arcgis.com/**';
// PNG 1×1 transparente (fictício).
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const MAX_ZOOM = 14;

/** Pedidos aos hosts da Esri e violações de CSP de imagem ou conexão (as de estilo em linha do Leaflet já existiam). */
function observar(page) {
  const pedidos = [];
  const csp = [];
  page.on('request', (r) => { if (HOSTS.test(r.url())) pedidos.push(r.url()); });
  page.on('console', (m) => { if (/Content Security Policy/i.test(m.text()) && /img-src|connect-src/.test(m.text())) csp.push(m.text()); });
  return { pedidos, csp };
}

async function tilesSimulados(page, status = 200) {
  for (const padrao of [IMAGEM, NOMES]) {
    await page.route(padrao, (rota) => (status === 200
      ? rota.fulfill({ status, contentType: 'image/png', body: PNG })
      : rota.fulfill({ status, contentType: 'application/json', body: '{"error":{"code":498,"message":"Invalid token."}}' })));
  }
}

const zoomDo = (url) => Number(/\/tile\/(\d+)\//.exec(url)?.[1]);

test.describe('sem chave', () => {
  test('"Satélite" indisponível com aviso, "Sem fundo" padrão e nenhum pedido à Esri', async ({ page }) => {
    const { pedidos, csp } = observar(page);
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    await expect(page.locator('#fundo-nenhum')).toHaveAttribute('aria-pressed', 'true');
    const satelite = page.locator('#fundo-satelite');
    await expect(satelite).toHaveAttribute('aria-pressed', 'false');
    await expect(satelite).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#aviso-fundo')).toHaveText('Satélite indisponível: mapa-base não configurado neste ambiente.');
    await expect(satelite).toHaveAccessibleDescription(/Satélite indisponível/);
    await abrirOpcoesMapa(page);
    await satelite.click({ force: true }); // aria-disabled: o clique não liga nada
    await expect(page.locator('#fundo-nenhum')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#mapa')).toHaveAttribute('data-fundo', 'nenhum');
    await expect(page.locator('.leaflet-control-attribution')).toContainText('sem mapa-base de terceiros');
    expect(pedidos).toEqual([]);
    expect(csp).toEqual([]);
  });
});

test.describe('com valor fictício e tiles interceptados', () => {
  test.use({ baseURL: 'http://127.0.0.1:5174' });

  test('carrega imagem e nomes com referrerpolicy e atribuição; "Sem fundo" interrompe novos pedidos', async ({ page }) => {
    const { pedidos, csp } = observar(page);
    await tilesSimulados(page);
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    await expect(page.locator('#fundo-satelite')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#fundo-satelite')).not.toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#aviso-fundo')).toBeHidden();
    await expect(page.locator('#mapa')).toHaveAttribute('data-fundo', 'satelite');

    const tiles = page.locator('.fundo-mapa-camada img.leaflet-tile');
    await expect.poll(() => tiles.count()).toBeGreaterThan(0);
    await expect.poll(() => pedidos.filter((u) => u.includes('ibasemaps-api')).length).toBeGreaterThan(0);
    await expect.poll(() => pedidos.filter((u) => u.includes('static-map-tiles-api')).length).toBeGreaterThan(0);
    const politicas = await tiles.evaluateAll((ims) => [...new Set(ims.map((i) => i.getAttribute('referrerpolicy')))]);
    expect(politicas).toEqual(['strict-origin-when-cross-origin']);
    for (const u of pedidos) expect(new URL(u).searchParams.get('token')).toBe('chave-ficticia-e2e');
    const atribuicao = page.locator('.leaflet-control-attribution');
    await expect(atribuicao).toContainText('Powered by Esri');
    await expect(atribuicao).toContainText('Nomes: Esri');
    await expect(atribuicao).not.toContainText('sem mapa-base de terceiros');

    // Desligar o fundo: as camadas saem e nenhum pedido novo vai à Esri, mesmo movendo e aproximando o mapa.
    await abrirOpcoesMapa(page);
    await page.locator('#fundo-nenhum').click();
    await expect(page.locator('#mapa')).toHaveAttribute('data-fundo', 'nenhum');
    await expect(tiles).toHaveCount(0);
    const antes = pedidos.length;
    await page.locator('.leaflet-control-zoom-in').click();
    await abrirOpcoesMapa(page);
    await page.locator('#botao-enquadrar').click();
    await page.waitForTimeout(800);
    expect(pedidos.length).toBe(antes);
    await expect(atribuicao).toContainText('sem mapa-base de terceiros');
    expect(csp).toEqual([]);
  });

  test('nenhum pedido acima do maxZoom', async ({ page }) => {
    const { pedidos } = observar(page);
    await tilesSimulados(page);
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    const mais = page.locator('.leaflet-control-zoom-in');
    for (let i = 0; i < 30 && !(await mais.getAttribute('class'))?.includes('leaflet-disabled'); i++) {
      await mais.click();
      await page.waitForTimeout(150);
    }
    await expect(mais).toHaveClass(/leaflet-disabled/);
    await page.waitForTimeout(800);
    const imagem = pedidos.filter((u) => u.includes('ibasemaps-api')).map(zoomDo);
    const nomes = pedidos.filter((u) => u.includes('static-map-tiles-api')).map(zoomDo);
    expect(Math.max(...imagem)).toBe(MAX_ZOOM);
    // Nomes em 512 px (zoomOffset -1): um nível abaixo do mapa.
    expect(Math.max(...nomes)).toBe(MAX_ZOOM - 1);
  });

  test('erro dos tiles (chave rejeitada, cota ou rede): troca para "Sem fundo" com o aviso', async ({ page }) => {
    const { pedidos } = observar(page);
    await tilesSimulados(page, 403);
    await entrar(page, 'rp');
    await expect(page.locator('#fundo-nenhum')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#aviso-fundo')).toHaveText('Fundo de satélite indisponível agora.');
    await expect(page.locator('#mapa')).toHaveAttribute('data-fundo', 'nenhum');
    await expect(page.locator('.fundo-mapa-camada img.leaflet-tile')).toHaveCount(0);
    const antes = pedidos.length;
    expect(antes).toBeGreaterThan(0);
    await abrirOpcoesMapa(page);
    await page.locator('#botao-enquadrar').click();
    await page.waitForTimeout(800);
    expect(pedidos.length).toBe(antes);

    // Religar é possível (o fundo continua disponível); com tiles bons, volta a carregar.
    await page.unrouteAll();
    await tilesSimulados(page);
    await abrirOpcoesMapa(page);
    await page.locator('#fundo-satelite').click();
    await expect(page.locator('#aviso-fundo')).toBeHidden();
    await expect.poll(() => page.locator('.fundo-mapa-camada img.leaflet-tile').count()).toBeGreaterThan(0);
  });

  // Issue #71 (BL-010, BL-011): reproduções dos defeitos vistos em produção depois da issue #64.
  test('"Sem fundo" depois do satélite: o mapa continua respondendo e a atribuição da Esri sai', async ({ page }) => {
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await tilesSimulados(page);
    await entrar(page, 'rp');
    await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
    await expect.poll(() => page.locator('.fundo-mapa-camada img.leaflet-tile').count()).toBeGreaterThan(0);
    await abrirOpcoesMapa(page);
    await page.locator('#fundo-nenhum').click();
    await page.locator('.leaflet-control-zoom-in').click();
    await page.waitForTimeout(500);
    const caixa = await page.locator('#mapa').boundingBox();
    await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2 + 40);
    await page.mouse.down();
    await page.mouse.move(caixa.x + caixa.width / 2 + 80, caixa.y + caixa.height / 2 + 60, { steps: 6 });
    await page.mouse.up();
    await page.locator('.leaflet-control-zoom-out').click();
    await page.waitForTimeout(800);
    expect(erros).toEqual([]);
    const atribuicao = page.locator('.leaflet-control-attribution');
    await expect(atribuicao).toContainText('sem mapa-base de terceiros');
    await expect(atribuicao).not.toContainText('Esri');
  });

  test('só os nomes falham: a imagem continua, com aviso', async ({ page }) => {
    await page.route(IMAGEM, (rota) => rota.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    await page.route(NOMES, (rota) => rota.fulfill({ status: 403, contentType: 'application/json', body: '{}' }));
    await entrar(page, 'rp');
    await expect(page.locator('#aviso-fundo')).toHaveText('Nomes sobre o satélite indisponíveis agora; a imagem continua.');
    await expect(page.locator('#mapa')).toHaveAttribute('data-fundo', 'satelite');
    await expect(page.locator('#fundo-satelite')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.fundo-mapa-camada')).toHaveCount(1);
    await expect(page.locator('.leaflet-control-attribution')).not.toContainText('Nomes: Esri');
  });

  for (const [largura, altura] of [[1280, 720], [390, 844]]) {
    test(`com o satélite a ${largura} px, a atribuição e a "Legenda", fechada ou aberta, não se cobrem`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: altura });
      await tilesSimulados(page);
      await entrar(page, 'rp');
      await expect(page.locator('#mapa')).toHaveAttribute('data-fundo', 'satelite');
      const cruzam = async (seletor) => {
        const a = await page.locator(seletor).boundingBox();
        const b = await page.locator('.leaflet-control-attribution').boundingBox();
        return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
      };
      expect(await cruzam('.flutuante--legenda summary')).toBe(false);
      await page.locator('.flutuante--legenda summary').click();
      await expect(page.locator('.flutuante--legenda')).toHaveAttribute('open', '');
      expect(await cruzam('.flutuante--legenda')).toBe(false);
      await expect(page.locator('.leaflet-control-attribution')).toContainText('Powered by Esri');
    });
  }
});
