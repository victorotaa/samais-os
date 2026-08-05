# CLAUDE.md — Samais-OS (doutrina-mestra para agentes)

Este é o **Samais-OS**: o negócio Samais Gestão em Saúde **como código** —
doutrina-como-código, dados de frentes, dashboard estático e skills proprietárias. É
repo **irmão** do `jarvis-os` (o OS pessoal/meta de Ota), **não** um substituto.

## Arquitetura — separação de responsabilidades (não violar)

- **`jarvis-os`** = OS pessoal/meta de Ota (constituição, roteamento de modelos,
  padrões de entrega, skill genérica `handoff-generator`). Agnóstico de negócio.
  **Permanece intacto.**
- **`samais-os`** = ESTE repo. Tudo específico da Samais.
- **`ArchBrand`** = outra marca. **Nada de ArchBrand entra aqui.**
- **Produtos com deploy Vercel ativo** (`samais-copilot`, `samais-pep`) **NÃO são
  absorvidos** — continuam repos próprios e deployáveis. Aqui entram só como
  referência (`produtos/`). **Decisão de 30/07/2026: a unificação é na propriedade
  (organização GitHub `samais`), não no código — monorepo foi avaliado e recusado.**
  Motivos e passos: `transversais/tecnologia-jarvis/organizacao-github.md`.

## Como ler este repo (ordem)

1. **`doutrina/`** — fonte de verdade escrita. Ler antes de produzir qualquer peça:
   - `taxonomia-gestao.md` — 3 categorias de gestão (⚠️ stub pendente de migração).
   - `design-system.md` + **`samais.css`** — dark liquid-glass · `#0A0A0A` / ouro `#B8954E`
     · Syne / Inter 300 / JetBrains Mono. O CSS é a verdade; o .md explica.
   - `precificacao.md` — BDI decomposto 35%; **nunca "lucro"/"margem"**.
   - `padrao-frio.md` — audiência externa: neutro, factual, sem advocacy.
   - `higgsfield-canon.md` — cânone de vídeo (decisão fechada).
   - `doutrina-de-negocios.md` — **famiglia · palavra · idoneidade**, papéis (André = CEO,
     Ota = Consigliere) e como orientá-lo: leitura e recomendação, não menu de opções.
   - `marca/` — **logotipos oficiais** (Drive, autoria Victor Ota). Wordmark no desktop,
     monograma SA+ no mobile. **Nunca escrever "Samais" em fonte genérica.**
2. **`inteligencia/`** — benchmarks SAMU, consórcios, editais.
3. **`frentes/`** — dados-como-arquivo (uma pasta por alvo). Ver "Frentes" abaixo.
4. **`transversais/tecnologia-jarvis/agente-embarcado.md`** — arquitetura do agente
   embarcado do OS (3 camadas de poder · fronteira de confidencialidade · mapa de
   setores · custo zero). Decisão aprovada, **implementação diferida**; o dashboard
   permanece read-only até haver servidor dedicado.

## Não-negociáveis (doutrina Samais)

- **Precificação:** nunca "lucro", "margem", "lucratividade" em superfície alguma.
  Sempre **"Composição do Valor Contratual"** / **"Encargos e Provisões Contratuais"**,
  em BDI decomposto. BDI de 35% sobre o CDO. Ver `doutrina/precificacao.md`.
- **Fator de Cobertura 24/7 = ~4,5** por posto (12×36), **nunca 2,2** (subdimensiona
  pela metade — lição Taboão 148 vs 80).
- **Padrão FRIO** em toda peça externa; **separação FACTUAL × INTERPRETAÇÃO** física
  (`fatos.md` × `interpretacao.md`).
- **Princípio da Realidade:** nunca inventar dado. Sem dado → "a levantar" / premissa a
  validar (✅ verificado × ⚠️ premissa). Nunca premissa como fato.
- **Confidencial:** estruturação jurídico-tributária e veículos de remuneração **não**
  se registram em arquivo — só em conversa.
- **Vídeo:** binários (`*.mp4/*.mov/*.webm`) nunca entram no git (Drive/pasta local).
- **Identidade visual:** **importe `doutrina/samais.css`** — é a fonte de verdade dos
  tokens (dark liquid-glass · `#0A0A0A` · ouro `#B8954E` · Syne/Inter 300/JetBrains Mono).
  **Nenhuma página redeclara cor**; se você está digitando um hex, provavelmente está
  errado. Marca: wordmark no desktop, monograma `SA+` no mobile — sempre os **SVGs oficiais**
  de `doutrina/marca/`, distribuídos pelo build; nunca tipografia imitando a marca.
  **Liquid glass canônico** (padrão dos estudos e do ROTA): blur 22px + saturate 150% +
  **refração** `url(#glassDistort)`, borda `rgba(255,255,255,.12)`, brilho especular interno,
  cantos 18px, sobre o brilho ambiente radial. O filtro vem de `doutrina/glass-filter.html`.
  No mobile a refração sai (custo de GPU), o vidro fica.
- **Dentro do Samais-OS só entra funcionalidade que se abre.** Nada de link para o GitHub
  nas superfícies publicadas — nem visível, nem no `data.json` (o build remove `repo` dos
  produtos). Se não há funcionalidade, **omita** e proponha o que caberia no lugar.

## Frentes (dados-como-arquivo)

Cada frente vive em `frentes/<slug>/`:
- `status.json` — **valida contra `frentes/_schema/status.schema.json`** (o build falha
  se inválido). Campos: `frente`, `uf`, `servico`, `estagio` (enum), `score` 0–10,
  `valor_contratual_mensal`, `atualizado_em`, `proximo_passo` (+ opcionais).
  ⚠️ **`valor_contratual_mensal` sai do ESTUDO, não de estimativa** — o repo `samais-estudos`
  (branch `main`) tem o estudo de cada município em `estudos-internos/*.md` (memória de
  cálculo) e `estudos/*.html` (peça). Cite o arquivo em `gatilho`. Quando o estudo tiver mais
  de um cenário, registre o **que está em negociação** e declare o outro em `proximo_passo`
  — foi o caso de Avaré (com base R$ 1,44 mi × sem base R$ 1,01 mi).
- `fatos.md` — camada FACTUAL (pública, citável).
- `interpretacao.md` — camada de INTERPRETAÇÃO ESTRATÉGICA (interna, confidencial).
- `bastidor.md` — **BASTIDOR POLÍTICO-INSTITUCIONAL** (interna, confidencial): quem decide
  (prefeito, vice, secretário de saúde, presidente de consórcio, pregoeiro), quem
  influencia fora do organograma, relações encontradas **com fonte**, porta de entrada
  recomendada, riscos políticos e histórico de contato. É o que decide a abordagem — sem
  isso a proposta boa morre na porta errada.
  **LGPD:** mínimo necessário, finalidade declarada (prospecção B2G), canal institucional
  antes do pessoal, sem dado sensível, sem boato (Princípio da Realidade).

Modelo em branco: `frentes/_schema/_template-frente/`. Semente de referência completa:
`frentes/belem/`.

## Central de inteligência (o que o OS é)

O Samais-OS é a **central de inteligência** da empresa: onde a informação entra, acumula e
é consultada. Três regras sustentam isso — violar qualquer uma devolve o OS à condição de
pasta de arquivos.

1. **Captação tem que acumular.** Uma varredura solta é foto, não inteligência. Todo domínio
   de captação precisa de uma camada derivada que some o histórico (`radar/` → `inteligencia/mercado/`).
   Se um dado só existe na última rodada, ele não está no OS — está de passagem.
2. **Derivação re-aplica a doutrina atual ao passado.** Regra nova vale para trás. O critério
   de prospecção vive em um único módulo (`scripts/lib/filtro-radar.mjs`) — termos, piso de
   porte mensal e iminência — usado pela captação, pelo reprocessamento e pela memória.
   Recalibrou `radar/filtros.json`? `node scripts/reprocessar-radar.mjs` reaplica às semanas
   já gravadas e `indexar-mercado.mjs` limpa o histórico, **sem varrer o PNCP de novo** (a
   janela da API não volta, e a varredura é cara). O que a captação da época não trouxe
   continua `null` — reprocessar reavalia, não inventa campo.
3. **Duas camadas, fronteira física.** O que pode ser citado e o que não pode nunca moram no
   mesmo arquivo:

| Camada | Onde | Vai ao ar? |
|---|---|---|
| **Citável** — fato público com fonte, mercado (PNCP), benchmarks | `fatos.md`, `inteligencia/mercado/`, `radar/` | sim |
| **Confidencial** — leitura estratégica, bastidor político, contatos | `interpretacao.md`, `bastidor.md`, `doutrina/` | **nunca** |

⚠️ **A camada citável hoje está em URL pública** (`samais-os-dashboard.vercel.app`). Enquanto
não houver controle de acesso, **nada confidencial entra no bundle** — e ao criar uma página
nova, confirme com `node scripts/build-dashboard.mjs` que só o previsto foi copiado.

## Domínios de dados (mesmo padrão: schema + arquivo + build + página)

- **`frentes/`** — pipeline comercial (ver abaixo).
- **`obrigacoes/`** — calendário de prazos com consequência (certidão, contrato, garantia,
  edital, habilitação). Uma obrigação = um JSON validado; **a criticidade é derivada da
  data**, nunca digitada. Catálogo do que registrar: `obrigacoes/README.md`.
- **`radar/`** — captação semanal de licitações no PNCP. `radar/filtros.json` é a
  **doutrina de prospecção como configuração** (núcleo 10 · adjacente 5 · contexto 2;
  exclusão de ruído em 3 níveis). Roda por GitHub Actions toda segunda; histórico em
  `radar/semanas/AAAA-SS.json`. Captação **não** é análise — o que interessar vira frente.
  **Escopo (decisão do Ota, 05/08/2026): só OPERAÇÃO COMPLETA, de porte.** SAMU · transporte
  sanitário · sistemas de prontuário e escala. **Provisão de mão de obra médica está fora** —
  plantonista, credenciamento de profissional, consultas/exames/cirurgias são outro negócio,
  com outra margem e outro risco (exclusão absoluta; "serviços médicos" genérico cai no
  condicional, para não derrubar edital de SAMU que cita equipe médica dentro da operação).
  ⚠️ **O piso de porte é MENSAL** (`valor_minimo_mensal_estimado`, hoje R$ 500 mil/mês) e o
  PNCP publica o **total do certame** — o radar divide pela vigência declarada, ou por 12 meses
  quando ela não vem, e o cartão **avisa qual dos dois foi**. Certame sem valor publicado
  **não** é descartado: ausência de dado não é evidência de porte pequeno.
  Semana com zero oportunidade **não é falha de captação** — a página diz quantos caíram em
  cada corte, e quantos eram do escopo e caíram só pelo tamanho (é esse número que justifica
  mexer no piso).
- **`inteligencia/mercado/`** — **memória acumulada** do radar (`indice.json`, derivado —
  nunca editar à mão). Responde o que uma semana não responde: recorrência por município
  (sinal mais forte), concentração por UF, faixa de valor publicada. Gerado por
  `scripts/indexar-mercado.mjs`; ver `inteligencia/mercado/README.md`.
  ⚠️ `valor_estimado` do PNCP é o **total do certame** (vigência inteira, às vezes plurianual),
  **nunca mensal** — comparar direto com `valor_contratual_mensal` infla o mercado em 12× ou mais.

- **`produtos/`** — como se **acessa** cada produto, não só onde está o código. Um produto =
  um `produto.json` validado contra `produtos/_schema/produto.schema.json`, com links
  tipados (`sistema` · `lp` · `documento` · `api`). Cada link carrega `procedencia`:
  `verificado` **exige `fonte`** (onde a URL está registrada); sem fonte é `a-confirmar` e a
  home mostra como pendência tracejada — **nunca como link que funciona**. URL não se
  adivinha (Princípio da Realidade aplicado a infraestrutura).

- **`implantacao/`** — **o que falta para cada frente contratada PARTIR**. Vender é o começo;
  entregar é o negócio. O roteiro é **único** (`_schema/roteiro-padrao.json`: habilitação ·
  dimensionamento · equipe · frota/base · sistemas · **suprimentos** · **qualidade e NEP** ·
  contrato); cada frente guarda só o **estado** de cada item — nunca uma cópia da lista.
  Melhorar o roteiro melhora todas as implantações de uma vez. **Prontidão é derivada**,
  nunca digitada; item sem registro conta como pendente (o OS não presume feito).
  A página soma as partidas simultâneas e mostra o que nenhuma frente isolada mostra:
  quando várias correm juntas, a restrição do negócio deixa de ser vender e passa a ser
  **capacidade de implantar** — mesmas pessoas, mesma frota, mesmo caixa.

- **`briefings/`** — **o que se pergunta ao ente antes de calcular**, e a entrada do estudo
  (`samais-municipal-study` FASE 0: olhar o briefing antes de pesquisar). O questionário é
  **único** e tem **teto de 40 perguntas** — para incluir uma, tira outra; questionário longo
  volta pela metade. Quatro regras de formulação, nascidas da auditoria de Avaré: uma pergunta
  = um dado · unidade e período no enunciado · tabela em vez de campo aberto · estado explícito
  (`respondido` · `nao-existe` · `a-levantar` · `nao-se-aplica`), porque "não existe indicador"
  é **achado**, não lacuna. Cada briefing guarda só as respostas,
  referenciando a pergunta por id — o build recusa resposta a pergunta inexistente.
  Cada pergunta declara **`porque`** (o que alimenta na Fórmula Mestre) e **`sensibilidade`**
  (`publico` · `interno` · `restrito`). ⚠️ **O bundle é público:** só `publico` leva o texto;
  `interno` vira "respondido · uso interno"; **`restrito` some inteiro — nem o enunciado**,
  porque mostrar "passivo trabalhista: respondido" ao lado de um município nomeado já é
  informação. A completude conta **todas** as perguntas, inclusive as ocultas.
  Semente: `briefings/avare-sp.json`. Para ler tudo ou mandar para a diretoria:
  `node scripts/briefing-dossie.mjs <slug>` — gera o documento COMPLETO em
  `briefings/_dossies/` (fora do git, porque leva o restrito junto).

## Ferramentas

- `ferramentas/despesas/` — prestação de contas (viagem + sede): lançamento com foto do
  comprovante, fechamento mensal, PDF de reembolso, consolidação da equipe por JSON.
  **Local-first** (IndexedDB no aparelho; nada em servidor). Schema:
  `ferramentas/despesas/despesa.schema.json` — valores em **centavos**.

## Build e pacote publicável

Ordem completa (o build é o último passo, sempre):

```
node scripts/radar-licitacoes.mjs     # captação da semana no PNCP (roda por Actions toda segunda)
node scripts/reprocessar-radar.mjs    # SÓ após recalibrar filtros.json: reaplica a doutrina às semanas já gravadas
node scripts/indexar-mercado.mjs      # acumula na memória de mercado, re-aplicando os filtros atuais
node scripts/build-dashboard.mjs      # valida frentes/obrigações → data.json + monta o bundle
npx serve dashboard                    # abrir por HTTP (file:// bloqueia o fetch do data.json)
```

**Só o que está em `dashboard/` vai ao ar.** O build monta o bundle:
- `dashboard/index.html` — **home do OS** (índice: ferramentas, doutrina, inteligência, produtos).
- `dashboard/frentes.html` — cockpit de frentes (pipeline).
- `dashboard/implantacao.html` — prontidão de partida das frentes contratadas.
- `dashboard/briefings.html` — levantamentos aplicados, com a fronteira de sensibilidade.
- `dashboard/radar.html` — radar de licitações (semana mais recente embarcada).
- `dashboard/mercado.html` — mercado acumulado (recorrência, UF, modalidade, faixa de valor).
- `dashboard/obrigacoes.html` — calendário de obrigações.
- `dashboard/despesas/` — cópia de `ferramentas/despesas/` (**gerada**, fora do git).
- `dashboard/data.json` — gerado das frentes.

A camada confidencial (`frentes/**/interpretacao.md`, `frentes/**/bastidor.md`, `doutrina/`)
**nunca** entra no bundle — e o build **falha** se algum termo proibido aparecer em
`dashboard/` (guarda automática no fim de `build-dashboard.mjs`).

⚠️ **`status.json` É camada citável**: ele vira `data.json`, que vai à URL pública. Bastidor
político, leitura de gestão anterior e nome de contato **não entram** em `proximo_passo`.
O que é sensível vive em `bastidor.md` e `interpretacao.md`, que não são publicados.

## Skills proprietárias (canônicas aqui)

- `.claude/skills/samais-brand-guidelines` — identidade visual institucional.
- `.claude/skills/samais-municipal-study` (+ `references/`) — protocolo de estudo
  municipal (FASES 1–6). **Referência viva das frentes.**
- `.claude/skills/video-gen` — embrulha o Higgsfield com os defaults do cânone.

`handoff-generator` **não** vive aqui — é genérica/pessoal, fica no `jarvis-os`.

## Roteamento — quando cada skill dispara

- Cidade/consórcio-alvo, "estudo de caso", "prospecção [cidade]" → `samais-municipal-study`.
- Qualquer peça visual Samais (dossiê, proposta, slide, teaser) → `samais-brand-guidelines`.
- Vídeo/teaser/motion Samais → `video-gen`.

## Doutrina de Execução Segura — Vídeo (HyperFrames)
- Vídeo programático = HyperFrames (Apache 2.0). Nunca Remotion sem decisão explícita (licença paga p/ 4+ pessoas).
- Skills: `samais-video` (marca travada), `archbrand-video` (arquétipo-derivada, no jarvis-os), `hyperframes` (contrato oficial HeyGen — infra compartilhada, instalada via `npx hyperframes skills update`).
- Pre-flight obrigatório: `npx hyperframes doctor` (Node 22+, FFmpeg) antes de qualquer render.
- Ordem de trabalho: draft → `lint` (zero erros) → `preview` → `render`. Nunca renderizar sem lint verde.
- Determinismo (inegociável): sem Math.random/Date.now/performance.now/setInterval/setTimeout/requestAnimationFrame/repeat:-1/stagger from:"random". Contadores via objeto + onUpdate. Grain via radial-gradient CSS.
- Contrato: `.scene.clip` + data-*; `.scene-content`; `window.__timelines["main"]` = data-composition-id; head na ordem gsap→core→shader-transitions; âncoras de shader com opacity:0 + primeira âncora com tl.set opacity:1; ~95% hard cuts.
- Pipeline Samais: `samais-municipal-study` → objeto DADOS → render (batch por município); B-roll Higgsfield como `<video muted playsinline>` de fundo.

## Git

- Branch de trabalho desta sessão: `claude/samais-os-setup-58a63q`. PR draft contra `main`.
