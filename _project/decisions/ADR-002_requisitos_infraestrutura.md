---
title: "Requisitos de infraestrutura"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "governança"
last_updated: "2026-10-31"
origin_cycle: "000"
---

# ADR-002: Requisitos de infraestrutura

## Status

Aceito para implantação local pela instrução humana de 2026-10-31: `autorizo a implementação local do ciclo 000`, após Rodada 3 apta da v4. A frase de aprovação separada não consta dos registros acessíveis; interpretação e divergência registradas na task.

## Contexto

Vercel, Supabase e autenticação Google foram definidos pelo responsável, sem arquitetura detalhada aprovada.

## Decisão

Registrar esses três destinos como requisitos. Não escolher framework, plano comercial, capacidade, PostGIS, pipeline de dados ou desenho de autorização neste ciclo. O package atual contém somente tooling nativo Node.js 24+. Não há serviço configurado.

## Consequências

### Positivas

Evita promover o protótipo a arquitetura ou transportar infraestrutura financeira.

### Trade-offs

Viabilidade, custos, volume, processamento e matriz de acesso exigem planejamento posterior.

## Alternativas consideradas

Scaffold imediato e cópia integral da aplicação de origem foram excluídos.

## Referências

[Clientes Supabase da origem](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/supabase/server.ts); [login Google](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/components/login-panel.tsx). Inventário documental em KB-001.
