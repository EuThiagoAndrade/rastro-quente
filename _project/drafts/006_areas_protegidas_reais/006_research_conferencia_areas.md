# Conferência de áreas protegidas — ciclo 006, issue #49

## Escopo e limites

Conferência local da janela principal de 2025-11-01 a 2026-10-31, GMT, com 10.640 detecções. Arquivos de entrada, vínculos e geometria permanecem em `local/`; este registro contém somente agregados e hashes. O resultado é contexto territorial para avaliação técnica: não comprova incêndio, dano, autoria, infração ou situação fundiária.

## Fontes e identidade

| Fonte | Retrato | Bytes | SHA-256 |
| :-- | :-- | --: | :-- |
| CNUC/MMA | 2025_08, nacional, obtido na ideação | 45.856.979 | `97d754c1e01881d5f94e2f9e465fa95fe37b58c24a3df46989c7b30a9bb93fc6` |
| FUNAI | `tis_poligonais`, filtro exploratório por MT; só etapa 1 | 3.844.961 | `6dd8003f92c4bc966895aececded40ca21021d43a1a193e1c6150459bb313f08` |
| FUNAI | `tis_poligonais`, nacional; etapa 2 e carga | 22.114.198 | `79d55baf99309a70fa70dd62e174d2832c0292118633cf159857d0afcb74a350` |

O responsável baixou o retrato nacional da FUNAI pelo visualizador oficial em 2026-11-12, após HTTP 403 na tentativa automatizada. O horário gravado em `fontes.json` é aproximação baseada no arquivo local; cabeçalhos HTTP desse download não foram preservados. Antes da promoção, verificaram-se hash, membros declarados, sistema de referência, codificação dos campos necessários, identidade e classes. A recuperação posterior exige o mesmo hash; o serviço vivo pode mudar. A aquisição automatizada real continua sem comprovação de sucesso, embora as recusas de 403 e os tratamentos de arquivo inválido e hash divergente sejam testados com respostas fictícias.

Hashes dos membros lidos:

| Fonte | SHP | DBF | PRJ |
| :-- | :-- | :-- | :-- |
| CNUC | `aad77da2d83b6973b77ad0c5602edafce7f5e0d8d8a5e7af5c038109a82b468e` | `2c2b4c3a5bbc98e021b7a9d2c0ed58ff12f458a7d2b4c3acc67acb53bb75605f` | `b7fe68a2eb827ea974a1a995a73676e095a366b383a10a66c7498300d1c58153` |
| FUNAI nacional | `a3796505aa5aefab6291181623540cd811d95f1c7e1a420efab8f836b0dea9ee` | `ec0a8629cea36743599929abe771df568ae4983ca2196b4111b63acb1f0b3f2d` | `30d79d1979bcb07a9a76201f5e6bfae6f21cc1d92295a487b0a775c28a9bc975` |

As saídas locais finais têm SHA-256 `b268bfb3d8db01134ee269a005666782745de33d307b27b053e491ce0b42eb9d` para `areas.json`, `faf8cd0bac2f61d7d6726c825a35159d7dca67c96ecb6397db079a0ad07ab82c` para `areas_excluidas.json` e `6857b3ef73a592eccf61178ed751a5ae6dce7bb76fbc8d498572c60a11c083ba` para `deteccoes_areas.csv`. O processamento local mediu 20.932 ms e pico RSS amostrado de 1.216.282.624 bytes; o consumo e o tempo dependem do ambiente.

Os descritores também foram lidos e identificados: `cnuc_2025_08.cpg` declara UTF-8 (SHA-256 `3ad3031f5503a4404af825262ee8232cc04d4ea6683d42c5dd0a2f2a27ac9824`), e `tis_poligonais.cst` declara ISO-8859-1 (SHA-256 `09fc313075748ce8ead962229ed89c919d5a9ff71974ee725a0b48bb87d975a2`). Coincidem com as codificações utilizadas nos campos necessários. Essa observação corrige a afirmação de descritores invertidos da ideação; os descritores não escolhem a codificação da carga.

A comparação da etapa 2 usou `deteccoes.csv` SHA-256 `7a50aaaff7756b6a551b10d84f69353e2b6ed6e5a079e3f13d8c7ea9c4248f40` e `deteccoes_areas.csv` SHA-256 `6857b3ef73a592eccf61178ed751a5ae6dce7bb76fbc8d498572c60a11c083ba`; o relatório de processamento e os hashes das fontes foram conferidos pelo próprio script. Esta identidade de insumos não é uma identidade de carga publicada no banco.

## Método independente

`npm run conferir:areas` lê os anéis crus dos SHPs e determina pertencimento por número de voltas, sem o agrupamento de anéis nem a função de classificação da carga. A borda exata é incluída. O índice das células de 0,05° é calculado com aritmética decimal inteira a partir do texto do CSV. A primeira etapa usa os retratos exploratórios e inclui RPPN e todas as fases; a segunda usa os retratos da carga e aplica as exclusões. A comparação da segunda etapa inclui detecção, fonte, código e posição para cada vínculo; duplicatas, ausências ou extras causam parada. A decomposição compara hashes de atributos e anéis normalizados por rotação inicial e ordenação, preservando o sentido dos anéis.

## Etapa 1 — reprodução exploratória

| Recorte | Detecções distintas | Células distintas |
| :-- | --: | --: |
| Alguma UC | 323 | 108 |
| Proteção integral, todos os rótulos | 78 | 39 |
| Proteção integral, rótulo MT | 76 | 37 |
| Uso sustentável | 254 | 74 |
| Terra indígena | 2.500 | 750 |
| UC e TI | 4 | 3 |
| UC ou TI | 2.819 | 855 |

Foram 11 detecções em múltiplas UCs, ou 9 considerando somente UCs com rótulo MT; duas em múltiplas TIs; duas detecções em UC sem rótulo MT; uma em polígono UC de qualidade estimativa; nenhuma em borda ou RPPN. A correção dos valores sem filtro foi decidida pelo responsável após a comparação: as duas detecções adicionais de proteção integral e suas duas células decorrem de vínculo em UC sem rótulo MT.

## Etapa 2 — retrato da carga

Os **2.831 vínculos** calculados independentemente coincidiram, vínculo a vínculo e com posição, com a saída local da carga. A UC tem 323 detecções e 108 células; proteção integral tem 78 e 39; uso sustentável, 254 e 74; TI, 2.493 e 747.

| Parcela sequencial para TI | Detecções | Células |
| :-- | --: | --: |
| Retirar terras em estudo | −7 | −3 |
| Retirar terras ausentes do retrato nacional | 0 | 0 |
| Trocar terras alteradas | 0 | 0 |
| Acrescentar terras novas | 0 | 0 |

O estado final coincide com a etapa 2, vínculo a vínculo. Esses números descrevem apenas os retratos e a janela identificados acima.

## Áreas e orçamento local

Foram retidas 154 áreas: 65 de proteção integral, 15 de uso sustentável e 74 TIs. A origem de retenção foi rótulo MT em 153 e vínculo em uma. Excluíram-se 1.239 RPPN, oito terras em estudo e 2.386 áreas fora pelo rótulo e sem detecção. O SHP CNUC contém um registro sem geometria já excluído como RPPN.

A estimativa da visão geral com atributos foi **333.856 bytes**, abaixo de 600.000. Áreas com ambas as geometrias, vínculos e metadados das fontes somaram **8.478.783 bytes** em JSON, abaixo de 10.000.000. São estimativas locais de JSON; não medem resposta PostgREST, TOAST, índices nem banco real. O item 2 mede o banco, e o item 4 mede a resposta efetiva.

Para os três contornos problemáticos, os reparos de exibição foram avaliados separadamente: um recuo de buraco triangular com seis casas e dois contornos com oito e catorze casas. A maior distância observada de vértices originais à fronteira final foi, respectivamente, 0,0000006588403°, 0,0000000069121° e aproximadamente 0,000000000000008°. Partes e buracos foram preservados. GEOS, usado só como ferramenta de diagnóstico local, aceitou as 154 geometrias gerais e as 154 reais; um teste separado com aritmética inteira exata não encontrou interseções ou anéis degenerados nos três reparos. O processamento de pertencimento usa os contornos originais.

## Limites e próximo passo

Os testes de fixtures e a conferência local não constituem verificação em produção. A publicação das tabelas e o isolamento de acesso pertencem à issue #50, condicionada à integração da #49 e à autorização correspondente. A tolerância da visão geral de 0,005° e o tratamento de exibição foram instruções posteriores do responsável; a PR da issue deve expor essas decisões e as medições para revisão.

## Lente de sobreposição — issue #51

`npm run conferir:sobreposicao` partiu do banco local vazio e publicou a carga real pela CLI com exibição intermediária e revisão 1. A identidade `d0739e4e5e5d853e673748c13502357bc0b2e0a72c588ed88e32801f86756813` foi a mesma no início e no fim e é igual à da carga hospedada (task da issue #50). Os insumos são os da etapa 2: `deteccoes.csv` `7a50aaaf…48f40` e `deteccoes_areas.csv` `6857b3ef…083ba`.

Dois caminhos sem código de cálculo em comum:

- **Módulo:** RP fictício sob RLS; registros pelas RPCs (`lerRegistros`), áreas e vínculos pelas tabelas com o leitor T25 (`lerAreas`: 154 áreas e 2.831 vínculos, iguais a `areas.json` e `deteccoes_areas.csv`), `sobreposicao` e `qualificarSobreposicao`;
- **SQL escrito à parte:** células em `numeric` a partir do texto decimal de `deteccoes.csv`, vínculos de `deteccoes_areas.csv` e atributos de `areas.json`, sem importar `src/lentes/`.

A comparação, célula a célula, abrange evidência, áreas citadas com detecções e borda, motivo, ressalvas, municípios da cobertura, "N de M" com os dias restritivos e a ordem T5. Não houve divergência nas três classes e nas três janelas, e a grade T1 coincidiu nas 10.640 detecções. Uma mutação proposital do texto do motivo no módulo foi detectada pela comparação e revertida.

| Janela | Classe | Células | Detecções na evidência | Áreas citadas | Células com mais de uma área | Municípios na cobertura |
| :-- | :-- | --: | --: | --: | --: | --: |
| 2025-11-01 a 2026-10-31 | Proteção integral | 39 | 78 | 11 | 1 | 10 |
| | Uso sustentável | 74 | 254 | 9 | 0 | 12 |
| | Terra indígena | 747 | 2.493 | 56 | 10 | 51 |
| 2026-08-01 a 2026-10-31 | Proteção integral | 31 | 63 | 8 | 1 | 6 |
| | Uso sustentável | 61 | 230 | 8 | 0 | 10 |
| | Terra indígena | 563 | 1.837 | 48 | 8 | 46 |
| 2026-10-01 a 2026-10-31 | Proteção integral | 2 | 2 | 2 | 0 | 2 |
| | Uso sustentável | 12 | 21 | 3 | 0 | 3 |
| | Terra indígena | 47 | 86 | 21 | 0 | 18 |

Na janela inteira, as células por classe são iguais às da etapa 2 (39, 74 e 747), com as mesmas detecções (78, 254 e 2.493). A referência exploratória de 37 células de proteção integral é a restrita ao rótulo MT; a diferença de duas células é a explicada na etapa 1. Uso sustentável continua em 74. Nenhuma detecção está sobre a borda. Uma célula de uso sustentável tem a ressalva de limite estimado. A cobertura foi completa em todas as células: 286 de 365 dias sem evidência de lacuna na janela inteira, 72 de 92 em agosto a outubro e 22 de 31 em outubro.

O leitor T25 também foi exercitado pela API local (`test:rls`), numa carga fictícia com 1.201 vínculos. A célula cuja única evidência está no vínculo de posição 1.150 foi destacada. Com a autorização revogada entre a primeira e a segunda página e a carga ainda vigente, o PostgREST respondeu HTTP 416 (`PGRST103`) na segunda página, e a leitura terminou em `acesso_negado` (R3-1).

A conferência é local e não constitui verificação em produção. A interface da lente e a medição de orçamento pertencem ao item 4.
