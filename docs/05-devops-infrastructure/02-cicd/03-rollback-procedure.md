# Rollback Procedure - Quy Trình Rollback

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Mục đích | Hướng dẫn rollback khi deployment gặp vấn đề |

---

## 1. Khi Nào Cần Rollback

### 1.1. Rollback Triggers (Tự động)

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Error rate spike | > 5% trong 2 phút | Auto-rollback canary |
| Latency spike | P95 > 3s trong 5 phút | Auto-rollback canary |
| Health check failure | > 3 consecutive failures | Auto-rollback pod |
| Pod crash loop | > 3 restarts trong 5 phút | Auto-rollback deployment |
| Memory OOM | Pod killed by OOM | Auto-rollback + alert |

### 1.2. Rollback Triggers (Thủ công)

| Situation | Decision Maker | SLA |
|-----------|---------------|-----|
| Data corruption detected | Tech Lead | Immediate |
| Business logic error (wrong calculations) | Product Owner + Tech Lead | < 15 min |
| Security vulnerability discovered | Security Lead | Immediate |
| Significant UX degradation | Product Owner | < 30 min |
| Third-party integration broken | On-call engineer | < 15 min |

---

## 2. Rollback Methods

### 2.1. Method 1: ArgoCD Rollback (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│               ArgoCD ROLLBACK (Fastest - < 2 min)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Option A: UI Rollback                                           │
│  ─────────────────────                                           │
│  1. Open ArgoCD UI → Applications → Select app                  │
│  2. Click "History and Rollback"                                 │
│  3. Select previous healthy revision                             │
│  4. Click "Rollback"                                             │
│  5. Confirm rollback                                             │
│                                                                   │
│  Option B: CLI Rollback                                          │
│  ─────────────────────                                           │
│  $ argocd app rollback <app-name> <revision>                    │
│                                                                   │
│  Example:                                                        │
│  $ argocd app history auth-service-production                   │
│  $ argocd app rollback auth-service-production 5                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Method 2: Kubernetes Rollback

```bash
# Xem deployment history
kubectl rollout history deployment/auth-service -n production

# Rollback to previous revision
kubectl rollout undo deployment/auth-service -n production

# Rollback to specific revision
kubectl rollout undo deployment/auth-service -n production --to-revision=3

# Check rollback status
kubectl rollout status deployment/auth-service -n production

# Verify pods are running with old image
kubectl get pods -n production -l app=auth-service -o jsonpath='{.items[*].spec.containers[*].image}'
```

### 2.3. Method 3: Git Revert (GitOps)

```bash
# Revert the last commit on deployment repo
git revert HEAD --no-edit
git push origin main

# ArgoCD will detect change and sync automatically (staging)
# For production: manually sync in ArgoCD

# Verify:
argocd app get auth-service-production
```

### 2.4. Method 4: Image Tag Rollback

```bash
# Update Helm values to previous image tag
# In deploy/helm/values-production.yaml:
# Change: image.tag: "abc123new" → image.tag: "xyz789old"

# Commit and push
git commit -am "rollback: revert auth-service to xyz789old"
git push origin main

# Trigger ArgoCD sync
argocd app sync auth-service-production
```

---

## 3. Rollback Procedures By Scenario

### 3.1. Scenario A: Application Code Bug

```
┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO: Application code bug detected after deployment           │
│  SEVERITY: High                                                      │
│  TIME TO ROLLBACK: < 5 minutes                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: ASSESS (30 seconds)                                        │
│  ├── Confirm issue is caused by new deployment                      │
│  ├── Check error logs: kubectl logs -l app=<service> --tail=100    │
│  └── Determine affected scope (single service? multiple?)           │
│                                                                      │
│  Step 2: COMMUNICATE (30 seconds)                                   │
│  ├── Post in #incidents: "Initiating rollback for <service>"        │
│  └── Page on-call if not already aware                              │
│                                                                      │
│  Step 3: ROLLBACK (2 minutes)                                       │
│  ├── ArgoCD UI: Rollback to previous revision                       │
│  ├── OR: kubectl rollout undo deployment/<service> -n production    │
│  └── Wait for rollout to complete                                   │
│                                                                      │
│  Step 4: VERIFY (2 minutes)                                         │
│  ├── Check pod status: kubectl get pods -n production               │
│  ├── Check logs: no more errors                                      │
│  ├── Check metrics: error rate dropping                             │
│  └── Hit health endpoint: curl https://api.../health                │
│                                                                      │
│  Step 5: POST-ROLLBACK                                              │
│  ├── Update #incidents: "Rollback complete, service restored"       │
│  ├── Revert the deploy commit in deployment repo                    │
│  ├── Create bug ticket for the issue                                │
│  └── Schedule post-mortem if P1/P2                                  │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2. Scenario B: Database Migration Failure

```
┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO: Database migration caused data issues                     │
│  SEVERITY: Critical                                                  │
│  TIME TO ROLLBACK: 10-30 minutes (complex)                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: STOP THE BLEEDING (Immediate)                              │
│  ├── Scale down affected service to 0 replicas                      │
│  │   kubectl scale deployment/<service> --replicas=0 -n production  │
│  ├── Enable maintenance mode (if available)                          │
│  └── Post in #incidents: "Service down, investigating DB issue"     │
│                                                                      │
│  Step 2: ASSESS DAMAGE                                              │
│  ├── Check migration status: which migrations ran?                  │
│  ├── Check if data was modified/corrupted                           │
│  ├── Determine if rollback migration exists                         │
│  └── Evaluate: Can we rollback DB? Or restore from backup?          │
│                                                                      │
│  Step 3a: ROLLBACK MIGRATION (If reversible)                        │
│  ├── Run down migration:                                             │
│  │   npm run migration:revert                                        │
│  ├── Verify database state                                          │
│  ├── Rollback application code (Method 1 or 2)                      │
│  └── Scale service back up                                          │
│                                                                      │
│  Step 3b: RESTORE FROM BACKUP (If irreversible)                     │
│  ├── Identify last good backup (Aurora point-in-time)               │
│  │   aws rds restore-db-cluster-to-point-in-time \                  │
│  │     --source-db-cluster-identifier insurance-prod \               │
│  │     --db-cluster-identifier insurance-prod-restored \             │
│  │     --restore-to-time "2026-05-15T10:00:00Z"                    │
│  ├── Verify restored data integrity                                  │
│  ├── Switch connection string to restored instance                  │
│  ├── Rollback application code                                      │
│  └── Scale service back up                                          │
│                                                                      │
│  Step 4: VERIFY                                                      │
│  ├── Run data integrity checks                                      │
│  ├── Verify application functionality                                │
│  └── Check for any data loss (RPO assessment)                       │
│                                                                      │
│  Step 5: POST-INCIDENT                                              │
│  ├── Mandatory post-mortem                                          │
│  ├── Review migration process                                        │
│  ├── Consider: should we add migration dry-run step?                │
│  └── Update runbook with lessons learned                            │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 3.3. Scenario C: Infrastructure/Config Issue

```
┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO: ConfigMap/Secret change caused failures                   │
│  SEVERITY: High                                                      │
│  TIME TO ROLLBACK: < 5 minutes                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: Identify the config change                                 │
│  ├── kubectl get configmap <name> -n production -o yaml            │
│  ├── Check ArgoCD history for config changes                        │
│  └── git log deploy/helm/ (check recent commits)                    │
│                                                                      │
│  Step 2: Revert config                                              │
│  ├── Option A: Revert in git → ArgoCD syncs                        │
│  ├── Option B: kubectl edit configmap (temporary, not GitOps)       │
│  └── Restart affected pods:                                          │
│      kubectl rollout restart deployment/<service> -n production     │
│                                                                      │
│  Step 3: Verify                                                      │
│  ├── Pods restarted with correct config                             │
│  ├── Service functioning normally                                    │
│  └── Sync git state if manual fix was applied                       │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Automated Rollback Configuration

### 4.1. ArgoCD Auto-Rollback

```yaml
# Argo Rollout with automatic rollback
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: auth-service
  namespace: production
spec:
  replicas: 4
  strategy:
    canary:
      canaryService: auth-service-canary
      stableService: auth-service-stable
      steps:
        - setWeight: 10
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 15m }
        - setWeight: 100
      analysis:
        templates:
          - templateName: success-rate
          - templateName: latency-check
        startingStep: 1
      antiAffinity:
        requiredDuringSchedulingIgnoredDuringExecution: {}
  revisionHistoryLimit: 5

---
# Analysis Template - Success Rate
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  metrics:
    - name: success-rate
      interval: 1m
      count: 10
      successCondition: result[0] >= 0.99
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{service="auth-service",status=~"2.."}[5m]))
            /
            sum(rate(http_requests_total{service="auth-service"}[5m]))

---
# Analysis Template - Latency
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: latency-check
spec:
  metrics:
    - name: p95-latency
      interval: 1m
      count: 10
      successCondition: result[0] <= 500
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            histogram_quantile(0.95,
              sum(rate(http_request_duration_ms_bucket{service="auth-service"}[5m]))
              by (le)
            )
```

### 4.2. Kubernetes Rollback Configuration

```yaml
# Deployment with rollback settings
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  revisionHistoryLimit: 10  # Keep 10 revisions for rollback
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0  # Zero downtime
  template:
    spec:
      containers:
        - name: auth-service
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3  # 3 failures → restart
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3  # 3 failures → remove from LB
          startupProbe:
            httpGet:
              path: /health/live
              port: 3000
            failureThreshold: 30
            periodSeconds: 2  # 60s max startup time
```

---

## 5. Rollback Communication

### 5.1. Communication Template

```
┌────────────────────────────────────────────────────────────────────┐
│  SLACK: #incidents                                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔴 ROLLBACK INITIATED                                              │
│  ─────────────────────                                              │
│  Service: auth-service                                              │
│  Environment: Production                                            │
│  Reason: Elevated 5xx error rate (3.2%) after deployment            │
│  From version: v1.5.2 (abc123)                                      │
│  To version: v1.5.1 (xyz789)                                       │
│  Initiated by: @engineer-name                                       │
│  Time: 2026-05-15 14:32 UTC+7                                      │
│  Status: In Progress                                                │
│                                                                      │
│  ─────────────────────                                              │
│                                                                      │
│  🟢 ROLLBACK COMPLETE                                               │
│  ─────────────────────                                              │
│  Service: auth-service                                              │
│  Duration: 3 minutes                                                │
│  Current version: v1.5.1 (xyz789)                                  │
│  Status: Healthy ✓                                                  │
│  Impact: ~200 requests affected (30s window)                        │
│  Next steps: Bug fix in progress (JIRA-1234)                       │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2. Escalation Matrix

| Time Since Issue | Action | Who |
|-----------------|--------|-----|
| 0 min | Detect & assess | On-call engineer |
| 2 min | Decide rollback | On-call engineer |
| 5 min | If not resolved, escalate | → Tech Lead |
| 10 min | If not resolved, page leadership | → Engineering Manager |
| 15 min | If not resolved, consider full incident | → Incident Commander |
| 30 min | Status page update (if customer-facing) | → Communications |

---

## 6. Post-Rollback Actions

### 6.1. Immediate Actions (Within 1 hour)

- [ ] Verify system is stable (all metrics normal)
- [ ] Document what happened (timeline)
- [ ] Create JIRA ticket for the root cause
- [ ] Disable any feature flags related to the failed deployment
- [ ] Notify affected stakeholders

### 6.2. Follow-up Actions (Within 24 hours)

- [ ] Conduct post-mortem (for P1/P2 incidents)
- [ ] Fix the root cause
- [ ] Add regression test
- [ ] Update deployment checklist if process gap identified
- [ ] Re-deploy fix through normal process (staging → prod)

### 6.3. Post-Mortem Template

```markdown
# Post-Mortem: [Service] Rollback - [Date]

## Summary
Brief description of what happened.

## Timeline
- HH:MM - Deployment started
- HH:MM - Issue detected (how?)
- HH:MM - Rollback initiated
- HH:MM - Rollback complete
- HH:MM - System stable confirmed

## Impact
- Duration: X minutes
- Users affected: ~N
- Revenue impact: $X (if applicable)
- Data loss: None / Description

## Root Cause
What caused the issue?

## What Went Well
- Fast detection
- Rollback process worked

## What Went Wrong
- Missing test coverage for edge case
- ...

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add integration test for X | @dev | 2026-05-20 | TODO |
| Update deploy checklist | @devops | 2026-05-17 | TODO |

## Lessons Learned
Key takeaways for the team.
```
