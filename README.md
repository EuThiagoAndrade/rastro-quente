# Rastro Quente

Análise territorial de detecções de calor e seleção explicável de áreas para avaliação técnica. Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração.

O protótipo está publicado na Vercel Hobby, com banco no Supabase Free e login Google. A consulta é restrita à conta autorizada. A carga inicial cobre 10.640 detecções `AQUA_M-T` em 142 municípios de Mato Grosso, de novembro de 2025 a outubro de 2026 em GMT. Materiais privados permanecem em `local/`.

Governança implantada pelo ciclo `000` (PR #1 integrada em `main`).

Com Node.js 24 ou superior, sem instalar dependências:

```sh
node --test scripts/validate-governance.test.mjs
node scripts/validate-governance.mjs
```

Recorte local de focos do protótipo (ciclo `003`, sem banco): `node scripts/prototipo/prototipo.mjs <janela | obter | processar | conferir>`, com dados em `local/dados-prototipo/`; testes com fixtures em `npm run test:prototipo`. Método em `_project/knowledge/KB-004_metodo_recorte_focos_mt.md`.

Banco local do protótipo (ciclo `003`, Supabase CLI fixada no lockfile, exige Docker): `npm ci`, `npx supabase start` e `npm run test:rls` (migrações do zero, RLS, matriz de acesso e contrato de consulta com dados fictícios). Decisão, matriz e comandos em `_project/decisions/ADR-005_banco_autorizacao_prototipo.md`.

Carga local de dados (ciclo `003`, issue #22): `node scripts/banco/carga.mjs <plan | apply | expirar | resumo> --alvo postgresql://rq_executor@HOST:PORTA/BANCO`, com a senha do EX só em `RQ_EXECUTOR_PASSWORD`; uma transação, identidade pelo manifesto canônico e reconciliação por identidade. Decisão e medições em `_project/decisions/ADR-006_carga_idempotente_unica_transacao.md`; atualização, cópia, expiração, recuperação e rotação do EX em `docs/runbook.md`. `npm run medir:carga` e `node scripts/banco/reconstruir.mjs` medem e reconstroem com os dados de `local/dados-prototipo/`.

Interface de consulta (ciclo `003`, issue #23): aplicação estática Vite + TypeScript + Leaflet com login Google (Supabase Auth). `npm ci`, `npm run typecheck`, `npm run build` (precisa de `VITE_SUPABASE_URL` e `VITE_SUPABASE_CHAVE_PUBLICAVEL`; ver `.env.example`), `npm run test:interface` (contraste, lógica e inspeção do bundle) e `npm run test:e2e` (Playwright com Chrome do sistema, Supabase local, Auth local e dados fictícios). `npm run medir:interface` mede a geometria em celular com a carga real local. Decisão em `_project/decisions/ADR-007_interface_consulta_prototipo.md`; guia da interface em `docs/runbook.md`.

Lentes de seleção (ciclos `004` e `005`): concentração, recorrência e persistência em `src/lentes/`; o ciclo `005` acrescenta a combinação por interseção (`e`) ou união (`ou`) e sua interface explicável. Contrato, método e limites em `_project/knowledge/KB-005_contrato_lentes_selecao.md`. `npm run conferir:lentes`, `npm run conferir:combinacao` e `npm run medir:lentes` conferem e medem com a carga real local.

Áreas protegidas reais (ciclo `006`): unidades de conservação do CNUC (MMA) e terras indígenas da FUNAI. Camada no mapa com visão geral simplificada e contornos reais sob demanda, persistência em `areas` e `deteccoes_areas` com isolamento por RLS ([ADR-008](_project/decisions/ADR-008_persistencia_areas_protegidas.md)) e lente de sobreposição por classe (`sobreposicao-006-v1`) em `src/lentes/sobreposicao.ts`. Métodos e limites em `_project/knowledge/KB-006_areas_protegidas.md` e `_project/knowledge/KB-005_contrato_lentes_selecao.md`. `npm run conferir:areas` e `npm run conferir:sobreposicao` conferem o pertencimento e a lente por SQL independente na carga real local.

Interface base (ciclo `007`): visual da referência V13 com o contrato `DESIGN.md` (tokens, componentes, temas claro e escuro), três colunas no computador, lentes no recorte da consulta, densidade por célula, série do período, "Lista de focos", painéis "Mapa" e "Camadas" e mapa-base de satélite da Esri com "Sem fundo" sempre disponível ([ADR-009](_project/decisions/ADR-009_interface_base.md) e [ADR-010](_project/decisions/ADR-010_mapa_base_terceiros.md)). A chave da Esri fica só na Vercel (`VITE_ESRI_CHAVE`), nunca no repositório.

Comparação determinística (ciclo `008`, issue #77): dois períodos de mesma duração no mesmo recorte, ou dois municípios no mesmo período, com a mesma lente nos dois lados, sem IA nem chave (`comparacao-008-v1` em `src/comparacao.ts`). Contrato, regras de zero, ausência e disponibilidade e limites em `_project/knowledge/KB-007_comparacao_territorial.md`.

Função de explicação (ciclo `008`, issue #78): `/api/explicar`, função Node 24 na Vercel com a lógica em `servidor/`, **desligada por padrão** (503 sem `RQ_IA_HABILITADA=true` e a configuração completa). Acesso sob o JWT do responsável e a RLS, catálogo fechado de ferramentas determinísticas e cliente do Gemini só no servidor ([ADR-011](_project/decisions/ADR-011_funcao_explicacao_servidor.md)). `npm run typecheck:servidor`, `npm run test:api` (Supabase local, provedor simulado) e `node scripts/agentes/conferir-pacote.mjs` (pacote do `vercel build --standalone`) conferem a função.

Agentes de explicação (ciclo `008`, issues #79 a #81): um agente principal Gemini (`gemini-3.1-flash-lite`, nível gratuito) delega a dois subagentes, um de lentes e evidências e outro de disponibilidade. Cada um faz chamadas próprias ao modelo e usa só as ferramentas determinísticas. A aplicação confere cada afirmação contra as evidências e descarta o que não confere, com até 6 chamadas por pergunta. O painel "Perguntar sobre a tela", na coluna de resultado, mostra as etapas reais em fluxo, as evidências e o aviso "Gerado por IA", e permite cancelar. Sem IA, consulta, lentes e comparação continuam completas. Em produção a função está **ligada** (`RQ_IA_HABILITADA`, só no painel da Vercel). Operação, verificação e desligamento de emergência estão na [seção 12 do runbook](docs/runbook.md#12-ciclo-008-item-5--ia-hospedada-configuração-verificação-e-desligamento). Limites observados e o que os agentes acrescentam de fato estão no [relatório de validação](_project/executed/008_comparacao_periodos_agentes/008_validation_agentes.md). `npm run test:agentes` usa um provedor simulado, e `npm run prova:agentes` usa o Gemini real local, com a chave só no `.env`.

Rótulos das lentes e espaço do mapa (ciclo `009`, issue #91): o rótulo "Lentes" agrupa "Seleção", "Contexto territorial" e "Cruzar critérios"; a aba de resultado se chama "Lentes", com o título da opção ativa. Abaixo do mapa fica só a série: os cartões "No mapa", "Detecções no período" e "Disponibilidade dos dados" saíram, e o mapa ficou mais alto. A disponibilidade aparece na explicação de cada destaque e na aba "Comparação"; aviso e atribuição das áreas protegidas ficam na "Legenda" do mapa. Decisões no [plano](_project/executed/009_rotulos_lentes_espaco_mapa/009_plan.md) e nas emendas dos ADR-007, ADR-009 e ADR-011.

Painel direito completo (ciclo `010`): as abas Lentes, Municípios e Comparação mostram resultados, limites e ações de navegação; inspecionar um município estadual não altera o filtro até a consulta explícita. O painel de perguntas mostra o contexto aplicado, as etapas e as evidências, com retorno ao resultado. Contrato visual em [DESIGN.md](DESIGN.md); não houve mudança de método nem verificação em produção no ciclo.

Insights com agentes (ciclo `011`, issue #107): o painel de perguntas oferece cinco perguntas fechadas, sem texto livre, e explica quando uma não se aplica ao recorte. Os subagentes de padrões e de contexto/qualidade usam também a distribuição temporal GMT e o cruzamento dos critérios aplicáveis; a síntese só sai completa quando relaciona evidências distintas ou traz limitação conferida. `npm run prova:agentes` espaça as chamadas ao Gemini em 13 s por padrão. Utilidade aceita em amostra local fictícia; verificação em produção dispensada no ciclo.

Implantação (ciclo `003`, issue #24): `vercel.json` define o build estático e os cabeçalhos. Só `main` gera deploy. A carga hospedada levou 20,6 s e o banco lógico ficou com 29,5 MB. A [seção 11 do runbook](docs/runbook.md#11-roteiro-do-item-5--operação-hospedada-atos-do-responsável) reúne os procedimentos e as medições.

Leia `.agent/ai_behavior.md`, `_project/README.md` e `_project/cycles.md`. Requisitos: `_project/knowledge/KB-003_visao_produto_requisitos.md`. Repositório privado: `EuThiagoAndrade/rastro-quente`. Licença aberta adiada, sem LICENSE.
