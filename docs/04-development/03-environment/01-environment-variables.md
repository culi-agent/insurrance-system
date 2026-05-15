# Environment Variables Documentation

## Tổng quan

Tài liệu này mô tả tất cả environment variables được sử dụng trong dự án Insurance System, bao gồm cả Backend và Frontend.

---

## Backend Environment Variables

### Application

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | ✅ | `development` | Environment mode: `development`, `staging`, `production` |
| `PORT` | number | ❌ | `3000` | Port server chạy |
| `API_PREFIX` | string | ❌ | `/api/v1` | API route prefix |
| `APP_NAME` | string | ❌ | `Insurance System` | Tên ứng dụng (dùng trong logs, emails) |
| `APP_VERSION` | string | ❌ | `1.0.0` | Version hiện tại |

### Database (PostgreSQL)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DB_HOST` | string | ✅ | `localhost` | Database host |
| `DB_PORT` | number | ✅ | `5432` | Database port |
| `DB_NAME` | string | ✅ | - | Database name |
| `DB_USER` | string | ✅ | - | Database username |
| `DB_PASSWORD` | string | ✅ | - | Database password |
| `DB_SSL` | boolean | ❌ | `false` | Enable SSL connection |
| `DB_POOL_MIN` | number | ❌ | `2` | Minimum pool connections |
| `DB_POOL_MAX` | number | ❌ | `10` | Maximum pool connections |
| `DB_LOGGING` | boolean | ❌ | `false` | Enable SQL query logging |

### Redis (Cache)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REDIS_HOST` | string | ✅ | `localhost` | Redis host |
| `REDIS_PORT` | number | ✅ | `6379` | Redis port |
| `REDIS_PASSWORD` | string | ❌ | - | Redis password |
| `REDIS_DB` | number | ❌ | `0` | Redis database index |
| `REDIS_TTL` | number | ❌ | `3600` | Default TTL in seconds |

### Authentication (JWT)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `JWT_SECRET` | string | ✅ | - | Secret key cho JWT signing |
| `JWT_EXPIRES_IN` | string | ❌ | `1h` | Access token expiration |
| `JWT_REFRESH_SECRET` | string | ✅ | - | Secret key cho refresh token |
| `JWT_REFRESH_EXPIRES_IN` | string | ❌ | `7d` | Refresh token expiration |
| `BCRYPT_ROUNDS` | number | ❌ | `12` | Bcrypt hash rounds |

### Email (SMTP)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `SMTP_HOST` | string | ✅ | - | SMTP server host |
| `SMTP_PORT` | number | ✅ | `587` | SMTP server port |
| `SMTP_USER` | string | ✅ | - | SMTP username |
| `SMTP_PASSWORD` | string | ✅ | - | SMTP password |
| `SMTP_FROM_NAME` | string | ❌ | `Insurance System` | Sender name |
| `SMTP_FROM_EMAIL` | string | ✅ | - | Sender email address |

### Message Queue (RabbitMQ)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `RABBITMQ_URL` | string | ✅ | - | RabbitMQ connection URL |
| `RABBITMQ_QUEUE_PREFIX` | string | ❌ | `ins` | Queue name prefix |
| `RABBITMQ_RETRY_ATTEMPTS` | number | ❌ | `3` | Max retry attempts |
| `RABBITMQ_RETRY_DELAY` | number | ❌ | `5000` | Retry delay in ms |

### File Storage

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `STORAGE_TYPE` | string | ❌ | `local` | Storage type: `local`, `s3` |
| `AWS_S3_BUCKET` | string | ❌ | - | S3 bucket name |
| `AWS_S3_REGION` | string | ❌ | `ap-southeast-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | string | ❌ | - | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | string | ❌ | - | AWS secret key |
| `UPLOAD_MAX_SIZE` | number | ❌ | `10485760` | Max file size (10MB) |

### Payment Gateway

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PAYMENT_PROVIDER` | string | ✅ | - | Provider: `vnpay`, `momo`, `stripe` |
| `PAYMENT_MERCHANT_ID` | string | ✅ | - | Merchant ID |
| `PAYMENT_SECRET_KEY` | string | ✅ | - | Payment secret key |
| `PAYMENT_CALLBACK_URL` | string | ✅ | - | Payment callback URL |
| `PAYMENT_RETURN_URL` | string | ✅ | - | Return URL after payment |

### Logging & Monitoring

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOG_LEVEL` | string | ❌ | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `LOG_FORMAT` | string | ❌ | `json` | Log format: `json`, `simple` |
| `SENTRY_DSN` | string | ❌ | - | Sentry error tracking DSN |
| `ENABLE_REQUEST_LOGGING` | boolean | ❌ | `true` | Log HTTP requests |

### CORS & Security

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CORS_ORIGINS` | string | ✅ | `*` | Allowed origins (comma-separated) |
| `RATE_LIMIT_WINDOW` | number | ❌ | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | number | ❌ | `100` | Max requests per window |

---

## Frontend Environment Variables

> **Note**: Frontend env vars phải có prefix `VITE_` để Vite expose cho client.

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `VITE_API_BASE_URL` | string | ✅ | - | Backend API base URL |
| `VITE_APP_NAME` | string | ❌ | `Insurance System` | App display name |
| `VITE_APP_VERSION` | string | ❌ | `1.0.0` | App version |
| `VITE_ENABLE_MOCK` | boolean | ❌ | `false` | Enable mock API |
| `VITE_SENTRY_DSN` | string | ❌ | - | Sentry DSN cho frontend |
| `VITE_GA_TRACKING_ID` | string | ❌ | - | Google Analytics ID |
| `VITE_STORAGE_PREFIX` | string | ❌ | `ins_` | LocalStorage key prefix |

---

## .env Files Structure

### File Priority (Backend)

```
.env                  # Shared defaults (committed to repo)
.env.local            # Local overrides (gitignored)
.env.development      # Development environment
.env.staging          # Staging environment
.env.production       # Production environment (NEVER commit)
```

### Loading Order

```
1. .env                    (base defaults)
2. .env.{NODE_ENV}         (environment-specific)
3. .env.local              (local overrides, highest priority)
```

---

## .env.example Template

### Backend (`be/.env.example`)

```bash
# ============================================
# APPLICATION
# ============================================
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
APP_NAME=Insurance System

# ============================================
# DATABASE (PostgreSQL)
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
DB_POOL_MAX=10

# ============================================
# REDIS
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Insurance System
SMTP_FROM_EMAIL=noreply@insurance.example.com

# ============================================
# MESSAGE QUEUE (RabbitMQ)
# ============================================
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# ============================================
# FILE STORAGE
# ============================================
STORAGE_TYPE=local
# AWS_S3_BUCKET=
# AWS_S3_REGION=ap-southeast-1
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=

# ============================================
# PAYMENT
# ============================================
PAYMENT_PROVIDER=vnpay
PAYMENT_MERCHANT_ID=your-merchant-id
PAYMENT_SECRET_KEY=your-payment-secret
PAYMENT_CALLBACK_URL=http://localhost:3000/api/v1/payment/callback
PAYMENT_RETURN_URL=http://localhost:5173/payment/result

# ============================================
# LOGGING & MONITORING
# ============================================
LOG_LEVEL=debug
LOG_FORMAT=simple
# SENTRY_DSN=

# ============================================
# CORS & SECURITY
# ============================================
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Frontend (`fe/.env.example`)

```bash
# ============================================
# API
# ============================================
VITE_API_BASE_URL=http://localhost:3000/api/v1

# ============================================
# APPLICATION
# ============================================
VITE_APP_NAME=Insurance System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK=false

# ============================================
# MONITORING
# ============================================
# VITE_SENTRY_DSN=
# VITE_GA_TRACKING_ID=

# ============================================
# STORAGE
# ============================================
VITE_STORAGE_PREFIX=ins_
```

---

## Security Best Practices

### NEVER commit ❌

- `.env.local`
- `.env.production`
- Any file containing real credentials

### Gitignore rules

```gitignore
# Environment files
.env.local
.env.*.local
.env.production
```

### Secret Management (Production)

| Method | Khi nào dùng |
|--------|-------------|
| AWS Secrets Manager | Production secrets |
| HashiCorp Vault | Enterprise secrets management |
| GitHub Secrets | CI/CD pipeline |
| Docker Secrets | Container deployments |

### Quy tắc

1. **Rotate secrets** định kỳ (90 ngày)
2. **Không share** secrets qua chat/email
3. **Sử dụng strong values** (min 32 chars cho keys)
4. **Audit** access logs cho secret stores
5. **Different secrets** cho mỗi environment

---

## Environment-specific Values

| Variable | Development | Staging | Production |
|----------|------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `LOG_LEVEL` | debug | info | warn |
| `DB_SSL` | false | true | true |
| `DB_POOL_MAX` | 5 | 20 | 50 |
| `BCRYPT_ROUNDS` | 10 | 12 | 14 |
| `RATE_LIMIT_MAX` | 1000 | 200 | 100 |
| `CORS_ORIGINS` | * | staging URL | production URL |
