# Mercado — memória acumulada do radar

`indice.json` é **derivado**, não escrito à mão. Gerado por
[`scripts/indexar-mercado.mjs`](../../scripts/indexar-mercado.mjs) a partir de
`radar/semanas/*.json`. Não editar o arquivo: editar os filtros e reindexar.

```
node scripts/radar-licitacoes.mjs     # captação da semana (PNCP)
node scripts/indexar-mercado.mjs      # acumula na memória
node scripts/build-dashboard.mjs      # publica em dashboard/mercado.html
```

## Por que existe

Uma semana do radar é uma **foto**: some da vista na semana seguinte. O índice é a
**memória** — e é ela que responde o que a foto não responde:

- **Recorrência** — município que publica mais de um certame no recorte da Samais tem
  demanda que se repete, não intenção isolada. É o sinal mais forte do índice.
- **Concentração** — quais UFs publicam APH/transporte sanitário com frequência.
- **Faixa de valor** — o que o mercado efetivamente publica, por modalidade.

## A regra que faz isto funcionar

**A doutrina de prospecção atual é reaplicada a todo o histórico** na indexação
([`scripts/lib/filtro-radar.mjs`](../../scripts/lib/filtro-radar.mjs) é compartilhado entre
captação e memória). Consequência prática: recalibrar `radar/filtros.json` limpa o passado
sem varrer o PNCP de novo. Cada semana registra quantos certames foram
`revogados_pela_doutrina_atual` — é o placar da calibragem.

Foi assim que a primeira indexação pagou: apareceu **Lagoa da Prata/MG com 4 certames**,
o que uma semana isolada não mostrava, e ao mesmo tempo ficou visível que "repasse de
recursos financeiros" e "execução de obra" estavam passando. Corrigidos os filtros,
4 registros saíram sozinhos.

## Cuidado com o valor (erro fácil e caro)

`valor_estimado` é o valor **TOTAL do certame** conforme o PNCP — a vigência inteira, às
vezes plurianual. **Não é mensal.** Só é comparável a `valor_contratual_mensal` das frentes
depois de dividido pela vigência. Comparar direto infla o mercado em 12× ou mais.

## Procedência

100% dado público do PNCP, já captado. O indexador **não acessa a rede** e não estima nada —
só agrega. Princípio da Realidade: se um campo não veio publicado, fica `null`, não vira
premissa.
