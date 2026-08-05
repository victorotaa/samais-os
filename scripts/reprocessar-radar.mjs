#!/usr/bin/env node
// reprocessar-radar.mjs — re-aplica a doutrina ATUAL de prospecção às semanas já captadas.
//
// POR QUE EXISTE: recalibrar radar/filtros.json muda o que conta como oportunidade, mas as
// semanas gravadas continuam refletindo os filtros do dia em que foram varridas. O PNCP não
// guarda a janela para sempre e a varredura é cara — então a correção não pode depender de
// captar de novo. Este script faz para radar/semanas/ o que indexar-mercado.mjs faz para a
// memória: regra nova vale para trás (regra 2 da central de inteligência, CLAUDE.md).
//
// O que ele reavalia em cada oportunidade já gravada:
//   · ruído / score / UF  — sai o que a doutrina de hoje não aceita mais;
//   · porte MENSAL        — o PNCP publica o TOTAL do certame; o piso é mensal;
//   · iminência           — dias até o encerramento, recontados a partir de hoje.
//
// O que ele NÃO faz: inventar campo que a captação da época não trouxe. Um certame captado
// antes de o radar coletar `contato` continua sem contato — fica `null`, nunca preenchido
// por dedução (Princípio da Realidade).
//
// Uso:
//   node scripts/reprocessar-radar.mjs              # reescreve todas as semanas
//   node scripts/reprocessar-radar.mjs --dry-run    # só relata o que mudaria
//   node scripts/reprocessar-radar.mjs --semana 2026-31

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { carregarFiltros } from "./lib/filtro-radar.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEMANAS_DIR = join(ROOT, "radar", "semanas");
const FILTROS_PATH = join(ROOT, "radar", "filtros.json");

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const dryRun = argv.includes("--dry-run");
const soSemana = arg("--semana");

if (!existsSync(SEMANAS_DIR)) {
  console.log("• radar/semanas/ não existe — nada a reprocessar.");
  process.exit(0);
}

const { filtros, avaliar } = carregarFiltros(FILTROS_PATH);
const ufsAlvo = (filtros.ufs?.lista || []).map((u) => u.toUpperCase());
const hoje = new Date().toISOString().slice(0, 10);
const piso = filtros.valor_minimo_mensal_estimado ?? 0;
const brl = (n) => (n == null ? "—" : "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 }));

const arquivos = readdirSync(SEMANAS_DIR)
  .filter((f) => f.endsWith(".json") && (!soSemana || f === `${soSemana}.json`))
  .sort();

if (!arquivos.length) { console.log("• nenhuma semana encontrada."); process.exit(0); }

console.log(`◆ Reprocessando ${arquivos.length} semana(s) com os filtros de hoje`);
console.log(`  piso de porte: ${brl(piso)}/mês · vigência presumida: ${filtros.vigencia_presumida_meses ?? 12} meses\n`);

let totalAntes = 0, totalDepois = 0, totalRevogadas = 0;

for (const arquivo of arquivos) {
  const caminho = join(SEMANAS_DIR, arquivo);
  const pacote = JSON.parse(readFileSync(caminho, "utf8"));
  const antes = pacote.oportunidades || [];
  const revogadas = { ruido: 0, score: 0, uf: 0, porte: 0 };
  const depois = [];

  for (const o of antes) {
    const v = avaliar(o, hoje, ufsAlvo);
    if (!v.ok) { revogadas[v.motivo] = (revogadas[v.motivo] || 0) + 1; continue; }
    depois.push({
      ...o,
      score: v.score,
      termos_casados: v.termos,
      ...v.porte,
      // marca de proveniência: este registro passou pela doutrina desta data, não pela
      // do dia da captação. Sem isso não dá para saber se um número é velho ou revisto.
      reavaliado_em: hoje,
    });
  }

  // Iminente primeiro: prazo curto é o que muda a agenda de hoje. Depois score, depois valor.
  depois.sort((a, b) =>
    (b.iminente ? 1 : 0) - (a.iminente ? 1 : 0) ||
    (a.dias_para_encerramento ?? 9999) - (b.dias_para_encerramento ?? 9999) ||
    b.score - a.score || (b.valor_mensal_estimado || 0) - (a.valor_mensal_estimado || 0));

  const perdidas = antes.length - depois.length;
  totalAntes += antes.length; totalDepois += depois.length; totalRevogadas += perdidas;

  const detalhe = Object.entries(revogadas).filter(([, n]) => n)
    .map(([k, n]) => `${n} por ${k}`).join(" · ");
  console.log(`  ${pacote.semana ?? arquivo}: ${antes.length} → ${depois.length}` +
              (perdidas ? `  (revogadas: ${detalhe})` : "  (nada revogado)"));

  if (dryRun) continue;
  pacote.oportunidades = depois;
  pacote.revogadas_no_reprocessamento = revogadas;
  pacote.reprocessado_em = hoje;
  writeFileSync(caminho, JSON.stringify(pacote, null, 2) + "\n");
}

console.log(`\n${dryRun ? "(dry-run) " : "✓ "}${totalAntes} → ${totalDepois} oportunidade(s) · ${totalRevogadas} revogada(s) pela doutrina atual`);
if (!dryRun) console.log("  Rode `node scripts/indexar-mercado.mjs` e `node scripts/build-dashboard.mjs` em seguida.");
