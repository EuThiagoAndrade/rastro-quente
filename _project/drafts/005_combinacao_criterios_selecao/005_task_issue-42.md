# Task — Issue #42: Regra de combinação de lentes por célula de 0,05°

> **Ciclo:** `005`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `feature`
> **Issue:** `#42`
> **Plano:** `_project/drafts/005_combinacao_criterios_selecao/005_plan.md`
> **Branch:** `feature/issue-42`
> **PR:** —
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #42" em 2026-11-12
> **Modo contínuo:** `—`
> **Início:** 2026-11-12
> **Última atualização:** 2026-11-12
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 1 do plano `005` v2: o módulo puro e determinístico de combinação de lentes (`src/lentes/combinacao.ts`), que calcula concentração, recorrência e persistência sobre a mesma entrada conferida (T8) e as combina por célula de 0,05° com "e" ou "ou". O resultado preserva, por célula, o motivo, a evidência e as ressalvas de cada destaque original, qualifica a cobertura da célula (V1) e calcula as ressalvas da persistência sequência a sequência. Inclui os casos CB-1 a CB-16, a conferência independente com a carga real e a KB-005. Não inclui interface.

## Escopo autorizado

Issue [#42](https://github.com/EuThiagoAndrade/rastro-quente/issues/42) e item 1 do plano.

- **Arquivos:** `src/lentes/combinacao.ts`, `tests/unit/combinacao.test.mjs`, `tests/fixtures/lentes/combinacao.json`, `scripts/lentes/conferir-combinacao.mjs`, `package.json` (script `conferir:combinacao`, sem dependência nova), KB-005, relatório `005_research_conferencia_combinacao.md`, plano (estado e rastreabilidade), `_project/cycles.md` e esta task.
- **Fora do escopo:** interface do item 2 (`src/app.ts`, apresentação, `index.html`, E2E e medição); mudança em C1 ou nas três lentes; migração, função, tabela, view, política ou grant; dependência nova; verificação em produção; encerramento do ciclo.
- **Autorização:** cobre branch, task, implementação, testes, conferência local com a carga real em `local/` e a PR da issue. Não cobre merge, mudança de regra ou de parâmetro, nem a decisão que uma parada exigir.

## Origem no backlog

Snapshot herdado do plano: BL-005, item inteiro, referência `_project/backlog.md` em `2e31651` (já em `main`). Destino em preparação; o retorno ao backlog só depois do encerramento do ciclo.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regra nova implementada sem decisão nova: Q1 a Q9 e T8 a T14, ratificados na aprovação do plano. Casos CB-1 a CB-16 com esperado escrito à mão em `tests/fixtures/lentes/combinacao.json`; os casos do ciclo `004` passam sem alteração. Conferência independente na carga real (SQL a partir do texto da fonte × RPC → TypeScript): sem divergência nas 8 combinações e nas quatro janelas, célula a célula, com os números da exploração reproduzidos; `conferir:lentes` sem divergência. Limitações da combinação e aviso de domínio em todo resultado; sem pontuação nem ordem por critério. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, view, política ou grant novo; o módulo é puro e a conferência usa as RPCs existentes sob a sessão de um RP fictício. |
| G3 — privacidade de dados | Sim | Fixtures fictícias (códigos `99200xx`, ids como `a1-0820`). A carga real (pública, INPE e IBGE) só é usada localmente, com RP fictício `.test` criado e removido pelo script; o relatório versionado traz só agregados públicos. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada ou alterada. |

## Execução

- [x] Confirmar a issue #42 aberta, o plano v2 aprovado e integrado (PR #41, `26fc09c`), a autorização literal e a base (`origin/main` em `26fc09c`; `chore/cycle-005-plan` sem diferença de árvore para `main`).
- [x] Ler autoridades, `implementar_issue`, templates de task e KB, `governance-check`, `lessons_learned`, o código das lentes e a conferência do ciclo `004`.
- [x] Criar `feature/issue-42` a partir de `origin/main` (`26fc09c8191fb0b3fb4aa21ae625e630a67a49f2`), levando o registro ainda não commitado da criação das issues (plano e `cycles.md`); plano `Em Execução` e ciclo `Em execução`.
- [x] Módulo `src/lentes/combinacao.ts` e casos CB-1 a CB-16.
- [x] Commit do código (`6b793c4`) e conferência independente com a carga real nesse commit; relatório `005_research_conferencia_combinacao.md`.
- [x] KB-005: seção "Combinação", limite de autoridade, módulos, testes, fontes e histórico.
- [x] Gates locais.
- [ ] Publicar `feature/issue-42`, abrir a PR com `Closes #42` e gravar o bloco "Aguardando merge".

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Casos CB (`node --test tests/unit/combinacao.test.mjs`) | 17 testes, 0 falhas (CB-1 a CB-16 e o ponto de entrada de produção com N=10) |
| Unitários (`npm run test:interface`) | 79 testes, 0 falhas (62 anteriores, sem alteração, e 17 novos) |
| `npm run typecheck` e `npm run build` | Sem erros; bundle de 424 kB (118 kB gzip), igual ao anterior, porque o módulo ainda não é importado pela aplicação |
| `npm run conferir:combinacao` (commit `6b793c4`) | `conferido`: 8 combinações × 4 janelas sem divergência, célula a célula; números da exploração reproduzidos (6, 1.116, 77, 31, 9, 1.090 e 201 na janela inteira; 1, 14, 22 e 2 em ago–out); 10.640 detecções na mesma célula pelos dois caminhos; carga `2134ff14…0db2` no início e no fim. Uma execução anterior com mutação proposital no módulo terminou `divergente` (prova de sensibilidade), e a mutação foi desfeita antes do commit |
| `npm run conferir:lentes` (commit `6b793c4`) | `conferido` nas quatro janelas do ciclo `004`; 10, 150 e 66 destaques na janela inteira, como no ciclo `004` |
| `npm run test:rls` | pgTAP 173 testes e API 35, todos verdes |
| `npm run test:e2e` | 54 testes: 48 passam. "Logout limpa a tela, o estado e a sessão guardada" (`01-acesso`, fora do escopo) falhou neste Windows, como nos itens do ciclo `004`, e os 5 testes seguintes da spec serial não rodaram; executados à parte (`--grep-invert`), os 11 demais testes de `01-acesso` passam. A CI da PR é a evidência da suíte completa |
| Governança | `node --test scripts/validate-governance.test.mjs`: 55 testes, 0 falhas; `node scripts/validate-governance.mjs`: 0 erros, 0 avisos, 9 conferências manuais |
| `git diff --check` | Sem erros; staging revisado e limitado ao escopo; varredura G3 sem e-mail real, UUID ou segredo (só o RP fictício `.test` do script) |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Concordância de número no motivo da concentração:** o plano dá o modelo "6 detecções nesta célula de Colniza…". Com 1 detecção, o texto usa o singular ("1 detecção nesta célula…"), sem mudar a regra nem o conteúdo.
- **Qualificação em duas etapas:** como nas lentes (`qualificar`), `combinar` devolve as células com cobertura `pendente`, e `qualificarCombinacao` aplica a cobertura e as ressalvas por classe da persistência sobre esse resultado bruto, sempre a partir dele.
- **Parâmetro da projeção:** listado em `parametros` só quando a concentração está entre as lentes, como a limitação de projeção.
- **Entrada inválida:** lentes ou operador fora de T10 lançam `ErroCombinacao` (`entrada_invalida`), distinto de `ErroLente` (`leitura_inconsistente`).
- **Texto do estado `sem_celulas`:** exposto por `textoSemCelulas(operador)`, sem campo novo no contrato.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Pronto para continuar — ciclo 005 (completo)
Quem: Qualquer ferramenta, a pedido do responsável
Conferir: —
Diga: "continue o ciclo 005"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + implementar_issue + 42 + 26fc09c`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` `Aprovado` e integrado (PR #41); issues #42 e #43 abertas; ciclo `005` em `Planejamento`; nenhuma branch de implementação.
- `state_after`: branch local `feature/issue-42`; plano `Em Execução`; ciclo `Em execução`; módulo e casos CB implementados; conferência em andamento.
- `result`: `executed`
- `evidence`: casos CB-1 a CB-16 verdes.
- `blockers`: nenhum até aqui.
