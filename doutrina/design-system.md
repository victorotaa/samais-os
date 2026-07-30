# Design System — Samais (dark liquid-glass · gold-on-black)

> **Verdade única:** os tokens vivem em **[`samais.css`](samais.css)**, neste mesmo diretório.
> Este documento explica; **o CSS decide**. Se os dois divergirem, o CSS ganha.

## Por que a identidade derivava (o problema que isto resolve)

Havia **três paletas "canônicas"** vivas ao mesmo tempo, e nenhuma declarada vencedora.
Cada peça nova herdava o arquivo que quem produziu leu primeiro:

| Fonte | Fundo | Ouro | Corpo | Status |
|---|---|---|---|---|
| `samais-rota` + `samais-estudos/css/samais.css` | `#0A0A0A` | `#B8954E` | Inter 300 | ✅ **CANÔNICA** (produção) |
| `samais-os/doutrina/design-system.md` (versão antiga) | `#04060C` | `#D4A857` | Inter 400 | ⛔ substituída |
| `samais-municipal-study/references/design-system.md` | `#060709` | `#C9A84C` | Plus Jakarta Sans | ⛔ legado dos estudos |

Não era descuido — era **conflito de especificação**. A lição: *doutrina em prosa deriva;
token em arquivo não.* Por isso a paleta agora é **código**, distribuído pelo build.

## Precedência (quando houver dúvida)

1. **`doutrina/samais.css`** — os tokens. Fonte de verdade.
2. **A produção** (`samais-estudos/css/samais.css`) — se divergir do item 1, a produção
   está certa e o item 1 é corrigido para bater.
3. Este documento e as skills — explicam, não decidem.

## Tokens

```
Base        --bg #0A0A0A · --s1 #131313 · --s2 #1A1A1A · --divider #262626
Ouro        --gold #B8954E · --gold-soft #D4B373 · --gold-deep #8E7238
Semântica   --green #1E7A4B (validado) · --amber #B8804E · --red #A33044
Texto       --text #F4F1EA · --text-2 #D9D2C5 · --muted #9C9489 · --dim #615C53
Tipografia  --display Syne · --body Inter 300 · --mono JetBrains Mono
```

**Ouro é escasso: ≤10% da superfície.** Se tudo é dourado, nada é. Uso: número-chave,
uma divisória, ícone de seção. O verde é **selo funcional** (validado/verificado) — nunca
decoração.

**Dados sempre em JetBrains Mono**, com `font-variant-numeric: tabular-nums` (classe
`.dado`). Nunca dado em Syne.

## Como usar (não redeclare cores)

```html
<link rel="stylesheet" href="./samais.css">
```

Depois use os tokens. **Nenhuma página deve ter um `:root` com cores** — se você está
escrevendo um hex, provavelmente está errado. O build (`scripts/build-dashboard.mjs`)
copia `samais.css` para cada superfície do bundle.

Componentes prontos: `.glass` e `.glass-sutil` (material), `.marca` (wordmark/monograma),
`.topbar` + `.barra-vidro` (barra fixa), `.eyebrow`, `.dado`, `.mono`.

## Liquid glass (o material)

Superfície translúcida com `backdrop-filter: blur(22px) saturate(150%)`, borda
`rgba(255,255,255,.12)`, **brilho especular interno no topo** (`inset 0 1px 0
rgba(255,255,255,.16)`), sombra profunda e cantos 18px. Sobre um **brilho ambiente
radial** fixo no fundo (ouro + verde) — é isso que o vidro tem para refratar; sem ele o
efeito não aparece.

**Refração real** (`feDisplacementMap` via `url(#glassDistort)`) é opcional, exige um
`<svg>` inline na página e só funciona em Chromium. Reservada a **peças de apresentação**
(estudos, dossiês). **Ferramentas de uso diário ficam no blur**, que é universal e não
custa performance no celular.

## Marca

Wordmark no desktop, **monograma `SA+` no mobile** (colapsa, não desaparece) — componente
`.marca`. A marca **nunca** em fonte genérica; o fallback do display é Arial Black, não
serifa. Se o SVG oficial do vault (Drive) estiver disponível, ele substitui o componente.

## Regras de aplicação

- **Audiência EXTERNA:** aplicar **padrão FRIO** ([`padrao-frio.md`](padrao-frio.md)) — a
  identidade permanece, a linguagem persuasiva sai.
- **Camadas:** FACTUAL visualmente distinta da INTERPRETAÇÃO ESTRATÉGICA. Nunca fundir.
- **Precificação:** BDI decomposto em tabela mono; nunca "lucro" ([`precificacao.md`](precificacao.md)).
- **Cenários:** Mínimo / Base / Amplo, nesta ordem; Base com badge "★ RECOMENDADO".
- **Mobile:** alvo de toque ≥44px; conteúdo largo (tabela, gráfico) rola no **próprio**
  container, nunca o `body`; número não quebra linha (`white-space:nowrap`).
- **`[hidden]` tem que ganhar:** um `display:flex` de autor vence o `hidden` e o elemento
  reaparece — `samais.css` já força `[hidden]{display:none!important}`.

## O que NUNCA fazer

- Redeclarar cor em página (use os tokens).
- Misturar a paleta institucional com a operacional do SAMU (vermelho vivo).
- Brasão municipal em peça de vídeo/institucional.
- Gradiente colorido, neon, glassmorphism genérico de template.
- Emoji em documento institucional (use glifo tipográfico).
