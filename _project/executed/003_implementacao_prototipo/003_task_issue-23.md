# Task — Issue #23: Implementar consulta territorial com interface autenticada

> **Ciclo:** `003`
> **Trilha:** `normal`
> **Estado:** `Concluída`
> **Tipo:** `feature`
> **Issue:** `#23`
> **Plano:** `_project/executed/003_implementacao_prototipo/003_plan.md`
> **Branch:** `feature/issue-23`
> **PR:** [#28](https://github.com/EuThiagoAndrade/rastro-quente/pull/28)
> **Integração:** `PR #28 integrada em main em 2026-11-08 (68f3dc2)`
> **Autorização inicial:** "autorizo a implementação da issue #23" em 2026-11-07
> **Modo contínuo:** `—`
> **Início:** 2026-11-07
> **Última atualização:** 2026-11-08
> **handoff_schema_version:** `2`

## Objetivo

Entregar o item 4 do plano `003` v4: interface estática (Vite + TypeScript, `@supabase/supabase-js`, Leaflet 1.9.4) mobile first, com login Google por PKCE (Auth local nos testes), consulta sob RLS do responsável, GMT com sensibilidade Cuiabá em campo separado, disponibilidade D1, mapa sem tiles de terceiros, tabela paginada, proveniência, estados distintos e geometria por demanda, medida em celular. Tudo local, sem serviço hospedado.

## Escopo autorizado

Issue [#23](https://github.com/EuThiagoAndrade/rastro-quente/issues/23) e item 4 do plano: `index.html`, `src/`, configuração Vite/TypeScript/Playwright, `tests/e2e/` e `tests/unit/`, `scripts/interface/`, dependências, `.env.example`, `.gitignore`, passo de CI da interface, ADR-007, guia da interface no runbook e documentação viva. Fora do escopo: Google OAuth real, deploy, contas, segredos, banco hospedado (item 5), migrações, ranking ou seleção de áreas. A autorização cobre implementação, testes e preparação/publicação da PR; não cobre merge.

## Origem no backlog

Não se aplica. Snapshot herdado do plano: demanda direta do responsável; nenhum ID do backlog selecionado.

## Elegibilidade da trilha curta

Não se aplica.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | A interface só apresenta os resultados do contrato do item 2, sem recalcular nem criar regra: dias GMT inclusivos, total principal sem envelope, sensibilidade `America/Cuiaba` em campo próprio com limites e versão, D1 com motivo, alcance e "cobertura não comprovada", pendência explícita quando a sensibilidade é incompleta. Casos independentes no E2E: fixture 100/102 (+2, envelope de 5 registros fora do principal), por município 60/57 (−3), 30/35 (+5), 10/10 (0), série somando 100, X/Y/Z e histórico ausente/parcial. Nenhuma regra ambiental. |
| G2 — autenticação, autorização e isolamento por RLS | Sim | Nenhuma migração nem política nova. A interface usa só a chave publicável e a sessão do usuário. Testes pela interface e pela API direta: AN (sem chamada de dados, 401), OA com metadados de RP (negado, 403 e tabelas vazias), RP antes do cadastro (negado) e depois (lê), revogação (próxima consulta nega e limpa), expiração (estado próprio), logout (limpa tela e sessão), resposta atrasada após logout e consultas fora de ordem. Bundle sem `service_role`, EX ou segredo. |
| G3 — privacidade de dados | Sim | Fixture com municípios inventados (`99000xx`), contas `.test` criadas e removidas pelo teste, senhas geradas na hora e não impressas; chaves locais lidas de `supabase status` em tempo de execução. A medição em celular usa a carga real só em `local/` (ignorado) e imprime agregados. Nada de dado real, UUID, e-mail ou senha em commit, log ou documento. Nenhum dado de consulta em armazenamento do navegador (testado). |
| G4 — migrações só acrescentam | Sim | Nenhuma migração criada, alterada, renomeada ou removida. |

## Execução

- [x] Confirmar issue #23 aberta, plano v4 `Em Execução`, itens 1 a 3 integrados (PRs #25, #26 e #27, `9094b03`), `main` atualizada e autorização literal.
- [x] Ler autoridades, `implementar_issue`, templates de task e PR, ADR, `governance-check`, `lessons_learned` e o contrato de consulta (migração `consultas`).
- [x] Criar `feature/issue-23` a partir de `main` (`9094b03a079ab141b3ef28fc9478456b7878f278`).
- [x] Reconciliar a task #22 como `Concluída` (PR #27 integrada, checks verdes conferidos no GitHub).
- [x] Instalar e fixar versões exatas: Vite 8.3.5, TypeScript 7.0.2, supabase-js 2.118.0, Leaflet 1.9.4, `@types/leaflet` 1.9.22, Playwright 1.64.1 (todas com mais de duas semanas; lockfile só com `registry.npmjs.org`).
- [x] Implementar módulos de sessão, consulta, mapa, apresentação e controlador; CSS modular mobile first.
- [x] Testes: lógica, contraste e bundle (`test:interface`, 39) e E2E com Chrome do sistema, Auth local e fixture fictícia (`test:e2e`, 35).
- [x] Medir primeira exibição e navegação da geometria em celular emulado com a carga real (`medir:interface`) e decidir a representação (ADR-007).
- [x] ADR-007, guia da interface no runbook, README, `.env.example`, `.gitignore` (`dist/`, `dist-e2e/`) e passo de CI.
- [x] Gates locais e inspeção de `governance-check`.
- [x] Publicar `feature/issue-23` (base `origin/main` em `9094b03a079ab141b3ef28fc9478456b7878f278` conferida), abrir a PR [#28](https://github.com/EuThiagoAndrade/rastro-quente/pull/28) com `Closes #23` e gravar o bloco "Aguardando merge".

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Testes | `npm run test:e2e` 35/35 (acesso 12, consulta 12, acessibilidade 10, versão 1); `npm run test:interface` 39/39 (31 pares de cor, 3 de lógica, 5 de bundle); `npm run test:rls` pgTAP 168 e Node 35, inalterado; `test:prototipo` 32/32; `test:governance` 55/55 |
| Typecheck e build | `npm run typecheck` sem erros; `npm run build`: JS 397 KB (110 KB gzip), CSS 24 KB, sem sourcemap; bundle de produção inspecionado pelo teste (sem `local/`, `service_role`, EX, segredo, dados, login por senha ou serviço de terceiros; JWT embutido só de papel `anon`) |
| Acessibilidade | Em 360, 390, 768 e 1440 px: sem rolagem horizontal global, base 16 px, nomes de municípios ≥ 16 px, etiquetas ≥ 14 px, texto com contraste ≥ 4,5:1 medido no navegador, alvos ≥ 44 × 44 CSS px, nada cortado. Texto a 200% (640 e 360 px) e reflow a 320 px sem perda de função. Foco visível ≥ 2 px, fluxo por teclado, mapa focável e tabela como alternativa. Ação primária por preenchimento e secundária por contorno (escala de cinza conferida por estilos e captura de trabalho) |
| Medição em celular | Chrome 156, 390 × 844 com toque, Slow 4G emulada, CPU 4× mais lenta, carga real local. Abertura sem geometria 2,1–2,4 s, 85 KB, 20 requisições (10 de dados e 10 preflights de CORS). `intermediaria`: município de mais detecções 14,7 KB em 1,33 s; de maior geometria 22,8 KB em 1,48 s; conjunto do estado 984 KB bruta (262 KB gzip estimado) em 5,3 s. `minima` 237 KB e 1,6 s; `maxima` 5.134 KB e 25,5 s. Detalhe no ADR-007 |
| Validador | `node scripts/validate-governance.mjs`: 0 erro(s), 0 aviso(s), 9 manuais |
| `git diff --check` | Limpo |
| Varredura G3 | Sem e-mail real, UUID, JWT, senha ou chave nos arquivos novos; só `@exemplo.test` e códigos `99000xx`; medições detalhadas ficam em `local/` (ignorado) |
| Checks remotos | PR #28: `Validate governance`, `Database RLS and query contract` e `Interface typecheck, build and E2E` (o passo novo de CI da interface) concluídos com sucesso no GitHub; PR integrada em 2026-11-08 |

## Revisão da correção

Não se aplica.

## Decisões incidentais e desvios

- **Versões:** TypeScript 7.0.2 (publicado em 2026-07-08) e Vite 8.3.5 em vez da 8.3.6, de 2026-11-05, por terem mais de duas semanas; supabase-js 2.118.0 em vez da 2.119.0, de 2026-11-04. Leaflet 1.9.4 é a estável (a 2.0 está em alfa). Bibliotecas do bundle em `dependencies`; ferramentas em `devDependencies`.
- **Login por senha só no build de teste:** o Auth local exige sessão real, e o plano manda o Google real para o item 5. O formulário é constante de build (`VITE_AUTH_SENHA_LOCAL`), válido só em loopback, e o build de produção o elimina (testado).
- **Erro P0002:** o PostgREST local responde HTTP 500 a `sem_publicacao` e `carga_indisponivel`. A interface classifica pela mensagem do contrato, sem migração. A sugestão de `PT404` da task #21 permanece aberta, não necessária aqui.
- **Mapa mostra a página da tabela:** até 1.000 pontos, com contagem "N de M" e aviso de visualização parcial; o total nunca vem da página. Vista com todos os pontos do estado exigiria novo contrato, fora do escopo.
- **Mapa sem posição fixa:** um primeiro desenho com o cartão do mapa colado ao rolar (`sticky`) cobriu a seção de municípios; foi removido. O E2E pegou o erro.
- **Achados do E2E corrigidos:** `[hidden]` vencido por `display: grid`; zoom do Leaflet em 30 px por ordem de CSS; foco do campo de data sem contorno; palavras longas forçando rolagem a 320 px com texto a 200%.
- **Requisições medidas** incluem o OPTIONS de CORS de cada chamada (a API local é de outra origem); a contagem de requisições úteis é a metade.
- **Não provado:** leitor de tela real, toque físico e aparelho real (a medição é emulada), Google OAuth real, egress hospedado, conformidade integral com a WCAG. O passo de CI da interface é novo e só se confirma na execução remota (Chrome do runner via `channel: 'chrome'`).
- **Pendências herdadas, não tratadas aqui:** revogação dos privilégios de `service_role` em `public`, recomendada antes do item 5; etapa de aprovação do manifesto, janela do EX e auditoria no roteiro do item 5.
- **Escopo preservado:** nenhuma migração, banco hospedado, job, fila, tile ou fonte web.

## Encerramento

Não se aplica. Quarta issue de ciclo completo.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Concluído — ciclo 003 (completo)
Quem: —
Conferir: —
Diga: —
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + implementar_issue + issue-23/item-4 + 9094b03a079ab141b3ef28fc9478456b7878f278`
- `effect_class`: `remote_mutation`
- `state_before`: plano `Em Execução`; itens 1 a 3 integrados; task #22 `Aguardando integração` sem reconciliação; issue #23 aberta, sem task, branch ou código.
- `state_after`: item 4 implementado e testado localmente; task #22 reconciliada como `Concluída`; ADR-007, guia da interface e passo de CI registrados; branch `feature/issue-23` publicada e PR #28 aberta; task `Aguardando integração`.
- `result`: `executed`
- `evidence`: autorização literal "autorizo a implementação da issue #23" em 2026-11-07; `test:e2e` 35, `test:interface` 39, `test:rls` 168 + 35, `test:prototipo` 32, governança 55; validador sem erros ou avisos; medição real em celular emulado; commit `0b8851d`; PR #28 real com `Closes #23`.
- `blockers`: nenhum para a publicação. Integração exige checks verdes e "aprovo o merge da PR #28". O item 5 não foi iniciado.
