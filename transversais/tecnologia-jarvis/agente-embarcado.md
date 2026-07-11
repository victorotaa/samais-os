# Agente Embarcado do OS — arquitetura (decisão de arquiteto, implementação diferida)

> **Status:** arquitetura **aprovada por Ota**; **implementação diferida** para quando
> houver servidor dedicado da empresa. Este documento é a decisão assinada — o código
> vem depois, seguindo exatamente este desenho. Nada aqui altera o comportamento atual
> do OS: **o dashboard permanece read-only.**

Objetivo de longo prazo: um agente embarcado no OS que (a) **responde perguntas** sobre
o negócio-como-código e (b) **operacionaliza coisas simples** — sem estourar custo, sem
comprometer confiabilidade, e sem que dado confidencial vaze.

---

## 1. Princípio regente

> **O poder do agente é igual à reversibilidade da ação.**

O agente nunca recebe um poder que não se desfaça com um `git revert`. Toda mutação passa
pelo git (fluxo IDE → commit → cockpit), que é onde o rollback já vive. O **cockpit é
sempre downstream** (read-only sobre o que o commit trouxe) — nunca fonte de verdade,
nunca lugar de escrita.

---

## 2. As três camadas de poder

| Camada | O que o agente faz | Segurança | Estado |
|---|---|---|---|
| **0 · Ler** | Responde perguntas sobre doutrina, frentes, KPIs | Livre — não muda nada | Primeiro a implementar |
| **1 · Propor** | "Cria" frente / atualiza status **como commit/PR**, nunca escrita direta | Seguro por construção: diff revisável + rollback | Depois da Camada 0 |
| **2 · Agir** | Só ações **whitelisted e reversíveis**: rodar build, validar schema, gerar relatório semanal | Auditado, lista fechada | Por último |

Escalada de camada é **decisão explícita de Ota**, nunca automática.

---

## 3. Fronteira de confidencialidade (inegociável)

Deriva direto da doutrina FRIO e da regra de confidencial (`doutrina/padrao-frio.md`):

- **Camada FACTUAL** (`fatos.md`, `dashboard/data.json`, `status.json`) → pode ir para
  modelo **externo barato** (GLM/Kimi/Gemini) se um dia for útil.
- **Camada de INTERPRETAÇÃO ESTRATÉGICA** (`interpretacao.md`) e qualquer conteúdo
  confidencial → **NUNCA** vão para API de terceiros. Só modelo **local**.
- Estruturação jurídico-tributária e veículos de remuneração **continuam fora de
  arquivo** — não existem no corpus do agente, só em conversa.

**Regra:** a fronteira é **física no código** (o retriever filtra por camada antes de
montar o prompt), não confiança no modelo.

---

## 4. Política de custo e hospedagem

**Agora (custo ZERO):**
- **Não hospedar nada.** Sem máquina sempre-ligada. O dashboard fica **read-only**.
- O agente Camada 0, quando exercitado, roda **sob demanda** — no Mac (Ollama) ou pela
  própria IDE/agente que Ota já usa.
- **Mac de Ota = M2, 8GB.** Roda modelos **3–4B quantizados** (Qwen 2.5 3B, Llama 3.2 3B)
  para *desenvolvimento e teste*. Não é motor de produção (7–8B sofre com 8GB).

**Futuro (quando houver orçamento/infra):**
- **Servidor dedicado da empresa** (equipe interna de confiança) hospeda o agente
  sempre-ligado + modelo local (para conteúdo confidencial) atrás da VPN.
- A **VPS não recebe o modelo** a custo zero: sem GPU é lento demais; com GPU é pago.
  VPS serve o dashboard; o modelo vive no servidor dedicado ou no Mac.
- Gatilho de build (`.github/workflows/`) regenera `data.json` a cada commit, para o
  cockpit nunca mostrar dado velho.

**Custo real não é o modelo — é o contexto.** Como o OS é arquivos pequenos e
estruturados, o agente usa **retrieval escopado** (só a frente X, só a doutrina Y),
nunca o repo inteiro. É assim que o token fica minúsculo.

---

## 5. O garfo: dados passivos × integrações ativas

| Tipo | Exemplos | Natureza | Custo/risco | Ordem |
|---|---|---|---|---|
| **Dados passivos (arquivo)** | RH, financeiro overview, pipeline, marketing-como-conteúdo | Lê arquivos → cockpit | Barato, seguro, sem side-effect | **Primeiro** |
| **Integrações ativas** | Publicar em rede social, monitorar comentários na web, agendar posts | Escreve no mundo externo; credencial + serviço sempre-ligado | **Custo real + risco de marca** | Fase paga, depois |

Auto-publicar carrega risco de marca — a doutrina FRIO existe por isso. Marketing entra
**como conteúdo + calendário em arquivo**; publicar continua **manual** até haver
orçamento e a governança de escrita (Camadas 1–2).

---

## 6. Mapa de setores (frentes atuais e futuras do OS)

O padrão `frentes/` (dados-como-arquivo + schema + build + cockpit) **generaliza para
qualquer setor**. É para isto que existe `transversais/`.

- **Comercial / pipeline** — já implementado (`frentes/`).
- **Operações** — KPIs de contrato: tempo-resposta, frota, SLA, ociosidade. Prova de entrega.
- **RH / pessoas** — headcount, escalas, Fator de Cobertura 4,5. **Conecta com a
  precificação** (a diligência de headcount de Belém é literalmente isto).
- **Jurídico / contratos / compliance** — **"calendário de obrigações"**: vigência de
  contrato, renovação de CND, validade de garantia, prazo de edital. Para empresa de
  contrato público, **esquecer uma data é perder um contrato**. Datas-em-arquivo →
  alerta no cockpit. Baixa tecnologia, altíssimo valor.
- **Financeiro** — overview de receita/contratos/fluxo (alto nível). Estruturação
  jurídico-tributária **fora de arquivo** (doutrina).
- **Marketing / marca** — calendário de conteúdo, banco de peças. Publish manual por ora.

Cada setor novo = uma pasta de dados-como-arquivo com seu `schema.json`, validada no
build, exibida no cockpit. **Consistência do padrão é o moat.**

---

## 7. O desbloqueio: o agente como interface de gestores não-técnicos

Gestor de outro setor **não toca git** — e não precisa. Na **Camada 1**, o gestor
*conversa* com o agente ("atualiza o headcount de Belém para X"); o agente **redige o
arquivo e abre o PR**; **Ota (arquiteto) aprova o merge**. O gestor alimenta por
conversa; o rigor do dado é garantido pelo **schema + revisão humana**. Um só padrão
serve o setor inteiro, e ninguém aprende GitHub.

---

## 8. Estado atual × estado futuro

| | Hoje | Futuro (servidor dedicado) |
|---|---|---|
| Dashboard | Read-only, estático | Read-only + gatilho de build automático |
| Agente | Não hospedado; sob demanda no Mac (dev) | Sempre-ligado atrás da VPN |
| Modelo | 3–4B local no Mac (teste) | Local (confidencial) + externo barato (factual) |
| Poder | Nenhum (só leitura manual) | Camadas 0→1→2, escalada aprovada por Ota |
| Setores | Comercial | + Operações, RH, Jurídico, Financeiro, Marketing |

---

## 9. O que NÃO fazer ainda

- ❌ Hospedar agente sempre-ligado (quebra o custo zero).
- ❌ Dar poder de escrita direta ao agente (só via PR — Camada 1).
- ❌ Mandar `interpretacao.md`/confidencial para modelo externo.
- ❌ Integrações ativas (publish/monitoramento) antes de orçamento + governança.
- ❌ Tratar o cockpit como fonte de verdade ou lugar de edição.
