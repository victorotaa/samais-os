#!/usr/bin/env node
/*
 * fetch-navegador.cjs — leitura via navegador real (Playwright/Chromium).
 * Degrau 1 da FASE 2-S: executa JS e passa desafios PASSIVOS do Cloudflare.
 * NAO ajuda contra bloqueio de POLITICA de egresso (rode o diagnostico antes).
 *
 * Uso:
 *   node fetch-navegador.cjs "https://host/caminho" [--json] [--screenshot out.png] [--proxy http://user:pass@host:port]
 *
 * Saida: texto visivel da pagina no stdout. Com --json, imprime tambem as
 * respostas XHR/JSON capturadas (Degrau 3: endpoint interno). Codigo de saida
 * 3 = caiu em pagina de desafio anti-bot (suba para Degrau 2).
 *
 * Requisitos: Playwright instalado; Chromium em PLAYWRIGHT_BROWSERS_PATH.
 * Onde o egresso e aberto (maquina local / runner), este script sozinho ja
 * resolve a maioria dos casos. Onde o egresso e allowlist (sessao web), use
 * as vias da FASE 2-P.
 */
const { execSync } = require('child_process');

function resolvePlaywright() {
  try { return require('playwright'); } catch (_) {}
  try {
    const g = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(`${g}/playwright`);
  } catch (_) {
    console.error('ERRO: pacote "playwright" nao encontrado. Instale com: npm i -g playwright');
    process.exit(2);
  }
}

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '';
  const fs = require('fs'), path = require('path');
  try {
    const dir = fs.readdirSync(base).find(d => /^chromium-\d/.test(d));
    if (dir) {
      const p = path.join(base, dir, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  } catch (_) {}
  return undefined; // deixa o Playwright achar sozinho
}

const args = process.argv.slice(2);
const url = args.find(a => /^https?:\/\//.test(a));
const wantJson = args.includes('--json');
const shotIdx = args.indexOf('--screenshot');
const shot = shotIdx >= 0 ? args[shotIdx + 1] : null;
const proxyIdx = args.indexOf('--proxy');
const proxy = proxyIdx >= 0 ? args[proxyIdx + 1] : (process.env.SCRAPE_PROXY || null);

if (!url) { console.error('uso: node fetch-navegador.cjs <url> [--json] [--screenshot out.png] [--proxy ...]'); process.exit(2); }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const CHALLENGE = /just a moment|checking your browser|attention required|cf-chl|enable javascript and cookies|verify you are human/i;

(async () => {
  const { chromium } = resolvePlaywright();
  const launch = {
    headless: true,
    executablePath: findChromium(),
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  };
  if (proxy) launch.proxy = { server: proxy };

  const browser = await chromium.launch(launch);
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: {
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  });
  // remove o marcador webdriver
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

  const captured = [];
  if (wantJson) {
    ctx.on('response', async (res) => {
      const ct = (res.headers()['content-type'] || '');
      if (ct.includes('application/json')) {
        try { captured.push({ url: res.url(), status: res.status(), body: await res.text() }); } catch (_) {}
      }
    });
  }

  const page = await ctx.newPage();
  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    status = resp ? resp.status() : 0;
  } catch (e) {
    console.error('NAV_ERRO:', e.message);
  }

  // segunda espera: desafios passivos costumam liberar em ~5s
  await page.waitForTimeout(5000);

  const title = await page.title().catch(() => '');
  const text = await page.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');

  if (shot) { try { await page.screenshot({ path: shot, fullPage: true }); console.error('screenshot:', shot); } catch (_) {} }

  const isChallenge = CHALLENGE.test(title) || CHALLENGE.test(text.slice(0, 2000));

  console.error(`== status=${status} title="${title}" chars=${text.length} proxy=${proxy ? 'sim' : 'nao'} ==`);
  if (wantJson && captured.length) {
    console.error(`== ${captured.length} respostas JSON capturadas (Degrau 3) ==`);
    for (const c of captured) console.log(JSON.stringify({ endpoint: c.url, status: c.status, sample: c.body.slice(0, 400) }));
  }
  console.log(text);

  await browser.close();

  if (isChallenge) {
    console.error('DESAFIO ANTI-BOT detectado — suba para o Degrau 2 (desbloqueador em nuvem) ou 4 (proxy residencial + TLS fingerprint).');
    process.exit(3);
  }
})().catch(e => { console.error('FALHA:', e.message); process.exit(1); });
