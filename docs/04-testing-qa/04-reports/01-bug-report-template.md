# Bug Report Template - Mẫu Báo Cáo Lỗi

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Bug Report Format

### Template

```
┌─────────────────────────────────────────────────────────────┐
│                        BUG REPORT                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Bug ID:        BUG-[MODULE]-[NUMBER]                        │
│  Title:         [Module] - Brief clear description            │
│  Reporter:      [Name]                                        │
│  Date:          [DD/MM/YYYY]                                  │
│  Environment:   [DEV / QA / STG / PROD]                      │
│  Build/Version: [v0.1.x / commit hash]                       │
│                                                               │
│  Severity:      [S1-Critical / S2-High / S3-Medium / S4-Low]│
│  Priority:      [P1-Immediate / P2-High / P3-Medium / P4-Low]│
│  Status:        [New / Assigned / In Fix / Fixed / Verified] │
│  Assignee:      [Developer name]                              │
│  Module:        [Auth / Product / Quote / Purchase / Claims  │
│                  / Payment / Admin / Dashboard / Notification]│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Template

### BUG-[ID]

**Title:** [Module] - Mô tả ngắn gọn lỗi

| Field | Value |
|-------|-------|
| Bug ID | BUG-XXXX-001 |
| Severity | S1 / S2 / S3 / S4 |
| Priority | P1 / P2 / P3 / P4 |
| Module | [Module name] |
| Reporter | [Name] |
| Assignee | [Developer] |
| Environment | DEV / QA / STG / PROD |
| Build | [Version / Commit] |
| Browser | [Chrome 125 / Safari 17 / Firefox 126 / Edge 125] |
| Device | [Desktop / Mobile / Tablet] |
| OS | [Windows 11 / macOS 14 / iOS 17 / Android 14] |
| Date Found | DD/MM/YYYY |
| Date Fixed | DD/MM/YYYY |
| Sprint | [Sprint number] |

---

**Precondition:**
- [Điều kiện tiên quyết trước khi reproduce bug]

**Steps to Reproduce:**
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]
4. ...

**Expected Result:**
- [Kết quả mong đợi]

**Actual Result:**
- [Kết quả thực tế - mô tả lỗi]

**Attachments:**
- [ ] Screenshot
- [ ] Video recording
- [ ] Console logs
- [ ] Network logs (HAR file)
- [ ] API request/response

**Additional Info:**
- Frequency: [Always / Intermittent / Once]
- Workaround: [Có / Không - mô tả nếu có]
- Related bugs: [BUG-XXXX]
- Regression: [Yes / No - có phải bug hồi quy không]

---

## 3. Ví dụ Bug Reports

### BUG-PAY-001: Payment - Momo payment không redirect về sau khi thanh toán thành công

| Field | Value |
|-------|-------|
| Bug ID | BUG-PAY-001 |
| Severity | S1 - Critical |
| Priority | P1 - Immediate |
| Module | Payment |
| Reporter | Nguyễn Văn A |
| Environment | QA |
| Build | v0.1.3 (commit abc123) |
| Browser | Chrome 125 |
| Device | Desktop |
| Date Found | 15/05/2026 |

**Precondition:**
- User đã login, có quote hợp lệ, đang ở bước thanh toán

**Steps to Reproduce:**
1. Từ purchase flow, chọn phương thức thanh toán "Ví Momo"
2. Redirect đến Momo sandbox
3. Xác nhận thanh toán trên Momo (success)
4. Sau khi Momo hiển thị "Thanh toán thành công"

**Expected Result:**
- Redirect về trang xác nhận mua thành công
- Policy được tạo
- Email xác nhận được gửi

**Actual Result:**
- Bị stuck ở trang Momo "Thanh toán thành công"
- Không redirect về system
- Refresh manually → trang lỗi 404
- Policy KHÔNG được tạo (kiểm tra DB)

**Attachments:**
- [x] Screenshot: momo-stuck.png
- [x] Console logs: No errors
- [x] Network: Callback URL returns 404

**Additional Info:**
- Frequency: Always (100%)
- Workaround: Không có
- Root cause (suspected): Callback URL misconfigured cho QA environment
- Impact: Không thể hoàn tất bất kỳ giao dịch Momo nào

---

### BUG-AUTH-001: Authentication - Login không hiển thị lỗi khi password sai

| Field | Value |
|-------|-------|
| Bug ID | BUG-AUTH-001 |
| Severity | S3 - Medium |
| Priority | P2 - High |
| Module | Authentication |
| Reporter | Trần Thị B |
| Environment | QA |
| Build | v0.1.3 |
| Browser | Safari 17 (iOS) |
| Device | iPhone 15, iOS 17 |
| Date Found | 15/05/2026 |

**Precondition:**
- User có tài khoản active, truy cập trang login trên mobile Safari

**Steps to Reproduce:**
1. Mở trang login trên Safari iOS
2. Nhập email đúng: user@test.com
3. Nhập password sai: wrongpass
4. Click "Đăng nhập"

**Expected Result:**
- Error message: "Email hoặc mật khẩu không đúng"
- Password field cleared
- Focus vào password field

**Actual Result:**
- Button loading spinner xuất hiện rồi biến mất
- Không có error message hiển thị
- Form vẫn giữ nguyên (password không clear)
- User không biết login fail hay đang processing

**Attachments:**
- [x] Video: login-no-error-ios.mp4
- [x] Console: "TypeError: Cannot read property 'message' of undefined"

**Additional Info:**
- Frequency: Always (trên Safari iOS)
- Workaround: Dùng Chrome mobile thì hiển thị đúng
- Note: Chỉ xảy ra trên Safari, Chrome OK → likely DOM rendering issue

---

### BUG-QUOTE-001: Quote - Giá bảo hiểm xe tính sai khi chọn "Kinh doanh"

| Field | Value |
|-------|-------|
| Bug ID | BUG-QUOTE-001 |
| Severity | S2 - High |
| Priority | P1 - Immediate |
| Module | Quote Engine |
| Reporter | Lê Văn C |
| Environment | QA |
| Build | v0.1.4 |
| Browser | Chrome 125 |
| Device | Desktop |
| Date Found | 16/05/2026 |

**Precondition:**
- Truy cập quote form cho bảo hiểm xe máy

**Steps to Reproduce:**
1. Nhập thông tin xe: Honda Wave 110cc, 2023
2. Giá trị xe: 20,000,000 VND
3. Mục đích: Cá nhân → Ghi nhận giá: 350,000 VND
4. Đổi mục đích: Kinh doanh
5. Quan sát giá mới

**Expected Result:**
- Giá = 350,000 × 1.3 = 455,000 VND (hệ số kinh doanh 1.3x)

**Actual Result:**
- Giá hiển thị: 350,000 VND (KHÔNG thay đổi)
- Hệ số kinh doanh 1.3x không được apply
- Nếu submit, backend tính đúng 455K nhưng FE hiển thị sai

**Attachments:**
- [x] Screenshot: quote-price-mismatch.png
- [x] Network: API response shows 455,000 nhưng UI render 350,000

**Additional Info:**
- Frequency: Always
- Workaround: Refresh page sau khi đổi → hiển thị đúng
- Root cause (suspected): Frontend không re-render price khi usage type thay đổi
- Impact: User thấy giá sai → mất trust, potential legal issue

---

## 4. Severity & Priority Guidelines

### 4.1. Severity Definitions

| Severity | Định nghĩa | Ví dụ cụ thể |
|----------|------------|---------------|
| **S1 - Critical** | System crash, data loss, security breach, complete feature failure | Payment mất tiền không tạo policy; Data breach; System down |
| **S2 - High** | Major feature broken, incorrect business logic, no workaround | Giá tính sai; Cannot submit claim; eKYC always fails |
| **S3 - Medium** | Feature partially broken, has workaround | Filter không work (có thể dùng search); UI vỡ trên 1 browser |
| **S4 - Low** | Cosmetic, minor UI, typo | Font size sai; Typo trong label; Padding không đều |

### 4.2. Priority Definitions

| Priority | Action Required | SLA |
|----------|----------------|-----|
| **P1 - Immediate** | Fix ngay, hotfix nếu cần | Same day |
| **P2 - High** | Fix trong sprint hiện tại | 1-2 days |
| **P3 - Medium** | Schedule cho sprint tiếp | Next sprint |
| **P4 - Low** | Backlog | When capacity allows |

### 4.3. Severity vs Priority Matrix

|  | P1 | P2 | P3 | P4 |
|--|----|----|----|----|
| **S1** | ✓ Hotfix ngay | Rare | - | - |
| **S2** | If blocking release | ✓ Common | Rare | - |
| **S3** | - | Rare | ✓ Common | Sometimes |
| **S4** | - | - | Sometimes | ✓ Common |

---

## 5. Bug Lifecycle

```
┌───────┐     ┌──────────┐     ┌─────────┐     ┌────────┐     ┌──────────┐
│  New  │────▶│ Assigned │────▶│ In Fix  │────▶│ Fixed  │────▶│ Verified │
└───────┘     └──────────┘     └─────────┘     └────────┘     └──────────┘
    │              │                                │                │
    ▼              ▼                                ▼                ▼
┌───────┐     ┌──────────┐                    ┌────────┐      ┌────────┐
│Rejected│    │ Deferred │                    │ Reopen │      │ Closed │
│(Invalid)│   │(Later fix)│                   │(Not fixed)│   │        │
└───────┘     └──────────┘                    └────────┘      └────────┘
```

### Status Definitions

| Status | Meaning | Owner |
|--------|---------|-------|
| New | Bug mới báo cáo, chưa assign | QA |
| Assigned | Đã assign cho developer | Dev Lead |
| In Fix | Developer đang fix | Developer |
| Fixed | Developer đã fix, ready for retest | Developer |
| Verified | QA đã verify fix OK | QA |
| Closed | Bug đã resolved hoàn toàn | QA |
| Rejected | Not a bug / Cannot reproduce | Dev + QA |
| Deferred | Defer cho release sau | PM |
| Reopen | Fix chưa đúng / bug quay lại | QA |

---

## 6. Bug Metrics & Dashboard

### 6.1. Key Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| Bug Discovery Rate | Bugs found / day | Tracking |
| Bug Fix Rate | Bugs fixed / day | > Discovery rate |
| Bug Reopen Rate | Reopened / Total fixed | < 5% |
| Avg Time to Fix (S1) | Time from New → Fixed | < 4 hours |
| Avg Time to Fix (S2) | Time from New → Fixed | < 1 day |
| Bug Density | Bugs / KLOC | < 5 |
| Defect Removal Efficiency | Bugs in QA / (QA + Prod) | > 90% |

### 6.2. Weekly Bug Summary Template

| Category | Open | In Fix | Fixed | Closed | Total |
|----------|------|--------|-------|--------|-------|
| S1 - Critical | | | | | |
| S2 - High | | | | | |
| S3 - Medium | | | | | |
| S4 - Low | | | | | |
| **Total** | | | | | |
