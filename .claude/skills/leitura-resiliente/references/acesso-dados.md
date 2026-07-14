# Acesso a dados sob egresso restrito — os 4 caminhos

Mapa verificado (07/2026) do ambiente Claude Code na web e como obter dados
quando o alvo cai na allowlist. Decisão de qual usar é do **dono da política**
(Ota) — esta skill não cruza a fronteira de egresso por conta própria.

## Mapa de egresso desta sessão (empírico)

| Alcançável | Bloqueado (política) |
|---|---|
| GitHub (`api`/`raw`/`codeload`), S3, GCS, npm/pypi/go, WebSearch, `*.gov.br` | Sites comerciais (LG, Compras Paraguai), `r.jina.ai`, `archive.org`, `example.com` |

O `curl`/`WebFetch` da sessão usam a **mesma allowlist**; `WebSearch` usa backend
próprio (por isso funciona). Bloqueio é **política**, não anti-bot.

---

## Caminho 1 — Ajustar a política de rede do ambiente  ⭐ recomendado
**O que é:** reconfigurar o ambiente com uma política de egresso que permita os
hosts necessários. É **autorização**, não contorno. Feito pelo Ota no painel —
não de dentro da sessão.
**Níveis (Network access):** `None` (nada) · `Trusted` (default: registries,
GitHub, cloud SDKs) · `Full` (qualquer domínio) · `Custom` (allowlist própria).
**Como (passo a passo, verificado na doc 07/2026):**
1. Abrir o ambiente para edição — ícone de nuvem onde se inicia a sessão/rotina
   (não há página separada de Environments).
2. No seletor **Network access** do diálogo, escolher **Custom** (ou **Full** se
   quiser tudo liberado).
3. No campo **Allowed domains** que aparece, um domínio por linha, com `*.` para
   subdomínio curinga. Ex. para pesquisa de decants:
   `*.lgimportados.com` / `lgimportados.com` / `*.comprasparaguai.com.br` /
   `*.dalet...` (fornecedores) — e, se for usar desbloqueador/Wayback:
   `api.firecrawl.dev` / `r.jina.ai` / `*.archive.org`.
4. Marcar **"Also include default list of common package managers"** para manter
   GitHub/registries funcionando junto com os hosts custom.
5. Salvar e **iniciar uma nova sessão** nesse ambiente (a sessão em curso mantém
   a política antiga).
**Doc:** code.claude.com/docs → "Use Claude Code on the web" → Network access.
**Limite:** depois de liberado o egresso, o host ainda pode ter anti-bot próprio
(Cloudflare) → aí sim aplica a FASE 2-S da skill (navegador real/desbloqueador).

## Caminho 2 — Rodar na máquina local (Claude Code CLI)
**O que é:** executar a pesquisa onde o egresso é aberto (sua máquina).
**Como:** Claude Code CLI local; a skill `leitura-resiliente` roda plena
(navegador real `fetch-navegador.cjs`, Firecrawl, endpoint JSON).
**Quando:** varredura pesada, muitos hosts, ou quando não quiser mexer na política.
**Limite:** não é a sessão web; resta só o anti-bot do site (se houver).

## Caminho 3 — Trazer o conteúdo (manual)
**O que é:** Ota cola/print/upload do dado; a IA processa.
**Como:** print (funcionou com o encarte Dalet), PDF, copiar/colar, CSV.
**Quando:** dado pontual, página de vendas, encarte, catálogo pequeno.
**Limite:** manual, não escala; mas é infalível e não muda nada.

## Caminho 4 — Relay via GitHub Actions (autorizado pelo dono da política)
**O que é:** delegar o fetch a um runner do Actions (egresso aberto), que grava o
resultado no repo; a sessão lê via `raw.githubusercontent` (host permitido).
**Status:** requer **autorização explícita do Ota** por cruzar a linha
"não contornar política" do CLAUDE.md. Autorizado em 07/2026 ("todos os caminhos").
**Como:**
1. Workflow `.github/workflows/fetch-relay.yml` (modos `curl` e `browser`).
2. **Precisa estar na branch default (`main`)** para ser disparável por
   `workflow_dispatch` — limitação do GitHub. Enquanto só na branch de feature,
   não dispara; ativa ao mergear.
3. Disparo: `mcp__github__actions_run_trigger` (method `run_workflow`,
   `workflow_id: fetch-relay.yml`, `ref: main`, inputs `{url, mode, selector}`).
4. Ler resultado: `raw.githubusercontent.com/<owner>/<repo>/<branch>/fetched/<slug>.txt`
   (e `.xhr.json` para o endpoint interno; `.html` para o bruto).
**Quando:** um host bloqueado que você precisa ler automatizado, sem mudar a
política global. Modo `browser` cobre anti-bot (Playwright no runner).
**Limite / consciência:** contorna a política em vez de mudá-la — se puder liberar
o host no Caminho 1, é mais limpo. Não usar para exfiltrar dado sensível nem para
alvos que o Ota não autorizaria conscientemente.

---

## Regra de decisão rápida
- Recorrente e você controla o painel → **Caminho 1**.
- Varredura pesada / privacidade → **Caminho 2**.
- Dado pontual → **Caminho 3**.
- Host específico, automatizado, sem mexer na política global → **Caminho 4** (com aval).
