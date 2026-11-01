# Plano de implementação — Fundação da governança do Rastro Quente

> **Ciclo:** `000`
> **Status:** `Em Execução`
> **Versão:** `v4`
> **Data de criação:** 2026-10-31
> **Última atualização:** 2026-10-31
> **Autor:** Codex, nesta conversa; identificação exata do modelo não registrada
> **Tipo:** `chore`
> **Prioridade:** `P1`
> **Nível:** `completo`
> **Autorização inicial:** elaboração do plano proposta e aceita em conversa, com exigência posterior do responsável de revisão por outra LLM. Síntese do pedido, sem inventar uma frase formal de aprovação.
> **Modo contínuo:** `—`
> **Revisão formal:** `Concluída`
> **Veredito da revisão:** `APTO PARA APROVAÇÃO`
> **Aprovação humana pós-revisão:** `Aprovada em 2026-10-31 pela autorização explícita de execução local; frase exata e divergência registradas na task`
> **handoff_schema_version:** `2`

## Problema e contexto

O Rastro Quente precisa organizar o desenvolvimento antes da implementação operacional. Seu propósito é apoiar a análise territorial de detecções de calor e a seleção explicável de áreas para avaliação técnica. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração.

O responsável determinou o reaproveitamento da governança e das integrações existentes no Saldo Futuro, adaptando o necessário ao novo domínio. Também determinou uma revisão independente por uma segunda LLM depois da elaboração do plano, começando pelo ciclo `000`.

**Exceção de bootstrap proposta:** este plano antecede as regras que pretende implantar. Os procedimentos de origem e suas adaptações estritamente necessárias estão delimitados em "Operação do bootstrap até o encerramento". A intercambiabilidade, os estados e o handoff continuam os do Saldo Futuro. Não haverá ideação nem aprovação retroativa. A autorização desta correção não autoriza a implantação.

**Classificação e confirmação:** `Nível: completo` é a classificação técnica desta proposta, pois ela altera governança; não é registro de confirmação humana já ocorrida. A futura frase `aprovo o plano do ciclo 000`, posterior a parecer apto, confirmará também essa classificação e as exceções de bootstrap expressas no plano. O cabeçalho já usa os campos normais do template; este plano não será incluído em `legacyV1` nem dispensado dos controles de aprovação.

## Objetivo

Implantar uma governança local, versionável e autossuficiente, baseada no Saldo Futuro, com responsabilidades claras, rigor proporcional, revisão entre duas LLMs, evidências verificáveis e preservação dos materiais privados.

## Origem no backlog

Não se aplica. A demanda veio diretamente do responsável; ainda não há backlog formal no destino.

## Contexto e baseline

Estado observado em 31/10/2026 antes da criação deste plano:

- A raiz continha `local/`, `.gitignore` e `.vercelignore`; não havia Git inicializado, governança implantada ou aplicação operacional.
- Os materiais de brainstorm e o mockup permanecem privados em `local/`, excluídos do versionamento e dos uploads Vercel pelas regras existentes.
- Vercel, Supabase e futura autenticação Google são requisitos de destino definidos pelo responsável. Framework, capacidade, custos e arquitetura geoespacial detalhada permanecem em aberto.
- O código do Saldo Futuro contém login Google, callback, sessão, autorização e testes que podem orientar uma entrega técnica posterior. Sua existência não equivale a um teste dessas integrações neste projeto.
- O mockup anterior não é baseline de arquitetura nem implementação produtiva. Não será publicado ou promovido automaticamente por este ciclo.

### Origem fixada para reaproveitamento

Repositório de referência: `https://github.com/EuThiagoAndrade/saldo-futuro`.

Commit observado: `c31081d56d7ce0d0ff2f51de3db655f90db6b36b`.

O checkout de referência não apresentava alterações rastreadas no momento da inspeção. Na execução, conferir os arquivos no commit fixado; não copiar silenciosamente uma versão posterior. O produto final não dependerá do checkout irmão nem da presença de `local/`.

## Escopo

### Dentro do escopo

- Inventariar e adaptar autoridades, adapters de descoberta, workflows, templates, registro de ciclos, backlog e controles de governança do Saldo Futuro.
- Preservar as responsabilidades canônicas, os níveis de rigor, a separação entre revisão e aprovação e o registro verificável do próximo passo.
- Formalizar a revisão por outra LLM, começando pela revisão deste plano antes da implantação.
- Adaptar os controles ao domínio ambiental, preservando controles de acesso, privacidade e migrações quando aplicáveis.
- Adaptar o validador, seu manifesto, seus testes e os templates de GitHub ao conjunto de regras realmente adotado.
- Registrar requisitos de destino, decisões de governança e proveniência do reaproveitamento em documentos preparados para versionamento.
- Preparar a organização Git local e os arquivos de CI, com procedimento explícito para o bootstrap e para a integração posterior.
- Produzir um inventário documental dos componentes de autenticação e infraestrutura reaproveitáveis, sem implementá-los neste ciclo.

### Fora do escopo

- Implementar aplicação, autenticação, banco, PostGIS, importadores, consultas geoespaciais ou o design system definitivo.
- Copiar credenciais, ambientes, usuários, dados financeiros, históricos de execução, issues ou aprovações do Saldo Futuro.
- Configurar recursos externos, Google OAuth, Vercel, Supabase, domínio, DNS ou planos pagos.
- Criar repositório remoto, publicar arquivos, abrir issues/PRs ou fazer merge sem autorização correspondente e destino identificado.
- Alterar o Saldo Futuro ou publicar, mover ou copiar integralmente os materiais privados.
- Exigir acesso ao brainstorm para compreender ou executar o planejamento formal.

## Decisões e autoridades

### Matriz de reaproveitamento inicial

| Origem no Saldo Futuro | Tratamento proposto no Rastro Quente |
| :-- | :-- |
| `.agent/ai_behavior.md` | Preservar a organização de autoridade, autorizações, evidências e handoff; adaptar o contexto e a revisão independente |
| `_project/README.md` | Preservar ciclos, níveis, revisão, próximo passo e convenções; adaptar barreiras e explicitar o bootstrap sem GitHub configurado |
| `_project/cycles.md` e `backlog.md` | Aproveitar os formatos; iniciar estado e numeração próprios, sem copiar histórico ou demandas |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Reutilizar o padrão de descoberta e conferir a sintaxe antes de criar os adapters |
| `.agent/workflows/` e `.agent/templates/` | Reaproveitar os procedimentos pertinentes, mantendo coerência com as autoridades locais |
| Validador, manifesto e testes em `scripts/` | Adaptar o conjunto de regras e referências; não dispensar controles silenciosamente para obter aprovação |
| Templates e workflow de governança de `.github/` | Preparar arquivos locais; adaptar comandos ao tooling existente; execução remota depende de publicação autorizada |
| ADRs, KBs e lições | Registrar somente decisões, proveniência e requisitos aplicáveis ao destino; não importar afirmações de execução do projeto de origem |
| Login, callback, clientes Supabase, sessão, autorização e testes | Inventariar para fundação técnica posterior; rever semântica de acesso compartilhado versus dados por usuário |
| Regras financeiras, migrations de negócio, release e rotinas específicas do Saldo Futuro | Não transportar para este ciclo; eventual reaproveitamento futuro exige justificativa própria |

### Inventário fechado de arquivos e controles

As classificações abaixo fazem parte do escopo submetido à aprovação; não ficam a critério livre da implementação. **Adotar** mantém o papel e ajusta apenas identificação/referências; **adaptar** aplica as mudanças expressas neste plano; **adiar** significa não criar nem exigir agora; **não transportar** exclui conteúdo específico da origem. Qualquer ampliação material exige emenda, nova revisão e aprovação; correção técnica dentro deste escopo é registrada na task.

O `git ls-tree` do commit fixado contém **12 workflows**, seis templates e três skills em `.agent/`, e não 14 workflows. Todos estão classificados abaixo. O conteúdo histórico de ciclos, backlog, lições, ADRs ou KBs não é copiado como estado do destino.

| Workflow de origem | Classificação e destino no ciclo 000 |
| :-- | :-- |
| `.agent/workflows/triar.md` | Adaptar G1; manter níveis, ordem de elegibilidade e confirmação humana; referenciar a exceção nominal do bootstrap |
| `.agent/workflows/idear.md` | Adotar para ciclos futuros; não fabricar ideação 000 |
| `.agent/workflows/rascunhar_plano.md` | Adotar a redação/correção e o handoff; referenciar os campos normais e o bootstrap aprovado |
| `.agent/workflows/revisar_plano.md` | Adotar parecer no plano, papéis, vereditos, rodadas e paradas; adaptar somente referências/barreiras |
| `.agent/workflows/criar_issues.md` | Adotar para operação normal com GitHub; não executar no bootstrap |
| `.agent/workflows/implementar_issue.md` | Adaptar domínio e remeter à exceção única do ciclo 000; fora dela, issue válida continua obrigatória |
| `.agent/workflows/listar_issues.md` | Adotar, somente leitura; sem GitHub disponível, relatar impedimento sem inventar issues |
| `.agent/workflows/retomar.md` | Adaptar unicamente a observação do bootstrap antes da publicação; preservar todas as regras normais após publicação e para os demais ciclos |
| `.agent/workflows/atualizar_docs.md` | Adotar atualização na autoridade correta e encerramento prospectivo; incluir a task excepcional do bootstrap |
| `.agent/workflows/health_check.md` | Adaptar os checks ao tooling de governança e ao bootstrap; não executar testes de aplicação inexistente nem exigir consulta remota antes da publicação |
| `.agent/workflows/corrigir_trilha_curta.md` | Adotar elegibilidade e revisão; adaptar G1, preservando proibição do modo contínuo com G1/G2 |
| `.agent/workflows/gerenciar_backlog.md` | Adotar o mecanismo de origem de fila em worktree externo do **mesmo Git**, mesma trava e autorização por operação. Não criar fila nem adquirir trava neste ciclo |

**Backlog e privacidade:** preservar `local/backlog.lock/` como trava técnica efêmera, ignorada e exclusiva do operador que a criou; a governança não lê `local/brainstorm/` ou `local/prototipo/`. O worktree externo não é dependência de outro repositório. Captura/publicação seguem as precondições de main integrada e conferência remota da origem; enquanto não existirem, o backlog formal pode permanecer vazio. Não criar uma fila simplificada paralela nem usar o brainstorm como backlog implícito.

| Template/skill de origem | Classificação e destino |
| :-- | :-- |
| `.agent/templates/ideacao.md` | Adotar para ciclos futuros |
| `.agent/templates/plano_implementacao.md` | Adaptar somente domínio e referência ao bootstrap; manter campos, revisão e handoff |
| `.agent/templates/task.md` | Adaptar G1 e a referência à task excepcional do ciclo 000; manter estados e evidências |
| `.agent/templates/adr.md` | Adotar estrutura; cada decisão do destino registra origem e aceite reais |
| `.agent/templates/kb.md` | Adotar estrutura; conteúdo próprio e autossuficiente |
| `.agent/templates/backlog_item.md` | Adotar IDs, campos, estados e semântica da origem |
| `.agent/skills/governance-check/governance-check.md` | Adaptar domínio, conjunto de arquivos e exceção de bootstrap; conservar inspeção somente leitura |
| `.agent/skills/doc-updater/doc-updater.md` | Adotar atualização da menor autoridade correta e rastreabilidade |
| `.agent/skills/design-system-check/design-system-check.md` | Adiar: não há contrato visual definitivo. Remover de `requiredFiles` e dos passos obrigatórios de workflows/templates deste ciclo; planejar a retomada junto do design system |

Cada arquivo de `requiredFiles` do manifesto fixado está contemplado nas tabelas acima ou abaixo:

| Demais arquivos obrigatórios da origem | Classificação e regra no destino |
| :-- | :-- |
| `README.md` | Adaptar para produto, execução dos checks e estado real; versão mínima no commit raiz |
| `LICENSE` | Adiar: licença e visibilidade ainda não decididas; retirar de `requiredFiles` neste ciclo. Não atribuir MIT por cópia; resolver a política de publicação antes do envio remoto |
| `.gitignore` | Adaptar ao tooling e dados; preservar `/local/` ou regra equivalente comprovada, segredos, bancos locais e arquivos gerados |
| `.gitattributes` | Adotar normalização textual adequada, sem reformatação de materiais privados |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Adotar adapters mínimos; conferir sintaxe na execução; não copiar políticas para eles |
| `.agent/ai_behavior.md` | Adaptar contexto, privacidade e referência à exceção canônica; preservar precedência e handoff |
| `.agent/lessons_learned.md` | Adotar arquivo sem lições transplantadas; registrar apenas aprendizado comprovado do destino |
| `.agent/task.md` | Adotar ponte neutra, sem estado operacional ativo |
| `_project/README.md` | Adaptar domínio; única autoridade da exceção do ciclo 000 após L1; preservar situações e mecanismo de revisão da origem |
| `_project/cycles.md` | Adaptar índice para ciclo 000 no estado efetivo e próximo número 001, sem importar ciclos da origem |
| `_project/backlog.md` | Adotar estrutura vazia, sem bloco/handoff persistido e sem demandas presumidas |
| `_project/decisions/ADR-001_governanca_agnostica_adapters.md` | Adaptar para registrar a governança aprovada neste projeto |
| `_project/decisions/ADR-002_stack_infraestrutura.md` | Adaptar como `_project/decisions/ADR-002_requisitos_infraestrutura.md`: registrar somente os destinos Vercel/Supabase/Google já definidos e o que permanece em aberto, sem escolher framework/plano de serviço |
| `_project/decisions/ADR-003_acesso_privacidade_publicacao.md` | Adaptar para restrição de acesso, material local privado e publicação ainda pendente; não importar visibilidade, usuários ou autorização de publicação da origem |
| `_project/decisions/ADR-004_governanca_proporcional_niveis.md` | Adaptar domínio e registrar exceção transitória do bootstrap; conservar níveis e intercambiabilidade |
| `_project/knowledge/KB-001_proveniencia_ecossistema.md` | Adaptar com URL/commit e matriz de reaproveitamento aprovada |
| `_project/knowledge/KB-003_visao_produto_arquitetura.md` | Adaptar como `_project/knowledge/KB-003_visao_produto_requisitos.md`: síntese formal dos requisitos, sem copiar brainstorm, código do mockup ou afirmar arquitetura detalhada aprovada |
| `_project/knowledge/KB-004_regras_financeiras.md` | Não transportar; retirar de manifesto e referências obrigatórias. Regras analíticas ambientais serão tratadas no ciclo que as validar |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Adaptar domínio; preservar `[FEATURE]`, critérios e rastreabilidade |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Adaptar domínio; preservar `[FIX]` e elegibilidade da trilha curta |
| `.github/ISSUE_TEMPLATE/chore.yml` | Adotar `[CHORE]` e campos de contexto |
| `.github/ISSUE_TEMPLATE/config.yml` | Adotar configuração da origem, com referências do destino |
| `.github/pull_request_template.md` | Adaptar G1 e exceção do bootstrap sem issue; manter checks, G2–G4 e aprovação própria de merge |
| `.github/workflows/governance.yml` | Adaptar para testes/validador e migrações imutáveis; preparar localmente, sem alegar execução remota. Ausência de pasta de migrations continua válida |
| `.github/workflows/ci.yml` | Adiar CI de aplicação, Supabase e E2E; retirar de `requiredFiles`/`requiredText` neste ciclo. O workflow de governança continua obrigatório |
| `.env.example` | Adiar até a fundação técnica; retirar de `requiredFiles` neste ciclo. O `.gitignore` já deve permitir um exemplo futuro sem liberar segredos |
| `package.json` | Adaptar como tooling de governança: `name` do projeto, `private: true`, `type: module`, Node 24 ou superior e scripts `test:governance`/`check:governance` para os comandos nativos. Sem dependências, scaffold ou scripts da aplicação |
| `design-system/DESIGN.md` | Adiar contrato visual; retirar de obrigatórios neste ciclo |
| `design-system/referencia.html` | Adiar; não publicar ou promover o mockup privado como substituto |
| `design-system/assets/logo-saldo-futuro.svg` | Não transportar identidade visual da origem |
| `design-system/assets/logo-simbolo.svg` | Não transportar o símbolo da origem |
| `design-system/assets/fonts/OFL.txt` | Não transportar arquivo de licença de fonte que não será copiada; fontes serão decididas no ciclo visual |
| `scripts/governance-manifest.json` | Adaptar conforme este inventário fechado, G1–G4 e exceção estrita; `legacyV1` vazio no destino |
| `scripts/validate-governance.mjs` | Adaptar apenas consumidores afetados; preservar controles ainda pertinentes e testar cada mudança de regra |
| `scripts/validate-governance.test.mjs` | Adaptar fixtures e expectativas ao domínio e aos arquivos deste inventário; preservar regressões pertinentes |

**Demais arquivos encontrados fora de `requiredFiles`:** adiar `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json`, `CHANGELOG.md` e a automação de releases para a fundação técnica; não transportar `_project/decisions/ADR-005_graficos_svg_proprio.md`, `_project/knowledge/KB-002_operacao_producao_acessos.md`, credenciais, configurações locais, `package-lock.json`, histórico de ciclos ou dados da origem. O registro futuro de operação do Rastro Quente será próprio. Não criar `LICENSE` ou design system implicitamente para satisfazer o manifesto.

**Controles do manifesto além de `requiredFiles`:** adaptar `requiredText` aos arquivos/nomes acima e à privacidade ambiental; preservar `adapters`, `workflows`, `skills`, estados de `cycles`, `plans` e `tasks`, versão 2 de `artifacts`, rodadas, `nextStep`, `backlog`, `shortTrack` e nomenclatura da origem, acrescidos apenas das exceções exatas do bootstrap. Atualizar `siblingCheck` para incluir `saldo-futuro`; ignorar dados privados por `scanExclusions`. Preservar controles de `dataFiles`, RLS/migrations e `.gitignore` quando aplicáveis; normalizar equivalência de `/local/` e `local/` sem tornar a pasta rastreável. `designSystem` não é um requisito ativo deste ciclo: remover as exigências e chamadas obrigatórias correspondentes, com teste que passa sem a pasta e sem permitir falsas alegações de conformidade visual. Os `manualChecks` devem incluir proveniência, privacidade, autenticidade das aprovações, semântica das barreiras e a limitação da inspeção Vercel.

### Pontos de aprovação

| Ponto | Precondição | Cobre | Não cobre | Conferir |
| :-- | :-- | :-- | :-- | :-- |
| Revisão externa: `revise o plano do ciclo 000` | Versão atual disponível; situação de revisão conferida | Executar `revisar_plano` e registrar parecer | Aprovar, implementar, publicar ou reescrever o plano | Versão, handoff, referências e rodada efetivamente revisada |
| Correção: `corrija o plano do ciclo 000` | Parecer registrado e vez do autor | Responder achados e produzir nova versão | Simular revisão externa ou implantar a governança | IDs, evidências e respostas aos achados; preservação do parecer |
| Aprovação: `aprovo o plano do ciclo 000` | Parecer apto da versão atual; bloqueadores resolvidos | Aprovar o plano; confirmar nível completo, inventário e exceções nominais | Autorizar automaticamente implantação, publicação ou merge | Veredito, ressalvas, escopo, inventário e fluxo do bootstrap |
| Implantação: `autorizo a implementação local do ciclo 000` | Plano aprovado depois da revisão; limites locais conferidos | Executar os quatro itens, criar task do bootstrap, inicializar Git e produzir commits locais delimitados | Criar remoto, enviar arquivos, abrir PR ou integrar | Plano aprovado, ausência de mudanças alheias, exclusões e permissões da task |
| Publicação: autorização explícita identificando URL GitHub, visibilidade e lote | Entrega local validada; remoto vazio ou compatível comprovado; diff e lote apresentados | Enviar o commit raiz e a branch autorizados; abrir a PR do bootstrap | Forçar histórico, aceitar condições de conta, contratar serviços ou fazer merge | Proprietário/destino, visibilidade, base/tip, arquivos, ausência de `local/`, diff e payload da PR |
| Integração: `aprovo o merge da PR #N` | PR real identificada, diff revisado e checks verdes | Integrar por squash somente a PR aprovada e reconciliar evidências | Incluir outro lote, outra PR ou executar serviços de infraestrutura | Número real, tip atual, diff, checks e encerramento prospectivo |

### Operação do bootstrap até o encerramento

Esta é a única exceção nominal ao fluxo por issue. Vale exclusivamente para o ciclo `000`, em nível completo, com modo contínuo `—`. Não cria situações novas nem um segundo mecanismo de revisão. Os comandos de revisão, correção, aprovação, retomada e merge permanecem os da origem. A frase de implantação local acima é necessária porque ainda não existe uma issue; ela não será aceita como substituta de `autorizo a implementação da issue #N` nos demais ciclos.

**Procedimentos e troca de autoridade:** até o marco local L1, usar os workflows `rascunhar_plano`, `revisar_plano`, `implementar_issue`, `retomar`, `health_check` e `atualizar_docs` do commit de origem, apenas para as etapas desta tabela e com as exceções expressas abaixo. `criar_issues` não é executado no bootstrap: não há issue fictícia nem obrigação de abrir uma antes de instalar as próprias regras. Depois de L1, os workflows locais assumem; as regras locais devem conter esta mesma exceção em `_project/README.md`, referenciada pelos consumidores. Nenhum ciclo seguinte herda a dispensa de issue ou da observação remota.

**Marco L1:** todos os itens locais implementados, testes do validador e validação estrutural aprovados, staging inspecionado e entrega registrada na branch `chore/cycle-000-plan`, nesta ordem:

1. Criar o commit local **C1**, contendo a entrega técnica e a task com as evidências disponíveis até então. A task não tenta registrar o SHA de C1 dentro do próprio C1.
2. Obter o SHA real de C1 pelo Git. Atualizar **somente** `000_task_bootstrap.md` para registrar esse SHA, as evidências do marco e, se remoto/publicação ainda estiverem pendentes, o estado `Bloqueada`, a pergunta de publicação e o bloco `Parado`.
3. Reexecutar os testes do validador, a validação estrutural e `git diff --check`; conferir que o diff/staging desse registro altera apenas a task e que o SHA registrado identifica C1 na mesma branch. Se falhar, corrigir o registro e repetir as verificações, sem afirmar L1 concluído.
4. Criar o commit local documental **C2**, delimitado à task validada. Conferir que a árvore de trabalho está limpa e que C2 sucede C1. L1 só está formalizado depois de C2; C2 integra o lote que será apresentado para eventual publicação. Seu SHA não é escrito na própria task dentro de C2, evitando autorreferência e commits recursivos.

Até a formalização de L1 em C2, adapters e autoridades em preparação apontam para esta exceção e os procedimentos de origem continuam cobrindo o registro do marco. Depois de C2, os workflows locais assumem. A task referencia o commit anterior C1, nunca o próprio commit documental C2 nem seu próprio merge. L1 não significa integração nem conclusão do ciclo.

| Etapa/evento | Procedimento e autorização | Estados e artefato ativo | Situação de saída e encaminhamento |
| :-- | :-- | :-- | :-- |
| Redação, revisão e correção | `rascunhar_plano` e `revisar_plano` de origem; frases normais | Plano em `Rascunho` ou `Em Revisão`; o próprio plano é ativo | Revisão/correções conforme a rodada; veredito apto leva a `Aguardando aprovação do plano` |
| Aprovação após parecer apto | Registrar a manifestação `aprovo o plano do ciclo 000` | Plano `Aprovado`; ciclo ficará `Planejamento` quando o índice for criado; plano ativo | `Aguardando autorização de implementação`; responsável confere plano e escopo do bootstrap; frase `autorizo a implementação local do ciclo 000` |
| Início local autorizado | `implementar_issue` de origem aplicado nominalmente ao bootstrap; dispensa somente issue, PR e remoto nesta etapa | Criar `_project/drafts/000_fundacao_governanca/000_task_bootstrap.md` **antes da implementação**; task `Em andamento`, plano `Em Execução`, ciclo `Em execução` ao criar `cycles.md`; task ativa | Trabalho segue somente dentro da autorização registrada. Interrupção recuperável: `Pronto para continuar`, com `continue o ciclo 000`; ambiguidade: `Parado` |
| L1 concluído, remoto/publicação ainda não autorizados | `atualizar_docs` de origem formaliza L1 em C2; workflows locais assumem depois desse commit | Task `Bloqueada` por decisão/precondição de publicação pendente, plano `Em Execução`, ciclo `Em execução`; permanecem em `drafts/` | `Parado`; responsável define URL, visibilidade e se autoriza a publicação do lote apresentado; `Diga: sua resposta à pergunta registrada` |
| Publicação expressamente autorizada | `implementar_issue` local com esta exceção: publicar raiz/branch delimitadas e abrir PR sem issue associada | Com autorização suficiente, task volta a `Em andamento` durante a preparação; **somente depois de abrir a PR real**, passa a `Aguardando integração` e guarda PR, base/tip e checks. Falha impeditiva antes de existir PR publicada leva a `Bloqueada`, sem inventar número | `Aguardando merge` somente quando faltarem integração e sua aprovação; checks falhos ou impedimentos: `Parado`, com diagnóstico e correção delimitada |
| Preparação do encerramento na PR | `atualizar_docs` local; encerramento já coberto pelo plano aprovado | A própria PR leva os arquivos para `executed/` e estados prospectivos `Concluído`/`Concluída`; antes do merge, a situação efetiva continua determinada pela PR | `Aguardando merge`, com `aprovo o merge da PR #N` usando número real |
| Merge aprovado e verificado | `implementar_issue`/`atualizar_docs` locais; squash e reconciliação segundo a origem | Confirmar integração no GitHub e checks; não registrar SHA do próprio merge na task | `Concluído` depois de comprovar integração. PR fechada sem merge, divergência ou falha de evidência: `Parado` |

**Git e publicação inicial:** após a autorização de implantação, inicializar `main` local e criar um commit raiz contendo somente `README.md` mínimo, `.gitignore`, `.vercelignore` e `.gitattributes`, todos inspecionados. Criar `chore/cycle-000-plan` a partir dele para a governança, plano e task. Os registros que existirem antes da inicialização são preservados e incluídos somente na branch da entrega. Não fazer push neste momento. Quando houver autorização de publicação para um remoto vazio e verificado, enviar o commit raiz e a branch delimitados e abrir a PR da governança. O envio direto do commit raiz é a única exceção à exigência de PR e deve constar do pedido de publicação; o restante integra por PR com aprovação de merge. Remoto com histórico incompatível, arquivos alheios ou visibilidade não conferida leva a `Parado`, sem sobrescrever ou forçar histórico.

**Task do bootstrap:** derivada de `.agent/templates/task.md`, com ciclo `000`, trilha `normal`, issue `— (exceção de bootstrap do ciclo 000)`, plano, branch, estado, integração, autorização real, modo contínuo, barreiras G1–G4, execução, evidências, decisões, encerramento, próximo passo e handoff versão 2. `.agent/task.md` continua uma ponte neutra, nunca uma segunda fonte de estado. O nome `000_task_bootstrap.md` será permitido por uma lista fechada de dois caminhos (em `drafts/` e `executed/` deste ciclo) no manifesto e no validador; não por uma regex genérica nem por `legacyV1`.

**Retomada sem remoto:** antes de L1, observar este plano e a task, se criada; depois de L1, observar também `cycles.md`, Git local e o registro de integração da task. Enquanto a task declarar a integração pendente e não houver publicação autorizada, `retomar` não consulta um GitHub inexistente nem presume PRs: apresenta o bloco local, sem despachar efeitos remotos. Se a situação for `Parado`, preserva a pergunta. Após publicação, volta a consultar PR/checks e aplicar as regras ordenadas normais. Para qualquer outro ciclo, falta de acesso ao GitHub continua um bloqueio, como na origem.

**Compatibilidade dos blocos:** as situações, alvos e valores de `Quem` continuam os da tabela de origem. A única variação de `Aguardando autorização de implementação` neste bootstrap troca `Conferir: Issue e escopo` por `Conferir: Plano aprovado e escopo do bootstrap local` e aceita a frase de implantação local. Manifesto e validador devem aceitar a variação somente nos caminhos exatos deste plano/task, com ciclo `000`, nível completo e modo contínuo desativado. Nos demais casos, rejeitá-la. `Parado`, `Pronto para continuar`, revisão, correção e merge usam os blocos normais, sem variantes.

**Encerramento:** enquanto não houver remoto e integração real, o ciclo pode terminar sua preparação local, mas não será marcado como concluído. O estado prospectivo da PR de encerramento segue a regra do Saldo Futuro; isso substitui a formulação anterior que só permitia mover arquivos depois do merge, incompatível com uma PR atômica de encerramento.

### Revisão formal e intercambiabilidade — padrão do Saldo Futuro

O mecanismo é o já definido em `.agent/workflows/revisar_plano.md`, na seção `Revisão formal` de `_project/README.md` e no contrato de handoff versão 2 de `.agent/ai_behavior.md` da origem. O plano é o artefato ativo compartilhado entre ferramentas; não há roteiro paralelo, conversa obrigatória ou arquivo adicional de revisão. Autor e revisor são papéis da etapa, não papéis permanentemente vinculados a um fornecedor.

1. O responsável leva a vez a um revisor, que pode ser outra ferramenta, e usa a frase **`revise o plano do ciclo 000`**. Neste ciclo, a escolha de uma segunda LLM é uma determinação expressa do responsável.
2. A ferramenta receptora confere o repositório, ciclo, versão, handoff, situação e autorização antes de mutar. Lê este plano, o template e os procedimentos de origem fixados nas Referências enquanto os equivalentes locais não existirem. Ausência de referência obrigatória ou estado contraditório é bloqueio; não autoriza improvisar um protocolo.
3. Ao iniciar a revisão de um `Rascunho`, o workflow altera o status para `Em Revisão`. Registra cada parecer em `## Revisão crítica`, numa subseção **`### Rodada N`**, com `Autor:` e `Revisor:` (ferramenta e modelo), achados **`RN-k`**, classificação bloqueador/ressalva, itens atendidos e veredito. Informações não disponíveis devem ser declaradas, sem inventar a identificação do modelo.
4. Os vereditos permanecem **`APTO PARA APROVAÇÃO`**, **`APTO COM RESSALVAS`** ou **`REQUER NOVA RODADA`**. O revisor não reescreve o plano, não o aprova e não implementa; atua na seção de revisão e nos campos de status e veredito, com a atualização de saída prevista pelo próprio workflow.
5. O responsável leva a vez ao autor com **`corrija o plano do ciclo 000`**. A ferramenta designada para a autoria responde a cada achado como corrigido ou contestado com justificativa, incrementa a versão, preserva as rodadas anteriores e mantém `Em Revisão`. Uma nova ferramenta pode assumir esse papel lendo os mesmos artefatos.
6. A revisão continua enquanto os bloqueadores diminuírem e nenhum achado corrigido reaparecer. Para sem progresso, com oscilação, quando a correção exigir decisão do responsável ou quando uma discordância persistir por uma rodada. **Duas rodadas são a expectativa normal; cinco é o teto**, como na origem.
7. O workflow registra o handoff versão 2 e o bloco canônico `Próximo passo`, com a situação correspondente, e para. `REQUER NOVA RODADA` leva a `Aguardando correções (rodada N)`; plano apto leva a `Aguardando aprovação do plano`. Não há encadeamento automático neste ciclo completo, cujo modo contínuo permanece desativado.
8. Depois de um veredito apto, somente a manifestação humana posterior **`aprovo o plano do ciclo 000`** aprova a versão revisada. Parecer não equivale a aprovação nem a autorização de implementação.

**Aplicação futura:** preservar os níveis, a revisão formal e as regras de modo contínuo e revisão externa do Saldo Futuro, adaptando apenas as barreiras de domínio. Não criar uma regra geral nova de dois modelos para toda tarefa. A exigência específica de outra LLM neste ciclo não muda o mecanismo de intercambiabilidade da origem.

## Barreiras de domínio

Os códigos e seus papéis de controle permanecem G1–G4. **Somente G1 muda de domínio:** exatidão financeira passa a exatidão analítica e interpretação geoespacial. Proveniência e reprodutibilidade integram G1. G2 continua a controlar autenticação, autorização e isolamento; G3 mantém privacidade; G4 mantém migrações imutáveis. Não fundir G2 e G3.

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — Exatidão analítica e interpretação geoespacial | Sim | O ciclo define os controles de método, fontes/versões, contagens, tempo, geometrias, sobreposições e interpretação; não implementa cálculos nem comprova resultados operacionais. Exigir casos de referência independentes quando houver implementação |
| G2 — Autenticação, autorização e isolamento | Sim | O ciclo define os controles futuros de sessão, acesso e RLS; não configura autenticação ou tabelas. Preservar as verificações estáticas de RLS da origem e exigir testes de autorização nas entregas aplicáveis |
| G3 — Privacidade de dados | Sim | Preservar `local/` e impedir segredos e atributos pessoais indevidos em código, documentação, fixtures e evidências |
| G4 — Migrações só acrescentam | Não | Não há migrations nesta entrega. Preparar o controle herdado para as futuras migrations, sem afirmar que testes de banco foram realizados |

**Triagem e modo contínuo:** preservar a ordem da origem: correção elegível segue trilha curta; fora dela, mudança que toque G1, G2, semântica do schema ou governança segue ciclo completo; na dúvida, completo; os demais casos seguem leve. G1 ou G2 com `Sim` proíbem modo contínuo inclusive na trilha curta. Todo ciclo completo também o proíbe. G3 e G4 não criam, sozinhos, uma proibição nova, sem dispensar seus controles nem a escalada quando houver dúvida.

Templates, planos, tasks e checklist de PR usarão linhas iniciadas por `G1` a `G4` e coluna `Aplica-se?` com **somente `Sim` ou `Não`**, seguidos da justificativa em coluna própria. Adaptar `requiredText`, nomes e fixtures nos consumidores; manter a leitura de G1/G2 pelo validador, a coerência com os níveis e os testes negativos de modo contínuo. O ciclo `000` usará o cabeçalho normal e não será isentado dessas verificações.

## Estratégia de testes

- Executar os testes do validador adaptado e a validação estrutural com Node.js, sem dependências da aplicação.
- Verificar referências internas, correspondência entre política e manifesto, estados, campos, próximos passos e tratamento explícito do bootstrap.
- Testar casos negativos: autoridade ausente, referência quebrada, estado inválido, revisão externa pendente com tentativa de promoção e pretensão de concluir sem evidência.
- Após inicializar Git, conferir com `git check-ignore --no-index` caminhos de exemplo sob `local/` e inspecionar `git ls-files` e o staging para comprovar que nenhum conteúdo dessa pasta foi rastreado. Não ler os arquivos privados para essa verificação.
- **Vercel: verificação manual e estática**, limitada à presença da regra `local/` em `.vercelignore` e à inspeção de eventual configuração de build para impedir cópia desses materiais. Não executar CLI, upload ou deploy. Registrar expressamente que exclusão efetiva em serviço remoto não foi testada neste ciclo. A varredura estrutural não deve ler nem depender de `local/`.
- Cobrir a exceção do bootstrap por testes positivos e negativos: aceitar apenas os dois caminhos de plano e os dois de task previstos para o ciclo `000`; rejeitar variantes em outro ciclo, em modo contínuo, com aprovação ausente, com promoção sem veredito apto, com task concluída e integração pendente fora de encerramento prospectivo declarado, e com uso indevido de `legacyV1`. Preservar a regra prospectiva da PR e validar manualmente seu estado no GitHub quando existir.
- Executar `git diff --check` quando houver baseline Git aplicável, e revisar o staging. CI só será reportado como executado se existir uma execução remota comprovada.
- Validadores conferem estrutura e coerência; não provam autenticidade da aprovação humana, independência do revisor ou ausência semântica de informação privada. Essas verificações continuam explícitas e manuais.

## Itens de implementação

### Item 1 — Inventário e adaptação das autoridades

**Ação:** executar o inventário fechado deste plano, preservar a organização da origem e registrar cada adaptação relevante na task. Criar os documentos normativos, adapters, ciclos e backlog próprios. Não decidir silenciosamente outro conjunto de arquivos durante a execução.

**Aceite:** responsabilidades sem duplicação; referências locais resolvidas; regras sem herança financeira indevida; ciclo `000` representado no estado efetivo, sem execução ou aprovação inventada.

### Item 2 — Procedimentos, templates e revisão independente

**Ação:** reaproveitar workflows e templates pertinentes, o contrato de handoff versão 2, a tabela de situações e a revisão formal do Saldo Futuro. Adaptar apenas referências e domínio. Registrar a exceção de bootstrap e seus limites em uma única autoridade, sem criar um fluxo paralelo de revisão.

**Aceite:** retomada compreensível; parecer e aprovação separados; ausência de emissão de veredito externo fictício; ausência de exigência de GitHub já existente para conseguir instalar as próprias regras.

### Item 3 — Controles automáticos e preparação Git

**Ação:** adaptar manifesto, validador, testes, templates de issue/PR e workflow CI segundo o inventário e a exceção do bootstrap. Após autorização de implantação, inicializar Git local, conferir exclusões e preparar os commits raiz/branch definidos. Registrar o baseline real desse momento.

**Aceite:** verificações locais aprovadas com resultados reais; arquivos privados ausentes do staging; política e automação coerentes. Publicação permanece pendente até autorização e definição do remoto.

### Item 4 — Conhecimento de referência e verificação final

**Ação:** registrar os quatro ADRs e as duas KBs definidos no inventário, incluindo a proveniência, os requisitos de infraestrutura e o inventário para reaproveitar a autenticação. Conferir toda a entrega contra o plano aprovado. Formalizar L1 pela sequência C1 → registro exclusivo na task → validações → C2 documental; manter a task `Bloqueada` quando a publicação depender de decisão/precondição. Usar `Aguardando integração` somente com PR real publicada; preparar encerramento prospectivo somente quando houver PR autorizada.

**Aceite:** documentos formais autossuficientes; nenhum serviço configurado; requisitos definidos separados de propostas; roteiro para a prova de dados e fundação técnica posterior, sem antecipar a escolha do processamento geoespacial.

## Arquivos afetados

- `.agent/ai_behavior.md`, workflows, templates e controles especializados pertinentes.
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- `_project/README.md`, `cycles.md`, `backlog.md`, decisões, conhecimento e registros do ciclo.
- `scripts/governance-manifest.json`, `validate-governance.mjs` e seus testes.
- `.github/pull_request_template.md`, templates de issue e workflow de governança.
- `README.md`, `.gitignore`, `.vercelignore`, `.gitattributes` e `package.json` mínimo de tooling, conforme o inventário fechado.
- Task excepcional `_project/drafts/000_fundacao_governanca/000_task_bootstrap.md`, criada somente no início da implantação autorizada, e seus caminhos após encerramento prospectivo.
- Não mover ou publicar `local/`. Não criar diretórios vazios apenas para completar uma árvore.

## Decomposição em issues e PRs

Uma entrega coesa com os quatro itens, task `000_task_bootstrap.md` e branch `chore/cycle-000-plan`, sem issue, pela exceção nominal. Preparação e commits locais exigem a frase de implantação local; a publicação exige autorização específica para remoto/lote. O commit raiz tem somente os quatro arquivos delimitados na exceção; a PR seguinte reúne governança, plano, task e encerramento prospectivo, sem `Closes #N` artificial. O template de PR identifica `Não se aplica — bootstrap do ciclo 000`, permitido somente nessa entrega. A aprovação de merge continua específica para a PR real.

As demais entregas seguem a relação normal plano → issue → task → PR, após a integração. O bootstrap não cria issues retroativas nem transporta números do Saldo Futuro. O validador deve conferir nome, ciclo, plano, task e branch da exceção sem aceitar essa dispensa em outra PR.

## Dependências e blockers

- Revisão independente concluída na Rodada 3, sobre v4: `APTO PARA APROVAÇÃO`, sem achados.
- Instrução humana posterior em 2026-10-31: `autorizo a implementação local do ciclo 000`. Não foi localizada a frase separada de aprovação; a instrução explícita atual autoriza a execução local do escopo revisado, com a divergência registrada na task, sem inventar manifestação anterior.
- Remoto GitHub, visibilidade, licença e autorização de publicação: pendentes. Impedem publicação e integração, não a execução local explicitamente autorizada.
- Origem no commit fixado verificada por Git; decisões técnicas posteriores continuam fora do escopo.

## Riscos, suposições e rollback

- **Cópia incompleta:** adaptar política sem adaptar templates e validador cria regras contraditórias. Mitigar por matriz de consumidores e testes.
- **Cópia excessiva:** regras financeiras e operações específicas da origem podem entrar indevidamente. Mitigar por inventário e revisão externa.
- **Vazamento do brainstorm:** mitigar pelas exclusões, inspeção do staging e ausência de dependências documentais de `local/`.
- **Processo circular:** uma governança não pode exigir que seus próprios arquivos, issues ou CI já existam para o bootstrap. A exceção deve ser explícita e restrita a este ciclo.
- **Autenticação inadequada ao domínio:** reaproveitar infraestrutura não aprova as permissões do sistema financeiro para dados territoriais compartilhados.
- **Rollback:** alterações locais devem ser apresentadas como diff e ser reversíveis. Depois de haver commits, propor reversão específica dos commits da entrega; não remover materiais preexistentes nem reescrever histórico publicado.

## Sequência recomendada

1. Responsável leva a vez à segunda LLM, indicando este plano e dizendo `revise o plano do ciclo 000`.
2. Revisora registra o parecer em `Revisão crítica`; o responsável leva a vez ao autor com `corrija o plano do ciclo 000`, quando necessário. As ferramentas preservam os handoffs e os próximos passos canônicos.
3. Após parecer apto, responsável aprova o plano final com `aprovo o plano do ciclo 000`; o plano passa a `Aprovado` e aguarda a frase de implantação local.
4. Com `autorizo a implementação local do ciclo 000`, criar a task, inicializar o Git na ordem definida, implantar os quatro itens e validar L1; parar antes da publicação, se ainda não autorizada.
5. Definir e autorizar, separadamente, destino/visibilidade/licença, publicação do commit raiz e branch, PR e sua integração, conforme a exceção nominal. Não há merge implícito na aprovação do plano.
6. Preparar o encerramento prospectivo na PR e confirmar a integração real antes de declarar a conclusão efetiva, conforme o Saldo Futuro. Sem remoto, plano/task continuam em `drafts/` e a integração permanece pendente.

## Referências

Todos os caminhos abaixo referem-se ao Saldo Futuro no commit fixado no baseline:

- `.agent/templates/plano_implementacao.md`: estrutura usada para este rascunho, com adaptação explícita ao bootstrap.
- `.agent/workflows/rascunhar_plano.md`: redação, correção, incremento de versão e saída para revisão.
- `.agent/workflows/revisar_plano.md`: limites do revisor e registro das rodadas.
- `.agent/workflows/implementar_issue.md`, `retomar.md`, `health_check.md` e `atualizar_docs.md`: procedimentos de origem utilizados nominalmente até L1 com as exceções registradas neste plano; depois, valem os equivalentes locais.
- `.agent/ai_behavior.md`, `_project/README.md`, ADR-001 e ADR-004: autoridades, níveis, aprovações e revisão.
- `scripts/governance-manifest.json`, `scripts/validate-governance.mjs` e `scripts/validate-governance.test.mjs`: controles a adaptar.
- `src/components/login-panel.tsx`, `src/app/auth/callback/route.ts`, `src/lib/supabase/`, `src/proxy.ts` e testes de autenticação/acesso: inventário técnico posterior.

As orientações do responsável estão sintetizadas neste plano. A conversa e os materiais privados não são requisitos de leitura para a revisão.

Referências da intercambiabilidade, fixadas por URL e commit para consulta sem o checkout irmão:

- [Comportamento e handoff versão 2](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/ai_behavior.md).
- [Situações, revisão formal e modo contínuo](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/_project/README.md).
- [Workflow de revisão](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/workflows/revisar_plano.md).
- [Workflow de redação e correção](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/workflows/rascunhar_plano.md).
- [Template de plano](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/templates/plano_implementacao.md).

## Histórico de versões

| Versão | Registro |
| :-- | :-- |
| `v1` | Primeiro rascunho; nenhuma revisão formal realizada |
| `v2` | Ajuste solicitado pelo responsável para manter o mecanismo de intercambiabilidade do Saldo Futuro: saída canônica, parecer no plano e retirada do roteiro separado. Não representa rodada de revisão |
| `v3` | Correção autorizada de R1-1 a R1-6: fluxo nominal de bootstrap até o encerramento, campos normais, pontos de aprovação completos, inventário fechado, mapeamento G1–G4 e método estático de inspeção Vercel. Rodada 1 preservada; aguarda nova revisão |
| `v4` | Correção limitada a R2-1, conforme decisão do responsável após a Rodada 2: task bloqueada antes da publicação, `Aguardando integração` somente com PR real e registro de L1 em commit documental separado. Pareceres anteriores preservados; aguarda Rodada 3 |

## Rastreabilidade

| Campo | Valor |
| :-- | :-- |
| Issue(s) | —; não criadas |
| PR(s) | —; não criadas |
| Branch(es) | `chore/cycle-000-plan`; raiz local em `main` |
| Artefato ativo | Task nominal `000_task_bootstrap.md`; plano v4 em execução |
| Destino após conclusão comprovada | `_project/executed/000_fundacao_governanca/000_plan.md` |

## Próximo passo

A task `_project/drafts/000_fundacao_governanca/000_task_bootstrap.md` é o artefato ativo; consultar seu registro para evidências e pergunta de publicação.

```text
PRÓXIMO PASSO
Situação: Parado — ciclo 000 (completo)
Quem: Responsável
Conferir: A pergunta registrada na task do bootstrap sobre publicação
Diga: sua resposta à pergunta registrada
```

## Handoff de saída

- `handoff_schema_version`: `2`
- `logical_key`: `rastro-quente + 000 + implementar_issue + bootstrap-local + v4`
- `effect_class`: `local_mutation`
- `state_before`: v4 em revisão concluída, parecer apto; autorização humana local recebida; sem Git
- `state_after`: plano em execução; task nominal ativa; publicação e integração pendentes
- `result`: `executed`
- `evidence`: task nominal, índice de ciclos, Git local e Rodada 3 preservada abaixo
- `blockers`: destino, visibilidade, licença e autorização de publicação pendentes

## Revisão crítica

A revisão feita pela própria autora durante a redação não constitui revisão independente. A resposta da autora a cada achado deve ser registrada numa subseção própria, preservando o parecer original.

### Rodada 1

- **Data:** 2026-10-31
- **Versão revisada:** `v2`
- **Autor:** Codex; modelo não registrado no plano
- **Revisor:** Claude Code (aplicativo desktop), modelo Claude Opus 5.5 (`claude-opus-5-5`)
- **Procedimento:** `revisar_plano` da origem, aplicado como procedimento de bootstrap, conforme a exceção declarada no plano.

**Evidências consultadas (somente leitura):**

- Checkout irmão `C:\Programas\saldo-futuro`: `HEAD` igual ao commit fixado `c31081d56d7ce0d0ff2f51de3db655f90db6b36b`, sem alterações rastreadas, e commit contido em `origin/main`. Os arquivos de origem foram lidos com `git show <commit>:<caminho>`, não pelas URLs.
- Na origem: `.agent/workflows/revisar_plano.md`, `.agent/templates/plano_implementacao.md`, `.agent/ai_behavior.md` (contrato de handoff versão 2 e autorizações), `_project/README.md` (entrada, pontos de aprovação, situações, modo contínuo, revisão formal, estados e transições), `_project/cycles.md`, o plano do ciclo `000` da origem (precedente de bootstrap), `scripts/governance-manifest.json`, `scripts/validate-governance.mjs` e `.github/workflows/governance.yml`. Todos os caminhos citados em "Referências" existem no commit fixado.
- No destino: árvore da raiz, `.gitignore`, `.vercelignore` e ausência de repositório Git.

**Limitações:** as URLs do GitHub não foram abertas; a equivalência delas com o checkout é inferida pelo commit contido em `origin/main`. O conteúdo de `local/` não foi lido, por não ser requisito da revisão. Não foram executados validador nem testes, pois ainda não existem no destino.

**Achados:**

- **R1-1 — Bloqueador. O fluxo depois da aprovação não está definido sem GitHub.** A exceção de bootstrap cobre nominalmente apenas a redação, a correção e a revisão deste plano. Na origem, o ciclo completo segue, depois de "aprovo o plano do ciclo NNN", para PR documental, `criar_issues` e "autorizo a implementação da issue #N"; a situação "Aguardando autorização de implementação" confere "Issue e escopo"; a task se chama `NNN_task_issue-N.md`; a transição `Aprovado` → `Em Execução` exige "issue válida"; e `retomar` sem acesso ao GitHub leva a "Parado". O plano propõe "registro local do bootstrap, sem números fictícios" e o ponto "Implantação local", mas não define a frase que autoriza a implantação, a situação e o bloco "Próximo passo" gravados após a aprovação, o artefato ativo durante a execução (nome da task ou registro local), a transição de estado do plano sem issue, nem o momento em que os workflows locais recém-implantados substituem os de origem. Sem isso, a próxima ferramenta teria de improvisar, o que a própria origem proíbe. O ciclo `000` da origem resolveu o mesmo problema listando nominalmente quais workflows de origem cobrem quais etapas e quando os locais assumem. **Correção esperada:** estender a exceção nominalmente a cada etapa até o encerramento, com frases exatas, situações, artefato ativo e transições, inclusive para a operação da governança implantada enquanto não houver remoto.
- **R1-2 — Ressalva. O cabeçalho deste plano não passará no validador que o ciclo vai adotar.** O validador de origem procura `> **Nível:** \`...\`` em planos de `drafts/` e emite "Plano sem Nível válido" para `Nível proposto`; também não reconhece `Prioridade proposta` e não consegue avaliar a tabela de barreiras sem códigos. Além disso, o nível `completo` nunca foi confirmado pelo responsável por frase de entrada. O Item 3 exige "verificações locais aprovadas" e o plano proíbe dispensar controles silenciosamente. **Correção esperada:** declarar se a aprovação do plano confirma o nível `completo` e se, na implantação, o cabeçalho será normalizado ou o plano será listado como exceção no manifesto (a origem usa a lista fechada `legacyV1` para seu próprio bootstrap).
- **R1-3 — Ressalva. A tabela "Pontos de aprovação" está incompleta.** O cabeçalho tem cinco colunas, mas todas as linhas têm quatro células: a coluna "Conferir" está vazia, e o conteúdo de "Não cobre" aparece deslocado. A origem exige registrar, para cada ponto, o que conferir. **Correção esperada:** preencher "Conferir" em cada linha e indicar a frase exata de cada ponto, o que se liga a R1-1.
- **R1-4 — Ressalva. O inventário de arquivos e controles fica genérico e adiado para a execução.** A matriz menciona "procedimentos pertinentes", mas a origem tem 14 workflows, 3 skills, `task.md`, `lessons_learned.md` e um manifesto que exige, entre outros, `LICENSE`, `package.json`, `.env.example`, `design-system/*`, ADRs 002 e 003 e a KB-004 de regras financeiras. "Arquivos afetados" não diz o que acontece com esses itens. Casos concretos ficam sem decisão: `gerenciar_backlog` usa um worktree irmão e a trava `local/backlog.lock/` dentro do diretório privado `local/`; `release-please` e `design-system-check` podem não se aplicar; a licença depende da visibilidade do repositório, ainda indefinida. Para um ciclo completo de governança, aprovar um conjunto não enumerado enfraquece o aceite "responsabilidades sem duplicação". **Correção esperada:** classificar cada workflow, skill, template e arquivo obrigatório do manifesto como adotar, adaptar, adiar ou não transportar, com motivo, ou declarar quais decisões ficam para a execução e quem as aprova.
- **R1-5 — Ressalva. Falta mapear os papéis das barreiras G1 e G2.** Na origem, G1 e G2 não são apenas rótulos: definem a triagem para o ciclo completo e proíbem o modo contínuo, e o validador os lê pela coluna "Aplica-se?" com valores iniciados por "Sim". A proposta funde RLS (G2) e privacidade (G3) em "Acesso e privacidade" e usa valores que não são "Sim" ou "Não", como "À definição das regras". O plano reconhece o mapeamento, mas não diz quais barreiras novas herdam essas funções. **Correção esperada:** indicar quais barreiras levam ao ciclo completo e proíbem o modo contínuo, e padronizar a coluna "Aplica-se?".
- **R1-6 — Ressalva. A verificação das exclusões na Vercel não tem método local.** A estratégia de testes pede para "conferir exclusões de `local/` [...] no envio Vercel", mas configurar a Vercel ou fazer deploy está fora do escopo. **Correção esperada:** limitar essa conferência à inspeção de `.vercelignore`, declarada como verificação manual, ou indicar o método e a autorização correspondente.

**Itens atendidos:**

- Origem fixada por commit; os fatos de baseline conferem (sem Git, `local/` excluído por `.gitignore` e `.vercelignore`), e todos os caminhos de referência existem no commit.
- Objetivo, escopo e não-escopo são claros e conservadores; efeitos externos e implementação técnica ficam excluídos.
- Barreira de interpretação adequada ao domínio: focos e sobreposições não são tratados como prova.
- Revisão, aprovação e autorização de implementação ficam separadas; o modo contínuo `—` é coerente com o nível completo.
- A ausência de ideação retroativa segue o precedente do ciclo `000` da origem.
- Nenhum dado pessoal ou conteúdo de `local/` foi reproduzido; o plano não depende do brainstorm.
- Handoff versão 2 com os sete campos; bloco "Próximo passo" igual à tabela da origem; rollback e riscos pertinentes.

**Veredito:** `REQUER NOVA RODADA`, por causa do bloqueador R1-1. As ressalvas R1-2 a R1-6 podem ser resolvidas na mesma correção.

### Resposta do autor à Rodada 1 — v3

- **Data:** 2026-10-31
- **Autor da correção:** Codex; identificação exata do modelo não registrada
- **Autorização recebida:** `corrija o plano do ciclo 000`
- **Versão resultante:** `v3`, mantida em `Em Revisão`
- **Limite:** este registro responde aos achados; não é nova revisão formal nem substitui o veredito da revisora. O parecer da Rodada 1 foi preservado integralmente.

| Achado | Resposta da autoria | Evidência da alteração e conferência |
| :-- | :-- | :-- |
| R1-1 — Bloqueador | **Corrigido pela autoria; confirmação pendente.** A exceção agora cobre nominalmente cada etapa até a integração, preservando as situações e o mecanismo de handoff da origem | Seção `Operação do bootstrap até o encerramento`: frase de implantação local, task `000_task_bootstrap.md`, transições plano/ciclo/task, marco L1, substituição dos procedimentos de origem pelos locais, observação sem GitHub, commit raiz/branch, publicação autorizada, PR sem issue e encerramento prospectivo. As variantes ficam restritas ao ciclo 000, com testes negativos previstos |
| R1-2 — Ressalva | **Corrigido pela autoria; confirmação pendente.** Cabeçalho normalizado para `Nível` e `Prioridade`, sem afirmar confirmação humana já recebida | Parágrafo `Classificação e confirmação`: a aprovação humana posterior confirmará nível e exceções. `legacyV1` será vazio; o plano mantém handoff versão 2 e passa pelos controles normais. A tabela agora usa G1–G4 e `Sim`/`Não` |
| R1-3 — Ressalva | **Corrigido pela autoria; confirmação pendente.** Todos os pontos possuem as cinco células, a conferência e a autorização aplicável | Tabela `Pontos de aprovação` preenchida; frases canônicas para revisão, correção, aprovação e merge, frase excepcional de implantação local e requisitos explícitos para a autorização de publicação. A verificação documental confere a quantidade de colunas |
| R1-4 — Ressalva | **Corrigido quanto à necessidade de inventário; contagem de workflows contestada com evidência.** Cada workflow, skill, template e arquivo obrigatório do manifesto foi classificado | Seção `Inventário fechado de arquivos e controles`: cobre todas as entradas de `requiredFiles` do manifesto fixado, as 3 skills e os 6 templates. `git ls-tree` confirma **12 workflows** no commit citado, não 14. Foram explicitados a fila e trava do backlog, adiamento de design system/CI de aplicação/release/licença, package mínimo de tooling e substituições de ADRs/KBs. Mudanças materiais posteriores exigem emenda e nova aprovação |
| R1-5 — Ressalva | **Corrigido pela autoria; confirmação pendente.** Preservados os quatro códigos e os papéis de G1/G2 na triagem e no modo contínuo | Seção `Barreiras de domínio`: G1 passa a exatidão analítica/interpretação geoespacial; G2 continua acesso/RLS; G3 privacidade; G4 migrations imutáveis. Células de aplicabilidade estritamente `Sim` ou `Não`; regra de escalada e proibição de modo contínuo com G1/G2; consumidores e testes enumerados |
| R1-6 — Ressalva | **Corrigido pela autoria; confirmação pendente.** Conferência Vercel limitada a inspeção manual e estática | `Estratégia de testes`: inspecionar `.vercelignore` e configurações de build existentes, sem CLI, envio ou deploy. Registrar que a exclusão remota não foi testada. Conferência Git local usa metadados e caminhos de exemplo, sem ler conteúdo privado |

**Conferências desta correção:** leitura do manifesto, workflows e templates da origem por `git show` no commit fixado; comparação da seção da Rodada 1 com o snapshot anterior; cobertura textual das entradas de `requiredFiles`; cabeçalho, tabela de aprovações, aplicabilidade G1–G4 e bloco de encaminhamento para a Rodada 2. Não foram executados validador/CI nem testes de implementação: esses artefatos ainda não existem no destino e a solicitação cobre somente a correção do plano.

**Próximo encaminhamento:** revisão da `v3` pela outra LLM, seguindo `revise o plano do ciclo 000`. O cabeçalho mantém o último veredito recebido (`REQUER NOVA RODADA`, sobre v2), sem antecipar o resultado da Rodada 2.

### Rodada 2

- **Data:** 2026-10-31
- **Versão revisada:** `v3`
- **Autor:** Codex; modelo não registrado no plano
- **Revisor:** Claude Code (aplicativo desktop), modelo Claude Opus 5.5 (`claude-opus-5-5`)
- **Procedimento:** `revisar_plano` da origem, aplicado como procedimento de bootstrap.

**Evidências consultadas (somente leitura):**

- Referência no commit fixado verificada de novo no checkout irmão, conforme pedido em "Dependências e blockers": `git ls-tree` de `.agent/workflows/` no commit `c31081d…` retorna 12 arquivos.
- Manifesto da origem: chaves `requiredFiles`, `requiredText`, `naming`, `tasks`, `nextStep`, `siblingCheck`, `scanExclusions`, `dataFiles`, `designSystem` e `manualChecks`. Todas as entradas de `requiredFiles` aparecem classificadas no inventário.
- Validador da origem: `header()`, `barrierApplies()`, `siblingPattern()`, a regex `naming.cycleFile` e as verificações de planos ativos.
- Tabela "Estados válidos › Task" e transições canônicas em `_project/README.md` da origem.

**Limitações:** as mesmas da Rodada 1. Validador e testes ainda não existem no destino, então a viabilidade das exceções previstas foi avaliada por leitura do código de origem, sem execução.

**Respostas da autoria à Rodada 1:**

- **R1-1 — atendido.** A seção "Operação do bootstrap até o encerramento" define, para cada etapa:
  - a frase de implantação local, usada de forma consistente nos pontos de aprovação, na tabela de operação e na sequência;
  - a situação e o bloco após a aprovação, com a variante de `Conferir` restrita a caminhos exatos;
  - a task nominal `000_task_bootstrap.md` como artefato ativo;
  - as transições de plano, ciclo e task;
  - o marco L1, quando os workflows locais substituem os de origem;
  - a retomada sem remoto;
  - a publicação inicial, que segue o precedente do ciclo `000` da origem: commit raiz direto em `main` e o restante por PR;
  - o encerramento prospectivo.

  As variantes ficam limitadas ao ciclo `000`, com testes negativos previstos.
- **R1-2 — atendido.** O cabeçalho usa `Nível` e `Prioridade`, e a regex de `header()` da origem os reconhece. A aprovação confirma o nível sem fingir uma confirmação anterior, e `legacyV1` não é usado.
- **R1-3 — atendido.** As seis linhas têm as cinco células, com frase e conferência. A publicação, que não tem frase canônica, é tratada como resposta ao `Parado`, como a origem admite.
- **R1-4 — atendido; contestação aceita.** A contagem de 14 workflows na Rodada 1 estava errada: são 12, como a autoria mostrou e esta revisão confirmou. O inventário classifica os 12 workflows, os 6 templates, as 3 skills, todas as entradas de `requiredFiles` e os arquivos de release fora do manifesto. O nome `000_task_bootstrap.md` não passa em `naming.cycleFile` da origem; por isso, a lista fechada de dois caminhos prevista no plano é necessária e está declarada. A inclusão de `saldo-futuro` em `siblingCheck` é coerente: `siblingPattern()` detecta só caminhos locais (`../`, `C:\`, `/`), não as URLs fixadas usadas na proveniência.
- **R1-5 — atendido.** G1–G4 mantêm códigos e papéis; só G1 muda de domínio. G2 e G3 não foram fundidos, a coluna "Aplica-se?" usa só `Sim` e `Não`, e as regras de triagem e de proibição do modo contínuo são as da origem.
- **R1-6 — atendido.** A conferência da Vercel é manual e estática, e a limitação está declarada. A conferência no Git usa `git check-ignore --no-index` e `git ls-files`, sem ler conteúdo privado.

**Achados:**

- **R2-1 — Ressalva. O estado da task em L1 contradiz a semântica de origem.** A linha "L1 concluído, remoto/publicação ainda não autorizados" coloca a task em `Aguardando integração`. Na origem, esse estado significa "PR publicada, aguardando checks ou aprovação do merge"; em L1 ainda não existe PR, e a situação gravada é `Parado`. O estado de origem para "parada por decisão [...] ou precondição pendente" é `Bloqueada`. O plano também diz que a task registra o SHA do commit de L1 "depois de sua criação", sem dizer se esse registro gera um segundo commit local ou fica como alteração não comitada. Isso importa para a validação em L1 e para a inspeção do staging. **Correção sugerida:** em L1, usar `Bloqueada` com a pergunta de publicação; passar a `Aguardando integração` somente após abrir a PR real; declarar que o registro de L1 na task gera um commit local delimitado e validado. Se o plano for aprovado sem emenda, a execução deve seguir a semântica de origem e registrar a decisão na task, como correção técnica dentro do escopo.

**Itens atendidos:** os listados na Rodada 1 continuam válidos. Além disso:

- o bloqueador R1-1 foi resolvido sem criar situações novas nem um segundo mecanismo de revisão;
- o inventário fechado impede decisões silenciosas na execução;
- o design system, a licença, a CI de aplicação e a release foram adiados explicitamente, sem satisfazer o manifesto com arquivos artificiais;
- a resposta da autoria preservou a Rodada 1 integralmente.

**Progresso:** os bloqueadores caíram de 1 para 0, nenhum achado corrigido reapareceu e não há discordância persistente.

**Veredito:** `APTO COM RESSALVAS`. A ressalva R2-1 deve ser considerada pelo responsável na aprovação. Este parecer não aprova o plano nem autoriza a implantação.

#### Decisão do responsável após a Rodada 2

- **Data:** 2026-10-31
- **Decisão:** corrigir R2-1 antes de aprovar, e não aprovar com a ressalva. A decisão foi tomada em conversa com a revisora, em resposta à pergunta "aprovar agora ou corrigir R2-1 antes?".
- **Efeito:** a transição de um veredito apto para uma nova correção não está listada nas transições canônicas da origem e, por isso, exige decisão explícita do responsável, que foi dada. O veredito da Rodada 2 fica preservado. A situação passa a "Aguardando correções (rodada 2)". O escopo da correção limita-se a R2-1, e a versão corrigida deve passar por uma Rodada 3 antes da aprovação.
- **Separação de papéis:** a revisora não redige a correção. Se o responsável atribuir a autoria da correção à mesma ferramenta que revisou, a Rodada 3 deve ser feita por outra ferramenta, para preservar a revisão independente.

### Resposta do autor à Rodada 2 — v4

- **Data:** 2026-10-31
- **Autor da correção:** Codex; identificação exata do modelo não registrada
- **Autorização recebida:** `corrija o plano do ciclo 000`, limitada a R2-1 conforme a decisão do responsável registrada após a Rodada 2
- **Versão resultante:** `v4`, mantida em `Em Revisão`
- **Limite:** esta resposta não é uma Rodada 3 nem aprova o plano. O último veredito formal continua o da Rodada 2 sobre v3. Os pareceres, a resposta à Rodada 1 e a decisão do responsável foram preservados integralmente.

**R2-1 — Corrigido pela autoria; confirmação pendente da Rodada 3.**

- Na tabela `Operação do bootstrap até o encerramento`, a task fica `Bloqueada` quando L1 estiver concluído e remoto/publicação ainda dependerem de decisão ou precondição, com situação `Parado` e pergunta ao responsável.
- Depois de autorização suficiente, a task volta a `Em andamento` durante a preparação. `Aguardando integração` só será usado após a abertura de uma PR real publicada, como na semântica de origem. A falha impeditiva antes disso não cria uma integração fictícia.
- A definição de L1 especifica os commits: C1 contém a entrega técnica; o SHA real de C1 é registrado posteriormente **somente na task**, com estado/pergunta adequados; testes, validação e inspeção de diff/staging são repetidos; C2 grava esse registro documental delimitado. Não se deixa alteração documental intencionalmente sem commit nem se escreve o SHA de C2 dentro de C2. A formalização de L1 e a troca para workflows locais ocorrem depois de C2.
- O Item 4 foi alinhado à mesma sequência. Não houve alteração de escopo, inventário, barreiras ou aprovações.

**Conferências:** semântica de `Bloqueada` e `Aguardando integração` consultada na tabela `Estados válidos › Task` do Saldo Futuro no commit fixado; procedimento de correção conferido no workflow `rascunhar_plano` de origem. Comparados o histórico de revisão completo anterior, a consistência das linhas de L1/publicação, o cabeçalho e o próximo passo canônico para a Rodada 3. Não foram criados commits, tasks ou artefatos de implantação; C1 e C2 são a sequência futura definida no plano.

### Rodada 3

- **Data:** 2026-10-31
- **Versão revisada:** `v4`
- **Autor:** Codex; modelo não registrado no plano
- **Revisor:** Claude Code (aplicativo desktop), modelo Claude Opus 5.5 (`claude-opus-5-5`)
- **Procedimento:** `revisar_plano` da origem, aplicado como procedimento de bootstrap. A correção da v4 foi redigida por outra ferramenta, e a revisão continua independente da autoria.
- **Escopo:** a correção de R2-1, conforme a decisão do responsável após a Rodada 2, e a ausência de alterações fora desse escopo.

**Evidências consultadas (somente leitura):**

- Plano v4 completo: "Marco L1", tabela "Operação do bootstrap até o encerramento", "Retomada sem remoto", "Estratégia de testes", Item 4, "Dependências e blockers", histórico de versões e resposta da autoria.
- Semântica dos estados de task da origem, já conferida na Rodada 2: `Aguardando integração` exige PR publicada, e `Bloqueada` cobre a parada por decisão ou precondição pendente.
- Alterações fora do escopo: comparada a posição das seções com a v3. O deslocamento uniforme de sete linhas a partir da definição de L1 coincide com a expansão declarada; inventário, pontos de aprovação, barreiras e estratégia de testes mantêm a mesma extensão e conteúdo.

**Limitações:** as mesmas das rodadas anteriores. A sequência C1/C2 foi avaliada por leitura, sem execução, porque Git, validador e task ainda não existem no destino.

**Resposta da autoria à Rodada 2:**

- **R2-1 — atendido.**
  - Em L1 sem publicação autorizada, a task fica `Bloqueada`, com a situação `Parado` e a pergunta de publicação.
  - A task só passa a `Aguardando integração` depois de aberta uma PR real. Uma falha antes disso volta a `Bloqueada`, sem número inventado.
  - O registro de L1 tem uma sequência definida:
    1. C1 traz a entrega;
    2. o SHA de C1 é registrado somente na task;
    3. validador, validação estrutural e `git diff --check` são executados de novo, com conferência de que o diff altera só a task;
    4. C2 é o commit documental delimitado, com a árvore limpa ao final.
  - Não há autorreferência de SHA nem alteração deixada sem commit.
  - A troca para os workflows locais ficou ancorada em C2, de forma coerente entre "Procedimentos e troca de autoridade", a definição de L1, a tabela de operação e o Item 4.

**Achados:** nenhum.

**Itens atendidos:** os das Rodadas 1 e 2 continuam válidos. Além disso:

- a correção ficou limitada a R2-1, como decidido pelo responsável;
- os pareceres, a resposta anterior e a decisão do responsável foram preservados integralmente.

**Progresso:** sem bloqueadores desde a Rodada 2, a única ressalva aberta foi resolvida e nenhum achado corrigido reapareceu. Esta é a terceira de no máximo cinco rodadas.

**Veredito:** `APTO PARA APROVAÇÃO`. Este parecer não aprova o plano nem autoriza a implantação. A aprovação depende da manifestação humana posterior "aprovo o plano do ciclo 000", e a implantação depende de "autorizo a implementação local do ciclo 000".

## Pós-mortem

- **Data de conclusão:** —
- **Desvios:** —
- **Lições comprovadas:** —
