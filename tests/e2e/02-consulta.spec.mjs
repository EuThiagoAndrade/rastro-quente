// Consulta do RP: GMT, município, zero, todos os pontos (T7) e "Lista de focos" (T21), texto sem marcação, respostas
// fora de ordem, geometria sob demanda, seleção, proveniência. Ciclo 009: sem os cartões "No mapa", "Detecções no
// período" e "Disponibilidade dos dados" abaixo do mapa; fica só a série (D2, D4, D5).
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirBalao, abrirListaFocos, abrirOpcoesMapa, alternarCamada, consultar, entrar, escolherLente, observarRest, selecionarFoco } from './ajuda.mjs';
import { MUNICIPIOS, XSS_ID } from './fixture.mjs';

test.describe.configure({ mode: 'serial' });
test.beforeAll(() => cadastrarRp());

test('100 GMT na série; o envelope da sensibilidade fica fora e não há cartões de resumo abaixo do mapa', async ({ page }) => {
  await entrar(page, 'rp');
  expect(await page.locator('#serie').getAttribute('data-total')).toBe('100');
  await expect(page.locator('#f-periodo')).toHaveValue('ano');
  await expect(page.locator('#periodo-resumo')).toHaveText('01/10/2026 a 31/10/2026 · 31 dias GMT');
  await expect(page.locator('#f-inicio')).toHaveValue('2026-10-01');
  await expect(page.locator('#f-fim')).toHaveValue('2026-10-31');
  // Ciclo 009 (D4): só a série fica abaixo do mapa, sem título visível nem total, sensibilidade ou versão.
  const cartaoSerie = page.getByRole('region', { name: 'Detecções no período (dias GMT)' });
  await expect(cartaoSerie.locator('#serie')).toBeVisible();
  await expect(cartaoSerie.locator('#serie')).toHaveAttribute('data-total', '100');
  await expect(page.getByRole('heading', { name: 'Detecções no período (dias GMT)' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No mapa' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Disponibilidade dos dados' })).toHaveCount(0);
  for (const id of ['total-principal', 'sens-total', 'versao-consultada', 'disp-corpo', 'mapa-aviso', 'mapa-erro', 'areas-estado']) {
    await expect(page.locator(`#${id}`)).toHaveCount(0);
  }

  // Nenhum registro do envelope aparece na "Lista de focos" (duas páginas locais de 50).
  await abrirListaFocos(page);
  await expect(page.locator('#lista-focos-info')).toContainText('de 100');
  const datas = await page.locator('#lista-focos-itens .botao-foco__hora').allInnerTexts();
  await page.locator('#focos-proxima').click();
  datas.push(...await page.locator('#lista-focos-itens .botao-foco__hora').allInnerTexts());
  expect(datas).toHaveLength(100);
  expect([...datas].sort()).toEqual(datas);
  expect(datas.filter((d) => d.startsWith('2026-11'))).toEqual([]);
  expect(datas.every((d) => d.endsWith('GMT'))).toBe(true);
  // A série soma o total principal.
  await page.getByText('Ver a série como tabela').click();
  const dias = (await page.locator('#serie-corpo tbody tr td:nth-child(2)').allInnerTexts()).map((t) => Number(t.replace(/\D/g, '')));
  expect(dias).toHaveLength(31);
  expect(dias.reduce((a, b) => a + b, 0)).toBe(100);
});

test('por município: total da série independente', async ({ page }) => {
  await entrar(page, 'rp');
  const esperado = [[MUNICIPIOS.alfa, '60'], [MUNICIPIOS.beta, '30'], [MUNICIPIOS.gama, '10']];
  for (const [m, total] of esperado) {
    await consultar(page, { municipio: m.codigo });
    await expect(page.locator('#filtros-escopo')).toContainText(m.nome);
    await expect(page.locator('#serie')).toHaveAttribute('data-total', total);
  }
  // Todo o estado volta a somar 100 nos municípios (aba Municípios, T11): por detecções e por nome.
  await consultar(page, { municipio: null });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  await expect(page.locator('#aba-municipios')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-ordem="deteccoes"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('#lista-municipios .nome').evaluateAll((l) => l.map((x) => x.firstChild.textContent)))
    .toEqual(['Município Alfa', 'Município Beta', 'Município Gama']);
  expect(await page.locator('#lista-municipios .num').allInnerTexts()).toEqual(['60', '30', '10']);
  await expect(page.locator('#mun-explica')).toContainText('não indica prioridade, gravidade nem risco');
  await page.locator('[data-ordem="nome"]').click();
  await expect(page.locator('[data-ordem="nome"]')).toBeFocused();
  // Tocar num município filtra a tela e mostra o cartão (T11).
  await page.locator('#lista-municipios button[data-codigo="9900003"]').click();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '10');
  await expect(page.locator('#cartao-focos')).toHaveText('10');
  await expect(page.locator('#cartao-celulas')).toHaveAttribute('data-estado', 'completo');
  await expect(page.locator('#cartao-destacadas')).toHaveText('—');
  await page.getByRole('button', { name: 'Ver todo Mato Grosso' }).click();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
});

test('zero detecções é um estado próprio, sem afirmar ausência de fogo', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: MUNICIPIOS.gama.codigo, inicio: '2026-10-20', fim: '2026-10-31' });
  await expect(page.locator('#estado-consulta')).toHaveAttribute('data-estado', 'zero');
  await expect(page.locator('#estado-consulta')).toContainText('não comprova ausência de fogo');
  // Ciclo 009 (C3): sem o cartão, o estado zero não aponta para a disponibilidade.
  await expect(page.locator('#estado-consulta')).not.toContainText('disponibilidade');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '0');
  await expect(page.locator('#mapa-contagem')).toContainText('todas as 0 detecções');
  await abrirListaFocos(page);
  await expect(page.locator('#lista-focos-info')).toHaveText('Nenhum foco neste recorte.');
});

test('T7: todos os pontos do recorte no mapa e a "Lista de focos" paginada, por teclado, sem nova consulta', async ({ page }) => {
  const rest = observarRest(page);
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
  await expect(page.locator('#mapa-contagem')).toContainText('Pontos no mapa: todas as 100 detecções do recorte.');
  await expect(page.locator('#mapa canvas').first()).toBeVisible();
  expect(rest.filter((r) => r.includes('consultar_deteccoes'))).toHaveLength(1);
  const antes = rest.length;
  await abrirOpcoesMapa(page);
  await page.locator('#botao-lista-focos').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#lista-focos')).toBeVisible();
  await expect(page.locator('#botao-lista-focos')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#t-lista-focos')).toBeFocused();
  await expect(page.locator('#lista-focos-info')).toHaveText('Focos 1 a 50 de 100, por dia e hora GMT. Selecione um para marcá-lo no mapa.');
  await expect(page.locator('#lista-focos-itens li')).toHaveCount(50);
  await expect(page.locator('#focos-anterior')).toBeDisabled();
  await page.locator('#focos-proxima').click();
  await expect(page.locator('#lista-focos-info')).toContainText('Focos 51 a 100 de 100');
  await expect(page.locator('#lista-focos-info')).toBeFocused();
  await expect(page.locator('#focos-proxima')).toBeDisabled();
  expect(rest.length, 'a lista usa a leitura completa, sem nova consulta').toBe(antes);
  expect(await page.locator('#serie').getAttribute('data-total')).toBe('100');
  await page.keyboard.press('Escape');
  await expect(page.locator('#lista-focos')).toBeHidden();
  await expect(page.locator('#botao-lista-focos')).toBeFocused();
});

test('valores da fonte são texto: nenhuma marcação é executada', async ({ page }) => {
  await entrar(page, 'rp');
  // O ID da fonte (fx008) aparece no balão do ponto, como texto.
  const balao = await abrirBalao(page, 'fx008');
  await expect(balao).toContainText(XSS_ID);
  expect(await balao.locator('img').count()).toBe(0);
  await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '30');
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  // Registros sem id na fonte são declarados, não inventados.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await expect(await abrirBalao(page, 'fx009')).toContainText('sem id na fonte');
});

test('divergência do INPE é exibida como texto distinto', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  // Antes na tabela, agora no balão de cada ponto: fx010 (outro município), fx011 (outra UF e na borda).
  await expect(await abrirBalao(page, 'fx010')).toContainText('INPE atribui outro município');
  const balao = await abrirBalao(page, 'fx011');
  await expect(balao.locator('li[data-id="fx011"]')).toContainText('INPE atribui outra UF');
  await expect(balao.locator('li[data-id="fx011"]')).toContainText('na borda do município');
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
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '30');
  await page.waitForTimeout(2500);
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '30');
  await expect(page.locator('#filtros-escopo')).toContainText('Município Beta');
});

test('limites municipais ligados por padrão (T10): o estado inteiro depois do painel, uma vez, sem bloquear a consulta', async ({ page }) => {
  const rest = observarRest(page);
  await entrar(page, 'rp');
  const geometria = () => rest.filter((r) => r.includes('geometria_exibicao'));
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-limites', 'completo');
  await expect(page.locator('#c-limites')).toBeChecked();
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 3');
  // Um pedido do estado inteiro, feito depois do resumo da consulta (a abertura não espera a geometria).
  expect(geometria()).toHaveLength(1);
  expect(geometria()[0]).not.toContain('codigo=eq.');
  expect(rest.findIndex((r) => r.includes('rpc/consultar_resumo'))).toBeLessThan(rest.indexOf(geometria()[0]));

  // Município escolhido: já está no conjunto, destacado; nada é baixado de novo.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await expect(page.locator('#filtros-escopo')).toContainText('Município Alfa');
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 3');
  expect(geometria()).toHaveLength(1);

  // Camada desligada: só o contorno do município escolhido fica; sem município, nenhum.
  await alternarCamada(page, 'c-limites');
  await expect(page.locator('#c-limites')).not.toBeChecked();
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-limites', 'desligado');
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 1');
  await consultar(page, { municipio: null });
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 0');

  // Religada: volta da memória, sem novo pedido.
  await alternarCamada(page, 'c-limites');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-limites', 'completo');
  await expect(page.locator('#mapa-contagem')).toContainText('Limites municipais carregados: 3');
  expect(geometria()).toHaveLength(1);
});

test('falha só nos limites: camada desmarcada sem aviso (ciclo 009, D5), pontos e números continuam', async ({ page }) => {
  await page.route((u) => u.pathname.endsWith('/rest/v1/municipios') && (u.searchParams.get('select') ?? '').includes('geometria_exibicao'),
    (route) => route.fulfill({ status: 500, json: { code: 'XX000', message: 'falha' } }));
  await entrar(page, 'rp');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-limites', 'erro');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  await expect(page.locator('#c-limites')).not.toBeChecked();
});

test('seleção na "Lista de focos" e no mapa, com indicador textual', async ({ page }) => {
  await entrar(page, 'rp');
  await selecionarFoco(page, 'fx001');
  await expect(page.locator('#mapa-selecao')).toHaveText('Selecionado: 2026-10-01 01:00 GMT · Município Alfa · -11.58000, -56.60000 · identificador fx001');
  await expect(page.locator('#lista-focos-itens button[aria-pressed="true"]')).toHaveCount(1);
  const balao = await abrirBalao(page, 'fx001');
  await expect(balao.locator('li[data-id="fx001"]')).toContainText('2026-10-01 01:00 GMT');
});

test('proveniência: versão, fontes, método e limitações', async ({ page }) => {
  await entrar(page, 'rp');
  const prov = page.locator('#proveniencia-corpo');
  await expect(prov.locator('#versao-dados')).toContainText('AQUA_M-T');
  await expect(prov.locator('#versao-dados')).toContainText('e'.repeat(63));
  await expect(prov.locator('#versao-dados')).toContainText('2026-10-01 00:00 GMT');
  await expect(prov.locator('#versao-dados')).toContainText('Envelope da sensibilidade');
  await expect(prov.locator('#versao-dados')).toContainText('regra_historico: H1 fictícia');
  // Proveniência completa no diálogo "Sobre os dados" do topo (T13).
  await page.getByRole('button', { name: 'Sobre os dados' }).click();
  await expect(page.locator('#dialogo-sobre')).toBeVisible();
  await prov.getByText(/Fontes \(3\)/).click();
  await expect(prov.locator('tbody tr')).toHaveCount(3);
  await expect(prov).toContainText('https://exemplo.test/focos');
  await expect(prov.locator('#malhas')).toContainText('exibição: intermediaria');
  await expect(prov).toContainText('não comprova incêndio, dano, autoria ou infração');
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialogo-sobre')).toBeHidden();
  await expect(page.locator('#botao-sobre')).toBeFocused();
  // Chips do topo vêm da versão consultada.
  await expect(page.locator('#chip-satelite')).toHaveText('Satélite AQUA_M-T · INPE');
  await expect(page.locator('#chip-fontes')).toContainText('Fontes: IBGE');
  // "Como ler esta tela": diálogo com o aviso de domínio; "Fechar" devolve o foco.
  await page.getByRole('button', { name: 'Como ler esta tela' }).click();
  await expect(page.locator('#t-aviso')).toBeVisible();
  await expect(page.locator('#dialogo-como-ler')).toContainText('não comprovam incêndio, dano, autoria ou infração');
  await page.locator('#dialogo-como-ler').getByRole('button', { name: 'Entendi' }).click();
  await expect(page.locator('#botao-como-ler')).toBeFocused();
});

test('T16: intervalo inválido mantém o recorte aplicado, sem consulta, com a linha "Mostrando"', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-20' });
  await expect(page.locator('#filtros-escopo')).toContainText('Todo Mato Grosso');
  await expect(page.locator('#filtros-escopo')).toContainText('2026-10-20 a 2026-10-31');
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-painel', 'pronto');
  const total = await page.locator('#serie').getAttribute('data-total');
  const rest = observarRest(page);
  await consultar(page, { fim: '2026-10-10' });
  await expect(page.locator('#f-erro')).toBeVisible();
  await expect(page.locator('#f-erro')).toHaveAttribute('role', 'alert');
  await expect(page.locator('#f-erro')).toContainText('não pode ser depois do fim');
  await expect(page.locator('#f-inicio')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#f-mostrando')).toHaveText('Mostrando Todo Mato Grosso · 2026-10-20 a 2026-10-31: o período digitado ainda não foi aplicado.');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', total);
  await consultar(page, { inicio: '2026-09-01' });
  await expect(page.locator('#f-erro')).toContainText('dentro da janela');
  await page.waitForTimeout(300);
  expect(rest.filter((r) => r.includes('/rpc/')), 'período inválido não consulta').toEqual([]);
  // Com o período inválido, o município ainda se aplica, no período aplicado.
  await consultar(page, { municipio: MUNICIPIOS.alfa.codigo });
  await expect(page.locator('#filtros-escopo')).toContainText('Município Alfa');
  await expect(page.locator('#filtros-escopo')).toContainText('Município Alfa');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-31' });
  await expect(page.locator('#f-erro')).toBeHidden();
  await expect(page.locator('#f-mostrando')).toBeHidden();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '60');
});

test('T16: seletor de período (V13), resposta atrasada descartada e "Limpar tudo" volta ao padrão', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(page.getByRole('button', { name: 'Consultar' })).toHaveCount(0);
  await expect(page.locator('#f-periodo')).toHaveValue('ano');
  await expect(page.locator('#periodo-resumo')).toHaveText('01/10/2026 a 31/10/2026 · 31 dias GMT');
  await expect(page.locator('#intervalo')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Limpar tudo' })).toBeDisabled();
  // Resumo do primeiro intervalo retido; o segundo termina antes e vence.
  let chamadas = 0;
  await page.route('**/rest/v1/rpc/consultar_resumo', async (rota) => {
    chamadas += 1;
    if (chamadas === 1) await new Promise((r) => setTimeout(r, 2000));
    await rota.continue();
  });
  await consultar(page, { inicio: '2026-10-25' });
  await expect(page.locator('#intervalo')).toBeVisible();
  await consultar(page, { inicio: '2026-10-02' });
  await expect(page.locator('#filtros-escopo')).toContainText('2026-10-02 a 2026-10-31');
  await page.waitForTimeout(2500);
  await expect(page.locator('#filtros-escopo')).toContainText('2026-10-02 a 2026-10-31');
  await expect(page.locator('#periodo-resumo')).toHaveText('02/10/2026 a 31/10/2026 · 30 dias GMT');
  await expect(page.locator('#filtros-escopo')).toContainText('Todo Mato Grosso');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  // Atalho: "Último mês" volta ao mês inteiro do fim da janela (aqui, a janela inteira da fixture).
  await page.locator('#f-periodo').selectOption('u1');
  await expect(page.locator('#intervalo')).toBeHidden();
  await expect(page.locator('#f-inicio')).toHaveValue('2026-10-01');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');

  await consultar(page, { municipio: MUNICIPIOS.beta.codigo });
  await escolherLente(page, 'recorrencia');
  await expect(page.locator('#secao-lente .marca-ativa')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar tudo' }).click();
  await expect(page.locator('#f-periodo')).toHaveValue('ano');
  await expect(page.locator('#f-municipio')).toHaveValue('');
  await expect(page.locator('input[name="l-lente"][value="nenhuma"]')).toBeChecked();
  await expect(page.locator('#secao-lente .marca-ativa')).toBeHidden();
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '100');
  await expect(page.getByRole('button', { name: 'Limpar tudo' })).toBeDisabled();
  await expect(page.locator('#filtros-escopo')).toHaveText('Uma lente por vez · Todo Mato Grosso · 2026-10-01 a 2026-10-31');
});
