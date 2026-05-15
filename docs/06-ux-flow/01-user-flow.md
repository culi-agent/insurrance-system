# User Flow - Luồng Người Dùng

---

## 1. Tổng Quan User Flows

### 1.1. Flow Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     INSURANCE SYSTEM - USER FLOWS                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  GUEST FLOWS                                                             │
│  ├── UF-01: Browse Products                                              │
│  ├── UF-02: Get Quick Quote                                              │
│  ├── UF-03: Compare Products                                             │
│  └── UF-04: Register / Login                                             │
│                                                                           │
│  CUSTOMER FLOWS                                                          │
│  ├── UF-05: Purchase Insurance (Simple)                                  │
│  ├── UF-06: Purchase Insurance (Complex)                                 │
│  ├── UF-07: Submit Claim                                                 │
│  ├── UF-08: Track Claim                                                  │
│  ├── UF-09: Renew Policy                                                │
│  ├── UF-10: Cancel Policy                                               │
│  └── UF-11: Manage Profile                                              │
│                                                                           │
│  ADMIN FLOWS                                                             │
│  ├── UF-12: Process Claim                                               │
│  ├── UF-13: Manage Products                                             │
│  └── UF-14: View Reports                                                │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. UF-01: Browse Products

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Entry:  │────▶│ Category │────▶│ Product  │────▶│ Product  │
│ Homepage │     │  Page    │     │ Listing  │     │ Detail   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │                │                │                ▼
     │                │                │           ┌──────────┐
     │                │                │           │ Get Quote│
     │                │                │           └──────────┘
     │                │                ▼
     │                │           ┌──────────┐
     │                │           │  Filter  │
     │                │           │  & Sort  │
     │                │           └──────────┘
     │                ▼
     │           ┌──────────┐
     └──────────▶│  Search  │────▶ Product Listing
                 └──────────┘

Decision Points:
◇ Has account? → Show personalized recommendations
◇ Returning user? → Show recently viewed products
◇ 0 results? → Show suggestions + "Contact us"
```

---

## 3. UF-02: Get Quick Quote (Motor Insurance)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Entry:  │────▶│ Vehicle  │────▶│ Coverage │────▶│  Quote   │
│ CTA/Page │     │   Info   │     │ Options  │     │ Results  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                │                │
                      ▼                ▼                ├──▶ [Buy Now]
                 ◇ Validate       ◇ Validate           ├──▶ [Save Quote]*
                 │ Pass │ Fail    │ Pass │ Fail        ├──▶ [Compare]
                 │      ▼         │      ▼             └──▶ [Share]
                 │  [Error msg]   │  [Error msg]
                 │  [Fix field]   │  [Fix field]       * Requires login
                 ▼                ▼
              Continue         Continue

Entry Points:
• Homepage hero CTA
• Product detail page "Nhận báo giá"
• Category page "Xem giá"
• Navigation menu "Báo giá nhanh"

Exit Points:
• Buy Now → Purchase Flow (UF-05)
• Save Quote → Login (if guest) → Dashboard
• Compare → Comparison Page
• Share → Generate link / Send email
• Abandon → Exit (trigger abandoned quote email after 24h)
```

---

## 4. UF-04: Register / Login

### 4.1. Registration Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Entry   │────▶│ Register │────▶│  Verify  │────▶│ Welcome  │
│ (various)│     │   Form   │     │   OTP    │     │  Page    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                │                │
                      ▼                ▼                ▼
                 ◇ Validate       ◇ OTP OK?       [Optional:
                 │ Email exists    │ Yes → ✓       Profile setup]
                 │ → "Đăng nhập?" │ No →           │
                 │ Phone exists    │ [Resend]       ▼
                 │ → "Đăng nhập?" │ (max 3x)     Dashboard
                 │ Password weak   │ Expired →
                 │ → Strength bar  │ [New OTP]
                 ▼
            [Show error]
            [Suggest login]

Entry Points:
• "Đăng ký" button (header)
• Redirect from protected action (save quote, buy)
• Marketing landing page
• Referral link

Post-Registration:
• Redirect to original intent (if any)
• OR redirect to dashboard
• Send welcome email (series of 5)
```

### 4.2. Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Entry   │────▶│  Login   │────▶│ Success  │
│          │     │   Form   │     │ Redirect │
└──────────┘     └──────────┘     └──────────┘
                      │
                      ├──▶ [Social Login] ──▶ OAuth Provider ──▶ Success
                      │
                      ├──▶ ◇ Wrong credentials?
                      │    └──▶ "Sai email hoặc mật khẩu"
                      │         (5 fails → Lock 30 min)
                      │
                      └──▶ [Quên mật khẩu] ──▶ Reset Flow
                           ├── Enter email/phone
                           ├── Receive OTP/link
                           ├── Set new password
                           └── Login with new password
```

---

## 5. UF-05: Purchase Insurance (Simple - Motor)

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Quote   │─▶│ Personal │─▶│  eKYC    │─▶│ Review & │─▶│ Payment  │
│ Selected │  │   Info   │  │ (CCCD)   │  │ Confirm  │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │              │              │              │
     ▼             ▼              ▼              ▼              ▼
◇ Logged in?  ◇ Valid?      ◇ OCR OK?     ◇ Agree T&C?   ◇ Success?
│No → Login   │No → Error   │No → Manual  │No → Cannot   │No → Retry
│Yes → Next   │Yes → Next   │Yes → Fill   │    proceed   │Yes ↓
                             │Auto-fill    │Yes → Next
                                                           ┌──────────┐
                                                           │ Success! │
                                                           │ Policy   │
                                                           │ Issued   │
                                                           └──────────┘
                                                                │
                                                           ┌────┴────┐
                                                           │Email+SMS│
                                                           │PDF sent │
                                                           └─────────┘

Time Budget: < 5 minutes total
• Quote selected → Personal info: 60s
• Personal info → eKYC: 30s
• eKYC → Review: 20s
• Review → Payment: 15s
• Payment processing: 30-60s
```

---

## 6. UF-06: Purchase Insurance (Complex - Health/Life)

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Quote   │─▶│ Personal │─▶│  Health  │─▶│ Insured  │
│ Selected │  │   Info   │  │ Declare  │  │ Person(s)│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
                                                │
                                                ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Success! │◀─│ Payment  │◀─│ Review & │◀─│  eKYC +  │
│          │  │          │  │  Sign    │  │Beneficiary│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
                                  │
                                  ▼
                          ◇ Underwriting Decision
                          ├── ACCEPT → Payment
                          ├── REFER → "Đang xét duyệt" → Email khi có KQ
                          └── DECLINE → Show reason + Suggest alternatives

Additional Steps (vs Simple):
• Health Declaration (multi-field medical questionnaire)
• Insured Persons (if buying for family members)
• Beneficiary designation
• Underwriting decision (may require wait time)
• More complex T&C acceptance

Time Budget: 10-15 minutes (or async if REFER)
```

---

## 7. UF-07: Submit Claim

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Dashboard │─▶│  Select  │─▶│  Event   │─▶│  Upload  │─▶│  Review  │
│ "Claim"  │  │  Policy  │  │ Details  │  │   Docs   │  │ & Submit │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
                   │              │              │              │
                   ▼              ▼              ▼              ▼
            ◇ Eligible?    ◇ Within       ◇ All docs?    ◇ Confirm?
            │No → "Policy  │ coverage     │No → Allow    │Yes ↓
            │ not eligible"│ period?      │ partial +     │
            │Yes → Next    │No → Error   │ mark needed  ┌──────────┐
                           │Yes → Next   │Yes → Next    │  Claim   │
                                                        │ Submitted│
                                                        │ #CL-XXX │
                                                        └──────────┘
                                                             │
                                                        Email + SMS
                                                        confirmation

Post-Submit:
• Auto-assign to claims handler (within 4h)
• Customer can track via UF-08
• Notifications at each status change
```

---

## 8. UF-08: Track Claim

```
┌──────────┐     ┌──────────┐     ┌──────────────────────────┐
│Dashboard │────▶│  Claims  │────▶│    Claim Detail          │
│          │     │   List   │     │    (Timeline view)       │
└──────────┘     └──────────┘     └──────────────────────────┘
                                         │
                                         ├──▶ [Add documents] (if requested)
                                         ├──▶ [Send message] to handler
                                         ├──▶ [View decision] when complete
                                         └──▶ [Appeal] if rejected

Status Transitions (visible to user):
📝 Submitted → 📋 Reviewing → ⚠️ Need Info → 📋 Assessing → ✅ Approved → 💰 Paid
                                                             └─▶ ❌ Rejected → [Appeal?]
```

---

## 9. UF-09: Renew Policy

```
                 ┌──────────┐
                 │ Reminder │ (Email/SMS/Push: -30, -14, -7, -3, -1 days)
                 │ Received │
                 └────┬─────┘
                      │
                      ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Dashboard │────▶│  Renewal │────▶│  Adjust? │────▶│ Payment  │
│ "Gia hạn"│     │  Review  │     │ Coverage │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                │                │
                      │                ▼                ▼
                      │         ◇ Changes?        ◇ Success?
                      │         │No → Same terms  │Yes → New policy
                      │         │Yes → Recalculate│No → Retry
                      │         │    → New price
                      │
                      ▼
                 ◇ Auto-renewal ON?
                 │Yes → Auto-charge saved method
                 │      → Notify "Đã tự động gia hạn"
                 │No → Manual flow above

Paths:
A) Auto-renewal ON: Charge → Notify → New policy (0 clicks)
B) 1-click renewal: Same terms → Pay → Done (2 clicks)
C) Adjusted renewal: Change coverage → New price → Pay → Done (4+ clicks)
D) Let expire: No action → Policy expires → Grace period (30d) → Lapse
```

---

## 10. UF-10: Cancel Policy

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Policy   │─▶│  Cancel  │─▶│  Reason  │─▶│  Refund  │─▶│  Confirm │
│ Detail   │  │  Intent  │  │  Select  │  │  Preview │  │  (OTP)   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
                   │                            │              │
                   ▼                            ▼              ▼
          ◇ Cooling-off?              Show: Refund amount  ◇ OTP valid?
          │ (<21d for life)           - Original premium   │Yes → Cancel
          │ Yes → Full refund         - Days remaining     │     → Process refund
          │ No → Pro-rata             - Admin fee          │     → Email confirm
          │      - admin fee          - Net refund         │No → Retry
          │ Has claims? → No refund                        │

Warning displayed:
⚠️ "Sau khi hủy, bạn sẽ mất quyền lợi bảo hiểm ngay lập tức.
    Nếu xảy ra sự cố sau thời điểm hủy, bạn sẽ không được bồi thường."
```

---

## 11. UF-12: Admin - Process Claim

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Claims  │─▶│  Claim   │─▶│  Verify  │─▶│  Assess  │─▶│ Decision │
│  Queue   │  │  Detail  │  │   Docs   │  │  Amount  │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ├─▶ Approve
Filter by:    View:          Checklist:     Calculate:      ├─▶ Partial
• Status      • Policy info  □ Invoice ✓    • Claimed amt   ├─▶ Reject
• Priority    • Customer     □ Report ✓     • Deductible    └─▶ Escalate
• Date        • Event detail □ Photos ✓     • Copay
• Handler     • Documents    □ CCCD ✓       • Net payout
• Amount      • History      □ Other
                             │
                             ◇ All verified?
                             │No → [Request more info] → Email customer
                             │Yes → Proceed to Assess
```

---

## 12. Error & Edge Case Flows

### 12.1. Payment Failure Recovery

```
Payment Failed
     │
     ├──▶ ◇ Reason?
     │    ├── Insufficient funds → "Số dư không đủ. Thử phương thức khác?"
     │    ├── Gateway timeout → "Lỗi kết nối. Thử lại?" [Retry]
     │    ├── Card declined → "Thẻ bị từ chối. Liên hệ ngân hàng hoặc dùng thẻ khác"
     │    └── Unknown → "Có lỗi xảy ra. Dữ liệu đã được lưu." [Retry] [Change method]
     │
     └──▶ Session preserved (30 min)
          • User can retry without re-entering info
          • Auto-save all form data
          • Email reminder if abandoned after 30 min
```

### 12.2. Session Expiry

```
User inactive > 15 min
     │
     ├──▶ Show warning modal at 13 min: "Phiên sắp hết hạn. Tiếp tục?"
     │    ├── [Tiếp tục] → Reset timer
     │    └── [ignored] → Expire at 15 min
     │
     └──▶ On expiry:
          • Save form state to localStorage
          • Redirect to login
          • After re-login → Restore state → Continue where left off
```

---

## 13. Flow Metrics & Goals

| Flow | Target Completion Rate | Target Time | Drop-off Threshold |
|------|----------------------|-------------|-------------------|
| UF-01 Browse | N/A (engagement) | - | Bounce < 40% |
| UF-02 Quote | > 70% start → complete | < 2 min | Alert if < 50% |
| UF-04 Register | > 80% | < 2 min | Alert if < 60% |
| UF-05 Purchase (simple) | > 60% quote → buy | < 5 min | Alert if < 40% |
| UF-06 Purchase (complex) | > 40% quote → buy | < 15 min | Alert if < 25% |
| UF-07 Submit Claim | > 90% | < 10 min | Alert if < 75% |
| UF-09 Renew | > 70% of expiring | < 3 min | Alert if < 50% |
