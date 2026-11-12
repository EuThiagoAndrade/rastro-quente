# Plano de Implementação — Áreas protegidas reais

> **Ciclo:** `006`
> **Status:** `Aprovado`
> **Versão:** `v3`
> **Data de criação:** 2026-11-12
> **Última atualização:** 2026-11-12
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 006" em 2026-11-12
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO COM RESSALVAS`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-12`
> **handoff_schema_version:** `2`

**Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 006", em 2026-11-12. Autor: Claude Code (Opus 5.5). A ideação deixou decididas Q1 a Q10, P1 a P3 e o teto de volume. Nenhuma pergunta de método nova foi feita antes do rascunho. Os detalhes técnicos que decorrem dessas decisões, mas mudam resultados de borda, o que é guardado ou o que é exibido (T15 a T24), aparecem como propostas e só valem com a aprovação do plano. Este rascunho não é aprovação do plano, nem autorização de issue ou de implementação.

**Aprovação do plano — v3, 2026-11-12:** o responsável manifestou literalmente "aprovo o plano do ciclo 006", depois do veredito `APTO COM RESSALVAS` da rodada 3 (revisor: Codex, GPT-6).

A aprovação ratifica como decisões humanas de G1, G2 e G3 os itens enumerados em "Aprovar plano › Conferir":

- T15 a T25, nas formas da v3;
- os casos AP-1 a AP-23 e SB-1 a SB-16, com os valores esperados escritos neste plano;
- os textos de T23 e as versões `areas-006-v1` e `sobreposicao-006-v1`;
- o desenho das duas tabelas, a matriz de acesso a registrar no ADR-008 e o contrato de leitura de T25.

Ratifica também o orçamento, com os tetos e as paradas, o fatiamento em quatro issues, a ação humana externa depois do item 2 e a verificação em produção exigida.

**Ressalvas R3-1 e R3-2 incorporadas, sem mudar o escopo.**

- **R3-1:** em T25, uma resposta HTTP 416 (`PGRST103`, deslocamento além do total visível) conta como página curta e leva ao diagnóstico da ausência. O teste pela API local do item 3 revoga a autorização entre as páginas de vínculos e observa a resposta real do PostgREST, que tem de terminar em `acesso_negado`; o E2E do item 4 confere a limpeza da interface.
- **R3-2:** o aceite do item 3 é a igualdade, célula a célula, com a etapa 2 da conferência do item 1 na mesma identidade. As 37 e 74 células de UC da exploração são referências, com explicação de eventual diferença.

Cobre:

- a publicação da PR documental deste lote (ideação, plano e registro do ciclo);
- depois da integração documental e da confirmação dos payloads, a criação das quatro issues;
- o encerramento, depois das entregas.

Não cobre merges, a implementação das issues, a ação humana externa nem a verificação em produção. Cada um desses passos tem frase própria.

**Autorização da correção — v2, 2026-11-12:** "corrija o plano do ciclo 006", depois do veredito `REQUER NOVA RODADA` da rodada 1 (revisor: Codex, GPT-6). A v2 responde a R1-1 a R1-9 (ver "Resposta do autor à rodada 1 — v2"), preserva a rodada 1 e mantém o plano `Em Revisão`, aguardando a rodada 2. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova: T15 a T25 continuam propostas a ratificar na aprovação.

**Autorização da correção — v3, 2026-11-12:** "corrija o plano do ciclo 006", depois do veredito `REQUER NOVA RODADA` da rodada 2 (revisor: Codex, GPT-6). A v3 responde a R2-1 a R2-7 (ver "Resposta do autor à rodada 2 — v3"), preserva as rodadas 1 e 2 e mantém o plano `Em Revisão`, aguardando a rodada 3. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova: T15 a T25 continuam propostas a ratificar na aprovação.

## Problema e contexto

Ideação: _project/ideations/006_areas_protegidas_reais.md

## Objetivo

Acrescentar ao protótipo o contexto territorial de proteção, com três entregas:

- **Fontes:** unidades de conservação do CNUC (MMA) e terras indígenas da FUNAI, com proveniência, versão, hash e condições de uso registrados.
- **Pertencimento:** cada detecção principal é testada contra os polígonos integrais na carga local, e o resultado é guardado no banco junto com a geometria de exibição.
- **Lente e camada:** uma lente de sobreposição por classe de área, no contrato C1, e uma camada no mapa com o contorno simplificado na visão geral e o contorno real sob demanda.

Tudo dentro do recorte decidido (Q1 = A), com ponto de parada por volume no item 1 e no item 2.

Uma detecção dentro de uma área protegida orienta a avaliação técnica. Não comprova incêndio, dano, autoria ou infração, e não diz nada sobre a situação fundiária da área. A ausência de sobreposição não indica ausência de risco. A lente não ordena por tipo de área, e nenhum texto sugere responsabilização de comunidades.

## Origem no backlog

Herdada da ideação, sem reescrever o snapshot:

- **BL-002 — Áreas protegidas reais: fontes, camada e lentes de sobreposição e proximidade.** Item inteiro selecionado; a parcela efetivamente encaminhada depende de Q1.
- **Síntese da necessidade (snapshot):** falta contexto territorial de proteção para explicar a seleção. Pesquisar fontes públicas de unidades de conservação e terras indígenas, com proveniência e condições de uso conferidas, e oferecer a camada no mapa e as lentes de sobreposição e de proximidade. O significado de "dentro", o tratamento da borda e a distância de proximidade são decisões analíticas do responsável. A restrição de custo zero exige medir o volume das geometrias antes de aceitar a camada.
- **Referência:** `_project/backlog.md`, commit `83e3a58`, integrado em `main` e `origin/main`. Não é local nem está pendente de publicação.
- **Destino em preparação.** O item continua `Disponível`. O retorno na fila (`- ciclo 006 — AAAA-MM-DD — parcela`) só é registrado depois da integração do encerramento em `main`, comprovada no GitHub, sob a autorização da seleção, por `gerenciar_backlog`. A publicação desse retorno exige autorização separada.
- **Cobertura da necessidade (para o retorno futuro):** este ciclo cobre fontes, camada e lente de sobreposição. Ficam como Restante: a lente de proximidade (Q6 = X0), a combinação da sobreposição com as outras lentes (Q9 = K1), as RPPN (P2), as terras em estudo (Q10 = T1) e fontes adicionais (ICMBio, órgão estadual, IBGE).

## Contexto e baseline

- **Base:** `main` e `origin/main` em `83e3a58` (retorno do BL-005). A ideação ainda não foi commitada: está como arquivo novo, com a linha do ciclo em `_project/cycles.md`, na branch local `chore/cycle-006-plan`, criada a partir de `chore/cycle-006-ideation` (ambas em `83e3a58`, sem commits próprios). Em 2026-11-12, `gh pr list` e `gh issue list` não mostraram PR ou issue aberta.
- **Dados:** carga `AQUA_M-T` de 2025-11-01 a 2026-10-31 (dias GMT), com 10.640 detecções principais e 3.290 células de 0,05° ocupadas. A identidade conferida nos ciclos `004` e `005` (`2134ff14…13e0db2`) vai mudar, porque a carga passa a incluir as áreas (T21). As detecções, os municípios e a disponibilidade não mudam.
- **Pipeline local (KB-004, `scripts/prototipo/`):**
  - as fontes são itens de `fontes.json` gerados por `itensDaJanela()` em `obter.mjs`;
  - `garantirItem` baixa o arquivo, registra bytes, SHA-256, `Last-Modified` e `ETag`, e para se o hash divergir;
  - a malha municipal é GeoJSON pronto do IBGE, lido com `JSON.parse`. As três qualidades vêm prontas do IBGE; **não existe simplificação local nem leitor de shapefile**;
  - `geo.mjs` (`classificarPonto`) devolve `dentro`, `borda` ou `fora`, com a borda exata pelo produto vetorial, buracos e multipolígonos respeitados, e a borda de buraco como `borda`;
  - o contorno estadual do IBGE (`ibge-malha-mt-estado-maxima`) já é lido em `processar.mjs`.
- **Banco (ADR-005, ADR-006):**
  - sete tabelas em `public`; a geometria fica em `municipios.geometria_exibicao` (`jsonb`), sem PostGIS;
  - `fontes` já guarda URL, SHA-256, bytes, data e `condicoes_uso`, e o cartão de Proveniência a exibe (`renderProveniencia`);
  - a publicação confere as contagens declaradas (`total_*`) em `cargas` e em `privado.manifestos_aprovados`;
  - três listas são fechadas e precisam ser atualizadas pela migração nova: o teste `01_estrutura` ("exatamente as 7 tabelas"), `privado.auditar_exposicao()` e `privado.conferir_papel_executor`.

  Volume medido: 17,6 MB persistidos em `public` por versão; pico de 45,9 MB de banco lógico com duas versões.
- **Interface (ADR-007, KB-005):**
  - os limites municipais são lidos sob demanda da tabela `municipios` (`lerLimites`), e o conjunto do estado só vem por pedido;
  - o mapa (Leaflet 1.9.4, sem tiles) tem as camadas de limites, destaques, pontos e seleção;
  - as lentes seguem C1 (`src/lentes/contrato.ts`). `TipoLente` tem três valores, e `NOME_LENTE: Record<TipoLente, string>` e `LENTES_CANONICAS` da combinação dependem dele.
- **Dependências:** `@supabase/supabase-js`, `leaflet`; em desenvolvimento, `@playwright/test`, `@types/leaflet`, `pg`, `supabase`, `typescript` e `vite`. Não há leitor de shapefile, `turf` nem biblioteca de simplificação.
- **Correção de um fato da ideação:** a ideação diz que "a regra de `.shp` já o impõe" a exclusão dos shapefiles do Git. Não há essa regra: `.gitignore` e o validador não tratam `.shp`, `.dbf`, `.zip` ou `.geojson`. Os shapefiles reais ficam fora do Git só por estarem em `/local/`. Este plano não muda o validador, porque isso é regra de governança e exige ciclo próprio. Os testes geram os bytes de shapefile fictícios na memória, e nenhum `.shp` é versionado.
- **Fatos conferidos na correção v2 (rodada 1):**
  - a API local limita cada resposta a 1.000 linhas (`max_rows`, `supabase/config.toml`);
  - a chave de `deteccoes` é `(carga_id, id_tecnico)`, sem o escopo: uma chave estrangeira para ela aceita detecção do envelope;
  - `expirar` (`carga.mjs`) apaga por uma lista fixa de tabelas, com contagem própria em `--simular`;
  - `garantirItem` grava o hash no primeiro download, antes de qualquer validação do conteúdo;
  - o gatilho de publicação compara a carga com o manifesto aprovado por uma tupla fixa de campos.
- **Exploração da ideação:** os números de detecções e células por classe foram calculados por um script temporário não versionado. Servem de calibração e **não** são valores esperados. A conferência deste ciclo os refaz por caminho independente.
- **Implantação:** cada merge em `main` gera um deploy de produção na Vercel. As migrações hospedadas e a carga hospedada são atos do responsável (runbook, seções 2 e 11).

## Escopo

### Dentro do escopo

- Obtenção das duas fontes, com registro de URL, data, bytes, SHA-256 e condições de uso.
- Leitor próprio de shapefile em zip (T16), seleção de áreas por classe (T17 e T19), pertencimento detecção × área (T18) e geometria de exibição em duas versões (T20), na carga local.
- Conferência independente do pertencimento sobre os dados reais locais.
- Migração nova e aditiva, com duas tabelas, RLS, grants, gatilhos e as listas fechadas atualizadas; extensão do manifesto e da carga (T21); ADR-008.
- Lente de sobreposição por classe (T22), com casos de referência e conferência independente por SQL.
- Leitor paginado e conferido das tabelas novas (T25); camada no mapa, contorno real sob demanda e interface mínima da lente (T24).
- Medição de volume, tempo e bytes, ação humana externa (migração e carga hospedadas), verificação em produção e documentação viva: KB-006 (nova), KB-005, KB-003, ADR-008 e o runbook.

### Fora do escopo

- Lente de proximidade (Q6 = X0) e qualquer distância a área.
- Combinação da sobreposição com as outras lentes (Q9 = K1). A combinação continua aceitando só as três lentes do ciclo `004`.
- RPPN (P2), terras em estudo (Q10), zonas de amortecimento e unidades do CNUC só com ponto, sem polígono.
- Outras fontes: ICMBio, órgão estadual, IBGE, VIIRS (BL-003), variação anual (BL-004) e CAR (BL-006).
- Mudança de parâmetro, regra ou resultado das lentes do ciclo `004`, da combinação do ciclo `005`, da contagem, da disponibilidade D1 ou das regras H3 da KB-004.
- PostGIS, função RPC nova, view, tiles de terceiros, dependência nova de produção e mudança no validador de governança.
- Design system (BL-007), atualização automática (BL-008), IA (BL-009) e parecer jurídico sobre licenças.
- Qualquer afirmação de incêndio, dano, autoria, infração ou situação fundiária.

## Decisões e autoridades

Autoridades: `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, KB-001, KB-003, KB-004, KB-005, ADR-002, ADR-003, ADR-005, ADR-006, ADR-007 e as decisões humanas da ideação `006`. O que este plano acrescenta como proposta técnica fica marcado como tal e só vira decisão com a aprovação do plano.

### Decisões herdadas da ideação (2026-11-12)

- **Q1 = A:** fontes, camada e sobreposição, com ponto de parada por volume.
- **Q2 = F1:** CNUC para unidades de conservação; FUNAI `tis_poligonais` para terras indígenas.
- **Q3 = E1:** três classes separadas e rotuladas — proteção integral, uso sustentável e terra indígena. Zonas de amortecimento fora; terras em estudo fora.
- **Q4 = S1:** a célula é destacada se tiver pelo menos 1 detecção dentro; a evidência são essas detecções.
- **Q5:** borda incluída. Polígono de qualidade "estimativa" ou "esquemático" entra com ressalva, sem exclusão. Detecção em mais de uma área lista todas.
- **Q6 = X0:** sem proximidade.
- **Q7 = L1:** pertencimento na carga local com o polígono integral; banco com tabelas novas e geometria de exibição. G2 e G4 = Sim.
- **Q8 e teto:**
  - visão geral simplificada (cerca de 110 m) e contorno real sob demanda (alternativa A), com 5 casas decimais;
  - até **0,6 MB brutos** por visualização geral da camada;
  - até **10 MB de acréscimo ao banco**.
- **Q9 = K1:** lente isolada.
- **Q10 = T1:** todas as fases das terras indígenas, menos "em estudo"; a fase aparece no motivo.
- **P1:** download autorizado e feito.
- **P2:** RPPN fora da primeira versão.
- **P3:** usar a camada da FUNAI com contorno exibido, citando fonte e data. A divergência entre a página e o rodapé do site é risco aceito pelo responsável.

### Pendências que a ideação deixou para o plano

| Pendência | Onde se resolve |
| :-- | :-- |
| Casos de referência independentes do código (borda, buraco, multipolígono, área dupla, classes excluídas) | Casos AP-1 a AP-23 e SB-1 a SB-16, na "Estratégia de testes" |
| Refazer os números exploratórios por outro caminho | Conferência do item 1 em duas etapas: reprodução no retrato exploratório e comparação no retrato da carga (R1-2); conferência do item 3 (células) |
| Codificação invertida nos `.cpg` e recusa 403 da FUNAI | T15 e T16; casos AP-11 a AP-14 |
| Polígonos que cruzam MT com rótulo de outra UF | T15 (download nacional da FUNAI), T18 e T19; caso AP-8 |
| Atribuição e versão na interface | T24 e cartão de Proveniência |
| ADR das tabelas novas | ADR-008, no item 2 |
| Verificação em produção | Seção "Verificação em produção" (exigida) |

### Detalhes técnicos propostos para ratificação na aprovação

Continuam a numeração dos ciclos `004` e `005`. Decorrem das decisões da ideação, mas mudam resultados de borda, o que é guardado ou o que é exibido. Por isso aparecem em "Aprovar plano › Conferir" e só valem com a aprovação.

| Detalhe | Proposta | Exemplo | Alternativa considerada |
| :-- | :-- | :-- | :-- |
| **T15 — Obtenção e retrato reproduzível (R1-4)** | Dois itens novos em `fontes.json`, papel `areas`. **CNUC:** o recurso `2025_08`, pelo download direto do portal de dados abertos do MMA (o arquivo da ideação, SHA-256 `97d754c1e01881d5f94e2f9e465fa95fe37b58c24a3df46989c7b30a9bb93fc6`). O SharePoint do CNUC 2026 não é usado, porque não é endereço estável. **FUNAI:** o WFS `Funai:tis_poligonais` **sem filtro de UF**, com saída `SHAPE-ZIP`. O arquivo da ideação, filtrado pelo rótulo `uf_sigla`, perderia terras de estados vizinhos que entram em MT. Ele fica em `local/areas-protegidas/` só como retrato exploratório, para a reprodução da ideação (ver "Estratégia de testes"), e nunca entra na carga. **Aquisição e promoção:** um item sem `sha256` é um retrato a adquirir. O download vai para `brutos/areas/<chave>-<AAAAMMDD>.zip` e é **validado antes de ser promovido**: leitura completa por T16 e T17, sem parada. Só depois a obtenção grava `sha256`, `tamanho`, `obtidoEm`, `lastModified` e `etag`. Se a validação falhar, o arquivo vira `.rejeitado`, e `fontes.json` não muda. A promoção é revisável: o hash entra no commit de `fontes.json` da PR do item 1. **Reprodução:** com o hash fixado, o arquivo local é a fonte. `garantirItem` não baixa de novo se o arquivo existe com o mesmo hash. Se o arquivo faltar, baixa de novo, e um hash diferente é parada, com `.divergente`, sem tocar em `fontes.json`. O WFS é vivo, então a recuperação é restaurar o ZIP da cópia local (runbook, seção 4), nunca aceitar o conteúdo novo. A carga hospedada é aplicada da mesma máquina, com os mesmos arquivos (`--alvo`), e por isso tem a mesma identidade. **Retrato novo** só por pedido explícito: novo item datado, sem `sha256`, sob autorização própria, com identidade nova de carga. **Rede:** toda requisição usa um nome de cliente genérico do projeto (`rastro-quente-carga`), sem dado pessoal. 403, outro erro HTTP ou corpo vazio levam a parada, nunca a "sem dados". **Condições de uso:** CNUC "CC BY (portal de dados abertos do MMA)"; FUNAI "reprodução com citação da fonte (página de geoprocessamento); o rodapé do site declara CC BY-ND 3.0; divergência aceita pelo responsável em 2026-11-12" | O WFS responde com outro conteúdo numa reexecução sem o ZIP local → parada com `.divergente`; com o ZIP restaurado da cópia local → `inalterado`, sem rede | Manter o filtro por UF (rejeitado: depende do rótulo); filtro por BBOX no WFS (rejeitado: a ordem dos eixos no EPSG:4674 é armadilha conhecida do WFS 2.0, e o volume nacional é pequeno); promover o hash no primeiro download, como hoje (rejeitado: fixaria um retrato inválido) |
| **T16 — Leitura do shapefile** | Leitor próprio em `scripts/prototipo/shapefile.mjs`, **sem dependência nova**. Extrai o zip com o `zlib` do Node (só os métodos *stored* e *deflate*) e lê `.shp` (só tipo 5, Polygon), `.dbf` e `.prj`. **Sistema de referência:** o `.prj` precisa declarar SIRGAS 2000 geográfico; outro valor leva a parada. **Codificação:** fixada por fonte em `fontes.json` (CNUC UTF-8, FUNAI ISO-8859-1, como medido na ideação), não lida do `.cpg`. UTF-8 é decodificado em modo estrito (byte inválido leva a parada). ISO-8859-1 leva a parada se os bytes formarem UTF-8 válido com sequência multibyte ou tiverem controles C1 (0x80 a 0x9F). A divergência com o `.cpg` é relatada. **Anéis:** convertidos em polígonos GeoJSON pela regra do formato (externo no sentido horário, buraco no anti-horário; cada buraco vai para o externo que o contém). Anel aberto, com menos de 4 vértices, buraco fora de todo externo ou buraco contido em mais de um externo leva a parada. **Membros do ZIP (R1-4):** cada item declara em `fontes.json` os nomes exatos dos membros `.shp`, `.dbf` e `.prj` do shapefile de polígonos. No CNUC, `cnuc_2025_08.*`, e não `cnuc_2025_08_pontos.*`; na FUNAI, `tis_poligonais.*`. O leitor lê só esses membros. Membro declarado ausente, nome repetido no ZIP ou número de registros diferente entre `.shp` e `.dbf` levam a parada, e o relatório registra o SHA-256 de cada membro lido. **Identidade da área:** `fonte` + código (`cd_cnuc` ou `terrai_cod`). Código vazio ou repetido dentro da mesma fonte leva a parada, nunca à fusão ou à escolha de um registro | Campo `nome_uc` com os bytes UTF-8 de "Á" num arquivo declarado ISO-8859-1 → parada, em vez de gravar "Ã" | Dependência `shapefile` (BSD-3), mais um leitor de zip: menos código, mas duas dependências novas para dois arquivos fixos, e a codificação continuaria precisando de controle próprio |
| **T17 — Classes e exclusões** | **CNUC:** `grupo` "Proteção Integral" vai para a classe `protecao_integral`; "Uso Sustentável", para `uso_sustentavel`. São excluídas e contadas por motivo: RPPN (P2), `limite` diferente de `uc` (zona de amortecimento) e `situacao` diferente de "Ativo". **FUNAI:** toda terra vai para `terra_indigena`, exceto `fase_ti` "Em Estudo" (Q10), excluída e contada. Valor de `grupo`, `categoria`, `limite`, `situacao` ou `fase_ti` fora da lista conhecida (os valores observados no item 1) leva a parada, nunca a classe padrão. **Atributos guardados:** fonte, código (`cd_cnuc` ou `terrai_cod`), nome, classe, categoria (UC) ou fase e modalidade (TI), esfera (UC) e qualidade do polígono (`quali_pol`, só UC). **Não são guardados:** `etnia_nome` (desnecessário à finalidade e tema sensível), município, órgão gestor, superfície e os demais campos | Unidade com `situacao` "Extinta" → excluída e contada; nenhuma hoje, pelos 3.122 polígonos "Ativo" da ideação | Guardar todos os atributos da fonte (rejeitado: amplia G3 sem uso); excluir só RPPN e "em estudo" (a exclusão das inativas é regra nova, mas não muda nenhum número atual) |
| **T18 — Pertencimento** | Cada detecção **principal** da carga é testada, com `classificarPonto` de `geo.mjs`, contra **todo** polígono incluído cujo retângulo envolvente a contenha, qualquer que seja o rótulo de UF. `dentro` e `borda` geram um vínculo com `posicao` (`interior` ou `borda`). Detecção em várias áreas gera um vínculo por área. A classificação usa sempre o polígono integral da fonte, nunca a geometria de exibição. O envelope não entra (as lentes usam só o principal). Saída `saidas/deteccoes_areas.csv` (`id_tecnico`, fonte, código da área, posição) | Detecção sobre o limite leste de uma UC e dentro de outra → dois vínculos, um `borda` e um `interior` | Testar só áreas rotuladas MT (rejeitado pela ideação: perde 2 detecções) |
| **T19 — Áreas guardadas (R1-7)** | Entram no banco as áreas incluídas por T17 que **tenham rótulo citando Mato Grosso** ou **pelo menos um vínculo** de T18. As demais ficam fora, contadas como "fora de MT pelo rótulo e sem detecção". A classificação (T18) não depende desta regra; ela só decide o que a camada mostra. **Comparação do rótulo:** o texto é normalizado (sem acentos, em maiúsculas, com espaços repetidos reduzidos a um) e dividido nos separadores `,`, `;` e `/`. No CNUC (`uf`), cita MT se algum termo for exatamente `MATO GROSSO`; `MATO GROSSO DO SUL` é outro termo e não cita. Na FUNAI (`uf_sigla`), o texto também é dividido em espaços, e cita MT se algum termo for exatamente `MT`. Termo fora dos nomes ou siglas das 27 UFs leva a parada: assim, um separador não previsto aparece no item 1, em vez de virar "não cita". **Texto visível:** a limitação de T23 e a legenda de T24 dizem que áreas de outros estados que entram em MT sem detecção desta carga não aparecem | Terra de Rondônia (`RO`) cujo polígono entra em MT e contém 1 detecção → guardada e exibida; unidade de `MATO GROSSO DO SUL` sem detecção → não guardada | Interseção geométrica exata de cada área com o contorno estadual: mais fiel à camada, mas exige teste aresta × aresta sobre centenas de milhares de vértices, sem efeito em nenhum resultado |
| **T20 — Geometria de exibição (R1-3, R2-1)** | Duas versões por área, em GeoJSON `MultiPolygon` (RFC 7946). **Validade, conferida na geometria final, depois do arredondamento, nas duas versões:** todo anel fechado, sem posições consecutivas repetidas, com pelo menos 4 posições, 3 delas distintas, e área (fórmula do laço) diferente de zero; nenhum anel com autointerseção; todo buraco estritamente dentro do seu anel externo, sem tocá-lo nem tocar ou cruzar outro buraco; partes do mesmo multipolígono sem interseção entre si. A conferência dos segmentos usa índice por grade, para caber no volume do contorno real. **Douglas-Peucker de anel fechado:** o anel, sem a posição de fechamento, é dividido em duas cadeias pela primeira posição e pela posição mais distante dela (em empate, a de menor índice). Cada cadeia é simplificada pelo Douglas-Peucker clássico, com a distância de cada vértice ao **segmento** entre os extremos da cadeia e, em empate, o vértice de menor índice. As duas cadeias são unidas, e o anel é fechado de novo. **Anel pequeno:** se o anel simplificado ficar com menos de 4 posições ou menos de 3 distintas, ele é mantido com as posições originais, só arredondadas. A regra vale para anéis externos e buracos. **Sequência por polígono, que para na primeira geometria válida:** tolerâncias de 0,001°, 0,0005°, 0,00025° e 0,000125°, cada uma seguida do arredondamento a 4 casas; depois, sem simplificação, só o arredondamento a 4 casas (tolerância efetiva 0); depois, o contorno real a 5 casas; se nenhuma for válida, há parada, com a área listada. O relatório registra a tolerância efetiva de cada polígono que não ficou em 0,001°. Nenhuma área, parte ou buraco é descartado em silêncio. **Desvio, medido depois do arredondamento:** nenhum vértice original fica a mais de *t* + 0,00008° da fronteira final, em graus planos, onde *t* é a tolerância efetiva e 0,00008° cobre meia unidade da 4ª casa nos dois eixos; no último recurso (5 casas), o limite é 0,000008°. **Contorno real:** a geometria integral arredondada a 5 casas (cerca de 1 m), sem posições consecutivas repetidas e com a mesma validade; inválido leva a parada. A classificação nunca usa nenhuma das duas | A maior terra indígena: contorno real de cerca de 1,1 MB brutos, baixado só sob demanda. AP-16: o buraco de 0,0004° de lado colapsaria a 3 posições e é mantido pela regra do anel pequeno. AP-18: a 0,001° a borda sul passaria por cima do buraco; a 0,0005° o polígono é válido, com desvio de 0,000267° (valores refeitos por este procedimento) | Reaproveitar `minima`/`intermediaria`/`maxima`, que não existem para estas fontes; simplificar no navegador (rejeitado: baixaria o polígono integral); descartar anéis colapsados (rejeitado: some área ou buraco); simplificação com preservação de topologia (rejeitada: algoritmo maior, sem necessidade com a sequência e a conferência de validade) |
| **T21 — Banco e carga (L1, R1-5)** | Migração nova e aditiva, com duas tabelas em `public`. **`areas`** guarda, por carga: fonte (`cnuc` ou `funai`), código, nome, classe, categoria ou fase, modalidade, esfera, qualidade, origem do rótulo, `geometria_geral` e `geometria_real` em `jsonb`; chave `(carga_id, fonte, codigo)` e chave estrangeira para a fonte da carga. **`deteccoes_areas`** guarda, por carga: `id_tecnico`, `area_fonte`, `area_codigo` e posição, com chave primária nas quatro primeiras colunas e chaves estrangeiras para a detecção e para a área **da mesma carga**. Mesmo protocolo das tabelas filhas: linha só entra em carga em preparação, nunca muda e não sai de carga publicada. RLS com as políticas `rp_le_*` e `ex_*` no padrão existente; `authenticated` só com `SELECT`; o EX com o mesmo papel que tem nas demais filhas. **Nenhuma RPC nova:** áreas e vínculos são lidos diretamente das tabelas, sob RLS, pelo contrato de leitura de T25. **Totais:** colunas novas `total_areas` e `total_vinculos_area` em `cargas` e em `privado.manifestos_aprovados`, com `check ((total_areas is null) = (total_vinculos_area is null))`, e `total_areas >= 1` e `total_vinculos_area >= 0` quando não nulos. Os dois entram na comparação da carga com o manifesto aprovado, ao lado dos campos de hoje. **Publicação:** com totais nulos (carga sem camada, como as anteriores ao ciclo), a carga é recusada se tiver qualquer linha em `areas` ou `deteccoes_areas`. Com totais não nulos, as contagens têm de ser iguais às declaradas. Nos dois casos, a publicação é recusada com `carga_inconsistente` se algum vínculo apontar para detecção do envelope, que a chave estrangeira não distingue. **Expiração:** `expirar` passa a apagar `deteccoes_areas` e `areas`, em ordem explícita, antes das tabelas atuais, com a contagem em `--simular`, sem depender de cascata. `privado.auditar_exposicao()`, `privado.conferir_papel_executor` e o teste `01_estrutura` passam a conhecer as duas tabelas. **Manifesto:** inclui as duas fontes, os hashes de `areas.json` e `deteccoes_areas.csv` e, no método, `areas: 'areas-006-v1'` com os parâmetros de T16 a T20. A CLI ganha `--sem-areas`, que monta a carga sem camada (totais nulos e método sem `areas`) a partir dos mesmos insumos; é o caminho de rollback. Decisão duradoura no **ADR-008** | Identidade nova da carga; o `resumo` da vigente passa a trazer áreas e vínculos por classe. Manifesto com `total_areas` 5 e `total_vinculos_area` nulo → recusado pelo `check` | Camada versionada à parte da carga (rejeitada: os vínculos dependem dos `id_tecnico` da carga, e duas versões independentes abririam a mistura que o ADR-006 fecha); PostGIS (rejeitado: a classificação é local); chave estrangeira com o escopo (exigiria nova unicidade em `deteccoes`; a conferência na publicação basta) |
| **T22 — Lente de sobreposição (R1-6)** | Módulo puro `src/lentes/sobreposicao.ts`, com versão própria `sobreposicao-006-v1`. `TipoLente`, `VERSAO_METODO`, C1 e a combinação **não mudam**: a sobreposição não é aceita por `combinar` (K1). **Contrato (`ResultadoSobreposicao`):** `lente: 'sobreposicao'` é o discriminante, fora de `TipoLente`. Os demais campos são `versao_metodo` (`sobreposicao-006-v1`), `classe`, `carga`, `janela`, `recorte` (M1-a), `parametros`, `estado` (`com_destaques`, `sem_destaques` ou `sem_camada`), `destaques`, `conferencia` (a de C1, mais `areas_lidas` e `vinculos_lidos`) e `limitacoes`. **Destaque:** cada `DestaqueSobreposicao` é um `Destaque` de C1 mais o campo **`areas`**, com uma entrada por área da classe com vínculo na célula, em ordem de chave. Cada entrada traz: `chave` (`<fonte>:<código>`, única na carga); `nome`, `classe`, `categoria_ou_fase`, `esfera` (só na unidade de conservação; nula na terra indígena) e `qualidade_poligono` (ou nulo); `deteccoes`, com os `id_tecnico` da célula e da janela vinculados àquela área, ordenados; `na_borda`, quantos desses vínculos são `borda`; e as `ressalvas` daquela área. `evidencia.deteccoes` é a união ordenada sem repetição, e `evidencia.valor` é o tamanho dela. `motivo` e `ressalvas` do destaque são montados a partir de `areas`, de modo que todo texto tem origem estruturada. **Entrada:** a `EntradaLente` já lida e conferida, mais as áreas e os vínculos da mesma carga lidos por T25, e a classe escolhida. **Regra (S1):** para a classe, uma célula T1 é destacada se tiver pelo menos uma detecção da janela vinculada a uma área da classe; vínculos de detecções fora da janela são ignorados. **Identificador:** `sobreposicao:<classe>:celula_005:<id>`. **Ordem:** a da T5 (norte→sul, oeste→leste), sem ordem por área ou por número de detecções. **Cobertura:** o qualificador comum sobre os municípios de todas as detecções da célula na janela, como na recorrência (D13). **Ressalvas por área:** "limite estimado pelo órgão gestor; a posição exata pode diferir" (`quali_pol` estimativa); "representação esquemática da localização; a posição pode diferir muito" (esquemático); e "N detecção(ões) exatamente sobre o limite da área" quando `na_borda` > 0. **Erros:** área, vínculo ou linha da carga de outra carga, vínculo para área não lida, ou classe fora das três → `ErroLente`, e a lente não é exibida | Célula com 10 detecções na janela, 4 vinculadas à UC fictícia X → destacada, com `areas` contendo X e 4 `id_tecnico`, e evidência 4 | Uma lente só, com as três classes juntas (E2, rejeitada na ideação); três entradas no seletor (mesma regra; a escolha da classe no formulário é mais compacta); só uma lista geral de áreas no resultado (rejeitada: a interface não saberia quais contornos baixar para a célula) |
| **T23 — Textos** | **Motivo**, um trecho por área da classe na célula, em ordem de código: "4 de 10 detecções desta célula dentro de UC fictícia X (proteção integral, parque, estadual)". Na terra indígena: "… dentro da Terra Indígena Y (fase: regularizada)". **Sem destaques:** "Nenhuma célula com detecção dentro de <classe> nesta janela. Isso não indica ausência de focos nem de risco." **Limitações:** (1) a de domínio, com o acréscimo "estar dentro de uma área protegida não indica infração, autoria nem situação fundiária"; (2) "Os limites são um retrato datado da fonte (<fonte, versão ou data>) e mudam por ato oficial"; (3) "A classificação usa o polígono integral da fonte; o mapa mostra um contorno simplificado (cerca de 110 m), e o contorno real pode ser aberto por área"; (4) "Não entram: RPPN, terras indígenas em estudo, zonas de amortecimento e unidades sem polígono no CNUC. Áreas de outros estados que entram em Mato Grosso só aparecem quando contêm detecção desta carga"; (5) "SIRGAS 2000 nas áreas e WGS84 nas detecções; a diferença é desprezível nesta escala"; (6) "A lista não é ranking: a classe ou o número de detecções não indica gravidade nem prioridade". Revisão de textos na PR do item 4 (risco "responsabilização de comunidades") | — | — |
| **T24 — Interface** | **Camada:** botão "Mostrar áreas protegidas", que lê a visão geral uma vez (sob demanda, nunca na abertura) e desenha as três classes com contorno e hachura distintos, mais legenda em texto (cor nunca é o único sinal). **Atribuição** na legenda e no cartão de Proveniência: fonte, versão ou data do retrato e condições de uso. A legenda também diz que áreas de outros estados sem detecção desta carga não aparecem (T19). A visão geral é lida por T25. **Área selecionada** (toque no mapa ou citação no painel): nome, classe, categoria ou fase, qualidade do polígono e o botão "Ver contorno real", que baixa só aquela área. **Lente:** opção "Sobreposição com áreas protegidas" no seletor, com um grupo de rádio para a classe; lista paginada em 50 células; retângulos das células na camada de destaques; painel com o motivo por área, a evidência paginada em 20 ("N de M"), as ressalvas, a cobertura, as limitações e o aviso de domínio. Ao abrir uma célula, a interface baixa o contorno real de cada `areas[].chave` do destaque (R1-6), com uma requisição por área. O contorno fica em memória enquanto a sessão e a carga forem as mesmas e é limpo como os limites municipais (ADR-007). **Estados distintos:** carregando, completo, sem destaques, cobertura não verificada, leitura inconsistente, versão substituída, carga sem camada de áreas (`total_areas` nulo), falha e cancelada. Sem redesenho: tokens e acessibilidade do ADR-007 | Carga antiga, sem áreas → a opção aparece com "esta versão dos dados não tem a camada de áreas protegidas", sem erro | Baixar a camada na abertura (rejeitado pelo ADR-007) |
| **T25 — Leitura completa das tabelas (R1-1)** | Leitor puro `src/lentes/carregar-areas.ts`, usado pela lente e pela camada. (1) Lê a linha da carga fixada em `cargas` (id, identidade, `total_areas` e `total_vinculos_area`). Linha ausente → diagnóstico da ausência (abaixo); totais nulos → `sem_camada`, sem ler as tabelas. (2) Pagina `areas` e `deteccoes_areas` com `carga_id = p_carga`, em ordem pela chave primária completa, com páginas de 1.000 (`range`) e contagem exata (`count=exact`). (3) Confere cada página: total exato igual ao declarado na linha da carga; número de linhas igual a min(1.000, total − deslocamento); `carga_id` igual ao pedido em toda linha; chave única no conjunto já lido. (4) Diante de página curta, total divergente ou chave repetida, relê a linha da carga. Uma resposta HTTP 416 (`PGRST103`, deslocamento além do total visível) conta como página curta (R3-1). Depois da releitura: ausente → diagnóstico da ausência; presente → `leitura_inconsistente` (`ErroLente`). Nunca há resultado parcial. **Diagnóstico da ausência (R2-3):** a RLS oculta a linha da carga tanto na perda de acesso quanto na troca de versão, então a ausência sozinha não diz qual foi. O leitor chama uma vez a sondagem existente (`sondarAcesso`, em `src/consulta.ts`). `negado` → `acesso_negado`; `sem_publicacao` → `sem_publicacao`; erro de sessão → `sessao_expirada`. Os três vão ao destino global de hoje, que limpa tela, mapa, camada, lente e memória. Com `autorizado`, o leitor lê `publicacao_vigente`: vigente diferente de `p_carga` → `versao_substituida`; igual → `leitura_inconsistente`, porque a linha deveria estar visível. Perda de acesso no meio da leitura aparece como página curta (a RLS devolve zero linhas) e cai no mesmo diagnóstico. (5) Ao fim, o conjunto lido tem exatamente o total declarado, e todo vínculo aponta para área lida. A ordem não é conferida no cliente, por causa da collation do banco, como no carregador atual; unicidade e contagem pegam duplicação e omissão. A lente lê todos os vínculos da carga (cerca de 3 mil linhas) e usa os da janela. A visão geral lê `areas` com a geometria geral pelo mesmo leitor, mesmo que caiba numa página | 1.201 vínculos, com a única evidência de uma célula no vínculo de posição 1.150 → duas páginas, célula destacada; segunda página com 200 linhas → `leitura_inconsistente` (casos SB-15 e SB-16) | Uma RPC paginada com erros explícitos (rejeitada: amplia a lista de funções expostas sem ganho de garantia, porque a contagem declarada na carga já fecha o conjunto) |

### Orçamento e procedimento de medição

| Medida | Teto | Onde se mede | Parada |
| :-- | :-- | :-- | :-- |
| Visão geral da camada (todas as áreas, `geometria_geral` e atributos), bytes brutos da resposta | ≤ 0,6 MB (Q8) | Estimada no item 1 (tamanho do JSON); medida na resposta real no item 4 | Antes da PR do item correspondente |
| Acréscimo ao banco por versão (`areas`, `deteccoes_areas`, linhas novas de `fontes`, TOAST e índices) | ≤ 10 MB (Q8) | Estimado no item 1 (soma dos JSON); medido no item 2 com a CLI de carga, como no ADR-006 | Antes da PR do item correspondente |
| Aplicação da lente, por classe, na janela inteira: do clique em "Aplicar lente" até `data-estado-lente="completo"` (registros, linha da carga, áreas, vínculos e disponibilidade) | Mediana comprimida ≤ 20,0 s e maior total de bytes brutos ≤ 10.000.000 (regra dos ciclos `004` e `005`) | Item 4, pelo procedimento do plano `004` | Antes da PR do item 4 |
| Abertura de uma célula: os contornos reais das áreas do destaque, depois do estado completo (R1-8) | Sem teto (Q8); tempo, número de requisições e bytes brutos registrados | Item 4, em duas células por classe: a de mais áreas e a de maior soma de bytes de contorno | Não para |
| Contorno real da maior área, isolado | Sem teto (Q8); tempo e bytes registrados | Item 4 | Não para |

- **O que entra em cada aceite (R1-8):** a aplicação da lente não inclui a abertura de célula, que é medida e registrada à parte, sem teto, porque Q8 não fixou teto por área. A visão geral soma todas as respostas de `areas` da leitura (T25), mesmo que seja uma página só, e seus bytes não entram na aplicação da lente.
- **Estimativa, a confirmar:**
  - **Visão geral:** a ideação mediu 537 KB brutos de coordenadas a 0,001° só para as áreas rotuladas MT. Atributos, áreas vizinhas com vínculo e o envelope JSON do PostgREST somam pouco, mas a margem até 0,6 MB é de cerca de 10%.
  - **Banco:** a soma original é de 8,9 MB de coordenadas em JSON; o contorno real, a 5 casas, fica abaixo disso, e o `jsonb` grande é comprimido no TOAST. A margem até 10 MB depende dessa compressão.
  - **Lente:** custa a leitura dos registros (3,86 MB brutos) e a dos vínculos (cerca de 2.800 linhas). Custa também a disponibilidade dos municípios da cobertura, 87.453 bytes por município. As 750 células de terra indígena podem tocar mais que os cerca de 70 municípios que cabem no orçamento. **A parada é um desfecho plausível.**
- **Alternativas em caso de parada**, apresentadas com os números por parte, nenhuma escolhida pelo agente:
  - **Volume:** tolerância maior na visão geral (a ideação mediu 157 KB a 0,005°); ajustar o teto; ou contorno real só para terras indígenas acima de um tamanho.
  - **Lente:** aceitar com progresso visível e registrar o desvio, como no ciclo `005`; cobertura sob demanda, só da célula aberta no painel; ou ajustar o orçamento.

### Verificação em produção

Exigida. Os ciclos `004` e `005` fecharam sem ela, por decisão do responsável. Aqui, ela também confere a migração e a carga hospedadas, que são novas. Depois da ação humana externa e da integração do item 4, o responsável executa na própria sessão:

- copia do cartão de Proveniência a **identidade integral** da carga (SHA-256 de 64 caracteres), que precisa ser igual à da conferência local, caractere a caractere;
- abre a camada com "Disable cache" ligado e o filtro `rest/v1/areas` na aba Network. Informa: o número de áreas exibidas; o número de requisições; a soma de "resources" do rodapé da aba, que é o tamanho descomprimido e corresponde aos bytes brutos do aceite; a soma de "transferred", que pode estar comprimida; e o `Content-Encoding` de cada resposta (R1-8);
- aplica a lente nas três classes, na janela inteira, uma execução de cada, com a página recarregada antes, e informa o número de células e o tempo exibido;
- abre o contorno real de uma área à escolha e uma célula com mais de uma área, e informa, com o filtro `rest/v1/areas`, as requisições, "resources" e "transferred" de cada abertura.

O agente confere com a conferência local da mesma identidade. **Parada em produção, antes do encerramento:** identidade ausente ou divergente; número de áreas ou de células diferente do local; soma de "resources" da visão geral acima de 0,6 MB. As alternativas para decisão do responsável:

- aceitar e registrar o desvio no encerramento;
- corrigir por trilha curta ou por novo ciclo;
- reverter as entregas pela seção de rollback.

O encerramento só é preparado depois da decisão registrada. Se o responsável decidir dispensar a verificação, a dispensa é registrada como desvio explícito do plano, como no ciclo `005`.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho: "autorizo o rascunho do plano do ciclo 006" | Ideação registrada com as decisões | Este rascunho local, o registro na ideação, a linha do ciclo em `cycles.md` e a branch local `chore/cycle-006-plan` | Revisão, aprovação, commit, publicação, issues e implementação | Recebida em 2026-11-12 |
| Aprovar plano: "aprovo o plano do ciclo 006" | Revisão formal com veredito apto e manifestação humana posterior | O plano revisado; a PR documental (ideação, plano e registro do ciclo); depois da integração documental e da confirmação dos payloads, a criação das quatro issues; o encerramento, depois das entregas | Implementação, merges, ação externa e verificação em produção | Como decisões humanas de G1, G2 e G3: T15 a T25, os casos AP e SB, os textos de T23, as versões `areas-006-v1` e `sobreposicao-006-v1`, o desenho das tabelas e a matriz de acesso (ADR-008 a escrever no item 2), o orçamento com a parada e o fatiamento em quatro issues |
| Autorizar implementação: "autorizo a implementação da issue #N" | Plano aprovado e integrado, issue criada e item anterior integrado (no item 3, também a ação externa concluída) | Branch, task, implementação, testes, conferência e medição locais com os dados reais de `local/`, e a PR da issue | Merge, mudança de regra ou de parâmetro, dependência nova e a decisão que uma parada exigir | Escopo da issue, barreiras e gates |
| Ação humana externa: "concluí a ação externa da issue #N" (issue do item 2) | Item 2 integrado; roteiro pronto na task do item 2 | O responsável aplica a migração no Supabase hospedado (`db push`, com `--dry-run` antes), aprova o manifesto, abre e fecha a janela do EX e publica a carga nova pela CLI. O agente confere o que for acessível por leitura | Credenciais ou senhas ao agente; reset, repair ou qualquer migração fora do repositório | Lista do `--dry-run` igual às migrações do repositório; identidade publicada igual à do `plan` local; `auditar_exposicao()` vazia; EX sem `LOGIN` ao final |
| Aprovar merge: "aprovo o merge da PR #N" | PR concreta, checks verdes no último commit e diff conferido | Somente o merge daquela PR, por squash, **e o deploy de produção automático que ele dispara na Vercel** | Outras PRs, ação externa, verificação em produção e nova entrega | Diff, G1 a G4, privacidade, conferência e estado real. No item 4: ação externa já concluída |
| Verificar produção: "autorizo a verificação em produção do ciclo 006" | Itens 1 a 4 integrados, carga hospedada publicada e deploy identificado por commit | O roteiro da seção "Verificação em produção", executado pelo responsável, e a conferência do agente | Login pelo agente, carga, migração e mudança de dados ou de método | Identidade integral igual à local; áreas, células e bytes conforme o roteiro |

Cada PR, inclusive a documental e a de encerramento, tem aprovação própria de merge. No ciclo completo não há modo contínuo.

Toda cadeia autorizada para em "Parado" quando:

- a conferência independente divergir do pipeline ou do módulo sem explicação;
- um número da exploração não for reproduzido e a diferença não for explicada (inclusive pela troca do download da FUNAI, T15);
- algum teto de volume ou de orçamento for excedido;
- surgir valor de atributo, codificação, sistema de referência ou geometria fora do previsto (T15 a T17);
- um caso de borda não previsto mudar a seleção;
- for preciso mudar uma lente do ciclo `004`, a combinação ou uma regra da KB-004;
- surgir necessidade de dependência nova, RPC, view, PostGIS ou mudança no validador;
- a produção divergir da conferência local;
- houver dúvida de privacidade ou de texto sensível.

A concessão não dispensa a conferência da precondição.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regra nova de sobreposição, com fontes e geometrias novas. É atendida por: decisões humanas registradas (Q1 a Q10, P2 e P3, e T15 a T25 ratificados na aprovação); casos de referência fictícios com valores esperados escritos neste plano antes do código (AP e SB); conferência do pertencimento por outro algoritmo (número de voltas sobre os anéis crus, sem `geo.mjs` nem o agrupamento de anéis); conferência da lente por SQL escrito à parte. Proveniência por fonte, hash e versão (`areas-006-v1`, `sobreposicao-006-v1`). Limitações e aviso de domínio em todo resultado, sem ordem por área. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Duas tabelas novas em `public`, com RLS, políticas no padrão do ADR-005, `SELECT` para `authenticated` só em carga publicada e para o RP cadastrado, e o EX sem privilégio novo além das duas tabelas. Testes pgTAP da matriz AN/RP/OA/EX nas tabelas novas (inclusive carga em preparação e retirada, imutabilidade e `service_role` sem acesso), testes pela API real e as listas fechadas atualizadas. Revisão manual de políticas e funções `security definer` na PR do item 2. ADR-008 registra a matriz. |
| G3 — privacidade de dados | Sim | Fontes públicas, sem campo de pessoa. RPPN fora (o nome pode identificar o proprietário). `etnia_nome` não é guardado. Fixtures fictícias, com os shapefiles gerados na memória pelos testes; os arquivos reais ficam em `local/areas-protegidas/` e `local/dados-prototipo/`, fora do Git. Relatórios versionados só com agregados por classe, fase, categoria e esfera, sem lista de áreas por nome. Nome de cliente HTTP genérico, sem dado pessoal. Nenhum dado territorial no bundle ou em armazenamento do navegador. |
| G4 — migrações só acrescentam | Sim | Uma migração nova `AAAAMMDDHHMMSS_areas_protegidas.sql`, aditiva. Nenhuma migração existente é editada, renomeada ou removida; funções existentes são substituídas por `create or replace` na migração nova. O passo de CI do G4 confere. Os arquivos de `supabase/tests/` não são migrações e são atualizados. |

## Estratégia de testes

- **Nesta redação:** testes e validador de governança, `git diff --check`, revisão do diff, coerência de estados e referências, G3. Nenhum código, banco ou dado real foi executado para redigir o plano.
- **Valores esperados escritos à mão.** Os valores dos casos AP e SB vêm das tabelas abaixo, nunca de uma saída do código.

**Fixture de áreas (fictícia, coordenadas `[longitude, latitude]`).**

| Área | Fonte e atributos | Geometria |
| :-- | :-- | :-- |
| A1 | CNUC; Proteção Integral, parque, estadual, `quali_pol` memorial, `uf` "MATO GROSSO" | Quadrado de −60,00 a −59,90 por −10,00 a −9,90, com buraco de −59,97 a −59,93 por −9,97 a −9,93 |
| A2 | CNUC; Uso Sustentável, APA, federal, `quali_pol` estimativa, `uf` "MATO GROSSO" | Quadrado de −59,92 a −59,80 por −10,00 a −9,90 (sobrepõe A1 na faixa de −59,92 a −59,90) |
| A3 | FUNAI; fase regularizada, `uf_sigla` "MT" | Duas partes: −60,00 a −59,95 e −59,85 a −59,80, ambas por −9,90 a −9,85 |
| A4 | FUNAI; fase "Em Estudo", `uf_sigla` "MT" | −59,95 a −59,90 por −9,90 a −9,85 |
| A5 | CNUC; RPPN (grupo Uso Sustentável), `uf` "MATO GROSSO" | −59,80 a −59,75 por −10,00 a −9,95 |
| A6 | CNUC; Proteção Integral, `limite` "za" | −59,75 a −59,70 por −10,00 a −9,95 |
| A7 | CNUC; Uso Sustentável, `uf` "PARÁ" | −59,70 a −59,65 por −10,00 a −9,95 |
| A8 | FUNAI; regularizada, `uf_sigla` "PA" | −59,60 a −59,55 por −10,00 a −9,95 |
| A9 | FUNAI; regularizada, `uf_sigla` "RO" | −59,50 a −59,45 por −10,00 a −9,95 |
| A10 | CNUC; Proteção Integral, `uf` "MATO GROSSO DO SUL" | −59,40 a −59,35 por −10,00 a −9,95 |

**Detecções principais fictícias:** d1 (−59,99; −9,99); d2 (−59,95; −9,95); d3 (−59,97; −9,95); d4 (−59,90; −9,95); d5 (−59,91; −9,95); d6 (−59,97; −9,87); d7 (−59,82; −9,87); d8 (−59,92; −9,87); d9 (−59,77; −9,97); d10 (−59,72; −9,97); d11 (−59,67; −9,97); d12 (−59,50; −9,50); d13 (−59,47; −9,97).

| Caso | Entrada | Esperado |
| :-- | :-- | :-- |
| AP-1 Interior | d1 | Um vínculo: A1, `interior` |
| AP-2 Buraco | d2 | Nenhum vínculo (o ponto está no buraco de A1) |
| AP-3 Borda de buraco | d3 (sobre o limite oeste do buraco) | Um vínculo: A1, `borda` (borda incluída, KB-004) |
| AP-4 Borda e outra área | d4 (sobre o limite leste de A1, dentro de A2) | Dois vínculos: A1 `borda` e A2 `interior` |
| AP-5 Duas áreas | d5 | Dois vínculos: A1 e A2, ambos `interior` |
| AP-6 Multipolígono | d6 e d7 | Um vínculo cada, com A3, `interior` |
| AP-7 Classes excluídas | d8 (A4, em estudo), d9 (A5, RPPN), d10 (A6, zona de amortecimento) | Nenhum vínculo. A4, A5 e A6 contadas uma vez cada nas exclusões, por motivo |
| AP-8 Rótulo de outra UF | d11 (A7, UC) e d13 (A9, TI de `RO`) | Um vínculo cada, com A7 e com A9. As duas são guardadas (T19), com a origem "vínculo" registrada. A9 é o caso que motiva o download nacional da FUNAI (T15) |
| AP-9 Fora de tudo | d12 | Nenhum vínculo |
| AP-10 Áreas guardadas (T19) | A fixture inteira | Guardadas: A1, A2 e A3 (rótulo MT), A7 e A9 (vínculo). Fora: A4, A5 e A6 (exclusão); A8 e A10 (sem rótulo MT e sem vínculo; A10 é `MATO GROSSO DO SUL`). Totais: 5 áreas e 10 vínculos (d1, d3, d4 ×2, d5 ×2, d6, d7, d11, d13) |
| AP-11 Codificação UTF-8 | `.dbf` UTF-8 com byte inválido | Parada; nada gravado |
| AP-12 Codificação ISO-8859-1 | `.dbf` declarado ISO-8859-1 com "Á" em UTF-8 (`C3 81`) | Parada, com o campo e o registro; a divergência com o `.cpg` é relatada |
| AP-13 Sistema de referência | `.prj` com SIRGAS 2000 UTM | Parada |
| AP-14 Obtenção | Resposta 403 a item sem `sha256`; ZIP sem `.prj` em item sem `sha256`; hash divergente em item com `sha256` fixado | Parada nos três, e nenhum arquivo é promovido nem lido por `processar`. Resultados distintos: 403 → nenhum arquivo em `brutos/`, com o status HTTP no registro de obtenção; ZIP inválido → arquivo `.rejeitado`, sem `sha256` gravado; hash divergente → arquivo `.divergente`, com `fontes.json` inalterado. Os dois últimos ficam só para diagnóstico (AP-21 detalha) |
| AP-15 Geometria inválida | Anel aberto; anel com 3 vértices; buraco fora de todo externo; tipo de forma 3 (linha) | Parada em cada um |
| AP-16 Simplificação e anel pequeno (T20) | Área com um anel externo de 1.000 vértices quase colineares e um buraco quadrado de 0,0004° de lado (diagonal de 0,000566°), longe da borda | Visão geral válida com tolerância 0,001°: o anel externo reduzido, com nenhum vértice original a mais de 0,00108° da fronteira final, medido depois do arredondamento. O buraco, que o Douglas-Peucker de anel fechado reduziria a 3 posições (2 distintas), é mantido pela regra do anel pequeno, com as 4 posições originais arredondadas a 4 casas. Contorno real válido: todos os vértices a 5 casas, sem repetição consecutiva. Os vínculos não mudam |
| AP-17 Colapso no arredondamento (T20) | A11: quadrado de −58,00001 a −57,99998 por −10,00001 a −9,99998; depois, A11': quadrado de −58,000001 a −57,999998 na longitude | A11: a 4 casas, os quatro vértices viram (−58,0000; −10,0000), e o anel é inválido; a visão geral usa o contorno real a 5 casas, válido, e o relatório lista A11. A11': a 5 casas, os vértices de longitude também coincidem (−58,00000); parada, com A11' listada. Nenhum dos dois some em silêncio |
| AP-18 Buraco junto da borda (T20) | A12: exterior com as posições (−57,00; −10,0000), (−56,96; −10,0008), (−56,94; −10,0008), (−56,90; −10,0000), (−56,90; −9,90) e (−57,00; −9,90); buraco de −56,952 a −56,948 por −10,0005 a −10,0003. Detecções d14 (−56,95; −10,0004), no buraco, e d15 (−56,95; −10,0007), entre o buraco e a borda | Pelo procedimento de T20, a primeira posição é (−57,00; −10,0000) e a mais distante, (−56,90; −9,90). **0,001°:** as duas posições de −10,0008 saem (desvio de 0,0008°), a borda sul vira a reta −10,0000 e o buraco fica fora do exterior: inválido. **0,0005°:** fica (−56,96; −10,0008), primeira em empate; (−56,94; −10,0008) sai, a 0,000267° do novo segmento. A borda passa a −10,000693 em −56,952 e a −10,000640 em −56,948, abaixo do buraco (−10,0005): **válido, tolerância efetiva 0,0005°**, desvio máximo de 0,000267°. Vínculos, calculados no polígono integral: d14 nenhum; d15 A12 `interior` |
| AP-19 Rótulo de UF (T19) | Textos de `uf`: "MATO GROSSO", "Mato  Grosso", "PARÁ, MATO GROSSO", "MATO GROSSO DO SUL", "MATO GROSSO; XX". Textos de `uf_sigla`: "MT", "MT,PA", "MT/RO", "MS", "PA RO" | Cita MT: os três primeiros de `uf` e os três primeiros de `uf_sigla`. Não cita: "MATO GROSSO DO SUL", "MS" e "PA RO". "MATO GROSSO; XX" para, com o termo "XX" |
| AP-20 ZIP misto (T16) | ZIP com `x.shp/.dbf/.prj` (polígonos) e `x_pontos.shp/.dbf/.prj` (pontos), membros declarados `x.*`; o mesmo ZIP sem `x.prj`; um ZIP com dois membros `x.dbf` | O primeiro lê só `x.*` e registra o SHA-256 de cada membro; os outros dois param |
| AP-21 Retrato fixado (T15) | Item com `sha256` fixado: arquivo presente; arquivo ausente e WFS fictício com bytes diferentes. Item sem `sha256`: ZIP baixado sem `.prj` | Presente: `inalterado`, sem rede. Ausente com bytes diferentes: parada, arquivo `.divergente` e `fontes.json` inalterado. Sem `.prj`: validação falha, arquivo `.rejeitado`, item não promovido (sem `sha256` gravado) |
| AP-22 Código repetido (T16) | Dois registros do CNUC com o mesmo `cd_cnuc` | Parada, com o código; nenhuma área gravada |
| AP-23 Decomposição entre retratos (conferência, R2-2) | Retrato exploratório fictício com as terras TE (em estudo), TG (ausente do retrato nacional), TM (alterada) e TK (igual). Retrato nacional fictício com TM alterada, TK e TN (nova). Detecção x só em TE e TG, única da célula Cx; y, única da célula Cy, em TM no exploratório e fora de TM no nacional; z só em TN, única da célula Cz; w em TK e TE | Pela ordem (a), (d), (c), (b): (a) retira TE: x continua em TG, w continua em TK → 0 detecção e 0 célula; (d) retira TG: x perde o último vínculo → −1 detecção e −1 célula (Cx); (c) troca TM: y sai → −1 detecção e −1 célula (Cy); (b) acrescenta TN: z → +1 detecção e +1 célula (Cz). A soma das parcelas é igual à diferença total entre os dois retratos |

**Fixture da lente (fictícia).** A lente recebe vínculos prontos (T22), não geometria. Por isso a fixture traz os atributos das áreas guardadas em AP-10 e os vínculos escritos à mão, sem recalculá-los. As coordenadas das detecções são escolhidas em cinco células T1 distintas, na janela de 01/10 a 31/10/2026. São 14 detecções na janela e uma fora dela:

| Célula | Detecções na janela | Vínculos dados |
| :-- | :-- | :-- |
| P | 7 (p1 a p7) | p1: A1 `interior` |
| Q | 3 (q1 a q3) | nenhum (na realidade, cairiam no buraco de A1) |
| R | 2 (r1 e r2) | r1: A1 `borda` e A2 `interior`; r2: A1 `interior` e A2 `interior` |
| S | 1 (s1) | s1: A3 `interior` |
| T | 1 (t1) | t1: A1 `borda` |

Fora da janela: x1, de 15/09, na célula Q, com vínculo A1 `interior`.

| Caso | Entrada | Esperado |
| :-- | :-- | :-- |
| SB-1 Destaque S1 | Proteção integral | P destacada, evidência 1 (p1), motivo "1 de 7 detecções desta célula dentro de A1 (proteção integral, parque, estadual)" |
| SB-2 Célula sem detecção dentro | Proteção integral | Q não destacada: A1 cobre parte da célula, mas nenhuma detecção da janela tem vínculo (S1, e não S2) |
| SB-3 Borda | Proteção integral | T destacada, com a ressalva "1 detecção exatamente sobre o limite da área". R também, com a mesma ressalva (r1) |
| SB-4 Duas classes | Proteção integral e, depois, uso sustentável | R aparece nas duas. Em proteção integral, evidência r1 e r2, motivo "2 de 2 detecções desta célula dentro de A1 …". Em uso sustentável, evidência r1 e r2, motivo só com A2 e a ressalva de limite estimado. Nenhum resultado cita a outra classe |
| SB-5 Duas áreas da mesma classe | Fixture com A2' (outro código, uso sustentável) e o vínculo r2: A2' | Em R, `areas` tem duas entradas, em ordem de chave: A2 com `deteccoes` [r1, r2] e A2' com [r2]. `evidencia.deteccoes` é [r1, r2], com `valor` 2, sem repetição. O motivo cita A2 (2 detecções) e A2' (1) |
| SB-6 Terra indígena | Terra indígena | Só S destacada, motivo "1 de 1 detecção desta célula dentro da Terra Indígena A3 (fase: regularizada)". A4 (em estudo) não existe para a lente |
| SB-7 Janela | Proteção integral | x1 (15/09) não conta: Q continua fora. Na janela de 01/09 a 31/10, Q entra com evidência 1 (x1) |
| SB-8 Sem destaques | Terra indígena na janela de 01/08 a 31/08 | Estado `sem_destaques`, com o texto de T23 e o aviso de domínio |
| SB-9 Ordem | Proteção integral | Células na ordem T5 (norte→sul, oeste→leste), sem campo de ordem por área ou por contagem |
| SB-10 Cobertura | Proteção integral; p1 no município M1 e p2 a p7 em M2; M2 com `lacuna_conhecida` em 10/10 | Cobertura de P sobre M1 e M2 (todas as 7 detecções da célula): "30 de 31 dias sem evidência de lacuna (cobertura não comprovada)"; pendente e falha como no ciclo `004`. A seleção não muda |
| SB-11 Entrada inconsistente | Vínculo de outra carga; vínculo para área inexistente; classe "rppn" | `ErroLente` nos dois primeiros; entrada inválida no terceiro. Nenhum destaque |
| SB-12 Determinismo | Registros, vínculos e áreas embaralhados | Resultado idêntico |
| SB-13 Combinação intacta | `validarEscolha(['sobreposicao', 'recorrencia'], 'e')` | "lente desconhecida"; os casos CB-1 a CB-16 e os do ciclo `004` passam sem alteração |
| SB-14 Carga sem camada | Carga com `total_areas` nulo | Estado `sem_camada`, com o texto "esta versão dos dados não tem a camada de áreas protegidas", sem `ErroLente` e sem ler `areas` nem `deteccoes_areas` |
| SB-15 Paginação completa (T25) | Fonte fictícia com 1.201 vínculos declarados e lidos em páginas de 1.000; a única evidência da célula Z está no vínculo de posição 1.150 | Duas páginas, conjunto com 1.201 vínculos; Z destacada com evidência 1 |
| SB-16 Leitura incompleta e diagnóstico (T25) | Como SB-15, com: segunda página de 200 linhas; contagem exata 1.200; vínculo repetido entre páginas; linha de outra carga. Depois, quatro casos de linha da carga ausente na releitura: sondagem `negado`; sondagem `sem_publicacao`; sondagem `autorizado` com vigente de outra carga; sondagem `autorizado` com vigente igual a `p_carga` | Os quatro primeiros → `leitura_inconsistente`, com a linha da carga presente. Linha ausente: `acesso_negado`, `sem_publicacao`, `versao_substituida` e `leitura_inconsistente`, nessa ordem. Nenhum destaque parcial; os três primeiros diagnósticos vão ao destino global |

- **Conferência independente do pertencimento (item 1, local, fora da CI, R1-2):** `npm run conferir:areas`. Reimplementa o teste por **número de voltas** sobre os anéis crus do shapefile, sem `geo.mjs` e sem o agrupamento de anéis de T16, com borda exata. Calcula também as células T1 por aritmética decimal exata a partir do texto de `deteccoes.csv`, sem importar `src/lentes/`. Roda em duas etapas, sem teto herdado de uma para a outra:
  1. **Reprodução exploratória, no retrato da ideação:** o CNUC `2025_08` e o ZIP da FUNAI filtrado por UF (`funai_tis_poligonais_mt.zip`, SHA-256 `6dd8003f92c4bc966895aececded40ca21021d43a1a193e1c6150459bb313f08`, só em `local/areas-protegidas/`), com as regras da exploração: todas as fases, RPPN incluídas e sem T19. Precisa reproduzir **exatamente**:
     - UC: 323 detecções e 108 células; proteção integral 76 e 37; uso sustentável 254 e 74;
     - TI: 2.500 detecções e 750 células;
     - UC e TI ao mesmo tempo: 4 detecções e 3 células; UC ou TI: 2.819 e 855;
     - 9 detecções em mais de uma UC e 2 em mais de uma TI; 2 em unidade sem rótulo de MT; 1 em polígono "estimativa"; nenhuma sobre a borda; nenhuma em RPPN.

     Uma diferença aqui é defeito do pipeline ou da conferência, e leva a "Parado".
  2. **Comparação no retrato da carga:** o CNUC `2025_08` e o retrato nacional da FUNAI promovido (T15), com T17 a T19. O pipeline e a conferência têm de coincidir, detecção a detecção. Os números são registrados como resultado, não comparados com um teto. A diferença da terra indígena em relação à etapa 1 é decomposta, em detecções distintas e em células distintas, por **atribuição sequencial (R2-2)**. Parte-se do conjunto de vínculos da etapa 1 (estado S0) e aplicam-se quatro passos, sempre nesta ordem:

     - (a) retirar os vínculos das terras em estudo, pela fase do retrato exploratório (S1);
     - (d) retirar os vínculos das terras do retrato exploratório ausentes do nacional (S2);
     - (c) trocar os vínculos das terras presentes nos dois retratos com geometria ou atributo diferente, achadas pelo hash da geometria normalizada e dos atributos por código, pelos vínculos do retrato nacional com T17 aplicado (S3);
     - (b) acrescentar os vínculos das terras presentes só no retrato nacional, com T17 aplicado (S4).

     Cada parcela é a diferença de detecções e de células distintas entre um estado e o seguinte, e pode ser negativa ou positiva. Uma detecção ou célula que só perde o último vínculo quando duas mudanças se somam é atribuída ao passo em que o último vínculo desaparece; o caso AP-23 traz o exemplo. Por construção, a soma das parcelas é a diferença total. A conferência exige ainda que S4 seja igual, vínculo a vínculo, ao resultado da etapa 2; se não for, a situação é "Parado". As unidades de conservação usam o mesmo arquivo nas duas etapas, e sua diferença é uma parcela única, a das exclusões de T17.

  O relatório local lista as parcelas por código; o versionado (`006_research_conferencia_areas.md`) traz só os agregados por classe, fase e parcela, as contagens de áreas por classe, exclusão e origem do rótulo, e os hashes das fontes e dos membros.
- **Conferência independente da lente (item 3, local):** `npm run conferir:sobreposicao`. Como `conferir:combinacao`, parte do banco vazio e publica a carga real pela CLI. Compara, por SQL escrito à parte (sem importar `src/lentes/`, células em `numeric` a partir do texto decimal de `deteccoes.csv`, vínculos de `deteccoes_areas.csv`), com o módulo alimentado pelas tabelas. A comparação é célula a célula: evidência, áreas citadas, ressalvas e municípios da cobertura. As janelas e classes:
  - **janela inteira, três classes:** o número de células de cada classe tem de ser igual ao da etapa 2 da conferência do item 1, na mesma identidade de carga. Não há teto herdado da exploração (R1-2): proteção integral e uso sustentável devem continuar em 37 e 74, salvo diferença explicada pela etapa 2;
  - **01/08 a 31/10 e 01/10 a 31/10:** registradas.

  A identidade da carga é registrada no início e no fim.
- **Banco (item 2):** pgTAP em `supabase/tests/` para as tabelas novas: estrutura (9 tabelas, RLS, grants), matriz AN/RP/OA/EX, carga em preparação e retirada invisíveis, imutabilidade, publicação com `total_areas` e `total_vinculos_area` divergentes recusada. Casos de R1-5: totais com nulidade parcial recusados pelo `check` em `cargas` e em `privado.manifestos_aprovados`; totais nulos com linha em `areas` ou `deteccoes_areas` recusados na publicação; carga com totais nulos e sem linhas aceita; vínculo para detecção do envelope recusado na publicação; vínculo de outra carga recusado pela chave estrangeira; manifesto com totais diferentes da carga recusado. Também: `service_role` sem acesso e `auditar_exposicao()` vazia. **Expiração:** `expirar --simular` conta as linhas das duas tabelas novas, e `expirar` as apaga só de cargas retiradas, sem tocar a vigente. **Rollback demonstrado:** a partir dos mesmos insumos, `plan --sem-areas` e `apply` publicam, com nova `revisao` e novo manifesto aprovado, uma carga sem camada, com totais nulos, que substitui a carga com áreas. O `resumo` dessa carga tem detecções, municípios e disponibilidade iguais aos da carga com áreas. Testes pela API real (`scripts/banco/api.test.mjs`) para leitura do RP e negação de AN e OA, e, no item 3, o leitor de T25 contra o PostgREST local numa carga fictícia com 1.201 vínculos: a célula cuja única evidência está na segunda página é destacada (SB-15 pela API). No mesmo teste, a autorização é revogada entre a primeira e a segunda página, com a carga ainda vigente. A resposta real do PostgREST (inclusive 416 `PGRST103`) tem de terminar em `acesso_negado` (R3-1). Testes de manifesto e carga para a identidade nova, a reexecução reconciliada e o `resumo`.
- **Interface (E2E, `tests/e2e/07-areas.spec.mjs`):** fixture fictícia em `tests/e2e/fixture.mjs`. Cobre:
  - camada sob demanda, legenda (inclusive o aviso sobre áreas vizinhas), atribuição e contorno real de uma área;
  - abertura de uma célula com duas áreas: exatamente duas requisições de contorno, uma por `areas[].chave`, sem repetir ao reabrir a célula; evidência agregada sem duplicação (R1-6);
  - lente nas três classes, lista paginada, retângulos e painel com motivo por área, ressalvas e evidência;
  - estados de T24, inclusive a carga sem camada;
  - concorrência com outra lente e com "Nenhuma";
  - perda de acesso, sessão expirada e versão substituída, limpando camada, lente e memória. Inclui a revogação da autorização entre as páginas de vínculos, com a carga ainda vigente: o resultado é `acesso_negado`, nunca `versao_substituida` (R2-3);
  - teclado, foco, 360/390 px com toque, 200% e reflow a 320 px.
- **Medição:** `npm run medir:lentes` estendido com as três classes e `npm run medir:interface` com a camada e o maior contorno real, pela regra da seção "Orçamento".
- **Gates por PR:** `test:governance`, `check:governance`, `typecheck`, `build`, `test:interface` (com os casos dos ciclos `004` e `005` sem mudança), `test:prototipo`, `test:rls`, `test:e2e`, `git diff --check` e `tests/unit/bundle.test.mjs`. Conferências e medições usam dados de `local/` e rodam só localmente, com resultado no relatório. Todo script com dados reais começa por `supabase db reset` e falha se a identidade do fim diferir da do início.

## Itens de implementação

### Item 1 — Fontes, leitura e pertencimento na carga local

**Contexto:** é a base de G1 e o primeiro ponto de parada (volume). O merge não muda o banco nem a interface: só a CLI local.

**Ação técnica:**

- Acrescentar os dois itens a `obter.mjs` e `fontes.json`, com o nome de cliente e a parada em erro HTTP (T15).
- Criar `scripts/prototipo/shapefile.mjs` (T16) e `scripts/prototipo/areas.mjs`, com classes e exclusões (T17), pertencimento (T18), áreas guardadas (T19) e simplificação (T20).
- Integrar em `processar` as saídas `areas.json`, `deteccoes_areas.csv` e `areas_excluidas.json`, e o relatório com as contagens, as paradas e a estimativa de volume.
- Escrever os casos AP-1 a AP-23 em `scripts/prototipo/*.test.mjs`, com os shapefiles gerados na memória.
- Criar `scripts/areas/conferir.mjs` e o script `conferir:areas`, sem dependência nova.
- Registrar a conferência em `006_research_conferencia_areas.md` e criar a KB-006 (template `.agent/templates/kb.md` lido no ponto de uso).

**Critérios de aceite:**

- [ ] As duas fontes são obtidas com URL, data, bytes, SHA-256 e condições de uso. A obtenção para em 403, ZIP incompleto ou hash divergente. O retrato nacional da FUNAI só é promovido depois de validado, e os membros declarados do ZIP são os únicos lidos.
- [ ] Os casos AP-1 a AP-23 passam, com valores escritos à mão (AP-23 na função de decomposição da conferência).
- [ ] A conferência reproduz exatamente a exploração no retrato da ideação (etapa 1) e coincide com o pipeline, detecção a detecção, no retrato da carga (etapa 2), com a diferença da terra indígena explicada pelas quatro parcelas.
- [ ] A estimativa de volume fica dentro dos tetos; senão, a situação é "Parado" antes da PR, com as alternativas.
- [ ] Os gates passam; nenhuma dependência nova, migração ou mudança de interface.

### Item 2 — Tabelas, acesso e carga com áreas

**Contexto:** é o núcleo de G2 e G4 e o segundo ponto de parada (volume real no banco). O merge não muda a interface. Depois dele vem a ação humana externa.

**Ação técnica:**

- Escrever a migração nova (T21): tabelas, gatilhos, RLS, políticas, grants, colunas de totais, listas fechadas e protocolo da publicação.
- Atualizar os testes pgTAP e da API.
- Estender `manifesto.mjs` (fontes, saídas, método `areas-006-v1` e totais) e `carga.mjs` (inserção das duas tabelas na mesma transação e `resumo` com áreas e vínculos por classe).
- Medir o volume com `medir:carga`.
- Escrever o ADR-008 (template `.agent/templates/adr.md` lido no ponto de uso).
- Atualizar o runbook (seções 2, 8 e 11) e preparar na task o roteiro da ação externa.

**Critérios de aceite:**

- [ ] A migração é nova e aditiva; G4 passa na CI.
- [ ] A matriz AN/RP/OA/EX das tabelas novas está provada por pgTAP e pela API, com `auditar_exposicao()` vazia e `conferir_papel_executor` sem erro.
- [ ] A carga real local publica com identidade nova, reexecução reconciliada e `resumo` coerente com o relatório do item 1.
- [ ] Os casos de nulidade, de vínculo ao envelope e de expiração passam, e o rollback por `--sem-areas` está demonstrado com os insumos preservados.
- [ ] O acréscimo medido ao banco é ≤ 10 MB; senão, "Parado" antes da PR.
- [ ] O roteiro da ação externa está pronto na task e só é executado pelo responsável.
- [ ] Os gates passam; nenhuma RPC, view ou mudança de interface.

### Item 3 — Lente de sobreposição e conferência independente

**Contexto:** a regra de seleção de G1, revisável sem interface. O merge implanta código ainda não usado pela interface.

**Ação técnica:**

- Criar `src/lentes/carregar-areas.ts` (T25) e `src/lentes/sobreposicao.ts` (T22 e T23), sem alterar `TipoLente`, `VERSAO_METODO` nem a combinação.
- Escrever a fixture e os casos SB-1 a SB-16 em `tests/unit/sobreposicao.test.mjs`.
- Criar `scripts/lentes/conferir-sobreposicao.mjs`, reaproveitando `carga-real.mjs`, e o script `conferir:sobreposicao`.
- Registrar a conferência no relatório do ciclo e acrescentar à KB-005 a seção "Sobreposição".

**Critérios de aceite:**

- [ ] `ResultadoSobreposicao` e `sobreposicao-006-v1` estão definidos e documentados; nenhum tipo ou resultado de C1, das três lentes ou da combinação mudou.
- [ ] O leitor de T25 está implementado, e os casos SB-1 a SB-16 passam, com SB-15 e a revogação entre páginas também pela API local, terminando em `acesso_negado` (R3-1).
- [ ] A conferência por SQL coincide com o módulo, célula a célula, e o número de células de cada classe é igual ao da etapa 2 da conferência do item 1, na mesma identidade. As 37 e 74 células de UC da exploração são referências; uma diferença é explicada pela etapa 2 (R3-2).
- [ ] Os gates passam.

### Item 4 — Camada no mapa, interface da lente, medição e roteiro

**Contexto:** expõe a camada e a lente. É a última entrega técnica; seu merge depende da ação externa concluída, porque o deploy lê as tabelas novas.

**Ação técnica:**

- Integrar em `src/app.ts`: a camada sob demanda, o contorno real, a opção da lente com a classe e `geracaoLente`.
- Leitura das áreas em `src/consulta.ts`.
- Camada e legenda em `src/mapa.ts`.
- Apresentação em `src/apresentacao-areas.ts`, com atribuição em `renderProveniencia`, mais `index.html` e os estilos existentes.
- Escrever o E2E e estender `medir:lentes` e `medir:interface`.
- Registrar a medição; atualizar o runbook (seção 10), a KB-005 e a KB-006; preparar na task o roteiro de verificação em produção com os valores locais esperados.

**Critérios de aceite:**

- [ ] A camada abre só por pedido, mostra as três classes com legenda em texto e atribuição, e o contorno real de uma área baixa só aquela área.
- [ ] A lente mostra a classe escolhida, a lista paginada, as células no mapa e o painel com motivo por área, evidência, ressalvas, cobertura, limitações e aviso de domínio.
- [ ] Nenhum texto, ordem ou número sugere ranking, gravidade, infração ou situação fundiária, e nenhum texto sugere responsabilização de comunidades.
- [ ] Os estados de T24 são distintos e testados no E2E.
- [ ] A visão geral fica ≤ 0,6 MB brutos, e a aplicação da lente fica no orçamento nas três classes; senão, "Parado" antes da PR, com as alternativas. A abertura de célula e o maior contorno ficam registrados.
- [ ] A acessibilidade do ADR-007 é mantida.
- [ ] O roteiro de verificação em produção está pronto na task.
- [ ] Os gates passam.

## Arquivos afetados

- **Nesta redação:** este plano; a ideação (registro da autorização do rascunho, do novo artefato ativo e do handoff); a linha do ciclo `006` em `_project/cycles.md`.
- **Item 1:** `scripts/prototipo/obter.mjs`, `fontes.json`, `processar.mjs`, `prototipo.mjs` (se o modo precisar), `shapefile.mjs`, `areas.mjs` e seus testes; `scripts/areas/conferir.mjs`; `package.json` (scripts, sem dependência); KB-006; `006_research_conferencia_areas.md`.
- **Item 2:** `supabase/migrations/<novo>_areas_protegidas.sql`; `supabase/tests/01` a `05` e um arquivo novo para as áreas; `scripts/banco/manifesto.mjs`, `carga.mjs`, `medir-carga.mjs`, `reconstruir.mjs` (se preciso) e seus testes; ADR-008; `docs/runbook.md`.
- **Item 3:** `src/lentes/sobreposicao.ts`; `src/lentes/carregar-areas.ts`; `scripts/banco/api.test.mjs` (SB-15 pela API); `tests/unit/sobreposicao.test.mjs`; `tests/fixtures/lentes/sobreposicao.json`; `scripts/lentes/conferir-sobreposicao.mjs`; `package.json`; KB-005; relatório do ciclo.
- **Item 4:** `src/app.ts`, `src/consulta.ts`, `src/mapa.ts`, `src/apresentacao.ts`, `src/apresentacao-areas.ts`, `index.html`, `src/estilos/*.css` (só componentes novos); `tests/e2e/07-areas.spec.mjs` e `fixture.mjs`; `scripts/interface/medir-lentes.mjs` e `medir-geometria.mjs`; `docs/runbook.md`; KB-005, KB-006.
- **No encerramento:** KB-003, README se cabível e o registro do ciclo.
- **Nunca:** migrações existentes, dados reais ou arquivos de `local/` no Git, a combinação (`combinacao.ts`) e as três lentes, salvo exportação estritamente necessária.

## Decomposição em issues e PRs

| Unidade planejada | Issue | Dependência | PR / fechamento |
| :-- | :-- | :-- | :-- |
| Plano completo | Sem issue documental | Revisão e aprovação do plano | `chore/cycle-006-plan`; inclui ideação, plano e registro do ciclo; merge próprio |
| Item 1 | A criar: "[FEATURE] Fontes de áreas protegidas e pertencimento na carga local" | Plano integrado e payload confirmado | `feature/issue-N`; uma PR |
| Item 2 | A criar: "[FEATURE] Tabelas de áreas protegidas, acesso e carga" | Item 1 integrado | `feature/issue-N`; uma PR; depois, ação humana externa |
| Item 3 | A criar: "[FEATURE] Lente de sobreposição com áreas protegidas" | Item 2 integrado e ação externa concluída | `feature/issue-N`; uma PR |
| Item 4 | A criar: "[FEATURE] Camada de áreas protegidas e interface da lente" | Item 3 integrado | `feature/issue-N`; uma PR; depois, verificação em produção |
| Encerramento | Sem issue | Itens integrados e verificação em produção decidida | `chore/cycle-006-closure`; encerramento prospectivo; merge próprio |

O item 3 poderia vir antes da ação externa, porque não muda a interface. O plano o põe depois para que a conferência local e a hospedada usem a mesma identidade de carga, e para que nenhum código que lê as tabelas novas chegue a `main` antes de elas existirem no banco hospedado.

## Dependências e blockers

- **Para aprovar o plano:** veredito apto em revisão formal; ratificação de T15 a T25, dos casos, dos textos, do orçamento e do fatiamento.
- **Para publicar a PR documental:** commit da ideação, do plano e do registro do ciclo em `chore/cycle-006-plan`, coberto pela aprovação do plano. Hoje nada está commitado.
- **Para os itens 1 a 4:** os arquivos em `local/areas-protegidas/` e a carga real em `local/dados-prototipo/`; Supabase local com Docker. Um novo download da FUNAI (sem filtro, T15) é feito no item 1, sob a autorização do item.
- **Para a ação externa:** acesso do responsável ao projeto Supabase hospedado e à senha do EX, fora do agente.
- **Para o retorno ao BL-002:** encerramento integrado em `main`; registro e publicação por `gerenciar_backlog`, com autorização própria para publicar.

## Riscos, suposições e rollback

| Risco ou hipótese | Tratamento |
| :-- | :-- |
| "Dentro de área protegida" lido como prova, infração ou prioridade; texto que sugira responsabilização de comunidades indígenas | Limitações de T23, aviso de domínio, sem ordem por classe ou contagem, uma classe por aplicação; revisão de textos na PR do item 4 |
| Terra indígena domina o resultado (89% das detecções em áreas) | Classes separadas (E1); a lente de cada classe é aplicada à parte |
| Codificação, sistema de referência ou geometria que enganam em silêncio | Codificação fixada e validada, `.prj` conferido e anéis validados, com parada (T16; AP-11 a AP-15) |
| WFS da FUNAI muda ou recusa o cliente | Retrato pelo hash; 403 é parada; download novo é fonte nova e identidade nova |
| Licença da FUNAI (página × rodapé) | Risco aceito pelo responsável (P3), registrado na condição de uso exibida; sem parecer jurídico |
| Volume acima do teto | Paradas no item 1 (estimativa), no item 2 (banco) e no item 4 (resposta), com alternativas |
| Lente fora do orçamento por causa da cobertura | Medição por classe e parada com alternativas; desfecho plausível |
| Conferência contaminada pelo pipeline | Algoritmo diferente (número de voltas) sobre anéis crus no item 1; SQL à parte no item 3 |
| Mudança acidental nas lentes ou na combinação | `TipoLente` e `combinacao.ts` intocados; SB-13; casos dos ciclos `004` e `005` sem alteração |
| Listas fechadas do banco esquecidas | Atualização explícita em T21; `auditar_exposicao()` vazia como critério |
| Deploy antes das tabelas hospedadas | Item 4 só integra depois da ação externa concluída; item 3 também |
| Shapefile real no Git (não há regra de `.shp`) | Arquivos só em `local/`; testes geram bytes fictícios; revisão do diff |
| Interseção com MT pela regra de T19 omite áreas vizinhas sem detecção | Limitação declarada no texto e na legenda; não afeta a classificação; comparação de rótulo por termo exato (AP-19) |
| Leitura parcial das tabelas tratada como completa (limite de 1.000 linhas) | T25: total declarado na carga, contagem exata, unicidade e releitura da carga; SB-15 e SB-16 |
| Retrato da FUNAI não reproduzível (serviço vivo) | T15: promoção depois da validação, arquivo local como fonte, parada em hash divergente, cópia local no runbook; AP-21 |
| Geometria de exibição inválida depois de simplificar ou arredondar | T20: validade conferida na geometria final, tolerância reduzida por polígono, 5 casas como último recurso e parada; AP-17 e AP-18 |
| Carga publicada com camada incoerente (totais parciais, vínculo ao envelope) | T21: `check` dos totais, conferência na publicação e testes de R1-5 |

**Rollback:** reverter em ordem inversa, cada reversão por PR com aprovação de merge.

- **Item 4:** reversão do commit; retira a camada e a lente da interface.
- **Item 3:** reversão do commit; retira o módulo.
- **Item 2:** as migrações não são revertidas (G4). Retirar o uso exige migração nova que remova as tabelas, decidida em ciclo próprio. A carga com áreas pode ser substituída por nova `revisao` sem áreas (totais nulos), com novo manifesto aprovado, pelo runbook.
- **Item 1:** reversão do commit; a carga local volta ao formato anterior.

Uma reversão não reabre nem arquiva o BL-002 automaticamente; o efeito é relatado e decidido pelo responsável.

## Sequência recomendada

1. Revisar formalmente este rascunho e corrigir mediante autorização; obter "aprovo o plano do ciclo 006" depois de veredito apto.
2. Commitar e publicar a PR documental (`chore/cycle-006-plan`); merge aprovado. Apresentar os quatro payloads, confirmar e criar as issues.
3. Item 1: autorizar, implementar, conferir, medir a estimativa (parar se exceder), PR e merge.
4. Item 2: autorizar, implementar, medir no banco (parar se exceder), PR e merge. Ação humana externa: migração e carga hospedadas; "concluí a ação externa da issue #N".
5. Item 3: autorizar, implementar, conferir, PR e merge.
6. Item 4: autorizar, implementar, medir (parar se exceder), PR com o roteiro pronto e merge (deploy).
7. "Autorizo a verificação em produção do ciclo 006": roteiro do responsável e conferência do agente.
8. Encerramento prospectivo em `chore/cycle-006-closure`. Depois da integração, retorno ao BL-002 pela fila, com publicação autorizada à parte.

## Referências

- `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, `.agent/workflows/rascunhar_plano.md`, `.agent/templates/plano_implementacao.md`, lidos no ponto de uso em 2026-11-12.
- Ideação `006` (decisões, download e medição exploratória); `_project/backlog.md` (BL-002) em `83e3a58`.
- Plano `005` v2 (modelo de casos, conferência, orçamento e verificação); KB-001, KB-003, KB-004, KB-005; ADR-002, ADR-003, ADR-005, ADR-006, ADR-007; `docs/runbook.md` (seções 2, 8, 10 e 11).
- Código lido em 2026-11-12: `scripts/prototipo/obter.mjs`, `fontes.json`, `processar.mjs`, `territorio.mjs`; `scripts/prova-dados/geo.mjs`; `scripts/banco/manifesto.mjs`, `carga.mjs`; `supabase/migrations/*.sql` e `supabase/tests/01_estrutura.test.sql`; `src/lentes/contrato.ts`, `combinacao.ts`, `carregar.ts`; `src/consulta.ts`, `src/mapa.ts`, `src/app.ts`, `src/apresentacao.ts`; `tests/unit/bundle.test.mjs`; `package.json`; `.gitignore`.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | — |
| PR(s) | PR documental [#48](https://github.com/EuThiagoAndrade/rastro-quente/pull/48), aberta em 2026-11-12, aguardando checks e merge |
| Branch(es) | Ideação: `chore/cycle-006-ideation`, sem commits próprios; plano: `chore/cycle-006-plan`, publicada, base `83e3a58624b0d6e02ec079541b9e2b8e6f8772a7`, com a ideação, o plano e o registro do ciclo |
| Destino após conclusão | `_project/executed/006_areas_protegidas_reais/006_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 006 (completo)
Quem: Responsável
Conferir: Checks e diff da PR documental #48
Diga: "aprovo o merge da PR #48"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + atualizar_docs + aprovacao_publicacao_plano + v3@83e3a58+rodada-3`
- `effect_class`: `remote_mutation`
- `state_before`: plano `v3` em `Em Revisão`, revisão formal `Concluída`, veredito `APTO COM RESSALVAS` (rodada 3), aprovação `Pendente`, situação `Aguardando aprovação do plano`. Branch `chore/cycle-006-plan` local em `83e3a58`, sem commits próprios; ideação, plano e registro do ciclo não commitados. Nenhuma branch remota, PR ou issue do ciclo.
- `state_after`: plano `v3` `Aprovado` (`Aprovada em 2026-11-12`) por manifestação posterior ao parecer, com R3-1 e R3-2 incorporadas aos itens 3 e 4. Lote documental publicado na PR #48, de `chore/cycle-006-plan` para `main`, aguardando checks e merge. Ciclo em `Planejamento`; nenhuma issue ou implementação.
- `result`: `executed`
- `evidence`:
  - manifestação humana literal "aprovo o plano do ciclo 006" em 2026-11-12, posterior à rodada 3;
  - `git fetch`, `git ls-remote` e `gh pr list` conferiram `origin/main` em `83e3a58` e a ausência de branch remota, PR ou issue aberta do ciclo antes de publicar;
  - PR real https://github.com/EuThiagoAndrade/rastro-quente/pull/48;
  - lote limitado a ideação, plano e registro do ciclo; 55 testes de governança aprovados, validador sem erros ou avisos, `git diff --check` sem erros e varredura G3 sem e-mail ou UUID.
- `blockers`: nenhum para a publicação. A integração depende de checks verdes e de "aprovo o merge da PR #48". As issues dependem da integração documental e da confirmação dos payloads; nenhuma implementação está autorizada.

### Registro anterior — revisão da rodada 3

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + revisar_plano + 006_plan/rodada-3 + v3@83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v3` em `Em Revisão`, revisão formal em andamento, veredito anterior `REQUER NOVA RODADA`, aprovação pendente, ciclo em `Planejamento`, situação `Aguardando revisão (rodada 3)`.
- `state_after`: plano local `v3` em `Em Revisão`, rodada 3 concluída com `APTO COM RESSALVAS`, aprovação pendente, ciclo em `Planejamento`, situação `Aguardando aprovação do plano`.
- `result`: `executed`
- `evidence`: [parecer da rodada 3](#rodada-3), cabeçalho e bloco `Próximo passo`. Conferência numérica das fixtures fictícias AP-16, AP-18 e AP-23. O GitHub MCP Docker retornou HTTP 401. `gh` retornou listas vazias de PRs e issues abertas, e `git ls-remote` confirmou `main` em `83e3a58` e a ausência da branch remota do plano.
- `blockers`: nenhum para submeter o plano à aprovação. Aprovação humana pendente, com as ressalvas R3-1 e R3-2 apresentadas ao responsável.

### Registro anterior — correção da rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + rascunhar_plano + 006_plan + v3@83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: plano `v2` em `Em Revisão`, veredito `REQUER NOVA RODADA` da rodada 2 (R2-1 a R2-4 bloqueadores; R2-5 a R2-7 ressalvas), situação `Aguardando correções (rodada 2)`; ciclo `006` em `Planejamento`; branch local `chore/cycle-006-plan` em `83e3a58`, nada commitado.
- `state_after`: plano `v3` em `Em Revisão`, revisão formal `Em andamento`, com resposta a R2-1 a R2-7 e as rodadas 1 e 2 preservadas; caso AP-23 novo; situação `Aguardando revisão (rodada 3)`; linha do ciclo em `_project/cycles.md` atualizada (R2-7). Nada commitado ou publicado.
- `result`: `executed`
- `evidence`: frase "corrija o plano do ciclo 006", em 2026-11-12; "Resposta do autor à rodada 2 — v3"; simulação local, fora do repositório, do Douglas-Peucker de anel fechado de T20 nas fixtures AP-16 e AP-18 (buraco de AP-16 reduzido a 3 posições; AP-18 inválido a 0,001° e válido a 0,0005°, com desvio de 0,000267°); inspeção somente leitura de `src/consulta.ts` (`sondarAcesso`, `lerCargaVigente`) e da política `rp_le_cargas_publicadas`; validador de governança na resposta da sessão.
- `blockers`: nenhum para a redação; rodada 3 pendente.

### Registro anterior — revisão da rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + revisar_plano + 006_plan/rodada-2 + v2@83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v2` em `Em Revisão`, revisão formal em andamento, veredito anterior `REQUER NOVA RODADA`, aprovação pendente, ciclo em `Planejamento`, situação `Aguardando revisão (rodada 2)`.
- `state_after`: plano local `v2` em `Em Revisão`, rodada 2 concluída com `REQUER NOVA RODADA`, aprovação pendente, ciclo em `Planejamento`, situação `Aguardando correções (rodada 2)`.
- `result`: `executed`
- `evidence`: [parecer da rodada 2](#rodada-2), cabeçalho e bloco `Próximo passo` deste plano. O GitHub MCP Docker retornou HTTP 401. `gh` retornou listas vazias de PRs e issues abertas. `git ls-remote` confirmou `main` em `83e3a58` e a ausência da branch remota do plano.
- `blockers`: R2-1 a R2-4 para obter um veredito apto.

### Registro anterior — correção da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + rascunhar_plano + 006_plan + v2@83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: plano `v1` em `Em Revisão`, veredito `REQUER NOVA RODADA` da rodada 1 (R1-1 a R1-6 bloqueadores; R1-7 a R1-9 ressalvas), situação `Aguardando correções (rodada 1)`; ciclo `006` em `Planejamento`; branch local `chore/cycle-006-plan` em `83e3a58`, nada commitado.
- `state_after`: plano `v2` em `Em Revisão`, revisão formal `Em andamento`, com resposta a R1-1 a R1-9 e a rodada 1 preservada; T25 novo; situação `Aguardando revisão (rodada 2)`; linha do ciclo em `_project/cycles.md` atualizada (R1-9). Nada commitado ou publicado.
- `result`: `executed`
- `evidence`: frase "corrija o plano do ciclo 006", em 2026-11-12; "Resposta do autor à rodada 1 — v2"; inspeção somente leitura de `supabase/config.toml` (`max_rows`), `supabase/migrations/20261107210000_esquema_dados.sql` (chave de `deteccoes`), `supabase/migrations/20261107230000_correcoes_revisao_g2.sql` (comparação com o manifesto e contagens da publicação), `scripts/banco/carga.mjs` (`expirar`), `scripts/prototipo/obter.mjs` (`garantirItem`), `src/lentes/contrato.ts` (`Destaque`) e `src/lentes/carregar.ts` (`AcumuladorPaginas`); conta de arredondamento das fixtures AP-17 e AP-18 no Node; validador de governança na resposta da sessão.
- `blockers`: nenhum para a redação; rodada 2 pendente.

### Registro anterior — revisão da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + revisar_plano + 006_plan/rodada-1 + v1@83e3a58`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v1` em `Rascunho`, revisão e aprovação pendentes, ciclo em `Planejamento`, situação `Aguardando revisão (rodada 1)`.
- `state_after`: plano local `v1` em `Em Revisão`, revisão da rodada 1 concluída com `REQUER NOVA RODADA`, aprovação pendente, ciclo em `Planejamento`, situação `Aguardando correções (rodada 1)`.
- `result`: `executed`
- `evidence`: [parecer da rodada 1](#rodada-1), cabeçalho e bloco `Próximo passo` deste plano. O GitHub MCP Docker retornou HTTP 401. As consultas de leitura via `gh` retornaram listas vazias de PRs e issues abertas, e `git ls-remote` confirmou `main` em `83e3a58` e a ausência da branch remota do plano.
- `blockers`: R1-1 a R1-6 para obter um veredito apto.

### Registro anterior — redação do plano

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + rascunhar_plano + 006_plan + v1@83e3a58`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: antes, ideação `006` com todas as decisões registradas, ciclo `006` em `Ideação`, sem plano, nada commitado, branch `chore/cycle-006-ideation`. Depois, autorização do rascunho registrada na ideação; plano `v1` em `Rascunho`; ciclo `006` em `Planejamento`; branch local `chore/cycle-006-plan` com as mesmas alterações, ainda não commitadas. Nenhuma publicação, issue ou PR.
- `result`: `executed`
- `evidence`: frase "autorizo o rascunho do plano do ciclo 006", em 2026-11-12; este arquivo; linha do ciclo `006` em `_project/cycles.md`; `gh pr list` e `gh issue list` vazios em 2026-11-12; validador de governança na resposta da sessão.
- `blockers`: nenhum para a redação; revisão formal pendente.

## Revisão crítica

### Rodada 1

- **Data:** 2026-11-12
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v1`, sem commit próprio, sobre `83e3a58624b0d6e02ec079541b9e2b8e6f8772a7`.

#### Achados bloqueadores

- **R1-1 — Completude da leitura de áreas e vínculos (G1).** T21, T22 e T24 usam leitura direta da API. O orçamento prevê cerca de 2.800 vínculos, e a API local limita cada resposta a 1.000 linhas. A validação de vínculos órfãos de SB-11 aceita um subconjunto cujas linhas sejam todas válidas. Especifique paginação com ordem estável, conferência de contagens e unicidade no recorte lido, carga fixada durante a leitura e tratamento de página truncada ou versão substituída. Aplique o mesmo contrato à visão geral quando exceder uma página. Inclua um caso pela API com mais de 1.000 vínculos e uma célula cuja única evidência esteja numa página posterior. [Configuração da API](../../../supabase/config.toml#L15) · [Carregador de lentes](../../../src/lentes/carregar.ts#L56) · [Documentação do Supabase](https://supabase.com/docs/reference/javascript/v1/select).
- **R1-2 — A referência de 750 células de TI pertence ao retrato filtrado (G1).** T15 troca a amostra filtrada por UF pela camada nacional. O item 1 admite terras vizinhas que acrescentem detecções, mas o item 3 fixa “até 750” células na carga nova. Se nenhuma das 750 células perder seu último vínculo elegível e uma terra vizinha acrescentar uma célula, 751 é um resultado compatível com S1. Distinga a reprodução exploratória no retrato original da comparação independente no mesmo retrato nacional usado pela carga. Defina como registrar os efeitos da exclusão de terras em estudo e da inclusão de áreas de outras UFs, sem um teto de células herdado da amostra. [Medição exploratória na ideação](../../ideations/006_areas_protegidas_reais.md#download-e-medição-exploratória-p1-autorizada-em-2026-11-12).
- **R1-3 — Simplificação e arredondamento precisam de um critério de validade (G1).** T20 promete preservar áreas e buracos pelo número de posições do anel. Quatro posições podem arredondar para o mesmo ponto, inclusive no fallback, e a simplificação independente pode deslocar a borda externa até cruzar um buraco. Defina validação da geometria final nas duas precisões, tratamento quando a geometria não puder ser preservada e como a tolerância de AP-16 será medida após arredondar. Acrescente casos de anel colapsado e de buraco que toca ou cruza o exterior, com o pertencimento verificado no polígono integral. [GeoJSON, RFC 7946 §3.1.6](https://www.rfc-editor.org/rfc/rfc7946.html#section-3.1.6).
- **R1-4 — O retrato aprovado precisa ser reproduzível (G1).** O WFS nacional da FUNAI é mutável. O comportamento atual de `garantirItem` rejeita outro hash quando a fonte está fixada. T15 prevê uma nova identidade após novo download, mas não define a promoção explícita de um retrato novo nem a retenção e reutilização do ZIP exato para reconstruir ou publicar a mesma identidade em outro ambiente. Defina a aquisição inicial, validação do retrato, fixação do hash completo e reutilização do arquivo fora do Git. Para o CNUC, fixe também o membro de polígonos e o par `.dbf`/`.prj` correspondente, porque o ZIP contém outro shapefile de pontos. Teste um ZIP misto e a reexecução após mudança na resposta do WFS. [Obtenção atual](../../../scripts/prototipo/obter.mjs#L123) · [Runbook, retenção de insumos](../../../docs/runbook.md#4-cópia-local) · [Portal de dados do MMA](https://dados.mma.gov.br/dataset/unidadesdeconservacao) · [Camada nacional da FUNAI](https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas).
- **R1-5 — Fechar o contrato de publicação e recuperação (G1/G2).** T21 só manda conferir totais não nulos. Falta definir se os dois totais devem vir juntos, como ambos correspondem ao manifesto aprovado e como a publicação rejeita filhos quando a camada está ausente. A FK da detecção valida carga e ID, mas aceita uma detecção do envelope da mesma carga. Defina e teste os casos de nulidade parcial, totais nulos com filhos e vínculo ao envelope. Inclua a expiração das novas tabelas no item 2. A CLI percorre uma lista fixa, então uma implementação por cascata precisa ser compatível com gatilhos, contagem do `--simular` e remoção de cargas retiradas. O roteiro de rollback também precisa demonstrar a publicação do conteúdo anterior, com totais nulos e uma nova revisão, usando os insumos preservados. [Gatilho de publicação](../../../supabase/migrations/20261107230000_correcoes_revisao_g2.sql#L44) · [Chave de detecções](../../../supabase/migrations/20261107210000_esquema_dados.sql#L84) · [Expiração](../../../scripts/banco/carga.mjs#L265) · [ADR-006](../../decisions/ADR-006_carga_idempotente_unica_transacao.md).
- **R1-6 — O resultado precisa carregar a relação entre célula e área.** T22 preserva `TipoLente`, cujo tipo não admite `sobreposicao`, e descreve `ResultadoSobreposicao` como os campos de C1 com `classe` e uma lista geral de áreas. `Destaque` só tem motivo textual, evidência agregada e ressalvas. T24 precisa saber quais áreas pertencem à célula aberta para baixar os respectivos contornos. Especifique o discriminante da sobreposição e a associação estruturada por destaque, com chaves inequívocas e dados suficientes para motivo e ressalvas por área. Faça SB-5 e o E2E conferirem a evidência agregada sem duplicação e os contornos pedidos para a célula selecionada. [Contrato C1](../../../src/lentes/contrato.ts#L65).

#### Ressalvas

- **R1-7 — Rótulo de UF e limitação da camada.** T19 precisa explicitar a comparação por UF em rótulos compostos, incluindo a distinção entre Mato Grosso e Mato Grosso do Sul. Acrescente ao texto visível de T23/T24 a omissão de áreas vizinhas sem detecção quando o rótulo não cita MT. AP-8 só cobre uma UC com vínculo. Um caso de TI com rótulo de outra UF exercitaria o motivo da mudança de fonte em T15.
- **R1-8 — Definir quais bytes entram no aceite.** T24 prevê baixar automaticamente os contornos reais citados ao abrir uma célula. O orçamento mede a aplicação da lente e o maior contorno isolado. Declare se a abertura da célula entra na mesma medição e cubra uma célula com várias áreas. Para a visão geral em produção, explicite como o responsável mede bytes brutos e soma respostas paginadas. Com cache desligado, os bytes transferidos ainda podem estar comprimidos.
- **R1-9 — Sincronizar o resumo do ciclo na próxima versão.** O registro descreve `v1 em rascunho`. A atualização cabe ao autor junto da próxima versão e da situação de revisão. [Registro de ciclos](../../cycles.md).

#### Itens atendidos

- O escopo preserva Q1 a Q10 e mantém a lente isolada da combinação. A evidência é a detecção principal com vínculo na classe selecionada, com borda incluída e sem ordenação por gravidade. A fixture AP-1 a AP-10 permite conferir buraco, borda, área dupla, exclusões e seleção por vínculo com resultados escritos antes do código.
- As duas fontes e as condições de uso estão identificadas. A divergência entre a página da FUNAI e o rodapé permanece registrada como risco aceito pelo responsável em P3. O plano limita os atributos, exclui os arquivos reais do Git e prevê atribuição no mapa e na proveniência. [Portal de dados do MMA](https://dados.mma.gov.br/dataset/unidadesdeconservacao) · [Página de geoprocessamento da FUNAI](https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas).
- As quatro entregas têm dependências e pontos de aprovação explícitos. O plano prevê uma migração aditiva, testes por papel, parada por volume, ação externa pelo responsável e verificação hospedada por identidade integral.

**Veredito:** `REQUER NOVA RODADA`. Responder a R1-1 a R1-9 na próxima versão e submeter o plano corrigido à revisão formal.

### Resposta do autor à rodada 1 — v2

- **Data:** 2026-11-12
- **Autor:** Claude Code (Opus 5.5)
- **Base:** plano local `v1`, sobre `83e3a58`. Nenhuma decisão humana nova; T15 a T25 continuam propostas a ratificar na aprovação.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R1-1 | **Corrigido.** Contrato de leitura novo (T25): linha da carga lida antes, com `total_areas` e `total_vinculos_area` declarados; paginação de 1.000 com ordem pela chave primária e `count=exact`; conferência por página de total, tamanho, carga e unicidade; releitura da carga para separar `versao_substituida` de `leitura_inconsistente`; nenhum resultado parcial. O conjunto lido precisa ter o total declarado, o que fecha a aceitação de subconjunto válido de SB-11. A visão geral usa o mesmo leitor. Casos SB-15 (1.201 vínculos, evidência única na segunda página, também pela API local) e SB-16 (página curta, total divergente, repetição, outra carga, carga ausente) | T25; T22; T24; SB-15, SB-16; banco; item 3 |
| R1-2 | **Corrigido.** A conferência do item 1 tem duas etapas. A etapa 1 reproduz exatamente a exploração no retrato da ideação, com o ZIP filtrado preservado em `local/` só para isso. A etapa 2 compara pipeline e conferência no retrato nacional da carga, sem teto. A diferença da terra indígena é decomposta em quatro parcelas (em estudo, terras novas, terras alteradas e terras ausentes), que têm de explicá-la exatamente. O item 3 compara com a etapa 2, na mesma identidade. Saiu o "até 750" | Estratégia de testes; item 1; item 3 |
| R1-3 | **Corrigido.** T20 define a validade da geometria final depois do arredondamento, nas duas versões (anéis, autointerseção, buraco estritamente dentro, partes disjuntas). Define também a cadeia de tratamento: tolerância reduzida por polígono, depois só arredondamento, depois 5 casas na visão geral, depois parada; nada some em silêncio. O desvio é medido depois do arredondamento (*t* + 0,00008°). Casos novos: AP-17 (colapso a 4 e a 5 casas) e AP-18 (buraco que a simplificação deixaria fora do exterior, com o pertencimento conferido no polígono integral). AP-16 passou a medir o desvio depois do arredondamento | T20; AP-16 a AP-18 |
| R1-4 | **Corrigido.** T15 define a aquisição (item sem `sha256`), a validação antes da promoção (`.rejeitado` em falha, `fontes.json` intacto), a promoção revisável no commit da PR do item 1, a reprodução pelo ZIP local (parada com `.divergente` se a URL devolver outro conteúdo), a cópia local no runbook e a carga hospedada aplicada dos mesmos arquivos. T16 fixa os membros do ZIP (`cnuc_2025_08.*`, não `_pontos`) e registra o hash de cada membro. Casos AP-20 (ZIP misto) e AP-21 (reexecução com WFS mudado e retrato rejeitado) | T15; T16; AP-20, AP-21 |
| R1-5 | **Corrigido.** T21: `check` de nulidade conjunta dos totais, nas duas tabelas; os totais entram na comparação com o manifesto; totais nulos com filhos são recusados; totais não nulos são conferidos; vínculo ao envelope é recusado na publicação (a chave estrangeira não distingue o escopo). `expirar` apaga as duas tabelas em ordem explícita, com contagem em `--simular`. O rollback por `--sem-areas`, com nova `revisao` e os insumos preservados, está demonstrado no item 2. Testes de cada caso na estratégia | T21; banco; item 2; rollback |
| R1-6 | **Corrigido.** T22 define `lente: 'sobreposicao'` como discriminante, fora de `TipoLente`, e `DestaqueSobreposicao` com `areas[]`: `chave` `<fonte>:<código>`, atributos, detecções da área na célula, `na_borda` e ressalvas. Motivo e ressalvas são montados a partir dessa estrutura, e T24 baixa os contornos por `areas[].chave`. SB-5 confere as listas por área e a união sem repetição; o E2E confere duas requisições de contorno para a célula com duas áreas. Código repetido na fonte é parada (T16, AP-22), para a chave ser inequívoca | T16; T22; T24; SB-5; AP-22; E2E |
| R1-7 | **Corrigido.** T19 define a comparação por termo exato depois de normalizar e dividir, com `MATO GROSSO DO SUL` e `MS` como termos que não citam MT, e parada em termo desconhecido. A limitação de T23 e a legenda de T24 dizem que áreas vizinhas sem detecção não aparecem. A fixture ganhou A9 (TI de `RO` com detecção) e A10 (`MATO GROSSO DO SUL` sem detecção); AP-19 cobre os textos | T19; T23; T24; AP-8, AP-10, AP-19 |
| R1-8 | **Corrigido.** O orçamento separa a aplicação da lente (até o estado completo), com teto, da abertura de célula (contornos das áreas do destaque), medida à parte e sem teto, numa célula de mais áreas e na de mais bytes. Em produção, os bytes brutos são a soma de "resources" do rodapé da aba Network com o filtro `rest/v1/areas`, que é o tamanho descomprimido; "transferred" e `Content-Encoding` são registrados à parte. A soma inclui todas as requisições da leitura | Orçamento; verificação em produção; E2E |
| R1-9 | **Corrigido.** Linha do ciclo em `_project/cycles.md` com "v2 em revisão" | `cycles.md` |

### Rodada 2

- **Data:** 2026-11-12
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v2`, sem commit próprio, sobre `83e3a58624b0d6e02ec079541b9e2b8e6f8772a7`. SHA-256 do arquivo recebido: `be0a1707b5d69564947f67cfbe35097deb3c7cc7e38777e01966488286f60630`.

#### Achados bloqueadores

- **R2-1 — Os resultados de AP-16 e AP-18 não decorrem do Douglas–Peucker descrito em T20 (G1).** A diagonal do buraco de AP-16 mede cerca de 0,000566°, abaixo da tolerância inicial de 0,001°. Para manter esse anel nessa tolerância, o teste depende de uma regra explícita para preservar anéis pequenos. Em AP-18, aplicando Douglas–Peucker ao trecho sul com os extremos descritos, após manter um dos vértices de latitude −10,0008°, o outro fica a aproximadamente 0,000267° do novo segmento e sai com tolerância de 0,0005°. O segmento resultante toca um canto do buraco em latitude −10,0006°, contrariando a exigência de interior estrito. Fixe como os anéis fechados são simplificados e quando as reduções terminam, incluindo a passagem ao arredondamento sem simplificação quando só ele for viável. Alinhe os valores esperados dos dois casos com esse procedimento. [T20](#detalhes-técnicos-propostos-para-ratificação-na-aprovação) · [Douglas–Peucker e validade do resultado](https://postgis.net/docs/ST_Simplify.html).
- **R2-2 — A decomposição entre os retratos precisa considerar a união de vínculos (G1).** A etapa 2 exige que quatro parcelas expliquem exatamente a diferença de detecções e células distintas. Se a única detecção de uma célula estiver em uma terra em estudo e em outra terra ausente no retrato nacional, retirar cada terra isoladamente dá zero perdas em ambos os cálculos, enquanto retirar as duas dá perda de uma detecção e uma célula. Fixe uma regra reproduzível para atribuir mudanças sobrepostas, com exemplo esperado para detecção e célula que perdem o último vínculo. A comparação entre pipeline e conferência no mesmo retrato já está definida. [Estratégia de testes](#estratégia-de-testes).
- **R2-3 — A linha de carga vazia não distingue perda de acesso de substituição (G2).** T25 manda interpretar carga ausente como `versao_substituida`, tanto na leitura inicial quanto depois de uma página inconsistente. Se o responsável perder a autorização durante a sessão, a RLS também oculta a linha da carga. A camada pode então anunciar troca de versão e aplicar o tratamento errado, embora T24 exija estados distintos e limpeza de memória. Especifique como o leitor distingue ausência de publicação, perda de acesso e substituição, reaproveitando a sondagem já existente, e cubra a perda de autorização entre páginas com a carga ainda vigente. [Política de leitura da carga](../../../supabase/migrations/20261107210100_autorizacao_acesso.sql#L194) · [Sondagem de acesso](../../../src/consulta.ts#L34).
- **R2-4 — A fixture AP-8 usa um rótulo que T19 manda rejeitar (G1).** A7 vem com `uf` igual a `ESTADO FICTÍCIO`. T19 só aceita termos das 27 UFs e manda parar diante de termo desconhecido. Com essa fixture, AP-8 não pode guardar A7 por vínculo e AP-10 não pode produzir os totais previstos. Use uma UF válida diferente de MT em A7 e mantenha a rejeição de termo desconhecido no caso específico AP-19. [Fixture e casos AP](#estratégia-de-testes).

#### Ressalvas

- **R2-5 — Alinhar a estrutura e o texto do motivo.** A relação por área de T22 resolve a seleção dos contornos, mas sua lista de atributos não inclui `esfera`, exigida pelo motivo de UC em T23 e SB-1. Inclua o campo na estrutura ou indique de onde vem ao montar o texto.
- **R2-6 — Unificar as expectativas de AP-14 e AP-21.** AP-14 diz que nenhum arquivo é guardado em erro, enquanto T15 e AP-21 preservam os artefatos `.rejeitado` e `.divergente` para diagnóstico. Explicite em AP-14 que nenhum arquivo é promovido e mantenha os resultados distintos para 403, ZIP inválido e hash divergente.
- **R2-7 — Atualizar o resumo do ciclo com a próxima versão.** A redação v2 sincronizou o registro antes da rodada 2. Registre a versão seguinte e a situação correspondente quando o autor publicar a correção local. [Registro de ciclos](../../cycles.md).

#### Itens atendidos

- R1-1 ganhou paginação ordenada, contagem exata, unicidade e um caso de 1.201 vínculos pela API. R2-3 trata especificamente da classificação da falha quando a RLS oculta a carga.
- R1-2 deixou de usar 750 como teto e passou a comparar o pipeline com a conferência no mesmo retrato nacional. R2-2 trata da atribuição das diferenças entre os retratos.
- T15 e T16 fixam os arquivos e membros do ZIP necessários à reprodução. T21 fecha a nulidade conjunta, os vínculos do envelope, a expiração e o rollback. T22 liga cada destaque às suas áreas e a medição distingue a aplicação da lente da abertura de uma célula.
- A sequência de entrega, o escopo de acesso, o uso de fixtures fictícias, a migração aditiva e os pontos de aprovação continuam compatíveis com G1 a G4. Os quatro bloqueadores restantes permitem uma nova rodada com progresso em relação aos seis da primeira.

**Veredito:** `REQUER NOVA RODADA`. Responder a R2-1 a R2-7 na próxima versão e submeter o plano corrigido à revisão formal.

### Resposta do autor à rodada 2 — v3

- **Data:** 2026-11-12
- **Autor:** Claude Code (Opus 5.5)
- **Base:** plano local `v2`, sobre `83e3a58`. Nenhuma decisão humana nova; T15 a T25 continuam propostas a ratificar na aprovação.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R2-1 | **Corrigido.** T20 fixa o Douglas-Peucker de anel fechado: duas cadeias pela primeira posição e pela mais distante; distância ao segmento; desempate pelo menor índice. Fixa também a regra do anel pequeno (menos de 4 posições ou de 3 distintas → posições originais arredondadas) e a sequência que para na primeira geometria válida: 0,001°, 0,0005°, 0,00025°, 0,000125°, só arredondamento, 5 casas e parada. A validade exige que o buraco não toque o exterior. Refiz AP-16 e AP-18 por esse procedimento numa simulação local. O buraco de AP-16 seria reduzido a 3 posições, e o caso passou a exercitar a regra do anel pequeno. Em AP-18, confirmei o toque apontado pelo revisor e desloquei o buraco para −56,952 a −56,948 por −10,0005 a −10,0003: inválido a 0,001° e válido a 0,0005°, com a borda a −10,000693 e −10,000640 sob o buraco e desvio de 0,000267°. d14 foi ajustada para continuar dentro do buraco | T20; AP-16; AP-18 |
| R2-2 | **Corrigido.** A decomposição passou a ser por atribuição sequencial, numa ordem fixa: (a) em estudo, (d) ausentes, (c) alteradas e (b) novas. Cada parcela é a diferença entre estados consecutivos, de modo que a soma é a diferença total por construção. O que perde o último vínculo por mudanças sobrepostas é atribuído ao passo em que esse vínculo desaparece. Além disso, o estado final tem de ser igual à etapa 2, vínculo a vínculo. Caso AP-23 com o exemplo do revisor (x em TE e TG: 0 em (a), −1 detecção e −1 célula em (d)) | Estratégia de testes; AP-23 |
| R2-3 | **Corrigido.** T25 ganhou o diagnóstico da ausência: a linha da carga ausente leva à sondagem existente (`sondarAcesso`). `negado`, `sem_publicacao` e erro de sessão vão ao destino global. Com `autorizado`, a vigente diferente de `p_carga` é `versao_substituida`, e a vigente igual é `leitura_inconsistente`. A perda de acesso entre páginas aparece como página curta e cai no mesmo diagnóstico. SB-16 cobre os quatro resultados; o E2E cobre a revogação entre páginas com a carga vigente | T25; SB-16; E2E |
| R2-4 | **Corrigido.** A7 passou a ter `uf` "PARÁ", UF válida diferente de MT; AP-8 e AP-10 ficam coerentes com T19. A rejeição de termo desconhecido continua só em AP-19 ("MATO GROSSO; XX") | Fixture; AP-8; AP-10 |
| R2-5 | **Corrigido.** A entrada de `areas` em T22 inclui `esfera`, nula na terra indígena | T22 |
| R2-6 | **Corrigido.** AP-14 diz que nenhum arquivo é promovido e separa os três resultados: 403 sem arquivo, ZIP inválido `.rejeitado` e hash divergente `.divergente`, coerentes com T15 e AP-21 | AP-14 |
| R2-7 | **Corrigido.** Linha do ciclo em `_project/cycles.md` com "v3 em revisão" | `cycles.md` |

### Rodada 3

- **Data:** 2026-11-12
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v3`, sem commit próprio, sobre `83e3a58624b0d6e02ec079541b9e2b8e6f8772a7`. SHA-256 do arquivo recebido: `5ee3d27a75b8e9a8ae158137d8dd99d35a37bd6ccd64231e66249e1e6edae75b`.

#### Achados bloqueadores

Nenhum.

#### Ressalvas

- **R3-1 — Exercitar a resposta HTTP real na revogação entre páginas.** Com `count=exact`, o PostgREST pode responder `416` (`PGRST103`) quando o deslocamento da página excede o total visível. Isso pode ocorrer se a segunda página pedir o deslocamento 1.000 depois que a RLS passar a ocultar todos os vínculos. No teste já previsto, use a API local para observar essa resposta e encaminhá-la ao mesmo diagnóstico de T25, com `acesso_negado` e limpeza da interface quando a revogação for confirmada. O estado esperado já está fixado pelo E2E do item 4. [Códigos do PostgREST](https://docs.postgrest.org/en/stable/references/errors.html) · [Nota sobre deslocamento com contagem exata](https://github.com/PostgREST/postgrest/releases/tag/v14.2).
- **R3-2 — Alinhar o aceite do item 3 à conferência por retrato.** A estratégia exige igualdade, célula a célula, com a etapa 2 na mesma identidade e admite diferença explicada em relação às 37 e 74 células de UC da exploração. O checklist do item 3 ainda exige reproduzir 37 e 74 sem essa condição. Use a igualdade com a etapa 2 como aceite e mantenha 37 e 74 como referências da exploração, com explicação de eventual diferença, conforme a estratégia já registrada. [Estratégia de testes](#estratégia-de-testes) · [Item 3](#item-3--lente-de-sobreposição-e-conferência-independente).

#### Itens atendidos

- **R2-1.** T20 agora fixa o corte do anel fechado, a preservação de anéis pequenos e a sequência finita de tolerâncias. Recalculei o colapso do buraco de AP-16 a três posições antes da preservação e a borda sul de AP-18 nas duas tolerâncias. A 0,0005°, a separação vertical mínima entre essa borda e a base do buraco é 0,00014°.
- **R2-2.** A ordem fixa atribui a perda de uma detecção ou célula ao passo em que desaparece o último vínculo. Recalculei as parcelas de AP-23 como 0, −1, −1 e +1. A igualdade do estado final com a etapa 2 é exigida vínculo a vínculo.
- **R2-3.** T25 reaproveita `sondarAcesso` para distinguir autorização, sessão e publicação, com a leitura da vigente para confirmar substituição. SB-16 cobre os diagnósticos e o E2E exige o estado correto na revogação entre páginas. A ressalva R3-1 trata da forma da resposta HTTP nesse caso. [Sondagem existente](../../../src/consulta.ts#L34).
- **R2-4 a R2-7.** A7 usa `PARÁ`, a estrutura por área carrega `esfera`, AP-14 distingue os três resultados da obtenção e o registro de ciclos aponta para a v3.
- O escopo, a sequência de entregas, as precondições de aprovação e os gates de G1 a G4 estão definidos. A medição e a conferência com dados reais continuam como aceites das entregas.

**Veredito:** `APTO COM RESSALVAS`. O responsável pode aprovar a v3 após conferir R3-1 e R3-2.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
