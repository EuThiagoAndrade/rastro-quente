# Plano de Implementação — Rótulos das lentes e espaço do mapa

> **Ciclo:** `009`
> **Status:** `Concluído`
> **Versão:** `v2`
> **Data de criação:** 2026-11-17
> **Última atualização:** 2026-11-17
> **Tipo:** `feature`
> **Prioridade:** `P2`
> **Nível:** `leve`
> **Autorização inicial:** "Confirmo o nível leve em modo contínuo e autorizo o plano do ciclo 009" em 2026-11-17
> **Modo contínuo:** `ativo`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO PARA APROVAÇÃO` (rodada 2)
> **Aprovação humana pós-revisão:** `Coberta pelo modo contínuo (autorização inicial de 2026-11-17)`
> **handoff_schema_version:** `2`

## Problema e contexto

**Problema.** Na tela de análise, não fica claro que as opções de lente da coluna esquerda produzem os resultados da coluna direita. Os títulos dos resultados são genéricos ("Células destacadas", "Municípios destacados"). Abaixo do mapa, três cartões ("No mapa", "Detecções no período (dias GMT)" e "Disponibilidade dos dados") ocupam espaço e não ajudam a leitura do responsável, que é o único usuário.

**Evidências no repositório (`main` em `171e078`).**

- `index.html`: seção `#secao-lente` com o resumo "Lente de seleção"; aba `#aba-destaques` com o texto "Destaques"; cartões `t-no-mapa`, `t-resumo` e `t-disp` dentro de `.rodape-mapa`.
- `src/apresentacao-resultado.ts`: `rotularAbaDestaques` escreve "Destaques · N"; `renderResumoLente` troca o título `#t-destaques` por "Células destacadas" ou "Municípios destacados".
- `src/apresentacao.ts`: `renderResumo` (total GMT, sensibilidade America/Cuiaba e versão consultada), `renderDisponibilidade`, `renderAvisoMapa`, `renderContagemMapa`, `renderSelecao` e `mostrarErroMapa`.
- `src/apresentacao-areas.ts`: estado da camada (`#areas-estado`), legenda duplicada (`#areas-legenda`, já coberta pela legenda do mapa desde a issue #71) e dados da área clicada (`#areas-selecao`), todos dentro do cartão "No mapa".
- `src/app.ts` (`abrirDetalhamento`): o detalhamento da ferramenta `consultar_disponibilidade`, fora da comparação, rola até `#t-disp`.

**Decisões do responsável (2026-11-17), registradas na triagem.**

- D1. **Nível leve, contra a proposta do agente.** O agente propôs ciclo completo, porque retirar o cartão de disponibilidade contraria o ADR-009 (a disponibilidade fica "no cartão próprio") e muda a orientação de leitura dos zeros da série. O responsável decidiu pelo leve em modo contínuo. Este plano registra a divergência. O ciclo não muda fonte, contagem, janela, geometria nem critério (ver G1).
- D2. **Sem o cartão "Disponibilidade dos dados" e sem avisos dele.** O cartão sai inteiro, com a tabela por dia e os "Motivos e avisos", e nenhuma nota o substitui. A disponibilidade continua onde já aparece fora do cartão: na explicação de cada destaque, na aba "Comparação" e nas ressalvas gerais de "Como ler esta tela" e do rodapé.
- D3. **Dados da área protegida clicada:** um bloco compacto abaixo do mapa, sem cartão nem título fixo, visível só com uma área selecionada.
- D4. **"Detecções no período":** sai tudo, exceto a série em barras e sua tabela alternativa. O total GMT, a sensibilidade America/Cuiaba e a versão consultada deixam de aparecer abaixo do mapa. A versão e a proveniência continuam em "Sobre os dados".
- D5. **Avisos e erros do mapa** (pontos indisponíveis, limites indisponíveis, limites simplificados, estado e falha da camada de áreas) deixam de ser mostrados. A contagem de pontos e o anúncio do registro selecionado continuam como texto só para leitor de tela, sem aparência visual, porque o `DESIGN.md` exige alternativa em texto do mapa.

**Consequências das decisões, conferidas na rodada 1.**

- C1 (D4, R1-1). `#total-principal` deixa de existir. Os testes e o helper `entrar` (`tests/e2e/ajuda.mjs`) passam a usar `#serie[data-total]`, que continua na tela e é igual ao total principal. As asserções de tela limpa (acesso negado, saída, versão substituída) passam a conferir que `#serie` não existe.
- C2 (R1-2). A KB-006 exige, junto da camada de áreas protegidas, o aviso `#areas-aviso` (áreas de outros estados, exclusões, contorno simplificado, "não indica infração, autoria nem situação fundiária") e a atribuição `#areas-atribuicao` (fonte, retrato, data e condições de uso). Eles **permanecem**, movidos para dentro do item `#legenda-areas` da legenda do mapa, com a contagem por classe. Não são avisos de disponibilidade nem de erro, então D5 não os alcança.
- C3 (D2, R1-3). O estado "zero" em `#estado-consulta` perde o trecho "veja a disponibilidade" e mantém "Zero detecções não comprova ausência de fogo nem cobertura." Num recorte com zero detecções, sem lente e sem comparação, a disponibilidade deixa de aparecer na tela, por decisão do responsável.
- C4 (R1-4). A nota do painel de perguntas "O detalhamento completo continua nas abas." passa a ressalvar a disponibilidade fora da comparação. `DESIGN.md` e ADR-011 recebem a mesma correção.
- C5 (D5, R1-7). Sem as mensagens, a falha ou a ausência da camada de áreas e a falha dos limites passam a desmarcar a caixa da camada sem texto visível, e o botão "Tentar de novo" das áreas sai; religar a caixa tenta de novo. A falha da consulta em `#estado-consulta` não muda. Os textos só para leitor de tela (contagem e seleção) ficam em `.rodape-mapa`, com a classe `so-leitor`, e continuam presentes no mapa ampliado.
- C6 (R1-8). O aviso de simplificação dos limites (ADR-007) sai de baixo do mapa; a limitação continua descrita em "Sobre os dados".
- C7 (R1-9). O rótulo "Lentes" é um título de seção (`rotulo-secao`) antes de "Seleção" e agrupa visualmente "Seleção", "Contexto territorial" e "Cruzar critérios". "Comparar" fica depois, sem mudança. Leitor de tela lê o título na ordem do documento.

**Alternativas consideradas.** Manter a disponibilidade (leve sem G1) ou ciclo completo com ideação. As duas foram recusadas pelo responsável.

## Objetivo

Deixar evidente qual lente produz cada resultado e dar mais área ao mapa, mantendo a série temporal e a "Lista de focos". Não alterar métodos, cálculos, critérios nem leitura de dados.

## Origem no backlog

- **BL-017 — Rótulos das lentes e espaço do mapa.** Parcela: o item inteiro.
  - **Síntese (snapshot):** na coluna esquerda, acrescentar o rótulo "Lentes" antes das opções e mudar "Lente de seleção" para "Seleção", mantendo "Contexto territorial" e "Cruzar critérios". Na coluna direita, mudar a aba "Destaques" para "Lentes", com o título do resultado identificando a opção ativa. Abaixo do mapa, retirar "No mapa", "Detecções no período (dias GMT)" e "Disponibilidade dos dados", mantendo a série em barras. Aumentar moderadamente a altura do mapa sem esconder a "Lista de focos". Atualizar só as referências desatualizadas de "Como ler esta tela". Não alterar métodos, cálculos ou critérios.
- **Referência:** `_project/backlog.md`, commit `171e078`, contido em `main` e em `origin/main`. Não é local nem pendente de publicação.
- **Destino em preparação.** O estado do item não muda agora. O retorno à fila (`ciclo 009 — AAAA-MM-DD — item inteiro`) só ocorre depois da integração comprovada em `main` e exige autorização separada para publicar.

## Contexto e baseline

- Interface do ciclo `007` (ADR-009, `DESIGN.md`) com os acréscimos do ciclo `008` (aba "Comparação", painel "Perguntar sobre a tela") e da issue #71.
- Computador (≥ 1.180 × 700 px): o mapa ocupa a linha `1fr` e `.rodape-mapa` tem altura automática até `38dvh`. Notebook: mapa de 520 px. Celular: mapa de 440 px.
- Testes E2E (Playwright sobre Supabase local) cobrem os cartões em `02-consulta`, `03-acessibilidade`, `04-versao`, `05-lentes`, `06-combinacao`, `07-areas`, `08-resultado`, `09-centro` e `12-comparacao`.

## Escopo

### Dentro do escopo

1. Coluna esquerda: rótulo "Lentes" antes de `#secao-lente`; resumo "Lente de seleção" passa a "Seleção".
2. Coluna direita: aba "Destaques" passa a "Lentes" ("Lentes · N" com resultado). O título `#t-destaques` mostra a opção ativa: "Concentração", "Recorrência", "Persistência", "Sobreposição com áreas protegidas" ou "Combinação de lentes"; sem lente, "Lentes".
3. Textos visíveis e nomes acessíveis (inclusive o `aria-label` de `#mapa`) que citam a aba "Destaques" passam a citar a aba "Lentes", sem mudar ids, atributos de estado nem a lógica. As menções restantes à sensibilidade em "Sobre os dados" são intencionais: o campo continua calculado e documentado.
4. Abaixo do mapa: retirar os cartões "No mapa", "Detecções no período (dias GMT)" e "Disponibilidade dos dados", conforme D2 a D5. A série (`#serie-corpo`) fica num bloco sem título visível, com nome acessível próprio.
5. Dados da área clicada conforme D3. Contagem por classe, aviso e atribuição das áreas passam para `#legenda-areas` (C2).
6. Detalhamento de `consultar_disponibilidade` fora da comparação: sem destino na tela, o painel de perguntas não oferece o atalho; as evidências continuam no próprio painel (C4). Estado "zero" conforme C3.
7. Altura do mapa: computador com `.rodape-mapa` limitada a `30dvh`; notebook com 600 px; celular com 480 px. A "Lista de focos" aberta continua visível e com rolagem própria (C5 para os textos só para leitor de tela).
8. "Como ler esta tela": trocar "aba Destaques" por "aba Lentes" e retirar a menção ao campo de sensibilidade, que deixa de aparecer na tela. A ressalva geral de disponibilidade permanece.
9. Documentação viva: `DESIGN.md`, emendas datadas no ADR-007 (estados e aviso de simplificação), no ADR-009 (cartões, abas e "a disponibilidade fica no cartão próprio") e no ADR-011 (detalhamento nas abas), `docs/runbook.md`, KB-005 e KB-006 só onde citam o que muda; encerramento prospectivo do ciclo.

### Fora do escopo

- Métodos, cálculos, critérios, parâmetros e textos de ressalva das lentes, da comparação e dos agentes.
- Leituras e RPCs: o resumo e a disponibilidade continuam sendo lidos, porque a conferência da leitura completa (ADR-009, T7), a explicação dos destaques e a comparação dependem deles.
- Aba "Comparação", painel "Perguntar sobre a tela", "Lista de focos", controles e legenda do mapa, tela de acesso.
- Mudanças de schema, RLS, função no servidor e dependências.
- BL-018 e demais itens do backlog.

## Decisões e autoridades

- Contrato visual `DESIGN.md`, atualizado neste ciclo nas seções de componentes, layout, estados e acessibilidade afetadas.
- ADR-009 (interface base), ADR-007 (estados da consulta) e ADR-011 (painel de perguntas): emendas datadas que registram D2, D4, D5 e C4, sem reescrever o histórico.
- KB-006 (áreas protegidas): aviso e atribuição mantidos junto da camada, agora na legenda do mapa (C2).
- KB-005 (textos da aba de resultado) e `docs/runbook.md`: só as referências que ficarem desatualizadas.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Promoção do plano (modo contínuo) | Veredito `APTO PARA APROVAÇÃO`, preflight do modo contínuo | Plano `Aprovado` como `Coberta pelo modo contínuo` | Merge | Veredito e preflight registrados |
| Autorizar implementação (modo contínuo) | Plano promovido e issue criada | Branch, task, implementação, gates e abertura da PR | Merge, ação externa, verificação em produção | Issue e task |
| Aprovar merge | Checks verdes na PR | "aprovo o merge da PR #N" | Retorno ao backlog e sua publicação | Checks, diff e encerramento prospectivo |

A cadeia para em "Parado" em qualquer parada obrigatória do modo contínuo, em especial se surgir mudança de método, dúvida de escopo ou checks falhando depois de duas tentativas.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Não | Nenhuma fonte, versão, contagem, janela, geometria, projeção, sobreposição ou critério muda; as leituras e conferências continuam iguais. A retirada da disponibilidade, da sensibilidade e dos avisos (inclusive o de simplificação dos limites, que continua em "Sobre os dados") é decisão de apresentação do responsável (D1, D2, D4, D5), registrada nas emendas dos ADRs. O aviso e a atribuição das áreas protegidas (KB-006) permanecem (C2). As ressalvas "não comprovam incêndio, dano, autoria ou infração" e "disponibilidade é separada da detecção" permanecem. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Sem mudança de banco, RPC, sessão ou função no servidor. |
| G3 — privacidade de dados | Não | Só interface e documentação; os testes usam as fixtures fictícias existentes. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Estratégia de testes

- `npm run typecheck`, `npm run typecheck:servidor`, `npm run build` e `npm run test:interface`.
- `npm run test:e2e` (Supabase local): ajustar os testes que leem os cartões retirados para o comportamento novo, inclusive `tests/e2e/ajuda.mjs`, `01-acesso`, `11-ajustes-tela`, `13-perguntas` e `scripts/interface/medir-*.mjs` (C1). Os testes de estado da sensibilidade, da disponibilidade e dos avisos do mapa saem; os de contagem e seleção passam a ler o texto só para leitor de tela. Acrescentar asserções para os rótulos "Lentes" e "Seleção", o título da opção ativa, a ausência dos cartões e a altura do mapa (critério numérico do item 1).
- `node --test scripts/validate-governance.test.mjs`, `node scripts/validate-governance.mjs`, `git diff --check`.

## Itens de implementação

### Item 1 — Rótulos das lentes e área abaixo do mapa

**Contexto:** BL-017 com as decisões D1 a D5.

**Ação técnica:** alterar `index.html`, `src/apresentacao-resultado.ts`, `src/apresentacao-lentes.ts`, `src/apresentacao-areas.ts`, `src/apresentacao-combinacao.ts`, `src/apresentacao.ts`, `src/app.ts`, `src/apresentacao-agentes.ts` (se o atalho exigir) e os estilos `src/estilos/*.css`; ajustar os testes E2E e a documentação viva; preparar o encerramento prospectivo.

**Critérios de aceite:**

- [ ] A coluna esquerda mostra o rótulo "Lentes" antes da seção "Seleção"; "Contexto territorial", "Cruzar critérios" e "Comparar" não mudam.
- [ ] A aba da coluna direita se chama "Lentes" ("Lentes · N" com resultado) e o título do resultado é o nome da opção ativa nos cinco casos.
- [ ] Abaixo do mapa não há os cartões "No mapa", "Detecções no período (dias GMT)" e "Disponibilidade dos dados" nem `#total-principal`, `#disp-corpo`, `#mapa-aviso` e `#mapa-erro`; a série em barras e a "Ver a série como tabela" continuam, e `#serie[data-total]` é igual ao total principal da fixture.
- [ ] Com a camada de áreas ligada, `#legenda-areas` mostra a contagem por classe, `#areas-aviso` e `#areas-atribuicao`.
- [ ] O estado "zero" não cita a disponibilidade, e o painel de perguntas não oferece atalho para a disponibilidade fora da comparação.
- [ ] Clicar numa área protegida mostra o bloco compacto com os mesmos dados de hoje e o foco no título; sem área selecionada, o bloco não aparece.
- [ ] A contagem de pontos e o anúncio do registro selecionado continuam acessíveis por leitor de tela e não aparecem visualmente.
- [ ] Altura do mapa: em 1.366 × 768, a altura de `.mapa-cartao` é maior que a medida em `main` (`171e078`) no mesmo viewport, com a referência registrada na task; no notebook (1.024 × 768), 600 px; no celular (375 × 812), 480 px. Com a "Lista de focos" aberta, o título `#t-lista-focos` fica dentro da janela no computador.
- [ ] "Como ler esta tela" cita a aba "Lentes" e mantém a ressalva de disponibilidade.
- [ ] Nenhum resultado de lente, comparação ou agente muda (E2E de lentes, combinação, áreas e comparação verdes).
- [ ] `DESIGN.md`, ADR-007, ADR-009, ADR-011, KB-005, KB-006 e runbook atualizados; encerramento prospectivo na mesma PR.

## Arquivos afetados

- `index.html`, `src/apresentacao.ts`, `src/apresentacao-resultado.ts`, `src/apresentacao-lentes.ts`, `src/apresentacao-areas.ts`, `src/apresentacao-combinacao.ts`, `src/apresentacao-agentes.ts`, `src/app.ts`, `src/estilos/*.css`.
- `tests/e2e/ajuda.mjs` e os `tests/e2e/*.spec.mjs` afetados e, se necessário, `tests/unit/*.test.mjs` e `scripts/interface/medir-*.mjs`.
- `DESIGN.md`, `_project/decisions/ADR-007_interface_consulta_prototipo.md`, `_project/decisions/ADR-009_interface_base.md`, `_project/decisions/ADR-011_funcao_explicacao_servidor.md`, `_project/knowledge/KB-005_contrato_lentes_selecao.md`, a KB-006 de áreas protegidas, `docs/runbook.md`.
- `_project/cycles.md`, este plano e a task do item 1 (movidos para `executed/` no encerramento).

## Decomposição em issues e PRs

Uma issue `[FEATURE]` e uma PR, que leva o plano, a implementação, a documentação viva e o encerramento prospectivo. A divisão em mais PRs não reduz risco, porque as mudanças tocam os mesmos arquivos.

## Dependências e blockers

Nenhum. Docker e Supabase local disponíveis para o E2E.

## Riscos, suposições e rollback

- **Risco:** perder uma informação útil sem perceber. Mitigação: inventário em "Problema e contexto" e decisões D2 a D5 explícitas.
- **Risco:** quebra de testes de agentes e comparação que dependem do atalho para `#t-disp`. Mitigação: E2E completo antes da PR.
- **Suposição:** o responsável lê a disponibilidade pela explicação e pela comparação quando precisar.
- **Rollback:** reverter o squash da PR; nenhuma migração nem dado envolvido.

## Sequência recomendada

Revisão formal → promoção → issue → branch e task → interface → testes → documentação → encerramento prospectivo → PR → aprovar merge.

## Referências

- `_project/backlog.md` › BL-017 (commit `171e078`).
- `DESIGN.md`; ADR-007; ADR-009; KB-005; `docs/runbook.md`.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | [#91](https://github.com/EuThiagoAndrade/rastro-quente/issues/91) |
| PR(s) | — |
| Branch(es) | `feature/issue-91` |
| Destino após conclusão | `_project/executed/009_rotulos_lentes_espaco_mapa/009_plan.md` (movido no encerramento prospectivo) |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 009 (leve)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 009 + rascunhar_plano + 009_plan + v2`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Em Revisão` v1 com `REQUER NOVA RODADA` / plano `Em Revisão` v2, aguardando a rodada 2
- `result`: `executed`
- `evidence`: este arquivo (v2, resposta à rodada 1) e a linha do ciclo `009` em `_project/cycles.md`
- `blockers`: nenhum

## Revisão crítica

### Rodada 1

- **Data:** 2026-11-17
- **Autor:** Claude Code (claude-opus-5-5)
- **Revisor:** Claude Code, subagente revisor (claude-opus-5-5)
- **Base:** plano local `v1` (`Rascunho`), sem commit próprio, sobre `171e078`. Inspeção somente leitura de `index.html`, `src/apresentacao.ts`, `src/apresentacao-resultado.ts`, `src/apresentacao-areas.ts`, `src/apresentacao-agentes.ts`, `src/apresentacao-comparacao.ts`, `src/app.ts`, `src/estilos/layout.css`, `tests/e2e/`, `tests/unit/`, `scripts/interface/`, `DESIGN.md`, ADR-007, ADR-009, ADR-011, KB-004 a KB-007 e `docs/runbook.md`.

As decisões D1 a D5 do responsável não são reabertas. Os achados tratam do inventário, da coerência documental e da verificabilidade.

#### Achados bloqueadores

- **R1-1. A âncora `#total-principal` dos testes sai com o cartão, e o inventário de testes está incompleto.** `#total-principal` é renderizado por `renderResumo` dentro do cartão "Detecções no período", que D4 retira. O helper `entrar` de `tests/e2e/ajuda.mjs` espera esse elemento visível (`esperar === 'dados'`), então todo o E2E depende dele. Também o usam `01-acesso` (9 ocorrências), `13-perguntas` (5), `scripts/interface/medir-geometria.mjs` e, por `#mapa-contagem`, `medir-lentes.mjs`. Nenhum deles aparece na lista da baseline. Há um risco maior: as asserções negativas `toHaveCount(0)` de `01-acesso` (negado, logout, expiração) e de `04-versao` (versão substituída) passam a valer sempre, porque o elemento deixa de existir, e deixam de provar que nada da consulta ficou na tela. `11-ajustes-tela`, que mede a altura da página, também é afetado pela mudança de layout. Corrigir: (a) listar esses arquivos; (b) nomear o oráculo substituto, por exemplo `#serie[data-total]` ou `#serie-legenda`, que continuam; (c) exigir que toda asserção negativa migre para um elemento que ainda exista; (d) reescrever o critério "`data-total` igual ao total principal" com um valor verificável, como o total esperado da fixture, já que o total principal deixa de aparecer na tela.
- **R1-2. `#areas-legenda` não é só uma legenda duplicada.** O escopo, item 5, e o contexto dizem que a legenda do mapa "já traz as três classes". `renderLegendaAreas` grava ali mais três coisas: a contagem de áreas por classe; `#areas-aviso`, com áreas de outros estados só quando há detecção, exclusões (RPPN, TI em estudo, zonas de amortecimento), contorno simplificado até cerca de 550 m com classificação pelo polígono integral e "não indica infração, autoria nem situação fundiária"; e `#areas-atribuicao`, com fonte, retrato, data e condições de uso, como "reprodução com citação". A KB-006 (linha 45) estabelece que "a legenda e o cartão de Proveniência citam fonte, retrato, data e condições de uso, e a legenda avisa que áreas de outros estados sem detecção desta carga não aparecem". D2 a D5 não decidem retirar o aviso nem a atribuição junto à camada. Corrigir: manter `#areas-aviso` e `#areas-atribuicao` perto da camada, por exemplo dentro de `#legenda-areas` na "Legenda" do mapa; declarar o destino da contagem por classe; e incluir a KB-006 na documentação viva. Se o autor preferir retirar esses textos, a mudança passa a exigir decisão nova do responsável.
- **R1-3. O estado "zero" remete ao cartão retirado.** O texto de `renderEstadoConsulta` (`src/apresentacao.ts`, estado `zero`) termina em "veja a disponibilidade". Num recorte com zero detecções, sem lente e sem comparação, a disponibilidade não aparece em lugar nenhum da tela depois de D2, porque não há destaque a explicar. O ADR-009 (série, linha 39) também diz que "a disponibilidade fica no cartão próprio". Corrigir: inventariar o texto, trocar só a remissão e manter "Zero detecções não comprova ausência de fogo nem cobertura". A frase do ADR-009 entra na emenda.
- **R1-4. O painel de perguntas promete um detalhamento que deixa de existir.** O item 6 só retira o atalho de `consultar_disponibilidade`. Mas a nota fixa de `blocoEvidencias` (`src/apresentacao-agentes.ts`) diz "O detalhamento completo continua nas abas." O `DESIGN.md`, linha 87, diz que cada evidência tem "Ver o detalhamento na tela". O ADR-011, linha 72, diz que "o detalhamento sem IA continua disponível". Para "Há lacunas nos dados?" fora da comparação, isso deixa de ser verdade, e o ADR-011 não está entre as emendas. Corrigir: listar a nota do painel, o `DESIGN.md` (painel de perguntas) e uma emenda datada no ADR-011, ou justificar por que ele não precisa de emenda. Acrescentar o critério de aceite correspondente: sem detalhamento na tela, a evidência não oferece o botão e a nota não afirma o contrário.

#### Ressalvas

- **R1-5. Textos não visíveis e remanescentes.** O item 3 limita a troca a "textos visíveis", mas o nome acessível do mapa (`#mapa`, `aria-label` "A Lista de focos e a aba Destaques são a alternativa em texto.") é justamente a alternativa em texto que o `DESIGN.md` (linha 125) exige. Incluir nomes acessíveis (`aria-label`) e os comentários de documentação. A nota da série (`#serie-legenda`, "sem o envelope da sensibilidade") e a de "Sobre os dados" continuam citando a sensibilidade. Isso é coerente com D4, mas convém registrar que elas ficam de propósito.
- **R1-6. Critério de altura sem número.** "O mapa fica mais alto nos três tamanhos" não diz contra qual medida. Fixar viewports e valores, por exemplo: em 1440 × 900, altura de `.mapa-cartao` maior que a da baseline medida em `171e078`; notebook 600 px; celular 480 px. Fixar também a condição "Lista de focos aberta visível", por exemplo o título `#t-lista-focos` dentro da viewport em 1440 × 900 e 1280 × 720, e manter `scrollHeight ≤ 900` de `11-ajustes-tela`.
- **R1-7. Comportamentos silenciosos depois de D5.** Hoje, em falha, leitura inconsistente ou "sem camada", `mostrarAreas` desmarca `#c-areas`. Sem `#areas-estado`, a caixa volta a ficar desmarcada sem explicação e o botão "Tentar de novo" (`#botao-areas-tentar`) some. O mesmo vale para a falha dos limites (`mostrarErroMapa`). Isso decorre de D5, mas deve constar na seção de estados do `DESIGN.md` e do runbook (linha 143, que lista esses estados), e o teste de `07-areas` (linha 513) deve passar a verificar a caixa desmarcada. Dizer também onde ficam os textos só para leitor de tela e o bloco da área selecionada: a regra `.mapa-ampliado .rodape-mapa > :not(#aviso-fundo, #lista-focos)` os esconde no mapa ampliado. Hoje é igual, mas convém declarar.
- **R1-8. Justificativa de G1 incompleta.** A justificativa cita as ressalvas que permanecem, mas não cita a que sai: a frase de simplificação dos limites (`#mapa-aviso`, exigida pelo ADR-007, linha 39). Registrar que essa limitação continua em "Sobre os dados" › "Limitações" ("Os limites do mapa podem ser uma representação simplificada…"), o que sustenta G1 `Não`, e incluir a frase do ADR-007 na emenda.
- **R1-9. Alcance do rótulo "Lentes".** Dizer se o rótulo agrupa só "Seleção", "Contexto territorial" e "Cruzar critérios", ou também "Comparar", que vem logo depois e não é lente. Definir também a semântica para leitor de tela: título, `role="group"` com `aria-labelledby` ou rótulo só visual. Incluir isso no critério de aceite.

#### Itens atendidos

- O cabeçalho do nível leve está completo: `Autorização inicial`, `Modo contínuo: ativo` e versão `v1`. A frase confere com a linha do ciclo `009` em `_project/cycles.md`, que está em `Planejamento`.
- As decisões D1 a D5 estão registradas e datadas, assim como a divergência com a proposta de ciclo completo e as alternativas recusadas. As emendas datadas dos ADR-007 e ADR-009 estão previstas, sem reescrever o histórico.
- Fatos conferidos: em `index.html`, `#secao-lente` com "Lente de seleção", `#aba-destaques` "Destaques", os cartões `t-no-mapa`, `t-resumo` e `t-disp` em `.rodape-mapa`, e `#serie-corpo`; `rotularAbaDestaques` e `renderResumoLente` ("Células destacadas" e "Municípios destacados"); `renderResumo`, `renderDisponibilidade`, `renderAvisoMapa`, `renderContagemMapa`, `renderSelecao` e `mostrarErroMapa`; `abrirDetalhamento` rolando até `#t-disp`; `max-height: 38dvh`, 520 px e 440 px em `layout.css`; os nomes das cinco opções no seletor; e BL-017 em `171e078`, contido em `origin/main`.
- O não-escopo preserva as leituras e RPCs: T7 do ADR-009, explicação dos destaques e comparação. Também ficam de fora métodos, ressalvas das lentes e dos agentes, schema, RLS e dependências.
- G2, G3 e G4 estão corretamente marcados `Não`. G1 `Não` é coerente com a definição de `_project/README.md`, porque nenhuma fonte, contagem, janela, geometria ou critério muda, desde que R1-8 seja atendido.
- A tabela de pontos de aprovação está correta para o leve em modo contínuo: promoção só com `APTO PARA APROVAÇÃO`, merge fora da cobertura, paradas obrigatórias citadas.
- Uma issue e uma PR com encerramento prospectivo, e rollback sem migração.
- Nenhum dado pessoal, credencial ou dado operacional restrito no plano.

#### Veredito

`REQUER NOVA RODADA`. Os quatro bloqueadores são inventário e coerência documental que o autor pode corrigir sem nova decisão humana, salvo se, em R1-2, ele optar por retirar o aviso e a atribuição das áreas. Com o modo contínuo ativo, a cadeia segue para a correção da `v2`.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 009 + revisar_plano + 009_plan/rodada-1 + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Rascunho` v1, revisão `Pendente` / plano `Em Revisão` v1, rodada 1 com `REQUER NOVA RODADA`
- `result`: `executed`
- `evidence`: esta seção e os campos `Status`, `Revisão formal` e `Veredito da revisão` do cabeçalho
- `blockers`: R1-1 a R1-4, corrigíveis pelo autor

### Resposta do autor à rodada 1

- **R1-1 — corrigido:** C1, critério de aceite e estratégia de testes com `#serie[data-total]` e os arquivos citados.
- **R1-2 — corrigido:** C2; aviso e atribuição permanecem na legenda do mapa; KB-006 incluída.
- **R1-3 — corrigido:** C3 e emenda do ADR-009 sobre "a disponibilidade fica no cartão próprio".
- **R1-4 — corrigido:** C4 e emenda do ADR-011.
- **R1-5 — corrigido:** item 3 inclui nomes acessíveis; menções restantes à sensibilidade declaradas intencionais.
- **R1-6 — corrigido:** critério numérico com viewports e condição da "Lista de focos".
- **R1-7 — corrigido:** C5 documenta o comportamento silencioso decidido em D5 e a posição dos textos só para leitor de tela.
- **R1-8 — corrigido:** C6 e justificativa de G1.
- **R1-9 — corrigido:** C7.

### Rodada 2

- **Data:** 2026-11-17
- **Autor:** Claude Code (claude-opus-5-5)
- **Revisor:** Claude Code, subagente revisor (claude-opus-5-5)
- **Base:** plano local `v2`, sem commit próprio, sobre `171e078`. Inspeção somente leitura das respostas à rodada 1, de C1 a C7 e dos trechos de código e CSS citados (`limparResultados`, `.mapa-ampliado .rodape-mapa`, `.flutuante--legenda` em `componentes.css` e media queries de `layout.css`).

#### Conferência da rodada 1

- **R1-1 — atendido.** C1 adota `#serie[data-total]`, que `renderSerie` grava com o total principal e que `limparResultados` e o caminho de erro de `app.ts` removem; por isso a asserção "`#serie` não existe" prova a tela limpa. A estratégia lista `ajuda.mjs`, `01-acesso`, `11-ajustes-tela`, `13-perguntas` e `medir-*.mjs`, e o critério compara com o total da fixture.
- **R1-2 — atendido.** C2 mantém `#areas-aviso`, `#areas-atribuicao` e a contagem por classe em `#legenda-areas`, com critério próprio; a KB-006 entra na documentação. A legenda flutuante já tem `max-height` e `overflow: auto` (`componentes.css`), então o texto a mais rola dentro dela.
- **R1-3 — atendido.** C3 troca só a remissão do estado "zero"; a emenda do ADR-009 está prevista.
- **R1-4 — atendido.** C4 e o item 9 preveem a correção da nota do painel, do `DESIGN.md` e do ADR-011; o critério cobre o atalho.
- **R1-5 a R1-9 — atendidos.** Nomes acessíveis no item 3; critério de altura com viewports compatíveis com as media queries (1.366 × 768 é computador; 1.024 × 768, notebook; 375 × 812, celular), e com `#lista-focos` antes da série em `.rodape-mapa`, o título fica no alto do bloco; C5 declara o comportamento silencioso e a posição dos textos só para leitor de tela; C6 e G1 citam o aviso de simplificação que sai; C7 define o alcance do rótulo "Lentes".

Nenhum achado corrigido reaparece como exigência nova.

#### Achados bloqueadores

Nenhum.

#### Ressalvas

Estas ressalvas não exigem decisão do responsável e podem ser resolvidas na task da implementação.

- **R2-1. Restos de texto da v1 que contradizem C2 e C4.** As "Evidências no repositório" ainda chamam `#areas-legenda` de "legenda duplicada, já coberta pela legenda do mapa". O "Fora do escopo" ainda lista "legenda do mapa" e o painel "Perguntar sobre a tela", que C2 e C4 alteram. Em "Referências", faltam o ADR-011 e a KB-006. Prevalecem C2, C4 e o item 9. Registrar isso na task ou ajustar o texto no encerramento.
- **R2-2. Falta critério para a nota do painel e para o teste de `07-areas`.** O critério do item 1 cobre o atalho, mas não a nova redação da nota "O detalhamento completo continua nas abas." (C4). A estratégia retira os testes de estado das áreas, mas não diz que `07-areas` deve passar a conferir `#c-areas` desmarcada em "sem camada" (C5). Acrescentar as duas asserções na task.
- **R2-3. Bloco da área selecionada no mapa ampliado.** C5 garante os textos só para leitor de tela no mapa ampliado, mas não diz se o bloco compacto de D3 aparece ali. Hoje ele fica escondido pela regra `.mapa-ampliado .rodape-mapa > :not(…)`. Declarar a escolha no `DESIGN.md`.

#### Itens atendidos

- Todos os itens atendidos da rodada 1 continuam válidos. A v2 não muda nível, modo contínuo, barreiras, pontos de aprovação nem decomposição.
- G1 `Não` está justificado, com o aviso de simplificação que sai e as ressalvas que permanecem. As ressalvas de domínio das áreas protegidas (KB-006) continuam na tela.
- As decisões D1 a D5 do responsável estão preservadas, e as consequências C1 a C7 decorrem delas sem ampliar o escopo.
- O plano não contém dados pessoais, credenciais nem dados operacionais restritos.

#### Veredito

`APTO PARA APROVAÇÃO`. Os bloqueadores da rodada 1 foram corrigidos e as ressalvas R2-1 a R2-3 não exigem decisão humana. No modo contínuo ativo, a promoção cabe a `criar_issues`, depois do preflight. Este veredito não equivale a aprovação.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 009 + revisar_plano + 009_plan/rodada-2 + v2`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Em Revisão` v2, aguardando a rodada 2 / plano `Em Revisão` v2, rodada 2 com `APTO PARA APROVAÇÃO`
- `result`: `executed`
- `evidence`: esta seção e os campos `Revisão formal` e `Veredito da revisão` do cabeçalho
- `blockers`: nenhum

## Pós-mortem

- **Data de conclusão:** 2026-11-17 (encerramento prospectivo; vale com o merge da PR da issue #91).
- **Desvios:** (1) nível leve por decisão do responsável, contra a proposta de ciclo completo do agente (D1); (2) o título da aba Lentes passou a mostrar a opção ativa também sem resultado (janela insuficiente, falha), para cumprir o critério dos cinco casos; (3) ressalvas R2-1 a R2-3 resolvidas na task.
- **Lições comprovadas:** ao retirar elementos da tela, procurar todos os ids também em laços e listas de limpeza; o helper `$` lança erro com id ausente, e o caminho de erro da consulta ficou preso em "carregando" até a suíte E2E completa expor o problema (registrado em `.agent/lessons_learned.md`).

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
