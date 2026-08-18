# syntax=docker/dockerfile:1.4

FROM node:26.2.0-alpine3.23 AS base

# Install pnpm globally and add build dependencies
RUN npm install -g pnpm@11.1.3 && \
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

# Ensure LowDB can create the db.json file
# The 'db' directory will be created at the project root inside the container
RUN mkdir -p db

# Configure build environment for production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Application Execution Stage
FROM base AS runner
WORKDIR /app

# Define 'nextjs' user for security
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Copy essential files from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Copy the db directory
COPY --from=builder /app/db ./db

# This ensures the nextjs user has write permissions to /app and its subdirectories like /app/db
RUN chown nextjs:nextjs /app
RUN chown -R nextjs:nextjs /app/db

# Define the port Next.js will listen on
ENV PORT 3000
EXPOSE 3000

# Set the user to run the application
USER nextjs

# Command to start the Next.js application in production
CMD ["npm", "start"]