# Task — Issue #100: Perguntas sobre a tela com contexto e evidências

> **Ciclo:** `010`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#100`
> **Plano:** `_project/drafts/010_painel_direito_completo/010_plan.md`
> **Branch:** `feature/issue-100`
> **PR:** [PR #104](https://github.com/EuThiagoAndrade/rastro-quente/pull/104)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #100" em 2026-11-21
> **Modo contínuo:** `—`
> **Início:** 2026-11-21
> **Última atualização:** 2026-11-21
> **handoff_schema_version:** `2`

## Objetivo

Implementar o item 4 do plano aprovado, reorganizando o painel do agente e suas ações com contexto, resposta e evidências.

## Escopo autorizado

Issue #100 e item 4 do plano v2. Dependências #97, #98 e #99 integradas; base `3f9955ef24a3e01eae72b11a26a8bfe670c090bd`.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Preservar recortes e identidades e conferir destinos com casos de referência. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Preservar sessão, invalidação e contrato autenticado existente; conferir os fluxos relevantes. |
| G3 — privacidade de dados | Sim | Usar fixtures fictícias e revisar o diff sem dados privados. |
| G4 — migrações só acrescentam | Não | Nenhuma migração prevista. |

## Execução

- [x] Conferidos plano, autorização, base e dependências.
- [x] Implementar painel, navegação e documentação.
- [x] Executar gates e conferir evidências.
- [x] Publicar PR para revisão.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run typecheck`, `npm run build`, 55 testes de governança, 88 de navegação e contraste; E2E `13-perguntas`: 8/8; mais 2 cenários de destino após adicionar asserções. |
| Validador | 0 erros e 0 avisos; conferidos manualmente barreiras, autorização e privacidade do diff. |
| `git diff --check` | Passou. |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

A issue marca G2 aplicável; a task adota a classificação mais restritiva para verificar a preservação da sessão. O responsável autorizou em 2026-11-21 reinicializar o banco local de teste; o reset foi executado. A inspeção visual usou a proposta da seção 7–8 e capturas fictícias em desktop e celular, temas claro e escuro. Como adaptação ao fluxo existente, a entrada continua acessível junto da resposta; as etapas recebidas ficam recolhíveis na resposta e visíveis durante a execução. Os rótulos normativos e a navegação real prevalecem sobre os textos ilustrativos do esboço.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 010 (completo)
Quem: Responsável
Conferir: Checks e diff da [PR #104](https://github.com/EuThiagoAndrade/rastro-quente/pull/104)
Diga: "aprovo o merge da PR #104"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + issue-100 + 3f9955ef24a3e01eae72b11a26a8bfe670c090bd`
- `effect_class`: `remote_mutation`
- `state_before`: issue aberta e autorizada; dependências integradas; branch ausente.
- `state_after`: implementação e gates locais concluídos; PR #104 aberta, aguardando checks e aprovação do merge.
- `result`: `executed`
- `evidence`: esta task, branch `feature/issue-100`, PR #103 integrada e PR #104 aberta.
- `blockers`: checks remotos e aprovação específica do merge pendentes.
