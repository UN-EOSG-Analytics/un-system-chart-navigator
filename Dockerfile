# Dockerfile for Next.js

# 1. Base image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Create a public directory if it doesn't exist
RUN mkdir -p public
RUN npm run build

# 4. Production image
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy the data directory explicitly
COPY --from=builder /app/data ./data

CMD ["node", "server.js"] 