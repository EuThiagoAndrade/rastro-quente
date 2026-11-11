# Task — Issue #33: Contrato de lente, cobertura e lente de concentração

> **Ciclo:** `004`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#33`
> **Plano:** `_project/executed/004_contrato_lentes_selecao/004_plan.md`
> **Branch:** `feature/issue-33`
> **PR:** [#36](https://github.com/EuThiagoAndrade/rastro-quente/pull/36)
> **Integração:** `PR #36 integrada em main em 2026-11-11 (69575ad); checks verdes na PR (Validate governance, Database RLS and query contract e Interface typecheck, build and E2E)`
> **Autorização inicial:** "autorizo a implementação da issue #33" em 2026-11-11
> **Modo contínuo:** `—`
> **Início:** 2026-11-11
> **Última atualização:** 2026-11-11
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 1 do plano `004` v3: o contrato de lente C1, o qualificador de cobertura, a lente de concentração por município (N=10, empatados incluídos) e a interface mínima (seletor, lista, mapa e painel). O cálculo é um módulo puro em TypeScript no cliente, sobre as consultas existentes, sem migração. Inclui casos de referência, E2E, conferência independente por SQL e medição com a carga real local, KB e guia da interface.

## Escopo autorizado

Issue [#33](https://github.com/EuThiagoAndrade/rastro-quente/issues/33) e item 1 do plano, com a ressalva R3-1 incorporada na aprovação.

- **Arquivos:** `src/lentes/`, `src/app.ts`, `src/apresentacao-lentes.ts`, `src/mapa.ts`, `index.html`, CSS existente, `tests/unit/`, `tests/fixtures/lentes/`, `tests/e2e/`, `scripts/lentes/`, `scripts/interface/medir-lentes.mjs`, `package.json` (scripts, sem dependência nova), KB-005, `docs/runbook.md` (seção 10), relatório `004_research_conferencia_lentes.md`, plano, `cycles.md` e esta task.
- **Fora do escopo:** recorrência e persistência (issues #34 e #35); migração, função, tabela, política ou grant novos; combinação de lentes; outras fontes; redesenho visual.
- **Autorização:** cobre implementação, testes e preparação e publicação da PR; não cobre merge.

## Origem no backlog

Snapshot herdado do plano: BL-001, item inteiro, referência `_project/backlog.md` em `85b444d` (já em `main`). Destino em preparação; o retorno ao backlog só depois do encerramento do ciclo.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regras do plano (Q4, D13, D16, M1-a, T1, T3, T5 e T7) implementadas sem decisão nova. Casos de referência C-1 a C-5, G-1, G-2, L-1 a L-3, V-1 a V-4, E-1 e X-1 com esperado escrito à mão em `tests/fixtures/lentes/`. Conferência independente na carga real: SQL × RPC → TypeScript em quatro janelas, sem divergência; grade T1 em 10.640 detecções por `id_tecnico` contra o texto da fonte, 0 diferenças; totais iguais a `consultar_resumo` do mesmo recorte. Limitações e aviso de domínio em todo resultado. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, política ou grant novo (`supabase/` intocado). A lente só chama as RPCs existentes sob a sessão. O E2E prova a limpeza em acesso negado, sessão expirada, carga substituída e logout, e `test:rls` continua verde (173 + 35). |
| G3 — privacidade de dados | Sim | Fixtures fictícias (códigos `99100xx`, `fx…`) e E2E com a fixture fictícia existente. A carga real foi usada só localmente, com um RP fictício `.test` criado e removido pelo script. O relatório e a KB têm só agregados públicos (contagens por município do INPE e nomes do IBGE). Nada no bundle nem em armazenamento do navegador. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada ou alterada. |

## Execução

- [x] Confirmar a issue #33 aberta, o plano v3 aprovado e integrado (PR #32, `fa302b5`), a autorização literal e a base.
- [x] Ler autoridades, `implementar_issue`, templates de task e PR, `governance-check`, `lessons_learned`, o contrato de consulta e os módulos da interface.
- [x] Criar `feature/issue-33` a partir de `main` (`fa302b5bf124ce56501d1303dd64181511c84ace`).
- [x] Módulo puro `src/lentes/` (contrato, grade, cobertura, partes comuns, concentração, carregador e destino dos erros) e casos de referência.
- [x] Integração ao controlador, com `geracaoLente`, tratamento de erros por tipo e a ressalva R3-1 (`aoFalharConsulta` avança a geração da consulta e limpa a lente em `versao_substituida`).
- [x] Cartão, lista, camada de mapa e painel; E2E de lentes (12 testes).
- [x] Conferência independente e medição com a carga real; relatório `004_research_conferencia_lentes.md`.
- [x] KB-005, guia da interface (runbook, seção 10), gates e inspeção de `governance-check`.
- [x] Publicar `feature/issue-33` (base `origin/main` em `fa302b5` conferida), abrir a PR [#36](https://github.com/EuThiagoAndrade/rastro-quente/pull/36) com `Closes #33` e gravar o bloco "Aguardando merge".

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Unitários (`npm run test:interface`) | 54 testes, 0 falhas (13 novos de lentes) |
| `npm run typecheck` e `npm run build` | Sem erros; bundle de 414 kB (115 kB gzip) |
| `npm run conferir:lentes` (commit `72039fd`) | `conferido`: quatro janelas sem divergência; 10.640 detecções na mesma célula pelos dois caminhos; carga `2134ff14…0db2` no início e no fim |
| `npm run medir:lentes` (commit `72039fd`) | Concentração: mediana comprimida 5,8 s (orçamento 20,0 s), bytes brutos 4.859.185 (orçamento 10.000.000); 3 válidas por passagem, 0 inválidas |
| `npm run test:rls` | pgTAP 173 testes e API 35, todos verdes |
| `npm run test:e2e` | 46 de 47 passam; o teste "Logout limpa a tela, o estado e a sessão guardada" falha **neste ambiente local** também em `main` (`fa302b5`) e passa na CI de `main` (run 43027763847). Ver "Decisões incidentais". |
| Governança | `node --test scripts/validate-governance.test.mjs`: 55 testes, 0 falhas; `node scripts/validate-governance.mjs`: 0 erros, 0 avisos, 9 conferências manuais |
| `git diff --check` | Sem erros; staging revisado e limitado ao escopo; varredura G3 sem e-mail real, UUID ou segredo nos documentos |
| Checks remotos | PR #36: Validate governance, Database RLS and query contract e Interface typecheck, build and E2E verdes; run de `main` 43040806837 verde (reconciliado na task da issue #34) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Fixture do E2E.** A fixture de `tests/e2e/fixture.mjs` é compartilhada por todas as specs, e acrescentar detecções mudaria os totais já testados (100; 60, 30 e 10). O E2E de lentes usa a fixture existente, com os valores esperados calculados à mão a partir da definição dela. O exemplo "4 e 10" do plano para o filtro municipal fica com os números da fixture (Gama com 10, estado com 100), com o mesmo efeito.
- **Restauração da fixture na spec 05.** A spec `04-versao` publica uma segunda versão e não a desfaz. A `05-lentes` restaura a fixture original no `beforeAll`, com o mesmo `SQL_LIMPEZA` e `sqlFixture()` do `global-setup`.
- **Ordem entre páginas (desvio técnico do plano, R1-4).** O plano pede "a ordem `(data_hora_gmt, id_tecnico)` crescer estritamente também entre páginas". O banco ordena `id_tecnico` pela collation `en_US.UTF-8` via ICU, que ignora pontuação e caixa (conferido no banco local: `a-1 < A:1 < a:155010 < a:15509 < a:9`). O cliente não reproduz esse desempate. O carregador confere `data_hora_gmt` não decrescente (independe de collation), e a unicidade de `id_tecnico` mais a contagem igual ao total cobrem duplicação e omissão, que são o objetivo da verificação. O caso L-1 (páginas duplicadas) e uma página com ordem temporal invertida (L-2) continuam detectados.
- **Reaproveitamento com resumo relido.** Toda aplicação relê o resumo estadual, o que confere carga e total; os registros em memória só são reaproveitados se o total for o mesmo. É o que permite o cenário R2-1 de `carga_indisponivel` numa segunda aplicação.
- **"Nenhuma" age na hora.** Escolher "Nenhuma" no seletor cancela a lente sem precisar de "Aplicar lente".
- **Passagem bruta pelo proxy.** As duas passagens da medição passam pelo mesmo proxy local; na bruta ele só repassa, sem compressão. O plano dizia "direto na API local"; o repasse não altera corpo nem compressão.
- **Revisão da carga.** A conferência e a medição publicam a carga com a mesma revisão (40), para registrarem a mesma identidade. Numa execução intermediária a medição usou a revisão 41 e outra identidade; os números finais são da revisão 40.
- **Teste de logout local (fora do escopo).** "Logout limpa a tela, o estado e a sessão guardada" (`01-acesso`) falha neste Windows também em `main` sem as mudanças desta issue (2 de 2 execuções): o `localStorage` ainda guarda o token logo depois de a tela limpar. Na CI de `main` ele passa. Não foi alterado; a CI desta PR é a evidência da suíte completa. Fica relatado para decisão, sem correção silenciosa.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 004 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + implementar_issue + 33 + fa302b5`
- `effect_class`: `remote_mutation`
- `state_before`: plano v3 `Aprovado` e integrado (PR #32); issues #33 a #35 abertas; nenhuma implementação.
- `state_after`: item 1 implementado e validado localmente na branch `feature/issue-33` (código em `72039fd`); plano `Em Execução`; ciclo `Em execução`; branch publicada e PR #36 aberta, aguardando checks e merge.
- `result`: `executed`
- `evidence`: tabela "Evidências" acima; relatório `004_research_conferencia_lentes.md`.
- `blockers`: nenhum para a publicação. O merge depende de checks verdes e de "aprovo o merge da PR #36".

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
