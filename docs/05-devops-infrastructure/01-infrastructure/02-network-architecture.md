# Network Architecture - Kiến Trúc Mạng

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người phụ trách | DevOps Team |

---

## 1. Tổng Quan Network

### 1.1. VPC Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VPC: insurance-system-vpc                              │
│                    CIDR: 10.0.0.0/16                                     │
│                    Region: ap-southeast-1 (Singapore)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐    │
│  │  Availability Zone A          │  │  Availability Zone B          │    │
│  │  (ap-southeast-1a)           │  │  (ap-southeast-1b)           │    │
│  │                               │  │                               │    │
│  │  ┌─────────────────────────┐ │  │  ┌─────────────────────────┐ │    │
│  │  │ Public Subnet A         │ │  │  │ Public Subnet B         │ │    │
│  │  │ 10.0.1.0/24             │ │  │  │ 10.0.2.0/24             │ │    │
│  │  │ ┌─────┐ ┌─────┐       │ │  │  │ ┌─────┐ ┌─────┐       │ │    │
│  │  │ │ ALB │ │ NAT │       │ │  │  │ │ ALB │ │ NAT │       │ │    │
│  │  │ └─────┘ └─────┘       │ │  │  │ └─────┘ └─────┘       │ │    │
│  │  └─────────────────────────┘ │  │  └─────────────────────────┘ │    │
│  │                               │  │                               │    │
│  │  ┌─────────────────────────┐ │  │  ┌─────────────────────────┐ │    │
│  │  │ Private Subnet A (App)  │ │  │  │ Private Subnet B (App)  │ │    │
│  │  │ 10.0.10.0/24            │ │  │  │ 10.0.11.0/24            │ │    │
│  │  │ ┌───────────────────┐  │ │  │  │ ┌───────────────────┐  │ │    │
│  │  │ │   EKS Workers     │  │ │  │  │ │   EKS Workers     │  │ │    │
│  │  │ │   (Pods)          │  │ │  │  │ │   (Pods)          │  │ │    │
│  │  │ └───────────────────┘  │ │  │  │ └───────────────────┘  │ │    │
│  │  └─────────────────────────┘ │  │  └─────────────────────────┘ │    │
│  │                               │  │                               │    │
│  │  ┌─────────────────────────┐ │  │  ┌─────────────────────────┐ │    │
│  │  │ Private Subnet A (Data) │ │  │  │ Private Subnet B (Data) │ │    │
│  │  │ 10.0.20.0/24            │ │  │  │ 10.0.21.0/24            │ │    │
│  │  │ ┌─────┐ ┌─────┐       │ │  │  │ ┌─────┐ ┌─────┐       │ │    │
│  │  │ │ RDS │ │Redis│       │ │  │  │ │ RDS │ │Redis│       │ │    │
│  │  │ └─────┘ └─────┘       │ │  │  │ └─────┘ └─────┘       │ │    │
│  │  └─────────────────────────┘ │  │  └─────────────────────────┘ │    │
│  │                               │  │                               │    │
│  └──────────────────────────────┘  └──────────────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Subnet Allocation

| Subnet Name | CIDR | AZ | Type | Purpose |
|-------------|------|-----|------|---------|
| public-subnet-a | 10.0.1.0/24 | ap-southeast-1a | Public | ALB, NAT Gateway, Bastion |
| public-subnet-b | 10.0.2.0/24 | ap-southeast-1b | Public | ALB, NAT Gateway |
| private-app-subnet-a | 10.0.10.0/24 | ap-southeast-1a | Private | EKS worker nodes |
| private-app-subnet-b | 10.0.11.0/24 | ap-southeast-1b | Private | EKS worker nodes |
| private-data-subnet-a | 10.0.20.0/24 | ap-southeast-1a | Private | RDS, Redis, OpenSearch |
| private-data-subnet-b | 10.0.21.0/24 | ap-southeast-1b | Private | RDS, Redis, OpenSearch |

---

## 2. Traffic Flow

### 2.1. Inbound Traffic (User → Application)

```
User Request
    │
    ▼
┌──────────┐
│ Route 53 │  DNS Resolution → insurance-system.vn
└────┬─────┘
     │
     ▼
┌──────────┐
│CloudFront│  Static assets cached at edge (CSS, JS, images)
└────┬─────┘
     │ (Dynamic requests only)
     ▼
┌──────────┐
│   WAF    │  Rule evaluation: Rate limiting, SQL injection, XSS
└────┬─────┘
     │ (Allowed traffic)
     ▼
┌──────────┐
│   ALB    │  Path-based routing:
└────┬─────┘  /api/* → Backend services
     │        /* → Frontend (S3 origin)
     ▼
┌──────────┐
│  Ingress │  Kubernetes Ingress Controller (NGINX)
│Controller│  TLS termination, path routing to services
└────┬─────┘
     │
     ▼
┌──────────┐
│  Service │  Kubernetes Service (ClusterIP)
│  (K8s)   │  Load balance across pods
└────┬─────┘
     │
     ▼
┌──────────┐
│   Pod    │  Application container
└──────────┘
```

### 2.2. Service-to-Service Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                    EKS CLUSTER                                    │
│                                                                   │
│  Service A ──── ClusterIP ────▶ Service B                        │
│     │                              │                              │
│     │         ┌──────────┐         │                              │
│     └────────▶│  Service │◀────────┘                              │
│               │   Mesh   │                                        │
│               │ (Istio)  │                                        │
│               └──────────┘                                        │
│                    │                                              │
│                    ▼                                              │
│  Features:                                                        │
│  • mTLS between services                                         │
│  • Traffic management (retries, circuit breaker)                 │
│  • Observability (tracing, metrics)                              │
│  • Rate limiting per service                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3. Outbound Traffic (Application → External)

```
Pod (Private Subnet)
    │
    ▼
┌──────────┐
│NAT Gateway│  Source NAT → Elastic IP
└────┬─────┘
     │
     ▼
┌──────────┐
│ Internet │  External API calls:
│ Gateway  │  • Insurer APIs
└────┬─────┘  • Payment Gateways (VNPay, Momo, ZaloPay)
     │        • eKYC Provider
     ▼        • SendGrid (Email)
┌──────────┐  • Twilio/FPT (SMS)
│ External │
│ Services │
└──────────┘
```

---

## 3. Security Groups & Network ACLs

### 3.1. Security Groups

| Security Group | Inbound Rules | Outbound Rules | Attached To |
|---------------|---------------|----------------|-------------|
| sg-alb | 80/443 from 0.0.0.0/0 | All to sg-eks-nodes | ALB |
| sg-eks-nodes | All from sg-alb; All from sg-eks-nodes | All to 0.0.0.0/0 (via NAT) | EKS Worker Nodes |
| sg-rds | 5432 from sg-eks-nodes | None | RDS Aurora |
| sg-redis | 6379 from sg-eks-nodes | None | ElastiCache |
| sg-opensearch | 9200/9300 from sg-eks-nodes | None | OpenSearch |
| sg-bastion | 22 from VPN CIDR only | All | Bastion Host |

### 3.2. Network ACLs

| NACL | Subnet | Inbound | Outbound |
|------|--------|---------|----------|
| nacl-public | Public subnets | 80, 443, 22 (VPN), Ephemeral | All |
| nacl-private-app | App subnets | All from VPC | All to VPC, HTTPS to 0.0.0.0/0 |
| nacl-private-data | Data subnets | 5432, 6379, 9200 from App subnets | Ephemeral to App subnets |

---

## 4. DNS Architecture

### 4.1. Domain Structure

```
insurance-system.vn (Primary domain)
├── www.insurance-system.vn          → CloudFront (Frontend)
├── api.insurance-system.vn          → ALB (Backend API)
├── admin.insurance-system.vn        → CloudFront (Admin Panel)
├── ws.insurance-system.vn           → ALB (WebSocket)
├── cdn.insurance-system.vn          → CloudFront (Static assets)
│
├── staging.insurance-system.vn      → Staging Frontend
├── api-staging.insurance-system.vn  → Staging API
│
└── internal.insurance-system.vn     (Private Hosted Zone)
    ├── db.internal                  → RDS endpoint
    ├── redis.internal               → ElastiCache endpoint
    ├── es.internal                  → OpenSearch endpoint
    └── *.svc.internal              → Kubernetes services
```

### 4.2. DNS Routing Policy

| Domain | Routing Policy | Health Check | Failover |
|--------|---------------|--------------|----------|
| www.insurance-system.vn | Simple | CloudFront health | N/A (CloudFront handles) |
| api.insurance-system.vn | Weighted (Primary: 100%) | ALB health check | DR region (0% → 100%) |

---

## 5. SSL/TLS Configuration

### 5.1. Certificate Management

| Domain | Certificate Provider | Auto-Renewal | Type |
|--------|---------------------|--------------|------|
| *.insurance-system.vn | AWS ACM | Yes (auto) | Wildcard |
| *.internal.insurance-system.vn | AWS Private CA | Yes | Internal |
| Service-to-service | Istio CA (cert-manager) | Yes (auto-rotate) | mTLS |

### 5.2. TLS Configuration

```yaml
# ALB/Ingress TLS Policy
TLS_Protocol: TLSv1.2, TLSv1.3
Cipher_Suites:
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
  - TLS_AES_128_GCM_SHA256
  - ECDHE-RSA-AES256-GCM-SHA384
  - ECDHE-RSA-AES128-GCM-SHA256
HSTS: max-age=31536000; includeSubDomains; preload
```

---

## 6. VPN & Remote Access

### 6.1. VPN Architecture

```
Developer/Ops Machine
        │
        ▼
┌──────────────┐
│  AWS Client  │  VPN Connection
│  VPN         │  (OpenVPN / WireGuard)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  VPN Endpoint│  10.0.100.0/24
│  (Private)   │
└──────┬───────┘
       │
       ├────▶ Bastion Host (SSH to internal resources)
       ├────▶ EKS API Server (kubectl access)
       ├────▶ RDS (Database administration)
       └────▶ Internal dashboards (Grafana, Kibana)
```

### 6.2. Access Matrix

| Role | VPN Access | Bastion | EKS | RDS Direct | Internal Dashboards |
|------|-----------|---------|-----|-----------|-------------------|
| DevOps Engineer | ✓ | ✓ | ✓ (admin) | ✓ (read-write) | ✓ |
| Backend Developer | ✓ | ✓ | ✓ (namespace) | ✓ (read-only) | ✓ |
| Frontend Developer | ✗ | ✗ | ✗ | ✗ | ✓ (Grafana only) |
| QA Engineer | ✓ | ✗ | ✓ (staging only) | ✓ (staging read) | ✓ |
| Product Manager | ✗ | ✗ | ✗ | ✗ | ✓ (dashboards) |

---

## 7. Network Monitoring

### 7.1. Monitoring Points

| What | Tool | Metric | Alert Threshold |
|------|------|--------|-----------------|
| VPC Flow Logs | CloudWatch | Traffic patterns, rejected connections | Spike > 3x normal |
| ALB Metrics | CloudWatch | Request count, latency, 5xx errors | 5xx > 1%, latency > 2s |
| NAT Gateway | CloudWatch | Bytes processed, connections | > 80% capacity |
| DNS Queries | Route 53 | Query volume, NXDOMAIN | NXDOMAIN > 5% |
| Network I/O | Node Exporter | Bandwidth per pod/node | Saturation > 80% |

### 7.2. Network Troubleshooting

```
Issue: Service cannot reach external API
──────────────────────────────────────────
1. Check pod network policy → kubectl get networkpolicy
2. Check security group outbound rules
3. Check NAT Gateway status
4. Check route table (0.0.0.0/0 → NAT GW)
5. Check DNS resolution → nslookup from pod
6. Check VPC flow logs for REJECT entries

Issue: High latency between services
──────────────────────────────────────────
1. Check if pods are in same AZ → kubectl get pods -o wide
2. Check network bandwidth saturation
3. Check service mesh (Istio) sidecar metrics
4. Check DNS resolution time (internal)
5. Review connection pooling settings
```
