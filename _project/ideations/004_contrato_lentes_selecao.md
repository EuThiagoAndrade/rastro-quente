# Ideação — 004: Contrato de lente de seleção e lentes com dados já carregados

> **Ciclo:** `004`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "Confirmo completo" em 2026-11-10 (resposta à triagem, que propunha a frase "confirmo o nível completo e autorizo a ideação do ciclo 004" e perguntava "Confirma o nível completo e a ideação do ciclo 004?")
> **Criado em:** 2026-11-10
> **Última atualização:** 2026-11-10
> **handoff_schema_version:** `2`

## Problema

O protótipo do ciclo `003` consulta detecções (mapa, tabela, filtros de período e município, proveniência e disponibilidade), mas não seleciona áreas para avaliação técnica. A KB-003 define a seleção explicável como propósito do produto, e o ciclo `003` deixou a regra de seleção fora do escopo. Falta (a) um contrato único que diga o que é uma "lente de seleção" e o que ela devolve, e (b) as primeiras lentes, independentes entre si, que usam apenas os dados já carregados: concentração, recorrência, persistência no mesmo ponto e cobertura confiável.

Benefício: seleção explicável, com cada critério avaliável isoladamente e uma estrutura de resultado que permita, em ciclo futuro (BL-005), combinar lentes por interseção ou união sem refazer o contrato.

Restrição de domínio: focos e seleções não comprovam incêndio, dano, autoria ou infração. Cada resultado deve poder ser explicado por método, origem/versão dos dados e limitações.

## Origem no backlog

- **BL-001 — Contrato de lente de seleção e lentes com dados já carregados.** Item inteiro, sem parcela; Restante: `—`.
- **Síntese da necessidade (snapshot):** definir um contrato único de critério (áreas ou pontos destacados, motivo e evidência) e as lentes independentes de concentração, recorrência, persistência no mesmo ponto e cobertura confiável, todas devolvendo a mesma estrutura, com interface mínima para escolher o critério e mostrar motivo e evidência. Os limiares são decisões analíticas do responsável, tomadas com alternativas e exemplos numéricos antes do plano.
- **Referência:** `_project/backlog.md`, commit `85b444d` (PR #31), já integrado em `main` e `origin/main`; **não** é local nem pendente de publicação. Fila `chore/backlog` no mesmo commit, sem lote pendente.
- **Destino em preparação.** O estado do item permanece `Disponível`. O retorno na fila (`ciclo 004 — AAAA-MM-DD — parcela`) só ocorre depois da integração comprovada do destino em `main`, e sua publicação exige autorização separada.
- **Itens relacionados, não selecionados:** BL-005 (combinação) depende deste ciclo; BL-007 (visual), BL-002, BL-003, BL-004, BL-006, BL-008 e BL-009 ficam fora.

## Contexto e evidências

Fatos verificados no repositório (`main` em `85b444d`):

- **Dados disponíveis (KB-003, KB-004):** 10.640 detecções `AQUA_M-T` do INPE em 142 municípios de Mato Grosso, de novembro de 2025 a outubro de 2026 (GMT). `AQUA_M-T` é a série principal; VIIRS e demais satélites não estão carregados (BL-003 trata disso).
- **Schema** (`supabase/migrations/20261107210000_esquema_dados.sql`):
  - `public.deteccoes`: `data_hora_gmt`, `latitude`, `longitude`, `municipio_codigo`, `posicao` (`interior` ou `borda`), `escopo` (`principal` ou `envelope`), `id_tecnico` e `id_fonte`. Há latitude e longitude por registro, então lentes por ponto são possíveis sem nova fonte;
  - `public.disponibilidade`: dia GMT × satélite × município, com classe `lacuna_conhecida`, `incidencia_indeterminada` ou `sem_evidencia_de_lacuna`, motivos e alcance do histórico. **Não existe classe "coberto"**: dia sem registro não prova ausência de fogo nem cobertura, e o texto exibido é "cobertura não comprovada" (KB-004);
  - `public.municipios` guarda a geometria de exibição em `jsonb`, **sem coluna de área** (relevante para qualquer densidade por km²).
- **Consultas atuais** (`supabase/migrations/20261107210200_consultas.sql`): funções `consultar_resumo`, `consultar_deteccoes` (limite de 1 a 1.000 linhas por chamada) e `consultar_disponibilidade`, sob RLS e com versão de carga fixada (`p_carga`).
- **Interface (ADR-007):** Vite + TypeScript estático, Leaflet, módulos `sessao`, `consulta`, `mapa`, `apresentacao` e `app`. A interface fixa a versão da carga em toda consulta e nunca mistura resultados de cargas diferentes. Não há design system aprovado; ADR-007 não institui contrato visual.
- **Método vigente (KB-004):** a contagem principal usa dia GMT; a sensibilidade `America/Cuiaba` aparece em separado. A KB declara que **nada ali ordena ou prioriza municípios**: ordenar, filtrar ou destacar áreas é método novo (G1).
- **Limites de custo (KB-003, ADR-002):** Vercel Hobby e Supabase Free, custo zero, um usuário. Cálculo no banco consome CPU e memória compartilhadas do Supabase Free.
- **Análise exploratória dos dados locais (2026-11-10).** Agregados calculados somente para leitura sobre a carga local (`local/dados-prototipo/saidas/`, fora do Git) por script temporário não versionado. **Não são casos de referência validados**; calibram as decisões e devem ser refeitos de forma independente no plano:
  - 10.640 detecções do escopo principal em 134 de 142 municípios; mediana de 34 por município, p90 de 219, máximo de 901; os 10 maiores somam 42%; 31 municípios têm 100 ou mais;
  - sazonalidade forte: agosto de 2026 tem 3.691 detecções e fevereiro de 2026, 127;
  - grade de 5 km (3.470 células ocupadas): 142 células com detecção em 3 ou mais meses distintos; 636 com 3 ou mais dias distintos; 371 com 2 ou mais dias seguidos, 62 com 3 ou mais e 2 com 5 ou mais. Na grade de 2 km a mediana é de 1 detecção por célula;
  - disponibilidade: 79 dos 365 dias (21,6%) são `incidencia_indeterminada`, **idênticos nos 142 municípios** (78,4% de dias sem lacuna em todos), por efeito da regra H3 (interrupção MODIS/Aqua da NASA e avisos sem área). A cobertura varia por dia, não por município;
  - nenhuma detecção tem hora GMT anterior a 04h, então a sensibilidade `America/Cuiaba` não desloca o dia de nenhuma.
- **Exemplos numéricos das alternativas:** os das alternativas A2 a A5 são **fictícios e ilustrativos**; os da análise acima são medidos.

## Resultado desejado

Deixar decididas, com exemplos numéricos, as escolhas humanas necessárias para escrever **um único plano** que entregue:

1. o contrato de lente (entrada, saída e explicação);
2. as quatro lentes, cada uma isolada, determinística e coberta por casos de referência independentes (G1);
3. a interface mínima para escolher a lente e ver motivo e evidência de cada destaque, sem redesenho (BL-007 permanece separado);
4. a decisão sobre G2, caso as lentes exijam funções ou tabelas novas.

## Hipóteses

Nenhuma é assumida como fato; todas são verificadas no plano.

- **H1.** As quatro lentes cabem inteiramente nos dados já carregados (`deteccoes`, `disponibilidade`, `municipios`), sem nova fonte nem tabela de resultado persistida.
- **H2.** Um contrato por "destaque" com unidade (município, célula ou ponto), motivo, evidência (registros ou dias que sustentam o destaque) e parâmetros usados é suficiente para as quatro lentes e para a futura combinação por interseção ou união (BL-005).
- **H3.** O cálculo no banco, por funções determinísticas sob RLS e versão de carga fixada, é testável por casos de referência e cabe no custo zero. O cálculo no cliente é viável pelo volume (10.640 detecções), mas dificulta a reprodutibilidade e o teste do método.
- **H4.** A lente de cobertura qualifica a confiança dos demais destaques e se distingue de uma lente que "seleciona" por fogo; tratá-la como as outras muda o contrato (ver Q2).

## Alternativas

Cada escolha abaixo altera materialmente o plano e, nas decisões de método, cabe ao responsável. Os números são fictícios.

### A1. Escopo do ciclo

| Opção | Entrega | Consequência |
| :-- | :-- | :-- |
| **E1 — Contrato + as 4 lentes + interface mínima** | Tudo o que o BL-001 descreve | Um plano grande, com quatro decisões de método (G1) e a possível decisão de G2. Pode ser fatiado em issues: contrato primeiro, depois uma lente por issue |
| **E2 — Contrato + 1 lente + interface mínima** | Contrato validado por uma lente de referência | Menos decisões antes do plano. As outras três voltam ao backlog como parcela restante do BL-001 |
| **E3 — Contrato + 2 lentes de natureza diferente** (por exemplo concentração e cobertura) | Valida que o contrato serve a uma lente de seleção e a uma de qualificação | Teste mais forte do contrato (H4), com custo intermediário |

### A2. Unidade espacial do destaque ("área")

| Opção | O que é destacado | Exemplo fictício |
| :-- | :-- | :-- |
| **U1 — Município** | Município inteiro (código IBGE) | "Município X: 120 detecções" |
| **U2 — Célula de grade** | Quadrado de lado fixo (por exemplo 10 km), independente de divisas | Duas células vizinhas no município X: 70 e 50 detecções |
| **U3 — Grupo de pontos** | Detecções agrupadas por distância (raio r) | Grupo de 9 detecções em até 2 km entre si |

A unidade muda o que "recorrência" e "persistência no mesmo ponto" significam: em U1 não há ponto; em U2 o "mesmo ponto" é a célula; em U3 é o raio.

### A3. Concentração: definição e limiar

Exemplo: município A, 120 detecções, 4.000 km² (0,030/km²); município B, 40 detecções, 500 km² (0,080/km²).

| Opção | Mede | Resultado no exemplo | Observação |
| :-- | :-- | :-- | :-- |
| **K1 — Contagem absoluta** | Número de detecções na unidade | A antes de B | Não exige área; favorece unidades grandes |
| **K2 — Densidade por km²** | Detecções ÷ área da unidade | B antes de A | Exige área do município, que o schema não tem hoje |
| **K3 — Percentil sobre a distribuição das unidades** | Posição relativa no conjunto | Depende do conjunto de unidades e da janela | Muda se a janela ou a carga mudar |

Limiar: valor fixo ou N primeiros? Dois destaques de cortes diferentes (os 10 maiores contra tudo acima de 50 detecções) selecionam conjuntos diferentes, e um ranking ordena áreas, o que a KB-004 hoje não faz.

### A4. Recorrência e persistência: duas lentes distintas

Exemplo: no mesmo local, detecções nos dias 5, 12 e 20 do mês (recorrência de 3 dias distintos, persistência de 1 dia seguido) e outro local com detecções nos dias 5, 6 e 7 (recorrência de 3 dias, persistência de 3 dias seguidos).

- **Recorrência** conta dias (ou meses) distintos com detecção no mesmo local, no período. Parâmetros a decidir: unidade de tempo (dia ou mês), mínimo k de ocorrências e janela.
- **Persistência** exige sequência contínua. O satélite passa cerca de uma vez ao dia, então a ausência de detecção em um dia pode ser nuvem, lacuna de cobertura ou fim do evento. Decisão: um dia `incidencia_indeterminada` ou `lacuna_conhecida` interrompe a sequência, é ignorado ou é registrado como ressalva?
- **Raio de "mesmo local"** (U2 ou U3): com 1 km, dois pontos a 1,5 km são locais diferentes; com 2 km, o mesmo local. O pixel do sensor tem resolução da ordem de 1 km, então o raio precisa de justificativa (G1).

### A5. Cobertura confiável

Exemplo: município com 90 dias no período e 6 deles `incidencia_indeterminada`: 84 de 90 = 93,3% dos dias sem lacuna. Limiar de 90% aprova; 95% reprova.

| Opção | Papel da lente | Consequência |
| :-- | :-- | :-- |
| **V1 — Lente de seleção** | Destaca unidades com cobertura acima do limiar | Mesmo contrato das outras, mas "cobertura confiável" não indica fogo |
| **V2 — Qualificador** | Anexa a cobertura como evidência a cada destaque das demais lentes | Contrato com campo de qualificação; a lente isolada mostra o mapa de cobertura |
| **V3 — Ambos** | V1 e V2 | Mais completo; mais decisões |

A KB-004 não tem classe "coberto": a lente só pode dizer "sem evidência de lacuna", nunca "coberto". Os avisos sem área são indeterminados nos 142 municípios por decisão humana, o que reduz a cobertura confiável em todo o estado em certos dias.

### A6. Contrato de resultado

| Opção | Estrutura | Consequência |
| :-- | :-- | :-- |
| **C1 — Lista de destaques** | Por destaque: unidade (ou geometria), motivo, evidência (ids de detecções ou dias), parâmetros e limitações | Combinação futura é interseção ou união por unidade, e a explicação fica anexa |
| **C2 — Pontuação por unidade** | Valor numérico por unidade e por lente | Facilita ordenar, mas aproxima de pesos e de ranking, que o BL-005 só admite por decisão do responsável |
| **C3 — Conjunto de ids de detecção** | Ids destacados por lente | Simples, mas perde a unidade e a explicação agregada |

### A7. Onde calcular

| Opção | Funcionamento | Consequência |
| :-- | :-- | :-- |
| **L1 — Funções SQL no banco, sob RLS** | Uma função por lente, com versão de carga fixada e limite de linhas | Reprodutível e testável contra o banco; exige migrações aditivas (G4), testes de acesso (G2) e consome CPU do Supabase Free |
| **L2 — No cliente, sobre as consultas existentes** | A interface calcula a partir de `consultar_deteccoes` e `consultar_disponibilidade` | Sem migração nova; o limite de 1.000 linhas por chamada exige paginar tudo; método duplicado no cliente é mais difícil de testar de forma independente |
| **L3 — Módulo puro de cálculo, testável isoladamente, chamado pelo cliente** | Lógica determinística em TypeScript sem rede, com casos de referência | Meio-termo: teste forte sem migração, ainda paginando os dados |

## Decisões do responsável — 2026-11-10

O responsável aceitou integralmente as recomendações do agente para Q1 a Q12, apresentadas com a análise exploratória acima. A decisão é do responsável; a ideação apenas a registra. Os parâmetros são **valores iniciais**, fixos e exibidos na interface; mudá-los é nova decisão de método (G1) e novo plano.

| Pergunta | Decisão |
| :-- | :-- |
| **Q1 — Escopo** | E1: contrato, as quatro lentes e interface mínima, **fatiados em issues** (contrato com concentração; depois recorrência; persistência; cobertura). Se o plano ficar grande, as últimas entregas podem voltar ao backlog como parcela restante do BL-001, por decisão registrada |
| **Q2 — Cobertura** | V2: qualificador. Cada destaque das demais lentes traz "N de M dias sem lacuna na janela". A cobertura não é lente de seleção, porque é uniforme entre municípios |
| **Q3 — Unidade** | Concentração por **município** (U1). Recorrência e persistência por **célula de 0,05° de lado em graus** (cerca de 5,5 km), independente de projeção (U2). O contrato leva um campo de tipo de unidade. Limitação a documentar: focos vizinhos em células diferentes não são lidos como o mesmo local |
| **Q4 — Concentração** | K1: contagem de detecções por município na janela escolhida, **N primeiros com N=10 por padrão**. Limitação a exibir: favorece municípios grandes. Densidade por km² (K2) e percentil (K3) ficam fora |
| **Q5 — Recorrência** | **Meses distintos com detecção na mesma célula, k=3**. Para janela com menos de 3 meses, a lente informa "janela insuficiente" |
| **Q6 — Persistência** | **3 ou mais dias consecutivos** com detecção na mesma célula. Um dia indeterminado **interrompe** a sequência, e a evidência sinaliza "sequência adjacente a dia indeterminado; pode ser mais longa". Não se infere detecção em dia sem informação |
| **Q7 — Cobertura** | Exibir a fração de dias sem lacuna e a lista de dias, **sem limiar de aprovação**. `incidencia_indeterminada` conta contra a cobertura. O texto é "sem evidência de lacuna", nunca "coberto" |
| **Q8 — Ranking** | Só a concentração ordena, com o rótulo "ordenado por contagem de detecções, não por prioridade, gravidade ou risco". As demais lentes só marcam, em ordem de código ou de data. O campo de ordem do contrato é opcional |
| **Q9 — Contrato** | C1: lista de destaques, cada um com tipo e identificador da unidade, motivo, evidência (ids de detecção ou dias), parâmetros, carga e janela, qualificação de cobertura e limitações |
| **Q10 — Onde calcular** | L3: módulo puro, determinístico e testável isoladamente, chamado pelo cliente sobre as consultas existentes. **Sem migração; G2 = Não nesta ideação.** Se o plano introduzir função, tabela ou política nova, G2 passa a "Sim" e o nível é retriado. O contrato C1 é o ponto de estabilidade para mover o cálculo ao banco se o BL-004 ampliar o histórico |
| **Q11 — Interface mínima** | Seletor de lente, lista e destaque no mapa, e painel de motivo e evidência. Parâmetros fixos e visíveis, sem edição de limiar. Qualquer outra coisa é BL-007 |
| **Q12 — Janela e fuso** | Janela escolhida na interface; contagem principal em dia GMT; sensibilidade `America/Cuiaba` apenas em nota |

**Verificações que o plano deve fazer** (não são decisões):
- confirmar que `consultar_deteccoes` e `consultar_disponibilidade` devolvem os campos que as lentes precisam, e o custo de paginar o conjunto (10.640 linhas são cerca de 11 chamadas de até 1.000);
- a contagem de cada lente deve bater com a de `consultar_resumo` para a mesma carga e janela;
- casos de referência independentes do código para cada lente e para o contrato, com os números da análise exploratória refeitos por caminho independente;
- confirmar que a janela e a carga vigente fixam o resultado, sem mistura entre cargas (ADR-007).

## Riscos e restrições

- **Leitura indevida:** um destaque ser lido como prova de incêndio, dano ou infração. Cada resultado deve exibir limitações e a ressalva de cobertura.
- **Ranking implícito:** ordenar ou cortar por N primeiros equivale a priorizar áreas; a KB-004 diz que o método atual não prioriza. Se houver ordenação, ela precisa de decisão e rótulo.
- **G1:** limiares, raio, unidade, tratamento de dias com lacuna e janela são regra analítica ambiental. Exigem alternativas e exemplos numéricos, e a decisão é do responsável antes do plano. Casos de referência devem ser independentes do código.
- **G2:** com L3 (decisão Q10), não há função, tabela ou política nova e G2 não se aplica. Se o plano precisar de uma, G2 passa a "Sim" e o nível é retriado.
- **G3:** sem dados pessoais. Fixtures usam dados fictícios; os dados reais do INPE são públicos, e atributos pessoais não existem no escopo.
- **G4:** qualquer migração é nova e aditiva; nenhuma existente é editada.
- **Custo zero:** cálculo no banco hospedado pode estourar CPU ou memória do Supabase Free; o plano precisa de medição antes de aceitar L1.
- **Reprodutibilidade:** o resultado muda com a carga vigente e com a janela. Cada destaque deve registrar a carga e os parâmetros.
- **Tamanho:** quatro lentes e interface em um plano só podem ficar grandes; o fatiamento por issue é decisão de A1.
- **Implantação:** migrações novas no Supabase hospedado exigem ato administrativo do responsável, como no item 5 do ciclo `003`.
- **Interface sem design system:** a interface mínima não pode virar redesenho; ela herda a base de ADR-007.

## Perguntas em aberto

Nenhuma. As perguntas originais Q1 a Q12 foram respondidas em 2026-11-10 (seção "Decisões do responsável"). Permanecem como itens para o plano apenas as verificações listadas nessa seção.

Detalhe que o plano deve fechar, sem alterar as decisões: como a lente de recorrência apresenta a célula cuja janela escolhida tem menos de 3 meses ("janela insuficiente") e como a interface mostra o aviso de sequência adjacente a dia indeterminado.

## Fora do escopo

- Camadas de áreas protegidas, CAR e demais fontes externas (BL-002 e BL-006), VIIRS (BL-003) e série anterior a 12 meses (BL-004).
- Combinação de lentes por interseção, união ou pontuação com pesos (BL-005).
- Definição visual e design system (BL-007), atualização menos manual (BL-008) e motor de IA (BL-009).
- Qualquer afirmação de incêndio, dano, autoria ou infração.
- Alteração do método de contagem, da disponibilidade D1 ou das regras H3 da KB-004.

## Critérios para iniciar o planejamento

- ~~Q1 a Q12 respondidas~~: atendido em 2026-11-10, com exemplos numéricos fictícios (alternativas) e medidos (análise exploratória).
- ~~Decisão de A7, com G2~~: atendido. L3 e G2 = Não, condicionado a não surgir função, tabela ou política nova.
- ~~Contrato (A6) decidido~~: atendido (C1).
- Pendente no plano: casos de referência independentes para cada lente e para o contrato, e as verificações listadas em "Decisões do responsável".
- Pendente do responsável: a autorização "autorizo o rascunho do plano do ciclo 004".

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 004 (completo)
Quem: Responsável
Conferir: Decisões do responsável (Q1 a Q12), G2 = Não e verificações que o plano deve fazer
Diga: "autorizo o rascunho do plano do ciclo 004"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 004 + idear + contrato_lentes_selecao + 85b444d`
- `effect_class`: `local_mutation`
- `state_before`: ideação `004` criada em 2026-11-10 e ciclo `004` reservado como `Ideação`, com Q1 a Q12 em aberto; branch local `chore/cycle-004-ideation`, nada commitado.
- `state_after`: mesma ideação atualizada com as decisões do responsável para Q1 a Q12 e a análise exploratória; ciclo `004` continua `Ideação`; BL-001 inalterado (`Disponível`); nada commitado, publicado nem enviado.
- `result`: `executed`
- `evidence`: seção "Decisões do responsável — 2026-11-10" desta ideação; linha do ciclo `004` em `_project/cycles.md`; validador de governança com 0 erros (ver resposta da sessão).
- `blockers`: nenhum.
