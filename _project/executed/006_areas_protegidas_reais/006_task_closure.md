# Task — Encerramento do ciclo 006

> **Ciclo:** `006`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `chore`
> **Issue:** `— (encerramento documental, sem issue própria)`
> **Plano:** `_project/executed/006_areas_protegidas_reais/006_plan.md`
> **Branch:** `chore/cycle-006-closure`
> **PR:** [#58](https://github.com/EuThiagoAndrade/rastro-quente/pull/58)
> **Integração:** `Pendente`
> **Encerramento prospectivo:** `Sim`
> **Autorização inicial:** encerramento previsto na aprovação humana do plano v5 ("aprovo o plano do ciclo 006", 2026-11-12); pedido explícito "dispensar a verificação em produção do ciclo 006" em 2026-11-14
> **Modo contínuo:** `—`
> **Início:** 2026-11-14
> **Última atualização:** 2026-11-14
> **handoff_schema_version:** `2`

## Objetivo

Encerrar o ciclo 006 depois da integração dos itens 1 a 4, reconciliando plano e tasks, consolidando na documentação viva as fontes de áreas protegidas (CNUC e FUNAI), a persistência sob RLS, a lente de sobreposição e a camada territorial no mapa, e registrando a decisão do responsável de dispensar a verificação em produção. Nenhum resultado hospedado será alegado.

## Escopo autorizado

A aprovação do plano v5 cobre o encerramento depois das entregas. O responsável determinou dispensar a verificação em produção em 2026-11-14.

- **Cobre:** mover o plano, o relatório e as tasks do ciclo para `executed/`; marcar o plano e as tasks como concluídos prospectivamente; reconciliar `cycles.md`; atualizar o README e as KBs-003, 005 e 006; publicar a PR de encerramento.
- **Não cobre:**
  - o merge da PR de encerramento, que exige checks verdes e "aprovo o merge da PR #N";
  - executar ou alegar a verificação hospedada dispensada;
  - retorno do BL-002 ao backlog, que só ocorre depois da integração deste encerramento e por workflow/autorização próprios;
  - mudança de código, dados ou método.

## Origem no backlog

Snapshot herdado do plano: BL-002, parcela de fontes, camada e sobreposição, referência `_project/backlog.md` no commit `83e3a58`. O retorno à fila só será registrado depois da integração do encerramento em `main`, sob `gerenciar_backlog` e com autorização própria. Esta PR não altera o backlog.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | O encerramento preserva as regras aprovadas, as conferências locais de pertencimento e SQL e as ressalvas de que a seleção não é ranking nem prova de incêndio, dano, autoria ou infração. A verificação hospedada dispensada é declarada como não executada. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Mudanças documentais; nenhuma função, política ou grant. |
| G3 — privacidade de dados | Sim | Só agregados públicos e estados de PR/checks. Sem dados reais de pessoa, segredo, domínio de produção ou arquivos de `local/`. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Execução

- [x] Confirmar PRs #48, #53, #54, #55 e #56 integradas; issues #49, #50, #51 e #52 fechadas; checks das PRs verdes.
- [x] Registrar na task #52 a integração da PR #56 e a decisão humana de dispensar a verificação hospedada, sem inventar medições.
- [x] Mover plano, relatório e tasks para `_project/executed/006_areas_protegidas_reais/` e definir o encerramento prospectivo.
- [x] Atualizar `cycles.md`, README, KB-003, KB-005 e KB-006; manter o retorno do BL-002 para uma ação separada.
- [x] Executar o validador de governança e `git diff --check`; revisar diff e privacidade.
- [x] Publicar a PR própria do encerramento.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Entregas integradas | PR #48 documental (`9d84efb`); PR #53 (`57c279e`), PR #54 (`acb54c0`), PR #55 (`453d046`) e PR #56 (`652017f`) integradas por squash; issues #49, #50, #51 e #52 fechadas. |
| Checks remotos | PRs #48, #53, #54, #55 e #56 com três checks verdes. |
| Conferências locais | `conferir:areas`: etapa 1 reproduziu exatamente a exploração, etapa 2 coincidiu com o pipeline em 10.640 detecções e explicou as parcelas; `conferir:sobreposicao`: coincidiu célula a célula por SQL independente nas três classes e três janelas. |
| Medições locais | Visão geral da camada 359.581 bytes (≤ 600.000); acréscimo ao banco de 4.128.768 bytes (≤ 10 MB); lentes de proteção integral e uso sustentável dentro do tempo; terra indígena (42,3 s) com desvio aceito pelo responsável no item 4. |
| Ação humana externa | Ação externa da issue #50 concluída pelo responsável em 2026-11-13 (migração e carga hospedadas aplicadas). |
| Verificação em produção | Dispensada pelo responsável em 2026-11-14 para priorizar velocidade. Não foram observados dados hospedados; nenhum resultado em produção é alegado ou inferido. |
| Validador de governança | 0 erros, 0 avisos e 9 itens de conferência manual. |
| `git diff --check` e revisão do diff | Sem erros. Revisão estritamente documental. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Verificação hospedada dispensada:** em 2026-11-14, o responsável manifestou "dispensar a verificação em produção do ciclo 006" para ganhar velocidade, confiando nas suítes completas de testes e medições locais. Este desvio substitui a etapa exigida pelo plano para o encerramento do ciclo 006; nenhum resultado de produção é inferido.
- **Desvio de desempenho local mantido:** a sobreposição de terra indígena excedeu o tempo de 20,0 s (42,3 s) devido a 51 consultas municipais de disponibilidade. O responsável aceitou o desvio local e adiou a otimização no item 4.
- **Retorno ao backlog:** BL-002 permanece disponível até a integração do encerramento em main; o registro do retorno e sua publicação são executados separadamente via `gerenciar_backlog`.

## Encerramento

O estado prospectivo vale depois do merge desta PR: plano `Concluído`, tasks `Concluída`, ciclo em `executed/`, `cycles.md` atualizado e documentação viva consolidada em README, KB-003, KB-005 e KB-006. A verificação hospedada permanece registrada como dispensada, sem resultado de produção. O retorno de BL-002 continua separado.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 006 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + atualizar_docs + encerramento + 652017f`
- `effect_class`: `remote_mutation`
- `state_before`: ciclo 006 `Em execução`; PRs #48, #53, #54, #55 e #56 integradas; issues #49 a #52 fechadas; dispensa de verificação em produção determinada pelo responsável; base `main` em `652017f`.
- `state_after`: documentação consolidada e encerramento prospectivo preparado nesta branch; PR publicada; merge aguardando aprovação específica.
- `result`: `executed`
- `evidence`: PRs #48, #53, #54, #55 e #56; commits integrados; relatórios e medições locais; validação de governança aprovada.
- `blockers`: merge da PR de encerramento depende de checks verdes e "aprovo o merge da PR #N".

## Referência do bootstrap

Não se aplica ao ciclo 006.
