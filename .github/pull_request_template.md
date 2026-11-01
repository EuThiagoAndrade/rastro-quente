## Contexto e objetivo

## Ciclo, plano e issue

- Ciclo (ou `trilha curta`):
- Nível: `trilha curta | leve | completo`
- Modo contínuo: `— | ativo | suspenso`
- Plano (ou `—` na trilha curta):
- Issue associada: `Closes #N` (número real).
- Encerramento documental sem issue: `Não se aplica — closure do ciclo NNN`.
- Bootstrap: `Não se aplica — bootstrap do ciclo 000`, exclusivamente na branch `chore/cycle-000-plan`, com plano/task nominais, nível completo e modo contínuo `—` conforme `_project/README.md`.
- Task persistente:

Exceção restrita do backlog: PR que altera somente `_project/backlog.md` usa `Não se aplica — manutenção de conteúdo do backlog` para ciclo/nível/plano/issue/task, sem fechamento artificial. Modo contínuo `—`; informar base/tip e pedido explícito de publicação. G3, checks e aprovação própria do merge continuam obrigatórios.

## Mudanças

Se houver origem no backlog, declarar IDs e parcela, referência ao snapshot do destino e dependência: os IDs devem existir em main antes do merge desta PR. Não incluir o lote do backlog na branch do destino.

## Fora do escopo

## Barreiras de domínio

Preencher `Aplica-se?` exclusivamente com `Sim` ou `Não` e justificar cada linha.

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | | Casos de referência independentes e proveniência quando aplicável |
| G2 — autenticação, autorização e RLS | | Testes de acesso permitido/negado quando aplicável |
| G3 — privacidade de dados | | Sem dados privados em código, documentos ou fixtures |
| G4 — migrações só acrescentam | | Nenhuma migração existente alterada, renomeada ou removida |

## Validação

- [ ] Testes aplicáveis executados.
- [ ] `node scripts/validate-governance.mjs` executado.
- [ ] `git diff --check` passou.
- [ ] Staging revisado e limitado ao escopo autorizado.
- [ ] Nenhum segredo ou valor real de ambiente foi incluído.
- [ ] Documentação e task refletem resultados reais.

## Riscos, rollback e revisão manual

## Gates pendentes

- [ ] Checks remotos concluídos.
- [ ] Aprovar merge concedido ("aprovo o merge da PR #N").

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
