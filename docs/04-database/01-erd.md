# Entity Relationship Diagram (ERD)

---

## 1. Tổng quan

Tài liệu này mô tả ERD (Entity Relationship Diagram) cho hệ thống Insurance System Platform, thể hiện mối quan hệ giữa các entity chính trong database.

**Database Engine:** PostgreSQL 15  
**ORM:** TypeORM  
**Naming Convention:** snake_case cho tables và columns

---

## 2. High-Level ERD

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        INSURANCE SYSTEM - ERD OVERVIEW                            │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   category   │
                              │──────────────│
                              │ PK: id       │
                              │ name         │
                              │ slug         │
                              └──────┬───────┘
                                     │ 1
                                     │
                                     │ N
┌──────────────┐              ┌──────┴───────┐              ┌──────────────┐
│   insurer    │──────1:N────▶│   product    │              │   customer   │
│──────────────│              │──────────────│              │──────────────│
│ PK: id       │              │ PK: id       │              │ PK: id       │
│ name         │              │ name         │              │ email        │
│ code         │              │ category_id  │              │ phone        │
│ api_config   │              │ insurer_id   │              │ full_name    │
└──────┬───────┘              └──────┬───────┘              └──────┬───────┘
       │                             │                             │
       │                             │                             │
       │ 1                           │ 1                           │ 1
       │         ┌───────────────────┼─────────────────────┐      │
       │         │                   │                     │      │
       │         │ N                 │ N                   │ N    │ N
       │  ┌──────┴───────┐   ┌──────┴───────┐     ┌──────┴──────┴──────┐
       │  │    quote     │   │    policy    │     │      payment       │
       │  │──────────────│   │──────────────│     │────────────────────│
       │  │ PK: id       │   │ PK: id       │     │ PK: id             │
       └──│ insurer_id   │   │ policy_number│     │ policy_id          │
          │ customer_id  │   │ customer_id  │     │ customer_id        │
          │ product_id   │   │ product_id   │     │ amount             │
          │ premium      │   │ insurer_id   │     │ status             │
          └──────────────┘   │ status       │     └────────────────────┘
                             │ premium      │
                             └──────┬───────┘
                                    │
                    ┌───────────────┬┴──────────────┐
                    │ 1:N           │ 1:N           │ 1:N
                    │               │               │
             ┌──────┴───────┐ ┌────┴────────┐ ┌────┴─────────┐
             │    claim     │ │ beneficiary │ │  endorsement │
             │──────────────│ │─────────────│ │──────────────│
             │ PK: id       │ │ PK: id      │ │ PK: id       │
             │ policy_id    │ │ policy_id   │ │ policy_id    │
             │ claim_number │ │ name        │ │ type         │
             │ status       │ │ relationship│ │ changes      │
             │ amount       │ │ percentage  │ │ status       │
             └──────┬───────┘ └─────────────┘ └──────────────┘
                    │
                    │ 1:N
                    │
             ┌──────┴───────┐
             │claim_document│
             │──────────────│
             │ PK: id       │
             │ claim_id     │
             │ file_url     │
             │ type         │
             └──────────────┘
```

---

## 3. Detailed ERD - Core Entities

### 3.1. Customer Domain

```
┌─────────────────────────────────┐
│           customer              │
│─────────────────────────────────│
│ PK  id              UUID        │
│     email           VARCHAR(255)│ UNIQUE
│     phone           VARCHAR(20) │ UNIQUE
│     password_hash   VARCHAR(255)│
│     full_name       VARCHAR(100)│
│     date_of_birth   DATE        │
│     gender          VARCHAR(10) │
│     id_number       VARCHAR(20) │ (CCCD)
│     id_number_type  VARCHAR(20) │
│     address         JSONB       │
│     kyc_status      VARCHAR(20) │
│     kyc_data        JSONB       │
│     avatar_url      VARCHAR(500)│
│     language        VARCHAR(5)  │ DEFAULT 'vi'
│     status          VARCHAR(20) │
│     email_verified  BOOLEAN     │
│     phone_verified  BOOLEAN     │
│     last_login_at   TIMESTAMP   │
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
│     deleted_at      TIMESTAMP   │ (soft delete)
└─────────────────────────────────┘
         │ 1
         │
         │ N
┌─────────────────────────────────┐
│       customer_family_member    │
│─────────────────────────────────│
│ PK  id              UUID        │
│ FK  customer_id     UUID        │
│     full_name       VARCHAR(100)│
│     relationship    VARCHAR(30) │
│     date_of_birth   DATE        │
│     gender          VARCHAR(10) │
│     id_number       VARCHAR(20) │
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
└─────────────────────────────────┘
```

### 3.2. Product Domain

```
┌─────────────────────────────────┐        ┌─────────────────────────────┐
│           category              │        │          insurer            │
│─────────────────────────────────│        │─────────────────────────────│
│ PK  id              UUID        │        │ PK  id            UUID      │
│     name            VARCHAR(100)│        │     name          VARCHAR   │
│     slug            VARCHAR(100)│ UNIQUE │     code          VARCHAR   │ UNIQUE
│     description     TEXT        │        │     logo_url      VARCHAR   │
│     icon            VARCHAR(50) │        │     description   TEXT      │
│     parent_id       UUID        │ FK     │     api_endpoint  VARCHAR   │
│     sort_order      INTEGER     │        │     api_config    JSONB     │
│     is_active       BOOLEAN     │        │     commission_rate JSONB   │
│     created_at      TIMESTAMP   │        │     contact_info  JSONB     │
│     updated_at      TIMESTAMP   │        │     status        VARCHAR   │
└──────────────┬──────────────────┘        │     created_at    TIMESTAMP │
               │ 1                         │     updated_at    TIMESTAMP │
               │                           └────────────┬────────────────┘
               │ N                                      │ 1
        ┌──────┴──────────────────────┐                │
        │          product            │                │ N
        │─────────────────────────────│◀───────────────┘
        │ PK  id              UUID    │
        │ FK  category_id     UUID    │
        │ FK  insurer_id      UUID    │
        │     name            VARCHAR │
        │     slug            VARCHAR │ UNIQUE
        │     short_desc      VARCHAR │
        │     description     TEXT    │
        │     benefits        JSONB   │
        │     exclusions      JSONB   │
        │     pricing_rules   JSONB   │
        │     eligibility     JSONB   │
        │     documents       JSONB   │
        │     min_age         INTEGER │
        │     max_age         INTEGER │
        │     min_sum_insured BIGINT  │
        │     max_sum_insured BIGINT  │
        │     status          VARCHAR │
        │     rating          DECIMAL │
        │     total_sold      INTEGER │
        │     created_at      TIMESTAMP│
        │     updated_at      TIMESTAMP│
        └─────────────────────────────┘
```

### 3.3. Quotation Domain

```
┌─────────────────────────────────┐
│            quote                │
│─────────────────────────────────│
│ PK  id              UUID        │
│ FK  customer_id     UUID        │ NULLABLE (guest quote)
│ FK  product_id      UUID        │
│ FK  insurer_id      UUID        │
│     quote_number    VARCHAR(30) │ UNIQUE
│     input_data      JSONB       │ (vehicle/health/travel info)
│     coverage_options JSONB      │
│     premium_annual  BIGINT      │
│     premium_monthly BIGINT      │
│     sum_insured     BIGINT      │
│     deductible      BIGINT      │
│     benefits_summary JSONB      │
│     exclusions_summary JSONB    │
│     valid_until     TIMESTAMP   │
│     status          VARCHAR(20) │ (active/expired/converted)
│     converted_policy_id UUID    │ NULLABLE
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
└─────────────────────────────────┘
```

### 3.4. Policy Domain

```
┌─────────────────────────────────┐
│            policy               │
│─────────────────────────────────│
│ PK  id              UUID        │
│ FK  customer_id     UUID        │
│ FK  product_id      UUID        │
│ FK  insurer_id      UUID        │
│ FK  quote_id        UUID        │ NULLABLE
│     policy_number   VARCHAR(30) │ UNIQUE
│     status          VARCHAR(20) │
│     start_date      DATE        │
│     end_date        DATE        │
│     issued_date     DATE        │
│     premium_total   BIGINT      │
│     premium_frequency VARCHAR(20)│
│     installment_amount BIGINT   │
│     sum_insured     BIGINT      │
│     deductible      BIGINT      │
│     coverage_details JSONB      │
│     insured_persons JSONB       │
│     riders          JSONB       │
│     document_url    VARCHAR(500)│
│     auto_renewal    BOOLEAN     │
│     renewal_date    DATE        │
│     cancelled_at    TIMESTAMP   │
│     cancellation_reason TEXT    │
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
└──────────────┬──────────────────┘
               │ 1
               │
    ┌──────────┼───────────┬────────────────────┐
    │ N        │ N         │ N                  │ N
    │          │           │                    │
┌───┴──────┐ ┌┴────────┐ ┌┴──────────────┐ ┌──┴─────────────┐
│beneficiary│ │ claim  │ │  endorsement  │ │ policy_document│
└──────────┘ └─────────┘ └───────────────┘ └────────────────┘
```

### 3.5. Claims Domain

```
┌─────────────────────────────────┐
│            claim                │
│─────────────────────────────────│
│ PK  id              UUID        │
│ FK  policy_id       UUID        │
│ FK  customer_id     UUID        │
│ FK  handler_id      UUID        │ NULLABLE
│     claim_number    VARCHAR(30) │ UNIQUE
│     type            VARCHAR(30) │
│     status          VARCHAR(30) │
│     priority        VARCHAR(10) │
│     event_date      DATE        │
│     event_description TEXT      │
│     event_location  VARCHAR(255)│
│     claimed_amount  BIGINT      │
│     assessed_amount BIGINT      │
│     approved_amount BIGINT      │
│     deductible_applied BIGINT   │
│     net_settlement  BIGINT      │
│     decision        VARCHAR(20) │
│     decision_reason TEXT        │
│     decided_at      TIMESTAMP   │
│     settled_at      TIMESTAMP   │
│     bank_account    JSONB       │
│     submitted_at    TIMESTAMP   │
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
└──────────────┬──────────────────┘
               │ 1
               │
    ┌──────────┼──────────────┐
    │ N        │ N            │ N
    │          │              │
┌───┴────────┐ ┌┴───────────┐ ┌┴──────────────┐
│claim_doc   │ │claim_note  │ │claim_timeline │
│────────────│ │────────────│ │───────────────│
│PK id       │ │PK id       │ │PK id          │
│FK claim_id │ │FK claim_id │ │FK claim_id    │
│   type     │ │FK user_id  │ │   status_from │
│   file_url │ │   content  │ │   status_to   │
│   file_name│ │   is_internal│ │   changed_by │
│   file_size│ │   created_at│ │   note        │
│   verified │ │            │ │   created_at  │
│   created_at│ └────────────┘ └───────────────┘
└────────────┘
```

### 3.6. Payment Domain

```
┌─────────────────────────────────┐
│          payment                │
│─────────────────────────────────│
│ PK  id              UUID        │
│ FK  policy_id       UUID        │
│ FK  customer_id     UUID        │
│     reference_number VARCHAR(50)│ UNIQUE
│     type            VARCHAR(30) │ (premium/renewal/refund/settlement)
│     amount          BIGINT      │
│     currency        VARCHAR(3)  │ DEFAULT 'VND'
│     status          VARCHAR(20) │
│     method          VARCHAR(30) │ (ewallet/card/bank_transfer)
│     provider        VARCHAR(30) │ (vnpay/momo/zalopay)
│     gateway_reference VARCHAR(100)│
│     gateway_response JSONB      │
│     paid_at         TIMESTAMP   │
│     expires_at      TIMESTAMP   │
│     refund_amount   BIGINT      │
│     refunded_at     TIMESTAMP   │
│     metadata        JSONB       │
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       reconciliation            │
│─────────────────────────────────│
│ PK  id              UUID        │
│ FK  insurer_id      UUID        │
│     period_month    INTEGER     │
│     period_year     INTEGER     │
│     total_gwp       BIGINT      │
│     total_commission BIGINT     │
│     net_payable     BIGINT      │
│     transaction_count INTEGER   │
│     discrepancies   JSONB       │
│     status          VARCHAR(20) │ (draft/confirmed/settled)
│     settled_at      TIMESTAMP   │
│     created_at      TIMESTAMP   │
│     updated_at      TIMESTAMP   │
└─────────────────────────────────┘
```

### 3.7. Notification & Admin Domain

```
┌─────────────────────────────────┐       ┌─────────────────────────────┐
│        notification             │       │        admin_user           │
│─────────────────────────────────│       │─────────────────────────────│
│ PK  id              UUID        │       │ PK  id            UUID      │
│ FK  user_id         UUID        │       │     email         VARCHAR   │
│     type            VARCHAR(30) │       │     password_hash VARCHAR   │
│     channel         VARCHAR(20) │       │     full_name     VARCHAR   │
│     title           VARCHAR(200)│       │     role          VARCHAR   │
│     content         TEXT        │       │     permissions   JSONB     │
│     metadata        JSONB       │       │     status        VARCHAR   │
│     is_read         BOOLEAN     │       │     last_login_at TIMESTAMP │
│     read_at         TIMESTAMP   │       │     created_at    TIMESTAMP │
│     sent_at         TIMESTAMP   │       │     updated_at    TIMESTAMP │
│     created_at      TIMESTAMP   │       └─────────────────────────────┘
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         audit_log               │
│─────────────────────────────────│
│ PK  id              UUID        │
│     user_id         UUID        │
│     user_type       VARCHAR(20) │ (customer/admin)
│     action          VARCHAR(50) │
│     entity_type     VARCHAR(50) │
│     entity_id       UUID        │
│     old_data        JSONB       │
│     new_data        JSONB       │
│     ip_address      VARCHAR(45) │
│     user_agent      TEXT        │
│     created_at      TIMESTAMP   │
└─────────────────────────────────┘
```

---

## 4. Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| category → product | 1:N | Một category chứa nhiều product |
| insurer → product | 1:N | Một insurer cung cấp nhiều product |
| customer → quote | 1:N | Một customer có nhiều quote |
| customer → policy | 1:N | Một customer sở hữu nhiều policy |
| customer → payment | 1:N | Một customer có nhiều payment |
| product → quote | 1:N | Một product có nhiều quote |
| product → policy | 1:N | Một product được dùng trong nhiều policy |
| insurer → policy | 1:N | Một insurer phát hành nhiều policy |
| policy → claim | 1:N | Một policy có nhiều claim |
| policy → payment | 1:N | Một policy có nhiều payment |
| policy → beneficiary | 1:N | Một policy có nhiều beneficiary |
| policy → endorsement | 1:N | Một policy có nhiều endorsement |
| claim → claim_document | 1:N | Một claim có nhiều document |
| claim → claim_note | 1:N | Một claim có nhiều note |
| claim → claim_timeline | 1:N | Một claim có nhiều status change |
| customer → customer_family_member | 1:N | Một customer có nhiều family member |
| insurer → reconciliation | 1:N | Một insurer có nhiều reconciliation period |
| category → category (self) | 1:N | Category tree (parent-child) |

---

## 5. Cardinality Rules

### Mandatory (NOT NULL FK)
- `product.category_id` - Mọi product phải thuộc 1 category
- `product.insurer_id` - Mọi product phải thuộc 1 insurer
- `policy.customer_id` - Mọi policy phải thuộc 1 customer
- `policy.product_id` - Mọi policy phải liên kết 1 product
- `policy.insurer_id` - Mọi policy phải thuộc 1 insurer
- `claim.policy_id` - Mọi claim phải thuộc 1 policy
- `claim.customer_id` - Mọi claim phải thuộc 1 customer
- `payment.customer_id` - Mọi payment phải thuộc 1 customer
- `beneficiary.policy_id` - Mọi beneficiary phải thuộc 1 policy

### Optional (NULLABLE FK)
- `quote.customer_id` - Guest user có thể tạo quote không cần account
- `policy.quote_id` - Policy có thể tạo không qua quote
- `claim.handler_id` - Claim ban đầu chưa assign handler
- `quote.converted_policy_id` - Quote chưa convert thì NULL

---

## 6. ERD Conventions

| Convention | Rule |
|---|---|
| Primary Key | UUID v4, column name: `id` |
| Foreign Key | Tên format: `{referenced_table}_id` |
| Timestamps | Mọi table có `created_at`, `updated_at` |
| Soft Delete | Tables chính dùng `deleted_at` (nullable TIMESTAMP) |
| Status Fields | VARCHAR(20-30), dùng application-level enum |
| Money Fields | BIGINT (đơn vị: VND, không decimal) |
| JSON Data | JSONB cho flexible/nested data |
| Naming | snake_case cho tất cả tables và columns |
