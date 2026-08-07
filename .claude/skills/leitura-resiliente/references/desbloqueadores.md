# Desbloqueadores — referência técnica (jul/2026)

Compilado do que a doc oficial e a comunidade (r/webscraping, HN, blogs de
Apify/ScrapFly/Browserless) reportam funcionar em 2025–2026. Ordenado por
custo/esforço. **Antes de qualquer coisa, rode o diagnóstico** — metade dos "403"
são política de egresso, não anti-bot, e para esses NADA aqui se aplica.

---

## §Política — quando o bloqueio é do sandbox/egresso (não do site)

O problema não é do agente; é da **arquitetura de sandbox**. Todos os agentes de
código sérios travam egresso por padrão para conter exfiltração e prompt-injection:

| Agente | Egresso padrão | Como liberar |
|---|---|---|
| **Claude Code (web)** | Allowlist restritiva; proxy de política | Escolher/ajustar a política de rede do ambiente (allowlist de hosts). Doc: code.claude.com/docs. |
| **Claude Code (CLI local)** | Egresso da máquina (aberto) | Já aberto — só resta o anti-bot do site. |
| **OpenAI Codex (cloud)** | **Rede OFF por padrão**; fase-agente offline | Habilitar internet access + `network_proxy` com regras allow/deny de domínio. "Lockdown Mode" prende o scrape ao cache. |
| **OpenAI Codex (CLI local)** | `workspace-write` sem rede por padrão | Habilitar rede na config (`sandbox`/`network`) → vira egresso da máquina. |

**Conclusão:** o "browser embarcado" de qualquer agente **não fura egresso** — ele
obedece à mesma política de domínio. A parede é o sandbox. Escolha:
1. **Liberar o host na política do ambiente** (correção estrutural, mais limpa).
2. **Rodar onde o egresso é aberto** (máquina local / runner self-hosted).
3. **Trazer o conteúdo** (print/PDF/upload) — trivial e à prova de bloqueio.

---

## §Anti-bot — quando o site (Cloudflare/Akamai/DataDome) desafia

As **três faixas que ainda funcionam em 2026** (consenso de Apify/ScrapFly/Browserless):

### Faixa DIY (barata, exige manutenção)
Combinação necessária — nenhum item sozinho basta:
- **Navegador real** (Chromium via Playwright) — padrão-ouro de fingerprint HTTP/2.
  `scripts/fetch-navegador.cjs` já entrega isto.
- **Stealth atualizado** — `puppeteer-extra-plugin-stealth` está **abandonado
  desde início de 2025**; use **`playwright-extra` + stealth** ou **Camoufox**
  (fork stealth do Firefox), que é o queridinho atual do r/webscraping.
- **Proxy residencial/móvel** — imprescindível se você roda em VPS/datacenter
  (IP de datacenter é flagrado no server-side). Bright Data, Oxylabs, Smartproxy.
- **TLS fingerprint (JA3/JA4)** — mesmo com IP residencial, o hash TLS entrega
  Playwright/requests. Em Python, **`curl_cffi`** (libcurl+BoringSSL, impersona
  Chrome/Firefox) é o padrão atual. Em navegador real, o fingerprint já é nativo.

### Faixa gerenciada (paga por request, zero manutenção) — recomendada p/ recorrência
Você manda a URL, o serviço busca da infra dele (residencial + solver + TLS) e
devolve HTML/markdown. **Relocaliza o fetch** — funciona mesmo quando seu egresso
não alcança o alvo, desde que o host da API esteja liberado.
- **Firecrawl** — tem **MCP oficial**; melhor encaixe para fluxo de agente.
  Setup abaixo.
- **Bright Data Web Unlocker** — US$ 2,49–5,40 / 1.000 req; robusto contra
  Cloudflare/CAPTCHA/TLS.
- **ScrapFly / ScrapingBee / Zyte / Apify / ZenRows / Browserless (BQL)** —
  equivalentes; escolha por preço/SDK.

### Faixa legitimidade (a mais estável) — preferir quando existir
- **API oficial / de parceiro / afiliado** da fonte. Agregadores de preço
  (Compras Paraguai etc.) às vezes têm programa de afiliado com feed de dados —
  mais estável e sem violar ToS.
- **Endpoint JSON interno** do próprio site (DevTools → Network): dado
  estruturado, anti-bot geralmente mais fraco. O `--json` do script captura.

---

## Setup — Firecrawl MCP (Degrau 2, recomendado)

Onde o egresso alcança `api.firecrawl.dev`:

```jsonc
// .mcp.json (ou config de MCP da sessão)
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "fc-..." }   // criar em firecrawl.dev
    }
  }
}
```
Depois, a leitura de página protegida vira uma tool nativa (`firecrawl_scrape`)
que devolve markdown limpo.

## Setup — Jina Reader (teste de 1 linha, grátis)
```
https://r.jina.ai/https://host-alvo/caminho
```
Bom para checagem rápida; não segura Cloudflare pesado.

---

## Higiene e legitimidade
- Respeitar `robots.txt` quando aplicável e **espaçar requests** (rate limit).
- Raspagem de **preço público** é tolerada, mas contorna ToS — para operação
  recorrente e comercial, preferir a faixa legitimidade.
- Nunca usar dado obtido para se passar por outra pessoa/loja; nunca coletar
  dado pessoal.

---

## Fontes
- OpenAI Codex — Sandbox, Internet access, Security (developers.openai.com/codex).
- Firecrawl — AI Agent Sandbox (firecrawl.dev/blog/ai-agent-sandbox).
- Apify — How to bypass Cloudflare (blog.apify.com/bypass-cloudflare) e use-apify.com.
- ScrapFly — Bypass Cloudflare anti-scraping (scrapfly.io/blog).
- Browserless — Bypass Cloudflare with Playwright / BQL (browserless.io/blog).
- Discussões r/webscraping e HN sobre curl_cffi, Camoufox, playwright-extra (2025–2026).
