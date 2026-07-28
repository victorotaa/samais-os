# Manduri/SP — Manifesto de produção (preflight, pré-geração)

> **PARADA DE PREFLIGHT.** Nenhum frame gerado, nenhum job submetido, **zero crédito
> consumido**. Todos os custos abaixo vieram de `get_cost: true`, que retorna preço sem
> submeter geração.
>
> Divisão: **Codex** = direção criativa, referências, masters 2K e QC · **Claude** =
> roteiro/storyboard, manifesto, orquestração MCP e rastreabilidade · **Victor** =
> aprovação criativa e de custo.

---

## ✅ Divergência arbitrada por Victor (2026-07-27)

**A peça é um TEASER institucional cinematográfico de presença serena.**
Não é ocorrência e não é peça explicativa.

| Definição | Valor |
|---|---|
| Registro | **Presença serena.** Viatura passa calmamente por Manduri |
| Proibido | Paciente · acidente · sirene · giroflex |
| Eixo da transferência | Existe **apenas em locução mínima**, sem dramatização visual |

Os blocos de ocorrência do roteiro v1 (B03, B07, B08 — paciente, travessia,
passagem de bastão) **estão fora**. O eixo sobrevive na narração, não na imagem.

### Regra de câmera aprovada — dinamismo com elegância

Movimento **fluido de gimbal/FPV**, nunca câmera nervosa:

- **Tracking lateral baixo** acompanhando a USB
- **Leve dolly / push-in**
- **Parallax** de árvores e postes em primeiro plano

❌ **Nunca:** câmera nervosa · velocidade de emergência · whip-pan · shake.

---

## Parâmetros globais

| Item | Valor | Origem |
|---|---|---|
| Master visual | **16:9 · 2K** | Direção Codex |
| Animação inicial | **1080p** | Direção Codex |
| Frames | Produzidos e QC'ados **pelo Codex** (imagegen local) | Direção Codex |
| Texto / logo / tipografia | **Somente na pós.** Nunca por IA ou upscaler | Cânone |
| Áudio | **Mudo na geração.** Música licenciada + SFX + voz na pós | Cânone |
| Duração por clipe | 5s | Roteiro |

### Cláusula de cinematografia — colar em TODO prompt
```
subtle anamorphic flare on the light source, FEW dust particles floating in the light,
light atmospheric haze, cinematic depth of field, rich micro-contrast
```

### Cláusula de movimento — colar em TODO prompt de animação
```
Low cinematic tracking camera moves smoothly with the vehicle, subtle forward dolly
and natural foreground-tree parallax, keeping the background stable and recognizable.
Ordinary traffic speed, wheels rotate naturally, suspension remains grounded.
All emergency lights and beacons stay OFF for the entire shot. Quiet teaser mood,
realistic motion blur, no urgency, no siren, no camera shake, no architecture
morphing, no vehicle deformation.
```

### Negativos globais — colar em TODO prompt
```
no siren, no flashing lights, no emergency beacon lit, no light bar active,
no motorcycle ambulance, no motolancia, no accident, no victim, no blood, no gore,
no crowd, no yellow hi-vis stripes, no white uniform, no red stripes on uniform,
no American or European EMS livery, no text, no logo, no lettering, no watermark,
no wide multi-lane avenue, no skyscraper, no big-city skyline
```

### Cânone de uniforme — por extenso em todo prompt com pessoa
```
navy SAMU coverall #1C2D4A, WHITE reflective bands, orange side piping,
red Star of Life, "SAMU 192" in orange, Brazilian flag patch
```

### Referências obrigatórias (anexar como `medias`)
Vivem no Drive de Victor (`SAMU Visual References/`) — **não acessíveis desta sessão**.
Quem gerar precisa anexá-las:

| Plano contém | Anexar |
|---|---|
| USB de lado / passando | `SAMAIS-RefUSB3-Lado.png` |
| USB se afastando | `SAMAIS-RefUSB4-Lado2.png` (traseira) |
| USB de frente / parada | `SAMAIS-RefUSB1.png`, `RefUSB2` |
| Qualquer pessoa em quadro | `MacacãoSAMU2.jpg`, `FrenteSAMU.jpg` |

> 🔴 **Lição cara do cânone:** a orientação da referência **vaza** para a cena. Anexar
> ref frontal faz a viatura sair de frente. Usar sempre a ref no ângulo desejado **e**
> travar no prompt (`seen from the side`, `rear toward camera, NOT front-on`).
> Anexar beauty shot de **todo** veículo em quadro — faltou a moto uma vez e a moto derreteu.

---

## Planos

### M01 · Portal da cidade
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Locação real** | Portal de entrada de Manduri ⚠️ *ref fotográfica real pendente* |
| **Ação da viatura** | USB entra na cidade em **velocidade normal de tráfego**. Sem pressa, sem sirene, sem giroflex |
| **Enquadramento** | Plano aberto, câmera baixa lateral. Viatura cruza o quadro da esquerda para a direita; portal ao fundo |
| **Luz** | Golden hour |
| **Frame inicial** | Portal vazio, estrada limpa, luz baixa |
| **Frame final** | USB no centro-direita do quadro, portal atrás |
| **Continuidade** | Abre o filme. Define a luz do Ato 1 — nenhum plano do ato pode variar dela |
| **Refs** | `RefUSB3-Lado` |

**Prompt-base**
```
Photoreal documentary cinematic still, 16:9. A white and red Brazilian SAMU 192
basic life support ambulance drives calmly at normal traffic speed past the town
entrance gateway of a small Brazilian countryside town, seen from the SIDE, gateway
in the BACKGROUND at a distance. Emergency lights OFF, no siren. Late afternoon
golden hour, low warm sun. Quiet two-lane road, low buildings, green belt beyond.
+ [cláusula de cinematografia] + [negativos globais]
```

---

### M02 · Prefeitura / Rua Bahia
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Locação real** | Prefeitura Municipal, Rua Bahia ⚠️ *ref fotográfica real pendente* |
| **Ação da viatura** | USB passa em via próxima, **em velocidade normal** |
| **Enquadramento** | Plano médio-aberto. Prefeitura **ao fundo/à distância** — nunca a viatura dentro do cartão-postal |
| **Luz** | Golden hour (mesma do ato) |
| **Frame inicial** | Rua com a Prefeitura ao fundo, viatura entrando pela borda |
| **Frame final** | Viatura saindo do quadro; Prefeitura permanece |
| **Continuidade** | Mesma luz, mesma viatura, mesma sujeira/reflexo de carroceria de M01 |
| **Refs** | `RefUSB3-Lado` |

**Prompt-base**
```
Photoreal documentary cinematic still, 16:9. Same ambulance, same light, unchanged.
The SAMU 192 ambulance drives calmly along a modest street in a small Brazilian town,
the municipal city hall building visible in the BACKGROUND at a distance, not framed
as a postcard. Emergency lights OFF. Golden hour. Narrow street, low storefronts.
+ [cláusula] + [negativos]
```

---

### M03 · Igreja Matriz / Praça Getúlio Vargas — 🎯 *candidata a piloto*
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Locação real** | Igreja Matriz e Praça Getúlio Vargas ⚠️ *ref fotográfica real pendente* |
| **Ação da viatura** | USB passa pela via que margeia a praça, **calmamente** |
| **Enquadramento** | Plano aberto. Igreja ao fundo, praça com árvores em primeiro plano parcial |
| **Luz** | Golden hour (mesma do ato) |
| **Frame inicial** | Praça e igreja, viatura ainda fora do quadro |
| **Frame final** | Viatura atravessou; praça e igreja intactas |
| **Continuidade** | Fecha o tríptico de cartões-postais M01→M02→M03 |
| **Refs** | `RefUSB3-Lado` |

**Prompt-base**
```
Photoreal documentary cinematic still, 16:9. Same ambulance, same light, unchanged.
The SAMU 192 ambulance drives calmly along the road bordering a small town square
with mature trees, the parish church (Igreja Matriz) in the BACKGROUND at a distance.
Emergency lights OFF, unhurried. Golden hour. Quiet, few pedestrians.
+ [cláusula] + [negativos]
```

---

### M04 · Rua residencial
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Locação real** | Rua residencial típica ⚠️ *ref pendente* |
| **Ação da viatura** | USB circulando, presença cotidiana |
| **Enquadramento** | Plano médio, câmera acompanha lateralmente (leve travelling) |
| **Luz** | Golden hour |
| **Frame inicial** | Rua com casas baixas, muros, calçada |
| **Frame final** | Viatura à frente, rua se abrindo |
| **Continuidade** | Última cena do Ato 1 — a luz muda **só** no corte para M06 |
| **Refs** | `RefUSB3-Lado` |

---

### M05 · Pronto Municipal
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Locação real** | Pronto Municipal de Manduri ⚠️ *ref pendente* · ⚠️ **confirmar no CNES** |
| **Ação da viatura** | USB **parada** junto à unidade. Equipe (máx. 2) em movimento tranquilo — conversa, prancheta. **Sem maca, sem paciente, sem correria** |
| **Enquadramento** | Plano médio, estático |
| **Luz** | Golden hour tardia |
| **Frame inicial** | Viatura parada, portas fechadas |
| **Frame final** | Um socorrista junto à porta traseira, postura relaxada |
| **Continuidade** | Único plano com pessoas no Ato 1 → uniforme por extenso obrigatório |
| **Refs** | `RefUSB1`, `MacacãoSAMU2.jpg`, `FrenteSAMU.jpg` |

**Prompt-base**
```
Photoreal documentary cinematic still, 16:9. Two Brazilian SAMU paramedics in navy
SAMU coveralls #1C2D4A with WHITE reflective bands, orange side piping, red Star of
Life and "SAMU 192" in orange, standing calmly beside a parked white and red SAMU 192
ambulance outside a small municipal urgent-care building. Routine, unhurried, no
patient, no stretcher. Emergency lights OFF. Late golden hour.
+ [cláusula] + [negativos]
```

---

### M06 · Saída para a rodovia
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Locação real** | Rodovia de saída rumo a Avaré ⚠️ *ref e identificação da rodovia pendentes* |
| **Ação da viatura** | USB deixa a cidade e entra na rodovia, **em velocidade de estrada, ainda sem sirene** |
| **Enquadramento** | Plano aberto, câmera baixa. Viatura **se afastando** — traseira para a câmera |
| **Luz** | **Hora azul** — a troca de luz acontece **no corte**, não dentro do plano |
| **Frame inicial** | Viatura entrando na pista |
| **Frame final** | Viatura menor, estrada se estendendo |
| **Continuidade** | Abre o Ato 2. Sustenta a locução do eixo da transferência |
| **Refs** | `RefUSB4-Lado2` (traseira) — **obrigatória**, senão a viatura sai de frente |

**Prompt-base**
```
Photoreal documentary cinematic still, 16:9. A white and red SAMU 192 ambulance drives
away from camera along a simple two-lane countryside highway leaving a small town,
seen from BEHIND, rear toward camera, NOT front-on. Emergency lights OFF. Blue hour,
cool ambient sky, warm tail lights. Roadside vegetation, no traffic.
+ [cláusula] + [negativos]
```

---

### M07 · CRU regional ♻️ — **ativo selecionado (QC Codex)**
| Campo | Valor |
|---|---|
| **Duração final** | **4,5s** (era 2 × 5s no roteiro v2) |
| **Origem** | `B07a-1-2.mp4` — Avaré, bloco B07 (regulação/CoPilot) |
| **Nome local** | `m07b-avare-copilot-b07a.mp4` |
| **Locação real** | CRU regional — **a mesma central real que atende Manduri** |
| **Luz** | Interior, tungstênio quente. Azul/teal **só** como brilho de tela |
| **Áudio de origem** | **descartado** — entram trilha licenciada e locução na pós |
| **Função narrativa** | **Coordenação regional. Não urgência.** |

> Drive file ID registrado **apenas em arquivo local, fora do Git** — identificador de
> acesso, §9 do handoff.

**Montagem interna:**

| Trecho | Src | Dur | Conteúdo |
|---|---|---|---|
| M07a | `0,0 → 2,0` | 2,0 | Close do médico regulador, movimento corporal suave |
| — | `2,0 → 2,5` | — | ❌ descartado |
| M07b | `2,5 → 5,0` | 2,5 | Plano geral da central |

O salto de 0,5s elimina a transição/movimento facial mais frágil do original.

### ❌ Descartado para Manduri: `B04a-1-2.mp4` (TARM)

Exibe **telefone fictício com DDD 11** e interface excessivamente legível — **ruído
factual** numa peça sobre município do interior paulista.

> **Consequência narrativa:** o teaser **não mostra o TARM**. A camada de atendimento
> telefônico sai da peça; a regulação passa a ser representada apenas pelo médico
> regulador e pelo plano geral da central, com a locução sustentando o resto.

> Sala compacta, poucas estações, paredes claras. **Nunca** "megacentro high-tech" —
> CRU brasileira real é simples. Tela = CoPilot real, nunca dashboard genérico.

---

### M08 · Assinatura — **aprovado (Victor)**
| Campo | Valor |
|---|---|
| **Duração** | 5s |
| **Fundo** | `#04060C` |
| **Logo** | **branco** — `samais-logo-white.svg` |
| **Acento** | fio dourado `#D4A857`, 1px |
| **Assinatura** | "Gestão em Saúde", Syne 600, `#EDEAE2`, tracking aberto |
| **Marcas** | 🔴 **Somente Samais.** Sem SAMU, sem município, sem MS |
| **Produção** | 🔴 **100% pós.** Nunca por IA ou upscaler |

**Timing** (offset dentro dos 5s):

| Offset | Evento |
|---|---|
| 0,0–0,5 | Cross-dissolve de M07b para o fundo |
| 0,5–1,3 | Logo entra: fade + scale 98%→100%, ease-out |
| 1,3–1,8 | Fio dourado cresce do centro para fora |
| 1,8–2,4 | Assinatura entra em fade, sem movimento |
| 2,4–4,3 | Repouso — locução final cai aqui |
| 4,3–5,0 | Fade to black |

Hierarquia: logo ~22% da largura, centro óptico levemente acima do meio → fio como
separador → assinatura a ~25% do corpo do logo.

> Logo branco e não dourado: sobre `#04060C` o dourado fecha contraste, e a doutrina
> manda usar ouro com escassez (≤10% da superfície). O fio faz o acento.

---

## Custos reais — preflight `get_cost` (2026-07-27)

**Saldo verificado: `106,2` créditos · plano `max` · workspace privado.**

| Config (5s · 16:9 · mudo) | Créditos | start+end? |
|---|---|---|
| `kling3_0` mode `std` | **7,5** | ✅ |
| `kling3_0` mode `pro` | **8,75** | ✅ |
| `kling3_0_turbo` 1080p | **10** | ❌ só `start_image` |
| `kling3_0` mode `4k` | **30** | ✅ |
| `seedance_2_0` std 1080p | **45** | ✅ |

### Correções ao que o handoff trazia de memória

1. **`kling3_0` não tem parâmetro `resolution`.** A resolução é governada por `mode`
   (`std` / `pro` / `4k`). Pedir "kling3_0 1080p" **não é um parâmetro válido** — o
   handoff descrevia isso como se fosse.
2. **Seedance 2.0 dobrou.** O handoff registrava 22,5 créditos; o preflight de hoje
   devolve **45** a 1080p. Usar o número do handoff subestimaria o lote pela metade.
3. **`kling3_0_turbo` é mais caro que `kling3_0 pro`** (10 vs 8,75) e **não aceita
   `end_image`** — apesar da tag "budget". Não é a opção econômica.
4. **Não existe "2K" em vídeo.** As opções são 480p/720p/1080p/4k conforme o modelo.
   2K só via `bytedance_video_upscale` (`resolution: "2k"`) **depois** do render.
   O "2K" da direção do Codex vale para os **masters de imagem**, não para o clipe.
5. `declined_preset_id` e `get_cost` **existem** e são parâmetros válidos ✅.

### Orçamento do lote

7 clipes animados (M01–M07; M08 é pós) em `kling3_0` mode `pro`, mudo:

| | Créditos |
|---|---|
| Lote 7 × 8,75 | **61,25** |
| Saldo | 106,2 |
| **Folga para retries/QC** | **~44,95** (≈ 5 relances) |

✅ **Cabe.** Em `std` (7,5) o lote cai para 52,5 e a folga sobe para ~53,7.
❌ **Não cabe** em `seedance_2_0` (7 × 45 = 315) nem em `4k` (7 × 30 = 210).

> ⚠️ O handoff estimava ~280 créditos para o filme completo — isso era o formato de
> **24 blocos** de Avaré. Com o saldo atual de 106,2 aquele formato **não seria
> executável**. A peça de 45s é.

---

## 🎯 Piloto econômico proposto

**1 cena · 1 clipe · `M03` (Igreja Matriz / Praça Getúlio Vargas).**

| Item | Valor |
|---|---|
| Modelo | `kling3_0`, `mode: "pro"`, `sound: "off"`, `duration: 5`, `aspect_ratio: "16:9"` |
| Extra obrigatório | `declined_preset_id: "24bae836-2c4a-48e0-89b6-49fcc0b21612"` |
| Entradas | `start_image` + `end_image` (masters 2K do Codex) + `RefUSB3-Lado` |
| **Custo** | **8,75 créditos** (8,2% do saldo) |

**Por que M03:** é o plano que testa de uma vez os três riscos do lote — livery da
viatura, regra de composição (marco ao fundo, não cartão-postal) e a luz golden hour do
ato. Se M03 passar no QC, M01/M02/M04 são variações do mesmo problema resolvido.

**Alternativa:** `M02` (Prefeitura) — mesmo custo, mesmo valor de teste.

---

## Piloto M03 — executado em 2026-07-27

**Autorizado por Victor. Um clipe, exatamente como especificado.**

| Item | Valor |
|---|---|
| Modelo | `kling3_0` · `mode: pro` · `duration: 5` · `aspect_ratio: 16:9` · `sound: off` |
| `declined_preset_id` | aplicado |
| Entradas | `start_image` + `end_image` — masters 2K aprovados (2048×1152) |
| Saída | **1920×1080**, plano único (`multi_shots: false`) |
| Custo | **8,75 créditos** — saldo 106,2 → **97,45**, exatamente o aprovado |
| Lote restante | **não gerado** |

Job ID e media IDs persistidos **fora do Git** (apontam para conta e storage privados).

### ✅ Verificado por parâmetro
Resolução 1920×1080 · 16:9 · 5s · `mode: pro` · áudio desligado · plano contínuo sem
multi-shot · os dois masters 2K corretamente ligados aos papéis `start_image`/`end_image`
(e **não** o `m03-start-v1.png` menor, descartado pelo Codex).

> ℹ️ Confirmado na prática: **`pro` entrega 1920×1080**. A resolução vem do `mode` —
> `kling3_0` não aceita parâmetro `resolution`, como registrado nas correções.

### QC visual do v1 — REPROVADO (por Victor)

| Item | Resultado |
|---|---|
| Igreja / arquitetura | ✅ estável e reconhecível |
| Veículo / livery | ✅ |
| Grounding (rodas/contato/suspensão) | ✅ |
| Tracking / câmera | ✅ |
| **Luzes de emergência** | ❌ **duas balizas/lentes superiores emissivas em 2,50s e 4,90s** |

**Causa-raiz:** lentes translúcidas nos frames-guia foram interpretadas pelo modelo como
**luz ativa**. O prompt já pedia luzes apagadas — não bastou, porque o sinal veio da
imagem, não do texto.

**Lição para o lote:** o texto não vence a imagem. Onde houver lente/baliza no
frame-guia, ela precisa estar **fisicamente escura no próprio master** — não basta
proibir no prompt. Vale para M01, M02, M04, M05 e M06.

> ⚠️ Eu **não** pude fazer este QC nesta sessão: o proxy bloqueia (403) o CDN do
> Higgsfield e não há ffmpeg no container, então não consegui assistir ao clipe. O QC
> acima é do Victor/Codex. Mantida a divisão: QC de imagem é do Codex.

### Retry v2 — autorizado (exatamente um, teto 8,75)

Frames-guia corrigidos pelo Codex (`…-v2-lights-off-2k`, 2048×1152): lentes agora
**plástico fumê escuro, sem emissão**, mantendo a carroceria laranja.

Reforço aplicado ao prompt, além da base aprovada:

```
Every upper side lens and roof beacon stays physically dark and unpowered in every
frame: zero emission, no glow, no flare, no flicker, no bright core, no halo, no
reflection reading as light. The lenses are inert dark smoked plastic only, while
the body keeps its orange and white livery. Calm lateral tracking with subtle dolly
and parallax. No siren, no urgency.
```

**Resultado — executado em 2026-07-27.**

| Item | Valor |
|---|---|
| Parâmetros | `kling3_0` · `pro` · 5s · 16:9 · `sound: off` · `declined_preset_id` aplicado |
| Saída | **1920×1080**, plano contínuo (`multi_shots: false`) |
| Custo | **8,75** — saldo 97,45 → **88,70**, dentro do teto autorizado |
| Lote restante | **não gerado** |

**Consumo acumulado do piloto M03: 17,50 créditos** (v1 reprovado + v2), de um saldo
inicial de 106,2. Restam **88,70**.

⛔ **QC visual do v2 pendente com o Codex.** Continuo sem conseguir assistir: o proxy
desta sessão nega o CDN do Higgsfield por política de egresso (403 no CONNECT) e não há
ffmpeg no container. Verificado só por parâmetro. **Parada aqui, conforme instrução.**

### Orçamento revisado do lote

6 clipes restantes × 8,75 = **52,5**. Saldo **88,70** → folga de ~36 para retries.
✅ Cabe — mas a folga já é ~1,5 retry menor do que antes do retrabalho do M03. Se cada
plano precisar de um v2, o lote fica apertado: 6 × 2 × 8,75 = 105 > 88,70.
**Aplicar a lição das lentes nos masters reduz esse risco na origem.**

## Lote parcial — executado em 2026-07-27 (após QC estático aprovado)

Autorizados **5 renders** (M01, M02, M04, M05, M06), teto 43,75. **3 entraram, 2 foram
barrados pelo provedor.**

| Plano | Status | QC Codex | Créditos |
|---|---|---|---|
| M01 · Portal da cidade | ✅ concluído · 1920×1080 | ✅ **APROVADO** | 8,75 |
| M02 · Prefeitura / Rua Bahia | ✅ concluído · 1920×1080 | ✅ **APROVADO** | 8,75 |
| M04 · Rua residencial | ✅ concluído · 1920×1080 | ✅ **APROVADO** | 8,75 |
| M05 · Pronto Municipal | ✅ concluído · 1920×1080 (2ª tentativa) | ⏳ pendente | 8,75 |
| M06 · Saída para a rodovia | ✅ concluído · 1920×1080 (2ª tentativa) | ⏳ pendente | 8,75 |

**Saldo: 88,70 → 62,45 → 44,95.** Total do lote: **5 × 8,75 = 43,75**, exatamente o teto
autorizado. Nenhum crédito além do aprovado.

> **Todos os 6 clipes do teaser estão gerados.** M05 e M06 entraram na retomada
> automática de 00:05 UTC, depois que a cota diária do provedor virou. A primeira
> tentativa (23:0x UTC) falhou sem cobrança, e os créditos ficaram reservados — por isso
> o total fecha em 43,75 e não em 61,25.

### ✅ QC visual — M01, M02, M04 aprovados

Inspeção do Codex em **0 · 1,25 · 2,5 · 3,75 · 4,9 s** (os mesmos marcos onde o piloto
v1 falhou):

| Critério | Resultado |
|---|---|
| Emissão / flash / halo / núcleo luminoso nas balizas | ✅ **nenhuma** |
| Carroceria, rodas, livery | ✅ estáveis |
| Arquitetura | ✅ estável |

- **M01** — portal e lettering estáveis, passagem calma.
- **M02** — prefeitura estável, push/tracking discreto, saída à direita.
- **M04** — **melhor dinamismo do conjunto**: tracking lateral e parallax de árvores,
  sem leitura de urgência.

> A correção de causa-raiz **funcionou**: escurecer fisicamente as lentes no master
> resolveu o que o prompt sozinho não resolvia. Regra confirmada para M05 e M06.

Masters de saída (arquivos locais do Codex, fora do Git):
`m01-portal-kling-pro-v1.mp4` · `m02-prefeitura-kling-pro-v1.mp4` ·
`m04-rua-kling-pro-v1.mp4`.

### ✅ Limite diário do backend Kling — resolvido pela retomada

Na primeira tentativa (23:0x UTC), M05 e M06 falharam com `403:
grace_daily_limit_reached` — **teto diário do provedor, não crédito**. Uma segunda
tentativa imediata do M05 falhou idêntico, o que confirmou que não era transitório.
Parei de tentar em vez de martelar o backend.

**Nenhum dos dois foi cobrado** na falha, então os 17,5 créditos ficaram reservados.

Uma **retomada automática** foi armada para 00:05 UTC (21:05 BRT). Ela disparou,
reconfirmou saldo (62,45) e custo (8,75 cada), reusou os media IDs já persistidos sem
reimportar do Drive, e **os dois entraram** — a cota havia virado.

> **Lição operacional:** `grace_daily_limit_reached` é teto diário de conta, não erro de
> parâmetro nem falta de saldo. A resposta certa é **agendar a retomada**, não insistir.
> Reexecutar no mesmo dia só queima tempo; o custo fica reservado até a submissão passar.

### Conformidade da submissão

10 masters localizados por nome · 10 verificados `reader/anyone` · pares start/end
importados e conferidos · `get_cost` rodado 5× somando **exatamente 43,75** ·
`multi_shots: false` e `declined_preset_id` aplicados · variantes não-2K ignoradas.

### Download dos outputs — bloqueado

Tentativa de baixar os 3 MP4: `http 000`, CONNECT recusado pelo proxy (403 no CDN do
Higgsfield). Sem ffmpeg no container. **QC visual segue com o Codex**, conforme a
divisão acordada.

## Estado do preflight MCP Higgsfield

| Check | Resultado |
|---|---|
| Autenticação | ✅ OK — sem OAuth pendente |
| Saldo | ✅ `106,2` créditos, plano `max` |
| Workspace | ✅ privado/owner **selecionado** (`is_selected: true`) antes da submissão |
| Schemas | ✅ Lidos do catálogo ao vivo, não de memória |
| `start_image` / `end_image` | ✅ Confirmados em `kling3_0`, `seedance_2_0`, `wan2_7`, `minimax_hailuo` |
| Jobs submetidos | **1** (piloto M03, autorizado) |
| Créditos consumidos | **8,75** — saldo **97,45** |

---

## Travas antes de liberar o lote restante

1. ⛔ **QC visual do piloto M03** — pendente (ver acima). Sem ele, nada do lote roda.
2. ⛔ **Aprovação expressa de custo do lote** por Victor.
3. ⚠️ Referências reais de locação — portal, Prefeitura/Rua Bahia, Pronto Municipal,
   rodovia. Igreja Matriz ✅ tem master 2K. **Nunca inventar locação.**
4. ⚠️ Masters 2K dos planos restantes (Codex).
5. ⚠️ CNES — confirmar o Pronto Municipal antes de M05.
6. ⚠️ Tempo rodoviário Manduri→Avaré — sem ele a locução de M06 não fecha.

### Orçamento do lote restante

6 clipes (M01, M02, M04, M05, M06 + 1 de M07) × 8,75 = **52,5 créditos**.
Saldo atual **97,45** → folga de ~44,95 para retries. ✅ Cabe.

**Rastreabilidade:** ao liberar o lote, persistir os job IDs em `kling_jobs.json`
(fora do git — apontam para conta e storage privados, §9 do handoff). O MCP Higgsfield
é instável e jobs travam; job travado ~9min enquanto irmãos terminam em ~5min → relançar
(~8,75cr) sai mais barato que esperar.
