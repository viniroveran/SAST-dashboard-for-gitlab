# syntax=docker/dockerfile:1.4

FROM node:26.2.0-alpine3.23 AS base

# Install pnpm globally and add build dependencies (apk upgrade: pick up Alpine security fixes
# released after the base image was cut)
RUN apk upgrade --no-cache && \
    npm install -g pnpm@11.28.13 && \
    apk add --no-cache libc6-compat build-base python3

# 1. Dependency Installation Stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Application Build Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_BASE_URL=https://sast-dashboard.dumbledore.dev
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Configure build environment for production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Application Execution Stage
# Plain Node image, not `base`: no compilers, and npm/pnpm removed since nothing runs them at
# runtime (their bundled deps are a steady source of scanner findings).
FROM node:26.2.0-alpine3.23 AS runner
WORKDIR /app

RUN apk upgrade --no-cache && \
    apk add --no-cache libc6-compat && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

# Define 'nextjs' user for security
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Standalone output (next.config.ts): server.js plus only the traced runtime files, instead of
# the whole node_modules (dev deps included, a 605 MB layer). Static assets are not part of it.
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Reports live in /app/data (app/lib/store.ts), the path the production compose mounts its
# volume at — never in the image layer, which a redeploy discards.
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data && chown -R nextjs:nextjs /app/data

# Define the port Next.js will listen on
ENV PORT=3000
# server.js binds to $HOSTNAME, which Docker sets to the container id: listen on all interfaces.
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# Set the user to run the application
USER nextjs

# Command to start the Next.js application in production
CMD ["node", "server.js"]