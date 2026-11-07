// Disponibilidade D1 (plano 003): dia GMT × satélite × município IBGE, separada da presença de detecção.
// Classes por precedência: lacuna_conhecida > incidencia_indeterminada > sem_evidencia_de_lacuna.
// 'sem_incidencia' só descreve a relação aviso × município; não é classe de disponibilidade nem prova cobertura.
// Histórico de avisos ausente ou incompleto: H1 (incidência indeterminada, motivo historico_ausente_ou_incompleto),
// com parada H3 antes de publicar.

export const CLASSES = ['lacuna_conhecida', 'incidencia_indeterminada', 'sem_evidencia_de_lacuna'];
export const ALCANCES = ['verificado', 'parcial', 'indisponivel'];
export const AVISO_SEM_EVIDENCIA = 'cobertura não comprovada';

// Relação de um polígono municipal com um semiplano de falta de dados ({ eixo: 'lon'|'lat', lado: 'menor'|'maior', valor }).
// O semiplano é convexo: todos os vértices dentro (estritamente) → município inteiro na área; todos fora → afastamento
// demonstrado; qualquer vértice sobre a linha ou dos dois lados → incidência parcial.
function relacaoComSemiplano(territorio, { eixo, lado, valor }) {
  const k = eixo === 'lon' ? 0 : 1;
  let dentro = 0;
  let fora = 0;
  for (const aneis of territorio.poligonos) {
    for (const [x, y] of aneis[0]) {
      const v = k === 0 ? x : y;
      const naArea = lado === 'menor' ? v < valor : v > valor;
      const alem = lado === 'menor' ? v > valor : v < valor;
      if (naArea) dentro += 1;
      else if (alem) fora += 1;
      else return 'parcial';
    }
  }
  if (fora === 0) return 'inteiro';
  if (dentro === 0) return 'fora';
  return 'parcial';
}

// Incidência de um aviso num município: { classe: lacuna_conhecida | incidencia_indeterminada | sem_incidencia, motivo }.
export function incidenciaDoAviso(aviso, municipio) {
  const humano = aviso.validacaoHumana?.municipios?.[municipio.codigo];
  if (humano) {
    if (![...CLASSES.slice(0, 2), 'sem_incidencia'].includes(humano)) throw new Error(`Validação humana inválida em ${aviso.id}: ${humano}`);
    return { classe: humano, motivo: 'validacao_humana' };
  }
  const d = aviso.delimitacao;
  if (!d || d.tipo === 'nao_delimitada') return { classe: 'incidencia_indeterminada', motivo: 'aviso_sem_area_delimitada' };
  if (d.tipo === 'semiplano') {
    const r = relacaoComSemiplano(municipio.territorio, d);
    if (r === 'inteiro') return { classe: 'lacuna_conhecida', motivo: 'aviso_abrange_municipio' };
    if (r === 'fora') return { classe: 'sem_incidencia', motivo: 'aviso_fora_do_municipio' };
    return { classe: 'incidencia_indeterminada', motivo: 'aviso_incidencia_parcial' };
  }
  throw new Error(`Delimitação não suportada em ${aviso.id}: ${d.tipo}`);
}

const ordem = (classe) => CLASSES.indexOf(classe);

// Classe de um município num dia/satélite. avisosDoDia: avisos já filtrados pelo dia e satélite.
export function classificarMunicipioDia({ avisosDoDia, municipio, historico }) {
  if (!ALCANCES.includes(historico)) throw new Error(`Alcance de histórico inválido: ${historico}`);
  const motivos = [];
  const avisos = [];
  let classe = 'sem_evidencia_de_lacuna';
  for (const aviso of avisosDoDia) {
    const inc = incidenciaDoAviso(aviso, municipio);
    avisos.push({ id: aviso.id, incidencia: inc.classe, motivo: inc.motivo });
    if (inc.classe === 'sem_incidencia') continue;
    motivos.push(inc.motivo);
    if (ordem(inc.classe) < ordem(classe)) classe = inc.classe;
  }
  if (historico !== 'verificado') {
    motivos.push('historico_ausente_ou_incompleto');
    if (ordem('incidencia_indeterminada') < ordem(classe)) classe = 'incidencia_indeterminada';
  }
  if (classe === 'sem_evidencia_de_lacuna') motivos.push('sem_aviso_incidente');
  return { classe, motivos: [...new Set(motivos)], historico, avisos, aviso: classe === 'sem_evidencia_de_lacuna' ? AVISO_SEM_EVIDENCIA : null };
}

// Tabela completa. avisos: [{ id, dias: ['AAAA-MM-DD'], satelites: [...], delimitacao, validacaoHumana }].
// historicoDoDia(dia) → 'verificado' | 'parcial' | 'indisponivel'.
export function disponibilidadeMunicipal({ dias, satelite, municipios, avisos, historicoDoDia }) {
  const linhas = [];
  for (const dia of dias) {
    const avisosDoDia = avisos.filter((a) => a.dias.includes(dia) && a.satelites.includes(satelite));
    const historico = historicoDoDia(dia);
    for (const municipio of municipios) {
      linhas.push({ dia, satelite, municipio: municipio.codigo, ...classificarMunicipioDia({ avisosDoDia, municipio, historico }) });
    }
  }
  return linhas;
}

// Contagem de dias por classe para um município (ou conjunto), sem converter ausência de classe em cobertura.
export function diasPorClasse(linhas) {
  const r = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  for (const l of linhas) r[l.classe] += 1;
  return r;
}

// Relatório de alcance H3: município-dias, dias e meses verificados, parciais e indisponíveis.
export function alcanceDoHistorico({ dias, municipios, historicoDoDia }) {
  const vazio = () => Object.fromEntries(ALCANCES.map((a) => [a, 0]));
  const municipioDias = vazio();
  const porDia = vazio();
  const porMesDias = {};
  for (const dia of dias) {
    const h = historicoDoDia(dia);
    if (!ALCANCES.includes(h)) throw new Error(`Alcance de histórico inválido em ${dia}: ${h}`);
    porDia[h] += 1;
    municipioDias[h] += municipios.length;
    const mes = dia.slice(0, 7);
    (porMesDias[mes] ??= vazio())[h] += 1;
  }
  const meses = vazio();
  const classificacaoMensal = {};
  for (const [mes, c] of Object.entries(porMesDias)) {
    const total = ALCANCES.reduce((s, a) => s + c[a], 0);
    const status = c.verificado === total ? 'verificado' : c.indisponivel === total ? 'indisponivel' : 'parcial';
    classificacaoMensal[mes] = { status, dias: c };
    meses[status] += 1;
  }
  return {
    municipioDias, dias: porDia, meses, classificacaoMensal,
    exigeParadaH3: municipioDias.parcial + municipioDias.indisponivel > 0,
  };
}

// Tabela de interrupções MODIS/Aqua da NASA (HTML): [{ dia, inicio, fim, comentario }] em UTC.
const MESES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function lerInterrupcoesAqua(html) {
  const linhas = [];
  for (const tr of html.split(/<tr[^>]*>/i).slice(1)) {
    const celulas = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
    if (celulas.length < 5 || !/^\d{4}-\d{3}$/.test(celulas[0])) continue;
    const m = /^([A-Za-z]+) (\d{1,2}), (\d{4})$/.exec(celulas[1]);
    if (!m || !MESES_EN.includes(m[1])) throw new Error(`Data não reconhecida na tabela de interrupções: "${celulas[1]}"`);
    const dia = `${m[3]}-${String(MESES_EN.indexOf(m[1]) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    linhas.push({ dia, inicio: celulas[2], fim: celulas[3], comentario: celulas[4] });
  }
  return linhas;
}
