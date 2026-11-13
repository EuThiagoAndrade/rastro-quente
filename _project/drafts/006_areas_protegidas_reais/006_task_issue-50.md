# Task — Issue #50: Tabelas de áreas protegidas, acesso e carga

> **Ciclo:** `006`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#50`
> **Plano:** `_project/drafts/006_areas_protegidas_reais/006_plan.md`
> **Branch:** `feature/issue-50`
> **PR:** [#54](https://github.com/EuThiagoAndrade/rastro-quente/pull/54)
> **Integração:** `Pendente`
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
| Checks remotos | Pendente |

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

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 006 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #54
Diga: "aprovo o merge da PR #54"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + implementar_issue + 50 + 57c279e5cd6e58f5a7380e077bb4bd7bb917306d`
- `effect_class`: `remote_mutation`
- `state_before`: implementação e gates locais concluídos, issue aberta e branch publicada.
- `state_after`: PR #54 aberta; integração pendente.
- `result`: `executed`
- `evidence`: PR #54 aberta; commit de implementação `180130e`; gates e medição locais registrados acima.
- `blockers`: checks remotos e aprovação específica do merge pendentes.
