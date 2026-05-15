# Third-party Integration Documentation

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Cập nhật lần cuối | 2026-05-15 |

---

## 1. Tổng quan tích hợp

### 1.1. Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSURANCE SYSTEM PLATFORM                      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    CORE PLATFORM                            │  │
│  └──────────┬──────────┬──────────┬──────────┬───────────────┘  │
│             │          │          │          │                    │
│     ┌───────┴───┐ ┌────┴────┐ ┌──┴───┐ ┌───┴────┐              │
│     │ Payment   │ │ Insurer │ │ eKYC │ │ Notify │              │
│     │ Gateways  │ │ APIs    │ │      │ │        │              │
│     └───────┬───┘ └────┬────┘ └──┬───┘ └───┬────┘              │
└─────────────┼──────────┼─────────┼──────────┼───────────────────┘
              │          │         │          │
      ┌───────┼────┐  ┌──┼────┐  ┌┼────┐  ┌──┼────────┐
      ▼       ▼    ▼  ▼  ▼    ▼  ▼     ▼  ▼  ▼        ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│VNPay ││MoMo  ││ZaloPay││BảoViệt││PVI  ││VNPT  ││Twilio││Firebase│
│      ││      ││      ││      ││     ││eKYC  ││SMS   ││Push  │
└──────┘└──────┘└──────┘└──────┘└─────┘└──────┘└──────┘└──────┘
```

### 1.2. Integration Summary

| Partner | Type | Protocol | Auth | Purpose |
|---------|------|----------|------|---------|
| VNPay | Payment Gateway | REST API | HMAC-SHA512 | Thanh toán thẻ/ATM |
| MoMo | Payment Gateway | REST API | RSA + HMAC | Ví MoMo |
| ZaloPay | Payment Gateway | REST API | HMAC-SHA256 | Ví ZaloPay |
| Bảo Việt | Insurer | REST API | OAuth 2.0 | Sản phẩm & claims |
| PVI | Insurer | REST API | API Key | Sản phẩm & claims |
| Bảo Minh | Insurer | SOAP/XML | Certificate | Sản phẩm & claims |
| VNPT eKYC | Identity | REST API | API Key + JWT | Xác minh danh tính |
| Twilio | Communication | REST API | Auth Token | SMS OTP |
| SendGrid | Communication | REST API | API Key | Transactional email |
| Firebase | Communication | REST API | Service Account | Push notifications |
| Google OAuth | Authentication | OAuth 2.0 | Client ID/Secret | Social login |
| Facebook OAuth | Authentication | OAuth 2.0 | App ID/Secret | Social login |
| AWS S3 | Storage | REST API | IAM Credentials | Document storage |

---

## 2. Payment Gateway Integrations

### 2.1. VNPay

#### Connection Details

| Field | Value |
|-------|-------|
| Sandbox URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| Production URL | `https://pay.vnpay.vn/vpcpay.html` |
| API Version | 2.1.0 |
| Auth Method | HMAC-SHA512 signature |
| Settlement | T+1 |

#### Payment Flow

```
┌────────┐     ┌────────────┐     ┌────────┐     ┌────────┐
│  User  │────▶│  Platform  │────▶│ VNPay  │────▶│  Bank  │
│        │     │  (create   │     │  (pay  │     │  (OTP) │
│        │     │   order)   │     │  page) │     │        │
└────────┘     └────────────┘     └────────┘     └────────┘
                     ▲                                │
                     │         Return URL             │
                     └────────────────────────────────┘
```

#### API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/paymentv2/vpcpay.html` | GET (redirect) | Initiate payment |
| `/merchant_webapi/api/transaction` | POST | Query transaction |
| `/merchant_webapi/api/transaction/refund` | POST | Refund transaction |

#### Request Parameters (Create Payment)

| Param | Type | Required | Mô tả |
|-------|------|----------|--------|
| `vnp_Version` | string | Yes | "2.1.0" |
| `vnp_TmnCode` | string | Yes | Merchant code |
| `vnp_Amount` | long | Yes | Amount * 100 (VND) |
| `vnp_Command` | string | Yes | "pay" |
| `vnp_CreateDate` | string | Yes | yyyyMMddHHmmss |
| `vnp_CurrCode` | string | Yes | "VND" |
| `vnp_IpAddr` | string | Yes | Customer IP |
| `vnp_Locale` | string | Yes | "vn" |
| `vnp_OrderInfo` | string | Yes | Order description |
| `vnp_OrderType` | string | Yes | "insurance" |
| `vnp_ReturnUrl` | string | Yes | Callback URL |
| `vnp_TxnRef` | string | Yes | Unique transaction ref |
| `vnp_SecureHash` | string | Yes | HMAC-SHA512 signature |

#### Signature Calculation

```typescript
function createVNPaySignature(params: Record<string, string>, secretKey: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHmac('sha512', secretKey)
    .update(sortedParams)
    .digest('hex');
}
```

---

### 2.2. MoMo

#### Connection Details

| Field | Value |
|-------|-------|
| Sandbox URL | `https://test-payment.momo.vn` |
| Production URL | `https://payment.momo.vn` |
| API Version | 2.0 |
| Auth Method | RSA signature + HMAC-SHA256 |
| Settlement | T+1 |

#### Supported Payment Methods

| Method | Code | Mô tả |
|--------|------|--------|
| MoMo Wallet | `captureWallet` | Thanh toán qua ví MoMo |
| ATM Card | `payWithATM` | Thẻ ATM nội địa |
| Credit Card | `payWithCC` | Visa/Mastercard |
| QR Code | `payWithQR` | Scan QR |

#### API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/v2/gateway/api/create` | POST | Create payment request |
| `/v2/gateway/api/query` | POST | Query transaction status |
| `/v2/gateway/api/refund` | POST | Refund transaction |
| `/v2/gateway/api/confirm` | POST | Confirm transaction |

#### Create Payment Request

```json
{
  "partnerCode": "MOMO_PARTNER_CODE",
  "requestId": "unique-request-id",
  "amount": 8500000,
  "orderId": "order-uuid",
  "orderInfo": "Thanh toán bảo hiểm POL-2026-00001",
  "redirectUrl": "https://insurance-system.vn/payment/callback",
  "ipnUrl": "https://api.insurance-system.vn/webhooks/momo",
  "requestType": "captureWallet",
  "extraData": "base64-encoded-data",
  "lang": "vi",
  "signature": "hmac-sha256-signature"
}
```

---

### 2.3. ZaloPay

#### Connection Details

| Field | Value |
|-------|-------|
| Sandbox URL | `https://sb-openapi.zalopay.vn` |
| Production URL | `https://openapi.zalopay.vn` |
| API Version | 2.0 |
| Auth Method | HMAC-SHA256 |
| Settlement | T+1 |

#### API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/v2/create` | POST | Create order |
| `/v2/query` | POST | Query order status |
| `/v2/refund` | POST | Refund |
| `/v2/query_refund` | POST | Query refund status |

---

## 3. Insurer API Integrations

### 3.1. Integration Pattern

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Platform   │────▶│  Anti-Corruption │────▶│   Insurer    │
│   Service    │     │  Layer (ACL)     │     │   API        │
│              │◀────│                  │◀────│              │
└──────────────┘     └─────────────────┘     └──────────────┘

ACL chịu trách nhiệm:
- Translate platform models ↔ insurer models
- Handle different auth mechanisms
- Normalize error responses
- Implement circuit breaker
- Cache responses where appropriate
```

### 3.2. Standard Insurer Integration Interface

Tất cả insurer integrations implement cùng interface:

```typescript
interface InsurerAdapter {
  // Quotation
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  // Policy
  issuePolicy(request: IssuePolicyRequest): Promise<PolicyResponse>;
  cancelPolicy(policyRef: string, reason: string): Promise<CancelResponse>;
  endorsePolicy(policyRef: string, changes: EndorsementRequest): Promise<EndorsementResponse>;

  // Claims
  submitClaim(request: ClaimSubmissionRequest): Promise<ClaimResponse>;
  getClaimStatus(claimRef: string): Promise<ClaimStatusResponse>;

  // Products
  getProducts(): Promise<ProductList>;
  getProductDetails(productId: string): Promise<ProductDetails>;

  // Health check
  healthCheck(): Promise<HealthStatus>;
}
```

### 3.3. Bảo Việt Integration

| Field | Value |
|-------|-------|
| API Type | REST (JSON) |
| Auth | OAuth 2.0 Client Credentials |
| Base URL (Sandbox) | `https://api-sandbox.baoviet.com.vn/v1` |
| Base URL (Production) | `https://api.baoviet.com.vn/v1` |
| Rate Limit | 100 req/min |
| SLA | 99.5% uptime, < 2s response |

**Available APIs:**
| Endpoint | Mô tả |
|----------|--------|
| `POST /quotes/health` | Health insurance quote |
| `POST /quotes/motor` | Motor insurance quote |
| `POST /policies/issue` | Issue new policy |
| `POST /policies/{id}/cancel` | Cancel policy |
| `POST /claims/submit` | Submit claim |
| `GET /claims/{id}/status` | Get claim status |
| `GET /products` | List available products |

### 3.4. PVI Integration

| Field | Value |
|-------|-------|
| API Type | REST (JSON) |
| Auth | API Key (X-API-Key header) |
| Base URL (Sandbox) | `https://sandbox-api.pvi.com.vn/partner/v2` |
| Base URL (Production) | `https://api.pvi.com.vn/partner/v2` |
| Rate Limit | 60 req/min |
| SLA | 99% uptime, < 3s response |

### 3.5. Circuit Breaker Pattern

```
States:
┌────────┐    failures >= threshold    ┌────────┐
│ CLOSED │────────────────────────────▶│  OPEN  │
│(normal)│                             │(reject)│
└────┬───┘                             └────┬───┘
     ▲                                      │
     │     success                          │ timeout
     │                                      ▼
     │                              ┌──────────────┐
     └──────────────────────────────│  HALF-OPEN   │
              success               │  (test 1 req)│
                                    └──────────────┘
```

**Configuration:**
| Parameter | Value | Mô tả |
|-----------|-------|--------|
| failure_threshold | 5 | Failures before opening |
| success_threshold | 3 | Successes before closing |
| timeout | 30 seconds | Time before half-open |
| monitoring_window | 60 seconds | Window for counting failures |

---

## 4. eKYC Integration (VNPT)

### 4.1. Connection Details

| Field | Value |
|-------|-------|
| Provider | VNPT eKYC |
| API Type | REST (JSON) |
| Auth | API Key + JWT |
| Sandbox URL | `https://sandbox-ekyc.vnpt.vn/api/v1` |
| Production URL | `https://ekyc.vnpt.vn/api/v1` |

### 4.2. eKYC Flow

```
┌────────┐     ┌────────────┐     ┌────────┐
│  User  │────▶│  Platform  │────▶│  VNPT  │
│ upload │     │  (forward) │     │  eKYC  │
│ images │     │            │     │        │
└────────┘     └─────┬──────┘     └────┬───┘
                     │                  │
                     │   OCR Result     │
                     │◀─────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Auto-fill    │
              │ customer form│
              └──────────────┘
```

### 4.3. API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/ocr/id-card` | POST | OCR extract from ID card |
| `/face/compare` | POST | Compare face (selfie vs ID) |
| `/liveness/check` | POST | Liveness detection |
| `/verify/id-number` | POST | Verify ID against national DB |

### 4.4. OCR Request

```
POST /api/v1/ocr/id-card
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
X-API-Key: {api_key}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| front_image | file | Yes | Ảnh mặt trước CCCD/CMND |
| back_image | file | Yes | Ảnh mặt sau |
| type | string | Yes | `cccd` / `cmnd` / `passport` |

**Response:**
```json
{
  "success": true,
  "data": {
    "id_number": "079095001234",
    "full_name": "NGUYEN VAN A",
    "date_of_birth": "15/03/1995",
    "gender": "Nam",
    "nationality": "Việt Nam",
    "place_of_origin": "TP Hồ Chí Minh",
    "place_of_residence": "123 Nguyễn Huệ, Q1, TP.HCM",
    "expiry_date": "15/03/2035",
    "confidence": 0.95
  }
}
```

---

## 5. Communication Integrations

### 5.1. SMS (Twilio / VNPT Brandname)

| Field | Primary (Twilio) | Backup (VNPT) |
|-------|----------|--------|
| Purpose | OTP, alerts | Brandname SMS |
| API | REST | REST |
| Auth | Auth Token | API Key |
| Throughput | 100 msg/s | 50 msg/s |
| Delivery Report | Yes (webhook) | Yes (callback) |

**Send SMS:**
```json
POST /api/v1/sms/send
{
  "to": "+84901234567",
  "template": "otp_verification",
  "params": {
    "otp_code": "123456",
    "expires_in": "5 phút"
  },
  "priority": "high"
}
```

### 5.2. Email (SendGrid)

| Field | Value |
|-------|-------|
| Provider | SendGrid |
| API Version | v3 |
| Auth | API Key |
| Templates | Dynamic templates |
| Throughput | 100 emails/s |

**Email Templates:**

| Template ID | Name | Trigger |
|------------|------|---------|
| `d-abc001` | Welcome | Registration |
| `d-abc002` | OTP Verification | Login/Register |
| `d-abc003` | Policy Issued | Purchase complete |
| `d-abc004` | Payment Confirmation | Payment success |
| `d-abc005` | Payment Reminder | Before due date |
| `d-abc006` | Claim Submitted | Claim created |
| `d-abc007` | Claim Status Update | Status changed |
| `d-abc008` | Claim Settlement | Money transferred |
| `d-abc009` | Renewal Reminder | Before expiry |
| `d-abc010` | Password Reset | Forgot password |

### 5.3. Push Notifications (Firebase Cloud Messaging)

| Field | Value |
|-------|-------|
| Provider | Firebase (FCM) |
| Auth | Service Account Key |
| Platforms | Web (future: iOS, Android) |

---

## 6. Storage Integration (AWS S3)

### 6.1. Configuration

| Field | Value |
|-------|-------|
| Region | ap-southeast-1 (Singapore) |
| Buckets | See below |
| Auth | IAM Role (production), Access Key (development) |
| Encryption | AES-256 (SSE-S3) |
| Versioning | Enabled |

### 6.2. Bucket Structure

| Bucket | Purpose | Access | Lifecycle |
|--------|---------|--------|-----------|
| `insurance-docs-prod` | Policy documents, certificates | Private | Keep forever |
| `insurance-claims-prod` | Claim documents, photos | Private | Keep 7 years |
| `insurance-kyc-prod` | KYC images | Private (encrypted) | Delete after 90 days |
| `insurance-temp-prod` | Temporary uploads | Private | Delete after 24h |
| `insurance-public-prod` | Product images, brochures | Public read | Keep forever |

### 6.3. Upload Flow

```
Client → Platform API → Presigned URL → Direct upload to S3
                                              │
                                              ▼
                                     S3 Event Notification
                                              │
                                              ▼
                                     Lambda (virus scan, resize)
                                              │
                                              ▼
                                     Update DB with file metadata
```

---

## 7. Error Handling & Resilience

### 7.1. Timeout Configuration

| Integration | Connect Timeout | Read Timeout | Total Timeout |
|-------------|----------------|--------------|---------------|
| VNPay | 5s | 30s | 35s |
| MoMo | 5s | 30s | 35s |
| ZaloPay | 5s | 30s | 35s |
| Insurer APIs | 5s | 10s | 15s |
| eKYC (VNPT) | 5s | 15s | 20s |
| SMS (Twilio) | 3s | 10s | 13s |
| Email (SendGrid) | 3s | 10s | 13s |
| S3 | 3s | 30s | 33s |

### 7.2. Fallback Strategy

| Primary | Fallback | Trigger |
|---------|----------|---------|
| VNPay (card) | MoMo (card) | VNPay circuit open |
| Twilio (SMS) | VNPT Brandname | Twilio error rate > 5% |
| SendGrid | AWS SES | SendGrid unavailable |
| VNPT eKYC | Manual review queue | eKYC service down |

### 7.3. Monitoring

Mỗi integration được monitor:
- Response time (p50, p95, p99)
- Error rate (%)
- Availability (%)
- Circuit breaker state
- Request volume

Dashboard: `https://monitoring.insurance-system.vn/integrations`

---

## 8. Security Requirements

### 8.1. Data in Transit

| Requirement | Standard |
|-------------|----------|
| Protocol | HTTPS/TLS 1.2+ |
| Certificate | Valid, not self-signed |
| Cipher suites | AES-256-GCM, CHACHA20-POLY1305 |

### 8.2. Credentials Management

| Method | Tool | Mô tả |
|--------|------|--------|
| API Keys | AWS Secrets Manager | Rotated every 90 days |
| OAuth Secrets | AWS Secrets Manager | Rotated every 90 days |
| Service Accounts | Vault | Short-lived tokens |
| Certificates | ACM | Auto-renewed |

### 8.3. IP Whitelisting

Một số partners yêu cầu IP whitelist:
- Platform sử dụng NAT Gateway với static IPs
- IPs được cung cấp khi onboard partner
- Changes thông báo trước 7 ngày

---

## 9. Onboarding Checklist cho Partner Mới

| # | Task | Owner | Timeline |
|---|------|-------|----------|
| 1 | Ký NDA & hợp đồng | BD Team | Week 1 |
| 2 | Nhận API documentation | Partner | Week 1 |
| 3 | Tạo sandbox credentials | DevOps | Week 1 |
| 4 | Develop adapter (ACL layer) | Backend Team | Week 2-3 |
| 5 | Unit tests cho adapter | Backend Team | Week 3 |
| 6 | Integration testing (sandbox) | QA Team | Week 3-4 |
| 7 | Security review | Security Team | Week 4 |
| 8 | Performance testing | QA Team | Week 4 |
| 9 | Production credentials | DevOps + Partner | Week 5 |
| 10 | Soft launch (limited traffic) | Product Team | Week 5 |
| 11 | Full launch | Product Team | Week 6 |
| 12 | Monitoring setup | DevOps | Week 5 |
