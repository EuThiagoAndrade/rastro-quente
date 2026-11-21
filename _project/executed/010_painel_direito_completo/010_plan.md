# Plano de Implementação — Painel direito completo

> **Ciclo:** `010`
> **Status:** `Concluído`
> **Versão:** `v2`
> **Data de criação:** 2026-11-18
> **Última atualização:** 2026-11-18
> **Tipo:** `feature`
> **Prioridade:** `P2` (proposta para revisão)
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 010" em 2026-11-18
> **Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 010" em 2026-11-18
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO PARA APROVAÇÃO`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-18`
> **handoff_schema_version:** `2`

## Problema e contexto

Ideação: _project/ideations/010_painel_direito_completo.md

## Objetivo

Entregar as três abas e o painel do agente com pergunta orientadora, resposta baseada no resultado real, explicação dos limites, ações concretas e evidência técnica acessível. Cobrir lista e detalhe de lentes e municípios, ausência de destaques, comparação de períodos e municípios e o percurso da pergunta ao agente até resposta, cancelamento ou falha.

## Origem no backlog

Não se aplica.

## Contexto e baseline

Base local `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`, após o ciclo 009. `src/app.ts` coordena recorte, mapa, lentes, comparação e perguntas. As funções de apresentação já renderizam listas, evidências paginadas, disponibilidade, alternância A/B, eventos e vínculos entre painéis. Hoje escolher município na lista aplica um filtro global. A proposta abaixo separa a inspeção da linha estadual da ação explícita de consultar o município. O esboço privado foi lido como referência de interação, e os critérios deste plano são autossuficientes.

## Escopo

### Dentro do escopo

- Aba Lentes, com concentração, recorrência, persistência, combinação e sobreposição nas três classes existentes.
- Aba Municípios, com lista estadual, detalhe, ordenação e navegação explícita para mapa, consulta municipal e lente.
- Aba Comparação, com estados, evidências e navegação A/B nos dois modos existentes.
- Painel do agente, com contexto aplicado, perguntas prontas, formulário, etapas, resposta, evidências, cancelamento, descarte e nova tentativa.
- Contrato visual, foco, teclado, temas e layout responsivo das superfícies afetadas.

### Fora do escopo

Novas fontes, fórmulas, limiares, classificação de risco, agregados de cobertura, critérios de pertinência, schema, políticas de acesso, arquitetura da IA, mudanças de provedor, mudanças gerais na tela central e nos filtros, release própria e verificação hospedada como critério de aceite desta proposta.

## Decisões e autoridades

- KB-004 a KB-007 regem unidade, recorte, GMT, evidência, cobertura e comparação. ADR-011 rege a fronteira servidor/cliente do agente. O contrato visual vigente rege os componentes e estados até ser atualizado pelas entregas.
- Preservar a ordem vigente por lente. Sem ordinais de prioridade nas listas de células; apresentar os meses ou a duração da sequência como atributos de leitura. Indicar o maior valor observado quando derivável da lista já calculada, com empates tratados como tal. Em persistência, o total da aba conta destaques/sequências conforme o resultado existente; duas sequências na mesma célula não se tornam dois lugares.
- O detalhe municipal aberto a partir do estado começa com os fatos estaduais já disponíveis, identificados como tal. A aplicação explícita do município reutiliza o fluxo global e atualiza os números para o recorte municipal. A participação em destaques estaduais e o resultado da lente refeita no município têm rótulos distintos. Concentração continua restrita ao estado.
- As ações de navegação usam identidades da aplicação, nunca comandos ou links sugeridos pelo modelo. Uma ação que muda o recorte descreve seu efeito antes do clique.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — "autorizo o rascunho do plano do ciclo 010" | Ideação registrada | Rascunho local | Revisão formal, publicação, implementação | Escopo e decisões da ideação |
| Aprovar plano — "aprovo o plano do ciclo 010" | Veredito apto registrado e ressalvas tratadas | Publicar PR documental e, após sua integração e confirmação do payload, criar as issues; encerramento após as entregas | Iniciar implementação ou integrar PR | Versão, veredito, ressalvas e payloads |
| Autorizar — "autorizo a implementação da issue #N" | Plano integrado, issue válida e dependências integradas | Implementação, gates e PR da issue | Outras issues, merge ou ampliação do escopo | Issue, task, escopo, barreiras e base |
| Aprovar merge — "aprovo o merge da PR #N" | Diff conferido e checks verdes | Squash da PR indicada, inclusive plano e encerramento | Merge de outra PR, ação externa ou verificação em produção | Número, diff, checks e estado atual |
| Ação humana externa e verificação em produção | Ausentes do escopo proposto | — | Exigem ponto próprio se incorporadas ao ciclo | Roteiro, versão, evidência e autorização correspondente |

Parar se houver conflito de escopo, interpretação analítica, privacidade, nova dependência ou precondição material sem comprovação. Se uma ação exigir nova regra, registrar alternativas com exemplo numérico e obter decisão antes da alteração.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Conferir textos, unidades, filtros, identidades, vínculos e precedência dos estados contra KB-004 a KB-007 e fixtures com resultados esperados independentes. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Apresentação e navegação reutilizam as leituras e operações sob a sessão vigente. Reavaliar se surgir mudança de acesso. |
| G3 — privacidade de dados | Sim | Usar fixtures sanitizadas; conferir textos, prints e payloads; manter o material privado fora do Git. Pergunta, resposta e evidência entram como texto, sem registrar conteúdo do usuário em logs ou testes. |
| G4 — migrações só acrescentam | Não | Nenhuma migração prevista. |

## Estratégia de testes

Executar `npm run typecheck`, `npm run build` e os gates de governança do README antes da publicação pertinente. Usar os testes existentes de `tests/unit` e `tests/e2e` por entrega; rodar Playwright local com banco de teste e especificações selecionadas. Reutilizar fixtures de lentes e comparação e a simulação do fluxo do agente. Acrescentar asserções somente para lacunas de regressão. Preservar os checks exigidos pelo CI.

- Lentes: um detalhe de recorrência com mês parcial/sem registro e uma célula com duas sequências de persistência. Aproveitar as especificações de combinação e áreas para conferir evidências, identidade e ações preservadas. Conferir estados vazio e indisponível em pontos de maior risco.
- Municípios: fluxo estadual → detalhe → mapa → consulta municipal → Lentes ou retorno, verificando que inspecionar e voltar preservam os filtros, e que a célula compartilhada não é somada como municipal exclusiva.
- Comparação: cenário temporal pendente que se torna conclusivo, falha de conferência e cenário municipal de divisa com mapa B e volta a A; conferir fatos por lado e ausência de diferença antecipada.
- Agente: um fluxo de sucesso com evidência e link para resultado e um fluxo com cancelamento ou descarte e nova tentativa após falha, validando evento real e seleção vigente. Usar respostas simuladas já sanitizadas.
- Uma passagem integrada de teclado e foco em desktop e em largura móvel, nos temas claro e escuro. Conferir retorno ao elemento acionador, divulgação de estados, contraste, alvo de 44 px e ausência de transbordamento da página. Registrar cenários, comandos e resultados em cada task.

Preservar IDs, atributos de estado, regiões vivas, foco e títulos normativos cobertos por `03-acessibilidade`, `05-lentes`, `06-combinacao`, `07-areas`, `08-resultado`, `12-comparacao`, `13-perguntas` e `14-rotulos-espaco`. Ajustar asserções de texto apenas nas mudanças expressamente especificadas, incluindo a unidade do resumo da persistência.

### Critério de aceite visual comum às quatro entregas

- [ ] As três abas e o painel do agente reproduzem a composição e a hierarquia visual da proposta. A conferência de cada PR usa este checklist e sua consolidação em `DESIGN.md`. A conferência lado a lado com o HTML é complementar quando a referência privada estiver disponível.
- [ ] Na coluna de resultados, a navegação de abas mantém a aba ativa destacada. Cada vista apresenta título, pergunta orientadora, resposta principal em bloco destacado, explicação e ressalvas, ações com descrição do efeito e detalhes técnicos recolhíveis. Nos detalhes de lista, a ação de voltar antecede o título. Listas agrupam rótulo e métrica, com informação secundária abaixo. Avisos têm texto e identidade visual própria.
- [ ] Lentes apresenta lista, detalhe, meses ou sequência conforme a variante e estado vazio. Municípios apresenta lista ordenável e detalhe. Comparação identifica A e B antes da resposta e destaca o motivo quando a conclusão estiver suspensa. O agente agrupa contexto, perguntas prontas e formulário na entrada, mostra etapas e cancelamento durante a execução e destaca a resposta com identificação de IA, ou o aviso e as ações em caso de falha.
- [ ] Em desktop e celular, nos dois temas, conferir hierarquia tipográfica, espaçamento entre blocos, contraste, ordem e destaque das ações, foco, quebra de conteúdo e detalhes acessíveis. Registrar a conferência com dados fictícios sanitizados e justificar desvios visuais na task.
- [ ] Adaptações intencionais do esboço: preservar a ordem vigente da KB-005, sem ordinais de prioridade nas listas de células. Mostrar cobertura no detalhe da unidade, sem atribuir à lista um agregado do recorte. Usar os destinos e estados reais definidos nos itens seguintes, com rótulos que anunciam o efeito de cada ação.

## Itens de implementação

### Item 1 — Lentes: resumo, lista e detalhe

**Contexto:** o resultado e a explicação existem em renderizadores separados para lentes simples, combinação e áreas.

**Ação técnica:** reorganizar a apresentação sobre os resultados existentes, compartilhando componentes de interface quando os comportamentos coincidirem. Reusar a seleção e o foco do mapa e a tabela paginada de evidências para “Ver os focos”. Usar o filtro de período como destino da ação de ajustar datas, sem disparar consulta antes de aplicar a escolha.

**Critérios de aceite:**

- [ ] Cada variante apresenta pergunta, resultado e recorte aplicados, lista navegável, detalhe, ações e limitações. Abrir por lista ou mapa seleciona a mesma identidade. Voltar restaura página e foco.
- [ ] Recorrência mostra meses GMT com contagens de evidência e identifica meses parciais. Persistência mostra as datas de cada sequência e sua evidência. Concentração conserva corte, empatados e ressalva sobre contagem absoluta.
- [ ] Combinação expõe operador, evidência por critério e união sem duplicatas. Sobreposição expõe classe, áreas relacionadas, registros vinculados, fonte, ressalvas de borda e acesso ao contorno existente.
- [ ] Cobertura mostra estado e dias por classe quando conhecidos, respeitando a unidade e os municípios dos registros. Falha e pendência continuam explícitas. Nenhuma soma de dias dos destaques representa o recorte inteiro. Metadados mantêm identidade, precisão, versão, período e proveniência acessíveis.
- [ ] Sem destaque, a mensagem explica o critério aplicado. Sem lente, janela insuficiente, combinação incompleta, carga sem camada, carregamento e falha têm estados próprios e ações cabíveis.

#### Unidades e evidências da aba Lentes

| Variante | Número principal e frase de resposta |
| :-- | :-- |
| Concentração | Municípios destacados no recorte estadual, incluindo os empatados no corte vigente. |
| Recorrência | Células distintas com registros em pelo menos três meses GMT. |
| Persistência | Sequências com registros em pelo menos três dias GMT consecutivos e, em separado, células distintas dessas sequências. O número da aba conta sequências. Duas sequências na mesma célula produzem “2 sequências em 1 célula”. |
| Combinação | Células distintas que atendem ao operador e aos critérios escolhidos. |
| Sobreposição | Células distintas com detecções vinculadas a áreas da classe selecionada. |

No detalhe da recorrência, usar `mesesDaJanela(r.janela)` de `src/lentes/recorrencia.ts` (`Janela` contém início e fim). Apresentar todos e apenas os meses tocados, em ordem cronológica, com mês/ano e indicação de parcial do helper. Resolver os IDs de `d.evidencia.deteccoes` nos registros de `ctx.registros` e agrupar pelo prefixo `AAAA-MM` de `data_hora_gmt`. A soma deve corresponder aos IDs da evidência. Zero significa nenhum registro da evidência no mês e mantém a ressalva de cobertura. Usar o estado de leitura inconsistente se os IDs não puderem ser reconciliados. Preservar o cálculo da recorrência e `versao_metodo`.

- “Mostrar no mapa” mantém o destaque aberto, reenquadra sua geometria pelo ID e, em layout empilhado, leva ao mapa sem alterar filtros. Se a geometria estiver indisponível, informar o estado no painel.
- “Ver os focos” abre e leva à evidência paginada do destaque em `#lente-evidencia-detalhes`, inclusive na concentração, cujo conjunto é o dos registros de evidência daquele município. O rótulo numérico, quando exibido, usa a contagem desses registros.
- “Alterar o período” abre `#secao-consulta` e foca `#f-periodo` ou o campo inicial quando o modo personalizado estiver ativo. Usar no vazio e na janela insuficiente.

### Item 2 — Municípios: lista, detalhe e consulta explícita

**Contexto:** a lista usa o resumo estadual e pode mostrar a participação na lente ativa. O cartão do recorte municipal já usa fatos próprios.

**Ação técnica:** manter a ordenação existente por detecções, destaques e nome. Criar navegação local de lista e detalhe na aba. Reutilizar o resumo e a geometria disponíveis para enquadrar o município e a consulta existente para aplicar o filtro por ação explícita.

**Critérios de aceite:**

- [ ] A lista informa período, total e município(s) com maior contagem quando disponíveis, preserva empates e explica os limites da contagem absoluta. Zero possui mensagem própria.
- [ ] O detalhe separa volume de detecções, dias, células e participação em destaques conforme o escopo e a disponibilidade de cada métrica. Uma célula pode contribuir em mais de um município segundo a regra vigente.
- [ ] Mostrar no mapa localiza a geometria disponível sem alterar filtros; se falhar ou estiver indisponível, informa o estado. “Consultar município” aplica o filtro pela entrada normal. A ação de ver destaques abre a aba com escopo explícito, oferecendo aplicação do município quando necessária e disponível.
- [ ] Voltar à lista restaura ordem e foco. Se o recorte aplicado já é municipal, “Ver todo Mato Grosso” continua sendo a ação explícita de trocar o recorte. Metadados e “Sobre os dados” permanecem acessíveis.

#### Inspeção estadual e recorte municipal

- Antes de aplicar o município, mostrar somente total de detecções do resumo estadual e participação em destaques estaduais quando disponível. Dias com detecção e células T1 distintas são apresentados no recorte municipal aplicado, usando `numerosMunicipio` e os estados de leitura existentes. Se `#f-municipio` já indicar um recorte municipal aplicado, abrir diretamente o detalhe desse recorte.
- “Mostrar no mapa” usa a geometria do município na carga atual. Reutilizar o limite carregado ou chamar sob demanda `lerLimites(cliente, carga, codigo)` quando ausente, mesmo com a camada desligada. O mapa enquadra os limites válidos da geometria como ação de câmera, preservando camada, seleção e filtros. Informar carregamento, ausência ou falha. Ignorar retorno de detalhe encerrado, recorte, versão ou sessão substituídos.
- “Ver destaques” no detalhe estadual abre Lentes com o resultado estadual identificado. Para ver o resultado municipal, aplicar “Consultar município” antes de abrir a lente, quando ela for compatível. A inspeção estadual por si só preserva `#pergunta-contexto` e pedidos/respostas do agente. Aplicar filtro usa a invalidação vigente. Limpar o detalhe transitório ao trocar recorte, carga ou sessão.

### Item 3 — Comparação: resposta, disponibilidade e lados do mapa

**Contexto:** KB-007 define os dois tipos de pedido, as precedências de conclusão e a leitura de disponibilidade sob demanda.

**Ação técnica:** reordenar os renderizadores da comparação para apresentar A e B, resposta e limites antes do detalhe. Reusar os controles atuais para mostrar lados, expor disponibilidade, evidências e contexto estadual.

**Critérios de aceite:**

- [ ] Os dois modos mostram identidades, período(s), lente e fatos confirmados de cada lado. Diferença B − A e classes temporais só aparecem quando conclusivas. A comparação municipal descreve pertinência por município e conserva célula de divisa e contexto estadual sob demanda.
- [ ] Pendência, aplicação indisponível, lacuna total, falha e pedido inválido permanecem distintos. Zero observado mantém ressalvas. Meses GMT parciais e janelas de duração igual com quantidades diferentes de meses tocados são explicitados quando cabíveis.
- [ ] Mostrar A ou B muda os dados exibidos no mapa e mantém o rótulo do lado. Tabela, diferenças autorizadas pelo estado, evidências por unidade, paginação e disponibilidade por município e lado continuam acessíveis.

“Ver a disponibilidade” leva foco e rolagem a `#comparacao-disponibilidade` e mostra o progresso existente. A leitura estadual completa continua mediante a ação explícita `#botao-lista-completa`, quando oferecida. A, B, nova tentativa e contexto estadual reutilizam seus manipuladores.

### Item 4 — Agente: contexto, fluxo, resposta e evidências

**Contexto:** o cliente recebe eventos reais e respostas estruturadas da função autenticada delegada pelo ciclo 008.

**Ação técnica:** reorganizar o painel e reutilizar o ciclo de vida e os manipuladores existentes. Usar o contexto autorizado para abrir a aba e o detalhe correspondentes. Vincular a ação de comparar municípios ao formulário da comparação.

**Critérios de aceite:**

- [ ] Ocioso mostra recorte, lente, destaque e comparação quando aplicáveis, perguntas prontas com motivo de indisponibilidade, orientação de privacidade, formulário de até 2.000 caracteres e aviso de IA. Abrir configuração municipal não calcula antes da escolha válida.
- [ ] A execução mostra a pergunta e apenas etapas recebidas, com estado acessível e cancelamento. Troca de seleção, versão ou sessão invalida o pedido e impede exibição tardia.
- [ ] A resposta reproduz a pergunta, identifica IA e conserva status, afirmações, evidências, limites, análises dos subagentes e informações de execução. O acesso a lugar ou resultado abre o alvo real se ainda vigente. Evidências podem ser abertas e conferidas sem novo pedido.
- [ ] Falha distingue os estados existentes e oferece retorno ao resultado e nova tentativa quando cabível, com aviso de nova cota. Repetir usa a mesma pergunta e contexto válido; formato recusado não revela texto inválido.

#### Destinos das ações do agente

- “Ver o lugar na tela” ou “Ver detalhes do resultado” abre o destaque vigente na aba Lentes quando o pedido usou esse destaque. Sem destaque, leva à Comparação se o pedido usou uma comparação, à lista de Lentes se usou uma lente, ou à aba Municípios no recorte aplicado nos demais casos. Revalidar a identidade antes de navegar. O mapa B mantém o caminho da comparação quando ele for a origem. A falha usa os mesmos destinos baseados no pedido, mesmo sem evidências.
- “Ver as informações usadas” abre e foca `#perguntas-evidencias` quando há evidências. Os atalhos de cada evidência continuam usando `abrirDetalhamento`. “Comparar municípios” abre os controles existentes e foca Município B nas condições já suportadas.
- Preservar os textos e a disponibilidade das três perguntas prontas de D4 do ciclo 008 e as emendas do ciclo 009 ao `DESIGN.md`, ADR-009 e ADR-011, inclusive disponibilidade fora da comparação nas evidências do agente. Registrar por emenda datada a nova navegação no ADR-009 e os atalhos de interface no ADR-011, preservando sessão, formato e contrato do servidor.

## Arquivos afetados

- Interface prevista em `index.html`, `src/app.ts`, `src/apresentacao-resultado.ts`, `src/apresentacao-lentes.ts`, `src/apresentacao-combinacao.ts`, `src/apresentacao-areas.ts`, `src/apresentacao-comparacao.ts`, `src/apresentacao-agentes.ts` e estilos de componentes/layout em `src/estilos/`. Inspecionar `src/municipios.ts` e `src/mapa.ts` ao ligar ações.
- Atualizar os trechos pertinentes de `DESIGN.md` em cada entrega de interface. Ajustar testes afetados em `tests/unit/` e `tests/e2e/`.
- Atualizar a seção 10, Guia da interface, de `docs/runbook.md` e incluir as emendas datadas de navegação no ADR-009 e ADR-011 nas entregas correspondentes.
- Consolidar KB-003, registro do ciclo e documentação de encerramento na PR de encerramento. Preservar as autoridades de método e de acesso.

## Decomposição em issues e PRs

| Item | Título proposto | Depende de | PR |
| :-- | :-- | :-- | :-- |
| 1 | [FEATURE] Painel de lentes com resultado e detalhe | Plano integrado | Uma PR |
| 2 | [FEATURE] Lista e detalhe de municípios no painel | Item 1, navegação de Lentes | Uma PR |
| 3 | [FEATURE] Comparação com resposta e disponibilidade no painel | Item 1, padrão visual | Uma PR |
| 4 | [FEATURE] Perguntas sobre a tela com contexto e evidências | Itens 1–3, destinos de navegação | Uma PR |

PR documental do plano antes das issues. PR de encerramento após as quatro entregas e a conferência integrada, sem issue própria.

## Dependências e blockers

Gates locais dependem do ambiente de teste já definido pelo projeto. A revisão precisa validar especialmente a navegação municipal, os casos de métricas indisponíveis e os estados da comparação. Se faltar dado para uma afirmação ou ação, expor o limite e reutilizar a evidência ou operação existente correspondente. Qualquer exigência de nova semântica territorial, nova consulta com alteração de acesso ou mudança do contrato do agente volta ao responsável.

## Riscos, suposições e rollback

- **Ordem e unidade:** exemplo de conferência, uma célula com sequências de 3 e 5 dias equivale a dois destaques de persistência e uma célula na comparação. Preservar IDs e separar métricas. Se for solicitada ordenação metodológica nova, documentar o efeito e submeter à decisão humana.
- **Cobertura:** exemplo de conferência, dois municípios com incidência indeterminada no mesmo dia não equivalem a dois dias do recorte. Mostrar dados na unidade já definida pela KB aplicável.
- **Concorrência de leituras e navegação:** invalidar estado transitório ao trocar recorte, versão ou sessão; respeitar a geração e as memórias existentes. Sem novos carregamentos integrais automáticos para resumos, disponibilidade ou respostas.
- **Reversão:** reverter as PRs afetadas em ordem inversa de dependência, junto das alterações correspondentes no contrato visual. Nenhum rollback de banco previsto.

## Sequência recomendada

1. Revisar formalmente a v2 e obter aprovação pós-veredito.
2. Publicar e integrar a PR documental com aprovação específica. Apresentar e confirmar payloads antes de criar issues.
3. Entregar os itens na ordem 1–4, com autorização e merge próprios para cada um.
4. Conferir os fluxos integrados e consolidar o encerramento prospectivo na PR documental correspondente.

## Referências

- [Ideação 010](../../ideations/010_painel_direito_completo.md) e [contrato visual](../../../DESIGN.md).
- KB-003 a KB-007 em [conhecimento](../../knowledge/) e ADR-011 em [decisões](../../decisions/).
- [Plano do ciclo 008](../../executed/008_comparacao_periodos_agentes/008_plan.md) e [plano do ciclo 009](../../executed/009_rotulos_lentes_espaco_mapa/009_plan.md).

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | #97, #98, #99 e #100 |
| PR(s) | #96 documental; #101, #102, #103 e #104 entregas integradas |
| Branch(es) | `chore/cycle-010-plan` |
| Destino após conclusão | `_project/executed/010_painel_direito_completo/010_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 010 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + publicar_plano + 010_plan + v2`
- `effect_class`: `remote_mutation`
- `state_before`: plano v2 aprovado e publicação documental autorizada.
- `state_after`: PR documental #96 aberta; ciclo em `Planejamento`, aguardando merge.
- `result`: `executed`
- `evidence`: [PR #96](https://github.com/EuThiagoAndrade/rastro-quente/pull/96), da branch `chore/cycle-010-plan` para `main`.
- `blockers`: checks verdes e aprovação específica para integrar.

### Histórico — aprovação do plano v2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + aprovar_plano + 010_plan + v2`
- `effect_class`: `local_mutation`
- `state_before`: plano v2 `Em Revisão`, parecer apto na rodada 2 e aprovação pendente.
- `state_after`: plano v2 `Aprovado`, ciclo em `Planejamento`, publicação documental autorizada.
- `result`: `executed`
- `evidence`: manifestação humana “aprovo o plano do ciclo 010” em 2026-11-18, posterior ao parecer da [Rodada 2](#rodada-2), e cabeçalho atualizado.
- `blockers`: nenhum para a publicação documental.

### Histórico — revisão da rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + revisar_plano + 010_plan/rodada-2 + v2`
- `effect_class`: `local_mutation`
- `state_before`: plano local `Em Revisão` v2, revisão em andamento, aguardando revisão (rodada 2).
- `state_after`: plano local `Em Revisão` v2, revisão formal `Concluída` com veredito `APTO PARA APROVAÇÃO`, aprovação `Pendente`, ciclo `010` em `Planejamento`, `Aguardando aprovação do plano`.
- `result`: `executed`
- `evidence`: parecer da [Rodada 2](#rodada-2), campos `Revisão formal` e `Veredito da revisão` no cabeçalho e bloco `## Próximo passo` atualizado; base local `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`.
- `blockers`: nenhum para a aprovação humana do plano.

### Histórico — correção da rodada 1 (v2)

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + rascunhar_plano + 010_plan + v2`
- `effect_class`: `local_mutation`
- `state_before`: plano `Em Revisão` v1, com veredito `REQUER NOVA RODADA` e sete achados registrados.
- `state_after`: plano `Em Revisão` v2, respostas registradas, aguardando revisão (rodada 2).
- `result`: `executed`
- `evidence`: resposta do autor à rodada 1, critérios revisados e bloco de próximo passo. Blob de origem da v1 revisada `06ff03ab806e7bf610d2cff8c26b2ab16d67b81c`.
- `blockers`: nenhum para iniciar a rodada 2. Veredito e aprovação pendentes.

### Histórico — revisão da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + revisar_plano + 010_plan/rodada-1 + v1`
- `effect_class`: `local_mutation`
- `state_before`: plano local `Rascunho` v1, revisão `Pendente`, ciclo `010` em `Planejamento`, `Aguardando revisão (rodada 1)`.
- `state_after`: plano local `Em Revisão` v1, rodada 1 concluída com `REQUER NOVA RODADA`, aprovação `Pendente`, ciclo `010` em `Planejamento`, `Aguardando correções (rodada 1)`.
- `result`: `executed`
- `evidence`: parecer da [Rodada 1](#rodada-1), cabeçalho e bloco `## Próximo passo` atualizados; base local `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`.
- `blockers`: R1-1 a R1-4 para obter veredito apto.

### Histórico — rascunho v1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + rascunhar_plano + 010_plan + v1`
- `effect_class`: `local_mutation`
- `state_before`: ideação local registrada, ciclo em `Ideação` e plano ausente.
- `state_after`: plano local `Rascunho` v1, ciclo em `Planejamento`, aguardando revisão (rodada 1).
- `result`: `executed`
- `evidence`: este plano, linha do ciclo em `_project/cycles.md`, autorização registrada no cabeçalho e revisão de origem `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`. Blob local da ideação `1beb178be25228c25720b4662dcc5e08d64615e2`.
- `blockers`: nenhum para a revisão; aprovação e autorizações de execução pendentes.

## Revisão crítica

### Rodada 1

- **Data:** 2026-11-18
- **Autor:** ferramenta e modelo não declarados no rascunho `v1`
- **Revisor:** Antigravity (Gemini 4 Argon Low)
- **Base:** plano local `v1` (`Rascunho` promovido a `Em Revisão`), sem commit próprio, sobre `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`. Inspeção somente leitura de `_project/ideations/010_painel_direito_completo.md`, `local/esboco/proposta-todas-abas-e-agente.html`, `DESIGN.md`, KB-003 a KB-007, ADR-007 a ADR-011, `index.html`, `src/app.ts`, `src/apresentacao-resultado.ts`, `src/apresentacao-lentes.ts`, `src/apresentacao-combinacao.ts`, `src/apresentacao-areas.ts`, `src/apresentacao-comparacao.ts`, `src/apresentacao-agentes.ts`, `src/municipios.ts`, `src/mapa.ts` e `src/agentes.ts`.

#### Achados bloqueadores

- **R1-1 — O critério de aceite visual comum depende de arquivo privado ignorado pelo Git e contradiz as próprias decisões de G1.** A seção "Critério de aceite visual comum às quatro entregas" exige conferir a interface lado a lado contra `proposta-todas-abas-e-agente.html` em `local/esboco/`, que é ignorado pelo Git (`.gitignore` e `.agent/ai_behavior.md`). Um plano aprovado é autoridade versionada no GitHub e deve ser verificável sem depender de arquivo local privado. Além disso, o esboço privado exibe `1º · Lugar 1 — 7 meses com focos` ("Veja primeiro os lugares com focos em mais meses") e `1º · Lugar 1 — 5 dias seguidos` ("A lista começa pelos lugares com a maior sequência"), além de uma faixa agregada de cobertura na vista de lista (`Em 3 dos 365 dias, houve falta de dados ou incerteza`), enquanto "Decisões e autoridades" e o Item 1 determinam preservar a ordem vigente (geográfica em recorrência; por início e geográfica em persistência), não usar ordinais nas listas de células e não exibir soma ou agregado de cobertura na lista como se representasse o recorte inteiro. Corrigir: (a) tornar os critérios de composição, hierarquia, blocos ("pergunta → resposta → explicação → ações com descrição → detalhes técnicos recolhíveis") e estados autossuficientes no plano e em `DESIGN.md`, sem exigir o arquivo de `local/` como oráculo de aceite das PRs; (b) listar explicitamente como desvios intencionais em relação ao esboço a preservação da ordem não ranqueada (KB-005), a ausência de cobertura agregada na lista da lente e a adaptação das ações aos contratos reais.
- **R1-2 — A separação entre inspecionar município na lista estadual e aplicar o filtro municipal ("Consultar município") tem lacunas de contrato e de capacidade (G1).** O plano propõe que clicar em um município na aba Municípios abra um detalhe com fatos estaduais sem alterar o filtro global, deixando a troca de recorte para "Consultar município". Porém:
  1. **Métricas disponíveis antes e depois:** no recorte estadual, `por_municipio` do resumo traz apenas `total` de detecções e a lista calcula a participação em destaques da lente ativa (`listaMunicipios` em `src/municipios.ts`), mas **não** calcula dias com detecção nem células T1 distintas por município (que `numerosMunicipio` só calcula quando o município é o recorte aplicado, ou a partir dos registros filtrados). O critério do Item 2 pede separar "volume de detecções, dias, células e participação em destaques conforme o escopo e a disponibilidade de cada métrica", sem definir se dias e células são calculados sobre `this.pontos` (quando a leitura estadual completa terminou) ou se só aparecem após "Consultar município", e qual é o comportamento quando o usuário já selecionou um município no seletor `#f-municipio` da esquerda.
  2. **"Mostrar no mapa" sem alterar filtros:** `src/mapa.ts` não possui método para enquadrar ou destacar um município avulso mantendo `selecionado = null`, e `this.limites` pode ainda não estar carregado (se a camada "Limites municipais" estiver desligada ou em carregamento). Definir como `lerLimites` / `mapa.ts` enquadra o município inspecionado sem mudar o recorte aplicado.
  3. **Invalidação do estado do agente:** `chaveContexto` (`src/agentes.ts`) inclui `municipio` do recorte aplicado e `destaque` da lente, mas não o município apenas inspecionado na aba Municípios. Definir se abrir/fechar o detalhe estadual de um município invalida perguntas/respostas do agente ou altera o contexto exibido em `#pergunta-contexto`.
- **R1-3 — A contagem de meses por célula no detalhe da Recorrência não está disponível no `Destaque` atual e exige especificação para janelas de até 12 meses (G1).** O Item 1 exige que a Recorrência mostre "meses GMT com contagens de evidência e identifique meses parciais" (no esboço, a grade de 12 meses com o número de focos em cada mês). Hoje, em `src/lentes/recorrencia.ts` e `src/apresentacao-lentes.ts`, `d.evidencia.datas` guarda apenas os códigos `AAAA-MM` com detecção e `d.evidencia.deteccoes` guarda os `id_tecnico`, sem contagem por mês; além disso, a janela da carga vai de novembro de 2025 a outubro de 2026 (cruzando dois anos civis, não `jan` a `dez` de um único ano). Especificar: (a) que os meses exibidos são exatamente os `r.janela.meses` tocados pela janela (em ordem cronológica, com indicação de mês parcial vinda de `janela.meses`), e que a contagem de cada mês é derivada na apresentação a partir dos registros da evidência da célula (`ctx.registros`) pelo prefixo GMT `AAAA-MM`, somando `d.evidencia.deteccoes.length`; (b) que `src/lentes/recorrencia.ts` e `versao_metodo` não mudam.
- **R1-4 — Unificar o resumo e a frase de resposta em Persistência, Combinação e Sobreposição contradiz a semântica de unidade sem regra explícita por variante (G1).** O objetivo e o Item 1 preveem pergunta orientadora e frase de resposta com os números principais em todas as variantes, e "Decisões e autoridades" diz que "Em persistência, o total da aba conta destaques/sequências conforme o resultado existente; duas sequências na mesma célula não se tornam dois lugares". Contudo, hoje `renderResumoLente` (`src/apresentacao-resultado.ts`, linha 90) rotula a quantidade da Persistência como `N células` (`unidade: 'celula'`), embora `r.destaques.length` seja o número de **sequências** (caso P-2 da KB-005: duas sequências na mesma célula). E o esboço diz "Em Colniza, 4 lugares tiveram focos em pelo menos 3 dias seguidos". Se a Persistência passar a dizer "N lugares" para `r.destaques.length`, violará a decisão do próprio plano; se disser "N sequências em M células (lugares)", mudará o texto de `#resumo-lente-numero` verificado nos testes E2E atuais (`05-lentes.spec.mjs`). Definir, para cada uma das 5 opções da aba Lentes (Concentração, Recorrência, Persistência, Combinação e Sobreposição), qual é a unidade exata do número principal e da frase de resposta (municípios, células/lugares ou sequências em células), garantindo que duas sequências na mesma célula nunca sejam contadas como dois lugares distintos.

#### Ressalvas

- **R1-5 — Mapear o destino real de cada botão de ação novo nos 4 itens.** O esboço introduz botões que não têm equivalente direto nos manipuladores atuais:
  - Item 1: "Mostrar no mapa" dentro do detalhe do destaque (quando o destaque já foi selecionado ao abrir o detalhe; definir se re-enquadra no mapa e, em tela estreita/notebook, rola até `#mapa`), "Ver os N focos" (definir se abre e rola até `<details id="lente-evidencia-detalhes">` na célula ou até `#lista-focos` / consulta municipal na Concentração) e "Alterar o período" nos estados sem destaque / janela insuficiente (definir que abre `#secao-consulta` e foca `#f-periodo` ou `#f-inicio`).
  - Item 3: "Ver a disponibilidade" quando a comparação aguarda disponibilidade ou está pendente (definir se rola até `#comparacao-disponibilidade` e aciona `#botao-lista-completa` quando aplicável).
  - Item 4: "Ver o lugar na tela" / "Ver detalhes do resultado" e "Ver as informações usadas" na resposta e na falha do agente (hoje `abrirDetalhamento` fica dentro de cada item de `#perguntas-evidencias`, e na falha sem evidências conferidas não há botão de retorno; definir o alvo para cada `Recorte` do pedido: destaque aberto, aba Lentes, aba Comparação ou aba Municípios).
- **R1-6 — Preservar os contratos dos testes E2E e de acessibilidade existentes.** As suítes `03-acessibilidade`, `05-lentes`, `06-combinacao`, `07-areas`, `08-resultado`, `12-comparacao`, `13-perguntas` e `14-rotulos-espaco` verificam IDs, `data-estado-*`, `role="status"` e textos específicos (por exemplo, os títulos das 5 opções em `#t-destaques` do ciclo `009`, os textos das 3 perguntas prontas de D4 do ciclo `008` — que no esboço aparecem com redação ligeiramente diferente — e a nota de disponibilidade fora da comparação da emenda do ciclo `009` ao ADR-011). Declarar no plano se os textos normativos das perguntas prontas (D4 do ciclo `008`) e as emendas do ciclo `009` (`DESIGN.md`, ADR-009 e ADR-011) permanecem intactos ou se alguma emenda datada será acrescentada.
- **R1-7 — Ajustes documentais do plano.**
  1. As seções `## Próximo passo` e `## Handoff de saída` devem preceder `## Revisão crítica` e `## Pós-mortem`, conforme a ordem de `.agent/templates/plano_implementacao.md`.
  2. Na seção `## Handoff de saída`, manter o registro do rascunho em subseção de histórico e deixar no topo o handoff corrente da última mutação do arquivo, como nos planos `007` e `008`.
  3. Na seção `#### Destinos das ações do agente

- “Ver o lugar na tela” ou “Ver detalhes do resultado” abre o destaque vigente na aba Lentes quando o pedido usou esse destaque. Sem destaque, leva à Comparação se o pedido usou uma comparação, à lista de Lentes se usou uma lente, ou à aba Municípios no recorte aplicado nos demais casos. Revalidar a identidade antes de navegar. O mapa B mantém o caminho da comparação quando ele for a origem. A falha usa os mesmos destinos baseados no pedido, mesmo sem evidências.
- “Ver as informações usadas” abre e foca `#perguntas-evidencias` quando há evidências. Os atalhos de cada evidência continuam usando `abrirDetalhamento`. “Comparar municípios” abre os controles existentes e foca Município B nas condições já suportadas.
- Preservar os textos e a disponibilidade das três perguntas prontas de D4 do ciclo 008 e as emendas do ciclo 009 ao `DESIGN.md`, ADR-009 e ADR-011, inclusive disponibilidade fora da comparação nas evidências do agente. Registrar por emenda datada a nova navegação no ADR-009 e os atalhos de interface no ADR-011, preservando sessão, formato e contrato do servidor.

## Arquivos afetados`, incluir `docs/runbook.md` (seção 10, Guia da interface) e eventuais emendas datadas ao ADR-009 / ADR-011 se o contrato das abas ou dos atalhos do painel de perguntas mudar.

#### Itens atendidos

- **Alvo e governança:** ciclo `010` em `Planejamento` em `_project/cycles.md`, nível `completo`, modo contínuo `—`, ideação `_project/ideations/010_painel_direito_completo.md` presente e referenciada, `Autorização inicial` e `Autorização do rascunho` registradas no cabeçalho, `handoff_schema_version: 2`. O validador (`node scripts/validate-governance.mjs`) passa com 0 erros e 0 avisos.
- **Fatos conferidos no código (`cf7d9cd`):** todas as funções, arquivos e fluxos citados no baseline existem (`src/app.ts`, `src/apresentacao-resultado.ts`, `src/apresentacao-lentes.ts`, `src/apresentacao-combinacao.ts`, `src/apresentacao-areas.ts`, `src/apresentacao-comparacao.ts`, `src/apresentacao-agentes.ts`, `src/municipios.ts` e `src/mapa.ts`), e hoje clicar em um `.botao-municipio` na aba Municípios chama `escolherMunicipio(l.codigo)`, aplicando imediatamente o filtro global `#f-municipio`.
- **Barreiras G1 a G4:** G1 e G3 marcadas como `Sim` e G2 e G4 como `Não`, com justificativas coerentes com o escopo de interface e apresentação sobre leituras já existentes. Nenhum dado privado ou credencial foi copiado de `local/` para o plano.
- **Decomposição e sequência:** 4 itens em issues `[FEATURE]` sequenciais, antecedidas pela PR documental do plano e seguidas pela PR de encerramento prospectivo, com pontos de aprovação compatíveis com `_project/README.md`.

#### Veredito

`REQUER NOVA RODADA` — quatro achados bloqueadores (R1-1 a R1-4) de autossuficiência do aceite e especificação de G1/contratos de interface, corrigíveis pelo autor no plano sem necessidade de nova decisão analítica humana desde que mantidas as regras das KBs 004 a 007.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + revisar_plano + 010_plan/rodada-1 + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Rascunho` v1, revisão `Pendente`, aguardando revisão (rodada 1) / plano `Em Revisão` v1, rodada 1 registrada com `REQUER NOVA RODADA`, aguardando correções (rodada 1)
- `result`: `executed`
- `evidence`: esta seção `### Rodada 1`, campos `Status`, `Revisão formal` e `Veredito da revisão` no cabeçalho e bloco `## Próximo passo` atualizado; `node scripts/validate-governance.mjs` com 0 erros e 0 avisos
- `blockers`: R1-1 a R1-4 para obter veredito apto

### Resposta do autor à rodada 1 — v2

**Autor:** Codex, modelo exato não registrado. Ajuste local autorizado em 2026-11-18 pela instrução “corrija o plano do ciclo 010”.

| Achado | Resposta |
| :-- | :-- |
| R1-1 | Corrigido. O critério obrigatório descreve composição e estados e será consolidado em DESIGN.md. A comparação com o HTML privado é complementar. As adaptações analíticas e funcionais estão explícitas. |
| R1-2 | Corrigido. A inspeção estadual apresenta as métricas já sustentadas. O detalhe define a leitura de geometria sob demanda, o foco do mapa e o contexto do agente. |
| R1-3 | Corrigido. O detalhe usa `mesesDaJanela`, pois `r.janela` tem início e fim, e agrupa registros de evidência pelo mês GMT. |
| R1-4 | Corrigido. A tabela fixa as cinco unidades. Persistência separa sequências de células distintas. |
| R1-5 | Corrigido. Os quatro itens especificam destinos, efeitos, condições de uso e foco. |
| R1-6 | Corrigido. Os contratos de acessibilidade e seletores de teste foram explicitados. Estão previstas emendas datadas de navegação e o ajuste de teste do rótulo da persistência. |
| R1-7 | Corrigido. Ordem do template restaurada, registros anteriores preservados e documentação afetada enumerada. |

A v2 aguarda o parecer da rodada 2.

### Rodada 2

- **Data:** 2026-11-18
- **Autor:** Codex, modelo exato não registrado
- **Revisor:** Antigravity (Gemini 4 Argon Low)
- **Base:** plano local `v2` (`Em Revisão`), sem commit próprio, sobre `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`. Inspeção somente leitura das alterações da `v2`, da tabela de respostas à Rodada 1, de `src/lentes/recorrencia.ts` (`mesesDaJanela`), `src/municipios.ts`, `src/mapa.ts`, `src/agentes.ts`, `src/app.ts` e `_project/cycles.md`.

#### Conferência da rodada 1

- **R1-1 — atendido.** O critério de aceite visual comum foi tornado autossuficiente no plano e será consolidado em `DESIGN.md`, tratando o HTML privado em `local/` como referência complementar e listando explicitamente as adaptações intencionais (ordem vigente da KB-005 sem ordinais de prioridade nas listas de células, cobertura no detalhe sem agregado da lista e destinos/estados reais).
- **R1-2 — atendido.** A subseção "Inspeção estadual e recorte municipal" define que o detalhe estadual mostra apenas as métricas sustentadas pelo resumo/lista estadual (total de detecções e participação em destaques estaduais), deixando dias com detecção e células T1 distintas (`numerosMunicipio`) para o recorte municipal aplicado; especifica a leitura sob demanda da geometria via `lerLimites(cliente, carga, codigo)` para enquadramento de câmera sem alterar filtros; e explicita que a inspeção estadual não invalida `#pergunta-contexto` nem pedidos/respostas do agente.
- **R1-3 — atendido.** O Item 1 especifica o uso de `mesesDaJanela(r.janela)` (`src/lentes/recorrencia.ts`) para listar todos e apenas os meses GMT tocados em ordem cronológica (com mês/ano e indicação de parcial) e agrupar os IDs de `d.evidencia.deteccoes` em `ctx.registros` pelo prefixo `AAAA-MM`, preservando o cálculo e `versao_metodo`.
- **R1-4 — atendido.** A tabela "Unidades e evidências da aba Lentes" define a unidade de cada uma das 5 opções e separa sequências de células distintas na Persistência ("2 sequências em 1 célula"), prevendo o ajuste correspondente nas asserções de texto dos testes.
- **R1-5, R1-6 e R1-7 — atendidos.** Todos os botões de ação ("Mostrar no mapa", "Ver os focos", "Alterar o período", "Ver a disponibilidade", "Ver o lugar na tela" / "Ver detalhes do resultado" e "Ver as informações usadas") têm destino, comportamento de foco e condições definidos; a preservação dos contratos E2E/acessibilidade e das perguntas prontas (D4 do ciclo `008`) e emendas do ciclo `009` está explícita; e a ordem das seções finais, o histórico de handoff e a lista de arquivos afetados (`docs/runbook.md`, ADR-009 e ADR-011) foram corrigidos.

Nenhum achado corrigido reapareceu e os bloqueadores caíram de 4 para 0.

#### Achados bloqueadores

Nenhum.

#### Ressalvas

Nenhuma.

#### Itens atendidos

- Todos os itens atendidos na Rodada 1 permanecem válidos na `v2`.
- As especificações adicionadas nos Itens 1 a 4 respeitam integralmente as barreiras G1 a G4, as KBs 004 a 007 e o ADR-011, sem introduzir nova regra analítica nem depender de arquivos privados ignorados pelo Git.

#### Veredito

`APTO PARA APROVAÇÃO` — todos os achados bloqueadores e ressalvas da Rodada 1 foram integralmente atendidos. Este veredito não equivale à aprovação do plano, que cabe ao responsável.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + revisar_plano + 010_plan/rodada-2 + v2`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Em Revisão` v2, aguardando revisão (rodada 2) / plano `Em Revisão` v2, revisão formal `Concluída` com veredito `APTO PARA APROVAÇÃO`, aguardando aprovação do plano
- `result`: `executed`
- `evidence`: esta seção `### Rodada 2`, campos `Revisão formal` e `Veredito da revisão` no cabeçalho e bloco `## Próximo passo` atualizado; `node scripts/validate-governance.mjs` com 0 erros e 0 avisos
- `blockers`: nenhum

## Pós-mortem

- **Data de conclusão:** 2026-11-21 (prospectiva; efetiva após o merge do encerramento)
- **Desvios:** a conferência visual usou o esboço privado como referência direta a pedido do responsável; suas adaptações e os testes locais estão registrados nas tasks. Não houve verificação em produção neste ciclo.
- **Lições comprovadas:** nenhuma nova lição transversal registrada.
