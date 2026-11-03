# Relatório de viabilidade — prova de dados de Colniza (MT)

> **Ciclo:** `001`
> **Estado:** `Rascunho` (itens 2 e parte automática do item 3; faltam os casos manuais, M e a conclusão de viabilidade)
> **Período:** 2026-08-01 a 2026-10-31 (GMT, início inclusivo e fim exclusivo)
> **Última atualização:** 2026-11-03

Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Os números abaixo são contagens de registros publicados pelo INPE e não estimam área queimada, número de incêndios ou intensidade.

## 1. Insumos e reprodução

Insumos, todos com SHA-256 conferido contra `scripts/prova-dados/fontes.json` antes da contagem (a execução para se divergir):

| Insumo | Tamanho (bytes) | SHA-256 | Last-Modified do servidor |
| :-- | --: | :-- | :-- |
| `inpe-mensal-202608` | 103708076 | `4574013b15b785f42078fe72dfa73b0b48a773666e88025ebe5ef440cc3694da` | Tue, 01 Sep 2026 23:56:24 GMT |
| `inpe-mensal-202609` | 123024987 | `69ecef072d0e0db63698f7e3adc101cd68f593294eefc3dcd97eeaf554bd0248` | Thu, 01 Oct 2026 23:56:29 GMT |
| `inpe-mensal-202610` | 144148591 | `e8e09447152280c85935c83d65d818900593246070c96fbac61260a6ba94b64f` | Sun, 01 Nov 2026 23:56:43 GMT |
| `inpe-diario-20261101` | 3799558 | `4fe513730a99e3a73660d95d2ae6178824a48c38b8e9c46269899cca01e92474` | Mon, 02 Nov 2026 12:05:03 GMT |
| `ibge-malha-5103254-v4` (revisão 2025, qualidade máxima) | 62339 | `5e4ebe055569005c845f1f51a7d565585855a740988d34754537c2800d70b90c` | — |

Reprodução: `node scripts/prova-dados/contar.mjs` grava `local/prova-dados/saidas/contagem.json` (fora do Git). Duas execuções sobre os mesmos arquivos deram a mesma saída; SHA-256 da saída: `107f795de4af5d95eca35014fdeb59f524abe117158c5e8673286c6b7af46052`. Foram lidos 2.386.466 registros; 23.033 ficam fora das janelas de GMT e de UTC−4. Não há `id` repetido entre os registros de Colniza.

## 2. Regras aplicadas (decisões do responsável, plano v5)

- **D1 d:** série principal P = satélite de referência `AQUA_M-T`. Auxiliares: VIIRS por satélite (SNPP = `NPP-375` + `NPP-375D`, confirmado pelo responsável em 2026-11-03; NOAA-20; NOAA-21) e todos os satélites.
- **D2 c:** território principal = polígono da malha IBGE (E); ponto exatamente sobre a divisa conta como dentro e é relatado; P = E. Mu = campo `municipio_id` = 5103254. As divergências são a diferença simétrica entre os dois conjuntos.
- **D3 c:** mês em GMT como principal; sensibilidade no horário de Cuiabá (UTC−4 fixo, sem horário de verão no período), que usa também o arquivo diário de 2026-11-01.
- **D4 a:** registro publicado, sem agrupamento.

## 3. Séries

Registros por mês em Colniza, GMT:

| Série | Agosto | Setembro | Outubro | Total |
| :-- | --: | --: | --: | --: |
| **P** (`AQUA_M-T`, polígono) | 516 | 246 | 62 | 824 |
| E (`AQUA_M-T`, polígono) | 516 | 246 | 62 | 824 |
| Mu (`AQUA_M-T`, `municipio_id`) | 516 | 246 | 62 | 824 |
| V — SNPP (`NPP-375` + `NPP-375D`) | 3.511 | 1.508 | 661 | 5.680 |
| V — NOAA-20 | 3.732 | 1.580 | 660 | 5.972 |
| V — NOAA-21 | 3.213 | 1.391 | 604 | 5.208 |
| Todos os satélites (soma dos valores de `satelite`) | 20.755 | 6.181 | 2.799 | 29.735 |

Por valor de `satelite` (polígono): `GOES-19` 9.204 / 1.219 / 648; `AQUA_M-M` 52 / 12 / 13; `METOP-B` 139 / 65 / 34; `METOP-C` 74 / 64 / 30; `MSG-03` 31 / 0 / 0; `TERRA_M-M` 239 / 68 / 58; `TERRA_M-T` 44 / 28 / 29; `NPP-375` 2.338 / 1.122 / 452; `NPP-375D` 1.173 / 386 / 209. A soma de todos os satélites mede registros, não fogos: o mesmo evento pode aparecer em vários satélites e várias vezes por dia.

Conferência por caminho independente da contagem municipal de P: `awk` sobre as colunas `satelite` e `municipio_id` dos mesmos arquivos deu 516, 246 e 62, igual a Mu. A comparação com a segunda fonte (FIRMS) está na seção 9.

## 4. Divergências entre `municipio_id` e polígono (D2)

Para P (`AQUA_M-T`): **0 divergências** e 0 pontos exatamente sobre a divisa; E = Mu nos três meses. Lista de divergências de P: vazia.

Outros satélites (informativo, contagens): `GOES-19` 24 registros só no polígono; `NOAA-20` 1 só no campo e 1 só no polígono; `NPP-375` 1 só no polígono; os demais, 0. Nenhum ponto sobre a divisa em qualquer satélite. A lista nominal de divergências (`id`, coordenadas e instante) é produzida só para P, que não tem nenhuma; para os demais satélites a saída traz apenas as contagens.

## 5. Sensibilidade de fuso (D3 c)

Horário de Cuiabá (UTC−4) menos GMT:

| Série | Agosto | Setembro | Outubro |
| :-- | --: | --: | --: |
| P (`AQUA_M-T`) | 516 (0) | 246 (0) | 62 (0) |
| Todos os satélites | 20.767 (+12) | 6.170 (−11) | 2.798 (−1) |

Para P não há mudança: todos os registros do `AQUA_M-T` nos arquivos têm hora entre 17h e 21h GMT, longe das 00h–04h GMT em que os dois fusos divergem. As diferenças vêm de satélites com registros em Colniza antes das 04h GMT (`GOES-19`, `TERRA_M-M`, `METOP-B`, `METOP-C` e `MSG-03`).

## 6. Cobertura (separada da contagem)

Para cada um dos 92 dias do período e para o `AQUA_M-T`, detecção (com ou sem registro em Colniza) e disponibilidade (lacuna conhecida, incidência indeterminada ou sem evidência de lacuna) são atributos independentes:

| Detecção × disponibilidade | Dias |
| :-- | --: |
| com registro × sem evidência de lacuna | 47 |
| sem registro × incidência indeterminada | 1 |
| sem registro × sem evidência de lacuna ("cobertura não comprovada") | 44 |
| com registro × lacuna conhecida | 0 |
| sem registro × lacuna conhecida | 0 |

Dias sem registro: 10 em agosto, 15 em setembro e 20 em outubro. Os 44 dias "sem registro, sem evidência de lacuna" **não são relatados como cobertos**: o catálogo não distingue ausência de fogo de ausência de observação.

**Avisos do INPE no período:** um, de 2026-08-12 (falta de imageamento do AQUA).

- Evidência a favor de não haver incidência: a imagem indicada no aviso (Worldview/GIBS, camada `MODIS_Aqua_CorrectedReflectance_TrueColor`) mostra a área sem imageamento a leste de uma faixa imageada que cobre o retângulo de Colniza (0 pixels sem dado dentro do retângulo na vista ampla; 45 de 135.540 pixels pretos isolados na vista aproximada, sem forma de borda de faixa).
- Evidência contra concluir: no catálogo do INPE, o `AQUA_M-T` tem só 5 registros no Brasil em 2026-08-12 (todos às 20:08–20:10 GMT, a oeste de 64,8°O), contra 271 a 794 nos dias vizinhos, enquanto NOAA-20 e NPP-375 seguem normais. O catálogo não tem dado do satélite de referência em Colniza nesse dia e a imagem não explica sozinha o motivo (a cobertura de nuvens sobre Colniza também reduz detecções).
- Classificação pela regra do plano (sem evidência conclusiva): **incidência indeterminada**, em 2026-08-12, sem registro.

**C** (lacunas conhecidas ou incidência indeterminada da série principal): C-d = 1 e C-p = 1 (com um só satélite em P, as duas unidades coincidem).

## 7. Crescimento de focos citado pelo responsável

A ideação registra a afirmação, ainda sem verificação, de que os focos cresceram fortemente em Mato Grosso de agosto a outubro de 2026. **Crescimento não observado nos dados deste período.** As contagens caem de agosto para setembro e para outubro em todas as séries:

| Série | Agosto | Setembro | Outubro | Set/Ago | Out/Set |
| :-- | --: | --: | --: | --: | --: |
| Colniza, P (`AQUA_M-T`) | 516 | 246 | 62 | 0,48 | 0,25 |
| Colniza, todos os satélites | 20.755 | 6.181 | 2.799 | 0,30 | 0,45 |
| Colniza, SNPP | 3.511 | 1.508 | 661 | 0,43 | 0,44 |
| Mato Grosso, `AQUA_M-T` (campo `estado_id` = 51) | 3.691 | 1.964 | 761 | 0,53 | 0,39 |

Limites desta leitura, sem interpretação causal: ela cobre só os três meses (não compara com julho nem com anos anteriores, então não testa um crescimento anterior a agosto); a afirmação não define "forte" e nenhum limiar foi escolhido; o recorte de Mato Grosso usa o campo `estado_id` do INPE, não um polígono.

## 8. Limitações

- Registros publicados não são fogos: o mesmo evento pode gerar vários registros em satélites e passagens diferentes (D4 a não agrupa).
- O catálogo do INPE reúne satélites com sensores e resoluções distintas; só P tem série comparável ao longo do tempo.
- Malha IBGE aproximada e não oficial, revisão 2025; polígono usado como declarado (limitações de uso do IBGE no levantamento).
- Cobertura: dias sem registro e sem evidência de lacuna ficam como "cobertura não comprovada"; a classificação do aviso de 2026-08-12 é indeterminada.
- Scripts e revisão são do mesmo agente. A independência vem da comparação com o FIRMS (seção 9) e dos casos conferidos pelo responsável (seção 10).
- Concordância com o FIRMS valida a obtenção e o processamento da série VIIRS (V), no mesmo polígono e com a mesma regra de mês; não torna a observação física independente, porque INPE e FIRMS usam os mesmos sensores VIIRS (seção 9).
- A comparação com o FIRMS não testa a série principal P (MODIS/`AQUA_M-T`). P se liga a E pela lista de divergências de D2 (vazia) e é conferida pelos casos manuais (seção 10).
- O FIRMS só existe como NRT para o período (a versão SP termina em 2026-07-31), e dados NRT podem ser reprocessados depois; os números valem para o que foi obtido em 2026-11-03.

## 9. Comparação com o NASA FIRMS (D5 a D9)

**Contrato (D6 a).** INPE: série V (satélites VIIRS, polígono IBGE, GMT, registro publicado, sem filtro de confiança). FIRMS: produtos `VIIRS_SNPP_NRT`, `VIIRS_NOAA20_NRT` e `VIIRS_NOAA21_NRT`, consultados pelo retângulo de Colniza em 19 janelas consecutivas de 5 dias por produto (57 arquivos, SHA-256 em `scripts/prova-dados/fontes.json`), com os registros filtrados pelo mesmo polígono e `acq_date` e `acq_time` lidos em UTC. A versão SP do FIRMS termina em 2026-07-31; por isso todo o período usa NRT, sem misturar produtos. Nenhum registro caiu fora do trimestre, nenhum se repetiu entre janelas e nenhum ficou exatamente sobre a divisa. Os 57 arquivos e a contagem do item 2 foram conferidos por SHA-256 antes da comparação.

**Regra de concordância (D5 b, F2).** `|A − B| / max(A, B) × 100`, com tolerância de 25%; `A` é o INPE e `B` o FIRMS. Duas contagens iguais a zero concordam; só uma igual a zero diverge. O limite exato de 25% conta como concordância. Nenhum mês ficou perto do limite.

| Mês | Satélite | A (INPE) | B (FIRMS) | Diferença | Resultado |
| :-- | :-- | --: | --: | --: | :-- |
| 2026-08 | SNPP (`NPP-375` + `NPP-375D`) | 3.511 | 3.513 | 0,06% | concorda |
| 2026-08 | NOAA-20 | 3.732 | 3.733 | 0,03% | concorda |
| 2026-08 | NOAA-21 | 3.213 | 3.214 | 0,03% | concorda |
| 2026-09 | SNPP | 1.508 | 1.510 | 0,13% | concorda |
| 2026-09 | NOAA-20 | 1.580 | 1.580 | 0,00% | concorda |
| 2026-09 | NOAA-21 | 1.391 | 1.393 | 0,14% | concorda |
| 2026-10 | SNPP | 661 | 633 | 4,24% | concorda |
| 2026-10 | NOAA-20 | 660 | 628 | 4,85% | concorda |
| 2026-10 | NOAA-21 | 604 | 586 | 2,98% | concorda |

**K (D9 S2 e E1).** Um mês concorda se a maioria estrita dos satélites comparáveis concorda; satélite sem comparação sai da agregação com declaração. Os três satélites tiveram comparação nos três meses, então nada foi excluído. **K = 3 de 3** (agosto, setembro e outubro concordam). Há um só método de K (FIRMS), então a agregação entre métodos (H) não se aplica.

**Onde as séries diferem (casamento por registro).** Casando os registros por data, hora e minuto UTC e coordenadas com 3 casas decimais (cerca de 110 m), com `node scripts/prova-dados/casar.mjs`:

| Satélite | Casados | Só no INPE | Só no FIRMS |
| :-- | --: | --: | --: |
| SNPP | 5.652 | 28 | 4 |
| NOAA-20 | 5.940 | 32 | 1 |
| NOAA-21 | 5.190 | 18 | 3 |

Todos os registros só do INPE estão em outubro e concentrados entre 2026-10-09 e 2026-10-20 (por exemplo, NOAA-20: 14 em 12/10 e 6 em 13/10; SNPP: 11 em 14/10 e 6 em 16/10). Os 8 registros só do FIRMS estão em agosto e setembro, 1 a 2 por dia. A **causa não foi determinada**: não testei se o FIRMS NRT estava incompleto nesses dias ou se o INPE processou passagens que o FIRMS não tem. Como todos os meses concordam dentro da tolerância, a causa não altera K nem a conclusão, e nenhuma explicação é exigida por D7 b; fica registrada como diferença observada.

## 10. Casos manuais (D8 c)

**Estado: pendente da ação do responsável.** O responsável escolhe de 10 a 20 casos e confere, para cada um, P1 (catálogo: o registro aparece no WebGIS do BDQueimadas com o mesmo instante, satélite e coordenadas), P2 (território: dentro ou fora de Colniza sobre a camada de limites) e P3 (período: o mês pela regra de GMT). `node scripts/prova-dados/candidatos.mjs` sugere 28 candidatos (arquivo local `local/prova-dados/saidas/candidatos_casos.md`), em ordem determinística por hash, misturando meses, satélites (AQUA_M-T e NOAA-20), pontos perto da divisa dentro e fora do polígono e dias de borda de mês. A sugestão não é a escolha.

Os casos conferidos entram em `scripts/prova-dados/casos.json` e daqui na tabela abaixo. Cada caso é "confere" (as três propriedades conferem), "não confere" (alguma não confere) ou "inconclusivo" (nenhuma diverge e alguma é inconclusiva). Inconclusivos saem do denominador de M; com menos de 10 conclusivos, o responsável escolhe casos novos até 10 conclusivos ou 20 casos no total, e depois disso M é indeterminado.

Registro dos casos: nenhum caso conferido ainda. Cabeçalho da tabela:

| # | id INPE | coordenadas (lat, lon) | instante GMT | satélite | visualizador e camada (versão/data de acesso) | P1 catálogo | P2 território | P3 período | esperado (caminho independente) | script | classificação | quem conferiu e data | motivo (divergência ou inconclusão) |
| --: | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |

**M: indeterminado** (0 casos conclusivos).

## 11. Critério de viabilidade (D7 b) e conclusão

| Componente | Valor | Condição de D7 b | Situação |
| :-- | :-- | :-- | :-- |
| U (uso permitido das fontes) | atendido: INPE (acesso livre, sem licença formal explícita), IBGE (CC BY 4.0 compatível, com atribuição) e FIRMS (política aberta da NASA; o responsável não relatou restrição nos termos do cadastro) | obrigatório | atendido, com as ressalvas do levantamento |
| C (dias com lacuna conhecida ou incidência indeterminada, C-d) | 1 (2026-08-12, declarado) | ≤ 3, todos declarados | atendido |
| K (meses que concordam) | 3 de 3 | ≥ 2 de 3, com a divergência explicada | atendido (nenhum mês diverge) |
| M (casos manuais que conferem) | indeterminado | ≥ 90% | pendente |

**Conclusão provisória: evidência insuficiente**, porque M é indeterminado. Por D7 b, a conclusão final é "viável" ou "inviável" só depois dos casos conferidos. Esta conclusão avalia se as fontes públicas e o método reproduzem contagens coerentes em Colniza; não avalia a regra de seleção de áreas (fora do escopo do ciclo), e focos não comprovam incêndio, dano, autoria ou infração.
