---
title: "Contrato de lente de seleção e método das lentes"
tags:
  - método
  - G1
  - lentes
  - seleção
author: "Claude Code (Opus 5.5)"
module: "src/lentes"
last_updated: "2026-11-11"
origin_cycle: "004"
---

# KB-005: Contrato de lente de seleção e método das lentes

## Finalidade

Registra o contrato único das lentes de seleção (C1) e como o módulo `src/lentes/` o implementa: entrada, saída, identidade dos destaques, qualificador de cobertura, grade e as lentes de concentração e recorrência. É consultada por quem implementar a próxima lente (persistência, issue #35), a combinação futura (BL-005) e por quem revisar G1. Conferência e medição com a carga real ficam em `_project/drafts/004_contrato_lentes_selecao/004_research_conferencia_lentes.md` (depois do encerramento, em `executed/`).

## Limite de autoridade

Conhecimento de referência. As regras de método são as do plano `004` v3, aprovado em 2026-11-11: decisões Q1 a Q12 e D13 a D16, recorte M1-a e detalhes T1 e T3 a T7, ratificados na aprovação. Esta base descreve a implementação e não as altera; mudar parâmetro ou regra é nova decisão de G1, novo plano e nova `versao_metodo`. Não decide limiares das lentes seguintes, combinação de lentes nem contrato visual. Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração, e nada aqui prioriza áreas.

## Conteúdo

### Módulos

| Módulo | Papel |
| :-- | :-- |
| `contrato.ts` | Tipos do contrato C1, `VERSAO_METODO` (`lentes-004-v1`), limitações comuns e rótulo de ordenação |
| `grade.ts` | Grade T1 de 0,05° com aritmética decimal exata |
| `cobertura.ts` | Qualificador de cobertura (D13, T3 e T7) e seu texto |
| `comum.ts` | Conferência da entrada, aplicação do qualificador e estado agregado |
| `concentracao.ts` | Lente de concentração |
| `recorrencia.ts` | Lente de recorrência, meses GMT tocados pela janela e seus rótulos |
| `carregar.ts` | Leitura no recorte M1-a, verificações por resposta, integridade T3, destino dos erros e concorrência limitada |

Tudo é função pura, sem rede, DOM ou relógio, e roda tanto no navegador quanto em `node --test` (o Node 24 remove os tipos; por isso o módulo não usa propriedades de parâmetro nem `enum`).

### Contrato C1

Um `ResultadoLente` traz `lente`, `versao_metodo`, `carga` (id e identidade), `janela` (dias GMT inclusivos; na recorrência, também `meses`, os meses GMT tocados com a marca de parcial), `recorte` (`estado`, município `null`), `parametros` (nome e valor exibidos), `estado` (`com_destaques`, `sem_destaques` ou `janela_insuficiente`), `ordenacao` (só na concentração), `observacoes` (por exemplo, empatados incluídos), `destaques`, `conferencia` e `limitacoes`. A lente só é exibida se registros lidos, `id_tecnico` distintos e o total do resumo do mesmo recorte forem iguais.

Cada `Destaque` traz:

- `id_destaque`: lente + unidade (por exemplo `concentracao:municipio:5103254` ou `recorrencia:celula_005:c-251_-1130`). Com carga, janela e `versao_metodo`, é a chave da combinação futura;
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

### Leitura e erros

O carregador chama `consultar_resumo` e pagina `consultar_deteccoes` (1.000 por página) com `p_municipio` `null`, carga fixada e a janela da aplicação.

- **Verificações por página:** eco de carga, período, município, limite e deslocamento; `total` igual ao do resumo; número de linhas; unicidade de `id_tecnico`; `data_hora_gmt` não decrescente, também entre páginas.
- **Desempate por `id_tecnico`:** não é conferido no cliente, porque o banco usa a collation `en_US` via ICU, que ignora pontuação e caixa. Duplicação e omissão são pegas pela unicidade e pela contagem.
- **Reaproveitamento:** o resumo é relido em toda aplicação, e registros em memória só são reaproveitados se o total for o mesmo.

Destino dos erros (`destinoErro`): `acesso_negado`, `sessao_expirada` e `sem_publicacao` vão ao tratamento global; `versao_substituida` limpa a consulta comum e a lente com a memória da carga. Os demais erros, e as falhas de verificação, ficam locais: a lente inteira no resumo ou nas páginas, o qualificador na disponibilidade, o contorno na geometria.

### Interface

No controlador (`src/app.ts`), uma terceira geração, `geracaoLente`, invalida a aplicação em curso. Ela sobe ao aplicar, ao escolher "Nenhuma", ao mudar a janela ou a carga e a cada mudança de sessão. A apresentação está em `src/apresentacao-lentes.ts`, e a camada do mapa (`definirDestaques`) é separada dos pontos da página. Guia em `docs/runbook.md`, seção 10.

### Testes

- `tests/unit/lentes.test.mjs`, com as fixtures fictícias de `tests/fixtures/lentes/`: casos C-1 a C-5, G-1, G-2, L-1 a L-3, V-1 a V-4, E-1, X-1 e R-1 a R-4 (com coordenada inválida, conferência divergente, determinismo e união D13 na recorrência).
- `tests/e2e/05-lentes.spec.mjs`: lista, painel, recorte M1-a com filtro municipal ativo, concorrência, "Nenhuma", logout, página duplicada, falha de disponibilidade, acesso negado, sessão expirada, carga indisponível e R3-1; na recorrência, sobre uma carga fictícia de três meses, células, cobertura por união, evidência paginada, meses parciais, janela insuficiente e a recorrência aplicada com uma concentração ainda em leitura.
- Local, fora da CI: `npm run conferir:lentes` e `npm run medir:lentes`.

### Limitações conhecidas

- A célula não segue divisas, e focos vizinhos em células diferentes não são lidos como o mesmo local.
- A cobertura de uma célula usa os municípios das detecções, não a área da célula.
- A cobertura da carga atual é uniforme entre municípios (79 dias indeterminados em toda MT), e o qualificador a exibe mesmo assim.
- O carregamento da janela inteira trafega os registros completos (medição no relatório do ciclo).

## Fontes

| Fonte | Função | URL | Versão fixada | Limite de autoridade |
| :-- | :-- | :-- | :-- | :-- |
| Plano `004` | Regras de método e contrato | `_project/drafts/004_contrato_lentes_selecao/004_plan.md` | v3 aprovado em 2026-11-11 | Autoridade das regras; esta KB não a substitui |
| KB-004 | Disponibilidade D1, H3 e "cobertura não comprovada" | `_project/knowledge/KB-004_metodo_recorte_focos_mt.md` | Ciclo `003` | Método da carga; não trata seleção |
| ADR-007 | Interface, gerações, versão fixada e perfil de medição | `_project/decisions/ADR-007_interface_consulta_prototipo.md` | Aceito no ciclo `003` | Decisão técnica da interface |

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-11-11 | `004` | Criação na implementação do item 1 (issue #33): contrato C1, cobertura, grade T1 e concentração |
| 2026-11-11 | `004` | Item 2 (issue #34): lente de recorrência, meses tocados pela janela, evidência paginada de célula e limitações das células |
