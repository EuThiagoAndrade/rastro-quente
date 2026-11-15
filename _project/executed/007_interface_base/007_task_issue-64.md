# Task — Issue #64: Mapa-base de satélite

> **Ciclo:** `007`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#64`
> **Plano:** `_project/executed/007_interface_base/007_plan.md`
> **Branch:** `feature/issue-64`
> **PR:** [#69](https://github.com/EuThiagoAndrade/rastro-quente/pull/69)
> **Integração:** squash `17ebd04` em `main` (2026-11-15)
> **Autorização inicial:** "autorizo a implementação da issue #64" em 2026-11-15
> **Modo contínuo:** `—`
> **Início:** 2026-11-15
> **Última atualização:** 2026-11-15
> **handoff_schema_version:** `2`

## Objetivo

O mapa ganha o fundo "Satélite" (imagem e nomes da Esri) quando o build tem a chave, e "Sem fundo" continua sempre disponível. Sem chave, ou em falha dos tiles, a tela fica em "Sem fundo" com aviso. Nenhum número depende do fundo.

## Escopo autorizado

Item 5 do plano v4 e issue #64 (A8, T12):

- conferência da documentação oficial da Esri (URL da imagem e dos nomes, privilégios, cota, atribuição) e da opção `referrerPolicy` do Leaflet 1.9.4;
- fundo "Satélite" e "Sem fundo", `VITE_ESRI_CHAVE` vazia em `.env.example`, CSP `img-src` com os dois hosts, `referrerPolicy` nas camadas, troca automática para "Sem fundo" em falha, atribuição visível, `maxZoom` dentro dos dois serviços;
- ADR-010; E2E sem chave e com valor fictício e tiles interceptados; roteiro da ação externa e da verificação em produção.

Fora deste item: conta, termos, chave, cadastro da variável e reimplantação (ação externa do responsável); verificação em produção (autorização separada); CARTO. Sem migração, RPC, política, tabela ou dependência nova.

## Origem no backlog

Sem origem no backlog: o mapa-base é escopo do plano sem item de backlog (seção "Origem no backlog" do plano).

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Não | O fundo é só visual, no painel de tiles abaixo de todas as camadas; nenhuma contagem, lente, ordenação ou explicação muda. Os E2E das lentes e do centro continuam com os mesmos valores |
| G2 — autenticação, autorização e isolamento por RLS | Não | Mesmas RPCs e papéis; os tiles não passam pelo Supabase e não levam sessão |
| G3 — privacidade de dados | Sim | Chave nunca versionada (só `VITE_ESRI_CHAVE=` vazio; teste de bundle varre os arquivos versionados atrás de valor da variável ou de chave `AAPK`/`AAPT`); E2E só com valor fictício e hosts interceptados; os pedidos levam só `z/y/x`, a chave e a origem (`strict-origin-when-cross-origin`); ADR-010 registra que a Esri vê a região consultada |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Pré-condições: plano v4 `Em Execução`, issue #64 aberta, item 3 (PR #67, `604333e`) e item 4 (PR #68, `602d5d3`) integrados, autorização literal "autorizo a implementação da issue #64", base `origin/main` em `602d5d3`.
- [x] Branch `feature/issue-64`; esta task; tasks das issues #62 e #63 reconciliadas como `Concluída`.
- [x] Conferência da Esri e do Leaflet (2026-11-15): T12 se sustenta (detalhes no ADR-010).
- [x] `src/fundo.ts`, camadas em `src/mapa.ts`, seletor da V13 na barra do mapa, aviso, CSP, `.env.example`.
- [x] Unitários (`tests/unit/fundo.test.mjs`, `bundle.test.mjs`) e E2E `10-mapa-base` em dois builds (sem chave na porta 5173; valor fictício na 5174).
- [x] ADR-010, status do ADR-007, `DESIGN.md` e "Como ler esta tela".
- [x] Gates finais (sem medições, por decisão do responsável) e PR.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| `npm run typecheck` / `npm run build` | Sem erros |
| `npm run test:interface` | 186/186 (inclui `fundo.test.mjs` e o bundle com a CSP de dois hosts e a varredura de chave) |
| `npm run test:e2e` | 101/101, com `10-mapa-base` (sem chave; valor fictício com tiles simulados, erro 403, `referrerpolicy`, atribuição, interrupção ao desligar e `maxZoom` 14/13). Na primeira rodada, o aviso dentro da barra do mapa cortava o cartão em 320 px a 200% e cobria o ponto tocado em dois testes do balão; o aviso foi para baixo do mapa e o seletor passou a quebrar linha |
| `node --test scripts/validate-governance.test.mjs` / `node scripts/validate-governance.mjs` / `git diff --check` | 55/55; 0 erros; sem achados |
| Checks remotos | PR #69 com três checks verdes; integrada por squash (`17ebd04`) |
| Ação humana externa | Concluída pelo responsável em 2026-11-15 ("concluí a ação externa da issue #64") |
| Verificação em produção | Aprovada em 2026-11-15 (resultados no pós-mortem do plano) |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Sem testes de carga.** Como nas issues #61 a #63, por decisão anterior do responsável ("Você está PROBIDO DE FAZER ESSES TESTES"), nenhuma medição de desempenho foi executada. O fundo não altera leitura de dados.
- **Satélite como padrão com chave.** O plano fixa só o padrão sem chave ("Sem fundo"). Com chave, segui a V13, que abre em "Satélite" (A8 e memória do alvo visual).
- **Seletor na barra de ferramentas.** A V13 tem o grupo "Mapa-base" sozinho no alto à esquerda, lugar que hoje é da barra de ferramentas (arrastar, enquadrar, lista de focos). Os botões "Satélite" e "Sem fundo" entraram no início dessa barra, separados por uma linha, sem "Ruas" (CARTO adiada).
- **Limite de falhas: 4 erros seguidos na mesma vista.** O plano deixou o número para a issue. Um tile carregado ou uma nova vista zeram a contagem; "Satélite" continua disponível para tentar de novo.
- **Atribuição fixa no código.** A página geral de atribuição da Esri não pôde ser lida; o texto veio dos metadados públicos do World Imagery ("Esri, Vantor, Earthstar Geographics, and the GIS User Community") e da página da camada de nomes. Ler os metadados em tempo de execução exigiria abrir `connect-src`; ficou fora (ADR-010).
- **Privilégio da imagem a confirmar na ação externa.** A página de privilégios lista `premium:user:basemaps` para mapas-base e `premium:user:staticbasemaptiles` para os tiles estáticos, mas não cita `ibasemaps` pelo nome. O roteiro pede os dois privilégios e a verificação em produção confirma que a imagem carrega.
- **Violações de CSP no E2E.** O E2E falha em qualquer violação de `img-src` ou `connect-src`. As violações de `style-src` por estilo em linha do Leaflet já existiam antes desta issue e ficam fora do escopo.

## Roteiro da ação externa (responsável)

1. Criar a conta gratuita no ArcGIS Location Platform e aceitar os termos, confirmando o enquadramento do uso.
2. Conferir que o pagamento por uso está **desligado** (sem meio de pagamento).
3. Gerar uma chave de API com os privilégios `premium:user:basemaps` e `premium:user:staticbasemaptiles`, restrita ao domínio de produção como referenciador permitido.
4. Cadastrar `VITE_ESRI_CHAVE` na Vercel (Production) com esse valor, sem colá-lo em issue, PR, chat ou arquivo.
5. Mandar reimplantar a `main` (a variável só vale num build novo).
6. Dizer "concluí a ação externa da issue #64".

## Roteiro da verificação em produção (depois de "autorizo a verificação em produção do ciclo 007")

Entrar com Google; abrir o painel; com "Satélite", conferir que **imagem e nomes** chegam (pedidos aos dois hosts com status 200 e só a origem no `Referer`); trocar para "Sem fundo" e conferir que nenhum novo pedido vai aos hosts da Esri; escolher um município e uma lente; abrir uma célula; console sem violação de CSP de imagem.

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 007 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 007 + implementar_issue + 64 + 602d5d3`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #64 aberta, item 4 integrado / branch `feature/issue-64` publicada e PR #69 aberta
- `result`: `executed`
- `evidence`: PR #69; validações em "Evidências"
- `blockers`: checks remotos e aprovação do merge; depois do merge, ação externa do responsável e verificação em produção
