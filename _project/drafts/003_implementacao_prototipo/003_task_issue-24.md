# Task — Issue #24: Implantar e verificar o protótipo em operação gratuita

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `chore`
> **Issue:** `#24`
> **Plano:** `_project/drafts/003_implementacao_prototipo/003_plan.md`
> **Branch:** `chore/issue-24`
> **PR:** [#29](https://github.com/EuThiagoAndrade/rastro-quente/pull/29)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #24" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-07
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
- [ ] (Parte 2) Etapas externas 0 a 6 conferidas; plano da carga fixado nesta task (alvo, manifesto, janela, consumo); dry-run e carga pelo EX.
- [ ] (Parte 2) Autorização de produção, verificação, medição de egress e documentação final.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:e2e` 35/35 **servido com os cabeçalhos do `vercel.json`** (CSP sem `unsafe-inline`); `test:interface` 41/41 (39 anteriores e 2 novos: `vercel.json` e `.vercelignore`); `test:rls` pgTAP 173 (168 anteriores e 5 novos) e Node 35 (inclui o teste do alvo com usuário do pooler); `test:prototipo` 32/32; `test:governance` 55/55 |
| Typecheck e build | `npm run typecheck` sem erros; `npm run build` com valores públicos fictícios: JS 396 KB (110 KB gzip), CSS 24,5 KB, bundle inspecionado pelo `test:interface` |
| Validador | `node scripts/validate-governance.mjs`: 0 erro(s), 0 aviso(s), 9 manuais |
| `git diff --check` | Limpo |
| Checks remotos | Pendente |
| Não provado | Tudo o que é hospedado: contas, cotas reais, migrações no destino, EX pelo pooler, Google OAuth real, deploy, egress, pausa do Free |

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
Situação: Aguardando merge — ciclo 003 (completo)
Quem: Responsável
Conferir: Checks e diff da PR https://github.com/EuThiagoAndrade/rastro-quente/pull/29, incluindo a migração que revoga service_role
Diga: "aprovo o merge da PR #29"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-24/item-5-parte-1 + 68f3dc2d0b54fc0cd3f7c5e7e461dbc755a17f36`
- `effect_class`: `remote_mutation`
- `state_before`: plano `Em Execução`; itens 1 a 4 integrados; task #23 `Aguardando integração` sem reconciliação; issue #24 aberta, sem task, branch ou código.
- `state_after`: parte 1 do item 5 implementada e testada localmente; task #23 reconciliada como `Concluída`; branch `chore/issue-24` com o roteiro, `vercel.json` e o ajuste do alvo; PR #29 aberta de `chore/issue-24` com `Refs #24`; task `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorização literal "autorizo a implementação da issue #24" em 2026-11-07; E2E 35/35 sob os cabeçalhos do deploy; `test:rls` 168 + 35, `test:interface` 41, `test:prototipo` 32, governança 55; validador sem erros.
- `blockers`: nenhum para publicar a PR técnica. A parte 2 depende de PR técnica integrada ("aprovo o merge da PR #29" e checks verdes), das ações externas do responsável ("concluí a ação externa da issue #24" por etapa) e, para a verificação, de "autorizo a verificação em produção do ciclo 003". Sem decisão pendente.
