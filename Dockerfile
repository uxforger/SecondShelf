# syntax=docker/dockerfile:1
#
# Three stages:
#   build  - installs deps, builds the frontend (dist/) and bundles the server (dist-server/)
#   hello  - tiny smoke-test image: /healthz and one page (first deploy only)
#   app    - default: the real app, no node_modules, runs as the non-root "node" user
#
# Built by GitHub Actions for linux/amd64 (see .github/workflows/build.yml).

FROM node:24-bookworm-slim AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:24-alpine AS hello
WORKDIR /app
COPY deploy/hello.mjs ./hello.mjs
ENV PORT=8080
USER node
EXPOSE 8080
CMD ["node", "hello.mjs"]

FROM node:24-alpine AS app
ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    NODE_NO_WARNINGS=1
WORKDIR /app
COPY --from=build --chown=node:node /src/dist ./dist
COPY --from=build --chown=node:node /src/dist-server ./dist-server
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8080
CMD ["node", "dist-server/main.mjs"]
