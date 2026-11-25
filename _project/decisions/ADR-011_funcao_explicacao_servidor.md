---
title: "Função de explicação no servidor: acesso sob JWT e RLS, ferramentas determinísticas e provedor desligado por padrão"
tags:
  - arquitetura
  - seguranca
  - privacidade
  - G2
author: "Claude Code (Opus 5.5)"
module: "api, servidor"
last_updated: "2026-11-25"
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
6. **Orçamento:** 270 s no total; 120 s cumulativos de leitura e cálculo para todas as ferramentas; 120 s cumulativos de geração, até 20 s por chamada; o cancelamento do pedido aborta as operações em curso. Esgotado o tempo, a resposta é `tempo_esgotado`, sem síntese. Leitura de disponibilidade com concorrência 4. O `maxDuration` da função só será configurado depois de conferir o limite gratuito da conta (item 5). **Item 5 (issue #81):** `vercel.json` fixa `maxDuration` 300 só para `api/explicar.ts`, o máximo do Hobby com Fluid compute na documentação da Vercel atualizada em 2026-08-24; o estado do Fluid compute na conta é conferido pelo responsável na etapa A do runbook (seção 12) e respostas em fluxo contam nesse limite.
7. **Provedor:** chamada REST a `https://generativelanguage.googleapis.com/v1beta/interactions`, com `store=false`, sem execução em segundo plano e com saída até 1.500 tokens. O corpo completo, medido em bytes UTF-8, vai até 64 KiB e é recusado antes do envio se passar disso. Sem repetição automática; o corpo de erro do provedor não é repassado. Falha do provedor devolve 502 com as evidências já conferidas e revalidadas, sem síntese.
8. **Respostas e logs:** JSON, `no-store`, sem CORS amplo e sem eco do conteúdo recebido; a resposta gerada vem marcada "Gerado por IA" com aviso fixo. Os logs da função levam só etapa, código de status e duração; nunca a pergunta, a resposta, os dados, o JWT ou o ID do usuário.
9. **Dados enviados ao provedor (D7):** dados territoriais públicos pertinentes à pergunta, inclusive registros detalhados, conforme a autorização do responsável. Nunca credenciais, tokens ou dados de conta. Revogação de acesso não retira o que já foi enviado legitimamente.

## Complemento do item 3 (issue #79)

Sob a autorização literal "autorizo a implementação da issue #79" de 2026-11-16, com T5, T6 e T9 do plano v3.

1. **Agentes** (`servidor/agentes.ts`). Principal: uma chamada que classifica e delega numa única chamada de função: `delegar`, com a lista de analistas (`lentes` e/ou `disponibilidade`) e a classificação, ou `recusar_pergunta`, com `tool_choice` restrito a elas. A aplicação valida a seleção. A prova real mostrou que `gemini-3.1-flash-lite` faz uma só chamada de função por turno; por isso as duas funções de delegação do primeiro desenho viraram uma. Subagente de lentes e evidências: só a ferramenta do tipo de pedido e `ler_detalhes`; subagente de disponibilidade: só `consultar_disponibilidade`. Cada subagente faz até duas chamadas próprias (pedido de ferramenta, numa rodada de até 3 chamadas; depois a análise em saída estruturada, com `tool_choice` `none`), em paralelo, sem delegação entre eles. Principal final: síntese em saída estruturada sobre as análises conferidas. Teto de 6 chamadas respondidas por execução, verificado numa porta única para o provedor. Por decisão do responsável (2026-11-16), cada chamada admite no máximo uma repetição, só para HTTP 503 (sobrecarga), depois de 2 s e dentro do orçamento, com até 12 pedidos no pior caso. 429, outros erros e saída inválida não se repetem.
2. **Delegação necessária.** Comparações exigem as duas análises; seleção, a de lentes; disponibilidade, a de disponibilidade. Faltou ou falhou uma análise: estado `incompleta`, com nota fixa. Recusa: texto fixo por motivo (autoria ou infração, propriedade, previsão, dados pessoais ou credenciais, fora do tema), uma só chamada. Pergunta parcialmente respondível (por exemplo, causas): estado `parcial`, nota fixa e limites.
3. **Evidências e conferência.** Cada resultado de ferramenta recebe um identificador (`E1`, `E2`...); as afirmações do modelo citam caminhos (`E1.a.total`). A aplicação rejeita a afirmação com referência inexistente, número ou data que não constem nas evidências referenciadas, classificação da comparação diferente da evidência, HTML, link ou alegação de causa, autoria, infração, propriedade ou previsão. Só afirmações conferidas são devolvidas. Por decisão do responsável (2026-11-16), cada referência admite também os números e as datas do mesmo item: o ancestral mais próximo que identifica um município ou unidade ou, na falta dele, o lado da comparação. Nunca a evidência inteira. Texto anexado depois do caminho e o envelope `dados` são descartados quando o caminho citado não existe. **Issue #81 (decisão do responsável, 2026-11-17):** com dados reais em produção, a conferência rejeitou a análise de disponibilidade em 4 de 6 execuções, porque a janela fica no lado e fora do item do município, e também as frases que comparam A e B citando um só lado. A referência passa a admitir as datas (`inicio` e `fim`) da janela do ancestral mais próximo, inclusive a da própria evidência, só para conferir datas, nunca como números. As instruções comuns passam a pedir a citação dos dois lados em frases comparativas, "detecções" para `total` ou `focos` e "destaques" para `unidades`, o sentido A → B, a cobertura dos dados (não do solo) e datas AAAA-MM-DD. `consultar_disponibilidade` declara `sem_municipios` no lado sem município a conferir. Número de outro lado, conta do modelo e data por extenso continuam rejeitados.
4. **Recorte validado antes do provedor.** Período fora da versão, períodos de durações diferentes ou município inválido são recusados (400) antes de qualquer chamada ao modelo.
5. **Revalidação** do acesso e da carga antes de cada envio de evidências ao provedor (segunda chamada de cada subagente e síntese) e antes da resposta. As chamadas que antecedem as evidências levam só a pergunta e o recorte.
6. **Transporte.** Corpo com `model`, `store=false`, `system_instruction` (texto), `input` como lista de passos (`user_input`, os passos recebidos do modelo exatamente como vieram, inclusive `thought` com assinatura, e `function_result` com `call_id`), `tools`, `response_format` (`type` `text`, `mime_type` `application/json`, `schema`) e `generation_config` (`max_output_tokens` 1.500 e `tool_choice`). Resposta lida de `steps` (`function_call` com `id`, `name` e `arguments`; texto em `model_output.content[].text`), `status` e `usage` (`total_input_tokens`, `total_output_tokens`, `total_thought_tokens`); formato conferido na referência pública da Interactions API em 2026-11-16. O cliente do item 2 lia `outputs`, ausente da referência; corrigido aqui. HTTP 429 vira `cota_provedor` (429 ao cliente), sem repetição; HTTP 503 vira `provedor_indisponivel` marcado como sobrecarga, o único repetido (uma vez) pela orquestração; formato inesperado vira `saida_invalida`; corpo acima de 64 KiB vira `limite_envio` sem envio.
7. **Resposta.** Estado (`completa`, `parcial`, `incompleta`, `fora_do_alcance`), afirmações conferidas, limites, notas fixas, aviso "Gerado por IA", análises por subagente, evidências por identificador e a execução real: modelo, chamadas (papel, ordem, duração, uso), uso agregado (verificado só quando o provedor informou o uso de todas) e eventos por etapa sem conteúdo. Falha do provedor no meio devolve o que já foi conferido, sem síntese. O fluxo de eventos sobre a resposta HTTP é o do ponto 10.
8. **Modelo e cota.** O projeto Gemini fica no nível gratuito, por decisão do responsável. Como `gemini-3.8-flash` ficou indisponível nas duas tentativas da prova real de 2026-11-16 (HTTP 503 de alta demanda), o responsável decidiu trocar de modelo, conforme o plano permite ("Se indisponível, apresentar alternativa gratuita e registrar decisão antes da troca"), com a frase literal "autorizo trocar o modelo para gemini-3.1-flash-lite" (2026-11-16). O novo modelo é `gemini-3.1-flash-lite`: estável, listado na Interactions API, com chamada de função, saída estruturada e nível gratuito, conferidos na documentação oficial em 2026-11-16, e desligamento previsto a partir de 2027-05-07. As cotas do nível gratuito vistas no AI Studio são RPM 15, TPM 250 mil e RPD 500. O mesmo modelo atende os três papéis. `RQ_GEMINI_INTERVALO_MS` (opcional, de 0 a 20.000; presente e inválido desliga a função) espaça os inícios das chamadas na porta única do provedor, inclusive os paralelos. A espera consome só o tempo total, não o orçamento de geração. Não há pagamento nem redução dos subagentes.
9. **Prova real local (T9):** `npm run prova:agentes`, com a chave só no `.env` local ignorado. Resultado em 2026-11-16: o `gemini-3.8-flash` ficou indisponível (503 de alta demanda), e o modelo foi trocado conforme o ponto 8. Com o `gemini-3.1-flash-lite`, a prova real mostrou três ajustes necessários: o modelo faz uma só chamada de função por turno (daí a função única `delegar`), cita caminhos imprecisos (daí a normalização e a conferência pelo mesmo item) e o provedor recebe 503 com frequência (daí a repetição única). Depois dos ajustes, os quatro casos mínimos passaram: R1 `completa` (dois analistas, 6 chamadas respondidas, 8 afirmações conferidas, 0 rejeitadas), R2 `completa`, P1 `parcial` e F1 `fora_do_alcance`, sempre com `store=false` e sem chave nem JWT nos corpos. Algumas chamadas pequenas passaram dos 20 s por latência do provedor, e o limite não foi alterado. Os detalhes estão na task da issue #79.
10. **Fluxo de eventos (item 4, issue #80).** Na mesma rota, sem rota nova: com `Accept: application/x-ndjson`, depois da matriz T4 (acessos negados, pedido inválido e carga divergente continuam respostas HTTP comuns em JSON, sem fluxo e sem provedor), a resposta é `200` com uma mensagem JSON por linha: `{"tipo":"evento","evento":…}` para cada etapa real emitida pela orquestração, sem conteúdo da pergunta ou das evidências, e por fim `{"tipo":"fim","status":N,"corpo":…}`, com o mesmo status e corpo da resposta sem fluxo (o resultado continua saindo só depois da revalidação). Sem `Accept`, a resposta é a de antes. Fechar o fluxo aborta o orçamento da execução: nenhuma chamada nova ao provedor começa depois do cancelamento (`test:api`). O navegador lê o fluxo por `fetch` na própria origem, com o JWT só em `Authorization`, valida cada mensagem (tipos e campos fechados) e descarta a execução se a seleção, a carga ou a sessão mudarem. O funcionamento do fluxo na Vercel hospedada é conferido no item 5.

## Emenda — ciclo `009` (2026-11-17)

Com a saída do cartão "Disponibilidade dos dados" (plano `009`, D2; issue #91), a evidência de `consultar_disponibilidade` fora da comparação só tem detalhamento no próprio painel de perguntas: ela não oferece "Ver o detalhamento na tela", e a nota das evidências diz isso. Com comparação, o atalho continua levando à aba "Comparação". O detalhamento sem IA das lentes e da comparação continua nas abas.


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

- Plano `_project/executed/008_comparacao_periodos_agentes/008_plan.md` (v3), T4 a T6 e item 2.
- ADR-005 (banco e autorização), ADR-007 (interface), KB-007 (comparação).
- Prova: `npm run typecheck:servidor`, `npm run test:api`, `npm run test:agentes`, `scripts/agentes/conferir-pacote.mjs` e `npm run prova:agentes` (resultados nas tasks das issues #78 e #79).

## Emenda de 2026-11-21 — ciclo 010

Os atalhos do painel usam o recorte e a identidade do pedido vigente para voltar ao resultado e abrir as evidências já recebidas. A sessão, o formato do fluxo e o contrato do servidor permanecem.

## Emenda de 2026-11-21 — ciclo 011, issue #107

O plano v4 aprovado substitui atomicamente API e painel na mesma PR. O corpo de `POST /api/explicar` passa a ser `{ pergunta_id, carga, recorte }`, sem texto livre: `panorama`, `mudanca`, `padroes`, `cuidados` ou `proximos`. `selecao` recebe lente explicitamente nula ou válida; `periodos` preserva a KB-007. Recortes `municipios` e `disponibilidade`, IDs desconhecidos, campos extras e incompatibilidades são recusados antes do provedor. Concentração em município é inválida. Comparação de municípios continua disponível na aplicação, fora dos agentes.

Os papéis internos `lentes` e `disponibilidade` são apresentados como padrões e contexto/qualidade. O catálogo por pergunta restringe ferramentas e argumentos; o principal só pode delegar. Cuidados exige contexto/qualidade; as outras quatro exigem ambos. Falta ou falha de análise obrigatória impede síntese. Padrões relê critérios aplicáveis e cruza células T1 em pelo menos dois critérios distintos, sem contar sequências repetidas nem classes de sobreposição separadamente. Concentração usa a projeção municipal da KB-005 somente no estado; recorrência exige janela elegível; camada ausente não é falha, mas leitura incompleta de critério aplicável não admite achados parciais. Distribuição conta todos os registros GMT por dia/mês e preserva empates. Disponibilidade estadual sem lente é restrita aos municípios associados às detecções, com lista explícita; sem detecções fica não avaliada. Leituras são conferidas e reaproveitadas somente dentro do pedido sob o mesmo JWT.

Tópicos mantêm `texto` e `referencias`, com `limitacao` e `sugestao` opcionais, cada uma com texto e referências conferidas. Limites gerais têm catálogo fixo; ressalvas factuais precisam de referências. Conferência rejeita HTML, referências inexistentes, valores divergentes e alegações proibidas; o caso explícito de direção comparativa invertida também é testado. Isso não prova o sentido de qualquer frase futura: utilidade e pertinência semântica exigem avaliação humana dos casos e da amostra. Sugestões ficam nos destinos textuais aprovados pelo plano, sem comandos do modelo.

Permanecem desligamento padrão, matriz JWT/RLS, revalidação antes de enviar evidências e responder, `store=false`, teto de seis chamadas, repetição única 503, 64 KiB por envio, 120 s de leitura, 120 s de geração, 270 s totais e cancelamento. Evidência que exceda o limite impede envio/síntese, sem truncamento silencioso. Não há migração, fonte nova ou alteração dos métodos de lentes e comparação. A prova real e sua avaliação ainda dependem das condições e autorizações registradas na task; esta emenda não atesta produção.

### Conferência após a amostra fictícia do ciclo 011

A saída capturada revelou perda de uma observação temporal correta porque a sugestão opcional tinha fundamento inadequado. Sugestão inválida passa a ser omitida separadamente, com nota fixa; observação e limitação válidas são preservadas. Uma limitação inválida continua descartando o tópico, para não exibir uma afirmação sem a ressalva necessária. A referência numérica correta não autoriza transformar “sem evidência de lacuna” em certeza de “sem lacunas”; a formulação observada agora tem caso de regressão. Uma síntese que fique só com evidência isolada informa insuficiência, mesmo com subagentes concluídos. A presença estrutural de referências/limitação não prova interpretação útil: avaliação humana continua obrigatória. A fixture de regressão contém apenas dados inteiramente fictícios da amostra autorizada e reproduz a falha sem rede.

## Emenda de 2026-11-25 — ciclo 013, issue #115

Decisão do responsável, registrada no plano do ciclo 013 (D1 e D2, "Sim, com as recomendações", 2026-11-25): a rota `/api/interpretar` da "Pergunte ao mapa" (ciclo 012) ganha nova tentativa e modelo reserva para a sobrecarga do provedor. Motivo: em 2026-11-25, o `gemini-3.1-flash-lite` respondeu 503 de alta demanda por vários minutos, enquanto o `gemini-3.5-flash` respondia com a mesma chave e interpretava a pergunta corretamente.

- **Nova tentativa.** Com HTTP 503 de sobrecarga no modelo principal, a rota espera 2 s e tenta o principal mais uma vez, como já faz a orquestração do `/api/explicar`.
- **Modelo reserva.** Se o principal continuar com 503, a mesma pergunta vai uma vez para o `gemini-3.5-flash`. Ele recebe exatamente o que o principal recebe (a pergunta, a janela e os nomes públicos de município) e sua saída passa pelo mesmo validador.
- **Prazo único.** Principal, espera, nova tentativa e reserva cabem no prazo de 20 s do provedor. Nenhuma chamada começa com menos de 3 s úteis.
- **Teto da nova tentativa (D9 do plano 013).** Com a reserva ligada, a nova tentativa no principal tem teto de 7 s e deixa à reserva pelo menos 3 s. Estourar esse teto depois de um 503 leva a pergunta à reserva, porque o principal já se mostrou sobrecarregado.
- **Sem reserva para outros erros.** 429 (`cota_provedor`), saída inválida, tempo esgotado na primeira chamada e outros erros não repetem nem acionam a reserva.
- **Configuração.** `RQ_GEMINI_MODELO_RESERVA` é opcional e só vale se for exatamente `gemini-3.5-flash`, sem alias. Ausente ou com outro valor, a reserva fica desligada e a IA continua como antes; o valor inválido não desliga a IA. É variável só do servidor, cadastrada na Vercel pelo responsável.
- **Código novo.** Sobrecarga sem saída responde `provedor_sobrecarregado` (503), e a tela explica o motivo. A resposta informa o modelo usado e se foi a reserva; o log registra o modelo e o número de chamadas, nunca a pergunta.
- **Cota.** O projeto Gemini continua no nível gratuito, sem pagamento.
- **Escopo.** Vale só para `/api/interpretar`. O `/api/explicar`, o modelo fixado (`RQ_GEMINI_MODELO`) e as regras desta ADR para ele não mudam.
- **Prova:** `npm run test:agentes` (rota e configuração, sem rede), `tests/e2e/16-pergunte.spec.mjs` (provedor simulado sobrecarregado e com a reserva) e a prova real local da interpretação, com resultado na PR da issue #115.
