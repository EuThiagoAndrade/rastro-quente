// Ciclo 005, issue #43 — interface mínima da combinação de lentes: escolha das lentes e do operador, validação,
// lista paginada, retângulos no mapa, painel por critério (cada sequência da persistência em item próprio, com as
// suas ressalvas), estados de T11, configuração alterada durante a aplicação (R1-7), concorrência, perda de acesso,
// troca de versão e acessibilidade. Valores esperados derivados à mão da carga fictícia da combinação
// (tests/e2e/fixture.mjs, sqlFixtureCombinacao), sem usar a interface nem o módulo.
import { test, expect } from '@playwright/test';
import { sqlAdmin } from '../../scripts/banco/local.mjs';
import { cadastrarRp } from './contas.mjs';
import { abrirDestaque, consultar, entrar, escolherLente } from './ajuda.mjs';
import { SQL_LIMPEZA, sqlFixture, sqlFixtureCombinacao } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });
test.beforeAll(() => {
  sqlAdmin(SQL_LIMPEZA);
  sqlAdmin(sqlFixtureCombinacao());
  cadastrarRp();
});
test.afterAll(() => {
  sqlAdmin(SQL_LIMPEZA);
  sqlAdmin(sqlFixture());
});

const TRES = ['concentracao', 'recorrencia', 'persistencia'];
const X = 'c-221_-1140';
const Y = 'c-221_-1138';
const Z = 'c-223_-1140';
const ROTULO_X = 'Célula c-221_-1140 (-11.05 a -11.00 · -57.00 a -56.95) — lentes: concentração, recorrência, persistência';
const ROTULO_Y = 'Célula c-221_-1138 (-11.05 a -11.00 · -56.90 a -56.85) — lentes: concentração, persistência';
const ROTULO_Z = 'Célula c-223_-1140 (-11.15 a -11.10 · -57.00 a -56.95) — lentes: concentração, recorrência';
const COBERTURA_151 = '151 de 153 dias sem evidência de lacuna (cobertura não comprovada)';
const SEM_E = 'Nenhuma célula destacada por todas as lentes escolhidas nesta janela. Isso não indica ausência de focos nem de risco.';
const SEM_OU = 'Nenhuma célula destacada por qualquer das lentes escolhidas nesta janela. Isso não indica ausência de focos nem de risco.';

const cartao = (page) => page.locator('#cartao-lentes');
const itens = (page) => page.locator('#lente-destaques > li');
const rotulos = (page) => itens(page).locator('.botao-nome').allInnerTexts();
const corpoRpc = (route) => JSON.parse(route.request().postData() ?? '{}');

async function escolher(page, lentes, operador = 'e') {
  await escolherLente(page, 'combinacao');
  for (const l of TRES) await page.locator(`input[name="l-comb"][value="${l}"]`).setChecked(lentes.includes(l));
  await page.locator(`input[name="l-operador"][value="${operador}"]`).check();
}

/** A combinação calcula a cada mudança da configuração (T16); vale a última. */
async function combinar(page, lentes, operador = 'e') {
  await escolher(page, lentes, operador);
}

async function janela(page, inicio, fim) {
  await consultar(page, { inicio, fim });
}

/** Segura a primeira chamada que casar com `filtro` até `soltar()`; com `resposta`, libera com ela. */
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

/** Nenhum texto sugere ranking: só "não é ranking", e nenhum "N lentes" como número (T13, R2-1). */
async function semRanking(page) {
  const texto = await cartao(page).innerText();
  expect(texto).toContain('não é ranking');
  expect(texto).not.toMatch(/(?<!não é )\branking\b/i);
  expect(texto).not.toMatch(/\b\d+\s+lentes?\b/i);
  expect(texto).not.toMatch(/\bcoberto\b/i);
}

test('"as três, e": cabeçalho da configuração aplicada, uma célula no mapa e painel por critério com a união', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(page.locator('#total-principal')).toHaveText('161');
  // O grupo de escolha só aparece com a opção "Combinação de lentes"; abre com Concentração, Recorrência e "e" (V13).
  await expect(page.locator('#lente-combinacao')).toBeHidden();
  await expect(page.locator('input[name="l-comb"][value="concentracao"]')).toBeChecked();
  await expect(page.locator('input[name="l-comb"][value="recorrencia"]')).toBeChecked();
  await expect(page.locator('input[name="l-comb"][value="persistencia"]')).not.toBeChecked();
  await expect(page.locator('input[name="l-operador"][value="e"]')).toBeChecked();
  await combinar(page, TRES, 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-estado')).toContainText(/Combinação concluída em \d+,\d s\./);
  expect(await rotulos(page)).toEqual([ROTULO_X]);
  await expect(itens(page).locator('.etiqueta')).toHaveText([COBERTURA_151]);
  await expect(page.locator('#lente-configuracao')).toHaveText(
    'Combinação aplicada: concentração e recorrência e persistência (operador e: células destacadas por todas as lentes escolhidas).');
  await expect(page.locator('#lente-escopo')).toContainText('2026-06-01 a 2026-10-31');
  await expect(page.locator('#lente-escopo')).toContainText('combinação combinacao-005-v1 sobre o método lentes-004-v1');
  await expect(page.locator('#lente-escopo')).toContainText('o filtro de município não se aplica às lentes');
  await expect(page.locator('#lente-ordenacao')).toHaveText('Ordem fixa pela posição da célula (norte→sul, oeste→leste); não é ranking.');
  for (const p of ['com todos os empatados no 10º lugar', 'pelo menos 3 meses GMT distintos', 'pelo menos 3 dias GMT consecutivos',
    'a célula entra pela concentração se tiver pelo menos 1 detecção de município destacado']) {
    await expect(page.locator('#lente-parametros')).toContainText(p);
  }
  await expect(page.locator('#lente-mapa-info')).toContainText('Mapa: 1 célula desenhada como retângulos de 0,05°');
  const limitacoes = page.locator('#lente-limitacoes');
  await expect(limitacoes).toContainText('não comprovam incêndio, dano, autoria ou infração');
  await expect(limitacoes).toContainText('Combinar critérios com "e" torna a seleção mais específica, não mais verdadeira');
  await expect(limitacoes).toContainText('A lista não é ranking: células destacadas por mais lentes não são mais graves nem prioritárias.');
  await expect(limitacoes).toContainText('A concentração entra na célula por projeção');
  await expect(limitacoes).toContainText('Nenhuma célula em comum não indica ausência de focos nem de risco.');
  await expect(limitacoes).toContainText('Contagem absoluta favorece municípios grandes.');
  await semRanking(page);

  // Explicação: um bloco por critério, na ordem canônica, com o destaque original, motivo, evidência e ressalvas.
  await expect(page.locator('#aba-destaques')).toHaveText('Destaques · 1');
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-operador')).toContainText('Operador "e": a célula entrou porque todas as lentes escolhidas');
  await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', `combinacao:e:concentracao+recorrencia+persistencia:celula_005:${X}`);
  await expect(page.locator('#lente-painel-titulo')).toBeFocused();
  expect(await page.locator('#lente-painel .criterio').evaluateAll((l) => l.map((x) => x.dataset.lente))).toEqual(TRES);
  const conc = page.locator('#lente-painel .criterio[data-lente="concentracao"]');
  await expect(conc.locator('.ressalvas-criterio')).toHaveText('a célula também tem 1 de 6 detecções de município não destacado pela concentração');
  await expect(conc.locator('.destaque-original')).toHaveAttribute('data-destaque', 'concentracao:municipio:9900001');
  await expect(conc.locator('.destaque-original__motivo')).toHaveText(
    'Motivo: 5 detecções nesta célula de Município Alfa, município destacado pela concentração (70 detecções na janela; corte em 10, com empatados)');
  await expect(conc.locator('.destaque-original__evidencia')).toHaveText('Evidência: 5 detecções nesta célula.');
  const rec = page.locator('#lente-painel .criterio[data-lente="recorrencia"]');
  await expect(rec.locator('.destaque-original__motivo')).toContainText('Detecções em 3 meses GMT distintos na janela: ago/2026, set/2026 e out/2026.');
  await expect(rec.locator('.destaque-original__evidencia')).toHaveText('Evidência: 6 detecções nesta célula; meses: ago/2026, set/2026, out/2026.');
  const per = page.locator('#lente-painel .criterio[data-lente="persistencia"]');
  await expect(per.locator('.destaque-original')).toHaveAttribute('data-destaque', `persistencia:celula_005:${X}:2026-10-05`);
  await expect(per.locator('.destaque-original__evidencia')).toHaveText('Evidência: 3 detecções nesta célula; dias GMT: 05/10/2026, 06/10/2026, 07/10/2026.');
  await expect(per.locator('.ressalvas-destaque')).toHaveCount(0);

  // Cobertura da célula pelos municípios de todas as detecções, inclusive o não destacado (V1).
  await expect(page.locator('#lente-cobertura')).toContainText(COBERTURA_151);
  await expect(page.locator('#lente-municipios')).toContainText('Município Alfa (9900001); Município Mi (9900012)');
  await page.getByText('Dias que contam contra (2)').click();
  expect(await page.locator('#lente-dias > li').evaluateAll((l) => l.map((x) => x.dataset.classe))).toEqual(['lacuna_conhecida', 'incidencia_indeterminada']);

  // Evidência em união, com a coluna "Lentes".
  await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–6 de 6 detecções da evidência em união.');
  const linhas = await page.locator('#lente-evidencia-tabela tbody tr').evaluateAll((l) => l.map((tr) => [...tr.cells].map((c) => c.textContent)));
  expect(linhas.map((c) => [c[5], c[4]])).toEqual([
    ['cx1', 'concentração, recorrência'],
    ['cx1005', 'concentração, recorrência, persistência'],
    ['cx1006', 'concentração, recorrência, persistência'],
    ['cx1007', 'concentração, recorrência, persistência'],
    ['cx2', 'concentração, recorrência'],
    ['cx6', 'recorrência'],
  ]);
});

test('"as três, ou": 147 células em 3 páginas, sequências da persistência em itens próprios com as suas ressalvas', async ({ page }) => {
  await entrar(page, 'rp');
  await combinar(page, TRES, 'ou');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 1 a 50 de 147.');
  await expect(itens(page)).toHaveCount(50);
  expect((await rotulos(page)).slice(0, 4)).toEqual([ROTULO_X, ROTULO_Y, ROTULO_Z,
    'Célula c-231_-1140 (-11.55 a -11.50 · -57.00 a -56.95) — lentes: concentração']);
  await expect(page.locator('#lente-mapa-info')).toContainText('Mapa: 147 células desenhadas');
  await expect(page.locator('#lente-configuracao')).toContainText('concentração ou recorrência ou persistência (operador ou: células destacadas por pelo menos uma das lentes escolhidas)');
  await expect(page.locator('#lente-limitacoes')).toContainText('Combinar critérios com "ou" amplia a seleção, sem torná-la mais verdadeira');
  await expect(page.locator('#lente-limitacoes')).not.toContainText('Nenhuma célula em comum');
  await semRanking(page);

  await page.getByRole('button', { name: 'Próximas células' }).click();
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 51 a 100 de 147.');
  await expect(page.locator('#lente-celulas-info')).toBeFocused();
  await page.getByRole('button', { name: 'Próximas células' }).click();
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 101 a 147 de 147.');
  await expect(itens(page)).toHaveCount(47);
  await expect(page.getByRole('button', { name: 'Próximas células' })).toBeDisabled();
  await page.getByRole('button', { name: 'Células anteriores' }).click();
  await page.getByRole('button', { name: 'Células anteriores' }).click();
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 1 a 50 de 147.');

  // Célula Y: concentração e duas sequências, cada uma com a sua ressalva (R1-1).
  await abrirDestaque(page, 1);
  await expect(page.locator('#lente-operador')).toContainText('Operador "ou": basta uma das lentes escolhidas');
  await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', `combinacao:ou:concentracao+recorrencia+persistencia:celula_005:${Y}`);
  expect(await page.locator('#lente-painel .criterio').evaluateAll((l) => l.map((x) => x.dataset.lente))).toEqual(['concentracao', 'persistencia']);
  await expect(page.locator('#lente-painel .ressalvas-criterio')).toHaveCount(0);
  const seq = (inicio) => page.locator(`#lente-painel .destaque-original[data-destaque="persistencia:celula_005:${Y}:${inicio}"]`);
  await expect(page.locator('#lente-painel .criterio[data-lente="persistencia"] .destaque-original')).toHaveCount(2);
  const textos = (s) => s.locator('.ressalvas-destaque > li').evaluateAll((l) => l.map((x) => x.firstChild.textContent));
  expect(await textos(seq('2026-09-05'))).toEqual(['adjacente a dia indeterminado (08/09); pode ser mais longa']);
  expect(await textos(seq('2026-09-20'))).toEqual(['adjacente a dia com lacuna conhecida (19/09); pode ser mais longa']);
  await expect(seq('2026-09-05').locator('.ressalvas-destaque > li')).toHaveAttribute('data-classe', 'incidencia_indeterminada');
  await expect(seq('2026-09-05').locator('.ressalvas-destaque')).toContainText('Município Beta (9900002): Incidência indeterminada (aviso parcial no municipio)');
  await expect(seq('2026-09-20').locator('.ressalvas-destaque > li')).toHaveAttribute('data-classe', 'lacuna_conhecida');
  await expect(page.locator('#lente-evidencia-info')).toHaveText('Mostrando 1–6 de 6 detecções da evidência em união.');
});

test('T16: a configuração vale ao mudar e recalcula; resposta antiga não aparece; menos de 2 lentes não calcula nada', async ({ page }) => {
  await entrar(page, 'rp');
  // Uma lente marcada: nada é calculado e a aba diz o que falta.
  await escolher(page, ['concentracao'], 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'incompleta');
  await expect(page.locator('#lente-estado')).toHaveText('Escolha pelo menos 2 lentes para combinar.');
  await expect(itens(page)).toHaveCount(0);

  const r = await reter(page, 'consultar_resumo');
  await page.locator('input[name="l-comb"][value="recorrencia"]').check();
  await r.chegada;
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'carregando');
  // Antes de a resposta chegar: troca o operador e marca a persistência; cada mudança recalcula (T16).
  await page.locator('input[name="l-operador"][value="ou"]').check();
  await page.locator('input[name="l-comb"][value="persistencia"]').check();
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-configuracao')).toContainText('concentração ou recorrência ou persistência (operador ou:');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(page.locator('#lente-configuracao')).toContainText('concentração ou recorrência ou persistência (operador ou:');
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 1 a 50 de 147.');
  await abrirDestaque(page, 0);
  await expect(page.locator('#lente-painel')).toHaveAttribute('data-destaque', `combinacao:ou:concentracao+recorrencia+persistencia:celula_005:${X}`);

  // Ficando 1 lente marcada, nenhum resultado antigo fica visível como se fosse atual.
  await escolher(page, ['recorrencia'], 'ou');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'incompleta');
  await expect(itens(page)).toHaveCount(0);
  await expect(page.locator('#lente-painel')).toHaveCount(0);
  await expect(page.locator('#aba-destaques')).toHaveText('Destaques');
  await escolher(page, ['recorrencia', 'concentracao'], 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(await rotulos(page)).toEqual([
    'Célula c-221_-1140 (-11.05 a -11.00 · -57.00 a -56.95) — lentes: concentração, recorrência',
    ROTULO_Z,
  ]);
  await expect(page.locator('#lente-mapa-info')).toContainText('Mapa: 2 células desenhadas');
});

test('T11: sem célula em comum ("e"), sem células destacadas ("ou") e indisponível, cada um com o seu texto', async ({ page }) => {
  await entrar(page, 'rp');
  await janela(page, '2026-08-01', '2026-08-31');
  await combinar(page, ['concentracao', 'persistencia'], 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'sem_celulas_em_comum');
  await expect(page.locator('#lente-estado')).toContainText(SEM_E);
  await expect(page.locator('#lente-sem-celulas')).toHaveText(SEM_E);
  await expect(itens(page)).toHaveCount(0);
  await expect(page.locator('#lente-limitacoes')).toContainText('não comprovam incêndio, dano, autoria ou infração');

  await janela(page, '2026-06-01', '2026-08-31');
  await combinar(page, ['recorrencia', 'persistencia'], 'ou');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'sem_celulas_destacadas');
  await expect(page.locator('#lente-estado')).toContainText(SEM_OU);
  await expect(page.locator('#lente-sem-celulas')).toHaveText(SEM_OU);
  await expect(itens(page)).toHaveCount(0);
  await expect(page.locator('#lente-limitacoes')).toContainText('não comprovam incêndio, dano, autoria ou infração');

  await janela(page, '2026-10-01', '2026-10-31');
  await combinar(page, ['recorrencia', 'persistencia'], 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'indisponivel');
  const texto = 'recorrência não se aplica a esta janela: a janela toca 1 mês GMT; a recorrência exige pelo menos 3';
  await expect(page.locator('#lente-estado')).toContainText(texto);
  await expect(page.locator('#lente-indisponibilidade')).toHaveText(`${texto}.`);
  await expect(itens(page)).toHaveCount(0);
  await expect(page.locator('#lente-limitacoes')).toContainText('não comprovam incêndio, dano, autoria ou infração');
});

test('cobertura não verificada: falha na disponibilidade de um município, seleção mantida; tentar de novo qualifica', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_disponibilidade', async (route) => {
    if (corpoRpc(route).p_municipio !== 9900002) return route.continue();
    await route.fulfill({ status: 503, json: { message: 'indisponivel' } });
  });
  await combinar(page, TRES, 'ou');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'cobertura_nao_verificada');
  await expect(page.locator('#lente-estado')).toContainText('a cobertura de algumas células não foi verificada');
  await expect(page.locator('#lente-celulas-info')).toHaveText('Células 1 a 50 de 147.');
  await expect(itens(page).nth(0).locator('.etiqueta')).toHaveText(COBERTURA_151);
  await expect(itens(page).nth(1).locator('.etiqueta')).toHaveText('cobertura não verificada: fonte indisponível');
  await abrirDestaque(page, 1);
  const ressalvas = await page.locator('#lente-painel .ressalvas-destaque > li').allInnerTexts();
  expect(ressalvas).toEqual(['ressalvas de disponibilidade ainda não verificadas', 'ressalvas de disponibilidade ainda não verificadas']);
  await expect(page.locator('#lente-cobertura')).not.toContainText(/\d+ de \d+/);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#lente-configuracao')).toContainText('(operador ou:');
});

test('leitura inconsistente e falha da fonte: estados próprios, sem célula parcial', async ({ page }) => {
  // A leitura da consulta também é recusada; sem memória preenchida, a combinação lê as páginas e recusa igual.
  await page.route('**/rest/v1/rpc/consultar_deteccoes', async (route) => {
    if (corpoRpc(route).p_limite !== 1000) return route.continue();
    const resp = await route.fetch();
    const json = await resp.json();
    json.registros[json.registros.length - 1] = json.registros[0];
    await route.fulfill({ response: resp, json });
  });
  await entrar(page, 'rp', { esperar: false });
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'erro');
  await combinar(page, TRES, 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'leitura_inconsistente');
  await expect(page.locator('#lente-estado')).toContainText('id_tecnico repetido');
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });

  await page.route('**/rest/v1/rpc/consultar_deteccoes', async (route) => {
    if (corpoRpc(route).p_limite !== 1000) return route.continue();
    await route.fulfill({ status: 503, json: { message: 'indisponivel' } });
  });
  await combinar(page, TRES, 'ou');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'falha');
  await expect(page.locator('#lente-estado')).toContainText('Fonte de dados indisponível');
  await expect(itens(page)).toHaveCount(0);
});

test('nova janela durante a leitura: a combinação é recalculada na janela nova; a resposta atrasada não aparece', async ({ page }) => {
  await entrar(page, 'rp');
  const r = await reter(page, 'consultar_resumo');
  await combinar(page, TRES, 'e');
  await r.chegada;
  await consultar(page, { inicio: '2026-08-01', fim: '2026-09-30' });
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'indisponivel');
  await expect(page.locator('#lente-escopo')).toContainText('2026-08-01 a 2026-09-30');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'indisponivel');
  await expect(page.locator('#lente-escopo')).toContainText('2026-08-01 a 2026-09-30');
  await expect(itens(page)).toHaveCount(0);
});

test('concorrência: lente individual retida e combinação aplicada antes; só a combinação aparece', async ({ page }) => {
  await entrar(page, 'rp');
  const r = await reter(page, 'consultar_resumo');
  await escolherLente(page, 'concentracao');
  await r.chegada;
  await combinar(page, TRES, 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(await rotulos(page)).toEqual([ROTULO_X]);
  await expect(page.locator('#lente-configuracao')).toBeVisible();
});

test('concorrência: combinação retida e "Nenhuma"; nada aparece depois', async ({ page }) => {
  await entrar(page, 'rp');
  const r = await reter(page, 'consultar_resumo');
  await combinar(page, TRES, 'ou');
  await r.chegada;
  await escolherLente(page, 'nenhuma');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(page.locator('#lente-combinacao')).toBeHidden();
  r.soltar();
  await page.waitForTimeout(500);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(itens(page)).toHaveCount(0);
});

test('acesso negado na disponibilidade, depois de a lista aparecer, limpa tela, combinação e memória', async ({ page }) => {
  await entrar(page, 'rp');
  const negado = { status: 403, json: { code: '42501', message: 'acesso_negado' } };
  const r = await reter(page, 'consultar_disponibilidade', (b) => b.p_municipio !== null, negado);
  // A configuração inicial (Concentração e Recorrência, "e") calcula uma vez só, ao escolher a combinação.
  await combinar(page, ['concentracao', 'recorrencia'], 'e');
  await r.chegada;
  await expect(itens(page)).toHaveCount(2);
  r.soltar();
  await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'negado');
  await expect(page.locator('#conteudo')).toBeHidden();
  await expect(itens(page)).toHaveCount(0);
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
});

test('sessão expirada na disponibilidade limpa tudo; após novo login, nenhuma combinação antiga', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_disponibilidade', (route) => (corpoRpc(route).p_municipio === null
    ? route.continue()
    : route.fulfill({ status: 401, json: { code: 'PGRST301', message: 'JWT expired' } })));
  // A configuração inicial calcula ao escolher a combinação; a primeira disponibilidade já expira a sessão.
  await combinar(page, ['concentracao', 'recorrencia'], 'e');
  await expect(page.locator('#acesso')).toHaveAttribute('data-estado', 'anonimo');
  await expect(page.locator('#acesso-corpo')).toContainText('Sua sessão expirou');
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await entrar(page, 'rp');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'nenhuma');
  await expect(itens(page)).toHaveCount(0);
});

test('versão substituída (carga indisponível) na disponibilidade: estado próprio, limpa combinação e memória', async ({ page }) => {
  await entrar(page, 'rp');
  await page.route('**/rest/v1/rpc/consultar_disponibilidade', (route) => (corpoRpc(route).p_municipio === null
    ? route.continue()
    : route.fulfill({ status: 500, json: { code: 'P0002', message: 'carga_indisponivel' } })));
  await combinar(page, ['concentracao', 'recorrencia'], 'e');
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'versao_substituida');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'versao_substituida');
  await expect(page.locator('#lente-estado')).toContainText('Combinação cancelada: a versão de dados foi substituída');
  await expect(itens(page)).toHaveCount(0);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  const paginas = [];
  page.on('request', (q) => { if (q.url().includes('/rpc/consultar_deteccoes') && JSON.parse(q.postData() ?? '{}').p_limite === 1000) paginas.push(q); });
  await page.getByRole('button', { name: 'Carregar a versão vigente' }).click();
  await expect(page.locator('#total-principal')).toHaveText('161');
  await combinar(page, TRES, 'e');
  await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
  expect(paginas.length).toBeGreaterThan(0);
});

/** Controles visíveis do cartão menores que 44×44, elementos fora da janela e rolagem horizontal global. */
const auditarCartao = () => {
  const visivel = (e) => { const r = e.getBoundingClientRect(); return r.width >= 2 && r.height >= 2 && !e.closest('[hidden]'); };
  const raizes = [document.getElementById('cartao-lentes'), document.getElementById('filtros')];
  const alvos = raizes.flatMap((r) => [...r.querySelectorAll('button, select, summary, .opcao')])
    .filter((e) => visivel(e) && !e.matches(':disabled'))
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; })
    .map((e) => `${e.tagName} ${e.textContent.trim().slice(0, 30)}`);
  const fora = raizes.flatMap((r) => [...r.querySelectorAll('*')])
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
      await escolherLente(page, 'combinacao');
      // Teclado: Espaço desmarca e marca; cada mudança recalcula (T16).
      await page.locator('input[name="l-comb"][value="concentracao"]').focus();
      await page.keyboard.press('Space');
      await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'incompleta');
      await page.keyboard.press('Space');
      await expect(page.locator('input[name="l-comb"][value="concentracao"]')).toBeChecked();
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="l-comb"][value="recorrencia"]')).toBeFocused();
      await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');
      await itens(page).first().locator('.botao-nome').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#lente-painel-titulo')).toBeFocused();
      // Toque: o rótulo inteiro marca a caixa.
      await page.locator('#lente-combinacao .opcao', { hasText: 'Persistência' }).tap();
      await expect(page.locator('input[name="l-comb"][value="persistencia"]')).toBeChecked();
      await expect(cartao(page)).toHaveAttribute('data-estado-lente', 'completo');

      const a = await page.evaluate(auditarCartao);
      expect(a.alvos, 'controles menores que 44×44 CSS px').toEqual([]);
      expect(a.fora, 'elementos fora da largura da janela').toEqual([]);
      expect(a.largura).toBeLessThanOrEqual(a.janela);

      for (const [w, escala] of [[320, '100%'], [320, '200%'], [largura, '200%']]) {
        await page.setViewportSize({ width: w, height: 700 });
        await page.evaluate((e) => { document.documentElement.style.fontSize = e; }, escala);
        const b = await page.evaluate(auditarCartao);
        expect(b.fora, `${w}px, ${escala}: fora da janela`).toEqual([]);
        expect(b.largura, `${w}px, ${escala}: rolagem horizontal global`).toBeLessThanOrEqual(b.janela);
      }
      await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    });
  });
}
