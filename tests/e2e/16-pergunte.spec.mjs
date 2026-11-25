// Ciclo 012 (issue #113): "Pergunte ao mapa" → mapa vivo → ficha para averiguação, contra o Supabase local e a
// fixture fictícia (outubro de 2026). Município Beta: 3 detecções por dia de 05 a 14/10 (30 no mês); de 01 a 10/10,
// 18 detecções; dias 01 a 03/10 com incidência indeterminada. Com a IA desligada vale o interpretador local; com o
// provedor simulado (scripts/interface/api-e2e.mjs), a interpretação fixa do E2E (Beta, 01 a 10/10, com animação).
import { test, expect } from '@playwright/test';
import { cadastrarRp } from './contas.mjs';
import { entrar } from './ajuda.mjs';

const CONTROLE = 'http://127.0.0.1:5180/__e2e/provedor';
const BETA = '9900002';

test.beforeAll(() => cadastrarRp());
test.afterAll(async ({ request }) => { await request.post(CONTROLE, { data: { modo: 'normal' } }); });

async function perguntar(page, texto) {
  await page.locator('#p-pergunta').fill(texto);
  await page.locator('#p-pergunta').press('Enter');
}

test('sem IA: pergunta → filtros aplicados → reprodução com lacunas → ficha; interface existente preservada', async ({ page, request }) => {
  await request.post(CONTROLE, { data: { modo: 'desligada' } });
  await entrar(page, 'rp');
  // A seção nova é a primeira da coluna e recolhível; as demais continuam na mesma ordem.
  const secoes = await page.locator('#filtros > details.secao').evaluateAll((s) => s.map((x) => x.id));
  expect(secoes).toEqual(['secao-pergunte', 'secao-consulta', 'secao-lente', 'secao-contexto', 'secao-cruzar', 'secao-comparar']);
  // "Pergunte ao mapa" vem antes do rótulo "Filtro"; não há perguntas de exemplo, só o exemplo no campo.
  await expect(page.locator('#t-pergunte')).toHaveText('Pergunte ao mapa');
  await expect(page.locator('#t-filtros')).toHaveText('Filtro');
  expect(await page.locator('#t-pergunte').evaluate((a) => !!(a.compareDocumentPosition(document.getElementById('t-filtros')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(page.locator('.pergunte__sugestao')).toHaveCount(0);
  await expect(page.locator('#p-pergunta')).toHaveAttribute('placeholder', /^Ex\.: /);
  await expect(page.locator('#reproducao')).toBeHidden();
  // Robozinho ao lado do título indica a IA; "Limpar tudo" fica no topo da coluna, antes da pergunta.
  await expect(page.locator('#p-ia')).toHaveAttribute('aria-label', /IA/);
  expect(await page.locator('#botao-limpar').evaluate((b) => !!(b.compareDocumentPosition(document.getElementById('t-pergunte')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  // "×" no campo apaga só o texto; texto digitado já ativa "Limpar tudo".
  const limpar = page.getByRole('button', { name: 'Limpar tudo' });
  await expect(limpar).toBeDisabled();
  await expect(page.locator('#p-apagar')).toBeHidden();
  await page.locator('#p-pergunta').fill('rascunho');
  await expect(limpar).toBeEnabled();
  await page.locator('#p-apagar').click();
  await expect(page.locator('#p-pergunta')).toHaveValue('');
  await expect(page.locator('#p-apagar')).toBeHidden();
  await expect(limpar).toBeDisabled();

  await perguntar(page, 'Como as detecções evoluíram no Município Beta entre 01/10 e 10/10?');
  const entendi = page.locator('#p-entendi');
  await expect(entendi).toBeVisible();
  await expect(entendi).toHaveAttribute('data-origem', 'local');
  await expect(entendi).toContainText('Interpretado sem IA');
  // IA desligada (503): o robozinho fica apagado.
  await expect(page.locator('#p-ia')).toHaveAttribute('data-ia', 'desligada');
  await expect(entendi.locator('[data-item="municipio"]')).toContainText('Município Beta');
  await expect(entendi.locator('[data-item="animar"]')).toContainText('Animação dia a dia');
  // Os controles existentes recebem a interpretação; a consulta é a mesma dos filtros.
  await expect(page.locator('#f-municipio')).toHaveValue(BETA);
  await expect(page.locator('#f-periodo')).toHaveValue('personalizado');
  await expect(page.locator('#f-inicio')).toHaveValue('2026-10-01');
  await expect(page.locator('#f-fim')).toHaveValue('2026-10-10');
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '18');

  // Mapa vivo aberto e tocando; a soma dos quadros é o total do recorte.
  const barra = page.locator('#reproducao');
  await expect(barra).toBeVisible();
  // O mapa vivo abre com o mapa ampliado.
  await expect(page.locator('body')).toHaveClass(/mapa-ampliado/);
  await expect(barra).toHaveAttribute('data-total', '18');
  await expect(page.locator('#botao-animar')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#rep-tocar').click();
  await expect(barra).toHaveAttribute('data-tocando', 'false');
  await expect(page.locator('#rep-marcas .reproducao__marca')).toHaveCount(3);
  await page.locator('#rep-dia').fill('2');
  await expect(page.locator('#rep-rotulo')).toHaveText('03/10 · 0 no dia · 0 acumuladas');
  await expect(page.locator('#rep-aviso')).toContainText('Cobertura não comprovada neste dia (incidência indeterminada)');
  await page.locator('#rep-dia').fill('9');
  await expect(page.locator('#rep-rotulo')).toHaveText('10/10 · 3 no dia · 18 acumuladas');
  await expect(page.locator('#rep-aviso')).toBeHidden();
  await expect(page.locator('#serie .serie__barra--atual')).toHaveAttribute('data-chave', '2026-10-10');
  // Com o mapa reduzido pelo botão do canto, a série fica à vista: clicar numa barra leva a reprodução àquele dia.
  await page.locator('#botao-ampliar').click();
  await expect(page.locator('body')).not.toHaveClass(/mapa-ampliado/);
  await expect(page.locator('#reproducao')).toBeVisible();
  await page.locator('#serie .serie__barra[data-chave="2026-10-06"]').click();
  await expect(page.locator('#rep-rotulo')).toHaveText('06/10 · 3 no dia · 6 acumuladas');
  // Velocidade e Esc: a barra fecha e o mapa estático volta.
  await page.locator('[data-vel="4"]').click();
  await expect(page.locator('[data-vel="4"]')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(barra).toBeHidden();
  // Um Esc fecha a reprodução e devolve o mapa ao tamanho normal.
  await expect(page.locator('body')).not.toHaveClass(/mapa-ampliado/);
  await expect(page.locator('#botao-animar')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#mapa-contagem')).toContainText('18');
  // Pelo botão "Animar no tempo": o menu fecha, o mapa amplia e a barra abre completa; "Fechar" desfaz.
  await page.locator('#opcoes-mapa > summary').click();
  await page.locator('#botao-animar').click();
  await expect(page.locator('#opcoes-mapa')).not.toHaveAttribute('open', '');
  await expect(page.locator('body')).toHaveClass(/mapa-ampliado/);
  await expect(page.locator('#rep-dia')).toBeVisible();
  await expect(page.locator('#rep-tocar')).toBeVisible();
  await page.locator('#rep-fechar').click();
  await expect(barra).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/mapa-ampliado/);

  // ✎ abre e foca o controle existente.
  await entendi.locator('[data-alvo="municipio"]').click();
  await expect(page.locator('#f-municipio')).toBeFocused();

  // Ficha para averiguação: evidências do recorte, roteiro, ressalvas e conclusão em branco.
  await page.locator('#botao-ficha-pergunta').click();
  const ficha = page.locator('#dialogo-ficha');
  await expect(ficha).toHaveAttribute('open', '');
  await expect(page.locator('#ficha-corpo')).toHaveAttribute('data-total', '18');
  await expect(ficha).toContainText('“Como as detecções evoluíram no Município Beta entre 01/10 e 10/10?”');
  await expect(ficha).toContainText('Interpretação (sem IA)');
  await expect(ficha).toContainText('Dias com detecção');
  await expect(ficha).toContainText('6 de 10 dias GMT');
  await expect(ficha).toContainText('3 (01/10, 02/10, 03/10)');
  await expect(ficha).toContainText('VIIRS');
  await expect(ficha).toContainText('Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração.');
  await expect(ficha.locator('input[name="ficha-parecer"]')).toHaveCount(3);
  await expect(ficha.locator('svg.ficha__mini-mapa circle')).toHaveCount(18);
  await ficha.getByRole('button', { name: 'Fechar' }).click();
  await expect(ficha).not.toHaveAttribute('open', '');
  await expect(page.locator('#botao-ficha-pergunta')).toBeFocused();

  // Recusas e dado ausente, sem mudar os filtros.
  await perguntar(page, 'Quem causou esse fogo?');
  await expect(page.locator('#p-aviso')).toHaveAttribute('data-tipo', 'recusa_autoria');
  await expect(page.locator('#p-aviso')).toContainText('não indica autoria');
  await expect(page.locator('#p-entendi')).toBeHidden();
  await expect(page.locator('#f-municipio')).toHaveValue(BETA);
  await page.getByRole('button', { name: 'Mostrar as detecções' }).click();
  await expect(page.locator('#lista-focos')).toBeVisible();
  await perguntar(page, 'Vai queimar amanhã?');
  await expect(page.locator('#p-aviso')).toHaveAttribute('data-tipo', 'recusa_previsao');
  await perguntar(page, 'Choveu no Município Alfa?');
  await expect(page.locator('#p-aviso')).toHaveAttribute('data-tipo', 'sem_dado');
  await perguntar(page, 'Focos em 2024');
  await expect(page.locator('#p-aviso')).toHaveAttribute('data-tipo', 'fora_da_janela');
  await expect(page.locator('#p-aviso')).toContainText('01/10/2026 a 31/10/2026');
});

test('com IA (provedor simulado): uma chamada à rota, JWT no cabeçalho, "Interpretado por IA"; lente pela sugestão local', async ({ page, request }) => {
  await request.post(CONTROLE, { data: { modo: 'normal' } });
  const pedidos = [];
  page.on('request', (r) => { if (r.url().includes('/api/interpretar')) pedidos.push(r); });
  await entrar(page, 'rp');
  await perguntar(page, 'Mostre o Município Beta no começo de outubro');
  await expect(page.locator('#p-entendi')).toHaveAttribute('data-origem', 'ia');
  await expect(page.locator('#p-entendi')).toContainText('Interpretado por IA');
  await expect(page.locator('#f-municipio')).toHaveValue(BETA);
  await expect(page.locator('#serie')).toHaveAttribute('data-total', '18');
  await expect(page.locator('#reproducao')).toBeVisible();
  expect(pedidos).toHaveLength(1);
  expect(new URL(pedidos[0].url()).search).toBe('');
  expect(pedidos[0].headers()['authorization']).toMatch(/^Bearer /);
  expect(JSON.parse(pedidos[0].postData())).toEqual({ pergunta: 'Mostre o Município Beta no começo de outubro', carga: expect.objectContaining({ id: expect.any(Number) }) });

  // Desligada no meio da sessão: o interpretador local assume, sem erro na tela; persistência aplicada pela lente.
  await request.post(CONTROLE, { data: { modo: 'desligada' } });
  // O mapa ampliado cobre a coluna da pergunta: Esc fecha a animação e devolve o mapa ao tamanho normal.
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/mapa-ampliado/);
  await perguntar(page, 'Onde as detecções persistiram no Município Alfa em outubro?');
  await expect(page.locator('#p-entendi')).toHaveAttribute('data-origem', 'local');
  await expect(page.locator('input[name="l-lente"][value="persistencia"]')).toBeChecked();
  await expect(page.locator('#f-municipio')).toHaveValue('9900001');
  await expect(page.locator('#aba-destaques')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#cartao-lentes')).not.toHaveAttribute('data-estado-lente', 'carregando');
  await expect(page.locator('#reproducao')).toBeHidden();
  // Combinação de lentes pela pergunta: duas lentes citadas, operador "e", nos controles de "Cruzar critérios".
  await perguntar(page, 'Onde há persistência e recorrência no Município Alfa em outubro?');
  await expect(page.locator('input[name="l-lente"][value="combinacao"]')).toBeChecked();
  await expect(page.locator('input[name="l-comb"][value="persistencia"]')).toBeChecked();
  await expect(page.locator('input[name="l-comb"][value="recorrencia"]')).toBeChecked();
  await expect(page.locator('input[name="l-comb"][value="concentracao"]')).not.toBeChecked();
  await expect(page.locator('input[name="l-operador"][value="e"]')).toBeChecked();
  await expect(page.locator('#p-entendi [data-item="lente"]')).toContainText('Combinação: Recorrência e Persistência');
  await expect(page.locator('#cartao-lentes')).not.toHaveAttribute('data-estado-lente', 'carregando');
  // "Limpar tudo" tira a interpretação junto com os filtros.
  await page.getByRole('button', { name: 'Limpar tudo' }).click();
  await expect(page.locator('#p-entendi')).toBeHidden();
  await expect(page.locator('#p-pergunta')).toHaveValue('');
});

// Ciclo 013 (issue #115): sobrecarga do Gemini. Com o principal e a reserva em 503, a rota responde
// `provedor_sobrecarregado` e a tela explica o motivo; com a reserva respondendo, a pergunta segue interpretada por IA.
test('sobrecarga: nota própria e "Interpretado sem IA"; reserva respondendo: "Interpretado por IA (modelo reserva)"', async ({ page, request }) => {
  await request.post(CONTROLE, { data: { modo: 'sobrecarregada' } });
  await entrar(page, 'rp');
  await perguntar(page, 'Mostre o Município Beta no começo de outubro');
  await expect(page.locator('#p-entendi')).toHaveAttribute('data-origem', 'local');
  await expect(page.locator('#p-entendi')).toContainText('Interpretado sem IA');
  await expect(page.locator('#p-entendi')).toContainText('A IA está sobrecarregada no momento; o interpretador local assumiu. Tente de novo em alguns minutos.');
  await expect(page.locator('#p-entendi')).not.toContainText('não respondeu como esperado');
  // Principal, nova tentativa e reserva: três chamadas ao provedor simulado.
  expect((await (await request.get(CONTROLE)).json()).chamadas).toBe(3);

  await request.post(CONTROLE, { data: { modo: 'reserva' } });
  if (await page.locator('#reproducao').isVisible()) await page.keyboard.press('Escape');
  await perguntar(page, 'Mostre o Município Beta no começo de outubro');
  await expect(page.locator('#p-entendi')).toHaveAttribute('data-origem', 'ia_reserva');
  await expect(page.locator('#p-entendi')).toContainText('Interpretado por IA (modelo reserva)');
  await expect(page.locator('#p-entendi')).not.toContainText('sobrecarregada');
  await expect(page.locator('#f-municipio')).toHaveValue(BETA);
  expect((await (await request.get(CONTROLE)).json()).chamadas).toBe(3);
});
