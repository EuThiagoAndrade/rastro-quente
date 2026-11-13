# Task — Issue #49: Fontes de áreas protegidas e pertencimento na carga local

> **Ciclo:** `006`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#49`
> **Plano:** `_project/drafts/006_areas_protegidas_reais/006_plan.md`
> **Branch:** `feature/issue-49`
> **PR:** [#53](https://github.com/EuThiagoAndrade/rastro-quente/pull/53)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #49" em 2026-11-12
> **Modo contínuo:** `—`
> **Início:** 2026-11-12
> **Última atualização:** 2026-11-13
> **handoff_schema_version:** `2`

## Objetivo

Implementar a obtenção e o processamento local das fontes de áreas protegidas e conferir o pertencimento conforme o item 1 do plano aprovado.

## Escopo autorizado

Issue #49 e T15 a T20, casos AP-1 a AP-23, conferência independente, medição, relatório e KB-006. Sem migração, interface ou dependência nova.

## Origem no backlog

BL-002, snapshot e parcela conforme plano 006, referenciado a `_project/backlog.md` no commit `83e3a58`, integrado em main; destino em preparação.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Casos de referência e conferência independente exigidos pelo plano. |
| G2 — autenticação, autorização e isolamento por RLS | Não | A entrega não altera banco nem acesso. |
| G3 — privacidade de dados | Sim | Dados reais locais; fixtures fictícias e relatório agregado. |
| G4 — migrações só acrescentam | Não | Nenhuma migração nesta entrega. |

## Execução

- [x] Implementar fontes, leitura, classificação e saídas.
- [x] Executar AP-1 a AP-25 e conferência independente em duas etapas.
- [x] Medir volume e registrar relatório e KB-006.
- [x] Concluir gates locais e publicar PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | Protótipo: 67 testes passaram; conferência: 5 testes passaram; RLS: 173 pgTAP e 35 testes Node passaram; E2E: 68 passaram após ajuste de espera autorizado. Duas execuções anteriores falharam no logout. |
| Validador | Passou: 0 erros e 0 avisos; itens manuais pendentes. |
| `git diff --check` | Passou; avisos Git de conversão de fim de linha. |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

Em 2026-11-12, a requisição WFS nacional `Funai:tis_poligonais`, sem filtro de UF e com o cliente `rastro-quente-carga`, retornou HTTP 403. O responsável informou ter baixado `tis_poligonais.zip` do visualizador oficial. Conferência preliminar local: ZIP íntegro, 22.114.198 bytes, SHA-256 `79d55baf99309a70fa70dd62e174d2832c0292118633cf159857d0afcb74a350`, 665 registros DBF e membros declarados presentes. A origem, o conteúdo integral e T16/T17 ainda precisam ser validados antes da promoção; o arquivo permanece em Downloads. Nenhum retrato foi promovido. T15 e o critério de aceite exigem parada diante de 403. O responsável forneceu o arquivo baixado e solicitou prosseguir; a implementação foi retomada sem promover o retrato.

Em 2026-11-12, o leitor em desenvolvimento percorreu os 665 registros FUNAI; a validação T17 ainda está pendente. No CNUC, o ZIP íntegro coincide com SHA-256 aprovado `97d754c1e01881d5f94e2f9e465fa95fe37b58c24a3df46989c7b30a9bb93fc6`, mas um dos 3.122 registros contém UTF-8 inválido no campo `outro_ato`. Uma conferência independente do DBF confirmou uma ocorrência, somente nesse campo. Esse atributo não consta entre os que T17 guarda, mas T16 exige decodificação UTF-8 estrita e parada. O responsável determinou excluir `outro_ato`, alterar formalmente o plano para validar estritamente os campos necessários e incluir a alteração na PR desta issue, sem nova PR documental. A v4 recebeu parecer APTO COM RESSALVAS e aprovação humana posterior em 2026-11-12; a ressalva R4-1 foi incorporada.

Em 2026-11-12, após aprovação da v4, a leitura dos campos necessários passou e o leitor identificou um registro SHP de tipo 0 (Null Shape) no CNUC; inspeção independente contou 3.121 polígonos e uma geometria nula. O registro nulo é RPPN, classe excluída por T17. T16, porém, admite somente Polygon e manda parar diante de geometria fora do previsto. O cálculo de orientação original também sofreu cancelamento numérico em anéis muito pequenos; a fórmula equivalente com origem transladada foi testada. O responsável aceitou essa proposta e solicitou continuidade; a v5 com AP-24 e AP-25 foi aprovada após a autorrevisão em 2026-11-12. A regra foi implementada em caráter parcial e coberta pelos testes AP-24/AP-25.

Em 2026-11-12, após aprovação da v5, a leitura e a classificação preliminares chegaram a 3.122 registros CNUC e 665 FUNAI. Uma medição local provisória sobre 10.640 detecções resultou em 154 áreas e 2.831 vínculos, sem conferência independente; não são resultados aceitos. Ao conferir o contorno de exibição a 5 casas, um buraco triangular de uma UC de proteção integral guardada fica colinear (área zero). Uma segunda leitura independente sobre o SHP confirmou o colapso a 5 casas e área não nula a 6 casas; a validade topológica completa a 6 casas ainda não foi demonstrada. T20 exige parada se o contorno real a 5 casas for inválido; nada foi promovido. O responsável aceitou a proposta e pediu continuidade. A decisão posterior à v5 foi registrada no plano; ela autoriza a execução do desvio e não é apresentada como aprovação pós-revisão. A classificação continua usando polígonos integrais; a validade e o volume da geometria de exibição precisam ser comprovados.

Após a decisão de tentar seis casas, a validação preliminar do contorno de 154 áreas retidas passou em 147 a cinco casas e em quatro a seis; três áreas de proteção integral continuaram inválidas. Uma segunda conferência independente, com coordenadas arredondadas convertidas a inteiros e teste de interseção separado, confirmou interseção entre anéis em duas e autointerseção em uma. Testes diagnósticos com mais casas mostram um caso válido a partir de oito casas; dois continuam acusando interseção mesmo a doze casas. Isso não prova a causa na fonte nem resolve a geometria. T20 e a decisão posterior exigem parada se seis casas falharem. Pergunta: diante das interseções confirmadas, o responsável prefere investigar uma correção apenas dos contornos de exibição, preservando os polígonos originais para o pertencimento, ou buscar outra fonte oficial? Nenhuma correção ou troca de fonte foi aplicada.

Em 2026-11-12, o responsável informou que não há outra fonte oficial e autorizou tentar corrigir os contornos de exibição, sem alterar os polígonos usados no pertencimento. Em diagnóstico local, os três contornos puderam ser reconstruídos: um buraco triangular recebeu recuo de 0,0000001° e foi arredondado a seis casas; os outros dois preservaram os anéis por arredondamento a oito e a catorze casas. A máxima distância observada de vértice original à fronteira final nesses casos foi respectivamente 0,0000006588403°, 0,0000000069121° e 0,000000000000008°. As três geometrias foram válidas no GEOS e uma verificação separada com aritmética inteira exata não encontrou interseções ou anéis degenerados; as contagens de partes e buracos foram preservadas. Dos 154 contornos preliminares, 151 passaram sem esse reparo e três com ele; JSON dos contornos reais soma 7.870.629 bytes, que não é estimativa completa do banco nem da visão geral. O reparo está em módulo experimental ainda não ligado à carga; a simplificação, medição completa e conferência independente do pertencimento continuam pendentes. Shapely/GEOS foram usados apenas como ferramenta isolada em `local/diagnostico-geos`, não como dependência da aplicação. O processamento usa a geometria original para pertencimento.

Em 2026-11-12, um protótipo local de Douglas-Peucker e validação após arredondamento produziu visões gerais para 153 das 154 áreas preliminares. A soma dos JSON das geometrias dessas 153 áreas, sem atributos ou envelope HTTP, foi 647.542 bytes, acima do teto aprovado de 0,6 MB (600.000 bytes); uma área restante falhou por interseção entre partes da visão geral. GEOS verificou independentemente a validade das 153 geometrias produzidas. Os valores e a seleção são preliminares: o pertencimento ainda não passou pela conferência independente e o cálculo de bytes não é resposta PostgREST. Uma simulação independente de decisão, não aplicada à carga, tentou tolerância de 0,005° para a visão geral: 146 áreas passaram nessa tolerância, 7 usaram fallback da regra anterior e uma permaneceu sem resultado; as geometrias das 153 somaram 208.014 bytes antes de atributos e envelope. Não há garantia de que o resultado final caberá no teto. A classificação continuaria na geometria integral, e o contorno real sob demanda continuaria disponível. T20 e o orçamento exigem parada e decisão quando o teto é excedido. O responsável autorizou maior tolerância e continuidade após apresentação da alternativa de 0,005°; a decisão foi registrada no plano. O tratamento da área restante e a conferência independente continuam pendentes.

Em 2026-11-12, a tolerância de 0,005° foi aplicada à simulação da visão geral. Após tratamento de interseção entre partes, 154 áreas passaram no processamento local preliminar: 333.856 bytes de JSON da visão geral com atributos e 8.476.844 bytes da soma JSON das áreas com ambas as geometrias e vínculos. Não são ainda medições de resposta PostgREST, banco ou aceites finais. Na primeira etapa de conferência independente, usando anéis crus, número de voltas e células decimais exatas, a UC total reproduziu 323 detecções e 108 células, TI 2.500 e 750, união 2.819 e 855, e interseção 4 e 3. Porém proteção integral resultou em 78 detecções e 39 células (plano: 76 e 37), e detecções em mais de uma UC resultaram em 11 (plano: 9). Diagnóstico: duas detecções e duas células têm vínculos adicionais em unidade de proteção integral não rotulada MT. Com a restrição ao rótulo MT, os três números da exploração reaparecem: 76, 37 e 9. Uma segunda execução pelo método da implementação confirmou 78/39 para todos os rótulos e 76/37 para rótulo MT. O plano exige reprodução exata e parada em caso de divergência; não se deve excluir os vínculos previstos por T18. O responsável aceitou corrigir as referências sem filtro para 78/39/11, preservar 76/37/9 como referências restritas a UCs rotuladas MT e manter T18; a decisão foi registrada no plano.

Em 2026-11-12, o processamento final e `npm run conferir:areas` passaram com os insumos fixados, após reset do banco local. A visão geral com atributos mediu 333.856 bytes e a estimativa JSON de áreas, vínculos e fontes 8.478.715 bytes; a etapa 2 coincidiu nos 2.831 vínculos. Os gates de governança, protótipo, typecheck, build, interface e RLS passaram. O E2E completo falhou duas vezes no teste de logout, pois a tela é marcada como anônima antes da conclusão assíncrona de `signOut` e o teste lê o armazenamento imediatamente: 62 passaram e cinco foram pulados em cada execução. Uma cópia isolada do teste, em `local/diagnostico-logout`, substituiu a verificação imediata por `expect.poll` com a mesma condição; os 12 casos de acesso passaram. Não é o gate oficial nem prova verificação de produção. A proposta local de uma linha está em `local/diagnostico-logout/proposta.patch`; o teste versionado e a autenticação não foram alterados. Em 2026-11-13, o responsável autorizou expressamente ajustar o teste para aguardar a remoção do token, incluí-lo na mesma PR e continuar o ciclo. A alteração de uma linha foi aplicada; o gate completo será repetido. Nenhuma PR foi aberta.

Em 2026-11-13, o E2E completo passou (68 testes) com o ajuste autorizado. Após reinicialização do banco local, o processamento foi refeito com os descritores declarados; `relatorio.json` ficou `Pronto`, sem paradas, com 154 áreas e 2.831 vínculos. A visão geral estimada ficou em 333.856 bytes; a soma JSON estimada de áreas, vínculos e fontes em 8.478.783 bytes. A conferência independente foi repetida em ambas as etapas, com igualdade de vínculos e hashes antes/depois; os descritores fixados coincidem com as codificações efetivas e a divergência histórica da ideação foi documentada. A recuperação automatizada real da FUNAI permanece não demonstrada após o 403; o retrato manual foi validado e fixado pelo hash.

Em 2026-11-13, a PR #53 foi publicada com o commit `108f505292239f9d1562bf2f9ebc7388f48adb0e`. O MCP GitHub via Docker retornou 401; a publicação foi realizada pelo `gh` autenticado. Os checks remotos e a aprovação específica de merge permanecem pendentes.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 006 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #53
Diga: "aprovo o merge da PR #53"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + implementar_issue + 49 + v5@9d84efbf9c95f9e503259d46baee40fd78da939f`
- `effect_class`: `remote_mutation`
- `state_before`: implementação e conferência local concluídas, issue aberta e branch pronta para publicação.
- `state_after`: branch publicada e PR #53 aberta; integração pendente.
- `result`: `executed`
- `evidence`: PR #53 aberta via gh; commit `108f505292239f9d1562bf2f9ebc7388f48adb0e`; gates locais e conferência independente passaram.
- `blockers`: checks remotos e aprovação específica do merge pendentes; aquisição automatizada real da FUNAI não foi comprovada após HTTP 403.
