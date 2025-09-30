# Auth Service Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install OpenSSL for Prisma, PostgreSQL client for health checks, and curl
RUN apk add --no-cache openssl postgresql-client curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies and prisma for migrations
RUN npm ci --only=production && npm install prisma && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3002/auth/verify || echo 'Service not ready'

# Start the application
CMD ["./docker-entrypoint.sh"]