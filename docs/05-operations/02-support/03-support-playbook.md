# Support Playbook - Sổ tay hỗ trợ khách hàng

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Tổng quan Support Operations

### 1.1. Support Channels

| Channel | Hours | Response SLA | Tool |
|---------|-------|-------------|------|
| Live Chat | 08:00 - 22:00 (Mon-Sun) | < 2 min | Intercom/Zendesk |
| Email (support@insurance.vn) | 24/7 (response in business hours) | < 4 hours | Zendesk |
| Hotline (1900-xxxx) | 08:00 - 20:00 (Mon-Sat) | < 30 sec pickup | VoIP system |
| In-app Support | 24/7 | < 4 hours | Intercom |
| Social Media (Facebook, Zalo) | 08:00 - 22:00 | < 1 hour | Hootsuite |

### 1.2. Support Tiers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPPORT TIERS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Tier 1 (L1): Customer Support Agent                                    │
│  ├── Scope: Account issues, FAQ, basic product questions                │
│  ├── Tools: CRM, Knowledge Base, Canned responses                       │
│  ├── Resolution target: 80% first-contact resolution                    │
│  └── Escalation: To L2 if cannot resolve in 15 min                     │
│                                                                           │
│  Tier 2 (L2): Senior Support / Technical Support                        │
│  ├── Scope: Payment issues, policy changes, complex queries             │
│  ├── Tools: Admin portal, DB read access, payment dashboards            │
│  ├── Resolution target: 90% within SLA                                  │
│  └── Escalation: To L3 if system issue or > 4 hours                    │
│                                                                           │
│  Tier 3 (L3): Engineering / DevOps                                      │
│  ├── Scope: System bugs, infrastructure issues, data fixes              │
│  ├── Tools: Full system access, code, database                          │
│  ├── Resolution target: Based on incident severity                      │
│  └── Escalation: To Management if P1 > 1 hour                          │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3. Support SLA

| Priority | First Response | Resolution | Examples |
|----------|---------------|------------|----------|
| P1 - Critical | 15 min | 4 hours | Cannot pay, account hacked, data breach |
| P2 - High | 1 hour | 8 hours | Policy not issued, claim stuck, wrong charge |
| P3 - Medium | 4 hours | 24 hours | Feature inquiry, change request, minor bug |
| P4 - Low | 24 hours | 72 hours | Suggestion, feedback, general question |

---

## 2. Playbook: Account & Access Issues

### 2.1. Play: Khách không đăng nhập được

```
Bước 1: Xác định vấn đề
├── "Lỗi hiển thị là gì?" (screenshot nếu có)
├── "Dùng email hay SĐT để đăng nhập?"
└── "Đã thử reset password chưa?"

Bước 2: Troubleshoot
├── Check account status in CRM
│   ├── Active → Try reset password flow
│   ├── Locked → Check failed_attempts, unlock if < 24h
│   ├── Suspended → Escalate to L2 (compliance review)
│   └── Not found → Guide registration
│
├── If password reset not working:
│   ├── Check email delivery (spam folder)
│   ├── Verify email/phone is correct
│   └── If different device → Check 2FA
│
└── If still cannot resolve → Escalate L2

Bước 3: Resolution
├── Account unlocked → Guide to login + suggest password change
├── Password reset → Guide through process
├── Email/phone mismatch → Identity verification required
└── System issue → Create ticket, provide ETA

Script mẫu:
"Anh/Chị [Name] ơi, em đã kiểm tra tài khoản của Anh/Chị.
[Giải thích vấn đề]. Em đã [hành động]. 
Anh/Chị vui lòng thử [hướng dẫn] giúp em nhé.
Nếu vẫn gặp khó khăn, Anh/Chị liên hệ lại em sẽ hỗ trợ tiếp ạ."
```

### 2.2. Play: Khách muốn thay đổi thông tin tài khoản

```
Bước 1: Xác minh danh tính
├── Hỏi: Họ tên, Ngày sinh, SĐT đăng ký, Email đăng ký
├── Match ≥ 3/4 fields → Proceed
└── Match < 3/4 → Yêu cầu gửi ảnh CCCD + selfie

Bước 2: Loại thay đổi
├── Email/SĐT → Hướng dẫn tự thay đổi trong app (nếu còn truy cập)
├── Họ tên (do sai chính tả) → L2 xử lý, cần ảnh CCCD
├── Ngày sinh → L2 xử lý, cần ảnh CCCD
├── Địa chỉ → Khách tự thay đổi trong Profile
└── CCCD mới → L2 xử lý, cần ảnh CCCD mới

Bước 3: Processing
├── Simple changes → Thực hiện ngay, confirm via email
├── Identity-related → Tạo ticket, SLA 24-48h
└── Notify affected services (policy update if needed)
```

---

## 3. Playbook: Payment Issues

### 3.1. Play: Thanh toán thất bại

```
Bước 1: Thu thập thông tin
├── Mã đơn hàng (Order ID)?
├── Phương thức thanh toán?
├── Thời gian giao dịch?
├── Lỗi hiển thị? (screenshot)
└── Đã bị trừ tiền chưa?

Bước 2: Kiểm tra status

IF chưa bị trừ tiền:
├── Check: Số dư/hạn mức đủ không?
├── Check: Thẻ/ví còn hoạt động không?
├── Check: 3DS có yêu cầu xác nhận không?
├── Hướng dẫn: Thử lại hoặc đổi phương thức
└── Nếu lỗi hệ thống → Tạo ticket P2

IF đã bị trừ tiền nhưng chưa nhận hợp đồng:
├── Check CRM: Payment status?
│   ├── "Completed" + Policy issued → Gửi lại email/hướng dẫn tải
│   ├── "Completed" + Policy pending → Đợi 30 phút, tự xử lý
│   ├── "Processing" → Đợi 15-30 phút
│   └── "Failed" nhưng trừ tiền → Escalate L2 NGAY
└── Reassure khách: "Tiền đã được ghi nhận, hợp đồng sẽ có trong [timeframe]"

Bước 3: Follow-up
├── Set reminder check sau 30 phút
├── Update ticket với kết quả
└── Nếu > 2h chưa resolve → Escalate L3
```

### 3.2. Play: Yêu cầu hoàn tiền

```
Bước 1: Xác định eligibility
├── Cooling-off period (21 ngày, nhân thọ)? → Full refund eligible
├── Policy chưa active? → Full refund eligible
├── Hủy hợp đồng trong thời hạn? → Pro-rata refund
├── Duplicate payment? → Full refund eligible
└── System error charge? → Full refund eligible

Bước 2: Process refund
├── Eligible → Xác nhận số tiền hoàn + thời gian
│   ├── Ví điện tử: 1-3 ngày
│   ├── Thẻ ATM: 3-5 ngày
│   ├── Thẻ Visa/Master: 5-14 ngày
│   └── Chuyển khoản: 1-3 ngày
│
├── Need approval (> 10 triệu) → Escalate L2
└── Not eligible → Giải thích lý do, quote terms & conditions

Bước 3: Confirmation
├── Tạo refund request trong system
├── Gửi email xác nhận cho khách
├── Set reminder theo dõi refund status
└── Close khi khách confirm nhận tiền

Script:
"Em đã tạo yêu cầu hoàn tiền số [amount] cho Anh/Chị.
Số tiền sẽ được hoàn về [payment method] trong vòng [X ngày làm việc].
Mã yêu cầu hoàn tiền: [REF-ID]. Anh/Chị lưu lại để theo dõi ạ."
```

---

## 4. Playbook: Policy Issues

### 4.1. Play: Hợp đồng chưa nhận được

```
Bước 1: Kiểm tra
├── Check CRM: Policy status?
│   ├── "Active" → Policy đã issue, check email delivery
│   ├── "Pending Payment" → Payment chưa hoàn tất
│   ├── "Pending Underwriting" → Đang chờ insurer approve
│   └── "Processing" → Đang xử lý, ETA 15-30 phút
│
├── If Active but khách chưa nhận:
│   ├── Check email spam folder
│   ├── Resend policy email
│   ├── Guide tải từ Dashboard → Hợp đồng → Download PDF
│   └── Nếu PDF không tồn tại → Escalate L2 (regenerate)

Bước 2: Nếu policy thực sự chưa issued
├── Payment confirmed? 
│   ├── Yes → Escalate L2 (manual issuance)
│   └── No → Guide khách hoàn tất thanh toán
│
├── ETA communication:
│   ├── "Hợp đồng của Anh/Chị đang được xử lý."
│   ├── "Dự kiến hoàn tất trong [timeframe]."
│   └── "Em sẽ liên hệ lại ngay khi có cập nhật."
```

### 4.2. Play: Yêu cầu hủy hợp đồng

```
Bước 1: Retention attempt
├── Hỏi lý do hủy
│   ├── Giá cao → Giới thiệu plan phù hợp hơn / discount
│   ├── Không cần nữa → Confirm hiểu rủi ro khi không có BH
│   ├── Chuyển sang công ty khác → Highlight benefits của platform
│   └── Không hài lòng dịch vụ → Escalate to manager
│
├── Nếu khách vẫn muốn hủy → Proceed

Bước 2: Process cancellation
├── Check cancellation policy
│   ├── Within cooling-off? → Full refund
│   ├── Pro-rata refund applicable? → Calculate amount
│   └── Surrender value (life insurance)? → Quote value
│
├── Confirm with customer:
│   ├── Số tiền hoàn (nếu có)
│   ├── Ngày hợp đồng hết hiệu lực
│   ├── Hậu quả (mất coverage)
│   └── Quyền lợi đang chờ xử lý (claims pending?)

Bước 3: Execute
├── Submit cancellation request
├── Send confirmation email
├── Process refund (nếu applicable)
├── Update CRM status
└── Follow-up survey (sau 24h)

Script:
"Em hiểu quyết định của Anh/Chị. Em đã gửi yêu cầu hủy hợp đồng [policy number].
- Hợp đồng sẽ hết hiệu lực vào: [date]
- Số tiền hoàn lại: [amount] (nếu có)
- Thời gian hoàn tiền: [X ngày]
Lưu ý: Sau khi hủy, Anh/Chị sẽ không được bảo vệ bởi bảo hiểm này nữa.
Anh/Chị có cần em hỗ trợ gì thêm không ạ?"
```

---

## 5. Playbook: Claims Support

### 5.1. Play: Hướng dẫn nộp claim

```
Bước 1: Eligibility check
├── Policy active tại thời điểm sự kiện?
├── Sự kiện nằm trong phạm vi bảo hiểm?
├── Đã qua waiting period?
├── Không thuộc exclusions?
└── Trong thời hạn báo (thường 30 ngày sau sự kiện)

Bước 2: Guide submission
├── "Anh/Chị vào Dashboard → Hợp đồng [X] → Yêu cầu bồi thường"
├── Hướng dẫn chọn loại sự kiện
├── Checklist chứng từ cần upload (theo loại BH)
├── Tips: Ảnh rõ nét, scan đầy đủ trang, file < 10MB
└── "Sau khi nộp, em sẽ nhận được mã claim để theo dõi"

Bước 3: Set expectations
├── Thời gian xử lý dự kiến: [X ngày]
├── Hệ thống sẽ thông báo qua email/SMS mỗi khi có cập nhật
├── Nếu cần bổ sung chứng từ, sẽ có thông báo cụ thể
└── Hotline claims 24/7: 1900-xxxx (nếu cần hỗ trợ gấp)
```

### 5.2. Play: Claim bị từ chối - Khách khiếu nại

```
Bước 1: Acknowledge & Empathize
├── "Em hiểu sự thất vọng của Anh/Chị"
├── "Em sẽ kiểm tra lại chi tiết claim này"
└── "Anh/Chị có thể cho em biết thêm về tình huống được không?"

Bước 2: Review rejection reason
├── Check CRM: Claim details + rejection reason
├── Explain to customer (simple, non-technical language)
├── Common reasons:
│   ├── Exclusion → Quote exact clause, explain why
│   ├── Waiting period → Show dates, explain policy
│   ├── Insufficient documents → List what's needed
│   └── Pre-existing condition → Explain declaration

Bước 3: Options for customer
├── IF documentation issue → "Anh/Chị bổ sung [X] để em submit lại"
├── IF disputable → "Anh/Chị có quyền khiếu nại trong 30 ngày"
│   ├── Guide formal appeal process
│   ├── Provide appeal form / email
│   └── Escalate to Claims Manager
├── IF final → Explain clearly, offer to answer questions
└── ALWAYS: Log interaction, update ticket

Script (empathetic decline):
"Em rất tiếc phải thông báo rằng yêu cầu bồi thường [claim-id] 
không được chấp nhận. Lý do: [giải thích đơn giản].
Theo điều khoản hợp đồng mục [X], trường hợp này [giải thích].
Anh/Chị có quyền khiếu nại quyết định này trong vòng 30 ngày.
Em có thể hướng dẫn quy trình khiếu nại nếu Anh/Chị muốn ạ."
```

---

## 6. Playbook: Escalation

### 6.1. Escalation Matrix

| Situation | Escalate To | Method | SLA |
|-----------|------------|--------|-----|
| Technical issue cannot resolve | L2 Technical Support | Ticket + Slack | 15 min response |
| Payment stuck > 30 min | L2 + Payment team | Urgent ticket | 30 min |
| Customer angry/threatening | Support Manager | Immediate transfer | Now |
| Data breach suspected | Security Team + CTO | Phone + Slack | 5 min |
| Legal/compliance question | Legal team | Email ticket | 24h |
| Media/influencer complaint | PR + Management | Immediate alert | Now |
| System-wide issue | L3 + DevOps | PagerDuty | 5 min |

### 6.2. Escalation Template

```
📋 ESCALATION TICKET

Customer: [Name] - [Customer ID]
Channel: [Chat/Email/Phone]
Priority: [P1/P2/P3/P4]
Issue Summary: [One sentence]

Details:
- What happened: [description]
- When: [timestamp]
- Impact: [what customer cannot do]
- Steps already taken: [list]
- Error messages/screenshots: [attach]

Related IDs:
- Order: [order_id]
- Policy: [policy_id]  
- Payment: [transaction_id]
- Previous tickets: [ticket_ids]

Customer sentiment: [Calm/Frustrated/Angry/Threatening]
Urgency justification: [why this priority]
```

---

## 7. Communication Guidelines

### 7.1. Tone & Language

| Do | Don't |
|----|-------|
| Xưng hô: "Em" (support) - "Anh/Chị" (customer) | Dùng "tôi", "bạn" (quá formal/informal) |
| Dùng ngôn ngữ đơn giản, dễ hiểu | Dùng thuật ngữ kỹ thuật phức tạp |
| Acknowledge cảm xúc khách hàng | Tranh luận hoặc đổ lỗi |
| Cung cấp giải pháp cụ thể | Trả lời mơ hồ "em sẽ check" |
| Chủ động follow-up | Để khách phải hỏi lại |
| Xin lỗi khi hệ thống lỗi | Đổ lỗi cho bên thứ ba |

### 7.2. Response Templates

**Opening:**
```
"Chào Anh/Chị [Name], em là [Agent Name] từ đội hỗ trợ Insurance System.
Em rất vui được hỗ trợ Anh/Chị hôm nay. Anh/Chị cần em hỗ trợ gì ạ?"
```

**Khi cần thời gian kiểm tra:**
```
"Em cần kiểm tra thông tin chi tiết hơn. 
Anh/Chị vui lòng đợi em khoảng 2-3 phút nhé."
```

**Khi cần escalate:**
```
"Vấn đề của Anh/Chị cần được đội kỹ thuật chuyên sâu hỗ trợ.
Em đã tạo yêu cầu ưu tiên, đội kỹ thuật sẽ liên hệ lại 
Anh/Chị trong vòng [timeframe]. Mã ticket: [ID]."
```

**Closing:**
```
"Anh/Chị còn cần em hỗ trợ gì thêm không ạ?
[Nếu không] Cảm ơn Anh/Chị đã liên hệ. Chúc Anh/Chị một ngày tốt lành!
Đánh giá trải nghiệm hỗ trợ giúp em nhé ⭐"
```

**Khi có lỗi hệ thống:**
```
"Em xin lỗi về sự bất tiện này. Hiện tại hệ thống đang gặp [mô tả ngắn].
Đội kỹ thuật đang khắc phục và dự kiến hoàn tất trong [timeframe].
Em sẽ chủ động liên hệ lại Anh/Chị ngay khi vấn đề được giải quyết.
Mã theo dõi: [ticket-id]."
```

---

## 8. Metrics & Quality

### 8.1. Support KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Response Time | < 2 min (chat), < 4h (email) | Zendesk report |
| First Contact Resolution (FCR) | > 75% | Tickets resolved without escalation |
| Average Handle Time (AHT) | < 8 min (chat), < 15 min (phone) | Agent report |
| Customer Satisfaction (CSAT) | > 4.5/5 | Post-interaction survey |
| Net Promoter Score (NPS) | > 40 | Monthly survey |
| Ticket Backlog | < 50 open tickets | Daily check |
| Escalation Rate | < 20% | L1 → L2 escalation |
| SLA Compliance | > 95% | Per priority level |

### 8.2. Quality Assurance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Ticket review (random sampling) | Weekly (10% tickets) | Support Manager |
| Call recording review | Weekly (5 calls/agent) | QA Lead |
| Chat transcript review | Weekly (10 chats/agent) | QA Lead |
| Customer survey analysis | Monthly | Support Manager |
| Knowledge base update | Bi-weekly | Content Lead |
| Agent training | Monthly | Training Lead |
| Playbook review | Quarterly | Support Manager + Product |

---

## 9. Tools & Access

### 9.1. Support Tools

| Tool | Purpose | Access Level |
|------|---------|-------------|
| Zendesk / Intercom | Ticket management, live chat | All agents |
| CRM (Admin Portal) | Customer lookup, policy view | All agents |
| Payment Dashboard | Transaction lookup | L2+ agents |
| Grafana (view only) | System status check | L2+ agents |
| Slack | Internal communication | All agents |
| Confluence | Knowledge base | All agents |
| Phone system | Calls | All agents |

### 9.2. Quick Access Links

| Resource | URL/Location |
|----------|-------------|
| Knowledge Base | https://kb.internal.insurance.vn |
| System Status | https://status.insurance.vn |
| Admin Portal | https://admin.insurance.vn |
| Escalation Form | Zendesk → New Ticket → Escalation |
| On-Call Schedule | PagerDuty → Team Schedule |
| Release Notes | Confluence → Product → Release Notes |

---

## 10. Phê duyệt

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Support Manager | | | |
| Product Manager | | | |
| Operations Lead | | | |
