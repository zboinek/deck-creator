FROM node:24-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    # npm bundle'owany w obrazie node ma wlasne, starzejace sie zaleznosci -
    # Trivy flaguje je przy kazdym bumpie bazowego obrazu. Runtime (standalone
    # `node server.js`) nie uzywa npm/corepack, wiec wycinamy je z obrazu.
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack && \
    rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/decks && chown nextjs:nodejs /app/decks

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
