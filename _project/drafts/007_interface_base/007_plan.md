# Plano de Implementação — Interface base

> **Ciclo:** `007`
> **Status:** `Em Execução`
> **Versão:** `v4`
> **Data de criação:** 2026-11-14
> **Última atualização:** 2026-11-14
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 007" em 2026-11-14
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO COM RESSALVAS`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-14`
> **handoff_schema_version:** `2`

**Aprovação do plano — v4, 2026-11-14:** o responsável manifestou literalmente "aprovo o plano do ciclo 007", depois do veredito `APTO COM RESSALVAS` da rodada 4 (revisor: Codex, GPT-6).

A aprovação ratifica como decisões humanas de G1 e G3:

- T1 a T21, nas formas da v4, inclusive as mudanças em relação à V13 destacadas nas correções: a aba "Destaques" (T15), o cartão sem "focos em áreas protegidas" e com a contagem por célula distinta (T11), a ressalva de contagem absoluta junto da concentração (T15) e a "Lista de focos" sob demanda no lugar da tabela fixa (T21);
- os casos RC-1 a RC-12, DS-1 e DS-2, SR-1 a SR-4, CM-1 a CM-6, PG-1 e LF-1, com os valores esperados escritos neste plano;
- as versões `lentes-007-v1`, `combinacao-007-v1` e `sobreposicao-007-v1`.

Ratifica também o orçamento T14, com limites, desvios aceitos e paradas, o fatiamento em cinco issues na ordem 1 → 2 → 3 → 4 → 5, a ação humana externa do item 5 e a verificação em produção exigida.

**Ressalvas R4-1 e R4-2 incorporadas, sem mudar o escopo.**

- **R4-1:** a linha "Aprovar plano" dos pontos de aprovação passa a citar T21, e LF-1 está no aceite do item 2.
- **R4-2:** LF-1 começa **sem lente** e confere o **anúncio acessível** de cada um dos dois registros, que distingue horário e identificador, além do anel e do retorno do foco.

Cobre:

- a publicação da PR documental deste lote (ideação, plano e registro do ciclo);
- depois da integração documental, a conferência e a confirmação dos payloads das cinco issues com o responsável e sua criação;
- o encerramento, depois das entregas.

Não cobre merges, a implementação das issues, a ação humana externa nem a verificação em produção. Cada um desses passos tem frase própria.

**Confirmação dos payloads das issues — 2026-11-14:** depois da integração da PR #59, o responsável escreveu literalmente "confirmo os payloads dos itens 1 a 5". As cinco issues foram criadas com os payloads confirmados e as dependências registradas abaixo. Esta confirmação cobre a criação das issues, não a implementação.

**Autorização da correção — v4, 2026-11-14:** "corrija o plano do ciclo 007", depois do veredito `REQUER NOVA RODADA` da rodada 3 (revisor: Codex, GPT-6). A v4 responde a R3-1 a R3-3 (ver "Resposta do autor à rodada 3 — v4"), preserva as rodadas 1 a 3 e mantém o plano `Em Revisão`, aguardando a rodada 4. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova. Proposta destacada para a aprovação, que substitui a da v3: a tabela fixa continua fora da tela (A5), mas o mapa ganha um botão **"Lista de focos"**, que abre sob demanda a lista textual dos registros do recorte, acessível por teclado e leitor de tela (T21).

**Autorização da correção — v3, 2026-11-14:** "corrija o plano do ciclo 007", depois do veredito `REQUER NOVA RODADA` da rodada 2 (revisor: Codex, GPT-6). A v3 responde a R2-1 a R2-5 (ver "Resposta do autor à rodada 2 — v3"), preserva as rodadas 1 e 2 e mantém o plano `Em Revisão`, aguardando a rodada 3. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova. Proposta destacada para a aprovação: com A5 (tabela fora da tela), os registros crus deixam de ser alcançáveis por teclado sem lente; os pontos continuam tocáveis no mapa (T7).

**Autorização da correção — v2, 2026-11-14:** "corrija o plano do ciclo 007", depois do veredito `REQUER NOVA RODADA` da rodada 1 (revisor: Codex, GPT-6). A v2 responde a R1-1 a R1-9 (ver "Resposta do autor à rodada 1 — v2"), preserva a rodada 1 e mantém o plano `Em Revisão`, aguardando a rodada 2. Autor: Claude Code (Opus 5.5). Nenhuma decisão humana nova: T1 a T20 e os casos de referência continuam propostas a ratificar na aprovação. Três propostas da v2 mudam o que o responsável viu na V13 e estão destacadas para a aprovação: a primeira aba passa a se chamar **Destaques** (T15); o cartão do município **não** mostra "focos em áreas protegidas" (T11); a ressalva de contagem absoluta volta, **só** junto do resultado da concentração (T15).

**Autorização do rascunho:** em 2026-11-14 o responsável escreveu "Desta forma, eu autorizo você a fazer o rascunho do plano do ciclo (007)", depois de decidir incluir a camada de densidade. A frase não é literalmente a da tabela de situações ("autorizo o rascunho do plano do ciclo 007"), mas nomeia o mesmo passo e o mesmo ciclo sem ambiguidade; o agente a aceitou e registra o texto exato para a conferência manual. Autor: Claude Code (Opus 5.5). Este rascunho não é aprovação do plano nem autorização de issue ou de implementação. Os detalhes técnicos T1 a T14 e os casos RC-1 a RC-12 são propostas e só valem com a aprovação do plano.

## Problema e contexto

Ideação: _project/ideations/007_interface_base.md

## Objetivo

Adotar a organização da referência V13 como interface base do protótipo, sem perder nenhuma capacidade atual, e registrar o contrato visual. Cinco entregas:

- **Contrato visual:** `DESIGN.md` na raiz, com tokens dos temas claro e escuro, componentes, estados e acessibilidade, reconhecido pela governança.
- **Tela em três colunas:** filtros à esquerda (pergunta), mapa e série no centro (onde), resultado à direita (resposta), com tela de acesso própria, topo, rodapé de domínio e tema escuro.
- **Explicação da célula (parcela do BL-009):** lista de destaques (células, ou municípios na concentração), explicação com motivo, evidências e ressalvas e "Voltar aos destaques", na aba Destaques; cartão do município na aba Municípios.
- **Lentes no recorte da consulta (G1):** as lentes usam só as detecções do período e do município escolhidos; a concentração fica indisponível com município.
- **Mapa-base:** satélite com nomes, da Esri, com chave restrita ao domínio e "Sem fundo" sempre disponível.

Restrição de domínio, repetida em todo texto novo: detecções e sobreposições não comprovam incêndio, dano, autoria ou infração; uma lente indica onde olhar, não ranking nem prova; a densidade é contagem, não gravidade.

## Origem no backlog

Herdada da ideação, sem reescrever o snapshot:

- **BL-007 — Definição visual e interface.** Item inteiro.
- **BL-009 — Explicação dos destaques das lentes no mapa.** Parcela: "por que esta célula foi destacada", com motivo, evidências e ressalvas já calculados, inclusive na combinação. Restante: comparação de dois períodos e agentes com IA.
- **Referência:** `_project/backlog.md`, commit `e274e49`, contido em `main` (`861bba6`) e `origin/main`. Não é local nem pendente de publicação.
- **Destino em preparação.** Os itens continuam `Disponível`. O retorno (`- ciclo 007 — AAAA-MM-DD — parcela`) só é registrado depois da integração do encerramento em `main`, comprovada no GitHub, por `gerenciar_backlog`; a publicação desse retorno exige autorização separada.
- **Cobertura para o retorno futuro:** BL-007 integral; BL-009 só a explicação da célula. Escopo sem origem no backlog: lentes no recorte e mapa-base.

## Contexto e baseline

- **Base:** `main` e `origin/main` em `861bba6`. Ideação e linha do ciclo em `_project/cycles.md` ainda sem commit, na branch local `chore/cycle-007-plan` (criada de `main`, sem commits próprios).
- **Dados:** carga `AQUA_M-T` de 2025-11-01 a 2026-10-31 (dias GMT), 10.640 detecções principais, 3.290 células de 0,05° ocupadas (números conferidos de novo em 2026-11-14 na carga local).
- **Interface atual (ADR-007, KB-005):** `index.html` (190 linhas, 11 cartões empilhados), `src/app.ts` (1.281 linhas), `src/apresentacao*.ts`, `src/mapa.ts` (Leaflet 1.9.4, sem tiles) e `src/estilos/` (`tokens.css`, `base.css`, `componentes.css`, `layout.css`, `mapa.css`). Não há tema escuro. A lente é aplicada por botão ("Aplicar lente", R1-7). O mapa mostra a página corrente de registros; os limites do estado vêm só por pedido.
- **Consultas:** `consultar_resumo` (com `serie_diaria` e `por_municipio`), `consultar_deteccoes` (páginas de até 1.000) e `consultar_disponibilidade` já aceitam `p_municipio`, sob RLS. As lentes chamam com `municipio: null` (`filtroEstadual`, `src/lentes/carregar.ts`), e os resultados declaram `recorte: { tipo: 'estado', municipio: null }` (`recorrencia.ts`, `combinacao.ts`, `sobreposicao.ts`).
- **Versões de método:** `lentes-004-v1` (concentração, recorrência, persistência), `combinacao-005-v1` e `sobreposicao-006-v1`.
- **Segurança de borda:** `vercel.json` define CSP com `img-src 'self' data:` e `connect-src 'self' https://*.supabase.co`; tiles da Esri exigem abrir `img-src` para o domínio dos tiles.
- **Variáveis públicas do build:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_CHAVE_PUBLICAVEL` e `VITE_AUTH_SENHA_LOCAL` (só teste local), em `.env.example`.
- **Testes:** 7 conjuntos E2E (`tests/e2e/01` a `07`, cerca de 2.100 linhas), unitários de lentes, combinação, sobreposição, contraste, lógica e bundle; conferências locais `conferir:lentes`, `conferir:combinacao`, `conferir:sobreposicao`; medição `medir:lentes` e `medir:interface` no perfil de celular do ADR-007 (390×844, Slow 4G, CPU 4×).
- **Governança:** `.agent/ai_behavior.md` ("Contrato visual futuro — a definir em ciclo próprio"), `_project/README.md` ("contrato visual: adiado para ciclo próprio; o mockup privado não é contrato") e `scripts/validate-governance.mjs` ("Design system adiado: contrato visual não auditado") precisam reconhecer o `DESIGN.md`.
- **Referência visual:** mockup V13 privado em `local/` (fora do Git). Nada dele é copiado; o `DESIGN.md` é escrito do zero.
- **Implantação:** cada merge em `main` gera deploy de produção na Vercel.

## Escopo

### Dentro do escopo

1. `DESIGN.md` e atualização das três autoridades de governança que citam o contrato visual adiado, com o teste do validador ajustado.
2. Nova estrutura da tela (topo, filtros, centro, resultado, rodapé), tela de acesso, tema escuro e todos os estados atuais preservados.
3. Coluna de resultado com abas Destaques e Municípios, explicação do destaque e cartão do município.
4. Centro: todos os pontos do recorte, limites `minima` por padrão, camada de densidade, legenda, ampliar mapa, série mensal ou diária e disponibilidade do recorte.
5. Cálculo da lente ao escolher, com progresso e reaproveitamento só em memória.
6. Lentes no recorte da consulta: carregador, resultados, versões, combinação, sobreposição, concentração indisponível com município, KB-005 e conferências.
7. Mapa-base Esri com chave pública restrita ao domínio, CSP, atribuição e fallback.
8. ADR-009 (interface base: revisões do ADR-007 sobre pontos, limites, reaproveitamento em memória e registros) e ADR-010 (mapa-base de terceiros).
9. Ajuste de todos os testes afetados e medição no perfil do ADR-007.

### Fora do escopo

- Comparação de períodos e agentes com IA (restante do BL-009).
- Mapa de ruas (CARTO), VIIRS, variação anual, CAR, atualização automatizada.
- Mudança de limiares (3 meses, 3 dias, N=10), da grade T1 ou da regra de "dentro" da sobreposição.
- Lente de proximidade; combinação da sobreposição com as outras lentes.
- Banco: nenhuma tabela, RPC, política ou migração nova.
- Reconciliação do BL-002 no backlog.
- Copiar código, texto ou dados do mockup privado.

## Decisões e autoridades

### Decisões herdadas da ideação (2026-11-14)

| # | Decisão |
| :-- | :-- |
| A1 | Lentes calculadas só com as detecções do período e do município da consulta; a tela declara o recorte. |
| A2 | Concentração indisponível com município ("Compara municípios: disponível só com Todo Mato Grosso") e fora da combinação nesse caso. |
| A3 | Lente calculada ao escolher, com progresso e descarte da resposta anterior; registros do mesmo recorte reaproveitados só em memória. |
| A4 | Mapa com todos os pontos do recorte. |
| A5 | Tabela de registros sai; evidência na explicação da célula. |
| A6 | Série mensal com os meses do período; diária em períodos de até 31 dias. |
| A7 | Limites `minima` ligados por padrão; município escolhido em `intermediaria`. |
| A8 | Esri (satélite com nomes) e "Sem fundo"; CARTO adiada; conta e chave como ação externa. |
| A9 | Tema escuro entra; densidade entra (revista em 2026-11-14), opcional e com legenda "contagem, não gravidade"; tela de acesso própria; proveniência completa no botão de dados do topo e resumo no fim da aba Células. |
| A10 | `DESIGN.md` na raiz. |

### Detalhes técnicos propostos para ratificação na aprovação

- **T1 — Recorte das lentes.** `recorte` passa a ser `{ tipo: 'estado', municipio: null }` ou `{ tipo: 'municipio', municipio: <código IBGE> }`. O carregador lê resumo, páginas e disponibilidade com o mesmo filtro da consulta e confere `r.municipio` igual ao pedido (hoje confere `null`). Nenhum cálculo de lente muda: muda só o conjunto de entrada.
- **T2 — Versões.** Novas versões `lentes-007-v1`, `combinacao-007-v1` e `sobreposicao-007-v1`, que aceitam os dois recortes. No recorte estadual, os destaques são idênticos aos das versões anteriores na mesma carga e janela (RC-1); a versão muda porque o método passa a aceitar outro recorte.
- **T3 — Evidência e cobertura no recorte municipal.** A evidência de uma célula traz só os `id_tecnico` do município. A disponibilidade é lida só para esse município, e a qualificação de cobertura da célula considera só ele.
- **T4 — Concentração com município.** O módulo recusa o pedido com `ErroLente` ("concentração exige recorte estadual"); a combinação com concentração no recorte municipal lança `ErroCombinacao`. A interface nunca chega a pedir: desabilita a opção e mostra o texto de A2. Se a concentração estava ativa ao escolher um município, a lente volta a "nenhuma" e a aba vai para Municípios.
- **T5 — Textos do recorte.** Escopo da coluna de filtros: "Uma lente por vez · <Todo Mato Grosso | município> · <início a fim>". Resumo da aba Destaques: "em todo Mato Grosso" ou "calculada só com os focos de <município>". Limitação nova no resultado municipal: "Células na divisa podem perder destaque, porque só contam os focos de <município>."
- **T6 — Reaproveitamento em memória (A3).** Chave `(sessão, carga, início, fim, município)`. Reaproveita **só** páginas de registros e disponibilidade já lidas e conferidas; o **resumo é sempre relido** do servidor antes de qualquer reuso, como `lerRegistros` já faz (`src/lentes/carregar.ts`), e o reuso só ocorre se carga, recorte e total conferirem. Essa releitura é a checagem obrigatória: perda de acesso, sessão expirada e carga substituída aparecem nela e limpam tudo. Só em variáveis da página, nunca em `localStorage`, `sessionStorage`, IndexedDB ou cache HTTP; até 3 recortes, descartando o mais antigo. A memória pertence à geração de sessão do ADR-007: logout, expiração, revogação, troca ou indisponibilidade de carga a esvaziam, e respostas de gerações anteriores são descartadas e nunca a repõem. O acesso não muda (G2 continua `Não`): todo uso passa pela RPC sob RLS.
- **T7 — Leitura completa e pontos no mapa (A4, R2-1).** A partir do **item 2**, todo recorte aplicado é lido por inteiro (resumo e todas as páginas conferidas, com ou sem lente), uma vez, pelo reaproveitamento T6; lente, mapa, cartão do município e densidade usam essa mesma leitura **quando o recorte é o mesmo**. Exceção (R3-2): até o item 4, com município escolhido, mapa, cartão e densidade usam a chave municipal e a lente usa a chave estadual de T6; a primeira lente nessa situação pode ler as páginas do estado, e o teste de zero páginas relidas vale só para trocas de lente entre recortes já lidos (Todo Mato Grosso nos itens 2 e 3; qualquer recorte a partir do item 4). Assim, a saída da tabela paginada (A5) e a chegada de todos os pontos acontecem na **mesma PR**, e nunca há entrega intermediária com só uma página. Pontos em canvas; o indicador "mostra X de Y" sai porque X = Y. Tocar ou clicar num ponto abre um balão com dia e hora GMT, município, latitude, longitude e identificador, como a seleção atual. Leitura incompleta ou inconsistente mostra estado de erro, nunca mapa parcial. **Acesso por teclado:** pela "Lista de focos" (T21). Pontos na mesma coordenada abrem um balão com **todos** os registros daquele ponto, não só um.
- **T8 — Densidade.** Contagem de detecções principais do recorte por célula T1, em cinco classes fixas: 1 · 2–3 · 4–9 · 10–24 · 25 ou mais (na janela inteira do estado: 1.384, 999, 712, 179 e 16 células; máximo 44). Classes fixas, e não relativas ao recorte, para a mesma cor significar o mesmo número em qualquer filtro. Desligada por padrão; legenda "Detecções por célula: contagem, não gravidade". Não entra em lente, ordenação ou explicação.
- **T9 — Série (A6).** Período de até 31 dias GMT: barras diárias de `serie_diaria`. Acima disso: barras mensais somando `serie_diaria` só dos meses tocados; mês cortado pelo período leva `*` e a nota "mês parcial: só os dias do período". Rótulos em dia ou mês GMT.
- **T10 — Limites (A7).** Abertura sem geometria, como hoje; os limites `minima` do estado são pedidos depois que o painel abre, sem bloquear a consulta. Município escolhido: `intermediaria`, como hoje. Camada desligável em "Camadas".
- **T11 — Aba Municípios.** Todo Mato Grosso: lista de `por_municipio` com ordenação por detecções, destaques da lente (regra abaixo) e nome, sem o aviso de contagem absoluta (ele fica junto da concentração, T15). Com município: cartão com **focos no período** (= `principal.total` do resumo do recorte), **dias com foco** (dias de `serie_diaria` com total > 0), **células com foco** (células T1 distintas dos registros principais do recorte, lidos para o mapa por T7), **células destacadas** (regra abaixo) e "Ver todo Mato Grosso". Proposta da v2: **não** mostrar "focos em áreas protegidas", que existia na V13: exigiria ler vínculos fora da camada ou da lente e escolher entre focos distintos e vínculos (um foco pode estar em duas áreas, KB-006). A sobreposição já responde isso de forma explicada. Durante a leitura, os valores mostram "carregando"; em falha, o estado de erro do recorte, sem número parcial.
  - **Unidade do que se conta (R2-2):** sempre **células distintas** da grade T1, nunca destaques ou sequências. Recorrência e sobreposição: células de `destaques`. Persistência: células distintas de `destaques` (duas sequências na mesma célula contam 1). Combinação: tamanho de `celulas`. Concentração: não conta células; com ela ativa, a linha do cartão não aparece e a ordenação "destaques da lente" lista primeiro os municípios destacados, na ordem D16.
  - **Cartão enquanto a lente for estadual** (itens 2 e 3, antes do item 4): a linha mostra "—" com "lente calculada em todo Mato Grosso", para não atribuir ao município resultados de fora do recorte. A partir do item 4, com a lente no recorte, mostra o número de células destacadas.
  - **Ordenação estadual "destaques da lente"** (Todo Mato Grosso): por município, células destacadas que contêm pelo menos um registro principal do município; uma célula conta em cada município **com detecção na célula** (não pela geometria), e a lista diz isso numa linha: "Uma célula destacada conta em cada município com detecção nela".
- **T12 — Esri (A8).** Fatos conferidos em 2026-11-14 na documentação oficial (ArcGIS Location Platform):
  - o serviço de tiles estáticos (`static-map-tiles-api.arcgis.com/.../static-basemap-tiles-service/v1`) entrega PNG de 512 px, níveis 0 a 22, `token` como parâmetro; a camada **`arcgis/imagery/labels`** é só de **nomes**, "para sobrepor a imagens", e a página não lista um estilo de imagem pura;
  - a cota gratuita é de 2 milhões de tiles por mês para `basemaps-api`, `ibasemaps-api` e `static-map-tiles-api`; o pagamento por uso vem **desligado** em conta nova e exige meio de pagamento para ser ligado;
  - a restrição da chave por domínio usa o cabeçalho `Referer`; a página não diz o que ocorre sem ele;
  - o serviço exige atribuição do mapa-base e dos dados.

  Proposta:
  - **Duas camadas Leaflet:** imagem de satélite (World Imagery pelo serviço de camadas de mapa-base, `ibasemaps-api.arcgis.com`, 256 px) e, por cima, os nomes de `arcgis/imagery/labels` (512 px, `tileSize: 512`, `zoomOffset: -1`). A issue confere o modelo exato de URL da imagem; **se não houver serviço oficial de imagem compatível com Leaflet 1.9.4 por chave, para em "Parado"** e o item entrega só "Sem fundo".
  - **Referer só com a origem:** a política global `Referrer-Policy: no-referrer` de `vercel.json` continua; as duas camadas usam a opção `referrerPolicy: 'strict-origin-when-cross-origin'` do `TileLayer`, que envia só a origem aos domínios de tiles. A issue confere que o Leaflet 1.9.4 aplica a opção às imagens; se não aplicar, para.
  - **CSP:** `img-src` ganha só os dois hosts de tiles, sem curinga.
  - **Chave e build:** `VITE_ESRI_CHAVE` é embutida no build pelo Vite. Sem chave, "Satélite" fica indisponível com aviso e o padrão é "Sem fundo"; CI e E2E rodam sem chave. Cadastrar a chave na Vercel **depois** do merge exige nova implantação da `main`, que faz parte da ação externa.
  - **Custo zero:** o responsável mantém o pagamento por uso desligado (sem meio de pagamento). Esgotada a cota, os tiles falham e o fundo cai para "Sem fundo".
  - **Falhas:** chave rejeitada, expirada, cota esgotada ou rede: depois de erros de tile seguidos na mesma vista (limite fixado na issue), a interface troca para "Sem fundo" e mostra "Fundo de satélite indisponível agora". Trocar para "Sem fundo" remove as camadas e para novos pedidos ao provedor.
  - **Conferido na rodada 2 (R2-4):** a Esri publica a URL autenticada de `World_Imagery` no host `ibasemaps-api.arcgis.com`, e o Leaflet 1.9.4 aplica `referrerPolicy` antes de definir a URL da imagem. A issue 5 registra os dois serviços com os privilégios de chave exigidos por cada um e limita o `maxZoom` do mapa aos níveis cobertos pelos dois.
  - **Atribuição:** texto da Esri e dos provedores de dados lido do serviço de metadados ou da página oficial na issue, sempre visível.
- **T13 — Tela de acesso e proveniência.** Sem sessão, só a tela de acesso (marca, aviso de domínio, entrar com Google); nenhum dado nem geometria é pedido. O botão de dados do topo abre um diálogo com fontes, versão, identidade da carga e limitações (conteúdo atual do cartão "Versão, fontes e limitações").
- **T14 — Orçamento de medição.** Protocolo comum: perfil do ADR-007 (Chrome do sistema, 390×844 com toque, latência 150 ms, 1,6/0,75 Mbit/s, CPU 4×), passagem comprimida (gzip 6) e bruta, sessão já guardada, **5 repetições e mediana**; "frio" = contexto novo sem memória; "quente" = mesma página, mesmo recorte, depois de uma leitura completa. Cada cenário tem início, fim (atributo de estado no DOM) e PR responsável:

  | Cenário | Início → fim | Limite (mediana, comprimida) | PR |
  | :-- | :-- | :-- | :-- |
  | M1 abertura | navegação → `data-estado-painel="pronto"` (filtros, cartão da série e aba Municípios prontos, independentemente de pontos e limites) | ≤ 5 s | item 1; repetida nos itens 2 e 3, com a leitura dos pontos e os limites concorrendo |
  | M2 troca de lente quente | escolha da 2ª lente no mesmo recorte estadual → `data-estado-lente` final; recorrência depois de persistência | ≤ 3 s | item 2 |
  | M3 configurações atuais frias | as 3 lentes, as 8 combinações e as 3 classes de sobreposição, como `medir:lentes` | o que já vigora: 20 s e **10.000.000 bytes brutos** por configuração, **com os desvios já aceitos**: combinações acima de 20 s do ciclo `005` (medianas de 40,9 a 54,5 s) e terra indígena do ciclo `006` (42,3 s), cada um sem piorar mais que 10% | item 2 (e repetido no item 4) |
  | M4 pontos do estado | painel pronto, sem lente → `data-estado-pontos="completo"` (10.640 pontos na janela inteira) | ≤ 20 s | item 2 |
  | M5 limites `minima` | painel pronto → `data-estado-limites="completo"` | ≤ 3 s | item 3 |
  | M6 recorte municipal frio | escolha do município de mais detecções com recorrência ativa → lente final | ≤ 5 s | item 4 |

  Estouro de limite, ou piora acima de 10% de um desvio já aceito, leva a "Parado" naquela PR, com a medição e alternativas, sem merge.
- **T15 — Destaques da concentração (R1-1).** A primeira aba se chama **Destaques · N** (e não "Células", como na V13), porque a concentração destaca **municípios** e as demais lentes destacam células.
  - **Concentração avulsa:** a lista mostra os municípios destacados na ordem do resultado (contagem decrescente, D16), com a observação de empatados, a **ressalva de contagem absoluta** ("Contagem absoluta favorece municípios grandes; a ordem não indica prioridade, gravidade nem risco") e o estado vazio do resultado. Clicar num município da lista, ou no seu contorno destacado no mapa, abre a explicação na mesma aba: motivo, evidência (detecções do município na janela), cobertura e ressalvas, com "← Voltar aos destaques", que devolve a posição e o foco ao item da lista. O mapa enquadra o município e desenha o contorno `intermediaria` destacado.
  - **Concentração na combinação:** segue sendo critério por célula (projeção P1, KB-005); a explicação da célula diz que a célula entrou pela concentração e repete a ressalva de projeção existente.
  - Estados de erro, leitura inconsistente e indisponível seguem os textos atuais da lente.
- **T16 — Recorte aplicado e consulta (R1-3).** A V13 não tem botão "Consultar": a consulta se aplica ao mudar. "Recorte aplicado" é a última combinação **válida** de período e município, e é a única que mapa, série, lente e abas usam.
  - Atalhos de período e município aplicam na hora.
  - Intervalo personalizado aplica quando as duas datas são válidas e dentro da janela da carga. Enquanto inválido, o erro aparece junto do campo e a tela continua no recorte aplicado anterior, com a linha "Mostrando <início a fim>".
  - Toda mudança de recorte aplicado incrementa a geração da consulta (ADR-007): lente, pontos, série e abas são recalculados, e respostas atrasadas de recortes anteriores são descartadas.
  - Configuração da lente (classe, critérios, operador) vale ao mudar e recalcula no mesmo recorte.
  - **Combinação incompleta:** com menos de 2 critérios válidos, nada é calculado e a aba mostra "Escolha pelo menos 2 lentes para combinar". Se o município tirar a concentração de uma combinação de 2 critérios (item 4), sobra 1 e aparece "Com município, a concentração sai da combinação: escolha outra lente". Nada de resultado antigo fica visível como se fosse atual.
  - **Antes do item 4** (lentes ainda estaduais): a lente ignora o município. A coluna de filtros e o resumo da aba dizem "Lentes: todo Mato Grosso", e a aba Municípios e o mapa seguem o recorte. O texto muda no item 4.
- **T17 — Tela estreita, toque e reflow (R1-5).** Abaixo de 761 px, uma coluna na ordem: topo, filtros (seções fechadas, com a Consulta mostrando o recorte aplicado no título), mapa, aba de resultado, série e disponibilidade, rodapé com a primeira frase. Os testes atuais de 320 px, de texto a 200% e de rolagem da página sem captura pelo mapa (arraste com dois dedos no toque, ADR-007) entram no aceite do item 1 e continuam em todas as PRs. Mapa ampliado: o foco vai para o mapa; Esc ou o mesmo botão voltam, com foco no botão; em tela estreita, o modo ampliado ocupa a altura útil e o botão de voltar fica visível. Diálogos nativos (`dialog`) com foco preso e retorno ao botão que os abriu.
- **T18 — Resumo do período e sensibilidade (R1-5).** O total principal GMT do recorte e a **sensibilidade America/Cuiaba** (total, diferença para o GMT e intervalo, ou "Pendente" com o texto atual, que não é zero nem parcial) ficam no cartão da série, no centro, acima das barras, com o escopo ("Todo Mato Grosso" ou o município). É conteúdo por consulta e não vai para "Sobre os dados". No item 1, o conteúdo atual de `renderResumo` passa para esse lugar sem mudar números nem textos.
- **T19 — Somas e fronteiras (R1-4).** Série, densidade e cartão usam **só** os registros principais (`escopo = principal`) do recorte aplicado; o envelope de sensibilidade nunca entra. A soma das barras da série e a soma das contagens da densidade são iguais a `principal.total` do mesmo recorte (verificado em teste e em tela pelo atributo `data-total`). Mês parcial **sem** detecções aparece como barra zero marcada com `*`, com rótulo "0 no período"; disponibilidade continua só no cartão de disponibilidade, e zero não é apresentado como lacuna.
- **T20 — Regressão por PR (R1-9, R2-3).** Toda PR roda `typecheck`, `build`, unitários e o E2E inteiro. As PRs dos itens 1, 2, 3 e 4 rodam também `conferir:lentes`, `conferir:combinacao` e `conferir:sobreposicao` no recorte estadual (RC-1 com carga real); a do item 4 roda também no recorte municipal. Medições conforme T14.
- **T21 — Lista de focos (R3-1).** Botão "Lista de focos" no mapa, ao lado de "Camadas", que abre sob demanda um painel textual com os registros principais do recorte aplicado, lidos de T7 (sem nova consulta). Cada linha mostra dia e hora GMT, município, latitude, longitude e identificador; ordem por dia e hora; paginação local de 50 linhas com navegação por teclado. Selecionar uma linha (Enter ou Espaço) marca o ponto no mapa com o anel de seleção e anuncia o registro; dois registros na mesma coordenada aparecem como duas linhas distintas, cada um selecionável. Fechar devolve o foco ao botão. É o "painel opcional" previsto em A5: a tabela fixa não volta.

### Casos de referência (G1)

Unitários com dados fictícios, valores esperados fixos. Municípios fictícios A e B; células na grade T1.

| Caso | Entrada | Esperado |
| :-- | :-- | :-- |
| RC-1 | Mesma entrada estadual nas versões antiga e nova (recorrência, persistência, concentração, sobreposição, 8 combinações) | Iguais: `estado`, `parametros`, `observacoes`, `limitacoes`, e em cada destaque `id_destaque`, `unidade`, `motivo`, `evidencia`, `ordem`, `cobertura` e `ressalvas`. `recorte` continua `{ tipo: 'estado', municipio: null }`. Muda **só** `versao_metodo` (e `versao_combinacao`) |
| RC-2 | Célula na divisa; A com focos em 2026-01-10 e 2026-03-05; B em 2026-05-02; recorrência | Estado: destacada (3 meses). Recorte A: não (2). Recorte B: não (1) |
| RC-3 | Célula só de A, focos em jan, mar e mai; recorrência | Estado e recorte A: destacada, evidência 3. Recorte B: célula ausente |
| RC-4 | Divisa; A em 10 e 11/08; B em 12/08; persistência | Estado: destacada (3 dias seguidos). Recorte A: não (2). Recorte B: não (1) |
| RC-5 | Divisa; A com 4 focos em 4 dias seguidos; B com 1 foco no dia seguinte | Recorte A: destacada, evidência 4 focos de A. Recorte B: não |
| RC-6 | Divisa; 1 foco de A dentro de UC de proteção integral; 1 foco de B fora; sobreposição integral | Estado: destacada, evidência 1. Recorte A: destacada, evidência 1. Recorte B: não |
| RC-7 | Concentração com recorte A | `ErroLente` "concentração exige recorte estadual" |
| RC-8 | Combinação concentração + recorrência, recorte A | `ErroCombinacao` |
| RC-9 | Combinação recorrência e persistência, operador "e", recorte A; célula com recorrência só somando B | Não destacada em A |
| RC-10 | Recorte A, período de 2 meses GMT, recorrência | `janela_insuficiente`, sem destaques (regra existente) |
| RC-11 | Cobertura no recorte A; dia indeterminado só em B | Qualificação da célula não considera B |
| RC-12 | Concentração no estado com 12 municípios, 9º e 10º empatados com o 11º | Cálculo (unitário): 11 municípios destacados e observação de empate. Interface (E2E): lista com a ressalva de contagem absoluta (T15); clicar num município abre a explicação e "Voltar aos destaques" devolve o foco ao item |

Casos de apresentação (item indicado entre parênteses), também unitários com dados fictícios:

| Caso | Entrada | Esperado |
| :-- | :-- | :-- |
| DS-1 (3) | Células com 1, 2, 3, 4, 9, 10, 24 e 25 focos | Classes 1 · 2–3 · 2–3 · 4–9 · 4–9 · 10–24 · 10–24 · 25+ |
| DS-2 (3) | Recorte com 7 registros principais e 2 só de sensibilidade | Contagens somam 7; `data-total` = `principal.total` = 7 |
| SR-1 (3) | Período de 31 dias | 31 barras diárias |
| SR-2 (3) | Período de 32 dias, de 2026-07-31 a 2026-08-31 | 2 barras mensais; julho com `*` (1 dia); soma = `principal.total` |
| SR-3 (3) | Mês parcial sem nenhuma detecção | Barra zero com `*` e "0 no período"; nenhum texto de lacuna |
| SR-4 (3) | Registros só de sensibilidade num dia | Não entram na série |
| CM-1 (2) | Município com 5 focos principais em 3 dias, em 4 células, 1 foco fora do período e 1 de outro município | Focos 5, dias 3, células 4; os outros 2 não contam |
| CM-2 (2 e 4) | Recorrência com 3 células destacadas no município | Itens 2 e 3: "—" com "lente calculada em todo Mato Grosso". Item 4 (recorte municipal): "Células destacadas: 3"; sem lente, "—" |
| CM-3 (4) | Persistência no município com duas sequências na mesma célula e uma em outra | "Células destacadas: 2" |
| CM-4 (4) | Combinação recorrência e persistência, "ou", com 3 células no resultado | "Células destacadas: 3" |
| CM-5 (2) | Todo Mato Grosso; recorrência com uma célula que cruza A e B com detecções dos dois, outra que cruza A e B com detecções só de A, e uma terceira só em A | Ordenação por destaques: A 3, B 1 |
| CM-6 (2) | Concentração ativa no estado | Cartão sem a linha de células; ordenação lista os destacados primeiro, na ordem D16 |
| PG-1 (2) | Recorte com 1.001 registros principais; o último é o único de sua célula | Mapa com 1.001 pontos; "Células com foco" conta essa célula; 2 páginas lidas uma vez |
| LF-1 (2) | Recorte com dois registros fictícios na mesma coordenada, às 03:10 e às 15:40 GMT, **sem lente ativa** | Só por teclado: abrir "Lista de focos", selecionar cada linha; o anúncio acessível distingue os dois registros pelo horário e pelo identificador, e o anel marca o ponto; fechar devolve o foco ao botão. No mapa, clicar no ponto abre balão com os dois registros |

**Conferência com a carga real (local, caminho independente).** Duas comparações separadas:

1. **Equivalência estadual:** versões novas contra as versões anteriores (`lentes-004-v1`, `combinacao-005-v1`, `sobreposicao-006-v1`) na mesma carga e janela, campo a campo como RC-1.
2. **Recorte municipal:** `conferir:lentes`, `conferir:combinacao` e `conferir:sobreposicao` ganham o recorte e comparam o módulo, célula a célula, com um cálculo independente (SQL ou leitura direta que não importa o módulo) em: o município com mais detecções, um município com células de divisa destacadas na recorrência e um município sem destaques.

Referências exploratórias da ideação, que não são valores esperados: recorrência 150 células no estado, 8 na divisa, 12 pares célula–município que somem no recorte; persistência 60, 4 e 5.

### Verificação em produção

Exigida, porque login real, chave restrita ao domínio, `Referer` só com a origem, CSP e tiles só existem no ambiente hospedado. Roteiro na issue do item 5: entrar com Google; abrir o painel; ligar "Satélite" e conferir que **imagem e nomes** chegam (requisições aos dois hosts com status 200 e a origem no `Referer`); trocar para "Sem fundo" e conferir que nenhum novo pedido vai aos hosts da Esri; escolher um município e uma lente; abrir uma célula; console sem violação de CSP. O responsável pode dispensá-la, como no ciclo `006`; a dispensa é registrada com as palavras dele.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Aprovar plano — "aprovo o plano do ciclo 007" | Veredito `APTO PARA APROVAÇÃO` ou `APTO COM RESSALVAS` | PR documental (ideação, plano, `cycles.md`); depois da integração, conferência e **confirmação dos payloads** das 5 issues com o responsável (`criar_issues`) e sua criação; encerramento depois das entregas; T1 a T21 e os casos RC, DS, SR, CM, PG e LF como decisões humanas de G1 | Merges, implementação, ação externa, verificação em produção | Decisões A1 a A10, T1 a T21 (em especial as mudanças em relação à V13: T11, T15 e T21), casos, orçamento T14 |
| Autorizar implementação — "autorizo a implementação da issue #N" | Issue criada; item anterior integrado quando houver dependência | Branch, task, código, testes e PR daquela issue | Outras issues, merge | Escopo e critérios do item |
| Aprovar merge — "aprovo o merge da PR #N" | Checks verdes | Squash daquela PR | Qualquer outra PR | Diff, checks, medições |
| Ação humana externa — "concluí a ação externa da issue #N" | Código do item 5 integrado | Registro de que o responsável criou a conta gratuita, aceitou os termos, **manteve o pagamento por uso desligado**, gerou a chave restrita ao domínio de produção, cadastrou `VITE_ESRI_CHAVE` na Vercel e **mandou reimplantar a `main`** (a variável só vale num build novo) | Criação de conta, chave ou implantação pelo agente (nunca) | Roteiro da issue; o agente confere só o que for acessível sem a chave |
| Verificar produção — "autorizo a verificação em produção do ciclo 007" | Itens 1 a 5 integrados e ação externa concluída | Roteiro acima no ambiente hospedado | Mudanças no ambiente | Roteiro e console |

Toda cadeia autorizada para em "Parado" quando: um caso RC, DS, SR ou CM falhar; a conferência independente divergir; um limite de T14 estourar ou um desvio aceito piorar mais que 10%; o CSP exigir domínio além dos dois hosts de tiles; a documentação da Esri contrariar T12 (sem imagem compatível, `referrerPolicy` ignorado ou cobrança sem opção de desligar); ou uma decisão nova de G1 for necessária.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Recorte das lentes (T1 a T5), destaques da concentração (T15), densidade (T8), série (T9), cartão do município (T11) e somas (T19). Casos RC, DS, SR e CM, equivalência estadual e conferência independente municipal com carga real, versões novas e KB-005 atualizada. Textos de domínio em toda tela nova |
| G2 — autenticação, autorização e isolamento por RLS | Não | Só lê tabelas e RPCs já isoladas e testadas, com os mesmos papéis. Tela de acesso troca a apresentação, não o fluxo de sessão do ADR-007. Se alguma issue precisar de RPC, tabela ou política nova, para e volta ao plano |
| G3 — privacidade de dados | Sim | Mockup e carga local ficam em `local/`; nada é copiado. Chave da Esri pública mas nunca versionada (só `.env.example` com nome vazio). Reaproveitamento só em memória (T6). ADR-010 registra que tiles revelam ao provedor a região vista |
| G4 — migrações só acrescentam | Não | Nenhuma migração prevista |

## Estratégia de testes

- **Unitários (`npm run test:interface`):** RC-1 a RC-11, o cálculo de RC-12, DS-1 e DS-2, SR-1 a SR-4, CM-1 a CM-6; chave, releitura do resumo e descarte do reaproveitamento (T6); recorte aplicado e combinação incompleta (T16); estados da concentração com município (T4).
- **E2E da seleção:** a parte de interface de RC-12 (seleção, explicação e retorno de foco) PG-1 (mais de uma página) e LF-1 (só teclado, mesma coordenada).
- **Contraste:** `tests/unit/contraste.test.mjs` estendido aos tokens dos dois temas do `DESIGN.md` (texto ≥ 4,5:1; componentes e foco ≥ 3:1).
- **E2E (`npm run test:e2e`):** os 7 conjuntos reescritos para a nova estrutura, cobrindo todos os estados atuais (sem sessão, negado, expirada, sem publicação, versão substituída, leitura inconsistente, carga indisponível), e novos cenários: seções recolhíveis e "Limpar tudo"; troca automática de aba; célula → explicação → voltar no mesmo ponto; mapa ampliado e Esc; concentração desabilitada com município; recorte municipal das lentes; tema escuro; fundo sem chave; teclado e leitor de tela (rótulos, `aria-selected`, foco).
- **Conferências locais:** `conferir:lentes`, `conferir:combinacao` e `conferir:sobreposicao` nos recortes estadual e municipal.
- **Medição:** `medir:lentes` e `medir:interface` adaptados a T14.
- **Bundle:** `tests/unit/bundle.test.mjs` continua garantindo nenhum dado territorial e nenhuma chave privilegiada no bundle; a chave Esri não entra no build de teste.
- **Governança:** `node --test scripts/validate-governance.test.mjs` e `node scripts/validate-governance.mjs`, `git diff --check`.
- **Gates por PR:** `npm run typecheck`, `npm run build`, `npm run test:interface`, `npm run test:e2e` e os checks remotos.

## Itens de implementação

### Item 1 — Contrato visual e estrutura base

**Contexto:** a tela atual empilha cartões; não há contrato visual. Este item troca a estrutura **sem mudar regra**: as lentes continuam estaduais até o item 4, e a interface diz isso (T16). A lente ainda é aplicada pelo botão atual até o item 2.

**Ação técnica:**

- Escrever `DESIGN.md`: princípios (pergunta → onde → resposta), tokens de cor dos temas claro e escuro (superfícies, texto, linha, escolha em verde-sálvia, seleção azul só no mapa, detecção, destaque, áreas por classe, aviso), tipografia de sistema, espaçamento, raio, alvos de toque ≥ 44 px, componentes (seção recolhível, chip, aba, botão, botão de texto, lista selecionável, cartão, diálogo, legenda, rodapé), barra de rolagem que só aparece ao passar o mouse, títulos clicáveis sem seleção de texto, layout em tela larga e estreita (T17), estados e regras de acessibilidade.
- Atualizar `.agent/ai_behavior.md` (linha do contrato visual), `_project/README.md` (autoridade "contrato visual: `DESIGN.md`") e `scripts/validate-governance.mjs` (mensagem manual), com o teste do validador.
- Reestruturar `index.html` e estilos: topo com marca, chips de satélite e fontes, botões "Sobre os dados" (T13), "Como ler esta tela" e tema; tela de acesso (T13); coluna de filtros com "Limpar tudo" e seções Consulta (aberta; período com atalhos e intervalo; município; aplicação ao mudar, T16), Lente de seleção, Contexto territorial e Cruzar critérios, cada lente com a pergunta que responde; etiqueta "ativa"; resumo do período e sensibilidade no cartão da série (T18); rodapé com as três frases; tema escuro com preferência do sistema e alternância; tela estreita (T17).
- Manter mapa, lentes, registros e demais conteúdos funcionando nas novas regiões, com o comportamento atual.
- Medição M1 (T14).

**Critérios de aceite:**

- [ ] `DESIGN.md` existe e as três autoridades o reconhecem; validador e teste passam.
- [ ] Todos os estados de sessão e versão do ADR-007 continuam com texto e atributo próprios e testados.
- [ ] Contraste conferido nos dois temas pelo teste unitário.
- [ ] Testes atuais de 320 px, texto a 200% e rolagem sem captura pelo mapa continuam verdes (T17).
- [ ] Consulta: edição de intervalo inválido mantém o recorte aplicado; resposta atrasada de recorte anterior é descartada (E2E).
- [ ] Sensibilidade America/Cuiaba com os mesmos números e textos de hoje, no novo lugar (T18).
- [ ] E2E de acesso, consulta, acessibilidade e versão reescritos e verdes; M1 dentro do limite.
- [ ] Nenhum resultado de lente muda (T20).

### Item 2 — Coluna de resultado, explicação e cálculo ao escolher

**Contexto:** parcela do BL-009 e decisões A3, A5; T6, T11, T15, T16.

**Ação técnica:**

- Coluna da direita com abas **Destaques · N** e **Municípios** (padrão de abas acessível). Destaques: título, resumo da lente com o recorte, lista (células, ou municípios na concentração, T15), estado vazio; clicar num item (lista ou mapa) abre a explicação na mesma aba, com "← Voltar aos destaques", restaurando posição e foco. A explicação reúne motivo, critérios (na combinação, quais contribuíram e o efeito do operador), evidências ("Ver as detecções que sustentam o destaque"), disponibilidade, ressalvas e metadados curtos.
- Municípios e cartão do município (T11). Abre em Municípios; vai para Destaques ao escolher lente; "Limpar tudo" volta a Municípios.
- Lente calculada ao escolher (sem botão), com progresso, descarte e reaproveitamento T6; configuração e combinação incompleta (T16).
- Leitura completa do recorte e todos os pontos no mapa (T7), na mesma PR que remove a tabela de registros paginada (A5) e cria a "Lista de focos" (T21).
- ADR-009 criado com as decisões deste item (reaproveitamento em memória, saída da tabela, cálculo ao escolher), revisando o ADR-007.
- Medições M1 (repetida), M2, M3 e M4 (T14); regressão T20.

**Critérios de aceite:**

- [ ] Toda informação hoje no painel da lente aparece na explicação, para células e para municípios da concentração (RC-12).
- [ ] Trocar de lente no mesmo recorte não relê páginas: o E2E conta separadamente as requisições de páginas (0 na troca) e a releitura do resumo (1 na troca).
- [ ] Com a memória preenchida, revogação de acesso e troca de carga levam ao estado próprio e esvaziam a memória; resposta atrasada não a repõe (E2E); nenhum dado de consulta persiste no navegador após logout (E2E inspeciona armazenamento).
- [ ] CM-1, CM-2 (parte dos itens 2 e 3), CM-5, CM-6, PG-1 e LF-1 verdes; zero páginas relidas na troca de lente com Todo Mato Grosso; M4 dentro do limite.
- [ ] E2E de lentes, combinação e áreas reescritos e verdes; M2 e M3 dentro do limite.

### Item 3 — Centro: mapa, densidade e série

**Contexto:** decisões A6, A7, A9 (densidade); T8 a T10, T19. Usa a leitura completa do item 2 (T6, T7).

**Ação técnica:**

- Limites `minima` por padrão (T10); camadas (limites, áreas, detecções, densidade) e legenda; ampliar mapa com Esc e retorno automático ao abrir um destaque (T17); densidade (T8); série (T9, T19); disponibilidade do recorte.
- ADR-009 complementado com pontos e limites; ADR-007 marcado como parcialmente substituído pelo ADR-009.
- Medições M1 (repetida) e M5 (T14); regressão T20.

**Critérios de aceite:**

- [ ] DS-1, DS-2 e SR-1 a SR-4 verdes; `data-total` da série e da densidade igual a `principal.total` no E2E.
- [ ] Densidade desligada por padrão, com legenda de contagem.
- [ ] M1 e M5 dentro do limite, ou "Parado" com a medição.
- [ ] ADR-009 aceito na PR, descrevendo o comportamento integrado dos itens 2 e 3.

### Item 4 — Lentes no recorte da consulta (G1)

**Contexto:** decisões A1 e A2; T1 a T5, T16.

**Ação técnica:**

- `carregar.ts`, `carregar-areas.ts`, `contrato.ts`, `combinacao.ts`, `sobreposicao.ts` e as três lentes: recorte do pedido, conferência do eco do município, versões T2, evidência e cobertura T3, recusas T4.
- Interface: concentração desabilitada com município (T4), mensagem da combinação que perde a concentração (T16), textos T5 no lugar dos textos provisórios do item 1.
- KB-005 atualizada (recorte, versões, T1 a T5, casos), conferências com recorte municipal.
- Medições M3 (repetida) e M6 (T14); regressão T20 nos dois recortes; CM-2 (parte do item 4), CM-3 e CM-4.

**Critérios de aceite:**

- [ ] RC-1 a RC-11 verdes.
- [ ] Equivalência estadual com as versões anteriores, campo a campo (RC-1 com carga real).
- [ ] Conferência independente célula a célula idêntica nos três recortes municipais.
- [ ] KB-005 descreve o recorte municipal e suas limitações.
- [ ] M3 e M6 dentro do limite.

### Item 5 — Mapa-base Esri

**Contexto:** decisão A8 e T12. Depende de ação humana externa para o aceite final.

**Ação técnica:**

- Conferir na documentação oficial o modelo de URL da imagem de satélite e dos nomes, a opção `referrerPolicy` do `TileLayer` no Leaflet 1.9.4, a cota e a atribuição; parar se T12 não se sustentar. ADR-010 com serviços, cota, pagamento por uso desligado, chave restrita, `Referer`, CSP, privacidade, falhas e CARTO como alternativa adiada.
- Fundo "Satélite" (imagem e nomes) e "Sem fundo"; `VITE_ESRI_CHAVE` em `.env.example` (vazia); CSP com os dois hosts; `referrerPolicy` nas camadas; troca automática para "Sem fundo" em falha.
- Roteiro da ação externa (ver "Pontos de aprovação"), incluindo a reimplantação da `main` depois de cadastrar a variável.

**Critérios de aceite locais (antes do merge):**

- [ ] Execução sem chave (build sem `VITE_ESRI_CHAVE`): "Satélite" indisponível com aviso e "Sem fundo" padrão (E2E).
- [ ] Execução separada, com valor fictício na variável e as rotas dos dois hosts interceptadas no E2E: tiles simulados aparecem; com erro simulado, troca para "Sem fundo" com o aviso; desligar o fundo para novos pedidos aos hosts; nenhum pedido acima do `maxZoom`.
- [ ] Imagens de tile com o atributo `referrerpolicy` esperado; CSP só com os dois hosts; nenhuma chave no repositório.
- [ ] ADR-010 aceito na PR.

**Aceite depois da ação externa (verificação em produção):**

- [ ] Imagem e nomes carregam no domínio de produção; "Sem fundo" interrompe os pedidos; console sem violação de CSP.

## Arquivos afetados

- Novos: `DESIGN.md`, `_project/decisions/ADR-009_interface_base.md`, `_project/decisions/ADR-010_mapa_base_terceiros.md`, `_project/drafts/007_interface_base/007_task_issue-N.md` (uma por issue).
- Governança: `.agent/ai_behavior.md`, `_project/README.md`, `scripts/validate-governance.mjs`, `scripts/validate-governance.test.mjs`.
- Interface: `index.html`, `src/app.ts`, `src/apresentacao*.ts`, `src/mapa.ts`, `src/formato.ts`, `src/estilos/*.css`, módulos novos de série, densidade e reaproveitamento.
- Lentes: `src/lentes/carregar.ts`, `carregar-areas.ts`, `contrato.ts`, `comum.ts`, `concentracao.ts`, `recorrencia.ts`, `persistencia.ts`, `combinacao.ts`, `sobreposicao.ts`.
- Configuração: `vercel.json`, `.env.example`.
- Testes e scripts: `tests/unit/*`, `tests/e2e/*`, `scripts/lentes/conferir*.mjs`, `scripts/interface/medir-*.mjs`.
- Conhecimento: `_project/knowledge/KB-005_contrato_lentes_selecao.md`, `_project/decisions/ADR-007_interface_consulta_prototipo.md` (status). No encerramento, conferir se KB-003, KB-006 e o ADR-007 precisam de remissão para o `DESIGN.md`, o ADR-009 e o ADR-010.

## Decomposição em issues e PRs

| Issue | Título proposto | Tipo | Depende de |
| :-- | :-- | :-- | :-- |
| [#60](https://github.com/EuThiagoAndrade/rastro-quente/issues/60) (item 1) | `[FEATURE] Contrato visual e estrutura base da interface` | feature | — |
| [#61](https://github.com/EuThiagoAndrade/rastro-quente/issues/61) (item 2) | `[FEATURE] Coluna de resultado e explicação dos destaques, com todos os pontos no mapa` | feature | [#60](https://github.com/EuThiagoAndrade/rastro-quente/issues/60) |
| [#62](https://github.com/EuThiagoAndrade/rastro-quente/issues/62) (item 3) | `[FEATURE] Limites, densidade e série do período` | feature | [#61](https://github.com/EuThiagoAndrade/rastro-quente/issues/61) (leitura completa T6 e T7) |
| [#63](https://github.com/EuThiagoAndrade/rastro-quente/issues/63) (item 4) | `[FEATURE] Lentes no recorte da consulta` | feature | [#62](https://github.com/EuThiagoAndrade/rastro-quente/issues/62) |
| [#64](https://github.com/EuThiagoAndrade/rastro-quente/issues/64) (item 5) | `[FEATURE] Mapa-base de satélite` | feature | [#62](https://github.com/EuThiagoAndrade/rastro-quente/issues/62) |

Uma branch e uma PR por issue (`feature/issue-N`), squash. A ordem é fixa: 1 → 2 → 3 → 4 → 5 (o item 5 pode vir antes do 4, se o 4 parar por G1).

## Dependências e blockers

- Item 5 depende da ação externa do responsável para ser verificado com tiles reais; o código e o fallback não dependem.
- Nenhum blocker atual.

## Riscos, suposições e rollback

- **Reescrita grande da interface:** mitigada por issues sequenciais, estados preservados e E2E reescritos em cada PR. Rollback: reverter a PR.
- **Desempenho com todos os pontos e cálculo ao escolher:** T14 com parada; alternativa de reserva é voltar a página de registros só no mapa (não decidida; exigiria decisão do responsável).
- **G1 na divisa:** efeito declarado na tela (T5) e coberto por RC-2, RC-4 e RC-5.
- **Mudança na cobrança ou nas URLs da Esri:** fallback "Sem fundo"; ADR-010 com data de conferência.
- **CSP:** domínio errado quebra só o fundo; E2E e verificação em produção conferem.
- **Suposição:** o plano gratuito da Esri cobre o uso (H4 da ideação); com o pagamento por uso desligado, o pior caso é o fundo cair para "Sem fundo" até o mês seguinte.
- **Serviço de imagem da Esri:** o serviço de tiles estáticos só oferece os nomes; se não houver imagem oficial compatível com Leaflet por chave, o item 5 para e entrega só "Sem fundo" (T12).

## Sequência recomendada

1. Aprovação do plano e PR documental (ideação, plano, `cycles.md`); depois da integração, conferência e confirmação dos payloads das 5 issues com o responsável (`criar_issues`) e criação das issues.
2. Item 1 → item 2 → item 3 → item 4 → item 5, cada um com autorização, PR e merge próprios, e a regressão T20 em cada PR.
3. Ação externa e verificação em produção.
4. Encerramento e retorno do BL-007 e do BL-009 à fila.

## Referências

- Ideação `_project/ideations/007_interface_base.md`.
- ADR-002, ADR-003, ADR-005, ADR-007; KB-004, KB-005.
- `_project/backlog.md` em `e274e49` (BL-007, BL-009).
- Documentação pública da Esri (ArcGIS Location Platform, preços e serviço de mapas-base), consultada em 2026-11-14 na conversa; a conferência oficial é da issue 5.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | [#60](https://github.com/EuThiagoAndrade/rastro-quente/issues/60) (item 1), [#61](https://github.com/EuThiagoAndrade/rastro-quente/issues/61) (item 2), [#62](https://github.com/EuThiagoAndrade/rastro-quente/issues/62) (item 3), [#63](https://github.com/EuThiagoAndrade/rastro-quente/issues/63) (item 4), [#64](https://github.com/EuThiagoAndrade/rastro-quente/issues/64) (item 5) |
| PR(s) | [#59](https://github.com/EuThiagoAndrade/rastro-quente/pull/59) (squash integrada em 2026-11-14); [#65](https://github.com/EuThiagoAndrade/rastro-quente/pull/65) (item 1, aberta) |
| Branch(es) | `chore/cycle-007-plan` (documental); `feature/issue-60` (item 1, task [007_task_issue-60.md](007_task_issue-60.md)) |
| Destino após conclusão | `_project/executed/007_interface_base/007_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando autorização de implementação — ciclo 007 (completo)
Quem: Responsável
Conferir: Issue [#60](https://github.com/EuThiagoAndrade/rastro-quente/issues/60) e escopo do item 1 no plano
Diga: "autorizo a implementação da issue #60"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + aprovar_plano + 007_plan + v4`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v4` em `Em Revisão`, rodada 4 com `APTO COM RESSALVAS`, aprovação pendente; `Aguardando aprovação do plano`.
- `state_after`: plano `v4` `Aprovado` (`Aprovada em 2026-11-14`), ressalvas R4-1 e R4-2 incorporadas; `Pronto para continuar`, com a publicação da PR documental coberta pela aprovação.
- `result`: `executed`
- `evidence`: frase literal "aprovo o plano do ciclo 007" posterior ao veredito da rodada 4; parágrafo "Aprovação do plano — v4"; cabeçalho; linha `007` de `_project/cycles.md`.
- `blockers`: nenhum.

### Publicação da PR documental

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + publicar_pr_documental + ideacao_plano_cycles + plano-v4`
- `effect_class`: `remote_mutation`
- `state_before`: plano `v4` `Aprovado`; branch local `chore/cycle-007-plan` em `861bba6` com três arquivos staged; nenhuma PR ou branch remota do ciclo 007.
- `state_after`: commit `9e0ee1318b8bae3b8e7559c89e0a14c233788169` publicado em `chore/cycle-007-plan`; PR [#59](https://github.com/EuThiagoAndrade/rastro-quente/pull/59) aberta contra `main`; situação `Aguardando merge`.
- `result`: `executed`
- `evidence`: [PR #59](https://github.com/EuThiagoAndrade/rastro-quente/pull/59), arquivos e commit observados via `gh`; gates locais: teste de governança 55/55, validador 0 erros e 0 avisos, `git diff --check` sem achados; checks remotos consultados em 2026-11-14 e ainda `pending`.
- `blockers`: checks remotos pendentes; aprovação específica do merge ainda não concedida.

### Criação das issues após confirmação dos payloads

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + criar_issues + itens-1-a-5 + plano-v4`
- `effect_class`: `remote_mutation`
- `state_before`: PR #59 integrada em `2a0d3f5cf60059df2a7f6e5ba03abccb810f97c4`; plano v4 `Aprovado`; nenhuma issue do ciclo existia; último bloco registrado `Aguardando merge`.
- `state_after`: issues [#60](https://github.com/EuThiagoAndrade/rastro-quente/issues/60) a [#64](https://github.com/EuThiagoAndrade/rastro-quente/issues/64) abertas com os payloads confirmados; dependências verificadas; ciclo `007` permanece em `Planejamento`; aguardando autorização de implementação da issue #60.
- `result`: `executed`
- `evidence`: mensagem literal "confirmo os payloads dos itens 1 a 5"; integração da PR #59; títulos, URLs, corpos e dependências conferidos no GitHub via `gh`.
- `blockers`: autorização de implementação da issue #60 pendente.

### Registro anterior — revisão da rodada 4

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + revisar_plano + 007_plan/rodada-4 + v4@861bba6`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v4` em `Em Revisão`, revisão em andamento e aprovação pendente. Ciclo `007` em `Planejamento`, `Aguardando revisão (rodada 4)`.
- `state_after`: plano local `v4` em `Em Revisão`, rodada 4 concluída com `APTO COM RESSALVAS` e aprovação pendente. Ciclo `007` em `Planejamento`, `Aguardando aprovação do plano`.
- `result`: `executed`
- `evidence`: [parecer da rodada 4](#rodada-4), cabeçalho e bloco `Próximo passo`. Base `861bba6`, com `e274e49` ancestral de `main`. O registro local do ciclo não aponta issue nem PR. A consulta via `gh` não alcançou o GitHub.
- `blockers`: nenhum para a decisão de aprovação. R4-1 e R4-2 são ressalvas a conferir.

### Registro anterior — correção da rodada 3

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + rascunhar_plano + 007_plan + v4`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v3` em `Em Revisão`, rodada 3 com `REQUER NOVA RODADA`; `Aguardando correções (rodada 3)`.
- `state_after`: plano local `v4` em `Em Revisão`, resposta a R3-1 a R3-3 registrada, rodadas 1 a 3 preservadas; `Aguardando revisão (rodada 4)`.
- `result`: `executed`
- `evidence`: "Resposta do autor à rodada 3 — v4"; T7 e T11 revistos; T21 e LF-1 novos; CM-5 e item 2 revistos.
- `blockers`: nenhum para a rodada 4.

### Registro anterior — revisão da rodada 3

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + revisar_plano + 007_plan/rodada-3 + v3@861bba6`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v3` em `Em Revisão`, revisão em andamento e aprovação pendente, ciclo `007` em `Planejamento`, `Aguardando revisão (rodada 3)`.
- `state_after`: plano local `v3` em `Em Revisão`, rodada 3 concluída com `REQUER NOVA RODADA`, aprovação pendente, ciclo `007` em `Planejamento`, `Aguardando correções (rodada 3)`.
- `result`: `executed`
- `evidence`: [parecer da rodada 3](#rodada-3), cabeçalho e bloco `Próximo passo`. Base `861bba6`, com `e274e49` ancestral de `main`. O registro local do ciclo não aponta issue nem PR. A consulta via `gh` não alcançou o GitHub.
- `blockers`: R3-1 para obter veredito apto.

### Registro anterior — correção da rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + rascunhar_plano + 007_plan + v3`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v2` em `Em Revisão`, rodada 2 com `REQUER NOVA RODADA`; `Aguardando correções (rodada 2)`.
- `state_after`: plano local `v3` em `Em Revisão`, resposta a R2-1 a R2-5 registrada, rodadas 1 e 2 preservadas; `Aguardando revisão (rodada 3)`.
- `result`: `executed`
- `evidence`: "Resposta do autor à rodada 2 — v3"; T7, T11, T12, T14 e T20 revistos; casos CM-2 a CM-6 e PG-1; itens 2, 3 e 5 e decomposição revistos; `contrato.ts` (`destaques`), `combinacao.ts` (`celulas`), `persistencia.ts` (destaque por sequência) e `medir-lentes.mjs` (10.000.000 bytes) conferidos.
- `blockers`: nenhum para a rodada 3.

### Registro anterior — revisão da rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + revisar_plano + 007_plan/rodada-2 + v2@861bba6`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v2` em `Em Revisão`, revisão em andamento e aprovação pendente, ciclo `007` em `Planejamento`, `Aguardando revisão (rodada 2)`.
- `state_after`: plano local `v2` em `Em Revisão`, rodada 2 concluída com `REQUER NOVA RODADA`, aprovação pendente, ciclo `007` em `Planejamento`, `Aguardando correções (rodada 2)`.
- `result`: `executed`
- `evidence`: [parecer da rodada 2](#rodada-2), cabeçalho e bloco `Próximo passo`. Base `861bba6`, com `e274e49` ancestral de `main`. O registro local do ciclo não aponta issue nem PR. A consulta via `gh` não alcançou o GitHub.
- `blockers`: R2-1 e R2-2 para obter veredito apto.

### Registro anterior — correção da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + rascunhar_plano + 007_plan + v2`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v1` em `Em Revisão`, rodada 1 com `REQUER NOVA RODADA`; `Aguardando correções (rodada 1)`.
- `state_after`: plano local `v2` em `Em Revisão`, resposta a R1-1 a R1-9 registrada, rodada 1 preservada; `Aguardando revisão (rodada 2)`.
- `result`: `executed`
- `evidence`: "Resposta do autor à rodada 1 — v2"; T6, T11, T12 e T14 revistos; T15 a T20 e casos DS, SR e CM novos; itens, decomposição e sequência revistos; documentação da Esri conferida em 2026-11-14 (fontes em T12 e na resposta a R1-7).
- `blockers`: nenhum para a rodada 2.

### Registro anterior — revisão da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + revisar_plano + 007_plan/rodada-1 + v1@861bba6`
- `effect_class`: `local_mutation`
- `state_before`: plano local `v1` em `Rascunho`, revisão e aprovação pendentes; ciclo `007` em `Planejamento`; `Aguardando revisão (rodada 1)`.
- `state_after`: plano local `v1` em `Em Revisão`, rodada 1 concluída com `REQUER NOVA RODADA`, aprovação pendente; ciclo `007` em `Planejamento`; `Aguardando correções (rodada 1)`.
- `result`: `executed`
- `evidence`: [parecer da rodada 1](#rodada-1), cabeçalho e bloco `Próximo passo` deste plano; `HEAD`, `main` e a referência local `origin/main` em `861bba6`, com `e274e49` ancestral de `main`. A consulta via `gh` não alcançou o GitHub; o registro local do ciclo não aponta issue nem PR.
- `blockers`: R1-1 a R1-7 para obter veredito apto.

### Registro anterior — redação do plano

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + rascunhar_plano + 007_plan + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: ciclo `007` em `Ideação`, sem plano / plano `v1` em `Rascunho`, ciclo `007` em `Planejamento`
- `result`: `executed`
- `evidence`: este arquivo; linha `007` de `_project/cycles.md` com link do plano; distribuição de detecções por célula medida na carga local em 2026-11-14 (T8)
- `blockers`: nenhum

## Revisão crítica

### Rodada 1

- **Data:** 2026-11-14
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v1`, sem commit próprio, sobre `861bba6`.

#### Achados bloqueadores

- **R1-1 — A concentração perde sua unidade e sua explicação.** O item 2 abre Células ao escolher qualquer lente, e só descreve a explicação de uma célula. A concentração avulsa destaca **municípios**, com corte, empates e evidência próprios. T11 lista municípios, mas não define onde aparecem esses destaques nem como abrir seu motivo e sua evidência. Defina a aba, a seleção pelo mapa e pela lista, a explicação, o retorno de foco e os estados vazio e de erro da concentração. Preserve a ressalva sobre contagem absoluta junto do resultado da lente e teste a concentração avulsa e a concentração como critério da combinação. [Contrato vigente](../../knowledge/KB-005_contrato_lentes_selecao.md#concentração) · [Unidade do destaque](../../../src/lentes/concentracao.ts#L35).
- **R1-2 — Reuso em memória não define como detectar revogação e troca de carga.** T6 guarda também o resumo, e o item 2 pede que a troca de lente não refaça leitura. Hoje o carregador relê o resumo antes de reusar os registros: é uma chamada que pode detectar perda de acesso ou indisponibilidade da carga. Sem uma checagem com o servidor, limpar ao receber esses estados não cobre uma troca atendida só pela memória. Separe o que pode ser reaproveitado da checagem obrigatória, delimite a sessão e impeça respostas antigas de repor dados após a limpeza. Exija E2E de revogação e troca de carga com cache preenchido, além do logout; conte requisições de páginas separadamente da revalidação. Reavalie G2 se o comportamento de acesso mudar. [Contrato de reuso](../../knowledge/KB-005_contrato_lentes_selecao.md#leitura-e-erros) · [Carregador](../../../src/lentes/carregar.ts#L94) · [ADR-007](../../decisions/ADR-007_interface_consulta_prototipo.md#decisão).
- **R1-3 — Falta definir qual consulta e qual configuração disparam o cálculo.** A consulta vigente usa um formulário com envio, enquanto A3 e o item 2 passam a calcular ao escolher. O plano não diz se editar datas ou município antes de enviar pode trocar o resultado da lente enquanto mapa e série ainda mostram o recorte anterior. Também não diz quando um par de critérios, operador ou classe passa a valer nem o que fica visível se o recorte municipal excluir a concentração de uma combinação com apenas dois critérios. Defina o recorte efetivamente aplicado, a transição entre consultas e a política de configuração incompleta, reexecução e descarte; especifique o comportamento intermediário dos itens 2 e 3 enquanto as lentes ainda são estaduais. Teste edição pendente, chegada fora de ordem e a combinação que fica com um critério. [Formulário](../../../index.html) · [Contrato atual da combinação](../../knowledge/KB-005_contrato_lentes_selecao.md#combinação).
- **R1-4 — As novas contagens e agregações ainda não têm referência independente suficiente (G1).** T11 pede “focos em áreas protegidas” no cartão do município no item 2, mas a leitura atual de vínculos é sob demanda para a camada ou lente e um mesmo foco pode ter mais de um vínculo. Especifique quando e como obter o total e o que mostrar sem camada, durante a leitura e na falha. Leve à decisão humana casos como um foco em duas áreas (1 foco distinto ou 2 vínculos, conforme a métrica escolhida), um foco de outro município e um fora da janela. Para T8/T9, fixe casos que fechem a soma com o total principal no mesmo recorte, excluam o envelope de sensibilidade, cubram as fronteiras de todas as faixas e distingam um mês parcial sem detecções de indisponibilidade. Vincule cada verificação ao item que introduz a regra. [Vínculos múltiplos](../../knowledge/KB-006_areas_protegidas.md) · [Leitura sob demanda](../../../src/app.ts#L1012) · [Resumo e sensibilidade](../../../src/tipos.ts#L26).
- **R1-5 — A estrutura de três colunas não fixa o contrato para celular.** O item 1 define o arranjo de desktop e contraste, mas não especifica como filtros, mapa, resultado e diálogos ficam acessíveis com toque, ampliação e reflow. O ADR-007 e a suíte atual já exigem rolagem de página sem captura pelo mapa, e há testes em 320 px e com texto a 200%. Preserve esses casos como aceite da primeira PR; declare a ordem dos painéis em tela estreita, a navegação e o foco ao abrir ou fechar o mapa ampliado. Indique também onde permanece o resumo da sensibilidade Cuiabá por consulta, separado do total GMT, pois ele não é o conteúdo estático de “Sobre os dados”. [ADR-007](../../decisions/ADR-007_interface_consulta_prototipo.md) · [Teste atual](../../../tests/e2e/03-acessibilidade.spec.mjs#L119) · [Resumo atual](../../../src/apresentacao.ts#L201).
- **R1-6 — O orçamento T14 não é um gate reproduzível de ponta a ponta.** “Painel utilizável” pode ocorrer antes ou depois dos pontos/limites; “segunda lente” pode precisar de disponibilidade ainda não lida ou de áreas. O item 3 só mede abertura e pontos, embora a troca de lente exista no item 2 e o caminho municipal das lentes só termine no item 4. Defina início, estado final, cache frio/quente, recortes e configurações, repetições e estatística, e atribua medição e parada às PRs pertinentes. Reconcilie os desvios: o ciclo 005 registrou três uniões com medianas de 40,9 a 54,5 s, e T14 só trata explicitamente o desvio de terra indígena do ciclo 006. Diga quais limites e exceções se aplicam a cada cenário, para não aprovar nem parar uma PR com medidas incomparáveis. [Medição do ciclo 005](../../executed/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md#item-2--conferência-repetida-e-medição-da-interface) · [Medição do ciclo 006](../../executed/006_areas_protegidas_reais/006_task_issue-52.md#L67).
- **R1-7 — O mapa-base não fecha o caminho de ativação nem de falha.** T12 só prevê liberar `img-src`, mas `vercel.json` aplica `Referrer-Policy: no-referrer` e a Esri valida os domínios permitidos pelo cabeçalho `Referer`. Fixe um serviço de imagem e nomes compatível com o Leaflet atual, as origens necessárias e uma política que envie apenas a origem nos pedidos de tiles, preservando o restante. A faixa gratuita é limitada; explicite ativação sem cobrança por uso, parada se isso não for possível, e teste fallback também para chave rejeitada/expirada, cota ou falha dos tiles. A variável `VITE_` é incorporada no build: o roteiro deve prever nova compilação/publicação autorizada se a variável for cadastrada após o merge. Separe os critérios locais do item 5 do aceite após a ação externa e verifique em produção que **imagem e nomes** chegam e que desligar o fundo interrompe novos pedidos ao provedor. [Política vigente](../../../vercel.json#L16) · [Restrição de referrer](https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/api-key-credentials/location-platform/) · [Tiles estáticos](https://developers.arcgis.com/rest/static-basemap-tiles/) · [Preços](https://developers.arcgis.com/pricing/credits/) · [Build do Vite](https://vite.dev/guide/env-and-mode).

#### Ressalvas

- **R1-8 — RC-1 e rastreabilidade das versões.** No estado, o `recorte` continua `{ tipo: 'estado', municipio: null }`; RC-1 precisa dizer quais campos ficam iguais e quais mudam. Separe a comparação de equivalência estadual com a versão anterior da comparação municipal com o cálculo independente. Confira também se KB-003/KB-006 e o ADR que mantinha tiles fora do escopo precisam de remissão para os novos contratos no encerramento.
- **R1-9 — Reconciliar a sequência documental e as dependências.** Na tabela de aprovação e na sequência, explicite a conferência e confirmação dos payloads após a integração da PR documental, como exige [criar_issues](../../../.agent/workflows/criar_issues.md). A possibilidade de inverter os itens 2 e 3 precisa ser coerente com o reuso T6 adotado por T7 e com o ponto em que o ADR-009 passa a descrever o comportamento já integrado. Identifique também quais PRs reexecutam os casos de regressão pertinentes, pois cada merge altera o protótipo publicado.

**Itens atendidos:** alvo e versão compatíveis com a autorização de revisão; ciclo completo, modo contínuo desativado e aprovação pendente; coerência geral com a ideação, inclusive V13 como referência privada, escolhas de recorte, densidade opcional e limites de escopo. A divisão em cinco entregas e as barreiras G1 a G4 estão declaradas. A revisão não inspecionou a carga nem o mockup privados e não verificou o ambiente hospedado.

**Veredito:** `REQUER NOVA RODADA`. Responder aos achados R1-1 a R1-9 na próxima versão e submetê-la à revisão formal.

### Resposta do autor à rodada 1 — v2

- **Autor:** Claude Code (Opus 5.5), 2026-11-14.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R1-1 | **Corrigido.** A aba passa a ser "Destaques · N"; a concentração lista municípios com ordem, empates e a ressalva de contagem absoluta; seleção pela lista e pelo contorno no mapa; explicação com "Voltar aos destaques"; estados vazios e de erro atuais; concentração na combinação segue pela projeção P1. Caso RC-12 | T15, item 2 |
| R1-2 | **Corrigido.** O resumo é sempre relido (checagem com o servidor, como `lerRegistros` já faz); só páginas e disponibilidade são reaproveitadas; a memória pertence à geração de sessão e respostas antigas não a repõem; E2E de revogação e troca de carga com memória preenchida, com contagem separada de páginas e resumo. G2 continua `Não` porque todo uso passa pela RPC sob RLS | T6, item 2 |
| R1-3 | **Corrigido.** "Recorte aplicado" = última consulta válida; atalhos e município aplicam na hora, intervalo só quando válido; gerações descartam respostas fora de ordem; configuração vale ao mudar; combinação incompleta não calcula; comportamento provisório até o item 4 declarado | T16, itens 1, 2 e 4 |
| R1-4 | **Corrigido.** O cartão deixa de mostrar "focos em áreas protegidas" (proposta destacada para a aprovação); as demais contagens têm fonte e definição; série e densidade só com registros principais, somando `principal.total`; fronteiras de todas as faixas, mês parcial sem detecção e exclusão da sensibilidade em casos DS, SR e CM, cada um ligado ao item que introduz a regra | T11, T19, casos |
| R1-5 | **Corrigido.** Ordem em tela estreita, toque, 320 px, texto a 200%, rolagem sem captura pelo mapa, foco do mapa ampliado e dos diálogos no aceite do item 1; a sensibilidade America/Cuiaba fica no cartão da série, por consulta | T17, T18, item 1 |
| R1-6 | **Corrigido.** Protocolo com perfil, 5 repetições, mediana, frio e quente, início e fim por atributo de DOM; cenários M1 a M6 com limite e PR; desvios aceitos dos ciclos 005 (40,9 a 54,5 s) e 006 (42,3 s) mantidos sem piorar mais que 10% | T14 |
| R1-7 | **Corrigido, com parada prevista.** Documentação conferida: o serviço de tiles estáticos só tem os nomes (`arcgis/imagery/labels`, 512 px); a imagem vem do serviço de camadas de mapa-base, a confirmar na issue, com parada se não houver; `referrerPolicy` por camada mantendo `no-referrer` global; CSP com dois hosts; pagamento por uso desligado; troca para "Sem fundo" em chave rejeitada, cota ou falha; reimplantação depois da variável; aceite local separado do aceite em produção, que confere imagem, nomes e a interrupção dos pedidos | T12, item 5, pontos de aprovação |
| R1-8 | **Corrigido.** RC-1 lista campo a campo o que fica igual e o que muda (só a versão; o recorte estadual não muda); equivalência estadual e conferência municipal separadas; remissões de KB-003, KB-006 e ADR-007 conferidas no encerramento | RC-1, conferência, arquivos afetados |
| R1-9 | **Corrigido.** Confirmação dos payloads depois da PR documental na tabela de aprovação e na sequência; ordem fixa 1 → 2 → 3, porque o item 3 usa T6; ADR-009 criado no item 2 e completado no item 3; regressão por PR em T20 | Pontos de aprovação, decomposição, sequência, T20 |

Fontes da conferência da Esri (2026-11-14): [tiles estáticos](https://developers.arcgis.com/rest/static-basemap-tiles/), [camada de nomes sobre imagem](https://developers.arcgis.com/rest/static-basemap-tiles/arcgis-imagery-labels-tile-get/), [chaves e referrer](https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/api-key-credentials/location-platform/), [preços](https://location.arcgis.com/pricing/), [cobrança](https://location.arcgis.com/help/billing/). Não foi possível ler a página de atribuição nem a de créditos (vieram vazias); a issue 5 confere.

### Rodada 2

- **Data:** 2026-11-14
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v2`, sem commit próprio, sobre `861bba6`.

#### Achados bloqueadores

- **R2-1 — O item 2 perde a navegação dos pontos antes de ter o mapa completo.** O plano remove a tabela paginada no item 2 e manda manter os pontos “como hoje” até o item 3. Hoje a tabela controla a página exibida no mapa e permite selecionar os registros por teclado. Além disso, o cartão municipal do item 2 precisa de todas as páginas para passar em CM-1, mas T11 atribui essa leitura ao mapa do item 3. Se há 51 registros com uma página de 50 e o último é o único de sua célula, a primeira página omite um ponto e uma célula. Defina em qual PR começa a leitura completa do recorte municipal, inclusive sem lente, e como a pessoa alcança os registros das demais páginas na entrega intermediária. O aceite precisa cobrir mais de uma página. [Plano, item 2](#item-2--coluna-de-resultado-explicação-e-cálculo-ao-escolher) · [Paginação atual](../../../src/app.ts#L463) · [ADR-007](../../decisions/ADR-007_interface_consulta_prototipo.md#decisão).
- **R2-2 — Os destaques do cartão municipal têm unidade e recorte indefinidos.** T11 propõe contar `destaques`, mas o resultado da combinação tem `celulas`, e a persistência pode gerar mais de uma sequência por célula. CM-2 aceita “2” sem dizer o que conta. Duas sequências na mesma célula representam 2 sequências e 1 célula destacada. Nos itens 2 e 3, a lente ainda é estadual, então apresentar esse total dentro do cartão de um município pode atribuir resultados de fora do recorte ao município. Fixe para ratificação a unidade e o rótulo por tipo de resultado, a regra para o cartão enquanto a lente for estadual e a regra para a ordenação estadual por destaques quando uma célula cruza municípios. Exercite a persistência com duas sequências na mesma célula, a combinação e a transição para o recorte municipal. [Resultado de lente](../../../src/lentes/contrato.ts#L87) · [Resultado da combinação](../../../src/lentes/combinacao.ts#L92) · [Contrato da persistência](../../knowledge/KB-005_contrato_lentes_selecao.md#persistência).

#### Ressalvas

- **R2-3 — Completar a medição sem perder o critério de tráfego.** T14 agora dá perfil, repetições, limites e PRs. M3 deve explicitar o teto vigente de 10.000.000 bytes brutos, além dos limites de tempo. M1 precisa nomear o estado que indica filtros e resultados prontos ao longo do ciclo, mesmo quando os pontos acabarem antes. Reexecutar a abertura após o item 3 permite medir a concorrência com a leitura de todos os pontos e dos limites ligados por padrão. Harmonize o aceite de equivalência do item 1 com T20, que enumera as conferências de carga real só nos itens 2 a 4. [Gates do medidor](../../../scripts/interface/medir-lentes.mjs#L226) · [Plano, T14 e T20](#detalhes-técnicos-propostos-para-ratificação-na-aprovação).
- **R2-4 — Fechar os detalhes verificáveis da Esri na issue 5.** A Esri já publica a URL autenticada de `World_Imagery` no host previsto e o Leaflet 1.9.4 aplica `referrerPolicy` antes de definir a URL da imagem. A ativação com credencial real segue como verificação em produção. Registre os dois serviços e seus privilégios na issue, e cubra apenas os zooms suportados pelo mapa. Separe a execução sem chave da execução com valor fictício e tiles interceptados, conforme os dois aceites locais. [World Imagery](https://developers.arcgis.com/rest/basemap-styles/service-data/#map-tile-services) · [Leaflet 1.9.4](https://github.com/Leaflet/Leaflet/blob/v1.9.4/src/layer/tile/TileLayer.js#L139-L165) · [Privilégios da Esri](https://developers.arcgis.com/documentation/security-and-authentication/reference/privileges/location-platform/).
- **R2-5 — Alinhar o resumo do escopo com a v2.** Objetivo, escopo e T5 ainda mandam usar a aba “Células” e o botão “Voltar às células”. T15 e o item 2 usam “Destaques · N” e “Voltar aos destaques”. Preserve as decisões históricas como tais e use os rótulos propostos para entrega nas seções normativas. A lista de testes chama RC-12 de unitário e o caso exige abrir uma explicação na interface. Atribua a seleção e o retorno de foco ao E2E e deixe a contagem e os empates no teste do cálculo.

**Retorno à rodada 1.** R1-1, R1-2, R1-3 e R1-5 foram atendidos pelo detalhamento de apresentação, revalidação, consulta aplicada e acessibilidade. R1-4 ganhou casos de série e densidade e uma proposta explícita de retirar do cartão a contagem em áreas protegidas. As regras intermediárias do cartão e da paginação precisam dos ajustes acima. R1-6, R1-7, R1-8 e R1-9 progrediram com o protocolo de medição, o caminho de ativação e falha do mapa-base, a equivalência estadual e a sequência das PRs. Permanecem as ressalvas da rodada 2. A revisão usou os arquivos versionáveis e a documentação pública, sem acesso à carga privada, ao mockup ou a credenciais da Esri. A consulta via `gh` não alcançou o GitHub.

**Veredito:** `REQUER NOVA RODADA`. Os bloqueadores diminuíram de sete para dois. Corrigir R2-1 e R2-2, responder às três ressalvas e submeter a nova versão.

### Resposta do autor à rodada 2 — v3

- **Autor:** Claude Code (Opus 5.5), 2026-11-14.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R2-1 | **Corrigido.** A leitura completa do recorte (com ou sem lente) e todos os pontos no mapa passam para o item 2, na mesma PR que remove a tabela; não há entrega intermediária com uma página. Pontos continuam tocáveis com balão; a perda do acesso por teclado aos registros crus sem lente é consequência de A5, declarada e destacada para a aprovação. PG-1 cobre mais de uma página; M4 vai para o item 2 | T7, item 2, PG-1, T14 |
| R2-2 | **Corrigido.** A unidade é sempre célula distinta (persistência com duas sequências na mesma célula conta 1; combinação conta `celulas`); concentração não conta células. O cartão mostra "—" enquanto a lente for estadual (itens 2 e 3). Na ordenação estadual, célula na divisa conta para cada município, com aviso. CM-2 a CM-6 cobrem persistência, combinação, divisa, concentração e a transição para o recorte municipal | T11, CM-2 a CM-6 |
| R2-3 | **Corrigido.** M3 inclui o teto de 10.000.000 bytes brutos; M1 termina em `data-estado-painel="pronto"` (filtros, série e aba Municípios), independentemente de pontos e limites, e é repetida nos itens 2 e 3; T20 inclui o item 1 nas conferências estaduais | T14, T20 |
| R2-4 | **Corrigido.** Fatos da rodada 2 registrados em T12; a issue registra serviços e privilégios e limita o `maxZoom`; execuções sem chave e com valor fictício e rotas interceptadas separadas no aceite | T12, item 5 |
| R2-5 | **Corrigido.** Objetivo, escopo e T5 usam "Destaques" e "Voltar aos destaques"; as decisões históricas da ideação ficam como estão. RC-12 dividido: cálculo e empates no unitário; seleção, explicação e foco no E2E | Objetivo, escopo, T5, RC-12, estratégia de testes |

### Rodada 3

- **Data:** 2026-11-14
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v3`, sem commit próprio, sobre `861bba6`.

#### Achado bloqueador

- **R3-1 — A retirada da tabela deixa detalhes de registros sem acesso equivalente.** T7 oferece data e hora, município, coordenadas e identificador por clique ou toque. Sem lente, uma pessoa que usa só teclado deixa de conseguir consultar esses campos. A explicação da lente cobre apenas evidências dos destaques. Há também registros que compartilham coordenadas: o Canvas do Leaflet envia o clique a uma única camada, e a tabela atual permite distinguir esses registros. A5 retira a tabela da tela e o objetivo preserva a capacidade de consulta. Defina no item 2 um meio de consultar por teclado e leitor de tela os mesmos detalhes, inclusive sem lente e para registros na mesma coordenada, usando a leitura de T7. Um controle textual sob demanda no mapa pode oferecer isso dentro do escopo de A5. Amarre o aceite a um E2E que selecione, só por teclado, dois registros fictícios na mesma coordenada com horários diferentes. [Contrato de interface do ciclo 003](../../executed/003_implementacao_prototipo/003_plan.md#L177) · [Teste de teclado atual](../../../tests/e2e/03-acessibilidade.spec.mjs#L168) · [Clique no Canvas do Leaflet](https://github.com/Leaflet/Leaflet/blob/v1.9.4/src/layer/vector/Canvas.js#L332-L345) · [Critério de teclado WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).

#### Ressalvas

- **R3-2 — Limitar o reaproveitamento de T7 ao recorte efetivamente igual.** T7 diz que lente, mapa e cartão usam a mesma leitura. Até o item 4, T16 mantém a lente estadual com município selecionado. Nessa etapa, mapa e cartão leem o município, e a lente usa a chave estadual de T6. Explicite a exceção em T7 e o alcance do teste de zero páginas relidas. A primeira troca de uma consulta municipal sem lente para uma lente estadual pode precisar carregar as páginas do estado. [Recorte estadual vigente](../../../src/lentes/carregar.ts#L26).
- **R3-3 — Dar à legenda de divisa o mesmo significado da contagem.** T11 atribui uma célula a um município quando há pelo menos um registro principal daquele município na célula. “Célula na divisa conta nos dois municípios” também pode ser lida como interseção geométrica. Na regra proposta, uma célula que cruza A e B e contém registros só de A soma 1 para A e 0 para B. Faça a legenda dizer “conta em cada município com detecção na célula” e use esse caso ao verificar CM-5.

**Retorno à rodada 2.** R2-1 foi atendido quanto à sequência das entregas. A tabela sai na mesma PR que inclui a leitura completa e todos os pontos, com PG-1 acima de uma página. R2-2 foi atendido pela unidade célula distinta, pelos casos de persistência e combinação e pelo cartão sem total municipal enquanto a lente for estadual. R2-3 a R2-5 foram atendidos pelo teto de tráfego e pelas medições por PR, pelo teste local do mapa-base em dois modos e pelo alinhamento dos rótulos e de RC-12. O bloqueador desta rodada é a perda de acesso equivalente introduzida expressamente em T7. A revisão usou a documentação versionável e as fontes públicas. A consulta via `gh` não alcançou o GitHub.

**Veredito:** `REQUER NOVA RODADA`. Corrigir R3-1, responder às ressalvas e submeter a nova versão. O número de bloqueadores caiu de dois para um.

### Resposta do autor à rodada 3 — v4

- **Autor:** Claude Code (Opus 5.5), 2026-11-14.

| Achado | Resposta | Onde |
| :-- | :-- | :-- |
| R3-1 | **Corrigido.** "Lista de focos" sob demanda no mapa, no item 2, com os mesmos campos do balão, lida de T7, acessível por teclado e leitor de tela, com seleção que marca o ponto; registros na mesma coordenada são linhas distintas, e o balão do ponto lista todos. E2E LF-1 só por teclado com dois registros na mesma coordenada e horários diferentes. A tabela fixa não volta (A5) | T7, T21, item 2, LF-1 |
| R3-2 | **Corrigido.** T7 declara a exceção até o item 4 (mapa e cartão no município, lente no estado) e restringe o teste de zero páginas relidas a trocas entre recortes já lidos | T7, item 2 |
| R3-3 | **Corrigido.** A legenda diz "conta em cada município com detecção nela"; CM-5 inclui a célula que cruza A e B com detecções só de A, que soma 1 para A e 0 para B | T11, CM-5 |

### Rodada 4

- **Data:** 2026-11-14
- **Autor:** Claude Code (Opus 5.5)
- **Revisor:** Codex (GPT-6)
- **Base:** plano local `v4`, sem commit próprio, sobre `861bba6`.

**Retorno à rodada 3.** R3-1 foi atendido. A lista sob demanda de T21 consulta o mesmo conjunto do mapa sem nova requisição. O item 2 inclui navegação por teclado, anúncio do registro selecionado, retorno do foco e acesso individual a duas detecções na mesma coordenada. O balão do ponto apresenta ambas. A solução preserva o acesso aos detalhes e a composição sem tabela fixa proposta em A5. R3-2 foi atendido pela exceção de T7 para a lente estadual com mapa e cartão municipais nos itens 2 e 3. R3-3 foi atendido. A legenda de T11 usa presença de detecção, e CM-5 espera A = 3 e B = 1, incluindo a célula que cruza a divisa com detecções só em A.

#### Ressalvas

- **R4-1 — A linha de aprovação precisa remeter à Lista de focos.** O cabeçalho da v4 apresenta T21 como proposta para aprovação, mas a tabela de pontos de aprovação ainda termina em T20. Ao registrar a aprovação, inclua T21 na conferência de escopo e vincule LF-1 ao aceite do item 2. As decisões de G1 continuam nos casos e nos termos de cálculo correspondentes. [Pontos de aprovação](#pontos-de-aprovação) · [Proposta para ratificação](#detalhes-técnicos-propostos-para-ratificação-na-aprovação).
- **R4-2 — Explicite a condição sem lente em LF-1.** T21 já independe da lente ativa. No payload do item 2, registre que LF-1 deve começar sem lente e verificar o anúncio acessível dos dois registros, além do anel e do retorno de foco. Um anel na mesma coordenada tem aparência idêntica nas duas seleções, então o anúncio precisa distinguir os horários ou identificadores. [Caso LF-1](#casos-de-referência-g1).

**Veredito:** `APTO COM RESSALVAS`. Sem bloqueadores. O responsável pode decidir a aprovação da v4 após conferir as ressalvas e a proposta de painel sob demanda. A revisão verificou os critérios no plano e o fluxo atual no código local. A consulta via `gh` não alcançou o GitHub.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
