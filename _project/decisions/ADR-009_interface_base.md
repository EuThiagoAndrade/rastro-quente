---
title: "Interface base: leitura completa do recorte, memória de recortes, lente ao escolher e saída da tabela de registros"
tags:
  - arquitetura
  - interface
  - acessibilidade
author: "Claude Code (Opus 5.5)"
module: "src"
last_updated: "2026-11-14"
origin_cycle: "007"
---

# ADR-009: Interface base — leitura completa do recorte, memória de recortes, lente ao escolher e saída da tabela de registros

## Status

Proposto. Criado no item 2 do plano `007` v4 (aprovado em 2026-11-14), issue #61, sob a autorização literal "autorizo a implementação da issue #61" de 2026-11-14, com as decisões desse item (T6, T7, T16 e T21, ratificadas na aprovação do plano). O item 3 (issue #62) complementa este ADR com pontos e limites, marca o ADR-007 como parcialmente substituído e o aceita na sua PR. Até lá, o ADR-007 continua valendo em tudo o que este documento não revisa.

## Contexto

O ADR-007 fixou a interface do protótipo com o mapa mostrando exatamente a página corrente de uma tabela de registros (50 a 1.000 por página), a lente aplicada por botão e uma memória de lente única, para o recorte estadual. O plano `007` adota a organização da referência V13: o resultado fica numa coluna com as abas Destaques e Municípios, a explicação do destaque substitui o painel da lente, o mapa mostra todos os pontos do recorte (A4) e a tabela fixa sai (A5). Sem a tabela, os registros crus precisam de outra alternativa em texto, acessível por teclado (R3-1).

## Decisão

**Leitura completa do recorte (T7).** Todo recorte aplicado é lido por inteiro: resumo, disponibilidade do recorte e todas as páginas de registros (1.000 por página), conferidas pelo mesmo acumulador das lentes (eco de carga, período e município, total igual ao resumo, tamanho, unicidade e ordem). Lente, mapa, cartão do município e lista de focos usam essa mesma leitura quando o recorte é o mesmo. Leitura inconsistente ou incompleta mostra o estado de erro da consulta e nenhum ponto: nunca há mapa parcial. O painel fica pronto (M1) com o resumo, a série, a disponibilidade e a aba Municípios, antes dos pontos; o fim da leitura é o atributo `data-estado-pontos="completo"`. Pontos em canvas, todos na mesma camada canvas do mapa, para que o toque chegue ao ponto. Até o item 4, com município escolhido, mapa e cartão usam a leitura municipal e a lente usa a estadual (R3-2).

**Memória de recortes (T6).** As leituras completas ficam em `MemoriaRecortes` (`src/memoria.ts`), só em variáveis da página, nunca em `localStorage`, `sessionStorage`, IndexedDB ou cache HTTP. Chave: geração da sessão, carga, início, fim e município; até 3 recortes, o mais antigo sai. O resumo é sempre relido antes de qualquer reuso, e o reuso só ocorre se carga, recorte e total conferirem; essa releitura é a checagem que revela perda de acesso, sessão expirada e carga substituída. A disponibilidade por município, já validada, fica na mesma entrada. Logout, expiração, revogação, troca ou indisponibilidade de carga esvaziam a memória; respostas de gerações anteriores são descartadas antes de qualquer gravação e nunca a repõem. O acesso não muda (G2 `Não`): todo uso passa pela RPC sob RLS.

**Lente calculada ao escolher (A3, T16).** O botão "Aplicar lente" sai. Escolher a lente, a classe da sobreposição, as lentes da combinação ou o operador recalcula no recorte aplicado, com progresso, e a geração da lente descarta o cálculo anterior. Combinação com menos de 2 lentes não calcula nada e diz o que falta; nenhum resultado antigo fica visível como se fosse atual. Uma nova janela recalcula a lente depois da leitura da consulta, mesmo quando duas consultas seguem uma à outra. Configuração inicial como na V13, por decisão do responsável: sobreposição com "Proteção integral"; combinação com Concentração e Recorrência e o operador "e"; "Limpar tudo" volta a esses padrões e à aba Municípios.

**Coluna de resultado (T11, T15).** Abas **Destaques · N** e **Municípios**, no padrão de abas acessível (setas, Home e End). A tela abre em Municípios; escolher uma lente leva a Destaques. Destaques mostra o resumo da lente, a lista (células, ou municípios na concentração, com a ressalva de contagem absoluta junto do resultado), parâmetros e limitações; selecionar um item, na lista ou no mapa, abre a explicação na mesma aba — ficha, critérios (na combinação, quais lentes e o efeito do operador), motivo, evidência, disponibilidade, ressalvas, as detecções que sustentam o destaque (recolhíveis) e metadados — com "← Voltar aos destaques", que devolve a rolagem e o foco ao item. O estado da lente (com "Tentar de novo") fica acima das duas vistas. Municípios mostra a lista estadual ordenável por detecções, destaques da lente e nome (uma célula destacada conta em cada município com detecção nela; com a concentração, os destacados primeiro, na ordem do resultado) ou, com município escolhido, o cartão com focos, dias com foco, células com foco e células destacadas ("—" com "lente calculada em todo Mato Grosso" até o item 4; sem a linha na concentração).

**Saída da tabela de registros e "Lista de focos" (A5, T21).** A tabela paginada sai na mesma PR em que chegam todos os pontos. O botão "Lista de focos", no grupo de ferramentas do mapa, abre abaixo do mapa (decisão do responsável), sem cobri-lo, a lista textual dos registros principais do recorte, lida da leitura completa (sem nova consulta): dia e hora GMT, município, latitude, longitude e identificador, na ordem por dia e hora, em páginas locais de 50. Cada linha é um botão: Enter ou Espaço marca o ponto com o anel de seleção e anuncia o registro na região de status; Esc ou "Fechar" devolvem o foco ao botão. Tocar num ponto abre um balão com todos os registros daquela coordenada; o balão traz também a posição na borda, a divergência do INPE e o ID da fonte, que eram colunas da tabela.

## Consequências

### Positivas

- O mapa deixa de declarar visualização parcial: mostra o recorte inteiro, com a mesma leitura que a lente usa.
- Trocar de lente no mesmo recorte não relê páginas (só o resumo); com Todo Mato Grosso, nem a primeira lente relê.
- Os registros crus continuam alcançáveis por teclado e leitor de tela, sem lente, pela "Lista de focos".
- Cada destaque tem uma explicação única, com o caminho de volta ao mesmo ponto da lista.

### Trade-offs

- A abertura lê todas as páginas do recorte (10.640 registros na janela inteira da carga real); o painel fica pronto antes, e o orçamento M4 (T14) limita o tempo até os pontos.
- Com município escolhido, a primeira lente ainda lê as páginas do estado (até o item 4).
- A memória guarda até 3 leituras completas na página; sai com a sessão, o acesso ou a versão.
- Posição na borda, divergência do INPE e ID da fonte passam a aparecer só no balão do ponto.

## Alternativas consideradas

- **Manter a página de registros no mapa** (reserva do plano para estouro de desempenho): rejeitada enquanto T14 for cumprido; voltar a ela exigiria decisão do responsável.
- **Tabela fixa abaixo do mapa**: rejeitada em A5; a lista sob demanda (T21) é o painel opcional previsto ali.
- **Lista de focos em diálogo modal**: rejeitada pelo responsável, porque esconderia o mapa e o anel de seleção.
- **Memória em armazenamento do navegador**: rejeitada (ADR-007, G3); só variáveis da página.

## Referências

- Plano `_project/drafts/007_interface_base/007_plan.md` (v4): A3 a A5, T6, T7, T11, T14 a T16 e T21; casos CM-1, CM-2, CM-5, CM-6, PG-1 e LF-1.
- ADR-007 (interface do protótipo), revisado por este ADR nos pontos acima.
- Task `_project/drafts/007_interface_base/007_task_issue-61.md`.
- `DESIGN.md` (contrato visual).
