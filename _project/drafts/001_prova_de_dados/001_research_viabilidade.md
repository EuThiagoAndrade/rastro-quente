# Relatório de viabilidade — prova de dados de Colniza (MT)

> **Ciclo:** `001`
> **Estado:** `Rascunho` (parte do item 2, issue #5; os itens 3 e a conclusão de viabilidade pertencem à issue #6)
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

Conferência por caminho independente da contagem municipal de P: `awk` sobre as colunas `satelite` e `municipio_id` dos mesmos arquivos deu 516, 246 e 62, igual a Mu. A comparação com a segunda fonte (FIRMS) é da issue #6.

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
- Scripts e revisão são do mesmo agente. A independência vem da issue #6 (FIRMS) e dos casos conferidos pelo responsável.

## 9. Pendências para a issue #6

Comparação com o FIRMS (D5 a D9), casos manuais (D8), K e M, conclusão de viabilidade (D7) e a versão final deste relatório.
