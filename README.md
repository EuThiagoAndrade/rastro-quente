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

Implantação (ciclo `003`, issue #24): `vercel.json` define o build estático e os cabeçalhos. Só `main` gera deploy. A carga hospedada levou 20,6 s e o banco lógico ficou com 29,5 MB. A [seção 11 do runbook](docs/runbook.md#11-roteiro-do-item-5--operação-hospedada-atos-do-responsável) reúne os procedimentos e as medições.

Leia `.agent/ai_behavior.md`, `_project/README.md` e `_project/cycles.md`. Requisitos: `_project/knowledge/KB-003_visao_produto_requisitos.md`. Repositório privado: `EuThiagoAndrade/rastro-quente`. Licença aberta adiada, sem LICENSE.
