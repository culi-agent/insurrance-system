# Software Architecture Document (SAD)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Kiến trúc sư | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Giới thiệu

### 1.1. Mục đích tài liệu

Tài liệu Software Architecture Document (SAD) mô tả kiến trúc tổng thể của hệ thống Insurance System Platform, bao gồm:
- Các quyết định kiến trúc quan trọng
- Cấu trúc hệ thống và các thành phần
- Mối quan hệ giữa các components
- Các architectural patterns được sử dụng
- Constraints và trade-offs

### 1.2. Phạm vi

Insurance System là nền tảng bán bảo hiểm trực tuyến (InsurTech Platform) phục vụ:
- Khách hàng cá nhân & doanh nghiệp (B2C, B2B)
- Quản trị viên hệ thống (Admin)
- Đối tác bảo hiểm (Insurance Partners)

### 1.3. Tài liệu tham chiếu

| Tài liệu | Mô tả |
|-----------|--------|
| 01-product-vision.md | Tầm nhìn sản phẩm |
| 01-BRD.md | Business Requirements Document |
| 03-SRS.md | Software Requirements Specification |
| 04-functional-requirements.md | Yêu cầu chức năng chi tiết |
| 05-non-functional-requirements.md | Yêu cầu phi chức năng |
| 03-domain-model.md | Mô hình miền nghiệp vụ |

---

## 2. Architectural Goals & Constraints

### 2.1. Architectural Goals

| # | Goal | Priority | Rationale |
|---|------|----------|-----------|
| AG-1 | Scalability | High | Hỗ trợ 10,000 concurrent users, scale to 2M users Year 3 |
| AG-2 | Availability | High | 99.9% uptime, < 1h RTO |
| AG-3 | Security | Critical | PII data, financial transactions, regulatory compliance |
| AG-4 | Performance | High | API < 500ms, Quote < 5s, Page load < 1.5s |
| AG-5 | Maintainability | High | Microservices, CI/CD, < 1 day lead time |
| AG-6 | Extensibility | Medium | Dễ dàng thêm sản phẩm mới, đối tác mới |
| AG-7 | Interoperability | Medium | Tích hợp với nhiều insurers, payment gateways |

### 2.2. Architectural Constraints

| # | Constraint | Type | Impact |
|---|-----------|------|--------|
| AC-1 | Data phải lưu trữ tại Việt Nam | Regulatory | Chọn AWS AP-Southeast region |
| AC-2 | Tuân thủ PCI-DSS Level 3 | Compliance | Không lưu card data, tokenization |
| AC-3 | Budget Year 1: 15 tỷ VND | Financial | Tối ưu chi phí infrastructure |
| AC-4 | MVP trong 3 tháng | Timeline | Prioritize core features |
| AC-5 | Team size: 10-15 engineers | Resource | Phù hợp microservices scale |
| AC-6 | Tuân thủ Luật KDBH 2022 | Regulatory | Audit trail, data retention 10 năm |

### 2.3. Quality Attribute Scenarios

| Quality Attribute | Scenario | Measure |
|-------------------|----------|---------|
| Performance | User requests a quote during peak hours | Response < 5s for 95% requests |
| Scalability | Traffic spikes 3x during promotion | Auto-scale handles without degradation |
| Availability | Primary DB fails | Failover to replica < 60s, zero data loss |
| Security | Attacker attempts SQL injection | All inputs sanitized, attack logged & blocked |
| Modifiability | New insurer partner onboarded | Integration < 2 weeks with adapter pattern |
| Testability | New feature deployed | 80% unit test coverage, automated E2E |

---

## 3. Architectural Style & Patterns

### 3.1. Overall Architecture Style

**Modular Monolith → Microservices (Progressive)**

Giai đoạn 1 (MVP): Modular Monolith với clean boundaries
Giai đoạn 2 (Growth): Extract high-traffic modules thành microservices
Giai đoạn 3 (Scale): Full microservices architecture

```
Phase 1 (MVP - 3 months):
┌─────────────────────────────────────────────────┐
│              MODULAR MONOLITH                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  Auth  │ │Product │ │ Policy │ │Payment │  │
│  │ Module │ │ Module │ │ Module │ │ Module │  │
│  └────────┘ └────────┘ └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ Quote  │ │ Claims │ │ Notif  │ │  Doc   │  │
│  │ Module │ │ Module │ │ Module │ │ Module │  │
│  └────────┘ └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────────────────┘

Phase 2 (Growth - 6-12 months):
┌──────────┐  ┌──────────┐  ┌──────────────────────┐
│   Auth   │  │ Payment  │  │   Core Application   │
│ Service  │  │ Service  │  │  (Product, Policy,   │
│(extracted)│  │(extracted)│  │   Quote, Claims)     │
└──────────┘  └──────────┘  └──────────────────────┘

Phase 3 (Scale - Year 2+):
Full Microservices (each module = independent service)
```

### 3.2. Architectural Patterns Applied

| Pattern | Where Applied | Rationale |
|---------|--------------|-----------|
| Layered Architecture | Each module/service | Separation of concerns |
| API Gateway | Entry point | Auth, routing, rate limiting |
| CQRS | Reporting module | Tách read/write cho performance |
| Event-Driven | Cross-service communication | Loose coupling, async processing |
| Repository Pattern | Data access layer | Abstract data source |
| Adapter Pattern | External integrations | Isolate third-party dependencies |
| Circuit Breaker | External API calls | Fault tolerance |
| Saga Pattern | Purchase flow (future) | Distributed transaction |
| Strategy Pattern | Pricing engine | Multiple pricing algorithms |
| Observer Pattern | Notifications | Event-based notifications |

### 3.3. Design Principles

- **SOLID** principles cho code-level design
- **DDD (Domain-Driven Design)** cho business logic organization
- **12-Factor App** cho cloud-native development
- **API-First Design** cho service interfaces
- **Security by Design** cho mọi layer

---

## 4. System Architecture Overview

### 4.1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Customer    │  │    Admin     │  │   Partner    │                  │
│  │  Web App     │  │    Panel     │  │   Portal     │                  │
│  │  (React)     │  │   (React)    │  │   (React)    │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
└─────────┼──────────────────┼──────────────────┼─────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFront)                                   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────┐
│                        API GATEWAY (Kong/AWS API GW)                      │
│           Authentication │ Rate Limiting │ Routing │ Logging             │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────┐
│                        APPLICATION LAYER                                  │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │  Auth   │ │ Product │ │  Quote  │ │ Policy  │ │ Claims  │         │
│  │ Service │ │ Service │ │ Service │ │ Service │ │ Service │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                      │
│  │ Payment │ │  Notif  │ │Document │ │Integrat.│                      │
│  │ Service │ │ Service │ │ Service │ │ Service │                      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                      │
│                                                                           │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────┐
│                         DATA LAYER                                        │
│                                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ PostgreSQL │  │   Redis    │  │    S3      │  │Elasticsearch│       │
│  │ (Primary)  │  │  (Cache)   │  │ (Documents)│  │  (Search)   │       │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Insurer  │  │ Payment  │  │   eKYC   │  │  Email/  │              │
│  │   APIs   │  │ Gateways │  │ Provider │  │   SMS    │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC ZONE                                │
│  ┌──────────┐  ┌──────────┐                                    │
│  │   CDN    │  │   WAF    │                                    │
│  └──────────┘  └──────────┘                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                        DMZ                                        │
│  ┌──────────────────────────────────────────┐                   │
│  │           API Gateway / Load Balancer     │                   │
│  └──────────────────────────────────────────┘                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    APPLICATION ZONE                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Svc A  │ │ Svc B  │ │ Svc C  │ │ Svc D  │ │ Svc E  │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                      DATA ZONE                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │   DB    │ │  Cache  │ │  Queue  │ │ Storage │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Application Architecture

### 5.1. Module Structure (Layered)

```
Each Service/Module follows:

┌─────────────────────────────────────┐
│          Presentation Layer          │
│  (Controllers, DTOs, Validation)     │
├─────────────────────────────────────┤
│          Application Layer           │
│  (Use Cases, Services, Commands)     │
├─────────────────────────────────────┤
│            Domain Layer              │
│  (Entities, Value Objects, Events)   │
├─────────────────────────────────────┤
│         Infrastructure Layer         │
│  (Repositories, External APIs,       │
│   Database, Message Queue)           │
└─────────────────────────────────────┘
```

### 5.2. Service Decomposition

| Service | Responsibility | Domain |
|---------|---------------|--------|
| Auth Service | Đăng ký, đăng nhập, authorization, session | Identity & Access |
| Product Service | Danh mục SP, chi tiết, so sánh, tìm kiếm | Product Catalog |
| Quote Service | Tính phí, so sánh giá từ nhiều insurer | Quotation |
| Policy Service | Quản lý hợp đồng lifecycle | Policy Management |
| Claims Service | Nộp, xử lý, chi trả bồi thường | Claims |
| Payment Service | Thanh toán, hoàn tiền, recurring | Payments |
| Notification Service | Email, SMS, in-app, push | Communication |
| Document Service | PDF generation, file storage, eKYC OCR | Documents |
| Integration Service | Adapter cho insurer APIs, payment GWs | External Integration |

### 5.3. Inter-Service Communication

```
Synchronous (REST API):
- Client → API Gateway → Service (request/response)
- Service → Service (for real-time data needs)

Asynchronous (Event/Message Queue):
- Policy Service → [PolicyActivated event] → Notification Service
- Payment Service → [PaymentConfirmed event] → Policy Service
- Claims Service → [ClaimApproved event] → Payment Service

Event Bus (Redis Pub/Sub / Bull Queue):
┌─────────┐    publish    ┌───────────┐    subscribe    ┌──────────┐
│ Policy  │──────────────▶│ Event Bus │────────────────▶│  Notif   │
│ Service │               │  (Redis)  │                 │ Service  │
└─────────┘               └───────────┘                 └──────────┘
```

---

## 6. Data Architecture

### 6.1. Database Strategy

| Concern | Solution | Justification |
|---------|----------|---------------|
| Primary DB | PostgreSQL 15 | ACID, JSON support, proven reliability |
| Caching | Redis 7 | In-memory speed, pub/sub, session store |
| Search | Elasticsearch | Full-text search, analytics aggregation |
| File Storage | AWS S3 | Scalable, cost-effective, CDN integration |
| Message Queue | Bull (Redis-based) | Job scheduling, retries, priorities |

### 6.2. Data Partitioning Strategy

```
Phase 1: Single Database (< 1M records per table)
- All services share one PostgreSQL instance
- Logical separation by schema

Phase 2: Read Replicas (1M - 10M records)
- 1 Primary (writes) + 2 Read Replicas (reads)
- Application-level routing

Phase 3: Service-specific databases (> 10M records)
- Each major service gets own database
- Event sourcing for data sync
```

### 6.3. Caching Strategy

| Cache Type | TTL | Use Case |
|-----------|-----|----------|
| Product catalog | 1 hour | Product listings, details |
| Quote results | 30 minutes | Recent quote lookups |
| User session | 15 min / 7 days | Auth tokens |
| Rate limiting | 1 minute | API throttling counters |
| Config/Feature flags | 5 minutes | System configuration |
| Search results | 10 minutes | Popular search queries |

---

## 7. Security Architecture

### 7.1. Security Layers

```
Layer 1: Network Security
├── WAF (Web Application Firewall)
├── DDoS Protection (AWS Shield)
├── VPC with private subnets
└── Security Groups & NACLs

Layer 2: Application Security
├── API Gateway authentication
├── JWT token validation
├── Input validation & sanitization
├── CORS policy
└── Rate limiting

Layer 3: Data Security
├── Encryption at rest (AES-256)
├── Encryption in transit (TLS 1.3)
├── PII data masking in logs
├── Database-level encryption
└── Key management (AWS KMS)

Layer 4: Access Control
├── RBAC (Role-Based Access Control)
├── Resource ownership validation
├── Principle of least privilege
└── Audit logging
```

### 7.2. Authentication Flow

```
┌──────┐          ┌───────────┐          ┌──────────┐
│Client│          │API Gateway│          │Auth Svc  │
└──┬───┘          └─────┬─────┘          └────┬─────┘
   │  POST /auth/login  │                     │
   │───────────────────▶│  Validate request   │
   │                    │────────────────────▶│
   │                    │                     │ Verify credentials
   │                    │  JWT tokens         │ Generate tokens
   │                    │◀────────────────────│
   │  Set HttpOnly      │                     │
   │  cookie + response │                     │
   │◀───────────────────│                     │
   │                    │                     │
   │  GET /api/resource │                     │
   │───────────────────▶│  Validate JWT       │
   │                    │────────────────────▶│
   │                    │  Token valid        │
   │                    │◀────────────────────│
   │                    │  Forward request    │
   │  Response          │                     │
   │◀───────────────────│                     │
```

### 7.3. Data Classification

| Level | Classification | Examples | Protection |
|-------|---------------|----------|------------|
| L1 | Public | Product info, FAQ | None required |
| L2 | Internal | System configs, reports | Access control |
| L3 | Confidential | Customer PII, policies | Encryption + access control |
| L4 | Restricted | Financial data, health data | Encryption + strict access + audit |

---

## 8. Infrastructure Architecture

### 8.1. Cloud Infrastructure (AWS)

| Service | AWS Component | Purpose |
|---------|--------------|---------|
| Compute | EC2 / ECS Fargate | Application hosting |
| Database | RDS PostgreSQL | Relational data |
| Cache | ElastiCache Redis | Caching & queues |
| Storage | S3 | File/document storage |
| CDN | CloudFront | Static assets delivery |
| DNS | Route 53 | Domain management |
| Load Balancer | ALB | Traffic distribution |
| Container | ECR | Docker image registry |
| Monitoring | CloudWatch | Metrics & alerts |
| Security | WAF, Shield, KMS | Security services |
| Secrets | Secrets Manager | Credential storage |

### 8.2. Environment Strategy

| Environment | Purpose | Infra Scale | Data |
|-------------|---------|-------------|------|
| Development | Feature development | Minimal (1 instance) | Mock/Seed data |
| Staging | Integration testing | Production-like (2 instances) | Anonymized prod data |
| Production | Live system | Full scale (2-20 instances) | Real data |
| DR | Disaster recovery | Standby | Replicated data |

---

## 9. Cross-Cutting Concerns

### 9.1. Logging

```
Log Format (Structured JSON):
{
  "timestamp": "2026-05-15T10:30:00.000Z",
  "level": "info|warn|error|debug",
  "service": "policy-service",
  "traceId": "abc-123-def",
  "userId": "user-uuid",
  "action": "create_policy",
  "message": "Policy created successfully",
  "metadata": { ... }
}
```

### 9.2. Error Handling Strategy

| Error Type | HTTP Code | Handling | User Impact |
|-----------|-----------|----------|-------------|
| Validation | 400 | Return field errors | Show form errors |
| Authentication | 401 | Redirect to login | Session expired |
| Authorization | 403 | Log + block | Access denied message |
| Not Found | 404 | Return friendly message | 404 page |
| Business Rule | 422 | Return explanation | Show business error |
| Server Error | 500 | Log + alert + fallback | Generic error page |
| Service Unavailable | 503 | Circuit breaker + retry | Retry message |

### 9.3. Observability Stack

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Metrics   │     │   Logging   │     │   Tracing   │
│ (Prometheus)│     │(ELK Stack)  │     │  (Jaeger)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              Grafana Dashboard                        │
│  (Unified view: metrics + logs + traces)             │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│              Alerting (PagerDuty / OpsGenie)          │
└─────────────────────────────────────────────────────┘
```

---

## 10. Deployment Architecture

### 10.1. CI/CD Pipeline

```
Code Push → GitHub Actions Pipeline:

┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  Lint  │─▶│  Test  │─▶│ Build  │─▶│ Deploy │─▶│Verify  │
│& Format│  │(Unit+  │  │(Docker)│  │(Rolling│  │(Health │
│        │  │ Integ) │  │        │  │  /Blue-│  │ check) │
│        │  │        │  │        │  │  Green)│  │        │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘
```

### 10.2. Deployment Strategy

| Strategy | When | Rollback |
|----------|------|----------|
| Rolling Update | Normal releases | Auto-rollback on health check fail |
| Blue-Green | Major releases | Instant switch back to old version |
| Canary | Risky changes | Route 10% traffic → monitor → full roll |

---

## 11. Architecture Decision Summary

| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| AD-1 | Node.js + TypeScript backend | Java Spring, Go, Python | Fast development, async I/O, team skill |
| AD-2 | React + TypeScript frontend | Vue, Angular, Next.js | Ecosystem, community, hiring pool |
| AD-3 | PostgreSQL primary database | MySQL, MongoDB | ACID, JSON support, extensions |
| AD-4 | Modular Monolith first | Full microservices from start | Faster MVP, avoid premature complexity |
| AD-5 | REST API | GraphQL, gRPC | Simplicity, caching, tooling |
| AD-6 | AWS cloud | GCP, Azure, On-premise | Market leader, Vietnam region, services |
| AD-7 | Redis for cache + queue | RabbitMQ, Kafka | Simplicity, multi-purpose, team familiarity |
| AD-8 | TypeORM | Prisma, Knex, Sequelize | TypeScript native, migrations, relations |

---

## 12. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Monolith becomes hard to maintain | Medium | High | Clean module boundaries, DDD, prepare service extraction |
| Database bottleneck at scale | Medium | High | Read replicas, caching strategy, query optimization |
| Third-party API instability | High | Medium | Circuit breaker, fallback data, SLA monitoring |
| Security breach | Low | Critical | Defense in depth, regular pen testing, SOC2 roadmap |
| Team key-person dependency | Medium | Medium | Documentation, pair programming, knowledge sharing |
| Technology obsolescence | Low | Medium | Mainstream tech choices, minimal custom frameworks |

---

## 13. Glossary

| Term | Definition |
|------|-----------|
| SAD | Software Architecture Document |
| API Gateway | Entry point xử lý auth, routing, rate limiting |
| Bounded Context | Ranh giới nghiệp vụ trong DDD |
| Circuit Breaker | Pattern ngắt kết nối khi service lỗi liên tục |
| CQRS | Command Query Responsibility Segregation |
| DDD | Domain-Driven Design |
| Event Sourcing | Lưu trữ events thay vì state |
| Modular Monolith | Monolith với module boundaries rõ ràng |
| RBAC | Role-Based Access Control |
| SLA | Service Level Agreement |
