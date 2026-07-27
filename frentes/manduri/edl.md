# Manduri/SP — EDL do teaser institucional

> **Edit Decision List.** Montagem de referência para a pós. Timecodes em `mm:ss.d`.
> Master 16:9 · animação 1920×1080 · todos os clipes **mudos** (áudio entra na pós).

## ⚠️ Duração mudou: 39,5s (não 45s)

O roteiro v2 previa **M07 como 2 planos de 5s** (0:30–0:40), total 45s. Com a decisão
de direção, **M07 virou um único clipe de 4,5s** — reuso de Avaré com montagem interna.

**Nova duração total: `39,5s`.** Segue dentro da faixa de teaser (30–60s) decidida por
Victor; o roteiro foi ajustado.

## Timeline

| # | Plano | Rec IN | Rec OUT | Dur | Origem | Src IN | Src OUT |
|---|---|---|---|---|---|---|---|
| 1 | **M01** Portal | `00:00.0` | `00:05.0` | 5,0 | render novo | 0,0 | 5,0 |
| 2 | **M02** Prefeitura | `00:05.0` | `00:10.0` | 5,0 | render novo | 0,0 | 5,0 |
| 3 | **M03** Igreja Matriz | `00:10.0` | `00:15.0` | 5,0 | render novo (v2) | 0,0 | 5,0 |
| 4 | **M04** Rua residencial | `00:15.0` | `00:20.0` | 5,0 | render novo | 0,0 | 5,0 |
| 5 | **M05** Pronto Municipal | `00:20.0` | `00:25.0` | 5,0 | ⏳ pendente de cota | 0,0 | 5,0 |
| 6 | **M06** Saída rodovia | `00:25.0` | `00:30.0` | 5,0 | ⏳ pendente de cota | 0,0 | 5,0 |
| 7 | **M07a** Regulador (close) | `00:30.0` | `00:32.0` | 2,0 | ♻️ Avaré | 0,0 | 2,0 |
| 8 | **M07b** Central (geral) | `00:32.0` | `00:34.5` | 2,5 | ♻️ Avaré | **2,5** | 5,0 |
| 9 | **M08** Assinatura | `00:34.5` | `00:39.5` | 5,0 | 100% pós | — | — |

**Total: `39,5s` · 9 eventos · 8 planos visuais + cartão final.**

### Cortes
Todos **hard cut**, sem transição, exceto:
- `00:34.5` — **cross-dissolve de 0,5s** de M07b para o fundo de M08.

## M07 — montagem interna (decisão de direção)

**Fonte:** `B07a-1-2.mp4` (Avaré, bloco B07 — regulação/CoPilot).
**Nome local:** `m07b-avare-copilot-b07a.mp4`.
*Drive file ID registrado apenas em arquivo local, fora do Git.*

| Trecho | Src | Dur | Conteúdo |
|---|---|---|---|
| M07a | `0,0 → 2,0` | 2,0 | Close do médico regulador, movimento corporal suave |
| — | `2,0 → 2,5` | — | ❌ **descartado** |
| M07b | `2,5 → 5,0` | 2,5 | Plano geral da central |

O **salto de 0,5s** elimina a transição/movimento facial mais frágil do clipe original.
Emenda em hard cut — o corte seco reforça o registro sóbrio.

**Função narrativa: coordenação regional. Não urgência.**
**Som original descartado** — entram trilha licenciada e locução na pós.

### ❌ Descartado: `B04a-1-2.mp4` (TARM)
Exibe **telefone fictício com DDD 11** e interface excessivamente legível — cria ruído
factual numa peça sobre um município do interior paulista. Fora da peça.

> Consequência: **o teaser não mostra o TARM.** A camada de atendimento telefônico sai;
> a regulação passa a ser representada só pelo médico regulador e pelo plano geral da
> central. A locução de M07 sustenta o restante.

## M08 — cartão final (100% pós)

Fundo `#04060C` · logo **branco** (`samais-logo-white.svg`) · fio `#D4A857` ·
assinatura "Gestão em Saúde" em Syne 600.
**Somente marca Samais — sem marcas públicas** (SAMU, município, MS).

| Rec | Offset | Evento |
|---|---|---|
| `00:34.5` | 0,0 | Início do cross-dissolve de M07b para o fundo |
| `00:35.0` | 0,5 | Logo entra: fade + scale 98%→100%, ease-out |
| `00:35.8` | 1,3 | Fio dourado cresce do centro para fora |
| `00:36.3` | 1,8 | "Gestão em Saúde" entra em fade, sem movimento |
| `00:36.9` | 2,4 | Repouso — a locução final cai aqui |
| `00:38.8` | 4,3 | Fade to black |
| `00:39.5` | 5,0 | Fim |

Hierarquia: logo ~22% da largura, centro óptico ligeiramente acima do meio → fio de 1px
como separador → descritor em `#EDEAE2`, tracking aberto, ~25% do corpo do logo.

🔴 **Tipografia e logo em resolução nativa, na pós. Nunca por IA ou upscaler.**

## Locução

| Fala | Entra em | Plano | Texto |
|---|---|---|---|
| 1 | `00:05.5` | M02 | "Manduri tem nove mil oitocentos e setenta e uma pessoas." |
| 2 | `00:20.5` | M05 | "Tem pronto atendimento. Não tem hospital." |
| 3 | `00:25.5` | M06 | "O caso grave atravessa `[TEMPO A CONFIRMAR]` até a retaguarda." |
| 4 | `00:30.3` | M07 | "Quem regula esse tempo não está em Manduri. Está na central regional." |
| 5 | `00:36.9` | M08 | "Samais. Gestão em saúde." |

> ⚠️ **A fala 4 não cabe confortavelmente em M07.** São 12 palavras (~4,6s a 2,6 pal/s)
> num plano de **4,5s**. Duas saídas: deixar sangrar ~0,3s sobre o cross-dissolve de M08
> (aceitável em montagem), ou encurtar para
> **"Quem regula esse tempo está na central regional."** (8 palavras, ~3,1s), que cabe
> com folga e mantém o sentido. **Recomendo encurtar** — decisão de Victor.

## Trilha e SFX

- Música **sempre licenciada** (Artlist/Musicbed). Nunca gerada por IA.
- Todos os clipes entregues mudos — nenhum áudio de origem entra na peça.

## Estado dos ativos

| Plano | Ativo |
|---|---|
| M01, M02, M04 | ✅ renderizados e aprovados no QC |
| M03 | ✅ renderizado (v2) e aprovado |
| M05, M06 | ⏳ pendentes de cota diária do provedor |
| M07 | ✅ selecionado — reuso de Avaré, montagem definida |
| M08 | 📐 especificado — produção na pós |
