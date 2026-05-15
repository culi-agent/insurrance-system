# Domain Model - Mô Hình Miền Nghiệp Vụ

---

## 1. Domain Overview (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     INSURANCE SYSTEM - DOMAIN MODEL                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │   CUSTOMER   │───────▶│    POLICY    │◀───────│   PRODUCT    │       │
│  │   DOMAIN     │        │    DOMAIN    │        │   DOMAIN     │       │
│  └──────┬───────┘        └──────┬───────┘        └──────┬───────┘       │
│         │                       │                        │               │
│         │                       │                        │               │
│  ┌──────┴───────┐        ┌──────┴───────┐        ┌──────┴───────┐       │
│  │   PAYMENT    │        │    CLAIMS    │        │   PARTNER    │       │
│  │   DOMAIN     │        │    DOMAIN    │        │   DOMAIN     │       │
│  └──────────────┘        └──────────────┘        └──────────────┘       │
│                                                                           │
│         ┌──────────────┐        ┌──────────────┐                         │
│         │ NOTIFICATION │        │   ADMIN      │                         │
│         │ DOMAIN       │        │   DOMAIN     │                         │
│         └──────────────┘        └──────────────┘                         │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Entities & Relationships

### 2.1. Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Customer   │──1:N─▶│    Quote     │       │   Insurer    │
│              │       │              │◀──N:1─│   (Partner)  │
│ - id         │       │ - id         │       │              │
│ - email      │       │ - customer_id│       │ - id         │
│ - phone      │       │ - product_id │       │ - name       │
│ - full_name  │       │ - insurer_id │       │ - code       │
│ - dob        │       │ - premium    │       │ - api_config │
│ - gender     │       │ - coverage   │       │ - commission │
│ - id_number  │       │ - valid_until│       │ - status     │
│ - kyc_status │       │ - status     │       └──────────────┘
│ - status     │       └──────────────┘              │
└──────┬───────┘              │                      │
       │                      │                      │
       │1:N                   │                      │1:N
       │                      ▼                      │
       │               ┌──────────────┐              │
       └──────────────▶│    Policy    │◀─────────────┘
                       │              │
                       │ - id         │
                       │ - number     │
                       │ - customer_id│
                       │ - product_id │
                       │ - insurer_id │
                       │ - status     │
                       │ - start_date │
                       │ - end_date   │
                       │ - premium    │
                       │ - sum_insured│
                       │ - coverage   │
                       └──────┬───────┘
                              │
              ┌───────────────┼───────────────┐
              │1:N            │1:N            │1:N
              ▼               ▼               ▼
       ┌──────────────┐ ┌──────────┐  ┌──────────────┐
       │    Claim     │ │ Payment  │  │ Beneficiary  │
       │              │ │          │  │              │
       │ - id         │ │ - id     │  │ - id         │
       │ - policy_id  │ │ - policy │  │ - policy_id  │
       │ - type       │ │ - amount │  │ - name       │
       │ - event_date │ │ - method │  │ - relationship│
       │ - amount     │ │ - status │  │ - percentage │
       │ - status     │ │ - gateway│  │ - contact    │
       │ - documents  │ │ - ref    │  └──────────────┘
       └──────────────┘ └──────────┘

┌──────────────┐       ┌──────────────┐
│   Product    │──N:1─▶│  Category    │
│              │       │              │
│ - id         │       │ - id         │
│ - name       │       │ - name       │
│ - category_id│       │ - slug       │
│ - insurer_id │       │ - icon       │
│ - benefits   │       │ - description│
│ - exclusions │       └──────────────┘
│ - pricing    │
│ - min_age    │
│ - max_age    │
│ - status     │
└──────────────┘
```

---

## 3. Bounded Contexts (DDD)

### 3.1. Customer Context

**Aggregates:**
```
Customer (Aggregate Root)
├── CustomerProfile
│   ├── personal_info (name, dob, gender)
│   ├── contact_info (email, phone, address)
│   ├── identity (id_number, kyc_status, kyc_data)
│   └── preferences (language, notifications)
├── FamilyMember[] 
│   ├── name, relationship, dob
│   └── id_number
└── Authentication
    ├── credentials (hashed_password)
    ├── social_accounts[]
    └── sessions[]
```

**Value Objects:**
- Email (validated format)
- PhoneNumber (VN format)
- Address (street, ward, district, city)
- IdentityDocument (type, number, expiry)

**Domain Events:**
- CustomerRegistered
- CustomerVerified
- ProfileUpdated
- KYCCompleted

---

### 3.2. Product Context

**Aggregates:**
```
Product (Aggregate Root)
├── ProductInfo
│   ├── name, description, category
│   ├── insurer_id
│   └── status (draft/active/suspended/archived)
├── Benefits[]
│   ├── name, description
│   ├── coverage_amount
│   └── conditions
├── Exclusions[]
│   ├── description
│   └── category
├── PricingRules
│   ├── base_rate
│   ├── rating_factors[] (age, gender, occupation, etc.)
│   ├── discounts[]
│   └── loadings[]
├── EligibilityRules
│   ├── min_age, max_age
│   ├── occupations_excluded[]
│   ├── regions_available[]
│   └── pre_existing_conditions_rules
└── Documents
    ├── terms_conditions (PDF)
    ├── brochure (PDF)
    └── claims_guide (PDF)
```

**Value Objects:**
- Money (amount, currency)
- DateRange (start, end)
- CoverageLevel (sum_insured, deductible, copay)
- RatingFactor (factor_name, factor_value, multiplier)

**Domain Events:**
- ProductCreated
- ProductPublished
- ProductPriceUpdated
- ProductSuspended

---

### 3.3. Quotation Context

**Aggregates:**
```
Quote (Aggregate Root)
├── QuoteRequest
│   ├── product_type
│   ├── customer_info (age, gender, occupation)
│   ├── coverage_options (sum_insured, deductible, riders)
│   └── input_data (product-specific: vehicle, health declaration, etc.)
├── QuoteResult[]
│   ├── insurer_id
│   ├── product_id
│   ├── premium (annual, monthly)
│   ├── coverage_details
│   ├── benefits_summary
│   └── exclusions_summary
├── Validity
│   ├── created_at
│   ├── valid_until (30 days)
│   └── status (active/expired/converted)
└── Comparison
    ├── compared_quotes[]
    └── recommendation (best_value, most_popular)
```

**Domain Events:**
- QuoteRequested
- QuoteGenerated
- QuoteExpired
- QuoteConvertedToPolicy

---

### 3.4. Policy Context

**Aggregates:**
```
Policy (Aggregate Root)
├── PolicyInfo
│   ├── policy_number (unique, generated)
│   ├── status (pending/active/expired/cancelled/lapsed)
│   ├── effective_date, expiry_date
│   └── issued_date
├── Insured
│   ├── customer_id (policyholder)
│   ├── insured_persons[] (may differ from policyholder)
│   └── beneficiaries[]
├── Coverage
│   ├── product_id
│   ├── insurer_id
│   ├── sum_insured
│   ├── deductible
│   ├── benefits[]
│   ├── exclusions[]
│   └── riders[]
├── Premium
│   ├── total_premium (annual)
│   ├── payment_frequency (annual/quarterly/monthly)
│   ├── installment_amount
│   ├── next_due_date
│   └── payment_history[]
├── Documents
│   ├── policy_document (PDF)
│   ├── certificate
│   └── endorsements[]
└── Lifecycle
    ├── created_at
    ├── activated_at
    ├── cancelled_at / expired_at
    ├── renewal_date
    └── auto_renewal (boolean)
```

**Domain Events:**
- PolicyCreated
- PolicyActivated
- PolicyRenewed
- PolicyCancelled
- PolicyLapsed
- PolicyEndorsed
- PremiumDue
- PremiumPaid
- PremiumOverdue

---

### 3.5. Claims Context

**Aggregates:**
```
Claim (Aggregate Root)
├── ClaimInfo
│   ├── claim_number (unique, generated)
│   ├── policy_id
│   ├── claimant_id (customer)
│   ├── type (health/motor/property/travel/death)
│   ├── status
│   └── priority (low/medium/high/critical)
├── Incident
│   ├── event_date
│   ├── event_description
│   ├── location
│   ├── third_party_involved (boolean)
│   └── police_report_number
├── FinancialInfo
│   ├── claimed_amount
│   ├── assessed_amount
│   ├── approved_amount
│   ├── deductible_applied
│   └── net_settlement
├── Documents[]
│   ├── type (invoice, report, photo, certificate)
│   ├── file_url
│   ├── uploaded_at
│   └── verified (boolean)
├── Assessment
│   ├── handler_id
│   ├── assigned_at
│   ├── notes[]
│   ├── decision (approved/partial/rejected)
│   ├── decision_reason
│   └── decided_at
├── Settlement
│   ├── bank_account
│   ├── transfer_reference
│   ├── settled_at
│   └── settlement_status
└── Communication[]
    ├── from (system/handler/customer)
    ├── message
    ├── attachments[]
    └── sent_at
```

**Claim Status Machine:**
```
SUBMITTED → ASSIGNED → DOCUMENTS_REVIEW → 
  ├── ADDITIONAL_INFO_REQUIRED → DOCUMENTS_REVIEW
  └── UNDER_ASSESSMENT → DECISION_MADE
      ├── APPROVED → PAYMENT_PROCESSING → SETTLED → CLOSED
      ├── PARTIALLY_APPROVED → CUSTOMER_ACCEPTANCE → SETTLED/APPEAL
      └── REJECTED → CLOSED / APPEAL
```

**Domain Events:**
- ClaimSubmitted
- ClaimAssigned
- ClaimDocumentsReviewed
- AdditionalInfoRequested
- ClaimAssessed
- ClaimApproved
- ClaimRejected
- ClaimSettled
- ClaimAppealed

---

### 3.6. Payment Context

**Aggregates:**
```
Transaction (Aggregate Root)
├── TransactionInfo
│   ├── id
│   ├── reference_number
│   ├── type (premium_payment/renewal/refund/claim_settlement)
│   ├── amount
│   ├── currency (VND)
│   └── status (pending/processing/success/failed/refunded)
├── PaymentMethod
│   ├── method_type (ewallet/card/bank_transfer/installment)
│   ├── provider (vnpay/momo/zalopay)
│   ├── gateway_reference
│   └── gateway_response
├── Parties
│   ├── payer (customer_id / insurer_id)
│   ├── payee (platform / customer / insurer)
│   └── policy_id
└── Timestamps
    ├── initiated_at
    ├── completed_at
    └── expires_at

Reconciliation (Aggregate Root)
├── period (month/year)
├── insurer_id
├── total_gwp
├── total_commission
├── net_payable_to_insurer
├── transactions[]
├── discrepancies[]
├── status (draft/confirmed/settled)
└── settled_at
```

---

## 4. Domain Services

| Service | Responsibility |
|---------|---------------|
| QuotationService | Calculate premiums, aggregate multi-insurer quotes |
| UnderwritingService | Evaluate risk, make accept/refer/decline decisions |
| PolicyIssuanceService | Generate policy number, create documents, activate |
| ClaimsAdjudicationService | Assess claims, calculate settlements |
| PaymentOrchestrationService | Coordinate payment flow across gateways |
| NotificationService | Send emails, SMS, push across all events |
| ReconciliationService | Monthly financial settlement with partners |
| KYCService | Verify customer identity via eKYC provider |
| RenewalService | Manage policy renewal lifecycle |
| CommissionService | Calculate and track commission per transaction |

---

## 5. Ubiquitous Language

| Term | Definition | Context |
|------|-----------|---------|
| Policyholder | Người mua bảo hiểm (chủ hợp đồng) | Policy |
| Insured Person | Người được bảo hiểm (có thể khác policyholder) | Policy |
| Beneficiary | Người thụ hưởng quyền lợi bảo hiểm | Policy |
| Premium | Phí bảo hiểm phải đóng | Payment |
| Sum Insured | Số tiền bảo hiểm tối đa | Policy |
| Deductible | Mức miễn thường (khách hàng tự chịu) | Policy |
| Copay | Tỷ lệ đồng chi trả | Policy |
| Waiting Period | Thời gian chờ trước khi quyền lợi có hiệu lực | Policy |
| Exclusion | Trường hợp không được bảo hiểm | Product |
| Rider | Quyền lợi bổ sung (add-on) | Product |
| Underwriting | Đánh giá rủi ro và quyết định chấp nhận | Purchase |
| Loading | Phụ phí do rủi ro cao hơn bình thường | Quotation |
| No-Claim Discount | Giảm giá khi không có claim | Quotation |
| Endorsement | Sửa đổi bổ sung hợp đồng | Policy |
| Lapse | Hợp đồng mất hiệu lực do không đóng phí | Policy |
| Grace Period | Thời gian gia hạn đóng phí | Policy |
| Cooling-off | Thời gian được hủy miễn phí (21 ngày, nhân thọ) | Policy |
| GWP | Gross Written Premium - Tổng phí bảo hiểm | Finance |
| Commission | Hoa hồng môi giới/đại lý | Finance |
| Loss Ratio | Tỷ lệ bồi thường / phí thu | Analytics |
| Claim Frequency | Tần suất bồi thường | Analytics |

---

## 6. Context Mapping

```
┌───────────────┐                    ┌───────────────┐
│   Customer    │ ──── Customer/     │   Policy      │
│   Context     │ ──── Conformist    │   Context     │
└───────┬───────┘                    └───────┬───────┘
        │                                     │
        │ Shared Kernel                       │ Published Language
        │                                     │
┌───────┴───────┐                    ┌───────┴───────┐
│   Payment     │ ──── Partnership   │   Claims      │
│   Context     │ ────               │   Context     │
└───────────────┘                    └───────────────┘
        │                                     │
        │ Anti-corruption Layer               │ Anti-corruption Layer
        │                                     │
┌───────┴───────┐                    ┌───────┴───────┐
│   External    │                    │   Insurer     │
│   Payment GW  │                    │   API         │
└───────────────┘                    └───────────────┘
```

**Integration Patterns:**
- Customer → Policy: Shared Kernel (customer data shared)
- Policy → Claims: Published Language (policy events trigger claims eligibility)
- Payment → External: Anti-corruption Layer (isolate gateway specifics)
- Claims → Insurer: Anti-corruption Layer (normalize insurer API differences)
