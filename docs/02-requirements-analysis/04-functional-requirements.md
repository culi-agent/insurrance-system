# Functional Requirements - Yêu Cầu Chức Năng Chi Tiết

## 1. Module: Đăng ký & Xác thực (Authentication)

### FR-AUTH-001: Đăng ký tài khoản
| Field | Description |
|-------|-------------|
| ID | FR-AUTH-001 |
| Title | Đăng ký tài khoản mới |
| Actor | Guest User |
| Precondition | User chưa có tài khoản |
| Trigger | Click "Đăng ký" |

**Input Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, unique |
| phone | string | Yes | VN phone format (+84), unique |
| password | string | Yes | Min 8 chars, 1 upper, 1 number, 1 special |
| confirm_password | string | Yes | Must match password |
| full_name | string | Yes | 2-100 chars, Vietnamese characters allowed |
| agree_terms | boolean | Yes | Must be true |

**Business Rules:**
1. Email phải unique trong hệ thống
2. Phone phải unique trong hệ thống
3. Password phải đạt strength criteria
4. Gửi OTP verification qua email VÀ SMS
5. Account inactive cho đến khi verify (1 trong 2 channel)
6. OTP valid 5 phút, max 3 lần resend/session

**Output:**
- Success: Account created, redirect to verification
- Failure: Error message with specific field errors

---

### FR-AUTH-002: Đăng nhập
| Field | Description |
|-------|-------------|
| ID | FR-AUTH-002 |
| Title | Đăng nhập hệ thống |
| Actor | Registered User |
| Precondition | Có tài khoản verified |

**Input Fields:**
| Field | Type | Required |
|-------|------|----------|
| email_or_phone | string | Yes |
| password | string | Yes |
| remember_me | boolean | No |

**Business Rules:**
1. Lock sau 5 lần sai liên tiếp (30 phút)
2. Access token: 15 phút (không remember), 7 ngày (remember)
3. Refresh token: 7 ngày (không remember), 30 ngày (remember)
4. Log all login attempts (IP, device, timestamp)
5. Notify user nếu login từ device mới

---

### FR-AUTH-003: Social Login (Google/Facebook)
| Field | Description |
|-------|-------------|
| ID | FR-AUTH-003 |
| Title | Đăng nhập qua mạng xã hội |
| Actor | Guest/Registered User |

**Flow:**
1. User click "Login with Google/Facebook"
2. Redirect to OAuth provider
3. User authorize
4. Redirect back with token
5. System verify token → Create/Link account → Issue JWT

**Business Rules:**
1. Nếu email đã tồn tại → link account (sau khi verify password)
2. Nếu email mới → tạo account mới (skip email verification)
3. Phone still required for full functionality

---

## 2. Module: Danh mục sản phẩm (Product Catalog)

### FR-PROD-001: Hiển thị danh mục
| Field | Description |
|-------|-------------|
| ID | FR-PROD-001 |
| Title | Hiển thị danh mục sản phẩm bảo hiểm |
| Actor | All Users |

**Categories:**
```
1. Bảo hiểm Nhân thọ (life-insurance)
   ├── Bảo hiểm tử vong (term-life)
   ├── Bảo hiểm hỗn hợp (endowment)
   ├── Bảo hiểm liên kết đầu tư (unit-linked)
   └── Bảo hiểm hưu trí (pension)

2. Bảo hiểm Sức khỏe (health-insurance)
   ├── Nội trú (inpatient)
   ├── Ngoại trú (outpatient)
   ├── Bệnh hiểm nghèo (critical-illness)
   └── Thai sản (maternity)

3. Bảo hiểm Xe cơ giới (motor-insurance)
   ├── TNDS bắt buộc (compulsory-motor)
   ├── Vật chất xe (comprehensive-motor)
   └── Người ngồi trên xe (passenger)

4. Bảo hiểm Tài sản (property-insurance)
   ├── Nhà ở (home)
   ├── Cháy nổ (fire)
   └── Thiên tai (natural-disaster)

5. Bảo hiểm Du lịch (travel-insurance)
   ├── Trong nước (domestic-travel)
   └── Quốc tế (international-travel)

6. Bảo hiểm Trách nhiệm (liability-insurance)
   ├── TNDS chủ xe (motor-liability)
   ├── Trách nhiệm nghề nghiệp (professional-liability)
   └── Trách nhiệm sản phẩm (product-liability)

7. Bảo hiểm Doanh nghiệp (business-insurance)
   ├── Bảo hiểm nhóm (group-insurance)
   ├── Tài sản DN (business-property)
   ├── Gián đoạn KD (business-interruption)
   └── Hàng hóa (cargo)
```

**Filters:**
| Filter | Type | Options |
|--------|------|---------|
| Category | Multi-select | 7 categories |
| Insurer | Multi-select | All active insurers |
| Price Range | Range slider | Min-Max premium |
| Coverage Amount | Range slider | Sum insured range |
| Rating | Star rating | 1-5 stars |
| Features | Checkbox | Specific benefits |

**Sorting:**
- Price: Low to High / High to Low
- Rating: Highest first
- Popularity: Most purchased
- Newest: Latest added

---

### FR-PROD-002: Chi tiết sản phẩm
| Field | Description |
|-------|-------------|
| ID | FR-PROD-002 |
| Title | Xem chi tiết sản phẩm bảo hiểm |
| Actor | All Users |

**Page Sections:**
1. Header: Tên SP, Insurer logo, Rating, Price from
2. Key Benefits (top 5, icon list)
3. Coverage Details (expandable table)
4. Exclusions (clear list)
5. Premium Table (by age/coverage level)
6. Terms & Conditions (downloadable PDF)
7. Claims Process (step-by-step)
8. Customer Reviews
9. FAQ
10. CTA: "Nhận báo giá" / "Mua ngay"

---

### FR-PROD-003: So sánh sản phẩm
| Field | Description |
|-------|-------------|
| ID | FR-PROD-003 |
| Title | So sánh sản phẩm cùng loại |
| Actor | All Users |
| Constraint | Max 4 sản phẩm cùng category |

**Comparison Criteria:**
| Criteria | Display |
|----------|---------|
| Price (annual) | Highlighted lowest |
| Sum Insured | Number |
| Key Benefits | Check/X marks |
| Exclusions | List |
| Waiting Period | Days |
| Claim Process | Steps |
| Customer Rating | Stars |
| Insurer | Logo + name |

---

## 3. Module: Báo giá (Quotation)

### FR-QUOTE-001: Báo giá bảo hiểm xe máy

**Input Form (Step 1 - Vehicle Info):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| vehicle_type | select | Yes | Xe máy/Xe điện |
| license_plate | string | No | Format: 29-X1 12345 |
| brand | select | Yes | Honda, Yamaha, etc. |
| model | select | Yes | Based on brand |
| year | select | Yes | 2000-current |
| engine_cc | number | Yes | 50-2000 |
| usage | select | Yes | Cá nhân/Kinh doanh |
| value | number | Yes | Giá trị xe (VND) |

**Input Form (Step 2 - Coverage):**
| Field | Type | Required |
|-------|------|----------|
| coverage_type | select | Yes: TNDS bắt buộc / Toàn diện |
| sum_insured | select | Yes: Based on vehicle value |
| add_passenger | boolean | No |
| passenger_seats | number | Conditional |
| deductible | select | No: 0 / 500K / 1M |

**Pricing Factors:**
- Base rate theo loại xe, dung tích
- Năm sản xuất (depreciation factor)
- Mục đích sử dụng (business = 1.3x)
- Lịch sử claims (No-claim discount: 10-30%)
- Khu vực (HCM, HN = 1.1x)

---

### FR-QUOTE-002: Báo giá bảo hiểm sức khỏe

**Input Form (Step 1 - Personal Info):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| date_of_birth | date | Yes | 0-65 tuổi |
| gender | select | Yes | Nam/Nữ |
| occupation | select | Yes | Danh mục nghề nghiệp |
| smoking | boolean | Yes | |
| plan_type | select | Yes | Individual/Family |
| family_members | array | Conditional | If family plan |

**Input Form (Step 2 - Health Declaration):**
| Field | Type | Required |
|-------|------|----------|
| pre_existing_conditions | multi-select | Yes |
| current_medications | text | No |
| hospitalized_last_5_years | boolean | Yes |
| hospitalization_details | text | Conditional |
| family_history | multi-select | No |
| height_cm | number | Yes |
| weight_kg | number | Yes |

**Input Form (Step 3 - Coverage Selection):**
| Field | Type | Required |
|-------|------|----------|
| sum_insured | select | Yes: 100M / 200M / 500M / 1B |
| inpatient | boolean | Yes (default true) |
| outpatient | boolean | No |
| dental | boolean | No |
| maternity | boolean | No |
| critical_illness | boolean | No |
| deductible | select | No: 0 / 2M / 5M / 10M |
| copay | select | No: 0% / 10% / 20% |
| network | select | Standard / Premium |

**Pricing Factors:**
- Tuổi (primary factor, exponential after 45)
- Giới tính (Female slightly higher for health)
- BMI (>30 = loading)
- Smoking (+30-50%)
- Occupation class (1-4)
- Pre-existing conditions (loading/exclusion)
- Sum insured level
- Deductible (higher = lower premium)
- Coverage scope (each add-on = additional premium)
- Geographic area

---

### FR-QUOTE-003: Báo giá bảo hiểm nhân thọ

**Input Form:**
| Field | Type | Required |
|-------|------|----------|
| date_of_birth | date | Yes (18-60 tuổi) |
| gender | select | Yes |
| smoking_status | select | Yes: Never/Former/Current |
| occupation | select | Yes |
| annual_income | range | Yes |
| sum_assured | number | Yes: 100M - 10B |
| policy_term | select | Yes: 10/15/20/25/30 years |
| premium_payment_term | select | Yes: 5/10/15/20 years |
| riders | multi-select | No |

**Riders Available:**
- Bệnh hiểm nghèo (CI)
- Tai nạn cá nhân (PA)
- Miễn đóng phí (Premium Waiver)
- Thu nhập thay thế (Income Protection)
- Bảo hiểm y tế bổ sung

---

### FR-QUOTE-004: Báo giá bảo hiểm du lịch

**Input Form:**
| Field | Type | Required |
|-------|------|----------|
| trip_type | select | Yes: Trong nước/Quốc tế |
| destination | select | Conditional: Country/Region |
| departure_date | date | Yes |
| return_date | date | Yes |
| travelers_count | number | Yes: 1-10 |
| traveler_ages | array | Yes |
| coverage_plan | select | Yes: Basic/Standard/Premium |
| activities | multi-select | No: Adventure sports, etc. |

---

## 4. Module: Mua hàng (Purchase)

### FR-PURCH-001: Flow mua bảo hiểm xe máy (Simple)

**Steps:**
```
Step 1: Chọn sản phẩm (từ quote hoặc catalog)
Step 2: Xác nhận thông tin xe
Step 3: Nhập thông tin chủ xe
  - Họ tên
  - CCCD/CMND
  - Ngày sinh
  - Địa chỉ
  - Số điện thoại
  - Email
Step 4: Upload CCCD (eKYC)
Step 5: Xác nhận thông tin & đồng ý điều khoản
Step 6: Thanh toán
Step 7: Nhận hợp đồng (PDF + email)
```

**Business Rules:**
- Chủ xe phải >= 18 tuổi
- CCCD phải còn hiệu lực
- Xe phải có giấy đăng ký
- Hiệu lực bắt đầu từ ngày thanh toán (hoặc ngày chọn)
- Thời hạn: 1 năm (TNDS bắt buộc) hoặc tùy chọn

---

### FR-PURCH-002: Flow mua bảo hiểm sức khỏe (Complex)

**Steps:**
```
Step 1: Chọn gói (từ quote comparison)
Step 2: Điền Health Declaration chi tiết
Step 3: Thông tin người được bảo hiểm
  - Nếu mua cho bản thân: auto-fill
  - Nếu mua cho gia đình: thêm thành viên
Step 4: Chọn người thụ hưởng (beneficiary)
Step 5: eKYC (CCCD/Passport)
Step 6: Underwriting check
  - Auto-approve → Step 7
  - Need more info → Request (email/call)
  - Decline → Show reason + alternatives
Step 7: Xác nhận & Ký điện tử (OTP)
Step 8: Thanh toán
  - Chọn tần suất: Năm/Quý/Tháng
  - Chọn phương thức
Step 9: Policy issuance
  - Gửi Welcome email
  - Policy PDF
  - Insurance card (digital)
  - Hướng dẫn sử dụng quyền lợi
```

---

## 5. Module: Yêu cầu bồi thường (Claims)

### FR-CLAIMS-001: Submit claim bảo hiểm sức khỏe

**Input Form:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | select | Yes | Chọn hợp đồng |
| claim_type | select | Yes | Nội trú/Ngoại trú/Nha khoa |
| hospital_name | string | Yes | Tên bệnh viện/phòng khám |
| admission_date | date | Yes | Ngày nhập viện/khám |
| discharge_date | date | Conditional | Ngày xuất viện (nội trú) |
| diagnosis | string | Yes | Chẩn đoán |
| treatment | text | Yes | Mô tả điều trị |
| total_cost | number | Yes | Tổng chi phí |
| claimed_amount | number | Yes | Số tiền yêu cầu |

**Documents Required:**
| Document | Required | Format |
|----------|----------|--------|
| Hóa đơn viện phí | Yes | PDF/Image |
| Giấy ra viện | Yes (nội trú) | PDF/Image |
| Đơn thuốc | Yes | PDF/Image |
| Kết quả xét nghiệm | If applicable | PDF/Image |
| Giấy chuyển viện | If applicable | PDF/Image |
| CCCD người được BH | Yes | Image |
| Sổ khám bệnh | If applicable | PDF/Image |

**Claim Status Flow:**
```
SUBMITTED
  ↓
DOCUMENTS_REVIEW (1-2 days)
  ↓ (if documents incomplete)
  → ADDITIONAL_INFO_REQUIRED
     ↓ (customer provides)
     → DOCUMENTS_REVIEW
  ↓ (if documents complete)
UNDER_ASSESSMENT (2-5 days)
  ↓
DECISION
  ├── APPROVED → PAYMENT_PROCESSING → PAID → CLOSED
  ├── PARTIALLY_APPROVED → Customer accepts/appeals
  └── REJECTED → Customer informed + appeal option
```

---

### FR-CLAIMS-002: Submit claim bảo hiểm xe

**Input Form:**
| Field | Type | Required |
|-------|------|----------|
| policy_id | select | Yes |
| incident_type | select | Yes: Tai nạn/Trộm cắp/Thiên tai/Khác |
| incident_date | datetime | Yes |
| incident_location | string | Yes |
| description | text | Yes |
| police_report | boolean | Yes |
| police_report_number | string | Conditional |
| estimated_damage | number | Yes |
| third_party_involved | boolean | Yes |
| third_party_details | text | Conditional |
| injured_persons | boolean | Yes |

**Documents Required:**
| Document | Required |
|----------|----------|
| Ảnh thiệt hại (tối thiểu 4 góc) | Yes |
| Biên bản tai nạn/công an | Yes (if applicable) |
| Báo giá sửa chữa | Yes |
| Giấy đăng ký xe | Yes |
| Bằng lái xe | Yes |
| Video (dashcam) | No |

---

## 6. Module: Thanh toán (Payment)

### FR-PAY-001: Các phương thức thanh toán

| Method | Provider | Flow | Settlement |
|--------|----------|------|------------|
| Ví Momo | Momo | QR/Deep link → Confirm | T+1 |
| Ví ZaloPay | ZaloPay | QR/Deep link → Confirm | T+1 |
| VNPay | VNPay | Redirect → Bank select → OTP | T+1 |
| Thẻ ATM nội địa | VNPay | Card info → OTP | T+1 |
| Visa/Mastercard | VNPay/Stripe | Card info → 3DS | T+2 |
| Chuyển khoản | Virtual Account | VA number → Transfer | T+0 to T+1 |
| Trả góp | Bank partners | Redirect → Approval | T+2 |

### FR-PAY-002: Thanh toán định kỳ (Recurring)

**Frequency Options:**
- Annual (giảm 0-5% so với monthly)
- Semi-annual (giảm 0-3%)
- Quarterly
- Monthly (phí cao nhất)

**Auto-debit Setup:**
- Lưu phương thức thanh toán (tokenized)
- Charge tự động theo lịch
- Nhắc nhở trước 7 ngày
- Retry logic: Day 0 → Day 3 → Day 7
- Grace period: 30 ngày sau due date
- Lapse notification nếu không thanh toán

---

## 7. Module: Admin & Operations

### FR-ADMIN-001: Dashboard tổng quan

**Widgets:**
| Widget | Data | Refresh |
|--------|------|---------|
| Revenue Today | Total GWP today | Real-time |
| Policies Sold Today | Count + comparison | Real-time |
| Active Claims | Count by status | 5 min |
| Conversion Funnel | Visit → Quote → Purchase | Hourly |
| Top Products | By volume & revenue | Daily |
| Partner Performance | By insurer | Daily |
| Customer Growth | New registrations | Hourly |
| System Health | Uptime, errors, latency | Real-time |

### FR-ADMIN-002: Quản lý Claims (Operations)

**Queue Management:**
- View all claims by status
- Filter by: date, type, amount, insurer, handler
- Assign claims to handlers
- Priority flagging (high value, VIP customer)
- SLA tracking (time in each status)
- Bulk actions (approve simple claims)

**Claim Processing:**
- View claim details + documents
- Verify documents (checklist)
- Request additional information
- Calculate settlement amount
- Approve/Reject with reason
- Escalate to insurer
- Add internal notes

---

## 8. Module: Reporting & Analytics

### FR-REPORT-001: Sales Reports

**Available Reports:**
| Report | Dimensions | Metrics | Frequency |
|--------|-----------|---------|-----------|
| Sales Summary | Date, Product, Insurer | GWP, Policies, Avg Premium | Daily |
| Conversion Report | Date, Source, Product | Visitors, Quotes, Sales, Rate | Daily |
| Commission Report | Date, Insurer, Product | GWP, Commission %, Amount | Monthly |
| Renewal Report | Date, Product | Due, Renewed, Lapsed, Rate | Weekly |
| Channel Report | Source/Medium | Traffic, Leads, Sales, CAC | Weekly |

### FR-REPORT-002: Customer Analytics

**Reports:**
- Customer Acquisition (by source, date, segment)
- Customer Retention (cohort analysis)
- Customer LTV (by segment, product)
- Customer Satisfaction (NPS, CSAT trends)
- Customer Demographics (age, location, occupation)
