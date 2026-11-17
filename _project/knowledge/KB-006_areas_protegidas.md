---
title: "Fontes e pertencimento de áreas protegidas"
tags:
  - método
  - G1
  - áreas protegidas
author: "Codex; modelo exato não registrado"
module: "scripts/prototipo"
last_updated: "2026-11-14"
origin_cycle: "006"
---

# KB-006: Fontes e pertencimento de áreas protegidas

## Finalidade

Registrar as fontes e o método local usados para associar detecções principais a áreas protegidas e produzir geometrias de exibição. A conferência dos retratos do ciclo 006 está em `_project/executed/006_areas_protegidas_reais/006_research_conferencia_areas.md`; o destino estável é o ciclo 006 em `_project/cycles.md`.

## Limite de autoridade

Conhecimento de referência: não autoriza alteração, não substitui o plano ou ADR nem define prioridade, gravidade, responsabilidade ou situação fundiária. Detecção e sobreposição orientam avaliação técnica; não provam incêndio, dano, autoria ou infração. A ausência de sobreposição não prova ausência de risco. As fontes são retratos datados que podem mudar por ato oficial.

## Conteúdo

### Fontes e aquisição

O CNUC 2025_08, do MMA, fornece unidades de conservação; `tis_poligonais` da FUNAI fornece terras indígenas. `scripts/prototipo/fontes.json` fixa URL, data observada, bytes, SHA-256, membros do ZIP e condições de uso. O nacional da FUNAI foi obtido manualmente pelo responsável após HTTP 403 automatizado; o hash fixa o conteúdo. Em recuperação, arquivo divergente não é promovido; restaurar a cópia de mesmo hash. Novo retrato é decisão própria. `local/` guarda brutos e saídas, fora do Git.

O leitor aceita ZIP nos métodos armazenado ou deflate, membros declarados de SHP, DBF, PRJ e descritor de codificação para diagnóstico, CRS SIRGAS 2000 geográfico e Polygon; codificação CNUC UTF-8 e FUNAI ISO-8859-1 nos campos necessários, sem confiar no `.cpg`. Dados não necessários, inclusive `outro_ato` e `etnia_nome`, não são decodificados nem guardados. Registro Null Shape só é aceito quando já excluído pela regra de classe; identidade vazia ou repetida, arquivo incompleto e atributo desconhecido levam a parada.

### Seleção e pertencimento

A seleção distingue proteção integral, uso sustentável e terra indígena. Não entram RPPN, zonas de amortecimento, UCs inativas e TIs em estudo. Polígonos de qualidade estimada ou esquemática entram com ressalva. Cada detecção principal é avaliada contra polígonos integrais de todas as UFs: interior e borda geram vínculo; múltiplas áreas geram múltiplos vínculos. O rótulo de UF não filtra o cálculo.

Depois dos vínculos, preservam-se as áreas cujo rótulo cita MT ou que contêm uma detecção desta carga. Áreas de outros estados que entram em MT sem detecção nesta carga podem faltar na camada. O resultado não é uma interseção geométrica completa com o estado.

### Exibição e conferência

O contorno real é arredondado, sem alterar a geometria do pertencimento. Visão geral tenta Douglas-Peucker em anéis fechados, primeiro 0,005°; uma geometria inválida passa às tolerâncias menores e ao contorno real, com verificação topológica e limite de desvio após arredondamento. A instrução posterior do responsável também permitiu tentar, nos contornos problemáticos, maior precisão e recuo de um buraco triangular apenas na exibição, com preservação de partes e buracos e desvio limitado. Se nenhuma alternativa for válida, há parada. A visão geral é aproximada; o contorno detalhado permanece sob demanda.

O script `npm run conferir:areas` reavalia os anéis crus por número de voltas e células decimais exatas, compara vínculos e posições da carga e decompõe a diferença entre os retratos da FUNAI. O método, hashes, resultados e limites de volume estão no relatório da issue. As tabelas com RLS e a carga são do ADR-008.

### Camada na interface

A camada é aberta só por pedido ("Mostrar áreas protegidas") e lê a visão geral pelo leitor T25 (KB-005), uma vez por sessão e carga. As três classes têm cor, traço e hachura próprios, descritos em texto na legenda, sem ordem entre elas. A legenda e o cartão de Proveniência citam fonte, retrato, data e condições de uso, e a legenda avisa que áreas de outros estados sem detecção desta carga não aparecem. Desde o ciclo `009` (issue #91), essa legenda (classes com a contagem, aviso e atribuição) fica dentro da "Legenda" do mapa, e não mais abaixo dele. O contorno real é baixado só por área: pelo botão "Ver contorno real" de uma área selecionada ou ao abrir uma célula da lente (uma requisição por área). A geometria exibida nunca define pertencimento. A medição da visão geral e do maior contorno real está na task da issue #52 e no relatório do ciclo.

## Fontes

- [Recurso CNUC 2025_08 do MMA](https://dados.mma.gov.br/dataset/44b6dc8a-dc82-4a84-8d95-1b0da7c85dac/resource/6ba9a557-87e8-4882-acb7-b3e0f0ea192d): shapefile nacional de unidades de conservação; versão `2025_08`, SHA-256 do ZIP `97d754c1e01881d5f94e2f9e465fa95fe37b58c24a3df46989c7b30a9bb93fc6`. Fonte de limites e atributos, não de conclusões sobre infração.
- [Geoprocessamento da FUNAI](https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas): origem do WFS `Funai:tis_poligonais`; retrato nacional SHA-256 `79d55baf99309a70fa70dd62e174d2832c0292118633cf159857d0afcb74a350`. O portal pede citação; a divergência com o rodapé CC BY-ND 3.0 foi aceita pelo responsável em 2026-11-12.
- [Plano do ciclo 006 no commit da PR documental](https://github.com/EuThiagoAndrade/rastro-quente/blob/9d84efbf9c95f9e503259d46baee40fd78da939f/_project/drafts/006_areas_protegidas_reais/006_plan.md): decisões iniciais; as alterações posteriores estão no plano ativo e na task da issue #49.

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-11-12 | `006` | Fontes, regras de pertencimento, apresentação, proveniência e limites locais da issue #49. |
| 2026-11-13 | `006` | Conferência dos descritores de codificação declarados nos ZIPs fixados. |
| 2026-11-14 | `006` | Item 4 (issue #52): camada na interface, legenda, atribuição e contorno real sob demanda. |
| 2026-11-17 | `009` | Issue #91: legenda, aviso e atribuição das áreas dentro da "Legenda" do mapa. |
