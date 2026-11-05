# Plano de Implementação — Validação de capacidades, custos e arquitetura

> **Ciclo:** `002`
> **Status:** `Rascunho`
> **Versão:** `v1`
> **Data de criação:** 2026-11-05
> **Última atualização:** 2026-11-05
> **Tipo:** `chore`
> **Prioridade:** `P2` (proposta de planejamento, sem prazo assumido)
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 002" em 2026-11-05
> **Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 002" em 2026-11-05
> **Modo contínuo:** `—`
> **Revisão formal:** `Pendente`
> **Veredito da revisão:** `Pendente`
> **Aprovação humana pós-revisão:** `Pendente`
> **handoff_schema_version:** `2`

## Problema e contexto

Ideação: _project/ideations/002_validacao_arquitetura.md

## Objetivo

Produzir uma avaliação rastreável de capacidade, custo zero e alternativas de arquitetura para um protótipo de um usuário, em Mato Grosso, com até dois anos de dados e atualização sob demanda. A avaliação deve explicitar o que a documentação sustenta, o que depende de premissas e o que exigiria prova técnica posterior, permitindo ao responsável decidir se há base suficiente para planejar a fundação.

O resultado é um parecer documental. Concluir que uma opção não atende ou que a evidência é insuficiente também atende ao ciclo, desde que os impedimentos sejam demonstrados. Não se exige uma recomendação positiva nem se aprova uma arquitetura definitiva neste plano.

## Origem no backlog

Não se aplica. Demanda direta do responsável; nenhum ID do backlog foi selecionado. Snapshot herdado da ideação.

## Contexto e baseline

- A ideação escolheu A1: avaliar antes de implementar a fundação. Custo zero é restrição do responsável; não há autorização para contratação, cobrança, cartão, trial pago ou configuração de serviços.
- Vercel, Supabase e autenticação Google são requisitos da ADR-002 e da KB-003. Planos comerciais, framework, processamento, PostGIS, ambientes e matriz de acesso permanecem em aberto. Comparar alternativas não autoriza remover esses requisitos.
- O ciclo 001 demonstrou contagens coerentes no recorte de Colniza, agosto a outubro de 2026. Seu relatório, manifesto e KB-003 são evidência do recorte, não de escala estadual, desempenho, custo ou método de seleção de áreas. O relatório contém trechos de status anteriores à conclusão; usar sua seção 11 e as ressalvas das seções 8 a 10, sem corrigir o histórico neste ciclo.
- Não há aplicação operacional, banco, autenticação ou importador. O repositório dispõe de governança e scripts de prova de dados; o mockup privado não é baseline.
- A ideação e suas respostas estão nos commits locais `1efcf80a21b67032626c91a95fcf0cbbed842fdb` e `97d7e7676c03aef306ca4978e249abc2e9eb7395`. A base integrada do ciclo 001 é `28dece5`; a PR #10 foi conferida como integrada. Na conferência de 2026-11-05 não havia PR do ciclo 002.
- Permanecem desconhecidos os volumes para dois anos de MT, frequência real das atualizações, consultas por sessão, disponibilidade, recuperação e classificação detalhada de dados. Serão tratados como variáveis e lacunas, sem inventar requisitos humanos.

## Escopo

### Dentro do escopo

1. Definir cenários e um modelo de dimensionamento documental com premissas, unidades, intervalos e fontes.
2. Pesquisar documentação oficial vigente sobre capacidades, condições gratuitas e restrições dos serviços necessários; confrontar cada cenário com os limites verificados.
3. Comparar alternativas de processamento e acesso que preservem os requisitos definidos; produzir parecer, riscos e propostas delimitadas de provas futuras.
4. Registrar as entregas em três relatórios Markdown, atualizar a documentação viva com os limites da conclusão e encerrar o ciclo pelo fluxo completo, após as aprovações aplicáveis.

Nesta etapa de rascunho, somente este plano e o registro do estado do ciclo são alterados. Os itens abaixo dependem de revisão, aprovação, integração documental, issues e autorização de implementação de cada unidade, mesmo sendo entregas documentais.

### Fora do escopo

- Implementar aplicação, scaffold, banco, schema, migrações, políticas RLS, autenticação, importador, pipeline ou testes de serviços.
- Executar benchmarks, provas locais ou remotas, instalar dependências, baixar bases territoriais em massa ou reprocessar a prova do ciclo 001. O ciclo especifica provas posteriores quando necessárias; não as executa.
- Criar ou configurar contas/projetos, consentir termos em nome do responsável, gerar credenciais, enviar dados a provedores, publicar aplicação, fazer deploy, contratar ou aceitar qualquer custo.
- Escolher regras ambientais, agregar detecções em incêndios, definir limiares, pesos, ranking, área queimada ou seleção operacional de áreas. Não ampliar fontes ou camadas silenciosamente.
- Ler `local/brainstorm/`, `local/prototipo/` ou dados privados; transportar identidades, contatos, dados restritos ou segredos para qualquer artefato.
- Adotar arquitetura definitiva, alterar requisitos das ADRs, reservar ciclo futuro, criar backlog sem pedido ou lançar release de produto.

## Decisões e autoridades

As autoridades são `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, ADR-001 a ADR-004, KB-003 e a ideação. Fontes externas informam a avaliação; não alteram decisões locais. O plano usa integralmente `.agent/templates/plano_implementacao.md`; relatórios de pesquisa são evidências auxiliares, não novas autoridades.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — "autorizo o rascunho do plano do ciclo 002" | Ideação registrada e decisões do responsável acessíveis | Redação local da v1 e reconciliação de `cycles.md`; autorização recebida em 2026-11-05 | Revisão formal, aprovação, publicação ou execução das entregas | Ideação, recorte A1 e restrição de custo zero |
| Aprovar plano — "aprovo o plano do ciclo 002" | Revisão formal com veredito apto e manifestação humana posterior | Escopo documental, publicação da PR do plano com a ideação ainda local, criação das issues após integração e confirmação de payload; encerramento após entregas integradas | Merge, implementação de qualquer issue, arquitetura definitiva, serviços ou gastos | Versão, veredito, ressalvas, premissas e limites de evidência |
| Aprovar merge — "aprovo o merge da PR #N" | PR real, diff delimitado e checks verdes; uma aprovação por PR | Somente o squash da PR identificada, documental, de entrega ou de encerramento | Outra PR, próxima entrega, provas técnicas ou deploy | Diff, checks reais, privacidade e ausência de ampliação de escopo |
| Autorizar implementação — "autorizo a implementação da issue #N" | Plano aprovado e integrado, issue real com payload confirmado e dependências integradas | Uma das três entregas documentais descritas neste plano; branch, task e PR da unidade | Fundação, contas, provas técnicas, custo ou merge | Issue, critérios de aceite, dependências e barreiras |
| Ação humana externa | Não prevista na avaliação documental | Nenhuma ação externa é solicitada por este plano | Cadastro, aceite de termos, cartão, credenciais ou configuração | Se a evidência depender disso, registrar a lacuna e solicitar decisão antes de ampliar o escopo |
| Verificar produção | Não se aplica: não há produção ou deploy neste ciclo | Nenhuma verificação em produção | Uso de ambiente remoto para contornar o limite documental | Provas futuras exigem escopo e autorizações próprios |

Não há encadeamento automático ou modo contínuo. Parar se houver conflito de estado/autorização, falta de acesso necessário, exigência de dados privados, nova dependência, gasto ou alteração material de escopo. Se a avaliação pedir uma decisão de regra ambiental, apresentar alternativas com exemplos numéricos ao responsável antes de avançar. Ausência de evidência de capacidade deve produzir parecer limitado, sem iniciar prova técnica por inferência.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | A avaliação aborda fontes, volume e localização do processamento geoespacial. Preservar o método e o recorte do ciclo 001 como referência limitada; distinguir bytes/registros de fenômenos ambientais. Não introduzir método, geometria ou regra operacional. Futuras provas devem ter casos independentes, proveniência, unidades e tolerâncias explícitas. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Comparar fluxo Google/Supabase e responsabilidades de acesso; matriz conceitual com permitido/negado e protocolo futuro de testes. Autenticação e usuário único não dispensam autorização. Nenhuma política ou tabela é implantada; toda futura tabela `public` deverá ter RLS. |
| G3 — privacidade de dados | Sim | Somente sínteses e metadados públicos apropriados ou exemplos fictícios. Não copiar dados pessoais, operacionais ou segredos, nem ler materiais privados. Conferência semântica de todos os documentos antes de commit/publicação, além do validador. |
| G4 — migrações só acrescentam | Não | Não há migrações neste escopo. As alternativas devem respeitar a regra em eventual fundação; necessidade de criar ou alterar banco exige novo escopo autorizado. |

## Estratégia de testes

- Em cada entrega: conferir referências locais, fórmulas, unidades, hipóteses e correspondência entre conclusão e evidência. Para contas de capacidade, registrar entradas e cálculo reproduzível e conferir pelo menos um caso abaixo, um no limite e um acima de uma cota documentada, sem chamadas aos serviços.
- Na pesquisa: cada limite/condição terá URL oficial direta, seção, data de consulta, escopo da cota e distinção entre fato, estimativa e desconhecido. Divergências entre páginas permanecem explícitas; a conclusão usa o limite mais restritivo compatível até esclarecimento, sem afirmar garantia.
- Na comparação: rastrear cada recomendação aos cenários e fontes dos itens 1 e 2. Conferir separadamente custo, capacidade, segurança e evidência de desempenho. Não registrar teste de RLS, login, carga ou recuperação como executado.
- Gates locais de cada PR e do rascunho: `node --test scripts/validate-governance.test.mjs`, `node scripts/validate-governance.mjs`, `git diff --check` e `git status --short`, com Node.js 24 e sem `npm install`.
- Scripts e método do ciclo 001 não serão alterados; seus testes de aplicação não são necessários para estas entregas documentais. Não existem build, lint de aplicação, banco ou E2E pertinentes ao escopo.
- Antes de publicar: revisar staging seletivo e G3, executar gates e conferir os checks reais da PR. Aprovação humana, elegibilidade de conta e desempenho não são provados pelo validador.

## Itens de implementação

### Item 1 — Cenários e dimensionamento documental

**Contexto:** Um usuário e uma janela de até dois anos não determinam sozinhos volume, tráfego ou tempo de processamento; o recorte municipal não representa o estado.

**Ação técnica:** Criar `002_research_cenarios.md` com inventário inicial restrito às fontes do ciclo 001 (focos INPE e limites IBGE; FIRMS somente como referência auxiliar, sem presumir ingestão permanente). Qualquer camada adicional será lacuna ou proposta, não requisito. Descrever carga inicial, consulta territorial e temporal, atualização sob demanda e retenção de até dois anos. A data final da janela permanece variável; não converter o teto de dois anos em período calendário aprovado.

Modelar registros, bytes brutos e persistidos, índices/geometrias, agregados, cópias de trabalho/recuperação, tráfego, requisições e duração ainda desconhecida. Usar estatísticas/metadados oficiais acessíveis sem conta e evidências versionadas do ciclo 001; não acessar brutos privados nem extrapolar Colniza linearmente para MT. Onde não houver evidência, fornecer intervalo justificado ou variável sem valor.

Documentar relações como armazenamento total = dados + índices + geometrias + agregados + cópias; tráfego mensal = carga inicial no mês + atualizações + respostas por consulta; consumo de processamento = execuções × recurso por execução. Distinguir limites de banco, storage e outros serviços e não somar ou comparar unidades incompatíveis. Evitar dupla contagem de geometria já embutida nos dados. A retenção de dois anos não limita automaticamente dados temporários ou backups.

Comparar atualização esporádica, semanal e diária como hipóteses de sensibilidade, sem assumir frequência escolhida. Quantidade de consultas, tamanho das respostas, tempo aceitável, disponibilidade e recuperação serão variáveis; explicitar que um usuário pode gerar muitas requisições. Para cada entrada registrar unidade, fonte/data, recorte, hipótese e confiança.

**Critérios de aceite:**

- [ ] Cenários respeitam um usuário, MT, até dois anos e atualização sob demanda; todas as frequências e cargas propostas estão rotuladas como hipóteses.
- [ ] Inventário separa fonte/camada indispensável ao cenário, referência auxiliar e expansão excluída; há proveniência e condições de uso conhecidas ou lacunas declaradas.
- [ ] Fórmulas cobrem armazenamento, tráfego, processamento e retenção, com entradas rastreáveis e limites de extrapolação; não há números estaduais apresentados como medidos sem evidência.
- [ ] Matriz de lacunas indica o efeito sobre a conclusão e como resolver cada uma documentalmente ou por prova futura, sem executar a prova.

### Item 2 — Capacidades e condições de custo zero

**Contexto:** Requisitos de provedor não demonstram que uma modalidade gratuita seja elegível ou suficiente. Preços, limites e condições devem ser verificados no momento da avaliação.

**Ação técnica:** Criar `002_research_capacidades_custos.md` após o item 1. Consultar fontes oficiais de Vercel, Supabase e Google para autenticação; incluir serviços auxiliares, bibliotecas, mapas, tiles ou execução local somente se necessários às alternativas, explicitando uso/licença e custo indireto. Nenhuma alternativa pode ocultar uma dependência paga.

Para cada serviço/funcionalidade relevante, registrar modalidade, elegibilidade e restrições de uso, unidades, limites por projeto/conta/período/região, armazenamento, transferência/egress, requisições, duração/memória/processamento, extensões geoespaciais, autenticação, inatividade/suspensão, recuperação/backups, ambientes e observabilidade. Campo não aplicável terá justificativa; campo não publicado ficará desconhecido. Verificar cartão, trials/créditos temporários, comportamento ao exceder cotas, cobrança automática e controles que impeçam custos. Não presumir que autenticação Google exige Google Maps ou que um serviço nominalmente gratuito cubra todo o fluxo.

Confrontar a demanda de cada cenário com as cotas correspondentes, registrando consumo/cota e margem quando calculáveis, incluindo picos, carga inicial e cópias. Não inventar percentual obrigatório de folga. Uso de hardware/internet existentes na opção local é premissa a confirmar, não capacidade gratuita garantida. Se depender de conta ou aceite inacessível, registrar a condição não verificada sem criar conta.

**Critérios de aceite:**

- [ ] Matriz usa fontes primárias diretas com data de consulta e separa condição documentada, premissa e ponto não verificado; nenhuma cota é preenchida por memória.
- [ ] Custo zero é avaliado de ponta a ponta, incluindo excesso, inatividade, limites temporários, dependências auxiliares e exigência de cobrança/cartão.
- [ ] Cada cenário tem resultado por recurso: cabe documentalmente, excede ou indeterminado; há memória de cálculo e conferência nos limites quando existirem números.
- [ ] Incompatibilidades e condições de parada estão explícitas; documentação não é apresentada como medição de desempenho ou garantia de gratuidade futura.

### Item 3 — Alternativas arquiteturais, acesso e parecer

**Contexto:** O responsável precisa compreender onde os dados ficam e são processados, o que pode ficar gratuito e quais evidências faltam antes de autorizar uma fundação.

**Ação técnica:** Criar `002_research_arquitetura.md` após os itens 1 e 2. Comparar pelo menos estas alternativas candidatas, descartando com evidência as incompatíveis: processamento local sob demanda com publicação futura de resultados mínimos; processamento no Supabase, avaliando PostGIS e lotes; processamento em funções Vercel com persistência no Supabase. Todas preservam Vercel, Supabase e login Google no desenho da futura aplicação; nenhuma disponibilidade ou adequação desses recursos é presumida. Alternativas não precisam ser implementáveis para merecer avaliação, mas descarte e dependências devem ser claros.

Para cada alternativa, apresentar fluxo de dados/controle, fronteiras de confiança, processamento, persistência, consulta, atualização/expiração, falha e recuperação; mapear componentes aos limites do item 2 e cenários do item 1. Avaliar framework somente no grau necessário para os fluxos e limitações, sem scaffold ou escolha definitiva. Não descrever seleção ambiental ainda inexistente como funcionalidade validada.

Descrever matriz conceitual de acesso por recurso e ação para anônimo, responsável autenticado, outro autenticado não autorizado e processo privilegiado futuro, todos como papéis de teste, não contas reais. Diferenciar dados territoriais compartilháveis de dados restritos; classificação desconhecida impede propor exposição. Registrar onde RLS é exigido, limites de segredos no cliente/servidor e riscos de funções privilegiadas. Matriz é proposta, sem políticas executadas ou isolamento comprovado.

Aplicar os seguintes critérios de conclusão, por alternativa:

| Resultado | Condição |
| :-- | :-- |
| Candidata documentalmente compatível | Sem incompatibilidade identificada com requisitos, custo zero e acesso; cenários quantificáveis cabem nas condições verificadas. Evidência de desempenho e condições dependentes de conta continuam explicitamente limitadas. |
| Incompatível no cenário avaliado | Pelo menos um requisito necessário viola limite, condição de gratuidade, acesso ou dependência demonstrada; identificar qual, sem contratar solução paga. |
| Evidência insuficiente | Uma incógnita material impede concluir sobre custo, capacidade, elegibilidade ou segurança; listar a pergunta e a evidência necessária. Não converter desconhecido em compatibilidade. |

Se todas forem incompatíveis ou indeterminadas, relatar esse resultado e as decisões que cabem ao responsável. Uma preferência técnica será apenas recomendação condicionada, sem novo ADR de arquitetura aceita. Propor provas futuras apenas para lacunas materiais: pergunta, dado fictício/público adequado, ambiente, comando/protocolo sugerido, métricas, referências independentes, critérios de aceite, limites de custo e autorização necessária. Não executar essas provas neste ciclo. Atualizar a KB-003 no trecho de estado/limites e próximos passos, sem transformar hipóteses em requisitos aprovados.

**Critérios de aceite:**

- [ ] As três alternativas estão comparadas ou descartadas com evidência e ligação aos cenários, cotas, condições e riscos; todos os custos/dependências necessários estão expostos.
- [ ] Fluxos e matriz proposta contemplam acesso permitido/negado, RLS, dados compartilhados/restritos e segredos; não há alegação de segurança testada.
- [ ] Parecer distingue compatibilidade documental, incompatibilidade e insuficiência, sem inferir desempenho estadual ou escolher método ambiental.
- [ ] Lacunas têm protocolo futuro delimitado ou decisão humana identificada; a KB-003 reflete somente os resultados sustentados e preserva a distinção entre avaliação e fundação.

## Arquivos afetados

| Momento | Arquivos previstos |
| :-- | :-- |
| Rascunho e revisão | `_project/drafts/002_validacao_arquitetura/002_plan.md`; `_project/cycles.md` para estado `Planejamento` e link do plano |
| PR documental futura | Plano e registro do ciclo; incluir os dois commits locais da ideação ainda não publicados em `_project/ideations/002_validacao_arquitetura.md` |
| Item 1 | `002_research_cenarios.md` e task `002_task_issue-N.md` no diretório ativo do ciclo |
| Item 2 | `002_research_capacidades_custos.md` e task correspondente no diretório ativo |
| Item 3 | `002_research_arquitetura.md`, task correspondente e `_project/knowledge/KB-003_visao_produto_requisitos.md` |
| Encerramento | `002_task_closure.md`, atualização dos artefatos do ciclo e `cycles.md`, movimentação do diretório para `_project/executed/002_validacao_arquitetura/` e ajuste de referências vivas necessário |

`N` é marcador até existir issue real. Templates de task e workflows serão lidos no ponto de uso. Não alterar código, fontes do ciclo 001, regras, validador, ADRs ou backlog.

## Decomposição em issues e PRs

- PR documental do ciclo: ideação local e plano após aprovação, sem issue artificial. Branch local `chore/cycle-002-plan`; integrar com aprovação específica antes de abrir entregas.
- Item 1: issue proposta `[CHORE] Definir cenários e dimensionamento documental do protótipo`; uma PR em `chore/issue-N` e uma task, após autorização da issue real.
- Item 2: issue proposta `[CHORE] Avaliar capacidades e condições de custo zero`; depende da integração do item 1; uma PR e task próprias.
- Item 3: issue proposta `[CHORE] Comparar arquiteturas e consolidar parecer de viabilidade`; depende dos itens 1 e 2 integrados; uma PR e task próprias, incluindo KB-003.
- Encerramento: PR separada em `chore/cycle-002-closure`, com task de encerramento, sem issue recursiva. Não há release ou deploy.

Títulos e critérios deste plano são a base para payloads a apresentar e confirmar depois da integração documental; nenhum número de issue/PR está reservado. A aprovação de uma entrega não autoriza a seguinte.

## Dependências e blockers

- Para o rascunho: ideação, template e autorização específica conferidos; nenhum bloqueio local. Git inicialmente limpo.
- Para publicação e execução: revisão formal, aprovação posterior, merge documental com checks verdes, confirmação dos payloads, issues reais e autorização por issue.
- Para a pesquisa: acesso à documentação oficial. Falta de acesso impede comprovar a condição correspondente; registrar a limitação e não preencher por suposição.
- Detalhes de carga, disponibilidade, recuperação e classificação de dados são lacunas de avaliação. Não bloqueiam redigir o plano ou emitir resultado insuficiente; impedem uma recomendação que dependa de respostas inexistentes.
- MCP GitHub Docker retornou `401 Bad credentials` e o outro conector não estava disponível. A consulta somente leitura por `gh` funcionou; futuras ações devem tentar novamente o MCP preferencial antes de usar fallback disponível.

## Riscos, suposições e rollback

| Risco ou suposição | Tratamento |
| :-- | :-- |
| Termos/cotas mudam e dependem de elegibilidade | Datar fontes, documentar condições e revalidar antes de eventual fundação; não prometer custo zero permanente. |
| Volume estadual subestimado | Não ampliar Colniza por proporção territorial; usar metadados adequados, faixas justificadas ou declarar incógnita. |
| Documentação confundida com desempenho | Parecer distingue compatibilidade de prova; definir protocolos futuros sem alegar execução. |
| Um usuário confundido com acesso seguro | Matriz proposta com casos negados; RLS e testes reais ficam para fundação autorizada. |
| Hardware local ou operação manual indisponível | Registrar como premissa e custo operacional; não pressupor máquina ou tempo do responsável. |
| Nova fonte/camada ou método altera escopo | Apresentar a necessidade e parar antes de implementá-la; regra ambiental exige decisão humana. |
| Gratuidade inviável | Concluir incompatibilidade/insuficiência e devolver alternativas ao responsável, sem contratar ou reduzir requisitos silenciosamente. |

Rollback é documental: preservar a evidência e corrigir por commit/PR delimitado e autorizado; sem reset destrutivo ou reescrita de histórico. Não há serviço ou banco a reverter. Cancelamento ou substituição depende de decisão do responsável e do fluxo canônico, sem movimentação antecipada para `executed/`.

## Sequência recomendada

1. Salvar a v1 local e reconciliar o ciclo como `Planejamento`; aguardar revisão formal da rodada 1.
2. Revisar e, quando autorizado, corrigir em versões sucessivas, preservando rodadas. Aprovação humana só após veredito apto.
3. Após aprovação, conferir lote incluindo ideação, executar gates e publicar PR documental; aguardar aprovação específica de merge e checks verdes.
4. Conferir integração, apresentar e confirmar payloads, criar issues; aguardar autorização da primeira unidade.
5. Executar os itens 1, 2 e 3 em sequência, cada um com autorização, task, barreiras, gates, PR e merge específico.
6. Com entregas integradas, preparar encerramento prospectivo coberto pela aprovação do plano; consolidar evidências e limites, sem exigir resultado positivo de viabilidade.
7. Publicar PR de encerramento, aguardar aprovação do merge e checks verdes; conferir integração antes de declarar conclusão efetiva. Uma fundação posterior requer triagem e autorização próprias.

## Referências

- `.agent/ai_behavior.md`; `_project/README.md`; `_project/cycles.md`.
- `.agent/workflows/rascunhar_plano.md`; `.agent/templates/plano_implementacao.md`.
- `_project/ideations/002_validacao_arquitetura.md`, snapshot de origem `97d7e7676c03aef306ca4978e249abc2e9eb7395`.
- `_project/decisions/ADR-001_governanca_agnostica_adapters.md`; ADR-002, ADR-003 e ADR-004 no mesmo diretório.
- `_project/knowledge/KB-003_visao_produto_requisitos.md`.
- `_project/executed/001_prova_de_dados/001_research_viabilidade.md`; `scripts/prova-dados/fontes.json`.
- [PR #10 — encerramento do ciclo 001](https://github.com/EuThiagoAndrade/rastro-quente/pull/10), integrada e conferida em 2026-11-05 por consulta somente leitura.

Fontes oficiais externas de capacidades e custos serão localizadas e verificadas na execução do item 2; este rascunho não apresenta cotas ou preços como fatos atuais.

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | — (não criadas) |
| PR(s) | — (não publicadas para o ciclo 002) |
| Branch(es) | `chore/cycle-002-plan`, derivada da ideação local em `97d7e7676c03aef306ca4978e249abc2e9eb7395` |
| Destino após conclusão | `_project/executed/002_validacao_arquitetura/002_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 1) — ciclo 002 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 002"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 002 + rascunhar_plano + 002_plan + v1` (origem: `97d7e7676c03aef306ca4978e249abc2e9eb7395`).
- `effect_class`: `local_mutation`
- `state_before`: ciclo 002 em `Ideação`, decisões registradas e Git limpo em `chore/cycle-002-ideation`; nenhum plano local ou PR do ciclo encontrado.
- `state_after`: plano v1 local em `Rascunho`, revisão/veredito/aprovação pendentes; ciclo 002 em `Planejamento`, próximo ciclo 003; branch `chore/cycle-002-plan`; nenhuma publicação, issue ou implementação.
- `result`: `executed`
- `evidence`: autorização literal de 2026-11-05; ideação no commit de origem; template e autoridades lidos; novo plano e registro do ciclo reconciliados; verificações locais registradas abaixo.
- `blockers`: nenhum para o rascunho; revisão formal e aprovações posteriores pendentes; desconhecidos de carga e elegibilidade tratados como lacunas.

### Validação local do rascunho

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, sem falhas.
- `node scripts/validate-governance.mjs`: zero erros e zero avisos; nove itens de conferência manual, sem alegação de validação remota ou de aplicação.
- `git diff --check`: sem erros. Conferência manual de escopo, autorização, G3, referências existentes e coerência do próximo passo realizada; somente plano e linha do ciclo alterados.
- `gh pr list` confirmou a integração da PR #10 e ausência de PR do ciclo 002; nenhum efeito remoto executado. Não há issue, task de implementação ou veredito de revisão a conferir nesta etapa.
- Backlog não selecionado nem alterado; fila e publicação de backlog não auditadas. Contrato visual e exclusão remota Vercel permanecem fora do escopo.

## Revisão crítica

Pendente. Nenhuma rodada ou veredito formal foi emitido neste rascunho. A rodada 1 será registrada pelo revisor após o pedido correspondente; autoria: Codex (GPT-6). O revisor informa ferramenta e modelo ao revisar. Preservar rodadas e respostas do autor, até o teto de cinco rodadas.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`. Nenhuma exceção do bootstrap se aplica ao ciclo `002`.
