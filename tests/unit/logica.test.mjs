// Lógica pura da interface (src/*.ts importado direto: o Node 24 remove os tipos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classificarErro } from '../../src/erros.ts';
import { fmtDataHoraGmt, fmtDiferenca, humanizar, primeiroDiaGmt, ultimoDiaGmt } from '../../src/formato.ts';
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
