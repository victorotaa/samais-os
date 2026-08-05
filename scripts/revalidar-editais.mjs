#!/usr/bin/env node
// revalidar-editais.mjs — confere semanalmente se os editais do radar ainda existem no PNCP
// e derruba os que sumiram.
//
// POR QUE: o radar aponta para o edital no PNCP. Certame cancelado, republicado com outro
// número ou removido devolve 404 — e um cartão que leva a uma página inexistente é pior que
// nenhum cartão: manda alguém preparar proposta para o que não está mais lá.
//
// A REGRA QUE SUSTENTA ISSO — só 404 derruba, e só na segunda confirmação:
//   · 404/410 (o PNCP diz que não existe)  → marca. Duas semanas seguidas → derruba.
//   · qualquer outra coisa (timeout, 5xx, 403, rede fora) → NÃO É EVIDÊNCIA DE AUSÊNCIA.
//     O registro fica como está. Indisponibilidade não pode apagar histórico — é o mesmo
//     princípio do radar, que prefere não gravar a gravar errado.
//   · a exigência de DUAS confirmações existe porque uma janela de indisponibilidade que
//     devolva 404 (deploy, cache envenenado) apagaria a captação inteira de uma vez.
//
// O que é derrubado vira LÁPIDE em radar/derrubados.json — não some sem deixar rastro. A
// lápide é o que impede o mesmo id de voltar numa reindexação e o que permite auditar depois.
//
// Uso:
//   node scripts/revalidar-editais.mjs                 # confere tudo, grava
//   node scripts/revalidar-editais.mjs --dry-run       # só relata
//   node scripts/revalidar-editais.mjs --semana 2026-31

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEMANAS_DIR = join(ROOT, "radar", "semanas");
const LAPIDES_PATH = join(ROOT, "radar", "derrubados.json");

// Base sobrescrevível para poder testar os três caminhos (404 · erro · presente) sem
// depender do PNCP no ar — os três precisam de teste justamente porque só um deles apaga dado.
const API = process.env.PNCP_API_BASE || "https://pncp.gov.br/api/pncp/v1/orgaos";
const CONCORRENCIA = 6;     // gentileza com a API pública
const TIMEOUT_MS = 20000;
const CONFIRMACOES = 2;     // 404 em duas rodadas seguidas para derrubar

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const dryRun = argv.includes("--dry-run");
const soSemana = arg("--semana");
const hoje = new Date().toISOString().slice(0, 10);

if (!existsSync(SEMANAS_DIR)) { console.log("• radar/semanas/ não existe — nada a revalidar."); process.exit(0); }

/**
 * O id do PNCP vem como "CNPJ-1-SEQUENCIAL/ANO" (ex.: 03347127000170-1-000071/2026).
 * A consulta de uma contratação específica é por órgão/ano/sequencial.
 */
function endpointDe(id) {
  const m = /^(\d{14})-\d+-(\d+)\/(\d{4})$/.exec(String(id).trim());
  if (!m) return null;
  const [, cnpj, seq, ano] = m;
  return `${API}/${cnpj}/compras/${ano}/${String(Number(seq))}`;
}

/** @returns {"ausente"|"presente"|"indeterminado"} — nunca adivinha entre os três. */
async function conferir(id) {
  const url = endpointDe(id);
  if (!url) return "indeterminado";  // id fora do formato esperado: não se conclui nada
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "samais-os-radar/1.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404 || res.status === 410) return "ausente";
    if (res.ok) return "presente";
    return "indeterminado";          // 5xx, 403, 429 — a API não está dizendo que sumiu
  } catch {
    return "indeterminado";          // rede fora, timeout, DNS
  }
}

async function emLotes(itens, n, fn) {
  const saida = [];
  for (let i = 0; i < itens.length; i += n) {
    saida.push(...await Promise.all(itens.slice(i, i + n).map(fn)));
  }
  return saida;
}

// ---------- lápides ----------
let lapides = { _doc: "", derrubados: {}, suspeitos: {} };
if (existsSync(LAPIDES_PATH)) {
  try { lapides = { ...lapides, ...JSON.parse(readFileSync(LAPIDES_PATH, "utf8")) }; }
  catch (e) { console.warn(`⚠ ${LAPIDES_PATH} ilegível (${e.message}) — recomeçando o registro.`); }
}
lapides._doc =
  "Editais que sumiram do PNCP (404), com a data em que sumiram. Gerado por " +
  "scripts/revalidar-editais.mjs. `suspeitos` guarda quem já deu 404 uma vez e aguarda " +
  "confirmação na próxima rodada — uma indisponibilidade não pode apagar a captação. " +
  "Nada aqui volta ao radar numa reindexação.";

const arquivos = readdirSync(SEMANAS_DIR)
  .filter((f) => f.endsWith(".json") && (!soSemana || f === `${soSemana}.json`)).sort();

if (!arquivos.length) { console.log("• nenhuma semana para revalidar."); process.exit(0); }

console.log(`◆ Revalidando editais de ${arquivos.length} semana(s) no PNCP`);
console.log(`  ${CONFIRMACOES} confirmações de 404 para derrubar · indisponibilidade nunca derruba\n`);

let totalConferidos = 0, totalDerrubados = 0, totalSuspeitos = 0, totalIndet = 0, totalVoltou = 0;

for (const arquivo of arquivos) {
  const caminho = join(SEMANAS_DIR, arquivo);
  const pacote = JSON.parse(readFileSync(caminho, "utf8"));
  const ops = pacote.oportunidades || [];
  if (!ops.length) { console.log(`  ${pacote.semana ?? arquivo}: sem oportunidades.`); continue; }

  const estados = await emLotes(ops, CONCORRENCIA, async (o) => ({ o, estado: await conferir(o.id) }));
  totalConferidos += estados.length;

  const ficam = [];
  const derrubadosAgora = [], novosSuspeitos = [], indeterminados = [];

  for (const { o, estado } of estados) {
    if (estado === "presente") {
      // Voltou depois de um 404 solitário: limpa a suspeita, não fica pendurada para sempre.
      if (lapides.suspeitos[o.id]) { delete lapides.suspeitos[o.id]; totalVoltou++; }
      ficam.push({ ...o, revalidado_em: hoje });
      continue;
    }
    if (estado === "indeterminado") { indeterminados.push(o); ficam.push(o); totalIndet++; continue; }

    // ausente
    const s = lapides.suspeitos[o.id];
    const vezes = (s?.vezes ?? 0) + 1;
    if (vezes >= CONFIRMACOES) {
      delete lapides.suspeitos[o.id];
      lapides.derrubados[o.id] = {
        derrubado_em: hoje, semana: pacote.semana ?? arquivo,
        objeto: String(o.objeto || "").slice(0, 180),
        municipio: o.municipio ?? null, uf: o.uf ?? null, fonte_url: o.fonte_url ?? null,
        motivo: "404 no PNCP em duas conferências seguidas",
      };
      derrubadosAgora.push(o); totalDerrubados++;
    } else {
      lapides.suspeitos[o.id] = { vezes, primeiro_404_em: s?.primeiro_404_em ?? hoje, semana: pacote.semana ?? arquivo };
      novosSuspeitos.push(o); ficam.push(o); totalSuspeitos++;
    }
  }

  const partes = [`${ops.length} conferido(s)`];
  if (derrubadosAgora.length) partes.push(`${derrubadosAgora.length} DERRUBADO(S)`);
  if (novosSuspeitos.length) partes.push(`${novosSuspeitos.length} suspeito(s) — aguardam confirmação`);
  if (indeterminados.length) partes.push(`${indeterminados.length} indeterminado(s) — mantidos`);
  console.log(`  ${pacote.semana ?? arquivo}: ${partes.join(" · ")}`);
  for (const o of derrubadosAgora) {
    console.log(`     ✖ ${(o.municipio || o.orgao || "").slice(0, 28).padEnd(28)} ${String(o.objeto).slice(0, 62)}`);
  }

  if (dryRun || !derrubadosAgora.length) continue;
  pacote.oportunidades = ficam;
  pacote.revalidado_em = hoje;
  writeFileSync(caminho, JSON.stringify(pacote, null, 2) + "\n");
}

if (!dryRun) writeFileSync(LAPIDES_PATH, JSON.stringify(lapides, null, 2) + "\n");

console.log(`\n${dryRun ? "(dry-run) " : "✓ "}${totalConferidos} edital(is) conferido(s)`);
console.log(`  ${totalDerrubados} derrubado(s) · ${totalSuspeitos} aguardando confirmação · ` +
            `${totalIndet} indeterminado(s) (mantidos) · ${totalVoltou} voltaram`);
if (totalIndet && totalIndet === totalConferidos) {
  console.log("  ⚠ TODOS indeterminados — provavelmente o PNCP está fora. Nada foi derrubado, de propósito.");
}
if (totalDerrubados && !dryRun) console.log("  Rode `node scripts/indexar-mercado.mjs` e `node scripts/build-dashboard.mjs` em seguida.");
