// Coluna de resultado e memória de recortes (plano 007, item 2): CM-1, CM-2 (parte dos itens 2 e 3), CM-5, CM-6 e
// T6. Dados fictícios escritos à mão; os valores esperados vêm do plano, não do código. Grade T1: índice = piso de
// coordenada × 20 (células de 0,05°).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chaveRecorte, MAX_RECORTES, MemoriaRecortes } from '../../src/memoria.ts';
import { celulasDistintas, linhaCelulasDestacadas, listaMunicipios, numerosMunicipio } from '../../src/municipios.ts';
import { lerRegistros, LIMITE_PAGINA } from '../../src/lentes/carregar.ts';
import { recorrencia } from '../../src/lentes/recorrencia.ts';
import { persistencia } from '../../src/lentes/persistencia.ts';
import { combinar } from '../../src/lentes/combinacao.ts';

const A = 9100001;
const B = 9100002;
const reg = (id, municipio, instante, latitude, longitude) => ({ id_tecnico: id, data_hora_gmt: instante, latitude, longitude, municipio_codigo: municipio });

test('CM-1: cartão com 5 focos em 3 dias e 4 células; o foco fora do período e o de outro município não contam', () => {
  // Células: lat −11,52 → −231; −11,48 → −230; −11,42 → −229; −11,38 → −228 (mesma longitude −56,48).
  const registros = [
    reg('a1', A, '2026-10-01T03:00:00Z', -11.52, -56.48),
    reg('a2', A, '2026-10-01T15:00:00Z', -11.52, -56.48),
    reg('a3', A, '2026-10-05T12:00:00Z', -11.48, -56.48),
    reg('a4', A, '2026-10-09T12:00:00Z', -11.42, -56.48),
    reg('a5', A, '2026-10-09T18:00:00Z', -11.38, -56.48),
    reg('fora', A, '2026-11-01T00:30:00Z', -11.32, -56.48),
    reg('outro', B, '2026-10-02T12:00:00Z', -11.27, -56.48),
  ];
  const resumo = {
    municipio: A, periodo: { inicio: '2026-10-01', fim: '2026-10-31' },
    principal: { total: 5, serie_diaria: [{ dia: '2026-10-01', total: 2 }, { dia: '2026-10-02', total: 0 }, { dia: '2026-10-05', total: 1 }, { dia: '2026-10-09', total: 2 }] },
  };
  assert.deepEqual(numerosMunicipio(resumo, registros), { focos: 5, dias: 3, celulas: 4 });
  assert.deepEqual(numerosMunicipio(resumo, null), { focos: 5, dias: 3, celulas: null }, 'leitura ainda em curso');
});

test('CM-2 (itens 2 e 3): com município e lente por célula, "—" e "lente calculada em todo Mato Grosso"; sem lente, "—"', () => {
  const recorrencia = { unidade: 'celula', recorte: 'estado', celulas: ['c-231_-1130', 'c-230_-1130', 'c-229_-1130'] };
  assert.deepEqual(linhaCelulasDestacadas(recorrencia), { valor: '—', nota: 'lente calculada em todo Mato Grosso' });
  assert.deepEqual(linhaCelulasDestacadas(null), { valor: '—', nota: null });
});

// Item 4 (plano 007): a lente usa o recorte do município, e a linha passa a contar células distintas destacadas.
const JANELA_M = { inicio: '2026-01-01', fim: '2026-08-31' };
const entradaMunicipal = (registros) => ({
  carga: { id: 7, identidade: 'm'.repeat(64) }, janela: JANELA_M, registros, totalResumo: registros.length,
  nomes: new Map([[A, 'Alfa']]), recorte: { tipo: 'municipio', municipio: A },
});
const ativosDe = (r) => ({
  unidade: 'celula', recorte: r.recorte.tipo,
  celulas: celulasDistintas((r.destaques ?? r.celulas).map((d) => d.unidade.id)),
});

test('CM-2 (item 4): recorrência no recorte municipal com 3 células destacadas — "Células destacadas: 3"; sem lente, "—"', () => {
  const registros = [-11.52, -11.48, -11.42].flatMap((lat, i) => ['01', '03', '05'].map((mes) =>
    reg(`r${i}-${mes}`, A, `2026-${mes}-1${i}T12:00:00Z`, lat, -56.48)));
  registros.sort((x, y) => x.data_hora_gmt.localeCompare(y.data_hora_gmt));
  const r = recorrencia(entradaMunicipal(registros));
  assert.equal(r.destaques.length, 3);
  assert.deepEqual(linhaCelulasDestacadas(ativosDe(r)), { valor: '3', nota: null });
  assert.deepEqual(linhaCelulasDestacadas(null), { valor: '—', nota: null });
});

test('CM-3 (item 4): persistência com duas sequências na mesma célula e uma em outra — "Células destacadas: 2"', () => {
  const dias = (prefixo, lat, lista) => lista.map((d) => reg(`${prefixo}${d}`, A, `2026-08-${d}T12:00:00Z`, lat, -56.48));
  const registros = [...dias('x', -11.52, ['01', '02', '03', '10', '11', '12']), ...dias('y', -11.42, ['20', '21', '22'])];
  registros.sort((x, y) => x.data_hora_gmt.localeCompare(y.data_hora_gmt));
  const r = persistencia(entradaMunicipal(registros));
  assert.equal(r.destaques.length, 3, 'três sequências');
  assert.deepEqual(linhaCelulasDestacadas(ativosDe(r)), { valor: '2', nota: null });
});

test('CM-4 (item 4): combinação recorrência e persistência, "ou", com 3 células — "Células destacadas: 3"', () => {
  const registros = [
    // Célula 1: recorrência (jan, mar, mai).
    ...['01', '03', '05'].map((m) => reg(`a${m}`, A, `2026-${m}-15T12:00:00Z`, -11.52, -56.48)),
    // Células 2 e 3: persistência (3 dias seguidos cada).
    ...['10', '11', '12'].map((d) => reg(`b${d}`, A, `2026-08-${d}T12:00:00Z`, -11.42, -56.48)),
    ...['20', '21', '22'].map((d) => reg(`c${d}`, A, `2026-08-${d}T12:00:00Z`, -11.32, -56.48)),
  ].sort((x, y) => x.data_hora_gmt.localeCompare(y.data_hora_gmt));
  const r = combinar(entradaMunicipal(registros), ['recorrencia', 'persistencia'], 'ou');
  assert.equal(r.celulas.length, 3);
  assert.deepEqual(linhaCelulasDestacadas(ativosDe(r)), { valor: '3', nota: null });
});

test('CM-6: concentração ativa — o cartão não mostra a linha; a ordenação traz os destacados primeiro, na ordem D16', () => {
  const ativos = { unidade: 'municipio', municipios: [B, A] };
  assert.equal(linhaCelulasDestacadas(ativos), null);
  const C = 9100003;
  const porMunicipio = [
    { codigo: A, nome: 'Alfa', total: 30 }, { codigo: B, nome: 'Beta', total: 30 }, { codigo: C, nome: 'Gama', total: 50 },
  ];
  // Ordem D16 do resultado: B antes de A (empate desfeito pelo resultado, não pela aba); Gama não destacado vem depois.
  const linhas = listaMunicipios(porMunicipio, 'destaques', ativos, []);
  assert.deepEqual(linhas.map((l) => [l.codigo, l.destacado]), [[B, true], [A, true], [C, false]]);
  assert.deepEqual(listaMunicipios(porMunicipio, 'deteccoes', ativos, []).map((l) => l.codigo), [C, A, B]);
});

test('CM-5: uma célula destacada conta em cada município com detecção nela — A 3, B 1', () => {
  // X cruza A e B, com detecções dos dois; Y cruza A e B, com detecções só de A; Z só em A. Células por índice.
  const registros = [
    reg('x1', A, '2026-10-01T12:00:00Z', -11.48, -55.99), reg('x2', B, '2026-10-02T12:00:00Z', -11.48, -55.96),
    reg('y1', A, '2026-10-03T12:00:00Z', -11.52, -55.99),
    reg('z1', A, '2026-10-04T12:00:00Z', -11.62, -56.48),
    reg('w1', B, '2026-10-05T12:00:00Z', -11.70, -55.50), // célula não destacada
  ];
  const id = (lat, lon) => `c${Math.floor(lat * 20)}_${Math.floor(lon * 20)}`;
  const ativos = { unidade: 'celula', recorte: 'estado', celulas: celulasDistintas([id(-11.48, -55.99), id(-11.52, -55.99), id(-11.62, -56.48), id(-11.62, -56.48)]) };
  assert.equal(ativos.celulas.length, 3, 'duas sequências na mesma célula contam 1');
  const porMunicipio = [{ codigo: A, nome: 'Alfa', total: 4 }, { codigo: B, nome: 'Beta', total: 9 }];
  const linhas = listaMunicipios(porMunicipio, 'destaques', ativos, registros);
  assert.deepEqual(linhas.map((l) => [l.codigo, l.celulas]), [[A, 3], [B, 1]]);
  assert.deepEqual(listaMunicipios(porMunicipio, 'nome', ativos, registros).map((l) => l.nome), ['Alfa', 'Beta']);
  // Sem lente, "destaques" cai para a ordem por detecções.
  assert.deepEqual(listaMunicipios(porMunicipio, 'destaques', null, registros).map((l) => [l.codigo, l.celulas]), [[B, null], [A, null]]);
});

test('T6: memória de até 3 recortes, chave com sessão e município, o mais antigo sai e obter renova', () => {
  assert.equal(MAX_RECORTES, 3);
  const m = new MemoriaRecortes();
  const r = (municipio, inicio = '2026-10-01') => ({ carga: 7, inicio, fim: '2026-10-31', municipio });
  const k = (municipio, inicio) => chaveRecorte(1, r(municipio, inicio));
  assert.notEqual(chaveRecorte(1, r(null)), chaveRecorte(2, r(null)), 'outra sessão, outra chave');
  assert.notEqual(chaveRecorte(1, r(null)), chaveRecorte(1, r(A)), 'estado e município são recortes distintos');
  for (const x of [null, A, B]) m.guardar({ chave: k(x), registros: [], totalResumo: 0, disponibilidade: new Map() });
  assert.ok(m.obter(k(null)), 'renova o estado');
  m.guardar({ chave: k(null, '2026-10-02'), registros: [], totalResumo: 0, disponibilidade: new Map() });
  assert.equal(m.obter(k(A)), null, 'A, o mais antigo depois da renovação, saiu');
  assert.deepEqual(m.chaves.length, 3);
  m.limpar();
  assert.equal(m.obter(k(null)), null);
});

/** Fontes fictícias contando chamadas: resumo e páginas de um recorte com `total` registros. */
function fontes(total, municipio = null) {
  const chamadas = { resumo: 0, paginas: 0 };
  const carga = { id: 7 };
  const periodo = { inicio: '2026-10-01', fim: '2026-10-31' };
  const registros = Array.from({ length: total }, (_, i) => ({
    ...reg(`r${String(i).padStart(5, '0')}`, municipio ?? A, `2026-10-${String(1 + Math.floor(i / 40)).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00Z`, -11.5, -56.5),
  })).sort((a, b) => a.data_hora_gmt.localeCompare(b.data_hora_gmt));
  return {
    chamadas,
    resumo: async () => { chamadas.resumo += 1; return { carga, periodo, municipio, principal: { total } }; },
    pagina: async (f, limite, deslocamento) => {
      chamadas.paginas += 1;
      return { carga, periodo, municipio: f.municipio, total, limite, deslocamento, registros: registros.slice(deslocamento, deslocamento + limite) };
    },
    disponibilidade: async () => { throw new Error('não usada'); },
  };
}

test('PG-1 (leitor) e T6: 1.001 registros em 2 páginas; a releitura com a memória relê só o resumo', async () => {
  const f = fontes(1001, A);
  const pedido = { carga: 7, janela: { inicio: '2026-10-01', fim: '2026-10-31' }, municipio: A };
  const lido = await lerRegistros(f, pedido, () => true);
  assert.equal(lido.registros.length, 1001);
  assert.deepEqual(f.chamadas, { resumo: 1, paginas: Math.ceil(1001 / LIMITE_PAGINA) });
  const de_novo = await lerRegistros(f, pedido, () => true, () => {}, lido);
  assert.equal(de_novo.reaproveitado, true);
  assert.deepEqual(f.chamadas, { resumo: 2, paginas: 2 }, 'zero páginas relidas, um resumo relido');
});

test('T6: resposta de uma geração antiga não entra (lerRegistros devolve null)', async () => {
  const f = fontes(3);
  let atual = true;
  const pedido = { carga: 7, janela: { inicio: '2026-10-01', fim: '2026-10-31' } };
  const p = lerRegistros({ ...f, resumo: async (x) => { const r = await f.resumo(x); atual = false; return r; } }, pedido, () => atual);
  assert.equal(await p, null);
});

test('RC-12 (cálculo): 12 municípios com o 9º e o 10º empatados com o 11º — 11 destacados e a observação de empate', async () => {
  const { concentracao } = await import('../../src/lentes/concentracao.ts');
  // Contagens fictícias: 12, 11, 10, 9, 8, 7, 6, 5, 4, 4, 4 e 1 (9º, 10º e 11º com 4).
  const contagens = [12, 11, 10, 9, 8, 7, 6, 5, 4, 4, 4, 1];
  const registros = contagens.flatMap((n, m) => Array.from({ length: n }, (_, i) => reg(`m${m}:${i}`, 9200000 + m, `2026-10-${String(1 + i).padStart(2, '0')}T12:00:00Z`, -12.5, -56.5)));
  const nomes = new Map(contagens.map((_, m) => [9200000 + m, `Município ${String(m + 1).padStart(2, '0')}`]));
  const r = concentracao({ carga: { id: 7, identidade: 'f'.repeat(64) }, janela: { inicio: '2026-10-01', fim: '2026-10-31' }, registros, totalResumo: registros.length, nomes });
  assert.equal(r.destaques.length, 11);
  assert.deepEqual(r.observacoes, ['11 municípios por empate no 10º lugar.']);
  assert.deepEqual(r.destaques.map((d) => d.evidencia.valor), [12, 11, 10, 9, 8, 7, 6, 5, 4, 4, 4]);
});
