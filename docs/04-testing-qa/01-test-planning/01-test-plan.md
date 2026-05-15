# Test Plan - Kế Hoạch Kiểm Thử

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Team |
| Trạng thái | Draft |
| Phê duyệt | QA Lead / Project Manager |

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này mô tả kế hoạch kiểm thử toàn diện cho hệ thống Insurance System Platform - nền tảng InsurTech cho phép khách hàng so sánh, mua bảo hiểm online và quản lý hợp đồng, yêu cầu bồi thường trực tuyến.

### 1.2. Phạm vi kiểm thử

**Trong phạm vi (In Scope):**
- Module Authentication (Đăng ký, Đăng nhập, Social Login, MFA)
- Module Product Catalog (Danh mục, Chi tiết, So sánh sản phẩm)
- Module Quotation (Báo giá xe máy, sức khỏe, nhân thọ, du lịch)
- Module Purchase (Mua bảo hiểm simple/complex flow)
- Module Claims (Submit, Track, Process claims)
- Module Payment (Thanh toán, Recurring, Refund)
- Module Admin Panel (Dashboard, CRUD operations, Reports)
- Module Notification (Email, SMS, In-app, Push)
- Customer Dashboard (Quản lý hợp đồng, Profile)
- API Integration (Insurer APIs, Payment Gateway, eKYC)

**Ngoài phạm vi (Out of Scope):**
- Third-party system internal testing (Momo, VNPay, ZaloPay internals)
- Insurer backend systems
- Mobile app (phase sau)
- Marketing automation tools

### 1.3. Tài liệu tham chiếu

| Tài liệu | Vị trí |
|-----------|--------|
| PRD | docs/02-requirements-analysis/02-PRD.md |
| Functional Requirements | docs/02-requirements-analysis/04-functional-requirements.md |
| Non-Functional Requirements | docs/02-requirements-analysis/05-non-functional-requirements.md |
| Use Cases | docs/02-requirements-analysis/06-use-cases.md |
| Business Flow | docs/03-business-analysis/01-business-flow.md |

---

## 2. Phương pháp kiểm thử (Test Approach)

### 2.1. Các loại kiểm thử

| Loại kiểm thử | Mô tả | Công cụ | Trách nhiệm |
|----------------|--------|---------|-------------|
| Unit Testing | Kiểm thử từng function/component riêng lẻ | Jest, React Testing Library | Developer |
| Integration Testing | Kiểm thử tương tác giữa các module | Jest, Supertest | Developer + QA |
| API Testing | Kiểm thử REST API endpoints | Postman, Newman, Jest | QA Engineer |
| UI/E2E Testing | Kiểm thử luồng end-to-end trên giao diện | Cypress, Playwright | QA Engineer |
| Performance Testing | Kiểm thử hiệu năng, load, stress | K6, Artillery, Lighthouse | Performance Engineer |
| Security Testing | Kiểm thử bảo mật (OWASP Top 10) | OWASP ZAP, Burp Suite, Snyk | Security Engineer |
| UAT | Kiểm thử chấp nhận người dùng | Manual | Business + End Users |
| Regression Testing | Kiểm thử hồi quy sau mỗi release | Automated suite | QA Engineer |
| Smoke Testing | Kiểm thử nhanh các chức năng chính | Automated subset | QA Engineer |
| Compatibility Testing | Kiểm thử trên nhiều browser/device | BrowserStack | QA Engineer |

### 2.2. Mức độ kiểm thử (Test Levels)

```
┌─────────────────────────────────────────────────┐
│              UAT / Acceptance Testing            │  ← Business Team
├─────────────────────────────────────────────────┤
│              System / E2E Testing                │  ← QA Team
├─────────────────────────────────────────────────┤
│              Integration Testing                 │  ← Dev + QA
├─────────────────────────────────────────────────┤
│              Unit Testing                        │  ← Developers
└─────────────────────────────────────────────────┘
```

### 2.3. Tiêu chí bắt đầu & kết thúc kiểm thử

**Entry Criteria (Tiêu chí bắt đầu):**
- Requirements đã được review và approved
- Code đã pass unit tests (coverage > 80%)
- Build thành công trên test environment
- Test data đã sẵn sàng
- Test environment stable và accessible

**Exit Criteria (Tiêu chí kết thúc):**
- 100% test cases đã execute
- Tất cả Critical & High bugs đã fixed và verified
- Bug fix rate ≥ 95%
- Code coverage ≥ 80% (unit), ≥ 60% (integration)
- Performance targets đạt yêu cầu (P95)
- Security scan không có Critical/High vulnerabilities
- UAT sign-off từ Product Owner

---

## 3. Test Environment

### 3.1. Environments

| Environment | Mục đích | URL | Data |
|-------------|----------|-----|------|
| Development (DEV) | Developer testing | dev.insurance-system.local | Mock data |
| Testing (QA) | QA team testing | qa.insurance-system.internal | Test data |
| Staging (STG) | Pre-production testing | staging.insurance-system.com | Sanitized prod data |
| Production (PROD) | Live system | www.insurance-system.com | Real data |

### 3.2. Infrastructure Requirements

| Component | QA Environment | Staging Environment |
|-----------|---------------|---------------------|
| Application Servers | 2 instances | 2 instances (same as prod) |
| Database | PostgreSQL (shared) | PostgreSQL (dedicated) |
| Cache | Redis (1 node) | Redis (1 node) |
| Storage | S3 (test bucket) | S3 (staging bucket) |
| CDN | Disabled | CloudFront (staging) |
| Third-party APIs | Sandbox/Mock | Sandbox |

### 3.3. Test Data Management

| Loại data | Source | Refresh Frequency |
|-----------|--------|-------------------|
| User accounts | Seeded test data | Per test cycle |
| Products & Pricing | Copy from staging config | Weekly |
| Policies | Auto-generated | Per test cycle |
| Claims | Auto-generated | Per test cycle |
| Payment data | Mock gateway responses | N/A |
| Documents | Sample files (PDF, images) | As needed |

---

## 4. Lịch trình kiểm thử (Test Schedule)

### 4.1. MVP (v0.1) - Motor + Travel + Payment + Dashboard

| Phase | Thời gian | Hoạt động |
|-------|-----------|-----------|
| Test Preparation | Week 1-2 | Viết test cases, setup environment, prepare test data |
| Unit & Integration Test | Week 3-4 | Developer testing (continuous) |
| System Testing (Cycle 1) | Week 5-6 | Functional testing toàn bộ modules |
| Bug Fixing | Week 7 | Dev fix bugs từ Cycle 1 |
| System Testing (Cycle 2) | Week 8 | Re-test + regression |
| Performance Testing | Week 9 | Load test, stress test |
| Security Testing | Week 9 | Vulnerability scan, pen test |
| UAT | Week 10-11 | Business team + Beta users |
| Go-Live Preparation | Week 12 | Smoke test on production |

### 4.2. v1.0 - Health + Comparison + Claims

| Phase | Thời gian | Hoạt động |
|-------|-----------|-----------|
| Test Preparation | Week 1 | Update test cases cho new features |
| System Testing (Cycle 1) | Week 2-3 | New features + integration |
| Regression Testing | Week 3 | Automated regression suite |
| Bug Fixing + Cycle 2 | Week 4 | Fix + re-test |
| Performance + Security | Week 5 | Non-functional testing |
| UAT | Week 6 | Acceptance testing |

---

## 5. Phân bổ nguồn lực (Resource Allocation)

### 5.1. Đội ngũ kiểm thử

| Vai trò | Số lượng | Trách nhiệm |
|---------|----------|-------------|
| QA Lead | 1 | Quản lý test plan, review, report |
| Senior QA Engineer | 2 | Test design, automation framework, mentoring |
| QA Engineer | 3 | Execute test cases, bug reporting |
| Performance Engineer | 1 | Performance & load testing |
| Security Engineer | 1 (part-time) | Security testing, vulnerability assessment |

### 5.2. Công cụ & License

| Công cụ | Mục đích | License |
|---------|----------|---------|
| Jira | Bug tracking, test management | Cloud |
| Cypress / Playwright | E2E automation | Open source |
| Jest | Unit & integration testing | Open source |
| Postman / Newman | API testing | Team plan |
| K6 | Performance testing | Open source |
| OWASP ZAP | Security scanning | Open source |
| BrowserStack | Cross-browser testing | Team plan |
| GitHub Actions | CI/CD pipeline | Included |

---

## 6. Quản lý rủi ro kiểm thử (Test Risks)

| # | Rủi ro | Xác suất | Ảnh hưởng | Giải pháp |
|---|--------|----------|-----------|-----------|
| 1 | Third-party API không ổn định (Insurer, Payment) | Cao | Cao | Mock services, retry mechanism |
| 2 | Test environment không giống production | Trung bình | Cao | Infrastructure as Code, staging mirror |
| 3 | Thiếu test data đa dạng | Trung bình | Trung bình | Data generation scripts, factory pattern |
| 4 | Thay đổi requirements liên tục | Cao | Trung bình | Agile testing, continuous test update |
| 5 | Performance bottleneck phát hiện muộn | Thấp | Cao | Performance testing sớm, monitoring |
| 6 | Security vulnerabilities | Trung bình | Cao | Security testing trong mỗi sprint |
| 7 | Regression bugs sau mỗi release | Trung bình | Trung bình | Automated regression suite |
| 8 | Browser/device compatibility issues | Trung bình | Trung bình | Cross-browser testing matrix |

---

## 7. Tiêu chí chất lượng (Quality Metrics)

### 7.1. KPI Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Coverage (Unit) | ≥ 80% | Jest coverage report |
| Test Coverage (Integration) | ≥ 60% | Coverage report |
| Test Case Pass Rate | ≥ 95% | Test execution report |
| Critical Bug Escape Rate | 0 | Production incidents |
| Bug Detection Rate | ≥ 90% | Bugs found in QA vs Prod |
| Defect Density | < 5 per KLOC | Code analysis |
| Mean Time to Detect (MTTD) | < 2 hours | Monitoring alerts |
| Mean Time to Resolve (MTTR) | < 4 hours (Critical) | Incident records |
| Automation Rate | ≥ 70% | Automated vs Total test cases |
| Regression Execution Time | < 2 hours | CI pipeline |

### 7.2. Bug Severity Classification

| Severity | Định nghĩa | SLA Fix | Ví dụ |
|----------|------------|---------|-------|
| Critical (S1) | Hệ thống không hoạt động, mất data | 4 hours | Payment fail không refund, data breach |
| High (S2) | Chức năng chính bị lỗi, không có workaround | 1 day | Không thể mua bảo hiểm, claim submit fail |
| Medium (S3) | Chức năng bị lỗi nhưng có workaround | 3 days | Filter không hoạt động, UI bị vỡ |
| Low (S4) | Cosmetic, minor UI issues | Next sprint | Typo, alignment issues |

### 7.3. Bug Priority

| Priority | Định nghĩa | Action |
|----------|------------|--------|
| P1 - Immediate | Block testing/release | Fix immediately, hotfix |
| P2 - High | Cần fix trước release | Fix trong sprint hiện tại |
| P3 - Medium | Nên fix | Schedule cho sprint tiếp |
| P4 - Low | Nice to have | Backlog |

---

## 8. Quy trình báo cáo (Reporting)

### 8.1. Daily
- Test execution status (pass/fail/blocked)
- New bugs found today
- Blocker issues

### 8.2. Weekly
- Test progress report (% complete)
- Bug metrics (open/closed/deferred)
- Risk assessment update
- Environment health

### 8.3. End of Cycle
- Full test report (all metrics)
- Bug summary & trends
- Coverage analysis
- Go/No-Go recommendation

---

## 9. Phê duyệt

| Vai trò | Tên | Chữ ký | Ngày |
|---------|-----|--------|------|
| QA Lead | | | |
| Project Manager | | | |
| Tech Lead | | | |
| Product Owner | | | |
