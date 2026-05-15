# CI/CD Pipeline Documentation

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| CI/CD Tool | GitHub Actions + ArgoCD |
| Container Registry | Amazon ECR |

---

## 1. Tổng Quan CI/CD

### 1.1. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE OVERVIEW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  DEVELOPER                 CI (GitHub Actions)              CD (ArgoCD)       │
│  ─────────                 ──────────────────              ──────────        │
│                                                                               │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────────────┐   │
│  │  Code  │──▶│  Push  │──▶│  Build │──▶│  Test  │──▶│  Publish Image │   │
│  │  Write │   │  (PR)  │   │  (CI)  │   │  (CI)  │   │    (ECR)       │   │
│  └────────┘   └────────┘   └────────┘   └────────┘   └───────┬────────┘   │
│                                                                │             │
│                                                                ▼             │
│                                                          ┌────────────┐     │
│                                                          │  Update    │     │
│                                                          │  Manifests │     │
│                                                          │  (GitOps)  │     │
│                                                          └──────┬─────┘     │
│                                                                 │           │
│                                                                 ▼           │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                        ArgoCD                                       │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │   │
│  │  │  Detect  │───▶│  Sync    │───▶│  Deploy  │───▶│  Verify  │   │   │
│  │  │  Change  │    │  Plan    │    │  (K8s)   │    │  Health  │   │   │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Tools & Services

| Component | Tool | Purpose |
|-----------|------|---------|
| Source Control | GitHub | Code repository, PR management |
| CI Pipeline | GitHub Actions | Build, test, lint, security scan |
| Container Registry | Amazon ECR | Docker image storage |
| CD Engine | ArgoCD | GitOps-based deployments |
| Manifest Management | Helm + Kustomize | Kubernetes manifests |
| Secret Management | Sealed Secrets + AWS Secrets Manager | Encrypted secrets |
| Artifact Storage | S3 | Build artifacts, test reports |
| Notifications | Slack + Email | Pipeline status alerts |

---

## 2. CI Pipeline (GitHub Actions)

### 2.1. Workflow Triggers

| Event | Workflow | Target |
|-------|----------|--------|
| Push to `feature/*` | CI Check | Lint + Unit Test |
| Pull Request to `develop` | Full CI | Lint + Test + Build + Security Scan |
| Merge to `develop` | Build & Deploy Staging | Build Image + Deploy to Staging |
| Merge to `main` | Build & Deploy Production | Build Image + Deploy to Prod |
| Tag `v*.*.*` | Release | Build + Tag Image + Release Notes |
| Schedule (daily 2AM) | Security Scan | Full vulnerability scan |

### 2.2. CI Workflow Stages

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CI PIPELINE STAGES                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Stage 1: CHECKOUT & SETUP (~30s)                                       │
│  ├── Checkout code                                                       │
│  ├── Setup Node.js 20                                                    │
│  ├── Cache node_modules (npm ci)                                        │
│  └── Install dependencies                                                │
│                                                                          │
│  Stage 2: CODE QUALITY (~60s)                                           │
│  ├── ESLint (linting)                                                    │
│  ├── Prettier (formatting check)                                        │
│  ├── TypeScript compile check (tsc --noEmit)                            │
│  └── Commit message lint (conventional commits)                          │
│                                                                          │
│  Stage 3: TESTING (~120s)                                                │
│  ├── Unit Tests (Jest) with coverage                                    │
│  ├── Integration Tests (Supertest + TestContainers)                     │
│  ├── Coverage threshold check (>= 80%)                                  │
│  └── Upload coverage report (Codecov)                                   │
│                                                                          │
│  Stage 4: SECURITY SCAN (~90s)                                          │
│  ├── npm audit (dependency vulnerabilities)                              │
│  ├── Trivy (container image scan)                                       │
│  ├── Snyk (code vulnerability scan)                                     │
│  └── SAST (CodeQL / SonarQube)                                          │
│                                                                          │
│  Stage 5: BUILD (~60s)                                                   │
│  ├── Build TypeScript (tsc)                                              │
│  ├── Build Docker image (multi-stage)                                   │
│  ├── Tag image (git SHA + branch)                                       │
│  └── Push to ECR                                                         │
│                                                                          │
│  Stage 6: POST-BUILD                                                     │
│  ├── Update Helm values (image tag)                                     │
│  ├── Trigger ArgoCD sync (staging)                                      │
│  ├── Notify Slack (success/failure)                                     │
│  └── Comment PR with build status                                       │
│                                                                          │
│  Total Pipeline Time Target: < 8 minutes                                │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3. GitHub Actions Workflow (Backend Example)

```yaml
# .github/workflows/ci-backend.yml
name: Backend CI

on:
  push:
    branches: [develop, main]
    paths: ['be/**']
  pull_request:
    branches: [develop]
    paths: ['be/**']

env:
  NODE_VERSION: '20'
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-southeast-1.amazonaws.com
  IMAGE_NAME: insurance-system/backend

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: insurance_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: be/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: be

      - name: Lint
        run: npm run lint
        working-directory: be

      - name: Type check
        run: npx tsc --noEmit
        working-directory: be

      - name: Unit tests
        run: npm test -- --coverage --ci
        working-directory: be
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/insurance_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: be/coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: 'be/'
          severity: 'CRITICAL,HIGH'

  build-and-push:
    needs: [lint-and-test, security-scan]
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: be/
          push: true
          tags: |
            ${{ env.ECR_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
            ${{ env.ECR_REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Update Helm values
        run: |
          yq -i '.image.tag = "${{ github.sha }}"' deploy/helm/values-staging.yaml
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add deploy/helm/values-staging.yaml
          git commit -m "chore: update staging image tag to ${{ github.sha }}"
          git push

  notify:
    needs: [build-and-push]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 2.4. Frontend CI Workflow

```yaml
# .github/workflows/ci-frontend.yml
name: Frontend CI

on:
  push:
    branches: [develop, main]
    paths: ['fe/**']
  pull_request:
    branches: [develop]
    paths: ['fe/**']

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: fe/package-lock.json

      - run: npm ci
        working-directory: fe

      - name: Lint
        run: npm run lint
        working-directory: fe

      - name: Type check
        run: npx tsc --noEmit
        working-directory: fe

      - name: Build
        run: npm run build
        working-directory: fe

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: fe/dist/

  deploy-preview:
    needs: [lint-and-test]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy preview to S3
        run: |
          aws s3 sync fe/dist/ s3://insurance-preview-${{ github.event.number }}/ --delete
      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '🚀 Preview deployed: https://preview-${{ github.event.number }}.insurance-system.vn'
            })
```

---

## 3. CD Pipeline (ArgoCD)

### 3.1. GitOps Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITOPS FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Application Repo          Deployment Repo          Kubernetes   │
│  (Source code)             (Helm/Kustomize)         (EKS)        │
│                                                                   │
│  ┌──────────┐             ┌──────────┐            ┌──────────┐ │
│  │ CI builds│────────────▶│ Update   │───────────▶│  ArgoCD  │ │
│  │ & pushes │  (updates   │ image    │  (detects  │  deploys │ │
│  │ image    │   values)   │ tag in   │   change)  │  to K8s  │ │
│  └──────────┘             │ values   │            └──────────┘ │
│                           └──────────┘                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. ArgoCD Applications

| Application | Repo Path | Target Namespace | Sync Policy |
|-------------|-----------|------------------|-------------|
| auth-service | deploy/helm/auth-service | production | Auto (staging), Manual (prod) |
| product-service | deploy/helm/product-service | production | Auto (staging), Manual (prod) |
| policy-service | deploy/helm/policy-service | production | Auto (staging), Manual (prod) |
| quote-service | deploy/helm/quote-service | production | Auto (staging), Manual (prod) |
| claims-service | deploy/helm/claims-service | production | Auto (staging), Manual (prod) |
| payment-service | deploy/helm/payment-service | production | Auto (staging), Manual (prod) |
| notification-service | deploy/helm/notification-service | production | Auto (staging), Manual (prod) |
| document-service | deploy/helm/document-service | production | Auto (staging), Manual (prod) |
| integration-service | deploy/helm/integration-service | production | Auto (staging), Manual (prod) |
| frontend | deploy/helm/frontend | production | Auto (staging), Manual (prod) |

### 3.3. Sync Strategies

```yaml
# ArgoCD Application - Staging (Auto-sync)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service-staging
  namespace: argocd
spec:
  project: staging
  source:
    repoURL: https://github.com/org/insurance-system-deploy.git
    path: helm/auth-service
    targetRevision: develop
    helm:
      valueFiles:
        - values-staging.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: staging
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

---
# ArgoCD Application - Production (Manual sync)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service-production
  namespace: argocd
spec:
  project: production
  source:
    repoURL: https://github.com/org/insurance-system-deploy.git
    path: helm/auth-service
    targetRevision: main
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    syncOptions:
      - CreateNamespace=false
      - PruneLast=true
```

---

## 4. Pipeline Quality Gates

### 4.1. Gate Definitions

| Gate | Criteria | Blocking | Stage |
|------|----------|----------|-------|
| Lint | No ESLint errors | Yes | PR merge |
| Type Check | No TypeScript errors | Yes | PR merge |
| Unit Test | All pass, coverage >= 80% | Yes | PR merge |
| Security Scan | No CRITICAL vulnerabilities | Yes | PR merge |
| Build | Docker build succeeds | Yes | Deploy |
| Integration Test | All pass on staging | Yes | Prod deploy |
| Performance | No regression > 10% | No (warning) | Prod deploy |
| Approval | 1 reviewer approved | Yes | Prod deploy |

### 4.2. Branch Protection Rules

```
Branch: develop
├── Require pull request (1 approval)
├── Require status checks:
│   ├── lint-and-test ✓
│   ├── security-scan ✓
│   └── build ✓
├── Require up-to-date branch
├── Dismiss stale reviews on new pushes
└── Restrict force push

Branch: main
├── Require pull request (2 approvals)
├── Require status checks:
│   ├── lint-and-test ✓
│   ├── security-scan ✓
│   ├── build ✓
│   └── integration-test ✓
├── Require up-to-date branch
├── Require conversation resolution
├── Restrict push (only release managers)
└── Restrict force push
```

---

## 5. Environment Promotion

### 5.1. Promotion Flow

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│   Local    │───▶│   Dev      │───▶│  Staging   │───▶│ Production │
│            │    │            │    │            │    │            │
│ • Feature  │    │ • Develop  │    │ • Release  │    │ • Main     │
│   branch   │    │   branch   │    │   branch   │    │   branch   │
│ • No CI    │    │ • Auto CI  │    │ • Full CI  │    │ • Full CI  │
│            │    │ • Auto CD  │    │ • Auto CD  │    │ • Manual CD│
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                                                            │
                                                            ▼
                                                    ┌────────────┐
                                                    │  Canary    │
                                                    │  (10% → 50%│
                                                    │   → 100%)  │
                                                    └────────────┘
```

### 5.2. Canary Deployment Strategy

```yaml
# Canary deployment steps (Production)
Phase 1 (10% traffic):
  duration: 10 minutes
  metrics_check:
    - error_rate < 1%
    - p95_latency < 500ms
    - no 5xx errors

Phase 2 (50% traffic):
  duration: 15 minutes
  metrics_check:
    - error_rate < 0.5%
    - p95_latency < 500ms
    - success_rate > 99.5%

Phase 3 (100% traffic):
  duration: 5 minutes
  metrics_check:
    - all metrics stable
  action: promote canary → stable

Rollback trigger:
  - error_rate > 5%
  - p95_latency > 2000ms
  - 5xx_count > 10 in 1 minute
  - Manual trigger via Slack command
```

---

## 6. Secrets Management

### 6.1. Secret Sources

| Secret Type | Storage | Rotation | Access |
|-------------|---------|----------|--------|
| Database credentials | AWS Secrets Manager | 90 days (auto) | IRSA per service |
| API keys (external) | AWS Secrets Manager | Manual | IRSA per service |
| JWT signing keys | AWS Secrets Manager | 30 days | Auth service only |
| TLS certificates | AWS ACM / cert-manager | Auto | Ingress controller |
| Docker registry | ECR auth (short-lived) | 12 hours | CI pipeline |
| GitHub tokens | GitHub secrets | Manual | CI workflows |
| Slack webhooks | Sealed Secrets | Manual | Notification service |

### 6.2. External Secrets Operator

```yaml
# ExternalSecret example
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials
    creationPolicy: Owner
  data:
    - secretKey: DB_HOST
      remoteRef:
        key: insurance-system/production/database
        property: host
    - secretKey: DB_PASSWORD
      remoteRef:
        key: insurance-system/production/database
        property: password
```
