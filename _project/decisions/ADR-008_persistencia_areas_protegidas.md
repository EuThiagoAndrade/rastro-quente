---
title: "Persistência e acesso às áreas protegidas"
tags:
  - arquitetura
author: "Codex (GPT-6; modelo exato não registrado)"
module: "banco"
last_updated: "2026-11-14"
origin_cycle: "006"
---

# ADR-008: Persistência e acesso às áreas protegidas

## Status

Aceito. Implementado e integrado no ciclo 006 (PRs #54 e #56).

## Contexto

O pertencimento é calculado localmente sobre polígonos integrais. A aplicação precisa ler áreas de exibição e vínculos de detecções principais da mesma versão da carga. O resultado orienta avaliação técnica; não comprova incêndio, dano, autoria ou infração.

## Decisão

Duas tabelas filhas versionadas por carga: `areas`, com fonte e código, atributos limitados e duas geometrias de exibição; `deteccoes_areas`, com detecção, área e posição. Chaves estrangeiras exigem a mesma carga. RPPN, etnia e outros atributos não necessários ficam fora. A publicação confere o manifesto, os dois totais e a ausência de vínculos ao envelope. Totais nulos significam ausência da camada e não admitem linhas filhas. O mesmo protocolo transacional e imutável das demais filhas se aplica. A expiração remove vínculos e áreas antes das demais linhas.

| Papel | Leitura | Escrita |
| :-- | :-- | :-- |
| AN (anônimo) | Negada | Negada |
| RP (autenticado e autorizado) | Apenas cargas publicadas | Negada |
| OA (outro autenticado) | Nenhuma linha | Negada |
| EX (executor controlado) | Todas as versões necessárias à operação | Insere em preparação e remove de carga não publicada; sem update ou DDL |
| service_role | Negada | Negada |

RLS está ativo; o cadastro RP permanece privado. A leitura usa tabelas, sem RPC ou view nova. A identidade incorpora fontes, saídas, método e totais. `--sem-areas` com nova revisão permite publicar versão sem camada a partir dos mesmos insumos.

## Consequências

### Positivas

A versão associa inequivocamente vínculos, detecções e áreas, mantém proveniência e permite reconciliar reexecuções.

### Trade-offs

A geometria é armazenada em JSON e a classificação depende da carga local. A ausência de camada é distinta de ausência de sobreposição. A visibilidade depende de RLS e da lista administrativa de responsáveis.

## Alternativas consideradas

Versionar a camada separadamente abriria combinações de identidades inconsistentes. PostGIS e RPC adicionais foram excluídos pelo plano; o cálculo já ocorre localmente.

## Referências

- Plano `_project/executed/006_areas_protegidas_reais/006_plan.md`, T16 a T21 e item 2.
- [ADR-005](ADR-005_banco_autorizacao_prototipo.md), [ADR-006](ADR-006_carga_idempotente_unica_transacao.md) e [KB-006](../knowledge/KB-006_areas_protegidas.md).
- `supabase/migrations/20261113120000_areas_protegidas.sql` e `docs/runbook.md`.
