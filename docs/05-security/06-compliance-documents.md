# Compliance Documents - Tài Liệu Tuân Thủ

---

## 1. Tổng quan

### 1.1. Mục đích
Tài liệu này mô tả các yêu cầu tuân thủ pháp luật và tiêu chuẩn ngành áp dụng cho Insurance System Platform, bao gồm các quy định về bảo vệ dữ liệu, bảo mật thanh toán, và quy định bảo hiểm tại Việt Nam.

### 1.2. Khung tuân thủ (Compliance Framework)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE FRAMEWORK                               │
│                                                                       │
│  ┌─── Quy định Việt Nam ─────────────────────────────────────────┐  │
│  │  • Luật An ninh mạng 2018                                     │  │
│  │  • Nghị định 13/2023/NĐ-CP (Bảo vệ dữ liệu cá nhân)        │  │
│  │  • Luật Kinh doanh bảo hiểm 2022                             │  │
│  │  • Luật Phòng chống rửa tiền 2022                            │  │
│  │  • Thông tư NHNN về thanh toán điện tử                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── Tiêu chuẩn quốc tế ───────────────────────────────────────┐  │
│  │  • PCI-DSS v4.0 (Payment Card Industry)                       │  │
│  │  • ISO 27001:2022 (Information Security)                      │  │
│  │  • OWASP Top 10 (Application Security)                        │  │
│  │  • CIS Benchmarks (Infrastructure Security)                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── Quy định nội bộ ──────────────────────────────────────────┐  │
│  │  • Security Policy (Internal)                                  │  │
│  │  • Data Handling Guidelines                                    │  │
│  │  • Incident Response Plan                                      │  │
│  │  • Business Continuity Plan                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bảo vệ Dữ liệu Cá nhân (PDPA - Nghị định 13/2023)

### 2.1. Yêu cầu tuân thủ

| Yêu cầu | Điều khoản | Implementation | Status |
|----------|-----------|----------------|--------|
| Thu thập dữ liệu có đồng ý | Điều 11 | Consent form trước khi thu thập | ✅ |
| Thông báo mục đích sử dụng | Điều 13 | Privacy notice hiển thị rõ ràng | ✅ |
| Chỉ thu thập dữ liệu cần thiết | Điều 16 | Data minimization trong form | ✅ |
| Bảo mật dữ liệu cá nhân | Điều 26 | Encryption + Access control | ✅ |
| Quyền truy cập dữ liệu | Điều 9 | Data export feature | ✅ |
| Quyền chỉnh sửa | Điều 9 | Profile edit feature | ✅ |
| Quyền xóa dữ liệu | Điều 9 | Account deletion (with exceptions) | ✅ |
| Thông báo vi phạm dữ liệu | Điều 23 | Incident response plan (72h) | ✅ |
| Đánh giá tác động | Điều 24 | DPIA process defined | ✅ |
| Chỉ định DPO | Điều 28 | DPO appointed | ✅ |
| Lưu trữ tại Việt Nam | Điều 26 | AWS Singapore + VN edge | ✅ |
| Chuyển dữ liệu xuyên biên giới | Điều 25 | Consent + Approval process | ✅ |

### 2.2. Data Processing Register

| Hoạt động xử lý | Loại dữ liệu | Cơ sở pháp lý | Thời gian lưu | Bên thứ 3 |
|-----------------|--------------|---------------|--------------|-----------|
| Đăng ký tài khoản | Tên, email, phone, CCCD | Đồng ý | Thời gian sử dụng + 5 năm | Không |
| Mua bảo hiểm | PII + thông tin sức khỏe | Hợp đồng + Đồng ý | 10 năm sau hết hạn | Insurer |
| eKYC xác thực | CCCD, ảnh khuôn mặt | Đồng ý + Pháp luật | 5 năm | eKYC provider |
| Thanh toán | Thông tin thanh toán | Hợp đồng | 7 năm | Payment gateway |
| Bồi thường | Hồ sơ y tế, ảnh | Hợp đồng | 10 năm | Insurer |
| Marketing | Email, sở thích | Đồng ý (opt-in) | Đến khi rút đồng ý | Email service |
| Analytics | Hành vi (anonymized) | Lợi ích hợp pháp | 3 năm | Analytics tool |
| Hỗ trợ KH | Chat, ticket content | Hợp đồng | 3 năm | Không |

### 2.3. Consent Management

```
┌─────────────────────────────────────────────────────────┐
│              CONSENT MANAGEMENT FLOW                       │
│                                                           │
│  Registration:                                            │
│  ☑ Đồng ý Điều khoản sử dụng (Required)                │
│  ☑ Đồng ý Chính sách bảo mật (Required)                │
│  ☐ Đồng ý nhận thông tin marketing (Optional)           │
│  ☐ Đồng ý chia sẻ dữ liệu với đối tác (Optional)      │
│                                                           │
│  Purchase:                                                │
│  ☑ Đồng ý chia sẻ thông tin với CTBH (Required)        │
│  ☑ Xác nhận thông tin chính xác (Required)              │
│  ☐ Đồng ý auto-renewal (Optional)                       │
│                                                           │
│  Health Insurance:                                        │
│  ☑ Đồng ý cung cấp thông tin sức khỏe (Required)       │
│  ☑ Đồng ý CTBH truy cập hồ sơ y tế (Required)         │
│                                                           │
│  Withdraw Consent:                                        │
│  Settings → Privacy → Manage Consent → Withdraw          │
│  Effect: Immediate (marketing), End of contract (core)   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.4. Data Subject Rights (DSAR) Process

| Right | Process | SLA | Exceptions |
|-------|---------|-----|------------|
| Right to Access | Request → Verify identity → Export data → Deliver | 30 days | None |
| Right to Rectification | Request → Verify → Update → Confirm | 7 days | Verified docs |
| Right to Erasure | Request → Verify → Check exceptions → Delete/Refuse | 30 days | Legal retention |
| Right to Portability | Request → Verify → Generate JSON/CSV → Deliver | 30 days | None |
| Right to Object | Request → Verify → Stop processing → Confirm | 7 days | Contractual obligation |
| Withdraw Consent | Settings toggle → Immediate effect | Immediate | Core service consent |

---

## 3. Luật An ninh mạng 2018

### 3.1. Yêu cầu tuân thủ

| Yêu cầu | Điều khoản | Implementation | Status |
|----------|-----------|----------------|--------|
| Lưu trữ dữ liệu tại Việt Nam | Điều 26 | Primary storage: AWS Singapore (gần VN nhất) | ✅ |
| Bảo vệ hệ thống thông tin | Điều 24 | Security controls theo tiêu chuẩn | ✅ |
| Ứng phó sự cố | Điều 25 | Incident Response Plan | ✅ |
| Báo cáo cơ quan chức năng | Điều 26 | Process defined, contact list | ✅ |
| Xác thực người dùng | Điều 26 | eKYC + OTP verification | ✅ |
| Log lưu trữ | Điều 26 | Minimum 12 months | ✅ |
| Hợp tác điều tra | Điều 26 | Legal team + process | ✅ |

### 3.2. Hệ thống thông tin quan trọng

| Hạng mục | Phân loại | Biện pháp bảo vệ |
|----------|-----------|-------------------|
| Customer Portal | Cấp 3 | WAF, DDoS protection, encryption, monitoring |
| Payment System | Cấp 4 | PCI-DSS compliance, tokenization, audit |
| Customer Database | Cấp 4 | Encryption, access control, backup, DR |
| Admin System | Cấp 3 | VPN, MFA, IP whitelist, audit logging |
| API Gateway | Cấp 3 | Rate limiting, authentication, WAF |

---

## 4. PCI-DSS v4.0 Compliance

### 4.1. Scope & Applicability

| Requirement | Applicability | Approach |
|-------------|--------------|----------|
| Store cardholder data | **NOT IN SCOPE** | We never store card data |
| Process card data | **LIMITED** | Redirect to payment gateway |
| Transmit card data | **NOT IN SCOPE** | Direct to gateway (iframe/redirect) |
| SAQ Type | **SAQ-A** | Fully outsourced to gateway |

### 4.2. Implementation (SAQ-A Requirements)

| Requirement | Description | Implementation | Status |
|-------------|-------------|----------------|--------|
| Req 2 | Secure configuration | Hardened servers, no defaults | ✅ |
| Req 6 | Secure systems/software | SDLC, vulnerability management | ✅ |
| Req 8 | Strong access control | MFA, unique IDs, password policy | ✅ |
| Req 9 | Physical security | AWS manages (SOC2 certified) | ✅ |
| Req 11 | Regular testing | Quarterly ASV scan, annual pentest | ✅ |
| Req 12 | Security policy | Documented, reviewed annually | ✅ |

### 4.3. Payment Flow Security

```
┌─────────────────────────────────────────────────────────┐
│              PCI-DSS COMPLIANT PAYMENT FLOW               │
│                                                           │
│  Customer                Platform              Gateway    │
│  ────────                ────────              ───────    │
│                                                           │
│  1. Click "Pay"  ───────▶  Create order                  │
│                            Generate payment URL            │
│                                                           │
│  2. Redirect     ◀──────── Payment URL                   │
│     to gateway                                            │
│                                                           │
│  3. Enter card   ─────────────────────────▶  Process     │
│     details                                   payment     │
│     (on gateway                                           │
│      domain)                                              │
│                                                           │
│  4. Return       ◀────────────────────────── Result      │
│     to platform                               callback    │
│                                                           │
│  5. Show result  ◀──────── Verify webhook                │
│                            Update order status            │
│                                                           │
│  ⚠️ Platform NEVER sees or stores card numbers            │
│  ⚠️ Card input is on payment gateway's secure page       │
│  ⚠️ Only transaction ID and status are stored            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Luật Kinh doanh Bảo hiểm 2022

### 5.1. Yêu cầu tuân thủ

| Yêu cầu | Điều khoản | Implementation | Status |
|----------|-----------|----------------|--------|
| Giấy phép hoạt động | Điều 120 | Giấy phép môi giới/đại lý BH | Required |
| Lưu trữ hồ sơ hợp đồng | Điều 134 | 10 năm sau khi hết hiệu lực | ✅ |
| Bảo mật thông tin KH | Điều 60 | Encryption + access control | ✅ |
| Cung cấp thông tin đầy đủ | Điều 61 | Transparent product display | ✅ |
| Báo cáo định kỳ | Điều 98 | Quarterly reports to authority | Process defined |
| Quản lý đại lý | Điều 120-125 | Agent management system | ✅ |
| Chống trục lợi BH | Điều 63 | Fraud detection system | ✅ |
| Free-look period | Điều 56 | 21-day cancellation for life | ✅ |

### 5.2. Data Retention Requirements (Insurance-specific)

| Data Type | Retention Period | Legal Basis | Storage |
|-----------|-----------------|-------------|---------|
| Policy documents | 10 years after expiry | Luật KDBH Đ134 | S3 encrypted |
| Claims records | 10 years after settlement | Luật KDBH Đ134 | S3 + DB |
| Premium payment records | 7 years | Thuế + Kế toán | DB encrypted |
| Customer correspondence | 5 years | Nội bộ | S3 |
| Agent commission records | 7 years | Thuế | DB |
| Underwriting decisions | 10 years | Luật KDBH | DB |
| Audit logs | 5 years | An ninh mạng | CloudWatch/S3 |
| Marketing consent logs | Duration + 1 year | PDPA | DB |

---

## 6. AML/KYC Compliance (Phòng chống rửa tiền)

### 6.1. KYC Requirements

| Level | Trigger | Verification | Documents |
|-------|---------|--------------|-----------|
| **Basic KYC** | Account registration | Name + Phone/Email OTP | Phone/Email |
| **Standard KYC** | First purchase < 50M VND | eKYC (CCCD + Selfie) | CCCD/CMND |
| **Enhanced KYC** | Purchase > 50M VND or high-risk | Full eKYC + additional docs | CCCD + Income proof |
| **Business KYC** | Corporate customer | Company verification | ĐKKD + Legal rep docs |

### 6.2. Transaction Monitoring

| Rule | Threshold | Action |
|------|-----------|--------|
| Single transaction | > 300M VND | Flag for review |
| Daily cumulative | > 500M VND | Flag for review |
| Multiple policies (same person) | > 5 in 30 days | Alert |
| Unusual beneficiary pattern | Multiple unrelated | Alert |
| High-risk country connection | Any | Enhanced due diligence |
| Cash payment (if supported) | > 100M VND | Mandatory report |
| Suspicious claim pattern | Frequent/quick claims | Alert + investigation |

### 6.3. Suspicious Transaction Reporting

```
┌─────────────────────────────────────────────────────────┐
│           SUSPICIOUS TRANSACTION REPORT (STR)             │
│                                                           │
│  Detection                                                │
│  ├── Automated rules trigger alert                       │
│  ├── Manual review by compliance officer                 │
│  └── Staff report suspicious activity                    │
│                                                           │
│  Assessment (24 hours)                                    │
│  ├── Gather transaction details                          │
│  ├── Review customer profile                             │
│  ├── Check against watchlists                            │
│  └── Determine if STR required                           │
│                                                           │
│  Filing (within 48 hours if confirmed)                   │
│  ├── Complete STR form                                   │
│  ├── Submit to State Bank of Vietnam                     │
│  ├── DO NOT notify the customer                          │
│  └── Retain records for 5 years                          │
│                                                           │
│  Follow-up                                                │
│  ├── Continue monitoring                                 │
│  ├── Cooperate with authorities                          │
│  └── Consider account restriction                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 7. ISO 27001:2022 Alignment

### 7.1. Control Implementation Status

| Control Area | Controls | Implemented | Partial | Not Started |
|-------------|----------|-------------|---------|-------------|
| A.5 Organizational | 37 | 30 | 5 | 2 |
| A.6 People | 8 | 6 | 2 | 0 |
| A.7 Physical | 14 | 12 (AWS) | 2 | 0 |
| A.8 Technological | 34 | 28 | 4 | 2 |
| **Total** | **93** | **76 (82%)** | **13 (14%)** | **4 (4%)** |

### 7.2. Key Controls

| Control | Title | Status | Evidence |
|---------|-------|--------|----------|
| A.5.1 | Policies for information security | ✅ | This document + Security Policy |
| A.5.2 | Information security roles | ✅ | RACI matrix defined |
| A.5.10 | Acceptable use of information | ✅ | Employee handbook |
| A.5.23 | Information security for cloud services | ✅ | AWS security config |
| A.8.2 | Privileged access rights | ✅ | IAM + MFA + audit |
| A.8.5 | Secure authentication | ✅ | JWT + MFA + password policy |
| A.8.9 | Configuration management | ✅ | IaC + change management |
| A.8.12 | Data leakage prevention | ✅ | DLP rules + monitoring |
| A.8.16 | Monitoring activities | ✅ | CloudWatch + ELK + alerts |
| A.8.24 | Use of cryptography | ✅ | AES-256, TLS 1.3, KMS |
| A.8.25 | Secure development lifecycle | ✅ | SDLC + security reviews |
| A.8.28 | Secure coding | ✅ | SAST + code review |

---

## 8. Compliance Monitoring & Reporting

### 8.1. Monitoring Activities

| Activity | Frequency | Responsible | Output |
|----------|-----------|-------------|--------|
| Data processing review | Monthly | DPO | Compliance report |
| Access control audit | Monthly | Security Team | Access review report |
| Vulnerability scan | Weekly | Security Team | Vulnerability report |
| Policy compliance check | Quarterly | Compliance Officer | Compliance dashboard |
| Third-party assessment | Annual | Procurement + Security | Vendor report |
| Regulatory update check | Monthly | Legal + Compliance | Regulatory brief |
| Employee training completion | Quarterly | HR + Security | Training report |
| Incident post-mortem | Per incident | Security Team | Lessons learned |

### 8.2. Compliance Dashboard Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| PDPA consent coverage | 100% | - | Track |
| DSAR response within SLA | 100% | - | Track |
| Data breach notification (< 72h) | 100% | N/A | Ready |
| Security training completion | 100% | - | Track |
| PCI-DSS SAQ-A compliance | 100% | - | Track |
| Vulnerability SLA compliance | > 95% | - | Track |
| Audit findings remediation | 100% within SLA | - | Track |
| Policy review on schedule | 100% | - | Track |

### 8.3. Regulatory Reporting Schedule

| Report | Recipient | Frequency | Deadline |
|--------|-----------|-----------|----------|
| Insurance activity report | Cục QLGS Bảo hiểm | Quarterly | 15th of following month |
| AML/CTF report | State Bank of Vietnam | Annual | End of Q1 |
| Data protection report | Bộ Công an (if required) | Annual | As requested |
| Incident report | VNCERT | Per incident (SEV-1) | 24 hours |
| Financial report | Tax authority | Annual | March 31 |
| PCI compliance | Payment processor | Annual | Varies |

---

## 9. Vendor & Third-party Compliance

### 9.1. Vendor Assessment

| Vendor Category | Assessment Level | Frequency | Requirements |
|----------------|-----------------|-----------|--------------|
| Payment Gateway | Full (Critical) | Annual | PCI-DSS, SOC2, SLA |
| Insurance Partners | Standard | Annual | Data handling agreement |
| eKYC Provider | Full (Critical) | Annual | PDPA compliance, encryption |
| Cloud Provider (AWS) | Rely on certifications | Continuous | SOC2, ISO27001, PCI |
| Email/SMS Service | Basic | Annual | Data processing agreement |
| Analytics Tools | Basic | Annual | Data anonymization |
| CDN Provider | Standard | Annual | DDoS, TLS, data handling |

### 9.2. Data Processing Agreements (DPA)

| Requirement | In DPA | Verification |
|-------------|--------|--------------|
| Purpose limitation | ✅ | Contract review |
| Sub-processor notification | ✅ | Quarterly check |
| Data deletion on termination | ✅ | Termination checklist |
| Breach notification (< 48h) | ✅ | Incident test |
| Audit right | ✅ | Annual exercise |
| Data residency | ✅ | Infrastructure review |
| Security standards | ✅ | Certification check |
| Return/delete data | ✅ | Exit plan |

---

## 10. Non-compliance Risk & Penalties

### 10.1. Regulatory Penalties

| Regulation | Violation | Max Penalty |
|-----------|-----------|-------------|
| PDPA (NĐ 13/2023) | Data breach, non-compliance | 100M VND + criminal |
| Luật An ninh mạng | Security failure, non-reporting | 200M VND + suspension |
| Luật KDBH | Operating without license | Revocation + fine |
| AML Law | Failure to report | 500M VND + criminal |
| PCI-DSS | Data breach | Fines from card networks + liability |

### 10.2. Business Impact of Non-compliance

| Impact | Description | Estimated Cost |
|--------|-------------|---------------|
| Regulatory fine | Direct penalty | Up to 500M VND |
| License revocation | Cannot operate | Total business loss |
| Data breach liability | Customer compensation | Unlimited |
| Reputation damage | Customer trust loss | Revenue decline 20-50% |
| Partner termination | Insurers leave platform | Revenue loss |
| Legal costs | Litigation, defense | 100M+ VND |

---

*Document Version: 1.0*
*Last Updated: 2024-01*
*Owner: Compliance Officer + Legal Team*
*Review Frequency: Quarterly (regulations change frequently)*
