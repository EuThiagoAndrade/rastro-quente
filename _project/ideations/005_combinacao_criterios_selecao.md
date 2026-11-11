# Ideação — 005: Combinação de critérios de seleção

> **Ciclo:** `005`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 005" em 2026-11-11
> **Criado em:** 2026-11-11
> **Última atualização:** 2026-11-11
> **handoff_schema_version:** `2`

## Problema

O ciclo `004` entregou o contrato de lente (C1) e três lentes independentes: concentração por município, recorrência por célula de 0,05° e persistência por célula de 0,05°. Hoje o usuário vê uma lente por vez. Não há como perguntar "quais áreas aparecem em mais de um critério" (interseção) ou "quais aparecem em qualquer critério" (união), nem ver qual critério destacou cada área.

As lentes não têm a mesma unidade: a concentração destaca município e as outras duas destacam célula. O plano `004` deixou isso explicitamente para o BL-005 ("combinar unidades de tipos diferentes fica para o BL-005"). A combinação é, portanto, regra de seleção (G1), e não só interface.

Benefício: seleções mais específicas, sem perder a explicação de qual critério destacou cada ponto.

Restrição de domínio: um destaque combinado orienta avaliação técnica e não comprova incêndio, dano, autoria ou infração. Combinar não torna a seleção mais verdadeira; só a torna mais específica.

## Origem no backlog

- **BL-005 — Combinação de critérios de seleção.** Item inteiro, sem parcela; Restante: `—`.
- **Síntese da necessidade (snapshot):** permitir combinar lentes já existentes por interseção ("e") ou união ("ou") sobre seus resultados, mantendo a explicação de qual critério destacou cada ponto. A combinação por pontuação com pesos é mais difícil de explicar e só entra por decisão do responsável. Depende do contrato de lente e de mais de uma lente implementada.
- **Referência:** `_project/backlog.md`, commit `2e31651` (fila `chore/backlog` e `main`), já integrado em `main` e `origin/main`; **não** é local nem pendente de publicação. O conteúdo do BL-005 não mudou desde a captura em `85b444d` (PR #31).
- **Destino em preparação.** O estado do item é `Disponível` e permanece assim. O retorno na fila (`ciclo 005 — AAAA-MM-DD — parcela`) só ocorre depois da integração comprovada do destino em `main`, e sua publicação exige autorização separada.
- **Itens relacionados, não selecionados:** BL-002, BL-003, BL-004 e BL-006 (novas fontes e lentes), BL-007 (visual), BL-008 (atualização) e BL-009 (IA).

## Contexto e evidências

Fatos verificados no repositório (`main` em `2e31651`):

- **Contrato C1 (KB-005, `src/lentes/contrato.ts`):** `ResultadoLente` com `destaques`; cada `Destaque` traz `id_destaque` (lente + unidade, e o dia inicial na persistência), `unidade` (município ou `celula_005`), `motivo`, `evidencia.deteccoes` (lista de `id_tecnico`), `cobertura` (qualificador D13/T7) e `ressalvas`. O contrato foi desenhado para esta combinação: "com carga, janela e `versao_metodo`, é a chave da combinação futura".
- **Denominador comum:** a evidência das três lentes é sempre uma lista de `id_tecnico`. A detecção é a única unidade que as três compartilham sem projeção.
- **Parâmetros vigentes (`lentes-004-v1`):** concentração N=10 com empatados (D16); recorrência k=3 meses GMT distintos na célula (D14: o mês tocado conta); persistência 3 ou mais dias GMT consecutivos na célula, cada sequência maximal é um destaque (T6). `ordenacao` só existe na concentração, e a KB-005 declara que nada ali prioriza áreas.
- **Estados de uma lente:** `com_destaques`, `sem_destaques` ou `janela_insuficiente` (recorrência com janela de menos de 3 meses GMT). A cobertura de cada destaque pode ficar `pendente`, `completa` ou `falha`.
- **Interface (KB-005, `src/app.ts`, `src/apresentacao-lentes.ts`):** seletor de uma lente, lista, camada de destaques no mapa e painel de motivo e evidência. A leitura dos registros é compartilhada: o carregador reaproveita os registros em memória se o total do resumo for o mesmo, e a carga e a janela fixam o resultado (ADR-007). Medições do ciclo `004`: medianas comprimidas de 5,9 s, 14,3 s e 8,7 s por lente, dentro do orçamento de 20,0 s.
- **Análise exploratória (2026-11-11).** Agregados calculados somente para leitura, pelas próprias funções de `src/lentes/` sobre a carga local (`local/dados-prototipo/saidas/deteccoes.csv`, fora do Git), por script temporário não versionado. **Não são casos de referência validados**; calibram as decisões e devem ser refeitos de forma independente no plano. Na janela inteira (2025-11-01 a 2026-10-31, 10.640 detecções principais), o resultado de cada lente reproduz o do ciclo `004` (10, 150 e 66 destaques):

| Medida (janela inteira) | Concentração | Recorrência | Persistência |
| :-- | --: | --: | --: |
| Destaques | 10 municípios | 150 células | 66 sequências em 60 células |
| Detecções na evidência | 4.488 | 1.485 | 531 |
| Células ocupadas por essas detecções | 1.017 | 150 | 60 |

  Há 3.290 células ocupadas no total, e 91 delas (2,8%) têm detecções de mais de um município (8 das 150 células de recorrência).

| Combinação (janela inteira) | Por detecção | Por célula | Por município |
| :-- | --: | --: | --: |
| Concentração e recorrência (interseção) | 786 | 77 | 10 |
| Concentração e persistência (interseção) | 321 | 31 | 8 |
| Recorrência e persistência (interseção) | 83 | 9 | 23 |
| As três (interseção) | 61 | 6 | 8 |
| Concentração ou recorrência (união) | 5.187 | 1.090 | 51 |
| Recorrência ou persistência (união) | 1.933 | 201 | 61 |

  - A união com a concentração é dominada por ela: por célula, a concentração sozinha são 1.017 células, e as três lentes em união são 1.116 (34% das células ocupadas). Por detecção, concentração ou recorrência cobre 5.187 das 10.640 (49%).
  - A interseção entre as lentes de célula é pequena: 9 células em comum entre recorrência (150) e persistência (60), e 6 nas três.
  - Pelo menos 2 de 3 critérios, por célula: 105 células (6 nas três e 99 em exatamente duas).
  - Da recorrência (150 células), 77 têm alguma detecção de município destacado pela concentração, 76 têm a maioria e 75 têm todas. Da persistência (60 células), 31 nas três regras.
  - Na janela de 01/10 a 31/10/2026 (761 detecções), a concentração destaca 12 municípios (empatados), a persistência destaca 1 célula e a recorrência fica `janela_insuficiente` (toca só 1 mês). Qualquer interseção com a recorrência daria 0 destaques, sem que isso signifique "nenhuma área em comum".
  - Na janela de 01/08 a 31/10/2026 (6.416 detecções): 10, 17 e 46 destaques; interseção por célula de 14 (concentração e recorrência), 22 (concentração e persistência), 2 (recorrência e persistência) e 1 nas três.
- **Exemplos numéricos:** os das alternativas abaixo são os medidos acima, salvo o exemplo fictício de Q2.

## Resultado desejado

Deixar decididas, com exemplos numéricos, as escolhas humanas necessárias para escrever **um único plano** que entregue:

1. a regra de combinação (unidade comum, projeção da concentração e operadores) para as três lentes existentes, determinística e coberta por casos de referência independentes (G1);
2. o resultado combinado, compatível com o contrato C1 e com a explicação de qual critério destacou cada unidade;
3. a interface mínima para escolher as lentes e o operador e ver, por unidade, o motivo e a evidência de cada critério, sem redesenho (BL-007 permanece separado);
4. a decisão sobre G2, caso a combinação exija função ou tabela nova.

## Hipóteses

Nenhuma é assumida como fato; todas são verificadas no plano.

- **H1.** A combinação é função pura dos `ResultadoLente` já produzidos para a mesma carga e janela, sem nova leitura de dados, sem tabela persistida e sem alterar as três lentes nem `lentes-004-v1`.
- **H2.** A célula de 0,05° é a unidade comum mais simples de explicar, porque duas das três lentes já a usam. A concentração entra por projeção do município à célula, regra que precisa de decisão (Q2).
- **H3.** O contrato C1 comporta o destaque combinado de forma aditiva (campos novos opcionais), sem mudar o significado dos campos existentes. Se o plano mostrar que não comporta, a alteração do contrato é nova decisão de G1.
- **H4.** Ordenar o resultado combinado pelo número de lentes que destacaram a unidade equivale a uma pontuação, isto é, a um ranking implícito (ver Q4).
- **H5.** O custo de calcular a combinação é desprezível diante da leitura dos registros, que as lentes já compartilham.

## Alternativas

Cada escolha abaixo altera materialmente o plano, e as de método cabem ao responsável. Os números são os medidos na janela inteira, salvo indicação.

### Q1. Unidade do resultado combinado

| Opção | O que é destacado | Interseção das três | União das três | Observação |
| :-- | :-- | --: | --: | :-- |
| **D1 — Detecção** | Cada `id_tecnico` na evidência de cada lente | 61 detecções | 5.375 detecções (51% das 10.640) | Sem projeção, mas o resultado vira lista de pontos soltos, sem "o mesmo local" |
| **D2 — Célula de 0,05°** | Célula; a concentração é projetada do município à célula (Q2) | 6 células | 1.116 células | Mesma unidade de duas das três lentes; mapa e lista por célula |
| **D3 — Município** | Município; recorrência e persistência são projetadas à divisa | 8 municípios | 61 municípios (recorrência ou persistência) | Perde a precisão que motivou as células; quase todo destaque cai nos mesmos 10 municípios |
| **D4 — Sem projeção** | Só combina lentes da mesma unidade (recorrência e persistência, por célula); a concentração fica fora | 9 células | 201 células | Evita a regra de projeção, mas deixa de fora uma das três lentes |

Em D1 o resultado explica "quais focos", mas perde a leitura territorial. Em D3 a interseção das três tem 8 municípios, quase os 10 da própria concentração. D2 é a única que preserva a precisão das lentes de célula e inclui as três.

### Q2. Projeção da concentração (município → célula), se D2 for escolhida

A concentração destaca municípios. Uma célula pode ter detecções de mais de um município (91 das 3.290 células ocupadas). Exemplo fictício: célula com 10 detecções, 6 de um município destacado e 4 de outro que não foi.

| Opção | Regra | No exemplo | Células de recorrência (150) | Células de persistência (60) | Células da concentração (de 3.290) |
| :-- | :-- | :-- | --: | --: | --: |
| **P1 — Alguma** | A célula é destacada se tiver pelo menos 1 detecção de município destacado | Destacada | 77 | 31 | 1.017 |
| **P2 — Maioria** | Mais da metade das detecções da célula é de município destacado | Destacada (6 de 10) | 76 | 31 | 1.006 |
| **P3 — Todas** | Todas as detecções da célula são de município destacado | Não destacada | 75 | 31 | 997 |

A diferença é pequena nos dados atuais (2 células na recorrência, 0 na persistência), mas a regra precisa existir e ser testada com casos de borda. A evidência da concentração numa célula seria apenas as detecções da célula que pertencem a município destacado.

### Q3. Operadores e composição

| Opção | Funcionamento | Por célula, três lentes |
| :-- | :-- | :-- |
| **O1 — Interseção ou união sobre um subconjunto** | O usuário escolhe 2 ou 3 lentes e um único operador, "e" ou "ou" | 6 células ("e"), 1.116 ("ou") |
| **O2 — O1 mais "pelo menos k de n"** | Além de "e" e "ou", destaca unidades presentes em pelo menos k critérios | 105 células ("pelo menos 2 de 3") |
| **O3 — Expressão com grupos** | Por exemplo, "concentração e (recorrência ou persistência)" | Depende da expressão |

O BL-005 pede interseção e união. O "pelo menos k de n" é um meio-termo que se aproxima de contagem de critérios, mas continua sendo operação sobre conjuntos. A expressão com grupos amplia a interface e o conjunto de casos de referência.

### Q4. Ordem e contagem de lentes no resultado combinado

| Opção | Efeito |
| :-- | :-- |
| **R1 — Sem ordem por critérios** | Ordem fixa e determinística (célula de norte a sul e de oeste a leste, como as lentes de célula), com a lista de quais lentes destacaram cada unidade. Sem rótulo de prioridade |
| **R2 — Ordenar pelo número de lentes** | Unidades destacadas por mais critérios aparecem primeiro. Com "ou" nas três lentes: 6 células em 3 critérios, 99 em 2 e 1.011 em 1 |

R2 é uma pontuação implícita e prioriza áreas, o que o BL-005 só admite por decisão do responsável e que a KB-005 hoje não faz. A decisão Q8 do ciclo `004` mantinha só a concentração ordenando, com rótulo próprio.

### Q5. Persistência na combinação

| Opção | Unidade | Observação |
| :-- | :-- | :-- |
| **S1 — Por célula** | Uma célula entra se tiver pelo menos uma sequência; a evidência lista todas as sequências e seus dias | 60 células; 5 delas têm mais de 1 sequência |
| **S2 — Por sequência** | Cada sequência (célula + dia inicial) é um destaque combinável | 66 destaques; a interseção com a recorrência mistura uma unidade de tempo com uma de espaço e exige regra de correspondência |

### Q6. Lente indisponível ou sem aplicação na janela

Exemplo medido: janela de 01/10 a 31/10/2026. Concentração: 12 destaques. Persistência: 1. Recorrência: `janela_insuficiente`. A cobertura também pode ficar `pendente` ou `falha`.

| Opção | Resultado de "recorrência e persistência" | Observação |
| :-- | :-- | :-- |
| **I1 — Combinação indisponível** | "Não calculada: a recorrência não se aplica a esta janela", nomeando a lente | Evita ler ausência de aplicação como ausência de áreas em comum |
| **I2 — Lente trata como vazia** | 0 destaques | Ambíguo: parece "nenhuma área em comum" |
| **I3 — Lente é ignorada, com aviso** | A combinação segue só com as demais | Muda o significado do "e" sem o usuário ter pedido |

### Q7. Cobertura e ressalvas no destaque combinado

| Opção | Regra |
| :-- | :-- |
| **V1 — Reaproveitar o qualificador** | A cobertura da célula combinada é a do qualificador D13/T7 sobre os municípios de todas as detecções da célula na janela, como na recorrência. As ressalvas de cada lente (mês parcial, borda de sequência, "contagem favorece municípios grandes") ficam listadas por lente |
| **V2 — Só por lente** | O painel mostra a cobertura e as ressalvas separadas, sem qualificar a unidade combinada |

V1 mantém uma única leitura de cobertura por unidade e não cria regra de cobertura nova.

### Q8. Onde calcular

| Opção | Funcionamento | Consequência |
| :-- | :-- | :-- |
| **L3 — Módulo puro sobre os resultados das lentes** | Função em `src/lentes/`, determinística, sem rede, chamada pelo cliente | Sem migração e sem G2; a mesma estratégia de Q10 do ciclo `004` |
| **L1 — Função SQL** | Combinação no banco | Exige migração aditiva (G4), testes de acesso (G2) e consome CPU do Supabase Free; o ciclo `004` já decidiu manter o cálculo no cliente |

### Q9. Interface mínima

Seleção de duas ou três lentes e do operador; lista e destaque no mapa; painel que mostra, por unidade, quais lentes a destacaram, com o motivo e a evidência de cada uma. Parâmetros das lentes visíveis e fixos. Estado "indisponível" conforme Q6. Qualquer outra coisa é BL-007.

## Decisões do responsável — 2026-11-11

O responsável aceitou integralmente as recomendações do agente para Q1 a Q9, com a resposta literal "Aceito todas", dada depois da apresentação das alternativas, dos números medidos e da recomendação de cada uma. A decisão é do responsável; a ideação apenas a registra. As regras abaixo são **valores iniciais** da combinação: mudá-las é nova decisão de método (G1) e novo plano.

| Pergunta | Decisão |
| :-- | :-- |
| **Q1 — Unidade** | D2: o resultado combinado é por **célula de 0,05°** (grade T1 do ciclo `004`). O contrato leva o tipo de unidade `celula_005` |
| **Q2 — Projeção da concentração** | P1: a célula é destacada pela concentração se tiver **pelo menos 1 detecção** de município destacado. A evidência da concentração na célula são as detecções da célula que pertencem a município destacado. Limitação a exibir: a célula não segue divisas e a concentração favorece municípios grandes |
| **Q3 — Operadores** | O1: o usuário escolhe **2 ou 3 lentes** e **um único operador**, "e" (interseção) ou "ou" (união). Sem "pelo menos k de n" e sem expressões com grupos |
| **Q4 — Ordem** | R1: **sem ordem por número de lentes** nem rótulo de prioridade. Ordem fixa e determinística (célula de norte a sul e de oeste a leste), com a lista de quais lentes destacaram cada célula. Nenhuma pontuação |
| **Q5 — Persistência** | S1: **por célula**. Uma célula entra se tiver pelo menos uma sequência; a evidência lista todas as sequências e seus dias |
| **Q6 — Lente sem aplicação** | I1: a combinação fica **indisponível**, nomeando a lente (por exemplo, "recorrência não se aplica a esta janela"). Nunca é lida como vazia, e a lente não é ignorada em silêncio |
| **Q7 — Cobertura e ressalvas** | V1: **qualificador comum** (D13 e T7) sobre os municípios de todas as detecções da célula na janela. As ressalvas de cada lente ficam listadas por lente |
| **Q8 — Onde calcular** | L3: **módulo puro** em `src/lentes/`, determinístico e testável isoladamente, sobre os `ResultadoLente` já produzidos. **Sem migração; G2 = Não nesta ideação.** Se o plano introduzir função, tabela ou política nova, G2 passa a "Sim" e o nível é retriado |
| **Q9 — Interface mínima** | Seleção de duas ou três lentes e do operador; lista e destaque no mapa; painel com, por célula, as lentes que a destacaram e o motivo e a evidência de cada uma; estado "indisponível" conforme Q6. Parâmetros das lentes visíveis e fixos, sem edição de limiar. Qualquer outra coisa é BL-007 |

**Verificações que o plano deve fazer** (não são decisões):
- compatibilidade aditiva com o contrato C1 (H3), sem alterar o resultado das três lentes nem `lentes-004-v1`; decidir se a combinação ganha versão própria;
- casos de referência independentes do código para a projeção P1, para cada operador e para a indisponibilidade, refazendo por caminho independente os números da exploração (6 células na interseção das três e 1.116 na união, na janela inteira) e incluindo casos de borda (célula com detecções de mais de um município, célula de recorrência com meses parciais, janela de um mês);
- conferir o custo de aplicar duas ou três lentes em sequência com a leitura compartilhada, frente ao orçamento de 20,0 s do ciclo `004`;
- confirmar que a carga e a janela fixam o resultado combinado, sem mistura entre cargas (ADR-007), e que o estado da cobertura (`pendente` ou `falha`) de uma lente é tratado de forma explícita na combinação;
- dizer o que é exigido da verificação em produção, já que o ciclo `004` fechou com ela parcial por decisão do responsável.

## Riscos e restrições

- **Leitura indevida:** uma célula destacada por três critérios ser lida como prova de incêndio, dano ou infração, ou como "mais grave". O painel deve repetir o aviso de domínio e, sem ordenação por critérios (R1), não sugerir prioridade.
- **Ranking implícito:** R2 prioriza áreas por pontuação de lentes. Exige decisão expressa.
- **Projeção da concentração:** transformar município em célula é regra nova de G1. A concentração destaca municípios inteiros (1.017 células, 31% das ocupadas), e a união com ela tende a reproduzir o mapa dos 10 municípios.
- **Interseção pequena:** 6 células nas três lentes na janela inteira, e 0 ou 1 em janelas curtas. A interface precisa explicar "nenhuma unidade em comum" sem sugerir ausência de risco.
- **G1:** unidade comum, projeção, operadores, tratamento de lente indisponível e ordem são regra analítica ambiental. Exigem alternativas, exemplos numéricos e decisão do responsável antes do plano. Casos de referência devem ser independentes do código e refazer os números da exploração por outro caminho.
- **G2:** com L3 não há função, tabela ou política nova e G2 não se aplica. Se o plano introduzir uma, G2 passa a "Sim" e o nível é retriado. Modo contínuo permanece proibido (ciclo completo e G1).
- **G3:** só agregados públicos do INPE e municípios do IBGE; fixtures fictícias. Sem identidade de conta, domínio de produção ou segredo.
- **G4:** nenhuma migração prevista; qualquer uma seria nova e aditiva.
- **Versão do método:** a combinação não pode alterar o resultado das lentes. Mudança de parâmetro ou regra de lente é nova `versao_metodo`; o plano decide se a combinação ganha versão própria.
- **Reprodutibilidade:** o resultado combinado depende da carga, da janela e da `versao_metodo` das lentes. Cada destaque combinado deve registrá-los.
- **Custo e tempo:** a combinação exige as lentes escolhidas na mesma carga e janela. O orçamento de 20,0 s do ciclo `004` vale por lente, e o plano deve conferir o custo de aplicar duas ou três em sequência, com a leitura compartilhada.
- **Interface sem design system:** a interface mínima não pode virar redesenho.
- **Verificação em produção:** o ciclo `004` fechou com a verificação hospedada parcial, por decisão do responsável. O plano deve dizer o que é exigido aqui.

## Perguntas em aberto

Nenhuma. As perguntas Q1 a Q9 foram respondidas em 2026-11-11 (seção "Decisões do responsável"). Permanecem como itens para o plano apenas as verificações listadas nessa seção.

## Fora do escopo

- Combinação por pontuação com pesos, ou qualquer ordenação por prioridade, gravidade ou risco, salvo decisão expressa (Q4).
- Novas lentes, novas fontes e novas camadas (BL-002, BL-003, BL-004, BL-006).
- Alteração de parâmetros ou regras das lentes do ciclo `004`, da contagem, da disponibilidade D1 ou das regras H3 da KB-004.
- Definição visual e design system (BL-007), atualização menos manual (BL-008) e motor de IA (BL-009).
- Qualquer afirmação de incêndio, dano, autoria ou infração.

## Critérios para iniciar o planejamento

- ~~Q1 a Q9 respondidas~~: atendido em 2026-11-11, com exemplos numéricos medidos.
- ~~Decisão de Q8 com G2 declarado~~: atendido. L3 e G2 = Não, condicionado a não surgir função, tabela ou política nova.
- Pendente no plano: casos de referência independentes para a combinação, refazendo os números da exploração por caminho independente; compatibilidade aditiva com C1 (H3); e o custo de aplicar mais de uma lente.
- ~~Autorização do rascunho~~: recebida em 2026-11-11 ("Autorizo o rascunho do plano do ciclo 005"). "Aceito todas" decidiu Q1 a Q9, mas não autorizou o rascunho.

## Próximo passo

A autorização do rascunho foi recebida em 2026-11-11: **"Autorizo o rascunho do plano do ciclo 005"**. Nenhuma pergunta de método nova foi feita antes do rascunho. Os detalhes técnicos que decorrem de Q1 a Q9 (T8 a T14) estão no plano como propostas a ratificar na aprovação. O rascunho único foi criado em `_project/drafts/005_combinacao_criterios_selecao/005_plan.md`, que passa a ser o artefato ativo do ciclo em `Planejamento`.

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 1) — ciclo 005 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 005"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + rascunhar_plano + 005_plan + v1@2e31651`
- `effect_class`: `local_mutation`
- `state_before`: ideação em `Ideação`, com Q1 a Q9 decididas, não commitada; branch local `chore/cycle-005-ideation`; sem plano.
- `state_after`: autorização do rascunho registrada; plano `v1` em `Rascunho` criado; ciclo `005` em `Planejamento`; branch local `chore/cycle-005-plan`, criada a partir da anterior, com as alterações ainda não commitadas. Nenhuma publicação.
- `result`: `executed`
- `evidence`: frase de autorização de 2026-11-11; handoff completo no plano; linha do ciclo `005` em `_project/cycles.md`.
- `blockers`: nenhum para a redação; revisão formal pendente.

### Registro anterior — decisões da ideação

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + idear + combinacao_criterios_selecao + 2e31651`
- `effect_class`: `local_mutation`
- `state_before`: ideação `005` criada e ciclo `005` reservado como `Ideação`, com Q1 a Q9 em aberto; branch local `chore/cycle-005-ideation`, nada commitado.
- `state_after`: mesma ideação atualizada com as decisões do responsável para Q1 a Q9; ciclo `005` continua `Ideação`; BL-005 inalterado (`Disponível`); nada commitado, publicado nem enviado.
- `result`: `executed`
- `evidence`: seção "Decisões do responsável — 2026-11-11" desta ideação, com a resposta literal "Aceito todas"; linha do ciclo `005` em `_project/cycles.md`; validação de governança na resposta da sessão.
- `blockers`: nenhum; o rascunho do plano depende de "autorizo o rascunho do plano do ciclo 005".

### Registro anterior — ideação

- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + idear + combinacao_criterios_selecao + 2e31651`
- `effect_class`: `local_mutation`
- `state_before`: `main` em `2e31651`, igual a `origin/main`; ciclo `005` não reservado; fila `chore/backlog` limpa e sincronizada; BL-005 `Disponível`.
- `state_after`: ideação `005` criada com Q1 a Q9 em aberto e ciclo `005` reservado como `Ideação`.
- `result`: `executed`
