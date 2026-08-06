#!/usr/bin/env node
// radar-noticias.mjs — monitoramento do que MOVE contrato de APH, a cada 3 dias.
//
// O radar de licitações acha o CERTAME. Este acha o que vem ANTES dele: portaria de
// habilitação no DOU, decreto de emergência no diário municipal, programa federal novo.
// Quem só vê o edital chega junto com todo mundo.
//
// DUAS REGRAS QUE SUSTENTAM ISSO
//
// 1. Fonte oficial e imprensa NÃO se misturam. `oficial` é ato publicado — fato datado
//    e citável. `contexto` é pista. Um feed que trata acidente de trânsito e portaria
//    de habilitação como a mesma coisa é ruído com cara de inteligência.
// 2. NADA é resumido nem interpretado aqui. Guarda-se título, data, fonte e URL como
//    vieram. Não há modelo rodando neste script, e resumo inventado seria violação
//    direta do Princípio da Realidade — a leitura é de quem lê.
//
// ACUMULA (regra 1 da central de inteligência): cada rodada grava
// noticias/edicoes/AAAA-MM-DD.json e atualiza noticias/indice.json, deduplicado por URL,
// com primeira_vez/ultima_vez. O índice é DERIVADO — `--reindexar` reconstrói só das
// edições, re-aplicando os filtros de hoje, sem tocar a rede.
//
// CRUZA COM AS FRENTES: matéria que cita município onde temos frente é marcada. Alerta
// que chega pelo nome certo vale mais que feed que ninguém abre.
//
// Uso:
//   node scripts/radar-noticias.mjs                    # varre e grava
//   node scripts/radar-noticias.mjs --dry-run          # varre e só relata
//   node scripts/radar-noticias.mjs --reindexar        # reconstrói o índice das edições
//   node scripts/radar-noticias.mjs --fixture arq.json # teste offline

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { carregarFiltros, normalizar } from "./lib/filtro-radar.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const NOT_DIR = join(ROOT, "noticias");
const EDICOES_DIR = join(NOT_DIR, "edicoes");
const FILTROS_PATH = join(NOT_DIR, "filtros.json");
const INDICE_PATH = join(NOT_DIR, "indice.json");
const FRENTES_DIR = join(ROOT, "frentes");
const TIMEOUT_MS = 25000;

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const dryRun = argv.includes("--dry-run");
const soReindexar = argv.includes("--reindexar");
const fixture = arg("--fixture");

const { filtros, pontuar, scoreMinimo } = carregarFiltros(FILTROS_PATH);
const hoje = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const hojeISO = iso(hoje);
const desdeISO = iso(new Date(hoje.getTime() - (filtros.dias_janela ?? 4) * 86400000));

// ---------- frentes: para marcar a matéria que fala de um alvo nosso ----------
const alvos = [];
if (existsSync(FRENTES_DIR)) {
  for (const dir of readdirSync(FRENTES_DIR)) {
    if (dir.startsWith("_")) continue;
    const p = join(FRENTES_DIR, dir, "status.json");
    if (!existsSync(p)) continue;
    try {
      const f = JSON.parse(readFileSync(p, "utf8"));
      if (f.frente) alvos.push({ slug: dir, nome: f.frente, uf: f.uf ?? null, norm: normalizar(f.frente) });
    } catch { /* frente ilegível não impede o monitoramento */ }
  }
}
/** Marca a frente citada — casamento por nome do alvo, sem inventar relação. */
function frenteCitada(texto) {
  const t = normalizar(texto);
  return alvos.find((a) => a.norm.length >= 4 && t.includes(a.norm)) ?? null;
}

// ---------- fontes ----------
async function pegar(url, comoJSON = true) {
  const res = await fetch(url, {
    headers: { Accept: comoJSON ? "application/json" : "application/xml, text/xml, */*",
               "User-Agent": "samais-os-noticias/1.0" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return comoJSON ? res.json() : res.text();
}

/** Querido Diário — diários oficiais municipais. API pública, sem autenticação. */
async function fonteQueridoDiario(f) {
  const q = new URLSearchParams({
    querystring: '"SAMU" OR "atendimento móvel de urgência" OR "transporte sanitário"',
    published_since: desdeISO, published_until: hojeISO,
    size: "60", number_of_excerpts: "1", excerpt_size: "320", sort_by: "descending_date",
  });
  const j = await pegar(`${f.endpoint}?${q}`);
  return (j.gazettes || []).map((g) => ({
    titulo: (g.excerpts?.[0] || `Diário Oficial de ${g.territory_name ?? "município"}`).replace(/\s+/g, " ").trim().slice(0, 300),
    data: (g.date || "").slice(0, 10),
    url: g.url || g.txt_url || null,
    fonte_id: f.id, fonte: f.nome, tipo: f.tipo,
    orgao: [g.territory_name, g.state_code].filter(Boolean).join("/") || null,
  }));
}

/** DOU — a busca do in.gov.br responde JSON quando pedida como JSON. Não é API
 *  documentada: se o formato mudar, esta fonte falha sozinha e o resto da rodada segue. */
async function fonteDOU(f) {
  const q = new URLSearchParams({
    q: '"SAMU" OR "atendimento móvel de urgência"', s: "do1", exactDate: "personalizado",
    publishFrom: desdeISO.split("-").reverse().join("-"),
    publishTo: hojeISO.split("-").reverse().join("-"), delta: "40", sortType: "0",
  });
  const j = await pegar(`${f.endpoint}?${q}`);
  const itens = j.items || j.jsonArray || j.content || [];
  return itens.map((i) => ({
    titulo: String(i.title || i.titulo || i.artCategory || "").replace(/\s+/g, " ").trim().slice(0, 300),
    data: String(i.pubDate || i.date || i.pubName || "").slice(0, 10),
    url: i.urlTitle ? `https://www.in.gov.br/web/dou/-/${i.urlTitle}` : (i.link || null),
    fonte_id: f.id, fonte: f.nome, tipo: f.tipo,
    orgao: i.artCategory || i.orgao || "Ministério da Saúde",
  }));
}

/** RSS — sem dependência de parser: extrai <item> com regex, e falha em silêncio. */
async function fonteRSS(f) {
  const xml = await pegar(f.endpoint, false);
  const campo = (bloco, tag) => {
    const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(bloco);
    return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
  };
  return [...xml.matchAll(/<item[\s\S]*?<\/item>/g)].map((m) => {
    const b = m[0];
    const d = campo(b, "pubDate");
    const quando = d ? new Date(d) : null;
    return {
      titulo: campo(b, "title").slice(0, 300),
      data: quando && !Number.isNaN(+quando) ? iso(quando) : "",
      url: campo(b, "link") || null,
      fonte_id: f.id, fonte: f.nome, tipo: f.tipo, orgao: "Ministério da Saúde",
    };
  });
}

const COLETORES = { "querido-diario": fonteQueridoDiario, dou: fonteDOU, "gov-saude": fonteRSS };

// ---------- avaliação ----------
/** Passa pela doutrina? Notícia exige termo do NÚCLEO — só somar contexto não basta. */
function avaliar(m) {
  const texto = [m.titulo, m.orgao].filter(Boolean).join(" ");
  const { score, termos, temNucleo, motivoDescarte } = pontuar(texto);
  if (motivoDescarte === "absoluto" || motivoDescarte === "compra-de-bem") return { ok: false, motivo: "ruido" };
  if (motivoDescarte === "condicional" && !temNucleo) return { ok: false, motivo: "ruido" };
  if (!temNucleo) return { ok: false, motivo: "sem-nucleo" };
  if (score < scoreMinimo) return { ok: false, motivo: "score" };
  if (!m.url || !m.titulo) return { ok: false, motivo: "incompleta" };
  return { ok: true, score, termos: [...new Set(termos)] };
}

// ---------- índice acumulado ----------
function lerIndice() {
  if (!existsSync(INDICE_PATH)) return { materias: {} };
  try { return JSON.parse(readFileSync(INDICE_PATH, "utf8")); } catch { return { materias: {} }; }
}

function gravarIndice(materias, edicoes) {
  const lista = Object.values(materias).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const porFonte = {}, porFrente = {};
  for (const m of lista) {
    porFonte[m.fonte_id] = (porFonte[m.fonte_id] || 0) + 1;
    if (m.frente) porFrente[m.frente] = (porFrente[m.frente] || 0) + 1;
  }
  const saida = {
    _doc: "MEMÓRIA do monitoramento — derivado de noticias/edicoes/*.json. NUNCA editar à mão: " +
          "`node scripts/radar-noticias.mjs --reindexar` reconstrói re-aplicando os filtros de hoje.",
    gerado_em: hojeISO,
    edicoes,
    total: lista.length,
    oficiais: lista.filter((m) => m.tipo === "oficial").length,
    por_fonte: porFonte,
    por_frente: porFrente,
    materias: Object.fromEntries(lista.map((m) => [m.url, m])),
  };
  mkdirSync(NOT_DIR, { recursive: true });
  writeFileSync(INDICE_PATH, JSON.stringify(saida, null, 2) + "\n");
  return saida;
}

/** Reconstrói o índice só das edições — doutrina nova vale para trás, sem tocar a rede. */
function reindexar() {
  if (!existsSync(EDICOES_DIR)) { console.log("• noticias/edicoes/ não existe — nada a reindexar."); return; }
  const arquivos = readdirSync(EDICOES_DIR).filter((f) => f.endsWith(".json")).sort();
  const materias = {};
  let revogadas = 0;
  for (const arq of arquivos) {
    const ed = JSON.parse(readFileSync(join(EDICOES_DIR, arq), "utf8"));
    for (const m of ed.materias || []) {
      const v = avaliar(m);
      if (!v.ok) { revogadas++; delete materias[m.url]; continue; }
      const antes = materias[m.url];
      if (antes) { antes.ultima_vez = ed.data; if (!antes.visto_em.includes(ed.data)) antes.visto_em.push(ed.data); }
      else materias[m.url] = { ...m, score: v.score, termos_casados: v.termos,
                               primeira_vez: ed.data, ultima_vez: ed.data, visto_em: [ed.data] };
    }
  }
  const s = gravarIndice(materias, arquivos.map((f) => f.replace(/\.json$/, "")));
  console.log(`✓ índice reconstruído de ${arquivos.length} edição(ões): ${s.total} matéria(s) · ${revogadas} revogada(s) pela doutrina atual`);
}

// ---------- execução ----------
if (soReindexar) { reindexar(); process.exit(0); }

let brutas = [], falhas = [], consultadas = [];

if (fixture) {
  const f = JSON.parse(readFileSync(fixture, "utf8"));
  brutas = Array.isArray(f) ? f : f.materias || [];
  console.log(`• fixture: ${brutas.length} matéria(s) de ${fixture}`);
} else {
  console.log(`◆ Monitoramento — janela ${desdeISO} → ${hojeISO}`);
  for (const f of filtros.fontes.filter((x) => x.ativa)) {
    try {
      const itens = await COLETORES[f.id](f);
      brutas.push(...itens);
      consultadas.push(`${f.nome} (${itens.length})`);
    } catch (e) {
      // Fonte que cai não derruba a rodada — e a falha fica registrada, para o painel
      // poder dizer "esta fonte não respondeu" em vez de "não houve notícia".
      falhas.push(`${f.nome}: ${e.message}`);
    }
  }
  console.log(`  consultado: ${consultadas.join(" · ") || "nada"}`);
  if (falhas.length) console.warn(`  ⚠ falhas: ${falhas.join(" | ")}`);
  if (!brutas.length && falhas.length) {
    console.error("\n✖ Nenhuma fonte respondeu. Nada gravado (histórico preservado).");
    process.exit(1);
  }
}

const vistas = new Set();
const materias = [];
const descartes = { ruido: 0, "sem-nucleo": 0, score: 0, incompleta: 0, duplicada: 0 };

for (const m of brutas) {
  if (!m.url) { descartes.incompleta++; continue; }
  if (vistas.has(m.url)) { descartes.duplicada++; continue; }
  vistas.add(m.url);
  const v = avaliar(m);
  if (!v.ok) { descartes[v.motivo]++; continue; }
  const fr = frenteCitada([m.titulo, m.orgao].filter(Boolean).join(" "));
  materias.push({ ...m, score: v.score, termos_casados: v.termos,
                  frente: fr?.slug ?? null, frente_nome: fr?.nome ?? null, captado_em: hojeISO });
}

// Oficial primeiro, depois o mais recente: ato publicado vale mais que matéria.
materias.sort((a, b) =>
  (b.tipo === "oficial" ? 1 : 0) - (a.tipo === "oficial" ? 1 : 0) ||
  (b.data || "").localeCompare(a.data || "") || b.score - a.score);

console.log(`\n◇ ${brutas.length} item(ns) varrido(s) → ${materias.length} matéria(s)` +
            ` (${materias.filter((m) => m.tipo === "oficial").length} de fonte oficial)`);
console.log(`  descartadas: ${Object.entries(descartes).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(" · ") || "nenhuma"}`);
const comFrente = materias.filter((m) => m.frente);
if (comFrente.length) {
  console.log(`  ⚑ ${comFrente.length} cita frente nossa: ${[...new Set(comFrente.map((m) => m.frente_nome))].join(", ")}`);
}
for (const m of materias.slice(0, 8)) {
  console.log(`  [${String(m.score).padStart(2)}] ${(m.tipo === "oficial" ? "OFICIAL" : "contexto").padEnd(8)} ${m.titulo.slice(0, 76)}`);
}

if (dryRun) { console.log("\n(dry-run — nada gravado)"); process.exit(0); }

mkdirSync(EDICOES_DIR, { recursive: true });
const edicao = { data: hojeISO, janela: { de: desdeISO, ate: hojeISO },
                 varridos: brutas.length, descartes, fontes: consultadas, falhas, materias };
writeFileSync(join(EDICOES_DIR, `${hojeISO}.json`), JSON.stringify(edicao, null, 2) + "\n");
console.log(`\n✓ gravado: noticias/edicoes/${hojeISO}.json`);

// Acumular é o que separa monitoramento de foto (regra 1 da central de inteligência).
const indice = lerIndice();
const acumulado = {};
for (const [url, m] of Object.entries(indice.materias || {})) acumulado[url] = m;
let novas = 0;
for (const m of materias) {
  const antes = acumulado[m.url];
  if (antes) {
    antes.ultima_vez = hojeISO;
    if (!antes.visto_em.includes(hojeISO)) antes.visto_em.push(hojeISO);
  } else {
    novas++;
    acumulado[m.url] = { ...m, primeira_vez: hojeISO, ultima_vez: hojeISO, visto_em: [hojeISO] };
  }
}
const edicoes = readdirSync(EDICOES_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort();
const s = gravarIndice(acumulado, edicoes);
console.log(`✓ noticias/indice.json — ${s.total} matéria(s) acumulada(s) em ${edicoes.length} edição(ões) · ${novas} nova(s)`);
