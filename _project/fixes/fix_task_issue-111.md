# Task — Issue #111: Panorama do estado inteiro incompleto com muitos municípios

> **Ciclo:** `—`
> **Trilha:** `curta`
> **Estado:** `Aguardando integração`
> **Tipo:** `fix`
> **Issue:** `#111`
> **Plano:** `—`
> **Branch:** `fix/issue-111`
> **PR:** —
> **Integração:** `Pendente`
> **Autorização inicial:** "confirmo a trilha curta e autorizo abrir e corrigir a issue [FIX] Panorama do estado inteiro incompleto: subagente de contexto e qualidade estoura a saída com muitos municípios" em 2026-11-21
> **Modo contínuo:** `suspenso` (G1 aplica-se)
> **Início:** 2026-11-21
> **Última atualização:** 2026-11-21
> **handoff_schema_version:** `2`

## Objetivo

Fazer o panorama do recorte estadual voltar a ter as duas análises conferidas e a síntese, como especifica o plano v4 do ciclo 011, quando a disponibilidade lista muitos municípios.

## Escopo autorizado

Decisão G1 do responsável em 2026-11-21 (opção A da triagem): o subagente de contexto e qualidade cita no máximo 8 municípios com ressalva (lacuna conhecida ou incidência indeterminada), declara que a lista é parcial e não soma nem agrupa municípios. A evidência completa continua na tela. Fora do escopo: teto de saída do modelo, resumo por classe (agregação), a disponibilidade embutida em `cruzar_padroes` e a formulação "não reflete" observada na comparação.

Depois do merge, conferência em produção com uma única pergunta, autorizada pelo responsável na mesma mensagem.

## Origem no backlog

Não se aplica.

## Elegibilidade da trilha curta

- Correção de comportamento já especificado: sim; o plano v4 do ciclo 011 prevê panorama com os dois subagentes conferidos e síntese, inclusive no recorte estadual, e a verificação em produção (PR #110) observou `incompleta`.
- Sem mudança de escopo: nenhuma tela, rota, pergunta, parâmetro ou integração nova; a evidência ganha um índice derivado dos itens já existentes.
- Sem mudança de schema que altere semântica: nenhuma migração.
- Sem mudança de contrato visual: `DESIGN.md` intacto; a evidência segue exibida como JSON.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regra de citação decidida pelo responsável (opção A); caso de referência com 141 municípios fictícios e ressalvas calculadas independentemente. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Sem mudança de acesso, leitura ou políticas. |
| G3 — privacidade de dados | Sim | Fixture gerada com municípios fictícios; nenhum dado real copiado da produção. |
| G4 — migrações só acrescentam | Não | Sem migrações. |

## Execução

- [x] Issue #111 criada pelo template de correção, com a opção "trilha curta".
- [x] Teste sem rede que reproduz a falha com muitos municípios (`scripts/agentes/disponibilidade-estadual.test.mjs`).
- [x] Correção (opção A): `marcarRessalvas`, com `ressalva` por município e `lista_parcial`/`sem_ressalva` em listas longas (`servidor/ferramentas.ts`); instrução do subagente de contexto e qualidade e nota fixa de lista parcial (`servidor/agentes.ts`).
- [x] Gates locais e reavaliação da elegibilidade: os quatro critérios continuam atendidos com o diff final.
- [x] Revisão da correção: rodada 2 `APTO COM RESSALVAS`; R2-1 corrigido, R2-2 decidido pelo responsável, R2-3 fora do escopo.
- [ ] PR, merge aprovado e conferência em produção com uma pergunta.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Reprodução | Antes da instrução nova, o teste de correção falhava e o de reprodução passava: um tópico por município com ressalva excede o teto de 8, a análise fica `falha` e o panorama `incompleta`, sem síntese. Antes das funções novas, o arquivo nem carregava. |
| Caso de referência G1 | 141 municípios fictícios; ressalvas esperadas calculadas à parte: múltiplos de 7 de 0 a 140 e o índice 3 (lacuna conhecida), 22 no total; o índice 5, não avaliado, fica sem marca. |
| Conferência | Contagem citando `lista_parcial` volta `número divergente`; declaração de lista parcial sem algarismos e `sem_ressalva` passam. |
| Depois da correção | 4/4 no arquivo novo: com até 8 municípios marcados, a análise é `concluida`, o panorama `completa` com síntese e a nota fixa de lista parcial aparece com ou sem a limitação do modelo. |
| Agentes | `npm run test:agentes`: 48/48. |
| API | `npm run test:api`: 16/16 (Supabase local; banco vazio e zero usuários fora de `@exemplo.test` conferidos antes do reset). |
| E2E | `13-perguntas.spec.mjs`: 8/8. |
| Typecheck e governança | `typecheck` e `typecheck:servidor` passaram; `test:governance` 55/55; validador com 0 erros. |

## Revisão da correção

### Rodada 1 — 2026-11-21

- **Autor:** Claude Code (Opus 5.5).
- **Revisor:** subagente do Claude Code (Opus 5.5), em contexto separado, com acesso só ao diff, à task e à decisão G1, sem poder editar. Mesmo modelo do autor: independência limitada, aceita pelo responsável ("Pode ser você mesmo. Sigo com você como revisor", 2026-11-21).
- **R1-1 — Bloqueador:** os índices numéricos de `com_ressalva` passavam a valer como números da evidência; "22 municípios têm ressalva e só 7 foram citados", citando o campo, era conferida. Contagem de municípios proibida pela decisão G1.
- **R1-2 — Ressalva:** a declaração de lista parcial não era garantida; com algarismo ("no máximo 8") a limitação era rejeitada e o tópico caía, e a análise podia sair concluída sem o aviso.
- **R1-3 — Ressalva:** municípios não avaliados (sem classes) entravam como ressalva, além do que a decisão G1 nomeou.
- **R1-4 — Ressalva:** em dois lados, "no máximo 8 desse lado" admitia até 16 tópicos, acima do teto; a instrução de citar o mesmo índice nos dois lados podia trocar o município.
- **R1-5 — Ressalva:** com lista vazia, citar `com_ressalva` dava referência inexistente e `alcance` não sustentava a frase; com até 8 municípios, "diga só" contradizia "descreva cada um".
- **R1-6 — Ressalva:** o teste de reprodução só provava o teto; faltavam a limitação rejeitada, a lista vazia e os dois lados.
- **Itens conferidos:** typecheck do servidor e 47 testes de agentes; lista vazia mantém `sem_municipios`; nada em `src` lê o campo novo; sem `DESIGN.md` nem migração; fixture fictícia.
- **Veredito:** `REQUER NOVA RODADA`.

#### Resposta do autor (rodada 1)

- **R1-1 — Corrigido.** Saiu a lista de índices. Cada município ganha `ressalva` (booleano) e a lista longa ganha frases fixas sem algarismos (`lista_parcial`, `sem_ressalva`). Teste: a contagem citada em `lista_parcial` volta `número divergente`.
- **R1-2 — Corrigido.** O servidor acrescenta a nota fixa `NOTAS.listaParcial` sempre que houver `lista_parcial` e a análise de disponibilidade concluir, sem depender do modelo; a instrução pede a limitação sem algarismos. Teste com e sem a limitação do modelo.
- **R1-3 — Corrigido conforme a decisão G1.** Só lacuna conhecida ou incidência indeterminada nas classes avaliadas marcam `ressalva`; não avaliados ficam sem marca, e `sem_ressalva` só é afirmado se todos foram avaliados.
- **R1-4 — Corrigido.** A instrução limita a 8 municípios no total da resposta, somando os lados, e avisa que o mesmo município pode ter índices diferentes em cada lado, a localizar pelo nome. Cada lado é marcado com a própria lista (teste).
- **R1-5 — Corrigido.** Com lista longa e nenhuma ressalva, o modelo cita `sem_ressalva`, frase fixa que confere (teste). Com até 8 municípios, não há frase especial: descreve cada um.
- **R1-6 — Corrigido em parte.** Testes novos cobrem limitação rejeitada com algarismos, lista sem ressalva, não avaliados e marcação por lado. A reprodução continua provando o conflito entre a instrução antiga e o teto de 8, que é o que se pode reproduzir sem o texto bruto do modelo.
- **Validação:** typecheck e typecheck do servidor; `test:agentes` 48/48 (4/4 no arquivo novo); `test:api` 16/16; E2E `13-perguntas` 8/8; `test:governance` 55/55; `git diff --check` passou.

### Rodada 2 — 2026-11-21

- **Autor:** Claude Code (Opus 5.5).
- **Revisor:** o mesmo subagente da rodada 1 (Claude Code, Opus 5.5), com as mesmas limitações de independência.
- **Status da rodada 1:** R1-1, R1-2, R1-3, R1-5 e R1-6 resolvidos; R1-4 resolvido em parte (resto em R2-3).
- **R2-1 — Ressalva:** com lista longa e nenhuma ressalva, `lista_parcial` e a nota fixa diziam citar "parte dos municípios com ressalva", sugerindo ressalvas inexistentes.
- **R2-2 — Ressalva:** a frase fixa `SEM_RESSALVA` é um enunciado coletivo sobre a lista, fora do texto literal da decisão G1; precisa de confirmação do responsável quanto ao "não agrupar".
- **R2-3 — Ressalva:** dois lados com listas curtas (por exemplo 6 e 6) ainda podem passar de 8 tópicos; comportamento anterior à correção.
- **Itens conferidos:** typecheck do servidor e 48 testes de agentes; campos novos usados só em `consultar_disponibilidade`; o booleano não interfere na conferência; frases sem algarismos; lista vazia com `sem_municipios`; fixture fictícia; elegibilidade mantida.
- **Veredito:** `APTO COM RESSALVAS`.

#### Resposta do autor (rodada 2)

- **R2-1 — Corrigido.** Com lista longa, `marcarRessalvas` devolve `lista_parcial` ou `sem_ressalva`, nunca os dois; sem `lista_parcial`, a nota fixa não aparece. Teste acrescentado. `test:agentes` 48/48.
- **R2-2 — Decidido pelo responsável (G1):** frase fixa `SEM_RESSALVA` aceita ("Aceito a frase", 2026-11-21): enunciado fixo e conferido, sem contagem nem soma.
- **R2-3 — Fora do escopo.** Afeta comparações com duas listas curtas, já existia antes desta correção e não é o defeito da issue #111 (recorte estadual de período único). Fica para triagem própria, se o responsável quiser.

## Decisões incidentais e desvios

A causa exata observada em produção não foi isolada: a interface mostrou só `saida_invalida`, sem o texto bruto do modelo. São causas compatíveis: tópicos acima do teto de 8 ao descrever município por município, resposta cortada pelo teto de saída, ou nenhuma afirmação conferida.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 1) — correção da issue #111
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise a correção da issue #111"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + fix + corrigir_trilha_curta + 111 + 72d2629250fbc00e7b76be88e74b88420a193c0f`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: falha observada em produção / correção local com teste de reprodução e gates verdes, aguardando revisão; sem commit.
- `result`: `executed`
- `evidence`: issue #111; `scripts/agentes/disponibilidade-estadual.test.mjs`; 47 testes de agentes, 16 de API, 8 E2E de perguntas.
- `blockers`: revisão da correção (rodada 1).

## Referência do bootstrap

Não se aplica.
