// Comparação com o NASA FIRMS (D5 a D9), casos manuais (D8) e conclusão de viabilidade (D7). Ciclo 001, item 3.
// Lê as decisões de decisoes.json (transcrição do plano aprovado) e recusa combinações não admitidas;
// não escolhe alternativa no lugar do responsável.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { serializar } from './contar.mjs';
import { contarFirms } from './firms.mjs';
import { MESES } from './focos.mjs';
import { criarTerritorio } from './geo.mjs';
import { sha256Arquivo } from './obter.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const arredondar = (v, casas) => Math.round(v * 10 ** casas) / 10 ** casas;

// Combinações do plano ("Combinações válidas"). Lança Error com o motivo.
export function validarDecisoes(arquivo) {
  const d = arquivo.decisoes ?? arquivo;
  const d6 = d.D6?.escolhas ?? [];
  if (!d6.length || d6.some((x) => !['a', 'b', 'c'].includes(x))) throw new Error('D6 precisa de ao menos uma alternativa entre a, b e c.');
  const comMetodoDeK = d6.includes('a') || d6.includes('c');
  if (['a', 'b'].includes(d.D7?.escolha) && !comMetodoDeK) {
    throw new Error('Combinação não admitida: D7 a ou b com D6 sem a nem c (só b). K não teria método; só D7 c é compatível.');
  }
  if (d.D9?.agregacaoSatelites === 'S3' && d.D5?.escolha === 'c') {
    throw new Error('Combinação não admitida: D9 S3 com D5 c (a soma esconderia diferenças de sinais contrários).');
  }
  if (d.D4?.escolha === 'b') throw new Error('D4 b exige nova versão do plano com a especificação da célula.');
  if (comMetodoDeK && !['E1', 'E2'].includes(d.D9?.comparacaoIndisponivel)) throw new Error('D9 E1 ou E2 é necessária com D6 a ou c.');
  if (d6.includes('a') && d6.includes('c') && !['H1', 'H2'].includes(d.D9?.agregacaoMetodos)) {
    throw new Error('D9 H1 ou H2 é necessária com dois métodos de K (D6 a e c).');
  }
  if (comMetodoDeK && !['S1', 'S2', 'S3'].includes(d.D9?.agregacaoSatelites)) throw new Error('D9 S1, S2 ou S3 é necessária.');
  return d;
}

// O que este script executa. O que as decisões do plano excluem não é implementado (simplicidade) e é recusado.
export function exigirImplementado(d) {
  const nao = (x) => { throw new Error(`Alternativa não implementada nesta entrega: ${x}.`); };
  if (d.D6.escolhas.length !== 1 || d.D6.escolhas[0] !== 'a') nao('D6 diferente de a');
  if (!['a', 'b'].includes(d.D5.escolha) || !['F1', 'F2'].includes(d.D5.formula)) nao('D5 diferente de a ou b com F1 ou F2');
  if (d.D7.escolha !== 'b') nao('D7 diferente de b');
  if (d.D7.unidadeC !== 'd') nao('unidade de C diferente de C-d');
}

// D5: diferença percentual entre A (INPE) e B (comparada). Denominador zero: A = B = 0 concorda; só um zero diverge, sem percentual.
export function classificar(A, B, d5) {
  const base = d5.formula === 'F1' ? A : Math.max(A, B);
  let percentual = null;
  let resultado;
  if (A === 0 && B === 0) resultado = 'concorda';
  else if (A === 0 || B === 0) resultado = 'diverge';
  else {
    percentual = (Math.abs(A - B) / base) * 100;
    resultado = percentual <= d5.toleranciaPercentual ? 'concorda' : 'diverge';
  }
  return { formula: d5.formula, A, B, percentual: percentual === null ? null : arredondar(percentual, 2), resultado };
}

// D9: K por mês. `meses[mes][satelite]` é a classificação (ou null, sem comparação disponível).
// S1 todos concordam; S2 maioria estrita concorda; S3 a soma concorda pela fórmula de D5 (aqui, sobre A e B somados).
export function agregarK(meses, d) {
  const { agregacaoSatelites: S, comparacaoIndisponivel: E } = d.D9;
  const porMes = {};
  for (const [mes, sats] of Object.entries(meses)) {
    const comparaveis = Object.entries(sats).filter(([, c]) => c).map(([s]) => s).sort();
    const excluidos = Object.entries(sats).filter(([, c]) => !c).map(([s]) => s).sort();
    let resultado;
    if (!comparaveis.length || (E === 'E2' && excluidos.length)) resultado = 'indeterminado';
    else if (S === 'S3') resultado = classificar(sum(comparaveis.map((s) => sats[s].A)), sum(comparaveis.map((s) => sats[s].B)), d.D5).resultado;
    else {
      const concordam = comparaveis.filter((s) => sats[s].resultado === 'concorda').length;
      const ok = S === 'S1' ? concordam === comparaveis.length : concordam * 2 > comparaveis.length;
      resultado = ok ? 'concorda' : 'diverge';
    }
    porMes[mes] = { resultado, comparaveis, excluidos };
  }
  const valores = Object.values(porMes);
  const K = valores.some((v) => v.resultado === 'indeterminado') ? null : valores.filter((v) => v.resultado === 'concorda').length;
  return { porMes, K, kTotal: valores.length };
}

const sum = (xs) => xs.reduce((s, x) => s + x, 0);

// Roteiro da conferência manual: P1 (catálogo), P2 (território), P3 (período), cada uma 'confere', 'nao_confere' ou 'inconclusivo'.
export function classificarCaso(caso) {
  const r = ['p1', 'p2', 'p3'].map((p) => caso[p]?.resultado);
  if (r.some((x) => !['confere', 'nao_confere', 'inconclusivo'].includes(x))) throw new Error(`Caso ${caso.id}: P1, P2 e P3 precisam de resultado válido.`);
  if (r.includes('nao_confere')) return 'nao_confere';
  if (r.includes('inconclusivo')) return 'inconclusivo';
  return 'confere';
}

// D8: M em porcentagem, ou null (indeterminado).
export function calcularM(casos, d8) {
  if (casos.length > d8.maximoCasos) throw new Error(`Mais de ${d8.maximoCasos} casos.`);
  const classes = casos.map(classificarCaso);
  const n = (c) => classes.filter((x) => x === c).length;
  const confere = n('confere');
  const conclusivos = confere + n('nao_confere');
  let M = null;
  if (d8.escolha === 'b') M = casos.length ? (confere / casos.length) * 100 : null;
  else M = conclusivos >= d8.minimoConclusivos ? (confere / conclusivos) * 100 : null;
  return { M: M === null ? null : arredondar(M, 1), casos: casos.length, confere, naoConfere: n('nao_confere'), inconclusivos: n('inconclusivo'), conclusivos };
}

// D7 b. Com K ou M indeterminados, "evidência insuficiente", nunca viável ou inviável.
export function conclusao({ U, C, K, M, divergenciasExplicadas }, d7) {
  if (!U) return { conclusao: 'inviável', motivo: 'U não atendido: nenhuma fonte de focos com uso permitido; o ciclo é reavaliado.' };
  const faltam = [K === null && 'K', M === null && 'M'].filter(Boolean);
  if (faltam.length) return { conclusao: 'evidência insuficiente', motivo: `${faltam.join(' e ')} indeterminado(s).` };
  const falhas = [];
  if (C > d7.cMaximo) falhas.push(`C = ${C} > ${d7.cMaximo}`);
  if (K < d7.kMinimo) falhas.push(`K = ${K} < ${d7.kMinimo} de ${d7.kTotal}`);
  if (K < d7.kTotal && !divergenciasExplicadas) falhas.push('divergência de K sem explicação documentada');
  if (M < d7.mMinimoPercentual) falhas.push(`M = ${M}% < ${d7.mMinimoPercentual}%`);
  return falhas.length ? { conclusao: 'inviável', motivo: falhas.join('; ') } : { conclusao: 'viável', motivo: 'U, C, K e M atendem ao critério D7 b.' };
}

const celula = (v) => String(v ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
export function tabelaCasos(casos) {
  const cab = '| # | id INPE | coordenadas (lat, lon) | instante GMT | satélite | visualizador e camada (versão/data de acesso) | P1 catálogo | P2 território | P3 período | esperado (caminho independente) | script | classificação | quem conferiu e data | motivo (divergência ou inconclusão) |';
  const linhas = casos.map((c, i) => {
    const p = (x) => `${x.resultado}${x.motivo ? ` (${x.motivo})` : ''}`;
    return `| ${i + 1} | \`${celula(c.id)}\` | ${c.lat}, ${c.lon} | ${celula(c.instanteGmt)} | ${celula(c.satelite)} | ${celula(c.visualizador)} | ${celula(p(c.p1))} | ${celula(p(c.p2))} | ${celula(p(c.p3))} | ${celula(c.esperado)} | ${celula(c.script)} | ${classificarCaso(c)} | ${celula(c.conferidoPor)}, ${celula(c.data)} | ${celula(c.motivo)} |`;
  });
  return [cab, `|${' :-- |'.repeat(14)}`, ...linhas].join('\n');
}

const SENSORES = { SNPP: 'VIIRS_SNPP', NOAA20: 'VIIRS_NOAA20', NOAA21: 'VIIRS_NOAA21' };

export async function executar({ raiz, fontesPath = path.join(AQUI, 'fontes.json'), decisoesPath = path.join(AQUI, 'decisoes.json'), casosPath = path.join(AQUI, 'casos.json'), saida } = {}) {
  const d = validarDecisoes(JSON.parse(await readFile(decisoesPath, 'utf8')));
  exigirImplementado(d);
  const fontes = JSON.parse(await readFile(fontesPath, 'utf8'));
  const brutos = path.join(raiz, 'local', 'prova-dados', 'brutos');
  const saidas = path.join(raiz, 'local', 'prova-dados', 'saidas');

  const contagemTexto = await readFile(path.join(saidas, 'contagem.json'), 'utf8');
  const contagem = JSON.parse(contagemTexto);
  for (const i of contagem.insumos) {
    const registro = fontes.itens.find((x) => x.id === i.id);
    if (!registro || registro.sha256 !== i.sha256) throw new Error(`contagem.json foi gerada com outro insumo (${i.id}). Rode contar.mjs de novo. Parado.`);
  }
  const malha = fontes.itens.find((i) => i.tipo === 'ibge-malha');
  if (await sha256Arquivo(path.join(brutos, malha.destino)) !== malha.sha256) throw new Error('SHA-256 da malha diverge de fontes.json. Parado.');
  const territorio = criarTerritorio(JSON.parse(await readFile(path.join(brutos, malha.destino), 'utf8')));

  const firmsItens = fontes.itens.filter((i) => i.tipo === 'firms-area');
  const firmsInsumos = [];
  for (const i of firmsItens) {
    const sha256 = await sha256Arquivo(path.join(brutos, i.destino));
    if (sha256 !== i.sha256) throw new Error(`SHA-256 de ${i.destino} diverge de fontes.json. Parado.`);
    firmsInsumos.push({ id: i.id, sha256 });
  }

  const firms = {};
  const meses = Object.fromEntries(MESES.map((m) => [m, {}]));
  for (const [rotulo, sensor] of Object.entries(SENSORES)) {
    const arquivos = firmsItens.filter((i) => i.id.startsWith(`firms-${sensor}_`)).map((i) => path.join(brutos, i.destino));
    const produto = fontes.firms.produtos?.[sensor];
    if (!arquivos.length) {
      for (const m of MESES) meses[m][rotulo] = null; // E1: satélite sem comparação
      firms[rotulo] = { produto: produto ?? null, disponivel: false };
      continue;
    }
    firms[rotulo] = { produto, disponivel: true, arquivos: arquivos.length, ...(await contarFirms(arquivos, territorio)) };
    for (const m of MESES) meses[m][rotulo] = classificar(contagem.series.V[rotulo][m], firms[rotulo].porMes[m], d.D5);
  }
  const K = agregarK(meses, d);

  const registroCasos = JSON.parse(await readFile(casosPath, 'utf8'));
  const casos = registroCasos.casos;
  const M = calcularM(casos, d.D8);
  const C = contagem.cobertura.C;
  const divergentes = Object.entries(K.porMes).filter(([, v]) => v.resultado === 'diverge').map(([m]) => m);
  const explicacoes = registroCasos.explicacoesDeK ?? {};
  const divergenciasExplicadas = divergentes.every((m) => explicacoes[m]);
  const U = true; // INPE, IBGE e FIRMS com uso permitido (fontes.json › levantamento › condicoesDeUso)
  const resultado = {
    decisoes: d,
    insumos: { contagemSha256: createHash('sha256').update(contagemTexto).digest('hex'), firmsArquivos: firmsInsumos },
    firms,
    comparacoes: meses,
    K,
    explicacoesDeK: explicacoes,
    casos: { ...M, tabelaMarkdown: tabelaCasos(casos) },
    componentes: { U, C: C.d, K: K.K, M: M.M },
    ...conclusao({ U, C: C.d, K: K.K, M: M.M, divergenciasExplicadas }, d.D7),
  };
  const texto = serializar(resultado);
  const destino = saida ?? path.join(saidas, 'comparacao.json');
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, texto);
  return { destino, sha256: createHash('sha256').update(texto).digest('hex'), resultado };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { destino, sha256, resultado } = await executar({ raiz: path.resolve(AQUI, '..', '..') });
  console.log(`Saída: ${destino}\nSHA-256 da saída: ${sha256}\nK=${resultado.K.K} M=${resultado.casos.M} conclusão=${resultado.conclusao}`);
}
