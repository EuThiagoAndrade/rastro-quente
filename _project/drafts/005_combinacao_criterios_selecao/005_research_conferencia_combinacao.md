# Ciclo 005 — conferência da combinação de lentes com a carga real

> **Ciclo:** `005`
> **Item:** 1 (issue #42): regra de combinação de lentes por célula de 0,05°; item 2 (issue #43): repetição da conferência e medição da interface (seção própria)
> **Gerado em:** 2026-11-12
> **Commit do código conferido:** `6b793c454492f9ef363c3670c5e33f0d3e72c3d2` (branch `feature/issue-42`)
> **Carga:** identidade `2134ff148b386593a2d89af9894a34ec4a7ef035a660c5652092dc42313e0db2`, AQUA_M-T, janela de 2025-11-01 a 2026-10-31 (dias GMT), publicada num Supabase local vazio pela CLI do ciclo `003` (exibição `intermediaria`, revisão 40), a mesma carga do ciclo `004`

Relatório sanitizado: só agregados de fontes públicas (INPE e IBGE). Brutos e os JSON das execuções ficam em `local/dados-prototipo/` (`conferencia-combinacao.json` e `conferencia-lentes.json`), fora do Git. As duas execuções registraram a mesma identidade de carga no início e no fim. Focos, destaques e células combinadas não comprovam incêndio, dano, autoria ou infração; combinar critérios não torna a seleção mais verdadeira ("e" a torna mais específica e "ou" a amplia).

## Ordem de execução

Conforme o plano ("Ordem dos gates com carga real"), no mesmo commit:

1. testes unitários (casos CB-1 a CB-16 e os do ciclo `004`), `typecheck` e `build`;
2. `npm run conferir:combinacao`, seguida de `npm run conferir:lentes`, que repete as três lentes;
3. `npm run test:rls` e `npm run test:e2e`.

A medição (`medir:lentes`) pertence ao item 2. As duas conferências partem de `supabase db reset` e publicam a carga sozinhas.

## Conferência independente

Dois caminhos sem código de cálculo compartilhado:

- **A:** RPCs existentes sob RLS (RP fictício `.test`, criado e removido pelo script) → carregador → `combinar`, que calcula as lentes escolhidas sobre a entrada conferida (T8) → disponibilidade dos municípios das células → `qualificarCombinacao`;
- **B:** SQL escrito à parte, como administrador, direto nas tabelas, sem importar `src/lentes/`. A célula T1 de cada detecção sai de `floor(x · 20)` em `numeric`, sobre o texto decimal de `saidas/deteccoes.csv`. O SQL calcula, por célula, as três marcas (concentração por projeção P1, com corte no 10º e empatados; recorrência com 3 meses, se a janela tocar 3; persistência por ilhas de 3 ou mais dias consecutivos) e, para cada combinação, a seleção "e"/"ou" e a evidência em união.

Em cada janela e em cada uma das 8 combinações (os 3 pares e as três lentes, com "e" e com "ou"), foram comparados, célula a célula:

- o estado (`com_celulas`, `sem_celulas` ou `indisponivel`) e o número de células;
- as lentes que destacaram cada célula e a evidência em união (contagem e hash MD5 dos `id_tecnico` ordenados);
- na concentração, cada município destacado na célula, com a contagem, o hash da evidência e o texto completo do motivo, e a ressalva de projeção;
- na recorrência, os meses, a evidência e o texto de cada ressalva de mês parcial;
- na persistência, cada sequência (início, fim, dias, detecções e hash da evidência) e o texto completo das ressalvas de borda e por classe, calculadas sequência a sequência;
- os municípios da cobertura, o "N de M" e os dias restritivos com a classe da célula (por hash);
- a ordem das células (norte→sul, depois oeste→leste).

**Resultado: conferido, sem divergência nas quatro janelas e nas 8 combinações.**

**Prova de sensibilidade do comparador.** Antes da execução final, uma execução com uma mutação temporária no módulo (a ressalva de projeção acrescentada também às células sem município não destacado) terminou `divergente`, com as células afetadas apontadas no critério da concentração. A mutação foi desfeita antes do commit conferido.

**Grade T1 por `id_tecnico`.** As 10.640 detecções caíram na mesma célula pelos dois caminhos (texto da fonte em `numeric` × `celulaDe` sobre o caminho RPC).

### Células por combinação

Número de células; entre parênteses, os municípios da cobertura (os de todas as detecções das células).

| Janela | Total principal | c e r | c ou r | c e p | c ou p | r e p | r ou p | as três, e | as três, ou |
| :-- | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| Inteira (2025-11-01 a 2026-10-31) | 10.640 | 77 (12) | 1.090 (55) | 31 (8) | 1.046 (42) | 9 (7) | 201 (61) | 6 (4) | 1.116 (65) |
| 2026-08-01 a 2026-10-31 | 6.416 | 14 (6) | 749 (22) | 22 (7) | 766 (35) | 2 (2) | 57 (30) | 1 (1) | 768 (36) |
| 2026-10-01 a 2026-10-31 | 761 | indisponível | indisponível | 1 (1) | 176 (13) | indisponível | indisponível | indisponível | indisponível |
| 2026-07-15 a 2026-09-14 (bordas parciais) | 4.839 | 3 (3) | 606 (21) | 21 (8) | 615 (29) | 0 | 45 (25) | 0 | 621 (31) |

c = concentração, r = recorrência, p = persistência.

- **Indisponível:** em outubro de 2026 a janela toca 1 mês GMT, e toda combinação com a recorrência traz "recorrência não se aplica a esta janela: a janela toca 1 mês GMT; a recorrência exige pelo menos 3", sem células. A combinação de concentração e persistência é calculada.
- **Sem células:** na janela de 15/07 a 14/09, "recorrência e persistência" e "as três, e" ficam `sem_celulas`; as lentes rodaram e não há célula em comum.
- **Cobertura:** todas as células de uma mesma janela têm a mesma cobertura: 286 de 365 dias sem evidência de lacuna na janela inteira, 72 de 92 em ago–out, 22 de 31 em outubro e 48 de 62 na janela de bordas parciais (cobertura não comprovada). A janela inteira e a de bordas parciais repetem os valores do ciclo `004`.

### Projeção e cobertura na janela inteira

- **Ressalva de projeção:** 20 das 1.116 células da união das três têm detecções de município não destacado pela concentração e recebem a ressalva. Na interseção de concentração e recorrência, são 2 das 77.
- **Células com mais de um município:** 36 na união das três.
- **Evidência em união:** 5.375 detecções na união das três; 5.187 em "concentração ou recorrência".
- **Municípios da cobertura:** 65 na união das três. O plano estimou "provavelmente mais de 61" e um limite de cerca de 70 para o orçamento de bytes (3.861.971 + 65 × 87.453 = 9.546.416 bytes brutos pela estimativa, ainda sem medição). A medição pertence ao item 2.

## Comparação com a análise exploratória da ideação

O caminho B reproduz todos os números por célula que o plano manda refazer:

| Janela | Combinação | Ideação | SQL (caminho B) |
| :-- | :-- | --: | --: |
| Inteira | As três, "e" | 6 | 6 |
| Inteira | As três, "ou" | 1.116 | 1.116 |
| Inteira | Concentração e recorrência | 77 | 77 |
| Inteira | Concentração e persistência | 31 | 31 |
| Inteira | Recorrência e persistência | 9 | 9 |
| Inteira | Concentração ou recorrência | 1.090 | 1.090 |
| Inteira | Recorrência ou persistência | 201 | 201 |
| 2026-08-01 a 2026-10-31 | As três, "e" | 1 | 1 |
| 2026-08-01 a 2026-10-31 | Concentração e recorrência | 14 | 14 |
| 2026-08-01 a 2026-10-31 | Concentração e persistência | 22 | 22 |
| 2026-08-01 a 2026-10-31 | Recorrência e persistência | 2 | 2 |

Números novos, que a ideação não mediu, ficam registrados acima: "concentração ou persistência" com 1.046 células na janela inteira e as janelas de outubro e de bordas parciais.

Também conferem, sem fazer parte da lista do plano:

- "concentração ou recorrência" com 5.187 detecções, o mesmo total por detecção da ideação;
- 2 células com projeção entre as 77 de concentração e recorrência, coerente com "77 têm alguma detecção de município destacado, 75 têm todas".

Os demais números "por detecção" e "por município" da ideação medem outra unidade e não se comparam com a evidência por célula.

## Lentes do ciclo `004` sem mudança

`npm run conferir:lentes` no mesmo commit terminou `conferido` nas quatro janelas do ciclo `004`, sem divergência. Na janela inteira: 10 municípios na concentração, 150 células na recorrência e 66 sequências na persistência, os números do relatório do ciclo `004`. Os casos de referência do ciclo `004` passam sem alteração.

## Item 2 — conferência repetida e medição da interface

No commit `6b61568` (branch `feature/issue-43`), com a interface da combinação, em 2026-11-12:

- `npm run conferir:combinacao` terminou `conferido`, sem divergência nas quatro janelas e nas 8 combinações, com a mesma identidade de carga no início e no fim. A única mudança do item 2 no módulo é o texto da limitação geral por operador (R2-1), que a conferência não compara.
- `npm run medir:lentes`, estendido com as 8 configurações da combinação, repetiu as três lentes no procedimento do plano `004`: Chrome 157, 390×844 com toque, 150 ms de latência, 1,6 Mbit/s de descida, 750 kbit/s de subida, CPU 4× mais lenta, cache desligado e contexto novo por execução, passagens bruta e comprimida (gzip nível 6 no proxy local). Todas as configurações tiveram 3 execuções válidas em cada passagem, sem tentativa inválida.

| Configuração (janela inteira) | Células | Municípios da cobertura | Mediana comprimida | Maior total bruto (bytes) | Orçamento |
| :-- | --: | --: | --: | --: | :-- |
| Concentração | — | 10 | 5,9 s | 4.859.185 | Dentro |
| Recorrência | — | 51 | 14,5 s | 8.322.074 | Dentro |
| Persistência | — | 33 | 8,2 s | 6.747.920 | Dentro |
| Concentração e recorrência | 77 | 12 | 6,3 s | 4.911.407 | Dentro |
| Concentração ou recorrência | 1.090 | 55 | 53,3 s | 8.671.886 | Fora (tempo) |
| Concentração e persistência | 31 | 8 | 5,9 s | 4.561.595 | Dentro |
| Concentração ou persistência | 1.046 | 42 | 40,9 s | 7.534.997 | Fora (tempo) |
| Recorrência e persistência | 9 | 7 | 5,7 s | 4.474.142 | Dentro |
| Recorrência ou persistência | 201 | 61 | 15,7 s | 9.196.604 | Dentro |
| As três, e | 6 | 4 | 5,5 s | 4.211.783 | Dentro |
| As três, ou | 1.116 | 65 | 54,5 s | 9.546.411 | Fora (tempo) |

- **Bytes:** os registros custam 3.861.971 bytes brutos em todas as configurações, e a disponibilidade 87.453 por município, como no ciclo `004`. A estimativa do plano para "as três, ou" (9.546.416) ficou a 5 bytes do medido. Nenhuma configuração passou de 10.000.000.
- **Tempo:** as três lentes repetiram os números do ciclo `004` (5,9, 14,3 e 8,7 s). As três uniões com mais de mil células passaram de 20,0 s. O tempo cresce com o número de células, e não com os bytes (cerca de 600 kB comprimidos nas três, como na recorrência): a causa provável é o processamento no navegador a cada resposta de disponibilidade, não confirmada.
- **Decisão:** o responsável aceitou o desvio de tempo em 2026-11-12 (alternativa 1 da parada do plano), com o progresso visível, e adiou a otimização. O registro está em `005_task_issue-43.md`, seção "Parada do orçamento".
- Células e municípios da cobertura iguais aos da conferência independente.

## Limitações

- A conferência roda só localmente, com a carga real em `local/`; a CI roda os casos fictícios.
- A cobertura da carga é uniforme entre municípios (79 dias indeterminados em toda MT), por isso todas as células de uma janela têm o mesmo "N de M". Os casos CB-7, CB-10 e CB-11 exercitam coberturas diferentes por célula.
- O hash MD5 resume listas longas na comparação. Uma colisão que escondesse uma diferença é desprezível para este fim.
