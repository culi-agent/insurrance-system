# Business Flow - Luồng Nghiệp Vụ

---

## 1. Tổng quan luồng nghiệp vụ chính

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INSURANCE SYSTEM - BUSINESS FLOWS                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Flow 1: Customer Acquisition (Thu hút khách hàng)                       │
│  ────────────────────────────────────────────────                        │
│  Marketing → Website Visit → Registration → Profile Setup               │
│                                                                           │
│  Flow 2: Product Discovery (Tìm kiếm sản phẩm)                          │
│  ────────────────────────────────────────────────                        │
│  Browse → Search/Filter → Compare → Select                              │
│                                                                           │
│  Flow 3: Quotation (Báo giá)                                            │
│  ────────────────────────────────────────────────                        │
│  Input Info → Calculate → Compare Quotes → Customize → Save/Buy         │
│                                                                           │
│  Flow 4: Purchase (Mua bảo hiểm)                                        │
│  ────────────────────────────────────────────────                        │
│  Application → eKYC → Underwriting → Payment → Policy Issuance          │
│                                                                           │
│  Flow 5: Policy Management (Quản lý hợp đồng)                           │
│  ────────────────────────────────────────────────                        │
│  View → Renew/Cancel/Endorse → Process → Update                         │
│                                                                           │
│  Flow 6: Claims (Bồi thường)                                            │
│  ────────────────────────────────────────────────                        │
│  Submit → Review → Assess → Decision → Settlement                       │
│                                                                           │
│  Flow 7: Payment & Finance (Thanh toán & Tài chính)                     │
│  ────────────────────────────────────────────────                        │
│  Collect Premium → Commission Calc → Settle with Insurer → Reconcile    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flow 1: Customer Registration & Onboarding

### 2.1. Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Start   │────▶│  Enter   │────▶│  Verify  │────▶│  Profile │
│ (Landing)│     │  Info    │     │  OTP     │     │  Setup   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                 │                 │
                      ▼                 ▼                 ▼
                 ┌──────────┐     ┌──────────┐     ┌──────────┐
                 │ Validate │     │ Resend?  │     │  Welcome │
                 │ Email/   │     │ (max 3x) │     │  Email   │
                 │ Phone    │     └──────────┘     └──────────┘
                 └──────────┘
```

**Detailed Steps:**

| Step | Actor | Action | System Response | Business Rules |
|------|-------|--------|-----------------|----------------|
| 1 | User | Truy cập trang đăng ký | Hiển thị form | - |
| 2 | User | Nhập email/phone + password + name | Validate real-time | Unique email/phone |
| 3 | System | Validate all fields | Show errors hoặc proceed | Password complexity |
| 4 | System | Gửi OTP (email + SMS) | Hiển thị OTP input | OTP 6 digits, 5 min validity |
| 5 | User | Nhập OTP | Verify | Max 3 attempts |
| 6 | System | Xác nhận account | Redirect to profile setup | Account = Active |
| 7 | User | Hoàn thiện profile (optional) | Save + Welcome email | - |
| 8 | System | Gửi Welcome email | Include getting started guide | - |

---

## 3. Flow 2: Quotation & Comparison

### 3.1. Motor Insurance Quote Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────────┐    │
│  │ Select  │──▶│ Vehicle  │──▶│ Coverage │──▶│ Multi-Insurer    │    │
│  │ Product │   │ Info     │   │ Options  │   │ Quote Request    │    │
│  └─────────┘   └──────────┘   └──────────┘   └──────────────────┘    │
│                                                        │               │
│                                                        ▼               │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    QUOTE RESULTS                                  │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │
│  │  │Insurer A│  │Insurer B│  │Insurer C│  │Insurer D│          │  │
│  │  │ 350,000 │  │ 380,000 │  │ 320,000 │  │ 400,000 │          │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                          │                                             │
│              ┌───────────┼───────────┐                                │
│              ▼           ▼           ▼                                │
│         ┌─────────┐ ┌─────────┐ ┌─────────┐                         │
│         │ Compare │ │  Save   │ │Buy Now  │                         │
│         │ Details │ │  Quote  │ │         │                         │
│         └─────────┘ └─────────┘ └─────────┘                         │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Health Insurance Quote Flow

```
Step 1: Personal Information
├── Age, Gender, Location
├── Occupation category
└── Individual or Family plan

        ▼

Step 2: Health Declaration
├── Pre-existing conditions
├── Smoking/Alcohol status
├── BMI (height + weight)
├── Family medical history
└── Recent hospitalizations

        ▼

Step 3: Coverage Selection
├── Sum Insured level (100M → 1B)
├── Scope: Inpatient ✓ Outpatient □ Dental □
├── Riders: Critical Illness □ Maternity □
├── Deductible: 0 / 2M / 5M / 10M
└── Network: Standard / Premium

        ▼

Step 4: Quote Aggregation
├── Call Insurer A API → Quote A
├── Call Insurer B API → Quote B
├── Call Insurer C API → Quote C
└── Aggregate & sort results

        ▼

Step 5: Results & Decision
├── Display comparison table
├── Highlight "Best Value" / "Most Popular"
├── Allow adjustment → real-time recalculate
└── CTA: Save / Share / Buy
```

---

## 4. Flow 3: Purchase (End-to-End)

### 4.1. Simple Product Purchase (Motor Insurance)

```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Select │─▶│ Fill   │─▶│  eKYC  │─▶│ Review │─▶│  Pay   │─▶│ Policy │
│ Quote  │  │ Form   │  │ Verify │  │ & Sign │  │        │  │ Issued │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
   1 min      1 min       30 sec      30 sec     1-2 min     Instant
                                                              ─────────
                                                              Total: < 5 min
```

**Detailed Process:**

| Step | Duration | Actor | Action | Validation |
|------|----------|-------|--------|------------|
| 1. Select Quote | 10s | User | Click "Mua ngay" trên quote | Quote valid (< 30 days) |
| 2. Login Check | 5s | System | Kiểm tra authentication | Redirect login nếu cần |
| 3. Personal Info | 60s | User | Điền thông tin chủ xe | All required fields |
| 4. eKYC Upload | 20s | User | Upload CCCD (trước + sau) | File format, size |
| 5. eKYC Process | 10s | System | OCR + Verify | Confidence > 80% |
| 6. Auto-fill | 5s | System | Fill form từ OCR data | User confirms |
| 7. Summary | 20s | User | Review all info | - |
| 8. T&C Agreement | 10s | User | Check agreement box | Required |
| 9. Underwriting | 2s | System | Auto-check rules | Pass/Refer/Decline |
| 10. Payment Select | 15s | User | Choose payment method | - |
| 11. Payment Process | 60s | User + Gateway | Complete payment | Success confirmation |
| 12. Policy Create | 5s | System | Generate policy + PDF | - |
| 13. Notification | 10s | System | Send email + SMS | - |
| 14. Confirmation | - | System | Show success page | - |

### 4.2. Complex Product Purchase (Life Insurance)

```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────────┐  ┌────────┐
│ Select │─▶│ Full   │─▶│ Health │─▶│Underwriting│─▶│  eKYC  │
│ Quote  │  │ App    │  │ Decl.  │  │  Decision  │  │ Verify │
└────────┘  └────────┘  └────────┘  └────────────┘  └────────┘
                                           │
                         ┌─────────────────┼──────────────────┐
                         ▼                 ▼                  ▼
                    ┌─────────┐     ┌──────────┐      ┌───────────┐
                    │ ACCEPT  │     │  REFER   │      │  DECLINE  │
                    │ → Pay   │     │ → Manual │      │ → Suggest │
                    │ → Issue │     │ → Review │      │ → Alt.    │
                    └─────────┘     └──────────┘      └───────────┘
                         │                │
                         ▼                ▼
                    ┌─────────┐     ┌──────────┐
                    │ Policy  │     │ Medical  │
                    │ Active  │     │ Exam Req │
                    └─────────┘     └──────────┘
```

---

## 5. Flow 4: Claims Processing

### 5.1. End-to-End Claims Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLAIMS LIFECYCLE                                 │
│                                                                         │
│  CUSTOMER                    SYSTEM                    OPERATIONS       │
│  ────────                    ──────                    ──────────       │
│                                                                         │
│  ┌──────────┐                                                          │
│  │ Incident │                                                          │
│  │ Occurs   │                                                          │
│  └────┬─────┘                                                          │
│       │                                                                 │
│       ▼                                                                 │
│  ┌──────────┐          ┌──────────┐                                    │
│  │ Submit   │─────────▶│ Validate │                                    │
│  │ Claim    │          │ Coverage │                                    │
│  └──────────┘          └────┬─────┘                                    │
│                              │                                          │
│                              ▼                                          │
│                         ┌──────────┐         ┌──────────┐             │
│                         │ Assign   │────────▶│ Review   │             │
│                         │ Handler  │         │ Documents│             │
│                         └──────────┘         └────┬─────┘             │
│                                                    │                    │
│  ┌──────────┐                              ┌──────┴─────┐             │
│  │ Provide  │◀─────────────────────────────│ Need More  │             │
│  │ Add Info │          (if needed)         │ Info?      │             │
│  └────┬─────┘                              └──────┬─────┘             │
│       │                                           │ No                 │
│       └───────────────────────────────────────────┘                    │
│                                                    │                    │
│                                                    ▼                    │
│                                              ┌──────────┐             │
│                                              │ Assess   │             │
│                                              │ Claim    │             │
│                                              └────┬─────┘             │
│                                                    │                    │
│                              ┌─────────────────────┼────────┐         │
│                              ▼                     ▼        ▼         │
│                         ┌─────────┐         ┌─────────┐ ┌───────┐   │
│                         │ Approve │         │ Partial │ │Reject │   │
│                         └────┬────┘         └────┬────┘ └───┬───┘   │
│                              │                    │          │        │
│                              ▼                    ▼          ▼        │
│  ┌──────────┐          ┌──────────┐         ┌──────────┐            │
│  │ Receive  │◀─────────│ Process  │         │ Notify   │            │
│  │ Payment  │          │ Payment  │         │ Customer │            │
│  └──────────┘          └──────────┘         └──────────┘            │
│                                                                         │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2. Claims SLA Timeline

| Status | Max Duration | Responsible | Escalation |
|--------|-------------|-------------|------------|
| Submitted → Assigned | 4 hours | System (auto) | If > 4h → Alert team lead |
| Assigned → Documents Review | 1 business day | Claims Handler | If > 1d → Escalate |
| Additional Info Request → Customer Response | 7 days | Customer | If > 7d → Reminder, > 14d → Close |
| Documents Complete → Assessment | 3 business days | Claims Handler | If > 3d → Escalate |
| Assessment → Decision | 2 business days | Claims Manager | If > 2d → Escalate to Head |
| Approved → Payment | 2 business days | Finance | If > 2d → Alert |
| **Total (simple claim)** | **< 7 business days** | - | - |
| **Total (complex claim)** | **< 15 business days** | - | - |

---

## 6. Flow 5: Policy Lifecycle Management

### 6.1. Policy States

```
                    ┌─────────────────────────────────────┐
                    │         POLICY LIFECYCLE              │
                    └─────────────────────────────────────┘

   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ PENDING  │────▶│ ACTIVE   │────▶│ EXPIRING │
   │ (Payment)│     │          │     │ (< 30d)  │
   └──────────┘     └──────────┘     └──────────┘
                         │                 │
            ┌────────────┼─────────┐       │
            ▼            ▼         ▼       ▼
       ┌─────────┐ ┌─────────┐ ┌─────────────┐
       │CANCELLED│ │ LAPSED  │ │  RENEWED    │
       │(by user)│ │(no pay) │ │  (new term) │
       └─────────┘ └─────────┘ └─────────────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │  ACTIVE  │ (new policy)
                                 └──────────┘
```

### 6.2. Renewal Process

```
Day -30: System sends first renewal reminder (email)
Day -14: Second reminder (email + SMS)
Day -7:  Third reminder (email + SMS + in-app)
Day -3:  Urgent reminder
Day -1:  Final reminder

Day 0 (Expiry):
├── Auto-renewal ON → Charge saved payment method
│   ├── Success → Renew policy → Notify
│   └── Fail → Grace period starts
│
└── Auto-renewal OFF → Policy expires
    └── Grace period (30 days) for late renewal

Day +30 (Grace period ends):
└── Policy LAPSED → Cannot renew online → Contact support
```

---

## 7. Flow 6: Payment & Financial Settlement

### 7.1. Premium Collection Flow

```
Customer pays premium
        │
        ▼
┌──────────────┐
│ Payment      │
│ Gateway      │
│ (VNPay/Momo) │
└──────┬───────┘
       │
       ▼
┌──────────────┐        ┌──────────────┐
│ Platform     │───────▶│ Record       │
│ receives     │        │ Transaction  │
│ full premium │        └──────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Calculate    │
│ Commission   │
│ (15-40%)     │
└──────┬───────┘
       │
       ├───────────────────────────────┐
       ▼                               ▼
┌──────────────┐              ┌──────────────┐
│ Platform     │              │ Remit to     │
│ Revenue      │              │ Insurer      │
│ (Commission) │              │ (Net Premium)│
└──────────────┘              └──────────────┘
```

### 7.2. Commission Structure

| Product Type | Commission Rate | Settlement Frequency |
|-------------|----------------|---------------------|
| Motor (Compulsory) | 15-20% | Monthly |
| Motor (Comprehensive) | 20-25% | Monthly |
| Health (Individual) | 20-30% | Monthly |
| Health (Group) | 15-20% | Monthly |
| Life Insurance | 30-40% (Year 1) | Monthly |
| Travel | 25-35% | Monthly |
| Property | 20-25% | Monthly |
| Business | 15-25% | Monthly |

### 7.3. Reconciliation Process

```
Monthly Reconciliation:
1. Export all transactions for month
2. Match with insurer records
3. Calculate: Total Premium - Commission = Amount Due to Insurer
4. Generate reconciliation report
5. Settle difference (wire transfer)
6. Issue commission invoice
7. Both parties confirm
```

---

## 8. Flow 7: Partner Onboarding

### 8.1. New Insurer Partner Onboarding

```
Week 1-2: Business Discussion
├── Commercial terms negotiation
├── Product scope agreement
├── Commission structure agreement
└── Contract signing

Week 3-4: Technical Integration
├── API documentation exchange
├── Sandbox environment setup
├── Integration development
├── API testing & certification
└── Security audit

Week 5-6: Product Setup
├── Product configuration on platform
├── Pricing rules setup
├── Underwriting rules configuration
├── Document templates
└── Claims process mapping

Week 7-8: Go-Live Preparation
├── UAT testing (both sides)
├── Performance testing
├── Staff training
├── Soft launch (limited traffic)
└── Full launch + monitoring
```

---

## 9. Flow 8: Customer Support

### 9.1. Support Ticket Flow

```
Customer Issue
      │
      ├── Self-service (FAQ, Chatbot) → Resolved? → End
      │                                      │
      │                                 Not resolved
      │                                      │
      ▼                                      ▼
┌───────────┐                         ┌───────────┐
│ Live Chat │                         │ Submit    │
│ Agent     │                         │ Ticket    │
└─────┬─────┘                         └─────┬─────┘
      │                                      │
      ▼                                      ▼
┌───────────┐                         ┌───────────┐
│ Resolve   │                         │ Assign    │
│ in chat   │                         │ to Agent  │
└─────┬─────┘                         └─────┬─────┘
      │                                      │
      ▼                                      ▼
┌───────────┐                         ┌───────────┐
│ CSAT      │                         │ Investigate│
│ Survey    │                         │ & Resolve │
└───────────┘                         └─────┬─────┘
                                             │
                                             ▼
                                       ┌───────────┐
                                       │ Close     │
                                       │ Ticket    │
                                       └───────────┘
```

### 9.2. Support SLA

| Priority | First Response | Resolution | Examples |
|----------|---------------|------------|----------|
| Critical (P1) | 15 minutes | 4 hours | Payment stuck, cannot login |
| High (P2) | 1 hour | 8 hours | Claim issue, policy error |
| Medium (P3) | 4 hours | 24 hours | General inquiry, change request |
| Low (P4) | 24 hours | 72 hours | Feedback, suggestion, minor UI |
