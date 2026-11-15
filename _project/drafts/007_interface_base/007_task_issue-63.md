# Task — Issue #63: Lentes no recorte da consulta

> **Ciclo:** `007`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#63`
> **Plano:** `_project/drafts/007_interface_base/007_plan.md`
> **Branch:** `feature/issue-63`
> **PR:** [#68](https://github.com/EuThiagoAndrade/rastro-quente/pull/68)
> **Integração:** squash `602d5d3` em `main` (2026-11-15)
> **Autorização inicial:** "autorizo a implementação da issue #63" em 2026-11-15
> **Modo contínuo:** `—`
> **Início:** 2026-11-15
> **Última atualização:** 2026-11-15
> **handoff_schema_version:** `2`

## Objetivo

As lentes passam a usar só as detecções do período e do município da consulta (A1); a concentração fica indisponível com município (A2). Nenhum cálculo de lente muda: muda só o conjunto de entrada, com versões novas.

## Escopo autorizado

Item 4 do plano v4 e issue #63:

- carregador, contrato, lentes, combinação e sobreposição com o recorte do pedido, conferência do eco do município, versões `lentes-007-v1`, `combinacao-007-v1` e `sobreposicao-007-v1` (T1, T2), evidência e cobertura só do município (T3), recusas da concentração (T4);
- interface: concentração desabilitada com município, retorno a "nenhuma" e à aba Municípios, mensagem da combinação que perde a concentração (T4, T16) e textos T5;
- KB-005 atualizada; casos RC-1 a RC-11 e CM-2 (parte do item 4), CM-3 e CM-4; regressão T20.

Fora deste item: mapa-base (item 5). Sem migração, RPC, política, tabela ou dependência nova.

## Origem no backlog

Sem origem no backlog: "lentes no recorte" é escopo do plano sem item de backlog (seção "Origem no backlog" do plano).

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Nenhuma fórmula mudou: o recorte só filtra a entrada (`EntradaLente.recorte`), conferido em `conferirEntrada`. Unitários RC-1 a RC-11 com os valores do plano (`tests/unit/recorte.test.mjs`); os casos dos ciclos `004` a `006` passam com os mesmos valores esperados (equivalência estadual com dados fictícios), mudando só as strings de versão. CM-2 (item 4), CM-3 e CM-4 verdes. E2E com a carga fictícia de recorrência: em Alfa, a célula de divisa perde o destaque e só a célula B fica. Equivalência e conferência independente com a carga real **não executadas** (ver Decisões) |
| G2 — autenticação, autorização e isolamento por RLS | Não | Mesmas RPCs (`p_municipio` já existia), mesmos papéis; nenhuma tabela, RPC ou política nova |
| G3 — privacidade de dados | Sim | Fixtures fictícias; nenhum dado novo gravado no navegador; nada de `local/` versionado |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v4 `Em Execução`, issue #63 aberta, item 3 integrado (PR #67, `604333e`), autorização literal "autorizo a implementação da issue #63", base `origin/main` em `604333e`.
- [x] Branch `feature/issue-63`; esta task.
- [x] Núcleo: `Recorte`, versões, recusa de registro de outro município, recusas da concentração, limitação T5.
- [x] Interface: pedidos e chave de memória com o município, recálculo ao mudar o município, concentração desabilitada (A2), textos T5, cartão com células destacadas.
- [x] Unitários RC-1 a RC-11, CM-2 (item 4), CM-3, CM-4; E2E ajustados e novos (T4, recorte municipal).
- [x] KB-005.
- [x] Gates finais (sem medições nem conferências com a carga real, por decisão do responsável) e PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run build` | Sem erros |
| `npm run test:interface` | 182/182 |
| `npm run test:e2e` (specs 02, 05, 06, 07 e 08, afetadas) | 67/67; o E2E inteiro roda no CI da PR |
| M3 e M6 (T14) | Não executadas (decisão do responsável) |
| `conferir:lentes` / `conferir:combinacao` / `conferir:sobreposicao` (estadual e municipal) | Não executadas e não estendidas ao recorte municipal (decisão do responsável) |
| `node --test scripts/validate-governance.test.mjs` / `node scripts/validate-governance.mjs` / `git diff --check` | 55/55; 0 erros; sem achados |
| Checks remotos | Verdes na PR #68 (governança, banco e RLS, interface com E2E) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Sem testes de carga (2026-11-15).** Junto da autorização, o responsável escreveu: "Assim como na outra issue, não quero que você faça teste de carga. Isso está demorando demais e eu preciso entregar. Preciso implementar rápido e depois, se tiver algum problema, a gente vai e corrige, ok?". Como nas issues #61 e #62, M3 e M6 (T14) não foram medidas e as conferências com a carga real (`conferir:*`, T20) não foram rodadas. Consequência para o aceite: os critérios "equivalência estadual com a carga real", "conferência independente célula a célula nos três municípios de referência" e "M3 e M6 dentro do limite" ficam **sem evidência** nesta PR. Os scripts `conferir:*` também não foram estendidos ao recorte municipal: sem poder rodá-los, a extensão ficaria sem verificação. Fica como pendência registrada para uma correção posterior, se o responsável quiser.
- **Equivalência estadual por construção e por unitários.** O recorte entra como campo opcional da entrada; sem ele (ou com o estadual), o caminho do código é o mesmo das versões anteriores. Os unitários dos ciclos `004` a `006` passam sem mudar nenhum valor esperado além das strings de versão, e RC-1 confere que o recorte estadual explícito e o ausente dão o mesmo resultado.
- **Concentração retirada da combinação.** Ao escolher um município, a caixa "Concentração" da combinação é desmarcada e desabilitada; voltar a Todo Mato Grosso a reabilita sem remarcar.
- **Cobertura no recorte municipal sem leitura extra.** Os municípios da cobertura são os das detecções da entrada; no recorte municipal, só o município, então a lente lê uma disponibilidade só.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 007 (completo)
Quem: Responsável
Conferir: Checks e diff da [PR #68](https://github.com/EuThiagoAndrade/rastro-quente/pull/68)
Diga: "aprovo o merge da PR #68"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + implementar_issue + 63 + 604333e`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #63 aberta, item 3 integrado / branch `feature/issue-63` publicada e PR #68 aberta
- `result`: `executed`
- `evidence`: PR #68; validações em "Evidências"
- `blockers`: checks remotos e aprovação do merge
