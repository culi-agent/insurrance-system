# Secrets Management Guide - Hướng Dẫn Quản Lý Bí Mật

---

## 1. Tổng quan

### 1.1. Mục đích
Tài liệu này hướng dẫn cách quản lý an toàn các secrets (bí mật) trong Insurance System Platform, bao gồm API keys, database credentials, encryption keys, tokens và các thông tin nhạy cảm khác.

### 1.2. Nguyên tắc cơ bản

| Nguyên tắc | Mô tả |
|------------|--------|
| **Never Hardcode** | Không bao giờ hardcode secrets trong source code |
| **Encrypt at Rest** | Mọi secrets phải được mã hóa khi lưu trữ |
| **Least Privilege** | Chỉ cấp quyền truy cập tối thiểu cần thiết |
| **Rotate Regularly** | Xoay vòng secrets định kỳ |
| **Audit Access** | Ghi log mọi truy cập vào secrets |
| **Separate Environments** | Mỗi environment có secrets riêng biệt |
| **No Sharing** | Không chia sẻ secrets qua chat, email, ticket |

---

## 2. Secret Classification

### 2.1. Phân loại Secrets

| Category | Examples | Sensitivity | Rotation |
|----------|---------|-------------|----------|
| **Database Credentials** | PostgreSQL user/password, connection strings | Critical | 90 days |
| **API Keys** | Payment gateway, Insurer APIs, eKYC service | Critical | 90 days |
| **Encryption Keys** | AES keys, RSA private keys, JWT signing keys | Critical | Annual |
| **Service Tokens** | Internal service-to-service auth tokens | High | 30 days |
| **OAuth Secrets** | Client secrets, refresh tokens | High | Annual |
| **Cloud Credentials** | AWS access keys, IAM roles | Critical | 90 days |
| **TLS Certificates** | SSL/TLS private keys, CA certificates | Critical | Annual |
| **Application Secrets** | Session secret, CSRF token secret | High | 90 days |
| **Third-party Tokens** | SendGrid, Twilio, Firebase tokens | Medium | Annual |
| **Environment Config** | Feature flags, non-sensitive config | Low | As needed |

### 2.2. Secrets Inventory

| Secret Name | Service | Environment | Storage | Owner | Last Rotated |
|-------------|---------|-------------|---------|-------|-------------|
| DB_PASSWORD | PostgreSQL | All | AWS Secrets Manager | DevOps | [Date] |
| JWT_PRIVATE_KEY | Auth Service | All | AWS Secrets Manager | Security | [Date] |
| PAYMENT_API_KEY | VNPay/Momo | All | AWS Secrets Manager | Backend | [Date] |
| INSURER_API_KEYS | Insurer Integration | All | AWS Secrets Manager | Backend | [Date] |
| EKYC_API_KEY | eKYC Service | All | AWS Secrets Manager | Backend | [Date] |
| REDIS_PASSWORD | Redis Cache | All | AWS Secrets Manager | DevOps | [Date] |
| S3_ACCESS_KEY | File Storage | All | IAM Role (no key) | DevOps | N/A |
| SMTP_PASSWORD | Email Service | All | AWS Secrets Manager | Backend | [Date] |
| ENCRYPTION_KEY | Data Encryption | All | AWS KMS | Security | [Date] |
| SENTRY_DSN | Error Tracking | All | AWS Secrets Manager | DevOps | [Date] |

---

## 3. Secrets Management Infrastructure

### 3.1. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECRETS MANAGEMENT ARCHITECTURE                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     AWS SECRETS MANAGER                          ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ││
│  │  │    DEV    │  │  STAGING  │  │   PROD    │  │   SHARED  │  ││
│  │  │  secrets  │  │  secrets  │  │  secrets  │  │  secrets  │  ││
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘  ││
│  └──────────────────────────┬──────────────────────────────────────┘│
│                              │                                        │
│  ┌───────────────────────────▼─────────────────────────────────────┐│
│  │                      AWS KMS                                     ││
│  │          (Customer Managed Keys - CMK)                           ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                     ││
│  │  │ Data Key │  │ Auth Key │  │Backup Key│                     ││
│  │  └──────────┘  └──────────┘  └──────────┘                     ││
│  └──────────────────────────┬──────────────────────────────────────┘│
│                              │                                        │
│  ┌───────────────────────────▼─────────────────────────────────────┐│
│  │                   IAM POLICIES                                   ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         ││
│  │  │ App Service  │  │ CI/CD Role   │  │ Admin Role   │         ││
│  │  │ Role         │  │              │  │              │         ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  CONSUMERS:                                                           │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐           │
│  │ECS App│  │Lambda │  │CI/CD  │  │Admin  │  │Dev    │           │
│  │Tasks  │  │Funcs  │  │Pipeline│  │Portal │  │Local  │           │
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2. Tool Stack

| Tool | Purpose | Environment |
|------|---------|-------------|
| AWS Secrets Manager | Primary secrets storage | All (cloud) |
| AWS KMS | Encryption key management | All (cloud) |
| AWS IAM | Access control for secrets | All (cloud) |
| dotenv (.env) | Local development only | Development |
| git-secrets | Pre-commit secret detection | All (local) |
| TruffleHog | CI/CD secret scanning | CI/CD pipeline |
| SOPS | Encrypted config files (optional) | Development |

---

## 4. Hướng dẫn cho Developers

### 4.1. Local Development Setup

#### Step 1: Cài đặt prerequisites
```bash
# Install git-secrets hook
git secrets --install
git secrets --register-aws

# Install AWS CLI
aws configure --profile insurance-dev
```

#### Step 2: Tạo file .env (local only)
```bash
# Copy template
cp .env.example .env

# NEVER commit .env file
# .gitignore already includes .env*
```

#### Step 3: Cấu trúc .env file
```env
# .env.example (committed - NO real values)
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_dev
DB_USER=dev_user
DB_PASSWORD=<get-from-secrets-manager>

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_PRIVATE_KEY=<get-from-secrets-manager>
JWT_PUBLIC_KEY=<get-from-secrets-manager>

# External Services (use sandbox/test keys)
PAYMENT_API_KEY=<get-from-secrets-manager>
EKYC_API_KEY=<get-from-secrets-manager>

# Application
APP_SECRET=<get-from-secrets-manager>
ENCRYPTION_KEY=<get-from-secrets-manager>
```

#### Step 4: Fetch secrets from AWS Secrets Manager
```bash
# Script to fetch dev secrets
#!/bin/bash
# scripts/fetch-dev-secrets.sh

ENV=${1:-dev}
REGION="ap-southeast-1"

echo "Fetching secrets for environment: $ENV"

# Fetch and parse secrets
aws secretsmanager get-secret-value \
  --secret-id "insurance-platform/$ENV/app" \
  --region $REGION \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "\(.key)=\(.value)"' > .env

echo "Secrets written to .env"
echo "WARNING: Never commit this file!"
```

### 4.2. Application Code - DO's and DON'Ts

#### ❌ DON'T - Hardcoded Secrets
```typescript
// NEVER DO THIS
const dbPassword = "super_secret_password_123";
const apiKey = "sk-live-abc123def456";
const jwtSecret = "my-jwt-secret-key";
```

#### ✅ DO - Environment Variables
```typescript
// config/database.ts
export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // From environment
};

// Validate required env vars at startup
const requiredEnvVars = ['DB_HOST', 'DB_PASSWORD', 'JWT_PRIVATE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

#### ✅ DO - AWS Secrets Manager SDK
```typescript
// services/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'ap-southeast-1' });

export async function getSecret(secretName: string): Promise<Record<string, string>> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  
  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }
  throw new Error(`Secret ${secretName} not found`);
}

// Usage with caching
const secretCache = new Map<string, { value: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedSecret(secretName: string): Promise<Record<string, string>> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }
  
  const secret = await getSecret(secretName);
  secretCache.set(secretName, { value: secret, expiry: Date.now() + CACHE_TTL });
  return secret;
}
```

### 4.3. Git Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit (or via husky)

# Check for secrets in staged files
echo "Checking for secrets..."

# Patterns to detect
PATTERNS=(
  'password\s*=\s*["\x27][^"\x27]+'
  'api[_-]?key\s*=\s*["\x27][^"\x27]+'
  'secret\s*=\s*["\x27][^"\x27]+'
  'AKIA[0-9A-Z]{16}'  # AWS Access Key
  'sk-[a-zA-Z0-9]{32,}'  # Stripe/OpenAI keys
  'ghp_[a-zA-Z0-9]{36}'  # GitHub token
)

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  matches=$(git diff --cached --name-only | xargs grep -lE "$pattern" 2>/dev/null)
  if [ ! -z "$matches" ]; then
    echo "⚠️  Potential secret found in: $matches"
    echo "   Pattern: $pattern"
    FOUND=1
  fi
done

if [ $FOUND -eq 1 ]; then
  echo ""
  echo "❌ Commit blocked: Potential secrets detected!"
  echo "   Remove secrets and use environment variables instead."
  echo "   If this is a false positive, use: git commit --no-verify"
  exit 1
fi

echo "✅ No secrets detected"
```

---

## 5. Secrets in CI/CD Pipeline

### 5.1. GitHub Actions Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      # Use OIDC - NO stored AWS credentials
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions-deploy
          aws-region: ap-southeast-1
      
      # Secrets are injected at runtime by ECS
      # NEVER echo or print secrets in CI logs
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster insurance-prod \
            --service api-service \
            --force-new-deployment
```

### 5.2. ECS Task Definition (Secrets from SM)

```json
{
  "containerDefinitions": [
    {
      "name": "api-server",
      "image": "123456789.dkr.ecr.ap-southeast-1.amazonaws.com/insurance-api:latest",
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789:secret:insurance-platform/prod/database:password::"
        },
        {
          "name": "JWT_PRIVATE_KEY",
          "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789:secret:insurance-platform/prod/auth:jwt_private_key::"
        },
        {
          "name": "PAYMENT_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789:secret:insurance-platform/prod/payment:api_key::"
        },
        {
          "name": "ENCRYPTION_KEY",
          "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789:secret:insurance-platform/prod/encryption:master_key::"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "insurance-prod.cluster-xxx.ap-southeast-1.rds.amazonaws.com"
        }
      ]
    }
  ]
}
```

---

## 6. Secret Rotation

### 6.1. Rotation Schedule

| Secret Type | Rotation Period | Method | Downtime |
|-------------|----------------|--------|----------|
| Database passwords | 90 days | Automatic (Lambda) | Zero (dual-user) |
| API keys (owned) | 90 days | Manual + deploy | Zero (overlap period) |
| API keys (third-party) | Annual | Manual | Minimal |
| JWT signing keys | 6 months | Automatic (JWKS) | Zero (key rollover) |
| TLS certificates | Annual | Automatic (ACM) | Zero |
| Service tokens | 30 days | Automatic | Zero |
| Encryption keys | Annual | AWS KMS auto-rotate | Zero |

### 6.2. Database Password Rotation (Automatic)

```
┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│ AWS Secrets  │───▶│  Lambda        │───▶│  PostgreSQL  │
│ Manager      │    │  (Rotation fn) │    │  (ALTER USER)│
│ (Schedule)   │    │                │    │              │
└──────────────┘    └────────────────┘    └──────────────┘
       │                                         │
       ▼                                         ▼
┌──────────────┐                         ┌──────────────┐
│ New password │                         │ Verify new   │
│ generated    │                         │ credentials  │
└──────────────┘                         └──────────────┘
       │
       ▼
┌──────────────┐
│ ECS tasks    │
│ auto-refresh │
│ (next start) │
└──────────────┘
```

### 6.3. JWT Key Rotation (JWKS)

```typescript
// JWT key rotation strategy
// Maintain 2 active keys for zero-downtime rotation

// JWKS endpoint: GET /.well-known/jwks.json
{
  "keys": [
    {
      "kid": "key-2024-01",  // Current signing key
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    },
    {
      "kid": "key-2023-07",  // Previous key (still valid for verification)
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}

// Rotation process:
// 1. Generate new key pair
// 2. Add new public key to JWKS
// 3. Start signing with new key
// 4. Wait for all old tokens to expire (24h)
// 5. Remove old public key from JWKS
```

---

## 7. Emergency Procedures

### 7.1. Secret Compromise Response

```
┌─────────────────────────────────────────────────────────┐
│           SECRET COMPROMISE RESPONSE PLAN                 │
│                                                           │
│  Step 1: IDENTIFY (0-15 min)                             │
│  ├── Confirm compromise (not false alarm)                │
│  ├── Identify which secret(s) affected                   │
│  └── Determine blast radius                              │
│                                                           │
│  Step 2: CONTAIN (15-30 min)                             │
│  ├── Revoke compromised credentials immediately          │
│  ├── Block suspicious IP/sessions                        │
│  └── Enable additional monitoring                        │
│                                                           │
│  Step 3: ROTATE (30-60 min)                              │
│  ├── Generate new secret                                 │
│  ├── Update in Secrets Manager                           │
│  ├── Deploy new configuration                            │
│  └── Verify service functionality                        │
│                                                           │
│  Step 4: INVESTIGATE (1-24 hours)                        │
│  ├── Review audit logs for unauthorized access           │
│  ├── Check for data exfiltration                         │
│  ├── Identify root cause of compromise                   │
│  └── Document timeline and impact                        │
│                                                           │
│  Step 5: REMEDIATE (1-7 days)                            │
│  ├── Fix root cause                                      │
│  ├── Update security controls                            │
│  ├── Rotate all potentially affected secrets             │
│  └── Post-incident review                                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 7.2. Common Scenarios

| Scenario | Immediate Action | Who to Notify |
|----------|-----------------|---------------|
| Secret committed to git | Rotate immediately, purge from git history | Security Lead |
| AWS keys exposed | Deactivate key via IAM, create new | Security + DevOps |
| Database password leaked | Change password, review access logs | Security + DBA |
| API key compromised | Revoke key with provider, generate new | Security + Backend |
| JWT key compromised | Rotate signing key, invalidate all sessions | Security + CTO |
| Employee departure | Revoke all personal access, rotate shared secrets | Security + HR |

---

## 8. Audit & Compliance

### 8.1. Access Logging

| Event | Logged | Alert |
|-------|--------|-------|
| Secret retrieved | ✅ (CloudTrail) | Unusual pattern |
| Secret created | ✅ | Always |
| Secret updated/rotated | ✅ | Always |
| Secret deleted | ✅ | Always |
| Failed access attempt | ✅ | Always |
| IAM policy change | ✅ | Always |
| KMS key usage | ✅ | Unusual pattern |

### 8.2. Compliance Checklist

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| No plaintext secrets in code | git-secrets + TruffleHog | ✅ |
| Secrets encrypted at rest | AWS SM + KMS | ✅ |
| Secrets encrypted in transit | TLS 1.3 | ✅ |
| Access control (least privilege) | IAM policies per service | ✅ |
| Rotation policy defined | Per secret type schedule | ✅ |
| Audit trail maintained | CloudTrail + CloudWatch | ✅ |
| Separation of environments | Separate SM paths per env | ✅ |
| Emergency rotation procedure | Documented + tested | ✅ |
| Regular access review | Quarterly | ✅ |
| Secret inventory maintained | This document | ✅ |

---

## 9. Best Practices Summary

### 9.1. Do's ✅
- Use AWS Secrets Manager for all secrets
- Use IAM roles instead of access keys where possible
- Rotate secrets on schedule
- Validate secrets at application startup
- Cache secrets with short TTL (5 min)
- Use separate secrets per environment
- Encrypt secrets with customer-managed KMS keys
- Set up alerts for unusual secret access patterns
- Review and audit secret access quarterly
- Document all secrets in inventory

### 9.2. Don'ts ❌
- Never hardcode secrets in source code
- Never commit .env files to git
- Never share secrets via email, Slack, or tickets
- Never log secret values (even in debug mode)
- Never use the same secret across environments
- Never store secrets in plain text files
- Never embed secrets in Docker images
- Never pass secrets as command-line arguments
- Never use default/weak secrets in any environment
- Never disable secret rotation without approval

---

*Document Version: 1.0*
*Last Updated: 2024-01*
*Owner: DevOps + Security Team*
*Review Frequency: Quarterly*
