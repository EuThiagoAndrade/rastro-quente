---
title: "Visão de produto e requisitos"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "produto"
last_updated: "2026-10-31"
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

O ciclo 000 entrega somente governança, tooling e conhecimento documental. Não existem aplicação operacional, banco, autenticação, importador ou resultado analítico verificado no destino. Materiais privados permanecem em `local/` e não são dependência do planejamento formal.

Próximas etapas técnicas precisam planejar uma prova de dados com fontes e versões identificadas, cobertura temporal/territorial, contagens e casos de referência independentes; depois validar capacidades, custos e arquitetura com evidências. A fundação técnica deverá definir ambientes, segredos, fluxo de autenticação, matriz de acesso/RLS, migrações e testes. São assuntos para triagem e autorização próprias, sem reservar demandas no backlog ou ciclos futuros.

## Fontes

- Requisitos sintetizados no plano v4 do ciclo 000, revisado por outra LLM na Rodada 3 e objeto da instrução humana local de 2026-10-31. Identificador estável: ciclo `000` em `_project/cycles.md`.
- ADR-002: requisitos de infraestrutura; ADR-003: acesso/privacidade; KB-001: inventário de componentes de origem. Fontes externas, URLs fixadas e blobs constam de KB-001.

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-10-31 | `000` | Síntese formal autossuficiente, sem leitura/cópia do brainstorm |
