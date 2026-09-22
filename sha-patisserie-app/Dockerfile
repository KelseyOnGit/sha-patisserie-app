# syntax=docker/dockerfile:1

#### 1. Dependencies ##########################################################
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# openssl is required by the Prisma engine at generate/runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

#### 2. Build ##################################################################
FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time-only placeholder so `prisma generate`/`next build` don't fail on a
# missing DATABASE_URL. The real value is supplied at runtime, never baked into the image.
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

#### 3. Runtime #################################################################
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone output already contains a pruned node_modules and server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
