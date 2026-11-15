---
title: "Mapa-base de terceiros: satélite e nomes da Esri, com \"Sem fundo\" sempre disponível"
tags:
  - arquitetura
  - interface
  - privacidade
  - seguranca
author: "Claude Code (Opus 5.5)"
module: "src"
last_updated: "2026-11-15"
origin_cycle: "007"
---

# ADR-010: Mapa-base de terceiros — satélite e nomes da Esri, com "Sem fundo" sempre disponível

## Status

Aceito. Criado no item 5 do plano `007` v4 (aprovado em 2026-11-14), issue #64, sob a autorização literal "autorizo a implementação da issue #64" de 2026-11-15, com a decisão A8 e os detalhes de T12 ratificados na aprovação do plano. Vigora com a integração da PR da issue #64. Revisa o ADR-007 só no ponto "sem tiles de terceiros"; o resto do ADR-007 e o ADR-009 continuam valendo. Revisado pela issue #71 (trilha curta, decisão do responsável em 2026-11-15) no item "Falhas": a falha só dos nomes mantém a imagem.

## Contexto

O mapa do protótipo não tinha fundo (ADR-007): só limites, pontos e destaques sobre uma cor própria. A referência V13 adotada no ciclo `007` mostra um fundo de satélite com nomes, e o responsável escolheu a Esri (A8-a), com "Sem fundo" sempre disponível e CARTO (ruas) adiada. Restrições: custo zero, chave fora do repositório, CSP e política de referência restritas, e o produto não pode depender do fundo para nenhum número.

Fatos conferidos em 2026-11-14 (plano, T12 e R2-4) e de novo em 2026-11-15, na documentação oficial da Esri (ArcGIS Location Platform):

- **Imagem:** World Imagery pelo serviço de camadas de mapa-base, `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=…` (página "Service data" dos estilos de mapa-base). Tiles de 256 px; os metadados públicos do serviço equivalente listam níveis 0 a 23.
- **Nomes:** `arcgis/imagery/labels` do serviço de tiles estáticos, `https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/imagery/labels/static/tile/{z}/{y}/{x}?token=…`, PNG de 512 px, níveis 0 a 22, "um a menos" que os de 256 px.
- **Privilégios da chave:** `premium:user:staticbasemaptiles` (tiles estáticos, citado na própria página dos nomes) e, para a imagem, o privilégio de mapas-base `premium:user:basemaps` (a página de privilégios não cita `ibasemaps` pelo nome; a correspondência é conferida na ação externa e na verificação em produção).
- **Cota e cobrança:** 2 milhões de tiles por mês gratuitos, somando `basemaps-api`, `ibasemaps-api` e `static-map-tiles-api`; depois, US$ 0,15 por mil tiles **só** com pagamento por uso ligado, o que exige meio de pagamento. A página de preços não diz se o pagamento por uso vem desligado; o responsável confere e mantém desligado na conta.
- **Restrição por domínio:** a chave aceita uma lista de referenciadores permitidos, conferida pelo cabeçalho `Referer`.
- **Atribuição:** metadados públicos do World Imagery — "Esri, Vantor, Earthstar Geographics, and the GIS User Community"; página dos nomes — "Esri, TomTom, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community". A página geral de atribuição da Esri não pôde ser lida (vazia ou inexistente).
- **Leaflet 1.9.4:** a opção `referrerPolicy` do `TileLayer` vira o atributo `referrerpolicy` de cada imagem antes da URL ser definida; remover a camada troca a URL das imagens em voo por uma imagem vazia, o que cancela os pedidos pendentes.

## Decisão

**Duas camadas, só com chave.** Com `VITE_ESRI_CHAVE` no build, o mapa ganha "Satélite": imagem (256 px) e, por cima, nomes (`tileSize: 512`, `zoomOffset: -1`), no painel de tiles, abaixo de todas as camadas vetoriais. É o fundo inicial, como na V13. "Sem fundo" fica sempre disponível e remove as duas camadas; depois disso, nenhum pedido novo vai à Esri. Sem chave, "Satélite" aparece indisponível (`aria-disabled`) com o aviso "Satélite indisponível: mapa-base não configurado neste ambiente." e o padrão é "Sem fundo". O seletor fica no início da barra de ferramentas do mapa (`src/fundo.ts`, `src/mapa.ts`, `src/app.ts`).

**Zoom.** O `maxZoom` do mapa continua 14, abaixo do último nível dos dois serviços; os nomes pedem no máximo o nível 13 (512 px).

**Chave.** Pública por natureza (vai no bundle), restrita ao domínio de produção pela Esri e nunca versionada: só `VITE_ESRI_CHAVE=` vazio em `.env.example`. Cadastrar a variável na Vercel exige nova implantação da `main`, porque o Vite a embute no build. CI e E2E rodam sem chave real; o E2E usa um valor fictício num segundo build, com os dois hosts interceptados.

**Referência só com a origem.** A política global continua `Referrer-Policy: no-referrer`. As duas camadas usam `referrerPolicy: 'strict-origin-when-cross-origin'`, que envia aos hosts de tiles só a origem do site, nunca caminho ou consulta.

**CSP.** `img-src` ganha só `https://ibasemaps-api.arcgis.com` e `https://static-map-tiles-api.arcgis.com`, sem curinga. Nenhuma outra diretiva muda; os metadados do serviço não são lidos em tempo de execução (a atribuição é fixa no código), para não abrir `connect-src`.

**Falhas.** Chave rejeitada ou expirada, cota esgotada ou rede: 4 erros de tile seguidos na mesma vista, contados por camada (um tile carregado ou uma nova vista zeram a contagem). Se a imagem falha, a tela troca para "Sem fundo" e mostra "Fundo de satélite indisponível agora."; "Satélite" continua disponível para tentar de novo. Se só os nomes falham, sai apenas a camada de nomes e a imagem continua, com "Nomes sobre o satélite indisponíveis agora; a imagem continua." (revisão da issue #71). Remover as camadas nunca desliga os ouvintes internos do Leaflet (`off()`), que ele usa para soltar a camada do mapa e tirar a atribuição; eventos tardios de uma camada removida são ignorados.

**Atribuição.** Sempre visível no controle do Leaflet enquanto o fundo estiver ligado: "Powered by Esri · Imagem: Esri, Vantor, Earthstar Geographics e GIS User Community" e "Nomes: Esri, TomTom, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors e GIS User Community". Sem fundo, "sem mapa-base de terceiros".

**Privacidade (G3).** Cada tile revela à Esri a região e o nível de zoom vistos e a origem do site. Não é dado pessoal, mas indica áreas sob análise. Nenhum dado do banco, filtro, município, lente ou identidade vai nos pedidos: só `z/y/x` e a chave. Quem não quiser revelar a região usa "Sem fundo".

## Consequências

### Positivas

- O mapa ganha referência visual (imagem e nomes) sem custo e sem servidor intermediário.
- Nenhum número depende do fundo; em qualquer falha a tela volta a "Sem fundo" e continua funcionando.
- A CSP e a política de referência continuam fechadas, abertas só no necessário.

### Trade-offs

- A região vista passa a ser conhecida por um terceiro enquanto o satélite estiver ligado.
- Depende de ação externa do responsável (conta, termos, chave restrita, pagamento por uso desligado, variável e reimplantação) e de uma verificação em produção para o aceite final.
- Esgotada a cota gratuita, o fundo fica indisponível até o mês seguinte.
- A atribuição é fixa no código e precisa ser conferida se a Esri mudar os provedores.

## Alternativas consideradas

- **Sem fundo (A8-b):** situação anterior; descartada como única opção porque a V13 pede referência visual, mas permanece sempre disponível.
- **CARTO (ruas):** adiada (A8). Exigiria outros hosts na CSP e outra conta.
- **Ler a atribuição dos metadados em tempo de execução:** exigiria abrir `connect-src` para o host da Esri; descartada.
- **Serviços públicos sem chave (`server.arcgisonline.com`):** não oferecem restrição por domínio nem cota controlada pela conta; descartados.

## Referências

- Plano `_project/drafts/007_interface_base/007_plan.md` (v4): A8, T12, item 5, pontos de aprovação e verificação em produção.
- ADR-007 (interface do protótipo) e ADR-009 (interface base).
- Esri, documentação consultada em 2026-11-14 e 2026-11-15: [serviços de dados dos mapas-base](https://developers.arcgis.com/rest/basemap-styles/service-data/), [nomes sobre imagem](https://developers.arcgis.com/rest/static-basemap-tiles/arcgis-imagery-labels-tile-get/), [privilégios](https://developers.arcgis.com/documentation/security-and-authentication/reference/privileges/location-platform/), [chaves e referenciadores](https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/api-key-credentials/location-platform/), [preços](https://location.arcgis.com/pricing/), metadados públicos do World Imagery (`services.arcgisonline.com/.../World_Imagery/MapServer?f=json`).
- [Leaflet 1.9.4, `TileLayer`](https://github.com/Leaflet/Leaflet/blob/v1.9.4/src/layer/tile/TileLayer.js).
