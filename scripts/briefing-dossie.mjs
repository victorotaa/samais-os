#!/usr/bin/env node
// briefing-dossie.mjs — monta o briefing COMPLETO de um município, para leitura e envio.
//
// POR QUE NÃO É UMA PÁGINA DO PAINEL: o painel está em URL pública e a página de briefings
// mostra só o que é `publico`. Este documento traz TUDO — inclusive salário, passivo
// trabalhista e o nome do respondente. Por isso a saída é um arquivo local, na pasta
// briefings/_dossies/, que está no .gitignore: ele existe na máquina de quem rodou e não
// entra no repositório nem no bundle.
//
// Uso:  node scripts/briefing-dossie.mjs avare-sp
//       node scripts/briefing-dossie.mjs avare-sp --stdout   (imprime em vez de gravar)

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BRIEF_DIR = join(ROOT, "briefings");
const SAIDA_DIR = join(BRIEF_DIR, "_dossies");

const slug = process.argv[2];
const paraStdout = process.argv.includes("--stdout");

if (!slug) {
  const disponiveis = readdirSync(BRIEF_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  console.error("Uso: node scripts/briefing-dossie.mjs <slug> [--stdout]");
  console.error("Disponíveis: " + (disponiveis.map((f) => f.replace(/\.json$/, "")).join(", ") || "nenhum"));
  process.exit(1);
}

const arq = join(BRIEF_DIR, `${slug}.json`);
if (!existsSync(arq)) { console.error(`✖ ${relative(ROOT, arq)} não existe.`); process.exit(1); }

const b = JSON.parse(readFileSync(arq, "utf8"));
const quest = JSON.parse(readFileSync(join(BRIEF_DIR, "_schema", "questionario-padrao.json"), "utf8"));

const ESTADO = {
  respondido: "✅ respondido",
  "nao-existe": "◆ NÃO EXISTE — isto é achado, não lacuna",
  "a-levantar": "⚠️ a levantar",
  "nao-se-aplica": "— não se aplica",
};
const PROC = { verificado: "✅ verificado", premissa: "⚠️ premissa", "a-verificar": "⚠️ a verificar" };
const dataBR = (iso) => (iso || "").split("-").reverse().join("/");

const L = [];
L.push(`# Briefing — ${b.alvo}/${b.uf}`);
L.push("");
L.push(`> **USO INTERNO · CONFIDENCIAL.** Este documento traz as respostas na íntegra, inclusive`);
L.push(`> as classificadas como internas e restritas. Não publicar, não anexar a proposta, não`);
L.push(`> mandar para fora da Samais. Gerado fora do repositório de propósito.`);
L.push("");
L.push(`- **Aplicado em:** ${dataBR(b.aplicado_em)}`);
if (b.respondente) {
  L.push(`- **Respondente:** ${b.respondente.nome ?? "—"}${b.respondente.cargo ? ` · ${b.respondente.cargo}` : ""}`);
  if (b.respondente.orgao) L.push(`- **Órgão:** ${b.respondente.orgao}`);
}
if (b.frente) L.push(`- **Frente vinculada:** \`frentes/${b.frente}/\``);
L.push(`- **Questionário:** versão ${quest.versao} (${quest.blocos.reduce((n, x) => n + x.perguntas.length, 0)} perguntas)`);
L.push("");

// contagens — as mesmas do painel, para o número bater nos dois lugares
const todas = quest.blocos.flatMap((x) => x.perguntas);
const est = (id) => b.respostas[id]?.estado;
const resp = todas.filter((q) => est(q.id) === "respondido").length;
const achados = todas.filter((q) => est(q.id) === "nao-existe").length;
const aLevantar = todas.filter((q) => est(q.id) === "a-levantar").length;
const essPend = todas.filter((q) => q.essencial && est(q.id) !== "respondido").length;

L.push(`| | |`);
L.push(`|---|---|`);
L.push(`| Respondidas | **${resp}/${todas.length}** (${Math.round((resp / todas.length) * 100)}%) |`);
L.push(`| Essenciais em aberto | **${essPend}** |`);
L.push(`| A levantar | ${aLevantar} |`);
if (achados) L.push(`| Achados ("não existe") | ${achados} — cada um é argumento de venda |`);
L.push("");

for (const bloco of quest.blocos) {
  L.push(`## ${bloco.nome}`);
  L.push("");
  for (const q of bloco.perguntas) {
    const r = b.respostas[q.id];
    const marcas = [
      q.essencial ? "essencial" : null,
      q.nova ? "pergunta nova" : null,
      q.sensibilidade !== "publico" ? q.sensibilidade : null,
    ].filter(Boolean);
    L.push(`### ${q.pergunta}`);
    L.push(`\`${q.id}\`${marcas.length ? " · " + marcas.join(" · ") : ""}` +
           (q.unidade ? ` · em ${q.unidade}` : "") + (q.periodo ? ` · ${q.periodo}` : ""));
    L.push("");
    if (!r) { L.push("_sem registro._"); L.push(""); continue; }
    L.push(`**${ESTADO[r.estado] ?? r.estado}**` + (r.procedencia ? ` · ${PROC[r.procedencia] ?? r.procedencia}` : ""));
    L.push("");
    if (r.estado === "respondido" && r.resposta) { L.push(r.resposta); L.push(""); }
    if (r.nota) { L.push(`> ${r.nota}`); L.push(""); }
    if (q.porque) { L.push(`*Alimenta:* ${q.porque}`); L.push(""); }
    if (q.documento) { L.push(`*Documento que comprova:* ${q.documento}`); L.push(""); }
  }
}

L.push("---");
L.push("");
L.push(`Gerado por \`scripts/briefing-dossie.mjs\` a partir de \`briefings/${slug}.json\`.`);
L.push(`Para atualizar, edite o JSON e rode de novo — o documento é derivado, não fonte.`);
L.push("");

const texto = L.join("\n");
if (paraStdout) { process.stdout.write(texto); process.exit(0); }

mkdirSync(SAIDA_DIR, { recursive: true });
const destino = join(SAIDA_DIR, `briefing-${slug}.md`);
writeFileSync(destino, texto);
console.log(`✓ ${relative(ROOT, destino)}`);
console.log(`  ${resp}/${todas.length} respondidas · ${essPend} essencial(is) em aberto`);
console.log(`  ⚠️ Documento COMPLETO (inclui interno e restrito). Fora do git — não commitar.`);
