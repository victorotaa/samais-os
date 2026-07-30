# CLAUDE.md — Samais-OS (doutrina-mestra para agentes)

Este é o **Samais-OS**: o negócio Samais Gestão em Saúde **como código** —
doutrina-como-código, dados de frentes, dashboard estático e skills proprietárias. É
repo **irmão** do `jarvis-os` (o OS pessoal/meta de Ota), **não** um substituto.

## Arquitetura — separação de responsabilidades (não violar)

- **`jarvis-os`** = OS pessoal/meta de Ota (constituição, roteamento de modelos,
  padrões de entrega, skill genérica `handoff-generator`). Agnóstico de negócio.
  **Permanece intacto.**
- **`samais-os`** = ESTE repo. Tudo específico da Samais.
- **`ArchBrand`** = outra marca. **Nada de ArchBrand entra aqui.**
- **Produtos com deploy Vercel ativo** (`samais-copilot`, `samais-pep`) **NÃO são
  absorvidos** — continuam repos próprios e deployáveis. Aqui entram só como
  referência (`produtos/`).

## Como ler este repo (ordem)

1. **`doutrina/`** — fonte de verdade escrita. Ler antes de produzir qualquer peça:
   - `taxonomia-gestao.md` — 3 categorias de gestão (⚠️ stub pendente de migração).
   - `design-system.md` + **`samais.css`** — dark liquid-glass · `#0A0A0A` / ouro `#B8954E`
     · Syne / Inter 300 / JetBrains Mono. O CSS é a verdade; o .md explica.
   - `precificacao.md` — BDI decomposto 35%; **nunca "lucro"/"margem"**.
   - `padrao-frio.md` — audiência externa: neutro, factual, sem advocacy.
   - `higgsfield-canon.md` — cânone de vídeo (decisão fechada).
2. **`inteligencia/`** — benchmarks SAMU, consórcios, editais.
3. **`frentes/`** — dados-como-arquivo (uma pasta por alvo). Ver "Frentes" abaixo.
4. **`transversais/tecnologia-jarvis/agente-embarcado.md`** — arquitetura do agente
   embarcado do OS (3 camadas de poder · fronteira de confidencialidade · mapa de
   setores · custo zero). Decisão aprovada, **implementação diferida**; o dashboard
   permanece read-only até haver servidor dedicado.

## Não-negociáveis (doutrina Samais)

- **Precificação:** nunca "lucro", "margem", "lucratividade" em superfície alguma.
  Sempre **"Composição do Valor Contratual"** / **"Encargos e Provisões Contratuais"**,
  em BDI decomposto. BDI de 35% sobre o CDO. Ver `doutrina/precificacao.md`.
- **Fator de Cobertura 24/7 = ~4,5** por posto (12×36), **nunca 2,2** (subdimensiona
  pela metade — lição Taboão 148 vs 80).
- **Padrão FRIO** em toda peça externa; **separação FACTUAL × INTERPRETAÇÃO** física
  (`fatos.md` × `interpretacao.md`).
- **Princípio da Realidade:** nunca inventar dado. Sem dado → "a levantar" / premissa a
  validar (✅ verificado × ⚠️ premissa). Nunca premissa como fato.
- **Confidencial:** estruturação jurídico-tributária e veículos de remuneração **não**
  se registram em arquivo — só em conversa.
- **Vídeo:** binários (`*.mp4/*.mov/*.webm`) nunca entram no git (Drive/pasta local).
- **Identidade visual:** **importe `doutrina/samais.css`** — é a fonte de verdade dos
  tokens (dark liquid-glass · `#0A0A0A` · ouro `#B8954E` · Syne/Inter 300/JetBrains Mono).
  **Nenhuma página redeclara cor**; se você está digitando um hex, provavelmente está
  errado. Marca: wordmark no desktop, monograma `SA+` no mobile.

## Frentes (dados-como-arquivo)

Cada frente vive em `frentes/<slug>/`:
- `status.json` — **valida contra `frentes/_schema/status.schema.json`** (o build falha
  se inválido). Campos: `frente`, `uf`, `servico`, `estagio` (enum), `score` 0–10,
  `valor_contratual_mensal`, `atualizado_em`, `proximo_passo` (+ opcionais).
- `fatos.md` — camada FACTUAL (pública, citável).
- `interpretacao.md` — camada de INTERPRETAÇÃO ESTRATÉGICA (interna, confidencial).
- `bastidor.md` — **BASTIDOR POLÍTICO-INSTITUCIONAL** (interna, confidencial): quem decide
  (prefeito, vice, secretário de saúde, presidente de consórcio, pregoeiro), quem
  influencia fora do organograma, relações encontradas **com fonte**, porta de entrada
  recomendada, riscos políticos e histórico de contato. É o que decide a abordagem — sem
  isso a proposta boa morre na porta errada.
  **LGPD:** mínimo necessário, finalidade declarada (prospecção B2G), canal institucional
  antes do pessoal, sem dado sensível, sem boato (Princípio da Realidade).

Modelo em branco: `frentes/_schema/_template-frente/`. Semente de referência completa:
`frentes/belem/`.

## Central de inteligência (o que o OS é)

O Samais-OS é a **central de inteligência** da empresa: onde a informação entra, acumula e
é consultada. Três regras sustentam isso — violar qualquer uma devolve o OS à condição de
pasta de arquivos.

1. **Captação tem que acumular.** Uma varredura solta é foto, não inteligência. Todo domínio
   de captação precisa de uma camada derivada que some o histórico (`radar/` → `inteligencia/mercado/`).
   Se um dado só existe na última rodada, ele não está no OS — está de passagem.
2. **Derivação re-aplica a doutrina atual ao passado.** Regra nova vale para trás. O critério
   de prospecção vive em um único módulo (`scripts/lib/filtro-radar.mjs`) usado tanto na
   captação quanto na memória; recalibrar `radar/filtros.json` limpa o histórico na próxima
   indexação, sem varrer a fonte de novo.
3. **Duas camadas, fronteira física.** O que pode ser citado e o que não pode nunca moram no
   mesmo arquivo:

| Camada | Onde | Vai ao ar? |
|---|---|---|
| **Citável** — fato público com fonte, mercado (PNCP), benchmarks | `fatos.md`, `inteligencia/mercado/`, `radar/` | sim |
| **Confidencial** — leitura estratégica, bastidor político, contatos | `interpretacao.md`, `bastidor.md`, `doutrina/` | **nunca** |

⚠️ **A camada citável hoje está em URL pública** (`samais-os-dashboard.vercel.app`). Enquanto
não houver controle de acesso, **nada confidencial entra no bundle** — e ao criar uma página
nova, confirme com `node scripts/build-dashboard.mjs` que só o previsto foi copiado.

## Domínios de dados (mesmo padrão: schema + arquivo + build + página)

- **`frentes/`** — pipeline comercial (ver abaixo).
- **`obrigacoes/`** — calendário de prazos com consequência (certidão, contrato, garantia,
  edital, habilitação). Uma obrigação = um JSON validado; **a criticidade é derivada da
  data**, nunca digitada. Catálogo do que registrar: `obrigacoes/README.md`.
- **`radar/`** — captação semanal de licitações no PNCP. `radar/filtros.json` é a
  **doutrina de prospecção como configuração** (núcleo 10 · adjacente 5 · contexto 2;
  exclusão de ruído em 3 níveis). Roda por GitHub Actions toda segunda; histórico em
  `radar/semanas/AAAA-SS.json`. Captação **não** é análise — o que interessar vira frente.
- **`inteligencia/mercado/`** — **memória acumulada** do radar (`indice.json`, derivado —
  nunca editar à mão). Responde o que uma semana não responde: recorrência por município
  (sinal mais forte), concentração por UF, faixa de valor publicada. Gerado por
  `scripts/indexar-mercado.mjs`; ver `inteligencia/mercado/README.md`.
  ⚠️ `valor_estimado` do PNCP é o **total do certame** (vigência inteira, às vezes plurianual),
  **nunca mensal** — comparar direto com `valor_contratual_mensal` infla o mercado em 12× ou mais.

## Ferramentas

- `ferramentas/despesas/` — prestação de contas (viagem + sede): lançamento com foto do
  comprovante, fechamento mensal, PDF de reembolso, consolidação da equipe por JSON.
  **Local-first** (IndexedDB no aparelho; nada em servidor). Schema:
  `ferramentas/despesas/despesa.schema.json` — valores em **centavos**.

## Build e pacote publicável

Ordem completa (o build é o último passo, sempre):

```
node scripts/radar-licitacoes.mjs     # captação da semana no PNCP (roda por Actions toda segunda)
node scripts/indexar-mercado.mjs      # acumula na memória de mercado, re-aplicando os filtros atuais
node scripts/build-dashboard.mjs      # valida frentes/obrigações → data.json + monta o bundle
npx serve dashboard                    # abrir por HTTP (file:// bloqueia o fetch do data.json)
```

**Só o que está em `dashboard/` vai ao ar.** O build monta o bundle:
- `dashboard/index.html` — **home do OS** (índice: ferramentas, doutrina, inteligência, produtos).
- `dashboard/frentes.html` — cockpit de frentes (pipeline).
- `dashboard/radar.html` — radar de licitações (semana mais recente embarcada).
- `dashboard/mercado.html` — mercado acumulado (recorrência, UF, modalidade, faixa de valor).
- `dashboard/obrigacoes.html` — calendário de obrigações.
- `dashboard/despesas/` — cópia de `ferramentas/despesas/` (**gerada**, fora do git).
- `dashboard/data.json` — gerado das frentes.

A camada confidencial (`frentes/**/interpretacao.md`, `frentes/**/bastidor.md`, `doutrina/`)
**nunca** entra no bundle.

## Skills proprietárias (canônicas aqui)

- `.claude/skills/samais-brand-guidelines` — identidade visual institucional.
- `.claude/skills/samais-municipal-study` (+ `references/`) — protocolo de estudo
  municipal (FASES 1–6). **Referência viva das frentes.**
- `.claude/skills/video-gen` — embrulha o Higgsfield com os defaults do cânone.

`handoff-generator` **não** vive aqui — é genérica/pessoal, fica no `jarvis-os`.

## Roteamento — quando cada skill dispara

- Cidade/consórcio-alvo, "estudo de caso", "prospecção [cidade]" → `samais-municipal-study`.
- Qualquer peça visual Samais (dossiê, proposta, slide, teaser) → `samais-brand-guidelines`.
- Vídeo/teaser/motion Samais → `video-gen`.

## Doutrina de Execução Segura — Vídeo (HyperFrames)
- Vídeo programático = HyperFrames (Apache 2.0). Nunca Remotion sem decisão explícita (licença paga p/ 4+ pessoas).
- Skills: `samais-video` (marca travada), `archbrand-video` (arquétipo-derivada, no jarvis-os), `hyperframes` (contrato oficial HeyGen — infra compartilhada, instalada via `npx hyperframes skills update`).
- Pre-flight obrigatório: `npx hyperframes doctor` (Node 22+, FFmpeg) antes de qualquer render.
- Ordem de trabalho: draft → `lint` (zero erros) → `preview` → `render`. Nunca renderizar sem lint verde.
- Determinismo (inegociável): sem Math.random/Date.now/performance.now/setInterval/setTimeout/requestAnimationFrame/repeat:-1/stagger from:"random". Contadores via objeto + onUpdate. Grain via radial-gradient CSS.
- Contrato: `.scene.clip` + data-*; `.scene-content`; `window.__timelines["main"]` = data-composition-id; head na ordem gsap→core→shader-transitions; âncoras de shader com opacity:0 + primeira âncora com tl.set opacity:1; ~95% hard cuts.
- Pipeline Samais: `samais-municipal-study` → objeto DADOS → render (batch por município); B-roll Higgsfield como `<video muted playsinline>` de fundo.

## Git

- Branch de trabalho desta sessão: `claude/samais-os-setup-58a63q`. PR draft contra `main`.
