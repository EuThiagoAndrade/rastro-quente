# Plano de Implementação — Comparação de períodos e agentes de explicação

> **Ciclo:** `008`
> **Status:** `Em Execução`
> **Versão:** `v3`
> **Data de criação:** 2026-11-15
> **Última atualização:** 2026-11-16
> **Tipo:** `feature`
> **Prioridade:** `P2`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 008" em 2026-11-15
> **Autorização de rascunho:** "autorizo o rascunho do plano do ciclo 008" em 2026-11-15
> **Autorização de correção:** "corrija o plano do ciclo 008" em 2026-11-15
> **Autorização de correção da rodada 2:** "corrija o plano do ciclo 008" em 2026-11-15
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO COM RESSALVAS`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-15`
> **Autorização de aprovação:** "aprovo o plano do ciclo 008" em 2026-11-15, após o veredito da rodada 3
> **handoff_schema_version:** `2`

## Problema e contexto

Ideação: _project/ideations/008_comparacao_periodos_agentes.md.

## Objetivo

Comparar períodos e municípios de forma verificável e permitir perguntas em linguagem natural em um painel ligado ao mapa. Um agente principal Gemini delega trabalho a dois subagentes com chamadas próprias ao modelo, usa ferramentas determinísticas do projeto e sintetiza evidências. A execução real deve ser demonstrável para o trabalho acadêmico. A comparação funciona também sem IA.

## Origem no backlog

- **BL-009 — Explicação dos destaques das lentes no mapa.** Parcela: o restante do item depois do ciclo `007`, isto é, a **comparação direta de dois períodos** e a **proposta de agentes** (agente principal, subagentes, função no servidor e modelo de linguagem).
  - **Síntese (snapshot):** permitir que o usuário entenda, no mapa, o que levou uma célula a ser destacada e o que mudou entre dois períodos, com critérios, evidências e ressalvas. Para perguntas que cruzam evidências, um agente principal recebe a pergunta e o recorte da tela, delega a comparação do critério a um subagente e a verificação de disponibilidade a outro, e sintetiza os resultados. O painel mostra as etapas da execução real. Uma alternativa a avaliar é uma função na Vercel consultar o Supabase com as permissões do usuário e enviar um resumo autorizado à API Gemini, com a credencial no servidor.
  - **Parcela já atendida em outro destino:** "por que esta célula foi destacada", no ciclo `007` (plano v4, item 2, issue #61).
- **Referência:** `_project/backlog.md`, commit `e274e49`, já contido em `main` e em `origin/main`. **Não** é local nem pendente de publicação. A fila local (`chore/backlog`, em `cd1115f`) não altera o BL-009.
- **Destino em preparação.** O estado do item não muda agora. O retorno na fila (`ciclo 008 — AAAA-MM-DD — parcela`) só ocorre depois da integração comprovada em `main`, e sua publicação exige autorização separada.
- **Observação fora do escopo:** o retorno do ciclo `007` ao BL-007 e ao BL-009 ainda não foi registrado na fila (os dois seguem `Disponível`, sem encaminhamento). O mesmo vale para o BL-002 e o ciclo `006`. Esses retornos pedem um pedido próprio de `gerenciar_backlog` e não são tratados aqui.

## Contexto e baseline

- Correção v2 sobre a rodada 1 da v1 local, sem commit próprio. A rodada original permanece integralmente preservada. O snapshot de backlog acima é histórico, não consulta atual da fila: em 2026-11-15, chore/backlog está em 8d195e0d93b87690a56c3a3d5825351039d2b42c, sem alteração do BL-009 em relação à origem e274e49.

- Revisão local de origem: 47c91b3ddbc7d6cf364f3ee490462919dab95714, com a ideação; base de produto 52a8509, encerramento do ciclo 007. As alterações locais anteriores eram exclusivamente o registro da autorização e da parada na ideação, preservados como histórico.
- Consulta e lentes existentes: src/consulta.ts, src/lentes/ e src/apresentacao-resultado.ts. KB-004 rege disponibilidade e contagem principal; KB-005 rege lentes, combinação e sobreposição.
- As funções de cálculo são TypeScript puro. Reutilizá-las no servidor não exige copiar fórmulas; o carregador confere carga, janela, município, paginação, unicidade e total.
- Concentração exige estado inteiro; recorrência e persistência admitem recorte municipal. Combinação com concentração também exige estado inteiro. Não recalcular o corte da concentração sobre somente os dois municípios escolhidos.
- A Vercel serve atualmente dist, sem função de servidor. O tsconfig inclui somente src. A primeira rota de servidor exige empacotamento, checagem de tipos e teste HTTP próprios; o build Vite isolado não comprova seu funcionamento.
- ADR-005: consulta sob JWT do responsável e RLS; anon e outros autenticados não leem dados. A emenda da issue #24 revogou privilégios de service_role nas tabelas public.
- ADR-007/009: carga fixada, descarte por geração, sem persistir consultas no navegador. DESIGN.md rege componentes, temas e acessibilidade.
- Não existem issues nem PR deste ciclo nesta preparação. A consulta de PRs abertas por gh retornou lista vazia.

## Escopo

### Dentro do escopo

- Comparar dois períodos de igual número de dias GMT inclusivos, na mesma carga, recorte, lente, versões e parâmetros.
- Comparar dois municípios da mesma carga, no mesmo período e configuração, com contagens e evidências lado a lado.
- Explicar destaques, diferenças e disponibilidade com três perguntas prontas aceitas e texto livre; acrescentar a ação contextual de comparação municipal.
- Agente principal e dois subagentes Gemini: lentes/evidências e disponibilidade. Etapas visíveis correspondem a eventos reais.
- Nova função Node na Vercel, somente leitura de dados; Gemini exclusivamente pelo servidor.
- ADR de arquitetura, especificação de comparação, provas de G1/G2, testes de integração, roteiro de demonstração e verificação hospedada.
- Envio ao Gemini dos dados públicos pertinentes do Rastro Quente, inclusive detalhes de detecções, coordenadas, datas, municípios, áreas e evidências; autorização humana registrada abaixo.

### Fora do escopo

- Novas fontes, novas lentes, alterações nos limiares ou fórmulas existentes, taxas por área/população, causalidade, previsão, autoria ou propriedade.
- Escrita dos agentes no banco, SQL arbitrário, execução de código gerado, navegação externa ou ferramentas de busca do provedor.
- Histórico de conversas persistente, treinamento de modelo, framework genérico de agentes, migração do front-end para outro framework.
- Cobrança adicional sem decisão explícita. Assinatura pessoal não é evidência de cota programática disponível.

## Decisões e autoridades

### Decisões humanas de 2026-11-15

| ID | Decisão registrada |
| :-- | :-- |
| D1 | Usar Gemini. O responsável possui Google AI Pro e admite criar acesso pelo Google AI Studio. Não afirmou ter projeto/chave/cota da API já configurados. |
| D2 | Comparação determinística como primeira entrega, antes dos agentes. |
| D3 | Dois subagentes com chamadas próprias ao modelo, coordenados pelo principal; cálculo no código. |
| D4 | Perguntas prontas "Por que esta célula foi destacada?", "O que mudou entre estes períodos?" e "Há lacunas nos dados?", mais texto livre nesta versão. |
| D5 | Comparação entre municípios entra neste ciclo; a sugestão de adiá-la foi expressamente rejeitada. |
| D6 | Períodos de igual duração, mesma carga/lente/parâmetros; lacunas explícitas; período totalmente sem dados não interpretado como zero. |
| D7 | O responsável declarou públicos os dados territoriais do Rastro Quente e autorizou seu envio aos agentes Gemini sem restrição de conteúdo territorial. Substitui a proposta inicial de enviar apenas resumos sanitizados. |
| D8 | Na correção da rodada 1, o responsável aceitou calcular as lentes por município e mostrar concentração separadamente no contexto estadual, sem reabilitá-la na consulta municipal comum. |
| D9 | Na correção da rodada 1, aceitou "saiu dos destaques observados" com disponibilidade da célula sem detecções não avaliável, disponibilidade municipal separada e nenhuma conclusão de desaparecimento real; lacunas parciais mantêm essa distinção, lacuna conhecida em todo o período/recorte torna a comparação indisponível. |

D7 não concede acesso anônimo à aplicação, não autoriza enviar credenciais, tokens, dados de conta ou materiais locais privados, e não autoriza cobrança. Dados públicos detalhados não serão removidos por privacidade presumida. Paginação e limites abaixo existem para integridade, contexto, tempo e custo, com indicação explícita quando uma resposta não examinou todo o detalhe.

Os detalhes T1 a T9 abaixo concretizam D1–D9 e contêm propostas técnicas para revisão e aprovação; só as decisões identificadas acima já foram tomadas pelo responsável. Não se implementa interpretação analítica nova antes da aprovação do plano. ADRs aceitos e KBs vigentes continuam valendo.

### T1 — Identidade e comparação temporal

- Pedido identifica carga, versões do método, configuração completa (incluindo operador da combinação/classe de sobreposição), recorte e janelas A/B. Datas GMT inclusivas dentro da carga; igual duração validada no código. Não ajustar automaticamente datas para fazer caber nem normalizar por dia.
- Proposta explícita para ratificação com o plano (R1-8): admitir janelas sobrepostas ou coincidentes, identificando os dias compartilhados; os lados são aplicações independentes, nunca somados como períodos independentes. Janelas coincidentes produzem resultados idênticos e nenhuma entrada/saída. Em recorrência com 3 versus 4 meses tocados, ambas suficientes, exibir os meses e os parciais de cada lado e a ressalva "Mesma duração, mas quantidades diferentes de meses GMT tocados; a comparação não normaliza esse efeito".
- Executar os mesmos módulos de produção nos dois lados sobre leituras completas e conferidas. Sem resultados calculados pelo navegador aceitos como verdade no servidor.
- Identidade de comparação é a unidade: código IBGE na concentração; ID canônico da grade nas lentes por célula, combinação e sobreposição. A comparação não usa igualdade do id_destaque da persistência, que inclui a data inicial.
- Unidade só em B: entrou nos destaques observados; só em A: saiu dos destaques observados; em ambos: permaneceu nos destaques observados. T3 define quando não há conclusão comparativa. Listar as evidências e sequências originais separadamente por período; permaneceu não significa mesma ocorrência ou mesmos valores.
- Em persistência, duas sequências na mesma célula são dois destaques, mas uma unidade para comparação. Preservar as duas sequências no detalhamento, sem somar ou unir dias entre períodos.
- Em recorrência, duração igual não garante igual número de meses tocados. Preservar a regra de três meses e os rótulos de meses parciais; janela insuficiente torna a comparação daquela configuração indisponível, nunca "saiu".
- Concentração é comparada entre resultados estaduais completos, preservando N=10 e empatados. A unidade destacada é município. Não projetar uma nova regra de célula fora da projeção já aprovada da combinação.
- Sobreposição compara a mesma classe e os vínculos da mesma carga, sem refazer geoprocessamento. Combinação mantém as mesmas lentes e operador; nenhum limiar ou versão existente muda. A comparação terá versão própria comparacao-008-v1.

### T2 — Comparação municipal

Dois códigos municipais escolhidos explicitamente na tela, válidos na carga, mesma janela. Comparar A/B lado a lado: total principal, dias com detecção, células com detecção, resultados da lente e disponibilidade, reutilizando as definições existentes. Não criar índice, taxa, causa ou ranking novo. Mostrar a ressalva de contagens absolutas e o efeito das divisas.

Definições verificadas em src/municipios.ts, função numerosMunicipio (linhas 26–43 na revisão de origem): total principal é principal.total do resumo municipal; dias com detecção é a quantidade de dias GMT da serie_diaria com total > 0; células com detecção é a cardinalidade dos IDs distintos da grade T1 de 0,05° nos registros principais desse município dentro da janela GMT inclusiva. Não contar sequências como células nem usar o envelope de sensibilidade. Leitura incompleta produz estado pendente/falha, nunca zero. A v2 explicita a definição existente, sem criar métricas novas (R1-7).

Conforme D8, os cálculos são estes, sem leitura estadual adicional implícita para as lentes municipais:

| Configuração | Cálculo executado | Apresentação |
| :-- | :-- | :-- |
| Recorrência | Um cálculo só com registros de A e outro só com registros de B | Dois resultados municipais, meses e evidências próprios |
| Persistência | Um cálculo em A e outro em B | Sequências por município; não executar uma terceira lente estadual |
| Sobreposição | Um cálculo em A e outro em B, mesma classe/carga | Vínculos e evidências próprios de cada município |
| Combinação sem concentração | Uma combinação em A e outra em B | Mesmas lentes/operador; duas seleções municipais |
| Concentração | Uma aplicação em todo Mato Grosso | Seção separada "Contexto estadual — municípios A e B": contagens e participação de cada um no top 10 com empatados |
| Combinação com concentração | Uma combinação em todo Mato Grosso | Somente seção de contexto estadual; mostrar células com evidências de A/B e seus critérios originais, sem atribuir seleção municipal |

Célula de divisa pode constar nos dois recortes com registros diferentes; não somar os resultados como células únicas. Na combinação estadual, filtrar o detalhamento por presença de evidências de A/B não recalcula nem muda a seleção estadual; declarar que outros municípios também podem sustentá-la. Se houver troca entre modos, limpar resultados que não correspondam ao contexto.

**Relação com A2/T4/T16 do plano 007:** a função de concentração continua recusando recorte municipal e o controle de lente da consulta comum continua desabilitado com município escolhido. O ciclo 008 acrescenta somente uma ação no modo de comparação, "Ver contexto estadual", que pede explicitamente cálculo estadual e o identifica em seção própria. Não habilitar a opção antiga nem remover concentração silenciosamente de uma combinação. Essa exceção de apresentação, autorizada em D8, entra no DESIGN.md; cálculos e validações existentes não são revertidos.

Nesta versão existem duas operações claras: comparar períodos no mesmo recorte e comparar municípios na mesma janela. A pergunta que misture municípios e períodos diferentes solicita escolher uma dessas operações; não produz comparação cruzada silenciosa.

### T3 — Zero, ausência e disponibilidade

- Zero detecções em consulta íntegra é contagem observada zero; não é evidência de ausência de fogo nem, sozinho, de ausência de dados.
- Não inventar uma classe "sem dados": preservar as classes D1. Falha de consulta, página faltante, versão retirada, período fora da carga e janela insuficiente têm causas próprias e impedem conclusão comparativa.
- Período totalmente sem dados confirmados pela fonte não gera diferença numérica nem entrada/saída. Se não for possível distinguir ausência de dados de zero, mostrar indeterminação e não inferir disponibilidade.
- Lacunas conhecidas e incidências indeterminadas qualificam os resultados calculáveis, sem apagar registros existentes nem alterar seleção. A expressão "sem evidência de lacuna" mantém "cobertura não comprovada".
- A disponibilidade da célula com detecções usa somente os municípios de suas detecções naquele lado, conforme KB-005. No lado sem detecções, mostrar "disponibilidade da célula não avaliável". Não transportar municípios do outro período nem usar os 142 municípios para produzir um qualificador da célula (D9).
- Em separado, o detalhamento do recorte municipal mostra dias/classes/motivos desse município. No recorte estadual, a lista completa dos municípios é carregada somente ao abrir "Disponibilidade de todos os municípios", com progresso e estado próprios. Não carregar automaticamente os 142 municípios em cada lado para liberar os destaques. A lista inclui municípios sem detecções, preserva dias/classes/motivos individuais e não agrega os 142 em um "N de M" da célula. Só fica completa após conferir todos os municípios e dias dos dois lados; paginação visual não reduz esse conjunto. Falha ou cancelamento mantém estado incompleto, nunca disponibilidade conferida.
- O resultado inicial separa seleção observada de qualificação: calcula as lentes sobre os registros completos; consulta disponibilidade somente para os municípios exigidos pelos destaques, com prioridade para o detalhe selecionado. Os demais qualificadores podem permanecer pendentes, como permite KB-005, sem texto ou número que sugira conferência. Seleção e contagens não esperam a lista estadual; a conclusão especial para recorte totalmente vazio segue a exceção abaixo.
- Exceção obrigatória CP-13: se o total principal de um lado estadual for zero, iniciar automaticamente a verificação dos 142 municípios desse lado, mesmo sem abrir o detalhamento. Enquanto pendente, exibir os fatos de cada lado, mas suspender a conclusão comparativa de entrada/saída/diferença afetada. Se ambos forem zero, conferir ambos. Somente leitura integral sem falhas permite declarar lacuna conhecida total; se for mista, preservar a comparação observada com suas ressalvas. Timeout/cancelamento/falha deixam a conclusão pendente ou indisponível por falha de conferência, distinguindo-a de indisponibilidade comprovada por lacuna total. Nenhuma regra D9 é dispensada por prazo.
- Exemplo aceito: célula destacada em A com registros de Colniza, zero em B, 4 de 10 dias indeterminados em Colniza. Exibir "saiu dos destaques observados", disponibilidade da célula em B não avaliável e, na seção municipal separada, 6 de 10 dias sem evidência de lacuna, 4 indeterminados, cobertura não comprovada. Não afirmar redução real do fenômeno.
- Com 9 de 10 dias de lacuna conhecida e zero detecções na célula, manter a classificação de mudança dos destaques observados e a limitação, sem inferência física. Com zero registros em todo o recorte e lacuna conhecida em todos os dias de todos os municípios desse recorte, a conclusão comparativa é indisponível. Em município, isso é 10/10 dias dele; no estado, 10/10 em cada município da carga. Caso municipal extremo dentro de estado misto é apresentado individualmente como indisponível, sem invalidar por si só o estado inteiro ou atribuir cobertura à célula.
- Essas regras são simétricas para entrada e saída e não alteram a seleção de nenhuma lente. Zero com incidência indeterminada não equivale a lacuna conhecida total; preservar as classes e não concluir ausência real. Indisponibilidade bloqueia diferença conclusiva/entrada/saída da comparação afetada, mas mantém os fatos observados separados.

### T4 — Servidor, ferramentas e acesso

Uma entrada proposta api/explicar.ts recebe POST autenticado; módulos internos ficam fora de api/. Sem endpoint público de cálculo privilegiado. Front-end chama somente a própria origem; a CSP de connect-src não precisa incluir Google.

Fluxo: conferir habilitação → validar formato/limites → validar JWT com Supabase Auth → provar autorização vigente pelas consultas sob RLS → fixar carga/recortes → executar ferramentas → chamar Gemini. Habilitação ausente, inválida ou desligada retorna 503 com código ia_desabilitada e no-store antes de ler corpo, validar sessão ou chamar Supabase/Gemini; aplica-se a qualquer método/identidade. A matriz abaixo vale somente quando habilitada. O cliente Supabase é criado por requisição com chave pública e JWT do usuário, sem service_role, senha de banco ou compartilhamento de sessão entre pedidos.

Catálogo fechado de ferramentas: explicar seleção; comparar períodos; comparar municípios; consultar disponibilidade; ler detalhes paginados das evidências autorizadas. Argumentos só referenciam o pedido validado. O modelo não pode trocar carga, datas, municípios, classe, lente, URL, papel ou credencial. Uma expansão sugerida vira pedido de mudança na tela. Nenhuma ferramenta executa texto como código/SQL.

| Identidade/situação | API de explicação | Supabase | Gemini |
| :-- | :-- | :-- | :-- |
| Sem JWT, JWT inválido/expirado/adulterado | 401, sem dados | Só validação necessária | Nenhuma chamada |
| Autenticado fora da lista de responsáveis | 403, sem dados | RLS nega | Nenhuma chamada |
| Responsável com carga vigente e pedido válido | Permitida | Somente leituras autorizadas | Evidências do pedido |
| Responsável revogado durante execução | Interromper; descartar resposta | RLS nega na próxima checagem | Nenhuma chamada posterior à detecção da revogação |
| Carga trocada/retirada durante execução | Conflito de versão; descartar resposta | Não misturar cargas | Não sintetizar versões misturadas |
| Papel administrativo ou executor | Não aceito como sessão de usuário | Sem bypass | Nenhuma chamada |

Revalidar acesso/carga antes de cada envio de evidências ao provedor e antes do resultado final. Revogação não retira conteúdo já enviado legitimamente; registrar essa limitação. Não transmitir evidências por eventos intermediários sem a checagem. Respostas e eventos usam no-store; JWT nunca em URL. Validar origem quando presente e não liberar CORS amplo; origem não substitui autenticação.

**Prova de empacotamento no item 2 (R1-3).** Adotar Vercel CLI 65.16.0 como dependência apenas de desenvolvimento, com versão exata e lockfile; versão consultada no registro npm em 2026-11-15. Não instalada nesta correção. Preparar configuração local vinculada ao projeto existente por ação externa do responsável; executar npx --no-install vercel pull --environment=preview antes do build, sem criar projeto, publicar ou baixar variáveis de produção. O ambiente preview usado nessa prova terá somente configuração fictícia/local e IA desligada; .vercel permanece ignorado.

Esta prova de pacote é gate **local**, com resultado e hash registrados na task antes da PR, como os scripts conferir:*. Vínculo, pull e build não rodam na CI e nenhuma credencial Vercel é adicionada ao GitHub. A CI recebe apenas os novos typecheck:servidor, test:api e test:agentes com Supabase local/dados fictícios/provedor simulado, além dos checks existentes; não executa conferir-pacote nem prova Gemini real.

Comandos de aceite planejados: npm run typecheck:servidor; npx --no-install vercel build --standalone; node scripts/agentes/conferir-pacote.mjs. Os dois scripts novos serão entregues no item 2. O último localiza em .vercel/output a função de /api/explicar pela configuração gerada, confere runtime Node 24, resolve o handler indicado em .vc-config.json e copia somente o pacote standalone para diretório temporário isolado. Em subprocesso Node 24, importa o entrypoint e o invoca por um servidor HTTP local com requisição/resposta reais; não permite resolver módulos a partir de src/ ou node_modules do checkout. Confere 503 quando desligada sem saída de rede e, habilitada apenas no teste, exercita as importações das lentes/comparador com fixtures e Supabase local, provedor simulado. Registrar caminho do handler, versão da CLI, hash do pacote e resultados, sem variáveis reais. Importação .ts/ESM não resolvida ou divergência com o cálculo unitário reprova o item; não basta listar arquivos do pacote ou rodar o código-fonte.

O adapter de execução do pacote deve seguir o formato realmente emitido pela CLI fixada e falhar se não o reconhecer; o teste não substitui o handler por mock. Se a CLI não gerar pacote executável para esses imports, corrigir o empacotamento dentro do item 2 ou apresentar a dependência técnica necessária antes de incorporá-la. Não afirmar compatibilidade ainda não testada.

git.deploymentEnabled permanece somente main. O merge do item 2 implanta a função desligada, não autoriza sondagem em produção. A primeira requisição hospedada, inclusive o teste de 503, ocorre somente no item 5 após "autorizo a verificação em produção do ciclo 008"; conferir primeiro desligada, depois habilitar pela ação externa delimitada e verificar o fluxo completo. Build/deploy automático não é prova funcional hospedada.

### T5 — Agentes reais, evidências e texto

- Principal: primeira chamada classifica a pergunta como respondível, parcial ou fora do alcance e propõe delegação via function calling. A aplicação valida a seleção de ferramentas.
- Subagente de lentes: chamada própria, instruções próprias e ferramentas só de lentes/comparação/detalhes. Subagente de disponibilidade: chamada própria e ferramenta só de disponibilidade. Cada um pode pedir a ferramenta, receber seu resultado e produzir saída estruturada.
- O principal recebe as saídas dos subagentes e produz síntese com referências a evidências. Pergunta sobre disponibilidade pode acionar somente esse subagente; comparação deve conter as duas análises. Se a delegação necessária não acontecer, resultado incompleto explícito; não inventar execução.
- Máximo de 6 chamadas Gemini por execução: principal inicial (1), dois subagentes até 2 cada (4), principal final (1). Até uma rodada de ferramenta por subagente; sem recursão ou delegação entre subagentes. Ferramentas independentes podem executar em paralelo no produto.
- Números, datas, códigos e comparações exibidos como fatos vêm de campos das ferramentas. A saída estruturada referencia IDs e trechos de evidência; referências inexistentes, números divergentes ou alteração de classe são rejeitados. Texto gerado continua falível: ressalva fixa, indicação "Gerado por IA" e acesso às evidências são obrigatórios.
- Não renderizar HTML ou links livres do modelo. Recusas e ressalvas obrigatórias têm texto do código. Alegações de autoria, infração, propriedade, previsão ou causa não são respostas admitidas. Perguntas parcialmente respondíveis recebem descrição factual e limite explícito.
- Texto livre limitado a 2.000 caracteres; orientações de não inserir segredos/dados pessoais. Conteúdo e resultados de ferramentas são entrada não confiável, não instruções de sistema. Testar injeção de prompt e tentativas de obter credenciais.
- O provedor pode receber registros públicos detalhados pertinentes à pergunta. Ferramentas paginam o detalhe (até 100 registros por resposta); totais continuam calculados no conjunto completo. O principal recebe resumo e referências e pode delegar consulta do detalhe. Se os limites impedirem responder, declarar parcial/incompleto e manter evidência completa acessível na aplicação, sem apresentar amostra como total.

### T6 — Gemini, custo, execução e logs

Proposta de modelo inicial: gemini-3.8-flash, endpoint estável listado na documentação consultada, com function calling e camada gratuita documentados. Usar o mesmo modelo nos três papéis inicialmente; não usar alias latest nem trocar para modelo pago automaticamente. Validar disponibilidade e cotas efetivas no projeto antes da ativação.

Contrato de transporte proposto e fixado para a ADR do item 2 (R1-11): POST https://generativelanguage.googleapis.com/v1beta/interactions, versão v1beta, modelo gemini-3.8-flash (listado entre os modelos suportados pela Interactions API em 2026-11-15). Usar store=false, sem background e sem previous_interaction_id; reenviar apenas o histórico necessário da execução atual em memória, incluindo chamadas/resultados de ferramentas e os metadados de continuidade exigidos pela API. Essa opção não elimina o tratamento de conteúdo previsto nos termos. A documentação consultada em 2026-11-15 declara disponibilidade geral da Interactions API desde junho de 2026; o segmento v1beta da URL não é classificação de maturidade. Mudanças incompatíveis param a integração. A combinação de function calling, saída estruturada e store=false será comprovada no teste real do item 3 e seu resultado registrado na ADR, sem inferir compatibilidade apenas da documentação. A prova real do item 3 deve verificar esse endpoint, function calling, saída estruturada e limites de geração com o modelo escolhido antes de integrar a orquestração.

A documentação de 2026-11-15 distingue benefícios interativos do Google AI Pro e tier do projeto da API. A assinatura pode ajudar no AI Studio, mas não se presume que financie as chamadas da aplicação. Modelo/cota concretos da conta ainda não foram observados. Não ativar Cloud Billing nem consumir créditos pagos automaticamente.

Condições dos serviços gratuitos permitem uso de entradas/saídas para melhoria e revisão humana; D7 autoriza enviar os dados territoriais públicos nesse contexto. Não alegar sigilo do provedor ou retenção zero. A aplicação não envia tokens, chaves nem dados de conta.

- REST pelo fetch nativo e supabase-js já adotado; sem framework de agentes ou SDK adicional de execução inicialmente.
- Variáveis apenas do servidor: chave Gemini, modelo fixado, habilitação explícita, configuração pública do Supabase. Chave Gemini nunca com prefixo VITE, em fixtures, logs, prompt ou resposta.
- Limites propostos: corpo 16 KiB, 6 chamadas de geração por execução, corpo completo UTF-8 enviado ao Gemini até 64 KiB por chamada (inclui instruções, ferramentas, histórico e evidências), saída configurada até 1.500 tokens. Removida a garantia de 12.000 tokens antes do envio: não haverá count_tokens remoto nesta versão. O controle prévio é de bytes medidos localmente, não estimativa apresentada como contagem exata. Tokens reais de entrada, saída e raciocínio são os metadados usage recebidos; o teste real confere o alcance de max_output_tokens no modelo. Ausência desses metadados impede declarar consumo verificado. Nenhuma chamada extra de contagem fica fora do limite de 6 (R1-6).
- Orçamento de servidor proposto (R1-5): 270 s totais, compostos por até 120 s cumulativos de leitura/cálculo de evidências, até 120 s cumulativos de geração (6 × 20 s, mesmo sem paralelismo) e 30 s para autenticação/revalidações, serialização e finalização. Cada operação respeita também o tempo global restante; leituras feitas pelas ferramentas entram nos mesmos 120 s, sem reiniciar orçamento por subagente. Configurar maxDuration=300 na função apenas após conferir suporte gratuito no ambiente; o encerramento controlado fica 30 s antes do limite. Se o destino tiver limite menor, interromper para adequação, sem elevar plano de cobrança.
- Comparação sem IA (R2-1): alvo 20 s; teto proposto de 120 s para registros completos dos dois lados, cálculo e apresentação inicial dos destaques, com disponibilidade explicitamente pendente quando ainda não conferida. A lista estadual sob demanda e a verificação obrigatória de recorte zero têm orçamento separado de 360 s, contado desde seu início, para até 284 consultas municipais com concorrência global 4 (não 4 por lado). O navegador usa as RPCs existentes sob JWT, sem função Vercel longa para essa leitura. Reutilizar apenas respostas completas da mesma sessão/carga/janela/município com revalidação de acesso; não contar com cache no aceite frio. O pior caminho sem IA tem até 480 s (120 + 360), com conclusão suspensa no caso zero até finalizar a conferência. A estimativa 42,3/51 × 284 = 235,6 s justifica reservar 360 s, mas não é medição nem garantia. Não estender esse desvio às telas existentes; a aprovação do plano ratifica esses tetos propostos.
- Sem repetição automática para 429, erro ou resposta inválida. A interface permite nova tentativa explícita e informa que consome nova cota.
- Alcance do orçamento IA: a requisição contextual lê no servidor os registros completos necessários à lente, mas qualifica somente os municípios exigidos pela pergunta/seleção, sem buscar a lista estadual por padrão. A resposta identifica esse alcance; nunca declara disponibilidade estadual completa por examinar uma seleção. Pergunta que exija todos os municípios ou prova de zero estadual exige essa leitura integral no servidor, dentro dos mesmos 120 s de leitura: não confiar em resultados do navegador para evitá-la. Se ela exceder o prazo, não gerar síntese conclusiva; responder com limite de tempo e manter a comparação/detalhamento determinístico completo acessível pelo fluxo de 360 s. Isso é uma limitação explícita da IA síncrona, não retirada de acesso aos dados públicos nem prova de ausência. Não se promete que o caso estimado de 235,6 s caiba em uma chamada IA. O aceite de IA completa de 270 s é medido nas perguntas contextuais da demonstração; testar também essa falha controlada, sem contá-la como resposta completa. Suportar síntese IA de todo o estado acima desse prazo exigirá nova decisão arquitetural, não aumento oculto do runtime.
- Uma execução ativa por aba, cancelamento ao trocar seleção/período/sessão. Isso é conveniência de interface, não limite global de segurança. Cotas RPM/TPM/RPD globais são as do projeto Gemini; não fingir que contador em memória da função limita múltiplas instâncias. Não criar banco de conversas/contadores neste ciclo.
- Antes do teste real local do item 3, registrar RPM/TPM/RPD efetivos do projeto e confrontá-los com uma execução de até 6 chamadas e com o roteiro de demonstração. Reconfirmar antes da ativação hospedada no item 5. Se a cota não comportar o roteiro, parar para decisão; não habilitar pagamento nem reduzir a exigência de subagentes silenciosamente.
- Logs próprios: só código de etapa/erro, duração e uso agregado de tokens, sem pergunta/resposta, payload de dados, JWT, ID de usuário ou stack com corpo de rede. Não persistir histórico. Conferir redaction e retenção dos logs de plataforma na ativação; não prometer controlar os logs internos de Google/Vercel.
- Falha da IA mantém comparação determinística e oferece estado claro. Chave ausente ou habilitação desligada não bloqueia consulta/lentes.
- Antes de implantação, verificar limites reais da função Vercel e adaptar o orçamento técnico para caber no plano gratuito; se não couber, situação Parado, sem migração de infraestrutura implícita.

### T7 — Interface e eventos

Controles da comparação ficam nos filtros: modo temporal ou municipal, período B ou município B. A refere-se ao recorte aplicado; B é rotulado como comparação, sem alterar silenciosamente mapa/série de A. O resultado compara A/B lado a lado e permite alternar o lado representado no mapa com rótulo inequívoco. A exceção ao princípio de recorte único será explicitada em DESIGN.md no item 1.

O painel de perguntas integra a coluna de resultado e acompanha a seleção. Perguntas prontas só aparecem habilitadas com contexto suficiente. "Comparar municípios" abre o seletor do segundo município. O texto livre não modifica os filtros automaticamente; pergunta ambígua pede esclarecimento.

Eventos por etapa sobre a própria resposta HTTP (stream de eventos consumido por fetch com Authorization): acesso validado, agente principal iniciado, subagente iniciado, ferramenta concluída, subagente concluído, síntese, concluído/erro. Emitir somente o que ocorreu. Não exibir raciocínio interno do modelo nem animação simulando trabalho. Validar mensagens no cliente; cancelamento aborta operações pendentes e impede iniciar novas chamadas.

Gerações da sessão e do pedido descartam eventos/respostas obsoletos. Logout, expiração, revogação e mudança de carga limpam resultado e memória. Layout respeita temas, contraste, 320 px/200%, teclado, foco e aria-live; não acrescentar chat global nem janela que oculte o mapa.

Disponibilidade tem ciclo visível próprio: não solicitada, carregando (N de M municípios conferidos), completa, falha ou cancelada. Mostrar o conjunto solicitado e impedir rótulos agregados antes de completar. Troca de recorte/sessão/carga aborta também essa leitura. Para recorte estadual com total zero, iniciar automaticamente a conferência e anunciar "Conclusão aguardando disponibilidade"; não mostrar "saiu" e depois retirá-lo. Esses estados são entregues no item 1 e reutilizados no painel do item 4.

### T8 — Casos de referência independentes

Fixtures fictícias, valores esperados escritos manualmente antes do comparador. Não gerar o esperado usando a função sob teste. Reutilizar fixtures das lentes para regras já aceitas e conferir os novos casos em ambiente local, inclusive independência navegador/servidor.

| Caso | Entrada/controle | Resultado esperado |
| :-- | :-- | :-- |
| CP-1 | Persistência em duas janelas de 10 dias; A destaca c1/c2, B destaca c2/c3 | c1 saiu, c2 permaneceu, c3 entrou; evidências de cada período separadas |
| CP-2 | Duas sequências de 3 dias em c1 em A; uma de 4 dias em B | Uma célula permaneceu; 2 sequências de A e 1 de B preservadas; não comparar datas iniciais como identidade da célula |
| CP-3 | Janelas com 10/11 dias, cargas diferentes, parâmetros ou recortes divergentes | Pedido recusado, sem resultado comparativo |
| CP-4 | Zero íntegro com disponibilidade sem evidência de lacuna versus zero com lacuna em todos os dias do município | Primeiro preserva zero observado e ressalva; segundo não conclui entrada/saída e informa indisponibilidade |
| CP-5 | Página duplicada/faltante, total divergente, carga retirada | Nada parcial; erro de integridade/versão distinto de zero |
| CP-6 | Recorrência: A toca 3 meses e B só 2, com igual número de dias | Comparação indisponível por janela insuficiente de B, sem classificar saída |
| CP-7 | Persistência com lacuna entre dias e com sequência na borda | Resultado original preservado; ressalvas de disponibilidade e borda continuam visíveis |
| CP-8 | Concentração com empate no décimo e alteração do corte entre períodos | Empatados incluídos em cada lado; classificação pela identidade do município, com corte e contagem próprios |
| CP-9 | Combinação e sobreposição, configuração igual e depois divergente | Igualdade campo a campo com aplicação isolada; divergência de configuração recusada |
| CP-10 | Mesma célula destacada em A (Colniza); B zero, 4/10 dias indeterminados no município | Saiu dos destaques observados; célula em B não avaliável; seção municipal separada com 6/10 sem evidência de lacuna, 4 indeterminados; nada de desaparecimento real |
| CP-11 | Como CP-10, com 9/10 dias de lacuna conhecida em B; depois 10/10 e zero em todo o recorte municipal | 9/10: classificação observada com limite; 10/10: comparação municipal indisponível, zero observado preservado em separado |
| CP-12 | B estadual sem detecções em c1; 142 municípios com disponibilidade mista, incluindo Colniza com 10/10 dias de lacuna | Célula não avaliável; disponibilidade por município, sem agregação; Colniza indisponível individualmente não torna todo o estado indisponível |
| CP-13 | B com zero registros no estado inteiro e 10/10 dias com lacuna em cada um dos 142 municípios | Comparação estadual indisponível, sem classificação conclusiva de saída; repetir invertendo A/B para testar entrada |
| CP-14 | Janelas idênticas; depois janelas de 10 dias com 5 dias em comum | Idênticas: somente permaneceu e diferenças zero; sobrepostas: aplicações independentes, cinco dias comuns identificados, sem somar contagens como períodos disjuntos |
| CP-15 | Recorrência: 01/11/2025–29/01/2026 e 15/11/2025–12/02/2026 (90 dias cada), com detecção em cada mês tocado | A toca 3 meses, B toca 4; ambas suficientes; valores 3/4, meses parciais e ressalva do efeito de calendário, sem normalização |
| CP-16 | Dois lados estaduais com registros; detalhamento completo fechado e depois aberto | Resultado inicial não exige 284 leituras; qualificadores pendentes identificados. Abrir solicita a lista completa com concorrência global 4, progresso e conferência de todos os dias/municípios |
| CP-17 | Um lado estadual zero; ambos zero; cancelar/falhar no município 142 | Conferência automática de 142/284 respostas, sem conclusão comparativa antes do fim. Cancelamento/falha não prova lacuna total; não emitir classificação prematura |
| CP-18 | IA contextual versus pergunta de disponibilidade estadual completa que ultrapassa 120 s de leitura | Contextual confere apenas o escopo declarado; pergunta estadual lenta encerra sem síntese conclusiva e mantém acesso ao detalhamento sem IA. Nenhum resultado do navegador é confiado como evidência do servidor |
| CM-1 | Municípios fictícios A/B com 20/40 detecções, 4/5 dias com detecção e 3/6 células, mesma janela | Exibir esses números e diferença absoluta 20 em B−A, sem taxa, gravidade ou causa |
| CM-2 | Célula de divisa: registros em A nos dias GMT 1/2 e em B no dia 3, mesma janela | A: 2 dias com detecção, 1 célula com detecção, 0 sequências destacadas; B: 1 dia, 1 célula, 0 sequências. Não executar persistência estadual na comparação. Uma aplicação estadual independente na fixture teria sequência de 3 dias, mas não é resultado da operação municipal |
| CM-3 | Concentração com dois municípios escolhidos fora do top 10 estadual | Não destacar ambos por recomputar top 10 sobre o par |
| CM-4 | Disponibilidade distinta entre os dois municípios | Duas qualificações preservadas; nenhuma imputação ou comparação de causa |
| CM-5 | Mesmo município nos dois lados | Resultado idêntico e diferença zero; interface explica seleção repetida |
| CM-6 | Consulta municipal comum e depois ação "Ver contexto estadual" na comparação | Controle comum continua desabilitado; ação solicita estado inteiro e mostra seção distinta; nenhuma chamada de concentração com recorte municipal |

Para CP-4, especificar também zero com dias indeterminados: exibir a indeterminação sem inferir ausência real. Para CP-1/2, as coordenadas e datas concretas das fixtures devem produzir as unidades e sequências por cálculo manual auditável.

### T9 — Aceite acadêmico e ativação

Demonstração ao vivo com sessão autorizada e Gemini real, depois dos testes locais: pergunta de comparação aciona o principal e ambos os subagentes com chamadas distintas; pergunta de disponibilidade demonstra escolha de delegação; pergunta causal recebe resposta parcial; pergunta de autoria é recusada. A evidência registra modelo, versões, etapas, quantidade de chamadas, duração e conferência dos fatos, sem chaves ou dados de conta. Mocks servem à CI, não comprovam execução real.

Ação externa antecipada, vinculada à issue do item 3: criar/conferir projeto Gemini gratuito, modelo/cotas e chave disponibilizada só no ambiente local ignorado, sem enviar pela conversa; confirmar a conclusão da ação pelo fluxo canônico. Antes do merge do item 3, executar com Supabase local e fixtures fictícias ao menos uma comparação que acione os dois subagentes, uma pergunta só de disponibilidade, uma parcial e uma recusa. Conferir endpoint/modelo, argumentos e resultados de ferramentas, esquema da resposta e uso/tempo. Falha implica correção na mesma issue/PR do item 3 antes do merge, sem trocar provedor/modelo ou regra analítica por inferência (R1-4).

No item 5, reconferir cotas e configurar variáveis de servidor/runtime/logs na Vercel, inicialmente com IA desligada. A primeira sondagem hospedada, inclusive desligada, exige "autorizo a verificação em produção do ciclo 008". Depois de conferir 503 e ausência de chamadas externas, o responsável habilita dentro da ação externa registrada e prossegue-se com sessão autorizada/negada, cancelamento, cota/erro, comparações e segredo ausente do bundle. Problemas descobertos nessa etapa são corrigidos em PR adicional da mesma issue do item 5, com nova aprovação de merge; mudança de escopo volta ao plano. Sem demonstração hospedada real, não concluir o requisito acadêmico apenas pela prova local.

### Pontos de aprovação

Ao aprovar o plano após veredito apto, o responsável ratifica expressamente D8 e D9 e seus exemplos/casos de referência, além dos desvios de desempenho de T6. As duas decisões já foram aceitas nesta conversa em 2026-11-15; sua conferência é manual, não inferida do validador nem condicionada a reescrever a ideação histórica (R2-5).

No item 5 há **duas ações externas separadas** e duas manifestações "concluí a ação externa da issue #N", sempre com a mesma issue e a etapa identificada na task: (1) configuração com IA desligada; (2) habilitação, somente depois da autorização de produção e do teste hospedado de 503. Entre elas, aguardar a manifestação correspondente; a autorização de verificação não altera ambiente por si só. A task registra cada etapa e sua evidência para evitar confundir a primeira conclusão com a segunda (R2-4).

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — recebido | Ideação e decisões D1–D7 | Este documento local | Revisão, implementação ou publicação | Ideação e registro humano |
| Aprovar plano: "aprovo o plano do ciclo 008" | Revisão formal apta posterior a este rascunho | Escopo, T1–T9, PR documental e encerramento; issues após integração documental e apresentação/confirmação do payload | Implementação, merges ou cobrança | Parecer, regras G1, acesso, modelo e condições |
| Aprovar merge: "aprovo o merge da PR #N" | PR real, diff e checks verdes | Somente aquele merge, inclusive documental/encerramento | Outra PR ou alteração de escopo | GitHub e lote |
| Autorizar implementação: "autorizo a implementação da issue #N" | Plano aprovado/integrado e issue válida | Uma entrega planejada | Demais issues, custo adicional | Escopo e dependências da issue |
| Ação humana externa: "concluí a ação externa da issue #N" | Roteiro do item correspondente: 2 para configuração local Vercel, 3 para Gemini local, 5 para ambiente hospedado | Registro da configuração delimitada, conferida no que for acessível | Cobrança adicional, deploy de teste implícito ou verificação fictícia | Ambiente local/fictício, tier, cotas e habilitação |
| Verificar produção: "autorizo a verificação em produção do ciclo 008" | PR de preparação do item 5 integrada; função desligada e configuração conferida | Primeira sondagem hospedada da rota desligada, depois teste habilitado/demonstração após ação externa | Sondagem antecipada, mudança de dados, regras ou contratação | Roteiro T4/T9 e evidências |

Cada merge exige aprovação própria. Escopo novo, interpretação analítica diferente, falha de isolamento, impossibilidade de gratuidade, capacidade ausente ou evidência inconclusiva interrompem a execução em Parado com a decisão necessária. Não há modo contínuo.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | T1–T3/T8, valores esperados independentes, mesmas versões/parâmetros, sem cálculo pelo modelo |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Nova entrada de servidor; matriz T4 e testes reais locais de JWT/RLS/revogação; sem service_role |
| G3 — privacidade de dados | Sim | D7 autoriza dados públicos territoriais; credenciais/dados de conta excluídos, logs sem conteúdo, fixtures fictícias, bundle e tráfego conferidos |
| G4 — migrações só acrescentam | Não | Não há migração planejada. Se surgir necessidade, parar e revisar escopo; nunca editar migração existente |

## Estratégia de testes

- Documento atual: node --test scripts/validate-governance.test.mjs; node scripts/validate-governance.mjs; git diff --check; conferência manual das decisões, fontes e limites.
- Item 1: CP/CM em testes unitários, regressão de todas as lentes, comparação independente, npm run typecheck, npm run build, npm run test:interface e E2E de comparação.
- Item 2: teste HTTP do handler real com Supabase local e JWTs reais, cobrindo a matriz T4; stub Gemini deve registrar zero chamadas em todos os acessos negados. Incluir revogação durante execução, carga substituída, eco adulterado, corpo excessivo, origem indevida e ausência de segredo no bundle.
- Item 3: testes de orquestração com respostas controladas (delegação, budgets, ferramentas recusadas, 429, timeout, saída inválida, referência inventada, números divergentes, injeção e falta de ferramenta), seguidos da prova Gemini real local de T9 antes do merge. Testar exatamente 6 chamadas e zero chamadas extras de contagem, limite UTF-8 incluindo histórico, consumo do orçamento por revalidações e ferramentas. CI usa provedor simulado sem chave.
- Item 4: E2E com eventos reais do handler local e provedor simulado; troca rápida de seleção, logout, abort, resposta tardia, retomada manual, ausência de IA, teclado, mobile e ambos os temas.
- Gates de aplicação existentes: npm run test:rls e npm run test:e2e somente contra Supabase local (fazem reset), além de typecheck/build/test:interface. Nunca resetar banco hospedado. Acrescentar scripts test:agentes e test:api na implementação e integrá-los à CI pertinente; não são comandos existentes hoje.
- Checagem de tipos do servidor deve incluir api/ e módulos internos sem importar segredos no bundle Vite. Executar a prova de pacote isolado de T4 com CLI fixada, incluindo importações .ts/ESM e cálculos reais. Teste hospedado somente no ponto delimitado em T9.
- Conferência de desempenho conforme T6: três execuções frias de cada cenário (duas janelas estaduais com combinação, duas de sobreposição e dois municípios), com pelo menos 10.640 registros/142 municípios no perfil ADR-007. Registrar separadamente resultado inicial (até 120 s), qualificação solicitada/lista completa (até 360 s, até 480 s de ponta a ponta) e IA contextual completa (até 270 s por requisição). Adicionar cenários de um/dois lados estaduais totalmente vazios: CP-13 só passa após conferência integral. Timeout não satisfaz o aceite de nenhum cenário obrigatório; exige correção ou decisão sobre o teto, nunca omissão de municípios. Medir separadamente CPU/cálculo e rede; não somar a medição antiga de lente inteira como se excluísse disponibilidade.
- Item 5: testes reais T9 com Gemini e verificação hospedada; relatório distingue observado, simulado, não executado e limitação.

## Itens de implementação

### Item 1 — Comparação determinística de períodos e municípios

**Contexto:** D2 exige primeira entrega útil sem IA; D5 inclui municípios.

**Ação técnica:** Implementar módulo puro de comparação com versão própria e toda a interface determinística do primeiro parágrafo de T7: modo, seletores A/B, contexto estadual separado, resultados, alternância no mapa e detalhamento. Preservar motores existentes. Registrar contrato em KB e atualizar DESIGN.md. Casos CP/CM e conferência independente. Esta interface já funciona integralmente antes dos agentes.

**Critérios de aceite:**
- [ ] Comparação temporal e municipal completas, sem IA nem chave.
- [ ] T1–T3 e CP/CM aprovados e demonstrados; nenhuma fórmula existente alterada.
- [ ] Concentração estadual, recorrência insuficiente, persistência por unidade e divisas tratadas explicitamente.
- [ ] Interface acessível, zero/falha/lacuna separados, testes e regressão verdes.

### Item 2 — Função autenticada e ferramentas determinísticas no servidor

**Contexto:** Primeira função Node e nova superfície de acesso.

**Ação técnica:** Criar handler e adaptadores de leitura sob JWT, reutilizar comparação/lentes, implementar catálogo e validações T4, budgets/cancelamento e cliente REST Gemini desabilitado por padrão. Criar ADR de arquitetura proposta no plano, com matriz, fluxo de dados públicos e limites. Não habilitar serviço real ainda.

**Critérios de aceite:**
- [ ] Matriz T4 provada com Auth/RLS reais locais; negativas não chamam Gemini.
- [ ] Evidências são relidas/conferidas no servidor, sem confiar em números do cliente.
- [ ] Segredos ausentes do bundle/erros; função passa tipos, HTTP e prova do pacote standalone isolado de T4; desligada retorna 503 sem ler dados ou chamar serviços.
- [ ] Sem nova dependência de execução, migração ou bypass de RLS.

### Item 3 — Agente principal e dois subagentes Gemini

**Contexto:** D3 exige delegação real, não rótulos sobre funções determinísticas.

**Ação técnica:** Implementar T5/T6, ferramentas com schema fechado, prompts distintos, respostas estruturadas e eventos reais. Preparar avaliação fictícia em português para perguntas respondíveis/parciais/fora do alcance e variações de texto livre.

**Critérios de aceite:**
- [ ] Orquestração diferencia chamadas principal/subagentes e evidencia escolhas reais.
- [ ] Dados públicos detalhados acessíveis por ferramenta; limites nunca disfarçam amostra como total.
- [ ] Validação de evidências, 6 chamadas máximas, ausência de loops, erros e injeção testados.
- [ ] Prova real local com Gemini de T9 concluída antes do merge, com endpoint/modelo, ambas as delegações, saída estruturada, cotas e usage conferidos; falhas corrigidas na mesma entrega.

### Item 4 — Painel de perguntas, etapas e evidências

**Contexto:** D4 pede perguntas prontas e texto livre no contexto da seleção.

**Ação técnica:** Acrescentar somente o painel de perguntas, sugestões, stream autenticado por fetch e cancelamento/gerações da IA. Reutilizar os controles determinísticos entregues no item 1; a ação de pergunta abre/preenche esses controles e exige seleção explícita, sem segunda implementação. Exibir fatos das ferramentas, ressalvas, marcação IA e referências ao detalhamento existente. Atualizar contrato visual e ajuda.

**Critérios de aceite:**
- [ ] Três perguntas aceitas e ação de comparação municipal, além de texto livre.
- [ ] Eventos refletem execução; falha de um subagente não aparece como resposta completa.
- [ ] Nenhuma resposta obsoleta após seleção/sessão/carga mudar.
- [ ] Sem IA, comparação e consulta continuam utilizáveis; E2E/acessibilidade verdes.

### Item 5 — Configuração gratuita, demonstração e verificação hospedada

**Contexto:** Cotas da conta e execução real não foram conferidas no rascunho.

**Ação técnica:** Preparar runbook e cenários fictícios, reconferir o projeto já testado no item 3 e configurar o ambiente hospedado. Primeira PR entrega preparação e task pendente, sem Closes/Fixes/Resolves da issue. Após seu merge e autorização de produção, executar T9 e redigir 008_validation_agentes.md. Segunda PR da mesma issue entrega relatório e reconciliação da task, e só ela fecha a issue quando todos os critérios forem satisfeitos. Se houver falhas, corrigir nessa segunda PR ou em PR adicional justificada, sempre com aprovação própria; repetir o trecho afetado da verificação. Não adiar relatório para o encerramento nem concluir por merge do runbook (R1-9).

**Critérios de aceite:**
- [ ] Tier gratuito e cotas reais registrados sem credenciais; nenhuma cobrança autorizada por inferência.
- [ ] Principal e dois subagentes demonstrados com Gemini real, modelo e chamadas identificáveis.
- [ ] Acesso negado, cancelamento, falhas/cota e comparações conferidos em produção.
- [ ] Runbook de operação/desligamento e relatório de limitações; requisito acadêmico não declarado cumprido com mocks.

## Arquivos afetados

Caminhos novos abaixo são propostas, ainda não implementadas.

- Item 1: src/comparacao.ts (novo), src/app.ts, src/apresentacao-resultado.ts, src/municipios.ts, index.html, estilos pertinentes, tests/unit e tests/e2e; fixtures fictícias em tests/fixtures/comparacao; KB de comparação a numerar após conferir sequência.
- Itens 2/3: api/explicar.ts (novo), servidor/ (novo, fora de api/ e do grafo do navegador), tsconfig de servidor, package.json/lockfile (CLI Vercel fixada como dependência de desenvolvimento), scripts/agentes/conferir-pacote.mjs, testes HTTP/agentes e .github/workflows/governance.yml (somente jobs da aplicação); nova ADR a numerar na implementação. Prova real local registrada na task da issue 3, sem segredo.
- Item 4: src/agentes.ts e src/apresentacao-agentes.ts (novos), src/app.ts, index.html, estilos, DESIGN.md e E2E.
- Item 5: docs/runbook.md, documentação de variáveis sem valores, configuração Vercel necessária e relatório 008_validation_agentes.md no diretório do ciclo.
- Encerramento: KB-003/KB-005 e novas KB/ADR conforme efetivamente entregue, cycles.md, tasks e plano. Não mudar regras/templates/validador de governança; o workflow governance.yml recebe apenas os checks de aplicação acima. Nenhuma migração de banco prevista.

## Decomposição em issues e PRs

1. PR documental do plano/ideação/cycles após aprovação, branch chore/cycle-008-plan; não criar issue documental artificial.
2. Cinco issues propostas [FEATURE] para itens 1 a 4 e [CHORE] para item 5, sem números inventados; uma PR por issue nos itens 1 a 4 e duas no item 5 (preparação e evidência posterior à verificação), exceção justificada pela dependência do ambiente integrado. Sequência 1 → 2 → 3 → 4 → 5; branches feature/issue-N ou chore/issue-N, com a segunda PR criada a partir de main integrada.
3. O payload das issues será apresentado/confirmado após integração documental. Implementação exige autorização individual.
4. Item 5 separa merge de preparação (não fecha issue), ação externa, autorização de produção, verificação real e PR de relatório/reconciliação (fecha issue). Cada PR tem checks e aprovação de merge próprios.
5. PR de encerramento independente, sem issue recursiva, após todas as entregas e verificações; mover prospectivamente para executed e reconciliar pelo GitHub.
6. Retorno do BL-009 somente após integração comprovada do destino, pela fila canônica e com publicação separada; não editar backlog nesta preparação.

## Dependências e blockers

- Para revisão do rascunho: nenhum bloqueio de autorização; decisões humanas recebidas e pesquisa pública disponível.
- Para implementação: revisão formal apta, aprovação posterior, integração documental, issues e autorização de cada unidade.
- Para prova local do item 2: configuração Vercel de preview apenas fictícia/local e CLI fixada. Para aceite do item 3: projeto Gemini, chave local, cotas e tier gratuitos, ação externa e prova real. Para ativação hospedada no item 5: reconferência de cotas, configuração/runtime Vercel e autorização de produção. Nenhuma dessas provas foi executada nesta correção documental.
- Modelo gemini-3.8-flash é proposta técnica verificável, ainda não testada na conta. Se indisponível, apresentar alternativa gratuita e registrar decisão antes da troca.
- T1–T3 e casos CP/CM precisam de escrutínio G1 na revisão e ratificação na aprovação do plano. Não criar regra nova incidental durante a implementação.
- Template aplicado: .agent/templates/plano_implementacao.md; autoridades .agent/ai_behavior.md, _project/README.md e cycles.md.

## Riscos, suposições e rollback

| Risco | Controle / resposta |
| :-- | :-- |
| Resposta fluente sem evidência | Fatos estruturados, referências verificadas, recusa/incompleto e avaliação real; aviso fixo não é prova de correção |
| Diferença temporal lida como causa | Sem causalidade; regras T1–T3 e ressalvas por lado |
| Benefício Google AI Pro confundido com API paga | Conferir projeto e cotas; não ativar cobrança; manter função desligada até configuração |
| Cota consumida por múltiplas abas/instâncias | Budgets por execução e cotas do provedor; não prometer limite diário próprio inexistente |
| Latência de leitura estadual e múltiplos agentes | Reuso por requisição, paginação íntegra, deadline, cancelamento; sem supressão silenciosa de municípios |
| Dados já enviados ao provedor | D7 e termos registrados; sem promessa de remoção após revogação de acesso |
| Streaming ou empacotamento incompatível | Provar localmente e hospedado; não considerar build Vite suficiente |
| Painel altera leitura do mapa | Identificar A/B e preservar versões/gerações; contrato visual explícito |

Desligamento: retirar habilitação da IA no servidor (sem expor/remover chave pelo cliente); consulta e comparação determinística continuam. Reverter código por PR autorizada se necessário. Não alterar cargas nem políticas RLS para contornar falha. Mudanças de ambiente são ação externa delimitada, sem rollback destrutivo de dados.

## Sequência recomendada

Revisão formal → correções quando solicitadas → aprovação humana posterior → PR documental/checks/aprovação de merge → payloads/issues → item 1 → item 2 com prova local de pacote e merge desligado → item 3 com ação externa e prova Gemini real local antes de merge → item 4 → PR de preparação do item 5 (issue aberta) → ação externa e autorização de produção → teste desligado/habilitado e demonstração → segunda PR da issue 5 com relatório → encerramento prospectivo. Cada implementação e merge mantém sua autorização própria.

## Referências

Fontes públicas consultadas em 2026-11-15; capacidades documentadas não comprovam condições da conta:

- [Google AI Pro — benefícios](https://support.google.com/googleone/answer/14534406?hl=en): benefícios interativos no AI Studio; não comprova quota deste projeto.
- [Gemini — billing](https://aistudio.google.com/docs/billing) e [limites](https://aistudio.google.com/docs/rate-limits): tier do projeto, cotas efetivas no AI Studio e variação por modelo/conta.
- [Gemini — preços](https://aistudio.google.com/docs/pricing#gemini-3.8-flash) e [modelo](https://aistudio.google.com/docs/models/gemini-3.8-flash): candidato com camada gratuita e function calling.
- [Gemini — termos](https://aistudio.google.com/docs/terms): tratamento de conteúdo de serviços gratuitos e restrição a informação sensível/confidencial/pessoal.
- [Gemini — function calling](https://aistudio.google.com/docs/function-calling): modelo propõe chamadas; aplicação executa ferramentas.
- [Gemini — Interactions API](https://aistudio.google.com/docs/interactions-overview): v1beta, suporte documentado a gemini-3.8-flash e store=false; prova real exigida no item 3.
- [Gemini — tokens](https://aistudio.google.com/docs/tokens): contagem remota prévia e usage posterior são distintos; a v2 usa bytes locais e usage, sem chamada de contagem.
- [Vercel — build](https://vercel.com/docs/cli/build) e [pull](https://vercel.com/docs/cli/pull): build standalone em .vercel/output e configuração por ambiente. CLI 65.16.0 conferida via npm view vercel version em 2026-11-15; prova de T4 ainda não executada.
- [Vercel — Node](https://vercel.com/docs/functions/runtimes/node-js) e [limites](https://vercel.com/docs/functions/limitations): função separada do build estático e limites a conferir na conta.
- Autoridades locais: .agent/ai_behavior.md; _project/README.md; _project/cycles.md; ideação 008; KB-003/004/005/006; ADR-003/005/007/008/009/010; DESIGN.md. Consultar arquivos na revisão de origem, sem depender de checkout irmão.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | [#77](https://github.com/EuThiagoAndrade/rastro-quente/issues/77) (item 1), [#78](https://github.com/EuThiagoAndrade/rastro-quente/issues/78) (item 2), [#79](https://github.com/EuThiagoAndrade/rastro-quente/issues/79) (item 3), [#80](https://github.com/EuThiagoAndrade/rastro-quente/issues/80) (item 4), [#81](https://github.com/EuThiagoAndrade/rastro-quente/issues/81) (item 5), criadas em 2026-11-15 |
| PR(s) | [#76 — plano documental](https://github.com/EuThiagoAndrade/rastro-quente/pull/76), squash `b6525a2` integrada em 2026-11-15; [#82](https://github.com/EuThiagoAndrade/rastro-quente/pull/82) (item 1, aberta) |
| Branch(es) | chore/cycle-008-plan (documental); feature/issue-77 (item 1, task [008_task_issue-77.md](008_task_issue-77.md)) |
| Destino após conclusão | `_project/executed/008_comparacao_periodos_agentes/008_plan.md` |


## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 008 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #82 (https://github.com/EuThiagoAndrade/rastro-quente/pull/82)
Diga: "aprovo o merge da PR #82"
```

## Handoff de saída

### Publicação documental — 2026-11-15 (vigente)

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + publicar_plano + 008_plan + v3`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: plano v3 Aprovado, publicação autorizada / PR documental #76 aberta, Aguardando merge
- `result`: `executed`
- `evidence`: [PR #76](https://github.com/EuThiagoAndrade/rastro-quente/pull/76), commit documental 1d8569b, branch chore/cycle-008-plan; 55/55 testes de governança, validador com 0 erros e 0 avisos, whitespace e staging conferidos; G3 sem segredos ou dados privados nos três documentos
- `blockers`: integração depende dos checks remotos e da aprovação específica do merge; nenhuma issue ou implementação iniciada

### Histórico — aprovação da v3, 2026-11-15

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + aprovar_plano + 008_plan + v3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v3 Em Revisão, APTO COM RESSALVAS, Aguardando aprovação do plano / v3 Aprovado, publicação documental autorizada, Pronto para continuar
- `result`: `executed`
- `evidence`: aprovação humana literal no cabeçalho, posterior à rodada 3; cycles.md atualizado; publicação documental coberta pelo fluxo completo de _project/README.md
- `blockers`: nenhum para publicar a PR documental; merge exige checks verdes e aprovação específica; issues dependem da integração documental e da confirmação de seus payloads

A aprovação ratifica D8/D9, T1 (inclusive sobreposição de janelas e CP-14/CP-15) e os tetos T6 como desvio declarado do ADR-007, ainda sem medição. R3-1 deve ser registrada na task do item 1 antes de medir: a qualificação dos destaques pertence ao teto de 360 s, sem alterar regra ou teto. As provas de empacotamento, cota gratuita e function calling com store=false continuam pendentes nos itens 2 e 3. Não há autorização de cobrança, implementação ou merge nesta aprovação. Pareceres anteriores preservados.

### Histórico — correção v3, 2026-11-15

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + rascunhar_plano + 008_plan + v3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano v2 Em Revisão, REQUER NOVA RODADA, Aguardando correções (rodada 2) / plano v3 Em Revisão, respostas R2-1 a R2-5 registradas, Aguardando revisão (rodada 3)
- `result`: `executed`
- `evidence`: autorização de correção da rodada 2 no cabeçalho; alterações T3/T4/T6/T7/T8, pontos de aprovação e resposta do autor; cycles.md v3; branch chore/cycle-008-plan, origem 47c91b3; rodadas 1/2 preservadas
- `blockers`: nenhum para nova revisão; limites de desempenho são propostas a ratificar, sem medição de aplicação nesta correção. Aprovação e execução permanecem pendentes.

Validação da v3 em 2026-11-15: 55/55 testes de governança passaram; validador com 0 erros e 0 avisos (9 conferências manuais); diff e whitespace conferidos. Rodadas 1 e 2 comparadas integralmente ao estado anterior e preservadas. Somente plano e linha de cycles.md alterados nesta correção; a mudança preexistente da ideação foi preservada. Sem commit, publicação, instalação, medição de aplicação ou chamada Gemini.

### Histórico — correção v2, 2026-11-15

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + rascunhar_plano + 008_plan + v2`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano v1 Em Revisão, REQUER NOVA RODADA, Aguardando correções (rodada 1) / plano v2 Em Revisão, decisões D8/D9 recebidas, respostas aos achados registradas, Aguardando revisão (rodada 2)
- `result`: `executed`
- `evidence`: autorização no cabeçalho; D8/D9 aceitas em 2026-11-15; T1–T9 e resposta do autor; cycles.md atualizado; branch chore/cycle-008-plan, HEAD 47c91b3ddbc7d6cf364f3ee490462919dab95714, rodada 1 local preservada
- `blockers`: nenhum para submeter à rodada 2; sem autoaprovação. Implementação, configuração e provas reais dependem dos pontos de aprovação.

Validação da v2 em 2026-11-15: 55/55 testes de governança passaram; validador com 0 erros/0 avisos e 9 conferências manuais; diff e whitespace do plano conferidos. CP-15 confirmado como 90 dias em cada janela; BL-009 da fila atual comparado ao snapshot, sem alteração. Mudanças desta correção limitadas ao plano e à linha do ciclo; alteração anterior da ideação preservada. Nenhum commit, push, PR, dependência instalada ou prova de aplicação/produção executados nesta correção.

### Histórico — rascunho v1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + rascunhar_plano + 008_plan + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: ciclo 008 em Ideação, com autorização de rascunho registrada e situação Parado por decisões pendentes / decisões recebidas, ciclo em Planejamento, plano v1 em Rascunho e Aguardando revisão (rodada 1)
- `result`: `executed`
- `evidence`: este plano, decisões na ideação e linha 008 de cycles.md; branch chore/cycle-008-plan a partir de 47c91b3ddbc7d6cf364f3ee490462919dab95714; nenhum plano anterior encontrado
- `blockers`: nenhum para revisão; ativação e implementação dependem dos pontos explicitados, sem confirmação de quota/execução real

Validação documental em 2026-11-15: 55 testes do validador passaram; validador do repositório com 0 erros e 0 avisos (9 conferências manuais); diff sem erros de whitespace. Escopo local: plano novo, decisões/handoff da ideação e estado do ciclo. Nenhum código de aplicação, issue ou PR criado; nenhuma chamada à API Gemini ou verificação hospedada executada.

## Revisão crítica

Autor do rascunho: Codex (GPT-6). Cada rodada é registrada separadamente, conforme o template e a governança, até o teto de cinco.

### Rodada 1

- **Data:** 2026-11-15
- **Autor:** Codex (GPT-6)
- **Revisor:** Claude Code (Fable 5.2)
- **Base:** plano local `v1`, sem commit próprio, sobre `47c91b3`.

#### Achados bloqueadores

- **R1-1 — A comparação municipal contradiz o recorte aprovado e o próprio caso CM-2 (G1).** T2 manda executar as lentes municipais "no recorte de cada município conforme KB-005" e só usa cálculo estadual para a concentração. Mas CM-2 espera, para a persistência, um "contexto estadual identificado" (3 dias consecutivos no estado), que nenhuma regra de T2 produz. Além disso, mostrar a concentração com município escolhido reverte a decisão A2/T4/T16 do plano `007` (KB-005: a concentração recusa o recorte municipal e a interface desabilita a opção), sem que o plano declare essa reversão. Corrigir: (a) dizer, lente por lente, quais cálculos a comparação municipal executa (só os dois recortes municipais, ou também o estadual) e alinhar CM-2 a essa regra, com os números de cada lado; (b) declarar explicitamente a mudança frente a A2/T16 e o que acontece com a opção hoje desabilitada, ou retirar a concentração da comparação municipal. A escolha é decisão do responsável, não do implementador.
- **R1-2 — A disponibilidade da célula que "saiu" ou "entrou" não tem regra (G1).** É o caso central da ideação ("apareceu em outubro e sumiu em novembro"). Pela KB-005, a cobertura da célula usa os municípios das detecções; no lado sem detecções não há municípios, e T3 só diz "informar esse limite, exibindo separadamente a disponibilidade do recorte disponível", sem definir o que é isso no recorte estadual (142 municípios). O caso extremo de T3 e o CP-4 só cobrem o recorte municipal com lacuna em **todos** os dias. Conforme `.agent/ai_behavior.md`, registrar as alternativas com exemplo numérico e pedir decisão. Exemplo: célula c1 com detecções só de Colniza em A (10 dias, destacada); em B, zero detecções em c1 e 4 dos 10 dias com `incidencia_indeterminada` em Colniza.
  - Alternativa 1: qualificar B com os municípios da célula em A → "saiu; 6 de 10 dias sem evidência de lacuna em B (Colniza)".
  - Alternativa 2: não qualificar a célula em B → "saiu; disponibilidade da célula em B não avaliável", mostrando só a do recorte.
  - Alternativa 3: qualificar pelos municípios do recorte inteiro → no estado, "saiu; N de 10 dias" calculado sobre os 142 municípios.
  Definir também o limite parcial (por exemplo, 9 de 10 dias com lacuna conhecida ainda classifica "saiu"?) e a regra equivalente no recorte estadual, e acrescentar casos CP para a escolha.
- **R1-3 — O critério "função passa empacotamento" e a prova "hospedada" não têm método verificável.** O código das lentes importa com extensão `.ts` (`allowImportingTsExtensions`, `noEmit`) e o projeto é `"type": "module"`; a documentação da Vercel consultada não diz como isso se comporta em `api/*.ts`. O `vercel.json` só implanta `main` (`"**": false`), então não existe ambiente hospedado antes do merge: a primeira prova real do empacotamento seria já em produção, antes do ponto "Verificar produção". Definir no item 2: como o empacotamento é provado localmente (ferramenta, comando e se ela é dependência nova de desenvolvimento), o que a rota faz em produção enquanto a habilitação está desligada (recomendado: recusar tudo antes de qualquer leitura) e em que ponto de aprovação cai a primeira conferência hospedada da rota.

#### Ressalvas

- **R1-4 — Primeira chamada real ao Gemini e conferência de cota só no item 5.** Modelo, cota, comportamento real do function calling e validação da saída estruturada só são observados depois de os itens 2 a 4 estarem integrados, e o plano não diz como correções descobertas ali são tratadas. Recomenda-se antecipar a ação externa de leitura (projeto, chave local fora do Git, cotas RPM/TPM/RPD) e uma execução real local com fixtures fictícias para antes ou dentro do item 3.
- **R1-5 — Orçamentos de T6 não fecham.** 6 chamadas × 20 s já consomem os 120 s totais, sem tempo para as leituras; a KB-005 registra de 41 a 55 s para combinações estaduais e 42 s para 51 consultas de disponibilidade, e a comparação dobra a leitura. O aceite de desempenho não tem número. Definir o orçamento da comparação sem IA frente aos 20 s do ADR-007 (ou registrar o desvio esperado) e separar tempo de leitura e de modelo.
- **R1-6 — "12.000 tokens verificados antes do envio" sem mecanismo.** A página de function calling consultada não documenta contagem de tokens. Dizer se a verificação é estimativa local ou chamada ao provedor; se for chamada, ela envia conteúdo e precisa entrar na revalidação de acesso e na conta de chamadas.
- **R1-7 — Métricas novas em T2 apresentadas como existentes.** "Dias com detecção" e "células com detecção" por município não aparecem em `src/`, nas KBs nem no `DESIGN.md`. Definir (dia GMT, grade T1, recorte municipal) e manter os casos CM-1 como referência.
- **R1-8 — Lacunas menores em T1.** Não diz se as janelas A e B podem se sobrepor ou coincidir. Falta caso para recorrência com meses tocados diferentes e suficientes (A toca 3, B toca 4, mesma duração) e a ressalva correspondente.
- **R1-9 — Entrega do relatório do item 5 e fechamento da issue.** O relatório `008_validation_agentes.md` só existe depois da verificação em produção, que vem depois do merge da PR do item 5. Dizer em qual PR ele entra (segunda PR da issue ou encerramento) e que a PR do runbook não fecha a issue.
- **R1-10 — Divisão entre itens 1 e 4.** Os controles de comparação de T7 aparecem na ação técnica dos dois itens. Deixar claro o que cada um entrega.
- **R1-11 — API do Gemini a fixar.** Os exemplos atuais de function calling usam a Interactions API (`/v1beta/interactions`). A ADR do item 2 deve fixar endpoint e versão conferidos para `gemini-3.8-flash`.
- **R1-12 — Textos a alinhar.** "Nenhuma edição de governança prevista" convive com a alteração de `.github/workflows/governance.yml`; dizer que são só jobs de aplicação. A fila do backlog está hoje em `8d195e0` (não em `cd1115f`); o BL-009 segue sem alteração na fila, conferido nesta rodada.

#### Itens atendidos

- Estrutura do template, nível completo, modo contínuo `—`, autorizações e pontos de aprovação (cobre e não cobre) conforme `_project/README.md`; validador com 0 erros.
- Fatos conferidos por leitura: `vercel.json` (só `dist`, CSP `connect-src 'self'`), `tsconfig.json` (só `src`), dependências, lentes puras sem DOM, `id_destaque` da persistência com data inicial, concentração com N=10 e empatados, ausência de PRs abertas, `e274e49` em `origin/main`.
- Fontes públicas conferidas em 2026-11-15: `gemini-3.8-flash` estável, com function calling e camada gratuita; conteúdo da camada gratuita usado para melhoria e sujeito a revisão humana; cotas por projeto; Vercel Hobby com até 300 s e corpo de 4,5 MB.
- G2: matriz T4 sem `service_role`, negativas sem chamada ao Gemini e testes com Auth/RLS locais. G3: D7 registrada com seus limites; fixtures fictícias; logs sem conteúdo. G4: sem migração.
- T1 (identidade por unidade, sem usar `id_destaque` da persistência), CP-1 a CP-9 e a separação zero/lacuna/falha estão coerentes com KB-004 e KB-005, ressalvados R1-1, R1-2 e R1-8.

#### Veredito

`REQUER NOVA RODADA` — três bloqueadores (R1-1 e R1-2 pedem decisão do responsável sobre regra analítica; R1-3 pede definição técnica).

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + revisar_plano + 008_plan/rodada-1 + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano v1 em Rascunho, Aguardando revisão (rodada 1) / plano v1 em Em Revisão, veredito REQUER NOVA RODADA, Aguardando correções (rodada 1)
- `result`: `executed`
- `evidence`: esta rodada; leituras locais em `47c91b3`; validador com 0 erros; documentação pública consultada em 2026-11-15
- `blockers`: R1-1 e R1-2 dependem de decisão do responsável; nenhuma aprovação, issue ou implementação realizada

#### Resposta do autor — v2, 2026-11-15

Autor: Codex (GPT-6). Correção autorizada por "corrija o plano do ciclo 008". As sugestões D8/D9 foram aceitas explicitamente pelo responsável nesta correção. A rodada 1 acima permanece preservada, inclusive seu veredito.

| Achado | Resposta | Correção/evidência na v2 |
| :-- | :-- | :-- |
| R1-1 | Corrigido com D8 | T2 contém matriz por lente, contexto estadual separado e preservação de A2/T4/T16 na consulta comum. CM-2 espera 2/1 dias, 1/1 células e 0/0 sequências municipais, sem terceira aplicação estadual; CM-6 confere o controle. |
| R1-2 | Corrigido com D9 | Alternativa 2: célula sem detecções não avaliável, municípios separados. T3 e CP-10 a CP-13 cobrem 4/10 indeterminados, 9/10 e 10/10 lacuna, simetria entrada/saída e estado misto/total. |
| R1-3 | Corrigido | T4 fixa CLI de desenvolvimento, build standalone e teste HTTP do pacote isolado, inclusive .ts/ESM. Desligada retorna 503 antes de leitura/rede; primeira sondagem hospedada só com autorização no item 5. Compatibilidade ainda será provada na implementação. |
| R1-4 | Corrigido | T9/item 3 antecipam ação externa, cotas e prova Gemini real local antes do merge. Correções nessa issue; problemas hospedados permanecem na issue 5, com PRs próprias. |
| R1-5 | Corrigido | T6 separa 120 s leitura/cálculo + 120 s geração + 30 s auxiliares. Alvo 20 s e desvio proposto de até 120 s para comparação, cenários/volume e três execuções frias; 270 s para IA completa. Timeout reprova aceite. Desvio sujeito à aprovação do plano. |
| R1-6 | Corrigido | Removida contagem prévia exata de 12.000 tokens. Bytes UTF-8 medidos localmente incluem todo o payload; tokens por usage posterior. Sem count_tokens remoto nem chamadas omitidas do limite. |
| R1-7 | Premissa factual contestada; clareza corrigida | Métricas já existem em numerosMunicipio, src/municipios.ts:26–43, com GMT e grade T1. T2 explicita definições e preserva CM-1, sem criar métrica. |
| R1-8 | Corrigido como proposta explícita para ratificação | T1 permite janelas coincidentes/sobrepostas, sem somar lados; CP-14/15 conferem coincidência, sobreposição e 3/4 meses suficientes com datas concretas e ressalva. Aprovação do plano ratificará o detalhe G1. |
| R1-9 | Corrigido | Duas PRs no item 5: preparação não fecha issue; relatório/reconciliação após verificação a fecha. Cada merge exige aprovação própria. |
| R1-10 | Corrigido | Item 1 entrega todos os controles/mapa/resultados determinísticos; item 4 acrescenta perguntas/eventos, reutilizando-os. |
| R1-11 | Corrigido | T6 fixa POST /v1beta/interactions, gemini-3.8-flash e store=false; distingue API beta de modelo estável e exige prova real local e ADR. |
| R1-12 | Corrigido sem alterar snapshot | governance.yml limitado aos jobs de aplicação. Baseline registra fila atual 8d195e0; cd1115f permanece apenas no snapshot histórico, conforme a regra de origem. BL-009 inalterado. |

Não foi executada a rodada 2 nem concedida aprovação. O plano continua Em Revisão e aguarda conferência do revisor.

### Rodada 2

- **Data:** 2026-11-15
- **Autor:** Codex (GPT-6)
- **Revisor:** Claude Code (Fable 5.2)
- **Base:** plano local `v2`, sem commit próprio, sobre `47c91b3`.

#### Conferência dos achados da rodada 1

- **Corrigidos:** R1-1 (D8, matriz por lente em T2, CM-2 e CM-6 coerentes com A2/T4/T16), R1-2 (D9, T3 e CP-10 a CP-13), R1-3 (prova do pacote isolado, 503 quando desligada, primeira sondagem hospedada só no item 5), R1-4, R1-5 (estrutura dos orçamentos), R1-6, R1-8 (CP-14 e CP-15; as duas janelas de CP-15 têm 90 dias e tocam 3 e 4 meses), R1-9, R1-10, R1-11 e R1-12.
- **R1-7 — contestação aceita.** O achado estava errado: as três métricas existem em `numerosMunicipio` (`src/municipios.ts`, linhas 25 a 44), com dia GMT e grade T1. A v2 só explicita a definição.
- Nenhum achado corrigido reapareceu; bloqueadores caíram de 3 para 1.

#### Achado bloqueador

- **R2-1 — A leitura de disponibilidade exigida por T3 não cabe no teto de 120 s de T6.** T3 (D9) pede, no recorte estadual, a disponibilidade dos 142 municípios de cada lado, com "leitura e conferência completas". `consultar_disponibilidade` responde um município por chamada, com concorrência 4 (`CONCORRENCIA_DISPONIBILIDADE`), e a KB-005 registra 42,3 s para 51 consultas no perfil do ADR-007. Por extrapolação simples, 142 consultas levam cerca de 118 s e as 284 dos dois lados cerca de 235 s, antes das leituras de registros e das lentes (41 a 55 s por lado nas combinações estaduais). O cenário obrigatório "duas janelas estaduais com combinação" tende a estourar o teto de 120 s que a aprovação do plano ratificaria, e o mesmo custo entra nos 120 s de leitura da execução com IA. A extrapolação é estimativa, não medição. Corrigir escolhendo e declarando uma saída, por exemplo: (a) ler a lista dos 142 municípios só sob demanda, ao abrir o detalhamento, com orçamento e estado próprios, mantendo no resultado inicial apenas o que as células destacadas exigem; (b) manter a leitura completa e propor um teto maior, com o número estimado; ou (c) medir antes e fixar o teto no plano. Dizer também como a regra "lacuna conhecida em todos os dias de todos os municípios" (CP-13) é verificada sem essa leitura completa, se a opção for (a) — só é necessária quando o lado tem zero registros no estado inteiro.

#### Ressalvas

- **R2-2 — Prova do pacote é local, não de CI.** `vercel pull` e `vercel build` dependem de vínculo e credencial do responsável. Dizer que `conferir-pacote` é evidência local registrada na task (como os scripts `conferir:*`) e que a CI recebe só `typecheck:servidor`, `test:api` e `test:agentes`, sem segredo da Vercel.
- **R2-3 — "API beta" não confere com a fonte.** A página da Interactions API consultada em 2026-11-15 a declara de disponibilidade geral desde junho de 2026 (o caminho continua `v1beta`). A página não diz se function calling e saída estruturada funcionam com `store=false`; a prova real do item 3 já cobre isso, e a ADR deve registrar o resultado.
- **R2-4 — Dois momentos de ação externa na issue do item 5.** Configurar com a IA desligada e, depois da primeira sondagem, habilitar. Dizer se a frase "concluí a ação externa da issue #N" é dita duas vezes ou se a habilitação é parte da verificação em produção autorizada.
- **R2-5 — D8 e D9 a confirmar na aprovação.** Foram registradas pelo autor como aceitas pelo responsável na correção e não constam da ideação. A conferência de que foram ditas é manual: ao aprovar o plano, o responsável as ratifica.

#### Itens atendidos

- Fatos novos conferidos: CLI `vercel` 65.16.0 existe no registro npm; `vercel build --standalone` e `vercel pull --environment=preview` documentados; `.vercel/` já está no `.gitignore`; runtime Node 24.x disponível; `maxDuration` de 300 s é o máximo do plano Hobby e se configura em `functions` do `vercel.json`; endpoint `POST /v1beta/interactions`, `gemini-3.8-flash` suportado, `store=false` documentado; `usage` com contagem de tokens de entrada, saída e raciocínio.
- Estrutura, pontos de aprovação (inclusive as ações externas dos itens 2, 3 e 5), barreiras G1 a G4 e decomposição em issues e PRs coerentes com `_project/README.md`; validador com 0 erros.

#### Veredito

`REQUER NOVA RODADA` — um bloqueador (R2-1), de definição técnica, com efeito sobre o teto de desempenho que a aprovação ratificaria.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + revisar_plano + 008_plan/rodada-2 + v2`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano v2 Em Revisão, Aguardando revisão (rodada 2) / plano v2 Em Revisão, veredito REQUER NOVA RODADA, Aguardando correções (rodada 2)
- `result`: `executed`
- `evidence`: esta rodada; leituras locais em `47c91b3` (`src/municipios.ts`, `src/consulta.ts`, `src/lentes/carregar.ts`, KB-005); documentação pública consultada em 2026-11-15; validador com 0 erros
- `blockers`: R2-1; nenhuma aprovação, issue ou implementação realizada

#### Resposta do autor — v3, 2026-11-15

Autor: Codex (GPT-6). Correção autorizada por "corrija o plano do ciclo 008", com continuidade solicitada pelo responsável. Nenhum parecer anterior foi reescrito, nenhuma aprovação foi inferida.

| Achado | Resposta | Correção/evidência |
| :-- | :-- | :-- |
| R2-1 | Corrigido pela alternativa (a), com limites explícitos | T3 separa seleção e qualificação, lista estadual sob demanda e leitura automática obrigatória para lado estadual zero. T6 reserva 120 s para resultado inicial e 360 s para a conferência completa pelo navegador/RPCs sob JWT (até 480 s total), concorrência global 4; estimativa 235,6 s não é medição. CP-16/17 provam progressão e ausência de conclusão prematura. Na IA, leitura integral continua obrigatória quando a pergunta exigir; se exceder 120 s, não sintetizar nem confiar em dados do cliente. CP-18 testa a limitação da IA síncrona; o detalhe sem IA continua disponível. Não se promete completar 284 consultas na mesma função de 270 s. |
| R2-2 | Corrigido | T4 distingue prova local do pacote, registrada na task, dos três novos checks de CI sem segredo Vercel. As provas reais locais continuam obrigatórias antes do merge. |
| R2-3 | Corrigido | T6 retira a inferência de beta a partir de v1beta. Fonte consultada declara disponibilidade geral desde junho de 2026; mantém prova real de function calling + saída estruturada + store=false no item 3 e registro na ADR. |
| R2-4 | Corrigido | Pontos de aprovação define duas ações/manifestações na mesma issue do item 5: configuração desligada e habilitação após primeira sondagem autorizada. Task distingue as etapas; a aprovação da verificação não habilita por si só. |
| R2-5 | Corrigido | Pontos de aprovação explicita ratificação humana de D8/D9 e exemplos na aprovação do plano. Mantidos os registros de aceite e a conferência manual, sem inventar nova fala ou aprovação. |

Sem rodada 3 executada nem veredito novo. A condição de saída é Aguardando revisão (rodada 3); configuração, medição, testes reais e implementação não foram executados.

### Rodada 3

- **Data:** 2026-11-15
- **Autor:** Codex (GPT-6)
- **Revisor:** Claude Code (Fable 5.2)
- **Base:** plano local `v3`, sem commit próprio, sobre `47c91b3`.

#### Conferência dos achados da rodada 2

- **R2-1 — corrigido.** T3 separa seleção observada de qualificação: o resultado inicial não espera a lista dos 142 municípios, que passa a ser lida sob demanda, com estado próprio (T7). A regra D9 é preservada pela exceção obrigatória: lado estadual com total zero dispara a conferência integral e suspende a conclusão até o fim (CP-13, CP-16, CP-17). T6 tem tetos separados (120 s para o resultado inicial, 360 s para a conferência completa, 480 s no pior caminho) e declara a estimativa de 235,6 s como estimativa. A limitação da IA para perguntas sobre o estado inteiro está explícita (CP-18), sem confiar em dados do navegador.
- **R2-2, R2-3, R2-4 e R2-5 — corrigidos** em T4, T6 e "Pontos de aprovação".
- Nenhum achado corrigido reapareceu; bloqueadores caíram de 1 para 0. As regras de T1 a T3 e os casos CP-1 a CP-18 e CM-1 a CM-6 estão coerentes entre si e com KB-004 e KB-005.

#### Ressalva

- **R3-1 — Em qual teto cai a qualificação dos destaques.** T6 lista no orçamento de 360 s a lista estadual e a verificação de recorte zero; a estratégia de testes inclui ali também a "qualificação solicitada" dos municípios dos destaques. Fixar na task do item 1, antes de medir, que a qualificação dos destaques conta no orçamento de 360 s (leitura adotada nesta revisão), sem mudar regra nem teto.

#### Pontos de atenção para a aprovação (sem exigência de correção)

- Aprovar o plano ratifica D8 e D9, as propostas de T1 (janelas sobrepostas, CP-14 e CP-15) e os tetos de desempenho de T6, que são desvio declarado frente aos 20 s do ADR-007 e se apoiam em estimativa, não em medição.
- A IA não responde, nesta versão, perguntas que exijam a disponibilidade do estado inteiro quando a leitura passar de 120 s; a comparação sem IA continua respondendo.
- Empacotamento na Vercel, cota gratuita e function calling com `store=false` seguem não comprovados; o plano os prova nos itens 2 e 3 antes dos merges e para em "Parado" se falharem.

#### Veredito

`APTO COM RESSALVAS` — sem bloqueadores; uma ressalva de redação (R3-1), resolvível na task do item 1.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + revisar_plano + 008_plan/rodada-3 + v3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano v3 Em Revisão, Aguardando revisão (rodada 3) / plano v3 Em Revisão, revisão formal concluída, veredito APTO COM RESSALVAS, Aguardando aprovação do plano
- `result`: `executed`
- `evidence`: esta rodada; leitura integral das seções alteradas da v3 sobre `47c91b3`; fatos externos conferidos nas rodadas 1 e 2 e inalterados na v3; validador com 0 erros
- `blockers`: nenhum para a aprovação humana; nenhuma aprovação, issue ou implementação realizada

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Não se aplica. O ciclo 008 não herda exceções do ciclo 000.
