// Janela de 12 meses completos (contrato do plano 003, "Janela") e envelope de fronteira da sensibilidade America/Cuiaba.
// Datas em GMT; início inclusivo e fim exclusivo.
import { desviosNoPeriodo } from '../prova-dados/fuso.mjs';

export const MESES_NA_JANELA = 12;
export const FUSO_SENSIBILIDADE = 'America/Cuiaba';

const mesSeguinte = (mes) => {
  const [a, m] = mes.split('-').map(Number);
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`;
};
const mesAnterior = (mes) => {
  const [a, m] = mes.split('-').map(Number);
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
};
export const inicioDoMes = (mes) => Date.parse(`${mes}-01T00:00:00Z`);

// Mês publicado e completo: arquivo existe e foi modificado depois do fim do mês (critério verificável pelo cabeçalho HTTP).
// Arquivo mensal modificado antes do fim do próprio mês ainda está em formação e não entra.
export function mesCompleto(mes, sonda, agoraMs) {
  if (!sonda || sonda.status !== 200 || !sonda.lastModified) return false;
  const fim = inicioDoMes(mesSeguinte(mes));
  return fim <= agoraMs && Date.parse(sonda.lastModified) >= fim;
}

// sondas: { 'AAAA-MM': { status, lastModified } }. Devolve os 12 meses consecutivos completos mais recentes.
// Não pula mês indisponível: se faltar um mês no meio, a janela termina antes dele ou falha.
export function escolherJanela(sondas, agoraMs) {
  const candidatos = Object.keys(sondas).sort();
  if (!candidatos.length) throw new Error('Nenhum mês sondado.');
  let fim = candidatos.at(-1);
  while (fim >= candidatos[0] && !mesCompleto(fim, sondas[fim], agoraMs)) fim = mesAnterior(fim);
  const meses = [];
  for (let m = fim; meses.length < MESES_NA_JANELA; m = mesAnterior(m)) {
    if (!mesCompleto(m, sondas[m], agoraMs)) {
      throw new Error(`Mês ${m} ausente ou incompleto antes de completar ${MESES_NA_JANELA} meses consecutivos terminando em ${fim}. Parado.`);
    }
    meses.unshift(m);
  }
  return { meses, inicio: `${meses[0]}-01`, fim: `${mesSeguinte(meses.at(-1))}-01` };
}

// Desvio fixo (horas) de America/Cuiaba em relação ao GMT no período; falha se houver mais de um (horário de verão).
export function desvioFixo(inicio, fim) {
  const desvios = desviosNoPeriodo(inicio, fim);
  if (desvios.length !== 1) throw new Error(`America/Cuiaba com desvios ${JSON.stringify(desvios)} entre ${inicio} e ${fim}. Parado.`);
  const m = /^GMT([+-])(\d{2}):(\d{2})$/.exec(desvios[0]);
  if (!m) throw new Error(`Desvio não reconhecido: ${desvios[0]}`);
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) + Number(m[3]) / 60);
}

// Intervalos [início, fim) em ms para uma consulta por datas de calendário inclusivas (AAAA-MM-DD).
// Principal em GMT; sensibilidade nas mesmas datas em America/Cuiaba, deslocada pelo desvio conferido no período.
export function intervalosDaConsulta(dataInicial, dataFinal) {
  if (dataFinal < dataInicial) throw new Error(`Período invertido: ${dataInicial} a ${dataFinal}.`);
  const inicio = Date.parse(`${dataInicial}T00:00:00Z`);
  const fim = Date.parse(`${dataFinal}T00:00:00Z`) + 86_400_000;
  if (!Number.isFinite(inicio) || !Number.isFinite(fim)) throw new Error(`Data inválida: ${dataInicial} a ${dataFinal}.`);
  const posterior = new Date(fim + 86_400_000).toISOString().slice(0, 10);
  const desvio = desvioFixo(dataInicial, posterior);
  const deslocamento = -desvio * 3_600_000;
  return { principal: [inicio, fim], sensibilidade: [inicio + deslocamento, fim + deslocamento], desvioHoras: desvio };
}

// Envelope persistido fora da janela principal para que toda consulta dentro da janela tenha sensibilidade completa.
// Com desvio negativo (UTC−4), a sensibilidade termina até |desvio| horas depois do fim da janela e começa dentro dela.
export function envelopeDaJanela(janela) {
  const desvio = desvioFixo(janela.inicio, new Date(Date.parse(`${janela.fim}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10));
  const inicioMs = Date.parse(`${janela.inicio}T00:00:00Z`);
  const fimMs = Date.parse(`${janela.fim}T00:00:00Z`);
  const deslocamento = -desvio * 3_600_000;
  const antes = deslocamento < 0 ? [inicioMs + deslocamento, inicioMs] : null;
  const depois = deslocamento > 0 ? [fimMs, fimMs + deslocamento] : null;
  const iso = (par) => par && { inicio: new Date(par[0]).toISOString(), fim: new Date(par[1]).toISOString() };
  return { fuso: FUSO_SENSIBILIDADE, desvioHoras: desvio, antes: iso(antes), depois: iso(depois) };
}

// Contagens de uma consulta sobre registros { ms, escopo } já classificados no território consultado.
// O total principal usa só o escopo 'principal'; a sensibilidade usa principal + envelope, no intervalo deslocado.
export function contarConsulta(registros, dataInicial, dataFinal) {
  const { principal, sensibilidade, desvioHoras } = intervalosDaConsulta(dataInicial, dataFinal);
  let totalGmt = 0;
  let totalCuiaba = 0;
  for (const r of registros) {
    if (r.escopo === 'principal' && r.ms >= principal[0] && r.ms < principal[1]) totalGmt += 1;
    if (r.ms >= sensibilidade[0] && r.ms < sensibilidade[1]) totalCuiaba += 1;
  }
  const iso = (ms) => new Date(ms).toISOString();
  return {
    principal: { fuso: 'GMT', inicio: iso(principal[0]), fim: iso(principal[1]), total: totalGmt },
    sensibilidade: { fuso: FUSO_SENSIBILIDADE, desvioHoras, inicio: iso(sensibilidade[0]), fim: iso(sensibilidade[1]), total: totalCuiaba },
    diferenca: totalCuiaba - totalGmt,
  };
}
