# Radar de Licitações

Varredura **semanal** do [PNCP](https://pncp.gov.br) (Portal Nacional de Contratações
Públicas) em busca de contratações que se enquadram com a Samais. Captação — não análise.

## Como funciona

```
PNCP (API pública)  →  scripts/radar-licitacoes.mjs  →  radar/semanas/AAAA-SS.json
                                                          ↓
                       scripts/build-dashboard.mjs → dashboard/radar.html
```

- **Automático:** `.github/workflows/radar-licitacoes.yml` roda **segunda-feira ~06h (BRT)**,
  varre os últimos 7 dias, grava a semana e commita. Se nada novo, não commita.
- **Manual:** `node scripts/radar-licitacoes.mjs && node scripts/build-dashboard.mjs`
- **Sem custo e sem chave:** a API de consulta do PNCP é pública.

## O que conta como oportunidade — `filtros.json`

É **doutrina de prospecção como configuração**. Editar `radar/filtros.json` muda o radar.

**Score** = soma dos pesos dos termos que casaram com o objeto do edital:

| Grupo | Peso | O que é |
|---|---:|---|
| `nucleo` | 10 | É exatamente o negócio: SAMU, pré-hospitalar, central de regulação, UPA 24h… |
| `adjacente` | 5 | Serviços que a Samais opera: ambulância, remoção, gestão hospitalar, mão de obra em saúde… |
| `contexto` | 2 | Sinais fracos: consórcio intermunicipal, secretaria de saúde, pronto socorro… |

Entra no radar quem alcança `score_minimo` (default **5** = ao menos um termo adjacente).
Cada oportunidade registra **quais termos casaram** — o score é auditável, não caixa-preta.

**Exclusão de ruído em 3 níveis** (porque "SAMU" no texto não faz de uma compra de monitor
uma oportunidade de gestão):

1. `absoluto` — casa em qualquer lugar → descarta sempre (obra, pavimentação, resíduos, software).
2. `se_no_inicio` — se o objeto **começa** com isso, é compra de bem → descarta sempre
   (`aquisição de`, `compra de`, `registro de preços`…). Objeto de edital declara a natureza no início.
3. `condicional` — descarta **só se não houver termo do núcleo**, para não perder
   "Gestão do SAMU incluindo insumos" (medicamentos, material médico-hospitalar…).

**Porte:** o radar **não descarta por valor** — apenas marca `porte a revisar` quando o
estimado fica abaixo da referência de doutrina (R$ 300k/mês, `inteligencia/benchmarks-samu.md`).

## Da captação para a frente

O radar **não** decide nada. O que interessar:

1. Abrir a oportunidade no PNCP (link em cada cartão) e ler o edital.
2. Se qualificar, criar a frente: `cp -r frentes/_schema/_template-frente frentes/<slug>`.
3. Seguir o protocolo da skill `samais-municipal-study` (FASES 1–6) e o
   `inteligencia/editais/checklist-licitacao.md`.

## Calibragem (esperada nas primeiras semanas)

Um radar novo erra em duas direções. Ajuste `filtros.json` conforme:

- **Ruído demais** → suba `score_minimo` para 10 (exige termo do núcleo) ou acrescente
  termos em `excluir`.
- **Perdendo oportunidade** → acrescente termos em `nucleo`/`adjacente`, ou baixe
  `score_minimo`. Rode `--dias 30 --dry-run` para conferir sem gravar.

```bash
node scripts/radar-licitacoes.mjs --dias 30 --dry-run     # calibrar sem gravar
node scripts/radar-licitacoes.mjs --de 20260601 --ate 20260630
```

## Limites conhecidos

- Filtra pelo **objeto** publicado. Edital com objeto genérico ("contratação de serviços
  diversos em saúde") pode escapar — nenhum filtro por palavra resolve isso.
- Modalidades consultadas são as de `filtros.json`; os códigos vêm do Manual de APIs de
  Consulta do PNCP. Se o PNCP mudar códigos, ajustar lá.
- O pacote publicado embarca **a semana mais recente**; o histórico completo fica no repo.
