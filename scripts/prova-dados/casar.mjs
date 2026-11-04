// Caracteriza as diferenças entre INPE (VIIRS) e FIRMS casando registros por data, hhmm UTC e coordenadas (3 casas, ~110 m).
// Não explica a causa: só mostra onde e quando as séries diferem. Saída: local/prova-dados/saidas/casamento.json.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { serializar } from './contar.mjs';
import { lerFirms } from './firms.mjs';
import { lerFocos } from './focos.mjs';
import { classificarPonto, criarTerritorio } from './geo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

export const chaveDe = (data, hhmm, lat, lon) => `${data}|${hhmm}|${lat.toFixed(3)}|${lon.toFixed(3)}`;

const contar = (chaves) => chaves.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map());

// Casa por multiconjunto: uma chave repetida casa tantas vezes quantas aparecer nos dois lados.
export function casar(chavesA, chavesB) {
  const a = contar(chavesA);
  const b = contar(chavesB);
  let casados = 0;
  const soA = [];
  const soB = [];
  for (const [k, n] of a) {
    const m = b.get(k) ?? 0;
    casados += Math.min(n, m);
    for (let i = 0; i < n - m; i += 1) soA.push(k);
  }
  for (const [k, n] of b) for (let i = 0; i < n - (a.get(k) ?? 0); i += 1) soB.push(k);
  return { casados, soA: soA.sort(), soB: soB.sort() };
}

const agrupar = (chaves, tamanho) => chaves.reduce((m, k) => { const g = k.slice(0, tamanho); m[g] = (m[g] ?? 0) + 1; return m; }, {});

export async function executar({ raiz, saida } = {}) {
  const fontes = JSON.parse(await readFile(path.join(AQUI, 'fontes.json'), 'utf8'));
  const brutos = path.join(raiz, 'local', 'prova-dados', 'brutos');
  const malha = fontes.itens.find((i) => i.tipo === 'ibge-malha');
  const territorio = criarTerritorio(JSON.parse(await readFile(path.join(brutos, malha.destino), 'utf8')));
  const grupos = { SNPP: ['NPP-375', 'NPP-375D'], NOAA20: ['NOAA-20'], NOAA21: ['NOAA-21'] };
  const sensores = { SNPP: 'VIIRS_SNPP', NOAA20: 'VIIRS_NOAA20', NOAA21: 'VIIRS_NOAA21' };
  const resultado = {};
  for (const [rotulo, satelites] of Object.entries(grupos)) {
    const inpe = [];
    for (const i of fontes.itens.filter((x) => x.tipo === 'inpe-focos' && x.id.startsWith('inpe-mensal'))) {
      for await (const r of lerFocos(path.join(brutos, i.destino))) {
        if (!satelites.includes(r.satelite) || classificarPonto(r.lon, r.lat, territorio) === 'fora') continue;
        const iso = new Date(r.ms).toISOString();
        if (iso < '2026-08-01' || iso >= '2026-11-01') continue;
        inpe.push(chaveDe(iso.slice(0, 10), iso.slice(11, 13) + iso.slice(14, 16), r.lat, r.lon));
      }
    }
    const firms = [];
    for (const i of fontes.itens.filter((x) => x.tipo === 'firms-area' && x.id.startsWith(`firms-${sensores[rotulo]}_`))) {
      for await (const r of lerFirms(path.join(brutos, i.destino))) {
        if (classificarPonto(r.lon, r.lat, territorio) !== 'fora') firms.push(chaveDe(r.data, r.hhmm, r.lat, r.lon));
      }
    }
    const c = casar(inpe, firms);
    resultado[rotulo] = {
      registrosInpe: inpe.length,
      registrosFirms: firms.length,
      casados: c.casados,
      soInpe: c.soA.length,
      soFirms: c.soB.length,
      soInpePorMes: agrupar(c.soA, 7),
      soFirmsPorMes: agrupar(c.soB, 7),
      soInpePorDia: agrupar(c.soA, 10),
      soFirmsPorDia: agrupar(c.soB, 10),
    };
  }
  const destino = saida ?? path.join(raiz, 'local', 'prova-dados', 'saidas', 'casamento.json');
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, serializar(resultado));
  return { destino, resultado };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { destino, resultado } = await executar({ raiz: path.resolve(AQUI, '..', '..') });
  console.log(`Saída: ${destino}`);
  for (const [k, v] of Object.entries(resultado)) console.log(k, `casados=${v.casados} soInpe=${v.soInpe} soFirms=${v.soFirms}`);
}
