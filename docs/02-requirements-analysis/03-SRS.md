# Software Requirements Specification (SRS)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Chuẩn | IEEE 830-1998 |

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu SRS mô tả đầy đủ các yêu cầu phần mềm cho hệ thống Insurance System Platform, bao gồm yêu cầu chức năng, phi chức năng, giao diện, và ràng buộc kỹ thuật.

### 1.2. Phạm vi hệ thống
Insurance System là nền tảng web-based cho phép:
- Khách hàng: tìm kiếm, so sánh, mua, quản lý bảo hiểm trực tuyến
- Admin: quản lý sản phẩm, khách hàng, hợp đồng, claims
- Partners: tích hợp API, quản lý sản phẩm, theo dõi hiệu quả

### 1.3. Thuật ngữ

| Thuật ngữ | Định nghĩa |
|-----------|-------------|
| GWP | Gross Written Premium - Tổng phí bảo hiểm ghi nhận |
| Policy | Hợp đồng bảo hiểm |
| Claim | Yêu cầu bồi thường |
| Underwriting | Đánh giá rủi ro và quyết định chấp nhận bảo hiểm |
| Premium | Phí bảo hiểm |
| Sum Insured | Số tiền bảo hiểm |
| Deductible | Mức miễn thường |
| Endorsement | Sửa đổi hợp đồng |
| Rider | Quyền lợi bổ sung |
| Beneficiary | Người thụ hưởng |
| Insurer | Công ty bảo hiểm |
| Broker | Môi giới bảo hiểm |
| eKYC | Electronic Know Your Customer |

---

## 2. Mô tả tổng quan hệ thống

### 2.1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Admin Panel (React)  │  Partner Portal     │
└────────┬──────────┴──────────┬────────────┴──────────┬──────────┘
         │                     │                       │
┌────────┴─────────────────────┴───────────────────────┴──────────┐
│                        API GATEWAY                               │
│              (Authentication, Rate Limiting, Routing)             │
└────────┬─────────────────────┬───────────────────────┬──────────┘
         │                     │                       │
┌────────┴──────────┐ ┌───────┴────────┐ ┌────────────┴──────────┐
│  Auth Service     │ │ Product Service│ │  Policy Service       │
│  - Login/Register │ │ - Catalog      │ │  - CRUD Policy        │
│  - JWT tokens     │ │ - Pricing      │ │  - Renewal            │
│  - RBAC          │ │ - Comparison   │ │  - Cancellation       │
└───────────────────┘ └────────────────┘ └────────────────────────┘
┌───────────────────┐ ┌────────────────┐ ┌────────────────────────┐
│  Quote Service    │ │ Claims Service │ │  Payment Service      │
│  - Calculate      │ │ - Submit       │ │  - Process payment    │
│  - Compare        │ │ - Track        │ │  - Refund             │
│  - Save/Email     │ │ - Settle       │ │  - Reconciliation     │
└───────────────────┘ └────────────────┘ └────────────────────────┘
┌───────────────────┐ ┌────────────────┐ ┌────────────────────────┐
│ Notification Svc  │ │ Document Svc   │ │  Integration Service  │
│  - Email          │ │ - PDF Generate │ │  - Insurer APIs       │
│  - SMS            │ │ - Upload/Store │ │  - Payment APIs       │
│  - Push           │ │ - eKYC OCR    │ │  - eKYC APIs          │
└───────────────────┘ └────────────────┘ └────────────────────────┘
         │                     │                       │
┌────────┴─────────────────────┴───────────────────────┴──────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Primary)  │  Redis (Cache)  │  S3 (Documents)      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. System Context

**Actors**:
- Guest User: Browse products, get quotes
- Registered Customer: Purchase, manage policies, submit claims
- Admin: Manage system, process operations
- Partner (Insurer): Manage products, process claims
- External Systems: Payment gateways, eKYC providers, insurer APIs

### 2.3. Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | React 18 + TypeScript | Component-based, type-safe |
| State Management | Zustand | Lightweight, simple |
| UI Framework | TailwindCSS | Utility-first, fast development |
| Backend | Node.js + Express + TypeScript | Fast development, async I/O |
| ORM | TypeORM | TypeScript native, migrations |
| Database | PostgreSQL 15 | ACID, JSON support, scalable |
| Cache | Redis 7 | Fast caching, session store |
| Queue | Bull (Redis-based) | Background jobs, retries |
| File Storage | AWS S3 / MinIO | Scalable document storage |
| Email | SendGrid | Reliable, templates |
| SMS | Twilio / FPT SMS | Local coverage |
| Search | Elasticsearch | Full-text search, analytics |
| Monitoring | Prometheus + Grafana | Metrics, alerting |
| Logging | Winston + ELK | Centralized logging |
| CI/CD | GitHub Actions | Automation |
| Hosting | AWS (EC2, RDS, S3, CloudFront) | Reliable, scalable |

---

## 3. Yêu cầu chức năng (Functional Requirements)

### 3.1. Module: Authentication & Authorization (AUTH)

#### FR-AUTH-001: User Registration
- **Input**: Email/Phone, Password, Full name
- **Process**: Validate → Create account → Send verification
- **Output**: Account created, verification email/SMS sent
- **Rules**:
  - Password: min 8 chars, 1 uppercase, 1 number, 1 special
  - Email: unique, valid format
  - Phone: VN format (+84), unique

#### FR-AUTH-002: User Login
- **Input**: Email/Phone + Password
- **Process**: Validate → Generate JWT tokens
- **Output**: Access token (15min) + Refresh token (7 days)
- **Rules**:
  - Lock account after 5 failed attempts (30 min)
  - Support "Remember me" (30 days refresh token)

#### FR-AUTH-003: Social Login
- **Input**: Google/Facebook OAuth token
- **Process**: Verify OAuth → Create/Link account
- **Output**: JWT tokens
- **Providers**: Google, Facebook, Apple (future)

#### FR-AUTH-004: Password Reset
- **Input**: Email/Phone
- **Process**: Generate reset token → Send link/OTP
- **Output**: Password reset email/SMS
- **Rules**: Token valid 15 minutes, single use

#### FR-AUTH-005: Role-Based Access Control
- **Roles**: Super Admin, Admin, Operator, Customer, Partner
- **Permissions**: Resource-based (CRUD per entity)
- **Implementation**: JWT claims + middleware check

### 3.2. Module: Product Management (PROD)

#### FR-PROD-001: Product Listing
- **Input**: Category, filters (price range, insurer, features)
- **Process**: Query products → Apply filters → Sort
- **Output**: Paginated product list with key info
- **Pagination**: 12 items/page, cursor-based

#### FR-PROD-002: Product Detail
- **Input**: Product ID
- **Process**: Fetch product + related data
- **Output**: Full product info (benefits, exclusions, pricing table, T&C, reviews)
- **Includes**: Similar products, insurer info, FAQ

#### FR-PROD-003: Product Comparison
- **Input**: 2-4 Product IDs
- **Process**: Fetch products → Align features
- **Output**: Comparison table with highlight differences
- **Features compared**: Price, coverage, exclusions, waiting period, claim process

#### FR-PROD-004: Product Search
- **Input**: Search keyword + filters
- **Process**: Full-text search + faceted filtering
- **Output**: Relevant products ranked by relevance
- **Autocomplete**: Suggest as user types (debounce 300ms)

### 3.3. Module: Quotation (QUOTE)

#### FR-QUOTE-001: Generate Quote
- **Input**: Product type + customer info + coverage options
- **Process**: Calculate premium based on rating factors
- **Output**: Quote with breakdown (base premium, discounts, taxes, total)
- **Response time**: < 5 seconds

#### FR-QUOTE-002: Multi-Insurer Quote
- **Input**: Same as above
- **Process**: Request quotes from all available insurers in parallel
- **Output**: List of quotes sorted by price (default)
- **Timeout**: 10 seconds (show available results)

#### FR-QUOTE-003: Customize Quote
- **Input**: Base quote + adjustments (sum insured, deductible, riders)
- **Process**: Recalculate based on changes
- **Output**: Updated quote in real-time
- **UX**: Slider/dropdown for common adjustments

#### FR-QUOTE-004: Save Quote
- **Input**: Quote data + user reference
- **Process**: Persist quote with 30-day validity
- **Output**: Quote reference number
- **Retrieval**: By reference number or from dashboard

#### FR-QUOTE-005: Share Quote
- **Input**: Quote ID + channel (email/SMS/link)
- **Process**: Generate shareable content → Send
- **Output**: Quote sent/link generated
- **Link**: Public, read-only, expires with quote

### 3.4. Module: Purchase (PURCH)

#### FR-PURCH-001: Initiate Purchase
- **Input**: Quote ID or Product + Customer info
- **Process**: Validate eligibility → Create draft policy
- **Output**: Purchase session initiated
- **Session**: Valid 30 minutes

#### FR-PURCH-002: KYC Verification
- **Input**: CCCD/Passport image (front + back)
- **Process**: OCR extraction → Data validation → Face match
- **Output**: KYC result (pass/fail/manual review)
- **Provider**: Integration with eKYC service

#### FR-PURCH-003: Application Form
- **Input**: Personal details, insured person details, beneficiary
- **Process**: Validate all fields → Check business rules
- **Output**: Complete application ready for underwriting
- **Auto-fill**: From KYC data where possible

#### FR-PURCH-004: Underwriting Decision
- **Input**: Application data
- **Process**: Auto-underwriting rules engine
- **Output**: Accept / Refer / Decline + reason
- **Auto-approve rate target**: > 80% for simple products

#### FR-PURCH-005: Payment Processing
- **Input**: Payment method + amount
- **Process**: Create payment intent → Redirect to gateway → Confirm
- **Output**: Payment success/failure
- **Methods**: VNPay, Momo, ZaloPay, Bank transfer, Card
- **Timeout**: 15 minutes to complete payment

#### FR-PURCH-006: Policy Issuance
- **Input**: Confirmed payment + approved application
- **Process**: Generate policy number → Create policy document → Activate
- **Output**: Active policy + PDF document
- **Trigger**: Immediately after payment confirmation

### 3.5. Module: Policy Management (POLICY)

#### FR-POLICY-001: View Policies
- **Input**: Customer ID
- **Process**: Fetch all policies for customer
- **Output**: List with status (Active, Expired, Cancelled, Pending)
- **Sort**: By status (active first), then by expiry date

#### FR-POLICY-002: Policy Detail
- **Input**: Policy ID
- **Process**: Fetch policy + coverage + payment history
- **Output**: Complete policy information
- **Includes**: Document download, coverage summary, payment schedule

#### FR-POLICY-003: Policy Renewal
- **Input**: Policy ID + renewal options
- **Process**: Calculate renewal premium → Generate quote → Purchase flow
- **Output**: Renewed policy
- **Auto-renewal**: Opt-in, charge saved payment method

#### FR-POLICY-004: Policy Cancellation
- **Input**: Policy ID + reason
- **Process**: Calculate refund → Confirm → Cancel → Process refund
- **Output**: Cancelled policy + refund
- **Rules**: Pro-rata refund minus admin fee (except cooling-off period)

#### FR-POLICY-005: Policy Endorsement
- **Input**: Policy ID + changes (address, vehicle, beneficiary)
- **Process**: Validate changes → Calculate adjustment → Issue endorsement
- **Output**: Updated policy + endorsement document
- **Premium adjustment**: Additional premium or refund

### 3.6. Module: Claims (CLAIMS)

#### FR-CLAIMS-001: Submit Claim
- **Input**: Policy ID + event details + documents
- **Process**: Validate coverage → Create claim → Assign handler
- **Output**: Claim reference number + expected timeline
- **Documents**: Max 10 files, 10MB each

#### FR-CLAIMS-002: Track Claim
- **Input**: Claim ID
- **Process**: Fetch claim status + timeline
- **Output**: Current status + history + next steps
- **Statuses**: Submitted → Under Review → Additional Info Needed → Approved/Rejected → Paid

#### FR-CLAIMS-003: Update Claim
- **Input**: Claim ID + additional documents/information
- **Process**: Attach to claim → Notify handler
- **Output**: Updated claim
- **Rules**: Cannot update after final decision (except appeal)

#### FR-CLAIMS-004: Claim Settlement
- **Input**: Claim ID + approved amount
- **Process**: Confirm bank details → Process payment → Update status
- **Output**: Settlement payment
- **Timeline**: Within 48 hours of approval

### 3.7. Module: Payment (PAY)

#### FR-PAY-001: Process Payment
- **Input**: Order/Policy ID + amount + method
- **Process**: Create transaction → Redirect/Process → Confirm
- **Output**: Payment confirmation + receipt
- **Idempotency**: Prevent double charge

#### FR-PAY-002: Process Refund
- **Input**: Policy/Payment ID + refund amount + reason
- **Process**: Calculate refund → Process via original method → Confirm
- **Output**: Refund confirmation
- **Timeline**: 5-7 business days

#### FR-PAY-003: Payment History
- **Input**: Customer ID + date range
- **Process**: Fetch transactions
- **Output**: Paginated transaction list
- **Includes**: Download receipt PDF

#### FR-PAY-004: Recurring Payment
- **Input**: Policy ID + schedule + payment method
- **Process**: Charge on schedule → Notify → Handle failures
- **Output**: Successful recurring payment
- **Retry**: 3 attempts over 7 days before lapse

### 3.8. Module: Notifications (NOTIF)

#### FR-NOTIF-001: Send Notification
- **Input**: User ID + template + channel + data
- **Process**: Render template → Send via channel → Log
- **Output**: Notification delivered
- **Channels**: Email, SMS, In-app, Push (future)

#### FR-NOTIF-002: Notification Preferences
- **Input**: User ID + preferences per category
- **Process**: Save preferences → Apply to future notifications
- **Output**: Updated preferences
- **Categories**: Transactional (mandatory), Marketing (opt-out), Reminders

#### FR-NOTIF-003: Notification Center
- **Input**: User ID
- **Process**: Fetch notifications → Mark read status
- **Output**: Notification list (unread count, paginated history)
- **Retention**: 90 days

---

## 4. Yêu cầu phi chức năng (Non-functional Requirements)

### 4.1. Performance (NFR-PERF)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-001 | Page load time (first contentful paint) | < 1.5 seconds |
| NFR-PERF-002 | API response time (95th percentile) | < 500ms |
| NFR-PERF-003 | Quote generation time | < 5 seconds |
| NFR-PERF-004 | Search results time | < 1 second |
| NFR-PERF-005 | File upload processing | < 10 seconds (10MB) |
| NFR-PERF-006 | PDF generation | < 3 seconds |
| NFR-PERF-007 | Database query time | < 100ms (95th percentile) |

### 4.2. Scalability (NFR-SCALE)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-001 | Concurrent users | 10,000 |
| NFR-SCALE-002 | Daily transactions | 100,000 |
| NFR-SCALE-003 | Data storage growth | 100GB/year |
| NFR-SCALE-004 | Horizontal scaling | Auto-scale 2x-10x |
| NFR-SCALE-005 | API rate limiting | 100 req/min per user |

### 4.3. Security (NFR-SEC)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SEC-001 | Data encryption at rest | AES-256 |
| NFR-SEC-002 | Data encryption in transit | TLS 1.3 |
| NFR-SEC-003 | Password hashing | bcrypt (12 rounds) |
| NFR-SEC-004 | Session management | JWT + HttpOnly cookies |
| NFR-SEC-005 | OWASP Top 10 compliance | Full compliance |
| NFR-SEC-006 | Penetration testing | Quarterly |
| NFR-SEC-007 | PII data masking | In logs and non-prod |
| NFR-SEC-008 | Audit trail | All write operations |
| NFR-SEC-009 | 2FA support | Optional for customers, mandatory for admin |

### 4.4. Availability (NFR-AVAIL)
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVAIL-001 | System uptime | 99.9% (8.76h downtime/year) |
| NFR-AVAIL-002 | Planned maintenance window | Sunday 2-4 AM |
| NFR-AVAIL-003 | Recovery Time Objective (RTO) | < 1 hour |
| NFR-AVAIL-004 | Recovery Point Objective (RPO) | < 5 minutes |
| NFR-AVAIL-005 | Backup frequency | Every 6 hours |
| NFR-AVAIL-006 | Multi-AZ deployment | Active-passive |

### 4.5. Compliance (NFR-COMP)
| ID | Requirement | Standard |
|----|-------------|----------|
| NFR-COMP-001 | Personal data protection | Vietnam PDPA |
| NFR-COMP-002 | Payment card security | PCI-DSS Level 3 |
| NFR-COMP-003 | Insurance regulations | Luật KDBH 2022 |
| NFR-COMP-004 | Anti-money laundering | AML/KYC regulations |
| NFR-COMP-005 | Accessibility | WCAG 2.1 Level AA |
| NFR-COMP-006 | Data residency | Vietnam servers |

---

## 5. Interface Requirements

### 5.1. External Interfaces

#### 5.1.1. Insurer APIs
- Protocol: REST/SOAP (varies by insurer)
- Authentication: API Key + HMAC signature
- Operations: Get Quote, Issue Policy, Submit Claim, Check Status
- SLA: 99.5% availability, < 3s response time

#### 5.1.2. Payment Gateways
- VNPay: REST API, redirect flow
- Momo: REST API, QR code + redirect
- ZaloPay: REST API, redirect flow
- Bank Transfer: Virtual account number

#### 5.1.3. eKYC Provider
- Protocol: REST API
- Operations: OCR extraction, face matching, liveness check
- Response: Structured data + confidence score

#### 5.1.4. Email Service (SendGrid)
- Protocol: REST API
- Operations: Send transactional email, manage templates
- Volume: Up to 100K emails/month

#### 5.1.5. SMS Service
- Protocol: REST API
- Operations: Send OTP, notifications
- Volume: Up to 50K SMS/month

### 5.2. User Interfaces

#### 5.2.1. Customer Web App
- Responsive design (mobile-first)
- Breakpoints: 320px, 768px, 1024px, 1440px
- Design system: Custom (based on TailwindCSS)
- Accessibility: Keyboard navigation, screen reader support
- Languages: Vietnamese (default), English

#### 5.2.2. Admin Panel
- Desktop-optimized (min 1024px)
- Data-dense layouts
- Real-time updates (WebSocket)
- Export capabilities (CSV, PDF)

---

## 6. Data Requirements

### 6.1. Core Entities

```
Customer
├── id (UUID)
├── email (unique)
├── phone (unique)
├── full_name
├── date_of_birth
├── gender
├── id_number (CCCD)
├── address
├── kyc_status
├── created_at
└── updated_at

Product
├── id (UUID)
├── name
├── category
├── insurer_id
├── description
├── benefits (JSON)
├── exclusions (JSON)
├── pricing_rules (JSON)
├── terms_conditions
├── status (active/inactive)
├── min_age / max_age
└── created_at

Policy
├── id (UUID)
├── policy_number (unique)
├── customer_id (FK)
├── product_id (FK)
├── insurer_id (FK)
├── status (active/expired/cancelled/pending)
├── start_date
├── end_date
├── premium_amount
├── sum_insured
├── coverage_details (JSON)
├── beneficiaries (JSON)
├── payment_frequency
└── created_at

Claim
├── id (UUID)
├── claim_number (unique)
├── policy_id (FK)
├── customer_id (FK)
├── type
├── event_date
├── description
├── claimed_amount
├── approved_amount
├── status
├── documents (JSON)
├── handler_id
├── submitted_at
├── resolved_at
└── created_at

Quote
├── id (UUID)
├── customer_id (FK, nullable)
├── product_id (FK)
├── insurer_id (FK)
├── input_data (JSON)
├── premium_amount
├── coverage_details (JSON)
├── valid_until
├── status (active/expired/converted)
└── created_at

Payment
├── id (UUID)
├── policy_id (FK)
├── customer_id (FK)
├── amount
├── method
├── gateway_reference
├── status (pending/success/failed/refunded)
├── paid_at
└── created_at
```

### 6.2. Data Retention
| Data Type | Retention Period | After Expiry |
|-----------|----------------|--------------|
| Customer PII | Account lifetime + 5 years | Anonymize |
| Policy data | 10 years after expiry | Archive |
| Claims data | 10 years after settlement | Archive |
| Payment data | 7 years | Archive |
| Quotes | 90 days | Delete |
| Session data | 30 days | Delete |
| Audit logs | 5 years | Archive |
| Analytics data | 3 years | Aggregate |
