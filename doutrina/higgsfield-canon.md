# Cânone de vídeo — Higgsfield

> Decisão fechada em auditoria de fluxo (validada por Ota). Governa toda geração de
> vídeo institucional Samais. A skill `video-gen` embrulha as chamadas MCP do
> Higgsfield com estes defaults.

## Plataforma-base

- **Higgsfield mensal** (Plus $49/mês ou plano Max atual), MCP-nativo.
- **Evitar o plano anual** — pagamento único quebra o caixa.
- **Artlist descartada:** o "unlimited" que a justificava só existe no anual.

## Modelos-alvo

- **Kling** e **Seedance 2.0**.
- **Imagem é resolvida grátis** via GPT/Gemini — **não gastar crédito com imagem**.

## Pipeline de qualidade

1. Gerar em **1080p + áudio nativo** (Seedance 2.0 gera imagem+som no mesmo passe).
2. **Upscale seletivo** para 2K (upscale é só vídeo, não afeta o áudio; mais barato
   que gerar nativo em alta-resolução).

## Orçamento (regra ao vivo)

- **Ler o custo em crédito ANTES de confirmar cada geração.**
- ~$55/mês compra ~**30–50 vídeos premium/mês**. 150/mês premium **não é viável**
  nesse teto (expectativa calibrada).
- **Top-up limpo** (uma vez, expira 90 dias) **>** criar segunda conta para farmar
  promo (risco de ToS; o bônus Nano Banana é imagem, inútil aqui).

## Regra de repositório

- **Vídeos gerados e pós-produção NUNCA entram no git** — pasta local ou Drive.
  (Reforçado no `.gitignore`: `*.mp4 *.mov *.webm`.)
