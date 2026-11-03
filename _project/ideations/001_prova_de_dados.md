# Ideação — 001: Prova de dados

> **Ciclo:** `001`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 001" em 2026-11-03
> **Criado em:** 2026-11-03
> **Última atualização:** 2026-11-03 (decisões do responsável registradas)
> **handoff_schema_version:** `2`

## Problema

O Rastro Quente pretende selecionar áreas para avaliação técnica a partir de detecções de calor e de sobreposições territoriais. Nenhum dado, fonte, contagem ou resultado analítico foi verificado até agora. Sem essa base, a arquitetura, os custos e a fundação técnica seriam decididos sem evidência, e uma seleção sem método explicável e sem referência independente poderia induzir conclusões que os dados não sustentam (focos e sobreposições não comprovam incêndio, dano, autoria ou infração).

## Origem no backlog

Não se aplica. Demanda direta do responsável, confirmada na triagem de 2026-11-03. Nenhum ID do backlog selecionado.

## Contexto e evidências

Fatos verificados no repositório:

- O ciclo 000 entregou somente governança, tooling e conhecimento documental, e foi concluído em 2026-11-03 (`_project/executed/000_fundacao_governanca/`).
- KB-003: o produto apoia a análise territorial de detecções de calor e a seleção explicável de áreas. Framework, processamento geoespacial, PostGIS, fontes, capacidade e volumes permanecem abertos. As próximas etapas técnicas devem planejar uma prova de dados com fontes e versões identificadas, cobertura temporal e territorial, contagens e casos de referência independentes; só depois validar capacidades, custos e arquitetura.
- ADR-002: Vercel, Supabase e autenticação Google são requisitos; não há serviço configurado nem arquitetura aprovada. O package atual contém somente tooling nativo Node.js 24+.
- ADR-003 e `.agent/ai_behavior.md`: o repositório é privado, sem licença aberta. Dados pessoais, identificadores de pessoas e atributos sensíveis de imóveis não entram em commits, issues, PRs, logs ou fixtures. Fixtures usam dados fictícios ou fontes públicas com proveniência e condições de uso conferidas.
- Barreira G1 (exatidão analítica): exige referência independente, proveniência e limitações, e decisões de regra analítica ambiental nunca são cobertas pelo modo contínuo nem escolhidas pelo agente.

Evidência ausente: nenhuma fonte de dados foi identificada ou avaliada neste ciclo; nenhum volume, período ou território foi definido. O mockup privado em `local/` não foi lido e não é baseline.

## Resultado desejado

Ao fim do ciclo, existir evidência suficiente para decidir, com base em dados e não em suposição, se a abordagem do produto é viável e quais capacidades ela exige. Em termos esperados (a confirmar no plano): fontes e versões identificadas com condições de uso; cobertura temporal e territorial declarada; contagens reproduzíveis; casos de referência conferidos por caminho independente; limitações registradas.

## Hipóteses

Todas por verificar; nenhuma é decisão.

- H1. Existem fontes públicas de detecções de calor e de camadas territoriais com cobertura e licença compatíveis com o uso do produto.
- H2. Uma prova com recorte pequeno (um território e um período) basta para validar o método antes de escalar.
- H3. Casos de referência independentes podem ser montados a partir de fontes públicas, sem dados pessoais.
- H4. O volume dos dados ainda não é conhecido e pode condicionar a escolha de processamento geoespacial e de banco.

## Alternativas

- A1. **Prova mínima de dados:** recorte pequeno, fontes públicas identificadas, contagens e poucos casos de referência. Menor custo e risco; responde à viabilidade, não à escala.
- A2. **Prova ampla:** vários territórios e períodos. Mais evidência sobre volume e cobertura, com custo e risco de privacidade maiores.
- A3. **Fundação técnica antes:** autenticação, RLS e migrações primeiro. Descartada como ponto de partida por esta ideação, porque fixaria desenho de dados antes de conhecê-los; permanece como ciclo seguinte possível.
- A4. **Aproveitar o mockup privado como base:** rejeitada como baseline pelo KB-003; pode ser consultada pelo responsável fora do repositório.

## Riscos e restrições

- G1: qualquer regra de seleção, limiar ou peso é decisão do responsável; o agente registra alternativas com exemplos numéricos e pede decisão.
- G3: fontes podem conter atributos pessoais ou sensíveis de imóveis; a prova deve usar somente dados públicos, com proveniência e condições de uso conferidas, e nada privado entra no Git, em issues, PRs ou logs.
- Dados reais podem ser grandes e não devem ser versionados; é preciso decidir onde ficam as evidências reproduzíveis (ver perguntas).
- Fonte pública não garante licença compatível, nem estabilidade de versão.
- Sem validação independente, contagens corretas podem esconder erro de interpretação geoespacial.

## Perguntas em aberto

As sete perguntas foram respondidas pelo responsável em 2026-11-03 (ver "Decisões do responsável"). Permanecem abertas, para o plano, apenas as verificações de fonte listadas ao final dessa seção.

## Decisões do responsável

Respostas de 2026-11-03. Cada item foi proposto pelo agente e aceito, ou completado, pelo responsável.

| # | Pergunta | Decisão |
| :-- | :-- | :-- |
| 1 | Recorte | Território de Mato Grosso, município de **Colniza**; período **agosto, setembro e outubro de 2026**, quando, segundo o responsável, os focos cresceram fortemente em Mato Grosso (afirmação do responsável, ainda não verificada com dados) |
| 2 | Dados | Detecções de calor e limites municipais, para provar contagem e cobertura. Sobreposição com camadas de imóveis ou áreas protegidas fica para uma segunda fase |
| 3 | Fontes | Somente fontes públicas nesta etapa; nenhum dado restrito |
| 4 | Referência independente | Duas camadas: comparar contagens com uma segunda fonte ou segunda ferramenta; conferir manualmente de 10 a 20 casos escolhidos pelo responsável, com mapa ao lado. Sem especialista: avaliam o responsável e o agente |
| 5 | Saídas | Relatório curto de viabilidade em Markdown e scripts reproduzíveis em Node.js. Dados brutos fora do Git, em `local/`; o repositório guarda relatório, scripts, contagens agregadas e proveniência (fonte, versão e data de obtenção) |
| 6 | Critério de sucesso ou descarte | Sem limiares agora. O plano proporá alternativas com exemplos numéricos e o responsável decide (regra analítica, G1). Descarte: reavaliar o ciclo se nenhuma fonte pública viável for identificada |
| 7 | Avaliação, prazo e custo | O responsável avalia, sem prazo fixo por ora; somente ferramentas gratuitas e dados públicos. Serviço pago exigiria decisão prévia do responsável |

Limitação registrada: com avaliação feita só pelo responsável e pelo agente, os scripts e a revisão do agente não são independentes entre si. A independência vem da segunda fonte ou ferramenta e dos casos escolhidos pelo responsável.

Verificações que ficam para o plano, sem decisão tomada:

- Escolher e confirmar as fontes (candidatas do agente, não verificadas: BDQueimadas do INPE ou NASA FIRMS para os focos; malhas territoriais do IBGE para os limites), com licença, versão, cobertura e forma de obtenção.
- Confirmar que as fontes cobrem Colniza em agosto a outubro de 2026 e que o crescimento de focos citado é observável nelas.
- Definir qual é a "segunda fonte ou ferramenta" da referência independente.

## Fora do escopo

Aplicação, interface, autenticação, banco de produção, RLS, migrações, deploy Vercel ou Supabase, escolha final de framework e PostGIS, definição de regras ou pesos da seleção, licença aberta, design system e uso de dados pessoais.

## Critérios para iniciar o planejamento

- Perguntas 1 a 5 respondidas pelo responsável: atendido em 2026-11-03.
- Confirmação de que a prova usará somente dados públicos: atendido em 2026-11-03.
- Autorização explícita ainda pendente: "autorizo o rascunho do plano do ciclo 001".

Critério de descarte: se nenhuma fonte pública viável for identificada, o ciclo é reavaliado (arquivado ou redefinido) antes de qualquer planejamento.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 001 (completo)
Quem: Responsável
Conferir: Decisões do responsável (Colniza, ago a out de 2026, fontes públicas, referência, saídas) e verificações deixadas ao plano
Diga: "autorizo o rascunho do plano do ciclo 001"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 001 + idear + prova_de_dados + e3c785bb461e2246171918e41fac22d82d6cd8cd`
- `effect_class`: `local_mutation`
- `state_before`: ciclo 000 concluído em `main` (`e3c785b`); próximo ciclo `001` livre; nenhuma ideação
- `state_after`: ideação criada em `_project/ideations/001_prova_de_dados.md` e ciclo `001` reservado como `Ideação` em `cycles.md`; respostas do responsável às sete perguntas registradas em 2026-11-03; commits locais em `chore/cycle-001-ideation`; nada publicado
- `result`: `executed`
- `evidence`: leitura de KB-003, ADR-002, ADR-003 e autoridades; testes e validador executados nesta branch
- `blockers`: nenhum para a ideação; o plano exige as respostas do responsável e a frase de autorização do rascunho
