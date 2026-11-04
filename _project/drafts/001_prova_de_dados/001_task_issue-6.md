# Task — Issue #6: Referência independente e relatório de viabilidade

> **Ciclo:** `001`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `chore`
> **Issue:** `#6`
> **Plano:** `_project/drafts/001_prova_de_dados/001_plan.md`
> **Branch:** `chore/issue-6`
> **PR:** https://github.com/EuThiagoAndrade/rastro-quente/pull/9
> **Integração:** `Pendente`
> **Autorização inicial:** "Autorizo a #6" em 2026-11-03
> **Modo contínuo:** `—`
> **Início:** 2026-11-03
> **Última atualização:** 2026-11-04
> **handoff_schema_version:** `2`

## Objetivo

Item 3 do plano: comparar a série VIIRS do INPE com o NASA FIRMS (D5 a D9), apoiar a conferência manual de 10 a 20 casos (D8 c), consolidar o relatório de viabilidade e concluir segundo D7 b.

## Escopo autorizado

Os itens da issue #6: `comparar.mjs` e `decisoes.json`, módulos de apoio e testes, preparo do registro dos casos e do roteiro, e a consolidação do relatório. Não cobre merge, nova dependência, serviço pago ou mudança de regra. A autorização de implementação não cobre a ação externa do responsável (escolher e conferir os casos no mapa). A frase registrada, "Autorizo a #6", respondeu à pergunta "Autoriza a implementação da issue #6?" feita ao responsável.

## Origem no backlog

Não se aplica. Herdado do plano: demanda direta do responsável, sem ID do backlog.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Decisões D5 a D9 lidas de `decisoes.json`, transcritas do plano; combinações não admitidas recusadas (testes). Casos de referência fictícios calculados à mão: exemplos de D5 (F1 e F2, tolerâncias 10% e 25%, zeros, limite exato), de D9 (S1, S2, S3, E1, E2), de D8 (alternativas a, b e c, exemplos 1 e 2) e de D7 (C-d = 3 viável, C-p = 4 inviável). Proveniência: SHA-256 dos 57 arquivos do FIRMS, da malha e da contagem conferido antes de comparar. Duas execuções reais com saída idêntica. Conferência independente das contagens: `awk` para P; comparação com o FIRMS para V. Nenhuma regra de seleção produzida. Modo contínuo `—` |
| G2 — autenticação, autorização e isolamento por RLS | Não | Sem banco, tabela ou usuário |
| G3 — privacidade de dados | Sim | Fontes públicas; brutos e saídas só em `local/`; CSV versionado só fictício em `tests/fixtures/`; `casos.json` terá só id, coordenadas e instante do INPE (públicos), sem atributos de pessoas ou imóveis; a `MAP_KEY` não é lida por estes scripts |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Branch `chore/issue-6` a partir de `main` com as issues #4 e #5 integradas.
- [x] `decisoes.json` (D1 a D9 transcritas) e validação de combinações; recusa do que as decisões do plano excluem.
- [x] `firms.mjs`: leitura dos CSV do FIRMS (UTC), contagem no polígono, repetidos entre janelas e fora do trimestre.
- [x] `comparar.mjs`: D5 (F1 e F2), K por D9 (S1, S2, S3, E1, E2), M por D8 (a, b, c), conclusão por D7 b, tabela de casos.
- [x] Execução real: as 9 comparações mês × satélite concordam (diferença máxima 4,85%); K = 3 de 3; M indeterminado; conclusão provisória "evidência insuficiente".
- [x] `casar.mjs`: onde as séries diferem (todos os registros só do INPE em outubro, de 2026-10-09 a 2026-10-20; causa não determinada).
- [x] `candidatos.mjs`: 28 candidatos determinísticos para o responsável escolher (arquivo local).
- [x] Relatório consolidado (seções 9 a 11), com o cabeçalho da tabela de casos.
- [x] **Conferência dos casos (desvio declarado):** o responsável informou que não sabia operar o mapa e escolheu, em 2026-11-04, "Eu confiro no navegador" (resposta à pergunta de como seguir). O agente conferiu 15 casos (P1, P2, P3) pelo serviço WFS do BDQueimadas. Não é conferência humana.
- [x] Casos em `casos.json`, M e conclusão final (viável), relatório completado (seções 10 e 11).
- [ ] PR da issue, checks e aprovação do merge.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:prova-dados`: 57 testes, 57 aprovados, 0 falhas (Node v24.15.0); governança: 55 aprovados |
| Validador | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem erros |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **O que as decisões excluem não foi implementado.** D6 b e c, D9 H1 e H2, D5 c e D7 a e c não são executados por `comparar.mjs`: as decisões do plano usam D6 a, um só método de K, D5 b e D7 b. A validação de combinações vale para todas as alternativas (testada), e `exigirImplementado` recusa o resto com mensagem explícita. O plano lista testes de H1 e H2 e de "H2 com método indisponível"; como H não se aplica (um só método), esses caminhos não existem. Com o FIRMS indisponível, K fica indeterminado pela regra de E1 e a conclusão é "evidência insuficiente".
- **Limite exato da tolerância.** O plano não diz se 25,00% concorda ou diverge; adotei "concorda" (≤), testado e registrado no relatório. Nenhum mês chegou perto (máximo 4,85%).
- **Casamento de registros (`casar.mjs`).** Módulo extra, para caracterizar as diferenças entre INPE e FIRMS sem explicar a causa. A causa da concentração de registros só do INPE em 2026-10-09 a 2026-10-20 não foi determinada; K não depende dela. Registrado como diferença observada.
- **Candidatos de casos (`candidatos.mjs`).** Módulo extra que apoia a ação externa: sugere 28 candidatos por regra determinística (hash do id), sem escolher pelo responsável. A distância ao limite é aproximada e só serve para sugerir.
- **`casos.json` versionado.** Guarda os casos conferidos (dados públicos do INPE) e as explicações de divergências de K, lidos por `comparar.mjs`. Agora tem 15 casos.
- **Quem conferiu os casos.** O plano previa o responsável. Ele não sabe operar a ferramenta, recusou "dar como certo" sem conferência (o agente também recusou) e escolheu que o agente conferisse. O relatório declara que não é conferência humana nem totalmente independente do autor dos scripts. Usei o serviço WFS do GeoServer do BDQueimadas (o mesmo do mapa do site), consultado do navegador, em vez de clicar nos pontos; P2 foi conferido pelo atributo `municipio` do catálogo (limites do INPE), não pela malha IBGE. Os 15 casos foram escolhidos por critério de cobertura antes da consulta.
- **Conclusão final.** U atendido (com as ressalvas do levantamento), C-d = 1, K = 3 de 3 e M = 100% (15 de 15): "viável" por D7 b, com a ressalva acima. Se o responsável quiser conferência humana, os casos ficam em `casos.json`.
- **Duplicidade observada.** No caso 26 o catálogo traz dois registros AQUA_M-T no mesmo instante a cerca de 1 m um do outro; não foi investigada (registrada no relatório).
- **Independência.** A comparação com o FIRMS valida a série VIIRS (V), não a principal P (MODIS), e usa os mesmos sensores; os casos manuais e a lista de divergências de D2 (vazia) cobrem P. Declarado no relatório.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 001 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #9 (https://github.com/EuThiagoAndrade/rastro-quente/pull/9); conclusão "viável" (U, C-d = 1, K = 3 de 3, M = 100%) e a ressalva de que os 15 casos foram conferidos pelo agente, não por pessoa, com P2 contra a base de limites do INPE
Diga: "aprovo o merge da PR #9"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 001 + implementar_issue + 6 + 1c50787`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issues #4 e #5 integradas, `main` em `1c50787`, sem `comparar.mjs` / branch `chore/issue-6` publicada com `comparar.mjs`, módulos, testes, 15 casos conferidos pelo agente, relatório completo e task.
- `result`: `executed`
- `evidence`: `npm run test:prova-dados` 57/57; governança 55/55; validador 0 erros; `comparar.mjs` com SHA-256 de saída `f33b2a7d6e5ab41361be4ec657e22fc5835b1f9f0d6a8ce9a0e562f4f86cf1ce`; K = 3 de 3; M = 100% (15 de 15); conclusão "viável".
- `blockers`: `nenhum` (merge depende de checks verdes e da aprovação do responsável).
