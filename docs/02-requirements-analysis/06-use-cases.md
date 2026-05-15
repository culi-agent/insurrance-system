# Use Cases - Các Trường Hợp Sử Dụng

---

## 1. Use Case Diagram (Overview)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        INSURANCE SYSTEM                                │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │ Browse   │  │ Get      │  │ Purchase │  │ Manage       │   │  │
│  │  │ Products │  │ Quote    │  │ Policy   │  │ Policy       │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │ Submit   │  │ Make     │  │ Manage   │  │ Get          │   │  │
│  │  │ Claim    │  │ Payment  │  │ Profile  │  │ Recommendation│  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │  │
│  │                                                                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘

Actors:
👤 Guest User          → Browse, Quote
👤 Customer            → All above + Purchase, Manage, Claims
👤 Admin               → Product/User/Claims Management
👤 Partner (Insurer)   → Product Config, Claims Processing
🔌 Payment Gateway     → Payment Processing
🔌 Insurer API         → Quote, Issuance, Claims
🔌 eKYC Service        → Identity Verification
```

---

## 2. Detailed Use Cases

### UC-001: Browse Insurance Products

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-001 |
| **Title** | Browse Insurance Products |
| **Actor** | Guest User / Customer |
| **Goal** | Tìm hiểu và khám phá các sản phẩm bảo hiểm |
| **Precondition** | Không yêu cầu |
| **Trigger** | User truy cập website |

**Main Flow:**
1. User truy cập trang chủ
2. System hiển thị categories bảo hiểm (7 nhóm)
3. User chọn category quan tâm
4. System hiển thị danh sách sản phẩm trong category
5. User áp dụng filters (giá, insurer, features)
6. System cập nhật kết quả theo filters
7. User click vào sản phẩm
8. System hiển thị chi tiết sản phẩm

**Alternative Flow:**
- 3a. User sử dụng search: nhập keyword → System hiển thị kết quả
- 5a. User sử dụng sort: chọn criteria → System sắp xếp lại
- 7a. User thêm vào so sánh: click "So sánh" → System thêm vào compare tray

**Exception Flow:**
- 4a. Không có sản phẩm nào: Hiển thị "Không tìm thấy" + gợi ý
- 8a. Sản phẩm hết hiệu lực: Hiển thị thông báo + gợi ý tương tự

**Postcondition:** User có thể xem thông tin sản phẩm và chuyển sang báo giá

---

### UC-002: Get Insurance Quote

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-002 |
| **Title** | Get Insurance Quote (Nhận báo giá) |
| **Actor** | Guest User / Customer |
| **Goal** | Nhận báo giá bảo hiểm dựa trên thông tin cá nhân |
| **Precondition** | Đã chọn loại bảo hiểm |
| **Trigger** | Click "Nhận báo giá" |

**Main Flow:**
1. User click "Nhận báo giá" từ product page
2. System hiển thị form nhập thông tin (step 1: thông tin cơ bản)
3. User điền thông tin required
4. System validate real-time, hiển thị lỗi nếu có
5. User click "Tiếp tục"
6. System hiển thị step 2 (coverage options)
7. User chọn mức bảo hiểm, riders, deductible
8. User click "Xem báo giá"
9. System gọi API các insurer partners (parallel)
10. System hiển thị kết quả so sánh (giá từ nhiều công ty)
11. User xem chi tiết từng báo giá
12. User có thể tùy chỉnh → System recalculate real-time

**Alternative Flow:**
- 9a. Timeout từ 1 insurer: Hiển thị kết quả available, mark timeout one
- 10a. Chỉ 1 insurer available: Hiển thị single quote + suggest other products
- 12a. User muốn save: Yêu cầu đăng nhập (nếu guest) → Save to account
- 12b. User muốn share: Generate link/email

**Exception Flow:**
- 3a. Ineligible (tuổi, nghề nghiệp): Hiển thị lý do + sản phẩm thay thế
- 9a. All insurers timeout: Hiển thị cached prices + "Liên hệ tư vấn"

**Postcondition:** User có báo giá để quyết định mua hoặc lưu lại

---

### UC-003: Purchase Insurance Policy

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-003 |
| **Title** | Purchase Insurance Policy (Mua bảo hiểm) |
| **Actor** | Customer (authenticated) |
| **Goal** | Hoàn tất mua bảo hiểm và nhận hợp đồng |
| **Precondition** | Đã có báo giá, đã đăng nhập |
| **Trigger** | Click "Mua ngay" từ quote |

**Main Flow:**
1. User click "Mua ngay" trên báo giá đã chọn
2. System kiểm tra authentication (redirect login nếu chưa)
3. System hiển thị form thông tin cá nhân (pre-fill nếu có)
4. User điền/xác nhận thông tin cá nhân
5. System yêu cầu eKYC (upload CCCD)
6. User upload ảnh CCCD mặt trước + mặt sau
7. System gọi eKYC API → OCR + verify → Auto-fill fields
8. System hiển thị summary (thông tin + coverage + giá)
9. User đồng ý Terms & Conditions
10. System chạy underwriting check
11. Underwriting PASS → hiển thị payment page
12. User chọn phương thức thanh toán
13. System redirect đến payment gateway
14. User hoàn tất thanh toán
15. Payment gateway callback → System confirm
16. System tạo policy → Generate PDF → Activate
17. System gửi email + SMS xác nhận (kèm PDF)
18. System hiển thị trang "Mua thành công"

**Alternative Flow:**
- 6a. eKYC failed: Cho phép nhập thủ công + mark for manual review
- 10a. Underwriting REFER: Thông báo "Đang xét duyệt" → Notify khi có kết quả
- 10b. Underwriting DECLINE: Hiển thị lý do + gợi ý sản phẩm thay thế
- 14a. Payment failed: Hiển thị lỗi + cho phép retry hoặc đổi method
- 14b. Payment timeout: Cancel session + offer to resume

**Exception Flow:**
- 7a. eKYC service down: Fallback to manual entry, manual verification later
- 13a. Payment gateway down: Show alternative methods
- 15a. Callback timeout: Poll status, notify user when confirmed

**Postcondition:** Policy active, customer có thể xem trong dashboard

**Business Rules:**
- Purchaser phải >= 18 tuổi
- CCCD phải còn hiệu lực
- Sum insured không vượt quá giới hạn theo quy định
- Effective date >= current date
- Payment phải hoàn tất trong 30 phút (session timeout)

---

### UC-004: Submit Insurance Claim

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-004 |
| **Title** | Submit Insurance Claim (Yêu cầu bồi thường) |
| **Actor** | Customer |
| **Goal** | Nộp yêu cầu bồi thường và nhận xử lý |
| **Precondition** | Có policy active, sự kiện trong coverage |
| **Trigger** | Click "Yêu cầu bồi thường" |

**Main Flow:**
1. User login → Dashboard → Click "Yêu cầu bồi thường"
2. System hiển thị danh sách policies eligible cho claim
3. User chọn policy
4. System hiển thị form claim (dựa trên product type)
5. User điền thông tin sự kiện (ngày, mô tả, số tiền)
6. System validate (event date within policy period, etc.)
7. System hiển thị danh sách documents cần thiết
8. User upload documents (ảnh, PDF)
9. System validate files (format, size)
10. User review tất cả thông tin
11. User click "Nộp yêu cầu"
12. System tạo claim → assign to handler → notify
13. System hiển thị confirmation (claim number, timeline)
14. System gửi email xác nhận

**Alternative Flow:**
- 6a. Event date outside policy: Thông báo "Sự kiện không thuộc thời hạn BH"
- 8a. Documents không đủ: Cho phép submit, mark "Cần bổ sung"
- 8b. File quá lớn: Hiển thị lỗi, suggest compress

**Postcondition:** Claim được tạo, customer có thể track status

---

### UC-005: Track Claim Status

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-005 |
| **Title** | Track Claim Status |
| **Actor** | Customer |
| **Goal** | Theo dõi tiến độ yêu cầu bồi thường |
| **Precondition** | Đã submit claim |

**Main Flow:**
1. User login → Dashboard → "Claims" section
2. System hiển thị danh sách claims với status
3. User click vào claim cụ thể
4. System hiển thị timeline chi tiết (mỗi status change)
5. User xem notes/messages từ claims handler
6. User có thể reply/add documents nếu cần

**Status Timeline:**
```
📝 Submitted (15/05/2026 10:30)
   "Yêu cầu đã được tiếp nhận"
   ↓
📋 Documents Review (15/05/2026 14:00)
   "Đang kiểm tra hồ sơ"
   ↓
⚠️  Additional Info Required (16/05/2026 09:00)
   "Cần bổ sung: Giấy ra viện bản gốc"
   ↓
📋 Under Assessment (17/05/2026 11:00)
   "Đang thẩm định"
   ↓
✅ Approved (18/05/2026 16:00)
   "Phê duyệt bồi thường: 15,000,000 VND"
   ↓
💰 Payment Processing (19/05/2026 09:00)
   "Đang xử lý thanh toán"
   ↓
✅ Paid (19/05/2026 15:00)
   "Đã chuyển khoản vào TK: ***1234"
```

---

### UC-006: Renew Insurance Policy

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-006 |
| **Title** | Renew Insurance Policy (Gia hạn hợp đồng) |
| **Actor** | Customer |
| **Goal** | Gia hạn hợp đồng sắp hết hạn |
| **Precondition** | Policy sắp hết hạn (< 30 ngày) |

**Main Flow:**
1. System gửi reminder email (30 ngày trước hết hạn)
2. User click link trong email hoặc vào Dashboard
3. System hiển thị policy sắp hết hạn với renewal quote
4. User review renewal terms (giá mới, thay đổi nếu có)
5. User có thể adjust coverage
6. User click "Gia hạn"
7. System process payment (saved method hoặc new)
8. System issue renewed policy
9. System gửi confirmation

**Alternative Flow:**
- 4a. Giá tăng: Hiển thị lý do + so sánh với cùng kỳ
- 5a. User muốn upgrade/downgrade: Cho phép thay đổi → recalculate
- 7a. Auto-renewal enabled: System tự charge + notify

---

### UC-007: Cancel Insurance Policy

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-007 |
| **Title** | Cancel Insurance Policy (Hủy hợp đồng) |
| **Actor** | Customer |
| **Goal** | Hủy hợp đồng và nhận hoàn phí (nếu có) |
| **Precondition** | Policy đang active |

**Main Flow:**
1. User vào Policy Detail → Click "Hủy hợp đồng"
2. System hiển thị thông tin hủy:
   - Lý do hủy (dropdown)
   - Refund amount (pro-rata calculation)
   - Effective cancellation date
   - Warning: mất quyền lợi bảo hiểm
3. User chọn lý do
4. System calculate refund amount
5. User xác nhận hủy (nhập OTP)
6. System process cancellation
7. System process refund (5-7 ngày)
8. System send confirmation email

**Business Rules:**
- Cooling-off period (life insurance): Full refund trong 21 ngày đầu
- After cooling-off: Pro-rata refund minus admin fee (200K VND)
- Nếu đã có claim: Không hoàn phí
- Cancellation effective: Immediately hoặc end of period (user choice)

---

### UC-008: Compare Insurance Products

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-008 |
| **Title** | Compare Insurance Products |
| **Actor** | Guest / Customer |
| **Goal** | So sánh sản phẩm để chọn phù hợp nhất |
| **Precondition** | Ít nhất 2 sản phẩm cùng category |

**Main Flow:**
1. User browse products → Click "So sánh" trên product cards
2. System thêm product vào comparison tray (floating bar)
3. User thêm product thứ 2 (và 3, 4 nếu muốn)
4. User click "So sánh ngay" trên comparison tray
5. System hiển thị comparison table
6. User có thể expand/collapse sections
7. User click "Mua" trên product ưng ý

**Comparison Table:**
| Feature | Product A | Product B | Product C |
|---------|----------|----------|----------|
| Insurer | Logo + Name | Logo + Name | Logo + Name |
| Annual Premium | ✓ highlighted if lowest | | |
| Sum Insured | | | |
| Inpatient Coverage | ✓/✗ | ✓/✗ | ✓/✗ |
| Outpatient Coverage | ✓/✗ | ✓/✗ | ✓/✗ |
| Waiting Period | 30 days | 60 days | 30 days |
| Network Hospitals | 500+ | 300+ | 400+ |
| Claim Process | Online | Offline | Online |
| Customer Rating | 4.5/5 | 4.0/5 | 4.2/5 |

---

### UC-009: Manage Account Profile

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-009 |
| **Title** | Manage Account Profile |
| **Actor** | Customer |
| **Goal** | Cập nhật thông tin cá nhân |

**Main Flow:**
1. User login → Profile section
2. System hiển thị thông tin hiện tại
3. User edit fields cần thay đổi
4. System validate changes
5. User save changes
6. System update + log change

**Editable Fields:**
| Field | Requires Verification |
|-------|----------------------|
| Display name | No |
| Phone number | OTP to new number |
| Email | OTP to new email |
| Address | No |
| Avatar | No |
| Password | Current password + OTP |
| Notification preferences | No |
| Language preference | No |

**Non-editable (requires support):**
- Full legal name (after KYC)
- CCCD number
- Date of birth

---

### UC-010: Admin - Process Claim

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-010 |
| **Title** | Admin Process Insurance Claim |
| **Actor** | Claims Handler (Admin) |
| **Goal** | Xử lý yêu cầu bồi thường |
| **Precondition** | Claim assigned to handler |

**Main Flow:**
1. Admin login → Claims Queue
2. System hiển thị claims được assign (sorted by priority/SLA)
3. Admin click claim để review
4. System hiển thị full details: policy, customer, event, documents
5. Admin verify documents (checklist)
6. Admin check coverage eligibility
7. Admin calculate settlement amount
8. Admin input decision (Approve/Partial/Reject) + notes
9. System update status → Notify customer
10. If approved → System trigger payment to customer

**Alternative Flow:**
- 5a. Documents incomplete: Mark "Need more info" → Auto-email customer
- 6a. Need escalation: Escalate to senior + insurer review
- 8a. Reject: Must provide detailed reason (selectable + free text)
- 8b. Partial approve: Show original amount vs approved + reason

---

### UC-011: Admin - Manage Products

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-011 |
| **Title** | Admin Manage Insurance Products |
| **Actor** | Admin / Partner |
| **Goal** | Thêm, sửa, ẩn sản phẩm bảo hiểm |

**Main Flow (Add Product):**
1. Admin → Product Management → "Add New"
2. Fill basic info (name, category, insurer, description)
3. Define benefits (structured fields + free text)
4. Define exclusions
5. Set pricing rules (rating factors, base rates)
6. Upload documents (T&C, brochure)
7. Set availability (regions, age range, occupation)
8. Preview product page
9. Save as Draft / Publish

**Product Lifecycle:**
```
Draft → Review → Published → Active
                                ↓
                           Suspended → Archived
```
