---
title: "Governança agnóstica com adapters"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "governança"
last_updated: "2026-10-31"
origin_cycle: "000"
---

# ADR-001: Governança agnóstica com adapters

## Status

Aceito para implantação local pela instrução humana de 2026-10-31: `autorizo a implementação local do ciclo 000`, após Rodada 3 apta da v4. A frase de aprovação separada não consta dos registros acessíveis; interpretação e divergência registradas na task.

## Contexto

É necessário preservar o mecanismo intercambiável da origem sem depender de memória privada ou checkout irmão.

## Decisão

Adotar `.agent/ai_behavior.md` como autoridade comportamental; `_project/README.md` governa ciclos/situações e exceção nominal de bootstrap; `cycles.md` guarda estado. AGENTS, CLAUDE e GEMINI apenas descobrem o núcleo. Workflows e templates são consumidores; automação não é fonte normativa.

## Consequências

### Positivas

Estado e próximo passo compreensíveis por ferramentas distintas. Revisão e aprovação separadas.

### Trade-offs

Documentos e consumidores precisam permanecer sincronizados.

## Alternativas consideradas

Políticas duplicadas por ferramenta e dependência de caminhos locais foram rejeitadas.

## Referências

[Comportamento da origem](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/ai_behavior.md); [adapter da origem](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/AGENTS.md).
