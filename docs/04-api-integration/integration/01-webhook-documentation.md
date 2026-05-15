# Webhook Documentation - Tài Liệu Webhook

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Webhook Version | 1.0 |
| Protocol | HTTPS (TLS 1.2+) |
| Format | JSON |
| Retry Policy | Exponential backoff, max 5 retries |

---

## 1. Tổng quan

### 1.1. Webhook là gì?

Webhook cho phép hệ thống Insurance System gửi thông báo real-time đến server của đối tác (insurer, payment provider, third-party) khi có sự kiện xảy ra. Thay vì polling API liên tục, partner nhận push notification ngay khi event phát sinh.

### 1.2. Kiến trúc

```
┌──────────────────┐         ┌──────────────────┐
│  Insurance       │  POST   │  Partner         │
│  System          │────────▶│  Webhook Server  │
│                  │  JSON   │                  │
│  (Event Source)  │◀────────│  (HTTP 200 OK)   │
│                  │  ACK    │                  │
└──────────────────┘         └──────────────────┘
        │                            │
        │  Retry (if failed)         │
        │───────────────────────────▶│
        │                            │
```

### 1.3. Đăng ký Webhook

Partners đăng ký webhook qua:
- **Admin Portal**: Settings → Webhooks → Add Endpoint
- **API**: `POST /api/v1/webhooks/endpoints`

---

## 2. Webhook Events

### 2.1. Danh sách Events

| Category | Event | Trigger | Mô tả |
|----------|-------|---------|--------|
| **Policy** | `policy.created` | Hợp đồng được tạo | Sau khi thanh toán thành công |
| **Policy** | `policy.activated` | Hợp đồng active | Khi effective_date bắt đầu |
| **Policy** | `policy.renewed` | Gia hạn thành công | Sau thanh toán renewal |
| **Policy** | `policy.cancelled` | Hủy hợp đồng | User hoặc admin hủy |
| **Policy** | `policy.lapsed` | Mất hiệu lực | Hết grace period không đóng phí |
| **Policy** | `policy.expiring_soon` | Sắp hết hạn | 30, 14, 7 ngày trước expiry |
| **Claim** | `claim.submitted` | Nộp claim mới | User submit claim |
| **Claim** | `claim.status_changed` | Đổi trạng thái | Mỗi khi status thay đổi |
| **Claim** | `claim.approved` | Claim được duyệt | Approved / Partially approved |
| **Claim** | `claim.rejected` | Claim bị từ chối | Rejected với reason |
| **Claim** | `claim.settled` | Đã chi trả | Tiền đã chuyển |
| **Payment** | `payment.success` | Thanh toán thành công | Giao dịch hoàn tất |
| **Payment** | `payment.failed` | Thanh toán thất bại | Gateway trả về lỗi |
| **Payment** | `payment.refunded` | Hoàn tiền | Refund processed |
| **Payment** | `payment.overdue` | Quá hạn thanh toán | Sau due date |
| **Customer** | `customer.registered` | Đăng ký mới | Account created |
| **Customer** | `customer.kyc_verified` | eKYC hoàn tất | KYC approved |
| **Customer** | `customer.kyc_rejected` | eKYC thất bại | KYC rejected |
| **Quote** | `quote.created` | Báo giá mới | User tạo quote |
| **Quote** | `quote.expired` | Báo giá hết hạn | Sau 30 ngày |
| **Quote** | `quote.converted` | Chuyển thành policy | User mua từ quote |

### 2.2. Event Subscription

Partners có thể subscribe theo:
- **Specific events**: Chỉ nhận events cụ thể
- **Category**: Nhận tất cả events trong category (e.g., `policy.*`)
- **All**: Nhận tất cả events (`*`)

---

## 3. Webhook Payload Format

### 3.1. Standard Payload Structure

```json
{
  "id": "evt_2026051510300001",
  "webhook_version": "1.0",
  "event": "policy.created",
  "created_at": "2026-05-15T10:30:00.000Z",
  "data": {
    "object_type": "policy",
    "object_id": "uuid-string",
    "attributes": { ... }
  },
  "metadata": {
    "partner_id": "uuid-string",
    "environment": "production",
    "idempotency_key": "idem_abc123",
    "sequence_number": 42
  }
}
```

### 3.2. Payload Fields

| Field | Type | Mô tả |
|-------|------|--------|
| `id` | string | Unique event ID (dùng để deduplicate) |
| `webhook_version` | string | Version của webhook format |
| `event` | string | Event type (format: `category.action`) |
| `created_at` | ISO 8601 | Thời điểm event xảy ra |
| `data.object_type` | string | Loại object: policy, claim, payment, customer |
| `data.object_id` | UUID | ID của object liên quan |
| `data.attributes` | object | Chi tiết data (khác nhau theo event) |
| `metadata.partner_id` | UUID | ID partner nhận webhook |
| `metadata.environment` | string | `production` / `staging` |
| `metadata.idempotency_key` | string | Key để prevent duplicate processing |
| `metadata.sequence_number` | integer | Số thứ tự event (ordered per object) |

---

## 4. Event Payloads Chi Tiết

### 4.1. `policy.created`

```json
{
  "id": "evt_2026051510300001",
  "webhook_version": "1.0",
  "event": "policy.created",
  "created_at": "2026-05-15T10:30:00.000Z",
  "data": {
    "object_type": "policy",
    "object_id": "pol_uuid_123",
    "attributes": {
      "policy_number": "POL-2026-00001",
      "customer_id": "cust_uuid_456",
      "product_id": "prod_uuid_789",
      "insurer_id": "ins_uuid_012",
      "status": "active",
      "effective_date": "2026-06-01",
      "expiry_date": "2027-06-01",
      "premium": {
        "amount": 8500000,
        "currency": "VND",
        "frequency": "annual"
      },
      "sum_insured": {
        "amount": 500000000,
        "currency": "VND"
      },
      "insured_persons": [
        {
          "full_name": "Nguyễn Văn A",
          "date_of_birth": "1995-03-15",
          "relationship": "self"
        }
      ]
    }
  },
  "metadata": {
    "partner_id": "partner_uuid",
    "environment": "production",
    "idempotency_key": "idem_pol_001",
    "sequence_number": 1
  }
}
```

### 4.2. `claim.submitted`

```json
{
  "id": "evt_2026051511000001",
  "webhook_version": "1.0",
  "event": "claim.submitted",
  "created_at": "2026-05-15T11:00:00.000Z",
  "data": {
    "object_type": "claim",
    "object_id": "clm_uuid_123",
    "attributes": {
      "claim_number": "CLM-2026-00001",
      "policy_id": "pol_uuid_123",
      "policy_number": "POL-2026-00001",
      "type": "health",
      "status": "submitted",
      "event_date": "2026-05-10",
      "claimed_amount": {
        "amount": 15000000,
        "currency": "VND"
      },
      "description": "Nhập viện điều trị viêm phổi",
      "hospital_name": "Bệnh viện FV",
      "documents_count": 3
    }
  },
  "metadata": {
    "partner_id": "partner_uuid",
    "environment": "production",
    "idempotency_key": "idem_clm_001",
    "sequence_number": 1
  }
}
```

### 4.3. `claim.status_changed`

```json
{
  "id": "evt_2026051614000001",
  "webhook_version": "1.0",
  "event": "claim.status_changed",
  "created_at": "2026-05-16T14:00:00.000Z",
  "data": {
    "object_type": "claim",
    "object_id": "clm_uuid_123",
    "attributes": {
      "claim_number": "CLM-2026-00001",
      "previous_status": "documents_review",
      "new_status": "under_assessment",
      "changed_by": "system",
      "note": "Documents verified, proceeding to assessment"
    }
  },
  "metadata": {
    "partner_id": "partner_uuid",
    "environment": "production",
    "idempotency_key": "idem_clm_status_003",
    "sequence_number": 3
  }
}
```

### 4.4. `payment.success`

```json
{
  "id": "evt_2026051510310001",
  "webhook_version": "1.0",
  "event": "payment.success",
  "created_at": "2026-05-15T10:31:00.000Z",
  "data": {
    "object_type": "transaction",
    "object_id": "txn_uuid_123",
    "attributes": {
      "reference_number": "TXN-2026051500001",
      "type": "premium_payment",
      "amount": {
        "amount": 8500000,
        "currency": "VND"
      },
      "payment_method": "vnpay",
      "gateway_reference": "VNP_12345678",
      "policy_id": "pol_uuid_123",
      "customer_id": "cust_uuid_456",
      "paid_at": "2026-05-15T10:31:00.000Z"
    }
  },
  "metadata": {
    "partner_id": "partner_uuid",
    "environment": "production",
    "idempotency_key": "idem_txn_001",
    "sequence_number": 1
  }
}
```

### 4.5. `claim.approved`

```json
{
  "id": "evt_2026052010000001",
  "webhook_version": "1.0",
  "event": "claim.approved",
  "created_at": "2026-05-20T10:00:00.000Z",
  "data": {
    "object_type": "claim",
    "object_id": "clm_uuid_123",
    "attributes": {
      "claim_number": "CLM-2026-00001",
      "decision": "approved",
      "claimed_amount": { "amount": 15000000, "currency": "VND" },
      "approved_amount": { "amount": 12000000, "currency": "VND" },
      "deductible_applied": { "amount": 2000000, "currency": "VND" },
      "net_settlement": { "amount": 10000000, "currency": "VND" },
      "reason": "Trong phạm vi bảo hiểm, đã trừ miễn thường",
      "settlement_eta": "2026-05-22"
    }
  },
  "metadata": {
    "partner_id": "partner_uuid",
    "environment": "production",
    "idempotency_key": "idem_clm_approved_001",
    "sequence_number": 5
  }
}
```

---

## 5. Security

### 5.1. Webhook Signature

Mỗi webhook request được ký bằng HMAC-SHA256 để verify authenticity:

**Headers:**
```http
POST /webhook/receiver HTTP/1.1
Content-Type: application/json
X-Webhook-ID: evt_2026051510300001
X-Webhook-Timestamp: 1715769000
X-Webhook-Signature: sha256=a1b2c3d4e5f6...
X-Webhook-Secret-Version: v1
```

### 5.2. Signature Verification

**Algorithm:**
```
signature = HMAC-SHA256(
  key: webhook_secret,
  message: "{webhook_id}.{timestamp}.{raw_body}"
)
```

**Verification Steps (TypeScript example):**
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookId: string,
  timestamp: string,
  secret: string
): boolean {
  const signedContent = `${webhookId}.${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedContent)
    .digest('hex');

  const expected = `sha256=${expectedSignature}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### 5.3. Timestamp Validation

- Reject requests với timestamp > 5 phút so với server time
- Prevent replay attacks

### 5.4. IP Whitelist

Webhook requests được gửi từ các IP ranges:

| Environment | IP Range |
|-------------|----------|
| Production | `103.x.x.0/24` (sẽ cung cấp khi onboard) |
| Staging | `103.x.x.0/24` (sẽ cung cấp khi onboard) |

---

## 6. Delivery & Retry Policy

### 6.1. Delivery Requirements

| Yêu cầu | Giá trị |
|----------|---------|
| Timeout | 30 giây per attempt |
| Expected Response | HTTP 2xx (200-299) |
| Max Payload Size | 64 KB |
| Content-Type | `application/json` |

### 6.2. Retry Schedule

Khi endpoint trả về non-2xx hoặc timeout:

| Attempt | Delay | Tổng thời gian |
|---------|-------|----------------|
| 1 (original) | Immediate | 0 |
| 2 (retry 1) | 1 phút | 1 phút |
| 3 (retry 2) | 5 phút | 6 phút |
| 4 (retry 3) | 30 phút | 36 phút |
| 5 (retry 4) | 2 giờ | 2h 36m |
| 6 (retry 5) | 8 giờ | 10h 36m |

**Sau 5 retries thất bại:**
- Event được đánh dấu `failed`
- Alert gửi đến partner contact
- Event có thể replay manual qua dashboard

### 6.3. Response Handling

| Response Code | Hành động |
|---------------|-----------|
| 2xx | ✅ Success, không retry |
| 3xx | ❌ Không follow redirect, retry |
| 4xx (trừ 429) | ❌ Không retry (client error) |
| 429 | ⏳ Retry với backoff (respect Retry-After) |
| 5xx | ⏳ Retry theo schedule |
| Timeout | ⏳ Retry theo schedule |
| Connection error | ⏳ Retry theo schedule |

### 6.4. Idempotency

- Mỗi event có unique `id` (field `id` trong payload)
- Partner PHẢI implement idempotency check dựa trên event `id`
- Cùng event có thể được gửi nhiều lần (retry)
- Partner phải handle duplicate gracefully

---

## 7. Webhook Management API

### 7.1. Đăng ký Endpoint

```
POST /api/v1/webhooks/endpoints
```

**Request:**
```json
{
  "url": "https://partner-api.example.com/webhooks/insurance",
  "events": ["policy.*", "claim.submitted", "payment.success"],
  "secret": null,
  "description": "Production webhook endpoint",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wh_endpoint_uuid",
    "url": "https://partner-api.example.com/webhooks/insurance",
    "events": ["policy.*", "claim.submitted", "payment.success"],
    "secret": "whsec_a1b2c3d4e5f6g7h8i9j0...",
    "active": true,
    "created_at": "2026-05-15T10:00:00.000Z"
  }
}
```

### 7.2. Cập nhật Endpoint

```
PUT /api/v1/webhooks/endpoints/:id
```

### 7.3. Xóa Endpoint

```
DELETE /api/v1/webhooks/endpoints/:id
```

### 7.4. List Endpoints

```
GET /api/v1/webhooks/endpoints
```

### 7.5. Test Endpoint

```
POST /api/v1/webhooks/endpoints/:id/test
```

Gửi test event đến endpoint để verify connectivity.

### 7.6. Event History

```
GET /api/v1/webhooks/events
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| endpoint_id | uuid | Filter theo endpoint |
| event | string | Filter theo event type |
| status | string | `success`, `failed`, `pending` |
| from_date | datetime | Từ ngày |
| to_date | datetime | Đến ngày |

### 7.7. Replay Event

```
POST /api/v1/webhooks/events/:id/replay
```

Gửi lại event đã thất bại.

---

## 8. Best Practices cho Partners

### 8.1. Receiver Implementation

```typescript
// Express.js example
app.post('/webhooks/insurance', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const webhookId = req.headers['x-webhook-id'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const rawBody = req.body; // raw string

  // 1. Verify signature
  if (!verifyWebhookSignature(rawBody, signature, webhookId, timestamp, SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Check timestamp (prevent replay)
  const eventTime = parseInt(timestamp);
  if (Math.abs(Date.now() / 1000 - eventTime) > 300) {
    return res.status(401).json({ error: 'Timestamp too old' });
  }

  // 3. Idempotency check
  const event = JSON.parse(rawBody);
  if (await isEventProcessed(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 4. Process asynchronously (respond quickly)
  await queueForProcessing(event);

  // 5. Respond 200 immediately
  res.status(200).json({ status: 'received' });
});
```

### 8.2. Recommendations

| # | Practice | Lý do |
|---|----------|-------|
| 1 | Respond trong < 5s | Tránh timeout và retry không cần thiết |
| 2 | Process async | Không block response |
| 3 | Implement idempotency | Handle duplicate delivery |
| 4 | Verify signature | Security, prevent spoofing |
| 5 | Log all events | Debugging & audit trail |
| 6 | Monitor failures | Alert khi nhiều events fail |
| 7 | Handle unknown events | Ignore gracefully (forward-compatible) |
| 8 | Use HTTPS | Required, TLS 1.2+ |

---

## 9. Monitoring & Troubleshooting

### 9.1. Webhook Dashboard

Partners có thể xem trên Admin Portal:
- Delivery success rate (target: > 99%)
- Average response time
- Failed events (with retry status)
- Event volume over time

### 9.2. Common Issues

| Issue | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| 401 response | Signature verification failed | Check secret, verify algorithm |
| Timeout | Endpoint xử lý quá lâu | Process async, respond immediately |
| 5xx | Partner server error | Check server logs, ensure uptime |
| Missing events | Not subscribed | Check subscription settings |
| Duplicate events | Normal behavior (retry) | Implement idempotency |
| Out of order | Network/async processing | Use sequence_number for ordering |

### 9.3. Alerting

System sẽ alert partner khi:
- Failure rate > 10% trong 1 giờ
- Endpoint unreachable > 30 phút
- 5 consecutive failures
- Endpoint disabled do nhiều failures liên tiếp
