# Contrato visual — Rastro Quente

> **Origem:** ciclo `007` (interface base), issue #60. Escrito do zero; o mockup privado de referência não é contrato.
> **Autoridade:** `.agent/ai_behavior.md` (matriz de autoridade) e `_project/README.md`. Mudança deste contrato segue a triagem; a trilha curta só corrige divergência em relação a ele.
> **Implementação:** `src/estilos/tokens.css` (tokens), `src/estilos/*.css` (componentes e layout), `index.html` (estrutura).
> **Conferência:** `tests/unit/contraste.test.mjs` (pares de cor nos dois temas) e `tests/e2e/03-acessibilidade.spec.mjs` (fontes, contraste na tela, alvos, reflow, teclado, toque).

## Princípios

1. **Pergunta → onde → resposta.** À esquerda, o que se pergunta (filtros e lentes); no centro, onde estão as detecções (mapa, série e disponibilidade); à direita, a resposta (resultado da lente e municípios).
2. **O que está à esquerda vale para tudo.** O recorte aplicado (período e município) é o único que o mapa, a série, as abas e os municípios usam. Enquanto as lentes forem estaduais, a tela diz isso ("Lentes: todo Mato Grosso").
3. **Domínio antes de estética.** Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração; uma lente indica onde olhar, não ranking nem prova; densidade é contagem, não gravidade. Essas frases estão no rodapé de toda tela e em todo texto novo que as tocar.
4. **Cor nunca é o único sinal.** Toda distinção por cor tem também texto, símbolo, traço ou preenchimento.
5. **Nada gravado no navegador.** Nem dados de consulta nem preferências: o tema escolhido vale só enquanto a página estiver aberta (ADR-007).

## Tokens de cor

Os temas são definidos uma única vez com `light-dark(claro, escuro)` em `:root`. O tema segue `prefers-color-scheme`; o botão "Tema escuro" fixa `data-tema="claro"` ou `data-tema="escuro"` na raiz, sem persistir.

| Token | Claro | Escuro | Uso |
| :-- | :-- | :-- | :-- |
| `--fundo` | `#f4f5f1` | `#0f1714` | Fundo da página |
| `--superficie` | `#ffffff` | `#17221d` | Colunas, blocos, diálogos, topo, rodapé, botão secundário |
| `--superficie-suave` | `#eef1ea` | `#1f2d27` | Números do resumo, painéis da lente, cabeçalho de tabela |
| `--texto` | `#1f3329` | `#e6ede8` | Texto principal |
| `--texto-suave` | `#46594e` | `#b3c2b9` | Ajuda, etiquetas, resumo de seção |
| `--identidade` | `#254b39` | `#a7d3b8` | Marca e borda do aviso de acesso |
| `--contorno` | `#5b6d63` | `#8a9c91` | Borda de campos e botões secundários |
| `--contorno-suave` | `#cfd6cc` | `#33463c` | Linhas divisórias e bordas de blocos |
| `--escolha` | `#3b6650` | `#9cc5ad` | Verde-sálvia: ação primária, opção marcada, etiqueta "ativa", botão de texto |
| `--sobre-escolha` | `#ffffff` | `#0f1714` | Texto sobre `--escolha` |
| `--escolha-suave` | `#e1ebe4` | `#22352c` | Fundo de chip marcado e chips do topo |
| `--foco` | `#3b6650` | `#9cc5ad` | Contorno de foco (3 px) |
| `--selecao-mapa` | `#93c5fd` | `#93c5fd` | Traço tracejado da seleção no mapa (o azul é só da seleção no mapa) |
| `--selecao-amostra` | `#1d4ed8` | `#93c5fd` | Amostra da seleção na legenda e marca da linha selecionada |
| `--linha-selecionada` | `#dbeafe` | `#1e3a5f` | Linha selecionada da tabela de registros |
| `--erro` | `#9b1c1c` | `#fca5a5` | Erro de campo |
| `--aviso-fundo` / `--aviso-borda` / `--aviso-texto` | `#fff7e0` / `#8a5a00` / `#4a3200` | `#2b2410` / `#d4a72c` / `#f5e3b3` | Estados (zero, pendência, falha, "Mostrando") |
| `--classe-lacuna` | `#8a1c1c` | `#fca5a5` | Disponibilidade: lacuna conhecida (borda contínua) |
| `--classe-indeterminada` | `#6b4a00` | `#f3c969` | Disponibilidade: incidência indeterminada (borda tracejada) |
| `--classe-sem-evidencia` | `#2f4a3c` | `#a7d3b8` | Disponibilidade: sem evidência de lacuna (borda pontilhada) |
| `--barra` | `#b45309` | `#f59e0b` | Barras da série |
| `--deteccao-escura` | `#7c2d12` | `#fdba74` | Borda das amostras de detecção e de destaque na legenda |

Cores iguais nos dois temas, porque o mapa tem fundo próprio escuro: `--mapa-fundo` `#152e27`, `--deteccao` `#f97316`, `--limite` `#6f9a88`, `--destaque` `#fde68a` e as áreas protegidas `--area-integral` `#86efac`, `--area-sustentavel` `#c4b5fd`, `--area-indigena` `#f9a8d4` (as mesmas constantes de `src/mapa.ts`; cada classe também tem traço e hachura próprios).

Pares exigidos, nos dois temas: texto informativo ≥ 4,5:1 sobre a superfície em que aparece; pistas de controles, foco, estados, gráficos e camadas do mapa ≥ 3:1. Em escala de cinza, o preenchimento do botão primário se distingue da superfície do secundário.

## Tipografia e espaçamento

- Fontes do sistema (`Segoe UI`, `Arial`, `sans-serif`); código em `Consolas`/`Courier New`.
- Escala em `rem`, respeitando o tamanho do navegador: base `1rem`, pequeno `0.875rem` (piso de qualquer texto), médio `1.125rem`, título `1.25rem`, número `2rem`. Nomes de municípios ≥ `1rem`.
- Espaço base `1rem`; raio `0.75rem` (blocos) e `0.5rem` (controles); chips com raio total.
- Alvo de toque mínimo de 44 × 44 px (`--alvo: 2.75rem`) para botões, campos, títulos de seção e rótulos de opção.

## Componentes

- **Botão primário:** preenchido em `--escolha`, texto `--sobre-escolha`, verbo explícito ("Aplicar lente", "Tentar novamente"). Um por região, no máximo.
- **Botão secundário:** `--superficie` com contorno de 2 px `--contorno`. Alternância usa `aria-pressed` e ganha "✓" e borda de 3 px.
- **Botão de texto:** sublinhado em `--escolha`, para ações de baixo peso ("Limpar tudo").
- **Seção recolhível:** `<details>`/`<summary>` nativos; título clicável sem seleção de texto, com seta ▸/▾; pode trazer um resumo (o recorte aplicado na Consulta) e a etiqueta "ativa".
- **Chip de escolha:** botão arredondado com `aria-pressed` (atalhos de período); marcado em `--escolha-suave` com borda `--escolha`.
- **Chip informativo:** texto em pílula, sem ação (satélite e fontes no topo).
- **Opção:** rótulo inteiro clicável (`.opcao`), com rádio ou caixa; nas lentes, nome e a pergunta que a lente responde.
- **Etiqueta "ativa":** pílula `--escolha` na seção da lente marcada.
- **Lista selecionável:** botões de nome (`.botao-nome`) com `aria-pressed`; a seleção também aparece no mapa.
- **Bloco e coluna:** superfície com borda `--contorno-suave` e raio de 0,75 rem.
- **Diálogo:** `<dialog>` modal nativo, com título, "Fechar", Esc, foco preso e retorno ao botão que o abriu ("Sobre os dados", "Como ler esta tela").
- **Legenda:** amostra com forma e traço, mais o texto que descreve cor e traço.
- **Rodapé:** as três frases de domínio, sempre visíveis.
- **Barra de rolagem:** nas colunas laterais, só aparece ao passar o mouse ou com o foco dentro.

## Layout

- **Topo:** marca; chips "Satélite AQUA_M-T · INPE" e "Fontes: …" (só com acesso autorizado); "Sobre os dados", "Como ler esta tela", "Tema escuro"; estado da sessão e "Sair".
- **Tela de acesso:** sem sessão autorizada, só o topo (marca, tema, sessão), o aviso de domínio, a entrada e o rodapé. Nenhum dado nem geometria é pedido.
- **Filtros (esquerda):** "Limpar tudo"; escopo ("Uma lente por vez · Lentes: todo Mato Grosso · período"); seções Consulta (atalhos, intervalo e município, aplicados ao mudar), Lente de seleção, Contexto territorial e Cruzar critérios; "Aplicar lente".
- **Centro:** estado da consulta, mapa com ferramentas e legenda; abaixo, o cartão "Detecções no período" (total principal, sensibilidade America/Cuiaba e série), disponibilidade e registros.
- **Resultado (direita):** lente aplicada e municípios.
- **Larguras:** abaixo de 761 px, uma coluna na ordem topo, filtros (seções fechadas; a Consulta mostra o recorte aplicado no título), mapa, resultado, série e disponibilidade, rodapé. De 761 px a 1.099 px, filtros à esquerda e o resto empilhado à direita. A partir de 1.100 px, três colunas; filtros e resultado ficam fixos na rolagem, com rolagem própria.
- Nenhuma largura produz rolagem horizontal da página; tabelas rolam dentro da própria região.

## Estados

- **Sessão e versão (ADR-007):** sem configuração, verificando, sem sessão (com "Você saiu" ou "Sua sessão expirou"), negado, sem publicação, fonte indisponível, autorizado e versão substituída — cada um com texto e `data-estado` próprios.
- **Consulta:** carregando, zero (nunca "ausência de fogo"), fonte indisponível e inconsistente (com "Tentar novamente"), entrada recusada e versão substituída (com "Carregar a versão vigente").
- **Painel:** `data-estado-painel` em `#conteudo`: `carregando`, `pronto` (filtros, série e municípios prontos) ou `erro`.
- **Recorte aplicado:** período digitado inválido mostra o erro junto dos campos e a linha "Mostrando <recorte>"; a tela não muda.
- **Lente, combinação, sobreposição e áreas:** estados de `data-estado-lente` e `data-estado-areas`, com os textos das KBs e dos ciclos `004` a `006`.
- Zero, pendente e indisponível nunca são apresentados como valor numérico parcial.

## Acessibilidade

- Contraste conforme "Tokens de cor", conferido nos dois temas.
- Foco visível de 3 px em todo controle; ordem de tabulação segue a leitura (topo, filtros, mapa, resultado, detalhes); atalho "Ir para o conteúdo".
- Todo controle tem rótulo; grupos usam `fieldset`/`legend`; estados dinâmicos usam `role="status"` ou `role="alert"`.
- Texto ampliado a 200% e largura de 320 px sem corte nem rolagem horizontal da página.
- Toque: um dedo rola a página; o mapa só arrasta com "Mover o mapa com um dedo".
- O mapa tem alternativa em texto (tabela de registros e listas da lente).
- `prefers-reduced-motion` desliga animações e transições.
