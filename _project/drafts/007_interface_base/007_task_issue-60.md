# Task — Issue #60: Contrato visual e estrutura base da interface

> **Ciclo:** `007`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#60`
> **Plano:** `_project/drafts/007_interface_base/007_plan.md`
> **Branch:** `feature/issue-60`
> **PR:** [#65](https://github.com/EuThiagoAndrade/rastro-quente/pull/65)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #60" em 2026-11-14
> **Modo contínuo:** `—`
> **Início:** 2026-11-14
> **Última atualização:** 2026-11-14
> **handoff_schema_version:** `2`

## Objetivo

Registrar o contrato visual (`DESIGN.md`) e trocar a estrutura da tela pela organização pergunta → onde → resposta, sem mudar nenhuma regra analítica: as lentes continuam estaduais e aplicadas pelo botão até os itens 2 e 4.

## Escopo autorizado

Item 1 do plano v4 e issue #60:

- `DESIGN.md` na raiz e reconhecimento por `.agent/ai_behavior.md`, `_project/README.md` e pelo validador (manifesto, mensagem manual e teste 18);
- `index.html` e `src/estilos/*`: topo (marca, chips de satélite e fontes, "Sobre os dados", "Como ler esta tela", tema), tela de acesso própria (T13), coluna de filtros com "Limpar tudo" e as seções Consulta, Lente de seleção, Contexto territorial e Cruzar critérios (cada lente com a pergunta que responde, etiqueta "ativa"), centro com mapa, "Detecções no período" (resumo e sensibilidade acima da série, T18), disponibilidade e registros, coluna de resultado com a lente e os municípios, rodapé com as três frases, tema escuro e tela estreita (T17);
- consulta aplicada ao mudar, com atalhos de período, recorte aplicado e descarte de respostas atrasadas (T16), em `src/app.ts`, `src/apresentacao.ts`, `src/recorte.ts` e `src/topo.ts`;
- testes: unitários de contraste (dois temas) e do recorte; E2E de acesso, consulta, acessibilidade e versão reescritos; auxiliares e seletores das specs de lentes, combinação e áreas ajustados à nova estrutura, sem mudar o que verificam; medição M1 em `medir:lentes` e seletores de `medir:interface`; runbook.

Fora deste item: abas, explicação, cálculo ao escolher, leitura completa e "Lista de focos" (item 2); limites `minima`, densidade, série mensal e ampliar mapa (item 3); recorte das lentes (item 4); mapa-base (item 5). Sem migração, RPC, política, dependência nova nem mudança de lente.

## Origem no backlog

Herdada do plano (BL-007 inteiro; BL-009, parcela da explicação da célula, que não entra neste item), referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`. Destino em preparação: os itens continuam `Disponível`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Nenhum módulo de `src/lentes/` foi alterado; a lente lê o período do recorte aplicado, igual ao que o formulário tinha no clique. Resultados conferidos sem mudança: E2E de lentes, combinação e áreas verdes com os mesmos valores esperados; `conferir:lentes`, `conferir:combinacao` e `conferir:sobreposicao` com a carga real (ver Evidências). Textos de domínio no rodapé, na tela de acesso e em "Como ler esta tela"; a coluna de filtros declara "Lentes: todo Mato Grosso" (T16) |
| G2 — autenticação, autorização e isolamento por RLS | Não | Só apresentação: mesmas RPCs e tabelas, mesmos papéis e o mesmo fluxo de sessão do ADR-007; nenhuma consulta nova sem sessão (E2E AN) |
| G3 — privacidade de dados | Sim | Fixtures fictícias; nada do mockup privado foi copiado ou lido para o `DESIGN.md`. O tema não é gravado no navegador (E2E de armazenamento e de tema). Capturas de trabalho só em `test-results/` (ignorado) |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v4 `Aprovado`, issue #60 aberta, autorização literal "autorizo a implementação da issue #60", base `main` = `origin/main` em `2a0d3f5`.
- [x] Branch `feature/issue-60`; esta task; plano `Em Execução` e ciclo `Em execução`.
- [x] `DESIGN.md` e governança (autoridade, manifesto, validador e teste 18).
- [x] Estrutura, estilos, temas, tela de acesso, diálogos, consulta aplicada ao mudar.
- [x] Testes unitários e E2E.
- [x] Medição M1 e conferências das lentes com a carga real.
- [x] PR [#65](https://github.com/EuThiagoAndrade/rastro-quente/pull/65) aberta; checks remotos e merge pendentes.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` | Sem erros |
| `npm run build` | Concluído |
| `npm run test:interface` | 148/148 (inclui 78 pares de contraste nos dois temas e 3 testes do recorte aplicado) |
| `npm run test:e2e` | Rodada completa: 85/86; a falha foi no login da fixture na spec 07 a 390 px ("E-mail ou senha incorretos" logo após a troca de senha de teste, antes de qualquer tela de dados). A spec 07 repetida isolada: 14/14. Rodada anterior completa: 85/86 com a falha de seletor ambíguo da spec 06, corrigido; spec 06 repetida: 14/14 |
| `conferir:lentes` / `conferir:combinacao` / `conferir:sobreposicao` | Carga real local, recorte estadual: `conferido` nos três, `celulasDiferentes: 0` na combinação e na sobreposição (RC-1, T20; nenhum módulo de lente alterado) |
| M1 (`npm run medir:lentes -- abertura`) | Dentro: mediana comprimida 2,5 s, bruta 2,9 s (5 execuções por passagem, perfil do ADR-007, carga real); limite 5 s |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Escolha da lente por rádios nas seções.** O seletor único virou rádios (`name="l-lente"`) distribuídos nas seções Lente de seleção, Contexto territorial e Cruzar critérios, para que cada lente traga a pergunta que responde e a seção mostre "ativa". O comportamento é o mesmo (uma lente por vez, "Aplicar lente", "Nenhuma lente" cancela). As specs 05 a 07 trocaram só o auxiliar de escolha e o seletor do teclado.
- **Atalhos de período.** "Janela inteira", "Últimos 30 dias" e "Últimos 7 dias", contados do último dia GMT da janela da versão e cortados no primeiro dia dela. O plano pede atalhos sem fixá-los; não são regra analítica.
- **"Tentar novamente" na consulta.** Sem botão "Consultar" (T16), a falha da fonte e a leitura inconsistente ganham "Tentar novamente", que repete o recorte aplicado.
- **Período inválido com município trocado.** O município se aplica no período aplicado; o período digitado continua com o erro e a linha "Mostrando".
- **Larguras intermediárias.** T17 só fixa a tela estreita; de 761 px a 1.099 px a tela usa duas colunas (filtros e o resto), e três a partir de 1.100 px. Registrado no `DESIGN.md`.
- **Tema sem persistência.** A alternância vale enquanto a página estiver aberta, para não gravar nada no navegador (ADR-007).
- **Cabeçalho claro.** O topo passa a usar a superfície, e não o verde de identidade, para funcionar nos dois temas; o verde fica na marca.
- **Registro da criação das issues.** As alterações locais de `cycles.md` e do plano feitas por `criar_issues` (issues #60 a #64 e a confirmação dos payloads) entram nesta PR, que é a primeira depois delas.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 007 (completo)
Quem: Responsável
Conferir: Checks e diff da [PR #65](https://github.com/EuThiagoAndrade/rastro-quente/pull/65)
Diga: "aprovo o merge da PR #65"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + implementar_issue + 60 + 2a0d3f5`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #60 aberta, plano `Aprovado`, ciclo `Planejamento` / branch `feature/issue-60` publicada e PR #65 aberta; plano `Em Execução`, ciclo `Em execução`
- `result`: `executed`
- `evidence`: PR #65 (branch `feature/issue-60`); validações em "Evidências"
- `blockers`: checks remotos e aprovação do merge
