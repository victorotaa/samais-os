#!/usr/bin/env node
// indexar-mercado.mjs — transforma CAPTAÇÃO em MEMÓRIA.
//
// O radar (scripts/radar-licitacoes.mjs) captura uma semana e a arquiva em
// radar/semanas/AAAA-SS.json. Cada arquivo, isolado, é uma foto: some da vista na
// semana seguinte. Este script acumula todas as fotos em um índice único —
// inteligencia/mercado/indice.json — deduplicado por id do PNCP, guardando quando
// cada certame foi visto pela primeira e pela última vez.
//
// É o que permite responder o que uma foto não responde:
//   · quais municípios/consórcios voltam ao mercado (recorrência = intenção real);
//   · quais UFs concentram demanda de APH/transporte sanitário;
//   · qual faixa de valor o mercado publica, por modalidade.
//
// PROCEDÊNCIA: 100% derivado de dado público do PNCP, já captado. Este script não
// busca nada na rede e não inventa nada — só agrega o que está em radar/semanas/.
//
// ATENÇÃO ao valor: `valor_estimado` do PNCP é o valor TOTAL do certame (vigência
// inteira, às vezes plurianual), NUNCA mensal. Não comparar com
// `valor_contratual_mensal` das frentes sem antes dividir pela vigência.
//
// Uso:  node scripts/indexar-mercado.mjs [--quieto]

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { carregarFiltros } from "./lib/filtro-radar.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEMANAS_DIR = join(ROOT, "radar", "semanas");
const MERCADO_DIR = join(ROOT, "inteligencia", "mercado");
const OUT = join(MERCADO_DIR, "indice.json");
const FILTROS_PATH = join(ROOT, "radar", "filtros.json");

// A doutrina ATUAL é re-aplicada ao histórico: recalibrar os filtros limpa o índice na
// próxima indexação, sem varrer o PNCP de novo. Doutrina nova vale para trás.
const { pontuar, scoreMinimo } = carregarFiltros(FILTROS_PATH);

const quieto = process.argv.includes("--quieto");
const log = (...a) => { if (!quieto) console.log(...a); };

if (!existsSync(SEMANAS_DIR)) {
  console.error(`✖ ${relative(ROOT, SEMANAS_DIR)} não existe. Rode o radar primeiro.`);
  process.exit(1);
}

const arquivos = readdirSync(SEMANAS_DIR).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
if (!arquivos.length) {
  console.error(`✖ nenhuma semana em ${relative(ROOT, SEMANAS_DIR)}. Rode: node scripts/radar-licitacoes.mjs`);
  process.exit(1);
}

// ---------- acumula, deduplicando por id do PNCP ----------
const porId = new Map();
const porSemana = [];

for (const arq of arquivos) {
  const semana = arq.replace(/\.json$/, "");
  let pacote;
  try {
    pacote = JSON.parse(readFileSync(join(SEMANAS_DIR, arq), "utf8"));
  } catch (e) {
    console.error(`✖ ${arq} ilegível: ${e.message}`);
    process.exit(1);
  }
  const ops = pacote.oportunidades || [];
  let novos = 0;
  let revogados = 0;

  for (const o of ops) {
    // Re-aplica a doutrina atual: o que os filtros de hoje reprovam não entra na memória,
    // mesmo que tenha sido captado quando os filtros eram mais frouxos.
    const r = pontuar(o.objeto);
    if (r.motivoDescarte || r.score < scoreMinimo) {
      revogados++;
      porId.delete(o.id);
      continue;
    }

    const antes = porId.get(o.id);
    if (antes) {
      // mesmo certame reaparecendo em outra janela: mantém o registro, anota a semana
      if (!antes.visto_em.includes(semana)) antes.visto_em.push(semana);
      antes.ultima_vez = semana;
    } else {
      novos++;
      porId.set(o.id, {
        id: o.id,
        objeto: o.objeto,
        orgao: o.orgao,
        municipio: o.municipio || null,
        uf: o.uf || null,
        modalidade: o.modalidade || null,
        publicado_em: o.publicado_em || null,
        encerramento_proposta: o.encerramento_proposta || null,
        valor_estimado: o.valor_estimado ?? null,
        // score e termos são RECALCULADOS com os filtros atuais — não herdados do arquivo
        score: r.score,
        termos_casados: r.termos,
        tem_nucleo: r.temNucleo,
        fonte_url: o.fonte_url || null,
        primeira_vez: semana,
        ultima_vez: semana,
        visto_em: [semana],
      });
    }
  }
  porSemana.push({ semana, janela: pacote.janela ?? null, varridos: pacote.varridos ?? null,
                   captados: ops.length, novos, revogados_pela_doutrina_atual: revogados });
}

const registros = [...porId.values()].sort((a, b) =>
  (b.publicado_em || "").localeCompare(a.publicado_em || "") || b.score - a.score);

// ---------- agregações ----------
const contar = (chave) => {
  const m = new Map();
  for (const r of registros) {
    const k = r[chave] || "(não informado)";
    const cur = m.get(k) || { n: 0, valor_total: 0 };
    cur.n++;
    cur.valor_total += r.valor_estimado || 0;
    m.set(k, cur);
  }
  return [...m.entries()]
    .map(([k, v]) => ({ [chave]: k, ...v }))
    .sort((a, b) => b.n - a.n || b.valor_total - a.valor_total);
};

// recorrência: mesmo município com mais de um certame distinto = demanda que volta
const porMunicipio = new Map();
for (const r of registros) {
  if (!r.municipio) continue;
  const k = `${r.municipio}/${r.uf || "??"}`;
  const cur = porMunicipio.get(k) || { municipio: r.municipio, uf: r.uf, certames: 0, valor_total: 0, score_max: 0, ultimo: null };
  cur.certames++;
  cur.valor_total += r.valor_estimado || 0;
  cur.score_max = Math.max(cur.score_max, r.score);
  if (!cur.ultimo || (r.publicado_em || "") > cur.ultimo) cur.ultimo = r.publicado_em;
  porMunicipio.set(k, cur);
}
const recorrentes = [...porMunicipio.values()]
  .filter((m) => m.certames > 1)
  .sort((a, b) => b.certames - a.certames || b.valor_total - a.valor_total);

// faixa de valor observada (só quem tem valor declarado > 0)
const valores = registros.map((r) => r.valor_estimado).filter((v) => typeof v === "number" && v > 0).sort((a, b) => a - b);
const percentil = (p) => (valores.length ? valores[Math.min(valores.length - 1, Math.floor((valores.length - 1) * p))] : null);
const faixa = valores.length
  ? { n_com_valor: valores.length, minimo: valores[0], p25: percentil(0.25), mediana: percentil(0.5), p75: percentil(0.75), maximo: valores[valores.length - 1] }
  : { n_com_valor: 0 };

const indice = {
  gerado_em: new Date().toISOString(),
  procedencia: "derivado de radar/semanas/*.json (PNCP, dado público). Nada buscado na rede, nada estimado.",
  aviso_valor: "valor_estimado é o valor TOTAL do certame conforme PNCP (vigência inteira, às vezes plurianual) — NUNCA mensal.",
  semanas: porSemana,
  total_certames: registros.length,
  por_uf: contar("uf"),
  por_modalidade: contar("modalidade"),
  municipios_recorrentes: recorrentes,
  faixa_valor_estimado: faixa,
  certames: registros,
};

mkdirSync(MERCADO_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(indice, null, 2) + "\n");

log(`✓ ${relative(ROOT, OUT)} — ${registros.length} certame(s) acumulado(s) de ${arquivos.length} semana(s).`);
log(`  UFs ativas: ${indice.por_uf.slice(0, 6).map((u) => `${u.uf}(${u.n})`).join(" · ")}`);
if (recorrentes.length) {
  log(`  Recorrentes: ${recorrentes.slice(0, 5).map((m) => `${m.municipio}/${m.uf}×${m.certames}`).join(" · ")}`);
} else {
  log("  Recorrência: nenhuma ainda (precisa de ≥2 semanas para aparecer).");
}
if (faixa.n_com_valor) {
  const brl = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");
  log(`  Valor total de certame (PNCP, não mensal): mediana ${brl(faixa.mediana)} · p75 ${brl(faixa.p75)} · máx ${brl(faixa.maximo)}`);
}
