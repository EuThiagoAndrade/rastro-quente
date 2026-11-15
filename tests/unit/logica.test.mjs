// Lógica pura da interface (src/*.ts importado direto: o Node 24 remove os tipos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classificarErro } from '../../src/erros.ts';
import { fmtDataHoraGmt, fmtDiferenca, humanizar, larguraProporcional, primeiroDiaGmt, ultimoDiaGmt } from '../../src/formato.ts';
import { lerConfiguracao } from '../../src/config.ts';

test('classificarErro: o contrato vale mais que o status HTTP', () => {
  assert.equal(classificarErro({ message: 'acesso_negado', code: '42501' }, 403), 'acesso_negado');
  assert.equal(classificarErro({ message: 'JWT expired', code: 'PGRST301' }, 401), 'sessao_expirada');
  assert.equal(classificarErro({ message: 'carga_indisponivel', code: 'P0002' }, 500), 'versao_substituida');
  assert.equal(classificarErro({ message: 'sem_publicacao', code: 'P0002' }, 500), 'sem_publicacao');
  assert.equal(classificarErro({ message: 'periodo_fora_da_janela', code: '22023' }, 400), 'entrada_invalida');
  assert.equal(classificarErro({ message: 'x' }, 503), 'fonte_indisponivel');
  assert.equal(classificarErro({ message: 'Failed to fetch' }, 0), 'fonte_indisponivel');
  assert.equal(classificarErro(null, 500), 'fonte_indisponivel');
});

test('datas GMT e diferença com sinal', () => {
  assert.equal(fmtDataHoraGmt('2026-10-15T18:00:00Z'), '2026-10-15 18:00 GMT');
  assert.equal(fmtDiferenca(2), '+2');
  assert.equal(fmtDiferenca(-3), '−3');
  assert.equal(fmtDiferenca(0), '0');
  assert.equal(primeiroDiaGmt('2026-10-01T00:00:00Z'), '2026-10-01');
  assert.equal(ultimoDiaGmt('2026-11-01T00:00:00Z'), '2026-10-31');
  assert.equal(ultimoDiaGmt('2028-03-01T00:00:00Z'), '2028-02-29', 'ano bissexto');
  assert.equal(humanizar('historico_ausente_ou_incompleto'), 'historico ausente ou incompleto');
});

test('configuração: só HTTPS fora do loopback; login por senha só no loopback', () => {
  assert.equal(lerConfiguracao({}), null);
  assert.equal(lerConfiguracao({ VITE_SUPABASE_URL: 'https://x.supabase.co' }), null);
  assert.equal(lerConfiguracao({ VITE_SUPABASE_URL: 'http://exemplo.test', VITE_SUPABASE_CHAVE_PUBLICAVEL: 'k' }), null);
  assert.equal(lerConfiguracao({ VITE_SUPABASE_URL: 'não é url', VITE_SUPABASE_CHAVE_PUBLICAVEL: 'k' }), null);
  const prod = lerConfiguracao({ VITE_SUPABASE_URL: 'https://x.supabase.co/', VITE_SUPABASE_CHAVE_PUBLICAVEL: 'k', VITE_AUTH_SENHA_LOCAL: 'true' });
  assert.deepEqual(prod, { urlSupabase: 'https://x.supabase.co', chavePublicavel: 'k', senhaLocal: false });
  const local = lerConfiguracao({ VITE_SUPABASE_URL: 'http://127.0.0.1:55321', VITE_SUPABASE_CHAVE_PUBLICAVEL: 'k', VITE_AUTH_SENHA_LOCAL: 'true' });
  assert.equal(local?.senhaLocal, true);
});

// Ciclo 007, issue #60 — recorte aplicado (T16): validação do período e atalhos de meses da referência V13.
import { atalhoDoPeriodo, periodoDoAtalho, resumoPeriodo, textoRecorte, validarPeriodo } from '../../src/recorte.ts';

const JANELA_ANO = { inicio: '2025-11-01', fim: '2026-10-31' };

test('T16: período inválido não é aplicado; válido dentro da janela é', () => {
  assert.equal(validarPeriodo('', '2026-10-31', JANELA_ANO), 'Informe o início e o fim do período (dias GMT).');
  assert.equal(validarPeriodo('2026-10-20', '2026-10-10', JANELA_ANO), 'O início do período não pode ser depois do fim.');
  assert.match(validarPeriodo('2025-10-31', '2026-10-31', JANELA_ANO), /dentro da janela da versão: 2025-11-01 a 2026-10-31/);
  assert.match(validarPeriodo('2026-01-01', '2026-11-01', JANELA_ANO), /dentro da janela/);
  assert.equal(validarPeriodo('2026-10-31', '2026-10-31', JANELA_ANO), null);
  assert.equal(validarPeriodo('2025-11-01', '2026-10-31', JANELA_ANO), null);
});

test('T16: atalhos em meses de calendário até o mês do fim da janela, cortados no início dela', () => {
  assert.deepEqual(periodoDoAtalho('ano', JANELA_ANO), JANELA_ANO);
  assert.deepEqual(periodoDoAtalho('u6', JANELA_ANO), { inicio: '2026-05-01', fim: '2026-10-31' });
  assert.deepEqual(periodoDoAtalho('u3', JANELA_ANO), { inicio: '2026-08-01', fim: '2026-10-31' });
  assert.deepEqual(periodoDoAtalho('u1', JANELA_ANO), { inicio: '2026-10-01', fim: '2026-10-31' });
  // Virada de ano em GMT, sem fuso local.
  assert.deepEqual(periodoDoAtalho('u3', { inicio: '2025-01-01', fim: '2026-01-15' }), { inicio: '2025-11-01', fim: '2026-01-15' });
  // Janela curta: o atalho não sai dela.
  assert.deepEqual(periodoDoAtalho('u6', { inicio: '2026-09-01', fim: '2026-09-01' }), { inicio: '2026-09-01', fim: '2026-09-01' });
});

test('T16: atalho reconhecido, resumo do período e texto do recorte aplicado', () => {
  assert.equal(atalhoDoPeriodo(JANELA_ANO, JANELA_ANO), 'ano');
  assert.equal(atalhoDoPeriodo({ inicio: '2026-08-01', fim: '2026-10-31' }, JANELA_ANO), 'u3');
  assert.equal(atalhoDoPeriodo({ inicio: '2026-08-02', fim: '2026-10-31' }, JANELA_ANO), null);
  assert.equal(resumoPeriodo(JANELA_ANO), '01/11/2025 a 31/10/2026 · 365 dias GMT');
  assert.equal(resumoPeriodo({ inicio: '2026-10-31', fim: '2026-10-31' }), '31/10/2026 a 31/10/2026 · 1 dia GMT');
  assert.equal(textoRecorte({ inicio: '2026-10-01', fim: '2026-10-31' }, null), 'Todo Mato Grosso · 2026-10-01 a 2026-10-31');
  assert.equal(textoRecorte({ inicio: '2026-10-01', fim: '2026-10-31' }, 'Município Alfa'), 'Município Alfa · 2026-10-01 a 2026-10-31');
});

test('barra da aba Municípios: proporção exata, sem mínimo, e zero sem barra (issue #71, R1-2)', () => {
  assert.equal(larguraProporcional(901, 901), 100);
  assert.ok(Math.abs(larguraProporcional(1, 901) - 100 / 901) < 1e-9);
  assert.ok(Math.abs(larguraProporcional(27, 901) - 2700 / 901) < 1e-9);
  assert.notEqual(larguraProporcional(1, 901), larguraProporcional(27, 901));
  assert.equal(larguraProporcional(0, 901), null);
  assert.equal(larguraProporcional(0, 0), null);
  assert.equal(larguraProporcional(30, 60), 50);
});
