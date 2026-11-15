---
title: "Contrato de lente de seleção e método das lentes"
tags:
  - método
  - G1
  - lentes
  - seleção
author: "Claude Code (Opus 5.5)"
module: "src/lentes"
last_updated: "2026-11-14"
origin_cycle: "004"
---

# KB-005: Contrato de lente de seleção e método das lentes

## Finalidade

Registra o contrato único das lentes de seleção (C1) e como o módulo `src/lentes/` o implementa: entrada, saída, identidade dos destaques, qualificador de cobertura, grade, as lentes de concentração, recorrência e persistência e a combinação delas por célula (ciclo `005`). É consultada por quem implementar uma lente nova ou mexer na combinação e por quem revisar G1. Conferência e medição com a carga real ficam em `_project/executed/004_contrato_lentes_selecao/004_research_conferencia_lentes.md` (lentes) e em `_project/executed/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md` (combinação).

## Limite de autoridade

Conhecimento de referência. As regras das lentes são as do plano `004` v3, aprovado em 2026-11-11: decisões Q1 a Q12 e D13 a D16, recorte M1-a e detalhes T1 e T3 a T7, ratificados na aprovação. As regras da combinação são as do plano `005` v2, aprovado em 2026-11-11: decisões Q1 a Q9 da ideação `005` e detalhes T8 a T14, ratificados na aprovação. As regras da sobreposição são as do plano `006` v5, aprovado em 2026-11-12: T22, T23 e T25 e os casos SB, ratificados na aprovação; mudá-las exige nova decisão de G1 e nova versão além de `sobreposicao-006-v1`. Esta base descreve a implementação e não as altera; mudar parâmetro ou regra de uma lente é nova decisão de G1, novo plano e nova `versao_metodo`, e mudar regra da combinação é nova decisão de G1, novo plano e nova `versao_combinacao`. Não decide limiares de lentes futuras, pontuação ou pesos nem contrato visual. Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração, e nada aqui prioriza áreas.

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
| `carregar-areas.ts` | Leitor T25 das áreas protegidas e dos vínculos da carga fixada (ciclo `006`), com conferência por página e diagnóstico da ausência da linha da carga |
| `sobreposicao.ts` | Lente de sobreposição com áreas protegidas (ciclo `006`): `ResultadoSobreposicao`, `VERSAO_SOBREPOSICAO` (`sobreposicao-006-v1`), `sobreposicao` e `qualificarSobreposicao` |

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

### Sobreposição

Lente de sobreposição com áreas protegidas, do plano `006` (T22, T23 e T25). Fica fora de `TipoLente` e da combinação (K1): `validarEscolha` a trata como lente desconhecida, e C1, as três lentes, `lentes-004-v1` e `combinacao-005-v1` não mudam. A versão própria é `sobreposicao-006-v1`.

- **Entrada:** `sobreposicao(entrada, camada, classe)` recebe a `EntradaLente` já lida e conferida, a camada lida por `lerAreas` e uma das classes `protecao_integral`, `uso_sustentavel` ou `terra_indigena`. A lente não usa geometria: os vínculos detecção × área vêm prontos da carga, calculados com o polígono integral da fonte (KB-006).
- **Regra (S1):** para a classe, uma célula T1 é destacada se tiver pelo menos uma detecção principal da janela vinculada a uma área da classe, com a borda incluída. Vínculos de detecções fora da janela são ignorados. O identificador é `sobreposicao:<classe>:celula_005:<id>`. A ordem é a T5, sem ordem por área ou por contagem e sem `ordem` nem `ordenacao`.
- **Resultado (`ResultadoSobreposicao`):** `lente: 'sobreposicao'`, `versao_metodo`, `classe`, `carga`, `janela`, `recorte` (M1-a), `parametros`, `estado` (`com_destaques`, `sem_destaques` ou `sem_camada`), `destaques`, `conferencia` (a de C1, mais `areas_lidas` e `vinculos_lidos`) e `limitacoes`.
- **Destaque:** o `Destaque` de C1 mais `areas`, uma entrada por área da classe com vínculo na célula, em ordem de chave: `chave` (`<fonte>:<código>`), `nome`, `classe`, `categoria_ou_fase`, `esfera` (nula na terra indígena), `qualidade_poligono`, `deteccoes` (ordenadas), `na_borda` e `ressalvas`. `evidencia.deteccoes` é a união ordenada, sem repetição, e `evidencia.valor` é o tamanho dela; `datas` fica vazia.
- **Textos (T23):** o motivo tem um trecho por área, separados por "; ": "4 de 10 detecções desta célula dentro de <nome> (proteção integral, <categoria>, <esfera>)" ou "… dentro da Terra Indígena <nome> (fase: <fase>)". Categoria, esfera e fase aparecem como na fonte, sem conversão de caixa. As ressalvas por área são a do limite estimado e a da representação esquemática (pelo `quali_pol` do CNUC) e "N detecção(ões) exatamente sobre o limite da área". No destaque, cada ressalva leva o nome exibido da área como prefixo ("<nome>: …"). O estado sem destaques usa `textoSemDestaques(classe)`; a carga sem camada, `TEXTO_SEM_CAMADA`.
- **Limitações:** a de domínio, com o acréscimo sobre infração, autoria e situação fundiária; as comuns e as das células; retrato datado da fonte; polígono integral na classificação e contorno simplificado no mapa; áreas que não entram; SIRGAS 2000 e WGS84; e "a lista não é ranking". O retrato é citado como "CNUC e FUNAI; versão e data no cartão de Proveniência", porque a lente não recebe as fontes.
- **Cobertura:** `qualificarSobreposicao` aplica o qualificador comum aos municípios de todas as detecções da célula na janela (D13); `municipiosDaSobreposicao` lista os municípios a ler. A seleção não depende da cobertura.
- **Erros:** área, vínculo ou camada de outra carga, vínculo para área não lida, vínculo ou área repetidos, qualidade de polígono fora dos três valores do CNUC e coordenada fora da forma canônica lançam `ErroLente`. Classe fora das três lança `ErroEntradaSobreposicao`, subclasse de `ErroLente` ("entrada inválida"). Nada é exibido.

**Leitor T25 (`lerAreas`):**

- lê a linha da carga em `cargas` (id, identidade e totais). Totais nulos dão `sem_camada`, sem ler as tabelas; nulidade parcial é `ErroLente`;
- com totais, pagina `areas` e `deteccoes_areas` em 1.000 linhas, pela chave primária completa, com contagem exata. Cada página tem de ter o total declarado na carga, min(1.000, total − deslocamento) linhas, só linhas da carga pedida e chaves inéditas. Ao fim, todo vínculo aponta para área lida. Linha de outra carga é `ErroLente` direto;
- página curta (inclusive HTTP 416 `PGRST103`), total divergente ou chave repetida levam a reler a linha da carga. Presente, é `ErroLente`. Ausente, a sondagem existente (`sondarAcesso`) decide: `negado` dá `acesso_negado`; `sem_publicacao` dá `sem_publicacao`; erro de sessão propaga `sessao_expirada`; `autorizado` consulta `publicacao_vigente`, e vigente diferente dá `versao_substituida`, igual dá `ErroLente`. Os diagnósticos são `ErroConsulta` e seguem `destinoErro`. Nunca há resultado parcial.

As fontes do leitor são injetadas. A implementação sobre a API (supabase-js) usada pelo teste da API e pela conferência está em `scripts/lentes/fontes-areas.mjs`; a da interface, do item 4, é `fontesAreas` em `src/consulta.ts`, com `lerContornoReal` para o contorno real de uma área. `diagnosticarAusencia` é exportada para que a linha de área ausente na leitura do contorno siga o mesmo diagnóstico.

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
- **Configuração (R1-7; revista no ciclo 007, ADR-009 e T16):** desde o ciclo 007 não há botão "Aplicar lente": escolher a combinação, as lentes ou o operador recalcula, com descarte do cálculo anterior pela `geracaoLente`, e com menos de 2 lentes nada é calculado (estado `incompleta`). O texto a seguir descreve a regra dos ciclos 005 e 006: as lentes e o operador eram lidos do formulário uma vez, no clique em "Aplicar lente". Editar o formulário depois não cancela nem muda o resultado; o cabeçalho mostra sempre a configuração do resultado, e o aviso "A configuração escolhida mudou; aplique de novo para atualizar." aparece enquanto o formulário diferir dela. Com menos de 2 lentes marcadas, só aparece "Escolha pelo menos 2 lentes para combinar.", sem tocar a aplicação em curso. "Tentar de novo" repete a configuração aplicada.
- **Lista e mapa:** 50 células por página ("Células X a Y de M."), na ordem T13, com as lentes que destacaram cada célula por nome e a cobertura; os retângulos ficam na camada de destaques, e a lista declara quantos foram desenhados. Selecionar pelo mapa leva a lista à página da célula.
- **Painel:** um bloco por critério e, dentro dele, um item por destaque original (cada sequência da persistência com as suas ressalvas e os municípios do dia), a cobertura da célula com os municípios usados e a tabela da evidência em união, paginada em 20, com a coluna "Lentes".
- **Estados (`data-estado-lente`):** `carregando`, `completo` ("Combinação concluída em X,X s."), `sem_celulas_em_comum` e `sem_celulas_destacadas` (textos de T11), `indisponivel` (nomeando a lente), `cobertura_nao_verificada`, `leitura_inconsistente`, `versao_substituida`, `falha` e `cancelada`.

A sobreposição (ciclo `006`, item 4, T24) é a opção "Sobreposição com áreas protegidas" do mesmo seletor, com a apresentação em `src/apresentacao-areas.ts`:

- **Aplicação:** a classe é lida do grupo de rádio ao escolher a lente ou a classe (desde o ciclo 007; antes, no clique em "Aplicar lente"), com "Proteção integral" marcada de início. Uma leitura dos registros (com a memória da lente), a camada da carga por `lerAreas` sem geometria, `sobreposicao` sobre a entrada conferida e a disponibilidade dos municípios das células (`municipiosDaSobreposicao`), com `qualificarSobreposicao` a cada resposta. A mesma `geracaoLente` invalida a aplicação; "Tentar de novo" repete a classe aplicada.
- **Lista e mapa:** 50 células por página, na ordem T5, com as detecções vinculadas e o nome das áreas; retângulos na camada de destaques. Selecionar pelo mapa leva a lista à página da célula.
- **Painel e contornos:** motivo, um bloco por área citada, cobertura, aviso de domínio e evidência em 20 por página, com a coluna "Áreas". Ao abrir uma célula, a interface baixa o contorno real de cada `areas[].chave` (uma requisição por área) e o guarda por carga e chave enquanto a sessão for a mesma; reabrir não repete, e uma falha não fica na memória. Falha no contorno é local ("contorno real indisponível"); sessão, acesso e versão seguem `destinoErro`.
- **Estados:** os da lente, com `carregando` na etapa "áreas protegidas e vínculos", `sem_camada` (carga com `total_areas` nulo, sem ler as tabelas) e `versao_substituida` com o texto "Lente cancelada: …".
- **Camada:** a visão geral do mapa usa o mesmo leitor, com a geometria geral, e não depende da lente. Sair, expirar, perder o acesso ou trocar de versão limpam camada, contornos e a memória das áreas.

### Testes

- `tests/unit/lentes.test.mjs`, com as fixtures fictícias de `tests/fixtures/lentes/`: casos C-1 a C-5, G-1, G-2, L-1 a L-3, V-1 a V-4, E-1, X-1, R-1 a R-4 (com coordenada inválida, conferência divergente, determinismo e união D13 na recorrência) e P-1 a P-8 (com a ressalva de cobertura pendente, coordenada inválida, conferência divergente e determinismo na persistência).
- `tests/e2e/05-lentes.spec.mjs`: lista, painel, recorte M1-a com filtro municipal ativo, concorrência, "Nenhuma", logout, página duplicada, falha de disponibilidade, acesso negado, sessão expirada, carga indisponível e R3-1; na recorrência, sobre uma carga fictícia de três meses, células, cobertura por união, evidência paginada, meses parciais, janela insuficiente e a recorrência aplicada com uma concentração ainda em leitura; na persistência, sobre uma carga fictícia de outubro, sequências por célula (duas na mesma célula), ordem por início, ressalvas por classe com os municípios do dia, borda da janela, falha de disponibilidade e a persistência aplicada com uma recorrência ainda em leitura.
- `tests/unit/combinacao.test.mjs`, com a fixture fictícia `tests/fixtures/lentes/combinacao.json`: casos CB-1 a CB-16 (operadores, pares, projeção P1 e empate, sequências com ressalvas próprias, indisponibilidade, interseção e união vazias, cobertura por união, pendente e falha, ressalvas por lente, entrada inconsistente ou inválida e determinismo) e o ponto de entrada de produção com N=10.
- `tests/e2e/06-combinacao.spec.mjs`, sobre uma carga fictícia de junho a outubro com 12 municípios inventados: "as três" com "e" e "ou", cabeçalho, parâmetros, limitações e ausência de ranking, lista paginada, painel por critério com a evidência em união, sequências com ressalvas próprias, os estados de T11, cobertura não verificada, leitura inconsistente, falha, cancelada, configuração alterada durante a aplicação (R1-7), concorrência com lente individual e com "Nenhuma", acesso negado, sessão expirada, versão substituída e acessibilidade a 360 e 390 px com toque, 200% e reflow a 320 px.
- `tests/unit/sobreposicao.test.mjs`, com a fixture fictícia `tests/fixtures/lentes/sobreposicao.json`: casos SB-1 a SB-16 do plano `006`. Cobrem regra S1, borda, duas classes, duas áreas da mesma classe, terra indígena, janela, sem destaques, ordem T5, cobertura, entrada inconsistente ou inválida, determinismo, combinação intacta, carga sem camada, paginação completa e leitura incompleta com o diagnóstico da ausência, inclusive a resposta 416.
- `tests/e2e/07-areas.spec.mjs`, sobre uma carga fictícia de outubro com quatro áreas inventadas e 58 vínculos escritos à mão: camada sob demanda, legenda, atribuição, área selecionada e contorno real de uma área; as três classes, lista paginada, painel com motivo por área, ressalvas de polígono estimado e de borda, evidência sem duplicação e dois contornos numa célula com duas áreas, sem repetir ao reabrir; os estados de T24 (sem destaques, sem camada, cobertura não verificada, leitura inconsistente, falha, cancelada e versão substituída), concorrência com outra lente e com "Nenhuma", perda de acesso entre a leitura das áreas e a dos vínculos (acesso negado, nunca versão substituída), sessão expirada e acessibilidade a 360 e 390 px com toque, 200% e reflow a 320 px.
- `scripts/banco/api.test.mjs` (em `test:rls`): o leitor T25 pela API local, numa carga fictícia com 1.201 vínculos (SB-15), e a revogação da autorização entre páginas, que termina em `acesso_negado` (R3-1).
- Local, fora da CI: `npm run conferir:lentes`, `npm run conferir:combinacao`, `npm run conferir:sobreposicao` e `npm run medir:lentes` (no ciclo `005`, as três lentes e as 8 configurações da combinação).

### Limitações conhecidas

- A célula não segue divisas, e focos vizinhos em células diferentes não são lidos como o mesmo local.
- A cobertura de uma célula usa os municípios das detecções, não a área da célula.
- A cobertura da carga atual é uniforme entre municípios (79 dias indeterminados em toda MT), e o qualificador a exibe mesmo assim.
- O carregamento da janela inteira trafega os registros completos (medição no relatório do ciclo).
- Na combinação, as uniões com mais de mil células na janela inteira ("concentração ou recorrência", "concentração ou persistência" e "as três, ou") levam de 41 a 55 s no perfil do ADR-007, acima do orçamento de 20 s; os bytes ficam dentro. Desvio aceito pelo responsável no ciclo `005`, com a otimização adiada (relatório da combinação e task da issue #43).
- A verificação hospedada da combinação foi dispensada pelo responsável no encerramento do ciclo `005`; não há identidade integral nem medições de produção conferidas. O comportamento hospedado não está atestado (task de encerramento do ciclo `005`).
- Na sobreposição, a classe terra indígena levou 42,3 s no perfil do ADR-007 (acima do orçamento de 20 s) devido a 51 consultas municipais de disponibilidade; desvio aceito pelo responsável no ciclo `006`, com progresso visível e otimização adiada (relatório da sobreposição e task da issue #52).
- A verificação hospedada da sobreposição e da camada de áreas foi dispensada pelo responsável no encerramento do ciclo `006`; não há resultados de produção observados nem atestados (task de encerramento do ciclo `006`).

## Fontes

| Fonte | Função | URL | Versão fixada | Limite de autoridade |
| :-- | :-- | :-- | :-- | :-- |
| Plano `004` | Regras de método e contrato | `_project/executed/004_contrato_lentes_selecao/004_plan.md` | v3 aprovado em 2026-11-11 | Autoridade das regras; esta KB não a substitui |
| Plano `005` | Regras e contrato da combinação | `_project/executed/005_combinacao_criterios_selecao/005_plan.md` | v2 aprovado em 2026-11-11 | Autoridade das regras da combinação; esta KB não a substitui |
| Relatório `005` | Conferência independente e medição local | `_project/executed/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md` | Gerado em 2026-11-12 | Evidência local; não comprova comportamento hospedado |
| KB-004 | Disponibilidade D1, H3 e "cobertura não comprovada" | `_project/knowledge/KB-004_metodo_recorte_focos_mt.md` | Ciclo `003` | Método da carga; não trata seleção |
| ADR-007 | Interface, gerações, versão fixada e perfil de medição | `_project/decisions/ADR-007_interface_consulta_prototipo.md` | Aceito no ciclo `003` | Decisão técnica da interface |
| Plano `006` | Regras da sobreposição (T22, T23 e T25) e casos SB | `_project/executed/006_areas_protegidas_reais/006_plan.md` | v5 aprovado em 2026-11-12 | Autoridade das regras da sobreposição; esta KB não a substitui |
| Relatório `006` | Conferência independente da sobreposição | `_project/executed/006_areas_protegidas_reais/006_research_conferencia_areas.md` | Seção da issue #51, 2026-11-14 | Evidência local; não comprova comportamento hospedado |

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-11-11 | `004` | Criação na implementação do item 1 (issue #33): contrato C1, cobertura, grade T1 e concentração |
| 2026-11-11 | `004` | Item 2 (issue #34): lente de recorrência, meses tocados pela janela, evidência paginada de célula e limitações das células |
| 2026-11-11 | `004` | Item 3 (issue #35): lente de persistência, ressalvas por classe (D15, T7) e de borda (T4) |
| 2026-11-11 | `004` | Encerramento: caminhos para `executed/`; verificação hospedada parcial registrada na task da issue #35 |
| 2026-11-12 | `005` | Item 1 (issue #42): combinação de lentes por célula, `ResultadoCombinacao` e `combinacao-005-v1`; limite de autoridade ajustado |
| 2026-11-12 | `005` | Item 2 (issue #43): interface da combinação, estados, E2E e limitação geral por operador (R2-1) |
| 2026-11-12 | `005` | Encerramento: combinação e interface consolidadas; medição local com desvio de tempo aceito; verificação hospedada dispensada, sem resultados de produção |
| 2026-11-14 | `006` | Item 3 (issue #51): seção "Sobreposição", leitor T25 e `sobreposicao-006-v1`, sem interface |
| 2026-11-14 | `006` | Item 4 (issue #52): interface da sobreposição, fontes do leitor em `src/consulta.ts`, contornos reais sob demanda e E2E |
| 2026-11-14 | `006` | Encerramento: caminhos para `executed/`; sobreposição consolidada; desvio de tempo da terra indígena aceito; verificação hospedada dispensada |
