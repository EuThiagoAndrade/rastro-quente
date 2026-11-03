// Contagem e cobertura de Colniza (ciclo 001, item 2). Aplica D1 a D4 do plano aprovado; não escolhe regra de seleção.
// D1 d: P = AQUA_M-T; VIIRS e todos os satélites como contagens auxiliares. D2 c: polígono IBGE (E) como principal,
// com a lista de divergências em relação a municipio_id (Mu). D3 c: GMT principal, UTC−4 como sensibilidade.
// D4 a: registro publicado, sem agrupamento.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cobertura, diasDoIntervalo } from './cobertura.mjs';
import { lerFocos, MESES, mesDoInstante } from './focos.mjs';
import { classificarPonto, criarTerritorio } from './geo.mjs';
import { sha256Arquivo } from './obter.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
  principal: 'AQUA_M-T',
  municipioAlvo: '5103254',
  estadoAlvo: '51',
  // Confirmado pelo responsável em 2026-11-03: SNPP = NPP-375 + NPP-375D (passagens de dia e de noite).
  gruposViirs: { SNPP: ['NPP-375', 'NPP-375D'], NOAA20: ['NOAA-20'], NOAA21: ['NOAA-21'] },
};

const zeros = () => Object.fromEntries(MESES.map((m) => [m, 0]));
const soma = (a) => Object.values(a).reduce((s, v) => s + v, 0);

function novoSatelite() {
  return { gmt: { E: zeros(), Mu: zeros(), MT: zeros() }, cuiaba: { E: zeros(), Mu: zeros() }, borda: 0, soCampo: 0, soPoligono: 0 };
}

// Percorre os registros uma vez e acumula tudo o que as séries precisam.
export async function agregar(registros, territorio, cfg = CONFIG) {
  const r = { lidos: 0, foraDasJanelas: 0, idsDuplicados: 0, satelites: {}, divergencias: [], deteccaoPorDia: {} };
  const vistos = new Set();
  for await (const f of registros) {
    r.lidos += 1;
    const mesGmt = mesDoInstante(f.ms, 0);
    const mesCuiaba = mesDoInstante(f.ms, -4);
    if (!mesGmt && !mesCuiaba) {
      r.foraDasJanelas += 1;
      continue;
    }
    const sat = (r.satelites[f.satelite] ??= novoSatelite());
    const posicao = classificarPonto(f.lon, f.lat, territorio);
    const noPoligono = posicao !== 'fora';
    const noMunicipio = f.municipioId === cfg.municipioAlvo;
    if (posicao === 'borda') sat.borda += 1;
    if (noPoligono || noMunicipio) {
      if (vistos.has(f.id)) r.idsDuplicados += 1;
      vistos.add(f.id);
    }
    if (mesGmt) {
      if (noPoligono) sat.gmt.E[mesGmt] += 1;
      if (noMunicipio) sat.gmt.Mu[mesGmt] += 1;
      if (f.estadoId === cfg.estadoAlvo) sat.gmt.MT[mesGmt] += 1;
      if (noPoligono && f.satelite === cfg.principal) {
        const dias = (r.deteccaoPorDia[f.satelite] ??= {});
        dias[f.dia] = (dias[f.dia] ?? 0) + 1;
      }
      if (noPoligono !== noMunicipio) {
        if (noPoligono) sat.soPoligono += 1;
        else sat.soCampo += 1;
        if (f.satelite === cfg.principal) {
          r.divergencias.push({
            id: f.id, lat: f.lat, lon: f.lon, instanteGmt: new Date(f.ms).toISOString(), mes: mesGmt, municipioId: f.municipioId,
            apenas: noPoligono ? 'poligono' : 'campo_municipio_id', posicao,
          });
        }
      }
    }
    if (mesCuiaba) {
      if (noPoligono) sat.cuiaba.E[mesCuiaba] += 1;
      if (noMunicipio) sat.cuiaba.Mu[mesCuiaba] += 1;
    }
  }
  r.divergencias.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return r;
}

const porMes = (obj) => ({ ...obj, total: soma(obj) });

function somarSatelites(r, nomes, escolher) {
  const out = zeros();
  for (const nome of nomes) for (const m of MESES) out[m] += r.satelites[nome] ? escolher(r.satelites[nome])[m] : 0;
  return out;
}

// Variação mês a mês, observada, sem limiar e sem interpretação causal.
export function crescimento(valores) {
  const [a, b, c] = MESES.map((m) => valores[m]);
  const razao = (x, y) => (x === 0 ? null : Math.round((y / x) * 10000) / 10000);
  return {
    valores: { [MESES[0]]: a, [MESES[1]]: b, [MESES[2]]: c },
    diferencas: { 'ago_para_set': b - a, 'set_para_out': c - b, 'ago_para_out': c - a },
    razoes: { 'ago_para_set': razao(a, b), 'set_para_out': razao(b, c), 'ago_para_out': razao(a, c) },
    aumentouEmCadaMes: b > a && c > b,
  };
}

export function montarSaida(r, avisos, cfg = CONFIG) {
  const nomes = Object.keys(r.satelites).sort();
  const p = r.satelites[cfg.principal] ?? novoSatelite();
  const E = p.gmt.E;
  const todos = Object.fromEntries(nomes.map((n) => [n, porMes(r.satelites[n].gmt.E)]));
  const V = Object.fromEntries(
    Object.entries(cfg.gruposViirs).map(([g, lista]) => [g, porMes(somarSatelites(r, lista, (s) => s.gmt.E))]),
  );
  const todosGmt = somarSatelites(r, nomes, (s) => s.gmt.E);
  const todosCuiaba = somarSatelites(r, nomes, (s) => s.cuiaba.E);
  const dias = diasDoIntervalo('2026-08-01', '2026-11-01');
  const cob = cobertura({ dias, satelites: [cfg.principal], deteccoes: r.deteccaoPorDia, avisos });
  const mt = Object.fromEntries(nomes.map((n) => [n, porMes(r.satelites[n].gmt.MT)]));
  return {
    contexto: { principal: cfg.principal, municipio: cfg.municipioAlvo, estado: cfg.estadoAlvo, fuso: 'GMT, início inclusivo e fim exclusivo', unidade: 'registro publicado (D4 a)' },
    leitura: { registrosLidos: r.lidos, foraDasJanelasGmtECuiaba: r.foraDasJanelas, idsDuplicadosEmColniza: r.idsDuplicados },
    series: {
      P: porMes(E),
      E: porMes(E),
      Mu: porMes(p.gmt.Mu),
      V,
      todosOsSatelites: todos,
      todosOsSatelitesSoma: porMes(todosGmt),
    },
    divergencias: {
      satelite: cfg.principal,
      apenasNoCampoMunicipioId: p.soCampo,
      apenasNoPoligono: p.soPoligono,
      pontosNaBorda: p.borda,
      lista: r.divergencias,
      contagemPorSatelite: Object.fromEntries(nomes.map((n) => [n, { apenasNoCampoMunicipioId: r.satelites[n].soCampo, apenasNoPoligono: r.satelites[n].soPoligono, pontosNaBorda: r.satelites[n].borda }])),
    },
    sensibilidadeFuso: {
      cuiaba: {
        P: porMes(p.cuiaba.E),
        Mu: porMes(p.cuiaba.Mu),
        todosOsSatelitesSoma: porMes(todosCuiaba),
      },
      diferencaCuiabaMenosGmt: {
        P: Object.fromEntries(MESES.map((m) => [m, p.cuiaba.E[m] - E[m]])),
        Mu: Object.fromEntries(MESES.map((m) => [m, p.cuiaba.Mu[m] - p.gmt.Mu[m]])),
      },
    },
    cobertura: { avisosAvaliados: avisos, ...cob },
    crescimento: {
      observacao: 'Variação observada nas contagens, sem limiar de "forte" definido e sem interpretação causal.',
      colnizaP: crescimento(E),
      colnizaTodosOsSatelites: crescimento(todosGmt),
      colnizaVIIRS: Object.fromEntries(Object.entries(V).map(([g, v]) => [g, crescimento(v)])),
      mtPorCampoEstadoId: crescimento(mt[cfg.principal] ?? zeros()),
      mtPorSatelite: mt,
    },
  };
}

const ordenar = (v) => (Array.isArray(v) ? v.map(ordenar) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar(v[k])])) : v);

export const serializar = (obj) => `${JSON.stringify(ordenar(obj), null, 2)}\n`;

export async function executar({ raiz, fontesPath = path.join(AQUI, 'fontes.json'), saida } = {}) {
  const fontes = JSON.parse(await readFile(fontesPath, 'utf8'));
  const brutos = path.join(raiz, 'local', 'prova-dados', 'brutos');
  const usados = fontes.itens.filter((i) => i.tipo === 'inpe-focos' || i.tipo === 'ibge-malha');
  const insumos = [];
  for (const item of usados) {
    const sha256 = await sha256Arquivo(path.join(brutos, item.destino));
    if (sha256 !== item.sha256) throw new Error(`SHA-256 de ${item.destino} diverge de fontes.json. Parado.`);
    insumos.push({ id: item.id, tamanho: item.tamanho, sha256 });
  }
  const malha = fontes.itens.find((i) => i.tipo === 'ibge-malha');
  const territorio = criarTerritorio(JSON.parse(await readFile(path.join(brutos, malha.destino), 'utf8')));
  const arquivos = fontes.itens.filter((i) => i.tipo === 'inpe-focos').map((i) => path.join(brutos, i.destino));
  const todos = (async function* () {
    for (const a of arquivos) yield* lerFocos(a);
  })();
  const avisos = fontes.levantamento.inpe.avisosDoPeriodo.avisos.map((a) => ({
    data: a.data, satelites: a.satelites, classe: a.incidencia.classe, evidencia: a.incidencia.evidencia,
  }));
  const resultado = await agregar(todos, territorio);
  const saidaJson = {
    insumos,
    malha: { vertices: territorio.vertices, retangulo: territorio.bbox },
    ...montarSaida(resultado, avisos),
  };
  const texto = serializar(saidaJson);
  const destino = saida ?? path.join(raiz, 'local', 'prova-dados', 'saidas', 'contagem.json');
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, texto);
  return { destino, sha256: createHash('sha256').update(texto).digest('hex'), saida: saidaJson };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { destino, sha256 } = await executar({ raiz: path.resolve(AQUI, '..', '..') });
  console.log(`Saída: ${destino}\nSHA-256 da saída: ${sha256}`);
}
