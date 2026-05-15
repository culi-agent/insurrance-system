# Test Report Template - Mẫu Báo Cáo Kiểm Thử

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Test Execution Report

### 1.1. Summary

| Field | Value |
|-------|-------|
| Release | v0.1 (MVP) |
| Test Cycle | Cycle 1 / Cycle 2 / Regression |
| Period | [Start Date] - [End Date] |
| Environment | QA / Staging |
| Build | [Version / Commit] |
| Prepared by | [QA Lead] |
| Date | [DD/MM/YYYY] |

---

### 1.2. Executive Summary

**Overall Status:** ☐ On Track / ☐ At Risk / ☐ Blocked

**Summary:**
> [1-2 paragraph tóm tắt trạng thái testing, highlights, concerns]

**Recommendation:** ☐ Go / ☐ No-Go / ☐ Conditional Go

**Conditions (if applicable):**
1. [Condition 1]
2. [Condition 2]

---

## 2. Test Execution Metrics

### 2.1. Overall Progress

| Metric | Count | Percentage |
|--------|-------|-----------|
| Total Test Cases | --- | 100% |
| Executed | --- | ---% |
| Passed | --- | ---% |
| Failed | --- | ---% |
| Blocked | --- | ---% |
| Not Executed | --- | ---% |

### 2.2. Progress by Module

| Module | Total | Passed | Failed | Blocked | Pass Rate |
|--------|-------|--------|--------|---------|-----------|
| Authentication | --- | --- | --- | --- | ---% |
| Product Catalog | --- | --- | --- | --- | ---% |
| Quote Engine | --- | --- | --- | --- | ---% |
| Purchase Flow | --- | --- | --- | --- | ---% |
| Claims | --- | --- | --- | --- | ---% |
| Payment | --- | --- | --- | --- | ---% |
| Customer Dashboard | --- | --- | --- | --- | ---% |
| Admin Panel | --- | --- | --- | --- | ---% |
| Notifications | --- | --- | --- | --- | ---% |
| **TOTAL** | **---** | **---** | **---** | **---** | **---**% |

### 2.3. Progress by Priority

| Priority | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| P0 (Critical) | --- | --- | --- | ---% |
| P1 (High) | --- | --- | --- | ---% |
| P2 (Medium) | --- | --- | --- | ---% |
| P3 (Low) | --- | --- | --- | ---% |

### 2.4. Daily Execution Trend

| Date | Executed | Passed | Failed | Cumulative Pass Rate |
|------|----------|--------|--------|---------------------|
| Day 1 | | | | |
| Day 2 | | | | |
| Day 3 | | | | |
| Day 4 | | | | |
| Day 5 | | | | |

---

## 3. Defect Summary

### 3.1. Defect Overview

| Metric | Count |
|--------|-------|
| Total Bugs Found | --- |
| Critical (S1) | --- |
| High (S2) | --- |
| Medium (S3) | --- |
| Low (S4) | --- |
| Bugs Fixed | --- |
| Bugs Verified | --- |
| Bugs Open | --- |
| Bugs Deferred | --- |

### 3.2. Defect by Module

| Module | S1 | S2 | S3 | S4 | Total | Open |
|--------|----|----|----|----|-------|------|
| Authentication | | | | | | |
| Product Catalog | | | | | | |
| Quote Engine | | | | | | |
| Purchase Flow | | | | | | |
| Claims | | | | | | |
| Payment | | | | | | |
| Dashboard | | | | | | |
| Admin Panel | | | | | | |
| Notifications | | | | | | |
| **TOTAL** | | | | | | |

### 3.3. Defect Status Distribution

| Status | S1 | S2 | S3 | S4 | Total |
|--------|----|----|----|----|-------|
| New | | | | | |
| Assigned | | | | | |
| In Fix | | | | | |
| Fixed (awaiting verify) | | | | | |
| Verified | | | | | |
| Closed | | | | | |
| Deferred | | | | | |
| Rejected | | | | | |

### 3.4. Top Blocking Defects

| Bug ID | Title | Severity | Module | Status | Impact |
|--------|-------|----------|--------|--------|--------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## 4. Test Type Results

### 4.1. Functional Testing

| Area | Status | Notes |
|------|--------|-------|
| User Registration & Login | ☐ Pass / ☐ Fail | |
| Product Browse & Search | ☐ Pass / ☐ Fail | |
| Quote Generation | ☐ Pass / ☐ Fail | |
| Purchase Flow (Simple) | ☐ Pass / ☐ Fail | |
| Purchase Flow (Complex) | ☐ Pass / ☐ Fail | |
| Claims Submission | ☐ Pass / ☐ Fail | |
| Claims Processing | ☐ Pass / ☐ Fail | |
| Payment (All methods) | ☐ Pass / ☐ Fail | |
| Policy Management | ☐ Pass / ☐ Fail | |
| Admin Operations | ☐ Pass / ☐ Fail | |
| Notifications | ☐ Pass / ☐ Fail | |

### 4.2. Integration Testing

| Integration Point | Status | Notes |
|-------------------|--------|-------|
| Frontend ↔ Backend API | ☐ Pass / ☐ Fail | |
| Backend ↔ Database | ☐ Pass / ☐ Fail | |
| Backend ↔ Redis Cache | ☐ Pass / ☐ Fail | |
| Payment Gateway (Momo) | ☐ Pass / ☐ Fail | |
| Payment Gateway (VNPay) | ☐ Pass / ☐ Fail | |
| Payment Gateway (ZaloPay) | ☐ Pass / ☐ Fail | |
| eKYC Service | ☐ Pass / ☐ Fail | |
| Email Service | ☐ Pass / ☐ Fail | |
| SMS Service | ☐ Pass / ☐ Fail | |
| Insurer APIs | ☐ Pass / ☐ Fail | |
| File Storage (S3) | ☐ Pass / ☐ Fail | |

### 4.3. Regression Testing

| Metric | Value |
|--------|-------|
| Total Regression Tests | --- |
| Passed | --- |
| Failed | --- |
| Pass Rate | ---% |
| Execution Time | --- min |
| New Regressions Found | --- |

---

## 5. Risk Assessment

### 5.1. Current Risks

| # | Risk | Probability | Impact | Mitigation | Status |
|---|------|------------|--------|-----------|--------|
| 1 | | High/Med/Low | High/Med/Low | | Open/Mitigated |
| 2 | | | | | |
| 3 | | | | | |

### 5.2. Issues & Blockers

| # | Issue | Impact | Owner | ETA Resolution |
|---|-------|--------|-------|---------------|
| 1 | | | | |
| 2 | | | | |

---

## 6. Quality Gates Status

| Gate | Criteria | Target | Actual | Status |
|------|----------|--------|--------|--------|
| Unit Test Coverage | Lines covered | ≥ 80% | ---% | ☐ Pass / ☐ Fail |
| Integration Tests | Pass rate | 100% | ---% | ☐ Pass / ☐ Fail |
| E2E Tests | Pass rate | ≥ 98% | ---% | ☐ Pass / ☐ Fail |
| Critical Bugs | Open count | 0 | --- | ☐ Pass / ☐ Fail |
| High Bugs | Open count | 0 | --- | ☐ Pass / ☐ Fail |
| Performance | API P95 | < 500ms | ---ms | ☐ Pass / ☐ Fail |
| Security | Critical vulns | 0 | --- | ☐ Pass / ☐ Fail |

---

## 7. Conclusion & Recommendations

### 7.1. Summary of Findings
```
[Key findings from this test cycle]
```

### 7.2. Areas of Concern
```
[Modules/features that need attention]
```

### 7.3. Recommendation
- ☐ **GO** - All quality gates passed, recommend release
- ☐ **CONDITIONAL GO** - Release with known issues (listed below)
- ☐ **NO-GO** - Critical issues prevent release

### 7.4. Action Items

| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 8. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Tech Lead | | | |
| Product Owner | | | |
| Project Manager | | | |
