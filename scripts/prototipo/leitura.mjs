// Leitura em fluxo e validação dos CSV de focos do INPE para o recorte do item 1.
// Arquivo sem as colunas do contrato é incompatível (erro). Linha inválida do satélite do recorte é devolvida como
// 'invalida', para que o processamento a relate e não declare a carga válida.
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { dividirLinha } from '../prova-dados/satelites.mjs';

export const COLUNAS = { id: 'id', lat: 'lat', lon: 'lon', data: 'data_hora_gmt', satelite: 'satelite', municipio: 'municipio_id', estado: 'estado_id' };
const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

// Instante GMT em ms ou null se o texto não for uma data/hora válida (inclusive 2026-02-30 e afins).
export function instanteValido(texto) {
  const m = FORMATO_DATA.exec(texto);
  if (!m) return null;
  const [, a, mes, d, h, mi, s] = m.map(Number);
  const ms = Date.UTC(a, mes - 1, d, h, mi, s);
  const dt = new Date(ms);
  if (dt.getUTCFullYear() !== a || dt.getUTCMonth() !== mes - 1 || dt.getUTCDate() !== d || h > 23 || mi > 59 || s > 59) return null;
  return ms;
}

export function indicesDoCabecalho(campos, origem) {
  const cabecalho = campos.map((c) => c.trim());
  const indices = {};
  for (const [chave, nome] of Object.entries(COLUNAS)) {
    indices[chave] = cabecalho.indexOf(nome);
    if (indices[chave] < 0) throw new Error(`Arquivo incompatível ${origem}: coluna "${nome}" ausente. Parado.`);
  }
  return { indices, colunas: cabecalho.length };
}

// Interpreta uma linha de dados já dividida. Devolve { registro } ou { invalida: motivo }.
export function interpretar(campos, { indices, colunas }) {
  if (campos.length !== colunas) return { invalida: `numero_de_colunas_${campos.length}_esperado_${colunas}` };
  const latTexto = campos[indices.lat].trim();
  const lonTexto = campos[indices.lon].trim();
  const lat = latTexto === '' ? NaN : Number(latTexto);
  const lon = lonTexto === '' ? NaN : Number(lonTexto);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { invalida: 'latitude_invalida' };
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return { invalida: 'longitude_invalida' };
  const data = campos[indices.data].trim();
  const ms = instanteValido(data);
  if (ms === null) return { invalida: 'data_hora_gmt_invalida' };
  const id = campos[indices.id].trim();
  return {
    registro: {
      idFonte: id === '' ? null : id,
      lat,
      lon,
      latTexto,
      lonTexto,
      ms,
      dataHoraGmt: data,
      satelite: campos[indices.satelite].trim(),
      municipioInpe: campos[indices.municipio].trim() || null,
      estadoInpe: campos[indices.estado].trim() || null,
    },
  };
}

// Gera { linha, satelite, registro } ou { linha, invalida } para cada linha de dados; `linha` é 1 na primeira após o cabeçalho.
// Linhas de outros satélites saem só com { linha, satelite, outroSatelite: true }, sem validação completa.
export async function* lerArquivo(arquivo, satelite, origem = arquivo) {
  let estrutura = null;
  let linha = 0;
  for await (const texto of createInterface({ input: createReadStream(arquivo), crlfDelay: Infinity })) {
    if (!estrutura) {
      if (!texto.trim()) continue;
      estrutura = indicesDoCabecalho(dividirLinha(texto.replace(/^﻿/, '')), origem);
      continue;
    }
    linha += 1;
    if (!texto.trim()) {
      yield { linha, invalida: 'linha_vazia' };
      continue;
    }
    const campos = texto.includes('"') ? dividirLinha(texto) : texto.split(',');
    const sat = (campos[estrutura.indices.satelite] ?? '').trim();
    if (sat !== satelite) {
      if (campos.length !== estrutura.colunas) yield { linha, invalida: `numero_de_colunas_${campos.length}_esperado_${estrutura.colunas}` };
      else yield { linha, satelite: sat, outroSatelite: true };
      continue;
    }
    const r = interpretar(campos, estrutura);
    if (r.invalida) yield { linha, satelite: sat, invalida: r.invalida };
    else yield { linha, satelite: sat, registro: r.registro };
  }
  if (!estrutura) throw new Error(`Arquivo incompatível ${origem}: sem cabeçalho. Parado.`);
}
