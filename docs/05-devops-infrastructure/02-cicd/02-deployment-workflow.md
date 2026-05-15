# Deployment Workflow - Quy Trình Triển Khai

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Deployment Method | GitOps (ArgoCD) + Canary |

---

## 1. Deployment Strategy Overview

### 1.1. Strategy Per Environment

| Environment | Strategy | Approval | Automated | Rollback |
|-------------|----------|----------|-----------|----------|
| Development | Direct deploy | None | Yes | Instant (redeploy) |
| Staging | Rolling update | None | Yes (on merge to develop) | Instant |
| UAT | Rolling update | QA Lead | Semi-auto | Manual trigger |
| Production | Canary (10% → 50% → 100%) | Tech Lead + PO | Manual trigger | Auto + Manual |

### 1.2. Deployment Windows

| Environment | Deployment Window | Blackout Periods |
|-------------|-------------------|-----------------|
| Development | Anytime | None |
| Staging | Business hours (Mon-Fri, 8AM-6PM) | None |
| Production | Tue-Thu, 10AM-4PM (VN time) | Fri-Mon, Holidays, Peak hours (6-9PM) |
| Hotfix (Production) | Anytime (emergency) | None (requires 2 approvals) |

---

## 2. Standard Deployment Process

### 2.1. Feature Deployment (Dev → Staging → Production)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STANDARD DEPLOYMENT FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Step 1: DEVELOP                                                         │
│  ──────────────────────────────────────────────────────────────────      │
│  Developer → feature/ABC-123 → PR → Code Review → Merge to develop      │
│                                                                           │
│  Step 2: STAGING DEPLOY (Automatic)                                      │
│  ──────────────────────────────────────────────────────────────────      │
│  merge develop → CI builds → Push image → ArgoCD auto-sync staging      │
│  │                                                                       │
│  ├── ✓ Health checks pass                                                │
│  ├── ✓ Smoke tests pass                                                  │
│  └── ✓ Integration tests pass                                            │
│                                                                           │
│  Step 3: QA VERIFICATION (Manual)                                        │
│  ──────────────────────────────────────────────────────────────────      │
│  QA Team verifies on staging (1-2 days)                                  │
│  │                                                                       │
│  ├── ✓ Functional testing                                                │
│  ├── ✓ Regression testing                                                │
│  └── ✓ Performance testing (if needed)                                   │
│                                                                           │
│  Step 4: PRODUCTION RELEASE (Manual Trigger)                             │
│  ──────────────────────────────────────────────────────────────────      │
│  Release Manager → Create release PR → develop → main                    │
│  │                                                                       │
│  ├── Approvals: Tech Lead + Product Owner                                │
│  ├── CI: Full pipeline passes                                            │
│  └── Merge → Tag version → Deploy                                        │
│                                                                           │
│  Step 5: CANARY DEPLOYMENT                                               │
│  ──────────────────────────────────────────────────────────────────      │
│  Phase 1: 10% traffic (10 min monitoring)                                │
│  Phase 2: 50% traffic (15 min monitoring)                                │
│  Phase 3: 100% traffic (full promotion)                                  │
│                                                                           │
│  Step 6: POST-DEPLOYMENT                                                 │
│  ──────────────────────────────────────────────────────────────────      │
│  Monitor for 30 min → Update status page → Notify stakeholders           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Deployment Checklist

#### Pre-Deployment (Before triggering)
- [ ] All CI checks pass (lint, test, security)
- [ ] Code review approved (min 2 reviewers for prod)
- [ ] QA sign-off on staging
- [ ] Database migrations reviewed (if any)
- [ ] Feature flags configured (if needed)
- [ ] Rollback plan documented
- [ ] Monitoring dashboards accessible
- [ ] On-call engineer identified
- [ ] No conflicting deployments in progress
- [ ] Deployment window confirmed

#### During Deployment
- [ ] Monitor error rates in Grafana
- [ ] Monitor latency metrics
- [ ] Check application logs for errors
- [ ] Verify health check endpoints
- [ ] Confirm canary metrics at each phase
- [ ] Communication in #deployments Slack channel

#### Post-Deployment
- [ ] All pods healthy (kubectl get pods)
- [ ] Smoke tests pass on production
- [ ] No spike in error rates (30 min observation)
- [ ] Database migrations completed successfully
- [ ] Cache warmed up (if applicable)
- [ ] Release notes published
- [ ] Stakeholders notified
- [ ] Monitoring alerts configured for new features

---

## 3. Database Migration Deployment

### 3.1. Migration Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE MIGRATION STRATEGY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Rule: Migrations MUST be backward compatible                    │
│  (App version N and N+1 must work with DB version N+1)          │
│                                                                   │
│  SAFE OPERATIONS:                                                │
│  ✓ Add new column (nullable or with default)                    │
│  ✓ Add new table                                                 │
│  ✓ Add new index (CONCURRENTLY)                                 │
│  ✓ Add new enum value                                            │
│                                                                   │
│  UNSAFE OPERATIONS (Require special handling):                   │
│  ✗ Drop column → Deprecate first, remove in next release        │
│  ✗ Rename column → Add new, migrate data, deprecate old         │
│  ✗ Change type → Add new column, migrate, swap                  │
│  ✗ Drop table → Ensure no references, backup first              │
│                                                                   │
│  DEPLOYMENT ORDER:                                               │
│  1. Deploy migration (expand phase)                              │
│  2. Deploy application code                                      │
│  3. Verify everything works                                      │
│  4. Deploy cleanup migration (contract phase) - next release     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. Migration Execution

```bash
# Migration runs as a Kubernetes Job before deployment
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-{{ .Release.Revision }}
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
        - name: migration
          image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
          command: ["npm", "run", "migration:run"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
      restartPolicy: Never
  backoffLimit: 3
```

---

## 4. Hotfix Deployment

### 4.1. Hotfix Process

```
┌────────────────────────────────────────────────────────────────────┐
│                    HOTFIX DEPLOYMENT FLOW                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ⚠️  TRIGGER: Critical bug in production                            │
│                                                                      │
│  Step 1: Create hotfix branch from main                             │
│  ───────────────────────────────────────                            │
│  git checkout main                                                   │
│  git checkout -b hotfix/fix-payment-bug                             │
│                                                                      │
│  Step 2: Fix + Test (expedited)                                     │
│  ───────────────────────────────────────                            │
│  • Write fix                                                         │
│  • Write regression test                                            │
│  • Local test pass                                                   │
│  • PR to main (fast-track review: 1 senior approval)                │
│                                                                      │
│  Step 3: Deploy to staging (verify)                                 │
│  ───────────────────────────────────────                            │
│  • Deploy to staging                                                 │
│  • Quick smoke test (5 min)                                         │
│  • QA confirms fix                                                   │
│                                                                      │
│  Step 4: Deploy to production                                       │
│  ───────────────────────────────────────                            │
│  • Merge to main                                                     │
│  • Direct deploy (skip canary for critical fixes)                   │
│  • Monitor closely for 15 min                                       │
│                                                                      │
│  Step 5: Post-hotfix                                                │
│  ───────────────────────────────────────                            │
│  • Cherry-pick fix back to develop                                   │
│  • Write post-mortem                                                 │
│  • Update runbook if needed                                          │
│                                                                      │
│  ⏱️  Target: Incident → Fix deployed < 2 hours                     │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2. Hotfix Approval Matrix

| Severity | Approvers | Deploy Window | Skip Canary? |
|----------|-----------|---------------|--------------|
| Critical (P1) | 1 Senior Dev + On-call Lead | Anytime | Yes |
| High (P2) | 1 Senior Dev + Tech Lead | Business hours | Optional |
| Medium (P3) | Follow standard process | Standard window | No |

---

## 5. Multi-Service Deployment

### 5.1. Coordinated Deployments

```
When multiple services need to be deployed together:

┌────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Scenario: API contract change (quote-service + product-service)    │
│                                                                      │
│  Step 1: Deploy CONSUMER first (quote-service)                      │
│          • Must handle both old and new API format                   │
│          • Feature flag: use_new_product_api = false                │
│                                                                      │
│  Step 2: Deploy PROVIDER (product-service)                          │
│          • New endpoint available                                    │
│          • Old endpoint still works (backward compatible)           │
│                                                                      │
│  Step 3: Enable feature flag                                        │
│          • use_new_product_api = true                                │
│          • Monitor for errors                                        │
│                                                                      │
│  Step 4: Cleanup (next release)                                     │
│          • Remove old endpoint from provider                        │
│          • Remove feature flag from consumer                        │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2. Deployment Dependencies

| Service | Depends On | Deploy Order |
|---------|-----------|-------------|
| auth-service | None (independent) | 1 (first) |
| product-service | auth-service | 2 |
| quote-service | product-service, auth-service | 3 |
| policy-service | auth-service, payment-service | 3 |
| payment-service | auth-service | 2 |
| claims-service | policy-service, document-service | 4 |
| notification-service | None (independent) | Any |
| document-service | auth-service | 2 |
| integration-service | All (external gateway) | Last |

---

## 6. Feature Flags

### 6.1. Feature Flag Strategy

| Flag Type | Scope | Lifetime | Example |
|-----------|-------|----------|---------|
| Release flag | Per feature | Until 100% rollout | `enable_new_claims_flow` |
| Ops flag | System-wide | Permanent | `enable_rate_limiting` |
| Experiment flag | Per user segment | Until experiment concludes | `show_ai_recommendation` |
| Kill switch | System-wide | Permanent | `disable_external_payments` |

### 6.2. Gradual Rollout

```
Feature: New Claims Flow
─────────────────────────

Day 1:  enable_new_claims_flow = 0%    (internal only)
Day 3:  enable_new_claims_flow = 5%    (beta users)
Day 5:  enable_new_claims_flow = 25%   (monitor metrics)
Day 7:  enable_new_claims_flow = 50%   (larger sample)
Day 10: enable_new_claims_flow = 100%  (full rollout)
Day 14: Remove flag, clean up old code
```

---

## 7. Deployment Monitoring

### 7.1. Key Metrics During Deployment

| Metric | Source | Normal | Alert Threshold |
|--------|--------|--------|-----------------|
| Error rate (5xx) | ALB + App | < 0.1% | > 1% |
| Latency P95 | App metrics | < 500ms | > 2000ms |
| CPU usage | Node/Pod | < 60% | > 85% |
| Memory usage | Node/Pod | < 70% | > 90% |
| Request rate | ALB | Baseline ± 20% | Drop > 50% |
| Pod restarts | Kubernetes | 0 | > 2 in 5 min |
| Health checks | K8s probes | All pass | Any failure |

### 7.2. Deployment Dashboard

```
Grafana Dashboard: "Deployment Monitor"
─────────────────────────────────────────

Row 1: Traffic Overview
├── Request rate (per service)
├── Error rate (4xx, 5xx)
└── Latency distribution (p50, p95, p99)

Row 2: Infrastructure
├── CPU utilization (per node, per pod)
├── Memory utilization
└── Network I/O

Row 3: Application Health
├── Pod status (Running, Pending, Failed)
├── Deployment progress (replicas ready)
└── Health check results

Row 4: Business Metrics
├── Successful transactions
├── Payment success rate
└── Quote generation rate
```
