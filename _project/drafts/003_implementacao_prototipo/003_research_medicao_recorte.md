# Relatório — recorte local e medição de 12 meses de AQUA_M-T em Mato Grosso

> **Ciclo:** `003` — item 1, issue [#20](https://github.com/EuThiagoAndrade/rastro-quente/issues/20)
> **Data da medição:** 2026-11-07
> **Modo:** dry-run local, sem banco, sem provedor e sem escrita remota
> **Código:** `scripts/prototipo/` (CLI `prototipo.mjs`); método em `_project/knowledge/KB-004_metodo_recorte_focos_mt.md`
> **Manifesto:** `scripts/prototipo/fontes.json` (URLs, bytes, SHA-256, `Last-Modified`, data de obtenção e condições de uso); avisos em `scripts/prototipo/avisos.json`

Relatório sanitizado. Brutos, registros classificados e saídas detalhadas ficam em `local/dados-prototipo/` (fora do Git). Aqui só há contagens, tamanhos, tempos e hashes de fontes públicas. Nenhum `id` do INPE, coordenada de registro real, credencial ou dado pessoal foi copiado. Focos não comprovam incêndio, dano, autoria ou infração; a lista de municípios não é ranking.

## 1. Janela e fontes

**Janela principal:** `[2025-11-01T00:00Z, 2026-11-01T00:00Z)`, meses 2025-11 a 2026-10. Critério executável (`janela.mjs`): os 12 meses consecutivos mais recentes cujo arquivo mensal oficial existe e tem `Last-Modified` posterior ao fim do mês. Em 2026-11-07, o arquivo de 2026-11 existia, mas fora modificado no próprio mês (em formação) e não entrou. Nenhum mês foi pulado ou substituído.

**Envelope de sensibilidade:** `America/Cuiaba` teve desvio fixo de −4 h em toda a janela (conferido pelo tzdata do Node 24 e pelo mesmo teste que detecta o horário de verão de 2018). Uma consulta dentro da janela começa a sensibilidade dentro dela e pode terminar até `2026-11-01T04:00Z`. O envelope é `[2026-11-01T00:00Z, 2026-11-01T04:00Z)`, lido do arquivo diário oficial de 2026-11-01. Não há envelope antes do início.

| Grupo | Itens | Bytes | Observação |
| :-- | --: | --: | :-- |
| CSV mensais nacionais INPE (principal) | 12 | 542.721.326 | Arquivos de 2026-01 a 2026-06 com `Last-Modified` de julho/2026 (reprocessamento pelo INPE). Ago–out/2026 com o **mesmo SHA-256** da prova `001`. |
| CSV diário INPE 2026-11-01 (envelope) | 1 | 3.799.558 | Mesmo SHA-256 da prova `001`. |
| CSV mensal INPE 2026-11 em formação (conferência) | 1 | 18.329.687 | Só confere a completude do envelope; nunca é fonte de contagem. |
| Malhas IBGE v4 de MT: municípios máxima, intermediária e mínima; contorno estadual máxima | 4 | 6.433.978 | Classificação usa só a máxima. |
| Metadados IBGE de MT e lista de municípios (localidades v1) | 2 | 65.143 | Lista e malha têm os mesmos 142 códigos. |
| Página de avisos INPE e tabela de interrupções MODIS/Aqua da NASA | 2 | 102.274 | Páginas mutáveis fixadas pelo SHA-256. |

Total obtido: 22 itens, 571.451.966 bytes. URL, SHA-256 completo e data de cada item estão no manifesto. Condições de uso: INPE dados abertos com atribuição (FAQ 36), IBGE com atribuição (CC BY 4.0 declarada para a MMD 2024; licença da API/revisão 2025 não localizada), NASA com política de dados aberta. Leituras dos ciclos `001` e `002`; não relidas na íntegra nesta entrega.

## 2. Território

- 142 municípios na malha `estados/51?intrarregiao=municipio&qualidade=maxima` (139 `Polygon`, 3 `MultiPolygon`, nenhum buraco), iguais aos 142 da lista oficial.
- Coordenadas geográficas `[longitude, latitude]` em graus, como servidas pela API (GeoJSON sem `crs`, padrão RFC 7946). Eixos conferidos pela referência de Colniza abaixo. Nenhum arredondamento, tolerância ou reprojeção.
- O polígono de Colniza (5103254) na malha estadual é **idêntico**, coordenada a coordenada, ao da malha individual usada na prova `001`.
- Revisão da malha: a API não informa o ano. Pelas notas de liberação lidas no ciclo `001`, a v4 traz a revisão 2025; não reconferido nesta data.

## 3. Recorte em fluxo

| Medida | Valor |
| :-- | --: |
| Linhas de dados lidas (14 arquivos de focos) | 3.595.334 |
| Linhas de AQUA_M-T | 143.014 |
| Linhas inválidas (qualquer satélite) | 0 |
| Registros persistíveis — janela principal | **10.640** |
| Registros persistíveis — envelope | 0 |
| Excluídos: fora de MT pelo polígono | 124.134 |
| Excluídos: do envelope/conferência fora do intervalo do envelope | 1.254 (diário) e 6.986 (conferência) |
| Excluídos: fora do mês do próprio arquivo mensal | 0 |
| Pontos em mais de um município (parada) | 0 |
| Pontos na borda de um único município | 0 |

**Divergências com os códigos do INPE (AQUA_M-T, janela principal):** 93 registros atribuídos pelo polígono a um município de MT diferente do `municipio_id` do INPE, todos com `estado_id = 51`. Nenhum registro com `estado_id = 51` fica fora da malha, nenhum de outra UF cai dentro dela e nenhum ponto está no contorno estadual sem município. Logo, o total estadual coincide pelos dois critérios e as diferenças são só de alocação entre municípios de MT. A lista fica em `local/dados-prototipo/saidas/divergencias.csv`. A contagem principal segue o polígono IBGE, como na prova `001`.

**`id_fonte`:** 10.640 valores distintos, nenhum vazio, nenhum repetido. Linhas continuariam preservadas se houvesse repetição (teste com fixture).

## 4. Contagens e conferências

| Mês (GMT) | 2025-11 | 2025-12 | 2026-01 | 2026-02 | 2026-03 | 2026-04 | 2026-05 | 2026-06 | 2026-07 | 2026-08 | 2026-09 | 2026-10 |
| :-- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| MT, AQUA_M-T | 275 | 205 | 245 | 127 | 164 | 191 | 831 | 1.440 | 746 | 3.691 | 1.964 | 761 |

- 134 dos 142 municípios têm ao menos um registro na janela. Ausência de registro não significa ausência de fogo nem cobertura.
- **Agregação independente** (`conferir.mjs`): reagregar o arquivo de saída por um caminho separado do processamento reproduz os 12 totais estaduais e todos os pares município × mês; soma municipal = 10.640.
- **Referência pública comparável:** com os mesmos hashes da prova `001`, Colniza tem **516 / 246 / 62** em ago/set/out de 2026 (total 824), exatamente o resultado do ciclo `001`.
- A conferência de totais não valida espacialmente cada ponto. A evidência espacial é a dos casos independentes (fixtures) e da referência de Colniza.

## 5. Sensibilidade America/Cuiaba e envelope

- Diferença mensal Cuiabá − GMT: **0 nos 12 meses**.
- Isso não é presumido nem inferido de ausência. As 10.640 detecções principais ocorrem entre 17h e 20h GMT (4, 2.156, 8.203 e 277 nas horas 17, 18, 19 e 20), na passagem vespertina do Aqua. Logo, um deslocamento de 4 h não as move de dia.
- O envelope foi efetivamente lido: o arquivo diário de 2026-11-01 tem 1.254 linhas de AQUA_M-T no país, nenhuma em `[00:00Z, 04:00Z)`. O arquivo mensal de 2026-11 em formação, obtido em 2026-11-07, também não tem nenhuma nesse intervalo: os dois arquivos oficiais coincidem (0 = 0).
- O exemplo do plano (principal 100, sensibilidade 102, diferença +2, envelope fora do principal) é coberto por teste unitário com dados fictícios.

## 6. Disponibilidade D1 e alcance do histórico (H3)

**Fontes consultadas:**

1. Página de avisos do INPE: 3 avisos na janela (2026-07-10, 2026-07-22 e 2026-08-12), todos de falta de imageamento do AQUA em "parte da América do Sul", sem área delimitada em texto. A página cobre o período (há avisos antes, durante e depois), mas não declara ser exaustiva.
2. Tabela de interrupções MODIS/Aqua da NASA: 109 registros em 79 dias da janela. Em 76 desses dias não há aviso do INPE. Os 3 dias com aviso do INPE também estão na tabela. Por mês: nov 5, dez 9, jan 7, fev 3, mar 5, abr 3, mai 10, jun 6, jul 11, ago 5, set 6, out 9. Em 30 dias, a interrupção cruza 17h–21h GMT, faixa em que ocorreram as detecções de MT. A correspondência é imperfeita: em 2026-07-22 a interrupção listada foi de 00:40 a 02:15 GMT, mas o INPE avisou falta de imageamento. O INPE tem recepção própria, portanto interrupção da NASA não comprova lacuna no catálogo.

**Alcance do histórico:** como nenhuma fonte demonstra completude, a janela foi classificada como `parcial`.

| Unidade | Verificado | Parcial | Indisponível |
| :-- | --: | --: | --: |
| Município-dias | 0 | 51.830 | 0 |
| Dias | 0 | 365 | 0 |
| Meses | 0 | 12 | 0 |

**Resultado com H1 (padrão local, antes da decisão):** 51.830 município-dias em `incidencia_indeterminada`, todos com motivo `historico_ausente_ou_incompleto`. Em 426 (3 dias × 142 municípios), há também o motivo `aviso_sem_area_delimitada`. Nenhum dia é `lacuna_conhecida` ou `sem_evidencia_de_lacuna`. As contagens de focos não mudam.

**Parada H3:** com histórico parcial, a entrega parou antes de publicar e apresentou ao responsável o efeito de cada alternativa na disponibilidade exibida (os 3 avisos sem área indeterminados em todas):

| Alternativa | `lacuna_conhecida` | `incidencia_indeterminada` | `sem_evidencia_de_lacuna` | Leitura na interface |
| :-- | --: | --: | --: | :-- |
| H1 — manter | 0 | 51.830 | 0 | Todo dia de todo município aparece como indeterminado; a disponibilidade deixa de distinguir dias. |
| H2 — `sem_evidencia_de_lacuna`, motivo `historico_nao_verificado` | 0 | 426 | 51.404 | Só os 3 dias de aviso INPE aparecem indeterminados; os demais trazem "cobertura não comprovada" e o motivo do histórico. |
| Outra regra (sugestão) — H2, mais `incidencia_indeterminada` com motivo `interrupcao_aqua_nasa` nos dias da tabela da NASA | 0 | 11.218 | 40.612 | 79 dias indeterminados em todos os municípios; nos 286 restantes, "cobertura não comprovada" e `historico_nao_verificado`. |

**Sugestão apresentada: a outra regra.** Ela usa a única fonte oficial independente encontrada para marcar incerteza onde ela é documentada. Nunca converte interrupção em lacuna conhecida e evita que H1 apague toda a informação de disponibilidade. Limite: a tabela da NASA não delimita área nem representa a recepção do INPE. Por isso a regra só cria indeterminação, e o recorte por horário (30 dias) não é sugerido, dada a divergência de 2026-07-22.

**Decisão humana (G1), 2026-11-07:** "Adote a outra regra sugerida para H3 e mantenho os três avisos sem área como incidência indeterminada (opção a)." Registrada em `scripts/prototipo/avisos.json` (`decisaoH3.regra = H2_interrupcoes_nasa`; `validacaoHumana` dos três avisos = manter indeterminada) e na task.

**Resultado aplicado (reexecução de 2026-11-07):**

| Classe | Município-dias | Motivos |
| :-- | --: | :-- |
| `lacuna_conhecida` | 0 | — |
| `incidencia_indeterminada` | 11.218 | `interrupcao_aqua_nasa` em 79 dias × 142 municípios; nos 3 dias de aviso também `aviso_sem_area_delimitada` (426) |
| `sem_evidencia_de_lacuna` | 40.612 | `sem_aviso_incidente`, com o texto "cobertura não comprovada" |

Todas as 51.830 linhas trazem também `historico_nao_verificado` e o alcance `parcial`, para que a interface não apresente o histórico como completo. As contagens de focos não mudaram.

**Avisos sem área:** os 3 avisos do INPE remetem a imagens do Worldview. Foram apresentadas as alternativas (a) manter `incidencia_indeterminada` nos 142 municípios ou (b) validar por município uma proposta feita com as imagens. O responsável escolheu (a). Uma validação futura por município pode ser registrada em `validacaoHumana.municipios` de `avisos.json`, sem mudar o código.

## 7. Geometria de classificação e de exibição

Mesma origem/revisão (API v4, malha estadual com subdivisão municipal), qualidades oficiais da API, sem simplificação local:

| Representação | Uso | Vértices | Arquivo (bytes) | Arquivo gzip | Por município: mín / mediana / p90 / máx (bytes) |
| :-- | :-- | --: | --: | --: | :-- |
| `qualidade=maxima` | Classificação (integral) | 235.980 | 5.138.459 | 1.200.788 | 6.946 / 28.733 / 59.853 / 128.229 |
| `qualidade=intermediaria` | Candidata à exibição | 44.839 | 988.732 | 262.591 | 1.446 / 5.559 / 11.398 / 20.135 |
| `qualidade=minima` | Candidata à exibição | 10.382 | 241.043 | 64.213 | 458 / 1.473 / 2.647 / 3.983 |

Os valores foram medidos nos 142 municípios, sem extrapolar os 62.339 bytes de Colniza. Por município, a medição está em `local/dados-prototipo/saidas/geometrias_por_municipio.json`. A escolha da representação de exibição depende do orçamento e do desempenho medidos nos itens 3 e 4. Se não for a integral, vale a legenda de simplificação do plano. Nenhuma geometria vai para o bundle.

## 8. Medição da execução

Máquina local do responsável (Windows 11, Node.js 24.15.0), rede doméstica; tempos de rede variam.

| Fase | Medida |
| :-- | :-- |
| Obtenção (rede) | 112,7 s para 21 itens / 571.364.148 bytes; mais 1,8 s para a tabela da NASA (87.818 bytes) |
| Verificação de SHA-256 dos 22 insumos | 1,1 s |
| Carga da malha e do contorno | 0,08 s |
| Leitura em fluxo e classificação territorial | 7,5 s |
| Agregação, disponibilidade (51.830 linhas) e alcance | 0,08 s |
| Processamento total, incluindo medição de malhas e escrita | 9,3 s na primeira execução; 9,1 s na reexecução com a regra decidida |
| Pico de memória (RSS) | 288 MB (máximo do processo, reexecução); 280 MB na primeira |
| Disco local | brutos 571,5 MB; saídas 8,5 MB (pico: brutos + saídas, nada é apagado) |
| Saídas (reexecução) | `deteccoes.csv` 1.744.772 bytes (10.640 linhas); `disponibilidade.csv` 6.627.644 bytes (51.830 linhas, com motivos); `divergencias.csv` 14.483 bytes (93 linhas); `agregados.json` 83.240 bytes |

Esses números não estimam o banco: tipos, índices, sobrecarga por linha, TOAST e geometria persistida ainda não existem.

## 9. O que os itens 2 e 3 ainda precisam medir com schema real

- Bytes por linha e por índice das detecções (10.640 principais + envelope), da disponibilidade (51.830 município-dias por satélite) e das versões de malha (classificação e exibição), contra a cota do plano gratuito.
- Tempo e transação da carga completa, idempotência por identidade técnica e retenção de versões.
- Custo das consultas por período/município com total exato, série diária e sensibilidade na mesma versão.
- Transferência real da geometria de exibição por município, número de requisições e tempo em celular (item 4).
- Representação persistida da disponibilidade (classe, motivos, alcance e avisos por município-dia) já com a regra decidida.

## 10. Reprodução

```sh
node scripts/prototipo/prototipo.mjs janela --ultimo-mes 2026-11   # já fixada; repetir exige --refixar
node scripts/prototipo/prototipo.mjs obter                         # baixa ou confere os SHA-256 do manifesto
node scripts/prototipo/prototipo.mjs processar                     # dry-run; sai com código 3 quando há parada (0 com a decisão H3 registrada)
node scripts/prototipo/prototipo.mjs conferir                      # agregação independente e referência de Colniza
npm run test:prototipo
```

Arquivo-fonte mutável no servidor (mensais reprocessados, páginas de avisos) gera SHA-256 divergente e parada, nunca substituição silenciosa.
