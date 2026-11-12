# Task — Issue #43: Interface mínima da combinação de lentes

> **Ciclo:** `005`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#43`
> **Plano:** `_project/drafts/005_combinacao_criterios_selecao/005_plan.md`
> **Branch:** `feature/issue-43`
> **PR:** [#45](https://github.com/EuThiagoAndrade/rastro-quente/pull/45)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #43" em 2026-11-12
> **Modo contínuo:** `—`
> **Início:** 2026-11-12
> **Última atualização:** 2026-11-12
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 2 do plano `005` v2: expor ao usuário a combinação do item 1 no cartão "Lentes de seleção", com escolha de 2 ou 3 lentes e do operador, lista paginada de células, retângulos no mapa e painel por critério (motivo, evidência e ressalvas de cada destaque original, cobertura da célula e evidência em união), com os estados distintos do plano; medir as 8 configurações e as três lentes na janela inteira; atualizar o guia da interface e a KB-005; e deixar pronto o roteiro de verificação em produção.

## Escopo autorizado

Issue [#43](https://github.com/EuThiagoAndrade/rastro-quente/issues/43) e item 2 do plano.

- **Arquivos:** `src/app.ts`, `src/apresentacao-combinacao.ts` (módulo novo), `src/apresentacao-lentes.ts` (estados), `src/lentes/combinacao.ts` (só os textos da limitação geral por operador, R2-1), `index.html`, `src/estilos/componentes.css` (só componentes novos), `tests/unit/combinacao.test.mjs` (R2-1), `tests/e2e/06-combinacao.spec.mjs`, `tests/e2e/fixture.mjs`, `scripts/interface/medir-lentes.mjs`, `docs/runbook.md` (seção 10), KB-005, relatório `005_research_conferencia_combinacao.md` (medição), plano (estado e rastreabilidade), esta task e a reconciliação de `005_task_issue-42.md`.
- **Fora do escopo:** mudança de regra, parâmetro ou resultado da combinação e das três lentes; migração, função, tabela, view, política ou grant; dependência nova; redesenho (BL-007); otimização de desempenho (adiada pela decisão do orçamento); verificação em produção; encerramento do ciclo.
- **Autorização:** cobre branch, task, implementação, testes, medição local com a carga real em `local/` e a PR da issue. Não cobre merge, mudança de regra ou de parâmetro, nem a decisão que uma parada exigir.

## Origem no backlog

Snapshot herdado do plano: BL-005, item inteiro, referência `_project/backlog.md` em `2e31651` (já em `main`). Destino em preparação; o retorno ao backlog só depois do encerramento do ciclo.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | A interface usa a regra do item 1 sem redefini-la (Q1 a Q9, T8 a T14): `combinar` sobre a entrada conferida e `qualificarCombinacao`. Única mudança no módulo: a limitação geral por operador (R2-1), coberta pelos casos CB. `conferir:combinacao` no commit `6b61568`: `conferido`, sem divergência. Textos de T11, limitações e aviso de domínio sempre visíveis; nenhuma ordem, pontuação ou "N lentes" (verificado no E2E). |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, view, política ou grant novo; a combinação usa as RPCs existentes sob a sessão do usuário. A limpeza ao sair, expirar ou perder acesso segue o ADR-007 e é testada no E2E. |
| G3 — privacidade de dados | Sim | Fixtures fictícias no E2E (12 municípios inventados `99000xx`, ids como `cx1`, contas `.test`). A carga real (pública, INPE e IBGE) só é usada localmente; o relatório e esta task trazem só agregados públicos e o hash público da carga. Nenhum resultado em armazenamento do navegador. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada ou alterada. |

## Execução

- [x] Confirmar a issue #43 aberta, o plano v2 aprovado e integrado, a autorização literal, o item 1 integrado (PR #44, squash `caaa7d8`, issue #42 fechada em 2026-11-12) e a base (`origin/main` em `caaa7d862ce2fee65385146c9075169abf58edc7`, run de `main` 43223606456 verde).
- [x] Ler autoridades, `implementar_issue`, template de task, `governance-check`, `lessons_learned`, o plano, o módulo de combinação, o controlador, a apresentação das lentes, o E2E e a medição do ciclo `004`.
- [x] Criar `feature/issue-43` a partir de `origin/main`, sem branch remota anterior.
- [x] Interface: seletor, grupo de lentes e operador, aplicação, lista paginada, mapa, painel e estados.
- [x] E2E `06-combinacao.spec.mjs` com fixture fictícia.
- [x] Commit do código (`6b61568`); `conferir:combinacao` e medição nesse commit.
- [x] Medição das 8 configurações e das três lentes na janela inteira: 3 configurações "ou" fora do orçamento de tempo; parada registrada e decidida pelo responsável (alternativa 1, desvio aceito).
- [x] Runbook (seção 10), KB-005, relatório e roteiro de verificação em produção.
- [x] Gates locais; publicar `feature/issue-43` (base `origin/main` em `caaa7d8` conferida, sem branch remota ou PR anterior), abrir a PR [#45](https://github.com/EuThiagoAndrade/rastro-quente/pull/45) com `Closes #43` e gravar o bloco "Aguardando merge".

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Unitários (`npm run test:interface`) | 79 testes, 0 falhas (inclui CB-1 a CB-16, com a limitação por operador de R2-1) |
| `npm run typecheck` e `npm run build` | Sem erros; bundle de 443 kB (122 kB gzip) |
| E2E `06-combinacao.spec.mjs` | 14 testes, todos verdes |
| `npm run test:e2e` (suíte completa) | 68 testes: 62 passam; "Logout limpa a tela, o estado e a sessão guardada" (`01-acesso`, fora do escopo) falhou neste Windows, como no item 1, e os 5 seguintes da spec serial não rodaram; executados à parte (`--grep-invert`), os 11 demais de `01-acesso` passam. A CI da PR é a evidência da suíte completa |
| `npm run conferir:combinacao` (commit `6b61568`) | `conferido`, sem divergência nas 4 janelas e nas 8 combinações; carga `2134ff14…0db2` no início e no fim |
| `npm run medir:lentes` (commit `6b61568`) | `parado` pelo script: 8 de 11 configurações dentro do orçamento; 3 fora pelo tempo. Desvio aceito pelo responsável (seção "Parada do orçamento") |
| `npm run test:rls` | pgTAP 173 testes e API 35, todos verdes (sem mudança esperada) |
| Governança | `node --test scripts/validate-governance.test.mjs`: 55 testes, 0 falhas; `node scripts/validate-governance.mjs`: 0 erros, 0 avisos, 9 conferências manuais |
| `git diff --check` | Sem erros |
| Checks remotos | Pendente |

## Parada do orçamento

Medição de 2026-11-12, commit `6b61568`, Chrome 157, perfil do ADR-007, carga `2134ff148b386593a2d89af9894a34ec4a7ef035a660c5652092dc42313e0db2` (igual no início e no fim). Orçamento por configuração: mediana comprimida ≤ 20,0 s e maior total bruto ≤ 10.000.000 bytes. Todas as configurações tiveram 3 execuções válidas em cada passagem, sem tentativa inválida.

| Configuração | Células | Municípios | Mediana comprimida | Maior total bruto | Bytes comprimidos | Orçamento |
| :-- | --: | --: | --: | --: | --: | :-- |
| Concentração | — | 10 | 5,9 s | 4.859.185 | 550.938 | Dentro |
| Recorrência | — | 51 | 14,5 s | 8.322.074 | 617.159 | Dentro |
| Persistência | — | 33 | 8,2 s | 6.747.920 | 571.478 | Dentro |
| Concentração e recorrência | 77 | 12 | 6,3 s | 4.911.407 | 518.182 | Dentro |
| Concentração ou recorrência | 1.090 | 55 | **53,3 s** | 8.671.886 | 627.310 | **Fora (tempo)** |
| Concentração e persistência | 31 | 8 | 5,9 s | 4.561.595 | 508.030 | Dentro |
| Concentração ou persistência | 1.046 | 42 | **40,9 s** | 7.534.997 | 594.319 | **Fora (tempo)** |
| Recorrência e persistência | 9 | 7 | 5,7 s | 4.474.142 | 505.492 | Dentro |
| Recorrência ou persistência | 201 | 61 | 15,7 s | 9.196.604 | 642.533 | Dentro |
| As três, e | 6 | 4 | 5,5 s | 4.211.783 | 497.873 | Dentro |
| As três, ou | 1.116 | 65 | **54,5 s** | 9.546.411 | 652.684 | **Fora (tempo)** |

Por parte, na passagem bruta: registros 3.861.971 bytes em todas; disponibilidade 87.453 bytes por município (5.684.440 nos 65 de "as três, ou"). Células e municípios iguais aos da conferência independente.

**Diagnóstico (não confirmado):** os bytes ficaram todos dentro do limite, e os bytes comprimidos das três configurações fora (≈ 600 kB) são parecidos com os da recorrência (617 kB, 14,5 s). O tempo cresce com o número de células, não com os dados: "recorrência ou persistência" (201 células, 61 municípios) leva 15,7 s, e "concentração ou recorrência" (1.090 células, 55 municípios) leva 53,3 s. A causa provável é processamento no navegador: a cada resposta de disponibilidade (42 a 65), a implementação requalifica todas as cerca de 1.100 células (cobertura sobre 365 dias cada) e redesenha o cartão inteiro, com a CPU 4× mais lenta.

**Alternativas apresentadas:** 0. otimizar a implementação sem mudar comportamento e medir de novo; 1. aceitar com progresso visível e registrar o desvio; 2. cobertura sob demanda; 3. ajustar o orçamento; 4. função agregadora no banco.

**Decisão do responsável (2026-11-12):** alternativa 1. Em síntese, sem dados pessoais: "Vou aceitar e seguir em diante. Se está aceitável, vamos seguir para frente. [...] problemas de performance eu consigo ajustar posteriormente." Motivo declarado: apresentação do projeto em 23/11 e pouco tempo. O progresso já é visível ("Carregando: disponibilidade N de M municípios…"), e a otimização fica para depois, fora desta issue.

## Roteiro de verificação em produção

Executado pelo responsável, na própria sessão, só depois de "autorizo a verificação em produção do ciclo 005" e da integração dos itens 1 e 2. O agente não faz login nem altera dados.

1. **Deploy:** anotar o commit de `main` do deploy de produção na Vercel (deve conter o squash da PR desta issue).
2. **Identidade integral da carga:** copiar do cartão "Proveniência" a identidade completa (SHA-256, 64 caracteres hexadecimais). Esperado, caractere a caractere: `2134ff148b386593a2d89af9894a34ec4a7ef035a660c5652092dc42313e0db2`. O id da carga de produção é só referência e não é comparado com o local.
3. **Perfil (R2-2):** Chrome, DevTools aberto, "Disable cache" ligado, perfil de rede personalizado com 150 ms de latência, 1,6 Mbit/s de descida e 750 kbit/s de subida, e CPU 4× mais lenta.
4. **Execuções:** janela inteira (2025-11-01 a 2026-10-31). Para "as três, e" e depois "as três, ou": recarregar a página antes de cada execução (memória da lente vazia), escolher "Combinação de lentes", marcar as três caixas e o operador, clicar em "Aplicar lente" e contar o prazo de 120 s a partir do clique. São necessárias 3 execuções válidas de cada, em no máximo 6 tentativas.
5. **Por execução, informar:** o número de células ("Células 1 a 50 de M"), o tempo exibido ("Combinação concluída em X,X s"), os bytes transferidos filtrando o DevTools por `rest/v1` e o `Content-Encoding` observado. Para toda tentativa inválida, informar o motivo (por exemplo, estado final diferente de "completo", inclusive "cobertura não verificada", ou prazo de 120 s excedido).
6. **Valores locais esperados (mesma carga):** "as três, e" com 6 células (4 municípios na cobertura) e mediana local de 5,5 s; "as três, ou" com 1.116 células (65 municípios) e mediana local de 54,5 s.

**Conferência do agente:** commit do deploy, identidade igual à local, número de células igual ao local e mediana dentro do orçamento. **Atenção:** com o desvio aceito localmente, "as três, ou" deve passar de 20,0 s também em produção. Pela regra do plano, isso leva a "Parado" antes do encerramento, e o responsável decide então se estende o desvio aceito à produção.

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Desvio de orçamento aceito:** "concentração ou recorrência" (53,3 s), "concentração ou persistência" (40,9 s) e "as três, ou" (54,5 s) passam da mediana comprimida de 20,0 s; os bytes de todas as configurações ficaram dentro. Decisão do responsável na seção "Parada do orçamento"; otimização adiada.
- **Limitação geral por operador (R2-1):** `LIMITACAO_ESPECIFICA` virou `LIMITACAO_OPERADOR`, com um texto para "e" (mais específica) e outro para "ou" (amplia), ambos com o aviso de que a lista não é ranking. A versão `combinacao-005-v1` não muda, porque não há mudança de regra.
- **Estados da combinação no mesmo atributo:** `data-estado-lente` ganhou `sem_celulas_em_comum`, `sem_celulas_destacadas`, `indisponivel` e `versao_substituida`. A versão substituída só usa o estado novo quando há combinação aplicada ou em aplicação; as lentes individuais continuam com `cancelada`, como no ciclo `004`.
- **"Tentar de novo"** repete a configuração aplicada, não a do formulário (coerente com R1-7).
- **Contagem no mapa:** como o mapa desenha em canvas, a lista declara quantos retângulos a camada de destaques tem ("Mapa: N células desenhadas…"), a partir da contagem do próprio mapa.
- **Alvo de toque:** o rótulo inteiro de cada caixa e opção (`.opcao`, ≥ 44 px de altura) é o alvo; a caixa visual tem 1,25 rem.
- **Texto de validação:** "Escolha pelo menos 2 lentes para combinar." e aviso "A configuração escolhida mudou; aplique de novo para atualizar.", com a primeira letra maiúscula.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 005 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #45 (https://github.com/EuThiagoAndrade/rastro-quente/pull/45)
Diga: "aprovo o merge da PR #45"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 005 + implementar_issue + 43 + caaa7d8`
- `effect_class`: `remote_mutation`
- `state_before`: item 1 integrado (PR #44); issue #43 aberta; nenhuma branch, task ou PR do item 2.
- `state_after`: branch local `feature/issue-43` com o código (`6b61568`) e a documentação; conferência `conferido`; medição com 3 configurações fora do orçamento de tempo e desvio aceito pelo responsável. Branch publicada e PR #45 aberta para `main` com `Closes #43`, aguardando checks e merge; task `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorização literal "autorizo a implementação da issue #43" (2026-11-12); decisão do responsável pela alternativa 1 (2026-11-12); tabela "Evidências" e seção "Parada do orçamento"; `local/dados-prototipo/medicao-lentes.json` e `conferencia-combinacao.json` (fora do Git).
- `blockers`: nenhum para a publicação. O merge depende de checks verdes e de "aprovo o merge da PR #45"; a verificação em produção, de autorização própria depois do merge.
