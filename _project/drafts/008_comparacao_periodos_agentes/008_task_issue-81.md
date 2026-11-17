# Task — Issue #81: Configuração gratuita, demonstração e verificação hospedada

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `chore`
> **Issue:** `#81`
> **Plano:** `_project/drafts/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `chore/issue-81`
> **PR:** [#87](https://github.com/EuThiagoAndrade/rastro-quente/pull/87) (preparação, integrada; não fecha a issue); PR 2 a abrir
> **Integração:** PR 1 (#87) por squash `f0599c5` em `main` (2026-11-16); PR 2 pendente
> **Autorização inicial:** "autorizo a implementação da issue #81" em 2026-11-16
> **Modo contínuo:** `—`
> **Início:** 2026-11-16
> **Última atualização:** 2026-11-17
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 5 do plano 008 (v3) em duas PRs da mesma issue. A **PR 1 (preparação)** traz o runbook de operação, verificação e desligamento, a documentação das variáveis sem valores e a configuração da função na Vercel, e não fecha a issue. Depois do merge dela, vêm a ação externa com a IA desligada (etapa A), a autorização de produção, a sondagem desligada, a habilitação (etapa B) e a verificação T9 hospedada (etapa C). A **PR 2** traz o relatório `008_validation_agentes.md` e a reconciliação desta task, e só ela fecha a issue.

## Escopo autorizado

Item 5 do plano v3 e issue #81:

- PR 1: `docs/runbook.md` (seção 12: variáveis só por nome, etapas A/B/C, sondagens, desligamento de emergência e limites do que se prova); `vercel.json` (`maxDuration` 300 só para `api/explicar.ts`) e seu teste em `tests/unit/bundle.test.mjs`; complemento da ADR-011; reconciliação da task da issue #80 e da rastreabilidade do plano;
- depois da PR 1: execução do roteiro da seção 12 dentro das autorizações próprias, e PR 2 com `008_validation_agentes.md`, evidências e fechamento da issue. Falhas encontradas na verificação são corrigidas na PR 2 ou em PR adicional justificada da mesma issue, com aprovação própria.

Fora deste item: mudanças nas regras analíticas, nas instruções ou ferramentas dos agentes, no modelo ou no provedor; novas rotas; cobrança, faturamento ou troca de plano; esgotar cota de propósito; encerramento do ciclo (PR própria).

## Origem no backlog

Herdada do plano (BL-009, parcela "proposta de agentes"), referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | A PR 1 não toca cálculo (`src/comparacao.ts`, `src/lentes/`, `servidor/`). Na etapa C, cada resposta da IA é conferida contra o detalhamento determinístico da mesma tela; divergência é falha registrada, não ajuste da regra |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Nenhuma mudança no handler, nas políticas ou na lista de responsáveis. O roteiro prova em produção a matriz T4 (anônimo, origem, JWT inválido, outra conta) sem chamada ao provedor, e o desligamento não mexe em RLS |
| G3 — privacidade de dados | Sim | Variáveis só por nome; chave do Gemini marcada como *Sensitive* e nunca no chat, em `.env.example`, issue, PR, log ou print; o agente não recebe JWT, UUID ou e-mail; logs da função só com etapa, código, duração, chamadas e tokens. D7 autoriza enviar dados territoriais públicos ao provedor |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v3 `Em Execução`, issue #80 integrada (PR #86, `831ee8e`), issue #81 aberta, autorização literal, base `main` em `831ee8e`.
- [x] Branch `chore/issue-81`; esta task; task da issue #80 e rastreabilidade do plano reconciliadas.
- [x] Limites da Vercel conferidos na documentação oficial (páginas de duração, limitações, Fluid compute e configuração, atualizadas em 2026-08-24/25): Hobby com Fluid compute, padrão e máximo de 300 s; Fluid compute ligado por padrão em projetos novos desde 2025-04-23; respostas em fluxo contam na duração; corpo até 4,5 MB (não se aplica à resposta em fluxo). A documentação não diz se um valor acima do máximo reprova o deploy nem traz a retenção de logs: ficam para a etapa A.
- [x] Runbook (seção 12), `vercel.json`, teste e ADR-011.
- [x] PR 1 [#87](https://github.com/EuThiagoAndrade/rastro-quente/pull/87) aberta, sem fechar a issue.
- [x] Checks remotos verdes (3/3) e merge aprovado ("aprovo o merge da PR #87", 2026-11-16), squash `f0599c5`. Antes da aprovação, o responsável confirmou Fluid compute ligado e plano Hobby.
- [x] Etapa A (ação externa), "concluí a ação externa da issue #81 — etapa A" em 2026-11-16: deploy de produção do `f0599c5` (status Vercel `success`) e Redeploy depois das variáveis, `Ready`; projeto Gemini no nível gratuito, sem faturamento, `gemini-3.1-flash-lite` com RPM 15, TPM 250 mil e RPD 500 (iguais aos da issue #79); `RQ_SUPABASE_URL` (base `.supabase.co`, sem `/rest/v1/`), `RQ_SUPABASE_CHAVE_PUBLICAVEL`, `RQ_GEMINI_CHAVE` (Sensitive) e `RQ_GEMINI_MODELO` em Production, sem `RQ_IA_HABILITADA`; domínio de produção confirmado pelo responsável; observabilidade restrita no Hobby, retenção dos logs não observável no painel.
- [x] Autorização de produção: em 2026-11-16, à pergunta "Autoriza a verificação em produção do ciclo 008?", o responsável respondeu "Autorizo" (registrado como "autorizo a verificação em produção do ciclo 008").
- [x] Verificação desligada, parte do agente (2026-11-16, sem sessão, no domínio de produção): `GET` e `POST` anônimos em `/api/explicar` → 503 `ia_desabilitada` (texto fixo, `Cache-Control: no-store`, sem dados nem detalhe do ambiente), em 1,3 s e 0,5 s; `POST` com `Origin` externa → 503 (a habilitação vem antes da origem, ADR-011). Bundle publicado (`index.html` e `/assets/index-PI3x1kgA.js`, 566.951 bytes) sem `RQ_GEMINI`, `RQ_IA_HABILITADA`, `generativelanguage`, `AIza`, `service_role` nem `interactions`. A única ocorrência de `sb_secret_` é o teste de prefixo de chave da biblioteca `supabase-js`, sem valor. Só a URL pública do Supabase aparece, como esperado. Cabeçalhos da página iguais aos de `vercel.json` (CSP, `nosniff`, `DENY`, `no-referrer`, `Permissions-Policy`, `no-cache`).
- [x] Verificação desligada, parte do responsável ("Sim, tudo certo", 2026-11-17): consulta, lentes e comparação funcionando; painel de perguntas com a IA indisponível, sem quebrar a tela.
- [x] Etapa B (ação externa), "concluí a ação externa da issue #81 — etapa B" em 2026-11-17: `RQ_IA_HABILITADA` cadastrada em Production e Redeploy `Ready` do commit da PR #87 (print do painel com "Redeploy of …", ambiente Production).
- [x] C1 (agente, 2026-11-17, sem sessão, domínio de produção): `GET` → 405 `metodo_nao_permitido`; `POST` com `Origin` externa → 403 `origem_negada`; `POST` com corpo válido sem `Authorization` → 401 `nao_autenticado` (também com `Accept: application/x-ndjson`: JSON, sem fluxo); JWT inválido → 401 (1,1 s, consulta ao Auth); mesma origem sem JWT → 401. Todos em JSON, `Cache-Control: no-store`, sem dados; carga fictícia no corpo, recusada antes de qualquer leitura. A saída do 503 confirma a habilitação. Incidente de ferramenta, não da função: o `curl` do Windows recodifica argumentos com acento, e o corpo com "á" passado por argumento chegou como UTF-8 inválido (400 `entrada_invalida`, detalhe `UTF-8`, comportamento correto). Enviado de arquivo em UTF-8, o mesmo pedido teve 401.
- [ ] Etapa C: verificação T9 hospedada.
  - C7, tentativa 1 (2026-11-17, responsável; comparação municipal Colniza × Paranatinga, janela 2025-11-01 a 2026-10-31): HTTP 200 `incompleta`, `gemini-3.1-flash-lite`, 3 chamadas (3,6 s, 1,5 s e 5,8 s; 1.933 tokens de entrada e 352 de saída, uso verificado), sem repetição. O principal delegou só à disponibilidade, e a aplicação marcou a análise de lentes como necessária e não delegada. A ferramenta `consultar_disponibilidade` foi executada (E1: 286 de 365 dias sem evidência de lacuna e 79 indeterminados em cada município, alcance só do recorte). As 2 afirmações do subagente foram rejeitadas na conferência, então a análise é `saida_invalida`. Sem síntese, sem afirmação exibida, nota fixa de incompletude e etapas iguais às ocorridas. Segurança e honestidade conformes; caso **não aprovado**. Hipótese não confirmada: frase única sobre os dois municípios citando o item de um só (regra do mesmo item, issue #79). Encaminhamento: repetir C7 uma vez e executar C3–C6 antes de qualquer mudança; se a falha for sistemática, decisão do responsável antes de alterar instruções ou a delegação (D3).
  - C3, tentativa 1 (2026-11-17, responsável; Mato Grosso, A = 2026-08-01 a 2026-10-31, B = 2026-01-01 a 2026-04-02, 92 dias cada, sem lente aplicada: `unidades` 0 nos dois lados): HTTP 200 `parcial`, 6 chamadas (principal, lentes, disponibilidade, lentes, disponibilidade, principal), 21,2 s nas chamadas, 4.030 tokens de entrada e 805 de saída. Delegação aos **dois** subagentes, com chamadas próprias, as duas análises conferidas e síntese. Fatos numéricos iguais à evidência determinística E2 (A 6.416, B 544, diferença B−A −5.872, `comparar_periodos` `comparacao-008-v1`). Achados: (a) **G1, interpretação**: sem lente não há destaques, então E1 (`consultar_disponibilidade`) veio sem municípios nos dois lados. O subagente de disponibilidade afirmou que "não há registros de dados de monitoramento disponíveis… para a comparação direta", e a síntese repetiu que o monitoramento "se restringiu a municípios específicos". A afirmação passou na conferência, que só confere números, datas e referências, mas lê uma lista vazia por escopo como falta de dados. É o risco "resposta fluente sem evidência" do plano. Não exibe número falso, mas a frase é enganosa; (b) estado `parcial` numa pergunta sem causa (classificação do principal). Data de fim de B conferida: a comparação não ajusta datas (KB-007), então B com 2026-04-04 (94 dias) seria recusado. Caso **estruturalmente conforme a T9** (principal e dois subagentes com chamadas distintas), com o achado (a) pendente de decisão.
  - C3, tentativa 2 (2026-11-17, responsável; mesmos períodos, município Colniza, lente recorrência): HTTP 200 `incompleta`, 6 chamadas respondidas e **1 repetição após 503, recuperada** (primeira observação em produção do caminho de sobrecarga), 27,9 s nas chamadas, 7.024 tokens de entrada e 1.530 de saída. Delegação aos dois subagentes e síntese feita. Evidência determinística E2: A 824 detecções e 6 unidades destacadas; B 2 detecções e 0 unidades; 6 "saiu dos destaques observados"; diferença −822; meses A 3 e B 4 (abril parcial), com a ressalva de meses. A análise de lentes foi conferida, mas tem dois achados de interpretação que passaram na conferência: (c) **G1**: "destaques de recorrência… B registrou um total de 2, o período A apresentou 824". Os totais são **detecções**, não destaques (são 6 destaques em A e 0 em B); (d) "saída de seis unidades… entre o período B e o período A" inverte a leitura de A → B. A terceira afirmação (3 meses GMT de agosto a outubro de 2026) está correta. A disponibilidade **falhou de novo** (`saida_invalida`, 2 rejeitadas), e o mesmo ocorreu no C7.
  - Diagnóstico local da falha da disponibilidade (sem modelo, `conferirAfirmacao` com a E1 real do caso): rejeitadas a frase com as datas ISO da janela citando o município ("data divergente": a janela fica em `lados[i].janela`, fora do item do município), a frase com datas por extenso ("número divergente"), a comparação de A e B citando só um lado e a diferença calculada pelo modelo (rejeição correta). Aceitas: a mesma frase sem datas, citando também a janela ou os dois lados. O texto rejeitado não sai da produção, então a forma exata usada não foi observada. Achado (e): a conferência estrita do mesmo item rejeita formas legítimas de citar a janela da disponibilidade com dados reais.
- [ ] PR 2: `008_validation_agentes.md`, reconciliação e fechamento da issue.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run test:interface` | 218/218 (inclui `vercel.json` com só `api/explicar.ts` e `maxDuration` 300, CSP, segredos e bundle sem chave) |
| `npm run typecheck` / `npm run typecheck:servidor` | Sem erros |
| `npm run build` | Concluído |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | PR 1 (#87): verdes ("Validate governance", "Database RLS and query contract", "Interface typecheck, build and E2E"); PR 2 pendente |
| Verificação hospedada | Desligada: conforme (agente e responsável). Habilitada: C1 conforme; C2–C10 em andamento |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **`maxDuration` antes da conferência na conta.** O plano (T6) pede conferir o suporte gratuito antes de configurar a duração. A conferência foi feita na documentação oficial. O estado do Fluid compute na conta fica com o responsável, na etapa A, porque o merge da `main` já gera o deploy de produção. Se o deploy falhar por esse motivo, a situação passa a "Parado", sem troca de plano. A produção anterior continua servindo e a IA continua desligada.
- **Falha controlada (C9).** A cota diária não é esgotada de propósito. Sem falha natural, o ensaio usa uma chave inválida temporária, uma mudança de ambiente feita pelo responsável dentro da etapa B, e a chave é restaurada em seguida. Sem esse ensaio, o relatório registra C9 como não executado em produção.
- **Execução conjunta.** O agente não entra com conta Google. Os casos com sessão (C2 a C8, C10) são feitos pelo responsável na própria sessão; o agente faz as sondagens anônimas (C1 e verificação desligada) e registra as evidências.
- **`.env.example`.** As variáveis `RQ_*` ficam documentadas no runbook, e não no exemplo, pelo mesmo motivo registrado na issue #79 (o teste do bundle trata linha vazia seguida de outra como valor).

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando verificação em produção — ciclo 008 (completo)
Quem: Responsável
Conferir: docs/runbook.md, seção 12, etapa C (casos C2–C10); autorização de produção já registrada
Diga: "autorizo a verificação em produção do ciclo 008"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 81 (etapa A) + f0599c5`
- `effect_class`: `read_only` (sondagens) e `local_mutation` (task)
- `state_before` / `state_after`: etapa A concluída, verificação em produção não iniciada / etapa B concluída, C1 conforme, C2–C10 pendentes
- `result`: `executed`
- `evidence`: status Vercel `success` em `f0599c5`; retorno do responsável registrado em "Execução"
- `blockers`: execução de C2–C10 com a sessão do responsável

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
