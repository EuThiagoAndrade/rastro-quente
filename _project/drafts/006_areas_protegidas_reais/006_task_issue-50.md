# Task — Issue #50: Tabelas de áreas protegidas, acesso e carga

> **Ciclo:** `006`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#50`
> **Plano:** `_project/drafts/006_areas_protegidas_reais/006_plan.md`
> **Branch:** `feature/issue-50`
> **PR:** [#54](https://github.com/EuThiagoAndrade/rastro-quente/pull/54)
> **Integração:** PR #54 integrada em 2026-11-13 (`acb54c0`)
> **Autorização inicial:** "autorizo a implementação da issue #50" em 2026-11-13
> **Modo contínuo:** `—`
> **Início:** 2026-11-13
> **Última atualização:** 2026-11-13
> **handoff_schema_version:** `2`

## Objetivo

Persistir áreas protegidas e vínculos com isolamento e publicação verificável conforme T21.

## Escopo autorizado

Item 2 do plano e issue #50: migração aditiva, testes de acesso e publicação, manifesto, carga, medição, ADR-008 e runbook. Sem alteração da interface, RPC ou view.

## Origem no backlog

BL-002, snapshot e parcela conforme plano 006, referenciado a `_project/backlog.md` no commit `83e3a58`, integrado em main; destino em preparação.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Preservar vínculos e totais conferidos no item 1. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Matriz de acesso, testes pgTAP e API exigidos. |
| G3 — privacidade de dados | Sim | Dados reais locais; fixtures fictícias e evidências agregadas. |
| G4 — migrações só acrescentam | Sim | Nova migração; nenhuma migração existente alterada. |

## Execução

- [x] Implementar migração, carga e testes.
- [x] Medir volume, demonstrar rollback e registrar documentação.
- [x] Executar gates e publicar PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `test:rls`: 200 pgTAP e 36 Node passaram; após ampliar casos SQL, 202 pgTAP passaram. Protótipo: 67; interface: 79; governança: 55. Typecheck e build passaram; E2E: 68 passaram. |
| Validador | 0 erros e 0 avisos, com itens manuais. |
| `git diff --check` | Passou; avisos de conversão de fim de linha. |
| Checks remotos | Validate governance, Database RLS and query contract e Interface typecheck, build and E2E passaram na PR #54. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

A PR #53 foi integrada em 2026-11-13; a issue #49 está fechada. O MCP GitHub via Docker retornou 401; a consulta foi feita por `gh`.

`npm run medir:carga` publicou a carga real local com identidade `d0739e4e5e5d853e673748c13502357bc0b2e0a72c588ed88e32801f86756813`: 154 áreas e 2.831 vínculos. Por classe: proteção integral 65 áreas e 82 vínculos, uso sustentável 15 e 254, TI 74 e 2.495. Os totais de áreas coincidem com o relatório da issue #49; vínculos não são detecções distintas. Reexecução reconciliada sem aumento de espaço. As tabelas de áreas e vínculos acrescentaram respectivamente 3.465.216 e 614.400 bytes; somando conservadoramente toda a tabela de fontes da primeira carga (49.152 bytes), 4.128.768 bytes, abaixo de 10.000.000. A carga completa ocupou 21.716.992 bytes; a versão sem camada ocupou 17.424.384 bytes em outra sequência de alocação. A diferença entre as duas medições completas é 4.292.608 bytes, também abaixo do teto; espaço reutilizado e índices tornam a diferença dependente do estado do banco.

O rollback com `--sem-areas --revisao 2` publicou identidade nova `8606f1cc3887cdb1227ae6783184858294295c66881f34f8f0357b2edfb740c8`, sem linhas de área ou vínculo. Os SHA-256 de `areas.json` e `deteccoes_areas.csv` ficaram iguais antes e depois; a expiração removeu as versões retiradas em contagens iguais à simulação prévia. A medição ocorreu só no Supabase local; não comprova consumo ou implantação hospedados. A recuperação automatizada da FUNAI permanece não demonstrada após 403, como no relatório da issue #49.

Uma execução simultânea dos testes SQL e API interferiu no banco local compartilhado e falhou; ambos foram repetidos em sequência e passaram. A primeira suíte completa falhou apenas por expectativa de reconstrução sem as duas tabelas novas; corrigida e repetida com sucesso.

### Roteiro da ação humana externa após integração

1. O responsável atualiza `main` e confere `supabase db push --dry-run` contra o histórico hospedado e as migrações do repositório. Parar diante de divergência, reset ou repair; aplicar somente a migração pendente aprovada.
2. Com os mesmos insumos locais fixados, abre a janela EX e executa `plan --alvo … --sql …`, verifica orçamento, totais e identidade integral contra a execução local; revisa e aprova o SQL do manifesto como proprietário. Não compartilha senhas ou chaves com o agente.
3. Aplica com a identidade conferida, verifica `resumo` e registra contagens por classe; fecha o LOGIN do EX e confere `privado.conferir_papel_executor('rq_executor')` e `privado.auditar_exposicao()` vazia, além das extensões conforme runbook.
4. Em caso de falha ou resultado ambíguo, parar e reconciliar; não limpar às cegas. Para reversão, preparar uma revisão nova com `--sem-areas` no plano e no apply, mantendo os insumos. Informar a conclusão pela frase prevista depois da integração; o agente só confere o que for acessível por leitura.

### Ação humana externa concluída

"concluí a ação externa da issue #50" em 2026-11-13. Executada pelo responsável conforme o roteiro acima; o agente conferiu as saídas apresentadas, sem credenciais. Não houve acesso de leitura próprio ao banco hospedado: a rede corporativa bloqueia a conexão direta ao Postgres e o agente não tem credencial de leitura. A execução usou a rede móvel do responsável.

- `db push --dry-run` listou somente `20261113120000_areas_protegidas.sql`; o push aplicou essa migração.
- Conferência pós-migração: versão registrada; `rq_executor` sem `LOGIN` e com os demais atributos falsos; `conferir_papel_executor` sem erro; `auditar_exposicao()` vazia; `service_role_le` falso; RLS ativa nas 11 tabelas de `public` e `privado`, inclusive `areas` e `deteccoes_areas`. Extensões: `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp`.
- Com verificação TLS ativa, a conexão do Node exigiu a CA do Supabase (`Supabase Root 2021 CA`, válida até 2031-04-26, SHA-256 `80:70:25:AD:…:CA:FA`) por `NODE_EXTRA_CA_CERTS`, em arquivo local ignorado. A verificação não foi desligada.
- `plan` hospedado: identidade `d0739e4e5e5d853e673748c13502357bc0b2e0a72c588ed88e32801f86756813`, igual à local; 154 áreas e 2.831 vínculos; sem paradas; consumo existente 29.652.659 bytes, pico previsto 65.366.632, margem 334.633.368 sob o teto de 400.000.000. Manifesto revisado e aprovado pelo responsável.
- `apply`: `executed` na primeira tentativa, 35.252 ms; carga 2 publicada e carga 1 retirada; 23.818.890 bytes enviados.
- `resumo`: estado `publicada`, mesma identidade; proteção integral 65 áreas e 82 vínculos, uso sustentável 15 e 254, TI 74 e 2.495, iguais à carga local. JSON guardado na cópia local.
- Janela fechada: `nologin` com sucesso, `conferir_papel_executor` sem erro, `auditar_exposicao()` vazia e extensões iguais às da conferência pós-migração.

A versão retirada não foi expirada; a expiração é opcional pelo runbook e não integra este roteiro.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando autorização de implementação — ciclo 006 (completo)
Quem: Responsável
Conferir: Issue [#51](https://github.com/EuThiagoAndrade/rastro-quente/issues/51) e escopo do item 3 do plano
Diga: "autorizo a implementação da issue #51"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + acao_externa + 50 + acb54c0`
- `effect_class`: `local_mutation`
- `state_before`: PR #54 integrada; migração e carga hospedadas pendentes; task ainda registrada como `Aguardando integração`.
- `state_after`: integração reconciliada; migração `20261113120000` e carga `d0739e4e…6813` publicadas no Supabase hospedado pelo responsável; task `Concluída`.
- `result`: `executed`
- `evidence`: PR #54 integrada em `acb54c0` com três checks verdes; saídas de `db push`, conferência SQL, `plan`, `apply`, `resumo` e fechamento da janela apresentadas pelo responsável e conferidas acima.
- `blockers`: nenhum para a issue #51; conferência hospedada pelo agente não foi possível por leitura própria.

### Registro anterior — publicação da PR

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + implementar_issue + 50 + 57c279e5cd6e58f5a7380e077bb4bd7bb917306d`
- `effect_class`: `remote_mutation`
- `state_before`: implementação e gates locais concluídos, issue aberta e branch publicada.
- `state_after`: PR #54 aberta; integração pendente.
- `result`: `executed`
- `evidence`: PR #54 aberta; commit de implementação `180130e`; gates e medição locais registrados acima.
- `blockers`: checks remotos e aprovação específica do merge pendentes.
