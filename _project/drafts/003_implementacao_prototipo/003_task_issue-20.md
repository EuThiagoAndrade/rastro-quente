# Task — Issue #20: Implementar recorte local e medir 12 meses de focos em MT

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#20`
> **Plano:** `_project/drafts/003_implementacao_prototipo/003_plan.md`
> **Branch:** `feature/issue-20`
> **PR:** [#25](https://github.com/EuThiagoAndrade/rastro-quente/pull/25)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #20" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-07
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 1 do plano `003` v4: CLI local que fixa a janela de 12 meses, obtém fontes públicas com proveniência, recorta `AQUA_M-T` em Mato Grosso pela malha municipal IBGE, produz principal e envelope, disponibilidade D1 e alcance H3, e mede a janela completa sem banco ou provedor.

## Escopo autorizado

Issue [#20](https://github.com/EuThiagoAndrade/rastro-quente/issues/20) e item 1 do plano: `scripts/prototipo/`, `tests/fixtures/prototipo/`, KB do método, relatório sanitizado de medição, script `test:prototipo` e passo de CI com fixtures. Brutos e saídas em `local/dados-prototipo/`. Fora do escopo: banco, migrações, RLS, aplicação web, deploy, carga hospedada, custos, outros satélites e ranking. A autorização cobre implementação, testes e preparação/publicação da PR; o critério H3 do plano exigiu parar antes de publicar até a decisão humana, registrada abaixo.

## Origem no backlog

Não se aplica. Snapshot herdado do plano: demanda direta do responsável; nenhum ID do backlog selecionado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Contrato do plano aplicado: casos independentes em fixtures fictícias (32 testes), referência de Colniza 516/246/62 reproduzida com os mesmos hashes do ciclo `001`, agregação independente sem diferenças, divergências INPE × IBGE relatadas, nenhum empate resolvido pelo agente. Regra H3 e avisos sem área decididos pelo responsável (seção "Decisões humanas de G1"), não pelo agente. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma tabela, papel, política, autenticação ou acesso remoto nesta unidade; dry-run sem banco. A barreira do ciclo segue aplicável aos itens 2 a 5. |
| G3 — privacidade de dados | Sim | Somente fontes públicas com condições registradas; fixtures fictícias (códigos 99000xx, UF 99); brutos, registros e ids do INPE ficam em `local/`; relatório só com contagens, tamanhos, tempos e hashes; nenhuma credencial usada. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada, alterada ou removida. |

## Execução

- [x] Confirmar issue #20 aberta, plano v4 `Aprovado` e integrado (PR #19, merge `fcf15b9`), base `main` limpa e autorização literal.
- [x] Ler autoridades, `implementar_issue`, templates de task, PR e KB, `governance-check` e `lessons_learned`.
- [x] Criar `feature/issue-20` a partir de `fcf15b9f7c8be4b611a13a75d82dc387171d0977`.
- [x] Fixar a janela 2025-11-01 a 2026-11-01 e o envelope 2026-11-01 00h–04h Z; obter e registrar 22 fontes.
- [x] Implementar leitura validada, território, recorte, agregação, D1, alcance H3, medição e conferência independente.
- [x] Testes com fixtures fictícias e execução completa local da janela.
- [x] Relatório `003_research_medicao_recorte.md` e `KB-004_metodo_recorte_focos_mt.md`.
- [x] Parar em H3 antes de publicar e apresentar números e alternativas (commit local `7468e42`).
- [x] Registrar as decisões humanas H3 e dos 3 avisos sem área nesta task e em `avisos.json`.
- [x] Implementar a regra `H2_interrupcoes_nasa` com testes; reexecutar `processar` e `conferir` sem paradas.
- [x] Publicar `feature/issue-20` (base `origin/main` em `fcf15b9f7c8be4b611a13a75d82dc387171d0977` conferida) e abrir a PR #25 com `Closes #20`.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Precondições | Issue #20 `OPEN`; PR #19 `MERGED`; issues #21–#24 abertas; nenhuma branch `feature/issue-20` remota antes da criação. |
| Execução real | `processar`: 3.595.334 linhas lidas, 143.014 de AQUA_M-T, 10.640 registros em MT, 0 inválidas, 0 ambíguas, 0 bordas, envelope 0 (diário e mensal em formação coincidem), 93 divergências de município INPE; saída com código 3 pela parada H3. Reexecução com a regra decidida: situação `Pronto`, sem paradas; disponibilidade 0 lacuna conhecida, 11.218 indeterminados e 40.612 sem evidência de lacuna; focos inalterados. `conferir`: aprovado nas duas execuções (estado e município × mês sem diferença; Colniza 516/246/62). Tempos e memória no relatório. |
| Testes | Node.js `v24.15.0`. `npm run test:prototipo`: 32 passaram; `npm run test:prova-dados`: 57 passaram; `node --test scripts/validate-governance.test.mjs`: 55 passaram. |
| Validador | `node scripts/validate-governance.mjs`: zero erros e zero avisos; nove itens manuais. |
| `git diff --check` | Passou. |
| Publicação | Commits `7468e42` e `aa26044` publicados; PR [#25](https://github.com/EuThiagoAndrade/rastro-quente/pull/25) aberta de `feature/issue-20` para `main`. Este registro documental vai em commit posterior da mesma PR. |
| Checks remotos | Workflow `Governance` disparado pela PR; o resultado do último commit é verificável na PR, sem presumir aprovação. |

## Revisão da correção

Não se aplica.

## Decisões humanas de G1

Parada H3 apresentada em 2026-11-07 com os números da seção 6 do relatório (H1: 51.830 indeterminados; H2: 426/51.404; outra regra: 11.218/40.612) e as alternativas (a)/(b) para os avisos sem área. Manifestação literal do responsável, em 2026-11-07, posterior à apresentação:

> "Adote a outra regra sugerida para H3 e mantenho os três avisos sem área como incidência indeterminada (opção a)."

- **H3:** regra `H2_interrupcoes_nasa`. Dia sem aviso incidente fica `sem_evidencia_de_lacuna`, com motivo `historico_nao_verificado`. Os 79 dias com interrupção MODIS/Aqua na tabela da NASA ficam `incidencia_indeterminada` em todos os municípios, com motivo `interrupcao_aqua_nasa`, nunca lacuna conhecida.
- **Avisos de 2026-07-10, 2026-07-22 e 2026-08-12:** mantidos como `incidencia_indeterminada` nos 142 municípios (opção a), sem validação por imagem.
- Registro executável em `scripts/prototipo/avisos.json` (`decisaoH3` e `validacaoHumana`). A decisão vale para esta janela e fontes; carga hospedada continua dependendo dos itens 2 a 5 e de autorizações próprias.

## Decisões incidentais e desvios

- **Registro da criação das issues:** as issues #20–#24 existem no GitHub desde 2026-11-07 (19:49–19:50Z), mas `main` não trazia o registro local. A reconciliação no plano e em `cycles.md` usa os fatos do GitHub. O responsável declarou em 2026-11-07: "Eu autorizei a criação das issues no Github, ou seja, confirmei os textos das issues #21 a #24 antes de elas serem criadas".
- **Fonte adicional do histórico:** a tabela de interrupções MODIS/Aqua da NASA foi incluída como fonte consultada do alcance do histórico (H3), só para relatar e nunca para criar lacuna. Atende o critério "fontes consultadas e por que foram consideradas suficientes ou não"; não muda a regra D1.
- **Alcance `parcial` na janela inteira:** a página de avisos do INPE não declara ser exaustiva e 76 dias com interrupção da NASA não têm aviso do INPE. Nenhum dia pôde ser demonstrado como verificado. Com a decisão registrada, o processamento não para mais, mas o alcance continua `parcial` em cada linha.
- **Parada H3 antes da PR:** o primeiro commit (`7468e42`) ficou só local até a decisão; nenhuma publicação ocorreu antes dela.
- **Envelope vazio:** é resultado medido, não presumido. Os dois arquivos oficiais que cobrem o intervalo foram lidos e coincidem, e a distribuição horária (17h–20h GMT) explica a diferença Cuiabá − GMT nula.
- **Reprocessamento do INPE:** os mensais de 2026-01 a 2026-06 têm `Last-Modified` de julho/2026. O critério da janela aceita reprocessamento posterior ao fim do mês. Futuras execuções detectam mudança por SHA-256 e param.
- **Representação de exibição:** as malhas oficiais intermediária e mínima foram medidas como candidatas; a escolha fica para os itens 3 e 4, conforme o plano.
- **SHA da base:** o primeiro commit registrou um SHA completo incorreto para `fcf15b9`; corrigido para `fcf15b9f7c8be4b611a13a75d82dc387171d0977` neste registro, conferido por `git rev-parse origin/main`.
- **Fixture:** um teste tinha uma expectativa digitada errada (10 em vez de 9 colunas na linha `v04`); corrigida a expectativa, não o código, após recontagem manual.
- **CI:** acrescentado o passo `Test prototype pipeline (fixtures)`; não usa rede, `local/` ou segredo.

## Encerramento

Não se aplica. Primeira issue de ciclo completo.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 003 (completo)
Quem: Responsável
Conferir: Checks e diff da PR https://github.com/EuThiagoAndrade/rastro-quente/pull/25
Diga: "aprovo o merge da PR #25"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-20/item-1 + fcf15b9f7c8be4b611a13a75d82dc387171d0977`
- `effect_class`: `remote_mutation`
- `state_before`: plano v4 `Aprovado` e integrado; ciclo `003` em `Planejamento`; issues #20–#24 abertas sem registro local; sem task, branch ou código do item 1.
- `state_after`: plano `Em Execução`, ciclo `Em execução`; parada H3 apresentada antes de publicar e decidida pelo responsável; regra aplicada e janela reexecutada sem paradas; branch `feature/issue-20` publicada e PR #25 aberta; task `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorizações e decisões literais registradas; 22 fontes com SHA-256 em `scripts/prototipo/fontes.json`; execução e conferência independente aprovadas; Colniza 516/246/62; 144 testes passaram nas três suítes; validador sem erros ou avisos; `git diff --check` limpo; varredura G3 sem e-mail, UUID ou segredo; PR #25 real com `Closes #20`.
- `blockers`: nenhum para a entrega publicada. A integração exige checks verdes no último commit e "aprovo o merge da PR #25". A issue #21 depende da integração do item 1 e de autorização própria.

## Referência do bootstrap

Não se aplica ao ciclo 003; nenhuma exceção do ciclo 000 foi utilizada.
