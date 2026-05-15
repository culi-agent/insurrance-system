# Permission Matrix - Ma Trận Quyền Hạn

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Áp dụng cho | Tất cả API endpoints |

---

## 1. Tổng quan

### 1.1. Roles trong hệ thống

| Role | Code | Mô tả | Số lượng dự kiến |
|------|------|--------|------------------|
| **Customer** | `customer` | Khách hàng cá nhân/doanh nghiệp | 100,000+ |
| **Admin** | `admin` | Quản trị viên toàn quyền | 3-5 |
| **Operator** | `operator` | Nhân viên vận hành (claims, support) | 20-50 |
| **Partner** | `partner` | Đối tác bảo hiểm (insurer) | 10-20 |
| **Finance** | `finance` | Nhân viên tài chính | 5-10 |
| **Content Manager** | `content_mgr` | Quản lý nội dung | 5-10 |
| **Viewer** | `viewer` | Chỉ xem (báo cáo, dashboard) | 10-20 |

### 1.2. Permission Naming Convention

```
{resource}:{action}

Ví dụ:
- policies:read     → Xem hợp đồng
- policies:create   → Tạo hợp đồng
- claims:approve    → Phê duyệt claim
- admin:users       → Quản lý users
```

---

## 2. Permission Matrix - Customer-Facing APIs

### 2.1. Authentication Module

| Endpoint | Permission | Guest | Customer | Admin | Operator | Partner |
|----------|-----------|-------|----------|-------|----------|---------|
| `POST /auth/register` | - | ✅ | - | - | - | - |
| `POST /auth/verify-otp` | - | ✅ | - | - | - | - |
| `POST /auth/login` | - | ✅ | - | - | - | - |
| `POST /auth/refresh` | - | - | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/logout` | - | - | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/forgot-password` | - | ✅ | - | - | - | - |
| `POST /auth/reset-password` | - | ✅ | - | - | - | - |
| `POST /auth/social/google` | - | ✅ | - | - | - | - |
| `POST /auth/social/facebook` | - | ✅ | - | - | - | - |

### 2.2. Customer Module

| Endpoint | Permission | Customer | Admin | Operator | Partner |
|----------|-----------|----------|-------|----------|---------|
| `GET /customers/me` | `profile:read` | ✅ Own | ✅ | ❌ | ❌ |
| `PUT /customers/me` | `profile:write` | ✅ Own | ✅ | ❌ | ❌ |
| `POST /customers/me/kyc` | `profile:write` | ✅ Own | ✅ | ❌ | ❌ |
| `GET /customers/me/family-members` | `profile:read` | ✅ Own | ✅ | ❌ | ❌ |
| `POST /customers/me/family-members` | `profile:write` | ✅ Own | ✅ | ❌ | ❌ |
| `GET /customers/me/beneficiaries` | `profile:read` | ✅ Own | ✅ | ❌ | ❌ |
| `POST /customers/me/beneficiaries` | `profile:write` | ✅ Own | ✅ | ❌ | ❌ |

### 2.3. Product Module

| Endpoint | Permission | Guest | Customer | Admin | Operator | Partner |
|----------|-----------|-------|----------|-------|----------|---------|
| `GET /products/categories` | - (public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /products` | - (public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /products/:id` | - (public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /products/:id/reviews` | - (public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /products/compare` | - (public) | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.4. Quote Module

| Endpoint | Permission | Guest | Customer | Admin | Operator | Partner |
|----------|-----------|-------|----------|-------|----------|---------|
| `POST /quotes/motor` | `quotes:create` | ✅* | ✅ | ✅ | ✅ | ✅ |
| `POST /quotes/health` | `quotes:create` | ✅* | ✅ | ✅ | ✅ | ✅ |
| `POST /quotes/life` | `quotes:create` | ✅* | ✅ | ✅ | ✅ | ✅ |
| `POST /quotes/travel` | `quotes:create` | ✅* | ✅ | ✅ | ✅ | ✅ |
| `GET /quotes/:id` | `quotes:read` | ❌ | ✅ Own | ✅ | ❌ | ❌ |
| `GET /quotes` | `quotes:read` | ❌ | ✅ Own | ✅ | ❌ | ❌ |
| `POST /quotes/:id/share` | `quotes:write` | ❌ | ✅ Own | ✅ | ❌ | ❌ |

> *Guest có thể tạo quote nhưng không lưu (anonymous quote, rate-limited)

### 2.5. Policy Module

| Endpoint | Permission | Customer | Admin | Operator | Partner |
|----------|-----------|----------|-------|----------|---------|
| `GET /policies` | `policies:read` | ✅ Own | ✅ All | ✅ All | ✅ Own* |
| `GET /policies/:id` | `policies:read` | ✅ Own | ✅ | ✅ | ✅ Own* |
| `POST /policies/:id/renew` | `policies:write` | ✅ Own | ✅ | ❌ | ❌ |
| `POST /policies/:id/cancel` | `policies:write` | ✅ Own | ✅ | ✅ | ❌ |
| `POST /policies/:id/endorse` | `policies:write` | ✅ Own | ✅ | ✅ | ❌ |
| `GET /policies/:id/documents` | `policies:read` | ✅ Own | ✅ | ✅ | ✅ Own* |
| `GET /policies/:id/payment-history` | `payments:read` | ✅ Own | ✅ | ✅ | ❌ |

> *Partner chỉ xem policies thuộc insurer của mình

### 2.6. Claims Module

| Endpoint | Permission | Customer | Admin | Operator | Partner |
|----------|-----------|----------|-------|----------|---------|
| `POST /claims` | `claims:create` | ✅ | ❌ | ✅ | ❌ |
| `GET /claims` | `claims:read` | ✅ Own | ✅ All | ✅ All | ✅ Own* |
| `GET /claims/:id` | `claims:read` | ✅ Own | ✅ | ✅ | ✅ Own* |
| `POST /claims/:id/documents` | `claims:write` | ✅ Own | ✅ | ✅ | ❌ |
| `POST /claims/:id/messages` | `claims:write` | ✅ Own | ✅ | ✅ | ✅ Own* |
| `GET /claims/:id/messages` | `claims:read` | ✅ Own | ✅ | ✅ | ✅ Own* |

> *Partner chỉ xem claims liên quan đến policies của insurer mình

### 2.7. Payment Module

| Endpoint | Permission | Customer | Admin | Operator | Partner | Finance |
|----------|-----------|----------|-------|----------|---------|---------|
| `POST /payments/initiate` | `payments:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /payments/:id` | `payments:read` | ✅ Own | ✅ | ✅ | ❌ | ✅ |
| `GET /payments/history` | `payments:read` | ✅ Own | ✅ | ✅ | ❌ | ✅ |
| `POST /payments/:id/refund` | `payments:refund` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `POST /payments/setup-auto-debit` | `payments:write` | ✅ | ✅ | ❌ | ❌ | ❌ |

### 2.8. Notification Module

| Endpoint | Permission | Customer | Admin | Operator |
|----------|-----------|----------|-------|----------|
| `GET /notifications` | `notifications:read` | ✅ Own | ✅ | ✅ Own |
| `PATCH /notifications/:id/read` | `notifications:write` | ✅ Own | ✅ | ✅ Own |
| `POST /notifications/read-all` | `notifications:write` | ✅ Own | ✅ | ✅ Own |
| `PUT /notifications/preferences` | `notifications:write` | ✅ Own | ✅ | ✅ Own |

### 2.9. Document Module

| Endpoint | Permission | Customer | Admin | Operator | Partner |
|----------|-----------|----------|-------|----------|---------|
| `POST /documents/upload` | `documents:create` | ✅ | ✅ | ✅ | ❌ |
| `GET /documents/:id` | `documents:read` | ✅ Own | ✅ | ✅ | ✅ Own* |
| `DELETE /documents/:id` | `documents:delete` | ✅ Own** | ✅ | ❌ | ❌ |

> *Partner chỉ xem documents liên quan đến policies/claims của mình
> **Customer chỉ xóa documents chưa được xử lý

---

## 3. Permission Matrix - Admin APIs

### 3.1. Admin Dashboard & Management

| Endpoint | Permission | Admin | Operator | Finance | Content Mgr | Viewer |
|----------|-----------|-------|----------|---------|-------------|--------|
| `GET /admin/dashboard` | `admin:dashboard` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `GET /admin/customers` | `admin:customers:read` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `GET /admin/customers/:id` | `admin:customers:read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PUT /admin/customers/:id` | `admin:customers:write` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /admin/policies` | `admin:policies:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `GET /admin/claims` | `admin:claims:read` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `PATCH /admin/claims/:id/assign` | `admin:claims:assign` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PATCH /admin/claims/:id/decision` | `admin:claims:decide` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /admin/partners` | `admin:partners:read` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `POST /admin/partners` | `admin:partners:write` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /admin/products` | `admin:products:write` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `PUT /admin/products/:id` | `admin:products:write` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `GET /admin/reports/:type` | `admin:reports:read` | ✅ | ✅ | ✅ | ❌ | ✅ |

### 3.2. User & Role Management

| Endpoint | Permission | Admin | Operator | Finance | Content Mgr |
|----------|-----------|-------|----------|---------|-------------|
| `GET /admin/users` | `admin:users:read` | ✅ | ❌ | ❌ | ❌ |
| `POST /admin/users` | `admin:users:create` | ✅ | ❌ | ❌ | ❌ |
| `PUT /admin/users/:id/role` | `admin:users:assign_role` | ✅ | ❌ | ❌ | ❌ |
| `DELETE /admin/users/:id` | `admin:users:delete` | ✅ | ❌ | ❌ | ❌ |
| `GET /admin/audit-log` | `admin:audit:read` | ✅ | ❌ | ❌ | ❌ |
| `GET /admin/settings` | `admin:settings:read` | ✅ | ❌ | ❌ | ❌ |
| `PUT /admin/settings` | `admin:settings:write` | ✅ | ❌ | ❌ | ❌ |

---

## 4. Permission Matrix - Partner APIs

### 4.1. Partner-specific Endpoints

| Endpoint | Permission | Partner (Own) | Admin |
|----------|-----------|---------------|-------|
| `GET /partner/products` | `partner:products:read` | ✅ | ✅ |
| `PUT /partner/products/:id` | `partner:products:write` | ✅ | ✅ |
| `GET /partner/policies` | `partner:policies:read` | ✅ Own | ✅ |
| `GET /partner/claims` | `partner:claims:read` | ✅ Own | ✅ |
| `POST /partner/claims/:id/response` | `partner:claims:write` | ✅ Own | ✅ |
| `GET /partner/commission` | `partner:finance:read` | ✅ Own | ✅ |
| `GET /partner/reports` | `partner:reports:read` | ✅ Own | ✅ |
| `GET /partner/webhooks` | `partner:webhooks:read` | ✅ Own | ✅ |
| `POST /partner/webhooks` | `partner:webhooks:write` | ✅ Own | ✅ |

---

## 5. Data Access Scope (Row-Level Security)

### 5.1. Ownership Rules

| Role | Có thể truy cập data |
|------|----------------------|
| **Customer** | Chỉ data của chính mình (own policies, claims, payments) |
| **Admin** | Tất cả data trong hệ thống |
| **Operator** | Tất cả customer data (để support) |
| **Partner** | Chỉ policies/claims liên quan đến insurer của mình |
| **Finance** | Payment/commission data, không thấy PII chi tiết |
| **Content Manager** | Products, content. Không thấy customer data |
| **Viewer** | Aggregated data (reports/dashboard). Không thấy PII |

### 5.2. Data Filtering Rules

```typescript
// Pseudo-code for data access filtering
function applyDataScope(query: Query, user: AuthenticatedUser): Query {
  switch (user.role) {
    case 'customer':
      return query.where('customer_id', '=', user.id);

    case 'partner':
      return query.where('insurer_id', '=', user.partner_id);

    case 'finance':
      return query.select(FINANCIAL_FIELDS_ONLY);

    case 'viewer':
      return query.select(AGGREGATED_FIELDS_ONLY);

    case 'admin':
    case 'operator':
      return query; // Full access
  }
}
```

---

## 6. Special Permission Rules

### 6.1. KYC-Gated Permissions

Một số actions yêu cầu KYC đã verified:

| Action | KYC Required | Lý do |
|--------|-------------|--------|
| Mua bảo hiểm (purchase) | ✅ Yes | Pháp luật yêu cầu |
| Submit claim | ✅ Yes | Xác minh danh tính |
| Rút tiền / refund | ✅ Yes | Chống gian lận |
| Tạo báo giá (quote) | ❌ No | Cho phép trải nghiệm |
| Xem sản phẩm | ❌ No | Public |
| Cập nhật profile | ❌ No | Cơ bản |

### 6.2. Time-based Permissions

| Action | Time Constraint |
|--------|----------------|
| Hủy policy (cooling-off) | Trong 21 ngày đầu (nhân thọ) |
| Sửa claim | Chỉ khi status = `submitted` |
| Xóa document | Chỉ khi chưa được review |
| Edit quote | Chỉ khi chưa expired |

### 6.3. Amount-based Permissions

| Action | Operator | Admin |
|--------|----------|-------|
| Approve claim ≤ 10 triệu | ✅ | ✅ |
| Approve claim 10-100 triệu | ❌ (cần escalate) | ✅ |
| Approve claim > 100 triệu | ❌ | ✅ (cần 2 admin approve) |
| Process refund ≤ 5 triệu | ✅ | ✅ |
| Process refund > 5 triệu | ❌ | ✅ |

---

## 7. Permission Enforcement Points

### 7.1. Enforcement Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                              │
│                                                              │
│  Client → API Gateway → Auth Middleware → Route Handler     │
│              │               │                │              │
│              ▼               ▼                ▼              │
│        ┌──────────┐  ┌──────────────┐  ┌──────────────┐   │
│        │ Rate     │  │ Permission   │  │ Data Scope   │   │
│        │ Limiting │  │ Check        │  │ Filter       │   │
│        │          │  │              │  │              │   │
│        │ Per-role │  │ Role-based   │  │ Row-level    │   │
│        │ limits   │  │ + Resource   │  │ security     │   │
│        └──────────┘  └──────────────┘  └──────────────┘   │
│                                                              │
│  Layer 1: Gateway    Layer 2: Middleware    Layer 3: Service │
│  (Authentication)    (Authorization)        (Data Access)    │
└────────────────────────────────────────────────────────────┘
```

### 7.2. Middleware Example

```typescript
// Permission check middleware
function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // From JWT verification

    // Check if user has ALL required permissions
    const hasAll = permissions.every(perm =>
      user.permissions.includes(perm)
    );

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền thực hiện hành động này',
          required_permissions: permissions,
        }
      });
    }

    next();
  };
}

// Usage in routes
router.get('/policies',
  authenticate,
  requirePermission('policies:read'),
  policiesController.list
);

router.patch('/admin/claims/:id/decision',
  authenticate,
  requirePermission('admin:claims:decide'),
  claimsController.decide
);
```

---

## 8. Full Permission List

### 8.1. All Permissions

| # | Permission | Mô tả |
|---|-----------|--------|
| 1 | `profile:read` | Xem thông tin cá nhân |
| 2 | `profile:write` | Cập nhật thông tin cá nhân |
| 3 | `quotes:create` | Tạo báo giá |
| 4 | `quotes:read` | Xem báo giá |
| 5 | `quotes:write` | Sửa/share báo giá |
| 6 | `policies:read` | Xem hợp đồng |
| 7 | `policies:write` | Tạo/sửa/hủy/gia hạn hợp đồng |
| 8 | `claims:create` | Nộp yêu cầu bồi thường |
| 9 | `claims:read` | Xem claims |
| 10 | `claims:write` | Cập nhật claims (documents, messages) |
| 11 | `payments:create` | Khởi tạo thanh toán |
| 12 | `payments:read` | Xem lịch sử thanh toán |
| 13 | `payments:write` | Cập nhật payment settings |
| 14 | `payments:refund` | Thực hiện hoàn tiền |
| 15 | `notifications:read` | Xem thông báo |
| 16 | `notifications:write` | Cập nhật notification settings |
| 17 | `documents:create` | Upload tài liệu |
| 18 | `documents:read` | Xem tài liệu |
| 19 | `documents:delete` | Xóa tài liệu |
| 20 | `admin:dashboard` | Xem admin dashboard |
| 21 | `admin:customers:read` | Xem danh sách khách hàng |
| 22 | `admin:customers:write` | Cập nhật khách hàng |
| 23 | `admin:policies:read` | Xem tất cả policies |
| 24 | `admin:claims:read` | Xem tất cả claims |
| 25 | `admin:claims:assign` | Giao claims cho handler |
| 26 | `admin:claims:decide` | Phê duyệt/từ chối claims |
| 27 | `admin:partners:read` | Xem đối tác |
| 28 | `admin:partners:write` | Quản lý đối tác |
| 29 | `admin:products:read` | Xem sản phẩm (admin) |
| 30 | `admin:products:write` | Quản lý sản phẩm |
| 31 | `admin:reports:read` | Xem báo cáo |
| 32 | `admin:users:read` | Xem users (admin) |
| 33 | `admin:users:create` | Tạo user mới |
| 34 | `admin:users:assign_role` | Gán role |
| 35 | `admin:users:delete` | Xóa user |
| 36 | `admin:audit:read` | Xem audit log |
| 37 | `admin:settings:read` | Xem cài đặt hệ thống |
| 38 | `admin:settings:write` | Cập nhật cài đặt |
| 39 | `partner:products:read` | Partner xem sản phẩm |
| 40 | `partner:products:write` | Partner cập nhật sản phẩm |
| 41 | `partner:policies:read` | Partner xem policies |
| 42 | `partner:claims:read` | Partner xem claims |
| 43 | `partner:claims:write` | Partner respond claims |
| 44 | `partner:finance:read` | Partner xem commission |
| 45 | `partner:reports:read` | Partner xem reports |
| 46 | `partner:webhooks:read` | Partner xem webhooks |
| 47 | `partner:webhooks:write` | Partner quản lý webhooks |

### 8.2. Role → Permission Mapping Summary

| Role | Permission Count | Permission Groups |
|------|-----------------|-------------------|
| Customer | 17 | profile, quotes, policies, claims, payments, notifications, documents |
| Admin | 38 | All customer + all admin permissions |
| Operator | 22 | customer-view + claims management + support |
| Partner | 9 | partner:* permissions only |
| Finance | 10 | payments, reports, commission |
| Content Manager | 6 | products, content |
| Viewer | 5 | dashboard, reports (read-only) |
