# Task — Issue #21: Fundar banco e autorização RLS do protótipo

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `feature`
> **Issue:** `#21`
> **Plano:** `_project/drafts/003_implementacao_prototipo/003_plan.md`
> **Branch:** `feature/issue-21`
> **PR:** —
> **Integração:** `Pendente`
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
| G2 — autenticação, autorização e isolamento por RLS | Sim | RLS em 7/7 tabelas `public`; grants auditados; uma única `security definer` restrita; EX sem atributos privilegiados. Matriz por SQL (`02_matriz_acesso`, 47 asserções) e pela API real (`scripts/banco/api.test.mjs`): AN, OA com metadados de RP, RP antes do cadastro, cadastro, leitura, revogação na mesma sessão, token adulterado e expirado. |
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
- [ ] Publicar a branch e abrir a PR com `Closes #21`.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Precondições | Issue #21 `OPEN`; PR #25 `MERGED` (`f8106a5`), Governance verde na PR e em `main`; issue #20 fechada; nenhuma branch `feature/issue-21` remota antes da criação. |
| Ambiente | Windows 11, Docker 29.9.2, Node.js `v24.15.0`, Supabase CLI `2.122.1`, Postgres `17.11` local. Outro projeto Supabase local ocupava as portas padrão e não foi tocado. |
| `npm run test:rls` | Reset do zero com as 3 migrações; pgTAP 105/105 (`01_estrutura` 19, `02_matriz_acesso` 47, `03_consultas` 39); API 3/3 testes. |
| Medição base | Ver "Medição base do banco". |
| Testes existentes | `npm run test:prototipo`, `npm run test:prova-dados` e `node --test scripts/validate-governance.test.mjs`: ver registro da publicação. |
| Validador | Pendente da publicação. |
| `git diff --check` | Pendente da publicação. |
| Checks remotos | Pendente. |

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

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Pronto para continuar — ciclo 003 (completo)
Quem: Qualquer ferramenta, a pedido do responsável
Conferir: —
Diga: "continue o ciclo 003"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-21/item-2 + f8106a56f12c7d8e0354fb693f36d98db7b2c0ad`
- `effect_class`: `remote_mutation`
- `state_before`: item 1 integrado pela PR #25; task #20 `Aguardando integração` sem reconciliação; issue #21 aberta, sem task, branch, banco ou migração.
- `state_after`: item 2 implementado e testado localmente; task #20 reconciliada como `Concluída`; publicação da PR pendente.
- `result`: `executed`
- `evidence`: autorização literal registrada; `npm run test:rls` com 105 asserções pgTAP e 3 testes de API aprovados; medição base registrada.
- `blockers`: publicação pendente neste mesmo workflow.

## Referência do bootstrap

Não se aplica ao ciclo 003; nenhuma exceção do ciclo 000 foi utilizada.
