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

**Estado: 15 casos conferidos em 2026-11-04, todos "confere".** Para cada caso: P1 (catálogo: o registro existe no BDQueimadas com o mesmo instante, satélite e coordenadas), P2 (território: dentro ou fora de Colniza) e P3 (período: o mês pela regra de GMT). `node scripts/prova-dados/candidatos.mjs` sugeriu 28 candidatos (arquivo local `local/prova-dados/saidas/candidatos_casos.md`), em ordem determinística por hash, misturando meses, satélites (AQUA_M-T e NOAA-20), pontos perto da divisa dentro e fora do polígono e dias de borda de mês.

**Quem conferiu e como (desvio declarado do plano).** O plano previa o responsável conferindo no WebGIS. O responsável informou que não sabia operar a ferramenta e escolheu, em 2026-11-04, que o agente (Claude) conferisse no navegador. **Não é conferência humana nem totalmente independente do agente que escreveu os scripts.** Foram escolhidos 15 dos 28 candidatos por critério de cobertura, antes de consultar o catálogo: 5 de dia de borda de mês (1, 7, 8, 20, 28), 3 dentro perto da divisa (15, 18, 26), 3 fora perto da divisa (16, 17, 22), 2 do NOAA-20 (3, 24) e 2 de P por hash (2, 21). A consulta usou o serviço WFS do GeoServer do próprio BDQueimadas (`data.inpe.br/queimadas/geoserver/wfs`, camada `bdqueimadas:focos`), o mesmo serviço que alimenta o mapa do site, por filtro de latitude e longitude (±0,001°) e de instante (±1 h), em vez de clicar nos pontos. O resultado de cada caso está na tabela abaixo.

**Limites desta conferência.** (a) P1 compara o CSV baixado do INPE com o catálogo do INPE: confirma a obtenção e a ausência de adulteração, não a observação física. (b) P2 usa o atributo `municipio` do catálogo, que vem da base de limites do INPE, e não da malha IBGE 2025 do script; o acordo nos 3 casos "fora" (ARIPUANÃ, ARIPUANÃ, MACHADINHO D'OESTE/RO) e nos "dentro" a 211 a 594 m da divisa é uma evidência de que as duas bases coincidem nesses pontos, mas não nos demais trechos do limite. (c) P3 é conferido contra a data e hora GMT do catálogo. (d) No caso 3, o catálogo traz também um registro `NPP-375D` 20 minutos antes; foi ignorado por ser outro satélite. (e) No caso 26, o catálogo traz dois registros do AQUA_M-T no mesmo instante, a cerca de 1 m um do outro (longitudes -59,38625 e -59,38624); o caso confere porque o registro de -59,38624 existe, e a duplicidade não foi investigada.

Os casos entram em `scripts/prova-dados/casos.json` e daqui na tabela abaixo. Cada caso é "confere" (as três propriedades conferem), "não confere" (alguma não confere) ou "inconclusivo" (nenhuma diverge e alguma é inconclusiva). Inconclusivos saem do denominador de M; com menos de 10 conclusivos, o responsável escolhe casos novos até 10 conclusivos ou 20 casos no total, e depois disso M é indeterminado.

| # | id INPE | coordenadas (lat, lon) | instante GMT | satélite | visualizador e camada (versão/data de acesso) | P1 catálogo | P2 território | P3 período | esperado (caminho independente) | script | classificação | quem conferiu e data | motivo (divergência ou inconclusão) |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | `41ec2a21-3f75-3a37-a5c6-4446d40e7424` | -9.27697, -59.54828 | 2026-08-01T19:45:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1878037780 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-08-01T19:45:00Z (dia de borda de mês); mês 2026-08 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-08 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 2 | `12c4b3b1-310b-38f9-9a5b-4d47029e6f73` | -8.90224, -60.56729 | 2026-08-13T19:08:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1881114730 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-08-13T19:08:00Z; mês 2026-08 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-08 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 3 | `c3b1a503-4531-3259-8cc1-d79c2e07d1c8` | -8.9622, -60.5203 | 2026-08-16T05:36:00Z | NOAA-20 | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1881726180 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-08-16T05:36:00Z; mês 2026-08 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-08 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 4 | `b358e542-ec2c-3e78-a68f-d7d47f095eef` | -9.17929, -59.6467 | 2026-08-31T19:04:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1887145427 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-08-31T19:04:00Z (dia de borda de mês); mês 2026-08 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-08 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 5 | `d744e2fe-72ac-3c1b-a0dc-4c58df117d42` | -9.14238, -60.9573 | 2026-09-01T19:45:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1887562826 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-09-01T19:45:00Z (dia de borda de mês); mês 2026-09 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-09 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 6 | `9f1b7557-d6ea-3536-888a-70fbf23a41f6` | -8.79986, -60.79205 | 2026-09-19T19:38:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1891841197 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-09-19T19:38:00Z; mês 2026-09 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-09 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 7 | `19ede071-e292-384a-93c0-df489cb78c53` | -9.58187, -60.63054 | 2026-09-22T19:53:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1892443508 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município ARIPUANÃ/MT (fora de Colniza); limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-09-22T19:53:00Z; mês 2026-09 pela regra de GMT) | no catálogo do INPE: registro existente; município ARIPUANÃ/MT; mês 2026-09 | fora | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 8 | `80179945-50a0-3eae-a447-33462a9f1259` | -8.92035, -61.4712 | 2026-09-22T19:55:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1892444934 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município MACHADINHO D'OESTE/RO (fora de Colniza); limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-09-22T19:55:00Z; mês 2026-09 pela regra de GMT) | no catálogo do INPE: registro existente; município MACHADINHO D'OESTE/RO; mês 2026-09 | fora | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 9 | `813a92ec-7aa7-3c21-aafe-3effab7b1e37` | -8.80321, -60.80736 | 2026-09-22T19:55:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1892442184 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-09-22T19:55:00Z; mês 2026-09 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-09 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 10 | `3e6faee6-d66f-32df-833a-1f0b561d76cb` | -9.1267, -60.39911 | 2026-09-30T20:04:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1893886350 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-09-30T20:04:00Z (dia de borda de mês); mês 2026-09 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-09 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 11 | `db15870c-5f3a-3b55-861b-28b8988970f4` | -9.08083, -61.15199 | 2026-10-04T19:19:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1894419238 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-10-04T19:19:00Z; mês 2026-10 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-10 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 12 | `39ad46da-593f-3102-a6df-88404cc7cfd5` | -9.56492, -59.78339 | 2026-10-08T20:12:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1895245295 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município ARIPUANÃ/MT (fora de Colniza); limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-10-08T20:12:00Z; mês 2026-10 pela regra de GMT) | no catálogo do INPE: registro existente; município ARIPUANÃ/MT; mês 2026-10 | fora | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 13 | `c8b39087-dc5c-3c78-899c-06d7e1711042` | -9.10257, -60.97426 | 2026-10-09T18:00:00Z | NOAA-20 | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1895441707 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-10-09T18:00:00Z; mês 2026-10 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-10 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 14 | `15862113-e0ee-3dd2-91d6-6453027dc246` | -9.7703, -59.38624 | 2026-10-25T19:30:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1898760196 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-10-25T19:30:00Z; mês 2026-10 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-10 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |
| 15 | `73cbc661-8fb5-3a89-831f-dc58a65f0392` | -9.13854, -61.12164 | 2026-10-31T20:02:00Z | AQUA_M-T | BDQueimadas (data.inpe.br/queimadas/bdqueimadas), camada bdqueimadas:focos consultada pelo serviço WFS do GeoServer do INPE; acesso em 2026-11-04 | confere (registro id_foco_bdq 1899745185 com mesmo instante GMT, satélite, latitude e longitude (5 casas)) | confere (catálogo do INPE: município COLNIZA/MT; limites do INPE, não a malha IBGE) | confere (data/hora GMT do catálogo 2026-10-31T20:02:00Z (dia de borda de mês); mês 2026-10 pela regra de GMT) | no catálogo do INPE: registro existente; município COLNIZA/MT; mês 2026-10 | dentro | confere | Claude (agente), por escolha do responsável em 2026-11-04; não é conferência humana, 2026-11-04 |  |

**M = 100%** (15 de 15 casos conclusivos conferem; 0 não conferem; 0 inconclusivos), com a ressalva de que a conferência foi feita pelo agente.

## 11. Critério de viabilidade (D7 b) e conclusão

| Componente | Valor | Condição de D7 b | Situação |
| :-- | :-- | :-- | :-- |
| U (uso permitido das fontes) | atendido: INPE (acesso livre, sem licença formal explícita), IBGE (CC BY 4.0 compatível, com atribuição) e FIRMS (política aberta da NASA; o responsável não relatou restrição nos termos do cadastro) | obrigatório | atendido, com as ressalvas do levantamento |
| C (dias com lacuna conhecida ou incidência indeterminada, C-d) | 1 (2026-08-12, declarado) | ≤ 3, todos declarados | atendido |
| K (meses que concordam) | 3 de 3 | ≥ 2 de 3, com a divergência explicada | atendido (nenhum mês diverge) |
| M (casos manuais que conferem) | 100% (15 de 15), conferidos pelo agente | ≥ 90% | atendido, com a ressalva da seção 10 |

**Conclusão: viável**, por D7 b (U atendido, C-d = 1, K = 3 de 3, M = 100%). A conclusão tem uma ressalva: M foi obtido por conferência do agente, e não do responsável, e o P2 foi conferido contra a base de limites do INPE, não contra a malha IBGE. Se o responsável quiser uma conferência humana, os casos ficam em `casos.json` para repetir. Esta conclusão avalia se as fontes públicas e o método reproduzem contagens coerentes em Colniza; não avalia a regra de seleção de áreas (fora do escopo do ciclo), e focos não comprovam incêndio, dano, autoria ou infração.
