# Validação — agentes de explicação hospedados (ciclo 008, item 5)

> **Ciclo:** `008`
> **Issue:** `#81`
> **Plano:** `_project/executed/008_comparacao_periodos_agentes/008_plan.md` (v3), T6 e T9
> **Task:** [008_task_issue-81.md](008_task_issue-81.md)
> **Período da verificação:** 2026-11-16 e 2026-11-17
> **Autorização de produção:** "Autorizo", em resposta à pergunta "Autoriza a verificação em produção do ciclo 008?" (2026-11-16)

## Finalidade

Registrar o que foi observado com o Gemini real no ambiente hospedado, separando o que foi observado em produção, o que só foi observado localmente, o que é simulado e o que não foi executado. O documento também registra limitações, cotas e as correções que a verificação provocou. Ele não traz chave, JWT, UUID, e-mail nem dados de conta.

## Ambiente

| Item | Valor |
| :-- | :-- |
| Hospedagem | Vercel Hobby, Fluid compute ligado, `maxDuration` 300 s em `api/explicar.ts`; deploy de produção do commit `f0599c5` (PR #87), com Redeploy depois das variáveis |
| Variáveis | `RQ_SUPABASE_URL`, `RQ_SUPABASE_CHAVE_PUBLICAVEL`, `RQ_GEMINI_CHAVE` (Sensitive), `RQ_GEMINI_MODELO` e, a partir da etapa B, `RQ_IA_HABILITADA`; todas em Production |
| Provedor | Interactions API (`v1beta/interactions`), `gemini-3.1-flash-lite`, `store=false` |
| Cotas (AI Studio, nível gratuito, sem faturamento) | RPM 15, TPM 250 mil, RPD 500; nenhuma cobrança habilitada |
| Logs da Vercel | Observabilidade restrita no Hobby; retenção não observável no painel |
| Dados | Carga hospedada de detecções públicas (Mato Grosso, 2025-11-01 a 2026-10-31), D7 |

## Observado em produção

### Com a IA desligada (antes da etapa B)

- `GET` e `POST` anônimos → 503 `ia_desabilitada`, `no-store`, sem dados; `POST` com `Origin` externa → 503, porque a habilitação vem antes da origem.
- Bundle publicado sem `RQ_GEMINI`, `RQ_IA_HABILITADA`, `generativelanguage`, `AIza`, `service_role` ou `interactions`. A única ocorrência de `sb_secret_` é um teste de prefixo dentro da biblioteca `supabase-js`, sem valor.
- Cabeçalhos da página iguais aos de `vercel.json`.
- Interface (responsável): consulta, lentes e comparação funcionando; painel de perguntas com a IA indisponível, sem quebrar a tela.

### Com a IA ligada

| Caso | Contexto | Estado | Chamadas / tempo nas chamadas | Observação |
| :-- | :-- | :-- | :-- | :-- |
| C1 | Anônimo | — | 0 | `GET` 405; `Origin` externa 403; sem JWT 401, também pedindo fluxo (JSON, sem fluxo); JWT inválido 401. Nenhuma leitura de dados nem chamada ao provedor |
| C7 (1) | Colniza × Paranatinga, janela inteira, texto livre | `incompleta` | 3 / 10,9 s | O principal delegou só à disponibilidade; a análise de disponibilidade foi rejeitada na conferência (2 afirmações) |
| C3 (1) | Mato Grosso, 2026-08-01–10-31 × 2026-01-01–04-02, sem lente | `parcial` | 6 / 21,2 s | Os **dois** subagentes, com chamadas próprias, e síntese; números iguais à evidência (6.416, 544, −5.872). Frase enganosa: lista vazia de municípios lida como "não há dados" |
| C3 (2) | Colniza, mesmos períodos, recorrência | `incompleta` | 6 + 1 repetição após 503 / 27,9 s | 503 recuperado. Análise de lentes conferida, mas chamou 824 detecções de "destaques" e inverteu o sentido A → B; disponibilidade rejeitada |
| C3 (3) | Mato Grosso, mesmos períodos, concentração | `incompleta` | 6 / 20,9 s | Análise de lentes **exata**: 19 municípios (9 entraram, 8 saíram, 2 permaneceram), iguais ao detalhamento sem IA; disponibilidade rejeitada (2) |
| C4 | Colniza, 2026-08-01–10-31, "Há lacunas nos dados?" | `completa` | 4 / 13,2 s | Só o subagente de disponibilidade; 72 e 20 de 92 dias, iguais à evidência. Redação "cobertura do solo" |
| C5 | Colniza, períodos, recorrência, pergunta causal | `incompleta` | 6 + 1 repetição após 503 / 31,5 s | Nenhuma causa afirmada; lentes correta (824, 2, diferença 822); disponibilidade rejeitada (1) |
| C6 | "Quem colocou fogo em Colniza?" | `fora_do_alcance` | 1 / 1,3 s | Recusa com texto fixo |
| C7 (2) | "Comparar municípios" → seletor de B com foco; Colniza × Paranatinga, texto livre | `parcial` | 6 / 14,1 s | As duas análises conferidas, mas a frase com as contagens (824 × 330) foi rejeitada, e a síntese ficou sem elas |
| C8 | Cancelar; trocar o município B durante a execução | — | — | "Pergunta cancelada; nada da resposta foi exibido"; "A seleção mudou: a pergunta anterior foi cancelada e a resposta saiu da tela". Sem resposta tardia em 30 a 35 s |
| C10 | Fluxo | — | — | Etapas exibidas na ordem real, com chamadas numeradas, delegações, ferramentas e evidências; logs da Vercel não observados (observabilidade restrita) |

Em todos os casos com IA: etapas iguais às ocorridas, "Gerado por IA" com aviso fixo, evidências determinísticas exibidas e uso de tokens informado pelo provedor. Nenhuma afirmação exibida trouxe número fora das evidências. O C1 e as leituras de C3 (3) a C8 foram feitos pelo agente, no navegador embutido do app, com a sessão do responsável: o login foi feito por ele, e o agente leu só o texto da tela. Os demais casos foram feitos pelo responsável.

## Achados e correção

| Achado | Natureza | Correção nesta issue |
| :-- | :-- | :-- |
| (e) A conferência rejeitou a disponibilidade em 4 de 6 execuções e a frase comparativa da análise de lentes | Confiabilidade | Datas da janela do ancestral admitidas só como datas; instrução para citar os dois lados em comparações |
| (c) Detecções chamadas de destaques | Exatidão (G1), passou na conferência | Instrução: `total`/`focos` são detecções, `unidades` são destaques |
| (d) Sentido A → B invertido | Exatidão (G1) | Instrução explícita sobre entrou e saiu |
| (a) Lista vazia por alcance lida como falta de dados | Exatidão (G1) | `sem_municipios` na evidência e instrução ao subagente |
| (f) "Cobertura do solo" | Redação | Instrução: cobertura dos dados |
| (b) `parcial` sem causa na pergunta; delegação incompleta no C7 (1) | Variação do modelo | Sem correção; registrada |

O diagnóstico de (e) foi local, com `conferirAfirmacao` sobre a evidência real do caso. O texto rejeitado não sai da produção, então a forma exata usada pelo modelo não foi observada.

## Observado só localmente ou simulado

- Correção acima: `npm run test:agentes` 25/25, com o formato real da evidência de Colniza (janela aceita só como data; número do outro lado, conta do modelo e data por extenso continuam rejeitados), e `npm run test:api` 14/14, com `sem_municipios` na comparação estadual sem lente, no Supabase local com fixture fictícia. `typecheck`, `typecheck:servidor`, `build` e `test:interface` 218/218.
- Prova real local da issue #79 (R1, R2, P1, F1 aprovados com fixture fictícia).
- Falha final do provedor (429, 502 e tempo esgotado) com a tela de erro: só nos testes com provedor simulado (`test:agentes`, `test:api`, E2E da issue #80).

## Não executado

- **C2 em produção** (segunda conta Google fora da lista), por decisão do responsável. A negação de acesso hospedada ficou provada só para anônimo, JWT inválido e origem externa (C1); a de conta autenticada sem autorização está provada localmente com Auth e RLS reais (issues #78 e #80).
- **C9 completo** (erro do provedor sem recuperação), por decisão do responsável: em produção, só dois 503 recuperados pela repetição única.
- **Reverificação em produção da correção**, por decisão do responsável ("não vamos depois de implementado fazer testes exaustivos", 2026-11-17). O efeito das instruções novas sobre o modelo real não foi medido.
- Logs da função na Vercel (observabilidade restrita no Hobby).

## Limitações e cotas

- Cerca de 1 em cada 4 execuções com IA teve 503 na primeira tentativa de alguma chamada, recuperado pela repetição. Quando a repetição também falha, a resposta não tem síntese.
- A conferência confere números, datas, classificações e referências, não o sentido da frase: (a), (c) e (d) passaram por ela. O aviso "pode conter erros" continua necessário.
- A cota é a do projeto Gemini, sem limite por usuário. Uma pergunta de comparação usa até 6 chamadas respondidas e até cerca de 12.800 tokens de entrada.
- Tempos observados nas chamadas: de 1,3 s a 31,5 s, abaixo dos 120 s de geração e dos 270 s totais.

## Conclusão

- **Requisito acadêmico (T9):** o agente principal e os dois subagentes foram demonstrados com o Gemini real em produção, com chamadas identificáveis por papel e ordem (C3 e C7). A recusa de autoria (C6) foi observada, e a escolha de delegação também (C4, só disponibilidade).
- **Segurança e acesso:** conformes em tudo o que foi observado (C1, verificação desligada, bundle, cancelamento e descarte).
- **Qualidade das respostas:** insuficiente antes da correção. A correção foi validada localmente e não foi medida em produção.
- **Valor do produto (avaliação do agente, 2026-11-17):** hoje os agentes acrescentam acesso e leitura (pergunta em linguagem natural, duas leituras juntas, recusa), não informação nova em relação à aba Destaques, porque G1 os limita a reescrever as evidências. Por decisão do responsável, o escopo dos agentes será revisto depois deste ciclo.
