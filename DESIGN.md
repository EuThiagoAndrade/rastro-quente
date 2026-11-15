# Contrato visual — Rastro Quente

> **Origem:** ciclo `007` (interface base), issue #60. Visual copiado da referência V13 (mockup privado em `local/`, fora do Git), por decisão do responsável em 2026-11-14 ("Autorizo copiar o visual da V13, sem os dados fictícios"). Nenhum dado, contagem ou malha do mockup entra no repositório.
> **Autoridade:** `.agent/ai_behavior.md` (matriz de autoridade) e `_project/README.md`. Mudança deste contrato segue a triagem; a trilha curta só corrige divergência em relação a ele.
> **Implementação:** `src/estilos/tokens.css` (tokens), `src/estilos/*.css` (componentes e layout), `index.html` (estrutura), `public/favicon.svg` (marca).
> **Conferência:** `tests/unit/contraste.test.mjs` (pares de cor nos dois temas) e `tests/e2e/03-acessibilidade.spec.mjs` (fontes, contraste na tela, alvos, reflow, teclado, toque).

## Princípios

1. **Pergunta → onde → resposta.** À esquerda, os filtros (o que se pergunta); no centro, o mapa e, abaixo dele, a série e a disponibilidade (onde); à direita, o resultado (a resposta).
2. **O que está à esquerda vale para tudo.** O recorte aplicado (período e município) é o único que o mapa, a série e os municípios usam. Enquanto as lentes forem estaduais (até o item 4 do ciclo 007), a tela diz isso.
3. **Domínio antes de estética.** Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração; uma lente indica onde olhar, não ranking nem prova; densidade é contagem, não gravidade. As três frases ficam no rodapé fixo.
4. **Cor nunca é o único sinal.** Toda distinção por cor tem também texto, símbolo, traço ou preenchimento.
5. **Nenhum controle sem função.** Uma parte da V13 só aparece quando a função dela estiver entregue (abas e ordenação chegaram no item 2; série mensal, "Camadas" e ampliar, no item 3; o fundo de satélite, no item 5, e só com a chave da Esri no build).
6. **Nada gravado no navegador.** Nem dados de consulta nem preferências: o tema vale só enquanto a página estiver aberta (ADR-007).

## Tokens de cor

A tela abre sempre no tema claro (`:root`); o botão da lua define `data-tema="escuro"` na raiz e o do sol volta ao claro.

| Token | Claro | Escuro | Uso |
| :-- | :-- | :-- | :-- |
| `--fundo` | `#f4f6f2` | `#0f1f1a` | Fundo da página |
| `--superficie` | `#ffffff` | `#16291f` | Topo, colunas, cartões, diálogos, rodapé |
| `--superficie-suave` | `#f1f4ee` | `#1d3428` | Chips, botões, números do resumo, painéis |
| `--texto` | `#1f3529` | `#e7efe6` | Texto principal |
| `--texto-suave` | `#4c6155` | `#a9bcae` | Rótulos em caixa alta, notas, perguntas das lentes |
| `--contorno-suave` | `#d9e0d5` | `#2c463a` | Bordas de cartões, colunas, botões e divisórias |
| `--contorno` | `#7f9086` | `#6c8578` | Borda dos campos (período, município, datas) |
| `--escolha` | `#4f7c65` | `#8dbba3` | Verde-sálvia: botão principal, ferramenta ligada, lente marcada |
| `--sobre-escolha` | `#ffffff` | `#10241a` | Texto sobre `--escolha` |
| `--escolha-suave` | `#edf2f0` | `#22382c` | Fundo da lente marcada e da etiqueta "ativa" |
| `--link` | `#3f6b55` | `#a9d2bc` | Texto de ação (nomes de municípios, "ativa") |
| `--foco` | `#1d4ed8` | `#93c5fd` | Contorno de foco (3 px) |
| `--selecao-amostra` | `#1d4ed8` | `#93c5fd` | Seleção na legenda e na linha da tabela |
| `--linha-selecionada` | `#dbeafe` | `#1e3a5f` | Linha selecionada da "Lista de focos" |
| `--erro` | `#9b1c1c` | `#fca5a5` | Erro de campo |
| `--aviso-fundo` / `--aviso-borda` / `--aviso-texto` | `#fff6df` / `#8f6400` / `#4a3400` | `#3a2c0c` / `#d9a43a` / `#fde8b3` | Estados e frase destacada do rodapé |
| `--classe-lacuna` | `#8a1c1c` | `#fca5a5` | Disponibilidade: lacuna conhecida (borda contínua) |
| `--classe-indeterminada` | `#6b4a00` | `#f3c969` | Disponibilidade: incidência indeterminada (borda tracejada) |
| `--classe-sem-evidencia` | `#2f4a3c` | `#a7d3b8` | Disponibilidade: sem evidência de lacuna (borda pontilhada) |
| `--barra` | `#f97316` | `#f97316` | Barras da série (laranja da detecção) |
| `--deteccao-escura` | `#7c2d12` | `#fdba74` | Borda das amostras na legenda |
| `--densidade-0` a `--densidade-4` | `#fed7aa` `#fdba74` `#f97316` `#c2410c` `#7c2d12` | iguais | Densidade por célula, classes 1 · 2–3 · 4–9 · 10–24 · 25+ (mapa e legenda); cada classe tem o número escrito na legenda |

Iguais nos dois temas, porque o mapa tem fundo próprio escuro: `--mapa-fundo` `#152e27`, `--deteccao` `#f97316`, `--selecao-mapa` `#93c5fd`, `--limite` `#6f9a88`, `--destaque` `#fde68a` e as áreas protegidas `--area-integral` `#86efac`, `--area-sustentavel` `#c4b5fd`, `--area-indigena` `#f9a8d4` (as mesmas constantes de `src/mapa.ts`; cada classe também tem traço e hachura próprios).

**Ajustes em relação à V13** (decididos pelo responsável, só para cumprir o contraste mínimo): no tema claro, `--escolha` `#5a8a71` → `#4f7c65` (texto branco 3,96 → 4,77:1), `--aviso-borda` `#a0700d` → `#8f6400` (4,36 → 5,26:1) e a borda dos campos `#d9e0d5` → `--contorno` `#7f9086` (1,35 → 3,37:1); no escuro, a borda dos campos usa `#6c8578`.

Pares exigidos, nos dois temas: texto informativo ≥ 4,5:1 sobre a superfície em que aparece; pistas de controles, foco, estados, gráficos e camadas do mapa ≥ 3:1.

**Exceção:** as barras da série mantêm o laranja da V13 (`#f97316`, cerca de 2,8:1 sobre o cartão claro), por decisão do responsável em 2026-11-14 ("mantenha o laranja da V13"). A série tem a tabela "Ver a série como tabela" como alternativa em texto.

## Tipografia e espaçamento

- Fontes do sistema (`Segoe UI`, `Arial`, `sans-serif`); código em `Consolas`/`Courier New`.
- Base `1rem`, piso de `0.875rem` para qualquer texto (a V13 usava 0,75 rem em alguns rótulos; o piso do projeto prevalece). Marca `1.35rem` (celular `1rem`). Títulos de cartão em caixa alta, `0.875rem`, peso 600, espaçamento 0,045 em.
- Raio de `12px` em colunas e cartões, `10px` em botões de ícone e opções de lente, `8px` em campos e botões, pílula em chips.
- Espaço entre blocos `0.75rem` (`1rem` a partir de 1.600 px).
- Alvo de toque mínimo de 44 × 44 px em botões, campos, títulos de seção e rótulos de opção.

## Componentes

- **Marca:** ícone de chama em quadrado verde arredondado (48 px; 36 px no celular), "Rastro Quente" e "Um território. Muitos sinais.".
- **Chips do topo:** "Satélite **AQUA_M-T** · INPE" e "Fontes: …"; só com acesso autorizado; escondidos no celular.
- **Botões de ícone (44 px):** dados (abre "Sobre os dados"), "Como ler esta tela" (?) e tema (lua/sol), com `aria-label` e `title`.
- **Botão:** superfície suave com borda de 2 px; **principal** preenchido em `--escolha` ("Entendi").
- **"Limpar tudo":** pílula com ícone de voltar no cabeçalho dos filtros; desativado quando período, município e lente já estão no padrão.
- **Seção recolhível:** `<details>` com título clicável sem seleção de texto e "+"/"−" à direita; a etiqueta "ativa" aparece na seção da lente marcada; a Consulta fechada mostra o recorte aplicado no título.
- **Campo:** seletor e data com borda de 1 px `--contorno`; o período usa um seletor ("Janela inteira", "Últimos 6 meses", "Últimos 3 meses", "Último mês", "Intervalo personalizado…") e o resumo "dd/mm/aaaa a dd/mm/aaaa · N dias GMT".
- **Opção de lente:** cartão com o nome, a pergunta que responde e a descrição; marcada com fundo `--escolha-suave` e barra à esquerda; a combinação tem borda tracejada; classes e lentes a combinar aparecem dentro do cartão marcado.
- **Mapa:** cartão sem moldura extra, com controles flutuantes translúcidos (ferramentas no alto à esquerda, "Camadas" recolhível e o botão de ampliar no alto à direita, "Legenda" recolhível embaixo à esquerda, zoom embaixo à direita). No celular, as ferramentas descem para a linha abaixo de "Camadas". O painel "Camadas" aberto fica por cima da legenda.
- **Mapa-base (ADR-010):** no início das ferramentas, separado por uma linha, os botões de alternância "Satélite" e "Sem fundo" da V13 (o marcado em `--escolha`); "Ruas" não existe. Com chave, "Satélite" é o padrão; sem chave, fica `aria-disabled`, riscado, com o aviso "Satélite indisponível: mapa-base não configurado neste ambiente." numa caixa de aviso logo abaixo do mapa, e "Sem fundo" é o padrão. Falha dos tiles volta a "Sem fundo" com "Fundo de satélite indisponível agora.". A atribuição da Esri fica no controle do Leaflet enquanto o fundo estiver ligado.
- **Camadas:** caixas "Limites municipais (IBGE)" (ligada), "Áreas protegidas", "Detecções individuais" (ligada) e "Densidade por célula"; alvo de 44 px por linha.
- **Mapa ampliado:** ícone de setas (ampliar/reduzir) com `aria-pressed` e rótulo "Ampliar mapa"/"Reduzir mapa"; as colunas laterais saem e mapa e cartões do centro ocupam a largura toda.
- **Série:** barras da V13 (valor na mensal, coluna `--barra` e rótulo em dia ou mês GMT); mês parcial com `*` e coluna hachurada; nota da unidade acima e legenda com o total e a nota de mês parcial abaixo; tabela recolhível como alternativa.
- **Cartão:** superfície com borda `--contorno-suave`, título em rótulo de caixa alta.
- **Abas do resultado (V13):** "Destaques · N" e "Municípios", texto `0.875rem` peso 600; a aba aberta tem fundo `--superficie-suave` e sublinhado de 3 px em `--barra`; as abas quebram de linha em vez de transbordar.
- **Lista de destaques:** resumo da lente (bloco com barra `--escolha` à esquerda, nome, quantidade em número grande e o recorte), itens como botões de linha inteira (alvo ≥ 44 px), o aberto marcado com barra `--escolha`; a concentração traz a ressalva de contagem absoluta em caixa de aviso. Sem lente, estado vazio com o ícone de satélite.
- **Explicação:** "← Voltar aos destaques" (botão de texto em `--link`), título "Por que esta célula?" ou "Por que este município?", ficha em duas colunas (uma no celular), um bloco por critério com barra `--escolha` (lilás-rosa `--area-indigena` na sobreposição), caixa "Ressalvas" nas cores de aviso, as detecções que sustentam o destaque num bloco recolhível e metadados ao fim, separados por linha.
- **Aba Municípios:** pílulas de ordenação ("Detecções", "Destaques da lente", "Nome"; a marcada em `--texto` sobre `--fundo`), lista com posição, nome, detalhe, barra `--barra` proporcional e número; com município escolhido, cartão com barra `--escolha` à esquerda e "Ver todo Mato Grosso".
- **Lista de focos:** cartão abaixo do mapa, aberto pelo botão "Lista de focos" das ferramentas do mapa; cada linha é um botão com dia e hora GMT, município, coordenadas e identificador; a linha selecionada usa `--linha-selecionada` e barra `--selecao-amostra`.
- **Balão do ponto:** balão do Leaflet com todos os registros da mesma coordenada e a frase de domínio.
- **Diálogo:** `<dialog>` modal nativo, raio de 14 px; "Como ler esta tela" em quatro passos numerados com "Entendi"; "Sobre os dados" com a proveniência completa e "Fechar".
- **Rodapé de domínio:** fixo no fim da tela, com a primeira frase em destaque (`--aviso-borda`); no celular, só a primeira frase.
- **Barra de rolagem:** nas colunas e abaixo do mapa, só aparece ao passar o mouse ou com o foco dentro.

## Layout

- **Topo:** marca à esquerda; chips; botões de ícone; estado da sessão e "Sair".
- **Tela de acesso:** sem sessão autorizada, só o topo (marca, tema, sessão), o cartão de acesso com o aviso de domínio e o rodapé. Nenhum dado nem geometria é pedido.
- **Computador (≥ 1.180 px de largura e ≥ 700 px de altura):** a tela inteira, sem rolagem da página; três colunas de 280 px, flexível e 336 px (304/360 px a partir de 1.600 px). O centro tem o mapa em cima e, embaixo, a "Lista de focos" (quando aberta) e os cartões "No mapa", "Detecções no período" e disponibilidade, com rolagem própria. Filtros e resultado rolam por dentro.
- **Notebook (761 px a 1.179 px, ou altura menor que 700 px):** filtros à esquerda (280 px), mapa (520 px) e cartões à direita; o resultado desce para baixo, na largura toda.
- **Celular (≤ 760 px):** uma coluna na ordem filtros, mapa (440 px), cartões do centro, resultado; seções fechadas; chips escondidos.
- Nenhuma largura produz rolagem horizontal da página; tabelas rolam dentro da própria região.

## Estados

- **Sessão e versão (ADR-007):** sem configuração, verificando, sem sessão (com "Você saiu" ou "Sua sessão expirou"), negado, sem publicação, fonte indisponível, autorizado e versão substituída — cada um com texto e `data-estado` próprios.
- **Consulta:** carregando, zero (nunca "ausência de fogo"), fonte indisponível e inconsistente (com "Tentar novamente"), entrada recusada e versão substituída (com "Carregar a versão vigente").
- **Painel:** `data-estado-painel` em `#conteudo`: `carregando`, `pronto` (filtros, série e municípios prontos) ou `erro`.
- **Pontos (ADR-009):** `data-estado-pontos` em `#conteudo`: `nenhum`, `carregando` (com "N de M detecções"), `completo` (todos os pontos do recorte) ou `erro` (nenhum ponto pela metade).
- **Limites (ADR-009):** `data-estado-limites` em `#conteudo`: `desligado`, `carregando`, `completo` ou `erro` (com o aviso próprio; pontos e números continuam).
- **Somas em tela:** `data-total` em `#serie` e em `#legenda-densidade`, iguais a `principal.total` do recorte aplicado.
- **Recorte aplicado:** período personalizado inválido mostra o erro junto do campo e a linha "Mostrando <recorte>"; a tela não muda.
- **Lente, combinação, sobreposição e áreas:** estados de `data-estado-lente` e `data-estado-areas`, com os textos das KBs e dos ciclos `004` a `006`, mais `incompleta` (combinação com menos de 2 lentes). A lente é calculada ao escolher, sem botão; o estado fica acima da lista e da explicação. Como na V13, não há "Nenhuma lente" visível: a lente sai por "Limpar tudo".
- Zero, pendente e indisponível nunca são apresentados como valor numérico parcial.

## Acessibilidade

- Contraste conforme "Tokens de cor", conferido nos dois temas.
- Foco visível de 3 px em todo controle; ordem de tabulação segue a leitura (topo, filtros, mapa, cartões, resultado); atalho "Ir para o conteúdo".
- Todo controle tem rótulo (os botões de ícone por `aria-label`); grupos usam `fieldset`/`legend`; estados dinâmicos usam `role="status"` ou `role="alert"`.
- Texto ampliado a 200% e largura de 320 px sem corte nem rolagem horizontal da página.
- Toque: um dedo rola a página; o mapa só arrasta com "Mover o mapa com um dedo".
- Mapa ampliado: o foco vai para o mapa; Esc ou o mesmo botão voltam, com o foco no botão.
- O mapa tem alternativa em texto ("Lista de focos" e lista da aba Destaques); as abas seguem o padrão de abas (setas, Home e End); voltar da explicação devolve o foco ao item aberto.
- `prefers-reduced-motion` desliga animações e transições.
