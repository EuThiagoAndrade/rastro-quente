# Plano de Implementação — Fundação e implementação do protótipo

> **Ciclo:** `003`
> **Status:** `Em Revisão`
> **Versão:** `v3`
> **Data de criação:** 2026-11-05
> **Última atualização:** 2026-11-05
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 003" em 2026-11-05
> **Modo contínuo:** `—`
> **Revisão formal:** `Em andamento`
> **Veredito da revisão:** `REQUER NOVA RODADA`
> **Aprovação humana pós-revisão:** `Pendente`
> **handoff_schema_version:** `2`

**Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 003", em 2026-11-05. Após perguntas com sugestões e alternativas, o responsável declarou "Aceito todas as suas sugestões apresentadas." e indicou o estilo de `local/prototipo` como inspiração. Autor: Codex (GPT-6). Este aceite resolve o recorte abaixo; não é aprovação do plano após revisão nem autorização de implementação.

**Complemento autorizado — v2, 2026-11-05 (histórico):** o responsável pediu componentes mobile first na medida do possível, mantendo a exploração cartográfica confortável no computador; textos mais visíveis, especialmente as tags abaixo dos nomes dos municípios; e uma cor de destaque claramente distinta das cores secundárias. A v2 detalhou esses requisitos na direção visual, na estratégia de testes e no item 4. A escolha exata do azul proposto é técnica e permanece sujeita à revisão/aprovação do plano. Não houve veredito formal entre v1 e v2; ao concluir aquele complemento, o plano estava em `Rascunho`, aguardando rodada 1.

**Autorização da correção — v3, 2026-11-05:** "corrija o plano do ciclo 003". A rodada 1 da v2, de Claude Code (Opus 5.5), está preservada integralmente em "Revisão crítica". Após sugestões com alternativas e exemplos, o responsável escolheu **D1 — classificação por município** e **sensibilidade por consulta na interface**. Esta correção responde R1-1 a R1-8, mantém `Em Revisão` e o último veredito `REQUER NOVA RODADA`, e aguarda rodada 2; não representa novo parecer ou aprovação.

## Problema e contexto

Ideação: _project/ideations/003_implementacao_prototipo.md.

## Objetivo

Entregar um protótipo utilizável na Vercel, com login Google por Supabase Auth e consulta restrita ao responsável: mapa, registros e contagens de detecções `AQUA_M-T` por município/período em Mato Grosso, disponibilidade/lacunas separadas da detecção e proveniência verificável. A primeira carga cobre os 12 meses completos mais recentes disponíveis, atualizados sob demanda por comando local.

As provas de volume, capacidade, autorização e recuperação serão partes bloqueantes das próprias entregas deste plano. A conclusão operacional exige aplicação publicada, verificações previstas e evidência do recorte efetivamente carregado. Uma medição negativa interrompe a execução para decisão; não equivale a entregar o protótipo nem autoriza reduzir o recorte ou contratar serviço.

Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Este ciclo entrega consulta auditável; seleção/ranking de áreas continua fora do escopo.

## Origem no backlog

Não se aplica. Demanda direta do responsável em 2026-11-05; `_project/backlog.md` está vazio e nenhum ID foi selecionado.

## Contexto e baseline

- Base integrada: `78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`, encerramento do ciclo `002`, PR #18. Ideação local em `23896d64d1724e8d62745f7b1a366f63d6a48b9b`. Em 2026-11-05 não havia PR aberta nem issue aberta no repositório; o ciclo `003` ainda não tinha plano ou entrega implementada.
- Existem governança, tooling Node.js 24 e scripts/fixtures de prova em `scripts/prova-dados/` e `tests/fixtures/prova-dados/`. Não existem aplicação operacional, Supabase configurado, migrações, login Google ou importador estadual. Não se presume que CLI Supabase ou runtime de contêineres estejam disponíveis.
- A prova do ciclo `001` mediu 824 registros `AQUA_M-T` em Colniza em ago–out/2026 (516, 246, 62), usando polígono IBGE v4, borda incluída e GMT. Esse número é referência para aquele recorte, não estimativa do volume de 12 meses de MT. A comparação VIIRS/FIRMS não valida fisicamente cada detecção nem substitui casos do método atual.
- O ciclo `002` concluiu insuficiência de evidência para adotar as três arquiteturas analisadas; não executou benchmarks, RLS, Auth ou reconstrução. PF1–PF5 do parecer tornam-se verificações das entregas abaixo, apenas para o recorte escolhido; não se repete a comparação dos 27 cenários ou dos três executores.
- A inspeção visual autorizada foi estática, limitada ao CSS e à estrutura de marcação de `local/prototipo`. Não houve execução de seu JavaScript, leitura de suas bases ou avaliação visual em navegador. A direção de estilo está descrita neste plano e deverá ser conferida por renderização na entrega da interface.

## Escopo

### Dentro do escopo

- **R1 / S1 / I1 / T1:** consulta auditável; somente `AQUA_M-T`; 12 meses completos de MT; INPE + limites municipais IBGE; ingestão e processamento territorial locais; GMT principal e sensibilidade Cuiabá.
- Obtenção verificável, validação, medição estadual, manifesto de fontes, importador repetível, publicação transacional, expiração da janela e reconstrução local.
- Banco Supabase, migrações aditivas, acesso por RLS, executor com privilégio mínimo, login/logout Google, consulta, mapa vetorial e estados reais de erro/disponibilidade.
- Fundação web, testes de método/acesso/integração/interface, configuração gratuita pelo responsável, deploy, verificação autorizada em produção e documentação operacional.
- Direção visual inspirada no protótipo privado, reimplementada para este recorte com componentes mobile first, tipografia legível, cor de destaque distinta, acessibilidade e dados apropriados para cada ambiente; desktop amplia o espaço de exploração do mapa.

### Fora do escopo

- Ranking, seleção ou priorização de áreas, índices de risco, densidade para ordenação, limiares ambientais, agrupamento de registros em incêndios e interpretação jurídica.
- VIIRS, todos os satélites, NASA FIRMS operacional, mais de 12 meses, imóveis, unidades de conservação, terras indígenas ou outras sobreposições.
- Atualização automática, processamento na Vercel, PostGIS hospedado, filas, jobs agendados, exportação de dados pela interface, favoritos e gestão de múltiplos usuários.
- Planos pagos, cartão, trial com cobrança, domínio pago, serviços externos de tiles/geocodificação, e disponibilidade contínua ou prazo de recuperação garantido.
- Copiar/publicar o mockup, seus dados, imagens ou funcionalidades; transformar o material privado em dependência de build, arquitetura ou design system definitivo. Nenhuma leitura de `local/brainstorm` está autorizada.

## Decisões e autoridades

As autoridades são `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, ADR-002/003/004, KB-003 e as decisões humanas da ideação. As escolhas de produto/método abaixo foram aceitas; as escolhas técnicas são propostas deste rascunho, sujeitas à revisão e aprovação. Ao formular novas perguntas, apresentar primeiro sugestão, motivo e alternativas, conforme preferência do responsável.

### Contrato de dados e consultas

| Aspecto | Contrato proposto para implementação e validação |
| :-- | :-- |
| Janela | Fixar no manifesto início inclusivo e fim exclusivo, em GMT, dos 12 meses completos consecutivos mais recentes com fontes mensais oficiais disponíveis no momento da carga. Na atualização, registrar a nova janela; não usar últimos 365 dias, mês parcial ou substituir mês indisponível silenciosamente. |
| Unidade contada | Registro publicado de `AQUA_M-T`, preservando linhas distintas da fonte mesmo com coordenadas/instantes iguais. Identidade técnica combina versão/hash da fonte e posição da linha; repetir a mesma importação não cria novas detecções. Preservar o `id` original do INPE como `id_fonte`, atributo textual de auditoria, sem usá-lo como chave única/deduplicação. Valor repetido é mantido em cada linha e contabilizado no relatório; célula vazia vira nulo e é declarada, sem excluir o foco ou inventar id original. Coluna `id` ausente é mudança de formato a tratar antes da publicação. Não deduplicar eventos ambientais. |
| Território | Obter lista oficial de municípios de MT e malhas IBGE v4 com revisão/metadados e hash fixados. Classificar coordenadas originais com a mesma semântica do ciclo `001`: exterior/interior de anéis, buracos e borda incluída. Validar CRS/eixos e não arredondar coordenadas ou criar tolerância espacial sem decisão. |
| Pré-filtro | Ler nacionalmente a série escolhida em streaming; usar envelopes dos polígonos para reduzir cálculo, incluindo candidatos geométricos e registros atribuídos a MT pelo INPE. Filtrar apenas `estado_id = 51` perderia registros de outra UF dentro do polígono e não implementa T1. |
| Divergências | Confrontar atribuição IBGE com códigos INPE; contabilizar inclusões, exclusões e divergências por município/estado. Registro fora de MT não entra na contagem principal, mas sua exclusão entra no relatório. Não escolher município em empate por primeiro resultado ou menor código. Caso de pertencimento a múltiplos municípios/ambiguidade material exige parada com coordenada fictícia equivalente, alternativas e efeitos numéricos para decisão humana antes da publicação afetada. |
| Tempo | Datas inclusivas dos filtros e cortes da série diária/mensal principal são **GMT**, identificados na interface. Consulta de 01/10 a 31/10, por exemplo, tem intervalo principal `[01/10 00:00Z, 01/11 00:00Z)`. Para cada consulta, calcular também o total para as mesmas datas de calendário em `America/Cuiaba`, em campo separado e rotulado; validar o deslocamento do período. O mapa, a tabela e os totais/séries principais continuam GMT. |
| Fontes e persistência de fronteira | Persistir o envelope necessário à sensibilidade na mesma versão publicada, com proveniência e marcação explícita que o distingue dos registros da janela GMT principal. Não estender o período selecionável nem incluir o envelope no total/mapa/tabela/série principais. Selecionar fonte mensal adjacente ou diária oficial para cada intervalo sem sobreposição; o arquivo diário já é caminho documentado na prova `001`. Ausência de envelope verificável é pendência de completude: não calcular sensibilidade parcial como se completa nem substituir por zero; pedir decisão antes de aceitar a entrega afetada. |
| Disponibilidade | **D1, escolhida pelo responsável nesta correção:** unidade dia GMT × satélite × município IBGE; três classes `lacuna_conhecida`, `incidencia_indeterminada` e `sem_evidencia_de_lacuna`, separadas da presença/ausência de detecção. Aplicar o protocolo abaixo para aviso parcial, aviso sem área e histórico ausente. Nenhuma das classes autoriza inferir ausência de fogo ou cobertura plena. Não transportar o limiar de três dias da prova `001` como regra operacional. |
| Resultado mínimo | Totais estadual/municipal, série mensal/diária GMT, registros paginados, mapa, disponibilidade por município e proveniência/data da carga; municípios listados alfabeticamente, sem prioridade ambiental. Toda consulta exibe também **"Sensibilidade — America/Cuiaba"**, com contagem própria, diferença para o total GMT, limites temporais e mesma versão. Todas as respostas informam o contexto/fuso; não calcular total a partir de página parcial nem apresentar o número de sensibilidade como total do mapa GMT. |
| Mapa | Limites e pontos vêm do conjunto autorizado por RLS; classificação usa malha local integral, exibição usa representação separada conforme o protocolo abaixo. Projeção/simplificação de exibição não define pertencimento. Visualização parcial informa quantos pontos mostra e o total, com navegação/paginação ou pedido de recorte menor, sem amostragem oculta. Nenhuma base territorial vai no bundle público. |

A janela exata e a revisão das fontes são fixadas na entrega 1, sem download ou reprocessamento de brutos durante este rascunho. Correção de fonte altera a versão do conjunto, preserva a proveniência e passa pelos mesmos testes; não muda a regra humana.

### Disponibilidade municipal e sensibilidade temporal — decisões da correção

**R1-1 / D1:** registrar avisos com fonte, versão/hash, intervalo GMT, satélite, delimitação territorial verificável e motivo da classificação. Quando a área/intervalo forem inequívocos, o processador local aplica a regra por polígono municipal; o responsável valida textos ou topologia ambíguos, sem o agente interpretar livremente o aviso. Aviso que documenta falta de dados abrangendo o município inteiro gera `lacuna_conhecida`; incidência parcial ou área não delimitada gera `incidencia_indeterminada` nos municípios cujo afastamento não puder ser demonstrado. Um aviso comprovadamente fora do município pode ter `sem_incidencia` no registro do aviso, mas isso não é uma quarta classe de disponibilidade nem prova cobertura.

Conferir o histórico para a janela/fonte consultada e registrar seu alcance: verificado, parcial ou indisponível. Dia sem aviso incidente num histórico verificável recebe `sem_evidencia_de_lacuna`, com o aviso textual **"cobertura não comprovada"**. Se não houver histórico verificável para o dia/município, usar `incidencia_indeterminada`, motivo `historico_ausente_ou_incompleto`, e conservar as contagens observadas acompanhadas da limitação. Na composição de avisos do mesmo dia/satélite/município, manter a precedência do ciclo `001`: lacuna conhecida, depois incidência indeterminada, depois sem evidência de lacuna; preservar os motivos e a incompletude do histórico, mesmo quando já exista lacuna conhecida.

Exemplo fictício escolhido: aviso de falta de `AQUA_M-T` a oeste de 58°O → X inteiro a oeste: lacuna conhecida; Y cortado pela linha: incidência indeterminada; Z inteiro a leste: sem evidência de lacuna, se o histórico do dia foi verificado. Em 30 dias iguais quanto ao histórico, Z ter zero dias nas duas primeiras classes não significa 30 dias cobertos. Exibir dias por classe no município selecionado; na visão estadual, explicitar a unidade município-dia e as classes, sem inventar um status homogêneo para todo MT.

**R1-2 / interface por consulta:** o responsável escolheu sensibilidade em Cuiabá para cada consulta, além da série principal GMT. Para outubro/2026, por exemplo, principal `[2026-10-01T00:00Z, 2026-11-01T00:00Z)` e sensibilidade `[2026-10-01T04:00Z, 2026-11-01T04:00Z)`, após conferir o fuso do período. Exemplo fictício aceito: principal 100, com 3 registros nas primeiras quatro horas do início e 5 nas quatro horas após o fim → sensibilidade `100 − 3 + 5 = 102`, diferença `+2`. Nenhum dos 5 registros finais entra no mapa/tabela/total principal de outubro. Persistir e dimensionar o envelope; não presumir diferença zero por ela ter ocorrido na referência de Colniza. Disponibilidade permanece na unidade dia GMT, explicitamente rotulada, sem recalculá-la silenciosamente em outro calendário.

### Geometria para classificação e para exibição

A classificação territorial usa a malha IBGE integral local, com revisão/hash fixados. Publicar uma representação de exibição separada, de mesma origem/revisão, obtida com a menor generalização cartográfica necessária ao desempenho medido; registrar método, parâmetros, tamanho e hash. Preferir recurso oficial compatível, quando disponível; se for necessário simplificar uma cópia local, conferir ferramenta/licença/versão antes e demonstrar que o cálculo de pertencimento continua usando exclusivamente a malha integral. Não adicionar engine ou simplificação sem necessidade demonstrada; geometria integral pode ser usada para exibição se cumprir o orçamento/desempenho medidos.

Medições incluem bytes de cada município e do conjunto, tamanho transferido das respostas, número de requisições, egress e tempo de primeira exibição/navegação em celular, sob perfil de rede/dispositivo declarado. Não extrapolar 62.339 bytes de Colniza para os demais municípios. Carregar geometrias por demanda/recorte e evitar baixar o conjunto integral desnecessariamente na abertura. Se a exibição for simplificada, a legenda deve dizer: **"Limites simplificados para visualização; contagens usam a malha integral. Pontos próximos à divisa podem aparentar outro pertencimento."** A medição no item 3 e a conferência mobile no item 4 precisam justificar a representação efetivamente escolhida.

### Arquitetura mínima proposta

- **Web:** aplicação estática Vite + TypeScript, módulos nativos e CSS, sem framework de interface ou servidor intermediário. `@supabase/supabase-js` realiza Auth e consultas sob a sessão do usuário. Leaflet estável realiza o mapa vetorial, sem tiles de terceiros. As bibliotecas, licenças, compatibilidade e versões exatas serão conferidas e fixadas no lockfile na entrega correspondente; não usar beta por padrão.
- **Dados:** Node.js 24 em CLI local, reaproveitando componentes válidos da prova `001`, com leitura em streaming. Para publicação, começar pela hipótese de uma única transação no mesmo cliente `pg`; loteamento/checkpoints só quando a medição demonstrar necessidade. Credencial exclusiva de ingestão por ambiente, fora do cliente e dos logs. O algoritmo territorial continua local; PostGIS não é dependência operacional desta proposta.
- **Banco:** entidades de fontes, versões de malha/municípios (classificação e exibição identificadas), detecções com `id_fonte` e escopo principal/envelope, disponibilidade por dia GMT × satélite × município com classe/motivo/histórico, cargas e referência à publicação vigente; toda tabela `public` com RLS. Preservar códigos territoriais/origem, sem `user_id` fictício em registro compartilhável. Schema/índices são medidos com carga completa local, incluindo envelope e geometria de exibição.
- **Autorização:** lista administrativa privada com o **UUID `auth.users.id`** do único RP no projeto Supabase alvo; não usar e-mail, nome, id recebido do cliente ou `user_metadata` como chave de autorização. O UUID é obtido pelo responsável após o primeiro login Google no destino, ainda sem acesso aos dados, e cadastrado por administração externa separada. Nenhum valor real em migração/seed/repositório. RLS compara identidade confiável da sessão; se necessário helper `security definer` para consultar a lista privada, limitar à resposta booleana, `search_path` fixo, referências qualificadas e grants mínimos; justificar/testar. Consultas/agregações comuns permanecem `security invoker`.
- **Executor EX:** papel SQL dedicado, não proprietário, sem `BYPASSRLS`, DDL ou acesso à lista de autorização; grants/políticas só para operações de dados previstas. Não entregar `service_role` ao navegador nem utilizá-la como substituto do desenho de privilégio mínimo. Se a restrição não puder ser demonstrada, parar para revisão.
- **Publicação:** validar manifesto, contagens e integridade, publicar atomicamente e conservar a última versão íntegra em falha. Uma única transação pode atender ao recorte; staging/lotes/checkpoints são condicionais à medição e, se usados, não ficam visíveis a RP. Unicidade da identidade da carga e controle transacional de concorrência devem provar idempotência/ausência de mistura, sem impor serviço de locks ou checkpoint persistente. Consultas fixam versão para mapa, tabela, total GMT e sensibilidade. Expiração/limpeza só remove versões elegíveis pelo protocolo, nunca a vigente por tentativa cega.
- **Ambientes:** Supabase local isolado para banco/RLS, dados fictícios nos testes e previews; fontes reais públicas somente na medição local autorizada e no destino de consulta após os gates. Preview não herda credenciais/dados do banco de produção. O bundle distribuído contém código/estilos, sem resultados territoriais ou arquivos de `local/`.

### Matriz de acesso — diretrizes aceitas na ideação e detalhamento proposto para aprovação do plano

| Recurso/ação | AN — anônimo | RP — responsável autorizado | OA — outro autenticado | EX — executor controlado |
| :-- | :-- | :-- | :-- | :-- |
| Interface sem dados / início de login | Permitir | Permitir | Permitir, sem dados | Não é usuário da interface |
| Ler versão publicada, focos, municípios, cobertura e proveniência sanitizada | Negar | Permitir | Negar | Somente o necessário à carga/validação |
| Ler carga parcial ou segredos | Negar | Negar | Negar | Apenas o necessário à própria operação; sem saída de segredo |
| Inserir/corrigir/publicar/expirar conjunto de dados | Negar | Negar escrita direta | Negar | Permitir dentro do protocolo e recorte |
| Alterar autorização, schema ou grants | Negar | Negar pela aplicação | Negar | Negar; administração externa separada |

O aceite da ideação cobre o resumo RP lê / AN e OA não leem / EX escreve; as linhas e mecanismos detalhados acima dependem da revisão e da aprovação posterior deste plano. Login Google não basta para tornar uma conta RP. Testar a matriz pela API/SQL direta e interface; views/RPC não podem contornar o controle. Cadastro/revogação do UUID do RP é ação humana externa do responsável, conforme tabela do item 5, sem identidade real nas evidências versionadas.

### Direção visual proposta

O pedido humano de usar `local/prototipo` como inspiração foi registrado na ideação **antes** da inspeção, como exceção restrita à proibição geral de leitura desse diretório. A síntese abaixo incorpora o complemento humano da v2; implementar/revisar não depende de acessar o material privado:

- **Mobile first:** desenhar a base dos componentes para telas pequenas, com CSS progressivamente ampliado conforme o espaço disponível. Login, filtros, resumos, detalhes, mensagens, legenda e proveniência devem ser operáveis em celular. Priorizar conteúdo em uma coluna; filtros e cartões quebram linha, e detalhes ficam no fluxo da página, sem painel lateral fixo que reduza a área útil. Não reduzir fontes para acomodar o arranjo desktop.
- **Mapa e desktop:** conservar mapa de fundo verde escuro `#152e27` e consulta no celular, com controles próprios para toque e sem bloquear a rolagem normal da página. Em telas largas, ampliar mapa e posicionar detalhes/proveniência ao lado. A natureza bidimensional não dispensa adaptação dos controles/demais componentes. Mapa/tabela podem ter navegação em duas dimensões na própria região; sem rolagem horizontal global ou informação essencial oculta. Tabela/lista oferece consulta equivalente aos registros; a legenda informa eventual simplificação de exibição.
- **Estrutura e identidade:** preservar fundo claro levemente esverdeado (`#f5f6f2`), superfícies brancas, texto verde profundo (`#243c31`), identidade em verde (`#254b39`), cartões com bordas suaves, cantos discretos e sombras leves. Cabeçalho, sessão, filtros, resumos e mapa mantêm hierarquia clara. Navegação só para destinos reais do recorte, sem botões demonstrativos sem ação.
- **Tipografia:** usar fontes de sistema (`Segoe UI`, Arial, sans-serif), unidades relativas e escala que respeite preferências do navegador. Adotar texto-base de `1rem` (16 px na configuração padrão), entrelinha aproximada de 1,5 e piso de `0.875rem` (14 px no padrão) para textos informativos auxiliares, tags, rótulos, legenda e atribuição. Nomes dos municípios têm pelo menos `1rem`; etiquetas abaixo deles, citadas pelo responsável, têm pelo menos `0.875rem`, peso legível, bom contraste, espaçamento e quebra de linha. Esses tamanhos são critérios locais do projeto, não mínimos de fonte definidos pela WCAG. Não esconder/truncar conteúdo necessário para simular legibilidade.
- **Cor de destaque:** propor azul royal `#1d4ed8` para ação primária, seleção e interação. A distinção primária não depende de comparar matizes azul/verde: **ação primária tem preenchimento sólido, texto branco e verbo explícito (por exemplo, "Consultar"); secundárias têm superfície clara, contorno e rótulo próprio**. Verde fica na identidade e elementos de contexto, sem outro botão preenchido concorrendo no mesmo grupo. Sobre o mapa `#152e27`, foco/seleção usa azul claro `#93c5fd` com contorno reforçado e rótulo/indicador de seleção. Laranja representa detecção, não ação genérica. Verificar essa diferença estrutural em cinza, sem alegar que os tons azul/verde isolados se distinguem bem por luminância.
- **Contraste e significado:** exigir pelo menos 4,5:1 nos textos informativos e 3:1 nas pistas visuais necessárias para identificar controles/estados contra cores adjacentes; verificar os pares reais de cada estado e superfície, incluindo tags, hover, foco e seleção. Não depender só de matiz para distinguir estado: acrescentar rótulo, ícone, contorno ou padrão. A legibilidade e a distinção visual da ação primária devem ser verificadas também em escala de cinza. As cores propostas são ponto de partida; passar um cálculo isolado não certifica toda a interface.
- **Interação e ampliação:** adotar alvos de toque de pelo menos 44 × 44 CSS px nos controles como critério local de conforto, sem aplicar esse tamanho a cada ponto cartográfico. Preservar teclado, foco visível, rótulos de formulário, erro associado ao campo e movimento reduzido. Testar ampliação do texto a 200% sem perda de conteúdo/funcionalidade e reflow dos componentes comuns a 320 CSS px. Não limitar zoom do navegador; o zoom do mapa é recurso distinto.
- **Conteúdo real:** mapa destacado, pontos laranja e limites municipais discretos, com legenda textual, fontes e indicação inequívoca de período/versão. Não reproduzir ranking, badges de áreas protegidas, favoritos, exportação, percentuais inventados, estatística ilustrativa ou marca de cobertura plena do mockup. Vazio, indeterminado e falha de atualização são estados distintos.
- **Conferência visual:** usar fixtures fictícias em 360/390 px primeiro, depois 768/1440 px; conferir também texto ampliado, reflow, toque e teclado. Material privado não vira screenshot ou baseline versionado. As referências W3C de contraste, ampliação e reflow estão na seção de referências; estes critérios não equivalem a declarar conformidade integral com WCAG.

São diretrizes deste protótipo, não um design system definitivo. A entrega 4 documenta os componentes efetivamente implementados; preferência estética não substitui aceite funcional, G1 ou G2.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — "autorizo o rascunho do plano do ciclo 003" | Ideação, escolhas humanas registradas e autorização já recebida | Este rascunho local, reconciliação da ideação e registro do ciclo | Revisão, aprovação, issues, implementação e publicação | R1/S1/12 meses/I1/T1, matriz, inspiração visual delimitada e condicionantes |
| Aprovar plano — "aprovo o plano do ciclo 003" | Revisão formal com veredito apto e manifestação humana posterior | Plano revisado, publicação da PR documental; issues após integração documental e confirmação dos payloads; encerramento após entregas | Implementação das issues, merge, configuração/aceite externo e verificação em produção | Ressalvas, cinco itens, orçamento zero sem garantia de capacidade, fontes/método, acesso e dependências de ambiente |
| Aprovar merge — "aprovo o merge da PR #N" | PR concreta, checks verdes no último commit e diff conferido | Somente merge daquela PR, por squash | Outras PRs, conta externa, deploy e nova entrega | Lote documental ou issue correspondente, privacidade, G1–G4, checks e estado real |
| Autorizar implementação — "autorizo a implementação da issue #N" | Plano aprovado/integrado, issue válida e dependências integradas | Implementação/testes e preparação/publicação da PR delimitada. No item 5, agente prepara o roteiro e, somente após PR técnica integrada e ações externas conferidas, faz dry-run e carga/publicação pelo EX para o alvo/manifesto/janela previstos, conforme tabela específica | Merge, atos administrativos reservados ao responsável (DDL hospedado, contas, OAuth, EX/segredos e cadastro RP), cobrança, expansão de escopo ou verificação em produção sem sua frase | Escopo, credencial EX limitada, alvo/manifesto, gates e separação entre administração humana e carga de dados |
| Ação humana externa — "concluí a ação externa da issue #N" | Roteiro concreto preparado na task dos itens 2 ou 5; no item 5, PR técnica integrada antes de efeitos remotos | Retorno do responsável sobre atos que ele próprio executa: ambiente e, no item 5, contas/configuração, migrações hospedadas, provisionamento de EX, deploy, primeiro login e cadastro RP, na ordem da tabela. Confirmar etapa executada sem segredo/UUID real no registro | Não autoriza agente a usar credencial administrativa ou repetir esses atos; não comprova automaticamente elegibilidade nem substitui merge ou autorização de verificação em produção | Evidências sanitizadas por etapa, histórico de migrações, alvo/commit, flags de privilégio, conta autorizada e acesso EX disponível só no ambiente controlado |
| Verificar produção — "autorizo a verificação em produção do ciclo 003" | Entregas técnicas integradas, ações externas conferidas, gates locais de método/acesso/capacidade aprovados e deploy identificado por commit | Login e consultas delimitadas, conferência de acesso e consumo no destino real | Carga/expurgo destrutivo de teste, migração nova, gasto ou mudança de método | Versão/carga, total de referência, privacidade do bundle, login RP, bloqueio de AN/OA e orçamento disponível |

Cada PR, inclusive a documental e a de encerramento, exige aprovação própria de merge. No ciclo completo não há modo contínuo. Qualquer dúvida material de método/privacidade, falta de evidência, ambiguidade de fronteira, fonte incompatível, limite excedido ou exigência financeira leva a `Parado` antes do efeito afetado, com sugestão e alternativas para decisão humana. A concessão não dispensa a conferência da precondição.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Contrato explícito, proveniência/hash, casos independentes de território/fuso/contagem, referência de Colniza quando comparável, divergências e cobertura declaradas. Nenhum empate, tolerância ou regra ambiental é escolhido implicitamente. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Matriz AN/RP/OA/EX, RLS em toda tabela `public`, grants e funções auditados; positivos/negativos pela interface e acesso direto, revogação e privilégio mínimo do executor. |
| G3 — privacidade de dados | Sim | Somente fontes públicas classificadas; fixtures fictícias; segredos/identidades fora de Git, bundle e logs; `local/` excluído do Git/upload/build e referência visual reduzida a diretrizes sanitizadas. |
| G4 — migrações só acrescentam | Sim | Novos arquivos `supabase/migrations/AAAAMMDDHHMMSS_assunto.sql`; migração versionada imutável. Correções posteriores por nova migração e CI existente de enforcement. |

## Estratégia de testes

- **Nesta redação:** testes e validador de governança, `git diff --check`, revisão do diff, referências, G3, autoria das escolhas e coerência dos estados. Não executar aplicação, ingestão, banco, conta, benchmark ou deploy para redigir o plano.
- **Método:** `node:test` com fixtures fictícias e valores esperados independentes: dentro/fora/borda/buraco/MultiPolygon, divisa ambígua, código INPE divergente, coordenada inválida, repetição legítima de linha e `id_fonte` repetido/vazio/coluna ausente. Para disponibilidade, testar aviso parcial X/Y/Z, área não delimitada, aviso externo, ausência de aviso em histórico verificado, histórico ausente/parcial e precedência das três classes. Para tempo, testar cortes diários GMT, limites inclusivo/exclusivo, virada mensal/ano bissexto e exemplo `100 − 3 + 5 = 102`; envelope persistido participa somente da sensibilidade. Resultados de produção não fabricam seus valores esperados.
- **Referência pública:** na entrega 1, se os mesmos hashes e recorte de Colniza do ciclo `001` forem obtidos, exigir 516/246/62 e total 824. Hash/revisão diferente exige explicar a mudança e validar contra referência independente compatível; não editar resultado esperado só para passar. Contagens estaduais/municipais da janela devem concordar com uma agregação independente sobre os registros classificados, sob o mesmo contrato e sem extrapolação municipal. Essa conferência de totais não valida espacialmente todos os pontos: a evidência espacial permanece delimitada pelos casos independentes e pelo recorte público comparável.
- **Banco e autorização:** aplicar migrações do zero em Supabase local, gerar UUIDs fictícios RP/OA no mesmo papel `authenticated` e testar negação antes de cadastrar RP, permissão após cadastro administrativo e nova negação após revogação. Testar AN/EX, RLS por tabela, RPC/views, carga parcial, token ausente/expirado e metadado adulterado. Negativos não devolvem linhas/bytes indevidos nem alteram estado; EX não muda schema, grants ou lista RP. Consultas persistem/filtram escopo principal/envelope e disponibilidade municipal, sem contaminar total GMT.
- **Pipeline e recuperação:** mesma carga duas vezes, concorrência, falha antes/durante/depois do commit, correção de fonte, expiração e reconstrução local nova. Testar lotes repetidos/checkpoints somente se a medição exigir tais mecanismos. Manifesto, registros principais/envelope, disponibilidade e totais restaurados coincidem com referência externa ao mecanismo. Testes destrutivos só no ambiente isolado.
- **Interface:** typecheck/build; Playwright local com fixtures e Auth local: login/negação/logout, filtros, paginação, mapa/tabela, respostas fora de ordem, troca de versão, vazio e falha. Exigir filtros/dias rotulados GMT, campo separado de sensibilidade Cuiabá por consulta, diferença `+2` no caso 100/102, envelope excluído do principal e três classes municipais com motivo/histórico e "cobertura não comprovada". Validar 360/390 px com toque, depois 768/1440 px; medir carregamento da geometria e conferir aviso de simplificação quando aplicável. Conferir fontes/tags, contraste, diferenciação não cromática de ação primária/seleção em cinza, teclado/foco, texto a 200% e reflow comum a 320 CSS px sem cortes/rolagem horizontal global. Exceção bidimensional só no mapa/tabela. Sem snapshot privado nem alegação de teste de interface nesta correção documental.
- **Gates a adicionar na implementação:** comandos de aplicação propostos `npm run typecheck`, `npm run build`, `npm run test:prototipo`, `npm run test:rls` e `npm run test:e2e`, documentados ao criá-los; hoje não existem. Preservar `npm run test:prova-dados` e gates de governança. CI executa testes determinísticos com fixtures e banco isolado; download estadual, login pessoal e segredo de produção ficam fora da CI.
- **Produção:** somente após a frase própria, executar roteiro sanitizado do item 5. Não alegar Google OAuth real, capacidade estadual, exclusão de upload ou retomada real de pausa por terem passado testes locais.

## Itens de implementação

### Item 1 — Implementar o recorte local e medir os 12 meses de Mato Grosso

**Contexto:** PF1 e as incógnitas de volume/método precisam de resultado executável antes de qualquer carga hospedada.

**Ação técnica:** criar a CLI local em `scripts/prototipo/`, com modo de obtenção/processamento e dry-run sem banco remoto. Reutilizar componentes válidos de `scripts/prova-dados/` sem modificar silenciosamente as decisões da prova. Descobrir/fixar janela, fontes mensais e envelope temporal, malhas/metadados e avisos oficiais; conferir condições de uso. Gravar brutos e resultados em `local/dados-prototipo/`, com checksums e manifestos, sem credenciais. Versionar apenas contrato, código, fixtures e relatório sanitizado de medição. Criar KB do método usando o template no ponto de uso.

**Critérios de aceite:**

- [ ] Janela, conjunto S1, municípios/malha/revisão/CRS e fontes de fronteira explícitos, com URLs sem segredo, SHA-256, bytes, data e condições de uso.
- [ ] Processamento em streaming recorta MT pela geometria e relata divergências; rejeita arquivo incompatível/linha inválida sem declarar carga válida silenciosamente. Eventual ambiguidade material é apresentada para decisão antes de publicar.
- [ ] Casos independentes de G1 passam; referência pública comparável e contagens estaduais/municipais reconciliadas; cobertura e sensibilidade não são inferidas de ausência de registros.
- [ ] Produzir disponibilidade por dia GMT × satélite × município com as três classes/motivos, alcance do histórico e validação humana de avisos ambíguos. Fixtures de área parcial X/Y/Z, aviso sem área, histórico ausente e precedência passam; histórico indisponível mantém contagens com limitação explícita, não dias supostamente cobertos.
- [ ] Produzir registros da janela principal e envelope identificados separadamente, preservando `id_fonte` e relatório de repetidos/ausentes. Caso 100 GMT/102 Cuiabá confere, com envelope fora da contagem principal; fonte de fronteira e completude comprovadas para suportar consulta por período.
- [ ] Separar malha integral de classificação e geometria de exibição; medir ambas por município e conjunto, com proveniência/representação e parâmetros declarados, sem extrapolação a partir de Colniza.
- [ ] Medição da janela completa, não só amostra: linhas lidas/persistíveis/excluídas, bytes, tempo, memória/pico de disco local e tamanhos do resultado. Separar obtenção, classificação e agregação; não estimar banco como se já estivesse medido.
- [ ] Dry-run não escreve em provedor; nenhuma fonte bruta ou identidade privada entra na PR. Relatório aponta o que a entrega 2/3 ainda deverá medir com schema real.

### Item 2 — Fundar o banco local, o contrato de consulta e as políticas de acesso

**Contexto:** PF3 exige provar autorização além do login; o volume da entrega 1 permite desenhar o menor schema compatível.

**Ação técnica:** conferir ambiente gratuito de testes, versões/licenças e recursos. Preparar roteiro para o responsável disponibilizar CLI Supabase e runtime compatível com Docker caso ausentes; não iniciar instalação privilegiada/contratação por inferência. Criar configuração local, migrações aditivas, entidades/índices do contrato e consultas/RPC paginadas e limitadas por versão/período. Implementar lista administrativa privada, helper restrito se necessário, policies e papel EX dedicado. Preparar configuração Google e variáveis de exemplo sem valores reais; provedor hospedado só na entrega 5. Registrar decisão técnica em ADR, lendo o template e a numeração real ao criá-lo.

**Critérios de aceite:**

- [ ] Schema criado do zero, toda tabela `public` com RLS, grants sem acesso excessivo e funções/views auditadas. Migrações não contêm identificador real do responsável ou senha.
- [ ] Matriz completa AN/RP/OA/EX passa em dados fictícios por API e SQL; revogação efetiva impede nova consulta e nenhuma escrita/alteração de autorização é permitida à aplicação comum ou ao papel EX fora de sua atribuição.
- [ ] Consultas retornam totais exatos fora da paginação, versões fixadas, erros de período/parâmetro explícitos e limites técnicos de resposta; carga parcial não é legível.
- [ ] Schema preserva `id_fonte` sem restrição de unicidade indevida, escopo principal/envelope e disponibilidade por dia GMT × satélite × município, com classe/motivo/histórico. Contrato de consulta entrega total GMT e sensibilidade Cuiabá por intervalo com mesma versão; mapa/tabela/séries principais excluem envelope, inclusive na fronteira final.
- [ ] Testar com UUIDs fictícios a sequência primeiro login sem autorização → cadastro administrativo → leitura RP → revogação, sem autorizar por e-mail ou metadado editável. Papel EX e políticas estruturais são definidos em migrações; segredos reais e cadastro do RP hospedado são ações do responsável, conforme item 5.
- [ ] Integração local testa troca de versão sem misturar resultados e mede banco/índices base. Nenhum serviço hospedado é necessário para passar estes testes.
- [ ] Roteiro de ambiente, decisão arquitetural, matriz e comandos de verificação documentados; se o runtime não puder ser disponibilizado gratuitamente, situação `Parado` com alternativas, sem dispensar os testes de G2.

### Item 3 — Publicar versões de dados com idempotência e comprovar capacidade/recuperação

**Contexto:** PF2/PF4 devem demonstrar a operação completa do executor I1 no schema real antes da nuvem.

**Ação técnica:** implementar `plan`/`apply` da CLI para banco alvo explícito, com EX e reconciliação após resposta ambígua de commit. Identidade da carga deriva do manifesto canônico (fontes/versões, janela e método), sem timestamp como identidade. **Avaliar primeiro uma única transação no mesmo cliente `pg`**, com identidade única e controle transacional de concorrência. Só introduzir lotes, staging persistente, checkpoints ou trava adicional se tempo/memória/volume medidos no item 1 e no schema real demonstrarem necessidade; registrar a justificativa, preservando as mesmas garantias. Medir com resultado integral a operação e pico de versão vigente + nova carga + retenção efetiva + índices/temporários, incluindo envelope e geometria de exibição, e reconstruir a partir de migrações/cópias com hash. Expiração de dados não edita migrações (G4).

**Critérios de aceite:**

- [ ] Reexecução não duplica linhas/publicação; falhas preservam a última versão íntegra; consultas não observam preparação. Correção de fonte e mudança da janela produzem versão nova verificável.
- [ ] Mecanismo escolhido justificado pela medição: uma transação é aceita se satisfizer limites e garantias; lote/checkpoint/trava adicional só entra com necessidade demonstrada. Testes de idempotência, concorrência e falhas antes/durante/depois do commit passam em qualquer opção, sem exigir infraestrutura especulativa.
- [ ] Concorrência e falha após commit são reconciliadas pela identidade da carga, sem `force`, limpeza destrutiva ou publicação duplicada.
- [ ] Medição integral de banco/dados/índices, disco/WAL/temporários, tráfego por operação, requests e duração da carga/consultas/reconstrução, com ferramentas/versões e tamanhos de resposta registrados. Não confundir banco lógico com disco, nem saldos cached/uncached.
- [ ] Medir separadamente geometria integral local, geometria publicada e respostas de mapa: bytes por município/conjunto, bytes transferidos, requests e efeito no egress. Incluir envelope temporal e disponibilidade municipal no tamanho persistido; esses dados não são "overhead zero".
- [ ] Antes de carga hospedada, o plano da operação inclui consumo existente e pico previsto. **Acima de 400.000.000 bytes de banco**, ou com estimativa insuficiente para provar margem, parar; igualdade é teto e não elimina conferência das demais cotas. Conferir também disco, egress, conta/organização, CI e recursos Vercel, sem somar franquias diferentes.
- [ ] Reconstrução em banco local novo reproduz manifesto, registros e totais; testar perda de conexão/indisponibilidade e retomada. Registrar duração e dependência do operador, sem prometer RPO/RTO de contas, segredos ou autenticação que não foram restaurados. Guardar fontes fixadas localmente; não depender de URL futura manter o mesmo conteúdo.
- [ ] Runbook de atualização, cópia local, expiração, recuperação e rotação de EX, com procedimento seguro de rollback de dados; nenhum teste destrutivo executado em produção.

### Item 4 — Entregar a interface de consulta com o estilo de referência

**Contexto:** R1 precisa de uso real e explicação do resultado, preservando a direção estética aceita e os pedidos posteriores de mobile first, tipografia visível e destaque cromático distinto.

**Ação técnica:** adicionar aplicação Vite/TypeScript, estilos próprios, SDK Supabase e Leaflet estável, lockfile e build. Construir componentes a partir do layout para celular e ampliar progressivamente para desktop, onde o mapa pode ocupar mais espaço. Aplicar escala tipográfica relativa legível e papéis de cor separados conforme a direção visual. Implementar início/callback de login Google, acesso autorizado, logout e estados de sessão. Integrar filtros município/datas, mapa, série temporal, tabela paginada, divergências, disponibilidade e proveniência, fixando versão e descartando respostas obsoletas. Usar somente fontes/API autorizadas; sem chave privilegiada, tiles, fonte web, analytics ou outro serviço adicional. Separar módulos de sessão, consulta, mapa e apresentação sem criar biblioteca genérica de componentes. Documentar as diretrizes implementadas no guia da interface do runbook, sem instituir design system ou contrato visual canônico neste ciclo.

**Critérios de aceite:**

- [ ] Componentes partem do layout mobile first e funcionam em 360/390 px com toque e em 768/1440 px com espaço progressivo para mapa/detalhes; filtros, resumos, legenda e proveniência acessíveis sem reduzir fontes ou exigir rolagem horizontal global. Comparação visual feita com fixtures fictícias e evidência sanitizada.
- [ ] Texto-base de `1rem`, nomes de municípios de pelo menos `1rem` e tags/rótulos/legendas informativos de pelo menos `0.875rem`, respeitando o tamanho padrão do navegador. Etiquetas abaixo do município têm contraste, espaçamento e quebra de linha adequados. Ampliação a 200% e reflow dos componentes comuns a 320 CSS px não cortam conteúdo nem perdem funcionalidade.
- [ ] Ação primária preenchida com verbo/texto branco e secundárias claras com contorno/rótulo permanecem distinguíveis em escala de cinza, sem depender do contraste azul/verde. Seleção no mapa `#152e27` tem contorno reforçado/indicador além do azul claro. Textos informativos atingem 4,5:1 e pistas necessárias de controles/estados atingem 3:1 contra superfícies efetivas; controles têm alvo de 44 × 44 CSS px e foco/teclado. Exceção bidimensional só no mapa/tabela.
- [ ] Fluxo de sessão e consulta funciona com Auth local; Google real permanece para o roteiro externo do item 5. AN/OA não recebem dados mesmo chamando diretamente a API.
- [ ] Logout, revogação ou expiração limpam os dados da sessão na interface; respostas atrasadas de RP não repovoam a tela de AN/OA. Dados de consulta não ficam em armazenamento persistente/cache público, e valores de fonte são renderizados como texto, sem execução de marcação.
- [ ] Mapa, totais, série e tabela correspondem à mesma versão/período; paginação/limite de pontos não muda totais nem oculta truncamento. Município é listado sem ranking ambiental.
- [ ] Datas dos filtros, dias da série, mapa/tabela e total principal identificam GMT. Cada consulta apresenta contagem Cuiabá e diferença em campo separado, com limites/versão; fixture 100/102 resulta em `+2`, sem incluir os 5 registros do envelope no principal. Não aceitar a entrega omitindo a sensibilidade; fonte de fronteira incompleta é pendência explícita, sem valor parcial rotulado como completo.
- [ ] Exibir classes municipais de disponibilidade com motivo, histórico e aviso "cobertura não comprovada"; distinguir dia sem aviso incidente em histórico verificado de dia com histórico ausente. Fixture X/Y/Z e ausência de histórico correspondem ao protocolo D1, sem homogeneizar MT.
- [ ] Medir tempo de primeira exibição/navegação da geometria em celular, com perfil de rede/dispositivo, bytes transferidos e número de requests; justificar representação/carregamento escolhidos. Se houver simplificação, legenda declara uso apenas visual e possível aparência divergente perto de divisas; cálculo territorial permanece integral.
- [ ] Zero, fonte indisponível, cobertura indeterminada, acesso negado, sessão expirada e última atualização são estados distintos e testados; não há dado ilustrativo em caminho de produção.
- [ ] Aviso de domínio, método, fuso, fontes/versões e limitações acessíveis ao usuário; navegação por teclado e tabela como alternativa ao mapa. Sem recursos demonstrativos fora do recorte.
- [ ] Typecheck, build, testes/E2E e gates existentes passam; bundle e upload preparado inspecionados, sem `local/`, credenciais, contas reais ou dados territoriais embutidos. Acrescentar exclusão de `dist/` ao Git ao introduzir o build.

### Item 5 — Preparar a operação gratuita, implantar e verificar o protótipo

**Contexto:** PF5, Google real, upload/deploy e quotas disponíveis não são comprovados pelos testes locais.

**Ação técnica:** preparar roteiro concreto de configuração e retorno para o responsável, arquivo de implantação estática, variáveis públicas/privadas separadas e checklist operacional delimitado ao destino. Conferir documentação/conta para finalidade real, elegibilidade Hobby, disponibilidade Free e saldos compartilhados, inclusive ferramentas locais/CI. **O aceite das sugestões não comprova que o uso é pessoal não comercial.** Essa confirmação factual é condição anterior a configurar o destino; se a finalidade for incompatível, parar com opções para decisão, sem contratar plano ou trocar requisito.

O agente prepara/testa localmente migrações, scripts, roteiro e configuração estática; **integrar a PR técnica antes dos efeitos remotos abaixo**. Atos administrativos são do responsável, sem entrega da credencial de proprietário ao agente. A carga de dados é a única mutação hospedada executada pelo agente, com EX e dentro do escopo delimitado. Previews permanecem isolados/fictícios.

#### Item 5 — operações remotas, credenciais e ordem

| Operação / ordem | Quem executa | Frase / limite de autorização e retorno | Credencial e guarda | Ponto de parada / evidência |
| :-- | :-- | :-- | :-- | :-- |
| 1. Criar/selecionar contas/projetos gratuitos e conferir finalidade, quotas e destino | Responsável | Ação humana externa do item 5, após plano/issue autorizados e PR técnica integrada; confirma "concluí a ação externa da issue #N", identificando a etapa | Contas Google/Supabase/Vercel sob controle do responsável; segredos só nos locais próprios | Elegibilidade não confirmada, cobrança/trial/cartão, alvo ocupado/incompatível ou cota insuficiente → parar; síntese sanitizada da conferência |
| 2. Aplicar migrações e criar papel EX/grants no banco hospedado | Responsável | Executa o roteiro administrativo sobre **arquivos integrados**; a autorização de implementação do agente não cobre este ato humano; mesmo retorno de ação externa por etapa | Credencial administrativa/proprietário e eventual token CLI guardados pelo responsável, usados só em sessão/ferramenta administrativa privada. Nunca recebidos pelo agente, Vercel ou CI | Conferir projeto, histórico e dry-run antes. Divergência, DDL fora da migração ou necessidade de reset/repair destrutivo → parar. Registrar versões aplicadas e flags de privilégio, sem segredo |
| 3. Definir/rotacionar a senha de EX | Responsável | Ação externa; provisionamento inicial no roteiro do item 5. Rotação em resposta a incidente exige roteiro/ação externa próprios, não retry automático do agente | Papel/LOGIN/grants estruturais vêm de migração sem senha; responsável define senha por entrada segura em sessão administrativa e a guarda em cofre/ambiente local ignorado. Ao agente fica disponível **somente EX**, via ambiente do processo local; sem segredo em argumento, chat, Git ou log | Confirmar EX não proprietário, sem BYPASSRLS/DDL/acesso à lista RP. Se só houver credencial administrativa disponível, parar; nunca usá-la como substituta |
| 4. Implantar commit integrado e configurar Vercel, Supabase Auth e Google OAuth | Responsável | Ação externa após merge aprovado da PR técnica; confirma etapa/deploy | Login nos painéis; segredo OAuth fica no provedor/Supabase Auth, variáveis Vercel do cliente só URL/chave publicável. EX e credencial administrativa não vão à Vercel | URLs/callbacks exatos, escopos mínimos de login, commit identificado, preview isolado e exclusão de `local/`; configuração incompatível ou custo → parar |
| 5. Fazer primeiro login Google no projeto alvo | Responsável | Ação externa de inicialização, anterior ao cadastro na lista privada; ainda não é a verificação operacional em produção | Sessão Google/Supabase no navegador do responsável; Auth cria/reconhece seu `auth.users.id`. Sessão não vira token em log/chat | Login pode funcionar, mas leitura de dados deve ser negada até o cadastro. Se houver acesso indevido, parar e corrigir pelo fluxo autorizado |
| 6. Cadastrar o UUID do RP na lista privada | Responsável | Ação externa administrativa após conferir sua própria identidade/provedor no Auth; não delegada ao EX/agente | Administração do banco/painel sob controle do responsável; UUID real só na lista privada e no ambiente necessário, sem seed/migração/issue/log reais | Conferir que o UUID pertence ao projeto/conta correta e que OA continua ausente; registrar resultado sem UUID/e-mail. Troca/revogação posterior é administração externa separada |
| 7. Dry-run e carga/publicação inicial do manifesto aprovado | Agente, por CLI local com EX | "autorizo a implementação da issue #N" do **item 5**, registrada na task, cobre esta operação somente após etapas 1–6 conferidas e PR técnica integrada. Alvo, hashes/versão, janela, volume e orçamento vêm das entregas integradas e são fixados no plano da carga | Apenas credencial EX por ambiente local privado do processo; nunca proprietário/service_role. Confirmar papel/alvo sem imprimir conexão/segredo | Conferir gates, privilégios, versão e consumo antes/durante. Escopo/cota duvidoso → parar. Reconciliação só da mesma identidade de publicação; não autoriza reset, ensaio destrutivo ou expurgo genérico em produção |

Ordem canônica: **PR técnica integrada → contas/elegibilidade → migrações e EX → deploy/configuração Google → primeiro login ainda sem dados → cadastro administrativo do UUID → conferência das ações externas → carga EX → autorização de verificação em produção**. A frase de retorno externo confirma o que o responsável fez, não delega os atos ao agente. O agente confere por leitura o que estiver acessível e registra limitações de evidência; nunca pede senha administrativa para preencher uma lacuna. Depois da carga, pedir "autorizo a verificação em produção do ciclo 003" e executar somente o roteiro de login/consultas previsto.

**Critérios de aceite:**

- [ ] Finalidade/contas/licenças e cotas realmente disponíveis conferidas, sem cartão, gasto ou trial; configuração externa confirmada e verificável sem registrar segredos. Não alegar custo zero de energia/internet/hardware do operador.
- [ ] Cada mutação remota tem executor/credencial/retorno delimitados na tabela. Task registra commit/arquivos integrados, etapas externas conferidas, alvo/manifesto da carga e autorização da issue antes da execução EX. Primeiro login sem autorização precede cadastro do UUID; não se usa e-mail como chave nem credencial administrativa no agente.
- [ ] Banco real tem migrações esperadas/RLS e somente carga íntegra dentro do orçamento. Conferir o consumo antes e durante cada etapa; interromper antes de exceder margem/cota e manter publicação anterior.
- [ ] URL/commit de deploy e versão da carga identificados em evidência sanitizada; upload exclui materiais privados e bundle não contém dados/credenciais. Cache da aplicação não compartilha respostas ou sessão entre usuários.
- [ ] Google real permite o fluxo RP; AN é negado diretamente. OA é testado com identidade controlada em ambiente apropriado, sem conta/identificador em fixtures ou logs; bloqueio hospedado é conferido por sessão válida quando disponível, e limitação de teste é explicitada se faltar essa condição, sem declarar G2 comprovado no destino.
- [ ] Após autorização própria de produção, filtros, contagens comparáveis, mapa/tabela, proveniência e estados operacionais conferem no destino; nenhum ensaio de expurgo/falha destrutiva é feito nele.
- [ ] Responsável confere resultado, duração medida de carga/recuperação e operação manual, sem SLA prometido. Se a operação medida não servir ao uso real, registrar decisão antes de declarar entrega operacional.
- [ ] README, runbook e KB-003 atualizados com o que existe, limites medidos e o que não foi provado, incluindo pausa real não simulada na conta. Nenhuma alegação de disponibilidade contínua ou gratuidade incondicional.

## Arquivos afetados

Na criação da v1, somente este plano, a reconciliação das escolhas/autorizações na ideação e a linha de estado/plano em `_project/cycles.md`. No complemento v2 e na correção v3, somente este plano e a referência de versão/situação no registro de ciclos. A rodada 1 preexistente é preservada; nenhum arquivo do protótipo privado é alterado ou versionado.

Na execução proposta: `scripts/prototipo/`, `tests/fixtures/prototipo/`, `supabase/config.toml`, novas migrações em `supabase/migrations/`, testes em `supabase/tests/`, `src/`, `index.html`, configuração Vite/TypeScript/Playwright, `package.json`/lockfile, `.env.example`, `.gitignore`, `.vercelignore` e configuração de deploy/CI estritamente necessária. Documentação: README, runbook com guia da interface, novo ADR/KB usando numeração conferida ao criar, atualização de KB-003 e artefatos/evidências/tasks do ciclo. Brutos, medições detalhadas, cópias e screenshots de trabalho ficam em `local/dados-prototipo/`; fixtures versionadas são fictícias.

## Decomposição em issues e PRs

| Unidade planejada | Issue a criar após aprovação/integração documental | Dependência | PR / fechamento |
| :-- | :-- | :-- | :-- |
| Plano completo | Sem issue documental | Revisão e aprovação do plano | `chore/cycle-003-plan`; inclui ideação e registro do ciclo; merge próprio |
| Item 1 | `[FEATURE] Implementar recorte local e medir 12 meses de focos em MT` | Plano documental integrado e payload confirmado | Uma PR de implementação; encerra a issue após aceite e integração |
| Item 2 | `[FEATURE] Fundar banco e autorização RLS do protótipo` | Item 1 integrado; runtime local disponível | Uma PR; encerra após testes de banco/acesso e integração |
| Item 3 | `[FEATURE] Publicar cargas idempotentes e validar reconstrução` | Itens 1 e 2 integrados | Uma PR; encerra após prova local de capacidade/recuperação e integração |
| Item 4 | `[FEATURE] Implementar consulta territorial com interface autenticada` | Itens 1 a 3 integrados | Uma PR; encerra após testes locais/interface e integração |
| Item 5 | `[CHORE] Implantar e verificar o protótipo em operação gratuita` | Itens 1 a 4 integrados; gates de conta/capacidade | PR técnica usa `Refs #N`, pois integração não comprova deploy/produção; fechamento somente após ações externas/verificação |
| Encerramento | Sem nova issue | Todas as entregas integradas, ações externas e verificação concluídas | `chore/cycle-003-closure`; registra evidências finais do item 5, fecha sua issue se cabível e encerra prospectivamente o ciclo |

Os números não existem nesta etapa. Cada payload será apresentado e confirmado antes de criar issues. Uma branch por issue segue a convenção de `_project/README.md`, com task `003_task_issue-N.md` criada ao iniciar implementação. A exceção de rastreabilidade do item 5 é deliberada: a evidência posterior ao merge técnico entra na task e na PR de encerramento, sem issue recursiva nem fingir deploy no commit anterior. Cada merge depende de sua frase específica e checks verdes.

## Dependências e blockers

- **Para revisar o rascunho:** nenhum bloqueio de redação; escolhas humanas de produto/método registradas. Revisão formal pendente.
- **Antes do item 2 ser aceito:** disponibilizar ambiente local gratuito compatível com Supabase/contêineres, com memória/disco e licenças adequados. Ausência de ferramenta não dispensa o teste de banco nem permite substituí-lo por mocks.
- **Antes de carga hospedada:** fontes/contrato aprovados pelos testes, schema real medido, ausência de ambiguidade analítica material, idempotência, reconstrução e orçamento com margem. O limiar de 400 MB não cobre sozinho disco, CPU, egress, operação ou organização.
- **Antes de configurar/deployar serviços:** finalidade real e elegibilidade confirmadas, vagas/quotas das contas gratuitas verificadas, roteiro externo concluído, segredos guardados no local próprio e nenhuma dependência paga oculta. Sem finalidade confirmada, não presumir enquadramento comercial.
- **Antes de declarar operação:** evidência do deploy, Google real, matriz no destino, consumo e resultado conferidos sob autorização de produção; pendência não testada permanece explícita e impede alegação correspondente.

## Riscos, suposições e rollback

| Risco / hipótese ainda a provar | Tratamento e retorno seguro |
| :-- | :-- |
| S1/12 meses não cabe com margem, processamento local ou egress são excessivos | Medir conjunto completo e pico antes da nuvem; parar com alternativas de recorte e consequências para decisão humana. Não reduzir conjunto/janela ou contratar automaticamente. |
| Fonte/revisão mudou, município diverge ou fronteira é ambígua | Preservar fontes fixadas, referências independentes e versão anterior; explicar divergência. Regra nova/tolerância requer decisão, com exemplos numéricos. |
| Falha, concorrência ou resultado de commit desconhecido | Identidade única, controle transacional e reconciliação por manifesto; conservar publicação íntegra sem repetir ou apagar estado. Lotes/checkpoints/trava adicional só se a medição demonstrar necessidade. |
| Privilégio excessivo ou vazamento de sessão/cache | Bloquear entrega, corrigir grants/policies/cliente e repetir positivos/negativos. Revogar/rotacionar EX por administração separada. Nunca usar bypass como remendo para consulta. |
| Pausa Free, perda local ou fonte remota mutável | Runbook, cópia de insumos/manifestos, reconstrução testada localmente e duração declarada; operador retoma manualmente. Não prometer disponibilidade ou restauração de Auth/segredos por recarga de focos. |
| Estilo privado contém elementos inadequados ao recorte | Usar apenas diretrizes sanitizadas, dados fictícios nas validações e desenho novo; contraste/legibilidade prevalecem sobre reprodução literal. |
| Finalidade incompatível, cartão/trial ou cota indisponível | Parar antes de adesão/deploy e apresentar alternativas com recomendação; manter requisitos Vercel/Supabase/Google até decisão autorizada. |

Rollback de código usa o último commit/deploy conhecido e compatível com o schema. Rollback de dados seleciona versão íntegra retida após validar identidade/contrato e consumo; se ela não existir, reconstruir em alvo isolado antes de publicar. Não reverter removendo/editando migração versionada nem apagar produção para testar recuperação. Mudança de schema corretiva é migração nova. O rollback não concede autorização para efeito destrutivo.

## Sequência recomendada

1. Revisar formalmente este rascunho. Corrigir mediante autorização quando necessário; obter manifestação humana posterior a veredito apto.
2. Publicar PR documental, conferir checks, obter aprovação específica do merge e integrar. Apresentar/confirmar payloads; criar as cinco issues sem iniciar implementação implícita.
3. Autorizar e entregar o item 1; conferir método e medição local, integrar sua PR após aprovação.
4. Autorizar item 2, tratar eventual ação humana de ambiente, comprovar banco/RLS e integrar. Autorizar item 3, comprovar capacidade/publicação/recuperação local e integrar.
5. Autorizar item 4, implementar interface e estilo, verificar renderizações/fluxos e integrar sua PR.
6. Autorizar item 5 e preparar roteiro/artefatos localmente; integrar PR técnica com merge próprio antes dos efeitos remotos. Responsável executa as etapas administrativas na ordem da tabela: contas/elegibilidade, migrações/EX, deploy/OAuth, primeiro login sem dados e cadastro do UUID. Conferir retornos externos e recursos; então agente faz somente dry-run/carga inicial pelo EX, com alvo/manifesto/orçamento fixados.
7. Receber "autorizo a verificação em produção do ciclo 003"; executar somente o roteiro previsto. Registrar resultados reais e pendências, com aceite da operação medida pelo responsável.
8. Preparar encerramento prospectivo em PR própria: task de encerramento, evidências finais, documentação viva, plano concluído e movimento para `executed/`. Só declarar conclusão efetiva depois de conferir merge e checks no GitHub; cada integração exige aprovação específica.

## Referências

Fontes consultadas em 2026-11-05. Documentação de suporte não comprova configuração/capacidade da conta; conferir novamente as condições no ponto de execução. As escolhas técnicas acima são inferências/propostas locais a partir do recorte aceito, não recomendações aprovadas pelos provedores.

- `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, `.agent/workflows/rascunhar_plano.md` e `.agent/templates/plano_implementacao.md`, lidos no ponto de uso.
- Ideação `003`, ADR-002/003/004, KB-003; prova `001` em `_project/executed/001_prova_de_dados/001_research_viabilidade.md` e manifesto `scripts/prova-dados/fontes.json` (inclui fonte diária do envelope de fuso).
- Relatórios `002_research_cenarios.md`, `002_research_capacidades_custos.md` e `002_research_arquitetura.md` no ciclo `002` em `executed/`; sobretudo PF1–PF5 e limites da evidência.
- [Vite — guia e templates](https://vite.dev/guide/): build estático e TypeScript; não exige framework de interface. [Leaflet estável 1.9.4](https://leafletjs.com/reference-1.9.4.html): GeoJSON e renderização vetorial; não comprova desempenho da janela estadual.
- [Supabase — Google Auth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google): configuração de provedor e URLs. [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): identidade/políticas e risco de bypass. [Desenvolvimento local](https://supabase.com/docs/guides/local-development): CLI e runtime compatível.
- [node-postgres — transações](https://node-postgres.com/features/transactions): usar o mesmo cliente em cada transação, sem confundir operações independentes do pool.
- [Supabase — usuários e UUID](https://supabase.com/docs/guides/auth/users), [migrações hospedadas](https://supabase.com/docs/guides/deployment/database-migrations) e [papéis PostgreSQL](https://supabase.com/docs/guides/database/postgres/roles), relidos em 2026-11-05 na correção v3: identidade Auth e metadados, aplicação de migrações e credenciais de papéis. A atribuição de atos administrativos ao responsável e carga limitada ao EX é proposta local desta correção, não concessão de autorização pelos documentos.
- [Supabase Free](https://supabase.com/pricing): 500 MB de banco, cotas de egress e pausa após uma semana de inatividade; não prova saldo/margem desta conta. [Backups](https://supabase.com/docs/guides/platform/backups): recomenda exportação/cópia própria para Free. [Vercel Hobby](https://vercel.com/docs/plans/hobby): modalidade pessoal não comercial e recursos sujeitos a limites.
- [W3C — contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [contraste de controles/gráficos](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [ampliação de texto](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) e [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), consultados em 2026-11-05 no complemento v2: fundamentam os limiares de contraste e a verificação de ampliação/reflow. Pisos de fonte e alvos de toque de 44 px são decisões locais de conforto deste rascunho, sem alegação de certificação WCAG.
- Inspiração privada indicada pelo responsável: `local/prototipo`, somente CSS/estrutura visual, com autorização excepcional registrada antes da leitura. A implementação e a revisão são autossuficientes com a síntese deste plano; o material não é fonte de regra, dado ou código executável.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | —; cinco propostas, nenhuma criada |
| PR(s) | —; nenhuma publicação do ciclo `003` |
| Branch(es) | `chore/cycle-003-plan`, local, derivada da ideação em `23896d64d1724e8d62745f7b1a366f63d6a48b9b` |
| Destino após conclusão | `_project/executed/003_implementacao_prototipo/003_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 2) — ciclo 003 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 003"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + rascunhar_plano + 003_plan + v3@sha256:5646730cf671736add754f84edbed1f5c2417716a4397badf44a752b9d523f47`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` em `Em Revisão`, último veredito `REQUER NOVA RODADA`, situação `Aguardando correções (rodada 1)`, ciclo em `Planejamento`; branch `chore/cycle-003-plan` em `6fb4956304917fb27b36df2312cd83f395c5c23e`, com revisão preexistente ainda não commitada somente neste plano. A revisão é parte da fonte normalizada LF identificada pelo SHA-256 da logical_key, não conteúdo do commit citado.
- `state_after`: plano único `v3` em `Em Revisão`, rodada 1 e seu último veredito preservados; decisões humanas de disponibilidade/sensibilidade registradas; respostas do autor a R1-1–R1-8 e correções no contrato, itens, testes, ordem remota e direção visual; ciclo permanece em `Planejamento`, referência atualizada e situação `Aguardando revisão (rodada 2)`.
- `result`: `executed`
- `evidence`: autorização "corrija o plano do ciclo 003" e escolhas humanas D1/consulta Cuiabá em 2026-11-05; autoridades/template e fontes técnicas primárias conferidos; respostas e validação desta correção registradas abaixo. Nenhuma aprovação, issue, implementação, operação de banco ou publicação remota realizada por este workflow.
- `blockers`: nenhum para submeter a correção à rodada 2; os achados são respondidos pelo autor e ainda dependem de reavaliação formal. Precondições das entregas continuam pendentes de execução.

### Validação local da correção v3

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas. `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais; `git diff --check` sem erros.
- Rodada 1 preservada integralmente: SHA-256 com quebras normalizadas LF `ed4b8b54ec6afe9aef6a6304c038e88a7fbcd3ceeb4e1091b01bb9d1c64e2ef3`, idêntico antes/depois, com 12.710 caracteres. O registro preexistente do revisor permanece atribuído a Claude Code e é incorporado sem reescrita; respostas do autor estão em subseção própria.
- Conferência manual de autorização, escolhas D1/sensibilidade por consulta, G3, versão/situação e diff exclusivo do plano/registro de ciclos. Não houve leitura de material privado, acesso administrativo, operação de banco, criação de issue ou publicação remota nesta correção.
- Contraste azul `#1d4ed8`/verde `#254b39` recalculado: aproximadamente 1,46:1. A correção exige diferenciação por preenchimento/contorno/rótulo e não transforma esse par em contraste suficiente por matiz. Não houve renderização/teste da interface nesta etapa documental; rodada 2 pendente.

### Registro anterior — revisão da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + revisar_plano + 003_plan/rodada-1 + v2@6fb4956304917fb27b36df2312cd83f395c5c23e`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` em `Rascunho`, revisão formal `Pendente`, situação `Aguardando revisão (rodada 1)`; branch local `chore/cycle-003-plan` em `6fb4956`, árvore limpa; ciclo `003` em `Planejamento`.
- `state_after`: plano `v2` em `Em Revisão`, revisão formal `Em andamento`, veredito `REQUER NOVA RODADA`; rodada 1 registrada com três bloqueadores e cinco ressalvas; situação `Aguardando correções (rodada 1)`. Conteúdo do plano, ideação e `cycles.md` não alterados pelo revisor.
- `result`: `executed`
- `evidence`: autoridades, workflow `revisar_plano`, template `plano_implementacao`, ideação, ADR-002/003, KB-003, relatórios `001_research_viabilidade.md` e `002_research_arquitetura.md`, `scripts/prova-dados/cobertura.mjs`, `focos.mjs` e `fontes.json` lidos; fatos conferidos por inspeção somente leitura (Git local e `gh`); validação registrada na rodada.
- `blockers`: R1-1, R1-2 e R1-3 (bloqueadores da rodada 1).

### Registro anterior — complemento v2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + rascunhar_plano + 003_plan + v2@ec1f66e5681d52e64188ec5e0b9018a507f76087`
- `effect_class`: `local_mutation`
- `state_before`: plano único `v1` em `Rascunho`, ciclo `003` em `Planejamento`, aguardando rodada 1, branch local `chore/cycle-003-plan` em `ec1f66e`, árvore limpa e sem rodada formal registrada.
- `state_after`: o mesmo plano em `v2`, ainda `Rascunho` e aguardando rodada 1; complemento humano registrado, com mobile first, tipografia legível e cor de destaque distinta na direção visual, testes e aceite do item 4. Referência de versão em `cycles.md` atualizada; demais entregas, método e acesso preservados.
- `result`: `executed`
- `evidence`: pedido humano complementar de 2026-11-05 sintetizado no cabeçalho, autoridades/template lidos e diff documental limitado ao plano/registro. Fontes primárias W3C conferidas; cálculo de contraste dos pares propostos registrado na validação v2. Não houve nova inspeção do mockup privado, implementação de interface, revisão formal, configuração de serviço ou publicação remota.
- `blockers`: nenhum para este complemento; revisão formal pendente. Renderizações, testes de interação e contraste da interface efetiva pertencem à entrega 4 e não foram executados nesta etapa.

### Validação local do complemento v2

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas. `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais; `git diff --check` sem erros.
- Diff conferido, restrito a este plano e à versão em `_project/cycles.md`; pedido humano, G3, preservação do histórico v1 e situação de revisão pendente conferidos. Alteração somente documental, sem testes de interface ou publicação remota.
- Pares calculados pela luminância relativa sRGB: azul `#1d4ed8`/branco `#ffffff` = aproximadamente 6,70:1; azul/`#f5f6f2` = 6,17:1; azul claro `#93c5fd`/mapa escuro proposto `#152e27` = 8,02:1. Esses cálculos não verificam uma interface ainda não implementada, nem tornam o azul claro adequado sobre fundo branco.

### Registro anterior — rascunho v1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + rascunhar_plano + 003_plan + v1@23896d64d1724e8d62745f7b1a366f63d6a48b9b`
- `effect_class`: `local_mutation`
- `state_before`: ciclo `003` em `Ideação`, sem plano; branch `chore/cycle-003-ideation` em `23896d64d1724e8d62745f7b1a366f63d6a48b9b`, com registro local conhecido de autorização/pendência na ideação; situação `Parado` por escolhas ainda não respondidas. Base remota `main` conferida em `78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`, sem PR aberta ou issue aberta.
- `state_after`: escolhas e referência visual delimitada registradas na ideação; este plano único `v1` em `Rascunho`, ciclo em `Planejamento`, situação `Aguardando revisão (rodada 1)`, na branch local `chore/cycle-003-plan`. Nenhuma revisão formal, aprovação, issue, implementação, carga, conta, publicação ou deploy executado.
- `result`: `executed`
- `evidence`: autorização do rascunho e aceite humano das recomendações em 2026-11-05; template e autoridades lidos; inspeção estática visual restrita e síntese sanitizada acima; GitHub conferido por consulta somente leitura após falha de credenciais do MCP preferencial; cinco entregas e gates delimitados. Validação local registrada abaixo ao concluir a redação.
- `blockers`: nenhum para o rascunho; revisão formal pendente. As precondições de ambiente, método, capacidade, finalidade/contas e operação pertencem aos itens especificados e não foram declaradas atendidas.

### Validação local do rascunho

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas.
- `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais. `git diff --check`: sem erros; staging e diff limitados ao plano, à ideação reconciliada e à linha do ciclo.
- Conferência manual de G3, escolhas humanas, exceção visual restrita, referências, ausência de número de issue/PR inventado, estados e próximo passo. Nenhum material privado bruto ou identidade/credencial real foi incorporado.
- Consulta GitHub somente leitura por `gh` confirmou base `main` em `78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`, sem PR ou issue aberta; MCP GitHub Docker retornou 401 nesta sessão. Isso é evidência da consulta, não regra de ordem de ferramentas.
- Alteração documental local. Nenhuma aplicação, prova de dados estadual, banco, login Google real, benchmark, configuração de conta, deploy ou publicação remota executada; revisão formal pendente.

## Revisão crítica

### Rodada 1

**Data:** 2026-11-05.

**Autor:** Codex (GPT-6), conforme declarado no cabeçalho do rascunho; os commits `ec1f66e` e `6fb4956` não trazem trailer de coautoria.

**Revisor:** Claude Code, modelo Opus 5.5 (`claude-opus-5-5`).

**Base revisada:** `v2` no commit `6fb4956304917fb27b36df2312cd83f395c5c23e`, branch local `chore/cycle-003-plan`, árvore limpa; nenhuma rodada anterior. Conferidos `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, o workflow `revisar_plano`, o template `plano_implementacao`, a ideação `003`, ADR-002, ADR-003, KB-003, `001_research_viabilidade.md`, `002_research_arquitetura.md` (seção 5 e PF1–PF5), `scripts/prova-dados/cobertura.mjs`, `focos.mjs` e `fontes.json`. Nenhum arquivo de `local/` foi lido. Nenhuma documentação externa de provedor foi consultada: cotas, preços e versões de bibliotecas não são fatos desta revisão.

#### R1-1 — Bloqueador: a classificação de disponibilidade em escala estadual não está definida (G1)

A linha "Disponibilidade" do contrato diz que avisos oficiais delimitam lacunas e que, "sem evidência suficiente, disponibilidade é indeterminada". O ciclo `001` usou outro vocabulário (`cobertura.mjs`): `lacuna_conhecida`, `incidencia_indeterminada` e `sem_evidencia_de_lacuna` ("cobertura não comprovada"). A incidência de cada aviso foi julgada contra **um** polígono, Colniza. O plano não diz:

1. se "indeterminada" absorve o dia sem aviso, o que fundiria duas classes do ciclo `001`, ou se as três classes são mantidas;
2. em que unidade a disponibilidade é registrada (dia × satélite × município, ou dia × satélite para todo o estado);
3. como um aviso que atinge só parte de MT é classificado para cada um dos 142 municípios, e quem faz essa classificação;
4. o que acontece se o histórico de avisos dos 12 meses não puder ser obtido.

Exemplo fictício: num dia, um aviso informa falta de dados do `AQUA_M-T` a oeste de 58°O. O município X fica inteiro a oeste, Y é cortado pela linha e Z fica inteiro a leste.

| Alternativa | X | Y | Z | Efeito num período de 30 dias para Z |
| :-- | :-- | :-- | :-- | :-- |
| D1 — três classes do ciclo `001`, incidência por polígono municipal | lacuna conhecida | incidência indeterminada | sem evidência de lacuna | 0 dias com problema |
| D2 — dia marcado para todo o estado se qualquer aviso atingir MT | indeterminada | indeterminada | indeterminada | 1 dia com problema |

Isto é classificação de interpretação geoespacial, e o agente não pode escolher (`.agent/ai_behavior.md`, "Gestão de incertezas"). Corrigir de modo que: as classes e a unidade sejam fixadas, de preferência com a sugestão do autor e as alternativas levadas ao responsável antes da aprovação; casos de fixture para aviso parcial, aviso sem área delimitada e ausência de histórico entrem na estratégia de testes; e os critérios dos itens 1, 2 e 4 verifiquem a classificação, não apenas a separação entre detecção e disponibilidade.

#### R1-2 — Bloqueador: a semântica temporal exposta ao usuário não tem critério de aceite (G1)

A linha "Tempo" manda calcular a sensibilidade em `America/Cuiaba` "para os mesmos limites de calendário" e prevê o envelope de dados após o fim da janela. Mas a linha "Resultado mínimo", o contrato de consulta do item 2 e os critérios do item 4 não mencionam essa sensibilidade. Também não está dito em que fuso os dias da "série diária" são cortados, nem se as datas escolhidas na interface são dias GMT.

Com o texto atual, o item 4 pode ser aceito sem que a sensibilidade apareça em lugar nenhum. Por outro lado, o item 2 não sabe se precisa guardar os registros do envelope, que ficam fora da janela publicada e não podem entrar na contagem principal. Exemplo: para uma consulta de 2026-10-01 a 2026-10-31 com a janela terminando em outubro, a contagem em Cuiabá é o total GMT, menos os registros de 2026-10-01 entre 00:00Z e 03:59Z, mais os de 2026-11-01 no mesmo intervalo. Os registros de 2026-11-01 só existem no banco se o envelope for persistido. No ciclo `001` a diferença de fuso para `AQUA_M-T` em Colniza foi zero nos três meses, então a correção tende a ser pequena, mas precisa ser explícita.

Corrigir de modo que o plano declare onde a sensibilidade aparece: somente no relatório da carga ou na KB do método, por mês, ou também por consulta na interface. Declarar também se e como o envelope é persistido sem entrar na contagem principal, e o fuso dos dias da série diária e das datas da interface. Os critérios dos itens 1, 2 e 4 e os casos de virada de mês devem refletir essa escolha. Se houver mais de uma leitura aceitável, levar ao responsável com o exemplo numérico.

#### R1-3 — Bloqueador: as mutações no banco hospedado do item 5 não têm executor, credencial e ordem definidos

- **Contradição sobre o RP:** a seção da matriz diz que o "cadastro/configuração administrativa do RP é ação humana externa". O item 5 lista "RP na lista privada" entre os passos de preparar o banco hospedado, depois das ações externas, sem dizer quem o executa.
- **Ordem impossível se a chave for o id de Auth:** se a lista privada guardar o identificador do usuário no Supabase Auth, ele só existe depois do primeiro login Google no projeto hospedado. A sequência teria de ser: deploy e configuração, primeiro login do RP (negado, sem dados), cadastro e só então verificação. O item 5 põe o cadastro antes do deploy. Se a chave for outro atributo, como o e-mail da conta Google, isso é outra decisão de desenho e de privacidade, e precisa ser escrita.
- **Credencial administrativa:** aplicar migrações no banco hospedado e criar o papel EX com senha exigem credencial de proprietário/administração. O plano não diz quem guarda e usa essa credencial, nem se o agente a recebe. A linha "Autorizar implementação" cobre, no item 5, "somente operações remotas previstas após suas precondições", sem enumerá-las. `.agent/ai_behavior.md` exige que mudanças em banco de produção estejam claramente dentro da autorização recebida.

Corrigir com uma lista das mutações remotas do item 5: aplicar migrações no hospedado, criar e rotacionar EX, cadastrar o RP, executar a carga e configurar Google, Supabase e Vercel. Para cada uma, indicar quem executa (agente ou responsável), a frase que a cobre, a credencial usada e onde ela fica, e o ponto de parada. Fixar também o atributo de identidade do RP e a ordem login → cadastro → verificação. Ajustar a tabela de pontos de aprovação para que "Autorizar implementação" e "Ação humana externa" do item 5 não se sobreponham.

#### R1-4 — Ressalva: a geometria municipal enviada ao navegador não está dimensionada

O contrato diz corretamente que limites vêm do banco por RLS e que nenhuma base territorial vai no bundle. Não separa, porém, a geometria de **classificação**, local e completa, da geometria de **exibição**, publicada. A malha IBGE de Colniza em qualidade máxima tem 62.339 bytes (`fontes.json`). Multiplicar por 142 municípios dá cerca de 8,9 MB por carga completa do mapa. Isso é extrapolação, não medição, porque os municípios variam. É relevante para o celular, que o plano trata como base, e para a cota de egress. Recomenda-se declarar se a exibição usa geometria simplificada. Se usar, a simplificação vale só para o desenho, não define pertencimento, e um ponto perto da divisa pode aparecer do outro lado da linha; isso deve constar na legenda ou nas limitações. Recomenda-se ainda incluir o tamanho e o tempo de carga da geometria no celular nas medições dos itens 3 e 4.

#### R1-5 — Ressalva: o azul proposto não se distingue da identidade verde em escala de cinza

O plano exige que a distinção da ação primária seja verificada "também em escala de cinza". Pelo mesmo cálculo de luminância do autor, `#1d4ed8` contra a identidade `#254b39` dá cerca de 1,46:1. Em cinza, as duas cores ficam quase iguais. A distinção contra o verde dependeria só do matiz, o que o próprio plano proíbe para estados. Recomenda-se declarar já o diferenciador não cromático da ação primária (preenchimento contra contorno, rótulo, forma) ou ajustar o tom, para que o critério do item 4 não falhe só na entrega. O fundo escuro do mapa (`#152e27`) aparece apenas na validação v2. Convém citá-lo na direção visual, já que o cálculo de contraste do azul claro depende dele.

#### R1-6 — Ressalva: o item 3 prescreve mecanismos antes de medir o volume

O ciclo `001` mediu 6.416 registros `AQUA_M-T` em MT de agosto a outubro de 2026, a estação de pico. Doze meses tendem à ordem de 10⁴ registros. Isso é estimativa, a ser confirmada pelo item 1. O item 3 já fixa lotes, checkpoints, trava por conjunto e reconciliação de commit ambíguo. Com esse volume, uma única transação no mesmo cliente `pg` pode bastar e tornar checkpoints desnecessários. Pela regra "Simplicidade primeiro", recomenda-se manter as **evidências** exigidas (idempotência, falha antes/durante/depois do commit, nenhuma mistura de versões, reconstrução) e condicionar os **mecanismos** de lote e checkpoint ao resultado medido no item 1.

#### R1-7 — Ressalva: a matriz de acesso é chamada de "aprovada" antes do veredito

A ideação registra o aceite do resumo: somente o RP lê, AN e OA não leem, e a escrita fica só com EX. As linhas detalhadas da matriz, como a leitura do EX "somente o necessário" e a "administração externa separada", são propostas deste plano. O PF3 do ciclo `002` exige revisão e aprovação da matriz antes da implementação. Renomear para algo como "Matriz de acesso aceita na ideação e detalhada para aprovação deste plano", para não registrar aprovação anterior ao veredito.

#### R1-8 — Ressalva: o identificador `id` da fonte não é preservado no contrato

A linha "Unidade contada" define a identidade técnica por versão/hash da fonte mais a posição da linha. O CSV do INPE tem a coluna `id`, lida em `focos.mjs` e usada no ciclo `001` para cruzar casos com o BDQueimadas. Recomenda-se preservá-la como atributo de auditoria, não como chave de deduplicação, e declarar o tratamento de `id` repetido ou ausente.

#### Itens atendidos e verificações

- Objetivo, escopo e exclusões seguem as escolhas aceitas na ideação: R1, S1 com 12 meses, I1, T1, matriz resumida, orçamento zero e parada acima de 400 MB. Ranking, outras camadas, VIIRS, planos pagos e atualização automática estão fora. Nenhuma regra ambiental é antecipada. A medição negativa interromper a execução, em vez de reduzir o recorte, está correta.
- Nível completo, modo contínuo `—`, cinco issues sequenciais, PR documental sem issue e encerramento em PR própria sem issue recursiva estão coerentes com `_project/README.md`. A exceção `Refs #N` do item 5 está justificada no plano, como o README exige. Cada merge tem aprovação própria. As condições de parada da cadeia estão declaradas.
- G1 a G4 marcados `Sim` e justificados. A matriz AN/RP/OA/EX, os negativos por API e SQL, o EX sem `BYPASSRLS` e a restrição a `security definer` seguem a seção 5 e o PF3 do ciclo `002`. O pré-filtro geométrico, que não se limita a `estado_id = 51`, implementa T1 corretamente.
- G3: nenhum dado pessoal, credencial ou trecho bruto do material privado no texto. A exceção visual está delimitada e foi registrada antes da inspeção.
- Fatos conferidos: commits `78267a7`, `23896d6`, `ec1f66e` e `6fb4956`; PR #18 integrada em 2026-11-05 com merge `78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`; nenhuma issue aberta (`gh`, somente leitura). Também: contagens 516/246/62 = 824 e o arquivo diário `inpe-diario-20261101` no relatório do ciclo `001` e em `fontes.json`; ausência de `supabase/`; scripts `test:prova-dados` em `package.json`; `dist/` ainda fora do `.gitignore`, como o item 4 prevê. Os contrastes declarados (6,70; 6,17; 8,02) foram recalculados e conferem.
- Observação ao autor: `_project/cycles.md` ainda descreve o plano como "v2 rascunho; aguardando revisão formal". O revisor não altera esse registro; atualizar na correção.
- Validações locais após registrar esta rodada: Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes aprovados, zero falhas; `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais; `git diff --check`: sem erros; `git status --short`: somente este plano modificado, sem staging. Diff restrito a status, revisão e veredito, bloco de próximo passo, handoff e esta seção.

**Veredito:** `REQUER NOVA RODADA` — corrigir R1-1, R1-2 e R1-3; responder R1-4 a R1-8 (corrigir ou contestar com justificativa); preservar esta rodada e incrementar a versão. As escolhas de R1-1 e, se houver mais de uma leitura, de R1-2 são do responsável e podem ser apresentadas durante a correção, com sugestão e alternativas. Nenhuma aprovação, publicação, issue ou implementação foi realizada.

### Resposta do autor à rodada 1 — v3

**Data:** 2026-11-05. **Autor:** Codex (GPT-6). **Autorização:** "corrija o plano do ciclo 003". A rodada 1 permanece integralmente preservada; as respostas abaixo não constituem revisão independente nem aprovação.

- **R1-1 — Corrigido pelo autor, sujeito à rodada 2.** Antes de alterar a regra, foram apresentadas sugestão, alternativa estadual e exemplo numérico. O responsável escolheu D1, por dia GMT × satélite × município. O contrato/protocolo fixa as três classes, aviso parcial/sem área, histórico ausente/parcial, validação humana de ambiguidade, precedência herdada e aviso de cobertura não comprovada. Itens 1/2/4 e testes verificam a classificação; contagens observadas permanecem disponíveis com limitação quando o histórico não puder ser obtido.
- **R1-2 — Corrigido pelo autor, sujeito à rodada 2.** O responsável escolheu sensibilidade por consulta na interface, após sugestão e exemplo `100 − 3 + 5 = 102`; a alternativa era somente mensal no relatório/KB. Datas e série diária principal são GMT. Envelope persistido, escopo principal separado, limites GMT/Cuiabá, contagem/diferença rotuladas e mesma versão estão no contrato e nos critérios dos itens 1/2/4; medição inclui o envelope. Não transportar a diferença zero de Colniza como hipótese operacional.
- **R1-3 — Corrigido pelo autor, sujeito à rodada 2.** O item 5 enumera operações, executor, credencial/guarda, frases e pontos de parada. Responsável administra contas/OAuth/deploy/migrações/papel EX/segredos e UUID RP; agente recebe somente EX no processo local e executa carga inicial delimitada após retorno externo conferido. UUID `auth.users.id` substitui referência vaga a identificador, com primeiro login sem dados antes do cadastro. Pontos de aprovação e sequência separam atos humanos da carga EX; PR técnica integrada precede efeitos remotos. Não foi recebido segredo nem executada operação remota nesta correção.
- **R1-4 — Corrigido pelo autor, sujeito à rodada 2.** Separadas malha integral local de classificação e representação publicada para exibição. Uso de generalização é condicionado à necessidade medida, com origem/versão/parâmetros/hash; nunca modifica pertencimento. Incluídos bytes por município/conjunto, transferências/egress, tempo no celular e legenda sobre aparência perto da divisa, nos itens 1/3/4. Não se usa a extrapolação de Colniza como dimensionamento.
- **R1-5 — Corrigido pelo autor, sujeito à rodada 2.** Mantida a proposta azul, com diferenciador não cromático obrigatório: primária preenchida/texto branco/verbo explícito, secundárias claras/contorno/rótulo, sem outro botão verde preenchido no mesmo grupo. Seleção tem contorno/indicador além da cor. Fundo do mapa `#152e27` explicitado. O critério de cinza testa essa estrutura, sem alegar bom contraste entre azul e verde isolados.
- **R1-6 — Corrigido pelo autor, sujeito à rodada 2.** Uma transação no mesmo cliente é o primeiro caminho a avaliar; loteamento/staging/checkpoints/trava adicional dependem de medição/justificativa. Permanecem idempotência, concorrência segura, falhas antes/durante/depois do commit, ausência de mistura e reconstrução. Não há estimativa estadual convertida em fato nem dispensa de evidências por simplicidade.
- **R1-7 — Corrigido pelo autor, sujeito à rodada 2.** Matriz renomeada e delimitada: resumo aceito na ideação, detalhamento proposto para revisão e aprovação posterior do plano. Nenhuma aprovação anterior ao veredito é atribuída ao responsável.
- **R1-8 — Corrigido pelo autor, sujeito à rodada 2.** `id_fonte` preserva `id` textual para auditoria, sem unicidade/deduplicação; repetidos permanecem linhas distintas e são relatados, células vazias viram nulo declarado e coluna ausente é incompatibilidade de formato a tratar. Schema, item 1/2 e fixtures refletem esses casos.

**Validação da correção:** ver "Handoff de saída › Validação local da correção v3". Nenhuma rodada 2 foi executada; solicitar reavaliação do plano corrigido.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Não se aplica a exceção nominal do ciclo `000`. O ciclo `003` exige issues, autorizações por entrega, checks reais e aprovação específica de cada merge, conforme `_project/README.md`.
