# Samais-OS · Dashboard (cockpit read-only) — build + serve estático, privado.
# Serve para rodar atrás da VPN no servidor da empresa (custo zero de SaaS).
#
#   docker build -t samais-cockpit .
#   docker run -d -p 8080:80 --name samais-cockpit samais-cockpit
#   # atrás da VPN: http://<host-interno>:8080
#
# Estágio 1 — build: valida frentes/**/status.json contra o schema e gera data.json.
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN node scripts/build-dashboard.mjs

# Estágio 2 — serve: só os estáticos do dashboard (com o data.json recém-gerado).
FROM nginx:alpine
# Sem cache do data.json para o cockpit nunca mostrar dado velho.
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location = /data.json { add_header Cache-Control "no-store"; }\n}\n' > /etc/nginx/conf.d/default.conf
COPY --from=build /app/dashboard/ /usr/share/nginx/html/
EXPOSE 80
