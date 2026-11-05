# Task — Issue #13: Capacidades e condições de custo zero

> **Ciclo:** `002`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `chore`
> **Issue:** `#13`
> **Plano:** `_project/drafts/002_validacao_arquitetura/002_plan.md`
> **Branch:** `chore/issue-13`
> **PR:** [#16](https://github.com/EuThiagoAndrade/rastro-quente/pull/16)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #13" em 2026-11-05
> **Modo contínuo:** `—`
> **Início:** 2026-11-05
> **Última atualização:** 2026-11-05
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 2 do plano v2, confrontando os cenários do item 1 com condições e cotas oficiais de Vercel, Supabase, autenticação Google e dependências necessárias, sem presumir custo zero ou desempenho.

## Escopo autorizado

Criar `002_research_capacidades_custos.md` com fontes primárias datadas, condições de uso/gratuidade, limites por recurso e escopo, lacunas, contas de fronteira e resultados separados para S1/S2/S3 em cada cenário. Pesquisa documental, sem contas, aceite de termos, cartão, custos, serviços, implementação ou benchmark. A issue #14 e o parecer arquitetural continuam dependentes de integração e autorização próprias.

## Origem no backlog

Não se aplica. Demanda direta do responsável; nenhum ID do backlog foi selecionado. Snapshot herdado do plano.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Preservar os três conjuntos, cenários, proveniência e incógnitas do item 1; não extrapolar contagens nem adotar regra ou extensão como método validado. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Pesquisar condições de Google/Supabase e extensões; distinguir login de autorização, sem implantar ou alegar testes de RLS/acesso. Matriz de acesso permanece no item 3. |
| G3 — privacidade de dados | Sim | Somente documentação pública, sínteses e contas fictícias; sem leitura de `local/`, contas ou dados pessoais/operacionais. Revisão semântica antes de publicação. |
| G4 — migrações só acrescentam | Não | Nenhuma migração ou banco criado/alterado nesta entrega. |

## Execução

- [x] Conferir plano aprovado, issue #13 aberta, PR #15 integrada e autorização específica.
- [x] Criar worktree isolado `C:/Programas/rastro-quente-issue-13`, branch `chore/issue-13`, base `d8fb3b3d7b2459e11e63c0e3a26cebb1051f3778`, sem PR preexistente dessa branch.
- [x] Ler autoridades, templates de task/plano/PR e `governance-check`.
- [x] Pesquisar 32 fontes oficiais e documentar condições/cotas, divergências e pontos não verificados no relatório `002_research_capacidades_custos.md`.
- [x] Confrontar os 27 cenários e três conjuntos por recurso, conferir contas e critérios de aceite.
- [x] Executar gates, revisar G3/staging e publicar a PR #16, com branch/base e quatro arquivos conferidos no GitHub.
- [x] Consultar os checks reais; acompanhar o resultado do último push antes de solicitar integração.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Dependência | PR #15 `MERGED` em 2026-11-05 às 17:09:34Z; item 1 presente na base `d8fb3b3d7b2459e11e63c0e3a26cebb1051f3778`; check da entrega anterior `SUCCESS`. |
| Critérios de aceite | Relatório: matriz datada e modalidades nas seções 2–4/9; avaliação de ponta a ponta nas 2–4; memória de cálculo e resultados dos 27 cenários nas 5–6; incompatibilidades, paradas e lacunas nas 7–8. Demanda desconhecida não foi convertida em compatibilidade ou margem. |
| Testes | Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 passaram, zero falhas. Contas da seção 5.2 executadas: abaixo/no limite/acima de CPU e invocações; limites dos arquivos conferidos também contra unidades binárias mais permissivas. Nenhum teste de serviço, login/RLS, carga ou recuperação executado. |
| Validador | `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove itens manuais. |
| `git diff --check` | Passou na conferência local. |
| Consistência | 27 linhas de cenários únicas, nove para cada S1/S2/S3; IDs de fontes consistentes. Revisões do plano idênticas à base integrada; relatório do item 1 sem alteração. |
| Publicação | Commit de entrega `c2e6bc82eb7f474ff8a61bbe0bacd6efc361b9c8` publicado; PR #16 `OPEN`, de `chore/issue-13` para `main`, com os quatro arquivos previstos. Este registro é atualizado em commit documental posterior na mesma PR. |
| Checks remotos | `Governance / Validate governance` observado como `IN_PROGRESS` na abertura da PR #16 sobre `c2e6bc8` ([execução](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/42077122876/job/127420189450)). O último push reexecuta os checks; estado atual verificável na PR, sem sucesso presumido. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- MCP GitHub via Docker tentado por preferência humana; retornou `401 Bad credentials`. Consultas por `gh` confirmaram issue, PR e base, como fallback desta execução; nenhuma política de ferramentas nova.
- Checkout original com alterações preexistentes em plano/`cycles.md` e worktree da #12 foram preservados; esta branch parte da main integrada, sem copiar os registros antigos do checkout original.
- A PR #15 foi integrada externamente por merge commit, conforme o GitHub; não foi reescrito o histórico nem presumida nova autorização de merge. Esta entrega observa a integração efetiva; a convenção de squash para merges futuros permanece.
- Relatório é evidência auxiliar do item 2, sem template próprio imposto pelo plano. Task usa `.agent/templates/task.md`; atualizações do plano usam `.agent/templates/plano_implementacao.md`.
- G3/conferência manual: somente sínteses de documentação oficial, metadados históricos versionados e contas fictícias. Nenhuma conta, segredo, contato, dado operacional ou material de `local/` foi lido/gravado. Fontes e referências locais conferidas; autorização literal e barreiras G1/G2/G3 preservadas. Sem mudança de código, ADR, KB-003, regra, validador ou backlog.
- Divergência entre páginas Supabase de banco por projeto/organização ficou explícita, com interpretação restritiva somente para avaliação; unidades e elegibilidade não comprovadas continuam lacunas. Não houve decisão de método ambiental nem de arquitetura.
- Reconciliação da task #12 limitada ao estado/evidências da integração já ocorrida; nenhum SHA do próprio merge foi incluído naquela task. O relatório do item 1 e as rodadas de revisão do plano permanecem intactos.

## Encerramento

Não se aplica. Segunda issue de ciclo completo; sem encerramento prospectivo nesta PR.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 002 (completo)
Quem: Responsável
Conferir: Checks e diff da PR https://github.com/EuThiagoAndrade/rastro-quente/pull/16
Diga: "aprovo o merge da PR #16"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 002 + implementar_issue + issue-13/item-2 + d8fb3b3d7b2459e11e63c0e3a26cebb1051f3778`
- `effect_class`: `remote_mutation`
- `state_before`: plano v2 em execução; item 1 integrado; issue #13 aberta, sem task/PR; autorização específica recebida em 2026-11-05.
- `state_after`: relatório do item 2 publicado na PR #16; task #12 reconciliada como concluída, task #13 `Aguardando integração`; plano/ciclo permanecem em execução e item 3 não iniciado.
- `result`: `executed`
- `evidence`: autorização literal, issue/PR #15 e base conferidas; relatório com 32 fontes oficiais, 27 cenários, condições e contas reproduzidas; 55 testes passaram, validador sem erros/avisos, referências/G3/staging conferidos; PR #16 real com quatro arquivos e checks consultados.
- `blockers`: nenhum para a entrega publicada; integração exige checks verdes no último commit e "aprovo o merge da PR #16". Contas, provas, custos e item 3 não estão autorizados por esta manifestação.

## Referência do bootstrap

Não se aplica ao ciclo 002; nenhuma exceção do ciclo 000 utilizada.
