# Manduri/SP — EDL do teaser institucional

> **Edit Decision List — picture lock parcial.** Timecodes em `mm:ss.d`.
> Master 16:9 · animação 1920×1080 · todos os clipes **mudos** (áudio entra na pós).
>
> **Duração final projetada: `38,5s`** (com M05 e M06).

## Histórico de duração

| Versão | Total | Causa |
|---|---|---|
| Roteiro v2 | 45,0s | M07 previsto como 2 planos de 5s |
| Pós-seleção do ativo | 39,5s | M07 vira 1 clipe de 4,5s |
| **Picture lock** | **38,5s** | M07 reduzido a **3,5s** no QC de montagem |

## Timeline

| # | Plano | Rec IN | Rec OUT | Dur | Origem | Src IN | Src OUT |
|---|---|---|---|---|---|---|---|
| 1 | **M01** Portal | `00:00.0` | `00:05.0` | 5,0 | render | 0,0 | 5,0 |
| 2 | **M02** Prefeitura | `00:05.0` | `00:10.0` | 5,0 | render | 0,0 | 5,0 |
| 3 | **M03** Igreja Matriz | `00:10.0` | `00:15.0` | 5,0 | render (v2) | 0,0 | 5,0 |
| 4 | **M04** Rua residencial | `00:15.0` | `00:20.0` | 5,0 | render | 0,0 | 5,0 |
| 5 | **M05** Pronto Municipal | `00:20.0` | `00:25.0` | 5,0 | ⏳ pendente de cota | 0,0 | 5,0 |
| 6 | **M06** Saída rodovia | `00:25.0` | `00:30.0` | 5,0 | ⏳ pendente de cota | 0,0 | 5,0 |
| 7 | **M07a** Regulador (close) | `00:30.0` | `00:32.0` | 2,0 | ♻️ Avaré | 0,0 | 2,0 |
| 8 | **M07b** Central (geral) | `00:32.0` | `00:33.5` | 1,5 | ♻️ Avaré | **3,5** | 5,0 |
| 9 | **M08** Assinatura | `00:33.5` | `00:38.5` | 5,0 | 100% pós | — | — |

**Total: `38,5s` · 8 planos visuais + cartão final.**

### Cortes
Todos **hard cut**, exceto:
- `00:33.5` — **cross-dissolve de 0,5s** de M07b para o fundo de M08.

## M07 — montagem interna (picture lock)

**Fonte:** bloco **B07** de Avaré (regulação/CoPilot). Nome local `m07b-avare-copilot-b07a.mp4`.
*Drive file ID registrado apenas em arquivo local, fora do Git.*

| Trecho | Src | Dur | Conteúdo |
|---|---|---|---|
| M07a | `0,0 → 2,0` | 2,0 | Close do médico regulador |
| — | `2,0 → 3,5` | — | ❌ **descartado** |
| M07b | `3,5 → 5,0` | 1,5 | Plano geral, mais sereno |

> **Por que o descarte cresceu de 0,5s para 1,5s.** Na primeira montagem o corte tirava
> só a transição facial mais frágil (`2,0→2,5`). No QC de montagem ficou claro que o
> **gesto e a boca do regulador leem como urgência** ao longo de todo o trecho
> `2,0→3,5` — o que contradiz o registro de presença serena da peça. O plano geral
> entra mais tarde, já sereno.

**Função narrativa: coordenação regional. Não urgência.**
**Som original descartado** — entram trilha licenciada e locução na pós.

### ❌ Descartado: `B04a-1-2.mp4` (TARM)
Telefone fictício com **DDD 11** e interface excessivamente legível — ruído factual.
Consequência: **o teaser não mostra o TARM**; a regulação é representada só pelo
regulador e pelo plano geral.

## M08 — cartão final (100% pós)

Fundo `#04060C` · logo **branco** · fio `#D4A857` · assinatura "Gestão em Saúde" em
Syne 600. **Somente marca Samais — sem marcas públicas.**

| Rec | Offset | Evento |
|---|---|---|
| `00:33.5` | 0,0 | Início do cross-dissolve de M07b para o fundo |
| `00:34.0` | 0,5 | Logo entra: fade + scale 98%→100%, ease-out |
| `00:34.8` | 1,3 | Fio dourado cresce do centro para fora |
| `00:35.3` | 1,8 | "Gestão em Saúde" entra em fade, sem movimento |
| `00:35.9` | 2,4 | Repouso — a locução final cai aqui |
| `00:37.8` | 4,3 | Fade to black |
| `00:38.5` | 5,0 | Fim |

✅ **Materializado e validado em 2K**, com o logo oficial (path vetorial conferido).
Corrigido e aprovado após QC de **orientação, timing e fade**.

🔴 Tipografia e logo em resolução nativa, na pós. Nunca por IA ou upscaler.

## Locução

| Fala | Entra | Plano | Texto | Dur |
|---|---|---|---|---|
| 1 | `00:05.5` | M02 | "Manduri tem nove mil oitocentos e setenta e uma pessoas." | ~3,8s |
| 2 | `00:20.5` | M05 | "Tem pronto atendimento. Não tem hospital." | ~2,3s |
| 3 | `00:25.5` | M06 | **"Avaré está a menos de uma hora por estrada."** | ~3,5s |
| 4 | `00:30.5` | M07 | "A regulação acontece na central regional." | ~2,3s |
| 5 | `00:35.9` | M08 | "Samais. Gestão em saúde." | ~1,6s |

**~35 palavras em 38,5s.** Todas as falas cabem com folga.
A fala 4 termina em `~00:32.8` e o plano vai até `00:33.5` — **~0,7s de silêncio** antes
do cross-dissolve. Apertou em relação à montagem anterior (era ~1,7s), mas a pausa
que separa a afirmação da marca continua existindo.

## 🔴 Guardrail de honestidade — fala 3 (M06)

A rota Manduri→Avaré aparece em fontes rodoviárias como **~44–46,9 km** e
**~45–52 min**.

**Esses números NÃO entram no filme.** A locução usa apenas a formulação segura:

> "Avaré está a menos de uma hora por estrada."

**Por quê:** um tempo de viagem rodoviário é **estimativa geográfica**, não
**tempo-resposta do SAMU**. Enunciar "45 minutos até a retaguarda" numa peça de
prospecção converteria uma medida de mapa em **promessa operacional** — exatamente o
tipo de compromisso que a Samais não pode assumir sem dado assistencial próprio.

A formulação adotada é verdadeira sob qualquer ponto da faixa (45–52 min < 60 min),
não promete desempenho e não pode ser lida como SLA.

⚠️ **Nunca** apresentar essa frase como tempo de atendimento, tempo-resposta ou
indicador de serviço.

## Trilha e SFX

- Música **sempre licenciada** (Artlist/Musicbed). Nunca gerada por IA.
- Todos os clipes entregues mudos.

## Estado dos ativos

| Plano | Situação |
|---|---|
| M01, M02, M03, M04 | ✅ renderizados e aprovados no QC |
| M05, M06 | ⏳ pendentes de cota diária do provedor |
| M07 | ✅ picture lock — 3,5s |
| M08 | ✅ materializado em 2K e aprovado |

### Prévia parcial validada

`samu-manduri-picture-lock-partial-v1.mp4` — **28,5s** · 1920×1080 · H.264 · 31 MB.
Contém **M01–M04, M07 e M08**.

Confere com esta EDL: `20,0s (M01–M04) + 3,5s (M07) + 5,0s (M08) = 28,5s` ✅
Faltam apenas M05 e M06 (10,0s) para fechar os 38,5s.

> Arquivo de prévia, outputs e montador local ficam **fora do Git**.
> Caminho canônico dos outputs: `outputs/higgsfield/manduri/` (já em `.gitignore`).
