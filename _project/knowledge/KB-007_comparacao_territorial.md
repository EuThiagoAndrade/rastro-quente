---
title: "Comparação territorial de períodos e municípios"
tags:
  - método
  - G1
  - comparação
  - lentes
author: "Claude Code (Opus 5.5)"
module: "src/comparacao.ts"
last_updated: "2026-11-16"
origin_cycle: "008"
---

# KB-007: Comparação territorial de períodos e municípios

## Finalidade

Registra o contrato da comparação determinística (`comparacao-008-v1`) e como o módulo `src/comparacao.ts` e a aba Comparação o implementam: os dois tipos de pedido, a identidade da unidade comparada, a classificação dos destaques observados, a conclusão comparativa e as regras de zero, ausência e disponibilidade. É consultada por quem mexer na comparação, por quem for usá-la como ferramenta dos agentes (itens 2 a 4 do ciclo `008`) e por quem revisar G1.

## Limite de autoridade

Conhecimento de referência. As regras são as do plano `008` v3, aprovado em 2026-11-15: decisões D2, D5, D6, D8 e D9, detalhes T1 a T3 e T7 e casos CP-1 a CP-17 e CM-1 a CM-6, ratificados na aprovação. Esta base descreve a implementação e não as altera; mudar uma regra é nova decisão de G1, novo plano e nova versão além de `comparacao-008-v1`. A comparação não muda nenhuma lente, limiar, versão ou fórmula: cada lado é uma aplicação das lentes de produção (KB-005), com a mesma carga e configuração. Não decide pontuação, taxa, causa, previsão nem prioridade. Destaques orientam avaliação técnica; não comprovam incêndio, dano, autoria ou infração, e entrar ou sair dos destaques não indica mudança real do fenômeno.

## Conteúdo

### Módulos

| Módulo | Papel |
| :-- | :-- |
| `src/comparacao.ts` | Função pura: validação dos pedidos, identidade da configuração, unidades de cada lado, conclusão, comparação de períodos e de municípios, disponibilidade por município, leituras necessárias e contexto estadual |
| `src/apresentacao-comparacao.ts` | Aba Comparação: estados, números lado a lado, conclusão, unidades com as evidências por lado, disponibilidade, contexto estadual e alternância do mapa |
| `src/app.ts` | Leitura dos dois lados (memória T6 e conferência do carregador), aplicação da mesma lente em cada lado, qualificação com concorrência global 4 e gerações que descartam respostas obsoletas |

### Pedidos

| Tipo | A | B | Validação (recusa sem resultado comparativo) |
| :-- | :-- | :-- | :-- |
| Dois períodos | Recorte aplicado na Consulta (período e município, ou o estado) | Outro período, mesmo recorte | Datas GMT válidas, início ≤ fim, dentro da janela da carga e com o mesmo número de dias GMT inclusivos. Nada é ajustado para caber nem normalizado por dia. Janelas sobrepostas ou idênticas são admitidas: os dias em comum são listados e os lados continuam aplicações independentes, nunca somadas |
| Dois municípios | Município do recorte aplicado | Outro município (ou o mesmo, CM-5), mesmo período | Os dois válidos na carga e escolhidos explicitamente; A exige município na Consulta |

Depois do cálculo, `conferirIdentidade` exige, campo a campo, a mesma carga (id e identidade) e a mesma configuração (tipo de lente, versões, lentes e operador da combinação, classe da sobreposição e parâmetros). Na comparação de períodos, só a janela difere; na de municípios, só o município. Sem lente, só as contagens são comparadas.

### Unidade comparada

A identidade é a unidade, nunca o `id_destaque`: o código IBGE na concentração e o ID canônico da célula T1 nas lentes por célula, na combinação e na sobreposição. Duas sequências da persistência na mesma célula são dois destaques e uma unidade (CP-2); cada destaque original (motivo, detecções, datas e ressalvas) fica preservado no seu lado, sem somar ou unir dias entre períodos.

| Situação | Comparação de períodos | Comparação de municípios |
| :-- | :-- | :-- |
| Só em A | saiu dos destaques observados | destacada só no município A |
| Só em B | entrou nos destaques observados | destacada só no município B |
| Nos dois | permaneceu nos destaques observados | destacada nos dois municípios (célula de divisa, registros diferentes) |

Permanecer não significa mesma ocorrência nem mesmos valores. A célula de divisa não é somada como célula única (CM-2).

### Conclusão comparativa (T3, D9)

Os fatos de cada lado (totais, destaques, evidências) aparecem sempre. Entrada, saída, permanência e as diferenças B − A só aparecem com conclusão comparativa. A precedência é:

1. **Aplicação indisponível** num lado (recorrência com menos de 3 meses GMT tocados, combinação indisponível, carga sem camada de áreas): comparação indisponível nesta configuração, nunca "saiu" (CP-6).
2. **Lacuna total comprovada:** lado com zero detecção e lacuna conhecida em todos os dias de todos os municípios do recorte (no município, 10 de 10 dias dele; no estado, cada município da carga): comparação indisponível por lacuna (CP-11, CP-13).
3. **Falha ou cancelamento da conferência:** conclusão indisponível por falha de conferência, distinta de lacuna (CP-17).
4. **Conferência pendente:** "Conclusão aguardando disponibilidade"; nada é classificado antes do fim (CP-13, CP-17).
5. Nos demais casos, **conclusiva**.

Um lado com zero detecção dispara a conferência da disponibilidade de todos os municípios do seu recorte, sem esperar pedido. Concluída sem lacuna total, o zero observado fica com a ressalva de que não é evidência de ausência de fogo nem, sozinho, de ausência de dados; com dias de lacuna conhecida ou incidência indeterminada, também com a de que o zero não indica ausência real (CP-4, CP-11 com 9 de 10 dias).

### Disponibilidade

- **Da célula, por lado:** no lado em que a célula foi destacada, a cobertura do destaque (os municípios das suas detecções nesse lado, KB-005); no lado sem destaque, "disponibilidade da célula não avaliável". Nada é transportado do outro período (CP-10, CP-12).
- **Do recorte, por município:** uma linha por município e lado, com dias por classe (`6 de 10 dias sem evidência de lacuna, 4 com incidência indeterminada (cobertura não comprovada)`); lacuna conhecida em todos os dias marca só aquele município como indisponível, sem tornar o estado indisponível (CP-12). Nunca há "N de M" agregado da célula.
- **Leituras:** no resultado inicial, só os municípios dos destaques de cada lado e, num lado com zero, todo o recorte; no recorte municipal, sempre o próprio município. Com o estado inteiro, a lista completa dos municípios nos dois lados só é lida em "Ver a disponibilidade de todos os municípios" (CP-16). Todas as leituras de disponibilidade usam concorrência global 4 e repetem só o que ainda não foi lido. Falha fica no município e nunca vira classe.

### Meses tocados (recorrência)

Com a recorrência na configuração, os meses GMT tocados e os parciais de cada lado são mostrados. Mesma duração com quantidades diferentes de meses traz a ressalva "Mesma duração, mas quantidades diferentes de meses GMT tocados; a comparação não normaliza esse efeito" (CP-15).

### Comparação de municípios (T2)

Números de cada município pelas definições existentes de `numerosMunicipio`: total principal do resumo do recorte, dias GMT com detecção na série e células T1 distintas dos registros principais do município na janela. Diferença B − A em valor absoluto, sem taxa, índice, causa ou ranking, com as ressalvas de contagem absoluta e de célula de divisa. As lentes são calculadas em cada recorte municipal; nenhuma aplicação estadual entra no resultado municipal (CM-2).

**Contexto estadual (D8, CM-3, CM-6):** a concentração continua recusando recorte municipal e o controle comum continua desabilitado com município. A ação "Ver contexto estadual" pede explicitamente o cálculo em todo Mato Grosso, no mesmo período, e o mostra numa seção própria: a participação de A e B no resultado estadual (com N = 10 e empatados), sem recalcular o top 10 sobre o par. Com a combinação escolhida, a combinação estadual com a concentração, filtrada às células com detecções de A ou B e com a ressalva de que outros municípios também podem sustentá-las.

### Orçamento (T6, R3-1)

O resultado inicial (registros dos dois lados, cálculo e primeira apresentação) tem alvo de 20 s e teto de 120 s. A qualificação dos destaques, a lista completa sob demanda e a conferência do recorte zero contam juntas no teto de 360 s. A medição com a carga real não foi feita na issue #77, por decisão do responsável (registrada na task): o desempenho será observado em produção e trabalhado depois. Os tetos continuam sendo os do plano, ainda sem medição.

### Interface

Controles na seção "Comparar" dos filtros, resultado na aba "Comparação" e rótulo do lado mostrado sobre o mapa. Contrato visual em `DESIGN.md`, inclusive a exceção ao princípio de recorte único.

### Casos de referência

`tests/unit/comparacao.test.mjs` (CP-1 a CP-17 e CM-1 a CM-6, com a fixture fictícia `tests/fixtures/comparacao/referencia.json`) e `tests/e2e/12-comparacao.spec.mjs` (fixture do E2E). CP-18 trata da IA contextual e pertence aos itens 2 e 3 do ciclo `008`.

## Fontes

Sem fonte externa. Autoridades locais: plano `_project/executed/008_comparacao_periodos_agentes/008_plan.md` (v3), KB-004 (contagem principal e disponibilidade) e KB-005 (lentes e cobertura).

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-11-16 | `008` | Criação (issue #77) |
