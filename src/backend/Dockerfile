# OBELISK Backend - Production Dockerfile
FROM node:20-alpine

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Security: Run as non-root user
RUN addgroup -g 1001 -S obelisk && \
    adduser -S obelisk -u 1001 -G obelisk

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

# Remove build tools after install (smaller image)
RUN apk del python3 make g++

# Copy application code
COPY --chown=obelisk:obelisk . .

# Remove unnecessary files
RUN rm -rf tests/ *.test.js .env.example

# Switch to non-root user
USER obelisk

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Cloud Run uses PORT env var (default 8080)
EXPOSE 8080

# Environment
ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "server-ultra.js"]
