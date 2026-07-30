#!/usr/bin/env node
// radar-licitacoes.mjs — varre o PNCP (Portal Nacional de Contratações Públicas) na
// janela dos últimos N dias, filtra o que se enquadra com a Samais (radar/filtros.json)
// e grava radar/semanas/<AAAA-SS>.json.
//
// API pública, sem autenticação:
//   https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao
//     ?dataInicial=AAAAMMDD&dataFinal=AAAAMMDD&codigoModalidadeContratacao=N&pagina=1
//
// Uso:
//   node scripts/radar-licitacoes.mjs                 # janela dos filtros (default 7 dias)
//   node scripts/radar-licitacoes.mjs --dias 14
//   node scripts/radar-licitacoes.mjs --de 20260701 --ate 20260731
//   node scripts/radar-licitacoes.mjs --fixture arquivo.json   # teste offline
//   node scripts/radar-licitacoes.mjs --dry-run       # não grava, só relata
//
// Roda semanalmente em .github/workflows/radar-licitacoes.yml. Falha "soft": se o PNCP
// estiver fora, o script sai com aviso e SEM sobrescrever a semana já captada — nunca
// destrói histórico por indisponibilidade de rede.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { carregarFiltros } from "./lib/filtro-radar.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RADAR_DIR = join(ROOT, "radar");
const SEMANAS_DIR = join(RADAR_DIR, "semanas");
const FILTROS_PATH = join(RADAR_DIR, "filtros.json");
const API = "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao";
const PAGINAS_MAX = 20; // trava de segurança por modalidade

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const arg = (nome) => { const i = argv.indexOf(nome); return i >= 0 ? argv[i + 1] : null; };
const flag = (nome) => argv.includes(nome);

// ---------- datas ----------
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
const iso = (d) => d.toISOString().slice(0, 10);
/** Semana ISO 8601 (AAAA-SS) — a chave do arquivo semanal. */
function semanaISO(data) {
  const d = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semana = Math.ceil(((d - inicioAno) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(semana).padStart(2, "0")}`;
}

// ---------- filtros (doutrina compartilhada com o indexador de mercado) ----------
const { filtros, pontuar } = carregarFiltros(FILTROS_PATH);
const ufsAlvo = (filtros.ufs?.lista || []).map((u) => u.toUpperCase());

// ---------- PNCP ----------
async function buscarPagina(modalidade, de, ate, pagina) {
  const url = `${API}?dataInicial=${de}&dataFinal=${ate}&codigoModalidadeContratacao=${modalidade}&pagina=${pagina}&tamanhoPagina=50`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "samais-os-radar/1.0" },
    signal: AbortSignal.timeout(45000),
  });
  if (res.status === 204) return { itens: [], totalPaginas: 0 }; // sem conteúdo
  if (!res.ok) throw new Error(`HTTP ${res.status} em modalidade ${modalidade} pág ${pagina}`);
  const json = await res.json();
  // o PNCP devolve {data:[...], totalPaginas, totalRegistros}; toleramos variações de formato
  const itens = Array.isArray(json) ? json : json.data || json.items || [];
  const totalPaginas = json.totalPaginas ?? json.totalPages ?? (itens.length ? pagina : 0);
  return { itens, totalPaginas };
}

/** Extrai os campos que interessam, tolerando nomes alternativos do PNCP. */
function mapear(it) {
  const un = it.unidadeOrgao || it.unidade || {};
  const org = it.orgaoEntidade || it.orgao || {};
  const id = it.numeroControlePNCP || it.numeroControlePncp || it.id || "";
  return {
    id: String(id),
    objeto: it.objetoCompra || it.objeto || it.descricao || "",
    orgao: org.razaoSocial || org.nome || un.nomeUnidade || "—",
    municipio: un.municipioNome || un.nomeMunicipio || null,
    uf: (un.ufSigla || un.uf || "--").toString().toUpperCase().slice(0, 2),
    publicado_em: (it.dataPublicacaoPncp || it.dataPublicacao || "").toString().slice(0, 10),
    abertura_proposta: it.dataAberturaProposta || null,
    encerramento_proposta: it.dataEncerramentoProposta || null,
    valor_estimado:
      typeof it.valorTotalEstimado === "number" ? it.valorTotalEstimado
      : typeof it.valorTotal === "number" ? it.valorTotal : null,
  };
}

// ---------- execução ----------
const hoje = new Date();
const dias = Number(arg("--dias") || filtros.dias_janela || 7);
const de = arg("--de") || ymd(new Date(hoje.getTime() - dias * 86400000));
const ate = arg("--ate") || ymd(hoje);
const fixture = arg("--fixture");
const dryRun = flag("--dry-run");

let brutos = [];
let modalidadesConsultadas = [];
let falhas = [];

if (fixture) {
  // modo teste offline: um JSON com {itens:[...]} ou um array do PNCP
  const f = JSON.parse(readFileSync(fixture, "utf8"));
  brutos = Array.isArray(f) ? f : f.itens || f.data || [];
  console.log(`• fixture: ${brutos.length} registro(s) de ${fixture}`);
} else {
  console.log(`◆ Radar PNCP — janela ${de} → ${ate}`);
  for (const m of filtros.modalidades.lista) {
    let pagina = 1, totalPaginas = 1, capturados = 0;
    try {
      while (pagina <= totalPaginas && pagina <= PAGINAS_MAX) {
        const { itens, totalPaginas: tp } = await buscarPagina(m.codigo, de, ate, pagina);
        totalPaginas = tp || 0;
        brutos.push(...itens.map((i) => ({ ...i, __modalidade: m.nome })));
        capturados += itens.length;
        if (!itens.length) break;
        pagina++;
      }
      modalidadesConsultadas.push(`${m.nome} (${capturados})`);
    } catch (e) {
      falhas.push(`${m.nome}: ${e.message}`);
    }
  }
  console.log(`  consultado: ${modalidadesConsultadas.join(" · ") || "nada"}`);
  if (falhas.length) console.warn(`  ⚠ falhas: ${falhas.join(" | ")}`);
}

// rede totalmente indisponível → não destrói histórico
if (!fixture && !brutos.length && falhas.length) {
  console.error("\n✖ PNCP inacessível em todas as modalidades. Nada gravado (histórico preservado).");
  process.exit(1);
}

// ---------- filtragem ----------
const vistos = new Set();
const oportunidades = [];
let descartadasRuido = 0, descartadasScore = 0, descartadasUF = 0, duplicadas = 0;

for (const bruto of brutos) {
  const o = mapear(bruto);
  if (!o.id || !o.objeto) continue;
  if (vistos.has(o.id)) { duplicadas++; continue; }
  vistos.add(o.id);

  const { score, termos, temNucleo, motivoDescarte } = pontuar(o.objeto);
  // "absoluto" e "compra-de-bem" descartam sempre; "condicional" cede ao núcleo
  if (motivoDescarte === "absoluto" || motivoDescarte === "compra-de-bem") { descartadasRuido++; continue; }
  if (motivoDescarte === "condicional" && !temNucleo) { descartadasRuido++; continue; }
  if (score < (filtros.score_minimo ?? 5)) { descartadasScore++; continue; }
  if (ufsAlvo.length && !ufsAlvo.includes(o.uf)) { descartadasUF++; continue; }

  const refMensal = filtros.valor_minimo_mensal_estimado ?? 0;
  oportunidades.push({
    ...o,
    modalidade: bruto.__modalidade || bruto.modalidadeNome || "—",
    score,
    termos_casados: [...new Set(termos)],
    porte_a_revisar: o.valor_estimado != null && refMensal > 0 && o.valor_estimado < refMensal,
    fonte_url: `https://pncp.gov.br/app/editais/${encodeURIComponent(o.id)}`,
    captado_em: new Date().toISOString(),
  });
}

oportunidades.sort((a, b) => b.score - a.score || (b.valor_estimado || 0) - (a.valor_estimado || 0));

const semana = semanaISO(hoje);
const pacote = {
  semana,
  janela: { de: `${de.slice(0, 4)}-${de.slice(4, 6)}-${de.slice(6)}`, ate: `${ate.slice(0, 4)}-${ate.slice(4, 6)}-${ate.slice(6)}` },
  gerado_em: iso(hoje),
  varridos: brutos.length,
  descartados: { ruido: descartadasRuido, score: descartadasScore, uf: descartadasUF, duplicadas },
  modalidades: modalidadesConsultadas,
  falhas,
  oportunidades,
};

console.log(`\n◇ ${brutos.length} contratação(ões) varrida(s) → ${oportunidades.length} oportunidade(s) no radar`);
console.log(`  descartadas: ${descartadasRuido} por ruído · ${descartadasScore} por score · ${descartadasUF} por UF · ${duplicadas} duplicada(s)`);
for (const o of oportunidades.slice(0, 10)) {
  console.log(`  [${String(o.score).padStart(2)}] ${o.uf} · ${(o.municipio || o.orgao).slice(0, 34).padEnd(34)} ${o.objeto.slice(0, 66)}`);
}

if (dryRun) { console.log("\n(dry-run — nada gravado)"); process.exit(0); }

mkdirSync(SEMANAS_DIR, { recursive: true });
const destino = join(SEMANAS_DIR, `${semana}.json`);
writeFileSync(destino, JSON.stringify(pacote, null, 2) + "\n");
console.log(`\n✓ gravado: radar/semanas/${semana}.json`);
