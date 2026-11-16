// Ciclo 008, item 4 (issue #80): painel de perguntas com o handler real de /api/explicar (Supabase local, Auth e RLS
// reais) e o provedor simulado no formato da Interactions API (scripts/interface/api-e2e.mjs; nenhuma rede, nenhuma
// chave). Fixture fictícia do E2E: de 01 a 10/10/2026, 55 detecções; de 11 a 20/10, 43. As etapas exibidas são os
// eventos do fluxo da execução real; o modo do provedor simulado é trocado só pela porta de controle do teste.
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { abrirSecao, consultar, entrar, escolherLente } from './ajuda.mjs';

const CONTROLE = 'http://127.0.0.1:5180/__e2e/provedor';

test.beforeAll(() => cadastrarRp());
test.beforeEach(async ({ request }) => { await request.post(CONTROLE, { data: { modo: 'normal' } }); });
test.afterAll(async ({ request }) => { await request.post(CONTROLE, { data: { modo: 'normal' } }); });

const chamadasProvedor = async (request) => (await (await request.get(CONTROLE)).json()).chamadas;
const painel = (page) => page.locator('#painel-perguntas');
const etapas = (page) => page.locator('#perguntas-etapas li');

async function compararPeriodos(page) {
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await expect(page.locator('#total-principal')).toHaveText('55');
  await abrirSecao(page, 'secao-comparar');
  await page.locator('input[name="c-modo"][value="periodos"]').check();
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
}

test('perguntas prontas só com contexto; comparação de períodos com as etapas reais, resposta conferida e evidências', async ({ page, request }) => {
  const pedidos = [];
  page.on('request', (r) => { if (r.url().includes('/api/explicar')) pedidos.push(r); });
  await entrar(page, 'rp');
  // Sem lente, destaque ou comparação: as prontas dizem o que falta, e nada é enviado.
  await expect(page.locator('#pergunta-periodos')).toBeDisabled();
  await expect(page.locator('#pergunta-periodos-motivo')).toHaveText('Compare dois períodos em Filtros › Comparar.');
  await expect(page.locator('#pergunta-destaque')).toBeDisabled();
  await expect(page.locator('#pergunta-destaque-motivo')).toHaveText('Escolha uma lente e abra um destaque.');
  await expect(page.locator('#botao-perguntar')).toBeDisabled();
  await compararPeriodos(page);
  await expect(page.locator('#pergunta-periodos')).toBeEnabled();
  await expect(page.locator('#pergunta-contexto')).toHaveText('A pergunta escrita usa a comparação de dois períodos, como estão na tela.');
  await page.locator('#pergunta-periodos').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'resposta');
  await expect(page.locator('#perguntas-estado')).toHaveText('Resposta completa.');
  // Etapas: exatamente os eventos recebidos, na ordem da execução real (principal, dois subagentes, síntese).
  const textos = await etapas(page).allTextContents();
  expect(textos[0]).toBe('Acesso e versão dos dados validados');
  expect(textos[1]).toBe('Agente principal iniciado');
  for (const t of ['Subagente de lentes e evidências iniciado', 'Subagente de disponibilidade iniciado',
    'Ferramenta executada: comparação de períodos (evidência E1)', 'Análise do subagente de lentes e evidências conferida',
    'Análise do subagente de disponibilidade conferida', 'Síntese do agente principal iniciada', 'Chamada 6 ao modelo (agente principal)']) {
    expect(textos, t).toContain(t);
  }
  expect(textos.at(-1)).toBe('Execução concluída: resposta completa');
  await expect(page.locator('.marca-ia')).toContainText('Gerado por IA');
  await expect(page.locator('.marca-ia')).toContainText('Detecções não comprovam incêndio, dano, autoria ou infração.');
  await expect(page.locator('.resposta-ia .afirmacoes li').first()).toContainText('Valor conferido');
  await expect(page.locator('.resposta-ia .referencias').first()).toContainText('(comparação de períodos)');
  // Evidências por identificador e o caminho de volta ao detalhamento determinístico.
  await page.locator('#perguntas-evidencias > summary').click();
  const e1 = page.locator('[data-evidencia="E1"]');
  await e1.locator('summary').click();
  await expect(e1.locator('pre')).toContainText('"total": 55');
  await e1.getByRole('button', { name: 'Ver o detalhamento na tela' }).click();
  await expect(page.locator('#aba-comparacao')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#perguntas-corpo')).toContainText('Chamadas ao modelo: 6');
  expect(await chamadasProvedor(request)).toBe(6);
  // Uma requisição, na própria origem, com o JWT só no cabeçalho e o pedido de fluxo.
  expect(pedidos).toHaveLength(1);
  expect(new URL(pedidos[0].url()).search).toBe('');
  expect(pedidos[0].headers()['authorization']).toMatch(/^Bearer /);
  expect(pedidos[0].headers()['accept']).toBe('application/x-ndjson');
  // A pergunta não mudou os filtros nem a comparação.
  await expect(page.locator('#total-principal')).toHaveText('55');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
});

test('"Por que esta célula foi destacada?" usa o destaque aberto; outro destaque descarta a resposta', async ({ page }) => {
  let corpo = null;
  page.on('request', (r) => { if (r.url().includes('/api/explicar')) corpo = r.postDataJSON(); });
  await entrar(page, 'rp');
  await consultar(page, { inicio: '2026-10-01', fim: '2026-10-10' });
  await escolherLente(page, 'concentracao');
  await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#pergunta-destaque')).toBeDisabled();
  await page.locator('#lente-destaques .botao-nome').first().click();
  await expect(page.locator('#pergunta-destaque')).toBeEnabled();
  await page.locator('#pergunta-destaque').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'resposta');
  expect(corpo.recorte).toEqual({ tipo: 'selecao', janela: { inicio: '2026-10-01', fim: '2026-10-10' }, municipio: null, lente: { tipo: 'concentracao' } });
  expect(corpo.pergunta).toMatch(/^Por que esta célula foi destacada\? Destaque aberto: Município Alfa \(9900001\)/);
  expect(Object.keys(corpo).sort()).toEqual(['carga', 'pergunta', 'recorte']);
  await expect(etapas(page)).toContainText(['Ferramenta executada: destaques da lente (evidência E1)']);
  // Outro destaque: a resposta anterior sai, com o aviso.
  await page.locator('#botao-voltar').click();
  await page.locator('#lente-destaques .botao-nome').nth(1).click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'descartada');
  await expect(page.locator('#perguntas-estado')).toHaveText('A seleção mudou: a pergunta anterior foi cancelada e a resposta saiu da tela.');
  await expect(page.locator('#perguntas-corpo')).toBeEmpty();
});

test('"Há lacunas nos dados?" no município da Consulta: só o subagente de disponibilidade tem ferramenta', async ({ page }) => {
  await entrar(page, 'rp');
  await consultar(page, { municipio: 9900001, inicio: '2026-10-01', fim: '2026-10-10' });
  await expect(page.locator('#total-principal')).toHaveText('29');
  await page.locator('#pergunta-lacunas').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'resposta');
  // A escolha do principal é validada: a delegação sem ferramenta para este recorte aparece recusada, como ocorreu.
  await expect(etapas(page)).toContainText(['Delegação ao subagente de lentes e evidências recusada: não se aplica a este recorte']);
  await expect(etapas(page)).toContainText(['Ferramenta executada: disponibilidade por município (evidência E1)']);
  await expect(page.locator('#perguntas-estado')).toHaveText('Resposta completa.');
});

test('"Comparar municípios" abre o seletor do município B; o texto livre usa a comparação calculada', async ({ page }) => {
  await entrar(page, 'rp');
  await expect(page.locator('#acao-comparar-municipios')).toBeDisabled();
  await expect(page.locator('#acao-comparar-municipios-motivo')).toHaveText('Escolha um município na Consulta para ser o A.');
  await consultar(page, { municipio: 9900001, inicio: '2026-10-01', fim: '2026-10-10' });
  await expect(page.locator('#total-principal')).toHaveText('29');
  await page.locator('#acao-comparar-municipios').click();
  await expect(page.locator('#secao-comparar')).toHaveAttribute('open', '');
  await expect(page.locator('input[name="c-modo"][value="municipios"]')).toBeChecked();
  await expect(page.locator('#cmp-municipio-b')).toBeFocused();
  await expect(page.locator('#acao-comparar-municipios')).toBeDisabled();
  await page.locator('#cmp-municipio-b').selectOption('9900002');
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await page.locator('#pergunta-livre').fill('Qual dos dois teve mais detecções no período?');
  await page.locator('#botao-perguntar').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'resposta');
  await expect(page.locator('.perguntas__pergunta')).toHaveText('Pergunta: Qual dos dois teve mais detecções no período?');
  await expect(etapas(page)).toContainText(['Ferramenta executada: comparação de municípios (evidência E1)']);
  // A pergunta não mudou os filtros.
  await expect(page.locator('#f-municipio')).toHaveValue('9900001');
});

test('falha de um subagente: resposta incompleta, com a falha dita e o que foi conferido', async ({ page, request }) => {
  await request.post(CONTROLE, { data: { modo: 'falha_lentes' } });
  await entrar(page, 'rp');
  await compararPeriodos(page);
  await page.locator('#pergunta-periodos').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'resposta');
  await expect(page.locator('#perguntas-estado')).toHaveText('Resposta incompleta: nem todas as análises necessárias foram conferidas.');
  const textos = await etapas(page).allTextContents();
  expect(textos).toContain('Análise do subagente de lentes e evidências falhou');
  expect(textos).toContain('Análise do subagente de disponibilidade conferida');
  expect(textos).not.toContain('Execução concluída: resposta completa');
  await expect(page.locator('.notas-ia')).toContainText('A análise de lentes e evidências não foi concluída; a resposta está incompleta.');
  await expect(page.locator('#pergunta-tentar')).toBeVisible();
  await expect(page.locator('#perguntas-corpo')).toContainText('consome nova cota do provedor');
});

test('cancelar, mudar a seleção ou sair interrompe a execução: nenhuma chamada nova e nenhuma resposta tardia', async ({ page, request }) => {
  await request.post(CONTROLE, { data: { modo: 'normal', atrasoMs: 1500 } });
  await entrar(page, 'rp');
  await compararPeriodos(page);
  // Cancelar pelo botão.
  await page.locator('#pergunta-periodos').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'executando');
  await expect(painel(page)).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#pergunta-lacunas')).toBeDisabled();
  await expect(etapas(page).first()).toHaveText('Acesso e versão dos dados validados');
  await page.locator('#botao-cancelar-pergunta').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'cancelada');
  await expect(page.locator('#perguntas-estado')).toHaveText('Pergunta cancelada; nada da resposta foi exibido.');
  const aoCancelar = await chamadasProvedor(request);
  await page.waitForTimeout(3500);
  expect(await chamadasProvedor(request), 'nenhuma chamada ao provedor depois do cancelamento').toBe(aoCancelar);
  await expect(page.locator('.resposta-ia')).toHaveCount(0);
  // Mudar o período B no meio: a execução é descartada e a resposta tardia nunca aparece.
  await page.locator('#pergunta-periodos').click();
  await expect(etapas(page).first()).toHaveText('Acesso e versão dos dados validados');
  await page.locator('#cmp-b-inicio').fill('2026-10-21');
  await page.locator('#cmp-b-fim').fill('2026-10-30');
  await page.locator('#cmp-b-fim').blur();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'descartada');
  await page.waitForTimeout(4000);
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'descartada');
  await expect(page.locator('.resposta-ia')).toHaveCount(0);
  // Sair no meio: a tela e a pergunta saem antes da rede responder.
  await expect(page.locator('#painel-comparacao')).toHaveAttribute('data-estado-comparacao', 'pronta');
  await page.locator('#pergunta-periodos').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'executando');
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.locator('#acesso[data-estado="anonimo"]')).toBeVisible();
  const aoSair = await chamadasProvedor(request);
  await page.waitForTimeout(3500);
  expect(await chamadasProvedor(request), 'nenhuma chamada ao provedor depois de sair').toBe(aoSair);
  await expect(page.locator('#perguntas-corpo')).toBeEmpty();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'ociosa');
});

test('sem IA: estado claro no painel; consulta, lentes e comparação continuam completas', async ({ page, request }) => {
  await request.post(CONTROLE, { data: { modo: 'desligada' } });
  await entrar(page, 'rp');
  await compararPeriodos(page);
  await page.locator('#pergunta-periodos').click();
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'desligada');
  await expect(page.locator('#perguntas-estado')).toHaveText('Explicação por IA desligada neste ambiente.');
  await expect(page.locator('#perguntas-corpo [data-codigo="ia_desabilitada"]')).toHaveText('A explicação por IA está desligada neste ambiente; a comparação e as lentes continuam disponíveis.');
  await expect(page.locator('#pergunta-tentar')).toHaveCount(0);
  expect(await chamadasProvedor(request)).toBe(0);
  // A comparação determinística e a consulta seguem inteiras.
  await expect(page.locator('#comparacao-corpo table').first().locator('tbody tr').first().locator('td')).toHaveText(['Detecções (total principal)', '55', '43', '−12']);
  await escolherLente(page, 'concentracao');
  await expect(page.locator('#cartao-lentes')).toHaveAttribute('data-estado-lente', 'completo');
  await expect(page.locator('#total-principal')).toHaveText('55');
});

test('teclado e leitor de tela: pergunta pelo teclado, estado anunciado e foco preservado', async ({ page }) => {
  await entrar(page, 'rp');
  await compararPeriodos(page);
  await page.locator('#pergunta-livre').focus();
  await page.keyboard.type('O que mudou?');
  await page.keyboard.press('Tab');
  await expect(page.locator('#botao-perguntar')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(painel(page)).toHaveAttribute('data-estado-perguntas', 'resposta');
  await expect(page.locator('#perguntas-estado')).toHaveAttribute('role', 'status');
  await expect(page.locator('#perguntas-etapas')).toHaveAttribute('aria-label', 'Etapas da execução');
  // As prontas descrevem o motivo quando desabilitadas, pelo aria-describedby.
  await expect(page.locator('#pergunta-destaque')).toHaveAttribute('aria-describedby', 'pergunta-destaque-motivo');
});
