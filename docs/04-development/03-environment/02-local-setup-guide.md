# Local Setup Guide

## Tổng quan

Hướng dẫn từng bước để thiết lập môi trường phát triển local cho dự án Insurance System.

---

## Prerequisites

### Required Software

| Software | Version | Kiểm tra | Download |
|----------|---------|----------|----------|
| Node.js | >= 20.x | `node -v` | [nodejs.org](https://nodejs.org) |
| npm | >= 10.x | `npm -v` | Included with Node.js |
| Git | >= 2.x | `git --version` | [git-scm.com](https://git-scm.com) |
| PostgreSQL | >= 15.x | `psql --version` | [postgresql.org](https://postgresql.org) |
| Redis | >= 7.x | `redis-cli --version` | [redis.io](https://redis.io) |
| Docker (optional) | >= 24.x | `docker --version` | [docker.com](https://docker.com) |

### Recommended Tools

| Tool | Mục đích |
|------|---------|
| VS Code | IDE chính |
| Postman / Thunder Client | API testing |
| DBeaver / pgAdmin | Database management |
| Redis Insight | Redis GUI |

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "mikestead.dotenv",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

---

## Setup Step-by-Step

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd insurrance-system
```

### Step 2: Setup Database

#### Option A: Docker (Recommended)

```bash
# Chạy PostgreSQL + Redis bằng Docker
docker run -d \
  --name insurance-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=insurance_db \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d \
  --name insurance-redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### Option B: Local Installation

```bash
# PostgreSQL - tạo database
psql -U postgres
CREATE DATABASE insurance_db;
CREATE USER insurance_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE insurance_db TO insurance_user;
\q

# Redis - start service
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows
# Sử dụng WSL hoặc Redis for Windows
```

### Step 3: Setup Backend

```bash
cd be

# Copy environment file
cp .env.example .env

# Edit .env với database credentials
# Mở .env và cập nhật DB_USER, DB_PASSWORD, etc.

# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Seed initial data (optional)
npm run seed

# Start development server
npm run dev
```

**Expected output:**
```
[INFO] Server running on http://localhost:3000
[INFO] Database connected successfully
[INFO] Redis connected successfully
```

### Step 4: Setup Frontend

```bash
cd fe

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### Step 5: Verify Setup

```bash
# Backend health check
curl http://localhost:3000/api/v1/health

# Expected response:
# { "status": "ok", "timestamp": "...", "version": "1.0.0" }
```

Truy cập `http://localhost:5173` trên browser để verify frontend.

---

## Docker Compose (Full Stack)

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: insurance-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: insurance_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: insurance-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: insurance-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

### Sử dụng Docker Compose

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (reset data)
docker compose down -v
```

---

## Common Issues & Troubleshooting

### Issue 1: Port already in use

```bash
# Tìm process đang dùng port
lsof -i :3000
# hoặc
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

### Issue 2: Database connection refused

```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready -h localhost -p 5432

# Docker
docker ps | grep postgres
docker logs insurance-postgres

# Restart
docker restart insurance-postgres
```

### Issue 3: Permission denied on npm install

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### Issue 4: Node version mismatch

```bash
# Sử dụng nvm để quản lý Node versions
nvm install 20
nvm use 20

# Hoặc sử dụng .nvmrc
echo "20" > .nvmrc
nvm use
```

### Issue 5: Redis connection error

```bash
# Kiểm tra Redis
redis-cli ping
# Expected: PONG

# Docker
docker exec insurance-redis redis-cli ping
```

### Issue 6: TypeScript build errors

```bash
# Clear build cache
rm -rf dist/
rm -rf node_modules/.cache

# Reinstall
rm -rf node_modules
npm install

# Check TypeScript version
npx tsc --version
```

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Start infrastructure (if using Docker)
docker compose up -d

# 4. Start backend
cd be && npm run dev

# 5. Start frontend (new terminal)
cd fe && npm run dev

# 6. Code, test, commit
npm run lint
npm run test
git add .
git commit -m "feat(scope): description"

# 7. Push and create PR
git push -u origin feature/my-feature
```

### Useful Commands

```bash
# Backend
npm run dev              # Start with hot-reload
npm run build            # Build production
npm run lint             # Check code style
npm run lint:fix         # Auto-fix lint issues
npm run test             # Run tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Tests with coverage
npm run migration:generate  # Generate migration
npm run migration:run    # Run migrations
npm run migration:revert # Revert last migration

# Frontend
npm run dev              # Start Vite dev server
npm run build            # Build production
npm run preview          # Preview production build
npm run lint             # Check code style

# Docker
docker compose up -d     # Start services
docker compose down      # Stop services
docker compose logs -f   # View logs
docker compose restart   # Restart services
```

---

## Network Ports Map

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Express) | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |
| RabbitMQ | 5672 | - |
| RabbitMQ Management | 15672 | http://localhost:15672 |

---

## IDE Configuration

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

### Debug Configuration (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend: Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/be/src/index.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Backend: Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/be/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```
