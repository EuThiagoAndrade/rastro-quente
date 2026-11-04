// Leitura dos CSV de consulta por área do NASA FIRMS (VIIRS) e contagem no polígono (D6 a).
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { MESES } from './focos.mjs';
import { classificarPonto } from './geo.mjs';

// acq_date (AAAA-MM-DD) e acq_time (HHMM, sem zeros à esquerda) são interpretados em UTC.
export async function* lerFirms(arquivo) {
  let indices = null;
  for await (const linha of createInterface({ input: createReadStream(arquivo), crlfDelay: Infinity })) {
    if (!linha.trim()) continue;
    const campos = linha.split(',');
    if (!indices) {
      const cabecalho = campos.map((c) => c.trim());
      indices = {};
      for (const nome of ['latitude', 'longitude', 'acq_date', 'acq_time']) {
        indices[nome] = cabecalho.indexOf(nome);
        if (indices[nome] < 0) throw new Error(`Coluna "${nome}" ausente em ${arquivo}.`);
      }
      continue;
    }
    const lat = Number(campos[indices.latitude]);
    const lon = Number(campos[indices.longitude]);
    const data = campos[indices.acq_date].trim();
    const hhmm = campos[indices.acq_time].trim().padStart(4, '0');
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{4}$/.test(hhmm)) {
      throw new Error(`Registro inválido em ${arquivo}: ${linha.slice(0, 80)}`);
    }
    yield { lat, lon, data, hhmm, chave: `${lat}|${lon}|${data}|${hhmm}` };
  }
}

// Conta, por mês de acq_date (UTC), os registros dentro do polígono (borda conta como dentro).
// Também informa o total no retângulo da consulta, registros fora do trimestre e repetidos entre janelas.
export async function contarFirms(arquivos, territorio) {
  const porMes = Object.fromEntries(MESES.map((m) => [m, 0]));
  const retangulo = Object.fromEntries(MESES.map((m) => [m, 0]));
  const vistos = new Set();
  let foraDoTrimestre = 0;
  let repetidos = 0;
  let naBorda = 0;
  for (const arquivo of arquivos) {
    for await (const r of lerFirms(arquivo)) {
      const mes = r.data.slice(0, 7);
      if (!(mes in porMes)) {
        foraDoTrimestre += 1;
        continue;
      }
      if (vistos.has(r.chave)) repetidos += 1;
      vistos.add(r.chave);
      retangulo[mes] += 1;
      const posicao = classificarPonto(r.lon, r.lat, territorio);
      if (posicao !== 'fora') porMes[mes] += 1;
      if (posicao === 'borda') naBorda += 1;
    }
  }
  return { porMes, retangulo, foraDoTrimestre, repetidosEntreJanelas: repetidos, pontosNaBorda: naBorda };
}
