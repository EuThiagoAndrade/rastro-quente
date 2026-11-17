---
title: "Visão de produto e requisitos"
tags:
  - governança
author: "Codex; modelo exato não registrado"
module: "produto"
last_updated: "2026-11-17"
origin_cycle: "000"
---

# KB-003: Visão de produto e requisitos

## Finalidade

Apresentar o propósito e os limites do Rastro Quente sem exigir leitura dos materiais privados ou do histórico de execução.

## Limite de autoridade

Requisitos de referência; não escolhe arquitetura geoespacial, fontes de dados, limiares, pesos, regras legais ou processamento. Não autoriza implementação.

## Conteúdo

O produto apoia a análise territorial de detecções de calor e a seleção explicável de áreas para avaliação técnica. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Qualquer futura seleção deverá permitir explicar método, origem/versão dos dados e limitações.

Vercel, Supabase e autenticação Google são requisitos definidos. A arquitetura e o recorte adotados para o protótipo estão na seção do ciclo 003. O mockup privado serviu de referência visual delimitada.

O ciclo 000 entregou governança, tooling e conhecimento documental. O ciclo 001 acrescentou scripts de prova de dados e um relatório de viabilidade. Materiais privados permanecem em `local/`.

O ciclo 001 fez a prova de dados de Colniza (MT), de agosto a outubro de 2026, com scripts em `scripts/prova-dados/` (Node, sem dependências; `npm run test:prova-dados`) e relatório em `_project/executed/001_prova_de_dados/001_research_viabilidade.md`. Conclusão: **viável** para o critério definido no ciclo (fontes com uso permitido, lacunas conhecidas ≤ 3 dias, contagens que concordam com uma segunda fonte em pelo menos 2 de 3 meses, casos manuais conferindo ≥ 90%). Resultado medido: 824 focos do satélite de referência `AQUA_M-T` no município (516, 246 e 62 em agosto, setembro e outubro); série VIIRS do INPE concordando com o NASA FIRMS nos 3 meses (diferença máxima 4,85%); 15 de 15 casos conferidos. Isso mostra que as fontes públicas reproduzem contagens coerentes em Colniza. Não define regra de seleção de áreas.

Fatos do ciclo 001 que as próximas etapas devem respeitar:
- **Satélite de referência e meses:** `AQUA_M-T` (MODIS, passagem da tarde) é a série principal; VIIRS e demais satélites são auxiliares. O mês é contado pelo instante GMT do registro (sensibilidade com UTC−4 registrada no relatório). Colniza fica no fuso `America/Cuiaba`, sem horário de verão no período.
- **Território:** polígono municipal do IBGE (API v4, revisão 2025); ponto na borda conta como dentro. O INPE guarda o município de cada foco pela própria base de limites, que coincidiu com o IBGE nos pontos conferidos perto da divisa, sem garantia para o resto do limite.
- **Cobertura:** um dia sem registro não prova ausência de fogo nem cobertura; detecção e disponibilidade são atributos separados. Um aviso do INPE de 2026-08-12 deixou esse dia com incidência indeterminada.
- **Segunda fonte:** NASA FIRMS (VIIRS, NRT; a versão SP termina em 2026-07-31, então o período só existe como NRT). Exige `MAP_KEY` pessoal, nunca versionada. Registros só do INPE entre 2026-10-09 e 2026-10-20 não têm causa determinada.
- **Limites da evidência:** os 15 casos foram conferidos pelo agente, a pedido do responsável, e não por pessoa, e usando a base de limites do INPE para a posição; a comparação com o FIRMS valida o processamento da série VIIRS, não a observação física. Os crescimentos mensais não apareceram nos dados (queda de agosto a outubro).
- **Dados e privacidade:** brutos, saídas e imagens ficam em `local/prova-dados/`, fora do Git. O repositório versiona só scripts, fixtures fictícias, o relatório e `casos.json` (dados públicos do INPE).

### Avaliação documental de focos e limites IBGE, sem camadas adicionais de sobreposição; duração e consumo de processamento indeterminados

O ciclo 002 avalia um protótipo de um usuário em Mato Grosso, com janela variável de até dois anos, atualização sob demanda e restrição de custo zero. As hipóteses de persistência permanecem separadas: S1 (`AQUA_M-T`), S2 (principal mais VIIRS) e S3 (todos os satélites). Nenhuma foi escolhida para a fundação.

O parecer compara processamento local com publicação de resultados mínimos, Supabase/PostGIS em lotes e funções Vercel com persistência no Supabase. Resultado: **evidência insuficiente nas três alternativas e nos 27 cenários de cada uma**, tanto na carga inicial quanto na operação comum. Volume estadual, armazenamento/índices/cópias, processamento, acesso implementado, recuperação e elegibilidade/custo completo continuam materiais e não comprovados. Só a contagem projetada de um MAU tem compatibilidade isolada e condicional; não prova login seguro ou suficiência do conjunto.

Há incompatibilidades demonstradas para rotas que exijam os CSVs nacionais mensais históricos integrais como objetos Storage Free ou como corpo de entrada de função Vercel. Elas não descartam todos os caminhos de uma alternativa. A proposta local mantém o conjunto completo localmente e uma parcela publicada ainda sem contrato; não se presume redução de volume suficiente para caber na nuvem. Camadas adicionais e seleção de áreas não foram avaliadas.

O relatório do item 3 propõe acessos permitidos/negados para anônimo, responsável autorizado, outro autenticado e executor controlado, além de cinco protocolos de provas futuras. **Nenhuma política, teste de segurança, benchmark ou prova de recuperação foi executada.** Não há arquitetura aceita nem garantia de gratuidade; Vercel, Supabase e login Google permanecem requisitos.

Próximas etapas técnicas exigem definir contrato de dados e acesso, finalidade/elegibilidade, consultas, capacidade e objetivos de operação/recuperação; provas futuras e fundação dependem de triagem, plano e autorizações próprios. O ciclo 002 foi concluído pela integração das três entregas e da PR documental de encerramento em 2026-11-05. As evidências e limites permanecem nos relatórios do ciclo em `executed/`; a conclusão não escolhe arquitetura nem autoriza provas, serviços ou mudanças ambientais. Não se reservam demandas no backlog ou ciclos futuros.

### Protótipo de consulta territorial do ciclo 003

O protótipo está publicado na Vercel Hobby, com Supabase Free e autenticação Google. A primeira versão contém 10.640 detecções `AQUA_M-T` do INPE em 142 municípios de Mato Grosso, de novembro de 2025 a outubro de 2026 em GMT. A aplicação oferece mapa, tabela paginada, filtros de período e município, proveniência e disponibilidade. A contagem principal usa dias GMT. A sensibilidade em `America/Cuiaba` aparece separadamente. A [KB-004](KB-004_metodo_recorte_focos_mt.md) descreve o método.

Uma única conta cadastrada pode consultar os dados. A verificação hospedada confirmou a consulta do responsável, o bloqueio de outra conta Google na interface e a negativa de requisições anônimas na API. O processamento e a atualização são locais, sob demanda. O [runbook](../../docs/runbook.md#11-roteiro-do-item-5--operação-hospedada-atos-do-responsável) registra os tempos, o uso observado e as etapas administrativas. Recuperação de Auth, pausa do destino e disponibilidade contínua permanecem fora do que foi verificado.

### Lentes de seleção do ciclo 004

O protótipo ganhou três lentes de seleção sobre a carga publicada, no estado inteiro e na janela da consulta:

- **concentração:** municípios com mais detecções;
- **recorrência:** células de 0,05° com detecções em 3 ou mais meses GMT;
- **persistência:** células com detecções em 3 ou mais dias GMT seguidos.

Cada destaque traz motivo, evidência, cobertura de disponibilidade e ressalvas. Uma lente indica onde olhar; não é ranking nem prova de incêndio, dano, autoria ou infração. As lentes leem os dados já publicados, sem função ou tabela nova no banco. O contrato e o método estão na [KB-005](KB-005_contrato_lentes_selecao.md).

Na carga vigente e na janela inteira, a concentração destaca 10 municípios, a recorrência 150 células e a persistência 66 sequências. Esses números foram conferidos localmente por SQL independente, e as contagens se repetiram em produção. A verificação hospedada não mediu o tempo pelo procedimento completo; o registro está no encerramento do ciclo.

### Combinação de lentes do ciclo 005

A interface permite combinar de duas a três lentes por célula de 0,05° usando interseção (`e`) ou união (`ou`). A lista paginada e o painel explicam quais critérios destacaram cada célula, com suas evidências, ressalvas e cobertura. A combinação descreve uma seleção para avaliação técnica: não é ranking nem prova de incêndio, dano, autoria ou infração.

A conferência e a medição locais estão no relatório do ciclo. Três configurações de união excederam o orçamento de 20 s no perfil medido; o responsável aceitou esse desvio local e adiou a otimização. A verificação hospedada foi dispensada por decisão do responsável no encerramento, sem resultados de produção observados; este registro não atesta o comportamento hospedado.

### Áreas protegidas reais e lente de sobreposição do ciclo 006

O protótipo incorporou o contexto territorial de unidades de conservação (CNUC/MMA) e terras indígenas (FUNAI):

- **Camada no mapa:** visão geral com polígonos simplificados sob demanda (hachuras e traços distintos por classe), legenda textual, atribuição de fontes e contorno real sob demanda por área.
- **Lente de sobreposição (`sobreposicao-006-v1`):** destaca células de 0,05° que contenham detecções principais dentro de áreas protegidas de cada uma das três classes (proteção integral, uso sustentável e terra indígena), com evidência estruturada, ressalvas de borda/qualidade do polígono e cobertura de disponibilidade. Não é ranking nem prova de infração, dano ou autoria, e não indica situação fundiária.
- **Persistência e isolamento (ADR-008):** tabelas `areas` e `deteccoes_areas` em `public` sob RLS, com integridade garantida pelo protocolo transacional de publicação da carga.
- **Conferência e medição:** conferência independente por SQL célula a célula na carga real local (`conferir:sobreposicao`), sem divergências. Medição local de terra indígena excedeu o orçamento de tempo (42,3 s para 20,0 s) devido às 51 consultas de disponibilidade municipal; desvio aceito pelo responsável com progresso visível. A verificação em produção foi dispensada pelo responsável no encerramento, sem resultados hospedados observados; este registro não atesta o comportamento em produção.

### Interface base do ciclo 007

A interface passou a seguir a referência visual V13, com o contrato em `DESIGN.md`:

- **Tela:** três colunas no computador (filtros, mapa com série e cartões, resultado com as abas "Destaques" e "Municípios"); uma coluna no celular; temas claro e escuro (preto).
- **Recorte único:** período e município valem para o mapa, a série, os municípios e as lentes.
- **Mapa:** todos os pontos do recorte, limites municipais por padrão, densidade por célula (contagem, não gravidade), áreas protegidas na legenda, "Lista de focos" como alternativa em texto e mapa ampliado.
- **Mapa-base (ADR-010):** satélite e nomes da Esri com a chave restrita ao domínio, "Sem fundo" sempre disponível e troca automática em falha. A Esri recebe só a região vista e a origem do site; nenhum número depende do fundo.
- **Verificação em produção:** executada em 2026-11-15 com todos os itens aprovados (satélite, "Sem fundo" sem novos pedidos, município, lente, célula e CSP). A leitura direta do cabeçalho `Referer` não foi possível; a política de referência e a aceitação da chave restrita foram conferidas.

### Comparação e agentes do ciclo 008

- **Comparação sem IA (KB-007):** dois períodos de mesma duração no mesmo recorte, ou dois municípios no mesmo período, com a mesma lente nos dois lados (`comparacao-008-v1`). Entrou, saiu e permaneceu nos destaques observados vão de A para B; zero, ausência e disponibilidade ficam separados; nada é ajustado para caber.
- **Função no servidor (ADR-011):** `/api/explicar` sob o JWT e a RLS do responsável, com um catálogo fechado de ferramentas determinísticas que releem e recalculam os dados no servidor. A chave do Gemini só existe no servidor.
- **Agentes:** um principal e dois subagentes (lentes e evidências; disponibilidade) com chamadas próprias ao Gemini e no máximo 6 chamadas por pergunta. A conferência descarta as afirmações cujos números, datas ou classificações não constem nas evidências citadas. Perguntas de autoria, propriedade, previsão ou dados pessoais são recusadas com texto fixo.
- **Painel:** "Perguntar sobre a tela", com perguntas prontas, texto livre, etapas reais em fluxo, cancelamento e descarte quando a seleção muda.
- **Verificação em produção (2026-11-16 e 2026-11-17):** os agentes foram demonstrados com o Gemini real no domínio hospedado; acesso anônimo, recusa e cancelamento foram conferidos. A qualidade das respostas foi insuficiente com dados reais (análises rejeitadas e leituras erradas que passaram na conferência) e foi corrigida pelo pacote da issue #81, sem reverificação exaustiva em produção. A outra conta autenticada (C2) não foi verificada em produção. Detalhes em [008_validation_agentes.md](../executed/008_comparacao_periodos_agentes/008_validation_agentes.md).
- **Limite de produto:** a conferência garante números, não o sentido das frases. Hoje os agentes acrescentam acesso e leitura, não informação nova em relação aos destaques. O responsável decidiu rever o escopo deles depois do ciclo 008.

## Fontes

- Requisitos sintetizados no plano v4 do ciclo 000, revisado por outra LLM na Rodada 3 e objeto da instrução humana local de 2026-10-31. Identificador estável: ciclo `000` em `_project/cycles.md`.
- ADR-002: requisitos de infraestrutura; ADR-003: acesso/privacidade; KB-001: inventário de componentes de origem. Fontes externas, URLs fixadas e blobs constam de KB-001.
- Ciclo `001`: relatório `_project/executed/001_prova_de_dados/001_research_viabilidade.md` e `scripts/prova-dados/fontes.json` (URLs, datas de acesso, tamanhos e SHA-256 das fontes de focos, malha e FIRMS).
- Ciclo `002`: [cenários](../executed/002_validacao_arquitetura/002_research_cenarios.md), [capacidades e custos](../executed/002_validacao_arquitetura/002_research_capacidades_custos.md) e [parecer de arquiteturas](../executed/002_validacao_arquitetura/002_research_arquitetura.md). As três entregas foram integradas pelas PRs #15, #16 e #17 em 2026-11-05. Fontes oficiais, seções, datas e limites constam dos relatórios. São evidências documentais, sem autoridade para adotar arquitetura ou autorizar provas/serviços.

- Ciclo `003`: issue #24, runbook e ADRs 005 a 007 para banco, carga e interface. A implantação usa as entregas integradas nas PRs #25 a #29.
- Ciclo `004`: [plano](../executed/004_contrato_lentes_selecao/004_plan.md), [conferência e medição](../executed/004_contrato_lentes_selecao/004_research_conferencia_lentes.md) e [encerramento](../executed/004_contrato_lentes_selecao/004_task_closure.md). As entregas foram integradas nas PRs #36 a #38.
- Ciclo `005`: [plano](../executed/005_combinacao_criterios_selecao/005_plan.md), [conferência e medição](../executed/005_combinacao_criterios_selecao/005_research_conferencia_combinacao.md) e [encerramento](../executed/005_combinacao_criterios_selecao/005_task_closure.md). As entregas foram integradas nas PRs #44 e #45; a verificação hospedada foi dispensada pelo responsável e não gerou resultados de produção.
- Ciclo `006`: [plano](../executed/006_areas_protegidas_reais/006_plan.md), [conferência](../executed/006_areas_protegidas_reais/006_research_conferencia_areas.md), [encerramento](../executed/006_areas_protegidas_reais/006_task_closure.md), [KB-006](KB-006_areas_protegidas.md) e [ADR-008](../decisions/ADR-008_persistencia_areas_protegidas.md). As entregas foram integradas nas PRs #53 a #56; a verificação hospedada foi dispensada pelo responsável e não gerou resultados de produção.
- Ciclo `007`: [plano](../executed/007_interface_base/007_plan.md), [encerramento](../executed/007_interface_base/007_task_closure.md), `DESIGN.md`, [ADR-009](../decisions/ADR-009_interface_base.md) e [ADR-010](../decisions/ADR-010_mapa_base_terceiros.md). As entregas foram integradas nas PRs #65 a #69, com as correções da issue #71 (PR #72); verificação hospedada aprovada em 2026-11-15.
- Ciclo `008`: [plano](../executed/008_comparacao_periodos_agentes/008_plan.md), [relatório de validação](../executed/008_comparacao_periodos_agentes/008_validation_agentes.md), [encerramento](../executed/008_comparacao_periodos_agentes/008_task_closure.md), [KB-007](KB-007_comparacao_territorial.md) e [ADR-011](../decisions/ADR-011_funcao_explicacao_servidor.md). As entregas foram integradas nas PRs #82, #83, #85, #86, #87 e #88. A verificação hospedada foi executada, com C2 não executado e C9 parcial.

## Histórico

| Data | Ciclo | Alteração |
| :-- | :-- | :-- |
| 2026-10-31 | `000` | Síntese formal autossuficiente, sem leitura/cópia do brainstorm |
| 2026-11-04 | `001` | Resultado e limites da prova de dados de Colniza (conclusão de viabilidade com ressalvas) e fatos que as próximas etapas devem respeitar |
| 2026-11-05 | `002` | Comparação documental de três alternativas para S1/S2/S3, insuficiência nos 27 cenários por alternativa, incompatibilidades de rotas específicas, proposta de acesso e provas futuras não executadas; sem arquitetura aceita; ciclo concluído pela PR própria de encerramento |
| 2026-11-10 | `003` | Recorte, funcionamento e limites verificados do protótipo hospedado |
| 2026-11-11 | `004` | Lentes de seleção (concentração, recorrência e persistência), limites e verificação hospedada parcial |
| 2026-11-12 | `005` | Combinação explicável por interseção ou união; desvio de desempenho local aceito; verificação hospedada dispensada, sem resultados de produção |
| 2026-11-14 | `006` | Contexto de áreas protegidas reais (CNUC/FUNAI), camada territorial, lente de sobreposição e persistência sob RLS; verificação hospedada dispensada |
| 2026-11-15 | `007` | Interface base da V13 com `DESIGN.md`, lentes no recorte, densidade, série, "Lista de focos", painéis do mapa e mapa-base de satélite da Esri; verificação hospedada aprovada |
| 2026-11-17 | `008` | Comparação determinística de períodos e municípios, função autenticada no servidor, agente principal e dois subagentes Gemini, painel de perguntas e verificação hospedada com o pacote de confiabilidade; escopo dos agentes a rever |
