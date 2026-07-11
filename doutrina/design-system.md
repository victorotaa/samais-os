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
- Gradientes coloridos, neon, glassmorphism genérico de template.
- Emojis em documentos institucionais.
