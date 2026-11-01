---
title: "Governança proporcional e bootstrap"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "governança"
last_updated: "2026-10-31"
origin_cycle: "000"
---

# ADR-004: Governança proporcional e bootstrap

## Status

Aceito para implantação local pela instrução humana de 2026-10-31: `autorizo a implementação local do ciclo 000`, após Rodada 3 apta da v4. A frase de aprovação separada não consta dos registros acessíveis; interpretação e divergência registradas na task.

## Contexto

O projeto precisa manter níveis leve/completo, trilha curta e revisão formal sem exigir artefatos que o próprio bootstrap criará.

## Decisão

Preservar triagem ordenada, revisão em rodadas e handoff versão 2. G1 passa a exatidão analítica/interpretação geoespacial; G2 acesso/RLS; G3 privacidade; G4 migrations aditivas. G1/G2 proíbem modo contínuo; completo sempre o proíbe. Somente o ciclo 000 usa a exceção em `_project/README.md`, sem issue ou ideação retroativa, com C1/C2 e parada antes de publicação. Outra LLM revisou este plano; isso não cria obrigação nova para toda tarefa futura.

## Consequências

### Positivas

Rigor proporcional e bootstrap auditável sem controles fictícios.

### Trade-offs

Validação estrutural não prova autenticidade da autorização, independência da revisão ou integração remota.

## Alternativas consideradas

Dispensa genérica por regex, legacyV1 e protocolo paralelo foram rejeitados.

## Referências

[Governança da origem](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/_project/README.md); [revisão da origem](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/workflows/revisar_plano.md).
