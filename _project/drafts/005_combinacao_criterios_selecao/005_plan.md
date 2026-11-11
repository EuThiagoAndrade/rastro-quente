# Plano de Implementação — Combinação de critérios de seleção

> **Ciclo:** `005`
> **Status:** `Aprovado`
> **Versão:** `v2`
> **Data de criação:** 2026-11-11
> **Última atualização:** 2026-11-11
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 005" em 2026-11-11
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO COM RESSALVAS`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-11`
> **handoff_schema_version:** `2`

**Autorização do rascunho:** "Autorizo o rascunho do plano do ciclo 005", em 2026-11-11. Autor: Claude Code (Opus 5.5). A ideação deixou Q1 a Q9 decididas. Nenhuma pergunta de método nova foi feita antes do rascunho. Os detalhes técnicos que decorrem dessas decisões, mas mudam resultados de borda ou o que é exibido (T8 a T14), aparecem como propostas e só valem com a aprovação do plano. Este rascunho não é aprovação do plano, nem autorização de issue ou de implementação.

**Aprovação do plano — v2, 2026-11-11:** o responsável manifestou literalmente "aprovo o plano do ciclo 005", depois do veredito `APTO COM RESSALVAS` da rodada 2 (revisor: Codex, GPT-6).

A aprovação ratifica como decisões humanas de G1 os itens enumerados em "Aprovar plano › Conferir":

- Q1 a Q9 e os detalhes T8 a T14, com T8 na forma revisada da v2 (a combinação calcula as lentes sobre a entrada conferida);
- o contrato da combinação, com os destaques originais por critério e as sequências da persistência em itens próprios;
- os textos de motivo, ressalva e limitação, e a versão `combinacao-005-v1`.

Ratifica também a interface mínima, com lista paginada e a regra de configuração durante a aplicação; o fatiamento em duas issues; o orçamento, com as 8 configurações medidas, a regra de bytes e a parada; e o roteiro de verificação em produção com a identidade integral da carga.

**Ressalvas R2-1 e R2-2 incorporadas ao item 2, sem mudar o escopo.**

- **R2-1:** na revisão dos textos do item 2, a limitação geral da combinação descreve o efeito de cada operador. "e" torna a seleção mais específica; "ou" a amplia, reunindo as células destacadas por qualquer das lentes escolhidas (na janela inteira, 1.116 células nas três, contra 1.017 da concentração sozinha). Os dois textos mantêm o aviso de que a lista não é ranking e de que células destacadas por mais lentes não são mais graves nem prioritárias. O critério de aceite que proíbe sugerir ranking passa a conferir também esses textos.
- **R2-2:** o roteiro hospedado preparado na task do item 2 explicita o perfil do ciclo `004` no DevTools (150 ms de latência, 1,6 Mbit/s de descida, 750 kbit/s de subida e CPU 4× mais lenta), conta o prazo de 120 s a partir do clique e registra o motivo de toda tentativa inválida, inclusive a que termina com cobertura não verificada.

Cobre:

- a publicação da PR documental deste lote (ideação, plano e registro do ciclo);
- depois da integração documental e da confirmação dos payloads, a criação das duas issues;
- o encerramento, depois das entregas.

Não cobre merges, a implementação das issues nem a verificação em produção. Cada um desses passos tem frase própria.

**Autorização da correção — v2, 2026-11-11 (histórico):** "corrija o plano do ciclo 005", depois do veredito `REQUER NOVA RODADA` da rodada 1 (revisor: Codex, GPT-6). A v2 responde a R1-1 a R1-8 (ver "Resposta do autor à rodada 1 — v2"), preserva a rodada 1 e mantém o plano `Em Revisão`, aguardando a rodada 2. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova: T8 a T14 continuam propostas a ratificar na aprovação.

## Problema e contexto

Ideação: _project/ideations/005_combinacao_criterios_selecao.md

## Objetivo

Permitir combinar as três lentes do ciclo `004` (concentração, recorrência e persistência) por interseção ("e") ou união ("ou"), sobre a carga e a janela já aplicadas. O resultado combinado é por célula de 0,05° (grade T1) e mostra, para cada célula, quais lentes a destacaram, com o motivo, a evidência e as ressalvas de cada uma.

A combinação é um módulo puro e determinístico em `src/lentes/`, sem migração, função, tabela, política ou grant novos (Q8). Ela não altera as três lentes nem `lentes-004-v1`. A regra é coberta por casos de referência escritos neste plano antes do código e por uma conferência independente sobre a carga real local, que refaz os números da exploração da ideação.

Um destaque combinado orienta avaliação técnica. Não comprova incêndio, dano, autoria ou infração, e combinar não torna a seleção mais verdadeira, só mais específica. O resultado combinado não tem ordem por número de lentes, pontuação ou rótulo de prioridade (Q4).

## Origem no backlog

Herdada da ideação, sem reescrever o snapshot:

- **BL-005 — Combinação de critérios de seleção.** Item inteiro, sem parcela; Restante: `—`.
- **Referência:** `_project/backlog.md`, commit `2e31651`, integrado em `main` e `origin/main`. Não é local nem está pendente de publicação.
- **Destino em preparação.** O item continua `Disponível`. O retorno na fila (`- ciclo 005 — AAAA-MM-DD — parcela`) só é registrado depois da integração do encerramento em `main`, comprovada no GitHub, sob a autorização da seleção, por `gerenciar_backlog`. A publicação desse retorno exige autorização separada.
- **Cobertura da necessidade (para o retorno futuro):** interseção e união com a explicação por critério cobrem o pedido do BL-005. A combinação por pontuação com pesos fica fora (Q4) e, se o responsável quiser mantê-la como possibilidade, vira Restante no retorno, por decisão registrada.

## Contexto e baseline

- **Base:** `main` e `origin/main` em `2e316513edc2b421de1a81c188017fb5de138dd2` (PR #40). A ideação ainda não foi commitada: está como arquivo novo, junto com a linha do ciclo em `_project/cycles.md`, na branch local `chore/cycle-005-plan`, criada a partir de `chore/cycle-005-ideation` (ambas em `2e31651`, sem commits próprios). Em 2026-11-11 não havia PR ou issue aberta no repositório (`gh pr list` e `gh issue list`).
- **Dados:** a mesma carga do ciclo `004`, `AQUA_M-T`, com 10.640 detecções principais de 2025-11-01 a 2026-10-31 (dias GMT). Identidade conferida no ciclo `004`: `2134ff148b386593a2d89af9894a34ec4a7ef035a660c5652092dc42313e0db2` (`004_research_conferencia_lentes.md`). A conferência deste ciclo registra a identidade de novo, no início e no fim.
- **Contrato e lentes (KB-005, `src/lentes/`):** `ResultadoLente` com `destaques`. Cada `Destaque` traz `id_destaque`, `unidade` (`municipio` ou `celula_005`), `motivo`, `evidencia.deteccoes` (lista de `id_tecnico`), `cobertura` e `ressalvas`. Concentração por município, com N=10 e os empatados (D16). Recorrência por célula, com k=3 meses GMT (D14). Persistência por sequência maximal de 3 ou mais dias GMT consecutivos na célula, com uma sequência por destaque (T6). As lentes saem com cobertura `pendente`. `qualificar` (`comum.ts`) aplica depois a cobertura e, na persistência, as ressalvas por classe (D15 e T7).
- **O que o resultado da concentração não traz:** a evidência da concentração é a lista de `id_tecnico` do município, sem coordenadas. Projetar o município na célula (P1) exige os registros, com latitude, longitude e município. A cobertura V1 também exige os municípios de **todas** as detecções da célula, inclusive as que nenhuma lente usou. Por isso a hipótese H1 se confirma só em parte (ver T8): a combinação não faz nova leitura, mas recebe a entrada já lida e conferida e calcula as lentes escolhidas sobre ela.
- **Leitura e memória (`src/app.ts`, `src/lentes/carregar.ts`):** `lerRegistros` lê o resumo e as páginas no recorte M1-a. A memória da lente (`MemoriaLente`) reaproveita os registros e a disponibilidade já validada enquanto a sessão, a carga, a janela e o recorte forem os mesmos. `geracaoLente` invalida a aplicação em curso. A disponibilidade é lida por município, com até 4 chamadas simultâneas.
- **Interface atual:** cartão "Lentes de seleção" com seletor de uma lente, lista sem paginação, camada de destaques no mapa (`definirDestaques`, com retângulos para célula) e painel com a evidência paginada em 20 por página (`src/apresentacao-lentes.ts`).
- **Custo medido no ciclo `004` (janela inteira, mesma carga):** os registros custam 12 requisições, 3.861.971 bytes brutos e 487.726 comprimidos. A disponibilidade custa 87.453 bytes brutos por município (4.460.103 bytes para os 51 municípios da recorrência; 2.885.949 para os 33 da persistência). Medianas comprimidas: concentração 5,9 s, recorrência 14,3 s e persistência 8,7 s, contra o orçamento de 20,0 s e 10.000.000 bytes brutos por lente.
- **Implantação:** cada merge em `main` gera um deploy de produção na Vercel. Nenhuma funcionalidade fica atrás de chave de configuração.
- **Testes atuais:** `npm run typecheck`, `build`, `test:interface` (`tests/unit/*.test.mjs`), `test:e2e` (Playwright, Supabase local e fixtures fictícias), `test:rls`, `test:governance` e `check:governance`, todos na CI. `conferir:lentes` e `medir:lentes` rodam só localmente, com a carga real de `local/`.
- **Exploração da ideação:** os números foram calculados pelas próprias funções de `src/lentes/`, por um script temporário. Servem de calibração e **não** são valores esperados. A conferência deste ciclo os refaz por caminho independente.

## Escopo

### Dentro do escopo

- Módulo puro de combinação (`src/lentes/combinacao.ts`), com o tipo de resultado combinado, a versão própria e as regras Q1 a Q7 e T8 a T14.
- Casos de referência fictícios, com os valores esperados escritos neste plano.
- Conferência independente sobre a carga real local e relatório com agregados públicos.
- Interface mínima (Q9) no cartão de lentes: escolha de 2 ou 3 lentes e do operador, lista paginada, células no mapa e painel por critério, com os estados distintos.
- Medição do tempo e dos bytes, roteiro de verificação em produção e documentação viva: a KB-005, o guia da interface no runbook e a KB-003 no encerramento.

### Fora do escopo

- Pontuação, pesos, "pelo menos k de n", expressões com grupos e qualquer ordem por número de lentes, prioridade, gravidade ou risco (Q3 e Q4).
- Combinação por detecção, por município ou só entre lentes da mesma unidade (Q1). Persistência por sequência na combinação (Q5).
- Mudança de parâmetro, regra ou resultado das três lentes, de `lentes-004-v1`, da contagem, da disponibilidade D1 ou das regras H3 da KB-004.
- Migração, função, tabela, view, política ou grant novos (G2 e G4). Se forem necessários, a situação passa a "Parado" e o trabalho é retriado (Q8).
- Novas lentes e fontes (BL-002, BL-003, BL-004 e BL-006), design system (BL-007), atualização automática (BL-008) e IA (BL-009).
- Exportação, favoritos, persistência de resultados, armazenamento no navegador e qualquer afirmação de incêndio, dano, autoria ou infração.

## Decisões e autoridades

Autoridades: `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, KB-003, KB-004, KB-005, ADR-005, ADR-007, o plano `004` v3 e as decisões humanas da ideação `005`. O que este plano acrescenta como proposta técnica fica marcado como tal e só vira decisão com a aprovação do plano.

### Decisões herdadas da ideação (2026-11-11)

Q1 a Q9, aceitas integralmente pelo responsável ("Aceito todas") e registradas na ideação. Em síntese:

- **Q1 (D2):** o resultado combinado é por célula de 0,05° (grade T1).
- **Q2 (P1):** a célula entra pela concentração se tiver pelo menos 1 detecção de município destacado.
- **Q3 (O1):** 2 ou 3 lentes e um único operador, "e" ou "ou".
- **Q4 (R1):** ordem fixa por posição da célula, sem ordem por número de lentes e sem pontuação.
- **Q5 (S1):** a persistência entra por célula.
- **Q6 (I1):** lente sem aplicação na janela torna a combinação indisponível, nomeando a lente.
- **Q7 (V1):** qualificador comum de cobertura na célula; ressalvas listadas por lente.
- **Q8 (L3):** módulo puro, sem migração e com G2 = Não.
- **Q9:** interface mínima.

### Verificações pedidas pela ideação

| Verificação | Resultado neste plano |
| :-- | :-- |
| Compatibilidade aditiva com C1 (H3) | Confirmada por desenho: tipo novo em `combinacao.ts`, sem alterar tipo, campo ou significado de C1, nem o resultado das lentes. Versão própria `combinacao-005-v1` (T14) |
| Casos de referência independentes | Casos CB-1 a CB-16, com os valores esperados escritos à mão (seção "Estratégia de testes"). A conferência independente refaz 6 e 1.116 células na janela inteira por SQL escrito à parte |
| Custo de aplicar duas ou três lentes | As lentes compartilham uma única leitura. O custo novo é a disponibilidade dos municípios das células combinadas. As 8 configurações (3 pares e as três, com "e" e "ou") são medidas na janela inteira (seção "Orçamento") |
| Carga e janela fixando o resultado; cobertura `pendente` ou `falha` | T8: a combinação calcula as lentes sobre a mesma entrada conferida, de modo que carga, janela e registros são os mesmos por construção. A seleção nunca depende da cobertura (T12), e os estados `pendente` e `falha` seguem o qualificador comum |
| Verificação em produção | Exigida, com roteiro que corrige as lacunas do ciclo `004` e compara a identidade integral da carga (seção "Verificação em produção") |

### Detalhes técnicos propostos para ratificação na aprovação

Continuam a numeração do ciclo `004`. Não são regras analíticas de escolha livre: decorrem de Q1 a Q7, mas mudam resultados de borda ou o que é exibido. Por isso aparecem em "Aprovar plano › Conferir" e só valem com a aprovação.

| Detalhe | Proposta | Exemplo | Alternativa considerada |
| :-- | :-- | :-- | :-- |
| **T8 — Entrada da combinação (refina H1, R1-2)** | `combinar(entrada, lentes, operador)` recebe a `EntradaLente` já lida e conferida (registros, carga, janela, total do resumo e nomes) e **calcula ela mesma** as lentes escolhidas, chamando `concentracao`, `recorrencia` e `persistencia` sobre essa entrada, com os parâmetros de produção. Não recebe resultados de lente calculados fora, e não há nova leitura. Assim, toda evidência vem dos mesmos registros por construção. Origem de cada valor: carga, janela e registros vêm da entrada; o recorte é M1-a (`estado`, município `null`), fixo no contrato; a versão das lentes é `VERSAO_METODO`; os três totais vêm de `conferirEntrada`, executada por cada lente. Divergência na conferência ou coordenada fora da forma canônica lança `ErroLente`, e a combinação não é exibida. Só para os casos de referência, um parâmetro opcional fixa o `n` da concentração; o ponto de entrada de produção não o recebe e usa N=10 | Duas lentes calculadas em entradas diferentes (registros `a, b` e `c, d`, com os mesmos metadados e totais) não podem mais ser combinadas, porque a API não aceita resultados prontos | Receber resultados prontos e comparar metadados (v1) não prova que vieram dos mesmos registros (R1-2); combinar só os `ResultadoLente` (H1 literal) não permite projetar a concentração |
| **T9 — Pertinência e evidência por lente** | Concentração (P1): a célula entra se algum registro da janela nela tiver `municipio_codigo` destacado (inclusive os empatados de D16), mesmo que seja minoria. A evidência da concentração na célula são só os `id_tecnico` desses registros. Recorrência: a célula do destaque; evidência igual à do destaque. Persistência (S1): a célula entra se tiver pelo menos uma sequência. Cada destaque original que levou a célula a entrar (o município, na concentração; a célula, na recorrência; cada sequência, na persistência) fica preservado no contrato com seu `id_destaque`, sua evidência na célula, seu motivo e suas ressalvas (T14). A célula é sempre calculada por `indiceGrade` (T1) | Célula com 1 detecção de Colniza (destacada) e 2 de um vizinho não destacado → entra pela concentração (a maioria, rejeitada em Q2, não a destacaria), com evidência de 1 `id_tecnico` | Evidência da concentração com todas as detecções da célula diria que as do vizinho sustentam a concentração |
| **T10 — Operadores e conjunto de lentes** | 2 ou 3 lentes distintas, sempre na ordem canônica concentração, recorrência e persistência, qualquer que seja a ordem da escolha. "e": células presentes no conjunto de todas as lentes escolhidas. "ou": células presentes em pelo menos um. Menos de 2 lentes, lente repetida, lente desconhecida ou operador diferente de `e` e `ou` são entrada inválida | "persistência e recorrência" é o mesmo resultado que "recorrência e persistência", com o mesmo identificador | Uma lente sozinha já existe no seletor e não é combinação |
| **T11 — Estados da combinação** | `indisponivel` (I1): alguma lente escolhida tem `janela_insuficiente`, com qualquer operador. Sem células, com o texto por lente ("recorrência não se aplica a esta janela: a janela toca 1 mês GMT; a recorrência exige pelo menos 3"). `sem_celulas`: as lentes rodaram e o conjunto combinado ficou vazio. No "e", isso inclui uma lente com `sem_destaques`; no "ou", ocorre quando nenhuma lente escolhida destaca célula alguma (por exemplo, numa janela de 3 meses sem detecções). O texto depende do operador (R1-4): "e", "Nenhuma célula destacada por todas as lentes escolhidas nesta janela."; "ou", "Nenhuma célula destacada por qualquer das lentes escolhidas nesta janela.". Os dois terminam com "Isso não indica ausência de focos nem de risco.", e o aviso de domínio continua visível. `com_celulas`: um ou mais | Janela de 01/10 a 31/10: "recorrência e persistência" e "concentração ou recorrência" ficam indisponíveis; "concentração e persistência" é calculada | Tratar `sem_destaques` como indisponível esconderia um resultado legítimo da lente; tratar `janela_insuficiente` como vazio é a opção I2, rejeitada na ideação |
| **T12 — Cobertura e ressalvas (V1)** | Cobertura da célula: `qualificarCobertura` sobre os municípios de todas as detecções da célula na janela (D13 e T7), as mesmas da recorrência. A seleção nunca depende da cobertura. Ressalvas por lente, dentro de cada critério: recorrência, a de mês parcial (D14); persistência, a de borda (T4) e as por classe (D15 e T7), calculadas **sequência a sequência** com `ressalvasDeClasse(dias da sequência, janela, cobertura da célula)`, nunca sobre a lista achatada das sequências da célula (R1-1); concentração, a ressalva de projeção abaixo. Enquanto a cobertura não está `completa`, a persistência mostra "ressalvas de disponibilidade ainda não verificadas", como hoje | Ressalva de projeção, quando a célula tem detecções de município não destacado: "a célula também tem 4 de 10 detecções de município não destacado pela concentração" | Cobertura só por lente (V2) foi rejeitada na ideação |
| **T13 — Ordem e ausência de pontuação (R1)** | Células de norte a sul (índice de latitude decrescente) e depois de oeste a leste, como T5. Dentro da célula, os critérios na ordem canônica de T10; na persistência, as sequências pela data de início. O resultado não tem campo de contagem de lentes, `ordem` nem `ordenacao`. A interface nomeia as lentes da célula e não exibe "N lentes" como número | Células `c-201_-1121`, `c-201_-1119` e `c-202_-1125` saem nessa ordem | Ordenar pelo número de lentes é R2, rejeitada na ideação |
| **T14 — Contrato e versão da combinação** | Tipo novo `ResultadoCombinacao` em `combinacao.ts`. Ele reutiliza `TipoLente`, `CargaLente`, `Janela`, `Cobertura` e a célula de `grade.ts`, sem alterar C1. Versão própria `VERSAO_COMBINACAO = 'combinacao-005-v1'`, registrada junto com a `versao_metodo` das lentes. Mudar regra da combinação muda essa versão (nova decisão de G1 e novo plano). Identificador da célula combinada: `combinacao:<operador>:<lentes>:celula_005:<id>`, com as lentes na ordem canônica unidas por `+` | `combinacao:e:concentracao+recorrencia+persistencia:celula_005:c-251_-1130` | Acrescentar `combinacao` a `TipoLente` mudaria o significado do campo `lente` em C1 e tocaria `qualificar` e o seletor |

### Contrato da combinação (proposta T14)

`ResultadoCombinacao`:

| Campo | Conteúdo |
| :-- | :-- |
| `tipo` | `combinacao` |
| `versao_combinacao` | `combinacao-005-v1` |
| `versao_metodo` | A das lentes (`VERSAO_METODO`, hoje `lentes-004-v1`), com que a própria combinação as calcula (T8) |
| `operador` | `e` ou `ou` |
| `lentes` | 2 ou 3, na ordem canônica (T10) |
| `carga`, `janela`, `recorte`, `conferencia` | Os da entrada; o recorte é M1-a e a conferência é a de `conferirEntrada` (T8) |
| `parametros` | Os de cada lente, sem edição, e o da projeção: "a célula entra pela concentração se tiver pelo menos 1 detecção de município destacado" |
| `estado` | `com_celulas`, `sem_celulas` ou `indisponivel` (T11) |
| `indisponibilidade` | Lista das lentes sem aplicação, com o texto de cada uma; vazia nos demais estados |
| `celulas[]` | Ver abaixo, na ordem T13 |
| `limitacoes[]` | As comuns, as de célula, a da concentração ("Contagem absoluta favorece municípios grandes") quando ela estiver entre as lentes, e as da combinação (abaixo) |

Cada célula combinada traz:

- **`id_combinado`** e **`unidade`** (célula T1, com id e bordas em texto);
- **`criterios[]`**, um por lente que destacou a célula, na ordem canônica. Cada critério tem `lente`, `ressalvas` do critério (só a de projeção, na concentração) e **`destaques[]`** (R1-1): um item por destaque original que levou a célula a entrar, com
  - `id_destaque` (o da lente: `concentracao:municipio:<código>`, `recorrencia:celula_005:<id>` ou `persistencia:celula_005:<id>:<início>`),
  - `motivo`,
  - `evidencia` (`deteccoes` na célula e `datas`: vazias na concentração, os meses na recorrência, os dias da sequência na persistência),
  - `ressalvas` daquele destaque (mês parcial; borda e por classe da sequência).

  Na concentração, há um item por município destacado com detecção na célula, em ordem de código IBGE. Na recorrência, um item. Na persistência, um item por sequência, pela data de início;
- **`evidencia.deteccoes`**: a união ordenada das evidências de todos os destaques, sem repetição;
- **`municipios`**: os de todas as detecções da célula na janela;
- **`cobertura`**: o qualificador comum (T12).

No "ou", uma célula aparece mesmo que só uma lente a tenha destacado, e `criterios` lista só essa lente. No "e", toda célula tem um critério por lente escolhida.

**Motivo da concentração na célula, por município:** "6 detecções nesta célula de Colniza, município destacado pela concentração (901 detecções na janela; corte em 10, com empatados)". Não mostra a posição do município, para não carregar a ordem da concentração para a combinação. Os motivos da recorrência e da persistência são os dos destaques originais.

**Limitações da combinação:**

- "Combinar critérios torna a seleção mais específica, não mais verdadeira. A lista não é ranking: células destacadas por mais lentes não são mais graves nem prioritárias."
- "A concentração entra na célula por projeção: a célula conta se tiver pelo menos 1 detecção de município destacado. A célula não segue divisas." Só quando a concentração está entre as lentes.
- "Nenhuma célula em comum não indica ausência de focos nem de risco." Só no "e".

### Orçamento e procedimento de medição

O procedimento é o do plano `004` (seção "Orçamento e procedimento de medição"): mesmo perfil do ADR-007, cache desligado, contexto novo por execução, passagens bruta e comprimida pelo proxy local, prazo de 120 s, 3 execuções válidas e no máximo 6 tentativas. O orçamento proposto é o mesmo, **por combinação, na janela inteira**: mediana comprimida ≤ 20,0 s **e** maior total de bytes brutos entre as execuções válidas da passagem bruta ≤ 10.000.000. É a regra do script do ciclo `004` (`maxBytes` da passagem bruta), e o aceite e a parada usam a mesma (R1-6). Uma configuração só está dentro do orçamento com 3 execuções válidas em cada passagem.

- **Configurações medidas (R1-6):** as 8 configurações da combinação, isto é, os 3 pares e as três lentes, cada um com "e" e com "ou", todas na janela inteira. As três lentes individuais são medidas de novo, para mostrar que não regrediram. Medir os pares diretamente evita depender de um argumento de inclusão para o tempo. O relatório registra também, por configuração, o número de células e de municípios da cobertura, que a conferência calcula de forma independente.
- **Fim da medição:** o atributo `data-estado-lente="completo"` no cartão, gravado só quando a conferência passou, a lista e a camada do mapa estão desenhadas e toda célula exibida tem cobertura `completa`. Não há geometria municipal na combinação, porque a unidade é a célula.
- **Estimativa, a confirmar na medição:** os registros custam 3.861.971 bytes brutos, e cada município da cobertura, 87.453. O orçamento comporta cerca de **70 municípios** (3.861.971 + 70 × 87.453 = 9.983.681). Na união das três, os municípios da cobertura são pelo menos os 51 da recorrência e provavelmente mais de 61, o número da união por município medido na ideação, acrescidos dos vizinhos que dividem célula com os 10 municípios da concentração. **A margem é estreita**, e a parada abaixo é um desfecho plausível.
- **Parada local:** fora do orçamento, a situação passa a "Parado" antes da PR do item 2, com os números por parte (registros e disponibilidade) e as alternativas para decisão do responsável:
  1. aceitar com progresso visível e registrar o desvio;
  2. cobertura sob demanda, lida só para a célula aberta no painel, com a lista mostrando "cobertura: ao abrir a célula" (muda quando a cobertura aparece, não a regra V1);
  3. ajustar o orçamento de bytes da combinação;
  4. função agregadora nova no banco (G2 = Sim, G4 = Sim e retriagem do nível, Q8).

  Nenhuma é escolhida pelo agente.

### Interface mínima (Q9)

- No cartão "Lentes de seleção", o seletor ganha a opção "Combinação de lentes". Escolhida, ela mostra um grupo "Lentes a combinar", com três caixas (Concentração, Recorrência e Persistência), e um grupo "Operador", com dois botões de opção: "e: células destacadas por todas as lentes escolhidas" e "ou: células destacadas por pelo menos uma das lentes escolhidas". A ação continua "Aplicar lente".
- **Aplicação:** uma leitura (`lerRegistros`, com o reaproveitamento atual), `combinar` sobre a entrada conferida (que calcula as lentes escolhidas, T8) e, depois, a disponibilidade dos municípios das células exibidas, com a memória atual. `geracaoLente` invalida a aplicação como hoje.
- **Configuração durante a aplicação (R1-7):** a configuração é lida do formulário uma única vez, no clique em "Aplicar lente", e fica gravada no resultado. Editar as caixas ou o operador depois disso não cancela a aplicação em curso nem muda o resultado, a lista, o mapa ou o painel, que continuam descrevendo a configuração aplicada. O cabeçalho mostra sempre o operador e as lentes do resultado, e não os do formulário. Enquanto o formulário diferir do resultado exibido, aparece o aviso "a configuração escolhida mudou; aplique de novo para atualizar". "Aplicar lente" com menos de 2 caixas marcadas mostra "escolha pelo menos 2 lentes", não incrementa `geracaoLente` e não toca a aplicação em curso nem o resultado exibido. Escolher "Nenhuma" continua cancelando na hora, como no ciclo `004`.
- **Cabeçalho do resultado:** operador e lentes; `combinacao-005-v1` sobre `lentes-004-v1`; carga pelo id, como nas lentes (a identidade integral está no cartão de Proveniência); janela; aviso de M1-a; parâmetros fixos de cada lente e o da projeção; e o texto "Ordem fixa pela posição da célula (norte→sul, oeste→leste); não é ranking".
- **Lista:** paginada em 50 células por página, declarando "células X a Y de M". Cada item mostra o id da célula, as lentes que a destacaram (por nome, na ordem canônica) e o estado da cobertura. A paginação é necessária porque a união das três tem 1.116 células na janela inteira, contra no máximo 150 numa lente do ciclo `004`.
- **Mapa:** retângulos de célula na camada de destaques existente, com o mesmo estilo e o enquadramento atual. A lista é a alternativa em texto ao mapa.
- **Painel:** para a célula escolhida, um bloco por critério e, dentro dele, um item por destaque original (T14): na concentração, cada município com seu motivo e sua contagem na célula, e a ressalva de projeção; na recorrência, o motivo, os meses e as ressalvas de mês parcial; na persistência, cada sequência com seus dias, seu motivo e suas próprias ressalvas de borda e por classe; a cobertura da célula com os municípios usados; e a tabela da evidência em união, paginada em 20, declarando "N de M", com uma coluna "Lentes" que diz quais critérios cada detecção sustenta. Limitações e aviso de domínio sempre visíveis.
- **Estados distintos e testados:** carregando (registros e disponibilidade, com progresso), completo (com "Combinação concluída em X,X s"), sem células em comum ("e") e sem células destacadas ("ou"), com os textos de T11, indisponível (T11, nomeando a lente), cobertura não verificada, leitura inconsistente, versão substituída, falha e cancelada.
- **Sem redesenho:** tokens, componentes e regras de acessibilidade do ADR-007 (alvos de 44 × 44 CSS px, foco visível, contraste, 200% e reflow a 320 CSS px). Grupos com `fieldset` e `legend`. Qualquer outra mudança visual é BL-007.

### Verificação em produção

O ciclo `004` fechou com a verificação hospedada parcial: faltou a identidade da carga, houve uma execução por lente e a memória da lente estava preenchida. Por isso, aqui ela é exigida e o roteiro fecha essas lacunas:

- **identidade integral (R1-5):** o responsável copia do cartão de Proveniência a identidade completa da carga (SHA-256 de 64 caracteres hexadecimais), que precisa ser igual, caractere a caractere, à registrada na conferência local. O id da carga vem de uma sequência de cada banco e pode diferir entre os ambientes; ele é registrado só como referência dentro de cada ambiente e nunca usado para comparar os dois;
- "as três, e" e "as três, ou" na janela inteira, 3 execuções válidas de cada, com a página recarregada e "Disable cache" ligado antes de cada execução, para a memória da lente começar vazia. Os pares ficam cobertos pela medição local (seção "Orçamento"), e o roteiro hospedado confere os dois extremos;
- o responsável informa, por execução, o número de células, o tempo exibido pelo cartão, os bytes transferidos filtrados por `rest/v1` e o `Content-Encoding` observado.

O agente confere com a conferência local da mesma carga. **Parada em produção, antes do encerramento:** se a identidade integral estiver ausente ou divergir da local, se a mediana hospedada passar de 20,0 s, se não houver 3 execuções válidas em 6 tentativas, ou se o número de células divergir da conferência local com a mesma identidade, a situação passa a "Parado". As alternativas para decisão do responsável: aceitar e registrar o desvio no encerramento; corrigir por trilha curta (defeito de algo especificado) ou por novo ciclo; ou reverter as entregas na ordem da seção de rollback. O encerramento só é preparado depois da decisão registrada.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho: "autorizo o rascunho do plano do ciclo 005" | Ideação registrada com Q1 a Q9 decididas | Este rascunho local, a reconciliação da ideação, a linha do ciclo em `cycles.md` e a branch local `chore/cycle-005-plan` | Revisão, aprovação, commit, publicação, issues e implementação | Recebida em 2026-11-11 |
| Aprovar plano: "aprovo o plano do ciclo 005" | Revisão formal com veredito apto e manifestação humana posterior | O plano revisado; a publicação da PR documental (ideação, plano e registro do ciclo); depois da integração documental e da confirmação dos payloads, a criação das duas issues; o encerramento, depois das entregas | Implementação, merges e verificação em produção | Como decisões humanas de G1: Q1 a Q9, T8 a T14, o contrato da combinação, os textos de motivo, ressalva e limitação, e a versão `combinacao-005-v1`. Também: a interface mínima com lista paginada, o fatiamento em duas issues, o orçamento com as 8 configurações medidas, a regra de bytes e a parada, a regra de configuração durante a aplicação e o roteiro de verificação em produção com a identidade integral |
| Autorizar implementação: "autorizo a implementação da issue #N" | Plano aprovado e integrado, issue criada e item anterior integrado | Branch, task, implementação, testes, conferência e medição locais com a carga real em `local/` e a PR da issue | Merge, migração ou função nova, mudança de regra ou de parâmetro e a decisão que uma parada exigir | Escopo da issue, barreiras e gates |
| Aprovar merge: "aprovo o merge da PR #N" | PR concreta, checks verdes no último commit e diff conferido | Somente o merge daquela PR, por squash, **e o deploy de produção automático que ele dispara na Vercel** | Outras PRs, verificação em produção e nova entrega | Diff, G1 a G4, privacidade, conferência e estado real |
| Verificar produção: "autorizo a verificação em produção do ciclo 005" | Itens 1 e 2 integrados e deploy de `main` identificado por commit | O roteiro da seção "Verificação em produção", executado pelo responsável na própria sessão, e a conferência do agente contra a conferência local | Login pelo agente, carga, migração, mudança de dados ou de método, e a decisão que a parada em produção exigir | Commit do deploy, identidade integral da carga (SHA-256) igual à local, número de células igual ao local e mediana dentro do orçamento |

Não há ação humana externa prevista: nenhuma migração ou configuração hospedada muda. Cada PR, inclusive a documental e a de encerramento, tem aprovação própria de merge. No ciclo completo não há modo contínuo.

Toda cadeia autorizada para em "Parado" quando:

- a conferência independente divergir do módulo sem explicação;
- algum número da exploração da ideação não for reproduzido e a diferença não for explicada;
- o orçamento for excedido, localmente ou em produção;
- a produção divergir da conferência local na mesma carga;
- surgir a necessidade de função, tabela, política ou migração (G2 e G4, com retriagem);
- um caso de borda não previsto em Q1 a Q9 ou T8 a T14 mudar a seleção;
- for preciso mudar o resultado de uma das três lentes;
- houver dúvida de privacidade.

A concessão não dispensa a conferência da precondição.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regra de seleção nova: unidade comum, projeção da concentração, operadores, indisponibilidade e cobertura da célula combinada. Atendida por decisões humanas registradas (Q1 a Q9, com T8 a T14 ratificados na aprovação); casos de referência fictícios com valores esperados escritos neste plano antes do código; conferência sobre a carga real por caminho independente (SQL no banco local, sem importar `src/lentes/`), refazendo os números da exploração; proveniência por carga, janela, versão das lentes e versão da combinação; limitações e aviso de domínio em todo resultado; nenhuma pontuação ou ordem por critério. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, view, política ou grant novo: a combinação usa as mesmas RPCs das lentes sob a sessão do usuário (ADR-005). A limpeza ao sair, expirar ou perder acesso segue o ADR-007 e é testada no E2E, sem alterar a matriz de acesso. Se surgir objeto novo no banco, inclusive pela parada do orçamento, a situação passa a "Parado" e o trabalho é retriado (Q8). |
| G3 — privacidade de dados | Sim | Sem dados pessoais. Fixtures fictícias em `tests/fixtures/lentes/` e no E2E. A carga real (pública, INPE e IBGE) só é usada localmente, em `local/`. O relatório versionado traz apenas agregados públicos (contagens de células e de municípios), sem brutos. Nenhum resultado no bundle ou em armazenamento do navegador. A identidade da carga, usada no roteiro hospedado, é um hash de dados públicos, já exibido no cartão de Proveniência, sem segredo. |
| G4 — migrações só acrescentam | Não | Nenhuma migração é criada ou alterada. Uma migração necessária leva a "Parado" e à retriagem; o passo de CI do G4 continua ativo. |

## Estratégia de testes

- **Nesta redação:** testes e validador de governança, `git diff --check`, revisão do diff, coerência de estados e referências, G3. Nenhum código, banco ou dado real foi executado para redigir o plano, salvo a conta da estimativa de bytes a partir dos números do relatório do ciclo `004`.
- **Casos de referência (unitários, `tests/unit/combinacao.test.mjs`):** fixture fictícia em `tests/fixtures/lentes/combinacao.json`, com o valor esperado escrito à mão a partir da tabela abaixo. Os valores esperados não são gerados pelo código nem copiados de uma saída dele. As lentes são calculadas pelas funções do ciclo `004` sobre a fixture. Na concentração, os casos usam `n` pequeno para exercitar o corte e os empates.

**Fixture base (fictícia).** Janela de 01/08 a 31/10/2026 (92 dias GMT). Municípios M1, M2 e M3. A concentração roda com `n` = 1: M1 tem 17 detecções, M2 tem 15 e M3 tem 2, então só M1 é destacado. Seis células, com as posições: A e B na faixa mais ao norte, com A a oeste de B; C, D e E numa faixa ao sul, de oeste para leste; F numa terceira faixa, mais ao sul. Datas em dias GMT de 2026.

| Célula | Detecções (município e dia) | Concentração (P1) | Recorrência | Persistência |
| :-- | :-- | :-- | :-- | :-- |
| A | 6 de M1 (20/08, 20/09, 05/10, 06/10, 07/10 e 25/10) e 4 de M2 (21/08, 21/09, 15/10 e 28/10) | Sim, evidência 6 | Sim (ago, set e out), evidência 10 | Sim, 1 sequência (05–07/10) |
| B | 5 de M2 (10/08, 20/09, 21/09, 22/09 e 10/10) | Não | Sim (ago, set e out) | Sim, 1 sequência (20–22/09) |
| C | 1 de M1 (15/09) | Sim, evidência 1 | Não | Não |
| D | 9 de M1 (03/08, 10/08, 03/09, 10/09, 17/09, 03/10, 10/10, 17/10 e 24/10) | Sim | Sim (ago, set e out) | Não |
| E | 6 de M2 (05/09, 06/09, 07/09, 20/09, 21/09 e 22/09) | Não | Não (só set) | Sim, 2 sequências |
| F | 1 de M1 (15/08) e 2 de M3 (25/08 e 05/09) | Sim, evidência 1 (minoria da célula) | Não (ago e set) | Não |

| Caso | Entrada | Esperado |
| :-- | :-- | :-- |
| CB-1 Interseção das três | Base, "e", as três | Só A, com 3 critérios na ordem concentração, recorrência e persistência |
| CB-2 União das três | Base, "ou", as três | A, B, C, D, E e F, nessa ordem (T13); B com recorrência e persistência; C e F só com concentração; D com concentração e recorrência; E só com persistência |
| CB-3 Pares | Base, "e" | concentração e recorrência: A e D; concentração e persistência: A; recorrência e persistência: A e B |
| CB-4 Projeção P1 e evidência (T9, T14) | Base, célula A | Critério da concentração com um destaque (`concentracao:municipio:<M1>`) e 6 `id_tecnico`, só de M1; ressalva "a célula também tem 4 de 10 detecções de município não destacado pela concentração"; evidência da recorrência com 10, da persistência com 3 e da união com 10 |
| CB-5 Projeção com 1 detecção | Base, célula C | C entra pela concentração (P1: pelo menos 1), sem ressalva de projeção |
| CB-6 Empate (D16) | Base com mais duas detecções de M2 em B (12/08 e 14/08): M1 = 17 e M2 = 17, `n` = 1 | M1 e M2 entram por empate; M3 não. As seis células entram pela concentração. B e E passam a ter o critério da concentração, com evidência só de M2. Em A, o critério da concentração tem 2 destaques (M1 com 6 detecções e M2 com 4), em ordem de código, e perde a ressalva de projeção. F mantém a ressalva "2 de 3" |
| CB-7 Persistência por célula e ressalvas por sequência (S1, T12, R1-1) | Base, célula E, "ou"; M2 com `incidencia_indeterminada` em 08/09 e `lacuna_conhecida` em 19/09, demais dias sem evidência de lacuna | Um único item E. O critério da persistência tem 2 destaques, na ordem de início: `persistencia:celula_005:<E>:2026-09-05`, com os dias 05 a 07/09, 3 detecções e a ressalva "adjacente a dia indeterminado (08/09); pode ser mais longa"; e `persistencia:celula_005:<E>:2026-09-20`, com os dias 20 a 22/09, 3 detecções e a ressalva "adjacente a dia com lacuna conhecida (19/09); pode ser mais longa". Nenhuma das duas ressalvas aparece na outra sequência. A evidência da célula une as 6 detecções |
| CB-8 Indisponível (I1) | Base na janela de 01/10 a 31/10 | "recorrência e persistência" e "concentração ou recorrência": `indisponivel`, sem células, com "recorrência não se aplica a esta janela: a janela toca 1 mês GMT; a recorrência exige pelo menos 3". "concentração e persistência" é calculada: M1 tem 8 detecções e M2 tem 3; resultado só A |
| CB-9 Sem células em comum (T11) | Base na janela de 01/08 a 31/08, "concentração e persistência" | A persistência fica `sem_destaques` (nenhum dia consecutivo em agosto); a combinação fica `sem_celulas`, com o texto de T11. Com "ou": A, D e F, as células com detecção de M1 em agosto (M1 = 4, M2 = 2, M3 = 1) |
| CB-10 Cobertura da célula (V1) | Base; M1 com `incidencia_indeterminada` em 03/08 e M2 com `lacuna_conhecida` em 07/08; demais dias sem evidência de lacuna | Célula A: municípios M1 e M2 (todos, inclusive o não destacado); "90 de 92 dias sem evidência de lacuna (cobertura não comprovada)", com 03/08 e 07/08 e a classe de cada município |
| CB-11 Cobertura pendente e falha | Como CB-10, sem a disponibilidade de M2; depois, com M2 em `falha` | Célula A primeiro `pendente`, depois `falha` ("cobertura não verificada"); a seleção e os critérios não mudam; o critério da persistência mostra "ressalvas de disponibilidade ainda não verificadas" |
| CB-12 Ressalvas por lente | Base na janela de 15/08 a 07/10, "recorrência e persistência" | A entra. No critério da recorrência, "inclui mês parcial" de agosto e de outubro; no da persistência, "sequência no limite da janela; pode ser mais longa" (a sequência termina em 07/10). Nenhuma ressalva aparece no critério de outra lente |
| CB-13 Entrada inconsistente (T8, T10) | Entrada com 10 registros e total do resumo 9; entrada com uma coordenada em notação exponencial; uma lente só; lente repetida; lente desconhecida; operador "xor" | Os dois primeiros lançam `ErroLente` ("leitura inconsistente"); os demais são entrada inválida. Nenhum produz células. A assinatura de `combinar` não aceita resultados de lente prontos, e o `typecheck` o garante |
| CB-14 Determinismo e identidade | Registros embaralhados e lentes escolhidas em outra ordem ("persistência, recorrência") | Resultado idêntico, com o mesmo `id_combinado` (lentes na ordem canônica) e a mesma ordem de células |
| CB-15 P1, e não maioria (R1-3) | Base, célula F, "ou" das três | F entra pela concentração com 1 de 3 detecções de município destacado, com evidência de 1 `id_tecnico` (o de 15/08) e a ressalva "a célula também tem 2 de 3 detecções de município não destacado pela concentração". A regra de maioria, rejeitada em Q2, não destacaria F |
| CB-16 União vazia (R1-4) | Entrada com janela de 01/05 a 31/07/2026, sem registros e com total do resumo 0 | As três lentes rodam (a recorrência toca 3 meses) e ficam `sem_destaques`. "ou" das três: `sem_celulas`, com "Nenhuma célula destacada por qualquer das lentes escolhidas nesta janela. Isso não indica ausência de focos nem de risco."; "e" das três: `sem_celulas`, com o texto do "e". Nenhum dos dois é `indisponivel` |

- **Conferência independente sobre a carga real (local, fora da CI):** `npm run conferir:combinacao` (`supabase db reset && node scripts/lentes/conferir-combinacao.mjs`). Como no ciclo `004`, o script parte do banco vazio, publica a carga real de `local/dados-prototipo/` pela CLI de carga e registra a identidade da carga no início e no fim. O SQL é escrito à parte, sem importar `src/lentes/`, e calcula as células T1 a partir do texto decimal de `saidas/deteccoes.csv` (convertido para `numeric`, sem `double`). O resultado do SQL é comparado, célula a célula, com o módulo alimentado pelas RPCs. Em cada janela, as 4 combinações de lentes (os 3 pares e as três) com os 2 operadores:
  - **janela inteira:** o SQL tem de reproduzir os números da exploração: "e" das três, 6 células; "ou" das três, 1.116; pares em "e": 77, 31 e 9; "ou" de concentração e recorrência, 1.090; "ou" de recorrência e persistência, 201. A união de concentração e persistência não foi medida na ideação e é registrada;
  - **01/08 a 31/10:** "e" das três, 1 célula; pares em "e": 14, 22 e 2;
  - **01/10 a 31/10:** toda combinação com a recorrência fica `indisponivel`; a de concentração e persistência é calculada e registrada;
  - **15/07 a 14/09:** bordas parciais (D14), registrada.

  Compara também os critérios de cada célula, as evidências por critério, os municípios da cobertura, o "N de M" e as ressalvas por lente. Qualquer diferença sem explicação leva a "Parado". Os números (agregados públicos), a identidade da carga e o commit entram em `005_research_conferencia_combinacao.md`.
- **Interface (E2E, `tests/e2e/06-combinacao.spec.mjs`):** fixture fictícia com células conhecidas em `tests/e2e/fixture.mjs`. Cobre:
  - escolha das lentes e do operador, a validação de menos de 2 lentes, a lista paginada, os retângulos no mapa e o painel por critério;
  - interseção vazia, união vazia e indisponibilidade, cada uma com o texto próprio de T11 e o aviso de domínio (R1-4);
  - painel com as sequências da persistência em itens separados, cada uma com suas ressalvas (R1-1);
  - configuração alterada durante a aplicação (R1-7), com respostas retidas: aplicar "concentração e recorrência", trocar o operador para "ou" e marcar a persistência antes de as respostas chegarem → o resultado, o mapa, o painel e o cabeçalho descrevem "concentração e recorrência", com o aviso "a configuração escolhida mudou; aplique de novo para atualizar"; "Aplicar lente" com 1 lente marcada sobre um resultado exibido → "escolha pelo menos 2 lentes", e o resultado continua o mesmo;
  - ressalva de projeção e cobertura "cobertura não comprovada", sem a palavra "coberto";
  - concorrência, com respostas retidas por `page.route`: uma lente individual retida e a combinação aplicada antes de ela terminar → só a combinação aparece; a combinação retida e "Nenhuma" → nada aparece depois;
  - perda de acesso e troca de versão durante a leitura da disponibilidade: `acesso_negado`, `sessao_expirada` e `carga_indisponivel` limpam tela, mapa, combinação e memória, como no ciclo `004`;
  - teclado, foco, 360/390 px com toque, 200% e reflow.
- **Medição:** `npm run medir:lentes` estendido com as 8 configurações da seção "Orçamento", repetindo as três lentes, com a mesma regra de aceite e de parada (mediana comprimida e maior total de bytes brutos entre as execuções válidas).
- **Ordem dos gates com carga real:** (1) unitários, `typecheck` e `build`; (2) `conferir:combinacao`; (3) `medir:lentes`; (4) `test:rls` e `test:e2e`. Todos os scripts de carga real começam por `supabase db reset`, recarregam a carga e falham se a identidade do fim diferir da do início.
- **Gates por PR:** `npm run test:governance`, `npm run check:governance`, `npm run typecheck`, `npm run build`, `npm run test:interface` (com os casos do ciclo `004` passando sem mudança), `npm run test:e2e`, `npm run test:rls` (sem mudança esperada), `git diff --check` e a inspeção do bundle (`tests/unit/bundle.test.mjs`). Na CI rodam os determinísticos; a conferência e a medição usam dados de `local/` e rodam só localmente, com resultado no relatório.

## Itens de implementação

### Item 1 — Regra de combinação e conferência independente

**Contexto:** a regra é o núcleo de G1. Entregá-la sem interface permite revisar a regra, os casos e a conferência isoladamente. O merge implanta código ainda não usado pela interface, sem efeito visível para o usuário.

**Ação técnica:** criar `src/lentes/combinacao.ts` (tipos, `VERSAO_COMBINACAO`, `combinar`, que calcula as lentes escolhidas sobre a entrada (T8), e a qualificação da célula com `qualificarCobertura` e, por sequência, `ressalvasDeClasse`), sem alterar os módulos existentes, exceto exportações estritamente necessárias; escrever a fixture e os casos CB-1 a CB-16; criar `scripts/lentes/conferir-combinacao.mjs`, reaproveitando `scripts/lentes/carga-real.mjs`, e o script `conferir:combinacao` em `package.json`, sem dependência nova; registrar a conferência em `005_research_conferencia_combinacao.md`; acrescentar à KB-005 a seção "Combinação" e ajustar seu limite de autoridade (template `.agent/templates/kb.md` lido no ponto de uso).

**Critérios de aceite:**

- [ ] O tipo `ResultadoCombinacao` e `combinacao-005-v1` estão definidos e documentados na KB-005. Nenhum tipo, campo ou resultado de C1 e das três lentes mudou: os casos do ciclo `004` passam sem alteração.
- [ ] Os casos CB-1 a CB-16 passam, com valores esperados escritos à mão.
- [ ] A conferência independente reproduz, por SQL escrito à parte, os números da exploração listados na estratégia de testes, nas quatro janelas e célula a célula, incluindo critérios, evidências, municípios da cobertura e ressalvas. O relatório registra a identidade da carga, o commit e qualquer diferença com sua explicação.
- [ ] Os gates passam, e nenhuma migração, função ou política é criada.

### Item 2 — Interface mínima da combinação, medição e roteiro de verificação

**Contexto:** expõe a combinação ao usuário com os estados e textos decididos. É a última entrega técnica do ciclo.

**Ação técnica:** integrar a combinação em `src/app.ts` (opção do seletor, leitura única, cálculo das lentes escolhidas, `combinar`, disponibilidade das células e `geracaoLente`); acrescentar o grupo de escolha, a lista paginada e o painel por critério em `src/apresentacao-lentes.ts` (ou num módulo novo `src/apresentacao-combinacao.ts`, se o arquivo crescer demais), em `index.html` e nos estilos existentes; desenhar as células com `definirDestaques`; escrever o E2E; estender `scripts/interface/medir-lentes.mjs`; registrar a medição no relatório; atualizar o guia da interface no runbook (seção 10) e a KB-005; preparar na task o roteiro de verificação em produção, com os valores locais esperados e a identidade da carga.

**Critérios de aceite:**

- [ ] A interface permite escolher 2 ou 3 lentes e o operador, e mostra a lista paginada, as células no mapa e o painel por critério, com motivo, evidência e ressalvas de cada destaque original (cada sequência da persistência em item próprio), a cobertura da célula, os parâmetros fixos, as versões, a carga e a configuração efetivamente aplicada, o aviso de domínio e as limitações da combinação.
- [ ] Nenhum texto, ordem ou número sugere ranking: não há "N lentes" como número nem ordenação por critério, e o texto "não é ranking" está visível.
- [ ] Os estados (carregando, completo, sem células em comum, sem células destacadas, indisponível, cobertura não verificada, leitura inconsistente, versão substituída, falha e cancelada) são distintos e testados no E2E, com a concorrência, a configuração alterada durante a aplicação e a perda de acesso da estratégia de testes.
- [ ] A medição das 8 configurações na janela inteira, repetindo as três lentes, segue o procedimento do ciclo `004` e a regra de bytes da seção "Orçamento". Fora do orçamento, ou sem 3 execuções válidas, a situação é "Parado", com as alternativas, antes da PR.
- [ ] A acessibilidade do ADR-007 é mantida, e a lista é a alternativa em texto ao mapa.
- [ ] O roteiro de verificação em produção está pronto na task. Ele só é executado depois de "autorizo a verificação em produção do ciclo 005".
- [ ] Os gates passam, e nenhuma migração, função ou política é criada.

## Arquivos afetados

- **Nesta redação:** este plano; a ideação (registro da autorização do rascunho, do novo artefato ativo e do handoff); a linha do ciclo `005` em `_project/cycles.md` (`Planejamento` e link do plano). Na correção v2, só este plano e a descrição do plano em `cycles.md` (R1-8).
- **Na execução proposta:** `src/lentes/combinacao.ts`; exportações mínimas em `src/lentes/*.ts`, se necessárias; `src/app.ts`; `src/apresentacao-lentes.ts` ou `src/apresentacao-combinacao.ts`; `src/mapa.ts` (só se a camada precisar de ajuste); `index.html`; `src/estilos/*.css` (só componentes novos, sem redesenho); `tests/unit/combinacao.test.mjs`; `tests/fixtures/lentes/combinacao.json`; `tests/e2e/06-combinacao.spec.mjs`; `tests/e2e/fixture.mjs`; `scripts/lentes/conferir-combinacao.mjs`; `scripts/interface/medir-lentes.mjs`; `package.json` (script `conferir:combinacao`, sem dependência nova); `docs/runbook.md` (seção 10); KB-005; `_project/drafts/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md`; e as tasks do ciclo. No encerramento: KB-003 (seleção explicável), README se cabível e o registro do ciclo.
- **Nunca:** `supabase/migrations/`, `supabase/tests/`, políticas, dados reais ou arquivos de `local/`.

## Decomposição em issues e PRs

| Unidade planejada | Issue a criar após aprovação e integração documental | Dependência | PR / fechamento |
| :-- | :-- | :-- | :-- |
| Plano completo | Sem issue documental | Revisão e aprovação do plano | `chore/cycle-005-plan`; inclui ideação, plano e registro do ciclo; merge próprio |
| Item 1 | `[FEATURE] Regra de combinação de lentes por célula de 0,05°` | Plano integrado e payload confirmado | `feature/issue-N`; uma PR; fecha a issue ao integrar |
| Item 2 | `[FEATURE] Interface mínima da combinação de lentes` | Item 1 integrado | `feature/issue-N`; uma PR; fecha a issue ao integrar; a verificação em produção vem depois e é registrada no encerramento |
| Encerramento | Sem issue | Itens integrados e verificação em produção registrada | `chore/cycle-005-closure`; encerramento prospectivo; merge próprio |

Os números de issue não existem nesta etapa. Cada payload é apresentado e confirmado antes da criação. A task `005_task_issue-N.md` é criada ao iniciar cada implementação.

## Dependências e blockers

- **Para aprovar o plano:** veredito apto em revisão formal; ratificação de T8 a T14, do contrato, dos textos, do orçamento e do fatiamento.
- **Para publicar a PR documental:** commit da ideação, do plano e do registro do ciclo em `chore/cycle-005-plan`, coberto pela aprovação do plano. Hoje nada está commitado.
- **Para a conferência e a medição:** Supabase local e a carga real local em `local/dados-prototipo/`, recarregável pelo runbook (seções 1 a 9). Sem ela, a conferência não pode ser dispensada: a situação passa a "Parado".
- **Para a verificação em produção:** deploy da `main` integrada, carga vigente hospedada igual à local conferida (mesma identidade) e o responsável disponível para executar o roteiro na própria sessão.
- **Para o retorno ao BL-005:** encerramento integrado em `main`; o registro e sua publicação seguem `gerenciar_backlog`, com autorização própria para publicar.

## Riscos, suposições e rollback

| Risco ou hipótese | Tratamento |
| :-- | :-- |
| Célula destacada por várias lentes lida como prova, "mais grave" ou prioritária | Sem ordem por critério nem número de lentes (T13); texto "não é ranking"; limitações da combinação e aviso de domínio sempre visíveis; revisão de textos na PR. |
| União dominada pela concentração reproduz o mapa dos 10 municípios | Limitação de projeção exibida; critérios nomeados por célula, de modo que a célula destacada só pela concentração aparece como tal. |
| "Nenhuma célula em comum" lido como ausência de risco | Texto de T11 e caso CB-9. |
| Lente sem aplicação lida como vazio | Estado `indisponivel` nomeando a lente (I1, T11); caso CB-8. |
| Volume da disponibilidade na união das três | Estimativa de cerca de 70 municípios como limite do orçamento de bytes; medição do pior caso e parada com alternativas, sem escolha do agente. |
| Mistura de cargas, janelas, versões ou registros | T8: as lentes são calculadas dentro de `combinar`, sobre a mesma entrada conferida; `geracaoLente` e a limpeza do ADR-007; casos CB-13 e CB-14. |
| Resultado exibido diferente da configuração do formulário | A configuração é gravada no resultado ao aplicar; o cabeçalho mostra a aplicada, com aviso quando o formulário mudou (R1-7); E2E com respostas retidas. |
| Conferência "independente" contaminada pelo módulo | SQL escrito à parte, sem importar `src/lentes/`; células pelo texto decimal da fonte; valores esperados dos casos fixados neste plano. |
| Mudança acidental nas lentes do ciclo `004` | Casos do ciclo `004` sem alteração; conferência repete as três lentes; mudar uma lente leva a "Parado". |
| Lista longa demais | Paginação de 50 células (Q9). |
| Deploy automático a cada merge | O item 1 não muda a interface; o item 2 entrega a combinação completa e qualificada; as aprovações de merge declaram o deploy. |

**Rollback:** a combinação não altera dados nem schema, então não há dado a restaurar. Reverter é uma PR de reversão, com aprovação de merge.

- A cadeia é 1 ← 2: a interface usa o módulo.
- **Retirar o item 2:** reversão do commit da issue; retira a opção do seletor, a interface, o E2E e os trechos do guia e da KB.
- **Retirar o item 1:** reverter antes o item 2. As duas reversões podem ir numa só PR, com um commit por item, do mais recente para o mais antigo, e todos os gates verdes no último commit.

Uma reversão não reabre nem arquiva o BL-005 automaticamente; o efeito sobre o item é relatado e decidido pelo responsável.

## Sequência recomendada

1. Revisar formalmente este rascunho e corrigir mediante autorização; obter "aprovo o plano do ciclo 005" depois de veredito apto.
2. Commitar e publicar a PR documental (`chore/cycle-005-plan`), conferir os checks e obter a aprovação do merge. Apresentar os dois payloads, confirmar e criar as issues.
3. Item 1: autorizar, implementar, conferir com a carga real, publicar a PR e aprovar o merge.
4. Item 2: autorizar, implementar, medir (parar se exceder), publicar a PR com o roteiro pronto e aprovar o merge (deploy).
5. "Autorizo a verificação em produção do ciclo 005": o responsável executa o roteiro, e o agente confere com a conferência local.
6. Encerramento prospectivo em `chore/cycle-005-closure`: KB-003, guia, relatório, plano `Concluído` e movimento para `executed/`, com merge próprio. Depois da integração comprovada, retorno ao BL-005 pela fila do backlog, com publicação autorizada à parte.

## Referências

- `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, `.agent/workflows/rascunhar_plano.md` e `.agent/templates/plano_implementacao.md`, lidos no ponto de uso em 2026-11-11.
- Ideação `005` (Q1 a Q9, exploração e verificações pedidas); `_project/backlog.md` (BL-005) em `2e31651`.
- Plano `004` v3 (contrato C1, T1 a T7, orçamento e procedimento de medição); `004_research_conferencia_lentes.md` (identidade da carga, números e bytes por parte); KB-005; KB-003; KB-004; ADR-005; ADR-007.
- `src/lentes/contrato.ts`, `comum.ts`, `cobertura.ts`, `grade.ts`, `carregar.ts`, `concentracao.ts`, `recorrencia.ts` e `persistencia.ts`; `src/app.ts` (`aplicarLente`, `MemoriaLente` e `geracaoLente`); `src/apresentacao-lentes.ts`; `index.html`; `package.json`.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | — |
| PR(s) | PR documental [#41](https://github.com/EuThiagoAndrade/rastro-quente/pull/41), aberta em 2026-11-11 |
| Branch(es) | Ideação: `chore/cycle-005-ideation`, sem commits próprios; plano: `chore/cycle-005-plan`, publicada, base `2e316513edc2b421de1a81c188017fb5de138dd2`, com a ideação, o plano e o registro do ciclo |
| Destino após conclusão | `_project/executed/005_combinacao_criterios_selecao/005_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 005 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #41 (https://github.com/EuThiagoAndrade/rastro-quente/pull/41)
Diga: "aprovo o merge da PR #41"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + atualizar_docs + aprovacao_publicacao_plano + v2@2e31651+rodada-2`
- `effect_class`: `remote_mutation`
- `state_before`: plano `v2` em `Em Revisão`, revisão formal `Concluída`, veredito `APTO COM RESSALVAS` (rodada 2), aprovação `Pendente`, situação `Aguardando aprovação do plano`. Branch `chore/cycle-005-plan` local em `2e31651`, sem commits próprios; ideação, plano e registro do ciclo não commitados. Nenhuma branch remota, PR ou issue do ciclo.
- `state_after`: plano `v2` `Aprovado` (`Aprovada em 2026-11-11`) por manifestação posterior ao parecer, com R2-1 e R2-2 incorporadas ao item 2. Lote documental publicado na PR #41, de `chore/cycle-005-plan` para `main`, aguardando checks e merge. Ciclo em `Planejamento`; nenhuma issue ou implementação.
- `result`: `executed`
- `evidence`:
  - manifestação humana literal "aprovo o plano do ciclo 005" em 2026-11-11, posterior à rodada 2;
  - `git fetch`, `git ls-remote` e `gh pr list` conferiram `origin/main` em `2e31651` e a ausência de branch remota, PR ou issue aberta do ciclo antes de publicar;
  - PR real https://github.com/EuThiagoAndrade/rastro-quente/pull/41;
  - lote limitado a ideação, plano e registro do ciclo; 55 testes de governança aprovados, validador sem erros ou avisos, `git diff --check` sem erros e varredura G3 sem e-mail ou UUID.
- `blockers`: nenhum para a publicação. A integração depende de checks verdes e de "aprovo o merge da PR #41". As issues dependem da integração documental e da confirmação dos payloads; nenhuma implementação está autorizada.

### Registro anterior — correção v2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + rascunhar_plano + 005_plan + v2@2e31651`
- `effect_class`: `local_mutation`
- `state_before`: plano `v1` em `Em Revisão`, veredito `REQUER NOVA RODADA` da rodada 1 (R1-1 a R1-6 bloqueadores; R1-7 e R1-8 ressalvas), situação `Aguardando correções (rodada 1)`; ciclo `005` em `Planejamento`; branch local `chore/cycle-005-plan` em `2e31651`, nada commitado.
- `state_after`: plano `v2` em `Em Revisão`, com resposta a R1-1 a R1-8 e a rodada 1 preservada; situação `Aguardando revisão (rodada 2)`; linha do ciclo em `_project/cycles.md` atualizada (R1-8). Nada commitado ou publicado.
- `result`: `executed`
- `evidence`: frase "corrija o plano do ciclo 005", em 2026-11-11; "Resposta do autor à rodada 1 — v2"; inspeção somente leitura de `src/apresentacao.ts` (cartão de Proveniência com a identidade integral), `supabase/migrations/20261107210000_esquema_dados.sql` (id por sequência) e `scripts/interface/medir-lentes.mjs` (`maxBytes` da passagem bruta); validador de governança na resposta da sessão.
- `blockers`: nenhum para a redação; rodada 2 pendente.

### Registro da redação — v1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + rascunhar_plano + 005_plan + v1@2e31651`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: antes, ideação `005` com Q1 a Q9 decididas, ciclo `005` em `Ideação`, sem plano, nada commitado, branch `chore/cycle-005-ideation`. Depois, autorização do rascunho registrada na ideação; plano `v1` em `Rascunho`; ciclo `005` em `Planejamento`; branch local `chore/cycle-005-plan` com as mesmas alterações, ainda não commitadas. Nenhuma publicação, issue ou PR.
- `result`: `executed`
- `evidence`: frase "Autorizo o rascunho do plano do ciclo 005", em 2026-11-11; este arquivo; linha do ciclo `005` em `_project/cycles.md`; validador de governança na resposta da sessão.
- `blockers`: nenhum para a redação; revisão formal pendente.

### Registro da revisão — rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + revisar_plano + 005_plan/rodada-1 + v1@2e316513edc2b421de1a81c188017fb5de138dd2`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v1` em `Rascunho`, revisão e aprovação pendentes, situação `Aguardando revisão (rodada 1)`. Ciclo `005` em `Planejamento`, branch `chore/cycle-005-plan` em `2e31651`, plano ainda sem commit.
- `state_after`: plano `v1` em `Em Revisão`, revisão `Em andamento`, veredito `REQUER NOVA RODADA`, aprovação pendente e situação `Aguardando correções (rodada 1)`. Ciclo `005` em `Planejamento`.
- `result`: `executed`
- `evidence`: cabeçalho, bloco `## Próximo passo` e parecer abaixo. O MCP GitHub Docker retornou HTTP 401. A consulta de leitura via `gh` e `git ls-remote` confirmou `main` remota em `2e31651`, ausência de PRs e issues abertas e ausência das duas branches remotas do ciclo.
- `blockers`: R1-1 a R1-6 bloqueiam um veredito apto.

### Registro da revisão — rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + revisar_plano + 005_plan/rodada-2 + v2@2e316513edc2b421de1a81c188017fb5de138dd2`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v2` em `Em Revisão`, com resposta do autor à rodada 1, veredito anterior `REQUER NOVA RODADA` e situação `Aguardando revisão (rodada 2)`. Ciclo em `Planejamento`, branch `chore/cycle-005-plan` em `2e31651`, plano ainda sem commit.
- `state_after`: plano `v2` em `Em Revisão`, revisão formal `Concluída`, veredito `APTO COM RESSALVAS`, aprovação humana pendente e situação `Aguardando aprovação do plano`. Ciclo em `Planejamento`.
- `result`: `executed`
- `evidence`: parecer da rodada 2, cabeçalho e bloco `## Próximo passo`. O MCP GitHub Docker retornou HTTP 401. `gh` e `git ls-remote` confirmaram `main` remota em `2e31651`, ausência de PRs e issues abertas e ausência das duas branches remotas do ciclo.
- `blockers`: nenhum. Ressalvas R2-1 e R2-2.

## Revisão crítica

### Rodada 1

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v1`, ainda sem commit, sobre `2e316513edc2b421de1a81c188017fb5de138dd2`.

#### Achados bloqueadores

- **R1-1 — T14 precisa representar cada sequência de persistência.** T9, T12 e CB-7 exigem datas, motivo e ressalvas por sequência, mas T14 descreve apenas um motivo e listas agregadas por critério. Na célula E, se 08/09 for indeterminado e 19/09 tiver lacuna conhecida, D15 associa cada dia à sequência vizinha correspondente. Aplicar o qualificador à lista achatada das duas sequências perde essas duas adjacências. Especifique no contrato e no painel como cada sequência preserva seu `id_destaque`, dias, evidência, motivo e ressalvas, além da união da evidência da célula. Faça CB-7 conferir o agrupamento e as duas adjacências. [Ideação, Q5 e Q7](../../ideations/005_combinacao_criterios_selecao.md#decisões-do-responsável--2026-11-11) · [Qualificador D15/T7](../../../src/lentes/cobertura.ts#L91).
- **R1-2 — T8 precisa distinguir consistência dos metadados e vínculo com a entrada.** `EntradaLente` contém carga, janela, registros, total e nomes. O recorte esperado vem de M1-a, a versão vem de `VERSAO_METODO` e os três totais vêm de `conferirEntrada`. Uma lente feita com dois registros de IDs `a,b` e outra entrada com `c,d` podem compartilhar os mesmos metadados e totais, deixando referências ausentes na evidência. Defina a origem dos valores comparados e onde se garante que cada resultado foi produzido a partir dos mesmos registros. Se a API continuar recebendo resultados separados, explicite o tratamento de evidência incompatível e cubra em CB-13 um resultado com metadados iguais e evidência ausente da entrada. [Contrato C1](../../../src/lentes/contrato.ts#L87) · [Conferência de entrada](../../../src/lentes/comum.ts#L10).
- **R1-3 — Os casos de referência precisam distinguir P1 de maioria.** Na célula A, 6 das 10 detecções são de município destacado. Na célula C, a única detecção também é de município destacado. A regra de maioria, rejeitada em Q2, passaria nos dois casos. Acrescente um caso em que apenas 1 de 3 detecções pertença a município destacado e fixe o destaque da célula e a evidência de 1 detecção como esperados. [Ideação, Q2](../../ideations/005_combinacao_criterios_selecao.md#q2-projeção-da-concentração-município--célula-se-d2-for-escolhida).
- **R1-4 — A união vazia precisa de texto e aceite próprios.** T11 usa “por todas as lentes” para o estado `sem_celulas`. A união fica vazia quando nenhuma das lentes escolhidas destaca qualquer célula. Uma janela de três meses com zero detecções permite calcular recorrência e persistência e obter esse resultado com “ou”. Especifique o texto correspondente ao operador, preserve o aviso de domínio e cubra no unitário e no E2E a união vazia, a interseção vazia e a indisponibilidade. [Estados e disponibilidade na ideação](../../ideations/005_combinacao_criterios_selecao.md#q6-lente-indisponível-ou-sem-aplicação-na-janela).
- **R1-5 — A verificação hospedada precisa comparar a identidade integral da carga.** O roteiro exige que coincidam o id e os 12 caracteres mostrados no cartão. O id vem de uma sequência de cada banco, então a mesma carga pode ser `id=1` localmente e `id=7` em produção. Use o SHA-256 completo, já disponível no cartão de Proveniência, para comparar os ambientes. Registre o id como referência no respectivo ambiente e explicite a parada se a identidade integral divergir ou estiver ausente. [Schema de cargas](../../../supabase/migrations/20261107210000_esquema_dados.sql#L8) · [Cartão de Proveniência](../../../src/apresentacao.ts#L424).
- **R1-6 — O gate precisa demonstrar a cobertura do orçamento para duas lentes.** A ideação pede a verificação do custo com duas ou três lentes. Medir a união das três limita o conjunto de municípios consultados, mas esse fato, por si só, não verifica o tempo das combinações de duas lentes. Inclua medição de pares ou especifique como demonstrar que o cenário de três limita o tempo e os bytes dos pares. Fixe também se o teto de bytes usa a maior execução bruta válida, como no script do ciclo `004`, para o aceite e a parada usarem a mesma regra. [Ideação, verificações pedidas](../../ideations/005_combinacao_criterios_selecao.md#decisões-do-responsável--2026-11-11) · [Gate atual](../../../scripts/interface/medir-lentes.mjs#L171).

#### Ressalvas

- **R1-7 — Configuração durante aplicação em curso.** O E2E cobre troca por nova aplicação e por “Nenhuma”. Defina também o que acontece se o usuário editar as caixas ou o operador enquanto há respostas pendentes, ou clicar em “Aplicar lente” com menos de duas escolhas. O teste deve conferir que o resultado, o mapa e o painel permanecem associados à configuração efetivamente aplicada. [Controlador atual](../../../src/app.ts#L499).
- **R1-8 — Atualizar o resumo do ciclo na próxima versão.** O registro de ciclos ainda descreve o plano como `v1 em rascunho`. A descrição deve acompanhar a próxima versão e a situação de revisão. [Registro de ciclos](../../cycles.md).

#### Itens atendidos

- O objetivo e o escopo incorporam as decisões Q1 a Q9, mantêm a ordem geográfica e preservam as limitações de interpretação das KB-003, KB-004 e KB-005.
- A separação da regra e da interface em dois itens mantém a dependência, os critérios de aceite por entrega, o rollback e a verificação hospedada visíveis. Os pontos de aprovação distinguem o plano, a implementação, cada merge e a verificação em produção.
- G1 e G3 se aplicam. A conferência SQL independente e as fixtures fictícias são compatíveis com essas barreiras. As justificativas de G2 e G4 são coerentes com o uso das RPCs existentes e a ausência de mudanças no banco. A inspeção foi documental e estática.

**Veredito:** `REQUER NOVA RODADA`. O autor deve responder aos achados na versão seguinte e submetê-la à revisão formal.

### Resposta do autor à rodada 1 — v2

- **Autor:** Claude Code (Opus 5.5)
- **Data:** 2026-11-11
- **Autorização:** "corrija o plano do ciclo 005"

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R1-1 — sequências da persistência | **Corrigido.** Cada critério passa a ter `destaques[]`, um item por destaque original, com `id_destaque`, motivo, evidência, datas e ressalvas próprios; a persistência tem um item por sequência. As ressalvas por classe são calculadas sequência a sequência com a cobertura da célula, nunca sobre a lista achatada. CB-7 confere o agrupamento e as duas adjacências (08/09 indeterminado e 19/09 com lacuna conhecida), cada uma só na sua sequência. O painel mostra cada sequência em item próprio | T9, T12, "Contrato da combinação", "Interface mínima", CB-7, E2E |
| R1-2 — vínculo com a entrada | **Corrigido com mudança de API.** `combinar(entrada, lentes, operador)` não recebe mais resultados prontos: calcula as lentes sobre a entrada conferida, e toda evidência vem dos mesmos registros por construção. A origem de cada valor está explicitada (entrada, M1-a, `VERSAO_METODO` e `conferirEntrada`). O cenário `a, b` contra `c, d` deixa de ser possível, e a assinatura é garantida pelo `typecheck` (CB-13). O custo de recalcular as lentes é só CPU sobre registros já em memória | T8, "Contrato da combinação", CB-13, "Ação técnica" do item 1 |
| R1-3 — P1 contra maioria | **Corrigido.** Nova célula F na fixture, com 1 detecção de M1 (destacado) e 2 de M3: P1 a destaca com evidência de 1 detecção e a ressalva "2 de 3"; a maioria não a destacaria (CB-15). As contagens da fixture foram refeitas (M1 = 17, M2 = 15 e M3 = 2) e CB-2, CB-6 e CB-9 incorporam F | Fixture base, CB-2, CB-6, CB-9, CB-15 |
| R1-4 — união vazia | **Corrigido.** T11 tem um texto para cada operador, ambos com "Isso não indica ausência de focos nem de risco." e o aviso de domínio visível. CB-16 cobre a união e a interseção vazias numa janela de 3 meses sem detecções, sem cair em `indisponivel`. O E2E cobre interseção vazia, união vazia e indisponibilidade | T11, "Interface mínima", CB-16, E2E |
| R1-5 — identidade integral | **Corrigido.** O roteiro compara o SHA-256 completo, lido no cartão de Proveniência; o id da carga é só referência dentro de cada ambiente. Identidade ausente ou divergente é parada em produção. O cabeçalho da combinação deixa de mostrar o prefixo de 12 caracteres | "Verificação em produção", "Interface mínima", "Pontos de aprovação", G3 |
| R1-6 — custo dos pares e regra de bytes | **Corrigido.** A medição local cobre as 8 configurações (3 pares e as três, com "e" e "ou"), em vez de depender de um argumento de inclusão. O teto de bytes usa o maior total bruto entre as execuções válidas da passagem bruta (`maxBytes`), como o script do ciclo `004`, e o aceite e a parada usam a mesma regra | "Orçamento e procedimento de medição", "Medição", critérios do item 2 |
| R1-7 — configuração durante a aplicação | **Corrigido.** A configuração é lida uma vez, ao aplicar, e gravada no resultado. Editar o formulário não cancela nem altera o que está em curso ou exibido, e o cabeçalho mostra a configuração aplicada, com aviso quando o formulário mudou. "Aplicar lente" com menos de 2 lentes não incrementa `geracaoLente` nem toca o resultado. O E2E cobre os dois cenários com respostas retidas | "Interface mínima", E2E, riscos |
| R1-8 — registro do ciclo | **Corrigido.** A linha do ciclo `005` em `_project/cycles.md` descreve "v2 em revisão; rodada 1: `REQUER NOVA RODADA`" | `_project/cycles.md` |

Nenhum achado foi contestado. Nenhuma decisão humana nova: T8 a T14 continuam propostas a ratificar na aprovação, agora com T8 na forma revisada.

### Rodada 2

- **Data:** 2026-11-11
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v2`, ainda sem commit, sobre `2e316513edc2b421de1a81c188017fb5de138dd2`.

#### Ressalvas

- **R2-1 — Ajustar a descrição da união na interface.** A frase “Combinar critérios torna a seleção mais específica” também aparece como limitação do resultado de “ou”. Na janela inteira, a união das três reúne 1.116 células, acima das 1.017 da concentração sozinha. Na revisão dos textos do item 2, descreva o efeito de cada operador e preserve o aviso sobre prioridade, gravidade e risco. [Ideação, Q3](../../ideations/005_combinacao_criterios_selecao.md#q3-operadores-e-composição).
- **R2-2 — Explicitar o perfil e a validade das medições hospedadas.** O limite de 20,0 s precisa de condições reproduzíveis. Ao preparar o roteiro do item 2, explicite o perfil do ciclo `004` no DevTools (150 ms de latência, 1,6 Mbit/s de descida, 750 kbit/s de subida e CPU 4× mais lenta). Conte 120 s a partir do clique e registre o motivo das tentativas inválidas, incluindo as que terminam com cobertura não verificada. [Plano 004, procedimento local e hospedado](../../executed/004_contrato_lentes_selecao/004_plan.md#orçamento-e-procedimento-de-medição-r1-5).

#### Itens atendidos

- **R1-1 e R1-2:** T14 preserva a evidência e as ressalvas por sequência, com adjacências verificáveis em CB-7. T8 calcula as lentes sobre uma única entrada conferida e identifica a origem do recorte, da versão e dos totais.
- **R1-3 e R1-4:** CB-15 distingue P1 de maioria com 1 de 3 detecções na célula F. T11 e CB-16 distinguem a união vazia, a interseção vazia e a lente indisponível, com cobertura prevista no E2E. A recontagem independente da fixture confirmou os totais e conjuntos esperados da base, de agosto e de outubro.
- **R1-5 e R1-6:** O roteiro de produção compara o SHA-256 integral da carga. O gate local mede as oito configurações e fixa a mediana comprimida e o máximo dos bytes brutos entre execuções válidas.
- **R1-7 e R1-8:** A configuração aplicada fica vinculada à lista, ao mapa e ao painel durante edições do formulário, com E2E de respostas retidas. O registro de ciclos identifica a v2 em revisão e o veredito histórico da rodada 1.
- A revisão documental confirmou a decomposição em duas entregas, os pontos de aprovação, a conferência independente de G1 e as restrições de privacidade de G3. G2 e G4 seguem justificados pelo uso das RPCs existentes e pela ausência de mudanças no banco.

**Veredito:** `APTO COM RESSALVAS`. Os seis bloqueadores da rodada 1 foram resolvidos. R2-1 e R2-2 cabem na revisão dos textos e na preparação do roteiro do item 2. O plano aguarda aprovação humana.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
