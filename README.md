# Samais-OS

O negócio **Samais Gestão em Saúde como código** — doutrina-como-código, dados de
frentes, dashboard estático e skills proprietárias. Repo **irmão** do `jarvis-os` (OS
pessoal/meta de Ota), não um substituto.

> Agentes (Claude Code etc.): ler **[`CLAUDE.md`](CLAUDE.md)** primeiro — ele carrega a
> doutrina e as regras não-negociáveis Samais.

## Mapa do repositório

| Pasta | O que é |
|---|---|
| `doutrina/` | Fonte de verdade escrita: design system, precificação (BDI), padrão FRIO, cânone de vídeo, taxonomia de gestão. |
| `frentes/` | Dados-como-arquivo: uma pasta por alvo (`status.json` + `fatos.md` + `interpretacao.md`). `belem/` é a semente completa. |
| `inteligencia/` | Benchmarks SAMU, consórcios, checklist de editais. |
| `produtos/` | Referência (não cópia) aos produtos com deploy Vercel próprio: `samais-copilot`, `samais-pep`. |
| `transversais/` | Áreas que cortam todas as frentes: operações, financeiro, marca, jurídico, tecnologia. |
| `relatorios/` | Relatórios semanais (`AAAA-SS.md`) — vazio por ora. |
| `dashboard/` | Pacote publicável: **home do OS** (`index.html`), cockpit de frentes (`frentes.html`) e as ferramentas montadas pelo build. |
| `scripts/` | `build-dashboard.mjs` — valida as frentes, gera `data.json` e **monta o bundle** (copia `ferramentas/` para `dashboard/`). |
| `ferramentas/` | Apps de uso interno. `despesas/` = prestação de contas (viagem + sede), local-first. |
| `.claude/skills/` | Skills proprietárias Samais (brand-guidelines, municipal-study, samais-video, video-gen). |

## Como rodar o dashboard

Requer Node (sem dependências externas).

```bash
node scripts/build-dashboard.mjs   # valida as frentes, gera data.json e monta o bundle
npx serve dashboard                # http://localhost:3000 — abre a HOME do OS
```

O build **valida cada `frentes/**/status.json`** contra
`frentes/_schema/status.schema.json` e falha (exit 1) se algum for inválido.

## Adicionar uma frente

1. Copiar `frentes/_schema/_template-frente/` para `frentes/<slug>/`.
2. Preencher `status.json` (respeitando o schema), `fatos.md` (factual) e
   `interpretacao.md` (interno).
3. Rodar o build. `belem/` serve de exemplo completo.

## Regras que não se quebram

Nunca "lucro"/"margem" (só Composição do Valor Contratual); Fator de Cobertura 4,5
(nunca 2,2); padrão FRIO em peça externa; nunca inventar dado; binários de vídeo fora
do git. Detalhe em [`CLAUDE.md`](CLAUDE.md) e `doutrina/`.
