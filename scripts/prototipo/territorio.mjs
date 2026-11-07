// Malha municipal para classificação (IBGE v4, qualidade máxima). Reutiliza a semântica do ciclo 001 (geo.mjs):
// interior/exterior dos anéis, buracos e borda incluída; coordenadas originais, sem tolerância.
import { classificarPonto, criarTerritorio } from '../prova-dados/geo.mjs';

export function criarMalhaMunicipal(colecao, campoCodigo = 'codarea') {
  if (colecao?.type !== 'FeatureCollection') throw new Error('Malha municipal deve ser FeatureCollection.');
  const municipios = colecao.features.map((f) => {
    const codigo = String(f.properties?.[campoCodigo] ?? '');
    if (!/^\d{7}$/.test(codigo)) throw new Error(`Código municipal inválido na malha: "${codigo}"`);
    return { codigo, territorio: criarTerritorio(f) };
  });
  const codigos = new Set(municipios.map((m) => m.codigo));
  if (codigos.size !== municipios.length) throw new Error('Código municipal repetido na malha.');
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  for (const { territorio: t } of municipios) {
    bbox[0] = Math.min(bbox[0], t.bbox[0]);
    bbox[1] = Math.min(bbox[1], t.bbox[1]);
    bbox[2] = Math.max(bbox[2], t.bbox[2]);
    bbox[3] = Math.max(bbox[3], t.bbox[3]);
  }
  return { municipios, bbox };
}

// Todos os municípios cujo polígono contém o ponto (dentro ou na borda). Nunca escolhe entre mais de um.
export function localizar(malha, lon, lat) {
  const [oeste, sul, leste, norte] = malha.bbox;
  if (lon < oeste || lon > leste || lat < sul || lat > norte) return [];
  const achados = [];
  for (const m of malha.municipios) {
    const posicao = classificarPonto(lon, lat, m.territorio);
    if (posicao !== 'fora') achados.push({ codigo: m.codigo, posicao });
  }
  return achados;
}

// Resultado territorial de um ponto: 'municipio' (único), 'ambiguo' (mais de um) ou 'fora'.
export function atribuir(malha, lon, lat) {
  const achados = localizar(malha, lon, lat);
  if (achados.length === 0) return { tipo: 'fora' };
  if (achados.length === 1) return { tipo: 'municipio', ...achados[0] };
  return { tipo: 'ambiguo', municipios: achados };
}
