# Business Requirements Document (BRD)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |
| Phê duyệt | Pending |

---

## 1. Executive Summary

### 1.1. Bối cảnh (Background)
Thị trường bảo hiểm Việt Nam đang tăng trưởng mạnh (15-20%/năm) nhưng tỷ lệ thâm nhập còn thấp (~3.5% GDP). Kênh phân phối truyền thống (đại lý) chiếm >90% nhưng có nhiều hạn chế: chi phí cao, thiếu minh bạch, trải nghiệm kém. Cơ hội lớn cho nền tảng InsurTech giải quyết các pain points này.

### 1.2. Mục đích tài liệu
Tài liệu BRD nhằm:
- Xác định các yêu cầu kinh doanh cốt lõi
- Định nghĩa phạm vi dự án
- Làm cơ sở cho việc phát triển PRD và SRS
- Đảm bảo alignment giữa business và technology teams

### 1.3. Phạm vi (Scope)

#### Trong phạm vi (In Scope)
- Nền tảng web bán bảo hiểm trực tuyến (B2C, B2B)
- Tất cả các loại bảo hiểm phổ biến tại Việt Nam
- Hệ thống quản lý hợp đồng (Policy Management)
- Hệ thống yêu cầu bồi thường (Claims Management)
- Cổng thanh toán trực tuyến
- Hệ thống quản trị (Admin Portal)
- Dashboard & Analytics
- Tích hợp với đối tác bảo hiểm (Insurer API)

#### Ngoài phạm vi (Out of Scope)
- Mobile app (giai đoạn sau)
- Mở rộng quốc tế
- Tự phát hành bảo hiểm (chỉ là marketplace/broker)
- Blockchain verification
- IoT integration

---

## 2. Business Objectives

### 2.1. Mục tiêu chính (Primary Objectives)

| # | Mục tiêu | Đo lường | Timeline |
|---|----------|----------|----------|
| BO-1 | Xây dựng nền tảng bán bảo hiểm online đầu tiên tại VN có đầy đủ sản phẩm | Platform live với 5+ sản phẩm | 6 tháng |
| BO-2 | Đạt 100,000 users đăng ký trong năm đầu | User registrations | 12 tháng |
| BO-3 | Đạt GWP 50 tỷ VND trong năm đầu | Gross Written Premium | 12 tháng |
| BO-4 | Thiết lập partnerships với 10+ công ty bảo hiểm | Signed contracts | 12 tháng |
| BO-5 | Đạt NPS > 40 | Net Promoter Score | 12 tháng |

### 2.2. Mục tiêu phụ (Secondary Objectives)

| # | Mục tiêu | Đo lường | Timeline |
|---|----------|----------|----------|
| BO-6 | Giảm thời gian mua bảo hiểm xuống < 5 phút | Average purchase time | 6 tháng |
| BO-7 | Auto-underwriting > 80% đơn đơn giản | Automation rate | 9 tháng |
| BO-8 | Claims settlement < 48h cho claims đơn giản | Average settlement time | 9 tháng |
| BO-9 | Platform uptime > 99.9% | System monitoring | Ongoing |
| BO-10 | Break-even trong 30 tháng | P&L | 30 tháng |

---

## 3. Business Requirements

### 3.1. BR-001: Quản lý sản phẩm bảo hiểm

**Mô tả**: Hệ thống phải cho phép quản lý danh mục tất cả các loại sản phẩm bảo hiểm.

**Chi tiết yêu cầu**:
| ID | Requirement | Priority |
|----|-------------|----------|
| BR-001.1 | Hỗ trợ tối thiểu 7 nhóm sản phẩm bảo hiểm | Must |
| BR-001.2 | Mỗi sản phẩm có thông tin chi tiết: quyền lợi, exclusions, phí, điều khoản | Must |
| BR-001.3 | Cho phép so sánh sản phẩm cùng loại từ nhiều công ty | Must |
| BR-001.4 | Hiển thị rating/review từ khách hàng | Should |
| BR-001.5 | Hỗ trợ tìm kiếm và lọc sản phẩm | Must |

**Danh mục sản phẩm bảo hiểm**:
1. Bảo hiểm nhân thọ (Life Insurance)
   - Bảo hiểm tử vong
   - Bảo hiểm hỗn hợp
   - Bảo hiểm liên kết đầu tư
   - Bảo hiểm hưu trí
2. Bảo hiểm sức khỏe (Health Insurance)
   - Bảo hiểm nội trú
   - Bảo hiểm ngoại trú
   - Bảo hiểm bệnh hiểm nghèo
   - Bảo hiểm thai sản
3. Bảo hiểm xe cơ giới (Motor Insurance)
   - Bảo hiểm bắt buộc TNDS
   - Bảo hiểm vật chất xe
   - Bảo hiểm người ngồi trên xe
4. Bảo hiểm tài sản (Property Insurance)
   - Bảo hiểm nhà ở
   - Bảo hiểm cháy nổ
   - Bảo hiểm thiên tai
5. Bảo hiểm du lịch (Travel Insurance)
   - Bảo hiểm du lịch trong nước
   - Bảo hiểm du lịch quốc tế
6. Bảo hiểm trách nhiệm (Liability Insurance)
   - TNDS chủ xe
   - Trách nhiệm nghề nghiệp
   - Trách nhiệm sản phẩm
7. Bảo hiểm doanh nghiệp (Business Insurance)
   - Bảo hiểm nhóm nhân viên
   - Bảo hiểm tài sản doanh nghiệp
   - Bảo hiểm gián đoạn kinh doanh
   - Bảo hiểm hàng hóa

### 3.2. BR-002: Báo giá trực tuyến (Online Quotation)

**Mô tả**: Hệ thống phải tự động tính toán và hiển thị báo giá bảo hiểm dựa trên thông tin khách hàng cung cấp.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-002.1 | Báo giá real-time (< 10 giây) | Must |
| BR-002.2 | Hiển thị giá từ nhiều công ty bảo hiểm | Must |
| BR-002.3 | Cho phép tùy chỉnh quyền lợi/coverage | Must |
| BR-002.4 | Lưu báo giá để khách hàng xem lại sau | Should |
| BR-002.5 | Gửi báo giá qua email/SMS | Should |
| BR-002.6 | Báo giá có hiệu lực trong 30 ngày | Must |
| BR-002.7 | Hỗ trợ giảm giá (discount) cho khách hàng cũ, mua nhiều | Should |

### 3.3. BR-003: Mua bảo hiểm trực tuyến (Online Purchase)

**Mô tả**: Khách hàng có thể hoàn tất việc mua bảo hiểm 100% online.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-003.1 | Quy trình mua hoàn tất trong < 5 phút (sản phẩm đơn giản) | Must |
| BR-003.2 | Thu thập đầy đủ thông tin required cho underwriting | Must |
| BR-003.3 | eKYC verification (CCCD/CMND) | Must |
| BR-003.4 | Ký hợp đồng điện tử (e-signature) | Must |
| BR-003.5 | Thanh toán online (VNPay, Momo, ZaloPay, chuyển khoản) | Must |
| BR-003.6 | Cấp hợp đồng bảo hiểm ngay sau thanh toán thành công | Must |
| BR-003.7 | Gửi email/SMS xác nhận + hợp đồng PDF | Must |
| BR-003.8 | Cooling-off period (21 ngày hủy miễn phí cho nhân thọ) | Must |

### 3.4. BR-004: Quản lý hợp đồng (Policy Management)

**Mô tả**: Khách hàng và admin có thể quản lý toàn bộ lifecycle của hợp đồng bảo hiểm.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-004.1 | Dashboard hiển thị tất cả hợp đồng đang active | Must |
| BR-004.2 | Xem chi tiết hợp đồng: quyền lợi, hiệu lực, phí | Must |
| BR-004.3 | Hỗ trợ gia hạn hợp đồng online | Must |
| BR-004.4 | Thay đổi thông tin hợp đồng (endorsement) | Should |
| BR-004.5 | Hủy hợp đồng online | Must |
| BR-004.6 | Thông báo trước khi hết hạn (30, 14, 7, 1 ngày) | Must |
| BR-004.7 | Tải hợp đồng PDF bất kỳ lúc nào | Must |
| BR-004.8 | Lịch sử thanh toán phí bảo hiểm | Must |

### 3.5. BR-005: Yêu cầu bồi thường (Claims Management)

**Mô tả**: Khách hàng có thể nộp và theo dõi yêu cầu bồi thường trực tuyến.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-005.1 | Nộp yêu cầu bồi thường online 24/7 | Must |
| BR-005.2 | Upload tài liệu chứng từ (ảnh, scan, PDF) | Must |
| BR-005.3 | Theo dõi trạng thái real-time | Must |
| BR-005.4 | Thông báo khi có cập nhật trạng thái | Must |
| BR-005.5 | Hỗ trợ bồi thường nhanh (fast-track) cho claims đơn giản | Should |
| BR-005.6 | Lịch sử claims | Must |
| BR-005.7 | Chat/call với claims handler | Should |
| BR-005.8 | Chi trả qua chuyển khoản ngân hàng | Must |

### 3.6. BR-006: Quản lý khách hàng (Customer Management)

**Mô tả**: Hệ thống quản lý thông tin và tương tác với khách hàng.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-006.1 | Đăng ký tài khoản (email, phone, social login) | Must |
| BR-006.2 | Xác minh danh tính (eKYC) | Must |
| BR-006.3 | Profile management (thông tin cá nhân, gia đình) | Must |
| BR-006.4 | Quản lý người thụ hưởng | Must |
| BR-006.5 | Lịch sử giao dịch | Must |
| BR-006.6 | Quản lý preferences (thông báo, ngôn ngữ) | Should |
| BR-006.7 | Multi-device login | Should |
| BR-006.8 | Family plan (quản lý bảo hiểm cho gia đình) | Should |

### 3.7. BR-007: Thanh toán (Payment)

**Mô tả**: Hệ thống thanh toán linh hoạt, an toàn.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-007.1 | Thanh toán qua ví điện tử (Momo, ZaloPay, VNPay) | Must |
| BR-007.2 | Thanh toán qua thẻ ngân hàng (ATM, Visa, Master) | Must |
| BR-007.3 | Chuyển khoản ngân hàng | Must |
| BR-007.4 | Trả góp (installment) cho phí bảo hiểm lớn | Should |
| BR-007.5 | Auto-debit cho phí định kỳ | Should |
| BR-007.6 | Hoàn tiền khi hủy hợp đồng | Must |
| BR-007.7 | Invoice/Receipt PDF | Must |
| BR-007.8 | Reconciliation với đối tác bảo hiểm | Must |

### 3.8. BR-008: Admin & Operations

**Mô tả**: Back-office tools cho team vận hành.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-008.1 | Dashboard tổng quan (revenue, policies, claims) | Must |
| BR-008.2 | Quản lý sản phẩm (CRUD products) | Must |
| BR-008.3 | Quản lý đối tác bảo hiểm | Must |
| BR-008.4 | Quản lý khách hàng | Must |
| BR-008.5 | Xử lý claims | Must |
| BR-008.6 | Báo cáo tài chính | Must |
| BR-008.7 | Quản lý nội dung (CMS) | Should |
| BR-008.8 | Audit log | Must |
| BR-008.9 | Role-based access control | Must |
| BR-008.10 | Quản lý promotions/discounts | Should |

### 3.9. BR-009: Tích hợp đối tác (Partner Integration)

**Mô tả**: API integration với các công ty bảo hiểm và payment providers.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-009.1 | API integration với tối thiểu 3 insurers tại launch | Must |
| BR-009.2 | Real-time quote từ insurer | Must |
| BR-009.3 | Auto policy issuance qua insurer API | Must |
| BR-009.4 | Claims submission forwarding | Must |
| BR-009.5 | Commission tracking & settlement | Must |
| BR-009.6 | Partner portal (self-service for insurers) | Should |
| BR-009.7 | Data synchronization (policies, claims status) | Must |
| BR-009.8 | SLA monitoring | Should |

### 3.10. BR-010: Reporting & Analytics

**Mô tả**: Business intelligence và báo cáo.

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-010.1 | Sales reports (daily, weekly, monthly) | Must |
| BR-010.2 | Customer analytics (acquisition, retention, LTV) | Must |
| BR-010.3 | Product performance reports | Must |
| BR-010.4 | Partner performance reports | Must |
| BR-010.5 | Financial reports (revenue, commission, P&L) | Must |
| BR-010.6 | Claims analytics (frequency, severity, loss ratio) | Should |
| BR-010.7 | Funnel analytics (conversion at each step) | Must |
| BR-010.8 | Export reports (CSV, PDF) | Must |

---

## 4. Stakeholders

| Stakeholder | Role | Interest | Impact |
|-------------|------|----------|--------|
| CEO / Founders | Decision maker | Product success, growth | High |
| CTO | Technical leader | System architecture, quality | High |
| Product Manager | Product ownership | Feature delivery, UX | High |
| Insurance Partners | Providers | Distribution, revenue | High |
| End Customers (B2C) | Users | Easy purchase, good service | High |
| Enterprise Clients (B2B) | Users | Group insurance, efficiency | Medium |
| Regulatory Body | Oversight | Compliance, consumer protection | High |
| Investors | Funding | ROI, growth metrics | Medium |
| Customer Support | Operations | Tools, efficiency | Medium |
| Marketing Team | Growth | Customer acquisition | Medium |

---

## 5. Constraints

### 5.1. Business Constraints
- Phải có giấy phép môi giới/đại lý bảo hiểm trước khi launch
- Tuân thủ Luật Kinh doanh Bảo hiểm 2022
- Tuân thủ Nghị định về bảo vệ dữ liệu cá nhân
- Budget phát triển Year 1: giới hạn 15 tỷ VND
- Time-to-market: MVP trong 3 tháng

### 5.2. Technical Constraints
- System phải handle 10,000 concurrent users
- API response time < 500ms (95th percentile)
- Data phải được mã hóa at rest và in transit
- Hỗ trợ browsers: Chrome, Safari, Firefox (2 versions gần nhất)
- Mobile responsive (không phải native app ở giai đoạn 1)

### 5.3. Regulatory Constraints
- KYC/AML compliance
- Data residency: data phải lưu trữ tại Việt Nam
- Right to be forgotten (GDPR-like)
- Cooling-off period cho life insurance (21 ngày)
- Quảng cáo bảo hiểm phải tuân thủ quy định Bộ Tài chính

---

## 6. Assumptions

| # | Assumption | Risk if Invalid |
|---|-----------|-----------------|
| A-1 | Insurers sẵn sàng cung cấp API integration | Không có sản phẩm để bán |
| A-2 | Khách hàng VN sẵn sàng mua bảo hiểm online | Không có demand |
| A-3 | Payment gateways approve integration trong 4 tuần | Delay launch |
| A-4 | Giấy phép kinh doanh được cấp trong 3 tháng | Delay launch |
| A-5 | Cloud infrastructure đáp ứng compliance requirements | Architecture change |
| A-6 | Team tuyển đủ trong 2 tháng đầu | Delay development |
| A-7 | Không có thay đổi lớn về quy định bảo hiểm trong Year 1 | Compliance rework |

---

## 7. Success Criteria

### 7.1. MVP Success (3 months post-launch)
- [ ] 10,000 registered users
- [ ] 1,000 policies sold
- [ ] 3+ insurer partners live
- [ ] NPS > 30
- [ ] System uptime > 99.5%
- [ ] Zero critical security incidents

### 7.2. Year 1 Success
- [ ] 100,000 registered users
- [ ] 50 tỷ GWP
- [ ] 10+ insurer partners
- [ ] NPS > 40
- [ ] Claims settlement < 48h (simple claims)
- [ ] Break-even trajectory visible

---

## 8. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | | | |
| CTO | | | |
| Product Lead | | | |
| Business Lead | | | |
