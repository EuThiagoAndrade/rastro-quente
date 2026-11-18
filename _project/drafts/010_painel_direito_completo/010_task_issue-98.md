# Task — Issue #98: Lista e detalhe de municípios no painel

> **Ciclo:** `010`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#98`
> **Plano:** `_project/drafts/010_painel_direito_completo/010_plan.md`
> **Branch:** `feature/issue-98`
> **PR:** [#102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #98" em 2026-11-18
> **Modo contínuo:** `—`
> **Início:** 2026-11-18
> **Última atualização:** 2026-11-18
> **handoff_schema_version:** `2`

## Objetivo

Separar inspeção estadual, ação de câmera e aplicação explícita do recorte municipal.

## Escopo autorizado

Item 2 do plano v2 integrado na PR #96, issue #98. Dependência #97 integrada pela PR #101, comprovada no GitHub e na base `5e45fcc010cd44f1113aa6bce14198e8668197a1`.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Separar métricas do resumo estadual das do recorte municipal; preservar pertinência compartilhada de células e empates. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Reutilização das leituras vigentes, sem alteração de acesso. |
| G3 — privacidade de dados | Sim | Fixtures fictícias e revisão seletiva de textos e imagens. |
| G4 — migrações só acrescentam | Não | Sem migrações. |

## Execução

- [x] Issue, plano, autorização e dependência integrados conferidos.
- [x] Lista e detalhe municipal, ações explícitas e invalidação.
- [x] Contrato visual, ADR-009 e guia de interface atualizados.
- [x] Verificações focadas da interface e gates locais.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` e `npm run build` | Passaram; aviso preexistente de chunk acima de 500 kB. |
| `node --test tests/unit/resultado.test.mjs` | 13 passaram, incluindo empates, métricas municipais e célula compartilhada A=3 / B=1. |
| Playwright: `15-municipios.spec.mjs` | 4 passaram: desktop claro e celular escuro, teclado/foco, inspeção, consulta, retorno, geometria sob demanda (falha/ausência/repetição/descarte tardio), lente estadual e estado zero. |
| Playwright: `02-consulta.spec.mjs -g 'por município: total da série independente'` | 1 passou; asserção atualizada para consulta explícita. |
| Conferência visual | Capturas da lista e do detalhe em 1440×900 claro e 390×844 escuro inspecionadas. Hierarquia, texto, ações e ausência de transbordamento conferidos. |
| Ambiente dos testes focados | Configuração local ignorada em `local/issue98/`, porta 5175. Fixture comum fictícia temporária; publicação anterior restaurada ao terminar, sem substituir os registros do preview existente. No CI, as specs usam a configuração padrão. |
| Governança e diff | 55 testes de governança passaram; validador com 0 erros e 0 avisos; diff conferido sem erros. |
| Checks remotos | Acompanhar os [checks da PR #102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102/checks). |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

O responsável limitou os testes em 2026-11-18 a verificações básicas dos itens de interface afetados, sem testar toda a aplicação. Essa instrução mais recente restringe a passagem integrada prevista no plano a esta entrega; checks obrigatórios do CI permanecem.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 010 (completo)
Quem: Responsável
Conferir: Checks e diff da [PR #102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102)
Diga: "aprovo o merge da PR #102"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + 98 + 5e45fcc010cd44f1113aa6bce14198e8668197a1`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue aberta e dependência integrada / implementação e validação local concluídas; PR #102 publicada, aguardando checks e aprovação do merge.
- `result`: `executed`
- `evidence`: issue #98, PR #101 integrada, comandos e resultados da seção Evidências e commit `224fea9` e [PR #102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102).
- `blockers`: conclusão dos checks remotos e aprovação específica do merge.
