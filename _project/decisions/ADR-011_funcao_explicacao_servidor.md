---
title: "Função de explicação no servidor: acesso sob JWT e RLS, ferramentas determinísticas e provedor desligado por padrão"
tags:
  - arquitetura
  - seguranca
  - privacidade
  - G2
author: "Claude Code (Opus 5.5)"
module: "api, servidor"
last_updated: "2026-11-16"
origin_cycle: "008"
---

# ADR-011: Função de explicação no servidor — acesso sob JWT e RLS, ferramentas determinísticas e provedor desligado por padrão

## Status

Aceito. Criado no item 2 do plano `008` v3 (aprovado em 2026-11-15), issue #78, sob a autorização literal "Autorizo a implementação da issue #78" de 2026-11-16, com T4 e T6 ratificados na aprovação do plano. Vigora com a integração da PR da issue #78. Acrescenta a primeira função de servidor ao ADR-007 (que só tinha o build estático); ADR-005, ADR-007 e ADR-009 continuam valendo. A compatibilidade real do transporte com o Gemini (chamada de ferramenta, saída estruturada e `store=false`) fica para o item 3, que completa esta decisão com a prova real. O item 3 (issue #79) acrescentou a seção "Complemento do item 3": orquestração, formato do transporte e resultado da prova real local.

## Contexto

O ciclo `008` acrescenta perguntas em linguagem natural respondidas por agentes Gemini sobre evidências do Rastro Quente (D1, D3). A chave do provedor não pode ir ao navegador, e as evidências enviadas têm de vir de leituras autorizadas e conferidas, não de números do cliente. Até aqui a Vercel servia só `dist`, e todo acesso a dados era do navegador, sob o JWT do responsável e a RLS (ADR-005).

## Decisão

1. **Uma função Node na Vercel**, `api/explicar.ts`, com a lógica em `servidor/` (fora do grafo do navegador). Runtime Node 24, fixado por `engines` `24.x` no `package.json`. Sem framework de agentes nem SDK do provedor: `fetch` nativo e o `@supabase/supabase-js` já adotado.
2. **Desligada por padrão.** Sem `RQ_IA_HABILITADA=true` e configuração completa (`RQ_SUPABASE_URL`, `RQ_SUPABASE_CHAVE_PUBLICAVEL`, `RQ_GEMINI_CHAVE`, `RQ_GEMINI_MODELO` igual ao modelo fixado, `gemini-3.1-flash-lite` desde o item 3 (antes, `gemini-3.8-flash`), sem alias), a função responde 503 `ia_desabilitada` com `no-store` a qualquer método e identidade, antes de ler o corpo, a sessão ou qualquer serviço. Variáveis só do servidor, nunca com prefixo `VITE_`.
3. **Ordem fixa por pedido:** habilitação → método (só POST) e origem (a própria ou a lista `RQ_ORIGENS`; origem não autentica) → corpo até 16 KiB, esquema fechado, pergunta até 2.000 caracteres → JWT só no cabeçalho, validado no Supabase Auth (papel `authenticated`) → autorização vigente provada por consulta sob RLS (a carga vigente só aparece para o responsável) → eco da carga conferido com a vigente → ferramentas → revalidação → provedor → revalidação → resposta.
4. **Cliente Supabase por pedido**, com a chave pública e o JWT do usuário; sem `service_role`, senha de banco ou sessão compartilhada entre pedidos.

   | Identidade ou situação | Resposta | Supabase | Provedor |
   | :-- | :-- | :-- | :-- |
   | Sem JWT, ou JWT inválido, expirado, adulterado, `anon` ou `service_role` | 401 `nao_autenticado` | Só a validação | Nenhuma chamada |
   | Autenticado fora da lista de responsáveis | 403 `acesso_negado` | A RLS nega | Nenhuma chamada |
   | Responsável, carga vigente e pedido válido | 200 | Só leituras autorizadas | Evidências do pedido |
   | Responsável revogado durante a execução | 403 e resposta descartada | A RLS nega na revalidação | Nenhuma chamada depois da detecção |
   | Carga trocada ou retirada durante a execução | 409 `versao_substituida` | Cargas não misturadas | Nenhuma síntese com versões misturadas |
   | Eco da carga diferente da vigente | 409 `versao_substituida` | — | Nenhuma chamada |

5. **Catálogo fechado de ferramentas** (`servidor/ferramentas.ts`): `explicar_selecao`, `comparar_periodos`, `comparar_municipios`, `consultar_disponibilidade` e `ler_detalhes`. Os argumentos só referenciam o pedido validado; nenhuma ferramenta executa texto como código ou SQL. Cada uma relê os dados sob o JWT, confere a leitura pelo carregador (`src/lentes/carregar.ts`) e calcula com os mesmos módulos do navegador (lentes e `comparacao-008-v1`). O detalhe vem em páginas de até 100 registros; totais e classificações valem para o conjunto completo, e a resposta diz quando a página não é o todo. Neste item, cada pedido executa a ferramenta principal do seu tipo e faz uma chamada ao provedor; a orquestração do agente principal e dos dois subagentes é o item 3.
6. **Orçamento:** 270 s no total; 120 s cumulativos de leitura e cálculo para todas as ferramentas; 120 s cumulativos de geração, até 20 s por chamada; o cancelamento do pedido aborta as operações em curso. Esgotado o tempo, a resposta é `tempo_esgotado`, sem síntese. Leitura de disponibilidade com concorrência 4. O `maxDuration` da função só será configurado depois de conferir o limite gratuito da conta (item 5).
7. **Provedor:** chamada REST a `https://generativelanguage.googleapis.com/v1beta/interactions`, com `store=false`, sem execução em segundo plano e com saída até 1.500 tokens. O corpo completo, medido em bytes UTF-8, vai até 64 KiB e é recusado antes do envio se passar disso. Sem repetição automática; o corpo de erro do provedor não é repassado. Falha do provedor devolve 502 com as evidências já conferidas e revalidadas, sem síntese.
8. **Respostas e logs:** JSON, `no-store`, sem CORS amplo e sem eco do conteúdo recebido; a resposta gerada vem marcada "Gerado por IA" com aviso fixo. Os logs da função levam só etapa, código de status e duração; nunca a pergunta, a resposta, os dados, o JWT ou o ID do usuário.
9. **Dados enviados ao provedor (D7):** dados territoriais públicos pertinentes à pergunta, inclusive registros detalhados, conforme a autorização do responsável. Nunca credenciais, tokens ou dados de conta. Revogação de acesso não retira o que já foi enviado legitimamente.

## Complemento do item 3 (issue #79)

Sob a autorização literal "autorizo a implementação da issue #79" de 2026-11-16, com T5, T6 e T9 do plano v3.

1. **Agentes** (`servidor/agentes.ts`). Principal: uma chamada que classifica e delega por chamada de função (`delegar_lentes`, `delegar_disponibilidade`, `recusar_pergunta`, com `tool_choice` restrito a elas); a aplicação valida a seleção. Subagente de lentes e evidências: só a ferramenta do tipo de pedido e `ler_detalhes`; subagente de disponibilidade: só `consultar_disponibilidade`. Cada subagente faz até duas chamadas próprias (pedido de ferramenta, numa rodada de até 3 chamadas; depois a análise em saída estruturada, com `tool_choice` `none`), em paralelo, sem delegação entre eles. Principal final: síntese em saída estruturada sobre as análises conferidas. Teto de 6 chamadas por execução, verificado numa porta única para o provedor; nenhuma repetição automática.
2. **Delegação necessária.** Comparações exigem as duas análises; seleção, a de lentes; disponibilidade, a de disponibilidade. Faltou ou falhou uma análise: estado `incompleta`, com nota fixa. Recusa: texto fixo por motivo (autoria ou infração, propriedade, previsão, dados pessoais ou credenciais, fora do tema), uma só chamada. Pergunta parcialmente respondível (por exemplo, causas): estado `parcial`, nota fixa e limites.
3. **Evidências e conferência.** Cada resultado de ferramenta recebe um identificador (`E1`, `E2`...); as afirmações do modelo citam caminhos (`E1.a.total`). A aplicação rejeita a afirmação com referência inexistente, número ou data que não constem nas evidências referenciadas, classificação da comparação diferente da evidência, HTML, link ou alegação de causa, autoria, infração, propriedade ou previsão. Só afirmações conferidas são devolvidas.
4. **Recorte validado antes do provedor.** Período fora da versão, períodos de durações diferentes ou município inválido são recusados (400) antes de qualquer chamada ao modelo.
5. **Revalidação** do acesso e da carga antes de cada envio de evidências ao provedor (segunda chamada de cada subagente e síntese) e antes da resposta. As chamadas que antecedem as evidências levam só a pergunta e o recorte.
6. **Transporte.** Corpo com `model`, `store=false`, `system_instruction` (texto), `input` como lista de passos (`user_input`, os passos recebidos do modelo exatamente como vieram, inclusive `thought` com assinatura, e `function_result` com `call_id`), `tools`, `response_format` (`type` `text`, `mime_type` `application/json`, `schema`) e `generation_config` (`max_output_tokens` 1.500 e `tool_choice`). Resposta lida de `steps` (`function_call` com `id`, `name` e `arguments`; texto em `model_output.content[].text`), `status` e `usage` (`total_input_tokens`, `total_output_tokens`, `total_thought_tokens`); formato conferido na referência pública da Interactions API em 2026-11-16. O cliente do item 2 lia `outputs`, ausente da referência; corrigido aqui. HTTP 429 vira `cota_provedor` (429 ao cliente), sem repetição; formato inesperado vira `saida_invalida`; corpo acima de 64 KiB vira `limite_envio` sem envio.
7. **Resposta.** Estado (`completa`, `parcial`, `incompleta`, `fora_do_alcance`), afirmações conferidas, limites, notas fixas, aviso "Gerado por IA", análises por subagente, evidências por identificador e a execução real: modelo, chamadas (papel, ordem, duração, uso), uso agregado (verificado só quando o provedor informou o uso de todas) e eventos por etapa sem conteúdo. Falha do provedor no meio devolve o que já foi conferido, sem síntese. O fluxo de eventos sobre a resposta HTTP fica com o painel (item 4).
8. **Modelo e cota.** O projeto Gemini fica no nível gratuito, por decisão do responsável. Como `gemini-3.8-flash` ficou indisponível nas duas tentativas da prova real de 2026-11-16 (HTTP 503 de alta demanda), o responsável decidiu trocar de modelo, conforme o plano permite ("Se indisponível, apresentar alternativa gratuita e registrar decisão antes da troca"), com a frase literal "autorizo trocar o modelo para gemini-3.1-flash-lite" (2026-11-16). O novo modelo é `gemini-3.1-flash-lite`: estável, listado na Interactions API, com chamada de função, saída estruturada e nível gratuito, conferidos na documentação oficial em 2026-11-16, e desligamento previsto a partir de 2027-05-07. As cotas do nível gratuito vistas no AI Studio são RPM 15, TPM 250 mil e RPD 500. O mesmo modelo atende os três papéis. `RQ_GEMINI_INTERVALO_MS` (opcional, de 0 a 20.000; presente e inválido desliga a função) espaça os inícios das chamadas na porta única do provedor, inclusive os paralelos. A espera consome só o tempo total, não o orçamento de geração. Não há pagamento nem redução dos subagentes.
9. **Prova real local (T9):** `npm run prova:agentes`, com a chave só no `.env` local ignorado. Resultado parcial em 2026-11-16: com `gemini-3.8-flash`, as tentativas 1 e 2 deram 503 de alta demanda e tempo esgotado. Com `gemini-3.1-flash-lite`, a compatibilidade do transporte se confirmou em chamadas reais: chamada de função, `function_result`, saída estruturada e `store=false` funcionaram. R2 (disponibilidade, 4 chamadas) e F1 (recusa) passaram. R1 e P1 continuam pendentes por 503 e por chamadas que passaram dos 20 s com envios pequenos. O resultado é registrado na task da issue e resumido aqui antes do merge.

## Consequências

### Positivas

- A chave do provedor fica só no servidor; o bundle do navegador não contém variável, endpoint ou chave do provedor (teste `bundle.test.mjs`).
- Evidências recalculadas no servidor com o mesmo código e conferidas contra o cálculo do código-fonte na prova do pacote.
- O merge implanta a função desligada; comparação e lentes não dependem dela.

### Trade-offs

- Leituras completas repetidas no servidor (o navegador já as fez): custo de tempo dentro do orçamento, em troca de não confiar no cliente.
- Pergunta sobre todo o estado pode passar dos 120 s de leitura; nesse caso não há síntese (CP-18), e o detalhamento sem IA continua disponível.
- O contador de tempo é por execução; cotas globais são as do projeto Gemini, sem limite diário próprio.

## Alternativas consideradas

- **Chamar o Gemini do navegador:** expõe a chave e confia nos números do cliente. Rejeitada.
- **Função com `service_role`:** quebraria o isolamento por RLS do ADR-005. Rejeitada.
- **SDK ou framework de agentes:** dependência de execução nova sem necessidade comprovada. Adiada.

## Referências

- Plano `_project/drafts/008_comparacao_periodos_agentes/008_plan.md` (v3), T4 a T6 e item 2.
- ADR-005 (banco e autorização), ADR-007 (interface), KB-007 (comparação).
- Prova: `npm run typecheck:servidor`, `npm run test:api`, `scripts/agentes/conferir-pacote.mjs` (resultados na task da issue #78).
