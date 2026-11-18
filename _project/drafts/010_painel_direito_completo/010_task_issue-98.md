# Task — Issue #98: Lista e detalhe de municípios no painel

> **Ciclo:** `010`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#98`
> **Plano:** `_project/drafts/010_painel_direito_completo/010_plan.md`
> **Branch:** `feature/issue-98`
> **PR:** [#102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #98" em 2026-11-18
> **Modo contínuo:** `—`
> **Início:** 2026-11-18
> **Última atualização:** 2026-11-18
> **handoff_schema_version:** `2`

## Objetivo

Separar inspeção estadual, ação de câmera e aplicação explícita do recorte municipal.

## Escopo autorizado

Item 2 do plano v2 integrado na PR #96, issue #98. Dependência #97 integrada pela PR #101, comprovada no GitHub e na base `5e45fcc010cd44f1113aa6bce14198e8668197a1`.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Separar métricas do resumo estadual das do recorte municipal; preservar pertinência compartilhada de células e empates. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Reutilização das leituras vigentes, sem alteração de acesso. |
| G3 — privacidade de dados | Sim | Fixtures fictícias e revisão seletiva de textos e imagens. |
| G4 — migrações só acrescentam | Não | Sem migrações. |

## Execução

- [x] Issue, plano, autorização e dependência integrados conferidos.
- [x] Lista e detalhe municipal, ações explícitas e invalidação.
- [x] Contrato visual, ADR-009 e guia de interface atualizados.
- [x] Verificações focadas da interface e gates locais.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` e `npm run build` | Passaram; aviso preexistente de chunk acima de 500 kB. |
| `node --test tests/unit/resultado.test.mjs` | 13 passaram, incluindo empates, métricas municipais e célula compartilhada A=3 / B=1. |
| Playwright: `15-municipios.spec.mjs` | 4 passaram: desktop claro e celular escuro, teclado/foco, inspeção, consulta, retorno, geometria sob demanda (falha/ausência/repetição/descarte tardio), lente estadual e estado zero. |
| Playwright: `02-consulta.spec.mjs -g 'por município: total da série independente'` | 1 passou; asserção atualizada para consulta explícita. |
| Conferência visual inicial | Capturas da aplicação em 1440×900 claro e 390×844 escuro. Esta passagem não comparou o HTML privado; não sustentava, sozinha, a fidelidade ao esboço. Substituída pela conferência direta abaixo. |
| Ambiente dos testes focados | Configuração local ignorada em `local/issue98/`, porta 5175. Fixture comum fictícia temporária; publicação anterior restaurada ao terminar, sem substituir os registros do preview existente. No CI, as specs usam a configuração padrão. |
| Governança e diff | 55 testes de governança passaram; validador com 0 erros e 0 avisos; diff conferido sem erros. |
| Checks remotos | Acompanhar os [checks da PR #102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102/checks). |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

O responsável limitou os testes em 2026-11-18 a verificações básicas dos itens de interface afetados, sem testar toda a aplicação. Essa instrução mais recente restringe a passagem integrada prevista no plano a esta entrega; checks obrigatórios do CI permanecem.

## Conferência direta do template — 2026-11-18

O responsável pediu a verificação direta após questionar a conformidade visual declarada. Referência conferida: seção “4. Aba Municípios” de `local/esboco/proposta-todas-abas-e-agente.html`, identificada na ideação do ciclo. Comparação por capturas da referência e da aplicação em largura equivalente de 336 px; artefatos privados de trabalho em `local/issue98/`.

| Divergência constatada | Correção |
| :-- | :-- |
| Lista conservava barras e número em coluna separada. | Nome e posição agrupados, contagem e unidade logo abaixo, sem barras. |
| Perguntas/títulos e negrito não seguiam a proposta. | “Focos por município”, “O que essa lista mostra?”, “Como interpretar?” e respostas em frase, com ênfase só em fatos principais. |
| Detalhe repetia os números e empurrava as ações para baixo. | Números detalhados e metadados na divulgação técnica; interpretação concisa e ações em cartões. |
| Retorno superior era botão grande preenchido. | Aparência de link, preservando alvo de 44 px e foco. Retorno adicional em cartão. |
| Ordenação fora do grupo de ações; datas ISO. | Cartão de ordenação depois da lista, explicação do efeito e datas em dia/mês/ano. |

Adaptações preservadas por obrigação do plano: dados reais da consulta em vez dos exemplos do template; três ordens existentes em vez de um único botão ilustrativo; “Consultar município” como ação explícita; participação estadual distinta da lente municipal; células distintas em vez de tratar sequências como lugares; temas, contraste, alvos de 44 px e fonte mínima de 0,875 rem. Abas globais seguem o contrato existente, sem alterar Comparação ou Agente.

Validação da correção: typecheck e build passaram, 13 testes unitários de resultado passaram e os 6 cenários E2E selecionados passaram (spec 15 e os fluxos afetados das specs 02 e 11). O processo Playwright apresentou uma asserção nativa do libuv no encerramento no Windows, depois do relatório “6 passed”; a restauração da fixture e a limpeza da conta temporária foram conferidas antes da nova captura. Comparação visual final da lista e detalhe feita contra as duas capturas do template; comparação lado a lado reunida em `local/issue98/comparacao-municipios.png`. Capturas de celular escuro e das ações também conferidas. Sem teste local da aplicação inteira.

O CI anterior falhou em uma asserção de Lentes cujo seletor global `.lente-resposta` passou a encontrar também a resposta de Municípios. Os três seletores de resposta/ações dessa spec foram limitados ao cartão de Lentes, preservando suas expectativas. O cenário de concentração afetado passou isoladamente (1 cenário adicional); repetiu-se apenas a falha nativa do libuv no encerramento do processo Windows. Logs obtidos por fallback no GitHub CLI, pois o MCP Docker não oferece logs de jobs e o conector alternativo respondeu HTTP 503. Nenhum teste de toda a aplicação foi executado localmente.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 010 (completo)
Quem: Responsável
Conferir: Checks e diff da [PR #102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102)
Diga: "aprovo o merge da PR #102"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + 98/revisao-visual + 933432bb324b65fdb6692e7fd3581987ea28ed25`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: PR #102 aberta com conferência visual incompleta / divergências do template corrigidas e conferidas diretamente; PR atualizada, aguardando checks e aprovação do merge.
- `result`: `executed`
- `evidence`: issue #98, PR #101 integrada, comandos e resultados da seção Evidências e commit `224fea9` e [PR #102](https://github.com/EuThiagoAndrade/rastro-quente/pull/102).
- `blockers`: conclusão dos checks remotos e aprovação específica do merge.
