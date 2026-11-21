# Ideação — 011: insights com agentes

> **Ciclo:** `011`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "Confirmo o nível completo e autorizo a ideação do ciclo 011" em 2026-11-21
> **Criado em:** 2026-11-21
> **Última atualização:** 2026-11-21
> **handoff_schema_version:** `2`

## Problema

Os agentes atuais ajudam a ler evidências, mas em geral repetem informações já disponíveis nas lentes. Para a apresentação no curso, o responsável deseja demonstrar agentes e subagentes com uma finalidade perceptível: apoiar a investigação ao apontar relações e aspectos que mereçam exame nos dados do recorte.

## Origem no backlog

Não se aplica.

## Contexto e evidências

- A [KB-003](../knowledge/KB-003_visao_produto_requisitos.md) e a [validação do ciclo 008](../executed/008_comparacao_periodos_agentes/008_validation_agentes.md) registram o limite atual de valor e a qualidade observada; a conferência de números não garante o sentido das frases.
- Existe um agente principal e dois subagentes Gemini, ferramentas determinísticas, evidências referenciadas e até seis chamadas por pergunta. A experiência atual inclui perguntas prontas e texto livre.
- A demonstração anterior registrou restrições de cota e falhas do provedor. A suficiência do nível gratuito para a proposta não foi comprovada; depende de volume, chamadas e limites vigentes.
- O responsável pediu escopo enxuto e menos carga de testes de estresse e comparação demorados, sem dispensar a verificação necessária à mudança.

## Resultado desejado

- No painel direito, apresentar perguntas fechadas de forma intuitiva e, logo abaixo da escolha, respostas contextualizadas em tópicos. Retirar a pergunta aberta dessa experiência.
- Candidatas discutidas: “O que chama atenção neste período?”, “O que mudou em relação ao outro período?”, “Quais locais apresentam mais de um padrão?”, “Onde devo interpretar os resultados com mais cuidado?” e “O que vale examinar em seguida?”. A seleção final e as condições de disponibilidade ainda serão definidas.
- Os achados devem relacionar evidências e indicar limitações e, quando cabível, próximos exames; admitir ausência de achados relevantes. Não inventar conclusões.
- Preservar, como direção proposta, um agente principal e dois subagentes com funções demonstráveis: padrões; contexto e qualidade. O principal coordena e sintetiza. Os papéis e o grau de exposição das etapas reais estão em aberto.
- Ferramentas realizam cálculos verificáveis; a IA interpreta e comunica os resultados. Procurar manter o uso gratuito e o consumo próximo do atual, como hipótese a medir, não garantia.

## Hipóteses

- Cruzar evidências existentes e cálculos delimitados pode produzir achados mais úteis que a descrição isolada de uma lente.
- Perguntas fechadas e evidências resumidas podem conter o consumo de tokens, embora chamadas e latência ainda possam limitar a demonstração.
- A estrutura atual de agentes e ferramentas pode ser aproveitada, sujeita à análise técnica e ao contrato dos achados.

## Alternativas

1. Reaproveitar evidências atuais e focar em relações que elas sustentem; menor escopo, limitado ao que já está disponível.
2. Acrescentar poucos cálculos determinísticos específicos para perguntas escolhidas; pode ampliar a utilidade, exigindo definição e validação do método.
3. Investigação aberta e ampla sobre quaisquer dados; maior complexidade e consumo, fora da direção escolhida.

## Riscos e restrições

- G1: interpretações e eventuais cálculos ambientais exigem regras explícitas, casos de referência e decisão do responsável sobre alternativas analíticas. Detecções e sobreposições não provam incêndio, dano, autoria ou infração; ausência de registro não prova ausência de fogo.
- O verificador atual não assegura a correção semântica; referências e números corretos podem acompanhar interpretação enganosa. Definir avaliação de sentido, cobertura e limites.
- Disponibilidade incompleta, diferenças de recorte, amostras e comparação A → B podem induzir conclusões incorretas.
- Cotas, latência e falhas do Gemini podem inviabilizar uma demonstração; medir chamadas, tokens e tempo em amostra proporcional e preservar tratamento de falhas.
- Privacidade, acesso e envio ao provedor seguem as autoridades existentes; não inferir autorização para novos dados ou fontes.
- Escopo enxuto não dispensa barreiras de domínio, testes necessários ou revisão formal. Evitar baterias extensas de estresse/comparação sem justificativa vinculada ao risco.

## Perguntas em aberto

1. Quais perguntas candidatas entram na primeira entrega e em quais contextos ficam disponíveis, inclusive sem comparação ou sem lente?
2. Quais padrões e relações têm utilidade suficiente, dados disponíveis e definição verificável? Quais exigem decisão analítica do responsável, com exemplos?
3. Que evidências, ressalvas e ações devem acompanhar cada achado, e como apresentar ausência de achados ou dados insuficientes?
4. Como mostrar a contribuição real do principal e dos subagentes de modo intuitivo na apresentação?
5. Qual orçamento de chamadas, tokens e tempo e qual amostra mínima de validação demonstram viabilidade no nível gratuito, sem prometer disponibilidade?
6. Como avaliar o significado das respostas e os estados de falha, cancelamento e mudança de recorte, preservando as garantias existentes?

## Fora do escopo

- Perguntas abertas e investigação irrestrita; novas fontes externas ou previsão, autoria, infração e causalidade.
- Ampliação de infraestrutura paga como pressuposto; benchmarks extensos sem necessidade demonstrada.
- Implementação, publicação e mudanças de método nesta ideação.

## Critérios para iniciar o planejamento

Revisar as perguntas e decisões em aberto com o responsável, delimitar os achados e suas evidências, identificar decisões G1 que exijam escolha humana e propor validação proporcional ao risco e ao objetivo do curso. A ideação não aprova método, plano ou implementação.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 011 (completo)
Quem: Responsável
Conferir: Perguntas e decisões da ideação
Diga: "autorizo o rascunho do plano do ciclo 011"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 011 + idear + insights_agentes + fc5f6334e871606abe5560b6487ec2bfee36222f`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: ciclo 011 disponível / ciclo 011 em Ideação, reservado no registro local.
- `result`: `executed`
- `evidence`: este documento e `_project/cycles.md`.
- `blockers`: nenhum para a ideação; perguntas e decisões para planejamento acima.
