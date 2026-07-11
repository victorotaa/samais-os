---
name: samais-video
description: Produz vídeo institucional Samais (teaser, abertura de dossiê, data-viz animada) via HyperFrames (HTML→MP4 determinístico). Use SEMPRE que o pedido envolver vídeo/animação/teaser/reel para a Samais, SAMU, estudo municipal, proposta ou apresentação institucional — inclusive "animar o dossiê", "vídeo do município X", "reel de prospecção". Identidade Samais travada; parametrização por município ligada à skill samais-municipal-study; compositing opcional com B-roll do Higgsfield.
license: MIT
---

# Samais — Vídeo institucional (HyperFrames)

## Quando usar
Teaser de prospecção por município, abertura animada de dossiê, data-viz de KPIs (tempo-resposta, frota, chamados), fecho institucional. NÃO para material operacional de campo (paleta SAMU vermelho/branco) — isto é camada INSTITUCIONAL.

## Stack
HyperFrames (Apache 2.0). Loop: `npx hyperframes doctor → lint → preview → render index.html -o out.mp4`. Contrato completo na skill oficial `hyperframes` (instalada) e no CLAUDE.md (Doutrina de Vídeo).

## Identidade (travada)
Tokens e regras da skill `samais-brand-guidelines`: `--bg:#04060C`, `--gold:#D4A857` (escasso), texto `#EDEAE2`; Syne (display) / Inter (corpo) / JetBrains Mono (dados). Nunca brasão municipal. Dados sempre em JetBrains Mono. Cenários na ordem Mínimo → Base → Amplo. Audiência externa → padrão FRIO.

## Template canônico
`templates/teaser-municipal.html` (Skeleton B, 8 cenas/25s). Ponto de partida para todo teaser. Refino de motion/pacing é feito aqui no Code (preview ao vivo), não no primeiro draft.

## Parametrização (um template → N municípios)
Todo conteúdo vem do objeto `DADOS` no topo do `<script>`. Schema, alimentado pelo output da skill `samais-municipal-study`:

    const DADOS = {
      municipio, uf,
      populacao, frota,        // inteiros (JetBrains Mono, contador GSAP)
      tempoMeta,               // min — hero do tempo-resposta (contador)
      cenarios: { minimo, base, amplo }   // uma linha cada
    };

Injetar texto/números de forma síncrona no load (determinístico). Contadores via objeto + `onUpdate`. Para audiência externa, não incluir valores monetários/BDI proprietários no teaser.

## Batch por município
Para uma carteira (ex.: Sorocabana), iterar: para cada município do estudo → escrever `DADOS` → `npx hyperframes render` → coletar MP4s. Determinismo garante reprodutibilidade; roda em CI/Docker/GitHub Actions.

## Compositing com Higgsfield (opcional)
B-roll cinematográfico do Higgsfield (Seedance p/ plano-identidade veicular; Kling Pro geral; voz Sterling PT-BR) entra como fundo de cena: `<video muted playsinline>` (framework controla playback — nunca `.play()`; áudio em `<audio>` separado). Higgsfield = fotografia; HyperFrames = grafismo/tipografia/dados por cima.
