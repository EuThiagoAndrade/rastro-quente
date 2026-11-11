# Task — Issue #35: Lente de persistência por célula de 0,05°

> **Ciclo:** `004`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#35`
> **Plano:** `_project/drafts/004_contrato_lentes_selecao/004_plan.md`
> **Branch:** `feature/issue-35`
> **PR:** [#38](https://github.com/EuThiagoAndrade/rastro-quente/pull/38)
> **Integração:** PR #38 integrada em 2026-11-11 pelo responsável (squash `8e023d81b1acb5572873d11caab7084b4e083b3c`)
> **Autorização inicial:** "autorizo a implementação da issue #35" em 2026-11-11
> **Modo contínuo:** `—`
> **Início:** 2026-11-11
> **Última atualização:** 2026-11-11
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 3 do plano `004` v3: a lente de persistência sobre células de 0,05° (grade T1), que destaca cada sequência de 3 ou mais dias GMT consecutivos com detecção na mesma célula como destaque próprio (T6). Só um dia sem detecção interrompe a sequência (D15); a classe observada de cada dia é preservada nas ressalvas (T7), e a sequência que toca a borda da janela recebe a ressalva T4. A disponibilidade não muda a seleção, só as ressalvas. Inclui casos P, E2E, conferência independente e medição consolidadas das três lentes, KB, guia e o roteiro de verificação em produção.

## Escopo autorizado

Issue [#35](https://github.com/EuThiagoAndrade/rastro-quente/issues/35) e item 3 do plano.

- **Arquivos:** `src/lentes/persistencia.ts`, `src/lentes/cobertura.ts`, `src/lentes/comum.ts`, `src/app.ts`, `src/apresentacao-lentes.ts`, `index.html`, `tests/unit/lentes.test.mjs`, `tests/fixtures/lentes/persistencia.json`, `tests/e2e/05-lentes.spec.mjs`, `tests/e2e/fixture.mjs`, `scripts/lentes/conferir.mjs`, `scripts/interface/medir-lentes.mjs`, KB-005, `docs/runbook.md` (seção 10), relatório `004_research_conferencia_lentes.md`, plano, esta task e a reconciliação da task da issue #34.
- **Fora do escopo:** executar a verificação em produção; alterar decisões de método; migração, função, tabela, política ou grant novos; combinação de lentes; fontes externas; encerramento do ciclo.
- **Autorização:** cobre implementação, testes e preparação e publicação da PR; não cobre merge nem a verificação em produção.
- **Verificação em produção:** autorização literal "autorizo a verificação em produção do ciclo 004" recebida em 2026-11-11, depois da integração da PR #38. Cobre o roteiro abaixo e a conferência dos dados informados; não cobre login pelo agente, carga, migração, mudança de dados ou de método, nem a decisão de uma parada.

## Origem no backlog

Snapshot herdado do plano: BL-001, item inteiro, referência `_project/backlog.md` em `85b444d` (já em `main`). Destino em preparação; o retorno ao backlog só depois do encerramento do ciclo.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regras do plano (Q3, Q6 refinada por D15, D13, T1, T4, T5, T6 e T7) implementadas sem decisão nova. Casos P-1 a P-8 com esperado escrito à mão em `tests/fixtures/lentes/persistencia.json`, mais cobertura pendente, coordenada inválida, conferência divergente e determinismo; os casos dos itens 1 e 2 continuam passando. Conferência independente na carga real: SQL a partir do texto da fonte × RPC → TypeScript, em quatro janelas, sem divergência nas três lentes, inclusive o texto completo das ressalvas da persistência; grade T1 em 10.640 detecções por `id_tecnico`, 0 diferenças. Diferença para as 62 células da grade de 5 km explicada no relatório. Limitações das células e aviso de domínio em todo resultado. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma função, tabela, política ou grant novo; a lente só chama as RPCs existentes sob a sessão. |
| G3 — privacidade de dados | Sim | Fixtures fictícias (códigos `99100xx` e `99000xx`, ids `p1a`, `pq01`…) e carga fictícia própria no E2E. A carga real foi usada só localmente, com RP fictício `.test` criado e removido pelos scripts. O relatório e o roteiro têm só agregados públicos (contagens por célula e município, do INPE e do IBGE). Nada no bundle nem em armazenamento do navegador. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada ou alterada. |

## Execução

- [x] Confirmar a issue #35 aberta, o plano v3 aprovado, o item 2 integrado (PR #37, `4e4d56f`), a autorização literal e a base.
- [x] Ler autoridades, `implementar_issue`, templates de task e PR, `governance-check`, `lessons_learned`, o código e os testes dos itens 1 e 2.
- [x] Criar `feature/issue-35` a partir de `main` (`4e4d56fbe99f512ce327364cfe916fbae6054d49`).
- [x] Módulo `src/lentes/persistencia.ts`, ressalvas por classe e casos P-1 a P-8.
- [x] Seletor, rótulos da lista, painel com dias e ressalvas por município.
- [x] E2E da persistência, inclusive a concorrência com a recorrência.
- [x] Conferência e medição consolidadas das três lentes com a carga real; relatório.
- [x] KB-005, guia da interface, roteiro de verificação em produção e reconciliação da task da issue #34 (PR #37 integrada).
- [x] Gates finais; publicar `feature/issue-35` (base `origin/main` em `4e4d56f` conferida, sem branch remota ou PR anterior), abrir a PR [#38](https://github.com/EuThiagoAndrade/rastro-quente/pull/38) com `Closes #35` e gravar o bloco "Aguardando merge".
- [x] Reconciliar a integração: PR #38 integrada pelo responsável, issue #35 fechada, checks verdes no último commit da PR e no `main`.
- [x] Conferir a primeira devolutiva da verificação em produção com os valores locais esperados.
- [ ] Completar a verificação em produção (identidade da carga e 3 execuções válidas por lente, com recarga entre execuções).

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Unitários (`npm run test:interface`) | 62 testes, 0 falhas (4 novos da persistência) |
| `npm run typecheck` e `npm run build` | Sem erros; bundle de 424 kB (118 kB gzip) |
| `npm run conferir:lentes` (commit `5ca5cc1`) | `conferido`: quatro janelas sem divergência nas três lentes; 66 sequências em 60 células na janela inteira; 10.640 detecções na mesma célula pelos dois caminhos; carga `2134ff14…0db2` no início e no fim |
| `npm run medir:lentes` (commit `5ca5cc1`) | Medianas comprimidas: concentração 5,9 s, recorrência 14,3 s e persistência 8,7 s (máximo 9,7 s). Bytes brutos: 4.859.185, 8.322.074 e 6.747.920. Orçamento 20,0 s e 10.000.000 bytes; 3 válidas por lente e passagem, 0 inválidas |
| `npm run test:rls` | pgTAP 173 testes e API 35, todos verdes |
| `npm run test:e2e` | 54 testes (19 na spec de lentes, 3 novos da persistência): 53 passam. "Logout limpa a tela, o estado e a sessão guardada" (`01-acesso`, fora do escopo) falhou nas duas execuções completas neste Windows, como no item 1, e os 5 testes seguintes da mesma spec serial não rodaram; executados à parte (`--grep-invert`), os 11 demais testes de `01-acesso` passam. A CI desta PR é a evidência da suíte completa |
| Governança | `node --test scripts/validate-governance.test.mjs`: 55 testes, 0 falhas; `node scripts/validate-governance.mjs`: 0 erros, 0 avisos, 9 conferências manuais |
| `git diff --check` | Sem erros; staging revisado e limitado ao escopo; varredura G3 sem e-mail real, UUID ou segredo nos documentos |
| Checks remotos | PR #38: "Validate governance", "Database RLS and query contract" e "Interface typecheck, build and E2E" verdes; `main` em `8e023d8`: execução [43064246424](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/43064246424) verde |

## Roteiro de verificação em produção

Preparado para o ponto "Verificar produção" do plano. **Só é executado depois de "autorizo a verificação em produção do ciclo 004"**, com os itens 1 a 3 integrados. O agente não faz login, carga, migração nem mudança de dados ou de método. Os passos são do responsável, na própria sessão; nenhum segredo é informado.

**Precondições, conferidas pelo agente antes de pedir os passos:**

1. PRs #36, #37 e a deste item integradas em `main`, e o commit de `main` anotado.
2. Deploy de produção da Vercel do mesmo commit, identificado pelo responsável no painel da Vercel (o deploy é disparado pelo merge).

**Passos do responsável (procedimento hospedado da seção de orçamento do plano):**

1. No Chrome do computador do responsável, abrir a aplicação de produção e entrar normalmente.
2. No cartão "Proveniência", anotar a identidade da carga vigente. Ela precisa ser `2134ff148b386593a2d89af9894a34ec4a7ef035a660c5652092dc42313e0db2`; se for outra, parar e informar.
3. Deixar a janela da consulta na janela inteira da carga, de 2025-11-01 a 2026-10-31 (dias GMT).
4. No DevTools: aba Network com "Disable cache" ligado; perfil de rede personalizado com latência de 150 ms, 1,6 Mbit/s de descida (1.600 kbit/s) e 750 kbit/s de subida; aba Performance com CPU 4× mais lenta.
5. Para cada lente (Concentração, Recorrência e Persistência), repetir até ter 3 execuções válidas, no máximo 6 tentativas por lente:
   - recarregar a página (o login continua) e limpar o log da aba Network;
   - escolher a lente e clicar em "Aplicar lente", contando o prazo de 120 s a partir do clique;
   - é **válida** a execução cujo cartão mostra "Lente concluída em X,X s" dentro do prazo; qualquer outro estado ("cobertura não verificada", "leitura inconsistente", "falha", prazo estourado) é **inválida** e deve ser informada com o motivo;
   - anotar o tempo do cartão, o "transferred" do painel Network filtrado por `rest/v1` e o `Content-Encoding` de uma resposta de `rest/v1`.
6. Na última execução válida de cada lente, informar o número de destaques e copiar a lista (ou, no mínimo, o primeiro e o último itens).

**O que informar ao agente:** commit do deploy; identidade da carga; por lente, todas as tentativas (tempo ou motivo da invalidade), o "transferred" e o `Content-Encoding`; número de destaques e a lista.

**Valores locais esperados** (conferência `conferido` em `5ca5cc1`, carga `2134ff14…0db2`, janela inteira; lista completa em `local/dados-prototipo/conferencia-lentes.json`, fora do Git, para o agente comparar):

| Lente | Destaques | Valores para conferir |
| :-- | --: | :-- |
| Concentração | 10 | Colniza 901, Paranatinga 604, Marcelândia 531, Nova Nazaré 463, Nova Maringá 371, Campinápolis 365, Aripuanã 334, Luciara 330, Juara 305 e São Félix do Araguaia 284; cada um com "286 de 365 dias sem evidência de lacuna (cobertura não comprovada)" |
| Recorrência | 150 | 109 com 3 meses, 33 com 4, 5 com 5, 2 com 6 e 1 com 7; 1.485 detecções nas células. Primeiro: "Célula -9.05 a -9.00 · -60.45 a -60.40 — 3 meses GMT (12 detecções)"; último: "Célula -17.75 a -17.70 · -53.30 a -53.25 — 3 meses GMT (6 detecções)"; todos com "286 de 365…" |
| Persistência | 66 | Em 60 células; 38 de 3 dias, 27 de 4 e 1 de 6; 531 detecções. Primeiro: "Célula -13.10 a -13.05 · -53.95 a -53.90 — 4 dias GMT seguidos, 15/11/2025 a 18/11/2025 (6 detecções)"; último: "Célula -12.70 a -12.65 · -54.05 a -54.00 — 3 dias GMT seguidos, 23/10/2026 a 25/10/2026 (12 detecções)"; todos com "286 de 365…" |

**Orçamento hospedado:** mediana das 3 execuções válidas ≤ 20,0 s por lente.

**Parada em produção (antes do encerramento):** a situação passa a "Parado" se a identidade da carga for outra; se a mediana de alguma lente passar de 20,0 s; se alguma lente não tiver 3 execuções válidas em 6 tentativas; ou se o número de destaques, ou o valor de algum destaque, divergir da conferência local. Alternativas para decisão do responsável, sem escolha do agente: aceitar e registrar o desvio no encerramento; corrigir por trilha curta (defeito de algo especificado) ou por novo ciclo; ou reverter as entregas na ordem da seção de rollback do plano. O encerramento só é preparado depois da decisão registrada.

### Resultado da verificação em produção — primeira devolutiva (2026-11-11)

Dados informados pelo responsável depois de "autorizo a verificação em produção do ciclo 004", conferidos pelo agente com os valores locais esperados acima.

**Precondições:** PRs #36, #37 e #38 integradas; `main` em `8e023d8`, com CI verde. Segundo o responsável, o deploy ativo na Vercel é do commit `8e023d8`. **Conferem.**

| Lente | Tempo (1 execução) | Network (`rest/v1`) | Destaques informados | Esperado | Situação |
| :-- | --: | :-- | :-- | :-- | :-- |
| Concentração | 13,0 s | 32 requisições; 571 kB transferidos; 4,8 MB de recursos | 10 municípios | 10, com nomes e números de detecções | Contagem confere. Nomes e números não informados |
| Recorrência | 11,2 s | 42 requisições; 112 kB transferidos; 3,6 MB de recursos | 150; primeiro "Célula -9.05 a -9.00…", último "Célula -17.75 a -17.70…" | 150; mesmas células na primeira e na última posição | Contagem e células das pontas conferem. Meses e detecções cortados no relato |
| Persistência | 3,4 s | 11 requisições; 30,6 kB transferidos; 892 kB de recursos | 66; primeiro "Célula -13.10 a -13.05…", último "Célula -12.70 a -12.65…" | 66; mesmas células na primeira e na última posição | Contagem e células das pontas conferem. Dias e detecções cortados no relato |

`Content-Encoding` observado nas três lentes: `gzip`.

**Divergência com a conferência local:** nenhuma encontrada nos dados informados.

**O que falta para concluir o roteiro:**

- **Identidade da carga (passo 2):** não foi informada. Sem ela, os destaques hospedados não podem ser ligados à carga `2134ff14…0db2` da conferência local.
- **Três execuções válidas por lente (passo 5):** veio uma execução por lente, sem as demais tentativas. Por isso não há mediana, e o orçamento hospedado não pode ser conferido.
- **Recarga entre execuções:** os volumes da recorrência e da persistência indicam execuções sem recarga, aproveitando a memória da lente (`memoriaLente` em `src/app.ts`, reaproveitada enquanto sessão, carga e janela forem as mesmas):
  - na concentração, 4,8 MB de recursos, praticamente os 4.859.185 bytes brutos da medição local, como esperado com a memória vazia;
  - na persistência, 892 kB, contra 6.747.920 bytes brutos locais. Não houve a leitura dos registros, só a disponibilidade e as geometrias que faltavam;
  - na recorrência, 3,6 MB, contra 8.322.074 bytes.

  Os tempos de 11,2 s e 3,4 s medem a lente com a memória já preenchida, não o procedimento hospedado. Só a concentração (13,0 s) veio de uma leitura completa, e é uma execução só.
- **Valores dos destaques (passo 6):** faltam a lista da concentração e os textos completos do primeiro e do último item da recorrência e da persistência.

Com isso a verificação fica incompleta, e a situação passa a "Parado". Não se trata da parada em produção do plano, porque nenhum critério dela foi atingido nos dados recebidos. O motivo é que as precondições do registro não puderam ser verificadas. O encerramento do ciclo só é preparado depois que a verificação estiver completa ou que o responsável decidir de outro modo.

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Ressalvas por classe na qualificação.** As ressalvas D15 dependem da disponibilidade; por isso são calculadas em `qualificar` (função pura, `ressalvasDeClasse` em `cobertura.ts`) a cada chegada de disponibilidade, sobre o resultado da seleção, que só traz a ressalva T4. A seleção nunca muda; o caso P-8 e o teste de cobertura pendente provam a substituição por "ressalvas de disponibilidade ainda não verificadas".
- **Ordem das ressalvas.** A de borda (T4) vem primeiro; as de classe seguem a ordem dos dias (vizinho anterior, dias da sequência, vizinho seguinte).
- **Motivo com ano.** O motivo e o rótulo da lista trazem as datas com ano (DD/MM/AAAA), porque a janela da carga cruza 2025 e 2026; as ressalvas usam DD/MM, como no texto aprovado.
- **Carga fictícia própria no E2E.** O bloco de persistência da spec 05 publica, pelo mesmo protocolo de limpeza, uma carga fictícia de outubro (`sqlFixturePersistencia`, identidade `e…e4`) e restaura a fixture original no fim. A montagem SQL das cargas por célula passou a ser uma função comum (`sqlCargaCelulas`), usada também pela recorrência; o SQL gerado da recorrência ficou idêntico (mesmo tamanho, 46.921 caracteres, antes e depois).
- **Ressalvas comparadas em claro na conferência.** O texto completo das ressalvas de cada sequência é montado no SQL independente e comparado com o do módulo; os dias restritivos seguem comparados por md5, como no item 2.
- **Teste de logout local (herdado do item 1, fora do escopo).** Voltou a falhar neste Windows (o `localStorage` ainda guarda o token logo depois de a tela limpar), como registrado na task da issue #33; no item 2 tinha passado. Nada foi alterado nele; segue relatado para decisão, sem correção silenciosa.
- **Rastreabilidade do plano.** A linha "PR(s)" do plano estava parada em "#36, aguardando merge"; foi atualizada com #36 e #37 integradas.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Parado — ciclo 004 (completo)
Quem: Responsável
Conferir: Pode completar o roteiro de verificação em produção? Falta a identidade da carga no cartão "Proveniência". Faltam também 3 execuções válidas por lente, com a página recarregada antes de cada uma e todas as tentativas informadas. Por fim, faltam a lista da concentração e os textos completos do primeiro e do último item da recorrência e da persistência. Outra opção é decidir registrar a verificação com a evidência atual, como desvio no encerramento.
Diga: sua resposta à pergunta registrada
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 004 + verificar_producao + ciclo 004 + 8e023d8`
- `effect_class`: `local_mutation`
- `state_before`: PR #38 integrada pelo responsável em `8e023d8`; issue #35 fechada; CI do `main` verde; task ainda em `Aguardando integração`; roteiro de verificação não executado.
- `state_after`: task reconciliada (`Concluída`); primeira devolutiva da verificação em produção conferida, sem divergência nos dados recebidos, mas incompleta. Registro feito em commit local na branch `chore/cycle-004-closure`, sem push.
- `result`: `executed`
- `evidence`: autorização literal "autorizo a verificação em produção do ciclo 004"; dados informados pelo responsável; `gh pr view 38` (MERGED, `8e023d8`, três checks verdes); execução 43064246424 do `main`; seção "Resultado da verificação em produção — primeira devolutiva".
- `blockers`: identidade da carga não informada; uma execução por lente em vez de três válidas; recorrência e persistência medidas com a memória da lente preenchida; valores dos destaques incompletos.

## Referência do bootstrap

Para o ciclo `000`, consultar `_project/README.md` › `Bootstrap do ciclo 000`: escopo nominal, task excepcional, L1/C1/C2, limites locais e retomada antes de publicação. Nenhum outro ciclo herda essa exceção.
