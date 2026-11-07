// Conferência independente do item 1: reagrega deteccoes.csv por um caminho separado do processamento e confronta
// com agregados.json; confere a referência pública de Colniza (ciclo 001) quando os hashes das fontes coincidem.
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { dividirLinha } from '../prova-dados/satelites.mjs';
import { FONTES, LOCAL, lerJson, RAIZ, SAIDAS, salvarJson } from './caminhos.mjs';

// Referência do ciclo 001 (Colniza, AQUA_M-T, polígono IBGE v4, borda incluída, GMT): 516, 246 e 62; total 824.
export const REFERENCIA_COLNIZA = { municipio: '5103254', meses: { '2026-08': 516, '2026-09': 246, '2026-10': 62 }, total: 824 };

// Reagregação por (município, mês GMT) e por (estado, mês) a partir das linhas do CSV, contando só o escopo principal.
export async function reagregar(arquivo) {
  const porMunicipioMes = {};
  const porMes = {};
  const porHoraGmt = {};
  let cabecalho = null;
  let principal = 0;
  let envelope = 0;
  for await (const linha of createInterface({ input: createReadStream(arquivo), crlfDelay: Infinity })) {
    if (!linha) continue;
    const c = dividirLinha(linha);
    if (!cabecalho) {
      cabecalho = Object.fromEntries(c.map((n, i) => [n, i]));
      continue;
    }
    const escopo = c[cabecalho.escopo];
    if (escopo === 'envelope') {
      envelope += 1;
      continue;
    }
    if (escopo !== 'principal') throw new Error(`Escopo desconhecido: ${escopo}`);
    principal += 1;
    const data = c[cabecalho.data_hora_gmt];
    const mes = data.slice(0, 7);
    const municipio = c[cabecalho.municipio_ibge];
    porMunicipioMes[municipio] ??= {};
    porMunicipioMes[municipio][mes] = (porMunicipioMes[municipio][mes] ?? 0) + 1;
    porMes[mes] = (porMes[mes] ?? 0) + 1;
    const hora = data.slice(11, 13);
    porHoraGmt[hora] = (porHoraGmt[hora] ?? 0) + 1;
  }
  return { principal, envelope, porMes, porMunicipioMes, porHoraGmt };
}

export function compararContagens(esperado, obtido) {
  const diferencas = [];
  for (const chave of new Set([...Object.keys(esperado), ...Object.keys(obtido)])) {
    if ((esperado[chave] ?? 0) !== (obtido[chave] ?? 0)) diferencas.push({ chave, esperado: esperado[chave] ?? 0, obtido: obtido[chave] ?? 0 });
  }
  return diferencas;
}

export async function executar() {
  const fontes = await lerJson(FONTES);
  const agregados = await lerJson(path.join(SAIDAS, 'agregados.json'));
  const re = await reagregar(path.join(SAIDAS, 'deteccoes.csv'));

  const difEstado = compararContagens(agregados.contagens.estadoPorMes, re.porMes);
  const difMunicipios = [];
  for (const [codigo, m] of Object.entries(agregados.porMunicipio)) {
    for (const d of compararContagens(m.deteccoesPorMes, re.porMunicipioMes[codigo] ?? {})) difMunicipios.push({ municipio: codigo, ...d });
  }
  const somaMunicipios = Object.values(re.porMunicipioMes).flatMap((m) => Object.values(m)).reduce((s, n) => s + n, 0);

  // Referência de Colniza: só comparável se os arquivos mensais forem os mesmos (SHA-256) da prova 001.
  const prova = await lerJson(path.join(RAIZ, 'scripts', 'prova-dados', 'fontes.json'));
  const mesmosHashes = Object.keys(REFERENCIA_COLNIZA.meses).every((mes) => {
    const url = (i) => i.url.endsWith(`focos_mensal_br_${mes.replace('-', '')}.csv`);
    const a = fontes.itens.find(url);
    const b = prova.itens.find(url);
    return a && b && a.sha256 === b.sha256;
  });
  const colniza = re.porMunicipioMes[REFERENCIA_COLNIZA.municipio] ?? {};
  const obtidoColniza = Object.fromEntries(Object.keys(REFERENCIA_COLNIZA.meses).map((m) => [m, colniza[m] ?? 0]));
  const difColniza = mesmosHashes ? compararContagens(REFERENCIA_COLNIZA.meses, obtidoColniza) : null;

  const resultado = {
    em: new Date().toISOString(),
    reagregacao: { principal: re.principal, envelope: re.envelope, somaMunicipios },
    estadoPorMes: { diferencas: difEstado },
    municipioPorMes: { diferencas: difMunicipios },
    colniza: { comparavel: mesmosHashes, referencia: REFERENCIA_COLNIZA.meses, obtido: obtidoColniza, diferencas: difColniza },
    distribuicaoPorHoraGmt: re.porHoraGmt,
  };
  resultado.aprovado = !difEstado.length && !difMunicipios.length && somaMunicipios === re.principal && mesmosHashes && difColniza.length === 0;
  await salvarJson(path.join(LOCAL, 'conferencia.json'), resultado);
  console.log(JSON.stringify(resultado, null, 2));
  if (!resultado.aprovado) process.exitCode = 1;
  return resultado;
}
