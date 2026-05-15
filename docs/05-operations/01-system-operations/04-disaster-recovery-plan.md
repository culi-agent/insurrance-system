# Disaster Recovery Plan (DRP)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Tổng quan

### 1.1. Mục đích

Tài liệu này định nghĩa kế hoạch khôi phục thảm họa (Disaster Recovery Plan) cho hệ thống Insurance System, đảm bảo khả năng phục hồi nhanh chóng khi xảy ra sự cố nghiêm trọng ảnh hưởng đến khả năng hoạt động của hệ thống.

### 1.2. Phạm vi

- Toàn bộ hạ tầng production trên AWS (ap-southeast-1)
- Tất cả services, databases, storage
- External integrations (payment gateways, insurer APIs)
- DR site: ap-southeast-3 (Jakarta) hoặc ap-east-1 (Hong Kong)

### 1.3. Recovery Objectives

| Metric | Target | Justification |
|--------|--------|---------------|
| RTO (Recovery Time Objective) | < 1 hour | Minimize revenue loss |
| RPO (Recovery Point Objective) | < 5 minutes | Near-zero data loss |
| MTTR (Mean Time To Recovery) | < 30 minutes | Fast response |
| Availability Target | 99.9% (8.76h downtime/year) | SLA commitment |

### 1.4. DR Tiers

| Tier | Services | RTO | RPO | Strategy |
|------|----------|-----|-----|----------|
| Tier 1 (Critical) | Payment, Auth, Policy Issuance | < 15 min | < 1 min | Hot standby |
| Tier 2 (Important) | Claims, Quote, Notification | < 30 min | < 5 min | Warm standby |
| Tier 3 (Standard) | Admin Portal, Reporting, Analytics | < 2 hours | < 1 hour | Cold standby |
| Tier 4 (Low) | Dev/Staging environments | < 24 hours | < 24 hours | Backup restore |

---

## 2. Disaster Scenarios

### 2.1. Scenario Classification

| # | Scenario | Probability | Impact | Recovery Strategy |
|---|----------|-------------|--------|-------------------|
| DS-1 | Single service failure | High | Low | Auto-restart, scaling |
| DS-2 | Database failure (single AZ) | Medium | High | Multi-AZ failover |
| DS-3 | Full region outage | Low | Critical | Cross-region failover |
| DS-4 | Data corruption | Low | Critical | Point-in-time recovery |
| DS-5 | Security breach / Ransomware | Low | Critical | Isolated restore |
| DS-6 | DDoS attack | Medium | Medium | WAF + CloudFront |
| DS-7 | Third-party service failure | Medium | Medium | Fallback / Circuit breaker |
| DS-8 | Human error (misconfig) | Medium | Variable | Rollback + restore |
| DS-9 | Natural disaster | Very Low | Critical | Cross-region DR |
| DS-10 | Cloud provider outage | Very Low | Critical | Multi-cloud (future) |

### 2.2. Impact Assessment

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS IMPACT ANALYSIS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Downtime Cost Estimation:                                           │
│  ─────────────────────────                                           │
│  Revenue/hour (peak):    ~50 triệu VND                              │
│  Revenue/hour (off-peak): ~10 triệu VND                             │
│  Reputation damage:       Hard to quantify (trust erosion)          │
│  Regulatory penalty:      Up to 2% annual revenue                   │
│  SLA breach penalty:      Per contract with insurers                │
│                                                                       │
│  Critical Business Functions:                                         │
│  ┌─────────────────────────────────────────────┐                    │
│  │ 1. Payment processing (revenue)              │ ← Most critical  │
│  │ 2. Policy issuance (customer commitment)     │                    │
│  │ 3. Authentication (access to everything)     │                    │
│  │ 4. Claims submission (legal obligation)      │                    │
│  │ 5. Quote generation (sales pipeline)         │                    │
│  │ 6. Notifications (SLA compliance)            │                    │
│  │ 7. Reporting (operational visibility)        │                    │
│  └─────────────────────────────────────────────┘                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. DR Architecture

### 3.1. Multi-Region Setup

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DR ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│                        ┌──────────────┐                                  │
│                        │   Route 53   │ (Health check + Failover)        │
│                        │   (DNS)      │                                  │
│                        └──────┬───────┘                                  │
│                               │                                          │
│              ┌────────────────┼────────────────┐                        │
│              ▼                                  ▼                        │
│  ┌───────────────────────┐      ┌───────────────────────┐              │
│  │   PRIMARY REGION      │      │   DR REGION            │              │
│  │   (ap-southeast-1)    │      │   (ap-southeast-3)     │              │
│  │   Singapore           │      │   Jakarta              │              │
│  ├───────────────────────┤      ├───────────────────────┤              │
│  │                       │      │                       │              │
│  │  ┌─────────────────┐ │      │  ┌─────────────────┐ │              │
│  │  │   EKS Cluster   │ │      │  │  EKS Cluster    │ │              │
│  │  │  (Active)       │ │      │  │  (Standby)      │ │              │
│  │  └─────────────────┘ │      │  └─────────────────┘ │              │
│  │                       │      │                       │              │
│  │  ┌─────────────────┐ │ ──── │  ┌─────────────────┐ │              │
│  │  │   RDS Primary   │ │ Repl │  │   RDS Replica   │ │              │
│  │  │  (Multi-AZ)     │ │ ──── │  │  (Read Replica) │ │              │
│  │  └─────────────────┘ │      │  └─────────────────┘ │              │
│  │                       │      │                       │              │
│  │  ┌─────────────────┐ │ ──── │  ┌─────────────────┐ │              │
│  │  │   Redis Primary │ │ Repl │  │  Redis Replica  │ │              │
│  │  └─────────────────┘ │ ──── │  └─────────────────┘ │              │
│  │                       │      │                       │              │
│  │  ┌─────────────────┐ │ ──── │  ┌─────────────────┐ │              │
│  │  │   S3 Bucket     │ │ CRR  │  │   S3 Bucket     │ │              │
│  │  └─────────────────┘ │ ──── │  └─────────────────┘ │              │
│  │                       │      │                       │              │
│  └───────────────────────┘      └───────────────────────┘              │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

Legend: ──── = Replication / Cross-Region Replication (CRR)
```

### 3.2. Data Replication Strategy

| Component | Replication Method | Lag Target | Monitoring |
|-----------|-------------------|------------|------------|
| PostgreSQL | Cross-region read replica | < 1 min | CloudWatch ReplicaLag |
| Redis | Global Datastore | < 1 sec | ElastiCache metrics |
| S3 | Cross-Region Replication | < 15 min | S3 replication metrics |
| SQS | Cross-region (application level) | < 5 min | Custom metric |
| Secrets Manager | Cross-region replication | Near real-time | Built-in |
| ECR (Container images) | Cross-region replication | < 10 min | ECR metrics |

---

## 4. DR Procedures

### 4.1. Failover Decision Matrix

| Condition | Action | Authority | Auto/Manual |
|-----------|--------|-----------|-------------|
| Single pod failure | Auto-restart | System | Automatic |
| Single node failure | Reschedule pods | System | Automatic |
| Single AZ failure | RDS Multi-AZ failover | System | Automatic |
| Region degradation (> 30 min) | Evaluate DR failover | CTO + DevOps Lead | Manual |
| Full region outage | Initiate DR failover | CTO | Manual |
| Data corruption detected | Stop writes, assess | CTO + DBA | Manual |
| Security breach | Isolate + assess | CTO + Security | Manual |

### 4.2. Full Region Failover Procedure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REGION FAILOVER PROCEDURE                          │
│                    Total Target Time: < 60 minutes                    │
├─────────────────────────────────────────────────────────────────────┤

Phase 1: Declaration (5 min)
├── CTO declares disaster
├── Notify DR team via PagerDuty
├── Create incident channel (#dr-failover-{date})
├── Update status page: "Major Outage - Failover in progress"
└── Assign roles: IC, Communications, Technical Lead

Phase 2: Assessment (5 min)
├── Confirm primary region is unrecoverable (short term)
├── Check DR region health
├── Verify data replication lag
├── Confirm decision: FAILOVER
└── Document last known good state

Phase 3: Database Promotion (10 min)
├── Promote RDS read replica to standalone
│   aws rds promote-read-replica \
│     --db-instance-identifier insurance-dr-replica
├── Verify DB is writable
├── Update connection strings in DR secrets
└── Verify replication stopped cleanly

Phase 4: Service Activation (15 min)
├── Scale up DR EKS cluster
│   kubectl scale deployment --all --replicas=3 -n production
├── Deploy latest configurations
├── Verify all services healthy
├── Run smoke tests
└── Verify external integrations (payment, eKYC)

Phase 5: DNS Failover (5 min)
├── Update Route 53 records
│   aws route53 change-resource-record-sets (failover to DR)
├── Or: Health check triggers automatic failover
├── Wait for DNS propagation (TTL: 60s)
├── Verify traffic flowing to DR region
└── Monitor error rates

Phase 6: Verification (10 min)
├── Complete end-to-end test (quote → purchase → payment)
├── Verify all APIs responding correctly
├── Check data consistency
├── Monitor performance metrics
└── Confirm business operations normal

Phase 7: Communication (5 min)
├── Update status page: "Services restored (DR region)"
├── Notify stakeholders
├── Notify insurer partners
├── Brief customer support team
└── Document timeline and actions taken
```

### 4.3. Data Corruption Recovery

```bash
# 1. IMMEDIATELY: Stop all writes to affected tables
kubectl scale deployment --all -n production --replicas=0
# Or: Enable read-only mode
kubectl set env deployment --all -n production DB_READ_ONLY=true

# 2. Identify corruption scope
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT min(updated_at), max(updated_at), count(*)
   FROM {affected_table}
   WHERE updated_at > '{corruption_start_time}';"

# 3. Point-in-time restore to separate instance
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier insurance-prod-primary \
  --target-db-instance-identifier insurance-pit-restore \
  --restore-time "{time_before_corruption}" \
  --db-instance-class db.r6g.large

# 4. Compare data between corrupt and clean DB
pg_dump -h $CORRUPT_DB -t {table} | diff - <(pg_dump -h $CLEAN_DB -t {table})

# 5. Restore clean data
pg_dump -h $CLEAN_DB -t {affected_table} | \
  psql -h $DB_HOST -U $DB_USER -d insurance_prod

# 6. Verify data integrity
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT count(*), max(updated_at) FROM {affected_table};"

# 7. Re-enable writes
kubectl scale deployment --all -n production --replicas=3
```

### 4.4. Failback Procedure (Return to Primary)

```
After Primary Region Restored:
────────────────────────────────

Phase 1: Verify Primary (30 min)
├── Confirm primary region fully operational
├── Deploy all services to primary (scaled to 0)
├── Verify infrastructure healthy
└── Run health checks

Phase 2: Data Sync (1-4 hours)
├── Set up replication: DR → Primary
├── Wait for full sync
├── Verify data consistency
├── Compare record counts and checksums
└── Identify any conflicts (resolve manually)

Phase 3: Testing (1 hour)
├── Scale up primary services (internal traffic only)
├── Run full test suite against primary
├── Performance test
├── Verify all integrations
└── Sign-off from QA

Phase 4: Cutover (15 min)
├── Announce maintenance window
├── Switch DNS back to primary (Route 53)
├── Monitor traffic shift
├── Verify primary handling production load
├── Scale down DR to standby mode
└── Re-establish DR replication

Phase 5: Stabilization (24 hours)
├── Enhanced monitoring
├── On-call team on high alert
├── Hourly status checks
├── Document lessons learned
└── Schedule post-mortem
```

---

## 5. Backup Strategy

### 5.1. Backup Matrix

| Data | Method | Frequency | Retention | Location | Encryption |
|------|--------|-----------|-----------|----------|------------|
| PostgreSQL (full) | pg_dump + RDS snapshot | Daily 02:00 | 30 days | S3 + DR region | AES-256 |
| PostgreSQL (incremental) | WAL archiving | Continuous | 7 days | S3 | AES-256 |
| PostgreSQL (point-in-time) | RDS PITR | Continuous | 35 days | RDS managed | AES-256 |
| Redis | RDB snapshot | Every 6h | 3 days | S3 | AES-256 |
| S3 documents | Cross-region replication | Continuous | Permanent | DR S3 | AES-256 |
| Kubernetes configs | GitOps (Flux/ArgoCD) | On change | Git history | GitHub | - |
| Secrets | AWS Secrets Manager | On change | Version history | Cross-region | KMS |
| Infrastructure (IaC) | Terraform state | On change | S3 versioning | S3 | AES-256 |

### 5.2. Backup Verification

| Test | Frequency | Procedure | Success Criteria |
|------|-----------|-----------|-----------------|
| Restore test (DB) | Monthly | Restore to temp instance | Data matches, app connects |
| Point-in-time recovery | Quarterly | Restore to specific timestamp | Correct data at that time |
| Full DR drill | Semi-annually | Complete failover to DR | All services operational |
| Backup integrity check | Weekly | Checksum verification | No corruption |
| Recovery time test | Quarterly | Time full restore | Within RTO target |

---

## 6. DR Testing & Drills

### 6.1. DR Drill Schedule

| Drill Type | Frequency | Duration | Scope | Participants |
|------------|-----------|----------|-------|--------------|
| Tabletop exercise | Quarterly | 2 hours | Discussion-based | All teams |
| Component failover | Monthly | 1 hour | Single component | DevOps + affected team |
| Partial DR test | Quarterly | 4 hours | Tier 1 services | DevOps + Core teams |
| Full DR drill | Semi-annually | 8 hours | All tiers | All teams |
| Unannounced drill | Annually | Variable | Random scenario | On-call team |

### 6.2. DR Drill Checklist

```
Pre-Drill:
□ Drill plan documented and approved
□ All participants briefed
□ Monitoring enhanced
□ Rollback plan ready
□ Customer impact assessment (if production)
□ Stakeholders notified (if production impact)

During Drill:
□ Execute failover steps per plan
□ Record actual times vs targets
□ Note any deviations or issues
□ Test all critical business flows
□ Verify data integrity
□ Test external integrations

Post-Drill:
□ Failback to primary (if applicable)
□ Verify all systems normal
□ Document findings
□ Update DR plan based on lessons
□ Score drill: RTO achieved? RPO achieved?
□ Create action items for gaps
□ Schedule follow-up for action items
```

### 6.3. DR Drill Report Template

```markdown
## DR Drill Report

### Summary
- Date: {date}
- Type: {Full/Partial/Component}
- Scenario: {description}
- Duration: {actual time}
- Result: PASS / PARTIAL / FAIL

### Objectives & Results
| Objective | Target | Actual | Status |
|-----------|--------|--------|--------|
| RTO achieved | < 60 min | {X} min | ✅/❌ |
| RPO achieved | < 5 min | {X} min | ✅/❌ |
| All services restored | 100% | {X}% | ✅/❌ |
| Data integrity verified | 100% | {X}% | ✅/❌ |

### Timeline
| Time | Event | Notes |
|------|-------|-------|

### Issues Identified
| # | Issue | Severity | Action Required |
|---|-------|----------|-----------------|

### Recommendations
1. {recommendation}

### Next Drill: {scheduled date}
```

---

## 7. Roles & Responsibilities

### 7.1. DR Team

| Role | Primary | Secondary | Responsibility |
|------|---------|-----------|----------------|
| DR Commander | CTO | Engineering Manager | Decision authority, declare DR |
| Technical Lead | DevOps Lead | Senior SRE | Execute failover procedures |
| Database Lead | DBA | Senior Backend | Database failover, data integrity |
| Communications | Product Manager | Customer Support Lead | Internal + external comms |
| Verification | QA Lead | Senior QA | Validate recovery |
| Security | Security Lead | DevOps Engineer | Security during/after DR |

### 7.2. Contact Tree

```
DR Event Detected
      │
      ▼
On-Call Engineer (5 min response)
      │
      ├── Assess severity
      │
      ▼
DevOps Lead (10 min response)
      │
      ├── Confirm DR needed
      │
      ▼
CTO (15 min response)
      │
      ├── Declare DR
      │
      ▼
Full DR Team activated (30 min assembly)
      │
      ├── Technical Lead → Execute procedures
      ├── Database Lead → DB failover
      ├── Communications → Stakeholder updates
      ├── Security → Monitor for threats
      └── Verification → Test & validate
```

---

## 8. Compliance & Documentation

### 8.1. Regulatory Requirements

| Requirement | Standard | Our Compliance |
|-------------|----------|----------------|
| Data residency | Vietnam law | Primary + DR within ASEAN |
| Backup retention | Insurance regulations | 7 years for financial data |
| Recovery capability | Business continuity | Annual DR drill |
| Incident reporting | Data protection law | 72h notification |
| Audit trail | Insurance regulations | Complete audit log backup |

### 8.2. Document Maintenance

| Document | Review Frequency | Owner | Last Review |
|----------|-----------------|-------|-------------|
| DR Plan | Quarterly | DevOps Lead | - |
| Contact list | Monthly | DevOps Lead | - |
| Runbooks | After each incident | Responsible team | - |
| Architecture diagram | After changes | Solution Architect | - |
| DR test results | After each drill | DevOps Lead | - |

---

## 9. Phê duyệt

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | | | |
| CTO | | | |
| DevOps Lead | | | |
| Security Lead | | | |
| Compliance Officer | | | |
