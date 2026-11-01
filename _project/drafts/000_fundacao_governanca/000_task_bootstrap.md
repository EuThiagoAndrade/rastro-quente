# Task — Bootstrap local da governança

> **Ciclo:** `000`
> **Trilha:** `normal`
> **Estado:** `Aguardando integração`
> **Tipo:** `chore`
> **Issue:** `— (exceção de bootstrap do ciclo 000)`
> **Plano:** `_project/drafts/000_fundacao_governanca/000_plan.md`
> **Branch:** `chore/cycle-000-plan`
> **PR:** `https://github.com/EuThiagoAndrade/rastro-quente/pull/1`
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação local do ciclo 000" em 2026-10-31
> **Modo contínuo:** `—`
> **Início:** 2026-10-31
> **Última atualização:** 2026-10-31
> **handoff_schema_version:** `2`

## Objetivo

Implantar localmente os quatro itens da v4 revisada do ciclo 000, conforme o inventário fechado.

## Escopo autorizado

Autoridades, adapters, 12 workflows, seis templates, duas skills adotadas, registro de ciclos/backlog vazio, quatro ADRs, duas KBs, manifesto/validador/testes, templates GitHub e workflow de governança. Git local e commits delimitados. O escopo inicial era somente local; foi complementado pela autorização de publicação abaixo. Aplicação, dados, banco e recursos Vercel/Supabase continuam fora do escopo.

## Origem no backlog

Não se aplica. Demanda direta do responsável, como no plano. Nenhuma captura, fila ou trava criada.

## Elegibilidade da trilha curta

Não se aplica. Ciclo completo de governança.

## Barreiras de domínio

| Barreira | Aplica-se? | Evidência ou justificativa |
| :-- | :-- | :-- |
| G1 — exatidão analítica e interpretação geoespacial | Sim | Regras e consumidores adaptados; exige referência independente, proveniência e limitações. Nenhum cálculo operacional executado |
| G2 — autenticação, autorização e isolamento | Sim | Política própria de acesso e RLS futuro; verificação estática herdada preservada. Autenticação/banco não implementados |
| G3 — privacidade de dados | Sim | Exclusões Git/Vercel, varredura sem local/, staging e ausência de materiais privados |
| G4 — migrações só acrescentam | Não | Não há migrations. Controle estático e workflow aditivo preparados para entregas futuras |

## Execução

- [x] Task criada do template fixado antes das alterações de implementação.
- [x] Git inicializado com quatro arquivos no commit raiz `9cd9105`; branch `chore/cycle-000-plan` derivada de main.
- [x] Inventário extraído por `git show` no commit `c31081d56d7ce0d0ff2f51de3db655f90db6b36b`; não foi copiado o HEAD posterior da origem.
- [x] Autoridades e consumidores adaptados; responsabilidade canônica da exceção em `_project/README.md`.
- [x] Mantidos estados, níveis, rodadas, próximo passo e handoff versão 2; sem importação de histórico ou aprovações da origem.
- [x] ADRs e KBs próprios; inventário técnico apenas documental.
- [x] Design system, licença, CI de aplicação, ambiente e release adiados conforme inventário.
- [x] Validações finais aprovadas; staging seletivo inspecionado antes de C1.
- [x] Registro exclusivo de C1 nesta task para C2 documental, com testes/validador/diff repetidos; L1 depende de C2 efetivado e árvore limpa, conferíveis no Git.

- [x] Repositório privado criado vazio; propriedade/visibilidade/ausência de refs conferidas antes do envio.
- [x] Commit raiz e branch publicados por SHA explícito, sem commits posteriores ao tip autorizado.
- [x] PR #1 aberta, diff remoto conferido e Governance aprovado no GitHub.

## Evidências

| Validação | Resultado |
| :-- | :-- |
| Node.js | v24.15.0, tooling nativo sem instalação |
| Testes do validador | 55 testes aprovados, zero falhas (Node.js 24.15.0); repetidos após registro de C1 para C2 |
| Validador estrutural | Zero erros e zero avisos; nove verificações manuais declaradas |
| Git local | Raiz `9cd9105` contém somente README mínimo, .gitignore, .vercelignore, .gitattributes |
| Exclusões Git | `git check-ignore --no-index` confirmou exemplos sob local/ e arquivos .env/.env.local; conteúdo privado não lido |
| Vercel | Inspeção estática: regra local/ em .vercelignore; sem configuração de build ou aplicação. Exclusão remota não testada |
| `git diff --check` e staging | Sem erros; lote limitado ao inventário do ciclo, sem local/ ou arquivos de ambiente |
| Inventário e referências | 49 arquivos obrigatórios, 12 workflows, seis templates, duas skills, quatro ADRs e duas KBs conferidos; links locais resolvidos |
| Histórico de revisão | Rodadas anteriores preservadas; SHA-256 da seção: f5e0cb026510c76d62a68161c7c49c61a4f7c0fc005548e518bac291f77c3f7e |
| Origem | Checkout de referência permanece sem alterações rastreadas |
| C1 — entrega técnica | `d735cd2572d56f809f602a9d1a8d833ac50ce08c` na branch `chore/cycle-000-plan`, descendente da raiz `9cd9105` |
| C2 — registro documental | `6f9e220825dade7c635bb56d87e6e9efbcec352e` confirmado após C1, com árvore limpa no marco L1 |
| Checks remotos | Governance aprovado: [execução 41263848049](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/41263848049); testes, validador e G4 passaram |
| Publicação | PR [#1](https://github.com/EuThiagoAndrade/rastro-quente/pull/1) aberta; base `9cd91054bb44cb87e838eed38f83d298f25768b9` e head `6f9e220825dade7c635bb56d87e6e9efbcec352e`; dois commits e 49 arquivos de diff conferidos |
| Privacidade remota | Repositório privado confirmado; lote sem local/, ambientes ou LICENSE |

## Revisão da correção

Não se aplica à trilha normal. A revisão independente da v4 foi concluída por Claude Code/Claude Opus 5.5 na Rodada 3, sem achados, com parecer `APTO PARA APROVAÇÃO`. Os pareceres originais foram preservados no plano; não houve revisão externa fictícia desta implementação.

## Decisões incidentais e desvios

1. **Autorização atual versus registro de aprovação:** o plano chegou com parecer apto e cabeçalho `Aprovação humana pós-revisão: Pendente`. A consulta ao chat anterior não encontrou a frase separada `aprovo o plano do ciclo 000`. A instrução humana atual, posterior à Rodada 3, é exatamente `autorizo a implementação local do ciclo 000`. Conforme a precedência da instrução explícita mais recente, ela foi tratada como decisão de executar localmente a v4 revisada, confirmando o escopo/nível e suas exceções locais. Não se atribui ao responsável outra fala, aprovação anterior ou autorização de publicação. Divergência registrada antes da implantação, preservando a decisão e os limites.
2. **Extração fixada:** usado o conteúdo Git do commit de referência, sem alterar o checkout de origem e sem depender dele em runtime.
3. **Regressões ajustadas:** teste de CLI deixa de remover LICENSE (arquivo adiado) e passa a remover AGENTS; teste de legado passa a rejeitar legacyV1 não vazio no destino; teste visual relata explicitamente contrato não auditado. Demais regressões de governança, RLS, migrações, backlog, estados e handoff foram preservadas.
4. **Enforcement restrito:** somente os caminhos enumerados da task aceitam o nome excepcional. Caminho, ciclo, plano, branch, autorização, nível e modo são conferidos; promoção exige aprovação/veredito apto; conclusão pendente exige encerramento prospectivo em executed com PR identificada. Estado real de PR e autenticidade da aprovação permanecem manuais.

## Encerramento

Não se aplica ainda. PR #1 aberta e integração pendente; plano/task permanecem em drafts e ciclo em execução. L1 não conclui o ciclo. C1 está identificado nas evidências. Este registro exclusivo compõe C2; o commit documental imediatamente posterior a C1 e a árvore limpa formalizam L1. A confirmação posterior é somente leitura, sem inserir o SHA de C2 nele próprio. Depois desse marco, os workflows locais assumem.

## Publicação autorizada em 2026-10-31

Manifestação humana literal:

> Use o repositório EuThiagoAndrade/rastro-quente, privado. Se ainda não existir, autorizo criá-lo vazio. Vamos adiar a escolha da licença aberta e manter sem arquivo LICENSE nesta etapa. Autorizo enviar o commit inicial à main e a branch chore/cycle-000-plan, incluindo C1 e C2 até o commit 6f9e220, e abrir a PR do ciclo 000.

Destino: `https://github.com/EuThiagoAndrade/rastro-quente`; privado; sem LICENSE e sem licença aberta nesta etapa. A criação vazia está autorizada se o destino não existir.

Lote remoto estrito: raiz `9cd91054bb44cb87e838eed38f83d298f25768b9` em `refs/heads/main` e tip `6f9e220825dade7c635bb56d87e6e9efbcec352e` em `refs/heads/chore/cycle-000-plan`, incluindo C1/C2. Sem commits posteriores. Não inclui merge, deploy, banco ou serviços externos.

Conferências: árvore limpa em C2; conta gh EuThiagoAndrade; destino inexistente conferido antes de criar; repositório criado privado e vazio, sem refs. Envio atômico dos dois SHAs explicitamente delimitados, sem force push, confirmado por ls-remote. PR [#1](https://github.com/EuThiagoAndrade/rastro-quente/pull/1) aberta pelo conector GitHub; base/head e os 49 arquivos do diff remoto conferem com o lote local. Governance [aprovado](https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/41263848049) no tip autorizado.

Registro posterior somente local: a autorização e os fatos desta publicação atualizam task, plano, índice, ADR-003, README e a informação de visibilidade na autoridade comportamental. Esse commit documental local não é parte da PR nem avança a branch remota. A PR preserva o snapshot L1 em C2, inclusive sua espera histórica pela publicação. Encerramento prospectivo e novos commits remotos não compõem o lote autorizado. Nenhum merge realizado.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Aguardando merge — ciclo 000 (completo)
Quem: Responsável
Conferir: Checks e diff da PR #1 (https://github.com/EuThiagoAndrade/rastro-quente/pull/1), no tip 6f9e220825dade7c635bb56d87e6e9efbcec352e
Diga: "aprovo o merge da PR #1"
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 000 + implementar_issue + publicacao-bootstrap + 6f9e220825dade7c635bb56d87e6e9efbcec352e`
- `effect_class`: `remote_mutation`
- `state_before`: L1 formalizado em C2; task bloqueada pela publicação; autorização explícita do lote recebida
- `state_after`: repositório privado e PR #1 publicados até C2; checks verdes; task aguardando integração; registro posterior somente local
- `result`: `executed`
- `evidence`: PR #1, base/tip conferidos por GitHub/ls-remote e Governance https://github.com/EuThiagoAndrade/rastro-quente/actions/runs/41263848049; registro documental posterior somente local
- `blockers`: aprovação específica de merge pendente; publicação dos registros posteriores e encerramento prospectivo fora do lote atual
