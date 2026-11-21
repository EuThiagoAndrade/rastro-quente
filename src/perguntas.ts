// Catálogo fechado compartilhado; nunca recebe texto ou comandos do modelo.
export const PERGUNTAS = {
  panorama: 'O que chama atenção neste período?',
  mudanca: 'O que mudou em relação ao outro período?',
  padroes: 'Quais locais apresentam mais de um padrão?',
  cuidados: 'Onde devo interpretar os resultados com mais cuidado?',
  proximos: 'O que vale examinar em seguida?',
} as const;
export type Pergunta = keyof typeof PERGUNTAS;
export const IDS_PERGUNTAS = Object.keys(PERGUNTAS) as Pergunta[];
