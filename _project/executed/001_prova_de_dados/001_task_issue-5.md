# Task — Issue #5: Contagem e cobertura de Colniza

> **Ciclo:** `001`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#5`
> **Plano:** `_project/executed/001_prova_de_dados/001_plan.md`
> **Branch:** `feature/issue-5`
> **PR:** https://github.com/EuThiagoAndrade/rastro-quente/pull/8
> **Integração:** `PR #8 integrada em main em 2026-11-03 (squash), Governance aprovado em main`
> **Autorização inicial:** "Concordo com a proposta e autorizo a implementação da issue #5" em 2026-11-03
> **Modo contínuo:** `—`
> **Início:** 2026-11-03
> **Última atualização:** 2026-11-04
> **handoff_schema_version:** `2`

## Objetivo

Item 2 do plano: contar as detecções de Colniza (MT) de agosto a outubro de 2026 segundo D1 a D4, com as séries P, E, Mu e V, as divergências de D2, a sensibilidade de fuso de D3, a cobertura (detecção e disponibilidade) e C-d e C-p, sem escolher regra de seleção de áreas.

## Escopo autorizado

Os itens da issue #5: `contar.mjs` e módulos de apoio (leitura em fluxo, ponto no polígono, mês em GMT e UTC−4, cobertura), testes com fixtures fictícias, rascunho dos resultados em `001_research_viabilidade.md` e a verificação da incidência do aviso do INPE. Não cobre merge, a issue #6, nova dependência, serviço pago ou mudança de regra. Também registra a confirmação do responsável (2026-11-03) de que SNPP = `NPP-375` + `NPP-375D` na série V.

## Origem no backlog

Não se aplica. Herdado do plano: demanda direta do responsável, sem ID do backlog.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regras D1 a D4 do plano aprovado, sem escolha do agente. Casos de referência fictícios calculados à mão em `tests/fixtures/prova-dados/` (vértice, divisa, buraco, multipolígono; transições de mês às `03:59:59Z`/`04:00:00Z` e `23:59:59Z`/`00:00:00Z`; exemplo de D2 com 98 e 4 divergências; exemplo de D7 com C-d = 3 e C-p = 4). Proveniência: SHA-256 dos insumos conferido antes de contar. Duas execuções reais com saída idêntica. Conferência por caminho independente (`awk`) da contagem municipal de P. Modo contínuo `—` |
| G2 — autenticação, autorização e isolamento por RLS | Não | Sem banco, tabela ou usuário |
| G3 — privacidade de dados | Sim | Fontes públicas, sem atributos de pessoas ou imóveis. Brutos e saídas só em `local/` (ignorado); CSV só fictício em `tests/fixtures/`; o relatório guarda agregados |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Task criada; plano e ciclo já em execução; task da issue #4 reconciliada (`Concluída`, PR #7 integrada).
- [x] `geo.mjs`: ponto no polígono por ray casting com buracos, multipolígono e classificação de borda.
- [x] `focos.mjs`: leitura em fluxo (2,4 milhões de linhas, sem carregar os arquivos) e mês em GMT e UTC−4.
- [x] `cobertura.mjs`: detecção e disponibilidade independentes, tabela cruzada, cobertura não comprovada, C-d e C-p.
- [x] `contar.mjs`: séries P, E, Mu, V, todos os satélites, divergências de D2, sensibilidade de fuso, cobertura, crescimento; saída JSON determinística; SHA-256 dos insumos conferido.
- [x] Execução real sobre os insumos da issue #4: P = E = Mu = 824 (516, 246 e 62); 0 divergências em P; saída `107f795d…` idêntica nas duas execuções.
- [x] Aviso de 2026-08-12 verificado nas imagens indicadas (GIBS) e contra o catálogo: classe `incidencia_indeterminada`, com a evidência a favor e contra registrada em `fontes.json`.
- [x] Crescimento citado pelo responsável: não observado no período (queda mês a mês em todas as séries); sem interpretação causal.
- [x] Rascunho dos resultados em `001_research_viabilidade.md`.
- [x] PR #8 aberta (Closes #5). Faltam checks remotos e a aprovação do merge.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:prova-dados`: 36 testes, 36 aprovados, 0 falhas (Node v24.15.0); governança: 55 aprovados |
| Validador | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem erros; `local/` ignorado, nenhum bruto, saída ou imagem no índice |
| Checks remotos | Governance aprovado na PR #8 e em `main` (1c50787) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **SNPP = `NPP-375` + `NPP-375D`.** Confirmado pelo responsável em 2026-11-03 (pergunta da issue #4). Fica em `CONFIG.gruposViirs` de `contar.mjs` e no relatório.
- **Incidência do aviso de 2026-08-12 = indeterminada.** A imagem do GIBS indicada no aviso mostra o retângulo de Colniza dentro da faixa imageada, mas o catálogo do INPE só tem 5 registros do `AQUA_M-T` no Brasil nesse dia (271 a 794 nos vizinhos, com NOAA-20 e NPP-375 normais), e nuvens densas sobre Colniza também reduzem detecções. Pela regra do plano ("sem evidência conclusiva, incidência indeterminada") classifiquei assim; isso conta em C (C-d = C-p = 1). Se o responsável preferir `sem_incidencia` pela imagem, basta mudar a classe em `fontes.json`.
- **Evidência de imagem em `local/`.** As duas imagens do GIBS ficam em `local/prova-dados/evidencias/` (fora do Git), com o prefixo do SHA-256 e a URL em `fontes.json`. A contagem de pixels sem dado foi feita com um script descartável (decodificador PNG), não versionado.
- **Classificação do aviso como dado.** A incidência é lida de `fontes.json` › `levantamento.inpe.avisosDoPeriodo`, porque depende de evidência externa; o código só conta e cruza.
- **Mês de Mato Grosso por `estado_id`.** O recorte de MT na verificação do crescimento usa o campo `estado_id` = 51 do INPE, sem polígono; é informativo e não faz parte das séries de Colniza.
- **Lista nominal de divergências só para P** (como o plano pede); para os demais satélites a saída traz contagens. P não tem divergência.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 001 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 001 + implementar_issue + 5 + 68c2666`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #5 aberta, issue #4 integrada, `main` em `68c2666`, sem `contar.mjs` / branch `feature/issue-5` publicada com `contar.mjs`, módulos, testes, fixtures, rascunho do relatório e task da issue #4 reconciliada.
- `result`: `executed`
- `evidence`: `npm run test:prova-dados` 36/36; governança 55/55; validador 0 erros; duas execuções reais de `contar.mjs` com SHA-256 de saída `107f795de4af5d95eca35014fdeb59f524abe117158c5e8673286c6b7af46052`; contagem municipal de P conferida por `awk` (516, 246, 62).
- `blockers`: `nenhum` (merge depende de checks verdes e da aprovação do responsável).
