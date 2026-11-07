# Task — Issue #20: Implementar recorte local e medir 12 meses de focos em MT

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Bloqueada`
> **Tipo:** `feature`
> **Issue:** `#20`
> **Plano:** `_project/drafts/003_implementacao_prototipo/003_plan.md`
> **Branch:** `feature/issue-20`
> **PR:** —
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #20" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-07
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 1 do plano `003` v4: CLI local que fixa a janela de 12 meses, obtém fontes públicas com proveniência, recorta `AQUA_M-T` em Mato Grosso pela malha municipal IBGE, produz principal e envelope, disponibilidade D1 e alcance H3, e mede a janela completa sem banco ou provedor.

## Escopo autorizado

Issue [#20](https://github.com/EuThiagoAndrade/rastro-quente/issues/20) e item 1 do plano: `scripts/prototipo/`, `tests/fixtures/prototipo/`, KB do método, relatório sanitizado de medição, script `test:prototipo` e passo de CI com fixtures. Brutos e saídas em `local/dados-prototipo/`. Fora do escopo: banco, migrações, RLS, aplicação web, deploy, carga hospedada, custos, outros satélites e ranking. A autorização cobre implementação, testes e preparação/publicação da PR; o critério H3 do plano exige parar antes de publicar enquanto o histórico de avisos for parcial.

## Origem no backlog

Não se aplica. Snapshot herdado do plano: demanda direta do responsável; nenhum ID do backlog selecionado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Contrato do plano aplicado sem nova regra: casos independentes em fixtures fictícias (29 testes), referência de Colniza 516/246/62 reproduzida com os mesmos hashes do ciclo `001`, agregação independente sem diferenças, divergências INPE × IBGE relatadas, nenhum empate resolvido pelo agente. H3 e validação dos avisos sem área aguardam decisão humana. |
| G2 — autenticação, autorização e isolamento por RLS | Não | Nenhuma tabela, papel, política, autenticação ou acesso remoto nesta unidade; dry-run sem banco. A barreira do ciclo segue aplicável aos itens 2 a 5. |
| G3 — privacidade de dados | Sim | Somente fontes públicas com condições registradas; fixtures fictícias (códigos 99000xx, UF 99); brutos, registros e ids do INPE ficam em `local/`; relatório só com contagens, tamanhos, tempos e hashes; nenhuma credencial usada. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada, alterada ou removida. |

## Execução

- [x] Confirmar issue #20 aberta, plano v4 `Aprovado` e integrado (PR #19, merge `fcf15b9`), base `main` limpa e autorização literal.
- [x] Ler autoridades, `implementar_issue`, templates de task, PR e KB, `governance-check` e `lessons_learned`.
- [x] Criar `feature/issue-20` a partir de `fcf15b9e14c3b05bbbd36eebfdf1a2fec67c3b00`.
- [x] Fixar a janela 2025-11-01 a 2026-11-01 e o envelope 2026-11-01 00h–04h Z; obter e registrar 22 fontes.
- [x] Implementar leitura validada, território, recorte, agregação, D1, alcance H3, medição e conferência independente.
- [x] Testes com fixtures fictícias e execução completa local da janela.
- [x] Relatório `003_research_medicao_recorte.md` e `KB-004_metodo_recorte_focos_mt.md`.
- [ ] Decisão humana H3 e validação dos 3 avisos sem área registradas nesta task.
- [ ] Aplicar a decisão, reexecutar `processar`/`conferir`, publicar a branch e abrir a PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Precondições | Issue #20 `OPEN`; PR #19 `MERGED`; issues #21–#24 abertas; nenhuma branch `feature/issue-20` remota antes da criação. |
| Execução real | `processar`: 3.595.334 linhas lidas, 143.014 de AQUA_M-T, 10.640 registros em MT, 0 inválidas, 0 ambíguas, 0 bordas, envelope 0 (diário e mensal em formação coincidem), 93 divergências de município INPE; saída com código 3 pela parada H3. `conferir`: aprovado (estado e município × mês sem diferença; Colniza 516/246/62). Tempos e memória no relatório. |
| Testes | Node.js `v24.15.0`. `npm run test:prototipo`: 29 passaram; `npm run test:prova-dados`: 57 passaram; `node --test scripts/validate-governance.test.mjs`: 55 passaram. |
| Validador | `node scripts/validate-governance.mjs`: zero erros e zero avisos; nove itens manuais. |
| `git diff --check` | Passou. |
| Checks remotos | Pendente; nada publicado. |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Registro da criação das issues:** as issues #20–#24 existem no GitHub desde 2026-11-07 (19:49–19:50Z), mas `main` não trazia o registro local nem a confirmação dos payloads. A reconciliação no plano e em `cycles.md` usa só fatos verificáveis no GitHub. A confirmação humana dos payloads não pôde ser conferida por este agente e fica para conferência manual.
- **Fonte adicional do histórico:** a tabela de interrupções MODIS/Aqua da NASA foi incluída como fonte consultada do alcance do histórico (H3), só para relatar e nunca para criar lacuna. Atende o critério "fontes consultadas e por que foram consideradas suficientes ou não"; não muda a regra D1.
- **Alcance `parcial` na janela inteira:** a página de avisos do INPE não declara ser exaustiva e 76 dias com interrupção da NASA não têm aviso do INPE. Nenhum dia pôde ser demonstrado como verificado.
- **Envelope vazio:** é resultado medido, não presumido. Os dois arquivos oficiais que cobrem o intervalo foram lidos e coincidem, e a distribuição horária (17h–20h GMT) explica a diferença Cuiabá − GMT nula.
- **Reprocessamento do INPE:** os mensais de 2026-01 a 2026-06 têm `Last-Modified` de julho/2026. O critério da janela aceita reprocessamento posterior ao fim do mês. Futuras execuções detectam mudança por SHA-256 e param.
- **Representação de exibição:** as malhas oficiais intermediária e mínima foram medidas como candidatas; a escolha fica para os itens 3 e 4, conforme o plano.
- **Fixture:** um teste tinha uma expectativa digitada errada (10 em vez de 9 colunas na linha `v04`); corrigida a expectativa, não o código, após recontagem manual.
- **CI:** acrescentado o passo `Test prototype pipeline (fixtures)`; não usa rede, `local/` ou segredo.

## Encerramento

Não se aplica. Primeira issue de ciclo completo.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Parado — ciclo 003 (completo)
Quem: Responsável
Conferir: A pergunta registrada: (1) regra H3 para o histórico de avisos parcial em 51.830 município-dias (H1, H2 ou a outra regra sugerida, com efeitos na seção 6 de 003_research_medicao_recorte.md); (2) avisos de 2026-07-10, 2026-07-22 e 2026-08-12 sem área: manter indeterminados nos 142 municípios ou validar proposta por imagem
Diga: sua resposta à pergunta registrada
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-20/item-1 + fcf15b9e14c3b05bbbd36eebfdf1a2fec67c3b00`
- `effect_class`: `local_mutation`
- `state_before`: plano v4 `Aprovado` e integrado; ciclo `003` em `Planejamento`; issues #20–#24 abertas sem registro local; sem task, branch ou código do item 1.
- `state_after`: plano `Em Execução`, ciclo `Em execução`; branch local `feature/issue-20` com a CLI, testes, fixtures, KB-004, relatório e esta task em commit local; task `Bloqueada`, situação `Parado` antes de publicar (H3). Nada publicado.
- `result`: `executed`
- `evidence`: autorização literal no cabeçalho; 22 fontes com SHA-256 em `scripts/prototipo/fontes.json`; execução completa e conferência independente aprovadas; Colniza 516/246/62; 141 testes passaram nas três suítes; validador sem erros ou avisos; `git diff --check` limpo.
- `blockers`: decisão humana H3 (H1, H2 ou outra regra) e decisão sobre os 3 avisos sem área. Depois dela: reexecutar, publicar a branch e abrir a PR; merge exige checks verdes e "aprovo o merge da PR #N".

## Referência do bootstrap

Não se aplica ao ciclo 003; nenhuma exceção do ciclo 000 foi utilizada.
