# Architecture Decision Records (ADR)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Template | MADR (Markdown ADR) |

---

## ADR Index

| # | Title | Status | Date |
|---|-------|--------|------|
| ADR-001 | Chọn kiến trúc Modular Monolith | Accepted | 2026-05-15 |
| ADR-002 | Chọn Node.js + TypeScript cho Backend | Accepted | 2026-05-15 |
| ADR-003 | Chọn React + TypeScript cho Frontend | Accepted | 2026-05-15 |
| ADR-004 | Chọn PostgreSQL làm Primary Database | Accepted | 2026-05-15 |
| ADR-005 | Sử dụng REST API thay vì GraphQL | Accepted | 2026-05-15 |
| ADR-006 | Chọn AWS làm Cloud Provider | Accepted | 2026-05-15 |
| ADR-007 | Sử dụng JWT cho Authentication | Accepted | 2026-05-15 |
| ADR-008 | Adapter Pattern cho External Integrations | Accepted | 2026-05-15 |

---

## ADR-001: Chọn kiến trúc Modular Monolith

### Status
**Accepted**

### Context
Cần quyết định kiến trúc tổng thể cho hệ thống. Team size 10-15 engineers, timeline MVP 3 tháng, yêu cầu scale tới 10,000 concurrent users.

### Decision
Áp dụng **Modular Monolith** cho giai đoạn đầu, với kế hoạch chuyển dần sang Microservices khi cần.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Modular Monolith** | Simple deployment, easy debugging, fast development, low ops cost | Single point of failure, scale toàn bộ |
| Full Microservices | Independent scaling, tech diversity, fault isolation | Complex ops, distributed tracing, team overhead, slow MVP |
| Serverless | Auto-scale, pay per use | Vendor lock-in, cold start, complex debugging |

### Rationale
- Team nhỏ (10-15) chưa đủ để vận hành microservices hiệu quả
- MVP cần ship trong 3 tháng → monolith nhanh hơn
- Module boundaries rõ ràng cho phép extract service sau
- Cost-effective cho giai đoạn đầu
- Với 10,000 concurrent users, monolith + horizontal scaling đủ đáp ứng

### Consequences
- **Positive**: Faster development, simpler deployment, lower cost
- **Negative**: Cần refactor khi extract services, risk of module coupling
- **Mitigations**: Strict module boundaries, interface contracts, DDD

---

## ADR-002: Chọn Node.js + TypeScript cho Backend

### Status
**Accepted**

### Context
Cần chọn technology stack cho backend API serving 10,000 concurrent users, heavy I/O (API calls to insurers, payment gateways).

### Decision
Sử dụng **Node.js 20 LTS + Express + TypeScript** cho backend.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Node.js + TypeScript** | Async I/O, fast dev, same language FE/BE, large ecosystem | CPU-intensive tasks, callback complexity |
| Java + Spring Boot | Enterprise proven, strong typing, mature ecosystem | Verbose, slower development, heavy resource |
| Go | High performance, low resource, great concurrency | Smaller ecosystem, less developers VN, learning curve |
| Python + FastAPI | Fast development, AI/ML integration | GIL limitation, type safety weaker |

### Rationale
- Hệ thống heavy I/O (call insurer APIs, payment gateways) → Node.js async/await phù hợp
- TypeScript provides type safety tương đương Java nhưng faster development
- Same language (TypeScript) cho FE + BE → code sharing, easier hiring
- NPM ecosystem rất phong phú cho fintech
- Team hiện tại đã familiar với JavaScript/TypeScript

### Consequences
- **Positive**: Fast development, easy hiring, code sharing FE/BE
- **Negative**: CPU-intensive tasks (PDF generation) cần offload
- **Mitigations**: Worker threads cho CPU tasks, Bull queue cho background jobs

---

## ADR-003: Chọn React + TypeScript cho Frontend

### Status
**Accepted**

### Context
Cần framework cho 3 web applications: Customer App, Admin Panel, Partner Portal. Yêu cầu responsive, performant, maintainable.

### Decision
Sử dụng **React 18 + TypeScript + Vite + TailwindCSS**.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **React 18** | Largest ecosystem, flexible, huge community | Boilerplate, need additional libs |
| Next.js (React) | SSR, file-based routing, full-stack | Over-engineered for SPA, hosting complexity |
| Vue 3 | Simpler, great docs, Composition API | Smaller ecosystem, fewer senior devs VN |
| Angular | Enterprise-ready, opinionated, complete | Heavy, steep learning curve, slower dev |

### Rationale
- React có ecosystem lớn nhất, dễ tìm developers tại Việt Nam
- TypeScript đảm bảo type safety, better refactoring
- Vite cho build speed nhanh hơn Webpack 10x
- TailwindCSS cho rapid UI development, consistent design
- SPA đủ cho MVP (không cần SSR vì SEO không critical cho app)

### Consequences
- **Positive**: Large talent pool, rich ecosystem, fast development
- **Negative**: Need to choose many libraries (routing, state, forms)
- **Mitigations**: Standardized tech choices documented, starter template

---

## ADR-004: Chọn PostgreSQL làm Primary Database

### Status
**Accepted**

### Context
Cần database cho dữ liệu transactional (policies, claims, payments) với yêu cầu ACID, JSON support, scalability.

### Decision
Sử dụng **PostgreSQL 15** làm primary database.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL 15** | ACID, JSONB, extensions, proven, great performance | Vertical scaling limits |
| MySQL 8 | Popular, simple, fast reads | Weaker JSON support, fewer features |
| MongoDB | Flexible schema, horizontal scaling | No ACID (multi-doc), eventual consistency |
| CockroachDB | Distributed SQL, PostgreSQL compatible | Cost, complexity, newer |

### Rationale
- Financial/Insurance data cần ACID compliance tuyệt đối
- JSONB support cho flexible schema (coverage_details, metadata)
- Row-Level Security cho multi-tenant data isolation
- Extensions phong phú (PostGIS, pg_trgm for search)
- AWS RDS managed service giảm ops overhead
- Read replicas cho read scaling

### Consequences
- **Positive**: Data integrity, flexible JSON, proven at scale
- **Negative**: Single-writer bottleneck at very high write scale
- **Mitigations**: Read replicas, caching, future sharding strategy

---

## ADR-005: Sử dụng REST API thay vì GraphQL

### Status
**Accepted**

### Context
Cần chọn API style cho communication giữa frontend và backend services.

### Decision
Sử dụng **RESTful API** với versioning (/api/v1/).

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **REST** | Simple, cacheable, well-understood, great tooling | Over/under-fetching, multiple round trips |
| GraphQL | Flexible queries, single endpoint, no over-fetching | Complex caching, learning curve, N+1 problem |
| gRPC | High performance, type-safe, streaming | Browser support limited, complex setup |

### Rationale
- REST đơn giản, team familiar, không cần learning curve
- HTTP caching (CDN, browser) works naturally với REST
- Tooling (Postman, Swagger/OpenAPI) rất mature
- Insurance domain có well-defined resources → REST fits naturally
- Over-fetching mitigated bằng sparse fieldsets, pagination
- Performance difference không significant ở scale hiện tại

### Consequences
- **Positive**: Simple, cacheable, great tooling, easy onboarding
- **Negative**: May need BFF pattern cho complex UIs later
- **Mitigations**: Consistent response format, pagination, field selection

---

## ADR-006: Chọn AWS làm Cloud Provider

### Status
**Accepted**

### Context
Cần cloud provider đáp ứng: data residency Vietnam, managed services, reliability, cost-effective.

### Decision
Sử dụng **AWS** (ap-southeast-1 region) làm primary cloud provider.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **AWS** | Market leader, most services, Vietnam edge, mature | Cost can escalate, complex pricing |
| GCP | Great data/AI services, simpler pricing | Smaller presence Vietnam, fewer managed services |
| Azure | Enterprise integration, Microsoft ecosystem | Less popular in startup/fintech VN |
| On-premise | Full control, no vendor lock-in | High capex, ops overhead, scaling difficulty |

### Rationale
- AWS có region Singapore (nearest to VN) với Vietnam edge locations
- Managed services (RDS, ElastiCache, S3) giảm ops burden
- Compliance certifications (SOC2, ISO 27001, PCI-DSS) already available
- Largest market share → easy to find experienced engineers
- AWS startup credits available

### Consequences
- **Positive**: Reliable, scalable, rich services, talent available
- **Negative**: Vendor lock-in risk, cost management complexity
- **Mitigations**: Use standard interfaces (Docker, PostgreSQL), monitor costs

---

## ADR-007: Sử dụng JWT cho Authentication

### Status
**Accepted**

### Context
Cần authentication mechanism cho stateless API servers, multiple clients, scalable.

### Decision
Sử dụng **JWT (RS256)** với short-lived access tokens + refresh tokens trong HttpOnly cookies.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **JWT (stateless)** | Scalable, no server state, self-contained | Token size, revocation complex |
| Session-based | Simple, easy revocation | Server state, scaling difficulty |
| OAuth2 + OIDC | Standard, delegated auth | Complex setup for simple cases |
| API Keys | Simple for server-to-server | Not suitable for user auth |

### Rationale
- Stateless → horizontal scaling dễ dàng
- RS256 cho phép verify token ở API Gateway mà không cần call Auth Service
- Short-lived access token (15min) giảm risk nếu bị leak
- Refresh token trong HttpOnly cookie chống XSS
- Token blacklist trong Redis cho forced logout

### Consequences
- **Positive**: Scalable, fast verification, standard
- **Negative**: Token revocation needs Redis blacklist, token size larger than session ID
- **Mitigations**: Short TTL, Redis blacklist, token rotation

---

## ADR-008: Adapter Pattern cho External Integrations

### Status
**Accepted**

### Context
Cần tích hợp với nhiều insurers (REST, SOAP), payment gateways, eKYC providers. Mỗi partner có API khác nhau.

### Decision
Áp dụng **Adapter Pattern** (Anti-Corruption Layer) cho tất cả external integrations.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **Adapter Pattern** | Loose coupling, easy to add/remove partners, testable | More code, abstraction overhead |
| Direct integration | Simple, less code | Tight coupling, hard to test, hard to change |
| Integration middleware (MuleSoft) | Visual, powerful | Expensive, vendor lock-in, overkill |

### Rationale
- Mỗi insurer có API format khác nhau (REST/SOAP, different schemas)
- Adapter pattern normalize tất cả thành unified interface
- Dễ dàng thêm partner mới chỉ cần implement adapter
- Unit testing dễ dàng với mock adapters
- Isolate changes khi partner update API

### Implementation

```typescript
// Unified interface
interface InsurerAdapter {
  getQuote(request: UnifiedQuoteRequest): Promise<UnifiedQuoteResponse>;
  issuePolicy(request: UnifiedPolicyRequest): Promise<UnifiedPolicyResponse>;
  submitClaim(request: UnifiedClaimRequest): Promise<UnifiedClaimResponse>;
  getStatus(referenceId: string): Promise<StatusResponse>;
}

// Concrete adapters
class BaoVietAdapter implements InsurerAdapter { ... }
class PVIAdapter implements InsurerAdapter { ... }
class LibertyAdapter implements InsurerAdapter { ... }

// Factory
class InsurerAdapterFactory {
  getAdapter(insurerId: string): InsurerAdapter { ... }
}
```

### Consequences
- **Positive**: Clean separation, easy testing, partner changes isolated
- **Negative**: Additional abstraction layer, some mapping overhead
- **Mitigations**: Code generation for adapters where possible, shared mapping utils
