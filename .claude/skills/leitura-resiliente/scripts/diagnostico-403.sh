#!/usr/bin/env bash
# diagnostico-403.sh — decide se um 403/bloqueio vem do PROXY DE EGRESSO (política)
# ou do ANTI-BOT DO SITE. Uso: bash diagnostico-403.sh "https://host/caminho"
set -uo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then echo "uso: $0 <url>"; exit 2; fi
HOST=$(printf '%s' "$URL" | sed -E 's#^[a-z]+://##; s#/.*$##')

echo "== ALVO =="
echo "url:  $URL"
echo "host: $HOST"
echo

echo "== ESTADO DO PROXY DE EGRESSO =="
if [[ -n "${HTTPS_PROXY:-}" ]]; then
  echo "HTTPS_PROXY=${HTTPS_PROXY}"
  curl -sS "${HTTPS_PROXY}/__agentproxy/status" 2>/dev/null \
    | grep -oE '"(enabled|standalone|recentRelayFailures)"[^,]*' || echo "(status indisponível)"
else
  echo "(sem HTTPS_PROXY — egresso direto; pule para a leitura do veredito de SITE)"
fi
echo

echo "== SONDAGEM (curl -I) =="
OUT=$(curl -sS -I "$URL" --max-time 25 2>&1)
echo "$OUT" | head -8
echo

echo "== VEREDITO =="
if grep -qiE 'CONNECT tunnel failed|Received HTTP code 403 from proxy|407' <<<"$OUT"; then
  echo "CLASSE: PROXY / POLITICA DE EGRESSO"
  echo "-> O host '$HOST' NAO e permitido pela politica de rede desta sessao."
  echo "-> NAO contornar. Vias legitimas (SKILL FASE 2-P):"
  echo "   1) ajustar a politica de rede do ambiente (allowlist do host)"
  echo "   2) rodar a leitura onde o egresso e aberto (maquina local / runner)"
  echo "   3) trazer o conteudo (print / PDF / colar / upload)"
elif grep -qiE 'cloudflare|cf-mitigated|just a moment|attention required|akamai|datadome|perimeterx|<title>.*(bloquead|blocked|denied)' <<<"$OUT"; then
  echo "CLASSE: ANTI-BOT DO SITE"
  echo "-> O host respondeu, mas com desafio/mitigacao anti-bot."
  echo "-> Escalar a leitura (SKILL FASE 2-S): navegador real -> desbloqueador"
  echo "   em nuvem -> endpoint JSON -> proxy residencial (+ TLS fingerprint)."
elif grep -qiE 'HTTP/[12].* 200' <<<"$OUT"; then
  echo "CLASSE: OK (200) — o host respondeu normalmente."
  echo "-> Se o WebFetch ainda falha, o conteudo pode ser client-side (JS):"
  echo "   use o navegador real (fetch-navegador.cjs) para renderizar."
else
  echo "CLASSE: INDETERMINADA — inspecione o cabecalho acima."
  echo "-> 403/503 COM corpo do site => trate como ANTI-BOT (FASE 2-S)."
  echo "-> 'CONNECT tunnel failed' => trate como POLITICA (FASE 2-P)."
fi
