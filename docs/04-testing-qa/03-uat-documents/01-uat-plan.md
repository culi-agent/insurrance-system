# UAT Plan - Kế Hoạch Kiểm Thử Chấp Nhận Người Dùng

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Lead / Product Owner |
| Trạng thái | Draft |

---

## 1. Mục đích

User Acceptance Testing (UAT) nhằm xác nhận rằng hệ thống Insurance System Platform đáp ứng đúng yêu cầu nghiệp vụ, phù hợp với nhu cầu người dùng cuối trước khi go-live.

### 1.1. Mục tiêu UAT
- Xác nhận tất cả business requirements được implement đúng
- Verify user journeys hoạt động mượt mà từ góc nhìn end-user
- Đảm bảo UX/UI đáp ứng kỳ vọng khách hàng
- Phát hiện gaps giữa requirements và implementation
- Thu thập feedback từ business stakeholders
- Đạt sign-off cho go-live

### 1.2. Phạm vi UAT

**Trong phạm vi:**
- Customer-facing flows (browse, quote, purchase, claims, dashboard)
- Admin operations (product management, claims processing, reports)
- Payment processing (all methods)
- Notification delivery
- Policy lifecycle management

**Ngoài phạm vi:**
- Performance/Load testing (covered by QA team)
- Security testing (covered by Security team)
- Infrastructure testing
- Third-party internal systems

---

## 2. UAT Team & Responsibilities

### 2.1. UAT Participants

| Role | Name | Responsibility | Availability |
|------|------|---------------|--------------|
| UAT Lead | Product Owner | Plan, coordinate, sign-off | Full-time during UAT |
| Business Analyst | BA Team | Write UAT scenarios, verify business rules | Full-time |
| Business SME | Insurance Operations | Domain expertise, claims validation | Part-time |
| End User Rep (Persona 1) | Young Professional | Test customer journey, mobile experience | Scheduled sessions |
| End User Rep (Persona 2) | Young Mother | Test complex products, family plans | Scheduled sessions |
| End User Rep (Persona 3) | SME Owner | Test business insurance, bulk features | Scheduled sessions |
| Operations Team | Ops Manager | Test admin panel, claims workflows | Part-time |
| Finance Team | Finance Lead | Test payment, reconciliation, reports | Part-time |
| QA Support | QA Engineer | Environment support, bug triage | On-call |

### 2.2. RACI Matrix

| Activity | UAT Lead | BA | SME | Users | QA |
|----------|----------|-----|-----|-------|-----|
| UAT Planning | A/R | C | C | I | C |
| Scenario Writing | A | R | C | I | C |
| Environment Setup | I | I | I | I | R |
| Test Execution | A | R | R | R | S |
| Bug Reporting | I | R | R | R | S |
| Bug Triage | R | C | C | I | C |
| Sign-off Decision | R/A | C | C | C | I |

*R=Responsible, A=Accountable, C=Consulted, I=Informed, S=Support*

---

## 3. UAT Environment

### 3.1. Environment Details

| Component | Configuration |
|-----------|--------------|
| URL | https://uat.insurance-system.com |
| Environment | Staging (production-equivalent) |
| Data | Sanitized production-like data |
| Payment | Sandbox mode (test transactions) |
| eKYC | Sandbox mode (test OCR) |
| Email | Real delivery (to UAT participants only) |
| SMS | Test mode (logged, not sent to real numbers) |

### 3.2. Test Accounts

| Account | Role | Email | Password | Purpose |
|---------|------|-------|----------|---------|
| UAT Customer 1 | Customer | uat.customer1@test.com | Uat@12345 | New customer flows |
| UAT Customer 2 | Customer | uat.customer2@test.com | Uat@12345 | Existing customer (3 policies) |
| UAT Customer 3 | Customer | uat.customer3@test.com | Uat@12345 | Customer with pending claim |
| UAT Admin | Super Admin | uat.admin@test.com | Uat@12345 | Full admin operations |
| UAT Claims Handler | Claims Handler | uat.claims@test.com | Uat@12345 | Claims processing |
| UAT Partner | Insurer Partner | uat.partner@test.com | Uat@12345 | Partner portal |

### 3.3. Test Data Available

| Data Type | Quantity | Details |
|-----------|----------|---------|
| Products | 20+ | All categories, multiple insurers |
| Active Policies | 10 | Various types, stages |
| Pending Claims | 5 | Different statuses |
| Payment Methods | All | Sandbox credentials |
| Sample Documents | Library | CCCD, invoices, reports |

---

## 4. UAT Schedule

### 4.1. Timeline (MVP - v0.1)

| Phase | Duration | Dates | Activities |
|-------|----------|-------|-----------|
| Preparation | 3 days | Day 1-3 | Environment setup, data prep, training |
| Cycle 1 | 5 days | Day 4-8 | Execute all UAT scenarios |
| Bug Fix | 3 days | Day 9-11 | Dev fix UAT issues |
| Cycle 2 | 3 days | Day 12-14 | Re-test fixed issues + regression |
| Sign-off | 1 day | Day 15 | Review results, decision |
| **Total** | **15 days** | | |

### 4.2. Daily Schedule

| Time | Activity |
|------|----------|
| 09:00 - 09:30 | Daily standup (status, blockers) |
| 09:30 - 12:00 | Test execution |
| 12:00 - 13:00 | Lunch break |
| 13:00 - 16:30 | Test execution |
| 16:30 - 17:00 | Bug review & reporting |

---

## 5. UAT Scenarios

### 5.1. Customer Journey 1: Mua bảo hiểm xe máy (Simple)

**Persona:** Minh - Young Professional, 28 tuổi

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Truy cập trang chủ | Trang load nhanh, hiển thị categories | ☐ |
| 2 | Click "Bảo hiểm xe máy" | Hiển thị products xe máy | ☐ |
| 3 | Chọn "Bảo hiểm TNDS + Toàn diện" | Product detail hiển thị | ☐ |
| 4 | Click "Nhận báo giá" | Form nhập thông tin xe | ☐ |
| 5 | Điền thông tin xe máy (Honda Wave, 2023, 110cc) | Form validates OK | ☐ |
| 6 | Chọn coverage: Toàn diện | Options hiển thị | ☐ |
| 7 | Click "Xem báo giá" | Hiển thị quotes từ nhiều công ty | ☐ |
| 8 | So sánh giá, chọn gói phù hợp | Comparison clear, chọn được | ☐ |
| 9 | Click "Mua ngay" | Login prompt (nếu chưa login) | ☐ |
| 10 | Đăng nhập/Đăng ký | Thành công | ☐ |
| 11 | Điền thông tin cá nhân | Form pre-fill (nếu có) | ☐ |
| 12 | Upload CCCD | OCR extract thông tin | ☐ |
| 13 | Review thông tin | All correct | ☐ |
| 14 | Đồng ý T&C + Thanh toán | Redirect to payment | ☐ |
| 15 | Thanh toán Momo | Thành công | ☐ |
| 16 | Nhận xác nhận | Trang "Mua thành công" + email | ☐ |
| 17 | Kiểm tra Dashboard | Policy hiển thị | ☐ |
| 18 | Download PDF hợp đồng | PDF correct | ☐ |

**Total time target:** < 5 phút (từ step 5 đến step 16)

**Notes/Feedback:**
```
_____________________________________________
_____________________________________________
```

---

### 5.2. Customer Journey 2: Mua bảo hiểm sức khỏe (Complex)

**Persona:** Hương - Young Mother, 35 tuổi, mua cho gia đình

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Browse "Bảo hiểm sức khỏe" | Hiển thị options sức khỏe | ☐ |
| 2 | Đọc so sánh các gói | Thông tin rõ ràng, dễ hiểu | ☐ |
| 3 | Click "Nhận báo giá" | Health form step 1 | ☐ |
| 4 | Nhập thông tin cá nhân (35, Nữ) | Accepted | ☐ |
| 5 | Chọn "Family Plan" | Thêm fields cho gia đình | ☐ |
| 6 | Thêm chồng (37, Nam) + con (3, Nữ) | Members added | ☐ |
| 7 | Health Declaration (không bệnh) | Form complete | ☐ |
| 8 | Chọn coverage: 500M, nội + ngoại trú | Options selected | ☐ |
| 9 | Xem báo giá | Quotes cho cả gia đình | ☐ |
| 10 | So sánh providers | Clear comparison | ☐ |
| 11 | Chọn gói + Click "Mua" | Purchase flow starts | ☐ |
| 12 | Điền thông tin chi tiết | Forms for each member | ☐ |
| 13 | Chọn beneficiary | Saved | ☐ |
| 14 | eKYC | Verified | ☐ |
| 15 | Underwriting check | Auto-approved | ☐ |
| 16 | Chọn thanh toán hàng năm | Annual option | ☐ |
| 17 | Thanh toán | Success | ☐ |
| 18 | Nhận policy + welcome email | All received | ☐ |
| 19 | Xem digital insurance card | Card displayed | ☐ |

**Notes/Feedback:**
```
_____________________________________________
_____________________________________________
```

---

### 5.3. Customer Journey 3: Yêu cầu bồi thường

**Persona:** Customer có policy active, vừa ra viện

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Login → Dashboard | Overview hiển thị | ☐ |
| 2 | Click "Yêu cầu bồi thường" | Eligible policies hiển thị | ☐ |
| 3 | Chọn health policy | Claim form phù hợp | ☐ |
| 4 | Chọn type: Nội trú | Form update | ☐ |
| 5 | Nhập tên bệnh viện | Accepted | ☐ |
| 6 | Nhập ngày nhập/xuất viện | Validated (within policy) | ☐ |
| 7 | Nhập chẩn đoán + điều trị | Accepted | ☐ |
| 8 | Nhập chi phí: 15,000,000 VND | Accepted | ☐ |
| 9 | Upload hóa đơn viện phí | Success | ☐ |
| 10 | Upload giấy ra viện | Success | ☐ |
| 11 | Upload đơn thuốc | Success | ☐ |
| 12 | Review all info | All correct | ☐ |
| 13 | Click "Nộp yêu cầu" | Claim submitted | ☐ |
| 14 | Nhận claim number | Displayed + email | ☐ |
| 15 | Xem tracking timeline | Status: Submitted | ☐ |
| 16 | Nhận notification khi update | In-app + email | ☐ |

**Notes/Feedback:**
```
_____________________________________________
_____________________________________________
```

---

### 5.4. Admin Journey: Xử lý Claims

**Persona:** Claims Handler

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Login admin panel | Dashboard hiển thị | ☐ |
| 2 | Navigate to Claims Queue | Pending claims listed | ☐ |
| 3 | Filter by "Documents Review" | Correct results | ☐ |
| 4 | Click claim để review | Full details loaded | ☐ |
| 5 | View customer info | Correct info | ☐ |
| 6 | View policy details | Coverage confirmed | ☐ |
| 7 | View uploaded documents | All docs viewable | ☐ |
| 8 | Check document checklist | All items checkable | ☐ |
| 9 | Calculate settlement | Calculator works | ☐ |
| 10 | Input decision: Approve | Form shown | ☐ |
| 11 | Input amount: 12,000,000 | Accepted | ☐ |
| 12 | Add notes | Saved | ☐ |
| 13 | Confirm approval | Status updates | ☐ |
| 14 | Verify customer notified | Email/SMS sent | ☐ |
| 15 | Verify payment queued | Settlement initiated | ☐ |

**Notes/Feedback:**
```
_____________________________________________
_____________________________________________
```

---

### 5.5. Admin Journey: Quản lý sản phẩm

**Persona:** Admin - Product Manager

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Login → Product Management | Product list | ☐ |
| 2 | Click "Add New Product" | Form hiển thị | ☐ |
| 3 | Fill basic info (name, category, insurer) | Accepted | ☐ |
| 4 | Define benefits | Structured input | ☐ |
| 5 | Define exclusions | List input | ☐ |
| 6 | Set pricing rules | Calculator/rules engine | ☐ |
| 7 | Upload T&C document | File uploaded | ☐ |
| 8 | Set availability (age, region) | Saved | ☐ |
| 9 | Preview product page | Looks correct | ☐ |
| 10 | Save as Draft | Status: Draft | ☐ |
| 11 | Publish | Status: Published | ☐ |
| 12 | Verify on customer-facing | Product visible | ☐ |

**Notes/Feedback:**
```
_____________________________________________
_____________________________________________
```

---

### 5.6. Payment Journey: Multiple Methods

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Purchase → Payment page | All methods shown | ☐ |
| 2 | Test Momo | QR/redirect → success | ☐ |
| 3 | Test ZaloPay | QR/redirect → success | ☐ |
| 4 | Test VNPay (ATM) | Card form → OTP → success | ☐ |
| 5 | Test Visa/Mastercard | Card form → 3DS → success | ☐ |
| 6 | Test Virtual Account | VA number → confirm | ☐ |
| 7 | Verify payment history | All transactions listed | ☐ |
| 8 | Download receipt | PDF correct | ☐ |

---

### 5.7. Policy Lifecycle: Renew & Cancel

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Nhận renewal reminder email | Email received, clear CTA | ☐ |
| 2 | Click link → renewal page | Renewal quote shown | ☐ |
| 3 | Review new terms/price | Clear comparison | ☐ |
| 4 | Click "Gia hạn" | Payment flow | ☐ |
| 5 | Complete payment | Renewed policy issued | ☐ |
| 6 | Verify new policy in dashboard | Correct dates | ☐ |
| 7 | Test cancel policy | Cancellation info shown | ☐ |
| 8 | Verify refund calculation | Amount correct | ☐ |
| 9 | Confirm cancel (OTP) | Policy cancelled | ☐ |
| 10 | Verify refund initiated | Refund in history | ☐ |

---

## 6. UAT Entry & Exit Criteria

### 6.1. Entry Criteria
- [ ] System testing completed (≥ 95% pass rate)
- [ ] All Critical/High bugs from system testing fixed
- [ ] UAT environment deployed and stable
- [ ] Test data prepared and verified
- [ ] UAT participants trained on system
- [ ] UAT scenarios reviewed and approved
- [ ] Access credentials distributed

### 6.2. Exit Criteria (Go-Live)
- [ ] All UAT scenarios executed
- [ ] ≥ 90% scenarios passed
- [ ] No Critical UAT defects open
- [ ] No more than 3 High defects open (with workarounds)
- [ ] All payment methods verified
- [ ] Business sign-off received from all stakeholders
- [ ] User feedback incorporated (critical items)

### 6.3. Exit Criteria (No-Go)
- Any Critical defect unresolved
- Core user journey broken (cannot complete purchase)
- Payment processing unreliable
- Data integrity issues
- > 10% scenarios failed

---

## 7. Defect Management (UAT)

### 7.1. UAT Defect Classification

| Severity | Definition | Example |
|----------|-----------|---------|
| Critical | Cannot proceed, blocks testing | Cannot login, payment crash |
| High | Major flow broken, no workaround | Cannot upload documents, quote incorrect |
| Medium | Flow works but with issues | UI misalignment, slow performance |
| Low | Cosmetic, minor inconvenience | Typo, color mismatch |

### 7.2. UAT Bug Report Template

```
Title: [UAT] Brief description
Scenario: Which UAT scenario
Step: Which step failed
Reporter: Name
Date: DD/MM/YYYY

Description:
- What happened:
- What was expected:
- Impact on business:

Attachments:
- Screenshot/Video
- Browser/Device info

Severity: Critical / High / Medium / Low
```

### 7.3. Defect Resolution SLA (UAT)

| Severity | Fix SLA | Retest |
|----------|---------|--------|
| Critical | Same day | Immediate |
| High | 1 day | Next day |
| Medium | 3 days | Cycle 2 |
| Low | Backlog | Post-launch |

---

## 8. UAT Sign-Off

### 8.1. Sign-Off Form

**Release:** v0.1 (MVP)
**UAT Period:** [Start Date] → [End Date]

| Metric | Result |
|--------|--------|
| Total Scenarios | __ |
| Passed | __ |
| Failed | __ |
| Blocked | __ |
| Pass Rate | __% |
| Critical Bugs (Open) | __ |
| High Bugs (Open) | __ |

### 8.2. Stakeholder Sign-Off

| Stakeholder | Decision | Signature | Date | Comments |
|-------------|----------|-----------|------|----------|
| Product Owner | ☐ Go / ☐ No-Go | | | |
| Business Operations | ☐ Go / ☐ No-Go | | | |
| Finance | ☐ Go / ☐ No-Go | | | |
| Customer Rep | ☐ Go / ☐ No-Go | | | |
| QA Lead | ☐ Go / ☐ No-Go | | | |

### 8.3. Conditions / Known Issues

```
Accepted known issues for go-live:
1. _______________
2. _______________
3. _______________

Post-launch fix plan:
1. _______________
2. _______________
```

---

## 9. UAT Feedback Collection

### 9.1. Feedback Categories

| Category | Questions |
|----------|-----------|
| Usability | Dễ sử dụng không? Có bước nào confusing? |
| Performance | Có cảm giác chậm ở bước nào? |
| Content | Nội dung có rõ ràng? Ngôn ngữ phù hợp? |
| Design | UI có đẹp, professional? Phù hợp brand? |
| Functionality | Có feature nào thiếu? Logic đúng chưa? |
| Trust | Có cảm thấy an tâm khi giao dịch? |

### 9.2. Post-UAT Survey (End Users)

| # | Question | Scale 1-5 |
|---|----------|-----------|
| 1 | Mức độ dễ sử dụng tổng thể | ☐ |
| 2 | Quy trình mua bảo hiểm dễ hiểu | ☐ |
| 3 | Thông tin sản phẩm rõ ràng | ☐ |
| 4 | Tốc độ hệ thống chấp nhận được | ☐ |
| 5 | Sẵn sàng sử dụng hệ thống này | ☐ |
| 6 | Sẵn sàng giới thiệu cho người khác | ☐ |

**Open feedback:**
```
Điều bạn thích nhất: _____________
Điều cần cải thiện: _____________
Feature bạn muốn có: _____________
```
