---
title: "Contrato de lente de seleção e método das lentes"
tags:
  - método
  - G1
  - lentes
  - seleção
author: "Claude Code (Opus 5.5)"
module: "src/lentes"
last_updated: "2026-11-12"
origin_cycle: "004"
---

# KB-005: Contrato de lente de seleção e método das lentes

## Finalidade

Registra o contrato único das lentes de seleção (C1) e como o módulo `src/lentes/` o implementa: entrada, saída, identidade dos destaques, qualificador de cobertura, grade, as lentes de concentração, recorrência e persistência e a combinação delas por célula (ciclo `005`). É consultada por quem implementar uma lente nova ou mexer na combinação e por quem revisar G1. Conferência e medição com a carga real ficam em `_project/executed/004_contrato_lentes_selecao/004_research_conferencia_lentes.md` (lentes) e em `_project/drafts/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md` (combinação).

## Limite de autoridade

Conhecimento de referência. As regras das lentes são as do plano `004` v3, aprovado em 2026-11-11: decisões Q1 a Q12 e D13 a D16, recorte M1-a e detalhes T1 e T3 a T7, ratificados na aprovação. As regras da combinação são as do plano `005` v2, aprovado em 2026-11-11: decisões Q1 a Q9 da ideação `005` e detalhes T8 a T14, ratificados na aprovação. Esta base descreve a implementação e não as altera; mudar parâmetro ou regra de uma lente é nova decisão de G1, novo plano e nova `versao_metodo`, e mudar regra da combinação é nova decisão de G1, novo plano e nova `versao_combinacao`. Não decide limiares de lentes futuras, pontuação ou pesos nem contrato visual. Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração, e nada aqui prioriza áreas.

## Conteúdo

### Módulos

| Módulo | Papel |
| :-- | :-- |
| `contrato.ts` | Tipos do contrato C1, `VERSAO_METODO` (`lentes-004-v1`), limitações comuns e rótulo de ordenação |
| `grade.ts` | Grade T1 de 0,05° com aritmética decimal exata |
| `cobertura.ts` | Qualificador de cobertura (D13, T3 e T7), seu texto e as ressalvas por classe da persistência (D15, T7) |
| `comum.ts` | Conferência da entrada, aplicação do qualificador (e, na persistência, das ressalvas por classe) e estado agregado |
| `concentracao.ts` | Lente de concentração |
| `recorrencia.ts` | Lente de recorrência, meses GMT tocados pela janela e seus rótulos |
| `persistencia.ts` | Lente de persistência: sequências de dias GMT consecutivos por célula e ressalva de borda (T4) |
| `carregar.ts` | Leitura no recorte M1-a, verificações por resposta, integridade T3, destino dos erros e concorrência limitada |
| `combinacao.ts` | Combinação das lentes por célula de 0,05° (ciclo `005`): `ResultadoCombinacao`, `VERSAO_COMBINACAO` (`combinacao-005-v1`), `combinar` e `qualificarCombinacao` |

Tudo é função pura, sem rede, DOM ou relógio, e roda tanto no navegador quanto em `node --test` (o Node 24 remove os tipos; por isso o módulo não usa propriedades de parâmetro nem `enum`).

### Contrato C1

Um `ResultadoLente` traz `lente`, `versao_metodo`, `carga` (id e identidade), `janela` (dias GMT inclusivos; na recorrência, também `meses`, os meses GMT tocados com a marca de parcial), `recorte` (`estado`, município `null`), `parametros` (nome e valor exibidos), `estado` (`com_destaques`, `sem_destaques` ou `janela_insuficiente`), `ordenacao` (só na concentração), `observacoes` (por exemplo, empatados incluídos), `destaques`, `conferencia` e `limitacoes`. A lente só é exibida se registros lidos, `id_tecnico` distintos e o total do resumo do mesmo recorte forem iguais.

Cada `Destaque` traz:

- `id_destaque`: lente + unidade, e o dia inicial na persistência (por exemplo `concentracao:municipio:5103254`, `recorrencia:celula_005:c-251_-1130` ou `persistencia:celula_005:c-251_-1130:2026-10-05`). Com carga, janela e `versao_metodo`, identifica o destaque; a combinação o preserva em cada célula;
- `unidade`: município (código e nome) ou célula `celula_005` (id `c<kLat>_<kLon>` e bordas em texto decimal);
- `motivo`, `evidencia` (`id_tecnico`, valor e datas), `ordem` (só na concentração), `cobertura` e `ressalvas`.

### Cobertura (qualificador, sem limiar)

Estados `pendente`, `completa` e `falha`. Em `completa`, "N de M dias sem evidência de lacuna (cobertura não comprovada)", com a lista dos demais dias. Um dia conta como sem evidência de lacuna só se todos os municípios considerados estiverem `sem_evidencia_de_lacuna` (D13). A classe do dia da unidade é a mais restritiva pela precedência D1 (T7), e o painel preserva a classe e os motivos de cada município. `falha` nunca mostra "N de M" parcial. A palavra "coberto" não é usada.

### Integridade da disponibilidade (T3)

A publicação garante a grade D1 completa (RS-3). Por isso a resposta de `consultar_disponibilidade` de um município precisa ter exatamente um dia por dia GMT da janela, no satélite da carga, sem repetição. Caso contrário é falha de leitura daquele município, e não evidência.

### Grade T1

Ancorada em 0° de latitude e de longitude; célula `[k·0,05; (k+1)·0,05)` em cada eixo, bordas sul e oeste incluídas. O valor canônico da coordenada é a representação decimal mais curta do `double` (`String(x)`). Ela é convertida para inteiro decimal com `BigInt`, e o índice sai de divisão inteira com piso, nunca de divisão em ponto flutuante (`-56,05 / 0,05` daria `-1120,9999999999998`). Notação exponencial, valor não finito e mais de 15 algarismos significativos são rejeitados.

Essa verificação protege só a conversão: dígitos perdidos na ingestão não são detectáveis no cliente. A conferência por `id_tecnico` contra o texto da fonte é que prova a grade para cada carga conferida.

### Concentração

Contagem dos registros principais da janela por município. Destaca os municípios com contagem maior que 0 e maior ou igual à do 10º colocado, incluindo todos os empatados no corte (D16). A exibição segue contagem decrescente, com desempate por nome e depois por código (T5). Rótulo: "ordenado por contagem de detecções, não por prioridade, gravidade ou risco". Limitação própria: "Contagem absoluta favorece municípios grandes".

### Recorrência

Conta, por célula de 0,05° (grade T1), os meses GMT distintos com detecção principal na janela; o mês de cada detecção vem de `data_hora_gmt` (uma detecção às 02:00Z de 01/09 conta para setembro, embora ainda seja 31/08 em Cuiabá). Destaca as células com detecções em pelo menos 3 meses (k=3, Q5).

- **Meses tocados (D14):** todo mês GMT que cruza a janela conta, inclusive o parcial. A janela de 15/08 a 14/10 toca 3 meses e roda, com agosto e outubro marcados como parciais no resultado (`janela.meses`), nas observações e na ressalva de cada destaque que tem detecção num mês parcial ("inclui mês parcial: ago/2026 (janela de 15/08 a 31/08)").
- **Janela insuficiente:** janela que toca menos de 3 meses GMT tem estado `janela_insuficiente`, sem destaques, com o texto "A janela toca N meses GMT; a recorrência exige pelo menos 3". Os registros são lidos e conferidos do mesmo modo.
- **Evidência:** todos os `id_tecnico` da célula na janela, o número de meses (`valor`) e os meses (`datas`, `AAAA-MM`). No painel, a tabela das detecções é paginada (20 por página) e declara "N de M".
- **Cobertura (D13):** os municípios considerados são os das detecções da célula na janela; o painel os lista. A união conservadora e a classe mais restritiva (T7) são as do qualificador comum.
- **Ordem (T5):** pelo código da célula, de norte a sul (índice de latitude decrescente) e depois de oeste a leste; nunca pelo número de meses. A lista declara que não é ranking, e `ordenacao` é `null`.
- **Coordenada inválida:** fora da forma canônica de T1, não é classificada; a lente inteira fica "leitura inconsistente", sem destaques parciais.
- **Limitações próprias das células:** "Focos vizinhos em células diferentes não são lidos como o mesmo local; a célula não segue divisas" e "A cobertura da célula usa os municípios das detecções, não a área da célula".

### Persistência

Por célula de 0,05° (grade T1), os dias GMT com detecção principal na janela; o dia de cada detecção vem de `data_hora_gmt` (uma detecção às 02:00Z de 07/10 conta para o dia GMT 07). Cada sequência maximal de 3 ou mais dias GMT consecutivos é um destaque próprio (Q6, T6), identificado pela célula e pelo dia inicial.

- **Interrupção (D15, refinando Q6):** só um dia **sem** detecção na célula interrompe, qualquer que seja sua classe. Um dia com detecção nunca interrompe. Por isso a disponibilidade não muda quais sequências são destacadas, só as ressalvas. Não se infere detecção em dia sem informação: dias 10 e 11, dia 12 indeterminado sem detecção e dia 13 não formam sequência.
- **Ressalvas por classe (D15, T7):** aplicadas na qualificação (`ressalvasDeClasse`), sobre a classe do dia da célula, que é a mais restritiva entre os municípios considerados. Valem para os dias da sequência ("inclui dia indeterminado (DD/MM)" ou "inclui dia com lacuna conhecida (DD/MM)") e para os vizinhos imediatos dentro da janela, que não têm detecção porque a sequência é maximal ("adjacente a dia indeterminado (DD/MM); pode ser mais longa" ou "adjacente a dia com lacuna conhecida (DD/MM); pode ser mais longa"). A classe observada nunca é trocada. No painel, cada uma lista os municípios do dia, com classe e motivos de cada um.
- **Cobertura não verificada:** enquanto a cobertura do destaque não está `completa` (pendente ou falha), a ressalva única "ressalvas de disponibilidade ainda não verificadas" substitui as de D15. A seleção não muda.
- **Borda (T4):** sequência que começa no primeiro ou termina no último dia da janela recebe "sequência no limite da janela; pode ser mais longa". Vem da seleção e permanece com qualquer estado da cobertura.
- **Evidência:** os `id_tecnico` dos dias da sequência, o número de dias (`valor`) e os dias (`datas`, `AAAA-MM-DD`). O painel mostra a mesma tabela paginada da recorrência.
- **Cobertura (D13):** os municípios considerados são os de todas as detecções da célula na janela, não só os da sequência.
- **Ordem (T5):** pela data de início da sequência e depois pela célula (norte→sul, oeste→leste); nunca pelo número de dias. `ordenacao` é `null`, e a lista declara que não é ranking.
- **Coordenada inválida e limitações das células:** como na recorrência.

### Combinação

Combina 2 ou 3 lentes por interseção ("e") ou união ("ou"), sempre por célula de 0,05° (grade T1). O tipo `ResultadoCombinacao` é novo e fica em `combinacao.ts`: ele reutiliza `TipoLente`, `CargaLente`, `Janela`, `Cobertura` e a célula de `grade.ts`, sem alterar C1, as três lentes nem `lentes-004-v1`. A versão própria é `combinacao-005-v1`.

- **Entrada (T8):** `combinar(entrada, lentes, operador)` recebe a `EntradaLente` já lida e conferida e **calcula ela mesma** as lentes escolhidas, com os parâmetros de produção (N=10 na concentração). Não recebe resultados de lente prontos nem faz nova leitura, de modo que toda evidência vem dos mesmos registros. A conferência C-3/C-4 de cada lente e a coordenada fora da forma canônica lançam `ErroLente` ("leitura inconsistente"); nada é exibido. Só os casos de referência usam `calcularCombinacao`, que recebe o `n` da concentração.
- **Escolha (T10):** 2 ou 3 lentes distintas e um operador `e` ou `ou`. As lentes do resultado seguem a ordem canônica concentração, recorrência e persistência, qualquer que seja a ordem da escolha. Menos de 2 lentes, lente repetida ou desconhecida e outro operador lançam `ErroCombinacao` (`entrada_invalida`).
- **Pertinência por lente (T9):**
  - concentração, por projeção P1: a célula entra se tiver pelo menos 1 detecção de município destacado (inclusive os empatados de D16), mesmo que seja minoria. A evidência são só os `id_tecnico` desses municípios na célula;
  - recorrência: a célula do destaque, com a evidência do destaque;
  - persistência (S1): a célula entra se tiver pelo menos uma sequência.
- **Estados (T11):**
  - `indisponivel`: alguma lente escolhida está `janela_insuficiente` (hoje, só a recorrência), com qualquer operador. A lista `indisponibilidade` nomeia a lente ("recorrência não se aplica a esta janela: a janela toca 1 mês GMT; a recorrência exige pelo menos 3"), e não há células;
  - `sem_celulas`: as lentes rodaram e o conjunto combinado ficou vazio. O texto (`textoSemCelulas`) depende do operador: "Nenhuma célula destacada por todas as lentes escolhidas nesta janela." no "e" e "Nenhuma célula destacada por qualquer das lentes escolhidas nesta janela." no "ou", os dois seguidos de "Isso não indica ausência de focos nem de risco.";
  - `com_celulas`: uma ou mais células.
- **Célula combinada (T14):** `id_combinado` (`combinacao:<operador>:<lentes unidas por +>:celula_005:<id>`), `unidade`, `criterios` (um por lente que destacou a célula, na ordem canônica; no "e", um por lente escolhida), `evidencia.deteccoes` (união ordenada, sem repetição), `municipios` (os de todas as detecções da célula na janela) e `cobertura`. Cada critério tem `lente`, `ressalvas` (só a de projeção, na concentração) e `destaques`: um item por destaque original que levou a célula a entrar, com `id_destaque`, `motivo`, `evidencia` (`deteccoes` na célula e `datas`) e `ressalvas`. Na concentração, um item por município destacado com detecção na célula, em ordem de código IBGE, com o motivo "6 detecções nesta célula de Colniza, município destacado pela concentração (901 detecções na janela; corte em 10, com empatados)", sem a posição do município. Na recorrência, um item. Na persistência, um item por sequência, pela data de início.
- **Ressalva de projeção:** quando a célula tem detecções de município não destacado, o critério da concentração traz "a célula também tem 4 de 10 detecções de município não destacado pela concentração".
- **Cobertura e ressalvas (V1, T12):** `qualificarCombinacao(resultado, disponibilidade)` aplica o qualificador comum aos municípios de todas as detecções da célula, sempre sobre o resultado de `combinar` (como `qualificar` nas lentes). A seleção nunca depende da cobertura. As ressalvas ficam por lente: a de mês parcial na recorrência (D14); a de borda (T4) e as por classe (D15, T7) na persistência, calculadas **sequência a sequência** com `ressalvasDeClasse(dias da sequência, janela, cobertura da célula)`. Enquanto a cobertura não está `completa`, cada sequência traz "ressalvas de disponibilidade ainda não verificadas".
- **Ordem (T13):** células de norte a sul e depois de oeste a leste. Não há campo de contagem de lentes, `ordem` nem `ordenacao`: a lista não é ranking.
- **Parâmetros e limitações:** `parametros` traz os de cada lente, sem edição, e, com a concentração, o da projeção. `limitacoes` traz as comuns, as das células, a da concentração quando ela está entre as lentes e as da combinação:
  - a limitação geral, com o efeito do operador (`LIMITACAO_OPERADOR`, R2-1 do plano `005`): no "e", "Combinar critérios com "e" torna a seleção mais específica, não mais verdadeira: só entram as células destacadas por todas as lentes escolhidas."; no "ou", "Combinar critérios com "ou" amplia a seleção, sem torná-la mais verdadeira: entram as células destacadas por qualquer das lentes escolhidas.". As duas terminam com "A lista não é ranking: células destacadas por mais lentes não são mais graves nem prioritárias.";
  - a de projeção, com a concentração;
  - "Nenhuma célula em comum não indica ausência de focos nem de risco.", só no "e".
- **Disponibilidade:** `municipiosDaCombinacao` lista os municípios a ler para qualificar as células.

### Leitura e erros

O carregador chama `consultar_resumo` e pagina `consultar_deteccoes` (1.000 por página) com `p_municipio` `null`, carga fixada e a janela da aplicação.

- **Verificações por página:** eco de carga, período, município, limite e deslocamento; `total` igual ao do resumo; número de linhas; unicidade de `id_tecnico`; `data_hora_gmt` não decrescente, também entre páginas.
- **Desempate por `id_tecnico`:** não é conferido no cliente, porque o banco usa a collation `en_US` via ICU, que ignora pontuação e caixa. Duplicação e omissão são pegas pela unicidade e pela contagem.
- **Reaproveitamento:** o resumo é relido em toda aplicação, e registros em memória só são reaproveitados se o total for o mesmo.

Destino dos erros (`destinoErro`): `acesso_negado`, `sessao_expirada` e `sem_publicacao` vão ao tratamento global; `versao_substituida` limpa a consulta comum e a lente com a memória da carga. Os demais erros, e as falhas de verificação, ficam locais: a lente inteira no resumo ou nas páginas, o qualificador na disponibilidade, o contorno na geometria.

### Interface

No controlador (`src/app.ts`), uma terceira geração, `geracaoLente`, invalida a aplicação em curso. Ela sobe ao aplicar, ao escolher "Nenhuma", ao mudar a janela ou a carga e a cada mudança de sessão. A apresentação está em `src/apresentacao-lentes.ts`, e a camada do mapa (`definirDestaques`) é separada dos pontos da página. Guia em `docs/runbook.md`, seção 10.

A combinação (ciclo `005`, item 2) é a opção "Combinação de lentes" do mesmo seletor, com a apresentação em `src/apresentacao-combinacao.ts`:

- **Aplicação:** uma leitura (`lerRegistros`, com a memória da lente), `combinar` sobre a entrada conferida e, depois, a disponibilidade dos municípios das células (`municipiosDaCombinacao`), com `qualificarCombinacao` a cada resposta. A mesma `geracaoLente` invalida a aplicação.
- **Configuração (R1-7):** as lentes e o operador são lidos do formulário uma vez, no clique em "Aplicar lente". Editar o formulário depois não cancela nem muda o resultado; o cabeçalho mostra sempre a configuração do resultado, e o aviso "A configuração escolhida mudou; aplique de novo para atualizar." aparece enquanto o formulário diferir dela. Com menos de 2 lentes marcadas, só aparece "Escolha pelo menos 2 lentes para combinar.", sem tocar a aplicação em curso. "Tentar de novo" repete a configuração aplicada.
- **Lista e mapa:** 50 células por página ("Células X a Y de M."), na ordem T13, com as lentes que destacaram cada célula por nome e a cobertura; os retângulos ficam na camada de destaques, e a lista declara quantos foram desenhados. Selecionar pelo mapa leva a lista à página da célula.
- **Painel:** um bloco por critério e, dentro dele, um item por destaque original (cada sequência da persistência com as suas ressalvas e os municípios do dia), a cobertura da célula com os municípios usados e a tabela da evidência em união, paginada em 20, com a coluna "Lentes".
- **Estados (`data-estado-lente`):** `carregando`, `completo` ("Combinação concluída em X,X s."), `sem_celulas_em_comum` e `sem_celulas_destacadas` (textos de T11), `indisponivel` (nomeando a lente), `cobertura_nao_verificada`, `leitura_inconsistente`, `versao_substituida`, `falha` e `cancelada`.

### Testes

- `tests/unit/lentes.test.mjs`, com as fixtures fictícias de `tests/fixtures/lentes/`: casos C-1 a C-5, G-1, G-2, L-1 a L-3, V-1 a V-4, E-1, X-1, R-1 a R-4 (com coordenada inválida, conferência divergente, determinismo e união D13 na recorrência) e P-1 a P-8 (com a ressalva de cobertura pendente, coordenada inválida, conferência divergente e determinismo na persistência).
- `tests/e2e/05-lentes.spec.mjs`: lista, painel, recorte M1-a com filtro municipal ativo, concorrência, "Nenhuma", logout, página duplicada, falha de disponibilidade, acesso negado, sessão expirada, carga indisponível e R3-1; na recorrência, sobre uma carga fictícia de três meses, células, cobertura por união, evidência paginada, meses parciais, janela insuficiente e a recorrência aplicada com uma concentração ainda em leitura; na persistência, sobre uma carga fictícia de outubro, sequências por célula (duas na mesma célula), ordem por início, ressalvas por classe com os municípios do dia, borda da janela, falha de disponibilidade e a persistência aplicada com uma recorrência ainda em leitura.
- `tests/unit/combinacao.test.mjs`, com a fixture fictícia `tests/fixtures/lentes/combinacao.json`: casos CB-1 a CB-16 (operadores, pares, projeção P1 e empate, sequências com ressalvas próprias, indisponibilidade, interseção e união vazias, cobertura por união, pendente e falha, ressalvas por lente, entrada inconsistente ou inválida e determinismo) e o ponto de entrada de produção com N=10.
- `tests/e2e/06-combinacao.spec.mjs`, sobre uma carga fictícia de junho a outubro com 12 municípios inventados: "as três" com "e" e "ou", cabeçalho, parâmetros, limitações e ausência de ranking, lista paginada, painel por critério com a evidência em união, sequências com ressalvas próprias, os estados de T11, cobertura não verificada, leitura inconsistente, falha, cancelada, configuração alterada durante a aplicação (R1-7), concorrência com lente individual e com "Nenhuma", acesso negado, sessão expirada, versão substituída e acessibilidade a 360 e 390 px com toque, 200% e reflow a 320 px.
- Local, fora da CI: `npm run conferir:lentes`, `npm run conferir:combinacao` e `npm run medir:lentes` (no ciclo `005`, as três lentes e as 8 configurações da combinação).

### Limitações conhecidas

- A célula não segue divisas, e focos vizinhos em células diferentes não são lidos como o mesmo local.
- A cobertura de uma célula usa os municípios das detecções, não a área da célula.
- A cobertura da carga atual é uniforme entre municípios (79 dias indeterminados em toda MT), e o qualificador a exibe mesmo assim.
- O carregamento da janela inteira trafega os registros completos (medição no relatório do ciclo).
- Na combinação, as uniões com mais de mil células na janela inteira ("concentração ou recorrência", "concentração ou persistência" e "as três, ou") levam de 41 a 55 s no perfil do ADR-007, acima do orçamento de 20 s; os bytes ficam dentro. Desvio aceito pelo responsável no ciclo `005`, com a otimização adiada (relatório da combinação e task da issue #43).

## Fontes

| Fonte | Função | URL | Versão fixada | Limite de autoridade |
| :-- | :-- | :-- | :-- | :-- |
| Plano `004` | Regras de método e contrato | `_project/executed/004_contrato_lentes_selecao/004_plan.md` | v3 aprovado em 2026-11-11 | Autoridade das regras; esta KB não a substitui |
| Plano `005` | Regras e contrato da combinação | `_project/drafts/005_combinacao_criterios_selecao/005_plan.md` | v2 aprovado em 2026-11-11 | Autoridade das regras da combinação; esta KB não a substitui |
| KB-004 | Disponibilidade D1, H3 e "cobertura não comprovada" | `_project/knowledge/KB-004_metodo_recorte_focos_mt.md` | Ciclo `003` | Método da carga; não trata seleção |
| ADR-007 | Interface, gerações, versão fixada e perfil de medição | `_project/decisions/ADR-007_interface_consulta_prototipo.md` | Aceito no ciclo `003` | Decisão técnica da interface |

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-11-11 | `004` | Criação na implementação do item 1 (issue #33): contrato C1, cobertura, grade T1 e concentração |
| 2026-11-11 | `004` | Item 2 (issue #34): lente de recorrência, meses tocados pela janela, evidência paginada de célula e limitações das células |
| 2026-11-11 | `004` | Item 3 (issue #35): lente de persistência, ressalvas por classe (D15, T7) e de borda (T4) |
| 2026-11-11 | `004` | Encerramento: caminhos para `executed/`; verificação hospedada parcial registrada na task da issue #35 |
| 2026-11-12 | `005` | Item 1 (issue #42): combinação de lentes por célula, `ResultadoCombinacao` e `combinacao-005-v1`; limite de autoridade ajustado |
| 2026-11-12 | `005` | Item 2 (issue #43): interface da combinação, estados, E2E e limitação geral por operador (R2-1) |
