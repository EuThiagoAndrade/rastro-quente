# Ideação — 002: Validação de capacidades, custos e arquitetura

> **Ciclo:** `002`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 002" em 2026-11-05
> **Criado em:** 2026-11-05
> **Última atualização:** 2026-11-05 (decisões do responsável registradas)
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
- O responsável definiu um cenário inicial de protótipo e a restrição de custo zero, registrados abaixo. Permanecem ausentes volumes técnicos projetados, limites e condições atuais verificados, arquitetura e matriz de acesso aprovados. Não se presume capacidade ou gratuidade de qualquer serviço.

## Resultado desejado

Avaliar alternativas gratuitas de capacidade e arquitetura para o cenário do protótipo, identificar evidências e limites de gratuidade e fundamentar a decisão sobre uma fundação técnica posterior. Implementar a fundação não integra o resultado escolhido para este ciclo.

## Hipóteses

Hipóteses para verificar, não decisões:

- H1. Há combinação de capacidades de Vercel, Supabase e autenticação Google adequada aos cenários iniciais e às restrições de acesso.
- H2. É possível atender ao cenário do protótipo sem custos, dentro de limites e condições verificáveis para armazenamento, processamento, tráfego e demais recursos necessários.
- H3. O processamento geoespacial pode ser comparado entre alternativas com base em tarefas concretas, reprodutibilidade, segurança e capacidade, sem decidir regras ambientais nesta ideação.
- H4. Documentação oficial e, se autorizadas posteriormente, provas técnicas controladas podem fornecer evidências complementares; documentação isolada não comprova desempenho no cenário real.

## Alternativas

- A1. **Avaliação antes da fundação:** pesquisar capacidades, custos e opções arquiteturais e propor evidências ou provas controladas; execução da fundação fica para decisão posterior.
- A2. **Avaliação e fundação no mesmo ciclo:** além da avaliação, planejar entregas de fundação, se o responsável definir esse recorte e o plano passar pela revisão e aprovação necessárias. Maior abrangência e mais decisões antecipadas.
- A3. **Avaliação em etapas menores:** primeiro definir cenários e comparar opções documentalmente; decidir depois se e quais provas técnicas justificam novo escopo. Reduz compromisso inicial, mas posterga evidência prática.

O responsável escolheu A1 para este ciclo. Essa escolha não define arquitetura nem autoriza uso de serviços. A2 fica fora do recorte escolhido; A3 permanece uma possível organização da avaliação, sujeita ao plano.

## Riscos e restrições

- **Capacidade e custo:** a prova local não dimensiona requisições ou dados estaduais. Verificar em fontes oficiais, na data da avaliação, limites gratuitos, elegibilidade, condições de uso, exigências de cobrança, comportamento ao exceder cotas e riscos de custo; declarar premissas e incertezas. Se custo zero não puder ser sustentado ou comprovado, apresentar a limitação ao responsável, sem contratar ou aceitar cobrança.
- **G1:** processamento, projeção, geometrias e contagens podem alterar resultados. Comparações que envolvam método exigem referências independentes e proveniência; decisões de regra analítica ambiental pertencem ao responsável, com alternativas e exemplos numéricos.
- **G2:** autenticação não substitui autorização. Papéis, dados compartilhados e isolamento precisam de matriz e testes de acesso permitido e negado antes de uma fundação operacional.
- **G3 e segredos:** fontes públicas não autorizam reproduzir atributos pessoais. Não versionar credenciais ou dados restritos; provas, se aprovadas, devem usar dados apropriados e preservar privacidade.
- **G4:** qualquer migração versionada futura é corrigida por nova migração; nenhuma é proposta agora.
- **Dependências e limites:** a escolha de arquitetura depende do recorte de produto e de carga; acesso a contas, configuração de provedores, gastos e deploy dependem de autorizações e ações próprias. Modo contínuo é proibido neste ciclo completo.

## Perguntas em aberto

1. **Evidências:** quais verificações documentais e eventuais provas técnicas controladas seriam necessárias, com quais critérios de suficiência ou inviabilidade? Qualquer prova exige escopo e autorização adequados.
2. **Volume e carga:** quais fontes e camadas cabem no recorte, quantos registros e quanto armazenamento e processamento podem ser necessários para até dois anos em Mato Grosso? A frequência exata das atualizações sob demanda ainda não foi informada.
3. **Segurança e operação:** embora o protótipo tenha apenas o usuário do responsável, quais dados exigem acesso restrito e quais expectativas de disponibilidade, recuperação e ambientes devem orientar a avaliação?
4. **Processamento:** quais operações e prazos de atualização devem ser avaliados primeiro? O ciclo 001 sustenta um recorte de contagem, mas não resolve seleção de áreas nem garante outras camadas ou escalas.

As respostas podem ser parciais; alternativas e premissas remanescentes devem ser explicitadas antes de submeter o plano a aprovação.

## Decisões do responsável

Respostas de 2026-11-05 às perguntas da ideação:

| Assunto | Decisão |
| :-- | :-- |
| Recorte | Avaliar arquitetura, capacidades e custos; deixar a implementação para depois (A1). |
| Custo | Somente opções gratuitas; o responsável não pretende envolver custos neste projeto. |
| Usuários | Neste momento, somente o próprio responsável; trata-se de um protótipo. |
| Território | Estado de Mato Grosso. |
| Histórico e atualização | No máximo dois anos de dados no protótipo, com atualizações sob demanda. |

Essas escolhas não comprovam que as cotas gratuitas sejam suficientes nem definem fontes adicionais, frequência de atualização, volume, papéis futuros ou arquitetura. Se um requisito não puder ser atendido sem custo, a avaliação deve informar o responsável e explicitar os limites para decisão.

## Fora do escopo

Implementar a fundação, aplicação, banco, RLS, importação ou autenticação; contratar serviços ou aceitar custos. Por esta autorização de ideação também estão fora configurar contas, gerar credenciais, publicar ou fazer deploy; escolher arquitetura definitiva ou regra analítica; utilizar dados privados. A eventual avaliação de provas técnicas depende do plano e das autorizações aplicáveis.

## Critérios para iniciar o planejamento

- Responsável define o recorte e o resultado esperado do ciclo, incluindo a relação entre avaliação e fundação: atendido pelas decisões registradas.
- Cenários de uso e custo são informados ou explicitamente tratados como faixas e incertezas a detalhar no plano; restrições relevantes de acesso e evidência são identificadas: cenário inicial e custo zero definidos; detalhes remanescentes devem ser tratados no plano.
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
- `logical_key`: `rastro-quente + 002 + idear + validacao_arquitetura + 1efcf80a21b67032626c91a95fcf0cbbed842fdb`
- `effect_class`: `local_mutation`
- `state_before`: ciclo 002 reservado como `Ideação`, ideação registrada no commit local `1efcf80a21b67032626c91a95fcf0cbbed842fdb`, com perguntas de recorte, custo e cenário pendentes.
- `state_after`: respostas do responsável registradas na ideação local; ciclo 002 permanece em `Ideação`, próximo ciclo 003; publicação não realizada.
- `result`: `executed`
- `evidence`: autorização inicial e respostas do responsável de 2026-11-05 registradas; template e workflow de ideação consultados; estado local e commit de origem conferidos.
- `blockers`: nenhum para registrar as respostas; rascunho depende de autorização específica; detalhes de volume, segurança, processamento e evidências permanecem em aberto para o planejamento.
