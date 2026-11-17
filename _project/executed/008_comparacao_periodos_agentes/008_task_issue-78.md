# Task — Issue #78: Função autenticada e ferramentas determinísticas no servidor

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#78`
> **Plano:** `_project/executed/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `feature/issue-78`
> **PR:** [#83](https://github.com/EuThiagoAndrade/rastro-quente/pull/83)
> **Integração:** squash `cdc4fc5` em `main` (2026-11-16)
> **Autorização inicial:** "Autorizo a implementação da issue #78" em 2026-11-16
> **Modo contínuo:** `—`
> **Início:** 2026-11-16
> **Última atualização:** 2026-11-16
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 2 do plano 008 (v3): a primeira função de servidor, `/api/explicar`, desligada por padrão, com acesso sob o JWT do responsável e a RLS, catálogo fechado de ferramentas determinísticas que releem e recalculam as evidências no servidor, orçamento de tempo, cliente REST do Gemini e a ADR de arquitetura, sem ativar chamadas reais ao provedor.

## Escopo autorizado

Item 2 do plano v3 e issue #78:

- `api/explicar.ts` (entrada da função) e `servidor/` (configuração, pedido, respostas, orçamento, ferramentas, cliente Gemini e handler), fora do grafo do navegador;
- CLI da Vercel 65.16.0 como dependência só de desenvolvimento, `engines` `24.x`, `tsconfig.servidor.json` e `api/tsconfig.json`;
- testes: `scripts/api/explicar.test.mjs` (`npm run test:api`, matriz T4 com Auth e RLS reais locais e provedor simulado), `bundle.test.mjs` (nada do servidor no bundle e nenhuma chave versionada) e a prova do pacote `scripts/agentes/conferir-pacote.mjs`;
- CI: `typecheck:servidor` e `test:api` nos jobs da aplicação;
- ADR-011; reconciliação da task da issue #77.

Fora deste item: chamadas reais ao Gemini e a orquestração do agente principal e dos subagentes (item 3); painel e eventos por etapa (item 4); configuração hospedada (item 5); migração, nova política ou bypass de RLS.

## Origem no backlog

Herdada do plano (BL-009, parcela "proposta de agentes"), referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | O servidor usa os mesmos módulos do navegador (lentes e `comparacao-008-v1`), sem cópia de fórmula; nenhum arquivo de `src/` alterado. A prova do pacote confere que as evidências do pacote são iguais às do código-fonte; `test:api` confere os totais da fixture (55 e 43) contados à mão |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Matriz T4 provada em `test:api` com Auth e RLS reais locais: sem JWT, adulterado, expirado, `anon` e `service_role` → 401; autenticado fora da lista → 403; revogação durante a execução → 403; carga trocada ou eco diferente → 409; todos com zero chamadas ao provedor. Cliente por pedido com a chave pública e o JWT; sem `service_role`; nenhuma tabela ou política nova |
| G3 — privacidade de dados | Sim | Chave só no servidor; o bundle não contém variável, endpoint ou chave do provedor e nenhuma chave está versionada (`bundle.test.mjs`); logs só com etapa, código e duração; JWT fora do corpo enviado ao provedor (prova do pacote); fixtures fictícias. D7 autoriza enviar dados territoriais públicos |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v3 `Em Execução`, issue #77 integrada (PR #82, `49592f2`), issue #78 aberta, autorização literal, base `main` em `49592f2`.
- [x] Branch `feature/issue-78`; esta task; task da issue #77 reconciliada.
- [x] Função, ferramentas, orçamento, cliente Gemini desligado e handler.
- [x] Testes HTTP, bundle e prova do pacote.
- [x] ADR-011, CI e documentação.
- [x] PR [#83](https://github.com/EuThiagoAndrade/rastro-quente/pull/83) aberta.
- [x] Checks remotos verdes e PR integrada por squash (`cdc4fc5`, 2026-11-16), conferido no GitHub durante a issue #79.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run typecheck:servidor` | Sem erros |
| `npm run build` | Concluído |
| `npm run test:interface` | 218/218 (com o teste novo do bundle) |
| `npm run test:api` | 11/11: desligada (503 em qualquer método, corpo não lido, zero clientes e zero chamadas), 401 nos cinco casos de JWT, 403 fora da lista, 200 com evidências relidas (55, 43, −12; permaneceu 3) e uma chamada, formato e limites (405, 403 de origem, 413, 400), eco adulterado 409, ferramentas (catálogo fechado, argumentos presos ao pedido, `ler_detalhes` com 43 de 43), falha do provedor 502 com evidências, limite de 64 KiB, revogação 403 e troca de carga 409 sem provedor |
| Prova do pacote | Build `npx --no-install vercel build --standalone` com a CLI 65.16.0 num contêiner Linux `node:24` (imagem oficial, autorizada pelo responsável), configuração local fictícia em `.vercel/project.json` (ignorado), sem conta, `pull` ou credencial. `node scripts/agentes/conferir-pacote.mjs`: handler `api/explicar.func/api/explicar.js`, runtime `nodejs24.x`, 107 arquivos, hash `adcf0bf03de534d8e9b8bb16ab51868c7f3fab7495d83428b35c9126c88bf697`; cópia isolada fora do checkout em subprocesso Node com HTTP real; desligada 503 com zero saídas de rede; ligada (só no teste, Supabase local, provedor interceptado) 403 para o autenticado fora da lista, 200 para o responsável, uma chamada ao provedor com `store=false` e sem o JWT, evidências iguais às do código-fonte |
| Regressão E2E | Não executada nesta entrega (nenhum arquivo de `src/`, `index.html` ou estilos alterado); a CI roda o E2E completo |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Verdes em `4ce29f3`: "Validate governance", "Database RLS and query contract", "Interface typecheck, build and E2E" |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Prova do pacote em contêiner e com configuração fictícia (decisão do responsável, 2026-11-16).** No Windows, `vercel build` falha ao instalar os builders porque a CLI cria links simbólicos (EPERM sem o Modo de Desenvolvedor). Entre as opções apresentadas, o responsável escolheu "Docker com node:24": o build roda num contêiner Linux com a imagem oficial `node:24` e só os arquivos versionáveis do repositório (`git ls-files -co --exclude-standard`, sem `local/`), e a saída `.vercel/output` volta para o checkout, onde a conferência roda isolada. O plano previa `vercel pull` de um preview vinculado por ação externa; a configuração local fictícia em `.vercel/project.json` bastou para o build standalone, sem conta, vínculo ou credencial. Por isso não houve ação externa neste item. O `pull` vinculado fica para a configuração hospedada (item 5).
- **`engines` em `24.x`.** Com `>=24`, a CLI escolheu `nodejs26.x` para a função; T4 exige Node 24. O `package.json` passou a `24.x`, o que também fixa o Node do build estático na Vercel.
- **`api/tsconfig.json`.** O builder da Vercel checava os tipos da função com o `tsconfig.json` da raiz (tipos `vite/client`) e acusava erro sem interromper o build; o tsconfig próprio da pasta `api/` usa o do servidor.
- **Uma ferramenta e uma chamada por pedido neste item.** O handler executa a ferramenta principal do tipo de pedido e faz uma chamada ao provedor; a orquestração (principal e dois subagentes, até 6 chamadas) é o item 3, que usa o mesmo catálogo.
- **Eventos por etapa.** A resposta deste item é JSON único; o fluxo de eventos sobre a resposta HTTP (T7) entra com a orquestração e o painel (itens 3 e 4).
- **Avisos do `npm audit`.** A CLI da Vercel (só desenvolvimento) traz dependências com avisos de vulnerabilidade no `npm audit`; ela não entra no bundle nem no pacote da função (107 arquivos: código, `package.json` e `@supabase`). Não se rodou `npm audit fix`, que mudaria versões fixadas.
- **Testes de carga.** Por orientação do responsável na autorização ("não faremos testes exaustivos para checagem de carga, neste momento"), não houve medição de tempo com a carga real; o orçamento de T6 está implementado e testado só nas suas regras.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 008 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 78 + 49592f2`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #78 aberta, plano `Em Execução` / branch `feature/issue-78` publicada e PR #83 aberta, task `Em andamento`
- `result`: `executed`
- `evidence`: PR #83 (branch `feature/issue-78`); validações em "Evidências"
- `blockers`: checks remotos e aprovação do merge

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
