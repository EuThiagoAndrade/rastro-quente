# Ideação — 002: Validação de capacidades, custos e arquitetura

> **Ciclo:** `002`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 002" em 2026-11-05
> **Criado em:** 2026-11-05
> **Última atualização:** 2026-11-05
> **handoff_schema_version:** `2`

## Problema

O produto precisa de uma base técnica capaz de receber, processar e disponibilizar dados territoriais com segurança e explicação. A prova do ciclo 001 verificou um recorte de dados, mas não demonstrou capacidade, custo ou adequação de uma arquitetura operacional. Sem cenários de uso e evidências, escolher serviços, processamento ou controles de acesso seria prematuro.

## Origem no backlog

Não se aplica. Demanda direta do responsável; nenhum ID do backlog foi selecionado.

## Contexto e evidências

- A KB-003 e a ADR-002 definem Vercel, Supabase e autenticação Google como requisitos. Framework, planos, custos, papéis, capacidade, volumes, PostGIS e processamento permanecem em aberto; esses requisitos não constituem arquitetura detalhada aprovada.
- O ciclo 001 concluiu pela viabilidade para seus critérios e recorte de Colniza, agosto a outubro de 2026. Essa evidência não comprova escala, custo, cobertura geral ou uma regra de seleção de áreas. As limitações e fatos de fonte, tempo e território estão na KB-003 e no relatório do ciclo.
- Segundo a KB-003, não há aplicação operacional, banco, autenticação ou importador; o ciclo 001 acrescentou scripts e relatório de prova de dados. O mockup privado não é baseline.
- ADR-003 e G3 restringem dados pessoais e operacionais: não entram em commits, issues, PRs, logs ou fixtures; dados compartilhados exigem análise de acesso própria. G1 rege método e interpretação; G2 rege autenticação, autorização e isolamento. G4 exige migrações aditivas quando existirem.
- Ausentes até aqui: cenários de usuários e carga, volumes projetados, limites e preços atuais verificados, orçamento, arquitetura e matriz de acesso aprovados. Não se presume capacidade ou custo de qualquer plano.

## Resultado desejado

Definir, com o responsável, um recorte de avaliação que permita comparar alternativas, identificar evidências faltantes e fundamentar decisões de capacidade, custo e arquitetura. A avaliação poderá orientar uma fundação técnica posterior, sem pressupor sua implementação neste ciclo.

## Hipóteses

Hipóteses para verificar, não decisões:

- H1. Há combinação de capacidades de Vercel, Supabase e autenticação Google adequada aos cenários iniciais e às restrições de acesso.
- H2. É possível estimar custos úteis a partir de cenários explícitos de usuários, volume, armazenamento, processamento e tráfego, documentando limites e incertezas.
- H3. O processamento geoespacial pode ser comparado entre alternativas com base em tarefas concretas, reprodutibilidade, segurança e capacidade, sem decidir regras ambientais nesta ideação.
- H4. Documentação oficial e, se autorizadas posteriormente, provas técnicas controladas podem fornecer evidências complementares; documentação isolada não comprova desempenho no cenário real.

## Alternativas

- A1. **Avaliação antes da fundação:** pesquisar capacidades, custos e opções arquiteturais e propor evidências ou provas controladas; execução da fundação fica para decisão posterior.
- A2. **Avaliação e fundação no mesmo ciclo:** além da avaliação, planejar entregas de fundação, se o responsável definir esse recorte e o plano passar pela revisão e aprovação necessárias. Maior abrangência e mais decisões antecipadas.
- A3. **Avaliação em etapas menores:** primeiro definir cenários e comparar opções documentalmente; decidir depois se e quais provas técnicas justificam novo escopo. Reduz compromisso inicial, mas posterga evidência prática.

As alternativas são propostas para discussão, não uma escolha de arquitetura nem autorização para uso de serviços.

## Riscos e restrições

- **Capacidade e custo:** a prova local não dimensiona usuários, requisições ou dados futuros. Preços, limites, elegibilidade e condições comerciais devem ser conferidos em fontes oficiais na data da avaliação; estimativas devem mostrar premissas, excedentes e incerteza.
- **G1:** processamento, projeção, geometrias e contagens podem alterar resultados. Comparações que envolvam método exigem referências independentes e proveniência; decisões de regra analítica ambiental pertencem ao responsável, com alternativas e exemplos numéricos.
- **G2:** autenticação não substitui autorização. Papéis, dados compartilhados e isolamento precisam de matriz e testes de acesso permitido e negado antes de uma fundação operacional.
- **G3 e segredos:** fontes públicas não autorizam reproduzir atributos pessoais. Não versionar credenciais ou dados restritos; provas, se aprovadas, devem usar dados apropriados e preservar privacidade.
- **G4:** qualquer migração versionada futura é corrigida por nova migração; nenhuma é proposta agora.
- **Dependências e limites:** a escolha de arquitetura depende do recorte de produto e de carga; acesso a contas, configuração de provedores, gastos e deploy dependem de autorizações e ações próprias. Modo contínuo é proibido neste ciclo completo.

## Perguntas em aberto

1. **Recorte:** prefere A1, A2, A3 ou outro resultado? Que decisões devem estar prontas ao fim do ciclo?
2. **Uso e escala:** quantos usuários simultâneos e totais, quais papéis, abrangência territorial, histórico de dados, frequência de atualização e crescimento são razoáveis como cenários inicial e de expansão? Valores desconhecidos podem ser expressos como faixas para comparação.
3. **Custos:** há teto mensal ou preferência por opções gratuitas? Qual moeda, margem e política para custos variáveis? Comparar serviços pagos não autoriza contratação.
4. **Evidências:** uma comparação documental é suficiente inicialmente ou deseja propor provas técnicas controladas e seus critérios? O que caracterizaria evidência suficiente ou inviabilidade?
5. **Segurança e operação:** que tipos de usuário e dados precisam de acesso compartilhado ou restrito? Quais expectativas de disponibilidade, recuperação e ambientes devem orientar a avaliação?
6. **Processamento:** quais operações e prazos de atualização devem ser avaliados primeiro? O ciclo 001 sustenta um recorte de contagem, mas não resolve seleção de áreas nem garante outras camadas ou escalas.

As respostas podem ser parciais; alternativas e premissas remanescentes devem ser explicitadas antes de submeter o plano a aprovação.

## Fora do escopo

Por esta autorização de ideação: implementar aplicação, banco, RLS, importação ou autenticação; configurar contas, contratar serviços, gerar credenciais, publicar ou fazer deploy; escolher arquitetura definitiva, plano comercial ou regra analítica; utilizar dados privados. A abrangência do ciclo a ser planejado ainda depende da decisão do responsável e da governança.

## Critérios para iniciar o planejamento

- Responsável define o recorte e o resultado esperado do ciclo, incluindo a relação entre avaliação e fundação.
- Cenários de uso e custo são informados ou explicitamente tratados como faixas e incertezas a detalhar no plano; restrições relevantes de acesso e evidência são identificadas.
- O responsável autoriza o rascunho do plano pela frase do próximo passo. Nenhuma aprovação de plano ou implementação é presumida.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 002 (completo)
Quem: Responsável
Conferir: Perguntas e decisões da ideação em _project/ideations/002_validacao_arquitetura.md
Diga: "autorizo o rascunho do plano do ciclo 002"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 002 + idear + validacao_arquitetura + 28dece5b5391cc9e7176a2f8c4020f5e05c1c34a`
- `effect_class`: `local_mutation`
- `state_before`: `main` local e remota em `28dece5b5391cc9e7176a2f8c4020f5e05c1c34a`; ciclo 001 concluído; próximo ciclo 002; sem ideação 002 encontrada.
- `state_after`: ciclo 002 reservado como `Ideação` em `cycles.md` e ideação registrada localmente na branch `chore/cycle-002-ideation`; próximo ciclo 003; publicação não realizada.
- `result`: `executed`
- `evidence`: autorização inicial registrada; KB-003, ADR-002, ADR-003, ciclo 001, template e workflow consultados; conferência de branch e main remotas pelo GitHub CLI.
- `blockers`: nenhum para registrar a ideação; perguntas de recorte e cenários pendentes para orientar o planejamento.
