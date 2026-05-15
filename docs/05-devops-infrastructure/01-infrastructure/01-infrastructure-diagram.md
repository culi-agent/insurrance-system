# Infrastructure Diagram - Sơ Đồ Hạ Tầng

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Cập nhật | 2026-05-15 |
| Người phụ trách | DevOps Team |

---

## 1. Tổng Quan Hạ Tầng

### 1.1. High-Level Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                             │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD (ap-southeast-1)                                │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        EDGE LAYER                                        │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │    │
│  │  │  CloudFront  │    │   Route 53   │    │    WAF       │              │    │
│  │  │  (CDN)       │    │   (DNS)      │    │  (Firewall)  │              │    │
│  │  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │    │
│  │         └────────────────────┴────────────────────┘                      │    │
│  └─────────────────────────────────┬───────────────────────────────────────┘    │
│                                    │                                              │
│  ┌─────────────────────────────────┴───────────────────────────────────────┐    │
│  │                    VPC (10.0.0.0/16)                                      │    │
│  │                                                                           │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │    │
│  │  │              PUBLIC SUBNETS (10.0.1.0/24, 10.0.2.0/24)          │    │    │
│  │  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │    │    │
│  │  │  │     ALB      │    │  NAT Gateway │    │   Bastion    │     │    │    │
│  │  │  │ (Load Balancer)│   │   (AZ-a)     │    │    Host      │     │    │    │
│  │  │  └──────┬───────┘    └──────────────┘    └──────────────┘     │    │    │
│  │  └─────────┼──────────────────────────────────────────────────────┘    │    │
│  │            │                                                            │    │
│  │  ┌────────┴────────────────────────────────────────────────────────┐   │    │
│  │  │          PRIVATE SUBNETS - APP (10.0.10.0/24, 10.0.11.0/24)     │   │    │
│  │  │                                                                  │   │    │
│  │  │  ┌─── EKS Cluster ───────────────────────────────────────────┐ │   │    │
│  │  │  │                                                             │ │   │    │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │ │   │    │
│  │  │  │  │  Auth  │ │Product │ │ Policy │ │ Quote  │ │ Claims │ │ │   │    │
│  │  │  │  │Service │ │Service │ │Service │ │Service │ │Service │ │ │   │    │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │ │   │    │
│  │  │  │                                                             │ │   │    │
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │ │   │    │
│  │  │  │  │Payment │ │ Notif  │ │  Doc   │ │ Integ  │            │ │   │    │
│  │  │  │  │Service │ │Service │ │Service │ │Service │            │ │   │    │
│  │  │  │  └────────┘ └────────┘ └────────┘ └────────┘            │ │   │    │
│  │  │  │                                                             │ │   │    │
│  │  │  └─────────────────────────────────────────────────────────────┘ │   │    │
│  │  │                                                                  │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │    │
│  │  │       PRIVATE SUBNETS - DATA (10.0.20.0/24, 10.0.21.0/24)       │   │    │
│  │  │                                                                   │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │    │
│  │  │  │  RDS Aurora  │  │ ElastiCache  │  │Elasticsearch │          │   │    │
│  │  │  │ (PostgreSQL) │  │   (Redis)    │  │  (OpenSearch)│          │   │    │
│  │  │  │  Multi-AZ    │  │   Cluster    │  │   Cluster    │          │   │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │    │
│  │  │                                                                   │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                          SHARED SERVICES                                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │    │
│  │  │   S3     │  │   SQS    │  │   SNS    │  │   SES    │  │  Secrets │ │    │
│  │  │(Storage) │  │ (Queue)  │  │ (PubSub) │  │ (Email)  │  │ Manager  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Chi Tiết Thành Phần

### 2.1. Edge Layer

| Component | Service | Mục đích | Cấu hình |
|-----------|---------|----------|-----------|
| CDN | CloudFront | Cache static assets, giảm latency | Origin: S3 + ALB, TTL: 24h |
| DNS | Route 53 | Domain management, health checks | Failover routing |
| Firewall | AWS WAF | Chặn tấn công, rate limiting | OWASP rules, IP whitelist |
| DDoS | AWS Shield | Bảo vệ DDoS | Standard (auto-enabled) |

### 2.2. Compute Layer

| Component | Service | Specs | Scaling |
|-----------|---------|-------|---------|
| Kubernetes | EKS 1.28 | Managed control plane | Auto-scaling node groups |
| Worker Nodes | EC2 (m5.large) | 2 vCPU, 8GB RAM | Min: 3, Max: 12 |
| Spot Instances | EC2 Spot | Non-critical workloads | 70% discount |
| Load Balancer | ALB | Layer 7, path-based routing | Auto-scaling |

### 2.3. Data Layer

| Component | Service | Specs | HA Strategy |
|-----------|---------|-------|-------------|
| Primary DB | Aurora PostgreSQL 15 | db.r5.large (2 vCPU, 16GB) | Multi-AZ, Read Replicas |
| Cache | ElastiCache Redis 7 | cache.r5.large (2 vCPU, 16GB) | Cluster mode, 3 nodes |
| Search | OpenSearch | m5.large.search (2 nodes) | Multi-AZ |
| Object Storage | S3 | Standard + IA lifecycle | Cross-region replication |
| Queue | SQS | Standard queues | Auto-scaling |

### 2.4. Monitoring & Observability

| Component | Service | Mục đích |
|-----------|---------|----------|
| Metrics | Prometheus + Grafana | Application & infrastructure metrics |
| Logging | CloudWatch + ELK Stack | Centralized log aggregation |
| Tracing | AWS X-Ray | Distributed tracing |
| Alerting | Grafana Alerts + PagerDuty | Incident notification |

---

## 3. Environments

### 3.1. Environment Matrix

| Environment | Mục đích | Infrastructure Scale | Data |
|-------------|----------|---------------------|------|
| **Development** | Coding & unit testing | Single instance, shared DB | Synthetic data |
| **Staging** | Integration testing, QA | 50% production scale | Anonymized prod data |
| **UAT** | User acceptance testing | 50% production scale | Anonymized prod data |
| **Production** | Live traffic | Full scale, Multi-AZ | Real data |
| **DR** | Disaster recovery | Mirror of production | Replicated data |

### 3.2. Environment URLs

| Environment | Frontend | API | Admin |
|-------------|----------|-----|-------|
| Development | dev.insurance-system.local | api-dev.insurance-system.local | admin-dev.insurance-system.local |
| Staging | staging.insurance-system.vn | api-staging.insurance-system.vn | admin-staging.insurance-system.vn |
| UAT | uat.insurance-system.vn | api-uat.insurance-system.vn | admin-uat.insurance-system.vn |
| Production | www.insurance-system.vn | api.insurance-system.vn | admin.insurance-system.vn |

---

## 4. Resource Sizing

### 4.1. Production Sizing (Target: 10K concurrent users)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION SIZING                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  EKS Cluster:                                                    │
│  ├── Node Group: m5.large x 6 (steady state)                    │
│  ├── Auto-scale: up to 12 nodes                                 │
│  ├── Each service: 2-5 replicas                                 │
│  └── Total pods: ~40-80 pods                                    │
│                                                                   │
│  Database:                                                        │
│  ├── Aurora Writer: db.r5.xlarge (4 vCPU, 32GB)                 │
│  ├── Aurora Reader: db.r5.large x 2                             │
│  ├── Storage: 500GB (auto-expanding)                            │
│  └── IOPS: 3000 baseline                                        │
│                                                                   │
│  Cache:                                                           │
│  ├── Redis: cache.r5.large x 3 (cluster mode)                   │
│  ├── Memory: 16GB per node                                      │
│  └── Max connections: 65,000                                     │
│                                                                   │
│  Storage:                                                         │
│  ├── S3: ~100GB/year growth                                      │
│  ├── Documents: Standard → IA (90 days) → Glacier (1 year)      │
│  └── Logs: 50GB/month (30-day retention hot)                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Cost Estimation (Monthly - Production)

| Component | Instance/Config | Monthly Cost (USD) |
|-----------|----------------|-------------------|
| EKS Cluster | Control plane | ~$73 |
| EC2 Worker Nodes | m5.large x 6 | ~$530 |
| Aurora PostgreSQL | r5.xlarge + 2x r5.large | ~$850 |
| ElastiCache Redis | r5.large x 3 | ~$450 |
| OpenSearch | m5.large x 2 | ~$320 |
| ALB | Application LB | ~$50 |
| CloudFront | 1TB transfer | ~$120 |
| S3 | 200GB + requests | ~$30 |
| NAT Gateway | 2 AZs | ~$90 |
| Route 53 | Hosted zones + queries | ~$10 |
| WAF | Rules + requests | ~$30 |
| Secrets Manager | 50 secrets | ~$20 |
| SQS/SNS | Messages | ~$15 |
| SES | 100K emails | ~$10 |
| CloudWatch | Logs + metrics | ~$80 |
| Data Transfer | ~500GB | ~$45 |
| **TOTAL** | | **~$2,723/month** |

---

## 5. Disaster Recovery

### 5.1. DR Strategy

```
┌────────────────────────────────┐    ┌────────────────────────────────┐
│     PRIMARY REGION             │    │     DR REGION                   │
│     (ap-southeast-1)          │    │     (ap-southeast-3)           │
│                                │    │                                │
│  ┌──────────────────────────┐ │    │  ┌──────────────────────────┐ │
│  │  EKS Cluster (Active)    │ │    │  │  EKS Cluster (Standby)   │ │
│  │  - All services running  │ │    │  │  - Scaled to 0 (warm)    │ │
│  └──────────────────────────┘ │    │  └──────────────────────────┘ │
│                                │    │                                │
│  ┌──────────────────────────┐ │    │  ┌──────────────────────────┐ │
│  │  Aurora (Writer)         │─┼────┼─▶│  Aurora (Global Reader)  │ │
│  │  - Real-time writes      │ │    │  │  - Async replication     │ │
│  └──────────────────────────┘ │    │  │  - RPO < 1 minute        │ │
│                                │    │  └──────────────────────────┘ │
│  ┌──────────────────────────┐ │    │                                │
│  │  S3 (Primary)            │─┼────┼─▶  S3 (Cross-region replica) │
│  └──────────────────────────┘ │    │                                │
│                                │    │                                │
└────────────────────────────────┘    └────────────────────────────────┘

         Route 53 Failover
         ──────────────────
         Primary (Healthy) → ap-southeast-1
         Failover (if unhealthy) → ap-southeast-3
```

### 5.2. DR Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| RTO (Recovery Time Objective) | < 1 hour | ~30 minutes |
| RPO (Recovery Point Objective) | < 5 minutes | ~1 minute (Aurora Global) |
| Failover trigger | Automated | Route 53 health checks |
| DR test frequency | Quarterly | - |

---

## 6. Capacity Planning

### 6.1. Growth Projections

| Metric | Month 3 (MVP) | Month 6 (v1.0) | Month 12 (v2.0) | Month 24 |
|--------|---------------|-----------------|------------------|----------|
| Monthly Active Users | 5K | 20K | 50K | 200K |
| Concurrent Users | 500 | 2K | 5K | 20K |
| API Requests/day | 100K | 500K | 2M | 10M |
| Database Size | 10GB | 50GB | 200GB | 1TB |
| Document Storage | 5GB | 20GB | 100GB | 500GB |

### 6.2. Scaling Triggers

| Resource | Scale Up Trigger | Scale Down Trigger | Cooldown |
|----------|-----------------|-------------------|----------|
| EKS Nodes | CPU > 70% for 5 min | CPU < 30% for 15 min | 5 min |
| Pod Replicas | CPU > 60% | CPU < 20% | 3 min |
| Aurora Read Replicas | Connections > 80% | Connections < 30% | 15 min |
| Redis | Memory > 75% | Manual | - |
