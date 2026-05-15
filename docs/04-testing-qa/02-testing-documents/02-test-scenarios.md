# Test Scenarios - Kịch Bản Kiểm Thử

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Team |

---

## 1. Authentication Scenarios

### TS-AUTH-001: User Registration

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Đăng ký với tất cả thông tin hợp lệ | Tạo account thành công |
| 2 | Đăng ký với email đã tồn tại | Error message, không tạo duplicate |
| 3 | Đăng ký với phone đã tồn tại | Error message |
| 4 | Đăng ký với email invalid format | Inline validation error |
| 5 | Đăng ký với phone invalid (không phải VN) | Inline validation error |
| 6 | Đăng ký với password không đạt complexity | Error + hint |
| 7 | Đăng ký với confirm password không match | Error highlight |
| 8 | Đăng ký không check đồng ý điều khoản | Button disabled |
| 9 | Đăng ký → OTP đúng trong 5 phút | Verify thành công |
| 10 | Đăng ký → OTP sai | Error, counter tăng |
| 11 | Đăng ký → OTP hết hạn (>5 phút) | Error, option resend |
| 12 | Đăng ký → Resend OTP 3 lần | Cho phép, lần 4 blocked |
| 13 | Đăng ký → close tab → quay lại | Session preserved (within 30 min) |

### TS-AUTH-002: User Login

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Login với email + password đúng | Redirect to dashboard |
| 2 | Login với phone + password đúng | Redirect to dashboard |
| 3 | Login với email đúng, password sai | Error message generic |
| 4 | Login với email không tồn tại | Error message generic (same as #3) |
| 5 | Login 5 lần sai liên tiếp | Account locked 30 phút |
| 6 | Login khi account locked | Error: account locked |
| 7 | Login với "Remember me" checked | Token valid 7 ngày |
| 8 | Login không "Remember me" | Token valid 15 phút |
| 9 | Login từ device mới | Notification gửi cho user |
| 10 | Login sau khi account unverified | Error: cần verify |
| 11 | Concurrent login từ 2 devices | Cả 2 sessions active |
| 12 | Login → token expired → auto refresh | Seamless, no re-login |

### TS-AUTH-003: Social Login

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Google login - email mới | Tạo account + skip email verify |
| 2 | Google login - email đã tồn tại | Yêu cầu verify password → link |
| 3 | Facebook login - email mới | Tạo account |
| 4 | Social login → cancel OAuth | Quay lại login page |
| 5 | Social login → revoke permission | Login fail, clear message |

### TS-AUTH-004: Password Management

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Forgot password → email hợp lệ | Reset link sent |
| 2 | Forgot password → email không tồn tại | Same message (security) |
| 3 | Reset password link → valid | Form hiển thị |
| 4 | Reset password link → expired (>1h) | Error: link expired |
| 5 | Change password (from profile) | OTP verify → change success |
| 6 | Change password → new = old | Error: phải khác password cũ |

---

## 2. Product Catalog Scenarios

### TS-PROD-001: Product Browsing

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Truy cập catalog page | 7 categories hiển thị |
| 2 | Click category → sub-categories | Sub-categories + products |
| 3 | Filter by 1 insurer | Chỉ products của insurer đó |
| 4 | Filter by multiple insurers | Products của các insurers |
| 5 | Filter by price range | Products trong range |
| 6 | Filter by rating ≥ 4 stars | Products rating 4+ |
| 7 | Combine multiple filters | Intersection results |
| 8 | Filter → 0 results | Empty state + suggestions |
| 9 | Sort by price low→high | Correct order |
| 10 | Sort by price high→low | Correct order |
| 11 | Sort by popularity | Most purchased first |
| 12 | Search "bảo hiểm xe" | Relevant results |
| 13 | Search với typo "bao hiem" | Fuzzy match results |
| 14 | Search empty string | Show all / error |
| 15 | Pagination - page 1 | First N products |
| 16 | Pagination - last page | Remaining products |

### TS-PROD-002: Product Comparison

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Add 2 products to compare | Comparison tray shows 2 |
| 2 | Add 4 products (max) | All 4 in tray |
| 3 | Add 5th product | Error: max 4 |
| 4 | Remove product from tray | Product removed |
| 5 | Compare products cùng category | Table hiển thị correct |
| 6 | Compare products khác category | Not allowed / warning |
| 7 | Compare → click "Mua" | Redirect to quote/purchase |
| 8 | Close comparison tray | Tray disappears, products remembered |

---

## 3. Quotation Scenarios

### TS-QUOTE-001: Motor Insurance Quote

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Quote xe máy Honda 110cc, cá nhân, 2023 | Quotes từ multiple insurers |
| 2 | Quote xe máy cũ (2005) | Higher premium (depreciation) |
| 3 | Quote xe kinh doanh | 1.3x surcharge applied |
| 4 | Quote xe dung tích lớn (>400cc) | Higher premium |
| 5 | Change coverage type → price updates | Real-time recalculation |
| 6 | Change deductible → price updates | Lower premium with higher deductible |
| 7 | No-claim discount applied | 10-30% reduction shown |
| 8 | Quote → Save (logged in) | Saved to account |
| 9 | Quote → Save (guest) | Prompt login/register |
| 10 | Quote → Share via link | Link generated, accessible |
| 11 | Access saved quote after 30 days | Quote expired message |
| 12 | 51st quote in a day | Rate limit error |

### TS-QUOTE-002: Health Insurance Quote

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Quote 30 tuổi, không bệnh, không hút thuốc | Standard rate |
| 2 | Quote 50 tuổi | Significantly higher premium |
| 3 | Quote với pre-existing conditions | Loading hoặc exclusion |
| 4 | Quote smoker | +30-50% premium |
| 5 | Quote BMI > 30 | Loading applied |
| 6 | Quote occupation class 4 (nguy hiểm) | Higher premium / decline |
| 7 | Family plan (4 members) | Total premium for all |
| 8 | Change sum insured 100M → 1B | Price scales proportionally |
| 9 | Add outpatient rider | Additional premium shown |
| 10 | Add dental rider | Additional premium shown |
| 11 | Higher deductible → lower premium | Discount reflected |
| 12 | Premium network → higher cost | Price difference shown |

### TS-QUOTE-003: Life Insurance Quote

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Quote 30 tuổi, non-smoker, sum 1B | Standard rate |
| 2 | Quote 55 tuổi | Higher premium |
| 3 | Quote current smoker | Significant loading |
| 4 | Quote occupation cao | Loading / decline |
| 5 | Term 10 years vs 30 years | Longer = more total cost |
| 6 | Add CI rider | Additional premium |
| 7 | Add premium waiver | Small additional cost |
| 8 | Age > 60 | Ineligible message |

### TS-QUOTE-004: Travel Insurance Quote

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Domestic trip, 3 ngày | Low premium |
| 2 | International trip, Japan, 7 ngày | Standard premium |
| 3 | International trip, US, 30 ngày | Higher premium |
| 4 | Group travelers (5 people) | Total for all |
| 5 | Adventure sports add-on | Additional premium |
| 6 | Past departure date | Error: invalid dates |
| 7 | Return date before departure | Error: invalid range |

---

## 4. Purchase Flow Scenarios

### TS-PURCH-001: Simple Purchase (Motor)

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Complete purchase flow < 5 min | Policy issued |
| 2 | Purchase với quote expired | Error: quote expired, re-quote |
| 3 | eKYC success | Auto-fill, continue |
| 4 | eKYC fail (blurry image) | Fallback manual input |
| 5 | eKYC - CCCD expired | Error: CCCD hết hạn |
| 6 | Purchaser < 18 tuổi | Error: chưa đủ tuổi |
| 7 | Payment success → policy issued | All notifications sent |
| 8 | Payment timeout (>30 min) | Session expired, restart |
| 9 | Browser back during payment | Warning: don't navigate away |
| 10 | Duplicate purchase same product | Warning: already have active policy |

### TS-PURCH-002: Complex Purchase (Health/Life)

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Underwriting auto-approve | Continue to payment |
| 2 | Underwriting refer | "Đang xét duyệt" + notify later |
| 3 | Underwriting decline | Reason + alternatives |
| 4 | Buy for family member | Add member info |
| 5 | Beneficiary setup | Beneficiary saved |
| 6 | E-signature (OTP) success | Continue |
| 7 | E-signature (OTP) fail 3 times | Locked, retry later |
| 8 | Choose annual payment | Single payment, discount |
| 9 | Choose monthly payment | Setup recurring |
| 10 | Medical exam required | Notification + booking info |

---

## 5. Claims Scenarios

### TS-CLAIMS-001: Claim Submission

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Submit health claim (nội trú) đầy đủ | Claim created |
| 2 | Submit health claim (ngoại trú) | Claim created |
| 3 | Submit motor claim (tai nạn) | Claim created |
| 4 | Submit motor claim (trộm cắp) | Claim created + police report required |
| 5 | Claim event trước policy start date | Rejected: outside period |
| 6 | Claim event sau policy end date | Rejected: outside period |
| 7 | Claim amount > sum insured | Warning, allow submit |
| 8 | Upload tất cả required documents | All validated |
| 9 | Upload thiếu required documents | Warning, allow submit (pending) |
| 10 | Upload file invalid format (exe, zip) | Error: format not accepted |
| 11 | Submit claim on cancelled policy | Error: policy inactive |
| 12 | Submit duplicate claim (same event) | Warning: possible duplicate |
| 13 | Fast-track claim < 5 triệu | Auto-process faster |

### TS-CLAIMS-002: Claim Processing (Admin)

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | View claims queue | All assigned claims visible |
| 2 | Filter by status | Correct filtering |
| 3 | Sort by priority/SLA | Correct ordering |
| 4 | Request additional info | Customer notified |
| 5 | Customer provides additional docs | Status updates |
| 6 | Approve full amount | Payment triggered |
| 7 | Approve partial amount | Customer notified with reason |
| 8 | Reject claim | Customer notified with reason + appeal option |
| 9 | Escalate to insurer | Insurer notified |
| 10 | SLA breach | Alert to team lead |
| 11 | Bulk approve simple claims | Multiple claims processed |

### TS-CLAIMS-003: Claim Tracking

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | View claim timeline | All status changes visible |
| 2 | Status: Submitted | Timeline shows submitted time |
| 3 | Status: Under Review | Progress indicator |
| 4 | Status: Additional Info Required | Action required from customer |
| 5 | Status: Approved | Amount shown |
| 6 | Status: Paid | Payment details shown |
| 7 | Status: Rejected | Reason + appeal button |
| 8 | Notification on each status change | Email + in-app received |

---

## 6. Payment Scenarios

### TS-PAY-001: Payment Methods

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Pay via Momo - success | Transaction complete |
| 2 | Pay via Momo - user cancel | Return to payment selection |
| 3 | Pay via ZaloPay - success | Transaction complete |
| 4 | Pay via VNPay ATM - success | Transaction complete |
| 5 | Pay via Visa/Mastercard - success | Transaction complete |
| 6 | Pay via Visa - 3DS verification | 3DS page → verify → success |
| 7 | Pay via chuyển khoản - VA number | VA displayed, confirm on receipt |
| 8 | Payment gateway timeout | Error + retry option |
| 9 | Payment gateway error 500 | Error + alternative methods |
| 10 | Double payment (network issue) | Idempotency: only 1 charge |
| 11 | Payment amount mismatch | Error: amount changed |

### TS-PAY-002: Refund Scenarios

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Cancel within cooling-off (21 days) | Full refund |
| 2 | Cancel after cooling-off, no claims | Pro-rata minus admin fee |
| 3 | Cancel after cooling-off, has claims | No refund |
| 4 | Refund processing time | 5-7 business days |
| 5 | Refund to original payment method | Same method used |
| 6 | Refund status tracking | Visible in payment history |

---

## 7. Policy Lifecycle Scenarios

### TS-POLICY-001: Policy Management

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | View active policy details | All info correct |
| 2 | Download policy PDF | PDF generated, correct content |
| 3 | Policy renewal reminder (30 days) | Email sent |
| 4 | Policy renewal reminder (7 days) | Email + SMS sent |
| 5 | Auto-renewal success | New policy, notification |
| 6 | Auto-renewal fail → grace period | 30 days grace |
| 7 | Manual renewal | New quote → purchase flow |
| 8 | Policy lapsed (grace expired) | Status: Lapsed |
| 9 | Cancel policy | Confirmation + refund calc |
| 10 | Endorse policy (change coverage) | Updated policy issued |

---

## 8. Notification Scenarios

### TS-NOTIF-001: Notification Delivery

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Registration → email + SMS | Both delivered |
| 2 | Purchase → email + SMS + in-app | All 3 channels |
| 3 | Claim update → email + SMS + in-app | All 3 channels |
| 4 | Payment reminder → email + SMS + in-app | All 3 channels |
| 5 | User opt-out email marketing | No marketing emails |
| 6 | User opt-out SMS | No SMS (except OTP/critical) |
| 7 | Invalid email address | Email bounced, logged |
| 8 | Invalid phone number | SMS failed, logged |
| 9 | Duplicate notifications | Prevented (idempotency) |
| 10 | Notification preferences changed | Immediate effect |

---

## 9. Performance Scenarios

### TS-PERF-001: Load Scenarios

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | 5,000 concurrent users browsing | Page load < 3s |
| 2 | 10,000 concurrent users | Acceptable degradation, no errors |
| 3 | 1,000 simultaneous quotes | All return < 10s |
| 4 | 500 concurrent purchases | All complete, no timeout |
| 5 | Spike: 0 → 15,000 users in 1 min | Auto-scale, recovery < 30s |
| 6 | 4-hour sustained load (5,000 users) | No memory leak, stable |
| 7 | Database with 10M records | Query time < 200ms |
| 8 | File upload 50 concurrent | All succeed < 10s |

---

## 10. Security Scenarios

### TS-SEC-001: Security Testing

| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | SQL injection in search field | Blocked, no data exposed |
| 2 | XSS in form inputs | Sanitized, no script execution |
| 3 | Access other user's policy (IDOR) | 403 Forbidden |
| 4 | Access admin panel as customer | 403 Forbidden |
| 5 | Expired JWT token | 401, redirect to login |
| 6 | Tampered JWT token | 401, reject |
| 7 | Brute force login | Account locked after 5 attempts |
| 8 | Rate limit API (>50 req/min) | 429 Too Many Requests |
| 9 | Upload malicious file (webshell) | Rejected |
| 10 | CORS from unauthorized origin | Blocked |
| 11 | Missing security headers | All required headers present |
| 12 | PII in server logs | No PII logged |
| 13 | Access API without auth | 401 Unauthorized |
| 14 | Payment amount manipulation | Server-side validation, rejected |
