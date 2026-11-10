# Task — Issue #24: Implantar e verificar o protótipo em operação gratuita

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `chore`
> **Issue:** `#24`
> **Plano:** `_project/executed/003_implementacao_prototipo/003_plan.md`
> **Branch:** `chore/issue-24`
> **PR:** [#29](https://github.com/EuThiagoAndrade/rastro-quente/pull/29)
> **Integração:** Parte técnica integrada à `main` pela PR #29. Evidências operacionais consolidadas na PR de encerramento.
> **Autorização inicial:** "autorizo a implementação da issue #24" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-10
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 5 do plano `003` v4 em duas partes. **Parte 1, esta PR técnica:** configuração estática da Vercel, suporte do executor EX ao pooler do Supabase, roteiro concreto das etapas do responsável e correções de documentação necessárias a ele. **Parte 2, depois da integração:** conferir as ações externas, fazer o dry-run e a carga pelo EX, obter a autorização de produção, verificar o destino e atualizar README, runbook e KB-003 com o que foi medido e o que não foi provado. A parte 2 só começa com a PR técnica integrada e as etapas externas conferidas.

## Escopo autorizado

Issue [#24](https://github.com/EuThiagoAndrade/rastro-quente/issues/24) e item 5 do plano. A autorização "autorizo a implementação da issue #24" cobre, conforme o plano: o roteiro e os artefatos locais, a publicação da PR técnica (com `Refs #24`, pois a integração não comprova deploy nem produção) e, **somente depois** de a PR técnica estar integrada e as etapas 1 a 6 do roteiro conferidas, dry-run e carga pelo EX para o alvo, a janela e o manifesto fixados nesta task.

Não cobre: merge; atos administrativos do responsável (contas, migrações hospedadas, senha do EX, deploy, Google OAuth, primeiro login, cadastro do UUID); cobrança; migração nova (exceção única: a revogação de `service_role`, decidida pelo responsável em 2026-11-07, "Sim, criar"); ensaio destrutivo no destino; verificação em produção, que exige "autorizo a verificação em produção do ciclo 003".

## Origem no backlog

Não se aplica. Snapshot herdado do plano: demanda direta do responsável; nenhum ID do backlog selecionado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Esta PR não muda método, fontes, janela nem contagem. Na parte 2 a carga publica o manifesto aprovado do item 1 (identidade SHA-256 fixada); o `resumo` do destino é comparado com a referência local (identidade, totais e SHA-256 por tabela) e as contagens da verificação, com o total de referência. Nenhuma regra ambiental nova. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Uma migração aditiva (`20261108120000_revogar_service_role_public.sql`, decisão do responsável em 2026-11-07) revoga os privilégios de `service_role` nas tabelas e na sequência de `public`; nenhuma política nova, EX e lista RP intactos. Teste pgTAP novo `05_service_role.test.sql` (5 asserções: sem privilégio em tabela, sequência ou função; `authenticated` e EX preservados). O roteiro manda conferir no destino as migrações, `rolcanlogin` falso e atributos do EX, `privado.conferir_papel_executor`, `auditar_exposicao()` vazia e RLS em toda tabela, e depois da carga a lista de extensões. Mudança de código: o alvo da carga aceita o usuário do pooler `rq_executor.<referência>` (mesmo papel; `rq_executor_admin`, `postgres.<ref>` e `rq_executor.` vazio continuam recusados, testado). O bloqueio de AN e OA no destino só se prova na verificação em produção. Pendência herdada do ADR-005 tratada: ver "Decisões incidentais". |
| G3 — privacidade de dados | Sim | Nada de segredo, UUID, e-mail, referência real do projeto ou domínio real em commit. O roteiro usa `<REF>` e `<DOMINIO>`; a senha do EX vive só em `local/segredos/ex.env` (ignorado pelo Git e pelo upload, conferido com `git check-ignore`) e o agente não a lê. O `vercel.json` não contém variáveis nem segredo (testado). |
| G4 — migrações só acrescentam | Sim | Uma migração nova (`20261108120000_revogar_service_role_public.sql`); nenhuma existente alterada, renomeada ou removida. O teste `migracao.test.mjs` deixou de presumir que a correção G2 é a última migração e passou a nomeá-la. |

## Execução

- [x] Confirmar issue #24 aberta, plano v4 `Em Execução`, itens 1 a 4 integrados (PRs #25 a #28; `main` em `68f3dc2`) e autorização literal.
- [x] Ler autoridades, `implementar_issue`, templates, `governance-check`, plano e tasks vizinhas.
- [x] Criar `chore/issue-24` a partir de `origin/main` (`68f3dc2d0b54fc0cd3f7c5e7e461dbc755a17f36`).
- [x] Reconciliar a task #23 como `Concluída` (PR #28 integrada, três checks verdes conferidos no GitHub).
- [x] Conferir as condições dos provedores na documentação oficial em 2026-11-07 (Supabase Free e conexão; Vercel Hobby, Git, `vercel.json`).
- [x] `vercel.json` (build estático, CSP, cabeçalhos, cache, só `main` gera deploy), `.vercelignore` ampliado, E2E servido com esses cabeçalhos.
- [x] Alvo da carga aceita o usuário do pooler, com teste.
- [x] Migração aditiva que revoga `service_role` em `public`, com teste pgTAP, ADR-005 emendado e conferência no roteiro (decisão do responsável).
- [x] Roteiro do item 5 (runbook, seção 11) e correção da ordem da seção 2.
- [x] Gates locais e inspeção de `governance-check`.
- [x] Publicar a branch e abrir a PR técnica [#29](https://github.com/EuThiagoAndrade/rastro-quente/pull/29) com `Refs #24`.
- [x] (Parte 2) Conferir a integração da PR técnica e os retornos externos das etapas 0 a 6. Fixar alvo sanitizado, manifesto, janela e orçamento preliminar.
- [x] (Parte 2) Abertura da janela do EX pelo responsável, dry-run no alvo e conferência do pico e margem de banco.
- [x] (Parte 2) Aprovação administrativa do manifesto, carga e resumo da versão vigente pelo EX.
- [x] (Parte 2) Comparar a identidade, contagens e hashes com a referência local.
- [x] (Parte 2) Fechar a janela e conferir auditoria e extensões.
- [x] (Parte 2) Autorização de produção, verificação anônima, inspeção do bundle e conferência da sessão do responsável.
- [x] (Parte 2) Conferir outro autenticado após a carga e egress final.
- [x] (Parte 2) Registrar o aceite dos testes pelo responsável e consolidar as evidências no encerramento prospectivo.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:e2e` 35/35 **servido com os cabeçalhos do `vercel.json`** (CSP sem `unsafe-inline`); `test:interface` 41/41 (39 anteriores e 2 novos: `vercel.json` e `.vercelignore`); `test:rls` pgTAP 173 (168 anteriores e 5 novos) e Node 35 (inclui o teste do alvo com usuário do pooler); `test:prototipo` 32/32; `test:governance` 55/55 |
| Typecheck e build | `npm run typecheck` sem erros; `npm run build` com valores públicos fictícios: JS 396 KB (110 KB gzip), CSS 24,5 KB, bundle inspecionado pelo `test:interface` |
| Validador | `node scripts/validate-governance.mjs`: 0 erro(s), 0 aviso(s), 9 manuais |
| `git diff --check` | Limpo |
| Checks remotos | PR #29 integrada à `main`, três checks aprovados (governança, interface e banco) conferidos no GitHub. Issue #24 aberta. |
| Não provado | Pausa e retomada no Free, restauração de Auth e segredos e consumo sob uso contínuo. |

### Retornos externos das etapas 0 a 6

- O responsável confirmou uso pessoal e não comercial. Supabase Free na região São Paulo, Vercel Hobby no GitHub pessoal e projeto Google Cloud sem faturamento vinculado, conforme retornos. O painel Supabase indicava 26/500 MB de banco e 0/5 GB de egress na etapa 1.
- Dry-run de migrações conferido com as cinco versões em ordem. O responsável aplicou as migrações e confirmou as mesmas cinco no histórico, RLS ativo nas nove tabelas do protótipo, `rq_executor` sem `LOGIN` e sem os atributos privilegiados consultados, `conferir_papel_executor` sem erro, `auditar_exposicao()` vazia e `service_role_le = false`.
- Baseline de extensões do destino: `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp`.
- Senha do EX definida pelo responsável com `psql`. O arquivo ignorado `local/segredos/ex.env` está presente, sem inspeção do conteúdo. Certificado da CA baixado do painel e usado pelo responsável na sessão do `psql`.
- O responsável informou deploy Production no domínio `<DOMINIO>` a partir do commit da `main` que integrou a PR #29. `VITE_SUPABASE_URL` e `VITE_SUPABASE_CHAVE_PUBLICAVEL` no escopo Production. Primeiro login Google retornou acesso negado antes do cadastro. Retorno da etapa 6: lista privada com contagem 1.

### Plano da primeira carga hospedada

- Alvo: projeto Supabase Free em São Paulo, banco `postgres` pelo pooler de sessão na porta 5432, com TLS e papel `rq_executor.<REF>`. A credencial fica no arquivo local ignorado e é fornecida somente ao processo de carga.
- Janela GMT `[2025-11-01T00:00Z, 2026-11-01T00:00Z)` e envelope `[2026-11-01T00:00Z, 2026-11-01T04:00Z)`. Manifesto `0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`, revisão 1, malha de exibição intermediária e regra `H2_interrupcoes_nasa` conforme decisão humana da issue #20. `plan --offline`: 10.640 detecções principais, 0 no envelope, 142 municípios e 51.830 município-dias.
- Payload local de 15.298.299 bytes. Fator 1,5 do ADR-006 estima acréscimo de 22.947.449 bytes. O uso de 26 MB informado na etapa 1 é preliminar. O `plan` no alvo deve medir `pg_database_size`, confirmar a margem até o teto de 400.000.000 bytes e reconciliar a identidade antes da aprovação administrativa. O plano offline sinalizou `sem_consulta_ao_alvo`.

### Dry-run no destino

- A abertura de `LOGIN` foi executada pelo responsável. `plan` autenticou como EX no pooler de sessão com a CA do provedor e verificação TLS ativa. PostgreSQL 17.11, sem versão vigente e identidade planejada ausente. O manifesto calculado coincide com a identidade e os totais do plano offline.
- Banco lógico antes da carga: 11.884.211 bytes. Pico previsto: 34.831.660 bytes. Margem até o teto de 400.000.000 bytes: 365.168.340 bytes. Nenhuma parada no `plan`; pendência `manifesto_nao_aprovado`. A medição de banco lógico e o indicador de uso do painel são registrados separadamente.
- `local/dados-prototipo/aprovacao.sql` foi gerado pelo plano, está ignorado pelo Git e coincide com a instrução administrativa do manifesto. SHA-256 do SQL: `27d177550215d55e29570de2d3c71139b1430412b888c877c33ef53a4842e6d8`. O arquivo contém apenas a inserção da aprovação e seus comentários. A execução cabe ao responsável.

### Carga no destino e resumo

- O responsável informou `Success. No rows returned` para o SQL de aprovação, egress de 0/5 GB (menos de 1%) e cached egress de 0/5 GB. O `plan` imediatamente anterior à carga confirmou a aprovação, a identidade planejada, o alvo sem versão vigente e margem no banco.
- `apply` retornou `executed` na primeira tentativa, em 20.607 ms. 16 instruções, 15.305.351 bytes enviados e 3.312 bytes recebidos nas conexões do `apply`. Banco lógico medido em 11.900.595 bytes antes e 29.537.971 bytes depois. `resumo` e `plan` posteriores conferiram a identidade vigente publicada, com 10.640 detecções principais, 0 no envelope, 142 municípios e 51.830 município-dias.

| Tabela | Linhas | SHA-256 hospedado |
| :-- | --: | :-- |
| `fontes` | 22 | `af75a3282d10e834fe764bf3336022687e2400f4bf1c7d44efb8f64ee40cd403` |
| `malhas` | 2 | `6ab13301b5650fb3c3a7b5741fa2b47342ad4cafac520fd10cdbb5a4f94b5f31` |
| `municipios` | 142 | `3b190b0dfaa9ff26304c5c50254e2ba7b35c9babb3d8e9782624838b1caf6f4f` |
| `deteccoes` | 10.640 | `2498ba09f9cf6753fed4ea45c6c17cdf76bbba12a4b6ad6038908430c4fdaeea` |
| `disponibilidade` | 51.830 | `25213985b9f352e1bd733dbed9970c9cff64f71bde4445eb36f3fb79bb1b78ef` |

- Referência reproduzida em banco local isolado PostgreSQL 17.11, a partir das cinco migrações integradas e dos mesmos insumos fixados. Identidade, contagens e SHA-256 de todas as cinco tabelas coincidiram com o destino.
- Etapa 7.5 concluída pelo responsável. `alter role rq_executor nologin` retornou sucesso, `privado.auditar_exposicao()` voltou sem linhas e as extensões permaneceram iguais à etapa 2 (`pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp`).

### Verificação em produção

- Autorização específica recebida em 2026-11-10: “autorizo a verificação em produção do ciclo 003”.
- Conferir login do responsável, consultas da versão publicada, mapa, tabela, proveniência e estados. Referências em GMT: Mato Grosso na janela completa, 10.640; Colniza de agosto a outubro de 2026, 824 (516, 246 e 62). Conferir a sensibilidade `America/Cuiaba` e a identificação de versão nas respostas.
- Conferir bloqueio de anônimo pela interface e API, de outro autenticado em sessão válida disponível, bundle e consumo dentro da cota. O login e as evidências ficam sanitizados.
- Interface sem sessão abriu com botão de login e sem dados da consulta. API anônima com chave publicável e sem sessão: as sete tabelas do protótipo e as três RPCs retornaram HTTP 401 com `42501`, sem dados. A tentativa com o perfil `privado` retornou HTTP 406 (`PGRST106`).
- HTML publicado retornou HTTP 200 com CSP e `Cache-Control: no-cache`; JS (397.834 bytes) e CSS (24.507 bytes) com cache imutável. Bundle servido com chave publicável e URL do alvo correspondente ao vínculo local, sem credencial privilegiada, formulário local de senha ou marcadores do conjunto nas verificações realizadas. Quatro caminhos testados de arquivos locais e metadados do checkout retornaram HTTP 404.
- Login Google do responsável concluído no navegador. A interface exibiu `Sessão autorizada` e a carga nº 1. A janela estadual de 2025-11-01 a 2026-10-31 exibiu 10.640 em GMT e em `America/Cuiaba`, diferença 0. Colniza de 2026-08-01 a 2026-10-31 exibiu 824 em ambos os fusos, diferença 0, com série diária de 92 dias. Identidade do manifesto, fontes INPE e IBGE e aviso de cobertura não comprovada conferidos na interface.
- Em Colniza, tabela e mapa mostraram 100 registros por página de um total de 824. Seleção de registro destacou o ponto no mapa, o limite municipal carregou e a página seguinte passou a mostrar os registros 101 a 200, com o total preservado. Em 2026-10-01, o recorte mostrou zero detecções, zero pontos e tabela vazia, conforme a referência local. Ao fim, a aba voltou à janela estadual.
- Após a carga, o responsável informou que a segunda conta Google entrou em janela separada e recebeu acesso negado, sem dados carregados. A verificação da segunda conta em produção foi pela interface. Os testes diretos da API em produção usaram acesso anônimo.
- Após os testes, o painel Supabase informou Egress 0/5 GB (menos de 1%), Cached Egress 0/5 GB e Database Size 0,045/0,5 GB (9%). O consumo lógico de 29.537.971 bytes foi medido separadamente com `pg_database_size`.
- A carga hospedada levou 20,6 s, a reconstrução local levou 5,8 s e a retomada local após perda simulada levou 5,9 s (task #22). A atualização segue manual, com janela do EX e aprovação administrativa do manifesto. Em 2026-11-10, após receber os resultados e tempos medidos, o responsável declarou “Em questão dos teste estou de acordo.” O aceite cobre a verificação técnica. A discussão sobre funcionalidades e interface fica para depois.

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Ordem da seção 2 do runbook corrigida.** O `plan --alvo` consulta o banco como EX, e o EX nasce sem `LOGIN`; a ordem anterior (plano antes de abrir a janela) falharia na conexão. A janela passou a abrir antes do plano. Correção de documentação, sem mudança de comportamento do código.
- **Aprovação do manifesto entra no roteiro (etapa 7.3).** A tabela do item 5 do plano não a lista, mas o ADR-005 (D1, opção a, decidida em 2026-11-07) a atribui ao responsável por SQL administrativo. O roteiro apenas torna a etapa explícita; ela é ato do responsável e não amplia a autorização do agente.
- **Pooler de sessão, não conexão direta nem pooler de transação.** A conexão direta do Supabase é só IPv6 no Free; o pooler de transação (6543) não suporta prepared statements. A carga usa o pooler de sessão (5432), com usuário `rq_executor.<referência>`. Sem o ajuste do alvo, o `plan` recusaria esse usuário.
- **Verificação do certificado mantida.** `sslmode=require` significa `ssl: true` (verifica a cadeia). Se o certificado do Supabase não for aceito, o caminho previsto é o responsável baixar a CA e o agente usar `NODE_EXTRA_CA_CERTS`; não se desliga a verificação.
- **Previews.** `git.deploymentEnabled` com `main: true` e `**: false` desliga deploys de outras branches e PRs; a precedência entre regras que casam vem da documentação e não foi exercitada. Segunda camada no roteiro: variáveis `VITE_*` só no escopo Production, de modo que um preview eventual mostraria "Configuração ausente" e nenhum dado.
- **CSP.** `connect-src` usa `https://*.supabase.co` porque a referência do projeto não existe ainda; fixar a URL exata exigiria nova PR depois da criação do projeto. O E2E troca só esse curinga pela origem do Supabase local.
- **Teste de escala de cinza** passou a usar CSSOM em vez de `<style>` injetado, que a CSP (corretamente) bloqueia. Não muda o que o teste verifica.
- **Não confirmado na documentação, a conferir na execução:** papel personalizado pelo pooler (formato `papel.<ref>` é o documentado), cadeia de certificados do pooler, onde o painel da Vercel mostra o SHA do deployment, existência do `psql` na máquina do responsável, se o limite de 2 projetos Free é por conta ou por organização, procedimento de retomada de projeto pausado.
- **`service_role` revogado em `public`.** Pendência herdada (task #21, ADR-005): `service_role` não alcançava `privado` nem publicava, mas lia cargas em preparação e gravava contornando RLS. Decisão do responsável, "Sim, criar", em 2026-11-07, depois de apresentada a pendência na PR #29. Migração aditiva e teste pgTAP; o ADR-005 recebeu uma emenda datada. Nada no produto usava `service_role` nas tabelas; o E2E, que cria contas pelo Auth, confirma. Não cobre funções ou tabelas de outros schemas.
- **Escopo preservado:** a única migração é a revogação decidida acima; sem conta, sem credencial, sem efeito remoto além da publicação da própria PR.

## Encerramento

Não se aplica. Quinta issue de ciclo completo; o encerramento prospectivo é a PR `chore/cycle-003-closure`, depois da verificação.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 003 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + atualizar_docs + issue-24/aceite-tecnico + 0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`
- `effect_class`: `local_mutation`
- `state_before`: evidências da produção registradas e aceite dos testes pendente.
- `state_after`: aceite técnico registrado. A conclusão da issue está descrita prospectivamente na PR de encerramento.
- `result`: `executed`
- `evidence`: manifestação do responsável em 2026-11-10 e resultados sanitizados acima.
- `blockers`: integração depende dos checks e da aprovação específica da PR de encerramento.

### Registro anterior — Verificação final

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-verificacao-final + 0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`
- `effect_class`: `local_mutation`
- `state_before`: sessão do responsável, acesso anônimo e bundle verificados; segunda conta e egress final pendentes.
- `state_after`: evidências da segunda conta e do painel registradas; resultados e duração da operação reunidos para o aceite.
- `result`: `executed`
- `evidence`: mensagem sanitizada de acesso negado e indicadores do painel informados pelo responsável após os testes.
- `blockers`: aceite da operação medida antes do encerramento prospectivo, conforme a sequência do plano.

### Registro anterior — Verificação da sessão do responsável

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-verificacao-rp + 0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`
- `effect_class`: `local_mutation`
- `state_before`: acesso anônimo e bundle verificados; sessão autorizada pendente de login humano.
- `state_after`: sessão do responsável, contagens, recortes, mapa, tabela e proveniência conferidos em produção.
- `result`: `executed`
- `evidence`: observações sanitizadas da interface nas consultas estadual, municipal e municipal sem detecções, registradas acima.
- `blockers`: retorno da segunda conta e medição final de egress.

### Registro anterior — Verificação pública

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-verificacao-publica + 0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`
- `effect_class`: `local_mutation`
- `state_before`: carga conferida e janela do EX fechada; autorização específica de verificação recebida.
- `state_after`: verificação anônima da interface e da API e inspeção dos arquivos públicos concluídas. Login do responsável encaminhado para atuação humana no navegador.
- `result`: `executed`
- `evidence`: interface sem dados em sessão anônima, sete tabelas e três RPCs negadas, schema privado não exposto no teste, bundle e caminhos de exclusão conferidos acima.
- `blockers`: sessão do responsável e de outro autenticado, comparações da interface e medição de egress ainda pendentes.

### Registro anterior — Fechamento da janela do EX

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-fechar-ex + 0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`
- `effect_class`: `local_mutation`
- `state_before`: carga vigente conferida, confirmação de fechamento do EX pendente.
- `state_after`: confirmação da etapa 7.5 reconciliada nesta task. Janela fechada, auditoria vazia e extensões sem divergência informadas pelo responsável.
- `result`: `executed`
- `evidence`: retorno sanitizado da etapa 7.5 e comparação com a lista da etapa 2 acima.
- `blockers`: manifestação específica para verificar o ambiente de produção.

### Registro anterior — Carga da parte 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-carga + 0c81ec9fd96127ccd754f51c9c1b792d158dae9652046db52eb8941310c25ab9`
- `effect_class`: `remote_mutation`
- `state_before`: manifesto aprovado pelo responsável e confirmado por leitura como EX; versão vigente ausente e margem suficiente.
- `state_after`: carga vigente publicada com identidade e contagens conferidas; dados hospedados abaixo do teto do plano.
- `result`: `executed`
- `evidence`: `plan`, `apply` e `resumo` sanitizados, consumos antes e depois e comparação com a referência local registrada acima.
- `blockers`: fechamento e auditoria da janela do EX e autorização posterior de verificação em produção.

### Registro anterior — Dry-run da parte 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-dry-run + 0e2841b79b715fd64e50a483e5dce30ba033a596`
- `effect_class`: `local_mutation`
- `state_before`: janela do EX aberta pelo responsável, manifesto fixado localmente e orçamento hospedado pendente.
- `state_after`: conexão EX e orçamento conferidos por leitura, alvo sem carga vigente, SQL de aprovação local disponível para o responsável.
- `result`: `executed`
- `evidence`: `plan` sem paradas, identidade e totais conferidos, saída sanitizada e SHA-256 do SQL acima.
- `blockers`: aprovação administrativa do manifesto e conferência das cotas atuais antes da carga. Verificação em produção posterior à carga.

### Registro anterior — Preparação da parte 2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-2-preparo + 0e2841b79b715fd64e50a483e5dce30ba033a596`
- `effect_class`: `local_mutation`
- `state_before`: PR #29 integrada, issue #24 aberta, task ainda aguardando integração, etapas 0 a 6 informadas pelo responsável.
- `state_after`: integração reconciliada nesta task, etapas externas registradas, identidade e orçamento preliminar fixados para a primeira carga. Janela do EX a abrir pelo responsável.
- `result`: `executed`
- `evidence`: GitHub conferido, retornos sanitizados do responsável, existência e exclusão do `ex.env` conferidas sem leitura do conteúdo e `plan --offline` reproduzível na árvore integrada.
- `blockers`: janela do EX ainda não aberta; consulta ao alvo, orçamento atual, aprovação administrativa do manifesto e autorização de verificação em produção pendentes nas respectivas etapas.

### Registro anterior — Parte 1

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-1 + 68f3dc2d0b54fc0cd3f7c5e7e461dbc755a17f36`
- `effect_class`: `remote_mutation`
- `state_before`: plano `Em Execução`; itens 1 a 4 integrados; task #23 `Aguardando integração` sem reconciliação; issue #24 aberta, sem task, branch ou código.
- `state_after`: parte 1 do item 5 implementada e testada localmente; task #23 reconciliada como `Concluída`; branch `chore/issue-24` com o roteiro, `vercel.json` e o ajuste do alvo; PR #29 aberta de `chore/issue-24` com `Refs #24`; task `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorização literal "autorizo a implementação da issue #24" em 2026-11-07; E2E 35/35 sob os cabeçalhos do deploy; `test:rls` 168 + 35, `test:interface` 41, `test:prototipo` 32, governança 55; validador sem erros.
- `blockers`: nenhum para publicar a PR técnica. A parte 2 depende de PR técnica integrada ("aprovo o merge da PR #29" e checks verdes), das ações externas do responsável ("concluí a ação externa da issue #24" por etapa) e, para a verificação, de "autorizo a verificação em produção do ciclo 003". Sem decisão pendente.
