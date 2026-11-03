// Confere que o horário de Cuiabá (America/Cuiaba) é UTC−4 fixo em todo o período da prova (sem horário de verão).
import { pathToFileURL } from 'node:url';

const formato = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Cuiaba', timeZoneName: 'longOffset' });

// Desvios (como "GMT-04:00") distintos observados ao meio-dia UTC de cada dia de `inicio` (inclusive) a `fim` (exclusivo).
export function desviosNoPeriodo(inicio, fim) {
  const desvios = new Set();
  for (let ms = Date.parse(`${inicio}T12:00:00Z`); ms < Date.parse(`${fim}T12:00:00Z`); ms += 86_400_000) {
    desvios.add(formato.formatToParts(ms).find((p) => p.type === 'timeZoneName').value);
  }
  return [...desvios];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(desviosNoPeriodo('2026-08-01', '2026-11-02')));
}
