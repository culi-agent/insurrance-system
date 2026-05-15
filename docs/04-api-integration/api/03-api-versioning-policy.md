# API Versioning Policy - Chính Sách Quản Lý Phiên Bản API

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Áp dụng cho | Tất cả Public & Partner APIs |
| Người phê duyệt | CTO |

---

## 1. Versioning Strategy

### 1.1. URI-Based Versioning

Insurance System sử dụng **URI-based versioning** với major version trong URL path:

```
https://api.insurance-system.vn/api/v{major}/{resource}
```

**Ví dụ:**
```
GET /api/v1/products
GET /api/v1/policies
GET /api/v2/quotes
```

### 1.2. Lý do chọn URI Versioning

| Tiêu chí | URI Versioning | Header Versioning | Query Param |
|-----------|---------------|-------------------|-------------|
| Dễ hiểu | ✅ Rõ ràng | ❌ Ẩn | ⚠️ Trung bình |
| Cache-friendly | ✅ Tốt | ❌ Phức tạp | ⚠️ Trung bình |
| Debugging | ✅ Dễ | ❌ Khó | ⚠️ Trung bình |
| RESTful | ⚠️ Không thuần túy | ✅ Thuần túy | ❌ Không |
| Browser testing | ✅ Dễ | ❌ Cần tool | ✅ Dễ |

**Quyết định:** URI versioning vì đơn giản, dễ debug, cache-friendly, phù hợp với team size và đối tác.

---

## 2. Version Numbering

### 2.1. Semantic Versioning (SemVer)

API tuân theo Semantic Versioning `MAJOR.MINOR.PATCH`:

| Component | Khi nào tăng | Ảnh hưởng Client | Ví dụ |
|-----------|-------------|-------------------|-------|
| **MAJOR** | Breaking changes | ❌ Phải cập nhật code | v1 → v2 |
| **MINOR** | Tính năng mới, backward-compatible | ✅ Không ảnh hưởng | v1.0 → v1.1 |
| **PATCH** | Bug fixes, improvements | ✅ Không ảnh hưởng | v1.0.0 → v1.0.1 |

### 2.2. Quy tắc

- **Chỉ MAJOR version** xuất hiện trong URL (`/api/v1/...`)
- MINOR và PATCH được áp dụng tự động (backward-compatible)
- Version hiện tại trả về trong response header: `X-API-Version: 1.2.3`

---

## 3. Breaking Changes (Thay đổi không tương thích)

### 3.1. Định nghĩa Breaking Change

Các thay đổi sau được coi là **breaking change** và yêu cầu tăng MAJOR version:

| # | Loại thay đổi | Ví dụ |
|---|--------------|-------|
| 1 | Xóa endpoint | Bỏ `GET /api/v1/quotes/:id` |
| 2 | Đổi HTTP method | `POST` → `PUT` cho cùng resource |
| 3 | Xóa/đổi tên field trong response | Bỏ field `premium` hoặc đổi thành `total_premium` |
| 4 | Thêm required field vào request | Bắt buộc thêm field `tax_id` khi tạo customer |
| 5 | Thay đổi data type | `price: string` → `price: number` |
| 6 | Thay đổi error code/format | Đổi cấu trúc error response |
| 7 | Thay đổi authentication scheme | Bearer → API Key |
| 8 | Thay đổi pagination format | Offset-based → Cursor-based |
| 9 | Đổi URL structure | `/policies/{id}` → `/insurance-policies/{id}` |
| 10 | Thay đổi enum values | Bỏ giá trị `active` khỏi status enum |

### 3.2. Non-Breaking Changes (Tương thích ngược)

Các thay đổi sau **KHÔNG** yêu cầu tăng version:

| # | Loại thay đổi | Ví dụ |
|---|--------------|-------|
| 1 | Thêm endpoint mới | Thêm `GET /api/v1/analytics` |
| 2 | Thêm optional field vào request | Thêm optional `nickname` |
| 3 | Thêm field mới vào response | Thêm `created_by` vào response |
| 4 | Thêm giá trị mới vào enum | Thêm `suspended` vào status |
| 5 | Thêm optional query parameter | Thêm filter `?region=south` |
| 6 | Tăng rate limit | 100 → 200 req/phút |
| 7 | Cải thiện performance | Response time giảm |
| 8 | Sửa bug (behavior đúng spec) | Fix validation đúng chuẩn |

---

## 4. Deprecation Policy (Chính sách ngừng hỗ trợ)

### 4.1. Deprecation Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPRECATION LIFECYCLE                          │
│                                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐  │
│  │   v2     │  │ Deprecation  │  │  Sunset   │  │  Removed  │  │
│  │ Released │─▶│ Notice (v1)  │─▶│  Period   │─▶│  (v1 off) │  │
│  └──────────┘  └──────────────┘  └───────────┘  └───────────┘  │
│       │              │                  │               │        │
│    Day 0          Day 0            Month 6          Month 12     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

| Phase | Duration | Hành động |
|-------|----------|-----------|
| **Announcement** | Ngay khi v(N+1) release | Thông báo qua email, docs, changelog |
| **Deprecation** | 6 tháng | v(N) vẫn hoạt động, có warning header |
| **Sunset** | 6 tháng tiếp | v(N) trả về 410 Gone cho new clients |
| **Removal** | Sau 12 tháng | v(N) bị tắt hoàn toàn |

### 4.2. Deprecation Headers

Khi API version bị deprecated, response sẽ bao gồm:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 15 Nov 2027 00:00:00 GMT
Link: <https://api.insurance-system.vn/api/v2/products>; rel="successor-version"
X-API-Deprecated-Message: "API v1 sẽ ngừng hoạt động vào 15/11/2027. Vui lòng migrate sang v2."
```

### 4.3. Thông báo cho Clients

| Kênh | Thời điểm | Nội dung |
|------|-----------|----------|
| Email | Ngay khi deprecate | Thông báo + migration guide |
| Developer Portal | Ngay khi deprecate | Banner cảnh báo trên docs |
| API Response Header | Mỗi request | `Deprecation: true` + `Sunset` date |
| Monthly Newsletter | Hàng tháng | Countdown + migration progress |
| Dashboard Alert | Liên tục | Banner cho partners đang dùng old version |

---

## 5. Migration Guide Template

### 5.1. Khi có Major Version mới

Mỗi major version mới phải đi kèm:

1. **Migration Guide**: Document chi tiết breaking changes
2. **Changelog**: Danh sách tất cả thay đổi
3. **Code Examples**: Ví dụ trước/sau cho mỗi breaking change
4. **SDK Update**: Cập nhật client libraries
5. **Sandbox**: Environment để test version mới

### 5.2. Migration Guide Format

```markdown
# Migration Guide: v1 → v2

## Breaking Changes Summary
1. Response format thay đổi cho Quote API
2. Authentication endpoint đổi path
3. Pagination chuyển sang cursor-based

## Detailed Changes

### Change 1: Quote Response Format
**Before (v1):**
{code example}

**After (v2):**
{code example}

**Migration Steps:**
1. ...
2. ...
```

---

## 6. Version Support Matrix

| Version | Status | Released | Deprecated | Sunset | Support Level |
|---------|--------|----------|------------|--------|---------------|
| v1 | ✅ Active | 2026-05-15 | - | - | Full support |
| v2 | 🔮 Planned | TBD | - | - | - |

### Support Levels

| Level | Bao gồm | Áp dụng cho |
|-------|---------|-------------|
| **Full Support** | Bug fixes + Security patches + New features | Current version |
| **Maintenance** | Security patches + Critical bug fixes only | Deprecated version |
| **End of Life** | No support, 410 Gone response | Sunset version |

---

## 7. Version Discovery

### 7.1. API Version Info Endpoint

```
GET /api/versions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_version": "v1",
    "available_versions": [
      {
        "version": "v1",
        "status": "active",
        "released_at": "2026-05-15",
        "base_url": "https://api.insurance-system.vn/api/v1",
        "docs_url": "https://developer.insurance-system.vn/docs/v1"
      }
    ],
    "deprecated_versions": []
  }
}
```

### 7.2. Version Header trong Response

Mọi API response đều có:

```http
X-API-Version: 1.2.3
X-API-Latest-Version: 1.2.3
```

---

## 8. Quy trình Release Version Mới

### 8.1. Checklist trước khi release Major Version

- [ ] Migration guide hoàn thành
- [ ] SDK updated cho tất cả supported languages
- [ ] Sandbox environment ready (v_new)
- [ ] Performance testing passed
- [ ] Security review passed
- [ ] Partner notification sent (30 ngày trước)
- [ ] Documentation updated
- [ ] Changelog published
- [ ] Monitoring & alerting configured cho new version
- [ ] Rollback plan ready

### 8.2. Release Process

```
1. Feature Freeze (2 tuần trước release)
   └── Chỉ bug fixes, không thêm tính năng mới

2. Beta Release (1 tuần trước)
   └── Cho selected partners test trên staging

3. Production Release
   └── Deploy new version, old version vẫn active

4. Deprecation Notice
   └── Gửi thông báo cho tất cả clients

5. Migration Period (6 tháng)
   └── Support cả 2 versions

6. Sunset (sau 12 tháng)
   └── Tắt old version
```

---

## 9. Backward Compatibility Rules

### 9.1. Response Body Rules

```
✅ ĐƯỢC PHÉP:
- Thêm fields mới (clients phải ignore unknown fields)
- Thêm enum values (clients phải handle unknown values gracefully)

❌ KHÔNG ĐƯỢC:
- Xóa fields
- Đổi tên fields
- Thay đổi data types
- Thay đổi null behavior
```

### 9.2. Request Body Rules

```
✅ ĐƯỢC PHÉP:
- Thêm optional fields (có default value)
- Nới lỏng validation (accept more formats)

❌ KHÔNG ĐƯỢC:
- Thêm required fields
- Xóa accepted fields
- Siết chặt validation
- Thay đổi field semantics
```

### 9.3. Client Requirements

Tất cả API clients PHẢI:

1. **Ignore unknown fields** trong response (forward-compatible)
2. **Handle unknown enum values** gracefully
3. **Not depend on field ordering** trong JSON
4. **Handle null values** cho nullable fields
5. **Respect Deprecation headers** và plan migration

---

## 10. Versioning cho Webhooks

Webhooks cũng được version theo cùng scheme:

```json
{
  "webhook_version": "1.0",
  "event": "policy.created",
  "data": { ... }
}
```

- Webhook payload changes tuân theo cùng backward-compatibility rules
- Khi có breaking change → tạo version mới cho webhook
- Partner có thể chọn webhook version trong settings

---

## 11. FAQ

**Q: Khi nào nên tạo v2?**
> Khi có nhiều breaking changes tích lũy mà không thể giải quyết bằng backward-compatible additions. Thường sau 12-18 tháng.

**Q: Có thể skip version không? (v1 → v3)**
> Không. Luôn tăng tuần tự.

**Q: Partner đang dùng v1, có bị ảnh hưởng khi v2 release?**
> Không. v1 vẫn hoạt động ít nhất 12 tháng sau khi v2 release.

**Q: Làm sao biết mình đang dùng version nào?**
> Check response header `X-API-Version` hoặc URL path.

**Q: Nếu quên migrate trước deadline?**
> API sẽ trả về `410 Gone` với body chứa migration guide link.
