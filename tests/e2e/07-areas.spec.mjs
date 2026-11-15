// Ciclo 006, issue #52 — camada de áreas protegidas e interface da lente de sobreposição (T22 a T25): camada sob
// demanda com legenda em texto e atribuição, área selecionada e contorno real de uma área, lente por classe com
// lista paginada, retângulos e painel com motivo por área, contornos reais da célula aberta (uma requisição por
// área, sem repetir), estados de T24, concorrência, perda de acesso, sessão expirada, versão substituída, carga
// sem camada e acessibilidade. Valores esperados derivados à mão da carga fictícia (tests/e2e/fixture.mjs,
// sqlFixtureAreas), sem usar a interface nem o módulo.
import { test, expect } from '@playwright/test';
import { sqlAdmin } from '../../scripts/banco/local.mjs';
import { cadastrarRp, revogarRp } from './contas.mjs';
import { abrirDestaque, alternarCamada, consultar, entrar, escolherLente } from './ajuda.mjs';
import { SQL_LIMPEZA, sqlFixture, sqlFixtureAreas } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });
test.beforeAll(() => {
  sqlAdmin(SQL_LIMPEZA);
  sqlAdmin(sqlFixtureAreas());
  cadastrarRp();
});
test.afterAll(() => {
  cadastrarRp();
  sqlAdmin(SQL_LIMPEZA);
  sqlAdmin(sqlFixture());
});

const K = 'c-231_-1130';
const L = 'c-229_-1113';
const M = 'c-233_-1091';
const ROTULO_K = `Célula ${K} (-11.55 a -11.50 · -56.50 a -56.45) — 2 detecções dentro de Parque Fictício Um`;
const ROTULO_L = `Célula ${L} (-11.45 a -11.40 · -55.65 a -55.60) — 1 detecção dentro de Reserva Fictícia Dois`;
const ROTULO_M = `Célula ${M} (-11.65 a -11.60 · -54.55 a -54.50) — 3 detecções dentro de Terra Indígena Fictícia Alfa; Terra Indígena Fictícia Beta`;
const MOTIVO_M = 'Motivo: 2 de 3 detecções desta célula dentro da Terra Indígena Fictícia Alfa (fase: Regularizada); 1 de 3 detecções desta célula dentro da Terra Indígena Fictícia Beta (fase: Declarada)';
const SEM_CAMADA = 'Esta versão dos dados não tem a camada de áreas protegidas.';

const cartao = (page) => page.locator('#cartao-lentes');
const itens = (page) => page.locator('#lente-destaques > li');
const rotulos = (page) => itens(page).locator('.botao-nome').allInnerTexts();
const areasNoMapa = (page) => page.locator('#mapa path[data-chave]');
const contornosNoMapa = (page) => page.locator('#mapa .leaflet-areas-pane path:not([data-chave])');

/**
 * Calcula a sobreposição de uma classe com um cálculo só: a classe fica marcada antes de escolher a lente, como quando o
 * usuário a escolheu numa visita anterior à seção (o rádio guarda a escolha). Com a sobreposição já escolhida, passa
 * por outra lente para que a nova escolha recalcule, mesmo com a mesma classe.
 */
async function aplicar(page, classe) {
  if (await page.locator('input[name="l-lente"][value="sobreposicao"]').isChecked()) await escolherLente(page, 'concentracao');
  await page.locator(`input[name="l-classe"][value="${classe}"]`).evaluate((e) => { e.checked = true; });
  await escolherLente(page, 'sobreposicao');
}

/** Requisições às tabelas de áreas (URL decodificada), separadas por tipo. */
function observarAreas(page) {
  const r = { geral: [], lente: [], real: [], vinculos: [] };
  page.on('request', (q) => {
    const url = decodeURIComponent(q.url());
    if (url.includes('/rest/v1/deteccoes_areas')) r.vinculos.push(url);
    else if (url.includes('/rest/v1/areas?')) {
      if (url.includes('geometria_real')) r.real.push(url);
      else if (url.includes('geometria_geral')) r.geral.push(url);
      else r.lente.push(url);
    }
  });
  return r;
}

/** Segura a primeira requisição que casar com `padrao` até `soltar()`; com `resposta`, libera com ela. */
async function reter(page, padrao, resposta = null) {
  let soltar;
  const liberado = new Promise((x) => { soltar = x; });
  let chegou;
  const chegada = new Promise((x) => { chegou = x; });
  let retida = false;
  await page.route(padrao, async (route) => {
    if (retida) return route.continue();
    retida = true;
    chegou();
    const resp = resposta ? null : await route.fetch();
    await liberado;
    await route.fulfill(resposta ?? { response: resp }).catch(() => {});
  });
  return { soltar: () => soltar(), chegada };
}

/** Nenhum texto sugere ranking, gravidade, prioridade, culpa ou responsabilização (T23, risco do plano). */
async function semRanking(page, seletor) {
  const texto = await page.locator(seletor).innerText();
  expect(texto).not.toMatch(/(?<!não é )\branking\b/i);
  expect(texto).not.toMatch(/(?<!não indica |nem )\b(gravidade|prioridade)\b/i);
  expect(texto).not.toMatch(/responsabiliz|culpa|infrator|invas[ãa]o/i);
  expect(texto).not.toMatch(/\bcoberto\b/i);
}

test('camada sob demanda: nada na abertura; legenda em texto, atribuição, área selecionada e contorno real de uma área', async ({ page }) => {
  const req = observarAreas(page);
  await entrar(page, 'rp');
  await expect(page.locator('#total-principal')).toHaveText('60');
  // Nenhuma leitura de áreas na abertura (ADR-007, T24).
  expect([...req.geral, ...req.lente, ...req.real, ...req.vinculos]).toEqual([]);
  await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'oculta');
  await expect(page.locator('#proveniencia-areas')).toContainText('CNUC (MMA): retrato cnuc-ficticio, obtido em 2026-11-12 12:00 GMT; fonte fictícia de unidades de conservação, CC BY');
  await expect(page.locator('#proveniencia-areas')).toContainText('FUNAI: retrato funai-ficticio');

  const botao = page.locator('#c-areas');
  await alternarCamada(page, 'c-areas');
  await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'visivel');
  await expect(botao).toBeChecked();
  await expect(page.locator('#areas-estado')).toContainText('Áreas protegidas no mapa: 4 (contorno simplificado');
  await expect(page.locator('#areas-legenda li[data-classe]')).toHaveText([
    'Proteção integral (contorno contínuo verde, hachura inclinada para a direita): 1 área',
    'Uso sustentável (contorno tracejado lilás, hachura inclinada para a esquerda): 1 área',
    'Terra indígena (contorno pontilhado rosa, hachura vertical): 2 áreas',
  ]);
  await expect(page.locator('#areas-aviso')).toContainText('Áreas de outros estados que entram em Mato Grosso só aparecem quando contêm detecção desta carga.');
  await expect(page.locator('#areas-atribuicao')).toContainText('FUNAI: retrato funai-ficticio, obtido em 2026-11-12 12:00 GMT; fonte fictícia de terras indígenas, reprodução com citação');
  await expect(areasNoMapa(page)).toHaveCount(4);
  // Visão geral lida uma vez pelo leitor T25, só com a geometria geral.
  expect(req.geral).toHaveLength(1);
  expect(req.real).toEqual([]);
  await semRanking(page, '#mapa-areas');

  // Toque numa área: dados da área; o contorno real só vem pelo botão.
  await page.locator('#mapa path[data-chave="cnuc:ficticia-1"]').dispatchEvent('click');
  await expect(page.locator('#areas-selecao-titulo')).toHaveText('Área selecionada: Parque Fictício Um');
  await expect(page.locator('#areas-selecao-titulo')).toBeFocused();
  await expect(page.locator('#areas-selecao dd')).toHaveText(['proteção integral', 'Parque', 'Estadual', 'Polígono é uma estimativa dos limites da UC', 'CNUC (MMA)']);
  expect(req.real).toEqual([]);
  await page.getByRole('button', { name: 'Ver contorno real' }).click();
  await expect(page.locator('#areas-contorno-estado')).toHaveText('Contorno real desta área exibido no mapa (traço branco).');
  expect(req.real).toHaveLength(1);
  expect(req.real[0]).toContain('codigo=eq.ficticia-1');
  await expect(contornosNoMapa(page)).toHaveCount(1);
  // De novo: vem da memória, sem nova requisição.
  await page.getByRole('button', { name: 'Ver contorno real' }).click();
  await expect(page.locator('#areas-contorno-estado')).toHaveText('Contorno real desta área exibido no mapa (traço branco).');
  expect(req.real).toHaveLength(1);

  // Ocultar e mostrar de novo: sem nova leitura da visão geral.
  await alternarCamada(page, 'c-areas');
  await expect(botao).not.toBeChecked();
  await expect(page.locator('#areas-legenda')).toBeHidden();
  await expect(areasNoMapa(page)).toHaveCount(0);
  await expect(page.locator('#areas-selecao')).toBeHidden();
  await alternarCamada(page, 'c-areas');
  await expect(areasNoMapa(page)).toHaveCount(4);
  expect(req.geral).toHaveLength(1);
});

test('terra indígena: 53 células em 2 páginas; célula com duas áreas baixa dois contornos, sem repetir ao reabrir', async ({ page }) => {
  const req = observarAreas(page);
  await entrar(page, 'rp');
  // O grupo de classes só aparece com a opção da sobreposição.
  await expect(page.locator('#lente-sobreposicao')).toBeHidden();
  await aplicar(page, 'terra_indigena');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-estado')).toContainText(/Lente concluída em \d+,\d s\./);
  await expect(page.locator('#lente-classe')).toHaveText('Classe aplicada: terra indígena.');
  await expect(page.locator('#lente-escopo')).toContainText('método sobreposicao-006-v1');
  await expect(page.locator('#lente-escopo')).toContainText('o filtro de município não se aplica às lentes');
  await expect(page.locator('#lente-ordenacao')).toHaveText('Lista na ordem das células, de norte a sul e de oeste a leste; não é ranking.');
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 1 a 50 de 53.');
  await expect(itens(page)).toHaveCount(50);
  expect((await rotulos(page))[0]).toBe(ROTULO_M);
  await expect(page.locator('#lente-mapa-info')).toContainText('Mapa: 53 células desenhadas');
  // A lente lê áreas e vínculos sem geometria; nenhum contorno antes de abrir uma célula.
  expect(req.lente.length).toBeGreaterThan(0);
  expect(req.geral).toEqual([]);
  expect(req.real).toEqual([]);
  await semRanking(page, '#cartao-lentes');

  await page.getByRole('button', { name: 'Próximas células' }).click();
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 51 a 53 de 53.');
  await expect(page.locator('#lente-celulas-info')).toBeFocused();
  await expect(itens(page)).toHaveCount(3);
  await page.getByRole('button', { name: 'Células anteriores' }).click();

  // Abertura da célula M: motivo por área, evidência agregada sem duplicação e dois contornos reais.
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', `sobreposicao:terra_indigena:celula_005:${M}`);
  await expect(page.locator('#lente-painel-titulo')).toBeFocused();
  await expect(page.locator('#lente-motivo')).toHaveText(MOTIVO_M);
  await expect(page.locator('#lente-areas > li')).toHaveCount(2);
  expect(await page.locator('#lente-areas > li').evaluateAll((l) => l.map((x) => x.dataset.chave))).toEqual(['funai:9001', 'funai:9002']);
  await expect(page.locator('#lente-areas > li h4')).toHaveText(['Terra Indígena Fictícia Alfa', 'Terra Indígena Fictícia Beta']);
  await expect(page.locator('#lente-areas .area-citada__evidencia')).toHaveText([
    '2 detecções desta célula na janela vinculadas a esta área.', '1 detecção desta célula na janela vinculada a esta área.']);
  await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–3 de 3 detecções da evidência.');
  const linhas = await page.locator('#lente-evidencia-tabela tbody tr').evaluateAll((l) => l.map((tr) => [...tr.cells].map((c) => c.textContent)));
  expect(linhas.map((c) => [c[5], c[4]])).toEqual([
    ['m1', 'Terra Indígena Fictícia Alfa'], ['m2', 'Terra Indígena Fictícia Beta'], ['m3', 'Terra Indígena Fictícia Alfa']]);
  await expect(page.locator('#lente-cobertura')).toContainText('31 de 31 dias sem evidência de lacuna (cobertura não comprovada)');
  await expect(page.locator('#lente-aviso-dominio')).toContainText('não indica infração, autoria nem situação fundiária');
  await expect(page.locator('#lente-contornos')).toHaveAttribute('data-contornos', 'exibido');
  await expect(contornosNoMapa(page)).toHaveCount(2);
  expect(req.real).toHaveLength(2);
  expect(req.real.some((u) => u.includes('codigo=eq.9001'))).toBe(true);
  expect(req.real.some((u) => u.includes('codigo=eq.9002'))).toBe(true);

  // Outra célula (só T1, já em memória) e de novo M: nenhuma requisição nova de contorno.
  await abrirDestaque(page, 1);
  await expect(page.locator('#lente-contornos')).toHaveAttribute('data-contornos', 'exibido');
  await expect(contornosNoMapa(page)).toHaveCount(1);
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-contornos')).toHaveAttribute('data-contornos', 'exibido');
  await expect(contornosNoMapa(page)).toHaveCount(2);
  expect(req.real).toHaveLength(2);

  // Citação no painel: dados da área e contorno real da memória.
  await page.getByRole('button', { name: 'Ver dados e contorno de Terra Indígena Fictícia Beta' }).click();
  await expect(page.locator('#areas-selecao-titulo')).toHaveText('Área selecionada: Terra Indígena Fictícia Beta');
  await expect(page.locator('#areas-selecao dd')).toHaveText(['terra indígena', 'Declarada', 'não informada pela fonte', 'FUNAI']);
  await page.getByRole('button', { name: 'Ver contorno real' }).click();
  await expect(page.locator('#areas-contorno-estado')).toHaveText('Contorno real desta área exibido no mapa (traço branco).');
  expect(req.real).toHaveLength(2);
});

test('proteção integral: motivo, ressalvas de polígono estimado e de borda, cobertura e limitações; nenhuma outra classe citada', async ({ page }) => {
  await entrar(page, 'rp');
  await aplicar(page, 'protecao_integral');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(await rotulos(page)).toEqual([ROTULO_K]);
  await expect(itens(page).locator('.etiqueta')).toHaveText(['30 de 31 dias sem evidência de lacuna (cobertura não comprovada)']);
  for (const p of ['proteção integral', 'pelo menos 1 detecção principal da janela dentro de área da classe, com a borda incluída',
    'calculado na carga com o polígono integral da fonte']) {
    await expect(page.locator('#lente-parametros')).toContainText(p);
  }
  const limitacoes = page.locator('#lente-limitacoes');
  await expect(limitacoes).toContainText('Estar dentro de uma área protegida não indica infração, autoria nem situação fundiária.');
  await expect(limitacoes).toContainText('Os limites são um retrato datado da fonte');
  await expect(limitacoes).toContainText('o mapa mostra um contorno simplificado (tolerância de até cerca de 550 m)');
  await expect(limitacoes).toContainText('Áreas de outros estados que entram em Mato Grosso só aparecem quando contêm detecção desta carga.');
  await expect(limitacoes).toContainText('A lista não é ranking: a classe ou o número de detecções não indica gravidade nem prioridade.');

  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-motivo')).toHaveText('Motivo: 2 de 3 detecções desta célula dentro de Parque Fictício Um (proteção integral, Parque, Estadual)');
  await expect(page.locator('#lente-areas .ressalvas-area > li')).toHaveText([
    'limite estimado pelo órgão gestor; a posição exata pode diferir', '1 detecção exatamente sobre o limite da área']);
  await expect(page.locator('#lente-areas .area-citada__evidencia')).toHaveText('2 detecções desta célula na janela vinculadas a esta área; 1 detecção sobre o limite.');
  await expect(page.locator('#lente-municipios')).toContainText('Município Alfa (9900001)');
  await page.getByText('Dias que contam contra (1)').click();
  await expect(page.locator('#lente-dias > li')).toHaveAttribute('data-classe', 'lacuna_conhecida');
  const painel = await page.locator('#lente-painel').innerText();
  for (const outra of ['uso sustentável', 'Reserva Fictícia Dois', 'Terra Indígena']) expect(painel).not.toContain(outra);
  await semRanking(page, '#cartao-lentes');
});

test('uso sustentável: destaque na janela inteira e "sem destaques" de 01 a 03/10, com o texto de T23', async ({ page }) => {
  await entrar(page, 'rp');
  await aplicar(page, 'uso_sustentavel');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(await rotulos(page)).toEqual([ROTULO_L]);
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-motivo')).toHaveText('Motivo: 1 de 2 detecções desta célula dentro de Reserva Fictícia Dois (uso sustentável, Reserva Extrativista, Federal)');
  await expect(page.locator('#lente-areas .ressalvas-area')).toHaveCount(0);

  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-03' });
  await expect(page.locator('#total-principal')).toBeVisible();
  await aplicar(page, 'uso_sustentavel');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'sem_destaques');
  await expect(page.locator('#lente-sem-destaques')).toHaveText('Nenhuma célula com detecção dentro de uso sustentável nesta janela. Isso não indica ausência de focos nem de risco.');
  await expect(itens(page)).toHaveCount(0);
  await expect(page.locator('#lente-limitacoes')).toContainText('não comprovam incêndio, dano, autoria ou infração');
});

test('a sobreposição abre com "Proteção integral" marcada (V13), calcula ao escolher e recalcula ao trocar a classe', async ({ page }) => {
  await entrar(page, 'rp');
  await escolherLente(page, 'sobreposicao');
  await expect(page.locator('#lente-sobreposicao')).toBeVisible();
  await expect(page.locator('input[name="l-classe"][value="protecao_integral"]')).toBeChecked();
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-classe')).toHaveText('Classe aplicada: proteção integral.');
  await page.locator('input[name="l-classe"][value="uso_sustentavel"]').check();
  await expect(page.locator('#lente-classe')).toHaveText('Classe aplicada: uso sustentável.');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(await rotulos(page)).toEqual([ROTULO_L]);
});

test('leitura inconsistente (contagem divergente nos vínculos), falha da fonte e contorno indisponível: estados próprios', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/deteccoes_areas*', async (route) => {
    const resp = await route.fetch();
    await route.fulfill({ response: resp, headers: { ...resp.headers(), 'content-range': '0-57/59' } });
  });
  await aplicar(page, 'terra_indigena');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'leitura_inconsistente');
  await expect(page.locator('#lente-estado')).toContainText('total 59 diferente do declarado 58');
  await expect(itens(page)).toHaveCount(0);
  // A camada usa o mesmo leitor: o mesmo estado, sem área desenhada.
  await alternarCamada(page, 'c-areas');
  await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'leitura_inconsistente');
  await expect(areasNoMapa(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.locator('#botao-areas-tentar').click();
  await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'visivel');

  await page.route('**/rest/v1/areas?*', (route) => route.fulfill({ status: 503, json: { message: 'indisponivel' } }));
  await aplicar(page, 'terra_indigena');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'falha');
  await expect(page.locator('#lente-estado')).toContainText('Fonte de dados indisponível');
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  // Contorno real indisponível: a célula, o motivo e a evidência continuam; tentar de novo ao reabrir.
  await aplicar(page, 'protecao_integral');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await page.route((u) => u.pathname.endsWith('/rest/v1/areas') && u.searchParams.get('select') === 'geometria_real',
    (route) => route.fulfill({ status: 503, json: { message: 'indisponivel' } }));
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-contornos')).toHaveAttribute('data-contornos', 'falha');
  await expect(page.locator('#lente-contornos')).toContainText('a célula, o motivo e a evidência continuam válidos');
  await expect(page.locator('#lente-motivo')).toBeVisible();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-contornos')).toHaveAttribute('data-contornos', 'exibido');
});

test('cobertura não verificada: falha na disponibilidade de Gama; seleção mantida; tentar de novo qualifica', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_disponibilidade', async (route) => {
    if (JSON.parse(route.request().postData() ?? '{}').p_municipio !== 9900003) return route.continue();
    await route.fulfill({ status: 503, json: { message: 'indisponivel' } });
  });
  await aplicar(page, 'terra_indigena');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'cobertura_nao_verificada');
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 1 a 50 de 53.');
  await expect(itens(page).first().locator('.etiqueta')).toHaveText('cobertura não verificada: fonte indisponível');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-classe')).toHaveText('Classe aplicada: terra indígena.');
});

test('cancelada (nova janela), "Nenhuma" e outra lente durante a leitura: a resposta atrasada não aparece', async ({ page }) => {
  await entrar(page, 'rp');
  let r = await reter(page, '**/rest/v1/deteccoes_areas*');
  await aplicar(page, 'terra_indigena');
  await r.chegada;
  await expect(page.locator('#lente-estado')).toContainText('Carregando: áreas protegidas e vínculos da carga');
  // Nova janela: a lente é recalculada na janela nova (T16); a resposta antiga não aparece.
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-15' });
  await expect(page.locator('#lente-escopo')).toContainText('2026-10-01 a 2026-10-15');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(page.locator('#lente-escopo')).toContainText('2026-10-01 a 2026-10-15');
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  r = await reter(page, '**/rest/v1/deteccoes_areas*');
  await aplicar(page, 'terra_indigena');
  await r.chegada;
  await escolherLente(page, 'nenhuma');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(page.locator('#lente-sobreposicao')).toBeHidden();
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  r = await reter(page, '**/rest/v1/deteccoes_areas*');
  await aplicar(page, 'terra_indigena');
  await r.chegada;
  await escolherLente(page, 'concentracao');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-classe')).toHaveCount(0);
  await expect(page.locator('#lente-escopo')).toContainText('método lentes-004-v1');
});

test('perda de acesso entre a leitura das áreas e a dos vínculos, com a carga vigente: acesso negado, limpa camada, lente e memória', async ({ page }) => {
  await entrar(page, 'rp');
  await alternarCamada(page, 'c-areas');
  await expect(areasNoMapa(page)).toHaveCount(4);
  let revogado = false;
  await page.route('**/rest/v1/deteccoes_areas*', async (route) => {
    if (!revogado) {
      revogado = true;
      revogarRp();
    }
    await route.continue();
  });
  try {
    await aplicar(page, 'terra_indigena');
    await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'negado');
    await expect(page.locator('#conteudo')).toBeHidden();
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
    await expect(itens(page)).toHaveCount(0);
    await expect(areasNoMapa(page)).toHaveCount(0);
    await expect(page.locator('#c-areas')).not.toBeChecked();
    await expect(page.locator('#areas-legenda')).toBeHidden();
    await expect(page.locator('#estado-consulta')).not.toHaveAttribute('data-estado', 'versao_substituida');
  } finally {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    cadastrarRp();
  }
});

test('sessão expirada nos vínculos limpa tudo; após novo login, nenhuma lente ou camada antiga', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/deteccoes_areas*', (route) => route.fulfill({ status: 401, json: { code: 'PGRST301', message: 'JWT expired' } }));
  await aplicar(page, 'protecao_integral');
  await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'anonimo');
  await expect(page.locator('#acesso-corpo')).toContainText('Sua sessão expirou');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await entrar(page, 'rp');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'oculta');
  await expect(areasNoMapa(page)).toHaveCount(0);
});

test('versão substituída (linha da carga oculta e outra vigente): estado próprio, limpa lente, camada e contornos', async ({ page }) => {
  await entrar(page, 'rp');
  await alternarCamada(page, 'c-areas');
  await expect(areasNoMapa(page)).toHaveCount(4);
  await page.route((u) => u.pathname.endsWith('/rest/v1/cargas') && (u.searchParams.get('select') ?? '').includes('total_areas'),
    (route) => route.fulfill({ status: 200, json: [], headers: { 'content-range': '*/0' } }));
  await page.route('**/rest/v1/publicacao_vigente*', (route) => route.fulfill({ status: 200, json: [{ carga_id: 987654 }] }));
  await aplicar(page, 'terra_indigena');
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'versao_substituida');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'versao_substituida');
  await expect(page.locator('#lente-estado')).toContainText('Lente cancelada: a versão de dados foi substituída');
  await expect(itens(page)).toHaveCount(0);
  await expect(areasNoMapa(page)).toHaveCount(0);
  await expect(page.locator('#c-areas')).not.toBeChecked();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.getByRole('button', { name: 'Carregar a versão vigente' }).click();
  await expect(page.locator('#total-principal')).toHaveText('60');
  await aplicar(page, 'terra_indigena');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
});

/** Controles visíveis menores que 44×44, elementos fora da janela e rolagem horizontal global. */
const auditar = () => {
  const visivel = (e) => { const r = e.getBoundingClientRect(); return r.width >= 2 && r.height >= 2 && !e.closest('[hidden]'); };
  const raizes = [document.getElementById('cartao-lentes'), document.getElementById('filtros'), document.getElementById('mapa-areas'), document.querySelector('.ferramentas-mapa')];
  const alvos = raizes.flatMap((raiz) => [...raiz.querySelectorAll('button, select, summary, .opcao')])
    .filter((e) => visivel(e) && !e.matches(':disabled'))
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; })
    .map((e) => `${e.tagName} ${e.textContent.trim().slice(0, 30)}`);
  const fora = raizes.flatMap((raiz) => [...raiz.querySelectorAll('*')])
    .filter((e) => visivel(e) && !e.closest('.rolavel'))
    .filter((e) => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 1 || r.left < -1; })
    .map((e) => `${e.tagName}#${e.id}`);
  return { alvos, fora, largura: document.documentElement.scrollWidth, janela: window.innerWidth };
};

for (const largura of [360, 390]) {
  test.describe(`acessibilidade a ${largura} px com toque`, () => {
    test.use({ viewport: { width: largura, height: 800 }, hasTouch: true, isMobile: true });

    test('teclado, foco, alvos de 44 px e sem rolagem horizontal; 200% e reflow a 320 px', async ({ page }) => {
      await entrar(page, 'rp');
      await escolherLente(page, 'sobreposicao');
      // Teclado: o grupo de rádio recebe o foco e as setas trocam a classe.
      await page.locator('input[name="l-classe"][value="protecao_integral"]').focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('input[name="l-classe"][value="terra_indigena"]')).toBeChecked();
      // Cada troca de classe recalcula (T16).
      await expect(page.locator('#lente-classe')).toHaveText('Classe aplicada: terra indígena.');
      await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
      await itens(page).first().locator('.botao-nome').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#lente-painel-titulo')).toBeFocused();
      await expect(page.locator('#lente-contornos')).toHaveAttribute('data-contornos', 'exibido');
      // A camada abre pelo botão; a citação da área leva aos dados dela.
      await alternarCamada(page, 'c-areas', true);
      await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'visivel');
      await page.getByRole('button', { name: 'Ver dados e contorno de Terra Indígena Fictícia Alfa' }).focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#areas-selecao-titulo')).toBeFocused();
      // Toque: o rótulo inteiro marca a classe.
      await page.locator('.opcao', { hasText: 'Uso sustentável' }).tap();
      await expect(page.locator('input[name="l-classe"][value="uso_sustentavel"]')).toBeChecked();
      await expect(page.locator('#lente-classe')).toHaveText('Classe aplicada: uso sustentável.');

      const a = await page.evaluate(auditar);
      expect(a.alvos, 'controles menores que 44×44 CSS px').toEqual([]);
      expect(a.fora, 'elementos fora da largura da janela').toEqual([]);
      expect(a.largura).toBeLessThanOrEqual(a.janela);

      for (const [w, escala] of [[320, '100%'], [320, '200%'], [largura, '200%']]) {
        await page.setViewportSize({ width: w, height: 700 });
        await page.evaluate((e) => { document.documentElement.style.fontSize = e; }, escala);
        const b = await page.evaluate(auditar);
        expect(b.fora, `${w}px, ${escala}: fora da janela`).toEqual([]);
        expect(b.largura, `${w}px, ${escala}: rolagem horizontal global`).toBeLessThanOrEqual(b.janela);
      }
      await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    });
  });
}

test('carga sem camada (totais nulos): estado próprio na lente e na camada, sem ler áreas nem vínculos', async ({ page }) => {
  sqlAdmin(SQL_LIMPEZA);
  sqlAdmin(sqlFixture());
  try {
    const req = observarAreas(page);
    await entrar(page, 'rp');
    await expect(page.locator('#total-principal')).toHaveText('100');
    await expect(page.locator('#proveniencia-areas')).toHaveCount(0);
    await aplicar(page, 'terra_indigena');
    await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'sem_camada');
    await expect(page.locator('#lente-estado')).toContainText('esta versão dos dados não tem a camada de áreas protegidas');
    await expect(page.locator('#lente-sem-camada')).toHaveText(SEM_CAMADA);
    await expect(itens(page)).toHaveCount(0);
    await alternarCamada(page, 'c-areas');
    await expect(page.locator('#mapa-areas')).toHaveAttribute('data-estado-areas', 'sem_camada');
    await expect(page.locator('#areas-estado')).toHaveText('Camada indisponível: esta versão dos dados não tem a camada de áreas protegidas.');
    await expect(page.locator('#c-areas')).not.toBeChecked();
    expect([...req.geral, ...req.lente, ...req.real, ...req.vinculos]).toEqual([]);
  } finally {
    sqlAdmin(SQL_LIMPEZA);
    sqlAdmin(sqlFixtureAreas());
  }
});
