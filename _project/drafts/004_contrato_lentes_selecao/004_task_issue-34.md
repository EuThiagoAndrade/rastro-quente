# Task — Issue #34: Lente de recorrência por célula de 0,05°

> **Ciclo:** `004`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#34`
> **Plano:** `_project/drafts/004_contrato_lentes_selecao/004_plan.md`
> **Branch:** `feature/issue-34`
> **PR:** [#37](https://github.com/EuThiagoAndrade/rastro-quente/pull/37)
> **Integração:** `PR #37 integrada em main em 2026-11-11 (4e4d56f); checks verdes na PR (Validate governance, Database RLS and query contract e Interface typecheck, build and E2E)`
> **Autorização inicial:** "autorizo a implementação da issue #34" em 2026-11-11
> **Modo contínuo:** `—`
> **Início:** 2026-11-11
> **Última atualização:** 2026-11-11
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 2 do plano `004` v3: a lente de recorrência sobre células de 0,05° (grade T1), que conta os meses GMT distintos com detecção na janela e destaca as células com pelo menos 3 meses. Todo mês tocado pela janela conta, e o parcial é marcado (D14); com menos de 3 meses tocados, o estado é `janela_insuficiente`. A lente usa o contrato, o carregador, a cobertura (união D13) e o cartão do item 1, sem migração. Inclui casos R, E2E, conferência independente e medição das duas lentes, KB e guia.

## Escopo autorizado

Issue [#34](https://github.com/EuThiagoAndrade/rastro-quente/issues/34) e item 2 do plano.

- **Arquivos:** `src/lentes/recorrencia.ts`, `src/lentes/contrato.ts`, `src/app.ts`, `src/apresentacao-lentes.ts`, `src/apresentacao.ts` (exporta a tabela existente), `index.html`, `tests/unit/lentes.test.mjs`, `tests/fixtures/lentes/recorrencia.json`, `tests/e2e/05-lentes.spec.mjs`, `tests/e2e/fixture.mjs`, `scripts/lentes/conferir.mjs`, `scripts/interface/medir-lentes.mjs`, KB-005, `docs/runbook.md` (seção 10), relatório `004_research_conferencia_lentes.md`, plano, esta task e a reconciliação da task da issue #33.
- **Fora do escopo:** persistência (issue #35); persistência de resultados; combinação de lentes; migração, função, tabela, política ou grant novos; fontes externas; novos parâmetros ou mudança do método aprovado.
- **Autorização:** cobre implementação, testes e preparação e publicação da PR; não cobre merge.

## Origem no backlog

Snapshot herdado do plano: BL-001, item inteiro, referência `_project/backlog.md` em `85b444d` (já em `main`). Destino em preparação; o retorno ao backlog só depois do encerramento do ciclo.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regras do plano (Q3, Q5, Q8, D13, D14, M1-a, T1 e T5) implementadas sem decisão nova. Casos R-1 a R-4 com esperado escrito à mão em `tests/fixtures/lentes/recorrencia.json`, mais coordenada inválida, conferência divergente, determinismo e união D13; os casos do item 1 continuam passando. Conferência independente na carga real: SQL a partir do texto da fonte × RPC → TypeScript, em quatro janelas, sem divergência (inclusive a de 3 meses com bordas parciais e as de 1 e 2 meses em `janela_insuficiente`); grade T1 em 10.640 detecções por `id_tecnico`, 0 diferenças. Diferença para as 142 células da grade de 5 km explicada no relatório. Limitações das células e aviso de domínio em todo resultado. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, política ou grant novo (`supabase/` intocado). A lente só chama as RPCs existentes sob a sessão; os caminhos de limpeza do item 1 valem para ela. `test:rls` continua verde. |
| G3 — privacidade de dados | Sim | Fixtures fictícias (códigos `99100xx` e `99000xx`, ids `x1`, `ra1`…) e carga fictícia própria no E2E. A carga real foi usada só localmente, com RP fictício `.test` criado e removido pelos scripts. O relatório tem só agregados públicos (contagens por célula e município, do INPE e do IBGE). Nada no bundle nem em armazenamento do navegador. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada ou alterada. |

## Execução

- [x] Confirmar a issue #34 aberta, o plano v3 aprovado, o item 1 integrado (PR #36, `69575ad`), a autorização literal e a base.
- [x] Ler autoridades, `implementar_issue`, templates de task e PR, `governance-check`, `lessons_learned`, o código e os testes do item 1.
- [x] Criar `feature/issue-34` a partir de `main` (`69575adbcee8958a46c8a01be6ae732c18cd5b7d`).
- [x] Módulo `src/lentes/recorrencia.ts` e casos R-1 a R-4.
- [x] Seletor, rótulos da lista, painel com municípios da cobertura e evidência paginada, estado `janela_insuficiente`.
- [x] E2E da recorrência sobre carga fictícia de três meses, inclusive a concorrência com a concentração.
- [x] Conferência e medição das duas lentes com a carga real; relatório atualizado.
- [x] KB-005, guia da interface e reconciliação da task da issue #33 (PR #36 integrada).
- [x] Gates finais; publicar `feature/issue-34` (base `origin/main` em `69575ad` conferida), abrir a PR [#37](https://github.com/EuThiagoAndrade/rastro-quente/pull/37) com `Closes #34` e gravar o bloco "Aguardando merge".

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Unitários (`npm run test:interface`) | 58 testes, 0 falhas (4 novos da recorrência) |
| `npm run typecheck` e `npm run build` | Sem erros; bundle de 421 kB (117 kB gzip) |
| `npm run conferir:lentes` (commit `458e8bb`) | `conferido`: quatro janelas sem divergência na concentração e na recorrência; 150 células recorrentes na janela inteira, 9 na de bordas parciais e `janela_insuficiente` nas de 1 e 2 meses; 10.640 detecções na mesma célula pelos dois caminhos; carga `2134ff14…0db2` no início e no fim |
| `npm run medir:lentes` (commit `458e8bb`) | Concentração: mediana comprimida 5,8 s, bytes brutos 4.859.185. Recorrência: mediana comprimida 14,5 s (máximo 16,2 s), bytes brutos 8.322.074. Orçamento 20,0 s e 10.000.000 bytes; 3 válidas por lente e passagem, 0 inválidas |
| `npm run test:rls` | pgTAP 173 testes e API 35, todos verdes |
| `npm run test:e2e` | 51 de 51 passam (16 na spec de lentes, 4 novos da recorrência); neste ambiente, o teste de logout que falhava no item 1 também passou |
| Governança | `node --test scripts/validate-governance.test.mjs`: 55 testes, 0 falhas; `node scripts/validate-governance.mjs`: 0 erros, 0 avisos, 9 conferências manuais |
| `git diff --check` | Sem erros; staging revisado e limitado ao escopo; varredura G3 sem e-mail real, UUID ou segredo nos documentos |
| Checks remotos | PR #37: Validate governance, Database RLS and query contract e Interface typecheck, build and E2E verdes; run de `main` 43047586770 verde (reconciliado na task da issue #35) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Carga fictícia própria no E2E.** A fixture compartilhada só tem outubro de 2026 (um mês), o que daria sempre `janela_insuficiente`. O bloco de recorrência da spec 05 publica, pelo mesmo protocolo de limpeza, uma carga fictícia de agosto a outubro (`sqlFixtureRecorrencia`, identidade `e…e3`) e restaura a fixture original no fim. Os valores esperados estão derivados à mão no comentário da fixture. A divisa Alfa/Beta dessa carga fica em −55,98, dentro de uma célula, para exercitar a união D13.
- **Janela insuficiente lê os registros.** A lente lê e confere os registros também quando a janela toca menos de 3 meses, para que todo resultado leve a mesma conferência (C1). O custo é o de uma leitura curta; o resultado sai sem destaques.
- **Coordenada inválida na recorrência.** Uma coordenada fora da forma canônica de T1 faz a lente inteira ficar "leitura inconsistente", sem destaques parciais, em vez de descartar a detecção em silêncio.
- **Tabela de evidência.** 20 detecções por página, com "Mostrando X–Y de M detecções da evidência" e foco no texto ao paginar. As coordenadas aparecem no valor canônico (`String(x)`), o mesmo usado pela grade.
- **Nomes nos dias restritivos.** O painel passou a mostrar o nome e o código do município nos dias que contam contra, também na concentração (antes só o código).
- **Lista dos dias restritivos por md5 na conferência.** O caminho SQL devolve o md5 do texto da lista, e o caminho TypeScript calcula o md5 do mesmo texto, para a saída do `psql` caber no buffer padrão. N de M e as demais colunas são comparados em claro.
- **Teste de logout local (herdado do item 1).** "Logout limpa a tela, o estado e a sessão guardada" falhou neste Windows durante o item 1 (ver a task da issue #33) e passou nas execuções deste item; nada foi alterado nele.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Pronto para continuar — ciclo 004 (completo)
Quem: Qualquer ferramenta, a pedido do responsável
Conferir: —
Diga: "continue o ciclo 004"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + implementar_issue + 34 + 69575ad`
- `effect_class`: `remote_mutation`
- `state_before`: plano v3 `Em Execução`; item 1 integrado (PR #36); issue #34 aberta; nenhuma implementação do item 2.
- `state_after`: item 2 implementado e validado localmente na branch `feature/issue-34` (código em `458e8bb`); branch publicada e PR #37 aberta, aguardando checks e merge.
- `result`: `executed`
- `evidence`: tabela "Evidências" acima; relatório `004_research_conferencia_lentes.md`.
- `blockers`: nenhum para a publicação. O merge depende de checks verdes e de "aprovo o merge da PR #37".

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
