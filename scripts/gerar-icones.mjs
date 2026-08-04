#!/usr/bin/env node
// gerar-icones.mjs — rasteriza doutrina/marca-icone.svg em PNG.
//
// POR QUE PRECISA EXISTIR: o iOS ignora SVG em `apple-touch-icon`. Sem um PNG, "Adicionar
// à Tela de Início" no iPhone salva um screenshot borrado da página em vez da marca — e a
// central de acessos da diretoria nasce com cara de atalho improvisado.
//
// É utilitário de DESENVOLVIMENTO, não roda no build nem no CI: depende do Chromium, que
// nem toda máquina tem. Os PNGs gerados são versionados; rode isto só quando o SVG mudar.
//
// Uso:  node scripts/gerar-icones.mjs
// Requer Playwright + Chromium (globais ou no projeto).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SVG = join(ROOT, "doutrina", "marca-icone.svg");

// tamanhos que importam: 180 = apple-touch-icon; 192/512 = manifest (Android/desktop)
const TAMANHOS = [180, 192, 512];

let chromium;
try {
  const mod = await import("playwright");
  chromium = (mod.default ?? mod).chromium;
} catch {
  console.error("✖ Playwright não encontrado. Este script é utilitário de dev — os PNGs já");
  console.error("  estão versionados em doutrina/. Só é preciso rodá-lo se o SVG mudar.");
  process.exit(1);
}

const svg = readFileSync(SVG, "utf8");
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

for (const t of TAMANHOS) {
  const page = await (await browser.newContext({ viewport: { width: t, height: t } })).newPage();
  // A fonte precisa carregar ANTES do screenshot, senão o monograma sai no fallback.
  await page.setContent(`<!doctype html><html><head>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=block" rel="stylesheet">
    <style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${t}px;height:${t}px}</style>
    </head><body>${svg}</body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const buf = await page.screenshot({ omitBackground: true });
  const destino = join(ROOT, "doutrina", `marca-icone-${t}.png`);
  writeFileSync(destino, buf);
  console.log(`✓ ${relative(ROOT, destino)} (${t}×${t}, ${(buf.length / 1024).toFixed(1)} kB)`);
  await page.close();
}
await browser.close();
console.log("• rode `node scripts/build-dashboard.mjs` para distribuir ao bundle.");
