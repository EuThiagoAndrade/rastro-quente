# Plano de Implementação — Colunas sem rolagem horizontal, sobrecarga da IA e retirada de "Perguntar sobre a tela"

> **Ciclo:** `013`
> **Status:** `Concluído`
> **Versão:** `v1`
> **Data de criação:** 2026-11-25
> **Última atualização:** 2026-11-25
> **Tipo:** `feature`
> **Prioridade:** `P1`
> **Nível:** `leve`
> **Autorização inicial:** "Sim, com as recomendações" em 2026-11-25 — mesmo fluxo leve do ciclo 012, com as recomendações da análise prévia (ver D1 a D6)
> **Modo contínuo:** `—`
> **Revisão formal:** `Dispensada pelo responsável (D1)`
> **Veredito da revisão:** `—`
> **Aprovação humana pós-revisão:** `—` (revisão dispensada, D1)
> **Autorização de implementação:** "Autorizo a implementação" em 2026-11-25, em resposta ao pedido de autorização da issue #115
> **Issue:** [#115](https://github.com/EuThiagoAndrade/rastro-quente/issues/115)
> **Branch:** `feature/issue-115`
> **handoff_schema_version:** `2`

## Problema e contexto

Depois da final da banca, o responsável trouxe quatro problemas. A análise prévia (2026-11-25) juntou dois deles, porque um continha o outro, e ficaram três frentes:

1. **Rolagem horizontal nas colunas.** Com o mouse sobre Seleção, Contexto territorial ou Cruzar critérios, aparece uma barra de rolagem horizontal. A causa está em `src/estilos/layout.css`: `.coluna` usa `overflow: auto` com a barra transparente, que só ganha cor em `:hover` e `:focus-within`. Ou seja, algum elemento transborda a largura da coluna o tempo todo, e o hover só torna isso visível. O elemento exato ainda não foi medido.
2. **Sobrecarga do Gemini na "Pergunte ao mapa".** Com HTTP 503 ("high demand"), `/api/interpretar` desiste na primeira recusa (`servidor/gemini.ts` → `provedor_indisponivel`). O interpretador local assume, e a tela diz "A IA não respondeu como esperado", o que parece defeito do sistema. Em 2026-11-25 a sobrecarga do `gemini-3.1-flash-lite` durou vários minutos. Nesse período, o `gemini-3.5-flash` respondeu com a mesma chave e interpretou a pergunta corretamente.
3. **"Perguntar sobre a tela" sem ganho.** O painel de perguntas fechadas da coluna direita (`#painel-perguntas`, ciclos 008 e 011) não traz ganho ao sistema como está e deve sair, sem afetar a "Pergunte ao mapa", a aba Comparação ou a seção Comparar.

**Termos.** Os pontos são **detecções de calor** (focos de calor), nunca "fogo" ou "incêndio".

### Decisões do responsável (2026-11-25)

- **D1. Governança mínima, como no ciclo 012.** O ciclo é leve e tem um único documento, sem ideação, revisão formal, task, KB, emendas ou encerramento prospectivo. São só a issue #115, a branch `feature/issue-115` e uma PR única com o plano e a implementação. O responsável testa e integra a PR. **Exceção pedida pelo responsável:** a ADR-011 recebe o registro do modelo reserva (frente B). Continuam valendo: nenhum segredo nem dado pessoal versionado; o agente não faz merge; o termo é "detecção de calor".
- **D2. Os pedidos 2 e 4 viram uma frente só.** O pedido 4 (nova tentativa, modelo reserva e nota) contém integralmente o pedido 2 (nova tentativa e nota). Sem a variável da reserva, a frente B se comporta exatamente como o pedido 2.
- **D3. Rolagem: as duas colunas, sem esconder o transbordo.** A varredura cobre a coluna esquerda (`#filtros`) e a direita (`#resultado`), porque a regra de CSS é a mesma. A correção atua nos elementos que transbordam. Não se usa `overflow-x: hidden` na coluna, que poderia cortar o contorno de foco e esconder conteúdo.
- **D4. Retirada só da tela.** Sai o painel `#painel-perguntas` e o que só ele usa no navegador. A rota `/api/explicar`, `servidor/explicar.ts`, `servidor/agentes.ts`, `servidor/pedido.ts` e `src/perguntas.ts`, `src/agentes.ts` (usados pelo servidor) ficam. `servidor/interpretar.ts` importa `autorizar` e `origemPermitida` de `servidor/explicar.ts`, e o pedido 4 diz que o `/api/explicar` fica como está.
- **D5. A ficha perde a síntese de IA.** A ficha para averiguação incluía, quando havia, a resposta do painel de perguntas como "Gerado por IA" (`src/ficha.ts`, `src/app.ts`). Sem o painel, a ficha fica só com a síntese determinística, que não muda.
- **D7. Resultado da implementação (2026-11-25).** A medição achou a causa da rolagem: a regra genérica `.pergunta { width: 100% }`, criada para os botões do painel de perguntas, também valia para o texto da pergunta de cada lente (`span.pergunta`), que tem margem à esquerda. Largura cheia mais margem passava da coluna. Com o painel retirado, a regra saiu inteira, e nada mais transbordava. A prova real (D6) com o `gemini-3.5-flash` acertou as 9 perguntas distintas que ele respondeu; as outras 5 ficaram sem resposta por 503, tempo esgotado e, na segunda rodada, 429 de cota.
- **D8. Ajuste depois do teste do responsável (2026-11-25), na PR #116.** O responsável mostrou um espaço em branco entre o rodapé e o fim da página com todas as seções da coluna esquerda abertas, e pediu a correção. Causa: `.coluna` rola por dentro, mas não era bloco de contenção. Os textos só para leitor de tela (`.so-leitor`, absolutos), como o `legend` da seção Comparar, ficavam posicionados fora da rolagem e alongavam a página (de 960 px para 1.889 px numa janela de 960 px). `.coluna` passa a ter `position: relative`, a mesma solução que o rodapé do mapa já usava. O E2E `17-colunas` passa a conferir que a página não passa da altura da janela.
- **D9. Teto da nova tentativa (2026-11-25), na PR #116.** No teste do responsável, o principal respondeu 503 e a nova tentativa ficou pendurada até o fim do prazo de 20 s; a rota respondeu `tempo_esgotado` sem chamar a reserva. Decisão do responsável ("Pode seguir com a opção A"): com a reserva ligada, a nova tentativa no principal tem teto de 7 s e sempre deixa à reserva o tempo mínimo de uma chamada (3 s); estourar esse teto, depois de um 503, leva a pergunta à reserva. Tempo esgotado na primeira chamada continua sem acionar a reserva. Sem reserva, nada muda.
- **D10. Mini mapa da ficha (2026-11-25), na PR #116.** Pedido do responsável depois do teste: o mini mapa das evidências mostrava só um amontoado de pontos, sem o limite do município. Passa a desenhar o limite dos municípios onde estão as detecções do alvo (não o estado inteiro), o contorno das áreas protegidas com detecções (com o traço de cada classe, como no mapa) e, no lugar dos pontos, a densidade por célula, a mesma da camada do mapa: células de 0,05°, cinco classes fixas e a legenda "Detecções por célula: contagem, não gravidade". O mapa se enquadra nos municípios. Limite ou contorno que não puder ser lido vira aviso, e a densidade aparece mesmo assim. Nenhum cálculo novo: a densidade é a função existente (`densidadePorCelula`), e a soma das células é o total do alvo (conferido no E2E).
- **D6. Prova real da interpretação.** Não existe hoje um catálogo de perguntas de teste para a "Pergunte ao mapa" (a prova real atual cobre só o `/api/explicar`). Será criado um script pequeno com as perguntas do roteiro do ciclo 012 e as de recusa, rodado localmente com a chave do `.env` ignorado, contra o `gemini-3.5-flash`. Faz chamadas reais ao Gemini, no nível gratuito.

## Objetivo

1. Nenhuma barra de rolagem horizontal nas colunas, com ou sem o mouse em cima, nas larguras de computador usadas no projeto.
2. Num pico de sobrecarga do modelo principal, a pergunta continua interpretada por IA, pela nova tentativa ou pela reserva. Quando o Gemini inteiro falha por sobrecarga, a tela explica o motivo em vez de sugerir defeito. Sem a variável da reserva, só a nova tentativa e a nota mudam.
3. "Perguntar sobre a tela" sai da tela, e tudo o mais continua igual.

## Origem no backlog

Não se aplica.

## Contexto técnico (main em `c90a3bf`)

- **Colunas.** `.coluna` (`src/estilos/layout.css`) tem `overflow: auto`, `scrollbar-color: transparent transparent` e cor na barra em `:hover`/`:focus-within`. A coluna esquerda (`.coluna--lentes`) tem `#secao-pergunte`, `#secao-consulta`, `#secao-lente`, `#secao-contexto`, `#secao-cruzar` e `#secao-comparar`. A direita (`.coluna--porque`) tem as abas Lentes, Municípios e Comparação e, no fim, `#painel-perguntas`.
- **Medição existente.** `tests/e2e/ajuda.mjs` e `03-acessibilidade` já medem transbordo, contraste, alvos e "sem rolagem horizontal global".
- **Interpretação.** `servidor/interpretar.ts` faz uma chamada ao provedor com `AbortSignal.timeout(TEMPO_PROVEDOR_MS)` (20 s) e devolve `{ interpretacao, modelo }`. `servidor/gemini.ts` transforma 429 em `cota_provedor` e qualquer outro erro em `provedor_indisponivel`, com o detalhe `SOBRECARGA` quando é 503. O navegador (`src/app.ts`, `pedirInterpretacao` em `src/pergunte.ts`) espera até `TEMPO_LIMITE_IA_MS` (20 s) e, em falha, usa o interpretador local com a nota "A IA não respondeu como esperado…" ou "…a tempo…".
- **Repetição no `/api/explicar`.** `servidor/agentes.ts` repete uma vez só o 503 de sobrecarga, depois de `ESPERA_REPETICAO_MS` (2 s). É a regra que a frente B copia, sem mexer no `/api/explicar`.
- **Configuração.** `servidor/config.ts` só liga a IA com `RQ_GEMINI_MODELO` igual a `MODELO_FIXADO` (`gemini-3.1-flash-lite`), sem alias (ADR-011, ponto 2).
- **Painel de perguntas.** `index.html` (`#painel-perguntas` e o passo 6 de "Como ler esta tela"), `src/apresentacao-agentes.ts` (só usado por `src/app.ts`), métodos de perguntas em `src/app.ts`, estilos `.perguntas*` em `src/estilos/componentes.css`, `tests/e2e/13-perguntas.spec.mjs` e trechos de `03-acessibilidade` e `15-municipios`.

## Escopo

### Dentro do escopo

**A. Colunas sem rolagem horizontal**

1. Medir no navegador (Playwright, fixture fictícia do E2E) cada descendente das duas colunas cujo retângulo passa da largura útil da coluna, com cada seção aberta: Pergunte ao mapa, Filtro, Seleção, Contexto territorial, Cruzar critérios e Comparar, além das abas da direita.
2. Corrigir cada elemento encontrado no próprio estilo (por exemplo, `min-width: 0`, quebra de texto longo, `max-width: 100%` ou margens negativas). Não mudar a aparência além do necessário.
3. Teste E2E novo que abre as seções e confere `scrollWidth <= clientWidth` nas duas colunas, em 1440 × 900 e 1280 × 720.

**B. Sobrecarga da IA na "Pergunte ao mapa"** (só `/api/interpretar`)

4. **Nova tentativa.** Com 503 de sobrecarga no modelo principal, a rota espera cerca de 2 s e tenta o principal mais uma vez.
5. **Modelo reserva.** Se o principal continuar com 503, a mesma pergunta vai para o modelo reserva, uma vez.
6. **Prazo único.** Todas as tentativas cabem no prazo atual de 20 s do provedor. A rota não começa uma nova tentativa sem tempo útil restante e, nesse caso, responde com a sobrecarga.
7. **Sem reserva para os outros erros.** 429 (`cota_provedor`), saída inválida, tempo esgotado e outros erros não repetem nem acionam a reserva.
8. **Configuração.** A nova variável opcional `RQ_GEMINI_MODELO_RESERVA` só vale se for exatamente `gemini-3.5-flash`, sem alias. Ausente ou com outro valor, a reserva fica desligada, e o resto da IA continua como hoje. Um valor inválido não desliga a IA. A variável é só do servidor, nunca com prefixo `VITE_`.
9. **Código novo.** Quando todas as tentativas falham por sobrecarga, a rota responde `provedor_sobrecarregado` (HTTP 503 ao cliente), em vez de `provedor_indisponivel`.
10. **Transparência.** A resposta e o log registram qual modelo interpretou, e o log registra quantas tentativas houve. A tela mostra "Interpretado por IA (modelo reserva)" quando a reserva interpretou.
11. **Nota honesta.** Com `provedor_sobrecarregado`, a nota passa a dizer: "A IA está sobrecarregada no momento; o interpretador local assumiu. Tente de novo em alguns minutos." As outras falhas mantêm as notas atuais.
12. **ADR-011.** Recebe o registro da decisão: modelo reserva `gemini-3.5-flash` só para a "Pergunte ao mapa", só depois de 503 persistente, com o nível gratuito mantido, e o `/api/explicar` sem mudança.
13. **Prova real local** (D6): um script novo roda o catálogo de perguntas com o `gemini-3.5-flash` e confere cada interpretação contra o resultado esperado.

**C. Retirada de "Perguntar sobre a tela"**

14. Sai de `index.html` o `#painel-perguntas` e o passo 6 de "Como ler esta tela", que o descreve.
15. Saem de `src/app.ts` o estado, os métodos e as chamadas de atualização das perguntas, e sai `src/apresentacao-agentes.ts`. A ficha deixa de receber a síntese de IA (D5).
16. Saem de `src/estilos/componentes.css` só os estilos usados apenas pelo painel. `.opcao-lente .pergunta` e o que a "Pergunte ao mapa" usar ficam.
17. Sai `tests/e2e/13-perguntas.spec.mjs`. `03-acessibilidade` e `15-municipios` perdem só os trechos do painel. Testes unitários de código do navegador que deixar de existir são ajustados.
18. **Testes mínimos de não regressão:** a "Pergunte ao mapa" (`16-pergunte`), a comparação (`12-comparacao`) e a suíte inteira passam.

### Fora do escopo

- Mudança de banco, RPC, RLS, migração, carga ou método das lentes.
- Mudança no `/api/explicar` e no código do servidor dos agentes (D4).
- Troca do modelo principal; reserva para o `/api/explicar`.
- Mudança na interpretação local.
- Cadastro de `RQ_GEMINI_MODELO_RESERVA` na Vercel: ação do responsável depois do merge.
- Encerramento do ciclo 012, que continua em `drafts/` como `Planejamento`. Fica registrado aqui como pendência.

## Desenho técnico

### Frente B — sequência na rota

```text
principal ── ok ───────────────────────────────▶ 200 { interpretacao, modelo: principal }
    │ 503 de sobrecarga
    ▼ espera ~2 s (se couber no prazo)
principal ── ok ───────────────────────────────▶ 200 { interpretacao, modelo: principal }
    │ 503 de sobrecarga
    ▼ reserva ligada e com tempo útil?
reserva ──── ok ───────────────────────────────▶ 200 { interpretacao, modelo: reserva, reserva: true }
    │ 503 de sobrecarga, reserva desligada ou sem tempo
    ▼
503 provedor_sobrecarregado
```

- 429, saída inválida, tempo esgotado e qualquer outro erro, em qualquer ponto: resposta como hoje, sem nova tentativa.
- Saída da reserva passa pelo mesmo validador (`validarInterpretacao`).
- O prazo de 20 s é um só para a sequência inteira. As chamadas usam o tempo que resta.
- `servidor/config.ts` expõe `gemini.modeloReserva` só quando a variável é válida. `api/interpretar.ts` cria o provedor da reserva com a mesma chave.

### Arquivos afetados (previstos)

| Arquivo | Mudança |
| :-- | :-- |
| `src/estilos/*.css` | Correções pontuais dos elementos que transbordam (A) e retirada dos estilos só do painel (C) |
| `servidor/config.ts` | `RQ_GEMINI_MODELO_RESERVA` (opcional, exato) |
| `servidor/resposta.ts` | Código `provedor_sobrecarregado` (503) e mensagem |
| `servidor/interpretar.ts` | Nova tentativa, reserva, prazo único, modelo usado e tentativas no log |
| `api/interpretar.ts` | Provedor da reserva |
| `src/pergunte.ts`, `src/app.ts`, `src/apresentacao-pergunte.ts` | Código novo, nota de sobrecarga e "Interpretado por IA (modelo reserva)" |
| `index.html`, `src/app.ts`, `src/apresentacao-agentes.ts` (removido), `src/ficha.ts` | Retirada do painel (C) |
| `scripts/agentes/interpretar.test.mjs` | Casos da frente B |
| `scripts/agentes/` (novo script de prova real) e `package.json` | Prova real da interpretação (D6) |
| `scripts/interface/api-e2e.mjs` | Provedor simulado com sobrecarga e com reserva |
| `tests/e2e/16-pergunte.spec.mjs`, `tests/e2e/` (novo teste de rolagem), `03`, `13` (removido), `15` | E2E |
| `_project/decisions/ADR-011_funcao_explicacao_servidor.md` | Registro do modelo reserva |

Sem dependência nova em `package.json`.

## Preservação da interface (critérios de aceite)

- Topo, coluna esquerda, mapa, série e rodapé de domínio sem mudança visual além das correções de transbordo.
- Coluna direita: abas Lentes, Municípios e Comparação iguais. Só "Perguntar sobre a tela" sai.
- "Pergunte ao mapa", mapa vivo e ficha funcionam como hoje, exceto a síntese de IA da ficha (D5).
- A suíte E2E passa. As asserções alteradas são só as do painel retirado, e a PR justifica cada uma.

## Barreiras de domínio

| Barreira | Aplica-se? | Como o ciclo a atende ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Nenhum cálculo muda. A reserva só traduz a pergunta em filtros, e a saída passa pelo mesmo validador. A prova real confere a interpretação do `gemini-3.5-flash` contra o resultado esperado. A IA continua sem produzir números. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | A rota mantém todas as validações atuais (IA ligada, POST, origem, JWT, carga vigente sob RLS). A reserva só é chamada depois delas. Sem `service_role` e sem mudança de banco. |
| G3 — privacidade de dados | Sim | A reserva recebe exatamente o que o principal recebe: a pergunta, a janela e os nomes públicos de município. O log registra modelo e tentativas, nunca a pergunta. Nenhuma chave versionada; a variável nova vai para a Vercel pelo responsável. A prova real usa a chave só do `.env` ignorado. |
| G4 — migrações só acrescentam | Não | Nenhuma migração. |

## Estratégia de testes e gates locais

1. `npm run typecheck`, `npm run typecheck:servidor`, `npm run build`.
2. `npm run test:interface`.
3. `npm run test:agentes`, com os casos novos da rota:
   - 503 e depois 200 no principal: a nova tentativa interpreta;
   - 503 duas vezes no principal e 200 na reserva: a reserva interpreta e o modelo usado é informado;
   - 503 em todas: `provedor_sobrecarregado`;
   - 503 duas vezes sem reserva configurada: `provedor_sobrecarregado`;
   - 429: nenhuma nova tentativa nem reserva;
   - variável da reserva ausente ou com outro modelo: reserva desligada e IA ligada;
   - prazo total de 20 s respeitado (relógio simulado).
4. `npm run test:e2e` (Supabase local), com:
   - `16-pergunte`: provedor simulado sobrecarregado (nota nova e "Interpretado sem IA") e reserva respondendo ("Interpretado por IA (modelo reserva)");
   - teste novo de rolagem nas duas colunas;
   - a suíte inteira, inclusive `12-comparacao`, sem o `13-perguntas`.
5. Prova real local da interpretação com o `gemini-3.5-flash` (D6).
6. Conferência visual em 1440 × 900 e 1280 × 720, claro e escuro.
7. `npm run check:governance`, o único check da CI.

## Como testar a PR (responsável)

- Teste local: `npx supabase start`, depois `npm run test:e2e`.
- IA real: `npx vercel dev` com `RQ_IA_HABILITADA=true`, as variáveis `RQ_*` no ambiente local e, para a reserva, `RQ_GEMINI_MODELO_RESERVA=gemini-3.5-flash`.
- Depois do merge, cadastrar `RQ_GEMINI_MODELO_RESERVA=gemini-3.5-flash` na Vercel. Sem ela, a reserva fica desligada.

## Riscos, suposições e rollback

- **Cota do nível gratuito do `gemini-3.5-flash`.** A reserva só entra depois de 503 persistente, numa chamada por pergunta. Suposição: a mesma chave atende os dois modelos, como observado em 2026-11-25.
- **Disponibilidade da reserva.** Na prova real de 2026-11-25, o `gemini-3.5-flash` também respondeu 503 e passou dos 20 s algumas vezes, e a cota gratuita dele acabou depois de cerca de 20 chamadas em poucos minutos. A reserva aumenta a chance de interpretação por IA, mas não a garante; quando tudo falha, vale a nota de sobrecarga e o interpretador local.
- **Prazo.** A espera de 2 s e a chamada extra consomem o mesmo prazo de 20 s. Num 503 lento, a reserva pode não caber, e a tela mostra a nota de sobrecarga.
- **Retirada parcial do painel.** O código do servidor do `/api/explicar` fica sem chamada na tela (D4). Pode ser removido num ciclo próprio, se o responsável decidir.
- **Rollback:** reverter o squash da PR. Não há migração nem dado envolvido.

## Itens de implementação

### Item 1 — Colunas, sobrecarga com reserva e retirada do painel (issue #115)

Uma PR, na ordem sugerida:

1. Frente C: retirada do painel, com a suíte ajustada.
2. Frente A: medição, correções e teste de rolagem.
3. Frente B: configuração, rota, testes da rota, tela, E2E e ADR-011.
4. Prova real local com o `gemini-3.5-flash`.
5. Gates e PR.

## Referências

- Plano do ciclo 012 (`_project/executed/012_pergunte_ao_mapa/012_plan.md`), formato leve de referência.
- ADR-011 (`_project/decisions/ADR-011_funcao_explicacao_servidor.md`).

## Encerramento

- **Encerramento prospectivo:** Sim. Encerramento curto, autorizado pelo responsável em 2026-11-25 ("Posso fazer o encerramento curto dos ciclos 012 e 013"), numa PR documental conjunta, porque a PR de entrega deste ciclo leve (D1) foi integrada sem o encerramento.
- **Entrega:** PR [#116](https://github.com/EuThiagoAndrade/rastro-quente/pull/116), integrada por squash em `main` (`734d99a`), com os checks verdes. Fechou a issue [#115](https://github.com/EuThiagoAndrade/rastro-quente/issues/115).
- **O que entrou:** colunas sem rolagem horizontal e sem espaço abaixo do rodapé, nova tentativa e modelo reserva na "Pergunte ao mapa", retirada de "Perguntar sobre a tela" e mini mapa da ficha com limites, áreas protegidas e densidade (D7 a D10).
- Ação externa do responsável, fora deste encerramento: cadastrar `RQ_GEMINI_MODELO_RESERVA=gemini-3.5-flash` na Vercel. Sem ela, a produção tem a nova tentativa e a nota de sobrecarga, sem a reserva.
- **Integração deste encerramento:** `Pendente` até o merge da PR documental.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 013 (leve)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 013 + encerrar + 013_plan + pr-116`
- `effect_class`: `remote_mutation` (PR documental de encerramento)
- `state_before` / `state_after`: ciclo em `drafts/`, `Planejamento`, com a PR #116 integrada / ciclo em `executed/`, `Concluído`
- `result`: `executed`
- `evidence`: PR #116 integrada (`734d99a`) com os checks verdes; issue #115 fechada; linha do ciclo em `_project/cycles.md`
- `blockers`: nenhum
