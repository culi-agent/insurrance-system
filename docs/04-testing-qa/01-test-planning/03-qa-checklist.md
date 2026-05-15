# QA Checklist - Danh Sách Kiểm Tra Chất Lượng

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Team |

---

## 1. Pre-Development Checklist

### 1.1. Requirements Review
- [ ] Requirements đã rõ ràng, không mơ hồ
- [ ] Acceptance criteria được định nghĩa cho mỗi user story
- [ ] Edge cases đã được xác định
- [ ] Non-functional requirements đã rõ ràng (performance, security)
- [ ] Dependencies với third-party đã được xác định
- [ ] Test data requirements đã được document
- [ ] Mockup/wireframe đã được review (nếu có)

### 1.2. Test Preparation
- [ ] Test cases đã được viết và review
- [ ] Test environment sẵn sàng
- [ ] Test data đã được chuẩn bị
- [ ] Test tools đã được configure
- [ ] Access permissions cho QA team đã sẵn sàng
- [ ] API documentation available và up-to-date

---

## 2. Development Phase Checklist

### 2.1. Code Quality (Developer Self-Check)
- [ ] Code follows coding standards/conventions
- [ ] No console.log / debug code left
- [ ] Error handling implemented properly
- [ ] Input validation on both client and server side
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] Sensitive data not logged
- [ ] Unit tests written (coverage ≥ 80%)
- [ ] All unit tests passing
- [ ] No TypeScript `any` types without justification
- [ ] API responses follow standard format
- [ ] Proper HTTP status codes used
- [ ] CORS configured correctly
- [ ] Environment variables used for secrets

### 2.2. Code Review Checklist
- [ ] Business logic correct theo requirements
- [ ] Error handling covers all scenarios
- [ ] Security considerations addressed
- [ ] Performance implications reviewed
- [ ] Database queries optimized (no N+1)
- [ ] API backward compatibility maintained
- [ ] Proper logging added for debugging
- [ ] No hardcoded values (use constants/config)
- [ ] Dependency updates checked for vulnerabilities

---

## 3. Functional Testing Checklist

### 3.1. Module: Authentication
- [ ] Đăng ký với email hợp lệ → thành công
- [ ] Đăng ký với email đã tồn tại → báo lỗi
- [ ] Đăng ký với phone đã tồn tại → báo lỗi
- [ ] Password validation (min 8, upper, number, special)
- [ ] OTP gửi thành công (email + SMS)
- [ ] OTP hết hạn sau 5 phút
- [ ] Đăng nhập thành công với email/phone
- [ ] Đăng nhập sai password → counter tăng
- [ ] Lock account sau 5 lần sai (30 phút)
- [ ] Social login (Google) → tạo/link account
- [ ] Social login (Facebook) → tạo/link account
- [ ] Forgot password flow hoạt động
- [ ] Logout → clear session/tokens
- [ ] Token refresh hoạt động
- [ ] Session timeout đúng config

### 3.2. Module: Product Catalog
- [ ] Hiển thị tất cả 7 categories
- [ ] Filter by category hoạt động
- [ ] Filter by insurer hoạt động
- [ ] Filter by price range hoạt động
- [ ] Sort by price (asc/desc)
- [ ] Sort by rating
- [ ] Sort by popularity
- [ ] Search by keyword
- [ ] Product detail page hiển thị đủ thông tin
- [ ] So sánh sản phẩm (2-4 products)
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Pagination hoạt động
- [ ] Empty state khi không có kết quả

### 3.3. Module: Quote Engine
- [ ] Quote xe máy - tính giá chính xác
- [ ] Quote sức khỏe - tính giá theo tuổi, giới tính, BMI
- [ ] Quote nhân thọ - tính phí theo thời hạn, sum assured
- [ ] Quote du lịch - tính theo destination, duration
- [ ] Multi-insurer quotes hiển thị parallel
- [ ] Real-time price update khi thay đổi options
- [ ] Save quote hoạt động (logged in user)
- [ ] Share quote (link generation)
- [ ] Quote expiry (30 ngày)
- [ ] Rate limiting (50 quotes/day)
- [ ] Fallback khi insurer API timeout
- [ ] Validation tất cả input fields
- [ ] Error messages rõ ràng khi ineligible

### 3.4. Module: Purchase Flow
- [ ] Simple flow (xe máy) < 5 phút
- [ ] Complex flow (sức khỏe) hoạt động đúng steps
- [ ] eKYC upload CCCD thành công
- [ ] OCR extract thông tin chính xác
- [ ] Auto-fill form từ OCR data
- [ ] Underwriting auto-approve hoạt động
- [ ] Underwriting refer → notification
- [ ] Underwriting decline → suggest alternatives
- [ ] Terms & Conditions checkbox required
- [ ] E-signature (OTP) hoạt động
- [ ] Payment redirect đến gateway
- [ ] Payment success → policy issuance
- [ ] Payment fail → retry option
- [ ] Policy PDF generated correctly
- [ ] Confirmation email sent
- [ ] Confirmation SMS sent
- [ ] Policy visible in dashboard

### 3.5. Module: Claims
- [ ] Submit claim form hiển thị theo product type
- [ ] Required documents checklist hiển thị
- [ ] File upload (JPG, PNG, PDF) hoạt động
- [ ] File size validation (max 10MB each, 50MB total)
- [ ] Claim status tracking hoạt động
- [ ] Timeline view correct
- [ ] Notification khi status change
- [ ] Admin có thể assign handler
- [ ] Admin có thể approve/reject
- [ ] Partial approval hoạt động
- [ ] Settlement payment processing
- [ ] Customer rating/feedback sau settlement
- [ ] Appeal process hoạt động

### 3.6. Module: Payment
- [ ] Momo payment hoạt động
- [ ] ZaloPay payment hoạt động
- [ ] VNPay (ATM) hoạt động
- [ ] Visa/Mastercard hoạt động
- [ ] Chuyển khoản (Virtual Account) hoạt động
- [ ] Recurring payment setup
- [ ] Auto-debit charge đúng schedule
- [ ] Payment reminder trước 7 ngày
- [ ] Retry logic (Day 0, 3, 7) hoạt động
- [ ] Grace period 30 ngày
- [ ] Refund processing hoạt động
- [ ] Payment history hiển thị đúng
- [ ] Receipt/Invoice downloadable

### 3.7. Module: Admin Panel
- [ ] Dashboard KPIs hiển thị correct
- [ ] Product CRUD hoạt động
- [ ] Customer search & management
- [ ] Policy management (view, endorse, cancel)
- [ ] Claims queue management
- [ ] Partner management
- [ ] Reports generation
- [ ] User role management
- [ ] Permission-based access control
- [ ] Audit log recording

### 3.8. Module: Notifications
- [ ] Email templates render correctly
- [ ] SMS delivered successfully
- [ ] In-app notifications hiển thị
- [ ] Notification preferences respected
- [ ] Unsubscribe hoạt động
- [ ] Trigger events fire correctly (registration, purchase, claim update)
- [ ] No duplicate notifications

### 3.9. Module: Customer Dashboard
- [ ] Overview hiển thị đúng data
- [ ] My Policies list & detail
- [ ] My Claims list & detail
- [ ] Payment history
- [ ] Profile update hoạt động
- [ ] Beneficiary management
- [ ] Document download
- [ ] Renewal from dashboard

---

## 4. Non-Functional Testing Checklist

### 4.1. Performance
- [ ] Page load (LCP) < 2.5s trên 4G
- [ ] API response (simple) < 200ms (P95)
- [ ] API response (complex) < 500ms (P95)
- [ ] Quote generation < 3s
- [ ] 5,000 concurrent users → stable
- [ ] 10,000 concurrent users → acceptable degradation
- [ ] No memory leaks (4h soak test)
- [ ] Database queries < 50ms
- [ ] File upload 10MB < 5s
- [ ] PDF generation < 3s

### 4.2. Security
- [ ] HTTPS enforced (no HTTP)
- [ ] TLS 1.3 configured
- [ ] Security headers present (CSP, HSTS, X-Frame-Options)
- [ ] SQL injection tested (all inputs)
- [ ] XSS tested (all inputs/outputs)
- [ ] CSRF protection implemented
- [ ] Authentication bypass testing
- [ ] Authorization bypass testing (IDOR)
- [ ] Rate limiting enforced
- [ ] Sensitive data encrypted at rest
- [ ] PII not in logs
- [ ] File upload validation (type, size, content)
- [ ] Password not exposed in API responses
- [ ] Session management secure
- [ ] CORS properly configured
- [ ] Dependency vulnerabilities scanned (0 critical)
- [ ] Secrets not in code/config files

### 4.3. Usability
- [ ] Consistent navigation across pages
- [ ] Clear error messages (non-technical)
- [ ] Form validation real-time (inline)
- [ ] Loading states present
- [ ] Empty states present
- [ ] Confirmation dialogs for destructive actions
- [ ] Breadcrumb navigation
- [ ] Back button behavior correct
- [ ] Keyboard navigation works
- [ ] Tab order logical

### 4.4. Accessibility (WCAG 2.1 AA)
- [ ] Alt text cho tất cả images
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] Screen reader compatible (ARIA labels)
- [ ] Keyboard-only navigation possible
- [ ] Form labels associated correctly
- [ ] Error messages accessible
- [ ] Skip navigation link present
- [ ] No auto-playing media
- [ ] Text resizable to 200% without loss

### 4.5. Compatibility
- [ ] Chrome (latest 2) - Desktop ✓
- [ ] Chrome (latest 2) - Mobile ✓
- [ ] Safari (latest 2) - Desktop ✓
- [ ] Safari (latest 2) - iOS ✓
- [ ] Firefox (latest 2) - Desktop ✓
- [ ] Edge (latest 2) - Desktop ✓
- [ ] Mobile viewport (320px) - no horizontal scroll
- [ ] Tablet viewport (768px) - layout correct
- [ ] Desktop viewport (1024px+) - full layout
- [ ] RTL support not needed (Vietnamese LTR only)

### 4.6. Localization
- [ ] Vietnamese (vi-VN) - primary language correct
- [ ] English (en-US) - secondary language correct
- [ ] Number format: 1.000.000 VND
- [ ] Date format: DD/MM/YYYY
- [ ] Currency display: VND with proper formatting
- [ ] No untranslated strings
- [ ] Vietnamese diacritics display correctly
- [ ] Long text doesn't break layout

---

## 5. Deployment Checklist

### 5.1. Pre-Deployment
- [ ] All test cases passed (≥ 95% pass rate)
- [ ] All Critical/High bugs fixed and verified
- [ ] Performance tests passed
- [ ] Security scan passed (0 critical/high)
- [ ] UAT sign-off received
- [ ] Database migration tested
- [ ] Rollback plan documented and tested
- [ ] Feature flags configured (if applicable)
- [ ] Monitoring & alerts configured
- [ ] Changelog updated
- [ ] Release notes prepared

### 5.2. During Deployment
- [ ] Deployment follows documented procedure
- [ ] Zero-downtime deployment verified
- [ ] Health check endpoints responding
- [ ] Database migration successful
- [ ] Cache cleared/warmed up
- [ ] CDN cache invalidated
- [ ] SSL certificate valid

### 5.3. Post-Deployment
- [ ] Smoke tests passed on production
- [ ] Core user journeys verified manually
- [ ] Error rates normal (no spike)
- [ ] Response times normal
- [ ] Monitoring dashboards checked
- [ ] No critical alerts triggered
- [ ] Third-party integrations working (Payment, eKYC)
- [ ] Email/SMS sending correctly
- [ ] Logs flowing correctly
- [ ] Backup running as scheduled

---

## 6. Release Sign-Off Checklist

### 6.1. Quality Gates

| Gate | Criteria | Status |
|------|----------|--------|
| Unit Test Coverage | ≥ 80% | ☐ Pass / ☐ Fail |
| Integration Test Pass Rate | 100% | ☐ Pass / ☐ Fail |
| E2E Test Pass Rate | ≥ 98% | ☐ Pass / ☐ Fail |
| Critical Bugs | 0 open | ☐ Pass / ☐ Fail |
| High Bugs | 0 open | ☐ Pass / ☐ Fail |
| Performance P95 | Within targets | ☐ Pass / ☐ Fail |
| Security Scan | 0 critical/high | ☐ Pass / ☐ Fail |
| UAT Approval | Signed off | ☐ Pass / ☐ Fail |
| Accessibility | WCAG 2.1 AA | ☐ Pass / ☐ Fail |
| Compatibility | All P0 browsers | ☐ Pass / ☐ Fail |

### 6.2. Sign-Off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QA Lead | | ☐ Go / ☐ No-Go | |
| Tech Lead | | ☐ Go / ☐ No-Go | |
| Product Owner | | ☐ Go / ☐ No-Go | |
| Project Manager | | ☐ Go / ☐ No-Go | |

---

## 7. Sprint QA Checklist (Per Sprint)

### Trong Sprint
- [ ] Tham gia sprint planning → hiểu scope
- [ ] Review user stories → update test cases
- [ ] Test ready stories ngay khi dev hoàn thành
- [ ] Report bugs ngay khi phát hiện
- [ ] Verify bug fixes
- [ ] Update automation scripts
- [ ] Regression test các areas affected

### Cuối Sprint
- [ ] All stories tested
- [ ] Regression suite passed
- [ ] Bug metrics reported
- [ ] Test report submitted
- [ ] Lessons learned documented
- [ ] Test cases updated cho sprint tiếp theo
