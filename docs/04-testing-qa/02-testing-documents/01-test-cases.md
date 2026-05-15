# Test Cases - Các Trường Hợp Kiểm Thử

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Người tạo | QA Team |

---

## 1. Module: Authentication

### TC-AUTH-001: Đăng ký tài khoản thành công

| Field | Value |
|-------|-------|
| ID | TC-AUTH-001 |
| Title | Đăng ký tài khoản với thông tin hợp lệ |
| Priority | P0 |
| Type | Positive |
| Precondition | User chưa có tài khoản, truy cập trang đăng ký |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Nhập email: newuser@test.com | Field accepted |
| 2 | Nhập phone: 0901234567 | Field accepted, auto-format +84 |
| 3 | Nhập password: Test@1234 | Strength indicator: Strong |
| 4 | Nhập confirm password: Test@1234 | Match indicator ✓ |
| 5 | Nhập full name: Nguyễn Văn A | Field accepted |
| 6 | Check "Đồng ý điều khoản" | Checkbox checked |
| 7 | Click "Đăng ký" | Loading → Redirect to OTP page |
| 8 | Nhập OTP từ email/SMS | OTP accepted |
| 9 | Click "Xác nhận" | Account created, redirect to welcome |

**Expected Result:** Tài khoản được tạo thành công, email welcome được gửi.

---

### TC-AUTH-002: Đăng ký với email đã tồn tại

| Field | Value |
|-------|-------|
| ID | TC-AUTH-002 |
| Title | Đăng ký với email đã có trong hệ thống |
| Priority | P0 |
| Type | Negative |
| Precondition | Email existing@test.com đã tồn tại |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Nhập email: existing@test.com | Field accepted (chưa validate server) |
| 2 | Điền đầy đủ thông tin khác | Form filled |
| 3 | Click "Đăng ký" | Error: "Email đã được sử dụng" |

**Expected Result:** Hiển thị lỗi rõ ràng, không tạo account duplicate.

---

### TC-AUTH-003: Đăng ký với password yếu

| Field | Value |
|-------|-------|
| ID | TC-AUTH-003 |
| Title | Validate password strength |
| Priority | P1 |
| Type | Negative |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Nhập password: "123" | Error: "Tối thiểu 8 ký tự" |
| 2 | Nhập password: "12345678" | Error: "Cần ít nhất 1 chữ hoa" |
| 3 | Nhập password: "Abcdefgh" | Error: "Cần ít nhất 1 số" |
| 4 | Nhập password: "Abcdefg1" | Error: "Cần ít nhất 1 ký tự đặc biệt" |
| 5 | Nhập password: "Test@1234" | Strength: Strong ✓ |

---

### TC-AUTH-004: Đăng nhập thành công

| Field | Value |
|-------|-------|
| ID | TC-AUTH-004 |
| Title | Đăng nhập với credentials đúng |
| Priority | P0 |
| Type | Positive |
| Precondition | Account đã verified |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Nhập email: user@test.com | Field accepted |
| 2 | Nhập password: Test@1234 | Field masked |
| 3 | Click "Đăng nhập" | Loading → Redirect to dashboard |

**Expected Result:** Đăng nhập thành công, JWT token issued, redirect to dashboard.

---

### TC-AUTH-005: Account lockout sau 5 lần sai

| Field | Value |
|-------|-------|
| ID | TC-AUTH-005 |
| Title | Lock account after 5 failed attempts |
| Priority | P0 |
| Type | Security |
| Precondition | Account active |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Đăng nhập sai lần 1 | Error: "Email hoặc mật khẩu không đúng" |
| 2 | Đăng nhập sai lần 2 | Error: same message |
| 3 | Đăng nhập sai lần 3 | Error + Warning: "Còn 2 lần thử" |
| 4 | Đăng nhập sai lần 4 | Error + Warning: "Còn 1 lần thử" |
| 5 | Đăng nhập sai lần 5 | Error: "Tài khoản bị khóa 30 phút" |
| 6 | Đăng nhập đúng password | Error: "Tài khoản đang bị khóa" |
| 7 | Đợi 30 phút → Đăng nhập đúng | Thành công |

---

### TC-AUTH-006: OTP expiry

| Field | Value |
|-------|-------|
| ID | TC-AUTH-006 |
| Title | OTP hết hạn sau 5 phút |
| Priority | P1 |
| Type | Boundary |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Đăng ký → nhận OTP | OTP received |
| 2 | Đợi 5 phút | - |
| 3 | Nhập OTP | Error: "OTP đã hết hạn" |
| 4 | Click "Gửi lại OTP" | OTP mới được gửi |
| 5 | Nhập OTP mới ngay | Verify thành công |

---

## 2. Module: Product Catalog

### TC-PROD-001: Hiển thị danh mục sản phẩm

| Field | Value |
|-------|-------|
| ID | TC-PROD-001 |
| Title | Hiển thị tất cả categories bảo hiểm |
| Priority | P0 |
| Type | Positive |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Truy cập trang Products | Hiển thị 7 categories |
| 2 | Verify categories | Nhân thọ, Sức khỏe, Xe cơ giới, Tài sản, Du lịch, Trách nhiệm, Doanh nghiệp |
| 3 | Click vào "Bảo hiểm Xe cơ giới" | Hiển thị sub-categories + products |

---

### TC-PROD-002: Filter sản phẩm theo giá

| Field | Value |
|-------|-------|
| ID | TC-PROD-002 |
| Title | Filter sản phẩm theo price range |
| Priority | P1 |
| Type | Positive |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Truy cập danh sách sản phẩm | Hiển thị tất cả products |
| 2 | Set price range: 500,000 - 2,000,000 VND | Chỉ hiển thị products trong range |
| 3 | Verify mỗi product card | Giá nằm trong 500K - 2M |
| 4 | Clear filter | Hiển thị lại tất cả products |

---

### TC-PROD-003: So sánh sản phẩm

| Field | Value |
|-------|-------|
| ID | TC-PROD-003 |
| Title | So sánh tối đa 4 sản phẩm cùng category |
| Priority | P1 |
| Type | Positive |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click "So sánh" trên Product A | Product A thêm vào comparison tray |
| 2 | Click "So sánh" trên Product B | Product B thêm, tray hiển thị "2 sản phẩm" |
| 3 | Click "So sánh" trên Product C | 3 sản phẩm trong tray |
| 4 | Click "So sánh" trên Product D | 4 sản phẩm (max) |
| 5 | Click "So sánh" trên Product E | Error: "Tối đa 4 sản phẩm" |
| 6 | Click "So sánh ngay" | Hiển thị comparison table |
| 7 | Verify table | Columns: Price, Benefits, Exclusions, Rating |

---

## 3. Module: Quote Engine

### TC-QUOTE-001: Báo giá xe máy thành công

| Field | Value |
|-------|-------|
| ID | TC-QUOTE-001 |
| Title | Tạo báo giá bảo hiểm xe máy |
| Priority | P0 |
| Type | Positive |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Chọn "Bảo hiểm xe máy" | Form step 1 hiển thị |
| 2 | Chọn loại xe: Xe máy | Accepted |
| 3 | Chọn hãng: Honda | Model list updates |
| 4 | Chọn model: Wave Alpha | Accepted |
| 5 | Chọn năm: 2023 | Accepted |
| 6 | Nhập dung tích: 110cc | Accepted |
| 7 | Chọn mục đích: Cá nhân | Accepted |
| 8 | Nhập giá trị xe: 20,000,000 | Accepted |
| 9 | Click "Tiếp tục" | Step 2: Coverage options |
| 10 | Chọn coverage: Toàn diện | Options hiển thị |
| 11 | Chọn deductible: 500,000 | Price updates |
| 12 | Click "Xem báo giá" | Loading → Results từ 3-5 insurers |
| 13 | Verify quotes | Giá hợp lý, sorted by price |

---

### TC-QUOTE-002: Báo giá sức khỏe - Ineligible age

| Field | Value |
|-------|-------|
| ID | TC-QUOTE-002 |
| Title | Báo giá sức khỏe với tuổi không hợp lệ |
| Priority | P1 |
| Type | Negative |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Chọn "Bảo hiểm sức khỏe" | Form hiển thị |
| 2 | Nhập ngày sinh: 01/01/1955 (71 tuổi) | Field accepted |
| 3 | Điền thông tin khác | - |
| 4 | Click "Xem báo giá" | Error: "Độ tuổi không phù hợp (tối đa 65 tuổi)" |
| 5 | Verify suggestion | Gợi ý sản phẩm thay thế |

---

### TC-QUOTE-003: Quote timeout handling

| Field | Value |
|-------|-------|
| ID | TC-QUOTE-003 |
| Title | Xử lý khi insurer API timeout |
| Priority | P1 |
| Type | Exception |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Request quote (simulate 1 insurer timeout) | Loading indicator |
| 2 | Sau 10s | Hiển thị results available |
| 3 | Verify display | Quotes từ insurers respond + Mark timeout insurer |
| 4 | Check message | "Một số nhà bảo hiểm chưa phản hồi" |

---

## 4. Module: Purchase Flow

### TC-PURCH-001: Mua bảo hiểm xe máy end-to-end

| Field | Value |
|-------|-------|
| ID | TC-PURCH-001 |
| Title | Full purchase flow - Motor insurance |
| Priority | P0 |
| Type | E2E |
| Precondition | User logged in, có quote hợp lệ |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Click "Mua ngay" trên quote | Redirect to purchase form |
| 2 | Nhập họ tên: Nguyễn Văn B | Accepted |
| 3 | Nhập CCCD: 079123456789 | Accepted |
| 4 | Nhập ngày sinh: 15/03/1995 | Accepted (≥18 tuổi) |
| 5 | Nhập địa chỉ | Accepted |
| 6 | Nhập SĐT + Email | Accepted |
| 7 | Upload CCCD mặt trước | Upload success, OCR processing |
| 8 | Upload CCCD mặt sau | Upload success |
| 9 | Verify OCR auto-fill | Tên, CCCD, ngày sinh match |
| 10 | Click "Tiếp tục" | Summary page |
| 11 | Check "Đồng ý điều khoản" | Checkbox checked |
| 12 | Click "Thanh toán" | Payment method selection |
| 13 | Chọn "Ví Momo" | Redirect to Momo |
| 14 | Xác nhận thanh toán | Payment success callback |
| 15 | Verify confirmation | "Mua thành công" + Policy number |
| 16 | Check email | Nhận email xác nhận + PDF |
| 17 | Check dashboard | Policy hiển thị trong "My Policies" |

---

### TC-PURCH-002: eKYC upload fail - fallback

| Field | Value |
|-------|-------|
| ID | TC-PURCH-002 |
| Title | eKYC OCR fail → manual input |
| Priority | P1 |
| Type | Exception |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Upload ảnh CCCD mờ/không rõ | OCR confidence < 80% |
| 2 | System response | Message: "Không thể đọc CCCD, vui lòng nhập thủ công" |
| 3 | Form chuyển sang manual mode | All fields editable |
| 4 | User điền thủ công | Form accepted |
| 5 | Submit | Flagged for manual review, purchase continues |

---

### TC-PURCH-003: Payment fail - retry

| Field | Value |
|-------|-------|
| ID | TC-PURCH-003 |
| Title | Payment fail và retry |
| Priority | P0 |
| Type | Exception |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Proceed to payment | Payment page |
| 2 | Chọn VNPay → Payment fails | Error callback |
| 3 | Verify message | "Thanh toán thất bại. Vui lòng thử lại" |
| 4 | Click "Thử lại" | Quay lại payment selection |
| 5 | Chọn Momo → Payment success | Purchase completed |

---

## 5. Module: Claims

### TC-CLAIMS-001: Submit claim sức khỏe thành công

| Field | Value |
|-------|-------|
| ID | TC-CLAIMS-001 |
| Title | Nộp yêu cầu bồi thường sức khỏe |
| Priority | P0 |
| Type | Positive |
| Precondition | User có policy health insurance active |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Dashboard → "Yêu cầu bồi thường" | Hiển thị list policies eligible |
| 2 | Chọn health policy | Claim form hiển thị |
| 3 | Chọn claim type: Nội trú | Form update theo type |
| 4 | Nhập tên bệnh viện | Accepted |
| 5 | Nhập ngày nhập viện: 10/05/2026 | Accepted (within policy period) |
| 6 | Nhập ngày xuất viện: 13/05/2026 | Accepted |
| 7 | Nhập chẩn đoán | Accepted |
| 8 | Nhập tổng chi phí: 15,000,000 | Accepted |
| 9 | Nhập số tiền yêu cầu: 15,000,000 | Accepted |
| 10 | Upload hóa đơn viện phí (PDF) | Upload success |
| 11 | Upload giấy ra viện (Image) | Upload success |
| 12 | Upload đơn thuốc (Image) | Upload success |
| 13 | Upload CCCD (Image) | Upload success |
| 14 | Review all information | All correct |
| 15 | Click "Nộp yêu cầu" | Success: Claim number generated |
| 16 | Verify status | Status: "Submitted" |
| 17 | Check email | Confirmation email received |

---

### TC-CLAIMS-002: Claim với event ngoài policy period

| Field | Value |
|-------|-------|
| ID | TC-CLAIMS-002 |
| Title | Submit claim với ngày sự kiện ngoài thời hạn BH |
| Priority | P1 |
| Type | Negative |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Chọn policy (effective: 01/01/2026 - 31/12/2026) | Form hiển thị |
| 2 | Nhập ngày sự kiện: 15/11/2025 | - |
| 3 | Submit form | Error: "Sự kiện xảy ra ngoài thời hạn bảo hiểm" |

---

### TC-CLAIMS-003: Upload file quá kích thước

| Field | Value |
|-------|-------|
| ID | TC-CLAIMS-003 |
| Title | Upload document > 10MB |
| Priority | P2 |
| Type | Boundary |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Upload file 15MB | Error: "File tối đa 10MB" |
| 2 | Upload file 10MB | Upload success |
| 3 | Upload nhiều files tổng > 50MB | Error: "Tổng dung lượng tối đa 50MB" |

---

## 6. Module: Payment

### TC-PAY-001: Thanh toán qua Momo

| Field | Value |
|-------|-------|
| ID | TC-PAY-001 |
| Title | Payment via Momo wallet |
| Priority | P0 |
| Type | Positive |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Chọn phương thức: Ví Momo | Redirect/QR code hiển thị |
| 2 | Confirm trên Momo app | Processing |
| 3 | Callback success | Redirect back → "Thanh toán thành công" |
| 4 | Verify transaction | Record in payment history |
| 5 | Verify policy | Policy status: Active |

---

### TC-PAY-002: Recurring payment - auto debit

| Field | Value |
|-------|-------|
| ID | TC-PAY-002 |
| Title | Auto-debit recurring payment |
| Priority | P1 |
| Type | Positive |
| Precondition | User đã setup recurring, saved payment method |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | System trigger auto-charge (due date) | Payment processed |
| 2 | Verify charge | Correct amount charged |
| 3 | Check notification | Reminder sent 7 days trước + confirmation |
| 4 | Verify policy | Policy renewed/extended |

---

### TC-PAY-003: Recurring payment fail - retry logic

| Field | Value |
|-------|-------|
| ID | TC-PAY-003 |
| Title | Auto-debit fail → retry sequence |
| Priority | P1 |
| Type | Exception |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Day 0: Auto-charge fails | Notification: "Thanh toán thất bại" |
| 2 | Day 3: Retry #1 | Attempt + notify result |
| 3 | Day 7: Retry #2 | Attempt + notify result |
| 4 | If all fail: Grace period | Policy still active 30 ngày |
| 5 | Day +30: No payment | Policy status: Lapsed |

---

## 7. Module: Admin Panel

### TC-ADMIN-001: Process claim - Approve

| Field | Value |
|-------|-------|
| ID | TC-ADMIN-001 |
| Title | Admin approve claim |
| Priority | P0 |
| Type | Positive |
| Precondition | Admin logged in, claim assigned |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Claims Queue → Select claim | Claim detail hiển thị |
| 2 | Review documents | All documents visible |
| 3 | Check document checklist | All items checked |
| 4 | Nhập settlement amount: 12,000,000 | Accepted |
| 5 | Select decision: "Approve" | Confirmation dialog |
| 6 | Add notes: "All documents verified" | Accepted |
| 7 | Click "Confirm" | Status → Approved |
| 8 | Verify customer notification | Email + SMS sent |
| 9 | Verify payment trigger | Settlement payment initiated |

---

### TC-ADMIN-002: Admin - Role-based access

| Field | Value |
|-------|-------|
| ID | TC-ADMIN-002 |
| Title | Verify RBAC - Claims Handler |
| Priority | P1 |
| Type | Security |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Login as Claims Handler | Dashboard limited view |
| 2 | Access Claims module | ✓ Allowed |
| 3 | Access Product Management | ✗ "Không có quyền truy cập" |
| 4 | Access User Management | ✗ "Không có quyền truy cập" |
| 5 | Access assigned claims only | ✓ Only assigned claims visible |

---

## 8. Module: Customer Dashboard

### TC-DASH-001: View policy details

| Field | Value |
|-------|-------|
| ID | TC-DASH-001 |
| Title | Xem chi tiết hợp đồng bảo hiểm |
| Priority | P0 |
| Type | Positive |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Login → My Policies | List policies hiển thị |
| 2 | Click policy | Detail page |
| 3 | Verify info | Product, coverage, premium, dates correct |
| 4 | Click "Download PDF" | PDF downloaded successfully |
| 5 | Verify PDF content | All policy details correct |

---

### TC-DASH-002: Cancel policy with refund

| Field | Value |
|-------|-------|
| ID | TC-DASH-002 |
| Title | Hủy hợp đồng và hoàn phí |
| Priority | P1 |
| Type | Positive |
| Precondition | Policy active, no claims, within cooling-off |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Policy detail → "Hủy hợp đồng" | Cancellation info page |
| 2 | Verify refund amount | Full refund (within cooling-off 21 ngày) |
| 3 | Chọn lý do: "Đổi ý" | Accepted |
| 4 | Nhập OTP xác nhận | OTP verified |
| 5 | Click "Xác nhận hủy" | Status → Cancelled |
| 6 | Verify refund | Refund processing (5-7 ngày) |
| 7 | Check email | Cancellation confirmation |

---

## 9. Cross-Module Test Cases

### TC-CROSS-001: Full customer lifecycle

| Field | Value |
|-------|-------|
| ID | TC-CROSS-001 |
| Title | Customer lifecycle: Register → Buy → Claim → Renew |
| Priority | P0 |
| Type | E2E |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Register new account | Account created |
| 2 | Browse products → Get quote | Quote received |
| 3 | Purchase motor insurance | Policy active |
| 4 | Submit accident claim | Claim submitted |
| 5 | Admin approves claim | Settlement paid |
| 6 | Policy renewal reminder | Email received |
| 7 | Renew policy | New policy issued |
| 8 | View all history in dashboard | All records visible |

---

### TC-CROSS-002: Concurrent operations

| Field | Value |
|-------|-------|
| ID | TC-CROSS-002 |
| Title | Multiple users purchasing same product simultaneously |
| Priority | P1 |
| Type | Concurrency |

**Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | User A starts purchase flow | Proceeding |
| 2 | User B starts purchase flow (same product) | Proceeding (independent) |
| 3 | Both complete payment | Both policies issued correctly |
| 4 | Verify no data mixing | Each user sees only their data |
