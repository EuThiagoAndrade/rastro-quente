# Task — Issue #91: Rótulos das lentes e espaço do mapa

> **Ciclo:** `009`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#91`
> **Plano:** `_project/executed/009_rotulos_lentes_espaco_mapa/009_plan.md`
> **Branch:** `feature/issue-91`
> **PR:** —
> **Integração:** `Pendente`
> **Encerramento prospectivo:** `Sim`
> **Autorização inicial:** "Confirmo o nível leve em modo contínuo e autorizo o plano do ciclo 009" em 2026-11-17
> **Modo contínuo:** `ativo`
> **Início:** 2026-11-17
> **Última atualização:** 2026-11-17
> **handoff_schema_version:** `2`

## Objetivo

Item 1 do plano do ciclo `009`: deixar evidente qual lente produz cada resultado e dar mais área ao mapa, mantendo a série e a "Lista de focos", sem mudar métodos, cálculos, critérios ou leituras.

## Escopo autorizado

O escopo do item 1 do plano v2 (decisões D1 a D5 e consequências C1 a C7), com as ressalvas R2-1 a R2-3 da rodada 2 resolvidas aqui (ver "Decisões incidentais e desvios"). Plano promovido pelo modo contínuo (veredito `APTO PARA APROVAÇÃO`, rodada 2).

## Origem no backlog

Herdada do plano: BL-017, item inteiro, `_project/backlog.md` no commit `171e078`, contido em `main` e `origin/main`. Destino em preparação; o item continua `Disponível` até o retorno pós-integração.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Não | Só apresentação: nenhuma fonte, contagem, janela, geometria ou critério muda; leituras e conferências iguais. Retiradas por decisão do responsável (D1, D2, D4, D5), com emendas nos ADRs. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Sem mudança de banco, RPC, sessão ou servidor. |
| G3 — privacidade de dados | Não | Interface e documentação; testes com as fixtures fictícias existentes. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Execução

- [x] Referência de altura do mapa medida em `main` (`171e078`): 329 px em 1.366 × 768, 520 px em 1.024 × 768 e 440 px em 375 × 812.
- [x] Rótulos "Lentes" e "Seleção"; aba "Lentes" e título da opção ativa, também sem resultado.
- [x] Retirada dos três cartões; série num cartão sem título visível; contagem e seleção só para leitor de tela.
- [x] Área selecionada em cartão compacto (também no mapa ampliado); classes, aviso e atribuição das áreas na "Legenda" do mapa.
- [x] Estado "zero", nota e atalho do painel de perguntas.
- [x] Altura do mapa nos três tamanhos.
- [x] "Como ler esta tela" e `aria-label` do mapa.
- [x] Testes E2E ajustados e `tests/e2e/14-rotulos-espaco.spec.mjs` novo.
- [x] Documentação viva (`DESIGN.md`, ADR-007, ADR-009, ADR-011, KB-003, KB-005, KB-006, runbook, README, lições) e encerramento prospectivo.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` e `npm run typecheck:servidor` | Sem erros |
| `npm run test:interface` | 218 aprovados, 0 falhas |
| `npm run build` | Concluído |
| `npm run test:e2e` (1ª rodada) | 101 aprovados e 5 falhas (01-acesso, 04-versao, 05-lentes, 06-combinacao e 07-areas): o laço de limpeza em `src/app.ts` ainda citava `resumo-corpo` e `disp-corpo`; corrigido, as 5 specs passaram (61 aprovados) |
| `npm run test:e2e` (2ª rodada, após a correção) | 132 aprovados, 0 falhas (10,5 min) |
| Altura do mapa depois | 1.366 × 768 maior que 329 px (asserção do E2E 14); 1.024 × 768: 600 px; 375 × 812: 480 px |
| `node --test scripts/validate-governance.test.mjs` | 55 aprovados, 0 falhas |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos |
| `git diff --check` | Sem problemas |
| Checks remotos | Pendente (PR) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **R2-1:** as passagens da v1 que contradizem C2 e C4 ("legenda duplicada", legenda do mapa e painel de perguntas no "Fora do escopo", referências sem ADR-011 e KB-006) valem como corrigidas por C2, C4 e o item 9; a implementação segue C2 e C4.
- **R2-2:** acrescentados critérios de teste para a nova nota do painel de perguntas e para a caixa `#c-areas` desmarcada quando a camada não existe (`07-areas`).
- **R2-3:** o bloco da área selecionada aparece também no mapa ampliado, como o aviso do fundo e a "Lista de focos"; registrado no `DESIGN.md`.

## Encerramento

Última (e única) issue do ciclo leve `009`; encerramento prospectivo nesta PR.

- [x] Documentação viva atualizada: `DESIGN.md`, emendas datadas nos ADR-007, ADR-009 e ADR-011, KB-003, KB-005, KB-006, `docs/runbook.md`, README e `.agent/lessons_learned.md`.
- [x] Plano `Concluído`, com o pós-mortem.
- [x] Task `Concluída`.
- [x] `cycles.md` com o ciclo `009` `Concluído`.
- [x] Ciclo movido para `_project/executed/009_rotulos_lentes_espaco_mapa/`.
- O retorno ao backlog do BL-017 fica para depois da integração comprovada em `main`, com autorização própria de publicação.

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
- `logical_key`: `rastro-quente + 009 + implementar_issue + 91 + 171e078`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #91 aberta, sem branch / branch `feature/issue-91` com implementação, testes, documentação e encerramento prospectivo; PR aberta, aguardando checks e aprovação do merge
- `result`: `executed`
- `evidence`: issue #91; PR da branch `feature/issue-91`; validações em "Evidências"
- `blockers`: checks remotos e "aprovo o merge da PR #N"

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
