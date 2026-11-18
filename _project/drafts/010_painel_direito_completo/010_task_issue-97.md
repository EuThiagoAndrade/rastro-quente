# Task — Issue #97: Painel de lentes com resultado e detalhe

> **Ciclo:** `010`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#97`
> **Plano:** `_project/drafts/010_painel_direito_completo/010_plan.md`
> **Branch:** `feature/issue-97`
> **PR:** [#101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101)
> **Integração:** `Pendente`
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
| Checks remotos | Acompanhamento nos [checks da PR #101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101/checks). |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

Parâmetros do método e proveniência ficam em blocos recolhíveis. As limitações permanecem no corpo da lista, inclusive no estado de janela insuficiente. A evidência de concentração passou a usar a mesma paginação dos destaques por célula.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 010 (completo)
Quem: Responsável
Conferir: Checks e diff da [PR #101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101)
Diga: "aprovo o merge da PR #101"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + 97 + 9e30e6e21e0882294e0ee92481df4c5f50bf84cc`
- `effect_class`: `remote_mutation`
- `state_before`: plano aprovado e issue aberta.
- `state_after`: implementação validada e PR #101 aberta.
- `result`: `executed`
- `evidence`: [issue #97](https://github.com/EuThiagoAndrade/rastro-quente/issues/97), commit de implementação `948f675` e [PR #101](https://github.com/EuThiagoAndrade/rastro-quente/pull/101).
- `blockers`: conclusão bem-sucedida dos checks e aprovação específica para integrar.
