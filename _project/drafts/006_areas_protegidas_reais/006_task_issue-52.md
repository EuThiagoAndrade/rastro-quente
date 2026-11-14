# Task — Issue #52: Camada de áreas protegidas e interface da lente

> **Ciclo:** `006`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `feature`
> **Issue:** `#52`
> **Plano:** `_project/drafts/006_areas_protegidas_reais/006_plan.md`
> **Branch:** `feature/issue-52`
> **PR:** [#56](https://github.com/EuThiagoAndrade/rastro-quente/pull/56)
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #52" em 2026-11-14
> **Modo contínuo:** `—`
> **Início:** 2026-11-14
> **Última atualização:** 2026-11-14
> **handoff_schema_version:** `2`

## Objetivo

Expor ao usuário a camada de áreas protegidas (visão geral sob demanda, contorno real por área, legenda e atribuição) e a lente de sobreposição por classe (T22 a T25), com medição de volume e tempo e o roteiro de verificação em produção.

## Escopo autorizado

Item 4 do plano e issue #52: `src/app.ts`, `src/consulta.ts`, `src/mapa.ts`, `src/apresentacao.ts` (`renderProveniencia`), `src/apresentacao-lentes.ts` (estados), `src/apresentacao-areas.ts`, `index.html`, estilos existentes (só componentes novos); `tests/e2e/07-areas.spec.mjs` e `fixture.mjs`; `medir:lentes` e `medir:interface`; runbook (seção 10), KB-005 e KB-006; roteiro de verificação em produção nesta task. Sem mudar regra, parâmetro, C1, as três lentes, a combinação, migração, RPC ou view, e sem dependência nova.

A reconciliação da task da issue #51 (PR #55 integrada) segue nesta branch, em commit próprio, como reconciliação do workflow seguinte.

## Origem no backlog

BL-002, snapshot e parcela conforme o plano 006, referenciado a `_project/backlog.md` no commit `83e3a58`, integrado em main; destino em preparação.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Nenhuma regra, parâmetro ou versão de método mudou: a interface só exibe `sobreposicao-006-v1` (conferida por SQL na issue #51) e a geometria exibida nunca define pertencimento. E2E com valores escritos à mão numa carga fictícia. Textos de T23 e limitações exibidos; lista na ordem T5 com "não é ranking"; classe exigida sem padrão; checagem automática de que nenhum texto sugere ranking, gravidade, prioridade, culpa ou responsabilização. Revisão manual de textos pendente na PR. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Sem migração, política ou RPC nova; a interface lê `areas` e `deteccoes_areas` sob a sessão do usuário. Perda de acesso (revogação entre a leitura das áreas e a dos vínculos, carga vigente) termina em acesso negado, nunca versão substituída; sessão expirada e troca de versão limpam lente, camada, contornos e memória (E2E). `test:rls`: 202 pgTAP e 37 Node passaram. |
| G3 — privacidade de dados | Sim | Fixtures fictícias (áreas inventadas, e-mails `.test`). Medições com dados reais só em `local/dados-prototipo/`; esta task e a documentação trazem só agregados, sem nome de área. Nenhum dado territorial no bundle ou em armazenamento do navegador; contornos ficam só em memória. |
| G4 — migrações só acrescentam | Não | Nenhuma migração criada, alterada, renomeada ou removida. |

## Execução

- [x] Reconciliar a task da issue #51 em commit próprio.
- [x] Leitura das áreas e do contorno real em `src/consulta.ts`.
- [x] Camada, legenda e contorno real em `src/mapa.ts` e `src/apresentacao-areas.ts`.
- [x] Lente de sobreposição no seletor, com classe, lista paginada, painel e estados de T24.
- [x] Atribuição no cartão de Proveniência.
- [x] E2E `07-areas.spec.mjs` com fixture fictícia.
- [x] Medições `medir:lentes` e `medir:interface` estendidas e executadas.
- [x] Runbook (seção 10), KB-005 e KB-006.
- [x] Roteiro de verificação em produção com valores locais esperados.
- [x] Gates locais.
- [x] Decisão do responsável sobre o orçamento da terra indígena: desvio aceito.
- [x] Publicar PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `test:e2e`: 82 passaram (68 anteriores e 14 novos de `07-areas`). `test:interface`: 102. `test:rls`: 202 pgTAP e 37 Node. `test:prototipo`: 67. `test:governance`: 55. Typecheck e build passaram. |
| Medição — visão geral (`medir:interface`) | 154 áreas desenhadas; 1 requisição de `areas`, **359.581 bytes brutos** (≤ 600.000); corpo 358.816 bytes, gzip estimado 89.989; 4,8 s no perfil do ADR-007. O leitor T25 também lê os vínculos (3 requisições, 345.486 bytes), fora da medida da visão geral. |
| Medição — maior contorno real | 1 requisição, 1.044.392 bytes brutos, 5,6 s, sem teto (Q8). |
| Medição — lente (`medir:lentes -- sobreposicao`) | Proteção integral: 39 células, 10 municípios, mediana comprimida **7,1 s**, maior total bruto 5.121.566 bytes — dentro. Uso sustentável: 74 células, 12 municípios, **7,7 s**, 5.296.528 bytes — dentro. Terra indígena: 747 células, 51 municípios, **42,3 s** (40,1 / 42,3 / 44,8), 8.708.287 bytes — **fora do tempo (teto 20,0 s)**, bytes dentro. 3 execuções válidas por passagem, nenhuma inválida. |
| Medição — abertura de célula (sem teto) | Comprimida: proteção integral, célula com 2 áreas 0,3–0,4 s (2 requisições, 9.226 bytes) e de maior contorno 0,6 s (1, 47.536); uso sustentável 0,5 s (1, 29.891); terra indígena, célula com 2 áreas e maior soma 1,3 s (2, 163.653). Bruta: 0,6 a 5,7 s, até 1.063.391 bytes. |
| Validador | 0 erros e 0 avisos, com itens manuais. |
| `git diff --check` | Passou. |
| Checks remotos | Pendente na PR #56. |

A medição usou cargas locais com outras revisões (identidades `13991fa4…d7e2` nas lentes e `b4359c96…1092` na interface), com os mesmos insumos da carga conferida `d0739e4e…6813`. O conteúdo de áreas e vínculos é o mesmo (154 e 2.831), e as células por classe coincidem com a conferência da issue #51 (39, 74 e 747).

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Parada por orçamento (plano, "Orçamento", e critério de aceite da issue):** a sobreposição de terra indígena excedeu a mediana de 20,0 s. Decomposição na passagem comprimida: registros 12 requisições e 487.711 bytes; linha da carga, áreas e vínculos 5 e 22.679; disponibilidade 51 requisições (uma por município) e 129.420 bytes; 68 pré-voos. O tempo vem do número de chamadas de disponibilidade, não dos bytes. Alternativas do plano, nenhuma escolhida pelo agente:
  1. aceitar com progresso visível ("disponibilidade N de 51 municípios") e registrar o desvio, como no ciclo `005`;
  2. cobertura sob demanda: qualificar só a célula aberta no painel (a lista mostraria a cobertura como não verificada até a abertura); muda o comportamento de T24 e exige revisão;
  3. ajustar o orçamento para esta classe.

  **Decisão:** "aceito o desvio, siga para a PR", do responsável, em 2026-11-14 (alternativa 1). O código não muda: a lista e os retângulos aparecem após a leitura de registros, áreas e vínculos, e a cobertura é qualificada com o progresso "disponibilidade N de 51 municípios". O desvio é local, no perfil do ADR-007; o tempo hospedado é informado na verificação em produção.
- **Fontes do leitor na interface:** `fontesAreas` e `lerContornoReal` em `src/consulta.ts`; `scripts/lentes/fontes-areas.mjs` (item 3) não foi refatorado. `diagnosticarAusencia` passou a ser exportada, sem mudança de comportamento, para diagnosticar a linha de área ausente na leitura do contorno.
- **Camada e vínculos:** o leitor T25 lê sempre áreas e vínculos. A camada lê também os vínculos (3 requisições), que não entram na medida da visão geral, como define o plano.
- **Hachura:** as áreas ficam num painel próprio do Leaflet desenhado em SVG, porque o canvas usado pelos pontos não tem padrões. Tokens `--area-*` com teste de contraste e de paridade com o mapa.
- **Classe sem padrão:** nenhuma classe vem marcada, para não sugerir ordem; sem escolha, só o aviso "Escolha a classe de área protegida.".
- **Seleção de área:** aplicar ou limpar uma lente remove a área selecionada e os contornos exibidos; ocultar a camada mantém os contornos da célula aberta.
- **Proveniência:** o texto de escopo dizia "não há … unidades de conservação"; com a camada, passa a declará-las como contexto territorial. Cargas sem camada mantêm o texto anterior.
- **E2E de perda de acesso:** a fixture tem 58 vínculos (uma página), então a revogação ocorre entre a leitura das áreas e a dos vínculos. A revogação entre páginas de vínculos foi provada pela API local na issue #51 (1.201 vínculos, HTTP 416). Vínculos da fixture escritos à mão.
- **Medição:** `medir:lentes` aceita um argumento opcional que limita as configurações pelo prefixo do nome; só a sobreposição foi medida nesta entrega. As configurações dos ciclos `004` e `005` não mudaram.

### Roteiro de verificação em produção (após o merge e a autorização própria)

Valores locais esperados da carga `d0739e4e5e5d853e673748c13502357bc0b2e0a72c588ed88e32801f86756813`:

1. Copiar do cartão de Proveniência a identidade integral e conferir, caractere a caractere, com a acima; conferir a atribuição de CNUC e FUNAI.
2. Com "Disable cache" e o filtro `rest/v1/areas`, recarregar a página e clicar "Mostrar áreas protegidas". Esperado: 154 áreas (proteção integral 65, uso sustentável 15, terra indígena 74 na legenda); 1 requisição de `areas`; "resources" ≈ 359.581 bytes, que precisa ficar ≤ 600.000. Informar também "transferred" e o `Content-Encoding`.
3. Aplicar a lente nas três classes, na janela inteira, uma execução de cada, com a página recarregada antes. Esperado: 39, 74 e 747 células; informar o tempo exibido.
4. Abrir o contorno real de uma área à escolha e uma célula com mais de uma área. Com o filtro `rest/v1/areas`, informar requisições, "resources" e "transferred" de cada abertura. Esperado: uma requisição por área; o maior contorno local mede 1.044.392 bytes brutos.

Parada em produção: identidade ausente ou divergente, número de áreas ou de células diferente, ou visão geral acima de 600.000 bytes.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 006 (completo)
Quem: Responsável
Conferir: Checks e diff da PR [#56](https://github.com/EuThiagoAndrade/rastro-quente/pull/56)
Diga: "aprovo o merge da PR #56"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + implementar_issue + 52 + 453d046`
- `effect_class`: `remote_mutation`
- `state_before`: parada por orçamento antes da PR; implementação em commits locais.
- `state_after`: desvio aceito pelo responsável ("aceito o desvio, siga para a PR", 2026-11-14); branch `feature/issue-52` publicada e PR #56 aberta, aguardando checks e aprovação do merge.
- `result`: `executed`
- `evidence`: PR #56; gates e medições acima; `local/dados-prototipo/medicao-lentes.json` e `medicao-interface.json` (fora do Git).
- `blockers`: checks remotos e aprovação específica do merge.

### Registro anterior — parada por orçamento

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 006 + implementar_issue + 52 + 453d046`
- `effect_class`: `local_mutation`
- `state_after`: implementação em commits locais; parada antes da PR pela mediana da terra indígena (42,3 s > 20,0 s).
- `result`: `executed`
- `blockers`: decisão do responsável, depois concedida.
