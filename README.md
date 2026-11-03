# Rastro Quente

Análise territorial de detecções de calor e seleção explicável de áreas para avaliação técnica. Detecções e sobreposições não comprovam incêndio, dano, autoria ou infração.

Projeto em fundação local; materiais privados permanecem em `local/`.

Governança implantada pelo ciclo `000` (PR #1 integrada em `main`). Não há aplicação, autenticação ou banco implementados.

Com Node.js 24 ou superior, sem instalar dependências:

```sh
node --test scripts/validate-governance.test.mjs
node scripts/validate-governance.mjs
```

Leia `.agent/ai_behavior.md`, `_project/README.md` e `_project/cycles.md`. Requisitos: `_project/knowledge/KB-003_visao_produto_requisitos.md`. Repositório privado: `EuThiagoAndrade/rastro-quente`. Licença aberta adiada, sem LICENSE.