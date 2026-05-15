# System Design

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. System Design Overview

### 1.1. Design Goals

| Goal | Description | Target |
|------|-------------|--------|
| Low Latency | Thời gian phản hồi nhanh | API < 500ms (P95) |
| High Throughput | Xử lý nhiều requests đồng thời | 10,000 concurrent users |
| High Availability | Hệ thống luôn sẵn sàng | 99.9% uptime |
| Data Consistency | Dữ liệu chính xác, không mất mát | ACID transactions |
| Fault Tolerance | Chịu lỗi từ external services | Circuit breaker, retry |
| Security | Bảo vệ dữ liệu khách hàng | Encryption, RBAC |

### 1.2. System Capacity Estimation

```
Users:
- Registered users Year 1: 100,000
- DAU (Daily Active Users): 10% = 10,000
- Peak concurrent: ~2,000 (assume 20% of DAU online at peak hour)

Traffic:
- Average requests per user per session: 50
- Daily requests: 10,000 * 50 = 500,000
- Peak QPS: 500,000 / (8 hours * 3600) * 3 (peak factor) ≈ 50 QPS
- Design for 10x: 500 QPS

Storage:
- User records: 100K * 2KB = 200MB
- Policy records: 50K * 5KB = 250MB
- Quotes: 500K * 3KB = 1.5GB (TTL 90 days)
- Claims: 10K * 10KB = 100MB
- Documents: 50K * 5MB average = 250GB
- Total DB: ~5GB Year 1 (design for 50GB)
- Total Storage: ~300GB Year 1 (design for 1TB)

Bandwidth:
- Average response size: 5KB
- Peak bandwidth: 500 QPS * 5KB = 2.5 MB/s
- With documents: design for 50 MB/s peak
```

---

## 2. Core System Components Design

### 2.1. API Gateway Design

```
┌─────────────────────────────────────────────────────────┐
│                     API GATEWAY                           │
│                                                           │
│  Request Flow:                                           │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │  Rate  │─▶│  Auth  │─▶│ Route  │─▶│ Proxy  │       │
│  │ Limit  │  │ Check  │  │ Match  │  │Forward │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                           │
│  Features:                                               │
│  • Rate Limiting: 100 req/min per user (token bucket)   │
│  • Authentication: JWT validation (RS256 public key)     │
│  • Routing: Path-based to backend services               │
│  • CORS: Configured per client origin                    │
│  • Request Logging: All requests logged with traceId     │
│  • Response Caching: GET endpoints, configurable TTL     │
│  • Circuit Breaker: Per upstream service                  │
│  • Request/Response Transform: Header injection          │
│                                                           │
│  Rate Limiting Rules:                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Anonymous:    20 req/min                         │    │
│  │ Authenticated: 100 req/min                       │    │
│  │ Admin:        500 req/min                        │    │
│  │ Partner API:  1000 req/min                       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Quote Generation System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                  QUOTE GENERATION SYSTEM                          │
│                                                                   │
│  ┌─────────────┐                                                │
│  │ Quote       │  POST /api/v1/quotes                           │
│  │ Request     │  { productType, customerInfo, coverage }       │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐  Check Redis cache (key: hash of request)      │
│  │ Cache Check │───── HIT ──▶ Return cached result              │
│  └──────┬──────┘                                                │
│         │ MISS                                                   │
│         ▼                                                        │
│  ┌─────────────┐  Get eligible insurers for product type        │
│  │ Eligibility │  Filter by customer profile                    │
│  │ Check       │  (age, location, occupation)                   │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           PARALLEL QUOTE FETCHING                         │   │
│  │                                                           │   │
│  │  Promise.allSettled([                                     │   │
│  │    insurerA.getQuote(req),  // timeout: 10s              │   │
│  │    insurerB.getQuote(req),  // timeout: 10s              │   │
│  │    insurerC.getQuote(req),  // timeout: 10s              │   │
│  │    localPricingEngine(req)  // fallback/internal          │   │
│  │  ])                                                       │   │
│  │                                                           │   │
│  │  Results: fulfilled → include, rejected → skip + log     │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                              │                                    │
│         ▼                                                        │
│  ┌─────────────┐  Normalize all responses to unified format    │
│  │ Normalize & │  Sort by price (default)                       │
│  │ Rank        │  Add labels: "Best Value", "Most Popular"     │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐  Store in DB (quotes table)                   │
│  │ Persist &   │  Cache result (Redis, TTL: 30min)             │
│  │ Cache       │  Return to client                              │
│  └─────────────┘                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3. Payment Processing System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                 PAYMENT PROCESSING SYSTEM                         │
│                                                                   │
│  Design Principles:                                              │
│  • Idempotency: Prevent double-charge (idempotency key)         │
│  • Timeout handling: Payment session expires after 15min         │
│  • Reconciliation: Daily automated matching                      │
│  • Security: Never store card data, use gateway tokenization    │
│                                                                   │
│  ┌──────────┐                                                   │
│  │ Initiate │  Client sends: { policyId, method, amount }       │
│  │ Payment  │  Server creates: transaction (status: PENDING)    │
│  └────┬─────┘  Server returns: paymentUrl / QR code             │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PAYMENT GATEWAY FLOW                                      │  │
│  │                                                            │  │
│  │  VNPay: Client redirected → Bank OTP → Callback            │  │
│  │  Momo:  Client deep-link/QR → Confirm in app → Callback   │  │
│  │  ZaloPay: Client redirected → Confirm → Callback           │  │
│  │  Bank Transfer: Show virtual account → Wait webhook        │  │
│  └──────────────────────────────────────────────────────────┘  │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐  Gateway calls webhook:                           │
│  │ Webhook  │  1. Verify signature (HMAC)                       │
│  │ Handler  │  2. Check idempotency (prevent duplicate)         │
│  └────┬─────┘  3. Update transaction status                     │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐  If SUCCESS:                                      │
│  │ Post-    │  1. Emit PaymentConfirmed event                   │
│  │ Payment  │  2. Policy Service → Activate policy              │
│  │ Actions  │  3. Document Service → Generate PDF               │
│  └──────────┘  4. Notification → Send confirmation              │
│                                                                   │
│  Failure Handling:                                               │
│  • Payment timeout → Mark EXPIRED → Allow retry                 │
│  • Payment failed → Mark FAILED → Show error + retry option     │
│  • Webhook not received → Polling (every 5min, max 3 attempts)  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Background Job System

### 3.1. Job Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOB SYSTEM                          │
│                    (Bull Queue + Redis)                           │
│                                                                   │
│  Queue Types:                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   HIGH       │  │   DEFAULT   │  │    LOW      │            │
│  │  Priority    │  │  Priority   │  │  Priority   │            │
│  │             │  │             │  │             │            │
│  │ • Payment   │  │ • Email     │  │ • Reports  │            │
│  │   confirm   │  │ • SMS       │  │ • Analytics│            │
│  │ • Policy    │  │ • PDF gen   │  │ • Cleanup  │            │
│  │   activate  │  │ • Sync data │  │ • Archive  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                   │
│  Scheduled Jobs:                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Every hour:   Check expiring quotes → mark expired       │   │
│  │ Every day:    Send renewal reminders (30, 14, 7, 1 day)  │   │
│  │ Every day:    Check overdue payments → send reminders     │   │
│  │ Every day:    Lapse policies (grace period expired)       │   │
│  │ Every week:   Generate partner reports                    │   │
│  │ Every month:  Run reconciliation                         │   │
│  │ Every 6h:     Database backup trigger                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Retry Strategy:                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Attempt 1: Immediate                                     │   │
│  │ Attempt 2: After 1 minute                                │   │
│  │ Attempt 3: After 5 minutes                               │   │
│  │ Attempt 4: After 30 minutes                              │   │
│  │ Attempt 5: After 2 hours                                 │   │
│  │ Dead Letter Queue: After all retries failed              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Search System Design

### 4.1. Elasticsearch Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                      SEARCH SYSTEM                                │
│                                                                   │
│  Data Flow:                                                      │
│  PostgreSQL ──(event)──▶ Sync Worker ──(index)──▶ Elasticsearch │
│                                                                   │
│  Indices:                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Index: products                                          │   │
│  │ Fields: name, description, category, insurer,            │   │
│  │         benefits, price_range, rating                    │   │
│  │ Analyzers: Vietnamese (vi_analyzer), Standard            │   │
│  │                                                          │   │
│  │ Index: policies (admin search)                           │   │
│  │ Fields: policy_number, customer_name, product_name,      │   │
│  │         status, dates                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Search Features:                                                │
│  • Full-text search with Vietnamese tokenizer                   │
│  • Fuzzy matching (typo tolerance)                              │
│  • Faceted search (category, price range, insurer)             │
│  • Autocomplete suggestions                                     │
│  • Relevance scoring + boost by popularity                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Caching System Design

### 5.1. Multi-Layer Caching

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                                 │
│                                                                   │
│  Layer 1: Browser Cache                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Static assets: Cache-Control: max-age=31536000        │   │
│  │ • API responses: ETag + If-None-Match (304)             │   │
│  │ • Service Worker: Offline-first for static pages        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Layer 2: CDN (CloudFront)                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Static files (JS, CSS, images): TTL 1 year            │   │
│  │ • Product images: TTL 24 hours                          │   │
│  │ • API responses (GET, public): TTL 5 minutes            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Layer 3: Application Cache (Redis)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Product catalog: TTL 1 hour                           │   │
│  │ • Quote results: TTL 30 minutes                         │   │
│  │ • User sessions: TTL 15min / 7 days                     │   │
│  │ • Rate limit counters: TTL 1 minute                     │   │
│  │ • Feature flags: TTL 5 minutes                          │   │
│  │ • OTP codes: TTL 5 minutes                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Cache Invalidation Strategy:                                   │
│  • Time-based (TTL): Most cases                                │
│  • Event-based: Product update → invalidate product cache       │
│  • Version-based: Cache key includes version number             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Event System Design

### 6.1. Domain Events

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT SYSTEM                                   │
│                                                                   │
│  Event Bus: Redis Pub/Sub + Bull Queue                          │
│                                                                   │
│  Event Categories:                                               │
│  ┌──────────────────┬─────────────────────────────────────────┐│
│  │ Domain Events    │ Business-meaningful state changes         ││
│  ├──────────────────┼─────────────────────────────────────────┤│
│  │ CustomerRegistered    │ → Send welcome email               ││
│  │ CustomerVerified      │ → Enable full features             ││
│  │ QuoteGenerated        │ → Cache, analytics                 ││
│  │ PolicyCreated         │ → Notify admin, sync insurer       ││
│  │ PolicyActivated       │ → Send policy doc, welcome kit     ││
│  │ PolicyExpiring        │ → Send renewal reminders           ││
│  │ PolicyCancelled       │ → Process refund, notify           ││
│  │ PaymentConfirmed      │ → Activate policy, receipt         ││
│  │ PaymentFailed         │ → Notify customer, retry           ││
│  │ ClaimSubmitted        │ → Assign handler, acknowledge      ││
│  │ ClaimApproved         │ → Process settlement               ││
│  │ ClaimRejected         │ → Notify with reason               ││
│  └──────────────────┴─────────────────────────────────────────┘│
│                                                                   │
│  Event Schema:                                                   │
│  {                                                               │
│    "eventId": "uuid",                                           │
│    "eventType": "PolicyActivated",                              │
│    "aggregateId": "policy-uuid",                                │
│    "aggregateType": "Policy",                                   │
│    "timestamp": "2026-05-15T10:30:00.000Z",                   │
│    "version": 1,                                                │
│    "payload": { ... },                                          │
│    "metadata": { "userId": "...", "traceId": "..." }           │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Security System Design

### 7.1. Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                │
│                                                                   │
│  ┌─── PERIMETER ────────────────────────────────────────────┐   │
│  │ • AWS WAF (OWASP rules, IP blocking, geo-restriction)    │   │
│  │ • AWS Shield (DDoS protection)                           │   │
│  │ • CloudFront (edge filtering)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── NETWORK ─────────────────────────────────────────────┐   │
│  │ • VPC isolation (private subnets for app + data)         │   │
│  │ • Security Groups (minimal port exposure)                │   │
│  │ • NACLs (network-level access control)                   │   │
│  │ • VPN for admin access                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── APPLICATION ─────────────────────────────────────────┐   │
│  │ • Helmet.js (security headers)                           │   │
│  │ • CORS (whitelist origins)                               │   │
│  │ • Rate limiting (per user + per IP)                      │   │
│  │ • Input validation (Joi schemas)                         │   │
│  │ • SQL injection prevention (parameterized queries/ORM)   │   │
│  │ • XSS prevention (output encoding, CSP)                  │   │
│  │ • CSRF protection (SameSite cookies)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── DATA ────────────────────────────────────────────────┐   │
│  │ • Encryption at rest (AES-256, AWS KMS)                  │   │
│  │ • Encryption in transit (TLS 1.3)                        │   │
│  │ • PII masking in logs                                    │   │
│  │ • Database-level encryption (RDS encryption)             │   │
│  │ • Secure credential storage (AWS Secrets Manager)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── AUDIT ───────────────────────────────────────────────┐   │
│  │ • All write operations logged                            │   │
│  │ • Admin actions tracked with actor + timestamp           │   │
│  │ • Failed auth attempts monitored + alerted               │   │
│  │ • Data access logging for sensitive data                 │   │
│  │ • Log retention: 5 years (compliance)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Monitoring & Alerting Design

### 8.1. Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                 MONITORING & OBSERVABILITY                        │
│                                                                   │
│  ┌─── METRICS (Prometheus + Grafana) ──────────────────────┐   │
│  │                                                          │   │
│  │  System Metrics:                                         │   │
│  │  • CPU, Memory, Disk, Network per instance              │   │
│  │  • Container health + restart count                     │   │
│  │                                                          │   │
│  │  Application Metrics:                                    │   │
│  │  • Request rate (RPS), Error rate (%), Latency (P50/95) │   │
│  │  • Active connections, Queue depth                      │   │
│  │  • Cache hit/miss ratio                                 │   │
│  │                                                          │   │
│  │  Business Metrics:                                       │   │
│  │  • Quotes generated/hour                                │   │
│  │  • Policies sold/hour                                   │   │
│  │  • Payment success rate                                 │   │
│  │  • Claims submitted/day                                 │   │
│  │  • Revenue (real-time GWP)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── LOGGING (ELK Stack) ────────────────────────────────┐   │
│  │  • Structured JSON logs                                  │   │
│  │  • Centralized collection (Filebeat → Logstash → ES)    │   │
│  │  • Kibana dashboards                                    │   │
│  │  • Log-based alerting                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── TRACING (Jaeger) ──────────────────────────────────┐    │
│  │  • Distributed tracing across services                   │   │
│  │  • Request flow visualization                           │   │
│  │  • Latency breakdown per service                        │   │
│  │  • Error propagation tracking                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─── ALERTING ──────────────────────────────────────────┐    │
│  │  Critical (PagerDuty - immediate):                       │   │
│  │  • System down (health check fail > 2min)               │   │
│  │  • Error rate > 5%                                      │   │
│  │  • Payment processing failure > 10%                     │   │
│  │  • Database connection failure                          │   │
│  │                                                          │   │
│  │  Warning (Slack):                                        │   │
│  │  • Response time P95 > 1s                               │   │
│  │  • CPU > 75% for 10min                                  │   │
│  │  • Cache hit ratio < 80%                                │   │
│  │  • Queue depth > 1000                                   │   │
│  │                                                          │   │
│  │  Info (Dashboard only):                                  │   │
│  │  • Deployment completed                                 │   │
│  │  • Scheduled job completed                              │   │
│  │  • Scale event triggered                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Disaster Recovery Design

### 9.1. DR Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISASTER RECOVERY                              │
│                                                                   │
│  Strategy: Warm Standby                                         │
│  RTO: < 1 hour  │  RPO: < 5 minutes                           │
│                                                                   │
│  PRIMARY (ap-southeast-1)         DR (ap-southeast-3)           │
│  ┌────────────────────┐          ┌────────────────────┐        │
│  │ Active Workload    │          │ Standby (scaled    │        │
│  │ (full capacity)    │  ──────▶ │  down, ready to    │        │
│  │                    │  replicate│  scale up)         │        │
│  │ • App servers (N)  │          │ • App servers (2)  │        │
│  │ • DB Primary       │          │ • DB Replica       │        │
│  │ • Redis Primary    │          │ • Redis Replica    │        │
│  │ • Full S3 bucket   │          │ • S3 replication   │        │
│  └────────────────────┘          └────────────────────┘        │
│                                                                   │
│  Failover Process:                                              │
│  1. Detection: Health check fails for 5 min                     │
│  2. Decision: On-call engineer confirms (or auto if > 15 min)   │
│  3. DNS Switch: Route 53 failover to DR region                  │
│  4. Scale Up: DR instances scale to production capacity          │
│  5. Promote DB: Replica → Primary                               │
│  6. Verify: Health checks pass on DR                            │
│  7. Notify: Team + customers informed                           │
│                                                                   │
│  Recovery Testing:                                              │
│  • DR drill every quarter                                       │
│  • Automated backup restoration test weekly                     │
│  • Chaos engineering exercises monthly                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```
