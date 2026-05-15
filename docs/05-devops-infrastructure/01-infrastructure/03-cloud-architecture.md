# Cloud Architecture - Kiến Trúc Đám Mây

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Cloud Provider | Amazon Web Services (AWS) |
| Primary Region | ap-southeast-1 (Singapore) |

---

## 1. AWS Account Strategy

### 1.1. Multi-Account Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Organization                               │
│                    (Management Account)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Production  │  │   Staging    │  │ Development  │          │
│  │   Account    │  │   Account    │  │   Account    │          │
│  │              │  │              │  │              │          │
│  │ • Live apps  │  │ • QA/UAT    │  │ • Dev envs   │          │
│  │ • Prod data  │  │ • Testing   │  │ • Sandbox    │          │
│  │ • DR region  │  │ • Preview   │  │ • Experiments│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │   Shared     │  │   Security   │                             │
│  │  Services    │  │   Account    │                             │
│  │              │  │              │                             │
│  │ • CI/CD      │  │ • CloudTrail │                             │
│  │ • ECR        │  │ • GuardDuty  │                             │
│  │ • Artifacts  │  │ • Config     │                             │
│  │ • DNS        │  │ • IAM        │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Account Purpose

| Account | Purpose | Budget Limit | Owner |
|---------|---------|-------------|-------|
| Management | Organization management, billing | N/A | CTO |
| Production | Live application workloads | $5,000/month | DevOps Lead |
| Staging | Pre-production testing | $1,500/month | DevOps Lead |
| Development | Development & experimentation | $800/month | Dev Lead |
| Shared Services | Cross-account shared resources | $500/month | DevOps Lead |
| Security | Centralized security & audit | $200/month | Security Lead |

---

## 2. AWS Services Architecture

### 2.1. Service Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AWS SERVICES MAP                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  COMPUTE                    NETWORKING              STORAGE               │
│  ───────                    ──────────              ───────               │
│  • EKS (Kubernetes)         • VPC                   • S3 (Objects)        │
│  • EC2 (Workers)            • ALB                   • EBS (Volumes)       │
│  • Lambda (Serverless)      • CloudFront            • EFS (Shared FS)     │
│  • Fargate (Batch jobs)     • Route 53                                    │
│                             • NAT Gateway                                │
│                             • VPN                                         │
│                                                                           │
│  DATABASE                   SECURITY                MESSAGING             │
│  ────────                   ────────                ─────────             │
│  • Aurora PostgreSQL        • WAF                   • SQS (Queue)         │
│  • ElastiCache Redis        • Shield                • SNS (PubSub)        │
│  • OpenSearch               • KMS                   • SES (Email)         │
│  • DynamoDB (Sessions)      • Secrets Manager       • EventBridge         │
│                             • ACM (Certs)                                 │
│                             • IAM                                         │
│                                                                           │
│  MONITORING                 CI/CD                   AI/ML                 │
│  ──────────                 ─────                   ─────                 │
│  • CloudWatch               • ECR (Container)       • Textract (OCR)      │
│  • X-Ray (Tracing)          • CodePipeline*         • Rekognition (Face)  │
│  • CloudTrail (Audit)       • GitHub Actions        • Comprehend (NLP)    │
│  • GuardDuty (Threat)       • ArgoCD                • SageMaker (ML)      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Service Selection Rationale

| Service | Selected | Alternative Considered | Rationale |
|---------|----------|----------------------|-----------|
| EKS | ✓ | ECS, Fargate | Kubernetes portability, team expertise |
| Aurora PostgreSQL | ✓ | RDS PostgreSQL, CockroachDB | Managed, Multi-AZ auto, read replicas |
| ElastiCache Redis | ✓ | MemoryDB, Self-managed | Managed, cluster mode, low latency |
| OpenSearch | ✓ | CloudSearch, Algolia | Full-text search + analytics |
| CloudFront | ✓ | Cloudflare, Fastly | Native AWS integration |
| ALB | ✓ | NLB, API Gateway | Layer 7, path-based routing |
| SQS | ✓ | RabbitMQ, Kafka | Serverless, reliable, simple |
| Lambda | ✓ (auxiliary) | - | Event-driven tasks (image resize, cleanup) |

---

## 3. EKS (Kubernetes) Architecture

### 3.1. Cluster Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    EKS CLUSTER                                    │
│                    Version: 1.28                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  NAMESPACES:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  production    │ Services, deployments, configmaps       │   │
│  │  monitoring    │ Prometheus, Grafana, AlertManager       │   │
│  │  logging       │ Fluent Bit, Elasticsearch              │   │
│  │  ingress       │ NGINX Ingress Controller               │   │
│  │  cert-manager  │ TLS certificate automation             │   │
│  │  istio-system  │ Service mesh control plane             │   │
│  │  argocd        │ GitOps deployment                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  NODE GROUPS:                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  general       │ m5.large  │ 3-8 nodes  │ App services  │   │
│  │  memory        │ r5.large  │ 2-4 nodes  │ Cache-heavy   │   │
│  │  spot          │ m5.large  │ 0-4 nodes  │ Batch/non-crit│   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. Service Deployment Topology

| Service | Replicas | CPU Request | Memory Request | Node Group |
|---------|----------|-------------|----------------|------------|
| auth-service | 2-4 | 250m | 512Mi | general |
| product-service | 2-4 | 250m | 512Mi | general |
| policy-service | 2-4 | 500m | 1Gi | general |
| quote-service | 2-6 | 500m | 512Mi | general |
| claims-service | 2-4 | 250m | 512Mi | general |
| payment-service | 2-4 | 250m | 512Mi | general |
| notification-service | 2-3 | 250m | 256Mi | general |
| document-service | 2-4 | 500m | 1Gi | memory |
| integration-service | 2-4 | 250m | 512Mi | general |
| frontend (NGINX) | 2-3 | 100m | 128Mi | spot |

### 3.3. Kubernetes Add-ons

| Add-on | Version | Purpose |
|--------|---------|---------|
| AWS Load Balancer Controller | 2.6 | ALB/NLB provisioning |
| ExternalDNS | 0.14 | Auto DNS record management |
| Cluster Autoscaler | 1.28 | Node auto-scaling |
| Metrics Server | 0.6 | HPA metrics |
| cert-manager | 1.13 | TLS certificate automation |
| Istio | 1.20 | Service mesh |
| ArgoCD | 2.9 | GitOps deployments |
| Sealed Secrets | 0.24 | Secrets encryption |

---

## 4. Data Architecture (AWS)

### 4.1. Aurora PostgreSQL

```
┌─────────────────────────────────────────────────────────────┐
│                  AURORA CLUSTER                               │
│                                                               │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │  Writer Instance │     │  Reader Instance │               │
│  │  (db.r5.xlarge)  │     │  (db.r5.large)   │               │
│  │                   │     │                   │               │
│  │  • All writes     │     │  • Read queries   │               │
│  │  • Critical reads │     │  • Reports        │               │
│  │  • AZ-a           │     │  • Analytics      │               │
│  └─────────────────┘     │  • AZ-b           │               │
│           │               └─────────────────┘               │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────────────────────────────┐               │
│  │  Shared Storage Volume (Auto-expanding) │               │
│  │  • 6 copies across 3 AZs               │               │
│  │  • Continuous backup to S3              │               │
│  │  • Point-in-time recovery (35 days)     │               │
│  └─────────────────────────────────────────┘               │
│                                                               │
│  Configuration:                                              │
│  • Engine: Aurora PostgreSQL 15.4                            │
│  • Encryption: AES-256 (AWS KMS)                            │
│  • Backup: Continuous + daily snapshots                      │
│  • Monitoring: Enhanced Monitoring + Performance Insights     │
│  • Parameter Group: Custom (optimized for OLTP)              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2. ElastiCache Redis

```
Configuration:
• Engine: Redis 7.0
• Mode: Cluster mode enabled
• Shards: 3
• Replicas per shard: 1 (total 6 nodes)
• Node type: cache.r5.large
• Encryption: In-transit + At-rest
• Auth: AUTH token required
• Backup: Daily snapshot (7-day retention)

Use Cases:
├── Session Store (auth tokens, user sessions)
├── API Response Cache (product listings, quotes)
├── Rate Limiting (sliding window counters)
├── Real-time Data (notification counts, online status)
└── Queue (Bull job queue for background tasks)
```

### 4.3. S3 Storage Strategy

| Bucket | Purpose | Storage Class | Lifecycle |
|--------|---------|--------------|-----------|
| insurance-documents-prod | Policy docs, claims docs | Standard | → IA (90d) → Glacier (365d) |
| insurance-assets-prod | Static assets (images, CSS, JS) | Standard | CloudFront origin |
| insurance-backups-prod | DB snapshots, config backups | Standard-IA | → Glacier (30d), delete (365d) |
| insurance-logs-prod | Application logs archive | Standard-IA | Delete after 90d |
| insurance-uploads-temp | Temporary user uploads | Standard | Delete after 7d |

---

## 5. Serverless Components

### 5.1. Lambda Functions

| Function | Trigger | Purpose | Runtime | Timeout |
|----------|---------|---------|---------|---------|
| image-resize | S3 PutObject | Resize uploaded images | Node.js 20 | 30s |
| pdf-generate | SQS | Generate policy PDF | Node.js 20 | 60s |
| cleanup-expired | EventBridge (daily) | Clean expired quotes/sessions | Node.js 20 | 300s |
| db-backup-verify | EventBridge (daily) | Verify backup integrity | Python 3.12 | 120s |
| ekyc-callback | API Gateway | Handle eKYC async results | Node.js 20 | 15s |

### 5.2. EventBridge Rules

| Rule | Schedule/Event | Target | Purpose |
|------|---------------|--------|---------|
| daily-cleanup | cron(0 2 * * ? *) | Lambda: cleanup-expired | Remove stale data |
| renewal-reminder | cron(0 8 * * ? *) | Lambda → SQS | Send renewal emails |
| backup-verify | cron(0 6 * * ? *) | Lambda: db-backup-verify | Verify backups |
| payment-timeout | payment.timeout event | SQS → notification-service | Alert failed payments |

---

## 6. Security Architecture (AWS)

### 6.1. IAM Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    IAM STRUCTURE                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Service Roles (EC2/EKS):                                        │
│  ├── eks-cluster-role          (EKS control plane)               │
│  ├── eks-node-role             (EC2 instances)                   │
│  ├── eks-pod-role-{service}    (IRSA per microservice)           │
│  └── lambda-execution-role     (Lambda functions)                │
│                                                                   │
│  Human Access:                                                    │
│  ├── AdministratorAccess       (CTO, DevOps Lead)                │
│  ├── DevOpsEngineer            (Custom: EKS, ECR, S3, etc.)      │
│  ├── DeveloperReadOnly         (CloudWatch, logs, read-only)     │
│  └── SecurityAuditor           (CloudTrail, GuardDuty, Config)   │
│                                                                   │
│  Policy: Least Privilege                                         │
│  • IRSA (IAM Roles for Service Accounts) for pod-level access   │
│  • No long-lived access keys                                     │
│  • MFA required for all human users                              │
│  • Session duration: 1 hour (max 4 hours)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2. Encryption Strategy

| Data Type | At Rest | In Transit | Key Management |
|-----------|---------|-----------|----------------|
| Database | AES-256 (KMS CMK) | TLS 1.3 | AWS KMS (auto-rotate) |
| S3 Objects | SSE-KMS | HTTPS | AWS KMS (CMK per bucket) |
| Redis | AES-256 | TLS | AWS managed |
| Secrets | AES-256 | HTTPS | Secrets Manager |
| EBS Volumes | AES-256 (KMS) | N/A | AWS KMS |
| Backups | AES-256 | HTTPS | Same CMK as source |

### 6.3. Compliance Controls

| Requirement | AWS Service | Implementation |
|-------------|-------------|----------------|
| Data Residency (Vietnam) | Region selection | ap-southeast-1 (closest), future: VN region |
| Audit Trail | CloudTrail | All API calls logged, S3 archive |
| Threat Detection | GuardDuty | Enabled, alerts to PagerDuty |
| Configuration Compliance | AWS Config | 50+ rules, auto-remediation |
| Vulnerability Scanning | Inspector | Weekly scans on EKS/ECR |
| DDoS Protection | Shield Standard | Auto-enabled |
| Web Application Firewall | WAF | OWASP rules, rate limiting |

---

## 7. Cost Optimization

### 7.1. Cost Optimization Strategies

| Strategy | Implementation | Expected Savings |
|----------|---------------|-----------------|
| Reserved Instances | 1-year RI for stable workloads (RDS, Redis) | ~30-40% |
| Spot Instances | Non-critical EKS nodes (batch, dev) | ~60-70% |
| S3 Lifecycle | Auto-transition to cheaper storage classes | ~40% on storage |
| Right-sizing | Monthly review of instance utilization | ~15-20% |
| Auto-scaling | Scale down during off-peak (night, weekend) | ~20-30% |
| CloudFront Caching | Reduce origin requests | ~30% on bandwidth |

### 7.2. Budget Alerts

| Threshold | Action | Notification |
|-----------|--------|-------------|
| 50% of monthly budget | Info alert | Email to DevOps Lead |
| 75% of monthly budget | Warning alert | Email + Slack |
| 90% of monthly budget | Critical alert | Email + Slack + PagerDuty |
| 100% of monthly budget | Action required | Immediate review meeting |
| Anomaly detected | Auto-alert | All channels |
