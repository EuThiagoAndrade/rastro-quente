# Task — Encerramento do ciclo 004

> **Ciclo:** `004`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `chore`
> **Issue:** `— (encerramento documental, sem issue própria)`
> **Plano:** `_project/executed/004_contrato_lentes_selecao/004_plan.md`
> **Branch:** `chore/cycle-004-closure`
> **PR:** PR própria de encerramento desta branch
> **Integração:** `Pendente`
> **Encerramento prospectivo:** `Sim`
> **Autorização inicial:** encerramento previsto na aprovação humana do plano v3 ("aprovo o plano do ciclo 004", 2026-11-11); decisão do responsável sobre a verificação em produção em 2026-11-11
> **Modo contínuo:** `—`
> **Início:** 2026-11-11
> **Última atualização:** 2026-11-11
> **handoff_schema_version:** `2`

## Objetivo

Encerrar o ciclo 004 depois da integração das três lentes. O encerramento registra a verificação em produção, com o desvio aceito pelo responsável, e consolida na documentação viva o que o ciclo mudou no produto.

## Escopo autorizado

A aprovação do plano v3 cobre o encerramento depois das entregas. Antes de preparar o encerramento, o responsável decidiu sobre a verificação em produção incompleta. A resposta literal foi: "Vamos manter os dados que passei apenas. E vamos para a próxima etapa." Essa é a alternativa do plano "aceitar e registrar o desvio no encerramento".

- **Cobre:** reconciliar plano e tasks; mover o ciclo para `executed/`; atualizar `cycles.md`, README, KB-003 e KB-005; publicar a PR de encerramento.
- **Não cobre:**
  - o merge, que exige checks verdes e "aprovo o merge da PR #N";
  - o retorno de BL-001 ao backlog, que vem depois da integração em `main` e tem publicação separada;
  - qualquer mudança de código, dados ou método.

## Origem no backlog

Snapshot herdado do plano: BL-001, item inteiro, referência `_project/backlog.md` em `85b444d`. O retorno ao backlog (`ciclo 004`) só é registrado depois de comprovada a integração deste encerramento em `main`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | O registro preserva o resultado conferido das três lentes, sem divergência na carga real, e os limites declarados: lente não é ranking nem prova de incêndio, dano ou infração. A verificação hospedada fica registrada com o que conferiu e com o que não foi verificado. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Diff só em Markdown; nenhuma função, política ou grant. |
| G3 — privacidade de dados | Sim | Só agregados públicos (contagens e células de detecções do INPE, municípios do IBGE) e dados técnicos do deploy. Sem identidade de conta, domínio de produção, segredo ou dado pessoal. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Execução

- [x] Confirmar as PRs #36, #37 e #38 integradas, as issues #33 a #35 fechadas e a CI do `main` verde em `8e023d8`.
- [x] Registrar a verificação em produção e a decisão do responsável na task da issue #35 e no plano.
- [x] Mover o ciclo para `executed/`, com plano `Concluído`, tasks `Concluída`, pós-mortem e bloco "Concluído".
- [x] Atualizar `cycles.md`, README, KB-003 e KB-005.
- [x] Validar a governança local e revisar o diff e a privacidade.
- [ ] Integrar a PR de encerramento com checks verdes e aprovação explícita.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Entregas integradas | PRs #36 (`69575ad`), #37 (`4e4d56f`) e #38 (`8e023d8`) integradas em 2026-11-11; issues #33, #34 e #35 fechadas. |
| Conferência e medição | [Relatório](004_research_conferencia_lentes.md). Conferência sem divergência nas três lentes e quatro janelas; medianas comprimidas de 5,9 s, 14,3 s e 8,7 s, dentro do orçamento de 20,0 s. |
| Verificação em produção | [Task da issue #35](004_task_issue-35.md), "Resultado da verificação em produção". Confere: deploy `8e023d8`, 10, 150 e 66 destaques, células das pontas e `gzip`. Desvio aceito: sem identidade da carga, uma execução por lente, recorrência e persistência com a memória preenchida. |
| Validação local | Ver "Handoff de saída". |
| Checks da PR de encerramento | Conferir no GitHub antes do merge. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Verificação em produção parcial aceita.** O roteiro pedia a identidade da carga, 3 execuções válidas por lente com recarga e os valores completos dos destaques. A devolutiva trouxe uma execução por lente. Os volumes indicam que a recorrência e a persistência reaproveitaram a memória da lente: 892 kB na persistência, contra 6,7 MB brutos com a memória vazia. O responsável decidiu manter a evidência informada. Por isso, o orçamento hospedado ficou sem mediana. A única execução com a memória vazia (concentração, 13,0 s) ficou abaixo de 20,0 s.
- **Teste E2E de logout local.** Ele falhou neste Windows nos itens 1 e 3 e passou na CI de todas as PRs. Fica relatado, fora do escopo do ciclo.

## Encerramento

O estado prospectivo vale depois do merge da PR de encerramento: plano `Concluído`, tasks `Concluída`, ciclo em `executed/`, `cycles.md` atualizado e documentação viva consolidada (README, KB-003 e KB-005).

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 004 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + atualizar_docs + encerramento + 8e023d81b1acb5572873d11caab7084b4e083b3c`
- `effect_class`: `remote_mutation`
- `state_before`: ciclo `004` em execução; três entregas integradas; verificação em produção parcial, com a decisão do responsável de manter a evidência.
- `state_after`: documentação viva consolidada e encerramento prospectivo preparado; PR de encerramento publicada, aguardando checks e merge.
- `result`: `executed`
- `evidence`: PRs #36 a #38 e issues #33 a #35 conferidas com `gh`; execução 43064246424 do `main` verde; governança local com 55 testes aprovados, validador sem erros ou avisos e `git diff --check` limpo.
- `blockers`: a integração depende de checks verdes e de "aprovo o merge da PR #N" para a PR de encerramento.

## Referência do bootstrap

Não se aplica ao ciclo 004.
