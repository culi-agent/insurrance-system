# Component Diagram - Sơ Đồ Thành Phần

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Notation | UML Component Diagram (text-based) |

---

## 1. System-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSURANCE SYSTEM PLATFORM                             │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      PRESENTATION LAYER                                  ││
│  │                                                                          ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           ││
│  │  │  <<component>> │  │  <<component>> │  │  <<component>> │           ││
│  │  │  Customer SPA  │  │  Admin Panel   │  │ Partner Portal │           ││
│  │  │                │  │                │  │                │           ││
│  │  │ React 18       │  │ React 18       │  │ React 18       │           ││
│  │  │ TypeScript     │  │ TypeScript     │  │ TypeScript     │           ││
│  │  │ TailwindCSS    │  │ TailwindCSS    │  │ TailwindCSS    │           ││
│  │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘           ││
│  └──────────┼────────────────────┼────────────────────┼─────────────────────┘│
│             │  HTTPS/JSON        │  HTTPS/JSON        │  HTTPS/JSON          │
│             ▼                    ▼                    ▼                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      GATEWAY LAYER                                       ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐  ││
│  │  │  <<component>>  API Gateway                                       │  ││
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  ││
│  │  │  │  Auth    │ │  Rate    │ │ Router   │ │ Logger   │           │  ││
│  │  │  │ Middleware│ │ Limiter  │ │          │ │          │           │  ││
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│  ┌──────────────────────────────────┼──────────────────────────────────────┐│
│  │                      BUSINESS LAYER                                      ││
│  │                                  │                                        ││
│  │  ┌───────────┐  ┌───────────┐  ┌┴──────────┐  ┌───────────┐           ││
│  │  │<<component>>│ │<<component>>│ │<<component>>│ │<<component>>│          ││
│  │  │   Auth    │  │  Product  │  │   Quote   │  │  Policy   │           ││
│  │  │  Service  │  │  Service  │  │  Service  │  │  Service  │           ││
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘           ││
│  │                                                                          ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐           ││
│  │  │<<component>>│ │<<component>>│ │<<component>>│ │<<component>>│          ││
│  │  │  Claims   │  │  Payment  │  │   Notif   │  │ Document  │           ││
│  │  │  Service  │  │  Service  │  │  Service  │  │  Service  │           ││
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘           ││
│  │                                                                          ││
│  │  ┌──────────────────────────────────────────────────────────────────┐  ││
│  │  │  <<component>>  Integration Service (Adapter Layer)               │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      DATA LAYER                                          ││
│  │                                                                          ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       ││
│  │  │<<component>>│ │<<component>>│ │<<component>>│ │<<component>>│       ││
│  │  │ PostgreSQL │  │   Redis    │  │   AWS S3   │  │Elasticsearch│       ││
│  │  │ Database   │  │Cache/Queue │  │  Storage   │  │   Search   │       ││
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Service Components (Chi tiết)

### 2.1. Auth Service Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <<component>> Auth Service                                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Controllers                                                  ││
│  │  ┌──────────────────┐  ┌──────────────────┐                 ││
│  │  │ AuthController    │  │ UserController    │                 ││
│  │  │ • POST /login     │  │ • GET /me         │                 ││
│  │  │ • POST /register  │  │ • PATCH /profile  │                 ││
│  │  │ • POST /logout    │  │ • PUT /password   │                 ││
│  │  │ • POST /refresh   │  │ • GET /sessions   │                 ││
│  │  └────────┬─────────┘  └────────┬─────────┘                 ││
│  └───────────┼──────────────────────┼───────────────────────────┘│
│              │                      │                             │
│  ┌───────────┼──────────────────────┼───────────────────────────┐│
│  │  Services │                      │                            ││
│  │  ┌────────┴─────────┐  ┌────────┴─────────┐                 ││
│  │  │  AuthService      │  │  TokenService     │                 ││
│  │  │  • register()     │  │  • generate()     │                 ││
│  │  │  • login()        │  │  • verify()       │                 ││
│  │  │  • verifyOTP()    │  │  • refresh()      │                 ││
│  │  │  • resetPassword()│  │  • revoke()       │                 ││
│  │  └────────┬─────────┘  └────────┬─────────┘                 ││
│  │           │                      │                            ││
│  │  ┌────────┴─────────┐  ┌────────┴─────────┐                 ││
│  │  │  OTPService       │  │ PasswordService   │                 ││
│  │  │  • generate()     │  │ • hash()          │                 ││
│  │  │  • verify()       │  │ • compare()       │                 ││
│  │  │  • invalidate()   │  │ • validate()      │                 ││
│  │  └──────────────────┘  └──────────────────┘                 ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Repositories                                                 ││
│  │  ┌──────────────────┐  ┌──────────────────┐                 ││
│  │  │ UserRepository    │  │ SessionRepository │                 ││
│  │  └──────────────────┘  └──────────────────┘                 ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  Dependencies: PostgreSQL, Redis (sessions + OTP)                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Quote Service Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <<component>> Quote Service                                     │
│                                                                   │
│  ┌──────────────────┐                                           │
│  │ QuoteController   │                                           │
│  │ • POST /quotes    │                                           │
│  │ • GET /quotes/:id │                                           │
│  │ • POST /customize │                                           │
│  └────────┬─────────┘                                           │
│           │                                                       │
│  ┌────────┴──────────────────────────────────────────────────┐  │
│  │ QuoteService                                               │  │
│  │ • generateQuote()                                          │  │
│  │ • getMultiInsurerQuotes()                                  │  │
│  │ • customizeQuote()                                         │  │
│  │ • saveQuote()                                              │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                       │
│     ┌─────┴─────────────────────────────────────────────┐       │
│     │                                                     │       │
│  ┌──┴───────────────┐  ┌──────────────────────────────┐ │       │
│  │  PricingEngine    │  │  InsurerQuoteAggregator      │ │       │
│  │                   │  │                              │ │       │
│  │ • calcBase()      │  │ • fetchParallel()            │ │       │
│  │ • applyFactors()  │  │ • normalize()               │ │       │
│  │ • applyDiscounts()│  │ • rank()                    │ │       │
│  │ • applyLoadings() │  │ • timeout handling          │ │       │
│  │ • calcTotal()     │  │                              │ │       │
│  └───────────────────┘  └──────────────┬───────────────┘ │       │
│                                         │                 │       │
│                          ┌──────────────┴──────────────┐  │       │
│                          │  Insurer Adapters            │  │       │
│                          │  ┌────────┐ ┌────────┐      │  │       │
│                          │  │Adapter │ │Adapter │ ...  │  │       │
│                          │  │  A     │ │  B     │      │  │       │
│                          │  └────────┘ └────────┘      │  │       │
│                          └─────────────────────────────┘  │       │
│                                                           │       │
│  Dependencies: PostgreSQL, Redis (cache), Insurer APIs   │       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3. Payment Service Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <<component>> Payment Service                                   │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │PaymentController  │  │ WebhookController │                    │
│  │• POST /payments   │  │• POST /callback/  │                    │
│  │• GET /status      │  │  vnpay            │                    │
│  │• GET /history     │  │• POST /callback/  │                    │
│  └────────┬─────────┘  │  momo             │                    │
│           │             └────────┬─────────┘                    │
│           │                      │                               │
│  ┌────────┴──────────────────────┴─────────────────────────┐   │
│  │ PaymentService                                           │   │
│  │ • initiatePayment()    • verifyWebhook()                 │   │
│  │ • processRefund()      • queryStatus()                   │   │
│  │ • getHistory()         • handleTimeout()                 │   │
│  └────────┬────────────────────────────────────────────────┘   │
│           │                                                      │
│  ┌────────┴────────────────────────────────────────────────┐   │
│  │ Payment Gateway Adapters                                 │   │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │ │  VNPay   │  │   Momo   │  │ ZaloPay  │              │   │
│  │ │ Adapter  │  │ Adapter  │  │ Adapter  │              │   │
│  │ └──────────┘  └──────────┘  └──────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ReconciliationService                                    │   │
│  │ • dailyReconcile()  • monthlySettle()  • reportGen()    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Dependencies: PostgreSQL, Redis, Payment Gateway APIs           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Component Architecture

### 3.1. Customer SPA Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <<component>> Customer SPA                                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  App Shell                                                    ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  ││
│  │  │  Header  │  │ Navigation│  │  Footer  │                  ││
│  │  └──────────┘  └──────────┘  └──────────┘                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Feature Modules                                              ││
│  │                                                               ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │  │ Auth Module  │  │Product Module│  │ Quote Module │      ││
│  │  │ • Login      │  │ • Catalog    │  │ • Form       │      ││
│  │  │ • Register   │  │ • Detail     │  │ • Compare    │      ││
│  │  │ • Forgot PW  │  │ • Compare    │  │ • Result     │      ││
│  │  │ • Profile    │  │ • Search     │  │ • Customize  │      ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│  │                                                               ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │  │Purchase Mod. │  │ Policy Mod.  │  │ Claims Mod.  │      ││
│  │  │ • Wizard     │  │ • Dashboard  │  │ • Submit     │      ││
│  │  │ • KYC        │  │ • Detail     │  │ • Track      │      ││
│  │  │ • Payment    │  │ • Renew      │  │ • Upload     │      ││
│  │  │ • Confirm    │  │ • Cancel     │  │ • History    │      ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Shared Layer                                                 ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │   UI     │  │  Hooks   │  │  Utils   │  │  Store   │   ││
│  │  │Components│  │ (Custom) │  │          │  │ (Zustand)│   ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Integration Layer Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <<component>> Integration Service                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Unified Interfaces                                       │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │ IInsurerAdapter│  │IPaymentAdapter │                 │  │
│  │  │ • getQuote()   │  │• createPayment()│                 │  │
│  │  │ • issuePolicy()│  │• verifyCallback()│                │  │
│  │  │ • submitClaim()│  │• refund()       │                 │  │
│  │  │ • getStatus()  │  │• queryStatus()  │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  │                                                           │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │ IeKYCAdapter   │  │IMessagingAdapter│                 │  │
│  │  │ • verifyId()   │  │• sendEmail()    │                 │  │
│  │  │ • faceMatch()  │  │• sendSMS()      │                 │  │
│  │  │ • ocrExtract() │  │• sendPush()     │                 │  │
│  │  └────────────────┘  └────────────────┘                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Concrete Adapters                                        │  │
│  │                                                           │  │
│  │  Insurers:          Payment:          Messaging:          │  │
│  │  ┌──────────┐      ┌──────────┐      ┌──────────┐       │  │
│  │  │BảoViệt   │      │  VNPay   │      │ SendGrid │       │  │
│  │  │Adapter   │      │ Adapter  │      │ Adapter  │       │  │
│  │  └──────────┘      └──────────┘      └──────────┘       │  │
│  │  ┌──────────┐      ┌──────────┐      ┌──────────┐       │  │
│  │  │  PVI     │      │   Momo   │      │  FPT SMS │       │  │
│  │  │ Adapter  │      │ Adapter  │      │ Adapter  │       │  │
│  │  └──────────┘      └──────────┘      └──────────┘       │  │
│  │  ┌──────────┐      ┌──────────┐                          │  │
│  │  │ Liberty  │      │ ZaloPay  │      eKYC:               │  │
│  │  │ Adapter  │      │ Adapter  │      ┌──────────┐       │  │
│  │  └──────────┘      └──────────┘      │  VNPT    │       │  │
│  │                                       │ Adapter  │       │  │
│  │                                       └──────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Cross-Cutting                                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │  Circuit   │  │   Retry    │  │  Request   │         │  │
│  │  │  Breaker   │  │   Logic    │  │  Logger    │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Shared Infrastructure Components

```
┌─────────────────────────────────────────────────────────────────┐
│  <<component>> Shared Infrastructure                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Logger     │  │ Error Handler│  │  Validator   │         │
│  │  (Winston)   │  │ (Global)     │  │   (Joi)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Event Bus   │  │ Cache Client │  │  Config      │         │
│  │(Redis PubSub)│  │   (Redis)    │  │  Manager     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Health      │  │  Metrics     │  │   Guards     │         │
│  │  Check       │  │ (Prometheus) │  │ (Auth/Role)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Queue       │  │   File       │  │  Pagination  │         │
│  │  Manager     │  │  Uploader    │  │   Helper     │         │
│  │  (Bull)      │  │  (S3)        │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Component Dependencies Matrix

| Component | Depends On |
|-----------|-----------|
| Customer SPA | API Gateway |
| Admin Panel | API Gateway |
| Partner Portal | API Gateway |
| API Gateway | Auth Service (JWT validation) |
| Auth Service | PostgreSQL, Redis |
| Product Service | PostgreSQL, Redis, Elasticsearch |
| Quote Service | PostgreSQL, Redis, Integration Service |
| Policy Service | PostgreSQL, Redis, Document Service, Notification Service |
| Claims Service | PostgreSQL, Redis, Document Service, Notification Service |
| Payment Service | PostgreSQL, Redis, Integration Service (Payment GWs) |
| Notification Service | Redis (Queue), SendGrid, FPT SMS |
| Document Service | AWS S3, PDF Generator |
| Integration Service | External APIs (Insurers, Payments, eKYC) |
