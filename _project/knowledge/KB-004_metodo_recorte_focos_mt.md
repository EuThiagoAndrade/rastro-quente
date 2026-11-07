---
title: "Método do recorte local de focos AQUA_M-T em Mato Grosso"
tags:
  - método
  - G1
  - focos
  - disponibilidade
author: "Claude Code (Opus 5.5)"
module: "scripts/prototipo"
last_updated: "2026-11-07"
origin_cycle: "003"
---

# KB-004: Método do recorte local de focos AQUA_M-T em Mato Grosso

## Finalidade

Registra como a CLI `scripts/prototipo/` obtém, valida, recorta, agrega e qualifica as detecções `AQUA_M-T` de Mato Grosso para o protótipo do ciclo `003`. É consultada por quem implementar o banco, a carga e a interface (itens 2 a 4) e por quem revisar G1. As medições e números da primeira execução ficam em `_project/drafts/003_implementacao_prototipo/003_research_medicao_recorte.md` (depois do encerramento, em `executed/`).

## Limite de autoridade

Conhecimento de referência. As regras de método são as do plano `003` aprovado (contrato de dados, D1, H3 e sensibilidade por consulta); esta base descreve a implementação, não as altera. A regra de histórico adotada (H3) e o tratamento dos avisos sem área são decisões humanas de 2026-11-07, registradas em `scripts/prototipo/avisos.json` e na task da issue #20; esta base só os descreve. Não decide representação de exibição, schema ou retenção de versões. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração; nada aqui ordena ou prioriza municípios.

## Conteúdo

### Fluxo e módulos

| Modo da CLI | Módulo | O que faz |
| :-- | :-- | :-- |
| `janela` | `janela.mjs`, `obter.mjs` | Sonda (HEAD) os CSV mensais do INPE e fixa os 12 meses consecutivos completos mais recentes; deriva o envelope e grava os itens em `fontes.json`. Não refaz sem `--refixar`. |
| `obter` | `obter.mjs` | Baixa cada item para `local/dados-prototipo/brutos/`, registra bytes, SHA-256, `Last-Modified`/`ETag` e data; arquivo existente com hash diferente é parada. |
| `processar` | `processar.mjs`, `leitura.mjs`, `territorio.mjs`, `disponibilidade.mjs` | Dry-run: confere hashes, recorta em fluxo, agrega, calcula D1 e H3, mede tempos, memória, disco e malhas; grava saídas locais; sai com código 3 se houver parada. |
| `conferir` | `conferir.mjs` | Reagrega o arquivo de saída por caminho independente e confere a referência de Colniza do ciclo `001` quando os hashes coincidem. |

Reaproveita da prova `001`, sem alterá-los: `geo.mjs` (ponto no polígono), `satelites.mjs` (divisão CSV), `fuso.mjs` (conferência de desvio), `cobertura.mjs` (`diasDoIntervalo`) e `obter.mjs` (`sha256Arquivo`).

### Contrato aplicado

- **Janela:** mês entra quando o arquivo mensal existe e foi modificado depois do fim do mês; mês faltante no meio interrompe (não é pulado). Intervalo GMT com início inclusivo e fim exclusivo.
- **Leitura:** cabeçalho precisa conter `id`, `lat`, `lon`, `data_hora_gmt`, `satelite`, `municipio_id` e `estado_id`; ausência é arquivo incompatível. Para linhas de `AQUA_M-T`, exige número de colunas igual ao do cabeçalho, latitude/longitude numéricas e no domínio, e data/hora existente. Linha inválida é listada e impede declarar a carga válida. Linhas de outros satélites só são contadas.
- **Identidade:** `id_tecnico` = 16 primeiros hexadecimais do SHA-256 do arquivo + número da linha de dados. O `id` do INPE é preservado como `id_fonte` (vazio → nulo), sem deduplicação; repetições e ausências são contabilizadas.
- **Território:** malha municipal IBGE v4 `qualidade=maxima` da UF 51, coordenadas originais, borda incluída, buracos e multipolígonos respeitados. O ponto é atribuído só quando cai em exatamente um município; em mais de um, vai para a lista de ambíguos e há parada (nunca se escolhe o primeiro ou o menor código). Fora de todos, é excluído. O código do INPE é confrontado com a atribuição (outro município, outra UF, UF 51 fora da malha) e com o contorno estadual (contorno sem município, município fora do contorno).
- **Escopos:** `principal` (linha do arquivo mensal dentro do próprio mês) e `envelope` (linha do arquivo diário dentro do intervalo do envelope). O envelope só entra na sensibilidade. O arquivo mensal em formação serve apenas para conferir o envelope: os dois conjuntos devem coincidir.
- **Tempo:** total e séries principais em GMT. Sensibilidade `America/Cuiaba` com o desvio conferido no período (falha se houver horário de verão), em campo separado. `contarConsulta` implementa a consulta por datas inclusivas, com o exemplo 100 − 3 + 5 = 102 coberto por teste.
- **Disponibilidade (D1):** unidade dia GMT × satélite × município. A incidência de cada aviso no município é `lacuna_conhecida` (área cobre o município inteiro), `incidencia_indeterminada` (cobertura parcial ou área não delimitada) ou `sem_incidencia` (afastamento demonstrado). A delimitação suportada hoje é `semiplano` por meridiano/paralelo, por ser convexa e verificável pelos vértices. Validação humana por município prevalece. Precedência: lacuna > indeterminada > sem evidência, preservando todos os motivos. Regras de histórico suportadas: `H1` (padrão do plano: histórico não verificado → indeterminada, `historico_ausente_ou_incompleto`), `H2` (motivo `historico_nao_verificado`, sem mudar a classe) e `H2_interrupcoes_nasa`, **adotada em 2026-11-07**: H2 e, nos dias com interrupção na tabela MODIS/Aqua da NASA, `incidencia_indeterminada` com motivo `interrupcao_aqua_nasa` em todos os municípios, nunca lacuna. A regra vem de `decisaoH3` em `avisos.json`; sem ela, vale H1. Dia sem evidência leva o texto "cobertura não comprovada". Não existe classe "coberto".
- **Alcance H3:** `avisos.json` registra os avisos (síntese, satélites, delimitação, validação) e o alcance do histórico por período. O processamento conta município-dias, dias e meses por alcance e para se houver parcial ou indisponível sem `decisaoH3` registrada. A tabela de interrupções MODIS/Aqua da NASA relata os dias com interrupção sem aviso do INPE e, na regra adotada, indetermina esses dias; não cria lacuna.

### Saídas locais (fora do Git)

`local/dados-prototipo/relatorio.json` (medição e paradas), `conferencia.json` e, em `saidas/`: `deteccoes.csv`, `divergencias.csv`, `disponibilidade.csv`, `agregados.json`, `geometrias_por_municipio.json`, `ambiguos.json`, `invalidas.json` e `id_fonte_repetidos.json`.

### Testes

`npm run test:prototipo` (fixtures fictícias em `tests/fixtures/prototipo/`): dentro, fora, borda, buraco e multipolígono; divisa ambígua; código INPE divergente; vão no contorno; linha repetida e `id_fonte` repetido/vazio/coluna ausente; linhas inválidas; mês do arquivo; envelope e exclusão do principal; virada de ano, ano bissexto e horário de verão; X/Y/Z, aviso sem área, aviso de outro satélite, validação humana, precedência, histórico ausente/parcial e parada H3; obtenção com hash divergente ou download incompleto.

### Limitações conhecidas

- O alcance do histórico de avisos não é demonstrável com as fontes atuais; a regra adotada marca a incerteza, mas não a resolve.
- A tabela da NASA não delimita área nem representa a recepção própria do INPE; alguns dos dias indeterminados podem ter tido dados no catálogo.
- Os três avisos sem área ficam indeterminados nos 142 municípios, por decisão humana.
- A revisão da malha (2025) é inferida das notas de liberação do IBGE, pois a API não a informa.
- Linhas inválidas de outros satélites não são validadas além do número de colunas, porque não entram no recorte.

## Fontes

| Fonte | Função | URL | Versão fixada | Limite de autoridade |
| :-- | :-- | :-- | :-- | :-- |
| INPE — CSV de focos (mensal/diário) | Detecções | `https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/` | SHA-256 por arquivo em `scripts/prototipo/fontes.json` | Catálogo de detecções; não comprova fogo nem cobertura |
| INPE — avisos | Histórico de lacunas | https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_informacoes/avisos/ | SHA-256 `6f6994ac…65d0` (2026-11-07) | Não declara ser exaustivo |
| IBGE — malhas API v4 e localidades | Território | https://servicodados.ibge.gov.br/api/docs/malhas?versao=4 | SHA-256 por item em `fontes.json` | Malha aproximada; IBGE não define limites legais |
| NASA MODAPS — interrupções MODIS/Aqua | Conferência do histórico | https://modaps.modaps.eosdis.nasa.gov/services/production/outages_aqua.html | SHA-256 `ed297da7…a0a7` (2026-11-07) | Cadeia da NASA; não delimita área nem representa a recepção do INPE |
| Plano `003` | Regras de método | `_project/drafts/003_implementacao_prototipo/003_plan.md` (depois, `executed/`) | v4 aprovado em 2026-11-05 | Autoridade das regras; esta KB não a substitui |

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-11-07 | `003` | Criação na implementação do item 1 (issue #20), com a decisão H3 e o tratamento dos avisos sem área registrados |
