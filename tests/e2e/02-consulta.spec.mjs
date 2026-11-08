// Consulta do RP: GMT, sensibilidade Cuiabá (100/102), município, zero, paginação, disponibilidade D1,
// texto sem marcação, respostas fora de ordem, geometria sob demanda, seleção, proveniência.
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { consultar, entrar, numero, observarRest } from './ajuda.mjs';
import { MUNICIPIOS, XSS_AVISO, XSS_ID } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });
test.beforeAll(() => cadastrarRp());

const AVISO_SIMPLIFICACAO = 'Limites simplificados para visualização; contagens usam a malha integral. Pontos próximos à divisa podem aparentar outro pertencimento.';

test('100 GMT e 102 em America/Cuiaba (+2): o envelope fica fora do principal', async ({ page }) => {
  await entrar(page, 'rp');
  expect(await numero(page, 'total-principal')).toBe('100');
  expect(await numero(page, 'sens-total')).toBe('102');
  expect(await numero(page, 'sens-diferenca')).toBe('+2');
  const principal = await numero(page, 'principal-intervalo');
  expect(principal).toContain('2026-10-01 00:00 GMT');
  expect(principal).toContain('2026-11-01 00:00 GMT');
  const sens = await numero(page, 'sens-intervalo');
  expect(sens).toContain('America/Cuiaba');
  expect(sens).toContain('2026-10-01 04:00 GMT');
  expect(sens).toContain('2026-11-01 04:00 GMT');
  await expect(page.getByText('Total principal — GMT')).toBeVisible();
  await expect(page.getByText('Sensibilidade — America/Cuiaba')).toBeVisible();
  await expect(page.getByLabel('Início (dia GMT)')).toHaveValue('2026-10-01');
  await expect(page.getByLabel('Fim (dia GMT, inclusivo)')).toHaveValue('2026-10-31');
  await expect(page.getByRole('heading', { name: 'Série diária (dias GMT)' })).toBeVisible();
  await expect(page.locator('#versao-consultada')).toContainText('Última atualização (publicação)');

  // Nenhum registro do envelope aparece na tabela (todas as páginas em uma só, 1.000 por página).
  await page.locator('#f-tamanho').selectOption('1000');
  await expect(page.locator('#registros-info')).toContainText('de 100 registros');
  const datas = await page.locator('#registros-tabela tbody tr td:nth-child(2)').allInnerTexts();
  expect(datas).toHaveLength(100);
  expect(datas.filter((d) => d.startsWith('2026-11'))).toEqual([]);
  expect(datas.every((d) => d.endsWith('GMT'))).toBe(true);
  // A série soma o total principal.
  await page.getByText('Ver a série como tabela').click();
  const dias = (await page.locator('#serie-corpo tbody tr td:nth-child(2)').allInnerTexts()).map((t) => Number(t.replace(/\D/g, '')));
  expect(dias).toHaveLength(31);
  expect(dias.reduce((a, b) => a + b, 0)).toBe(100);
});

test('por município: total, sensibilidade e diferença independentes', async ({ page }) => {
  await entrar(page, 'rp');
  const esperado = [[MUNICIPIOS.alfa, '60', '57', '−3'], [MUNICIPIOS.beta, '30', '35', '+5'], [MUNICIPIOS.gama, '10', '10', '0']];
  for (const [m, total, sens, dif] of esperado) {
    await consultar(page, { municipio: m.codigo });
    await expect(page.locator('#resumo-escopo')).toContainText(m.nome);
    await expect(page.locator('#total-principal')).toHaveText(total);
    expect(await numero(page, 'sens-total')).toBe(sens);
    expect(await numero(page, 'sens-diferenca')).toBe(dif);
  }
  // Todo o estado volta a somar 100 nos municípios, em ordem alfabética, sem ranking.
  await consultar(page, { municipio: null });
  await expect(page.locator('#total-principal')).toHaveText('100');
  await page.getByText(/Ver os 3 municípios/).click();
  const nomes = await page.locator('#lista-municipios .botao-nome').allInnerTexts();
  expect(nomes.map((n) => n.replace('✓ ', ''))).toEqual(['Município Alfa', 'Município Beta', 'Município Gama']);
  await expect(page.locator('#lista-municipios li').first().locator('.etiqueta')).toHaveText('Detecções no período (GMT): 60');
});

test('zero detecções é um estado próprio, sem afirmar ausência de fogo', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: MUNICIPIOS.gama.codigo, inicio: '2026-10-20', fim: '2026-10-31' });
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'zero');
  await expect(page.locator('#estado-consulta')).toContainText('não comprova ausência de fogo');
  await expect(page.locator('#total-principal')).toHaveText('0');
  await expect(page.locator('#registros-info')).toContainText('0–0 de 0 registros');
});

test('paginação não muda os totais e a visualização parcial é declarada', async ({ page }) => {
  await entrar(page, 'rp');
  await page.locator('#f-tamanho').selectOption('50');
  await expect(page.locator('#registros-info')).toContainText('Mostrando 1–50 de 100 registros');
  await expect(page.locator('#mapa-contagem')).toContainText('Pontos no mapa: 50 de 100');
  await expect(page.locator('#mapa-contagem')).toContainText('visualização parcial');
  await expect(page.locator('#pagina-anterior')).toBeDisabled();
  await expect(page.locator('#registros-tabela tbody tr')).toHaveCount(50);
  await page.locator('#pagina-proxima').click();
  await expect(page.locator('#registros-info')).toContainText('Mostrando 51–100 de 100 registros');
  await expect(page.locator('#mapa-contagem')).toContainText('Pontos no mapa: 50 de 100');
  await expect(page.locator('#pagina-proxima')).toBeDisabled();
  expect(await numero(page, 'total-principal')).toBe('100');
  expect(await numero(page, 'sens-total')).toBe('102');
  await page.locator('#f-tamanho').selectOption('500');
  await expect(page.locator('#mapa-contagem')).toContainText('Pontos no mapa: 100 de 100');
  await expect(page.locator('#mapa-contagem')).not.toContainText('visualização parcial');
  await expect(page.locator('#mapa canvas')).toBeVisible();
});

test('disponibilidade D1: três classes com motivo, histórico e "cobertura não comprovada"', async ({ page }) => {
  await entrar(page, 'rp');
  const disp = page.locator('#disp-corpo');
  await expect(disp).toContainText('Cobertura não comprovada');
  await expect(disp).toContainText('município-dia GMT');
  const classe = (c) => disp.locator(`#disp-classes [data-classe="${c}"] .classe__valor`);
  await expect(classe('lacuna_conhecida')).toHaveText('2');
  await expect(classe('incidencia_indeterminada')).toHaveText('3');
  await expect(classe('sem_evidencia_de_lacuna')).toHaveText('88');
  const alcance = (a) => disp.locator(`#disp-alcance [data-alcance="${a}"] .classe__valor`);
  await expect(alcance('verificado')).toHaveText('91');
  await expect(alcance('parcial')).toHaveText('1');
  await expect(alcance('indisponivel')).toHaveText('1');
  await expect(disp).toContainText('Visão estadual');

  // X (Alfa): lacuna conhecida; depois, sem evidência de lacuna em histórico verificado.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  const linhasAlfa = disp.locator('tbody tr');
  await expect(linhasAlfa).toHaveCount(31);
  await expect(linhasAlfa.nth(0)).toContainText('Lacuna conhecida');
  await expect(linhasAlfa.nth(0)).toContainText('aviso cobre municipio');
  await expect(linhasAlfa.nth(2)).toContainText('Sem evidência de lacuna');
  await expect(linhasAlfa.nth(2)).toContainText('Histórico verificado');
  await expect(linhasAlfa.nth(2)).toContainText('sem aviso incidente');

  // Y (Beta): incidência indeterminada, e o dia 3 com histórico ausente é outro caso.
  await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
  const linhasBeta = disp.locator('tbody tr');
  await expect(linhasBeta.nth(0)).toContainText('Incidência indeterminada');
  await expect(linhasBeta.nth(0)).toContainText('aviso parcial no municipio');
  await expect(linhasBeta.nth(2)).toContainText('Incidência indeterminada');
  await expect(linhasBeta.nth(2)).toContainText('Histórico indisponível');
  await expect(linhasBeta.nth(2)).toContainText('historico ausente ou incompleto');
  await expect(linhasBeta.nth(3)).toContainText('Sem evidência de lacuna');

  // Z (Gama): sem evidência, com o último dia de histórico parcial.
  await consultar(page, { municipio: MUNICIPIOS.gama.codigo });
  await expect(disp.locator('tbody tr').nth(30)).toContainText('Histórico parcial');
});

test('valores da fonte são texto: nenhuma marcação é executada', async ({ page }) => {
  await entrar(page, 'rp');
  await page.locator('#f-tamanho').selectOption('1000');
  await expect(page.locator('#registros-tabela')).toContainText(XSS_ID);
  expect(await page.locator('#registros-tabela img').count()).toBe(0);
  await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
  await expect(page.locator('#disp-corpo')).toContainText(XSS_AVISO);
  expect(await page.locator('#disp-corpo script').count()).toBe(0);
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  // Registros sem id na fonte são declarados, não inventados.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await page.locator('#f-tamanho').selectOption('1000');
  await expect(page.locator('#registros-tabela')).toContainText('sem id na fonte');
});

test('divergência do INPE é exibida como texto distinto', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await page.locator('#f-tamanho').selectOption('1000');
  const tabela = page.locator('#registros-tabela');
  await expect(tabela).toContainText('INPE atribui outro município');
  await expect(tabela).toContainText('INPE atribui outra UF');
  await expect(tabela).toContainText('Na borda');
});

test('respostas fora de ordem: a última consulta vence', async ({ page }) => {
  await entrar(page, 'rp');
  let chamadas = 0;
  await page.route('**/rest/v1/rpc/consultar_resumo', async (rota) => {
    chamadas += 1;
    if (chamadas === 1) await new Promise((r) => setTimeout(r, 2000));
    await rota.continue();
  });
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
  await expect(page.locator('#total-principal')).toHaveText('30');
  await page.waitForTimeout(2500);
  await expect(page.locator('#total-principal')).toHaveText('30');
  await expect(page.locator('#resumo-escopo')).toContainText('Município Beta');
  await expect(page.locator('#disp-corpo')).toContainText('Município Beta');
});

test('geometria só sob demanda: um município por vez e o conjunto por pedido', async ({ page }) => {
  const rest = observarRest(page);
  await entrar(page, 'rp');
  const geometria = () => rest.filter((r) => r.includes('geometria_exibicao'));
  expect(geometria(), 'a abertura não baixa geometria').toEqual([]);
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 0');

  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 1');
  expect(geometria()).toHaveLength(1);
  expect(geometria()[0]).toContain(`codigo=eq.${MUNICIPIOS.alfa.codigo}`);

  // O mesmo município não é baixado de novo.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo, inicio: '2026-10-05' });
  await expect(page.locator('#total-principal')).not.toHaveText('');
  expect(geometria()).toHaveLength(1);

  const botao = page.getByRole('button', { name: 'Mostrar limites municipais' });
  await botao.click();
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 3');
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  expect(geometria()).toHaveLength(2);
  expect(geometria()[1]).not.toContain('codigo=eq.');

  await expect(page.locator('#mapa-aviso')).toHaveText(AVISO_SIMPLIFICACAO);
});

test('seleção no mapa e na tabela, com indicador textual', async ({ page }) => {
  await entrar(page, 'rp');
  await page.locator('#registros-tabela button[data-id]').first().click();
  await expect(page.locator('#mapa-selecao')).toContainText('Selecionada:');
  await expect(page.locator('#registros-tabela button[data-id]').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#registros-tabela button[data-id]').first()).toHaveText('Selecionada');
  await expect(page.locator('#registros-tabela tr.selecionada')).toHaveCount(1);
});

test('proveniência: versão, fontes, método e limitações', async ({ page }) => {
  await entrar(page, 'rp');
  const prov = page.locator('#proveniencia-corpo');
  await expect(prov.locator('#versao-dados')).toContainText('AQUA_M-T');
  await expect(prov.locator('#versao-dados')).toContainText('e'.repeat(63));
  await expect(prov.locator('#versao-dados')).toContainText('2026-10-01 00:00 GMT');
  await expect(prov.locator('#versao-dados')).toContainText('Envelope da sensibilidade');
  await expect(prov.locator('#versao-dados')).toContainText('regra_historico: H1 fictícia');
  await prov.getByText(/Fontes \(3\)/).click();
  await expect(prov.locator('tbody tr')).toHaveCount(3);
  await expect(prov).toContainText('https://exemplo.test/focos');
  await expect(prov.locator('#malhas')).toContainText('exibição: intermediaria');
  await expect(prov).toContainText('não comprova incêndio, dano, autoria ou infração');
  await expect(page.locator('#t-aviso')).toBeVisible();
});

test('filtro inválido: erro associado ao campo e nenhuma consulta', async ({ page }) => {
  await entrar(page, 'rp');
  const rest = observarRest(page);
  await consultar(page, { inicio: '2026-10-20', fim: '2026-10-10' });
  await expect(page.locator('#f-erro')).toBeVisible();
  await expect(page.locator('#f-erro')).toHaveAttribute('role', 'alert');
  await expect(page.locator('#f-inicio')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#f-inicio')).toBeFocused();
  expect(rest.filter((r) => r.includes('/rpc/'))).toEqual([]);
  await consultar(page, { inicio: '2026-09-01', fim: '2026-10-10' });
  await expect(page.locator('#f-erro')).toContainText('dentro da janela');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-31' });
  await expect(page.locator('#f-erro')).toBeHidden();
  await expect(page.locator('#total-principal')).toHaveText('100');
});
