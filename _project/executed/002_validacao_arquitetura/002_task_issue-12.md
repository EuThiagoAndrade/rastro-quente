# Task — Issue #12: Cenários e dimensionamento documental

> **Ciclo:** `002`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `chore`
> **Issue:** `#12`
> **Plano:** `_project/executed/002_validacao_arquitetura/002_plan.md`
> **Branch:** `chore/issue-12`
> **PR:** [#15](https://github.com/EuThiagoAndrade/rastro-quente/pull/15)
> **Integração:** `PR #15 integrada em main em 2026-11-05; Governance aprovado na PR e em main`
> **Autorização inicial:** "autorizo a implementação da issue #12" em 2026-11-05
> **Modo contínuo:** `—`
> **Início:** 2026-11-05
> **Última atualização:** 2026-11-05
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 1 do plano v2: modelo documental de carga para um usuário, Mato Grosso, até dois anos e atualização sob demanda, preservando três hipóteses de conjuntos persistidos.

## Escopo autorizado

Criar `002_research_cenarios.md`, com inventário, cenários, variáveis, fórmulas, evidências e lacunas. Somente metadados públicos, estatísticas oficiais e materiais versionados do ciclo 001. Sem recontagem local, download de bases, benchmark, implementação de serviços ou escolha de política de persistência. Itens 2 e 3 continuam dependentes de autorizações próprias e da integração das entregas anteriores.

## Origem no backlog

Não se aplica. Demanda direta do responsável; nenhum ID do backlog foi selecionado. Snapshot herdado do plano.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Volume e recorte territorial exigem proveniência; modelo separa registros de eventos e não muda método. Casos aritméticos independentes e limites de extrapolação serão registrados no relatório. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Esta unidade não compara nem altera autenticação, matriz de acesso, tabelas ou RLS; a barreira do ciclo continua aplicável ao item 3. |
| G3 — privacidade de dados | Sim | Somente sínteses, metadados públicos e números fictícios de sensibilidade; sem leitura de materiais em `local/`. Revisão semântica antes de commit e publicação. |
| G4 — migrações só acrescentam | Não | Nenhuma migração ou banco nesta unidade. |

## Execução

- [x] Confirmar issue aberta, plano aprovado, PR #11 integrada e autorização humana.
- [x] Ler autoridades, template de task, template de PR e `governance-check`.
- [x] Isolar execução em worktree `C:/Programas/rastro-quente-issue-12`, branch `chore/issue-12`, base `1e794cf91d46276b14a12b3ecd1de187e22b87af`.
- [x] Entregar inventário, cenários cruzados por conjunto e frequência, cálculos e lacunas em `002_research_cenarios.md`.
- [x] Executar gates e conferir G3 e staging seletivo dos quatro arquivos.
- [x] Publicar e conferir a PR #15, de `chore/issue-12` para `main`, com diff limitado à entrega.
- [x] Consultar os checks reais da PR; acompanhamento do último commit no GitHub, sem presumir sucesso.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Precondições | Issue #12 `OPEN`; PR #11 `MERGED` em 2026-11-05, merge `1e794cf91d46276b14a12b3ecd1de187e22b87af`; nenhuma PR de `chore/issue-12` na consulta inicial. |
| Contas e critérios de aceite | Relatório: inventário/proveniência nas seções 1–2; três conjuntos e janela na 3; entradas/unidades na 4; cenários e frequências/cargas hipotéticas na 5; fórmulas e contas reproduzidas na 6; lacunas e encaminhamento nas 7–8. Nenhum valor estadual de dois anos foi apresentado como medido. |
| Testes | Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 passaram, zero falhas. Contas da seção 6.4 executadas e conferidas com somas por coluna e inversão do limiar; resultados coincidentes. Sem testes de banco, RLS, carga ou recuperação executados. |
| Validador | `node scripts/validate-governance.mjs`: zero erros, zero avisos, nove itens manuais. |
| `git diff --check` | Passou na conferência local. |
| Publicação | Commit de entrega `d9aecbe602582dafe1d113d0db34c2b9e3ece1b0` publicado; PR #15 aberta e quatro arquivos conferidos pelo GitHub. Este registro documental é atualizado em commit posterior da mesma PR. |
| Checks remotos | Workflow `Governance`, job `Validate governance`, observado como `QUEUED` na abertura da PR #15 sobre `d9aecbe`; o último push reexecuta os checks. O estado atual e o resultado de cada execução são verificáveis na PR, sem presumir aprovação. |
| Reconciliação após integração | Em 2026-11-05: PR #15 `MERGED` às 17:09:34Z, issue #12 `CLOSED`; `Validate governance` concluído com `SUCCESS` na PR e em main ([execução de main](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/42071841932/job/127401565607)). O próximo workflow mutante reconciliou esta task; relatório do item 1 preservado. |
| Revisões preservadas | Seção `Revisão crítica` idêntica à base integrada; SHA-256 `15b20aedee0189a4f3016e800c6e37c6c055149dff3934f3523a731a72cb80a3`. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- O MCP GitHub Docker foi tentado conforme preferência humana e retornou `401 Bad credentials`. O segundo conector informou indisponibilidade. Consultas somente leitura por `gh` confirmaram issue e integração; fallback operacional desta execução, sem nova regra de governança.
- O checkout original continha alterações não commitadas exclusivamente em plano e `cycles.md`, registrando a criação das issues. Foram preservadas integralmente no original e copiadas para reconciliação nesta entrega após conferir os fatos remotos. Não foi alterada a branch original.
- Relatório auxiliar segue a estrutura de evidências exigida pelo item 1; não há template de relatório imposto pelo plano. Task usa `.agent/templates/task.md`; atualização de plano usa `.agent/templates/plano_implementacao.md`.
- G3 e conferências manuais: diff contém somente governança de execução e sínteses públicas/sensibilidades fictícias. Sem dados pessoais, credenciais, geometrias ou arquivos de trabalho; nenhuma leitura de `local/`. Referências locais conferidas; autorização literal e limites de G1/G2 revistos. Não há afirmação de design system, deploy ou exclusão remota testados.
- O levantamento histórico não havia localizado orientação de citação do INPE; a pergunta 36 do FAQ oficial foi localizada nesta entrega e registrada no novo relatório, sem reescrever a evidência do ciclo 001. A licença específica da malha/API continua uma lacuna.
- A referência isolada à cota de banco Supabase serve somente à conferência abaixo/no limite/acima exigida na estratégia do plano. Não antecipa a pesquisa completa de capacidades/custos da #13 nem conclui compatibilidade.
- Reconciliação em 2026-11-05 durante o início autorizado da #13: integração efetiva conferida no GitHub; autorização literal "autorizo a implementação da issue #13" recebida e registrada na nova task `002_task_issue-13.md`, que assume o papel de artefato ativo. Não foi presumida autorização para a #14 nem realizado novo merge.

## Encerramento

Não se aplica. Primeira issue de ciclo completo; nenhuma movimentação para `executed/`.

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
- `logical_key`: `rastro-quente + 002 + implementar_issue + issue-12/item-1 + 1e794cf91d46276b14a12b3ecd1de187e22b87af`
- `effect_class`: `local_mutation`
- `state_before`: plano v2 aprovado e integrado; issue #12 aberta, sem task ou PR; autorização explícita recebida em 2026-11-05.
- `state_after`: relatório do item 1 integrado pela PR #15; task `Concluída`, plano `Em Execução` e ciclo `Em execução`. Integração reconciliada neste workflow mutante, sem alterar o relatório; próximo item autorizado na task #13.
- `result`: `already_executed_and_reconciled`
- `evidence`: autorização literal no cabeçalho, contas e gates da publicação preservados; PR #15 integrada, issue #12 fechada e checks da PR/main verdes conferidos em 2026-11-05; autorização da #13 registrada no artefato ativo seguinte.
- `blockers`: nenhum para o item 1 integrado; item 2 tem autorização própria na task #13. Item 3 continua dependente da integração do item 2 e de nova autorização.

## Referência do bootstrap

Não se aplica ao ciclo 002; nenhuma exceção do ciclo 000 foi utilizada.
