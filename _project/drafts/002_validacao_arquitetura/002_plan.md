# Plano de Implementação — Validação de capacidades, custos e arquitetura

> **Ciclo:** `002`
> **Status:** `Aprovado`
> **Versão:** `v2`
> **Data de criação:** 2026-11-05
> **Última atualização:** 2026-11-05
> **Tipo:** `chore`
> **Prioridade:** `P2` (proposta de planejamento, sem prazo assumido)
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 002" em 2026-11-05
> **Autorização do rascunho:** "autorizo o rascunho do plano do ciclo 002" em 2026-11-05
> **Autorização da correção:** "Corrija o plano" em 2026-11-05, referente aos achados R1-1 a R1-4 do ciclo 002
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO PARA APROVAÇÃO`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-11-05`
> **handoff_schema_version:** `2`

Plano v2 aprovado pelo responsável em 2026-11-05 pela manifestação literal "Aprovo o plano do ciclo 002", posterior ao veredito `APTO PARA APROVAÇÃO` da rodada 2. A aprovação confirma o recorte de evidências, a exclusão de camadas adicionais de sobreposição e de recontagem local, e o processamento esperado como indeterminado. Cobre a publicação da PR documental do lote do ciclo e, após sua integração e confirmação dos payloads, a criação das issues; não autoriza merge ou implementação de entregas.

## Problema e contexto

Ideação: _project/ideations/002_validacao_arquitetura.md

## Objetivo

Produzir uma avaliação rastreável de capacidade, custo zero e alternativas de arquitetura para um protótipo de um usuário, em Mato Grosso, com até dois anos de dados e atualização sob demanda. A avaliação deve explicitar o que a documentação sustenta, o que depende de premissas e o que exigiria prova técnica posterior, permitindo ao responsável decidir se há base suficiente para planejar a fundação.

O resultado é um parecer documental. Concluir que uma opção não atende ou que a evidência é insuficiente também atende ao ciclo, desde que os impedimentos sejam demonstrados. Não se exige uma recomendação positiva nem se aprova uma arquitetura definitiva neste plano.

O recorte proposto limita-se a focos e limites IBGE; camadas adicionais de sobreposição e seleção de áreas ficam explicitamente excluídas desta avaliação. Sem prova posterior, duração e consumo de processamento permanecem indeterminados. O parecer e a atualização da KB-003 devem declarar esses limites no título da conclusão e não poderão afirmar compatibilidade global da arquitetura com o produto. Esta delimitação é proposta do plano para revisão e aprovação; não é uma nova decisão ambiental atribuída ao responsável.

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
- Dimensionar ou validar camadas adicionais de sobreposição. Sua exclusão impede generalizar a conclusão para a seleção de áreas ou para o conjunto do produto; inclusão e escolha de camadas dependem de decisão explícita do responsável.
- Ler ou recontar os arquivos de `local/prova-dados/brutos/`, mesmo quando públicos na origem. Esta v2 mantém o limite documental; o pedido de correção não é tratado como autorização para reprocessamento local.
- Ler `local/brainstorm/`, `local/prototipo/` ou dados privados; transportar identidades, contatos, dados restritos ou segredos para qualquer artefato.
- Adotar arquitetura definitiva, alterar requisitos das ADRs, reservar ciclo futuro, criar backlog sem pedido ou lançar release de produto.

## Decisões e autoridades

As autoridades são `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, ADR-001 a ADR-004, KB-003 e a ideação. Fontes externas informam a avaliação; não alteram decisões locais. O plano usa integralmente `.agent/templates/plano_implementacao.md`; relatórios de pesquisa são evidências auxiliares, não novas autoridades.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Autorizar rascunho — "autorizo o rascunho do plano do ciclo 002" | Ideação registrada e decisões do responsável acessíveis | Redação local da v1 e reconciliação de `cycles.md`; autorização recebida em 2026-11-05 | Revisão formal, aprovação, publicação ou execução das entregas | Ideação, recorte A1 e restrição de custo zero |
| Aprovar plano — "aprovo o plano do ciclo 002" | Revisão formal com veredito apto e manifestação humana posterior | Escopo documental, publicação da PR do plano com a ideação ainda local, criação das issues após integração e confirmação de payload; encerramento após entregas integradas | Merge, implementação de qualquer issue, arquitetura definitiva, serviços ou gastos | Versão, veredito, ressalvas e premissas; exclusão de camadas adicionais e de recontagem local; processamento esperado como indeterminado sem prova posterior, impedindo compatibilidade global |
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
- Conferir a propagação dos três conjuntos persistidos e de cada recurso material desconhecido até o parecer. Uma cota conhecida sem demanda quantificada continua indeterminada. Compatibilidade de armazenamento ou tráfego não substitui a avaliação de processamento; toda conclusão parcial deve identificar recurso, conjunto de detecções e cenário.
- Gates locais de cada PR e do rascunho: `node --test scripts/validate-governance.test.mjs`, `node scripts/validate-governance.mjs`, `git diff --check` e `git status --short`, com Node.js 24 e sem `npm install`.
- Scripts e método do ciclo 001 não serão alterados; seus testes de aplicação não são necessários para estas entregas documentais. Não existem build, lint de aplicação, banco ou E2E pertinentes ao escopo.
- Antes de publicar: revisar staging seletivo e G3, executar gates e conferir os checks reais da PR. Aprovação humana, elegibilidade de conta e desempenho não são provados pelo validador.

## Itens de implementação

### Item 1 — Cenários e dimensionamento documental

**Contexto:** Um usuário e uma janela de até dois anos não determinam sozinhos volume, tráfego ou tempo de processamento; o recorte municipal não representa o estado.

**Ação técnica:** Criar `002_research_cenarios.md` com inventário inicial restrito às fontes do ciclo 001 (focos INPE e limites IBGE; FIRMS somente como referência auxiliar, sem presumir ingestão permanente). Qualquer camada adicional será lacuna ou proposta, não requisito. Descrever carga inicial, consulta territorial e temporal, atualização sob demanda e retenção de até dois anos. A data final da janela permanece variável; não converter o teto de dois anos em período calendário aprovado.

Modelar separadamente três hipóteses de conjuntos persistidos, cruzadas com as frequências e cargas dos cenários:

| Conjunto persistido | Hipótese de sensibilidade, sem escolha operacional |
| :-- | :-- |
| Somente série principal | Registros INPE de `AQUA_M-T` |
| Série principal e VIIRS | `AQUA_M-T` mais `NPP-375`, `NPP-375D`, `NOAA-20` e `NOAA-21`, como séries distintas, sem consolidar detecções em eventos |
| Todos os satélites | Todos os valores de satélite disponíveis na fonte/versão identificada, mantendo registros e proveniência |

O ciclo 001 definiu a série principal da prova, não a política de persistência do protótipo. A escolha para uma fundação pertence ao responsável e não será feita pelo agente. Como ilustração limitada a Colniza no trimestre da prova, a seção 3 do relatório registra 824 na principal, 16.860 em VIIRS e 29.735 em todos os satélites; principal mais VIIRS soma 17.684. Esses números mostram sensibilidade à escolha, não projetam MT nem dois anos. Os três conjuntos devem permanecer identificados nos cálculos, lacunas e resultados dos itens 2 e 3, sem selecionar um silenciosamente.

Modelar registros, bytes brutos e persistidos, índices/geometrias, agregados, cópias de trabalho/recuperação, tráfego, requisições e duração ainda desconhecida. Usar estatísticas/metadados oficiais acessíveis sem conta e evidências versionadas do ciclo 001; não acessar brutos privados nem extrapolar Colniza linearmente para MT. Onde não houver evidência, fornecer intervalo justificado ou variável sem valor.

Evidências admitidas para essa entrega, depois da autorização da issue:

| Evidência | Limite de uso |
| :-- | :-- |
| Metadados de arquivos públicos por HEAD, tamanho e leitura parcial de cabeçalho | Admitidos sem conta/credencial. Leitura parcial somente se o servidor respeitar o recorte solicitado; não baixar a base completa se ignorar Range. Registrar URL, data, recorte e bytes efetivamente consultados. Cabeçalho não comprova contagem estadual. |
| Estatísticas oficiais públicas do INPE por estado, mês e satélite | Admitidas com fonte, data, unidade e critérios publicados. Conferir se território, satélites, janela e versão correspondem ao cenário; incompatibilidades permanecem lacunas. |
| Relatório e manifesto versionados do ciclo 001 | Admitidos como evidência histórica do recorte e da proveniência; não estimar proporção MT/Brasil por uma amostra municipal. |
| Nova contagem dos brutos em `local/prova-dados/brutos/` | Excluída nesta proposta; nenhuma nova decisão humana a autorizou. Se necessária, apresentar protocolo e pedir decisão antes de alterar o plano ou ler os arquivos. |

Ausência de estatística adequada implica intervalo justificado ou valor desconhecido e limita a conclusão. Não preencher a lacuna executando recontagem local, benchmark ou download em massa. A aprovação futura deste plano confirma esse recorte de evidências; não há registro de resposta humana nova sobre os brutos.

Documentar relações como armazenamento total = dados + índices + geometrias + agregados + cópias; tráfego mensal = carga inicial no mês + atualizações + respostas por consulta; consumo de processamento = execuções × recurso por execução. Distinguir limites de banco, storage e outros serviços e não somar ou comparar unidades incompatíveis. Evitar dupla contagem de geometria já embutida nos dados. A retenção de dois anos não limita automaticamente dados temporários ou backups.

Comparar atualização esporádica, semanal e diária como hipóteses de sensibilidade, sem assumir frequência escolhida. Quantidade de consultas, tamanho das respostas, tempo aceitável, disponibilidade e recuperação serão variáveis; explicitar que um usuário pode gerar muitas requisições. Para cada entrada registrar unidade, fonte/data, recorte, hipótese e confiança.

**Critérios de aceite:**

- [ ] Cenários respeitam um usuário, MT, até dois anos e atualização sob demanda; todas as frequências e cargas propostas estão rotuladas como hipóteses.
- [ ] Os três conjuntos persistidos (somente principal; principal e VIIRS; todos os satélites) têm dimensionamento ou lacunas separados e seguem como hipóteses para os itens 2 e 3; nenhuma escolha operacional é atribuída ao agente.
- [ ] Inventário separa fonte/camada indispensável ao cenário, referência auxiliar e expansão excluída; há proveniência e condições de uso conhecidas ou lacunas declaradas.
- [ ] Fórmulas cobrem armazenamento, tráfego, processamento e retenção, com entradas rastreáveis e limites de extrapolação; não há números estaduais apresentados como medidos sem evidência.
- [ ] Matriz de lacunas indica o efeito sobre a conclusão e como resolver cada uma documentalmente ou por prova futura, sem executar a prova.
- [ ] Cada entrada usa somente as evidências admitidas; camadas adicionais e recontagem local estão explicitamente excluídas, e a duração/consumo de processamento sem prova permanecem indeterminados.

### Item 2 — Capacidades e condições de custo zero

**Contexto:** Requisitos de provedor não demonstram que uma modalidade gratuita seja elegível ou suficiente. Preços, limites e condições devem ser verificados no momento da avaliação.

**Ação técnica:** Criar `002_research_capacidades_custos.md` após o item 1. Consultar fontes oficiais de Vercel, Supabase e Google para autenticação; incluir serviços auxiliares, bibliotecas, mapas, tiles ou execução local somente se necessários às alternativas, explicitando uso/licença e custo indireto. Nenhuma alternativa pode ocultar uma dependência paga.

Para cada serviço/funcionalidade relevante, registrar modalidade, elegibilidade e restrições de uso, unidades, limites por projeto/conta/período/região, armazenamento, transferência/egress, requisições, duração/memória/processamento, extensões geoespaciais, autenticação, inatividade/suspensão, recuperação/backups, ambientes e observabilidade. Campo não aplicável terá justificativa; campo não publicado ficará desconhecido. Verificar cartão, trials/créditos temporários, comportamento ao exceder cotas, cobrança automática e controles que impeçam custos. Não presumir que autenticação Google exige Google Maps ou que um serviço nominalmente gratuito cubra todo o fluxo.

Confrontar a demanda de cada cenário com as cotas correspondentes, registrando consumo/cota e margem quando calculáveis, incluindo picos, carga inicial e cópias. Não inventar percentual obrigatório de folga. Uso de hardware/internet existentes na opção local é premissa a confirmar, não capacidade gratuita garantida. Se depender de conta ou aceite inacessível, registrar a condição não verificada sem criar conta.

Manter os três conjuntos persistidos do item 1 em linhas separadas para cada cenário e recurso. Cota documentada não preenche demanda ausente: se registros, bytes, duração ou consumo por execução não forem estimados com evidência suficiente, classificar o recurso como indeterminado. Não calcular margem com valor fictício ou omitir o conjunto desfavorável.

**Critérios de aceite:**

- [ ] Matriz usa fontes primárias diretas com data de consulta e separa condição documentada, premissa e ponto não verificado; nenhuma cota é preenchida por memória.
- [ ] Custo zero é avaliado de ponta a ponta, incluindo excesso, inatividade, limites temporários, dependências auxiliares e exigência de cobrança/cartão.
- [ ] Cada cenário tem resultado por recurso para os três conjuntos (somente principal; principal e VIIRS; todos os satélites): cabe documentalmente, excede ou indeterminado; há memória de cálculo e conferência nos limites quando existirem números, e incógnitas materiais não são omitidas.
- [ ] Incompatibilidades e condições de parada estão explícitas; documentação não é apresentada como medição de desempenho ou garantia de gratuidade futura.

### Item 3 — Alternativas arquiteturais, acesso e parecer

**Contexto:** O responsável precisa compreender onde os dados ficam e são processados, o que pode ficar gratuito e quais evidências faltam antes de autorizar uma fundação.

**Ação técnica:** Criar `002_research_arquitetura.md` após os itens 1 e 2. Comparar pelo menos estas alternativas candidatas, descartando com evidência as incompatíveis: processamento local sob demanda com publicação futura de resultados mínimos; processamento no Supabase, avaliando PostGIS e lotes; processamento em funções Vercel com persistência no Supabase. Todas preservam Vercel, Supabase e login Google no desenho da futura aplicação; nenhuma disponibilidade ou adequação desses recursos é presumida. Alternativas não precisam ser implementáveis para merecer avaliação, mas descarte e dependências devem ser claros.

Para cada alternativa, apresentar fluxo de dados/controle, fronteiras de confiança, processamento, persistência, consulta, atualização/expiração, falha e recuperação; mapear componentes aos limites do item 2 e cenários do item 1. Avaliar framework somente no grau necessário para os fluxos e limitações, sem scaffold ou escolha definitiva. Não descrever seleção ambiental ainda inexistente como funcionalidade validada.

Descrever matriz conceitual de acesso por recurso e ação para anônimo, responsável autenticado, outro autenticado não autorizado e processo privilegiado futuro, todos como papéis de teste, não contas reais. Diferenciar dados territoriais compartilháveis de dados restritos; classificação desconhecida impede propor exposição. Registrar onde RLS é exigido, limites de segredos no cliente/servidor e riscos de funções privilegiadas. Matriz é proposta, sem políticas executadas ou isolamento comprovado.

Aplicar os seguintes critérios de conclusão por alternativa, cenário e conjunto persistido. Antes da síntese, listar cada recurso material (armazenamento, tráfego, processamento, acesso e dependências necessárias), inclusive os desconhecidos. Não restringir a análise aos cenários ou recursos quantificáveis. Incompatibilidade comprovada impede a alternativa no cenário; na ausência dela, qualquer incógnita material implica evidência insuficiente no conjunto.

| Resultado | Condição |
| :-- | :-- |
| Candidata documentalmente compatível | Todos os recursos materiais do cenário/conjunto avaliado têm demanda e condições suficientemente documentadas, sem incógnita material, e atendem aos limites, custo zero e acesso. Esta v2 não espera alcançar esse resultado no conjunto porque duração e consumo de processamento não serão medidos; evidência parcial não supre essa falta. |
| Incompatível no cenário avaliado | Pelo menos um requisito necessário viola limite, condição de gratuidade, acesso ou dependência demonstrada; identificar qual, sem contratar solução paga. |
| Evidência insuficiente | Qualquer recurso material sem quantificação ou condição verificada impede concluir compatibilidade no conjunto. Declarar o recurso indeterminado, sua pergunta e a evidência necessária. Sem prova posterior, processamento permanece indeterminado, mesmo que armazenamento e tráfego caibam. |

Resultados positivos parciais serão apresentados somente como compatibilidade documental do recurso explicitado, por cenário e conjunto persistido. O título da conclusão, tanto no relatório quanto na atualização da KB-003, deve trazer: "Avaliação documental de focos e limites IBGE, sem camadas adicionais de sobreposição; duração e consumo de processamento indeterminados". O corpo identifica cada conjunto avaliado e cada resultado parcial. Nenhuma síntese pode promover essa evidência a compatibilidade global do protótipo ou à viabilidade da seleção de áreas; camadas adicionais permanecem sem avaliação.

Se todas forem incompatíveis ou indeterminadas, relatar esse resultado e as decisões que cabem ao responsável. Uma preferência técnica será apenas recomendação condicionada, sem novo ADR de arquitetura aceita. Propor provas futuras apenas para lacunas materiais: pergunta, dado fictício/público adequado, ambiente, comando/protocolo sugerido, métricas, referências independentes, critérios de aceite, limites de custo e autorização necessária. Não executar essas provas neste ciclo. Atualizar a KB-003 no trecho de estado/limites e próximos passos, sem transformar hipóteses em requisitos aprovados.

**Critérios de aceite:**

- [ ] As três alternativas estão comparadas ou descartadas por cenário e por cada um dos três conjuntos persistidos, com ligação às cotas, condições e riscos; todos os custos/dependências necessários estão expostos.
- [ ] Fluxos e matriz proposta contemplam acesso permitido/negado, RLS, dados compartilhados/restritos e segredos; não há alegação de segurança testada.
- [ ] Parecer distingue compatibilidade documental, incompatibilidade e insuficiência, sem inferir desempenho estadual ou escolher método ambiental.
- [ ] Incógnita de recurso material impede compatibilidade no conjunto; o título da conclusão e a KB-003 explicitam o recorte de focos/limites, exclusão de camadas adicionais e processamento indeterminado. Resultado positivo de recurso isolado não é generalizado para a arquitetura.
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
- Operações de GitHub seguem as autoridades e instruções vigentes do responsável; este plano não define ordem de ferramentas nem transforma disponibilidade de conector em regra ou estado do projeto.

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
| PR(s) | [#11 — ideação e plano](https://github.com/EuThiagoAndrade/rastro-quente/pull/11), aberta; integração pendente |
| Branch(es) | `chore/cycle-002-plan`, derivada da ideação local em `97d7e7676c03aef306ca4978e249abc2e9eb7395` |
| Destino após conclusão | `_project/executed/002_validacao_arquitetura/002_plan.md` |

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 002 (completo)
Quem: Responsável
Conferir: Checks e diff da PR https://github.com/EuThiagoAndrade/rastro-quente/pull/11
Diga: "aprovo o merge da PR #11"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 002 + atualizar_docs + aprovacao_publicacao_plano + v2@25ea623eec58ffafaffc537e7f9ce40f7d379cfe` (origem revisada com SHA-256 `fb4e94afc195af1978c2c2805ea37d3d7db8d239bcc6ad526a506e98590902ab`).
- `effect_class`: `remote_mutation`
- `state_before`: plano v2 em `Em Revisão`, rodada 2 registrada como alteração local preexistente, veredito `APTO PARA APROVAÇÃO`, aguardando aprovação humana; somente o plano modificado em `chore/cycle-002-plan`; ciclo 002 em `Planejamento`.
- `state_after`: plano v2 `Aprovado` por manifestação posterior ao parecer; lote documental publicado na PR #11 de `chore/cycle-002-plan` para `main`, aguardando merge; ciclo permanece em `Planejamento`; nenhuma issue ou implementação iniciada.
- `result`: `executed`
- `evidence`: manifestação humana literal "Aprovo o plano do ciclo 002" em 2026-11-05; veredito apto da rodada 2 preservado; repositório privado e base `origin/main` em `28dece5b5391cc9e7176a2f8c4020f5e05c1c34a` conferidos; ausência de PR do ciclo verificada antes da criação; PR real https://github.com/EuThiagoAndrade/rastro-quente/pull/11 criada após publicar o commit de aprovação `f178cca`; lote limitado à ideação, plano e registro do ciclo; 55 testes passaram, validador sem erros/avisos e diff sem erros; revisões preservadas integralmente por conferência de hash.
- `blockers`: nenhum para a publicação realizada; integração depende de checks verdes e "aprovo o merge da PR #11". Issues dependem da integração documental e da confirmação dos payloads; nenhuma implementação está autorizada.

A subseção abaixo é a evidência do rascunho (`rascunhar_plano`, v1), preservada sem alteração.

### Validação local do rascunho

- Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, sem falhas.
- `node scripts/validate-governance.mjs`: zero erros e zero avisos; nove itens de conferência manual, sem alegação de validação remota ou de aplicação.
- `git diff --check`: sem erros. Conferência manual de escopo, autorização, G3, referências existentes e coerência do próximo passo realizada; somente plano e linha do ciclo alterados.
- `gh pr list` confirmou a integração da PR #10 e ausência de PR do ciclo 002; nenhum efeito remoto executado. Não há issue, task de implementação ou veredito de revisão a conferir nesta etapa.
- Backlog não selecionado nem alterado; fila e publicação de backlog não auditadas. Contrato visual e exclusão remota Vercel permanecem fora do escopo.

## Revisão crítica

### Rodada 1

**Data:** 2026-11-05.

**Autor:** Codex (GPT-6), conforme declarado no rascunho v1; o commit `5b50791` não traz trailer de coautoria.

**Revisor:** Claude Code, modelo Opus 5.5 (`claude-opus-5-5`).

**Base revisada:** `v1` no commit `5b50791efb53f71c72070ef145694060a2b63194`, branch local `chore/cycle-002-plan`, árvore limpa. Não havia rodada anterior. Conferidos `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, a ideação, ADR-002, KB-003, os workflows `revisar_plano`, `rascunhar_plano` e `criar_issues`, o template `plano_implementacao`, o relatório `001_research_viabilidade.md` e `scripts/prova-dados/fontes.json`. Nenhuma documentação externa de provedor foi consultada: cotas e preços não são fatos desta revisão.

#### R1-1 — Bloqueador: o critério de compatibilidade ignora o que não for quantificado

No item 3, "candidata documentalmente compatível" exige que os "cenários quantificáveis" caibam nas condições verificadas. Dois componentes materiais não serão quantificados pelo próprio desenho do plano:

- **duração e recurso de processamento:** benchmarks e provas estão fora do escopo, e o item 1 já registra a duração como "ainda desconhecida". A fórmula `execuções × recurso por execução` não terá valor;
- **camadas de sobreposição:** o inventário do item 1 fica restrito a focos INPE e limites IBGE. A KB-003 descreve o produto como análise de detecções e "sobreposições" para seleção de áreas, e mantém as fontes em aberto.

Com o texto atual, uma alternativa pode sair "compatível" porque armazenamento e tráfego de focos cabem, enquanto o que decide a viabilidade fica sem número. Isso conflita com o objetivo, que é permitir decidir se há base para planejar a fundação, e com a regra de não converter desconhecido em compatibilidade.

Corrigir de modo que:

1. o recurso material sem quantificação produza "evidência insuficiente" naquele recurso, e a alternativa não possa ser classificada como compatível no conjunto enquanto isso persistir; ou o parecer declare, no título da conclusão e na KB-003, o recorte exato a que a compatibilidade se refere (por exemplo, "focos e limites municipais, sem camadas de sobreposição e sem duração de processamento medida");
2. a inclusão de camadas de sobreposição no cenário do protótipo apareça como pergunta ao responsável, a responder antes da aprovação ou registrada como exclusão explícita com seu efeito na conclusão. O agente não escolhe camadas;
3. a linha "Aprovar plano" da tabela de pontos de aprovação, em "Conferir", avise que o resultado esperado para processamento é "indeterminado" sem prova posterior, para que a aprovação seja informada.

#### R1-2 — Bloqueador: o conjunto de detecções persistido não é variável do dimensionamento

A escolha de quais detecções guardar muda o volume em mais de uma ordem de grandeza. No relatório do ciclo 001 (seção 3), em Colniza, de agosto a outubro: série principal `AQUA_M-T` com 824 registros; VIIRS com 16.860 (soma de SNPP, NOAA-20 e NOAA-21); todos os satélites com 29.735, cerca de 36 vezes a série principal. Os três CSV mensais nacionais somam 370.881.654 bytes (`fontes.json`), com todos os satélites.

A decisão D1 do ciclo 001 fixou `AQUA_M-T` como série principal e VIIRS e todos os satélites como contagens auxiliares. Ela vale para a prova; não diz o que o protótipo deve persistir. O item 1 fala em "preservar o método" e em modelar registros e bytes, mas não declara essa variável. Quem executar o item teria de escolher sozinho, e essa escolha é de método (G1): pertence ao responsável.

Corrigir o item 1 para modelar, como hipóteses de sensibilidade, pelo menos três conjuntos persistidos (somente a série principal; principal e VIIRS; todos os satélites), levar o resultado de cada um aos itens 2 e 3 e registrar que a escolha para a fundação é decisão do responsável. Os mesmos três conjuntos devem entrar nos critérios de aceite dos itens 1 e 2.

#### R1-3 — Ressalva: fontes de evidência admitidas para o volume de MT estão ambíguas

O item 1 proíbe "acessar brutos privados", baixar bases "em massa" e "reprocessar a prova do ciclo 001", e admite "estatísticas/metadados oficiais acessíveis sem conta". Não fica claro se valem:

- leituras de metadados de arquivos públicos (HEAD, tamanho, leitura parcial do cabeçalho), como as feitas na revisão do ciclo 001;
- estatísticas públicas de focos por estado, mês e satélite publicadas pelo INPE;
- uma contagem somente de MT sobre os três meses já baixados em `local/prova-dados/brutos/`. Esses dados são públicos na origem, mas estão em `local/`, e a contagem pode ser lida como "reprocessar a prova".

A terceira opção daria a melhor proporção MT/Brasil disponível sem download novo. Ela toca `local/` e muda o que o item 1 pode afirmar, por isso cabe ao responsável. Explicitar quais dessas evidências são admitidas e, para a terceira, registrar a decisão. Sem isso, o item 1 tende a ficar só em intervalos, o que é aceitável desde que seja uma escolha declarada.

#### R1-4 — Ressalva: regra dependente de ferramenta em "Dependências e blockers"

O último item afirma que o MCP GitHub Docker retornou `401` e que "futuras ações devem tentar novamente o MCP preferencial antes de usar fallback disponível". Isso cria uma regra operacional ligada a uma ferramenta e a um estado de sessão. O `.agent/ai_behavior.md` determina o uso de `gh` para issues, PRs e checks, diz que nenhuma regra depende de recurso de uma ferramenta específica e não reconhece memória de ferramenta como fonte de estado. Remover a instrução ou trocá-la por uma referência ao uso de `gh`; o estado de conectores da sessão de autoria não é estado do projeto.

#### Itens atendidos e verificações

- Objetivo, escopo e exclusões seguem a decisão A1 e as respostas do responsável (um usuário, MT, até dois anos, atualização sob demanda, custo zero). Não há implementação, conta, deploy, gasto, arquitetura definitiva ou regra ambiental antecipados. Admitir parecer negativo ou insuficiente como resultado válido está correto.
- Nível completo, modo contínuo `—`, três issues sequenciais com dependência de integração, PR documental sem issue, encerramento em PR própria sem issue recursiva e uma aprovação de merge por PR estão coerentes com `_project/README.md`. O ponto "Aprovar plano" cobre publicação documental, criação das issues após integração e confirmação do payload, e encerramento, como prevê o fluxo completo.
- G1, G2 e G3 como `Sim` e G4 como `Não` estão justificados. A matriz de acesso do item 3 prevê casos negados e a classificação desconhecida impedindo exposição. Nenhum dado pessoal, credencial ou material privado foi encontrado no texto; nenhum arquivo de `local/` foi lido nesta revisão.
- Fatos conferidos: commits `1efcf80`, `97d7e76` e `5b50791` na branch local; base `28dece5` em `main`; PR #10 integrada em 2026-11-04 e nenhuma PR do ciclo 002 (`gh pr list`, somente leitura); o relatório do ciclo 001 ainda traz `Rascunho` no cabeçalho, como o plano afirma; as seções 8 a 11 citadas existem.
- O campo `Autorização do rascunho` no cabeçalho não existe no template. No ciclo 001 a mesma informação ficou num parágrafo abaixo do cabeçalho. A diferença não torna o plano incompatível com o template e o validador a aceita; não é achado.
- Validações locais após registrar esta rodada: Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes aprovados, zero falhas; `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais; `git diff --check`: sem erros; `git status --short`: somente este plano modificado, sem staging. Diff restrito a status, revisão e veredito, blocos de próximo passo e handoff, e esta seção. Os gates verificam estrutura; não resolvem os bloqueadores deste parecer.

**Veredito:** `REQUER NOVA RODADA` — corrigir R1-1 e R1-2, responder R1-3 e R1-4, preservar esta rodada e incrementar a versão. As perguntas de R1-1 (camadas de sobreposição) e R1-3 (evidência admitida) são do responsável e podem ser respondidas durante a correção. Nenhuma aprovação, publicação, issue ou implementação foi realizada.

### Resposta do autor à rodada 1 — v2

**Data:** 2026-11-05. **Autor:** Codex (GPT-6). **Autorização:** "Corrija o plano", referente ao ciclo 002. A rodada 1 e seu veredito permanecem preservados; estas respostas não constituem nova revisão ou aprovação.

- **R1-1 — Corrigido pelo autor, sujeito à rodada 2.** Objetivo, pontos de aprovação, estratégia de testes e item 3 passam a impedir compatibilidade no conjunto quando houver recurso material desconhecido. O resultado esperado para processamento é indeterminado sem prova posterior. Conclusões parciais devem identificar recurso, cenário e conjunto; o título da conclusão e a KB-003 devem declarar o recorte e seus limites. Camadas adicionais de sobreposição ficam explicitamente excluídas da proposta de avaliação, com a consequência de não concluir sobre seleção de áreas ou produto completo. Isso usa a alternativa de exclusão explícita admitida pelo achado, sem escolher camadas ou atribuir resposta nova ao responsável. A aprovação futura do plano deverá conferir esse limite.
- **R1-2 — Corrigido pelo autor, sujeito à rodada 2.** Item 1 define os três conjuntos como hipóteses: somente `AQUA_M-T`; principal e VIIRS; todos os satélites. Itens 2 e 3 e critérios de aceite preservam cada conjunto até o parecer. A ilustração de Colniza distingue VIIRS (16.860) de principal mais VIIRS (17.684) e não é extrapolada. A política de persistência operacional permanece decisão do responsável.
- **R1-3 — Corrigido por delimitação explícita, sujeito à rodada 2.** Item 1 admite metadados públicos (HEAD, tamanho e cabeçalho parcial sob recorte respeitado), estatísticas oficiais INPE e evidência já versionada, sempre com proveniência. A recontagem dos arquivos locais permanece excluída, preservando o limite documental da v1; não houve concessão adicional nem leitura desses arquivos nesta correção. Em vez de atribuir uma decisão humana inexistente, o plano declara a proposta, aceita intervalos/incógnitas e identifica a decisão necessária caso se queira ampliar a evidência. A aprovação futura poderá confirmar o recorte; alteração material exige decisão explícita antes de mutação.
- **R1-4 — Corrigido pelo autor, sujeito à rodada 2.** Removidas a ocorrência transitória de credenciais e a instrução de repetir tentativas de conector de "Dependências e blockers". O plano referencia as autoridades e instruções humanas vigentes, sem criar ordem própria de ferramentas. A preferência explícita do responsável pelo MCP disponível continua válida na sessão; não é substituída por regra criada neste plano.

**Validação da correção:** `node --test scripts/validate-governance.test.mjs`: 55 testes passaram, zero falhas. `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove itens de conferência manual. `git diff --check`: sem erros. Conferidos escopo, G3, autorização e próximo passo; somente o plano e a referência de versão em `cycles.md` alterados. Texto original da rodada 1 preservado integralmente, com SHA-256 `d9e0ce556fe85075a7ddc83958dad253e21590b886609761587fa2f52367e8c1` idêntico antes/depois. Consulta somente leitura de PRs por `gh`, após falha de credenciais do MCP, não encontrou PR do ciclo 002. Nenhuma fonte de provedor, base local, prova técnica, conta ou serviço foi usada para executar as entregas do ciclo; a revisão formal da v2 permanece pendente.

### Rodada 2

**Data:** 2026-11-05.

**Autor:** Codex (GPT-6), conforme a resposta do autor à rodada 1; o commit `25ea623` não traz trailer de coautoria.

**Revisor:** Claude Code, modelo Opus 5.5 (`claude-opus-5-5`), o mesmo da rodada 1.

**Base revisada:** `v2` no commit `25ea623eec58ffafaffc537e7f9ce40f7d379cfe`, branch local `chore/cycle-002-plan`, árvore limpa. O diff `5b50791..25ea623` altera somente este plano e a linha do ciclo 002 em `_project/cycles.md`. A rodada 1 está preservada com o texto registrado pelo revisor.

#### Conferência dos achados da rodada 1

| Achado | Situação | Evidência na v2 |
| :-- | :-- | :-- |
| R1-1 | Resolvido | O item 3 lista todos os recursos materiais antes da síntese, inclusive os desconhecidos. A ordem é incompatibilidade, depois evidência insuficiente, depois compatibilidade, e qualquer incógnita material impede compatibilidade no conjunto. Camadas adicionais ficam excluídas com efeito declarado (Objetivo e Fora do escopo). O título obrigatório da conclusão vale para relatório e KB-003, e a linha "Aprovar plano" avisa que o processamento é esperado como indeterminado. A exclusão explícita era uma das saídas admitidas pelo achado. |
| R1-2 | Resolvido | Tabela com três conjuntos persistidos no item 1, levados em linhas separadas ao item 2 e por conjunto ao item 3, com critérios de aceite nos três itens. Os valores de Colniza conferem com a seção 3 do relatório do ciclo 001 (824 + 16.860 = 17.684). Os identificadores `NPP-375`, `NPP-375D`, `NOAA-20` e `NOAA-21` são os de `scripts/prova-dados/casar.mjs`. A escolha operacional permanece do responsável. |
| R1-3 | Resolvido | Tabela de evidências admitidas no item 1. A recontagem de `local/prova-dados/brutos/` está excluída e aparece também em "Fora do escopo"; a aprovação confirma esse recorte. A consequência (intervalos ou valores desconhecidos) está declarada. |
| R1-4 | Resolvido | A regra de ordem de conectores saiu de "Dependências e blockers"; o plano remete às autoridades vigentes, que prescrevem `gh`. |

Os bloqueadores caíram de dois para zero e nenhum achado corrigido reapareceu. A regra de progresso está atendida.

#### Achados novos

Nenhum bloqueador ou ressalva.

#### Itens atendidos e verificações

- As correções não ampliaram o escopo: nenhuma fonte, camada, prova, conta, leitura de `local/` ou regra ambiental foi acrescentada. As exclusões novas reduzem o que o ciclo pode afirmar e estão expostas para a aprovação.
- Com os critérios da v2, o resultado previsível para todas as alternativas é "evidência insuficiente" no conjunto, com compatibilidade parcial por recurso e protocolos de prova futura. O Objetivo já admite esse desfecho, e a linha "Aprovar plano" o põe em "Conferir". A aprovação deve ser dada sabendo disso.
- O cabeçalho registra a correção como "Corrija o plano". A frase canônica da situação é "corrija o plano do ciclo 002". O autor registrou o pedido literal com o alvo; a intenção é inequívoca no contexto, e a autenticidade das frases continua conferência manual.
- A linha do ciclo 002 em `_project/cycles.md` diz "aguardando rodada 2". O revisor não altera esse arquivo; o próximo workflow mutante (aprovação ou publicação documental) deve atualizar a descrição.
- G1 a G4 sem mudança de aplicabilidade. Nenhum dado pessoal, credencial ou material privado no diff; nenhum arquivo de `local/` foi lido nesta revisão.
- Validações locais após registrar esta rodada: Node.js `v24.15.0`; `node --test scripts/validate-governance.test.mjs`: 55 testes aprovados, zero falhas; `node scripts/validate-governance.mjs`: zero erros, zero avisos e nove conferências manuais; `git diff --check`: sem erros; `git status --short`: somente este plano modificado, sem staging. Diff restrito aos campos de revisão e veredito, aos blocos de próximo passo e handoff e a esta rodada.

**Veredito:** `APTO PARA APROVAÇÃO`. O veredito não é aprovação. A aprovação exige manifestação humana posterior ("aprovo o plano do ciclo 002"), que confirma também o recorte de evidências, a exclusão de camadas adicionais e de recontagem local, e o processamento esperado como indeterminado. Nenhuma aprovação, publicação, issue ou implementação foi realizada.

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`. Nenhuma exceção do bootstrap se aplica ao ciclo `002`.
