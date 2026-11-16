// Mobile first, tipografia, contraste, alvos de toque, reflow, ampliação, escala de cinza, teclado e toque.
// Fixtures fictícias; capturas de trabalho ficam em test-results/ (ignorado pelo Git), nunca versionadas.
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirListaFocos, abrirOpcoesMapa, abrirSecao, consultar, entrar, escolherLente, selecionarFoco } from './ajuda.mjs';

test.beforeAll(() => cadastrarRp());

// --- Auditorias executadas dentro da página ----------------------------------------------------------

function auditoriaNaPagina() {
  const visivel = (e) => {
    const r = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    return r.width >= 2 && r.height >= 2 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]');
  };
  const etiqueta = (e) => `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${e.className && typeof e.className === 'string' ? `.${e.className.trim().split(/\s+/).join('.')}` : ''} "${(e.textContent ?? '').trim().slice(0, 30)}"`;
  const cor = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  };
  const sobre = (topo, fundo) => ({ r: topo.r * topo.a + fundo.r * (1 - topo.a), g: topo.g * topo.a + fundo.g * (1 - topo.a), b: topo.b * topo.a + fundo.b * (1 - topo.a), a: 1 });
  const fundoEfetivo = (e) => {
    const camadas = [];
    for (let n = e; n; n = n.parentElement) {
      const c = cor(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { camadas.push(c); if (c.a === 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (const c of camadas.reverse()) base = sobre(c, base);
    return base;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  const textos = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.textContent.trim() && n.parentElement && !textos.includes(n.parentElement)) textos.push(n.parentElement);
  }
  const relevantes = textos.filter((e) => visivel(e) && !e.closest('.so-leitor, script, style, svg') && !e.closest('button:disabled'));
  const fontes = relevantes.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 13.99).map(etiqueta);
  const contraste = relevantes.flatMap((e) => {
    const s = getComputedStyle(e);
    const fg = cor(s.color);
    const bg = fundoEfetivo(e);
    const tam = parseFloat(s.fontSize);
    const grande = tam >= 24 || (tam >= 18.66 && Number(s.fontWeight) >= 700);
    const r = razao(sobre(fg, bg), bg);
    return r < (grande ? 3 : 4.5) ? [`${etiqueta(e)} ${r.toFixed(2)}`] : [];
  });
  // Rádios e caixas: o alvo é o rótulo inteiro (.opcao, cartão de lente ou a linha do título dele).
  const alvos = [...document.querySelectorAll('button, input:not([type=hidden]), select, summary, a[href], .opcao, .opcao-lente .linha')]
    .filter((e) => visivel(e) && !e.closest('.so-leitor') && !e.matches(':disabled') && !(e.matches('input') && e.closest('.opcao, .opcao-lente')))
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; })
    .map((e) => `${etiqueta(e)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
  const largura = window.innerWidth;
  const transborda = [...document.body.querySelectorAll('*')]
    .filter((e) => visivel(e) && !e.closest('.rolavel, .mapa, .so-leitor, .pular, svg') && !e.matches('.pular'))
    .filter((e) => { const r = e.getBoundingClientRect(); return r.right > largura + 1 || r.left < -1; })
    .map((e) => `${etiqueta(e)} ${Math.round(e.getBoundingClientRect().left)}..${Math.round(e.getBoundingClientRect().right)}`);
  const cortados = [...document.body.querySelectorAll('*')]
    .filter((e) => visivel(e) && !e.closest('.rolavel, .mapa, svg') && ['hidden', 'clip'].includes(getComputedStyle(e).overflowX) && e.scrollWidth > e.clientWidth + 1)
    .map(etiqueta);
  return {
    larguraDocumento: document.documentElement.scrollWidth, larguraJanela: largura, fontes, contraste, alvos, transborda, cortados,
    municipios: [...document.querySelectorAll('.botao-nome, .lista-mun .nome')].filter(visivel).map((e) => parseFloat(getComputedStyle(e).fontSize)),
    etiquetas: [...document.querySelectorAll('.etiqueta')].filter(visivel).map((e) => parseFloat(getComputedStyle(e).fontSize)),
    base: parseFloat(getComputedStyle(document.body).fontSize),
  };
}

// Temas claro e escuro (DESIGN.md): o contraste é auditado nos dois, nas larguras de celular e de computador.
const VIEWPORTS = [[360, 780, 'light'], [390, 844, 'light'], [768, 1024, 'light'], [1440, 900, 'light'], [390, 844, 'dark'], [1440, 900, 'dark']];

for (const [w, h, esquema] of VIEWPORTS) {
  test(`${w}×${h} (${esquema === 'dark' ? 'tema escuro' : 'tema claro'}): fontes, contraste, alvos de toque e sem rolagem horizontal global`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await entrar(page, 'rp');
    // A tela abre no claro (V13); o tema escuro vem pelo botão da lua.
    if (esquema === 'dark') await page.getByRole('button', { name: 'Usar tema escuro' }).click();
    await expect(page.locator('#botao-tema')).toHaveAttribute('aria-pressed', String(esquema === 'dark'));
    // Abre o que fica recolhido (seções dos filtros, série) e seleciona um foco na "Lista de focos".
    for (const id of ['secao-consulta', 'secao-lente', 'secao-contexto', 'secao-cruzar']) await abrirSecao(page, id);
    await page.locator('#serie-corpo summary').click();
    await selecionarFoco(page, 'fx001');
    const a = await page.evaluate(auditoriaNaPagina);
    expect(a.larguraDocumento, 'sem rolagem horizontal global').toBeLessThanOrEqual(a.larguraJanela);
    expect(a.base).toBe(16);
    expect(a.fontes, 'texto abaixo de 0.875rem').toEqual([]);
    expect(Math.min(...a.municipios), 'nomes de municípios ≥ 1rem').toBeGreaterThanOrEqual(16);
    expect(Math.min(...a.etiquetas), 'etiquetas ≥ 0.875rem').toBeGreaterThanOrEqual(14);
    expect(a.contraste, 'texto com contraste < 4,5:1 (3:1 em texto grande)').toEqual([]);
    expect(a.alvos, 'controles menores que 44×44 CSS px').toEqual([]);
    expect(a.transborda, 'elementos fora da largura da janela').toEqual([]);
    expect(a.cortados, 'conteúdo cortado').toEqual([]);
    // O diálogo "Sobre os dados" também é auditado, aberto.
    await page.getByRole('button', { name: 'Sobre os dados' }).click();
    await page.locator('#proveniencia-corpo summary').click();
    const d = await page.evaluate(auditoriaNaPagina);
    expect(d.contraste, 'diálogo: contraste').toEqual([]);
    expect(d.alvos, 'diálogo: alvos').toEqual([]);
    expect(d.transborda, 'diálogo: fora da janela').toEqual([]);
    await page.keyboard.press('Escape');
    // A aba Destaques com uma lista e a explicação aberta também passam pela auditoria.
    await escolherLente(page, 'concentracao');
    await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
    await page.locator('#lente-destaques .botao-nome').first().click();
    await expect(page.locator('#vista-explicacao')).toBeVisible();
    const x = await page.evaluate(auditoriaNaPagina);
    expect(x.contraste, 'explicação: contraste').toEqual([]);
    expect(x.alvos, 'explicação: alvos').toEqual([]);
    expect(x.transborda, 'explicação: fora da janela').toEqual([]);
    expect(x.fontes, 'explicação: texto abaixo de 0.875rem').toEqual([]);
    // Ciclo 008, item 4: o painel de perguntas com uma resposta (provedor simulado) e os blocos abertos.
    await page.locator('#pergunta-destaque').click();
    await expect(page.locator('#painel-perguntas')).toHaveAttribute('data-estado-perguntas', 'resposta');
    for (const s of await page.locator('#perguntas-corpo details > summary').all()) await s.click();
    const q = await page.evaluate(auditoriaNaPagina);
    expect(q.contraste, 'perguntas: contraste').toEqual([]);
    expect(q.alvos, 'perguntas: alvos').toEqual([]);
    expect(q.transborda, 'perguntas: fora da janela').toEqual([]);
    expect(q.fontes, 'perguntas: texto abaixo de 0.875rem').toEqual([]);
    expect(q.larguraDocumento, 'perguntas: sem rolagem horizontal global').toBeLessThanOrEqual(q.larguraJanela);
    await page.screenshot({ path: `test-results/ref-${w}x${h}-${esquema}.png`, fullPage: true });
  });
}

test('tema: abre no claro, mesmo com o sistema escuro, e alterna sem gravar nada no navegador', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await entrar(page, 'rp');
  const fundo = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const claro = await fundo();
  expect(claro).toBe('rgb(244, 246, 242)');
  const botao = page.locator('#botao-tema');
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
  await expect(botao).toHaveAccessibleName('Usar tema escuro');
  await botao.click();
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  await expect(botao).toHaveAccessibleName('Usar tema claro');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
  expect(await fundo()).not.toBe(claro);
  const a = await page.evaluate(auditoriaNaPagina);
  expect(a.contraste, 'tema escuro pela alternância').toEqual([]);
  await botao.click();
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
  expect(await fundo()).toBe(claro);
  const chaves = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((k) => !k.includes('auth-token') && !k.includes('code-verifier')));
  expect(chaves).toEqual([]);
});

test('layout (V13): uma coluna no celular (filtros, mapa, série, resultado); três colunas no computador', async ({ page }) => {
  const caixa = (sel) => page.locator(sel).evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; });
  await page.setViewportSize({ width: 390, height: 844 });
  await entrar(page, 'rp');
  // T17: em tela estreita as seções começam fechadas; recolhida, a Consulta não mostra resumo (issue #71).
  await expect(page.locator('#secao-consulta')).not.toHaveAttribute('open', '');
  await expect(page.locator('#secao-consulta summary')).toHaveText('Consulta');
  const [filtros, mapa, resultado, serie] = [await caixa('#filtros'), await caixa('.mapa-cartao'), await caixa('#resultado'), await caixa('section[aria-labelledby="t-resumo"]')];
  expect(mapa.w).toBeGreaterThan(390 * 0.9);
  expect(filtros.y).toBeLessThan(mapa.y);
  expect(mapa.y).toBeLessThan(serie.y);
  expect(serie.y).toBeLessThan(resultado.y);

  await page.setViewportSize({ width: 1440, height: 900 });
  const [f2, m2, r2, s2] = [await caixa('#filtros'), await caixa('.mapa-cartao'), await caixa('#resultado'), await caixa('section[aria-labelledby="t-resumo"]')];
  expect(m2.x).toBeGreaterThan(f2.x + f2.w - 1);
  expect(r2.x).toBeGreaterThan(m2.x + m2.w - 1);
  expect(m2.w).toBeGreaterThan(r2.w);
  expect(Math.abs(m2.y - r2.y)).toBeLessThan(2);
  expect(Math.abs(m2.y - f2.y)).toBeLessThan(2);
  expect(s2.y).toBeGreaterThan(m2.y + m2.h - 1);
  expect(Math.abs(s2.x - m2.x)).toBeLessThan(2);
});

test('ampliação do texto a 200% e reflow em 320 px não cortam conteúdo nem a função', async ({ page }) => {
  const meta = await (async () => { await page.goto('/'); return page.locator('meta[name=viewport]').getAttribute('content'); })();
  expect(meta).toBe('width=device-width, initial-scale=1');
  for (const [w, h, escala] of [[640, 900, '200%'], [360, 800, '200%'], [320, 640, '100%'], [320, 640, '200%']]) {
    await page.setViewportSize({ width: w, height: h });
    await entrar(page, 'rp');
    await page.evaluate((e) => { document.documentElement.style.fontSize = e; }, escala);
    await page.locator('#serie-corpo summary').click();
    const a = await page.evaluate(auditoriaNaPagina);
    const rotulo = `${w}px, texto ${escala}`;
    expect(a.transborda, `${rotulo}: fora da janela`).toEqual([]);
    expect(a.larguraDocumento, `${rotulo}: rolagem horizontal global`).toBeLessThanOrEqual(a.larguraJanela);
    expect(a.cortados, `${rotulo}: cortado`).toEqual([]);
    // A função continua: consultar um município e ver o resultado.
    await consultar(page, { municipio: 9900002 });
    await expect(page.locator('#total-principal')).toHaveText('30');
    await page.screenshot({ path: `test-results/zoom-${w}-${escala.replace('%', '')}.png`, fullPage: true });
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page.locator('#acesso[data-estado="anonimo"]')).toBeVisible();
  }
});

test('escala de cinza: a ação primária se distingue por preenchimento e a secundária por contorno', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await entrar(page, 'rp');
  const estilo = (sel) => page.locator(sel).evaluate((e) => {
    const s = getComputedStyle(e);
    return { bg: s.backgroundColor, cor: s.color, borda: s.borderTopWidth, bordaCor: s.borderTopColor, peso: s.fontWeight };
  });
  await abrirSecao(page, 'secao-consulta');
  const primario = await estilo('#dialogo-como-ler .botao--primario');
  const secundario = await estilo('#botao-sair');
  const cinza = (c) => { const [r, g, b] = c.match(/\d+(\.\d+)?/g).map(Number); return 0.299 * r + 0.587 * g + 0.114 * b; };
  expect(primario.bg).not.toBe('rgba(0, 0, 0, 0)');
  expect(primario.cor).toBe('rgb(255, 255, 255)');
  expect(parseFloat(secundario.borda)).toBeGreaterThanOrEqual(1);
  // Em tons de cinza, o preenchimento do primário é bem mais escuro que a superfície do secundário (V13).
  expect(cinza(secundario.bg) - cinza(primario.bg)).toBeGreaterThan(100);
  // Captura de trabalho em cinza (não versionada).
  // Via CSSOM, não por <style> injetado: o E2E serve os cabeçalhos do deploy (CSP sem 'unsafe-inline').
  await page.evaluate(() => { document.documentElement.style.filter = 'grayscale(1)'; });
  await page.locator('#filtros').screenshot({ path: 'test-results/cinza-filtros.png' });
  await page.locator('#mapa').scrollIntoViewIfNeeded();
  await page.locator('.mapa-cartao').screenshot({ path: 'test-results/cinza-mapa.png' });
});

test('foco visível e fluxo só por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await entrar(page, 'rp');
  const foco = () => page.evaluate(() => {
    const e = document.activeElement;
    const s = getComputedStyle(e);
    return { tag: e.tagName, id: e.id, estilo: s.outlineStyle, largura: parseFloat(s.outlineWidth), cor: s.outlineColor };
  });
  await page.locator('.pular').focus();
  expect((await foco()).tag).toBe('A'); // link "Ir para o conteúdo"
  await page.keyboard.press('Tab');
  const vistos = [];
  for (let i = 0; i < 30; i += 1) {
    const f = await foco();
    // Depois do último controle, o Tab passa pelo documento e volta ao começo.
    if (f.tag === 'BODY') { await page.keyboard.press('Tab'); continue; }
    expect(f.estilo, `foco do elemento ${f.tag}#${f.id}`).not.toBe('none');
    expect(f.largura).toBeGreaterThanOrEqual(2);
    vistos.push(f.id || f.tag);
    await page.keyboard.press('Tab');
  }
  for (const id of ['botao-sobre', 'botao-como-ler', 'botao-tema', 'botao-sair', 'f-periodo', 'f-municipio']) expect(vistos).toContain(id);
  expect(vistos.indexOf('f-periodo')).toBeLessThan(vistos.indexOf('f-municipio'));

  // Município por teclado: aplica ao mudar, sem botão "Consultar" (T16).
  await page.locator('#f-municipio').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#f-municipio')).toHaveValue('9900001');
  await expect(page.locator('#total-principal')).toHaveText('60');
  // Seção recolhível por teclado: Enter no título abre e fecha.
  await page.locator('#secao-lente summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#secao-lente')).toHaveAttribute('open', '');
  // O mapa é focável e a "Lista de focos" é a alternativa em texto (T21).
  await page.locator('#mapa').focus();
  expect(await page.evaluate(() => document.activeElement.id)).toBe('mapa');
  await abrirListaFocos(page);
  await expect(page.locator('#lista-focos-itens button').first()).toBeVisible();
  // Abas do resultado por teclado: setas trocam a aba e o foco (padrão de abas).
  await page.locator('#aba-municipios').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#aba-destaques')).toBeFocused();
  await expect(page.locator('#aba-destaques')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#cartao-lentes')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#aba-municipios')).toHaveAttribute('aria-selected', 'true');
});

test.describe('tela de toque', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('um dedo rola a página; o mapa só arrasta quando o usuário ativa', async ({ page }) => {
    await entrar(page, 'rp');
    await abrirOpcoesMapa(page, true);
    const botao = page.locator('#botao-arrastar');
    await expect(botao).toBeVisible();
    await expect(botao).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#mapa.leaflet-grab')).toHaveCount(0);
    await botao.tap();
    await expect(botao).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#mapa.leaflet-grab')).toHaveCount(1);
    await botao.tap();
    await expect(page.locator('#mapa.leaflet-grab')).toHaveCount(0);
  });
});

test('computador: o mapa arrasta direto e o botão de toque não aparece', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await entrar(page, 'rp');
  await expect(page.locator('#botao-arrastar')).toBeHidden();
  await expect(page.locator('#mapa.leaflet-grab')).toHaveCount(1);
});
