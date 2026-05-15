# Incident Response Runbook

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Mục đích | Hướng dẫn xử lý sự cố (incident response) |

---

## 1. Incident Classification

### 1.1. Severity Matrix

| Severity | Impact | Examples | Response Time | Resolution Target |
|----------|--------|----------|---------------|-------------------|
| **SEV-1 (Critical)** | System down, data loss, security breach | All services down, payment processing failed, data breach | 5 min | 1 hour |
| **SEV-2 (High)** | Major feature impacted, degraded performance | Login broken, claims cannot submit, slow responses | 15 min | 4 hours |
| **SEV-3 (Medium)** | Minor feature impacted, workaround available | Email notifications delayed, search slow | 1 hour | 24 hours |
| **SEV-4 (Low)** | Cosmetic, no user impact | Dashboard typo, minor UI glitch | Next business day | 72 hours |

### 1.2. On-Call Rotation

| Role | Responsibility | Escalation |
|------|---------------|-----------|
| On-call Engineer (Primary) | First responder, initial triage | → Secondary on-call |
| On-call Engineer (Secondary) | Backup, help with complex issues | → Tech Lead |
| Tech Lead | Architecture decisions, escalation | → Engineering Manager |
| Engineering Manager | Resource allocation, communication | → CTO |
| Incident Commander | Overall coordination (SEV-1 only) | → CTO |

---

## 2. Incident Response Process

### 2.1. Overall Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INCIDENT RESPONSE LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ DETECT   │─▶│ TRIAGE   │─▶│ RESPOND  │─▶│ RESOLVE  │─▶│ REVIEW  │ │
│  │          │  │          │  │          │  │          │  │         │ │
│  │• Alert   │  │• Classify│  │• Mitigate│  │• Fix root│  │• Post-  │ │
│  │• Report  │  │• Assign  │  │• Contain │  │  cause   │  │  mortem │ │
│  │• Monitor │  │• Communi-│  │• Diagnose│  │• Verify  │  │• Action │ │
│  │          │  │  cate    │  │          │  │• Deploy  │  │  items  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                                           │
│  Timeline:                                                               │
│  ├── 0-5 min: Detect & Triage                                           │
│  ├── 5-15 min: Initial response & communication                         │
│  ├── 15-60 min: Active investigation & mitigation                       │
│  ├── 1-4 hours: Root cause fix (SEV-1/2)                                │
│  └── 24-48 hours: Post-mortem & follow-up                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Step-by-Step Response

#### Phase 1: DETECT (0-5 minutes)

```
┌────────────────────────────────────────────────────────────────┐
│  1. Alert received (PagerDuty/Slack/Phone)                      │
│  2. Acknowledge alert within 5 minutes                          │
│  3. Open incident channel: #inc-YYYY-MM-DD-<short-description> │
│  4. Initial assessment:                                         │
│     • What service is affected?                                 │
│     • What is the user impact?                                  │
│     • When did it start?                                        │
│     • Was there a recent deployment?                            │
└────────────────────────────────────────────────────────────────┘
```

#### Phase 2: TRIAGE (5-15 minutes)

```
┌────────────────────────────────────────────────────────────────┐
│  1. Assign severity level (SEV-1 to SEV-4)                      │
│  2. For SEV-1/2: Assign Incident Commander                      │
│  3. Post initial update:                                        │
│     "[INC] SEV-X: <description>                                 │
│      Impact: <what users experience>                            │
│      Status: Investigating                                      │
│      Next update: in 15 minutes"                                │
│  4. Check recent changes:                                       │
│     • git log --oneline -10 (each service)                     │
│     • ArgoCD: recent syncs                                      │
│     • AWS Console: recent changes                               │
│  5. Decide: Rollback immediately or investigate?                │
└────────────────────────────────────────────────────────────────┘
```

#### Phase 3: RESPOND & MITIGATE (15-60 minutes)

```
┌────────────────────────────────────────────────────────────────┐
│  1. Mitigate user impact (priority over root cause):            │
│     • Rollback if deployment-related                            │
│     • Enable circuit breaker for external deps                  │
│     • Scale up if capacity issue                                │
│     • Failover to DR if region issue                           │
│                                                                  │
│  2. Diagnose root cause:                                        │
│     • Check dashboards (Grafana)                                │
│     • Check logs (Kibana)                                       │
│     • Check traces (X-Ray)                                      │
│     • Check infrastructure (CloudWatch, kubectl)                │
│                                                                  │
│  3. Communicate updates every 15 min (SEV-1) or 30 min (SEV-2) │
│                                                                  │
│  4. Engage additional help if needed                            │
│     • Database issue → DBA/Backend Senior                       │
│     • Network issue → DevOps Senior                             │
│     • Security issue → Security team                            │
│     • External API → Contact vendor                             │
└────────────────────────────────────────────────────────────────┘
```

#### Phase 4: RESOLVE (Variable)

```
┌────────────────────────────────────────────────────────────────┐
│  1. Implement fix (hotfix or workaround)                        │
│  2. Deploy fix through expedited pipeline                       │
│  3. Verify fix:                                                 │
│     • Error rate back to normal                                 │
│     • Latency back to normal                                    │
│     • Affected functionality working                            │
│     • No secondary issues                                       │
│                                                                  │
│  4. Monitor for 30 minutes post-fix                             │
│                                                                  │
│  5. Declare incident resolved:                                  │
│     "[INC RESOLVED] SEV-X: <description>                        │
│      Root cause: <brief>                                        │
│      Fix: <what was done>                                       │
│      Duration: X hours Y minutes                                │
│      Impact: <summary>                                          │
│      Post-mortem: scheduled for <date>"                         │
│                                                                  │
│  6. Close PagerDuty incident                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Common Runbooks

### 3.1. Runbook: Service Down (All pods failing)

```
ALERT: ServiceDown
SEVERITY: Critical
IMPACT: Service completely unavailable

DIAGNOSIS:
─────────────────────────────────────────────────────────
1. Check pod status:
   $ kubectl get pods -n production -l app=<service>
   $ kubectl describe pod <pod-name> -n production

2. Check recent events:
   $ kubectl get events -n production --sort-by='.lastTimestamp' | head -20

3. Check logs:
   $ kubectl logs -l app=<service> -n production --tail=100

4. Check if deployment is in progress:
   $ kubectl rollout status deployment/<service> -n production

RESOLUTION STEPS:
─────────────────────────────────────────────────────────
A) If OOMKilled (memory):
   → Increase memory limit in Helm values
   → Deploy fix: argocd app sync <app>

B) If CrashLoopBackOff (app error):
   → Check logs for startup error
   → If config issue: fix ConfigMap/Secret
   → If code issue: rollback deployment
     $ kubectl rollout undo deployment/<service> -n production

C) If ImagePullBackOff:
   → Check ECR image exists: aws ecr describe-images ...
   → Check ECR credentials: kubectl get secret regcred -n production
   → Re-tag and push image if corrupted

D) If node capacity issue:
   → Check node resources: kubectl top nodes
   → Scale node group: eksctl scale nodegroup ...
   → Or delete stuck pods: kubectl delete pod <pod> --force

VERIFY:
─────────────────────────────────────────────────────────
$ kubectl get pods -n production -l app=<service>  # All Running
$ curl https://api.insurance-system.vn/health      # 200 OK
$ Check Grafana: error rate returning to 0
```

### 3.2. Runbook: Database Connection Exhausted

```
ALERT: DatabaseConnectionsHigh
SEVERITY: Critical
IMPACT: Services cannot connect to database, requests failing

DIAGNOSIS:
─────────────────────────────────────────────────────────
1. Check current connections:
   $ kubectl exec -it <postgres-client-pod> -- psql -c "
     SELECT count(*), state, usename, application_name
     FROM pg_stat_activity
     GROUP BY state, usename, application_name
     ORDER BY count DESC;"

2. Check for long-running queries:
   $ kubectl exec -it <postgres-client-pod> -- psql -c "
     SELECT pid, now() - pg_stat_activity.query_start AS duration,
            query, state
     FROM pg_stat_activity
     WHERE state != 'idle'
     ORDER BY duration DESC
     LIMIT 10;"

3. Check connection pool metrics in Grafana:
   Dashboard: Database → Connection Pool panel

RESOLUTION STEPS:
─────────────────────────────────────────────────────────
A) Kill idle connections (immediate relief):
   $ psql -c "
     SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE state = 'idle'
     AND query_start < now() - interval '10 minutes';"

B) Kill long-running queries:
   $ psql -c "SELECT pg_terminate_backend(<pid>);"

C) Increase max connections (if consistently maxed):
   → Update RDS parameter group: max_connections = 500
   → Note: Requires reboot (schedule maintenance)

D) Fix application connection leak:
   → Check if a service has connection leak
   → Restart affected service:
     $ kubectl rollout restart deployment/<service> -n production

E) Scale read replicas (if read-heavy):
   → Add Aurora read replica via AWS Console/Terraform

VERIFY:
─────────────────────────────────────────────────────────
$ Check pg_stat_activity: connections within normal range
$ Check Grafana: connection pool stabilized
$ Check application logs: no connection errors
```

### 3.3. Runbook: High Latency

```
ALERT: HighLatency_Critical
SEVERITY: Critical
IMPACT: Users experiencing slow response times

DIAGNOSIS:
─────────────────────────────────────────────────────────
1. Identify slow service(s):
   → Grafana: Service Detail dashboard → Latency panel
   → Which service has highest latency?

2. Check if external API is slow:
   → Grafana: External API Duration panel
   → If external API: contact provider, enable cache fallback

3. Check database performance:
   → RDS Performance Insights
   → Check for table locks, slow queries

4. Check resource saturation:
   → kubectl top pods -n production
   → kubectl top nodes
   → CPU/Memory near limits?

5. Check network:
   → Cross-AZ traffic increased?
   → NAT Gateway throughput?

RESOLUTION STEPS:
─────────────────────────────────────────────────────────
A) If CPU saturation:
   → Scale up pods: kubectl scale deployment/<service> --replicas=<N>
   → Or trigger HPA: verify HPA is working

B) If database slow:
   → Identify and kill long queries
   → Add missing index (if identified)
   → Failover to read replica for read-heavy queries

C) If external API slow:
   → Increase timeout temporarily
   → Enable cached responses (fallback)
   → Circuit breaker: stop calling if > 50% timeout

D) If memory pressure (GC pauses):
   → Increase memory limits
   → Restart pods to clear memory:
     $ kubectl rollout restart deployment/<service>

E) If Redis slow:
   → Check Redis memory (eviction happening?)
   → Check big keys: redis-cli --bigkeys
   → Clear unnecessary cache if memory full

VERIFY:
─────────────────────────────────────────────────────────
$ Check Grafana: P95 latency back to < 500ms
$ Test key endpoints: curl -w "%{time_total}" https://api.../health
```

### 3.4. Runbook: Payment Gateway Failure

```
ALERT: PaymentFailureRateHigh
SEVERITY: High
IMPACT: Users cannot complete purchases

DIAGNOSIS:
─────────────────────────────────────────────────────────
1. Check which payment gateway is failing:
   → Grafana: External API panel → filter by provider
   → VNPay? Momo? ZaloPay? Bank transfer?

2. Check payment service logs:
   $ kubectl logs -l app=payment-service -n production --tail=200 | grep error

3. Check gateway status page:
   → VNPay: https://sandbox.vnpayment.vn/status
   → Momo: contact support
   → Check provider's Slack/email for notifications

4. Verify: Is it our side or provider side?
   → Try manual API call to gateway (using curl/Postman)

RESOLUTION STEPS:
─────────────────────────────────────────────────────────
A) If provider is down:
   → Enable fallback payment method in UI
   → Disable affected gateway in config (feature flag)
   → Notify customer support team
   → Post user-facing message: "Phương thức X tạm gián đoạn"

B) If our integration code broken:
   → Check recent deployment to payment-service
   → Rollback if recently deployed
   → Check if API key expired → rotate in Secrets Manager

C) If timeout issues:
   → Increase timeout for gateway calls
   → Implement retry with exponential backoff
   → Enable queued payment processing

D) If certificate issue:
   → Check TLS cert: openssl s_client -connect gateway:443
   → Renew certificate if expired

VERIFY:
─────────────────────────────────────────────────────────
$ Test payment flow end-to-end (staging first, then prod)
$ Check Grafana: payment success rate recovering
$ Check pending payments: any stuck transactions?
$ Reconcile: any payments charged but not confirmed?
```

### 3.5. Runbook: Security Breach Detected

```
ALERT: Security alert from GuardDuty / WAF
SEVERITY: Critical (SEV-1)
IMPACT: Potential data exposure

IMMEDIATE ACTIONS (First 5 minutes):
─────────────────────────────────────────────────────────
1. DO NOT PANIC - Follow the process
2. Page Security Lead immediately
3. Create private incident channel: #inc-security-YYYY-MM-DD
4. Limit information to need-to-know basis

CONTAINMENT:
─────────────────────────────────────────────────────────
A) If compromised credentials detected:
   → Rotate affected secrets immediately
   → Revoke all active sessions for affected users
   → Enable enhanced logging

B) If unauthorized access to data:
   → Block source IP in WAF immediately
   → Revoke compromised API keys
   → Check audit logs: what was accessed?

C) If malware/unauthorized code:
   → Isolate affected pods/nodes
   → Do NOT delete - preserve for forensics
   → Deploy clean version to new pods

D) If DDoS attack:
   → AWS Shield auto-mitigates
   → Enable rate limiting rules in WAF
   → Scale up infrastructure if needed
   → Consider Cloudflare as additional layer

INVESTIGATION:
─────────────────────────────────────────────────────────
1. Gather evidence (DO NOT MODIFY):
   → CloudTrail logs (API calls)
   → VPC Flow Logs (network activity)
   → Application audit logs
   → WAF logs (blocked/allowed requests)

2. Determine scope:
   → What data was potentially exposed?
   → How many users affected?
   → What is the attack vector?

3. Legal & Compliance:
   → Notify Legal team (PDPA breach notification: 72 hours)
   → Document everything for regulatory report
   → Preserve all logs and evidence

POST-INCIDENT:
─────────────────────────────────────────────────────────
1. Mandatory post-mortem within 24 hours
2. Notify affected users (if data breach confirmed)
3. File regulatory report if required (PDPA)
4. Implement additional security controls
5. Conduct security audit
```

---

## 4. Communication Templates

### 4.1. Internal Status Updates

```
┌─ INCIDENT UPDATE ─────────────────────────────────┐
│                                                     │
│  Incident: #INC-2026-0515-001                      │
│  Severity: SEV-2                                   │
│  Status: INVESTIGATING → MITIGATING → RESOLVED    │
│                                                     │
│  Impact:                                           │
│  • Claims submission returning 500 errors          │
│  • ~15% of claim submissions affected             │
│  • Started: 14:22 UTC+7                           │
│                                                     │
│  Current Status:                                   │
│  • Root cause identified: DB connection pool leak  │
│  • Mitigation: Restarting claims-service pods      │
│  • ETA for full resolution: 30 minutes            │
│                                                     │
│  Next Update: 15:00 UTC+7                          │
│  Commander: @tech-lead                             │
│                                                     │
└────────────────────────────────────────────────────┘
```

### 4.2. External Status Page Update

```
[Status Page - insurance-system.vn/status]

Title: Claims submission experiencing issues
Impact: Minor (partial service degradation)
Components affected: Claims Portal

Timeline:
14:22 - Investigating: We are investigating reports of errors
        when submitting insurance claims.
14:35 - Identified: Root cause has been identified.
        Our team is implementing a fix.
14:50 - Monitoring: Fix has been deployed.
        We are monitoring the situation.
15:05 - Resolved: The issue has been resolved.
        Claims submission is working normally.
        We apologize for the inconvenience.
```

---

## 5. Post-Incident Review

### 5.1. Post-Mortem Schedule

| Severity | Post-mortem required? | Deadline | Participants |
|----------|----------------------|----------|-------------|
| SEV-1 | Yes (mandatory) | Within 24 hours | Full team + management |
| SEV-2 | Yes (mandatory) | Within 48 hours | Involved engineers + TL |
| SEV-3 | Optional | Within 1 week | Involved engineers |
| SEV-4 | No | N/A | N/A |

### 5.2. Blameless Post-Mortem Culture

```
RULES:
─────────────────────────────────────────────────────────
✓ Focus on SYSTEMS and PROCESSES, not individuals
✓ Ask "How can we prevent this?" not "Who caused this?"
✓ Celebrate good incident response behavior
✓ Share findings openly with the team
✓ Track action items to completion

QUESTIONS TO ANSWER:
─────────────────────────────────────────────────────────
1. What happened? (factual timeline)
2. What was the impact? (users, revenue, data)
3. How was it detected? (alert? user report? monitoring?)
4. How was it resolved?
5. What went well in the response?
6. What could be improved?
7. What are the follow-up action items?
8. How do we prevent recurrence?
```
