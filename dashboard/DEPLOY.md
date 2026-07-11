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

## 3. Vercel — caminho escolhido (privado, custo zero)

A config já está no repo: `vercel.json` (build → `data.json`, saída `dashboard/`,
`no-store` no `data.json`) + `package.json` (`npm run build`, Node 22).

> ⚠️ **Regra inegociável:** ativar **Deployment Protection → Vercel Authentication**
> (só membros do time `samais` acessam). É **gratuito** e torna o cockpit privado.
> Sem isso, a URL `*.vercel.app` fica **pública** — inaceitável para estes dados.
> (Password Protection com senha compartilhável é recurso Pro; não é necessário —
> o cockpit é interno, então Vercel Authentication basta.)

### Opção A — Git integration (recomendada; casa com IDE→commit→cockpit)

1. Vercel (time **samais**) → **Add New… → Project** → importar `victorotaa/samais-os`.
2. O `vercel.json` é lido automaticamente (build + output `dashboard/`). **Deploy**.
3. **Settings → Deployment Protection → Vercel Authentication: ON.**
4. Pronto: cada push na `main` re-deploya sozinho. Cockpit sempre fresco e privado.

### Opção B — CLI (deploy pontual)

```bash
# com a conta/time samais autenticado:
npx vercel --prod --scope samais
# depois, ATIVAR Vercel Authentication no projeto (Settings → Deployment Protection).
```

O deploy exige a conta **samais** autenticada — roda no ambiente de quem tem acesso
(não em sessão headless sem credencial).

---

## CI (já incluído)

`.github/workflows/build-dashboard.yml` valida as frentes e regenera `data.json` a cada
push/PR que toca `frentes/`. É o "portão de schema": frente inválida **quebra o CI**,
não chega ao cockpit.

## Estado atual

Cockpit **read-only** (sem escrita/agente). A evolução para poderes operacionais está
desenhada em `../transversais/tecnologia-jarvis/agente-embarcado.md` (implementação
diferida até haver servidor dedicado).
