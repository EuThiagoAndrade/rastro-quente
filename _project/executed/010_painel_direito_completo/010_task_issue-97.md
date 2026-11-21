# Task — Issue #97: Painel de lentes com resultado e detalhe

> **Ciclo:** `010`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#97`
> **Plano:** `_project/executed/010_painel_direito_completo/010_plan.md`
> **Branch:** `feature/issue-97`
> **PR:** [#101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101)
> **Integração:** PR #101 integrada em 2026-11-18, conferida no GitHub.
> **Autorização inicial:** "autorizo a implementação da issue #97" em 2026-11-18
> **Modo contínuo:** `—`
> **Início:** 2026-11-18
> **Última atualização:** 2026-11-18
> **handoff_schema_version:** `2`

## Objetivo

Apresentar a resposta, a lista navegável e a evidência das cinco variantes de Lentes.

## Escopo autorizado

Item 1 do plano v2, integrado na PR #96. Interface, navegação, DESIGN.md e testes de Lentes.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Conferir unidades, datas GMT, registros e cobertura sobre os resultados existentes. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Ações reutilizam os fluxos e leituras existentes. |
| G3 — privacidade de dados | Sim | Testes com dados fictícios. |
| G4 — migrações só acrescentam | Não | Entrega de interface. |

## Execução

- [x] Issue aberta, plano integrado, autorização e base confirmados.
- [x] Perguntas, respostas, recorte e estados das cinco variantes.
- [x] Ações por identidade, evidência paginada, foco, recorte GMT e cobertura por unidade.
- [x] DESIGN.md, testes de regressão e conferência visual.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` e `npm run typecheck:servidor` | Passaram. |
| `npm run build` | Passou com aviso do Vite de chunk maior que 500 kB. |
| `npm run test:interface` | 219 passaram, incluindo caso independente com meses GMT parciais, mês sem registros e IDs inconsistentes. |
| `npx playwright test 03-acessibilidade 05-lentes 06-combinacao 07-areas 08-resultado 14-rotulos-espaco` | 71 passaram com Supabase local fictício. Inclui concentração com evidência paginada, ação de período, recorrência e duas sequências na mesma célula. |
| Conferência visual e acessibilidade | Lista e detalhe revisados em capturas locais. Auditoria em 360, 390, 768 e 1440 px, incluindo temas claro e escuro, foco, teclado, contraste, alvos de toque e reflow a 320 px. |
| `node --test scripts/validate-governance.test.mjs` | 55 passaram. |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos. Revisão manual de G1–G4 e staging seletivo. |
| `git diff --check` e `git diff --cached --check` | Passaram. |
| Acabamento visual final | Casos focais das specs 03, 05, 06 e 07 passaram, incluindo 6 combinações de largura/tema, meses parciais, duas sequências na mesma célula, selos, evidência e contornos. O último ajuste de ordem dos blocos foi conferido nas capturas e no fluxo do preview. |
| Checks remotos | Acompanhamento nos [checks da PR #101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101/checks). |

## Revisão da correção

Não se aplica.

## Ajuste visual solicitado pelo responsável

Em 2026-11-18, o responsável determinou que o layout reproduza a proposta aprovada e autorizou a correção com “Faça isso!”. A primeira implementação preservou excessivamente o layout anterior. A correção usa composição, hierarquia, blocos, meses visuais e cartões de ação da referência. Permanecem as adaptações analíticas expressas no plano, os dados reais da consulta e os requisitos de acessibilidade.

Conferência visual realizada lado a lado com o HTML em lista e detalhe de recorrência, com largura equivalente. Capturas isoladas do componente ficam em `local/revisao-97/`, ignorado pelo Git. Conferidos também celular de 390 px e tema escuro, abertura dos focos e retorno à linha. O preview local usa dados fictícios e permanece disponível para revisão humana.

## Decisões incidentais e desvios

Parâmetros e limitações ficam recolhíveis como na proposta. No detalhe, um único bloco técnico reúne proveniência, ficha, critérios, disponibilidade por classe, ressalvas e evidência paginada. “Ver os N focos” abre o bloco e leva à evidência. A disponibilidade resumida usa exclusivamente os dias da unidade selecionada.

A proposta é reproduzida com os dados da consulta e as adaptações já aprovadas no plano: ordem original das células, sequências separadas de células, meses GMT tocados pela janela e cobertura por unidade. O texto de apoio usa mínimo de 0,875 rem, os controles mantêm 44 px e os números nos quadrados laranja usam texto escuro para contraste.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 010 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + 97/reconciliacao + ce09a2efe8a4d11cdb0623f45a6c2b3981d11431`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: task aguardando integração / task concluída após confirmar PR #101 integrada.
- `result`: `already_executed_and_reconciled`
- `evidence`: [PR #101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101) com `merged: true`, consultada no MCP GitHub Docker em 2026-11-18; próxima implementação autorizada na task #98.
- `blockers`: nenhum.

### Histórico — implementação e publicação

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + 97 + 9e30e6e21e0882294e0ee92481df4c5f50bf84cc`
- `effect_class`: `remote_mutation`
- `state_before`: plano aprovado e issue aberta.
- `state_after`: layout da aba Lentes corrigido conforme solicitação humana; PR #101 atualizada.
- `result`: `executed`
- `evidence`: [issue #97](https://github.com/EuThiagoAndrade/rastro-quente/issues/97), commit de implementação `948f675` e [PR #101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101).
- `blockers`: nenhum; integração da PR #101 reconciliada por leitura do GitHub em 2026-11-18.

Reconciliação na implementação da issue #98: task concluída; o próximo passo autorizado é o item 2, registrado na task #98. O histórico de implementação acima permanece preservado.
