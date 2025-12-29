# Multi-stage production Dockerfile for NexusProseCreator service
# Optimized for layer caching and minimal image size

# Base stage with common dependencies
FROM --platform=linux/amd64 node:20-alpine AS base
RUN apk update && \
    apk add --no-cache \
    tini \
    curl \
    && rm -rf /var/cache/apk/*
WORKDIR /app

# Dependencies stage - cached unless package.json changes
FROM --platform=linux/amd64 base AS deps
RUN apk update && apk add --no-cache python3 make g++ git

# Copy NexusProseCreator's package.json
COPY services/nexus-prosecreator/package*.json ./

# Install all dependencies
RUN npm install && \
    npm cache clean --force && \
    cp -R node_modules prod_node_modules

# Build stage - prepare source
FROM --platform=linux/amd64 deps AS builder
COPY services/nexus-prosecreator/tsconfig*.json ./
COPY services/nexus-prosecreator/src/ ./src/
COPY services/nexus-prosecreator/migrations/ ./migrations/

# No compilation needed - will use ts-node in production

# Development stage with hot reload
FROM --platform=linux/amd64 base AS development
RUN apk update && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    postgresql-client \
    bash
RUN npm install -g ts-node ts-node-dev nodemon
COPY services/nexus-prosecreator/package*.json services/nexus-prosecreator/tsconfig*.json ./
RUN npm install
COPY services/nexus-prosecreator/src/ ./src/
COPY services/nexus-prosecreator/migrations/ ./migrations/
EXPOSE 9099 9100 9229
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Production stage - minimal final image
FROM --platform=linux/amd64 base AS production

# Install runtime dependencies
RUN apk update && \
    apk add --no-cache \
    postgresql-client \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/prod_node_modules ./node_modules

# Copy source files from builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nodejs:nodejs /app/tsconfig*.json ./

# Copy package.json
COPY --chown=nodejs:nodejs services/nexus-prosecreator/package*.json ./

# Create directories and set permissions
USER root
RUN mkdir -p /app/logs /var/log/nexus-prosecreator && \
    chown -R nodejs:nodejs /app /var/log/nexus-prosecreator

# Switch to non-root user
USER nodejs

# Expose application ports
EXPOSE 9099 9100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9099/prosecreator/health || exit 1

# Environment variables
ENV NODE_ENV=production \
    PORT=9099 \
    WS_PORT=9100 \
    LOG_LEVEL=info

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--require", "ts-node/register", "src/server.ts"]
