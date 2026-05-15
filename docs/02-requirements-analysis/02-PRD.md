# Product Requirements Document (PRD)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên sản phẩm | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Product Owner | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Tổng quan sản phẩm

### 1.1. Problem Statement
Người dân Việt Nam gặp khó khăn trong việc tìm kiếm, so sánh và mua bảo hiểm phù hợp do:
- Quy trình phức tạp, mất nhiều thời gian
- Thiếu minh bạch về giá và quyền lợi
- Không có công cụ so sánh hiệu quả
- Áp lực từ đại lý, tư vấn thiếu khách quan

### 1.2. Solution
Nền tảng InsurTech cho phép khách hàng:
- So sánh sản phẩm từ nhiều công ty bảo hiểm
- Mua bảo hiểm 100% online trong < 5 phút
- Quản lý hợp đồng và yêu cầu bồi thường trực tuyến
- Nhận tư vấn AI-powered, khách quan

### 1.3. Target Users

**Persona 1: Minh - Young Professional**
- 28 tuổi, developer tại TPHCM
- Thu nhập 25 triệu/tháng
- Cần: Bảo hiểm xe máy + sức khỏe
- Hành vi: Tìm hiểu online, quyết định nhanh
- Pain: Ghét gặp đại lý, muốn tự tìm hiểu

**Persona 2: Hương - Young Mother**
- 35 tuổi, nhân viên văn phòng, 1 con nhỏ
- Thu nhập gia đình 40 triệu/tháng
- Cần: Bảo hiểm sức khỏe gia đình + nhân thọ
- Hành vi: Research kỹ, hỏi ý kiến bạn bè
- Pain: Confused bởi nhiều lựa chọn, sợ bị lừa

**Persona 3: Anh Tuấn - SME Owner**
- 42 tuổi, chủ doanh nghiệp 50 nhân viên
- Cần: Bảo hiểm nhóm + tài sản + trách nhiệm
- Hành vi: Ít thời gian, cần giải pháp nhanh
- Pain: Mất thời gian đàm phán với nhiều công ty

---

## 2. User Journeys

### 2.1. Journey 1: Mua bảo hiểm xe máy (Simple product)

```
Step 1: Landing Page
├── User thấy quảng cáo hoặc search "mua bảo hiểm xe máy online"
├── Truy cập website → Chọn "Bảo hiểm xe máy"
└── CTA: "Nhận báo giá ngay"

Step 2: Nhập thông tin xe
├── Biển số xe (tự động lookup)
├── Loại xe, năm sản xuất
├── Mục đích sử dụng
└── CTA: "Xem giá"

Step 3: So sánh báo giá
├── Hiển thị giá từ 3-5 công ty bảo hiểm
├── So sánh quyền lợi side-by-side
├── Filter theo giá / quyền lợi
└── CTA: "Chọn gói này"

Step 4: Điền thông tin cá nhân
├── Họ tên, CCCD, ngày sinh
├── Địa chỉ, số điện thoại, email
├── Upload ảnh CCCD (eKYC)
└── CTA: "Tiếp tục thanh toán"

Step 5: Thanh toán
├── Chọn phương thức thanh toán
├── Xác nhận thanh toán
├── Nhận OTP / xác thực
└── Thanh toán thành công

Step 6: Nhận hợp đồng
├── Hiển thị xác nhận thành công
├── Gửi email + SMS xác nhận
├── Link tải hợp đồng PDF
└── Hướng dẫn tiếp theo (claims, renewal)
```

### 2.2. Journey 2: Mua bảo hiểm sức khỏe (Complex product)

```
Step 1: Tìm hiểu sản phẩm
├── Browse health insurance products
├── Đọc so sánh các gói
├── Sử dụng AI recommendation
└── CTA: "Bắt đầu báo giá"

Step 2: Health Declaration
├── Thông tin cá nhân (tuổi, giới tính)
├── Tiền sử bệnh
├── Thói quen (hút thuốc, rượu bia)
├── Nghề nghiệp
└── Thông tin gia đình (nếu mua family plan)

Step 3: Customize Coverage
├── Chọn mức bảo hiểm (sum insured)
├── Chọn phạm vi (nội trú, ngoại trú, nha khoa)
├── Chọn mức miễn thường (deductible)
├── Xem quyền lợi chi tiết
└── Tùy chọn riders (bệnh hiểm nghèo, thai sản)

Step 4: So sánh & Chọn
├── So sánh 3-5 providers
├── Xem chi tiết từng gói
├── Highlight best value
└── CTA: "Chọn gói"

Step 5: Underwriting
├── Auto-underwriting check
├── Nếu pass → tiếp tục thanh toán
├── Nếu cần thêm info → yêu cầu khám sức khỏe
└── Nếu decline → suggest alternatives

Step 6: Payment & Issuance
├── Thanh toán (annual / quarterly / monthly)
├── E-signature
├── Policy issuance
└── Welcome email + onboarding
```

### 2.3. Journey 3: Yêu cầu bồi thường (Claims)

```
Step 1: Đăng nhập & Chọn hợp đồng
├── Login vào dashboard
├── Chọn hợp đồng cần claim
└── CTA: "Yêu cầu bồi thường"

Step 2: Mô tả sự kiện
├── Loại sự kiện (tai nạn, bệnh, mất mát)
├── Ngày xảy ra sự kiện
├── Mô tả chi tiết
├── Số tiền yêu cầu
└── CTA: "Upload chứng từ"

Step 3: Upload tài liệu
├── Hóa đơn viện phí / sửa chữa
├── Biên bản (tai nạn, mất cắp)
├── Ảnh chụp thiệt hại
├── Giấy ra viện / chứng nhận
└── CTA: "Nộp yêu cầu"

Step 4: Xác nhận & Theo dõi
├── Xác nhận đã nhận yêu cầu
├── Mã số claim để theo dõi
├── Timeline dự kiến
├── Notification khi có update
└── Status: Submitted → In Review → Approved → Paid

Step 5: Nhận bồi thường
├── Thông báo phê duyệt
├── Số tiền được duyệt
├── Chuyển khoản vào tài khoản
└── Rating & feedback
```

---

## 3. Feature Specifications

### 3.1. F-001: Product Catalog

**Description**: Hiển thị tất cả sản phẩm bảo hiểm có sẵn

**Requirements**:
- Trang listing tất cả categories (7 nhóm chính)
- Trang chi tiết sản phẩm (benefits, exclusions, pricing)
- Comparison tool (so sánh tối đa 4 sản phẩm)
- Search & filter (theo giá, coverage, insurer, rating)
- AI recommendation banner

**UI Components**:
- Category cards with icons
- Product cards with key info (price, top benefits, rating)
- Comparison table (expandable sections)
- Filter sidebar
- Sort dropdown

### 3.2. F-002: Quote Engine

**Description**: Tính toán báo giá real-time

**Requirements**:
- Multi-step form (progressive disclosure)
- Real-time price update khi thay đổi options
- Multi-insurer pricing trong 1 request
- Save quote for later (guest: email, logged in: account)
- Quote expiry management (30 days)
- Quote sharing (link, email, SMS)

**Technical**:
- Request insurer APIs in parallel
- Cache common quotes (5 minute TTL)
- Fallback to cached pricing if API timeout
- Rate limiting per user (50 quotes/day)

### 3.3. F-003: Purchase Flow

**Description**: End-to-end purchase journey

**Requirements**:
- Step-by-step wizard UI
- Form validation (real-time)
- eKYC integration (OCR for CCCD)
- E-signature (OTP-based)
- Payment gateway integration
- Instant policy issuance
- Confirmation page + email

**Business Rules**:
- Minimum age: 18 (purchaser), 0 (insured person)
- Maximum age: varies by product (60-70 for health)
- Required documents: CCCD/Passport
- Cooling-off: 21 days for life insurance
- Maximum coverage: varies by product & insurer

### 3.4. F-004: Customer Dashboard

**Description**: Trang quản lý cá nhân cho khách hàng

**Sections**:
- Overview (active policies, upcoming renewals, pending claims)
- My Policies (list, detail, download)
- My Claims (submit, track, history)
- Payment History (receipts, invoices)
- Profile (personal info, beneficiaries, preferences)
- Notifications (in-app, settings)
- Documents (uploaded docs, policy docs)

### 3.5. F-005: Claims Portal

**Description**: Submit và track claims online

**Requirements**:
- Multi-step claim submission form
- Document upload (drag & drop, camera capture)
- File types: JPG, PNG, PDF (max 10MB each, 50MB total)
- Claim status tracking (timeline view)
- Communication thread with claims handler
- Claim amount calculator (estimate)
- Fast-track for simple claims (< 5 triệu VND)

### 3.6. F-006: Admin Panel

**Description**: Back-office management system

**Modules**:
- Dashboard (KPIs, alerts, tasks)
- Product Management (CRUD, pricing rules, availability)
- Customer Management (search, view, edit, communications)
- Policy Management (view, endorse, cancel, renew)
- Claims Management (queue, assign, process, approve/reject)
- Partner Management (insurers, settings, commission)
- Content Management (pages, FAQs, blog)
- Reports & Analytics (predefined + custom)
- User Management (roles, permissions)
- Settings (system config, notifications, integrations)

### 3.7. F-007: Notification System

**Description**: Multi-channel notifications

**Channels**:
- Email (transactional + marketing)
- SMS (OTP, critical alerts)
- Push notification (future: mobile app)
- In-app notification center

**Trigger Events**:
| Event | Email | SMS | In-app |
|-------|-------|-----|--------|
| Registration | ✓ | ✓ | - |
| Purchase confirmation | ✓ | ✓ | ✓ |
| Policy issuance | ✓ | - | ✓ |
| Payment reminder | ✓ | ✓ | ✓ |
| Renewal reminder | ✓ | ✓ | ✓ |
| Claim status update | ✓ | ✓ | ✓ |
| Claim settlement | ✓ | ✓ | ✓ |
| Promotion | ✓ | - | ✓ |

---

## 4. Non-functional Requirements (Summary)

| Category | Requirement |
|----------|-------------|
| Performance | Page load < 3s, API response < 500ms |
| Scalability | 10K concurrent users, horizontal scaling |
| Security | HTTPS, encryption, OWASP top 10 |
| Availability | 99.9% uptime |
| Compliance | Insurance regulations, PDPA, PCI-DSS |
| Accessibility | WCAG 2.1 Level AA |
| Localization | Vietnamese (primary), English (secondary) |
| Browser Support | Chrome, Safari, Firefox, Edge (latest 2 versions) |

---

## 5. Release Plan

| Release | Timeline | Features | Success Criteria |
|---------|----------|----------|-----------------|
| MVP (v0.1) | Month 3 | Motor + Travel + Payment + Basic Dashboard | 1K policies sold |
| v1.0 | Month 6 | + Health + Comparison + Claims | 5K policies/month |
| v1.5 | Month 9 | + Life + AI Recommendation + Mobile | 10K policies/month |
| v2.0 | Month 12 | + Business + B2B + Advanced Analytics | 15K policies/month |

---

## 6. Open Questions

| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Giấy phép môi giới - timeline chính xác? | Legal | Week 2 |
| 2 | Insurer API documentation availability? | BD | Week 3 |
| 3 | eKYC provider selection? | CTO | Week 2 |
| 4 | Payment gateway fees comparison? | Finance | Week 2 |
| 5 | Data hosting location requirements? | CTO + Legal | Week 3 |
