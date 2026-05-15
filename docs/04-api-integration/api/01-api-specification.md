# API Specification - OpenAPI / Swagger Documentation

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| API Version | v1.0.0 |
| OpenAPI Version | 3.1.0 |
| Base URL (Production) | `https://api.insurance-system.vn/api/v1` |
| Base URL (Staging) | `https://api-staging.insurance-system.vn/api/v1` |
| Base URL (Development) | `http://localhost:3000/api/v1` |

---

## 1. Tổng quan API

### 1.1. API Design Principles

| Nguyên tắc | Mô tả |
|-------------|--------|
| RESTful | Tuân thủ REST conventions (resource-based URLs, HTTP methods) |
| JSON | Request/Response body sử dụng JSON format |
| HTTPS Only | Tất cả API calls phải qua HTTPS (production) |
| Stateless | Mỗi request phải chứa đầy đủ thông tin xác thực |
| Idempotent | PUT, DELETE operations phải idempotent |
| Pagination | List endpoints hỗ trợ cursor-based pagination |
| Versioning | URI-based versioning (`/api/v1/...`) |

### 1.2. HTTP Methods

| Method | Usage | Idempotent | Safe |
|--------|-------|------------|------|
| `GET` | Đọc resource | Yes | Yes |
| `POST` | Tạo resource mới | No | No |
| `PUT` | Cập nhật toàn bộ resource | Yes | No |
| `PATCH` | Cập nhật một phần resource | No | No |
| `DELETE` | Xóa resource | Yes | No |

### 1.3. Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-15T10:30:00.000Z",
    "request_id": "req_abc123xyz"
  }
}
```

**List Response (Paginated):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false,
    "next_cursor": "eyJpZCI6MTAwfQ=="
  },
  "meta": {
    "timestamp": "2026-05-15T10:30:00.000Z",
    "request_id": "req_abc123xyz"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      {
        "field": "email",
        "message": "Email format không hợp lệ",
        "code": "INVALID_FORMAT"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-05-15T10:30:00.000Z",
    "request_id": "req_abc123xyz"
  }
}
```

---

## 2. OpenAPI Specification (YAML)

```yaml
openapi: 3.1.0
info:
  title: Insurance System Platform API
  description: |
    API cho nền tảng bán bảo hiểm trực tuyến Insurance System.
    Hỗ trợ tất cả các nghiệp vụ: đăng ký, báo giá, mua bảo hiểm,
    quản lý hợp đồng, yêu cầu bồi thường và thanh toán.
  version: 1.0.0
  contact:
    name: Insurance System API Support
    email: api-support@insurance-system.vn
    url: https://developer.insurance-system.vn
  license:
    name: Proprietary
    url: https://insurance-system.vn/terms

servers:
  - url: https://api.insurance-system.vn/api/v1
    description: Production
  - url: https://api-staging.insurance-system.vn/api/v1
    description: Staging
  - url: http://localhost:3000/api/v1
    description: Local Development

tags:
  - name: Authentication
    description: Đăng ký, đăng nhập, quản lý session
  - name: Customers
    description: Quản lý thông tin khách hàng
  - name: Products
    description: Danh mục sản phẩm bảo hiểm
  - name: Quotes
    description: Báo giá bảo hiểm
  - name: Policies
    description: Quản lý hợp đồng bảo hiểm
  - name: Claims
    description: Yêu cầu bồi thường
  - name: Payments
    description: Thanh toán và giao dịch
  - name: Partners
    description: Quản lý đối tác (Insurers)
  - name: Admin
    description: Quản trị hệ thống
  - name: Notifications
    description: Thông báo
  - name: Documents
    description: Upload và quản lý tài liệu
```

---

## 3. Security Schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT Access Token. Lấy từ endpoint POST /auth/login.
        Header format: `Authorization: Bearer <token>`

    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.insurance-system.vn/oauth/authorize
          tokenUrl: https://auth.insurance-system.vn/oauth/token
          refreshUrl: https://auth.insurance-system.vn/oauth/refresh
          scopes:
            read:profile: Đọc thông tin cá nhân
            write:profile: Cập nhật thông tin cá nhân
            read:policies: Xem hợp đồng
            write:policies: Tạo/sửa hợp đồng
            read:claims: Xem claims
            write:claims: Tạo/sửa claims
            read:payments: Xem lịch sử thanh toán
            write:payments: Thực hiện thanh toán
            admin: Quyền quản trị

    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: |
        API Key cho partner integration.
        Được cấp khi đăng ký đối tác.

security:
  - BearerAuth: []
```

---

## 4. Common Schemas

```yaml
components:
  schemas:
    # ─── Pagination ───
    PaginationMeta:
      type: object
      properties:
        total:
          type: integer
          example: 150
        page:
          type: integer
          example: 1
        per_page:
          type: integer
          example: 20
        total_pages:
          type: integer
          example: 8
        has_next:
          type: boolean
        has_prev:
          type: boolean
        next_cursor:
          type: string
          nullable: true

    # ─── Error ───
    ErrorResponse:
      type: object
      required: [success, error]
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
              example: "Dữ liệu không hợp lệ"
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
                  code:
                    type: string

    # ─── Money ───
    Money:
      type: object
      properties:
        amount:
          type: number
          format: double
          example: 1500000
        currency:
          type: string
          enum: [VND, USD]
          default: VND

    # ─── Address ───
    Address:
      type: object
      properties:
        street:
          type: string
          example: "123 Nguyễn Huệ"
        ward:
          type: string
          example: "Phường Bến Nghé"
        district:
          type: string
          example: "Quận 1"
        city:
          type: string
          example: "TP. Hồ Chí Minh"
        country:
          type: string
          default: "VN"

    # ─── Customer ───
    Customer:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        phone:
          type: string
          example: "+84901234567"
        full_name:
          type: string
          example: "Nguyễn Văn A"
        date_of_birth:
          type: string
          format: date
        gender:
          type: string
          enum: [male, female, other]
        id_number:
          type: string
          description: "Số CCCD/CMND"
        kyc_status:
          type: string
          enum: [pending, verified, rejected]
        status:
          type: string
          enum: [active, inactive, suspended]
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    # ─── Product ───
    Product:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          example: "Bảo hiểm sức khỏe toàn diện"
        slug:
          type: string
          example: "bao-hiem-suc-khoe-toan-dien"
        category_id:
          type: string
          format: uuid
        insurer_id:
          type: string
          format: uuid
        description:
          type: string
        benefits:
          type: array
          items:
            $ref: '#/components/schemas/Benefit'
        exclusions:
          type: array
          items:
            type: string
        min_age:
          type: integer
        max_age:
          type: integer
        min_premium:
          $ref: '#/components/schemas/Money'
        status:
          type: string
          enum: [draft, active, suspended, archived]
        rating:
          type: number
          format: float
          example: 4.5

    # ─── Benefit ───
    Benefit:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        coverage_amount:
          $ref: '#/components/schemas/Money'
        conditions:
          type: string

    # ─── Quote ───
    Quote:
      type: object
      properties:
        id:
          type: string
          format: uuid
        customer_id:
          type: string
          format: uuid
        product_type:
          type: string
          enum: [motor, health, life, travel, property, liability, business]
        quotes:
          type: array
          items:
            $ref: '#/components/schemas/QuoteResult'
        valid_until:
          type: string
          format: date-time
        status:
          type: string
          enum: [active, expired, converted]
        created_at:
          type: string
          format: date-time

    QuoteResult:
      type: object
      properties:
        insurer_id:
          type: string
          format: uuid
        insurer_name:
          type: string
        product_id:
          type: string
          format: uuid
        product_name:
          type: string
        premium_annual:
          $ref: '#/components/schemas/Money'
        premium_monthly:
          $ref: '#/components/schemas/Money'
        sum_insured:
          $ref: '#/components/schemas/Money'
        benefits_summary:
          type: array
          items:
            type: string
        exclusions_summary:
          type: array
          items:
            type: string

    # ─── Policy ───
    Policy:
      type: object
      properties:
        id:
          type: string
          format: uuid
        policy_number:
          type: string
          example: "POL-2026-00001"
        customer_id:
          type: string
          format: uuid
        product_id:
          type: string
          format: uuid
        insurer_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [pending, active, expired, cancelled, lapsed]
        effective_date:
          type: string
          format: date
        expiry_date:
          type: string
          format: date
        premium:
          $ref: '#/components/schemas/Money'
        sum_insured:
          $ref: '#/components/schemas/Money'
        payment_frequency:
          type: string
          enum: [annual, semi_annual, quarterly, monthly]
        auto_renewal:
          type: boolean
        created_at:
          type: string
          format: date-time

    # ─── Claim ───
    Claim:
      type: object
      properties:
        id:
          type: string
          format: uuid
        claim_number:
          type: string
          example: "CLM-2026-00001"
        policy_id:
          type: string
          format: uuid
        claimant_id:
          type: string
          format: uuid
        type:
          type: string
          enum: [health, motor, property, travel, death, disability]
        status:
          type: string
          enum:
            - submitted
            - assigned
            - documents_review
            - additional_info_required
            - under_assessment
            - approved
            - partially_approved
            - rejected
            - payment_processing
            - settled
            - closed
            - appealed
        event_date:
          type: string
          format: date
        claimed_amount:
          $ref: '#/components/schemas/Money'
        approved_amount:
          $ref: '#/components/schemas/Money'
        created_at:
          type: string
          format: date-time

    # ─── Payment Transaction ───
    Transaction:
      type: object
      properties:
        id:
          type: string
          format: uuid
        reference_number:
          type: string
          example: "TXN-2026051500001"
        type:
          type: string
          enum: [premium_payment, renewal, refund, claim_settlement]
        amount:
          $ref: '#/components/schemas/Money'
        payment_method:
          type: string
          enum: [momo, zalopay, vnpay, bank_card, bank_transfer, installment]
        status:
          type: string
          enum: [pending, processing, success, failed, refunded]
        gateway_reference:
          type: string
        created_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time
          nullable: true
```

---

## 5. HTTP Status Codes

| Code | Meaning | Khi nào sử dụng |
|------|---------|-----------------|
| `200` | OK | Request thành công (GET, PUT, PATCH) |
| `201` | Created | Resource được tạo thành công (POST) |
| `204` | No Content | Xóa thành công (DELETE) |
| `400` | Bad Request | Validation error, malformed request |
| `401` | Unauthorized | Thiếu hoặc invalid token |
| `403` | Forbidden | Không có quyền truy cập resource |
| `404` | Not Found | Resource không tồn tại |
| `409` | Conflict | Duplicate resource (email đã tồn tại) |
| `422` | Unprocessable Entity | Business logic error |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Lỗi server không mong đợi |
| `502` | Bad Gateway | Upstream service (insurer API) lỗi |
| `503` | Service Unavailable | System đang maintenance |

---

## 6. Error Codes

| Code | HTTP Status | Mô tả |
|------|-------------|--------|
| `VALIDATION_ERROR` | 400 | Dữ liệu đầu vào không hợp lệ |
| `INVALID_JSON` | 400 | Request body không phải valid JSON |
| `MISSING_FIELD` | 400 | Thiếu trường bắt buộc |
| `UNAUTHORIZED` | 401 | Chưa xác thực |
| `TOKEN_EXPIRED` | 401 | Access token hết hạn |
| `TOKEN_INVALID` | 401 | Token không hợp lệ |
| `FORBIDDEN` | 403 | Không có quyền |
| `RESOURCE_NOT_FOUND` | 404 | Không tìm thấy resource |
| `DUPLICATE_RESOURCE` | 409 | Resource đã tồn tại |
| `QUOTE_EXPIRED` | 422 | Báo giá đã hết hạn |
| `POLICY_NOT_ACTIVE` | 422 | Hợp đồng không active |
| `PAYMENT_FAILED` | 422 | Thanh toán thất bại |
| `INSURER_UNAVAILABLE` | 502 | Insurer API không phản hồi |
| `RATE_LIMIT_EXCEEDED` | 429 | Vượt quá giới hạn request |
| `INTERNAL_ERROR` | 500 | Lỗi hệ thống nội bộ |

---

## 7. Rate Limiting

### 7.1. Rate Limit Tiers

| Tier | Limit | Window | Áp dụng cho |
|------|-------|--------|-------------|
| Anonymous | 30 req | 1 phút | Unauthenticated requests |
| Authenticated | 100 req | 1 phút | Logged-in users |
| Partner API | 500 req | 1 phút | Insurer partners |
| Admin | 300 req | 1 phút | Admin users |
| Quote Engine | 50 req | 1 phút | Per-user quote requests |

### 7.2. Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1715769600
Retry-After: 30
```

---

## 8. Request Headers

| Header | Required | Mô tả |
|--------|----------|--------|
| `Authorization` | Yes* | `Bearer <access_token>` |
| `Content-Type` | Yes (POST/PUT/PATCH) | `application/json` |
| `Accept` | No | `application/json` (default) |
| `Accept-Language` | No | `vi` (default), `en` |
| `X-Request-ID` | No | Client-generated request ID (UUID) |
| `X-API-Key` | Yes (Partner) | Partner API key |
| `X-Idempotency-Key` | Recommended (POST) | Prevent duplicate operations |

*Không bắt buộc cho public endpoints (product catalog, login, register)

---

## 9. Swagger UI & Developer Portal

### 9.1. Access

| Environment | URL |
|-------------|-----|
| Production Docs | `https://developer.insurance-system.vn/docs` |
| Staging Swagger | `https://api-staging.insurance-system.vn/swagger` |
| Local Swagger | `http://localhost:3000/swagger` |

### 9.2. Interactive Testing

- Swagger UI cho phép test API trực tiếp
- Cần authenticate trước khi test protected endpoints
- Staging environment có test data sẵn
- Sandbox credentials cung cấp khi đăng ký developer account

### 9.3. SDKs & Client Libraries

| Language | Package | Status |
|----------|---------|--------|
| TypeScript/JavaScript | `@insurance-system/sdk-js` | Available |
| Python | `insurance-system-sdk` | Planned |
| Java | `vn.insurance-system:sdk` | Planned |
| PHP | `insurance-system/sdk-php` | Planned |

---

## 10. API Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-05-15 | Initial release - Core APIs |
| v1.1.0 | TBD | Claims auto-assessment, Batch operations |
| v1.2.0 | TBD | AI Recommendation API, Analytics API |
