# Sprint Planning - Insurance System Platform

## Tổng Quan

| Thông tin | Chi tiết |
|-----------|----------|
| Tổng số Sprint | 24 sprints (Year 1) |
| Sprint Duration | 2 tuần |
| Velocity mục tiêu | 30-40 story points/sprint |
| Team size (MVP) | 8 developers |
| Team size (V1.0) | 10 developers |
| Team size (V1.5) | 12 developers |
| Team size (V2.0) | 15 developers |
| Methodology | Scrum + Kanban hybrid |

## Release Timeline

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         RELEASE TIMELINE - YEAR 1                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Q1/2026 (Jan-Mar)         Q2/2026 (Apr-Jun)                                ║
║  ┌─────────────────────┐   ┌─────────────────────┐                          ║
║  │ Sprint 1-6           │   │ Sprint 7-12          │                         ║
║  │ MVP Release          │   │ V1.0 Release         │                         ║
║  │ Motor + Travel +     │   │ Health + Claims +    │                         ║
║  │ Payment + Auth       │   │ Comparison + Admin   │                         ║
║  └─────────────────────┘   └─────────────────────┘                          ║
║                                                                              ║
║  Q3/2026 (Jul-Sep)         Q4/2026 (Oct-Dec)                                ║
║  ┌─────────────────────┐   ┌─────────────────────┐                          ║
║  │ Sprint 13-18         │   │ Sprint 19-24         │                         ║
║  │ V1.5 Release         │   │ V2.0 Release         │                         ║
║  │ Life + AI + Mobile   │   │ B2B + Enterprise +   │                         ║
║  │ App + Analytics      │   │ Scale + Security     │                         ║
║  └─────────────────────┘   └─────────────────────┘                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PHASE 1: MVP (Sprint 1-6) — Q1/2026

### Sprint 1 (Week 1-2): Foundation & Core Infrastructure

**Sprint Goal:** Thiết lập nền tảng hạ tầng, database schema, và hệ thống authentication cơ bản.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S1-01 | Setup project structure (monorepo, linting, formatting) | Infra | P0 | 2 | DevOps |
| S1-02 | Setup CI/CD pipeline (GitHub Actions) | Infra | P0 | 3 | DevOps |
| S1-03 | Provisioning cloud infrastructure (AWS/GCP) | Infra | P0 | 3 | DevOps |
| S1-04 | Setup database (PostgreSQL + Redis) | Infra | P0 | 2 | BE |
| S1-05 | Design & implement core database schema | Infra | P0 | 5 | BE |
| S1-06 | API Gateway setup (rate limiting, CORS, logging) | Infra | P0 | 3 | BE |
| S1-07 | User Registration (email + phone + password) | E1 | P0 | 5 | BE + FE |
| S1-08 | OTP Verification (email + SMS) | E1 | P0 | 3 | BE |
| S1-09 | Login (email/phone + password + JWT) | E1 | P0 | 3 | BE + FE |
| S1-10 | Setup frontend project (Next.js + TailwindCSS) | Infra | P0 | 3 | FE |
| S1-11 | Design system & UI component library setup | Infra | P1 | 2 | FE |

**Total Points:** 34  
**Sprint Risks:**
- Cloud account approval delays
- Database schema changes later may require migrations

**Definition of Done:**
- [ ] Hệ thống CI/CD chạy green
- [ ] Database schema deployed to dev environment
- [ ] User có thể register + verify + login
- [ ] API Gateway hoạt động với rate limiting
- [ ] Frontend project structure sẵn sàng

---

### Sprint 2 (Week 3-4): Auth Complete & Product Catalog

**Sprint Goal:** Hoàn thiện hệ thống auth, bắt đầu product catalog và insurer integration framework.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S2-01 | Social Login (Google OAuth) | E1 | P1 | 3 | BE + FE |
| S2-02 | Social Login (Facebook OAuth) | E1 | P1 | 2 | BE + FE |
| S2-03 | Password Reset (email/SMS OTP) | E1 | P0 | 3 | BE + FE |
| S2-04 | Profile Management (CRUD) | E1 | P0 | 3 | BE + FE |
| S2-05 | Role-Based Access Control (RBAC) | E1 | P0 | 5 | BE |
| S2-06 | Session Management & Token Refresh | E1 | P0 | 2 | BE |
| S2-07 | Product Category Pages (7 categories) | E2 | P0 | 5 | FE |
| S2-08 | Product Listing with Cards | E2 | P0 | 5 | FE + BE |
| S2-09 | Product Detail Page | E2 | P0 | 5 | FE |
| S2-10 | Insurer API Integration Framework (adapter pattern) | E10 | P0 | 5 | BE |

**Total Points:** 38  
**Sprint Risks:**
- OAuth provider approval process
- Insurer API documentation availability

**Definition of Done:**
- [ ] Full authentication flow hoạt động (register, login, social, reset, profile)
- [ ] RBAC setup cho Admin/Customer/Partner roles
- [ ] Product catalog hiển thị 7 categories
- [ ] Product detail page responsive
- [ ] Integration framework ready cho insurer APIs

---

### Sprint 3 (Week 5-6): Motor Insurance Quote Engine

**Sprint Goal:** Xây dựng quote engine cho bảo hiểm xe, tích hợp 2 insurer partners đầu tiên.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S3-01 | Motor Insurance Quote Form (vehicle info) | E3 | P0 | 5 | FE |
| S3-02 | Motor Quote Pricing Engine (calculation logic) | E3 | P0 | 8 | BE |
| S3-03 | Coverage Customization (real-time price update) | E3 | P0 | 3 | FE + BE |
| S3-04 | Insurer #1 API Integration (full) | E10 | P0 | 8 | BE |
| S3-05 | Insurer #2 API Integration | E10 | P0 | 5 | BE |
| S3-06 | Multi-insurer Quote Aggregation | E3 | P0 | 5 | BE |
| S3-07 | Quote Comparison View (side-by-side) | E3 | P0 | 3 | FE |
| S3-08 | Product Search (full-text) | E2 | P1 | 3 | BE + FE |

**Total Points:** 40  
**Sprint Risks:**
- Insurer API response time/reliability
- Complex pricing logic accuracy

**Definition of Done:**
- [ ] User có thể nhập thông tin xe → nhận báo giá từ 2+ insurers
- [ ] Comparison view hiển thị side-by-side
- [ ] Coverage customization thay đổi giá real-time
- [ ] Quote response time < 5 giây
- [ ] Search hoạt động cho product catalog

---

### Sprint 4 (Week 7-8): Purchase Flow & Payment

**Sprint Goal:** Xây dựng flow mua bảo hiểm xe hoàn chỉnh với eKYC và payment integration.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S4-01 | Purchase Wizard UI (multi-step form) | E4 | P0 | 5 | FE |
| S4-02 | Application Form (personal info, beneficiary) | E4 | P0 | 5 | FE + BE |
| S4-03 | eKYC Integration (CCCD OCR) | E4 | P0 | 8 | BE |
| S4-04 | Auto-Underwriting Engine (rule-based) | E4 | P0 | 8 | BE |
| S4-05 | VNPay Payment Integration | E4 | P0 | 5 | BE |
| S4-06 | Momo Payment Integration | E4 | P0 | 3 | BE |
| S4-07 | Payment Confirmation & Receipt | E4 | P0 | 2 | BE + FE |
| S4-08 | Policy Document Generation (PDF) | E4 | P0 | 5 | BE |

**Total Points:** 41  
**Sprint Risks:**
- eKYC provider integration complexity
- Payment gateway approval process
- PDF generation performance

**Definition of Done:**
- [ ] User hoàn tất mua BH xe máy end-to-end (form → eKYC → payment → policy)
- [ ] VNPay + Momo hoạt động
- [ ] PDF policy document tự động generate
- [ ] Underwriting rules auto-approve simple cases
- [ ] eKYC OCR accuracy > 90%

---

### Sprint 5 (Week 9-10): Travel Insurance & Customer Dashboard

**Sprint Goal:** Launch bảo hiểm du lịch, xây dựng customer dashboard quản lý hợp đồng.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S5-01 | Travel Insurance Quote Form | E3 | P1 | 5 | FE + BE |
| S5-02 | Travel Insurance Pricing Engine | E3 | P1 | 5 | BE |
| S5-03 | Travel Insurer Integration (#3) | E10 | P0 | 5 | BE |
| S5-04 | Customer Dashboard (overview) | E5 | P0 | 5 | FE |
| S5-05 | Policy List & Detail View | E5 | P0 | 5 | FE + BE |
| S5-06 | Policy Document Download | E5 | P0 | 2 | BE |
| S5-07 | Email Notifications (SendGrid) | E8 | P0 | 3 | BE |
| S5-08 | SMS Notifications (OTP + alerts) | E8 | P0 | 3 | BE |
| S5-09 | E-Signature (OTP-based) | E4 | P0 | 3 | BE + FE |

**Total Points:** 36  
**Sprint Risks:**
- Travel insurance product data readiness
- Email deliverability issues

**Definition of Done:**
- [ ] Bảo hiểm du lịch: quote → purchase hoàn chỉnh
- [ ] Dashboard hiển thị policies active/expired
- [ ] Email + SMS notifications gửi đúng events
- [ ] Policy PDF download hoạt động
- [ ] E-signature flow hoàn chỉnh

---

### Sprint 6 (Week 11-12): MVP Polish, QA & Launch

**Sprint Goal:** Hoàn thiện MVP, QA toàn bộ, fix bugs, launch production.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S6-01 | Landing Pages (Homepage, About, Contact) | Marketing | P0 | 5 | FE |
| S6-02 | SEO optimization & meta tags | Marketing | P1 | 2 | FE |
| S6-03 | Product Filters (price, insurer, features) | E2 | P1 | 3 | FE + BE |
| S6-04 | Save Quote / Email Quote | E3 | P1 | 3 | BE + FE |
| S6-05 | Error handling & edge cases fixes | QA | P0 | 5 | All |
| S6-06 | Performance optimization (load time, caching) | QA | P0 | 3 | BE + FE |
| S6-07 | Security audit (OWASP Top 10) | QA | P0 | 5 | Security |
| S6-08 | Integration testing (end-to-end) | QA | P0 | 5 | QA |
| S6-09 | Production deployment & monitoring setup | DevOps | P0 | 3 | DevOps |
| S6-10 | Load testing (1000 concurrent users) | QA | P0 | 3 | QA |

**Total Points:** 37  
**Sprint Risks:**
- Critical bugs discovered late
- Performance issues under load
- Third-party service downtime

**Definition of Done:**
- [ ] All P0 bugs fixed
- [ ] Security audit passed
- [ ] Load test: 1000 concurrent users, response < 3s
- [ ] Production environment stable
- [ ] Monitoring & alerting active
- [ ] 🚀 **MVP LAUNCH**

---

**MVP Release Summary:**
| Metric | Value |
|--------|-------|
| Total Story Points | ~226 |
| Duration | 12 weeks (6 sprints) |
| Products | Motor Insurance + Travel Insurance |
| Key Features | Auth, Product Catalog, Quote, Purchase, Payment, Dashboard |
| Team | 8 developers |

---


## PHASE 2: V1.0 (Sprint 7-12) — Q2/2026

### Sprint 7 (Week 13-14): Health Insurance Quote Engine

**Sprint Goal:** Xây dựng hệ thống báo giá bảo hiểm sức khỏe với health declaration form phức tạp.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S7-01 | Health Insurance Quote Form (multi-step) | E3 | P0 | 8 | FE |
| S7-02 | Health Declaration Form (medical questionnaire) | E3 | P0 | 5 | FE + BE |
| S7-03 | Health Quote Pricing Engine (multi-plan) | E3 | P0 | 8 | BE |
| S7-04 | Health-specific Underwriting Rules | E4 | P0 | 5 | BE |
| S7-05 | Waiting Period Logic (business rules) | E5 | P0 | 3 | BE |
| S7-06 | Health Insurer #1 Integration | E10 | P0 | 5 | BE |
| S7-07 | Coverage Customization (inpatient/outpatient/dental) | E3 | P0 | 3 | FE + BE |
| S7-08 | Family Plan Support (add members) | E3 | P0 | 5 | FE + BE |

**Total Points:** 42  
**Sprint Risks:**
- Complex health underwriting rules
- Medical questionnaire form complexity
- Insurer-specific product differences

**Definition of Done:**
- [ ] Health quote form (individual + family) hoạt động
- [ ] Health declaration validations chính xác
- [ ] Pricing engine tính đúng theo age, BMI, smoking, conditions
- [ ] Waiting period logic áp dụng đúng
- [ ] Ít nhất 1 health insurer integrated

---

### Sprint 8 (Week 15-16): Health Insurance Purchase & More Insurers

**Sprint Goal:** Hoàn thiện flow mua BH sức khỏe, tích hợp thêm insurers, bắt đầu admin panel.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S8-01 | Health Insurance Purchase Flow (complex) | E4 | P0 | 8 | FE + BE |
| S8-02 | Health Insurer #2 Integration | E10 | P0 | 5 | BE |
| S8-03 | Health Insurer #3 Integration | E10 | P0 | 5 | BE |
| S8-04 | Admin Panel - Layout & Dashboard | E7 | P0 | 5 | FE |
| S8-05 | Admin - Product Management (CRUD) | E7 | P0 | 5 | FE + BE |
| S8-06 | Admin - Customer Management | E7 | P0 | 3 | FE + BE |
| S8-07 | Notification Templates Management | E8 | P1 | 3 | BE + FE |
| S8-08 | ZaloPay Payment Integration | E4 | P1 | 3 | BE |

**Total Points:** 37  
**Sprint Risks:**
- Health insurer API differences
- Admin panel scope creep

**Definition of Done:**
- [ ] Health insurance: full purchase flow (declaration → underwriting → payment → policy)
- [ ] 3 health insurers integrated
- [ ] Admin panel: dashboard + product CRUD + customer view
- [ ] ZaloPay payment hoạt động
- [ ] Notification templates configurable

---

### Sprint 9 (Week 17-18): Multi-insurer Comparison & UX

**Sprint Goal:** Xây dựng tính năng so sánh sản phẩm, cải thiện UX, và product recommendation.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S9-01 | Multi-insurer Comparison Page | E2 | P0 | 8 | FE |
| S9-02 | Comparison Engine (normalize data) | E2 | P0 | 5 | BE |
| S9-03 | Product Recommendation (basic algorithm) | E9 | P1 | 5 | BE |
| S9-04 | Personalized Homepage (based on profile) | E9 | P2 | 3 | FE + BE |
| S9-05 | Improved Onboarding Flow (UX optimization) | UX | P1 | 3 | FE |
| S9-06 | Customer Support Chat Integration | Support | P0 | 3 | FE + BE |
| S9-07 | Admin - Policy Management (view, endorse) | E7 | P0 | 5 | FE + BE |
| S9-08 | Admin - User & Role Management | E7 | P0 | 3 | FE + BE |
| S9-09 | Quote Validity Management (30 days expiry) | E3 | P1 | 2 | BE |

**Total Points:** 37  
**Sprint Risks:**
- Data normalization across insurers
- Recommendation algorithm accuracy
- Chat integration third-party dependencies

**Definition of Done:**
- [ ] So sánh 2-4 sản phẩm side-by-side hoạt động
- [ ] Basic recommendation hiển thị trên homepage
- [ ] Live chat hoạt động (Intercom/Tawk.to)
- [ ] Admin: policy management hoàn chỉnh
- [ ] Quotes tự động expire sau 30 ngày

---

### Sprint 10 (Week 19-20): Claims Submission Portal

**Sprint Goal:** Xây dựng hệ thống claims submission cho khách hàng và claims queue cho admin.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S10-01 | Claim Submission Form (by product type) | E6 | P0 | 8 | FE + BE |
| S10-02 | Document Upload System (multi-file, drag-drop) | E6 | P0 | 5 | FE + BE |
| S10-03 | Claim Status Tracking (timeline view) | E6 | P0 | 5 | FE + BE |
| S10-04 | Claims Communication Thread | E6 | P1 | 3 | FE + BE |
| S10-05 | Admin - Claims Queue & Assignment | E7 | P0 | 5 | FE + BE |
| S10-06 | Admin - Claims Assessment & Decision | E7 | P0 | 5 | FE + BE |
| S10-07 | In-App Notification Center | E8 | P1 | 3 | FE + BE |
| S10-08 | Notification Preferences (per user) | E8 | P1 | 2 | FE + BE |

**Total Points:** 36  
**Sprint Risks:**
- File upload size/format handling
- Claims workflow complexity
- Document storage costs

**Definition of Done:**
- [ ] Khách hàng submit claim online (form + documents)
- [ ] Claim status timeline hiển thị realtime
- [ ] Admin xem queue, assign, và process claims
- [ ] Communication thread giữa customer ↔ handler
- [ ] In-app notifications hoạt động

---

### Sprint 11 (Week 21-22): Claims Settlement & Policy Renewal

**Sprint Goal:** Hoàn thiện claims processing (settlement), xây dựng hệ thống renewal.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S11-01 | Claims Settlement (bank transfer integration) | E6 | P0 | 5 | BE |
| S11-02 | Fast-track Claims (auto-approve < 5M VND) | E6 | P2 | 3 | BE |
| S11-03 | Claims Appeal Process | E6 | P2 | 3 | FE + BE |
| S11-04 | Policy Renewal (online) | E5 | P0 | 8 | FE + BE |
| S11-05 | Auto-Renewal (opt-in) | E5 | P1 | 3 | BE |
| S11-06 | Renewal Reminders (email/SMS: 30, 14, 7, 3, 1 days) | E5 | P0 | 3 | BE |
| S11-07 | Policy Cancellation & Refund | E5 | P0 | 5 | FE + BE |
| S11-08 | Referral Program (basic: invite & earn) | E14 | P1 | 5 | FE + BE |

**Total Points:** 35  
**Sprint Risks:**
- Bank transfer settlement delays
- Refund calculation complexity
- Renewal pricing differences from original

**Definition of Done:**
- [ ] Claims settlement: approved claims → bank transfer
- [ ] Fast-track auto-approval cho claims < 5M
- [ ] Renewal flow: 1-click renew + adjust coverage
- [ ] Auto-renewal scheduling hoạt động
- [ ] Cancellation + pro-rata refund calculation
- [ ] Referral system: generate link, track referrals

---

### Sprint 12 (Week 23-24): V1.0 Polish, Analytics & Release

**Sprint Goal:** Hoàn thiện V1.0 với analytics dashboard, performance optimization, và release.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S12-01 | Admin Analytics Dashboard (KPI widgets) | E11 | P1 | 5 | FE + BE |
| S12-02 | Sales Reports (daily/weekly/monthly) | E11 | P0 | 3 | BE |
| S12-03 | Conversion Funnel Analytics | E11 | P1 | 3 | BE |
| S12-04 | Admin - Partner/Insurer Management | E7 | P0 | 3 | FE + BE |
| S12-05 | Admin - Audit Log Viewer | E7 | P1 | 3 | BE + FE |
| S12-06 | Performance Optimization (caching, lazy loading) | QA | P0 | 5 | BE + FE |
| S12-07 | Security hardening & penetration testing | QA | P0 | 5 | Security |
| S12-08 | End-to-end regression testing | QA | P0 | 5 | QA |
| S12-09 | Production deployment V1.0 | DevOps | P0 | 3 | DevOps |
| S12-10 | Documentation update (API docs, user guide) | Docs | P1 | 2 | Tech Writer |

**Total Points:** 37  
**Sprint Risks:**
- Regression bugs from new features
- Performance under increased load
- Security vulnerabilities

**Definition of Done:**
- [ ] Admin analytics dashboard hiển thị KPIs
- [ ] Sales + conversion reports hoạt động
- [ ] Performance: all pages < 3s, APIs < 500ms
- [ ] Security audit passed (no critical/high)
- [ ] All E2E tests green
- [ ] 🚀 **V1.0 RELEASE**

---

**V1.0 Release Summary:**
| Metric | Value |
|--------|-------|
| Total Story Points (Phase 2) | ~224 |
| Duration | 12 weeks (6 sprints) |
| New Products | Health Insurance |
| Key Features | Claims, Comparison, Admin Panel, Renewal, Analytics |
| Team | 10 developers |
| Success Criteria | 5K policies/month |

---


## PHASE 3: V1.5 (Sprint 13-18) — Q3/2026

### Sprint 13 (Week 25-26): Life Insurance Foundation

**Sprint Goal:** Xây dựng nền tảng cho bảo hiểm nhân thọ: quote form, pricing engine, underwriting phức tạp.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S13-01 | Life Insurance Quote Form (multi-step) | E3 | P0 | 8 | FE |
| S13-02 | Life Insurance Pricing Engine | E3 | P0 | 8 | BE |
| S13-03 | Advanced Underwriting Rules (life) | E4 | P0 | 8 | BE |
| S13-04 | Riders Configuration (CI, PA, Waiver) | E3 | P0 | 5 | FE + BE |
| S13-05 | Life Insurer #1 Integration | E10 | P0 | 5 | BE |
| S13-06 | Premium Payment Term Options (5/10/15/20 years) | E4 | P1 | 3 | BE |
| S13-07 | Illustration Generator (benefits projection) | E4 | P1 | 5 | BE |

**Total Points:** 42  
**Sprint Risks:**
- Life insurance actuarial complexity
- Long-term projection accuracy
- Regulatory compliance for life products

**Definition of Done:**
- [ ] Life insurance quote form hoạt động (personal → health → coverage → riders)
- [ ] Pricing engine tính chính xác theo age, gender, smoking, occupation
- [ ] Riders pricing tích hợp
- [ ] Benefit illustration PDF generate được
- [ ] Underwriting rules: auto-accept / refer / decline logic

---

### Sprint 14 (Week 27-28): Life Insurance Purchase & AI Recommendation v1

**Sprint Goal:** Hoàn thiện flow mua BH nhân thọ, bắt đầu AI recommendation engine.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S14-01 | Life Insurance Purchase Flow (complex) | E4 | P0 | 8 | FE + BE |
| S14-02 | Beneficiary Management (multiple beneficiaries) | E4 | P0 | 3 | FE + BE |
| S14-03 | Life Insurer #2 Integration | E10 | P0 | 5 | BE |
| S14-04 | AI Recommendation Engine v1 (rule-based + ML) | E9 | P1 | 8 | BE (ML) |
| S14-05 | Coverage Gap Analysis | E9 | P1 | 5 | BE + FE |
| S14-06 | "Customers also bought" suggestions | E9 | P2 | 3 | BE + FE |
| S14-07 | Personal Accident Insurance (simple product) | E3 | P1 | 3 | BE + FE |
| S14-08 | Installment Payment Option | E4 | P2 | 5 | BE |

**Total Points:** 40  
**Sprint Risks:**
- AI model training data availability
- Beneficiary legal requirements
- Installment payment complexity

**Definition of Done:**
- [ ] Life insurance: full purchase flow hoạt động
- [ ] Multiple beneficiaries (primary + contingent) configurable
- [ ] AI recommendation hiển thị personalized suggestions
- [ ] Coverage gap analysis cho logged-in users
- [ ] Personal accident insurance: quote → purchase
- [ ] Installment payment (monthly/quarterly) hoạt động

---

### Sprint 15 (Week 29-30): Mobile App MVP & Home Insurance

**Sprint Goal:** Bắt đầu mobile app (React Native), launch bảo hiểm nhà.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S15-01 | Mobile App - Project Setup (React Native) | E13 | P0 | 3 | Mobile |
| S15-02 | Mobile App - Auth Screens (login, register) | E13 | P0 | 5 | Mobile |
| S15-03 | Mobile App - Product Browsing | E13 | P0 | 5 | Mobile |
| S15-04 | Mobile App - Quote Flow (motor) | E13 | P0 | 5 | Mobile |
| S15-05 | Home Insurance Quote Form | E3 | P1 | 5 | FE + BE |
| S15-06 | Home Insurance Pricing Engine | E3 | P1 | 5 | BE |
| S15-07 | Home Insurer Integration | E10 | P1 | 5 | BE |
| S15-08 | A/B Testing Framework Setup | Infra | P1 | 3 | BE |

**Total Points:** 36  
**Sprint Risks:**
- Mobile development learning curve
- Cross-platform compatibility issues
- Home insurance product data

**Definition of Done:**
- [ ] Mobile app: auth + browse + motor quote hoạt động trên iOS + Android
- [ ] Home insurance: quote → purchase flow hoàn chỉnh
- [ ] A/B testing framework sẵn sàng sử dụng
- [ ] Mobile app builds successfully cho cả 2 platforms

---

### Sprint 16 (Week 31-32): Mobile App Purchase & Advanced Analytics

**Sprint Goal:** Mobile app purchase flow, reporting system, customer segmentation.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S16-01 | Mobile App - Purchase Flow (payment integration) | E13 | P0 | 8 | Mobile |
| S16-02 | Mobile App - Dashboard (policies, claims) | E13 | P0 | 5 | Mobile |
| S16-03 | Mobile App - Push Notifications | E13 | P0 | 3 | Mobile + BE |
| S16-04 | Customer Segmentation Engine | E11 | P1 | 5 | BE |
| S16-05 | Customer Analytics Reports | E11 | P1 | 3 | BE |
| S16-06 | Product Performance Reports | E11 | P1 | 3 | BE + FE |
| S16-07 | Financial Reports (commission, P&L) | E11 | P0 | 5 | BE |
| S16-08 | Export Reports (CSV, PDF) | E11 | P1 | 2 | BE |
| S16-09 | Smart Form Pre-fill (from history) | E9 | P2 | 3 | FE + BE |

**Total Points:** 37  
**Sprint Risks:**
- Mobile payment SDK integration
- Push notification delivery reliability
- Financial reporting accuracy

**Definition of Done:**
- [ ] Mobile app: full purchase + payment hoạt động
- [ ] Push notifications deliver chính xác
- [ ] Customer segmentation logic hoạt động
- [ ] Financial reports (commission) accurate
- [ ] Report export (CSV/PDF) hoạt động

---

### Sprint 17 (Week 33-34): Mobile App Claims & Advanced Features

**Sprint Goal:** Claims trên mobile, hoàn thiện AI features, bắt đầu partner portal.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S17-01 | Mobile App - Claims Submission (camera capture) | E13 | P0 | 5 | Mobile |
| S17-02 | Mobile App - Claims Tracking | E13 | P0 | 3 | Mobile |
| S17-03 | Mobile App - Profile & Settings | E13 | P0 | 3 | Mobile |
| S17-04 | AI Recommendation Engine v2 (ML-enhanced) | E9 | P1 | 8 | BE (ML) |
| S17-05 | Personalized Email Campaigns | E8 | P1 | 3 | BE |
| S17-06 | Partner Portal - Basic (view products, performance) | E10 | P2 | 5 | FE + BE |
| S17-07 | Scheduled Notifications (renewal reminders automation) | E8 | P0 | 3 | BE |
| S17-08 | Content Management (FAQ, pages) | E7 | P2 | 3 | FE + BE |
| S17-09 | Admin - System Configuration | E7 | P1 | 3 | FE + BE |

**Total Points:** 36  
**Sprint Risks:**
- Camera/file handling on mobile
- ML model performance
- Partner portal scope

**Definition of Done:**
- [ ] Mobile: claims submission with camera + tracking
- [ ] AI v2: improved accuracy, more data sources
- [ ] Partner portal: partners xem performance metrics
- [ ] Scheduled notifications (renewal) automated
- [ ] CMS: admin có thể edit FAQ + pages

---

### Sprint 18 (Week 35-36): V1.5 Integration Testing & Release

**Sprint Goal:** Hoàn thiện V1.5 với mobile app beta, full regression, performance tuning.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S18-01 | Mobile App - Beta Testing (TestFlight/Internal) | E13 | P0 | 3 | Mobile + QA |
| S18-02 | Mobile App - Bug fixes & polish | E13 | P0 | 5 | Mobile |
| S18-03 | Cross-platform Testing (web + mobile) | QA | P0 | 5 | QA |
| S18-04 | API Performance Optimization (< 200ms target) | QA | P0 | 5 | BE |
| S18-05 | Database Query Optimization & Indexing | QA | P0 | 3 | BE |
| S18-06 | Security Audit (mobile + new features) | QA | P0 | 5 | Security |
| S18-07 | Load Testing (5000 concurrent users) | QA | P0 | 3 | QA |
| S18-08 | Documentation (API v1.5, mobile SDK) | Docs | P1 | 2 | Tech Writer |
| S18-09 | V1.5 Production Deployment | DevOps | P0 | 3 | DevOps |
| S18-10 | Monitoring & Alerting Enhancement | DevOps | P1 | 2 | DevOps |

**Total Points:** 36  
**Sprint Risks:**
- Mobile app store review delays
- Performance regression
- Critical bugs in new features

**Definition of Done:**
- [ ] Mobile app beta distributed to testers
- [ ] API response time < 200ms (p95)
- [ ] 5000 concurrent users without degradation
- [ ] Security audit passed
- [ ] All regression tests green
- [ ] 🚀 **V1.5 RELEASE**

---

**V1.5 Release Summary:**
| Metric | Value |
|--------|-------|
| Total Story Points (Phase 3) | ~227 |
| Duration | 12 weeks (6 sprints) |
| New Products | Life Insurance, Personal Accident, Home Insurance |
| Key Features | AI Recommendation, Mobile App (Beta), Analytics, Partner Portal |
| Team | 12 developers |
| Success Criteria | 10K policies/month |

---


## PHASE 4: V2.0 (Sprint 19-24) — Q4/2026

### Sprint 19 (Week 37-38): B2B Foundation & Group Insurance

**Sprint Goal:** Xây dựng nền tảng B2B, bảo hiểm nhóm cho doanh nghiệp, enterprise dashboard.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S19-01 | Enterprise Account Registration & Onboarding | E12 | P0 | 5 | FE + BE |
| S19-02 | Enterprise Dashboard (multi-user, multi-policy) | E12 | P0 | 8 | FE + BE |
| S19-03 | Group Health Insurance Quote (employee list upload) | E12 | P0 | 8 | FE + BE |
| S19-04 | Group Insurance Pricing Engine (volume discounts) | E12 | P0 | 5 | BE |
| S19-05 | Employee Management (add/remove/import CSV) | E12 | P0 | 5 | FE + BE |
| S19-06 | Bulk Policy Issuance | E12 | P0 | 5 | BE |
| S19-07 | Enterprise Billing (invoice, PO support) | E12 | P1 | 3 | BE |

**Total Points:** 39  
**Sprint Risks:**
- B2B requirements from enterprise clients
- Bulk processing performance
- Complex pricing for group plans

**Definition of Done:**
- [ ] Enterprise registration + onboarding flow hoạt động
- [ ] Group health insurance: upload employees → quote → bulk purchase
- [ ] Enterprise dashboard: manage employees, policies, billing
- [ ] Volume discount pricing chính xác
- [ ] CSV import cho employee lists (< 1000 rows)

---

### Sprint 20 (Week 39-40): Business Insurance Products & API v2

**Sprint Goal:** Launch bảo hiểm doanh nghiệp, xây dựng API v2 cho partners.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S20-01 | Business Property Insurance | E12 | P1 | 5 | FE + BE |
| S20-02 | Business Interruption Insurance | E12 | P1 | 5 | BE |
| S20-03 | Liability Insurance Products | E12 | P1 | 5 | FE + BE |
| S20-04 | API v2 - Design & Documentation (OpenAPI) | E10 | P0 | 3 | BE |
| S20-05 | API v2 - Authentication (API keys + OAuth) | E10 | P0 | 5 | BE |
| S20-06 | API v2 - Quote Endpoints (for partners) | E10 | P0 | 5 | BE |
| S20-07 | API v2 - Policy Endpoints | E10 | P0 | 3 | BE |
| S20-08 | API v2 - Webhook Notifications | E10 | P0 | 3 | BE |
| S20-09 | API v2 - Rate Limiting & Usage Tracking | E10 | P1 | 3 | BE |

**Total Points:** 37  
**Sprint Risks:**
- Business insurance complexity
- API backward compatibility
- Partner onboarding timeline

**Definition of Done:**
- [ ] Business property + liability insurance hoạt động
- [ ] API v2 documented (OpenAPI spec)
- [ ] API v2 authentication (keys + OAuth) working
- [ ] Partners có thể get quotes + create policies via API
- [ ] Webhook notifications deliver đúng events

---

### Sprint 21 (Week 41-42): Mobile App v1.0 & White-label

**Sprint Goal:** Launch mobile app chính thức, bắt đầu white-label solution.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S21-01 | Mobile App - Final Polish & Bug Fixes | E13 | P0 | 5 | Mobile |
| S21-02 | Mobile App - App Store Submission (iOS + Android) | E13 | P0 | 3 | Mobile |
| S21-03 | Mobile App - Deep Linking & Universal Links | E13 | P1 | 3 | Mobile |
| S21-04 | Mobile App - Biometric Login (Face ID/Fingerprint) | E13 | P1 | 3 | Mobile |
| S21-05 | White-label Foundation (theming, branding) | E12 | P1 | 8 | FE + BE |
| S21-06 | Bancassurance Integration (bank partner #1) | E12 | P1 | 8 | BE |
| S21-07 | API v2 - Claims Endpoints | E10 | P0 | 3 | BE |
| S21-08 | API v2 - Sandbox Environment (for partners) | E10 | P1 | 3 | BE + DevOps |
| S21-09 | Custom Report Builder (admin) | E11 | P2 | 5 | FE + BE |

**Total Points:** 41  
**Sprint Risks:**
- App store review process (1-2 weeks)
- White-label theming complexity
- Bancassurance partner integration

**Definition of Done:**
- [ ] Mobile app submitted to App Store + Google Play
- [ ] Biometric login hoạt động (Face ID, fingerprint)
- [ ] White-label: custom branding (logo, colors, fonts)
- [ ] Bancassurance: bank partner có thể sell insurance
- [ ] API v2 sandbox environment ready for partners
- [ ] Custom report builder hoạt động

---

### Sprint 22 (Week 43-44): Advanced Features & Loyalty

**Sprint Goal:** Loyalty program, gamification, advanced claims processing.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S22-01 | Loyalty Program (points system) | E14 | P1 | 8 | FE + BE |
| S22-02 | Referral Program v2 (tiered rewards) | E14 | P1 | 5 | FE + BE |
| S22-03 | Gamification (badges, achievements) | E14 | P2 | 5 | FE + BE |
| S22-04 | Advanced Claims - AI Document Verification | E6 | P1 | 8 | BE (ML) |
| S22-05 | Advanced Claims - Fraud Detection (basic) | E6 | P1 | 5 | BE |
| S22-06 | Chatbot Integration (FAQ + simple queries) | E9 | P2 | 5 | FE + BE |
| S22-07 | Customer Satisfaction Surveys (NPS, CSAT) | E11 | P1 | 3 | FE + BE |

**Total Points:** 39  
**Sprint Risks:**
- Loyalty program business rules complexity
- AI document verification accuracy
- Fraud detection false positives

**Definition of Done:**
- [ ] Loyalty: customers earn + redeem points
- [ ] Referral v2: tiered rewards structure
- [ ] AI claims: auto-verify document authenticity
- [ ] Basic fraud detection flags suspicious claims
- [ ] Chatbot handles top 20 FAQ questions
- [ ] NPS/CSAT surveys collect feedback

---

### Sprint 23 (Week 45-46): Performance, Scale & Security Audit

**Sprint Goal:** Chuẩn bị scale hệ thống, security audit toàn diện, ISO 27001 preparation.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S23-01 | Horizontal Scaling Setup (auto-scaling) | Infra | P0 | 5 | DevOps |
| S23-02 | Database Optimization (partitioning, read replicas) | Infra | P0 | 5 | BE + DevOps |
| S23-03 | CDN & Caching Strategy (Redis cluster) | Infra | P0 | 3 | DevOps |
| S23-04 | Comprehensive Security Audit | Security | P0 | 8 | Security |
| S23-05 | Penetration Testing (external vendor) | Security | P0 | 5 | Security |
| S23-06 | ISO 27001 Documentation Preparation | Security | P0 | 5 | Security + PM |
| S23-07 | Disaster Recovery Testing | Infra | P0 | 3 | DevOps |
| S23-08 | Load Testing (10K concurrent users) | QA | P0 | 3 | QA |
| S23-09 | API Rate Limiting & Abuse Prevention | Security | P1 | 2 | BE |

**Total Points:** 39  
**Sprint Risks:**
- Auto-scaling configuration complexity
- Security vulnerabilities discovered
- DR testing reveals gaps

**Definition of Done:**
- [ ] Auto-scaling: handles 10K concurrent users
- [ ] Database: read replicas active, partitioning applied
- [ ] Security audit: no critical/high vulnerabilities
- [ ] Penetration test report: all critical fixed
- [ ] DR test: recovery within 4 hours RPO/RTO
- [ ] ISO 27001 documentation 80% complete

---

### Sprint 24 (Week 47-48): V2.0 Final Release & Year-End

**Sprint Goal:** Hoàn thiện V2.0, stabilization, year-end release với full feature set.

| ID | Task | Epic | Priority | Points | Assignee |
|----|------|------|----------|--------|----------|
| S24-01 | Full Regression Testing (all features) | QA | P0 | 8 | QA |
| S24-02 | Mobile App v1.0 Post-launch Fixes | E13 | P0 | 5 | Mobile |
| S24-03 | API v2 - Partner Onboarding (2+ partners live) | E10 | P0 | 3 | BE |
| S24-04 | Advanced Analytics Dashboard (BI integration) | E11 | P1 | 5 | FE + BE |
| S24-05 | Year-end Financial Reconciliation Reports | E11 | P0 | 3 | BE |
| S24-06 | Performance Monitoring Enhancement (APM) | DevOps | P1 | 3 | DevOps |
| S24-07 | Technical Debt Cleanup | Tech Debt | P1 | 5 | All |
| S24-08 | V2.0 Production Deployment | DevOps | P0 | 3 | DevOps |
| S24-09 | Post-mortem & Year 2 Planning Documentation | PM | P1 | 2 | PM + Tech |

**Total Points:** 37  
**Sprint Risks:**
- Year-end traffic spikes
- Partner integration issues in production
- Technical debt items blocking features

**Definition of Done:**
- [ ] Full regression: 0 critical, < 5 high bugs
- [ ] Mobile app stable (crash rate < 0.5%)
- [ ] API v2: 2+ partners live in production
- [ ] BI dashboard hoạt động với full data
- [ ] Technical debt reduced (measured by SonarQube)
- [ ] 🚀 **V2.0 RELEASE**

---

**V2.0 Release Summary:**
| Metric | Value |
|--------|-------|
| Total Story Points (Phase 4) | ~232 |
| Duration | 12 weeks (6 sprints) |
| New Products | Group Health, Business Property, Liability |
| Key Features | B2B, Mobile App v1.0, API v2, White-label, Loyalty, AI Claims |
| Team | 15 developers |
| Success Criteria | 15K policies/month |

---


## Tổng Kết Sprint Planning

### Sprint Velocity Tracking

| Sprint | Phase | Points Planned | Cumulative |
|--------|-------|---------------|------------|
| Sprint 1 | MVP | 34 | 34 |
| Sprint 2 | MVP | 38 | 72 |
| Sprint 3 | MVP | 40 | 112 |
| Sprint 4 | MVP | 41 | 153 |
| Sprint 5 | MVP | 36 | 189 |
| Sprint 6 | MVP | 37 | 226 |
| Sprint 7 | V1.0 | 42 | 268 |
| Sprint 8 | V1.0 | 37 | 305 |
| Sprint 9 | V1.0 | 37 | 342 |
| Sprint 10 | V1.0 | 36 | 378 |
| Sprint 11 | V1.0 | 35 | 413 |
| Sprint 12 | V1.0 | 37 | 450 |
| Sprint 13 | V1.5 | 42 | 492 |
| Sprint 14 | V1.5 | 40 | 532 |
| Sprint 15 | V1.5 | 36 | 568 |
| Sprint 16 | V1.5 | 37 | 605 |
| Sprint 17 | V1.5 | 36 | 641 |
| Sprint 18 | V1.5 | 36 | 677 |
| Sprint 19 | V2.0 | 39 | 716 |
| Sprint 20 | V2.0 | 37 | 753 |
| Sprint 21 | V2.0 | 41 | 794 |
| Sprint 22 | V2.0 | 39 | 833 |
| Sprint 23 | V2.0 | 39 | 872 |
| Sprint 24 | V2.0 | 37 | 909 |

**Tổng: ~909 Story Points trong 48 tuần (24 sprints)**

---

### Epic Coverage Across Sprints

| Epic | Sprints | Status by Release |
|------|---------|-------------------|
| E1: Auth & Users | Sprint 1-2 | ✅ MVP |
| E2: Product Discovery | Sprint 2-3, 6, 9 | ✅ V1.0 |
| E3: Quotation Engine | Sprint 3, 5, 7, 13-15 | ✅ V1.5 |
| E4: Purchase & Payment | Sprint 4-5, 8, 13-14 | ✅ V1.5 |
| E5: Policy Management | Sprint 5, 11 | ✅ V1.0 |
| E6: Claims Processing | Sprint 10-11, 22 | ✅ V2.0 |
| E7: Admin Panel | Sprint 8-10, 12, 17 | ✅ V1.5 |
| E8: Notifications | Sprint 5, 8, 10, 17 | ✅ V1.5 |
| E9: AI & Recommendations | Sprint 9, 14, 17, 22 | ✅ V2.0 |
| E10: Partner Integration | Sprint 2-3, 5, 7-8, 13-14, 20-21, 24 | ✅ V2.0 |
| E11: Reporting & Analytics | Sprint 12, 16, 21, 24 | ✅ V2.0 |
| E12: B2B & Enterprise | Sprint 19-21 | ✅ V2.0 |
| E13: Mobile App | Sprint 15-18, 21, 24 | ✅ V2.0 |
| E14: Loyalty & Referral | Sprint 11, 22 | ✅ V2.0 |

---

### Key Milestones

| Milestone | Sprint | Week | Date (Est.) |
|-----------|--------|------|-------------|
| 🏗️ Infrastructure Ready | Sprint 1 | Week 2 | Jan 2026 |
| 🔐 Auth System Complete | Sprint 2 | Week 4 | Jan 2026 |
| 🚗 Motor Insurance Live | Sprint 4 | Week 8 | Feb 2026 |
| 💳 Payment Integration Live | Sprint 4 | Week 8 | Feb 2026 |
| 🚀 **MVP Launch** | Sprint 6 | Week 12 | Mar 2026 |
| 🏥 Health Insurance Live | Sprint 8 | Week 16 | Apr 2026 |
| ⚖️ Claims System Live | Sprint 11 | Week 22 | May 2026 |
| 🚀 **V1.0 Release** | Sprint 12 | Week 24 | Jun 2026 |
| 🧬 Life Insurance Live | Sprint 14 | Week 28 | Jul 2026 |
| 📱 Mobile App Beta | Sprint 18 | Week 36 | Sep 2026 |
| 🚀 **V1.5 Release** | Sprint 18 | Week 36 | Sep 2026 |
| 🏢 B2B Platform Live | Sprint 19 | Week 38 | Oct 2026 |
| 📱 Mobile App v1.0 | Sprint 21 | Week 42 | Oct 2026 |
| 🔌 API v2 Live | Sprint 21 | Week 42 | Oct 2026 |
| 🔒 Security Audit Pass | Sprint 23 | Week 46 | Nov 2026 |
| 🚀 **V2.0 Release** | Sprint 24 | Week 48 | Dec 2026 |

---

### Team Scaling Plan

```
Sprint 1-6 (MVP):
├── 2 Backend Engineers
├── 2 Frontend Engineers
├── 1 Full-stack Engineer
├── 1 DevOps Engineer
├── 1 QA Engineer
└── 1 Tech Lead
Total: 8

Sprint 7-12 (V1.0): +2
├── 3 Backend Engineers (+1)
├── 2 Frontend Engineers
├── 1 Full-stack Engineer
├── 1 DevOps Engineer
├── 1 QA Engineer (+dedicated)
├── 1 Tech Lead
└── 1 Product Designer (+1)
Total: 10 → (hire Sprint 6)

Sprint 13-18 (V1.5): +2
├── 3 Backend Engineers
├── 2 Frontend Engineers
├── 2 Mobile Engineers (+2)
├── 1 DevOps Engineer
├── 1 QA Engineer
├── 1 Tech Lead
└── 1 ML Engineer (+1, part-time → full-time)
Total: 12 → (hire Sprint 11-12)

Sprint 19-24 (V2.0): +3
├── 4 Backend Engineers (+1)
├── 3 Frontend Engineers (+1)
├── 2 Mobile Engineers
├── 1 DevOps Engineer
├── 2 QA Engineers (+1)
├── 1 Tech Lead
├── 1 ML Engineer
└── 1 Security Engineer (+1)
Total: 15 → (hire Sprint 17-18)
```

---

### Sprint Ceremonies

| Ceremony | Duration | Frequency | Participants |
|----------|----------|-----------|-------------|
| Sprint Planning | 2 hours | Every 2 weeks (Day 1) | All team |
| Daily Standup | 15 min | Daily | All team |
| Sprint Review/Demo | 1 hour | Every 2 weeks (Day 10) | Team + Stakeholders |
| Sprint Retrospective | 1 hour | Every 2 weeks (Day 10) | All team |
| Backlog Refinement | 1 hour | Weekly (mid-sprint) | PO + Tech Lead + Seniors |
| Architecture Review | 1 hour | Bi-weekly | Tech Lead + Seniors |
| Release Planning | 2 hours | Monthly | PO + Tech Lead + PM |

---

### Definition of Done (Global)

Mỗi task trong sprint phải đạt:

- [ ] Code hoàn thành và pass code review (≥ 1 reviewer)
- [ ] Unit tests coverage ≥ 80% cho code mới
- [ ] Integration tests cho API endpoints
- [ ] No critical/high SonarQube issues
- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] Responsive design verified (mobile + desktop)
- [ ] Performance acceptable (API < 500ms, Page < 3s)
- [ ] Security checklist passed (no SQL injection, XSS, etc.)
- [ ] Deploy thành công lên staging environment
- [ ] PO acceptance (demo + sign-off)

---

### Risk Management Per Phase

| Phase | Top Risk | Impact | Mitigation |
|-------|----------|--------|------------|
| MVP | Insurer API delays | High | Early engagement, mock APIs, backup partners |
| MVP | Payment gateway approval | High | Apply early, prepare alternatives |
| V1.0 | Health underwriting complexity | Medium | Iterative rules, partner collaboration |
| V1.0 | Claims process disagreements | Medium | Clear SLA contracts with insurers |
| V1.5 | Mobile app quality | Medium | Beta testing, gradual rollout |
| V1.5 | AI model accuracy | Medium | A/B testing, manual fallback |
| V2.0 | B2B requirements scope | High | Early enterprise client interviews |
| V2.0 | Security audit findings | High | Continuous security testing |

---

### Success Metrics Per Release

| Release | KPI | Target |
|---------|-----|--------|
| MVP | Policies Sold | 1,000 total |
| MVP | Conversion Rate (quote → purchase) | ≥ 5% |
| MVP | System Uptime | ≥ 99% |
| MVP | Page Load Time | < 3 seconds |
| V1.0 | Monthly Policies | 5,000/month |
| V1.0 | Claims Processed | < 5 days avg |
| V1.0 | Customer Satisfaction (CSAT) | ≥ 4.0/5 |
| V1.0 | Insurer Partners | ≥ 5 active |
| V1.5 | Monthly Policies | 10,000/month |
| V1.5 | Mobile App Downloads | 50,000 |
| V1.5 | AI Recommendation CTR | ≥ 10% |
| V1.5 | Customer Retention | ≥ 70% renewal rate |
| V2.0 | Monthly Policies | 15,000/month |
| V2.0 | B2B Clients | ≥ 20 enterprise accounts |
| V2.0 | API Partners | ≥ 5 active |
| V2.0 | Revenue | Break-even achieved |
