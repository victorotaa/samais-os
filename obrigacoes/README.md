# Calendário de Obrigações

Datas cujo vencimento tem **consequência**. Numa empresa de contrato público, esquecer
uma data não custa retrabalho — custa contrato. Esta pasta é a memória dessas datas.

## Como funciona

- Uma obrigação = **um arquivo JSON** nesta pasta (`<slug>.json`).
- Valida contra [`_schema/obrigacao.schema.json`](_schema/obrigacao.schema.json) —
  **o build falha se algum arquivo for inválido**.
- O build calcula os dias restantes e a criticidade, e alimenta o
  **Calendário de Obrigações** no dashboard, com alerta na home.
- Modelo em branco: [`_schema/_template-obrigacao.json`](_schema/_template-obrigacao.json).

Criticidade (derivada, não digitada):

| Faixa | Estado |
|---|---|
| já venceu | **vencida** |
| 0–7 dias | **crítica** |
| até `alerta_dias` (default 30) | **atenção** |
| além disso | vigente |

`status: "arquivada"` remove a obrigação dos alertas sem apagar o histórico.

## Adicionar uma obrigação

```bash
cp obrigacoes/_schema/_template-obrigacao.json obrigacoes/cnd-federal.json
# preencha titulo, tipo, vence_em, status, atualizado_em (+ o que fizer sentido)
node scripts/build-dashboard.mjs
```

## Catálogo — o que vale registrar

Derivado de [`inteligencia/editais/checklist-licitacao.md`](../inteligencia/editais/checklist-licitacao.md)
(fonte real no repo) e da doutrina de contratos. **Nenhuma data foi inventada** — registre
cada item com a data real do documento em mãos (Princípio da Realidade).

**Habilitação fiscal e trabalhista (corporativo — inabilita em licitação se vencer):**
- CND Federal (PGFN + Receita Federal) — validade típica **180 dias**
- Certidão Negativa Estadual (por UF onde há operação)
- Certidão Negativa Municipal (por município contratante)
- CRF — Certificado de Regularidade do FGTS
- CNDT — Certidão Negativa de Débitos Trabalhistas
- Certidão Negativa de Falência e Concordata
- Balanço patrimonial do último exercício (com índices de liquidez)

**Por contrato ativo:**
- Vigência (e a **data-limite para pedir prorrogação** — costuma anteceder o fim)
- Garantia contratual (geralmente 5% do valor anual) — validade da carta/seguro
- Seguros obrigatórios: frota, responsabilidade civil, equipamentos
- Reajuste: data-base do indexador (INPC/IPCA/INCC)
- Entrega de indicadores/relatórios contratuais, se previstos

**Por frente em prospecção:**
- Data de abertura da proposta / sessão do edital
- Prazo de impugnação e de recurso
- Prazo de implantação prometido (mobilização de equipes)

**Regulatório e sanitário:**
- Alvará sanitário das bases e da Central de Regulação
- Registro/atualização no CNES
- Habilitação SAMU no Ministério da Saúde e situação no **CAUC** (trava repasse federal)

> Confidencial: estruturação jurídico-tributária **não** entra aqui — só em conversa
> (doutrina). Este calendário registra prazos, não estratégia.
