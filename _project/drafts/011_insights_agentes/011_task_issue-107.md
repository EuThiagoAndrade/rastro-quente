# Task — Issue #107: Insights interpretativos e painel de perguntas fechadas

> **Ciclo:** `011`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#107`
> **Plano:** `_project/drafts/011_insights_agentes/011_plan.md`
> **Branch:** `feature/issue-107`
> **PR:** —
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #107" em 2026-11-21
> **Modo contínuo:** `—`
> **Início:** 2026-11-21
> **Última atualização:** 2026-11-21
> **handoff_schema_version:** `2`

## Objetivo

Implementar os insights interpretativos e o painel de cinco perguntas no escopo do plano v4.

## Escopo autorizado

Issue #107 e plano v4 aprovado, incluindo troca atômica da API e painel, testes e amostra real sujeita às condições do plano.

### Autorização da amostra real — 2026-11-21

O responsável confirmou que a API continua gratuita e as condições permanecem as anteriores, e autorizou as execuções pedindo a menor utilização possível de chamadas e somente a verificação mínima da funcionalidade, sem testes de carga. Alcance: os dois casos fictícios delimitados no plano, até 12 chamadas respondidas/24 tentativas; sem pagamento, troca de modelo ou ampliação de casos. Esta confirmação supre a precondição externa registrada na retomada anterior; não autoriza merge nem produção.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Casos fictícios de distribuição GMT, projeção municipal, recorrência, sequências repetidas, classes de sobreposição, insuficiência e sentido comparativo invertido passaram. Amostra Gemini interrompida por HTTP 400 no schema; diagnóstico isolado confirmou a recusa. Caso insuficiente validado e panorama posterior com ambos os subagentes/síntese concluídos; preservação do fato temporal e limitação negativa reconferidas pela captura fictícia. 44 testes locais de agentes passaram; aceite humano da utilidade concedido em 2026-11-21. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | 16 testes de API passaram com Auth/RLS locais, incluindo acesso permitido/negado, revogação, troca de carga, revalidação e cancelamento; pacote isolado confirmou 403/200. |
| G3 — privacidade de dados | Sim | Fixtures fictícias, revisão do diff e testes do bundle; JWT/chave ausentes dos corpos do provedor simulado e store=false. Sem uso de dados reais nesta execução. |
| G4 — migrações só acrescentam | Não | Nenhuma migração prevista. |

## Execução

- [x] Catálogo compartilhado das cinco perguntas, contrato fechado `{ pergunta_id, carga, recorte }`, recortes incompatíveis e campos extras recusados antes do provedor; período único admite lente nula.
- [x] Distribuição GMT com todos os empates; cruzamento dos critérios aplicáveis, incluindo projeção municipal e união das classes de sobreposição. Nenhum método de lente ou comparação foi alterado.
- [x] Orquestração por pergunta, ferramentas restritas por papel/ID, referências de tópicos/limitações/sugestões, limites gerais fechados; falta de análise obrigatória ou dados insuficientes impede síntese. Preservados acesso, limites, falhas e cancelamento.
- [x] Painel com cinco perguntas visíveis, motivos de incompatibilidade, resposta abaixo, sem texto livre nem ação de comparação municipal. Retorno, etapas reais e evidências mantidos. Comparação incompleta não escolhe período implicitamente.
- [x] Testes locais, inspeção visual e documentação (`DESIGN.md`, runbook seção 10, emenda ADR-011); roteiro da prova real adaptado a dois casos.
- [x] Nível gratuito e condições/cota confirmados pelo responsável em 2026-11-21; duas execuções reais autorizadas, mantendo os limites do plano e uso mínimo, sem teste de carga.
- [x] Executar amostras Gemini mínimas e os retestes excepcionalmente autorizados, com métricas e resultado registrados, sem teste de carga.
- [x] Obter avaliação humana de utilidade da amostra mais recente frente às evidências/tela; aceita pelo responsável em 2026-11-21 ("Sim, aceito").
- [x] Após o aceite e gates finais, revisar staging, commitar e publicar a PR atômica; merge continua exigindo aprovação própria.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Agentes | `npm run test:agentes`: 44/44 passaram após as correções de schema e da análise de padrões, incluindo métodos determinísticos reais sobre casos fictícios e bloqueio de síntese com evidência insuficiente. |
| Interface | `npm run test:interface`: 223/223 passaram; os dois typechecks passaram. `npm run build` passou, com aviso de chunk acima de 500 kB (sem mudança de dependências). |
| API | `node --test --test-concurrency=1 scripts/api/explicar.test.mjs`: 16/16 passaram na revisão final, com Supabase local. `npm run test:api` também foi executado antes da ampliação dos casos. |
| E2E | Suíte completa executada: 135/137 passaram; dois testes municipais ainda referenciavam `pergunta-contexto`, removido com o formulário. Seletores corrigidos para `perguntas-contexto-aplicado`. Reteste de `03-acessibilidade`, `13-perguntas` e `15-municipios`: 25/25 passaram, inclusive os dois corrigidos. |
| Visual | Capturas fictícias em `test-results/` inspecionadas: desktop claro e celular escuro; testes de fontes, contraste, alvos, reflow/200% e teclado nos dois temas passaram. Não comprova leitor de tela real nem dispositivo físico. |
| Pacote | Build standalone pela CLI 65.16.0 em `node:24`, somente arquivos versionáveis e configuração fictícia, sem conta/credenciais; rebuild reutilizou as dependências instaladas pelo mesmo lockfile. `node scripts/agentes/conferir-pacote.mjs local/pacote-011/.vercel/output`: runtime `nodejs24.x`, 113 arquivos, SHA-256 `e180812421158c4c923ff2fa8f8374ae7d15955fe0a26104342964d376c5ab1f`; desligada 503 sem rede; ligada 403/200, seis chamadas simuladas, store=false e evidências iguais ao fonte (55 em A, 43 em B, três permanências). |
| Governança | `node --test scripts/validate-governance.test.mjs`: 55/55 passaram; validador final após atualização desta task: 0 erros, 0 avisos e 9 itens manuais; revisão de escopo/privacidade e evidências feita, sem atestar os itens humanos pendentes. |
| `git diff --check` | Passou na conferência final; sem erros de whitespace. |
| Base e estado remoto | `main` remoto em `8b5f68465a2c18fdb6afe912f08bbb66abe4e347`; PR documental #106 integrada; issue #107 aberta e nenhuma PR da branch `feature/issue-107`. |
| Provedor real e produção | Primeira amostra interrompida: 3 HTTP 200 e 1 HTTP 400, 13.356 ms, 2.236 tokens de entrada e 70 de saída informados; uso das recusas não informado. Diagnóstico adicional autorizado: 1 HTTP 400 em 1.633 ms, categoria schema. Total 5 tentativas, 3 respostas válidas do provedor; segundo caso não iniciado. Sem teste de carga e sem produção. |

### Ambiente local e limites

Antes do reset exigido pelos comandos de teste, foram conferidos: API/DB em loopback, zero cargas fora da identidade da fixture comum e zero usuários fora do domínio fictício `@exemplo.test`. Não houve reset do destino hospedado nem leitura de materiais privados de trabalho. Os scripts de prova usam apenas fixture fictícia.

### Avaliação de utilidade pendente

`scripts/agentes/casos.mjs` mantém, para cada uma das cinco perguntas, evidências fictícias, saída da tela existente, interpretação esperada e contraponto inadequado. A comparação invertida com números corretos reprova no teste de referência; isso não garante a semântica de qualquer frase futura. A primeira prova real não chegou à análise/síntese, portanto não existe resposta interpretativa para avaliar. O aceite segue pendente; não inferir qualidade a partir das chamadas de delegação/ferramentas que passaram.

### Roteiro da ação externa necessária

1. Confirmar que o projeto Gemini continua no nível gratuito e possui cota para duas execuções fictícias de `gemini-3.1-flash-lite`: até 12 chamadas respondidas e até 24 tentativas totais, sem pagamento nem troca de modelo.
2. Confirmar credencial disponível somente no `.env` ignorado, sem enviá-la ao chat; autorizar explicitamente essas duas execuções. Os marcadores `RQ_PROVA_011_AUTORIZADA` e `RQ_PROVA_011_GRATUITO_CONFIRMADO` não são autorização por si sós.
3. Depois da manifestação, conferir ambiente local descartável e executar o roteiro adaptado `npm run prova:agentes`: panorama com ambos os subagentes e panorama sem detecções, com disponibilidade não avaliada. Sem repetição de caso; falha/cota torna a prova inconclusiva, sem troca ou pagamento implícito.
4. Registrar chamadas/tentativas, tokens informados, duração e avaliação humana de utilidade antes da PR. Verificação hospedada permanece separada.

### Diagnóstico adicional autorizado — 2026-11-21

Após a interrupção da primeira amostra (3 respostas HTTP 200 e uma recusa HTTP 400; segundo caso não iniciado), o responsável autorizou "1 chamada de diagnóstico". Alcance: uma única chamada com entrada fictícia mínima e o schema de análise vigente, sem histórico/ferramentas dos agentes, sem repetição e sem ampliar a amostra de aceite. Visa isolar schema de histórico; sucesso não substitui a prova ponta a ponta.

### Resultado da amostra e correção local — 2026-11-21

- Prova inicial em `local/011_prova_real_autorizada.json` (ignorado): principal delegou aos dois subagentes; padrões pediu distribuição e seleção, contexto pediu disponibilidade. A primeira chamada de saída estruturada foi recusada com HTTP 400 e virou 502 `provedor_indisponivel` no handler. Não houve resposta interpretativa; o roteiro encerrou sem iniciar o segundo caso nem repetir o primeiro.
- Diagnóstico isolado em `local/011_diagnostico_schema.json` (ignorado), sob autorização adicional de uma única tentativa: entrada fictícia mínima, sem histórico nem ferramentas, mesmo schema de análise; HTTP 400, mensagem classificada localmente como erro de schema. Corpo/mensagem brutos do provedor não foram persistidos nem repassados.
- A documentação oficial consultada em 2026-11-21 explica que limites de arrays aninhados multiplicam o número de estados da gramática e podem causar HTTP 400: [saídas estruturadas — simplificação de schemas](https://aistudio.google.com/docs/structured-output#simplifying-complex-schemas) e [schema da Interactions API](https://aistudio.google.com/api-reference/interactions-api#TextResponseFormat). A causa específica provável é a complexidade dos limites aninhados introduzidos nos tópicos; não houve captura da mensagem bruta para distinguir cada parâmetro.
- Correção local em `servidor/agentes.ts`: retirados `minItems`/`maxItems` da gramática da resposta enviada; descrições/instruções orientam os tetos. Validação no servidor continua rejeitando mais de 8 tópicos, 5 limites ou 12 referências, incluindo campos opcionais. Teste novo prova que esses limites continuam obrigatórios. Typecheck servidor e 39 testes de agentes passaram.
- Compatibilidade do schema simplificado **ainda não confirmada por chamada real**. O pacote anteriormente conferido e os E2E são anteriores a essa correção somente do schema/instruções; repetir apenas os gates pertinentes antes da publicação, depois de resolver o aceite. Nenhuma dependência, método analítico, modelo ou cota foi alterado.
- Consumidas somente as 4 tentativas da prova inicial e a única tentativa extra autorizada. Sem novas chamadas após isso. Repetir a amostra exige decisão explícita, pois o plano v4 limita a amostra e manda interromper o aceite em falha; não reinterpretar a confirmação do nível gratuito como autorização irrestrita de tentativas.

### Reteste mínimo autorizado — 2026-11-21

O responsável autorizou repetir apenas os dois casos mínimos com o schema corrigido, pedindo conferência e respeito ao limite por minuto. Exceção explícita à não repetição registrada anteriormente, limitada a este reteste; sem teste de carga, ampliação de casos, troca de modelo ou pagamento.

- Autoridade da cota do projeto: ADR-011, registro de 2026-11-16: 15 RPM, 250 mil TPM e 500 RPD, com condições confirmadas como inalteradas pelo responsável. A [documentação oficial de limites](https://aistudio.google.com/docs/rate-limits), consultada em 2026-11-21, confirma limites por projeto e remete os valores efetivos ao AI Studio; não foi feita nova leitura autenticada do painel da conta.
- Configuração deste reteste: 13.000 ms entre inícios de chamadas, incluindo subagentes em paralelo e repetição 503; 60.000 ms entre casos. Assim, esta execução envia no máximo cinco tentativas em qualquer minuto, abaixo dos 15 RPM registrados. 429 não é repetido. Tetos de tempo e tokens preservados.
- Até 11 chamadas adicionais respondidas esperadas (6 no panorama e 5 no insuficiente, sem síntese nesse caso), até 22 tentativas pela política 503 vigente; sem repetição de casos além destes dois. Registrar os inícios relativos de envio para conferir o intervalo realmente observado.

### Resultado do reteste mínimo — 2026-11-21

Relatório completo fictício em `local/011_prova_real_reteste.json`, ignorado pelo Git. Foram executados somente os dois casos autorizados, sem teste de carga e sem repetição de caso adicional.

| Item | Resultado observado |
| :-- | :-- |
| Chamadas/tentativas | 10 envios, todos HTTP 200; nenhuma repetição 503 e nenhum 429. |
| Ritmo | Menor intervalo entre inícios: 13.001 ms; no máximo 5 envios em qualquer janela de 60 s. Pausa entre o último envio do panorama e o primeiro do segundo caso: 62.632 ms. |
| Consumo informado | 9.491 tokens de entrada, 1.385 de saída e zero de raciocínio; uso informado em todas as dez respostas. Sem garantia de disponibilidade futura nem alteração de cota. |
| Panorama | 54.766 ms, 5 chamadas, ambos os subagentes delegados; contexto/qualidade concluiu com 3 afirmações conferidas. Padrões falhou: a única afirmação citou `periodos_maximos` na raiz, que não existe; também introduziu média/tendência não calculada e sugeriu imagens de satélite fora dos destinos aprovados. Afirmação descartada, sem síntese; estado `incompleta`, aceite não atingido. |
| Insuficiente | 53.994 ms, 5 chamadas, ambos os subagentes concluíram. Zero observado e disponibilidade estadual não avaliada produziram `incompleta` e nota de dados insuficientes, sem síntese inventada; caso passou. |
| Segurança | Todos os envios com store=false e sem JWT/chave no corpo; somente dados fictícios. Fixture removida após a prova; banco local vazio conferido. |

O schema corrigido foi aceito nas quatro chamadas estruturadas do reteste, portanto a recusa HTTP 400 anterior não se repetiu. Isso não basta para aceitar os insights: o panorama não gerou resposta útil. Não houve nova chamada real depois destes dois casos.

### Ajustes locais após o reteste — 2026-11-21

- Instruções de padrões agora indicam os caminhos exatos de máximos diários/mensais, distinguem total completo de amostra e proíbem médias/tendências não fornecidas. A delegação de pergunta fechada deixa de sugerir classificação parcial por uma causa que o usuário não perguntou.
- Destinos de sugestões aprovados explicitados nas instruções comuns; a conferência de sugestões passa também pelas análises dos subagentes, não só pela síntese. Recomendar imagem de satélite com referência numérica válida reprova antes de exibir análise ou sintetizar.
- Caso de referência novo rejeita média/tendência não calculada, mesmo com números e referências válidos; a observação limitada de total/máximo continua válida. Estes controles não garantem toda a semântica futura.
- Typecheck servidor e `npm run test:agentes`: 44/44 passaram. Compatibilidade/qualidade dessas últimas instruções ainda não foi retestada com Gemini; não repetir a bateria inteira nem o caso insuficiente já aprovado. A única pendência real de amostra é o panorama, seguida da avaliação humana de utilidade.

### Repetição única do panorama autorizada — 2026-11-21

O responsável autorizou a nova tentativa solicitada e pediu concluir, preservando uso mínimo e espaçamento. Escopo desta autorização: somente panorama com os ajustes locais, até 6 chamadas respondidas/12 tentativas pela política 503 já vigente, 13 s entre chamadas; nenhum outro caso, diagnóstico extra ou teste de carga. O caso insuficiente já validado não será repetido. Registrar e avaliar o resultado sem novas tentativas reais automáticas.

### Resultado da tentativa única final — 2026-11-21

A tentativa autorizada foi executada uma única vez, somente no panorama. Relatório fictício em `local/011_prova_panorama_final.json` (ignorado). Nenhuma chamada real adicional será iniciada automaticamente.

| Item | Resultado observado |
| :-- | :-- |
| Transporte e orquestração | HTTP 200, estado técnico `completa`, classificação `respondivel`; principal, dois subagentes e síntese efetivamente executados; seis chamadas, todas HTTP 200, sem repetição 503 e sem 429. |
| Ritmo | 13 s configurados; mínimo observado 13.007 ms entre inícios, máximo 5 envios em qualquer janela de 60 s. |
| Tempo e tokens | 68.150 ms; 6.903 tokens de entrada, 1.261 de saída e zero de raciocínio, informados em todas as chamadas. |
| Conferência | Padrões: uma afirmação aceita, uma descartada por sugestão com fundamento inadequado; contexto/qualidade: três aceitas. Síntese: duas afirmações aceitas pela validação determinística. store=false, nenhum JWT/chave no corpo. |
| Aceite de utilidade | **Não demonstrado de forma suficiente pela revisão do agente**: primeira afirmação repete o total; segunda compara disponibilidade municipal, mas usa “disponibilidade sem lacunas” onde a fonte diz “sem evidência de lacuna”. O limite genérico não prova a correção dessa formulação. Não registrar avaliação humana como realizada nem tratar o estado técnico completa como aceite. |

Síntese gerada (dados fictícios), preservada para revisão:

1. “O estado do Mato Grosso apresentou um total de 55 detecções entre 2026-10-01 e 2026-10-10.” Referência: total completo do recorte.
2. “O Município Gama (9900003) registrou 10 dias de disponibilidade sem lacunas, enquanto o Município Alfa (9900001) apresentou 2 dias de lacuna conhecida no mesmo período.” Referências: disponibilidade dos dois municípios. Limitação gerada sobre lacuna/incidência indeterminada e sugestão de consultar disponibilidade de Alfa e Beta, ambas referenciadas.

Confronto com o objetivo: a evidência de padrões traz máximo de 7 detecções em todos os dias de 05 a 10/10, mas a afirmação correspondente do subagente foi descartada por uma sugestão sem evidência de ressalva comprovada. A síntese ficou sem essa relação temporal. As contagens de disponibilidade são conferíveis; “sem lacunas” é mais forte que a fonte e deve ser corrigido antes do aceite. O resultado funcional avançou, mas o ganho interpretativo exigido pelo plano não pode ser declarado aceito.

Não houve nova rodada de ajuste/teste real após esta constatação; não é autorizado continuar consumindo chamadas. O caso insuficiente permanece validado no reteste anterior. A decisão pendente é a avaliação humana desse resultado e do caminho de qualidade; não há nova questão de cota ou credencial. Sem PR, publicação, merge ou produção.

### Diagnóstico causal e correções locais sobre a saída capturada — 2026-11-21

Pedido humano: entender os pontos de falha e tentar consertá-los. Continuação da implementação local já autorizada; nenhuma chamada real ao Gemini nesta etapa.

1. **Perda indevida de evidência útil (código):** o subagente produziu corretamente o máximo diário de 7 detecções de 05 a 10/10. O tópico também continha uma sugestão cuja referência não comprovava uma ressalva de disponibilidade. O filtro eliminava todo o tópico por causa desse campo opcional, retirando o fato temporal da entrada da síntese. Corrigido: uma sugestão inválida é omitida e anunciada por nota fixa; observação e limitação conferidas continuam. Uma limitação inválida continua invalidando o tópico, porque removê-la poderia mudar o sentido da afirmação.
2. **Certeza mais forte que a evidência (conferência):** a síntese trocou “sem evidência de lacuna” por “sem lacunas”. A conferência anterior validava referências/números, mas deixava essa formulação passar. O caso observado agora reprova, e a formulação exata da classe continua aceita. Instruções reforçam preservar a classe e não afirmar cobertura completa. É uma correção específica e verificável, não uma garantia geral de semântica.
3. **Estado completo com mera repetição (contrato de execução):** depois da retirada de um tópico, bastava sobrar um total isolado para a saída receber completa. Acrescentada condição mínima: a síntese precisa apresentar pelo menos um tópico com duas referências distintas ou uma limitação referenciada; se não houver essa base, afirmações finais ficam vazias e o resultado informa falta de interpretação cruzada. Essa condição é necessária, mas não substitui avaliação humana de utilidade. Instruções da síntese explicitam relacionar fatos temporais e disponibilidade pertinentes.

**Reprodução sem rede:** `tests/fixtures/agentes/panorama-011.json` guarda somente respostas e evidências da fixture fictícia da tentativa autorizada, sem credenciais ou dados de conta. O teste em `scripts/agentes/insights.test.mjs` reproduz os seis turnos capturados com provedor local: comprova que o máximo temporal sobrevive e chega à síntese, a sugestão inválida sai, “sem lacunas” é rejeitado e a sobra de um total não recebe completa. O teste não inventa uma nova resposta útil do Gemini nem consome API.

**Validação local:** typecheck servidor, 43 testes de agentes e 16 testes de API com provedor simulado passaram. `npx --no-install playwright test 13-perguntas.spec.mjs`: 8/8 passaram após o ajuste do simulador, incluindo resposta, evidências, falha de subagente, cancelamento e teclado. Nenhuma mudança nos métodos determinísticos, cota, número de chamadas ou regra de acesso. O ganho de uma próxima geração real ainda não está observado; a amostra anterior foi diagnosticada, não reclassificada como sucesso.

### Reteste após reprodução local autorizado — 2026-11-21

O responsável autorizou o reteste solicitado: uma execução de panorama com preservação da observação temporal, rejeição de certeza de cobertura e condição mínima de relação na síntese. Até 6 chamadas respondidas/12 tentativas com a política 503 vigente, 13 s entre chamadas, sem outros casos, diagnósticos extras ou teste de carga. Registro separado para não sobrescrever as provas anteriores.

### Resultado do reteste após reprodução local — 2026-11-21

Somente um panorama executado. Relatório fictício em `local/011_prova_panorama_corrigido.json` (ignorado), seis HTTP 200, ambos os subagentes e síntese concluídos, sem 429 ou repetição 503. Duração: 67.939 ms; 7.543 tokens de entrada, 1.553 de saída, zero raciocínio, uso informado em todas as chamadas. Intervalo mínimo entre inícios: 13.003 ms; máximo cinco envios em qualquer janela de 60 s. Sem outra chamada real após estes seis envios.

**Observação temporal preservada:** total de 55 detecções de 01 a 10/10, com máximo diário de 7 mantido em todos os dias de 05 a 10/10. As duas afirmações de padrões chegaram à síntese, sem perda por sugestão opcional. Contexto/qualidade produziu três afirmações conferidas, com as classes exatas.

**Falso positivo localizado e corrigido sem rede:** a síntese produziu uma comparação legítima de disponibilidade e a limitação “impedindo concluir a cobertura total”. O filtro lexical de certeza rejeitou essa limitação porque reconhecia “impede”, mas não “impedindo”. A captura foi preservada em `tests/fixtures/agentes/panorama-011-corrigido.json`, somente dados fictícios. Um teste reproduziu 1 tópico em vez de 2 antes do ajuste. Após reconhecer a construção negativa, os dois tópicos e a sugestão válida sobrevivem, estado completa, sem descarte; o teste antigo continua rejeitando a afirmação indevida “disponibilidade sem lacunas”. Não houve regeneração do modelo para obter esse resultado.

Trecho interpretativo da síntese capturada, agora validado localmente:

> Enquanto no Município Gama (9900003) houve 10 dias sem evidência de lacuna no período, os municípios Alfa (9900001) e Beta (9900002) apresentaram, respectivamente, 2 dias com lacuna conhecida e 3 dias com incidência indeterminada.

Limitação referenciada produzida pelo modelo:

> A disponibilidade dos dados de detecção nestes municípios é classificada com ressalvas de lacunas ou incidência indeterminada, impedindo concluir a cobertura total.

Sugestão: consultar disponibilidade nos municípios com a ressalva comprovada, com referências de Alfa e Beta. As contagens e classes correspondem às evidências da fixture. A comparação explicita diferenças de disponibilidade sem atribuir a distribuição temporal a essas lacunas. O texto não afirma incêndio, causa, autoria ou gravidade. A limitação geral de zero observável no primeiro tópico é genérica e tem relevância menor para um total positivo; a avaliação humana deve considerar a utilidade real da resposta, não apenas seu formato.

**Validação final pertinente:** typecheck servidor e 44 testes de agentes passaram, incluindo as duas reproduções sem rede; 16 testes de API com provedor simulado passaram. O último E2E do painel continua 8/8, sem mudança posterior de DOM. Build standalone atualizado e prova do pacote passaram: `nodejs24.x`, 113 arquivos, SHA-256 `42a9c5769da91449cb6a769301c0f82402b3630175ddd2dcb853bce9c9d47d4d`, 503 desligada sem rede, 403/200 com Auth/RLS locais e seis chamadas **simuladas**, evidências iguais ao fonte. Não confundir as chamadas simuladas do pacote com consumo Gemini. Nenhuma dependência ou método analítico alterado.

**Situação:** execução técnica e correções observadas conferidas; caso insuficiente já aprovado tecnicamente na amostra anterior. Falta o aceite humano da utilidade previsto no plano, sobre o texto concreto acima. Não há solicitação de novas execuções reais nesta etapa. Publicação da PR continua posterior a esse aceite; merge exige aprovação específica.

### Espaçamento padrão da prova e gates locais — 2026-11-21

Pedido humano: continuar os testes dos agentes respeitando o tempo entre requisições registrado nesta task e deixá-los prontos para o fechamento. Nenhuma chamada real ao Gemini nesta etapa.

- `scripts/agentes/prova-real.mjs` dependia de `RQ_GEMINI_INTERVALO_MS` informado à mão; sem ele, as chamadas sairiam sem espera. Agora o padrão é 13.000 ms entre inícios (principal, subagentes em paralelo e síntese), como no reteste e na tentativa final; valores abaixo de 13.000, acima de 20.000 ou não inteiros são recusados antes de tocar banco ou rede. Conferido sem rede: 0, 5000, 13000.5 e 25000 recusados. 60 s entre casos mantidos. Runbook seção 10 atualizado.
- Supabase local em loopback; antes do reset, zero cargas e zero usuários fora de `@exemplo.test`.
- Gates: `npm run typecheck` e `typecheck:servidor` passaram; `test:agentes` 44/44; `test:interface` 223/223; `test:governance` 55/55; `test:api` 16/16; E2E `13-perguntas`, `03-acessibilidade` e `15-municipios` 25/25; `git diff --check` passou.
- Sem mudança no servidor, no pacote ou no DOM; o pacote conferido anteriormente continua válido. Pendência inalterada: aceite humano da utilidade da amostra mais recente antes da PR.

### Aceite humano da utilidade — 2026-11-21

Perguntado se a resposta da amostra mais recente (observação temporal do máximo diário e contraste de disponibilidade entre Gama, Alfa e Beta) atende ao ganho de utilidade do plano v4, o responsável respondeu "Sim, aceito". Aceite restrito a essa amostra fictícia; não cobre verificação hospedada nem produção. Revisão G3 do diff e das fixtures `tests/fixtures/agentes/`: sem chaves, JWT, e-mails reais ou URLs; somente dados fictícios.

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

A revisão automática bloqueou o comando que substituiria a saída antiga de build. A conferência foi feita diretamente na pasta isolada, usando argumento opcional de caminho no verificador, sem remover a saída anterior. O build permaneceu local e sem credenciais.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Parado — ciclo 011 (completo)
Quem: Responsável
Conferir: A interpretação concreta da amostra mais recente, com observação temporal e contraste de disponibilidade, atende ao ganho de utilidade pretendido no plano v4? Avaliação humana pendente antes da PR; não se pede nova execução Gemini.
Diga: sua resposta à pergunta registrada
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + implementar_issue + 107/insights_agentes + 8b5f68465a2c18fdb6afe912f08bbb66abe4e347`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: reteste único autorizado após correções locais / seis HTTP 200 com padrões, contexto e síntese concluídos; falso positivo negativo corrigido/reproduzido sem rede; validações pertinentes passaram, aceite humano de utilidade pendente.
- `result`: `executed`
- `evidence`: relatório local ignorado 011_prova_panorama_corrigido.json, seis HTTP 200 com mínimo 13.003 ms; fixture fictícia de captura e teste antes/depois do falso positivo; 44 testes de agentes, 16 de API e pacote 42a9c5769da91449cb6a769301c0f82402b3630175ddd2dcb853bce9c9d47d4d conferidos; texto de avaliação acima.
- `blockers`: aceite humano da utilidade da amostra antes da PR, conforme plano v4. Não há pedido nem execução adicional do Gemini pendente nesta saída.

## Referência do bootstrap

Não se aplica: exceção exclusiva do ciclo 000.
