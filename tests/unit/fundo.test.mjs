// Mapa-base (plano 007, item 5, T12; ADR-010): chave do build, fundo inicial, modelos de URL e contagem de falhas.
// Nenhuma chave real: só valores fictícios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ContadorFalhas, fundoInicial, HOST_IMAGEM, HOST_NOMES, LIMITE_ERROS_SEGUIDOS, lerChaveEsri, POLITICA_REFERENCIA,
  URL_IMAGEM, URL_NOMES,
} from '../../src/fundo.ts';

test('sem chave (ausente, vazia ou só espaços): satélite indisponível e "Sem fundo" padrão', () => {
  for (const env of [{}, { VITE_ESRI_CHAVE: '' }, { VITE_ESRI_CHAVE: '   ' }]) {
    assert.equal(lerChaveEsri(env), null);
    assert.equal(fundoInicial(lerChaveEsri(env)), 'nenhum');
  }
  assert.equal(lerChaveEsri({ VITE_ESRI_CHAVE: ' ficticia ' }), 'ficticia');
  assert.equal(fundoInicial('ficticia'), 'satelite');
});

test('URLs só nos dois hosts previstos, em HTTPS, com o token na consulta e ordem z/y/x', () => {
  assert.equal(new URL(URL_IMAGEM.replace(/[{}]/g, '')).host, HOST_IMAGEM);
  assert.equal(new URL(URL_NOMES.replace(/[{}]/g, '')).host, HOST_NOMES);
  assert.match(URL_IMAGEM, /^https:\/\/ibasemaps-api\.arcgis\.com\/arcgis\/rest\/services\/World_Imagery\/MapServer\/tile\/\{z\}\/\{y\}\/\{x\}\?token=\{token\}$/);
  assert.match(URL_NOMES, /^https:\/\/static-map-tiles-api\.arcgis\.com\/arcgis\/rest\/services\/static-basemap-tiles-service\/v1\/arcgis\/imagery\/labels\/static\/tile\/\{z\}\/\{y\}\/\{x\}\?token=\{token\}$/);
  assert.equal(POLITICA_REFERENCIA, 'strict-origin-when-cross-origin');
});

test('falhas: avisa uma vez ao atingir o limite de erros seguidos; tile carregado ou nova vista zeram', () => {
  const c = new ContadorFalhas();
  for (let i = 1; i < LIMITE_ERROS_SEGUIDOS; i++) assert.equal(c.erro(), false);
  c.carregou();
  for (let i = 1; i < LIMITE_ERROS_SEGUIDOS; i++) assert.equal(c.erro(), false, 'um tile carregado zera a sequência');
  assert.equal(c.erro(), true, 'o erro que atinge o limite avisa');
  assert.equal(c.erro(), false, 'só uma vez');
  c.zerar();
  for (let i = 1; i < LIMITE_ERROS_SEGUIDOS; i++) assert.equal(c.erro(), false);
  assert.equal(c.erro(), true, 'nova vista recomeça a contagem');
});
