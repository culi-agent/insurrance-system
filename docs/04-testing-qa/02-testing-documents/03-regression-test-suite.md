# Regression Test Suite - Bộ Kiểm Thử Hồi Quy

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Team |
| Execution Time (Target) | < 2 giờ (automated) |

---

## 1. Tổng quan

### 1.1. Mục đích
Bộ kiểm thử hồi quy đảm bảo rằng các chức năng hiện có không bị ảnh hưởng sau khi có thay đổi code, bug fix, hoặc feature mới.

### 1.2. Khi nào chạy Regression
- Trước mỗi release/deployment
- Sau mỗi major bug fix
- Sau khi merge feature branch lớn
- Nightly build (automated)
- Khi thay đổi infrastructure/dependencies

### 1.3. Phân loại

| Level | Scope | Duration | Khi nào |
|-------|-------|----------|---------|
| Smoke (L1) | Critical paths only | 15 min | Mỗi deployment |
| Sanity (L2) | Core features | 45 min | Daily build |
| Full Regression (L3) | All features | 2 hours | Before release |

---

## 2. Smoke Test Suite (L1) - 15 phút

> **Mục tiêu:** Verify hệ thống cơ bản hoạt động sau deployment

### 2.1. Health Check

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SM-001 | API health endpoint responds | 200 OK | ✓ |
| SM-002 | Frontend loads successfully | 200, no JS errors | ✓ |
| SM-003 | Database connection active | Query returns | ✓ |
| SM-004 | Redis cache connection | PING → PONG | ✓ |
| SM-005 | S3 storage accessible | List objects success | ✓ |

### 2.2. Critical User Flows

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SM-010 | Homepage loads | All sections render | ✓ |
| SM-011 | Login with valid credentials | Redirect to dashboard | ✓ |
| SM-012 | Product catalog loads | Products visible | ✓ |
| SM-013 | Quote generation (motor) | Quotes returned | ✓ |
| SM-014 | Payment page accessible | Payment form renders | ✓ |
| SM-015 | Dashboard loads for logged-in user | User data displayed | ✓ |
| SM-016 | Admin panel accessible | Dashboard renders | ✓ |
| SM-017 | Email service responsive | Test email sent | ✓ |
| SM-018 | SMS service responsive | Test SMS queued | ✓ |

---

## 3. Sanity Test Suite (L2) - 45 phút

> **Mục tiêu:** Verify core features hoạt động đúng

### 3.1. Authentication Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-AUTH-001 | Register new account | Account created | ✓ |
| SN-AUTH-002 | Login email + password | JWT issued | ✓ |
| SN-AUTH-003 | Login wrong password | Error returned | ✓ |
| SN-AUTH-004 | Logout | Session cleared | ✓ |
| SN-AUTH-005 | Token refresh | New token issued | ✓ |
| SN-AUTH-006 | Access protected route without token | 401 | ✓ |

### 3.2. Product Catalog Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-PROD-001 | List all categories | 7 categories returned | ✓ |
| SN-PROD-002 | List products by category | Products returned | ✓ |
| SN-PROD-003 | Product detail page | Full details | ✓ |
| SN-PROD-004 | Search products | Relevant results | ✓ |
| SN-PROD-005 | Filter by price | Correct filtering | ✓ |
| SN-PROD-006 | Sort products | Correct ordering | ✓ |

### 3.3. Quote Engine Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-QUOTE-001 | Motor quote - valid input | Quotes returned | ✓ |
| SN-QUOTE-002 | Health quote - valid input | Quotes returned | ✓ |
| SN-QUOTE-003 | Quote with invalid age | Error: ineligible | ✓ |
| SN-QUOTE-004 | Quote save (logged in) | Quote saved | ✓ |
| SN-QUOTE-005 | Quote comparison view | Comparison renders | ✓ |

### 3.4. Purchase Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-PURCH-001 | Start purchase from quote | Form loads | ✓ |
| SN-PURCH-002 | Form validation (required fields) | Errors shown | ✓ |
| SN-PURCH-003 | eKYC upload | File accepted | ✓ |
| SN-PURCH-004 | Payment initiation | Redirect to gateway | ✓ |
| SN-PURCH-005 | Payment callback success | Policy created | ✓ |
| SN-PURCH-006 | Policy PDF generation | PDF downloadable | ✓ |

### 3.5. Claims Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-CLAIMS-001 | Submit claim form | Claim created | ✓ |
| SN-CLAIMS-002 | Upload claim documents | Files uploaded | ✓ |
| SN-CLAIMS-003 | View claim status | Status displayed | ✓ |
| SN-CLAIMS-004 | Admin view claims queue | Queue loaded | ✓ |
| SN-CLAIMS-005 | Admin approve claim | Status updated | ✓ |

### 3.6. Payment Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-PAY-001 | Payment via test gateway | Success response | ✓ |
| SN-PAY-002 | Payment history list | Records shown | ✓ |
| SN-PAY-003 | Refund initiation | Refund queued | ✓ |

### 3.7. Dashboard Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-DASH-001 | View active policies | List populated | ✓ |
| SN-DASH-002 | View claims list | Claims shown | ✓ |
| SN-DASH-003 | Update profile | Changes saved | ✓ |
| SN-DASH-004 | Notification list | Notifications rendered | ✓ |

### 3.8. Admin Module

| ID | Test | Expected | Auto |
|----|------|----------|------|
| SN-ADMIN-001 | Admin dashboard KPIs | Data loaded | ✓ |
| SN-ADMIN-002 | Product management CRUD | Operations work | ✓ |
| SN-ADMIN-003 | Customer search | Results returned | ✓ |
| SN-ADMIN-004 | Claims management | Queue functional | ✓ |
| SN-ADMIN-005 | Reports generation | Reports render | ✓ |

---

## 4. Full Regression Test Suite (L3) - 2 giờ

> **Mục tiêu:** Kiểm thử toàn diện tất cả features

### 4.1. Authentication - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-AUTH-001 | Register - all valid fields | ✓ | P0 |
| RG-AUTH-002 | Register - duplicate email | ✓ | P0 |
| RG-AUTH-003 | Register - duplicate phone | ✓ | P0 |
| RG-AUTH-004 | Register - invalid email format | ✓ | P1 |
| RG-AUTH-005 | Register - weak password (each rule) | ✓ | P1 |
| RG-AUTH-006 | Register - OTP verify success | ✓ | P0 |
| RG-AUTH-007 | Register - OTP expired | ✓ | P1 |
| RG-AUTH-008 | Register - OTP resend limit | ✓ | P2 |
| RG-AUTH-009 | Login - email success | ✓ | P0 |
| RG-AUTH-010 | Login - phone success | ✓ | P0 |
| RG-AUTH-011 | Login - wrong password | ✓ | P0 |
| RG-AUTH-012 | Login - account lockout (5 fails) | ✓ | P0 |
| RG-AUTH-013 | Login - remember me token | ✓ | P1 |
| RG-AUTH-014 | Login - new device notification | ✓ | P2 |
| RG-AUTH-015 | Social login - Google new user | ✓ | P1 |
| RG-AUTH-016 | Social login - Google existing email | ✓ | P1 |
| RG-AUTH-017 | Social login - Facebook | ✓ | P1 |
| RG-AUTH-018 | Forgot password - valid email | ✓ | P0 |
| RG-AUTH-019 | Forgot password - reset link expired | ✓ | P1 |
| RG-AUTH-020 | Change password - success | ✓ | P1 |
| RG-AUTH-021 | Logout - clear tokens | ✓ | P0 |
| RG-AUTH-022 | Token refresh flow | ✓ | P0 |
| RG-AUTH-023 | RBAC - customer access | ✓ | P0 |
| RG-AUTH-024 | RBAC - admin access | ✓ | P0 |
| RG-AUTH-025 | RBAC - unauthorized access | ✓ | P0 |

### 4.2. Product Catalog - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-PROD-001 | List all categories (7) | ✓ | P0 |
| RG-PROD-002 | List sub-categories | ✓ | P0 |
| RG-PROD-003 | Product detail - all sections | ✓ | P0 |
| RG-PROD-004 | Filter - single category | ✓ | P1 |
| RG-PROD-005 | Filter - multiple categories | ✓ | P1 |
| RG-PROD-006 | Filter - by insurer | ✓ | P1 |
| RG-PROD-007 | Filter - by price range | ✓ | P1 |
| RG-PROD-008 | Filter - by rating | ✓ | P2 |
| RG-PROD-009 | Filter - combined filters | ✓ | P1 |
| RG-PROD-010 | Filter - no results | ✓ | P2 |
| RG-PROD-011 | Sort - price asc | ✓ | P1 |
| RG-PROD-012 | Sort - price desc | ✓ | P1 |
| RG-PROD-013 | Sort - rating | ✓ | P2 |
| RG-PROD-014 | Sort - popularity | ✓ | P2 |
| RG-PROD-015 | Search - keyword match | ✓ | P1 |
| RG-PROD-016 | Search - no results | ✓ | P2 |
| RG-PROD-017 | Compare - 2 products | ✓ | P1 |
| RG-PROD-018 | Compare - 4 products (max) | ✓ | P1 |
| RG-PROD-019 | Compare - exceed max | ✓ | P2 |
| RG-PROD-020 | Pagination - navigation | ✓ | P1 |

### 4.3. Quote Engine - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-QUOTE-001 | Motor quote - Honda 110cc | ✓ | P0 |
| RG-QUOTE-002 | Motor quote - business use (1.3x) | ✓ | P1 |
| RG-QUOTE-003 | Motor quote - old vehicle | ✓ | P1 |
| RG-QUOTE-004 | Motor quote - no-claim discount | ✓ | P1 |
| RG-QUOTE-005 | Health quote - 30y, standard | ✓ | P0 |
| RG-QUOTE-006 | Health quote - 50y, higher rate | ✓ | P0 |
| RG-QUOTE-007 | Health quote - smoker loading | ✓ | P1 |
| RG-QUOTE-008 | Health quote - pre-existing condition | ✓ | P1 |
| RG-QUOTE-009 | Health quote - family plan | ✓ | P1 |
| RG-QUOTE-010 | Health quote - various deductibles | ✓ | P1 |
| RG-QUOTE-011 | Life quote - standard | ✓ | P0 |
| RG-QUOTE-012 | Life quote - with riders | ✓ | P1 |
| RG-QUOTE-013 | Life quote - ineligible age | ✓ | P1 |
| RG-QUOTE-014 | Travel quote - domestic | ✓ | P0 |
| RG-QUOTE-015 | Travel quote - international | ✓ | P0 |
| RG-QUOTE-016 | Quote - insurer API timeout | ✓ | P1 |
| RG-QUOTE-017 | Quote - all insurers timeout | ✓ | P2 |
| RG-QUOTE-018 | Quote - save to account | ✓ | P1 |
| RG-QUOTE-019 | Quote - share via link | ✓ | P2 |
| RG-QUOTE-020 | Quote - expiry (30 days) | ✓ | P2 |
| RG-QUOTE-021 | Quote - rate limiting | ✓ | P2 |
| RG-QUOTE-022 | Quote - real-time price update | ✓ | P1 |

### 4.4. Purchase Flow - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-PURCH-001 | Motor purchase - complete flow | ✓ | P0 |
| RG-PURCH-002 | Health purchase - complete flow | ✓ | P0 |
| RG-PURCH-003 | eKYC - OCR success | ✓ | P0 |
| RG-PURCH-004 | eKYC - OCR fail, manual fallback | ✓ | P1 |
| RG-PURCH-005 | eKYC - CCCD expired | ✓ | P1 |
| RG-PURCH-006 | Underwriting - auto approve | ✓ | P0 |
| RG-PURCH-007 | Underwriting - refer | ✓ | P1 |
| RG-PURCH-008 | Underwriting - decline | ✓ | P1 |
| RG-PURCH-009 | Payment - Momo success | ✓ | P0 |
| RG-PURCH-010 | Payment - VNPay success | ✓ | P0 |
| RG-PURCH-011 | Payment - fail + retry | ✓ | P0 |
| RG-PURCH-012 | Payment - timeout | ✓ | P1 |
| RG-PURCH-013 | Policy issuance - PDF | ✓ | P0 |
| RG-PURCH-014 | Confirmation email sent | ✓ | P0 |
| RG-PURCH-015 | Confirmation SMS sent | ✓ | P1 |
| RG-PURCH-016 | Policy in dashboard | ✓ | P0 |
| RG-PURCH-017 | Age validation (< 18) | ✓ | P1 |
| RG-PURCH-018 | Session timeout (30 min) | ✓ | P2 |
| RG-PURCH-019 | E-signature OTP | ✓ | P0 |
| RG-PURCH-020 | Terms & conditions required | ✓ | P1 |

### 4.5. Claims - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-CLAIMS-001 | Submit health claim - inpatient | ✓ | P0 |
| RG-CLAIMS-002 | Submit health claim - outpatient | ✓ | P0 |
| RG-CLAIMS-003 | Submit motor claim - accident | ✓ | P0 |
| RG-CLAIMS-004 | Submit motor claim - theft | ✓ | P1 |
| RG-CLAIMS-005 | Claim - outside policy period | ✓ | P0 |
| RG-CLAIMS-006 | Claim - inactive policy | ✓ | P1 |
| RG-CLAIMS-007 | Document upload - valid files | ✓ | P0 |
| RG-CLAIMS-008 | Document upload - oversized | ✓ | P1 |
| RG-CLAIMS-009 | Document upload - invalid format | ✓ | P1 |
| RG-CLAIMS-010 | Claim status tracking | ✓ | P0 |
| RG-CLAIMS-011 | Admin - assign handler | ✓ | P1 |
| RG-CLAIMS-012 | Admin - approve claim | ✓ | P0 |
| RG-CLAIMS-013 | Admin - partial approve | ✓ | P1 |
| RG-CLAIMS-014 | Admin - reject claim | ✓ | P0 |
| RG-CLAIMS-015 | Admin - request more info | ✓ | P1 |
| RG-CLAIMS-016 | Settlement payment | ✓ | P0 |
| RG-CLAIMS-017 | Customer notification on update | ✓ | P1 |
| RG-CLAIMS-018 | Fast-track claim (< 5M) | ✓ | P2 |

### 4.6. Payment - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-PAY-001 | Payment - Momo | ✓ | P0 |
| RG-PAY-002 | Payment - ZaloPay | ✓ | P0 |
| RG-PAY-003 | Payment - VNPay ATM | ✓ | P0 |
| RG-PAY-004 | Payment - Visa/Mastercard | ✓ | P0 |
| RG-PAY-005 | Payment - Virtual Account | ✓ | P1 |
| RG-PAY-006 | Recurring - setup | ✓ | P1 |
| RG-PAY-007 | Recurring - auto charge success | ✓ | P1 |
| RG-PAY-008 | Recurring - fail + retry | ✓ | P1 |
| RG-PAY-009 | Recurring - grace period | ✓ | P2 |
| RG-PAY-010 | Refund - full | ✓ | P0 |
| RG-PAY-011 | Refund - partial (pro-rata) | ✓ | P1 |
| RG-PAY-012 | Payment history | ✓ | P1 |
| RG-PAY-013 | Receipt download | ✓ | P2 |
| RG-PAY-014 | Idempotency (double charge prevention) | ✓ | P0 |

### 4.7. Policy Lifecycle - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-POL-001 | View active policy | ✓ | P0 |
| RG-POL-002 | Download policy PDF | ✓ | P0 |
| RG-POL-003 | Renewal reminder (email) | ✓ | P1 |
| RG-POL-004 | Auto-renewal success | ✓ | P1 |
| RG-POL-005 | Manual renewal | ✓ | P1 |
| RG-POL-006 | Cancel - cooling off (full refund) | ✓ | P0 |
| RG-POL-007 | Cancel - post cooling off | ✓ | P1 |
| RG-POL-008 | Cancel - with claims (no refund) | ✓ | P1 |
| RG-POL-009 | Policy lapse (no payment) | ✓ | P1 |
| RG-POL-010 | Endorse policy | ✓ | P2 |

### 4.8. Notifications - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-NOTIF-001 | Registration email | ✓ | P0 |
| RG-NOTIF-002 | Purchase confirmation (all channels) | ✓ | P0 |
| RG-NOTIF-003 | Claim status update | ✓ | P0 |
| RG-NOTIF-004 | Payment reminder | ✓ | P1 |
| RG-NOTIF-005 | Renewal reminder | ✓ | P1 |
| RG-NOTIF-006 | In-app notification center | ✓ | P1 |
| RG-NOTIF-007 | Notification preferences | ✓ | P2 |
| RG-NOTIF-008 | Unsubscribe | ✓ | P2 |

### 4.9. Admin Panel - Full

| ID | Test | Auto | Priority |
|----|------|------|----------|
| RG-ADMIN-001 | Dashboard KPIs | ✓ | P0 |
| RG-ADMIN-002 | Product - Create | ✓ | P0 |
| RG-ADMIN-003 | Product - Update | ✓ | P0 |
| RG-ADMIN-004 | Product - Deactivate | ✓ | P1 |
| RG-ADMIN-005 | Customer - Search | ✓ | P0 |
| RG-ADMIN-006 | Customer - View detail | ✓ | P1 |
| RG-ADMIN-007 | Policy - View/Manage | ✓ | P1 |
| RG-ADMIN-008 | Claims queue management | ✓ | P0 |
| RG-ADMIN-009 | Reports - Sales | ✓ | P1 |
| RG-ADMIN-010 | Reports - Claims | ✓ | P1 |
| RG-ADMIN-011 | User management | ✓ | P1 |
| RG-ADMIN-012 | Role/Permission CRUD | ✓ | P1 |
| RG-ADMIN-013 | Audit log | ✓ | P2 |

---

## 5. Regression Execution Summary

### 5.1. Tổng hợp

| Suite | Total Tests | Automated | Manual | Duration |
|-------|-------------|-----------|--------|----------|
| Smoke (L1) | 14 | 14 (100%) | 0 | 15 min |
| Sanity (L2) | 35 | 35 (100%) | 0 | 45 min |
| Full Regression (L3) | 160+ | 150+ (94%) | 10 | 2 hours |

### 5.2. Maintenance Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Review & update test cases | Each sprint | QA Engineer |
| Add new tests for new features | Per feature | QA Engineer |
| Remove obsolete tests | Monthly | QA Lead |
| Optimize slow tests | Monthly | Senior QA |
| Review flaky tests | Weekly | QA Team |
| Update test data | Per test cycle | QA Engineer |

### 5.3. Flaky Test Policy
- Test fail > 3 times without code change → Mark as flaky
- Flaky tests must be fixed within 1 sprint
- Quarantine flaky tests (don't block pipeline)
- Root cause analysis required for each flaky test
