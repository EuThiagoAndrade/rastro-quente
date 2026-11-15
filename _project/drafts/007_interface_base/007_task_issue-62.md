# Task — Issue #62: Limites, densidade e série do período

> **Ciclo:** `007`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `feature`
> **Issue:** `#62`
> **Plano:** `_project/drafts/007_interface_base/007_plan.md`
> **Branch:** `feature/issue-62`
> **PR:** `—`
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #62" em 2026-11-14
> **Modo contínuo:** `—`
> **Início:** 2026-11-14
> **Última atualização:** 2026-11-14
> **handoff_schema_version:** `2`

## Objetivo

Completar o centro da tela: limites municipais ligados por padrão, densidade opcional por célula com classes fixas, série diária ou mensal do período com meses parciais, menu "Camadas" e mapa ampliado, com série e densidade somando `principal.total`. Nenhuma fórmula de lente muda.

## Escopo autorizado

Item 3 do plano v4 e issue #62:

- limites do estado ligados por padrão, pedidos depois do painel pronto, sem bloquear a consulta; camada desligável (T10);
- menu "Camadas" (limites, áreas, detecções individuais, densidade) e legenda; ampliar mapa com Esc e retorno automático ao abrir um destaque (T17);
- densidade (T8), desligada por padrão, cinco classes fixas e legenda "Detecções por célula: contagem, não gravidade";
- série diária até 31 dias e mensal acima, com mês parcial marcado (T9), só com registros principais (T19); disponibilidade continua no cartão próprio;
- ADR-009 completado com este item e aceito; ADR-007 marcado como parcialmente substituído;
- testes: unitários DS-1, DS-2, SR-1 a SR-4; E2E de limites, densidade, série (diária e mensal com meses parciais) e mapa ampliado; regressão T20 (typecheck, build, unitários e E2E inteiro).

Fora deste item: recorte municipal das lentes (item 4); mapa-base (item 5). Sem migração, RPC, política, dependência nova nem mudança de lente.

## Origem no backlog

Herdada do plano: BL-007 inteiro (ciclo), referenciado a `_project/backlog.md` no commit `e274e49`, integrado em `main`. Destino em preparação: o item continua `Disponível`.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Densidade (T8) e série (T9) como funções puras (`src/densidade.ts`, `src/serie.ts`), só com registros principais do período GMT (T19); classes fixas do plano, sem limiar novo. Unitários DS-1, DS-2 e SR-1 a SR-4 com os valores esperados do plano; E2E confere `data-total` da série e da densidade igual a `principal.total` (100, 60 e 35, conforme a fixture). Nenhuma fórmula de lente mudou. Conferências com a carga real (`conferir:*`, T20) **não executadas** (ver Decisões) |
| G2 — autenticação, autorização e isolamento por RLS | Não | Só lê as mesmas tabelas e RPCs, com os mesmos papéis; os limites continuam vindo de `municipios` sob RLS, depois do login |
| G3 — privacidade de dados | Sim | Fixtures fictícias; nenhum dado novo gravado no navegador; visual da V13 conforme a autorização da issue #60, sem dados do mockup |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v4 `Em Execução`, issue #62 aberta, item 2 integrado (PR #66, `650bbc7`), autorização literal "autorizo a implementação da issue #62", base `main` = `origin/main` em `650bbc7`.
- [x] Branch `feature/issue-62`; esta task.
- [x] Série (T9) e densidade (T8) em módulos puros, com unitários.
- [x] Limites ligados por padrão, "Camadas", legenda da densidade e mapa ampliado.
- [x] E2E de limites, densidade, série e mapa ampliado; E2E de áreas adaptados ao menu "Camadas".
- [x] ADR-009 completado e aceito; ADR-007 com status atualizado; `DESIGN.md` atualizado.
- [x] E2E inteiro e gates finais (sem medições nem conferências com a carga real, por decisão do responsável).
- [ ] PR aberta.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run build` | Sem erros |
| `npm run test:interface` | 166/166 |
| `npm run test:e2e` | Rodada inteira: 90 de 96; as 6 falhas eram as caixas de "Camadas" medidas sozinhas (13×13) na auditoria de alvos. Corrigido com o rótulo inteiro como alvo (`.opcao`); acessibilidade, áreas e centro de novo: 31/31. O E2E inteiro roda de novo no CI da PR |
| M1 e M5 (T14) | Não executadas (decisão do responsável) |
| `conferir:lentes` / `conferir:combinacao` / `conferir:sobreposicao` | Não executadas (decisão do responsável) |
| `node --test scripts/validate-governance.test.mjs` | 55/55 |
| `node scripts/validate-governance.mjs` | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem achados |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Sem testes de carga (2026-11-14).** Junto da autorização, o responsável escreveu: "Mas não quero aqueles testes intermináveis de carga que você está fazendo, ok?". Reforça a decisão registrada na task da issue #61 ("Você está PROBIDO DE FAZER ESSES TESTES"): M1 e M5 (T14) não foram medidas e ficam aceitas pelo responsável; as conferências com a carga real (`conferir:*`, T20) também não foram rodadas. O critério de aceite "M1 e M5 atendem aos limites" fica sem medição, por decisão do responsável; o atributo `data-estado-limites` (fim de M5) está implementado para uma medição futura.
- **Limites em `intermediaria`, não em `minima` (desvio de A7 e T10, decidido pelo responsável em 2026-11-14).** O banco guarda uma única geometria de exibição por município e carga (`municipios.geometria_exibicao`), e a carga publicada usa `intermediaria`; o plano proíbe migração. Perguntado com as alternativas (usar a `intermediaria` já existente; arquivo estático `minima` fora do banco; parar e revisar o plano para uma coluna nova), o responsável escolheu "Usar a intermediaria". Efeito: os limites do estado ligam por padrão com a geometria da carga (cerca de 984 KB brutos e 5,3 s no perfil do ADR-007, em segundo plano, depois do painel pronto); o município escolhido segue com o mesmo contorno, destacado.
- **Falha só nos limites desliga a camada.** Com erro na leitura da geometria, a caixa "Limites municipais" é desmarcada e `data-estado-limites` fica `erro`; religar tenta de novo. Pontos e números seguem válidos, como antes.
- **"Camadas" no lugar dos botões de limites e áreas.** Como na V13, os botões "Mostrar limites municipais" e "Mostrar áreas protegidas" viraram caixas do menu "Camadas"; as áreas continuam desligadas por padrão e lidas sob demanda (plano 006), e não ligadas como na V13.
- **Série com barras da V13.** Barras com valor (na mensal), coluna e rótulo; na diária, o rótulo aparece no primeiro e no último dia e a cada 5 dias, para caber em 320 px. Mês parcial com `*` no rótulo, coluna hachurada e a nota "* mês parcial: só os dias do período."; mês parcial sem detecção mostra "0 no período". A tabela "Ver a série como tabela" continua como alternativa em texto. Alturas pelo CSSOM, porque a CSP (`style-src 'self'`) bloqueia o atributo `style`.
- **Painel "Camadas" acima da legenda.** Em tela de 720 px de altura, a legenda aberta cobria o painel; o painel aberto passou a ficar por cima (`z-index` 510).
- **Retorno automático do mapa ampliado sem E2E próprio.** A redução ao abrir um destaque está em `prepararExplicacao`, caminho comum de todas as explicações; o E2E cobre ampliar, Esc e o botão, mas não o clique num destaque desenhado em canvas com o mapa ampliado.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Pronto para continuar — ciclo 007 (completo)
Quem: Qualquer ferramenta, a pedido do responsável
Conferir: —
Diga: "continue o ciclo 007"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + implementar_issue + 62 + 650bbc7`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: issue #62 aberta, item 2 integrado / branch `feature/issue-62` com a implementação local
- `result`: `executed`
- `evidence`: validações em "Evidências"
- `blockers`: E2E inteiro e PR pendentes
