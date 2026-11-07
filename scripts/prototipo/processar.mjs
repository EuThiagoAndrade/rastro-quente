// Processamento local do item 1 (ciclo 003): recorte de AQUA_M-T em Mato Grosso pela malha municipal IBGE,
// envelope de sensibilidade, divergências, disponibilidade D1, alcance H3 e medição. Dry-run: nenhum banco ou provedor.
import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { classificarPonto, criarTerritorio } from '../prova-dados/geo.mjs';
import { diasDoIntervalo } from '../prova-dados/cobertura.mjs';
import { sha256Arquivo } from '../prova-dados/obter.mjs';
import { alcanceDoHistorico, CLASSES, diasPorClasse, disponibilidadeMunicipal, lerInterrupcoesAqua } from './disponibilidade.mjs';
import { desvioFixo } from './janela.mjs';
import { lerArquivo } from './leitura.mjs';
import { AVISOS, BRUTOS, FONTES, LOCAL, lerJson, SAIDAS, salvarJson } from './caminhos.mjs';
import { atribuir, criarMalhaMunicipal } from './territorio.mjs';

const HORA_MS = 3_600_000;
const mesDe = (ms) => new Date(ms).toISOString().slice(0, 7);
const diaDe = (ms) => new Date(ms).toISOString().slice(0, 10);
const inc = (obj, chave, n = 1) => {
  obj[chave] = (obj[chave] ?? 0) + n;
};
const csv = (v) => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v));

// Bytes e vértices por município e do conjunto, para uma malha (classificação ou exibição).
export function medirMalha(colecao, bytesArquivo) {
  const porMunicipio = {};
  let vertices = 0;
  for (const f of colecao.features) {
    const texto = JSON.stringify(f);
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const v = polys.reduce((s, aneis) => s + aneis.reduce((t, anel) => t + anel.length, 0), 0);
    vertices += v;
    porMunicipio[f.properties.codarea] = { bytes: Buffer.byteLength(texto), bytesGzip: gzipSync(texto).length, vertices: v };
  }
  const bytes = Object.values(porMunicipio).map((m) => m.bytes).sort((a, b) => a - b);
  const q = (p) => bytes[Math.min(bytes.length - 1, Math.floor(p * bytes.length))];
  return {
    municipios: colecao.features.length,
    vertices,
    bytesArquivo,
    bytesGzipArquivo: null,
    bytesPorMunicipio: { minimo: bytes[0], mediana: q(0.5), p90: q(0.9), maximo: bytes.at(-1), soma: bytes.reduce((s, b) => s + b, 0) },
    porMunicipio,
  };
}

async function bytesDoDiretorio(dir) {
  let total = 0;
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile()) total += (await stat(path.join(e.parentPath ?? e.path, e.name))).size;
  }
  return total;
}

// Núcleo testável: percorre as fontes de focos e devolve registros persistíveis, exclusões, divergências e ambiguidades.
// fontesFocos: [{ id, papel, sha256, arquivo, mes? }]; envelope: { inicio, fim } ISO; conferencia opcional.
export async function recortar({ fontesFocos, malha, contornoEstadual, satelite, estado, envelope }) {
  const env = [Date.parse(envelope.inicio), Date.parse(envelope.fim)];
  const r = {
    leitura: {}, registros: [], conferenciaEnvelope: [], invalidas: [], ambiguos: [],
    exclusoes: {}, divergencias: { lista: [], contagem: {} },
  };
  for (const fonte of fontesFocos) {
    const l = (r.leitura[fonte.id] = { linhas: 0, outroSatelite: 0, satelite: 0, invalidas: 0, persistidas: 0, excluidas: {} });
    const mesInicio = fonte.mes ? Date.parse(`${fonte.mes}-01T00:00:00Z`) : null;
    const mesFim = fonte.mes ? Date.parse(new Date(Date.UTC(Number(fonte.mes.slice(0, 4)), Number(fonte.mes.slice(5, 7)), 1)).toISOString()) : null;
    for await (const item of lerArquivo(fonte.arquivo, satelite, fonte.id)) {
      l.linhas += 1;
      if (item.invalida) {
        l.invalidas += 1;
        r.invalidas.push({ fonte: fonte.id, linha: item.linha, motivo: item.invalida });
        continue;
      }
      if (item.outroSatelite) {
        l.outroSatelite += 1;
        continue;
      }
      l.satelite += 1;
      const f = item.registro;
      const excluir = (motivo) => {
        inc(l.excluidas, motivo);
        if (fonte.papel !== 'conferencia') inc(r.exclusoes, motivo);
      };
      let escopo;
      if (fonte.papel === 'principal') {
        if (f.ms < mesInicio || f.ms >= mesFim) {
          excluir('fora_do_mes_do_arquivo');
          continue;
        }
        escopo = 'principal';
      } else if (fonte.papel === 'envelope' || fonte.papel === 'conferencia') {
        if (f.ms < env[0] || f.ms >= env[1]) {
          excluir('fora_do_envelope');
          continue;
        }
        escopo = 'envelope';
      } else throw new Error(`Papel de fonte desconhecido: ${fonte.papel}`);

      const t = atribuir(malha, f.lon, f.lat);
      const noContorno = contornoEstadual ? classificarPonto(f.lon, f.lat, contornoEstadual) !== 'fora' : null;
      const divergir = (tipo) => {
        inc(r.divergencias.contagem, `${escopo}:${tipo}`);
        if (fonte.papel !== 'conferencia') r.divergencias.lista.push({ tipo, escopo, fonte: fonte.id, linha: item.linha, idFonte: f.idFonte, dataHoraGmt: f.dataHoraGmt, lat: f.latTexto, lon: f.lonTexto, municipioIbge: t.codigo ?? null, municipioInpe: f.municipioInpe, estadoInpe: f.estadoInpe });
      };
      if (t.tipo === 'fora') {
        if (fonte.papel !== 'conferencia') {
          if (f.estadoInpe === estado) divergir('inpe_no_estado_fora_da_malha');
          if (noContorno) divergir('no_contorno_estadual_sem_municipio');
        }
        excluir('fora_de_mt');
        continue;
      }
      if (t.tipo === 'ambiguo') {
        r.ambiguos.push({ fonte: fonte.id, linha: item.linha, idFonte: f.idFonte, dataHoraGmt: f.dataHoraGmt, lat: f.latTexto, lon: f.lonTexto, municipios: t.municipios });
        excluir('ambiguo_aguarda_decisao');
        continue;
      }
      const registro = {
        idTecnico: `${fonte.sha256.slice(0, 16)}:${item.linha}`, fonte: fonte.id, linha: item.linha, idFonte: f.idFonte,
        dataHoraGmt: f.dataHoraGmt, ms: f.ms, lat: f.latTexto, lon: f.lonTexto, municipio: t.codigo, posicao: t.posicao,
        municipioInpe: f.municipioInpe, estadoInpe: f.estadoInpe, escopo,
      };
      if (fonte.papel === 'conferencia') {
        r.conferenciaEnvelope.push(registro);
        continue;
      }
      if (f.estadoInpe !== estado) divergir('inpe_outra_uf_na_malha');
      else if (f.municipioInpe !== t.codigo) divergir('inpe_outro_municipio');
      if (noContorno === false) divergir('municipio_fora_do_contorno_estadual');
      l.persistidas += 1;
      r.registros.push(registro);
    }
  }
  return r;
}

// Agregações sobre os registros persistíveis: principal em GMT; sensibilidade America/Cuiaba por mês com o envelope.
export function agregar(registros, janela, desvioHoras) {
  const inicio = Date.parse(`${janela.inicio}T00:00:00Z`);
  const fim = Date.parse(`${janela.fim}T00:00:00Z`);
  const a = { estadoPorMes: {}, estadoPorDia: {}, municipioPorMes: {}, cuiaba: { estadoPorMes: {}, municipioPorMes: {} }, bordas: 0, total: 0, envelope: 0 };
  for (const m of janela.meses) {
    a.estadoPorMes[m] = 0;
    a.cuiaba.estadoPorMes[m] = 0;
  }
  for (const r of registros) {
    const local = r.ms + desvioHoras * HORA_MS;
    if (local >= inicio && local < fim) {
      inc(a.cuiaba.estadoPorMes, mesDe(local));
      inc((a.cuiaba.municipioPorMes[r.municipio] ??= {}), mesDe(local));
    }
    if (r.escopo !== 'principal') {
      a.envelope += 1;
      continue;
    }
    a.total += 1;
    if (r.posicao === 'borda') a.bordas += 1;
    inc(a.estadoPorMes, mesDe(r.ms));
    inc(a.estadoPorDia, diaDe(r.ms));
    inc((a.municipioPorMes[r.municipio] ??= {}), mesDe(r.ms));
  }
  a.diferencaCuiabaMenosGmtPorMes = Object.fromEntries(janela.meses.map((m) => [m, a.cuiaba.estadoPorMes[m] - a.estadoPorMes[m]]));
  return a;
}

// Repetição e ausência de id_fonte entre os registros persistíveis (mantidos; só contabilizados).
export function relatorioIdFonte(registros) {
  const contagem = new Map();
  let vazios = 0;
  for (const r of registros) {
    if (r.idFonte === null) vazios += 1;
    else contagem.set(r.idFonte, (contagem.get(r.idFonte) ?? 0) + 1);
  }
  const repetidos = [...contagem].filter(([, n]) => n > 1);
  return { distintos: contagem.size, vazios, idsRepetidos: repetidos.length, linhasComIdRepetido: repetidos.reduce((s, [, n]) => s + n, 0), repetidos: repetidos.map(([id, n]) => ({ idFonte: id, linhas: n })) };
}

// Envelope × conferência: mesmos registros (id_fonte, instante, coordenadas, município) nos dois arquivos?
export function conferirEnvelope(envelope, conferencia) {
  const chave = (r) => `${r.idFonte}|${r.dataHoraGmt}|${r.lat}|${r.lon}|${r.municipio}`;
  const contar = (lista) => lista.reduce((m, r) => m.set(chave(r), (m.get(chave(r)) ?? 0) + 1), new Map());
  const a = contar(envelope);
  const b = contar(conferencia);
  let soNoEnvelope = 0;
  let soNaConferencia = 0;
  for (const [k, n] of a) soNoEnvelope += Math.max(0, n - (b.get(k) ?? 0));
  for (const [k, n] of b) soNaConferencia += Math.max(0, n - (a.get(k) ?? 0));
  return { envelope: envelope.length, conferencia: conferencia.length, soNoEnvelope, soNaConferencia, identicos: soNoEnvelope === 0 && soNaConferencia === 0 };
}

async function escreverCsv(arquivo, cabecalho, linhas) {
  const texto = `${cabecalho.join(',')}\n${linhas.map((l) => l.map(csv).join(',')).join('\n')}${linhas.length ? '\n' : ''}`;
  await writeFile(arquivo, texto);
  return { arquivo: path.basename(arquivo), bytes: Buffer.byteLength(texto), linhas: linhas.length, sha256: createHash('sha256').update(texto).digest('hex') };
}

export async function executar() {
  const t = { inicio: performance.now() };
  const marcar = (_fase, desde) => Math.round(performance.now() - desde);
  const amostrasMemoria = [];
  const relogio = setInterval(() => amostrasMemoria.push(process.memoryUsage().rss), 500);
  try {
    const fontes = await lerJson(FONTES);
    const registroAvisos = await lerJson(AVISOS);
    const { janela, envelope } = fontes;
    if (!janela || !envelope?.depois) throw new Error('Janela/envelope não fixados em fontes.json.');

    // 1. Integridade dos insumos.
    let t0 = performance.now();
    const insumos = [];
    for (const item of fontes.itens) {
      const sha256 = await sha256Arquivo(path.join(BRUTOS, item.destino));
      if (sha256 !== item.sha256) throw new Error(`SHA-256 de ${item.destino} diverge de fontes.json. Parado.`);
      insumos.push({ id: item.id, papel: item.papel, bytes: item.tamanho, sha256 });
    }
    for (const chave of ['paginaInpe', 'interrupcoesNasa']) {
      const ref = registroAvisos[chave];
      if (fontes.itens.find((i) => i.id === ref.itemFonte)?.sha256 !== ref.sha256) throw new Error(`avisos.json (${chave}) não corresponde ao item ${ref.itemFonte} de fontes.json. Parado.`);
    }
    const tVerificacao = marcar('verificacao', t0);

    // 2. Território.
    t0 = performance.now();
    const caminho = (id) => path.join(BRUTOS, fontes.itens.find((i) => i.id === id).destino);
    const malhaGeo = await lerJson(caminho('ibge-malha-mt-municipios-maxima'));
    const malha = criarMalhaMunicipal(malhaGeo);
    const contornoEstadual = criarTerritorio(await lerJson(caminho('ibge-malha-mt-estado-maxima')));
    const localidades = await lerJson(caminho('ibge-municipios-mt'));
    const nomes = Object.fromEntries(localidades.map((m) => [String(m.id), m.nome]));
    const codigosMalha = malha.municipios.map((m) => m.codigo).sort();
    const codigosLista = Object.keys(nomes).sort();
    const listaConfere = JSON.stringify(codigosMalha) === JSON.stringify(codigosLista);
    const tTerritorio = marcar('territorio', t0);

    // 3. Recorte em fluxo.
    t0 = performance.now();
    const fontesFocos = fontes.itens.filter((i) => i.tipo === 'inpe-focos').map((i) => ({
      id: i.id, papel: i.papel, sha256: i.sha256, arquivo: path.join(BRUTOS, i.destino),
      mes: i.papel === 'principal' ? `${i.id.slice(-6, -2)}-${i.id.slice(-2)}` : null,
    }));
    const recorte = await recortar({ fontesFocos, malha, contornoEstadual, satelite: fontes.contrato.satelite, estado: fontes.contrato.estado.codigoIbge, envelope: envelope.depois });
    const tClassificacao = marcar('classificacao', t0);

    // 4. Agregação, id_fonte e envelope.
    t0 = performance.now();
    const desvio = desvioFixo(janela.inicio, diaDe(Date.parse(`${janela.fim}T00:00:00Z`) + 86_400_000));
    if (desvio !== envelope.desvioHoras) throw new Error('Desvio America/Cuiaba diverge do envelope fixado. Parado.');
    const agregados = agregar(recorte.registros, janela, desvio);
    const idFonte = relatorioIdFonte(recorte.registros);
    const envelopeRegistros = recorte.registros.filter((r) => r.escopo === 'envelope');
    const confEnvelope = conferirEnvelope(envelopeRegistros, recorte.conferenciaEnvelope);

    // 5. Disponibilidade D1 e alcance H3.
    const dias = diasDoIntervalo(janela.inicio, janela.fim);
    const historicoDoDia = (dia) => {
      const p = registroAvisos.historico.find((h) => h.satelite === fontes.contrato.satelite && dia >= h.inicio && dia < h.fim);
      return p ? p.alcance : 'indisponivel';
    };
    const interrupcoes = lerInterrupcoesAqua(await readFile(caminho('nasa-modaps-interrupcoes-aqua'), 'utf8'));
    const naJanela = interrupcoes.filter((x) => x.dia >= janela.inicio && x.dia < janela.fim);
    const diasComAvisoInpe = new Set(registroAvisos.avisos.flatMap((a) => a.dias));
    const diasInterrupcao = [...new Set(naJanela.map((x) => x.dia))].sort();
    const decisaoH3 = registroAvisos.decisaoH3 ?? null;
    const regraHistorico = decisaoH3?.regra ?? 'H1';
    const disponibilidade = disponibilidadeMunicipal({
      dias, satelite: fontes.contrato.satelite, municipios: malha.municipios, avisos: registroAvisos.avisos, historicoDoDia,
      regraHistorico, diasInterrupcaoNasa: new Set(diasInterrupcao),
    });
    const alcance = alcanceDoHistorico({ dias, municipios: malha.municipios, historicoDoDia });
    const avisosPendentes = registroAvisos.avisos.filter((a) => (!a.delimitacao || a.delimitacao.tipo === 'nao_delimitada') && !a.validacaoHumana).map((a) => a.id);
    const tAgregacao = marcar('agregacao', t0);

    // 6. Geometrias de classificação e de exibição.
    const geometrias = {};
    for (const id of ['ibge-malha-mt-municipios-maxima', 'ibge-malha-mt-municipios-intermediaria', 'ibge-malha-mt-municipios-minima']) {
      const texto = await readFile(caminho(id));
      const m = medirMalha(JSON.parse(texto), texto.length);
      m.bytesGzipArquivo = gzipSync(texto).length;
      geometrias[id] = m;
    }

    // 7. Saídas locais.
    const saidas = [];
    saidas.push(await escreverCsv(path.join(SAIDAS, 'deteccoes.csv'),
      ['id_tecnico', 'fonte', 'linha', 'id_fonte', 'data_hora_gmt', 'lat', 'lon', 'municipio_ibge', 'posicao', 'municipio_inpe', 'estado_inpe', 'escopo'],
      recorte.registros.map((r) => [r.idTecnico, r.fonte, r.linha, r.idFonte, r.dataHoraGmt, r.lat, r.lon, r.municipio, r.posicao, r.municipioInpe, r.estadoInpe, r.escopo])));
    saidas.push(await escreverCsv(path.join(SAIDAS, 'divergencias.csv'),
      ['tipo', 'escopo', 'fonte', 'linha', 'id_fonte', 'data_hora_gmt', 'lat', 'lon', 'municipio_ibge', 'municipio_inpe', 'estado_inpe'],
      recorte.divergencias.lista.map((d) => [d.tipo, d.escopo, d.fonte, d.linha, d.idFonte, d.dataHoraGmt, d.lat, d.lon, d.municipioIbge, d.municipioInpe, d.estadoInpe])));
    saidas.push(await escreverCsv(path.join(SAIDAS, 'disponibilidade.csv'),
      ['dia_gmt', 'satelite', 'municipio_ibge', 'classe', 'motivos', 'historico', 'avisos', 'aviso_textual'],
      disponibilidade.map((d) => [d.dia, d.satelite, d.municipio, d.classe, d.motivos.join('|'), d.historico, d.avisos.map((a) => `${a.id}:${a.incidencia}`).join('|'), d.aviso])));
    await salvarJson(path.join(SAIDAS, 'ambiguos.json'), recorte.ambiguos);
    await salvarJson(path.join(SAIDAS, 'invalidas.json'), recorte.invalidas);
    await salvarJson(path.join(SAIDAS, 'id_fonte_repetidos.json'), idFonte.repetidos);

    const porMunicipio = Object.fromEntries(codigosMalha.map((c) => {
      const linhas = disponibilidade.filter((d) => d.municipio === c);
      return [c, { nome: nomes[c] ?? null, deteccoesPorMes: agregados.municipioPorMes[c] ?? {}, total: Object.values(agregados.municipioPorMes[c] ?? {}).reduce((s, n) => s + n, 0), diasPorClasse: diasPorClasse(linhas) }];
    }));

    const paradas = [];
    if (recorte.invalidas.length) paradas.push(`linhas_invalidas:${recorte.invalidas.length}`);
    if (recorte.ambiguos.length) paradas.push(`pontos_ambiguos:${recorte.ambiguos.length}`);
    if (!listaConfere) paradas.push('lista_de_municipios_diverge_da_malha');
    if (!confEnvelope.identicos) paradas.push('envelope_diverge_da_conferencia');
    if (alcance.exigeParadaH3 && !decisaoH3) paradas.push('h3_historico_parcial_ou_indisponivel');
    if (avisosPendentes.length) paradas.push(`avisos_aguardam_validacao_humana:${avisosPendentes.length}`);

    const tTotal = marcar('total', t.inicio);
    clearInterval(relogio);
    const relatorio = {
      geradoEm: new Date().toISOString(),
      modo: 'dry-run local; nenhuma escrita em banco ou provedor',
      escritaRemota: 'nenhuma',
      janela, envelope,
      insumos,
      territorio: { municipiosNaMalha: codigosMalha.length, municipiosNaLista: codigosLista.length, listaConfere, crs: 'Coordenadas geográficas [longitude, latitude] em graus, como servidas pela API v4 (GeoJSON sem membro crs; padrão RFC 7946).' },
      leitura: recorte.leitura,
      totais: {
        linhasLidas: Object.values(recorte.leitura).reduce((s, l) => s + l.linhas, 0),
        linhasDoSatelite: Object.values(recorte.leitura).reduce((s, l) => s + l.satelite, 0),
        persistiveis: recorte.registros.length,
        principal: agregados.total,
        envelope: agregados.envelope,
        exclusoes: recorte.exclusoes,
        invalidas: recorte.invalidas.length,
        ambiguos: recorte.ambiguos.length,
        pontosNaBorda: agregados.bordas,
      },
      divergencias: recorte.divergencias.contagem,
      idFonte: { ...idFonte, repetidos: undefined },
      conferenciaEnvelope: confEnvelope,
      contagens: { estadoPorMes: agregados.estadoPorMes, sensibilidadeCuiabaEstadoPorMes: agregados.cuiaba.estadoPorMes, diferencaCuiabaMenosGmtPorMes: agregados.diferencaCuiabaMenosGmtPorMes, desvioHoras: desvio },
      disponibilidade: {
        unidade: 'dia GMT × satélite × município IBGE',
        regraHistorico,
        decisaoH3,
        municipioDias: disponibilidade.length,
        porClasse: diasPorClasse(disponibilidade),
        porMotivo: disponibilidade.reduce((m, d) => { for (const x of d.motivos) inc(m, x); return m; }, {}),
        avisosAguardandoValidacaoHumana: avisosPendentes,
      },
      alcanceHistorico: {
        ...alcance,
        fontes: [registroAvisos.paginaInpe, registroAvisos.interrupcoesNasa],
        interrupcoesNasaNaJanela: { registros: naJanela.length, dias: diasInterrupcao.length, diasSemAvisoInpe: diasInterrupcao.filter((d) => !diasComAvisoInpe.has(d)).length },
        decisaoRegistrada: decisaoH3 ? { regra: decisaoH3.regra, em: decisaoH3.em } : null,
      },
      geometrias: Object.fromEntries(Object.entries(geometrias).map(([k, v]) => [k, { ...v, porMunicipio: undefined }])),
      saidas,
      medicao: {
        tempoMs: { verificacaoInsumos: tVerificacao, territorio: tTerritorio, classificacao: tClassificacao, agregacaoEDisponibilidade: tAgregacao, total: tTotal },
        memoria: { picoRssBytes: Math.max(...amostrasMemoria, process.memoryUsage().rss), maxRssProcessoBytes: process.resourceUsage().maxRSS * 1024 },
        disco: { brutosBytes: await bytesDoDiretorio(BRUTOS), saidasBytes: await bytesDoDiretorio(SAIDAS) },
      },
      paradas,
      situacao: paradas.length ? 'Parado' : 'Pronto',
    };
    await salvarJson(path.join(SAIDAS, 'agregados.json'), { janela, contagens: relatorio.contagens, porMunicipio, estadoPorDia: agregados.estadoPorDia, cuiabaMunicipioPorMes: agregados.cuiaba.municipioPorMes });
    await salvarJson(path.join(SAIDAS, 'geometrias_por_municipio.json'), Object.fromEntries(Object.entries(geometrias).map(([k, v]) => [k, v.porMunicipio])));
    await salvarJson(path.join(LOCAL, 'relatorio.json'), relatorio);
    console.log(JSON.stringify({ situacao: relatorio.situacao, paradas, totais: relatorio.totais, tempoMs: relatorio.medicao.tempoMs }, null, 2));
    if (paradas.length) process.exitCode = 3;
    return relatorio;
  } finally {
    clearInterval(relogio);
  }
}
