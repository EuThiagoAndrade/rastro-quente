# Task — Issue #81: Configuração gratuita, demonstração e verificação hospedada

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `chore`
> **Issue:** `#81`
> **Plano:** `_project/drafts/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `chore/issue-81`
> **PR:** [#87](https://github.com/EuThiagoAndrade/rastro-quente/pull/87) (preparação; não fecha a issue)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #81" em 2026-11-16
> **Modo contínuo:** `—`
> **Início:** 2026-11-16
> **Última atualização:** 2026-11-16
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 5 do plano 008 (v3) em duas PRs da mesma issue. A **PR 1 (preparação)** traz o runbook de operação, verificação e desligamento, a documentação das variáveis sem valores e a configuração da função na Vercel, e não fecha a issue. Depois do merge dela, vêm a ação externa com a IA desligada (etapa A), a autorização de produção, a sondagem desligada, a habilitação (etapa B) e a verificação T9 hospedada (etapa C). A **PR 2** traz o relatório `008_validation_agentes.md` e a reconciliação desta task, e só ela fecha a issue.

## Escopo autorizado

Item 5 do plano v3 e issue #81:

- PR 1: `docs/runbook.md` (seção 12: variáveis só por nome, etapas A/B/C, sondagens, desligamento de emergência e limites do que se prova); `vercel.json` (`maxDuration` 300 só para `api/explicar.ts`) e seu teste em `tests/unit/bundle.test.mjs`; complemento da ADR-011; reconciliação da task da issue #80 e da rastreabilidade do plano;
- depois da PR 1: execução do roteiro da seção 12 dentro das autorizações próprias, e PR 2 com `008_validation_agentes.md`, evidências e fechamento da issue. Falhas encontradas na verificação são corrigidas na PR 2 ou em PR adicional justificada da mesma issue, com aprovação própria.

Fora deste item: mudanças nas regras analíticas, nas instruções ou ferramentas dos agentes, no modelo ou no provedor; novas rotas; cobrança, faturamento ou troca de plano; esgotar cota de propósito; encerramento do ciclo (PR própria).

## Origem no backlog

Herdada do plano (BL-009, parcela "proposta de agentes"), referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | A PR 1 não toca cálculo (`src/comparacao.ts`, `src/lentes/`, `servidor/`). Na etapa C, cada resposta da IA é conferida contra o detalhamento determinístico da mesma tela; divergência é falha registrada, não ajuste da regra |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Nenhuma mudança no handler, nas políticas ou na lista de responsáveis. O roteiro prova em produção a matriz T4 (anônimo, origem, JWT inválido, outra conta) sem chamada ao provedor, e o desligamento não mexe em RLS |
| G3 — privacidade de dados | Sim | Variáveis só por nome; chave do Gemini marcada como *Sensitive* e nunca no chat, em `.env.example`, issue, PR, log ou print; o agente não recebe JWT, UUID ou e-mail; logs da função só com etapa, código, duração, chamadas e tokens. D7 autoriza enviar dados territoriais públicos ao provedor |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v3 `Em Execução`, issue #80 integrada (PR #86, `831ee8e`), issue #81 aberta, autorização literal, base `main` em `831ee8e`.
- [x] Branch `chore/issue-81`; esta task; task da issue #80 e rastreabilidade do plano reconciliadas.
- [x] Limites da Vercel conferidos na documentação oficial (páginas de duração, limitações, Fluid compute e configuração, atualizadas em 2026-08-24/25): Hobby com Fluid compute, padrão e máximo de 300 s; Fluid compute ligado por padrão em projetos novos desde 2025-04-23; respostas em fluxo contam na duração; corpo até 4,5 MB (não se aplica à resposta em fluxo). A documentação não diz se um valor acima do máximo reprova o deploy nem traz a retenção de logs: ficam para a etapa A.
- [x] Runbook (seção 12), `vercel.json`, teste e ADR-011.
- [x] PR 1 [#87](https://github.com/EuThiagoAndrade/rastro-quente/pull/87) aberta, sem fechar a issue.
- [ ] Checks remotos e merge aprovado da PR #87.
- [ ] Etapa A (ação externa): cotas, Fluid compute, variáveis sem habilitação, logs.
- [ ] Autorização de produção e verificação desligada.
- [ ] Etapa B (ação externa): habilitação.
- [ ] Etapa C: verificação T9 hospedada.
- [ ] PR 2: `008_validation_agentes.md`, reconciliação e fechamento da issue.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run test:interface` | 218/218 (inclui `vercel.json` com só `api/explicar.ts` e `maxDuration` 300, CSP, segredos e bundle sem chave) |
| `npm run typecheck` / `npm run typecheck:servidor` | Sem erros |
| `npm run build` | Concluído |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Pendente |
| Verificação hospedada | Não iniciada (depende do merge da PR 1, da etapa A e da autorização de produção) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **`maxDuration` antes da conferência na conta.** O plano (T6) pede conferir o suporte gratuito antes de configurar a duração. A conferência foi feita na documentação oficial. O estado do Fluid compute na conta fica com o responsável, na etapa A, porque o merge da `main` já gera o deploy de produção. Se o deploy falhar por esse motivo, a situação passa a "Parado", sem troca de plano. A produção anterior continua servindo e a IA continua desligada.
- **Falha controlada (C9).** A cota diária não é esgotada de propósito. Sem falha natural, o ensaio usa uma chave inválida temporária, uma mudança de ambiente feita pelo responsável dentro da etapa B, e a chave é restaurada em seguida. Sem esse ensaio, o relatório registra C9 como não executado em produção.
- **Execução conjunta.** O agente não entra com conta Google. Os casos com sessão (C2 a C8, C10) são feitos pelo responsável na própria sessão; o agente faz as sondagens anônimas (C1 e verificação desligada) e registra as evidências.
- **`.env.example`.** As variáveis `RQ_*` ficam documentadas no runbook, e não no exemplo, pelo mesmo motivo registrado na issue #79 (o teste do bundle trata linha vazia seguida de outra como valor).

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 008 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #87 (https://github.com/EuThiagoAndrade/rastro-quente/pull/87); roteiro de docs/runbook.md, seção 12
Diga: "aprovo o merge da PR #87"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 81 (PR 1, preparação) + 831ee8e`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #81 aberta, plano `Em Execução` / branch `chore/issue-81` publicada e PR #87 aberta, task `Em andamento`
- `result`: `executed`
- `evidence`: PR #87 (branch `chore/issue-81`); validações em "Evidências"
- `blockers`: gates de merge da PR 1; depois, ação externa (etapa A) e autorização de produção

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
