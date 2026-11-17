# Lições aprendidas

Somente lições comprovadas e reutilizáveis. Estado de execução pertence à task.

## Conferência de saídas de modelo exige o formato real da evidência (ciclo 008, 2026-11-17)

- **Fato:** a conferência das afirmações dos agentes passou na prova real local, com fixture fictícia (issue #79), e rejeitou a análise de disponibilidade em 4 de 6 execuções com os dados reais hospedados (issue #81). A janela da evidência real ficava fora do item citado, e frases comparativas citavam um só lado. Leituras erradas sem número novo (detecções chamadas de destaques, sentido invertido) passaram pela conferência.
- **Aplicação:** antes de declarar o aceite de uma conferência ou validação de saída de modelo, exercitá-la com evidências no formato e na escala reais, ou com uma fixture que reproduza essa estrutura. Testar também frases comparativas e com datas, e não tratar a conferência numérica como garantia de sentido.
- **Fonte:** `_project/executed/008_comparacao_periodos_agentes/008_validation_agentes.md` e a task da issue #81.

## Retirar elementos da tela exige procurar todos os ids, inclusive em laços de limpeza (ciclo 009, 2026-11-17)

- **Fato:** ao retirar os cartões abaixo do mapa (issue #91), typecheck, testes unitários, build e o E2E novo passaram, mas um laço em `src/app.ts` ainda limpava `resumo-corpo` e `disp-corpo`. O helper `$` lança erro com id ausente, e todo caminho de erro da consulta (fonte indisponível, versão substituída, leitura inconsistente) ficou preso em "carregando". Só a suíte E2E completa expôs o problema, em 5 testes.
- **Aplicação:** ao retirar um elemento do `index.html`, procurar o id em `src/` (inclusive listas de ids em laços) e rodar a suíte E2E completa, não só as specs da mudança.
- **Fonte:** `_project/executed/009_rotulos_lentes_espaco_mapa/009_task_issue-91.md`.
