# Coverage Report Template - Mẫu Báo Cáo Phạm Vi Kiểm Thử

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Code Coverage Summary

### 1.1. Report Info

| Field | Value |
|-------|-------|
| Build | [Version / Commit] |
| Date | [DD/MM/YYYY] |
| Tool | Jest (Unit) + Istanbul/nyc (Integration) |
| Environment | CI Pipeline |

### 1.2. Overall Coverage

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Lines | ≥ 80% | ---% | ☐ Pass / ☐ Fail |
| Statements | ≥ 80% | ---% | ☐ Pass / ☐ Fail |
| Branches | ≥ 75% | ---% | ☐ Pass / ☐ Fail |
| Functions | ≥ 80% | ---% | ☐ Pass / ☐ Fail |

---

## 2. Coverage by Module

### 2.1. Backend (BE)

| Module | Lines | Branches | Functions | Status |
|--------|-------|----------|-----------|--------|
| Auth (controllers) | ---% | ---% | ---% | ☐ |
| Auth (services) | ---% | ---% | ---% | ☐ |
| Auth (middleware) | ---% | ---% | ---% | ☐ |
| Product (controllers) | ---% | ---% | ---% | ☐ |
| Product (services) | ---% | ---% | ---% | ☐ |
| Quote (controllers) | ---% | ---% | ---% | ☐ |
| Quote (services/pricing) | ---% | ---% | ---% | ☐ |
| Purchase (controllers) | ---% | ---% | ---% | ☐ |
| Purchase (services) | ---% | ---% | ---% | ☐ |
| Claims (controllers) | ---% | ---% | ---% | ☐ |
| Claims (services) | ---% | ---% | ---% | ☐ |
| Payment (controllers) | ---% | ---% | ---% | ☐ |
| Payment (services) | ---% | ---% | ---% | ☐ |
| Notification (services) | ---% | ---% | ---% | ☐ |
| Admin (controllers) | ---% | ---% | ---% | ☐ |
| Shared/Utils | ---% | ---% | ---% | ☐ |
| **TOTAL BE** | **---**% | **---**% | **---**% | ☐ |

### 2.2. Frontend (FE)

| Module | Lines | Branches | Functions | Status |
|--------|-------|----------|-----------|--------|
| Components/Auth | ---% | ---% | ---% | ☐ |
| Components/Product | ---% | ---% | ---% | ☐ |
| Components/Quote | ---% | ---% | ---% | ☐ |
| Components/Purchase | ---% | ---% | ---% | ☐ |
| Components/Claims | ---% | ---% | ---% | ☐ |
| Components/Payment | ---% | ---% | ---% | ☐ |
| Components/Dashboard | ---% | ---% | ---% | ☐ |
| Components/Admin | ---% | ---% | ---% | ☐ |
| Components/Shared (UI) | ---% | ---% | ---% | ☐ |
| Hooks | ---% | ---% | ---% | ☐ |
| Utils/Helpers | ---% | ---% | ---% | ☐ |
| State Management | ---% | ---% | ---% | ☐ |
| API Client | ---% | ---% | ---% | ☐ |
| **TOTAL FE** | **---**% | **---**% | **---**% | ☐ |

---

## 3. Test Coverage Analysis

### 3.1. Coverage Trend

| Sprint/Week | Lines | Branches | Functions | Delta |
|-------------|-------|----------|-----------|-------|
| Sprint 1 | ---% | ---% | ---% | - |
| Sprint 2 | ---% | ---% | ---% | +/- % |
| Sprint 3 | ---% | ---% | ---% | +/- % |
| Sprint 4 | ---% | ---% | ---% | +/- % |
| Sprint 5 | ---% | ---% | ---% | +/- % |

### 3.2. Coverage Gaps (Below Threshold)

| File/Module | Current | Target | Gap | Action Required |
|-------------|---------|--------|-----|-----------------|
| | ---% | 80% | ---% | |
| | ---% | 80% | ---% | |
| | ---% | 80% | ---% | |
| | ---% | 80% | ---% | |

### 3.3. Uncovered Critical Paths

| # | Critical Path | Coverage | Risk | Priority to Cover |
|---|--------------|----------|------|-------------------|
| 1 | Payment processing logic | ---% | High | P1 |
| 2 | Quote pricing calculation | ---% | High | P1 |
| 3 | Underwriting rules engine | ---% | High | P1 |
| 4 | Claims settlement logic | ---% | Medium | P2 |
| 5 | Policy state transitions | ---% | Medium | P2 |

---

## 4. Integration Test Coverage

### 4.1. API Endpoint Coverage

| API Group | Total Endpoints | Tested | Coverage |
|-----------|----------------|--------|----------|
| /api/auth/* | --- | --- | ---% |
| /api/products/* | --- | --- | ---% |
| /api/quotes/* | --- | --- | ---% |
| /api/purchases/* | --- | --- | ---% |
| /api/claims/* | --- | --- | ---% |
| /api/payments/* | --- | --- | ---% |
| /api/policies/* | --- | --- | ---% |
| /api/admin/* | --- | --- | ---% |
| /api/notifications/* | --- | --- | ---% |
| /api/users/* | --- | --- | ---% |
| **TOTAL** | **---** | **---** | **---**% |

### 4.2. API Test Types Coverage

| Endpoint Group | Happy Path | Error Cases | Edge Cases | Auth/RBAC |
|---------------|-----------|-------------|-----------|-----------|
| Auth | ☐ | ☐ | ☐ | ☐ |
| Products | ☐ | ☐ | ☐ | ☐ |
| Quotes | ☐ | ☐ | ☐ | ☐ |
| Purchases | ☐ | ☐ | ☐ | ☐ |
| Claims | ☐ | ☐ | ☐ | ☐ |
| Payments | ☐ | ☐ | ☐ | ☐ |
| Policies | ☐ | ☐ | ☐ | ☐ |
| Admin | ☐ | ☐ | ☐ | ☐ |

---

## 5. E2E Test Coverage

### 5.1. User Journey Coverage

| Journey | Covered | Automated | Manual Only |
|---------|---------|-----------|-------------|
| Registration & Login | ☐ | ☐ | ☐ |
| Browse & Search Products | ☐ | ☐ | ☐ |
| Get Quote (Motor) | ☐ | ☐ | ☐ |
| Get Quote (Health) | ☐ | ☐ | ☐ |
| Get Quote (Life) | ☐ | ☐ | ☐ |
| Get Quote (Travel) | ☐ | ☐ | ☐ |
| Purchase Motor Insurance | ☐ | ☐ | ☐ |
| Purchase Health Insurance | ☐ | ☐ | ☐ |
| Submit Health Claim | ☐ | ☐ | ☐ |
| Submit Motor Claim | ☐ | ☐ | ☐ |
| Track Claim Status | ☐ | ☐ | ☐ |
| Renew Policy | ☐ | ☐ | ☐ |
| Cancel Policy | ☐ | ☐ | ☐ |
| Admin Process Claim | ☐ | ☐ | ☐ |
| Admin Manage Products | ☐ | ☐ | ☐ |
| Payment (All methods) | ☐ | ☐ | ☐ |

### 5.2. Browser/Device Coverage

| Browser/Device | Tested | Automated | Last Tested |
|---------------|--------|-----------|-------------|
| Chrome Desktop | ☐ | ☐ | |
| Chrome Mobile | ☐ | ☐ | |
| Safari Desktop | ☐ | ☐ | |
| Safari iOS | ☐ | ☐ | |
| Firefox Desktop | ☐ | ☐ | |
| Edge Desktop | ☐ | ☐ | |
| Samsung Internet | ☐ | ☐ | |

---

## 6. Requirements Traceability

### 6.1. Functional Requirements Coverage

| Requirement ID | Description | Test Cases | Covered | Status |
|---------------|-------------|-----------|---------|--------|
| FR-AUTH-001 | Đăng ký tài khoản | TC-AUTH-001~003 | ☐ | |
| FR-AUTH-002 | Đăng nhập | TC-AUTH-004~006 | ☐ | |
| FR-AUTH-003 | Social Login | TC-AUTH-007~009 | ☐ | |
| FR-PROD-001 | Hiển thị danh mục | TC-PROD-001~003 | ☐ | |
| FR-PROD-002 | Chi tiết sản phẩm | TC-PROD-004 | ☐ | |
| FR-PROD-003 | So sánh sản phẩm | TC-PROD-005~007 | ☐ | |
| FR-QUOTE-001 | Báo giá xe máy | TC-QUOTE-001~003 | ☐ | |
| FR-QUOTE-002 | Báo giá sức khỏe | TC-QUOTE-004~006 | ☐ | |
| FR-QUOTE-003 | Báo giá nhân thọ | TC-QUOTE-007~008 | ☐ | |
| FR-QUOTE-004 | Báo giá du lịch | TC-QUOTE-009~010 | ☐ | |
| FR-PURCH-001 | Mua BH xe máy | TC-PURCH-001~005 | ☐ | |
| FR-PURCH-002 | Mua BH sức khỏe | TC-PURCH-006~010 | ☐ | |
| FR-CLAIMS-001 | Submit claim SK | TC-CLAIMS-001~005 | ☐ | |
| FR-CLAIMS-002 | Submit claim xe | TC-CLAIMS-006~008 | ☐ | |
| FR-PAY-001 | Payment methods | TC-PAY-001~006 | ☐ | |
| FR-PAY-002 | Recurring payment | TC-PAY-007~010 | ☐ | |
| FR-ADMIN-001 | Admin dashboard | TC-ADMIN-001~003 | ☐ | |
| FR-ADMIN-002 | Claims management | TC-ADMIN-004~008 | ☐ | |

**Requirements Coverage:** --- / --- = ---% covered

### 6.2. Non-Functional Requirements Coverage

| NFR Category | Tested | Method | Status |
|-------------|--------|--------|--------|
| Performance (Response Time) | ☐ | K6 load test | |
| Performance (Throughput) | ☐ | K6 stress test | |
| Scalability (Auto-scale) | ☐ | Infrastructure test | |
| Security (OWASP Top 10) | ☐ | ZAP scan | |
| Security (Authentication) | ☐ | Pen test | |
| Security (Data Protection) | ☐ | Manual review | |
| Availability (99.9%) | ☐ | Monitoring | |
| Compatibility (Browsers) | ☐ | BrowserStack | |
| Accessibility (WCAG 2.1) | ☐ | aXe + manual | |
| Localization (vi-VN, en-US) | ☐ | Manual review | |

---

## 7. Coverage Improvement Plan

### 7.1. Immediate Actions (This Sprint)

| # | Action | Target Improvement | Owner | Due |
|---|--------|-------------------|-------|-----|
| 1 | | +---% | | |
| 2 | | +---% | | |
| 3 | | +---% | | |

### 7.2. Short-term Plan (Next 2 Sprints)

| # | Action | Target | Owner |
|---|--------|--------|-------|
| 1 | Cover payment service edge cases | 90% | |
| 2 | Add integration tests for claims flow | 70% | |
| 3 | E2E tests for all quote types | 100% coverage | |

### 7.3. Coverage Targets by Release

| Release | Unit Coverage | Integration | E2E Journeys | Requirements |
|---------|-------------|-------------|--------------|-------------|
| MVP (v0.1) | 80% | 60% | 80% | 90% |
| v1.0 | 85% | 70% | 90% | 95% |
| v1.5 | 85% | 75% | 95% | 98% |
| v2.0 | 90% | 80% | 95% | 100% |

---

## 8. Sign-Off

| Role | Name | Date |
|------|------|------|
| QA Lead | | |
| Tech Lead | | |
