# Rastro Quente

Análise territorial de detecções de calor e seleção explicável de áreas para avaliação técnica. Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração.

Projeto em fundação local; materiais privados permanecem em `local/`.

Governança implantada pelo ciclo `000` (PR #1 integrada em `main`). Ainda não há aplicação web nem banco hospedado; o banco existe só localmente (abaixo).

Com Node.js 24 ou superior, sem instalar dependências:

```sh
node --test scripts/validate-governance.test.mjs
node scripts/validate-governance.mjs
```

Recorte local de focos do protótipo (ciclo `003`, sem banco): `node scripts/prototipo/prototipo.mjs <janela | obter | processar | conferir>`, com dados em `local/dados-prototipo/`; testes com fixtures em `npm run test:prototipo`. Método em `_project/knowledge/KB-004_metodo_recorte_focos_mt.md`.

Banco local do protótipo (ciclo `003`, Supabase CLI fixada no lockfile, exige Docker): `npm ci`, `npx supabase start` e `npm run test:rls` (migrações do zero, RLS, matriz de acesso e contrato de consulta com dados fictícios). Decisão, matriz e comandos em `_project/decisions/ADR-005_banco_autorizacao_prototipo.md`.

Leia `.agent/ai_behavior.md`, `_project/README.md` e `_project/cycles.md`. Requisitos: `_project/knowledge/KB-003_visao_produto_requisitos.md`. Repositório privado: `EuThiagoAndrade/rastro-quente`. Licença aberta adiada, sem LICENSE.