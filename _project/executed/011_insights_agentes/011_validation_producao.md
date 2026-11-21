# Verificação em produção — ciclo 011

> **Ciclo:** `011`
> **Autorização de produção:** "autorizo a verificação em produção do ciclo 011" (2026-11-21), depois do encerramento integrado na PR #109
> **Domínio:** domínio público do projeto (página inicial do repositório)
> **Deploy verificado:** `main` em `72d2629` (status Vercel `success`), que inclui a entrega da PR #108
> **Modelo:** `gemini-3.1-flash-lite`, nível gratuito (ADR-011)

## Objetivo

Registrar o que foi observado no ambiente hospedado com as perguntas fechadas do ciclo 011, separando o que o agente sondou sem sessão do que o responsável observou com a própria sessão. Não traz chave, JWT, UUID, e-mail nem dados de conta.

## Observado pelo agente, sem sessão e sem dados

| # | Sondagem | Esperado | Observado |
| :-- | :-- | :-- | :-- |
| A1 | `GET /api/explicar` | 405 | 405 `metodo_nao_permitido`, JSON |
| A2 | `POST` com `Origin` de outro site | 403 | 403 `origem_negada` |
| A3 | `POST` com corpo válido do contrato novo, sem `Authorization` | 401 | 401 `nao_autenticado` |
| A4 | O mesmo, com JWT inválido | 401 | 401 `nao_autenticado` |
| A5 | `POST` no contrato antigo (`pergunta` em texto livre) | 400 antes de autenticar | 400 `entrada_invalida`, "campo não admitido" |
| A6 | Página e bundle publicados | Painel novo, sem campo livre, sem segredos; CSP e `nosniff` | `pergunta-panorama` presente; nenhum `pergunta-livre`/`form-pergunta`; zero ocorrências de `RQ_GEMINI`, `generativelanguage` ou `AIza` nos scripts; CSP e `X-Content-Type-Options: nosniff` presentes |

Nenhuma dessas sondagens lê dados ou chama o provedor.

## Observado com a sessão do responsável

O responsável entrou com a própria conta no navegador do app; o agente conduziu as perguntas na interface, com cerca de 60 s entre envios. Dados reais da carga publicada; nenhum dado de conta registrado.

| # | Caso | Recorte | Resultado | Chamadas | Duração |
| :-- | :-- | :-- | :-- | :-- | :-- |
| P1 | "O que chama atenção neste período?" | Mato Grosso, 2026-10-01 a 2026-10-31 (761 detecções) | **Falhou parcialmente:** resposta `incompleta`. Padrões conferido (total 761 e máximo diário de 86 em 2026-10-25, iguais à evidência); contexto e qualidade falhou com `saida_invalida`; sem síntese | 5 | ~20 s |
| P2 | "O que mudou em relação ao outro período?" | Mato Grosso, A 2026-10-01 a 2026-10-31 e B 2026-08-31 a 2026-09-30 | **Passou:** `completa`, principal, dois subagentes e síntese; 761 em A, 2.152 em B e diferença de 1.391, iguais à aba Comparação | 6 | ~25 s |
| P3 | "Onde devo interpretar os resultados com mais cuidado?" | Colniza, outubro de 2026 (62 detecções) | **Passou:** `completa`; principal delegou só ao subagente de contexto e qualidade; 22 dias sem evidência de lacuna e 9 com incidência indeterminada, iguais à evidência | 4 | ~18 s |
| P4 | Comparação de municípios (Colniza × Aripuanã) | — | **Passou:** cinco perguntas visíveis e desabilitadas com "Saia da comparação de municípios para usar estas perguntas."; sem campo livre; nenhuma chamada | 0 | — |
| P5 | Cancelar logo após enviar "O que vale examinar em seguida?" | Colniza, outubro de 2026 | **Passou:** "Pergunta cancelada; nada da resposta foi exibido."; nenhuma resposta tardia em 20 s | 0 ou 1 | — |

Total: cerca de 15 chamadas ao Gemini, sem 429 observado e sem teste de carga.

### Achados

1. **Falha do subagente de contexto e qualidade no estado inteiro (P1).** A evidência de disponibilidade por município do recorte estadual tinha cerca de 30,8 mil caracteres (141 municípios), contra 2,6 mil da distribuição temporal. A saída desse subagente não passou no formato (`saida_invalida`), e a pergunta de panorama ficou sem síntese. A prova local usava fixture de três municípios e não reproduziu esse tamanho. A causa exata (tamanho da evidência, limite de saída ou formato) não foi isolada nesta verificação. Recomenda-se correção por trilha curta, com teste que reproduza o recorte estadual sem rede.
2. **Certeza mais forte que a fonte (P2).** A síntese escreveu que a variação "não reflete mudança real do fenômeno", enquanto a ressalva da evidência diz que entrar ou sair "não indica mudança real". Números e referências conferem, mas a formulação nega o fenômeno em vez de apenas não comprová-lo. Mesmo tipo de desvio corrigido localmente para disponibilidade no ciclo 011; este caso não é coberto pela conferência atual.
3. **Delegação mais enxuta que a simulada (P3).** O principal real delegou só ao subagente pertinente; nos testes com provedor simulado, a delegação extra aparece recusada. Comportamento correto.

## Não executado

- Outra conta Google fora da lista de responsáveis (negação autenticada); provada localmente com Auth e RLS reais.
- "Quais locais apresentam mais de um padrão?" com lente aplicada.
- Falha controlada do provedor e leitura dos logs da Vercel.
- Medição de cota no painel do AI Studio; as cotas são as registradas no ADR-011.
