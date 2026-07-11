# Deploy do Cockpit — Samais-OS

> **Regra de ouro:** os dados do cockpit são **comerciais-sensíveis** (valores de
> contrato, verdicts, pipeline). **Nunca** expor numa URL pública. Deploy só em
> ambiente com controle de acesso (VPN / rede interna / autenticação).

O dashboard é um site **estático** (`index.html` + `data.json`). `data.json` é
**gerado** por `node scripts/build-dashboard.mjs` (varre `frentes/**/status.json`,
valida contra o schema, falha se inválido). Sempre rode o build antes de servir.

---

## 1. Preview instantâneo (ver agora, local)

```bash
node scripts/build-dashboard.mjs      # gera dashboard/data.json
npx serve dashboard                    # http://localhost:3000
# (file:// não funciona — o fetch do data.json exige HTTP)
```

## 2. Produção privada — servidor da empresa atrás da VPN (recomendado · custo zero)

Usa Docker (que a empresa já opera). Privado por construção, sem SaaS.

```bash
docker compose up -d --build           # sobe em :8080
# publique só na interface interna/VPN — ex.: no compose, "127.0.0.1:8080:80"
# atrás da VPN:  http://<host-interno>:8080
```

O `Dockerfile` faz o build (valida schema + gera `data.json`) e serve por nginx com
`no-store` no `data.json` (cockpit nunca mostra dado velho). Para atualizar após novos
commits nas frentes: `docker compose up -d --build` de novo (ou automatizar no CI/CD
interno da empresa).

## 3. Alternativa externa — Vercel (só com proteção de acesso)

A doutrina Samais prevê Vercel (`team samais`). **Só se ativar controle de acesso** —
senão a URL `*.vercel.app` fica pública por obscuridade, o que é inaceitável para estes
dados. Requer **Vercel Authentication / Password Protection** (recurso de plano pago).

```bash
# uma vez, com a conta samais autenticada:
npx vercel --prod --scope samais
# e ATIVAR Deployment Protection (SSO/senha) no projeto — sem isso, não usar.
```

Config sugerida (`vercel.json`, se optar por este caminho): servir a pasta `dashboard/`
como estático, com `buildCommand: "node scripts/build-dashboard.mjs"` e
`outputDirectory: "dashboard"`.

---

## CI (já incluído)

`.github/workflows/build-dashboard.yml` valida as frentes e regenera `data.json` a cada
push/PR que toca `frentes/`. É o "portão de schema": frente inválida **quebra o CI**,
não chega ao cockpit.

## Estado atual

Cockpit **read-only** (sem escrita/agente). A evolução para poderes operacionais está
desenhada em `../transversais/tecnologia-jarvis/agente-embarcado.md` (implementação
diferida até haver servidor dedicado).
