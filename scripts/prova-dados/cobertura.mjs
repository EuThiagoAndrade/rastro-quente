// Cobertura (plano, seção "Cobertura"): detecção e disponibilidade são atributos independentes por dia e satélite.
// Dia sem registro e sem evidência de lacuna é "cobertura não comprovada", nunca "coberto".

export function diasDoIntervalo(inicio, fim) {
  const dias = [];
  for (let ms = Date.parse(`${inicio}T00:00:00Z`); ms < Date.parse(`${fim}T00:00:00Z`); ms += 86_400_000) {
    dias.push(new Date(ms).toISOString().slice(0, 10));
  }
  return dias;
}

export const CLASSES_AVISO = ['lacuna_conhecida', 'incidencia_indeterminada', 'sem_incidencia'];

// Disponibilidade de um satélite num dia: lacuna conhecida vence incidência indeterminada, que vence "sem evidência".
// Um aviso classificado como 'sem_incidencia' (faixa fora do polígono) não vira lacuna e não prova cobertura.
function disponibilidade(avisos, dia, satelite) {
  const doDia = avisos.filter((a) => a.data === dia && a.satelites.includes(satelite));
  if (doDia.some((a) => a.classe === 'lacuna_conhecida')) return 'lacuna_conhecida';
  if (doDia.some((a) => a.classe === 'incidencia_indeterminada')) return 'incidencia_indeterminada';
  return 'sem_evidencia_de_lacuna';
}

// deteccoes: { satelite: { dia: nRegistros } }. Retorna a tabela por dia, a cruzada e C nas duas unidades.
export function cobertura({ dias, satelites, deteccoes, avisos }) {
  for (const a of avisos) {
    if (!CLASSES_AVISO.includes(a.classe)) throw new Error(`Aviso de ${a.data} com classe inválida: ${a.classe}`);
  }
  const porSatelite = {};
  const diasComProblema = new Set();
  let cp = 0;
  for (const satelite of satelites) {
    const linhas = [];
    const cruzada = {};
    for (const dia of dias) {
      const registros = deteccoes[satelite]?.[dia] ?? 0;
      const deteccao = registros > 0 ? 'com_registro' : 'sem_registro';
      const disp = disponibilidade(avisos, dia, satelite);
      linhas.push({ dia, registros, deteccao, disponibilidade: disp });
      cruzada[`${deteccao}|${disp}`] = (cruzada[`${deteccao}|${disp}`] ?? 0) + 1;
      if (disp !== 'sem_evidencia_de_lacuna') {
        diasComProblema.add(dia);
        cp += 1;
      }
    }
    porSatelite[satelite] = {
      dias: linhas,
      cruzada,
      coberturaNaoComprovada: cruzada['sem_registro|sem_evidencia_de_lacuna'] ?? 0,
    };
  }
  return { porSatelite, C: { d: diasComProblema.size, p: cp } };
}
