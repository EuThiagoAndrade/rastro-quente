---
title: "Proveniência e componentes reaproveitáveis"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "referência"
last_updated: "2026-10-31"
origin_cycle: "000"
---

# KB-001: Proveniência e componentes reaproveitáveis

## Finalidade

Registrar a origem fixada, o inventário do ciclo 000 e componentes candidatos à fundação técnica.

## Limite de autoridade

Referência documental. Não autoriza publicação, implementação de autenticação ou arquitetura. A inspeção do código não equivale a teste no destino. Nenhum fluxo depende de outro checkout.

## Conteúdo

### Origem

Repositório: [https://github.com/EuThiagoAndrade/saldo-futuro](https://github.com/EuThiagoAndrade/saldo-futuro). Commit: `c31081d56d7ce0d0ff2f51de3db655f90db6b36b`. A cópia foi extraída por `git show` deste commit, independentemente do HEAD atual da referência. Nenhum arquivo ou histórico operacional foi copiado como estado do destino.

### Inventário da adaptação


As classificações abaixo fazem parte do escopo submetido à aprovação; não ficam a critério livre da implementação. **Adotar** mantém o papel e ajusta apenas identificação/referências; **adaptar** aplica as mudanças expressas neste plano; **adiar** significa não criar nem exigir agora; **não transportar** exclui conteúdo específico da origem. Qualquer ampliação material exige emenda, nova revisão e aprovação; correção técnica dentro deste escopo é registrada na task.

O `git ls-tree` do commit fixado contém **12 workflows**, seis templates e três skills em `.agent/`, e não 14 workflows. Todos estão classificados abaixo. O conteúdo histórico de ciclos, backlog, lições, ADRs ou KBs não é copiado como estado do destino.

| Workflow de origem | Classificação e destino no ciclo 000 |
| :-- | :-- |
| `.agent/workflows/triar.md` | Adaptar G1; manter níveis, ordem de elegibilidade e confirmação humana; referenciar a exceção nominal do bootstrap |
| `.agent/workflows/idear.md` | Adotar para ciclos futuros; não fabricar ideação 000 |
| `.agent/workflows/rascunhar_plano.md` | Adotar a redação/correção e o handoff; referenciar os campos normais e o bootstrap aprovado |
| `.agent/workflows/revisar_plano.md` | Adotar parecer no plano, papéis, vereditos, rodadas e paradas; adaptar somente referências/barreiras |
| `.agent/workflows/criar_issues.md` | Adotar para operação normal com GitHub; não executar no bootstrap |
| `.agent/workflows/implementar_issue.md` | Adaptar domínio e remeter à exceção única do ciclo 000; fora dela, issue válida continua obrigatória |
| `.agent/workflows/listar_issues.md` | Adotar, somente leitura; sem GitHub disponível, relatar impedimento sem inventar issues |
| `.agent/workflows/retomar.md` | Adaptar unicamente a observação do bootstrap antes da publicação; preservar todas as regras normais após publicação e para os demais ciclos |
| `.agent/workflows/atualizar_docs.md` | Adotar atualização na autoridade correta e encerramento prospectivo; incluir a task excepcional do bootstrap |
| `.agent/workflows/health_check.md` | Adaptar os checks ao tooling de governança e ao bootstrap; não executar testes de aplicação inexistente nem exigir consulta remota antes da publicação |
| `.agent/workflows/corrigir_trilha_curta.md` | Adotar elegibilidade e revisão; adaptar G1, preservando proibição do modo contínuo com G1/G2 |
| `.agent/workflows/gerenciar_backlog.md` | Adotar o mecanismo de origem de fila em worktree externo do **mesmo Git**, mesma trava e autorização por operação. Não criar fila nem adquirir trava neste ciclo |

**Backlog e privacidade:** preservar `local/backlog.lock/` como trava técnica efêmera, ignorada e exclusiva do operador que a criou; a governança não lê `local/brainstorm/` ou `local/prototipo/`. O worktree externo não é dependência de outro repositório. Captura/publicação seguem as precondições de main integrada e conferência remota da origem; enquanto não existirem, o backlog formal pode permanecer vazio. Não criar uma fila simplificada paralela nem usar o brainstorm como backlog implícito.

| Template/skill de origem | Classificação e destino |
| :-- | :-- |
| `.agent/templates/ideacao.md` | Adotar para ciclos futuros |
| `.agent/templates/plano_implementacao.md` | Adaptar somente domínio e referência ao bootstrap; manter campos, revisão e handoff |
| `.agent/templates/task.md` | Adaptar G1 e a referência à task excepcional do ciclo 000; manter estados e evidências |
| `.agent/templates/adr.md` | Adotar estrutura; cada decisão do destino registra origem e aceite reais |
| `.agent/templates/kb.md` | Adotar estrutura; conteúdo próprio e autossuficiente |
| `.agent/templates/backlog_item.md` | Adotar IDs, campos, estados e semântica da origem |
| `.agent/skills/governance-check/governance-check.md` | Adaptar domínio, conjunto de arquivos e exceção de bootstrap; conservar inspeção somente leitura |
| `.agent/skills/doc-updater/doc-updater.md` | Adotar atualização da menor autoridade correta e rastreabilidade |
| `.agent/skills/design-system-check/design-system-check.md` | Adiar: não há contrato visual definitivo. Remover de `requiredFiles` e dos passos obrigatórios de workflows/templates deste ciclo; planejar a retomada junto do design system |

Cada arquivo de `requiredFiles` do manifesto fixado está contemplado nas tabelas acima ou abaixo:

| Demais arquivos obrigatórios da origem | Classificação e regra no destino |
| :-- | :-- |
| `README.md` | Adaptar para produto, execução dos checks e estado real; versão mínima no commit raiz |
| `LICENSE` | Adiar: licença e visibilidade ainda não decididas; retirar de `requiredFiles` neste ciclo. Não atribuir MIT por cópia; resolver a política de publicação antes do envio remoto |
| `.gitignore` | Adaptar ao tooling e dados; preservar `/local/` ou regra equivalente comprovada, segredos, bancos locais e arquivos gerados |
| `.gitattributes` | Adotar normalização textual adequada, sem reformatação de materiais privados |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` | Adotar adapters mínimos; conferir sintaxe na execução; não copiar políticas para eles |
| `.agent/ai_behavior.md` | Adaptar contexto, privacidade e referência à exceção canônica; preservar precedência e handoff |
| `.agent/lessons_learned.md` | Adotar arquivo sem lições transplantadas; registrar apenas aprendizado comprovado do destino |
| `.agent/task.md` | Adotar ponte neutra, sem estado operacional ativo |
| `_project/README.md` | Adaptar domínio; única autoridade da exceção do ciclo 000 após L1; preservar situações e mecanismo de revisão da origem |
| `_project/cycles.md` | Adaptar índice para ciclo 000 no estado efetivo e próximo número 001, sem importar ciclos da origem |
| `_project/backlog.md` | Adotar estrutura vazia, sem bloco/handoff persistido e sem demandas presumidas |
| `_project/decisions/ADR-001_governanca_agnostica_adapters.md` | Adaptar para registrar a governança aprovada neste projeto |
| `_project/decisions/ADR-002_stack_infraestrutura.md` | Adaptar como `_project/decisions/ADR-002_requisitos_infraestrutura.md`: registrar somente os destinos Vercel/Supabase/Google já definidos e o que permanece em aberto, sem escolher framework/plano de serviço |
| `_project/decisions/ADR-003_acesso_privacidade_publicacao.md` | Adaptar para restrição de acesso, material local privado e publicação ainda pendente; não importar visibilidade, usuários ou autorização de publicação da origem |
| `_project/decisions/ADR-004_governanca_proporcional_niveis.md` | Adaptar domínio e registrar exceção transitória do bootstrap; conservar níveis e intercambiabilidade |
| `_project/knowledge/KB-001_proveniencia_ecossistema.md` | Adaptar com URL/commit e matriz de reaproveitamento aprovada |
| `_project/knowledge/KB-003_visao_produto_arquitetura.md` | Adaptar como `_project/knowledge/KB-003_visao_produto_requisitos.md`: síntese formal dos requisitos, sem copiar brainstorm, código do mockup ou afirmar arquitetura detalhada aprovada |
| `_project/knowledge/KB-004_regras_financeiras.md` | Não transportar; retirar de manifesto e referências obrigatórias. Regras analíticas ambientais serão tratadas no ciclo que as validar |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Adaptar domínio; preservar `[FEATURE]`, critérios e rastreabilidade |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Adaptar domínio; preservar `[FIX]` e elegibilidade da trilha curta |
| `.github/ISSUE_TEMPLATE/chore.yml` | Adotar `[CHORE]` e campos de contexto |
| `.github/ISSUE_TEMPLATE/config.yml` | Adotar configuração da origem, com referências do destino |
| `.github/pull_request_template.md` | Adaptar G1 e exceção do bootstrap sem issue; manter checks, G2–G4 e aprovação própria de merge |
| `.github/workflows/governance.yml` | Adaptar para testes/validador e migrações imutáveis; preparar localmente, sem alegar execução remota. Ausência de pasta de migrations continua válida |
| `.github/workflows/ci.yml` | Adiar CI de aplicação, Supabase e E2E; retirar de `requiredFiles`/`requiredText` neste ciclo. O workflow de governança continua obrigatório |
| `.env.example` | Adiar até a fundação técnica; retirar de `requiredFiles` neste ciclo. O `.gitignore` já deve permitir um exemplo futuro sem liberar segredos |
| `package.json` | Adaptar como tooling de governança: `name` do projeto, `private: true`, `type: module`, Node 24 ou superior e scripts `test:governance`/`check:governance` para os comandos nativos. Sem dependências, scaffold ou scripts da aplicação |
| `design-system/DESIGN.md` | Adiar contrato visual; retirar de obrigatórios neste ciclo |
| `design-system/referencia.html` | Adiar; não publicar ou promover o mockup privado como substituto |
| `design-system/assets/logo-saldo-futuro.svg` | Não transportar identidade visual da origem |
| `design-system/assets/logo-simbolo.svg` | Não transportar o símbolo da origem |
| `design-system/assets/fonts/OFL.txt` | Não transportar arquivo de licença de fonte que não será copiada; fontes serão decididas no ciclo visual |
| `scripts/governance-manifest.json` | Adaptar conforme este inventário fechado, G1–G4 e exceção estrita; `legacyV1` vazio no destino |
| `scripts/validate-governance.mjs` | Adaptar apenas consumidores afetados; preservar controles ainda pertinentes e testar cada mudança de regra |
| `scripts/validate-governance.test.mjs` | Adaptar fixtures e expectativas ao domínio e aos arquivos deste inventário; preservar regressões pertinentes |

**Demais arquivos encontrados fora de `requiredFiles`:** adiar `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json`, `CHANGELOG.md` e a automação de releases para a fundação técnica; não transportar `_project/decisions/ADR-005_graficos_svg_proprio.md`, `_project/knowledge/KB-002_operacao_producao_acessos.md`, credenciais, configurações locais, `package-lock.json`, histórico de ciclos ou dados da origem. O registro futuro de operação do Rastro Quente será próprio. Não criar `LICENSE` ou design system implicitamente para satisfazer o manifesto.

**Controles do manifesto além de `requiredFiles`:** adaptar `requiredText` aos arquivos/nomes acima e à privacidade ambiental; preservar `adapters`, `workflows`, `skills`, estados de `cycles`, `plans` e `tasks`, versão 2 de `artifacts`, rodadas, `nextStep`, `backlog`, `shortTrack` e nomenclatura da origem, acrescidos apenas das exceções exatas do bootstrap. Atualizar `siblingCheck` para incluir `saldo-futuro`; ignorar dados privados por `scanExclusions`. Preservar controles de `dataFiles`, RLS/migrations e `.gitignore` quando aplicáveis; normalizar equivalência de `/local/` e `local/` sem tornar a pasta rastreável. `designSystem` não é um requisito ativo deste ciclo: remover as exigências e chamadas obrigatórias correspondentes, com teste que passa sem a pasta e sem permitir falsas alegações de conformidade visual. Os `manualChecks` devem incluir proveniência, privacidade, autenticidade das aprovações, semântica das barreiras e a limitação da inspeção Vercel.


### Inventário técnico para ciclo posterior

| Arquivo de origem | Papel observado | Condição para reaproveitar |
| :-- | :-- | :-- |
| [`src/components/login-panel.tsx`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/components/login-panel.tsx) | Inicia OAuth Google e fornece acesso por senha em ambiente local | Rever UI e política de ambientes; não transportar estilos/marca |
| [`src/app/auth/callback/route.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/app/auth/callback/route.ts) | Troca código OAuth por sessão; erro com mensagem neutra | Rever URLs e fluxos sem revelar existência de conta |
| [`src/lib/supabase/client.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/supabase/client.ts) | Cliente de navegador com configuração pública | Separar variáveis por ambiente; nenhuma chave secreta no navegador |
| [`src/lib/supabase/server.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/supabase/server.ts) | Cliente de servidor com cookies | Adaptar à stack futura e testar renovação/erros |
| [`src/proxy.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/proxy.ts) | Renova cookies via getClaims; não protege rotas | Aplicar proteção explícita nos pontos de entrada |
| [`src/lib/sessao.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/sessao.ts) | getUser, perfil, papel; exigirSessao e exigirAdmin | Definir matriz territorial própria; revisar schema e políticas |
| [`tests/e2e/auth.spec.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/tests/e2e/auth.spec.ts) | Cenários de autenticação local e acessibilidade | Reescrever fixtures fictícias e configurar backend de testes |
| [`tests/e2e/acessos.spec.ts`](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/tests/e2e/acessos.spec.ts) | Administração da lista de acessos e papéis | Rever admissão/revogação: remoção da lista não revoga conta existente |

Nenhum componente acima foi copiado para implementação no destino. Não foram testados OAuth real, sessão, RLS, banco ou deploy do Rastro Quente.

## Fontes

- `.agent/ai_behavior.md`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/.agent/ai_behavior.md); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/.agent/ai_behavior.md); blob `c5fdbd5e8d7f919b7ab28fad45c6e4dcd7163476`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `_project/README.md`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/_project/README.md); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/_project/README.md); blob `eb07be2f5f552649204473a0beca8b0313b65609`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `scripts/governance-manifest.json`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/scripts/governance-manifest.json); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/scripts/governance-manifest.json); blob `bcfac4516fc008ccda10508a522887069f3cd261`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `src/components/login-panel.tsx`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/src/components/login-panel.tsx); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/components/login-panel.tsx); blob `2cca7d8efe87a14b1f381b37dcce84933f67ec01`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `src/app/auth/callback/route.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/src/app/auth/callback/route.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/app/auth/callback/route.ts); blob `2690a93383b3749d6a06565c75618c331769562a`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `src/lib/supabase/client.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/src/lib/supabase/client.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/supabase/client.ts); blob `a845cf4e0341c7df7e52e2874b1b92ce43e5428f`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `src/lib/supabase/server.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/src/lib/supabase/server.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/supabase/server.ts); blob `88ad1f4d1b5f30b0376c7d2e1e1d9832325667cd`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `src/proxy.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/src/proxy.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/proxy.ts); blob `7a5ee14a08d86c1af2ab4bfa391d4d6774f9e016`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `src/lib/sessao.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/src/lib/sessao.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/src/lib/sessao.ts); blob `45b9832a2f96b47c48a21683ea8610d0ab5770df`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `tests/e2e/auth.spec.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/tests/e2e/auth.spec.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/tests/e2e/auth.spec.ts); blob `2ca76e4b64b0a5f6c093e5b0b7537e82b32a1a2b`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.
- `tests/e2e/acessos.spec.ts`: [main](https://github.com/EuThiagoAndrade/saldo-futuro/blob/main/tests/e2e/acessos.spec.ts); [commit fixado](https://github.com/EuThiagoAndrade/saldo-futuro/blob/c31081d56d7ce0d0ff2f51de3db655f90db6b36b/tests/e2e/acessos.spec.ts); blob `f8e2570fa257bc0209c25eb1ee8184dca9c1278c`. Papel: referência de estrutura/código; sem autoridade para executar ou copiar dados.

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-10-31 | `000` | Criação; origem fixada e inventário local |
