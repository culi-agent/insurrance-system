# C4 Model - Insurance System

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tham chiếu | https://c4model.com |

---

## 1. Level 1: System Context Diagram

Hiển thị Insurance System và mối quan hệ với users và external systems.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                         SYSTEM CONTEXT                                    │
│                                                                           │
│    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     │
│    │ Customer │     │  Admin   │     │ Partner  │     │  Agent   │     │
│    │  [Person]│     │ [Person] │     │ [Person] │     │ [Person] │     │
│    └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     │
│         │                │                │                │             │
│         │ Browses,       │ Manages        │ Manages        │ Sells      │
│         │ Buys,Claims    │ Operations     │ Products       │ Policies   │
│         │                │                │                │             │
│         ▼                ▼                ▼                ▼             │
│    ┌────────────────────────────────────────────────────────────────┐   │
│    │                                                                │   │
│    │              INSURANCE SYSTEM PLATFORM                          │   │
│    │                                                                │   │
│    │    Nền tảng bán bảo hiểm trực tuyến cho phép khách hàng       │   │
│    │    tìm kiếm, so sánh, mua và quản lý bảo hiểm online.        │   │
│    │                                                                │   │
│    │              [Software System]                                  │   │
│    │                                                                │   │
│    └──────────┬─────────────┬──────────────┬──────────────┬────────┘   │
│               │             │              │              │             │
│         ┌─────┴────┐  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐      │
│         │ Insurance│  │ Payment  │  │   eKYC   │  │Messaging │      │
│         │ Partners │  │ Gateways │  │ Provider │  │ Service  │      │
│         │ (APIs)   │  │(VNPay,..)│  │  (VNPT)  │  │(SendGrid)│      │
│         │[External]│  │[External]│  │[External]│  │[External]│      │
│         └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Actors & Systems

| Element | Type | Description |
|---------|------|-------------|
| Customer | Person | Người mua bảo hiểm (cá nhân/doanh nghiệp) |
| Admin | Person | Nhân viên vận hành hệ thống |
| Partner | Person | Đại diện công ty bảo hiểm |
| Agent | Person | Đại lý/tư vấn bán bảo hiểm |
| Insurance System | Software System | Hệ thống chính |
| Insurance Partners | External System | API các công ty bảo hiểm |
| Payment Gateways | External System | Cổng thanh toán (VNPay, Momo, ZaloPay) |
| eKYC Provider | External System | Dịch vụ xác minh danh tính |
| Messaging Service | External System | Email (SendGrid) & SMS (FPT) |

---

## 2. Level 2: Container Diagram

Hiển thị các containers (applications/services) bên trong Insurance System.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INSURANCE SYSTEM PLATFORM                              │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    WEB APPLICATIONS                                   ││
│  │                                                                       ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              ││
│  │  │ Customer SPA │  │  Admin SPA   │  │Partner Portal│              ││
│  │  │              │  │              │  │              │              ││
│  │  │ React 18     │  │ React 18     │  │ React 18     │              ││
│  │  │ TypeScript   │  │ TypeScript   │  │ TypeScript   │              ││
│  │  │ TailwindCSS  │  │ TailwindCSS  │  │ TailwindCSS  │              ││
│  │  │              │  │              │  │              │              ││
│  │  │[Web App]     │  │[Web App]     │  │[Web App]     │              ││
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              ││
│  └─────────┼─────────────────┼─────────────────┼───────────────────────┘│
│            │                 │                 │                          │
│            ▼                 ▼                 ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    API GATEWAY                                         ││
│  │           Kong / AWS API Gateway                                      ││
│  │  [Infrastructure: Rate limiting, Auth, Routing, CORS]                ││
│  └─────────────────────────────┬───────────────────────────────────────┘│
│                                │                                          │
│  ┌─────────────────────────────┼───────────────────────────────────────┐│
│  │                    BACKEND SERVICES                                    ││
│  │                             │                                          ││
│  │  ┌───────────┐  ┌──────────┴──┐  ┌───────────┐  ┌───────────┐      ││
│  │  │   Auth    │  │  Product    │  │   Quote   │  │  Policy   │      ││
│  │  │  Service  │  │  Service    │  │  Service  │  │  Service  │      ││
│  │  │           │  │             │  │           │  │           │      ││
│  │  │ Node.js   │  │ Node.js     │  │ Node.js   │  │ Node.js   │      ││
│  │  │ Express   │  │ Express     │  │ Express   │  │ Express   │      ││
│  │  │ TypeScript│  │ TypeScript  │  │ TypeScript│  │ TypeScript│      ││
│  │  │[Service]  │  │[Service]    │  │[Service]  │  │[Service]  │      ││
│  │  └───────────┘  └─────────────┘  └───────────┘  └───────────┘      ││
│  │                                                                        ││
│  │  ┌───────────┐  ┌─────────────┐  ┌───────────┐  ┌───────────┐      ││
│  │  │  Claims   │  │  Payment    │  │  Notif    │  │ Document  │      ││
│  │  │  Service  │  │  Service    │  │  Service  │  │  Service  │      ││
│  │  │[Service]  │  │[Service]    │  │[Service]  │  │[Service]  │      ││
│  │  └───────────┘  └─────────────┘  └───────────┘  └───────────┘      ││
│  │                                                                        ││
│  │  ┌──────────────────────────────────────────────────────────────┐    ││
│  │  │              Integration Service (Adapters)                    │    ││
│  │  │  [Service: Manages all external API integrations]             │    ││
│  │  └──────────────────────────────────────────────────────────────┘    ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    DATA STORES                                         ││
│  │                                                                       ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   ││
│  │  │ PostgreSQL │  │   Redis    │  │  AWS S3    │  │Elasticsearch│   ││
│  │  │            │  │            │  │            │  │            │   ││
│  │  │ Primary DB │  │ Cache +    │  │ Documents  │  │ Full-text  │   ││
│  │  │ + Replicas │  │ Queue +    │  │ Files      │  │ Search     │   ││
│  │  │            │  │ Sessions   │  │ Media      │  │ Analytics  │   ││
│  │  │[Database]  │  │[Cache]     │  │[Storage]   │  │[Search]    │   ││
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Level 3: Component Diagram (Backend Services)

### 3.1. Auth Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTH SERVICE                             │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │    Auth       │  │   Social      │  │    Token      │   │
│  │  Controller   │  │   Auth        │  │   Manager     │   │
│  │               │  │  Controller   │  │               │   │
│  │ • POST login  │  │ • POST google │  │ • generate()  │   │
│  │ • POST regist │  │ • POST fb     │  │ • verify()    │   │
│  │ • POST logout │  │ • POST apple  │  │ • refresh()   │   │
│  └───────┬───────┘  └───────┬───────┘  │ • revoke()    │   │
│          │                   │          └───────┬───────┘   │
│          ▼                   ▼                  │           │
│  ┌────────────────────────────────────┐         │           │
│  │          Auth Service               │◀────────┘           │
│  │  • register()  • login()            │                     │
│  │  • verifyOTP() • resetPassword()    │                     │
│  │  • changePassword() • lockAccount() │                     │
│  └───────────────┬────────────────────┘                     │
│                  │                                            │
│          ┌───────┴──────────┐                                │
│          ▼                  ▼                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    User      │  │   Session    │  │     OTP      │      │
│  │ Repository   │  │ Repository   │  │   Service    │      │
│  │              │  │              │  │              │      │
│  │ (PostgreSQL) │  │   (Redis)    │  │   (Redis)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2. Quote Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                     QUOTE SERVICE                             │
│                                                               │
│  ┌───────────────┐                                          │
│  │    Quote      │                                          │
│  │  Controller   │                                          │
│  │ • POST create │                                          │
│  │ • GET detail  │                                          │
│  │ • POST custom │                                          │
│  └───────┬───────┘                                          │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────┐     ┌────────────────┐                  │
│  │  Quote Service │────▶│ Pricing Engine │                  │
│  │                │     │                │                  │
│  │ • generate()   │     │ • calcBase()   │                  │
│  │ • multiQuote() │     │ • applyFactors│                  │
│  │ • customize()  │     │ • applyDisc() │                  │
│  └───────┬────────┘     └────────────────┘                  │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Insurer Quote Aggregator                        │ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │Adapter A │  │Adapter B │  │Adapter C │             │ │
│  │  │(Bảo Việt)│  │  (PVI)   │  │(Liberty) │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  │                                                          │ │
│  │  • fetchParallel()  • normalize()  • rank()             │ │
│  └────────────────────────────────────────────────────────┘ │
│          │                                                    │
│          ▼                                                    │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │    Quote     │  │    Cache     │                        │
│  │ Repository   │  │   (Redis)    │                        │
│  │ (PostgreSQL) │  │  TTL: 30min  │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3. Policy Service Components

```
┌─────────────────────────────────────────────────────────────┐
│                    POLICY SERVICE                             │
│                                                               │
│  ┌───────────────┐                                          │
│  │   Policy      │                                          │
│  │  Controller   │                                          │
│  └───────┬───────┘                                          │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────┐     ┌──────────────────┐               │
│  │ Policy Service │────▶│ Underwriting     │               │
│  │                │     │ Engine           │               │
│  │ • create()    │     │                  │               │
│  │ • activate()  │     │ • autoDecision() │               │
│  │ • cancel()    │     │ • checkRules()   │               │
│  │ • renew()     │     │ • calcLoading()  │               │
│  │ • endorse()   │     └──────────────────┘               │
│  └───────┬────────┘                                         │
│          │                                                    │
│     ┌────┴─────────────┐                                    │
│     ▼                  ▼                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Policy     │  │  Document    │  │   Event      │     │
│  │ Repository   │  │  Generator   │  │  Publisher   │     │
│  │              │  │  (PDF)       │  │              │     │
│  │(PostgreSQL)  │  │  (S3 store)  │  │(Redis PubSub)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Level 4: Code Diagram (Key Classes)

### 4.1. Auth Module Code Structure

```
auth/
├── controllers/
│   └── auth.controller.ts
│       ├── class AuthController
│       │   ├── register(req, res)
│       │   ├── login(req, res)
│       │   ├── logout(req, res)
│       │   ├── refreshToken(req, res)
│       │   ├── verifyOTP(req, res)
│       │   └── resetPassword(req, res)
│       └── dependencies: [AuthService, TokenService]
│
├── services/
│   ├── auth.service.ts
│   │   ├── class AuthService
│   │   │   ├── register(dto: RegisterDTO): Promise<User>
│   │   │   ├── login(dto: LoginDTO): Promise<AuthResult>
│   │   │   ├── verifyOTP(email, otp): Promise<boolean>
│   │   │   └── resetPassword(token, newPassword): Promise<void>
│   │   └── dependencies: [UserRepo, OTPService, EventBus]
│   │
│   └── token.service.ts
│       ├── class TokenService
│       │   ├── generateAccessToken(user): string
│       │   ├── generateRefreshToken(user): string
│       │   ├── verifyToken(token): TokenPayload
│       │   └── revokeToken(token): void
│       └── dependencies: [jwtConfig, SessionRepo]
│
├── repositories/
│   ├── user.repository.ts
│   └── session.repository.ts
│
├── entities/
│   ├── user.entity.ts
│   └── session.entity.ts
│
├── dtos/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── reset-password.dto.ts
│
├── guards/
│   ├── auth.guard.ts          # JWT verification middleware
│   └── role.guard.ts          # RBAC check middleware
│
└── routes.ts                   # Route definitions
```

---

## 5. Deployment Context (C4 Extension)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AWS CLOUD                                      │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     VPC (10.0.0.0/16)                           │ │
│  │                                                                  │ │
│  │  PUBLIC SUBNET (10.0.1.0/24)                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐                           │ │
│  │  │     ALB      │  │   NAT GW     │                           │ │
│  │  └──────────────┘  └──────────────┘                           │ │
│  │                                                                  │ │
│  │  PRIVATE SUBNET - APP (10.0.2.0/24)                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │ │
│  │  │  ECS Task 1  │  │  ECS Task 2  │  │  ECS Task N  │        │ │
│  │  │  (Fargate)   │  │  (Fargate)   │  │  (Fargate)   │        │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │ │
│  │                                                                  │ │
│  │  PRIVATE SUBNET - DATA (10.0.3.0/24)                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │ │
│  │  │   RDS        │  │ ElastiCache  │  │Elasticsearch │        │ │
│  │  │ (PostgreSQL) │  │   (Redis)    │  │   Cluster    │        │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │ │
│  │                                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  CloudFront  │  │      S3      │  │   Route 53   │              │
│  │    (CDN)     │  │  (Storage)   │  │    (DNS)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow Diagram

### 6.1. Purchase Flow (Data Flow)

```
[Customer]
    │
    │ 1. Select product & request quote
    ▼
[Customer SPA] ──HTTP/JSON──▶ [API Gateway] ──route──▶ [Quote Service]
                                                              │
                                                    2. Fetch pricing
                                                              │
                              [Integration Service] ◀─────────┘
                                       │
                              3. Call insurer APIs
                                       │
                              [Insurer APIs] ──response──▶ [Integration Service]
                                                              │
                                                    4. Normalize & return
                                                              │
[Customer SPA] ◀──────────────────────────────────────────────┘
    │
    │ 5. Submit purchase application
    ▼
[API Gateway] ──▶ [Policy Service] ──▶ [Underwriting Engine]
                        │                       │
                        │              6. Auto-decision
                        │                       │
                        ◀───────────────────────┘
                        │
               7. Create pending policy
                        │
                        ▼
              [Payment Service] ──▶ [Payment Gateway]
                        │                   │
                        │          8. Process payment
                        │                   │
                        ◀───────────────────┘
                        │
               9. Confirm & activate
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
    [Document Service]    [Notification Service]
    (Generate PDF)        (Email + SMS)
```
