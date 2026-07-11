#!/usr/bin/env node
// build-dashboard.mjs — varre frentes/**/status.json, valida contra o schema,
// e emite dashboard/data.json. Node ESM, sem dependências externas
// (validador de schema mínimo escrito à mão — cobre o subset usado no schema).
//
// Uso:  node scripts/build-dashboard.mjs
// Falha (exit 1) se qualquer status.json for inválido contra o schema.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FRENTES_DIR = join(ROOT, "frentes");
const SCHEMA_PATH = join(FRENTES_DIR, "_schema", "status.schema.json");
const OUT_PATH = join(ROOT, "dashboard", "data.json");

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

if (allErrors.length) {
  console.error("\n✖ Build falhou — status.json inválido(s):\n");
  for (const e of allErrors) console.error("  • " + e);
  console.error(`\n${allErrors.length} erro(s). Nenhum data.json gerado.\n`);
  process.exit(1);
}

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
};

writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ ${frentes.length} frente(s) válida(s). dashboard/data.json gerado.`);
console.log(`  Pipeline mensal (soma Cenário Base): R$ ${pipelineMensal.toLocaleString("pt-BR")}`);
