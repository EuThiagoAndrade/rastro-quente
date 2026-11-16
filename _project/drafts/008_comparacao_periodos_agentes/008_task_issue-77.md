# Task — Issue #77: Comparação determinística de períodos e municípios

> **Ciclo:** `008`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#77`
> **Plano:** `_project/drafts/008_comparacao_periodos_agentes/008_plan.md`
> **Branch:** `feature/issue-77`
> **PR:** [#82](https://github.com/EuThiagoAndrade/rastro-quente/pull/82)
> **Integração:** squash `49592f2` em `main` (2026-11-16)
> **Autorização inicial:** "Autorizo a implementação da issue #77" em 2026-11-16
> **Modo contínuo:** `—`
> **Início:** 2026-11-16
> **Última atualização:** 2026-11-16 (reconciliada na issue #78)
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 1 do plano 008 (v3): comparação determinística de dois períodos e de dois municípios, sem IA nem chave, com módulo puro de versão própria (`comparacao-008-v1`), interface nos filtros e no resultado, casos de referência CP/CM, KB de comparação territorial e `DESIGN.md` atualizado.

## Escopo autorizado

Item 1 do plano v3 e issue #77:

- `src/comparacao.ts` (novo, puro): validação dos pedidos (T1, T2), identidade da unidade, classificação entrou/saiu/permaneceu, conclusão comparativa e as regras de zero, ausência e disponibilidade de T3, números municipais (T2), contexto estadual e células de divisa.
- Interface determinística do primeiro parágrafo de T7: modo (períodos ou municípios), seletores de B, aba de comparação lado a lado, alternância do lado mostrado no mapa com rótulo, contexto estadual separado ("Ver contexto estadual"), ciclo de disponibilidade (não solicitada, carregando N de M, completa, falha, cancelada) e conferência automática do lado estadual zero.
- Testes: unitários CP-1 a CP-18 (na parte determinística) e CM-1 a CM-6 com valores escritos à mão; E2E de comparação; regressão das lentes.
- Documentação desta entrega: nova KB de comparação territorial e `DESIGN.md` (controles, exceção ao recorte único, estados e acessibilidade).
- Regularização documental decidida pelo responsável nesta entrega (ver "Decisões incidentais").

Fora deste item: Gemini, função de servidor, persistência de histórico, painel de perguntas e alteração de qualquer fórmula ou limiar existente.

## Origem no backlog

Herdada do plano: BL-009, parcela "comparação direta de dois períodos" e "proposta de agentes", referenciada a `_project/backlog.md` no commit `e274e49`, integrado em `main`. Destino em preparação: o item continua sem retorno registrado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Nenhum módulo de `src/lentes/` alterado; os dois lados executam as mesmas funções de produção. Casos CP/CM com valores esperados escritos à mão antes do comparador (`tests/unit/comparacao.test.mjs`). Regras T1–T3 e D8/D9 seguidas sem interpretação nova; contrato registrado em KB-007 |
| G2 — autenticação, autorização e isolamento por RLS | Não | Só o navegador, com as mesmas RPCs sob JWT e as mesmas gerações de sessão; nenhuma tabela, política, papel ou rota de servidor nova |
| G3 — privacidade de dados | Sim | Fixtures fictícias (municípios inventados); nada gravado no navegador; nenhum dado privado ou credencial |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v3 `Aprovado` e integrado (PR #76, `b6525a2`), issue #77 aberta, autorização literal, base `main` = `origin/main` em `b6525a2`.
- [x] Branch `feature/issue-77`; esta task; plano `Em Execução` e ciclo `Em execução`.
- [x] **R3-1, registrada antes de qualquer medição:** a qualificação dos destaques (disponibilidade dos municípios exigidos pelos destaques dos dois lados) conta no orçamento de 360 s, junto com a lista estadual sob demanda e a conferência do recorte zero; o resultado inicial (registros dos dois lados, cálculo e primeira apresentação) conta nos 120 s. Nenhuma regra ou teto muda.
- [x] Módulo puro `src/comparacao.ts` (`comparacao-008-v1`) e casos CP-1 a CP-17 e CM-1 a CM-6 (`tests/unit/comparacao.test.mjs`, fixture `tests/fixtures/comparacao/referencia.json`).
- [x] Interface: seção "Comparar", aba "Comparação" (`src/apresentacao-comparacao.ts`), abas do resultado generalizadas para três, rótulo do lado no mapa, orquestração em `src/app.ts`; E2E `tests/e2e/12-comparacao.spec.mjs`.
- [x] KB-007, `DESIGN.md`, README, runbook e regularização documental.
- [x] Gates locais (ver "Evidências").
- [x] PR [#82](https://github.com/EuThiagoAndrade/rastro-quente/pull/82) aberta.
- [x] Checks remotos verdes e merge aprovado ("Aprovo o merge da PR #82", 2026-11-16); squash `49592f2`, conferido no GitHub durante a issue #78.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` | Sem erros |
| `npm run build` | Concluído |
| `npm run test:interface` | 217/217 (inclui os 24 casos CP/CM de `comparacao.test.mjs`) |
| `npm run test:e2e` | 120/120 na rodada completa; depois do último ajuste (estado da aba quando a consulta de A falha), `12-comparacao` repetida isolada: 9/9 |
| Regressão das lentes | Nenhum arquivo de `src/lentes/` alterado; specs 05 a 09 verdes na rodada completa |
| Medição com a carga real (T6) | Não executada, por decisão do responsável (ver "Decisões incidentais") |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Verdes em `f795b47`: "Validate governance", "Database RLS and query contract", "Interface typecheck, build and E2E" |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Regularização documental junto com esta entrega (decisão do responsável, 2026-11-16).** Na mesma mensagem da autorização, o responsável disse que a documentação desatualizada deve ser regularizada junto com a documentação desta entrega, sem um fluxo próprio: "Em conjunto com a documentação que for fazer desta entrega (padrão), faça ela. Não faz sentido rodar todo um fluxo para atualizar apenas algo que foi entregue e não está na documentação desatualizada." Itens: `cycles.md` (PR #76 integrada, issues #77 a #81, ciclo `Em execução`), rastreabilidade do plano (PR #76 integrada em `b6525a2`, issues e branch) e o bloco "Próximo passo" do plano, que ainda pedia o merge da PR #76.

- **Medições de desempenho dispensadas (decisão do responsável, 2026-11-16).** Com a medição com a carga real já em curso, o responsável escreveu: "Não vamos fazer essas medições. Estamos sem tempo, neste momento, para ae ntrega do sistema. Eu aceito o resultado que vierem em produção. Posteriormente posso trabalhar o desempenho." A execução foi interrompida antes de qualquer resultado, o cenário de medição acrescentado a `scripts/interface/medir-lentes.mjs` foi revertido e nenhum número foi registrado. Os tetos de T6 (120 s, 360 s, 480 s) e a leitura de R3-1 continuam sendo os do plano, sem medição; não se afirma que são cumpridos.
- **Terceira aba do resultado.** O plano diz que o resultado compara A e B lado a lado sem fixar onde. A comparação ganhou a aba "Comparação", visível só com um modo escolhido, para não misturar com a lista da lente do recorte A ("Destaques"). As setas, Home e End passam só entre as abas visíveis.
- **Mapa do lado A.** "Mapa: A" mantém o mapa do recorte aplicado (pontos e destaques da lente comum, que tem a mesma configuração e o mesmo recorte); "Mapa: B" troca pontos e destaques pelos do lado B, com o rótulo sobre o mapa. Trocar recorte, lente, sessão ou versão volta ao lado A.
- **B padrão.** Ao escolher "Dois períodos", B vem preenchido com o período imediatamente anterior a A, de mesma duração (ou o seguinte, se o anterior não couber na versão). É conveniência de interface; a validação de T1 continua recusando qualquer B fora da regra.
- **Contexto estadual com a combinação.** T2 prevê a "combinação com concentração" em todo Mato Grosso. Como a concentração sai da combinação ao escolher um município (T16 do plano 007), com a lente "Combinação" o contexto estadual calcula as lentes marcadas mais a concentração, com o mesmo operador; com outra lente (ou nenhuma), a concentração estadual.
- **Disponibilidade no recorte municipal.** No recorte de um município, a disponibilidade dele é sempre lida nos dois lados (uma leitura por lado), para a seção municipal separada de T3; no estado inteiro, a lista completa continua sob demanda.
- **CP-18 fora deste item.** O caso trata da IA contextual e da leitura no servidor (itens 2 e 3).

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 008 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #82 (https://github.com/EuThiagoAndrade/rastro-quente/pull/82)
Diga: "aprovo o merge da PR #82"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 008 + implementar_issue + 77 + b6525a2`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #77 aberta, plano `Aprovado`, ciclo `Planejamento` / branch `feature/issue-77` publicada e PR #82 aberta; plano `Em Execução`, ciclo `Em execução`, task `Em andamento`
- `result`: `executed`
- `evidence`: PR #82 (branch `feature/issue-77`); validações em "Evidências"
- `blockers`: nenhum (reconciliação na issue #78: PR #82 integrada por squash `49592f2`, issue #77 fechada)

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
