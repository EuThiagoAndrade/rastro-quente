# Task — Issue #21: Fundar banco e autorização RLS do protótipo

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#21`
> **Plano:** `_project/executed/003_implementacao_prototipo/003_plan.md`
> **Branch:** `feature/issue-21`
> **PR:** [#26](https://github.com/EuThiagoAndrade/rastro-quente/pull/26)
> **Integração:** `PR #26 integrada em main em 2026-11-07 (e8b79b5); Governance aprovado na PR (Validate governance e Database RLS and query contract)`
> **Autorização inicial:** "autorizo a implementação da issue #21" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-07
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 2 do plano `003` v4: Supabase local gratuito, schema mínimo do contrato de dados, RLS em toda tabela `public`, lista privada do RP pelo UUID de `auth.users`, papel EX com privilégio mínimo, consultas com versão fixada e a matriz AN/RP/OA/EX provada por SQL e pela API, com dados fictícios e sem serviço hospedado.

## Escopo autorizado

Issue [#21](https://github.com/EuThiagoAndrade/rastro-quente/issues/21) e item 2 do plano: `supabase/config.toml`, migrações aditivas, testes em `supabase/tests/`, testes pela API e medição base em `scripts/banco/`, CLI Supabase fixada em `package.json`/lockfile, `.env.example` sem valores, passo de CI com dados fictícios e ADR. Fora do escopo: provedor hospedado, deploy, contas ou segredos reais, carga do volume integral de MT, publicação idempotente (item 3) e interface (item 4). A autorização cobre implementação, testes e preparação/publicação da PR; não cobre merge.

## Origem no backlog

Não se aplica. Snapshot herdado do plano: demanda direta do responsável; nenhum ID do backlog selecionado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | O contrato de consulta calcula totais GMT e a sensibilidade `America/Cuiaba`. Implementa só as regras aprovadas no plano (dias GMT inclusivos, envelope fora do principal, sensibilidade por consulta, D1 com motivos e alcance), sem nova regra. Casos fictícios independentes em `03_consultas.test.sql`: 100/102 (+2), fronteira final 2/7, série e totais por município somando o total, sensibilidade incompleta declarada sem número. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | RLS em 7/7 tabelas `public` e nas duas tabelas de `privado`; grants auditados; uma única `security definer` restrita; EX sem atributos, associações, propriedade ou privilégio fora do previsto (conferido na migração). Matriz por SQL (`02_matriz_acesso`, 79 asserções; `04_revisao_g2`, 22) e pela API real: AN, OA com metadados de RP, RP antes do cadastro, cadastro, leitura, revogação na mesma sessão, token adulterado e expirado; as três consultas por papel; tabelas filhas pelo ID de cargas em preparação e retiradas. EX com login SQL real: DDL negada, publicação concorrente com duas conexões e `id` da carga. Revisão manual G2 em 2026-11-07: quatro bloqueadores corrigidos; a lacuna da plataforma (extensões privilegiadas do supautils) foi aceita pelo responsável com controle (D3, opção a): EX sem `LOGIN` fora da janela de carga e `privado.auditar_exposicao()`. |
| G3 — privacidade de dados | Sim | Somente UUIDs, e-mails `.test`, códigos `99000xx` e coordenadas fictícias; contas de teste criadas e removidas pelo próprio teste, com senhas geradas na hora e não impressas. Nenhum UUID, e-mail ou senha real em migração, teste, log ou documento. Chaves locais de demonstração lidas de `supabase status` em tempo de execução, sem versionar. |
| G4 — migrações só acrescentam | Sim | Três migrações novas no padrão `AAAAMMDDHHMMSS_assunto.sql`; nenhuma migração existente antes desta entrega. Passo G4 do CI existente continua valendo. |

## Execução

- [x] Confirmar issue #21 aberta, plano v4 `Em Execução`, item 1 integrado (PR #25, `f8106a5`), base `main` limpa e autorização literal.
- [x] Ler autoridades, `implementar_issue`, templates de task, PR e ADR, `governance-check` e `lessons_learned`.
- [x] Criar `feature/issue-21` a partir de `f8106a56f12c7d8e0354fb693f36d98db7b2c0ad`.
- [x] Conferir ambiente: Docker 29.9.2 em execução; CLI Supabase ausente; instalar `supabase@2.122.1` como `devDependency` (MIT).
- [x] `supabase/config.toml` mínimo (banco, Auth, PostgREST, gateway), portas `5532x`, só `public` exposto, `max_rows = 1000`, Google preparado e desligado.
- [x] Migrações: schema de dados, autorização (lista privada, helper, EX, gatilhos, políticas, grants) e consultas.
- [x] Testes pgTAP (estrutura, matriz, contrato) e testes pela API; `npm run test:rls`.
- [x] Medição base do banco com volume sintético fictício (`npm run medir:banco`).
- [x] ADR-005, `.env.example`, README e passo de CI.
- [x] Reconciliar a task #20 (PR #25 integrada) e o plano.
- [x] Publicar `feature/issue-21` (base `origin/main` em `f8106a56f12c7d8e0354fb693f36d98db7b2c0ad` conferida) e abrir a PR #26 com `Closes #21`.
- [x] Corrigir os achados RS-1 a RS-4 da revisão de segurança G2 (revisão sobre `3488355`), sob a instrução do responsável de 2026-11-07: editar e testar localmente, migração aditiva, pilha descartável, parar antes de commit, push, merge ou comentário.
- [x] Registrar as decisões D1 a D3 do responsável ("Adopt recommended (a)", 2026-11-07) e aplicar D3: EX sem `LOGIN` por padrão e auditoria de exposição.
- [x] Commit e push das correções na PR #26, sob a autorização literal "Commit e push" do responsável em 2026-11-07.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Precondições | Issue #21 `OPEN`; PR #25 `MERGED` (`f8106a5`), Governance verde na PR e em `main`; issue #20 fechada; nenhuma branch `feature/issue-21` remota antes da criação. |
| Ambiente | Windows 11, Docker 29.9.2, Node.js `v24.15.0`, Supabase CLI `2.122.1`, Postgres `17.11` local. Outro projeto Supabase local ocupava as portas padrão e não foi tocado. |
| `npm run test:rls` | Reset do zero com as 3 migrações; pgTAP 105/105 (`01_estrutura` 19, `02_matriz_acesso` 47, `03_consultas` 39); API 3/3 testes. |
| Medição base | Ver "Medição base do banco". |
| Testes existentes | `npm run test:prototipo` 32/32; `npm run test:prova-dados` 57/57; `node --test scripts/validate-governance.test.mjs` 55/55. |
| Validador | `node scripts/validate-governance.mjs`: zero erros e zero avisos; nove itens manuais. |
| `git diff --check` | Passou. Varredura G3 do diff: só UUIDs `00000000-0000-4000-8000-…` e e-mails `.test` fictícios; nenhuma chave ou senha; lockfile só com `registry.npmjs.org`. |
| Publicação | Commit `3fcd895` publicado; PR [#26](https://github.com/EuThiagoAndrade/rastro-quente/pull/26) aberta de `feature/issue-21` para `main`. Este registro documental vai em commit posterior da mesma PR. |
| Checks remotos | `Validate governance` e `Database RLS and query contract` verdes em `3488355` (conferido em 2026-11-07). As correções da revisão G2 foram publicadas na mesma PR em commit posterior; o resultado dos checks desse commit é verificável na PR, sem presumir aprovação. |
| Revisão G2 — reprodução | Pilha Supabase descartável (`rq-descartavel`, portas `5542x`, cópia de `supabase/` no diretório temporário da sessão); a pilha local `rastro-quente` não foi reiniciada. Com o schema de `3488355` e o EX por login real: RS-1 publicou cargas com 1 declarada e 0 ou 2 reais; RS-3 publicou carga sem linha D1; RS-4 ocupou o próximo `id` e quebrou a inserção seguinte (`duplicate key`); RS-2 assumiu `service_role` e as três migrações aceitaram o papel; `create temp table` aceito. |
| Revisão G2 — correção | Migração `20261107230000_correcoes_revisao_g2.sql`. Na pilha descartável, reset com as 4 migrações; pgTAP 168/168 (`01` 25, `02` 79, `03` 39, `04` 25); Node 13/13 (`api` 3, `executor` 6, `migracao` 4); sem resíduos (cargas, manifestos, bancos `rq_migracao_*`, associações do EX, extensões; EX sem `LOGIN`; auditoria vazia). Medição: `public` 17.367.040 bytes; publicação com conferências 25,9 ms. `test:prototipo` 32/32, `test:prova-dados` 57/57, governança 55/55, validador 0 erros e 0 avisos, `git diff --check` limpo, varredura G3 só com valores fictícios, nenhuma migração existente alterada. |

### Medição base do banco

Uma versão sintética e fictícia na cardinalidade do item 1, em banco recém-reiniciado, numa transação desfeita ao final. Não é carga real nem estimativa do banco hospedado: geometria, distribuição e retenção reais ficam para o item 3.

| Tabela | Linhas | Heap | TOAST | Índices | Total |
| :-- | --: | --: | --: | --: | --: |
| `deteccoes` | 10.640 | 1.785.856 | 8.192 | 2.154.496 | 3.973.120 |
| `disponibilidade` | 51.830 | 9.437.184 | 8.192 | 3.080.192 | 12.550.144 |
| `municipios` (316 vértices) | 142 | 16.384 | 622.592 | 16.384 | 679.936 |
| `municipios` (73 vértices) | 142 | 172.032 | 8.192 | 16.384 | 221.184 |
| `cargas`, `fontes`, `malhas`, `publicacao_vigente` | 1, 22, 2, 1 | — | — | — | 163.840 |

Total `public`: 17.367.040 bytes (316 vértices) e 16.908.288 bytes (73 vértices); banco inteiro com os schemas do Supabase: 27.809.459 e 27.350.707 bytes. Os vértices por município aproximam as malhas intermediária (44.839/142) e mínima (10.382/142) do item 1, com polígonos sintéticos.

| Operação (316 vértices) | ms |
| :-- | --: |
| Inserir 10.640 detecções / 51.830 município-dias | 344,6 / 1.062,2 |
| Publicar com as conferências do gatilho | 23,1 |
| RP: resumo da janela inteira / de um mês e município | 51,4 / 2,2 |
| RP: página de 1.000 detecções com deslocamento 9.000 | 47,9 |
| RP: disponibilidade da janela inteira / de um município em 365 dias | 48,4 / 42,5 |

Sem `ANALYZE`, dentro da transação, numa máquina local; os tempos indicam ordem de grandeza.

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **CLI Supabase:** `2.122.1` (linha 2.x estável) em vez de `3.0.0`, major publicada em 2026-11-02. Instalação local por npm, sem privilégio administrativo; o plano previa `package.json`/lockfile.
- **Portas `5532x`:** a pilha de outro projeto local ocupa as portas padrão; não foi parada nem alterada.
- **Login por e-mail local:** `[auth.email] enable_signup = true`, porque o Auth recusa login por senha com o provedor de e-mail desligado e os testes da API precisam de sessões reais. Autocadastro local só cria OA. A configuração hospedada é do item 5.
- **Criação do EX:** `ALTER ROLE … NOSUPERUSER` exige superusuário no Supabase. O papel é criado com os atributos restritos, e um papel preexistente com atributo privilegiado interrompe a migração em vez de ser corrigido às cegas.
- **Testes como EX:** só dentro das transações desfeitas dos testes, o `postgres` recebe `SET` sobre `rq_executor` e o EX recebe `USAGE` em `extensions` (pgTAP). Nada disso persiste; o teste estrutural confere que o EX não é membro de nenhum papel.
- **Invariantes por gatilho:** carga parcial ilegível, imutabilidade de carga publicada e conferência das contagens declaradas na publicação ficaram no schema, válidas para qualquer papel. O protocolo `plan`/`apply`, idempotência e concorrência continuam no item 3.
- **`service_role`:** mantém os privilégios padrão do Supabase nas tabelas `public` (credencial administrativa, fora do cliente); não alcança a lista RP. Registrado no ADR-005.
- **Medição:** uma segunda execução sem reiniciar o banco inflou o total para 34.078.720 bytes (espaço das linhas desfeitas). Descartada; a medição registrada usa banco recém-reiniciado, como `npm run medir:banco` faz.
- **CI:** novo job `Database RLS and query contract`, com `npm ci`, pilha local e `npm run test:rls`; sem rede para dados, `local/` ou segredo.

## Encerramento

Não se aplica. Segunda issue de ciclo completo.

## Revisão de segurança G2

Revisão manual externa sobre `3488355` (texto integral não versionado; achados recebidos do responsável). Correções locais, sem commit, na migração `20261107230000_correcoes_revisao_g2.sql`:

| Achado | Correção | Prova |
| :-- | :-- | :-- |
| RS-1 — publicação com snapshot obsoleto | A transição para `publicada` exige `READ COMMITTED`. O gatilho roda depois do bloqueio exclusivo da linha da carga, e toda gravação de linha mantém `FOR SHARE` até o commit; cada contagem usa snapshot novo. `REPEATABLE READ` e `SERIALIZABLE` são recusados (`publicacao_exige_read_committed`). | `executor.test.mjs`, duas conexões do EX: remoção e inserção concorrentes recusadas em RR e em SERIALIZABLE; em RC a publicação espera e falha com `principal 0 de 1` / `2 de 1`; inserção concorrente com a publicação recusada; RR do lado da gravação falha por serialização. |
| RS-2 — EX preexistente associado a `service_role` | `privado.conferir_papel_executor(name)`, chamada ao fim da migração: recusa atributos, associação a outro papel, outros membros (exceto superusuários e quem migra), propriedade, `ALTER ROLE … SET`, privilégio ou política fora do conjunto previsto, opção de concessão, `CREATE` em schema e `CREATE`/`TEMP` no banco. Só o proprietário a executa. | `migracao.test.mjs`: bancos descartáveis no mesmo cluster (papel preexistente) — compatível passa; associado a `service_role` (INHERIT FALSE, SET TRUE), com privilégio em `auth.users` ou com configuração própria interrompe a migração de correção. Caminho limpo: `db reset` recria o papel (conferido). `04_revisao_g2`: 10 casos da conferência. |
| RS-3 — carga parcial aceita como completa | `privado.manifestos_aprovados`: o proprietário grava; o EX só lê. A publicação exige manifesto com a mesma identidade e campos iguais (satélite, janela, envelope, fuso, método e totais), janela em dias GMT inteiros e grade D1 completa (`total_disponibilidade` = municípios × dias, com a contagem real igual). | `04_revisao_g2`: D1 vazia, grade incompleta, manifesto divergente, ausente e janela fracionária recusados; carga conforme publicada; EX não insere, altera nem apaga manifesto. |
| RS-4 — `OVERRIDING SYSTEM VALUE` | `INSERT` do EX em `cargas` só nas 12 colunas de ingestão; `id`, `estado` e datas ficam com o banco. | `executor.test.mjs`: override, `estado`, `criada_em` e `publicada_em` recusados; inserção normal usa a sequência. `01_estrutura` confere os grants por coluna. |
| Lacunas G2 | Tabelas filhas lidas pelo ID de cargas em preparação e retiradas, sem JOIN; três consultas com AN, OA, RP sem cadastro, RP autorizado e RP revogado; login SQL real do EX e DDL negada, inclusive `CREATE TEMP TABLE` (privilégio `TEMPORARY` revogado de `PUBLIC` e devolvido a cada papel existente, exceto o EX). | `02_matriz_acesso` e `api.test.mjs` (SQL e API); `executor.test.mjs` (21 comandos de DDL, troca de papel e acesso a `privado` negados). |
| Extensões privilegiadas (D3) | EX criado sem `LOGIN`; o responsável liga login e senha só na janela de carga e desliga depois. `privado.auditar_exposicao()` (só o proprietário) lista extensão em `public`/`privado`, função de `public` executável por `anon`/`authenticated` além das três consultas, relação fora do contrato e EX com `LOGIN` ligado. | `executor.test.mjs`: login recusado com a janela fechada; na janela, a extensão criada pelo EX aparece na auditoria, e a remoção administrativa a limpa. `01_estrutura`: EX sem `LOGIN` e auditoria vazia após as migrações. `04_revisao_g2`: auditoria aponta extensão, funções expostas, relação extra e login ligado. |

**Achados novos desta rodada:**

- **Extensões privilegiadas (lacuna da plataforma, aceita com controle em D3).** O `supautils` do Supabase cria as cerca de 70 "extensões privilegiadas" como `supabase_admin` para qualquer papel com login, sem exigir `CREATE` no banco ou no schema e sem passar por gatilhos de evento (sonda com gatilho `ddl_command_start` do `postgres`: bloqueou `CREATE TABLE`, não `CREATE EXTENSION`). O EX criou `seg` e `cube` em `public` e `tablefunc` em `privado`; as funções de `seg` ficaram executáveis por `anon`, logo expostas pelo PostgREST. Nenhuma migração consegue impedir; o risco residual fica restrito à janela de carga com a credencial EX.
- **Consulta de carga indisponível responde HTTP 500.** `sem_publicacao` e `carga_indisponivel` (P0002) chegam como 500 pelo PostgREST v16.5 local, sem dado. Não é falha de acesso; é contrato de erro.

**Decisões do responsável:** "Adopt recommended (a)", em 2026-11-07, em resposta às decisões D1 a D3 apresentadas abaixo; adota a opção (a) nas três. Vale além desta sessão e orienta o roteiro do item 5 (issue #24):

- D1 (a): o responsável registra o manifesto aprovado por SQL administrativo no destino, antes da carga pelo EX, como o cadastro do RP. Etapa a incluir no roteiro do item 5.
- D2 (a): sem regra nova; o manifesto aprovado fixa `metodo` (regra de histórico) e a publicação exige a grade D1 completa.
- D3 (a): implementado nesta correção (EX sem `LOGIN` e auditoria). O roteiro do item 5 inclui abrir e fechar a janela de login, comparar a lista de extensões antes e depois, rodar a auditoria e conferir no projeto hospedado se o `supautils` se comporta como no local.

Alternativas apresentadas:

- **D1 — quem registra o manifesto aprovado.** (a) O responsável, por SQL administrativo no destino, como o cadastro do RP, acrescentando essa etapa à tabela do item 5 (recomendado). (b) Uma migração por carga, revisada em PR (versiona hash e totais públicos; uma migração por atualização).
- **D2 — H3 na publicação.** (a) Manter como está: o manifesto aprovado fixa `metodo`, onde fica a regra de histórico escolhida, e a grade D1 completa (recomendado; sem regra nova). (b) Acrescentar ao manifesto as contagens por alcance do histórico (verificado, parcial, indisponível) e conferi-las na publicação.
- **D3 — extensões privilegiadas.** (a) Aceitar com controles: EX criado sem `LOGIN`; o responsável liga login e senha só na janela da carga e desliga depois; auditoria pós-carga das extensões e funções expostas; conferir no item 5 se o projeto hospedado se comporta igual (recomendado). (b) Não dar login SQL ao EX no destino e rever o desenho do item 5 (mudança de plano). (c) Outra.
- **Fora do bloqueio:** HTTP 500 de P0002 (sugestão: `PT404` para 404 nesta PR ou no item 4) e revogação dos privilégios de `service_role` nas tabelas `public` (recomendação: migração antes da implantação do item 5; hoje `service_role` não publica, porque não alcança `privado`, mas lê cargas em preparação e grava contornando RLS). Limites das respostas JSON: hoje limitados por construção (série ≤ dias da janela, municípios ≤ `total_municipios`, registros ≤ 1.000 por página, dias de disponibilidade só com município); bytes e egress reais são medidos no item 3 e na interface do item 4, como o plano prevê.

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
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-21/item-2 + f8106a56f12c7d8e0354fb693f36d98db7b2c0ad`
- `effect_class`: `remote_mutation`
- `state_before`: item 1 integrado pela PR #25; task #20 `Aguardando integração` sem reconciliação; issue #21 aberta, sem task, branch, banco ou migração.
- `state_after`: item 2 implementado e testado localmente; task #20 reconciliada como `Concluída`; branch `feature/issue-21` publicada e PR #26 aberta; task `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorização literal registrada; `npm run test:rls` com 105 asserções pgTAP e 3 testes de API aprovados; 144 testes das demais suítes; validador sem erros ou avisos; `git diff --check` limpo; varredura G3; medição base registrada; PR #26 real com `Closes #21`.
- `blockers`: nenhum para a entrega publicada. A integração exige checks verdes no último commit e "aprovo o merge da PR #26". A issue #22 depende da integração do item 2 e de autorização própria.

### Handoff de saída — correções da revisão G2

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-21/revisao-g2 + 3488355049d118a63f4485035534b0b19f190291`
- `effect_class`: `remote_mutation`
- `state_before`: PR #26 aberta em `3488355`, checks verdes; revisão G2 com quatro bloqueadores (RS-1 a RS-4) e lacunas de teste.
- `state_after`: correções, testes e decisões D1 a D3 (opção a) publicados na PR #26 (`feature/issue-21`) por commit posterior a `3488355`; task `Aguardando integração`, situação `Aguardando merge`.
- `result`: `executed`
- `evidence`: reprodução e prova na pilha descartável (ver "Evidências" e "Revisão de segurança G2"); 168 asserções pgTAP e 13 testes Node; demais suítes, validador e varredura G3; decisão literal "Adopt recommended (a)"; autorização literal "Commit e push"; commit publicado na PR #26.
- `blockers`: nenhum para a publicação. A integração exige checks verdes no último commit e "aprovo o merge da PR #26".

## Referência do bootstrap

Não se aplica ao ciclo 003; nenhuma exceção do ciclo 000 foi utilizada.
