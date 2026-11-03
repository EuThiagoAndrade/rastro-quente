---
title: "Acesso, privacidade e publicação"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "governança"
last_updated: "2026-10-31"
origin_cycle: "000"
---

# ADR-003: Acesso, privacidade e publicação

## Status

Aceito para implantação local pela instrução humana de 2026-10-31: `autorizo a implementação local do ciclo 000`, após Rodada 3 apta da v4. A frase de aprovação separada não consta dos registros acessíveis; interpretação e divergência registradas na task.

## Contexto

No baseline existiam materiais privados em `local/`, sem remoto, política de licença ou visibilidade definidos. A decisão de publicação posterior consta da emenda abaixo.

## Decisão

Manter `local/` ignorado por Git e Vercel. Não versionar credenciais, dados pessoais ou operacionais restritos. Não atribuir licença MIT por cópia. Definir visibilidade/licença e autorizar lote/destino antes de publicar. Dados territoriais compartilhados exigem matriz própria de acesso; não herdar isolamentos por proprietário sem análise.

## Consequências

### Positivas

Preserva materiais privados e separa execução local de publicação.

### Trade-offs

A exclusão remota na Vercel ainda não foi testada; inspeção estática é a única evidência deste ciclo.

## Alternativas consideradas

Copiar licença/visibilidade, usuários ou concessões da origem foi rejeitado.

## Referências

[Política de origem como referência estrutural](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/ai_behavior.md). Regras locais em `.agent/ai_behavior.md` e `_project/README.md`.

## Emenda — publicação privada autorizada em 2026-10-31

O responsável definiu `EuThiagoAndrade/rastro-quente` privado, autorizou sua criação vazia se necessário e adiou a licença aberta, sem arquivo LICENSE. Autorizou somente o commit raiz em main e a branch chore/cycle-000-plan até C2 `6f9e220825dade7c635bb56d87e6e9efbcec352e`, com abertura de PR. O repositório privado foi criado, os SHAs conferidos e a PR #1 aberta com checks verdes. Manifestação literal e evidências na task do bootstrap. A PR #1 foi integrada em `main` em 2026-11-01 (squash `da35eb9`).

Esta emenda é registro posterior ao lote da PR #1; não integrou aquela PR e segue na PR de encerramento do ciclo 000. Não autoriza publicação de novos commits, dados privados ou serviços externos.
