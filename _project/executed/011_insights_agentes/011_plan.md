# Plano de Implementação — insights com agentes

> **Ciclo:** `011`
> **Status:** `Concluído`
> **Versão:** `v4`
> **Autor da correção:** Codex (modelo exato não informado ao agente)
> **Data de criação:** 2026-11-21
> **Última atualização:** 2026-11-21
> **Tipo:** `feature`
> **Prioridade:** `P2`
> **Nível:** `completo`
> **Autorização inicial:** "Confirmo o nível completo e autorizo a ideação do ciclo 011" em 2026-11-21
> **Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 011" em 2026-11-21
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO PARA APROVAÇÃO`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-21`
> **handoff_schema_version:** `2`

## Problema e contexto

Ideação: `_project/ideations/011_insights_agentes.md`.

## Objetivo

Entregar uma análise interpretativa útil, realizada por agente principal e dois subagentes: perguntas fechadas no painel direito acionam interpretações contextualizadas em tópicos, com evidência e limites. O resultado deve acrescentar uma leitura verificável à apresentada pelas lentes: relacionar evidências, explicar o significado limitado da relação e orientar a investigação quando houver fundamento. Repetir ou parafrasear uma evidência isolada não satisfaz o objetivo. Quando não houver base para interpretação útil, declarar isso, sem inventar achados ou conclusões ambientais.

## Origem no backlog

Não se aplica.

## Contexto e baseline

O ciclo 008 fornece principal e dois subagentes, ferramentas determinísticas sob JWT/RLS, evidências referenciadas e até seis chamadas respondidas por execução. A KB-003 registra que a conferência atual não garante o sentido das frases e que as respostas pouco acrescentam ao que já se vê. A interface do ciclo 010 inclui perguntas prontas e livres. A comparação existente tem contrato próprio na KB-007. As cotas e latências do nível gratuito não garantem disponibilidade; a prova anterior não comprova a capacidade desta proposta.

## Escopo

### Dentro do escopo

- Uma experiência intuitiva no painel direito: perguntas fechadas visíveis, seleção e resposta em tópicos imediatamente abaixo, com contexto, evidências e limitações; retirar o campo de texto livre.
- Cinco perguntas fechadas conforme catálogo e decisões registradas na rodada 1; perguntas sem evidência suficiente não podem produzir um achado inventado.
- Principal coordena e sintetiza; dois subagentes, de padrões e de contexto/qualidade, usam chamadas próprias. Mostrar etapas realmente ocorridas para apoiar a demonstração; não fabricar participação de agente.
- Reutilizar ferramentas e métodos existentes; qualquer cálculo novo deve ser determinístico, especificado e autorizado antes da implementação. A IA interpreta somente evidências recebidas; cada achado deve indicar o fundamento e, quando cabível, a limitação e uma sugestão de exame.
- Tratar ausência de achados, dados insuficientes, falhas, cancelamento e alteração do recorte; manter a identificação de conteúdo gerado por IA e acesso às evidências.
- Manter o nível gratuito como objetivo e medir chamadas, tokens informados e tempo em amostra pequena; não garantir disponibilidade ou custo de serviços terceiros.

### Fora do escopo

- Texto livre, investigação irrestrita, fontes novas, previsão, atribuição de causa, autoria, propriedade ou infração; ranking de gravidade ou prioridade.
- Redesenho das outras abas ou mudança geral dos métodos de lentes e comparação; contratação de serviço pago; baterias extensas de carga ou estresse sem risco específico que as justifique.

## Decisões e autoridades

As escolhas registradas pelo responsável na rodada 1 e as decisões de 2026-11-21 abaixo orientam esta versão. Detecções não provam incêndio ou ausência de fogo; sobreposição não prova dano, autoria ou infração.

### Alternativas apresentadas na v1

1. **“Chama atenção”:** alternativa A: expor somente achados definidos e calculados por métodos existentes; alternativa B: criar regra nova de concentração temporal. Exemplo fictício: 10 detecções em dois dias, 9 e 1; A só relata números existentes, B precisaria de limiar explícito para dizer “concentradas”. Nenhuma classificação por limiar está escolhida.
2. **Mudança:** alternativa A: usar a comparação existente A → B, com valores absolutos e ressalvas; alternativa B: adicionar variação percentual. Exemplo A=10 e B=15: diferença +5; taxa +50%, mas A=0 torna a taxa indefinida. Nenhuma taxa nova está escolhida; sem comparação configurada, a pergunta deve informar a necessidade de configurá-la.
3. **Mais de um padrão:** alternativa A: usar apenas a interseção por célula prevista no contrato existente de combinação; alternativa B: reunir critérios de unidades e recortes distintos por nova regra. Exemplo fictício: célula X em recorrência e persistência, célula Y apenas em recorrência: A relata X, sem inferir maior gravidade; B exigiria definição explícita de identidade e recorte. Nenhuma regra nova está escolhida.
4. **Próximo exame e limitações:** sugestões vinculadas a evidência e navegação existentes ou novas recomendações dependentes de regras analíticas? Exemplo: disponibilidade incompleta permite sugerir consultar sua evidência; afirmar que uma queda é causada pela lacuna não é sustentado. Definir a lista e condições antes de implementação.

As alternativas acima são histórico da v1, substituídas pelas decisões registradas na rodada 1 e pela especificação abaixo. Qualquer ponto ainda ambíguo exige decisão antes da implementação dependente.

### Catálogo e condições de execução

Cada pedido usa janela GMT e município opcional, ou comparação de períodos A e B já configurada conforme KB-007; o servidor valida carga, recorte e lente opcional e relê os dados autorizados. As cinco perguntas são visíveis mesmo quando não executáveis, com motivo compreensível. Comparação de municípios não integra o catálogo. Na presença de comparação de municípios na tela, orientar o usuário a sair desse modo; não inventar um recorte. Para as perguntas de período único, usar o recorte e janela efetivamente aplicados, nunca escolher um lado de comparação automaticamente; em comparação de períodos, pedir retorno ao período único, exceto nas perguntas 2 e 4. A seleção de lente individual, combinação ou sobreposição não muda a definição da janela; a pergunta 3 calcula os critérios aplicáveis independentemente da seleção na tela.

| ID e pergunta | Condição e evidência | Regra e resultado esperado fictício |
| :-- | :-- | :-- |
| `panorama` — O que chama atenção neste período? | Período único, estado ou município, com ou sem lente. Contagens do recorte, distribuição temporal GMT, lente ativa quando houver e disponibilidade. | Ferramenta conta dias distintos com detecção, totais por dia e por mês; fornece todos os dias/meses empatados no maior total, sem escolher nem criar limiar. Ex.: dias 01, 02 e 03 têm 2, 1 e 2 detecções: 3 dias, máximos dias 01 e 03, 5 detecções no mês. Sem registros: zero observado e ressalva de disponibilidade, nunca ausência de fogo; leitura incompleta: dados insuficientes. |
| `mudanca` — O que mudou em relação ao outro período? | Apenas comparação de períodos A/B válida, com ou sem lente, estado ou município. `comparar_periodos` e disponibilidade de ambos os lados. | Reusar KB-007; totais e diferença B−A, entradas/saídas/permanências somente quando a comparação as fornece, sem taxa. Ex.: A=10, B=15 implica +5; sem lente não inventar destaques. Sem comparação: orientar configuração; lacunas ou resultado inconclusivo recebem ressalva existente. |
| `padroes` — Quais locais apresentam mais de um padrão? | Período único, estado ou município, com ou sem lente ou combinação. Resultados completos dos critérios aplicáveis e disponibilidade. | Cruzar IDs T1 0,05°: células presentes em pelo menos 2 critérios distintos; sequência repetida da mesma lente conta uma vez. Concentração apenas estadual, recorrência com janela elegível, persistência e sobreposição quando a camada estiver disponível; sem alterar `combinacao.ts`. Ex.: X em recorrência e persistência, Y somente recorrência: X aparece; sem células comuns e com pelo menos dois critérios disponíveis: nenhum achado; menos de dois critérios: dados insuficientes. Não classificar gravidade ou priorizar. |
| `cuidados` — Onde devo interpretar os resultados com mais cuidado? | Período único ou comparação de períodos, estado ou município; com ou sem lente. Disponibilidade e ressalvas que as evidências efetivamente produzirem. | Reunir exclusivamente lacuna conhecida, incidência indeterminada, mês parcial, sequência na borda/adjacente a lacuna, polígono estimado/borda, célula de divisa e comparação inconclusiva, quando aplicáveis e comprovados. Ex.: um dia com incidência indeterminada gera ressalva sobre esse dia; nenhuma ressalva extra constatada não comprova cobertura perfeita. Falha de leitura: dados insuficientes. |
| `proximos` — O que vale examinar em seguida? | Período único, estado ou município, com ou sem lente; exige achados/limites referenciados dos dois subagentes. | Apresentar somente sugestões textuais ligadas a resultados e destinos existentes; não ordenar por prioridade. Ex.: lacuna documentada → examinar disponibilidade; X em dois critérios → examinar detalhes de X. Sem evidência adequada: nenhuma sugestão ou dados insuficientes, conforme origem. |

**Decisões do responsável — 2026-11-21:** aprovadas as recomendações apresentadas: (a) usar a projeção municipal→célula da KB-005 e suas ressalvas de divisa; (b) reunir as três classes disponíveis como um único critério de sobreposição, inclusive sem lente ativa; (c) se a leitura de qualquer critério aplicável falhar ou estiver incompleta, retornar dados insuficientes para o cruzamento, sem achados parciais; e (d) limitar sugestões a consultar disponibilidade quando houver ressalva, examinar detalhes de célula com dois critérios e consultar comparação já configurada. Exemplo: X em recorrência e em duas classes de sobreposição conta dois critérios, não três. As condições de tela continuam valendo; não supor comparação configurada. A interpretação deve explicitar limitações e não confundir critérios com gravidade.

A sugestão de consultar comparação já configurada só se aplica a `mudanca` e `cuidados` com comparação de períodos ativa; nunca a `proximos`, que exige período único. As outras sugestões também dependem de evidência e destino válidos no recorte vigente.

**Alcance da disponibilidade sem lente no estado:** em `panorama`, `cuidados` e `proximos`, consultar os municípios distintos associados às detecções do recorte que fundamentam os resultados apresentados, conforme identificação já carregada, e declarar explicitamente a lista e o alcance como subconjunto; jamais afirmar cobertura estadual completa. Recorte municipal consulta apenas o município selecionado. Em recorte estadual sem detecções, a lista fica vazia e a disponibilidade é não avaliada, não completa: informar insuficiência para concluir sobre a ausência. Se leitura, identificação ou lista necessária estiver incompleta, declarar dados insuficientes; não truncar nem inferir cobertura de municípios omitidos. Respeitar 120 s e 64 KiB; ao excedê-los retornar limite ou resultado incompleto, sem síntese enganosa. Casos fictícios: detecções apenas em Alfa e Beta → disponibilidade restrita a Alfa e Beta; nenhuma detecção → disponibilidade estadual não avaliada. O alcance das demais modalidades segue os contratos existentes.

### Contrato de valor interpretativo

Cada resposta que apresente achado deve conter **observação contextualizada**, **interpretação limitada** que relacione pelo menos duas evidências pertinentes ou uma evidência e sua limitação, e **fundamento rastreável**, com sugestão apenas quando cabível dentro das ações aprovadas. A IA produz a leitura da relação, não apenas lista campos ou descreve como a lente funciona. A relação e seu alcance devem ser sustentados pelas evidências; a IA não cria números, causalidade ou prioridade. Os subagentes contribuem conforme a pergunta e o principal combina as análises efetivamente disponíveis. A síntese não pode substituir análise ausente.

Exemplo fictício: os dados mostram X em recorrência e persistência, e há dia de disponibilidade indeterminada. Resposta insuficiente: “a lente de recorrência destacou X”. Resposta que agrega: “X reúne detecções em meses distintos e uma sequência de dias; a disponibilidade indeterminada em parte da janela limita a leitura temporal. Vale consultar os detalhes e a disponibilidade”. A interpretação não afirma incêndio contínuo ou causa. Se não houver segunda evidência pertinente, ou faltar análise obrigatória, informar ausência de base para interpretação cruzada, com limitações disponíveis; não preencher espaço com paráfrases.

**Verificação de utilidade:** para cada pergunta, manter ao menos um caso fictício com evidências e saída existente das lentes lado a lado, interpretação esperada e contraponto inadequado que apenas repete uma lente. Avaliação humana registrada verifica relação sustentada e útil; contexto e ressalvas corretos; acréscimo identificável sobre a tela existente; referências corretas; ausência de causalidade ou gravidade. Um caso negativo com números corretos e relação invertida deve reprovar. Esse confronto verifica amostras, não garante semanticamente todas as respostas futuras; conferência automática não substitui avaliação humana. Se a amostra real autorizada não demonstrar ganho interpretativo, o item não atende ao aceite.

### Contrato proposto de agentes e API

- `POST /api/explicar` recebe somente `{ pergunta_id, carga, recorte }`, IDs da tabela, objetos fechados e nenhum texto livre. Para período único, estender `selecao` para lente explícita `null` ou configuração válida; `periodos` conserva contrato de KB-007. Rejeitar campos extras, ID, recorte ou combinação incompatíveis com HTTP 400 `entrada_invalida`, antes do provedor; carga e recorte vêm do cliente apenas como parâmetros validados, não como evidência. `municipios` deixa de ser aceito pelo novo contrato. A troca de servidor, contrato de resposta, cliente e painel ocorre atomicamente na mesma issue e PR; não há janela intermediária nem via antiga de texto livre após a integração.
- Principal recebe ID e contexto, escolhe `delegar` dentro da matriz permitida por pergunta e sintetiza; pergunta fechada inválida é recusada pelo servidor, sem pedir recusa ao modelo. `panorama`, `padroes` e `proximos` exigem padrões e contexto/qualidade; `mudanca` exige ambos; `cuidados` exige contexto/qualidade. Falta de delegação ou falha de subagente necessário gera resultado incompleto, nunca participação fabricada. Cada subagente dispõe apenas de ferramentas predefinidas para o pedido: padrões acessa resultados do período, distribuição, comparação e cruzamento quando correspondentes; contexto/qualidade acessa disponibilidade e ressalvas desses mesmos recortes. A seleção de ferramentas e argumentos é validada no servidor; não há SQL ou comandos do modelo.
- Tópico estruturado proposto: `{ texto, referencias, limitacao, sugestao }`, com referências obrigatórias para afirmação, limitação e sugestão quando presentes, usando caminhos válidos da evidência; campos opcionais ausentes não implicam dados completos. Recusar referências inexistentes, valores/datas/classificações divergentes, HTML e alegações proibidas conforme ADR-011. A verificação determinística não prova semântica nem causalidade; avaliar sentido, ligação entre unidade/período e ressalva em casos de referência por revisão humana. Não alegar que a checagem lexical garante verdade.
- Manter teto de 6 chamadas respondidas, repetição 503 vigente, 64 KiB por corpo, 120 s de leitura, 120 s de geração, 270 s totais e cancelamento; resumir dados deterministicamente com totais sobre conjunto completo, evidenciar paginação e nunca truncar silenciosamente. Se não couber ou não concluir, sinalizar limite/resultado incompleto, sem síntese inventada. O custo das leituras estaduais existentes não é presumido: registrar tempo observado na amostra sem repetição de carga extensa.
- Preservar desligamento padrão, matriz JWT/RLS, revalidação de carga e acesso antes de cada envio e resposta, `store=false`, dados mínimos e logs sem conteúdo; atualizar ADR-011 com emenda datada.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar — “autorizo a implementação da issue #N” | Plano aprovado e integrado, issue criada e decisões aplicáveis registradas | Uma issue no escopo aprovado | Outra issue, merge, ação externa ou produção | Issue, dependências e decisões |
| Aprovar plano — “aprovo o plano do ciclo 011” | Veredito apto e decisões G1 registradas | PR documental e, após integração e confirmação do payload, criação de issues | Merge ou implementação | Veredito, ressalvas, escopo e decisões |
| Aprovar merge — “aprovo o merge da PR #N” | PR correspondente e checks verdes | Apenas merge dessa PR | Demais merges | Diff e checks |
| Ação humana externa — “concluí a ação externa da issue #N” | Roteiro apresentado; quando a prova exigir preparação pelo responsável | Registrar ação efetivamente concluída e verificar estado acessível | Autorizar verificação de produção | Roteiro, evidência sem credenciais |
| Verificar produção — “autorizo a verificação em produção do ciclo 011” | Entregas integradas e roteiro apresentado | Verificação delimitada | Mudanças de configuração ou outras ações | Roteiro, conta e riscos |

A cadeia para em autorização ausente, ambiguidade, falha de acesso, decisão G1 pendente, alteração de escopo ou precondição não demonstrada; modo contínuo não se aplica. Cada merge exige aprovação específica.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Definições e exemplos decididos pelo responsável; casos de referência com resultados esperados e revisão de sentido, recorte, disponibilidade e limites. Sem inferir causa ou gravidade. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | A função autenticada será modificada; preservar JWT/RLS, revalidação e matriz de acesso da ADR-011, com testes de regressão e falha fechada. |
| G3 — privacidade de dados | Sim | Fixtures fictícias, sem credenciais ou dados pessoais; revisar evidências enviadas ao provedor, logs e conteúdo documentado conforme ADR-011. |
| G4 — migrações só acrescentam | Não | Nenhuma alteração de banco ou migração prevista; se necessária, parar e reavaliar escopo. |

## Estratégia de testes

- Casos fictícios pequenos por pergunta habilitada, incluindo evidência compatível, insuficiente, ausência de achado, lacuna de disponibilidade e semântica incorreta com números corretos; comparação A → B e ausência de comparação quando aplicável. Resultados esperados definidos a partir das decisões G1, não pelo próprio modelo.
- Testes de orquestração com provedor simulado: papéis e eventos reais, delegação, referências, limite de chamadas, falha parcial, cancelamento, troca de recorte, cota e falha do provedor; regressões de acesso/revalidação e não exposição de segredos.
- Testes de interface para escolha fechada, resposta logo abaixo, evidências, estados vazios/erro e acessibilidade; verificar layout responsivo, temas e contrato visual. Typechecks, build, testes relevantes de agentes, interface e API e gates de governança. Os comandos de API usam `supabase db reset`: só executar em ambiente local de teste confirmado e sem dados a preservar.
- Uma amostra pequena com Gemini real, quando autorizada a ação externa necessária, medindo chamadas respondidas e tentativas, tokens se informados, duração e qualidade semântica frente à evidência, com ao menos uma execução dos dois subagentes e um caso de dados insuficientes. Comparar com o baseline disponível, sem repetir baterias extensas; cota ou falha impede concluir viabilidade e deve ser registrada. Definir custo/uso autorizado antes de chamadas reais.
- A amostra é no Item 1, antes de sua PR: duas execuções com fixture fictícia, uma `panorama` com os dois subagentes e uma com dados insuficientes, usando `gemini-3.1-flash-lite` e `npm run prova:agentes` adaptado ao catálogo. Teto proposto: 12 chamadas respondidas e, com uma repetição 503 por chamada, até 24 tentativas no total; sem repetição de caso além disso. O uso gratuito e a cota disponível devem ser confirmados antes de executar; se insuficientes ou provedor falhar, registrar resultado inconclusivo e parar o aceite, sem troca de modelo ou pagamento implícitos. Credencial somente no `.env` ignorado. A autorização de implementação não cobre ação humana externa nem uso pago.
- Gates: `npm run typecheck`, `npm run typecheck:servidor`, `npm run build`, `npm run test:agentes`, `npm run test:interface`, `npm run test:api`, `node scripts/agentes/conferir-pacote.mjs`, `npm run test:governance`, `npm run check:governance` e `git diff --check`; `npm run test:e2e` com casos relevantes de `13-perguntas.spec.mjs` e `03-acessibilidade.spec.mjs`. `test:api`, `test:e2e` e `prova:agentes` executam `supabase db reset`, somente com ambiente local descartável confirmado. Não executar bateria de medição geral de carga.
- Verificação hospedada, se decidida e autorizada separadamente, segue roteiro específico; ausência dela não vira resultado de produção. Não há meta numérica de desempenho ou garantia de cota sem evidência.

## Itens de implementação

### Item 1 — Evidências e agentes de insights

**Contexto:** A saída atual reexpressa as lentes e a conferência lexical não assegura interpretação correta.

**Ação técnica:** Implementar o catálogo, as decisões G1, os contratos de evidência e valor interpretativo e os cálculos fixados em `Decisões e autoridades`, com delegação e validação; reaproveitar a função e os controles existentes. Este item e o Item 2 são partes da mesma issue e PR.

**Critérios de aceite:**

- [ ] Cada pergunta habilitada tem condições, evidências e limites documentados; incompatibilidade retorna orientação ou dados insuficientes.
- [ ] Principal e dois subagentes têm chamadas e papéis verificáveis; somente análises necessárias são apresentadas como executadas.
- [ ] Achados apresentam interpretação contextualizada que acrescenta leitura verificável à tela das lentes, conforme contrato de valor interpretativo; mera repetição não passa. Casos positivos e negativos por pergunta e avaliação humana da amostra real registram a comparação lado a lado e seus fundamentos.
- [ ] Achados se apoiam em evidência identificável e não atribuem causa, gravidade ou certeza indevida; testes de sentido e cálculo incluem casos negativos.
- [ ] Segurança, revalidação, teto de chamadas, falhas e cancelamento preservados; consumo medido na amostra autorizada.

### Item 2 — Painel de perguntas e respostas

**Contexto:** O responsável quer perguntas visíveis e resposta contextualizada logo abaixo.

**Ação técnica:** Substituir as três perguntas antigas e a entrada aberta pelas cinco opções; remover a ação “Comparar municípios” do painel. Abaixo do grupo de perguntas, mostrar resposta da opção selecionada em tópicos e contexto aplicado; preservar cancelamento, bloqueio de concorrência, estados `data-estado-perguntas`, etapas reais e evidências recolhíveis, além dos retornos do ciclo 010. Sugestões são texto orientador, não botões ou comandos livres. Atualizar `DESIGN.md` e `docs/runbook.md` seção 10.

**Critérios de aceite:**

- [ ] Perguntas aparecem sem digitação livre e a resposta da escolhida aparece abaixo, com contexto e evidências acessíveis.
- [ ] Comparação ausente, vazio, falha, cancelamento e mudança de seleção não apresentam resultado obsoleto ou inventado.
- [ ] Layout e acessibilidade conferidos em desktop e celular, claro e escuro; rota de retorno ao resultado permanece utilizável.

## Arquivos afetados

`servidor/agentes.ts`, `servidor/ferramentas.ts`, `servidor/pedido.ts`, `servidor/explicar.ts`, `api/explicar.ts`, `src/agentes.ts`, `src/app.ts`, `src/apresentacao-agentes.ts`, `index.html`, estilos, `scripts/agentes/`, `scripts/api/`, `tests/e2e/13-perguntas.spec.mjs` e `03-acessibilidade.spec.mjs`; `DESIGN.md`, `docs/runbook.md`, ADR-011 e KB-003. Lista sujeita à inspeção no planejamento detalhado; não pressupõe migração.

## Decomposição em issues e PRs

| Proposta | Dependência e documentação | PR |
| :-- | :-- | :-- |
| `[FEATURE] Insights interpretativos e painel de perguntas fechadas` | Itens 1 e 2 juntos; prova local, emenda datada ADR-011, DESIGN.md e runbook seção 10 | Uma PR atômica, após autorização da issue |
| Encerramento | Issue integrada; consolidar KB-003 e documentação viva | PR própria |

O plano e a ideação seguem em PR documental após aprovação. A PR única integra os dois itens em conjunto, com testes do cliente e da rota nova; antes do merge, main continua com o contrato anterior. Rollback reverte a PR inteira ou desabilita a função, sem reinstalar somente metade da interface/API. Verificação hospedada opcional, caso autorizada, gera relatório `011_validation_*.md` na PR de encerramento. Números de issues e PRs ainda não existem.

## Dependências e blockers

- A troca atômica de servidor e painel em uma única PR elimina o corte entre entregas; as decisões G1 solicitadas estão registradas na seção de catálogo.
- Disponibilidade do Gemini, cota real e política de uso devem ser conferidas no momento da prova; não assumir suficiência do gratuito.
- Prova real e qualquer verificação de produção dependem das autorizações e condições aplicáveis; ausência de acesso não pode ser tratada como sucesso.

## Riscos, suposições e rollback

Resposta plausível pode estar errada apesar de valores corretos; validar sentido com casos de referência e apresentar incerteza. Chamadas e dados adicionais podem elevar tokens e latência; usar evidências mínimas e medir. Falhas do provedor devem preservar funções sem IA. Rollback por reversão integral da PR atômica ou desabilitação da função existente, sem modificar dados.

## Sequência recomendada

1. Submeter a v4 à revisão formal, incluindo o contrato de valor interpretativo, alcance da disponibilidade e troca atômica; corrigir achados antes de aprovação.
2. Após veredito apto, aprovação do plano, PR documental e merge autorizado, apresentar payload e obter confirmação para issues.
3. Autorizar a issue única e implementar os dois itens na mesma PR, executar verificações proporcionais e obter aprovação de seu merge.
4. A prova real local pertence ao Item 1 antes da PR única; após integração, decidir verificação hospedada e registrar limites. Encerrar prospectivamente em PR própria.

## Referências

- [Ideação 011](../../ideations/011_insights_agentes.md); [KB-003](../../knowledge/KB-003_visao_produto_requisitos.md); [KB-005](../../knowledge/KB-005_contrato_lentes_selecao.md); [KB-007](../../knowledge/KB-007_comparacao_territorial.md).
- [ADR-011](../../decisions/ADR-011_funcao_explicacao_servidor.md); [validação 008](../../executed/008_comparacao_periodos_agentes/008_validation_agentes.md); `DESIGN.md`.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | [#107](https://github.com/EuThiagoAndrade/rastro-quente/issues/107) |
| PR(s) | [#106](https://github.com/EuThiagoAndrade/rastro-quente/pull/106) documental; [#108](https://github.com/EuThiagoAndrade/rastro-quente/pull/108) entrega atômica integrada |
| Branch(es) | `chore/cycle-011-plan`, `feature/issue-107` e `chore/cycle-011-closure` |
| Destino após conclusão | `_project/executed/011_insights_agentes/011_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 011 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + criar_issues + feature/insights_agentes + v4`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: plano v4 aprovado e PR documental #106 integrada / issue #107 aberta, aguardando autorização de implementação.
- `result`: `executed`
- `evidence`: [PR #106 integrada](https://github.com/EuThiagoAndrade/rastro-quente/pull/106) e [issue #107](https://github.com/EuThiagoAndrade/rastro-quente/issues/107) aberta.
- `blockers`: autorização explícita de implementação da issue #107.

### Histórico — PR documental

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + publicacao_documental + 011_plan + v4`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: plano aprovado / PR documental #106 aberta.
- `result`: `executed`
- `evidence`: PR #106 integrada no commit `8b5f68465a2c18fdb6afe912f08bbb66abe4e347` após aprovação humana e checks verdes.
- `blockers`: nenhum.

### Histórico — aprovação do plano

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + aprovar_plano + 011_plan + v4`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v4 apta aguardando aprovação / v4 aprovada, pronta para publicação documental.
- `result`: `executed`
- `evidence`: seção Rodada 3 e manifestação humana "aprovo o plano do ciclo 011" em 2026-11-21.
- `blockers`: nenhum para publicação documental.

### Histórico — revisão da rodada 3

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-3 + v4`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v4 aguardando revisão / revisão concluída, veredito `APTO PARA APROVAÇÃO`, aguardando aprovação humana.
- `result`: `executed`
- `evidence`: Rodada 3; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: nenhum para a aprovação humana do plano.

### Histórico — correção v4

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + rascunhar_plano + 011_plan + v4`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v3 aguardando correções da rodada 2 / v4 em revisão, aguardando revisão da rodada 3.
- `result`: `executed`
- `evidence`: plano v4, resposta à rodada 2 e bloco `## Próximo passo`; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: revisão formal e aprovação pendentes; não há autorização de implementação.

### Histórico — revisão da rodada 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-2 + v3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v3 aguardando revisão / v3 aguardando correções após veredito `REQUER NOVA RODADA`.
- `result`: `executed`
- `evidence`: seção Rodada 2; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: R2-1 e ressalvas R2-2 e R2-3, respondidos na v4.

### Histórico — correção v3

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + rascunhar_plano + 011_plan + v3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v2 parada por decisões G1 / v3 com decisões registradas e contrato de valor interpretativo, aguardando revisão da rodada 2.
- `result`: `executed`
- `evidence`: v3, decisões do responsável, contrato de valor interpretativo e resposta à rodada 1 neste plano; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: revisão formal, compatibilidade de entregas e aprovação do plano pendentes.

### Histórico — correção v2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + rascunhar_plano + 011_plan + v2`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v1 com decisões registradas / v2 parcialmente corrigida e parada por decisões remanescentes.
- `result`: `executed`
- `evidence`: respostas à rodada 1 neste plano; base `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: decisões G1 então pendentes, posteriormente respondidas e registradas na v3.

### Histórico — decisões da rodada 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-1-decisoes + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: v1 parado para decisões / v1 com decisões registradas e aguardando correções.
- `result`: `executed`
- `evidence`: decisões registradas na Rodada 1; base `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: incorporação na v2.

### Histórico — revisão da rodada 1 (parada para decisões)

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-1 + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano local `Rascunho` v1, revisão `Pendente`, aguardando revisão (rodada 1) / plano local `Em Revisão` v1, revisão formal `Em andamento`, veredito `REQUER NOVA RODADA`, situação `Parado` aguardando decisões do responsável para a v2.
- `result`: `executed`
- `evidence`: seção [Rodada 1](#rodada-1), cabeçalho (`Status`, `Revisão formal`, `Veredito da revisão`) e bloco `## Próximo passo` atualizados; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- `blockers`: R1-1 a R1-4; a correção de R1-1 (e parte de R1-4) depende de decisões explícitas do responsável sobre regras analíticas (G1) e escopo do painel.

### Histórico — rascunho v1

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 011 + rascunhar_plano + 011_plan + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: ideação registrada / rascunho v1 aguardando revisão.
- `result`: `executed`
- `evidence`: este plano e registro local de ciclos.
- `blockers`: decisões G1 e especificações de perguntas pendentes para plano implementável; revisão formal e aprovação pendentes.

## Revisão crítica

### Rodada 3

- **Data:** 2026-11-21
- **Autor:** Codex (modelo exato não informado ao agente)
- **Revisor:** Antigravity (Gemini 4 Neon High)
- **Base:** plano local `v4` (`Em Revisão`), sem commit próprio, sobre `fc5f6334e871606abe5560b6487ec2bfee36222f`. Inspeção somente leitura das alterações da `v4`, da resposta do autor à Rodada 2 e de `_project/cycles.md`.

#### Conferência da rodada 2

- **R2-1 — atendido.** A `v4` fecha a estratégia de transição unificando os Itens 1 e 2 na mesma issue `[FEATURE] Insights interpretativos e painel de perguntas fechadas` e numa única PR atômica (servidor, contrato de resposta, cliente, painel, `DESIGN.md`, `docs/runbook.md` seção 10, emenda datada ao `ADR-011` e testes `13-perguntas.spec.mjs` / `03-acessibilidade.spec.mjs`), mantendo `main` intacta até o merge, eliminando a via antiga de texto livre na integração e definindo rollback atômico.
- **R2-2 — atendido.** As frases residuais da `v1`/`v2` em `padroes` e na ação técnica do Item 1 foram removidas/atualizadas, e a sugestão *"consultar comparação já configurada"* ficou explicitamente restrita a `mudanca` e `cuidados` com comparação de períodos ativa (nunca em `proximos`, que exige período único).
- **R2-3 — atendido.** O alcance de `consultar_disponibilidade` sem lente no estado foi especificado de forma determinística e fechada: consulta os municípios distintos associados às detecções do recorte que fundamentam os resultados apresentados, declara explicitamente a lista e o alcance como subconjunto (sem afirmar cobertura estadual completa), trata zero estadual como disponibilidade não avaliada com aviso de insuficiência (sem inferir ausência de fogo) e respeita os limites de 120 s e 64 KiB com falha fechada. O recorte oferece evidência suficiente para o contrato de valor interpretativo quando há detecções (cruzando padrões/distribuição do recorte com a disponibilidade dos municípios envolvidos) e declara ausência de base quando não há.

Nenhum achado corrigido reapareceu e os bloqueadores caíram de 1 para 0.

#### Achados bloqueadores

Nenhum.

#### Ressalvas

Nenhuma.

#### Itens atendidos

- Todos os itens atendidos nas Rodadas 1 e 2 permanecem válidos na `v4`.
- As decisões G1 do responsável, o contrato de valor interpretativo, o catálogo fechado das cinco perguntas, a troca atômica sem via de texto livre residual, os cinco pontos de aprovação, as barreiras G1 a G4 e a estratégia de testes focada na funcionalidade estão coerentes com `.agent/ai_behavior.md`, `_project/README.md`, `KB-003`, `KB-005`, `KB-007`, `ADR-011` e `DESIGN.md`.
- Validador `node scripts/validate-governance.mjs` com 0 erros e 0 avisos antes da gravação desta rodada.

#### Veredito

`APTO PARA APROVAÇÃO` — todos os achados bloqueadores e ressalvas das Rodadas 1 e 2 foram integralmente atendidos. Este veredito não equivale à aprovação do plano, que cabe exclusivamente ao responsável.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-3 + v4`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Em Revisão` v4, aguardando revisão (rodada 3) / plano `Em Revisão` v4, revisão formal `Concluída`, veredito `APTO PARA APROVAÇÃO`, aguardando aprovação do plano
- `result`: `executed`
- `evidence`: esta seção `### Rodada 3`, campos `Revisão formal` e `Veredito da revisão` no cabeçalho e bloco `## Próximo passo` atualizado; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`
- `blockers`: nenhum

### Resposta do autor à rodada 2 — v4

- **Autor:** Codex (modelo exato não informado ao agente); base `fc5f6334e871606abe5560b6487ec2bfee36222f`.
- **R2-1 — corrigido:** itens 1 e 2 passam a integrar uma única issue e PR atômica; servidor, API e painel mudam juntos, sem expor via de texto livre após a integração. Rollback reverte a PR inteira ou desabilita a função.
- **R2-2 — corrigido:** removidas as duas frases residuais e delimitada a sugestão de comparação a `mudanca` e `cuidados` em comparação de períodos; `proximos` permanece de período único.
- **R2-3 — corrigido:** definido alcance determinístico para estado sem lente, lista explícita e tratamento de zero, falha, limite de tempo e corpo; não há extrapolação para todo o estado. A revisão deve conferir se o recorte oferece evidência suficiente para o contrato de valor interpretativo.

### Rodada 2

- **Data:** 2026-11-21
- **Autor:** Codex (modelo exato não informado ao agente)
- **Revisor:** Antigravity (Gemini 4 Neon High)
- **Base:** plano local `v3` (`Em Revisão`), sem commit próprio, sobre `fc5f6334e871606abe5560b6487ec2bfee36222f`. Inspeção somente leitura das alterações da `v3` (respostas v2/v3, catálogo fechado, decisões G1 de 2026-11-21, contrato de valor interpretativo, contrato de agentes/API, pontos de aprovação, estratégia de testes e decomposição), confrontadas com `src/agentes.ts`, `servidor/pedido.ts`, `servidor/ferramentas.ts`, `api/explicar.ts`, `ADR-011`, `DESIGN.md`, `KB-005` e `KB-007`.

#### Conferência da rodada 1

- **R1-1 — atendido.** As decisões G1 registradas na Rodada 1 e o complemento de 2026-11-21 (projeção municipal→célula da KB-005, 3 classes de sobreposição reunidas como 1 critério, falha fechada em leitura parcial/incompleta e lista fechada de 3 destinos de sugestão) foram incorporados ao catálogo das cinco perguntas (`panorama`, `mudanca`, `padroes`, `cuidados`, `proximos`), com pré-condições de recorte, regras determinísticas, exemplos numéricos e o novo `Contrato de valor interpretativo`.
- **R1-2 — parcialmente atendido (bloqueador remanescente R2-1).** O esquema fechado `{ pergunta_id, carga, recorte }`, a matriz de delegação por pergunta, o tópico estruturado `{ texto, referencias, limitacao, sugestao }`, a separação entre conferência determinística e avaliação humana de sentido, os limites da ADR-011 e a emenda datada estão especificados. Permanece em aberto a estratégia de compatibilidade/transição entre o Item 1 e o Item 2, reconhecida pelo próprio plano como bloqueio pendente antes do veredito apto.
- **R1-3 — atendido.** A tabela `### Pontos de aprovação` usa exatamente os cinco tipos e frases canônicas de `_project/README.md`. A amostra real local com Gemini foi fixada no Item 1 antes de sua PR (2 execuções com fixture fictícia, `gemini-3.1-flash-lite`, `npm run prova:agentes`, teto de 12 chamadas respondidas / 24 tentativas com repetição 503, falha fechada em cota/erro e credencial só no `.env` ignorado), com verificação hospedada opcional gerando `011_validation_*.md` no encerramento.
- **R1-4 — atendido.** O Item 2 especifica a substituição das 3 perguntas antigas e do texto livre pelas 5 perguntas fechadas, remoção de "Comparar municípios" (`#acao-comparar-municipios`), resposta em tópicos logo abaixo do grupo, preservação do contexto aplicado, cancelamento, concorrência, estados `data-estado-perguntas`, etapas reais, evidências recolhíveis e retornos do ciclo 010, sugestões como texto simples e atualização de `DESIGN.md` e `docs/runbook.md` seção 10.
- **R1-5, R1-6 e R1-7 — atendidos.** Decomposição em tabela com títulos `[FEATURE]` e documentos alocados por entrega, inventário concreto de arquivos afetados, comandos reais de `package.json` (com aviso de `supabase db reset` e exclusão de bateria de carga geral), declaração de autoria, `logical_key` com repositório completo e histórico de handoffs preservado.

Nenhum achado corrigido reapareceu e os bloqueadores caíram de 4 para 1.

#### Achados bloqueadores

- **R2-1 — Estratégia de transição/compatibilidade entre o Item 1 (servidor) e o Item 2 (painel) permanece indefinida e declarada como bloqueio pelo próprio plano.** O contrato atual em `main` (`src/agentes.ts` linhas 195–198, `api/explicar.ts` e `tests/e2e/13-perguntas.spec.mjs`) envia `{ pergunta: string, carga, recorte }` e valida listas fechadas dos papéis antigos (`lentes`, `disponibilidade`) e das ferramentas antigas (`explicar_selecao`, etc.). O plano v3 deixa em aberto a solução nas linhas 89 ("Definir migração sincronizada do cliente e servidor na mesma PR ou compatibilidade segura entre entregas antes de merge"), 166 ("Se não for possível manter compatibilidade entre as duas entregas, replanejar o corte antes da revisão apta; não integrar API que quebre o painel"), 170 e 217. Um plano não pode receber veredito apto mantendo o corte entre PRs sem definição.
  - **Correção (técnica, sem nova decisão G1):** escolher e fixar na `v4` um único desenho executável em `Contrato proposto de agentes e API`, `Itens de implementação`, `Decomposição em issues e PRs`, `Dependências e blockers` e `Sequência recomendada` — por exemplo: (a) **corte em 2 PRs sem janela quebrada**, em que o **Item 1** implementa e testa o novo motor de insights (ferramentas, orquestração dos 2 subagentes, validação do pedido `{ pergunta_id, carga, recorte }`, conferência de tópicos, testes `test:agentes`/`test:api` sobre o novo handler e prova real local `npm run prova:agentes`) **mantendo a rota publicada `api/explicar.ts` ligada ao handler vigente até o Item 2** (preservando `main` e `13-perguntas.spec.mjs` verdes após a PR 1), e o **Item 2** realiza a virada atômica na mesma PR (liga `api/explicar.ts` ao novo handler fechado, remove integralmente a via antiga de texto livre, substitui o painel, atualiza `DESIGN.md`, `docs/runbook.md`, emenda ao `ADR-011` e `13-perguntas.spec.mjs`); **ou** (b) **unificar a troca servidor + painel numa única issue/PR**.

#### Ressalvas

- **R2-2 — Remover frases residuais das versões `v1`/`v2` e alinhar o alcance das sugestões de exame.**
  1. Na tabela de catálogo (`padroes`, linha 73), remover a frase residual da `v2` *"Os detalhes de projeção de concentração, classes de sobreposição e falhas parciais estão bloqueados abaixo."*, já resolvida no parágrafo seguinte (linha 77).
  2. No Item 1 (`Ação técnica`, linha 132), trocar a formulação residual da `v1` *"Após decisões G1, definir catálogo fechado..."* para referenciar diretamente o catálogo, o contrato de valor interpretativo e os cálculos já fixados em `Decisões e autoridades`.
  3. Alinhar a condição da sugestão *"consultar comparação já configurada"* (linha 77, item d) com as condições de tela (linhas 67 e 75): explicitar que ela só aparece nas perguntas elegíveis em comparação de períodos (`mudanca` e `cuidados`), nunca em `proximos` (que exige período único).
- **R2-3 — Explicitar o alcance de `consultar_disponibilidade` quando `lente` é `null` no recorte estadual de período único.** Hoje `servidor/ferramentas.ts` (linhas 310–345) lê disponibilidade apenas dos municípios destacados pela lente (ou do município único no recorte municipal). Como `panorama`, `cuidados` e `proximos` passam a rodar também em todo Mato Grosso com `lente: null`, explicitar na `v4` qual conjunto determinístico de municípios tem disponibilidade lida nesse caso (ex.: os municípios dos critérios/destaques produzidos no resumo do recorte, ou os do top de detecções, sempre com `alcance` declarado e nunca afirmando disponibilidade estadual completa se for subconjunto) para respeitar o orçamento de 120 s e o teto de 64 KiB da ADR-011 sem falha silenciosa.

#### Itens atendidos

- Todos os itens atendidos na Rodada 1 permanecem válidos na `v3`.
- As decisões do responsável registradas em 2026-11-21 estão fielmente refletidas no catálogo, nas condições de tela, no contrato de valor interpretativo, nos pontos de aprovação e na estratégia de testes focada na funcionalidade.
- Validador `node scripts/validate-governance.mjs` com 0 erros e 0 avisos antes da gravação desta rodada.

#### Veredito

`REQUER NOVA RODADA` — os bloqueadores caíram de 4 para 1 (`R2-1`, de corte técnico entre as entregas, sem necessidade de nova decisão analítica do responsável), acompanhado de duas ressalvas (`R2-2` e `R2-3`). Fechando `R2-1` e ajustando `R2-2`/`R2-3` na `v4`, o plano fica pronto para a Rodada 3.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-2 + v3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Em Revisão` v3, aguardando revisão (rodada 2) / plano `Em Revisão` v3, revisão formal `Em andamento`, veredito `REQUER NOVA RODADA`, aguardando correções (rodada 2)
- `result`: `executed`
- `evidence`: esta seção `### Rodada 2` e bloco `## Próximo passo` atualizado; base local `fc5f6334e871606abe5560b6487ec2bfee36222f`
- `blockers`: R2-1 para obter veredito apto

### Complemento do responsável e resposta do autor — v3

O responsável concordou com as quatro recomendações apresentadas sobre projeção, sobreposição, leitura incompleta e sugestões; em seguida exigiu que o plano garanta como entregável uma interpretação dos dados que acrescente valor em relação às lentes. As decisões foram incorporadas ao catálogo e o contrato de valor interpretativo foi acrescentado ao objetivo, aos critérios de aceite e à avaliação lado a lado. A demonstração de ganho é verificada em casos e amostra real autorizada, não presumida nem garantida para toda resposta.

### Resposta do autor à rodada 1 — v2

- **Autor:** Codex (modelo exato não informado ao agente); base `fc5f6334e871606abe5560b6487ec2bfee36222f`. Histórico do handoff v1 preservado; novas chaves usam identidade completa do repositório.
- **R1-1 — parcialmente corrigido, bloqueado:** incorporadas escolhas registradas, matriz e exemplos. Projeção, classes, dados parciais e orientações ainda demandam decisão G1 explícita; ver seção de catálogo. Nenhum limiar ou regra de domínio foi escolhido silenciosamente.
- **R1-2 — parcialmente corrigido:** proposta de ID fechado, recorte, papéis, delegação, esquema, limites, teste semântico e preservação de G2. Compatibilidade segura entre issues e tratamento do cruzamento ainda impedem aceite do plano.
- **R1-3 — corrigido:** cinco pontos de aprovação com frases, prova de duas execuções no item 1 e teto explícito. A execução real continua condicionada à autorização e à cota; nenhuma verificação é presumida.
- **R1-4 — corrigido:** substituição das perguntas antigas e remoção da ação, resposta abaixo do grupo, preservação de contexto, cancelamento e etapas, e sugestões textuais simples.
- **R1-5 — corrigido:** tabela de issues, dependências, arquivos e documentação de cada entrega e encerramento; compatibilidade entre entregas permanece ressalvada como bloqueio.
- **R1-6 — corrigido:** comandos e riscos de reset local registrados; testes focados, sem bateria de carga geral.
- **R1-7 — corrigido parcialmente:** ferramenta declarada; o modelo exato não foi informado ao agente e não foi inventado. Chave v2 completa, base e histórico preservados.

**Pergunta ao responsável:** para o cruzamento de padrões, você autoriza (1) usar a projeção de concentração já definida na KB-005, inclusive suas ressalvas de divisa; (2) contar sobreposição como um único critério, reunindo as três classes disponíveis; e (3) quando alguma leitura de critério aplicável falhar ou estiver incompleta, retornar dados insuficientes para o cruzamento, sem achados parciais? Para sugestões de exame, autoriza limitá-las a consultar disponibilidade quando houver ressalva, examinar detalhes de célula com dois critérios e consultar comparação já configurada, sem outras recomendações? Essas são alternativas para sua decisão, não regras já aprovadas.

### Rodada 1

- **Data:** 2026-11-21
- **Autor:** ferramenta e modelo não declarados no rascunho `v1`
- **Revisor:** Antigravity (Gemini 4 Neon High)
- **Base:** plano local `v1` (`Rascunho` promovido a `Em Revisão`), sem commit próprio, sobre `fc5f6334e871606abe5560b6487ec2bfee36222f`. Inspeção somente leitura de `_project/ideations/011_insights_agentes.md`, `_project/cycles.md`, `_project/README.md`, `.agent/ai_behavior.md`, `.agent/templates/plano_implementacao.md`, `KB-003`, `KB-005`, `KB-007`, `ADR-011`, `DESIGN.md`, `docs/runbook.md`, `_project/executed/008_comparacao_periodos_agentes/008_validation_agentes.md`, `package.json`, `index.html`, `api/explicar.ts`, `servidor/explicar.ts`, `servidor/pedido.ts`, `servidor/ferramentas.ts`, `servidor/agentes.ts`, `src/agentes.ts`, `src/apresentacao-agentes.ts` e `src/app.ts`.

#### Achados bloqueadores

- **R1-1 — Decisões analíticas de G1 e especificação fechada do catálogo de perguntas permanecem em aberto, tornando o plano ainda não implementável.** O próprio rascunho lista quatro questões de G1 sem decisão humana e transfere para a ação técnica do Item 1 ("Após decisões G1, definir catálogo fechado de perguntas, contratos de evidência e achado, cálculos determinísticos estritamente necessários...") a definição do contrato executável. Além disso, faltam recortes essenciais para que a decisão do responsável feche o método e gere casos de referência verificáveis:
  1. **Matriz de pré-condições por pergunta (`ContextoTela` → `Recorte`):** hoje `servidor/pedido.ts` admite apenas quatro recortes (`selecao`, que exige `lente` obrigatória; `periodos`; `municipios`; `disponibilidade`). O plano não define, para cada uma das 5 perguntas propostas, se ela funciona sem lente aplicada (estado inteiro ou município puro), com lente individual, combinação, sobreposição, comparação de períodos ou **comparação de municípios** (`comparar_municipios`, KB-007 — ausente da questão 2, que trata apenas de "outro período").
  2. **Questão 3 ("mais de um padrão") frente à KB-005:** a combinação existente (`src/lentes/combinacao.ts`) combina somente `concentracao`, `recorrencia` e `persistencia`, recusa `concentracao` em recorte municipal (T4/A2) e exclui `sobreposicao` (`K1`). Não está definido se a pergunta depende de o usuário já ter aplicado uma combinação na tela ou se o servidor executa um cruzamento predefinido (e qual, em recorte estadual vs. municipal e em janelas com menos de 3 meses GMT, onde `recorrencia` fica `janela_insuficiente`).
  3. **Perguntas 4 ("interpretar com mais cuidado") e 5 ("examinar em seguida"):** foram fundidas num único item de decisão sem critérios determinísticos nem exemplos numéricos para distinguir achado de limitação (ex.: `lacuna_conhecida`, `incidencia_indeterminada`, mês parcial, borda da janela, polígono estimado/borda em sobreposição, célula de divisa no recorte municipal, comparação inconclusiva), "ausência de achados" e "dados insuficientes".
  - **Correção:** registrar a decisão explícita do responsável sobre as questões G1 abaixo e incorporar na `v2` a tabela fechada do catálogo de perguntas (texto, pré-condições de tela, recorte/ferramentas, regra determinística, tratamento de ausência de achados/dados insuficientes e casos de referência fictícios com resultados esperados).

- **R1-2 — Contrato dos agentes, ferramentas, esquema de pedido (G2) e verificação semântica estão subespecificados frente à ADR-011 e ao código vigente.**
  1. **Papéis dos subagentes e delegação:** hoje `servidor/agentes.ts` define `Subagente = 'lentes' | 'disponibilidade'`, e `delegacoesNecessarias` aciona ambos apenas em `periodos`/`municipios` (em `selecao`, aciona apenas `lentes`). O plano propõe subagentes de "padrões" e "contexto/qualidade" dentro do teto de 6 chamadas, mas não define o catálogo de ferramentas de cada subagente, o papel da primeira chamada do principal sem texto livre (se `recusar_pergunta` permanece ou sai e como a delegação é validada) nem quais perguntas acionam legitimamente os dois subagentes para cumprir o objetivo de demonstração sem fabricar participação.
  2. **Contrato de entrada do servidor (`servidor/pedido.ts` / G2):** o Item 2 remove o campo de texto livre no painel, mas o plano não define se `POST /api/explicar` passa a validar um identificador fechado de pergunta (enum fechado em `servidor/pedido.ts`, endurecendo contra prompt injection) ou mantém `pergunta: string` livre até 2.000 caracteres, nem se haverá novo `recorte.tipo` (ex.: recorte sem lente). Qualquer alteração no esquema fechado de `servidor/pedido.ts` exige definir as recusas HTTP 400 (`entrada_invalida`), preservar a matriz T4/JWT/RLS/revalidação e prever emenda datada ao `ADR-011`.
  3. **Esquema de achados e limites da conferência semântica:** hoje `servidor/agentes.ts` usa `afirmacoes: { texto, referencias }[]` e `conferirAfirmacao` valida apenas existência de referência, números, datas, classificações e alegações proibidas. O plano pede saída em tópicos com fundamento, limitação e sugestão de exame, e testes negativos para "semântica incorreta com números corretos", sem especificar o esquema estruturado dos tópicos nem distinguir o que será verificado determinísticamente no código do que será avaliado por casos de referência (evitando atribuir ao verificador garantias semânticas não implementáveis por regra lexical).
  4. **Orçamento e limite de 64 KiB (ADR-011):** caso alguma pergunta execute múltiplas lentes ou leitura estadual ampliada em `servidor/ferramentas.ts`, o plano precisa explicitar como o resumo de evidências respeita os tetos vigentes da ADR-011 (64 KiB por corpo ao Gemini, 120 s de leitura, 120 s de geração, 270 s totais), considerando os tempos já medidos nas KBs 005 e 007 (41–55 s em uniões estaduais; 42,3 s em 51 consultas de disponibilidade).

- **R1-3 — Tabela "Pontos de aprovação" diverge do vocabulário fechado de `_project/README.md`, e há contradição sobre quando e como executar a ação externa / prova real com Gemini.**
  1. `_project/README.md` (`## Pontos de aprovação`) e `.agent/templates/plano_implementacao.md` fixam exatamente cinco tipos de ponto de aprovação (`Autorizar`, `Aprovar plano`, `Aprovar merge`, `Ação humana externa`, `Verificar produção`) com frases padronizadas. A tabela do plano (linhas 66–74) acrescenta dois tipos inexistentes ("Decisão humana de regra analítica" e "Revisão formal") e omite as frases literais aplicáveis (`"aprovo o plano do ciclo 011"`, `"autorizo a implementação da issue #N"`, `"aprovo o merge da PR #N"`, `"concluí a ação externa da issue #N"`, `"autorizo a verificação em produção do ciclo 011"`).
  2. O critério de aceite do Item 1 (linha 108) exige "consumo medido na amostra autorizada", enquanto a "Sequência recomendada" (linha 145) coloca "Medir amostra real quando autorizada" apenas no passo 4, após a implementação e integração das duas issues. Corrigir na `v2`: fixar em qual issue ocorre a prova real local (`npm run prova:agentes` com `.env` local ignorado e fixture fictícia — G3), o tamanho exato da amostra, o modelo fixado (`gemini-3.1-flash-lite` da ADR-011), o limite de chamadas gratuitas e em qual PR entra eventual relatório `011_validation_*.md` se houver verificação hospedada.

- **R1-4 — Contrato visual (`DESIGN.md`) e compatibilidade com o painel entregue nos ciclos 008 e 010 estão incompletos no Item 2.** `DESIGN.md` (seção "Painel 'Perguntar sobre a tela'" e emenda de 2026-11-21) e `index.html` (linhas 297–320) fixam hoje as 3 perguntas prontas de D4, a ação "Comparar municípios" (`#acao-comparar-municipios`), o `<textarea>` `#pergunta-livre`, o bloco `#perguntas-contexto-aplicado`, o estado `data-estado-perguntas` e os atalhos de retorno ("Ver o lugar na tela" / "Ver detalhes do resultado" e "Ver as informações usadas"). O Item 2 precisa explicitar:
  1. Se as 3 perguntas anteriores são integralmente substituídas pelo novo catálogo e se a ação "Comparar municípios" permanece ou sai;
  2. Como a resposta em tópicos aparece "logo abaixo" (abaixo do grupo de perguntas ou expandida sob a pergunta selecionada), preservando `#perguntas-contexto-aplicado`, bloqueio de concorrência com "Cancelar", etapas reais em fluxo (`#perguntas-etapas`) e estados `data-estado-perguntas`;
  3. Se a "sugestão de exame" de cada achado é apenas texto orientador ou controle clicável (caso clicável, precisa restringir-se a ações fechadas validadas pelo cliente contra o estado vigente, nunca comandos livres do modelo).

#### Ressalvas

- **R1-5 — Decomposição em issues/PRs e lista de arquivos afetados devem ser concretas e completas.** Apresentar a decomposição em tabela com títulos `[FEATURE]`, dependências e alocação das atualizações documentais obrigatórias: `DESIGN.md` e `docs/runbook.md` (seção 10) no Item 2, emenda datada ao `ADR-011` no Item 1 (e Item 2, se mudar atalhos) e consolidação da `KB-003` no encerramento. Incluir nos arquivos afetados os arquivos reais hoje omitidos (`servidor/pedido.ts`, `servidor/explicar.ts`, `index.html`, `src/app.ts`, `src/apresentacao-agentes.ts`, `scripts/agentes/`, `scripts/api/` e `tests/e2e/13-perguntas.spec.mjs`).
- **R1-6 — Nomear explicitamente os comandos de verificação do `package.json` na estratégia de testes.** Explicitar `npm run typecheck`, `npm run typecheck:servidor`, `npm run build`, `npm run test:agentes`, `npm run test:interface`, `npm run test:api`, `npm run test:e2e`, `node scripts/agentes/conferir-pacote.mjs`, `npm run test:governance` e `npm run check:governance`, registrando que `test:api`, `test:e2e` e `prova:agentes` executam `supabase db reset` (apenas em ambiente local descartável) e que `test:e2e` (`13-perguntas.spec.mjs` e `03-acessibilidade.spec.mjs`) sustenta o aceite de desktop/celular, temas claro/escuro e acessibilidade.
- **R1-7 — Rastreabilidade de autoria e padrão da `logical_key`.** O rascunho `v1` não declarou ferramenta e modelo do autor e usou `rastro-quente` em vez de `EuThiagoAndrade/rastro-quente` na `logical_key`, sem registrar o commit base (`fc5f6334e871606abe5560b6487ec2bfee36222f`). Declarar ferramenta e modelo do autor na resposta à rodada 1 e manter o histórico de handoffs em subseções na `v2`.

#### Pergunta registrada para o responsável

Conforme `_project/README.md` ("Revisão formal": para em `Parado` quando a correção exigir decisão do responsável) e `.agent/ai_behavior.md` (decisões de regra analítica ambiental), indique suas escolhas para destravar a `v2`:

1. **G1 — Pergunta 1 ("O que chama atenção neste período?"):** escolhe **Alternativa A** (relatar apenas resultados já calculados pelos métodos existentes, sem limiar novo) ou **Alternativa B** (criar regra determinística nova de concentração temporal, especificando o limiar)? Ela deve funcionar também **sem lente aplicada** (sobre contagens/municípios do recorte) ou exigir lente ativa?
2. **G1 — Pergunta 2 ("O que mudou em relação ao outro período?"):** escolhe **Alternativa A** (usar apenas a comparação existente A → B da KB-007, em valores absolutos e ressalvas) ou **Alternativa B** (adicionar variação percentual, definindo regra para A = 0)? A **comparação de municípios** (`comparar_municipios`) deve ficar coberta no catálogo (com rótulo/pergunta própria ou adaptada) ou ficar fora desta entrega?
3. **G1 — Pergunta 3 ("Quais locais apresentam mais de um padrão?"):** escolhe **Alternativa A** (usar somente a interseção por célula já existente em `combinacao.ts` — e, nesse caso, exigir combinação já aplicada na tela ou permitir que o servidor calcule interseção predefinida de quais lentes, dado que `concentracao` recusa recorte municipal e `sobreposicao` está fora da combinação?) ou **Alternativa B** (definir nova regra determinística que inclua `sobreposicao` e/ou outros cruzamentos)?
4. **G1 — Perguntas 4 ("Onde devo interpretar os resultados com mais cuidado?") e 5 ("O que vale examinar em seguida?"):** escolhe **Alternativa A** (apenas limitações/disponibilidade/ressalvas já produzidas pelas evidências e orientações de exame ligadas à navegação existente, sem nova regra analítica) ou **Alternativa B** (criar regras determinísticas novas de priorização/alerta)?
5. **Escopo do painel (Item 2 / `DESIGN.md`):** as 3 perguntas prontas anteriores (ciclo 008) saem integralmente para dar lugar ao novo catálogo? A ação **"Comparar municípios"** (`#acao-comparar-municipios`) permanece ou sai? E a "sugestão de exame" em cada tópico deve ser **texto orientador simples** ou **botão navegável** (restrito a ações fechadas da tela)?

#### Decisões registradas do responsável (2026-11-21)

Em 2026-11-21, o responsável aprovou integralmente as recomendações apresentadas pelo revisor para destravar a `v2`, com as seguintes diretrizes explícitas para o autor incorporar (sem alterar o veredito da Rodada 1):

- **Papel dos agentes:** remodelar o trabalho dos agentes para **cruzar e interpretar** as evidências do recorte — não apenas repetir o que uma lente isolada já exibe — preservando a arquitetura de **1 agente principal + 2 subagentes** (`padrões` e `contexto/qualidade`), com cálculos determinísticos nas ferramentas e respeito integral a G1 (sem inventar números, causa, autoria, infração ou ranking de gravidade).
- **Pergunta 1 ("O que chama atenção neste período?"):** Alternativa A evoluída — panorama cruzado com métodos existentes + distribuição temporal descritiva (dias com detecção e dia/mês de maior contagem), sem limiar arbitrário novo; disponível com ou sem lente ativa.
- **Pergunta 2 ("O que mudou em relação ao outro período?"):** Alternativa A — comparação determinística A → B da KB-007 em valores absolutos, entradas/saídas/permanências e ressalvas, sem taxa percentual nova; desabilitada quando não houver comparação de períodos configurada. **Comparação de municípios (`comparar_municipios`) fica fora** das 5 perguntas pré-prontas.
- **Pergunta 3 ("Quais locais apresentam mais de um padrão?"):** Alternativa B enxuta e determinística no servidor — cruzamento por célula T1 de 0,05° dos critérios já existentes aplicáveis ao recorte (`concentracao` só no estado, `recorrencia` se janela ≥ 3 meses GMT, `persistencia` e `sobreposicao` se houver camada), listando células presentes em **2 ou mais critérios**, sem pontuação ou ranking e sem alterar `combinacao.ts` da tela; disponível mesmo sem combinação aberta na tela (informando insuficiência se menos de 2 critérios forem aplicáveis).
- **Pergunta 4 ("Onde devo interpretar os resultados com mais cuidado?"):** Alternativa A estruturada — reúne exclusivamente os sinais objetivos de incerteza/limite já definidos nas KBs 004–007 (disponibilidade/lacunas, mês GMT parcial, sequência na borda/adjacente a lacuna, polígono estimado/borda de área protegida, célula de divisa no recorte municipal, comparação inconclusiva), admitindo ausência de alerta extra quando nada se aplicar.
- **Pergunta 5 ("O que vale examinar em seguida?"):** Alternativa A interpretativa — sugestões de próximos exames na própria tela ancoradas nos achados cruzados dos dois subagentes, sem ranking de prioridade.
- **Contrato da API (`POST /api/explicar`, G2 / ADR-011):** fechar o pedido do servidor para aceitar apenas identificador fechado (`pergunta_id` das 5 perguntas pré-prontas), rejeitando texto livre com HTTP 400 (`entrada_invalida`).
- **Interface mais simples possível (`DESIGN.md` / Item 2):** retirar integralmente o campo de texto livre, as 3 perguntas antigas do ciclo 008 e o botão "Comparar municípios" (`#acao-comparar-municipios`). Priorizar a máxima simplicidade para que o usuário entenda imediatamente o que o agente disse: contexto aplicado, as 5 perguntas pré-prontas, resposta clara em tópicos logo abaixo (com sugestão de exame como texto orientador simples, mantendo retornos do ciclo 010 e etapas/evidências recolhíveis).
- **Validação focada na funcionalidade (este ciclo e próximos):** não executar revisões completas de carga/estresse do sistema todo; focar testes e verificações na funcionalidade alterada. Executar a amostra local pequena com Gemini real (`npm run prova:agentes`, fixture fictícia, `gemini-3.1-flash-lite`) ainda no **Item 1**; manter a verificação em produção como opcional mediante autorização separada.

#### Itens atendidos

- **Governança e estrutura:** ciclo `011` reservado em `_project/cycles.md` como `Planejamento`, nível `completo`, modo contínuo `—`, ideação `_project/ideations/011_insights_agentes.md` referenciada, `Autorização inicial` e `Autorização do rascunho` presentes no cabeçalho, `handoff_schema_version: 2` e todas as seções do template `.agent/templates/plano_implementacao.md` na ordem correta. Validador `node scripts/validate-governance.mjs` com 0 erros e 0 avisos antes da revisão.
- **Fatos conferidos no código (`fc5f633`):** `servidor/agentes.ts` (principal + 2 subagentes, `LIMITE_CHAMADAS = 6`), `servidor/ferramentas.ts` (5 ferramentas determinísticas sob JWT/RLS), `api/explicar.ts`, `servidor/explicar.ts`, `src/agentes.ts`, `src/apresentacao-agentes.ts`, `KB-003`, `KB-007`, `ADR-011` e `008_validation_agentes.md` confirmam o baseline descrito no plano.
- **Postura de domínio e privacidade (G1, G2, G3, G4):** G1, G2 e G3 corretamente marcadas como `Sim` e G4 como `Não`; o rascunho recusa atribuição de causa/autoria/infração/gravidade, não escolhe sozinho regras de G1, não presume gratuidade/disponibilidade de terceiros, não introduz dados privados nem migrações.

#### Veredito

`REQUER NOVA RODADA` — quatro achados bloqueadores (R1-1 a R1-4) e três ressalvas (R1-5 a R1-7). Como a correção de R1-1 (decisões analíticas G1) e parte de R1-4 (escopo do painel) exige decisão explícita do responsável, o ciclo fica em `Parado` até o registro dessas escolhas; em seguida, o autor incorpora as decisões e corrige os achados na `v2` para a Rodada 2.

#### Handoff da rodada

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 011 + revisar_plano + 011_plan/rodada-1 + v1`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: plano `Rascunho` v1, revisão `Pendente`, aguardando revisão (rodada 1) / plano `Em Revisão` v1, revisão formal `Em andamento`, veredito `REQUER NOVA RODADA`, situação `Parado`
- `result`: `executed`
- `evidence`: esta seção `### Rodada 1`, cabeçalho e bloco `## Próximo passo` atualizados; conferência local sobre `fc5f6334e871606abe5560b6487ec2bfee36222f`
- `blockers`: decisões do responsável para R1-1 e R1-4; especificações técnicas e documentais de R1-2, R1-3 e R1-4 na `v2`

## Pós-mortem

- **Data de conclusão:** 2026-11-21 (prospectiva; efetiva após o merge do encerramento)
- **Desvios:** a amostra real local exigiu, com autorizações próprias registradas na task da issue #107, um diagnóstico de schema, um reteste dos dois casos e duas repetições únicas do panorama, sempre com 13 s entre chamadas e sem teste de carga. O aceite de utilidade foi dado pelo responsável sobre a última amostra fictícia. A verificação hospedada foi dispensada pelo responsável no encerramento e não gerou resultados de produção.
- **Lições comprovadas:** nenhuma nova lição transversal registrada.

## Referência do bootstrap

Não se aplica: a exceção de bootstrap é exclusiva do ciclo 000.
