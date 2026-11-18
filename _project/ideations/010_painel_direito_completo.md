# Ideação — 010: Painel direito completo

> **Ciclo:** `010`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 010" em 2026-11-18
> **Criado em:** 2026-11-18
> **Última atualização:** 2026-11-18
> **handoff_schema_version:** `2`

## Problema

O responsável quer implementar o esboço completo do painel direito em `local/esboco/proposta-todas-abas-e-agente.html`, incluindo todas as abas e a interface do agente, com testes proporcionais à mudança, não massivos nem exaustivos. O esboço é uma proposta com exemplos fictícios; não consulta a aplicação e não define sozinho os métodos ou dados reais.

## Origem no backlog

Não se aplica.

## Contexto e evidências

- A aplicação já possui abas Lentes, Municípios e Comparação, além do painel de perguntas sobre a tela. Os contratos de interface e acessibilidade estão em `DESIGN.md`; a visão do produto e as limitações dos agentes constam na KB-003.
- O esboço apresenta resultado e detalhe de lugar, variantes para lentes, resultado vazio, lista e detalhe de municípios, comparação de períodos e municípios, e perguntas ao agente antes, durante, após e em caso de falha. Propõe linguagem de pergunta, resposta, explicação, ações e detalhes técnicos acessíveis.
- A comparação de períodos e municípios já existe; a KB-007 especifica identidade, disponibilidade, estados de conclusão, diferenças e limitações. A disponibilidade ainda não verificada não permite antecipar conclusão comparativa.
- Os painéis atuais incluem evidências, dados técnicos, acesso por teclado, estados de carregamento e falha, cancelamento e descarte de resposta quando a seleção muda. O contrato do agente preserva etapas reais, evidências, análises e informações de execução. A KB-003 registra qualidade insuficiente observada em respostas reais e a correção posterior, sem reverificação exaustiva em produção.
- A apresentação de lentes usa ordenações existentes: por exemplo, `src/apresentacao-lentes.ts` descreve ordem geográfica para células e regras específicas para persistência. O esboço exemplifica recorrência por meses e persistência por sequência. Uma mudança de ordem ou de texto pode influenciar a interpretação mesmo sem alterar os cálculos.
- O arquivo em `local/` é privado e ignorado pelo Git; exemplos, números e frases são ilustrativos. A solução deve usar resultados reais e preservar a proveniência e as ressalvas aplicáveis.

## Resultado desejado

- Traduzir integralmente para a aplicação a experiência proposta para as abas Lentes, Municípios e Comparação e para a interface do agente, adaptando-a aos dados, estados e recursos reais.
- Manter navegáveis as listas e detalhes, ações com efeito real, evidências, limitações, contexto e estados necessários; não apresentar conteúdo fictício como resultado.
- Definir testes focados nos fluxos e riscos efetivamente alterados, incluindo interpretação, estados relevantes e acessibilidade, sem suíte massiva ou exaustiva.

## Hipóteses

- A maior parte da proposta pode ser implementada sobre os cálculos, consultas e operações existentes, sem alterar fórmulas, fontes, schema, RLS ou arquitetura dos agentes. Isso depende de conferência no planejamento.
- A apresentação pode ser mais clara sem retirar detalhes que sustentam o resultado nem sugerir certeza maior que a evidência.
- Parte das ações exemplificadas pode exigir adaptação para cumprir o comportamento real, sobretudo seleção de município, foco no mapa, visualização de focos e disponibilidade.

## Alternativas

| Alternativa | Avaliação inicial |
| :-- | :-- |
| Adaptar integralmente a experiência ao sistema e aos contratos existentes | Candidata principal; requer mapear cada estado e ação do esboço às capacidades reais e revisar o contrato visual. |
| Reproduzir literalmente o exemplo e seus números | Descartada: o próprio esboço é fictício e contém textos sujeitos a revisão metodológica. |
| Alterar também métodos, fontes ou a arquitetura do agente | Não decorre do pedido; se indispensável, explicitar alternativas, impacto e decisão humana antes de ampliar o escopo. |

## Riscos e restrições

- **G1:** textos, ordenação, agregações e disponibilidade podem mudar a interpretação geoespacial. Preservar KB-004, KB-005 e KB-007, unidades, GMT, critérios, evidências e ressalvas; decisões de regra analítica cabem ao responsável, com exemplos numéricos quando houver alternativas.
- Um lugar pode envolver múltiplos municípios; cobertura de célula e disponibilidade por município não devem ser confundidas. Dia sem registro ou sem evidência de lacuna não garante detecção completa. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração.
- **G2:** nenhuma alteração de autenticação, autorização ou RLS foi identificada como necessária; reavaliar se o desenho exigir mudança no acesso ou nas consultas.
- **G3:** não copiar dados privados, credenciais ou conteúdo sensível de `local/` para artefatos versionados, fixtures ou comunicações externas. Usar exemplos fictícios sanitizados.
- **G4:** nenhuma migração foi identificada como necessária; se surgir, respeitar o caráter aditivo e retriar impactos.
- Preservar acessibilidade, responsividade, ambos os temas, foco e estados de erro, execução, cancelamento e seleção; os botões devem executar o que anunciam. A IA pode errar; mostrar identificação e evidências reais, sem fabricar etapas ou reforçar conclusões indevidas.
- Mudanças ao contrato visual exigem atualização coerente de `DESIGN.md` no ciclo. Não tratar exemplos do esboço como contrato de método.

## Perguntas em aberto

1. Como adaptar a ordenação por critério proposta para recorrência e persistência às regras e ressalvas atuais, sem sugerir prioridade, risco ou gravidade? Se alterar uma regra analítica, apresentar opções e exemplos ao responsável.
2. Para cada lente, combinação e sobreposição, quais respostas, métricas e ações do esboço são sustentadas pelos dados existentes, inclusive células que atravessam municípios e sequências distintas na mesma célula?
3. Quais estados, informações técnicas e ações existentes devem ser reorganizados para permanecer acessíveis em todas as abas, inclusive comparação pendente, falha e ausência de resultados?
4. Quais ações do detalhe e da resposta do agente já têm suporte real e quais exigem trabalho adicional de interface? Como preservar o escopo da seleção e evitar mudança implícita de filtros?
5. Qual conjunto mínimo de testes cobre as mudanças reais e seus riscos, sem multiplicar casos que apenas repitam a implementação?

## Fora do escopo

- Criar novas fontes, lentes, regras analíticas, schema, política de acesso ou integrações de IA por iniciativa própria.
- Tratar exemplos fictícios como dados reais, inferir causas ou conclusões de incêndio, dano, autoria ou infração.
- Publicação, implantação ou mudança de produção sem as autorizações e verificações correspondentes.

## Critérios para iniciar o planejamento

- Confirmar que o rascunho cubra o esboço completo e preserve os contratos e limitações vigentes; mapear as perguntas acima e explicitar decisões humanas necessárias antes de qualquer mudança de regra.
- Definir entregas e testes proporcionais aos fluxos e riscos efetivamente alterados, com revisão formal posterior. As hipóteses acima não autorizam implementação.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 010 (completo)
Quem: Responsável
Conferir: Perguntas e decisões da ideação
Diga: "autorizo o rascunho do plano do ciclo 010"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 010 + idear + painel_direito_completo + cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: próximo ciclo `010`, sem registro de ideação / ciclo `010` reservado como `Ideação`, com esta ideação criada
- `result`: `executed`
- `evidence`: esta ideação e linha `010` em `_project/cycles.md`; revisão de origem `cf7d9cd2539fc1f8fa5a10b34569abff4deb35f3`
- `blockers`: nenhum para a ideação; decisões de regra, se necessárias, permanecem dependentes do responsável.
