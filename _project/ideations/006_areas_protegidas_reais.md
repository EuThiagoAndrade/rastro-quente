# Ideação — 006: Áreas protegidas reais

> **Ciclo:** `006`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 006" em 2026-11-12
> **Criado em:** 2026-11-12
> **Última atualização:** 2026-11-12
> **handoff_schema_version:** `2`

## Problema

A seleção explicável do protótipo usa só o que as detecções dizem sobre si mesmas: concentração, recorrência e persistência (ciclos `004` e `005`). Falta contexto territorial de proteção: uma detecção ou uma célula de 0,05° pode estar dentro de uma unidade de conservação ou de uma terra indígena, e hoje o sistema não sabe nem mostra isso. A necessidade é cruzar as detecções com perímetros oficiais, mostrá-los no mapa e oferecer um critério (lente) de sobreposição, e eventualmente de proximidade, que explique por que uma área foi destacada.

O cruzamento é regra de seleção e de interpretação geoespacial (G1): o que é "dentro", como tratar a borda, a qualidade do polígono e a distância de proximidade são decisões do responsável. Além disso, a camada traz geometrias novas, o que exige medir o volume contra a restrição de custo zero e provavelmente tabelas novas no banco (G2 e G4).

Restrição de domínio: uma detecção dentro de uma área protegida não comprova incêndio, dano, autoria ou infração, e a ausência de sobreposição não indica ausência de risco. O critério apenas orienta a avaliação técnica.

## Origem no backlog

- **BL-002 — Áreas protegidas reais: fontes, camada e lentes de sobreposição e proximidade.** Item inteiro; a parcela efetivamente encaminhada ao ciclo depende da decisão Q1 e ficará registrada em "Restante" do item quando o retorno for feito.
- **Síntese da necessidade (snapshot):** falta contexto territorial de proteção para explicar a seleção. Pesquisar fontes públicas de unidades de conservação e terras indígenas, com proveniência e condições de uso conferidas, e oferecer a camada no mapa e as lentes de sobreposição e de proximidade. Disponibilidade, formato e condições de uso não estavam verificados. O significado de "dentro", o tratamento da borda e a distância de proximidade são decisões analíticas do responsável. A restrição de custo zero exige medir o volume das geometrias antes de aceitar a camada.
- **Referência:** `_project/backlog.md`, commit `83e3a58` (fila `chore/backlog` e `main`), já integrado em `main` e `origin/main`; **não** é local nem pendente de publicação. O conteúdo do BL-002 não mudou desde a captura de 2026-11-10.
- **Destino em preparação.** O estado do item é `Disponível` e permanece assim. O retorno na fila (`ciclo 006 — AAAA-MM-DD — parcela`) só ocorre depois da integração comprovada do destino em `main`, e sua publicação exige autorização separada.
- **Itens relacionados, não selecionados:** BL-003 (VIIRS), BL-004 (variação anual), BL-006 (CAR, que reaproveitaria a infraestrutura de camadas e de sobreposição), BL-007 (visual), BL-008 (atualização) e BL-009 (IA).

## Contexto e evidências

### Fatos do repositório (`main` em `83e3a58`)

- **Contrato de lente C1 e combinação (KB-005):** as lentes devolvem destaques com `id_destaque`, `unidade` (município ou `celula_005`), `motivo`, `evidencia.deteccoes` (lista de `id_tecnico`), `cobertura` e `ressalvas`. A combinação do ciclo `005` aceita 2 ou 3 lentes distintas por célula de 0,05° (`combinacao-005-v1`, T10) e calcula as lentes ela mesma. Qualquer mudança nessas regras é nova decisão de G1 e nova versão.
- **Pertencimento por ponto no polígono já existe na carga local (KB-004):** `geo.mjs` atribui cada detecção a município com a malha IBGE v4 `qualidade=maxima` da UF 51, coordenadas originais, **borda incluída, buracos e multipolígonos respeitados**; ponto em mais de um município vai para a lista de ambíguos e a carga para; fora de todos é excluído. A carga é local e idempotente (ADR-006), grava a publicação por manifesto aprovado (ADR-005) e as saídas ficam em `local/dados-prototipo/` (fora do Git).
- **Banco e geometria (ADR-005, ADR-007):** o banco guarda só a geometria de **exibição** dos municípios, em três qualidades (`minima`, `intermediaria`, `maxima`), sem PostGIS ("desnecessário"). A interface não baixa geometria na abertura. Medição do ciclo `003` para os 142 municípios de MT: `minima` 237 KB (64 KB gzip estimado), `intermediaria` 984 KB (262 KB) e `maxima` 5.134 KB (1.199 KB), esta com 25,5 s até o conjunto em celular emulado e inviável no celular. Volume medido do banco: cerca de 17,4 MB nas tabelas `public`.
- **Acesso (ADR-003, ADR-005):** nenhum dado territorial vai no bundle; tudo é lido sob RLS e login. "Dados territoriais compartilhados exigem matriz própria de acesso."
- **Custo zero (ADR-002, KB-003):** o protótipo roda na Vercel Hobby e no Supabase Free. O limite de armazenamento gratuito é restrição de aceite, e a camada nova precisa ser medida antes de ser aceita (BL-002).

### Pesquisa de fontes (leitura de páginas públicas em 2026-11-12; nenhum arquivo foi baixado)

**Unidades de conservação — CNUC, Ministério do Meio Ambiente** ([conjunto no portal de dados abertos](https://dados.mma.gov.br/dataset/unidadesdeconservacao)):

- Licença declarada: **Creative Commons Atribuição (CC BY)**; o conjunto é marcado como conforme a Open Definition. Responsável: Departamento de Áreas Protegidas do MMA.
- Formato: shapefile em zip. O recurso "Polígono CNUC 2025_08" (unidades com registro ativo em agosto de 2025, atualizado em 2025-09-03) tem download direto no próprio portal (`shp_cnuc_2025_08.zip`). O recurso mais novo listado, `CNUC_2026_07` (criado em 2026-08-21), aponta para um link de SharePoint do MMA, fora do portal, que **não foi acessado**; o recurso `CNUC_2026_03` também. Tamanho dos arquivos: não consta.
- Atualização: não há periodicidade declarada. Os recursos mostram versões pontuais (2024_02, 2024_10, 2025_03, 2025_08, 2026_03, 2026_07).
- Dicionário de dados do shapefile (PDF de 2024-11-28, lido): campos `cd_cnuc`, `nome_uc`, `cria_ano`, `cria_ato`, `esfera` (Federal, Estadual ou Municipal), `uf`, `municipio`, `org_gestor`, `grupo` (Proteção Integral ou Uso Sustentável), `categoria` (inclui Reserva Particular do Patrimônio Natural e Área de Proteção Ambiental), áreas por bioma, `situacao` e `limite` (**`UC`** para o limite da unidade ou **`ZA`** para a zona de amortecimento). O campo **`quali_pol`** informa a qualidade do polígono, na ordem do melhor ao pior: corresponde ao memorial descritivo, é uma estimativa dos limites ou é uma representação esquemática da localização. **Nenhum campo de pessoa foi listado.**
- Lacunas: o sistema de referência e a escala das geometrias não constam das páginas; a abrangência real dos polígonos para as três esferas em Mato Grosso, e a completude das unidades estaduais e municipais, **não foram verificadas**; o dicionário lido é de 2024 e pode não corresponder ao arquivo de 2026.

**Terras indígenas — FUNAI** ([Terras Indígenas: Dados Geoespaciais e Mapas](https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas)):

- Fonte oficial primária, fornecida pela Coordenação de Geoprocessamento da FUNAI, por serviço WFS próprio (`geoserver.funai.gov.br`, camada `Funai:tis_poligonais`, saída shapefile, com filtro por UF via `CQL_FILTER=uf_sigla LIKE 'XX'`). A página diz que os dados são "atualizados mensalmente" (página modificada em 2026-07-29). Camadas separadas existem para terras em estudo (`tis_pontos`, somente pontos), versões "portarias", aldeias e coordenações. Na seção CSV, o link rotulado "Terras Indígenas" aponta para uma camada de coordenações técnicas, o que exige conferência.
- Licença: a página diz que os arquivos de geoprocessamento e mapas "poderão ser reproduzidos desde que citada a fonte", mas o rodapé do site declara **Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada**. Não consta licença por camada. **Esta divergência importa**: simplificar a geometria para exibição pode ser considerado adaptação (ver Q8).
- Campos, sistema de referência, escala e ressalvas sobre terras em estudo ou sem demarcação definitiva **não constam** da página. Um metadado do INPE (que reproduz a camada com SIRGAS 2000, segundo o resultado de busca) respondeu 502 e o do IBGE respondeu 403; nada foi lido deles.

**Não verificado:** ICMBio (shapefiles de unidades federais; só há informação de 2013 em lista de discussão de terceiros, sem confirmação da política atual), unidades estaduais do Mato Grosso por órgão estadual e a camada de terras indígenas do IBGE (2022).

### Download e medição exploratória (P1 autorizada em 2026-11-12)

O responsável autorizou o download em 2026-11-12 ("autorizo o download das fontes (P1)"). Os arquivos ficam em `local/areas-protegidas/` (ignorado pelo Git e pela Vercel); nada foi versionado. A análise usou um script temporário não versionado, sobre a carga local (`local/dados-prototipo/saidas/deteccoes.csv`, 10.640 detecções principais, 2025-11-01 a 2026-10-31, com 3.290 células ocupadas, número igual ao do ciclo `005`). **Os números abaixo são exploratórios, não casos de referência validados**: o plano deve refazê-los por caminho independente. O ponto no polígono usou regra par-ímpar sobre todos os anéis (buracos e multipolígonos) com teste exato de borda.

**Arquivos obtidos (2026-11-12, ~17:58 UTC):**

| Fonte | Arquivo | Bytes | SHA-256 | Observação |
| :-- | :-- | --: | :-- | :-- |
| CNUC (MMA), recurso `2025_08` | `shp_cnuc_2025_08.zip` | 45.856.979 | `97d754c1e01881d5f94e2f9e465fa95fe37b58c24a3df46989c7b30a9bb93fc6` | `Last-Modified` 2025-09-03; contém `cnuc_2025_08.shp` (60,1 MB, 3.122 polígonos do país) e `cnuc_2025_08_pontos.shp` (180 pontos) |
| FUNAI, WFS `Funai:tis_poligonais`, `uf_sigla LIKE '%MT%'`, saída `SHAPE-ZIP` | `funai_tis_poligonais_mt.zip` | 3.844.961 | `6dd8003f92c4bc966895aececded40ca21021d43a1a193e1c6150459bb313f08` | 75 polígonos; `tis_poligonais.shp` com 5,16 MB; o WFS é um serviço vivo e não tem versão fixa, então o hash identifica este retrato |

Nota: a primeira requisição à FUNAI com o cliente padrão do `curl` foi recusada com 403 (nginx); uma segunda, com nome de cliente próprio e identificável, respondeu 200. A carga precisa registrar o cliente usado e tratar 403 como parada, não como "sem dados". O arquivo recusado foi descartado.

**Características verificadas nos arquivos:**

- **Sistema de referência:** os dois em SIRGAS 2000 geográfico (graus), o mesmo da malha municipal do IBGE; a diferença para o WGS84 das detecções é desprezível para este uso, mas o plano deve declará-la.
- **Codificação (armadilha real):** no CNUC o `.cpg` diz ISO-8859-1, mas os bytes são UTF-8; na FUNAI o `.cpg` diz UTF-8, mas os bytes são ISO-8859-1. Ler pela declaração corrompe nomes ("Ã©", "�"). A carga deve validar a codificação e parar se houver caractere inválido.
- **CNUC (país inteiro, 3.122 polígonos, todos `situacao = Ativo`):** esfera federal 999, estadual 1.342, municipal 781; `quali_pol`: 2.314 conforme o memorial, 709 estimativa, 99 esquemático. O campo `limite` vale só `uc`: **o arquivo não traz polígonos de zona de amortecimento** (o dicionário previa `UC` ou `ZA`).
- **CNUC em Mato Grosso (rótulo `uf` com "MATO GROSSO"):** 98 unidades (45 municipais, 32 estaduais e 21 federais; 64 de proteção integral e 34 de uso sustentável; 3 também em outra UF). Categorias: 50 parques, 19 RPPN, 10 APA, 6 estações ecológicas, 4 refúgios de vida silvestre, 4 ARIE, 3 reservas biológicas, 1 monumento natural e 1 reserva extrativista. Qualidade: 76 conforme o memorial, 20 estimativas e 2 esquemáticos. **O arquivo inclui unidades estaduais e municipais de MT**, o que atende a parte da hipótese H4; a completude frente às listas dos órgãos estaduais e municipais não foi verificada. O arquivo de pontos (180 unidades só com localização) não traz campo de UF e não foi analisado.
- **FUNAI em MT:** 75 polígonos (uf_sigla `MT` em 67; os demais compartilham MT com PA ou RO), `fase_ti`: regularizada 60, declarada 5, homologada 4, delimitada 3, encaminhada para reserva indígena 2 e **em estudo 1**; `modalidade`: tradicionalmente ocupada 70, reserva indígena 4, interditada 1. **A correção de uma afirmação anterior:** a camada de polígonos inclui terra em estudo (1 polígono, 7 detecções), e não só pontos. Campos: `terrai_cod`, `terrai_nom`, `etnia_nome`, `municipio_`, `uf_sigla`, `superficie`, `fase_ti`, `modalidade`, `reestudo_t`, `cr`, `faixa_fron`, `undadm_*`, `dominio_un`, `data_atual` e `epsg`. Nenhum campo de pessoa; `etnia_nome` traz nomes de povos.

**Volume estimado (apenas Mato Grosso, só coordenadas em JSON, sem atributos nem sobrecarga do banco; simplificação própria Douglas-Peucker mais arredondamento de coordenadas, não a do IBGE):**

| Conjunto | Vértices | Original (JSON / gzip) | 0,0002° (~22 m, 4 casas) | 0,001° (~110 m, 4 casas) | 0,005° (~550 m, 3 casas) |
| :-- | --: | --: | --: | --: | --: |
| 98 UC de MT | 58.122 | 1.361 KB / 394 KB | 377 KB / 98 KB (19.459 vért.) | 149 KB / 42 KB (7.635) | 74 KB / 14 KB (4.182) |
| 75 TI de MT | 322.289 | 7.588 KB / 1.968 KB | 1.231 KB / 302 KB (62.860) | 389 KB / 108 KB (19.864) | 83 KB / 23 KB (4.731) |
| Soma | 380.411 | 8.949 KB / 2.362 KB | 1.608 KB / 400 KB | 537 KB / 151 KB | 157 KB / 37 KB |

Referência: a malha municipal `intermediaria` do estado inteiro tem 984 KB brutos e 262 KB em gzip estimado (ADR-007). As RPPN respondem por 2.417 dos 58.122 vértices (4%), o que não muda a ordem de grandeza. A hipótese H3 parece sustentável nessa estimativa: as áreas simplificadas a ~110 m somam cerca de 0,5 MB, e mesmo o polígono original das UC (1,4 MB) é pequeno, mas o original das terras indígenas (7,6 MB) não serve ao celular. A medição definitiva exige a carga real no banco (índices, egress e consulta).

**Detecções × áreas (10.640 detecções principais, janela inteira, por detecção, borda incluída):**

| Medida | Detecções | % de 10.640 | Células com pelo menos 1 detecção dentro (S1) | % de 3.290 |
| :-- | --: | --: | --: | --: |
| Dentro de alguma UC | 323 | 3,0% | 108 | 3,3% |
| — proteção integral | 76 | 0,7% | 37 | 1,1% |
| — uso sustentável | 254 | 2,4% | 74 | 2,2% |
| Dentro de alguma TI | 2.500 | 23,5% | 750 | 22,8% |
| UC e TI ao mesmo tempo | 4 | 0,04% | 3 | 0,1% |
| UC ou TI | 2.819 | 26,5% | 855 | 26,0% |

- Por esfera, as 323 detecções em UC se dividem em estadual 258, federal 67 e municipal 5 (uma detecção pode estar em mais de uma unidade). Por categoria: reserva extrativista 158, APA 95, parque 52, estação ecológica 22, refúgio de vida silvestre 6 e ARIE 1. **Nenhuma detecção caiu em RPPN** nesta janela (19 RPPN em MT).
- Por fase das terras indígenas: regularizada 2.430, delimitada 31, encaminhada 16, declarada 11, homologada 7 e em estudo 7 (a soma passa de 2.500 porque 2 detecções estão em mais de uma terra).
- 9 detecções estão em mais de uma UC e 2 em mais de uma TI. **Nenhuma detecção caiu exatamente sobre a borda** (teste exato). 1 das 323 detecções em UC está em unidade de polígono "estimativa"; nenhuma em polígono esquemático.
- **2 detecções caem em unidades cujo rótulo `uf` não cita Mato Grosso** (unidade de estado vizinho cujo polígono entra em MT). Restringir a análise às unidades rotuladas MT perderia essas detecções: a regra deve usar todos os polígonos que interceptam a janela, não o rótulo.
- **Efeito da regra de "dentro" (Q4), por célula:** S1 (pelo menos 1 detecção dentro) destaca 108 células por UC e 750 por TI; S4 (mais da metade) destaca 92 e 713. 16 das 108 células de UC têm menos da metade das detecções dentro da unidade, e 37 das 750 de TI. Em S1, 3 células têm UC e TI.
- Leitura: as terras indígenas respondem por 89% das detecções dentro de áreas protegidas (2.500 de 2.819) e 88% das células destacadas (750 de 855). Uma lente única "área protegida" seria dominada pelas terras indígenas, o que reforça a separação por classes (Q3 = E1).

## Resultado desejado

Deixar decididas, com exemplos numéricos, as escolhas humanas necessárias para escrever **um único plano** que entregue, dentro do recorte decidido em Q1:

1. as fontes aceitas, com proveniência, versão, hash e condições de uso registrados;
2. o volume medido das geometrias, comparado ao limite de custo zero, com a representação de exibição escolhida;
3. a regra de sobreposição (G1) e a lente que a implementa sob o contrato C1, com casos de referência independentes do código;
4. a camada no mapa e a interface mínima para ver o motivo e a evidência;
5. a decisão sobre G2 e G4 para as tabelas novas e a atualização da carga, com ADR próprio quando o plano mexer em decisão duradoura.

## Hipóteses

Nenhuma é assumida como fato; todas são verificadas no plano.

- **H1.** O pertencimento detecção × área pode ser calculado na carga local com o mesmo `geo.mjs` (ponto no polígono, borda incluída), e só o resultado e a geometria de **exibição** vão ao banco. Isso mantém a classificação com a precisão total do polígono e evita enviar o polígono integral ao navegador.
- **H2.** Uma lente de sobreposição pode seguir o contrato C1 sem alterá-lo, com `unidade` em `celula_005` e a evidência em `id_tecnico` das detecções dentro da área.
- **H3.** O volume das geometrias de unidades de conservação e terras indígenas em Mato Grosso, simplificadas para exibição, cabe no orçamento de armazenamento e de bytes por consulta. **Indício a favor na medição exploratória:** cerca de 0,5 MB brutos (151 KB em gzip) a ~110 m de tolerância, contra 984 KB (262 KB) da malha municipal `intermediaria`. Falta a medição no banco e o teto de Q8. O polígono original das terras indígenas (7,6 MB) não serve ao celular.
- **H4.** O CNUC cobre unidades estaduais e municipais de Mato Grosso de forma suficiente para o recorte. **Parcialmente confirmada:** o arquivo traz 45 unidades municipais e 32 estaduais de MT; a completude frente às listas dos órgãos não foi verificada.
- **H5.** A licença Atribuição-SemDerivações da FUNAI não impede o uso analítico, mas pode impedir a exibição de geometria simplificada. Precisa de decisão, não de suposição.

## Alternativas

Cada escolha altera materialmente o plano, e as de método cabem ao responsável. Os números são **fictícios**, exceto onde indicado.

### Q1. Recorte do ciclo

O BL-002 junta quatro coisas: fontes, camada, lente de sobreposição e lente de proximidade. Há dados por verificar e volume por medir.

| Opção | O que entrega | Observação |
| :-- | :-- | :-- |
| **A — Fontes, camada e sobreposição, com ponto de parada** | Item 1: baixar, registrar e medir as fontes (se o volume ou a licença falharem, o ciclo para em decisão). Item 2: carga, tabelas e camada no mapa. Item 3: lente de sobreposição e interface mínima | Proximidade, combinação com as outras lentes e fontes adicionais ficam no Restante do BL-002 |
| **B — Tudo do BL-002** | A mais a lente de proximidade | Proximidade exige distância geodésica, limiares e mais casos de referência; amplia muito o G1 |
| **C — Só prova de fontes e volume** | Somente o item 1, no estilo dos ciclos `001` e `002`; implementação em ciclo seguinte | Mais seguro, mas não entrega valor visível e adia a mudança de schema |

### Q2. Fontes

| Opção | Unidades de conservação | Terras indígenas | Observação |
| :-- | :-- | :-- | :-- |
| **F1** | CNUC (MMA, CC BY), recurso `2025_08` com download direto, ou o mais novo se o link for estável | FUNAI, `tis_poligonais`, filtro `uf_sigla` | Duas fontes oficiais, uma por tema, com licenças declaradas. O link de SharePoint do CNUC 2026 é frágil como proveniência (conta pessoal, query string longa) |
| **F2** | CNUC como em F1 | IBGE (camada de 2022) | Fonte secundária; o IBGE adapta os setores censitários aos limites da FUNAI. Metadado não lido (403) |
| **F3** | ICMBio (só federais) mais órgão estadual do MT | FUNAI | Mais fontes, mais licenças e formatos para conferir; sem evidência atual sobre o ICMBio |

### Q3. Quais áreas entram

Exemplo fictício: célula com 10 detecções, 4 dentro de uma Área de Proteção Ambiental e 2 dentro de uma Reserva Biológica.

| Opção | Regra | Efeito |
| :-- | :-- | :-- |
| **E1 — Classes separadas** | Classes distintas e rotuladas: unidade de proteção integral, unidade de uso sustentável e terra indígena; a lente mostra a classe que sobrepõe | Evita tratar APA (grande, uso sustentável) como equivalente a Reserva Biológica. O motivo diz "4 detecções dentro de APA fictícia X (uso sustentável)" |
| **E2 — Tudo junto** | Qualquer área protegida conta igual | Mais simples, mas APAs grandes diluem o critério |
| **E3 — Só proteção integral e terras indígenas** | Uso sustentável fica fora | Recorte menor e mais discriminante, mas descarta unidades legítimas |

Dentro de qualquer opção, três decisões menores: **zonas de amortecimento** (`limite = ZA`) entram ou ficam fora (recomendado: fora, mostradas apenas se pedido, e nunca somadas ao "dentro"); **terras em estudo** são só pontos na FUNAI e ficam fora; e **RPPN** são propriedades privadas cujo nome pode identificar uma pessoa (G3) — decidir se entram e se o nome é exibido.

### Q4. Significado de "dentro" (G1)

Exemplo fictício: célula de 0,05° com 10 detecções. Quatro delas caem dentro de uma unidade; o polígono cobre 30% da área da célula.

| Opção | Regra | No exemplo |
| :-- | :-- | :-- |
| **S1 — Por detecção** | Cada detecção é testada (ponto no polígono, borda incluída, como na KB-004). A célula é destacada se tiver **pelo menos 1 detecção dentro**; a evidência são essas detecções | Destacada, com 4 detecções como evidência |
| **S2 — Por geometria da célula** | A célula é destacada se o polígono a interceptar | Destacada, mesmo que nenhuma detecção esteja dentro |
| **S3 — Fração da célula** | A célula é destacada se pelo menos X% da sua área estiver dentro | Com X = 50%, não destacada (30%) |
| **S4 — Maioria das detecções** | Mais da metade das detecções da célula está dentro | Não destacada (4 de 10) |

S1 mantém a evidência em `id_tecnico`, coerente com C1 e com a regra P1 do ciclo `005` ("pelo menos 1 detecção"), e não depende da geometria da célula. S2 e S3 destacam células sem detecção dentro e criam leitura espúria.

### Q5. Borda e qualidade do polígono

- **Borda:** incluída (como no recorte municipal da KB-004) ou excluída. Exemplo fictício: detecção exatamente sobre o limite de uma terra indígena; incluída conta como "dentro", excluída não. Recomendado: **incluída**, pela consistência com o resto do método.
- **Qualidade (`quali_pol`):** polígonos que são "estimativa" ou "representação esquemática" **não são excluídos**, mas o motivo e o painel trazem a ressalva ("limite estimado pelo órgão gestor; a posição exata pode diferir"). Alternativa: excluir os esquemáticos. Sem os arquivos, não se sabe quantos são.
- **Detecção em mais de uma área** (por exemplo, UC sobreposta a terra indígena): a evidência lista todas as áreas, sem escolher uma.

### Q6. Proximidade

Exemplo fictício: detecção a 800 m do limite de uma unidade.

| Opção | Regra | No exemplo |
| :-- | :-- | :-- |
| **X0 — Fora deste ciclo** | Fica no Restante do BL-002 | Não classificada |
| **X1 — Faixa fixa** | "Próxima" se estiver a até D metros de uma área, calculada na carga com distância em sistema projetado | Com D = 1.000 m, próxima; com D = 500 m, não |
| **X2 — Faixas escalonadas** | Dentro, até 1 km, até 5 km | Cria categorias novas; mais casos de referência |

Proximidade depende de um sistema de referência projetado, da definição de distância e do limiar, que não foram verificados nas fontes. Recomendado **X0**.

### Q7. Onde calcular e guardar

| Opção | Funcionamento | Consequência |
| :-- | :-- | :-- |
| **L1 — Carga local mais tabelas novas no banco** | Pertencimento calculado na carga local com o polígono integral; o banco guarda as áreas (geometria de exibição, atributos mínimos) e o vínculo detecção × área; a lente lê por consulta sob RLS | Migração nova e aditiva (G4), RLS e matriz de acesso (G2), atualização da carga e do manifesto (ADR-005, ADR-006). Segue o padrão existente |
| **L2 — No navegador** | Baixa o polígono e testa ponto a ponto no cliente | Polígono integral é inviável no celular (a `maxima` municipal já leva 25,5 s); com geometria simplificada, a borda perde precisão e a classificação de G1 fica imprecisa |
| **L3 — Arquivo estático** | Camada em arquivo publicado com o site | Contraria "nenhum dado territorial no bundle" e a exigência de matriz de acesso do ADR-003 |

Recomendado **L1**. Com ele, **G2 e G4 passam a "Sim"**, o que já é coerente com o nível completo.

### Q8. Volume, representação e licença

- **Critério de aceite do volume.** Defina um teto para o acréscimo ao banco (por exemplo, "até X MB além dos cerca de 17,4 MB atuais") e para os bytes por consulta da camada (por exemplo, "até Y KB gzip por visualização"). Os valores são decisão sua, depois da medição; o ciclo deve parar se a camada não couber.
- **Representação de exibição.** Reaproveitar as três qualidades de simplificação dos municípios (`minima`, `intermediaria`, `maxima`) e escolher uma por medição; a classificação continua com o polígono integral.
- **Licença da FUNAI.** Duas leituras do texto: reprodução permitida com citação da fonte, ou Atribuição-SemDerivações. Alternativas: (i) usar a camada só para cálculo e exibir a geometria **sem simplificar**; (ii) pedir esclarecimento à FUNAI; (iii) usar outra fonte (F2). Não suponha; a decisão é do responsável e eu não dou parecer jurídico.
- **Atribuição.** Em CC BY, citar a fonte e a versão na interface, no mesmo lugar da proveniência dos focos.

### Q9. Relação com a combinação do ciclo `005`

| Opção | Efeito |
| :-- | :-- |
| **K1 — Lente isolada** | A lente de sobreposição aparece no seletor de lentes individuais; não entra na combinação neste ciclo |
| **K2 — Combinável** | A lente entra na escolha de 2 ou 3 lentes da combinação (agora de 4 possíveis). As regras de `combinacao-005-v1` não mudam, mas o plano precisa provar que os resultados das combinações antigas permanecem idênticos |

Recomendado **K1**, para manter o ciclo pequeno; K2 vai para o Restante do BL-002.

## Decisões do responsável — 2026-11-12

O responsável respondeu, depois da apresentação das alternativas e das recomendações: **"Aceito as recomendações para Q1 a Q9 e autorizo o download das fontes (P1)"**. A decisão é do responsável; a ideação apenas a registra. As regras abaixo são **valores iniciais**: mudá-las é nova decisão de método (G1) e novo plano. A resposta **não** respondeu P2, P3 nem decidiu o teto de volume de Q8, que as próprias recomendações deixavam em aberto.

| Pergunta | Decisão | Pendência |
| :-- | :-- | :-- |
| **Q1 — Recorte** | A: fontes, camada e sobreposição, com ponto de parada no item 1 (volume ou licença). Proximidade, combinação com as outras lentes e fontes adicionais ficam no Restante do BL-002 | — |
| **Q2 — Fontes** | F1: CNUC (MMA, CC BY) para unidades de conservação e FUNAI `tis_poligonais` para terras indígenas | — |
| **Q3 — Quais áreas** | E1: classes separadas e rotuladas (unidade de proteção integral, unidade de uso sustentável e terra indígena). Zonas de amortecimento fora (o arquivo do CNUC nem as traz); terras em estudo fora | A premissa "terras em estudo são só pontos" estava errada: há 1 polígono em estudo (7 detecções). Resolvida nas decisões complementares: "fora" exclui `fase_ti = Em Estudo` (Q10); RPPN fora (P2) |
| **Q4 — "Dentro"** | S1: a célula é destacada se tiver pelo menos 1 detecção dentro; a evidência são essas detecções | — |
| **Q5 — Borda e qualidade** | Borda incluída; `quali_pol` de estimativa ou esquemático entra com ressalva, sem exclusão; detecção em mais de uma área lista todas | — |
| **Q6 — Proximidade** | X0: fora deste ciclo | — |
| **Q7 — Onde calcular** | L1: pertencimento calculado na carga local com o polígono integral; banco com tabelas novas e geometria de exibição. **G2 e G4 = Sim** | ADR próprio no plano |
| **Q8 — Volume e licença** | Teto de volume a definir depois da medição; licença da FUNAI a decidir | Resolvida nas decisões complementares (teto e P3) |
| **Q9 — Combinação** | K1: lente isolada; K2 no Restante | — |

### Decisões complementares — 2026-11-12

Depois da medição exploratória, o responsável respondeu às pendências. Primeiro, sobre a licença da FUNAI (P3): **"Pode usar o item da Funai. Sem problema."** Depois, sobre o contorno real e as demais pendências: **"Vamos de acordo com sua recomendação para o item em discussão e também para os outros itens que precisam de uma decisão."** As recomendações a que a resposta se refere são as registradas em "Perguntas em aberto" e resumidas abaixo. Valem como valores iniciais; mudá-las é nova decisão de método e novo plano.

| Pergunta | Decisão |
| :-- | :-- |
| **P3 — Licença da FUNAI** | Usar a camada da FUNAI com contorno exibido, citando a fonte e a data. Sem consulta formal; a divergência entre a página e o rodapé do site fica registrada como risco aceito pelo responsável |
| **Contorno real (item em discussão)** | Alternativa **A**: visão geral com geometria simplificada (cerca de 0,5 MB a ~110 m de tolerância) e **contorno real sob demanda**, baixado só da área ou da célula selecionada (padrão do ADR-007). O banco guarda as duas versões, com 5 casas decimais no contorno real (cerca de 1 m). A classificação continua com o polígono integral na carga |
| **Q8-teto — Volume** | Até **0,6 MB brutos por visualização geral** da camada e até **10 MB de acréscimo ao banco** (geometria simplificada, contorno real, vínculos e índices; hoje cerca de 17,4 MB nas tabelas `public`). O contorno real de uma área é baixado sob demanda, sem teto por área além do medido (maior terra indígena: 1,1 MB brutos, 257 KB em gzip). Isso substitui a proposta anterior de 5 MB. O item 1 do plano confere na carga real, e o ciclo para se não couber |
| **Q10 — Fases das terras indígenas** | **T1**: todas as fases, exceto "em estudo"; a fase aparece no motivo. Detecções dentro: até 2.493 na janela medida |
| **P2 — RPPN** | **Fora da primeira versão.** Podem entrar depois por decisão própria; nesse caso, a exibição do nome é decisão separada |

## Riscos e restrições

- **Leitura indevida:** "dentro de unidade de conservação" ou "dentro de terra indígena" ser lido como comprovação de incêndio, dano, autoria ou infração, ou como "mais grave" (prioridade). O painel repete o aviso de domínio e não ordena por tipo de área. Terra indígena é um tema sensível: o texto não pode sugerir responsabilização de comunidades.
- **G1:** "dentro", borda, qualidade do polígono, classes e proximidade são regra analítica ambiental. Exigem alternativas, exemplos e decisão antes do plano, e casos de referência independentes do código (inclusive casos de borda, multipolígono, buraco e detecção em duas áreas).
- **G2:** tabela nova no schema `public` exige RLS, testes de acesso permitido e negado por papel, e a matriz de acesso das áreas (dado territorial compartilhado). Modo contínuo proibido (nível completo, G1 e G2).
- **G3:** as fontes são públicas e as camadas não trazem campos de pessoa, mas `nome_uc` de RPPN pode identificar o proprietário e o conteúdo dos shapefiles não foi inspecionado. Fixtures com áreas fictícias; shapefiles reais ficam em `local/` e fora do Git (a regra de `.shp` já o impõe).
- **G4:** a migração é nova e aditiva; nenhuma migração existente é editada.
- **Proveniência frágil:** o CNUC mais recente está em um link de SharePoint pessoal do MMA. A carga deve registrar URL, data, tamanho e SHA-256 de cada arquivo, como nas outras fontes (KB-001), e não pode depender de link instável.
- **Dados que enganam em silêncio:** a codificação declarada nos `.cpg` está invertida nos dois arquivos; o serviço da FUNAI recusou o cliente padrão com 403; o rótulo `uf` do CNUC não basta para escolher unidades (2 detecções caem em unidade rotulada de outro estado). A carga trata cada caso como parada ou regra explícita, nunca como "sem dados".
- **Domínio dominado:** as terras indígenas respondem por 89% das detecções dentro de áreas protegidas; sem a separação por classes (Q3 = E1), uma lente única diria quase só "terra indígena". O texto não pode sugerir responsabilização de comunidades.
- **Dados desatualizados:** limites mudam por decreto; a camada é um retrato datado. A interface deve exibir a versão e a data da fonte.
- **Custo zero:** o volume pode inviabilizar a camada (H3). O ciclo prevê ponto de parada.
- **Ambiguidade e erro de dados:** polígonos inválidos, sobreposição entre unidades e CRS diferentes entre fontes (a verificar) exigem tratamento explícito, como as ambiguidades municipais da KB-004 (parada, nunca escolha silenciosa).
- **Verificação em produção:** os ciclos `004` e `005` fecharam sem verificação hospedada completa, por decisão do responsável. O plano deve dizer o que é exigido aqui.

## Perguntas em aberto

**Todas respondidas em 2026-11-12** (seções "Decisões do responsável" e "Decisões complementares"): Q1 a Q9, P1 (download, executado e medido), Q10, Q8-teto, P2 e P3. As opções e recomendações abaixo ficam como registro do que foi decidido, com o contorno real sob demanda (alternativa A) substituindo a proposta de teto de 5 MB:

- **Q10 — Fases das terras indígenas (G1).** A camada traz terras em fases diferentes (regularizada 60, declarada 5, homologada 4, delimitada 3, encaminhada para reserva indígena 2, em estudo 1). Detecções por fase: 2.430, 11, 7, 31, 16 e 7 (2.500 no total, sem dupla contagem).

  | Opção | Entram | Detecções dentro (máximo) |
  | :-- | :-- | --: |
  | **T1** | Todas, menos "em estudo"; a fase aparece no motivo ("terra indígena X, fase: delimitada") | até 2.493 |
  | **T2** | Só declarada, homologada e regularizada | até 2.448 |
  | **T3** | Só regularizadas | 2.430 |
  | **T0** | Todas, inclusive "em estudo" | 2.500 |

  Recomendado **T1**: não esconde terras ainda em procedimento e deixa a fase visível sem o agente interpretar situação fundiária. T0 contraria o que o responsável aceitou em Q3 (terras em estudo fora), mas essa decisão foi tomada sobre uma premissa corrigida acima; por isso vale confirmar.
- **Q8-teto — Teto de volume.** Proposta com base na medição: camada de áreas na representação padrão com até **0,6 MB brutos (cerca de 0,15 MB em gzip)** por visualização, e acréscimo ao banco de até **5 MB** somados geometria de exibição, vínculos e índices (hoje cerca de 17,4 MB nas tabelas `public`, e o limite do plano gratuito foi conferido nos ciclos `002` e `003`). Os valores são decisão sua; o item 1 do plano confere na carga real e o ciclo para se não couber.
- **P2 — RPPN.** Na janela medida, nenhuma das 10.640 detecções caiu em RPPN (19 em MT), então excluí-las da primeira versão não muda nenhum resultado atual. Recomendado: **fora da primeira versão** (propriedade privada, nome que pode identificar o proprietário, G3), com a possibilidade de entrar depois por decisão própria. Se entrarem, o nome é exibido ou só o código CNUC?
- ~~**P3 — Licença da FUNAI.**~~ **Decidida em 2026-11-12.** O responsável decidiu usar a camada da FUNAI, com a geometria simplificada para exibição, sem consulta formal: "Pode usar o item da Funai. Sem problema." A decisão é dele, não parecer jurídico. O plano apenas cita a fonte e a data da camada na interface (como em qualquer fonte) e registra a divergência entre o texto da página e o rodapé como risco aceito.

## Fora do escopo

- Lente de proximidade (salvo se Q1 = B).
- Combinação da lente de sobreposição com as outras (salvo se Q9 = K2).
- Outras fontes e camadas: VIIRS (BL-003), variação anual (BL-004) e CAR (BL-006).
- Alterar parâmetros ou regras das lentes dos ciclos `004` e `005`, da contagem, da disponibilidade D1 ou das regras H3 da KB-004.
- Definição visual e design system (BL-007), atualização menos manual (BL-008) e motor de IA (BL-009).
- Parecer jurídico sobre licenças.
- Qualquer afirmação de incêndio, dano, autoria ou infração, ou sobre a situação fundiária de qualquer área.

## Critérios para iniciar o planejamento

- ~~Q1 a Q9 respondidas~~: atendido em 2026-11-12, com as pendências Q10, Q8-teto, P2 e P3 abaixo.
- ~~P1 respondida, com medição e análise exploratória registradas~~: atendido em 2026-11-12.
- ~~Pendentes Q10, Q8-teto, P2 e P3~~: atendido em 2026-11-12 (decisões complementares). Não resta pergunta de método em aberto.
- ~~Autorização do rascunho~~: recebida em 2026-11-12 ("autorizo o rascunho do plano do ciclo 006"). As respostas às perguntas não a substituíam.
- Pendente no plano: casos de referência independentes do código para a sobreposição (refazendo por outro caminho os números exploratórios, inclusive células com mais de uma área, buraco, multipolígono e borda), tratamento da codificação e do 403 na obtenção, polígonos que cruzam a janela mesmo com rótulo de outra UF, atribuição e versão exibidas na interface, ADR das tabelas novas, e o que se exige da verificação em produção.

## Próximo passo

A autorização do rascunho foi recebida em 2026-11-12: **"autorizo o rascunho do plano do ciclo 006"**. Nenhuma pergunta de método nova foi feita antes do rascunho. Os detalhes técnicos que decorrem das decisões (T15 a T24) estão no plano como propostas a ratificar na aprovação. O plano registra também uma correção desta ideação: não há regra de `.shp` no `.gitignore` nem no validador; os shapefiles reais ficam fora do Git só por estarem em `/local/`. O rascunho único foi criado em `_project/drafts/006_areas_protegidas_reais/006_plan.md`, que passa a ser o artefato ativo do ciclo em `Planejamento`.

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 1) — ciclo 006 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 006"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + rascunhar_plano + 006_plan + v1@83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: ideação em `Ideação`, com todas as decisões registradas, não commitada; branch local `chore/cycle-006-ideation`; sem plano.
- `state_after`: autorização do rascunho registrada; plano `v1` em `Rascunho` criado; ciclo `006` em `Planejamento`; branch local `chore/cycle-006-plan`, criada a partir da anterior, com as alterações ainda não commitadas. Nenhuma publicação.
- `result`: `executed`
- `evidence`: frase de autorização de 2026-11-12; handoff completo no plano; linha do ciclo `006` em `_project/cycles.md`.
- `blockers`: nenhum para a redação; revisão formal pendente.

### Registro anterior — decisões e medição da ideação

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + idear + areas_protegidas_reais + 83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: ideação `006` criada com Q1 a Q9 e P1 a P3 em aberto; nenhum arquivo de áreas baixado; branch local `chore/cycle-006-ideation`, nada commitado.
- `state_after`: decisões Q1 a Q10, P1 a P3 e Q8-teto registradas, com o contorno real sob demanda (alternativa A); download e medição exploratória registrados; nenhuma pergunta de método em aberto; ciclo `006` continua `Ideação`; arquivos baixados em `local/areas-protegidas/` (ignorado pelo Git); nada commitado, publicado nem enviado; BL-002 inalterado (`Disponível`).
- `result`: `executed`
- `evidence`: respostas literais do responsável em 2026-11-12 ("Aceito as recomendações para Q1 a Q9 e autorizo o download das fontes (P1)"; "Pode usar o item da Funai. Sem problema."; "Vamos de acordo com sua recomendação para o item em discussão e também para os outros itens que precisam de uma decisão."); URL, data, bytes e SHA-256 dos dois arquivos na seção "Download e medição exploratória"; `local/areas-protegidas/exploracao.json` (local, fora do Git); validação de governança na resposta da sessão.
- `blockers`: nenhum para o registro; o rascunho do plano depende de "autorizo o rascunho do plano do ciclo 006".

### Registro anterior — ideação inicial

- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + idear + areas_protegidas_reais + 83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: `main` em `83e3a58`, igual a `origin/main`; ciclo `006` não reservado; fila `chore/backlog` limpa e sincronizada; BL-002 `Disponível`.
- `state_after`: ideação `006` criada e ciclo `006` reservado como `Ideação`, com Q1 a Q9 e P1 a P3 em aberto; nada commitado.
- `result`: `executed`
