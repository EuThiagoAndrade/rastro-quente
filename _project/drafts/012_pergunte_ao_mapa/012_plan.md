# Plano de Implementação — Pergunte ao mapa

> **Ciclo:** `012`
> **Status:** `Rascunho`
> **Versão:** `v1`
> **Data de criação:** 2026-11-24
> **Última atualização:** 2026-11-24
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `leve`
> **Autorização inicial:** "Pode criar o plano" em 2026-11-24 — entrega única (one shot) para a final da banca, com a governança reduzida por decisão do responsável (ver D1)
> **Modo contínuo:** `—`
> **Revisão formal:** `Dispensada pelo responsável (D1)`
> **Veredito da revisão:** `—`
> **Aprovação humana pós-revisão:** `—`
> **Issue:** [#113](https://github.com/EuThiagoAndrade/rastro-quente/issues/113)
> **Branch:** `feature/issue-113`
> **handoff_schema_version:** `2`

## Problema e contexto

O projeto foi para a final da banca. Falta algo novo de impacto, feito com IA, que sirva às atribuições da SEMA-MT sobre o uso do fogo: monitoramento, fiscalização, prevenção e gestão. O combate é atribuição do Corpo de Bombeiros.

Hoje o técnico já monta um recorte (período e município), aplica as lentes e, ao fim, pode fazer cinco perguntas fechadas ao agente. Falta:

- entrar no sistema por uma pergunta em linguagem natural;
- ver como as detecções de calor se distribuem no tempo, dia a dia;
- sair com um documento que encaminhe uma averiguação.

A fórmula escolhida é **pergunta → mapa vivo → ficha para averiguação**. A maquete de referência é `local/mockup-visual/v14/` (só funcionalidade). O visual de referência é a interface atual (`index.html`, `src/estilos/`, `DESIGN.md`), e ela não pode mudar.

**Termos.** Os pontos são **detecções de calor** (focos de calor), nunca "fogo" ou "incêndio". O trajeto tracejado mostra por onde as detecções apareceram, não o avanço de um incêndio. A altura, a cor e o tamanho dos símbolos indicam quantidade de detecções, não intensidade, área queimada ou gravidade.

### Decisões do responsável (2026-11-24)

- **D1. Governança mínima.** O ciclo é tratado como leve, com um único documento e sem ideação, revisão formal, task, ADR, KB, emendas ou encerramento prospectivo. São só a issue #113, a branch `feature/issue-113` e uma PR única com o plano e a implementação. O responsável testa e integra a PR. Continuam valendo: nenhum segredo nem dado pessoal versionado; o agente não faz merge; o termo é "detecção de calor".
- **D2. Funcionalidades atuais preservadas.** Lentes, filtros, comparação, abas, série, Lista de focos, camadas, tema e as cinco perguntas fechadas continuam iguais. A pergunta é uma porta de entrada a mais e não substitui nada.
- **D3. Interface atual preservada.** Topo, chips de origem, ícones (Sobre os dados, Como ler esta tela, tema), fontes, cores, posições e o rodapé de domínio ficam como estão. Os elementos novos usam os tokens e componentes existentes (`.secao`, `.botao`, `.nota`, `.flutuante`, `.opcao-mapa`, `.dialogo`). A maquete v14 vale só como referência de funcionalidade.
- **D4. Seções recolhíveis.** "Pergunte ao mapa" fica no alto da coluna esquerda, recolhível como as seções das lentes (`<details class="secao">`). A seção "Consulta" (período e município) também é recolhível. Ela já é um `<details>` e continua assim.
- **D5. Trajeto tracejado aprovado.** No mapa vivo entra o trajeto do centro das detecções de cada agrupamento, como na demonstração com dados reais de 2026-11-24.
- **D6. Roteiro da demonstração.** São três casos reais (ver "Roteiro da demonstração"): TI Areões, TI Parabubure e Nova Maringá.
- **D7. Fora deste ciclo.** Animação 3D (MapLibre ou deck.gl) e o relatório do CBMMT.

## Objetivo

O técnico escreve uma pergunta sobre as detecções de calor e:

1. vê como o sistema entendeu a pergunta, em filtros que pode corrigir;
2. assiste no mapa à evolução diária das detecções do recorte, com o trajeto tracejado e os dias sem cobertura comprovada marcados;
3. gera a ficha para averiguação, imprimível em PDF, com evidências, ressalvas e espaço para a própria conclusão.

Os números vêm sempre do motor que já existe. A IA só interpreta a pergunta e, quando houver, redige a síntese sobre números já conferidos.

## Origem no backlog

Não se aplica.

## Contexto técnico (main em `6841734`)

- **Carga.** Os pontos do recorte já são lidos por inteiro (`leitura.registros`, via `consultar_deteccoes`) e desenhados por `mapa.definirPontos` (`src/mapa.ts`). Cada registro traz `data_hora_gmt`, `latitude`, `longitude` e `municipio_codigo`. O mapa vivo não precisa de consulta nova.
- **Lentes.** São calculadas no navegador (`src/lentes/`). A disponibilidade é lida por `consultar_disponibilidade` (`src/consulta.ts`).
- **IA.** `/api/explicar` (`api/explicar.ts` → `servidor/explicar.ts`) usa o Gemini `gemini-3.1-flash-lite` por REST (`servidor/gemini.ts`), já com saída estruturada (`Interacao.esquema`). Valida a origem, o JWT do usuário, a carga vigente sob RLS e corta pedidos acima de 64 KiB. Fica desligada se `RQ_IA_HABILITADA` não for `true`.
- **Interface.** A coluna esquerda (`#filtros`) tem `#secao-consulta`, `#secao-lente`, `#secao-contexto`, `#secao-cruzar` e `#secao-comparar`, todos `<details class="secao">`. O painel "Mapa" (`#opcoes-mapa`) agrupa as opções do mapa.
- **CSP** (`vercel.json`). `style-src 'self'` proíbe atributo `style` inline: estilos vão nos `.css`, e o JS ajusta só por `element.style` ou classes. `connect-src 'self' https://*.supabase.co`: a chamada nova fica na mesma origem.
- **Deploy.** `vercel.json` só publica `main` (`deploymentEnabled`). A PR não ganha preview automático, então os testes do responsável são locais (ver "Como testar a PR").

## Escopo

### Dentro do escopo

**A. Pergunte ao mapa** (coluna esquerda, primeira seção, aberta por padrão)

1. Uma `<details id="secao-pergunte" class="secao" open>` com o resumo "Pergunte ao mapa", antes de `#secao-consulta`. Dentro dela:
   - campo de texto de até 300 caracteres e botão "Perguntar" (Enter envia, Shift+Enter quebra a linha);
   - três sugestões, que são as perguntas do roteiro;
   - estado em `role="status"` ("Interpretando a pergunta…").
2. O bloco **"Entendi assim"** mostra:
   - os itens interpretados: período, município, lente, classe de área, modo e comparação;
   - a etiqueta "Interpretado por IA" ou "Interpretado sem IA";
   - um botão ✎ por item, que abre e foca o controle correspondente na seção existente e o destaca brevemente com uma classe CSS.
3. **Aplicação.** A interpretação preenche os **controles existentes** (`#f-periodo` = `personalizado` com `#f-inicio`/`#f-fim`, `#f-municipio`, `l-lente`, `l-classe`, `c-modo`, `cmp-b-*`) e dispara os mesmos eventos que o usuário dispararia (`change`/`submit`). Nenhum caminho paralelo de consulta.
4. **Recusas e limites**, num aviso abaixo do bloco:
   - **Autoria:** "quem causou", "culpado", "crime", "infração". Resposta: o sistema não indica autoria, dano nem infração, com o botão "Mostrar as detecções".
   - **Previsão:** "vai queimar", "amanhã", "risco". Resposta: o sistema não faz previsão.
   - **Dado ausente:** bioma, chuva, vento, umidade, área queimada, intensidade. Resposta: "esse dado não está na base".
   - **Fora da janela:** período fora da carga. Resposta: informa a janela disponível.
5. **Interpretador:**
   - **Com IA:** a rota nova `POST /api/interpretar` faz uma única chamada ao Gemini com saída estruturada (esquema abaixo), sem ferramentas. Repete as validações de `/api/explicar`: IA ligada, POST, origem, JWT, carga vigente e limites de corpo.
   - **Sem IA:** um interpretador local por regras, no navegador. Reconhece meses (com o ano inferido da janela), datas, os nomes de município da carga sem diferenciar acentos, as palavras das lentes e das classes, "comparar"/"diferença" e as recusas. Entra quando a IA está desligada, demora mais de 20 s ou erra. É a rede de segurança da apresentação.
   - **Validação:** a saída da IA passa pelo mesmo validador do interpretador local antes de ser aplicada:
     - datas dentro da janela da carga;
     - município entre os da carga, por código;
     - valores enumerados;
     - qualquer campo inválido é descartado e avisado no "Entendi assim", nunca aplicado.

**B. Mapa vivo** (sobre o mapa, mesmo cartão)

6. **Abertura.** O botão "Animar no tempo", na seção "Mapa" (`#opcoes-mapa`), abre a barra de reprodução. Uma pergunta interpretada com modo animação também a abre, já tocando.
7. **Barra** (`.flutuante`, na base do mapa): tocar/pausar, controle deslizante por dia GMT do período, velocidades 1×, 2× e 4× e o rótulo "dd/mm · N no dia · N acumuladas". Esc ou "Fechar" restaura o mapa estático.
8. **Desenho:**
   - até o dia corrente, as detecções do dia em destaque e as anteriores esmaecendo com a idade;
   - na própria camada de pontos (`definirPontos` ou uma camada irmã com o mesmo renderizador), sem mudar a camada estática;
   - destaques de lente, áreas e limites continuam visíveis.
9. **Trajeto tracejado (D5):**
   - **Agrupamento:** detecções do recorte a até 10 km e até 3 dias umas das outras (união por grade, no navegador).
   - **Corte:** só agrupamentos com 15 detecções ou mais e 4 dias com detecção ou mais.
   - **Linha:** polilinha tracejada, em cor neutra, ligando o centro diário até o dia corrente.
   - **Legenda:** "Trajeto do centro das detecções (onde apareceram, não avanço do fogo)".
10. **Lacunas.** Dias com `incidencia_indeterminada` ou `lacuna_conhecida` no recorte, lidos de `consultar_disponibilidade`, ganham marca no deslizante e o aviso "cobertura não comprovada neste dia".
11. **Série.** Desejável: a série em barras (`#serie-corpo`) acompanha o dia com uma marca, e clicar numa barra leva a reprodução ao dia.

**C. Ficha para averiguação** (`<dialog id="dialogo-ficha" class="dialogo">`)

12. **Abertura.** O botão "Gerar ficha para averiguação" fica no fim do "Entendi assim" e na aba Lentes, junto da explicação de um destaque. O alvo é o recorte atual ou o destaque escolhido.
13. **Seções:**
    1. **Origem do pedido:** pergunta, interpretação e filtros aplicados; data e hora da geração; versão da carga.
    2. **Local:** município, centro (lat/lon), extensão aproximada e áreas protegidas com contagem de detecções dentro.
    3. **Evidências:**
       - tabela com total, dias com detecção, primeiro e último dia, pico diário, deslocamento do centro (km e rumo) e dias de cobertura não comprovada;
       - mini mapa em SVG, só com pontos e trajeto, sem fundo de terceiros;
       - mini série.
    4. **Síntese:** sempre um texto determinístico montado com os números. Quando o painel de perguntas tiver uma resposta para o mesmo recorte, ela entra marcada como "Gerado por IA".
    5. **Roteiro de averiguação:** lista sugerida, determinística, conforme o contexto:
       - fora de área protegida: CAR/SIMCAR e autorização de queima;
       - em TI: FUNAI;
       - em UC: órgão gestor;
       - persistência: imagem posterior;
       - sempre: conferir VIIRS/FIRMS e imagem posterior.
    6. **Ressalvas:** o texto do rodapé de domínio, dia GMT, disponibilidade separada da detecção e a imagem Esri não datada.
    7. **Conclusão do técnico:**
       - opções: procedente para vistoria, não procedente ou inconclusivo;
       - observações;
       - responsável, matrícula e data, em branco.
14. **Salvar como PDF** usa `window.print()` com CSS `@media print` que imprime só a ficha. Os campos editáveis saem como estão preenchidos.

### Fora do escopo

- Mudança de banco, RPC, RLS, migração, carga ou método das lentes.
- Mudanças visuais no que já existe (D3), animação 3D e outra biblioteca de mapa (D7).
- Perguntas livres ao agente de explicação: as cinco perguntas fechadas continuam como estão.
- Busca por nome de área protegida. Desejável e o primeiro corte se faltar tempo; o roteiro nomeia o município.
- Persistência da ficha no banco: a ficha é gerada na tela e salva pelo navegador.

## Desenho técnico

### Esquema da interpretação (saída estruturada e validador comum)

```json
{
  "tipo": "consulta | recusa_autoria | recusa_previsao | sem_dado | fora_da_janela | nao_entendi",
  "periodo": { "inicio": "AAAA-MM-DD", "fim": "AAAA-MM-DD" } | null,
  "municipio_codigo": 5106000 | null,
  "lente": "nenhuma | concentracao | recorrencia | persistencia | sobreposicao" | null,
  "classe_area": "protecao_integral | uso_sustentavel | terra_indigena" | null,
  "animar": true | false,
  "comparar": { "modo": "periodos | municipios", "b_inicio": "…", "b_fim": "…", "municipio_b": 0 } | null,
  "motivo": "frase curta para o aviso, sem números"
}
```

O pedido a `/api/interpretar` leva:

- a pergunta (até 300 caracteres);
- a carga (id e identidade, como no explicar).

O servidor monta o prompt de sistema com a janela da carga e a lista de municípios (código e nome, lida sob RLS). Nenhum dado de detecção vai para o modelo: ele só traduz texto em filtros. O log registra etapa, código, duração e tokens, como hoje; nunca a pergunta.

### Arquivos afetados (previstos)

| Arquivo | Mudança |
| :-- | :-- |
| `index.html` | `#secao-pergunte` no alto de `#filtros`; botão "Animar no tempo" em `#opcoes-mapa`; barra de reprodução no `.mapa-cartao`; item do trajeto na legenda; `#dialogo-ficha`; passo novo em "Como ler esta tela" |
| `src/pergunte.ts` (novo) | Interpretador local, validador comum, chamada a `/api/interpretar` com tempo-limite e aplicação nos controles existentes |
| `src/apresentacao-pergunte.ts` (novo) | "Entendi assim", ✎, recusas e estados |
| `src/replay.ts` (novo) | Agrupamento, centros diários, relógio da reprodução e lacunas |
| `src/mapa.ts` | Métodos para desenhar o quadro da reprodução e o trajeto, e para restaurar o estado estático |
| `src/ficha.ts` (novo) | Montagem da ficha, mini mapa, mini série, roteiro e síntese |
| `src/app.ts` | Ligações mínimas: abrir a reprodução, expor o estado atual à ficha e limpar ao mudar de recorte |
| `src/estilos/componentes.css`, `mapa.css` | Estilos com os tokens existentes; `@media print` da ficha |
| `api/interpretar.ts` (novo), `servidor/interpretar.ts` (novo) | Rota e lógica, reaproveitando `config`, `gemini`, `resposta` e as validações de origem e sessão |
| `vercel.json` | `maxDuration` da rota nova (30 s) |
| `tests/unit/pergunte.test.mjs`, `tests/unit/replay.test.mjs` (novos) | Interpretador, validador, recusas, agrupamento e trajeto |
| `scripts/agentes/interpretar.test.mjs` (novo) | Rota com provedor falso: desligada, método, origem, sessão, esquema inválido |
| `tests/e2e/16-pergunte.spec.mjs` (novo) | Fluxo com IA desligada (interpretador local) → reprodução → ficha |

## Preservação da interface (critérios de aceite)

- Topo idêntico: marca, chips de origem, os três ícones com os mesmos SVGs e títulos, sessão e "Sair". O tema escuro funciona em todos os elementos novos.
- Coluna esquerda: a ordem passa a ser "Pergunte ao mapa", depois Consulta, Lentes (Seleção, Contexto territorial, Cruzar critérios) e Comparar. Todas recolhíveis; nada existente muda de texto.
- Mapa: os painéis "Mapa" e "Camadas", o botão de ampliar e a Legenda continuam nos mesmos lugares. A barra de reprodução não cobre esses controles e só aparece quando aberta.
- Coluna direita: abas, conteúdo e "Perguntar sobre a tela" iguais.
- Rodapé de domínio igual.
- Toda a suíte E2E existente (`tests/e2e/01` a `15`) passa sem alteração de asserções. Se algum seletor precisar mudar, a mudança é justificada na PR.

## Roteiro da demonstração (dados reais da carga vigente)

Fonte: levantamento exploratório de 2026-11-24 sobre o CSV local da carga, com as mesmas 10.640 detecções da produção, guardado em `local/` e não versionado. Os números exatos na tela são os do motor e podem variar conforme o recorte.

| Ordem | Pergunta sugerida | O que mostrar | Números de referência |
| :-- | :-- | :-- | :-- |
| 1 | "Como as detecções evoluíram em Nova Nazaré em agosto de 2026?" | Mancha que se desloca dentro e no entorno da TI Areões; trajeto para sudeste | Agrupamento de 24/07 a 31/08: 325 detecções, 246 na TI; centro deslocou cerca de 26 km |
| 2 | "Mostre a evolução das detecções em Campinápolis em agosto" | O maior deslocamento, na TI Parabubure | 05 a 26/08: 250 detecções, 237 na TI; cerca de 45 km para leste |
| 3 | "Onde as detecções persistiram em Nova Maringá entre agosto e setembro?" + "Gerar ficha" | Persistência parada, fora de área protegida; ficha com roteiro de CAR e autorização de queima | 04/08 a 03/09: 94 detecções em 23 dias, numa área de cerca de 14 km |
| Extra | "Quem causou esse fogo?" | Recusa de autoria | — |

Os três casos têm de 5 a 6 dias de incidência indeterminada no município no período, o que serve para mostrar a marca de lacuna. Reserva: TI São Marcos (Barra do Garças) e Resex Guariba-Roosevelt (Colniza), em agosto.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | As contagens, lentes e a disponibilidade são as do motor existente, que não muda. O trajeto e o agrupamento de 10 km e 3 dias são uma camada de apresentação, com legenda e ressalva ("onde apareceram, não avanço do fogo") e testes unitários com casos conhecidos. A IA não produz números. Revisão formal dispensada pelo responsável (D1). |
| G2 — autenticação, autorização e isolamento por RLS | Sim | A rota nova repete as validações de `/api/explicar` (IA ligada, POST, origem, JWT, carga vigente sob RLS) e lê só municípios e carga com a sessão do usuário, sem `service_role`. Coberta por testes da rota. Nenhuma mudança de banco. |
| G3 — privacidade de dados | Sim | Só vão ao modelo a pergunta, a janela e os nomes públicos de município, nunca dados de detecção nem identificação do usuário. O log não guarda a pergunta. A ficha é gerada no navegador. As fixtures são as fictícias existentes, e os números do roteiro são de dados públicos (INPE, FUNAI, CNUC), sem atributos pessoais. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Estratégia de testes e gates locais

1. `npm run typecheck`, `npm run typecheck:servidor`, `npm run build`.
2. `npm run test:interface`, com os unitários novos: interpretador local nas perguntas do roteiro e nas recusas; validador rejeitando datas fora da janela, município inexistente e enumerados inválidos; agrupamento e trajeto num caso sintético com deslocamento conhecido.
3. `npm run test:agentes` com o teste novo da rota (provedor falso).
4. `npm run test:e2e` (Supabase local): a suíte existente inteira mais `16-pergunte`, com a IA desligada, que exercita o interpretador local → "Entendi assim" → filtros aplicados → reprodução → ficha aberta → recusa.
5. Conferência visual no navegador, em claro e escuro, a 1440 × 900 e 1280 × 720: topo, coluna esquerda recolhida e aberta, barra sobre o mapa e ficha em pré-visualização de impressão.
6. `npm run check:governance`, que é o único check da CI.

## Como testar a PR (responsável)

- A branch não gera preview na Vercel (`deploymentEnabled` só em `main`).
- Teste local: `npx supabase start`, depois `npm run test:e2e` ou `npx vite` com as variáveis do `.env`.
- Para a IA real, `npx vercel dev` com `RQ_IA_HABILITADA=true` e a chave do Gemini no ambiente local, nunca versionada.
- Sem chave, a tela usa o interpretador local e marca "Interpretado sem IA".
- Depois do merge, o deploy de `main` publica em produção. A rota nova herda as variáveis já configuradas para `/api/explicar`.

## Riscos, suposições e rollback

- **Latência ou cota do Gemini no dia.** Mitigação: tempo-limite de 20 s e o interpretador local para as perguntas do roteiro. Ensaiar com a IA real antes da final.
- **Pergunta fora do roteiro da banca.** Mitigação: "Entendi assim" editável, "não entendi" honesto e sugestões clicáveis.
- **Trajeto confundido com avanço do fogo.** Mitigação: legenda, ressalva na ficha e o termo "detecções de calor" em todo texto novo.
- **Quebra visual da interface atual.** Mitigação: tudo novo é acrescentado, sem trocar seletores existentes, mais os critérios da seção "Preservação da interface" e a suíte E2E.
- **Desempenho da reprodução em recortes grandes** (Todo Mato Grosso, janela inteira, 10 mil pontos). Mitigação: redesenho por quadro só das mudanças, no mesmo renderizador `canvas` quando houver, e aviso para restringir o recorte acima de 5.000 detecções.
- **Suposição:** a variável `RQ_*` de produção vale também para a rota nova.
- **Rollback:** reverter o squash da PR. Não há migração nem dado envolvido.

## Itens de implementação

### Item 1 — Pergunte ao mapa, mapa vivo e ficha (issue #113)

Uma PR. Ordem sugerida:

1. Validador e interpretador local, com testes.
2. Seção e "Entendi assim" aplicando nos controles existentes.
3. Reprodução e trajeto, com testes.
4. Ficha e impressão.
5. Rota `/api/interpretar` com testes.
6. E2E novo e conferência visual.
7. PR com os highlights.

Prioridade de corte se faltar tempo:

1. sincronia com a série;
2. busca por nome de área;
3. síntese de IA na ficha.

O texto determinístico da síntese fica.

## Highlights para a apresentação (entram na PR)

- "Pergunte ao mapa": linguagem natural vira filtros auditáveis, e o técnico vê e corrige o que a IA entendeu.
- A IA não inventa números: só traduz a pergunta, e as contagens vêm do mesmo motor das lentes.
- A IA sabe dizer não: recusa autoria e previsão e avisa quando o dado não existe.
- Mapa vivo: as detecções de calor aparecem dia a dia, com o trajeto do centro e os dias sem cobertura comprovada marcados.
- Ficha para averiguação: do mapa ao documento que o técnico leva a campo, com roteiro conforme o contexto (CAR, autorização de queima, FUNAI, gestor da UC) e espaço para a conclusão dele.
- Funciona mesmo sem IA, com o interpretador local, e tudo o que existia continua igual.

## Referências

- Maquete de funcionalidade: `local/mockup-visual/v14/rastro-quente-v14.html` (local, não versionada).
- `DESIGN.md`, ADR-007, ADR-009, ADR-010 e ADR-011, KB-005 e KB-006, que são as referências de comportamento existente e não são alteradas neste ciclo (D1).

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando autorização de implementação — ciclo 012 (leve)
Quem: Responsável
Conferir: Issue [#113](https://github.com/EuThiagoAndrade/rastro-quente/issues/113) e escopo deste plano
Diga: "autorizo a implementação da issue #113"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 012 + rascunhar_plano + 012_plan + v1`
- `effect_class`: `remote_mutation` (issue #113) e `local_mutation` (branch e plano)
- `state_before` / `state_after`: ciclo 012 inexistente / plano `Rascunho` v1 em `drafts`, issue #113 aberta, branch `feature/issue-113` criada de `origin/main`
- `result`: `executed`
- `evidence`: este arquivo, a linha do ciclo `012` em `_project/cycles.md` e a [issue #113](https://github.com/EuThiagoAndrade/rastro-quente/issues/113)
- `blockers`: nenhum
