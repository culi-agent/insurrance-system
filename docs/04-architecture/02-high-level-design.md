# High-Level Design (HLD)

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Tổng quan hệ thống

### 1.1. System Context

Insurance System Platform là hệ thống trung gian (marketplace/broker) kết nối khách hàng với các công ty bảo hiểm, cung cấp trải nghiệm mua bảo hiểm trực tuyến end-to-end.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL ACTORS                                │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Customer │  │  Admin   │  │ Partner  │  │ External │           │
│  │  (B2C)   │  │  Staff   │  │(Insurer) │  │ Systems  │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │              │              │              │                  │
└───────┼──────────────┼──────────────┼──────────────┼─────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                    INSURANCE SYSTEM PLATFORM                          │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Frontend Layer: Customer App │ Admin Panel │ Partner Portal   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Backend Layer: API Gateway + Business Services                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Data Layer: Database + Cache + Storage + Search               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     THIRD-PARTY SERVICES                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Insurer  │  │ Payment  │  │   eKYC   │  │Messaging │           │
│  │   APIs   │  │ Gateways │  │ Provider │  │(Email/SMS)│           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2. System Boundaries

| Boundary | Inside | Outside |
|----------|--------|---------|
| Platform | Web apps, API, Business logic, Data | Mobile app (future), IoT |
| Business | Marketplace/Broker model | Insurance underwriting (done by partners) |
| Geography | Vietnam market | International expansion |
| Technology | Cloud-native, web-based | On-premise, native mobile |

---

## 2. Frontend Architecture

### 2.1. Client Applications

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ARCHITECTURE                          │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐│
│  │  Customer App   │  │   Admin Panel   │  │ Partner Portal   ││
│  │                 │  │                 │  │                  ││
│  │ • Product browse│  │ • Dashboard     │  │ • Product mgmt   ││
│  │ • Quote & Buy   │  │ • User mgmt    │  │ • Claims review  ││
│  │ • Policy mgmt   │  │ • Claims ops   │  │ • Reports        ││
│  │ • Claims submit │  │ • Reports      │  │ • API monitoring ││
│  │ • Payment       │  │ • Settings     │  │ • Commission     ││
│  └─────────────────┘  └─────────────────┘  └──────────────────┘│
│                                                                   │
│  SHARED:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ React 18 │ TypeScript │ TailwindCSS │ Zustand │ React Query ││
│  │ React Router │ React Hook Form │ Zod │ Axios               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Frontend Module Structure

```
fe/src/
├── app/                    # App setup, providers, routing
│   ├── routes/            # Route definitions
│   ├── providers/         # Context providers
│   └── App.tsx
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── store/
│   ├── products/          # Product catalog
│   ├── quotes/            # Quotation
│   ├── purchase/          # Purchase flow
│   ├── policies/          # Policy management
│   ├── claims/            # Claims
│   └── payments/          # Payment
├── shared/                # Shared utilities
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── types/             # Shared TypeScript types
│   └── constants/         # App constants
├── design-system/         # Design tokens & base components
│   ├── tokens/            # Colors, spacing, typography
│   └── components/        # Button, Input, Card, Modal...
└── assets/                # Static files
```

### 2.3. State Management Strategy

| State Type | Solution | Example |
|-----------|----------|---------|
| Server State | React Query (TanStack) | API data, caching, sync |
| Client Global State | Zustand | Auth state, cart, preferences |
| Form State | React Hook Form | Form inputs, validation |
| URL State | React Router | Filters, pagination, tabs |
| Component State | useState/useReducer | UI toggles, local inputs |

---

## 3. Backend Architecture

### 3.1. Service Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND ARCHITECTURE                             │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API GATEWAY                                  │  │
│  │  • JWT Validation  • Rate Limiting  • Request Routing          │  │
│  │  • CORS            • Logging        • Request/Response Transform│  │
│  └──────────────────────────────┬────────────────────────────────┘  │
│                                 │                                     │
│  ┌──────────────────────────────┼────────────────────────────────┐  │
│  │              SERVICE LAYER (Business Logic)                     │  │
│  │                              │                                  │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │  │
│  │  │ Auth │ │ Prod │ │Quote │ │Policy│ │Claims│ │ Pay  │     │  │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘     │  │
│  │     │        │        │        │        │        │           │  │
│  │  ┌──┴────────┴────────┴────────┴────────┴────────┴──┐       │  │
│  │  │           SHARED INFRASTRUCTURE                    │       │  │
│  │  │  • Logger • Error Handler • Event Bus • Validator  │       │  │
│  │  │  • Config • Health Check • Metrics • Cache Client  │       │  │
│  │  └───────────────────────────────────────────────────┘       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2. Backend Module Structure

```
be/src/
├── app.ts                      # Express app setup
├── server.ts                   # Server bootstrap
├── config/                     # Configuration
│   ├── database.ts
│   ├── redis.ts
│   ├── jwt.ts
│   └── environment.ts
├── modules/                    # Business modules
│   ├── auth/
│   │   ├── controllers/       # HTTP handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access
│   │   ├── entities/          # TypeORM entities
│   │   ├── dtos/              # Data Transfer Objects
│   │   ├── middlewares/       # Auth-specific middleware
│   │   └── routes.ts          # Route definitions
│   ├── products/
│   ├── quotes/
│   ├── policies/
│   ├── claims/
│   ├── payments/
│   ├── notifications/
│   └── documents/
├── shared/                     # Shared infrastructure
│   ├── middlewares/            # Global middlewares
│   ├── exceptions/            # Error classes
│   ├── guards/                # Auth guards
│   ├── decorators/            # Custom decorators
│   ├── utils/                 # Utilities
│   ├── events/                # Event bus
│   └── types/                 # Shared types
├── integrations/              # External service adapters
│   ├── insurers/              # Insurer API adapters
│   ├── payments/              # Payment gateway adapters
│   ├── ekyc/                  # eKYC provider adapter
│   └── messaging/             # Email/SMS adapters
└── database/
    ├── migrations/            # DB migrations
    └── seeds/                 # Seed data
```

### 3.3. API Design

#### URL Convention
```
Base URL: https://api.insurance-system.vn/api/v1

Resources:
GET    /products                    # List products
GET    /products/:id                # Get product detail
POST   /quotes                      # Create quote
GET    /quotes/:id                  # Get quote
POST   /policies                    # Create policy (purchase)
GET    /policies/:id                # Get policy detail
PATCH  /policies/:id                # Update policy
POST   /claims                      # Submit claim
GET    /claims/:id                  # Get claim detail
POST   /payments                    # Process payment
GET    /payments/:id/status         # Check payment status
```

#### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "2026-05-15T10:30:00.000Z"
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  },
  "timestamp": "2026-05-15T10:30:00.000Z"
}
```

---

## 4. Data Architecture

### 4.1. Database Design Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                            │
│                                                                   │
│  Schema: auth                Schema: core                        │
│  ┌──────────────┐           ┌──────────────┐                    │
│  │ users        │           │ products     │                    │
│  │ roles        │           │ categories   │                    │
│  │ permissions  │           │ insurers     │                    │
│  │ sessions     │           │ quotes       │                    │
│  │ social_accts │           │ policies     │                    │
│  └──────────────┘           │ claims       │                    │
│                             │ payments     │                    │
│  Schema: audit              │ beneficiaries│                    │
│  ┌──────────────┐           │ documents    │                    │
│  │ audit_logs   │           └──────────────┘                    │
│  │ event_store  │                                                │
│  └──────────────┘           Schema: notification                │
│                             ┌──────────────┐                    │
│                             │ notifications│                    │
│                             │ templates    │                    │
│                             │ preferences  │                    │
│                             └──────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Key Data Flows

```
[Purchase Flow - Data Journey]

1. Customer Profile (users table)
        │
        ▼
2. Quote Request (quotes table)
   ├── Call Insurer APIs
   └── Store quote results
        │
        ▼
3. Application (policies table - status: PENDING)
   ├── KYC data (documents table)
   └── Health declaration (policy_metadata)
        │
        ▼
4. Underwriting (policies table - update status)
        │
        ▼
5. Payment (payments table)
   ├── Gateway transaction
   └── Payment confirmation
        │
        ▼
6. Policy Issuance (policies table - status: ACTIVE)
   ├── Generate PDF (documents table)
   ├── Send notifications (notifications table)
   └── Audit log (audit_logs table)
```

### 4.3. Data Replication & Backup

```
┌──────────────┐     Streaming       ┌──────────────┐
│   Primary    │────Replication──────▶│  Replica 1   │ (Read traffic)
│ (Read/Write) │                      └──────────────┘
│              │     Streaming       ┌──────────────┐
│              │────Replication──────▶│  Replica 2   │ (Read traffic)
└──────┬───────┘                      └──────────────┘
       │
       │  Every 6 hours
       ▼
┌──────────────┐
│   Backup     │──── Retention: 30 days
│ (S3 Snapshot)│──── Cross-region copy (DR)
└──────────────┘
```

---

## 5. Integration Architecture

### 5.1. Integration Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Adapter Pattern (Anti-Corruption Layer)          ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                               ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │ Insurer  │  │ Insurer  │  │ Insurer  │  │ Insurer  │   ││
│  │  │Adapter A │  │Adapter B │  │Adapter C │  │Adapter D │   ││
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   ││
│  │       │              │              │              │          ││
│  │       ▼              ▼              ▼              ▼          ││
│  │  ┌──────────────────────────────────────────────────────┐   ││
│  │  │          Unified Insurance Interface                  │   ││
│  │  │  • getQuote()  • issuePolicy()  • submitClaim()      │   ││
│  │  │  • getStatus() • cancelPolicy() • getProducts()      │   ││
│  │  └──────────────────────────────────────────────────────┘   ││
│  │                                                               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 5.2. External System Integration

| System | Protocol | Auth | Pattern | Timeout |
|--------|----------|------|---------|---------|
| Insurer A (Bảo Việt) | REST | API Key + HMAC | Adapter | 10s |
| Insurer B (PVI) | SOAP/XML | WS-Security | Adapter | 15s |
| Insurer C (Liberty) | REST | OAuth2 | Adapter | 10s |
| VNPay | REST | HMAC SHA512 | Redirect | 15min |
| Momo | REST | RSA Signature | Deep link/QR | 15min |
| ZaloPay | REST | HMAC SHA256 | Redirect | 15min |
| eKYC (VNPT) | REST | API Key | Request/Response | 30s |
| SendGrid | REST | API Key | Fire & Forget | 5s |
| SMS (FPT) | REST | Username/Password | Fire & Forget | 5s |

### 5.3. Circuit Breaker Configuration

```
Circuit Breaker States:
CLOSED → (failures > threshold) → OPEN → (timeout) → HALF-OPEN
                                                          │
                                          success → CLOSED
                                          failure → OPEN

Configuration per external service:
{
  "failureThreshold": 5,        // Mở circuit sau 5 lỗi liên tiếp
  "successThreshold": 3,        // Đóng circuit sau 3 success
  "timeout": 30000,             // Thời gian ở OPEN state (30s)
  "monitorInterval": 10000      // Check interval
}
```

---

## 6. Scalability Design

### 6.1. Horizontal Scaling Strategy

```
                    ┌──────────────────────┐
                    │    Load Balancer      │
                    │  (AWS ALB / Nginx)    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  Instance 1  │ │  Instance 2  │ │  Instance N  │
      │  (App Server)│ │  (App Server)│ │  (App Server)│
      └──────────────┘ └──────────────┘ └──────────────┘

Auto-scaling rules:
• Scale OUT: CPU > 70% for 5 minutes
• Scale IN:  CPU < 30% for 15 minutes
• Min instances: 2 (HA)
• Max instances: 20
```

### 6.2. Performance Optimization Layers

| Layer | Technique | Impact |
|-------|-----------|--------|
| CDN | Static assets caching | -50% origin requests |
| API Gateway | Response caching (GET) | -30% backend load |
| Application | Redis caching | -60% DB queries |
| Database | Connection pooling, indexes | -40% query time |
| Frontend | Code splitting, lazy loading | -30% initial load |

---

## 7. High Availability Design

### 7.1. Multi-AZ Deployment

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Region (ap-southeast-1)            │
│                                                           │
│  ┌───────────────────────┐  ┌───────────────────────┐   │
│  │   Availability Zone A  │  │  Availability Zone B   │   │
│  │                        │  │                        │   │
│  │  ┌────────────────┐   │  │  ┌────────────────┐   │   │
│  │  │ App Instances  │   │  │  │ App Instances  │   │   │
│  │  │ (Primary)      │   │  │  │ (Secondary)    │   │   │
│  │  └────────────────┘   │  │  └────────────────┘   │   │
│  │                        │  │                        │   │
│  │  ┌────────────────┐   │  │  ┌────────────────┐   │   │
│  │  │ DB Primary     │   │  │  │ DB Replica     │   │   │
│  │  └────────────────┘   │  │  └────────────────┘   │   │
│  │                        │  │                        │   │
│  │  ┌────────────────┐   │  │  ┌────────────────┐   │   │
│  │  │ Redis Primary  │   │  │  │ Redis Replica  │   │   │
│  │  └────────────────┘   │  │  └────────────────┘   │   │
│  │                        │  │                        │   │
│  └───────────────────────┘  └───────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 7.2. Failover Scenarios

| Scenario | Detection | Action | Recovery Time |
|----------|-----------|--------|---------------|
| App instance failure | Health check (30s) | Auto-replace + reroute | < 60s |
| Database primary failure | RDS monitoring | Auto failover to replica | < 60s |
| Redis primary failure | ElastiCache | Auto failover | < 30s |
| AZ failure | Multi-AZ routing | Traffic to other AZ | < 120s |
| Region failure | Route 53 health check | DR activation | < 60min |

---

## 8. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | | |
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | TailwindCSS | 3.x |
| State (server) | TanStack React Query | 5.x |
| State (client) | Zustand | 4.x |
| Forms | React Hook Form + Zod | 7.x + 3.x |
| Build | Vite | 5.x |
| **Backend** | | |
| Runtime | Node.js | 20 LTS |
| Framework | Express | 4.x |
| Language | TypeScript | 5.x |
| ORM | TypeORM | 0.3.x |
| Validation | Joi | 17.x |
| Logging | Winston | 3.x |
| **Data** | | |
| Database | PostgreSQL | 15.x |
| Cache | Redis | 7.x |
| Search | Elasticsearch | 8.x |
| Storage | AWS S3 | - |
| **Infrastructure** | | |
| Cloud | AWS | - |
| Container | Docker | - |
| Orchestration | ECS Fargate | - |
| CI/CD | GitHub Actions | - |
| Monitoring | Prometheus + Grafana | - |
| Logging | ELK Stack | - |
