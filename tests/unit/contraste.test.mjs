// Contraste WCAG dos pares de cor declarados em src/estilos/tokens.css. Texto informativo ≥ 4,5:1;
// pistas de controles, estados e gráficos necessários ≥ 3:1. Cada par é uma superfície real de uso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(import.meta.dirname, '../../src/estilos/tokens.css'), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]]));

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const t = (nome) => { assert.ok(tokens[nome], `token --${nome} existe`); return tokens[nome]; };

const TEXTO = [
  ['texto', 'superficie'], ['texto', 'fundo'], ['texto', 'superficie-suave'],
  ['texto-suave', 'superficie'], ['texto-suave', 'fundo'], ['texto-suave', 'superficie-suave'],
  ['sobre-acento', 'acento'], ['sobre-identidade', 'identidade'], ['identidade', 'superficie'],
  ['acento', 'superficie'], ['erro', 'superficie'], ['aviso-texto', 'aviso-fundo'],
  ['classe-lacuna', 'superficie'], ['classe-indeterminada', 'superficie'], ['classe-sem-evidencia', 'superficie'],
];
const PISTAS = [
  ['contorno', 'superficie'], ['contorno', 'fundo'], ['acento', 'superficie'], ['foco', 'superficie'],
  ['acento-claro', 'mapa-fundo'], ['deteccao', 'mapa-fundo'], ['limite', 'mapa-fundo'],
  ['barra', 'superficie-suave'], ['deteccao-escura', 'superficie'], ['classe-lacuna', 'superficie'],
  ['classe-indeterminada', 'superficie'], ['classe-sem-evidencia', 'superficie'], ['aviso-borda', 'aviso-fundo'],
  ['area-integral', 'mapa-fundo'], ['area-sustentavel', 'mapa-fundo'], ['area-indigena', 'mapa-fundo'],
];

for (const [fg, bg] of TEXTO) {
  test(`texto --${fg} sobre --${bg} ≥ 4,5:1`, () => {
    const r = razao(t(fg), t(bg));
    assert.ok(r >= 4.5, `${r.toFixed(2)}:1`);
  });
}
for (const [fg, bg] of PISTAS) {
  test(`pista --${fg} sobre --${bg} ≥ 3:1`, () => {
    const r = razao(t(fg), t(bg));
    assert.ok(r >= 3, `${r.toFixed(2)}:1`);
  });
}

test('foco no cabeçalho (--foco redefinido em .topo) ≥ 3:1 sobre a identidade', () => {
  const topo = readFileSync(path.resolve(import.meta.dirname, '../../src/estilos/layout.css'), 'utf8');
  const foco = /--foco:\s*(#[0-9a-f]{6})/i.exec(topo)?.[1];
  assert.ok(foco);
  assert.ok(razao(foco, t('identidade')) >= 3);
});

test('linha selecionada da tabela mantém o texto legível', () => {
  const comp = readFileSync(path.resolve(import.meta.dirname, '../../src/estilos/componentes.css'), 'utf8');
  const fundo = /tr\.selecionada td \{\s*background:\s*(#[0-9a-f]{6})/i.exec(comp)?.[1];
  assert.ok(fundo);
  assert.ok(razao(t('texto'), fundo) >= 4.5);
});

test('escala de cinza: preenchimento do primário e superfície do secundário bem distintos', () => {
  const cinza = (hex) => { const [r, g, b] = rgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b; };
  assert.ok(cinza(t('superficie')) - cinza(t('acento')) > 120);
  assert.ok(razao(t('acento'), t('superficie')) >= 4.5);
});

test('áreas protegidas: as cores do mapa (ESTILO_AREA) são as mesmas dos tokens --area-*', () => {
  const mapa = readFileSync(path.resolve(import.meta.dirname, '../../src/mapa.ts'), 'utf8');
  const cor = (classe) => new RegExp(`${classe}: \{ cor: '(#[0-9a-f]{6})'`, 'i').exec(mapa)?.[1];
  assert.equal(cor('protecao_integral'), t('area-integral'));
  assert.equal(cor('uso_sustentavel'), t('area-sustentavel'));
  assert.equal(cor('terra_indigena'), t('area-indigena'));
});
