# Ciclo 004 — conferência e medição das lentes com a carga real

> **Ciclo:** `004`
> **Itens:** 1 (issue #33): contrato, cobertura e lente de concentração; 2 (issue #34): lente de recorrência; 3 (issue #35): lente de persistência
> **Gerado em:** 2026-11-11 (item 1), 2026-11-11 (item 2, que repete a concentração) e 2026-11-11 (item 3, que consolida as três lentes)
> **Commit do código medido:** item 1 em `72039fd` (branch `feature/issue-33`); item 2 em `458e8bb` (branch `feature/issue-34`); item 3 em `5ca5cc1` (branch `feature/issue-35`)
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
- **Grade:** a ideação usou uma grade de 5 km, não a célula de 0,05°. A comparação das células com 3 ou mais meses está no item 2, e a das sequências, no item 3, abaixo.

## Item 2 — recorrência (issue #34)

Conferência de `458e8bb`, na mesma carga (identidade igual no início e no fim), repetindo a concentração do item 1. **Resultado: conferido, sem divergência nas quatro janelas.** A concentração e sua cobertura repetiram exatamente os números da tabela do item 1.

O caminho B da recorrência é SQL escrito à parte, sem importar `src/lentes/`:

- a célula de cada detecção sai do texto decimal da fonte, convertido para `numeric` (`floor(x · 20)`);
- os meses GMT distintos são contados por célula em `public.deteccoes`, com o corte em 3;
- os meses tocados pela janela saem de `generate_series` por mês;
- a cobertura é a união dos municípios das detecções da célula (D13), com a classe mais restritiva do dia (T7).

Foram comparados, célula a célula: o conjunto de células, o número de meses, o número de detecções, os municípios da cobertura, a lista de meses, o "N de M" e a lista dos dias restritivos com a classe (comparada por md5 do mesmo texto nos dois lados). Também a ordem T5 (norte→sul e oeste→leste) e o estado `janela_insuficiente`.

| Janela | Meses GMT tocados | Estado | Células ocupadas | Destaques | Detecções nas células | Municípios na cobertura | Cobertura |
| :-- | --: | :-- | --: | --: | --: | --: | :-- |
| Inteira (2025-11-01 a 2026-10-31) | 12 | com destaques | 3.290 | 150 | 1.485 | 51 | 286 de 365 nas 150 |
| Mês de pico (2026-08) | 1 | janela insuficiente | 1.013 | 0 | — | — | — |
| 2 meses (2026-08-01 a 2026-09-30) | 2 | janela insuficiente | 1.605 | 0 | — | — | — |
| 3 meses com bordas parciais (2026-07-15 a 2026-09-14) | 3 (julho e setembro parciais) | com destaques | 1.354 | 9 | 75 | 6 | 48 de 62 nas 9 |

- **Janela inteira:** 109 células com 3 meses, 33 com 4, 5 com 5, 2 com 6 e 1 com 7. Oito células têm detecções de mais de um município, e a cobertura delas usa a união (D13). Nenhum mês é parcial.
- **Bordas parciais (D14):** as 9 células têm exatamente 3 meses e todas incluem pelo menos um mês parcial, com a ressalva correspondente.
- **Janelas de 1 e 2 meses:** a recorrência não roda, e o SQL confirma que a janela toca menos de 3 meses.
- **Cobertura:** como no item 1, os 79 dias `incidencia_indeterminada` são os mesmos em todos os municípios, então a união não muda o "N de M" na carga atual. O caso fictício V-2 e o E2E provam a união com municípios diferentes.

### Diferença para as 142 células da análise exploratória

A ideação contou 142 células com detecção em 3 ou mais meses numa grade de 5 km, com 3.470 células ocupadas. Na célula de 0,05° decidida (Q3, T1), são **150** células recorrentes e **3.290** ocupadas. As duas contagens não são comparáveis célula a célula:

- **Tamanho:** em Mato Grosso (latitude de cerca de −12°), a célula de 0,05° tem cerca de 5,53 km no sentido norte–sul e 5,44 km no leste–oeste, ou cerca de 30 km², contra 25 km² da grade de 5 km. Células maiores juntam mais detecções: há menos células ocupadas (3.290 contra 3.470, −5%) e mais células que alcançam 3 meses (150 contra 142, +6%). As duas diferenças vão no sentido esperado para células maiores.
- **Posição das bordas:** a grade T1 é ancorada em 0° de latitude e longitude, em graus. A ideação não registrou a projeção nem a âncora da grade de 5 km, então as bordas caem em lugares diferentes. Focos perto de uma borda mudam de célula e podem somar ou perder um mês.
- **Conclusão:** a diferença de 8 células (cerca de 6%) é explicada pela unidade diferente, e não por divergência de método. A análise exploratória era calibração, não valor esperado (plano, "Contexto e baseline"). O valor de referência deste ciclo é o da conferência acima, reproduzido por dois caminhos independentes.

## Item 3 — persistência (issue #35)

Conferência de `5ca5cc1`, na mesma carga (identidade igual no início e no fim), consolidando as três lentes nas quatro janelas. **Resultado: conferido, sem divergência.** A concentração, a recorrência e as coberturas repetiram exatamente os números dos itens 1 e 2, e as 10.640 detecções caíram na mesma célula pelos dois caminhos.

O caminho B da persistência é SQL escrito à parte, sem importar `src/lentes/`:

- a célula sai do texto decimal da fonte, como na recorrência;
- os dias GMT com detecção por célula formam ilhas de dias consecutivos (dia menos o número da linha é constante numa ilha), com o corte em 3 dias;
- a cobertura usa a união dos municípios de todas as detecções da célula na janela (D13), com a classe mais restritiva do dia (T7);
- as ressalvas são montadas no próprio SQL pela tabela "Ressalvas por classe" do plano (dias da sequência e vizinhos imediatos dentro da janela) e pela borda da janela (T4).

Foram comparados, sequência a sequência: célula, dia inicial e final, número de dias, número de detecções, municípios da cobertura, "N de M", a lista dos dias restritivos com a classe (por md5, como no item 2) e o texto completo das ressalvas, na mesma ordem. Também a unicidade do `id_destaque` (T6) e a ordem T5 (início, depois norte→sul e oeste→leste).

| Janela | Sequências | Células com sequência | Células com 2 ou mais | 3 / 4 / 5+ dias | Maior | Detecções nas sequências | Municípios na cobertura | Cobertura |
| :-- | --: | --: | --: | :-- | --: | --: | --: | :-- |
| Inteira (2025-11-01 a 2026-10-31) | 66 | 60 | 5 | 38 / 27 / 1 | 6 dias | 531 | 33 | 286 de 365 nas 66 |
| Mês de pico (2026-08) | 36 | 32 | 3 | 20 / 15 / 1 | 6 dias | 330 | 20 | 26 de 31 nas 36 |
| 2 meses (2026-08-01 a 2026-09-30) | 45 | 41 | 3 | 27 / 17 / 1 | 6 dias | 389 | 28 | 50 de 61 nas 45 |
| 3 meses com bordas parciais (2026-07-15 a 2026-09-14) | 40 | 36 | 3 | 21 / 18 / 1 | 6 dias | 357 | 22 | 48 de 62 nas 40 |

Ressalvas exibidas (uma sequência pode ter mais de uma):

| Janela | "inclui dia indeterminado" | "adjacente a dia indeterminado" | De lacuna conhecida | Borda da janela (T4) | Sequências sem ressalva |
| :-- | --: | --: | --: | --: | --: |
| Inteira | 63 | 39 | 0 | 0 | 14 |
| Mês de pico | 39 | 14 | 0 | 7 | 7 |
| 2 meses | 45 | 22 | 0 | 2 | 8 |
| 3 meses com bordas parciais | 42 | 19 | 0 | 0 | 10 |

- **D15 na carga real:** os 79 dias `incidencia_indeterminada` são os mesmos em todos os municípios. Na janela inteira, 52 das 66 sequências da janela inteira incluem ou tocam um dia indeterminado. Como só dia sem detecção interrompe, nenhuma sequência foi cortada por esses dias; as ressalvas avisam que a disponibilidade do dia não foi comprovada e, no vizinho, que a sequência pode ser mais longa.
- **Lacuna conhecida:** não há dia `lacuna_conhecida` nos municípios das sequências desta carga. As ressalvas dessa classe são provadas pelos casos fictícios P-7 e pelo E2E.
- **Borda (T4):** nenhuma sequência da janela inteira toca 2025-11-01 ou 2026-10-31; nas janelas menores, as que tocam a borda recebem a ressalva.
- **Mesma célula, várias sequências (T6):** 5 células da janela inteira têm duas sequências cada, cada uma como destaque próprio.

### Diferença para as 62 células da análise exploratória

A ideação contou, na grade de 5 km, 62 células com 3 ou mais dias seguidos e 2 com 5 ou mais. Na célula de 0,05° são **60** células com pelo menos uma sequência de 3 ou mais dias (66 sequências) e **1** sequência de 5 ou mais (6 dias, de 13/08 a 18/08/2026, 19 detecções).

- **Unidade contada:** a ideação contou células; a lente destaca sequências (T6). A comparação usa as 60 células, e não as 66 sequências.
- **Regra de interrupção:** a contagem exploratória só usou dias com detecção, sem disponibilidade. D15 também só interrompe em dia sem detecção, então a regra de seleção é a mesma, e a diferença não vem da disponibilidade.
- **Tamanho e posição das bordas:** a célula de 0,05° tem cerca de 30 km², contra 25 km² da grade de 5 km, e as bordas caem em lugares diferentes (a grade T1 é ancorada em 0° de latitude e longitude; a ideação não registrou a projeção nem a âncora da grade de 5 km). Uma sequência depende de detecções em dias seguidos dentro da mesma célula: um aglomerado cortado por uma borda vira duas séries curtas, e um aglomerado reunido pode completar 3 dias. Com só dezenas de células nesse limiar, a posição das bordas pesa mais que o tamanho. A diferença é de 2 células (3%) e de 1 célula no limiar de 5 dias.
- **Conclusão:** a diferença é explicada pela unidade diferente, e não por divergência de método. O valor de referência deste ciclo é o da conferência acima, reproduzido por dois caminhos independentes.

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

### Item 2 — concentração e recorrência

Medição de `458e8bb`, com o mesmo procedimento, o mesmo Chrome e a mesma carga (identidade igual no início e no fim). As duas lentes foram medidas na janela inteira, repetindo a concentração (R2-2). Todas as execuções foram válidas: 3 por lente e por passagem, sem tentativa inválida.

| Lente | Passagem | Mediana | Máximo | Bytes (máximo) | Requisições |
| :-- | :-- | --: | --: | --: | --: |
| Concentração | Bruta | 26,7 s | 26,7 s | 4.859.185 | 64 (32 preflight CORS) |
| Concentração | Comprimida | **5,8 s** | 5,9 s | 550.938 | 64 (32 preflight CORS) |
| Recorrência | Bruta | 43,9 s | 44,1 s | 8.322.074 | 126 (63 preflight CORS) |
| Recorrência | Comprimida | **14,5 s** | 16,2 s | 617.160 | 126 (63 preflight CORS) |

Bytes por parte da recorrência (bruta / comprimida):

- registros: 12 requisições (resumo e 11 páginas), 3.861.971 / 487.726, os mesmos da concentração;
- disponibilidade: 51 municípios, 4.460.103 / 129.434;
- geometria: nenhuma (as células são retângulos calculados no cliente).

**Orçamento:** **dentro**, nas duas lentes. Concentração: 5,8 s e 4.859.185 bytes. Recorrência: 14,5 s e 8.322.074 bytes. Não houve parada.

**Margem da recorrência:** é a lente mais pesada até aqui. A disponibilidade dos 51 municípios das células responde por 54% dos bytes brutos. Sobram 1.677.926 bytes brutos (17%) e 5,5 s na mediana comprimida. O máximo comprimido (16,2 s) também ficou abaixo de 20,0 s. Uma carga com mais municípios nas células recorrentes aumenta esse custo na mesma proporção.

**Limites desta medição:**

- a compressão do provedor hospedado e o egress real ficam para a verificação em produção do ciclo;
- o tempo bruto (26,6 s) é o pior caso sem compressão e não é o critério do orçamento;
- metade das requisições é preflight CORS, porque a API local é de outra origem.

### Item 3 — três lentes consolidadas

Medição de `5ca5cc1`, com o mesmo procedimento, o mesmo Chrome (156.0.8078.81) e a mesma carga (identidade igual no início e no fim). As três lentes foram medidas na janela inteira, repetindo a concentração e a recorrência (R2-2). Todas as execuções foram válidas: 3 por lente e por passagem, sem tentativa inválida.

| Lente | Passagem | Mediana | Máximo | Bytes (máximo) | Requisições |
| :-- | :-- | --: | --: | --: | --: |
| Concentração | Bruta | 26,5 s | 26,5 s | 4.859.185 | 64 (32 preflight CORS) |
| Concentração | Comprimida | **5,9 s** | 5,9 s | 550.938 | 64 (32 preflight CORS) |
| Recorrência | Bruta | 44,1 s | 44,2 s | 8.322.074 | 126 (63 preflight CORS) |
| Recorrência | Comprimida | **14,3 s** | 14,7 s | 617.160 | 126 (63 preflight CORS) |
| Persistência | Bruta | 36,0 s | 36,1 s | 6.747.920 | 90 (45 preflight CORS) |
| Persistência | Comprimida | **8,7 s** | 9,7 s | 571.478 | 90 (45 preflight CORS) |

Bytes por parte da persistência (bruta / comprimida):

- registros: 12 requisições (resumo e 11 páginas), 3.861.971 / 487.726, os mesmos das outras lentes;
- disponibilidade: 33 municípios, 2.885.949 / 83.752;
- geometria: nenhuma (as células são retângulos calculados no cliente).

**Orçamento:** **dentro**, nas três lentes. Concentração: 5,9 s e 4.859.185 bytes. Recorrência: 14,3 s e 8.322.074 bytes. Persistência: 8,7 s e 6.747.920 bytes. Não houve parada. A concentração e a recorrência repetiram os números do item 2 com diferença de até 0,2 s na mediana e os mesmos bytes brutos. A recorrência continua a lente mais pesada; a persistência lê a disponibilidade de 33 municípios, contra 51 da recorrência.

Estes números locais são a referência da verificação em produção do ciclo, cujo roteiro está na task da issue #35.

## Reprodução

```sh
npm run conferir:lentes
npm run medir:lentes
```

Desde o item 3, os dois cobrem as três lentes. Os dois exigem o Supabase local, a carga real em `local/dados-prototipo/` e o Chrome do sistema. Saem com código 1 em divergência ou fora do orçamento.
