# Runbook do protótipo — carga, cópia, expiração, recuperação e rotação do EX

Escopo: operação **local** da carga de dados (ciclo `003`, item 3). A operação hospedada (contas, migrações no destino, senha do EX, deploy, primeiro login, cadastro do RP) é o roteiro do item 5, e atos administrativos são do responsável. O guia da interface será acrescentado pelo item 4. Decisão e medições: [ADR-006](../_project/decisions/ADR-006_carga_idempotente_unica_transacao.md). Papéis e matriz de acesso: [ADR-005](../_project/decisions/ADR-005_banco_autorizacao_prototipo.md). Focos e sobreposições não comprovam incêndio, dano, autoria ou infração.

Nada aqui autoriza teste destrutivo em produção. Nenhum comando abaixo pede segredo como argumento: a senha do EX vive só em `RQ_EXECUTOR_PASSWORD`, no ambiente do processo.

## 1. Pré-requisitos

- Node.js 24+, `npm ci`, Docker e `npx supabase start` (local).
- Insumos do item 1 em `local/dados-prototipo/` (fora do Git): `brutos/`, `saidas/` e `relatorio.json` gerados por `node scripts/prototipo/prototipo.mjs processar`, sem paradas. `scripts/prototipo/fontes.json` e `avisos.json` (no Git) fixam as fontes por SHA-256 e a regra de histórico.
- O EX (`rq_executor`) é criado sem `LOGIN` pelas migrações. O responsável abre a janela de carga e a fecha ao final.

## 2. Atualizar os dados (versão nova)

1. **Gerar os insumos.** `janela`, `obter` e `processar` do item 1. Fonte corrigida, janela diferente ou método corrigido mudam os hashes e, portanto, a identidade.
2. **Plano, sem escrita.** `node scripts/banco/carga.mjs plan --alvo postgresql://rq_executor@127.0.0.1:55322/postgres --sql aprovacao.sql`
   (a URL não leva senha; fora do loopback exige `?sslmode=require`). Sem `--alvo`, `--offline` só calcula o manifesto e **para** (`sem_consulta_ao_alvo`): sem o consumo do alvo não há prova de margem. Opções: `--exibicao maxima|intermediaria|minima` (padrão `intermediaria`) e `--revisao N` (padrão 1).
   O plano mostra: identidade, totais, bytes a gravar, consumo existente, pico previsto e margem em relação ao teto de **400.000.000 bytes**, versão vigente, estado da carga e pendências.
3. **Conferir o plano.** Paradas (`pico_acima_do_teto_de_banco`, `estimativa_insuficiente_para_provar_margem`, `carga_retirada`, `carga_em_estado_ambiguo`) interrompem. Pico igual ao teto não para, mas não dispensa conferir disco, egress, conta/organização, CI e Vercel (item 5), sem somar franquias diferentes.
4. **Aprovar o manifesto (administrador).** Revisar `aprovacao.sql` e executá-lo como proprietário do banco. O EX só lê `privado.manifestos_aprovados`.
5. **Abrir a janela do EX (administrador).** `\password rq_executor` no `psql` (a senha é cifrada no cliente e não aparece no log) e `alter role rq_executor login;`. Guardar a senha em cofre ou ambiente local ignorado.
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

O Supabase local **não comprime** respostas: "bruta" é o tamanho que trafegou; "gzip estimado" é `gzip -6` local e não prova o tráfego hospedado. O egress real depende da compressão do destino e será medido no item 5. A escolha final da representação (`intermediaria` é o padrão da carga) é do item 4, com a conferência em celular. Estas medidas valem para o recorte de 12 meses de AQUA_M-T em MT, em máquina local.

## 9. Fora do que foi provado

Banco hospedado, quotas e preços do provedor, disponibilidade contínua, restauração de Auth e segredos, `pg_dump` e `VACUUM FULL`, compressão e egress reais, medição em celular e carga com mais de um satélite ou de outra janela.
