# Naming Conventions - Quy Ước Đặt Tên

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. General Rules

| Rule | Description |
|------|-------------|
| Meaningful names | Tên phải mô tả rõ ràng mục đích |
| No abbreviations | Viết đầy đủ (exception: id, url, dto, api) |
| English only | Tất cả code và comments bằng tiếng Anh |
| Consistent | Cùng concept → cùng tên trong toàn project |
| Searchable | Tên đủ unique để tìm kiếm (avoid single letters) |

---

## 2. TypeScript/JavaScript Naming

### 2.1. Variables & Functions

| Type | Convention | Examples |
|------|-----------|----------|
| Variables | camelCase | `userName`, `totalPremium`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE` |
| Functions | camelCase, verb prefix | `calculatePremium()`, `getUserById()` |
| Boolean | camelCase, is/has/can prefix | `isActive`, `hasPermission`, `canRenew` |
| Arrays | camelCase, plural | `products`, `claimDocuments`, `activeUsers` |
| Private | camelCase (no underscore prefix) | `private policyRepo` |

```typescript
// ✅ GOOD examples
const totalPremium = calculateAnnualPremium(factors);
const isEligible = checkEligibility(customer, product);
const activePolices = policies.filter(p => p.isActive());
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_QUOTE_VALIDITY_DAYS = 30;

// ❌ BAD examples
const tp = calc(f);           // unclear abbreviation
const flag = check(c, p);     // vague name
const list = policies.filter(p => p.s === 'a');  // single letter, unclear
```

### 2.2. Classes & Interfaces

| Type | Convention | Examples |
|------|-----------|----------|
| Classes | PascalCase, noun | `PolicyService`, `QuoteController` |
| Interfaces | PascalCase, I prefix (optional) | `IPolicyRepository`, `IPaymentGateway` |
| Type aliases | PascalCase | `PolicyStatus`, `CreatePolicyDTO` |
| Enums | PascalCase | `ClaimStatus`, `PaymentMethod` |
| Enum values | UPPER_SNAKE_CASE | `PENDING_PAYMENT`, `UNDER_REVIEW` |

```typescript
// ✅ GOOD
interface IPolicyRepository {
  findById(id: string): Promise<Policy | null>;
  findByCustomer(customerId: string): Promise<Policy[]>;
  save(policy: Policy): Promise<Policy>;
}

class PolicyService implements IPolicyService {
  constructor(private policyRepo: IPolicyRepository) {}
}

enum PolicyStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  LAPSED = 'lapsed',
}

type Money = {
  amount: number;
  currency: string;
};
```

### 2.3. Generics

| Convention | Example |
|-----------|---------|
| Single letter (simple) | `T`, `K`, `V` |
| Descriptive (complex) | `TEntity`, `TResponse`, `TInput` |

```typescript
// ✅ Simple generic
function findById<T>(id: string): Promise<T | null>;

// ✅ Descriptive generic
interface IBaseRepository<TEntity extends BaseEntity> {
  findById(id: string): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
}
```

---

## 3. File & Directory Naming

### 3.1. File Names

| Type | Convention | Examples |
|------|-----------|----------|
| Components (React) | PascalCase | `ProductCard.tsx`, `LoginForm.tsx` |
| Hooks | camelCase, use prefix | `useProducts.ts`, `useAuth.ts` |
| Services | kebab-case | `auth.service.ts`, `policy.service.ts` |
| Controllers | kebab-case | `auth.controller.ts` |
| Repositories | kebab-case | `user.repository.ts` |
| DTOs | kebab-case | `create-policy.dto.ts` |
| Entities | kebab-case | `policy.entity.ts` |
| Tests | same + .spec | `auth.service.spec.ts` |
| Types/Interfaces | kebab-case | `policy.types.ts` |
| Constants | kebab-case | `error-codes.ts` |
| Utilities | kebab-case | `date-utils.ts`, `format-money.ts` |
| Config | kebab-case | `database.config.ts` |

### 3.2. Directory Names

| Convention | Examples |
|-----------|----------|
| kebab-case, plural | `controllers/`, `services/`, `repositories/` |
| Feature-based | `modules/auth/`, `modules/policies/`, `modules/claims/` |

### 3.3. Full Module Structure Example

```
modules/
└── policies/
    ├── controllers/
    │   └── policy.controller.ts
    ├── services/
    │   ├── policy.service.ts
    │   └── renewal.service.ts
    ├── repositories/
    │   └── policy.repository.ts
    ├── entities/
    │   ├── policy.entity.ts
    │   └── beneficiary.entity.ts
    ├── dtos/
    │   ├── create-policy.dto.ts
    │   ├── update-policy.dto.ts
    │   └── renewal.dto.ts
    ├── events/
    │   ├── policy-created.event.ts
    │   └── policy-activated.event.ts
    ├── types/
    │   └── policy.types.ts
    ├── __tests__/
    │   ├── policy.service.spec.ts
    │   └── policy.controller.spec.ts
    ├── policy.module.ts
    └── index.ts                    # Public API (barrel export)
```

---

## 4. API Naming

### 4.1. URL Endpoints

| Rule | Example |
|------|---------|
| Plural nouns | `/api/v1/policies` not `/api/v1/policy` |
| Lowercase | `/api/v1/claim-documents` |
| Hyphen for multi-word | `/api/v1/payment-methods` |
| Nested resources | `/api/v1/policies/{id}/claims` |
| Actions as sub-resource | `/api/v1/policies/{id}/renew` (POST) |
| No verbs in URL | `/api/v1/policies` + POST (not `/api/v1/createPolicy`) |

```
✅ GOOD:
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products/:id/reviews
GET    /api/v1/policies?status=active&sort=-createdAt
POST   /api/v1/policies/:id/cancel
POST   /api/v1/quotes
GET    /api/v1/claims/:id/documents

❌ BAD:
GET    /api/v1/getProducts
POST   /api/v1/createPolicy
GET    /api/v1/Policy/123
POST   /api/v1/cancelPolicy/123
```

### 4.2. Query Parameters

| Type | Convention | Example |
|------|-----------|---------|
| Filtering | snake_case field names | `?status=active&claim_type=health` |
| Sorting | prefix with - for desc | `?sort=-created_at,name` |
| Pagination | cursor/page + limit | `?cursor=abc123&limit=20` |
| Searching | `q` parameter | `?q=bảo hiểm sức khỏe` |
| Field selection | `fields` parameter | `?fields=id,name,premium` |

### 4.3. Request/Response Fields

| Convention | Example |
|-----------|---------|
| camelCase in JSON | `{ "firstName": "Nguyen", "policyNumber": "POL-001" }` |
| snake_case in DB | `first_name`, `policy_number` |
| Auto-map between layers | Entity (snake) → DTO (camel) → Response (camel) |

---

## 5. Database Naming

### 5.1. PostgreSQL Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Database | snake_case | `insurance_system` |
| Schemas | snake_case | `auth`, `core`, `audit` |
| Tables | snake_case, plural | `users`, `policies`, `claim_documents` |
| Columns | snake_case | `full_name`, `created_at`, `premium_amount` |
| Primary Key | `id` | `id UUID PRIMARY KEY` |
| Foreign Keys | `{singular_table}_id` | `customer_id`, `policy_id` |
| Timestamps | `_at` suffix | `created_at`, `updated_at`, `deleted_at` |
| Booleans | `is_` or `has_` prefix | `is_active`, `has_kyc`, `is_verified` |
| Status columns | `status` | `status VARCHAR(20)` |
| JSON columns | descriptive name | `coverage_details`, `metadata` |
| Amount/Money | `_amount` suffix | `premium_amount`, `claimed_amount` |

### 5.2. Index & Constraint Naming

| Type | Pattern | Example |
|------|---------|---------|
| Primary Key | `pk_{table}` | `pk_policies` |
| Foreign Key | `fk_{table}_{ref_table}` | `fk_policies_customers` |
| Unique | `uq_{table}_{columns}` | `uq_users_email` |
| Index | `idx_{table}_{columns}` | `idx_policies_customer_id` |
| Check | `ck_{table}_{description}` | `ck_policies_valid_dates` |
| Composite Index | `idx_{table}_{col1}_{col2}` | `idx_claims_status_created` |

---

## 6. Event & Message Naming

### 6.1. Domain Events

| Convention | Example |
|-----------|---------|
| PascalCase | `PolicyActivated`, `ClaimSubmitted` |
| Past tense (something happened) | `PaymentConfirmed`, `UserRegistered` |
| {Entity}{Action}Event | `PolicyActivatedEvent`, `ClaimApprovedEvent` |

```typescript
// Event names
const EVENTS = {
  CUSTOMER_REGISTERED: 'CustomerRegistered',
  CUSTOMER_VERIFIED: 'CustomerVerified',
  QUOTE_GENERATED: 'QuoteGenerated',
  POLICY_CREATED: 'PolicyCreated',
  POLICY_ACTIVATED: 'PolicyActivated',
  POLICY_CANCELLED: 'PolicyCancelled',
  POLICY_RENEWED: 'PolicyRenewed',
  PAYMENT_CONFIRMED: 'PaymentConfirmed',
  PAYMENT_FAILED: 'PaymentFailed',
  CLAIM_SUBMITTED: 'ClaimSubmitted',
  CLAIM_APPROVED: 'ClaimApproved',
  CLAIM_REJECTED: 'ClaimRejected',
  CLAIM_SETTLED: 'ClaimSettled',
};
```

### 6.2. Queue/Job Names

| Convention | Example |
|-----------|---------|
| kebab-case | `send-email`, `generate-pdf`, `process-payment` |
| Verb-noun pattern | `sync-insurer-data`, `check-expiring-policies` |

---

## 7. Environment Variables

| Convention | Example |
|-----------|---------|
| UPPER_SNAKE_CASE | `DATABASE_URL`, `REDIS_HOST` |
| Prefix by service/group | `DB_HOST`, `DB_PORT`, `DB_NAME` |
| Boolean: use 1/0 or true/false | `ENABLE_CACHE=true` |

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_system
DB_USER=app_user
DB_PASSWORD=secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret

# JWT
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=insurance-documents
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# External Services
VNPAY_TMN_CODE=xxx
VNPAY_HASH_SECRET=xxx
MOMO_PARTNER_CODE=xxx
SENDGRID_API_KEY=xxx
EKYC_API_KEY=xxx
```

---

## 8. CSS/Styling Naming (TailwindCSS)

### 8.1. Custom Classes (when needed)

| Convention | Example |
|-----------|---------|
| BEM-like with kebab-case | `card-header`, `form-input--error` |
| Component prefix | `btn-primary`, `nav-link`, `modal-overlay` |

### 8.2. Tailwind Custom Config

```javascript
// tailwind.config.js - custom naming
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { ... },        // Brand primary
        secondary: { ... },      // Brand secondary
        success: { ... },
        warning: { ... },
        danger: { ... },
        'insurance-blue': '#1E40AF',
      },
      spacing: {
        'container-padding': '1rem',
      },
    },
  },
};
```

---

## 9. Summary Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                 NAMING CONVENTIONS CHEAT SHEET                    │
│                                                                   │
│  TypeScript:                                                     │
│  • variables/functions   → camelCase                             │
│  • constants             → UPPER_SNAKE_CASE                      │
│  • classes/interfaces    → PascalCase                            │
│  • enums                 → PascalCase (values: UPPER_SNAKE)      │
│  • types                 → PascalCase                            │
│  • booleans              → is/has/can prefix                     │
│                                                                   │
│  Files:                                                          │
│  • React components      → PascalCase.tsx                        │
│  • Everything else       → kebab-case.ts                         │
│  • Tests                 → *.spec.ts                             │
│  • Directories           → kebab-case/                           │
│                                                                   │
│  API:                                                            │
│  • URLs                  → /kebab-case/plural-nouns              │
│  • JSON fields           → camelCase                             │
│  • Query params          → snake_case                            │
│                                                                   │
│  Database:                                                       │
│  • Tables/Columns        → snake_case                            │
│  • Tables                → plural                                │
│  • FKs                   → {singular}_id                         │
│  • Indexes               → idx_{table}_{columns}                 │
│                                                                   │
│  Events:                                                         │
│  • Domain events         → PascalCase, past tense                │
│  • Queue jobs            → kebab-case, verb-noun                 │
│                                                                   │
│  Environment:                                                    │
│  • Env variables         → UPPER_SNAKE_CASE                      │
│                                                                   │
│  Git:                                                            │
│  • Branches              → type/ticket-description               │
│  • Commits               → type(scope): message                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```
