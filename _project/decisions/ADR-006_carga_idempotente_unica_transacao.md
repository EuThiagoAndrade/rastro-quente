---
title: "Carga idempotente do protótipo em uma única transação"
tags:
  - arquitetura
  - banco
  - carga
author: "Claude Code (Sonnet 5.5)"
module: "scripts/banco"
last_updated: "2026-11-07"
origin_cycle: "003"
---

# ADR-006: Carga idempotente do protótipo em uma única transação

## Status

Aceito. Decisão técnica do item 3 do plano `003` v4 (aprovado em 2026-11-05), implementada na issue #22 sob a autorização literal "autorizo a implementação da issue #22" de 2026-11-07. Vigora com a integração da PR correspondente.

## Contexto

O plano exige provar, antes de qualquer operação hospedada, que o executor (EX) publica uma versão de dados com idempotência, sem mistura de versões e com recuperação (PF2/PF4). Manda avaliar primeiro **uma única transação no cliente `pg`** e só introduzir lotes, staging persistente, checkpoints ou trava adicional se tempo, memória ou volume medidos no schema real demonstrarem necessidade. O banco ([ADR-005](ADR-005_banco_autorizacao_prototipo.md)) já impõe, para qualquer papel, o ciclo `preparacao → publicada → retirada`, a conferência das contagens, o manifesto aprovado pelo administrador (D1) e `READ COMMITTED` na publicação.

## Decisão

**Mecanismo.** `scripts/banco/carga.mjs` (comandos `plan`, `apply`, `expirar`, `resumo`) executa a carga em **uma transação `READ COMMITTED`**: cria a carga em preparação, grava fontes, malhas, municípios, detecções e disponibilidade (uma instrução por tabela, `jsonb_to_recordset`), trava a linha da publicação vigente (`FOR UPDATE`), publica, aponta a vigente para a carga nova e retira a anterior. O `COMMIT` é único. Até ele, nada é visível a outra sessão; o RP continua lendo a versão anterior. Falha antes do commit desfaz tudo.

**Identidade.** SHA-256 do manifesto canônico (`manifesto.mjs`): fontes (chave, papel, URL, SHA-256, bytes), janela, envelope, fuso, método (`revisao`, malha de exibição, regra de histórico), hashes das saídas do item 1 e totais. Timestamps e UUIDs não entram. Correção de fonte, mudança de janela, mudança do conteúdo das saídas (correção de método) ou nova `revisao` geram identidade nova. O administrador aprova o manifesto por SQL gerado por `plan --sql`; o EX não aprova a própria carga.

**Concorrência e reconciliação, sem trava adicional.**
- Mesma identidade em duas conexões: o índice único de `cargas.identidade` faz a segunda esperar a primeira. Depois do commit ela recebe `23505`, reavalia pela identidade e responde `already_executed_and_reconciled`.
- Identidades distintas: a trava de linha da publicação vigente serializa. Quem confirma por último fica vigente e retira a anterior. Se ainda não existe vigente, a chave única da publicação desempata e a perdedora refaz a carga (até 3 tentativas).
- Falha com `COMMIT` enviado: conexão nova confere a identidade. `publicada` e vigente com contagens completas → `already_executed_and_reconciled`; ausente → `not_executed` (reexecutável); qualquer outro estado, ou sem conexão para conferir → `ambiguous_human_intervention_required`.
- Carga em `preparacao` já confirmada (fora do protocolo) ou `publicada` fora da vigência: parada ambígua, sem limpeza. Carga `retirada` nunca é republicada.
- Não há `force`, remoção da carga, nem limpeza destrutiva.

**Retenção.** A versão anterior é retirada na troca e mantém as linhas até `expirar`, que apaga só linhas de cargas retiradas (a carga e o manifesto aprovado ficam como registro). Retirada não volta: para voltar ao conteúdo antigo, nova `revisao` do mesmo conteúdo, com novo manifesto aprovado.

**Alvo e credencial.** `--alvo postgresql://rq_executor@HOST:PORTA/BANCO` (sem senha na URL; papel obrigatório `rq_executor`; fora do loopback exige `sslmode=require`) e `RQ_EXECUTOR_PASSWORD` no ambiente do processo. `apply` exige `--identidade` igual à do plano revisado.

**Orçamento.** `plan` lê `pg_database_size` do alvo e estima `consumo existente + payload × 1,5` (a versão vigente permanece durante a carga). Pico **acima de 400.000.000 bytes**, ou estimativa que não prova margem (sem consulta ao alvo, payload ausente), é parada; igualdade é teto e não dispensa conferir disco, egress, conta, CI e Vercel no item 5.

## Medição que justifica a transação única

Carga real do item 1 (AQUA_M-T em MT, 2025-11-01 a 2026-10-31 GMT: 10.640 detecções, 142 municípios, 51.830 município-dias, 22 fontes), PostgreSQL 17.11 local, Node 24.15, `pg` 8.23.1, pela CLI de produção. Fonte: `npm run medir:carga`, `local/dados-prototipo/medicao-carga.json`.

| Medida | Resultado |
| :-- | :-- |
| Duração do `apply` (62.636 linhas, 16 instruções) | 2,1 s (2,13 e 2,14 s na medição; 2,52–2,74 s nas três cargas da reconstrução); `plan` 0,5 s |
| Reexecução da mesma identidade | 22 ms, 3 instruções, 0 byte persistido |
| Tráfego do cliente | 15,31 MB enviados (≈ payload de 15,30 MB), 3 KB recebidos, 2 conexões |
| Memória do cliente (RSS de pico do processo) | 419 MB |
| Persistido em `public` (tabelas, TOAST e índices) | 17,6 MB (razão 1,14–1,15 sobre o payload; estimativa do plano: 22,95 MB) |
| WAL gerado / temporários | 27,2 MB / 6,4 MB (1 arquivo) |
| Pico com a versão anterior retirada e a nova publicada | `public` 35,2 MB; banco lógico 45,9 MB (base vazia: 10,8 MB) |
| Depois de `expirar` e `VACUUM` | linhas mortas 62.640 → 1; o arquivo **não encolhe**: o espaço é reaproveitado pela carga seguinte |
| Disco do contêiner (`du`) | 51,2 MB em repouso; 153,6 MB no pico, dos quais 83,9 MB de `pg_wal` (não é o banco lógico) |

Com essa folga (45,9 MB de banco lógico no pico contra o teto de 400 MB) e 2 s de duração, **lotes, checkpoints, staging persistente e trava adicional não têm necessidade demonstrada**; as garantias exigidas ficam com a transação, o índice único e os gatilhos do schema. Gatilhos propostos para reavaliar, a confirmar pelo responsável quando houver dado novo: `apply` acima de 5 minutos, RSS do cliente acima de 2 GB, instrução esbarrando no `statement_timeout` de 600 s da sessão, ou payload dez vezes maior.

## Consequências

### Positivas
- Atomicidade total: nenhuma versão parcial, nenhuma mistura, a anterior intacta até o commit.
- Reconciliação simples, por uma única chave (a identidade), sem estado auxiliar.
- Sem infraestrutura nova: um cliente `pg` e o schema existente.

### Trade-offs
- O cliente mantém todo o payload em memória (419 MB de RSS no volume real).
- Falha tardia refaz a carga inteira (≈ 2 s hoje).
- A transação segura `FOR SHARE` na linha da carga e `FOR UPDATE` na vigente até o commit; só outras cargas esperam. Leituras do RP não esperam.
- Retirada não volta; reversão é nova `revisao`, com nova aprovação do administrador.
- `expirar` não reduz o arquivo; reduzir exige `VACUUM FULL` do proprietário, não exercitado aqui.

## Alternativas consideradas

- **Lotes com commits intermediários e checkpoints:** rejeitada; exigem estado de retomada e abrem a janela de carga parcial, sem ganho medido.
- **Staging persistente e troca por renomeação:** rejeitada; o EX não faz DDL (ADR-005).
- **Trava consultiva global:** rejeitada; o índice único e a trava da vigente já serializam e permitem reconciliar.
- **`COPY`:** não adotada; `jsonb_to_recordset` bastou e não pede privilégio nem formato extra.
- **Manter mais de uma versão retirada:** rejeitada; custo de espaço sem requisito de retenção.

## Referências

- Plano `_project/drafts/003_implementacao_prototipo/003_plan.md`, item 3, e task `003_task_issue-22.md`.
- [ADR-005](ADR-005_banco_autorizacao_prototipo.md) e [KB-004](../knowledge/KB-004_metodo_recorte_focos_mt.md).
- `docs/runbook.md`, `scripts/banco/carga.mjs`, `manifesto.mjs`, `carga.test.mjs`, `reconstrucao.test.mjs`, `medir-carga.mjs`, `reconstruir.mjs`.
