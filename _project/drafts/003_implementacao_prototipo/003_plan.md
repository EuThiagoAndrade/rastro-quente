# Plano de Implementação — Fundação e implementação do protótipo

> **Ciclo:** `003`
> **Status:** `Rascunho`
> **Versão:** `v2`
> **Data de criação:** 2026-11-05
> **Última atualização:** 2026-11-05
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 003" em 2026-11-05
> **Modo contínuo:** `—`
> **Revisão formal:** `Pendente`
> **Veredito da revisão:** `Pendente`
> **Aprovação humana pós-revisão:** `Pendente`
> **handoff_schema_version:** `2`

**Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 003", em 2026-11-05. Após perguntas com sugestões e alternativas, o responsável declarou "Aceito todas as suas sugestões apresentadas." e indicou o estilo de `local/prototipo` como inspiração. Autor: Codex (GPT-6). Este aceite resolve o recorte abaixo; não é aprovação do plano após revisão nem autorização de implementação.

**Complemento autorizado — v2, 2026-11-05:** o responsável pediu componentes mobile first na medida do possível, mantendo a exploração cartográfica confortável no computador; textos mais visíveis, especialmente as tags abaixo dos nomes dos municípios; e uma cor de destaque claramente distinta das cores secundárias. Esta versão detalha esses requisitos na direção visual, na estratégia de testes e no item 4. A escolha exata do azul proposto abaixo é técnica e permanece sujeita à revisão/aprovação do plano. Não houve veredito formal entre v1 e v2; o plano permanece `Rascunho`, aguardando rodada 1.

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
| Unidade contada | Registro publicado de `AQUA_M-T`, preservando linhas distintas da fonte mesmo com coordenadas/instantes iguais. Identidade técnica combina versão/hash da fonte e posição da linha; repetir a mesma importação não cria novas detecções. Não deduplicar eventos ambientais. |
| Território | Obter lista oficial de municípios de MT e malhas IBGE v4 com revisão/metadados e hash fixados. Classificar coordenadas originais com a mesma semântica do ciclo `001`: exterior/interior de anéis, buracos e borda incluída. Validar CRS/eixos e não arredondar coordenadas ou criar tolerância espacial sem decisão. |
| Pré-filtro | Ler nacionalmente a série escolhida em streaming; usar envelopes dos polígonos para reduzir cálculo, incluindo candidatos geométricos e registros atribuídos a MT pelo INPE. Filtrar apenas `estado_id = 51` perderia registros de outra UF dentro do polígono e não implementa T1. |
| Divergências | Confrontar atribuição IBGE com códigos INPE; contabilizar inclusões, exclusões e divergências por município/estado. Registro fora de MT não entra na contagem principal, mas sua exclusão entra no relatório. Não escolher município em empate por primeiro resultado ou menor código. Caso de pertencimento a múltiplos municípios/ambiguidade material exige parada com coordenada fictícia equivalente, alternativas e efeitos numéricos para decisão humana antes da publicação afetada. |
| Tempo | Consulta por intervalo contido na janela publicada, com limites explícitos; interface converte datas inclusivas ao intervalo equivalente com fim exclusivo. GMT é principal. Calcular a sensibilidade para os mesmos limites de calendário em `America/Cuiaba`, validando deslocamento do período e incluindo o envelope de dados necessário na fronteira final (normalmente primeiras quatro horas do dia seguinte em GMT). |
| Fontes de fronteira | Usar arquivo mensal adjacente ou diário oficial, com proveniência própria, sem sobrepor/dobrar registros da série principal. O arquivo diário já é um caminho documentado na prova `001`. Ausência de envelope verificável impede apresentar sensibilidade como completa: registrar a pendência e pedir decisão, sem inventar zero ou mudar janela/fuso. |
| Disponibilidade | Detecção e disponibilidade têm campos distintos. Sem registro não significa ausência de fogo ou cobertura confirmada. Avisos oficiais delimitam lacunas conhecidas; sem evidência suficiente, disponibilidade é indeterminada. Não transportar o limiar de três dias de viabilidade da prova `001` como regra operacional. |
| Resultado mínimo | Totais estadual/municipal, série mensal/diária do período, registros paginados, mapa e proveniência/data da carga; municípios listados alfabeticamente, sem prioridade ambiental. Todas as respostas informam a versão publicada e a semântica do período. Não calcular o total a partir de página parcial. |
| Mapa | Limites e pontos vêm do conjunto autorizado por RLS. A projeção de exibição não define pertencimento. Visualização parcial deve informar quantos pontos mostra e o total, com navegação/paginação ou pedido de recorte menor, sem amostragem oculta. Nenhuma base territorial vai no bundle público. |

A janela exata e a revisão das fontes são fixadas na entrega 1, sem download ou reprocessamento de brutos durante este rascunho. Correção de fonte altera a versão do conjunto, preserva a proveniência e passa pelos mesmos testes; não muda a regra humana.

### Arquitetura mínima proposta

- **Web:** aplicação estática Vite + TypeScript, módulos nativos e CSS, sem framework de interface ou servidor intermediário. `@supabase/supabase-js` realiza Auth e consultas sob a sessão do usuário. Leaflet estável realiza o mapa vetorial, sem tiles de terceiros. As bibliotecas, licenças, compatibilidade e versões exatas serão conferidas e fixadas no lockfile na entrega correspondente; não usar beta por padrão.
- **Dados:** Node.js 24 em CLI local, reaproveitando componentes válidos da prova `001`, com streaming e processamento em lotes. Usar `pg` no executor para transações SQL parametrizadas; credencial exclusiva de ingestão por ambiente, fora do cliente e dos logs. O algoritmo territorial continua local; PostGIS não é dependência operacional desta proposta.
- **Banco:** entidades de fontes, versões de malha/municípios, detecções, disponibilidade, cargas e referência à publicação vigente; todas as tabelas `public` com RLS. Preservar códigos territoriais e origem, sem `user_id` fictício em cada registro compartilhável. O schema concreto e índices devem materializar este contrato e ser medidos com a carga completa local, não com largura hipotética.
- **Autorização:** lista administrativa privada com o identificador do único RP, sem valor real em migração/seed/repositório. RLS usa identidade confiável da sessão; metadados editáveis pelo usuário não concedem acesso. Se for necessário helper `security definer` para consultar a lista privada, limitar à resposta booleana de autorização, `search_path` fixo, referências qualificadas e grants mínimos; justificar e testar. Consultas/agregações comuns permanecem `security invoker`.
- **Executor EX:** papel SQL dedicado, não proprietário, sem `BYPASSRLS`, DDL ou acesso à lista de autorização; grants/políticas só para operações de dados previstas. Não entregar `service_role` ao navegador nem utilizá-la como substituto do desenho de privilégio mínimo. Se a restrição não puder ser demonstrada, parar para revisão.
- **Publicação:** lotes de uma carga em preparação não são visíveis a RP. Validar manifesto, contagens e integridade antes de trocar atomicamente a referência à versão publicada; conservar a última íntegra em falha. Consultas fixam um identificador de versão para impedir mistura entre mapa, tabela e totais. Expiração/limpeza só remove versões elegíveis pelo protocolo e nunca a vigente por tentativa cega.
- **Ambientes:** Supabase local isolado para banco/RLS, dados fictícios nos testes e previews; fontes reais públicas somente na medição local autorizada e no destino de consulta após os gates. Preview não herda credenciais/dados do banco de produção. O bundle distribuído contém código/estilos, sem resultados territoriais ou arquivos de `local/`.

### Matriz de acesso aprovada para o recorte

| Recurso/ação | AN — anônimo | RP — responsável autorizado | OA — outro autenticado | EX — executor controlado |
| :-- | :-- | :-- | :-- | :-- |
| Interface sem dados / início de login | Permitir | Permitir | Permitir, sem dados | Não é usuário da interface |
| Ler versão publicada, focos, municípios, cobertura e proveniência sanitizada | Negar | Permitir | Negar | Somente o necessário à carga/validação |
| Ler carga parcial ou segredos | Negar | Negar | Negar | Apenas o necessário à própria operação; sem saída de segredo |
| Inserir/corrigir/publicar/expirar conjunto de dados | Negar | Negar escrita direta | Negar | Permitir dentro do protocolo e recorte |
| Alterar autorização, schema ou grants | Negar | Negar pela aplicação | Negar | Negar; administração externa separada |

Login Google não basta para tornar uma conta RP. Testar a matriz também pela API/SQL direta, além da interface; views e RPC não podem contornar o controle. Cadastro/configuração administrativa do RP é ação humana externa e reversível, sem identidade real nas evidências versionadas.

### Direção visual proposta

O pedido humano de usar `local/prototipo` como inspiração foi registrado na ideação **antes** da inspeção, como exceção restrita à proibição geral de leitura desse diretório. A síntese abaixo incorpora o complemento humano da v2; implementar/revisar não depende de acessar o material privado:

- **Mobile first:** desenhar a base dos componentes para telas pequenas, com CSS progressivamente ampliado conforme o espaço disponível. Login, filtros, resumos, detalhes, mensagens, legenda e proveniência devem ser operáveis em celular. Priorizar conteúdo em uma coluna; filtros e cartões quebram linha, e detalhes ficam no fluxo da página, sem painel lateral fixo que reduza a área útil. Não reduzir fontes para acomodar o arranjo desktop.
- **Mapa e desktop:** conservar mapa e consulta no celular, com controles próprios para toque e sem bloquear a rolagem normal da página. Em telas largas, ampliar o mapa e posicionar detalhes/proveniência ao lado. A natureza bidimensional do mapa não dispensa adaptação dos controles e demais componentes. Mapa/tabela podem ter navegação em duas dimensões dentro de sua região; não provocar rolagem horizontal global nem ocultar informações essenciais fora da tela. A tabela/lista oferece consulta equivalente aos registros.
- **Estrutura e identidade:** preservar fundo claro levemente esverdeado (`#f5f6f2`), superfícies brancas, texto verde profundo (`#243c31`), identidade em verde (`#254b39`), cartões com bordas suaves, cantos discretos e sombras leves. Cabeçalho, sessão, filtros, resumos e mapa mantêm hierarquia clara. Navegação só para destinos reais do recorte, sem botões demonstrativos sem ação.
- **Tipografia:** usar fontes de sistema (`Segoe UI`, Arial, sans-serif), unidades relativas e escala que respeite preferências do navegador. Adotar texto-base de `1rem` (16 px na configuração padrão), entrelinha aproximada de 1,5 e piso de `0.875rem` (14 px no padrão) para textos informativos auxiliares, tags, rótulos, legenda e atribuição. Nomes dos municípios têm pelo menos `1rem`; etiquetas abaixo deles, citadas pelo responsável, têm pelo menos `0.875rem`, peso legível, bom contraste, espaçamento e quebra de linha. Esses tamanhos são critérios locais do projeto, não mínimos de fonte definidos pela WCAG. Não esconder/truncar conteúdo necessário para simular legibilidade.
- **Cor de destaque:** propor azul royal `#1d4ed8` para ação primária, seleção e indicadores de interação, distinguindo-o dos verdes/tons neutros secundários e do laranja das detecções. Ações secundárias usam superfície neutra/contorno; evitar uma família de acentos semelhantes competindo pela mesma função. Em fundo claro, usar azul com texto branco ou texto azul na superfície clara conforme o componente; sobre o mapa escuro, usar variante azul clara `#93c5fd` para foco/seleção, com contorno ou rótulo. Laranja permanece informação de detecção, sem funcionar simultaneamente como destaque genérico de ação.
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
| Autorizar implementação — "autorizo a implementação da issue #N" | Plano aprovado/integrado, issue válida e dependências integradas | Implementação/testes e preparação/publicação da PR do item delimitado; no item 5, somente operações remotas previstas após suas precondições | Merge, expansão de escopo, cobrança e substituição de decisão analítica | Escopo/payload da issue, ambiente de execução, limites e pontos de parada |
| Ação humana externa — "concluí a ação externa da issue #N" | Roteiro concreto preparado na task dos itens 2 ou 5 | Confirma a ação humana de ambiente/contas, configuração e, após integração técnica, deploy | Aprovação de merge, prova automática de elegibilidade ou autorização genérica de produção | Ambiente gratuito e adequado; finalidade real; configuração sanitizada; URLs/callbacks autorizados; sem registrar segredos |
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
- **Método:** `node:test` com fixtures fictícias e valores esperados calculados independentemente do módulo sob teste: dentro/fora/borda/buraco/MultiPolygon, divisa ambígua, código INPE divergente, coordenada inválida, repetição legítima de linha, virada mensal, ano bissexto e envelope de fuso. Resultados de produção não são usados para fabricar seus próprios valores esperados.
- **Referência pública:** na entrega 1, se os mesmos hashes e recorte de Colniza do ciclo `001` forem obtidos, exigir 516/246/62 e total 824. Hash/revisão diferente exige explicar a mudança e validar contra referência independente compatível; não editar resultado esperado só para passar. Contagens estaduais/municipais da janela devem concordar com uma agregação independente sobre os registros classificados, sob o mesmo contrato e sem extrapolação municipal. Essa conferência de totais não valida espacialmente todos os pontos: a evidência espacial permanece delimitada pelos casos independentes e pelo recorte público comparável.
- **Banco e autorização:** aplicar migrações do zero em Supabase local, gerar identidades fictícias RP/OA no mesmo papel `authenticated`, testar AN e EX, RLS por tabela, RPC/views, carga parcial, revogação, token ausente/expirado e metadado adulterado. Negativos não devolvem linhas/bytes indevidos nem alteram estado; não fixar um único status HTTP como prova. EX não pode mudar schema, grants ou autorizações.
- **Pipeline e recuperação:** mesma carga duas vezes, lotes repetidos, concorrência, falha antes/durante/depois do commit, correção de fonte, expiração e reconstrução em destino local novo. Manifesto, registros e totais restaurados devem coincidir com referência externa ao mecanismo de publicação. Testes destrutivos limitados ao ambiente isolado.
- **Interface:** typecheck/build; Playwright em ambiente local com dados fictícios e Auth local, cobrindo login/negação/logout, filtros, paginação, mapa/tabela, requisições fora de ordem, troca de versão, fonte indisponível, vazio e indeterminado. Validar primeiro 360/390 px com toque, depois 768/1440 px, teclado e foco. Conferir tamanhos relativos/computados de textos e tags, contraste dos pares efetivos, distinção da ação primária/seleção, texto ampliado a 200% e reflow dos componentes comuns a 320 CSS px, sem perda de conteúdo ou rolagem horizontal global. Avaliar mapa/tabela separadamente quando exigirem disposição bidimensional, mantendo seus controles acessíveis. Sem snapshot do mockup privado e sem alegar teste de interface nesta alteração documental.
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
- [ ] Medição da janela completa, não só amostra: linhas lidas/persistíveis/excluídas, bytes, tempo, memória/pico de disco local e tamanhos do resultado. Separar obtenção, classificação e agregação; não estimar banco como se já estivesse medido.
- [ ] Dry-run não escreve em provedor; nenhuma fonte bruta ou identidade privada entra na PR. Relatório aponta o que a entrega 2/3 ainda deverá medir com schema real.

### Item 2 — Fundar o banco local, o contrato de consulta e as políticas de acesso

**Contexto:** PF3 exige provar autorização além do login; o volume da entrega 1 permite desenhar o menor schema compatível.

**Ação técnica:** conferir ambiente gratuito de testes, versões/licenças e recursos. Preparar roteiro para o responsável disponibilizar CLI Supabase e runtime compatível com Docker caso ausentes; não iniciar instalação privilegiada/contratação por inferência. Criar configuração local, migrações aditivas, entidades/índices do contrato e consultas/RPC paginadas e limitadas por versão/período. Implementar lista administrativa privada, helper restrito se necessário, policies e papel EX dedicado. Preparar configuração Google e variáveis de exemplo sem valores reais; provedor hospedado só na entrega 5. Registrar decisão técnica em ADR, lendo o template e a numeração real ao criá-lo.

**Critérios de aceite:**

- [ ] Schema criado do zero, toda tabela `public` com RLS, grants sem acesso excessivo e funções/views auditadas. Migrações não contêm identificador real do responsável ou senha.
- [ ] Matriz completa AN/RP/OA/EX passa em dados fictícios por API e SQL; revogação efetiva impede nova consulta e nenhuma escrita/alteração de autorização é permitida à aplicação comum ou ao papel EX fora de sua atribuição.
- [ ] Consultas retornam totais exatos fora da paginação, versões fixadas, erros de período/parâmetro explícitos e limites técnicos de resposta; carga parcial não é legível.
- [ ] Integração local testa troca de versão sem misturar resultados e mede banco/índices base. Nenhum serviço hospedado é necessário para passar estes testes.
- [ ] Roteiro de ambiente, decisão arquitetural, matriz e comandos de verificação documentados; se o runtime não puder ser disponibilizado gratuitamente, situação `Parado` com alternativas, sem dispensar os testes de G2.

### Item 3 — Publicar versões de dados com idempotência e comprovar capacidade/recuperação

**Contexto:** PF2/PF4 devem demonstrar a operação completa do executor I1 no schema real antes da nuvem.

**Ação técnica:** implementar `plan`/`apply` da CLI para banco alvo explicitamente identificado, com EX, transações no mesmo cliente `pg`, lotes/checkpoints, trava por conjunto e reconciliação após resposta ambígua de commit. Identidade de carga deriva do manifesto canônico (fontes/versões, janela e método), sem usar timestamp como identidade. Usar o resultado integral da entrega 1 no banco local, medir o pico com versão vigente + nova carga + retenção anterior + índices/temporários e preparar reconstrução a partir de migrações e cópias locais com hash. Expiração dos dados da aplicação não edita migrações (G4).

**Critérios de aceite:**

- [ ] Reexecução não duplica linhas/publicação; falhas preservam a última versão íntegra; consultas não observam preparação. Correção de fonte e mudança da janela produzem versão nova verificável.
- [ ] Concorrência e falha após commit são reconciliadas pela identidade da carga, sem `force`, limpeza destrutiva ou publicação duplicada.
- [ ] Medição integral de banco/dados/índices, disco/WAL/temporários, tráfego por operação, requests e duração da carga/consultas/reconstrução, com ferramentas/versões e tamanhos de resposta registrados. Não confundir banco lógico com disco, nem saldos cached/uncached.
- [ ] Antes de carga hospedada, o plano da operação inclui consumo existente e pico previsto. **Acima de 400.000.000 bytes de banco**, ou com estimativa insuficiente para provar margem, parar; igualdade é teto e não elimina conferência das demais cotas. Conferir também disco, egress, conta/organização, CI e recursos Vercel, sem somar franquias diferentes.
- [ ] Reconstrução em banco local novo reproduz manifesto, registros e totais; testar perda de conexão/indisponibilidade e retomada. Registrar duração e dependência do operador, sem prometer RPO/RTO de contas, segredos ou autenticação que não foram restaurados. Guardar fontes fixadas localmente; não depender de URL futura manter o mesmo conteúdo.
- [ ] Runbook de atualização, cópia local, expiração, recuperação e rotação de EX, com procedimento seguro de rollback de dados; nenhum teste destrutivo executado em produção.

### Item 4 — Entregar a interface de consulta com o estilo de referência

**Contexto:** R1 precisa de uso real e explicação do resultado, preservando a direção estética aceita e os pedidos posteriores de mobile first, tipografia visível e destaque cromático distinto.

**Ação técnica:** adicionar aplicação Vite/TypeScript, estilos próprios, SDK Supabase e Leaflet estável, lockfile e build. Construir componentes a partir do layout para celular e ampliar progressivamente para desktop, onde o mapa pode ocupar mais espaço. Aplicar escala tipográfica relativa legível e papéis de cor separados conforme a direção visual. Implementar início/callback de login Google, acesso autorizado, logout e estados de sessão. Integrar filtros município/datas, mapa, série temporal, tabela paginada, divergências, disponibilidade e proveniência, fixando versão e descartando respostas obsoletas. Usar somente fontes/API autorizadas; sem chave privilegiada, tiles, fonte web, analytics ou outro serviço adicional. Separar módulos de sessão, consulta, mapa e apresentação sem criar biblioteca genérica de componentes. Documentar as diretrizes implementadas no guia da interface do runbook, sem instituir design system ou contrato visual canônico neste ciclo.

**Critérios de aceite:**

- [ ] Componentes partem do layout mobile first e funcionam em 360/390 px com toque e em 768/1440 px com espaço progressivo para mapa/detalhes; filtros, resumos, legenda e proveniência acessíveis sem reduzir fontes ou exigir rolagem horizontal global. Comparação visual feita com fixtures fictícias e evidência sanitizada.
- [ ] Texto-base de `1rem`, nomes de municípios de pelo menos `1rem` e tags/rótulos/legendas informativos de pelo menos `0.875rem`, respeitando o tamanho padrão do navegador. Etiquetas abaixo do município têm contraste, espaçamento e quebra de linha adequados. Ampliação a 200% e reflow dos componentes comuns a 320 CSS px não cortam conteúdo nem perdem funcionalidade.
- [ ] Ação primária e seleção se distinguem dos elementos secundários e dos pontos de detecção; azul royal/variante clara propostos são conferidos nas superfícies efetivas. Textos informativos atingem 4,5:1 e pistas visuais necessárias dos controles/estados atingem 3:1; estado não depende apenas de cor. Controles têm alvo de toque mínimo de 44 × 44 CSS px e foco/teclado utilizáveis; mapa é conferido separadamente, sem estender a exceção bidimensional aos componentes comuns.
- [ ] Fluxo de sessão e consulta funciona com Auth local; Google real permanece para o roteiro externo do item 5. AN/OA não recebem dados mesmo chamando diretamente a API.
- [ ] Logout, revogação ou expiração limpam os dados da sessão na interface; respostas atrasadas de RP não repovoam a tela de AN/OA. Dados de consulta não ficam em armazenamento persistente/cache público, e valores de fonte são renderizados como texto, sem execução de marcação.
- [ ] Mapa, totais, série e tabela correspondem à mesma versão/período; paginação/limite de pontos não muda totais nem oculta truncamento. Município é listado sem ranking ambiental.
- [ ] Zero, fonte indisponível, cobertura indeterminada, acesso negado, sessão expirada e última atualização são estados distintos e testados; não há dado ilustrativo em caminho de produção.
- [ ] Aviso de domínio, método, fuso, fontes/versões e limitações acessíveis ao usuário; navegação por teclado e tabela como alternativa ao mapa. Sem recursos demonstrativos fora do recorte.
- [ ] Typecheck, build, testes/E2E e gates existentes passam; bundle e upload preparado inspecionados, sem `local/`, credenciais, contas reais ou dados territoriais embutidos. Acrescentar exclusão de `dist/` ao Git ao introduzir o build.

### Item 5 — Preparar a operação gratuita, implantar e verificar o protótipo

**Contexto:** PF5, Google real, upload/deploy e quotas disponíveis não são comprovados pelos testes locais.

**Ação técnica:** preparar roteiro concreto de configuração e retorno para o responsável, arquivo de implantação estática, variáveis públicas/privadas separadas e checklist operacional delimitado ao destino. Conferir documentação/conta para finalidade real, elegibilidade Hobby, disponibilidade Free e saldos compartilhados, inclusive ferramentas locais/CI. **O aceite das sugestões não comprova que o uso é pessoal não comercial.** Essa confirmação factual é condição anterior a configurar o destino; se a finalidade for incompatível, parar com opções para decisão, sem contratar plano ou trocar requisito.

Após ações externas e gates conferidos, preparar banco hospedado vazio compatível: migrações novas, RP na lista privada e EX com privilégio mínimo; executar somente carga prevista, com identificação do alvo, dry-run e consumo existente conhecidos. Configurar Google com escopos mínimos de login e URLs exatas, sem permissões extras sobre serviços da conta. Previews permanecem isolados/fictícios. A PR técnica é integrada antes do deploy final; o responsável implanta o commit integrado e confirma a ação externa. Só então pedir a frase de verificação em produção e executar login/consultas do roteiro.

**Critérios de aceite:**

- [ ] Finalidade/contas/licenças e cotas realmente disponíveis conferidas, sem cartão, gasto ou trial; configuração externa confirmada e verificável sem registrar segredos. Não alegar custo zero de energia/internet/hardware do operador.
- [ ] Banco real tem migrações esperadas/RLS e somente carga íntegra dentro do orçamento. Conferir o consumo antes e durante cada etapa; interromper antes de exceder margem/cota e manter publicação anterior.
- [ ] URL/commit de deploy e versão da carga identificados em evidência sanitizada; upload exclui materiais privados e bundle não contém dados/credenciais. Cache da aplicação não compartilha respostas ou sessão entre usuários.
- [ ] Google real permite o fluxo RP; AN é negado diretamente. OA é testado com identidade controlada em ambiente apropriado, sem conta/identificador em fixtures ou logs; bloqueio hospedado é conferido por sessão válida quando disponível, e limitação de teste é explicitada se faltar essa condição, sem declarar G2 comprovado no destino.
- [ ] Após autorização própria de produção, filtros, contagens comparáveis, mapa/tabela, proveniência e estados operacionais conferem no destino; nenhum ensaio de expurgo/falha destrutiva é feito nele.
- [ ] Responsável confere resultado, duração medida de carga/recuperação e operação manual, sem SLA prometido. Se a operação medida não servir ao uso real, registrar decisão antes de declarar entrega operacional.
- [ ] README, runbook e KB-003 atualizados com o que existe, limites medidos e o que não foi provado, incluindo pausa real não simulada na conta. Nenhuma alegação de disponibilidade contínua ou gratuidade incondicional.

## Arquivos afetados

Na criação da v1, somente este plano, a reconciliação das escolhas/autorizações na ideação e a linha de estado/plano em `_project/cycles.md`. No complemento v2, somente este plano e a referência de versão no registro de ciclos. Nenhum arquivo do protótipo privado é alterado ou versionado.

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
| Falha, concorrência ou resultado de commit desconhecido | Trava/checkpoints e reconciliação por manifesto; conservar publicação íntegra; não repetir publicação nem apagar estado para tentar novamente. |
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
6. Autorizar item 5, resolver gates de finalidade/conta, preparar/conferir ações externas e recursos. Integrar PR técnica com merge próprio. Responsável realiza o deploy do commit integrado; conferir retorno externo.
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
Situação: Aguardando revisão (rodada 1) — ciclo 003 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 003"
```

## Handoff de saída

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

Pendente. Nenhuma rodada executada. A revisão será uma etapa própria, com autor/revisor, achados classificados e veredito, conforme `_project/README.md`.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Não se aplica a exceção nominal do ciclo `000`. O ciclo `003` exige issues, autorizações por entrega, checks reais e aprovação específica de cada merge, conforme `_project/README.md`.
