# Plano de Implementação — Prova de dados

> **Ciclo:** `001`
> **Status:** `Em Revisão`
> **Versão:** `v3`
> **Data de criação:** 2026-11-03
> **Última atualização:** 2026-11-03 (correção da rodada 2)
> **Tipo:** `chore`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 001" em 2026-11-03
> **Modo contínuo:** `—`
> **Revisão formal:** `Em andamento`
> **Veredito da revisão:** `REQUER NOVA RODADA`
> **Aprovação humana pós-revisão:** `Pendente`
> **handoff_schema_version:** `2`

Rascunho autorizado por "autorizo o rascunho do plano do ciclo 001" em 2026-11-03.

## Problema e contexto

Ideação: _project/ideations/001_prova_de_dados.md

## Objetivo

Produzir evidência reproduzível para decidir se a abordagem do Rastro Quente é viável com dados públicos: identificar as fontes de focos de calor e de limites municipais, contar as detecções em Colniza (MT) de agosto a outubro de 2026 segundo regras decididas pelo responsável, conferir essas contagens por um caminho independente e registrar limitações num relatório curto de viabilidade.

O ciclo não define regra de seleção de áreas. Contagens de focos não comprovam incêndio, dano, autoria ou infração.

## Origem no backlog

Não se aplica. Herdado da ideação: demanda direta do responsável, sem ID do backlog.

## Contexto e baseline

Baseline: `main` em `e3c785b` (ciclo 000 concluído) e ideação em `chore/cycle-001-ideation` (`e128bf5`). Não há aplicação, banco nem script de dados. O tooling existente é Node.js 24 sem dependências.

Decisões do responsável herdadas da ideação (2026-11-03): recorte Colniza, ago a out de 2026; focos e limites municipais, sem sobreposição com imóveis ou áreas protegidas; somente fontes públicas; referência independente em duas camadas (segunda fonte ou ferramenta, e 10 a 20 casos escolhidos pelo responsável conferidos em mapa); relatório Markdown e scripts Node.js, com dados brutos em `local/`; sem limiares escolhidos pelo agente; só ferramentas gratuitas.

### Verificação prévia das fontes (somente leitura, 2026-11-03)

Feita pelo autor do plano para não planejar sobre suposição. Nada foi baixado ou gravado além de cabeçalhos HTTP e das primeiras linhas de um arquivo.

| Fonte | O que foi observado | O que falta verificar |
| :-- | :-- | :-- |
| INPE, focos mensais do Brasil (`https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/`) | Existem `focos_mensal_br_202608.csv`, `_202609.csv` e `_202610.csv`, com cerca de 104 MB, 123 MB e 144 MB e `Last-Modified` no dia 1 do mês seguinte. Colunas: `id, lat, lon, data_hora_gmt, satelite, municipio, estado, pais, municipio_id, estado_id, pais_id, numero_dias_sem_chuva, precipitacao, risco_fogo, bioma, frp`. Há registros de vários satélites, inclusive o geoestacionário `GOES-19` | Condições de uso; se os arquivos são regenerados depois da publicação; valores possíveis de `satelite` |
| INPE, avisos do Programa Queimadas (`https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/avisos/`) | Aviso de 12/08/2026: falta de imageamento do AQUA, "satélite de referência", sem dados dele nessa data em parte da América do Sul. Há avisos semelhantes em 10/07 e 22/07/2026 | Demais avisos de ago a out de 2026 e se cada um atingiu Colniza |
| IBGE, localidades e malhas (`https://servicodados.ibge.gov.br/api/`) | Colniza tem código `5103254` (UF MT). A malha `v3/malhas/municipios/5103254` responde em GeoJSON; os metadados declaram área de 27.960,237 km² | Ano/versão da malha servida, condições de uso e parâmetros de qualidade |
| NASA FIRMS (`https://firms.modaps.eosdis.nasa.gov/api/area/`) | A consulta por área usa `/api/area/csv/[MAP_KEY]/[SOURCE]/[AREA_COORDINATES]/[DAY_RANGE]/[DATE]`, com a chave no caminho. Produtos listados: `VIIRS_SNPP_NRT/SP`, `VIIRS_NOAA20_NRT/SP`, `VIIRS_NOAA21_NRT/SP`, `MODIS_NRT/SP`, `LANDSAT_NRT`. A revisão da rodada 1 registrou limite de 1 a 5 dias por consulta e a API de disponibilidade (`/api/data_availability/`) | Limite exato de `DAY_RANGE`, disponibilidade SP ou NRT para ago a out de 2026 e condições de uso, com a chave |

Consequências para o plano: os arquivos brutos são grandes demais para o Git e ficam em `local/`; como podem mudar no servidor, a proveniência registra URL, data de obtenção, tamanho e SHA-256; como a base INPE reúne vários satélites, a regra de contagem é uma decisão analítica (D1); como um dia sem registro não prova que houve observação, a cobertura é tratada à parte das contagens (ver "Cobertura" abaixo).

## Escopo

### Dentro do escopo

- Scripts Node.js 24 nativos, sem dependências, em `scripts/prova-dados/`, para obter as fontes, registrar proveniência, filtrar Colniza, contar e comparar.
- Testes `node --test` com fixtures fictícias em `tests/fixtures/prova-dados/`, incluindo casos de referência calculados à mão.
- Manifesto de fontes versionado (`scripts/prova-dados/fontes.json`) com URL sanitizada, período e, após a obtenção, data de obtenção, tamanho e SHA-256 esperados.
- Dados brutos e saídas intermediárias somente em `local/prova-dados/`.
- Relatório `_project/drafts/001_prova_de_dados/001_research_viabilidade.md` com fontes, versões, cobertura, contagens agregadas, comparação, casos conferidos, limitações e conclusão de viabilidade nos termos decididos em D7 a D9.
- Encerramento prospectivo do ciclo e atualização da documentação viva (KB-003).

### Fora do escopo

- Aplicação, interface, autenticação, banco, Supabase, RLS, migrações e deploy.
- Escolha de framework, PostGIS ou arquitetura de processamento.
- Sobreposição com imóveis, áreas protegidas ou outras camadas.
- Regras, pesos ou limiares de seleção de áreas.
- Outros municípios ou períodos; dados privados ou restritos; serviços pagos.
- Inclusão dos testes da prova no workflow de CI (exigiria mudar `.github/workflows/governance.yml`, que pertence à governança). Os testes rodam como gate local e a evidência fica nas tasks e PRs.
- Leitura de `local/brainstorm/` ou `local/prototipo/`.

## Decisões e autoridades

### Decisões analíticas do responsável (G1)

O agente não escolhe entre estas alternativas. Os exemplos numéricos são **fictícios**, só para mostrar o efeito de cada regra. A sugestão do autor, quando houver, é uma opinião para facilitar a decisão, não uma decisão. As respostas são registradas no plano, numa correção de versão, antes da aprovação.

**D1 — Quais detecções contam.** Exemplo fictício: num dia, uma mesma frente de fogo aparece 6 vezes no GOES-19, 1 vez no satélite de referência e 3 vezes em satélites VIIRS.

| Alternativa | Resultado do exemplo | Efeito |
| :-- | :-- | :-- |
| a) Só o satélite de referência do INPE | 1 | Série comparável ao longo dos anos; subestima a atividade |
| b) Todos os satélites | 10 | Mede registros, não fogos; muito inflada por repetição |
| c) Só sensores VIIRS | 3 | Melhor resolução (375 m) e comparável ao FIRMS |
| d) a como principal, c e b como contagens auxiliares | 1 (3 e 10 no apêndice) | Mais tabelas, mais transparente |

Sugestão do autor: d. O aviso do INPE de 12/08/2026 identifica o AQUA como satélite de referência; o item 1 confere se isso vale para todo o período e quais valores de `satelite` o representam nos arquivos.

Qualquer que seja a escolha em D1, se D6 incluir a, a série VIIRS é calculada como série de comparação (ver "Contrato de comparação"), sem virar a contagem principal.

**D2 — Como decidir que um foco é de Colniza.** Exemplo fictício: 100 registros com `municipio_id = 5103254`; 97 deles ficam dentro do polígono IBGE e 3 ficam fora (2 a menos de 500 m da divisa e 1 a cerca de 3 km, já em município vizinho); além disso, 1 registro dentro do polígono tem outro `municipio_id`.

| Alternativa | Resultado do exemplo |
| :-- | :-- |
| a) Campo `municipio_id` do INPE | 100 |
| b) Ponto no polígono da malha IBGE (versão registrada) | 97 + 1 = 98 |
| c) b como principal, com a lista das divergências entre a e b | 98, com 4 divergências (3 só no campo, 1 só no polígono) |

As divergências são a diferença simétrica entre os dois conjuntos de identificadores (`id` do INPE), e as fixtures de referência testam exatamente isso. Ponto exatamente sobre a divisa: contar como dentro ou fora deve ser declarado (sugestão: dentro, e relatar quantos houve). Sugestão do autor: c.

**D3 — Fuso dos limites mensais.** Exemplo fictício: um registro em `2026-09-01 02:30` GMT é `2026-08-31 22:30` no horário de Cuiabá (UTC−4).

| Alternativa | Mês do exemplo | Efeito |
| :-- | :-- | :-- |
| a) GMT, como os arquivos do INPE | setembro | Usa os três arquivos mensais sem ajuste |
| b) Horário de Cuiabá | agosto | Exige também os registros de 2026-11-01 entre 00:00 e 04:00 GMT; ignora os de 2026-08-01 nesse intervalo |
| c) a como principal, b como sensibilidade | setembro, com a diferença relatada | Mostra o efeito sem trocar a regra |

Intervalos, sempre com início inclusivo e fim exclusivo:

- GMT: trimestre `[2026-08-01T00:00:00Z, 2026-11-01T00:00:00Z)`; meses com limites em `T00:00:00Z` do dia 1.
- Horário de Cuiabá (UTC−4 fixo; o Brasil não adota horário de verão desde 2019, o que o item 1 confere): trimestre `[2026-08-01T04:00:00Z, 2026-11-01T04:00:00Z)`; meses com limites em `T04:00:00Z` do dia 1.

Com b ou c, o item 1 obtém também o arquivo diário `focos_diario_br_20261101.csv`, que já está fechado, em vez do mensal de novembro, que ainda cresce. Os testes cobrem as transições `03:59:59Z` e `04:00:00Z` no início do trimestre, em cada virada de mês e no fim do trimestre. Sugestão do autor: c.

**D4 — Unidade de contagem.** Exemplo fictício: 12 registros do satélite escolhido caem na mesma célula de 1 km em dois dias.

| Alternativa | Resultado do exemplo |
| :-- | :-- |
| a) Registro publicado | 12 |
| b) Dia com detecção por célula de 1 km | 2 |

Este plano especifica e implementa somente a. A alternativa b depende de projeção, origem da grade, regra de borda e combinação de satélites, que não estão especificadas; escolher b exige uma nova versão do plano com essa especificação, exemplos e testes, antes da aprovação. A decisão do responsável é confirmar a ou pedir essa nova versão. Sugestão do autor: a.

**D5 — Concordância com a segunda fonte.** Vale só para D6 a e c; em D6 b a concordância exige igualdade (ver "Contrato de comparação"). Seja `A` a série do INPE e `B` a série comparada, no mesmo mês e satélite. Duas fórmulas possíveis:

- F1, base INPE: `|A − B| / A × 100`.
- F2, base maior: `|A − B| / max(A, B) × 100`.

Denominador zero, em qualquer fórmula: `A = B = 0` concorda; só um dos dois igual a 0 diverge, sem percentual. Exemplo fictício: agosto `A = 950`, `B = 1.200`; setembro `A = 1.200`, `B = 1.150`; outubro `A = 1.200`, `B = 950`.

| Alternativa | Agosto (F1 26,3% / F2 20,8%) | Setembro (4,2% / 4,2%) | Outubro (20,8% / 20,8%) |
| :-- | :-- | :-- | :-- |
| a) Tolerância de 10% | diverge / diverge | concorda | diverge |
| b) Tolerância de 25% | diverge / concorda | concorda | concorda |
| c) Sem tolerância: o mês concorda só se toda a diferença for explicada por causa documentada | explicar 250 | explicar 50 | explicar 250 |

Em c, causas aceitas são as documentadas no relatório com evidência: produto ou versão diferente (NRT/SP), diferença de algoritmo de detecção entre distribuidores, atribuição territorial, lacuna de cobertura conhecida ou instante na fronteira do fuso. Diferença sem causa documentada é "não explicada" e conta como divergência em D7. A decisão inclui a fórmula (F1 ou F2) quando a escolha for a ou b. Sem sugestão do autor: o limiar é regra analítica.

**D6 — Segunda fonte ou ferramenta.**

| Alternativa | Independência | Custo para o responsável |
| :-- | :-- | :-- |
| a) NASA FIRMS (VIIRS), comparada com a série VIIRS do INPE | Distribuidor e processamento distintos; mesmos sensores, portanto sem independência da observação física | Cadastro gratuito para obter a `MAP_KEY` (ação externa); a chave fica só em `local/` |
| b) QGIS (gratuito): ponto no polígono dos mesmos arquivos, feito pelo responsável | Ferramenta distinta, mesma fonte | Instalar e operar o QGIS |
| c) Exportação do BDQueimadas (WebGIS do INPE) por área, com o mesmo período | Caminho de acesso distinto, mesma base | Exportar e entregar o arquivo em `local/` |

Mais de uma alternativa pode ser escolhida. Sugestão do autor: a, com b se o responsável puder operar o QGIS.

**D7 — Critério de viabilidade.** Componentes: U, uso permitido da fonte (obrigatório em todas as alternativas); C, lacunas de disponibilidade da série principal (ver "Cobertura"); K, meses que concordam, agregados conforme D9; M, porcentagem de casos manuais que conferem, conforme D8.

A decisão inclui a unidade de C, quando a série principal tiver mais de um satélite:

- C-d: dias distintos com ao menos um satélite em lacuna conhecida ou incidência indeterminada;
- C-p: pares dia e satélite nessa condição.

Exemplo fictício de C, com dois satélites X e Y na série principal: no dia 12, X tem 1 registro de manhã e um aviso de falta de imageamento que atinge parte de Colniza em outra passagem; no dia 20, há lacuna conhecida em X e em Y; no dia 25, há aviso de incidência indeterminada para Y. C-d = 3 (dias 12, 20 e 25); C-p = 4 (12-X, 20-X, 20-Y, 25-Y). Exemplo fictício dos demais componentes: U atendido; K = 2 de 3; M = 94,1%.

| Alternativa | Resultado com C-d | Resultado com C-p |
| :-- | :-- | :-- |
| a) U; C = 0; K = 3 de 3; M ≥ 90% | inviável (C e K) | inviável (C e K) |
| b) U; C ≤ 3, todos declarados; K ≥ 2 de 3, com a divergência explicada; M ≥ 90% | viável | inviável (C = 4) |
| c) Sem critério numérico: o relatório expõe U, C, K e M com as limitações, e o responsável conclui | decisão do responsável | decisão do responsável |

Em a e b, se K ou M forem indeterminados (D8 e D9), a conclusão é "evidência insuficiente", nunca viável ou inviável; a situação passa a "Parado", com a pergunta ao responsável entre uma nova decisão (por exemplo, outra alternativa de D6 ou mais casos) e o encerramento com essa conclusão. Em qualquer alternativa, dias sem registro e sem evidência de lacuna são relatados como "cobertura não comprovada", com sua quantidade. Se nenhuma fonte de focos tiver uso permitido, o ciclo é reavaliado (critério de descarte da ideação). Sem sugestão do autor.

**D8 — Casos manuais inconclusivos.** Mínimo de 10 casos conclusivos e máximo de 20 casos no total, os limites decididos na ideação. Exemplo fictício 1: 18 casos, 16 conferem, 1 não confere, 1 inconclusivo. Exemplo fictício 2: 10 casos, todos inconclusivos (por exemplo, catálogo de versão diferente e mapa sem resolução para concluir).

| Alternativa | Exemplo 1 | Exemplo 2 |
| :-- | :-- | :-- |
| a) Inconclusivo sai do denominador; com menos de 10 conclusivos, M é indeterminado | 16 / 17 = 94,1% | indeterminado (0 conclusivos) |
| b) Inconclusivo conta como não confere | 16 / 18 = 88,9% | 0 / 10 = 0% |
| c) Como a, mas o responsável escolhe casos novos até haver 10 conclusivos ou 20 casos no total, o que vier primeiro; se ainda faltarem conclusivos, M é indeterminado | 16 / 17 = 94,1% (sem reposição) | até 10 casos novos; com 6 conclusivos, todos conferindo, 6 < 10 e M é indeterminado |

Em todas, os inconclusivos são relatados com o motivo e as evidências ficam preservadas. M indeterminado leva D7 a ou b a "evidência insuficiente". Só a alternativa b atribui valor a um inconclusivo, e por regra escolhida pelo responsável. Sem sugestão do autor.

**D9 — Agregação de K.** Cada comparação de D6 a ou c classifica mês e satélite segundo D5; K conta meses. Duas partes a decidir.

Entre satélites, no mesmo mês e método. Exemplo fictício, igual nos três meses, com F1 e tolerância de 10%: SNPP `A = 400`, `B = 410` (2,5%); NOAA-20 `A = 380`, `B = 390` (2,6%); NOAA-21 `A = 300`, `B = 200` (33,3%).

| Alternativa | K do exemplo |
| :-- | :-- |
| S1) O mês concorda se todos os satélites concordam | 0 |
| S2) O mês concorda se a maioria dos satélites concorda | 3 |
| S3) O mês concorda se a soma dos satélites concorda pela fórmula de D5 (`A = 1.080`, `B = 1.000`, 7,4%) | 3 |

Entre métodos, quando D6 incluir a e c. Exemplo fictício: em setembro, a concorda e c diverge.

| Alternativa | Setembro |
| :-- | :-- |
| H1) O mês concorda só se todos os métodos concordam | diverge |
| H2) K vem só do método indicado pelo responsável; os demais são informativos | conforme o método indicado |

Regras comuns, sem decisão analítica: um satélite sem comparação disponível num mês sai da agregação daquele mês e é declarado; um mês sem nenhum satélite comparável tem K indeterminado; um método inteiro indisponível (por exemplo, FIRMS sem histórico para o período) sai de K e é declarado, e sem nenhum método disponível K é indeterminado e a situação passa a "Parado" para nova decisão de D6. D6 b não entra em K (ver "Contrato de comparação"). Sem sugestão do autor.

### Contrato de comparação

Séries calculadas, para que nenhuma comparação seja apresentada como validação de uma série que ela não testa:

- **P, principal:** satélites de D1 (em d, o de referência), território de D2 (em a, `municipio_id`; em b ou c, polígono IBGE), fuso principal de D3, unidade de D4 a.
- **E, espacial:** como P, mas sempre pelo polígono IBGE. Com D2 b ou c, E = P.
- **Mu, municipal:** como P, mas sempre por `municipio_id`. Com D2 a, Mu = P.
- **V, VIIRS:** satélites VIIRS (SNPP, NOAA-20, NOAA-21, com os valores de `satelite` identificados no item 1), por satélite, polígono IBGE, fuso principal, unidade registro. Calculada somente com D6 a, qualquer que seja D1.

E e Mu são sempre calculadas, e a ligação entre elas é a lista de divergências de D2 (diferença simétrica). Assim, quando P = Mu, as comparações abaixo validam E, e P se liga a E pela lista de divergências; o relatório diz, para cada comparação, qual série ela valida.

| D6 | Série do INPE | Série comparada | Território | Fuso | Unidade e filtros | Papel |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| a | V | FIRMS `VIIRS_SNPP_*`, `VIIRS_NOAA20_*`, `VIIRS_NOAA21_*`; SP quando a API de disponibilidade cobrir todo o período, senão NRT; nunca SP e NRT misturados no mesmo satélite e mês. Consulta pelo retângulo de Colniza dos metadados IBGE (`-61.6334,-10.0495,-58.9384,-8.7966`, oeste, sul, leste, norte), em janelas consecutivas sem sobreposição de até 5 dias (`DAY_RANGE` de 1 a 5) | Polígono IBGE nas duas séries | Fuso principal; `acq_date` e `acq_time` do FIRMS interpretados em UTC | Registro publicado; nenhum filtro de confiança em nenhuma série. Diferença de algoritmo entre distribuidores é causa a explicar, não ajuste | Entra em K |
| b | E | A mesma regra executada no QGIS pelo responsável, com os mesmos arquivos e a mesma malha | Polígono IBGE | Fuso principal | Igual. D5 não se aplica: as contagens devem ser idênticas | Verificação de correção; não entra em K |
| c | E | Exportação do WebGIS pelo retângulo acima, satélites de D1 e período do fuso principal, filtrada pelo mesmo polígono | Polígono IBGE. Se o WebGIS só permitir filtro municipal, compara-se Mu com a exportação municipal, e isso é declarado | Fuso principal | Igual a E (ou a Mu) | Entra em K |

Em D6 b, qualquer diferença é investigada. Defeito confirmado no script: corrigir na própria issue, com teste que o reproduza, e reexecutar todas as séries e comparações. Defeito no procedimento do QGIS: registrar e refazer. Diferença sem causa encontrada: K fica indeterminado até a resolução e a situação passa a "Parado". O relatório registra a diferença, a causa e a correção.

Comparar os mesmos sensores por outro distribuidor ou ferramenta valida o caminho de obtenção e de processamento; não torna a observação física independente. Essa limitação vai para o relatório.

### Cobertura

Para cada dia do trimestre, no fuso principal, e cada satélite de P, registram-se dois atributos independentes:

- **Detecção:** com registro (ao menos um registro em Colniza) ou sem registro.
- **Disponibilidade:**
  - **lacuna conhecida:** aviso do INPE (ou indisponibilidade na API do FIRMS, se D6 a) cuja faixa sem dados intersecta o polígono de Colniza, total ou parcialmente, com a evidência citada;
  - **incidência indeterminada:** há aviso para a data, mas não foi possível determinar se a faixa intersecta o polígono;
  - **sem evidência de lacuna:** nenhum aviso aplicável. Não significa cobertura comprovada.

Todas as combinações são possíveis: um dia pode ter registro e lacuna conhecida parcial. C conta lacuna conhecida e incidência indeterminada independentemente da detecção, na unidade escolhida em D7. A incidência é verificada pelas imagens indicadas no próprio aviso (por exemplo, o link para o Worldview): se a faixa sem imageamento não toca o retângulo de Colniza, não há incidência; se toca, confere-se contra o polígono, e a interseção parcial basta. Sem evidência conclusiva, a classe é "incidência indeterminada". O relatório traz a tabela cruzada detecção × disponibilidade e declara os dias "sem registro, sem evidência de lacuna" como cobertura não comprovada. Um registro de outro satélite não muda os atributos de um satélite de P.

### Roteiro da conferência manual

O responsável escolhe de 10 a 20 casos (sugestão: misturar meses, satélites, pontos perto da divisa e divergências de D2). Para cada caso, conferem-se três propriedades, separadas:

- **P1, catálogo:** o registro aparece no WebGIS do BDQueimadas com o mesmo instante, satélite e coordenadas (quatro casas decimais iguais). Verifica obtenção e versão.
- **P2, território:** o ponto, sobre a camada de limites (malha IBGE registrada no QGIS, ou camada do WebGIS com fonte e data declaradas), está dentro ou fora de Colniza como o script indica. Verifica o ponto no polígono.
- **P3, período:** o mês atribuído pelo script, pela regra de D3, confere com o cálculo manual a partir do instante GMT.

Cada propriedade recebe "confere", "não confere" ou "inconclusivo", com motivo (por exemplo, ponto mais perto da divisa do que a resolução visual permite distinguir, ou registro ausente no visualizador por diferença de versão). O caso confere quando as três conferem; diverge quando alguma não confere; é inconclusivo quando nenhuma diverge e alguma é inconclusiva (tratamento em D8).

Registro mínimo por caso, no relatório: `id` público do INPE, coordenadas, instante GMT, satélite, visualizador e camada com versão ou data de acesso, propriedade verificada, resultado esperado pelo caminho independente, resultado do script, quem conferiu, data e motivo de divergência ou inconclusão. As coordenadas são dados públicos da fonte, sem atributos de pessoas ou imóveis. A inspeção visual de um ponto não comprova a ocorrência de incêndio.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar o rascunho do plano ("autorizo o rascunho do plano do ciclo 001") | Ideação registrada | Este rascunho, a branch local `chore/cycle-001-plan` e a reserva do plano em `cycles.md` | Revisão, aprovação, publicação, issues | Concedido em 2026-11-03 |
| Aprovar plano ("aprovo o plano do ciclo 001") | Veredito apto na revisão formal; D1 a D9 respondidas pelo responsável e registradas no plano | Push de `chore/cycle-001-plan` e abertura da PR documental (ideação e plano); depois da integração, apresentação do payload e criação das três issues; encerramento prospectivo do ciclo | Merges, implementação, ação externa, qualquer mudança de D1 a D9 | Veredito, ressalvas e decisões registradas |
| Aprovar merge da PR documental ("aprovo o merge da PR #N") | Checks verdes | Squash da PR documental | Issues ainda não confirmadas | Checks e diff |
| Autorizar implementação ("autorizo a implementação da issue #N"), uma por issue | Plano aprovado e integrado, issue criada, issue anterior integrada | Branch, task, scripts, testes, obtenção dos dados públicos em `local/`, commits, push e PR da issue | Merge, outra issue, nova dependência, serviço pago, mudança de regra | Issue e escopo |
| Ação humana externa ("concluí a ação externa da issue #N") | Issue 1 (obter a `MAP_KEY`, se D6 incluir a) e issue 3 (escolher e conferir os casos pelo roteiro; contar no QGIS, se D6 incluir b) | Retomada da issue depois da ação | Leitura ou registro da chave em arquivo versionado | Roteiro do item correspondente |
| Aprovar merge ("aprovo o merge da PR #N"), uma por PR | Checks verdes, gates locais registrados na task | Squash daquela PR | Qualquer outra PR | Checks e diff |

Não há verificação em produção neste ciclo. Toda cadeia autorizada para em "Parado" quando: uma fonte se mostrar de uso não permitido; um dado pessoal ou restrito aparecer; for necessária nova dependência, serviço pago ou cadastro não previsto; os dados contradisserem uma premissa de D1 a D9 (por exemplo, o satélite de referência não existir nos arquivos); ou o SHA-256 de um arquivo mudar entre execuções.

## Barreiras de domínio

A coluna `Aplica-se?` aceita somente `Sim` ou `Não`; justificar cada linha.

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Contagens, janelas temporais e ponto no polígono. Regras decididas pelo responsável (D1 a D9); casos de referência fictícios calculados à mão nos testes; proveniência com SHA-256; comparação com segunda fonte ou ferramenta (D6); 10 a 20 casos conferidos em mapa; limitações no relatório. Modo contínuo proibido |
| G2 — autenticação, autorização e isolamento por RLS | Não | Não há banco, tabela, autenticação nem usuário neste ciclo |
| G3 — privacidade de dados | Sim | Somente fontes públicas, em nível de ponto e município, sem atributos de pessoas ou imóveis. Brutos só em `local/`; CSV só em `tests/fixtures/` com dados fictícios; a `MAP_KEY`, se houver, só em `local/prova-dados/.env`, lida em memória e substituída por `{MAP_KEY}` em manifesto, relatório, logs e mensagens de erro, nunca em task ou PR; o relatório guarda agregados e coordenadas apenas dos casos conferidos, que são de fonte pública |
| G4 — migrações só acrescentam | Não | Nenhuma migração é criada ou alterada |

## Estratégia de testes

- Unitários com `node --test scripts/prova-dados/`: leitura do CSV do INPE (aspas, espaços antes dos números, linhas vazias), filtro por satélite (D1), ponto no polígono por ray casting com polígono fictício e casos de borda (vértice, divisa, buraco, multipolígono), atribuição de mês em GMT e em UTC−4 (D3), com as transições `03:59:59Z`/`04:00:00Z` e `23:59:59Z`/`00:00:00Z` no início do trimestre, em cada virada de mês e no fim, e contagem (D4 a).
- Divergências de D2 como diferença simétrica dos conjuntos de `id`, com a fixture do exemplo de D2 (4 divergências).
- Cobertura: atributos de detecção e disponibilidade por dia e satélite, com fixture que inclua o exemplo de D7 (dia com registro e lacuna parcial; lacuna em dois satélites no mesmo dia; incidência indeterminada), um aviso cuja faixa toca o retângulo mas não o polígono e um dia sem registro nem aviso; C-d = 3 e C-p = 4 no exemplo.
- Concordância de D5: fórmulas F1 e F2, os dois casos de denominador zero e os valores do exemplo de D5.
- Agregação de D9: S1, S2 e S3 e H1 e H2 com os valores dos exemplos de D9; satélite sem comparação; mês sem satélite comparável; método indisponível.
- M de D8: alternativas a, b e c com os exemplos 1 e 2 de D8, incluindo M indeterminado; e a conclusão "evidência insuficiente" de D7 quando K ou M forem indeterminados.
- Sanitização: nenhuma URL, log ou erro produzido pelos scripts contém o valor da chave usada no teste (chave fictícia).
- Casos de referência: fixtures fictícias pequenas em `tests/fixtures/prova-dados/`, cujas contagens esperadas foram calculadas à mão e estão escritas no próprio teste.
- Reprodutibilidade: rodar a contagem duas vezes sobre os arquivos com o mesmo SHA-256 e obter saída idêntica byte a byte.
- Independência: comparação com a segunda fonte ou ferramenta (D6) e casos manuais, registrados no relatório.
- Gates locais antes de cada PR: os testes acima, `node --test scripts/validate-governance.test.mjs`, `node scripts/validate-governance.mjs`, `git diff --check` e `git status --short` (sem arquivo de `local/` no índice).

## Itens de implementação

### Item 1 — Fontes e proveniência

**Contexto:** a verificação prévia identificou as fontes candidatas, mas não suas condições de uso nem as versões que serão usadas.

**Ação técnica:** criar `scripts/prova-dados/fontes.json` e `scripts/prova-dados/obter.mjs`, que baixa para `local/prova-dados/brutos/`:

- os três arquivos mensais do INPE (ago a out de 2026);
- com D3 b ou c, também `focos_diario_br_20261101.csv`;
- a malha IBGE de Colniza;
- com D6 a, os produtos VIIRS do FIRMS no contrato de comparação, em janelas consecutivas de `DAY_RANGE`.

Para cada arquivo, registrar em `fontes.json` (versionado) a URL sanitizada, a data de obtenção, o tamanho e o SHA-256; `local/prova-dados/proveniencia.json` guarda o mesmo registro e o log da execução. Levantar e registrar, com links: condições de uso de cada fonte; satélite de referência do INPE no período e os valores de `satelite` presentes; ano e qualidade da malha IBGE; avisos do INPE de ago a out de 2026; com D6 a, o limite de `DAY_RANGE`, a disponibilidade SP ou NRT de cada produto (`/api/data_availability/`) e as condições de uso do FIRMS; ausência de horário de verão no período.

Com D6 a, roteiro da ação externa: o responsável faz o cadastro gratuito no FIRMS e grava a chave em `local/prova-dados/.env` (o agente não cria conta nem vê a chave em chat). O script lê a chave desse arquivo apenas em memória, monta a URL na hora da requisição e registra só a forma com `{MAP_KEY}`.

**Critérios de aceite:**

- [ ] `obter.mjs` é idempotente: com os arquivos já presentes e o mesmo SHA-256, não baixa de novo; com SHA-256 diferente, para e informa.
- [ ] `fontes.json` traz URL sanitizada, data de obtenção, tamanho e SHA-256 de cada arquivo usado.
- [ ] Condições de uso de cada fonte registradas com link; fonte de uso não permitido leva a "Parado".
- [ ] Satélite de referência, valores de `satelite` e avisos do período registrados, com a fonte da informação.
- [ ] Com D6 a, produtos, versão SP ou NRT e janelas de consulta registrados; a soma das janelas cobre o intervalo do fuso principal sem lacuna nem sobreposição.
- [ ] Nenhum arquivo de `local/` no índice; o valor da chave não aparece em arquivo versionado, log ou erro (teste de sanitização).

### Item 2 — Contagem e cobertura de Colniza

**Contexto:** depende das regras D1 a D4 e dos arquivos do item 1.

**Ação técnica:** criar `scripts/prova-dados/contar.mjs` e módulos de apoio para ler os CSV em fluxo (sem carregar 144 MB de uma vez), aplicar D1 a D4, calcular ponto no polígono e emitir JSON determinístico com: as séries P, E e Mu (e V, com D6 a) do "Contrato de comparação", por mês e satélite; divergências entre `municipio_id` e polígono como diferença simétrica (D2); os atributos de detecção e disponibilidade por dia e satélite de P e o valor de C nas duas unidades, conforme a seção "Cobertura"; e a sensibilidade de fuso (D3), quando escolhida. A incidência territorial de cada aviso é verificada pelas imagens do aviso e registrada com evidência.

**Critérios de aceite:**

- [ ] Testes com os casos de referência fictícios passam.
- [ ] Duas execuções sobre os mesmos arquivos produzem saída idêntica.
- [ ] Séries P, E e Mu (e V), tabela cruzada detecção × disponibilidade, C-d, C-p e divergências registradas em rascunho no relatório, com o SHA-256 dos insumos.
- [ ] Nenhum dia sem registro e sem evidência de lacuna é relatado como coberto; cada aviso do período tem incidência sobre o polígono classificada com evidência ou como indeterminada, inclusive em dias com registro.
- [ ] O crescimento de focos citado pelo responsável é relatado como observado ou não observado, sem interpretação causal.

### Item 3 — Referência independente e relatório de viabilidade

**Contexto:** depende de D5 a D9 e do item 2.

**Ação técnica:** criar `scripts/prova-dados/comparar.mjs`, que aplica o contrato de comparação da alternativa escolhida em D6, classifica cada mês e satélite segundo D5 e calcula K segundo D9, declarando qual série cada comparação valida. Preparar a planilha de registro dos casos (em Markdown, no relatório) com os campos do roteiro da conferência manual. Ação externa: o responsável escolhe os casos e confere P1, P2 e P3 conforme o roteiro; com D6 b, também executa a contagem no QGIS. Consolidar o relatório `001_research_viabilidade.md` com fontes, versões, cobertura, contagens, comparação, casos, limitações (inclusive a não independência entre scripts e revisão do agente, e a não independência física de sensores iguais) e a conclusão nos termos de D7 a D9.

**Critérios de aceite:**

- [ ] Comparação registrada por mês e satélite, com fórmula, valores de `A` e `B` e a classificação de D5 (ou igualdade, em D6 b); diferenças explicadas citam a causa e a evidência.
- [ ] K por mês com a regra de D9, satélites e métodos excluídos declarados; com D6 b, diferença zero ou causa e correção registradas.
- [ ] Cada caso registrado com todos os campos do roteiro, o resultado de P1, P2 e P3 e a classificação do caso; inconclusivos tratados conforme D8, com M indeterminado quando for o caso.
- [ ] Relatório com U, C (na unidade de D7), K e M, conclusão de viabilidade segundo D7 (viável, inviável ou evidência insuficiente) e limitações explícitas, incluindo que focos não comprovam incêndio, dano, autoria ou infração.

## Arquivos afetados

- `scripts/prova-dados/` (novo): `fontes.json`, `obter.mjs`, `contar.mjs`, `comparar.mjs`, módulos de apoio e `*.test.mjs`.
- `tests/fixtures/prova-dados/` (novo): CSV e GeoJSON fictícios.
- `_project/drafts/001_prova_de_dados/`: `001_plan.md`, tasks e `001_research_viabilidade.md`.
- `_project/cycles.md`; no encerramento, `_project/knowledge/KB-003_visao_produto_requisitos.md` e a movimentação para `_project/executed/001_prova_de_dados/`.
- `package.json`: somente um script `test:prova-dados`, se útil; nenhuma dependência.
- Fora do Git: `local/prova-dados/`.

## Decomposição em issues e PRs

| Ordem | Issue | Prefixo e form | PR | Depende de |
| :-- | :-- | :-- | :-- | :-- |
| — | PR documental (ideação e plano), sem issue | — | branch `chore/cycle-001-plan` | Aprovação do plano |
| 1 | Fontes e proveniência da prova de dados | `[CHORE]`, `chore.yml` | `chore/issue-N` | PR documental integrada |
| 2 | Contagem e cobertura de Colniza | `[FEATURE]`, `feature_request.yml` | `feature/issue-N` | Issue 1 integrada; D1 a D4 |
| 3 | Referência independente e relatório de viabilidade | `[CHORE]`, `chore.yml` | `chore/issue-N` | Issue 2 integrada; D5 a D9; ação externa |
| — | Encerramento, sem issue | — | `chore/cycle-001-closure` | Issue 3 integrada |

Uma issue por PR. O encerramento é coberto pela aprovação do plano e exige aprovação de merge própria.

## Dependências e blockers

- D1 a D9 respondidas pelo responsável antes da aprovação do plano.
- Acesso de rede aos servidores do INPE, IBGE e, se escolhido, FIRMS.
- `MAP_KEY` do FIRMS obtida pelo responsável, se D6 incluir a.
- Nenhuma dependência de pacote; se uma se mostrar necessária, a situação passa a "Parado".

## Riscos, suposições e rollback

- **Arquivos regenerados pelo INPE:** o SHA-256 pode mudar. Mitigação: proveniência por hash e parada em mudança; a prova vale para a versão registrada.
- **Satélite de referência ausente ou trocado no período:** D1 a perde sentido. Mitigação: o item 1 confere antes da contagem; divergência leva a "Parado".
- **Condições de uso incompatíveis:** critério de descarte da ideação.
- **Malha IBGE de ano diferente do período:** divergências em D2. Mitigação: registrar o ano e listar divergências.
- **FIRMS sem histórico acessível pela `MAP_KEY` para o período:** D6 a falha. Mitigação: alternativas b e c de D6, com nova decisão do responsável.
- **Dias sem registro confundidos com cobertura:** o CSV não distingue ausência de fogo de ausência de observação. Mitigação: detecção e disponibilidade registradas à parte, com coexistência de registro e lacuna, e proibição de relatar dia sem registro como coberto.
- **Arquivo diário de 2026-11-01 diferente do recorte equivalente do mensal de novembro:** possível com D3 b ou c. Mitigação: registrar o SHA-256 do diário e declarar a limitação.
- **Vazamento da `MAP_KEY` por URL:** a chave vai no caminho da API. Mitigação: URL montada só em memória, forma sanitizada em todo registro e teste de sanitização.
- **Volume:** cerca de 370 MB de CSV. Mitigação: leitura em fluxo; nada versionado.
- **Independência limitada:** scripts e revisão do mesmo agente. Mitigação: segunda fonte ou ferramenta e casos escolhidos pelo responsável; limitação declarada.
- **Suposição:** Colniza não teve alteração de limite relevante entre a malha usada e o período.
- **Rollback:** cada PR é revertível por reversão do squash; os dados ficam em `local/` e podem ser apagados pelo responsável sem efeito no repositório.

## Sequência recomendada

1. Revisão formal deste plano; o responsável responde D1 a D9 (pode fazê-lo durante as rodadas).
2. Aprovação do plano, push de `chore/cycle-001-plan` e PR documental; merge com aprovação própria.
3. Criação das três issues, depois da confirmação do payload.
4. Issue 1, depois issue 2, depois issue 3, cada uma com autorização, PR e merge próprios.
5. PR de encerramento.

## Referências

- Ideação: `_project/ideations/001_prova_de_dados.md`.
- KB-003 (produto), ADR-002 (infraestrutura), ADR-003 (privacidade e publicação).
- INPE, diretório de focos: https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/ (consultado em 2026-11-03).
- INPE, portal BDQueimadas: https://terrabrasilis.dpi.inpe.br/queimadas/bdqueimadas/ (consultado em 2026-11-03).
- IBGE, API de serviços de dados: https://servicodados.ibge.gov.br/api/docs/ (consultado em 2026-11-03).
- NASA FIRMS, API: https://firms.modaps.eosdis.nasa.gov/api/ e https://firms.modaps.eosdis.nasa.gov/api/area/ (consultados em 2026-11-03); disponibilidade: https://firms.modaps.eosdis.nasa.gov/api/data_availability/ (citada na rodada 1).
- INPE, avisos do Programa Queimadas: https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/avisos/ (consultado em 2026-11-03).

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | — |
| PR(s) | — |
| Branch(es) | `chore/cycle-001-plan` (local, criada a partir de `chore/cycle-001-ideation`) |
| Destino após conclusão | `_project/executed/001_prova_de_dados/001_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 3) — ciclo 001 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 001"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 001 + rascunhar_plano + 001_plan + v3@51677ee`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` em `Em Revisão`, rodada 2 com `REQUER NOVA RODADA` (R2-1 a R2-3 bloqueadores, R2-4 ressalva), aguardando correções (rodada 2); a rodada estava sem commit e foi preservada intacta no commit local `51677ee`
- `state_after`: plano `v3` em `Em Revisão`, cada achado respondido em "Resposta do autor à Rodada 2 — v3", nova decisão D9, aguardando revisão (rodada 3); `cycles.md` sincronizado com a v3; ciclo `001` em `Planejamento`; commit local em `chore/cycle-001-plan`; nada publicado
- `result`: `executed`
- `evidence`: rodada 2 lida integralmente; rodadas 1 e 2 sem remoções no diff; testes e validador executados nesta branch
- `blockers`: nenhum para a rodada 3; a aprovação exige as respostas do responsável a D1 a D9

## Revisão crítica

### Rodada 1

**Data:** 2026-11-03.

**Autor:** Claude, modelo Opus 5.5, conforme trailer de coautoria do commit `c7388538da75a4993112dd8d691c0761757e2783`; interface de autoria não registrada.

**Revisor:** Codex, GPT-6; variante exata não informada nesta sessão.

**Base revisada:** `v1` no commit acima, branch local `chore/cycle-001-plan`. Não havia rodada anterior nem alteração preexistente. Conferidos `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, ideação, ADR-001 a ADR-004, KB-003, workflow `revisar_plano` e template `plano_implementacao`.

#### R1-1 — Bloqueador: obtenção incompleta para D3 b/c

O item 1 obtém somente os três CSV mensais de agosto a outubro. D3 b e a sensibilidade de D3 c precisam também de registros de novembro. Para UTC−4, o intervalo completo é `[2026-08-01T04:00:00Z, 2026-11-01T04:00:00Z)`. Com os três arquivos, perde-se o fim de outubro local. Corrigir obtenção, manifesto e dependências conforme as alternativas mantidas em D3; declarar limites inclusivo/exclusivo e testar as transições, inclusive o encerramento do trimestre. Não escolher o fuso pelo responsável.

#### R1-2 — Bloqueador: dias sem registros não comprovam cobertura

O item 2 mede dias sem detecção por satélite, enquanto D7 a/b exige cobertura sem lacunas. Um dia com zero registros em Colniza pode significar ausência de detecções ou falta de observação/processamento; o CSV de focos, sozinho, não distingue as situações. Há um aviso oficial de falta de imageamento AQUA em parte da América do Sul em **12/08/2026**, dentro do recorte; não foi verificado se Colniza foi afetada. Fonte: [avisos do INPE](https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/avisos/).

Definir evidência de disponibilidade/cobertura separada das contagens, verificar a incidência territorial dos avisos e explicitar cobertura desconhecida. Ajustar os critérios de aceite e as alternativas de D7 para não converter ausência de registros em cobertura comprovada nem concluir viabilidade sem essa evidência. A decisão analítica permanece humana.

#### R1-3 — Bloqueador: comparação independente sem contrato compatível

D6 a compara VIIRS, mas D1 também permite contar apenas o satélite de referência ou todos os satélites. Não está garantida uma série VIIRS auxiliar nessas combinações. D6 c pode usar a atribuição municipal do INPE enquanto D2 b/c usa a malha IBGE, produzindo diferenças territoriais que não são erro do contador. Além disso, D5 c pede explicar diferenças sem definir "concorda", classificação consumida por D7 a/b.

Especificar, para cada combinação admitida de D1/D2/D5/D6/D7, as séries efetivamente comparáveis, a atribuição territorial, o fuso, a unidade, os filtros, a fórmula percentual e o caso de denominador zero. Se FIRMS for mantido, identificar satélites/produtos equivalentes, versões NRT/SP, disponibilidade histórica e paginação temporal. A [API de área do FIRMS](https://firms.modaps.eosdis.nasa.gov/api/area/) distingue os produtos e limita cada consulta a 1–5 dias; a [API de disponibilidade](https://firms.modaps.eosdis.nasa.gov/api/data_availability/) permite conferir os períodos. Essas verificações não foram executadas com chave nesta revisão. Comparar os mesmos sensores por outro distribuidor valida o caminho de obtenção/processamento; não torna a observação física independente.

#### R1-4 — Bloqueador: exemplo de D2 tem quatro divergências

No exemplo, o filtro municipal contém 100 registros e a interseção com o polígono contém 97. Há `100 − 97 = 3` registros só no filtro municipal e mais 1 só no polígono: **4 divergências**, não 3. A contagem espacial de 98 está correta. Corrigir o exemplo e esclarecer o terceiro registro externo, pois só dois externos são descritos. Usar a diferença simétrica dos conjuntos na comparação e nas fixtures de referência.

#### R1-5 — Bloqueador: conferência manual sem resultado esperado definido

O item 3 pede anotar "confere ou não confere", mas não define se a conferência avalia presença no catálogo, localização, mês, sensor ou pertencimento ao município. D7 a/b usa a porcentagem desses resultados como critério de viabilidade. Sem um critério comum, os 10–20 casos não produzem uma medida interpretável nem reproduzível.

Definir o roteiro e o registro mínimo: identificador público do caso, coordenadas, instante/satélite, fonte e versão do mapa/malha, propriedade verificada, resultado esperado obtido pelo caminho independente, resultado do script, responsável/data e motivo da divergência. Separar a comparação de versões/catálogos da validação de ponto no polígono e admitir caso inconclusivo, com tratamento proposto ao responsável antes da aprovação. A inspeção visual de um ponto não comprova ocorrência de incêndio.

#### R1-6 — Ressalva: D4 b exige especificação adicional

A contagem por célula de 1 km depende de projeção, origem da grade, regra de borda e combinação de satélites. Esses parâmetros não aparecem nos itens ou testes. Se D4 b continuar elegível, apresentar a especificação e os exemplos para decisão humana e refletir o resultado no escopo; caso contrário, retirar a alternativa na correção autorizada. A ressalva torna-se bloqueadora se b for escolhida sem esse detalhamento.

#### R1-7 — Ressalva: proveniência do FIRMS pode conter a chave

O manifesto versionado exige URL e a API FIRMS inclui a `MAP_KEY` no caminho. O plano proíbe expor a chave, mas não explicita como registrar a URL. Declarar URL parametrizada/sanitizada no manifesto, relatório e mensagens de erro, mantendo a chave carregada de `local/` somente em memória durante a requisição. Incluir a data de obtenção junto aos hashes nas evidências versionadas, como exige a ideação; o arquivo local de proveniência não basta para quem recebe somente o repositório.

#### Itens atendidos e verificações

- Objetivo, recorte Colniza/ago–out de 2026 e exclusões preservam a ideação e a KB-003; não há implementação, arquitetura ou seleção de áreas antecipadas.
- Nível completo, modo contínuo desativado, três issues sequenciais, aprovação humana posterior ao parecer e merge específico por PR estão coerentes com as autoridades. D1 a D7 estão corretamente identificadas como decisões humanas ainda pendentes; esta revisão não as responde.
- G1/G3 aplicáveis e G2/G4 não aplicáveis são coerentes com a prova sem banco/migração. Não foram encontrados dados pessoais, credenciais ou dados privados no texto revisado. Nenhum material de `local/` foi lido ou criado.
- Baselines `e3c785b` e `e128bf5` conferidos no Git local. Sem issue associada ou PR do ciclo declarada; nenhum estado remoto foi presumido.
- INPE: três URLs responderam HTTP 200 a HEAD, com tamanhos de 103.708.076, 123.024.987 e 144.148.591 bytes e modificação no dia 1 do mês seguinte. Leitura parcial HTTP 206 confirmou o cabeçalho CSV. [Diretório oficial](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/). Não foram baixados os arquivos completos nem calculados seus hashes.
- IBGE: consultas somente leitura confirmaram Colniza/MT, código `5103254`, e resposta GeoJSON do endpoint municipal. Ano, qualidade, condições de uso e área declarada não foram confirmados nesta revisão; continuam verificações do item 1. A página de documentação não respondeu à consulta pelo navegador de pesquisa.
- Validações locais: Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes aprovados, zero falhas; `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais; `git diff --check`: sem erros. Diff inspecionado: somente status/veredito, rodada e blocos de próximo passo/handoff deste plano; `git status --short` mostra somente este arquivo modificado, sem staging. Os gates de governança verificam estrutura; não eliminam os bloqueadores analíticos deste parecer.

**Veredito:** `REQUER NOVA RODADA` — corrigir R1-1 a R1-5, responder R1-6/R1-7, preservar esta rodada e incrementar a versão na correção. Nenhuma implementação, aprovação, publicação ou decisão analítica foi realizada. As decisões D1 a D7 continuam sendo precondição da futura aprovação humana.

### Resposta do autor à Rodada 1 — v2

**Autor:** Claude Code, modelo Opus 5.5 (`claude-opus-5-5`). **Data:** 2026-11-03. A rodada 1 estava sem commit; foi preservada sem alteração no commit `f61195e` antes desta correção.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R1-1 | Corrigido. Intervalos com início inclusivo e fim exclusivo para GMT e UTC−4; com D3 b ou c, obtenção de `focos_diario_br_20261101.csv` (fechado) em vez do mensal de novembro (ainda crescente); testes das transições no início, em cada virada de mês e no fim do trimestre. O fuso continua decisão do responsável | D3, item 1, estratégia de testes, riscos |
| R1-2 | Corrigido. Nova seção "Cobertura" com quatro classes por dia e satélite; dia sem registro nunca é relatado como coberto; incidência de cada aviso verificada pelas imagens do aviso ou classificada como indeterminada. O aviso de 12/08/2026 foi conferido e está no baseline. D7 reescrita com o componente C, sem converter ausência de registro em cobertura | Baseline, D7, "Cobertura", item 2 |
| R1-3 | Corrigido. Novo "Contrato de comparação" por alternativa de D6: série VIIRS de comparação calculada qualquer que seja D1; território sempre pelo polígono IBGE nas duas séries (D6 c com WebGIS só municipal compara contra D2 a e declara); fuso principal; unidade registro; sem filtro de confiança; SP ou NRT sem mistura; consulta em janelas consecutivas de `DAY_RANGE`. D5 passa a ter fórmulas F1 e F2, tratamento de denominador zero e definição de "concorda" em c (diferença integralmente explicada por causa documentada). D6 b exige igualdade. A não independência física de sensores iguais foi declarada | D5, D6, "Contrato de comparação", itens 1 e 3 |
| R1-4 | Corrigido. Exemplo com 3 registros só no campo (2 perto da divisa e 1 a cerca de 3 km) e 1 só no polígono: 4 divergências, calculadas como diferença simétrica dos `id`, também nas fixtures | D2, estratégia de testes |
| R1-5 | Corrigido. Novo "Roteiro da conferência manual" com as propriedades P1 (catálogo), P2 (território) e P3 (período), resultado inconclusivo, regra de classificação do caso e registro mínimo. O tratamento de inconclusivos virou a decisão D8, com exemplo numérico, a responder antes da aprovação. A inspeção visual não comprova incêndio | D8, roteiro, item 3 |
| R1-6 | Respondido. D4 b não é especificada nem implementada nesta versão; escolher b exige nova versão do plano com projeção, grade, borda, combinação de satélites, exemplos e testes, antes da aprovação. A decisão do responsável é confirmar a ou pedir essa versão | D4 |
| R1-7 | Corrigido. Chave lida de `local/prova-dados/.env` só em memória; URL registrada com `{MAP_KEY}` em manifesto, relatório, logs e erros; teste de sanitização. `fontes.json` (versionado) passa a trazer data de obtenção, tamanho e SHA-256 | Escopo, G3, item 1, estratégia de testes |

Mudança de numeração: as decisões pendentes passam a ser D1 a D8 (D8 nova, por R1-5). As referências a "D1 a D7" nas seções do plano foram atualizadas; as da rodada 1 foram preservadas.

### Rodada 2

**Data:** 2026-11-03.

**Autor:** Claude Code, Opus 5.5 (`claude-opus-5-5`), conforme identificação na resposta do autor e coautoria do commit da v2.

**Revisor:** Codex, GPT-6; variante exata não informada nesta sessão.

**Base revisada:** `v2`, commit `de95aaf078bc7d498fd88c5a9614178c9da28fcc`, branch `chore/cycle-001-plan`, inicialmente limpa. Conferidos plano completo, resposta do autor, ideação, KB-003, autoridades, workflow `revisar_plano` e template `plano_implementacao`. Somente o plano mudou desde `f61195e`; a rodada 1 foi comparada com aquele commit e está preservada.

#### Conferência dos achados anteriores

| Achado | Resultado da revisão da v2 |
| :-- | :-- |
| R1-1 | Atendido: diário de 01/11 incluído, intervalos semiabertos e testes de transição previstos. Existência do diário confirmada nesta rodada |
| R1-2 | Parcialmente atendido: a ausência de registros deixou de representar cobertura comprovada, mas a classificação ainda perde lacunas parciais em dias com registros; ver R2-1 |
| R1-3 | Parcialmente atendido: séries VIIRS auxiliares, produtos, fórmulas e filtros explicitados; permanecem combinações territoriais contraditórias e falta a agregação para K; ver R2-2 |
| R1-4 | Atendido: quatro divergências e diferença simétrica corretas |
| R1-5 | Atendido quanto ao roteiro: P1/P2/P3, registro mínimo e classificação definidos. A nova D8 apresenta um caso de cálculo não definido, registrado em R2-3 |
| R1-6 | Atendido: D4 b requer outra versão antes da aprovação; a implementação desta versão fica condicionada à confirmação humana de D4 a |
| R1-7 | Atendido: URL sanitizada, chave somente em memória, teste específico e data de obtenção no manifesto versionado |

#### R2-1 — Bloqueador: registros e lacunas de cobertura podem coexistir

Em "Cobertura", todas as classes de lacuna exigem **sem registro**, enquanto qualquer detecção classifica o dia como **com registro**. Exemplo fictício: o satélite registra 1 foco pela manhã e há perda de imageamento que afeta parte de Colniza em outra passagem do mesmo dia. A regra atual só admite "com registro" e não leva a lacuna a C. A instrução de verificar todos os avisos no item 2 não resolve essa incompatibilidade entre as classes.

Separar presença de detecção da evidência de disponibilidade, ou admitir explicitamente a coexistência de registro e lacuna conhecida/indeterminada. A incidência deve considerar interseção parcial com o território, não apenas ausência sobre todo o retângulo. Especificar também se C conta dias distintos ou pares dia/satélite quando D1 inclui vários satélites; exemplo fictício: lacuna em dois satélites no mesmo dia produz 1 dia ou 2 pares. Refletir as alternativas em D7, critérios de aceite e casos de teste, sem escolher a regra pelo responsável. Trata-se de atendimento incompleto de R1-2, não de reabertura de achado anteriormente aceito.

#### R2-2 — Bloqueador: a comparação ainda não determina K nem todas as combinações de D2/D6

D5 e o item 3 classificam **mês e satélite**, mas D7 usa K como **meses** concordantes. Não há regra para combinar os satélites, nem os métodos quando D6 inclui mais de uma alternativa. Exemplo fictício: em cada um dos três meses, SNPP e NOAA-20 concordam e NOAA-21 diverge. Exigir todos os satélites dá K = 0; aceitar ao menos um dá K = 3. A decisão de viabilidade muda com os mesmos resultados. Também não está definido o efeito de um defeito encontrado no QGIS quando outra comparação concorda.

Além disso, D6 b chama de "série principal" uma série obrigatoriamente calculada por D2 b, embora D2 a permaneça elegível para a principal. No exemplo já aprovado matematicamente em D2, isso confunde a principal de 100 com a espacial de 98. D6 c apresenta a mesma ambiguidade antes do fallback municipal.

Definir as séries principal e auxiliar por alternativa territorial, restringir explicitamente combinações incompatíveis e apresentar a regra de passagem das classificações por satélite/método para K. Incluir o comportamento diante de comparação indisponível e defeito confirmado. Fórmula, limiar e agregação devem ser apresentados para decisão humana antes da aprovação; não podem ficar a cargo da implementação. É a parte ainda não atendida de R1-3.

#### R2-3 — Bloqueador: D8 a permite M indefinido

Em D8 a, todos os inconclusivos saem do denominador. Com 10 casos escolhidos e os 10 inconclusivos, M é `0 / 0`; D7 a/b não consegue avaliar `M ≥ 90%`. O roteiro admite esse resultado, por exemplo quando o catálogo diverge de versão e o mapa não permite concluir os casos. D8 c também não define como encerrar a conferência se não for possível obter dez casos conclusivos.

Apresentar o tratamento de denominador zero e de insuficiência de casos conclusivos nas alternativas de D8, com exemplo numérico e consequência explícita para D7 e para o aceite do relatório. Definir uma saída quando a reposição de casos não resolve a insuficiência, preservando as evidências e sem exigir tentativas ilimitadas. Não converter ausência de evidência em 0% ou 100% por decisão do agente. A definição deve ser submetida ao responsável junto com D8.

#### R2-4 — Ressalva: registro de ciclos ainda descreve a v1

`_project/cycles.md` continua apresentando o plano como "rascunho v1", embora o artefato seja v2 em revisão. Sincronizar o rótulo na próxima correção autorizada. O ciclo permanece corretamente em `Planejamento`; esta revisão não altera o registro de ciclos.

#### Itens atendidos, evidências e limites

- Escopo, sequência das três issues, pontos de aprovação e G1 a G4 continuam coerentes com a ideação e a KB-003. Nenhuma decisão D1 a D8 foi tomada nesta revisão; nenhuma aprovação anterior foi presumida.
- O [diretório diário do INPE](https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/diario/Brasil/) lista `focos_diario_br_20261101.csv`; HEAD respondeu HTTP 200, tamanho 3.799.558 bytes, `Last-Modified` em 02/11/2026. Isso comprova disponibilidade atual, não imutabilidade ou retenção futura; valem o hash e a parada previstos no plano.
- A [API FIRMS](https://firms.modaps.eosdis.nasa.gov/api/area/) confirma produtos, ordem oeste/sul/leste/norte e `DAY_RANGE` de 1 a 5 dias. Não foi usada chave nem consultado histórico autenticado.
- Consultas somente leitura à [malha municipal do IBGE](https://servicodados.ibge.gov.br/api/v3/malhas/municipios/5103254?formato=application/vnd.geo+json) e aos [metadados](https://servicodados.ibge.gov.br/api/v3/malhas/municipios/5103254/metadados) responderam HTTP 200. Extremos calculados dos 2.643 vértices coincidem com o retângulo do plano; metadados confirmam área de 27.960,237 km². Ano/qualidade e condições de uso permanecem verificações do item 1.
- O [aviso INPE de 12/08/2026](https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/avisos/) permanece disponível. Não foi determinada nesta rodada sua incidência sobre Colniza; R2-1 usa exemplo fictício, não afirma uma lacuna territorial observada.
- Revisados texto e diff quanto a G3, sem credenciais ou dados pessoais encontrados. Nenhum arquivo de `local/` foi acessado ou criado; nenhum CSV completo foi baixado. Não há issue ou PR do ciclo declarada; não foi presumido estado remoto.
- Gates executados em Node.js `v24.15.0`: 55 testes de governança aprovados, zero falhas; validador com zero erros, zero avisos e nove itens manuais; `git diff --check` sem erros antes do parecer. A validação estrutural não comprova a suficiência analítica de C, K ou M. Conferência final do diff e do bloco de saída registrada no handoff.

**Progresso:** três dos cinco bloqueadores originais foram atendidos, dois foram atendidos parcialmente e uma lacuna foi identificada na nova D8. As duas ressalvas anteriores foram atendidas. Há progresso material, sem contestação persistente nem oscilação de correção já aceita; prosseguir para correção e rodada 3, dentro do teto de cinco rodadas.

**Veredito:** `REQUER NOVA RODADA` — corrigir R2-1 a R2-3, responder R2-4 e preservar as rodadas e respostas anteriores. A versão continua v2 durante esta revisão; será incrementada pelo autor na correção. D1 a D8 continuam pendentes de decisão humana antes da aprovação. Efeito desta rodada limitado ao registro local da revisão e aos campos/blocos de estado correspondentes.


### Resposta do autor à Rodada 2 — v3

**Autor:** Claude Code, modelo Opus 5.5 (`claude-opus-5-5`). **Data:** 2026-11-03. A rodada 2 estava sem commit; foi preservada sem alteração no commit `51677ee` antes desta correção.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R2-1 | Corrigido. "Cobertura" passa a registrar dois atributos independentes por dia e satélite de P, detecção e disponibilidade, com coexistência explícita de registro e lacuna. A incidência considera interseção total ou parcial com o polígono (o retângulo é só triagem). C conta lacuna conhecida e incidência indeterminada independentemente da detecção, e a unidade (C-d, dias distintos, ou C-p, pares dia e satélite) passa a ser parte da decisão D7, com o exemplo do revisor (C-d = 3, C-p = 4) mudando o resultado de D7 b. Testes e critérios do item 2 atualizados | D7, "Cobertura", item 2, estratégia de testes |
| R2-2 | Corrigido. O contrato define as séries P, E, Mu e V e diz qual série cada comparação valida; com D2 a, as comparações validam E, e P se liga a E pela lista de divergências de D2. Nenhuma combinação é proibida, mas nenhuma é apresentada como validação de série que não testa. Nova decisão D9 para a agregação de K entre satélites (S1, S2, S3, com o exemplo K = 0 ou 3) e entre métodos (H1, H2). D6 b deixa de entrar em K e vira verificação de correção, com tratamento de defeito confirmado no script, no procedimento do QGIS e de diferença sem causa. Regras para satélite sem comparação, mês sem satélite comparável e método indisponível. `DAY_RANGE` de 1 a 5, conferido pelo revisor, fixado nas janelas | D9, "Contrato de comparação", item 3, estratégia de testes |
| R2-3 | Corrigido. D8 explicita o mínimo de 10 conclusivos e o máximo de 20 casos (limites da ideação); a e c produzem M indeterminado quando faltam conclusivos, com o exemplo de 10 inconclusivos; c limita a reposição a 20 casos no total. M ou K indeterminado leva D7 a ou b a "evidência insuficiente" e a "Parado", com a pergunta registrada, sem converter ausência de evidência em 0% ou 100% (só D8 b atribui valor, por regra do responsável) | D7, D8, item 3 |
| R2-4 | Corrigido. `cycles.md` mostra "v3 em revisão" | `_project/cycles.md` |

Mudança de numeração: as decisões pendentes passam a ser D1 a D9 (D9 nova, por R2-2). As referências nas seções do plano foram atualizadas; as das rodadas anteriores foram preservadas.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
