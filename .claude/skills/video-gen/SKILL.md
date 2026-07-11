---
name: video-gen
description: >
  Gera vídeo institucional Samais via Higgsfield (MCP-nativo) aplicando o cânone de
  vídeo fechado em `doutrina/higgsfield-canon.md`. Use SEMPRE que Ota pedir vídeo,
  teaser, peça de vídeo institucional, motion, ou geração/upscale de vídeo para a
  Samais. Embrulha as chamadas MCP do Higgsfield com os defaults: Kling/Seedance 2.0,
  1080p + áudio nativo → upscale seletivo para 2K, com orçamento de crédito lido ao
  vivo antes de cada geração. NÃO usar para imagem (resolver grátis via GPT/Gemini).
---

# video-gen — cânone de vídeo Samais (Higgsfield)

> **Stub funcional.** Codifica o cânone de `doutrina/higgsfield-canon.md`. Evoluir com
> exemplos reais de chamada conforme os primeiros vídeos forem gerados.

## Defaults inegociáveis (do cânone)

1. **Plataforma:** Higgsfield mensal (Plus $49 ou Max), MCP-nativo. Nunca o plano anual.
2. **Modelos:** Kling e Seedance 2.0. **Imagem NÃO** — resolver grátis via GPT/Gemini.
3. **Pipeline:** gerar 1080p + **áudio nativo** (Seedance 2.0 no mesmo passe) →
   **upscale seletivo** para 2K (só vídeo, não afeta áudio).
4. **Orçamento ao vivo:** ler o custo em crédito **ANTES de confirmar cada geração**.
   ~$55/mês ≈ 30–50 vídeos premium/mês (150/mês não é viável). Preferir top-up limpo a
   segunda conta.
5. **Git:** vídeos e pós-produção **NUNCA** entram no repo — pasta local ou Drive.

## Protocolo

### 1. Antes de gerar
- Confirmar objetivo, duração-alvo, e se há imagem-base (se não, gerar imagem grátis
  fora do Higgsfield).
- Chamar `mcp__Higgsfield_AI__balance` / `show_plans_and_credits` para ver o saldo.
- Se o modelo ideal não estiver claro, `models_explore(action:'recommend')`.

### 2. Geração
- `mcp__Higgsfield_AI__generate_video` com Seedance 2.0 (imagem+áudio) ou Kling.
- **Ler o custo em crédito e confirmar** que cabe no orçamento antes de disparar.
- Resolução: 1080p nativo.

### 3. Pós
- Upscale seletivo só das tomadas aprovadas: `mcp__Higgsfield_AI__upscale_video` → 2K.
- Salvar fora do git (pasta local / Drive). Nunca commitar `.mp4/.mov/.webm`.

## Referência
- Cânone completo: `doutrina/higgsfield-canon.md`.
- Identidade visual (quando o vídeo tiver placas/lower-thirds): `doutrina/design-system.md`.
