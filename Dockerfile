# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app

# Install ALL dependencies
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# --- Builder image ---
FROM base AS builder
COPY . .
RUN npm run build

# --- Production image ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
 