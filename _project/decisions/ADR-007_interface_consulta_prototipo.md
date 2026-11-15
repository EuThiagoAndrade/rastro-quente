---
title: "Interface estática de consulta do protótipo e carregamento da geometria"
tags:
  - arquitetura
  - interface
  - acessibilidade
author: "Claude Code (Sonnet 5.5)"
module: "src"
last_updated: "2026-11-14"
origin_cycle: "003"
---

# ADR-007: Interface estática de consulta do protótipo e carregamento da geometria

## Status

Aceito. Decisão técnica do item 4 do plano `003` v4 (aprovado em 2026-11-05), implementada na issue #23 sob a autorização literal "autorizo a implementação da issue #23" de 2026-11-07. Vigora com a integração da PR correspondente. Não institui design system nem contrato visual canônico.

**Parcialmente substituído pelo ADR-009** (ciclo `007`, itens 2 e 3): o mapa com a página corrente da tabela de registros, a lente por botão, a memória de lente única e os limites do estado só por pedido deixam de valer. Continuam valendo a pilha estática, a sessão e a consulta sob RLS, as gerações e os estados, a abertura sem geometria e a representação `intermediaria` da carga.

**Revisado pelo ADR-010** (ciclo `007`, item 5): o mapa pode ter fundo de satélite e nomes da Esri, só com chave no build e com "Sem fundo" sempre disponível; `img-src` da CSP ganha só os dois hosts de tiles.

## Contexto

O plano pede uma interface estática (Vite + TypeScript, `@supabase/supabase-js`, Leaflet estável, sem framework de interface, servidor intermediário, tiles de terceiros, fonte web ou analytics), mobile first, com tipografia legível, ação primária distinta, sessão e consulta sob RLS, estados distintos e geometria carregada por demanda. O item 3 deixou para este item a escolha da representação de exibição (`minima`, `intermediaria` ou `maxima`), com a conferência em celular.

## Decisão

**Pilha.** Vite 8.3.5, TypeScript 7.0.2 (`tsc --noEmit`), `@supabase/supabase-js` 2.118.0, Leaflet 1.9.4 (estável; a 2.0 está em alfa) e Playwright 1.64.1 (Chrome do sistema, sem baixar navegadores). Versões exatas no lockfile, todas publicadas há mais de duas semanas na data da decisão, licenças MIT (Vite, supabase-js, tipos do Leaflet), Apache-2.0 (TypeScript, Playwright) e BSD-2-Clause (Leaflet). Módulos: sessão (`sessao.ts`), consulta (`consulta.ts`), mapa (`mapa.ts`), apresentação (`apresentacao.ts`) e controlador (`app.ts`), sem biblioteca de componentes. CSS em cinco arquivos (`tokens`, `base`, `componentes`, `layout`, `mapa`) com unidades relativas.

**Sessão e acesso.** Login Google por PKCE (`signInWithOAuth`, retorno ao próprio endereço); o provedor real é do item 5. Para o Auth local há um formulário de e-mail e senha que só existe no build de teste: é uma constante de build (`VITE_AUTH_SENHA_LOCAL`) que o build de produção elimina, e só vale para URL de loopback. O controlador distingue, com uma única sondagem (`consultar_resumo` com período inválido de propósito), conta sem autorização (acesso negado), responsável sem publicação e responsável com dados. Nada de consulta vai a `localStorage`, `sessionStorage`, Cache ou IndexedDB; o `fetch` do SDK usa `cache: 'no-store'`. A sessão é do SDK.

**Descarte de respostas obsoletas.** Duas gerações: a da sessão (login, logout, expiração, negação) e a da consulta (a última vence). Sair limpa a tela antes de a rede responder; expiração, revogação e perda de acesso limpam tela, mapa, memória e cache de limites.

**Versão fixada.** A interface lê a carga vigente uma vez e envia `p_carga` em toda consulta. Se a versão for substituída, a próxima consulta recebe `carga_indisponivel`, a tela é limpa e o usuário escolhe recarregar a vigente: nunca há mistura. Resumo, registros e disponibilidade só são exibidos juntos se trazem a mesma carga e se o total dos registros iguala o total principal.

**Mapa e tabela.** O mapa mostra exatamente a página de registros da tabela (50, 100, 500 ou 1.000 por página) e declara quantos pontos mostra de quantos existem; o total nunca vem da página. Seleção por botão da tabela ou toque no ponto, com anel tracejado azul claro e indicador textual. Em tela de toque o arraste de um dedo vem desligado e é ativado por botão, para não bloquear a rolagem da página; o pinch de dois dedos funciona sempre.

**Geometria sob demanda e representação.** A abertura não baixa geometria. O município escolhido baixa só a sua (uma requisição, em cache de memória); o conjunto do estado só vem por pedido ("Mostrar limites municipais"). A representação `intermediaria` (padrão da carga do item 3) foi mantida, pela medição abaixo. Quando a malha de exibição não é `maxima`, a legenda traz a frase do plano sobre simplificação; o pertencimento das contagens continua calculado no banco com a malha integral.

**Medição em celular** (`npm run medir:interface`, carga real do item 1, Chrome 156, 390×844 com toque, Slow 4G emulada — 150 ms, 1,6 Mbit/s e 750 kbit/s —, CPU 4× mais lenta). O Supabase local não comprime: "bruta" é o tráfego real; "gzip" é estimativa (`gzip -6`) e o egress hospedado real fica para o item 5. As requisições do navegador incluem o OPTIONS de CORS de cada chamada (a API local é de outra origem): metade do número é preflight.

| Qualidade | Município de mais detecções | Município de maior geometria | Conjunto do estado (bruta / gzip estimado) | Tempo até o conjunto |
| :-- | :-- | :-- | :-- | :-- |
| `minima` | 3,9 KB, 1,46 s | 5,0 KB, 1,39 s | 237 KB / 64 KB | 1,6 s |
| `intermediaria` | 14,7 KB, 1,33 s | 22,8 KB, 1,48 s | 984 KB / 262 KB | 5,3 s |
| `maxima` | 62,9 KB, 1,67 s | 141,8 KB, 2,03 s | 5.134 KB / 1.199 KB | 25,5 s |

A abertura (sem geometria, sessão já guardada) levou de 2,1 a 2,4 s e 85 KB brutos em 20 requisições (10 de dados, 10 preflights), nas três qualidades. Os tempos de município incluem as três consultas de dados em paralelo (138 KB brutos) além da geometria.

## Consequências

### Positivas

- Navegação município a município fica entre 1,3 e 1,5 s no perfil medido, com 15 a 23 KB de geometria, sem baixar o conjunto.
- Nenhum dado territorial no bundle, nenhum serviço de terceiros, nenhuma chave privilegiada; o build de produção não traz o login por senha.
- Os estados (sem sessão, negado, expirada, sem publicação, fonte indisponível, versão substituída, zero, sensibilidade pendente) têm texto e atributo próprios e são testados.

### Trade-offs

- O conjunto do estado em `intermediaria` custa 5,3 s no perfil medido; por isso é só por pedido. Com `minima` seria 1,6 s, ao preço de contornos mais simplificados; com `maxima`, 25,5 s e até 142 KB por município, o que não serve ao celular.
- O mapa mostra só a página corrente de registros (até 1.000 pontos); vista estadual completa de todos os pontos exigiria outro contrato (agregação ou recorte), fora do escopo.
- O typecheck usa o TypeScript 7.0.2; o código não depende de recurso exclusivo dessa versão, mas nenhuma outra versão foi exercitada.
- O E2E depende do Chrome do sistema e do Supabase local; a CI do GitHub tem os dois.

## Alternativas consideradas

- **`minima` como padrão:** conjunto leve (64 KB gzip estimado), mas o ganho por município é de 10 a 18 KB e de 0 a 0,2 s, e a aparência perto de divisas piora. Pode ser reavaliada com o egress hospedado do item 5.
- **Baixar o conjunto na abertura:** 1 MB bruto e mais de 5 s em rede lenta, sem necessidade. Descartado pelo plano.
- **Tiles de terceiros, framework de interface, fonte web:** fora do escopo e do orçamento zero.
- **Cache local de consultas:** descartado, pela exigência de não persistir dados de consulta.

## Referências

- Plano `003` v4, item 4 e "Direção visual proposta".
- [ADR-005](ADR-005_banco_autorizacao_prototipo.md) (matriz e consultas) e [ADR-006](ADR-006_carga_idempotente_unica_transacao.md) (medições de geometria no banco).
- Guia da interface em `docs/runbook.md`.
