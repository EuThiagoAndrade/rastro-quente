// CLI local do item 1 (ciclo 003): janela, obtenção, processamento (dry-run, sem banco nem provedor) e conferência.
// Uso: node scripts/prototipo/prototipo.mjs <janela --ultimo-mes AAAA-MM | obter | processar | conferir>
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRUTOS, FONTES, LOCAL, lerJson, salvarJson } from './caminhos.mjs';
import { fixarJanela, garantirItem } from './obter.mjs';

async function cmdJanela(args) {
  const i = args.indexOf('--ultimo-mes');
  const ultimoMes = i >= 0 ? args[i + 1] : new Date().toISOString().slice(0, 7);
  const fontes = await lerJson(FONTES);
  if (fontes.janela && !args.includes('--refixar')) throw new Error(`Janela já fixada (${fontes.janela.inicio} a ${fontes.janela.fim}); use --refixar para nova versão.`);
  const r = await fixarJanela({ ultimoMes });
  // Refixar a janela não autoriza trocar o retrato das áreas.
  const areasExistentes = fontes.itens?.filter((i) => i.papel === 'areas') ?? [];
  const itens = areasExistentes.length ? [...r.itens.filter((i) => i.papel !== 'areas'), ...areasExistentes] : r.itens;
  Object.assign(fontes, { janela: r.janela, sondasMensais: r.sondas, envelope: r.envelope, itens });
  await salvarJson(FONTES, fontes);
  console.log(JSON.stringify({ janela: r.janela, envelope: r.envelope, itens: r.itens.length }, null, 2));
}

async function cmdObter() {
  const fontes = await lerJson(FONTES);
  if (!fontes.janela) throw new Error('Janela não fixada. Execute o modo janela.');
  const t0 = performance.now();
  const registro = [];
  let erro = null;
  try {
    for (const item of fontes.itens) {
      const hashAnterior = item.sha256;
      const r = await garantirItem(item, BRUTOS);
      if (!hashAnterior && item.sha256) await salvarJson(FONTES, fontes);
      registro.push({ id: item.id, ...r });
      console.log(`${r.estado}: ${item.id} (${item.tamanho} bytes)`);
    }
  } catch (e) {
    erro = e.message;
    console.error(`erro: ${erro}`);
  }
  const medicao = {
    em: new Date().toISOString(), ms: Math.round(performance.now() - t0), erro, itens: registro,
    bytesBaixados: registro.reduce((s, r) => s + r.bytes, 0),
  };
  const anterior = await lerJson(path.join(LOCAL, 'obtencao.json')).catch(() => ({ execucoes: [] }));
  await salvarJson(path.join(LOCAL, 'obtencao.json'), { execucoes: [...anterior.execucoes, medicao] });
  if (erro) process.exitCode = 1;
}

const comandos = {
  janela: cmdJanela,
  obter: cmdObter,
  processar: async (args) => (await import('./processar.mjs')).executar({ args }),
  conferir: async (args) => (await import('./conferir.mjs')).executar({ args }),
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [nome, ...args] = process.argv.slice(2);
  if (!comandos[nome]) {
    console.error('Uso: node scripts/prototipo/prototipo.mjs <janela [--ultimo-mes AAAA-MM] [--refixar] | obter | processar | conferir>');
    process.exitCode = 2;
  } else {
    await comandos[nome](args);
  }
}
