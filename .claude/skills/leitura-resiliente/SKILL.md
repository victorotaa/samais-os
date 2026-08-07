---
name: leitura-resiliente
description: >
  Protocolo para ler, pesquisar e extrair dados de páginas que retornam 403,
  bloqueio, Cloudflare/anti-bot, CAPTCHA ou "acesso negado" — sem contornar
  política de rede. Use SEMPRE que WebFetch/curl falhar com 403/bloqueio, quando
  uma fonte necessária "não abre", quando aparecer "checking your browser",
  Cloudflare, "página bloqueada", "server returned HTTP 403", ou quando outra
  skill (deep-research, samais-municipal-study, branding-victor-ota, qualquer
  pesquisa) precisar de uma fonte que resiste à leitura. O núcleo é DIAGNOSTICAR
  a origem do bloqueio (proxy de egresso da organização vs. anti-bot do site)
  ANTES de agir, e então escalar pela via correta e legítima de cada caso.
  Triggers: "403", "bloqueado", "não consegui ler/abrir", "Cloudflare", "anti-bot",
  "captcha", "raspagem/scraping", "web unlocker", "furar bloqueio", "ler página
  protegida".
---

# Skill — Leitura Resiliente (403 / bloqueios)

## Propósito

Quando uma fonte necessária resiste à leitura, a resposta certa **não é desistir
nem fingir que leu** — é diagnosticar *por que* resiste e escalar pela via
adequada. Esta skill codifica o protocolo. Ela vale para qualquer tarefa de
pesquisa/análise e é invocável de dentro de outras skills.

## Princípio inegociável

Existem **dois 403 diferentes**, com soluções opostas:

| Origem do bloqueio | Sintoma | Ação |
|---|---|---|
| **Proxy de egresso da organização** (política de rede) | `CONNECT tunnel failed, response 403`; o host nem é alcançado | **NUNCA contornar.** Trocar a política/allowlist, rodar fora da sessão, ou trazer o conteúdo. |
| **Anti-bot do próprio site** (Cloudflare, Akamai, DataDome) | O host responde, mas devolve página de desafio / 403 com corpo HTML / "checking your browser" | Escalar a leitura: navegador real → desbloqueador em nuvem → endpoint JSON → proxy residencial. |

Confundir os dois leva a violar política (no primeiro caso) ou a desistir cedo
demais (no segundo). **Sempre diagnostique primeiro.**

---

## FASE 1 — Diagnóstico (obrigatória, ~10s)

Rode o diagnóstico. Ele diz qual dos dois 403 você tem:

```bash
bash .claude/skills/leitura-resiliente/scripts/diagnostico-403.sh "https://host.alvo/caminho"
```

O que ele checa:
1. `curl -sS "$HTTPS_PROXY/__agentproxy/status"` — estado do proxy e falhas recentes.
2. `curl -I <url>` — a linha decisiva:
   - **`CONNECT tunnel failed, response 403`** → é o **proxy/política** → vá para a **FASE 2-P**.
   - Uma resposta HTTP real do servidor (mesmo 403/503 com corpo, título "Just a moment…", `cf-mitigated`, `Server: cloudflare`) → é **anti-bot do site** → vá para a **FASE 2-S**.
   - `405 Method Not Allowed` do proxy → cliente mandou HTTP puro; use HTTPS/`CONNECT` ou a opção de proxy da ferramenta.

> Neste ambiente (Claude Code na web) o egresso é uma **allowlist restritiva**: a
> maioria dos hosts comerciais retorna `CONNECT ... 403` (política), não anti-bot.
> Verificado em 07/2026: `lgimportados.com`, `comprasparaguai.com.br` e até
> `example.com` caem nessa classe. Não adianta navegador/Firecrawl **aqui** —
> a saída é a FASE 2-P.

---

## FASE 2-P — Bloqueio é POLÍTICA DE EGRESSO (não contornar)

**Primeiro, tente LER por um canal alternativo que não dependa do host bloqueado.**
Não se contorna a política — usa-se um caminho já permitido para chegar ao mesmo
conteúdo. Só declare a lacuna depois de esgotar estes (nesta ordem):

- **`0.a` Busca como leitura.** `WebSearch` usa um backend próprio e costuma
  passar mesmo quando o host do alvo não passa. Procure o **conteúdo** (não só o
  site): trechos da página, o nome do produto/autor, reviews de terceiros,
  vídeos, threads. Muitas vezes o dado que você queria está indexado.
- **`0.b` Wayback / cache via `WebFetch`.** Tente
  `http://archive.org/wayback/available?url=<host>` e depois o snapshot
  `https://web.archive.org/web/<ts>/<url>`. O `WebFetch` do harness tem egresso
  mais amplo que o `curl` cru — teste-o mesmo que o `curl` do diagnóstico tenha
  falhado. (Em allowlist muito apertada, até isto cai — aí siga adiante.)
- **`0.c` Fonte espelho/terceiro.** O mesmo dado costuma existir num host
  permitido: release de imprensa, página de afiliado, agregador, repositório
  oficial. Leia de lá e cite a origem.

> Nesta sessão (07/2026) o egresso é allowlist apertada: `web.archive.org`,
> `webcache.googleusercontent.com` e afins também caem. Quando `0.a–0.c` falham,
> `WebSearch` é o único canal e as rotas de resolução abaixo são o destino.

Se nenhum canal alternativo entregar, **rotas de resolução** (em ordem):

1. **Ajustar a política de rede do ambiente.** O ambiente Claude Code na web é
   criado com uma política de egresso escolhida. Uma política mais permissiva —
   ou um allowlist customizado incluindo os hosts-alvo — faz WebFetch/curl
   alcançarem a fonte normalmente. Ver `references/desbloqueadores.md §Política`
   e a doc oficial (code.claude.com/docs — rede/ambientes). **É a correção
   estrutural para este ambiente.**
2. **Rodar a leitura onde o egresso é aberto.** Máquina do Ota (Claude Code CLI
   local) ou runner self-hosted com saída liberada. Lá, o único obstáculo passa
   a ser o anti-bot do site (se houver) → aí sim aplica-se a FASE 2-S.
3. **Trazer o conteúdo para dentro.** Print, PDF, colar texto, upload de arquivo.
   Simples e infalível — foi assim que o encarte Dalet entrou no estudo de
   decants. Para dado tabular, um print já resolve; para catálogo grande, um
   export/CSV.

**Registre** no artefato final quais fontes foram bloqueadas por política e por
qual via foram (ou não) obtidas. Nunca apresente como lido o que não foi lido.

---

## FASE 2-S — Bloqueio é ANTI-BOT DO SITE (escalar a leitura)

Escada, do mais barato/local ao industrial. Suba um degrau só quando o anterior
falha.

### Degrau 1 — Navegador real headless (grátis, local)
Executa JavaScript e passa a maioria dos desafios *passivos* do Cloudflare.

```bash
node .claude/skills/leitura-resiliente/scripts/fetch-navegador.cjs "https://host.alvo/caminho"
# opções: --json (dump de respostas XHR/JSON capturadas)  --screenshot saida.png
```

O script já: usa o Chromium do ambiente (`/opt/pw-browsers`), sobrescreve o
User-Agent (o padrão `HeadlessChrome` é marcado na hora), injeta headers/locale
realistas, desliga o flag de automação, espera `networkidle` e **detecta página
de desafio** (retorna código próprio se cair em "Just a moment…").

### Degrau 2 — Desbloqueador em nuvem (relocaliza o fetch)
Um serviço externo busca a página da **infra dele** (IP residencial + solver) e
te devolve markdown/HTML limpo. Chave: se o **host da API** estiver liberado no
egresso, funciona mesmo quando o alvo não está — porque quem busca o alvo é o
serviço, não você.

- **Firecrawl** — tem **MCP oficial**; plugado à sessão, vira um "fetch" nativo
  que atravessa anti-bot. Recomendado. Setup em `references/desbloqueadores.md`.
- **Jina Reader** — `https://r.jina.ai/<url>`, grátis, teste de 1 linha.
- **ScrapingBee / Bright Data Web Unlocker / Zyte / Oxylabs** — grau industrial,
  pago por request, para varredura recorrente.

### Degrau 3 — Endpoint JSON interno (o atalho limpo)
Sites de catálogo/preço quase sempre carregam os dados via XHR/JSON por trás do
HTML — e essa API interna costuma ter anti-bot bem mais fraco (ou nenhum). Abra
DevTools → Network, ache a chamada `.json`/`/api/`, e bata direto nela: dado
estruturado, sem raspar HTML. O `--json` do script do Degrau 1 ajuda a capturá-la.

### Degrau 4 — Proxy residencial
Quando o bloqueio é por **IP** (datacenter flagrado), roteie o navegador por um
proxy residencial/móvel (Bright Data, Oxylabs, Smartproxy). Passe via a opção
`proxy` do Playwright (o script aceita `--proxy`). Para desafio interativo
(Turnstile/CAPTCHA), FlareSolverr ou solver pago (2captcha, CapSolver).

---

## FASE 3 — Registro e honestidade

- Toda fonte que exigiu escalada entra no artefato com **como foi obtida** (ex.:
  "via navegador headless", "endpoint JSON", "print fornecido pelo operador").
- Fonte não obtida vira **lacuna declarada**, nunca inferência disfarçada de fato.
- Respeitar rate limit; espaçar requests. Raspagem de preço público é tolerada,
  mas contorna ToS — para operação recorrente e séria, checar se a fonte tem
  **API de parceiro/afiliado** (mais estável que qualquer bypass).

---

## Integração com outras skills

Qualquer skill de pesquisa/análise que topar com 403/bloqueio deve **invocar esta
skill na FASE 1 antes de marcar a fonte como perdida**. Bloco de doutrina para
colar (já presente em `CLAUDE.md`):

> **Ao tomar 403/bloqueio de qualquer fonte:** não desista nem finja leitura.
> Rode `leitura-resiliente` — diagnostique proxy-vs-site e escale pela via
> correta. Nunca contorne política de egresso.

Casos de uso diretos:
- **deep-research / samais-municipal-study** — fontes que resistem à varredura.
- **branding-victor-ota** — auditoria de concorrentes com site protegido.
- **Estudos de mercado** (ex.: decants) — catálogos de preço atrás de Cloudflare.
