# FAQ - Câu hỏi thường gặp

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |

---

## 1. FAQ cho Customer Support Team

### 1.1. Tài khoản & Đăng nhập

#### Q: Khách hàng quên mật khẩu?
**A:** Hướng dẫn khách hàng:
1. Click "Quên mật khẩu" trên trang đăng nhập
2. Nhập email/số điện thoại đã đăng ký
3. Nhận OTP qua email/SMS
4. Tạo mật khẩu mới (tối thiểu 8 ký tự, bao gồm chữ hoa, số, ký tự đặc biệt)

**Nếu không nhận được OTP**: Kiểm tra thư mục spam, đợi 2-3 phút, thử lại tối đa 3 lần. Nếu vẫn không được → escalate to L2.

#### Q: Tài khoản bị khóa?
**A:** Tài khoản bị khóa sau 5 lần đăng nhập sai liên tiếp.
- Tự động mở khóa sau 30 phút
- Hoặc Support L2 có thể unlock thủ công (cần xác minh danh tính)
- Xác minh danh tính: Hỏi họ tên, ngày sinh, số CCCD, email đăng ký

#### Q: Khách muốn đổi email/số điện thoại đăng ký?
**A:** 
1. Khách phải đăng nhập vào tài khoản
2. Vào Cài đặt → Thông tin cá nhân → Thay đổi
3. Xác nhận bằng OTP gửi về email/SĐT cũ
4. Nhập email/SĐT mới → Xác nhận OTP mới

**Nếu không truy cập được email/SĐT cũ**: Yêu cầu khách gửi ảnh CCCD + selfie qua form hỗ trợ. Processing time: 24-48h.

#### Q: Khách muốn xóa tài khoản?
**A:**
- Chỉ xóa được khi không có hợp đồng active
- Khách gửi yêu cầu qua email support@insurance.vn
- Processing time: 7 ngày làm việc
- Dữ liệu tài chính giữ lại 7 năm theo quy định pháp luật

---

### 1.2. Sản phẩm & Báo giá

#### Q: Tại sao giá bảo hiểm của tôi cao hơn người khác?
**A:** Phí bảo hiểm phụ thuộc nhiều yếu tố:
- **Bảo hiểm xe**: Loại xe, năm sản xuất, mục đích sử dụng, lịch sử claims
- **Bảo hiểm sức khỏe**: Tuổi, giới tính, bệnh nền, vùng miền, phạm vi bảo hiểm
- **Bảo hiểm nhân thọ**: Tuổi, sức khỏe, nghề nghiệp, số tiền bảo hiểm

#### Q: Báo giá có hiệu lực bao lâu?
**A:** 30 ngày kể từ ngày tạo. Sau 30 ngày, giá có thể thay đổi và cần tạo báo giá mới.

#### Q: Tại sao không có báo giá từ công ty bảo hiểm X?
**A:** Có thể do:
- Sản phẩm của công ty X chưa available trên platform
- Công ty X từ chối bảo hiểm dựa trên thông tin đã cung cấp (tuổi, sức khỏe, v.v.)
- Lỗi kỹ thuật tạm thời → khuyên khách thử lại sau 30 phút

#### Q: Có thể tùy chỉnh gói bảo hiểm không?
**A:** Có, khách có thể:
- Thay đổi mức phí bảo hiểm (sum insured)
- Thêm/bớt quyền lợi bổ sung (riders)
- Chọn mức khấu trừ (deductible)
- Giá sẽ cập nhật real-time khi thay đổi

---

### 1.3. Mua bảo hiểm & Thanh toán

#### Q: Phương thức thanh toán nào được hỗ trợ?
**A:**
| Phương thức | Chi tiết | Phí |
|-------------|----------|-----|
| Ví MoMo | Quét QR hoặc link | Miễn phí |
| Ví ZaloPay | Quét QR hoặc link | Miễn phí |
| VNPay | Quét QR, thẻ ATM nội địa | Miễn phí |
| Thẻ Visa/Master | Credit/Debit | Miễn phí |
| Chuyển khoản NH | Theo thông tin cung cấp | Miễn phí |
| Trả góp | Qua thẻ tín dụng (0% lãi suất 3-12 tháng) | Tùy ngân hàng |

#### Q: Thanh toán lỗi / bị trừ tiền nhưng chưa nhận hợp đồng?
**A:**
1. Kiểm tra lịch sử giao dịch trong tài khoản
2. Nếu status = "Processing" → Đợi 15-30 phút, hệ thống tự xử lý
3. Nếu > 30 phút vẫn pending → Escalate to L2 với thông tin:
   - Mã đơn hàng (Order ID)
   - Số tiền
   - Phương thức thanh toán
   - Thời gian giao dịch
   - Screenshot (nếu có)

**SLA xử lý**: 4 giờ (trong giờ hành chính), 24 giờ (ngoài giờ)

#### Q: Làm sao để nhận hóa đơn VAT?
**A:** 
- Hóa đơn điện tử tự động gửi qua email sau khi thanh toán thành công
- Khách có thể tải tại: Tài khoản → Lịch sử giao dịch → Tải hóa đơn
- Nếu cần hóa đơn công ty: cung cấp MST + tên công ty trước khi thanh toán

---

### 1.4. Hợp đồng bảo hiểm

#### Q: Hợp đồng có hiệu lực từ khi nào?
**A:**
- **Bảo hiểm xe, tài sản, du lịch**: Từ 00:00 ngày tiếp theo sau thanh toán (hoặc ngày khách chọn)
- **Bảo hiểm sức khỏe**: Từ ngày hiệu lực + thời gian chờ (waiting period) 30 ngày
- **Bảo hiểm nhân thọ**: Từ ngày insurer approve + thanh toán phí đầu tiên

#### Q: Muốn hủy hợp đồng?
**A:**
| Loại | Thời hạn hủy | Hoàn phí |
|------|-------------|----------|
| Nhân thọ | 21 ngày đầu (cooling-off) | 100% (trừ phí khám SK nếu có) |
| Nhân thọ | Sau 21 ngày | Theo giá trị hoàn lại (surrender value) |
| Phi nhân thọ | Bất kỳ lúc nào | Pro-rata (trừ phí quản lý 20-30%) |
| Xe bắt buộc | Không hủy được | Không hoàn |

#### Q: Gia hạn hợp đồng như thế nào?
**A:**
1. Hệ thống gửi nhắc trước 30, 14, 7 ngày
2. Khách click link trong email/SMS hoặc vào Dashboard
3. Review thông tin (có thể thay đổi coverage)
4. Thanh toán phí gia hạn
5. Hợp đồng mới active ngay sau khi hợp đồng cũ hết hạn

**Auto-renewal**: Nếu bật, hệ thống tự động gia hạn + charge phương thức thanh toán đã lưu.

#### Q: Muốn thay đổi thông tin trong hợp đồng?
**A:** (Endorsement)
- Thay đổi được: Địa chỉ, người thụ hưởng, phương thức thanh toán
- Cần review: Thay đổi coverage, thêm/bớt người được bảo hiểm
- Không đổi được: Ngày bắt đầu, loại sản phẩm (cần mua mới)
- Processing time: 1-3 ngày làm việc
- Có thể phát sinh phí bổ sung hoặc hoàn phí

---

### 1.5. Bồi thường (Claims)

#### Q: Làm sao để nộp yêu cầu bồi thường?
**A:**
1. Đăng nhập → Hợp đồng → Chọn hợp đồng → "Yêu cầu bồi thường"
2. Chọn loại sự kiện (tai nạn, bệnh, mất mát, v.v.)
3. Điền thông tin chi tiết sự kiện
4. Upload chứng từ (hóa đơn, biên bản, ảnh, v.v.)
5. Xác nhận và gửi

**Hotline claims 24/7**: 1900-xxxx (gọi miễn phí)

#### Q: Cần những giấy tờ gì để yêu cầu bồi thường?
**A:**

| Loại BH | Chứng từ cần thiết |
|---------|-------------------|
| Sức khỏe | Hồ sơ bệnh án, hóa đơn viện phí, đơn thuốc, kết quả xét nghiệm |
| Xe | Biên bản CSGT/bảo hiểm, ảnh hiện trường, báo giá sửa chữa |
| Tai nạn | Biên bản tai nạn, giấy ra viện, hóa đơn y tế |
| Tài sản | Biên bản thiệt hại, ảnh, báo giá sửa chữa/thay thế |
| Du lịch | Boarding pass, hóa đơn chi phí phát sinh, giấy xác nhận airline |

#### Q: Bao lâu thì nhận được tiền bồi thường?
**A:**
| Loại claim | Thời gian xử lý | Ghi chú |
|-----------|-----------------|---------|
| Đơn giản (< 10 triệu) | 3-5 ngày làm việc | Auto-approve eligible |
| Trung bình (10-50 triệu) | 7-10 ngày làm việc | Handler review |
| Phức tạp (> 50 triệu) | 15-30 ngày làm việc | Investigation required |

**Chi trả**: Chuyển khoản vào tài khoản ngân hàng đã đăng ký.

#### Q: Yêu cầu bồi thường bị từ chối?
**A:** Lý do phổ biến:
- Sự kiện nằm trong điều khoản loại trừ (exclusions)
- Thời gian chờ chưa qua (waiting period)
- Chứng từ không đầy đủ/không hợp lệ
- Khai báo không trung thực
- Hợp đồng đã hết hiệu lực tại thời điểm sự kiện

**Quyền khiếu nại**: Khách có 30 ngày để khiếu nại quyết định. Gửi khiếu nại + bằng chứng bổ sung qua email hoặc hotline.

---

## 2. FAQ cho Operations Team

### 2.1. Deployment

#### Q: Khi nào được deploy lên production?
**A:**
- **Hotfix (P1)**: Bất kỳ lúc nào, cần approval CTO/Team Lead
- **Normal release**: Thứ 3 và Thứ 5, 10:00-16:00
- **Không deploy**: Thứ 6, cuối tuần, ngày lễ, change freeze periods
- **Điều kiện**: All tests pass, code review approved, staging QA sign-off

#### Q: Deploy bị lỗi, phải làm gì?
**A:**
1. **Đừng hoảng** - kiểm tra error rate trên dashboard
2. Nếu error rate > 5%: **Rollback ngay** (`kubectl rollout undo deployment/{service}`)
3. Nếu error rate < 5%: Investigate trong 10 phút, quyết định rollback hoặc hotfix
4. Thông báo team trên #deployments
5. Tạo incident ticket nếu ảnh hưởng user

#### Q: Làm sao để biết deployment an toàn?
**A:** Post-deployment verification (10 phút):
- Health checks all green
- Error rate < baseline + 0.1%
- Latency p95 < 500ms
- No new error patterns in logs
- Key business flows working (test purchase, test quote)

### 2.2. Monitoring & Alerts

#### Q: Alert liên tục fire nhưng không có impact thực?
**A:** Đây là "alert noise" - cần tuning:
1. Ghi nhận alert vào noise log
2. Đề xuất threshold mới trong weekly meeting
3. Tạm snooze (max 24h) nếu confirmed false positive
4. **Không được** silence alert mà không documented

#### Q: Không biết alert này thuộc team nào?
**A:** Kiểm tra alert routing:
| Alert prefix | Team | Channel |
|-------------|------|---------|
| `api.*` | Platform | #alerts-platform |
| `payment.*` | Payment | #alerts-payment |
| `policy.*` | Policy | #alerts-policy |
| `claims.*` | Claims | #alerts-claims |
| `infra.*` | DevOps | #alerts-infra |
| `security.*` | Security | #alerts-security |

### 2.3. Database

#### Q: Cần chạy query trên production?
**A:**
- **SELECT**: Chạy trên Read Replica, không cần approval
- **UPDATE/DELETE < 100 rows**: Cần Team Lead approval
- **UPDATE/DELETE > 100 rows**: Cần DBA review + CTO approval
- **DDL (ALTER TABLE, CREATE INDEX)**: Cần DBA review, chạy trong maintenance window
- **Luôn luôn**: Backup trước khi modify, test trên staging trước

#### Q: Database connection pool exhausted?
**A:**
1. Check active connections: `SELECT count(*) FROM pg_stat_activity;`
2. Kill idle connections > 10 min
3. Identify service with most connections
4. Restart affected service
5. Nếu recurring: tăng pool size hoặc optimize query

---

## 3. FAQ cho Development Team

### 3.1. Development Environment

#### Q: Làm sao setup local development?
**A:** Xem chi tiết tại [Local Setup Guide](../04-development/03-environment/02-local-setup-guide.md)

Quick steps:
1. Clone repo
2. `cp .env.example .env.local`
3. `docker-compose up -d` (DB, Redis, Queue)
4. `npm install`
5. `npm run migrate`
6. `npm run dev`

#### Q: Staging environment URL?
**A:**
| Service | URL |
|---------|-----|
| Web | https://staging.insurance.vn |
| API | https://api-staging.insurance.vn |
| Admin | https://admin-staging.insurance.vn |
| Swagger | https://api-staging.insurance.vn/docs |

#### Q: Test payment trên staging?
**A:** Dùng test credentials:
- VNPay sandbox: Xem tài liệu tại Confluence
- Card test: `4111 1111 1111 1111`, expiry bất kỳ tương lai, CVV `123`
- MoMo sandbox: Phone `0900000000`, OTP `000000`

### 3.2. Code & Process

#### Q: Branch naming convention?
**A:**
- Feature: `feature/{ticket-id}-short-description`
- Bugfix: `fix/{ticket-id}-short-description`
- Hotfix: `hotfix/{ticket-id}-short-description`
- Release: `release/v{major}.{minor}.{patch}`

#### Q: PR cần bao nhiêu reviewers?
**A:**
- Normal PR: 2 reviewers (1 phải là senior)
- Hotfix: 1 reviewer (Team Lead hoặc senior)
- Config change: 1 reviewer
- Security-related: 2 reviewers + Security team member

---

## 4. Cập nhật FAQ

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-15 | Initial release |

**Quy trình cập nhật**:
- FAQ được review hàng tháng bởi Support Lead
- Thêm Q&A mới dựa trên tickets phổ biến
- Remove Q&A không còn relevant
- Notify team khi có thay đổi quan trọng
