# Task — Issue #71: Pacote de correções do mapa, filtros, acesso e municípios (BL-010 a BL-016)

> **Ciclo:** `—`
> **Trilha:** `curta`
> **Estado:** `Aguardando integração`
> **Tipo:** `fix`
> **Issue:** `#71`
> **Plano:** `—`
> **Branch:** `fix/issue-71`
> **PR:** [#72](https://github.com/EuThiagoAndrade/rastro-quente/pull/72)
> **Integração:** `Pendente`
> **Autorização inicial:** "confirmo a trilha curta e autorizo abrir e corrigir a issue [FIX] Pacote de correções do mapa, filtros, acesso e municípios (BL-010 a BL-016)" em 2026-11-15
> **Modo contínuo:** `—`
> **Início:** 2026-11-15
> **Última atualização:** 2026-11-15
> **handoff_schema_version:** `2`

## Objetivo

Entregar numa única correção os itens BL-010 a BL-016 do backlog: o mapa volta a responder depois de "Sem fundo" ou de falha do satélite, a legenda e a página voltam ao layout do contrato, e os ajustes pedidos de mapa, acesso, filtros e municípios entram com o `DESIGN.md` e o ADR-010 atualizados.

## Escopo autorizado

- BL-010: remoção das camadas de fundo sem `off()`; falha contada por camada; falha só dos nomes mantém a imagem.
- BL-011: atribuição à direita, sem cobrir a "Legenda"; página sem espaço depois do rodapé.
- BL-012: classes de áreas protegidas na "Legenda" do mapa com a camada ligada.
- BL-013: mapa ampliado na altura da tela; "Enquadrar os dados" e "Lista de focos" em pílulas como "Camadas".
- BL-014: tela de acesso sem o aviso amarelo e sem o rodapé; botão do Google centralizado.
- BL-015: "Consulta" recolhida sem resumo; aviso "As lentes ainda usam todo Mato Grosso" removido; foco e seleção da interface em verde (no escuro, verde-menta). A seleção no mapa continua azul, por decisão do responsável.
- BL-016: faixa da aba "Municípios" proporcional ao valor (detecções ou células destacadas).

Fora: migração, RPC, política, dependência, regra analítica.

## Origem no backlog

| ID | Síntese | Parcela |
| :-- | :-- | :-- |
| BL-010 | Travamento do mapa ao trocar de fundo e falha parcial do satélite | Integral |
| BL-011 | Legenda coberta e espaço depois do rodapé | Integral |
| BL-012 | Legenda do mapa com tudo o que aparece no mapa | Integral (áreas protegidas) |
| BL-013 | Mapa ampliado na altura da tela e botões no estilo de "Camadas" | Integral |
| BL-014 | Tela de acesso mais enxuta | Integral |
| BL-015 | Resumo do filtro recolhido, cor de seleção e aviso desatualizado | Integral (cor só na interface) |
| BL-016 | Barras proporcionais na lista de municípios | Integral |

Referência: `_project/backlog.md` no commit `5236251` (main, publicado pela PR #70). Destino em preparação; o retorno ao backlog fica para depois da integração.

## Elegibilidade da trilha curta

- Correção de comportamento já especificado: sim para BL-010 (travamento e atribuição presa; ADR-010), BL-011 (`DESIGN.md`: "sem rolagem da página"), BL-015 (aviso previsto só até o item 4) e BL-016 (`DESIGN.md`: "barra proporcional"; a largura ia no atributo `style`, bloqueado pela CSP). Não para a falha parcial do BL-010, BL-012, BL-013, BL-014 e a cor e o resumo do BL-015.
- Sem mudança de escopo: nenhuma tela, rota, capacidade, parâmetro ou integração nova.
- Sem mudança de schema que altere semântica: nenhuma migração.
- Sem mudança de contrato visual: **não atendido** para BL-012 a BL-015 e para a regra de falhas do ADR-010. **Exceção expressa do responsável** em 2026-11-15 ("Nós vamos colocar todos esses backlogs [...] Inclusive os que ficam fora porque mudam o design ou ADR, todos. Nós vamos colocar no ciclo curto"), registrada aqui e na PR; `DESIGN.md` e ADR-010 atualizados nesta mesma correção.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Não | Só interface: nenhuma contagem, lente, ordem ou explicação muda. A barra usa os mesmos números já exibidos ao lado |
| G2 — autenticação, autorização e isolamento por RLS | Não | O login muda só de aparência; mesmo fluxo, RPCs e papéis |
| G3 — privacidade de dados | Sim | Testes com dados e chave fictícios; nenhum domínio pessoal, chave ou dado real em código, task, issue ou PR |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Issue #71 aberta pela triagem; branch `fix/issue-71`.
- [x] Testes que reproduzem os defeitos (`10-mapa-base`: "Sem fundo" sem erro e sem atribuição presa, falha só dos nomes, atribuição sem cobrir a legenda; `11-ajustes-tela`: altura da página, barra proporcional, mapa ampliado, pílulas, "Consulta" recolhida e foco verde). Antes da correção, o primeiro falha com `Cannot read properties of null (reading 'project')` e a página mede 1151 a 1195 px em 900 px de janela.
- [x] Correções em `src/` e testes ajustados (`01-acesso`, `02-consulta`, `07-areas`, `contraste`).
- [x] `DESIGN.md` e ADR-010 atualizados.
- [x] Gates finais (sem medições de desempenho).
- [x] Revisão da correção: rodada 1 `REQUER NOVA RODADA` (R1-1, R1-2 corrigidos); rodada 2 `APTO PARA APROVAÇÃO`.
- [x] Commit e PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run build` | Sem erros |
| `npm run test:interface` | 193/193 (rodada 1: + `larguraProporcional`); antes, 192/192 (inclui `contraste` com `--foco`, `--selecao-linha` e `--texto-suave` sobre `--linha-selecionada`) |
| `npm run test:e2e` | 110/110 depois da rodada 1 (antes, 109/109). Na primeira rodada completa, 3 falhas: texto suave a 4,46:1 na linha selecionada do tema escuro (cor trocada para `#244a33`, 4,99:1) e o teste de layout que esperava o resumo na "Consulta" recolhida (atualizado) |
| Validador e `git diff --check` | 0 erros; 55/55; sem achados |
| Checks remotos | Pendente |

## Revisão da correção

### Rodada 1 — 2026-11-15

- **Autor:** ferramenta e modelo não identificados na task.
- **Revisor:** Codex (GPT-6).
- **R1-1 — Bloqueador (BL-011):** em mapa estreito, a legenda aberta cobre parte dos créditos do satélite. `src/estilos/componentes.css:936` eleva o painel acima da atribuição, e a reserva lateral em `:946` só acomoda o botão fechado. No Chrome, com viewport de 390 × 844, o HTML e o CSS atuais e uma atribuição simulada com os créditos do ADR-010, os elementos se sobrepuseram em aproximadamente 207 × 100 px. O ADR-010 exige atribuição sempre visível. Ajustar o layout para manter ambos legíveis e cobrir o painel aberto em viewport estreita no E2E.
- **R1-2 — Bloqueador (BL-016):** `src/apresentacao-resultado.ts:326` fixa um mínimo de 3% para todas as barras. Com 901 detecções como máximo, 1 e 27 detecções ganham a mesma largura. Na ordenação por destaques, zero células também ganha uma faixa laranja de 3%. Usar a proporção do valor exibido e cobrir zero e valores abaixo de 3% nos testes.
- **Itens conferidos:** diff, cenários de reprodução, exceção expressa de elegibilidade registrada na issue e na task e barreiras G1 a G4. Typecheck, 192 testes de interface e `git diff --check` passaram. A revisão usou inspeção do E2E e uma reprodução isolada do layout em Chrome. A suíte E2E completa consta como evidência da implementação.
- **Veredito:** `REQUER NOVA RODADA`.

#### Resposta do autor (rodada 1)

- **Autor:** Claude Code (Opus 5.5).
- **R1-1 — Corrigido.** A legenda aberta passou a começar acima da atribuição: `src/mapa.ts` mede a altura real da atribuição (ResizeObserver) em `--altura-atribuicao`, e `.flutuante--legenda[open]` usa essa base em `bottom` e limita `max-height`, com rolagem interna. A atribuição continua sempre visível. E2E `10-mapa-base` cobre 1280 × 720 e 390 × 844, com a legenda fechada e aberta, sem interseção com a atribuição.
- **R1-2 — Corrigido.** `larguraProporcional` (`src/formato.ts`) usa a proporção exata, sem mínimo, e zero não gera barra. Teste unitário em `logica.test.mjs` com 901 × 1 × 27 e zero.
- **Validação:** typecheck e build sem erros; `test:interface` 193/193; `test:e2e` 110/110; `git diff --check` sem achados.

### Rodada 2 — 2026-11-15

- **Autor:** Claude Code (Opus 5.5).
- **Revisor:** Codex (GPT-6).
- **R1-1 — Resolvido.** A altura medida da atribuição desloca a legenda aberta para cima dos créditos. Conferi no Chrome, com créditos simulados, que a atribuição fica sem interseção com a legenda aberta e fechada em 390 × 844 e 1280 × 720. O E2E cobre ambas as dimensões.
- **R1-2 — Resolvido.** A largura usa a proporção do valor exibido sem piso de 3%. Zero não gera barra. O teste unitário diferencia 1 e 27 com máximo 901 e cobre zero.
- **Itens conferidos:** diff da rodada, cobertura dos bloqueadores e escopo autorizado. Typecheck, 193 testes de interface, 55 testes de governança e `git diff --check` passaram. A reexecução do E2E ficou impedida pela porta 5173 ocupada. Os 110 testes E2E aprovados são evidência registrada pelo autor.
- **Veredito:** `APTO PARA APROVAÇÃO`. Nenhum achado novo.

#### Ajustes pedidos pelo responsável depois da rodada 2

O responsável testou localmente e pediu dois ajustes (2026-11-15):

- **Painel "Mapa":** as quatro pílulas no alto do mapa ocupavam espaço demais, sobretudo no celular. Satélite, Sem fundo, Lista de focos, Enquadrar os dados e, no toque, Mover o mapa com um dedo foram para um painel recolhível "⚙ Mapa", ao lado de "Camadas" e no mesmo estilo. Os painéis abrem como menu, um por vez, sem sair da tela a 320 px com texto a 200%. Nome escolhido: "Mapa", o que o usuário faz com o mapa em si, ao lado do que aparece nele ("Camadas").
- **Tema escuro em preto:** fundo `#000000`, superfícies `#121212` e `#1e1e1e`, textos e bordas neutros. As cores de escolha, link, foco, aviso, mapa e camadas foram mantidas. Contraste conferido em `contraste.test.mjs`.
- **Validação:** typecheck e build sem erros; `test:interface` 193/193; `test:e2e` 110/110; validador com 0 erros; `git diff --check` sem achados. Esses ajustes mudam o diff depois do veredito apto e precisam de uma nova rodada de revisão.

### Rodada 3 — 2026-11-15

- **Autor:** Claude Code (Opus 5.5), identificado na resposta da rodada anterior.
- **Revisor:** Codex (GPT-6).
- **R3-1 — Bloqueador (painel Mapa).** O menu absoluto em `src/estilos/componentes.css:860` limita a largura, mas não a altura. O cartão do mapa recorta o excesso com `overflow: hidden`. Reproduzi no Chrome com o HTML e o CSS da PR, viewport de 320 × 640, texto a 200% e a opção de toque habilitada. O menu mediu 677 px de altura dentro de um cartão de 440 px. “Mover o mapa com um dedo” e “Enquadrar os dados” ficaram inteiramente fora da área visível. Limitar a altura à área disponível, permitir rolagem interna e cobrir o painel aberto nesse cenário no E2E.
- **Itens conferidos:** diff da PR #72 (commit `ee642c8`), escopo e exceção registrada, barreiras G1 a G4, cobertura E2E e tokens do tema escuro. Typecheck, 193 testes de interface e `git diff --check` passaram. A reprodução usou um cenário isolado no Chrome. A suíte E2E completa não foi reexecutada localmente nesta rodada.
- **Veredito:** `REQUER NOVA RODADA`.

#### Resposta do autor (rodada 3)

- **Autor:** Claude Code (Opus 5.5).
- **R3-1 — Corrigido.** `src/mapa.ts` mede a altura livre do cartão abaixo das pílulas, que quebram linha com texto grande, e grava `--altura-menu`. Os menus de "Mapa" e "Camadas" usam esse valor como `max-height`, com rolagem interna. E2E novo em `11-ajustes-tela`: a 320 × 640, com toque e texto a 200%, o menu fica dentro do cartão, "Mover o mapa com um dedo" e "Enquadrar os dados" rolam até a área visível e "Enquadrar" responde ao toque.
- **Validação:** build sem erros; `test:interface` 193/193; `test:e2e` 111/111; `git diff --check` sem achados.

### Rodada 4 — 2026-11-15

- **Autor:** Claude Code (Opus 5.5).
- **Revisor:** Codex (GPT-6).
- **R3-1 — Resolvido.** Em uma conferência isolada no Chrome a 320 × 640, com toque e texto a 200%, o menu ficou dentro do cartão e a rolagem interna trouxe “Mover o mapa com um dedo” e “Enquadrar os dados” inteiramente à área visível. O novo E2E cobre a geometria, a rolagem e o toque na última opção.
- **Itens conferidos:** diff da revisão `ccdc235` da PR #72, escopo e barreiras G1 a G4. Typecheck, 193 testes de interface e `git diff --check` passaram. A suíte E2E completa ficou sem reexecução local nesta rodada. Os 111 testes aprovados constam na resposta do autor.
- **Veredito:** `APTO PARA APROVAÇÃO`. Nenhum achado novo.

## Decisões incidentais e desvios

- **Sem testes de carga**, por decisão anterior do responsável.
- **Cor:** verde `#3f6b55` (claro, o mesmo de `--link`) e verde-menta `#6ee7b7` (escuro), escolhido para contrastar com as superfícies verdes do tema escuro, como pediu o responsável. A amostra da seleção na legenda continua azul, porque marca a seleção do mapa.
- **Mapa ampliado:** abaixo do mapa ficam só o aviso do fundo e a "Lista de focos", quando abertos; a série e os cartões voltam ao reduzir.
- **Camadas por cima:** a legenda aberta passou a ficar acima da atribuição; "Camadas" aberto continua acima da legenda, como no `DESIGN.md`.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — correção da issue #71
Quem: Responsável
Conferir: Checks e diff da [PR #72](https://github.com/EuThiagoAndrade/rastro-quente/pull/72)
Diga: "aprovo o merge da PR #72"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + fix + revisar_plano + 71/rodada-4 + ccdc235689bdb7e28ee570b53fe538258e42b1fe`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: aguardando revisão da rodada 4 / apto para aprovação, aguardando merge da PR #72
- `result`: `executed`
- `evidence`: PR #72 e validações registradas na rodada 4 da seção "Revisão da correção"
- `blockers`: checks remotos e aprovação do merge
