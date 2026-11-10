# Plano de Implementação — Contrato de lente de seleção e lentes com dados já carregados

> **Ciclo:** `004`
> **Status:** `Rascunho`
> **Versão:** `v1`
> **Data de criação:** 2026-11-10
> **Última atualização:** 2026-11-10
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "Confirmo completo" em 2026-11-10 (resposta à triagem do ciclo 004; ver ideação)
> **Modo contínuo:** `—`
> **Revisão formal:** `Pendente`
> **Veredito da revisão:** `Pendente`
> **Aprovação humana pós-revisão:** `Pendente`
> **handoff_schema_version:** `2`

**Autorização do rascunho:** "Autorizo o rascunho do plano do ciclo 004", em 2026-11-10. Autor: Claude Code (Opus 5.5). Antes de redigir, o autor apresentou quatro detalhes de método que a ideação deixou abertos, cada um com recomendação, alternativas e exemplo numérico. O responsável escolheu a opção recomendada nos quatro (decisões D13 a D16 abaixo). Essas escolhas não são aprovação do plano após revisão, nem autorização de issue ou de implementação.

## Problema e contexto

Ideação: _project/ideations/004_contrato_lentes_selecao.md.

## Objetivo

Entregar a primeira seleção explicável do Rastro Quente: um contrato único de "lente de seleção" e três lentes independentes sobre a carga já publicada (concentração, recorrência e persistência no mesmo local). Cada destaque leva a qualificação de cobertura, que funciona como qualificador e não como lente própria. Uma interface mínima permite escolher a lente e ver motivo, evidência, parâmetros e limitações de cada destaque.

O cálculo é um módulo puro e determinístico em TypeScript, chamado pelo cliente sobre as consultas existentes, sem migração, função, tabela, política ou grant novos (decisão Q10). Cada lente é coberta por casos de referência escritos neste plano antes do código e por uma conferência independente sobre a carga real local.

Focos e destaques não comprovam incêndio, dano, autoria ou infração. A única ordenação é a da concentração, rotulada como contagem, e não como prioridade, gravidade ou risco.

## Origem no backlog

Herdada da ideação, sem reescrever o snapshot:

- **BL-001 — Contrato de lente de seleção e lentes com dados já carregados.** Item inteiro, sem parcela; Restante: `—`.
- **Referência:** `_project/backlog.md`, commit `85b444d` (PR #31), integrado em `main` e `origin/main`. Não é local nem está pendente de publicação.
- **Destino em preparação.** O item continua `Disponível`. O retorno na fila (`- ciclo 004 — AAAA-MM-DD — parcela`) só é registrado depois da integração do encerramento em `main`, comprovada no GitHub, sob a autorização da seleção, por `gerenciar_backlog`. A publicação desse retorno exige autorização separada.
- **Cobertura da necessidade (para o retorno futuro):** a "cobertura confiável" do BL-001 é entregue como qualificador de cada destaque, não como lente de seleção (decisão Q2). Se as três lentes forem integradas, a necessidade fica integralmente encaminhada. Se alguma entrega voltar ao backlog por decisão registrada (Q1), ela vira Restante.

## Contexto e baseline

- **Base:** `main` e `origin/main` em `85b444dd0084cc0b32b28ad0a1c256fdc9abbc29` (PR #31). A ideação foi commitada localmente em `c51ad73` (`chore/cycle-004-ideation`); este plano está em `chore/cycle-004-plan`, derivada dela. Em 2026-11-10 não havia PR ou issue aberta no repositório (`gh pr list` e `gh issue list`).
- **Dados:** uma carga `AQUA_M-T` publicada, com 10.640 detecções do escopo principal em 134 dos 142 municípios de MT, de novembro de 2025 a outubro de 2026 (dias GMT). As coordenadas são `double precision` em `public.deteccoes`. A disponibilidade D1 tem uma linha por dia GMT × satélite × município (chave primária `carga_id, municipio_codigo, dia, satelite`).
- **Consultas existentes** (`supabase/migrations/20261107210200_consultas.sql`), todas `security invoker` sob RLS, com a carga fixada por `p_carga`:
  - `consultar_resumo`: total principal, série diária e `por_municipio` (todos os municípios da carga, com zero, em ordem alfabética);
  - `consultar_deteccoes`: registros principais com `id_tecnico`, `data_hora_gmt`, `latitude`, `longitude` e `municipio_codigo`. O total exato não depende da página. A ordem `data_hora_gmt, id_tecnico` é estável, e o limite vai de 1 a 1.000 por chamada. A janela inteira exige cerca de 11 chamadas;
  - `consultar_disponibilidade`: a lista `dias` (classe, motivos, alcance e avisos por dia) **só vem quando `p_municipio` é informado**. Sem município, vêm apenas as contagens por classe. A qualificação por unidade exige, portanto, uma chamada por município envolvido.
- **Interface (ADR-007):** Vite + TypeScript, Leaflet 1.9.4 e módulos `sessao`, `consulta`, `mapa`, `apresentacao` e `app`. O controlador descarta respostas obsoletas por geração de sessão e de consulta, fixa a carga em toda chamada e não persiste dados de consulta. O mapa mostra só a página corrente de registros. A geometria municipal é carregada sob demanda (de 15 a 23 KB por município na representação `intermediaria`). Perfil de medição do ADR-007: 390×844 com toque, Slow 4G emulada e CPU 4× mais lenta. O Supabase local não comprime: o tráfego medido é bruto, e o gzip é estimado.
- **Implantação:** a Vercel está ligada ao GitHub com branch de produção `main` (runbook, seção 11, etapa 4a). **Cada merge em `main` gera um deploy de produção.** Nenhuma lente fica atrás de chave de configuração.
- **Testes atuais:** `npm run typecheck`, `npm run build`, `npm run test:interface` (`tests/unit/*.test.mjs`, que importa `src/*.ts` direto pelo Node 24), `npm run test:e2e` (Playwright, com Supabase local e fixtures fictícias) e `npm run test:rls`, todos na CI (`.github/workflows/governance.yml`).
- **Análise exploratória da ideação:** os números foram medidos numa grade de 5 km, não na célula de 0,05° decidida. Servem de calibração e **não** são valores esperados. A conferência deste ciclo refaz as contagens na grade decidida, por caminho independente, e explica as diferenças.

## Escopo

### Dentro do escopo

- Contrato de lente C1 (tipos TypeScript, identidade de destaque e estados de resultado), documentado numa KB.
- Qualificador de cobertura aplicado a todo destaque.
- Lentes de concentração (município), recorrência (célula de 0,05°, meses GMT) e persistência (célula de 0,05°, dias GMT consecutivos), com os parâmetros fixos das decisões.
- Carregamento, no cliente, dos registros e da disponibilidade necessários, com a carga fixada, sem mistura de cargas e com progresso e cancelamento por geração.
- Interface mínima: seletor de lente, lista de destaques, destaque no mapa e painel de motivo e evidência, com parâmetros visíveis e não editáveis.
- Casos de referência fictícios, conferência independente sobre a carga real local, medição de tempo e de bytes, e documentação viva (KB nova, guia da interface no runbook e KB-003 no encerramento).

### Fora do escopo

- Migração, função, tabela, view, política ou grant novos (G2 e G4). Se forem necessários, a situação passa a "Parado" e o trabalho é retriado (Q10).
- Lente de cobertura como seleção (V1), densidade por km² (K2), percentil (K3), raio ou agrupamento por distância (U3) e edição de limiares na interface.
- Combinação de lentes por interseção, união ou pesos (BL-005); camadas externas (BL-002, BL-006); VIIRS (BL-003); histórico maior (BL-004); design system (BL-007); atualização automática (BL-008); IA (BL-009).
- Alteração do método de contagem, da disponibilidade D1, das regras H3 ou da sensibilidade Cuiabá da KB-004.
- Exportação, favoritos, persistência de resultados de lente, cache em armazenamento do navegador e qualquer afirmação de incêndio, dano, autoria, infração ou prioridade.

## Decisões e autoridades

Autoridades: `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, KB-003, KB-004, ADR-005, ADR-007 e as decisões humanas da ideação. As decisões humanas de método estão abaixo. O que este plano acrescenta como proposta técnica fica marcado como tal e só vira decisão com a aprovação do plano.

### Decisões herdadas da ideação (2026-11-10)

Q1 a Q12, aceitas integralmente pelo responsável e registradas na ideação. Em síntese: escopo E1 fatiado em issues; cobertura como qualificador (V2); concentração por município (U1) e as demais por célula de 0,05° (U2); concentração por contagem, com os 10 primeiros (K1, N=10); recorrência em meses distintos, k=3; persistência em 3 ou mais dias consecutivos, com dia indeterminado interrompendo; cobertura sem limiar; só a concentração ordena; contrato C1; cálculo L3 sem migração; interface mínima; janela escolhida na interface, em dia GMT.

### Decisões complementares de método — 2026-11-10

Perguntas feitas antes do rascunho, com recomendação, alternativas e exemplo numérico. O responsável escolheu a recomendação nas quatro.

| Decisão | Escolha | Exemplo apresentado |
| :-- | :-- | :-- |
| **D13 — Cobertura de célula com focos de mais de um município** | **União conservadora.** Um dia só conta como "sem evidência de lacuna" se todos os municípios das detecções da célula na janela estiverem `sem_evidencia_de_lacuna` naquele dia. Vale a precedência D1 (lacuna > indeterminada > sem evidência). A célula lista os municípios usados. | Focos em A e B; no dia 10, A está indeterminado e B sem lacuna → o dia 10 conta contra a cobertura. |
| **D14 — Mês parcial na recorrência** | **Mês tocado conta.** Todo mês GMT que cruza a janela conta, e a evidência marca os meses parciais. "Janela insuficiente" só quando a janela toca menos de 3 meses GMT. | 15/08 a 14/10 toca 3 meses, e a lente roda (agosto e outubro marcados como parciais). |
| **D15 — Dia indeterminado com foco na persistência** | **Foco observado conta.** Um dia com detecção na célula entra na sequência, qualquer que seja sua classe, com a ressalva "inclui dia indeterminado". Só um dia **sem** detecção interrompe a sequência. Se esse dia for indeterminado ou lacuna, gera a ressalva "sequência adjacente a dia indeterminado; pode ser mais longa". | Focos nos dias 10, 11 e 12, com o 11 indeterminado → sequência de 3 dias, destacada com ressalva. |
| **D16 — Empate no corte N=10 da concentração** | **Incluir os empatados.** A lista pode passar de N e declara o motivo ("11 municípios por empate no 10º lugar"). Município com 0 detecções nunca entra. | 10º e 11º com 85 cada → ambos entram. |

Consequência verificada de D15: como só dias sem detecção interrompem, **a disponibilidade não altera quais sequências são destacadas**, apenas as ressalvas. A seleção da persistência é o conjunto de sequências de 3 ou mais dias GMT consecutivos com detecção na célula.

### Detalhes técnicos propostos para ratificação na aprovação

Não são novas regras analíticas de escolha livre: decorrem de Q3, Q6, Q8, Q12 e D13 a D16, mas mudam resultados de borda ou o que é exibido. Por isso aparecem em "Aprovar plano › Conferir" e só valem com a aprovação.

| Detalhe | Proposta | Exemplo | Alternativa considerada |
| :-- | :-- | :-- | :-- |
| **T1 — Grade de 0,05°** | Ancorada em 0° de latitude e 0° de longitude. A célula é o intervalo semiaberto `[k·0,05; (k+1)·0,05)` em cada eixo, com as bordas sul e oeste incluídas. Índices calculados por aritmética decimal exata (inteiros na escala das casas decimais da fonte, conferida na carga), nunca por divisão em ponto flutuante. | Latitude −15,05 → célula de −15,05 a −15,00. Latitude −15,0501 → célula de −15,10 a −15,05. Em ponto flutuante, `−56,05 / 0,05` dá `−1120,9999999999998`: o erro de arredondamento pode trocar a célula de um ponto na borda. | Outra âncora (por exemplo, o canto da caixa de MT) desloca todas as células sem ganho de método. |
| **T2 — Abrangência espacial** | As três lentes rodam sobre o estado inteiro na janela da consulta. O filtro de município da consulta **não** se aplica às lentes, e a interface diz isso. | Consulta de Colniza em outubro → a concentração mostra os municípios de MT em outubro, com aviso. | Restringir a lente ao município filtrado anula a concentração e corta células na divisa. |
| **T3 — Dia sem linha de disponibilidade** | Um município-dia sem linha em `disponibilidade` conta contra a cobertura e aparece como "sem informação de disponibilidade" (conservador, como D13). A conferência mede se o caso ocorre na carga real. | Janela de 10 dias, 1 dia sem linha → "9 de 10 dias…" e o dia listado. | Ignorar o dia infla a cobertura. |
| **T4 — Sequência na borda da janela** | Persistência que começa no primeiro dia ou termina no último dia da janela recebe a ressalva "sequência no limite da janela; pode ser mais longa". A ressalva não muda a seleção. | Janela de 01/10 a 31/10, focos em 01, 02 e 03/10 → destacada, com ressalva. | Sem ressalva, o usuário lê como início real. |
| **T5 — Ordem sem ranking** | Recorrência: código da célula (norte→sul, depois oeste→leste). Persistência: data de início da sequência, depois código da célula. Concentração: contagem decrescente, com empate por nome do município e depois por código IBGE, **só para exibição**, porque o corte já incluiu todos os empatados (D16). | — | Ordenar recorrência pelo número de meses pareceria ranking (vedado por Q8). |
| **T6 — Várias sequências na mesma célula** | Cada sequência de 3 ou mais dias é um destaque próprio, identificado pela célula e pelo dia inicial. | Célula com 05–07/08 e 20–23/08 → 2 destaques. | Um destaque por célula, com a lista de sequências, perde a identidade por evento para a combinação futura. |

### Contrato de lente C1

Tipos em `src/lentes/contrato.ts`. Todo resultado é função pura de: carga, janela, parâmetros fixos, registros principais da janela e disponibilidade dos municípios envolvidos. Mesma entrada, mesma saída, com ordem estável.

| Campo | Conteúdo |
| :-- | :-- |
| `lente` | `concentracao`, `recorrencia` ou `persistencia` |
| `versao_metodo` | Identificador fixo do método (por exemplo, `lentes-004-v1`). Mudar parâmetro ou regra muda a versão (nova decisão G1 e novo plano). |
| `carga` | `id` e `identidade` da carga usada; resultados de cargas diferentes nunca se misturam (ADR-007) |
| `janela` | `inicio` e `fim` em dias GMT inclusivos e a referência "dias GMT inclusivos"; na recorrência, os meses GMT tocados, com a marca de parcial |
| `parametros` | Valores e textos exibidos: N=10 e regra de empate; k=3 meses; 3 dias consecutivos; célula de 0,05° com âncora T1 |
| `estado` | `com_destaques`, `sem_destaques` ou `janela_insuficiente` (só a recorrência) |
| `ordenacao` | Só na concentração: `{ criterio: 'contagem de detecções', rotulo: 'ordenado por contagem de detecções, não por prioridade, gravidade ou risco' }`; nas demais, `null` |
| `destaques[]` | Ver abaixo |
| `conferencia` | Total de registros lidos e total principal de `consultar_resumo` na mesma carga e janela. A lente só é exibida se os dois forem iguais. |
| `limitacoes[]` | Textos fixos por lente (abaixo) e o aviso de domínio |

Cada destaque traz:

- **`unidade`:** `{ tipo: 'municipio', codigo, nome }` ou `{ tipo: 'celula_005', id, sul, oeste, norte, leste }`, com `id` derivado dos índices T1;
- **`id_destaque`:** lente + unidade (+ dia inicial na persistência, T6). Com carga, janela e versão do método, é a chave para interseção ou união futuras (BL-005). Combinar unidades de tipos diferentes fica para o BL-005;
- **`motivo`:** frase gerada pelo módulo (por exemplo, "Detecções em 3 meses GMT distintos na janela: ago, set e out");
- **`evidencia`:** `id_tecnico` das detecções que sustentam o destaque, o valor medido (contagem, meses ou dias) e as datas (meses ou dias da sequência);
- **`ordem`:** opcional, só na concentração;
- **`cobertura`:** municípios considerados (D13), `dias_janela` (M), `dias_sem_evidencia_de_lacuna` (N) e a lista dos demais dias com classe e motivos. O texto é "N de M dias sem evidência de lacuna (cobertura não comprovada)", nunca "coberto". Enquanto a disponibilidade não chega, o estado é `pendente`, exibido como tal;
- **`ressalvas[]`:** as de D14, D15, T3 e T4, quando se aplicarem.

**Limitações exibidas.** Todas as lentes: "Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração"; "Contagem principal em dias GMT; a sensibilidade America/Cuiaba aparece só no resumo da consulta" (Q12); "Disponibilidade não comprova cobertura". Concentração: "Contagem absoluta favorece municípios grandes" (Q4). Recorrência e persistência: "Focos vizinhos em células diferentes não são lidos como o mesmo local; a célula não segue divisas" (Q3); "A cobertura da célula usa os municípios das detecções, não a área da célula" (D13).

### Regras por lente

- **Concentração (U1, K1):** conta os registros principais da janela por `municipio_codigo`. Os destaques são os municípios com contagem > 0 cuja contagem é maior ou igual à do 10º colocado (D16). Com menos de 10 municípios com detecção, entram todos os que têm detecção. A contagem por município deve ser igual a `consultar_resumo.principal.por_municipio`, e a soma, igual ao total principal.
- **Recorrência (U2, Q5, D14):** meses GMT tocados pela janela; com menos de 3, o estado é `janela_insuficiente`, sem destaques, com o texto "a janela toca N meses GMT; a recorrência exige pelo menos 3". Os destaques são as células com detecções em 3 ou mais meses GMT distintos. O mês de cada detecção vem de `data_hora_gmt`.
- **Persistência (U2, Q6, D15, T4, T6):** dias GMT com detecção por célula; os destaques são as sequências de 3 ou mais dias consecutivos. As ressalvas consultam a disponibilidade da célula (D13): um dia da sequência que não está `sem_evidencia_de_lacuna` gera "inclui dia indeterminado"; um dia vizinho, antes ou depois, sem detecção e não `sem_evidencia_de_lacuna` gera "adjacente…"; o limite da janela gera a ressalva T4. Não se infere detecção em dia sem informação.
- **Cobertura (V2, Q7, D13, T3):** qualificador comum, sem limiar e sem selecionar. `incidencia_indeterminada` e `lacuna_conhecida` contam contra.

### Carregamento de dados e arquitetura

- **Módulo puro:** `src/lentes/` (`contrato.ts`, `grade.ts`, `cobertura.ts`, `concentracao.ts`, `recorrencia.ts`, `persistencia.ts`), sem rede, DOM ou relógio, importável por `node --test`.
- **Leitura:** um carregador em `src/consulta.ts` (ou em `src/lentes/carregar.ts`) pagina `consultar_deteccoes` com limite 1.000 e `p_carga` fixo até ler o total, confere que a soma é igual a `total` e a `consultar_resumo` e aborta se a carga ou a geração mudarem. A disponibilidade é pedida por município, só para os municípios dos destaques, sem repetição e com concorrência limitada. A geometria é pedida só para os municípios destacados pela concentração (cache de memória do ADR-007).
- **Ciclo de vida:** a lente é calculada sob pedido, ao escolhê-la, e não a cada consulta. O resultado fica em memória por carga e janela, é descartado ao mudar a janela ou a carga, e é limpo ao sair, expirar ou perder acesso, pelas mesmas gerações do ADR-007. Nada vai para `localStorage`, `sessionStorage`, Cache ou IndexedDB.
- **Orçamento proposto (a medir no item 1):** na janela inteira, medir bytes brutos, gzip estimado, número de requisições e tempo no perfil do ADR-007, separando registros, disponibilidade e geometria. **Parada:** se o tempo estimado com gzip para a lente completa passar de 20 s, ou os bytes brutos passarem de 10 MB, a situação passa a "Parado", com os números e as alternativas: aceitar com progresso visível; janela padrão menor; ou função agregadora nova no banco (G2 = Sim, G4 = Sim e retriagem do nível, Q10). Nenhuma delas é escolhida pelo agente.

### Interface mínima

- Novo cartão "Lentes de seleção" dentro da grade existente, com seletor (`Nenhuma`, `Concentração`, `Recorrência`, `Persistência`) e a ação primária "Aplicar lente". Mostra a janela e a carga usadas e o aviso T2.
- Lista de destaques em ordem T5, com unidade, valor e estado da cobertura; seleção por teclado e toque.
- Mapa: camada própria de destaques, separada dos pontos da página de registros. Municípios como contorno e células como retângulos, com o estilo de seleção do ADR-007 (contorno tracejado azul claro e indicador textual) e legenda textual. A lista é a alternativa em texto ao mapa.
- Painel de motivo e evidência: motivo, parâmetros, datas (meses ou dias), cobertura com a lista de dias que contam contra, ressalvas e limitações. Para célula, a tabela das detecções da evidência, paginada e declarando "N de M". Para município, a contagem e a ação "Consultar este município", que aplica o filtro existente na mesma janela, em vez de listar centenas de linhas.
- Estados distintos e testados: carregando (com progresso "registros X de Y" e "disponibilidade X de Y municípios"), sem destaques, janela insuficiente, cobertura pendente, divergência de conferência (lente não exibida), versão substituída e falha da fonte.
- Sem redesenho: reutilizar tokens, componentes e regras de acessibilidade do ADR-007 (alvos de 44 × 44 CSS px, foco visível, contraste, 200% e reflow a 320 CSS px). Qualquer mudança visual além disso é BL-007.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — "autorizo o rascunho do plano do ciclo 004" | Ideação registrada (Q1 a Q12) | Este rascunho local, as perguntas D13 a D16, a reconciliação da ideação e a linha do ciclo em `cycles.md` | Revisão, aprovação, publicação, issues e implementação | Recebida em 2026-11-10 |
| Aprovar plano — "aprovo o plano do ciclo 004" | Revisão formal com veredito apto e manifestação humana posterior | O plano revisado; publicação da PR documental (ideação, plano e registro do ciclo); depois da integração documental e da confirmação dos payloads, a criação das três issues; o encerramento, depois das entregas | Implementação, merges e verificação em produção | Como decisões humanas de G1: Q1 a Q12, D13 a D16, T1 a T6, o contrato C1, os textos de limitação, o fatiamento em três issues (com a cobertura dentro do item 1) e o orçamento com parada |
| Autorizar implementação — "autorizo a implementação da issue #N" | Plano aprovado e integrado, issue criada e itens anteriores integrados | Branch, task, implementação, testes, conferência local com a carga real em `local/` e a PR da issue | Merge, migração ou função nova, mudança de parâmetro e decisão de orçamento após parada | Escopo da issue, barreiras e gates |
| Aprovar merge — "aprovo o merge da PR #N" | PR concreta, checks verdes no último commit e diff conferido | Somente o merge daquela PR, por squash, **e o deploy de produção automático que ele dispara na Vercel** | Outras PRs, verificação em produção e nova entrega | Diff, G1 a G4, privacidade, conferência das lentes e estado real |
| Verificar produção — "autorizo a verificação em produção do ciclo 004" | Itens 1 a 3 integrados e deploy de `main` identificado por commit | O roteiro curto do item 3: o responsável, na própria sessão, aplica cada lente na janela inteira e informa tempo, bytes transferidos (DevTools) e as contagens exibidas; o agente confere com a conferência local da mesma carga | Login pelo agente, carga, migração, mudança de dados ou de método | Commit do deploy, carga vigente, contagens iguais à conferência local e orçamento hospedado |

Não há ação humana externa prevista: nenhuma migração ou configuração hospedada muda. Cada PR, inclusive a documental e a de encerramento, tem aprovação própria de merge. No ciclo completo não há modo contínuo. Toda cadeia autorizada para em "Parado" quando: a conferência independente divergir do módulo sem explicação; o orçamento for excedido; surgir a necessidade de função, tabela, política ou migração (G2 e G4, com retriagem); um caso de borda não previsto em Q1 a Q12, D13 a D16 ou T1 a T6 mudar a seleção; ou houver dúvida de privacidade. A concessão não dispensa a conferência da precondição.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Critério de seleção novo: unidade, contagem, janela, grade e empates. Atendida por decisões humanas registradas (Q1 a Q12 e D13 a D16, com T1 a T6 ratificados na aprovação); casos de referência fictícios com valores esperados escritos neste plano antes do código; conferência sobre a carga real por caminho independente (SQL no banco local, sem importar o módulo); igualdade com `consultar_resumo`; proveniência por carga, janela, parâmetros e versão do método; limitações e aviso de domínio em cada resultado. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, view, política ou grant novo: as lentes só chamam as RPCs existentes sob a sessão do usuário (ADR-005). A limpeza dos resultados ao sair ou expirar segue o ADR-007 e é testada no E2E, sem alterar a matriz de acesso. Se surgir objeto novo no banco, a situação passa a "Parado" e o trabalho é retriado (Q10). |
| G3 — privacidade de dados | Sim | Sem dados pessoais. Fixtures de lentes fictícias em `tests/fixtures/lentes/` e no E2E. A carga real (pública, INPE e IBGE) só é usada localmente, em `local/`. O relatório versionado traz apenas agregados públicos (contagens por município ou por célula e totais), sem brutos. Nenhum resultado no bundle ou em armazenamento do navegador. |
| G4 — migrações só acrescentam | Não | Nenhuma migração é criada ou alterada. Uma migração necessária leva a "Parado" e à retriagem; o passo de CI do G4 continua ativo. |

## Estratégia de testes

- **Nesta redação:** testes e validador de governança, `git diff --check`, revisão do diff, coerência de estados e referências, G3. Nenhum código, banco ou dado real executado para redigir o plano, salvo a demonstração em Node do erro de ponto flutuante citado em T1.
- **Casos de referência (unitários, `tests/unit/lentes.test.mjs`):** fixtures fictícias em `tests/fixtures/lentes/`, com o valor esperado escrito à mão a partir da tabela abaixo. Os valores esperados não são gerados pelo código nem copiados de uma saída dele.

| Caso | Entrada fictícia | Esperado |
| :-- | :-- | :-- |
| C-1 Concentração com empate | A=12, B=7, C=7, D=0; N=2 | A (1º), B e C (2º, por empate); "3 municípios por empate no 2º lugar"; D ausente |
| C-2 Menos de N com detecção | A=4, B=1, demais 0; N=10 | A e B apenas |
| C-3 Borda da janela | Janela de 01/10 a 31/10; detecções em `2026-10-31T23:59:59Z` e `2026-11-01T00:00:00Z` | Só a primeira conta (a segunda não vem da RPC na mesma janela; o módulo também a rejeita) |
| C-4 Conferência | Soma das contagens diferente do total do resumo | Resultado não exibido, estado de divergência |
| G-1 Grade T1 | Latitudes −15,05, −15,0499 e −15,0501; longitudes −56,05 e −56,0500001 | Células de sul −15,05, −15,05 e −15,10; de oeste −56,05 e −56,10 |
| R-1 Recorrência | Célula X com detecções em ago, set e out; célula Y com 10 detecções em ago e set | X destacada (3 meses); Y não |
| R-2 Mês GMT | Detecção em `2026-09-01T02:00:00Z` (ainda 31/08 em Cuiabá) | Conta para setembro |
| R-3 Mês parcial (D14) | Janela de 15/08 a 14/10 | Lente roda; agosto e outubro marcados como parciais |
| R-4 Janela insuficiente | Janela de 15/08 a 30/09 | `janela_insuficiente`, toca 2 meses, nenhum destaque |
| P-1 Persistência simples | Dias 5, 6 e 7, todos sem lacuna | 1 destaque de 3 dias, sem ressalva de disponibilidade |
| P-2 Sem sequência | Dias 5, 12 e 20 | Nenhum destaque |
| P-3 Indeterminado com foco (D15) | Dias 10, 11 e 12; dia 11 indeterminado | 1 destaque de 3 dias, "inclui dia indeterminado" |
| P-4 Indeterminado sem foco | Dias 10, 12, 13 e 14; dia 11 indeterminado sem detecção | 1 destaque, de 12 a 14, "adjacente a dia indeterminado; pode ser mais longa"; o dia 10 isolado não |
| P-5 Sem inferência | Dias 10 e 11; dia 12 indeterminado sem detecção; dia 13 | Nenhum destaque (2 + 1 dias) |
| P-6 Borda (T4) e duas sequências (T6) | Janela começando em 01/10; dias 01, 02 e 03 e dias 20, 21 e 22 | 2 destaques; o primeiro com "sequência no limite da janela" |
| V-1 Cobertura de município | 90 dias, 6 `incidencia_indeterminada` | "84 de 90 dias sem evidência de lacuna (cobertura não comprovada)", 6 dias listados |
| V-2 União (D13) | Célula com focos em A e B; 10 dias; A indeterminado no dia 3, B lacuna no dia 7 | "8 de 10…", dias 3 e 7 listados com classe e município |
| V-3 Sem linha (T3) | 10 dias, 1 sem linha | "9 de 10…", dia listado como "sem informação de disponibilidade" |
| X-1 Determinismo | Mesmos registros em ordem embaralhada | Resultado idêntico (destaques, ordem e evidência) |

- **Conferência independente sobre a carga real (local, fora da CI):** um script `scripts/lentes/conferir.mjs` executa SQL escrito à parte (sem importar `src/lentes/`) diretamente no Supabase local carregado pela operação da seção 1 a 9 do runbook. Ele calcula, para a janela inteira e para duas janelas menores (um mês de pico e uma janela de 2 meses, que exercita a recorrência insuficiente): contagem por município e corte com empates; células por T1; meses distintos por célula; sequências de 3 ou mais dias; e cobertura por união. O resultado é comparado destaque a destaque com o módulo alimentado pelas RPCs. Diferença sem explicação → "Parado". Os números (agregados públicos) entram em `004_research_conferencia_lentes.md`, que também compara com a análise exploratória da ideação e explica as diferenças (grade de 5 km contra 0,05°). A ocorrência de T3 e o número máximo de casas decimais das coordenadas são medidos ali.
- **Interface (E2E, `tests/e2e/05-lentes.spec.mjs`):** fixture fictícia com destaques conhecidos em `tests/e2e/fixture.mjs`. Cobre seletor, aplicar, lista, mapa e painel; parâmetros e rótulo de ordenação visíveis; janela insuficiente; ressalvas D15 e T4; cobertura com "cobertura não comprovada" e sem a palavra "coberto"; aviso T2; troca de janela e de versão sem mistura; logout limpando a lente; teclado, foco, 360/390 px com toque, 200% e reflow.
- **Medição:** `scripts/interface/medir-lentes.mjs` (no padrão de `medir-geometria.mjs`), sobre a carga real local, no perfil do ADR-007: bytes brutos, gzip estimado, requisições e tempo por lente na janela inteira. O resultado decide o orçamento proposto.
- **Gates por PR:** `npm run test:governance`, `npm run check:governance`, `npm run typecheck`, `npm run build`, `npm run test:interface`, `npm run test:e2e`, `npm run test:rls` (sem mudança esperada), `git diff --check` e inspeção do bundle (`tests/unit/bundle.test.mjs`): nenhum dado territorial ou de `local/` embutido.

## Itens de implementação

### Item 1 — Contrato de lente, qualificador de cobertura, lente de concentração e interface mínima

**Contexto:** o contrato C1 e a cobertura (Q2, Q9) são comuns a todas as lentes. Entregá-los com a concentração permite que cada lente chegue à produção, por deploy automático, já qualificada e com limitações.

**Ação técnica:** criar `src/lentes/` (contrato, grade T1, cobertura e concentração), o carregador paginado com conferência de totais e a disponibilidade por município; integrar ao `app.ts` com as gerações existentes; criar o cartão, a lista, a camada de mapa e o painel em `apresentacao.ts`, `mapa.ts`, `index.html` e CSS existente; escrever as fixtures e os testes C, G e V; criar o E2E de lentes; criar `scripts/lentes/conferir.mjs` e `scripts/interface/medir-lentes.mjs`; registrar a conferência e a medição em `004_research_conferencia_lentes.md`; criar a KB do contrato e do método (template `.agent/templates/kb.md` lido no ponto de uso; numeração conferida, hoje seria KB-005) e atualizar o guia da interface no runbook (seção 10).

**Critérios de aceite:**

- [ ] O contrato C1 está tipado e documentado na KB, com identidade de destaque, estados, limitações e versão do método.
- [ ] Os casos C-1 a C-4, G-1, V-1 a V-3 e X-1 passam, com valores esperados escritos à mão.
- [ ] A conferência independente reproduz a concentração e a cobertura na carga real (janela inteira e duas menores), destaque a destaque; a soma das contagens é igual a `consultar_resumo`. O relatório traz a ocorrência de T3 e as casas decimais das coordenadas.
- [ ] A medição no perfil do ADR-007 está registrada. Se exceder o orçamento, a situação é "Parado", com as alternativas, antes da PR.
- [ ] A interface mostra seletor, lista, mapa e painel, com parâmetros visíveis e não editáveis, o rótulo "ordenado por contagem de detecções, não por prioridade, gravidade ou risco", o aviso T2, a cobertura "N de M dias sem evidência de lacuna (cobertura não comprovada)" e as limitações. A palavra "coberto" não aparece como qualificação.
- [ ] Os estados (carregando com progresso, sem destaques, cobertura pendente, divergência, versão substituída e falha) são distintos e testados; troca de janela ou de carga não mistura resultados; sair ou expirar limpa a lente; nada é persistido no navegador.
- [ ] A acessibilidade do ADR-007 é mantida (teclado, foco, 44 × 44, contraste, 360/390 px, 200% e reflow) e a lista é a alternativa em texto ao mapa.
- [ ] Os gates passam, e nenhuma migração, função ou política é criada.

### Item 2 — Lente de recorrência

**Contexto:** a primeira lente por célula exercita a grade T1, a união D13 e o estado `janela_insuficiente`.

**Ação técnica:** criar `src/lentes/recorrencia.ts` sobre o contrato e a grade do item 1; incluir a opção no seletor, os retângulos de célula no mapa e o painel com meses (parciais marcados) e a tabela de evidência paginada; escrever os casos R e estender a conferência, a medição, o E2E e a KB.

**Critérios de aceite:**

- [ ] Os casos R-1 a R-4 passam, e os casos do item 1 continuam passando.
- [ ] A conferência independente reproduz as células com 3 ou mais meses na carga real, nas três janelas, e explica a diferença para as 142 células da grade de 5 km da ideação.
- [ ] A janela de 2 meses mostra "janela insuficiente", sem destaques; a janela com mês parcial marca os parciais.
- [ ] A cobertura da célula lista os municípios usados (D13); ordem T5 sem ranking; limitações da célula visíveis.
- [ ] A medição continua dentro do orçamento ou leva a "Parado"; os gates passam; nenhum objeto novo no banco.

### Item 3 — Lente de persistência e verificação do ciclo em produção

**Contexto:** a lente que depende das ressalvas de disponibilidade (D15 e T4) e das sequências por célula (T6). É a última entrega técnica; o roteiro de verificação em produção cobre as três lentes.

**Ação técnica:** criar `src/lentes/persistencia.ts`; incluir a opção no seletor e, no painel, os dias da sequência com as ressalvas; escrever os casos P; estender a conferência, a medição, o E2E e a KB; preparar na task o roteiro curto de verificação em produção (passos do responsável, valores locais esperados por lente e o que informar, sem segredos).

**Critérios de aceite:**

- [ ] Os casos P-1 a P-6 passam, e os casos dos itens 1 e 2 continuam passando.
- [ ] A conferência independente reproduz as sequências de 3 ou mais dias e as ressalvas na carga real, e explica a diferença para as 62 sequências da grade de 5 km da ideação.
- [ ] As ressalvas "inclui dia indeterminado", "adjacente a dia indeterminado; pode ser mais longa" e "sequência no limite da janela" aparecem só onde as regras mandam; nenhuma detecção é inferida.
- [ ] A medição das três lentes está consolidada no relatório e no guia; os gates passam; nenhum objeto novo no banco.
- [ ] O roteiro de verificação em produção está pronto na task; ele só é executado depois de "autorizo a verificação em produção do ciclo 004".

## Arquivos afetados

- **Nesta redação:** este plano; a ideação (registro da autorização, das decisões D13 a D16 e do novo artefato ativo); a linha do ciclo `004` em `_project/cycles.md` (`Planejamento` e link do plano).
- **Na execução proposta:** `src/lentes/*.ts`, `src/consulta.ts`, `src/app.ts`, `src/apresentacao.ts`, `src/mapa.ts`, `src/tipos.ts` (se necessário), `index.html`, `src/estilos/*.css` (só componentes novos, sem redesenho), `tests/unit/lentes.test.mjs`, `tests/fixtures/lentes/`, `tests/e2e/05-lentes.spec.mjs`, `tests/e2e/fixture.mjs`, `scripts/lentes/conferir.mjs`, `scripts/interface/medir-lentes.mjs`, `package.json` (scripts `conferir:lentes` e `medir:lentes`, sem dependência nova), `docs/runbook.md` (seção 10), a KB nova, `_project/drafts/004_contrato_lentes_selecao/004_research_conferencia_lentes.md` e as tasks do ciclo. No encerramento: KB-003 (seleção explicável), README se cabível e o registro do ciclo.
- **Nunca:** `supabase/migrations/`, `supabase/tests/`, políticas, dados reais ou arquivos de `local/`.

## Decomposição em issues e PRs

| Unidade planejada | Issue a criar após aprovação e integração documental | Dependência | PR / fechamento |
| :-- | :-- | :-- | :-- |
| Plano completo | Sem issue documental | Revisão e aprovação do plano | `chore/cycle-004-plan`; inclui ideação, plano e registro do ciclo; merge próprio |
| Item 1 | `[FEATURE] Contrato de lente, cobertura e lente de concentração` | Plano integrado e payload confirmado | `feature/issue-N`; uma PR; fecha a issue ao integrar |
| Item 2 | `[FEATURE] Lente de recorrência por célula de 0,05°` | Item 1 integrado | `feature/issue-N`; uma PR; fecha a issue ao integrar |
| Item 3 | `[FEATURE] Lente de persistência por célula de 0,05°` | Item 2 integrado | `feature/issue-N`; uma PR; fecha a issue ao integrar; a verificação em produção vem depois e é registrada no encerramento |
| Encerramento | Sem issue | Itens integrados e verificação em produção registrada | `chore/cycle-004-closure`; encerramento prospectivo; merge próprio |

**Desvio deliberado de Q1, para conferência na revisão.** A ideação listou quatro fatias: contrato com concentração, recorrência, persistência e cobertura. Este plano usa três, com a cobertura dentro do item 1, porque: (a) Q2 e Q9 fazem da cobertura um qualificador e um campo do contrato, e não uma lente; (b) a persistência depende da disponibilidade para as ressalvas de D15; (c) cada merge implanta em produção, e entregar a cobertura por último exporia destaques sem a ressalva exigida pela ideação ("Cada resultado deve exibir limitações e a ressalva de cobertura"). O conteúdo de Q1 não muda, só a ordem e o agrupamento. Se o item 3 não couber, ele pode voltar ao BL-001 como Restante, por decisão registrada (Q1).

Os números de issue não existem nesta etapa. Cada payload é apresentado e confirmado antes da criação. Task `004_task_issue-N.md` ao iniciar cada implementação.

## Dependências e blockers

- **Para aprovar o plano:** veredito apto em revisão formal; ratificação de T1 a T6 e do fatiamento.
- **Para a conferência dos itens:** Supabase local disponível (já usado no ciclo `003`) e a carga real local em `local/dados-prototipo/`, recarregável pelo runbook (seções 1 a 9). Sem ela, a conferência não pode ser dispensada: a situação passa a "Parado".
- **Para a verificação em produção:** deploy da `main` integrada, carga vigente hospedada igual à local conferida (mesma `identidade`) e o responsável disponível para executar o roteiro na própria sessão.
- **Para o retorno ao BL-001:** encerramento integrado em `main`; o registro e sua publicação seguem `gerenciar_backlog`, com autorização própria para publicar.

## Riscos, suposições e rollback

| Risco ou hipótese | Tratamento |
| :-- | :-- |
| Destaque lido como prova ou prioridade | Aviso de domínio e limitações em toda lente; rótulo da ordenação; nenhum termo de risco, gravidade ou prioridade; revisão de textos na PR. |
| Volume do carregamento no celular (registros da janela inteira e disponibilidade por município) | Medição no perfil do ADR-007 e orçamento com parada; progresso visível; cobertura `pendente` em vez de omitida. A escolha entre as alternativas é humana. |
| Ponto flutuante troca a célula de pontos na borda | T1 com aritmética decimal exata e caso G-1; casas decimais medidas na carga real. |
| Conferência "independente" contaminada pelo módulo | SQL escrito à parte, sem importar `src/lentes/`; valores esperados dos casos fixados neste plano; diferença sem explicação leva a "Parado". |
| Deploy automático a cada merge | Cada item entrega lentes completas e qualificadas; as aprovações de merge declaram o deploy; rollback por reverter o commit em nova PR. |
| Necessidade de objeto no banco (desempenho ou paginação) | Fora do escopo: "Parado", G2 e G4 = Sim e retriagem; nenhum contorno no cliente que faça amostragem oculta. |
| Cobertura uniforme entre municípios (ideação) faz o qualificador parecer redundante | Exibido mesmo assim; nada no módulo presume a uniformidade, e os casos V testam municípios diferentes. |
| Reprodutibilidade entre cargas | Carga, janela, parâmetros e versão do método em cada resultado; cargas nunca se misturam. |

Rollback: as lentes não alteram dados nem schema. Reverter uma entrega é uma PR de reversão do commit da issue, com aprovação de merge, e o deploy volta à interface anterior. Não há dado a restaurar.

## Sequência recomendada

1. Revisar formalmente este rascunho e corrigir mediante autorização; obter "aprovo o plano do ciclo 004" depois de veredito apto.
2. Publicar a PR documental (`chore/cycle-004-plan`), conferir checks e obter a aprovação do merge. Apresentar os três payloads, confirmar e criar as issues.
3. Item 1: autorizar, implementar, conferir com a carga real, medir (parar se exceder), publicar a PR e aprovar o merge (deploy).
4. Item 2: idem.
5. Item 3: idem, com o roteiro de verificação pronto.
6. "Autorizo a verificação em produção do ciclo 004": o responsável executa o roteiro e o agente confere com a conferência local.
7. Encerramento prospectivo em `chore/cycle-004-closure`: KB-003, guia, relatório, plano `Concluído` e movimento para `executed/`, com merge próprio. Depois da integração comprovada, retorno ao BL-001 pela fila do backlog, com publicação autorizada à parte.

## Referências

- `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, `.agent/workflows/rascunhar_plano.md` e `.agent/templates/plano_implementacao.md`, lidos no ponto de uso em 2026-11-10.
- Ideação `004` (Q1 a Q12, análise exploratória e verificações pedidas); `_project/backlog.md` (BL-001, BL-005 e BL-007) em `85b444d`.
- KB-003 (propósito de seleção explicável), KB-004 (método, D1, H3, "cobertura não comprovada"), ADR-005 (matriz e consultas), ADR-007 (interface, gerações, versão fixada, perfil de medição) e o plano `003` (estrutura e precedentes).
- `supabase/migrations/20261107210000_esquema_dados.sql` e `20261107210200_consultas.sql`; `src/consulta.ts`, `src/tipos.ts` e `src/app.ts`; `tests/unit/logica.test.mjs` (padrão de import de `src/*.ts`); `docs/runbook.md` (seções 10 e 11, deploy por `main`).

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | — |
| PR(s) | — |
| Branch(es) | Ideação: `chore/cycle-004-ideation` em `c51ad73` (local); plano: `chore/cycle-004-plan`, derivada dela (local) |
| Destino após conclusão | `_project/executed/004_contrato_lentes_selecao/004_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 1) — ciclo 004 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 004"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + rascunhar_plano + 004_plan + v1@c51ad73`
- `effect_class`: `local_mutation`
- `state_before`: ciclo `004` em `Ideação`, sem plano; ideação com Q1 a Q12 decididas, commitada localmente em `c51ad73` (`chore/cycle-004-ideation`); `main` e `origin/main` em `85b444d`, sem PR ou issue aberta.
- `state_after`: decisões D13 a D16 registradas; este plano `v1` em `Rascunho`; ciclo `004` em `Planejamento` em `cycles.md`; ideação reconciliada, apontando para o plano como artefato ativo; branch local `chore/cycle-004-plan`. Nenhuma revisão, aprovação, issue, implementação, push ou PR.
- `result`: `executed`
- `evidence`: frase "Autorizo o rascunho do plano do ciclo 004" (2026-11-10); respostas do responsável às quatro perguntas (recomendação escolhida em todas); leitura das autoridades, do workflow, do template, da ideação, de KB-003, KB-004, ADR-005, ADR-007, das migrações de schema e de consulta e dos módulos da interface; consulta somente leitura por `gh` (nenhuma PR ou issue aberta) e `git fetch` (`main` = `origin/main` = `85b444d`). Validação local registrada abaixo.
- `blockers`: nenhum para o rascunho; revisão formal pendente.

### Validação local do rascunho

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas.
- `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais. `git diff --check`: sem erros. Diff restrito a este plano, à reconciliação da ideação e à linha do ciclo `004` em `cycles.md`.
- Conferência manual: G3 (sem dados pessoais; números citados vêm da ideação ou de agregados públicos), frases do responsável reproduzidas literalmente, nenhum número de issue ou PR inventado, estados e próximo passo coerentes.
- Alteração documental local. Nenhum código, banco, carga, push, PR ou issue.

## Revisão crítica

Nenhuma rodada ainda. Uma subseção `### Rodada N` por rodada, com `Autor:`, `Revisor:` (ferramenta e modelo), achados `RN-k` (bloqueador ou ressalva), itens atendidos e veredito. O autor responde a cada achado numa subseção própria. Teto de 5 rodadas.

**Pontos para o revisor conferir com atenção:** o desvio de fatiamento em relação a Q1; se T1 a T6 são de fato consequências das decisões ou exigem pergunta própria; o orçamento proposto (20 s e 10 MB) e sua parada; a independência da conferência por SQL; a suficiência dos casos de referência; e a ausência de G2 e G4.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
