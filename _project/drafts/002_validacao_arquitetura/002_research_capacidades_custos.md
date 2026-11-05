# Capacidades e custo zero — focos e limites IBGE; processamento e suficiência global indeterminados

> **Ciclo:** `002` · **Item:** `2` · **Issue:** [#13](https://github.com/EuThiagoAndrade/rastro-quente/issues/13)
> **Consulta das fontes externas:** 2026-11-05, fuso de referência `America/Cuiaba`
> **Base:** plano v2 aprovado; item 1 integrado pela PR #15 em `d8fb3b3d7b2459e11e63c0e3a26cebb1051f3778`.
> **Natureza:** pesquisa documental; nenhuma conta, configuração, contratação, chamada autenticada ou prova de serviço executada.

**Resultado:** há modalidades gratuitas documentadas, com restrições materiais. Não há evidência suficiente de capacidade ou custo zero de ponta a ponta em nenhum dos 27 cenários reais propostos: volume de dois anos, larguras persistidas, processamento, tráfego completo e condições específicas de conta permanecem desconhecidos. Dois caminhos de transporte de arquivos integrais têm incompatibilidades documentais demonstráveis, descritas na seção 7. Não se escolhe arquitetura, plano comercial ou política de persistência.

Focos e sobreposições não comprovam incêndio, dano, autoria ou infração. Esta avaliação contém somente focos e limites IBGE; não cobre camadas adicionais ou seleção de áreas. Vercel, Supabase e autenticação Google continuam requisitos da ADR-002.

## 1. Base de demanda e critérios de classificação

Fonte de demanda: `002_research_cenarios.md`, seções 3–8, na base acima. Não foram lidos `local/`, brutos, dados de contas ou materiais privados, nem recontadas detecções. Esta entrega não resolve as lacunas LAC-01 a LAC-09 daquele relatório; amplia documentalmente LAC-10.

| Conjunto persistido | Conteúdo preservado como hipótese | Demanda que continua sem valor |
| :-- | :-- | :-- |
| S1 — principal | `AQUA_M-T` | `N1`, `DB1`, geometrias/índices/cópias e consumo por operação |
| S2 — principal e VIIRS | S1 + `NPP-375`, `NPP-375D`, `NOAA-20`, `NOAA-21`, séries distintas | `N2`, `DB2` e demanda própria; sem multiplicador de Colniza |
| S3 — todos | Todos os valores existentes nas fontes/versões da janela | `N3`, `DB3`, universo por versão e demanda própria; não equivale a S2 |

Hipóteses herdadas: um usuário, MT, janela variável de até dois anos; atualização sob demanda E/W/D com `U = 1/5/31` no mês ilustrativo de 31 dias; cargas `Q20/Q200/Q2000`. Frequência e consultas são independentes. A janela não foi convertida em um período calendário escolhido. Um usuário não limita requests, bytes ou sessões.

Classificação por recurso: **C — cabe documentalmente**, com demanda e condições correspondentes conhecidas; **E — excede/incompatível**, com violação demonstrada; **I — indeterminado**, por demanda, condição ou unidade ausente. **NA** exige motivo explícito. Classificar o fluxo completo exige todas as condições materiais: uma cota conhecida não preenche uma demanda desconhecida. Uma incompatibilidade de um caminho não elimina silenciosamente outros caminhos nem autoriza sua implementação.

Natureza da evidência: **D** = condição documentada nas fontes da seção 9; **H** = hipótese do cenário/modelo; **NV** = não verificado/publicado para a conta ou demanda. As cotas abaixo são D, sem comprovar elegibilidade, saldo disponível ou serviço operacional. Valores de MB/GB são mantidos como publicados; não se pressupõe conversão binária ou decimal onde a fonte não a esclarece. Contas em bytes com convenção decimal são rotuladas como exercício, sem margem de cenário real.

## 2. Modalidades, elegibilidade e controle de custo

| Serviço/modalidade candidata | Condição documentada | Premissa ou ponto não verificado | Implicação para custo zero |
| :-- | :-- | :-- | :-- |
| Vercel Hobby | D: plano gratuito; uso pessoal não comercial. A definição de comercial inclui benefício financeiro e trabalho remunerado no projeto. [V1, V2] | NV: enquadramento concreto do uso pretendido e situação da conta. Um usuário e repositório privado não provam elegibilidade. | Se o uso exigir modalidade paga, Hobby é incompatível; não migrar para Pro por inferência. Não se declara esse enquadramento sem confirmação. |
| Vercel excesso/trial | D: Hobby não permite comprar uso adicional; ultrapassagens podem suspender recursos, normalmente até renovação em 30 dias, com exceções. Trial Pro dura até 14 dias/limites; com meio de pagamento, pode iniciar cobrança ao terminar. [V1, V3, V7] | NV: exigência de cartão/validação no cadastro concreto de Hobby não foi certificada; nenhuma conta aberta. | Não depender de trial/crédito temporário. Permanecer em Hobby é condição, não garantia de disponibilidade. Nenhum cartão ou transição paga autorizados. |
| Supabase Free | D: organização Free não é cobrada; Spend Cap é recurso de Pro, não um teto financeiro configurável no Free. Cotas e restrições de uso continuam aplicáveis. [P2, P5] | NV: plano de eventual organização existente, uso compartilhado, saldo, elegibilidade e condições exibidas no cadastro. | Não presumir que projeto em organização paga seja Free. Não ativar add-ons, upgrades ou remover limite para resolver excesso. |
| Supabase cadastro e projetos | D: dois projetos Free ativos, considerando organizações nas quais o usuário é Owner/Admin; pausados não contam. Documentação comercial oficial contextualiza cadastro sem cartão. [P2, P16] | NV: vagas disponíveis e eventual verificação de conta/cartão na situação concreta. A afirmação de marketing não é teste de cadastro. | Dois ambientes hospedados poderiam esgotar as vagas, sem comprovar isolamento nem capacidade duplicada. Não criar contas extras para contornar cotas. |
| Supabase excessos | D: notificação e possível período de tolerância; reincidência pode restringir a organização, pausar, colocar banco somente leitura ou retornar HTTP 402. Tolerância não é capacidade contratada. [P6] | NV: duração de eventual tolerância e instante de desbloqueio para conta concreta. | Custo financeiro nulo pode coexistir com indisponibilidade. Parar a operação que exceder, sem contratar solução paga. |
| Google OAuth/identidade básica | D: integração documentada exige projeto Google, cliente OAuth, consentimento e URLs apropriadas. [G1, G2] | NV: condições de cadastro, elegibilidade da conta, quota efetiva e eventual exigência de billing/cartão; não foi localizada nesta pesquisa uma tabela de preço do OAuth básico que certifique todo o percurso. | Não inferir custo de Google Maps, Workspace ou Identity Platform a partir do login. Custo zero do fluxo permanece não comprovado, sem criar projeto ou aceitar termos. |

Nenhum saldo temporário é tratado como gratuidade permanente. Permanecer nas modalidades gratuitas documentadas e recusar adesões pagas reduz risco financeiro, mas não demonstra que todos os requisitos caibam. Não há autorização para contratar nem para cadastrar meios de pagamento.

## 3. Matriz de capacidades por recurso

Todas as linhas usam fontes consultadas em **2026-11-05**. Seções e URLs diretas estão na seção 9. Nenhuma cota é capacidade de desempenho medida.

### 3.1 Vercel Hobby

| Recurso | Limite/condição D, unidade e escopo | Demanda/limite NV ou H e tratamento |
| :-- | :-- | :-- |
| Transferência | 100 GB Fast Data Transfer e 10 GB Fast Origin Transfer; franquias de Hobby por período de uso, sem somá-las. [V1] | Direção por aresta e bytes totais NV. Não confundir recebimento do INPE com saída a navegador/origem. Período exato e consumo já compartilhado da conta devem ser revalidados. |
| CDN e funções | 1.000.000 CDN Requests e 1.000.000 Function Invocations, métricas distintas. [V1] | `Q` não é total de requests; páginas, estáticos, autenticação, atualizações e retries são NV. Saldo de todos os projetos da equipe não observado. |
| CPU e memória provisionada | 4 CPU-h e 360 GB-h incluídos; cotas acumuladas distintas. [V1] | CPU ativa não é duração de parede; GB-h mede alocação × duração das instâncias, sem somar memória por request concorrente na mesma instância. Perfil de instâncias NV. |
| Limites de execução | Com Fluid Compute: Node.js/Bun/Python Hobby até 300 s por invocação; memória 2 GB/1 vCPU. Payload de requisição/resposta de função: 4,5 MB. [V4] | Runtime/configuração não escolhidos. Essa duração não é limite de uma consulta no Supabase. Restrições específicas de streaming não foram usadas para prometer transporte de CSV. |
| Build/deploy | Build até 45 min; upload de fontes via CLI Hobby até 100 MB. [V5] | Tamanho/tempo do build NV. Build não é armazenamento de recuperação nem execução persistente de importador. Dados de trabalho não devem compor bundle/deploy. |
| Região | Funções usam `iad1` por padrão; região `gru1` representa São Paulo no catálogo. [V6] | Região efetivamente elegível/configurada, latência até MT/banco e custos entre arestas NV; nenhuma seleção feita. CDN próxima não demonstra banco próximo. |
| Observabilidade | Logs de runtime Hobby retidos por 1 hora. [V8] | Necessidade de retenção, volume de logs e auditoria NV. Não contar logs como backup dos dados. Exportação/monitor externo, se necessário, exigirá capacidade e condições próprias. |
| Ambientes, dados e recuperação | O plano de conta contempla previews, mas isso não cria ambientes de banco isolados; rollback de código não reconstitui Supabase. [V9; P8] | Sem cota de banco geoespacial ou backup de dados herdada da hospedagem. Persistência fica no recurso escolhido; nenhum Blob/Marketplace é incluído como dependência gratuita implícita. |

As franquias de V1 são as observadas na página aberta; trechos de busca antigos sobre funções de 10/60 segundos não substituem a documentação atual de Fluid Compute. Para configuração distinta, limites compatíveis precisam de nova conferência. O suporte à execução de bibliotecas não valida consumo geoespacial.

### 3.2 Supabase Free

| Recurso | Limite/condição D, unidade e escopo | Demanda/limite NV ou H e tratamento |
| :-- | :-- | :-- |
| Banco lógico | 500 MB anunciados por projeto em Pricing/billing; Database Size descreve enforcement organizacional pela média diária no período. [P1, P2, P3] | Divergência material, detalhada abaixo. `DB_s`, overhead, índices, agregados e uso de outros projetos NV; não calcular margem. |
| Disco do banco | Free tem disco fixo de 2 GB sem autoscaling. Perto de 95% pode ficar somente leitura; proteção é best effort e WAL pode continuar ocupando disco. [P3] | `DiscoDB_pico`, WAL, logs e staging NV; cota lógica não é disco. Expirar linhas não comprova liberação física imediata. |
| Computação PostgreSQL | Pricing anuncia CPU compartilhada e 500 MB RAM. [P1] | Sem throughput/CPU-s garantidos, capacidade de importação ou latência publicada para os dados do projeto. Conexões disponíveis e limites efetivos não verificados. |
| Objetos | 1 GB incluído; medição por GB-h e média do período, com tabela Free de 744 GB-h. [P4] | Não presumir que o pico instantâneo seja a média faturada nem usar um mês de 31 dias como regra universal de saldo. Brutos, exportações e cópias NV. |
| Arquivo em Storage | Free não permite limite global por arquivo acima de 50 MB; bucket pode impor limite menor. [P7] | Não confundir com limite do total de objetos; CSV mensais integrais da prova excedem essa condição (seção 7). Compressão/fragmentação não testadas. |
| Egress | 5 GB uncached e 5 GB cached, franquias independentes; transferência soma serviços e projetos da organização no ciclo. [P9] | Banco/Auth/Storage, backups e chamadas indiretas compartilham o percurso. Cache hit não é garantido; não somar como 10 GB fungíveis. Bytes de cada cenário NV. |
| API e SQL | Requests de API anunciados sem cota numérica de quantidade; não são CPU/egress ilimitados. [P1] Timeouts padrão por papel: `anon` 3 s, `authenticated` 8 s; conexões/configurações distintas têm regras próprias. [P10] | Caminho de consulta/importação, tamanho de resposta, conexões e tempos NV. Alterar timeout ou usar papel privilegiado não demonstra suficiência nem isolamento. Nenhuma configuração alterada. |
| Edge Functions, se necessárias | 500.000 invocações no Free (franquia organizacional). [P2] Por worker: 256 MB, parede Free 150 s, CPU 2 s por request; limite de funções por projeto 100. [P11] | Não confundir worker/parede/CPU com execução SQL nem com Vercel. Não há demanda calculada; não é um importador aprovado. Se não usadas na alternativa futura, justificar NA naquele fluxo. |
| Auth | OAuth social incluído, com 50.000 MAUs por ciclo; múltiplos logins do mesmo usuário no período não multiplicam MAU. [P1, P12] | O cenário de um usuário cabe somente na contagem projetada de MAU sob condições da seção 6; sessões, rate limits, tráfego e acesso continuam NV. |
| PostGIS | Extensão e tipos geoespaciais documentados; guia orienta schema dedicado e alerta que `spatial_ref_sys` em `public` pode ficar exposta. [P13] | Versão/ativação/disponibilidade na conta NV; não foi encontrada taxa separada nessa documentação, o que não elimina consumo de banco/CPU/índices. Suporte não aprova geometria ou regra ambiental. |
| Inatividade | Baixa atividade em período de sete dias pode pausar Free; restauração pelo dashboard documentada. [P14] | Atualização esporádica pode coexistir com consulta frequente, e atualização diária não é garantia contra suspensão. Critério concreto de atividade e latência de retomada NV. |
| Recuperação | Backups diários gerenciados descritos para planos pagos; Free deve manter exportações próprias. Backup de banco não inclui bytes dos objetos de Storage. PITR é add-on de planos pagos. [P15] | Recuperação integral, cópia de objetos, destino das exportações, RPO/RTO e duração NV. Não usar upgrade como solução autorizada. |
| Pausa prolongada | Changelog de política anuncia janela de 90 dias para restauração do projeto pausado; depois, download de backup lógico e objetos. [P17] | Publicação é de 2024, relida nesta data; não é garantia de restauração em 2026 sem conferência no caso concreto. Retomada e mudança de versões não testadas. |
| Ambientes | CLI/integração de deploy documentadas em todos os planos; preview branching exige Pro. [P8] | Previews da Vercel não replicam essa função. Alternativa com dois Free ou ambiente local exige vagas, capacidade, operação e isolamento; nenhum deles foi provisionado. |
| Região | Um projeto tem uma região primária; catálogo inclui São Paulo (`sa-east-1`). [P18] | Região disponível para a conta, latência, tráfego entre regiões e residência dos dados ainda não conferidos; não houve provisionamento. |
| Observabilidade | Pricing lista retenção API/banco de um dia, Auth Audit Logs de uma hora; sem SLA de uptime, Log Drain ou métricas via endpoint incluídos no Free. [P1] | Necessidade de histórico maior e operações fora desses limites NV. Blog de integração Grafana anuncia disponibilidade no Free [P16], sem resolver todas as condições do produto; monitor externo não foi adotado. |

**Divergência de banco (fontes P1/P2 versus P3):** Pricing e a tabela de billing dizem 500 MB por projeto; a seção *Fair use database size restriction* da página Database Size diz média diária somada na organização. Não combinar duas franquias como 1 GB garantido. Para avaliação conservadora, usar ambas as restrições: cada projeto até 500 MB **e** soma das médias até 500 MB na organização, até esclarecimento oficial. Isso é uma premissa restritiva da análise, não uma nova regra do provedor. Unidade em bytes e condição da conta também permanecem NV. A demanda continua I mesmo sob essa premissa.

### 3.3 Google e dependências de autenticação

| Aspecto | D e fonte | H/NV e consequência |
| :-- | :-- | :-- |
| Integração Google/Supabase | Projeto/cliente Web, origens, callback e segredo do cliente no provedor; escopos básicos `openid`, `userinfo.email`, `userinfo.profile`. [G1] | Nenhum segredo criado. Conta, callbacks futuros, permissões e funcionamento NV. Segredo não pertence ao cliente/navegador. |
| Testing e público | Regra geral Testing: até 100 usuários de teste e consentimento/refresh de sete dias. Exceção explícita para identidade básica/Sign in with Google: não exige lista de teste e não impõe essa expiração de sete dias. [G2] | Não usar a lista de Testing como autorização de acesso ao Rastro Quente. Escopos adicionais removem a exceção; configuração/conta e restrições Workspace continuam NV. |
| Escopos e ambientes | Configuração de cliente e consentimento é documentada pelo Google. [G3] | APIs sensíveis ou de dados adicionais não são necessárias por inferência ao login. Novos escopos podem exigir verificação; nenhuma aprovação/conta/branding foi obtida. |
| Custo, quota e região | Não há neste levantamento valor documental que certifique quotas por conta, região de tratamento ou custo de todas as etapas de cadastro/uso do OAuth básico. | Classificar I. Não importar preços de Maps/Identity Platform para preencher a lacuna nem afirmar que é necessário contratar esses produtos. Novas APIs, SMS, SMTP ou domínio pago não entram por suposição. |
| Autorização e G2 | OAuth social é suportado documentalmente pelo Supabase [G1]; as regras de RLS e acesso são autoridades locais. | Login não prova que somente o responsável acessa. Matriz de permitido/negado, RLS e testes reais pertencem à fundação/item 3, não foram executados. |

## 4. Dependências auxiliares e percurso completo

| Dependência possível | Uso/licença e custo conhecido ou lacuna | Tratamento nesta avaliação |
| :-- | :-- | :-- |
| INPE e IBGE | Condições e ressalvas já documentadas no item 1; não há nova licença certificada para arquivos/revisão futuros. | Não reabrir contagens nem baixar bases. Acesso público não elimina rede, retenção, processamento ou atribuição. FIRMS continua referência histórica auxiliar, sem ingestão permanente. |
| Node.js local | Runtime existente da governança; licença MIT e avisos de componentes na distribuição v24.15.0. [A1] | Não se exige contratação de licença para essa distribuição; não é licença da aplicação. Hardware, RAM/disco, energia, internet, manutenção, disponibilidade e tempo do operador são H/NV, sem custo marginal nulo presumido. |
| PostgreSQL/PostGIS | PostGIS declara GPLv2; guia oficial distingue uso normal do banco e distribuição de versão modificada. [A2] | Nenhum binário/biblioteca redistribuído. Licença da engine não demonstra serviço hospedado gratuito, desempenho, nem substitui licença dos dados. |
| Biblioteca de mapa, tiles, geocodificação ou imagery | Nenhuma selecionada ou indispensável ao modelo documental atual. Licença, quota, atribuição e custo de eventual fornecedor NV. | NA como dependência adotada nesta entrega; se o item 3 precisar de uma, sua capacidade/uso deve ser verificada antes de propor compatibilidade. Login Google não obriga Google Maps. Não incluir camada extra silenciosamente. |
| SDK/framework de aplicação e ferramentas locais novas | Nenhum adotado. Versão, licença, bundle, build e runtime de uma fundação futura NV. | Sem scaffold ou instalação. Custos de execução/licenças necessários a uma alternativa continuam materiais até serem identificados. |
| Domínio, SMTP/SMS, monitor externo, Blob/Marketplace, CI e backups externos | Nenhum contratado. Preços, franquias, cartão, licença/termos e retenção de serviço externo não selecionado NV. | Não presumir que integrem o Free de Vercel/Supabase. Google básico não cria requisito de SMTP próprio. Branch de código não é backup territorial. Serviços extras só se necessários e documentados no item 3. |

Percurso a contabilizar: origem → executor → banco/objetos → backend/CDN → navegador, mais logs, cópias e restauração. Uma cópia baixada pode consumir egress Supabase e armazenamento/rede local. A mesma resposta pode atravessar Supabase e Vercel, consumindo métricas separadas; não transferir saldo de um provedor ao outro. Região próxima, cache e processamento local são hipóteses, sem arquitetura escolhida. Não se certifica custo zero ao somar somente as mensalidades nominais.

## 5. Memória de cálculo e aplicação das cotas

### 5.1 Fórmulas por recurso

As expressões herdam as unidades/variáveis da seção 6 do item 1. Para recurso com limite `L` e demanda total correspondente `D`, consumo relativo `D/L`, margem `L − D` e resultado só são numéricos quando ambas as entradas e seu escopo forem conhecidos. Demanda ausente produz **I**, sem margem. Não se atribui margem real a exemplos fictícios.

| Recurso para os cenários | Demanda correspondente | Limite/condição de comparação | Resultado nesta entrega |
| :-- | :-- | :-- | :-- |
| Banco e disco | `DB_s` por projeto; média diária de todos os projetos; `DiscoDB_pico = DB_s + WAL + logs + staging + transitorios` | 500 MB sob as duas leituras da seção 3; disco 2 GB/projeto e limiar de proteção 95% [P3] | I: bytes/índices/geometrias/picos e outros projetos NV |
| Objetos/cópias | `∫ Objetos_org(t) dt` em GB-h; `max tamanho_arquivo` por objeto | Free 744 GB-h publicados e limite por arquivo 50 MB [P4, P7] | I para a retenção real; E para rota específica de arquivos integrais, seção 7 |
| Egress Supabase | `I_inicial × B_init,saida + Σ B_up,saida + Q × B_consulta,saida + backups + outros`, separado por cached/uncached e somado na organização | 5 GB em cada categoria/ciclo [P9] | I: tamanhos/rota/backup/cache e uso prévio NV |
| Transferência Vercel | Mesma equação por aresta, distinguindo Fast Data/Origin Transfer | 100 GB e 10 GB, sem juntar franquias [V1] | I: resposta total e origem do processamento NV |
| Requests | `R_init + Σ R_up,k + Q × paginas + sessoes × auth + outros`, por provedor/métrica | CDN e invocações Vercel 1 milhão cada; Edge Supabase 500 mil; API de banco sem franquia numérica de quantidade [V1, P2, P1] | I: demanda total/roteamento NV; ausência de cota de requests no banco não elimina limites restantes |
| Processamento | `Σ execucoes × CPU_s`, GB-h por instância Vercel, memória de pico e duração por tarefa/worker/request | Vercel 4 CPU-h/360 GB-h e limites por execução; Supabase SQL/Edge conforme seção 3 | I em todos os cenários: unidades não são substituíveis e não há medições |
| Auth e acesso | MAUs distintos somados na organização; requests/sessões e configuração de OAuth | 50 mil MAUs [P12]; escopos/audiência [G1–G3] | Só o componente projetado de 1 MAU cabe condicionalmente; operação/autorização/custo do fluxo I |
| Operação/recuperação | Ambientes ativos, atividade, cópias, observabilidade, RPO/RTO e recursos locais | Dois projetos Free, pausas, branching pago e recursos de backup/logs conforme seção 3 | I: objetivos/condições da conta ausentes; não ocultar essas dependências |

Para o mês de carga inicial, `I_inicial = 1`; nos demais, `0`. As 27 linhas da seção 6 valem para **ambos**, com resultado I/I quando a parcela inicial ou incremental for desconhecida. Nenhum volume nacional histórico é usado como demanda estadual de dois anos. Picos e médias são comparações distintas; apagar temporários no fim do mês não zera o uso já acumulado.

### 5.2 Conferência abaixo, no limite e acima

Testes aritméticos com **entradas fictícias**, não um dimensionamento dos cenários. Cota Vercel CPU ativa: `4 CPU-h × 3.600 = 14.400 CPU-s` [V1].

| CPU acumulada fictícia, mesma métrica/período | Relação com 14.400 CPU-s |
| --: | :-- |
| 14.399 CPU-s | abaixo |
| 14.400 CPU-s | no limite, sem assegurar funcionamento dos demais recursos |
| 14.401 CPU-s | acima |

Segunda conferência, sem ambiguidade de MB/GB: para o limite Vercel de 1.000.000 invocações [V1], `999.999 / 1.000.000 / 1.000.001` ficam abaixo/no limite/acima. Igualdade testa a fronteira matemática; comportamento do serviço pode envolver suspensão e outros limites. Não se testa a plataforma com requests.

O exemplo fictício de 500 MB de banco do item 1 continua apenas aritmético, sem conversão em previsão. Este item acrescenta a divergência de escopo organizacional e não certifica a unidade em bytes. Os exemplos Q20/Q200/Q2000 com respostas fictícias também não viram margens reais contra egress: faltam payload, backups, overhead, cache e consumo da conta.

Reprodução executada com Node.js 24, só aritmética, sem arquivo de dados, credenciais ou rede:

```javascript
const relacao = (d, l) => d < l ? 'abaixo' : d === l ? 'no limite' : 'acima';
console.log([14399, 14400, 14401].map(d => relacao(d, 4 * 3600)));
console.log([999999, 1000000, 1000001].map(d => relacao(d, 1000000)));
const arquivos = [103708076, 123024987, 144148591]; // metadados do item 1
console.log(arquivos.map(b => ({ acimaStorageMesmoBinario: b > 50 * 2 ** 20,
  acimaPayloadMesmoBinario: b > 4.5 * 2 ** 20 })));
console.log([1, 5, 31].map(U => U * arquivos.reduce((a, b) => a + b, 0)));
```

Saídas conferidas por segundo caminho: 4 horas = 240 minutos = 14.400 segundos de CPU; diferença de uma invocação nos três casos; menor arquivo de 103.708.076 B excede até 52.428.800 B (50 MiB) e 4.718.592 B (4,5 MiB). As contas não são benchmark ou prova de carga/autorização.

## 6. Resultado por cenário e conjunto persistido

Esta matriz não substitui demandas por exemplos fictícios. **I** em cada coluna significa indeterminado para todo recurso ali enumerado, tanto no mês inicial quanto no mês comum (**I/I**). Não há margem numérica real calculável. As três hipóteses ficam em linhas separadas para cada frequência e carga; todos os recursos têm correspondência na seção 5.1.

| Cenário | Conjunto | U | Q | Banco e disco | Objetos e cópias | Egress Supabase | Transferência Vercel | Requests | CPU, RAM e duração | Login e acesso | Operação/custo total |
| :-- | :-- | --: | --: | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| E-Q20 | S1 | 1 | 20 | I | I | I | I | I | I | I | I |
| E-Q20 | S2 | 1 | 20 | I | I | I | I | I | I | I | I |
| E-Q20 | S3 | 1 | 20 | I | I | I | I | I | I | I | I |
| E-Q200 | S1 | 1 | 200 | I | I | I | I | I | I | I | I |
| E-Q200 | S2 | 1 | 200 | I | I | I | I | I | I | I | I |
| E-Q200 | S3 | 1 | 200 | I | I | I | I | I | I | I | I |
| E-Q2000 | S1 | 1 | 2.000 | I | I | I | I | I | I | I | I |
| E-Q2000 | S2 | 1 | 2.000 | I | I | I | I | I | I | I | I |
| E-Q2000 | S3 | 1 | 2.000 | I | I | I | I | I | I | I | I |
| W-Q20 | S1 | 5 | 20 | I | I | I | I | I | I | I | I |
| W-Q20 | S2 | 5 | 20 | I | I | I | I | I | I | I | I |
| W-Q20 | S3 | 5 | 20 | I | I | I | I | I | I | I | I |
| W-Q200 | S1 | 5 | 200 | I | I | I | I | I | I | I | I |
| W-Q200 | S2 | 5 | 200 | I | I | I | I | I | I | I | I |
| W-Q200 | S3 | 5 | 200 | I | I | I | I | I | I | I | I |
| W-Q2000 | S1 | 5 | 2.000 | I | I | I | I | I | I | I | I |
| W-Q2000 | S2 | 5 | 2.000 | I | I | I | I | I | I | I | I |
| W-Q2000 | S3 | 5 | 2.000 | I | I | I | I | I | I | I | I |
| D-Q20 | S1 | 31 | 20 | I | I | I | I | I | I | I | I |
| D-Q20 | S2 | 31 | 20 | I | I | I | I | I | I | I | I |
| D-Q20 | S3 | 31 | 20 | I | I | I | I | I | I | I | I |
| D-Q200 | S1 | 31 | 200 | I | I | I | I | I | I | I | I |
| D-Q200 | S2 | 31 | 200 | I | I | I | I | I | I | I | I |
| D-Q200 | S3 | 31 | 200 | I | I | I | I | I | I | I | I |
| D-Q2000 | S1 | 31 | 2.000 | I | I | I | I | I | I | I | I |
| D-Q2000 | S2 | 31 | 2.000 | I | I | I | I | I | I | I | I |
| D-Q2000 | S3 | 31 | 2.000 | I | I | I | I | I | I | I | I |

**Compatibilidade parcial C, estritamente condicional:** em qualquer uma dessas linhas, somente o componente de contagem de usuários projetado (`1 MAU`) fica abaixo de 50.000 MAUs, se o acesso for limitado ao responsável e não houver uso de outros projetos na mesma organização. É requisito de cenário, não saldo observado nem segurança comprovada. Login, tráfego e autorização continuam I; por isso a coluna agregada de login não é C.

Hardware local, escopos e classificação do uso pessoal/comercial são transversais e continuam I onde necessários. Não se classificou um recurso como NA apenas porque a arquitetura ainda não o atribuiu: um executor futuro precisará suportá-lo. Se o item 3 eliminar uma dependência de um fluxo, deverá justificar sua não aplicação nesse fluxo e manter os demais custos/recursos.

## 7. Incompatibilidades demonstradas e condições de parada

### 7.1 Caminhos específicos com resultado E

As entradas são os tamanhos históricos documentados no item 1: agosto 103.708.076 B, setembro 123.024.987 B e outubro 144.148.591 B, total 370.881.654 B. Não são novos downloads nem volumes estimados de MT.

| Caminho, se exigido por um fluxo | Resultado documental, consumo/cota e margem | Aplicação aos conjuntos/cenários |
| :-- | :-- | :-- |
| Gravar cada CSV nacional mensal histórico integral como um objeto em Supabase Storage Free | **E**: cada arquivo excede 50 MB por objeto [P7], inclusive se interpretado como 50 MiB. Com essa interpretação mais permissiva, agosto consome `103.708.076 / 52.428.800 ≈ 1,978` do limite e excede por 51.279.276 B; sob MB decimal, excede ainda mais. | S1, S2 e S3, em E/W/D e qualquer Q, **quando** a rota exigir os mesmos arquivos integrais; filtrar em outro lugar antes de gravar é outro caminho, não avaliado como executado. |
| Enviar um desses CSVs inteiro no corpo de uma requisição de entrada de função Vercel | **E**: acima de 4,5 MB [V4], mesmo lendo MB como MiB. Para agosto: `103.708.076 / 4.718.592 ≈ 21,979`, excedendo por 98.989.484 B. Não se aplica automaticamente a um fetch de saída feito pela função, nem demonstra impossibilidade de streaming/fragmentação. | S1/S2/S3 e as nove combinações U/Q, se a rota exigir esse body inteiro. Não descarta toda arquitetura de funções. |
| Exigir preview branching gerenciado de Supabase sem pagamento | **E** na modalidade documentada: requer Pro [P8]. Sem consumo/cota numérica aplicável. | Todos os cenários, somente se essa capacidade for requisito do fluxo. Dois projetos Free ou ambiente local são alternativas a avaliar; não foram escolhidos. |
| Usar trial Pro como sustentação contínua de custo zero | **E** para essa condição: benefício temporário de até 14 dias, com possível cobrança posterior se houver meio de pagamento [V7]. | Todos os conjuntos/cenários que dependessem do trial. Não foi iniciado. |

Os limites por arquivo/payload são obstáculos de uma rota concreta. O restante da demanda real de cada conjunto permanece I. Não declarar que o armazenamento de MT excede 500 MB apenas porque um CSV nacional contém vários satélites e todo o país.

### 7.2 Condições que impedem afirmar custo zero ou continuar uma futura implantação

| Condição | Resultado/ação delimitada |
| :-- | :-- |
| Uso comercial necessário e incompatível com Hobby | Incompatibilidade da modalidade; responsável decide como tratar, sem trocar requisitos da ADR-002 ou contratar Pro automaticamente. Enquadramento atual NV. |
| Cadastro exigir billing/cartão, contrato pago, trial ou API adicional não verificada | Parar antes de aderir; registrar condição e pedir decisão adequada. Esta pesquisa não autoriza cadastro nem gasto. |
| Demanda/conta exceder cota ou exigir recuperação/observabilidade paga | Não usar tolerância como franquia nem desativar proteção para continuar. Demonstrar a limitação; propor escopo futuro dentro do limite autorizado. |
| Exigir disponibilidade contínua, RPO/RTO ou histórico que Free não documenta | Incompatibilidade se a exigência for demonstrada; com requisitos ausentes, manter I. Atualizações sob demanda não aprovam pausa nem perda de dados. |
| Depender de CPU, memória ou prazo não quantificados | Manter I e especificar prova futura autorizada. Nenhum benchmark neste ciclo. |
| Precisar de novas camadas, credenciais reais ou decisão ambiental | Não incluir por inferência; decisão própria antes de ampliar escopo. |

## 8. Lacunas remanescentes e passagem ao item 3

As lacunas do item 1 permanecem identificadas; nenhuma foi preenchida com números fictícios. Novas condições documentais:

| ID | Lacuna/condição | Efeito | Resolução futura delimitada |
| :-- | :-- | :-- | :-- |
| CUS-01 | Elegibilidade de Hobby, modalidades/vagas/saldos compartilhados e exigências de cadastro | Impede declarar condições de custo zero da conta | Conferência humana de finalidade e, sob escopo próprio, páginas de cadastro/planos sem aceitar custo; não expor dados de conta no repositório |
| CUS-02 | Divergência do escopo de 500 MB e unidade MB/GB | Impede somar franquias ou dar margem em bytes real | Esclarecimento oficial e revisão da documentação vigente antes da fundação; enquanto isso, duas restrições conservadoras da seção 3.2 |
| CUS-03 | Política e região efetivas de OAuth; custo/quota do cadastro/uso básico não certificados | Login documentado não comprova elegibilidade financeira/técnica | Documentação oficial adicional e conferência da conta em etapa autorizada; não adicionar API paga para testar |
| CUS-04 | Tamanho/caminho de ingestão, payloads, índices, cache, cópias e recursos por execução | Todos os 27 cenários continuam I no conjunto | Preservar LAC-02 a LAC-07; no item 3 ligar cada executor às cotas e propor provas futuras, sem executá-las |
| CUS-05 | Disponibilidade, retomada após pausa, restauração integral, ambientes e logs | Custo nominal nulo não comprova recuperação/isolamento | Responsável define objetivos; protocolo futuro de pausa/retomada, dump+objetos e restauração com verificação independente e limites de custo, sem execução agora |
| CUS-06 | Necessidade de engine/biblioteca local, tiles ou serviços auxiliares | Não há inventário fechado de dependências de uma arquitetura ainda não escolhida | Item 3 identifica o que cada fluxo de fato requer; verificar licença/custo de componente necessário antes de recomendar compatibilidade. Ausência de evidência continua I |

**Conclusão a transportar:** avaliação documental de focos e limites IBGE, sem camadas adicionais de sobreposição; duração e consumo de processamento indeterminados. S1, S2 e S3 têm condições gratuitas documentadas e incompatibilidades de rotas específicas, mas nenhum dos 27 cenários tem compatibilidade global demonstrada. Suporte a PostGIS, um usuário ou mensalidade zero não suprem as incógnitas.

O item 3 deve comparar os três executores previstos no plano — local, Supabase e funções Vercel — preservando todos os recursos materiais e os resultados I/E acima. Deve avaliar caminhos e acesso, sem escolher persistência, transformar detecções em eventos ou adotar arquitetura definitiva. A #14 exige integração desta entrega e autorização própria; nenhuma atualização de KB-003 ou parecer arquitetural foi antecipada.

## 9. Fontes primárias, seções e data

**Data de consulta de todas as entradas: 2026-11-05.** Valores são os das páginas abertas, não apenas dos snippets. Trechos antigos/condições de outra modalidade não suprem documentação vigente. URLs apontam para fontes primárias; as sínteses acima são inferências delimitadas quando combinam demanda e limite.

| ID | URL oficial e seção consultada |
| :-- | :-- |
| V1 | [Vercel Hobby](https://vercel.com/docs/plans/hobby): *Hobby Included Usage*, *Hobby billing cycle*, comparação de planos |
| V2 | [Vercel Fair Use](https://vercel.com/docs/limits/fair-use-guidelines): *Commercial usage*, *Never fair use* |
| V3 | [Vercel Pricing](https://vercel.com/pricing): FAQ sobre uso adicional de Hobby |
| V4 | [Vercel Functions Limits](https://vercel.com/docs/functions/limitations): *Max duration*, *Memory size limits*, *Request body size* |
| V5 | [Vercel Limits](https://vercel.com/docs/limits): *Build time per deployment*, *Static file uploads* |
| V6 | [Vercel Regions](https://vercel.com/docs/regions): tabela de regiões e *Compute defaults* |
| V7 | [Vercel Pro Trial](https://vercel.com/docs/plans/pro-plan/trials): *Starting a trial*, *Post-Trial Decision*, *When will I get billed?* |
| V8 | [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime): *Limits* e retenção por plano |
| V9 | [Vercel Deployment Environments](https://vercel.com/docs/deployments/environments): ambientes de preview e produção, sem criar banco isolado |
| P1 | [Supabase Pricing](https://supabase.com/pricing): Free, Auth, Database, Security/Compliance |
| P2 | [Supabase Billing](https://supabase.com/docs/guides/platform/billing-on-supabase): Free, *Organization-based billing*, *Variable Usage Fees and Quotas* |
| P3 | [Database and Disk Size](https://supabase.com/docs/guides/platform/database-size): *Free Plan behavior*, *Fair use database size restriction*, WAL |
| P4 | [Storage Size Usage](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size): *How charges are calculated*, Pricing |
| P5 | [Supabase Cost Control](https://supabase.com/docs/guides/platform/cost-control): Spend Cap, itens não cobertos |
| P6 | [Supabase Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq): excesso Free, *Fair Use Policy*, restrições |
| P7 | [Storage Upload Limits](https://supabase.com/docs/guides/storage/uploads/file-limits): *Global file size*, limites por bucket |
| P8 | [Deployment & Branching](https://supabase.com/docs/guides/deployment): *Do you need a paid plan?* |
| P9 | [Egress Usage](https://supabase.com/docs/guides/platform/manage-your-usage/egress): categorias, cotas independentes, ciclo e organização |
| P10 | [PostgreSQL Timeouts](https://supabase.com/docs/guides/database/postgres/timeouts): *Role level*, limites de caminhos distintos |
| P11 | [Edge Functions Limits](https://supabase.com/docs/guides/functions/limits): *Runtime limits*, *Platform limits* |
| P12 | [Monthly Active Users Usage](https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users): exemplo de contagem, Pricing e uso da organização |
| P13 | [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis): *Overview*, *Enable the extension* |
| P14 | [Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod): *Availability* e pausa Free |
| P15 | [Database Backups](https://supabase.com/docs/guides/platform/backups): Free, exclusão de objetos e PITR |
| P16 | [Supabase/Grafana](https://supabase.com/blog/observability-for-every-supabase-project-with-grafana-cloud): *Get started*, menção a Free/sem cartão; não é contrato de recursos adicionais |
| P17 | [Pause/Restore Policy](https://supabase.com/changelog/27497-paused-free-plan-projects-are-restorable-for-90-days): política anunciada em 2024-06-24, relida nesta consulta |
| P18 | [Supabase Regions](https://supabase.com/docs/guides/platform/regions): região primária e catálogo; `sa-east-1` (São Paulo) disponível documentalmente, sem região provisionada ou latência medida |
| G1 | [Google Sign-in no Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google): *Prerequisites*, escopos e *Project setup* |
| G2 | [Google — Manage App Audience](https://support.google.com/cloud/answer/15549945?hl=en): *Publishing status*, Testing e exceção de identidade básica |
| G3 | [Google Identity Setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid): projeto, cliente e consentimento |
| A1 | [Node.js v24.15.0 LICENSE](https://raw.githubusercontent.com/nodejs/node/v24.15.0/LICENSE): licença principal e avisos de componentes |
| A2 | [PostGIS — GPL](https://postgis.net/documentation/faq/gpl-license/): licença e distinção entre uso do banco e distribuição modificada |

Documentos locais usados: plano v2, `002_research_cenarios.md`, KB-003 e ADR-002/003. Fonte de metadados históricos permanece `scripts/prova-dados/fontes.json` e o relatório do item 1; não houve nova coleta de dados territoriais nesta pesquisa.
