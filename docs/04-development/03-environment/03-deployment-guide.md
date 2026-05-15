# Deployment Guide

## Tổng quan

Tài liệu này mô tả quy trình deployment cho dự án Insurance System trên các môi trường khác nhau.

---

## Environments

| Environment | Mục đích | URL | Branch | Auto Deploy |
|-------------|---------|-----|--------|-------------|
| Development | Dev testing | localhost | feature/* | ❌ |
| Staging | QA & UAT | staging.insurance.example.com | develop | ✅ |
| UAT | User acceptance | uat.insurance.example.com | release/* | ✅ |
| Production | Live system | insurance.example.com | main | ⚠️ Manual approve |

---

## Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐     ┌──────────────┐     ┌──────────┐     │
│  │  CDN     │────▶│ Load Balancer│────▶│ Backend  │     │
│  │(CloudFront)│   │   (ALB)      │     │ (ECS)    │     │
│  └──────────┘     └──────────────┘     └────┬─────┘     │
│       │                                       │           │
│  ┌──────────┐                          ┌─────┴─────┐    │
│  │ Frontend │                          │            │    │
│  │  (S3)    │                          ▼            ▼    │
│  └──────────┘                    ┌─────────┐  ┌───────┐ │
│                                  │PostgreSQL│  │ Redis │ │
│                                  │  (RDS)   │  │(Elasti│ │
│                                  └─────────┘  │ Cache)│ │
│                                               └───────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline

### Pipeline Stages

```
Code Push → Lint → Test → Build → Deploy → Health Check → Notify
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

env:
  NODE_VERSION: '20'
  AWS_REGION: 'ap-southeast-1'

jobs:
  # ─── LINT & TEST ────────────────────────
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Backend Dependencies
        run: cd be && npm ci

      - name: Lint Backend
        run: cd be && npm run lint

      - name: Test Backend
        run: cd be && npm run test -- --coverage

      - name: Install Frontend Dependencies
        run: cd fe && npm ci

      - name: Lint Frontend
        run: cd fe && npm run lint

      - name: Build Frontend
        run: cd fe && npm run build

  # ─── BUILD & PUSH DOCKER ──────────────────
  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & Push Backend Image
        run: |
          docker build -t insurance-be:${{ github.sha }} ./be
          docker tag insurance-be:${{ github.sha }} $ECR_REGISTRY/insurance-be:${{ github.sha }}
          docker push $ECR_REGISTRY/insurance-be:${{ github.sha }}

      - name: Build & Deploy Frontend to S3
        run: |
          cd fe && npm ci && npm run build
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/ --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"

  # ─── DEPLOY STAGING ───────────────────────
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to ECS Staging
        run: |
          aws ecs update-service \
            --cluster insurance-staging \
            --service insurance-be \
            --force-new-deployment

      - name: Health Check
        run: |
          sleep 30
          curl -f https://staging.insurance.example.com/api/v1/health

  # ─── DEPLOY PRODUCTION ────────────────────
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://insurance.example.com
    steps:
      - name: Deploy to ECS Production
        run: |
          aws ecs update-service \
            --cluster insurance-production \
            --service insurance-be \
            --force-new-deployment

      - name: Health Check
        run: |
          sleep 60
          curl -f https://insurance.example.com/api/v1/health

      - name: Notify Slack
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            -d '{"text":"✅ Production deployed: ${{ github.sha }}"}'
```

---

## Docker Configuration

### Backend Dockerfile (`be/Dockerfile`)

```dockerfile
# ─── BUILD STAGE ───────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# ─── PRODUCTION STAGE ──────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/index.js"]
```

### Docker Build & Run

```bash
# Build
docker build -t insurance-be:latest ./be

# Run
docker run -d \
  --name insurance-backend \
  -p 3000:3000 \
  --env-file ./be/.env.production \
  insurance-be:latest
```

---

## Deployment Procedures

### Deploy to Staging (Auto)

```
1. Merge PR vào develop
       ↓
2. GitHub Actions auto-trigger
       ↓
3. Lint → Test → Build → Deploy
       ↓
4. Health check passes
       ↓
5. Slack notification
```

### Deploy to Production (Manual Approval)

```
1. Merge release branch vào main
       ↓
2. GitHub Actions trigger
       ↓
3. Lint → Test → Build
       ↓
4. Manual approval (Team Lead/DevOps)
       ↓
5. Deploy to production
       ↓
6. Health check + Smoke test
       ↓
7. Monitoring (15 min window)
       ↓
8. ✅ Complete hoặc 🔙 Rollback
```

---

## Database Migrations

### Production Migration Process

```bash
# 1. Generate migration
npm run migration:generate -- -n AddPolicySearchIndex

# 2. Review migration file
# Kiểm tra SQL statements

# 3. Test on staging first
# Verify migration trên staging environment

# 4. Backup production database
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 5. Run migration
npm run migration:run

# 6. Verify
npm run migration:show
```

### Rollback Migration

```bash
# Revert last migration
npm run migration:revert

# Restore from backup (worst case)
psql -h $DB_HOST -U $DB_USER $DB_NAME < backup_file.sql
```

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

```bash
# 1. Revert ECS to previous task definition
aws ecs update-service \
  --cluster insurance-production \
  --service insurance-be \
  --task-definition insurance-be:<previous-revision>

# 2. Frontend rollback (S3 versioning)
aws s3 sync s3://$S3_BUCKET/.versions/<previous>/ s3://$S3_BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
```

### Git Rollback

```bash
# Revert the merge commit
git revert -m 1 <merge-commit-hash>
git push origin main

# CI/CD sẽ auto-deploy reverted code
```

---

## Health Checks & Monitoring

### Health Check Endpoint

```typescript
// GET /api/v1/health
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.2.0",
  "uptime": 86400,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "rabbitmq": "healthy"
  }
}
```

### Monitoring Stack

| Tool | Mục đích |
|------|---------|
| CloudWatch | Infrastructure metrics, logs |
| Sentry | Error tracking |
| Grafana | Custom dashboards |
| PagerDuty | Alerting |

### Key Metrics to Monitor Post-Deploy

| Metric | Alert Threshold |
|--------|----------------|
| Error rate | > 1% (5 min window) |
| Response time (p99) | > 2000ms |
| CPU utilization | > 80% |
| Memory utilization | > 85% |
| Database connections | > 80% pool |
| 5xx responses | > 10/min |

---

## Security Checklist (Pre-Deploy)

- [ ] Secrets không hardcode trong code
- [ ] Environment variables set đúng
- [ ] CORS origins configured cho production
- [ ] SSL/TLS enabled
- [ ] Security headers configured (Helmet)
- [ ] Rate limiting enabled
- [ ] Database credentials rotated (nếu cần)
- [ ] Dependencies không có known vulnerabilities
- [ ] API authentication working
- [ ] Logging không chứa sensitive data

---

## Environment-specific Configurations

### Staging vs Production Differences

| Config | Staging | Production |
|--------|---------|------------|
| Replicas | 1 | 2-4 (auto-scaling) |
| DB instance | db.t3.small | db.r5.large |
| Redis | cache.t3.micro | cache.r5.large |
| Log retention | 7 days | 90 days |
| Backup | Daily | Every 6 hours |
| SSL | Let's Encrypt | AWS ACM |
| CDN cache | 1 hour | 24 hours |

---

## Release Checklist

### Before Release

- [ ] All features tested on staging
- [ ] QA sign-off
- [ ] Performance testing passed
- [ ] Security scan clean
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] CHANGELOG updated
- [ ] Version bumped

### During Release

- [ ] Announce maintenance window (nếu cần)
- [ ] Backup database
- [ ] Run migrations
- [ ] Deploy application
- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Monitor metrics (15 min)

### After Release

- [ ] Verify all features in production
- [ ] Close related issues/tickets
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Post-mortem (nếu có issues)
