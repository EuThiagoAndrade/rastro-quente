// Helpers comuns do E2E.
import { expect } from '@playwright/test';
import { emailDe, senhaDe } from './contas.mjs';

export const JANELA = { inicio: '2026-10-01', fim: '2026-10-31' };

/** Entra pelo formulário de senha local (somente no build de teste). */
export async function entrar(page, nome, { esperar = 'dados' } = {}) {
  await page.goto('/');
  await page.locator('#l-email').fill(emailDe(nome));
  await page.locator('#l-senha').fill(await senhaDe(nome));
  await page.getByRole('button', { name: 'Entrar com e-mail e senha' }).click();
  if (esperar === 'dados') await expect(page.locator('#serie')).toBeAttached();
  else if (esperar) await expect(page.locator(`#acesso[data-estado="${esperar}"]`)).toBeVisible();
}

/** Liga ou desliga uma camada do mapa no menu "Camadas" (item 3 do ciclo 007), por clique ou toque. */
export async function alternarCamada(page, id, toque = false) {
  const menu = page.locator('#camadas');
  if ((await menu.getAttribute('open')) === null) {
    const resumo = menu.locator(':scope > summary');
    if (toque) await resumo.tap(); else await resumo.click();
  }
  const caixa = page.locator(`#${id}`);
  if (toque) await caixa.tap(); else await caixa.click();
}

/** Abre uma seção recolhível dos filtros (fechada por padrão em tela estreita, T17). */
export async function abrirSecao(page, id) {
  const secao = page.locator(`#${id}`);
  if ((await secao.getAttribute('open')) === null) await secao.locator(':scope > summary').click();
  await expect(secao).toHaveAttribute('open', '');
}

/**
 * Muda o recorte pelos filtros (T16): não há botão "Consultar"; cada campo se aplica ao mudar. Recorte igual ao
 * aplicado não consulta de novo; para repetir uma consulta que falhou, use o botão "Tentar novamente".
 */
export async function consultar(page, { municipio, inicio, fim } = {}) {
  await abrirSecao(page, 'secao-consulta');
  if (municipio !== undefined) await page.locator('#f-municipio').selectOption(municipio === null ? '' : String(municipio));
  // Datas só no "Intervalo personalizado…" do seletor de período (V13).
  if ((inicio || fim) && (await page.locator('#f-periodo').inputValue()) !== 'personalizado') {
    await page.locator('#f-periodo').selectOption('personalizado');
  }
  if (inicio) await page.locator('#f-inicio').fill(inicio);
  if (fim) await page.locator('#f-fim').fill(fim);
}

/**
 * Marca a lente no rádio da sua seção (Seleção, Contexto territorial ou Cruzar critérios). Como na V13, não há
 * "Nenhuma lente" visível: a lente sai por "Limpar tudo" (que também volta período e município ao padrão).
 */
export async function escolherLente(page, valor) {
  if (valor === 'nenhuma') {
    await page.getByRole('button', { name: 'Limpar tudo' }).click();
    return;
  }
  const radio = page.locator(`input[name="l-lente"][value="${valor}"]`);
  const secao = await radio.evaluate((e) => e.closest('details')?.id);
  if (secao) await abrirSecao(page, secao);
  await radio.check();
}

export const numero = async (page, id) => (await page.locator(`#${id}`).innerText()).trim();

/** Soma de rede apenas das chamadas à API de dados (REST). */
export function observarRest(page) {
  const chamadas = [];
  page.on('request', (r) => { if (r.url().includes('/rest/v1/')) chamadas.push(`${r.method()} ${decodeURIComponent(r.url())}`); });
  return chamadas;
}

/** Abre o painel "Mapa" (fundo, "Lista de focos", enquadrar; issue #71), se estiver fechado. */
export async function abrirOpcoesMapa(page, toque = false) {
  const painel = page.locator('#opcoes-mapa');
  if ((await painel.getAttribute('open')) === null) {
    const resumo = painel.locator(':scope > summary');
    if (toque) await resumo.tap(); else await resumo.click();
  }
  await expect(painel).toHaveAttribute('open', '');
}

/** Abre a "Lista de focos" (T21) pelo painel "Mapa", se estiver fechada. */
export async function abrirListaFocos(page) {
  await abrirOpcoesMapa(page);
  const botao = page.locator('#botao-lista-focos');
  if ((await botao.getAttribute('aria-expanded')) !== 'true') await botao.click();
  await expect(page.locator('#lista-focos')).toBeVisible();
}

/** Seleciona um foco na lista (avança as páginas até achá-lo); o mapa centraliza o ponto. */
export async function selecionarFoco(page, id) {
  await abrirListaFocos(page);
  await expect(page.locator('#conteudo')).toHaveAttribute('data-estado-pontos', 'completo');
  await expect(page.locator('#lista-focos-itens')).toBeVisible();
  const linha = page.locator(`#lista-focos-itens button[data-id="${id}"]`);
  while (!(await linha.count())) {
    const proxima = page.locator('#focos-proxima');
    if (!(await proxima.count()) || (await proxima.isDisabled())) throw new Error(`foco ${id} não está na lista`);
    await proxima.click();
  }
  await linha.click();
  await expect(linha).toHaveAttribute('aria-pressed', 'true');
}

/** Abre o balão do ponto de um foco: seleciona-o na lista (o mapa centraliza) e toca o centro do mapa. */
export async function abrirBalao(page, id) {
  // Espera o enquadramento dos limites (pedido em paralelo com os pontos) antes de centralizar o foco.
  await page.waitForTimeout(800);
  await selecionarFoco(page, id);
  await page.waitForTimeout(600);
  // O painel "Mapa" aberto (usado para abrir a lista) cobriria o centro do mapa: fecha antes de tocar o ponto.
  const painel = page.locator('#opcoes-mapa');
  if ((await painel.getAttribute('open')) !== null) await painel.locator(':scope > summary').click();
  const caixa = await page.locator('#mapa').boundingBox();
  await page.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  // O balão anterior some com animação: espera sobrar só o novo.
  await expect(page.locator('#balao-registros')).toHaveCount(1);
  await expect(page.locator('#balao-registros')).toBeVisible();
  return page.locator('#balao-registros');
}

/**
 * Abre a explicação do n-ésimo destaque da lista (volta à lista antes, se outra explicação estiver aberta) e abre o
 * bloco recolhível das detecções que sustentam o destaque, quando houver.
 */
export async function abrirDestaque(page, n) {
  if (await page.locator('#vista-explicacao').isVisible()) await page.locator('#botao-voltar').click();
  await page.locator('#lente-destaques > li').nth(n).locator('.botao-nome').click();
  await expect(page.locator('#vista-explicacao')).toBeVisible();
  await page.locator('#lente-disponibilidade-detalhes').evaluate((e) => { e.open = true; });
  await page.locator('#lente-detalhes-tecnicos').evaluate((e) => { e.open = true; });
  const evidencia = page.locator('#lente-evidencia-detalhes');
  if ((await evidencia.count()) && (await evidencia.getAttribute('open')) === null) {
    await evidencia.locator(':scope > summary').click();
    await page.locator('#lente-painel-titulo').focus();
  }
}
