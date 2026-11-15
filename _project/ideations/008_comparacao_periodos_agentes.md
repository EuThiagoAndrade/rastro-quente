# Ideação — 008: Comparação de períodos e agentes de explicação

> **Ciclo:** `008`
> **Estado:** `Ideação`
> **Nível:** `completo`
> **Autorização inicial:** "confirmo o nível completo e autorizo a ideação do ciclo 008" em 2026-11-15
> **Criado em:** 2026-11-15
> **Última atualização:** 2026-11-15
> **handoff_schema_version:** `2`

## Problema

O ciclo `007` entregou a explicação de cada destaque ("Por que este destaque?"): motivo, evidências e ressalvas que a lente já calculou, inclusive na combinação. Ainda faltam duas coisas:

1. **Comparar períodos.** O usuário vê o resultado de um período por vez. Uma pergunta como "por que esta célula apareceu em outubro e sumiu em novembro?" exige rodar a mesma lente nos dois períodos e cruzar o resultado com a disponibilidade dos dados. Hoje esse trabalho é manual.
2. **Perguntas em linguagem natural, respondidas por agentes.** O responsável precisa demonstrar, por exigência acadêmica, um sistema com **agente e subagentes** que funcionem de verdade. A proposta é um agente principal que entende a pergunta, delega partes a subagentes especializados e escreve a resposta usando só as evidências que as ferramentas do projeto devolveram.

Restrição de domínio: a explicação apoia a avaliação técnica. Detecções e sobreposições, por si só, não comprovam incêndio, dano, autoria ou infração. A IA não calcula nem aplica critérios. Isso continua com o método do Rastro Quente.

## Origem no backlog

- **BL-009 — Explicação dos destaques das lentes no mapa.** Parcela: o restante do item depois do ciclo `007`, isto é, a **comparação direta de dois períodos** e a **proposta de agentes** (agente principal, subagentes, função no servidor e modelo de linguagem).
  - **Síntese (snapshot):** permitir que o usuário entenda, no mapa, o que levou uma célula a ser destacada e o que mudou entre dois períodos, com critérios, evidências e ressalvas. Para perguntas que cruzam evidências, um agente principal recebe a pergunta e o recorte da tela, delega a comparação do critério a um subagente e a verificação de disponibilidade a outro, e sintetiza os resultados. O painel mostra as etapas da execução real. Uma alternativa a avaliar é uma função na Vercel consultar o Supabase com as permissões do usuário e enviar um resumo autorizado à API Gemini, com a credencial no servidor.
  - **Parcela já atendida em outro destino:** "por que esta célula foi destacada", no ciclo `007` (plano v4, item 2, issue #61).
- **Referência:** `_project/backlog.md`, commit `e274e49`, já contido em `main` e em `origin/main`. **Não** é local nem pendente de publicação. A fila local (`chore/backlog`, em `cd1115f`) não altera o BL-009.
- **Destino em preparação.** O estado do item não muda agora. O retorno na fila (`ciclo 008 — AAAA-MM-DD — parcela`) só ocorre depois da integração comprovada em `main`, e sua publicação exige autorização separada.
- **Observação fora do escopo:** o retorno do ciclo `007` ao BL-007 e ao BL-009 ainda não foi registrado na fila (os dois seguem `Disponível`, sem encaminhamento). O mesmo vale para o BL-002 e o ciclo `006`. Esses retornos pedem um pedido próprio de `gerenciar_backlog` e não são tratados aqui.

## Contexto e evidências

### O que já existe

- **Lentes no navegador.** As lentes (`src/lentes/`) são TypeScript puro, sem dependência de navegador no cálculo. Elas recebem as detecções lidas pelas consultas do Supabase (`consultar_resumo`, páginas de detecções, `consultar_disponibilidade`) e devolvem destaques com motivo, evidências, cobertura e ressalvas (KB-005). Funcionam no recorte estadual ou municipal. A concentração exige o recorte estadual.
- **Explicação da célula.** A aba "Destaques" abre "Por que este destaque?" com motivo, evidências e ressalvas (ciclo `007`, issue #61, `src/apresentacao-resultado.ts`).
- **Acesso.** Só o responsável autorizado lê dados, pela RLS e pela lista privada (`privado.eh_responsavel()`, ADR-005). `anon` não lê nada. O `service_role` perdeu os privilégios nas tabelas de `public` (emenda da issue #24).
- **Hospedagem.** A Vercel serve só o site estático (`vercel.json`: `outputDirectory: dist`). **Não existe nenhuma função de servidor no projeto.** A CSP permite `connect-src 'self' https://*.supabase.co`, então uma rota própria (`/api/...`) já cabe em `'self'`. Um provedor de IA chamado do navegador exigiria afrouxar a CSP e expor a chave, o que está descartado.
- **Custo.** O projeto opera sem custo. Nenhuma dependência de execução nova foi adotada até agora: só `@supabase/supabase-js` e `leaflet`.

### Conversa de 2026-11-15 (síntese)

**Duas camadas.**
- **Sem IA (determinística):** comparar a mesma lente em dois períodos, com a mesma carga, os mesmos parâmetros e a mesma regra, e mostrar o que mudou: a célula entrou, saiu ou se manteve; quais evidências mudaram; e a disponibilidade dos dias que limita a leitura. Essa camada tem valor sozinha e serve de ferramenta para os agentes.
- **Com IA (agentes):** responder perguntas em linguagem natural, usando a camada determinística e as consultas existentes como ferramentas.

**Como funcionaria na tela.** Não seria um chat solto. Seria um **painel ligado à seleção do mapa**, que já conhece a célula ou o município, a lente e o período. O modelo sugerido é **híbrido**:
- **perguntas prontas**, que mudam conforme o contexto:
  - célula selecionada: "Por que foi destacada?" e "Comparar com outro período";
  - município selecionado: "Comparar com outro município" e "Quais células puxaram o número?";
  - nada selecionado: "Onde estão as maiores concentrações?";
- uma **caixa de texto livre** para o resto.

As perguntas prontas garantem uma demonstração estável e mostram ao usuário o que o sistema sabe responder. A caixa livre mostra o agente decidindo quais subagentes acionar.

**Agente e subagentes.**
- **Agente principal:** classifica a pergunta, escolhe os subagentes e escreve a síntese.
- **Subagente da lente:** aplica a mesma regra da lente aos períodos ou recortes pedidos, por meio do código do projeto, e relata o que mudou.
- **Subagente de disponibilidade:** levanta lacunas e dias indeterminados que limitam a interpretação.
- **O painel mostra as etapas da execução real** ("Comparando o critério…", "Verificando a disponibilidade…") e as evidências usadas.

**Três tipos de pergunta.** O agente principal classifica cada pergunta antes de responder:

| Tipo | Exemplos | Comportamento |
| :-- | :-- | :-- |
| Respondível | "Por que esta célula foi destacada?"; "O que mudou entre outubro e novembro?"; "Quais dias tiveram focos?"; "Faltaram dados do satélite?"; "Esta célula está em mais de uma lente?"; "Cai em área protegida?" | Aciona os subagentes e responde com as evidências |
| Parcial | "Por que o município A tem mais focos que o B?" | Responde o **quê** (contagens, recorrência, concentração, disponibilidade) e declara que a **causa** (uso do solo, clima, atividade econômica) não está nos dados e exige avaliação técnica |
| Fora do alcance | "Quem é o dono da área?"; "Foi criminoso?"; "Vai ter mais queimada no mês que vem?" | Diz que não consegue responder com os dados do sistema e sugere uma pergunta possível |

**Regras garantidas pelo código, não pelo modelo.**

| Regra | Garantia proposta |
| :-- | :-- |
| Números corretos | Contagens e datas exibidas vêm das ferramentas, não do texto gerado |
| Escopo da tela | As ferramentas só aceitam a seleção, a carga e os períodos do pedido |
| Sem conclusão de incêndio, dano, autoria ou infração | Ressalva fixa anexada pelo código a toda resposta |
| Pergunta sem ferramenta | Recusa com sugestão, sem resposta inventada |
| Identificação | Resposta marcada como gerada por IA, com as evidências ao lado |
| Acesso | A função valida a sessão e consulta o Supabase com o JWT do usuário (RLS), nunca com credencial administrativa |

**Credencial e dados.** A chave do provedor fica só no servidor (variável de ambiente da Vercel), nunca no navegador nem no Git. O modelo recebe só um resumo autorizado (seleção, datas, contagens, avisos), sem dados pessoais.

## Resultado desejado

- Comparação de dois períodos para a lente selecionada, sem IA, com o que entrou, saiu ou se manteve, as evidências e a disponibilidade.
- Painel de perguntas ligado à seleção, com perguntas prontas e texto livre, respondidas por um agente principal que aciona subagentes reais e mostra as etapas.
- Respostas classificadas (respondível, parcial ou fora do alcance), com evidências, ressalva fixa e marcação de IA.
- Credencial só no servidor, acesso pelo JWT do usuário, custo dentro de uma cota gratuita e sem dados pessoais enviados ao provedor.
- Uma demonstração estável de agente e subagentes, que sirva à exigência acadêmica.

## Hipóteses

- H1. O código das lentes roda sem mudança dentro de uma função Node na Vercel, lendo as mesmas consultas com o JWT do usuário.
- H2. Uma cota gratuita de um provedor de IA cobre o uso do protótipo (um responsável e uma demonstração), com limites conhecidos.
- H3. Chamada de ferramentas ("function calling") do provedor basta para orquestrar agente e subagentes sem um framework de agentes.
- H4. As perguntas prontas cobrem a maior parte do uso. A caixa livre serve sobretudo para demonstração e exploração.
- H5. Um resumo com seleção, datas, contagens e avisos é suficiente para o modelo e não contém dados pessoais.

## Alternativas

| Alternativa | Avaliação inicial |
| :-- | :-- |
| A. Só a camada determinística, sem IA | Seguro e barato, mas não atende à exigência de agentes. Pode ser a primeira entrega do ciclo |
| B. Chamar o provedor de IA do navegador | Descartada: expõe a chave e exige afrouxar a CSP |
| C. Função na Vercel com o provedor de IA (proposta do BL-009) | Candidata principal: mesma hospedagem, rota em `'self'`, JWT do usuário |
| D. Edge Function do Supabase com o provedor de IA | Possível, mas o runtime Deno pode exigir adaptar o código das lentes |
| E. Modelo local | Inviável no ambiente hospedado sem custo |
| Provedor: Gemini, Claude ou outro | A decidir por custo, cota gratuita, uso dos dados enviados e qualidade da chamada de ferramentas |
| Subagentes: chamadas separadas ao modelo ou só ferramentas | A decidir. Subagentes como chamadas próprias, com instruções e ferramentas próprias, mostram melhor a orquestração. Ferramentas puras custam menos |

## Riscos e restrições

- **G1 (exatidão):** a comparação de períodos aplica critérios de um jeito novo e exige casos de referência independentes, a mesma carga e os mesmos parâmetros nos dois períodos, e regras para janelas de tamanhos diferentes.
- **G2 (acesso):** a função de servidor é uma nova porta de entrada. Precisa provar acesso negado sem sessão e para quem não está na lista, e nunca usar o `service_role`.
- **G3 (privacidade):** dados territoriais saem para um serviço externo. A cota gratuita de alguns provedores pode permitir o uso dos dados enviados para treino. Isso precisa ser conferido. Perguntas e respostas não devem ir para logs com dados sensíveis.
- **Arquitetura nova:** primeira função de servidor, primeira chave de API e primeiro serviço de IA. Pede uma ADR.
- **Alucinação:** o texto gerado pode distorcer a evidência. A mitigação é mostrar os números a partir das ferramentas, anexar a ressalva fixa e marcar a resposta como IA.
- **Cota e disponibilidade:** limites do plano gratuito podem derrubar a demonstração. O painel precisa de um estado de erro claro, e a camada sem IA continua funcionando.
- **Custo:** nenhuma cobrança sem decisão explícita do responsável.
- **Dependência nova:** um SDK do provedor ou chamadas HTTP diretas. Avaliar a menor opção.

## Perguntas em aberto

1. Qual provedor e modelo? Os critérios são custo zero, cota, uso dos dados enviados e qualidade da chamada de ferramentas.
2. A camada sem IA (comparação de períodos) entra como primeira issue do ciclo, antes dos agentes?
3. Os subagentes serão chamadas próprias ao modelo ou apenas ferramentas do agente principal?
4. Quais perguntas prontas entram na primeira versão, e a caixa livre entra já na primeira versão?
5. Quais ferramentas o agente recebe na primeira versão? Por exemplo: aplicar a lente a uma seleção e período; comparar dois períodos; consultar a disponibilidade; comparar dois municípios.
6. Comparar períodos: só períodos de mesmo tamanho? Na mesma carga? E quando um período não tem dados?
7. Como o painel mostra as etapas em tempo real (streaming ou atualização por etapa)?
8. O que pode ser registrado em log, e por quanto tempo?
9. Qual limite de uso por sessão ou por dia protege a cota?

## Fora do escopo

- Responder causa, autoria, propriedade ou previsão.
- Novas fontes de dados (VIIRS, CAR, variação anual) e novas lentes.
- Mudar fórmulas, parâmetros ou contratos das lentes existentes.
- Qualquer custo pago sem decisão explícita.
- Memória de conversas entre sessões.

## Critérios para iniciar o planejamento

- Perguntas 1 a 6 respondidas pelo responsável.
- Conferidos a cota gratuita e as condições de uso de dados do provedor escolhido (G3).
- Definida a matriz de acesso da função de servidor (G2) e os casos de referência da comparação de períodos (G1).
- Acordado que a nova arquitetura será registrada em ADR no plano.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Ideação registrada — ciclo 008 (completo)
Quem: Responsável
Conferir: Perguntas em aberto 1 a 9 e alternativas desta ideação (_project/ideations/008_comparacao_periodos_agentes.md)
Diga: "autorizo o rascunho do plano do ciclo 008"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `EuThiagoAndrade/rastro-quente + 008 + idear + comparacao_periodos_agentes + 52a8509`
- `effect_class`: `local_mutation`
- `state_before` / `state_after`: ciclo `008` sem registro em `cycles.md` (próximo ciclo `008`) / ciclo `008` reservado como `Ideação`, com esta ideação criada
- `result`: `executed`
- `evidence`: esta ideação e a linha `008` de `_project/cycles.md` na branch `chore/cycle-008-ideation`, criada a partir de `origin/main` (`52a8509`); o commit local é registrado no histórico da branch
- `blockers`: nenhum para a ideação. O planejamento depende das perguntas em aberto
