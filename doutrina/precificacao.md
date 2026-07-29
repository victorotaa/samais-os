# Precificação — Composição do Valor Contratual Samais

> **Fonte canônica migrada de** `samais-municipal-study/references/composicao-preco.md`.
> Aqui vive a doutrina; os percentuais são os mesmos da referência da skill — não
> re-derivar, apenas manter em sincronia com ela.

## Princípio inegociável

**Nunca declarar "lucro", "margem" ou "lucratividade"** em qualquer superfície da
proposta — capas, sumários, slides, e-mails, reuniões. Essas palavras são gatilho de
rejeição em negociação pública.

O que aparece para o cliente é **"Composição do Valor Contratual"** ou **"Encargos e
Provisões Contratuais"**. A Samais opera com **BDI de 35% sobre o CDO (Custo Direto
Operacional)**, decomposto em componentes fiscais, administrativos e de reserva
técnica — tecnicamente correto, juridicamente defensável (Lei 14.133/2021) e
comercialmente estratégico.

## Tabela canônica — BDI Samais

| # | Componente | % sobre CDO | Natureza |
|---|---|---:|---|
| 1 | Tributos sobre faturamento (PIS/COFINS + ISS + IR/CSLL) | 13,5% | Obrigatório |
| 2 | Despesas administrativas e de gestão corporativa | 8,0% | Estrutural |
| 3 | Tecnologia, sistemas e inovação operacional (CoPilot OS) | 5,0% | Diferencial Samais |
| 4 | Reserva técnica operacional | 3,0% | Prudencial |
| 5 | Capacitação continuada e desenvolvimento técnico | 2,0% | Diferencial Samais |
| 6 | Contingências, seguros e garantias contratuais | 2,5% | Prudencial |
| 7 | Remuneração empresarial | 4,0% | Resultado líquido |
| | **Total BDI apresentado** | **38,0%** | |
| | *Floor de negociação (Remuneração em 3,5%)* | *37,5%* | *Piso absoluto* |

> A referência `composicao-preco.md` detalha a composição interna de cada linha e traz
> os **textos prontos** para proposta. Consultar lá ao gerar um estudo.

## ⚠️ Correção estrutural da tabela acima (lição Canoas, jul/2026)

**A tabela lista todas as linhas como "% sobre CDO" — mas os tributos incidem sobre
o FATURAMENTO (preço), não sobre o CDO.** Com isso, os 35% **não fecham**:

```
Preço = CDO × 1,35            → BDI disponível = 0,35 × CDO
Tributos = 13,5% × preço      = 0,135 × 1,35 × CDO = 18,2% do CDO  (não 13,5%)
Demais linhas (8+5+3+2+2,5)   = 20,5% do CDO
Total consumido               = 38,7% do CDO  >  35% disponíveis
→ REMUNERAÇÃO REAL = −2,8% do preço  (NEGATIVA, em qualquer estudo)
```

Os "4% de remuneração empresarial" da tabela só existem se os tributos fossem
13,5% *do CDO* — o que não é o caso. **A tabela é uma peça de apresentação
(decomposição defensável para o cliente), não um motor de cálculo.**

### Regra operacional

1. **Sempre calcular a remuneração residual explicitamente:**
   `remuneração = preço − CDO − (tributos% × preço) − (demais linhas% × CDO)`
2. **Se der menos que ~5% do preço, o BDI está errado** para aquela operação.
3. **Pisos de BDI sobre o CDO** (com tributos 13,5% sobre faturamento):

| Remuneração-alvo (% do preço) | BDI mínimo sobre CDO |
|---|---|
| 4% | **46,1%** |
| 7% (padrão Canoas) | **51,6%** |
| 10% | **57,5%** |

> **Isso não infla preço.** O preço segue ancorado no teto de mercado (Métrica de
> Ouro / benchmark). O BDI maior apenas **revela o custo verdadeiro** e impede
> assinar contrato que opera no prejuízo. Se o preço de mercado não comportar o
> BDI mínimo, o caminho é **enxugar escopo** — nunca aceitar remuneração negativa.

## Anexo de composição de preço (3º artefato de todo estudo)

Todo estudo passa a gerar, além do markdown interno e da página cliente-facing,
um **anexo de memória financeira** — a peça que **valida a fórmula perante a
diretoria**: composição rubrica a rubrica com a regra de cálculo explícita, ponte
custo→preço até a **remuneração residual**, benchmark e tabela fato × premissa.

- Local: `samais-estudos/anexos/<municipio-uf>-memoria-financeira.html`
- Especificação: `samais-estudos/referencias/anexo-composicao-preco.md`
- Referência viva: `anexos/canoas-rs-memoria-financeira.html`
- ⚠️ **Nunca dentro de `site/`** — expõe BDI, remuneração e composição; o deploy
  Vercel varre `site/` e publicaria o documento.

Seções obrigatórias: (01) método + alerta do BDI · (02) serviço principal rubrica
a rubrica + benchmark · (03) serviço secundário e seu piso de preço · (04)
consolidado · (05) procedência e sensibilidade.

## Varredura completa do termo de referência (lição Canoas)

O edital é fonte do **escopo E do custo**. Ler só a matriz de pessoal e a frota é
erro material — em Canoas isso omitiu **R$ 229 mil/mês**. Checklist obrigatório:

- [ ] **Horas extras de capacitação / NEP** (Canoas: 400h médico, 600h enfermeiro,
      600h técnico, 250h condutor, 150h motolância — todas obrigatórias)
- [ ] **Seguros exigidos** (seguro total da frota, patrimonial, garantias)
- [ ] **EPI, uniformes e crachás** especificados item a item
- [ ] **Resíduos, esterilização, controle de pragas**
- [ ] **Manutenção predial, de equipamentos médicos e de bens móveis**
- [ ] **Imóvel por conta da contratada** (locação + adequação + mobiliário)
- [ ] **Metas com desconto no repasse** (risco de receita, não só de custo)
- [ ] Concessionárias, telefonia, TI/firewall, material de escritório

Toda obrigação do termo que consome dinheiro **é rubrica de custo** e entra no CDO.

## Fórmula

```
Valor Contratual = CDO × 1,35
CDO = Frota + Pessoal + Insumos + Combustível + Manutenção + Overhead Operacional
```

Variante da Fórmula Mestre (gross-up por tributos + margem), usada nos estudos
calibrados (ex.: Belém):

```
Faturamento = CDO_indireto ÷ [1 − (Tributos% + Margem%)]
```

Onde **Fator de Cobertura 24/7 = ~4,5** por posto (escala 12×36) — **nunca 2,2**
(subdimensiona pela metade; erro histórico, lição Taboão 148 vs 80).

## "USA + 5,2" — heurística de teto de mercado (Métrica de Ouro do CEO, jul/2026)

Lente **complementar** ao gross-up acima (não o substitui), calibrada em SP e usada
nos estudos de Avaré. Serve para ancorar rapidamente o preço de municípios/consórcios
de médio porte e checar se o número "fecha com o prefeito":

```
Preço ≈ camada local + linha USA fixa
  camada local = R$ 5,20 / habitante / mês   (USBs + motolância + gestão)
  linha USA    ≈ R$ 457 mil / mês de preço   (UTI móvel operada 100% pela Samais)
```

- O preço assim obtido é **teto de mercado**: custos novos comem margem, **não sobem
  o preço**. Serve de disciplina anti-inflação de proposta.
- A **linha USA é fixa** (mesmo valor em qualquer cenário) e seu **repasse federal**
  (~R$ 134k/mês, quando habilitada) **volta ao ente** como desconto de fato.
- Ao diluir a USA fixa sobre mais população, o **R$/hab cai** com a escala — por isso
  somar um município pequeno pode **baixar** o rateio do município-âncora.

### Parâmetros calibrados SP (aplicados nos estudos de Avaré)

| Parâmetro | Valor |
|---|---|
| Encargos sobre salário | **68,24%** (Grupo C já cobre rescisão/demissão — **não duplicar**) |
| Fator de Cobertura | **4,5** (posto 24/7, 12×36) · **2,25** (posto 12h) |
| Médico da USA | **Plantonista** (~R$ 125/h × 730,5h ≈ R$ 91,3 mil/posto 24/7) — **não** CLT integral |
| Tributos s/ faturamento | **16,33%** (Lucro Presumido: PIS 0,65 + COFINS 3 + IRPJ 4,8 + CSLL 2,88 + ISS 5) |
| Honorários advocatícios | **2%** do faturamento (externo/contingência, pedido do CEO) |
| Indiretos | **10%** (7% overhead admin + 3% operacional) |

> Coerência com o BDI canônico: os 35% de "Composição do Valor Contratual" continuam
> valendo para a superfície externa; a heurística 5,2 é interna, para **ancorar o teto
> e dimensionar rápido**. Nunca expor "5,2/hab" nem "margem" ao ente — apresentar
> sempre valor global e fecho em R$/hab pós-cofinanciamento (padrão Sorriso).

## Como apresentar

- **Valor global (mais comum):** apresentar apenas o valor final com memória
  narrativa. Não expor a decomposição.
- **Edital exige planilha aberta:** apresentar a tabela **sem a palavra "lucro"**.
  Título obrigatório: **"Composição do Valor Contratual — Encargos e Provisões"**. A
  linha 7 aparece como **"Remuneração Empresarial"**.
- **Negociação de desconto:** linhas travadas (tributos 13,5% + contingências 2,5% +
  reserva 3% = 19%) são obrigações fiscais/prudenciais; ajustáveis apenas admin (8%)
  e remuneração (até o piso). **Nunca baixar Remuneração Empresarial abaixo de 2,5%**
  (piso de diretoria).

## Cofinanciamento federal SAMU

Quando aplicável: 50% federal (portaria MS vigente) + 50% local. Apresentar sempre o
**valor local líquido** e o fecho em **R$ / habitante / mês** — "o número que fecha
com o prefeito" (padrão Sorriso).

## Palavras vetadas × preferenciais

- ❌ Lucro · lucratividade · margem de lucro · rentabilidade · ROI · markup · comissão · fee
- ✅ Composição do Valor Contratual · Encargos e provisões contratuais · Remuneração
  empresarial · Sustentabilidade econômico-financeira da operação

## Amparo normativo

Lei 14.133/2021 (art. 23+); Súmula 253/TCU; Acórdão 2622/2013-TCU-Plenário; IN 05/2017
MPOG. O Acórdão 2622/2013 já prevê a decomposição do BDI (Administração Central,
Seguros/Garantias, Despesas Financeiras, Risco, Tributos e Lucro) — a Samais segue
essa lógica com nomenclatura contemporânea e ajustada à saúde.
