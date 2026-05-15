# Design Principles - Nguyên Tắc Thiết Kế

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. SOLID Principles

### 1.1. Single Responsibility Principle (SRP)

> Mỗi class/module chỉ có MỘT lý do để thay đổi.

```typescript
// ❌ BAD: Service làm quá nhiều việc
class PolicyService {
  createPolicy() { ... }
  calculatePremium() { ... }      // → PricingEngine
  generatePDF() { ... }           // → DocumentService
  sendEmail() { ... }             // → NotificationService
  processPayment() { ... }        // → PaymentService
}

// ✅ GOOD: Mỗi class một trách nhiệm
class PolicyService {
  constructor(
    private pricingEngine: PricingEngine,
    private documentService: DocumentService,
    private notificationService: NotificationService,
  ) {}

  async createPolicy(dto: CreatePolicyDTO): Promise<Policy> {
    // Chỉ xử lý logic tạo policy
    const policy = Policy.create(dto);
    return this.policyRepo.save(policy);
  }
}
```

### 1.2. Open/Closed Principle (OCP)

> Open for extension, closed for modification.

```typescript
// ✅ GOOD: Thêm insurer mới không cần sửa code hiện tại
interface IInsurerAdapter {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
  issuePolicy(request: PolicyRequest): Promise<PolicyResponse>;
}

// Thêm insurer mới = tạo class mới, không sửa code cũ
class BaoVietAdapter implements IInsurerAdapter { ... }
class PVIAdapter implements IInsurerAdapter { ... }
class LibertyAdapter implements IInsurerAdapter { ... }  // NEW!

// Factory chỉ cần register thêm
adapterFactory.register('liberty', new LibertyAdapter());
```

### 1.3. Liskov Substitution Principle (LSP)

> Subtype phải thay thế được base type mà không thay đổi behavior.

```typescript
// ✅ GOOD: Tất cả payment adapters hoạt động giống nhau
function processPayment(adapter: IPaymentGateway, amount: Money): Promise<PaymentResult> {
  // Works the same regardless of which adapter (VNPay, Momo, ZaloPay)
  return adapter.createPayment({ amount, currency: 'VND' });
}
```

### 1.4. Interface Segregation Principle (ISP)

> Client không nên bị ép implement interface mà nó không dùng.

```typescript
// ❌ BAD: Interface quá lớn
interface IInsuranceService {
  getQuote(): Promise<Quote>;
  issuePolicy(): Promise<Policy>;
  submitClaim(): Promise<Claim>;
  cancelPolicy(): Promise<void>;
  renewPolicy(): Promise<Policy>;
  getReports(): Promise<Report[]>;
}

// ✅ GOOD: Chia nhỏ interfaces
interface IQuotable {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;
}

interface IPolicyIssuable {
  issuePolicy(request: PolicyRequest): Promise<PolicyResponse>;
}

interface IClaimable {
  submitClaim(request: ClaimRequest): Promise<ClaimResponse>;
}
```

### 1.5. Dependency Inversion Principle (DIP)

> High-level modules không phụ thuộc low-level modules. Cả hai phụ thuộc abstractions.

```typescript
// ❌ BAD: Service phụ thuộc trực tiếp implementation
class PolicyService {
  private repo = new PostgresPolicyRepository(); // tight coupling!
  private cache = new RedisCache();              // tight coupling!
}

// ✅ GOOD: Depend on abstractions (interfaces)
class PolicyService {
  constructor(
    private repo: IPolicyRepository,    // interface
    private cache: ICacheService,       // interface
    private eventBus: IEventBus,        // interface
  ) {}
}

// Dependencies injected from outside (DI container or manual)
const policyService = new PolicyService(
  new PostgresPolicyRepository(dataSource),
  new RedisCacheService(redisClient),
  new RedisEventBus(redisClient),
);
```

---

## 2. Domain-Driven Design Principles

### 2.1. Ubiquitous Language

Sử dụng ngôn ngữ nghiệp vụ bảo hiểm trong code:

```typescript
// ✅ GOOD: Dùng domain terminology
class Policy {
  endorse(changes: EndorsementDTO): void { ... }
  lapse(): void { ... }
  calculateNoClaimDiscount(): Money { ... }
}

// ❌ BAD: Dùng technical/generic terms
class Policy {
  update(data: any): void { ... }
  deactivate(): void { ... }
  getDiscount(): number { ... }
}
```

### 2.2. Bounded Contexts

Mỗi module/service có ranh giới rõ ràng, không truy cập trực tiếp data của module khác.

```typescript
// ❌ BAD: Claims service truy cập trực tiếp Policy DB
class ClaimsService {
  async submitClaim(policyId: string) {
    const policy = await policyRepository.findById(policyId); // WRONG!
  }
}

// ✅ GOOD: Claims service gọi Policy service qua interface
class ClaimsService {
  constructor(private policyClient: IPolicyClient) {}

  async submitClaim(policyId: string) {
    const policy = await this.policyClient.getPolicy(policyId); // Via API/interface
  }
}
```

### 2.3. Aggregate Design

```typescript
// ✅ Policy là Aggregate Root
// Mọi thay đổi với Beneficiary, Coverage phải qua Policy
class Policy {
  private beneficiaries: Beneficiary[] = [];
  private coverageDetails: CoverageDetail[] = [];

  addBeneficiary(beneficiary: Beneficiary): void {
    if (this.beneficiaries.length >= 5) {
      throw new BusinessError('MAX_BENEFICIARIES', 'Tối đa 5 người thụ hưởng');
    }
    const totalPercentage = this.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage + beneficiary.percentage > 100) {
      throw new BusinessError('INVALID_PERCENTAGE', 'Tổng tỷ lệ không được vượt 100%');
    }
    this.beneficiaries.push(beneficiary);
  }
}
```

---

## 3. Clean Architecture Principles

### 3.1. Dependency Rule

```
Outer layers depend on inner layers, NEVER the reverse.

┌─────────────────────────────────────────┐
│  Infrastructure (DB, API, Framework)     │  ← Outermost
│  ┌─────────────────────────────────┐    │
│  │  Application (Use Cases)         │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │  Domain (Entities, Rules)│    │    │  ← Innermost
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

Domain: KHÔNG import từ Application hoặc Infrastructure
Application: CÓ THỂ import từ Domain, KHÔNG import từ Infrastructure
Infrastructure: CÓ THỂ import từ Application và Domain
```

### 3.2. Use Case Driven

```typescript
// ✅ Mỗi use case là một class/function rõ ràng
class CreatePolicyUseCase {
  constructor(
    private policyRepo: IPolicyRepository,
    private quoteService: IQuoteService,
    private underwritingEngine: IUnderwritingEngine,
  ) {}

  async execute(input: CreatePolicyInput): Promise<CreatePolicyOutput> {
    // 1. Get and validate quote
    const quote = await this.quoteService.getById(input.quoteId);
    if (!quote) throw new NotFoundError('Quote', input.quoteId);
    if (quote.isExpired()) throw new BusinessError('QUOTE_EXPIRED');

    // 2. Run underwriting
    const decision = await this.underwritingEngine.evaluate(input);
    if (decision.status === 'declined') {
      throw new BusinessError('UNDERWRITING_DECLINED', decision.reason);
    }

    // 3. Create policy
    const policy = Policy.create({ ...input, underwritingResult: decision });

    // 4. Persist
    const saved = await this.policyRepo.save(policy);

    return { policy: saved, decision };
  }
}
```

---

## 4. API Design Principles

### 4.1. RESTful Design

| Principle | Implementation |
|-----------|---------------|
| Use nouns, not verbs | `/policies` not `/createPolicy` |
| Use plural | `/products`, `/claims` |
| Nested resources | `/policies/{id}/claims` |
| HTTP methods for actions | GET=read, POST=create, PATCH=update, DELETE=delete |
| Consistent response format | Always `{ success, data, error, meta, timestamp }` |
| Versioning | URL path: `/api/v1/` |
| Pagination | Cursor-based for lists: `?cursor=xxx&limit=20` |
| Filtering | Query params: `?status=active&category=health` |
| Sorting | Query params: `?sort=-createdAt,name` |

### 4.2. Idempotency

```typescript
// ✅ Payment operations MUST be idempotent
// Client sends Idempotency-Key header
app.post('/api/v1/payments', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // Check if this request was already processed
  const existing = await cache.get(`idem:${idempotencyKey}`);
  if (existing) {
    return res.status(200).json(existing); // Return cached response
  }

  // Process payment
  const result = await paymentService.process(req.body);

  // Cache response for 24h
  await cache.set(`idem:${idempotencyKey}`, result, 86400);

  return res.status(201).json(result);
});
```

### 4.3. Error Design

```typescript
// ✅ Errors are informative and actionable
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",          // Machine-readable
    "message": "Thông tin không hợp lệ", // Human-readable (Vietnamese)
    "details": [                          // Field-level details
      {
        "field": "email",
        "message": "Email đã được sử dụng",
        "code": "DUPLICATE"
      },
      {
        "field": "phone",
        "message": "Số điện thoại không đúng định dạng",
        "code": "INVALID_FORMAT"
      }
    ]
  }
}
```

---

## 5. Security Design Principles

### 5.1. Defense in Depth

Áp dụng nhiều lớp bảo mật, không dựa vào một lớp duy nhất:

```
Request → WAF → Rate Limit → Auth → Validation → Business Logic → Data
                                                                    ↓
                                                              Encryption
```

### 5.2. Principle of Least Privilege

```typescript
// ✅ Mỗi role chỉ có quyền tối thiểu cần thiết
const permissions = {
  customer: ['read:own_policies', 'create:quotes', 'create:claims'],
  operator: ['read:all_policies', 'update:claims', 'read:reports'],
  admin: ['*'], // full access
  partner: ['read:own_products', 'update:own_products', 'read:own_claims'],
};
```

### 5.3. Never Trust Input

```typescript
// ✅ Always validate and sanitize
app.post('/api/v1/quotes', async (req, res) => {
  // 1. Validate schema
  const { error, value } = quoteSchema.validate(req.body);
  if (error) throw new ValidationError(error.details);

  // 2. Sanitize (remove unexpected fields)
  const sanitized = pick(value, allowedFields);

  // 3. Use sanitized data
  const quote = await quoteService.generate(sanitized);
});
```

---

## 6. Performance Design Principles

### 6.1. Cache-First Strategy

```typescript
// ✅ Check cache before DB
async function getProduct(id: string): Promise<Product> {
  // 1. Check cache
  const cached = await cache.get(`product:${id}`);
  if (cached) return cached;

  // 2. Query DB
  const product = await productRepo.findById(id);
  if (!product) throw new NotFoundError('Product', id);

  // 3. Store in cache
  await cache.set(`product:${id}`, product, 3600); // 1h TTL

  return product;
}
```

### 6.2. Fail Fast

```typescript
// ✅ Validate early, fail fast
async function purchasePolicy(dto: PurchaseDTO): Promise<Policy> {
  // Fail fast checks (cheap operations first)
  if (!dto.quoteId) throw new ValidationError('quoteId required');

  const quote = await quoteService.getById(dto.quoteId);
  if (!quote) throw new NotFoundError('Quote', dto.quoteId);
  if (quote.isExpired()) throw new BusinessError('QUOTE_EXPIRED');

  const user = await userService.getById(dto.userId);
  if (!user.isKYCVerified()) throw new BusinessError('KYC_REQUIRED');

  // Expensive operations only after all validations pass
  const underwiting = await underwritingEngine.evaluate(dto); // expensive
  const payment = await paymentService.process(dto.payment);  // expensive
}
```

### 6.3. Async by Default

```typescript
// ✅ Non-critical operations should be async
async function activatePolicy(policyId: string): Promise<Policy> {
  // Critical: must be synchronous
  const policy = await policyRepo.activate(policyId);

  // Non-critical: push to queue (don't wait)
  await eventBus.publish('PolicyActivated', { policyId });
  // → Notification Service picks up and sends email/SMS asynchronously
  // → Document Service picks up and generates PDF asynchronously

  return policy;
}
```

---

## 7. Resilience Design Principles

### 7.1. Circuit Breaker

```typescript
// ✅ Protect against cascading failures
const circuitBreaker = new CircuitBreaker(insurerApi.getQuote, {
  timeout: 10000,        // 10s timeout
  errorThreshold: 50,    // Open after 50% errors
  resetTimeout: 30000,   // Try again after 30s
  fallback: () => ({     // Return fallback on failure
    available: false,
    message: 'Insurer temporarily unavailable',
  }),
});
```

### 7.2. Graceful Degradation

```typescript
// ✅ System still works when non-critical services fail
async function getMultiInsurerQuotes(request: QuoteRequest): Promise<QuoteResult> {
  const results = await Promise.allSettled([
    insurerA.getQuote(request),
    insurerB.getQuote(request),
    insurerC.getQuote(request),
  ]);

  // Return whatever succeeded (even if some failed)
  const successful = results
    .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
    .map(r => r.value);

  if (successful.length === 0) {
    throw new ServiceUnavailableError('No insurers available');
  }

  return { quotes: successful, totalAvailable: 3, totalResponded: successful.length };
}
```

### 7.3. Retry with Backoff

```typescript
// ✅ Exponential backoff for transient failures
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !isTransientError(error)) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
}
```

---

## 8. Data Design Principles

| Principle | Implementation |
|-----------|---------------|
| Data Integrity | ACID transactions for financial operations |
| Data Privacy | Encrypt PII at rest, mask in logs |
| Data Minimization | Only collect/store what's needed |
| Data Immutability | Audit logs never modified, append-only |
| Data Validation | Validate at boundary (API input) |
| Data Ownership | Each service owns its data, no shared DB |
