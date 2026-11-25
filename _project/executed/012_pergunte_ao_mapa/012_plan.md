# Plano de Implementação — Pergunte ao mapa

> **Ciclo:** `012`
> **Status:** `Concluído`
> **Versão:** `v3`
> **Data de criação:** 2026-11-24
> **Última atualização:** 2026-11-25
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `leve`
> **Autorização inicial:** "Pode criar o plano" em 2026-11-24 — entrega única (one shot) para a final da banca, com a governança reduzida por decisão do responsável (ver D1)
> **Modo contínuo:** `—`
> **Revisão formal:** `Dispensada pelo responsável (D1)`
> **Veredito da revisão:** `—`
> **Aprovação humana pós-revisão:** `—` (revisão dispensada, D1)
> **Autorização de implementação:** "Autorizo a implementação da issue #113" em 2026-11-24
> **Issue:** [#113](https://github.com/EuThiagoAndrade/rastro-quente/issues/113)
> **Branch:** `feature/issue-113`
> **handoff_schema_version:** `2`

## Problema e contexto

O projeto foi para a final da banca. Falta algo novo de impacto, feito com IA, que sirva às atribuições da SEMA-MT sobre o uso do fogo: monitoramento, fiscalização, prevenção e gestão. O combate é atribuição do Corpo de Bombeiros.

Hoje o técnico já monta um recorte (período e município), aplica as lentes e, ao fim, pode fazer cinco perguntas fechadas ao agente. Falta:

- entrar no sistema por uma pergunta em linguagem natural;
- ver como as detecções de calor se distribuem no tempo, dia a dia;
- sair com um documento que encaminhe uma averiguação.

A fórmula escolhida é **pergunta → mapa vivo → ficha para averiguação**. A maquete de referência é `local/mockup-visual/v14/`, apenas para funcionalidade. O visual de referência é a interface atual (`index.html`, `src/estilos/`, `DESIGN.md`), que não pode mudar.

**Narrativa da apresentação:** “Eu faço uma pergunta, a IA conduz a consulta, o mapa mostra a evolução das detecções e o sistema prepara a ficha de análise.”

**Termos.** Os pontos são **detecções de calor** (focos de calor), nunca "fogo" ou "incêndio". A animação mostra o aparecimento diário das detecções, sem linha tracejada nem qualquer indicação de avanço de um incêndio. Cor e opacidade só distinguem o dia atual dos anteriores; não representam intensidade, área queimada nem gravidade.

### Decisões do responsável (2026-11-24)

- **D1. Governança mínima.** O ciclo é tratado como leve, com um único documento e sem ideação, revisão formal, task, ADR, KB, emendas ou encerramento prospectivo. São só a issue #113, a branch `feature/issue-113` e uma PR única com o plano e a implementação. O responsável testa e integra a PR. Continuam valendo: nenhum segredo nem dado pessoal versionado; o agente não faz merge; o termo é "detecção de calor".
- **D2. Funcionalidades atuais preservadas.** Lentes, filtros, comparação, abas, série, Lista de focos, camadas, tema e as cinco perguntas fechadas continuam iguais. A pergunta é uma porta de entrada a mais e não substitui nada.
- **D3. Interface atual preservada.** Topo, chips de origem, ícones (Sobre os dados, Como ler esta tela, tema), fontes, cores, posições e o rodapé de domínio ficam como estão. Os elementos novos usam os tokens e componentes existentes (`.secao`, `.botao`, `.nota`, `.flutuante`, `.opcao-mapa`, `.dialogo`). A maquete v14 vale só como referência de funcionalidade.
- **D4. Seções recolhíveis.** "Pergunte ao mapa" fica no alto da coluna esquerda, recolhível como as seções das lentes (`<details class="secao">`). A seção "Consulta" (período e município) também é recolhível: já é um `<details>` e continua assim.
- **D5. Animação sem trajeto.** Sem linha tracejada, sem agrupamento de trajeto e sem medidas de deslocamento ou rumo. O foco visual é a evolução diária dos pontos.
- **D6. Roteiro da demonstração.** Três casos reais (ver "Roteiro da demonstração"): TI Areões, TI Parabubure e Nova Maringá.
- **D7. Sem 3D neste ciclo (v3).** O modo 3D proposto na v2 sai do escopo por causa do prazo: exigiria outra biblioteca de mapa, mudanças na CSP e revisão do limite de tamanho do pacote. O mapa vivo é só em 2D, no Leaflet atual. O 3D pode voltar num ciclo próprio. O relatório do CBMMT continua fora.
- **D8. Ajustes depois do primeiro teste (2026-11-24).** Autorizados na PR #114 ("autorizo incluir a combinação de lentes na PR #114"):
  - a pergunta também aplica a combinação de lentes (duas ou mais entre concentração, recorrência e persistência, com o operador "e" ou "ou"), nos controles existentes de "Cruzar critérios"; a sobreposição continua fora da combinação;
  - o mapa vivo sempre abre com o mapa ampliado e a barra completa; Esc ou "Fechar" fecham a barra e devolvem o mapa ao tamanho anterior (a barra minimizada da primeira rodada de ajustes saiu, a pedido do responsável);
  - a coluna esquerda passa a ser "Pergunte ao mapa", "Filtro" (Consulta), "Lentes" (Seleção, Contexto territorial, Cruzar critérios) e Comparar;
  - as perguntas de exemplo saem; fica o exemplo dentro do campo;
  - (2026-11-25, pedido do responsável) "Limpar tudo" sobe para o topo da coluna e passa a limpar também a pergunta; o campo ganha um "×" que apaga só o texto; um robozinho ao lado de "Pergunte ao mapa" indica a IA e fica apagado quando ela está indisponível.

## Objetivo

O técnico escreve uma pergunta sobre as detecções de calor e:

1. vê como o sistema entendeu a pergunta, em filtros que pode corrigir;
2. assiste no mapa à evolução diária das detecções do recorte, com os dias de cobertura não comprovada marcados;
3. gera a ficha para averiguação, imprimível em PDF, com evidências, ressalvas e espaço para a conclusão dele.

Os números vêm sempre do motor que já existe. A IA só interpreta a pergunta e, quando houver, redige a síntese sobre números já conferidos.

## Origem no backlog

Não se aplica.

## Contexto técnico (main em `6841734`)

- **Carga.** Os pontos do recorte já são lidos por inteiro (`leitura.registros`, via `consultar_deteccoes`) e desenhados por `mapa.definirPontos` (`src/mapa.ts`). Cada registro traz `data_hora_gmt`, `latitude`, `longitude` e `municipio_codigo`. O mapa vivo não precisa de consulta nova.
- **Lentes.** São calculadas no navegador (`src/lentes/`). A disponibilidade é lida por `consultar_disponibilidade` (`src/consulta.ts`).
- **IA.** `/api/explicar` (`api/explicar.ts` → `servidor/explicar.ts`) usa o Gemini `gemini-3.1-flash-lite` por REST (`servidor/gemini.ts`), já com saída estruturada (`Interacao.esquema`). A rota valida origem, JWT do usuário e carga vigente sob RLS, e corta pedidos acima de 64 KiB. Fica desligada se `RQ_IA_HABILITADA` não for `true`.
- **Interface.** A coluna esquerda (`#filtros`) tem `#secao-consulta`, `#secao-lente`, `#secao-contexto`, `#secao-cruzar` e `#secao-comparar`, todos `<details class="secao">`. O painel "Mapa" (`#opcoes-mapa`) agrupa as opções do mapa.
- **CSP** (`vercel.json`). `style-src 'self'` proíbe o atributo `style` inline: estilos ficam nos `.css`, e o JS ajusta só por `element.style` ou por classes. `connect-src 'self' https://*.supabase.co`: a chamada nova é para a mesma origem, então a CSP não muda.
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
3. **Aplicação.** A interpretação preenche os **controles existentes** (`#f-periodo` = `personalizado` com `#f-inicio`/`#f-fim`, `#f-municipio`, `l-lente`, `l-classe`, `c-modo`, `cmp-b-*`) e dispara os mesmos eventos que o usuário dispararia (`change`/`submit`). Não existe caminho paralelo de consulta.
4. **Recusas e limites**, num aviso abaixo do bloco:
   - **Autoria** ("quem causou", "culpado", "crime", "infração"): o sistema não indica autoria, dano nem infração; o aviso traz o botão "Mostrar as detecções".
   - **Previsão** ("vai queimar", "amanhã", "risco"): o sistema não faz previsão.
   - **Dado ausente** (bioma, chuva, vento, umidade, área queimada, intensidade): "esse dado não está na base".
   - **Fora da janela** (período fora da carga): o aviso informa a janela disponível.
5. **Interpretador:**
   - **Com IA:** a rota nova `POST /api/interpretar` faz uma única chamada ao Gemini com saída estruturada (esquema abaixo), sem ferramentas. Repete as validações de `/api/explicar`: IA ligada, POST, origem, JWT, carga vigente e limites de corpo.
   - **Sem IA:** um interpretador local por regras, no navegador. Reconhece meses (o ano vem da janela), datas, os nomes de município da carga (sem diferenciar acentos), as palavras das lentes e das classes, "comparar"/"diferença" e as recusas. Entra quando a IA está desligada, demora mais de 20 s ou falha. É a rede de segurança da apresentação.
   - **Validação:** a saída da IA passa pelo mesmo validador do interpretador local antes de ser aplicada:
     - datas dentro da janela da carga;
     - município entre os da carga, por código;
     - valores enumerados;
     - qualquer campo inválido é descartado e avisado no "Entendi assim", nunca aplicado.

**B. Mapa vivo** (sobre o mapa, no mesmo cartão)

6. **Abertura.** O botão "Animar no tempo", no painel "Mapa" (`#opcoes-mapa`), abre a barra de reprodução. Uma pergunta interpretada em modo animação também a abre, já tocando.
7. **Barra** (`.flutuante`, na base do mapa): tocar/pausar, controle deslizante por dia GMT do período, velocidades 1×, 2× e 4× e o rótulo "dd/mm · N no dia · N acumuladas". Esc ou "Fechar" restaura o mapa estático.
8. **Desenho:**
   - até o dia corrente, as detecções do dia em destaque e as anteriores esmaecendo com a idade;
   - na própria camada de pontos (`definirPontos` ou uma camada irmã com o mesmo renderizador), sem mudar a camada estática;
   - destaques de lente, áreas e limites continuam visíveis;
   - sem linha tracejada, setas de propagação ou cálculo de deslocamento e rumo (D5).
9. **Lacunas.** Os dias com `incidencia_indeterminada` ou `lacuna_conhecida` no recorte, lidos de `consultar_disponibilidade`, ganham uma marca no controle deslizante e o aviso "cobertura não comprovada neste dia".
10. **Série** (desejável). A série em barras (`#serie-corpo`) acompanha o dia com uma marca, e clicar numa barra leva a reprodução àquele dia.

**C. Ficha para averiguação** (`<dialog id="dialogo-ficha" class="dialogo">`)

11. **Abertura.** O botão "Gerar ficha para averiguação" fica no fim do "Entendi assim" e na aba Lentes, junto da explicação de um destaque. O alvo é o recorte atual ou o destaque escolhido.
12. **Seções:**
    1. **Origem do pedido:** pergunta, interpretação e filtros aplicados; data e hora da geração; versão da carga.
    2. **Local:** município, centro (lat/lon), extensão aproximada e áreas protegidas com a contagem de detecções dentro de cada uma.
    3. **Evidências:**
       - tabela com total, dias com detecção, primeiro e último dia, pico diário e dias de cobertura não comprovada;
       - mini mapa 2D em SVG, só com pontos e sem fundo de terceiros;
       - mini série.
    4. **Síntese:** sempre um texto determinístico montado com os números. Quando o painel de perguntas tiver uma resposta para o mesmo recorte, ela entra marcada como "Gerado por IA".
    5. **Roteiro de averiguação:** lista sugerida e determinística, conforme o contexto:
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
13. **Salvar como PDF** usa `window.print()` com CSS `@media print` que imprime só a ficha. Os campos editáveis saem como foram preenchidos.

### Fora do escopo

- Mudança de banco, RPC, RLS, migração, carga ou método das lentes.
- Mudanças visuais no que já existe (D3).
- Modo 3D, outra biblioteca de mapa e mudanças na CSP (D7).
- Linha tracejada, trajeto, deslocamento ou rumo (D5).
- Importação do relatório do CBMMT.
- Perguntas livres ao agente de explicação: as cinco perguntas fechadas continuam como estão.
- Busca por nome de área protegida. É desejável e é o primeiro corte se faltar tempo; o roteiro nomeia o município.
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

- a pergunta, com até 300 caracteres;
- a carga (id e identidade, como no explicar).

O servidor monta o prompt de sistema com a janela da carga e a lista de municípios (código e nome, lida sob RLS). Nenhum dado de detecção vai para o modelo: ele só traduz texto em filtros. O log registra etapa, código, duração e tokens, como hoje, e nunca a pergunta.

### Arquivos afetados (previstos)

| Arquivo | Mudança |
| :-- | :-- |
| `index.html` | `#secao-pergunte` no alto de `#filtros`; botão "Animar no tempo" em `#opcoes-mapa`; barra de reprodução no `.mapa-cartao`; `#dialogo-ficha`; passo novo em "Como ler esta tela" |
| `src/pergunte.ts` (novo) | Interpretador local, validador comum, chamada a `/api/interpretar` com tempo-limite e aplicação nos controles existentes |
| `src/apresentacao-pergunte.ts` (novo) | "Entendi assim", ✎, recusas e estados |
| `src/replay.ts` (novo) | Quadros diários, relógio da reprodução e lacunas |
| `src/mapa.ts` | Métodos para desenhar o quadro da reprodução e restaurar o estado estático |
| `src/ficha.ts` (novo) | Montagem da ficha, mini mapa, mini série, roteiro e síntese |
| `src/app.ts` | Ligações mínimas: abrir a reprodução, expor o estado atual à ficha e limpar ao mudar de recorte |
| `src/estilos/componentes.css`, `mapa.css` | Estilos com os tokens existentes; `@media print` da ficha |
| `api/interpretar.ts` (novo), `servidor/interpretar.ts` (novo) | Rota e lógica, reaproveitando `config`, `gemini`, `resposta` e as validações de origem e sessão |
| `vercel.json` | Só `maxDuration` da rota nova (30 s); CSP inalterada |
| `tests/unit/pergunte.test.mjs`, `tests/unit/replay.test.mjs` (novos) | Interpretador, validador, recusas e quadros diários com contagens conferidas |
| `scripts/agentes/interpretar.test.mjs` (novo) | Rota com provedor falso: desligada, método, origem, sessão, esquema inválido |
| `tests/e2e/16-pergunte.spec.mjs` (novo) | Fluxo com IA desligada (interpretador local) → reprodução → ficha |

Sem dependência nova em `package.json`.

## Preservação da interface (critérios de aceite)

- Topo idêntico: marca, chips de origem, os três ícones com os mesmos SVGs e títulos, sessão e "Sair". O tema escuro funciona em todos os elementos novos.
- Coluna esquerda na ordem "Pergunte ao mapa", Consulta, Lentes (Seleção, Contexto territorial, Cruzar critérios) e Comparar. Todas as seções são recolhíveis, e nenhum texto existente muda.
- Mapa: os painéis "Mapa" e "Camadas", o botão de ampliar e a Legenda continuam nos mesmos lugares. A barra de reprodução não cobre esses controles e só aparece quando aberta.
- Coluna direita: abas, conteúdo e "Perguntar sobre a tela" iguais.
- Rodapé de domínio igual.
- A suíte E2E existente (`tests/e2e/01` a `15`) passa sem alteração de asserções. Se algum seletor precisar mudar, a mudança é justificada na PR.

## Roteiro da demonstração (dados reais da carga vigente)

Fonte: levantamento exploratório de 2026-11-24 sobre o CSV local da carga (as mesmas 10.640 detecções da produção), guardado em `local/` e não versionado. Os números exatos na tela são os do motor e podem variar conforme o recorte.

| Ordem | Pergunta sugerida | O que mostrar | Números de referência |
| :-- | :-- | :-- | :-- |
| 1 | "Como as detecções evoluíram em Nova Nazaré em agosto de 2026?" | Pontos surgindo dia a dia no contexto da TI Areões, com pausa num dia de pico | Referência exploratória de 24/07 a 31/08: 325 detecções, 246 na TI; recalcular os totais no recorte exato de agosto |
| 2 | "Mostre a evolução das detecções em Campinápolis em agosto" | Reprodução no contexto da TI Parabubure, com velocidade 2× e marca de lacuna | Referência exploratória de 05 a 26/08: 250 detecções, 237 na TI; conferir os totais da consulta exata |
| 3 | "Onde as detecções persistiram em Nova Maringá entre agosto e setembro?" + "Gerar ficha" | Destaques de persistência do motor, reprodução e ficha com roteiro de CAR e autorização de queima | Referência exploratória de 04/08 a 03/09: 94 detecções em 23 dias; a persistência exibida continua sendo calculada pelo motor existente |
| Extra | "Quem causou esse fogo?" | Recusa de autoria | — |

Nos três casos, o município tem 5 a 6 dias de incidência indeterminada no período, o que serve para mostrar a marca de lacuna. Reserva: TI São Marcos (Barra do Garças) e Resex Guariba-Roosevelt (Colniza), em agosto.

**Sequência visual comum:** pergunta → interpretação e consulta → reprodução diária → pausa em um dia → ficha de análise.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Contagens, lentes e disponibilidade são as do motor existente, que não muda. A reprodução só fatia por dia GMT os registros já lidos, e a soma dos quadros é conferida contra o total do recorte. Não há agrupamento de trajeto nem medidas de deslocamento ou rumo. A IA não produz números. Revisão formal dispensada pelo responsável (D1). |
| G2 — autenticação, autorização e isolamento por RLS | Sim | A rota nova repete as validações de `/api/explicar` (IA ligada, POST, origem, JWT, carga vigente sob RLS) e lê só municípios e carga com a sessão do usuário, sem `service_role`. Coberta por testes da rota. Nenhuma mudança de banco. |
| G3 — privacidade de dados | Sim | Ao modelo vão só a pergunta, a janela e os nomes públicos de município; nunca dados de detecção nem identificação do usuário. O log não guarda a pergunta. A ficha é gerada no navegador. As fixtures são as fictícias existentes, e os números do roteiro vêm de dados públicos (INPE, FUNAI, CNUC), sem atributos pessoais. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Estratégia de testes e gates locais

1. `npm run typecheck`, `npm run typecheck:servidor`, `npm run build`.
2. `npm run test:interface`, com os unitários novos:
   - interpretador local nas perguntas do roteiro e nas recusas;
   - validador rejeitando datas fora da janela, município inexistente e enumerados inválidos;
   - quadros diários cuja soma é igual ao total do recorte.
3. `npm run test:agentes`, com o teste novo da rota (provedor falso).
4. `npm run test:e2e` (Supabase local): a suíte existente inteira mais a `16-pergunte`. Com a IA desligada, ela exercita o caminho interpretador local → "Entendi assim" → filtros aplicados → reprodução → ficha aberta → recusa.
5. Conferência visual no navegador, em claro e escuro, a 1440 × 900 e 1280 × 720: topo, coluna esquerda recolhida e aberta, barra sobre o mapa, reprodução dos três casos, retorno ao mapa estático e ficha em pré-visualização de impressão.
6. `npm run check:governance`, o único check da CI.

## Como testar a PR (responsável)

- A branch não gera preview na Vercel (`deploymentEnabled` só em `main`).
- Teste local: `npx supabase start`, depois `npm run test:e2e` ou `npx vite` com as variáveis do `.env`.
- Para a IA real, usar `npx vercel dev` com `RQ_IA_HABILITADA=true` e a chave do Gemini no ambiente local, nunca versionada.
- Sem chave, a tela usa o interpretador local e marca "Interpretado sem IA".
- Depois do merge, o deploy de `main` publica em produção. A rota nova herda as variáveis já configuradas para `/api/explicar`.

## Riscos, suposições e rollback

- **Latência ou cota do Gemini no dia.** Mitigação: tempo-limite de 20 s e interpretador local para as perguntas do roteiro. Ensaiar com a IA real antes da final.
- **Pergunta fora do roteiro da banca.** Mitigação: "Entendi assim" editável, "não entendi" honesto e sugestões clicáveis.
- **Quebra visual da interface atual.** Mitigação: tudo o que é novo é acrescentado, sem trocar seletores existentes, e vale o que está em "Preservação da interface" e na suíte E2E.
- **Desempenho da reprodução em recortes grandes** (Todo Mato Grosso, janela inteira, 10 mil pontos). Mitigação: redesenho por quadro só das mudanças, no mesmo renderizador `canvas` quando houver, e aviso para restringir o recorte acima de 5.000 detecções.
- **Suposição:** as variáveis `RQ_*` de produção valem também para a rota nova.
- **Rollback:** reverter o squash da PR. Não há migração nem dado envolvido.

## Itens de implementação

### Item 1 — Pergunte ao mapa, mapa vivo e ficha (issue #113)

Uma PR, na ordem sugerida:

1. Validador e interpretador local, com testes.
2. Seção e "Entendi assim" aplicando nos controles existentes.
3. Reprodução diária com lacunas, com testes.
4. Ficha e impressão.
5. Rota `/api/interpretar`, com testes.
6. E2E novo e conferência visual.
7. PR com os highlights.

Se faltar tempo, cortar nesta ordem:

1. sincronia com a série;
2. busca por nome de área;
3. síntese de IA na ficha.

O texto determinístico da síntese fica.

## Highlights para a apresentação (entram na PR)

- "Pergunte ao mapa": a linguagem natural vira filtros auditáveis, e o técnico vê e corrige o que a IA entendeu.
- A IA não inventa números: só traduz a pergunta, e as contagens vêm do mesmo motor das lentes.
- A IA sabe dizer não: recusa autoria e previsão e avisa quando o dado não existe.
- Mapa vivo: as detecções de calor aparecem dia a dia, com pausa, controle de data e os dias sem cobertura comprovada marcados.
- Ficha para averiguação: do mapa ao documento que o técnico leva a campo, com roteiro conforme o contexto (CAR, autorização de queima, FUNAI, gestor da UC) e espaço para a conclusão dele.
- Funciona mesmo sem IA, com o interpretador local, e tudo o que existia continua igual.

## Referências

- Maquete de funcionalidade: `local/mockup-visual/v14/rastro-quente-v14.html` (local, não versionada).
- `DESIGN.md`, ADR-007, ADR-009, ADR-010, ADR-011, KB-005 e KB-006: referências de comportamento existente, não alteradas neste ciclo (D1).

## Encerramento

- **Encerramento prospectivo:** Sim. Encerramento curto, autorizado pelo responsável em 2026-11-25 ("Posso fazer o encerramento curto dos ciclos 012 e 013"), numa PR documental conjunta, porque a PR de entrega deste ciclo leve (D1) foi integrada sem o encerramento.
- **Entrega:** PR [#114](https://github.com/EuThiagoAndrade/rastro-quente/pull/114), integrada por squash em `main` (`c90a3bf`), com os checks verdes. Fechou a issue [#113](https://github.com/EuThiagoAndrade/rastro-quente/issues/113).
- **O que entrou:** "Pergunte ao mapa", mapa vivo e ficha para averiguação, com os ajustes D8 do teste do responsável.
- O ciclo 013 (PR #116) ajustou o que este entregou: sobrecarga da IA com modelo reserva e o mini mapa da ficha.
- **Integração deste encerramento:** `Pendente` até o merge da PR documental.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 012 (leve)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 012 + encerrar + 012_plan + pr-114`
- `effect_class`: `remote_mutation` (PR documental de encerramento)
- `state_before` / `state_after`: ciclo em `drafts/`, `Planejamento`, com a PR #114 integrada / ciclo em `executed/`, `Concluído`
- `result`: `executed`
- `evidence`: PR #114 integrada (`c90a3bf`) com os checks verdes; issue #113 fechada; linha do ciclo em `_project/cycles.md`
- `blockers`: nenhum
