// Contraste WCAG dos pares de cor declarados em src/estilos/tokens.css, nos temas claro e escuro (DESIGN.md, ciclo 007, referência V13).
// Texto informativo ≥ 4,5:1; pistas de controles, estados e gráficos necessários ≥ 3:1. Cada par é uma superfície real
// de uso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(import.meta.dirname, '../../src/estilos/tokens.css'), 'utf8');
// Tema claro em :root; o escuro sobrescreve em :root[data-tema='escuro'] (referência V13).
const bloco = (seletor) => css.slice(css.indexOf(seletor), css.indexOf('}', css.indexOf(seletor)));
const ler = (texto) => Object.fromEntries([...texto.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]]));
const claro = ler(bloco(':root {'));
const TEMAS = { claro, escuro: { ...claro, ...ler(bloco(":root[data-tema='escuro']")) } };

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const TEXTO = [
  ['texto', 'superficie'], ['texto', 'fundo'], ['texto', 'superficie-suave'], ['texto', 'escolha-suave'], ['texto', 'linha-selecionada'],
  ['texto-suave', 'superficie'], ['texto-suave', 'fundo'], ['texto-suave', 'superficie-suave'],
  ['sobre-escolha', 'escolha'], ['identidade', 'superficie'], ['link', 'superficie'], ['link', 'superficie-suave'], ['link', 'escolha-suave'],
  ['aviso-borda', 'superficie'],
  ['erro', 'superficie'], ['aviso-texto', 'aviso-fundo'],
  ['classe-lacuna', 'superficie'], ['classe-indeterminada', 'superficie'], ['classe-sem-evidencia', 'superficie'],
];
const PISTAS = [
  ['contorno', 'superficie'], ['contorno', 'fundo'], ['escolha', 'superficie'], ['escolha', 'escolha-suave'],
  ['foco', 'superficie'], ['foco', 'fundo'], ['selecao-amostra', 'superficie'],
  ['selecao-mapa', 'mapa-fundo'], ['deteccao', 'mapa-fundo'], ['limite', 'mapa-fundo'], ['destaque', 'mapa-fundo'],
  ['deteccao-escura', 'superficie'], ['classe-lacuna', 'superficie'],
  ['classe-indeterminada', 'superficie'], ['classe-sem-evidencia', 'superficie'], ['aviso-borda', 'aviso-fundo'],
  ['area-integral', 'mapa-fundo'], ['area-sustentavel', 'mapa-fundo'], ['area-indigena', 'mapa-fundo'],
];

for (const [tema, tokens] of Object.entries(TEMAS)) {
  const t = (nome) => { assert.ok(tokens[nome], `token --${nome} existe no tema ${tema}`); return tokens[nome]; };
  for (const [fg, bg] of TEXTO) {
    test(`${tema}: texto --${fg} sobre --${bg} ≥ 4,5:1`, () => {
      const r = razao(t(fg), t(bg));
      assert.ok(r >= 4.5, `${r.toFixed(2)}:1`);
    });
  }
  for (const [fg, bg] of PISTAS) {
    test(`${tema}: pista --${fg} sobre --${bg} ≥ 3:1`, () => {
      const r = razao(t(fg), t(bg));
      assert.ok(r >= 3, `${r.toFixed(2)}:1`);
    });
  }
}

test('o tema escuro redefine as cores com tema e herda as do mapa', () => {
  assert.ok(Object.keys(TEMAS.claro).length >= 30);
  for (const k of ['fundo', 'superficie', 'texto', 'escolha', 'contorno']) assert.notEqual(TEMAS.claro[k], TEMAS.escuro[k], k);
  for (const k of ['mapa-fundo', 'deteccao', 'destaque']) assert.equal(TEMAS.claro[k], TEMAS.escuro[k], k);
});

// Exceção decidida pelo responsável em 2026-11-14 ("mantenha o laranja da V13"): as barras da série usam o laranja da
// detecção, abaixo de 3:1 sobre o fundo claro; a série tem a tabela "Ver a série como tabela" como alternativa em texto.
test('barras da série: laranja da V13, igual à detecção (exceção registrada no DESIGN.md)', () => {
  for (const t of Object.values(TEMAS)) {
    assert.equal(t.barra, '#f97316');
    assert.equal(t.barra, t.deteccao);
    assert.ok(razao(t.barra, t.superficie) >= 2.5);
  }
});

test('nenhuma cor literal fora dos tokens nas folhas de componentes e layout', () => {
  for (const f of ['componentes.css', 'layout.css', 'mapa.css', 'base.css']) {
    const texto = readFileSync(path.resolve(import.meta.dirname, '../../src/estilos', f), 'utf8');
    assert.deepEqual(texto.match(/#[0-9a-f]{3,6}\b/gi) ?? [], [], f);
  }
});

test('escala de cinza (tema claro): preenchimento do primário e superfície do secundário bem distintos', () => {
  const t = TEMAS.claro;
  const cinza = (hex) => { const [r, g, b] = rgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b; };
  assert.ok(cinza(t.superficie) - cinza(t.escolha) > 120);
  assert.ok(razao(t.escolha, t.superficie) >= 4.5);
});

test('mapa: as cores de src/mapa.ts são as mesmas dos tokens (áreas, detecção, limite, destaque, seleção)', () => {
  const mapa = readFileSync(path.resolve(import.meta.dirname, '../../src/mapa.ts'), 'utf8');
  const t = TEMAS.claro;
  const cor = (classe) => new RegExp(`${classe}: \\{ cor: '(#[0-9a-f]{6})'`, 'i').exec(mapa)?.[1];
  assert.equal(cor('protecao_integral'), t['area-integral']);
  assert.equal(cor('uso_sustentavel'), t['area-sustentavel']);
  assert.equal(cor('terra_indigena'), t['area-indigena']);
  const constante = (nome) => new RegExp(`const ${nome} = '(#[0-9a-f]{6})'`, 'i').exec(mapa)?.[1];
  assert.equal(constante('COR_DETECCAO'), t.deteccao);
  assert.equal(constante('COR_LIMITE'), t.limite);
  assert.equal(constante('COR_SELECAO'), t['selecao-mapa']);
  assert.equal(constante('COR_DESTAQUE'), t.destaque);
});
