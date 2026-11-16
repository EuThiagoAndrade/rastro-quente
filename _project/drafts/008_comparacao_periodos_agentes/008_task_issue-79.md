# Task — Issue #79: Agente principal e dois subagentes Gemini

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#79`
> **Plano:** `_project/drafts/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `feature/issue-79`
> **PR:** [#85](https://github.com/EuThiagoAndrade/rastro-quente/pull/85)
> **Integração:** squash `80af104` em `main` (2026-11-16)
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
- [x] Ação externa (projeto Gemini, cotas RPM/TPM/RPD e chave no `.env` local) e prova real local de T9.
- [x] Checks remotos verdes e PR integrada por squash (`80af104`, 2026-11-16), conferido no GitHub durante a issue #80.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run typecheck:servidor` | Sem erros |
| `npm run build` | Concluído |
| `npm run test:interface` | 218/218 |
| `npm run test:agentes` | 24/24 (delegação única, analista fora do catálogo, referência com envelope e texto anexado, conferência pelo mesmo item, repetição única em 503 sem repetir 500 nem 429). Antes, 21/21 (com o espaçamento entre chamadas, inclusive paralelas, fora do orçamento de geração; tempo total insuficiente e cancelamento durante a espera). Antes, 19/19: delegação aos dois subagentes com 6 chamadas e instruções e ferramentas distintas; só disponibilidade (4 chamadas); delegação necessária ausente (incompleta); recusa (1 chamada, texto fixo); parcial; ferramenta fora do catálogo ou com argumento fora do pedido recusada; referência inventada, número, data e classificação divergentes, HTML e alegação rejeitados; saída fora do formato; 429 sem repetição; tempo esgotado; revogação antes da síntese; injeção; modelo insistente sem passar de 6; limite de 64 KiB com histórico; corpo e resposta da Interactions API; cliente REST |
| `npm run test:api` | 11/11 (inclui `RQ_GEMINI_INTERVALO_MS` válido e inválido; 500 na síntese 502 sem repetição; 503 na síntese recuperado com 7 pedidos e 6 respondidas), com a orquestração e o provedor simulado no formato bruto da API: 6 chamadas, `store=false`, sem JWT nem chave no corpo, evidências relidas (55, 43, −12; permaneceu 3), disponibilidade por lado; falha do provedor na síntese 502 com evidências; revogação 403 e troca de carga 409 sem nenhum envio de evidências |
| Prova do pacote | Refeita em 2026-11-16 com `gemini-3.1-flash-lite`, delegação única, repetição em 503 e conferência pelo mesmo item: mesmo procedimento, hash `9cda9ae4e53c1df0a55d2c814224a3fdc094c49ea1aa67795daf5e8be26e1d68`, 109 arquivos, `nodejs24.x`; desligada 503 sem saída de rede; ligada 403/200 `completa`, 6 chamadas, `store=false`, evidências iguais às do código-fonte (55, 43; permaneceu 3). Antes: build `npx --no-install vercel build --standalone` (CLI 65.16.0) em contêiner `node:24` com só os arquivos versionáveis e a configuração local fictícia, como no item 2. `node scripts/agentes/conferir-pacote.mjs`: handler `api/explicar.func/api/explicar.js`, runtime `nodejs24.x`, 109 arquivos, hash `f81bbfa8cd89ec96ad67afbe93efae74cb2e29e14b344285db86a82de22d19ca`; cópia isolada em subprocesso Node com HTTP real; desligada 503 sem saída de rede; ligada (só no teste, Supabase local, provedor interceptado no formato da Interactions API) 403 para o autenticado fora da lista e 200 `completa` para o responsável, com 6 chamadas (principal, lentes, disponibilidade, lentes, disponibilidade, principal), todas com `store=false` e sem JWT nem chave; evidências iguais às do código-fonte (55, 43; permaneceu 3) |
| Prova real local com Gemini (T9) | Ação externa concluída em 2026-11-16 (nível gratuito; `RQ_GEMINI_CHAVE` só no `.env`, ignorado pelo Git). Tentativa 1 (2026-11-16, 17:27 UTC, intervalo de 13 s): não conclusiva por indisponibilidade do provedor. R1 e F1 esgotaram os 20 s de geração na primeira chamada; R2 e P1 receberam HTTP 503 na primeira chamada. Uma chamada mínima de diagnóstico, fora da aplicação, recebeu 503 `service_unavailable` com a mensagem de alta demanda temporária do modelo. Comportamento da aplicação conforme T6: sem repetição, 502/504 sem síntese, nenhuma chamada após a falha, `store=false` e nem chave nem JWT nos corpos enviados. Tentativa 2 (2026-11-16, depois de o responsável resgatar créditos gratuitos; o projeto continua no nível gratuito, RPM 5, TPM 250 mil, RPD 20): mesmo resultado. R1 esgotou os 20 s, e R2, P1 e F1 receberam 503 na primeira chamada. A chamada mínima de diagnóstico também recebeu 503 de alta demanda, em 0,8 s. Mesmo comportamento conforme T6. Tentativa 3 (2026-11-16, `gemini-3.1-flash-lite`, sem espaçamento): **R2 passou** (HTTP 200 `completa`; principal → disponibilidade, com 2 chamadas próprias, → síntese; 4 chamadas; ferramenta `consultar_disponibilidade` pedida pelo modelo e executada; saída estruturada aceita; 1 afirmação conferida e 2 rejeitadas pela conferência; uso de 1.998 tokens de entrada e 386 de saída). **F1 passou** (HTTP 200 `fora_do_alcance`, 1 chamada, texto fixo de autoria ou infração). P1: 503 na primeira chamada. R1: 504 depois de 4 chamadas bem-sucedidas. Tentativa 4 (só R1 e P1, com registro das chamadas interrompidas): R1 com principal 200 (5,1 s) e disponibilidade 200 (3,2 s); a primeira chamada de lentes (2.295 bytes) e a segunda de disponibilidade (4.739 bytes) esgotaram os 20 s por chamada. P1 com principal 200 e 503 na primeira chamada de lentes. Envios pequenos, então o tempo esgotado vem da latência do provedor, não do volume. Em todos os casos: `store=false`, sem chave nem JWT nos corpos, nenhuma chamada respondida além de 6. Pendentes: R1 (comparação com os dois subagentes) e P1 (parcial). O limite de 20 s por chamada (T6) não foi alterado. Tentativas 5 a 9 (2026-11-16, só R1 e P1, com o diagnóstico local `RQ_PROVA_DIAGNOSTICO=1`): (a) o modelo faz uma só chamada de função por turno, então o principal delegava só às lentes nas comparações. Corrigido com a função única `delegar` com lista de analistas, e depois disso a delegação aos dois funcionou em todas as execuções. (b) O exemplo da instrução de disponibilidade citava `…municipios[0].texto`, sem o código do município. Corrigido para citar o item inteiro, e depois disso o subagente de disponibilidade teve 3 afirmações aceitas e 0 rejeitadas na tentativa 8. (c) O subagente de lentes citava `E1.dados.a.total`, por causa do envelope `{evidencia, dados}`. Corrigido com a normalização `normalizarReferencia`, só quando o caminho citado não existe. Na tentativa 8, o R1 completou as 6 chamadas, com HTTP 200 `incompleta` (disponibilidade conferida, lentes rejeitada). Na tentativa 9, R1 com as 6 chamadas e 503 na síntese, e P1 com 503 no principal. Pendências que exigem decisão: cerca de 1 em cada 5 chamadas recebe 503, e o plano proíbe repetição automática; e o modelo ainda cita caminhos com texto anexado ou cita o código do município fora do campo referenciado, o que leva a conferência estrita a rejeitar. **Aprovação de T9 (tentativas 10 a 16, 2026-11-16, `gemini-3.1-flash-lite`, com repetição única em 503 e conferência pelo mesmo item):** P1 (tentativa 10): HTTP 200 `parcial`, delegação aos dois analistas, 6 chamadas respondidas e 1 repetição, 7 afirmações conferidas e 0 rejeitadas, nota fixa de parcialidade. R1 (tentativa 12): HTTP 200 `completa`, delegação aos dois, 6 respondidas e 1 repetição, 8 afirmações conferidas e 0 rejeitadas, 6.808 tokens de entrada e 2.107 de saída, 26,6 s. F1 (tentativa 13): HTTP 200 `fora_do_alcance`, 1 chamada, texto fixo. R2 (tentativa 16): HTTP 200 `completa`, 4 chamadas, 2 afirmações conferidas e 0 rejeitadas. Entre a 13 e a 16 entrou uma linha de instrução comum ("caminhos de evidência só em referências"), depois que uma tentativa do R2 (14) escreveu `E1.municipios[0]` no texto e foi rejeitada com razão. As tentativas 11, 13 (R2) e 15 esgotaram 20 s numa chamada com envio de 2 a 4 KB, por latência do provedor; o limite não foi alterado. Conferência humana dos textos: números, datas e municípios iguais às evidências; as sínteses mencionam "Mato Grosso", que não consta na fixture fictícia (escopo geral do produto), sem afirmar número novo. Em todos: `store=false`, sem chave nem JWT nos corpos |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Verdes em `7773be1` (PR #85): "Validate governance", "Database RLS and query contract", "Interface typecheck, build and E2E" |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Formato da resposta do provedor.** O cliente do item 2 lia `outputs`; a referência pública da Interactions API (conferida em 2026-11-16) devolve `steps`, com texto em `model_output.content[].text`. Corrigido neste item, que é o da compatibilidade real do transporte (T6).
- **Classificação do principal por chamada de função.** A primeira chamada usa `tool_choice` restrito às três funções do principal (delegar a cada subagente ou recusar), com a classificação nos argumentos; a saída estruturada fica na análise de cada subagente e na síntese. Assim a primeira chamada não depende de combinar ferramenta e saída estruturada no mesmo turno.
- **Disponibilidade nos recortes de seleção e comparação.** `consultar_disponibilidade` só atendia o pedido do tipo disponibilidade; o subagente de disponibilidade precisa dela nas comparações. Ela passou a ler, por lado, os municípios exigidos pelos destaques (todos os do recorte só num lado sem detecções), com a função existente `leiturasDeDisponibilidade`, e declara o alcance. Respostas completas da mesma execução são reaproveitadas entre os subagentes.
- **Recorte validado antes do provedor.** Com a orquestração, um período fora da versão só seria recusado dentro da ferramenta, depois da primeira chamada ao modelo. `validarRecorte` o recusa antes, como pede a ordem de T4.
- **Falha de um subagente.** Saída fora do formato, nenhuma afirmação conferida, ferramenta recusada ou limite de envio encerram só aquele subagente (estado `incompleta`, nota fixa); 429, falha de rede do provedor e saída inválida do principal encerram a execução sem novas chamadas, com o que já foi conferido.
- **Eventos.** A orquestração emite os eventos reais por etapa e a resposta os traz em `execucao.etapas`; o fluxo sobre a resposta HTTP (T7) fica com o painel do item 4.
- **Cota do provedor (decisão do responsável, 2026-11-16).** O projeto Gemini "Rastro Quente" ficou no nível gratuito, sem faturamento: "Vou trabalhar com o nível gratuito mesmo". Limites de `gemini-3.8-flash` vistos no AI Studio: RPM 5, TPM ~250 mil, RPD 20. Uma comparação faz 6 chamadas, acima do RPM; em vez de habilitar pagamento ou reduzir subagentes (T6), as chamadas passam a ser espaçadas na porta única do provedor: `RQ_GEMINI_INTERVALO_MS` (opcional, 0 a 20.000; ausente = sem espera; presente e inválido desliga a função), com reserva de horário também para as chamadas paralelas. A espera consome só o tempo total (270 s), não o de geração. A prova real usa 13 s entre chamadas e 60 s entre casos; os quatro casos mínimos consomem cerca de 19 das 20 chamadas do dia. A configuração hospedada do intervalo fica com o item 5.
- **Troca de modelo (decisão do responsável, 2026-11-16).** O `gemini-3.8-flash` ficou indisponível nas tentativas 1 e 2 (503 de alta demanda). Conforme o plano ("Se indisponível, apresentar alternativa gratuita e registrar decisão antes da troca"), o responsável autorizou com a frase literal "autorizo trocar o modelo para gemini-3.1-flash-lite". O modelo é estável, está listado na Interactions API e tem chamada de função, saída estruturada e nível gratuito, conferidos na documentação oficial em 2026-11-16. Nível gratuito no AI Studio: RPM 15, TPM 250 mil e RPD 500. `MODELO_FIXADO`, os testes e a prova do pacote foram atualizados. A prova real passa a usar intervalo de 0 s entre chamadas (com RPM 15, as 6 chamadas de uma comparação cabem sem espera) e mantém 60 s entre casos. O espaçamento continua disponível.
- **Conferência pelo mesmo item (decisão do responsável, 2026-11-16).** Pergunta: "aceitar números e datas presentes no MESMO item de município ou unidade do campo citado (nunca na evidência inteira) e descartar texto após o caminho?"; resposta: "Sim, ajuste limitado". Implementado em `itemDe` e `normalizarReferencia`. Cada referência admite também os valores do ancestral mais próximo que identifica um município ou unidade (campo `municipio` ou `unidade`); na falta dele, os do lado da comparação (`E1.a`, `E1.b`). Nunca a evidência inteira. Texto anexado depois do caminho é descartado só quando o caminho citado não existe. Testes: código e números do mesmo município aceitos; número de outro município, total do outro lado ou fora da evidência rejeitados.
- **Repetição em 503 (decisão do responsável, 2026-11-16).** Pergunta: "permitir UMA repetição automática, só quando vier 503, sem passar do teto de 6 chamadas nem do orçamento de tempo? O 429 de cota continua sem repetição."; resposta: "Sim, uma repetição". Esclarecimento sobre o teto: "Contar só as chamadas respondidas". Implementado na porta única: no máximo uma repetição por chamada, só para HTTP 503 (`SOBRECARGA`), depois de 2 s, passando pela fila de espaçamento e dentro do orçamento. O teto de 6 conta as chamadas respondidas, então no pior caso são 12 pedidos. 429, outros erros e saída inválida nunca se repetem. Cada chamada registra `repeticoes` na execução.
- **`.env.example`.** A variável `RQ_GEMINI_CHAVE` não foi acrescentada ao exemplo: o teste de bundle trata linha vazia seguida de outra linha como valor. A variável está documentada no cabeçalho de `scripts/agentes/prova-real.mjs` e na ADR-011.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 008 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #85 (https://github.com/EuThiagoAndrade/rastro-quente/pull/85); prova real T9 e prova do pacote em "Evidências"
Diga: "aprovo o merge da PR #85"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 79 + cdc4fc5`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #79 aberta, plano `Em Execução` / branch `feature/issue-79` publicada e PR #85 aberta, task `Em andamento`, prova real pendente
- `result`: `executed`
- `evidence`: PR #85 (branch `feature/issue-79`); validações em "Evidências"
- `blockers`: nenhum além dos gates de merge; checks remotos e aprovação do merge

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
