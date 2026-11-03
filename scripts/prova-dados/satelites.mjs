// Lista os valores distintos da coluna `satelite` (com número de registros) de CSV de focos do INPE.
// Levantamento do item 1; não é a contagem de Colniza (item 2).
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

// Divide uma linha CSV, respeitando campos entre aspas.
export function dividirLinha(linha) {
  const campos = [];
  let atual = '';
  let aspas = false;
  for (let i = 0; i < linha.length; i += 1) {
    const c = linha[i];
    if (c === '"') {
      if (aspas && linha[i + 1] === '"') {
        atual += '"';
        i += 1;
      } else aspas = !aspas;
    } else if (c === ',' && !aspas) {
      campos.push(atual);
      atual = '';
    } else atual += c;
  }
  campos.push(atual);
  return campos;
}

export async function valoresDeSatelite(arquivo) {
  const contagem = new Map();
  let coluna = -1;
  for await (const linha of createInterface({ input: createReadStream(arquivo), crlfDelay: Infinity })) {
    if (!linha.trim()) continue;
    const campos = dividirLinha(linha);
    if (coluna < 0) {
      coluna = campos.map((c) => c.trim()).indexOf('satelite');
      if (coluna < 0) throw new Error(`Coluna "satelite" ausente em ${arquivo}.`);
      continue;
    }
    const valor = (campos[coluna] ?? '').trim();
    contagem.set(valor, (contagem.get(valor) ?? 0) + 1);
  }
  return Object.fromEntries([...contagem].sort(([a], [b]) => (a < b ? -1 : 1)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const arquivo of process.argv.slice(2)) {
    console.log(arquivo, JSON.stringify(await valoresDeSatelite(arquivo)));
  }
}
