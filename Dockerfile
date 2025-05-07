# Dockerfile for lowlink: Next.js (TypeScript) multi-environment
# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies only (for better cache)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# --- Builder image ---
FROM base AS builder
ENV NODE_ENV=development
COPY . .
RUN npm run build

# --- Production image ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]

# --- Documentation ---
# Use build args or environment variables to control environment (see docker-compose files)
# Example: docker build --build-arg NODE_ENV=production .
# Use docker-compose for multi-environment orchestration. 