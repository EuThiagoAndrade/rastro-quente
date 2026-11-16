# Task — Issue #79: Agente principal e dois subagentes Gemini

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `feature`
> **Issue:** `#79`
> **Plano:** `_project/drafts/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `feature/issue-79`
> **PR:** [#85](https://github.com/EuThiagoAndrade/rastro-quente/pull/85)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #79" em 2026-11-16
> **Modo contínuo:** `—`
> **Início:** 2026-11-16
> **Última atualização:** 2026-11-16
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 3 do plano 008 (v3): o agente principal e os dois subagentes Gemini (lentes e evidências; disponibilidade), com chamadas próprias ao modelo, ferramentas determinísticas do catálogo fechado, saídas estruturadas conferidas contra as evidências, teto de 6 chamadas, tratamento de 429, tempo, saída inválida e injeção de prompt, e a prova real local com o Gemini (T9) antes do merge.

## Escopo autorizado

Item 3 do plano v3 e issue #79:

- `servidor/agentes.ts` (novo): orquestração, instruções por papel, esquemas, índice e conferência das evidências, eventos por etapa;
- `servidor/gemini.ts`: transporte da Interactions API com histórico em memória (`store=false`), ferramentas, `tool_choice` e saída estruturada; `servidor/explicar.ts`, `servidor/ferramentas.ts` (disponibilidade nos recortes de seleção e comparação; validação prévia do recorte) e `servidor/resposta.ts` (códigos `cota_provedor`, `saida_invalida`, `limite_envio`);
- testes: `scripts/agentes/orquestracao.test.mjs` (`npm run test:agentes`, provedor simulado), `scripts/api/explicar.test.mjs` adaptado, `scripts/agentes/conferir-pacote.mjs` adaptado, provedor simulado `scripts/agentes/simulado.mjs`, casos de avaliação `scripts/agentes/casos.mjs` e prova real `scripts/agentes/prova-real.mjs` (`npm run prova:agentes`);
- CI: `test:agentes` no job da aplicação;
- complemento da ADR-011; reconciliação da task da issue #78.

Fora deste item: painel, perguntas prontas na interface e fluxo de eventos sobre a resposta HTTP (item 4); configuração hospedada e demonstração em produção (item 5); persistência de histórico; ferramentas de código ou busca na web.

## Origem no backlog

Herdada do plano (BL-009, parcela "proposta de agentes"), referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | O modelo não calcula: números, datas e classificações vêm das ferramentas (mesmos módulos do navegador, nenhum arquivo de `src/` alterado). Afirmações com número, data ou classificação que não constem nas evidências referenciadas são rejeitadas (testes em `test:agentes`). A disponibilidade nos recortes de comparação usa `leiturasDeDisponibilidade` e `conferirZero` existentes, sem nova regra, e declara o alcance (não é disponibilidade estadual completa) |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Matriz T4 do item 2 mantida em `test:api` (401, 403, 409, revogação e troca de carga), agora com a orquestração: negativas sem nenhuma chamada ao provedor; revogação ou troca de carga no meio da execução sem nenhum envio de evidências. Revalidação antes de cada envio de evidências e da resposta. Sem `service_role`, tabela ou política nova |
| G3 — privacidade de dados | Sim | Chave só no cabeçalho, nunca no corpo (testes de transporte e de pacote); JWT fora do corpo; logs só com etapa, código, duração, número de chamadas e tokens agregados; eventos sem conteúdo; fixtures fictícias. A prova real lê a chave só do `.env` local ignorado e não a imprime. D7 autoriza enviar dados territoriais públicos |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v3 `Em Execução`, issue #78 integrada (PR #83, `cdc4fc5`), issue #79 aberta, autorização literal, base `main` em `cdc4fc5`.
- [x] Branch `feature/issue-79`; esta task; task da issue #78 reconciliada.
- [x] Orquestração, transporte, conferência de evidências e casos de avaliação.
- [x] Testes com provedor simulado (`test:agentes`, `test:api`) e prova do pacote.
- [x] Complemento da ADR-011 e CI.
- [x] PR [#85](https://github.com/EuThiagoAndrade/rastro-quente/pull/85) aberta.
- [ ] Ação externa (projeto Gemini, cotas RPM/TPM/RPD e chave no `.env` local) e prova real local de T9.
- [ ] Checks remotos e merge aprovado.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run typecheck:servidor` | Sem erros |
| `npm run build` | Concluído |
| `npm run test:interface` | 218/218 |
| `npm run test:agentes` | 19/19: delegação aos dois subagentes com 6 chamadas e instruções e ferramentas distintas; só disponibilidade (4 chamadas); delegação necessária ausente (incompleta); recusa (1 chamada, texto fixo); parcial; ferramenta fora do catálogo ou com argumento fora do pedido recusada; referência inventada, número, data e classificação divergentes, HTML e alegação rejeitados; saída fora do formato; 429 sem repetição; tempo esgotado; revogação antes da síntese; injeção; modelo insistente sem passar de 6; limite de 64 KiB com histórico; corpo e resposta da Interactions API; cliente REST |
| `npm run test:api` | 11/11, com a orquestração e o provedor simulado no formato bruto da API: 6 chamadas, `store=false`, sem JWT nem chave no corpo, evidências relidas (55, 43, −12; permaneceu 3), disponibilidade por lado; falha do provedor na síntese 502 com evidências; revogação 403 e troca de carga 409 sem nenhum envio de evidências |
| Prova do pacote | Build `npx --no-install vercel build --standalone` (CLI 65.16.0) em contêiner `node:24` com só os arquivos versionáveis e a configuração local fictícia, como no item 2. `node scripts/agentes/conferir-pacote.mjs`: handler `api/explicar.func/api/explicar.js`, runtime `nodejs24.x`, 109 arquivos, hash `f81bbfa8cd89ec96ad67afbe93efae74cb2e29e14b344285db86a82de22d19ca`; cópia isolada em subprocesso Node com HTTP real; desligada 503 sem saída de rede; ligada (só no teste, Supabase local, provedor interceptado no formato da Interactions API) 403 para o autenticado fora da lista e 200 `completa` para o responsável, com 6 chamadas (principal, lentes, disponibilidade, lentes, disponibilidade, principal), todas com `store=false` e sem JWT nem chave; evidências iguais às do código-fonte (55, 43; permaneceu 3) |
| Prova real local com Gemini (T9) | Pendente da ação externa |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Formato da resposta do provedor.** O cliente do item 2 lia `outputs`; a referência pública da Interactions API (conferida em 2026-11-16) devolve `steps`, com texto em `model_output.content[].text`. Corrigido neste item, que é o da compatibilidade real do transporte (T6).
- **Classificação do principal por chamada de função.** A primeira chamada usa `tool_choice` restrito às três funções do principal (delegar a cada subagente ou recusar), com a classificação nos argumentos; a saída estruturada fica na análise de cada subagente e na síntese. Assim a primeira chamada não depende de combinar ferramenta e saída estruturada no mesmo turno.
- **Disponibilidade nos recortes de seleção e comparação.** `consultar_disponibilidade` só atendia o pedido do tipo disponibilidade; o subagente de disponibilidade precisa dela nas comparações. Ela passou a ler, por lado, os municípios exigidos pelos destaques (todos os do recorte só num lado sem detecções), com a função existente `leiturasDeDisponibilidade`, e declara o alcance. Respostas completas da mesma execução são reaproveitadas entre os subagentes.
- **Recorte validado antes do provedor.** Com a orquestração, um período fora da versão só seria recusado dentro da ferramenta, depois da primeira chamada ao modelo. `validarRecorte` o recusa antes, como pede a ordem de T4.
- **Falha de um subagente.** Saída fora do formato, nenhuma afirmação conferida, ferramenta recusada ou limite de envio encerram só aquele subagente (estado `incompleta`, nota fixa); 429, falha de rede do provedor e saída inválida do principal encerram a execução sem novas chamadas, com o que já foi conferido.
- **Eventos.** A orquestração emite os eventos reais por etapa e a resposta os traz em `execucao.etapas`; o fluxo sobre a resposta HTTP (T7) fica com o painel do item 4.
- **`.env.example`.** A variável `RQ_GEMINI_CHAVE` não foi acrescentada ao exemplo: o teste de bundle trata linha vazia seguida de outra linha como valor. A variável está documentada no cabeçalho de `scripts/agentes/prova-real.mjs` e na ADR-011.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando ação externa — ciclo 008 (completo)
Quem: Responsável
Conferir: Roteiro de T9 no plano (projeto Gemini gratuito, cotas RPM/TPM/RPD de gemini-3.8-flash e chave RQ_GEMINI_CHAVE só no .env local) e a PR #85 (https://github.com/EuThiagoAndrade/rastro-quente/pull/85)
Diga: "concluí a ação externa da issue #79"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 79 + cdc4fc5`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #79 aberta, plano `Em Execução` / branch `feature/issue-79` publicada e PR #85 aberta, task `Em andamento`, prova real pendente
- `result`: `executed`
- `evidence`: PR #85 (branch `feature/issue-79`); validações em "Evidências"
- `blockers`: ação externa da issue #79 e prova real local antes do merge; checks remotos e aprovação do merge

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
