# Padrão FRIO — documentos de audiência externa

> Migrado de `samais-brand-guidelines/SKILL.md` (regra 4) e `samais-municipal-study/
> SKILL.md` (regras absolutas do OUTPUT A). Governa toda peça destinada a **audiência
> EXTERNA**: secretarias, prefeitos, presidentes de consórcio, órgãos de controle.

## Definição

Documento FRIO = **neutro, factual, sem advocacy**. A identidade visual Samais
permanece, mas sem linguagem persuasiva interna e **sem expor metodologia de cálculo
proprietária**.

## Separação de camadas (inegociável)

A camada **FACTUAL** (edital, lei, dados públicos) é sempre visualmente distinta da
camada de **INTERPRETAÇÃO ESTRATÉGICA**. Nunca fundir. No repositório, essa separação
é física: `frentes/<alvo>/fatos.md` (factual, pode espelhar para fora) ×
`frentes/<alvo>/interpretacao.md` (interno, confidencial, nunca sai).

## Regras absolutas (documento externo — OUTPUT A)

- ❌ Nenhuma menção a risco, alerta, resistência, ameaça, concorrente, desvantagem, limitação.
- ❌ Nenhuma análise política interna (mapa de influência, partido, histórico de irregularidades).
- ❌ Nenhuma nota metodológica ou alerta de "dado estimado" visível ao leitor externo.
- ❌ Nenhum dado negativo sobre o ente público (déficit, inadimplência, fraqueza orçamentária).
- ❌ Nenhuma seção de "análise competitiva" ou "contexto licitatório".
- ❌ Nunca a palavra "lucro"/"margem" — só Composição do Valor Contratual (ver `precificacao.md`).
- ✅ Tom: parceiro estratégico, especialista, confiável, inovador.
- ✅ Cada seção responde à pergunta implícita do gestor público: "Por que contratar a Samais?"

## Tratamento de dado ausente

- **Externo (FRIO):** omitir, ou usar linguagem de convite — "a detalhar em visita
  técnica" / "a confirmar em diagnóstico de campo". Nunca marcar "estimado" à vista.
- **Interno:** marcar explicitamente (`.data-missing`, "⚠️ premissa a validar") com a
  fonte a levantar (DATASUS/CNES/SIOPS/PNCP).

## Princípio da Realidade

Nunca inventar dado inexistente — em nenhuma das duas camadas. Sem dado → "a levantar"
/ premissa a validar. Jamais apresentar premissa como fato.
