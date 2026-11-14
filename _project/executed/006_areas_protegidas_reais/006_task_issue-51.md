# Task — Issue #51: Lente de sobreposição com áreas protegidas

> **Ciclo:** `006`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#51`
> **Plano:** `_project/executed/006_areas_protegidas_reais/006_plan.md`
> **Branch:** `feature/issue-51`
> **PR:** [#55](https://github.com/EuThiagoAndrade/rastro-quente/pull/55)
> **Integração:** PR #55 integrada em 2026-11-14 (`453d046`)
> **Autorização inicial:** "autorizo a implementação da issue #51" em 2026-11-14
> **Modo contínuo:** `—`
> **Início:** 2026-11-14
> **Última atualização:** 2026-11-14
> **handoff_schema_version:** `2`

## Objetivo

Implementar a lente de sobreposição por classe de área protegida (T22 e T23) e o leitor completo das tabelas de áreas e vínculos (T25), com casos de referência e conferência independente por SQL, sem interface.

## Escopo autorizado

Item 3 do plano e issue #51: `src/lentes/carregar-areas.ts`, `src/lentes/sobreposicao.ts`, a fixture e os casos SB-1 a SB-16, o teste do leitor pela API local, `scripts/lentes/conferir-sobreposicao.mjs` com o script `conferir:sobreposicao`, o registro da conferência no relatório do ciclo e a seção "Sobreposição" da KB-005. Sem alterar `TipoLente`, `VERSAO_METODO`, C1, as três lentes, a combinação ou a interface (item 4).

O responsável determinou, junto com a autorização, que a reconciliação da task da issue #50 (integração da PR #54 e ação humana externa concluída) siga nesta mesma branch e PR, em commit próprio.

## Origem no backlog

BL-002, snapshot e parcela conforme o plano 006, referenciado a `_project/backlog.md` no commit `83e3a58`, integrado em main; destino em preparação.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regra S1 de T22 implementada com versão própria `sobreposicao-006-v1`. Casos SB-1 a SB-16 com valores escritos à mão no plano e na fixture fictícia. Conferência independente por SQL, célula a célula, nas três classes e três janelas, sem divergência; células da janela inteira iguais à etapa 2 (39, 74 e 747) na identidade da carga hospedada; mutação proposital detectada. Limitações e aviso de domínio em todo resultado; sem ordem por área ou contagem. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Sem migração, política ou RPC nova. O leitor T25 lê as tabelas sob RLS e diagnostica a ausência da linha da carga pela sondagem existente. Pela API local, a revogação entre páginas recebeu HTTP 416 (`PGRST103`) e terminou em `acesso_negado`; os diagnósticos seguem `destinoErro`. `test:rls` completo passou. |
| G3 — privacidade de dados | Sim | Fixtures e cargas de teste fictícias (e-mails `.test`, áreas A1 a A9). Dados reais só em `local/`; o relatório versionado traz agregados por classe, sem nome de área. O JSON completo da conferência fica em `local/dados-prototipo/`. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada, alterada, renomeada ou removida. |

## Execução

- [x] Reconciliar a task da issue #50 em commit próprio.
- [x] Leitor T25 (`carregar-areas.ts`) com fontes injetadas e diagnóstico da ausência.
- [x] Lente `sobreposicao.ts` (T22, T23), `qualificarSobreposicao` e `municipiosDaSobreposicao`.
- [x] Fixture e casos SB-1 a SB-16 (`tests/unit/sobreposicao.test.mjs`).
- [x] Fontes do leitor sobre a API (`scripts/lentes/fontes-areas.mjs`) e caso T25 em `scripts/banco/api.test.mjs`.
- [x] Conferência `conferir:sobreposicao` e registro no relatório do ciclo.
- [x] Seção "Sobreposição" na KB-005.
- [x] Gates locais.
- [x] Publicar PR (#55); checks remotos verdes; integrada por squash.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | Interface: 98 (79 anteriores sem mudança e 19 novos). `test:rls`: 202 pgTAP e 37 Node, inclusive o T25 pela API. Protótipo: 67; governança: 55. Typecheck e build passaram. E2E: 68 passaram. |
| Conferência local | `conferir:sobreposicao`: `conferido`, identidade `d0739e4e…6813` no início e no fim, igual à hospedada; 0 divergências; grade T1 igual em 10.640 detecções. Relatório em `006_research_conferencia_areas.md`. |
| Validador | 0 erros e 0 avisos, com itens manuais. |
| `git diff --check` | Passou. |
| Checks remotos | Validate governance, Database RLS and query contract e Interface typecheck, build and E2E passaram na PR #55. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Valores da fonte sem conversão de caixa:** o motivo usa categoria, esfera e fase como guardadas (por exemplo "Parque", "Federal", "Regularizada"). Os exemplos de T23 estão em minúsculas; a fixture usa minúsculas e reproduz literalmente SB-1 e SB-6. Não se inventou regra de caixa.
- **Prefixo nas ressalvas do destaque:** cada ressalva do destaque leva o nome exibido da área ("A1: 1 detecção exatamente sobre o limite da área"); a lista da área mantém o texto de T22 sem prefixo. Assim, uma célula com várias áreas não perde a origem de cada ressalva.
- **Retrato na limitação (2):** a lente não recebe as fontes; o texto diz "CNUC e FUNAI; versão e data no cartão de Proveniência". O item 4 exibe a atribuição com fonte e data.
- **Classe inválida:** `ErroEntradaSobreposicao` estende `ErroLente`. Atende T22 ("ErroLente") e permite distinguir a entrada inválida de SB-11.
- **Qualidade de polígono:** só os três valores observados de `quali_pol` são aceitos; outro valor lança `ErroLente`, em vez de omitir a ressalva.
- **Fontes do leitor nos scripts:** a implementação do leitor sobre a API ficou em `scripts/lentes/fontes-areas.mjs`, com supabase-js e `sondarAcesso`, sem alterar `src/consulta.ts`, que o plano destina ao item 4.
- **Dependências locais:** `node_modules` ausente; `npm ci` instalou o lockfile existente, sem dependência nova.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 006 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + reconciliar_integracao + 51 + 453d046`
- `effect_class`: `local_mutation`
- `state_before`: PR #55 integrada em `main`; task ainda registrada como `Aguardando integração`.
- `state_after`: integração reconciliada; task `Concluída`; reconciliação gravada na branch `feature/issue-52`, em commit próprio, pelo workflow seguinte.
- `result`: `executed`
- `evidence`: PR #55 integrada em 2026-11-14 pelo commit `453d0466dcace7c9e3c7ca7e459e2f6bae39ace8`, com os três checks remotos em `SUCCESS`; issue #51 fechada.
- `blockers`: nenhum.

### Registro anterior — publicação da PR

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + implementar_issue + 51 + acb54c0`
- `effect_class`: `remote_mutation`
- `state_before`: issue #51 aberta; PR #54 integrada e ação externa da issue #50 concluída; task da issue #50 com reconciliação local não commitada.
- `state_after`: branch `feature/issue-51` com a reconciliação da #50 e a entrega do item 3; PR #55 aberta, aguardando checks e aprovação do merge.
- `result`: `executed`
- `evidence`: gates e conferência locais acima.
- `blockers`: nenhum.
