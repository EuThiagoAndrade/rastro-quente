# Ideação — 003: Fundação e implementação do protótipo

> **Ciclo:** `003`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 003" em 2026-11-05
> **Criado em:** 2026-11-05
> **Última atualização:** 2026-11-05
> **handoff_schema_version:** `2`

## Problema

Os ciclos `001` e `002` estabeleceram a viabilidade da contagem em um recorte municipal (Colniza, agosto a outubro de 2026) e mapearam documentalmente os limites gratuitos e riscos de Vercel, Supabase e autenticação Google para um protótipo de um usuário em Mato Grosso com até dois anos de dados. Porém, ainda não existem aplicação, banco, autenticação, controle de acesso ou importador estadual, e a avaliação documental mostrou que capacidade, custo zero e regra de seleção de áreas não podem ser comprovados sem decisões de recorte e verificações práticas delimitadas.

Precisamos definir apenas as decisões de produto, método (G1), acesso/privacidade (G2/G3) e operação em custo zero necessárias para escrever **um único plano de implementação**, absorvendo como entregas e gates do próprio plano as verificações práticas pendentes, sem repetir ciclos puramente documentais.

## Origem no backlog

Não se aplica. Demanda direta do responsável em 2026-11-05; `_project/backlog.md` está vazio e nenhum ID foi selecionado.

## Contexto e evidências

Fatos estabelecidos e verificados no repositório (`main` em `78267a7`):

- **Propósito e limite de domínio (KB-003, G1):** o produto apoia a análise territorial de detecções de calor e a seleção explicável de áreas para avaliação técnica. Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Qualquer seleção deve explicar método, origem/versão dos dados e limitações.
- **Requisitos fixos (ADR-002, ADR-003, KB-003):** Vercel, Supabase e autenticação Google são obrigatórios; o cenário do protótipo é de **1 usuário (o responsável)**, território de **Mato Grosso (UF 51)**, janela de **até 2 anos**, **atualização sob demanda** e **restrição de custo zero**. O repositório é privado; `local/` permanece ignorado por Git e Vercel; o mockup privado não é contrato visual nem baseline.
- **Evidências do ciclo `001` (`001_research_viabilidade.md`):**
  - Fontes públicas validadas para o trimestre ago–out/2026 em Colniza: CSVs mensais nacionais do INPE (~104 a 144 MB por mês, ~371 MB no trimestre) e malha municipal IBGE v4 (revisão 2025).
  - Contagens medidas em Colniza no trimestre: série principal `S1` (`AQUA_M-T`, polígono IBGE, GMT) = **824** registros (516, 246 e 62); série `S2` (`AQUA_M-T` + VIIRS `NPP-375`, `NPP-375D`, `NOAA-20` e `NOAA-21`) = **17.684** registros (21,5× `S1`); série `S3` (todos os satélites, incluindo `GOES-19`) = **29.735** registros (36,1× `S1`). No estado de Mato Grosso (`estado_id = 51`), `AQUA_M-T` somou **6.416** registros no mesmo trimestre.
  - Detecção e disponibilidade são atributos independentes: dias sem registro não provam ausência de fogo nem cobertura; avisos do INPE (como o de `2026-08-12`) exigem classificação explícita de lacuna/incidência.
- **Evidências e restrições do ciclo `002` (`002_research_cenarios.md`, `002_research_capacidades_custos.md`, `002_research_arquitetura.md`):**
  - As três arquiteturas avaliadas (`A1`: processamento local com publicação no Supabase; `A2`: processamento em lotes no Supabase/PostGIS; `A3`: processamento em funções Vercel com persistência no Supabase) tiveram **evidência insuficiente** nos 27 cenários por falta de medição do volume estadual de até 2 anos e do tempo/consumo de processamento.
  - **Incompatibilidades comprovadas de rota:** gravar CSVs nacionais mensais brutos (> 100 MB) como objetos inteiros no Supabase Storage Free (limite de 50 MB por arquivo) ou enviá-los no corpo de entrada de funções Vercel (limite de 4,5 MB).
  - **Restrições materiais das modalidades gratuitas:** Vercel Hobby exige uso pessoal não comercial (limites: 100 GB Fast Data Transfer, 10 GB Origin Transfer, 1.000.000 invocações, 4 CPU-h, 360 GB-h, até 300 s/invocação com Fluid Compute); Supabase Free não tem Spend Cap configurável, limita o banco lógico a 500 MB (regra conservadora por projeto e soma organizacional), disco a 2 GB, egress a 5 GB uncached + 5 GB cached, pausa projetos após 7 dias de inatividade e não oferece backups diários gerenciados nem branching gratuito.

## Resultado desejado

Deixar decidido o escopo mínimo e as escolhas humanas necessárias para redigir **um único plano de implementação do ciclo `003`** que entregue o primeiro recorte operacional e verificável do protótipo (banco com RLS, autenticação Google restrita ao responsável, ingestão controlada de Mato Grosso e interface web de consulta/análise na Vercel), incorporando as verificações de volume, capacidade, acesso e recuperação como entregas e pontos de parada dentro do próprio plano.

## Hipóteses

Hipóteses a validar durante a execução das entregas do plano (nenhuma é assumida como fato):

- **H1.** O volume de até 2 anos de focos de Mato Grosso (ao menos em `S1` ou `S2`, ou em agregados + janela recente de pontos) cabe com folga de segurança dentro dos 500 MB lógicos e 2 GB de disco do Supabase Free.
- **H2.** Filtrar os arquivos públicos do INPE para Mato Grosso antes da persistência no Supabase (seja por CLI/script local autorizado ou por ingestão particionada) elimina os gargalos de 50 MB do Storage e de 4,5 MB / 4 CPU-h da Vercel sem custo financeiro.
- **H3.** Políticas RLS baseadas na identidade autenticada do responsável (`RP`) e migrações aditivas (G4) permitem isolar leitura e escrita no Supabase Free, negando acesso a anônimos (`AN`) e a outros usuários autenticados (`OA`).
- **H4.** Como os insumos do INPE e do IBGE são públicos e verificáveis por SHA-256, a recuperação de desastres e a retomada após pausa de 7 dias no Supabase Free podem ser atendidas por migrações versionadas + reexecução idempotente da carga ou dump lógico local, sem exigir backups pagos.

## Alternativas

As opções abaixo agrupam apenas as escolhas que alteram materialmente o plano de implementação e dependem de decisão do responsável:

### 1. Primeiro resultado utilizável do protótipo e critério de aceite (Foco 1)

| Opção | Escopo do primeiro resultado utilizável | Como será aceito | Consequência para o plano |
| :-- | :-- | :-- | :-- |
| **R1 — Consulta territorial e temporal auditável (sem ranking/seleção automática inicial)** | Aplicação autenticada na Vercel + Supabase com RLS + pipeline sob demanda exibindo contagens, cobertura/lacunas e registros de focos por município e período em MT, com proveniência explícita | Login exclusivo do responsável (`RP`), testes de acesso permitido/negado (G2), contagens estaduais/municipais batendo com os casos de referência (G1) e deploy funcional em custo zero | Menor risco analítico inicial; entrega toda a fundação operacional primeiro e deixa a regra de seleção de áreas para a última entrega ou ciclo seguinte |
| **R2 — Consulta territorial + seleção explicável de áreas já no primeiro resultado** | Tudo de R1 mais uma visão/painel que ordena ou filtra municípios/áreas de MT para avaliação técnica segundo uma regra explícita decidida pelo responsável, exibindo memória de cálculo e limitações | Mesmos critérios de R1 + validação determinística da regra de seleção contra fixtures e casos de referência independentes (G1) | Entrega a proposta completa da KB-003 num único plano, mas exige decidir a regra analítica de seleção (ver item 3.2) antes da aprovação do plano |

### 2. Dados, arquitetura de ingestão e fluxos de uso do primeiro recorte (Foco 2)

#### 2.1 Conjunto de detecções persistido no banco (G1 e capacidade)

Exemplo numérico real medido no ciclo `001` (Colniza, trimestre ago–out/2026) para ilustrar o impacto de volume entre as opções:

| Opção | Série(s) persistida(s) | Registros em Colniza (3 meses) | Proporção no exemplo | Consequência analítica e de capacidade |
| :-- | :-- | --: | --: | :-- |
| **S1 — Somente satélite de referência** | `AQUA_M-T` (MODIS, passagem da tarde) | 824 | 1,0× | Série oficial do INPE para comparação temporal entre meses/anos; ~6.416 registros no trimestre em MT (`estado_id = 51`). Menor consumo de banco, índices e egress |
| **S2 — Referência + VIIRS (séries separadas)** | `AQUA_M-T` + `NPP-375`, `NPP-375D`, `NOAA-20`, `NOAA-21` | 17.684 | 21,5× | Mantém `S1` para série histórica e adiciona detecções de 375 m para detalhamento espacial, sem fundir registros em "incêndios"; multiplica em ~20× o armazenamento e o tempo de carga |
| **S3 — Todos os satélites do catálogo** | Todos os valores de `satelite` publicados pelo INPE (inclui geoestacionários como `GOES-19`) | 29.735 | 36,1× | Preserva todas as passagens brutas, mas infla contagens por repetição diária do mesmo evento e eleva o risco de exceder 500 MB do Supabase Free em 2 anos de MT |

#### 2.2 Executor da ingestão e atualização sob demanda (Arquitetura)

| Opção | Funcionamento do fluxo de carga | Consequência operacional e de limites gratuitos |
| :-- | :-- | :-- |
| **I1 — Ingestão por script/CLI local autorizado (`A1`/`A2` híbrido)** | O responsável dispara sob demanda um comando Node.js local (evolução de `scripts/prova-dados/`) que baixa os CSVs do INPE/malha IBGE em `local/`, confere SHA-256, filtra MT, aplica a atribuição territorial e grava em lotes transacionais no Supabase usando credencial administrativa local | Contorna os limites de 50 MB do Storage e de 4,5 MB / 300 s / 4 CPU-h da Vercel; mantém os brutos fora da nuvem; exige computador local apenas no momento de atualizar a base |
| **I2 — Ingestão no Supabase/PostGIS acionada por lotes externos (`A2`)** | Script leve envia apenas os registros de MT já pré-filtrados do CSV para uma tabela de staging no Supabase, e funções SQL/PostGIS executam a validação espacial (`ST_Covers`), índices e publicação da versão | Transfere o cálculo geométrico para o PostgreSQL/PostGIS hospedado, mas depende da CPU compartilhada, 500 MB RAM e disco de 2 GB do Supabase Free |
| **I3 — Ingestão por função serverless na Vercel acionada pela interface (`A3`)** | Botão na interface web dispara função Vercel que baixa fontes públicas em streaming, filtra MT e grava no Supabase | Dispensa rodar CLI local nas atualizações, mas fica sujeito ao teto de 300 s por invocação, 2 GB de memória e 4 CPU-h mensais do Vercel Hobby, podendo falhar na carga histórica de 24 meses |

### 3. Decisões de método geoespacial (G1), acesso (G2) e privacidade (G3) (Foco 3)

#### 3.1 Regra territorial e temporal para Mato Grosso (G1)

Exemplo numérico fictício em Mato Grosso num mês: o CSV traz `1.000` registros com `estado_id = 51` (`992` caem dentro dos polígonos municipais IBGE v4 de MT e `8` caem fora da divisa estadual); há ainda `3` registros com outro `estado_id` que caem dentro do polígono de MT; na virada do mês, `15` registros ocorrem entre `00:00Z` e `03:59Z` do dia 1 (ainda mês anterior em Cuiabá, `UTC−4`).

| Opção | Regra territorial e de fuso | Resultado no exemplo fictício | Consequência |
| :-- | :-- | :-- | :-- |
| **T1 — Polígono IBGE v4 + GMT como principal, com divergências e sensibilidade `UTC−4` (padrão do ciclo `001`)** | Pertencimento ao município/estado pela malha IBGE v4 (ponto na borda = dentro), relatando a diferença simétrica contra `municipio_id`/`estado_id`; mês em GMT como principal e `America/Cuiaba` (`UTC−4`) como sensibilidade | **995** registros no mês principal (`992 + 3`), **11** divergências territoriais declaradas (`8 + 3`) e diferença de **15** registros na fronteira de fuso | Mantém exata continuidade metodológica com o ciclo `001`; exige carregar a malha dos 142 municípios de MT (~v4 IBGE) e os registros de `00:00Z–04:00Z` do dia seguinte ao fim da janela |
| **T2 — Campo `municipio_id`/`estado_id` do INPE + GMT (sem reclassificação por polígono na carga)** | Usa a atribuição municipal/estadual já calculada pelo INPE no CSV e contagens apenas em GMT; a malha IBGE serve apenas para exibição visual no mapa | **1.000** registros no mês principal | Simplifica a ingestão e dispensa cálculo ponto-no-polígono para todo o estado, mas não detecta divergências entre a base de limites do INPE e a malha IBGE v4 |

#### 3.2 Regra de seleção/priorização explicável de áreas (G1 — aplicável se R2 for escolhido)

Exemplo numérico fictício para 3 municípios de MT numa janela de 30 dias na série `S1`:
- **Município A** (área `25.000 km²`): `150` focos no período, distribuídos em `6` dias com detecção (período anterior equivalente: `100` focos); `0` dias com lacuna de cobertura.
- **Município B** (área `2.500 km²`): `60` focos no período, distribuídos em `18` dias com detecção (período anterior equivalente: `20` focos); `0` dias com lacuna de cobertura.
- **Município C** (área `5.000 km²`): `40` focos no período, distribuídos em `5` dias com detecção (período anterior: `25` focos); `4` dias com lacuna conhecida/indeterminada de imageamento.

| Opção de regra analítica | Fórmula / critério de ordenação e seleção | Ranking e valores no exemplo fictício | Consequência analítica |
| :-- | :-- | :-- | :-- |
| **M1 — Contagem bruta de focos na janela** | Ordena decrescentemente por $F = \text{total de registros no período}$ | 1º **A** ($150$), 2º **B** ($60$), 3º **C** ($40$) | Transparente e trivial de auditar, mas prioriza sistematicamente municípios de grande extensão territorial |
| **M2 — Densidade territorial de focos** | Ordena por $D = \frac{F}{\text{área\_km}^2} \times 1.000$ (focos por $1.000\text{ km}^2$) | 1º **B** ($24,0$), 2º **C** ($8,0$), 3º **A** ($6,0$) | Corrige a distorção de área e destaca concentração espacial, mas pode elevar municípios pequenos com eventos pontuais |
| **M3 — Persistência temporal (dias ativos) combinada com densidade ou variação** | Ordena por dias distintos com detecção ($P_d$), desempatando por densidade ($D$) ou variação relativa ($\Delta\% = \frac{F - F_{\text{ant}}}{\max(1, F_{\text{ant}})} \times 100$), e sinaliza obrigatoriamente áreas com lacuna ($C > 0$) | Por persistência: 1º **B** ($18\text{ dias}$, $+200\%$), 2º **A** ($6\text{ dias}$, $+50\%$), 3º **C** ($5\text{ dias}$, $+60\%$, **alerta de 4 dias de lacuna**) | Prioriza recorrência temporal e aceleração recente sem esconder incerteza de cobertura; exige que o responsável defina a ordem dos critérios ou limiar de corte |

## Riscos e restrições

- **Capacidade e custo zero (Foco 4):**
  - *Limite de banco e egress:* a carga de até 2 anos de MT deve parar (`Parado`) antes de escrever no banco remoto se a estimativa no gate local ultrapassar um teto prudente (ex.: 400 MB dos 500 MB do Supabase Free).
  - *Inatividade e recuperação:* projetos Supabase Free pausam após 7 dias sem uso e não possuem backups diários automáticos. O plano deve tratar a base no Supabase como **reconstruível de forma determinística** a partir das migrações versionadas (`supabase/migrations/`, G4) e da reexecução do importador sobre as fontes públicas com hash registrado.
  - *Enquadramento comercial:* o Vercel Hobby exige uso pessoal e não comercial; qualquer exigência de cartão, upgrade ou cobrança interrompe a execução (`Parado`).
- **Barreiras de domínio (G1 a G4):**
  - **G1:** toda contagem, atribuição territorial e eventual regra de seleção exige casos de referência independentes calculados em fixtures fictícias (`tests/fixtures/`), proveniência com SHA-256 e aviso explícito na interface de que focos não comprovam incêndio, dano, autoria ou infração.
  - **G2:** toda tabela em `public` terá RLS ativo. O login Google sozinho não autoriza acesso: as políticas RLS devem restringir leitura ao identificador autorizado do responsável (`RP`), negando anônimos (`AN`) e outros autenticados (`OA`), com escrita exclusiva do executor de carga (`EX`).
  - **G3:** nenhum dado pessoal, atributo sensível de imóvel ou chave (`SUPABASE_SERVICE_ROLE_KEY`, segredo OAuth, `MAP_KEY`) entra no repositório, bundle cliente, logs ou fixtures.
  - **G4:** migrações SQL em `supabase/migrations/AAAAMMDDHHMMSS_assunto.sql` são estritamente aditivas.
- **Organização de entregas e gates dentro de um único plano (Foco 5):**
  - Para não abrir outra rodada de planejamento, os protocolos pendentes do ciclo `002` entram como **gates bloqueantes das próprias issues de implementação**:
    1. *Medição prévia do volume estadual de MT (absorve PF1):* executada na primeira entrega de dados; se o conjunto escolhido (`S1`/`S2`/`S3`) exceder o teto gratuito, o fluxo para e solicita redução de janela/conjunto ao responsável.
    2. *Verificação de elegibilidade, Auth e isolamento RLS (absorve PF3 e PF5):* executada na entrega de fundação Supabase/Vercel, com testes automatizados para `AN`, `RP`, `OA` e `EX`.
    3. *Teste de carga, idempotência e reconstrução (absorve PF2 e PF4):* executado na entrega do importador antes de expor os dados na interface.

## Decisões do responsável — 2026-11-05

Após receber sugestões com motivos e alternativas, o responsável declarou **"Aceito todas as suas sugestões apresentadas."**. A autorização anterior **"autorizo o rascunho do plano do ciclo 003"** permanece vigente. Registrar as seguintes escolhas para o rascunho:

- **R1:** consulta territorial e temporal auditável; seleção/ranking automático de áreas fora deste ciclo. A sugestão condicional M2 para R2 não é ativada pela escolha de R1.
- **S1:** somente `AQUA_M-T`, com **12 meses completos mais recentes disponíveis**; focos INPE e limites municipais IBGE de Mato Grosso, sem outras camadas.
- **I1:** ingestão sob demanda por comando local, com processamento territorial local e publicação controlada no Supabase.
- **T1:** polígonos IBGE como referência territorial, borda incluída, GMT como principal, sensibilidade em `America/Cuiaba` e divergências contra os códigos INPE explícitas.
- **Acesso:** somente o responsável lê por autorização em RLS; anônimos/outros autenticados não leem; escrita somente pelo executor controlado; fontes públicas sem dados pessoais.
- **Operação:** orçamento financeiro zero, parada se a estimativa de banco ultrapassar 400 MB, conferência das demais cotas e teste de reconstrução por migrações/importador; configuração externa de contas pelo responsável. Finalidade real do uso, elegibilidade das contas e cotas disponíveis devem ser verificadas antes de aprovisionamento/deploy, sem presumir que o aceite das recomendações comprova esses fatos. Tempo de recuperação será medido, sem garantia antecipada.
- **Forma de interação:** apresentar sugestão fundamentada antes de cada pergunta, com alternativas para escolha.

**Referência visual e divergência delimitada:** na mesma mensagem, o responsável indicou expressamente `local/prototipo` como inspiração de estilo para o protótipo atual. Essa instrução humana mais recente autoriza a inspeção local restrita aos elementos visuais desse diretório para síntese do estilo, apesar da proibição geral de leitura pela governança em `.agent/ai_behavior.md`. A exceção é somente deste trabalho: não autoriza ler `local/brainstorm`, publicar materiais privados, copiar conteúdo/dados do mockup, adotar suas funcionalidades ou tratá-lo como arquitetura ou design system. O plano deverá registrar diretrizes visuais autossuficientes e sanitizadas.

## Perguntas originais e alternativas

As perguntas abaixo ficam preservadas como histórico. As escolhas acima resolvem o recorte do plano; verificações factuais de conta, capacidade e recuperação serão condições bloqueantes das entregas correspondentes.

Para redigir o plano único de implementação sem suposições, precisamos das suas decisões sobre os 6 pontos abaixo:

1. **Primeiro resultado utilizável e aceite (Foco 1):** prefere **R1** (consulta territorial/temporal autenticada com contagens, cobertura e proveniência, deixando a regra de seleção para etapa seguinte) ou **R2** (incluir já no primeiro resultado uma seleção/ordenação explicável de municípios/áreas)?
2. **Conjunto de dados, janela e camadas do primeiro recorte (Foco 2):**
   - Qual conjunto de detecções persistir inicialmente: **S1** (só referência `AQUA_M-T`), **S2** (`AQUA_M-T` + VIIRS em séries separadas) ou **S3** (todos os satélites)?
   - Qual janela inicial carregar para Mato Grosso (ex.: **12 meses** ou **24 meses** fechados até o último mês completo disponível no INPE)?
   - Confirma que o primeiro recorte terá apenas **focos INPE + limites municipais IBGE de MT**, deixando camadas extras de sobreposição (imóveis, unidades de conservação, terras indígenas) fora deste ciclo?
3. **Caminho de ingestão sob demanda (Foco 2):** prefere **I1** (script/CLI Node.js local autorizado que baixa, filtra MT e publica em lotes no Supabase, evitando os limites de payload e tempo da Vercel), **I2** (pré-filtro local + processamento espacial em SQL/PostGIS no Supabase) ou **I3** (ingestão via função Vercel acionada pela interface, sujeita aos limites de 300 s e 4 CPU-h)?
4. **Método geoespacial e regra analítica (Foco 3 — G1):**
   - Para atribuição territorial e fuso em MT, confirma **T1** (polígono municipal IBGE v4 como principal, GMT como principal com sensibilidade `UTC−4` e registro de divergências, como no ciclo `001`) ou prefere **T2** (usar `municipio_id`/`estado_id` do INPE na carga)?
   - Caso escolha **R2** na pergunta 1, qual regra de seleção/ordenação de áreas deseja adotar: **M1** (contagem bruta $F$), **M2** (densidade por $1.000\text{ km}^2$), **M3** (persistência em dias ativos + densidade/variação com alerta de lacuna) ou outra combinação de critérios/limiares?
5. **Acesso e privacidade (Foco 3 — G2 e G3):** confirma a matriz em que somente a sua conta autenticada (`RP`, validada em RLS no banco) lê os dados do protótipo, qualquer outro login Google (`OA`) e anônimos (`AN`) têm acesso negado, a escrita de dados ocorre apenas pelo executor controlado (`EX`), e somente fontes públicas sem dados pessoais entram no sistema?
6. **Capacidade, custo zero, operação e recuperação (Focos 4 e 5):**
   - Confirma que o uso do protótipo é pessoal e não comercial (elegível ao Vercel Hobby) e que você executará as ações externas de configuração das contas gratuitas (Supabase, Vercel e credencial Google OAuth) quando previstas nas issues do plano?
   - Aceita a política operacional gratuita em que o projeto Supabase Free pode pausar após 7 dias sem uso e a recuperação (RPO/RTO) é garantida por migrações versionadas + reexecução idempotente do importador a partir dos insumos públicos/locais, com parada obrigatória (`Parado`) se a medição prévia na Entrega 1 ultrapassar 80% da cota gratuita de banco (400 MB)?

## Fora do escopo

- Nesta etapa de ideação: redigir ou aprovar o plano de implementação, criar issues, escrever código de aplicação, criar banco/migrações, configurar contas ou fazer deploy.
- No ciclo `003` (salvo decisão contrária explícita do responsável): contratação de planos pagos, uso de cartões/trials com cobrança automática, ingestão permanente do NASA FIRMS (mantido apenas como referência histórica do ciclo `001`), uso de dados pessoais ou restritos de imóveis (G3) e definição de design system definitivo a partir do mockup privado.

## Critérios para iniciar o planejamento

- Decisões do responsável registradas para as perguntas 1 a 6 (ou delimitação explícita do que ficará condicionado ao gate da Entrega 1 no plano).
- Autorização explícita do responsável com a frase canônica `"autorizo o rascunho do plano do ciclo 003"`.
- Critério de descarte/parada: se durante a Entrega 1 do futuro plano for demonstrado que mesmo o menor recorte aceito pelo responsável (`S1` filtrado para MT) viola as cotas gratuitas obrigatórias, a execução para em `"Parado"` antes de aprovisionar carga completa, sem contratar serviços pagos.

## Próximo passo

A autorização para o rascunho foi recebida em 2026-11-05: **"autorizo o rascunho do plano do ciclo 003"**. O aceite posterior das sugestões resolveu o recorte, conforme a seção de decisões acima, e o rascunho único foi criado em `_project/drafts/003_implementacao_prototipo/003_plan.md`. Esse plano é agora o artefato ativo do ciclo em `Planejamento`; verificações factuais permanecem condicionantes das entregas, sem implementação autorizada nesta etapa.

```text
PRÓXIMO PASSO
Situação: Aguardando revisão (rodada 1) — ciclo 003 (completo)
Quem: O responsável leva a vez a um revisor, que pode ser outra ferramenta
Conferir: —
Diga: "revise o plano do ciclo 003"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + rascunhar_plano + 003_plan + v1@23896d64d1724e8d62745f7b1a366f63d6a48b9b`
- `effect_class`: `local_mutation`
- `state_before`: ideação em `Parado`, autorização do rascunho registrada, sem plano; escolhas e orientação visual recebidas do responsável em 2026-11-05.
- `state_after`: decisões e exceção visual delimitada registradas; plano único `v1` em `Rascunho` criado em `_project/drafts/003_implementacao_prototipo/003_plan.md`, ciclo em `Planejamento`, situação `Aguardando revisão (rodada 1)`, branch local `chore/cycle-003-plan`.
- `result`: `executed`
- `evidence`: aceite literal das sugestões registrado acima; referência visual indicada pelo responsável e inspeção estática limitada a CSS/estrutura após registrar a exceção; plano, gates de validação e handoff próprio no novo artefato ativo. Nenhuma publicação remota, issue, implementação ou aprovação do plano realizada.
- `blockers`: nenhum para a redação; revisão formal pendente. Verificações de ambiente, fontes/capacidade, finalidade/elegibilidade e operação estão previstas como condições das entregas, sem afirmar fatos ainda não verificados.

### Registro anterior — rascunho interrompido antes das decisões

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + rascunhar_plano + 003_plan + v1@23896d64d1724e8d62745f7b1a366f63d6a48b9b`
- `effect_class`: `local_mutation`
- `state_before`: ciclo `003` em `Ideação`, sem plano, na branch local `chore/cycle-003-ideation` em `23896d64d1724e8d62745f7b1a366f63d6a48b9b`, com árvore limpa; ideação aguardando autorização e decisões; `main` remota conferida em `78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`.
- `state_after`: autorização humana do rascunho registrada nesta ideação; ciclo permanece em `Ideação`, sem plano; situação `Parado` com pergunta sobre as decisões ausentes. Nenhuma alternativa escolhida, issue criada ou publicação realizada.
- `result`: `not_executed` — rascunho não iniciado por precondição ausente; somente autorização e pendência registradas no artefato ativo.
- `evidence`: mensagem humana de 2026-11-05 reproduzida acima; leitura das autoridades, desta ideação, do workflow `rascunhar_plano`, dos templates `plano_implementacao` e `ideacao`, da KB-003, ADR-002/003/004 e do parecer de arquitetura do ciclo `002`; ausência de plano local e de respostas às perguntas 1 a 6 nos artefatos conferidos. Consulta somente leitura por `gh` após indisponibilidade dos conectores confirmou PR #18 integrada, nenhuma PR aberta do ciclo `003` e base remota inalterada. Node.js `v24.15.0`: 55 testes de governança passaram; validador com zero erros, zero avisos e nove conferências manuais; `git diff --check` sem erros. Diff restrito a este registro, com G3 e autorização conferidos manualmente.
- `blockers`: decisões das perguntas 1 a 6, ou delimitação humana explícita do que ficará condicionado a uma entrega. A autorização de rascunho está atendida e não precisa ser repetida.

### Registro anterior — ideação

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 003 + idear + implementacao_prototipo + 78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`
- `effect_class`: `local_mutation`
- `state_before`: `main` local e remota em `78267a79363aa49286fc1a8e2b7be2a5fe1e9d38`; ciclos `000`, `001` e `002` em `Concluído`; próximo ciclo `003`; nenhuma ideação do ciclo `003` existente.
- `state_after`: ciclo `003` reservado como `Ideação` em `_project/cycles.md` (próximo ciclo atualizado para `004`) e artefato `_project/ideations/003_implementacao_prototipo.md` criado na branch local `chore/cycle-003-ideation`; nenhuma publicação remota realizada.
- `result`: `executed`
- `evidence`: leitura integral de `.agent/ai_behavior.md`, `_project/README.md`, `_project/cycles.md`, `KB-003`, `ADR-002`, `ADR-003`, `.agent/workflows/idear.md`, `.agent/templates/ideacao.md` e de todos os artefatos de ideação e execução dos ciclos `001` e `002`; execução dos gates locais de governança.
- `blockers`: nenhum para o registro da ideação; a redação do plano aguarda as respostas do responsável às 6 perguntas em aberto e a frase `"autorizo o rascunho do plano do ciclo 003"`.
