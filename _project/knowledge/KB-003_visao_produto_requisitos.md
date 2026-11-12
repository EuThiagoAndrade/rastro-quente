---
title: "Visão de produto e requisitos"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "produto"
last_updated: "2026-11-12"
origin_cycle: "000"
---

# KB-003: Visão de produto e requisitos

## Finalidade

Apresentar o propósito e os limites do Rastro Quente sem exigir leitura dos materiais privados ou do histórico de execução.

## Limite de autoridade

Requisitos de referência; não escolhe arquitetura geoespacial, fontes de dados, limiares, pesos, regras legais ou processamento. Não autoriza implementação.

## Conteúdo

O produto apoia a análise territorial de detecções de calor e a seleção explicável de áreas para avaliação técnica. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Qualquer futura seleção deverá permitir explicar método, origem/versão dos dados e limitações.

Vercel, Supabase e autenticação Google são requisitos definidos. A arquitetura e o recorte adotados para o protótipo estão na seção do ciclo 003. O mockup privado serviu de referência visual delimitada.

O ciclo 000 entregou governança, tooling e conhecimento documental. O ciclo 001 acrescentou scripts de prova de dados e um relatório de viabilidade. Materiais privados permanecem em `local/`.

O ciclo 001 fez a prova de dados de Colniza (MT), de agosto a outubro de 2026, com scripts em `scripts/prova-dados/` (Node, sem dependências; `npm run test:prova-dados`) e relatório em `_project/executed/001_prova_de_dados/001_research_viabilidade.md`. Conclusão: **viável** para o critério definido no ciclo (fontes com uso permitido, lacunas conhecidas ≤ 3 dias, contagens que concordam com uma segunda fonte em pelo menos 2 de 3 meses, casos manuais conferindo ≥ 90%). Resultado medido: 824 focos do satélite de referência `AQUA_M-T` no município (516, 246 e 62 em agosto, setembro e outubro); série VIIRS do INPE concordando com o NASA FIRMS nos 3 meses (diferença máxima 4,85%); 15 de 15 casos conferidos. Isso mostra que as fontes públicas reproduzem contagens coerentes em Colniza. Não define regra de seleção de áreas.

Fatos do ciclo 001 que as próximas etapas devem respeitar:
- **Satélite de referência e meses:** `AQUA_M-T` (MODIS, passagem da tarde) é a série principal; VIIRS e demais satélites são auxiliares. O mês é contado pelo instante GMT do registro (sensibilidade com UTC−4 registrada no relatório). Colniza fica no fuso `America/Cuiaba`, sem horário de verão no período.
- **Território:** polígono municipal do IBGE (API v4, revisão 2025); ponto na borda conta como dentro. O INPE guarda o município de cada foco pela própria base de limites, que coincidiu com o IBGE nos pontos conferidos perto da divisa, sem garantia para o resto do limite.
- **Cobertura:** um dia sem registro não prova ausência de fogo nem cobertura; detecção e disponibilidade são atributos separados. Um aviso do INPE de 2026-08-12 deixou esse dia com incidência indeterminada.
- **Segunda fonte:** NASA FIRMS (VIIRS, NRT; a versão SP termina em 2026-07-31, então o período só existe como NRT). Exige `MAP_KEY` pessoal, nunca versionada. Registros só do INPE entre 2026-10-09 e 2026-10-20 não têm causa determinada.
- **Limites da evidência:** os 15 casos foram conferidos pelo agente, a pedido do responsável, e não por pessoa, e usando a base de limites do INPE para a posição; a comparação com o FIRMS valida o processamento da série VIIRS, não a observação física. Os crescimentos mensais não apareceram nos dados (queda de agosto a outubro).
- **Dados e privacidade:** brutos, saídas e imagens ficam em `local/prova-dados/`, fora do Git. O repositório versiona só scripts, fixtures fictícias, o relatório e `casos.json` (dados públicos do INPE).

### Avaliação documental de focos e limites IBGE, sem camadas adicionais de sobreposição; duração e consumo de processamento indeterminados

O ciclo 002 avalia um protótipo de um usuário em Mato Grosso, com janela variável de até dois anos, atualização sob demanda e restrição de custo zero. As hipóteses de persistência permanecem separadas: S1 (`AQUA_M-T`), S2 (principal mais VIIRS) e S3 (todos os satélites). Nenhuma foi escolhida para a fundação.

O parecer compara processamento local com publicação de resultados mínimos, Supabase/PostGIS em lotes e funções Vercel com persistência no Supabase. Resultado: **evidência insuficiente nas três alternativas e nos 27 cenários de cada uma**, tanto na carga inicial quanto na operação comum. Volume estadual, armazenamento/índices/cópias, processamento, acesso implementado, recuperação e elegibilidade/custo completo continuam materiais e não comprovados. Só a contagem projetada de um MAU tem compatibilidade isolada e condicional; não prova login seguro ou suficiência do conjunto.

Há incompatibilidades demonstradas para rotas que exijam os CSVs nacionais mensais históricos integrais como objetos Storage Free ou como corpo de entrada de função Vercel. Elas não descartam todos os caminhos de uma alternativa. A proposta local mantém o conjunto completo localmente e uma parcela publicada ainda sem contrato; não se presume redução de volume suficiente para caber na nuvem. Camadas adicionais e seleção de áreas não foram avaliadas.

O relatório do item 3 propõe acessos permitidos/negados para anônimo, responsável autorizado, outro autenticado e executor controlado, além de cinco protocolos de provas futuras. **Nenhuma política, teste de segurança, benchmark ou prova de recuperação foi executada.** Não há arquitetura aceita nem garantia de gratuidade; Vercel, Supabase e login Google permanecem requisitos.

Próximas etapas técnicas exigem definir contrato de dados e acesso, finalidade/elegibilidade, consultas, capacidade e objetivos de operação/recuperação; provas futuras e fundação dependem de triagem, plano e autorizações próprios. O ciclo 002 foi concluído pela integração das três entregas e da PR documental de encerramento em 2026-11-05. As evidências e limites permanecem nos relatórios do ciclo em `executed/`; a conclusão não escolhe arquitetura nem autoriza provas, serviços ou mudanças ambientais. Não se reservam demandas no backlog ou ciclos futuros.

### Protótipo de consulta territorial do ciclo 003

O protótipo está publicado na Vercel Hobby, com Supabase Free e autenticação Google. A primeira versão contém 10.640 detecções `AQUA_M-T` do INPE em 142 municípios de Mato Grosso, de novembro de 2025 a outubro de 2026 em GMT. A aplicação oferece mapa, tabela paginada, filtros de período e município, proveniência e disponibilidade. A contagem principal usa dias GMT. A sensibilidade em `America/Cuiaba` aparece separadamente. A [KB-004](KB-004_metodo_recorte_focos_mt.md) descreve o método.

Uma única conta cadastrada pode consultar os dados. A verificação hospedada confirmou a consulta do responsável, o bloqueio de outra conta Google na interface e a negativa de requisições anônimas na API. O processamento e a atualização são locais, sob demanda. O [runbook](../../docs/runbook.md#11-roteiro-do-item-5--operação-hospedada-atos-do-responsável) registra os tempos, o uso observado e as etapas administrativas. Recuperação de Auth, pausa do destino e disponibilidade contínua permanecem fora do que foi verificado.

### Lentes de seleção do ciclo 004

O protótipo ganhou três lentes de seleção sobre a carga publicada, no estado inteiro e na janela da consulta:

- **concentração:** municípios com mais detecções;
- **recorrência:** células de 0,05° com detecções em 3 ou mais meses GMT;
- **persistência:** células com detecções em 3 ou mais dias GMT seguidos.

Cada destaque traz motivo, evidência, cobertura de disponibilidade e ressalvas. Uma lente indica onde olhar; não é ranking nem prova de incêndio, dano, autoria ou infração. As lentes leem os dados já publicados, sem função ou tabela nova no banco. O contrato e o método estão na [KB-005](KB-005_contrato_lentes_selecao.md).

Na carga vigente e na janela inteira, a concentração destaca 10 municípios, a recorrência 150 células e a persistência 66 sequências. Esses números foram conferidos localmente por SQL independente, e as contagens se repetiram em produção. A verificação hospedada não mediu o tempo pelo procedimento completo; o registro está no encerramento do ciclo.

### Combinação de lentes do ciclo 005

A interface permite combinar de duas a três lentes por célula de 0,05° usando interseção (`e`) ou união (`ou`). A lista paginada e o painel explicam quais critérios destacaram cada célula, com suas evidências, ressalvas e cobertura. A combinação descreve uma seleção para avaliação técnica: não é ranking nem prova de incêndio, dano, autoria ou infração.

A conferência e a medição locais estão no relatório do ciclo. Três configurações de união excederam o orçamento de 20 s no perfil medido; o responsável aceitou esse desvio local e adiou a otimização. A verificação hospedada foi dispensada por decisão do responsável no encerramento, sem resultados de produção observados; este registro não atesta o comportamento hospedado.

## Fontes

- Requisitos sintetizados no plano v4 do ciclo 000, revisado por outra LLM na Rodada 3 e objeto da instrução humana local de 2026-10-31. Identificador estável: ciclo `000` em `_project/cycles.md`.
- ADR-002: requisitos de infraestrutura; ADR-003: acesso/privacidade; KB-001: inventário de componentes de origem. Fontes externas, URLs fixadas e blobs constam de KB-001.
- Ciclo `001`: relatório `_project/executed/001_prova_de_dados/001_research_viabilidade.md` e `scripts/prova-dados/fontes.json` (URLs, datas de acesso, tamanhos e SHA-256 das fontes de focos, malha e FIRMS).
- Ciclo `002`: [cenários](../executed/002_validacao_arquitetura/002_research_cenarios.md), [capacidades e custos](../executed/002_validacao_arquitetura/002_research_capacidades_custos.md) e [parecer de arquiteturas](../executed/002_validacao_arquitetura/002_research_arquitetura.md). As três entregas foram integradas pelas PRs #15, #16 e #17 em 2026-11-05. Fontes oficiais, seções, datas e limites constam dos relatórios. São evidências documentais, sem autoridade para adotar arquitetura ou autorizar provas/serviços.

- Ciclo `003`: issue #24, runbook e ADRs 005 a 007 para banco, carga e interface. A implantação usa as entregas integradas nas PRs #25 a #29.
- Ciclo `004`: [plano](../executed/004_contrato_lentes_selecao/004_plan.md), [conferência e medição](../executed/004_contrato_lentes_selecao/004_research_conferencia_lentes.md) e [encerramento](../executed/004_contrato_lentes_selecao/004_task_closure.md). As entregas foram integradas nas PRs #36 a #38.
- Ciclo `005`: [plano](../executed/005_combinacao_criterios_selecao/005_plan.md), [conferência e medição](../executed/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md) e [encerramento](../executed/005_combinacao_criterios_selecao/005_task_closure.md). As entregas foram integradas nas PRs #44 e #45; a verificação hospedada foi dispensada pelo responsável e não gerou resultados de produção.

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-10-31 | `000` | Síntese formal autossuficiente, sem leitura/cópia do brainstorm |
| 2026-11-04 | `001` | Resultado e limites da prova de dados de Colniza (conclusão de viabilidade com ressalvas) e fatos que as próximas etapas devem respeitar |
| 2026-11-05 | `002` | Comparação documental de três alternativas para S1/S2/S3, insuficiência nos 27 cenários por alternativa, incompatibilidades de rotas específicas, proposta de acesso e provas futuras não executadas; sem arquitetura aceita; ciclo concluído pela PR própria de encerramento |
| 2026-11-10 | `003` | Recorte, funcionamento e limites verificados do protótipo hospedado |
| 2026-11-11 | `004` | Lentes de seleção (concentração, recorrência e persistência), limites e verificação hospedada parcial |
| 2026-11-12 | `005` | Combinação explicável por interseção ou união; desvio de desempenho local aceito; verificação hospedada dispensada, sem resultados de produção |
