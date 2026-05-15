# Low-Level Design (LLD)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Module: Authentication & Authorization

### 1.1. Class Design

```
┌─────────────────────────────────────────────────────┐
│                  Auth Module                          │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Controller Layer:                                    │
│  ┌─────────────────────┐                             │
│  │  AuthController      │                             │
│  │  ─────────────────   │                             │
│  │  + register()        │                             │
│  │  + login()           │                             │
│  │  + logout()          │                             │
│  │  + refreshToken()    │                             │
│  │  + forgotPassword()  │                             │
│  │  + resetPassword()   │                             │
│  │  + verifyOTP()       │                             │
│  └──────────┬──────────┘                             │
│             │                                         │
│  Service Layer:                                       │
│  ┌──────────┴──────────┐  ┌────────────────────┐    │
│  │  AuthService         │  │  TokenService       │    │
│  │  ─────────────────   │  │  ─────────────────  │    │
│  │  + register()        │  │  + generateAccess() │    │
│  │  + login()           │  │  + generateRefresh()│    │
│  │  + verifyEmail()     │  │  + verify()         │    │
│  │  + verifyOTP()       │  │  + revoke()         │    │
│  │  + resetPassword()   │  │  + decode()         │    │
│  └──────────┬──────────┘  └────────────────────┘    │
│             │                                         │
│  Repository Layer:                                    │
│  ┌──────────┴──────────┐  ┌────────────────────┐    │
│  │  UserRepository      │  │  SessionRepository  │    │
│  │  ─────────────────   │  │  ─────────────────  │    │
│  │  + findByEmail()     │  │  + create()         │    │
│  │  + findByPhone()     │  │  + findByToken()    │    │
│  │  + create()          │  │  + revoke()         │    │
│  │  + update()          │  │  + revokeAll()      │    │
│  │  + findById()        │  └────────────────────┘    │
│  └─────────────────────┘                             │
└─────────────────────────────────────────────────────┘
```

### 1.2. Entity Design

```typescript
// User Entity
interface User {
  id: string;                  // UUID
  email: string;               // Unique
  phone: string;               // Unique, VN format
  passwordHash: string;        // bcrypt hashed
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  idNumber: string;            // CCCD/CMND
  address: Address;            // Embedded
  kycStatus: KYCStatus;        // pending | verified | rejected
  status: UserStatus;          // active | inactive | locked | deleted
  role: Role;                  // customer | admin | partner
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: Date;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Session Entity
interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: string;
  ipAddress: string;
  expiresAt: Date;
  createdAt: Date;
}
```

### 1.3. Authentication Flow (Detailed)

```
Registration:
1. Validate input (Joi schema)
2. Check email/phone uniqueness
3. Hash password (bcrypt, 12 rounds)
4. Create user (status: inactive)
5. Generate OTP (6 digits, expire 5min)
6. Store OTP in Redis (key: otp:{email}, TTL: 300s)
7. Send OTP via email + SMS (async, queue)
8. Return success (user_id, message)

Login:
1. Validate input
2. Find user by email/phone
3. Check account status (not locked, not inactive)
4. Verify password (bcrypt.compare)
5. If failed: increment failedLoginAttempts
   - If attempts >= 5: lock account 30 min
6. If success: reset failedLoginAttempts
7. Generate access token (JWT, 15min, RS256)
8. Generate refresh token (JWT, 7d)
9. Create session record
10. Set refresh token in HttpOnly cookie
11. Return access token + user info
```

---

## 2. Module: Product Catalog

### 2.1. Class Design

```
┌─────────────────────────────────┐
│      ProductController           │
│  + list(filters, pagination)     │
│  + getById(id)                   │
│  + compare(ids[])                │
│  + search(query)                 │
└───────────────┬─────────────────┘
                │
┌───────────────┴─────────────────┐
│        ProductService            │
│  + getProducts(filters)          │
│  + getProductDetail(id)          │
│  + compareProducts(ids)          │
│  + searchProducts(query)         │
│  + getProductsByCategory(catId)  │
│  + getFeaturedProducts()         │
└───────────────┬─────────────────┘
                │
       ┌────────┴────────┐
       │                  │
┌──────┴──────┐  ┌───────┴────────┐
│ProductRepo   │  │SearchService   │
│+ findAll()   │  │(Elasticsearch) │
│+ findById()  │  │+ index()       │
│+ findByCat() │  │+ search()      │
└─────────────┘  │+ suggest()     │
                  └────────────────┘
```

### 2.2. Product Entity

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  insurerId: string;
  description: string;
  shortDescription: string;
  benefits: Benefit[];
  exclusions: Exclusion[];
  pricingRules: PricingRule;
  eligibility: EligibilityRule;
  termsConditionsUrl: string;
  brochureUrl: string;
  minAge: number;
  maxAge: number;
  minPremium: number;
  maxPremium: number;
  rating: number;
  reviewCount: number;
  status: 'draft' | 'active' | 'suspended' | 'archived';
  sortOrder: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface Benefit {
  name: string;
  description: string;
  coverageAmount: number;
  unit: string;
  conditions: string;
}

interface PricingRule {
  baseRate: number;
  ratingFactors: RatingFactor[];
  discounts: Discount[];
  loadings: Loading[];
}

interface RatingFactor {
  factorName: string;    // age, gender, occupation, bmi
  factorType: 'multiplier' | 'fixed';
  ranges: { min: number; max: number; value: number }[];
}
```

---

## 3. Module: Quotation

### 3.1. Quote Engine Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    QUOTE ENGINE                           │
│                                                           │
│  ┌─────────────────┐                                    │
│  │ QuoteController  │                                    │
│  │ POST /quotes     │                                    │
│  └────────┬────────┘                                    │
│           │                                              │
│  ┌────────┴────────┐                                    │
│  │  QuoteService    │                                    │
│  │  + generateQuote()                                   │
│  │  + multiInsurerQuote()                               │
│  │  + customizeQuote()                                  │
│  └────────┬────────┘                                    │
│           │                                              │
│  ┌────────┴──────────────────────────────────────────┐  │
│  │           PricingEngine                            │  │
│  │  + calculateBasePremium(product, customerInfo)     │  │
│  │  + applyRatingFactors(base, factors)              │  │
│  │  + applyDiscounts(premium, discounts)             │  │
│  │  + applyLoadings(premium, loadings)               │  │
│  │  + calculateTax(premium)                          │  │
│  │  + calculateTotal(components)                     │  │
│  └───────────────────────────────────────────────────┘  │
│           │                                              │
│  ┌────────┴──────────────────────────────────────────┐  │
│  │     InsurerQuoteAggregator                        │  │
│  │  + fetchQuotesParallel(insurerIds, request)       │  │
│  │  + normalizeResponse(insurerResponse)             │  │
│  │  + rankQuotes(quotes, criteria)                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2. Pricing Calculation Algorithm

```
calculatePremium(product, customerInfo, coverageOptions):
  1. basePremium = product.pricingRules.baseRate * coverageOptions.sumInsured

  2. FOR EACH factor IN product.pricingRules.ratingFactors:
     multiplier = getMultiplier(factor, customerInfo[factor.name])
     basePremium = basePremium * multiplier

  3. FOR EACH loading IN product.pricingRules.loadings:
     IF loading.condition.matches(customerInfo):
       basePremium = basePremium * (1 + loading.percentage)

  4. FOR EACH discount IN product.pricingRules.discounts:
     IF discount.condition.matches(customerInfo):
       basePremium = basePremium * (1 - discount.percentage)

  5. tax = basePremium * TAX_RATE (varies by product type)
  6. totalPremium = basePremium + tax

  7. RETURN {
       basePremium,
       ratingFactorDetails,
       loadings,
       discounts,
       tax,
       totalPremium,
       monthlyPremium: totalPremium / 12
     }
```

---

## 4. Module: Policy Management

### 4.1. Policy State Machine

```
                  create()
    ────────────────────────▶ PENDING_PAYMENT
                                    │
                     pay()          │ expire() (30min)
                     ┌──────────────┤
                     │              ▼
                     │        PAYMENT_EXPIRED
                     ▼
              PENDING_ACTIVATION
                     │
          activate() │
                     ▼
                  ACTIVE ◀──────── renew()
                     │                │
         ┌───────────┼───────────┐    │
         │           │           │    │
    cancel()    lapse()     expire()  │
         │           │           │    │
         ▼           ▼           ▼    │
    CANCELLED     LAPSED      EXPIRED─┘
```

### 4.2. Policy Service Methods

```typescript
class PolicyService {
  // Create policy from quote
  async createPolicy(quoteId: string, applicationData: ApplicationDTO): Promise<Policy>

  // Activate policy after payment confirmed
  async activatePolicy(policyId: string, paymentId: string): Promise<Policy>

  // Cancel policy (with refund calculation)
  async cancelPolicy(policyId: string, reason: string): Promise<CancellationResult>

  // Renew policy
  async renewPolicy(policyId: string, renewalOptions: RenewalDTO): Promise<Policy>

  // Endorse policy (modify coverage)
  async endorsePolicy(policyId: string, changes: EndorsementDTO): Promise<Policy>

  // Check and process expiring policies (scheduled job)
  async processExpiringPolicies(): Promise<void>

  // Check and lapse overdue policies (scheduled job)
  async processOverduePolicies(): Promise<void>
}
```

---

## 5. Module: Claims Processing

### 5.1. Claims State Machine

```
SUBMITTED
    │ (auto-assign, < 4h)
    ▼
ASSIGNED
    │ (handler reviews documents)
    ▼
DOCUMENTS_REVIEW ──────── ADDITIONAL_INFO_REQUIRED
    │                            │
    │ (documents OK)             │ (customer provides)
    │                            │
    │◀───────────────────────────┘
    │
    ▼
UNDER_ASSESSMENT
    │ (handler assesses claim)
    ▼
DECISION_MADE
    ├── APPROVED ──▶ PAYMENT_PROCESSING ──▶ SETTLED ──▶ CLOSED
    ├── PARTIALLY_APPROVED ──▶ CUSTOMER_ACCEPTANCE ──▶ SETTLED/APPEAL
    └── REJECTED ──▶ CLOSED / APPEAL
                          │
                          ▼
                    UNDER_APPEAL ──▶ (re-assess)
```

### 5.2. Claims Service

```typescript
class ClaimsService {
  async submitClaim(policyId: string, claimData: ClaimDTO, documents: File[]): Promise<Claim>
  async assignHandler(claimId: string): Promise<void>
  async requestAdditionalInfo(claimId: string, request: InfoRequestDTO): Promise<void>
  async assessClaim(claimId: string, assessment: AssessmentDTO): Promise<void>
  async approveClaim(claimId: string, amount: number, notes: string): Promise<void>
  async rejectClaim(claimId: string, reason: string): Promise<void>
  async settleClaim(claimId: string, bankDetails: BankAccountDTO): Promise<void>
  async appealClaim(claimId: string, appealData: AppealDTO): Promise<void>
}
```

---

## 6. Module: Payment Processing

### 6.1. Payment Flow (Detailed)

```
┌────────────┐        ┌────────────┐        ┌────────────┐
│   Client   │        │  Payment   │        │  Gateway   │
│            │        │  Service   │        │(VNPay/Momo)│
└─────┬──────┘        └─────┬──────┘        └─────┬──────┘
      │                     │                      │
      │ POST /payments      │                      │
      │ {policyId, method}  │                      │
      │────────────────────▶│                      │
      │                     │ Create transaction   │
      │                     │ (status: PENDING)    │
      │                     │                      │
      │                     │ Create payment URL   │
      │                     │─────────────────────▶│
      │                     │                      │
      │                     │ Payment URL          │
      │   Redirect URL      │◀─────────────────────│
      │◀────────────────────│                      │
      │                     │                      │
      │ User completes      │                      │
      │ payment on gateway  │                      │
      │─────────────────────┼─────────────────────▶│
      │                     │                      │
      │                     │  Webhook callback    │
      │                     │◀─────────────────────│
      │                     │                      │
      │                     │ Verify signature     │
      │                     │ Update transaction   │
      │                     │ (status: SUCCESS)    │
      │                     │                      │
      │                     │ Emit PaymentConfirmed│
      │                     │ event                │
      │   Redirect to       │                      │
      │   success page      │                      │
      │◀────────────────────│                      │
```

### 6.2. Payment Gateway Adapter Interface

```typescript
interface PaymentGatewayAdapter {
  createPaymentUrl(request: PaymentRequest): Promise<PaymentUrlResponse>;
  verifyCallback(callbackData: any): Promise<PaymentVerification>;
  queryTransaction(transactionId: string): Promise<TransactionStatus>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// Concrete implementations
class VNPayAdapter implements PaymentGatewayAdapter { ... }
class MomoAdapter implements PaymentGatewayAdapter { ... }
class ZaloPayAdapter implements PaymentGatewayAdapter { ... }
```

---

## 7. Module: Notification Service

### 7.1. Notification Architecture

```
Event Source (any service)
         │
         │ emit event
         ▼
┌────────────────────┐
│    Event Bus       │
│   (Redis Pub/Sub)  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ NotificationService│
│ + processEvent()   │
│ + resolveTemplate()│
│ + resolveChannels()│
│ + dispatch()       │
└────────┬───────────┘
         │
    ┌────┼────────┐
    ▼    ▼        ▼
┌──────┐┌──────┐┌──────┐
│Email ││ SMS  ││In-App│
│Queue ││Queue ││Queue │
└──┬───┘└──┬───┘└──┬───┘
   ▼       ▼       ▼
SendGrid  FPT    WebSocket
```

### 7.2. Notification Templates

| Event | Email | SMS | In-App |
|-------|-------|-----|--------|
| Registration | Welcome email | OTP | - |
| Login (new device) | Security alert | - | Alert |
| Quote Generated | Quote summary | - | - |
| Payment Success | Receipt + Policy | Confirmation | Notification |
| Policy Activated | Policy document | Confirmation | Notification |
| Policy Expiring | Renewal reminder | Reminder | Alert |
| Claim Submitted | Acknowledgment | - | Notification |
| Claim Status Update | Status update | Brief update | Notification |
| Claim Settled | Settlement confirmation | - | Notification |

---

## 8. Database Schema (Key Tables)

### 8.1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  id_number VARCHAR(20),
  address JSONB,
  kyc_status VARCHAR(20) DEFAULT 'pending',
  status VARCHAR(20) DEFAULT 'active',
  role VARCHAR(20) DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
```

### 8.2. Policies Table

```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  insurer_id UUID NOT NULL REFERENCES insurers(id),
  quote_id UUID REFERENCES quotes(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  premium_amount DECIMAL(15,2) NOT NULL,
  sum_insured DECIMAL(15,2) NOT NULL,
  coverage_details JSONB NOT NULL,
  beneficiaries JSONB,
  payment_frequency VARCHAR(20) DEFAULT 'annual',
  auto_renewal BOOLEAN DEFAULT FALSE,
  insurer_policy_ref VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policies_customer ON policies(customer_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_end_date ON policies(end_date);
CREATE INDEX idx_policies_number ON policies(policy_number);
```

### 8.3. Claims Table

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(20) UNIQUE NOT NULL,
  policy_id UUID NOT NULL REFERENCES policies(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  claim_type VARCHAR(30) NOT NULL,
  event_date DATE NOT NULL,
  description TEXT NOT NULL,
  claimed_amount DECIMAL(15,2) NOT NULL,
  approved_amount DECIMAL(15,2),
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  priority VARCHAR(10) DEFAULT 'medium',
  handler_id UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  decision_reason TEXT,
  documents JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claims_policy ON claims(policy_id);
CREATE INDEX idx_claims_customer ON claims(customer_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_handler ON claims(handler_id);
```

### 8.4. Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(30) UNIQUE NOT NULL,
  policy_id UUID REFERENCES policies(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  payment_type VARCHAR(20) NOT NULL,
  method VARCHAR(20) NOT NULL,
  gateway VARCHAR(20) NOT NULL,
  gateway_reference VARCHAR(100),
  gateway_response JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_policy ON payments(policy_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_ref ON payments(gateway_reference);
```

---

## 9. API Endpoint Details

### 9.1. Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/auth/register | Đăng ký tài khoản | No |
| POST | /api/v1/auth/login | Đăng nhập | No |
| POST | /api/v1/auth/logout | Đăng xuất | Yes |
| POST | /api/v1/auth/refresh | Refresh token | Cookie |
| POST | /api/v1/auth/verify-otp | Xác minh OTP | No |
| POST | /api/v1/auth/forgot-password | Quên mật khẩu | No |
| POST | /api/v1/auth/reset-password | Đặt lại mật khẩu | Token |
| GET | /api/v1/auth/me | Thông tin user hiện tại | Yes |

### 9.2. Product Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/products | Danh sách sản phẩm | No |
| GET | /api/v1/products/:id | Chi tiết sản phẩm | No |
| GET | /api/v1/products/compare | So sánh sản phẩm | No |
| GET | /api/v1/products/search | Tìm kiếm | No |
| GET | /api/v1/categories | Danh mục | No |

### 9.3. Quote Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/quotes | Tạo báo giá | Optional |
| GET | /api/v1/quotes/:id | Xem báo giá | Optional |
| POST | /api/v1/quotes/:id/customize | Tùy chỉnh | Optional |
| POST | /api/v1/quotes/:id/share | Chia sẻ | Optional |
| GET | /api/v1/quotes/my | Báo giá của tôi | Yes |

### 9.4. Policy Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/policies | Tạo hợp đồng (mua) | Yes |
| GET | /api/v1/policies | Danh sách HĐ | Yes |
| GET | /api/v1/policies/:id | Chi tiết HĐ | Yes |
| POST | /api/v1/policies/:id/renew | Gia hạn | Yes |
| POST | /api/v1/policies/:id/cancel | Hủy | Yes |
| PATCH | /api/v1/policies/:id | Endorsement | Yes |

### 9.5. Claims Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/claims | Nộp yêu cầu BT | Yes |
| GET | /api/v1/claims | Danh sách claims | Yes |
| GET | /api/v1/claims/:id | Chi tiết claim | Yes |
| POST | /api/v1/claims/:id/documents | Upload tài liệu | Yes |
| POST | /api/v1/claims/:id/appeal | Khiếu nại | Yes |

### 9.6. Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/payments | Tạo thanh toán | Yes |
| GET | /api/v1/payments/:id | Trạng thái | Yes |
| POST | /api/v1/payments/callback/:gateway | Webhook | No (verify sig) |
| GET | /api/v1/payments/history | Lịch sử | Yes |

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 403 | Account locked |
| AUTH_004 | 403 | Insufficient permissions |
| AUTH_005 | 409 | Email already exists |
| AUTH_006 | 409 | Phone already exists |
| PROD_001 | 404 | Product not found |
| PROD_002 | 400 | Invalid category |
| QUOTE_001 | 422 | Ineligible for product |
| QUOTE_002 | 408 | Insurer timeout |
| QUOTE_003 | 410 | Quote expired |
| POLICY_001 | 404 | Policy not found |
| POLICY_002 | 422 | Cannot cancel (active claims) |
| POLICY_003 | 422 | Policy already expired |
| CLAIM_001 | 404 | Claim not found |
| CLAIM_002 | 422 | Policy not active |
| CLAIM_003 | 422 | Duplicate claim |
| PAY_001 | 402 | Payment failed |
| PAY_002 | 408 | Payment timeout |
| PAY_003 | 409 | Duplicate payment |
| GENERAL_001 | 400 | Validation error |
| GENERAL_002 | 500 | Internal server error |
| GENERAL_003 | 503 | Service unavailable |
