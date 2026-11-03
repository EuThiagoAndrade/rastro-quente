// Obtém as fontes públicas da prova de dados (ciclo 001) e registra a proveniência.
// Node.js 24, sem dependências. Brutos em local/prova-dados/brutos/ (fora do Git).
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MARCADOR_CHAVE = '{MAP_KEY}';
export const SAIDA = { OK: 0, ERRO: 1, PENDENTE: 3 };

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIA_MS = 86_400_000;

export function sanitizar(texto, chave) {
  let s = String(texto);
  if (chave) {
    for (const valor of new Set([chave, encodeURIComponent(chave)])) s = s.split(valor).join(MARCADOR_CHAVE);
  }
  return s;
}

function erroSanitizado(prefixo, causa, chave) {
  const detalhe = [causa?.message, causa?.cause?.message].filter(Boolean).join(': ');
  return new Error(sanitizar(`${prefixo}${detalhe ? `: ${detalhe}` : ''}`, chave));
}

export async function lerChave(arquivoEnv) {
  let texto;
  try {
    texto = await readFile(arquivoEnv, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw new Error(`Não foi possível ler ${path.basename(arquivoEnv)}.`);
  }
  for (const linha of texto.split(/\r?\n/)) {
    const m = /^\s*MAP_KEY\s*=\s*(.*?)\s*$/.exec(linha);
    if (m) {
      const valor = m[1].replace(/^(["'])(.*)\1$/, '$2');
      return valor || null;
    }
  }
  return null;
}

const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

// Janelas consecutivas, sem lacuna nem sobreposição, de `inicio` (inclusive) a `fim` (exclusivo).
export function janelas(inicio, fim, dayRange) {
  if (!Number.isInteger(dayRange) || dayRange < 1 || dayRange > 5) {
    throw new Error(`DAY_RANGE fora de 1 a 5: ${dayRange}`);
  }
  const fimMs = Date.parse(`${fim}T00:00:00Z`);
  const resultado = [];
  for (let ms = Date.parse(`${inicio}T00:00:00Z`); ms < fimMs; ms += dayRange * DIA_MS) {
    resultado.push({ data: iso(ms), dias: Math.min(dayRange, (fimMs - ms) / DIA_MS) });
  }
  return resultado;
}

// Interpreta a resposta de /api/data_availability: colunas data_id, min_date e max_date.
export function lerDisponibilidade(csv) {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim());
  const cabecalho = (linhas[0] ?? '').split(',').map((c) => c.trim());
  const [i, min, max] = ['data_id', 'min_date', 'max_date'].map((c) => cabecalho.indexOf(c));
  if (i < 0 || min < 0 || max < 0) throw new Error('Resposta de data_availability sem as colunas data_id, min_date e max_date.');
  const mapa = {};
  for (const linha of linhas.slice(1)) {
    const c = linha.split(',').map((v) => v.trim());
    mapa[c[i]] = { min: c[min], max: c[max] };
  }
  return mapa;
}

// SP quando a API cobre todo o intervalo; senão NRT. Nunca mistura os dois no mesmo satélite.
export function escolherProduto(sensor, disponibilidade, inicio, fim) {
  const ultimoDia = iso(Date.parse(`${fim}T00:00:00Z`) - DIA_MS);
  const sp = disponibilidade[`${sensor}_SP`];
  return sp && sp.min <= inicio && sp.max >= ultimoDia ? `${sensor}_SP` : `${sensor}_NRT`;
}

export function urlFirms(chave, fonte, retangulo, dayRange, data) {
  return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${chave}/${fonte}/${retangulo}/${dayRange}/${data}`;
}

export async function sha256Arquivo(arquivo) {
  const hash = createHash('sha256');
  await pipeline(createReadStream(arquivo), hash);
  return hash.digest('hex');
}

async function salvarJson(arquivo, objeto) {
  await mkdir(path.dirname(arquivo), { recursive: true });
  const temporario = `${arquivo}.tmp`;
  await writeFile(temporario, `${JSON.stringify(objeto, null, 2)}\n`);
  await rename(temporario, arquivo);
}

async function existe(arquivo) {
  try {
    return await stat(arquivo);
  } catch {
    return null;
  }
}

async function baixar(item, destino, ctx) {
  const url = ctx.chave ? item.url.split(MARCADOR_CHAVE).join(ctx.chave) : item.url;
  let resposta;
  try {
    resposta = await ctx.fetchFn(url);
  } catch (e) {
    throw erroSanitizado(`Falha ao obter ${item.url}`, e, ctx.chave);
  }
  if (!resposta.ok) throw new Error(sanitizar(`HTTP ${resposta.status} ao obter ${item.url}`, ctx.chave));

  const hash = createHash('sha256');
  let tamanho = 0;
  const medidor = new Transform({
    transform(pedaco, _codificacao, pronto) {
      hash.update(pedaco);
      tamanho += pedaco.length;
      pronto(null, pedaco);
    },
  });
  const parcial = `${destino}.part`;
  await mkdir(path.dirname(destino), { recursive: true });
  try {
    await pipeline(Readable.fromWeb(resposta.body), medidor, createWriteStream(parcial));
  } catch (e) {
    await rm(parcial, { force: true });
    throw erroSanitizado(`Falha ao gravar ${item.url}`, e, ctx.chave);
  }
  const esperado = Number(resposta.headers.get('content-length'));
  if (esperado && esperado !== tamanho) {
    await rm(parcial, { force: true });
    throw new Error(`Download incompleto de ${item.url}: ${tamanho} de ${esperado} bytes.`);
  }
  return {
    parcial,
    sha256: hash.digest('hex'),
    tamanho,
    lastModified: resposta.headers.get('last-modified'),
    etag: resposta.headers.get('etag'),
  };
}

// Primeira linha de uma consulta de área do FIRMS é o cabeçalho CSV; qualquer outra coisa é erro da API.
async function validarCsvFirms(parcial, item, ctx) {
  const inicio = (await readFile(parcial, { encoding: 'utf8' })).slice(0, 200);
  if (!inicio.startsWith('latitude,')) {
    await rm(parcial, { force: true });
    throw new Error(sanitizar(`Resposta inesperada do FIRMS para ${item.url}: ${JSON.stringify(inicio)}`, ctx.chave));
  }
}

// Garante um item. Retorna 'inalterado', 'registrado' (arquivo local sem registro), 'baixado' ou 'pendente'.
async function garantirItem(item, ctx) {
  const destino = path.join(ctx.dirBrutos, item.destino);
  const local = await existe(destino);

  if (local) {
    const sha256 = await sha256Arquivo(destino);
    if (item.sha256) {
      if (sha256 !== item.sha256) {
        throw new Error(`SHA-256 divergente em ${item.destino}: registrado ${item.sha256}, local ${sha256}. Parado.`);
      }
      return 'inalterado';
    }
    Object.assign(item, { obtidoEm: local.mtime.toISOString(), tamanho: local.size, sha256 });
    return 'registrado';
  }

  if (item.url.includes(MARCADOR_CHAVE) && !ctx.chave) return 'pendente';

  const r = await baixar(item, destino, ctx);
  if (item.tipo === 'firms-area') await validarCsvFirms(r.parcial, item, ctx);
  if (item.sha256 && item.sha256 !== r.sha256) {
    await rename(r.parcial, `${destino}.divergente`);
    throw new Error(`SHA-256 divergente ao baixar ${item.destino}: registrado ${item.sha256}, obtido ${r.sha256}. Parado.`);
  }
  await rename(r.parcial, destino);
  Object.assign(item, {
    obtidoEm: ctx.agora().toISOString(),
    tamanho: r.tamanho,
    sha256: r.sha256,
    lastModified: r.lastModified,
    etag: r.etag,
  });
  return 'baixado';
}

async function decidirProdutosFirms(fontes, ctx) {
  const f = fontes.firms;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/data_availability/csv/${MARCADOR_CHAVE}/ALL`;
  let resposta;
  try {
    resposta = await ctx.fetchFn(url.replace(MARCADOR_CHAVE, ctx.chave));
  } catch (e) {
    throw erroSanitizado(`Falha ao consultar ${url}`, e, ctx.chave);
  }
  if (!resposta.ok) throw new Error(sanitizar(`HTTP ${resposta.status} ao consultar ${url}`, ctx.chave));
  const texto = await resposta.text();
  const disponibilidade = lerDisponibilidade(texto);
  ctx.registrarBruto('firms-data_availability', sanitizar(texto, ctx.chave));
  f.disponibilidade = { url, consultadoEm: ctx.agora().toISOString(), sensores: {} };
  f.produtos = {};
  for (const sensor of f.sensores) {
    f.produtos[sensor] = escolherProduto(sensor, disponibilidade, f.intervalo.inicio, f.intervalo.fim);
    for (const produto of [`${sensor}_SP`, `${sensor}_NRT`]) f.disponibilidade.sensores[produto] = disponibilidade[produto] ?? null;
  }
}

function itensFirms(fontes) {
  const f = fontes.firms;
  const existentes = new Map(fontes.itens.map((i) => [i.id, i]));
  const itens = [];
  for (const sensor of f.sensores) {
    const produto = f.produtos[sensor];
    for (const j of janelas(f.intervalo.inicio, f.intervalo.fim, f.dayRange)) {
      const id = `firms-${produto}-${j.data}`;
      let item = existentes.get(id);
      if (!item) {
        item = {
          id,
          tipo: 'firms-area',
          fonte: 'NASA FIRMS',
          url: urlFirms(MARCADOR_CHAVE, produto, f.retangulo, j.dias, j.data),
          destino: `firms/${produto}_${j.data}_${j.dias}d.csv`,
          obtidoEm: null,
          tamanho: null,
          sha256: null,
          lastModified: null,
          etag: null,
        };
        fontes.itens.push(item);
      }
      itens.push(item);
    }
  }
  return itens;
}

export async function executar({ raiz, fontesPath = path.join(AQUI, 'fontes.json'), fetchFn = fetch, agora = () => new Date() }) {
  const dirLocal = path.join(raiz, 'local', 'prova-dados');
  const provPath = path.join(dirLocal, 'proveniencia.json');
  const fontes = JSON.parse(await readFile(fontesPath, 'utf8'));
  const chave = await lerChave(path.join(dirLocal, '.env'));
  const log = [];
  const brutosExtras = {};
  const ctx = {
    dirBrutos: path.join(dirLocal, 'brutos'),
    chave,
    fetchFn,
    agora,
    registrarBruto: (nome, texto) => {
      brutosExtras[nome] = texto;
    },
  };
  const escrever = (msg) => {
    const linha = sanitizar(`${agora().toISOString()} ${msg}`, chave);
    log.push(linha);
    console.log(linha);
  };

  const resumo = { baixado: 0, inalterado: 0, registrado: 0, pendente: [] };
  let erro = null;
  try {
    for (const item of fontes.itens.filter((i) => i.tipo !== 'firms-area')) {
      const estado = await garantirItem(item, ctx);
      escrever(`${estado}: ${item.id}`);
      if (estado === 'pendente') resumo.pendente.push(item.id);
      else resumo[estado] += 1;
    }

    if (fontes.firms) {
      if (!fontes.firms.produtos && chave) await decidirProdutosFirms(fontes, ctx);
      if (!fontes.firms.produtos) {
        resumo.pendente.push('firms (MAP_KEY ausente em local/prova-dados/.env)');
        escrever('pendente: firms — MAP_KEY ausente; ação externa do responsável');
      } else {
        for (const item of itensFirms(fontes)) {
          const estado = await garantirItem(item, ctx);
          escrever(`${estado}: ${item.id}`);
          if (estado === 'pendente') resumo.pendente.push(item.id);
          else resumo[estado] += 1;
        }
      }
    }
  } catch (e) {
    erro = sanitizar(e.message, chave);
    escrever(`erro: ${erro}`);
  }

  // Registro dos itens obtidos até aqui, também em caso de erro, sem a chave.
  await salvarJson(fontesPath, fontes);
  const anterior = await readFile(provPath, 'utf8').then(JSON.parse, () => ({ execucoes: [] }));
  await salvarJson(provPath, {
    atualizadoEm: agora().toISOString(),
    itens: fontes.itens,
    brutosExtras: { ...anterior.brutosExtras, ...brutosExtras },
    execucoes: [...anterior.execucoes, { em: agora().toISOString(), resumo, erro, log }],
  });

  const codigo = erro ? SAIDA.ERRO : resumo.pendente.length ? SAIDA.PENDENTE : SAIDA.OK;
  return { codigo, resumo, erro };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const raiz = path.resolve(AQUI, '..', '..');
  const { codigo, resumo } = await executar({ raiz });
  console.log(`Resumo: ${JSON.stringify(resumo)}`);
  process.exitCode = codigo;
}
