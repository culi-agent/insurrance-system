# Tech Stack Decision - Quyết Định Công Nghệ

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Tổng quan Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSURANCE SYSTEM TECH STACK                    │
│                                                                   │
│  FRONTEND          BACKEND           DATA            INFRA       │
│  ─────────         ───────           ────            ─────       │
│  React 18          Node.js 20        PostgreSQL 15   AWS         │
│  TypeScript 5      Express 4         Redis 7         Docker      │
│  TailwindCSS 3     TypeScript 5      Elasticsearch 8 ECS Fargate │
│  Vite 5            TypeORM 0.3       AWS S3          GitHub Actions│
│  Zustand 4         Joi 17            Bull Queue      CloudFront  │
│  React Query 5     Winston 3                         Prometheus  │
│  React Hook Form   Jest                              Grafana     │
│  Zod               Supertest                         ELK Stack   │
│  Axios                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Stack

### 2.1. Core Framework & Language

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **React** | 18.x | UI Framework | Largest ecosystem, hiring pool VN, component-based |
| **TypeScript** | 5.x | Language | Type safety, better DX, refactoring confidence |
| **Vite** | 5.x | Build Tool | 10x faster than Webpack, native ESM, HMR |

### 2.2. State Management & Data Fetching

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **TanStack React Query** | 5.x | Server state | Caching, background sync, optimistic updates |
| **Zustand** | 4.x | Client state | Lightweight (1KB), simple API, no boilerplate |
| **React Hook Form** | 7.x | Form state | Performance (uncontrolled), minimal re-renders |

### 2.3. UI & Styling

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **TailwindCSS** | 3.x | Styling | Utility-first, rapid development, consistent design |
| **Headless UI** | 1.x | Accessible components | Unstyled, accessible, works with Tailwind |
| **Lucide Icons** | latest | Icons | Lightweight, tree-shakeable, consistent |

### 2.4. Routing & Validation

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **React Router** | 6.x | Routing | Standard, nested routes, data loading |
| **Zod** | 3.x | Schema validation | TypeScript-first, runtime validation, shared schemas |
| **Axios** | 1.x | HTTP client | Interceptors, request cancellation, retry |

### 2.5. Testing (Frontend)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Vitest** | latest | Unit tests |
| **React Testing Library** | latest | Component tests |
| **Playwright** | latest | E2E tests |
| **MSW** | latest | API mocking |

---

## 3. Backend Stack

### 3.1. Runtime & Framework

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **Node.js** | 20 LTS | Runtime | Async I/O, same language as FE, large ecosystem |
| **Express** | 4.x | HTTP Framework | Mature, minimal, flexible, huge middleware ecosystem |
| **TypeScript** | 5.x | Language | Type safety, shared types with FE |

### 3.2. Database & ORM

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **PostgreSQL** | 15.x | Primary DB | ACID, JSONB, extensions, proven reliability |
| **TypeORM** | 0.3.x | ORM | TypeScript native, migrations, decorators |
| **Redis** | 7.x | Cache/Queue/Session | In-memory speed, versatile, pub/sub |

### 3.3. Validation & Utilities

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **Joi** | 17.x | Request validation | Schema-based, comprehensive, error messages |
| **Winston** | 3.x | Logging | Transport-based, structured JSON, log levels |
| **bcryptjs** | 2.x | Password hashing | Industry standard, configurable rounds |
| **jsonwebtoken** | 9.x | JWT tokens | RS256 support, widely used |
| **helmet** | 7.x | Security headers | Easy OWASP headers setup |
| **cors** | 2.x | CORS management | Fine-grained origin control |
| **morgan** | 1.x | HTTP logging | Request logging middleware |

### 3.4. Background Jobs & Queues

| Technology | Version | Purpose | Justification |
|-----------|---------|---------|---------------|
| **Bull** | 4.x | Job queue | Redis-based, priorities, retries, scheduling |
| **node-cron** | 3.x | Scheduled tasks | Cron syntax, lightweight |

### 3.5. File & Document Processing

| Technology | Version | Purpose |
|-----------|---------|---------|
| **AWS SDK** | 3.x | S3 file operations |
| **PDFKit** / **Puppeteer** | latest | PDF generation |
| **Multer** | 1.x | File upload handling |
| **Sharp** | latest | Image processing/optimization |

### 3.6. Testing (Backend)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Jest** | 29.x | Unit & Integration tests |
| **Supertest** | 6.x | HTTP endpoint testing |
| **Testcontainers** | latest | DB integration tests |
| **Faker.js** | latest | Test data generation |

---

## 4. Infrastructure Stack

### 4.1. Cloud Services (AWS)

| Service | Purpose | Justification |
|---------|---------|---------------|
| **ECS Fargate** | Container hosting | Serverless containers, no EC2 management |
| **RDS** | Managed PostgreSQL | Auto-backup, Multi-AZ, patching |
| **ElastiCache** | Managed Redis | Cluster mode, failover, monitoring |
| **S3** | Object storage | Scalable, durable, CDN integration |
| **CloudFront** | CDN | Global edge, SSL, caching |
| **ALB** | Load balancer | Layer 7, health checks, path routing |
| **Route 53** | DNS | Failover, health checks, latency routing |
| **ECR** | Container registry | Private, integrated with ECS |
| **CloudWatch** | Monitoring | Logs, metrics, alarms |
| **Secrets Manager** | Credentials | Rotation, fine-grained access |
| **KMS** | Encryption keys | Managed keys, audit trail |
| **WAF** | Firewall | OWASP rules, rate limiting |
| **SES** | Email sending | Transactional emails, high deliverability |

### 4.2. DevOps & CI/CD

| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **GitHub Actions** | CI/CD pipeline | Integrated with repo, free tier generous |
| **Docker** | Containerization | Consistent environments, portable |
| **Terraform** | Infrastructure as Code | Declarative, multi-cloud support |
| **Docker Compose** | Local development | Multi-service local setup |

### 4.3. Monitoring & Observability

| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **Prometheus** | Metrics collection | Pull-based, powerful queries |
| **Grafana** | Dashboards | Visualization, alerting |
| **ELK Stack** | Log management | Full-text search, Kibana UI |
| **Jaeger** | Distributed tracing | OpenTelemetry compatible |
| **PagerDuty** | Alerting/On-call | Escalation, scheduling |

---

## 5. Decision Matrix

### 5.1. Frontend Framework Comparison

| Criteria (Weight) | React (18) | Vue (3) | Angular (17) | Next.js |
|-------------------|-----------|---------|-------------|---------|
| Ecosystem (25%) | 10 | 7 | 8 | 9 |
| Hiring Pool VN (20%) | 10 | 7 | 5 | 8 |
| Performance (15%) | 8 | 9 | 7 | 9 |
| Learning Curve (15%) | 7 | 9 | 5 | 7 |
| Flexibility (15%) | 9 | 8 | 6 | 7 |
| TypeScript Support (10%) | 9 | 8 | 10 | 9 |
| **Weighted Score** | **8.9** | **7.8** | **6.5** | **8.1** |

**Decision: React 18** ✓

### 5.2. Backend Runtime Comparison

| Criteria (Weight) | Node.js | Java Spring | Go | Python FastAPI |
|-------------------|---------|-------------|-----|---------------|
| Dev Speed (25%) | 9 | 6 | 7 | 9 |
| Performance (20%) | 7 | 8 | 10 | 6 |
| Ecosystem (20%) | 9 | 9 | 7 | 8 |
| Hiring Pool VN (15%) | 8 | 7 | 5 | 7 |
| Async I/O (10%) | 9 | 7 | 9 | 7 |
| Code Sharing w/ FE (10%) | 10 | 1 | 1 | 1 |
| **Weighted Score** | **8.5** | **7.0** | **7.1** | **7.2** |

**Decision: Node.js + TypeScript** ✓

### 5.3. Database Comparison

| Criteria (Weight) | PostgreSQL | MySQL | MongoDB | CockroachDB |
|-------------------|-----------|-------|---------|-------------|
| ACID Compliance (25%) | 10 | 9 | 6 | 10 |
| JSON Support (15%) | 9 | 6 | 10 | 8 |
| Scalability (20%) | 8 | 7 | 9 | 10 |
| Ecosystem (15%) | 9 | 9 | 8 | 6 |
| Cost (15%) | 9 | 9 | 7 | 5 |
| Managed Service (10%) | 9 | 9 | 8 | 7 |
| **Weighted Score** | **9.0** | **8.0** | **7.8** | **7.8** |

**Decision: PostgreSQL 15** ✓

---

## 6. Technology Risks & Mitigations

| Technology | Risk | Probability | Impact | Mitigation |
|-----------|------|-------------|--------|------------|
| Node.js | CPU-intensive tasks block event loop | Medium | Medium | Worker threads, Bull queue offload |
| TypeORM | Query performance issues at scale | Medium | Medium | Raw queries for complex cases, query monitoring |
| Redis | Data loss on crash | Low | Medium | AOF persistence, cluster mode |
| AWS | Vendor lock-in | Low | High | Docker containers, standard interfaces, Terraform |
| React | Major version breaking changes | Low | Medium | Gradual migration, codemods |
| Elasticsearch | Complex operations, cost | Medium | Low | Use only for search, PostgreSQL for primary |

---

## 7. Future Technology Considerations

| Timeline | Technology | Purpose | Condition |
|----------|-----------|---------|-----------|
| Year 1 Q3 | React Native / Flutter | Mobile app | After web platform stable |
| Year 1 Q4 | Kafka | Event streaming | When event volume > 10K/min |
| Year 2 | GraphQL BFF | Mobile optimization | When mobile needs differ from web |
| Year 2 | Kubernetes | Container orchestration | When services > 10 |
| Year 2 | AI/ML Pipeline | Recommendation, fraud | When data sufficient |
| Year 3 | Blockchain | Claims verification | When regulatory approves |
