# Lições aprendidas

Somente lições comprovadas e reutilizáveis. Estado de execução pertence à task.

## Conferência de saídas de modelo exige o formato real da evidência (ciclo 008, 2026-11-17)

- **Fato:** a conferência das afirmações dos agentes passou na prova real local, com fixture fictícia (issue #79), e rejeitou a análise de disponibilidade em 4 de 6 execuções com os dados reais hospedados (issue #81). A janela da evidência real ficava fora do item citado, e frases comparativas citavam um só lado. Leituras erradas sem número novo (detecções chamadas de destaques, sentido invertido) passaram pela conferência.
- **Aplicação:** antes de declarar o aceite de uma conferência ou validação de saída de modelo, exercitá-la com evidências no formato e na escala reais, ou com uma fixture que reproduza essa estrutura. Testar também frases comparativas e com datas, e não tratar a conferência numérica como garantia de sentido.
- **Fonte:** `_project/executed/008_comparacao_periodos_agentes/008_validation_agentes.md` e a task da issue #81.
