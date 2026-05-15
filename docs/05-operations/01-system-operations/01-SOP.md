# Standard Operating Procedure (SOP)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |
| Phê duyệt | Pending |

---

## 1. Mục đích (Purpose)

Tài liệu này mô tả các quy trình vận hành chuẩn (Standard Operating Procedures) cho hệ thống Insurance System, đảm bảo tính nhất quán, chất lượng và hiệu quả trong việc vận hành hệ thống hàng ngày.

### 1.1. Phạm vi áp dụng

- Đội vận hành hệ thống (DevOps/SRE)
- Đội phát triển (Development Team)
- Đội hỗ trợ kỹ thuật (Technical Support)
- Quản lý kỹ thuật (Engineering Management)

### 1.2. Định nghĩa & Từ viết tắt

| Thuật ngữ | Giải thích |
|-----------|-----------|
| SOP | Standard Operating Procedure |
| SLA | Service Level Agreement |
| SLO | Service Level Objective |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |
| MTTR | Mean Time To Recovery |
| MTTD | Mean Time To Detect |
| P1/P2/P3/P4 | Mức độ ưu tiên sự cố (Priority levels) |
| DR | Disaster Recovery |
| HA | High Availability |

---

## 2. Quy trình vận hành hàng ngày (Daily Operations)

### 2.1. Morning Check (08:00 - 08:30)

**Mục đích**: Kiểm tra tổng quan sức khỏe hệ thống đầu ngày.

| # | Task | Tool/Method | Responsible | Escalation |
|---|------|-------------|-------------|------------|
| 1 | Kiểm tra dashboard monitoring | Grafana/DataDog | On-call Engineer | Team Lead nếu có anomaly |
| 2 | Review overnight alerts | PagerDuty/Slack | On-call Engineer | Immediate nếu P1/P2 |
| 3 | Kiểm tra system health endpoints | Health check URLs | On-call Engineer | DevOps Lead |
| 4 | Review error rates (last 12h) | ELK/CloudWatch | On-call Engineer | Team Lead nếu > threshold |
| 5 | Kiểm tra disk usage / DB connections | Monitoring tools | On-call Engineer | Immediate nếu > 85% |
| 6 | Review pending deployments | CI/CD Pipeline | Release Manager | - |
| 7 | Cập nhật daily standup notes | Confluence/Notion | On-call Engineer | - |

**Checklist Morning Check:**

```
□ All services UP (green status)
□ Error rate < 0.1% (last 12h)
□ Response time p95 < 500ms
□ CPU usage < 70% all nodes
□ Memory usage < 80% all nodes
□ Disk usage < 75% all volumes
□ DB connections < 80% pool size
□ Queue depth normal (< 1000 messages)
□ SSL certificates valid (> 30 days)
□ No critical/high alerts unacknowledged
□ Backup jobs completed successfully
□ Cron jobs ran successfully
```

### 2.2. Continuous Monitoring (24/7)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: Infrastructure (Every 30s)                             │
│  ├── CPU, Memory, Disk, Network                                  │
│  ├── Container health                                            │
│  └── Node availability                                           │
│                                                                   │
│  Layer 2: Application (Every 1m)                                 │
│  ├── API response times                                          │
│  ├── Error rates per service                                     │
│  ├── Request throughput                                          │
│  └── Business transaction success rates                          │
│                                                                   │
│  Layer 3: Business Metrics (Every 5m)                            │
│  ├── Policy issuance rate                                        │
│  ├── Payment success rate                                        │
│  ├── Quote generation rate                                       │
│  └── Claims submission rate                                      │
│                                                                   │
│  Layer 4: External Dependencies (Every 1m)                       │
│  ├── Payment gateway status                                      │
│  ├── Insurer API availability                                    │
│  ├── eKYC service status                                         │
│  └── Email/SMS provider status                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3. Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU Usage | > 70% (5m) | > 90% (2m) | Scale up / Investigate |
| Memory Usage | > 75% (5m) | > 90% (2m) | Restart / Scale |
| Disk Usage | > 75% | > 85% | Cleanup / Expand |
| API Error Rate | > 1% (5m) | > 5% (2m) | Investigate / Rollback |
| API Latency (p95) | > 500ms (5m) | > 2s (2m) | Scale / Investigate |
| DB Connections | > 70% pool | > 85% pool | Connection leak check |
| Queue Depth | > 5000 | > 10000 | Scale consumers |
| Payment Success | < 95% (15m) | < 90% (5m) | Check gateway / Alert |
| Certificate Expiry | < 30 days | < 7 days | Renew immediately |

---

## 3. Quy trình triển khai (Deployment SOP)

### 3.1. Deployment Types

| Type | Frequency | Approval | Downtime | Rollback |
|------|-----------|----------|----------|----------|
| Hotfix (P1 bug) | As needed | CTO + Team Lead | 0 (rolling) | Immediate |
| Patch Release | Weekly (Tue/Thu) | Team Lead | 0 (rolling) | < 5 min |
| Minor Release | Bi-weekly | Product + Tech Lead | 0 (blue-green) | < 10 min |
| Major Release | Monthly/Quarterly | CTO + Product | Maintenance window | DR plan |

### 3.2. Standard Deployment Process

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                                  │
│                                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │  Code   │─▶│  Build  │─▶│  Test   │─▶│ Staging │─▶│  Prod   │  │
│  │ Merged  │  │  & Scan │  │ (Auto)  │  │ Deploy  │  │ Deploy  │  │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │
│       │            │            │            │            │           │
│       ▼            ▼            ▼            ▼            ▼           │
│  PR approved  Docker build  Unit tests   Smoke tests  Canary →      │
│  to main      SAST scan    Integration  Load test    Rolling →      │
│               Dependency   E2E tests    Manual QA    Full deploy    │
│               audit        Coverage                                   │
│                                                                         │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3. Pre-Deployment Checklist

```
□ All CI tests passing (unit, integration, e2e)
□ Code review approved (≥ 2 reviewers)
□ Security scan passed (no critical/high findings)
□ Performance test results within acceptable range
□ Database migration tested on staging
□ Feature flags configured correctly
□ Rollback plan documented
□ Monitoring dashboards ready
□ Team notified on Slack (#deployments)
□ Change request ticket created (for major releases)
□ Stakeholders informed (if user-facing changes)
□ On-call engineer confirmed available
```

### 3.4. Post-Deployment Verification

| Step | Action | Duration | Success Criteria |
|------|--------|----------|-----------------|
| 1 | Health check endpoints | 1 min | All return 200 OK |
| 2 | Smoke tests (automated) | 3 min | All pass |
| 3 | Monitor error rates | 10 min | No spike > baseline |
| 4 | Monitor latency | 10 min | p95 < 500ms |
| 5 | Check business metrics | 15 min | Conversion rate stable |
| 6 | Verify key user flows | 5 min | Purchase flow works |
| 7 | Review logs for errors | 5 min | No new error patterns |
| 8 | Confirm with QA | 10 min | Sign-off |

### 3.5. Rollback Procedure

```
Trigger: Error rate > 5% OR Critical business flow broken

Step 1: Announce in #incident channel
        → "@here Rolling back deployment v{X.Y.Z}"

Step 2: Execute rollback
        → kubectl rollout undo deployment/{service-name}
        OR
        → Deploy previous known-good image tag

Step 3: Verify rollback success
        → Health checks pass
        → Error rate returning to normal
        → Business flows operational

Step 4: Post-rollback
        → Notify stakeholders
        → Create incident ticket
        → Schedule root cause analysis

Total rollback time target: < 5 minutes
```

---

## 4. Quy trình quản lý sự cố (Incident Management SOP)

### 4.1. Incident Severity Classification

| Severity | Definition | Examples | Response Time | Resolution Target |
|----------|-----------|----------|---------------|-------------------|
| P1 - Critical | Hệ thống down hoàn toàn hoặc data loss | Full outage, payment processing failed, data breach | 5 min | 1 hour |
| P2 - High | Feature chính bị ảnh hưởng nghiêm trọng | Purchase flow broken, claims cannot submit, partial outage | 15 min | 4 hours |
| P3 - Medium | Feature phụ bị ảnh hưởng, có workaround | Slow performance, minor UI issues, single service degraded | 1 hour | 24 hours |
| P4 - Low | Cosmetic issues, enhancement requests | Typo, non-critical UI, documentation | 24 hours | 1 week |

### 4.2. Incident Response Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                    INCIDENT RESPONSE LIFECYCLE                          │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ DETECT   │─▶│ RESPOND  │─▶│ RESOLVE  │─▶│ RECOVER  │             │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
│       │             │             │             │                      │
│       ▼             ▼             ▼             ▼                      │
│  - Alert fires  - Acknowledge  - Diagnose   - Verify fix             │
│  - Auto-detect  - Classify     - Fix/       - Monitor                │
│  - User report  - Assemble       Mitigate   - Communicate           │
│                    team        - Implement   - Close                  │
│                  - Communicate                                        │
│                                                                         │
│                              ┌──────────┐                             │
│                              │  LEARN   │                             │
│                              └──────────┘                             │
│                                   │                                    │
│                                   ▼                                    │
│                            - Post-mortem                               │
│                            - Action items                              │
│                            - Process improvement                       │
│                                                                         │
└───────────────────────────────────────────────────────────────────────┘
```

### 4.3. Incident Commander Responsibilities

| Phase | Responsibility | Actions |
|-------|---------------|---------|
| Detection | Acknowledge alert | Confirm incident, assess severity |
| Response | Assemble team | Page relevant engineers, create war room |
| Communication | Stakeholder updates | Status page, internal updates every 30 min |
| Resolution | Coordinate fix | Direct troubleshooting, approve changes |
| Recovery | Verify resolution | Confirm services restored, close incident |
| Learning | Schedule post-mortem | Within 48h for P1/P2, within 1 week for P3 |

### 4.4. Communication Template

**Internal Update (Slack #incidents):**
```
🚨 [SEVERITY] Incident: {Brief Description}
Status: Investigating / Identified / Monitoring / Resolved
Impact: {What users are affected and how}
Current Actions: {What team is doing now}
ETA: {Estimated time to resolution}
IC: {Incident Commander name}
Next Update: {Time of next update}
```

**External Status Page Update:**
```
Title: {Service} - Performance Issues / Partial Outage / Major Outage
Body: We are currently experiencing {issue description}.
      Our team is actively working on a resolution.
      Affected services: {list}
      Workaround: {if available}
      We will provide updates every {30 minutes}.
```

### 4.5. Post-Mortem Template

```markdown
## Incident Post-Mortem: [INC-XXXX]

### Summary
- Date/Time: YYYY-MM-DD HH:MM - HH:MM (UTC+7)
- Duration: X hours Y minutes
- Severity: P1/P2/P3
- Impact: {Number of users affected, business impact}
- Incident Commander: {Name}

### Timeline
| Time | Event |
|------|-------|
| HH:MM | Alert triggered |
| HH:MM | IC acknowledged |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Services restored |
| HH:MM | Incident closed |

### Root Cause
{Detailed explanation of what went wrong}

### Resolution
{What was done to fix the issue}

### Lessons Learned
- What went well: {list}
- What went poorly: {list}
- Where we got lucky: {list}

### Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | | | | |
| 2 | | | | |

### Prevention
{What changes will prevent this from happening again}
```

---

## 5. Quy trình On-Call (On-Call SOP)

### 5.1. On-Call Rotation

| Aspect | Detail |
|--------|--------|
| Rotation period | 1 tuần (Thứ 2 08:00 → Thứ 2 tuần sau 08:00) |
| Team size | Minimum 4 engineers trong rotation |
| Primary on-call | Respond to all alerts |
| Secondary on-call | Backup nếu primary không available trong 10 min |
| Escalation | Team Lead → Engineering Manager → CTO |
| Compensation | On-call allowance + incident bonus |

### 5.2. On-Call Responsibilities

```
During On-Call Shift:
├── Respond to alerts within SLA
│   ├── P1: 5 minutes
│   ├── P2: 15 minutes
│   └── P3: 1 hour
├── Perform morning checks (if weekday)
├── Handle urgent requests from support team
├── Document all incidents
├── Handoff to next on-call (end of rotation)
└── Escalate when needed (don't be a hero)

NOT On-Call Responsibilities:
├── Feature development
├── Non-urgent bug fixes
├── Documentation updates
└── Meeting attendance (unless incident-related)
```

### 5.3. Handoff Procedure

```
End of rotation handoff document:

## On-Call Handoff: {Date} → {Date}

### Open Issues
| Issue | Status | Priority | Notes |
|-------|--------|----------|-------|
| | | | |

### Ongoing Maintenance
- {Any scheduled maintenance coming up}

### Known Issues
- {Issues to watch out for}

### Recent Changes
- {Recent deployments or config changes}

### Notes for Next On-Call
- {Any special instructions}
```

---

## 6. Quy trình quản lý thay đổi (Change Management SOP)

### 6.1. Change Types

| Type | Risk | Approval | Lead Time | Examples |
|------|------|----------|-----------|----------|
| Standard | Low | Auto-approved | 0 | Config toggle, minor UI |
| Normal | Medium | Team Lead | 24h | New feature, API change |
| Major | High | CAB (Change Advisory Board) | 1 week | Architecture change, DB migration |
| Emergency | Critical | CTO (post-approval OK) | 0 | Hotfix for P1 incident |

### 6.2. Change Request Process

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Request  │──▶│ Assess   │──▶│ Approve  │──▶│ Implement│──▶│ Review   │
│ Change   │   │ Impact   │   │          │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
 - Description  - Risk level   - Approver    - Execute     - Verify
 - Reason       - Affected     - Conditions  - Monitor     - Close
 - Timeline       services     - Schedule    - Validate    - Document
 - Rollback     - Dependencies
   plan
```

### 6.3. Change Freeze Periods

| Period | Duration | Reason | Exception |
|--------|----------|--------|-----------|
| Tết Nguyên Đán | 2 tuần | Lưu lượng cao, team nghỉ | P1 hotfix only |
| End of Month | Last 2 days | Reconciliation period | P1 hotfix only |
| Major Sales Events | Event duration + 1 day | High traffic | P1 hotfix only |
| After Major Release | 48 hours | Stabilization | P1/P2 hotfix |

---

## 7. Quy trình quản lý Database (Database Operations SOP)

### 7.1. Database Migration Process

| Step | Action | Responsibility | Verification |
|------|--------|---------------|--------------|
| 1 | Write migration script | Developer | Code review |
| 2 | Test on local/dev | Developer | Data integrity |
| 3 | Run on staging | DevOps | Performance test |
| 4 | Backup production DB | DevOps | Verify backup |
| 5 | Schedule maintenance window (if needed) | Team Lead | Stakeholder approval |
| 6 | Execute migration | DevOps | Monitor execution |
| 7 | Verify data integrity | QA + DevOps | Automated checks |
| 8 | Monitor performance | DevOps | 24h observation |

### 7.2. Backup Schedule

| Database | Backup Type | Frequency | Retention | Storage |
|----------|------------|-----------|-----------|---------|
| Primary DB (PostgreSQL) | Full | Daily 02:00 UTC+7 | 30 days | S3 + Cross-region |
| Primary DB (PostgreSQL) | Incremental | Every 6 hours | 7 days | S3 |
| Primary DB (PostgreSQL) | WAL/Binlog | Continuous | 7 days | S3 |
| Redis Cache | RDB Snapshot | Every 12 hours | 3 days | S3 |
| Document Store | Full | Daily 03:00 UTC+7 | 30 days | S3 |
| File Storage (S3) | Cross-region replication | Continuous | Permanent | DR Region |

### 7.3. Database Maintenance Tasks

| Task | Frequency | Impact | Window |
|------|-----------|--------|--------|
| VACUUM ANALYZE | Daily (auto) | Minimal | Off-peak |
| Index rebuild | Monthly | Low | Maintenance window |
| Statistics update | Weekly | Minimal | Off-peak |
| Connection pool reset | As needed | Brief disruption | Low-traffic |
| Failover test | Quarterly | 30s downtime | Maintenance window |
| Backup restore test | Monthly | None (separate env) | Any time |

---

## 8. Quy trình Security Operations (SecOps SOP)

### 8.1. Security Monitoring

| Activity | Frequency | Tool | Responsible |
|----------|-----------|------|-------------|
| Vulnerability scan | Weekly | Trivy/Snyk | Security team |
| Penetration test | Quarterly | External vendor | Security team |
| Access review | Monthly | IAM audit | Security + Team Lead |
| Certificate check | Daily (automated) | Cert Manager | DevOps |
| Log review (security) | Daily | SIEM | Security team |
| Dependency audit | Per deployment | npm audit/Snyk | CI/CD pipeline |

### 8.2. Security Incident Response

```
Security Incident Classification:
├── SEV-1: Data breach, unauthorized access to PII
│   → Notify CEO, Legal, DPO within 1 hour
│   → Regulatory notification within 72 hours
│
├── SEV-2: Attempted breach detected, vulnerability exploited
│   → Notify CTO, Security Lead within 2 hours
│   → Containment within 4 hours
│
├── SEV-3: Suspicious activity, failed attacks
│   → Document and monitor
│   → Review in next security meeting
│
└── SEV-4: Policy violation, minor security gaps
    → Create ticket for remediation
    → Address in next sprint
```

### 8.3. Access Management

| Action | Process | Approval | Timeline |
|--------|---------|----------|----------|
| New employee access | Onboarding checklist | Team Lead + Security | Day 1 |
| Role change | Access request form | Manager + Security | 24h |
| Offboarding | Revoke all access | HR + Security | Immediate |
| Elevated access (prod) | Temporary access request | CTO | Max 8h duration |
| Third-party access | Vendor access form | CTO + Legal | Case by case |
| Access review | Quarterly audit | Security team | End of quarter |

---

## 9. Quy trình Capacity Planning

### 9.1. Capacity Metrics

| Resource | Current Capacity | Warning Threshold | Scale Trigger | Scale Action |
|----------|-----------------|-------------------|---------------|--------------|
| Web Servers | 4 nodes | 60% avg CPU | 75% avg CPU | Add 2 nodes |
| API Servers | 6 nodes | 65% avg CPU | 80% avg CPU | Add 2 nodes |
| Database | 2 vCPU, 8GB | 70% CPU/Memory | 80% CPU/Memory | Vertical scale |
| Redis | 4GB | 70% memory | 80% memory | Increase memory |
| Storage | 500GB | 70% used | 80% used | Expand volume |
| CDN | 1TB/month | 80% bandwidth | 90% bandwidth | Upgrade plan |

### 9.2. Scaling Plan

```
Traffic Pattern (Normal Day):
06:00 - 08:00  ████░░░░░░  30% capacity
08:00 - 12:00  ████████░░  70% capacity (morning peak)
12:00 - 14:00  ██████░░░░  50% capacity (lunch)
14:00 - 18:00  ████████░░  70% capacity (afternoon peak)
18:00 - 22:00  ██████████  90% capacity (evening peak)
22:00 - 06:00  ██░░░░░░░░  20% capacity

Auto-scaling Rules:
- Scale UP: When avg CPU > 75% for 3 minutes → Add 2 instances
- Scale DOWN: When avg CPU < 30% for 10 minutes → Remove 1 instance
- Min instances: 2 (HA requirement)
- Max instances: 20 (cost control)
- Cooldown: 5 minutes between scale actions
```

---

## 10. Review & Cập nhật

### 10.1. SOP Review Schedule

| Document | Review Frequency | Owner | Approver |
|----------|-----------------|-------|----------|
| Daily Operations | Quarterly | DevOps Lead | CTO |
| Deployment SOP | After major incidents | Release Manager | Team Lead |
| Incident Management | Quarterly | SRE Lead | CTO |
| Security Operations | Monthly | Security Lead | CTO |
| On-Call Procedures | Quarterly | DevOps Lead | Engineering Manager |
| Change Management | Semi-annually | Engineering Manager | CTO |

### 10.2. SOP Metrics & KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Deployment Success Rate | > 99% | Successful deploys / Total deploys |
| MTTR (Mean Time To Recovery) | < 1h (P1), < 4h (P2) | Incident start → Resolution |
| MTTD (Mean Time To Detect) | < 5 min | Issue occurs → Alert fires |
| Change Failure Rate | < 5% | Failed changes / Total changes |
| SLA Compliance | > 99.9% | Uptime measurement |
| On-Call Response Time | < 5 min (P1) | Alert → Acknowledgement |

---

## 11. Phê duyệt

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |
| DevOps Lead | | | |
| Security Lead | | | |
| Engineering Manager | | | |
