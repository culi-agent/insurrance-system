# User Stories & Acceptance Criteria

---

## Epic 1: User Registration & Authentication

### US-1.1: Đăng ký tài khoản
**As a** khách hàng mới  
**I want to** tạo tài khoản trên hệ thống  
**So that** tôi có thể mua và quản lý bảo hiểm trực tuyến

**Acceptance Criteria:**
- [ ] AC-1.1.1: Có thể đăng ký bằng email + password
- [ ] AC-1.1.2: Có thể đăng ký bằng số điện thoại + password
- [ ] AC-1.1.3: Password phải >= 8 ký tự, có chữ hoa, số, ký tự đặc biệt
- [ ] AC-1.1.4: Hiển thị password strength indicator
- [ ] AC-1.1.5: Gửi OTP verification trong 10 giây
- [ ] AC-1.1.6: OTP valid trong 5 phút
- [ ] AC-1.1.7: Hiển thị lỗi rõ ràng nếu email/phone đã tồn tại
- [ ] AC-1.1.8: Redirect đến trang verification sau khi đăng ký

**Story Points:** 5  
**Priority:** P0

---

### US-1.2: Đăng nhập
**As a** khách hàng đã đăng ký  
**I want to** đăng nhập vào hệ thống  
**So that** tôi có thể truy cập tài khoản và dịch vụ

**Acceptance Criteria:**
- [ ] AC-1.2.1: Login bằng email hoặc phone number
- [ ] AC-1.2.2: Hiển thị lỗi "Sai email/password" (không tiết lộ field nào sai)
- [ ] AC-1.2.3: Lock account sau 5 lần sai liên tiếp
- [ ] AC-1.2.4: "Quên mật khẩu" link hoạt động
- [ ] AC-1.2.5: "Remember me" kéo dài session 30 ngày
- [ ] AC-1.2.6: Redirect về trang trước đó sau login thành công

**Story Points:** 3  
**Priority:** P0

---

### US-1.3: Social Login
**As a** khách hàng  
**I want to** đăng nhập bằng Google/Facebook  
**So that** tôi không cần nhớ thêm password

**Acceptance Criteria:**
- [ ] AC-1.3.1: Button "Login with Google" hiển thị và hoạt động
- [ ] AC-1.3.2: Button "Login with Facebook" hiển thị và hoạt động
- [ ] AC-1.3.3: Tự động tạo account nếu email chưa tồn tại
- [ ] AC-1.3.4: Link account nếu email đã tồn tại (yêu cầu xác nhận)
- [ ] AC-1.3.5: Pull basic info (name, email, avatar) từ provider

**Story Points:** 5  
**Priority:** P1

---

### US-1.4: Quên mật khẩu
**As a** khách hàng quên password  
**I want to** reset password qua email/SMS  
**So that** tôi có thể truy cập lại tài khoản

**Acceptance Criteria:**
- [ ] AC-1.4.1: Nhập email hoặc phone để nhận link/OTP reset
- [ ] AC-1.4.2: Link reset valid trong 15 phút
- [ ] AC-1.4.3: Chỉ cho phép sử dụng 1 lần
- [ ] AC-1.4.4: Sau reset thành công → redirect login
- [ ] AC-1.4.5: Thông báo "Không tìm thấy tài khoản" nếu email/phone không tồn tại

**Story Points:** 3  
**Priority:** P0

---

## Epic 2: Product Discovery & Comparison

### US-2.1: Xem danh mục sản phẩm
**As a** khách hàng  
**I want to** xem tất cả loại bảo hiểm có sẵn  
**So that** tôi biết có những lựa chọn nào

**Acceptance Criteria:**
- [ ] AC-2.1.1: Hiển thị 7 categories chính trên trang chủ
- [ ] AC-2.1.2: Mỗi category có icon, tên, mô tả ngắn
- [ ] AC-2.1.3: Click category → hiển thị danh sách sản phẩm
- [ ] AC-2.1.4: Trang load < 2 giây
- [ ] AC-2.1.5: Responsive trên mobile

**Story Points:** 3  
**Priority:** P0

---

### US-2.2: Tìm kiếm sản phẩm
**As a** khách hàng  
**I want to** tìm kiếm sản phẩm bằng keyword  
**So that** tôi nhanh chóng tìm được sản phẩm cần thiết

**Acceptance Criteria:**
- [ ] AC-2.2.1: Search bar hiển thị ở header (tất cả trang)
- [ ] AC-2.2.2: Autocomplete suggestions khi nhập >= 2 ký tự
- [ ] AC-2.2.3: Hiển thị kết quả trong < 1 giây
- [ ] AC-2.2.4: Kết quả bao gồm: tên sản phẩm, insurer, giá từ
- [ ] AC-2.2.5: Hiển thị "Không tìm thấy" + gợi ý nếu 0 kết quả
- [ ] AC-2.2.6: Hỗ trợ tìm kiếm tiếng Việt có dấu và không dấu

**Story Points:** 5  
**Priority:** P1

---

### US-2.3: Lọc sản phẩm
**As a** khách hàng  
**I want to** lọc sản phẩm theo tiêu chí  
**So that** tôi chỉ xem những sản phẩm phù hợp

**Acceptance Criteria:**
- [ ] AC-2.3.1: Filter theo giá (range slider)
- [ ] AC-2.3.2: Filter theo công ty bảo hiểm (multi-select)
- [ ] AC-2.3.3: Filter theo rating (star rating)
- [ ] AC-2.3.4: Filter theo features cụ thể (checkbox)
- [ ] AC-2.3.5: Kết quả update real-time khi thay đổi filter
- [ ] AC-2.3.6: Hiển thị số lượng kết quả
- [ ] AC-2.3.7: Clear all filters button

**Story Points:** 5  
**Priority:** P1

---

### US-2.4: So sánh sản phẩm
**As a** khách hàng  
**I want to** so sánh 2-4 sản phẩm cùng loại  
**So that** tôi chọn được sản phẩm tốt nhất cho mình

**Acceptance Criteria:**
- [ ] AC-2.4.1: Button "So sánh" trên mỗi product card
- [ ] AC-2.4.2: Floating comparison tray hiển thị products đã chọn
- [ ] AC-2.4.3: Max 4 sản phẩm, hiển thị warning khi đạt limit
- [ ] AC-2.4.4: Comparison table hiển thị tất cả features
- [ ] AC-2.4.5: Highlight giá thấp nhất (màu xanh)
- [ ] AC-2.4.6: Expandable/collapsible sections
- [ ] AC-2.4.7: "Mua ngay" button cho từng sản phẩm trong bảng so sánh

**Story Points:** 8  
**Priority:** P1

---

### US-2.5: Xem chi tiết sản phẩm
**As a** khách hàng  
**I want to** xem thông tin chi tiết sản phẩm bảo hiểm  
**So that** tôi hiểu rõ quyền lợi trước khi mua

**Acceptance Criteria:**
- [ ] AC-2.5.1: Hiển thị tên, insurer logo, rating, giá từ
- [ ] AC-2.5.2: Danh sách quyền lợi chính (top 5 với icon)
- [ ] AC-2.5.3: Bảng chi tiết coverage (expandable)
- [ ] AC-2.5.4: Danh sách exclusions (rõ ràng, dễ đọc)
- [ ] AC-2.5.5: Bảng giá theo độ tuổi/coverage
- [ ] AC-2.5.6: T&C download PDF
- [ ] AC-2.5.7: Customer reviews section
- [ ] AC-2.5.8: FAQ section
- [ ] AC-2.5.9: CTA "Nhận báo giá" nổi bật

**Story Points:** 5  
**Priority:** P0

---

## Epic 3: Quotation

### US-3.1: Nhận báo giá bảo hiểm xe
**As a** chủ xe  
**I want to** nhận báo giá bảo hiểm xe nhanh chóng  
**So that** tôi biết chi phí bảo hiểm cho xe của mình

**Acceptance Criteria:**
- [ ] AC-3.1.1: Form nhập thông tin xe (brand, model, year, CC)
- [ ] AC-3.1.2: Tùy chọn coverage (TNDS / Toàn diện)
- [ ] AC-3.1.3: Hiển thị giá từ ít nhất 3 insurers
- [ ] AC-3.1.4: Kết quả hiển thị trong < 5 giây
- [ ] AC-3.1.5: So sánh side-by-side giữa các quotes
- [ ] AC-3.1.6: Có thể adjust coverage → price update real-time
- [ ] AC-3.1.7: Button "Mua ngay" cho từng quote

**Story Points:** 8  
**Priority:** P0

---

### US-3.2: Nhận báo giá bảo hiểm sức khỏe
**As a** khách hàng cần bảo hiểm sức khỏe  
**I want to** nhận báo giá phù hợp với tình trạng sức khỏe  
**So that** tôi chọn được gói bảo hiểm tốt nhất

**Acceptance Criteria:**
- [ ] AC-3.2.1: Form multi-step (personal → health → coverage)
- [ ] AC-3.2.2: Health declaration form đầy đủ
- [ ] AC-3.2.3: Tùy chọn: individual / family plan
- [ ] AC-3.2.4: Customize coverage (inpatient, outpatient, dental...)
- [ ] AC-3.2.5: Giá update khi thay đổi options
- [ ] AC-3.2.6: Hiển thị quotes từ multiple insurers
- [ ] AC-3.2.7: Clear display của exclusions cho mỗi quote

**Story Points:** 13  
**Priority:** P0

---

### US-3.3: Lưu báo giá
**As a** khách hàng  
**I want to** lưu báo giá để xem lại sau  
**So that** tôi có thời gian cân nhắc trước khi mua

**Acceptance Criteria:**
- [ ] AC-3.3.1: Button "Lưu báo giá" trên quote result
- [ ] AC-3.3.2: Yêu cầu login nếu chưa authenticated
- [ ] AC-3.3.3: Saved quotes hiển thị trong Dashboard
- [ ] AC-3.3.4: Báo giá valid 30 ngày
- [ ] AC-3.3.5: Hiển thị ngày hết hạn
- [ ] AC-3.3.6: Có thể resume purchase từ saved quote

**Story Points:** 3  
**Priority:** P1

---

## Epic 4: Purchase & Payment

### US-4.1: Mua bảo hiểm online
**As a** khách hàng  
**I want to** hoàn tất mua bảo hiểm 100% online  
**So that** tôi không cần gặp đại lý hay đến văn phòng

**Acceptance Criteria:**
- [ ] AC-4.1.1: Flow mua < 5 phút (sản phẩm đơn giản)
- [ ] AC-4.1.2: Form pre-fill từ profile nếu có
- [ ] AC-4.1.3: Real-time validation trên tất cả fields
- [ ] AC-4.1.4: Progress indicator (Step X of Y)
- [ ] AC-4.1.5: Có thể quay lại step trước mà không mất data
- [ ] AC-4.1.6: Summary page trước khi thanh toán
- [ ] AC-4.1.7: Multiple payment methods available

**Story Points:** 13  
**Priority:** P0

---

### US-4.2: eKYC verification
**As a** hệ thống  
**I want to** xác minh danh tính khách hàng qua CCCD  
**So that** đảm bảo compliance và chống gian lận

**Acceptance Criteria:**
- [ ] AC-4.2.1: Hỗ trợ upload ảnh CCCD (mặt trước + mặt sau)
- [ ] AC-4.2.2: Camera capture trên mobile
- [ ] AC-4.2.3: OCR extract thông tin tự động
- [ ] AC-4.2.4: Auto-fill form từ OCR data
- [ ] AC-4.2.5: Hiển thị confidence score
- [ ] AC-4.2.6: Cho phép edit nếu OCR sai
- [ ] AC-4.2.7: Xử lý < 10 giây
- [ ] AC-4.2.8: Fallback: cho phép nhập thủ công nếu OCR fail

**Story Points:** 8  
**Priority:** P0

---

### US-4.3: Thanh toán
**As a** khách hàng  
**I want to** thanh toán bảo hiểm bằng nhiều phương thức  
**So that** tôi chọn cách thanh toán tiện lợi nhất

**Acceptance Criteria:**
- [ ] AC-4.3.1: Hỗ trợ VNPay (ATM nội địa + Visa/Master)
- [ ] AC-4.3.2: Hỗ trợ ví Momo
- [ ] AC-4.3.3: Hỗ trợ ví ZaloPay
- [ ] AC-4.3.4: Hỗ trợ chuyển khoản (virtual account)
- [ ] AC-4.3.5: Hiển thị tổng thanh toán rõ ràng
- [ ] AC-4.3.6: Redirect → xử lý → callback trong < 60 giây
- [ ] AC-4.3.7: Hiển thị trang "Thanh toán thành công" + receipt
- [ ] AC-4.3.8: Gửi email receipt

**Story Points:** 8  
**Priority:** P0

---

### US-4.4: Nhận hợp đồng
**As a** khách hàng đã mua bảo hiểm  
**I want to** nhận hợp đồng ngay sau thanh toán  
**So that** tôi có bằng chứng mua bảo hiểm

**Acceptance Criteria:**
- [ ] AC-4.4.1: Policy PDF generated trong < 30 giây sau payment
- [ ] AC-4.4.2: Email với PDF attachment gửi trong < 5 phút
- [ ] AC-4.4.3: SMS xác nhận với policy number
- [ ] AC-4.4.4: Policy hiển thị trong Dashboard ngay lập tức
- [ ] AC-4.4.5: PDF có đầy đủ: thông tin KH, coverage, T&C, số HĐ
- [ ] AC-4.4.6: Có thể tải lại PDF bất kỳ lúc nào

**Story Points:** 5  
**Priority:** P0

---

## Epic 5: Policy Management

### US-5.1: Xem danh sách hợp đồng
**As a** khách hàng  
**I want to** xem tất cả hợp đồng bảo hiểm của tôi  
**So that** tôi quản lý được các bảo hiểm đang có

**Acceptance Criteria:**
- [ ] AC-5.1.1: Dashboard hiển thị tổng quan (X active, Y expiring)
- [ ] AC-5.1.2: List tất cả policies (sortable, filterable)
- [ ] AC-5.1.3: Status badges (Active/Expiring/Expired/Cancelled)
- [ ] AC-5.1.4: Quick actions: Renew, Claim, View details
- [ ] AC-5.1.5: Search by policy number

**Story Points:** 5  
**Priority:** P0

---

### US-5.2: Gia hạn hợp đồng
**As a** khách hàng có policy sắp hết hạn  
**I want to** gia hạn online  
**So that** bảo hiểm không bị gián đoạn

**Acceptance Criteria:**
- [ ] AC-5.2.1: Nhận reminder 30, 14, 7, 3, 1 ngày trước hết hạn
- [ ] AC-5.2.2: 1-click renewal với same terms
- [ ] AC-5.2.3: Option để adjust coverage khi gia hạn
- [ ] AC-5.2.4: Hiển thị giá renewal (may differ from original)
- [ ] AC-5.2.5: Auto-renewal setting (opt-in)
- [ ] AC-5.2.6: Grace period 30 ngày nếu quên gia hạn

**Story Points:** 8  
**Priority:** P0

---

## Epic 6: Claims

### US-6.1: Nộp yêu cầu bồi thường
**As a** khách hàng gặp sự cố  
**I want to** nộp claim online 24/7  
**So that** tôi được bồi thường nhanh nhất

**Acceptance Criteria:**
- [ ] AC-6.1.1: Chọn policy → claim type → fill form
- [ ] AC-6.1.2: Upload tài liệu (drag & drop + camera)
- [ ] AC-6.1.3: Hỗ trợ file: JPG, PNG, PDF (max 10MB/file)
- [ ] AC-6.1.4: Preview tài liệu trước khi submit
- [ ] AC-6.1.5: Review summary trước khi confirm
- [ ] AC-6.1.6: Nhận claim reference number ngay lập tức
- [ ] AC-6.1.7: Email/SMS confirmation

**Story Points:** 13  
**Priority:** P0

---

### US-6.2: Theo dõi claim
**As a** khách hàng đã nộp claim  
**I want to** theo dõi tiến độ xử lý  
**So that** tôi biết khi nào nhận được bồi thường

**Acceptance Criteria:**
- [ ] AC-6.2.1: Timeline view với tất cả status changes
- [ ] AC-6.2.2: Estimated time cho mỗi step
- [ ] AC-6.2.3: Notification khi status thay đổi
- [ ] AC-6.2.4: Có thể add documents/comments
- [ ] AC-6.2.5: Contact claims handler (chat/email)
- [ ] AC-6.2.6: Appeal option nếu rejected

**Story Points:** 8  
**Priority:** P0

---

## Epic 7: Admin Operations

### US-7.1: Admin Dashboard
**As an** admin  
**I want to** xem overview KPIs  
**So that** tôi nắm được tình hình kinh doanh

**Acceptance Criteria:**
- [ ] AC-7.1.1: Revenue widget (today, this week, this month)
- [ ] AC-7.1.2: Policies sold (count + trend)
- [ ] AC-7.1.3: Active claims count by status
- [ ] AC-7.1.4: Conversion funnel (realtime)
- [ ] AC-7.1.5: Top products by revenue
- [ ] AC-7.1.6: System health indicators
- [ ] AC-7.1.7: Recent activities feed

**Story Points:** 8  
**Priority:** P0

---

### US-7.2: Xử lý claims
**As a** claims handler  
**I want to** xem và xử lý claims queue  
**So that** khách hàng được bồi thường đúng hạn

**Acceptance Criteria:**
- [ ] AC-7.2.1: Claims queue với filter (status, priority, date)
- [ ] AC-7.2.2: Claim detail view (all info + documents)
- [ ] AC-7.2.3: Document verification checklist
- [ ] AC-7.2.4: Approve / Partial / Reject actions
- [ ] AC-7.2.5: Add internal notes
- [ ] AC-7.2.6: Request additional info from customer
- [ ] AC-7.2.7: SLA indicator (time remaining)
- [ ] AC-7.2.8: Escalation option

**Story Points:** 13  
**Priority:** P0

---

## Summary: Epic & Story Points

| Epic | Stories | Total Points | Priority |
|------|---------|-------------|----------|
| 1. Auth & Registration | 4 stories | 16 | P0 |
| 2. Product Discovery | 5 stories | 26 | P0-P1 |
| 3. Quotation | 3 stories | 24 | P0-P1 |
| 4. Purchase & Payment | 4 stories | 34 | P0 |
| 5. Policy Management | 2 stories | 13 | P0 |
| 6. Claims | 2 stories | 21 | P0 |
| 7. Admin Operations | 2 stories | 21 | P0 |
| **Total** | **22 stories** | **155 points** | - |

**Velocity assumption:** 30-40 points/sprint (2 weeks)  
**Estimated sprints:** ~4-5 sprints for MVP (8-10 weeks)
