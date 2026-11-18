---
title: "Interface base: leitura completa do recorte, memória de recortes, lente ao escolher, saída da tabela de registros e centro da tela"
tags:
  - arquitetura
  - interface
  - acessibilidade
author: "Claude Code (Opus 5.5)"
module: "src"
last_updated: "2026-11-14"
origin_cycle: "007"
---

# ADR-009: Interface base — leitura completa do recorte, memória de recortes, lente ao escolher, saída da tabela de registros e centro da tela

## Status

Aceito. Criado no item 2 do plano `007` v4 (aprovado em 2026-11-14), issue #61, sob a autorização literal "autorizo a implementação da issue #61" de 2026-11-14, com as decisões desse item (T6, T7, T16 e T21, ratificadas na aprovação do plano). Completado e aceito no item 3, issue #62, sob a autorização literal "autorizo a implementação da issue #62" de 2026-11-14, com as decisões T8 a T10, T17 e T19 e o desvio de A7 decidido pelo responsável (limites em `intermediaria`). Vigora com a integração da PR da issue #62. Substitui parcialmente o ADR-007, que continua valendo em tudo o que este documento não revisa.

## Contexto

O ADR-007 fixou a interface do protótipo com o mapa mostrando exatamente a página corrente de uma tabela de registros (50 a 1.000 por página), a lente aplicada por botão e uma memória de lente única, para o recorte estadual. O plano `007` adota a organização da referência V13: o resultado fica numa coluna com as abas Destaques e Municípios, a explicação do destaque substitui o painel da lente, o mapa mostra todos os pontos do recorte (A4) e a tabela fixa sai (A5). Sem a tabela, os registros crus precisam de outra alternativa em texto, acessível por teclado (R3-1).

## Decisão

**Leitura completa do recorte (T7).** Todo recorte aplicado é lido por inteiro: resumo, disponibilidade do recorte e todas as páginas de registros (1.000 por página), conferidas pelo mesmo acumulador das lentes (eco de carga, período e município, total igual ao resumo, tamanho, unicidade e ordem). Lente, mapa, cartão do município e lista de focos usam essa mesma leitura quando o recorte é o mesmo. Leitura inconsistente ou incompleta mostra o estado de erro da consulta e nenhum ponto: nunca há mapa parcial. O painel fica pronto (M1) com o resumo, a série, a disponibilidade e a aba Municípios, antes dos pontos; o fim da leitura é o atributo `data-estado-pontos="completo"`. Pontos em canvas, todos na mesma camada canvas do mapa, para que o toque chegue ao ponto. Até o item 4, com município escolhido, mapa e cartão usam a leitura municipal e a lente usa a estadual (R3-2).

**Memória de recortes (T6).** As leituras completas ficam em `MemoriaRecortes` (`src/memoria.ts`), só em variáveis da página, nunca em `localStorage`, `sessionStorage`, IndexedDB ou cache HTTP. Chave: geração da sessão, carga, início, fim e município; até 3 recortes, o mais antigo sai. O resumo é sempre relido antes de qualquer reuso, e o reuso só ocorre se carga, recorte e total conferirem; essa releitura é a checagem que revela perda de acesso, sessão expirada e carga substituída. A disponibilidade por município, já validada, fica na mesma entrada. Logout, expiração, revogação, troca ou indisponibilidade de carga esvaziam a memória; respostas de gerações anteriores são descartadas antes de qualquer gravação e nunca a repõem. O acesso não muda (G2 `Não`): todo uso passa pela RPC sob RLS.

**Lente calculada ao escolher (A3, T16).** O botão "Aplicar lente" sai. Escolher a lente, a classe da sobreposição, as lentes da combinação ou o operador recalcula no recorte aplicado, com progresso, e a geração da lente descarta o cálculo anterior. Combinação com menos de 2 lentes não calcula nada e diz o que falta; nenhum resultado antigo fica visível como se fosse atual. Uma nova janela recalcula a lente depois da leitura da consulta, mesmo quando duas consultas seguem uma à outra. Configuração inicial como na V13, por decisão do responsável: sobreposição com "Proteção integral"; combinação com Concentração e Recorrência e o operador "e"; "Limpar tudo" volta a esses padrões e à aba Municípios.

**Coluna de resultado (T11, T15).** Abas **Destaques · N** e **Municípios**, no padrão de abas acessível (setas, Home e End). A tela abre em Municípios; escolher uma lente leva a Destaques. Destaques mostra o resumo da lente, a lista (células, ou municípios na concentração, com a ressalva de contagem absoluta junto do resultado), parâmetros e limitações; selecionar um item, na lista ou no mapa, abre a explicação na mesma aba — ficha, critérios (na combinação, quais lentes e o efeito do operador), motivo, evidência, disponibilidade, ressalvas, as detecções que sustentam o destaque (recolhíveis) e metadados — com "← Voltar aos destaques", que devolve a rolagem e o foco ao item. O estado da lente (com "Tentar de novo") fica acima das duas vistas. Municípios mostra a lista estadual ordenável por detecções, destaques da lente e nome (uma célula destacada conta em cada município com detecção nela; com a concentração, os destacados primeiro, na ordem do resultado) ou, com município escolhido, o cartão com focos, dias com foco, células com foco e células destacadas ("—" com "lente calculada em todo Mato Grosso" até o item 4; sem a linha na concentração).

**Limites municipais ligados por padrão (A7, T10), com desvio decidido pelo responsável.** A abertura continua sem geometria: os limites do estado são pedidos depois de `data-estado-painel="pronto"`, uma vez por sessão e carga, sem bloquear a consulta nem a lente; o fim é `data-estado-limites="completo"` (M5). A representação é a `intermediaria`, a única que a carga publicada guarda (`municipios.geometria_exibicao`): o plano previa `minima` para o estado, mas isso exigiria geometria fora do banco ou migração, e o responsável escolheu "Usar a intermediaria" em 2026-11-14. O município escolhido aparece com contorno destacado sobre o conjunto. A camada desliga em "Camadas"; desligada, só o contorno do município escolhido fica. Falha só nos limites desliga a camada, mostra o aviso próprio (`data-estado-limites="erro"`) e não toca pontos nem números; religar tenta de novo.

**Camadas e mapa ampliado (T17).** Os botões de limites e de áreas viram o menu "Camadas" da V13: limites municipais (ligada), áreas protegidas (desligada e sob demanda, como no plano 006), detecções individuais (ligada) e densidade por célula (desligada). O botão de ampliar, no alto à direita, esconde as colunas laterais e leva o foco ao mapa; Esc ou o mesmo botão voltam, com o foco no botão; abrir a explicação de um destaque volta sozinho, para a explicação aparecer.

**Densidade por célula (A9, T8, T19).** Contagem dos registros principais do recorte aplicado por célula T1 (0,05°), calculada da mesma leitura completa dos pontos, em cinco classes fixas (1 · 2–3 · 4–9 · 10–24 · 25 ou mais), iguais em qualquer filtro. Desenhada em painel e canvas próprios, abaixo de limites, destaques e pontos, sem interação. A legenda diz "Detecções por célula: contagem, não gravidade" e escreve o número de cada classe; o atributo `data-total` da legenda é a soma das contagens, igual a `principal.total`. Não entra em lente, ordenação nem explicação.

**Série do período (A6, T9, T19).** Barras diárias de `serie_diaria` em períodos de até 31 dias GMT; acima disso, uma barra por mês tocado, somando só os dias do período. Mês cortado pelo período leva `*`, coluna hachurada e a nota "* mês parcial: só os dias do período."; mês parcial sem detecção mostra "0 no período", e zero nunca é apresentado como lacuna (a disponibilidade fica no cartão próprio). O envelope da sensibilidade nunca entra; `data-total` da série é igual a `principal.total`. A tabela "Ver a série como tabela" continua como alternativa em texto.

**Saída da tabela de registros e "Lista de focos" (A5, T21).** A tabela paginada sai na mesma PR em que chegam todos os pontos. O botão "Lista de focos", no grupo de ferramentas do mapa, abre abaixo do mapa (decisão do responsável), sem cobri-lo, a lista textual dos registros principais do recorte, lida da leitura completa (sem nova consulta): dia e hora GMT, município, latitude, longitude e identificador, na ordem por dia e hora, em páginas locais de 50. Cada linha é um botão: Enter ou Espaço marca o ponto com o anel de seleção e anuncia o registro na região de status; Esc ou "Fechar" devolvem o foco ao botão. Tocar num ponto abre um balão com todos os registros daquela coordenada; o balão traz também a posição na borda, a divergência do INPE e o ID da fonte, que eram colunas da tabela.

## Emenda — ciclo `009` (2026-11-17)

Decisões do responsável no ciclo `009` (plano `009`, D1 a D5; issue #91, BL-017). Os parágrafos acima ficam como histórico; onde divergirem, vale esta emenda.

- **Abaixo do mapa:** saem os cartões "No mapa", "Detecções no período (dias GMT)" e "Disponibilidade dos dados". Fica a série, num cartão sem título visível. A frase de "Série do período" "a disponibilidade fica no cartão próprio" deixa de valer: zero continua nunca apresentado como lacuna, e a disponibilidade aparece na explicação de cada destaque e na aba "Comparação", não mais num cartão geral. Num recorte com zero detecções, sem lente e sem comparação, ela não aparece na tela.
- **Leitura completa (T7):** sem mudança. Resumo, disponibilidade e registros continuam lidos e conferidos juntos; o painel fica pronto com a série e a aba Municípios.
- **Coluna de resultado:** a aba "Destaques · N" passa a "Lentes · N", e o título do resultado é a opção ativa ("Concentração", "Recorrência", "Persistência", "Sobreposição com áreas protegidas" ou "Combinação de lentes"), também sem resultado. Ids e atributos (`#aba-destaques`, `#t-destaques`) não mudam.
- **Áreas protegidas:** a contagem por classe, o aviso e a atribuição (KB-006) ficam na "Legenda" do mapa; os dados da área clicada, num cartão abaixo do mapa só enquanto há área selecionada. A camada não mostra texto de estado nem "Tentar de novo": numa falha a caixa fica desmarcada, e religá-la tenta de novo. O mesmo vale para a falha dos limites.
- **Alternativa em texto do mapa:** a contagem de pontos e o registro selecionado continuam em `role="status"`, só para leitor de tela.


## Emenda — navegação municipal do ciclo `010` (2026-11-18)

Item 2 do plano `010` v2 aprovado e integrado na PR #96, issue #98 autorizada pelo responsável em 2026-11-18. Onde houver divergência na descrição da aba Municípios, vale esta emenda.

- Abrir uma linha estadual inspeciona o município sem aplicar o filtro. O detalhe guarda apenas código e estado da geometria. Usa o total do resumo estadual e a participação na lente ativa; uma célula pode contribuir em mais de um município com detecção nela. Dias com detecção e células T1 distintas só aparecem no recorte municipal aplicado, por `numerosMunicipio`.
- “Mostrar no mapa” reutiliza a geometria na memória ou chama `lerLimites` para o código na carga vigente, inclusive com camada desligada. `enquadrarMunicipio` calcula os limites da geometria para a câmera, sem desenhar nem modificar camadas, seleção ou filtros. Carregamento, ausência e falha ficam no detalhe. Retorno de detalhe encerrado ou de outra geração de consulta ou sessão não altera a tela ou a memória.
- “Consultar município” passa pela aplicação normal do formulário. “Ver todo Mato Grosso” restaura explicitamente o estado. “Ver destaques” abre Lentes com o escopo aplicado identificado; a inspeção estadual não transforma participação em resultado de lente municipal. A concentração continua exclusiva do estado.
- Voltar à lista restaura a ordenação, a rolagem da coluna e o foco na linha acionadora. Troca de recorte, carga ou sessão limpa o detalhe transitório. Inspecionar, voltar e enquadrar não alteram `chaveContexto` nem descartam perguntas e respostas do agente; aplicar filtro reutiliza a invalidação vigente. Nenhum método, fonte, leitura de registros ou contrato de acesso muda.

### Positivas

- O mapa deixa de declarar visualização parcial: mostra o recorte inteiro, com a mesma leitura que a lente usa.
- Trocar de lente no mesmo recorte não relê páginas (só o resumo); com Todo Mato Grosso, nem a primeira lente relê.
- Os registros crus continuam alcançáveis por teclado e leitor de tela, sem lente, pela "Lista de focos".
- Cada destaque tem uma explicação única, com o caminho de volta ao mesmo ponto da lista.
- Os limites aparecem sem pedido, sem atrasar o painel; densidade e série mostram o recorte com somas conferíveis em tela (`data-total`).

### Trade-offs

- A abertura lê todas as páginas do recorte (10.640 registros na janela inteira da carga real); o painel fica pronto antes, e o orçamento M4 (T14) limita o tempo até os pontos.
- Com município escolhido, a primeira lente ainda lê as páginas do estado (até o item 4).
- A memória guarda até 3 leituras completas na página; sai com a sessão, o acesso ou a versão.
- Posição na borda, divergência do INPE e ID da fonte passam a aparecer só no balão do ponto.
- Limites em `intermediaria`: cerca de 984 KB brutos e 5,3 s no perfil de celular do ADR-007, baixados em segundo plano a cada nova sessão (a `minima` custaria 237 KB e 1,6 s). M1 e M5 não foram medidas nesta entrega, por decisão do responsável.

## Alternativas consideradas

- **Manter a página de registros no mapa** (reserva do plano para estouro de desempenho): rejeitada enquanto T14 for cumprido; voltar a ela exigiria decisão do responsável.
- **Tabela fixa abaixo do mapa**: rejeitada em A5; a lista sob demanda (T21) é o painel opcional previsto ali.
- **Lista de focos em diálogo modal**: rejeitada pelo responsável, porque esconderia o mapa e o anel de seleção.
- **Memória em armazenamento do navegador**: rejeitada (ADR-007, G3); só variáveis da página.
- **Limites `minima` por arquivo estático do IBGE**: rejeitada pelo responsável; tiraria a geometria do banco, da carga e da RLS.
- **Coluna `minima` no banco**: exigiria migração, que o plano não prevê; ficaria para outro ciclo.
- **Densidade com cor relativa ao máximo do recorte** (como na V13): rejeitada em T8; a mesma cor deve significar o mesmo número em qualquer filtro.

## Referências

- Plano `_project/executed/007_interface_base/007_plan.md` (v4): A3 a A7, A9, T6 a T11, T14 a T17, T19 e T21; casos CM-1, CM-2, CM-5, CM-6, PG-1, LF-1, DS-1, DS-2 e SR-1 a SR-4.
- ADR-007 (interface do protótipo), revisado por este ADR nos pontos acima.
- Tasks `_project/executed/007_interface_base/007_task_issue-61.md` e `007_task_issue-62.md`.
- `DESIGN.md` (contrato visual).
