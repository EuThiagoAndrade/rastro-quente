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

1. **Falha do subagente de contexto e qualidade no estado inteiro (P1).** A evidência de disponibilidade por município do recorte estadual tinha cerca de 30,8 mil caracteres (87 municípios com detecções no recorte; o número 141, citado antes, é o total de municípios do estado e foi um erro de leitura), contra 2,6 mil da distribuição temporal. A saída desse subagente não passou no formato (`saida_invalida`), e a pergunta de panorama ficou sem síntese. A prova local usava fixture de três municípios e não reproduziu esse tamanho. A causa exata (tamanho da evidência, limite de saída ou formato) não foi isolada nesta verificação. Recomenda-se correção por trilha curta, com teste que reproduza o recorte estadual sem rede.
2. **Certeza mais forte que a fonte (P2).** A síntese escreveu que a variação "não reflete mudança real do fenômeno", enquanto a ressalva da evidência diz que entrar ou sair "não indica mudança real". Números e referências conferem, mas a formulação nega o fenômeno em vez de apenas não comprová-lo. Mesmo tipo de desvio corrigido localmente para disponibilidade no ciclo 011; este caso não é coberto pela conferência atual.
3. **Delegação mais enxuta que a simulada (P3).** O principal real delegou só ao subagente pertinente; nos testes com provedor simulado, a delegação extra aparece recusada. Comportamento correto.

## Conferência após a correção da issue #111 (PR #112)

Depois do merge da PR #112 e do deploy da `main` (`7648592`, status Vercel `success`), uma única pergunta foi repetida, como autorizado pelo responsável: panorama de Mato Grosso, 2026-10-01 a 2026-10-31.

- **Resultado: falhou de novo.** Estado `incompleta`, cerca de 28 s, 5 chamadas. Padrões conferido; contexto e qualidade com `saida_invalida` e **1 afirmação rejeitada** na conferência, ou seja, nenhuma afirmação válida.
- A evidência publicada já trazia os campos novos: 87 municípios, todos com `ressalva` e com o mesmo texto (22 dias sem evidência de lacuna e 9 com incidência indeterminada), e `lista_parcial`.
- A correção da #111 tratou o conflito com o teto de 8 tópicos, reproduzido sem rede, mas não a causa observada desta vez. A tela não mostra o texto rejeitado.

## Diagnóstico local autorizado (2026-11-21)

Autorização: "Autorizo o diagnóstico", para cerca de 5 chamadas com dados fictícios. Script e relatório em `local/` (ignorados). Evidências fictícias imitando o caso: 87 municípios com classes idênticas, `ressalva` e `lista_parcial`; sem banco e sem dados reais.

- 6 envios, todos HTTP 200, 13 s entre inícios (mínimo observado 13.003 ms), cerca de 68 s; chave fora dos corpos.
- **Resultado: `completa`.** Contexto e qualidade com 8 afirmações conferidas, cada uma com um município, e a limitação de lista parcial aceita; nota fixa presente. Não reproduziu a falha de produção.
- **Achado novo:** a síntese escreveu "Os municípios listados apresentaram 9 dias com incidência indeterminada", citando os oito itens de uma vez. A conferência aceitou, mas é um enunciado agrupado, que a decisão G1 não admite.
- **Leitura:** com classes idênticas em todos os municípios, o modelo tende a generalizar. Em produção, uma generalização do subagente (provavelmente com contagem) teria sido rejeitada e deixado a análise sem afirmações; localmente, a mesma tendência apareceu na síntese. A falha parece intermitente, e uma amostra local não basta para afirmar a causa.

## Decisão do responsável (2026-11-21)

Depois do diagnóstico, o agente informou que não há garantia de que uma nova instrução elimine a generalização: a saída do modelo não é determinística, e a conferência impede respostas erradas, mas não garante respostas completas. O único caminho com garantia seria o servidor escrever deterministicamente a disponibilidade de listas longas, o que muda o desenho do agente e exigiria decisão e ciclo próprios.

Decisão: "pode deixar como está e registrar a decisão". Fica sem nova correção:

- o panorama do estado inteiro pode sair `incompleta` de forma intermitente; quando isso acontece, mostra a análise de padrões conferida e avisa que a resposta está incompleta, sem conteúdo não conferido;
- a síntese pode agrupar municípios num enunciado ("os municípios listados…"), observado só no diagnóstico local;
- a formulação "não reflete" na comparação (achado 2) continua possível.

A correção da issue #111 (PR #112) permanece integrada: trata o conflito com o teto de 8 tópicos e garante o aviso de lista parcial. Retomar o tema exige nova triagem.

## Não executado

- Outra conta Google fora da lista de responsáveis (negação autenticada); provada localmente com Auth e RLS reais.
- "Quais locais apresentam mais de um padrão?" com lente aplicada.
- Falha controlada do provedor e leitura dos logs da Vercel.
- Medição de cota no painel do AI Studio; as cotas são as registradas no ADR-011.
