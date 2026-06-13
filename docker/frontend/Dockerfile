# ─── Dev stage ────────────────────────────────────────────────
FROM oven/bun:1 AS dev
WORKDIR /app
# Pre-install deps; node_modules is preserved via named volume in compose
COPY frontend/package.json frontend/bun.lock ./
RUN bun install
EXPOSE 3000
ENV NODE_ENV=development
CMD ["bun", "run", "dev"]

# ─── Builder stage (production build) ─────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ .
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ─── Prod stage ───────────────────────────────────────────────
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 80
CMD ["node", "server.js"]
