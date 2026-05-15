# Deployment Diagram - Sơ Đồ Triển Khai

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Cloud Provider | AWS (ap-southeast-1) |

---

## 1. Production Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                         │
│                                                                               │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                            │
│    │ Customer │    │  Admin   │    │ Partner  │                            │
│    │ Browser  │    │ Browser  │    │ Browser  │                            │
│    └────┬─────┘    └────┬─────┘    └────┬─────┘                            │
└─────────┼───────────────┼───────────────┼───────────────────────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  <<cloud>> AWS Region: ap-southeast-1 (Singapore)                            │
│                                                                               │
│  ┌─── EDGE LAYER ──────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  ┌──────────────────┐    ┌──────────────────┐                          ││
│  │  │  <<service>>      │    │  <<service>>      │                          ││
│  │  │  Route 53 (DNS)   │    │  AWS WAF          │                          ││
│  │  │                   │    │  (Web Firewall)    │                          ││
│  │  │  insurance-system │    │  OWASP Rules       │                          ││
│  │  │  .vn             │    │  Rate Limiting     │                          ││
│  │  └────────┬─────────┘    └────────┬─────────┘                          ││
│  │           │                        │                                     ││
│  │           ▼                        ▼                                     ││
│  │  ┌───────────────────────────────────────────┐                          ││
│  │  │  <<service>>  CloudFront (CDN)             │                          ││
│  │  │                                            │                          ││
│  │  │  Static Assets: *.js, *.css, images       │                          ││
│  │  │  Cache Policy: 1 year (versioned files)    │                          ││
│  │  │  API Proxy: /api/* → ALB                  │                          ││
│  │  │  SSL/TLS: ACM Certificate                 │                          ││
│  │  └───────────────────────┬───────────────────┘                          ││
│  └──────────────────────────┼───────────────────────────────────────────────┘│
│                              │                                                │
│  ┌─── VPC (10.0.0.0/16) ───┼───────────────────────────────────────────────┐│
│  │                           │                                               ││
│  │  ┌─── PUBLIC SUBNET (10.0.1.0/24) ─────────────────────────────────────┐││
│  │  │                       │                                              │││
│  │  │  ┌───────────────────┴──────────────────┐    ┌──────────────────┐  │││
│  │  │  │  <<service>>  ALB (Load Balancer)     │    │  <<service>>      │  │││
│  │  │  │                                       │    │  NAT Gateway     │  │││
│  │  │  │  Listeners: 80 (→301), 443           │    │  (outbound inet) │  │││
│  │  │  │  Target Groups: ECS Services          │    └──────────────────┘  │││
│  │  │  │  Health Check: /health (30s interval) │                          │││
│  │  │  └───────────────────┬──────────────────┘                          │││
│  │  └──────────────────────┼──────────────────────────────────────────────┘││
│  │                          │                                               ││
│  │  ┌─── PRIVATE SUBNET - APP (10.0.2.0/24, 10.0.4.0/24) ───────────────┐││
│  │  │                       │                                             │││
│  │  │  ┌───────────────────┴──────────────────────────────────────────┐  │││
│  │  │  │  <<service>>  ECS Fargate Cluster                             │  │││
│  │  │  │                                                               │  │││
│  │  │  │  ┌─────────────────────────────────────────────────────────┐ │  │││
│  │  │  │  │  Service: insurance-api                                  │ │  │││
│  │  │  │  │  Image: ECR/insurance-api:latest                        │ │  │││
│  │  │  │  │  Tasks: 2-20 (auto-scaling)                             │ │  │││
│  │  │  │  │  CPU: 1 vCPU │ Memory: 2GB                             │ │  │││
│  │  │  │  │  Port: 3000                                             │ │  │││
│  │  │  │  │  Env: Production                                        │ │  │││
│  │  │  │  └─────────────────────────────────────────────────────────┘ │  │││
│  │  │  │                                                               │  │││
│  │  │  │  ┌─────────────────────────────────────────────────────────┐ │  │││
│  │  │  │  │  Service: insurance-worker                               │ │  │││
│  │  │  │  │  Image: ECR/insurance-worker:latest                     │ │  │││
│  │  │  │  │  Tasks: 1-5 (based on queue depth)                      │ │  │││
│  │  │  │  │  CPU: 0.5 vCPU │ Memory: 1GB                           │ │  │││
│  │  │  │  │  Purpose: Background jobs, PDF generation, emails       │ │  │││
│  │  │  │  └─────────────────────────────────────────────────────────┘ │  │││
│  │  │  │                                                               │  │││
│  │  │  └───────────────────────────────────────────────────────────────┘  │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                          ││
│  │  ┌─── PRIVATE SUBNET - DATA (10.0.3.0/24, 10.0.5.0/24) ─────────────┐││
│  │  │                                                                    │││
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐              │││
│  │  │  │  <<service>>          │  │  <<service>>          │              │││
│  │  │  │  RDS PostgreSQL 15   │  │  ElastiCache Redis 7 │              │││
│  │  │  │                      │  │                       │              │││
│  │  │  │  Instance: db.r6g.lg │  │  Node: cache.r6g.lg  │              │││
│  │  │  │  Multi-AZ: Yes       │  │  Cluster: 3 nodes    │              │││
│  │  │  │  Storage: 100GB gp3  │  │  (1 primary +        │              │││
│  │  │  │  IOPS: 3000          │  │   2 replicas)        │              │││
│  │  │  │  Backup: 6h auto     │  │  Memory: 6.38GB      │              │││
│  │  │  │  Retention: 30 days  │  │                       │              │││
│  │  │  │  Encryption: Yes     │  │  Purpose:             │              │││
│  │  │  │                      │  │  - Session store      │              │││
│  │  │  │  Read Replicas: 2    │  │  - API caching        │              │││
│  │  │  │                      │  │  - Job queue (Bull)   │              │││
│  │  │  │                      │  │  - Rate limiting      │              │││
│  │  │  └──────────────────────┘  └──────────────────────┘              │││
│  │  │                                                                    │││
│  │  │  ┌──────────────────────┐                                         │││
│  │  │  │  <<service>>          │                                         │││
│  │  │  │  Elasticsearch 8     │                                         │││
│  │  │  │                      │                                         │││
│  │  │  │  Nodes: 3            │                                         │││
│  │  │  │  Instance: r6g.lg    │                                         │││
│  │  │  │  Storage: 50GB/node  │                                         │││
│  │  │  │  Purpose: Search     │                                         │││
│  │  │  └──────────────────────┘                                         │││
│  │  └────────────────────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌─── STORAGE & OTHER SERVICES ────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     ││
│  │  │  <<service>>      │  │  <<service>>      │  │  <<service>>      │     ││
│  │  │  S3 Bucket        │  │  ECR Registry    │  │  Secrets Manager │     ││
│  │  │                   │  │                   │  │                   │     ││
│  │  │  - documents/     │  │  insurance-api    │  │  DB credentials  │     ││
│  │  │  - policies/      │  │  insurance-worker │  │  API keys         │     ││
│  │  │  - claims/        │  │                   │  │  JWT secrets      │     ││
│  │  │  - static/        │  │                   │  │  Gateway configs  │     ││
│  │  │                   │  │                   │  │                   │     ││
│  │  │  Encryption: SSE  │  │                   │  │                   │     ││
│  │  │  Versioning: On   │  │                   │  │                   │     ││
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘     ││
│  │                                                                          ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     ││
│  │  │  <<service>>      │  │  <<service>>      │  │  <<service>>      │     ││
│  │  │  CloudWatch       │  │  KMS              │  │  SES (Email)     │     ││
│  │  │                   │  │  (Key Mgmt)       │  │                   │     ││
│  │  │  Logs + Metrics   │  │  Encryption keys  │  │  Transactional   │     ││
│  │  │  Alarms           │  │  for RDS, S3,     │  │  emails          │     ││
│  │  │  Dashboards       │  │  Secrets          │  │                   │     ││
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CI/CD Pipeline Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CI/CD DEPLOYMENT PIPELINE                        │
│                       (GitHub Actions)                                │
│                                                                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │  Code   │───▶│  Build  │───▶│  Test   │───▶│  Push   │         │
│  │  Push   │    │  & Lint │    │  Suite  │    │  Image  │         │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘         │
│                                                     │               │
│              ┌──────────────────────────────────────┘               │
│              │                                                       │
│              ▼                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    DEPLOYMENT STAGES                            │ │
│  │                                                                │ │
│  │  ┌──────────┐         ┌──────────┐         ┌──────────┐     │ │
│  │  │ Staging  │─ test ─▶│  Canary  │─ ok? ─▶│Production│     │ │
│  │  │ Deploy   │  pass   │  (10%)   │  yes    │  (100%)  │     │ │
│  │  └──────────┘         └──────────┘         └──────────┘     │ │
│  │       │                     │                    │            │ │
│  │  Auto-deploy          Manual gate          Rolling update    │ │
│  │  on merge to          or auto (5min        zero-downtime     │ │
│  │  staging branch       health check)                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Rollback Strategy:                                                  │
│  • Auto-rollback if health check fails (< 2min)                    │
│  • Manual rollback via: re-deploy previous image tag                │
│  • Database: Migration rollback scripts ready                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Environment Configuration

### 3.1. Environment Specifications

| Environment | Compute | Database | Redis | Purpose |
|-------------|---------|----------|-------|---------|
| **Development** | 1 task, 0.25 vCPU, 512MB | db.t3.micro, 20GB | cache.t3.micro | Dev/Debug |
| **Staging** | 2 tasks, 0.5 vCPU, 1GB | db.t3.small, 50GB | cache.t3.small | Integration test |
| **Production** | 2-20 tasks, 1 vCPU, 2GB | db.r6g.large, 100GB | cache.r6g.large (3 nodes) | Live |
| **DR** | 2 tasks (standby) | db.r6g.large (replica) | cache.r6g.large | Disaster Recovery |

### 3.2. Scaling Configuration

```yaml
# Auto-Scaling Policy (Production)
scaling:
  api-service:
    min: 2
    max: 20
    target_cpu: 70%
    scale_up_cooldown: 60s
    scale_down_cooldown: 300s
    
  worker-service:
    min: 1
    max: 5
    target_queue_depth: 100
    scale_up_cooldown: 30s
    scale_down_cooldown: 600s
```

---

## 4. Network Security Groups

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY GROUPS                                │
│                                                                   │
│  SG: alb-sg                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Inbound:  443 (HTTPS) from 0.0.0.0/0                      │  │
│  │ Inbound:  80  (HTTP)  from 0.0.0.0/0 (redirect to 443)   │  │
│  │ Outbound: All to ecs-sg                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  SG: ecs-sg                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Inbound:  3000 from alb-sg                                │  │
│  │ Outbound: 5432 to rds-sg (PostgreSQL)                     │  │
│  │ Outbound: 6379 to redis-sg (Redis)                        │  │
│  │ Outbound: 9200 to es-sg (Elasticsearch)                   │  │
│  │ Outbound: 443  to 0.0.0.0/0 (external APIs via NAT)      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  SG: rds-sg                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Inbound:  5432 from ecs-sg only                           │  │
│  │ Outbound: None                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  SG: redis-sg                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Inbound:  6379 from ecs-sg only                           │  │
│  │ Outbound: None                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  SG: es-sg                                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Inbound:  9200 from ecs-sg only                           │  │
│  │ Outbound: None                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Domain & SSL Configuration

```
DNS Records (Route 53):
┌───────────────────────────────────────────────────────────┐
│ insurance-system.vn        → CloudFront Distribution       │
│ www.insurance-system.vn    → CloudFront Distribution       │
│ api.insurance-system.vn    → ALB (via CloudFront)         │
│ admin.insurance-system.vn  → CloudFront Distribution       │
│ partner.insurance-system.vn→ CloudFront Distribution       │
└───────────────────────────────────────────────────────────┘

SSL Certificates (ACM):
┌───────────────────────────────────────────────────────────┐
│ *.insurance-system.vn  (wildcard, auto-renewal)           │
│ insurance-system.vn    (root domain)                      │
└───────────────────────────────────────────────────────────┘
```
