# Docker Documentation - Tài Liệu Docker

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Base Images | node:20-alpine, nginx:alpine |
| Registry | Amazon ECR (ap-southeast-1) |

---

## 1. Docker Strategy

### 1.1. Image Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCKER IMAGE STRATEGY                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  BASE IMAGES                                                         │
│  ───────────                                                         │
│  ┌───────────────────┐  ┌───────────────────┐                      │
│  │  node:20-alpine   │  │  nginx:1.25-alpine│                      │
│  │  (Backend services)│  │  (Frontend serve) │                      │
│  └─────────┬─────────┘  └─────────┬─────────┘                      │
│            │                       │                                  │
│  ┌─────────┴──────────────────────┴─────────┐                      │
│  │           MULTI-STAGE BUILDS              │                      │
│  │                                           │                      │
│  │  Stage 1: Install dependencies (deps)    │                      │
│  │  Stage 2: Build application (builder)    │                      │
│  │  Stage 3: Production image (runner)      │                      │
│  └─────────┬──────────────────────┬─────────┘                      │
│            │                       │                                  │
│  ┌─────────┴─────────┐  ┌────────┴──────────┐                      │
│  │ Backend Service    │  │ Frontend (NGINX)  │                      │
│  │ ~150MB final image │  │ ~30MB final image │                      │
│  └───────────────────┘  └───────────────────┘                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2. Image Naming Convention

```
Registry Format:
<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/<service>:<tag>

Tag Format:
├── <git-sha>           (CI builds: abc123def)
├── latest              (latest build on develop)
├── v1.2.3             (release tags)
├── develop-<sha>       (develop branch builds)
└── pr-<number>-<sha>  (PR preview builds)

Examples:
123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/auth-service:v1.5.2
123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/auth-service:abc123d
123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/frontend:latest
```

---

## 2. Backend Dockerfile

### 2.1. Multi-Stage Dockerfile (Backend Service)

```dockerfile
# ============================================
# Dockerfile - Backend Microservice
# Insurance System Platform
# ============================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    cp -R node_modules /prod_modules

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner

# Security: Run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies
COPY --from=deps /prod_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy necessary config files
COPY package.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

### 2.2. Backend .dockerignore

```
# .dockerignore
node_modules
npm-debug.log*
dist
.git
.gitignore
.env
.env.*
*.md
!README.md
coverage
.nyc_output
tests
__tests__
*.test.ts
*.spec.ts
.vscode
.idea
docker-compose*.yml
Dockerfile*
.dockerignore
```

---

## 3. Frontend Dockerfile

### 3.1. Multi-Stage Dockerfile (Frontend)

```dockerfile
# ============================================
# Dockerfile - Frontend Application
# Insurance System Platform
# ============================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment-specific builds
ARG VITE_API_URL
ARG VITE_APP_VERSION
ARG VITE_ENVIRONMENT

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}

# Build the application
RUN npm run build

# ---- Stage 3: NGINX Production ----
FROM nginx:1.25-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: Run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### 3.2. NGINX Configuration

```nginx
# nginx/default.conf
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.insurance-system.vn;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA routing - fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;

        # No cache for HTML (always get latest)
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 '{"status":"ok"}';
        add_header Content-Type application/json;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## 4. Docker Compose (Local Development)

### 4.1. docker-compose.yml

```yaml
# docker-compose.yml - Local Development
version: '3.8'

services:
  # ─── Backend Services ───
  auth-service:
    build:
      context: ./be
      dockerfile: Dockerfile
      target: deps  # Use deps stage for dev (with node_modules)
    command: npm run dev
    volumes:
      - ./be/src:/app/src  # Hot reload
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/insurance_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-key
      - SERVICE_NAME=auth-service
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - insurance-network

  # ─── Frontend ───
  frontend:
    build:
      context: ./fe
      dockerfile: Dockerfile
      target: deps
    command: npm run dev -- --host 0.0.0.0
    volumes:
      - ./fe/src:/app/src
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001
    networks:
      - insurance-network

  # ─── Infrastructure Services ───
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: insurance_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - insurance-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - insurance-network

  # ─── Monitoring (Optional) ───
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - insurance-network
    profiles:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3100:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - insurance-network
    profiles:
      - monitoring

volumes:
  postgres_data:
  redis_data:
  grafana_data:

networks:
  insurance-network:
    driver: bridge
```

### 4.2. Docker Compose Commands

```bash
# Start all services
docker compose up -d

# Start with monitoring
docker compose --profile monitoring up -d

# View logs
docker compose logs -f auth-service

# Rebuild specific service
docker compose build --no-cache auth-service

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# Run database migrations
docker compose exec auth-service npm run migration:run

# Access postgres CLI
docker compose exec postgres psql -U postgres -d insurance_dev

# Access redis CLI
docker compose exec redis redis-cli
```

---

## 5. Container Security

### 5.1. Security Best Practices

| Practice | Implementation | Status |
|----------|---------------|--------|
| Non-root user | `USER appuser` (UID 1001) | ✅ |
| Minimal base image | Alpine-based images | ✅ |
| No secrets in image | Environment variables / Secrets Manager | ✅ |
| Read-only filesystem | `readOnlyRootFilesystem: true` (K8s) | ✅ |
| Drop capabilities | `drop: [ALL]` in securityContext | ✅ |
| Vulnerability scanning | Trivy in CI pipeline | ✅ |
| Image signing | Docker Content Trust (future) | 🔲 |
| Pin versions | Specific versions in FROM | ✅ |

### 5.2. Kubernetes Security Context

```yaml
# Pod security context
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    fsGroup: 1001
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

### 5.3. Image Scanning (Trivy)

```bash
# Scan image for vulnerabilities
trivy image insurance-system/auth-service:latest

# Scan with severity filter
trivy image --severity CRITICAL,HIGH insurance-system/auth-service:latest

# Scan in CI (fail on critical)
trivy image --exit-code 1 --severity CRITICAL insurance-system/auth-service:latest

# Scan Dockerfile for misconfigurations
trivy config ./Dockerfile
```

---

## 6. Container Registry (ECR)

### 6.1. ECR Repository Structure

```
ECR Repositories:
├── insurance-system/auth-service
├── insurance-system/product-service
├── insurance-system/policy-service
├── insurance-system/quote-service
├── insurance-system/claims-service
├── insurance-system/payment-service
├── insurance-system/notification-service
├── insurance-system/document-service
├── insurance-system/integration-service
└── insurance-system/frontend
```

### 6.2. ECR Lifecycle Policy

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 5 release images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v"],
        "countType": "imageCountMoreThan",
        "countNumber": 5
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "description": "Keep last 20 develop images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["develop-"],
        "countType": "imageCountMoreThan",
        "countNumber": 20
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 3,
      "description": "Remove untagged images after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": { "type": "expire" }
    }
  ]
}
```

### 6.3. ECR Operations

```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.ap-southeast-1.amazonaws.com

# Build and push
docker build -t insurance-system/auth-service:latest ./be
docker tag insurance-system/auth-service:latest \
  123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/auth-service:latest
docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-system/auth-service:latest

# List images
aws ecr list-images --repository-name insurance-system/auth-service

# Describe image (check vulnerabilities)
aws ecr describe-image-scan-findings \
  --repository-name insurance-system/auth-service \
  --image-id imageTag=latest
```

---

## 7. Performance Optimization

### 7.1. Build Optimization

| Technique | Description | Impact |
|-----------|-------------|--------|
| Multi-stage builds | Separate build from runtime | ~70% smaller images |
| Layer caching | Order Dockerfile instructions by change frequency | Faster rebuilds |
| .dockerignore | Exclude unnecessary files from build context | Faster build context |
| Alpine base | Use Alpine instead of Debian/Ubuntu | ~80% smaller base |
| npm ci | Deterministic installs, respects lockfile | Reliable builds |
| BuildKit cache | `--mount=type=cache` for node_modules | 50% faster rebuilds |

### 7.2. BuildKit Advanced Caching

```dockerfile
# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production
```

### 7.3. Image Size Comparison

| Image | Without Optimization | With Multi-stage + Alpine | Reduction |
|-------|---------------------|--------------------------|-----------|
| Backend service | ~1.2 GB | ~150 MB | 87% |
| Frontend (NGINX) | ~500 MB | ~30 MB | 94% |
