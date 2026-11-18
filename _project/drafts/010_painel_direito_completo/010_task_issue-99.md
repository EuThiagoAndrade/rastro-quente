# Task — Issue #99: Comparação com resposta e disponibilidade no painel

> **Ciclo:** `010`
> **Trilha:** `normal`
> **Estado:** `Em andamento`
> **Tipo:** `feature`
> **Issue:** `#99`
> **Plano:** `_project/drafts/010_painel_direito_completo/010_plan.md`
> **Branch:** `feature/issue-99`
> **PR:** —
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #99" em 2026-11-18
> **Modo contínuo:** `—`
> **Início:** 2026-11-18
> **Última atualização:** 2026-11-18
> **handoff_schema_version:** `2`

## Objetivo

Reorganizar a apresentação da comparação territorial (períodos e municípios) para exibir identidades A e B, pergunta orientadora, resposta principal e limites antes do detalhe, com alternância de lados no mapa, evidências e disponibilidade sob demanda, seguindo diretamente a proposta aprovada.

## Escopo autorizado

Item 3 do plano v2 integrado na PR #96, issue #99. Dependência #98 integrada pela PR #102, comprovada no GitHub e na base `8727e2d20f115edb0442a767927985599fd919cb`.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Preservar fatos de cada lado, unidades, diferença B − A somente quando conclusiva e ressalvas de KB-007. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Reutilização das leituras vigentes, sem alteração de acesso. |
| G3 — privacidade de dados | Sim | Fixtures fictícias e conferência seletiva sem dados privados. |
| G4 — migrações só acrescentam | Não | Sem migrações. |

## Execução

- [x] Issue, plano, autorização e dependências integrados conferidos.
- [x] Reorganização de `src/apresentacao-comparacao.ts` e estilos conforme a referência direta `proposta-todas-abas-e-agente.html` (seções 5 e 6).
- [x] Ação "Ver a disponibilidade" com foco e rolagem até `#comparacao-disponibilidade`.
- [x] Cartões de ação para alternar mapa entre os lados A e B com descrição do efeito.
- [x] Atualização de `DESIGN.md` e verificação lado a lado com a proposta.
- [x] Testes unitários e verificação com Playwright focada na tela de comparação.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` | OK (0 erros de tipagem) |
| `npm run build` | OK (dist gerado com sucesso pelo Vite) |
| `node --test tests/unit/comparacao.test.mjs` | OK (24 testes unitários de comparação passaram) |
| `node --test tests/unit/contraste.test.mjs` | OK (87 testes de contraste passaram, 0 cores literais fora dos tokens) |
| Playwright: `tests/e2e/12-comparacao.spec.mjs` | OK (10/10 testes da aba Comparação passaram em ~1m) |
| Comparação lado a lado (template vs aplicação) | OK (verificada em `local/issue99/comparacao-telas.png`) |
| Governança: `node scripts/validate-governance.mjs` | OK (0 erros, 0 avisos) |
| Formatação: `git diff --check` | OK (sem espaços/linhas em branco espúrias) |

### Comparação lado a lado com o template de referência

Conforme instrução direta do responsável, a tela foi comparada elemento a elemento com `local/esboco/proposta-todas-abas-e-agente.html` (seções 5 e 6), capturada em `local/issue99/comparacao-telas.png`:

| Cenário | Template de referência | Implementação real (Aplicação) | Conformidade |
| :-- | :-- | :-- | :-- |
| 1. Comparar dois períodos (conclusiva) | Título "Comparar períodos", pergunta orientadora, caixa de critério dos períodos com barra esquerda `--escolha`, resposta destacada em frase com números em negrito, bloco de interpretação "Como interpretar a diferença?", cartões de ação para períodos A e B no mapa com texto explicativo e divulgação técnica recolhível ("Ver números e detalhes da comparação"). | Renderizado exatamente com a mesma hierarquia, espaçamento, tipografia de 15 px (apoio 0,875 rem), botão de largura total e indicação do lado ativo com check e cor primária. | Conforme |
| 2. Comparar dois períodos (inconclusiva / aguardando) | Título, pergunta, critérios, resposta com números, caixa de ressalvas com barra de aviso ("Ainda não é possível concluir a comparação."), bloco "Por que isso importa?" e cartão de ação "Ver a disponibilidade". | Renderizado exatamente com as mesmas seções e classes. O cartão "Ver a disponibilidade" abre os detalhes técnicos e direciona o foco para `#comparacao-disponibilidade`. | Conforme |
| 3. Comparar dois municípios | Título "Comparar municípios", pergunta "Como os registros dos dois municípios se comparam?", resposta destacada com contagens e diferença, bloco "O que essa diferença significa?", cartões de ação para municípios A e B no mapa e divulgação "Ver disponibilidade e detalhes". | Renderizado exatamente com a mesma composição, pergunta, resposta em frase contínua com identidades em negrito, cartões descritivos e detalhes recolhíveis. | Conforme |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

O responsável instruiu expressamente em 2026-11-18:
- Usar `proposta-todas-abas-e-agente.html` como referência direta, e não como mera inspiração, realizando a comparação lado a lado antes de apresentar a entrega.
- Não executar testes exaustivos ponta a ponta do sistema, restringindo os testes às verificações necessárias para o desenho da nova tela.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Pronto para continuar — ciclo 010 (completo)
Quem: Qualquer ferramenta, a pedido do responsável
Conferir: —
Diga: "continue o ciclo 010"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + implementar_issue + issue-99 + 8727e2d20f115edb0442a767927985599fd919cb`
- `effect_class`: `local_mutation`
- `state_before`: issue #99 autorizada, branch `feature/issue-99` criada a partir de `main` (`8727e2d`).
- `state_after`: implementação da issue #99 concluída, testes locais e validação visual lado a lado aprovados.
- `result`: `executed`
- `evidence`: `local/issue99/comparacao-telas.png`, `tests/e2e/12-comparacao.spec.mjs`, `src/apresentacao-comparacao.ts`, `src/estilos/componentes.css` e este arquivo.
- `blockers`: nenhum.
