# Task — Issue #22: Publicar cargas idempotentes e validar reconstrução

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#22`
> **Plano:** `_project/drafts/003_implementacao_prototipo/003_plan.md`
> **Branch:** `feature/issue-22`
> **PR:** [#27](https://github.com/EuThiagoAndrade/rastro-quente/pull/27)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #22" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-07
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 3 do plano `003` v4: `plan`/`apply` da CLI local para banco alvo explícito com o papel EX, avaliando primeiro uma única transação no cliente `pg`; identidade da carga derivada do manifesto canônico; reconciliação de concorrência e de commit ambíguo pela identidade; medição integral de banco, disco, WAL, tráfego e geometrias com o volume real do item 1; reconstrução em banco local novo; runbook de atualização, cópia, expiração, recuperação e rotação de EX. Tudo local, sem banco hospedado.

## Escopo autorizado

Issue [#22](https://github.com/EuThiagoAndrade/rastro-quente/issues/22) e item 3 do plano: `scripts/banco/` (CLI, módulos, testes e medições), dependência `pg`, runbook, ADR da decisão de mecanismo e documentação viva. Fora do escopo: carga ou ensaio destrutivo em banco hospedado, filas, jobs agendados, PostGIS hospedado, serviços adicionais, interface (item 4) e operação remota (item 5). A autorização cobre implementação, testes e preparação/publicação da PR; não cobre merge.

## Origem no backlog

Não se aplica. Snapshot herdado do plano: demanda direta do responsável; nenhum ID do backlog selecionado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | A carga persiste, sem recalcular, o resultado do item 1 (recorte, pertencimento, D1, regra H3 adotada em 2026-11-07). Conferência de totais e de hashes do manifesto contra as saídas e as fontes fixadas. Nenhuma regra analítica nova. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | O executor usa somente o papel EX, com a senha por variável de ambiente do processo. Nenhuma migração nova é prevista; se surgir, terá teste de acesso negado. Testes de EX com login SQL real e leitura do RP durante a carga. |
| G3 — privacidade de dados | Sim | Testes com fixtures fictícias e códigos `99000xx`. A carga real usa só fontes públicas já fixadas em `local/` (fora do Git); nada dos dados reais, de UUID, e-mail ou senha entra em commit, log ou documento. Medições registram agregados. |
| G4 — migrações só acrescentam | Sim | Nenhuma migração existente é alterada; expiração de dados é comando da CLI, não migração. |

## Execução

- [x] Confirmar issue #22 aberta, plano v4 `Em Execução`, itens 1 e 2 integrados (PR #25 `f8106a5`, PR #26 `e8b79b5`) e autorização literal.
- [x] Ler autoridades, `implementar_issue`, templates de task e PR, `governance-check` e `lessons_learned`.
- [x] Criar `feature/issue-22` a partir de `origin/main` (`e8b79b5a332089eeefe67feb67c8a7ae8be085e6`).
- [x] Reconciliar a task #21 como `Concluída`.
- [x] Instalar `pg` 8.23.1 (MIT, versão exata) como `devDependency`; o plano prevê o cliente `pg`.
- [x] Implementar manifesto canônico (`manifesto.mjs`) e a CLI `plan`/`apply`/`expirar`/`resumo` (`carga.mjs`): uma transação `READ COMMITTED`, identidade pelo manifesto, reconciliação por identidade, orçamento com teto de 400.000.000 bytes.
- [x] Testes de idempotência, concorrência (mesma identidade, identidades distintas, primeira publicação) e falhas antes, durante (conexão encerrada de verdade) e depois do commit; RP não vê a preparação; `expirar`; EX não aprova o próprio manifesto.
- [x] Medição integral com a carga real do item 1 (`npm run medir:carga`) e reconstrução em banco novo com perda do banco no meio (`scripts/banco/reconstruir.mjs`); teste de reconstrução com carga fictícia em `test:rls`.
- [x] ADR-006 com a decisão e a justificativa pela medição; `docs/runbook.md`; README e `.env.example`.
- [x] Gates locais e inspeção de `governance-check`.
- [x] Publicar `feature/issue-22` (base `origin/main` em `e8b79b5a332089eeefe67feb67c8a7ae8be085e6` conferida), abrir a PR [#27](https://github.com/EuThiagoAndrade/rastro-quente/pull/27) com `Closes #22` e gravar o bloco "Aguardando merge".

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:rls` passou: 168 asserções pgTAP e 35 testes de Node (manifesto 6, API 3, executor 6, carga 14, reconstrução 2, migração 4); `npm run test:prototipo` 32/32; `npm run test:governance` 55/55 |
| Carga real (item 1) | `apply` 2,1 s (62.636 linhas, 15,3 MB enviados, 16 instruções), reexecução 22 ms sem byte novo; persistido 17,6 MB; WAL 27,2 MB; temporários 6,4 MB; RSS do cliente 419 MB; pico com duas versões 45,9 MB de banco lógico (teto 400 MB). Detalhe no ADR-006 e em `docs/runbook.md` |
| Reconstrução real | Banco novo só com migrações + manifesto aprovado + `apply`: 5,8 s; conteúdo idêntico (mesma identidade, contagens e SHA-256 por tabela). Banco derrubado no meio do `apply`: `not_executed`; reconstrução do zero 5,9 s, idêntica |
| Validador | `node scripts/validate-governance.mjs`: 0 erro(s), 0 aviso(s), 9 manuais |
| `git diff --check` | Limpo |
| Varredura G3 | Sem e-mail real, UUID real, senha ou chave nos arquivos novos; saídas das medições ficam em `local/` (ignorado) |
| Checks remotos | Pendente (PR #27 aberta; aguardando a execução do Governance) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Dependência `pg`:** `pg@8.23.1` (MIT), exata, em `devDependencies`, como as ferramentas de operador do projeto; o plano prescreve o cliente `pg`.
- **Manifesto aprovado (D1):** `plan --sql` gera o SQL de aprovação; o administrador o executa. O EX não aprova a própria carga (teste). Sem aprovação o `apply` responde `not_executed`.
- **Identidade inclui os hashes das saídas do item 1:** só fontes e janela não distinguiriam uma correção de método (mesmas fontes, saídas diferentes). Timestamps de obtenção ficam fora.
- **`revisao` no método:** retirada não volta; o retorno ao conteúdo antigo é a mesma carga com nova `revisao`, com novo manifesto aprovado. Também serviu para medir o pico de duas versões.
- **A migração de correção G2 fecha o `LOGIN` do EX em todo banco novo do cluster** (`alter role … nologin`, papel global). Descoberto na reconstrução: a janela do EX precisa ser aberta *depois* de migrar. Registrado no runbook; o helper de bancos descartáveis reabre a janela se ela estava aberta. Nenhuma migração foi alterada (G4).
- **Fator de estimativa 1,5:** medido 1,14–1,15 persistido/payload; usa-se 1,5 (≈30% de folga) para o teto.
- **Não incluído por falta de necessidade medida:** lotes, checkpoints, staging persistente e trava consultiva (ADR-006), com gatilhos propostos de reavaliação (a confirmar pelo responsável).
- **`expirar` não reduz o arquivo:** `VACUUM` libera espaço para reuso; `VACUUM FULL` e `pg_dump` ficam fora do que foi provado (runbook, seção 9).
- **Compressão da API:** o Supabase local não comprime; os bytes "gzip" são estimativa local (`gzip -6`) e o egress hospedado real fica para o item 5.
- **Pendências herdadas, não tratadas aqui:** HTTP 500 de P0002 (`PT404`) e revogação dos privilégios de `service_role` em `public`, antes do item 5; ambas seguem recomendadas na task #21.
- **Escopo preservado:** nenhuma migração, interface, banco hospedado, job ou fila.
## Encerramento

Não se aplica. Terceira issue de ciclo completo.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 003 (completo)
Quem: Responsável
Conferir: Checks e diff da PR https://github.com/EuThiagoAndrade/rastro-quente/pull/27
Diga: "aprovo o merge da PR #27"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-22/item-3 + e8b79b5a332089eeefe67feb67c8a7ae8be085e6`
- `effect_class`: `remote_mutation`
- `state_before`: plano `Em Execução`; itens 1 e 2 integrados; task #21 ainda `Aguardando integração`; issue #22 aberta, sem task, branch ou código.
- `state_after`: item 3 implementado e testado localmente; task #21 reconciliada como `Concluída`; ADR-006 e runbook registrados; branch `feature/issue-22` publicada e PR #27 aberta; task #22 `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorização literal "autorizo a implementação da issue #22" em 2026-11-07; commit `50fce06`; PR #27 real com `Closes #22`; `npm run test:rls` (pgTAP 168 e Node 35), `test:prototipo` 32, governança 55; validador sem erros ou avisos; carga e reconstrução reais medidas.
- `blockers`: nenhum para a entrega publicada; integração exige checks verdes e "aprovo o merge da PR #27". Itens 4 e 5 não iniciados. Os gatilhos de reavaliação da transação única (ADR-006) aguardam confirmação do responsável.
