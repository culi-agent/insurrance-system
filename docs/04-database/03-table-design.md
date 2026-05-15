# Table Design - Thiết Kế Bảng Chi Tiết

---

## 1. Tổng quan

Tài liệu này mô tả chi tiết thiết kế từng bảng bao gồm: mục đích, design decisions, constraints, relationships, và các patterns được áp dụng.

---

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| UUID Primary Keys | Sử dụng UUID v4 thay vì auto-increment để hỗ trợ distributed system |
| Soft Delete | Các entity quan trọng dùng `deleted_at` thay vì xóa vật lý |
| JSONB for Flexibility | Dữ liệu dynamic/nested lưu JSONB, tối ưu query với GIN index |
| Money as BIGINT | Tiền tệ VND lưu dạng BIGINT (không decimal), tránh floating point |
| Timestamps with TZ | Mọi timestamp đều có timezone (TIMESTAMP WITH TIME ZONE) |
| Immutable Audit | Bảng audit_log chỉ INSERT, không UPDATE/DELETE |
| Status Machine | Các entity có lifecycle dùng status field + history table |

---

## 3. Table Details

### 3.1. customer

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lưu thông tin khách hàng đăng ký trên platform |
| **Estimated Size** | 100K rows (Year 1), 2M rows (Year 3) |
| **Avg Row Size** | ~1.5 KB |
| **Access Pattern** | Read-heavy (profile view), Write (registration, update) |
| **Partitioning** | None (Year 1), Range by created_at (Year 3+) |
| **Soft Delete** | Yes (`deleted_at`) |
| **Audit** | Yes (all changes logged) |

**Design Decisions:**
1. `address` dùng JSONB vì cấu trúc địa chỉ VN phức tạp (ward/district/city)
2. `kyc_data` lưu raw OCR response để audit trail
3. `email` và `phone` đều UNIQUE - hai kênh xác thực chính
4. `password_hash` lưu bcrypt hash (12 rounds)
5. Soft delete để preserve data integrity cho policies/claims đã liên kết

**JSONB Structure - address:**
```json
{
  "street": "123 Nguyễn Huệ",
  "ward": "Phường Bến Nghé",
  "district": "Quận 1",
  "city": "TP. Hồ Chí Minh",
  "country": "VN",
  "postal_code": "700000"
}
```

**Status Transitions:**
```
active → suspended (admin action)
active → inactive (user deactivate)
active → deleted (soft delete)
suspended → active (admin unlock)
inactive → active (user reactivate)
```

---

### 3.2. product

| Attribute | Value |
|-----------|-------|
| **Purpose** | Sản phẩm bảo hiểm từ các đối tác insurer |
| **Estimated Size** | 200 rows (Year 1), 1000 rows (Year 3) |
| **Avg Row Size** | ~5 KB (do JSONB benefits/pricing) |
| **Access Pattern** | Read-heavy (catalog browsing, search) |
| **Cache Strategy** | Redis cache 5 min TTL, invalidate on update |
| **Soft Delete** | No (dùng status = archived) |

**Design Decisions:**
1. `benefits` và `exclusions` dùng JSONB array vì structure khác nhau theo product type
2. `pricing_rules` là JSONB complex object chứa formula tính premium
3. `eligibility` chứa điều kiện đủ điều kiện mua
4. `slug` UNIQUE để SEO-friendly URLs
5. `rating` và `total_sold` denormalized để tránh JOIN khi listing

**JSONB Structure - benefits:**
```json
[
  {
    "name": "Tử vong do tai nạn",
    "description": "Chi trả 100% STBH khi tử vong do tai nạn",
    "coverage_amount": 100000000,
    "max_per_event": null,
    "waiting_period_days": 0,
    "conditions": ["Tai nạn xảy ra trong thời hạn BH"]
  }
]
```

**JSONB Structure - pricing_rules:**
```json
{
  "base_rate": 350000,
  "currency": "VND",
  "rating_factors": [
    {"factor": "age", "ranges": [{"min": 18, "max": 30, "multiplier": 1.0}, {"min": 31, "max": 45, "multiplier": 1.3}]},
    {"factor": "gender", "values": [{"value": "male", "multiplier": 1.1}, {"value": "female", "multiplier": 1.0}]},
    {"factor": "smoking", "values": [{"value": true, "multiplier": 1.5}]}
  ],
  "discounts": [
    {"type": "no_claim", "years": 1, "percentage": 10},
    {"type": "annual_payment", "percentage": 5}
  ],
  "loadings": [
    {"condition": "high_risk_occupation", "percentage": 20}
  ]
}
```

---

### 3.3. policy

| Attribute | Value |
|-----------|-------|
| **Purpose** | Hợp đồng bảo hiểm đã phát hành |
| **Estimated Size** | 50K rows (Year 1), 1M rows (Year 3) |
| **Avg Row Size** | ~3 KB |
| **Access Pattern** | Read (dashboard, detail), Write (issuance, status change) |
| **Partitioning** | Range by created_at (khi > 500K rows) |
| **Retention** | 10 years after expiry |
| **Audit** | Yes (mọi thay đổi) |

**Design Decisions:**
1. `policy_number` format: `POL-{YYYYMM}-{sequential}` (e.g., POL-202601-000001)
2. `coverage_details` JSONB thay vì normalized tables vì mỗi product có structure khác nhau
3. `insured_persons` JSONB array cho trường hợp mua cho nhiều người
4. `next_due_date` denormalized để dễ query payment reminders
5. Không soft delete - dùng status lifecycle (cancelled/expired/lapsed)

**Status Transitions:**
```
pending → active (payment confirmed)
pending → cancelled (timeout/user cancel)
active → expired (end_date passed)
active → cancelled (user request + refund)
active → lapsed (payment overdue > grace period)
active → renewed (renewal payment success)
lapsed → active (late payment within window)
```

**Policy Number Generation:**
```
Format: POL-{YYYYMM}-{6-digit-sequence}
Example: POL-202601-000042
Uniqueness: Guaranteed by DB sequence + UNIQUE constraint
```

---

### 3.4. claim

| Attribute | Value |
|-----------|-------|
| **Purpose** | Yêu cầu bồi thường từ khách hàng |
| **Estimated Size** | 10K rows (Year 1), 100K rows (Year 3) |
| **Avg Row Size** | ~2 KB |
| **Access Pattern** | Write (submit), Read (tracking, processing) |
| **SLA Tracking** | Via claim_status_history timestamps |
| **Retention** | 10 years after settlement |

**Design Decisions:**
1. `claim_number` format: `CLM-{YYYYMM}-{sequential}`
2. Tách `claim_document` thành table riêng (1:N) thay vì JSONB vì cần verify/manage riêng
3. `bank_account` JSONB vì chỉ dùng khi settlement
4. `handler_id` nullable - ban đầu auto-assign sau
5. Financial fields tách rõ: claimed → assessed → approved → deductible → net

**Claim Number Generation:**
```
Format: CLM-{YYYYMM}-{6-digit-sequence}
Example: CLM-202603-000015
```

**Status Machine (Full):**
```
submitted → assigned (auto, 4h SLA)
assigned → documents_review (handler starts)
documents_review → additional_info_required (need more docs)
additional_info_required → documents_review (customer provides)
documents_review → under_assessment (docs complete)
under_assessment → approved (full approval)
under_assessment → partially_approved (partial)
under_assessment → rejected (decline)
approved → payment_processing (initiate transfer)
partially_approved → payment_processing (customer accepts)
partially_approved → appealed (customer appeals)
payment_processing → settled (transfer success)
settled → closed (final)
rejected → closed (no appeal)
rejected → appealed (customer appeals)
appealed → under_assessment (re-review)
```



---

### 3.5. payment

| Attribute | Value |
|-----------|-------|
| **Purpose** | Ghi nhận mọi giao dịch thanh toán |
| **Estimated Size** | 100K rows (Year 1), 2M rows (Year 3) |
| **Avg Row Size** | ~1.5 KB |
| **Access Pattern** | Write (create), Read (history, reconciliation) |
| **Idempotency** | `reference_number` UNIQUE prevent double charge |
| **Retention** | 7 years |

**Design Decisions:**
1. `reference_number` format: `PAY-{timestamp}-{random}` đảm bảo idempotent
2. `gateway_response` JSONB lưu raw response từ VNPay/Momo/ZaloPay
3. `type` phân biệt: premium_payment, renewal, refund, claim_settlement
4. `expires_at` cho pending payments (15 min timeout)
5. `retry_count` track auto-retry cho recurring payments
6. Không soft delete - payment records là immutable sau khi success

**Payment Flow States:**
```
pending → processing (gateway called)
processing → success (gateway confirms)
processing → failed (gateway rejects/timeout)
success → refunded (refund processed)
pending → expired (timeout 15 min)
```

**Reference Number Format:**
```
Premium: PAY-PRM-{timestamp}-{random4}
Renewal: PAY-RNW-{timestamp}-{random4}
Refund:  PAY-RFD-{timestamp}-{random4}
Settlement: PAY-STL-{timestamp}-{random4}
```

---

### 3.6. quote

| Attribute | Value |
|-----------|-------|
| **Purpose** | Lưu báo giá cho khách hàng |
| **Estimated Size** | 500K rows (Year 1) |
| **Avg Row Size** | ~2 KB |
| **Access Pattern** | Write (generate), Read (view/compare) |
| **TTL** | 30 days (auto-expire) |
| **Retention** | 90 days then delete |

**Design Decisions:**
1. `customer_id` nullable - cho phép guest tạo quote không cần đăng ký
2. `input_data` JSONB lưu toàn bộ form input để reproduce quote
3. `valid_until` = created_at + 30 days
4. `converted_policy_id` link khi quote → policy
5. High volume table, cần periodic cleanup (cron delete expired > 90 days)

**Quote Number Format:**
```
Format: QUO-{YYYYMMDD}-{random6}
Example: QUO-20260115-A3F9K2
```

---

### 3.7. insurer

| Attribute | Value |
|-----------|-------|
| **Purpose** | Thông tin công ty bảo hiểm đối tác |
| **Estimated Size** | 20 rows (Year 1), 50 rows (Year 3) |
| **Avg Row Size** | ~2 KB |
| **Access Pattern** | Read-heavy (join với product/policy) |
| **Cache Strategy** | Redis cache, invalidate on update |

**Design Decisions:**
1. `code` UNIQUE short identifier (e.g., "BVL" = Bảo Việt Life)
2. `api_config` JSONB chứa credentials + endpoints (encrypted at application level)
3. `commission_rate` JSONB map product_type → percentage
4. Small table, frequently joined → cache aggressively

**JSONB Structure - api_config:**
```json
{
  "base_url": "https://api.partner.com/v1",
  "sandbox_url": "https://sandbox.partner.com/v1",
  "api_key": "encrypted_value",
  "api_secret": "encrypted_value",
  "timeout_ms": 5000,
  "retry_count": 3,
  "supported_operations": ["quote", "issue", "cancel", "claim_status"]
}
```

**JSONB Structure - commission_rate:**
```json
{
  "motor_compulsory": 15.0,
  "motor_comprehensive": 22.5,
  "health_individual": 25.0,
  "health_group": 18.0,
  "life": 35.0,
  "travel": 30.0
}
```

---

### 3.8. notification

| Attribute | Value |
|-----------|-------|
| **Purpose** | Thông báo đa kênh cho người dùng |
| **Estimated Size** | 1M rows (Year 1) |
| **Avg Row Size** | ~0.5 KB |
| **Access Pattern** | Write (bulk insert), Read (user inbox) |
| **Retention** | 90 days then delete |
| **Partitioning** | Range by created_at (monthly) |

**Design Decisions:**
1. `user_type` phân biệt customer vs admin notifications
2. Một notification record per channel (email + sms = 2 records)
3. `metadata` JSONB chứa template variables + delivery info
4. High volume → partition by month, auto-drop partitions > 90 days
5. `sent_at` vs `created_at`: created = queued, sent = delivered

---

### 3.9. audit_log

| Attribute | Value |
|-----------|-------|
| **Purpose** | Ghi nhận mọi thao tác write để compliance |
| **Estimated Size** | 2M rows (Year 1) |
| **Avg Row Size** | ~2 KB (with old_data/new_data) |
| **Access Pattern** | Write-only (append), Read (investigation) |
| **Retention** | 5 years |
| **Partitioning** | Range by created_at (monthly) |

**Design Decisions:**
1. Immutable - chỉ INSERT, không cho phép UPDATE/DELETE
2. `old_data` và `new_data` JSONB để diff changes
3. `entity_type` + `entity_id` cho phép trace history per entity
4. Highest volume table → partition mandatory
5. No FK constraints → tránh cascade issues, performance

**Immutability Enforcement:**
```sql
-- Prevent UPDATE/DELETE on audit_log
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
```

---

## 4. Cross-Cutting Patterns

### 4.1. Soft Delete Pattern

Áp dụng cho: `customer`

```sql
-- Query chỉ lấy active records
SELECT * FROM customer WHERE deleted_at IS NULL;

-- Partial index cho performance
CREATE INDEX idx_customer_active ON customer(id) WHERE deleted_at IS NULL;
```

### 4.2. Status History Pattern

Áp dụng cho: `claim` (claim_status_history), extensible cho `policy`

```sql
-- Ghi lại mọi status change
INSERT INTO claim_status_history (claim_id, status_from, status_to, changed_by, note)
VALUES ($1, $2, $3, $4, $5);

-- Query SLA: time in each status
SELECT 
    status_to,
    created_at - LAG(created_at) OVER (PARTITION BY claim_id ORDER BY created_at) as duration
FROM claim_status_history
WHERE claim_id = $1;
```

### 4.3. Optimistic Locking

Áp dụng cho: `policy`, `claim`, `payment`

```sql
-- Application level: check updated_at before update
UPDATE policy 
SET status = 'cancelled', updated_at = NOW()
WHERE id = $1 AND updated_at = $2;
-- If affected_rows = 0 → concurrent modification detected
```

### 4.4. Number Generation

```sql
-- Sequence for policy numbers
CREATE SEQUENCE policy_number_seq START 1 INCREMENT 1;

-- Sequence for claim numbers
CREATE SEQUENCE claim_number_seq START 1 INCREMENT 1;

-- Generate formatted number
CREATE OR REPLACE FUNCTION generate_policy_number()
RETURNS VARCHAR(30) AS $$
DECLARE
    seq_val BIGINT;
    year_month VARCHAR(6);
BEGIN
    seq_val := nextval('policy_number_seq');
    year_month := to_char(NOW(), 'YYYYMM');
    RETURN 'POL-' || year_month || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS VARCHAR(30) AS $$
DECLARE
    seq_val BIGINT;
    year_month VARCHAR(6);
BEGIN
    seq_val := nextval('claim_number_seq');
    year_month := to_char(NOW(), 'YYYYMM');
    RETURN 'CLM-' || year_month || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Table Relationship Matrix

| Table | References (FK to) | Referenced By (FK from) |
|-------|-------------------|------------------------|
| customer | - | quote, policy, payment, claim, customer_family_member, customer_social_account |
| category | category (self) | product |
| insurer | - | product, quote, policy, reconciliation |
| product | category, insurer | quote, policy |
| quote | customer, product, insurer | policy |
| policy | customer, product, insurer, quote | claim, payment, beneficiary, endorsement, policy_document |
| claim | policy, customer, admin_user | claim_document, claim_note, claim_status_history, payment |
| payment | policy, customer, claim | - |
| beneficiary | policy | - |
| endorsement | policy | - |
| admin_user | - | claim |
| notification | - | - |
| audit_log | - | - |
| session | - | - |
| otp_verification | - | - |
| reconciliation | insurer | - |
