# Plano de Implementação — Contrato de lente de seleção e lentes com dados já carregados

> **Ciclo:** `004`
> **Status:** `Em Execução`
> **Versão:** `v3`
> **Data de criação:** 2026-11-10
> **Última atualização:** 2026-11-11
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "Confirmo completo" em 2026-11-10 (resposta à triagem do ciclo 004; ver ideação)
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO COM RESSALVAS`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-11`
> **handoff_schema_version:** `2`

**Autorização do rascunho:** "Autorizo o rascunho do plano do ciclo 004", em 2026-11-10. Autor: Claude Code (Opus 5.5). Antes de redigir, o autor apresentou quatro detalhes de método que a ideação deixou abertos, cada um com recomendação, alternativas e exemplo numérico. O responsável escolheu a opção recomendada nos quatro (decisões D13 a D16 abaixo). Essas escolhas não são aprovação do plano após revisão, nem autorização de issue ou de implementação.

**Aprovação do plano — v3, 2026-11-11:** o responsável manifestou literalmente "aprovo o plano do ciclo 004", depois do veredito `APTO COM RESSALVAS` da rodada 3 (revisor: Codex, GPT-6).

A aprovação ratifica como decisões humanas de G1 os itens enumerados em "Aprovar plano › Conferir":

- Q1 a Q12 e D13 a D16, com D15 refinando Q6;
- o recorte M1-a: as lentes rodam sobre o estado inteiro, e o filtro de município não se aplica a elas;
- T1, com o valor canônico das coordenadas, e T3 a T7;
- o contrato C1, as ressalvas por classe e os textos de limitação.

Ratifica também o fatiamento em três issues, com a cobertura no item 1, e o orçamento com o procedimento de medição e as duas paradas.

**Ressalva R3-1 incorporada ao item 1, sem mudar o escopo.** Na implementação do item 1, o tratamento de `versao_substituida` deve invalidar, assim que o erro for reconhecido, as respostas em trânsito da lente **e** da consulta comum: hoje `aoFalharConsulta` limpa os resultados sem avançar a geração da consulta. O E2E do item 1 libera uma resposta antiga depois desse estado e confere que ela não repovoa mapa, tabela ou lente. A ressalva detalha a verificação de critérios já existentes (limpeza e versão fixada).

Cobre:

- a publicação da PR documental deste lote (ideação, plano e registro do ciclo);
- depois da integração documental e da confirmação dos payloads, a criação das três issues;
- o encerramento, depois das entregas.

Não cobre merges, a implementação das issues nem a verificação em produção. Cada um desses passos tem frase própria.

**Publicação e issues.** A PR documental #32 foi integrada em 2026-11-11 (`fa302b5`). As issues #33 (item 1), #34 (item 2) e #35 (item 3) foram criadas em 2026-11-11.

**Execução do item 1:** autorização literal "autorizo a implementação da issue #33" recebida em 2026-11-11. A task `004_task_issue-33.md` é o artefato ativo; somente o item 1 está em execução.

**Autorização da correção — v3, 2026-11-11 (histórico):** "corrija o plano do ciclo 004", depois do veredito `REQUER NOVA RODADA` da rodada 2 (revisor: Codex, GPT-6). A v3 responde a R2-1 a R2-4 (ver "Resposta do autor à rodada 2 — v3"), preserva as rodadas 1 e 2 e mantém o plano `Em Revisão`, aguardando a rodada 3. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova; M1, T1, T3 a T7 e o orçamento continuam propostas a ratificar na aprovação.

**Autorização da correção — v2, 2026-11-11 (histórico):** "corrija o plano do ciclo 004", depois do veredito `REQUER NOVA RODADA` da rodada 1 (revisor: Codex, GPT-6). A v2 responde a R1-1 a R1-8 (ver "Resposta do autor à rodada 1 — v2"), preserva a rodada 1 integralmente e mantém o plano `Em Revisão`, aguardando a rodada 2. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova foi tomada nesta correção. A escolha do recorte espacial (M1, antes T2) e os detalhes T1 e T3 a T7 seguem como propostas a ratificar na aprovação, com alternativas e exemplos numéricos.

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

**D15 refina Q6.** Q6 diz que "um dia indeterminado interrompe a sequência". D15 delimita essa regra: interrompe o dia **sem detecção** na célula, qualquer que seja sua classe (`sem_evidencia_de_lacuna`, `incidencia_indeterminada` ou `lacuna_conhecida`). Um dia **com detecção** observada nunca interrompe. A classe observada de cada dia é preservada e exibida (ver "Ressalvas por classe" em "Regras por lente"); D15 não funde `lacuna_conhecida` com `incidencia_indeterminada`.

Consequência verificada de D15: como só dias sem detecção interrompem, **a disponibilidade não altera quais sequências são destacadas**, apenas as ressalvas. A seleção da persistência é o conjunto de sequências de 3 ou mais dias GMT consecutivos com detecção na célula. O mesmo vale para as outras duas lentes: nenhuma seleção depende da disponibilidade, que só qualifica.

### Escolha de método a ratificar — recorte espacial de entrada (M1)

O filtro de município da consulta comum muda o conjunto de detecções que entra nas três lentes. Por isso é escolha de método (G1), e não detalhe técnico (R1-1). Exemplo fictício: janela de agosto a outubro, filtro em Colniza. O estado tem 10 detecções; Colniza, 4. A célula K fica na divisa: em Colniza tem detecções em agosto e setembro; no município vizinho, em outubro.

| Opção | Entrada das lentes | Efeito no exemplo |
| :-- | :-- | :-- |
| **M1-a — Estado inteiro, ignorando o filtro (proposta)** | Todos os registros principais de MT na janela; a interface avisa que o filtro de município não se aplica às lentes | Concentração lista os municípios de MT (até 10, com empates); K tem 3 meses distintos (ago, set e out) e é destacada pela recorrência |
| **M1-b — Só as detecções do município filtrado** | Registros com `municipio_codigo` igual ao filtro | Concentração mostra um único município, sem valor comparativo; K tem 2 meses (ago e set) e **não** é destacada, porque as detecções do vizinho foram cortadas |
| **M1-c — Estado inteiro, exibindo só os destaques que tocam o município** | Cálculo como M1-a; a lista mostra só destaques com evidência no município filtrado | K é destacada (3 meses), mas a concentração continua sem sentido com um município; a lista muda conforme o filtro sem mudar o cálculo |

Proposta: **M1-a**, porque mantém o resultado independente do filtro e não corta células na divisa. A escolha só vale com a aprovação do plano. Em qualquer opção, o resumo usado na conferência dos totais é o do mesmo recorte de entrada: em M1-a, `consultar_resumo` com `p_municipio: null`.

### Detalhes técnicos propostos para ratificação na aprovação

Não são novas regras analíticas de escolha livre: decorrem de Q3, Q6, Q8, Q12 e D13 a D16, mas mudam resultados de borda ou o que é exibido. Por isso aparecem em "Aprovar plano › Conferir" e só valem com a aprovação.

| Detalhe | Proposta | Exemplo | Alternativa considerada |
| :-- | :-- | :-- | :-- |
| **T1 — Grade de 0,05°** | Ancorada em 0° de latitude e 0° de longitude. A célula é o intervalo semiaberto `[k·0,05; (k+1)·0,05)` em cada eixo, com as bordas sul e oeste incluídas. Índices calculados por aritmética decimal exata sobre o **valor canônico** definido abaixo, nunca por divisão em ponto flutuante. | Latitude −15,05 → célula de −15,05 a −15,00. Latitude −15,0501 → célula de −15,10 a −15,05. Em ponto flutuante, `−56,05 / 0,05` dá `−1120,9999999999998`: o erro de arredondamento pode trocar a célula de um ponto na borda. | Outra âncora (por exemplo, o canto da caixa de MT) desloca todas as células sem ganho de método. |
| **T2 — (substituído)** | Passou a ser a escolha de método M1, acima, por R1-1. | — | — |
| **T3 — Integridade da disponibilidade lida** | Não é regra de cobertura. A publicação garante a grade D1 completa: uma linha por município e dia GMT da janela, no satélite da carga (RS-3, `20261107230000_correcoes_revisao_g2.sql`). Uma resposta de `consultar_disponibilidade` com dia faltante, repetido, fora da janela ou de outro satélite é **falha de leitura**, não evidência: o qualificador do município fica `falha`, sem "N de M", com a ação "Tentar de novo". | Janela de 10 dias e resposta com 9 linhas → "cobertura não verificada: leitura incompleta", e não "9 de 10". | Contar o dia faltante contra a cobertura (v1) esconderia uma leitura incompleta sob um número plausível. |
| **T4 — Sequência na borda da janela** | Persistência que começa no primeiro dia ou termina no último dia da janela recebe a ressalva "sequência no limite da janela; pode ser mais longa". A ressalva não muda a seleção. | Janela de 01/10 a 31/10, focos em 01, 02 e 03/10 → destacada, com ressalva. | Sem ressalva, o usuário lê como início real. |
| **T5 — Ordem sem ranking** | Recorrência: código da célula (norte→sul, depois oeste→leste). Persistência: data de início da sequência, depois código da célula. Concentração: contagem decrescente, com empate por nome do município e depois por código IBGE, **só para exibição**, porque o corte já incluiu todos os empatados (D16). | — | Ordenar recorrência pelo número de meses pareceria ranking (vedado por Q8). |
| **T6 — Várias sequências na mesma célula** | Cada sequência de 3 ou mais dias é um destaque próprio, identificado pela célula e pelo dia inicial. | Célula com 05–07/08 e 20–23/08 → 2 destaques. | Um destaque por célula, com a lista de sequências, perde a identidade por evento para a combinação futura. |
| **T7 — Classe do dia da célula** | O dia da célula recebe a classe mais restritiva entre os municípios considerados (precedência D1: `lacuna_conhecida` > `incidencia_indeterminada` > `sem_evidencia_de_lacuna`). O painel lista, por município, a classe e os motivos daquele dia, sem fundir motivos. | No dia 7, A tem `lacuna_conhecida` e B tem `incidencia_indeterminada` → o dia da célula é "lacuna conhecida"; o painel mostra A (lacuna, motivos de A) e B (indeterminada, motivos de B). | Tratar toda classe diferente de "sem evidência" como "indeterminado" (v1) rotularia errado um dia de lacuna conhecida. |

**Valor canônico das coordenadas (T1, R1-2).** A fonte traz texto com 6 casas decimais (por exemplo, o valor fictício `-12.345670`). A carga converte esse texto para `Number` (`scripts/banco/manifesto.mjs`), o banco guarda `double precision` e a RPC devolve número JSON. O valor canônico no cliente é a **representação decimal mais curta que reconstrói o mesmo `double`**: a de `Number.prototype.toString` em JavaScript, que é também a usada pelo PostgreSQL desde a versão 12 na saída de `double precision` com `extra_float_digits` padrão. Para textos de até 15 algarismos significativos, essa representação é igual ao texto da fonte, sem os zeros à direita (`-12.345670` → `-12.34567`). O módulo:

- converte a string canônica para inteiro decimal (sinal, parte inteira e parte fracionária, sem passar por multiplicação em ponto flutuante) e calcula o índice com divisão inteira com piso;
- rejeita como entrada inválida, sem classificar, a coordenada cuja string canônica use notação exponencial, não seja finita ou tenha mais de 15 algarismos significativos. Essa verificação protege só a conversão da string canônica. **Ela não detecta dígitos já perdidos na ingestão** (R2-3): `-15.05` e `-15.0500000000000001` viram o mesmo `double` e a mesma string `-15.05`, embora os decimais originais caiam em células diferentes. Essa perda só é detectável contra o texto da fonte, e é isso que faz a comparação por `id_tecnico` abaixo, para a carga conferida. Uma carga nova exige nova conferência;
- é testado nos dois lados de cada borda com coordenadas negativas (caso G-1).

A conferência independente compara, **por `id_tecnico`**, a célula calculada em SQL a partir do texto decimal da saída local do recorte (`local/dados-prototipo/saidas/deteccoes.csv`, coluna `lat`/`lon` como texto, convertida para `numeric` sem passar por `double`) com a célula do caminho RPC → TypeScript. **Qualquer diferença de célula leva a "Parado"**, com os casos, as alternativas e o efeito nos destaques apresentados ao responsável antes de adotar outra regra.

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
| `recorte` | O recorte espacial de entrada (M1; na proposta M1-a, `estado`, com `municipio: null`) |
| `conferencia` | Total de registros lidos, número de `id_tecnico` distintos e total principal de `consultar_resumo` **chamado com o mesmo recorte** (em M1-a, `p_municipio: null`), na mesma carga e janela das páginas. A lente só é exibida se os três forem iguais. O resumo da consulta comum, que pode estar filtrado por município, nunca é usado nessa conferência. |
| `limitacoes[]` | Textos fixos por lente (abaixo) e o aviso de domínio |

Cada destaque traz:

- **`unidade`:** `{ tipo: 'municipio', codigo, nome }` ou `{ tipo: 'celula_005', id, sul, oeste, norte, leste }`, com `id` derivado dos índices T1;
- **`id_destaque`:** lente + unidade (+ dia inicial na persistência, T6). Com carga, janela e versão do método, é a chave para interseção ou união futuras (BL-005). Combinar unidades de tipos diferentes fica para o BL-005;
- **`motivo`:** frase gerada pelo módulo (por exemplo, "Detecções em 3 meses GMT distintos na janela: ago, set e out");
- **`evidencia`:** `id_tecnico` das detecções que sustentam o destaque, o valor medido (contagem, meses ou dias) e as datas (meses ou dias da sequência);
- **`ordem`:** opcional, só na concentração;
- **`cobertura`:** estado `pendente`, `completa` ou `falha`. Em `completa`: municípios considerados (D13), `dias_janela` (M), `dias_sem_evidencia_de_lacuna` (N) e a lista dos demais dias com a classe do dia (T7) e, por município, classe e motivos. O texto é "N de M dias sem evidência de lacuna (cobertura não comprovada)", nunca "coberto". Em `pendente`, "cobertura: carregando". Em `falha` (chamada com erro ou resposta que não passa em T3), "cobertura não verificada", com o motivo e a ação "Tentar de novo"; nunca um "N de M" parcial;
- **`ressalvas[]`:** as de D14, D15 (por classe, T7) e T4, quando se aplicarem. Na persistência, enquanto a cobertura não estiver `completa`, a ressalva "ressalvas de disponibilidade ainda não verificadas" substitui as de D15.

**Limitações exibidas.** Todas as lentes: "Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração"; "Contagem principal em dias GMT; a sensibilidade America/Cuiaba aparece só no resumo da consulta" (Q12); "Disponibilidade não comprova cobertura". Concentração: "Contagem absoluta favorece municípios grandes" (Q4). Recorrência e persistência: "Focos vizinhos em células diferentes não são lidos como o mesmo local; a célula não segue divisas" (Q3); "A cobertura da célula usa os municípios das detecções, não a área da célula" (D13).

### Regras por lente

- **Concentração (U1, K1):** conta os registros principais da janela por `municipio_codigo`. Os destaques são os municípios com contagem > 0 cuja contagem é maior ou igual à do 10º colocado (D16). Com menos de 10 municípios com detecção, entram todos os que têm detecção. A contagem por município deve ser igual a `consultar_resumo.principal.por_municipio`, e a soma, igual ao total principal.
- **Recorrência (U2, Q5, D14):** meses GMT tocados pela janela; com menos de 3, o estado é `janela_insuficiente`, sem destaques, com o texto "a janela toca N meses GMT; a recorrência exige pelo menos 3". Os destaques são as células com detecções em 3 ou mais meses GMT distintos. O mês de cada detecção vem de `data_hora_gmt`.
- **Persistência (U2, Q6 refinada por D15, T4, T6, T7):** dias GMT com detecção por célula; os destaques são as sequências de 3 ou mais dias consecutivos. As ressalvas consultam a classe do dia da célula (T7). Não se infere detecção em dia sem informação, e o limite da janela gera a ressalva T4.
- **Ressalvas por classe (D15, T7).** O texto preserva a classe observada:

| Situação | Classe do dia da célula | Ressalva |
| :-- | :-- | :-- |
| Dia **da sequência** (com detecção) | `incidencia_indeterminada` | "inclui dia indeterminado (DD/MM)" |
| Dia **da sequência** (com detecção) | `lacuna_conhecida` | "inclui dia com lacuna conhecida (DD/MM)" |
| Dia **vizinho**, antes ou depois, **sem detecção** | `incidencia_indeterminada` | "adjacente a dia indeterminado (DD/MM); pode ser mais longa" |
| Dia **vizinho**, antes ou depois, **sem detecção** | `lacuna_conhecida` | "adjacente a dia com lacuna conhecida (DD/MM); pode ser mais longa" |
| Qualquer dia acima | `sem_evidencia_de_lacuna` | nenhuma |

  No painel, cada ressalva leva aos municípios do dia, com classe e motivos de cada um (T7).
- **Cobertura (V2, Q7, D13, T3, T7):** qualificador comum, sem limiar e sem selecionar. `incidencia_indeterminada` e `lacuna_conhecida` contam contra, cada uma com seu nome.

### Carregamento de dados e arquitetura

- **Módulo puro:** `src/lentes/` (`contrato.ts`, `grade.ts`, `cobertura.ts`, `concentracao.ts`, `recorrencia.ts`, `persistencia.ts`), sem rede, DOM ou relógio, importável por `node --test`.
- **Leitura dos registros (R1-1, R1-4):** um carregador em `src/lentes/carregar.ts` chama `consultar_resumo` e pagina `consultar_deteccoes`, ambos com o recorte de M1 (em M1-a, `p_municipio: null`), `p_carga` fixo, a janela da aplicação e limite 1.000. Cada página só é aceita se:
  - `carga.id`, `periodo.inicio`, `periodo.fim` e `municipio` forem os pedidos;
  - `limite` e `deslocamento` ecoarem o pedido;
  - `total` for igual ao da primeira página e ao total principal do resumo do mesmo recorte;
  - o número de registros for `min(1000, total − deslocamento)`;
  - nenhum `id_tecnico` repetir o de outra página, e a ordem `(data_hora_gmt, id_tecnico)` crescer estritamente também entre páginas.

  Exemplo do revisor: duas páginas com os mesmos 1.000 registros somam 2.000 linhas, mas só 1.000 `id_tecnico` distintos, e a lente falha. Qualquer verificação falha ou erro de chamada leva a lente inteira ao estado `falha` ("leitura inconsistente" ou "fonte indisponível"), sem destaques parciais, com a ação "Tentar de novo" e sem nova tentativa automática.
- **Leitura da disponibilidade:** `consultar_disponibilidade` com `p_municipio` de cada município envolvido, sem repetição, com até 4 chamadas simultâneas. Cada resposta confere carga, período, município e a integridade T3. Erro ou falha de integridade afeta só o qualificador dos destaques que dependem daquele município (`falha`); a seleção não muda, porque nenhuma lente seleciona pela disponibilidade.
- **Geometria:** só para os municípios destacados pela concentração, pelo cache de memória do ADR-007.
- **Erros por tipo em toda chamada da lente (R2-1).** A classificação de `src/erros.ts` vale para o resumo, as páginas, a disponibilidade e a geometria da lente. Os tipos que afetam a sessão ou a versão nunca são tratados como falha local da lente:

| Tipo (`src/erros.ts`) | Em qualquer chamada da lente | Efeito |
| :-- | :-- | :-- |
| `acesso_negado`, `sessao_expirada`, `sem_publicacao` | Encaminhado ao tratamento global já existente (`tratarErroGlobal`) | `limparTudo` limpa a consulta comum e também a lente: lista, camada, painel, registros e disponibilidade reaproveitáveis, e o cache de geometria. As gerações de sessão e de lente sobem. O estado de acesso segue o ADR-007 (negado, expirada com novo login, sem publicação). Nada da lente reaparece depois de novo login sem nova aplicação. |
| `versao_substituida` (`carga_indisponivel`) | Mesmo efeito da consulta comum (`aoFalharConsulta`) | Limpa resultados da consulta comum **e** toda a memória da lente ligada à carga (registros e disponibilidade reaproveitáveis, resultado, lista, camada e painel), com o estado "versão substituída" e a ação de recarregar a vigente. Nunca há mistura de cargas. |
| `fonte_indisponivel`, `entrada_invalida` ou verificação de resposta falha | No resumo ou numa página | Lente inteira em `falha`, sem destaques parciais, com "Tentar de novo" |
| Idem | Na disponibilidade de um município | Qualificador `falha` só nos destaques que dependem daquele município |
| Idem | Na geometria de um município | Aviso de mapa do ADR-007 ("contorno indisponível"); a lista e o painel continuam válidos, e o estado `completo` não é gravado |
- **Concorrência entre aplicações de lente (R1-4):** uma terceira geração, `geracaoLente`, soma-se às de sessão e de consulta do ADR-007. Ela é incrementada ao aplicar qualquer lente, ao escolher `Nenhuma`, ao mudar a janela ou a carga e a cada mudança da geração de sessão. Toda continuação assíncrona da lente confere a geração de sessão e a de lente antes de tocar estado ou tela. Ao invalidar, a lista, a camada do mapa, o painel e os dados em memória daquela aplicação são limpos antes de a rede responder. Assim, se a concentração começa antes e termina depois da recorrência, a resposta atrasada é descartada.
- **Memória:** registros já validados podem ser reaproveitados entre lentes enquanto a sessão, a carga, a janela e o recorte forem os mesmos. O reaproveitamento é limpo ao sair, expirar, perder acesso ou receber `versao_substituida`, em qualquer chamada, da lente ou da consulta comum. Nada vai para `localStorage`, `sessionStorage`, Cache ou IndexedDB.
- **Ciclo de vida:** a lente é calculada sob pedido ("Aplicar lente"), e não a cada consulta.

### Orçamento e procedimento de medição (R1-5)

O orçamento proposto é uma decisão técnica a ratificar na aprovação. **Ele vale sempre para a janela inteira da carga**, para cada lente, mesmo que se adote depois uma janela padrão menor, porque a janela inteira continua acessível.

**Alcance por item (R2-2).** Em cada PR, a conferência e a medição cobrem **todas as lentes disponíveis naquele ponto**, sempre com a janela inteira e repetindo as anteriores: item 1, concentração; item 2, concentração e recorrência; item 3, as três, consolidadas antes da verificação hospedada.

| Aspecto | Gate local de cada item (`npm run medir:lentes`) | Roteiro hospedado (verificação em produção) |
| :-- | :-- | :-- |
| Ambiente | `supabase db reset`, carga real local recarregada pelo próprio script, identidade da carga registrada; interface construída (`vite build`) servida localmente | Deploy de `main` identificado por commit; carga vigente com a mesma identidade da conferência local |
| Perfil | Chrome do sistema via CDP, 390×844 com toque, latência de 150 ms, 1,6 Mbit/s de descida, 750 kbit/s de subida e CPU 4× mais lenta (ADR-007) | Chrome no computador do responsável, DevTools com perfil de rede personalizado de mesmos valores e CPU 4× mais lenta |
| Cache | `Network.setCacheDisabled` ligado e contexto novo do navegador por execução (memória da lente vazia); login feito antes do início | "Disable cache" ligado; página recarregada antes de cada execução; login feito antes do início |
| Compressão | Duas passagens: **bruta** (direto na API local, que não comprime) e **comprimida**, por um proxy local em `node:http` com `node:zlib` (gzip nível 6, `Content-Encoding: gzip` quando o navegador aceita) entre a interface e a API. O tempo comprimido é **medido**, não estimado | A do provedor, qualquer que seja; registrar o `Content-Encoding` observado |
| Início | Clique em "Aplicar lente" | Clique em "Aplicar lente" |
| Fim | Atributo `data-estado-lente="completo"` no cartão. O controlador só o grava quando: a conferência passou, a lista está renderizada, a camada do mapa está desenhada (com as geometrias da concentração) e todo destaque tem cobertura `completa`. Uma execução com qualquer `falha` é inválida e repetida; falha persistente leva a "Parado" | O mesmo evento. O cartão exibe "Lente concluída em X,X s", medido pelo próprio controlador com `performance.now()` entre os dois pontos |
| Unidades | Tempo em segundos, com uma casa; bytes por `encodedDataLength` do CDP; requisições com e sem preflight CORS | Tempo exibido pelo cartão; "transferred" do painel Network, filtrado por `rest/v1`, com o log limpo antes do clique |
| Repetições | 3 válidas por lente e por passagem; vale a mediana, e o máximo é registrado | 3 válidas por lente; vale a mediana |
| Prazo e tentativas inválidas (R2-4) | Prazo de 120 s por execução (6× o orçamento). Execução que não chega a `completo` no prazo, ou termina em `falha`, é inválida, registrada com o motivo e não entra na mediana. No máximo 6 tentativas por lente e por passagem: sem 3 válidas até a 6ª, "Parado" | Mesmo prazo, contado pelo responsável a partir do clique. Toda tentativa é informada, válida ou não, com o motivo. Mesmo limite de 6 tentativas; sem 3 válidas, não há mediana e vale a parada em produção |
| **Orçamento** | Mediana comprimida ≤ 20,0 s **e** bytes brutos ≤ 10.000.000 por lente | Mediana ≤ 20,0 s por lente |

**Parada local:** fora do orçamento, a situação passa a "Parado" antes da PR do item, com os números por lente e por parte (registros, disponibilidade e geometria) e as alternativas: aceitar com progresso visível; janela padrão menor, mantendo o gate da janela inteira medido e informado ao usuário; ou função agregadora nova no banco (G2 = Sim, G4 = Sim e retriagem do nível, Q10). Nenhuma é escolhida pelo agente.

**Parada em produção, antes do encerramento:** se a mediana hospedada passar do orçamento, se não houver 3 execuções válidas em 6 tentativas, ou se o número de destaques de alguma lente, ou o valor de algum destaque, divergir da conferência local com a mesma identidade de carga, a situação passa a "Parado". As alternativas para decisão do responsável: aceitar e registrar o desvio no encerramento; corrigir por trilha curta (se for defeito de algo especificado) ou por novo ciclo; ou reverter as entregas na ordem da seção de rollback. O encerramento só é preparado depois da decisão registrada.

### Interface mínima

- Novo cartão "Lentes de seleção" dentro da grade existente, com seletor (`Nenhuma`, `Concentração`, `Recorrência`, `Persistência`) e a ação primária "Aplicar lente". Mostra a janela, a carga e o recorte usados e, em M1-a, o aviso "o filtro de município não se aplica às lentes".
- Lista de destaques em ordem T5, com unidade, valor e estado da cobertura; seleção por teclado e toque.
- Mapa: camada própria de destaques, separada dos pontos da página de registros. Municípios como contorno e células como retângulos, com o estilo de seleção do ADR-007 (contorno tracejado azul claro e indicador textual) e legenda textual. A lista é a alternativa em texto ao mapa.
- Painel de motivo e evidência: motivo, parâmetros, datas (meses ou dias), cobertura com a lista de dias que contam contra, ressalvas e limitações. Para célula, a tabela das detecções da evidência, paginada e declarando "N de M". Para município, a contagem e a ação "Consultar este município", que aplica o filtro existente na mesma janela, em vez de listar centenas de linhas.
- Estados distintos e testados: carregando (com progresso "registros X de Y" e "disponibilidade X de Y municípios"), completo (com "Lente concluída em X,X s"), sem destaques, janela insuficiente, cobertura pendente, cobertura não verificada por município, leitura inconsistente (lente não exibida), versão substituída, falha da fonte e cancelada (troca de lente, `Nenhuma`, nova janela ou saída).
- Sem redesenho: reutilizar tokens, componentes e regras de acessibilidade do ADR-007 (alvos de 44 × 44 CSS px, foco visível, contraste, 200% e reflow a 320 CSS px). Qualquer mudança visual além disso é BL-007.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — "autorizo o rascunho do plano do ciclo 004" | Ideação registrada (Q1 a Q12) | Este rascunho local, as perguntas D13 a D16, a reconciliação da ideação e a linha do ciclo em `cycles.md` | Revisão, aprovação, publicação, issues e implementação | Recebida em 2026-11-10 |
| Aprovar plano — "aprovo o plano do ciclo 004" | Revisão formal com veredito apto e manifestação humana posterior | O plano revisado; publicação da PR documental (ideação, plano e registro do ciclo); depois da integração documental e da confirmação dos payloads, a criação das três issues; o encerramento, depois das entregas | Implementação, merges e verificação em produção | Como decisões humanas de G1: Q1 a Q12, D13 a D16 (com D15 refinando Q6), a escolha M1 (proposta M1-a), T1 com o valor canônico das coordenadas, T3 a T7, o contrato C1, as ressalvas por classe e os textos de limitação. Também: o fatiamento em três issues (com a cobertura dentro do item 1), o orçamento e o procedimento de medição, com as duas paradas |
| Autorizar implementação — "autorizo a implementação da issue #N" | Plano aprovado e integrado, issue criada e itens anteriores integrados | Branch, task, implementação, testes, conferência local com a carga real em `local/` e a PR da issue | Merge, migração ou função nova, mudança de parâmetro e decisão de orçamento após parada | Escopo da issue, barreiras e gates |
| Aprovar merge — "aprovo o merge da PR #N" | PR concreta, checks verdes no último commit e diff conferido | Somente o merge daquela PR, por squash, **e o deploy de produção automático que ele dispara na Vercel** | Outras PRs, verificação em produção e nova entrega | Diff, G1 a G4, privacidade, conferência das lentes e estado real |
| Verificar produção — "autorizo a verificação em produção do ciclo 004" | Itens 1 a 3 integrados e deploy de `main` identificado por commit | O roteiro curto do item 3: o responsável, na própria sessão, aplica cada lente na janela inteira pelo procedimento hospedado da seção de orçamento e informa tempo, bytes transferidos e destaques exibidos; o agente confere com a conferência local da mesma carga | Login pelo agente, carga, migração, mudança de dados ou de método, e a decisão que a parada em produção exigir | Commit do deploy, identidade da carga vigente, destaques e valores iguais à conferência local, mediana hospedada dentro do orçamento |

Não há ação humana externa prevista: nenhuma migração ou configuração hospedada muda. Cada PR, inclusive a documental e a de encerramento, tem aprovação própria de merge. No ciclo completo não há modo contínuo. Toda cadeia autorizada para em "Parado" quando: a conferência independente divergir do módulo sem explicação; qualquer `id_tecnico` cair em célula diferente nos dois caminhos (T1); o orçamento for excedido, localmente ou em produção; a produção divergir da conferência local na mesma carga; surgir a necessidade de função, tabela, política ou migração (G2 e G4, com retriagem); um caso de borda não previsto em Q1 a Q12, D13 a D16, M1 ou T1 a T7 mudar a seleção; ou houver dúvida de privacidade. A concessão não dispensa a conferência da precondição.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Critério de seleção novo: unidade, contagem, janela, grade e empates. Atendida por decisões humanas registradas (Q1 a Q12 e D13 a D16, com M1 e T1 a T7 ratificados na aprovação); casos de referência fictícios com valores esperados escritos neste plano antes do código; conferência sobre a carga real por caminho independente (SQL no banco local, sem importar o módulo), inclusive célula por `id_tecnico` a partir do texto decimal da fonte; igualdade com `consultar_resumo` do mesmo recorte; proveniência por carga, janela, parâmetros e versão do método; limitações e aviso de domínio em cada resultado. |
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
| C-5 Empate em N=10 (R1-6), pelo ponto de entrada de produção, sem informar N | 12 municípios com 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 12 e 5 | 11 destaques; "11 municípios por empate no 10º lugar"; o de 5 fica fora |
| G-1 Grade T1, dos dois lados das bordas | Latitudes −15,00, −15,0499, −15,05 e −15,0501; longitudes −56,05 e −56,0500001 | Células de sul −15,00, −15,05, −15,05 e −15,10; de oeste −56,05 e −56,10 |
| G-2 Valor canônico | `-12.34567` (como o `double` de `-12.345670`), `1e-7`, `NaN` e um valor com 17 algarismos significativos | O primeiro é classificado na célula de sul −12,35; os demais são rejeitados como entrada inválida, sem célula |
| L-1 Páginas duplicadas (R1-4) | 2 páginas com os mesmos 1.000 `id_tecnico`, `total` 2.000 | `falha` ("leitura inconsistente"), nenhum destaque |
| L-2 Eco divergente | Página com `deslocamento` diferente do pedido, `municipio` diferente de `null` ou outra `carga.id` | `falha`, nenhum destaque |
| L-3 Resumo de outro recorte (R1-1) | Registros estaduais = 10; resumo com `municipio` = Colniza e total 4 | `falha` por resumo de recorte errado; com o resumo estadual (10), a lente passa |
| R-1 Recorrência | Célula X com detecções em ago, set e out; célula Y com 10 detecções em ago e set | X destacada (3 meses); Y não |
| R-2 Mês GMT | Detecção em `2026-09-01T02:00:00Z` (ainda 31/08 em Cuiabá) | Conta para setembro |
| R-3 Mês parcial (D14) | Janela de 15/08 a 14/10 | Lente roda; agosto e outubro marcados como parciais |
| R-4 Janela insuficiente | Janela de 15/08 a 30/09 | `janela_insuficiente`, toca 2 meses, nenhum destaque |
| P-1 Persistência simples | Dias 5, 6 e 7, todos sem lacuna | 1 destaque de 3 dias, sem ressalva de disponibilidade |
| P-2 Sem sequência | Dias 5, 12 e 20 | Nenhum destaque |
| P-3 Indeterminado com foco (D15) | Dias 10, 11 e 12; dia 11 indeterminado | 1 destaque de 3 dias, "inclui dia indeterminado (11/MM)" |
| P-4 Indeterminado sem foco | Dias 10, 12, 13 e 14; dia 11 indeterminado sem detecção | 1 destaque, de 12 a 14, "adjacente a dia indeterminado; pode ser mais longa"; o dia 10 isolado não |
| P-5 Sem inferência | Dias 10 e 11; dia 12 indeterminado sem detecção; dia 13 | Nenhum destaque (2 + 1 dias) |
| P-6 Borda (T4) e duas sequências (T6) | Janela começando em 01/10; dias 01, 02 e 03 e dias 20, 21 e 22 | 2 destaques; o primeiro com "sequência no limite da janela" |
| P-7 Classes preservadas (R1-3) | Dias 10, 11 e 12 com detecção; dia 11 `lacuna_conhecida`; dia 13 sem detecção e `incidencia_indeterminada` | 1 destaque; "inclui dia com lacuna conhecida (11/MM)" e "adjacente a dia indeterminado (13/MM); pode ser mais longa"; nenhum dos dois textos troca a classe |
| P-8 Cobertura não verificada | Como P-1, com a disponibilidade de um município da célula em `falha` | Destaque mantido; "ressalvas de disponibilidade ainda não verificadas"; sem "N de M" |
| V-1 Cobertura de município | 90 dias, 6 `incidencia_indeterminada` | "84 de 90 dias sem evidência de lacuna (cobertura não comprovada)", 6 dias listados |
| V-2 União (D13) | Célula com focos em A e B; 10 dias; A indeterminado no dia 3, B lacuna no dia 7 | "8 de 10…", dias 3 e 7 listados com classe e município |
| V-3 Integridade (T3) | 10 dias e resposta com 9 linhas; em outro caso, 10 linhas com um dia repetido | Nos dois casos, cobertura `falha`, "cobertura não verificada: leitura incompleta", sem "N de M" |
| V-4 Lacuna e indeterminação no mesmo dia (T7) | Célula com focos em A e B; 10 dias; no dia 7, A `lacuna_conhecida` e B `incidencia_indeterminada`; demais dias sem lacuna | "9 de 10…"; o dia 7 aparece como "lacuna conhecida", com A (lacuna e motivos de A) e B (indeterminada e motivos de B) |
| X-1 Determinismo | Mesmos registros em ordem embaralhada | Resultado idêntico (destaques, ordem e evidência) |

- **Conferência independente sobre a carga real (local, fora da CI):** `npm run conferir:lentes` (`supabase db reset && node scripts/lentes/conferir.mjs`). O script parte do banco vazio, publica a carga real de `local/dados-prototipo/` pela mesma CLI de carga do ciclo `003` (como `medir-geometria.mjs`) e registra a identidade da carga no início e no fim. Ele executa SQL escrito à parte (sem importar `src/lentes/`) para quatro janelas:
  - a janela inteira;
  - um mês de pico;
  - uma janela de 2 meses, que exercita a recorrência insuficiente;
  - uma janela que toca 3 meses GMT com as duas bordas parciais (por exemplo, de 15/07 a 14/09), que exercita D14 (R1-6).

  Em cada uma, calcula a contagem por município com o corte e os empates, as células T1 a partir do texto decimal de `saidas/deteccoes.csv` (convertido para `numeric`, sem `double`), os meses distintos por célula, as sequências de 3 ou mais dias, a classe do dia por união (T7) e a cobertura. O resultado é comparado destaque a destaque com o módulo alimentado pelas RPCs, e a célula é comparada **por `id_tecnico`** (T1). Diferença sem explicação, ou qualquer `id_tecnico` em célula diferente → "Parado". Os números (agregados públicos), a identidade da carga e o commit entram em `004_research_conferencia_lentes.md`, que também compara com a análise exploratória da ideação e explica as diferenças (grade de 5 km contra 0,05°).
- **Interface (E2E, `tests/e2e/05-lentes.spec.mjs`):** fixture fictícia com destaques conhecidos em `tests/e2e/fixture.mjs`. Cobre:
  - seletor, aplicar, lista, mapa e painel; parâmetros e rótulo de ordenação visíveis; janela insuficiente; ressalvas por classe (D15, T7) e T4; cobertura com "cobertura não comprovada" e sem a palavra "coberto"; aviso de M1;
  - **filtro municipal ativo com totais diferentes** (R1-1): consulta comum em um município com 4 detecções, estado com 10; a lente lê 10, passa na conferência estadual e não altera o resumo comum, que continua 4;
  - **concorrência** (R1-4), com respostas retidas por `page.route`, por item (R2-2):
    - **item 1:** duas aplicações seguidas da concentração (a primeira retida termina depois da segunda) → só a segunda aparece; `Nenhuma` durante a leitura → nada aparece depois; logout durante a leitura → nada aparece depois e a memória é limpa; página duplicada injetada → "leitura inconsistente"; falha `fonte_indisponivel` numa chamada de disponibilidade → "cobertura não verificada" só nos destaques afetados;
    - **item 2:** acrescenta concentração retida e recorrência aplicada antes de ela terminar → só a recorrência aparece;
    - **item 3:** acrescenta o mesmo cenário entre recorrência e persistência;
  - **perda de acesso e troca de versão durante a leitura** (R2-1), a partir do item 1: `acesso_negado` (`42501`) numa chamada de disponibilidade depois de a lista renderizar → tela, mapa, lente e memória limpos e estado "negado"; `sessao_expirada` (`401`, `PGRST301`) na mesma situação → estado de sessão expirada e, após novo login, nenhum destaque antigo; `carga_indisponivel` no resumo de uma segunda aplicação que reaproveitaria registros em memória → "versão substituída", lente e memória limpas, e, depois de recarregar, a nova aplicação relê tudo;
  - troca de janela e de versão sem mistura; teclado, foco, 360/390 px com toque, 200% e reflow.
- **Medição:** `npm run medir:lentes` (`supabase db reset && node scripts/interface/medir-lentes.mjs`), com o procedimento da seção "Orçamento e procedimento de medição". Também parte do banco vazio, publica a carga real e registra a identidade. Conferência e medição cobrem as lentes disponíveis em cada item (R2-2).
- **Destino dos erros (unitário):** caso E-1, uma tabela que confere o destino de cada tipo de `src/erros.ts` por origem da chamada (resumo, página, disponibilidade e geometria), conforme a seção "Erros por tipo em toda chamada da lente".
- **Ordem dos gates com carga real (R1-7):** `test:rls`, `test:e2e`, `conferir:lentes` e `medir:lentes` começam todos por `supabase db reset`. Por isso, em cada item: (1) unitários, `typecheck` e `build`; (2) `conferir:lentes`; (3) `medir:lentes`; (4) `test:rls` e `test:e2e`. Os scripts de carga real não dependem de estado deixado por outro comando: cada um recarrega a carga e falha se a identidade registrada no fim for diferente da do início, ou da identidade citada no relatório.
- **Gates por PR:** `npm run test:governance`, `npm run check:governance`, `npm run typecheck`, `npm run build`, `npm run test:interface`, `npm run test:e2e`, `npm run test:rls` (sem mudança esperada), `git diff --check` e inspeção do bundle (`tests/unit/bundle.test.mjs`): nenhum dado territorial ou de `local/` embutido. Na CI rodam os determinísticos; `conferir:lentes` e `medir:lentes` usam dados de `local/` e rodam só localmente, com resultado no relatório.

## Itens de implementação

### Item 1 — Contrato de lente, qualificador de cobertura, lente de concentração e interface mínima

**Contexto:** o contrato C1 e a cobertura (Q2, Q9) são comuns a todas as lentes. Entregá-los com a concentração permite que cada lente chegue à produção, por deploy automático, já qualificada e com limitações.

**Ação técnica:** criar `src/lentes/` (contrato, grade T1, cobertura e concentração), o carregador paginado com as verificações por resposta, a conferência pelo resumo do mesmo recorte e a disponibilidade por município com a integridade T3; integrar ao `app.ts` com as gerações existentes e a nova `geracaoLente`; criar o cartão, a lista, a camada de mapa e o painel em `apresentacao.ts`, `mapa.ts`, `index.html` e CSS existente; escrever as fixtures e os testes C, G e V; criar o E2E de lentes; criar `scripts/lentes/conferir.mjs` e `scripts/interface/medir-lentes.mjs`; registrar a conferência e a medição em `004_research_conferencia_lentes.md`; criar a KB do contrato e do método (template `.agent/templates/kb.md` lido no ponto de uso; numeração conferida, hoje seria KB-005) e atualizar o guia da interface no runbook (seção 10).

**Critérios de aceite:**

- [ ] O contrato C1 está tipado e documentado na KB, com identidade de destaque, estados, limitações e versão do método.
- [ ] Os casos C-1 a C-5, G-1, G-2, L-1 a L-3, V-1 a V-4, E-1 e X-1 passam, com valores esperados escritos à mão.
- [ ] A conferência independente reproduz a concentração e a cobertura na carga real, nas quatro janelas, destaque a destaque. A soma das contagens é igual a `consultar_resumo` do mesmo recorte. Todas as detecções caem na mesma célula pelos dois caminhos (por `id_tecnico`). O relatório registra a identidade da carga, o commit e o número máximo de algarismos significativos das coordenadas.
- [ ] A medição da concentração na janela inteira segue o procedimento da seção de orçamento, com prazo e tentativas inválidas registrados, por passagem. Se exceder o orçamento ou não houver 3 execuções válidas, a situação é "Parado", com as alternativas, antes da PR.
- [ ] A interface mostra seletor, lista, mapa e painel, com parâmetros visíveis e não editáveis, o rótulo "ordenado por contagem de detecções, não por prioridade, gravidade ou risco", o aviso de M1, a cobertura "N de M dias sem evidência de lacuna (cobertura não comprovada)", a duração da lente e as limitações. A palavra "coberto" não aparece como qualificação.
- [ ] Os estados (carregando com progresso, completo, sem destaques, cobertura pendente, cobertura não verificada, leitura inconsistente, versão substituída, falha e cancelada) são distintos e testados. O E2E cobre filtro municipal ativo com totais diferentes; duas aplicações da concentração, `Nenhuma` e logout com respostas retidas; e `acesso_negado`, `sessao_expirada` e `carga_indisponivel` durante a leitura, com tela, lente e memória limpas conforme a seção "Erros por tipo". Troca de janela ou de carga não mistura resultados; nada é persistido no navegador.
- [ ] A acessibilidade do ADR-007 é mantida (teclado, foco, 44 × 44, contraste, 360/390 px, 200% e reflow) e a lista é a alternativa em texto ao mapa.
- [ ] Os gates passam, e nenhuma migração, função ou política é criada.

### Item 2 — Lente de recorrência

**Contexto:** a primeira lente por célula exercita a grade T1, a união D13 e o estado `janela_insuficiente`.

**Ação técnica:** criar `src/lentes/recorrencia.ts` sobre o contrato e a grade do item 1; incluir a opção no seletor, os retângulos de célula no mapa e o painel com meses (parciais marcados) e a tabela de evidência paginada; escrever os casos R e estender a conferência, a medição, o E2E (incluindo a concorrência entre concentração e recorrência) e a KB.

**Critérios de aceite:**

- [ ] Os casos R-1 a R-4 passam, e os casos do item 1 continuam passando.
- [ ] A conferência independente reproduz as células com 3 ou mais meses na carga real, nas quatro janelas, inclusive a de 3 meses com bordas parciais, e explica a diferença para as 142 células da grade de 5 km da ideação.
- [ ] A janela de 2 meses mostra "janela insuficiente", sem destaques; a janela com bordas parciais roda e marca os meses parciais.
- [ ] A cobertura da célula lista os municípios usados (D13); ordem T5 sem ranking; limitações da célula visíveis.
- [ ] O E2E mostra só a recorrência quando ela é aplicada com uma concentração ainda em leitura.
- [ ] A conferência e a medição cobrem concentração e recorrência na janela inteira, repetindo a concentração; ambas dentro do orçamento, ou "Parado"; os gates passam; nenhum objeto novo no banco.

### Item 3 — Lente de persistência e verificação do ciclo em produção

**Contexto:** a lente que depende das ressalvas de disponibilidade (D15 e T4) e das sequências por célula (T6). É a última entrega técnica; o roteiro de verificação em produção cobre as três lentes.

**Ação técnica:** criar `src/lentes/persistencia.ts`; incluir a opção no seletor e, no painel, os dias da sequência com as ressalvas; escrever os casos P; estender a conferência, a medição, o E2E e a KB; preparar na task o roteiro curto de verificação em produção (passos do responsável, valores locais esperados por lente e o que informar, sem segredos).

**Critérios de aceite:**

- [ ] Os casos P-1 a P-8 passam, e os casos dos itens 1 e 2 continuam passando.
- [ ] A conferência independente reproduz as sequências de 3 ou mais dias e as ressalvas por classe na carga real, e explica a diferença para as 62 células com 3 ou mais dias seguidos na grade de 5 km da ideação.
- [ ] As ressalvas da tabela "Ressalvas por classe" e a de T4 aparecem só onde as regras mandam, com a classe observada; nenhuma detecção é inferida.
- [ ] O E2E mostra só a persistência quando ela é aplicada com uma recorrência ainda em leitura.
- [ ] A conferência e a medição das três lentes, na janela inteira, estão consolidadas no relatório e no guia, todas dentro do orçamento ou com "Parado"; os gates passam; nenhum objeto novo no banco.
- [ ] O roteiro de verificação em produção está pronto na task, com o procedimento hospedado, os valores locais esperados por lente (destaques e valores da conferência, com a identidade da carga) e a parada em produção. Ele só é executado depois de "autorizo a verificação em produção do ciclo 004".

## Arquivos afetados

- **Nesta redação:** este plano; a ideação (registro da autorização, das decisões D13 a D16 e do novo artefato ativo); a linha do ciclo `004` em `_project/cycles.md` (`Planejamento` e link do plano). Na correção v2, só este plano e a versão citada em `cycles.md`.
- **Na execução proposta:** `src/lentes/*.ts`, `src/consulta.ts`, `src/app.ts`, `src/apresentacao.ts`, `src/mapa.ts`, `src/tipos.ts` (se necessário), `index.html`, `src/estilos/*.css` (só componentes novos, sem redesenho), `tests/unit/lentes.test.mjs`, `tests/fixtures/lentes/`, `tests/e2e/05-lentes.spec.mjs`, `tests/e2e/fixture.mjs`, `scripts/lentes/conferir.mjs`, `scripts/interface/medir-lentes.mjs` (com o proxy local de compressão), `package.json` (scripts `conferir:lentes` e `medir:lentes`, sem dependência nova), `docs/runbook.md` (seção 10), a KB nova, `_project/drafts/004_contrato_lentes_selecao/004_research_conferencia_lentes.md` e as tasks do ciclo. No encerramento: KB-003 (seleção explicável), README se cabível e o registro do ciclo.
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

- **Para aprovar o plano:** veredito apto em revisão formal; ratificação de M1, T1, T3 a T7, do orçamento e do fatiamento.
- **Para a conferência dos itens:** Supabase local disponível (já usado no ciclo `003`) e a carga real local em `local/dados-prototipo/`, recarregável pelo runbook (seções 1 a 9). Sem ela, a conferência não pode ser dispensada: a situação passa a "Parado".
- **Para a verificação em produção:** deploy da `main` integrada, carga vigente hospedada igual à local conferida (mesma `identidade`) e o responsável disponível para executar o roteiro na própria sessão.
- **Para o retorno ao BL-001:** encerramento integrado em `main`; o registro e sua publicação seguem `gerenciar_backlog`, com autorização própria para publicar.

## Riscos, suposições e rollback

| Risco ou hipótese | Tratamento |
| :-- | :-- |
| Destaque lido como prova ou prioridade | Aviso de domínio e limitações em toda lente; rótulo da ordenação; nenhum termo de risco, gravidade ou prioridade; revisão de textos na PR. |
| Volume do carregamento no celular (registros da janela inteira e disponibilidade por município) | Medição no perfil do ADR-007 e orçamento com parada; progresso visível; cobertura `pendente` em vez de omitida. A escolha entre as alternativas é humana. |
| Ponto flutuante troca a célula de pontos na borda | T1 com valor canônico e aritmética decimal exata; casos G-1 e G-2; comparação por `id_tecnico` com o texto da fonte; diferença leva a "Parado". |
| Respostas atrasadas, duplicadas ou de outro recorte | `geracaoLente`, verificações por página (eco, `total`, unicidade e ordem de `id_tecnico`) e resumo do mesmo recorte; casos L e E2E com respostas retidas. |
| Conferência "independente" contaminada pelo módulo | SQL escrito à parte, sem importar `src/lentes/`; valores esperados dos casos fixados neste plano; diferença sem explicação leva a "Parado". |
| Deploy automático a cada merge | Cada item entrega lentes completas e qualificadas; as aprovações de merge declaram o deploy; rollback por reverter o commit em nova PR. |
| Necessidade de objeto no banco (desempenho ou paginação) | Fora do escopo: "Parado", G2 e G4 = Sim e retriagem; nenhum contorno no cliente que faça amostragem oculta. |
| Cobertura uniforme entre municípios (ideação) faz o qualificador parecer redundante | Exibido mesmo assim; nada no módulo presume a uniformidade, e os casos V testam municípios diferentes. |
| Reprodutibilidade entre cargas | Carga, janela, parâmetros e versão do método em cada resultado; cargas nunca se misturam. |

Rollback: as lentes não alteram dados nem schema, então não há dado a restaurar. Reverter uma entrega é uma PR de reversão, com aprovação de merge, e o deploy volta à interface anterior. A ordem respeita as dependências (R1-8):

- **A cadeia é 1 ← 2 ← 3.** O item 2 usa o contrato, o carregador, a cobertura e o cartão do item 1. O item 3 usa, além disso, os retângulos de célula e a tabela de evidência criados no item 2.
- **Retirar o item 3:** reversão do commit da issue; retira a opção do seletor, o módulo, os testes e o trecho da KB e do guia.
- **Retirar o item 2:** se o item 3 já estiver integrado, revertê-lo antes. Reverter o 2 sozinho quebraria o 3.
- **Retirar o item 1:** reverter antes o 3 e o 2, nessa ordem.
- Reversões encadeadas podem ir numa só PR, com um commit de reversão por item, do mais recente para o mais antigo, e todos os gates verdes no último commit. Retirar uma lente intermediária mantendo a posterior exige mover o código compartilhado, o que é mudança de escopo, e não rollback.

Uma reversão não reabre nem arquiva o BL-001 automaticamente; o efeito sobre o item é relatado e decidido pelo responsável.

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
| Issue(s) | [#33](https://github.com/EuThiagoAndrade/rastro-quente/issues/33) (item 1), [#34](https://github.com/EuThiagoAndrade/rastro-quente/issues/34) (item 2), [#35](https://github.com/EuThiagoAndrade/rastro-quente/issues/35) (item 3) |
| PR(s) | PR documental [#32](https://github.com/EuThiagoAndrade/rastro-quente/pull/32), aguardando merge |
| Branch(es) | Ideação: `chore/cycle-004-ideation` em `c51ad73` (local); plano: `chore/cycle-004-plan`, derivada dela, publicada, base `85b444dd0084cc0b32b28ad0a1c256fdc9abbc29` |
| Branch do item 1 | `feature/issue-33`, base `fa302b5bf124ce56501d1303dd64181511c84ace` |
| Entrega do item 1 | `src/lentes/`, `src/apresentacao-lentes.ts`, integração em `src/app.ts` e `src/mapa.ts`, testes `tests/unit/lentes.test.mjs` e `tests/e2e/05-lentes.spec.mjs`, `scripts/lentes/` e `scripts/interface/medir-lentes.mjs`, KB-005, guia no runbook e `004_research_conferencia_lentes.md`; registro em `004_task_issue-33.md` |
| Destino após conclusão | `_project/executed/004_contrato_lentes_selecao/004_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 004 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #32 (https://github.com/EuThiagoAndrade/rastro-quente/pull/32)
Diga: "aprovo o merge da PR #32"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + atualizar_docs + aprovacao_publicacao_plano + v3@d341d35+rodada-3`
- `effect_class`: `remote_mutation`
- `state_before`: plano `v3` em `Em Revisão`, revisão formal `Concluída`, veredito `APTO COM RESSALVAS` (rodada 3), aprovação `Pendente`, situação `Aguardando aprovação do plano`. Branch `chore/cycle-004-plan` local em `4325a37`, sobre `origin/main` `85b444d`; nenhuma branch remota, PR ou issue do ciclo.
- `state_after`: plano `v3` `Aprovado` (`Aprovada em 2026-11-11`) por manifestação posterior ao parecer, com R3-1 incorporada ao item 1. Lote documental publicado na PR #32, de `chore/cycle-004-plan` para `main`, aguardando checks e merge. Ciclo em `Planejamento`; nenhuma issue ou implementação.
- `result`: `executed`
- `evidence`:
  - manifestação humana literal "aprovo o plano do ciclo 004" em 2026-11-11, posterior à rodada 3;
  - `git fetch`, `git ls-remote` e `gh pr list` conferiram `origin/main` em `85b444d` e ausência de branch remota ou PR do ciclo antes de publicar;
  - commit de aprovação `d434796` publicado e PR real https://github.com/EuThiagoAndrade/rastro-quente/pull/32 criada;
  - lote limitado a ideação, plano e registro do ciclo; 55 testes aprovados, validador sem erros ou avisos, diff sem erros, varredura G3 sem e-mail ou UUID.
- `blockers`: nenhum para a publicação. A integração depende de checks verdes e de "aprovo o merge da PR #32". As issues dependem da integração documental e da confirmação dos payloads; nenhuma implementação está autorizada.

### Registro anterior — correção v3

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + rascunhar_plano + 004_plan + v3@3b1b2ed`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` em `Em Revisão`, com a rodada 2 (`REQUER NOVA RODADA`, R2-1 a R2-4) registrada e commitada localmente em `3b1b2ed`; ciclo em `Planejamento`; situação `Aguardando correções (rodada 2)`.
- `state_after`: plano `v3` em `Em Revisão`, com resposta a R2-1 a R2-4 e as rodadas 1 e 2 preservadas; último veredito ainda `REQUER NOVA RODADA`; situação `Aguardando revisão (rodada 3)`; `cycles.md` cita a v3. Nenhuma aprovação, issue, implementação, push ou PR.
- `result`: `executed`
- `evidence`: frase "corrija o plano do ciclo 004" (2026-11-11), posterior ao veredito; seção "Resposta do autor à rodada 2 — v3"; inspeção de `src/erros.ts` (tipos de erro) e de `src/app.ts` (`tratarErroGlobal`, `limparTudo` e `aoFalharConsulta`). Validação local registrada abaixo.
- `blockers`: nenhum para a correção; revisão da rodada 3 pendente.

### Validação local da correção v3

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas.
- `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais. `git diff --check`: sem erros.
- Diff restrito a este plano e à versão citada em `cycles.md`. As linhas removidas são todas do texto do autor e do bloco de próximo passo; as rodadas 1 e 2 do revisor não foram editadas.
- Conferência manual: G3 (nenhum dado da carga copiado), nenhuma decisão humana inventada, propostas marcadas como a ratificar, estados e próximo passo coerentes.
- Alteração documental local. Nenhum código, banco, carga, push, PR ou issue.

### Registro anterior — correção v2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + rascunhar_plano + 004_plan + v2@6b6bd89`
- `effect_class`: `local_mutation`
- `state_before`: plano `v1` em `Em Revisão`, com a rodada 1 (`REQUER NOVA RODADA`, R1-1 a R1-8) registrada e commitada localmente em `6b6bd89`; ciclo em `Planejamento`; situação `Aguardando correções (rodada 1)`.
- `state_after`: plano `v2` em `Em Revisão`, com resposta a R1-1 a R1-8 e a rodada 1 preservada; último veredito ainda `REQUER NOVA RODADA`; situação `Aguardando revisão (rodada 2)`; `cycles.md` cita a v2. Nenhuma aprovação, issue, implementação, push ou PR.
- `result`: `executed`
- `evidence`: frase "corrija o plano do ciclo 004" (2026-11-11), posterior ao veredito; seção "Resposta do autor à rodada 1 — v2"; inspeção de `scripts/banco/manifesto.mjs` (conversão das coordenadas por `Number`), de `local/dados-prototipo/saidas/deteccoes.csv` (cabeçalho e formato do texto decimal, sem copiar dados), de `20261107230000_correcoes_revisao_g2.sql` (RS-3), de `src/app.ts` (resumo do filtro comum) e de `scripts/interface/medir-geometria.mjs` (perfil, banco vazio e carga própria). Validação local registrada abaixo.
- `blockers`: nenhum para a correção; revisão da rodada 2 pendente.

### Validação local da correção v2

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas.
- `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais. `git diff --check`: sem erros.
- Diff restrito a este plano e à versão citada em `cycles.md`. As linhas removidas são todas do texto do autor (v1) e do bloco de próximo passo; a rodada 1 do revisor não foi editada.
- Conferência manual: G3 (nenhum dado da carga copiado; só o formato do cabeçalho; os exemplos de coordenada são fictícios), nenhuma decisão humana inventada, propostas marcadas como a ratificar, estados e próximo passo coerentes.
- Alteração documental local. Nenhum código, banco, carga, push, PR ou issue.

### Registro anterior — rascunho v1

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

### Registro da revisão — rodada 1

- `handoff_schema_version`: `2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + revisar_plano + 004_plan/rodada-1 + v1@1135c70efba531e46365459dfe06a0343f4e02da`
- `effect_class`: `local_mutation`
- `state_before`: plano `v1` em `Rascunho`, revisão e aprovação pendentes, situação `Aguardando revisão (rodada 1)`. Ciclo em `Planejamento`. Árvore limpa na branch `chore/cycle-004-plan` em `1135c70`.
- `state_after`: plano `v1` em `Em Revisão`, revisão formal `Em andamento`, veredito `REQUER NOVA RODADA` e situação `Aguardando correções (rodada 1)`. Aprovação humana `Pendente`.
- `result`: `executed`
- `evidence`: parecer em `## Revisão crítica` e transição no cabeçalho e no bloco `## Próximo passo`. Consultas de leitura confirmaram `main` remota em `85b444d`, ausência de PR para `chore/cycle-004-plan` e ausência de issues de lentes. O MCP GitHub Docker devolveu HTTP 401 e a consulta foi concluída via `gh` e `git ls-remote`.
- `blockers`: R1-1 a R1-5.

### Registro da revisão — rodada 2

- `handoff_schema_version`: `2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + revisar_plano + 004_plan/rodada-2 + v2@1c468ec79b251492585d533b7056804d27dfeb87`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` em `Em Revisão`, revisão `Em andamento`, veredito anterior `REQUER NOVA RODADA` e situação `Aguardando revisão (rodada 2)`. Ciclo em `Planejamento`. Árvore limpa na branch `chore/cycle-004-plan` em `1c468ec`.
- `state_after`: rodada 2 registrada com veredito `REQUER NOVA RODADA` e situação `Aguardando correções (rodada 2)`. Plano `v2` em `Em Revisão`, revisão `Em andamento` e aprovação `Pendente`.
- `result`: `executed`
- `evidence`: parecer da rodada 2 e bloco `## Próximo passo`. `gh` e `git ls-remote` confirmaram `main` remota em `85b444d`, ausência de PR para a branch do plano e ausência de issues de lentes na busca por título. A consulta via MCP GitHub Docker retornou HTTP 401.
- `blockers`: R2-1 e R2-2.

### Registro da revisão — rodada 3

- `handoff_schema_version`: `2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + revisar_plano + 004_plan/rodada-3 + v3@d341d3588d211e020c46807d58b150c00152c5b7`
- `effect_class`: `local_mutation`
- `state_before`: plano `v3` em `Em Revisão`, revisão `Em andamento`, último veredito `REQUER NOVA RODADA` e situação `Aguardando revisão (rodada 3)`. Ciclo em `Planejamento`. Árvore limpa na branch `chore/cycle-004-plan` em `d341d35`.
- `state_after`: plano `v3` em `Em Revisão`, revisão formal `Concluída`, veredito `APTO COM RESSALVAS` e situação `Aguardando aprovação do plano`. Aprovação humana `Pendente`.
- `result`: `executed`
- `evidence`: parecer da rodada 3, cabeçalho e bloco `## Próximo passo`. O MCP GitHub Docker retornou HTTP 401. `gh` e `git ls-remote` confirmaram `main` remota em `85b444d`, ausência de PR para a branch do plano e ausência de issues de lentes na busca por título.
- `blockers`: nenhum. Ressalva de implementação R3-1.

## Revisão crítica

### Rodada 1

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano `v1`, commit `1135c70efba531e46365459dfe06a0343f4e02da`.

#### Achados bloqueadores

- **R1-1 — O recorte estadual precisa chegar também à conferência do resumo (T2).** `consultar_resumo`, `consultar_deteccoes` e `consultar_disponibilidade` aplicam `p_municipio` quando ele é informado. Em `src/app.ts`, o resumo guardado usa o filtro da consulta comum. Com 4 detecções no município filtrado e 10 no estado, comparar 10 registros estaduais com o resumo de 4 dispara falsa divergência. Declare no carregador e em C1 o resumo estadual (`p_municipio: null`), na mesma carga e janela das páginas, e deixe explícito que a cobertura usa o município de cada chamada. Inclua um E2E com filtro municipal ativo e totais diferentes. T2 muda o conjunto de entrada das três lentes e deve aparecer como escolha de método a ratificar, com o efeito numérico de cada recorte.
- **R1-2 — A precisão de T1 depende da representação disponível no cliente.** `scripts/banco/manifesto.mjs` converte o texto das coordenadas para `Number`. O banco guarda `double precision` e a RPC devolve números JSON. Contar casas na fonte ou testar literais no módulo não demonstra que a escala pode ser aplicada às respostas da RPC. Especifique o valor canônico usado na conversão, como detectar precisão que a escala não preserva e a condição de parada. A conferência independente deve comparar a classificação por `id_tecnico` entre a coordenada decimal da saída local do recorte e o caminho RPC → TypeScript, além dos agregados. Fixe casos para coordenadas negativas na borda e dos dois lados dela. Uma diferença de célula exige apresentar as alternativas e os resultados ao responsável antes de adotar uma regra.
- **R1-3 — T3 precisa respeitar a integridade da grade D1 e D15 precisa preservar a classe.** A publicação exige a grade completa pelo total, pela chave e pela validação de satélite e janela (`20261107230000_correcoes_revisao_g2.sql`, RS-3). Se uma resposta perde um dos 10 dias esperados, aceitar `9 de 10` como resultado final pode ocultar uma leitura incompleta. Separe falha ou resposta divergente da evidência de disponibilidade e estabeleça quando o qualificador fica pendente ou falha. A regra escrita também usa “inclui dia indeterminado” para qualquer classe diferente de `sem_evidencia_de_lacuna`, o que rotula como indeterminado um dia explicitamente `lacuna_conhecida`. Especifique a precedência e os motivos que aparecem no painel, com teste de lacuna e indeterminação no mesmo dia, em municípios diferentes. Registre D15 como refinamento explícito de Q6 e exercite a distinção entre dia com detecção e dia vizinho sem detecção, preservando a classe observada.
- **R1-4 — Gerações da consulta comum não resolvem concorrência entre lentes.** O ADR-007 descarta respostas de sessão e consulta antigas. O plano não cobre duas aplicações na mesma carga e janela nem o retorno a `Nenhuma` durante a leitura. Se a concentração começa primeiro e termina depois da recorrência, ambas podem passar nas mesmas verificações de geração. Defina a invalidação da aplicação de lente, a limpeza da lista, camada, painel e memória e os estados quando uma página ou uma chamada de disponibilidade falha. Confira carga, janela, filtro e deslocamento de cada resposta, além da unicidade de `id_tecnico`. Por exemplo, duas páginas com 1.000 registros iguais passam num total esperado de 2.000. Exercite páginas duplicadas, troca de lente, `Nenhuma` e logout com resposta atrasada em teste.
- **R1-5 — O orçamento ainda não é um critério reproduzível.** O script de referência mede tempo real no perfil emulado e calcula tamanho gzip em separado. Falta um procedimento para obter o “tempo estimado com gzip” e definir quando a lente está completa, incluindo disponibilidade, mapa e renderização. Defina início e fim da medição, estado do cache, unidades e método de cálculo ou medição, tanto no gate local de cada item quanto no roteiro hospedado. Uma janela padrão menor também precisa indicar como o gate continua valendo para a janela inteira, que permanece acessível. Especifique a parada e a decisão do responsável se a produção exceder o orçamento ou divergir na mesma carga, antes do encerramento.

#### Ressalvas

- **R1-6 — Casos de referência para os parâmetros em produção.** C-1 testa um corte auxiliar `N=2`. Inclua o empate nas posições 10 e 11 pelo ponto de entrada que usa N=10. As duas janelas menores da conferência real são insuficientes para recorrência. Acrescente uma subjanela que toque três meses GMT e tenha pelo menos uma borda parcial, para exercitar D14 também na comparação SQL.
- **R1-7 — Ordem dos gates e da conferência com carga real.** `test:rls` e `test:e2e` executam `supabase db reset`. Declare a ordem de validação e recarga ou use alvos locais distintos, para que a conferência e a medição usem a carga identificada no relatório.
- **R1-8 — Reversão de entregas dependentes.** O item 1 fornece contrato, carregador e interface usados pelos itens 2 e 3. Documente a sequência de reversão quando o item a retirar já tiver consumidores integrados.

#### Itens atendidos

- O escopo preserva a seleção explicável e os avisos de domínio de KB-003 e KB-004. G1 e G3 se aplicam. G2 e G4 ficam justificadamente fora do escopo enquanto o cliente usar as RPCs existentes sob RLS e sem mudanças de acesso ou migração.
- As três entregas têm dependências explícitas e cada lente chega com o qualificador de cobertura. A incorporação da cobertura ao item 1 é coerente com Q2 e Q9 e está identificada para ratificação do desvio de Q1. Os pontos de aprovação distinguem plano, implementação, cada merge e verificação em produção.
- A ideia de conferir o módulo por SQL escrito à parte atende à independência do cálculo. A revisão verificou as interfaces e as precondições por inspeção do repositório. A carga real, a medição de desempenho e o ambiente hospedado ficam para as etapas previstas no plano.

**Veredito:** `REQUER NOVA RODADA`. O autor deve responder aos achados, fechar os critérios verificáveis e submeter a versão seguinte à revisão formal.

### Resposta do autor à rodada 1 — v2

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Base:** plano `v1` com a rodada 1, commit `6b6bd89`.
- **Autorização:** "corrija o plano do ciclo 004".

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R1-1 | **Corrigido.** O recorte espacial virou a escolha de método M1, com três opções e o efeito numérico de cada uma, a ratificar na aprovação (proposta M1-a). O contrato ganhou o campo `recorte`. A conferência usa `consultar_resumo` com o mesmo recorte (`p_municipio: null` em M1-a), nunca o resumo da consulta comum. A cobertura usa o `p_municipio` de cada chamada. Caso L-3 e E2E com filtro municipal ativo e totais diferentes (4 e 10). | "Escolha de método a ratificar — recorte espacial de entrada (M1)"; contrato C1; "Leitura dos registros"; casos L-3 e E2E |
| R1-2 | **Corrigido.** Valor canônico definido: a representação decimal mais curta que reconstrói o `double`, convertida para inteiro decimal sem multiplicação em ponto flutuante. Entradas com notação exponencial, não finitas ou com mais de 15 algarismos significativos são rejeitadas. A conferência compara a célula por `id_tecnico` entre o texto da fonte (`numeric`) e o caminho RPC → TypeScript. Qualquer diferença leva a "Parado", com alternativas ao responsável. Casos G-1 (dos dois lados das bordas negativas) e G-2. | T1 e "Valor canônico das coordenadas"; casos G-1 e G-2; conferência |
| R1-3 | **Corrigido.** T3 deixou de ser regra de cobertura: dia faltante, repetido, fora da janela ou de outro satélite é falha de leitura, conforme a grade completa garantida por RS-3. O qualificador tem os estados `pendente`, `completa` e `falha`, e `falha` nunca mostra "N de M". A classe da célula segue a precedência D1 (T7), e as ressalvas preservam a classe observada (tabela "Ressalvas por classe"). D15 está registrada como refinamento de Q6. Casos V-3, V-4, P-7 e P-8. | T3, T7; contrato (`cobertura`, `ressalvas`); "Regras por lente"; "D15 refina Q6" |
| R1-4 | **Corrigido.** Nova `geracaoLente`, com os eventos que a incrementam e a limpeza de lista, mapa, painel e memória antes da resposta. Verificações por página: eco de carga, período, município, limite e deslocamento; `total`; número de linhas; unicidade e ordem de `id_tecnico` entre páginas. Falha de página derruba a lente inteira; falha de disponibilidade afeta só os qualificadores dependentes. Casos L-1 e L-2 e E2E com respostas retidas (troca de lente, `Nenhuma`, logout, página duplicada e falha de disponibilidade). | "Leitura dos registros"; "Leitura da disponibilidade"; "Concorrência entre aplicações de lente"; casos L e E2E |
| R1-5 | **Corrigido.** Nova seção com o procedimento local e o hospedado: ambiente, perfil, cache, compressão medida por proxy gzip local (não estimada), início no clique, fim em `data-estado-lente="completo"` com critérios explícitos, unidades, 3 repetições com mediana e o orçamento (≤ 20,0 s comprimido e ≤ 10.000.000 bytes brutos por lente). O gate vale sempre para a janela inteira. Paradas local e em produção, esta antes do encerramento, com as alternativas para decisão do responsável. | "Orçamento e procedimento de medição"; ponto "Verificar produção"; item 3 |
| R1-6 | **Corrigido.** Caso C-5 com empate nas posições 10 e 11 pelo ponto de entrada de produção (N=10). A conferência ganhou uma janela que toca 3 meses GMT com as duas bordas parciais. | Casos; conferência; itens 1 e 2 |
| R1-7 | **Corrigido.** `conferir:lentes` e `medir:lentes` partem de `supabase db reset`, publicam a carga real e conferem a identidade no início, no fim e contra o relatório. Ordem declarada: unitários, `typecheck` e `build`; conferência; medição; `test:rls` e `test:e2e`. | "Ordem dos gates com carga real" |
| R1-8 | **Corrigido.** Cadeia de dependência 1 ← 2 ← 3 e ordem de reversão do mais recente para o mais antigo, com os casos de retirada de cada item. | "Riscos, suposições e rollback" |

Nenhum achado foi contestado. Nenhuma decisão humana nova foi tomada: M1, T1 e T3 a T7 e o orçamento são propostas a ratificar na aprovação do plano. O fatiamento em três issues não mudou. A rodada 1 está preservada acima, sem edição.

### Rodada 2

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano `v2`, commit `1c468ec79b251492585d533b7056804d27dfeb87`.

#### Achados bloqueadores

- **R2-1 — Perda de acesso e troca de carga nas chamadas da lente.** A v2 manda tratar erro de página como falha da lente e erro de disponibilidade como falha apenas dos qualificadores afetados. Essa regra também captura `acesso_negado`, `sessao_expirada` e `versao_substituida`, que `src/erros.ts` distingue de falhas da fonte. Por exemplo, se uma chamada de disponibilidade devolve `acesso_negado` após a lista renderizar, seguir a regra escrita deixa os destaques e os dados já lidos na tela. O ADR-007 exige limpar tela, mapa e memória após revogação ou expiração e pedir recarga quando a versão fixada fica indisponível. Explicite o tratamento desses estados em resumo, páginas, disponibilidade e geometria, incluindo a invalidação dos dados reaproveitáveis. Teste uma negação ou expiração durante a leitura de disponibilidade e `carga_indisponivel` durante uma aplicação com resultados em memória. O teste de logout cobre a invalidação iniciada pelo usuário.
- **R2-2 — Os gates locais precisam acompanhar as entregas.** A estratégia E2E prevê aplicar concentração, reter a resposta e aplicar recorrência, mas o item 1 já exige o E2E de concorrência e o item 2 é que introduz a opção de recorrência. A tabela de medição também diz que o gate local de cada item vale para as três lentes. Explicite que o item 1 testa duas aplicações de concentração e o cancelamento com `Nenhuma` ou logout, e que o item 2 acrescenta o cenário entre lentes distintas. Vincule conferência e medição, em cada PR, às lentes disponíveis naquele ponto, mantendo as verificações das anteriores e a janela inteira. O item 3 consolida as três antes da verificação hospedada.

#### Ressalvas

- **R2-3 — Alcance da validação de precisão.** A regra de até 15 algarismos valida a string canônica do `Number`. Ela não detecta dígitos já perdidos na ingestão. Em Node, tanto `-15.05` quanto `-15.0500000000000001` produzem `-15.05`, embora os decimais originais estejam em células distintas. Ajuste a frase de T1 que promete erro explícito para precisão não preservada. A comparação independente por `id_tecnico` e a parada já cobrem esse caso para a carga conferida.
- **R2-4 — Tentativa de medição sem conclusão.** Fixe um prazo por execução e um limite de repetições inválidas. Se o estado `completo` não for atingido, o roteiro hospedado precisa registrar a tentativa e aplicar a parada, pois não há mediana válida para aprovar o resultado.

#### Itens atendidos

- O recorte M1 agora é uma proposta explícita de método, com efeito numérico para cada opção e resumo conferido no mesmo recorte. A revisão formal avalia a proposta M1-a. Sua ratificação continua na aprovação humana do plano.
- A v2 define o valor canônico da grade, a prova independente por `id_tecnico`, a integridade da disponibilidade conforme RS-3 e a distinção das classes em D15 e T7. A seleção continua separada da qualificação da cobertura.
- A geração de lente, a validação das páginas e o teste de respostas atrasadas tratam os cenários da primeira rodada. O protocolo passou a medir gzip e a explicitar o fim da medição, as unidades, a mediana e a parada hospedada. A v2 também cobre o empate real em N=10, a janela parcial de três meses, a ordem de recarga e a reversão por dependência.
- A revisão inspecionou os contratos e a sequência de entregas no repositório. A conferência da carga real e a execução do protocolo de desempenho pertencem à implementação. O diff da correção preservou a rodada 1 e ficou restrito à documentação do ciclo.

**Veredito:** `REQUER NOVA RODADA`. Os bloqueadores caíram de cinco para dois. O autor deve fechar o tratamento dos estados de acesso e carga e alinhar os gates às três entregas antes de submeter a versão seguinte.

### Resposta do autor à rodada 2 — v3

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Base:** plano `v2` com a rodada 2, commit `3b1b2ed`.
- **Autorização:** "corrija o plano do ciclo 004".

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R2-1 | **Corrigido.** Tabela de destino por tipo de erro de `src/erros.ts`, válida para resumo, páginas, disponibilidade e geometria da lente. `acesso_negado`, `sessao_expirada` e `sem_publicacao` vão ao tratamento global existente (`tratarErroGlobal` → `limparTudo`), que passa a limpar também a lente e os dados reaproveitáveis. `versao_substituida` segue o caminho da consulta comum e limpa toda a memória da lente ligada à carga. Só `fonte_indisponivel`, `entrada_invalida` e falhas de verificação ficam locais (lente, qualificador ou contorno). Caso unitário E-1 e E2E de negação, expiração e `carga_indisponivel` durante a leitura. | "Erros por tipo em toda chamada da lente"; "Memória"; E2E; caso E-1; item 1 |
| R2-2 | **Corrigido.** O E2E de concorrência foi dividido por item: o item 1 testa duas aplicações da concentração, `Nenhuma` e logout; o item 2 acrescenta concentração × recorrência; o item 3, recorrência × persistência. Conferência e medição cobrem, em cada PR, as lentes disponíveis naquele ponto, na janela inteira e repetindo as anteriores; o item 3 consolida as três antes da verificação hospedada. | "Alcance por item"; E2E; critérios dos itens 1, 2 e 3 |
| R2-3 | **Corrigido.** A frase de T1 não promete mais detectar precisão perdida: a verificação de até 15 algarismos protege só a conversão da string canônica. A perda na ingestão (exemplo do revisor: `-15.05` e `-15.0500000000000001`) só é detectada pela comparação por `id_tecnico` com o texto da fonte, para a carga conferida. | "Valor canônico das coordenadas" |
| R2-4 | **Corrigido.** Prazo de 120 s por execução e limite de 6 tentativas por lente e passagem, com toda tentativa inválida registrada com motivo. Sem 3 execuções válidas, "Parado" localmente e, em produção, a parada antes do encerramento, já que não há mediana. | Tabela do orçamento ("Prazo e tentativas inválidas"); "Parada em produção" |

Nenhum achado foi contestado e nenhuma decisão humana nova foi tomada. As rodadas 1 e 2 estão preservadas acima, sem edição.

### Rodada 3

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano `v3`, commit `d341d3588d211e020c46807d58b150c00152c5b7`.

#### Itens atendidos

- **R2-1:** a tabela de erros manda usar o tratamento global de acesso e sessão em todas as chamadas da lente e determina a limpeza dos resultados e da memória ao receber `versao_substituida`. Falhas locais de fonte, disponibilidade e geometria têm efeitos próprios. O caso E-1 e o E2E do item 1 verificam os destinos e a limpeza.
- **R2-2:** o item 1 testa e mede concentração, o item 2 acrescenta recorrência e o item 3 acrescenta persistência. Os testes entre lentes distintas entram quando as respectivas opções existem. Cada item mantém as verificações anteriores e a medição na janela inteira.
- **R2-3 e R2-4:** T1 distingue a validação da string canônica da conferência do decimal da fonte por `id_tecnico`. O protocolo de medição fixa 120 s por execução, até seis tentativas para três válidas e a parada se a mediana não puder ser obtida.
- O diff preserva as rodadas anteriores e as decisões de método. Os critérios de G1 a G4 continuam coerentes com o uso das consultas existentes sob RLS, a conferência independente local e a publicação de evidência agregada. A carga real e a medição de desempenho serão verificadas nas entregas.

#### Ressalva

- **R3-1 — Respostas em trânsito após `versao_substituida`.** No controlador atual, `aoFalharConsulta` limpa os resultados sem avançar a geração da consulta. Uma página iniciada antes do erro ainda pode passar pela checagem de geração e preencher novamente o mapa. Na implementação do item 1, a limpeza já prevista para uma carga indisponível deve invalidar também as respostas em trânsito da lente e da consulta comum, assim que o erro for reconhecido. Exercite no E2E uma resposta antiga liberada depois desse estado. A ressalva detalha como verificar o critério existente de limpeza e de versão fixada.

**Veredito:** `APTO COM RESSALVAS`. Os dois bloqueadores da rodada 2 foram resolvidos. A aprovação humana do plano é o próximo passo e ratifica M1-a, os detalhes de método, o fatiamento e o orçamento indicados na tabela de pontos de aprovação.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
