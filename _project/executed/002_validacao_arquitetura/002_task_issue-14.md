# Task — Issue #14: Arquiteturas, acesso e parecer documental

> **Ciclo:** `002`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `chore`
> **Issue:** `#14`
> **Plano:** `_project/executed/002_validacao_arquitetura/002_plan.md`
> **Branch:** `chore/issue-14`
> **PR:** [#17](https://github.com/EuThiagoAndrade/rastro-quente/pull/17)
> **Integração:** `PR #17 integrada em main em 2026-11-05 (squash); Governance aprovado na PR e em main`
> **Autorização inicial:** "autorizo a implementação da issue #14" em 2026-11-05
> **Modo contínuo:** `—`
> **Início:** 2026-11-05
> **Última atualização:** 2026-11-05
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 3 do plano v2: comparar três alternativas de processamento, propor acesso e provas futuras e consolidar parecer documental limitado às evidências dos itens 1 e 2, com atualização da KB-003.

## Escopo autorizado

Criar `002_research_arquitetura.md`, preservar os três conjuntos e os 27 cenários em cada alternativa, descrever fluxos e fronteiras de confiança, matriz conceitual de acesso/RLS e protocolos futuros. Atualizar somente o estado/conclusões/limites da KB-003 e reconciliar a task #13 integrada. Sem serviço, scaffold, conta, custo, benchmark, migração, política executável, método ambiental ou arquitetura aceita. Encerramento do ciclo completo fica em PR própria após integração das entregas.

## Origem no backlog

Não se aplica. Demanda direta do responsável; nenhum ID do backlog foi selecionado. Snapshot herdado do plano.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Conjuntos, cenários e proveniência herdados; não extrapolar Colniza nem preencher processamento desconhecido. Casos independentes serão requisitos de provas futuras, não execução ou regra ambiental nova. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Propor acessos permitidos/negados, classificação de dados, segredos e risco de processos privilegiados, sem política implantada ou segurança comprovada. |
| G3 — privacidade de dados | Sim | Documentação e sínteses públicas, identidades/fixtures somente fictícias nos protocolos. Sem leitura de `local/`, credenciais ou contas. Revisão semântica antes de publicar. |
| G4 — migrações só acrescentam | Não | Nenhuma migração nesta unidade; futura fundação deverá usar somente migrações aditivas. |

## Execução

- [x] Confirmar issue #14 aberta, plano v2 e dependências #12/#13 integradas pelas PRs #15/#16.
- [x] Conferir main e criar worktree `C:/Programas/rastro-quente-issue-14`, branch `chore/issue-14`, base `2cb40044bd42edefac94cbd1d360dd8ebcd9f67d`; nenhuma PR anterior dessa branch encontrada.
- [x] Ler autoridades, workflows e templates `.agent/templates/task.md`, `.agent/templates/plano_implementacao.md`, `.agent/templates/kb.md` e `.github/pull_request_template.md`; aplicar `governance-check` ao final.
- [x] Comparar três alternativas, dez recursos materiais e 27 cenários por alternativa (81 avaliações) no relatório `002_research_arquitetura.md`.
- [x] Propor matriz para quatro papéis, cinco protocolos futuros, atualizar KB-003 e reconciliar #13 integrada.
- [x] Conferir critérios, contas, G3 e gates; publicar PR #17, com cinco arquivos, branch e base verificados no GitHub.
- [x] Consultar checks reais e acompanhar o último push antes de solicitar integração.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Dependências | PR #15 integrada; PR #16 `MERGED` em 2026-11-05 às 17:45:40Z, com `Validate governance` em `SUCCESS`. Check de main também `success` ([execução](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/42077763268/job/127422412952)). |
| Critérios de aceite | Relatório: alternativas/fluxos/fronteiras/ciclo de dados na seção 3; dez recursos materiais na 4; matriz de acesso/segredos na 5; resultados para 27 cenários × três alternativas e precedência na 6; lacunas/protocolos/decisões na 7; parecer limitado e KB-003 na 8. Título obrigatório presente no relatório e na KB. |
| Testes | Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 passaram, zero falhas. Contas e precedência do parecer conferidas sem serviços; nenhum teste de login, RLS, carga, expurgo ou recuperação executado. |
| Validador | `node scripts/validate-governance.mjs`: zero erros, zero avisos, nove itens manuais. |
| `git diff --check` | Passou na conferência local. |
| Consistência | 27 cenários únicos, nove por conjunto e 81 resultados EI; dez recursos, cinco protocolos e oito IDs de fontes presentes. Relatórios dos itens 1/2 e fatos municipais da KB preservados. Revisão crítica do plano idêntica à base, SHA-256 `15b20aedee0189a4f3016e800c6e37c6c055149dff3934f3523a731a72cb80a3`. |
| Publicação | Commit de entrega `9a670d1ff6868946c31037359bfc24d3b31deedd` publicado; PR #17 `OPEN`, de `chore/issue-14` para `main`, com os cinco arquivos previstos. Este registro é atualizado em commit documental posterior na mesma PR. |
| Checks remotos | `Governance / Validate governance` observado como `QUEUED` na abertura sobre `9a670d1` ([execução](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/42080471636/job/127431855156)). O último push reexecuta os checks; estado atual verificável na PR, sem sucesso presumido. |
| Reconciliação após integração | PR #17 `MERGED` em 2026-11-05 às 18:08:06Z; issue #14 `CLOSED`; Governance `SUCCESS` em main ([execução](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/42081315005)). O parecer e a KB-003 permanecem preservados. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- MCP GitHub Docker tentado por preferência humana; retornou `401 Bad credentials`. `gh` foi usado como fallback para confirmar issue, integração e checks, sem nova política de ferramenta.
- Checkout original com alterações preexistentes e worktrees anteriores preservados. Branch nova deriva da main integrada, sem copiar estado antigo do checkout original.
- Relatório auxiliar segue o item 3 do plano; nenhum template de relatório próprio foi imposto. KB-003 segue o template `kb.md`, preservando origem e histórico existentes.
- Matriz de acesso é proposta, sem adoção de schema, política de persistência ou regra ambiental. A1 mantém persistência completa local e parcela publicada desconhecida, sem reduzir o conjunto silenciosamente. Nenhuma prova dos protocolos foi executada.
- G3 e inspeção manual: somente sínteses públicas e propostas com identidades/fixtures fictícias; sem dados pessoais, contatos, credenciais, geometrias ou materiais de `local/`. Referências locais e fontes oficiais conferidas; diagramas Mermaid revisados como fluxos lógicos, sem alegação de renderização/execução de aplicação.
- Reconciliação da #13 limitada ao estado/evidências remotos; nenhum SHA do próprio merge incluído naquela task. Nenhuma mudança em código, validador, ADRs, regras ou backlog. Encerramento não antecipado.

## Encerramento

Encerramento prospectivo documentado em `002_task_closure.md`. Esta task registra a conclusão da issue #14; o estado global do ciclo vale depois do merge da PR de encerramento.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 002 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 002 + atualizar_docs + reconciliar_issue-14 + 7992dfbbec6ee4e8cee8eca497ea8f828a135763`
- `effect_class`: `local_mutation`
- `state_before`: task #14 `Aguardando integração`; PR #17 já integrada, issue #14 fechada e Governance aprovado em main.
- `state_after`: task #14 `Concluída`; relatório do item 3 e KB-003 integrados; encerramento prospectivo do ciclo documentado na task própria.
- `result`: `already_executed_and_reconciled`
- `evidence`: PR #17 `MERGED`, issue #14 `CLOSED` e check Governance `SUCCESS` em main ([execução](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/42081315005)); conteúdo do parecer preservado.
- `blockers`: nenhum para a issue #14; o merge da PR de encerramento ainda exige checks verdes e aprovação específica.

## Referência do bootstrap

Não se aplica ao ciclo 002; nenhuma exceção do ciclo 000 utilizada.
