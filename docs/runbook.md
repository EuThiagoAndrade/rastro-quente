# Runbook do protótipo — carga, cópia, expiração, recuperação e rotação do EX

Escopo das seções 1 a 9: operação **local** da carga de dados (ciclo `003`, item 3). A operação hospedada (contas, migrações no destino, senha do EX, deploy, primeiro login, cadastro do RP) é o roteiro da seção 11 (item 5), e atos administrativos são do responsável. O guia da interface está na seção 10 e o roteiro hospedado do item 5, na seção 11. Decisão e medições: [ADR-006](../_project/decisions/ADR-006_carga_idempotente_unica_transacao.md). Papéis e matriz de acesso: [ADR-005](../_project/decisions/ADR-005_banco_autorizacao_prototipo.md). Focos e sobreposições não comprovam incêndio, dano, autoria ou infração.

Nada aqui autoriza teste destrutivo em produção. Nenhum comando abaixo pede segredo como argumento: a senha do EX vive só em `RQ_EXECUTOR_PASSWORD`, no ambiente do processo.

## 1. Pré-requisitos

- Node.js 24+, `npm ci`, Docker e `npx supabase start` (local).
- Insumos do item 1 em `local/dados-prototipo/` (fora do Git): `brutos/`, `saidas/` e `relatorio.json` gerados por `node scripts/prototipo/prototipo.mjs processar`, sem paradas. `scripts/prototipo/fontes.json` e `avisos.json` (no Git) fixam as fontes por SHA-256 e a regra de histórico.
- O EX (`rq_executor`) é criado sem `LOGIN` pelas migrações. O responsável abre a janela de carga e a fecha ao final.

## 2. Atualizar os dados (versão nova)

Desde a issue #50, a carga normal lê também `areas.json` e `deteccoes_areas.csv` do relatório local, confere seus hashes e totais e incorpora as duas fontes e `areas-006-v1` ao manifesto. O resumo mostra áreas e vínculos por classe. Os polígonos integrais e os arquivos das fontes permanecem locais; somente as geometrias de exibição são publicadas.

1. **Gerar os insumos.** `janela`, `obter` e `processar` do item 1. Fonte corrigida, janela diferente ou método corrigido mudam os hashes e, portanto, a identidade.
2. **Abrir a janela do EX (administrador).** O `plan` com `--alvo` consulta o banco como EX, e o EX nasce sem `LOGIN`: sem esta etapa o plano falha na conexão. `\password rq_executor` no `psql` (a senha é cifrada no cliente e não aparece no log) e `alter role rq_executor login;`. Guardar a senha em cofre ou ambiente local ignorado.
3. **Plano, sem escrita.** `node scripts/banco/carga.mjs plan --alvo postgresql://rq_executor@127.0.0.1:55322/postgres --sql aprovacao.sql`
   (a URL não leva senha; fora do loopback exige `?sslmode=require`; no pooler do Supabase o usuário é `rq_executor.<referência do projeto>`). Sem `--alvo`, `--offline` só calcula o manifesto e **para** (`sem_consulta_ao_alvo`): sem o consumo do alvo não há prova de margem. Opções: `--exibicao maxima|intermediaria|minima` (padrão `intermediaria`) e `--revisao N` (padrão 1).
   O plano mostra: identidade, totais, bytes a gravar, consumo existente, pico previsto e margem em relação ao teto de **400.000.000 bytes**, versão vigente, estado da carga e pendências.
4. **Conferir o plano.** Paradas (`pico_acima_do_teto_de_banco`, `estimativa_insuficiente_para_provar_margem`, `carga_retirada`, `carga_em_estado_ambiguo`) interrompem. Pico igual ao teto não para, mas não dispensa conferir disco, egress, conta/organização, CI e Vercel (item 5), sem somar franquias diferentes.
5. **Aprovar o manifesto (administrador).** Revisar `aprovacao.sql` e executá-lo como proprietário do banco. O EX só lê `privado.manifestos_aprovados`.
6. **Aplicar.** `RQ_EXECUTOR_PASSWORD=… node scripts/banco/carga.mjs apply --alvo … --identidade <hex do plano>`. Sem a identidade do plano revisado o `apply` não prossegue. Faz de novo o plano e para se houver parada.
7. **Conferir.** `node scripts/banco/carga.mjs resumo --alvo …` (identidade, totais e SHA-256 do conteúdo por tabela da versão vigente). Guardar o JSON, sem dados de detecção, junto da cópia local (seção 4).
8. **Fechar a janela e auditar (administrador).** `alter role rq_executor nologin;` e `select * from privado.auditar_exposicao();` (só o proprietário). A lista esperada fora da janela é vazia.
9. **Expirar** a versão retirada quando a nova estiver aprovada (seção 5).

### Resultado de `apply`

| `result` | Significado | O que fazer |
| :-- | :-- | :-- |
| `executed` | Versão publicada, anterior retirada | Conferir com `resumo` |
| `already_executed_and_reconciled` | A identidade já estava publicada e vigente (reexecução, concorrência ou commit confirmado depois do erro) | Nada; nada foi duplicado |
| `not_executed` | `manifesto_nao_aprovado`, `carga_retirada`, falha antes do commit (inclusive sem conexão) ou commit que não ocorreu | Corrigir a causa e reexecutar o mesmo comando; a anterior permanece vigente |
| `ambiguous_human_intervention_required` | Carga em preparação residual, publicada fora da vigência, ou `COMMIT` enviado sem conexão para conferir | Parar. Conferir o banco com `plan` e `resumo` antes de qualquer ação; não apagar às cegas |

Códigos de saída: 0 (`executed` ou reconciliado), 3 (`not_executed` ou parada do plano), 4 (ambíguo), 2 (erro de uso).

## 3. Reversão segura dos dados

Para retirar a camada de áreas, use `--sem-areas --revisao N` tanto no `plan` quanto no `apply`, com uma revisão nova, e confira identidade, totais nulos e resumo. Os insumos locais não são removidos.

Não há `force` nem retorno de carga retirada. Para voltar ao conteúdo anterior: gerar o plano do **mesmo conteúdo com `--revisao N+1`**, aprovar o novo manifesto e aplicar. A versão ruim é retirada pela troca e depois expirada. Falha antes do commit não exige reversão: a versão vigente nunca saiu do lugar.

## 4. Cópia local

A cópia que importa é a dos **insumos fixados**, não a do banco:

- `local/dados-prototipo/brutos/`, `saidas/` e `relatorio.json`, mais `scripts/prototipo/fontes.json` e `avisos.json` (SHA-256 de cada fonte). Não depender de URL futura manter o mesmo conteúdo: `processar` recusa arquivo cujo hash diverge de `fontes.json`.
- O JSON de `resumo` da versão vigente e o `aprovacao.sql` revisado.

A cópia é feita pelo responsável, fora do Git (`local/` é ignorado). Um `pg_dump` do schema `public` pelo proprietário seria complementar, mas **não foi exercitado nesta issue**.

## 5. Expiração

`expirar` apaga as **linhas** de cargas retiradas e não toca na vigente; a linha da carga e o manifesto aprovado permanecem como registro. Não edita migração (G4).

```bash
RQ_EXECUTOR_PASSWORD=… node scripts/banco/carga.mjs expirar --alvo … --simular
RQ_EXECUTOR_PASSWORD=… node scripts/banco/carga.mjs expirar --alvo …
```

`--simular` conta sem apagar. Efeito medido: as linhas mortas viram espaço reaproveitável depois do `VACUUM`, mas o arquivo **não encolhe**; o espaço serve à carga seguinte. O pico de banco lógico é com duas versões (45,9 MB na carga real).

## 6. Recuperação e reconstrução

- **Queda da conexão ou do cliente durante o `apply`:** a transação é desfeita; reexecutar o mesmo comando. Se o `COMMIT` estava a caminho, a própria reexecução reconcilia pela identidade.
- **Banco perdido ou pausado:** reconstruir do zero, só com migrações, manifesto aprovado e `apply`: migrações (`supabase db reset` local, ou o roteiro do item 5 no destino), aprovar o manifesto, abrir a janela do EX, `apply`, `resumo`. **A migração de correção G2 fecha o `LOGIN` do EX; abra a janela depois de migrar.** O conteúdo reconstruído deve ter o mesmo `resumo`.
- **O que a recarga não restaura:** contas, Auth, segredos, cadastro do RP, OAuth e configuração do provedor. Sem promessa de RPO/RTO; a duração medida abaixo depende do operador.

Reconstrução medida com a carga real (`node scripts/banco/reconstruir.mjs`, máquina local, banco novo): migrações 2,3 s, plano 0,5 s, aprovação 0,3 s, `apply` 2,6 s, **total 5,8 s**; conteúdo idêntico ao original (mesmas identidades, contagens e SHA-256 por tabela). Com o banco derrubado no meio do `apply` (processo real), o resultado foi `not_executed` por falta de conexão; a reconstrução do zero levou 5,9 s e deu conteúdo idêntico. Etapas que dependem do operador: abrir e fechar a janela do EX, aprovar o manifesto como proprietário, guardar a senha e conferir os hashes das fontes.

## 7. Rotação e revogação do EX

- **Rotina:** na janela fechada, `\password rq_executor` e `alter role rq_executor login;`, atualizar `RQ_EXECUTOR_PASSWORD` no ambiente local, `select pg_terminate_backend(pid) from pg_stat_activity where usename = 'rq_executor';` para as sessões antigas, testar com `plan` e fechar a janela. A senha anterior deixa de valer assim que a nova é definida.
- **Incidente (suspeita de vazamento):** fechar já — `alter role rq_executor nologin password null;` e encerrar as sessões — e só então seguir o roteiro de provisionamento do item 5 com nova senha. O agente não repete essa ação nem usa a credencial de proprietário como substituta.
- **Conferência:** o EX não é proprietário, não tem `BYPASSRLS` nem DDL e não lê a lista do RP. `privado.conferir_papel_executor('rq_executor')` e `privado.auditar_exposicao()` (proprietário) comprovam; os testes automatizados estão em `npm run test:rls`.

## 8. Medições de referência (carga real, banco local)

Ciclo 006, issue #50: `npm run medir:carga` mede novamente com as duas tabelas, reconciliação, expiração e rollback `--sem-areas`. Os resultados e limites específicos da execução ficam na task da issue. O teto aprovado para o acréscimo é 10.000.000 bytes; se excedido, parar antes da PR.

| Medida | Valor |
| :-- | :-- |
| Linhas gravadas | 62.636 (10.640 detecções, 51.830 município-dias, 142 municípios, 22 fontes, 2 malhas, 1 carga, 1 vigente) |
| Payload enviado / persistido | 15,3 MB / 17,6 MB (tabelas, TOAST e índices) |
| `apply` / reexecução | 2,1 s / 22 ms |
| WAL / temporários / RSS do cliente | 27,2 MB / 6,4 MB / 419 MB |
| Geometria de exibição persistida (TOAST), conjunto | `minima` 0,15 MB; `intermediaria` 0,39 MB; `maxima` 1,81 MB |
| Resposta de todas as geometrias (1 requisição, bruta / gzip estimado) | `minima` 237 / 64 KB; `intermediaria` 984 / 263 KB; `maxima` 5.134 / 1.199 KB |
| Geometria por município (mediana / máximo, bruta) | `minima` 2 / 4 KB; `intermediaria` 6 / 22 KB; `maxima` 32 / 141 KB |
| Abertura sem geometria / com geometria do conjunto (`intermediaria`) | 2 requisições, 28,6 KB bruta / 3 requisições, 1.013 KB bruta (268 KB gzip estimado) |
| Consultas do RP (bruta; tempo) | resumo da janela 22 KB, 88 ms; detecções, página de 1.000, 360 KB, 28 ms; disponibilidade por município, 365 dias, 87 KB, 24 ms |

O Supabase local não comprime as respostas. “Bruta” é o tamanho que trafegou, e “gzip estimado” é a estimativa com `gzip -6` local. Os indicadores hospedados estão na seção 11. A representação `intermediaria` foi mantida pelo item 4, com a conferência em celular (seção 10 e ADR-007). Estas medidas valem para o recorte de 12 meses de AQUA_M-T em MT em máquina local.

## 9. Fora do que foi provado

Disponibilidade contínua, pausa e retomada no projeto Free, restauração de Auth e segredos, `pg_dump` e `VACUUM FULL`, compressão e consumo sob uso contínuo, medição em celular fora da emulação e carga com mais de um satélite ou de outra janela.

## 10. Guia da interface

Aplicação estática (ADR-007). Diretrizes **efetivamente implementadas** neste protótipo; não são design system nem contrato visual canônico.

### Comandos

| Comando | O que faz |
| :-- | :-- |
| `npm run typecheck` | `tsc --noEmit` sobre `src/` |
| `npm run build` | `vite build` em `dist/` (ignorado pelo Git); exige as variáveis públicas abaixo |
| `npm run test:interface` | Contraste dos pares de cor, lógica pura e inspeção do bundle de produção (sem `local/`, sem segredo, sem dados, sem login por senha) |
| `npm run test:api` | Ciclo 008: `supabase db reset` e o handler real de `/api/explicar` por HTTP local, com Auth e RLS locais, fixture fictícia e provedor simulado (matriz de acesso T4, limites, revogação e troca de carga) |
| `node scripts/agentes/conferir-pacote.mjs` | Ciclo 008: confere o pacote de `.vercel/output` (gerado por `npx --no-install vercel build --standalone`; no Windows, num contêiner `node:24`, porque a CLI cria links simbólicos) — runtime Node 24, handler, execução isolada, 503 desligada e evidências iguais às do código-fonte; exige banco local vazio |
| `npm run test:e2e` | `supabase db reset`, build de teste, Chrome do sistema: sessão, acesso, consulta, estados, acessibilidade, lentes, combinação de lentes, camada de áreas protegidas e sobreposição (82 testes, dados fictícios) |
| `npm run medir:interface` | Medição em celular emulado com a carga real local: malha municipal nas três qualidades e, no ciclo 006, a visão geral da camada de áreas (teto de 600.000 bytes brutos) e o contorno real da maior área (grava `medicao-interface.json` em `local/dados-prototipo/`) |
| `npm run conferir:lentes` | Ciclo 004: publica a carga real local num banco vazio e confere as lentes por SQL independente e a célula de cada detecção pelo texto da fonte (grava `conferencia-lentes.json` em `local/dados-prototipo/`; código 1 em divergência) |
| `npm run conferir:combinacao` | Ciclo 005: publica a carga real local num banco vazio e confere a combinação de lentes célula a célula por SQL independente, em quatro janelas e 8 combinações (grava `conferencia-combinacao.json`; código 1 em divergência) |
| `npm run medir:lentes` | Ciclos 004 e 005: mede cada lente e as 8 configurações da combinação (3 pares e as três, com "e" e "ou") na janela inteira, passagens bruta e comprimida (proxy gzip local), no perfil do ADR-007 (grava `medicao-lentes.json`; código 1 fora do orçamento). Ciclo 006: mede também a sobreposição nas três classes e, fora do aceite, a abertura de duas células por classe (a de mais áreas e a de maior soma de bytes de contorno). `npm run medir:lentes -- sobreposicao` limita às três classes. Ciclo 007: cenário M1 de abertura (recarga com sessão guardada até `data-estado-painel="pronto"`, 5 execuções, mediana comprimida ≤ 5 s); só ele: `npm run medir:lentes -- abertura` |

Variáveis do build (nomes em `.env.example`): `VITE_SUPABASE_URL` (https fora do loopback) e `VITE_SUPABASE_CHAVE_PUBLICAVEL` (chave anon). `VITE_AUTH_SENHA_LOCAL=true` habilita o login por senha **só** em build local de teste. Sem as duas primeiras a página mostra "Configuração ausente" e nenhum dado. A chave de serviço, a senha do EX e o segredo do Google nunca entram no bundle. O destino de deploy, as variáveis da Vercel e os cabeçalhos (CSP, cache) são do item 5.

### Estrutura e papéis de cor

- **Contrato visual (ciclo 007):** `DESIGN.md`, na raiz, é a autoridade de tokens (temas claro e escuro), componentes, layout, estados e acessibilidade; os itens abaixo resumem o que vale fora dele.
- Pergunta → onde → resposta: filtros à esquerda (Consulta aplicada ao mudar, com atalhos de período; seções de lente; "Limpar tudo"), mapa e "Detecções no período" (total, sensibilidade e série) no centro, resultado à direita; tela de acesso própria; "Sobre os dados" e "Como ler esta tela" em diálogos do topo; rodapé com as três frases de domínio. Abaixo de 761 px, uma coluna.
- Ação primária em verde-sálvia preenchido, verbo explícito ("Entrar com o Google", "Entendi"); secundária com contorno de 2 px. Laranja `#f97316` só para detecção. Mapa `#152e27`; seleção azul claro `#93c5fd` com anel tracejado e indicador textual (o azul é só da seleção no mapa).
- Tipografia de sistema (`Segoe UI`, Arial), base `1rem`, entrelinha 1,5, piso de `0.875rem` em etiquetas, legendas e atribuição, nomes de municípios com `1rem` ou mais. Alvos de `2.75rem` (44 px no padrão). Foco visível de 3 px. Tudo em unidades relativas; o zoom do navegador não é limitado.
- Classes de disponibilidade e seleção não dependem só de cor: símbolo, texto e padrão de borda (sólida, tracejada, pontilhada).
- Áreas protegidas (ciclo 006): proteção integral `#86efac` com contorno contínuo e hachura inclinada para a direita; uso sustentável `#c4b5fd`, tracejado, hachura inclinada para a esquerda; terra indígena `#f9a8d4`, pontilhado, hachura vertical (tokens `--area-*`). Contorno real em traço branco, sem preenchimento. A legenda descreve traço e hachura em texto; nenhuma cor sugere ordem ou gravidade.

### Comportamento

- **Estados distintos:** sem sessão; verificando; acesso negado; sem publicação; fonte indisponível; sessão expirada; versão substituída; zero detecções; sensibilidade pendente (nunca zero nem valor parcial); configuração ausente.
- **GMT e Cuiabá:** filtros, série, total, mapa e "Lista de focos" são dias GMT, rotulados. "Sensibilidade — America/Cuiaba" é um campo separado, com contagem, diferença com sinal, limites e versão.
- **Disponibilidade:** três classes por município-dia GMT, com motivo, alcance do histórico e "cobertura não comprovada"; na visão estadual não há status único de Mato Grosso.
- **Dados da fonte** entram como texto. **Nenhum dado de consulta** vai a armazenamento ou cache; sair limpa a tela na hora.
- **Mapa (ciclo 007, ADR-009):** sem tiles de terceiros; mostra todos os pontos do recorte, da leitura completa (nunca parcial); tocar num ponto abre o balão com todos os registros da coordenada; a "Lista de focos", aberta pelo botão do mapa, é a alternativa de teclado; em tela de toque o arraste de um dedo é opt-in.
- **Geometria:** um município por requisição, o conjunto só por pedido; legenda de simplificação quando a malha de exibição não é `maxima`.
- **Coluna de resultado (ciclo 007, ADR-009):** abas "Destaques · N" e "Municípios"; a lente é calculada ao escolher (sem botão), com progresso; selecionar um destaque abre a explicação, com "← Voltar aos destaques"; Municípios ordena por detecções, destaques da lente ou nome, ou mostra o cartão do município escolhido. Leituras completas ficam só em memória (até 3 recortes); trocar de lente no mesmo recorte relê só o resumo.
- **Lentes de seleção (ciclo 004, KB-005):** seletor (concentração, recorrência e persistência), lista, camada própria no mapa (contorno de município ou retângulo de célula, amarelo claro; selecionado tracejado azul claro) e painel de motivo, evidência, cobertura e ressalvas. Recorte: estado inteiro na janela da consulta (o filtro de município não se aplica). Só a concentração ordena, rotulada como contagem; a recorrência lista as células de norte a sul e de oeste a leste, declarando que não é ranking, marca os meses parciais e mostra "janela insuficiente" quando a janela toca menos de 3 meses GMT; a persistência lista cada sequência de 3 ou mais dias GMT seguidos pela data de início e depois pela célula, declarando que não é ranking, com as ressalvas por classe do dia (cada uma com os municípios, a classe e os motivos daquele dia) e a de borda da janela. Nas células, o painel lista os municípios usados na cobertura e a tabela paginada das detecções da evidência ("N de M"). Cobertura em "N de M dias sem evidência de lacuna (cobertura não comprovada)", nunca "coberto". Estados próprios (carregando com progresso, concluída em X s, sem destaques, janela insuficiente, cobertura não verificada, contorno indisponível, leitura inconsistente, falha, cancelada); "Nenhuma", nova janela, troca de versão e saída invalidam a aplicação em curso. Resultados e registros reaproveitáveis ficam só em memória.
- **Combinação de lentes (ciclo 005, KB-005):** opção "Combinação de lentes" do seletor, com os grupos "Lentes a combinar" (caixas) e "Operador" ("e" ou "ou"), em `fieldset` e `legend`, com o rótulo inteiro como alvo de 44 px. Desde o ciclo 007, a configuração vale ao mudar e recalcula (abre com Concentração, Recorrência e "e"); com menos de 2 lentes, nada é calculado e a aba diz "Escolha pelo menos 2 lentes para combinar.". O cabeçalho mostra a configuração aplicada, `combinacao-005-v1` sobre `lentes-004-v1`, carga, janela, recorte, parâmetros e "Ordem fixa pela posição da célula (norte→sul, oeste→leste); não é ranking.". Lista paginada em 50 células ("Células X a Y de M."), cada uma com as lentes que a destacaram por nome, sem número de lentes, e a cobertura; retângulos na camada de destaques, com a contagem desenhada declarada. Painel com um bloco por critério e um item por destaque original (cada sequência da persistência com as suas ressalvas), cobertura da célula com os municípios usados e evidência em união paginada em 20, com a coluna "Lentes". Estados: carregando, "Combinação concluída em X s", sem célula em comum ("e"), sem células destacadas ("ou"), indisponível (nomeando a lente), cobertura não verificada, leitura inconsistente, versão substituída, falha e cancelada. Limitações (com o efeito do operador) e aviso de domínio sempre visíveis.
- **Camada de áreas protegidas (ciclo 006, KB-006):** botão "Mostrar áreas protegidas" nas ferramentas do mapa. Nada é lido na abertura; o primeiro pedido lê a visão geral pelo leitor T25 (contorno simplificado e atributos) e a mantém em memória enquanto sessão e carga forem as mesmas; ocultar e mostrar de novo não relê. Legenda em texto por classe (traço, hachura e número de áreas), aviso de que áreas de outros estados sem detecção desta carga não aparecem, exclusões, contorno simplificado e atribuição (fonte, retrato, data e condições de uso), repetida no cartão de Proveniência. Tocar numa área mostra nome, classe, categoria ou fase, esfera, qualidade do polígono e fonte, com "Ver contorno real", que baixa só aquela área. Estados: oculta, carregando, visível, sem camada ("esta versão dos dados não tem a camada de áreas protegidas"), leitura inconsistente e falha, com "Tentar de novo".
- **Sobreposição com áreas protegidas (ciclo 006, KB-005):** opção do seletor com o grupo de rádio "Classe de área protegida" (uma classe por cálculo; abre com "Proteção integral" e recalcula ao trocar a classe, desde o ciclo 007). Cabeçalho com a classe aplicada, `sobreposicao-006-v1`, carga, janela, recorte e parâmetros; lista em 50 células por página na ordem T5, declarando que não é ranking, com as detecções vinculadas e o nome das áreas de cada célula; retângulos na camada de destaques. Ao abrir uma célula, o painel mostra o motivo, um bloco por área (atributos, detecções vinculadas, sobre o limite, ressalvas e "Ver dados e contorno de …"), a cobertura com os municípios usados, o aviso de domínio e a evidência paginada em 20 com a coluna "Áreas"; a interface baixa o contorno real de cada área da célula, uma requisição por área, e o guarda em memória (reabrir não repete). Estados: carregando (registros, áreas e vínculos, disponibilidade), concluída, sem destaques (texto de T23), carga sem camada, cobertura não verificada, leitura inconsistente, versão substituída, falha e cancelada. Perda de acesso, sessão expirada e troca de versão limpam lente, camada, contornos e memória.
- **Comparação (ciclo 008, KB-007):** seção "Comparar" dos filtros ("Sem comparação", "Dois períodos", "Dois municípios") e aba "Comparação", que só aparece com um modo. A é sempre o recorte aplicado; B é o período (mesmo número de dias GMT, preenchido com o anterior a A) ou o município escolhido. Os dois lados usam a lente escolhida com os mesmos parâmetros; a aba mostra A, B e B − A, a conclusão comparativa (ou por que ela está suspensa ou indisponível), as unidades que entraram, saíram ou permaneceram nos destaques observados com as evidências de cada lado, a disponibilidade por município e lado e, entre municípios, "Ver contexto estadual". "Mapa: A" e "Mapa: B" trocam o lado desenhado, com o rótulo sobre o mapa; série, cartões e as demais abas ficam em A. Um lado sem detecções confere a disponibilidade de todos os municípios do seu recorte antes de concluir. Trocar recorte, lente, sessão ou versão refaz a comparação; "Limpar tudo" a desliga.

### Verificação e limites

- Reflow a 320 px e texto a 200% foram verificados por script (sem rolagem horizontal global nem conteúdo cortado), com as exceções bidimensionais do mapa e das tabelas. Escala de cinza: verificada por estilos e por captura de trabalho em `test-results/` (ignorada); o contraste azul/verde não é o que distingue ação primária de secundária.
- Não foi provado: leitor de tela real, toque físico, Google OAuth real, desempenho em aparelho real, conformidade integral com a WCAG, egress hospedado.
- Dados do E2E: três municípios inventados (`99000xx`), contas `.test` criadas e removidas pelo próprio teste, senhas geradas na hora.

## 11. Roteiro do item 5 — operação hospedada (atos do responsável)

**Atualização do ciclo 006:** depois do merge da issue #50, somente o responsável aplica a migração e a carga hospedadas conforme o roteiro específico da task da issue. Antes do `db push`, comparar `--dry-run` com as migrações pendentes do repositório, sem reset ou repair; conferir manifesto e identidade local; aprovar o manifesto como proprietário, abrir e fechar a janela EX e verificar `auditar_exposicao()` vazia. A ação hospedada não foi executada pelo agente nem é coberta pela autorização de implementação.

Escopo: issue #24 do ciclo `003`. **Nada daqui começa antes da PR técnica integrada** (merge aprovado, commit na `main`). O agente prepara este roteiro, confere por leitura o que alcançar e executa só a carga pelo EX; todo o resto é seu. O agente nunca recebe senha de proprietário, token da CLI, chave secreta (`sb_secret_…`, `service_role`), segredo do Google, senha do EX no chat, UUID ou e-mail reais. Ao concluir cada etapa, responda "concluí a ação externa da issue #24" **dizendo o número da etapa** e colando só as saídas sanitizadas pedidas. Dúvida, divergência, cobrança, cartão, trial, cota insuficiente ou comando que não bate com o esperado: **pare e conte ao agente**.

Condições conferidas na documentação dos provedores em 2026-11-07 e que devem ser conferidas de novo no painel no momento: Supabase Free (500 MB de banco por projeto, 5 GB de egress, 50.000 usuários ativos, limite de 2 projetos ativos, pausa após 1 semana de inatividade, sem backups automáticos); Vercel Hobby (uso pessoal e não comercial, 100 GB/mês de transferência, sem compra de excedente; repositório privado só de conta pessoal). Nada disso prova o saldo da sua conta.

| # | Etapa | Quem | Retorno ao agente (sem segredo) |
| :-- | :-- | :-- | :-- |
| 0 | Confirmar a finalidade | Responsável | Texto curto: o protótipo é de uso pessoal e não comercial? |
| 1 | Contas e projeto Supabase | Responsável | Plano, região, referência do projeto, cotas e consumo exibidos |
| 2 | Migrações e papel EX | Responsável | Saída do `--dry-run` e das consultas de conferência |
| 3 | Senha do EX e cofre | Responsável | "Senha definida; EX continua sem login" |
| 4 | Vercel, Google OAuth e Supabase Auth | Responsável | Domínio, commit do deploy, variáveis presentes (só os nomes) |
| 5 | Primeiro login, ainda sem dados | Responsável | "Login funcionou e a consulta foi negada" |
| 6 | Cadastro do UUID do responsável | Responsável | Contagem da lista (1), sem o UUID |
| 7 | Dry-run, aprovação e carga | Agente (EX) + responsável nas partes administrativas | Conferido pelo agente na carga |

### Etapa 0 — finalidade

A Vercel limita o Hobby a uso pessoal e não comercial (comercial inclui receber para criar ou hospedar o site, vender produto ou serviço, anúncios). Escreva ao agente se este protótipo se enquadra. **O aceite das sugestões do plano não comprova isso.** Em dúvida (uso em nome de instituição, projeto financiado, cliente), pare: as opções são decidir com a Vercel ou outra hospedagem estática, sem contratar plano. Não se presume enquadramento.

### Etapa 1 — contas e projeto

1. Supabase: conta gratuita, **sem cartão e sem upgrade**. Crie um projeto novo (nome neutro) na região que preferir. Guarde a **senha do banco** só em cofre. Anote a **referência do projeto** (`<REF>`, 20 caracteres, não é segredo) e a URL `https://<REF>.supabase.co`.
2. Confira no painel (Settings, Usage): plano Free, banco em uso e cota de egress. Informe os números ao agente. Banco acima de 400 MB já é parada do plano; abaixo disso, ainda valem as demais cotas.
3. Vercel: conta Hobby **sem cartão**, ligada à sua conta pessoal do GitHub (o repositório `EuThiagoAndrade/rastro-quente` é privado e de conta pessoal). Ainda não importe nada.
4. Google Cloud: projeto próprio, sem faturamento, para o cliente OAuth (etapa 4).

Parar se: cobrança, cartão ou trial aparecerem; o plano não for Free/Hobby; o projeto já existir com dados; a cota for insuficiente.

### Etapa 2 — migrações e papel EX

Na raiz do repositório, em `main` atualizada e limpa, na sua máquina:

```bash
npx supabase login
npx supabase link --project-ref <REF>
npx supabase db push --linked --dry-run
```

O `login` usa um token pessoal e o `link` pede a senha do banco (ou `SUPABASE_DB_PASSWORD` no seu processo). Nenhum dos dois vai ao agente, à Vercel ou à CI. O `--dry-run` deve listar **exatamente** as migrações de `supabase/migrations/`, em ordem, e nenhuma outra. Envie a lista ao agente. Divergência, projeto já com histórico ou pedido de reset/repair: pare.

```bash
npx supabase db push --linked
```

Conferência no SQL Editor do painel (cole só os resultados; não há segredo neles):

```sql
select version from supabase_migrations.schema_migrations order by 1;
select rolname, rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication
  from pg_roles where rolname = 'rq_executor';
select privado.conferir_papel_executor('rq_executor');
select * from privado.auditar_exposicao();
select has_table_privilege('service_role', 'public.deteccoes', 'SELECT') as service_role_le;
select n.nspname, c.relname, c.relrowsecurity
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'privado') and c.relkind = 'r' order by 1, 2;
select extname from pg_extension order by 1;
```

Esperado: as versões do repositório; `rq_executor` com `rolcanlogin` falso e todos os demais atributos falsos; a função sem erro; `auditar_exposicao()` vazia; `service_role_le` falso (a migração `20261108120000` revoga os privilégios de `service_role` em `public`); `relrowsecurity` verdadeiro em todas as tabelas; **guarde a lista de extensões** para compará-la depois da carga. Se o EX no destino se comportar diferente do local (ADR-005, D3), pare.

### Etapa 3 — senha do EX

Com o `psql` (cliente PostgreSQL), conectado como proprietário pelo **pooler de sessão** (host copiado do diálogo Connect do painel; usuário `postgres.<REF>`; porta 5432; `sslmode=require`):

```text
\password rq_executor
```

A senha é cifrada no cliente e não aparece em log. Sem `psql`, a alternativa é `alter role rq_executor password '…';` no SQL Editor, que **grava a senha no histórico de consultas do painel**: só se você aceitar esse risco e rotacionar depois (seção 7). Não ligue o `LOGIN` agora. Guarde a senha em cofre e, para a carga, num arquivo **ignorado pelo Git**, fora do chat: `local/segredos/ex.env`, com uma linha `RQ_EXECUTOR_PASSWORD=…`. O agente só passa o caminho desse arquivo a `node --env-file`; ele não lê nem imprime seu conteúdo.

### Etapa 4 — Vercel, Google OAuth e Supabase Auth

**4a. Vercel.** Importe o repositório (Git integration), branch de produção `main`, framework Vite (ou Other): o `vercel.json` já fixa `npm ci`, `npm run build` e a saída `dist`, e desliga deploys de outras branches e de PRs. Antes do primeiro deploy, defina **somente** estas duas variáveis, no escopo **Production**:

| Variável | Valor | É público? |
| :-- | :-- | :-- |
| `VITE_SUPABASE_URL` | `https://<REF>.supabase.co` | Sim, vai no bundle |
| `VITE_SUPABASE_CHAVE_PUBLICAVEL` | chave **publicável** (`sb_publishable_…`, Settings, API Keys) ou a `anon` legada | Sim, vai no bundle |

Nunca crie variável com a senha do banco, a do EX, `sb_secret_…`, `service_role` ou o segredo do Google, em nenhum escopo. Não use `VITE_AUTH_SENHA_LOCAL`. Faça o deploy e anote o **domínio** (`<DOMINIO>`, por exemplo `https://nome.vercel.app`) e o **SHA do commit** do deployment; ele deve ser o da `main` integrada. Mudança de variável só vale para deploys novos.

**4b. Google Cloud.** Google Auth Platform: tela de consentimento externa (pode ficar em modo de teste; acrescente como usuário de teste sua conta e a conta de teste que será usada como "outro autenticado"), depois Clients, tipo **Web application**. Em *Authorized JavaScript origins*, `<DOMINIO>`; em *Authorized redirect URIs*, o endereço de retorno **copiado da página do provedor Google no painel do Supabase** (Authentication, Providers). Escopos: os padrões (`openid`, e-mail e perfil). Guarde o ID e o segredo do cliente só no cofre.

**4c. Supabase Auth.** Authentication, Providers, Google: ative e cole o ID e o segredo (o segredo fica **só** no Supabase). Authentication, URL Configuration: *Site URL* = `<DOMINIO>`, *Redirect URLs* = o mesmo endereço exato, sem curinga. Recomendado e opcional: desligar o provedor de e-mail e o login anônimo, pois a interface só usa Google (quem entrar por outro caminho seria "outro autenticado", sem dados).

Confirmar ao agente: domínio, SHA do commit, nomes das variáveis (sem valores), plano ainda Hobby. Parar se a Vercel pedir cartão, plano pago ou apontar uso comercial; se o deploy não vier da `main` integrada; se aparecer variável sensível.

### Etapa 5 — primeiro login, ainda sem dados

Abra `<DOMINIO>` no seu navegador e entre com a conta Google que será a do responsável. O esperado é a sessão abrir e a interface mostrar **acesso negado** (você ainda não está na lista). Se aparecer qualquer dado, pare: é falha de acesso.

### Etapa 6 — cadastro do UUID

1. Painel, Authentication, Users: confira que a linha é da **sua** conta, provedor Google, e copie o **User UID**. Não o envie ao agente, a issue, commit ou log.
2. No SQL Editor, como proprietário, e só com o seu UUID no lugar:

```sql
insert into privado.responsaveis_autorizados (user_id) values ('<seu UUID>');
select count(*) from privado.responsaveis_autorizados;
```

Esperado: contagem 1 e nenhuma outra conta cadastrada. Retorne só "contagem 1". Troca ou revogação posterior é administração sua, com `delete` nessa tabela; a próxima consulta já nega.

### Etapa 7 — dry-run, aprovação e carga

Só depois das etapas 1 a 6 conferidas, da PR técnica integrada e de o agente registrar na task o alvo, o manifesto e o consumo. A autorização do agente é a frase "autorizo a implementação da issue #24" (já registrada na task); ela cobre **somente** o que segue, pelo EX, e nada mais:

1. **Responsável** abre a janela: `alter role rq_executor login;` (SQL Editor ou `psql`). Avise o agente.
2. **Agente**, na máquina dele, com `RQ_EXECUTOR_PASSWORD` vindo de `local/segredos/ex.env`:

```bash
node --env-file=local/segredos/ex.env scripts/banco/carga.mjs plan --alvo "postgresql://rq_executor.<REF>@<host do pooler de sessão>:5432/postgres?sslmode=require" --sql local/dados-prototipo/aprovacao.sql
```

   Usa-se o **pooler de sessão (5432)**, nunca o de transação (6543). A conexão direta (`db.<REF>.supabase.co`) é só IPv6 no plano Free. O plano mostra consumo existente, pico previsto e margem; acima de 400.000.000 bytes ou sem estimativa, **para**. Se a conexão falhar por certificado, baixe o certificado da CA do Supabase em Database, Settings, SSL, salve em `local/segredos/supabase-ca.crt` e o agente repete com `NODE_EXTRA_CA_CERTS` apontando para ele: não se desliga a verificação. Se falhar com "Tenant or user not found", o host ou o usuário do pooler estão errados: pare e confira no diálogo Connect.
3. **Responsável** revisa `aprovacao.sql` (conferir identidade, hashes e totais do plano) e o executa como proprietário no SQL Editor.
4. **Agente** executa `apply --identidade <hex do plano>` e depois `resumo`. A carga é uma transação: falha antes do commit mantém o banco como estava.
5. **Responsável** fecha a janela: `alter role rq_executor nologin;`, roda `select * from privado.auditar_exposicao();` (esperado: vazia) e compara `select extname from pg_extension order by 1;` com a lista guardada na etapa 2.
6. **Agente** registra na task o consumo antes e depois, a duração e o `resumo` sanitizado.

Reexecutar o mesmo `apply` é seguro (reconcilia pela identidade). Não existe `force`; reversão é nova revisão do mesmo conteúdo (seção 3). **Não se faz ensaio destrutivo, expurgo ou reset no destino.**

### Depois da carga

O agente pede a frase **"autorizo a verificação em produção do ciclo 003"** e só então executa o roteiro previsto no plano: login do responsável, bloqueio de anônimo e de "outro autenticado", filtros e contagens contra o total de referência, mapa, tabela, proveniência e estados. A inspeção do bundle publicado e as chamadas anônimas diretas à API entram nessa verificação.

### Primeira operação hospedada

Em 2026-11-10, a carga inicial da janela GMT de novembro de 2025 a outubro de 2026 levou 20,6 s. O banco lógico passou de 11,9 MB para 29,5 MB (`pg_database_size`), com 10.640 detecções em 142 municípios. Identidade, contagens e hashes das cinco tabelas coincidiram com a reprodução local. Depois da carga, o responsável fechou o `LOGIN` do EX, confirmou a auditoria vazia e conferiu a lista de extensões.

Após a verificação, o painel exibiu Database Size de 0,045/0,5 GB, Egress de 0/5 GB (menos de 1%) e Cached Egress de 0/5 GB. Os valores refletem a precisão e o período exibidos pelo painel. A interface confirmou o login do responsável, as contagens de Mato Grosso e Colniza e o bloqueio da segunda conta. A API bloqueou as consultas anônimas testadas. A reconstrução local levou 5,8 s.

### Pausa e retomada (não simuladas)

O Supabase Free pausa o projeto após uma semana de inatividade. **Isso não foi simulado nem testado.** O que se sabe: a retomada é manual, no painel, e o que a recarga de dados não restaura são contas, Auth, segredos, o cadastro do responsável e o provedor Google (seção 6). Sem promessa de disponibilidade contínua, de prazo de recuperação ou de gratuidade incondicional.

## 12. Ciclo 008, item 5 — IA hospedada: configuração, verificação e desligamento

Escopo: issue #81 (plano 008, T6 e T9). **Nada daqui começa antes da PR de preparação integrada** (merge aprovado, commit na `main`, deploy de produção dessa `main`). O agente prepara o roteiro, confere por leitura o que alcançar e faz só as sondagens anônimas; contas, painéis, variáveis e as sessões Google são do responsável. O agente nunca recebe a chave do Gemini, JWT, UUID, e-mail ou senha. Dúvida, cobrança, cartão, trial, faturamento, cota insuficiente ou divergência: **pare e conte ao agente**.

A IA fica **desligada** até a etapa B. Desligada, `/api/explicar` responde 503 a qualquer pedido, sem ler dados nem chamar o provedor, e a consulta, as lentes e a comparação continuam funcionando sem IA (ADR-011).

### Variáveis da função (somente nomes; valores só no painel da Vercel)

Escopo **Production**. Nenhuma tem prefixo `VITE_` e nenhuma vai ao bundle. A Vercel só aplica variáveis a deploys novos: toda mudança exige **Redeploy** da produção atual.

| Variável | Valor | Sensível? |
| :-- | :-- | :-- |
| `RQ_IA_HABILITADA` | ausente na etapa A; `true` só na etapa B. Qualquer outro valor desliga | Não |
| `RQ_SUPABASE_URL` | o mesmo valor de `VITE_SUPABASE_URL` | Não (pública) |
| `RQ_SUPABASE_CHAVE_PUBLICAVEL` | o mesmo valor de `VITE_SUPABASE_CHAVE_PUBLICAVEL` (publicável, nunca `sb_secret_…` ou `service_role`) | Não (pública) |
| `RQ_GEMINI_CHAVE` | chave da API do projeto Gemini do nível gratuito | **Sim**: marcar como *Sensitive* |
| `RQ_GEMINI_MODELO` | exatamente `gemini-3.1-flash-lite` (outro valor desliga a função) | Não |
| `RQ_GEMINI_INTERVALO_MS` | opcional; ausente = sem espera. Usar só se a cota por minuto conferida for menor que 6 (por exemplo `13000` para RPM 5) | Não |
| `RQ_ORIGENS` | opcional; deixar ausente (a própria origem já é aceita) | Não |

A chave do Gemini **não** entra em `.env.example`, issue, PR, chat, log ou print. Na prova local, ela continua só no `.env` ignorado (`scripts/agentes/prova-real.mjs`).

### Etapa A — configuração com a IA desligada (primeira ação externa)

1. **Gemini (AI Studio):** confira que o projeto continua no **nível gratuito**, sem faturamento ligado, e anote RPM, TPM e RPD de `gemini-3.1-flash-lite` exibidos para o projeto (na issue #79: RPM 15, TPM 250 mil, RPD 500). Uma pergunta de comparação faz até 6 chamadas respondidas (até 12 pedidos com a repetição única em 503); o roteiro da etapa C gasta cerca de 30. Se a cota mudou e não comporta isso, pare.
2. **Vercel:** plano Hobby, sem cartão. Em Settings, Functions, confira que **Fluid compute** está ligado (padrão de projetos novos desde abril de 2025). Com ele, o Hobby admite até 300 s por função, o valor fixado em `vercel.json` para `api/explicar.ts`; respostas em fluxo contam nesse limite. Se o deploy da `main` integrada falhar por `maxDuration` ou Fluid compute, pare; não troque de plano.
3. Cadastre as variáveis da tabela **sem** `RQ_IA_HABILITADA` e faça **Redeploy** da produção atual.
4. **Logs:** em Logs/Observability, anote a retenção exibida para o plano. Os registros da função trazem só `funcao`, `etapa`, `ms`, `codigo`, `chamadas` e `tokens`. Registros internos da Vercel e do Google não são controlados pelo projeto.

Retorno ao agente: "concluí a ação externa da issue #81" **dizendo "etapa A"**, com domínio, SHA do deploy, nomes das variáveis (sem valores), cotas exibidas, estado do Fluid compute e retenção dos logs.

### Verificação desligada (agente, depois de "autorizo a verificação em produção do ciclo 008")

Sem sessão e sem dados:

- `GET` e `POST` anônimos em `<DOMINIO>/api/explicar` → **503**, sem dados nem detalhe do ambiente;
- bundle publicado (`index.html` e `/assets/*.js`) sem `RQ_GEMINI`, `generativelanguage`, `AIza` nem a chave;
- cabeçalhos da página (CSP, `X-Content-Type-Options`) iguais aos de `vercel.json`;
- na interface, o responsável confirma que consulta, lentes e comparação funcionam e que o painel de perguntas mostra a IA indisponível.

Só depois disso, a etapa B.

### Etapa B — habilitação (segunda ação externa)

Cadastre `RQ_IA_HABILITADA` = `true` (Production) e faça **Redeploy**. Retorno: "concluí a ação externa da issue #81" **dizendo "etapa B"**, com o SHA do novo deploy.

### Etapa C — verificação habilitada e demonstração (T9)

Execução conjunta: o responsável usa a interface com a própria sessão; o agente faz as sondagens anônimas e registra as evidências. Espaçar as perguntas em cerca de 60 s, como na prova local.

| # | Caso | Quem | Esperado |
| :-- | :-- | :-- | :-- |
| C1 | Anônimos: `GET`; `POST` com `Origin` de outro site; `POST` com corpo válido sem `Authorization`; o mesmo com JWT inválido | Agente | 405; 403 `origem_negada`; 401; 401. Todos em JSON, sem fluxo, sem dados e sem chamada ao provedor (a função não lê dados antes do JWT) |
| C2 | Outra conta Google, fora da lista de responsáveis | Responsável | Acesso negado na tela, sem resposta da IA |
| C3 | "O que mudou entre estes períodos?" com dois períodos comparados | Responsável | Etapas reais: principal, os **dois** subagentes e síntese; até 6 chamadas; "Gerado por IA"; números iguais aos do detalhamento sem IA |
| C4 | "Há lacunas nos dados?" | Responsável | Delegação só ao subagente de disponibilidade |
| C5 | Pergunta causal ("Por que as detecções diminuíram?") | Responsável | Resposta parcial, com a nota fixa de causa fora das evidências |
| C6 | Pergunta de autoria ("Quem colocou fogo em …?") | Responsável | Recusa com o texto fixo, 1 chamada |
| C7 | "Comparar municípios" e uma pergunta em texto livre | Responsável | Seletor do município B; resposta sobre o par escolhido |
| C8 | Cancelar durante a execução; trocar o período B durante outra | Responsável | Execução encerrada, sem resposta tardia |
| C9 | Falha do provedor | Responsável (ambiente) e agente | Ver abaixo |
| C10 | Fluxo e logs | Responsável | Na aba Rede, `/api/explicar` com `application/x-ndjson` e etapas chegando ao longo da execução; nos logs da Vercel, só os campos da etapa A, sem pergunta, resposta, JWT ou ID |

**C9 — falha controlada.** A cota diária não é esgotada de propósito. Se um 429, 503 ou tempo esgotado ocorrer naturalmente em C3–C8, é registrado como observado. Senão, o responsável troca temporariamente `RQ_GEMINI_CHAVE` por um valor inválido e faz Redeploy: uma pergunta deve terminar em erro claro, com comparação e consulta ainda utilizáveis. Depois, restaura a chave e faz Redeploy. Esse ensaio faz parte da etapa B e é informado ao agente; sem ele, C9 fica registrado como "não executado em produção".

Evidências em `_project/drafts/008_comparacao_periodos_agentes/008_validation_agentes.md`: data, SHA do deploy, modelo, cotas exibidas e, por caso, etapas, número de chamadas, duração, estado e conferência dos fatos contra o detalhamento. O relatório distingue observado em produção, observado só localmente, simulado e não executado. Nada de chave, JWT, UUID, e-mail ou dados de conta; prints, se houver, sem dados de conta.

### Desligamento de emergência

Em ordem, ao primeiro sinal de cobrança, abuso, vazamento ou resposta indevida:

1. **AI Studio:** revogue a chave do projeto. O efeito é imediato e as chamadas passam a falhar, sem custo.
2. **Vercel:** remova `RQ_IA_HABILITADA` (ou troque o valor) e faça **Redeploy**. A função volta ao 503 sem chamar o provedor.
3. Confira: `GET` e `POST` anônimos → 503; consulta, lentes e comparação funcionando.

Não mexa em dados, cargas, políticas RLS ou na lista de responsáveis para conter falha da IA. Reverter código só por PR autorizada. Para religar, use uma chave nova (rotação), cadastrada como *Sensitive*, e repita as etapas B e C no que for afetado.

### Fora do que este roteiro prova

Não comprova que a Vercel ou o Google apagam o conteúdo enviado (os termos do nível gratuito admitem uso para melhoria e revisão humana; D7), limite de uso por usuário (as cotas são as do projeto Gemini), disponibilidade contínua do modelo, nem síntese de IA de todo o estado acima de 270 s (T6).
