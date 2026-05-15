# Endpoint Documentation - Chi Tiết Các API Endpoints

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Base URL | `https://api.insurance-system.vn/api/v1` |
| Format | JSON |
| Auth | Bearer Token (JWT) trừ khi ghi chú khác |

---

## Mục lục

1. [Authentication Endpoints](#1-authentication-endpoints)
2. [Customer Endpoints](#2-customer-endpoints)
3. [Product Endpoints](#3-product-endpoints)
4. [Quote Endpoints](#4-quote-endpoints)
5. [Policy Endpoints](#5-policy-endpoints)
6. [Claims Endpoints](#6-claims-endpoints)
7. [Payment Endpoints](#7-payment-endpoints)
8. [Notification Endpoints](#8-notification-endpoints)
9. [Admin Endpoints](#9-admin-endpoints)
10. [Document/Upload Endpoints](#10-documentupload-endpoints)

---

## 1. Authentication Endpoints

### POST `/auth/register`

Đăng ký tài khoản mới.

| Field | Value |
|-------|-------|
| Auth | None |
| Rate Limit | 5 req/phút per IP |

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+84901234567",
  "password": "SecureP@ss1",
  "confirm_password": "SecureP@ss1",
  "full_name": "Nguyễn Văn A",
  "agree_terms": true
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "phone": "+84901234567",
    "full_name": "Nguyễn Văn A",
    "status": "pending_verification",
    "verification": {
      "email_sent": true,
      "sms_sent": true,
      "expires_at": "2026-05-15T10:35:00.000Z"
    }
  }
}
```

**Errors:**
| Code | Mô tả |
|------|--------|
| 400 | Validation error (missing fields, weak password) |
| 409 | Email hoặc phone đã tồn tại |

---

### POST `/auth/verify-otp`

Xác minh OTP sau khi đăng ký.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "channel": "email"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 900
  }
}
```

---

### POST `/auth/login`

Đăng nhập hệ thống.

| Field | Value |
|-------|-------|
| Auth | None |
| Rate Limit | 10 req/phút per IP |

**Request Body:**
```json
{
  "email_or_phone": "user@example.com",
  "password": "SecureP@ss1",
  "remember_me": false
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "customer",
      "kyc_status": "verified"
    }
  }
}
```

**Errors:**
| Code | Mô tả |
|------|--------|
| 401 | Sai email/phone hoặc password |
| 423 | Tài khoản bị khóa (5 lần sai liên tiếp) |

---

### POST `/auth/refresh`

Refresh access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOi..."
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...(new)",
    "refresh_token": "eyJhbGciOi...(new)",
    "expires_in": 900
  }
}
```

---

### POST `/auth/logout`

Đăng xuất (invalidate tokens).

**Response `204 No Content`**

---

### POST `/auth/forgot-password`

Gửi link reset password.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### POST `/auth/reset-password`

Đặt lại password.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewP@ss123",
  "confirm_password": "NewP@ss123"
}
```

---

### POST `/auth/social/google`

Đăng nhập qua Google OAuth.

**Request Body:**
```json
{
  "id_token": "google-id-token"
}
```

---

### POST `/auth/social/facebook`

Đăng nhập qua Facebook OAuth.

**Request Body:**
```json
{
  "access_token": "facebook-access-token"
}
```

---

## 2. Customer Endpoints

### GET `/customers/me`

Lấy thông tin profile hiện tại.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+84901234567",
    "full_name": "Nguyễn Văn A",
    "date_of_birth": "1995-03-15",
    "gender": "male",
    "id_number": "079095001234",
    "id_type": "cccd",
    "kyc_status": "verified",
    "address": {
      "street": "123 Nguyễn Huệ",
      "ward": "Phường Bến Nghé",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    },
    "preferences": {
      "language": "vi",
      "notifications": {
        "email": true,
        "sms": true,
        "push": false
      }
    },
    "created_at": "2026-01-10T08:00:00.000Z"
  }
}
```

---

### PUT `/customers/me`

Cập nhật thông tin cá nhân.

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "date_of_birth": "1995-03-15",
  "gender": "male",
  "address": {
    "street": "456 Lê Lợi",
    "ward": "Phường Bến Thành",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh"
  }
}
```

---

### POST `/customers/me/kyc`

Submit eKYC verification.

**Request Body (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id_type | string | Yes | `cccd` / `cmnd` / `passport` |
| id_number | string | Yes | Số giấy tờ |
| front_image | file | Yes | Ảnh mặt trước |
| back_image | file | Yes | Ảnh mặt sau (CCCD/CMND) |
| selfie_image | file | Yes | Ảnh selfie |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "kyc_status": "verified",
    "verified_at": "2026-05-15T10:30:00.000Z",
    "extracted_data": {
      "full_name": "NGUYEN VAN A",
      "id_number": "079095001234",
      "date_of_birth": "1995-03-15",
      "gender": "male",
      "address": "123 Nguyễn Huệ, Q1, TP.HCM"
    }
  }
}
```

---

### GET `/customers/me/family-members`

Danh sách thành viên gia đình.

---

### POST `/customers/me/family-members`

Thêm thành viên gia đình.

**Request Body:**
```json
{
  "full_name": "Nguyễn Thị B",
  "relationship": "spouse",
  "date_of_birth": "1996-07-20",
  "gender": "female",
  "id_number": "079096005678"
}
```

---

### GET `/customers/me/beneficiaries`

Danh sách người thụ hưởng.

---

### POST `/customers/me/beneficiaries`

Thêm người thụ hưởng.

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn C",
  "relationship": "child",
  "date_of_birth": "2020-01-01",
  "percentage": 50,
  "contact_phone": "+84909876543"
}
```



---

## 3. Product Endpoints

### GET `/products/categories`

Danh sách tất cả categories sản phẩm bảo hiểm.

| Field | Value |
|-------|-------|
| Auth | None (Public) |
| Cache | 1 hour |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Bảo hiểm Sức khỏe",
      "slug": "health-insurance",
      "icon": "health-icon",
      "description": "Bảo vệ chi phí y tế cho bạn và gia đình",
      "subcategories": [
        { "id": "uuid", "name": "Nội trú", "slug": "inpatient" },
        { "id": "uuid", "name": "Ngoại trú", "slug": "outpatient" },
        { "id": "uuid", "name": "Bệnh hiểm nghèo", "slug": "critical-illness" },
        { "id": "uuid", "name": "Thai sản", "slug": "maternity" }
      ],
      "product_count": 25
    }
  ]
}
```

---

### GET `/products`

Danh sách sản phẩm (có filter, sort, pagination).

| Field | Value |
|-------|-------|
| Auth | None (Public) |
| Cache | 5 minutes |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| category | string | - | Filter theo category slug |
| subcategory | string | - | Filter theo subcategory slug |
| insurer_id | uuid | - | Filter theo insurer |
| min_price | number | - | Premium tối thiểu (VND) |
| max_price | number | - | Premium tối đa (VND) |
| min_rating | number | - | Rating tối thiểu (1-5) |
| sort | string | popularity | `price_asc`, `price_desc`, `rating`, `popularity`, `newest` |
| page | number | 1 | Trang |
| per_page | number | 20 | Số item/trang (max 50) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Bảo hiểm sức khỏe toàn diện Bảo Việt",
      "slug": "bao-hiem-suc-khoe-toan-dien-bao-viet",
      "category": "health-insurance",
      "insurer": {
        "id": "uuid",
        "name": "Bảo Việt",
        "logo_url": "https://..."
      },
      "min_premium": { "amount": 3500000, "currency": "VND" },
      "sum_insured_range": {
        "min": { "amount": 100000000, "currency": "VND" },
        "max": { "amount": 1000000000, "currency": "VND" }
      },
      "key_benefits": [
        "Nội trú: 100% chi phí",
        "Ngoại trú: 80% chi phí",
        "Nha khoa: 5 triệu/năm"
      ],
      "rating": 4.5,
      "review_count": 128,
      "status": "active"
    }
  ],
  "pagination": {
    "total": 85,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

---

### GET `/products/:id`

Chi tiết sản phẩm.

| Field | Value |
|-------|-------|
| Auth | None (Public) |
| Cache | 5 minutes |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bảo hiểm sức khỏe toàn diện Bảo Việt",
    "category": { "id": "uuid", "name": "Bảo hiểm Sức khỏe" },
    "insurer": { "id": "uuid", "name": "Bảo Việt", "logo_url": "..." },
    "description": "Bảo hiểm sức khỏe toàn diện...",
    "benefits": [
      {
        "name": "Chi phí nằm viện",
        "description": "Thanh toán 100% chi phí phòng, ăn uống, phẫu thuật",
        "coverage_amount": { "amount": 500000000, "currency": "VND" },
        "conditions": "Trong mạng lưới bệnh viện liên kết"
      }
    ],
    "exclusions": [
      "Bệnh có trước (pre-existing) trong 12 tháng đầu",
      "Phẫu thuật thẩm mỹ",
      "Điều trị tâm thần (trừ gói Premium)"
    ],
    "eligibility": {
      "min_age": 0,
      "max_age": 65,
      "excluded_occupations": ["Thợ mỏ", "Phi công chiến đấu"],
      "regions": ["VN"]
    },
    "pricing": {
      "min_premium_annual": { "amount": 3500000, "currency": "VND" },
      "factors": ["age", "gender", "smoking", "coverage_level", "deductible"]
    },
    "waiting_periods": {
      "general": 30,
      "pre_existing": 365,
      "maternity": 270
    },
    "documents": {
      "brochure_url": "https://...",
      "terms_url": "https://...",
      "claims_guide_url": "https://..."
    },
    "rating": 4.5,
    "review_count": 128
  }
}
```

---

### GET `/products/:id/reviews`

Reviews của sản phẩm.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| rating | number | - |
| sort | string | newest |
| page | number | 1 |
| per_page | number | 10 |

---

### POST `/products/compare`

So sánh nhiều sản phẩm.

**Request Body:**
```json
{
  "product_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "comparison_matrix": {
      "premium": [...],
      "sum_insured": [...],
      "benefits": {...},
      "exclusions": {...},
      "waiting_periods": {...}
    },
    "recommendation": {
      "best_value": "uuid-2",
      "most_comprehensive": "uuid-3"
    }
  }
}
```

---

## 4. Quote Endpoints

### POST `/quotes/motor`

Tạo báo giá bảo hiểm xe cơ giới.

| Field | Value |
|-------|-------|
| Auth | Optional (guest có thể lấy quote) |
| Rate Limit | 50 req/phút per user/IP |

**Request Body:**
```json
{
  "vehicle_type": "motorcycle",
  "brand": "Honda",
  "model": "Air Blade 150",
  "year": 2024,
  "engine_cc": 150,
  "usage": "personal",
  "vehicle_value": 56000000,
  "license_plate": "59-X1 12345",
  "coverage_type": "comprehensive",
  "sum_insured": 56000000,
  "add_passenger": true,
  "passenger_seats": 1,
  "deductible": 500000,
  "start_date": "2026-06-01"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "quote-uuid",
    "product_type": "motor",
    "quotes": [
      {
        "insurer_id": "uuid",
        "insurer_name": "Bảo Việt",
        "product_id": "uuid",
        "product_name": "Bảo hiểm xe máy toàn diện",
        "premium_annual": { "amount": 850000, "currency": "VND" },
        "premium_monthly": { "amount": 75000, "currency": "VND" },
        "sum_insured": { "amount": 56000000, "currency": "VND" },
        "deductible": { "amount": 500000, "currency": "VND" },
        "benefits_summary": [
          "TNDS: 150 triệu/vụ",
          "Vật chất xe: 100% giá trị",
          "Người ngồi trên xe: 20 triệu/người"
        ],
        "rating": 4.3
      },
      {
        "insurer_id": "uuid",
        "insurer_name": "PVI",
        "product_id": "uuid",
        "product_name": "Bảo hiểm xe toàn diện PVI",
        "premium_annual": { "amount": 780000, "currency": "VND" },
        "premium_monthly": { "amount": 68000, "currency": "VND" },
        "sum_insured": { "amount": 56000000, "currency": "VND" },
        "deductible": { "amount": 500000, "currency": "VND" },
        "benefits_summary": [
          "TNDS: 100 triệu/vụ",
          "Vật chất xe: 90% giá trị",
          "Người ngồi trên xe: 15 triệu/người"
        ],
        "rating": 4.1
      }
    ],
    "valid_until": "2026-06-14T10:30:00.000Z",
    "status": "active"
  }
}
```

---

### POST `/quotes/health`

Tạo báo giá bảo hiểm sức khỏe.

**Request Body:**
```json
{
  "plan_type": "individual",
  "date_of_birth": "1995-03-15",
  "gender": "male",
  "occupation": "office_worker",
  "smoking": false,
  "height_cm": 170,
  "weight_kg": 65,
  "pre_existing_conditions": [],
  "hospitalized_last_5_years": false,
  "sum_insured": 500000000,
  "inpatient": true,
  "outpatient": true,
  "dental": false,
  "maternity": false,
  "critical_illness": true,
  "deductible": 2000000,
  "copay": 0,
  "network": "standard",
  "start_date": "2026-06-01"
}
```

---

### POST `/quotes/life`

Tạo báo giá bảo hiểm nhân thọ.

**Request Body:**
```json
{
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "smoking_status": "never",
  "occupation": "office_worker",
  "annual_income": 300000000,
  "sum_assured": 1000000000,
  "policy_term": 20,
  "premium_payment_term": 15,
  "riders": ["critical_illness", "personal_accident", "premium_waiver"]
}
```

---

### POST `/quotes/travel`

Tạo báo giá bảo hiểm du lịch.

**Request Body:**
```json
{
  "trip_type": "international",
  "destination": "Japan",
  "departure_date": "2026-07-01",
  "return_date": "2026-07-10",
  "travelers": [
    { "age": 30, "name": "Nguyễn Văn A" },
    { "age": 28, "name": "Nguyễn Thị B" }
  ],
  "coverage_plan": "premium",
  "activities": ["skiing"]
}
```

---

### GET `/quotes/:id`

Xem chi tiết báo giá đã lưu.

---

### GET `/quotes`

Danh sách báo giá của user.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| status | string | active |
| product_type | string | - |
| page | number | 1 |
| per_page | number | 10 |

---

### POST `/quotes/:id/share`

Chia sẻ báo giá qua email/SMS.

**Request Body:**
```json
{
  "channel": "email",
  "recipient": "friend@example.com",
  "message": "Xem báo giá bảo hiểm này nhé!"
}
```



---

## 5. Policy Endpoints

### GET `/policies`

Danh sách hợp đồng bảo hiểm của user.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | - | `active`, `expired`, `cancelled`, `lapsed` |
| product_type | string | - | Filter theo loại sản phẩm |
| sort | string | created_desc | `created_desc`, `expiry_asc`, `premium_asc` |
| page | number | 1 | - |
| per_page | number | 10 | - |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "policy_number": "POL-2026-00001",
      "product": {
        "id": "uuid",
        "name": "Bảo hiểm sức khỏe toàn diện",
        "category": "health-insurance"
      },
      "insurer": {
        "id": "uuid",
        "name": "Bảo Việt",
        "logo_url": "https://..."
      },
      "status": "active",
      "effective_date": "2026-01-01",
      "expiry_date": "2027-01-01",
      "premium": { "amount": 8500000, "currency": "VND" },
      "sum_insured": { "amount": 500000000, "currency": "VND" },
      "payment_frequency": "annual",
      "next_payment_date": "2027-01-01",
      "auto_renewal": true
    }
  ],
  "pagination": { "total": 3, "page": 1, "per_page": 10, "total_pages": 1 }
}
```

---

### GET `/policies/:id`

Chi tiết hợp đồng.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "policy_number": "POL-2026-00001",
    "status": "active",
    "product": { "id": "uuid", "name": "...", "category": "..." },
    "insurer": { "id": "uuid", "name": "Bảo Việt" },
    "policyholder": {
      "id": "uuid",
      "full_name": "Nguyễn Văn A",
      "id_number": "079095001234"
    },
    "insured_persons": [
      {
        "full_name": "Nguyễn Văn A",
        "date_of_birth": "1995-03-15",
        "relationship": "self"
      }
    ],
    "beneficiaries": [
      {
        "full_name": "Nguyễn Thị B",
        "relationship": "spouse",
        "percentage": 100
      }
    ],
    "coverage": {
      "sum_insured": { "amount": 500000000, "currency": "VND" },
      "deductible": { "amount": 2000000, "currency": "VND" },
      "benefits": [...],
      "exclusions": [...],
      "riders": [...]
    },
    "premium": {
      "total_annual": { "amount": 8500000, "currency": "VND" },
      "payment_frequency": "annual",
      "next_due_date": "2027-01-01",
      "installment_amount": { "amount": 8500000, "currency": "VND" }
    },
    "dates": {
      "effective_date": "2026-01-01",
      "expiry_date": "2027-01-01",
      "issued_date": "2025-12-28"
    },
    "documents": {
      "policy_pdf": "https://...",
      "certificate_pdf": "https://...",
      "insurance_card": "https://..."
    },
    "auto_renewal": true,
    "created_at": "2025-12-28T10:00:00.000Z"
  }
}
```

---

### POST `/policies/:id/renew`

Gia hạn hợp đồng.

**Request Body:**
```json
{
  "payment_method": "momo",
  "auto_renewal": true
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "new_policy_id": "uuid",
    "new_policy_number": "POL-2026-00025",
    "effective_date": "2027-01-01",
    "expiry_date": "2028-01-01",
    "payment": {
      "transaction_id": "uuid",
      "amount": { "amount": 8500000, "currency": "VND" },
      "redirect_url": "https://payment.momo.vn/..."
    }
  }
}
```

---

### POST `/policies/:id/cancel`

Hủy hợp đồng.

**Request Body:**
```json
{
  "reason": "no_longer_needed",
  "reason_detail": "Đã chuyển sang công ty khác",
  "effective_date": "2026-06-01"
}
```

---

### POST `/policies/:id/endorse`

Sửa đổi bổ sung hợp đồng (endorsement).

**Request Body:**
```json
{
  "type": "change_beneficiary",
  "changes": {
    "beneficiaries": [
      {
        "full_name": "Nguyễn Văn C",
        "relationship": "child",
        "percentage": 50
      },
      {
        "full_name": "Nguyễn Thị B",
        "relationship": "spouse",
        "percentage": 50
      }
    ]
  }
}
```

---

### GET `/policies/:id/documents`

Danh sách tài liệu hợp đồng.

---

### GET `/policies/:id/payment-history`

Lịch sử thanh toán phí bảo hiểm.

---

## 6. Claims Endpoints

### POST `/claims`

Nộp yêu cầu bồi thường mới.

| Field | Value |
|-------|-------|
| Auth | Required |
| Content-Type | multipart/form-data |

**Request Body (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | uuid | Yes | ID hợp đồng |
| type | string | Yes | `health`, `motor`, `property`, `travel` |
| event_date | date | Yes | Ngày xảy ra sự kiện |
| description | string | Yes | Mô tả sự kiện |
| claimed_amount | number | Yes | Số tiền yêu cầu (VND) |
| hospital_name | string | Conditional | Tên bệnh viện (health) |
| diagnosis | string | Conditional | Chẩn đoán (health) |
| incident_location | string | Conditional | Địa điểm tai nạn (motor) |
| police_report_number | string | No | Số biên bản công an |
| documents[] | file[] | Yes | Upload chứng từ |
| bank_account | object | Yes | Thông tin TK nhận tiền |

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "claim_number": "CLM-2026-00001",
    "policy_id": "uuid",
    "type": "health",
    "status": "submitted",
    "event_date": "2026-05-10",
    "claimed_amount": { "amount": 15000000, "currency": "VND" },
    "documents_uploaded": 3,
    "expected_timeline": {
      "review": "2026-05-17",
      "decision": "2026-05-22",
      "settlement": "2026-05-24"
    },
    "created_at": "2026-05-15T10:30:00.000Z"
  }
}
```

---

### GET `/claims`

Danh sách claims của user.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| status | string | - |
| policy_id | uuid | - |
| page | number | 1 |
| per_page | number | 10 |

---

### GET `/claims/:id`

Chi tiết claim.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "claim_number": "CLM-2026-00001",
    "policy": { "id": "uuid", "policy_number": "POL-2026-00001" },
    "type": "health",
    "status": "under_assessment",
    "event_date": "2026-05-10",
    "description": "Nhập viện điều trị viêm phổi",
    "hospital_name": "Bệnh viện FV",
    "diagnosis": "Viêm phổi cấp",
    "claimed_amount": { "amount": 15000000, "currency": "VND" },
    "approved_amount": null,
    "documents": [
      {
        "id": "uuid",
        "type": "invoice",
        "file_name": "hoa-don.pdf",
        "file_url": "https://...",
        "verified": true
      }
    ],
    "timeline": [
      { "status": "submitted", "date": "2026-05-15T10:30:00Z", "note": null },
      { "status": "assigned", "date": "2026-05-15T11:00:00Z", "note": "Assigned to Handler #5" },
      { "status": "documents_review", "date": "2026-05-16T09:00:00Z", "note": null },
      { "status": "under_assessment", "date": "2026-05-17T14:00:00Z", "note": null }
    ],
    "handler": {
      "name": "Trần Văn D",
      "email": "handler@insurance-system.vn"
    },
    "bank_account": {
      "bank_name": "Vietcombank",
      "account_number": "****5678",
      "account_holder": "NGUYEN VAN A"
    },
    "created_at": "2026-05-15T10:30:00.000Z"
  }
}
```

---

### POST `/claims/:id/documents`

Upload thêm chứng từ cho claim.

---

### POST `/claims/:id/messages`

Gửi tin nhắn cho claims handler.

**Request Body:**
```json
{
  "message": "Tôi đã gửi thêm giấy ra viện",
  "attachments": []
}
```

---

### GET `/claims/:id/messages`

Lịch sử trao đổi về claim.

---

## 7. Payment Endpoints

### POST `/payments/initiate`

Khởi tạo thanh toán.

**Request Body:**
```json
{
  "type": "premium_payment",
  "policy_id": "uuid",
  "amount": 8500000,
  "payment_method": "vnpay",
  "return_url": "https://insurance-system.vn/payment/callback",
  "idempotency_key": "unique-key-123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "reference_number": "TXN-2026051500001",
    "amount": { "amount": 8500000, "currency": "VND" },
    "payment_method": "vnpay",
    "status": "pending",
    "redirect_url": "https://pay.vnpay.vn/...",
    "qr_code_url": "https://...",
    "expires_at": "2026-05-15T10:45:00.000Z"
  }
}
```

---

### GET `/payments/:id`

Kiểm tra trạng thái thanh toán.

---

### GET `/payments/history`

Lịch sử giao dịch.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| type | string | - |
| status | string | - |
| from_date | date | - |
| to_date | date | - |
| page | number | 1 |
| per_page | number | 20 |

---

### POST `/payments/:id/refund`

Yêu cầu hoàn tiền.

**Request Body:**
```json
{
  "reason": "policy_cancelled",
  "amount": 4250000,
  "bank_account": {
    "bank_code": "VCB",
    "account_number": "0123456789",
    "account_holder": "NGUYEN VAN A"
  }
}
```

---

### POST `/payments/setup-auto-debit`

Thiết lập thanh toán tự động.

**Request Body:**
```json
{
  "policy_id": "uuid",
  "payment_method": "bank_card",
  "card_token": "tok_xxx",
  "frequency": "monthly"
}
```

---

## 8. Notification Endpoints

### GET `/notifications`

Danh sách thông báo.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| read | boolean | - |
| type | string | - |
| page | number | 1 |
| per_page | number | 20 |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "payment_reminder",
      "title": "Nhắc nhở thanh toán phí bảo hiểm",
      "message": "Hợp đồng POL-2026-00001 sẽ hết hạn trong 7 ngày",
      "read": false,
      "action_url": "/policies/uuid/renew",
      "created_at": "2026-05-15T08:00:00.000Z"
    }
  ],
  "unread_count": 3
}
```

---

### PATCH `/notifications/:id/read`

Đánh dấu đã đọc.

---

### POST `/notifications/read-all`

Đánh dấu tất cả đã đọc.

---

### PUT `/notifications/preferences`

Cập nhật cài đặt thông báo.

**Request Body:**
```json
{
  "email": true,
  "sms": true,
  "push": false,
  "categories": {
    "payment_reminder": { "email": true, "sms": true },
    "claim_update": { "email": true, "sms": true },
    "promotion": { "email": true, "sms": false }
  }
}
```

---

## 9. Admin Endpoints

> **Auth**: Yêu cầu role `admin` hoặc `operator`

### GET `/admin/dashboard`

Dashboard tổng quan.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "revenue_today": { "amount": 125000000, "currency": "VND" },
    "policies_sold_today": 15,
    "active_claims": 48,
    "pending_payments": 12,
    "conversion_rate": 4.2,
    "new_customers_today": 35,
    "system_health": {
      "uptime": 99.98,
      "avg_response_time_ms": 120,
      "error_rate": 0.02
    }
  }
}
```

---

### GET `/admin/customers`

Danh sách khách hàng (admin).

---

### GET `/admin/customers/:id`

Chi tiết khách hàng (admin view).

---

### GET `/admin/policies`

Danh sách tất cả hợp đồng.

---

### GET `/admin/claims`

Queue claims cần xử lý.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter theo status |
| handler_id | uuid | Filter theo handler |
| priority | string | `low`, `medium`, `high`, `critical` |
| insurer_id | uuid | Filter theo insurer |
| date_from | date | Từ ngày |
| date_to | date | Đến ngày |

---

### PATCH `/admin/claims/:id/assign`

Assign claim cho handler.

**Request Body:**
```json
{
  "handler_id": "uuid",
  "priority": "high",
  "note": "Khách VIP, xử lý ưu tiên"
}
```

---

### PATCH `/admin/claims/:id/decision`

Quyết định claim (approve/reject).

**Request Body:**
```json
{
  "decision": "approved",
  "approved_amount": 12000000,
  "reason": "Đủ chứng từ, trong phạm vi bảo hiểm",
  "internal_note": "Case đơn giản, auto-approve eligible"
}
```

---

### GET `/admin/partners`

Danh sách đối tác (insurers).

---

### POST `/admin/products`

Tạo sản phẩm mới.

---

### PUT `/admin/products/:id`

Cập nhật sản phẩm.

---

### GET `/admin/reports/:type`

Lấy báo cáo.

**Report Types:** `sales`, `claims`, `customers`, `commission`, `conversion`

---

## 10. Document/Upload Endpoints

### POST `/documents/upload`

Upload tài liệu.

| Field | Value |
|-------|-------|
| Content-Type | multipart/form-data |
| Max file size | 10MB per file |
| Accepted formats | jpg, png, pdf |

**Request Body (multipart/form-data):**
| Field | Type | Required |
|-------|------|----------|
| file | binary | Yes |
| type | string | Yes (`cccd_front`, `cccd_back`, `selfie`, `invoice`, `medical_report`, `police_report`, `photo`) |
| reference_id | uuid | No (policy_id hoặc claim_id) |

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "hoa-don-benh-vien.pdf",
    "file_url": "https://storage.insurance-system.vn/docs/uuid.pdf",
    "file_size": 1248000,
    "mime_type": "application/pdf",
    "type": "invoice",
    "uploaded_at": "2026-05-15T10:30:00.000Z"
  }
}
```

---

### GET `/documents/:id`

Lấy thông tin document.

---

### DELETE `/documents/:id`

Xóa document (chỉ khi chưa được xử lý).

---

## Summary - Endpoint Count

| Module | Endpoints | Methods |
|--------|-----------|---------|
| Authentication | 8 | POST |
| Customers | 7 | GET, PUT, POST |
| Products | 5 | GET, POST |
| Quotes | 6 | GET, POST |
| Policies | 7 | GET, POST |
| Claims | 6 | GET, POST |
| Payments | 5 | GET, POST |
| Notifications | 4 | GET, PATCH, POST, PUT |
| Admin | 10 | GET, POST, PUT, PATCH |
| Documents | 3 | GET, POST, DELETE |
| **Total** | **61** | - |
