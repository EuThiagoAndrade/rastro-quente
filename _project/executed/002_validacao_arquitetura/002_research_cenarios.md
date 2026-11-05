# Cenários e dimensionamento — focos INPE e limites IBGE; volume de dois anos e processamento indeterminados

> **Ciclo:** `002` · **Item:** `1` · **Issue:** [#12](https://github.com/EuThiagoAndrade/rastro-quente/issues/12)
> **Data da avaliação:** 2026-11-05
> **Base documental:** plano v2 aprovado, integrado pela PR #11; evidências do ciclo 001 em `1e794cf91d46276b14a12b3ecd1de187e22b87af`.
> **Natureza:** modelo documental e hipóteses de sensibilidade; não é medição de desempenho nem arquitetura aprovada.

O modelo permite calcular a demanda quando as entradas forem conhecidas. Não há evidência suficiente para quantificar a janela de até dois anos de MT nos três conjuntos, nem duração, CPU ou memória. Essas incógnitas impedem concluir capacidade global ou custo zero. O recorte contém somente focos e limites; não avalia camadas adicionais, seleção de áreas ou o produto completo.

Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Uma linha é um registro de detecção publicado, sem consolidação em eventos.

## 1. Escopo, inventário e proveniência

Restrições humanas: um usuário, Mato Grosso, retenção de no máximo dois anos, atualização sob demanda e custo zero. Data final, frequência, consultas, prazo aceitável, disponibilidade, recuperação e conjunto persistido não foram escolhidos. Vercel, Supabase e autenticação Google continuam requisitos da ADR-002; nenhuma conta, serviço ou implementação foi criada nesta entrega.

| Insumo | Papel no modelo | Evidência e versão | Condições de uso e limite |
| :-- | :-- | :-- | :-- |
| Focos INPE | Fonte de detecções dos três conjuntos | CSV mensais nacionais do manifesto do ciclo 001, agosto–outubro/2026; URL, tamanho, SHA-256 e data em `scripts/prova-dados/fontes.json`. Isso não fixa uma versão para uma janela futura. | FAQ oficial, perguntas 3 e 5: acesso sem custo. Pergunta 36 orienta atribuição ao INPE com data de acesso. Não foi identificada licença formal específica dos CSV; a ressalva permanece. [F1] |
| Limites IBGE | Camada territorial do cenário | API v4; a prova usou malha municipal de Colniza, revisão 2025 segundo o levantamento versionado. API disponibiliza malha estadual e subdivisões, sem escolher aqui geometria ou qualidade operacional. [F3] | Levantamento do ciclo 001 registra CC BY 4.0 para MMD 2024; não comprova licença específica da API/revisão 2025. Manter atribuição e lacuna de correspondência. API fornece simplificações; metadados referem-se às malhas originais. |
| NASA FIRMS | Referência auxiliar da prova, sem ingestão permanente presumida | Comparação VIIRS NRT em Colniza, três meses; não mede MODIS nem escala estadual. [L1, L2] | Condições e necessidade de chave constam do levantamento histórico. Nenhuma consulta à API, chave ou conta nesta entrega. Ingestão permanente exigiria decisão e dimensionamento próprios. |
| Imóveis, uso do solo, áreas protegidas, outros polígonos, imagens ou mapas de fundo de terceiros | Expansões excluídas | Sem seleção ou inventário aprovado neste recorte | Sem demanda computada. Necessidade futura deve ser aprovada; não assumir que a avaliação cobre essas camadas. |

Referências locais verificadas em 2026-11-05:

- **L1:** `_project/executed/001_prova_de_dados/001_research_viabilidade.md`, seções 1, 3, 7 e 8–11. Usar conclusão da seção 11 e suas ressalvas; o cabeçalho histórico ainda diz `Rascunho`.
- **L2:** `scripts/prova-dados/fontes.json`, campos `itens` e `levantamento` (consulta histórica de 2026-11-03). SHA-256 identifica o arquivo obtido naquela execução; HEAD atual não equivale a nova verificação de hash.
- **L3:** `_project/executed/002_validacao_arquitetura/002_plan.md`, item 1 e evidências admitidas; KB-003 e ADR-002/003. O contrato de contagem do ciclo 001 é referência limitada, não decisão de método para a fundação estadual.

## 2. Evidência disponível e consultas desta entrega

### 2.1 Números históricos, sem recontagem

| Território e seleção históricos | Agosto/2026 | Setembro/2026 | Outubro/2026 | Trimestre | Uso permitido no modelo |
| :-- | --: | --: | --: | --: | :-- |
| Colniza, polígono IBGE, `AQUA_M-T` | 516 | 246 | 62 | 824 | Ilustrar sensibilidade, sem extrapolação |
| Colniza, mesmo polígono, VIIRS | 10.456 | 4.479 | 1.925 | 16.860 | Soma das três linhas VIIRS da seção 3 de L1 |
| Colniza, principal + VIIRS | 10.972 | 4.725 | 1.987 | 17.684 | Soma documental, sem deduplicação entre satélites |
| Colniza, todos os valores de `satelite` | 20.755 | 6.181 | 2.799 | 29.735 | Referência municipal de registros publicados |
| MT, campo INPE `estado_id = 51`, `AQUA_M-T` | 3.691 | 1.964 | 761 | 6.416 | Seção 7 de L1: três meses e classificação do INPE; não polígono estadual IBGE |

Principal + VIIRS é 21,46 vezes a principal em Colniza; todos são 36,09 vezes. Essas razões não são fatores para MT ou outros períodos. Nem os 6.416 registros estaduais fornecem média representativa de dois anos. Não multiplicar por oito nem por proporção de área. A ausência de registros não comprova cobertura ou ausência de fogo.

### 2.2 Metadados públicos consultados em 2026-11-05

HEAD com `Accept-Encoding: identity`, sem corpo, entre 15:38:46Z e 15:38:47Z (11:38 em Cuiabá). URLs nacionais completas:

| Fonte | URL | HTTP | Content-Length (bytes) | Last-Modified | ETag |
| :-- | :-- | --: | --: | :-- | :-- |
| INPE agosto | https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/focos_mensal_br_202608.csv | 200 | 103.708.076 | 2026-09-01 23:56:24 GMT | `"62e75ac-65a74aa87da00"` |
| INPE setembro | https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/focos_mensal_br_202609.csv | 200 | 123.024.987 | 2026-10-01 23:56:29 GMT | `"755365b-65cd02a116540"` |
| INPE outubro | https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/mensal/Brasil/focos_mensal_br_202610.csv | 200 | 144.148.591 | 2026-11-01 23:56:43 GMT | `"897886f-65f3fc7fba4c0"` |

Todos anunciaram `Accept-Ranges: bytes`; os tamanhos coincidem com L2. Soma: **370.881.654 bytes** (370,882 MB decimais; 353,700 MiB). Isso dimensiona somente o recebimento desses três arquivos nacionais se esse caminho de obtenção for escolhido. Não mede dados retidos de MT ou tamanho no banco.

No arquivo de agosto, GET com `Range: bytes=0-511` e codificação `identity`, às 15:38:47Z, retornou **206**, `Content-Range: bytes 0-511/103708076`: **512 bytes de corpo efetivamente lidos**. Só o cabeçalho foi utilizado; o restante do fragmento não foi contado, armazenado ou reproduzido. O procedimento aceitava o fragmento apenas com 206 e intervalo correspondente; resposta integral seria cancelada sem leitura do corpo.

```text
id,lat,lon,data_hora_gmt,satelite,municipio,estado,pais,municipio_id,estado_id,pais_id,numero_dias_sem_chuva,precipitacao,risco_fogo,bioma,frp
```

O cabeçalho permite identificar campos de tempo, território e satélite; não comprova cardinalidade, largura média das linhas ou filtro estadual.

HEAD de [malha estadual IBGE v4, UF 51, GeoJSON, qualidade máxima](https://servicodados.ibge.gov.br/api/v4/malhas/estados/51?formato=application/vnd.geo+json&qualidade=maxima) retornou **405**, sem tamanho disponível, zero bytes de corpo lidos; não foi baixada a geometria. GET público de [metadados da UF 51](https://servicodados.ibge.gov.br/api/v4/malhas/estados/51/metadados), às 15:39:00Z, retornou **200**, **325 bytes UTF-8 de corpo**: identifica Mato Grosso, id 51 e área 903.208,027 km². Esse valor não estima bytes ou focos e se refere à malha original conforme a documentação [F3]. Não foram lidos vértices.

Total de corpos de dados nessas consultas delimitadas: **837 bytes** (512 + 325); HEAD não tem corpo. Cabeçalhos HTTP, documentação e resultados de busca não estão nessa soma. TLS validado explicitamente no processo de consulta. Nenhum arquivo em `local/` foi lido; nenhum bruto foi baixado, recontado ou reprocessado.

### 2.3 Estatísticas oficiais e correspondência

A [página oficial de estatísticas INPE](https://data.inpe.br/queimadas/estatisticas/) [F2], consultada em 2026-11-05, apresenta filtros territoriais e séries mensais do satélite de referência. O HTML consultado não trouxe série numérica de MT com versão e intervalo suficientes para fechar a janela variável. O mês corrente é parcial segundo as observações da página. Não foi inferido valor a partir de gráfico ou trecho de busca, nem feita extração de dados brutos.

Mesmo uma estatística adequada da referência precisaria confirmar o valor de satélite por período, regra territorial/temporal e correspondência à versão dos CSV. Não preencheria automaticamente VIIRS ou todos os satélites. Sem série correspondente para cada conjunto, as três demandas permanecem incógnitas. Uma busca documental futura pode resolver parte disso sem autorizar contagem ou download de bases.

## 3. Conjuntos persistidos e janela

Os identificadores abaixo são hipóteses da avaliação, não política operacional. Nenhuma seleção ou exclusão de satélite foi adotada para a fundação.

| Conjunto | Definição | Registros retidos em MT na janela `W` | Bytes de dados de detecções | Lacuna específica |
| :-- | :-- | :-- | :-- | :-- |
| S1 — principal | `AQUA_M-T` | `N1 = N_AQUA(W, MT)` | `D1 = N1 × b_d,1` | Série estadual completa/compatível não disponível nesta evidência; 6.416 só para o trimestre pelo campo INPE |
| S2 — principal e VIIRS | S1 + `NPP-375`, `NPP-375D`, `NOAA-20`, `NOAA-21`, mantendo séries distintas | `N2 = N1 + N_VIIRS(W, MT)` | `D2 = N2 × b_d,2` | `N_VIIRS` estadual e largura média desse conjunto desconhecidos |
| S3 — todos | Todos os valores de `satelite` existentes nas fontes/versões da janela; sem lista fixa presumida | `N3 = N_ALL(W, MT)` | `D3 = N3 × b_d,3` | Universo de valores e registros estaduais por versão/janela desconhecidos |

Com território, janela, fonte e versão idênticos, `0 ≤ N1 ≤ N2 ≤ N3`. Essa relação não dá limites superiores numéricos. Cada `b_d,s` pode variar com o conjunto; não derivar bytes por registro apenas de um cabeçalho. Contagens somam registros de séries distintas, sem transformar passagens em incêndios nem remover registros por proximidade.

Definir `t_f` como final exclusivo e `t_i` como início inclusivo, `W = [t_i, t_f)`, com `t_i` não anterior a `t_f` menos dois anos de calendário. Ambos permanecem variáveis; dois anos não significam uma escolha de 2025–2026 nem 730 dias fixos. A duração real depende das datas e anos bissextos. GMT é a referência histórica da prova; eventual contrato estadual e tratamento de fronteira precisam ser confirmados antes de implementação, sem decisão ambiental nesta avaliação.

Retenção lógica: ao atualizar, `N_s,novo = N_s,anterior + inserções_s − expirados_s − remoções_s`, com atualizações de registros já existentes modeladas separadamente. Remoções aqui são variável para correções publicadas pela fonte, não uma regra de descarte escolhida. Chaves, idempotência, correções retroativas, versões preservadas e prazo de expurgo não foram implementados. Cópias e arquivos temporários também precisam de retenção; a janela lógica não impõe seu expurgo nem garante redução imediata do espaço físico.

## 4. Entradas, unidades e confiança

Todas as entradas abaixo foram classificadas em 2026-11-05. `s ∈ {1,2,3}` identifica o conjunto. **Alta histórica** significa rastreável ao recorte versionado, sem generalização; **hipótese** não é estimativa calibrada; **desconhecido** não vale zero.

| Entrada | Unidade | Fonte/recorte, hipótese e confiança |
| :-- | :-- | :-- |
| Usuários, território, teto da janela | usuário, UF, anos | Responsável, plano/ideação: 1, MT, até 2; alta quanto ao requisito |
| `t_i`, `t_f`, `N_s`, inserções/correções/expirados | instantes UTC, registros | Variáveis sem valor para a janela estadual; limites das seções 2–3 |
| `B_f` e `F` | bytes por arquivo; arquivos | HEAD/manifesto: três valores da seção 2, alta histórica; arquivos para a janela de dois anos desconhecidos |
| `b_d,s` | bytes por registro, sem geometria nem índices | Schema e tipos não definidos; desconhecido. Sensibilidade numérica da seção 6 é fictícia |
| `b_g,s`, `b_i,s` | bytes por registro | Geometria adicional e índices: desconhecidos, dependem de representação/índices. `b_g,s = 0` somente quando a geometria já estiver incluída em `b_d,s` ou não for persistida |
| `B_limites`, `I_limites` | bytes por versão | Malha estadual/subdivisões e seus índices: desconhecidos; HEAD 405. Os 62.339 bytes de Colniza em L2 não escalam por área ou número de municípios |
| `A_s`, `D0`, `H_s` | bytes | Agregados/caches, estruturas de base/metadados, folga física/linhas antigas: desconhecidos. Não supor esquema, percentuais ou ausência de overhead |
| `C_db`, `C_obj`, `C_local`, `T_pico`, `WAL`, `L_sys` | bytes por destino | Cópias, staging, WAL e logs: desconhecidos. Quantidade/retensão de versões e recuperação não escolhidas |
| `U`, `Q`, `S`, `a`, `p`, `h` | atualizações/mês, consultas/mês, sessões/mês, requisições/sessão, requisições/consulta, fração | Hipóteses de frequência/carga da seção 5; paginação, cache e autenticação ainda sem implementação |
| `r`, `o`, `v`, `j` | registros/consulta, bytes/registro serializado, bytes fixos/resposta, requisições adicionais | Sem evidência operacional; variáveis. Serialização inclui campos de resposta e não equivale a bytes persistidos |
| `B_up,k`, `R_up,k`, `B_backup`, `R_backup` | bytes/atualização, requisições/atualização, bytes e requisições/mês | Rota de obtenção, reenvios, reprocessamento e recuperação: desconhecidos; manter separação entre delta novo e bytes relidos |
| `t_k`, `cpu_k`, `mem_k`, `io_k`, `x_k` | segundos/execução, CPU-s/execução, bytes de pico, bytes/execução, execuções/mês | Nenhum benchmark permitido; todos desconhecidos para importação, filtragem territorial/temporal, indexação, consulta, expurgo e recuperação |
| `RPO`, `RTO`, prazo de atualização, disponibilidade | tempo ou proporção do período | Requisitos ausentes, decisão do responsável; não inferir tolerância a perda ou operação manual |

Bytes são a unidade de cálculo. `MB = 10^6 B`, `GB = 10^9 B`, `MiB = 2^20 B`, `GiB = 2^30 B`. Cotas precisam preservar a unidade e o escopo do provedor; número de registros, requests, segundos, CPU-s e memória de pico não são intercambiáveis.

## 5. Cenários de carga e operações

### 5.1 Operações, sem arquitetura escolhida

| Operação | Modelo de demanda | Particularidades e incógnitas |
| :-- | :-- | :-- |
| Carga inicial | Ler `F` arquivos/recortes, receber `B_init = Σ B_f`, reter `N_s`; criar índices/geometrias que forem escolhidos | Leitura pode cobrir o Brasil e todos os satélites mesmo que só S1/MT seja retido. Filtrar depois não reduz o download já recebido |
| Consulta territorial e temporal | Filtrar a janela e o território, devolver `r` registros/páginas ou agregados | Consulta por município, recorte estadual e janela curta/longa são hipóteses. Não definir operação de seleção de áreas. Requisições dependem de paginação/cache, sem presumir visualização completa viável |
| Atualização sob demanda | `U` execuções; em cada uma, ler `B_up,k`, inserir/corrigir e expirar registros da janela | Delta novo pode ser pequeno com releitura grande. Revalidar arquivos nacionais ou repetir a janela inteira difere de ingestão incremental. Nenhuma rota foi adotada |
| Retenção/recuperação | Expirar janela, manter/expurgar versões e cópias, eventualmente restaurar | Janela de dois anos não limita staging, backups, WAL ou versões da fonte; recuperação pode exigir novo download e reindexação |

### 5.2 Frequências e cargas independentes

Mês hipotético de 31 dias para a sensibilidade. **E:** esporádica, `U = 1`; **W:** semanal, `U = 5` como mês com cinco execuções; **D:** diária, `U = 31`. Meses reais têm 28–31 dias e atualização semanal pode ocorrer quatro ou cinco vezes; não são requisitos de agendamento. Sob demanda permite meses sem execução (`U = 0`).

Três cargas de consulta fictícias e independentes da frequência: **Q20**, **Q200**, **Q2000** = 20, 200 e 2.000 consultas/mês. São pontos para observar proporcionalidade, sem evidência de uso do responsável ou teto de um usuário. `r`, `p`, `S` e o tamanho da resposta continuam variáveis; até Q20 pode ser pesado com respostas grandes.

Cada célula abaixo deve ser confrontada no item 2 com os limites por recurso e seguir identificada no item 3. Cada linha admite as três cargas de consulta: **27 combinações**; o mês de carga inicial é avaliado separadamente do mês sem carga inicial.

| Cenário | Persistência ao fim da janela | Frequência hipotética | Consultas/mês | Tráfego de atualização no mês | Processamento |
| :-- | :-- | --: | :-- | :-- | :-- |
| S1-E | `N1`, `DB1` | 1 | 20 / 200 / 2.000 | `B_up,1` | Indeterminado |
| S1-W | `N1`, `DB1` | 5 | 20 / 200 / 2.000 | `Σ(k=1..5) B_up,k` | Indeterminado |
| S1-D | `N1`, `DB1` | 31 | 20 / 200 / 2.000 | `Σ(k=1..31) B_up,k` | Indeterminado |
| S2-E | `N2`, `DB2` | 1 | 20 / 200 / 2.000 | `B_up,1` | Indeterminado |
| S2-W | `N2`, `DB2` | 5 | 20 / 200 / 2.000 | `Σ(k=1..5) B_up,k` | Indeterminado |
| S2-D | `N2`, `DB2` | 31 | 20 / 200 / 2.000 | `Σ(k=1..31) B_up,k` | Indeterminado |
| S3-E | `N3`, `DB3` | 1 | 20 / 200 / 2.000 | `B_up,1` | Indeterminado |
| S3-W | `N3`, `DB3` | 5 | 20 / 200 / 2.000 | `Σ(k=1..5) B_up,k` | Indeterminado |
| S3-D | `N3`, `DB3` | 31 | 20 / 200 / 2.000 | `Σ(k=1..31) B_up,k` | Indeterminado |

Quando a aquisição for pelos mesmos CSV nacionais, `B_init` e o volume relido podem ser iguais nos três conjuntos; `N_s` e persistência continuam distintos. Não usar razão de contagens de Colniza para obter `B_up` de MT. Um mês sem atualização pode ter tráfego e CPU de consultas, autenticação e recuperação.

## 6. Fórmulas e conferências reproduzíveis

### 6.1 Armazenamento por destino e pico

```text
Dados_s      = N_s × b_d,s
GeomExtra_s  = N_s × b_g,s
Indices_s    = N_s × b_i,s + I_limites
DB_s         = D0 + Dados_s + GeomExtra_s + Indices_s + B_limites + A_s + H_s + C_db
Objetos_s    = Brutos_retidos + Exportacoes_retidas + C_obj
Local_s      = Brutos_locais + C_local
Total_s      = DB_s + Objetos_s + Local_s
DiscoDB_pico = DB_s + WAL + L_sys + Staging_no_DB + Espaco_transitorio_de_indices
Pico_destino = Persistencia_destino + Temporarios_naquele_destino
```

`C_db` contém só cópias adicionais dentro do banco; cópias em objetos ou disco local pertencem às respectivas contas. `D0` cobre estruturas fixas, sem repetir limites/índices discriminados. `b_d,s` não inclui a geometria adicional acima; se uma estimativa futura usar tamanho de linha já completo, zerar `b_g,s` ou subtrair esse componente antes de somar. A malha é contada por versão retida, não por detecção. Cache/agregados podem ser zero apenas sob hipótese explícita de não persistir; ausência de implementação não demonstra consumo nulo de uma fundação.

`Total_s` serve ao inventário físico e não é comparado com uma cota única. Banco, disco do banco, objetos, disco local e backups gerenciados podem ter métricas e limites distintos. Espaço físico de linhas expiradas pode persistir; nenhuma liberação imediata foi medida. A documentação Supabase distingue dados/índices de disco com WAL e logs [F4]; isso não escolhe banco, índices ou geometria.

**Sensibilidade fictícia, aplicável separadamente a S1, S2 e S3:** `b_d = 250`, `b_g = 30`, `b_i = 200 B/registro`; `D0 = 20.000.000 B`, demais componentes zerados apenas nesta conta. Assim, `DB = 20.000.000 + 480 × N`. Os valores foram escolhidos para conferir unidades e mostrar mudança de escala; não são tamanho típico ou intervalo provável de PostgreSQL/PostGIS.

| N hipotético, aplicável a qualquer conjunto | Dados + geometria + índices (B) | DB simplificado (B) | MB decimais |
| --: | --: | --: | --: |
| 100.000 | 48.000.000 | 68.000.000 | 68 |
| 1.000.000 | 480.000.000 | 500.000.000 | 500 |
| 10.000.000 | 4.800.000.000 | 4.820.000.000 | 4.820 |

Não atribuir uma linha a S1, outra a S2 e outra a S3: os três `N_s` continuam sem valor. Larguras e overhead desconhecidos impedem transformar essa tabela em previsão.

**Conferência de fronteira documental:** [F4], seção *Fair use database size restriction* e *Free Plan behavior*, consultada em 2026-11-05, informa 500 MB como cota de tamanho de banco da organização, avaliada pela média diária no período de cobrança, somando projetos; é distinta do disco por projeto. Somente para verificar a aritmética, adota-se `L = 500 × 10^6 B`, uso constante durante o período e nenhum outro projeto. A página não explicita a conversão de MB em bytes; a convenção decimal deste exercício precisa ser conferida no item 2 antes de concluir sobre cota real.

| Entrada fictícia | Média constante simplificada (B) | Relação com L |
| --: | --: | :-- |
| N = 999.999 | 499.999.520 | abaixo por 480 B |
| N = 1.000.000 | 500.000.000 | igual, sem margem |
| N = 1.000.001 | 500.000.480 | acima por 480 B |

Esse teste não atesta gratuidade, elegibilidade ou funcionamento, nem avalia os demais limites. O item 2 fará a pesquisa completa e revalidará unidade, escopo e condições. Demanda real, outros projetos e média de cobrança permanecem desconhecidos. O consumo físico de disco não se deduz desse limiar.

### 6.2 Tráfego e requisições

Para cada aresta `e` (fonte → processador, processador → banco/objetos, banco → backend, backend → navegador, backup → destino), calcular separadamente:

```text
B_mensal,e = I_inicial × B_init,e + Σ(k=1..U) B_up,k,e
             + Q × B_consulta,e + B_backup,e + B_outros,e
R_mensal,e = I_inicial × R_init,e + Σ(k=1..U) R_up,k,e
             + Q × p_e + S × a_e + R_backup,e + j_e
B_consulta,e = r_e × o_e + p_e × v_e
```

`I_inicial` vale 1 no mês de carga inicial, 0 no mês comum. `B_up,k` inclui releituras, retries e correções, sem assumir só delta. `r_e` é o total de registros da consulta, `p_e` o número de respostas/páginas e `v_e` os bytes fixos por resposta; `S × a_e` contabiliza autenticação/renovação quando pertinente à aresta. Tráfego de aplicação estática, logs e protocolo entra em `B_outros`/`j`; desconhecido não vira zero. Se houver cache comprovado, hits podem reduzir a aresta banco → backend e continuar consumindo backend → navegador; não multiplicar todas as arestas indiscriminadamente por uma taxa de miss.

O mesmo byte atravessando dois provedores pode consumir duas métricas de saída; não somar cotas nem contar transferência como gratuita por ter origem pública. Sem rota/arquitetura definida, manter cada direção como incógnita para os itens 2 e 3.

**Exemplo fictício de consultas, em uma aresta:** `r = 5.000`, `o = 200 B`, `v = 0` apenas para a conta, `p = 5`. Cada consulta devolve 1.000.000 B em cinco páginas. Q20/Q200/Q2000 resultam em **20/200/2.000 MB por mês** e **100/1.000/10.000 requisições**, antes de autenticação, erros ou outros recursos. Nenhuma dessas quantidades é uso observado.

**Exemplo de releitura, sem recomendação de pipeline:** reler os três CSV nacionais históricos inteiros a cada atualização consumiria `U × 370.881.654 B` de entrada da fonte: E = **370.881.654 B**; W = **1.854.408.270 B**; D = **11.497.331.274 B**. Trata-se de aritmética sobre o trimestre histórico, não de volume mensal novo, rotina escolhida, limite de dois anos ou download realizado. Mostra por que frequência não pode ser multiplicada só pelos registros inseridos.

### 6.3 Processamento e retenção operacional

```text
CPU_mes        = Σ x_k × cpu_k                     [CPU-s]
Tempo_trabalho = Σ x_k × t_k                       [s de tarefas; não tempo de parede]
IO_mes         = Σ x_k × io_k                      [B]
Memoria_pico   = max_t (soma da memoria de tarefas simultaneas) [B]
```

`k` distingue importação, leitura/filtro, indexação, consultas, expurgo, exportação e restauração. `x_k` inclui carga inicial, atualizações, consultas, retries e manutenção conforme a operação. Somar durações de tarefas não determina latência: rede, paralelismo, espera e limites de execução podem mudar o tempo de parede. CPU-s não equivale a segundos faturados de qualquer serviço, e somar bytes serializados não dá memória do processo. Duração por execução, CPU, memória, I/O e viabilidade do prazo ficam **indeterminados em todos os 27 cenários**. A frequência muda o multiplicador, sem preencher o consumo unitário.

Armazenamento e tráfego isoladamente abaixo de uma cota não compensam esse desconhecimento. Retenção de até dois anos precisa também de política de arquivos/cópias e testes de expurgo/restauração; não há RPO/RTO ou disponibilidade aprovados.

### 6.4 Reprodução das contas sem dados ou serviços

Com Node.js 24, em qualquer diretório, este trecho só faz aritmética. Não acessa fonte, arquivo ou banco:

```javascript
const nacional = 103708076 + 123024987 + 144148591;
const viirs = [3511 + 3732 + 3213, 1508 + 1580 + 1391, 661 + 660 + 604];
console.log({ nacional, MiB: nacional / 2 ** 20, viirs,
  principalMaisViirs: 824 + viirs.reduce((a, b) => a + b, 0),
  mtTrimestre: 3691 + 1964 + 761 });
console.log([999999, 1000000, 1000001].map(N => 20000000 + 480 * N));
console.log([1, 5, 31].map(U => U * nacional));
console.log([20, 200, 2000].map(Q => ({ bytes: Q * 5000 * 200, requests: Q * 5 })));
```

Conferência desta entrega: soma de arquivos confrontada com L2; somas VIIRS por coluna e total `5.680 + 5.972 + 5.208 = 16.860`; `824 + 16.860 = 17.684`; fronteira conferida também por inversão `(L − D0) / 480 = 1.000.000`. O trecho acima foi executado, e os resultados coincidiram com as tabelas. Isso verifica aritmética e unidades, não medições territoriais nem desempenho.

## 7. Lacunas e efeito sobre a conclusão

| ID | Entrada/decisão ausente | Conjuntos/recursos afetados | Efeito | Resolução admitida ou prova futura, não executada |
| :-- | :-- | :-- | :-- | :-- |
| LAC-01 | `t_i`, `t_f` e frequência/carga reais | S1/S2/S3; todos | Não há demanda única de dois anos nem mês típico | Responsável define janela e expectativas em planejamento posterior; manter hipóteses separadas até lá |
| LAC-02 | Estatísticas estaduais com território, satélites, janela e versão compatíveis | `N1`, `N2`, `N3`, separadamente | Volume desconhecido; trimestre principal/Colniza não dão teto | Buscar estatísticas oficiais correspondentes. Sem elas, propor contagem autorizada com fontes fixadas, sem ler os brutos agora |
| LAC-03 | Lista de arquivos e rota de obtenção por janela; correções históricas | S1/S2/S3; entrada, staging, requests | Delta novo não determina download/releitura nem pico | Documentação/metadados públicos; eventual prova de ingestão com escopo próprio e amostra autorizada, nunca baixar massas nesta avaliação |
| LAC-04 | Schema, tipos, representação de geometria e índices | S1/S2/S3; `b_d,s`, `b_g,s`, `b_i,s`, `D0` | Tamanho CSV não prova tamanho de banco/disco | Comparação documental nos itens 2/3; protocolo futuro de medir tabela/índices em ambiente isolado, dados apropriados, sem migração agora |
| LAC-05 | Qualidade, revisão, subdivisões, bytes/vértices e condições exatas da malha | Todos; limites, índices, memória e G1/G3 | HEAD 405 e licença histórica não resolvem dimensão/uso da revisão futura | Conferir metadados/termos da revisão escolhida; geometria/amostra somente em prova futura autorizada. Não extrapolar Colniza |
| LAC-06 | Agregados/cache, paginação, resposta, sessões, retries e caminho por provedor | Todos; tráfego/requests/CPU | Um usuário não limita requisições; cota de saída sem aresta não é comparável | Itens 2/3 preservam variáveis; prova posterior de consultas com respostas/tamanhos representativos e casos permitidos/negados |
| LAC-07 | Tempo, CPU, memória, I/O e prazo aceitável | Todos; todas as operações | Processamento indeterminado impede compatibilidade no conjunto | Após novo escopo: cargas inicial/incremental e consultas, picos por tarefa, ambiente e versão fixados, repetições, tempos e recursos; não executado aqui |
| LAC-08 | Retenção de brutos/cópias, expurgo físico, recuperação, RPO/RTO e disponibilidade | Todos; banco, objetos, local, tráfego e operação | Janela lógica pode coexistir com cópias e picos maiores; recuperação não comprovada | Responsável define objetivos; protocolo futuro de expurgo/restauração e verificação de integridade, com autorização própria |
| LAC-09 | Política de persistência e contrato territorial estadual | S1/S2/S3; método e G1 | Cenários não se convertem em escolha operacional | Decisão explícita do responsável antes da fundação. Para futuro teste territorial, incluir casos independentes dentro, fora e na borda, instantes de limite e ano bissexto, com resultado esperado aprovado |
| LAC-10 | Cotas, elegibilidade, unidades e medição por serviço | Todos; custo/capacidade | A fronteira aritmética de banco não demonstra custo zero global | Item 2, após integração desta entrega e autorização da #13, pesquisa condições e aplica os 27 cenários por recurso; item 3 compara alternativas sem substituir incógnitas por zero |

Nenhuma lacuna autoriza serviço, conta, custo, benchmark, download de bases, leitura de `local/prova-dados/brutos/` ou alteração de regra ambiental. Falta de estatística adequada é resultado insuficiente, não convite a ampliar a evidência sem decisão.

## 8. Resultado e passagem aos itens 2 e 3

**Resultado: modelo de focos INPE e limites IBGE documentado; volume estadual de até dois anos e processamento indeterminados; camadas adicionais e seleção de áreas não avaliadas.**

| Hipótese que deve seguir adiante | Armazenamento de dois anos | Tráfego/requests | Processamento | Consequência para os próximos itens |
| :-- | :-- | :-- | :-- | :-- |
| S1 — principal | `DB1`, objetos e cópias sem valor; trimestre MT conhecido só no campo INPE | Expressões por E/W/D × Q20/Q200/Q2000, sem demanda real | Indeterminado | Avaliar cada recurso; não declarar compatibilidade global |
| S2 — principal + VIIRS | `DB2`, objetos e cópias sem valor; não herdar proporção municipal | Mesmas nove combinações, entradas próprias de S2 | Indeterminado | Manter lacuna VIIRS estadual e consumo por registro |
| S3 — todos | `DB3`, objetos e cópias sem valor; universo por versão ainda variável | Mesmas nove combinações, entradas próprias de S3 | Indeterminado | Não tratar todos como sinônimo de S2 nem fixar lista histórica |

O item 2 recebe as entradas/unidades da seção 4, nove linhas de cenários com três cargas da seção 5, fórmulas da seção 6 e todas as lacunas. Uma comparação parcial deve nomear conjunto, frequência, carga, recurso e hipótese; demanda desconhecida com cota conhecida continua indeterminada. Os casos abaixo/no limite/acima precisam preservar escopo e unidade das cotas verificadas. O item 3 deverá transportar esses resultados, inclusive recursos desconhecidos, até o parecer. Nenhuma alternativa de arquitetura é escolhida nesta entrega.

## 9. Fontes oficiais externas

Todas consultadas em **2026-11-05**; URLs diretas com seções usadas. Documentação não prova desempenho, atualidade de arquivos diferentes ou elegibilidade de conta.

| ID | Fonte e seção | Fato usado e limite |
| :-- | :-- | :-- |
| F1 | [INPE — FAQ](https://data.inpe.br/queimadas/pages/secao_informacoes/faq/index.html), perguntas 3/5, 7/10 e 36 | Acesso sem custo, referência histórica, limites de interpretação e orientação de atribuição; não é licença formal específica do CSV nem fator de volume entre sensores |
| F2 | [INPE — Estatísticas](https://data.inpe.br/queimadas/estatisticas/), filtros e observações do comparativo mensal | Estatísticas da referência e caráter parcial do mês corrente; não foi obtida série estadual suficiente para os conjuntos/janela |
| F3 | [IBGE — API de malhas v4](https://servicodados.ibge.gov.br/api/docs/malhas?versao=4), introdução/observações 3–4 e endpoints por UF | Simplificação, atualização de malhas, metadados da malha original e endpoints; não fornece tamanho estadual nesta consulta nem resolve licença da revisão futura |
| F4 | [Supabase — Understanding Database and Disk Size](https://supabase.com/docs/guides/platform/database-size), *Database size*, *Free Plan behavior* e *Fair use database size restriction* | Separação entre banco/disco e cota organizacional usada só no teste aritmético; demais condições e compatibilidade serão pesquisadas no item 2 |

Referência de atribuição: INPE. Banco de Dados de Queimadas. [BDQueimadas](https://data.inpe.br/queimadas/bdqueimadas/). Acesso em: 5 nov. 2026. IBGE: malhas via API v4 e metadados da UF 51, acesso em 5 nov. 2026; a revisão 2025 da prova é evidência histórica de L2, sem nova certificação de revisão. Os links dos arquivos e os horários/bytes das consultas estão na seção 2.
