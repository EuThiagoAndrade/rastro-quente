# Task — Issue #4: Fontes e proveniência da prova de dados

> **Ciclo:** `001`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `chore`
> **Issue:** `#4`
> **Plano:** `_project/drafts/001_prova_de_dados/001_plan.md`
> **Branch:** `chore/issue-4`
> **PR:** https://github.com/EuThiagoAndrade/rastro-quente/pull/7
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação da issue #4" em 2026-11-03
> **Modo contínuo:** `—`
> **Início:** 2026-11-03
> **Última atualização:** 2026-11-03
> **handoff_schema_version:** `2`

## Objetivo

Item 1 do plano: obter as fontes públicas da prova de dados (INPE, IBGE e, com D6 a, NASA FIRMS), registrar a proveniência de cada arquivo (URL sanitizada, data de obtenção, tamanho e SHA-256) e levantar as condições de uso, o satélite de referência, os valores de `satelite`, os avisos do período e a ausência de horário de verão.

## Escopo autorizado

Os itens da issue #4: `scripts/prova-dados/fontes.json` e `obter.mjs`, com testes; downloads para `local/prova-dados/brutos/`; levantamento registrado com links; tratamento da `MAP_KEY` sem vazamento. Não cobre merge, a issue #5 nem a #6, nova dependência, serviço pago ou mudança de regra. A autorização de implementação não cobre a ação externa do responsável (cadastro no FIRMS e gravação da `MAP_KEY`).

## Origem no backlog

Não se aplica. Herdado do plano: demanda direta do responsável, sem ID do backlog.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Fontes, versões e janelas temporais. Proveniência com SHA-256 (conferido por segundo caminho, `curl`, para os quatro arquivos do INPE e a malha do IBGE); janelas do FIRMS testadas (19 janelas, 92 dias, sem lacuna nem sobreposição); fuso testado com o caso positivo de 2018. Nenhuma contagem ou regra de seleção foi produzida. Modo contínuo `—` |
| G2 — autenticação, autorização e isolamento por RLS | Não | Sem banco, tabela ou usuário |
| G3 — privacidade de dados | Sim | Fontes públicas, sem atributos de pessoas ou imóveis; brutos só em `local/` (ignorado); nenhum CSV novo no índice; `MAP_KEY` ainda não existe e, quando existir, só em `local/prova-dados/.env`, lida em memória (teste de sanitização com chave fictícia cobre `fontes.json`, proveniência, log e erro) |
| G4 — migrações só acrescentam | Não | Nenhuma migração |

## Execução

- [x] Fontes verificadas: os quatro arquivos do INPE (três mensais e o diário de 2026-11-01) e a malha e os metadados do IBGE obtidos por `obter.mjs` em `local/prova-dados/brutos/`; tamanhos e SHA-256 em `fontes.json` (e em `local/prova-dados/proveniencia.json`, com o log).
- [x] Idempotência: segunda execução com os mesmos SHA-256 não baixou nada (6 `inalterado`); divergência local ou do servidor para e informa (testes).
- [x] Condições de uso de INPE, IBGE e FIRMS registradas com links em `fontes.json` › `levantamento`.
- [x] Satélite de referência (AQUA_M-T), valores de `satelite` por arquivo e avisos de ago a out de 2026 (um: 2026-08-12) registrados com a fonte.
- [x] Malha IBGE: versão v4, revisão 2025, qualidade máxima (ver decisões incidentais).
- [x] Ausência de horário de verão: decreto e conferência por `fuso.mjs`.
- [x] FIRMS: limite de `DAY_RANGE` (1 a 5), janelas (19 por produto, soma de 92 dias) e lógica SP ou NRT implementados e testados com resposta fictícia.
- [x] **Ação externa do responsável** ("concluí a ação externa da issue #4", 2026-11-03): `MAP_KEY` em `local/prova-dados/.env`; conferi só o formato (32 caracteres), sem imprimir a chave.
- [x] `obter.mjs` com a chave: disponibilidade consultada; a versão SP termina em 2026-07-31, então NRT nos três satélites; 57 janelas obtidas (3 × 19, 92 dias cada, nenhuma vazia); produtos, disponibilidade e janelas registrados em `fontes.json`. Segunda execução: 63 `inalterado`, nada baixado.
- [x] Nenhum arquivo de `local/` no índice; o valor da chave não aparece em `fontes.json`, em `proveniencia.json` nem em `git grep` do repositório.
- [x] PR #7 aberta (Closes #4). Faltam checks remotos e a aprovação do merge.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:prova-dados`: 16 testes, 16 aprovados, 0 falhas (Node v24.15.0); `node --test scripts/validate-governance.test.mjs`: 55 aprovados, 0 falhas |
| Validador | 0 erros, 0 avisos, 9 itens manuais |
| `git diff --check` | Sem erros; `local/` ignorado (`git check-ignore`), nenhum bruto no índice |
| Checks remotos | Pendente |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Malha IBGE v4 em vez de v3.** A verificação prévia do plano citou `v3/malhas/municipios/5103254`. A documentação da API informa que a v3 só recebeu as malhas até a revisão de 2022 e que a v4 foi atualizada com a revisão de 2025 em 2026-04-27. Usei a v4, que é a mais próxima do período. As duas têm o mesmo retângulo de Colniza (`-61.6334,-10.0495,-58.9384,-8.7966`, portanto o contrato do FIRMS não muda); a área dos metadados difere em 0,007 km² e a v4 tem mais vértices. Impacto: a lista de divergências de D2 (item 2) é calculada sobre a malha v4. Se o responsável preferir a v3, basta trocar a URL em `fontes.json` e reobter.
- **INPE sem licença explícita.** O INPE declara dados abertos de acesso livre e sem custo, mas não encontrei licença formal nem regra de citação. Classifiquei como uso permitido (U atendido), com a ressalva registrada. O responsável confirma ou manda parar.
- **FIRMS: termos a conferir.** Os termos específicos do FIRMS só são vistos no cadastro da `MAP_KEY`; a política aberta da NASA está registrada. O responsável conferiu no cadastro e não relatou restrição.
- **FIRMS só NRT.** A versão SP do FIRMS termina em 2026-07-31; o período (ago a out de 2026) só existe como NRT. Pela regra do contrato de comparação, usei NRT nos três satélites. A diferença NRT × SP e o algoritmo distinto entre distribuidores entram como causas a explicar na comparação (item 3), e o relatório deve declarar essa limitação.
- **`NPP-375` e `NPP-375D` (pergunta ao responsável antes do item 2).** Ambos são VIIRS 375 m do Suomi-NPP segundo o FAQ do INPE. Nos arquivos, são passagens distintas (15h–19h GMT e 02h–07h GMT, sem registro em comum no arquivo de agosto). Para a série V de D6 a, a leitura natural é SNPP = `NPP-375` + `NPP-375D`. Não afeta P (D1 d usa só `AQUA_M-T`). Registrado como `aConfirmarNoItem2`.
- **Comando de teste.** O plano escreve `node --test scripts/prova-dados/`; no Node 24 isso trata o diretório como arquivo. Usei o padrão `scripts/prova-dados/*.test.mjs`, exposto como `npm run test:prova-dados` (único script novo em `package.json`, como o plano prevê).
- **Scripts de apoio além de `obter.mjs`.** `fuso.mjs` (ausência de horário de verão) e `satelites.mjs` (valores de `satelite`), com testes, para que o levantamento seja reproduzível. Não contam focos de Colniza.
- **Execução com TLS desativado no ambiente.** O shell desta sessão tem `NODE_TLS_REJECT_UNAUTHORIZED=0`, que desliga a verificação de certificado do Node. Por isso conferi os SHA-256 de todos os arquivos do INPE e da malha do IBGE por `curl` (verificação ativa) e, com a variável em `1`, o Node também conectou aos dois servidores. A variável é do ambiente do responsável; não foi alterada.
- **Sem horário de verão por duas evidências.** O decreto de 2019 e a tabela de fusos do Node (`America/Cuiaba`, `GMT-04:00` em todo o período).

## Encerramento

Não se aplica.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 001 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #7 (https://github.com/EuThiagoAndrade/rastro-quente/pull/7); decisões incidentais desta task (malha IBGE v4, uso do INPE, FIRMS só NRT, NPP-375D)
Diga: "aprovo o merge da PR #7"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 001 + implementar_issue + 4 + 41f4786`
- `effect_class`: `remote_mutation`
- `state_before` / `state_after`: issue #4 aberta, plano `Aprovado`, `main` em `41f4786`, sem `local/prova-dados/` / branch `chore/issue-4` publicada, PR #7 aberta, plano `Em Execução`, ciclo `Em execução`, 63 arquivos obtidos e registrados.
- `result`: `executed`
- `evidence`: `fontes.json` com SHA-256 de 63 itens; segunda execução de `obter.mjs` com 63 `inalterado` e código 0; `npm run test:prova-dados` 16/16; governança 55/55; validador 0 erros; PR #7.
- `blockers`: `nenhum` (merge depende de checks verdes e da aprovação do responsável).
