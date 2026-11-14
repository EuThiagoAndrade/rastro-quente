# Ideação — 007: Interface base

> **Ciclo:** `007`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 007" em 2026-11-14
> **Criado em:** 2026-11-14
> **Última atualização:** 2026-11-14
> **handoff_schema_version:** `2`

## Problema

A interface do protótipo cresceu cartão a cartão, ciclo a ciclo: aviso, acesso, consulta, lentes, resumo, mapa, série diária, disponibilidade, registros, municípios e proveniência aparecem empilhados, sem um percurso claro entre o que se pergunta, onde estão as detecções e por que algo foi destacado. O responsável relata dificuldade de entender o que cada parte faz. Também não há contrato visual: o `_project/README.md` o adia "para ciclo próprio", e o ADR-007 declara que não institui design system.

Ao longo de 2026-11-14, o responsável conduziu uma série de mockups privados (V8 a V13) e definiu a V13 como a **interface base** do produto. A necessidade deste ciclo é adotar essa organização no protótipo, encaixar nela tudo o que o back-end já entrega e registrar o contrato visual. A V13 também traz duas mudanças que vão além da tela: as lentes passam a ser calculadas no recorte da consulta (G1) e o mapa ganha fundo de satélite de terceiros (revisão do ADR-007).

Restrição de domínio: a reorganização não muda o significado das detecções. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração, e uma lente indica onde olhar, não ranking nem prova.

## Origem no backlog

- **BL-007 — Definição visual e interface.** Item inteiro.
  - **Síntese (snapshot):** o contrato visual não está definido e a interface atual é funcional, sem design system aprovado. Definir o estilo do produto e rever a interface, incluindo funcionalidades a discutir. Existe uma referência visual privada fora do repositório, que serve de inspiração e não de baseline. Cada lente nova pede só a interface mínima própria, sem redesenho.
- **BL-009 — Explicação dos destaques das lentes no mapa.** Parcela: a explicação de "por que esta célula foi destacada", com motivo, evidências e ressalvas que as lentes já calculam, inclusive quais critérios contribuíram numa combinação e como o operador afetou o resultado.
  - **Síntese (snapshot):** permitir que o usuário entenda, no mapa, o que levou uma célula a ser destacada e o que mudou entre dois períodos, com acesso a critérios, evidências e ressalvas.
  - **Restante, fora deste ciclo:** comparação direta de dois períodos e a proposta de agentes com função na Vercel e API Gemini.
- **Referência:** `_project/backlog.md`, commit `e274e49` (fila `chore/backlog` no worktree externo `rastro-quente-backlog`), já contido em `main` (`861bba6`) e em `origin/main`; **não** é local nem pendente de publicação.
- **Destino em preparação.** Os estados dos itens não mudam agora. O retorno na fila (`ciclo 007 — AAAA-MM-DD — parcela`) só ocorre depois da integração comprovada em `main`, e sua publicação exige autorização separada.
- **Escopo sem origem no backlog:** as lentes no recorte da consulta e o mapa-base de terceiros entram por demanda direta do responsável nesta conversa (2026-11-14).
- **Observação fora do escopo:** o BL-002 continua `Disponível` embora o ciclo `006` tenha entregado as áreas protegidas reais; o retorno à fila não foi registrado. Não é tratado aqui e pede pedido próprio.

## Contexto e evidências

### Referência visual (privada, fora do Git)

O mockup V13 está em `local/mockup-visual/v13/rastro-quente-v13.html` (ignorado pelo Git e pela Vercel), com dados, contagens e áreas protegidas **fictícios** e a malha municipal do IBGE só para contexto. Ele serve de referência de organização e comportamento; **não** é contrato nem baseline, e nada dele é versionado. O contrato visual deste ciclo será escrito no repositório, do zero.

Organização da V13, da esquerda para a direita (pergunta → onde → resposta):

| Região | Conteúdo |
| :-- | :-- |
| Topo | Marca, chips destacados "Satélite AQUA_M-T · INPE" e "Fontes: IBGE · CNUC · FUNAI", "Como ler esta tela" e alternância de tema claro/escuro |
| Esquerda: filtros | "Limpar tudo" (volta período, município e lente ao padrão); seções recolhíveis Consulta (aberta por padrão: período com atalhos e intervalo personalizado; município), Lente de seleção (concentração, recorrência, persistência), Contexto territorial (sobreposição com a classe) e Cruzar critérios (combinação e/ou). Cada lente traz a pergunta que responde. Etiqueta "ativa" na seção da lente escolhida |
| Centro: onde | Mapa com fundo (satélite com nomes, ruas, sem fundo), camadas (limites, áreas, detecções, densidade), legenda e botão de ampliar (esconde as colunas laterais; Esc volta). Embaixo, detecções por mês **só dos meses do período** e disponibilidade |
| Direita: resposta | Aba **Células** (resumo da lente, lista de células; clicar numa célula, na lista ou no mapa, abre a explicação na mesma aba com "← Voltar às células") e aba **Municípios** (lista estadual; com município escolhido, cartão do município). Abre em Municípios; vai sozinha para Células ao escolher uma lente |
| Rodapé | "Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração." · "Uma lente indica onde olhar; não é ranking nem prova." · "Totais em dia GMT; disponibilidade é separada da detecção." |

Princípio declarado pelo responsável: **o que está na esquerda vale para tudo na direita e no centro**, inclusive lentes, células, municípios e série.

Detalhes de interação já validados nos mockups: seleção de texto desligada nos títulos clicáveis; barra de rolagem que só aparece ao passar o mouse; cor de escolha verde-sálvia (menos chamativa que o azul); tracejado azul só para a célula selecionada no mapa.

### Fatos do repositório (`main` em `861bba6`)

- **Interface atual:** `index.html` (190 linhas) com cartões Aviso, Acesso, Consulta (`form-consulta` com município, início, fim, "Consultar" e "Usar a janela inteira"), Lentes (seletor e botão "Aplicar lente"), Resumo, Mapa, Série diária, Disponibilidade, Registros, Municípios e Versão/fontes/limitações. Código em `src/app.ts` (1.281 linhas), `src/apresentacao*.ts`, `src/mapa.ts` e cinco folhas em `src/estilos/`. Não há tema escuro.
- **Testes de interface:** 7 conjuntos E2E em `tests/e2e/` (acesso, consulta, acessibilidade, versão, lentes, combinação, áreas; cerca de 2.100 linhas) e testes unitários de lógica, combinação, sobreposição, contraste e bundle. Todos dependem da estrutura atual da tela.
- **Consultas já aceitam município:** `consultar_resumo`, `consultar_deteccoes` e `consultar_disponibilidade` recebem `p_municipio` (`src/consulta.ts`), sob RLS. As lentes hoje chamam com `municipio: null` por regra (`filtroEstadual` em `src/lentes/carregar.ts`, recorte M1-a).
- **Contrato das lentes (KB-005):** resultado com `recorte` fixo (`estado`, município `null`); concentração com N=10 e empatados (D16); combinação calcula as lentes ela mesma (T8) e inclui a concentração por projeção P1; a sobreposição (ciclo `006`) também usa M1-a. Mudar o recorte é nova decisão de G1 e nova `versao_metodo`.
- **Decisões do ADR-007 que a V13 contraria ou revisita:**
  - "Tiles de terceiros" fora do escopo e do orçamento zero; "nenhum serviço de terceiros".
  - O mapa mostra **exatamente a página** de registros da tabela (até 1.000 pontos); "vista estadual completa de todos os pontos exigiria outro contrato".
  - Limites do estado **só por pedido** (`intermediaria`: 984 KB, 5,3 s no perfil de celular; `minima`: 237 KB, 1,6 s).
  - Login Google por PKCE, estados distintos (sem sessão, negado, expirada, sem publicação, versão substituída etc.), gerações de descarte e versão fixada continuam valendo.
- **Desempenho das lentes (KB-005, medição do ciclo `006`):** orçamento de 20 s por lente no perfil de celular; a sobreposição de terra indígena levou 42,3 s (desvio aceito no ciclo `006`). Isso pesa na decisão de aplicar a lente ao escolher, como na V13, ou manter o botão "Aplicar lente" (R1-7).
- **Governança:** `.agent/ai_behavior.md` traz a linha "Contrato visual futuro — a definir em ciclo próprio"; `_project/README.md` diz "contrato visual: adiado para ciclo próprio; o mockup privado não é contrato" e já referencia `DESIGN.md` na trilha curta; `scripts/validate-governance.mjs` registra "Design system adiado: contrato visual não auditado".

### Medição exploratória das divisas (carga local, 2026-11-14)

Script temporário não versionado sobre `local/dados-prototipo/saidas/deteccoes.csv` (fora do Git): 10.640 detecções principais, 3.290 células de 0,05° ocupadas (mesmos números do ciclo `006`). Grade T1 por piso exato de `coordenada × 20`; recorrência = 3 ou mais meses GMT distintos; persistência = 3 ou mais dias GMT seguidos; janela inteira. **Exploratório, não caso de referência**: o plano refaz por caminho independente.

- 91 células têm detecções de mais de um município.

| Lente | Células destacadas no estado | Delas, na divisa | Pares célula–município (estado) | Pares no recálculo por município | Pares que somem | Células afetadas |
| :-- | --: | --: | --: | --: | --: | --: |
| Recorrência | 150 | 8 | 158 | 146 | 12 | 8 |
| Persistência | 60 | 4 | 64 | 59 | 5 | 4 |

Leitura: recalcular só com os focos do município escolhido faz **todas** as células de divisa destacadas perderem o destaque em pelo menos um dos municípios que tocam. O efeito é pequeno no total (cerca de 5% das células da recorrência), mas é sistemático e precisa estar dito na tela.

## Resultado desejado

1. Interface do protótipo reorganizada segundo a V13: filtros à esquerda, mapa e série no centro, resultado à direita, rodapé de domínio fixo, com todas as capacidades atuais preservadas (acesso, versão fixada, estados, lentes, combinação, sobreposição, disponibilidade, proveniência).
2. Contrato visual canônico no repositório (`DESIGN.md`), com tokens de cor dos temas claro e escuro, tipografia, componentes, estados e regras de acessibilidade, e a governança atualizada para reconhecê-lo.
3. Lentes calculadas no recorte da consulta (período e município), com nova versão de método documentada na KB-005, casos de referência e conferência independente.
4. Mapa-base de satélite com nomes, com ADR que revisa o ADR-007 e mantém custo zero e chave fora do repositório.
5. Testes E2E, de acessibilidade e de contraste ajustados à nova tela, e medição de desempenho no perfil do ADR-007.

## Hipóteses

- **H1:** a reorganização não exige mudança de banco: as consultas já aceitam município e o RLS atual cobre tudo o que a tela lê.
- **H2:** as lentes no recorte reaproveitam o carregador atual, trocando o filtro estadual pelo filtro da consulta, sem tocar o cálculo de cada lente; muda o conjunto de entrada, a `versao_metodo` e o campo `recorte`.
- **H3:** com município escolhido, a carga das lentes fica muito menor que a estadual (uma fração das 10.640 detecções), o que alivia o orçamento de 20 s.
- **H4:** o plano gratuito do ArcGIS Location Platform (2 milhões de tiles por mês, chave restrita por domínio) cobre o uso de um operador com folga.
- **H5:** um único ciclo com issues separadas (layout, resultado, centro, lentes no recorte, mapa-base) mantém PRs revisáveis e isola a mudança de G1.

## Alternativas

### A1 — Recorte das lentes (G1)

| Alternativa | Como funciona | Efeito com os números da carga local |
| :-- | :-- | :-- |
| **A1-a: recalcular no recorte** (indicada pelo responsável em 2026-11-14) | A lente usa só as detecções do período e do município escolhidos | Recorrência: 158 → 146 pares; 8 células de divisa perdem destaque em algum município. Persistência: 64 → 59; 4 células |
| A1-b: calcular no estado e filtrar a exibição | A lente segue M1-a; a tela mostra só as células que tocam o município | Nenhum par some; a mesma célula tem sempre a mesma resposta; KB-005 não muda |

Exemplo fictício de divisa: célula com focos em janeiro e março do lado de Alto Araguaia e em maio do lado vizinho. A1-b destaca a célula nos dois municípios (3 meses); A1-a não destaca em nenhum dos dois (2 meses e 1 mês).

### A2 — Concentração com município escolhido

- **A2-a (indicada):** indisponível, com o texto "Compara municípios: disponível só com Todo Mato Grosso", e fora das opções da combinação.
- A2-b: mostrar a posição do município no ranking estadual (exige ler o estado, contra o princípio do filtro).

### A3 — Quando a lente é calculada

- A3-a: ao escolher, como na V13, com progresso visível e descarte da resposta anterior.
- A3-b: manter "Aplicar lente" (R1-7), mais previsível com cargas de 20 a 42 s.
- A3-c: ao escolher quando há município (carga pequena) e com botão no estado inteiro.

### A4 — Pontos no mapa

- A4-a: todos os pontos do recorte (como na V13), o que revoga "o mapa mostra exatamente a página" do ADR-007 e exige ler todas as páginas também sem lente.
- A4-b: manter a página corrente com o indicador "mostra X de Y".

### A5 — Tabela de registros paginada

- A5-a: sair da tela; a evidência fica na explicação de cada célula e a lista de células é a alternativa em texto do mapa.
- A5-b: manter num lugar secundário (por exemplo, um painel "Registros" aberto sob demanda).

### A6 — Série temporal

- A6-a: mensal, só com os meses do período (pedido do responsável).
- A6-b: mensal, mas diária quando o período tem até 31 dias (com 1 mês, a série mensal vira uma barra).

### A7 — Limites municipais

- A7-a: ligados por padrão na representação `minima` (237 KB, 1,6 s) e `intermediaria` ao aproximar.
- A7-b: manter só por pedido (ADR-007).

### A8 — Mapa-base

- **A8-a (indicada):** Esri, satélite com camada de nomes, chave restrita ao domínio em variável de ambiente, "Sem fundo" como alternativa sempre disponível. CARTO (ruas) adiada.
- A8-b: sem fundo (situação atual).

### A9 — Itens novos e menores

- Tema escuro: entrar agora ou adiar.
- Densidade por célula (contagem, não gravidade): entrar agora ou adiar.
- Lugar do acesso e da proveniência: tela de acesso própria antes do painel; "Sobre os dados" no topo abre fontes, versão e limitações completas; os metadados curtos seguem no fim da aba Células.

## Riscos e restrições

- **G1:** mudar o recorte altera o critério de seleção. Exige nova `versao_metodo`, casos de referência independentes com divisas, conferência (`conferir:lentes`, `conferir:combinacao`, `conferir:sobreposicao`) e texto de tela que diga o recorte usado.
- **G2:** em princípio não se aplica (só leitura de tabelas e RPCs já isoladas). Se o plano exigir RPC ou tabela nova, passa a se aplicar e o plano declara os testes de isolamento.
- **G3:** o mockup e a carga local ficam em `local/`; nenhum dado do mockup entra no repositório. A chave da Esri nunca é versionada nem aparece em issue, PR ou log. Cada tile revela ao provedor a região vista no mapa: não é dado pessoal, mas indica áreas sob análise, e o ADR precisa registrar isso.
- **G4:** nenhuma migração prevista.
- **Ação humana externa:** criar a conta na Esri, aceitar os termos e gerar a chave com restrição de domínio cabem ao responsável e não são cobertas por nenhuma autorização do agente. Confirmar o enquadramento do uso (acadêmico/pesquisa) também.
- **Tamanho:** reescrita de `src/app.ts` e dos 7 conjuntos E2E. Mitigação: issues separadas, cada uma com sua PR e seus testes, e a mudança de G1 isolada numa issue própria.
- **Desempenho:** aplicar ao escolher e mostrar todos os pontos aumentam a carga; a medição no perfil do ADR-007 é critério de aceite.
- **Bloqueio por decisão:** se A1 ou A8 travarem, o restante não deve esperar. As issues de G1 e de mapa-base ficam no fim da sequência.
- **Acessibilidade:** a V13 foi conferida só em largura de computador e no tema claro; tema escuro, celular, leitor de tela e contraste precisam de verificação.

## Perguntas em aberto

Todas respondidas. Em 2026-11-14 o agente apresentou uma sugestão para cada pergunta, e o responsável declarou: "Bem, eu vou aprovar todas as sugestões que você deu". Ele confirmou também que a V13 é a tela base, com os ajustes abaixo. As decisões valem como insumo do plano; os números e regras de G1 ainda precisam de casos de referência independentes no plano.

| # | Pergunta | Decisão |
| :-- | :-- | :-- |
| 1 | A1 — recorte das lentes (G1) | **A1-a.** As lentes usam só as detecções do período e do município da consulta. As células de divisa podem perder destaque (exploratório: 8 de 150 na recorrência, 4 de 60 na persistência), e a tela declara o recorte ("calculada só com os focos de <município>"). A evidência da célula traz só os focos do recorte. |
| 2 | A2 — concentração com município (G1) | **A2-a.** Indisponível com município, com o texto "Compara municípios: disponível só com Todo Mato Grosso", e fora das opções da combinação nesse caso. |
| 3 | A3 — quando calcular | **A3-a com reaproveitamento em memória.** A lente é calculada ao escolher, com progresso visível e descarte da resposta anterior. Os registros já lidos do mesmo recorte (carga, período e município) são reaproveitados **só em memória** enquanto a página estiver aberta, sem persistir no navegador (ADR-007: sem cache local persistente). |
| 4 | A4 — pontos no mapa | **A4-a.** Todos os pontos do recorte, revogando "o mapa mostra exatamente a página" do ADR-007, com medição no perfil de celular como critério de aceite. |
| 5 | A5 — tabela de registros | **A5-a.** Sai da tela. A evidência fica na explicação da célula ("Ver as detecções que sustentam o destaque"), e a lista de células é a alternativa em texto do mapa. Pode voltar depois como painel opcional. |
| 6 | A6 — série temporal | **A6-b.** Mensal, só com os meses do período; diária quando o período tem até 31 dias. |
| 7 | A7 — limites municipais | **A7-a, simplificada.** Ligados por padrão na representação `minima`; o município escolhido mantém o contorno `intermediaria`, como hoje. |
| 8 | A8 — mapa-base | **A8-a.** Esri, satélite com camada de nomes, mais "Sem fundo". CARTO (ruas) adiada. Criar a conta, aceitar os termos e gerar a chave restrita ao domínio são **ação externa do responsável** na issue do mapa-base; a chave nunca é versionada e as demais issues não esperam por ela. |
| 9 | A9 — itens menores | **Tema escuro: entra**, com contraste conferido nos dois temas. **Densidade por célula: entra** (decisão revista pelo responsável em 2026-11-14: "Vamos colocar camada de densidade, sim [...] Isso não quer dizer juízo de valor"); camada opcional, desligada por padrão, com legenda "contagem, não gravidade". **Acesso:** tela de entrada própria antes do painel; sem sessão, nenhum dado. **Proveniência:** o botão de dados do topo abre fontes, versão e limitações completas; os metadados curtos seguem no fim da aba Células. |
| 10 | Contrato visual | **`DESIGN.md` na raiz do repositório**, reconhecido pela governança (`.agent/ai_behavior.md`, `_project/README.md` e o validador). |

**Diferenças da tela base em relação à V13:** tela de login antes do painel; sem o fundo "Ruas"; série diária em períodos de até 31 dias; dados reais em vez dos fictícios; botão de dados do topo com a proveniência completa.

## Fora do escopo

- Comparação de dois períodos e agentes com IA (restante do BL-009).
- CARTO e mapa de ruas, VIIRS (BL-003), variação anual (BL-004), CAR (BL-006), atualização automatizada (BL-008).
- Mudanças nos limiares das lentes (3 meses, 3 dias, N=10) e na regra de "dentro" da sobreposição.
- Lente de proximidade de áreas protegidas.
- Reconciliação do BL-002 no backlog.
- Verificação em produção, que segue as regras normais de autorização.

## Critérios para iniciar o planejamento

- ~~Perguntas 1 a 10 respondidas pelo responsável, com A1 e A2 decididas explicitamente (G1).~~ Atendido em 2026-11-14.
- ~~Se A8-a for escolhida: o responsável declara se a conta e a chave já existem ou se ficam como ação externa da issue de mapa-base.~~ Atendido: ficam como ação externa da issue de mapa-base.
- ~~Sequência de issues aceita~~ Atendido (aprovada com as sugestões): (1) contrato visual e layout sem mudar regra; (2) coluna de resultado; (3) centro do mapa e série; (4) lentes no recorte (G1, KB-005); (5) mapa-base com ADR.

Critérios atendidos. O rascunho do plano exige a frase "autorizo o rascunho do plano do ciclo 007". Rascunho autorizado em 2026-11-14 ("Desta forma, eu autorizo você a fazer o rascunho do plano do ciclo (007)"); plano em `_project/drafts/007_interface_base/007_plan.md`.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 007 (completo)
Quem: Responsável
Conferir: Decisões das perguntas 1 a 10 da ideação (_project/ideations/007_interface_base.md), aprovadas em 2026-11-14
Diga: "autorizo o rascunho do plano do ciclo 007"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + idear + interface_base + 861bba6`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: ciclo `007` inexistente em `_project/cycles.md` (próximo ciclo `007`) / ciclo `007` reservado como `Ideação`, com esta ideação criada; próximo ciclo `008`
- `result`: `executed`
- `evidence`: este arquivo; linha `007` em `_project/cycles.md`; medição exploratória das divisas descrita em "Contexto e evidências" (script temporário fora do repositório)
- `blockers`: nenhum; perguntas 1 a 10 decididas em 2026-11-14 (reconciliação desta ideação na mesma data)
