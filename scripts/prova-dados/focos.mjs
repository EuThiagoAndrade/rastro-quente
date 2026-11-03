// Leitura em fluxo dos CSV de focos do INPE e atribuição de mês (D3).
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { dividirLinha } from './satelites.mjs';

export const MESES = ['2026-08', '2026-09', '2026-10'];
const HORA_MS = 3_600_000;
const INICIO_GMT = Date.UTC(2026, 7, 1);
const FIM_GMT = Date.UTC(2026, 10, 1);
const FORMATO = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

export function instanteGmt(texto) {
  const m = FORMATO.exec(texto.trim());
  if (!m) throw new Error(`data_hora_gmt inválida: "${texto}"`);
  const [, a, mes, d, h, mi, s] = m.map(Number);
  return Date.UTC(a, mes - 1, d, h, mi, s);
}

// Mês ('AAAA-MM') do instante no fuso com `desvioHoras` em relação ao GMT (0 ou −4), ou null fora do trimestre.
// Início inclusivo e fim exclusivo, nos dois fusos.
export function mesDoInstante(ms, desvioHoras = 0) {
  const local = ms + desvioHoras * HORA_MS;
  if (local < INICIO_GMT || local >= FIM_GMT) return null;
  return new Date(local).toISOString().slice(0, 7);
}

const COLUNAS = { id: 'id', lat: 'lat', lon: 'lon', data: 'data_hora_gmt', satelite: 'satelite', municipio: 'municipio_id', estado: 'estado_id' };

// Gera um registro por linha: { id, lat, lon, ms, dia, satelite, municipioId, estadoId }.
export async function* lerFocos(arquivo) {
  let indices = null;
  for await (const linha of createInterface({ input: createReadStream(arquivo), crlfDelay: Infinity })) {
    if (!linha.trim()) continue;
    const campos = linha.includes('"') ? dividirLinha(linha) : linha.split(',');
    if (!indices) {
      const cabecalho = campos.map((c) => c.trim());
      indices = {};
      for (const [chave, nome] of Object.entries(COLUNAS)) {
        indices[chave] = cabecalho.indexOf(nome);
        if (indices[chave] < 0) throw new Error(`Coluna "${nome}" ausente em ${arquivo}.`);
      }
      continue;
    }
    const lat = Number(campos[indices.lat]);
    const lon = Number(campos[indices.lon]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error(`Coordenada inválida em ${arquivo}: ${linha.slice(0, 80)}`);
    const data = campos[indices.data].trim();
    yield {
      id: campos[indices.id].trim(),
      lat,
      lon,
      ms: instanteGmt(data),
      dia: data.slice(0, 10),
      satelite: campos[indices.satelite].trim(),
      municipioId: campos[indices.municipio].trim(),
      estadoId: campos[indices.estado].trim(),
    };
  }
}
