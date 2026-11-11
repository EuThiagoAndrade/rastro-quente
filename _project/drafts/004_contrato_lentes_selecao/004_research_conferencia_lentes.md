# Ciclo 004 — conferência e medição das lentes com a carga real

> **Ciclo:** `004`
> **Item:** 1 (issue #33): contrato, cobertura e lente de concentração
> **Gerado em:** 2026-11-11
> **Commit do código medido:** `72039fd` (branch `feature/issue-33`)
> **Carga:** identidade `2134ff148b386593a2d89af9894a34ec4a7ef035a660c5652092dc42313e0db2`, AQUA_M-T, janela de 2025-11-01 a 2026-10-31 (dias GMT), publicada num Supabase local vazio pela CLI do ciclo `003` (exibição `intermediaria`, revisão 40)

Relatório sanitizado: só agregados de fontes públicas (INPE e IBGE). Brutos, saídas completas e os JSON das execuções ficam em `local/dados-prototipo/` (`conferencia-lentes.json` e `medicao-lentes.json`), fora do Git. As duas execuções registraram a mesma identidade de carga no início e no fim. Focos e destaques não comprovam incêndio, dano, autoria ou infração.

## Ordem de execução

Conforme o plano (R1-7):

1. testes unitários, `typecheck` e `build`;
2. `npm run conferir:lentes`;
3. `npm run medir:lentes`;
4. `npm run test:rls` e `npm run test:e2e`.

A conferência e a medição partem de `supabase db reset` e publicam a carga sozinhas.

## Conferência independente

Dois caminhos sem código de cálculo compartilhado:

- **A:** RPCs existentes sob RLS (RP fictício) → carregador → módulo `src/lentes/`;
- **B:** SQL escrito à parte, como administrador, direto nas tabelas.

**Resultado: conferido, sem divergência.**

| Janela | Total principal | Destaques | Divergências | Cobertura de cada destaque |
| :-- | --: | --: | --: | :-- |
| Inteira (2025-11-01 a 2026-10-31) | 10.640 | 10 | 0 | 286 de 365 dias |
| Mês de pico (2026-08) | 3.691 | 10 | 0 | 26 de 31 |
| 2 meses (2026-08-01 a 2026-09-30) | 5.655 | 10 | 0 | 50 de 61 |
| 3 meses com bordas parciais (2026-07-15 a 2026-09-14) | 4.839 | 10 | 0 | 48 de 62 |

Em cada janela foram comparados:

- o total do resumo estadual com a contagem SQL;
- a lista de municípios destacados e suas contagens (corte em 10, com empatados);
- a cobertura N de M e a lista dos dias restritivos, com a classe, de cada destaque.

Não houve empate no 10º lugar em nenhuma das quatro janelas.

Concentração na janela inteira (ordenada por contagem de detecções, não por prioridade, gravidade ou risco): Colniza 901, Paranatinga 604, Marcelândia 531, Nova Nazaré 463, Nova Maringá 371, Campinápolis 365, Aripuanã 334, Luciara 330, Juara 305 e São Félix do Araguaia 284.

**Grade T1 por `id_tecnico`.** As 10.640 detecções foram comparadas entre a célula calculada em `numeric` a partir do texto decimal da fonte e a do caminho RPC → TypeScript (`celulaDe`). **Nenhuma ficou em célula diferente.** O texto da fonte tem até 6 casas decimais (até 8 algarismos significativos, contando zeros à direita), e o valor canônico tem até 7 algarismos significativos, bem abaixo do limite de 15.

### Comparação com a análise exploratória da ideação

- **Concentração:** o máximo por município (901, Colniza) e a participação dos 10 maiores (4.488 de 10.640, 42,2%) reproduzem os números da ideação (máximo 901; "os 10 maiores somam 42%").
- **Cobertura:** 286 de 365 dias sem evidência de lacuna equivale a 79 dias `incidencia_indeterminada`, iguais nos 10 municípios, como a ideação mediu (79 dias, idênticos nos 142 municípios).
- **Grade:** a ideação usou uma grade de 5 km, não a célula de 0,05°. A comparação das células com 3 ou mais meses e das sequências fica para os itens 2 e 3, que introduzem essas lentes.

## Medição

Procedimento do plano ("Orçamento e procedimento de medição"):

- **Ambiente:** Chrome 156.0.8078.81 do sistema, 390×844 com toque, latência de 150 ms, 1,6 Mbit/s de descida, 750 kbit/s de subida e CPU 4× mais lenta;
- **Cache:** desligado, com contexto novo por execução e login antes do início;
- **Medida:** do clique em "Aplicar lente" até `data-estado-lente="completo"`, na janela inteira;
- **Passagens:** a interface fala com a API local por um proxy `node:http`, que na passagem bruta só repassa (a API local não comprime) e na comprimida aplica gzip nível 6;
- **Repetições:** 3 execuções válidas por passagem, prazo de 120 s, sem nenhuma tentativa inválida.

| Lente | Passagem | Mediana | Máximo | Bytes (máximo) | Requisições |
| :-- | :-- | --: | --: | --: | --: |
| Concentração | Bruta | 26,6 s | 26,7 s | 4.859.185 | 64 (32 preflight CORS) |
| Concentração | Comprimida | **5,8 s** | 5,9 s | 550.936 | 64 (32 preflight CORS) |

Bytes por parte de uma execução (bruta / comprimida):

- registros: 12 requisições (resumo e 11 páginas), 3.861.971 / 487.724;
- disponibilidade: 10 municípios, 874.520 / 25.380;
- geometria: 10 municípios, 122.684 / 37.832.

**Orçamento:** mediana comprimida ≤ 20,0 s **e** bytes brutos ≤ 10.000.000 por lente. **Resultado: dentro do orçamento** (5,8 s e 4.859.185 bytes). Não houve parada.

**Limites desta medição:**

- a compressão do provedor hospedado e o egress real ficam para a verificação em produção do ciclo;
- o tempo bruto (26,6 s) é o pior caso sem compressão e não é o critério do orçamento;
- metade das requisições é preflight CORS, porque a API local é de outra origem.

## Reprodução

```sh
npm run conferir:lentes
npm run medir:lentes
```

Os dois exigem o Supabase local, a carga real em `local/dados-prototipo/` e o Chrome do sistema. Saem com código 1 em divergência ou fora do orçamento.
