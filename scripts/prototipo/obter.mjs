// Obtenção verificável das fontes públicas do item 1 (ciclo 003). Node.js 24, sem dependências.
// Brutos em local/dados-prototipo/brutos/ (fora do Git); fontes.json versiona URL, bytes, SHA-256 e cabeçalhos.
import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat, readFile } from 'node:fs/promises';
import { lerShapefile } from './shapefile.mjs';
import { classificarArea, rotuloCitaMT } from './areas.mjs';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { sha256Arquivo } from '../prova-dados/obter.mjs';
import { escolherJanela, envelopeDaJanela } from './janela.mjs';

export const URL_MENSAL = (mes) => `https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/focos_mensal_br_${mes.replace('-', '')}.csv`;
export const URL_DIARIO = (dia) => `https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/Brasil/focos_diario_br_${dia.replaceAll('-', '')}.csv`;
const IBGE = 'https://servicodados.ibge.gov.br/api';
const MALHA = (qualidade, intra) => `${IBGE}/v4/malhas/estados/51?formato=application/vnd.geo+json&qualidade=${qualidade}${intra ? '&intrarregiao=municipio' : ''}`;
export const URL_AVISOS = 'https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/avisos/';

export const URL_CNUC = 'https://dados.mma.gov.br/dataset/44b6dc8a-dc82-4a84-8d95-1b0da7c85dac/resource/6ba9a557-87e8-4882-acb7-b3e0f0ea192d/download/shp_cnuc_2025_08.zip';
export const URL_FUNAI = 'https://geoserver.funai.gov.br/geoserver/Funai/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Funai%3Atis_poligonais&outputFormat=SHAPE-ZIP';
export const URL_INTERRUPCOES_AQUA = 'https://modaps.modaps.eosdis.nasa.gov/services/production/outages_aqua.html';

const vazio = { obtidoEm: null, tamanho: null, sha256: null, lastModified: null, etag: null };

// Retratos de áreas são datados e só recebem hash após validação T16/T17.
export function itensAreas(agoraIso) {
  const dia=agoraIso.slice(0,10).replaceAll('-','');
  const membros=(base,ext)=>({shp:`${base}.shp`,dbf:`${base}.dbf`,prj:`${base}.prj`,codificacao:`${base}.${ext}`});
  return [
    {id:'cnuc-2025-08',tipo:'areas-protegidas',papel:'areas',fonte:'cnuc',url:URL_CNUC,destino:`areas/cnuc-202508-${dia}.zip`,encoding:'utf-8',codigo:'cd_cnuc',campos:['cd_cnuc','nome_uc','quali_pol','esfera','uf','grupo','categoria','situacao','limite'],membros:membros('cnuc_2025_08','cpg'),condicoesUso:'CC BY (portal de dados abertos do MMA)',...vazio},
    {id:`funai-tis-${dia}`,tipo:'areas-protegidas',papel:'areas',fonte:'funai',url:URL_FUNAI,destino:`areas/funai-tis-poligonais-${dia}.zip`,encoding:'iso-8859-1',codigo:'terrai_cod',campos:['terrai_cod','terrai_nom','uf_sigla','fase_ti','modalidade'],membros:membros('tis_poligonais','cst'),condicoesUso:'Reprodução com citação da fonte (página de geoprocessamento); rodapé declara CC BY-ND 3.0; divergência aceita pelo responsável em 2026-11-12.',...vazio},
  ];
}

// Tabela de interrupções de dados MODIS/Aqua da NASA: fonte independente para conferir o alcance do histórico de avisos.
export const itemInterrupcoesAqua = (agoraIso) => ({
  id: 'nasa-modaps-interrupcoes-aqua', tipo: 'nasa-interrupcoes', papel: 'avisos', fonte: 'NASA MODAPS', url: URL_INTERRUPCOES_AQUA,
  destino: `nasa/outages_aqua_${agoraIso.slice(0, 10).replaceAll('-', '')}.html`,
  observacao: 'Página mutável; o SHA-256 fixa o conteúdo lido. Lista interrupções da cadeia de dados da NASA; não delimita área nem representa a recepção própria do INPE.', ...vazio,
});

// Itens do manifesto para uma janela fixada. Papel: principal, envelope, conferencia, territorio, exibicao ou avisos.
export function itensDaJanela(janela, envelope, agoraIso) {
  const itens = janela.meses.map((mes) => ({
    id: `inpe-mensal-${mes.replace('-', '')}`, tipo: 'inpe-focos', papel: 'principal', fonte: 'INPE', url: URL_MENSAL(mes),
    destino: `inpe/focos_mensal_br_${mes.replace('-', '')}.csv`, ...vazio,
  }));
  if (envelope.depois) {
    const dia = envelope.depois.inicio.slice(0, 10);
    itens.push({
      id: `inpe-diario-${dia.replaceAll('-', '')}`, tipo: 'inpe-focos', papel: 'envelope', fonte: 'INPE', url: URL_DIARIO(dia),
      destino: `inpe/focos_diario_br_${dia.replaceAll('-', '')}.csv`, ...vazio,
    });
    const mes = dia.slice(0, 7);
    itens.push({
      id: `inpe-mensal-${mes.replace('-', '')}-parcial`, tipo: 'inpe-focos', papel: 'conferencia', fonte: 'INPE', url: URL_MENSAL(mes),
      destino: `inpe/focos_mensal_br_${mes.replace('-', '')}_parcial_${agoraIso.slice(0, 10).replaceAll('-', '')}.csv`,
      observacao: 'Arquivo mensal ainda em formação; usado só para conferir a completude do envelope, nunca como fonte de contagem.', ...vazio,
    });
  }
  if (envelope.antes) throw new Error('Envelope anterior à janela não previsto para desvio negativo. Parado.');
  itens.push(
    { id: 'ibge-malha-mt-municipios-maxima', tipo: 'ibge-malha', papel: 'territorio', fonte: 'IBGE', url: MALHA('maxima', true), destino: 'ibge/malha_mt_municipios_v4_maxima.geojson', ...vazio },
    { id: 'ibge-malha-mt-municipios-intermediaria', tipo: 'ibge-malha', papel: 'exibicao', fonte: 'IBGE', url: MALHA('intermediaria', true), destino: 'ibge/malha_mt_municipios_v4_intermediaria.geojson', ...vazio },
    { id: 'ibge-malha-mt-municipios-minima', tipo: 'ibge-malha', papel: 'exibicao', fonte: 'IBGE', url: MALHA('minima', true), destino: 'ibge/malha_mt_municipios_v4_minima.geojson', ...vazio },
    { id: 'ibge-malha-mt-estado-maxima', tipo: 'ibge-malha', papel: 'territorio', fonte: 'IBGE', url: MALHA('maxima', false), destino: 'ibge/malha_mt_estado_v4_maxima.geojson', ...vazio },
    { id: 'ibge-metadados-mt', tipo: 'ibge-metadados', papel: 'territorio', fonte: 'IBGE', url: `${IBGE}/v4/malhas/estados/51/metadados`, destino: 'ibge/metadados_mt_v4.json', ...vazio },
    { id: 'ibge-municipios-mt', tipo: 'ibge-localidades', papel: 'territorio', fonte: 'IBGE', url: `${IBGE}/v1/localidades/estados/51/municipios`, destino: 'ibge/municipios_mt_v1.json', ...vazio },
    { id: 'inpe-avisos', tipo: 'inpe-avisos', papel: 'avisos', fonte: 'INPE', url: URL_AVISOS, destino: `inpe/avisos_${agoraIso.slice(0, 10).replaceAll('-', '')}.html`, observacao: 'Página mutável; o SHA-256 fixa o conteúdo lido.', ...vazio },
    itemInterrupcoesAqua(agoraIso),
  );
  itens.push(...itensAreas(agoraIso));
  return itens;
}

// Sonda (HEAD) os arquivos mensais de `ultimoMes` para trás e fixa janela, envelope e itens.
export async function fixarJanela({ ultimoMes, mesesSondados = 15, fetchFn = fetch, agora = () => new Date() }) {
  const sondas = {};
  let [a, m] = ultimoMes.split('-').map(Number);
  for (let i = 0; i < mesesSondados; i += 1) {
    const mes = `${a}-${String(m).padStart(2, '0')}`;
    const r = await fetchFn(URL_MENSAL(mes), { method: 'HEAD' });
    sondas[mes] = { status: r.status, lastModified: r.headers.get('last-modified'), tamanho: Number(r.headers.get('content-length')) || null };
    m -= 1;
    if (m === 0) [a, m] = [a - 1, 12];
  }
  const momento = agora();
  const janela = escolherJanela(sondas, momento.getTime());
  const envelope = envelopeDaJanela(janela);
  return {
    janela: { ...janela, fuso: 'GMT', fimExclusivo: true, fixadaEm: momento.toISOString(), criterio: 'Doze meses consecutivos mais recentes cujo arquivo mensal oficial existe e tem Last-Modified posterior ao fim do mês; mês em formação não entra.' },
    sondas,
    envelope,
    itens: itensDaJanela(janela, envelope, momento.toISOString()),
  };
}

async function existe(arquivo) {
  try {
    return await stat(arquivo);
  } catch {
    return null;
  }
}

async function baixar(url, destino, fetchFn) {
  const resposta = await fetchFn(url, { headers: { 'User-Agent': 'rastro-quente-carga' } });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status} ao obter ${url}`);
  const hash = createHash('sha256');
  let tamanho = 0;
  const medidor = new Transform({
    transform(pedaco, _c, pronto) {
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
    throw new Error(`Falha ao gravar ${url}: ${e.message}`);
  }
  if (!tamanho) { await rm(parcial, { force: true }); throw new Error(`Corpo vazio ao obter ${url}. Parado.`); }
  // Com Content-Encoding, o Content-Length mede o corpo comprimido; o fetch entrega o descomprimido.
  const esperado = resposta.headers.get('content-encoding') ? 0 : Number(resposta.headers.get('content-length'));
  if (esperado && esperado !== tamanho) {
    await rm(parcial, { force: true });
    throw new Error(`Download incompleto de ${url}: ${tamanho} de ${esperado} bytes.`);
  }
  return { parcial, sha256: hash.digest('hex'), tamanho, lastModified: resposta.headers.get('last-modified'), etag: resposta.headers.get('etag') };
}

// Garante um item: 'inalterado' (hash confere), 'baixado' ou erro. Hash divergente nunca é aceito silenciosamente.
export async function garantirItem(item, dirBrutos, { fetchFn = fetch, agora = () => new Date() } = {}) {
  const destino = path.join(dirBrutos, item.destino);
  if (await existe(destino)) {
    const sha256 = await sha256Arquivo(destino);
    if (!item.sha256) throw new Error(`${item.destino} existe localmente sem registro em fontes.json. Parado.`);
    if (sha256 !== item.sha256) throw new Error(`SHA-256 divergente em ${item.destino}: registrado ${item.sha256}, local ${sha256}. Parado.`);
    return { estado: 'inalterado', ms: 0, bytes: 0 };
  }
  const t0 = performance.now();
  const r = await baixar(item.url, destino, fetchFn);
  const ms = Math.round(performance.now() - t0);
  if (item.sha256 && item.sha256 !== r.sha256) {
    await rename(r.parcial, `${destino}.divergente`);
    throw new Error(`SHA-256 divergente ao baixar ${item.destino}: registrado ${item.sha256}, obtido ${r.sha256}. Parado.`);
  }
  if (item.papel === 'areas') {
    try {
      const {registros}=lerShapefile(await readFile(r.parcial), item);
      for(const registro of registros) if(classificarArea(item.fonte,registro.atributos).incluida) rotuloCitaMT(item.fonte,registro.atributos[item.fonte==='cnuc'?'uf':'uf_sigla']);
    }
    catch (e) {
      await rename(r.parcial, `${destino}.rejeitado`);
      throw new Error(`Arquivo de áreas rejeitado: ${e.message}`);
    }
  }
  await rename(r.parcial, destino);
  if (!item.sha256) Object.assign(item, { obtidoEm: agora().toISOString(), tamanho: r.tamanho, sha256: r.sha256, lastModified: r.lastModified, etag: r.etag });
  return { estado: 'baixado', ms, bytes: r.tamanho };
}
