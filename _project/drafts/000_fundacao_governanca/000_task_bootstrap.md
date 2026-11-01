# Task — Bootstrap local da governança

> **Ciclo:** `000`
> **Trilha:** `normal`
> **Estado:** `Bloqueada`
> **Tipo:** `chore`
> **Issue:** `— (exceção de bootstrap do ciclo 000)`
> **Plano:** `_project/drafts/000_fundacao_governanca/000_plan.md`
> **Branch:** `chore/cycle-000-plan`
> **PR:** `—`
> **Integração:** `Pendente`
> **Autorização inicial:** "autorizo a implementação local do ciclo 000" em 2026-10-31
> **Modo contínuo:** `—`
> **Início:** 2026-10-31
> **Última atualização:** 2026-10-31
> **handoff_schema_version:** `2`

## Objetivo

Implantar localmente os quatro itens da v4 revisada do ciclo 000, conforme o inventário fechado.

## Escopo autorizado

Autoridades, adapters, 12 workflows, seis templates, duas skills adotadas, registro de ciclos/backlog vazio, quatro ADRs, duas KBs, manifesto/validador/testes, templates GitHub e workflow de governança. Git local e commits delimitados. Sem aplicação, dados, banco, serviços externos, remoto ou publicação.

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
| C2 — registro documental | Somente esta task; imediatamente posterior a C1. Confirmar SHA/ancestralidade e árvore limpa no Git após o commit; não há SHA autorreferente neste documento |
| Checks remotos | Não executados; remoto/PR inexistentes e publicação não autorizada |

## Revisão da correção

Não se aplica à trilha normal. A revisão independente da v4 foi concluída por Claude Code/Claude Opus 5.5 na Rodada 3, sem achados, com parecer `APTO PARA APROVAÇÃO`. Os pareceres originais foram preservados no plano; não houve revisão externa fictícia desta implementação.

## Decisões incidentais e desvios

1. **Autorização atual versus registro de aprovação:** o plano chegou com parecer apto e cabeçalho `Aprovação humana pós-revisão: Pendente`. A consulta ao chat anterior não encontrou a frase separada `aprovo o plano do ciclo 000`. A instrução humana atual, posterior à Rodada 3, é exatamente `autorizo a implementação local do ciclo 000`. Conforme a precedência da instrução explícita mais recente, ela foi tratada como decisão de executar localmente a v4 revisada, confirmando o escopo/nível e suas exceções locais. Não se atribui ao responsável outra fala, aprovação anterior ou autorização de publicação. Divergência registrada antes da implantação, preservando a decisão e os limites.
2. **Extração fixada:** usado o conteúdo Git do commit de referência, sem alterar o checkout de origem e sem depender dele em runtime.
3. **Regressões ajustadas:** teste de CLI deixa de remover LICENSE (arquivo adiado) e passa a remover AGENTS; teste de legado passa a rejeitar legacyV1 não vazio no destino; teste visual relata explicitamente contrato não auditado. Demais regressões de governança, RLS, migrações, backlog, estados e handoff foram preservadas.
4. **Enforcement restrito:** somente os caminhos enumerados da task aceitam o nome excepcional. Caminho, ciclo, plano, branch, autorização, nível e modo são conferidos; promoção exige aprovação/veredito apto; conclusão pendente exige encerramento prospectivo em executed com PR identificada. Estado real de PR e autenticidade da aprovação permanecem manuais.

## Encerramento

Não se aplica ainda. Sem PR ou integração; plano/task permanecem em drafts e ciclo em execução. L1 não conclui o ciclo. C1 está identificado nas evidências. Este registro exclusivo compõe C2; o commit documental imediatamente posterior a C1 e a árvore limpa formalizam L1. A confirmação posterior é somente leitura, sem inserir o SHA de C2 nele próprio. Depois desse marco, os workflows locais assumem.

## Pergunta de publicação

Qual é a URL GitHub de destino, a visibilidade e a política de licença pretendidas, e autoriza publicar o lote local apresentado (commit raiz direto em main mais branch chore/cycle-000-plan, incluindo C1/C2) e abrir a PR do bootstrap? Lote preparado: raiz `9cd9105`, entrega C1 identificada acima e C2 documental imediatamente posterior, limitado a esta task. A autorização de publicação continua pendente; conferir o tip e o diff reais antes de qualquer envio. Merge exigirá aprovação própria de PR real.

## Próximo passo

```text
PRÓXIMO PASSO
Situação: Parado — ciclo 000 (completo)
Quem: Responsável
Conferir: A pergunta registrada sobre destino, visibilidade, licença e publicação do lote local
Diga: sua resposta à pergunta registrada
```

## Handoff de saída

- `handoff_schema_version: 2`
- `logical_key`: `rastro-quente + 000 + atualizar_docs + registro-L1 + d735cd2572d56f809f602a9d1a8d833ac50ce08c`
- `effect_class`: `local_mutation`
- `state_before`: entrega técnica validada e gravada em C1; task em andamento; integração pendente
- `state_after`: registro documental de L1 preparado para C2; task bloqueada pela decisão de publicação; plano/ciclo em execução e integração pendente
- `result`: `executed`
- `evidence`: esta task, plano, índice e commits locais; comandos e limitações nesta seção de evidências
- `blockers`: destino, visibilidade, licença e autorização de publicação pendentes
