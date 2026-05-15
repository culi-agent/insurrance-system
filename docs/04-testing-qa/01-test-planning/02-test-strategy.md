# Test Strategy - Chiến Lược Kiểm Thử

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Lead |
| Trạng thái | Draft |

---

## 1. Tổng quan chiến lược

### 1.1. Mục tiêu chất lượng
- Đảm bảo tất cả functional requirements hoạt động đúng theo PRD
- Đạt performance targets: API < 500ms, page load < 3s
- Zero critical security vulnerabilities trước go-live
- Uptime ≥ 99.9% sau khi deploy
- User experience mượt mà trên tất cả supported browsers/devices

### 1.2. Nguyên tắc kiểm thử
1. **Shift-Left Testing**: Kiểm thử sớm nhất có thể trong SDLC
2. **Risk-Based Testing**: Ưu tiên test theo mức độ rủi ro business
3. **Automation-First**: Tối đa hóa automated testing (target 70%)
4. **Continuous Testing**: Tích hợp testing vào CI/CD pipeline
5. **Data-Driven**: Sử dụng metrics để đưa ra quyết định

---

## 2. Chiến lược theo từng loại kiểm thử

### 2.1. Unit Testing Strategy

**Phạm vi:** Tất cả business logic, utilities, helpers, components

**Approach:**
- Framework: Jest + React Testing Library (FE), Jest (BE)
- Coverage target: ≥ 80% lines, ≥ 75% branches
- Mocking strategy: Mock external dependencies (APIs, DB, third-party services)
- Naming convention: `[module].test.ts` hoặc `[module].spec.ts`

**Priority Modules:**
| Module | Priority | Lý do |
|--------|----------|-------|
| Quote Engine (pricing logic) | P0 | Business-critical calculations |
| Payment processing | P0 | Financial accuracy |
| Underwriting rules | P0 | Business decisions |
| Authentication | P0 | Security |
| Claims calculation | P1 | Financial impact |
| Form validation | P1 | User experience |
| Policy lifecycle | P1 | Business logic |

**Rules:**
- Mỗi PR phải đi kèm unit tests cho code mới/changed
- Unit tests phải pass 100% trước khi merge
- Không mock internal modules (chỉ mock external)
- Test cả happy path và edge cases

### 2.2. Integration Testing Strategy

**Phạm vi:** Tương tác giữa các modules, API endpoints, database operations

**Approach:**
- API integration tests: Supertest + Jest
- Database integration: Test containers (PostgreSQL)
- Service-to-service: Contract testing (Pact)
- Coverage target: ≥ 60%

**Key Integration Points:**
```
┌──────────────────────────────────────────────────────────┐
│                   Integration Test Focus                    │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Frontend ←→ Backend API                                  │
│  Backend ←→ Database (PostgreSQL)                         │
│  Backend ←→ Cache (Redis)                                 │
│  Backend ←→ Payment Gateway (VNPay, Momo, ZaloPay)       │
│  Backend ←→ Insurer APIs (Quote, Issuance, Claims)       │
│  Backend ←→ eKYC Service                                 │
│  Backend ←→ Notification Service (Email, SMS)            │
│  Backend ←→ File Storage (S3)                            │
│  Backend ←→ Search Engine (Elasticsearch)                │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

**Contract Testing:**
- Consumer-driven contracts cho Insurer APIs
- Provider verification cho internal APIs
- Schema validation cho all external integrations

### 2.3. E2E / System Testing Strategy

**Phạm vi:** Complete user journeys end-to-end

**Approach:**
- Framework: Playwright (primary), Cypress (backup)
- Environment: Staging (mirror production)
- Data: Dedicated test data set, reset per run
- Parallel execution: 4 workers

**Critical User Journeys (Must Pass):**

| # | Journey | Priority | Est. Duration |
|---|---------|----------|---------------|
| 1 | Đăng ký → Verify email → Login | P0 | 2 min |
| 2 | Browse → Quote → Purchase Motor Insurance → Receive Policy | P0 | 5 min |
| 3 | Browse → Quote → Purchase Health Insurance → Receive Policy | P0 | 8 min |
| 4 | Login → Submit Claim → Upload Documents → Track Status | P0 | 4 min |
| 5 | Login → Renew Policy → Payment → Confirmation | P1 | 3 min |
| 6 | Login → Cancel Policy → Refund Confirmation | P1 | 3 min |
| 7 | Admin → Process Claim → Approve → Settlement | P1 | 5 min |
| 8 | Admin → Add Product → Configure Pricing → Publish | P1 | 5 min |
| 9 | Guest → Compare Products → Save Quote → Share | P2 | 3 min |
| 10 | Login → Profile Update → Change Password | P2 | 2 min |

**Execution Schedule:**
- Smoke tests: Mỗi deployment (5-10 min)
- Full E2E suite: Nightly build (1-2 hours)
- Full regression: Before each release

### 2.4. API Testing Strategy

**Phạm vi:** Tất cả REST API endpoints

**Approach:**
- Tool: Postman collections + Newman CLI
- Environments: DEV, QA, STG
- Authentication: Auto-generate tokens
- Data-driven: CSV/JSON data files

**Test Categories per Endpoint:**

| Category | Ví dụ |
|----------|-------|
| Positive tests | Valid request → Expected response |
| Negative tests | Invalid input → Proper error |
| Authentication | Missing/expired/invalid token |
| Authorization | Role-based access control |
| Boundary values | Min/max values, empty fields |
| Error handling | Server errors, timeout |
| Rate limiting | Exceed rate limits |
| Pagination | Page size, offset |
| Idempotency | Duplicate requests |

**API Response Validation:**
- Status code correct
- Response body schema validation (JSON Schema)
- Response time within SLA (< 500ms for simple, < 1s for complex)
- Error response format consistent
- Headers correct (CORS, security headers)

### 2.5. Performance Testing Strategy

**Phạm vi:** Load, Stress, Endurance, Spike testing

**Approach:**
- Tool: K6 (primary), Artillery (secondary), Lighthouse (FE)
- Environment: Staging (production-equivalent infrastructure)
- Baseline: Establish baseline before each release
- Monitoring: Grafana + Prometheus during tests

**Performance Test Scenarios:**

| Scenario | Type | Users | Duration | Success Criteria |
|----------|------|-------|----------|-----------------|
| Normal Load | Load | 5,000 concurrent | 30 min | P95 < 500ms, 0% error |
| Peak Load | Load | 10,000 concurrent | 15 min | P95 < 1s, < 1% error |
| Stress Test | Stress | Ramp to 20,000 | Until break | Identify breaking point |
| Endurance | Soak | 5,000 concurrent | 4 hours | No memory leaks, stable response |
| Spike Test | Spike | 0 → 15,000 → 0 | 10 min | Recovery < 30s |
| Quote Engine Load | Load | 10,000 quotes/hour | 1 hour | P95 < 3s |
| Payment Peak | Load | 2,000 payments/hour | 30 min | 0% failed transactions |

**Key Metrics to Monitor:**
- Response time (P50, P90, P95, P99)
- Throughput (requests/second)
- Error rate (%)
- CPU & Memory utilization
- Database connection pool usage
- Cache hit ratio
- Network I/O

### 2.6. Security Testing Strategy

**Phạm vi:** OWASP Top 10, authentication, data protection, compliance

**Approach:**
- SAST (Static): SonarQube, Snyk Code
- DAST (Dynamic): OWASP ZAP
- Dependency Scanning: Snyk, npm audit
- Secret Detection: GitLeaks
- Penetration Testing: Quarterly (external vendor)

**Security Test Areas:**

| Area | Tests | Tool |
|------|-------|------|
| Authentication | Brute force, session hijacking, token manipulation | ZAP, custom scripts |
| Authorization | Privilege escalation, IDOR, role bypass | Manual + ZAP |
| Input Validation | SQL injection, XSS, command injection | ZAP, SQLMap |
| Data Protection | Encryption at rest/transit, PII exposure | Manual review |
| API Security | Rate limiting, input fuzzing, mass assignment | ZAP, Postman |
| File Upload | Malicious file upload, path traversal | Manual + ZAP |
| Payment Security | Transaction manipulation, replay attacks | Manual |
| Session Management | Fixation, timeout, concurrent sessions | Manual + automated |
| CORS | Misconfigured origins | ZAP |
| Security Headers | Missing/misconfigured headers | Mozilla Observatory |

**Compliance Checks:**
- PCI-DSS: Never store card data, tokenization verification
- PDPA: Consent management, data deletion capability
- Insurance regulations: Data retention (10 years)

### 2.7. Compatibility Testing Strategy

**Browser Matrix:**

| Browser | Version | Desktop | Mobile | Priority |
|---------|---------|---------|--------|----------|
| Chrome | Latest 2 | ✓ | ✓ | P0 |
| Safari | Latest 2 | ✓ | ✓ (iOS) | P0 |
| Firefox | Latest 2 | ✓ | - | P1 |
| Edge | Latest 2 | ✓ | - | P1 |
| Samsung Internet | Latest | - | ✓ | P2 |

**Device Testing:**

| Device Type | Breakpoints | Test Scope |
|-------------|-------------|------------|
| Mobile | 320px - 767px | Full functional + layout |
| Tablet | 768px - 1023px | Layout + key flows |
| Desktop | 1024px - 1920px | Full functional + layout |
| Large Desktop | > 1920px | Layout verification |

**Network Conditions:**

| Condition | Speed | Test Focus |
|-----------|-------|------------|
| 4G | 10 Mbps | Full experience |
| 3G | 1.5 Mbps | Core flows functional |
| Slow 3G | 400 Kbps | Graceful degradation |

---

## 3. Chiến lược Automation

### 3.1. Test Automation Pyramid

```
         /\
        /  \        E2E Tests (10%)
       /    \       - Critical user journeys
      /──────\      - Smoke tests
     /        \     
    / Integrat.\    Integration Tests (20%)
   /    Tests   \   - API tests
  /──────────────\  - Service integration
 /                \ 
/   Unit Tests     \  Unit Tests (70%)
/                    \ - Business logic
/──────────────────────\ - Components
```

### 3.2. CI/CD Integration

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  Code   │───▶│  Build   │───▶│  Unit    │───▶│Integration│───▶│  E2E   │
│  Push   │    │  + Lint  │    │  Tests   │    │  Tests   │    │ (Smoke)│
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └─────────┘
                                                                     │
                                                                     ▼
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│ Deploy  │◀───│ Security │◀───│Performance│◀───│  Full    │◀───│ Deploy │
│  PROD   │    │  Scan    │    │  Check   │    │  E2E    │    │   STG  │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └─────────┘
```

**Pipeline Gates:**
| Gate | Criteria | Action on Fail |
|------|----------|----------------|
| Build | Compile success, no lint errors | Block merge |
| Unit Tests | 100% pass, coverage ≥ 80% | Block merge |
| Integration Tests | 100% pass | Block merge |
| Smoke Tests (STG) | All critical paths pass | Block deployment |
| Security Scan | No critical vulnerabilities | Block deployment |
| Performance | No regression > 10% | Alert + review |
| Full E2E (STG) | ≥ 98% pass rate | Block production deploy |

### 3.3. Automation Priorities

| Phase | Automate | Rationale |
|-------|----------|-----------|
| Sprint 1-2 | Unit tests + CI pipeline | Foundation |
| Sprint 3-4 | API tests + smoke tests | Core coverage |
| Sprint 5-6 | E2E critical journeys | Business-critical flows |
| Sprint 7-8 | Performance tests | NFR validation |
| Sprint 9+ | Full regression suite | Maintenance efficiency |

---

## 4. Chiến lược Test Data

### 4.1. Test Data Categories

| Category | Approach | Storage |
|----------|----------|---------|
| User accounts | Pre-seeded (various roles) | DB seeds |
| Products | Mirror staging config | Config files |
| Policies | Factory-generated | Test factories |
| Claims | Scenario-based generation | Test factories |
| Payments | Mock responses | Mock server |
| Documents | Sample files library | Git LFS / S3 |

### 4.2. Data Generation Rules

```
Test Users:
- customer_01@test.com → Active customer, 3 policies, 1 pending claim
- customer_02@test.com → New customer, no policies
- customer_03@test.com → Customer with expired policy
- admin_01@test.com → Super Admin
- admin_02@test.com → Claims Handler
- partner_01@test.com → Insurer Partner

Test Products:
- MOTOR-001 → Bảo hiểm xe máy TNDS (giá thấp, simple flow)
- HEALTH-001 → Bảo hiểm sức khỏe cá nhân (giá trung bình)
- LIFE-001 → Bảo hiểm nhân thọ (giá cao, complex flow)
- TRAVEL-001 → Bảo hiểm du lịch (ngắn hạn)
```

### 4.3. Test Data Privacy
- KHÔNG sử dụng real customer data trong testing
- PII phải là synthetic/fake data
- Mask/scramble khi copy từ production
- Comply with PDPA requirements

---

## 5. Defect Management

### 5.1. Bug Lifecycle

```
┌──────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│ New  │───▶│ Assigned │───▶│ In Fix  │───▶│ Fixed    │───▶│Verified│
└──────┘    └──────────┘    └─────────┘    └──────────┘    └────────┘
   │              │                              │               │
   ▼              ▼                              ▼               ▼
┌──────┐    ┌──────────┐                   ┌──────────┐    ┌────────┐
│Reject│    │ Deferred │                   │ Reopen   │    │ Closed │
└──────┘    └──────────┘                   └──────────┘    └────────┘
```

### 5.2. Bug Report Template
- Title: [Module] - Brief description
- Severity: S1/S2/S3/S4
- Priority: P1/P2/P3/P4
- Environment: DEV/QA/STG/PROD
- Steps to reproduce
- Expected result
- Actual result
- Screenshots/Video
- Browser/Device info
- Assignee

---

## 6. Communication & Reporting

### 6.1. Test Status Reporting

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| Daily Standup | Daily | QA Team | Progress, blockers |
| Test Status | 2x/week | Project Team | Metrics, risks |
| Sprint Report | Bi-weekly | Stakeholders | Summary, quality gate |
| Release Report | Per release | All | Go/No-Go recommendation |

### 6.2. Escalation Path

```
Issue Detected
      │
      ▼
QA Engineer → QA Lead (if not resolved in SLA)
                  │
                  ▼
            Tech Lead → Project Manager (if blocking release)
                              │
                              ▼
                        Product Owner (Go/No-Go decision)
```

---

## 7. Phê duyệt

| Vai trò | Tên | Ngày |
|---------|-----|------|
| QA Lead | | |
| Tech Lead | | |
| Project Manager | | |
