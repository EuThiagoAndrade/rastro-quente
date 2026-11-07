// Caminhos e utilitários de arquivo compartilhados pela CLI do item 1.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ = path.resolve(AQUI, '..', '..');
export const FONTES = path.join(AQUI, 'fontes.json');
export const AVISOS = path.join(AQUI, 'avisos.json');
export const LOCAL = path.join(RAIZ, 'local', 'dados-prototipo');
export const BRUTOS = path.join(LOCAL, 'brutos');
export const SAIDAS = path.join(LOCAL, 'saidas');

export async function lerJson(arquivo) {
  return JSON.parse(await readFile(arquivo, 'utf8'));
}

export async function salvarJson(arquivo, objeto) {
  await mkdir(path.dirname(arquivo), { recursive: true });
  await writeFile(`${arquivo}.tmp`, `${JSON.stringify(objeto, null, 2)}\n`);
  await rename(`${arquivo}.tmp`, arquivo);
}
