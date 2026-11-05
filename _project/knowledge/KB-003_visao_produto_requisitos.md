---
title: "Visão de produto e requisitos"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "produto"
last_updated: "2026-11-05"
origin_cycle: "000"
---

# KB-003: Visão de produto e requisitos

## Finalidade

Apresentar o propósito e os limites do Rastro Quente sem exigir leitura dos materiais privados ou do histórico de execução.

## Limite de autoridade

Requisitos de referência; não escolhe arquitetura geoespacial, fontes de dados, limiares, pesos, regras legais ou processamento. Não autoriza implementação.

## Conteúdo

O produto apoia a análise territorial de detecções de calor e a seleção explicável de áreas para avaliação técnica. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Qualquer futura seleção deverá permitir explicar método, origem/versão dos dados e limitações.

Vercel, Supabase e autenticação Google são requisitos definidos. Framework, planos/custos, usuários e papéis, processamento geoespacial, PostGIS, fontes, capacidade e volumes permanecem abertos. O mockup privado não é baseline de arquitetura, aplicação ou design system.

O ciclo 000 entregou somente governança, tooling e conhecimento documental. Ainda não existem aplicação operacional, banco, autenticação ou importador; o ciclo 001 acrescentou apenas scripts de prova de dados e um relatório de viabilidade. Materiais privados permanecem em `local/` e não são dependência do planejamento formal.

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

Próximas etapas técnicas exigem definir contrato de dados e acesso, finalidade/elegibilidade, consultas, capacidade e objetivos de operação/recuperação; provas futuras e fundação dependem de triagem, plano e autorizações próprios. O ciclo 002 permanece em execução até integrar as entregas e o encerramento documental separado. Não se reservam demandas no backlog ou ciclos futuros.

## Fontes

- Requisitos sintetizados no plano v4 do ciclo 000, revisado por outra LLM na Rodada 3 e objeto da instrução humana local de 2026-10-31. Identificador estável: ciclo `000` em `_project/cycles.md`.
- ADR-002: requisitos de infraestrutura; ADR-003: acesso/privacidade; KB-001: inventário de componentes de origem. Fontes externas, URLs fixadas e blobs constam de KB-001.
- Ciclo `001`: relatório `_project/executed/001_prova_de_dados/001_research_viabilidade.md` e `scripts/prova-dados/fontes.json` (URLs, datas de acesso, tamanhos e SHA-256 das fontes de focos, malha e FIRMS).
- Ciclo `002`: [cenários](../drafts/002_validacao_arquitetura/002_research_cenarios.md), [capacidades e custos](../drafts/002_validacao_arquitetura/002_research_capacidades_custos.md) e [parecer de arquiteturas](../drafts/002_validacao_arquitetura/002_research_arquitetura.md). Os dois primeiros estão integrados na base `2cb40044bd42edefac94cbd1d360dd8ebcd9f67d`; o parecer acompanha a entrega da issue #14. Fontes oficiais, seções, datas e limites constam dos relatórios. São evidências documentais, sem autoridade para adotar arquitetura ou autorizar provas/serviços.

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-10-31 | `000` | Síntese formal autossuficiente, sem leitura/cópia do brainstorm |
| 2026-11-04 | `001` | Resultado e limites da prova de dados de Colniza (conclusão de viabilidade com ressalvas) e fatos que as próximas etapas devem respeitar |
| 2026-11-05 | `002` | Comparação documental de três alternativas para S1/S2/S3, insuficiência nos 27 cenários por alternativa, incompatibilidades de rotas específicas, proposta de acesso e provas futuras não executadas; sem arquitetura aceita |
