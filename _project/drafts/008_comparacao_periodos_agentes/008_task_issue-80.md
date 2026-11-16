# Task — Issue #80: Painel de perguntas, etapas e evidências

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `feature`
> **Issue:** `#80`
> **Plano:** `_project/drafts/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `feature/issue-80`
> **PR:** —
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #80" em 2026-11-16
> **Modo contínuo:** `—`
> **Início:** 2026-11-16
> **Última atualização:** 2026-11-16
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 4 do plano 008 (v3): o painel de perguntas na coluna de resultado, com as três perguntas prontas de D4, a ação contextual "Comparar municípios" e o texto livre, ligado à seleção e à comparação determinística do item 1; o fluxo de eventos reais da execução sobre a própria resposta HTTP, consumido por `fetch` autenticado; cancelamento e descarte de respostas obsoletas; e funcionamento integral da consulta e da comparação sem IA.

## Escopo autorizado

Item 4 do plano v3 e issue #80:

- `src/agentes.ts` (novo): contexto da pergunta a partir da tela, pedido no formato do servidor, `fetch` autenticado com leitura do fluxo de eventos, validação de cada mensagem e cancelamento;
- `src/apresentacao-agentes.ts` (novo): painel, perguntas prontas, texto livre, etapas reais, resposta conferida, notas, aviso "Gerado por IA", referências às evidências e estados;
- `src/app.ts`, `index.html`, estilos: integração do painel, gerações e cancelamento ao trocar seleção, filtro, lente, comparação, carga ou sessão;
- `servidor/explicar.ts`: fluxo de eventos sobre a resposta HTTP da rota existente (sem rota nova, sem mudança nas regras do modelo);
- testes: unitários da validação das mensagens, `test:api` com o fluxo, E2E com o handler real local e o provedor simulado;
- `DESIGN.md` e ajuda "Como ler esta tela"; complemento da ADR-011 sobre o fluxo; reconciliação da task da issue #79.

Fora deste item: configuração hospedada e demonstração em produção (item 5); novas rotas de servidor; mudanças nas instruções, ferramentas ou conferência dos agentes; persistência de conversa.

## Origem no backlog

Herdada do plano (BL-009, parcela "proposta de agentes"), referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | O painel não calcula: mostra só afirmações conferidas pelo servidor, com referências às evidências das ferramentas, e as notas fixas do código. Nenhum arquivo de cálculo (`src/comparacao.ts`, `src/lentes/`) muda. A pergunta usa exatamente o recorte e a lente aplicados na tela |
| G2 — autenticação, autorização e isolamento por RLS | Sim | JWT só no cabeçalho `Authorization`; o fluxo começa só depois da matriz T4 (401/403/409 continuam respostas HTTP sem fluxo, sem chamada ao provedor). Revalidação antes de cada envio de evidências e do resultado final mantida. Sem tabela, política ou `service_role` novos |
| G3 — privacidade de dados | Sim | Eventos sem conteúdo (só etapa, papel, ferramenta e identificador de evidência); nada gravado no navegador; texto livre limitado a 2.000 caracteres com orientação de não inserir dados pessoais ou segredos; fixtures fictícias; nenhuma chave no bundle |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v3 `Em Execução`, issue #79 integrada (PR #85, `80af104`), issue #80 aberta, autorização literal, base `main` em `80af104`.
- [x] Branch `feature/issue-80`; esta task; task da issue #79 reconciliada.
- [x] Fluxo de eventos no servidor e testes.
- [x] Painel, contexto, cancelamento e gerações no navegador.
- [x] E2E, acessibilidade, `DESIGN.md`, ajuda e ADR-011.
- [ ] PR aberta.
- [ ] Checks remotos e merge aprovado.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run typecheck:servidor` | Sem erros |
| `npm run build` | Concluído |
| `npm run test:interface` | 218/218 (inclui o teste do bundle: nenhuma chave nem endpoint do provedor no navegador) |
| `npm run test:agentes` | 24/24 (orquestração inalterada) |
| `npm run test:api` | 14/14: os 11 anteriores, sem mudança no corpo sem fluxo, e 3 novos: fluxo com as etapas reais idênticas a `execucao.etapas` e a mensagem final com o mesmo corpo (55, 43; 6 chamadas), sem conteúdo da pergunta nem dados nos eventos; 403 e 401 continuam JSON sem fluxo e sem provedor; cancelamento pelo cliente depois de 3 chamadas, sem nenhuma chamada nova e sem evidência enviada |
| E2E `13-perguntas.spec.mjs` | 8/8, com o handler real local (Auth e RLS reais) e o provedor simulado: prontas só com contexto e motivo; comparação de períodos com as etapas reais, 6 chamadas, "Gerado por IA", evidências e volta ao detalhamento, JWT só no cabeçalho; destaque aberto no pedido (recorte `selecao`) e descarte ao abrir outro; lacunas no município com a delegação às lentes recusada; "Comparar municípios" abre o seletor de B e o texto livre usa a comparação; falha do subagente de lentes como resposta incompleta; cancelar, mudar o período B ou sair sem chamada nova nem resposta tardia; IA desligada sem quebrar comparação, lentes e consulta; teclado e estado anunciado |
| E2E `03-acessibilidade.spec.mjs` | 13/13, com o painel e a resposta abertos na auditoria (contraste, alvos, fontes, reflow) em 360, 390, 768 e 1440 px, temas claro e escuro |
| E2E completo (`npm run test:e2e`) | Não executado localmente por decisão do responsável ("Não precise fazer testes de carga exaustivos"); coberto pelo job "Interface typecheck, build and E2E" da CI |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros depois do bloco final desta task |
| `git diff --check` | Sem achados |
| Prova do pacote (`conferir-pacote`) | Não refeita: o empacotamento e as importações não mudaram; o fluxo hospedado na Vercel é conferido no item 5 |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Fluxo na mesma rota, por `Accept`.** O fluxo de eventos (T7) é pedido com `Accept: application/x-ndjson` na rota existente; sem ele, a resposta continua igual (os testes do item 2 e 3 não mudaram). O fluxo só começa depois da matriz T4, então 401, 403, 409 e 400 continuam respostas HTTP comuns. Formato NDJSON (uma mensagem JSON por linha) em vez de SSE: mais simples de ler por `fetch` com `Authorization`, sem `EventSource`.
- **"Por que esta célula foi destacada?" com o destaque aberto.** O recorte `selecao` do servidor não identifica um destaque; o painel acrescenta ao texto da pergunta o nome e o identificador do destaque aberto (o servidor recalcula tudo e nenhum número vai no pedido). Sem mudança no servidor nem nas regras dos agentes.
- **Recorte de cada pergunta.** Ordem fixa: comparação calculada; destaque aberto ou lente aplicada; município da Consulta. "Há lacunas nos dados?" usa os municípios do destaque aberto ou o da Consulta (recorte `disponibilidade`), sem pedir todos os 142 por padrão (T6). Sem contexto suficiente, a pergunta fica desabilitada com o motivo.
- **Erros de sessão, acesso e versão.** 401, 403 de acesso e 409 da explicação levam a tela inteira ao estado correspondente, como nas lentes (nunca ficam locais).
- **E2E com o handler real.** `scripts/interface/api-e2e.mjs` serve o handler real com o provedor simulado em 127.0.0.1:5180, e o `vite preview` do E2E o encaminha em `/api` (só com `RQ_API_E2E`). Uma porta de controle do próprio teste troca o modo do provedor simulado (normal, falha das lentes, desligada, atraso); nada disso é implantado.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando autorização de implementação — ciclo 008 (completo)
Quem: Agente
Conferir: Implementação da issue #80 em andamento na branch feature/issue-80
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 80 + 80af104`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: issue #80 aberta, plano `Em Execução` / branch `feature/issue-80`, task `Em andamento`
- `result`: `executed`
- `evidence`: branch `feature/issue-80`
- `blockers`: nenhum

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
