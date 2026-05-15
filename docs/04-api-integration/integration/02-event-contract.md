# Event Contract - Hợp Đồng Sự Kiện

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Event Schema Version | 1.0 |
| Serialization | JSON (UTF-8) |
| Naming Convention | `domain.entity.action` (lowercase, dot-separated) |

---

## 1. Tổng quan

### 1.1. Event-Driven Architecture

Insurance System sử dụng Event-Driven Architecture (EDA) để:
- Giảm coupling giữa các services
- Hỗ trợ async processing
- Cho phép event replay & audit trail
- Scale độc lập từng service

### 1.2. Event Categories

| Category | Mô tả | Consumers |
|----------|--------|-----------|
| **Domain Events** | Business logic events (nội bộ) | Internal services |
| **Integration Events** | Cross-service communication | Other microservices |
| **Notification Events** | Trigger notifications | Notification service |
| **Webhook Events** | External partner notifications | Partner systems |
| **Audit Events** | Logging & compliance | Audit service |

### 1.3. Event Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Producer   │────▶│  Message     │────▶│   Consumer(s)   │
│  Service    │     │  Broker      │     │                 │
│             │     │  (RabbitMQ)  │     │  - Service A    │
│  policy.srv │     │              │     │  - Service B    │
│  claim.srv  │     │  Exchange    │     │  - Webhook.srv  │
│  payment.srv│     │  → Queues    │     │  - Notify.srv   │
└─────────────┘     └──────────────┘     └─────────────────┘
```

---

## 2. Event Envelope (Standard Format)

### 2.1. Schema

Tất cả events PHẢI tuân theo envelope format sau:

```json
{
  "$schema": "https://insurance-system.vn/schemas/event-envelope-v1.json",
  "event_id": "string (UUID v4)",
  "event_type": "string (domain.entity.action)",
  "event_version": "string (semver: 1.0.0)",
  "source": "string (service name)",
  "timestamp": "string (ISO 8601 with timezone)",
  "correlation_id": "string (UUID, trace across services)",
  "causation_id": "string (UUID, event that caused this event)",
  "actor": {
    "type": "string (user|system|partner|admin)",
    "id": "string (actor ID)"
  },
  "data": {},
  "metadata": {
    "environment": "string (production|staging|development)",
    "tenant_id": "string (for multi-tenancy, future)",
    "trace_id": "string (distributed tracing)",
    "schema_url": "string (link to JSON schema)"
  }
}
```

### 2.2. Field Specifications

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `event_id` | UUID v4 | ✅ | Globally unique ID cho mỗi event |
| `event_type` | string | ✅ | Format: `domain.entity.action` |
| `event_version` | semver | ✅ | Schema version của event data |
| `source` | string | ✅ | Service gốc phát event |
| `timestamp` | ISO 8601 | ✅ | Thời điểm event xảy ra |
| `correlation_id` | UUID | ✅ | Trace ID xuyên suốt flow |
| `causation_id` | UUID | ⬜ | ID event gây ra event này |
| `actor` | object | ✅ | Ai/gì trigger event |
| `data` | object | ✅ | Event-specific payload |
| `metadata` | object | ⬜ | Thông tin bổ sung |

---

## 3. Domain Events Registry

### 3.1. Customer Domain

#### `customer.account.created`
```json
{
  "event_type": "customer.account.created",
  "event_version": "1.0.0",
  "source": "customer-service",
  "data": {
    "customer_id": "uuid",
    "email": "user@example.com",
    "phone": "+84901234567",
    "full_name": "Nguyễn Văn A",
    "registration_source": "web|mobile|api",
    "registration_method": "email|social_google|social_facebook"
  }
}
```

#### `customer.kyc.completed`
```json
{
  "event_type": "customer.kyc.completed",
  "event_version": "1.0.0",
  "source": "kyc-service",
  "data": {
    "customer_id": "uuid",
    "kyc_status": "verified|rejected",
    "id_type": "cccd|cmnd|passport",
    "id_number_masked": "079***1234",
    "verified_at": "2026-05-15T10:30:00Z",
    "rejection_reason": null
  }
}
```

#### `customer.profile.updated`
```json
{
  "event_type": "customer.profile.updated",
  "event_version": "1.0.0",
  "source": "customer-service",
  "data": {
    "customer_id": "uuid",
    "changed_fields": ["address", "phone"],
    "updated_at": "2026-05-15T10:30:00Z"
  }
}
```

---

### 3.2. Quotation Domain

#### `quotation.quote.requested`
```json
{
  "event_type": "quotation.quote.requested",
  "event_version": "1.0.0",
  "source": "quote-service",
  "data": {
    "quote_id": "uuid",
    "customer_id": "uuid|null",
    "product_type": "motor|health|life|travel|property",
    "insurers_requested": ["insurer_uuid_1", "insurer_uuid_2"],
    "requested_at": "2026-05-15T10:30:00Z"
  }
}
```

#### `quotation.quote.generated`
```json
{
  "event_type": "quotation.quote.generated",
  "event_version": "1.0.0",
  "source": "quote-service",
  "data": {
    "quote_id": "uuid",
    "customer_id": "uuid|null",
    "product_type": "health",
    "results_count": 4,
    "lowest_premium": { "amount": 3500000, "currency": "VND" },
    "highest_premium": { "amount": 12000000, "currency": "VND" },
    "valid_until": "2026-06-14T10:30:00Z"
  }
}
```

#### `quotation.quote.expired`
```json
{
  "event_type": "quotation.quote.expired",
  "event_version": "1.0.0",
  "source": "quote-service",
  "data": {
    "quote_id": "uuid",
    "customer_id": "uuid",
    "product_type": "health",
    "expired_at": "2026-06-14T10:30:00Z"
  }
}
```

---

### 3.3. Policy Domain

#### `policy.policy.created`
```json
{
  "event_type": "policy.policy.created",
  "event_version": "1.0.0",
  "source": "policy-service",
  "data": {
    "policy_id": "uuid",
    "policy_number": "POL-2026-00001",
    "customer_id": "uuid",
    "product_id": "uuid",
    "insurer_id": "uuid",
    "quote_id": "uuid",
    "status": "active",
    "effective_date": "2026-06-01",
    "expiry_date": "2027-06-01",
    "premium": { "amount": 8500000, "currency": "VND" },
    "sum_insured": { "amount": 500000000, "currency": "VND" },
    "payment_frequency": "annual"
  }
}
```

#### `policy.policy.activated`
```json
{
  "event_type": "policy.policy.activated",
  "event_version": "1.0.0",
  "source": "policy-service",
  "data": {
    "policy_id": "uuid",
    "policy_number": "POL-2026-00001",
    "activated_at": "2026-06-01T00:00:00Z"
  }
}
```

#### `policy.policy.renewed`
```json
{
  "event_type": "policy.policy.renewed",
  "event_version": "1.0.0",
  "source": "policy-service",
  "data": {
    "old_policy_id": "uuid",
    "new_policy_id": "uuid",
    "new_policy_number": "POL-2026-00025",
    "customer_id": "uuid",
    "effective_date": "2027-06-01",
    "expiry_date": "2028-06-01",
    "new_premium": { "amount": 9000000, "currency": "VND" },
    "renewal_type": "auto|manual"
  }
}
```

#### `policy.policy.cancelled`
```json
{
  "event_type": "policy.policy.cancelled",
  "event_version": "1.0.0",
  "source": "policy-service",
  "data": {
    "policy_id": "uuid",
    "policy_number": "POL-2026-00001",
    "customer_id": "uuid",
    "cancelled_at": "2026-07-15T10:00:00Z",
    "reason": "customer_request|non_payment|fraud",
    "refund_eligible": true,
    "refund_amount": { "amount": 4250000, "currency": "VND" }
  }
}
```

#### `policy.policy.lapsed`
```json
{
  "event_type": "policy.policy.lapsed",
  "event_version": "1.0.0",
  "source": "policy-service",
  "data": {
    "policy_id": "uuid",
    "policy_number": "POL-2026-00001",
    "customer_id": "uuid",
    "lapsed_at": "2026-08-01T00:00:00Z",
    "last_payment_date": "2026-06-01",
    "overdue_amount": { "amount": 8500000, "currency": "VND" }
  }
}
```

#### `policy.premium.due`
```json
{
  "event_type": "policy.premium.due",
  "event_version": "1.0.0",
  "source": "policy-service",
  "data": {
    "policy_id": "uuid",
    "policy_number": "POL-2026-00001",
    "customer_id": "uuid",
    "due_date": "2027-01-01",
    "amount": { "amount": 8500000, "currency": "VND" },
    "days_until_due": 30,
    "auto_debit_enabled": true
  }
}
```

---

### 3.4. Claims Domain

#### `claims.claim.submitted`
```json
{
  "event_type": "claims.claim.submitted",
  "event_version": "1.0.0",
  "source": "claims-service",
  "data": {
    "claim_id": "uuid",
    "claim_number": "CLM-2026-00001",
    "policy_id": "uuid",
    "customer_id": "uuid",
    "insurer_id": "uuid",
    "type": "health|motor|property|travel|death",
    "event_date": "2026-05-10",
    "claimed_amount": { "amount": 15000000, "currency": "VND" },
    "documents_count": 3
  }
}
```

#### `claims.claim.assigned`
```json
{
  "event_type": "claims.claim.assigned",
  "event_version": "1.0.0",
  "source": "claims-service",
  "data": {
    "claim_id": "uuid",
    "claim_number": "CLM-2026-00001",
    "handler_id": "uuid",
    "handler_name": "Trần Văn D",
    "priority": "low|medium|high|critical",
    "assigned_at": "2026-05-15T11:00:00Z"
  }
}
```

#### `claims.claim.decided`
```json
{
  "event_type": "claims.claim.decided",
  "event_version": "1.0.0",
  "source": "claims-service",
  "data": {
    "claim_id": "uuid",
    "claim_number": "CLM-2026-00001",
    "policy_id": "uuid",
    "customer_id": "uuid",
    "decision": "approved|partially_approved|rejected",
    "claimed_amount": { "amount": 15000000, "currency": "VND" },
    "approved_amount": { "amount": 12000000, "currency": "VND" },
    "deductible_applied": { "amount": 2000000, "currency": "VND" },
    "reason": "Trong phạm vi bảo hiểm",
    "decided_at": "2026-05-20T10:00:00Z",
    "decided_by": "uuid"
  }
}
```

#### `claims.claim.settled`
```json
{
  "event_type": "claims.claim.settled",
  "event_version": "1.0.0",
  "source": "claims-service",
  "data": {
    "claim_id": "uuid",
    "claim_number": "CLM-2026-00001",
    "settlement_amount": { "amount": 10000000, "currency": "VND" },
    "bank_transfer_ref": "VCB_20260522_001",
    "settled_at": "2026-05-22T14:00:00Z"
  }
}
```

---

### 3.5. Payment Domain

#### `payment.transaction.initiated`
```json
{
  "event_type": "payment.transaction.initiated",
  "event_version": "1.0.0",
  "source": "payment-service",
  "data": {
    "transaction_id": "uuid",
    "reference_number": "TXN-2026051500001",
    "type": "premium_payment|renewal|refund|claim_settlement",
    "amount": { "amount": 8500000, "currency": "VND" },
    "payment_method": "vnpay|momo|zalopay|bank_card|bank_transfer",
    "customer_id": "uuid",
    "policy_id": "uuid",
    "initiated_at": "2026-05-15T10:30:00Z"
  }
}
```

#### `payment.transaction.completed`
```json
{
  "event_type": "payment.transaction.completed",
  "event_version": "1.0.0",
  "source": "payment-service",
  "data": {
    "transaction_id": "uuid",
    "reference_number": "TXN-2026051500001",
    "status": "success",
    "amount": { "amount": 8500000, "currency": "VND" },
    "gateway_reference": "VNP_12345678",
    "completed_at": "2026-05-15T10:31:00Z"
  }
}
```

#### `payment.transaction.failed`
```json
{
  "event_type": "payment.transaction.failed",
  "event_version": "1.0.0",
  "source": "payment-service",
  "data": {
    "transaction_id": "uuid",
    "reference_number": "TXN-2026051500001",
    "amount": { "amount": 8500000, "currency": "VND" },
    "failure_reason": "insufficient_funds|card_declined|timeout|gateway_error",
    "gateway_error_code": "51",
    "failed_at": "2026-05-15T10:31:00Z"
  }
}
```

#### `payment.refund.processed`
```json
{
  "event_type": "payment.refund.processed",
  "event_version": "1.0.0",
  "source": "payment-service",
  "data": {
    "refund_id": "uuid",
    "original_transaction_id": "uuid",
    "amount": { "amount": 4250000, "currency": "VND" },
    "reason": "policy_cancelled|overcharge|claim_settlement",
    "refund_method": "original_method|bank_transfer",
    "processed_at": "2026-05-16T09:00:00Z"
  }
}
```

---

## 4. Event Schema Evolution

### 4.1. Versioning Rules

| Rule | Mô tả | Version Change |
|------|--------|----------------|
| Add optional field | Thêm field mới (nullable/optional) | MINOR (1.0 → 1.1) |
| Add required field | Thêm field bắt buộc | MAJOR (1.0 → 2.0) |
| Remove field | Xóa field | MAJOR |
| Rename field | Đổi tên field | MAJOR |
| Change field type | int → string | MAJOR |
| Change enum values | Thêm value | MINOR; Xóa value | MAJOR |

### 4.2. Backward Compatibility

- **Consumers PHẢI** ignore unknown fields
- **Producers KHÔNG ĐƯỢC** remove fields trong cùng major version
- Multiple versions có thể coexist trên cùng message broker

### 4.3. Schema Registry

```
GET /api/v1/schemas/events/{event_type}/{version}
```

Trả về JSON Schema cho event cụ thể.

---

## 5. Event Ordering & Guarantees

### 5.1. Ordering Guarantees

| Scope | Guarantee |
|-------|-----------|
| Per-entity (same object_id) | ✅ Ordered (via partition key) |
| Cross-entity | ❌ No ordering guarantee |
| Cross-service | ❌ No ordering guarantee |

### 5.2. Delivery Guarantees

| Guarantee | Level |
|-----------|-------|
| At-least-once | ✅ Guaranteed (consumers must be idempotent) |
| Exactly-once | ❌ Not guaranteed (use idempotency keys) |
| At-most-once | ❌ Not applicable |

### 5.3. Idempotency Contract

Consumers PHẢI:
1. Track processed `event_id` values
2. Skip duplicate events (same `event_id`)
3. Handle out-of-order events (use `timestamp` or `sequence_number`)

---

## 6. Event Naming Convention

### 6.1. Format

```
{domain}.{entity}.{action}
```

| Component | Rule | Examples |
|-----------|------|----------|
| domain | Bounded context name (singular, lowercase) | `customer`, `policy`, `claims`, `payment` |
| entity | Entity/aggregate name (singular, lowercase) | `account`, `policy`, `claim`, `transaction` |
| action | Past tense verb (lowercase) | `created`, `updated`, `deleted`, `submitted` |

### 6.2. Allowed Actions

| Action | Mô tả |
|--------|--------|
| `created` | Entity mới được tạo |
| `updated` | Entity được cập nhật |
| `deleted` | Entity bị xóa |
| `activated` | Entity được kích hoạt |
| `deactivated` | Entity bị vô hiệu |
| `submitted` | Được submit (claims, applications) |
| `approved` | Được phê duyệt |
| `rejected` | Bị từ chối |
| `completed` | Hoàn thành |
| `failed` | Thất bại |
| `expired` | Hết hạn |
| `cancelled` | Bị hủy |
| `assigned` | Được giao cho ai |
| `settled` | Được thanh toán/giải quyết |

---

## 7. Consumer Contract

### 7.1. Consumer Responsibilities

| # | Responsibility | Mô tả |
|---|---------------|--------|
| 1 | Idempotent processing | Handle duplicate events |
| 2 | Graceful unknown events | Ignore event types không recognize |
| 3 | Graceful unknown fields | Ignore fields không recognize |
| 4 | Error handling | Dead-letter queue cho unprocessable events |
| 5 | Acknowledgment | Ack after successful processing only |
| 6 | Monitoring | Track processing lag, failure rate |

### 7.2. Dead Letter Queue (DLQ)

Events không xử lý được sau max retries → DLQ:
- Max consumer retries: 3
- DLQ retention: 14 days
- Alert khi DLQ size > threshold
- Manual review & replay từ DLQ
