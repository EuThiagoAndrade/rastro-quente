// Lista de candidatos para a conferência manual (roteiro do plano). O responsável escolhe de 10 a 20 casos; isto só sugere.
// Seleção determinística (ordem pelo SHA-256 do id), sem sorteio e sem juízo do agente.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CONFIG } from './contar.mjs';
import { lerFocos, MESES, mesDoInstante } from './focos.mjs';
import { classificarPonto, criarTerritorio, distanciaAoLimiteM } from './geo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const hash = (id) => createHash('sha256').update(id).digest('hex');
const porHash = (a, b) => (hash(a.id) < hash(b.id) ? -1 : 1);
const DIAS_DE_BORDA = ['2026-08-01', '2026-08-31', '2026-09-01', '2026-09-30', '2026-10-01', '2026-10-31'];

// registros: iterável assíncrono de focos. Retorna { candidatos } com o motivo de cada sugestão.
export async function selecionar(registros, territorio, cfg = CONFIG, opcoes = {}) {
  const { porMes = 3, naDivisa = 5, foraDaDivisa = 3, auxiliares = 2, margemGraus = 0.2 } = opcoes;
  const [oeste, sul, leste, norte] = territorio.bbox;
  const dentroP = [];
  const foraP = [];
  const viirs = [];
  for await (const f of registros) {
    const mes = mesDoInstante(f.ms, 0);
    if (!mes) continue;
    const posicao = classificarPonto(f.lon, f.lat, territorio);
    const base = { id: f.id, lat: f.lat, lon: f.lon, instanteGmt: new Date(f.ms).toISOString(), satelite: f.satelite, mes, municipioId: f.municipioId, dia: f.dia };
    if (posicao !== 'fora') {
      const reg = { ...base, script: 'dentro', distanciaM: Math.round(distanciaAoLimiteM(f.lon, f.lat, territorio)) };
      if (f.satelite === cfg.principal) dentroP.push(reg);
      else if (f.satelite === 'NOAA-20') viirs.push(reg);
    } else if (f.satelite === cfg.principal && f.lon > oeste - margemGraus && f.lon < leste + margemGraus && f.lat > sul - margemGraus && f.lat < norte + margemGraus) {
      foraP.push({ ...base, script: 'fora', distanciaM: Math.round(distanciaAoLimiteM(f.lon, f.lat, territorio)) });
    }
  }
  const escolhidos = new Map();
  const marcar = (reg, motivo) => {
    const atual = escolhidos.get(reg.id);
    if (atual) atual.motivo += `; ${motivo}`;
    else escolhidos.set(reg.id, { ...reg, motivo });
  };
  for (const mes of MESES) {
    for (const r of dentroP.filter((x) => x.mes === mes).sort(porHash).slice(0, porMes)) marcar(r, `P, ${mes}, ordem por hash`);
    for (const r of viirs.filter((x) => x.mes === mes).sort(porHash).slice(0, auxiliares)) marcar(r, `NOAA-20 (VIIRS), ${mes}, ordem por hash`);
  }
  for (const r of [...dentroP].sort((a, b) => a.distanciaM - b.distanciaM || porHash(a, b)).slice(0, naDivisa)) marcar(r, `P dentro, entre os ${naDivisa} mais próximos da divisa`);
  for (const r of [...foraP].sort((a, b) => a.distanciaM - b.distanciaM || porHash(a, b)).slice(0, foraDaDivisa)) marcar(r, `P fora (município vizinho), entre os ${foraDaDivisa} mais próximos da divisa`);
  for (const dia of DIAS_DE_BORDA) {
    const r = dentroP.filter((x) => x.dia === dia).sort(porHash)[0];
    if (r) marcar(r, `P no dia ${dia}, borda de mês (P3)`);
  }
  const candidatos = [...escolhidos.values()].sort((a, b) => (a.instanteGmt < b.instanteGmt ? -1 : a.instanteGmt > b.instanteGmt ? 1 : a.id < b.id ? -1 : 1));
  return { candidatos, totais: { P_dentro: dentroP.length, P_fora_na_margem: foraP.length, NOAA20_dentro: viirs.length } };
}

export function tabelaCandidatos(candidatos) {
  const linhas = candidatos.map((c, i) => `| ${i + 1} | \`${c.id}\` | ${c.lat}, ${c.lon} | ${c.instanteGmt.replace('T', ' ').replace('.000Z', '')} | ${c.satelite} | ${c.mes} | ${c.script} | ${c.distanciaM} | ${c.motivo} |`);
  return ['| # | id INPE | lat, lon | instante GMT | satélite | mês (script, GMT) | polígono (script) | distância ao limite (m, aprox.) | por que foi sugerido |', '| --: | :-- | :-- | :-- | :-- | :-- | :-- | --: | :-- |', ...linhas].join('\n');
}

export async function executar({ raiz, saida } = {}) {
  const fontes = JSON.parse(await readFile(path.join(AQUI, 'fontes.json'), 'utf8'));
  const brutos = path.join(raiz, 'local', 'prova-dados', 'brutos');
  const malha = fontes.itens.find((i) => i.tipo === 'ibge-malha');
  const territorio = criarTerritorio(JSON.parse(await readFile(path.join(brutos, malha.destino), 'utf8')));
  const arquivos = fontes.itens.filter((i) => i.tipo === 'inpe-focos' && i.id.startsWith('inpe-mensal')).map((i) => path.join(brutos, i.destino));
  const todos = (async function* () {
    for (const a of arquivos) yield* lerFocos(a);
  })();
  const { candidatos, totais } = await selecionar(todos, territorio);
  const destino = saida ?? path.join(raiz, 'local', 'prova-dados', 'saidas', 'candidatos_casos.md');
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, `# Candidatos para a conferência manual (sugestão, não escolha)\n\nTotais lidos: ${JSON.stringify(totais)}.\n\n${tabelaCandidatos(candidatos)}\n`);
  return { destino, candidatos, totais };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { destino, candidatos } = await executar({ raiz: path.resolve(AQUI, '..', '..') });
  console.log(`Saída: ${destino}\nCandidatos: ${candidatos.length}`);
}
