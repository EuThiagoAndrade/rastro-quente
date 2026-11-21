import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distribuicaoTemporal } from '../../servidor/distribuicao-temporal.ts';

test('distribuição GMT preserva todos os empates e totais completos', () => {
  const registros = ['2026-08-01', '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-03'].map((dia) => ({ data_hora_gmt: `${dia}T12:00:00Z` }));
  assert.deepEqual(distribuicaoTemporal(registros), {
    total: 5, dias_com_deteccao: 3,
    dias: { totais: [{ periodo: '2026-08-01', total: 2 }, { periodo: '2026-08-02', total: 1 }, { periodo: '2026-08-03', total: 2 }], maximo: 2, periodos_maximos: ['2026-08-01', '2026-08-03'] },
    meses: { totais: [{ periodo: '2026-08', total: 5 }], maximo: 5, periodos_maximos: ['2026-08'] },
  });
});

test('sem registros não inventa períodos máximos', () => {
  const resultado = distribuicaoTemporal([]);
  assert.equal(resultado.dias_com_deteccao, 0);
  assert.deepEqual(resultado.dias.periodos_maximos, []);
  assert.deepEqual(resultado.meses.periodos_maximos, []);
});
