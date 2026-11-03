# Plano de Implementação — Prova de dados

> **Ciclo:** `001`
> **Status:** `Em Revisão`
> **Versão:** `v1`
> **Data de criação:** 2026-11-03
> **Última atualização:** 2026-11-03
> **Tipo:** `chore`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 001" em 2026-11-03
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
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
| INPE, focos mensais do Brasil (`https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/`) | Existem `focos_mensal_br_202608.csv`, `_202609.csv` e `_202610.csv`, com cerca de 104 MB, 123 MB e 144 MB e `Last-Modified` no dia 1 do mês seguinte. Colunas: `id, lat, lon, data_hora_gmt, satelite, municipio, estado, pais, municipio_id, estado_id, pais_id, numero_dias_sem_chuva, precipitacao, risco_fogo, bioma, frp`. Há registros de vários satélites, inclusive o geoestacionário `GOES-19` | Condições de uso; qual é o satélite de referência vigente; se os arquivos são regenerados depois da publicação; valores possíveis de `satelite` |
| IBGE, localidades e malhas (`https://servicodados.ibge.gov.br/api/`) | Colniza tem código `5103254` (UF MT). A malha `v3/malhas/municipios/5103254` responde em GeoJSON; os metadados declaram área de 27.960,237 km² | Ano/versão da malha servida, condições de uso e parâmetros de qualidade |
| NASA FIRMS (`https://firms.modaps.eosdis.nasa.gov/api/`) | O endpoint responde. Fontes de terceiros indicam que a consulta por área exige uma `MAP_KEY` gratuita, obtida por cadastro | Documentação oficial, cobertura histórica para ago a out de 2026 e condições de uso |

Consequências para o plano: os arquivos brutos são grandes demais para o Git e ficam em `local/`; como podem mudar no servidor, a proveniência registra URL, data de obtenção, tamanho e SHA-256; como a base INPE reúne vários satélites, a regra de contagem é uma decisão analítica (D1).

## Escopo

### Dentro do escopo

- Scripts Node.js 24 nativos, sem dependências, em `scripts/prova-dados/`, para obter as fontes, registrar proveniência, filtrar Colniza, contar e comparar.
- Testes `node --test` com fixtures fictícias em `tests/fixtures/prova-dados/`, incluindo casos de referência calculados à mão.
- Manifesto de fontes versionado (`scripts/prova-dados/fontes.json`) com URL, período e, após a obtenção, tamanho e SHA-256 esperados.
- Dados brutos e saídas intermediárias somente em `local/prova-dados/`.
- Relatório `_project/drafts/001_prova_de_dados/001_research_viabilidade.md` com fontes, versões, cobertura, contagens agregadas, comparação, casos conferidos, limitações e conclusão de viabilidade nos termos decididos em D7.
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

Sugestão do autor: d.

**D2 — Como decidir que um foco é de Colniza.** Exemplo fictício: 100 registros com `municipio_id = 5103254`; 97 ficam dentro do polígono IBGE; 2 ficam fora a menos de 500 m da divisa; 1 registro dentro do polígono tem outro `municipio_id`.

| Alternativa | Resultado do exemplo |
| :-- | :-- |
| a) Campo `municipio_id` do INPE | 100 |
| b) Ponto no polígono da malha IBGE (versão registrada) | 98 |
| c) b como principal, com a lista das divergências entre a e b | 98, com 3 divergências explicadas |

Ponto exatamente sobre a divisa: contar como dentro ou fora deve ser declarado (sugestão: dentro, e relatar quantos houve). Sugestão do autor: c.

**D3 — Fuso dos limites mensais.** Exemplo fictício: um registro em `2026-09-01 02:30` GMT é `2026-08-31 22:30` no horário de Cuiabá (UTC−4).

| Alternativa | Mês do exemplo | Efeito |
| :-- | :-- | :-- |
| a) GMT, como os arquivos do INPE | setembro | Usa os três arquivos mensais sem ajuste |
| b) Horário de Cuiabá | agosto | Exige também os registros de 2026-11-01 entre 00:00 e 04:00 GMT; ignora os de 2026-08-01 nesse intervalo |
| c) a como principal, b como sensibilidade | setembro, com a diferença relatada | Mostra o efeito sem trocar a regra |

Sugestão do autor: c.

**D4 — Unidade de contagem.** Exemplo fictício: 12 registros do satélite escolhido caem na mesma célula de 1 km em dois dias.

| Alternativa | Resultado do exemplo |
| :-- | :-- |
| a) Registro publicado | 12 |
| b) Dia com detecção por célula de 1 km | 2 |

A alternativa b introduz uma regra de agrupamento que ainda não foi validada. Sugestão do autor: a.

**D5 — Concordância com a segunda fonte.** Exemplo fictício, mesmo sensor e mesma regra: setembro com 1.200 registros no INPE e 1.150 na segunda fonte (diferença de 4,2%); outubro com 1.200 e 950 (20,8%).

| Alternativa | Setembro | Outubro |
| :-- | :-- | :-- |
| a) Tolerância de 10% por mês | concorda | diverge |
| b) Tolerância de 25% por mês | concorda | concorda |
| c) Sem tolerância numérica; toda diferença é explicada | explicar 50 | explicar 250 |

Sem sugestão do autor: o limiar é regra analítica.

**D6 — Segunda fonte ou ferramenta.**

| Alternativa | Independência | Custo para o responsável |
| :-- | :-- | :-- |
| a) NASA FIRMS (VIIRS), comparada com a contagem VIIRS do INPE | Fonte e processamento distintos | Cadastro gratuito para obter a `MAP_KEY` (ação externa); a chave fica só em `local/` |
| b) QGIS (gratuito): ponto no polígono dos mesmos arquivos, feito pelo responsável | Ferramenta distinta, mesma fonte | Instalar e operar o QGIS |
| c) Exportação do BDQueimadas (WebGIS do INPE) com o mesmo filtro | Caminho de acesso distinto, mesma base | Exportar e entregar o arquivo em `local/` |

Mais de uma alternativa pode ser escolhida. Sugestão do autor: a, com b se o responsável puder operar o QGIS.

**D7 — Critério de viabilidade.** Exemplo fictício: fonte com uso permitido, sem dias faltantes, concordância em 2 de 3 meses e 17 de 18 casos manuais conferidos.

| Alternativa | Resultado do exemplo |
| :-- | :-- |
| a) Viável se a fonte tem uso permitido, a cobertura não tem lacunas, todos os meses concordam (D5) e ao menos 90% dos casos manuais conferem | inviável (um mês diverge) |
| b) Como a, mas basta concordar em 2 de 3 meses, com a divergência explicada | viável (94% dos casos) |
| c) Sem critério numérico: o relatório expõe evidências e limitações e o responsável conclui | decisão do responsável |

Sem sugestão do autor. Em qualquer alternativa, se nenhuma fonte de focos tiver uso permitido, o ciclo é reavaliado (critério de descarte da ideação).

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar o rascunho do plano ("autorizo o rascunho do plano do ciclo 001") | Ideação registrada | Este rascunho, a branch local `chore/cycle-001-plan` e a reserva do plano em `cycles.md` | Revisão, aprovação, publicação, issues | Concedido em 2026-11-03 |
| Aprovar plano ("aprovo o plano do ciclo 001") | Veredito apto na revisão formal; D1 a D7 respondidas pelo responsável e registradas no plano | Push de `chore/cycle-001-plan` e abertura da PR documental (ideação e plano); depois da integração, apresentação do payload e criação das três issues; encerramento prospectivo do ciclo | Merges, implementação, ação externa, qualquer mudança de D1 a D7 | Veredito, ressalvas e decisões registradas |
| Aprovar merge da PR documental ("aprovo o merge da PR #N") | Checks verdes | Squash da PR documental | Issues ainda não confirmadas | Checks e diff |
| Autorizar implementação ("autorizo a implementação da issue #N"), uma por issue | Plano aprovado e integrado, issue criada, issue anterior integrada | Branch, task, scripts, testes, obtenção dos dados públicos em `local/`, commits, push e PR da issue | Merge, outra issue, nova dependência, serviço pago, mudança de regra | Issue e escopo |
| Ação humana externa ("concluí a ação externa da issue #N") | Issue 1 (obter a `MAP_KEY`, se D6 incluir a) e issue 3 (escolher e conferir os casos) | Retomada da issue depois da ação | Leitura ou registro da chave em arquivo versionado | Roteiro do item correspondente |
| Aprovar merge ("aprovo o merge da PR #N"), uma por PR | Checks verdes, gates locais registrados na task | Squash daquela PR | Qualquer outra PR | Checks e diff |

Não há verificação em produção neste ciclo. Toda cadeia autorizada para em "Parado" quando: uma fonte se mostrar de uso não permitido; um dado pessoal ou restrito aparecer; for necessária nova dependência, serviço pago ou cadastro não previsto; os dados contradisserem uma premissa de D1 a D7 (por exemplo, o satélite de referência não existir nos arquivos); ou o SHA-256 de um arquivo mudar entre execuções.

## Barreiras de domínio

A coluna `Aplica-se?` aceita somente `Sim` ou `Não`; justificar cada linha.

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Contagens, janelas temporais e ponto no polígono. Regras decididas pelo responsável (D1 a D7); casos de referência fictícios calculados à mão nos testes; proveniência com SHA-256; comparação com segunda fonte ou ferramenta (D6); 10 a 20 casos conferidos em mapa; limitações no relatório. Modo contínuo proibido |
| G2 — autenticação, autorização e isolamento por RLS | Não | Não há banco, tabela, autenticação nem usuário neste ciclo |
| G3 — privacidade de dados | Sim | Somente fontes públicas, em nível de ponto e município, sem atributos de pessoas ou imóveis. Brutos só em `local/`; CSV só em `tests/fixtures/` com dados fictícios; a `MAP_KEY`, se houver, só em `local/` e nunca em log, task ou PR; o relatório guarda agregados e coordenadas apenas dos casos conferidos, que são de fonte pública |
| G4 — migrações só acrescentam | Não | Nenhuma migração é criada ou alterada |

## Estratégia de testes

- Unitários com `node --test scripts/prova-dados/`: leitura do CSV do INPE (aspas, espaços antes dos números, linhas vazias), filtro por satélite (D1), ponto no polígono por ray casting com polígono fictício e casos de borda (vértice, divisa, buraco, multipolígono), atribuição de mês em GMT e em UTC−4 (D3) e contagem (D4).
- Casos de referência: fixtures fictícias pequenas em `tests/fixtures/prova-dados/`, cujas contagens esperadas foram calculadas à mão e estão escritas no próprio teste.
- Reprodutibilidade: rodar a contagem duas vezes sobre os arquivos com o mesmo SHA-256 e obter saída idêntica byte a byte.
- Independência: comparação com a segunda fonte ou ferramenta (D6) e casos manuais, registrados no relatório.
- Gates locais antes de cada PR: os testes acima, `node --test scripts/validate-governance.test.mjs`, `node scripts/validate-governance.mjs`, `git diff --check` e `git status --short` (sem arquivo de `local/` no índice).

## Itens de implementação

### Item 1 — Fontes e proveniência

**Contexto:** a verificação prévia identificou as fontes candidatas, mas não suas condições de uso nem as versões que serão usadas.

**Ação técnica:** criar `scripts/prova-dados/fontes.json` e `scripts/prova-dados/obter.mjs`, que baixa os três arquivos mensais do INPE e a malha IBGE de Colniza (e os dados do FIRMS, se D6 incluir a) para `local/prova-dados/brutos/`, e grava `local/prova-dados/proveniencia.json` com URL, data de obtenção, tamanho e SHA-256. Levantar e registrar, com links, as condições de uso de cada fonte, o satélite de referência vigente do INPE, os valores de `satelite` presentes e o ano da malha IBGE. Se D6 incluir a, roteiro da ação externa: o responsável faz o cadastro gratuito no FIRMS e grava a chave em `local/prova-dados/.env` (o agente não cria conta nem vê a chave em chat).

**Critérios de aceite:**

- [ ] `obter.mjs` é idempotente: com os arquivos já presentes e o mesmo SHA-256, não baixa de novo; com SHA-256 diferente, para e informa.
- [ ] Condições de uso de cada fonte registradas com link; fonte de uso não permitido leva a "Parado".
- [ ] Satélite de referência e valores de `satelite` registrados, com a fonte da informação.
- [ ] Nenhum arquivo de `local/` no índice; nenhuma chave em arquivo versionado.

### Item 2 — Contagem e cobertura de Colniza

**Contexto:** depende das regras D1 a D4 e dos arquivos do item 1.

**Ação técnica:** criar `scripts/prova-dados/contar.mjs` e módulos de apoio para ler os CSV em fluxo (sem carregar 144 MB de uma vez), aplicar D1 a D4, calcular ponto no polígono e emitir JSON determinístico com contagens por mês e por satélite, divergências entre `municipio_id` e polígono (D2), dias sem registro por satélite e a sensibilidade de fuso (D3).

**Critérios de aceite:**

- [ ] Testes com os casos de referência fictícios passam.
- [ ] Duas execuções sobre os mesmos arquivos produzem saída idêntica.
- [ ] Contagens por mês e satélite, cobertura diária e divergências registradas em rascunho no relatório, com o SHA-256 dos insumos.
- [ ] O crescimento de focos citado pelo responsável é relatado como observado ou não observado, sem interpretação causal.

### Item 3 — Referência independente e relatório de viabilidade

**Contexto:** depende de D5 a D7 e do item 2.

**Ação técnica:** criar `scripts/prova-dados/comparar.mjs` para a segunda fonte (D6) e preparar a lista de casos para conferência. Roteiro da ação externa: o responsável escolhe de 10 a 20 casos (sugestão: misturar meses, satélites, pontos perto da divisa e divergências de D2) e confere cada um num mapa ao lado (por exemplo, o WebGIS do BDQueimadas ou o mapa do FIRMS), anotando confere ou não confere e o motivo. Consolidar o relatório `001_research_viabilidade.md` com fontes, versões, cobertura, contagens, comparação, casos, limitações (inclusive a não independência entre scripts e revisão do agente) e a conclusão nos termos de D7.

**Critérios de aceite:**

- [ ] Comparação registrada por mês, com a classificação de D5.
- [ ] Casos conferidos registrados, com quem conferiu e o resultado.
- [ ] Relatório com conclusão de viabilidade segundo D7 e limitações explícitas, incluindo que focos não comprovam incêndio, dano, autoria ou infração.

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
| 3 | Referência independente e relatório de viabilidade | `[CHORE]`, `chore.yml` | `chore/issue-N` | Issue 2 integrada; D5 a D7; ação externa |
| — | Encerramento, sem issue | — | `chore/cycle-001-closure` | Issue 3 integrada |

Uma issue por PR. O encerramento é coberto pela aprovação do plano e exige aprovação de merge própria.

## Dependências e blockers

- D1 a D7 respondidas pelo responsável antes da aprovação do plano.
- Acesso de rede aos servidores do INPE, IBGE e, se escolhido, FIRMS.
- `MAP_KEY` do FIRMS obtida pelo responsável, se D6 incluir a.
- Nenhuma dependência de pacote; se uma se mostrar necessária, a situação passa a "Parado".

## Riscos, suposições e rollback

- **Arquivos regenerados pelo INPE:** o SHA-256 pode mudar. Mitigação: proveniência por hash e parada em mudança; a prova vale para a versão registrada.
- **Satélite de referência ausente ou trocado no período:** D1 a perde sentido. Mitigação: o item 1 confere antes da contagem; divergência leva a "Parado".
- **Condições de uso incompatíveis:** critério de descarte da ideação.
- **Malha IBGE de ano diferente do período:** divergências em D2. Mitigação: registrar o ano e listar divergências.
- **FIRMS sem histórico acessível pela `MAP_KEY` para o período:** D6 a falha. Mitigação: alternativas b e c de D6, com nova decisão do responsável.
- **Volume:** cerca de 370 MB de CSV. Mitigação: leitura em fluxo; nada versionado.
- **Independência limitada:** scripts e revisão do mesmo agente. Mitigação: segunda fonte ou ferramenta e casos escolhidos pelo responsável; limitação declarada.
- **Suposição:** Colniza não teve alteração de limite relevante entre a malha usada e o período.
- **Rollback:** cada PR é revertível por reversão do squash; os dados ficam em `local/` e podem ser apagados pelo responsável sem efeito no repositório.

## Sequência recomendada

1. Revisão formal deste plano; o responsável responde D1 a D7 (pode fazê-lo durante as rodadas).
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
- NASA FIRMS, API: https://firms.modaps.eosdis.nasa.gov/api/ (consultado em 2026-11-03).

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
Situação: Aguardando correções (rodada 1) — ciclo 001 (completo)
Quem: O responsável leva a vez ao autor
Conferir: Achados R1-1 a R1-7 em _project/drafts/001_prova_de_dados/001_plan.md#revisão-crítica
Diga: "corrija o plano do ciclo 001"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 001 + revisar_plano + 001_plan/rodada-1 + v1@c7388538da75a4993112dd8d691c0761757e2783`
- `effect_class`: `local_mutation`
- `state_before`: plano `v1` em `Rascunho`, revisão e veredito pendentes, aguardando revisão (rodada 1), no commit local `c7388538da75a4993112dd8d691c0761757e2783`; ciclo `001` em `Planejamento`; árvore inicialmente limpa
- `state_after`: plano `v1` em `Em Revisão`, rodada 1 concluída com `REQUER NOVA RODADA`, aguardando correções (rodada 1); ciclo permanece em `Planejamento`; alteração local somente neste plano, sem commit ou publicação
- `result`: `executed`
- `evidence`: revisão registrada abaixo, sobre a v1 identificada pelo commit de origem; autoridades, ideação e template conferidos; consultas oficiais somente leitura em 2026-11-03; resultados das validações na rodada
- `blockers`: R1-1 a R1-5 impedem parecer apto; R1-6 e R1-7 são ressalvas; D1 a D7 continuam pendentes de decisão humana antes da aprovação

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

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
