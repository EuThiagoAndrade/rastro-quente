---
title: "Banco local, autorização RLS e papel executor do protótipo"
tags:
  - arquitetura
  - banco
  - G2
author: "Claude Code (Opus 5.5)"
module: "supabase"
last_updated: "2026-11-07"
origin_cycle: "003"
---

# ADR-005: Banco local, autorização RLS e papel executor do protótipo

## Status

Aceito. Decisão técnica do item 2 do plano `003` v4 (aprovado em 2026-11-05), implementada na issue #21 sob a autorização literal "autorizo a implementação da issue #21" de 2026-11-07. Vigora com a integração da PR correspondente.

## Contexto

O plano `003` exige provar autorização além do login (PF3) antes de qualquer carga hospedada: matriz AN/RP/OA/EX, RLS em toda tabela `public`, lista privada do RP pelo UUID de `auth.users`, papel executor (EX) com privilégio mínimo e um contrato de consulta que fixe a versão dos dados. O item 1 mediu o volume (10.640 detecções principais, envelope vazio, 51.830 município-dias de disponibilidade, 142 municípios). Não havia banco, migração ou CLI Supabase no repositório; Docker estava disponível na máquina do responsável.

## Decisão

**Ambiente local.** Supabase CLI `2.122.1` (MIT) fixada como `devDependency` no `package-lock.json`, sobre Docker. `supabase/config.toml` sobe só banco, Auth, PostgREST e gateway, nas portas `5532x`, para não colidir com outros projetos locais. A API expõe só o schema `public`, com `max_rows = 1000`. Google OAuth fica preparado e desligado; valores reais só por variáveis de ambiente (`.env.example` sem valores).

**Schema (`supabase/migrations/`).** Sete tabelas em `public`:

| Tabela | Conteúdo |
| :-- | :-- |
| `cargas` | Versão de dados: identidade SHA-256 do manifesto canônico, janela GMT, envelope, fuso da sensibilidade, método, totais declarados e estado `preparacao`, `publicada` ou `retirada`. |
| `publicacao_vigente` | Linha única com chave composta para `cargas (id, estado)`: só aponta para carga publicada e impede retirar a vigente. |
| `fontes` | Proveniência sanitizada: URL pública, SHA-256, bytes, data e condições de uso. |
| `malhas` | Malha de classificação e de exibição da carga, com qualidade e parâmetros. |
| `municipios` | Código, nome e geometria de exibição (GeoJSON) por carga. |
| `deteccoes` | Identidade técnica, `id_fonte` sem unicidade, escopo `principal`/`envelope`, instante GMT, coordenadas, município IBGE, posição e códigos do INPE. |
| `disponibilidade` | Dia GMT × satélite × município, classe D1, motivos, alcance do histórico e avisos. |

Gatilhos garantem, para qualquer papel: carga nasce em preparação; transições só `preparacao→publicada`, `preparacao→retirada` e `publicada→retirada`; campos da carga são imutáveis; a publicação confere as contagens declaradas, o escopo temporal das detecções e as duas malhas; linhas só entram em carga em preparação, nunca mudam e não saem de carga publicada. Carga parcial, portanto, nunca fica legível.

**Autorização.** Schema `privado`, fora da API, com `responsaveis_autorizados (user_id → auth.users.id)`. A única função `security definer` é `privado.eh_responsavel()`: responde só se `auth.uid()` está na lista, com `search_path` vazio. Nada autoriza por e-mail, nome ou metadado. As políticas de leitura (`to authenticated`) exigem `eh_responsavel()` e carga publicada. `anon` não tem privilégio em tabela ou função; `authenticated` tem só `SELECT` nas tabelas e `EXECUTE` nas três consultas. O cadastro e a revogação do RP são administração externa (SQL como proprietário), nunca pela aplicação ou pelo EX.

**Executor EX.** Papel `rq_executor`, criado em migração com `LOGIN` sem senha, sem `SUPERUSER`, `BYPASSRLS`, `CREATEROLE`, `CREATEDB`, replicação, herança ou associação a outro papel, e sem posse de objetos. Lê o schema de dados, insere e apaga linhas (gatilhos limitam), muda só `cargas.estado` e a publicação vigente. Não acessa `privado`, não executa funções do projeto, não altera schema, grants nem RLS. A senha é definida pelo responsável fora do repositório (item 5).

**Contrato de consulta.** Três funções `security invoker`, `stable`, com `search_path` vazio, cada uma devolvendo a carga usada:

- `consultar_resumo(p_inicio, p_fim, p_municipio, p_carga)`: total principal GMT exato, série diária GMT com zeros, totais por município em ordem alfabética e sensibilidade `America/Cuiaba` em campo separado (total, diferença e intervalo). Sensibilidade sem cobertura do envelope é `completa = false`, com total nulo.
- `consultar_deteccoes(…, p_limite 1–1000, p_deslocamento)`: registros principais paginados com total exato independente da página.
- `consultar_disponibilidade(…)`: município-dias por classe e por alcance; dias detalhados, com motivos e "cobertura não comprovada", quando há município.

Datas são dias GMT inclusivos; o principal exclui o envelope, inclusive na fronteira final. Erros explícitos: `acesso_negado` (42501, HTTP 403), `periodo_obrigatorio`, `periodo_invertido`, `periodo_fora_da_janela`, `municipio_inexistente`, `limite_invalido`, `deslocamento_invalido` (22023, HTTP 400) e `sem_publicacao`/`carga_indisponivel` (P0002). Municípios, fontes e malhas são lidos diretamente das tabelas, sob RLS, filtrando pela carga.

### Matriz verificada

| Recurso/ação | AN | RP cadastrado | OA (ou RP sem cadastro/revogado) | EX |
| :-- | :-- | :-- | :-- | :-- |
| Ler cargas publicadas, detecções, municípios, disponibilidade, proveniência | Negado (42501) | Permitido | Zero linhas; consultas `acesso_negado` | Lê o necessário à carga |
| Ler carga em preparação ou retirada | Negado | Zero linhas; `carga_indisponivel` | Zero linhas | Lê |
| Inserir, corrigir, publicar, retirar | Negado | Negado | Negado | Dentro do protocolo dos gatilhos |
| Ler ou alterar a lista RP, schema, RLS ou grants | Negado | Negado | Negado | Negado |

### Roteiro e comandos

```sh
npm ci                     # instala a CLI fixada; exige Docker em execução
npx supabase start         # sobe a pilha local (portas 5532x)
npm run test:rls           # reset do zero, pgTAP (supabase/tests) e testes pela API (scripts/banco)
npm run medir:banco        # reset e medição base com volume sintético fictício
npx supabase stop
```

Sem Docker ou sem permissão para instalá-lo gratuitamente, a situação vira `Parado`; os testes de G2 não são substituídos por mocks.

## Consequências

### Positivas

- RLS e grants são auditados por teste (`01_estrutura`), inclusive para objetos que migrações futuras criarem em `public`.
- A matriz é provada por SQL e pela API real (tokens válidos, adulterados e expirados; metadados que imitam o RP; revogação na mesma sessão).
- Versões não se misturam: cada consulta fixa uma carga imutável e a troca de vigente é atômica.
- Medição base local (volume sintético na cardinalidade do item 1, uma versão): cerca de 17,4 MB nas tabelas `public`, dos quais 12,6 MB de disponibilidade e 4,0 MB de detecções.

### Trade-offs

- A disponibilidade em texto e arrays ocupa cerca de 240 bytes por município-dia; o item 3 decide, com dados reais e retenção, se precisa de representação mais compacta.
- O helper `security definer` é necessário porque a lista RP fica fora do alcance do usuário; seu escopo é só a resposta booleana.
- `service_role` mantém os privilégios padrão do Supabase nas tabelas `public`. É credencial administrativa, nunca vai ao cliente nem substitui o EX (plano, item 5); não alcança a lista RP.
- Os gatilhos acrescentam custo por linha inserida (medido: cerca de 1 s para 51.830 linhas de disponibilidade).

## Alternativas consideradas

- **Autorizar por e-mail ou `user_metadata`:** rejeitada; são editáveis ou não são a identidade estável do Auth.
- **Lista RP em `public` com RLS:** rejeitada; o schema privado fora da API reduz a superfície.
- **Views para as consultas:** rejeitadas; RPCs `security invoker` dão erros explícitos, limites e versão fixada sem risco de view com privilégio do proprietário.
- **Usar `service_role` na carga:** rejeitada pelo plano; o EX tem privilégio mínimo demonstrado.
- **PostGIS no banco:** desnecessário; a classificação é local (KB-004) e o banco só guarda a geometria de exibição.
- **Tabelas de staging ou checkpoints:** adiadas ao item 3, só se a medição exigir; o estado `preparacao` já isola a carga parcial.

## Referências

- Plano `_project/drafts/003_implementacao_prototipo/003_plan.md` (item 2, matriz de acesso, contrato de dados) e task `003_task_issue-21.md`.
- `_project/knowledge/KB-004_metodo_recorte_focos_mt.md` e relatório `003_research_medicao_recorte.md` (volume do item 1).
- [Supabase — desenvolvimento local](https://supabase.com/docs/guides/local-development), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e [papéis](https://supabase.com/docs/guides/database/postgres/roles), lidos para o plano em 2026-11-05. O comportamento efetivo (privilégios padrão, `CREATEROLE` do `postgres`, códigos HTTP do PostgREST e login por e-mail do Auth) foi conferido na pilha local da CLI `2.122.1` (Postgres 17.11), não na documentação.
