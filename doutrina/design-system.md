# Design System — Samais (dark-luxury institucional)

> Fonte migrada de `samais-brand-guidelines/SKILL.md` + `samais-municipal-study/
> references/design-system.md`. Estética dark-luxury editorial: profundidade,
> sobriedade, autoridade técnica. Distinta da paleta operacional de campo do SAMU
> (navy/vermelho/branco) — esta identidade é INSTITUCIONAL (dossiês, propostas,
> apresentações a secretarias e investidores).

## Tokens canônicos (institucional / dashboard)

```css
:root {
  /* Backgrounds */
  --bg:        #04060C;  /* navy-black profundo */
  --card:      #0A0E18;  /* superfície elevada (até #0D1220) */
  --border:    rgba(212,168,87,.14);
  --border-soft: rgba(255,255,255,.06);

  /* Ouro — acento de autoridade (escasso: ≤10% da superfície) */
  --gold:      #D4A857;
  --gold-dim:  rgba(212,168,87,.55);

  /* Texto */
  --text:      #EDEAE2;  /* off-white quente — nunca #FFF puro em bloco longo */
  --text-2:    #B0AEA5;
  --text-3:    #9A968C;

  /* Semânticas (parcimônia) */
  --amber:     #DD8D0C;  /* alerta/risco */
  --red:       #C20D2F;  /* crítico */
  --green:     #5F8C6A;  /* positivo/validado */

  /* Tipografia */
  --f-display: 'Syne', system-ui, sans-serif;      /* 600–800 */
  --f-body:    'Inter', system-ui, sans-serif;      /* 400/500 */
  --f-mono:    'JetBrains Mono', monospace;          /* 400/500 */
}
```

Import de fontes:

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

> **Variante de estudo municipal (skill `samais-municipal-study`):** os HTMLs de
> estudo usam uma paleta próxima porém distinta — `--bg #060709`, `--gold #C9A84C`,
> corpo em **Plus Jakarta Sans**, com cyan institucional `#16a085`. É intencional
> (legado do padrão Sorriso/MT). Ao gerar um estudo, seguir a referência da skill;
> para dashboard/peças institucionais novas, seguir os tokens canônicos acima.
> <!-- TODO: diretoria decidir se unifica as duas paletas numa só. -->

## Vidro Institucional (Dark Luxury Glass)

> Camada de superfície canônica desde 2026-07-26. Origem técnica: o *liquid glass*
> do Le Savant (`perfume-platform/src/app/globals.css`), reancorado nos tokens
> Samais. **Não é o glassmorphism genérico de template que a seção "O que NUNCA
> fazer" proíbe** — aquele é vidro branco-azulado, borda uniforme de 1px branca e
> blur solto sobre fundo chapado. Este aqui é vidro *escuro, quente e com quina
> iluminada*, com substrato desenhado atrás para haver o que refratar. A proibição
> continua valendo para o genérico; o que está autorizado é **este** sistema.

### Por que vidro (e não card chapado)

O card chapado (`background: var(--card)`) não tem profundidade: sobre `#04060C` ele
é um retângulo levemente mais claro. O vidro resolve três coisas de uma vez:
hierarquia sem inventar cor nova, sobreposição legível em cima de fotografia
municipal (capas, `.context-card`), e uma "quina" de luz que carrega o ouro sem
gastar área dourada — o brilho de borda conta como estrutura, não como acento.

### Tokens

```css
:root {
  /* Corpo do vidro — o --card com alfa, nunca cinza neutro */
  --glass-body:        rgba(10, 14, 24, .55);
  --glass-body-strong: rgba(10, 14, 24, .80); /* denso: passa por cima de dado dourado */
  --glass-body-media:  rgba(4, 6, 12, .62);   /* sobre fotografia */

  /* Quina iluminada — o ouro entra aqui, como luz, não como preenchimento */
  --glass-edge:        rgba(212, 168, 87, .40);
  --glass-edge-fade:   rgba(212, 168, 87, .08);

  /* Especular — off-white QUENTE. Branco puro sobre navy-black vira névoa fria. */
  --glass-specular:    rgba(240, 228, 201, .10);
  --glass-specular-2:  rgba(240, 228, 201, .028);

  --glass-blur:        22px;
  --glass-blur-strong: 34px;
}
```

### Substrato (obrigatório antes do vidro)

Vidro sobre fundo chapado não é vidro — é um retângulo translúcido. Toda peça que
usar `.glass` precisa de um campo ambiente atrás:

```css
body::before {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(1100px 620px at 82% -12%, rgba(212,168,87,.07), transparent 62%),
    radial-gradient(820px 520px at 8% 108%, rgba(64,92,140,.05), transparent 60%),
    linear-gradient(rgba(212,168,87,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,168,87,.022) 1px, transparent 1px);
  background-size: auto, auto, 64px 64px, 64px 64px;
}
```

Grid de 64px é o mesmo passo do `.grid-bg` dos estudos municipais — a malha que
aparece através do vidro é o que prova ao olho que há blur acontecendo.

### As quatro camadas

`.glass` é a **base** — carrega `position: relative`, a quina iluminada (`::before`)
e o raio. As outras três são **modificadores** e nunca andam sozinhas:

```html
<div class="glass">…</div>                  <!-- card, painel  -->
<header class="glass glass-strong">…</header><!-- flutuante     -->
<div class="glass glass-media">…</div>       <!-- sobre foto    -->
<div class="glass glass-gold">…</div>        <!-- o veredicto   -->
```

Usar `.glass-media` sozinho entrega um retângulo escuro sem quina — o vidro perde
justamente o que o faz ler como pane física.

```css
/* Base — cards de dado, painéis, tabelas em bloco */
.glass {
  position: relative;
  background-color: var(--glass-body);
  background-image:
    linear-gradient(145deg, var(--glass-specular) 0%, var(--glass-specular-2) 30%, transparent 58%),
    linear-gradient(to bottom, rgba(240,228,201,.03), transparent 40%);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.28);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.28);
  border: 1px solid transparent;   /* a quina real vem do ::before */
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(240,228,201,.09),
    inset 0 -1px 0 rgba(0,0,0,.30),
    0 18px 44px rgba(0,0,0,.38);
}

/* Quina iluminada — gradiente de borda, mais viva onde o especular bate */
.glass::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  padding: 1px; pointer-events: none;
  background: linear-gradient(145deg,
    var(--glass-edge) 0%, var(--glass-edge-fade) 38%,
    rgba(240,228,201,.05) 66%, transparent 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}

/* Flutuante — nav fixa, header sticky, modal, badge sobreposta */
/* Atenção à especificidade: `.glass` fixa position:relative (0,1,0). Um seletor
   de elemento (`header{position:sticky}` = 0,0,1) PERDE. Use `header.glass`. */
.glass-strong {
  background-color: var(--glass-body-strong);
  backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.32);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(1.32);
  box-shadow:
    inset 0 1px 0 rgba(240,228,201,.11),
    inset 0 -1px 0 rgba(0,0,0,.34),
    0 24px 60px rgba(0,0,0,.46);
}

/* Sobre fotografia — capas, .context-card, divisores com imagem regional */
.glass-media {
  background-color: var(--glass-body-media);
  background-image:
    linear-gradient(145deg, rgba(240,228,201,.085) 0%, transparent 55%),
    linear-gradient(to top, rgba(4,6,12,.55), transparent 70%);
  backdrop-filter: blur(18px) saturate(1.15) brightness(.92);
  -webkit-backdrop-filter: blur(18px) saturate(1.15) brightness(.92);
  box-shadow:
    inset 0 1px 0 rgba(240,228,201,.10),
    inset 0 -1px 0 rgba(0,0,0,.40),
    0 22px 58px rgba(0,0,0,.50);
}

/* Ouro — EXCLUSIVO do elemento-veredicto da peça (cenário ★ RECOMENDADO,
   Composição do Valor Contratual, verdict Go). Um por peça. */
.glass-gold {
  background-color: rgba(30, 24, 12, .58);
  background-image:
    linear-gradient(145deg, rgba(212,168,87,.16) 0%, rgba(212,168,87,.04) 34%, transparent 62%);
  box-shadow:
    inset 0 1px 0 rgba(212,168,87,.22),
    inset 0 -1px 0 rgba(0,0,0,.32),
    0 20px 52px rgba(0,0,0,.42),
    0 0 46px rgba(212,168,87,.07);
}
.glass-gold::before {
  background: linear-gradient(145deg,
    rgba(212,168,87,.75) 0%, rgba(212,168,87,.22) 40%, rgba(212,168,87,.06) 100%);
}
```

### Degradação obrigatória (não é opcional)

Dossiê Samais vira PDF e é aberto em navegador de secretaria. `backdrop-filter`
falha nos dois — e falha *feio* (bloco preto ou transparente ilegível). Todo
arquivo que usar vidro carrega estes dois blocos:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass, .glass-strong, .glass-media { background-color: var(--card); }
  .glass-gold { background-color: #1E180C; }
}

@media print {
  /* Sem isto, uma transition ativa durante a troca de mídia imprime a cor
     INTERPOLADA (meio do caminho entre o vidro escuro e o papel claro). */
  * { transition: none !important; animation: none !important; }
  body { background: #fff; color: #141413; }
  body::before { display: none; }
  .glass, .glass-strong, .glass-media, .glass-gold {
    backdrop-filter: none; -webkit-backdrop-filter: none;
    background: #FAF9F5; color: #141413; box-shadow: none;
    border: 1px solid rgba(0,0,0,.18);
  }
  .glass::before, .glass-gold::before { display: none; }
  .glass-media { background-image: none; }  /* o scrim escuro come o texto no papel */
}
```

O miolo impresso vira claro (`#FAF9F5` / `#141413`), coerente com a regra de
"PDF/impresso: miolo pode inverter" da seção de artefatos. Capa e divisórias
seguem dark — não recebem `.glass`.

### Regras de uso

1. **Vidro é superfície, não decoração.** Aplica-se a bloco que agrupa conteúdo.
   Nunca a texto, ícone, linha divisória ou selo pequeno.
2. **Máximo dois níveis de empilhamento.** `.glass` dentro de `.glass` já é sopa;
   três é template. Se precisar de terceiro nível, o problema é a hierarquia.
3. **`.glass-gold` é um por peça.** É o veredicto visual. Dois anulam o efeito
   pela mesma lógica da regra dos ≤10% de ouro.
4. **Sobre fotografia, sempre `.glass-media`** — nunca `.glass`. O corpo mais denso
   e o `brightness(.92)` são o que sustentam o contraste sobre foto clara.
   **Medido** (Chromium, pior caso = céu estourado `#FFF`, sem nenhum overlay
   atrás): composto `rgb(79,78,79)` → **6,58:1** contra `#EDEAE2`. AA (4,5:1) com
   folga; com o `.context-overlay` dos estudos atrás, sobe para 9,55:1. Há margem
   para clarear a foto, não para clarear o vidro.
5. **Contraste é verificado sobre o pior caso**, não sobre o fundo médio: capa de
   município com céu claro atrás. Se não passar AA, aumenta o corpo do vidro —
   nunca clareia o texto para além de `#EDEAE2`. Verifique medindo o pixel
   composto (screenshot → canvas → `getImageData`), não por estimativa: o
   `backdrop-filter` compõe blur, `saturate`, `brightness` e duas camadas de
   gradiente, e a conta de cabeça erra por larga margem.
6. **Padrão FRIO (audiência externa):** só `.glass` e `.glass-media`. Sem
   `.glass-gold`, sem hover animado, sem brilho pulsante. Sobriedade é o produto.
7. **Dados continuam em JetBrains Mono e ouro continua escasso.** O vidro não
   compra licença para dourar mais superfície — ele existe justamente para dar
   hierarquia *sem* gastar ouro.
8. **Hover (só em superfície interativa):** sobe o especular e a quina, nunca
   `transform: scale`. `transition: background-color .25s, box-shadow .25s`.

## Tipografia — regras

1. **Hierarquia:** kicker em caps pequenas douradas → título Syne grande → corpo
   Inter com line-height ≥1.6.
2. **Dados sempre em JetBrains Mono** — R$, %, BDI, populações, frotas, IDs, códigos
   de lei. Nunca dados em Syne.
3. **Dourado é escasso:** ≤10% da superfície. Se tudo é dourado, nada é. Uso:
   números-chave, uma linha divisória, ícones de seção.

## Regras de aplicação

- **Audiência EXTERNA:** aplicar **padrão FRIO** (ver `padrao-frio.md`) — a identidade
  visual permanece, mas sem linguagem persuasiva e sem expor metodologia proprietária.
- **Separação de camadas:** camada FACTUAL (edital, lei, dados) visualmente distinta da
  camada de INTERPRETAÇÃO ESTRATÉGICA (ex.: blocos com borda âmbar). Nunca fundir.
- **Precificação:** sempre BDI decomposto em tabela mono; nunca "lucro"/"taxa de
  administração" (ver `precificacao.md`).
- **Cenários:** Mínimo / Base / Amplo, nesta ordem; Base com badge "★ RECOMENDADO".
- **Gráficos:** SVG/CSS puro ou Chart.js/Recharts com fundo transparente, grid
  `rgba(255,255,255,.05)`, série principal em ouro, secundárias em cinza-quente,
  labels em Mono.

## O que NUNCA fazer

- Misturar a paleta institucional com a operacional SAMU (vermelho vivo) na mesma peça.
- Brasões municipais em peças de vídeo/institucionais.
- Gradientes coloridos, neon, **glassmorphism genérico de template** — vidro
  branco-azulado, `rgba(255,255,255,.1)` com borda branca uniforme e blur solto
  sobre fundo chapado. O substituto autorizado é o **Vidro Institucional** acima
  (corpo escuro quente, quina dourada em gradiente, substrato desenhado atrás).
- Vidro sem substrato — `backdrop-filter` sobre fundo liso não refrata nada e
  entrega um retângulo cinza. Sem o campo ambiente do `body::before`, use card
  chapado.
- Vidro sem os blocos de `@supports` e `@media print` — em PDF e em navegador de
  secretaria o bloco vira mancha ilegível.
- Emojis em documentos institucionais.
