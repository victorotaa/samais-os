#!/usr/bin/env node
// build-dashboard.mjs — monta o pacote publicável do Samais-OS:
//   1. varre frentes/**/status.json, valida contra o schema e emite dashboard/data.json;
//   2. copia as ferramentas (ferramentas/*) para dentro de dashboard/, para que a home,
//      o cockpit e os apps sejam servidos pela MESMA URL.
//
// Node ESM, sem dependências externas (validador de schema mínimo escrito à mão).
//
// Uso:  node scripts/build-dashboard.mjs
// Falha (exit 1) se qualquer status.json for inválido contra o schema.
//
// IMPORTANTE: só o que está em dashboard/ vai ao ar. A camada confidencial
// (frentes/**/interpretacao.md, doutrina/) NUNCA é copiada para o bundle.

import { readFileSync, writeFileSync, readdirSync, statSync, cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FRENTES_DIR = join(ROOT, "frentes");
const SCHEMA_PATH = join(FRENTES_DIR, "_schema", "status.schema.json");
const OBRIG_DIR = join(ROOT, "obrigacoes");
const OBRIG_SCHEMA_PATH = join(OBRIG_DIR, "_schema", "obrigacao.schema.json");
const DASH_DIR = join(ROOT, "dashboard");
const OUT_PATH = join(DASH_DIR, "data.json");

// Dias antes do vencimento em que uma obrigação entra em ATENÇÃO, se não declarado.
const ALERTA_PADRAO_DIAS = 30;

// Ferramentas embarcadas no bundle: origem → destino dentro de dashboard/
const FERRAMENTAS = [{ de: join(ROOT, "ferramentas", "despesas"), para: join(DASH_DIR, "despesas") }];

// ---------- validador de JSON Schema (subset draft-07) ----------
function validate(data, schema, path = "") {
  const errors = [];
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];

  const typeOk = (v, t) => {
    switch (t) {
      case "string": return typeof v === "string";
      case "number": return typeof v === "number";
      case "integer": return typeof v === "number" && Number.isInteger(v);
      case "boolean": return typeof v === "boolean";
      case "object": return v !== null && typeof v === "object" && !Array.isArray(v);
      case "array": return Array.isArray(v);
      case "null": return v === null;
      default: return true;
    }
  };

  if (types.length && !types.some((t) => typeOk(data, t))) {
    errors.push(`${path || "(raiz)"}: esperado tipo ${types.join("|")}, recebido ${data === null ? "null" : Array.isArray(data) ? "array" : typeof data}`);
    return errors; // sem tipo válido, não adianta checar o resto
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path}: valor ${JSON.stringify(data)} fora do enum [${schema.enum.map((e) => JSON.stringify(e)).join(", ")}]`);
  }
  if (typeof data === "string") {
    if (schema.minLength != null && data.length < schema.minLength)
      errors.push(`${path}: string curta demais (min ${schema.minLength})`);
    if (schema.pattern && !new RegExp(schema.pattern).test(data))
      errors.push(`${path}: não casa com o padrão ${schema.pattern}`);
  }
  if (typeof data === "number") {
    if (schema.minimum != null && data < schema.minimum)
      errors.push(`${path}: ${data} < mínimo ${schema.minimum}`);
    if (schema.maximum != null && data > schema.maximum)
      errors.push(`${path}: ${data} > máximo ${schema.maximum}`);
  }
  if (typeOk(data, "object") && schema.properties) {
    for (const req of schema.required || []) {
      if (!(req in data)) errors.push(`${path}: campo obrigatório ausente: "${req}"`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in schema.properties)) errors.push(`${path}: propriedade não permitida: "${key}"`);
      }
    }
    for (const [key, sub] of Object.entries(schema.properties)) {
      if (key in data) errors.push(...validate(data[key], sub, path ? `${path}.${key}` : key));
    }
  }
  return errors;
}

// ---------- varredura das frentes ----------
function findStatusFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "_schema" || entry === "_template-frente") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...findStatusFiles(full));
    } else if (entry === "status.json") {
      found.push(full);
    }
  }
  return found;
}

const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
const files = findStatusFiles(FRENTES_DIR).sort();

const frentes = [];
const allErrors = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  let json;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    allErrors.push(`${rel}: JSON inválido — ${e.message}`);
    continue;
  }
  const errs = validate(json, schema);
  if (errs.length) {
    allErrors.push(...errs.map((e) => `${rel} → ${e}`));
    continue;
  }
  frentes.push({ ...json, _slug: rel.split("/")[1] });
}

// (a checagem de erros acontece depois das obrigações, para reportar tudo de uma vez)

// ---------- obrigações (calendário de prazos) ----------
const hojeISO = new Date().toISOString().slice(0, 10);
const diasEntre = (aISO, bISO) =>
  Math.round((Date.parse(aISO + "T00:00:00Z") - Date.parse(bISO + "T00:00:00Z")) / 86400000);

const obrigacoes = [];
if (existsSync(OBRIG_SCHEMA_PATH)) {
  const obrigSchema = JSON.parse(readFileSync(OBRIG_SCHEMA_PATH, "utf8"));
  const arquivos = readdirSync(OBRIG_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort();

  for (const arq of arquivos) {
    const full = join(OBRIG_DIR, arq);
    const rel = relative(ROOT, full);
    let json;
    try {
      json = JSON.parse(readFileSync(full, "utf8"));
    } catch (e) {
      allErrors.push(`${rel}: JSON inválido — ${e.message}`);
      continue;
    }
    const errs = validate(json, obrigSchema);
    if (errs.length) {
      allErrors.push(...errs.map((e) => `${rel} → ${e}`));
      continue;
    }
    // criticidade é DERIVADA da data — nunca digitada
    const dias = diasEntre(json.vence_em, hojeISO);
    const alerta = json.alerta_dias ?? ALERTA_PADRAO_DIAS;
    let criticidade;
    if (json.status === "arquivada") criticidade = "arquivada";
    else if (dias < 0) criticidade = "vencida";
    else if (dias <= 7) criticidade = "critica";
    else if (dias <= alerta) criticidade = "atencao";
    else criticidade = "ok";
    obrigacoes.push({ ...json, _slug: arq.replace(/\.json$/, ""), dias_restantes: dias, criticidade });
  }
}

if (allErrors.length) {
  console.error("\n✖ Build falhou — arquivo(s) inválido(s):\n");
  for (const e of allErrors) console.error("  • " + e);
  console.error(`\n${allErrors.length} erro(s). Nenhum data.json gerado.\n`);
  process.exit(1);
}

// mais urgente primeiro
obrigacoes.sort((a, b) => a.dias_restantes - b.dias_restantes);
const ativas = obrigacoes.filter((o) => o.criticidade !== "arquivada");
const resumoObrig = {
  total: ativas.length,
  vencidas: ativas.filter((o) => o.criticidade === "vencida").length,
  criticas: ativas.filter((o) => o.criticidade === "critica").length,
  atencao: ativas.filter((o) => o.criticidade === "atencao").length,
};

// ordenar por score desc, depois valor desc
frentes.sort((a, b) => (b.score - a.score) || ((b.valor_contratual_mensal || 0) - (a.valor_contratual_mensal || 0)));

const pipelineMensal = frentes.reduce((s, f) => s + (f.valor_contratual_mensal || 0), 0);
const ativos = frentes.filter((f) => f.estagio === "contrato-ativo");

const data = {
  gerado_em: new Date().toISOString().slice(0, 10),
  total_frentes: frentes.length,
  pipeline_mensal: pipelineMensal,
  pipeline_anual: pipelineMensal * 12,
  contratos_ativos: ativos.length,
  frentes,
  obrigacoes,
  resumo_obrigacoes: resumoObrig,
};

writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ ${frentes.length} frente(s) válida(s). dashboard/data.json gerado.`);
console.log(`  Pipeline mensal (soma Cenário Base): R$ ${pipelineMensal.toLocaleString("pt-BR")}`);
if (resumoObrig.total) {
  const alerta = resumoObrig.vencidas + resumoObrig.criticas;
  console.log(`✓ ${resumoObrig.total} obrigação(ões) no calendário` +
    (alerta ? ` — ⚠ ${resumoObrig.vencidas} vencida(s), ${resumoObrig.criticas} crítica(s), ${resumoObrig.atencao} em atenção` : " — nenhuma crítica"));
} else {
  console.log("• calendário de obrigações vazio (ver obrigacoes/README.md para o catálogo)");
}

// ---------- monta as ferramentas dentro do bundle ----------
for (const { de, para } of FERRAMENTAS) {
  if (!existsSync(de)) {
    console.error(`✖ Ferramenta ausente: ${relative(ROOT, de)}`);
    process.exit(1);
  }
  rmSync(para, { recursive: true, force: true });
  cpSync(de, para, { recursive: true });
  console.log(`✓ ${relative(ROOT, de)} → ${relative(ROOT, para)}`);
}
console.log("✓ pacote publicável montado em dashboard/ (home + cockpit + ferramentas).");
