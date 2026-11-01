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

Existem materiais privados em `local/`; não há remoto, política de licença ou visibilidade definidos.

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
