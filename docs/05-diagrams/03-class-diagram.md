# Class Diagram - Sơ Đồ Lớp

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Notation | UML Class Diagram (text-based) |

---

## 1. Core Domain Classes

### 1.1. Customer Domain

```
┌──────────────────────────────────────┐
│           <<entity>>                  │
│              User                     │
├──────────────────────────────────────┤
│ - id: UUID                           │
│ - email: string                      │
│ - phone: string                      │
│ - passwordHash: string               │
│ - fullName: string                   │
│ - dateOfBirth: Date                  │
│ - gender: Gender                     │
│ - idNumber: string                   │
│ - address: Address                   │
│ - kycStatus: KYCStatus               │
│ - status: UserStatus                 │
│ - role: Role                         │
│ - emailVerified: boolean             │
│ - phoneVerified: boolean             │
│ - lastLoginAt: Date                  │
│ - failedLoginAttempts: number        │
│ - lockedUntil: Date | null           │
│ - createdAt: Date                    │
│ - updatedAt: Date                    │
├──────────────────────────────────────┤
│ + register(dto: RegisterDTO): User   │
│ + verifyEmail(): void                │
│ + verifyPhone(): void                │
│ + updateProfile(dto): void           │
│ + lock(until: Date): void            │
│ + unlock(): void                     │
│ + isLocked(): boolean                │
│ + incrementFailedLogin(): void       │
│ + resetFailedLogin(): void           │
└──────────────────────────────────────┘
          │ 1
          │
          │ *
┌──────────────────────────────────────┐
│         <<value object>>              │
│            Address                    │
├──────────────────────────────────────┤
│ - street: string                     │
│ - ward: string                       │
│ - district: string                   │
│ - city: string                       │
│ - postalCode: string                 │
├──────────────────────────────────────┤
│ + toString(): string                 │
│ + equals(other: Address): boolean    │
└──────────────────────────────────────┘

┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│    <<enum>>        │  │    <<enum>>        │  │    <<enum>>        │
│     Gender         │  │   UserStatus       │  │   KYCStatus        │
├───────────────────┤  ├───────────────────┤  ├───────────────────┤
│ MALE              │  │ ACTIVE             │  │ PENDING            │
│ FEMALE            │  │ INACTIVE           │  │ VERIFIED           │
│ OTHER             │  │ LOCKED             │  │ REJECTED           │
│                   │  │ DELETED            │  │                    │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

### 1.2. Product Domain

```
┌──────────────────────────────────────┐        ┌──────────────────────┐
│           <<entity>>                  │        │    <<entity>>         │
│            Product                    │        │     Category          │
├──────────────────────────────────────┤        ├──────────────────────┤
│ - id: UUID                           │   *..1 │ - id: UUID            │
│ - name: string                       │───────▶│ - name: string        │
│ - slug: string                       │        │ - slug: string        │
│ - categoryId: UUID                   │        │ - icon: string        │
│ - insurerId: UUID                    │        │ - description: string │
│ - description: string                │        │ - sortOrder: number   │
│ - shortDescription: string           │        └──────────────────────┘
│ - benefits: Benefit[]                │
│ - exclusions: Exclusion[]            │        ┌──────────────────────┐
│ - pricingRules: PricingRule          │   *..1 │    <<entity>>         │
│ - eligibility: EligibilityRule       │───────▶│     Insurer           │
│ - minAge: number                     │        ├──────────────────────┤
│ - maxAge: number                     │        │ - id: UUID            │
│ - status: ProductStatus              │        │ - name: string        │
│ - rating: number                     │        │ - code: string        │
│ - reviewCount: number                │        │ - logo: string        │
│ - createdAt: Date                    │        │ - apiConfig: JSON     │
├──────────────────────────────────────┤        │ - commissionRates: JSON│
│ + isEligible(customer): boolean      │        │ - status: string      │
│ + getPrice(factors): Money           │        └──────────────────────┘
│ + activate(): void                   │
│ + suspend(): void                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│         <<value object>>              │  │       <<value object>>        │
│            Benefit                    │  │         PricingRule            │
├──────────────────────────────────────┤  ├──────────────────────────────┤
│ - name: string                       │  │ - baseRate: number            │
│ - description: string                │  │ - ratingFactors: RatingFactor[]│
│ - coverageAmount: Money              │  │ - discounts: Discount[]       │
│ - unit: string                       │  │ - loadings: Loading[]         │
│ - conditions: string                 │  ├──────────────────────────────┤
└──────────────────────────────────────┘  │ + calculate(input): Money     │
                                           └──────────────────────────────┘
```

### 1.3. Policy Domain

```
┌──────────────────────────────────────────┐
│              <<entity>>                    │
│               Policy                       │
├──────────────────────────────────────────┤
│ - id: UUID                                │
│ - policyNumber: string                    │
│ - customerId: UUID                        │
│ - productId: UUID                         │
│ - insurerId: UUID                         │
│ - quoteId: UUID                           │
│ - status: PolicyStatus                    │
│ - startDate: Date                         │
│ - endDate: Date                           │
│ - premiumAmount: Money                    │
│ - sumInsured: Money                       │
│ - coverageDetails: CoverageDetail[]       │
│ - beneficiaries: Beneficiary[]            │
│ - paymentFrequency: PaymentFrequency      │
│ - autoRenewal: boolean                    │
│ - insurerPolicyRef: string                │
│ - createdAt: Date                         │
│ - updatedAt: Date                         │
├──────────────────────────────────────────┤
│ + activate(paymentId: string): void       │
│ + cancel(reason: string): CancelResult    │
│ + renew(options: RenewalDTO): Policy      │
│ + endorse(changes: EndorsementDTO): void  │
│ + lapse(): void                           │
│ + isActive(): boolean                     │
│ + isExpiring(days: number): boolean       │
│ + calculateRefund(): Money                │
│ + getDaysRemaining(): number              │
└──────────────────────────────────────────┘
          │ 1                    │ 1
          │                      │
          │ *                    │ *
┌─────────────────────┐  ┌──────────────────────┐
│  <<value object>>    │  │   <<value object>>    │
│   Beneficiary        │  │    CoverageDetail     │
├─────────────────────┤  ├──────────────────────┤
│ - name: string       │  │ - benefitName: string │
│ - relationship: str  │  │ - coverageAmount: Money│
│ - percentage: number │  │ - deductible: Money   │
│ - contactPhone: str  │  │ - waitingPeriod: days │
│ - contactEmail: str  │  │ - conditions: string  │
└─────────────────────┘  └──────────────────────┘

┌───────────────────────┐
│      <<enum>>          │
│    PolicyStatus        │
├───────────────────────┤
│ PENDING_PAYMENT       │
│ PENDING_ACTIVATION    │
│ ACTIVE                │
│ EXPIRED               │
│ CANCELLED             │
│ LAPSED                │
└───────────────────────┘
```

### 1.4. Claims Domain

```
┌──────────────────────────────────────────┐
│              <<entity>>                    │
│               Claim                        │
├──────────────────────────────────────────┤
│ - id: UUID                                │
│ - claimNumber: string                     │
│ - policyId: UUID                          │
│ - customerId: UUID                        │
│ - claimType: ClaimType                    │
│ - eventDate: Date                         │
│ - description: string                     │
│ - claimedAmount: Money                    │
│ - approvedAmount: Money | null            │
│ - status: ClaimStatus                     │
│ - priority: Priority                      │
│ - handlerId: UUID | null                  │
│ - documents: ClaimDocument[]              │
│ - assessment: Assessment | null           │
│ - settlement: Settlement | null           │
│ - communications: Communication[]         │
│ - assignedAt: Date | null                 │
│ - decidedAt: Date | null                  │
│ - settledAt: Date | null                  │
│ - createdAt: Date                         │
├──────────────────────────────────────────┤
│ + submit(): void                          │
│ + assign(handlerId: UUID): void           │
│ + requestInfo(request: string): void      │
│ + approve(amount: Money, notes): void     │
│ + reject(reason: string): void            │
│ + settle(bankDetails): void               │
│ + appeal(reason: string): void            │
│ + addDocument(doc: ClaimDocument): void    │
│ + addCommunication(msg): void             │
│ + canTransitionTo(status): boolean        │
└──────────────────────────────────────────┘

┌───────────────────────┐  ┌───────────────────────┐
│      <<enum>>          │  │      <<enum>>          │
│    ClaimStatus         │  │     ClaimType          │
├───────────────────────┤  ├───────────────────────┤
│ SUBMITTED             │  │ HEALTH_INPATIENT      │
│ ASSIGNED              │  │ HEALTH_OUTPATIENT     │
│ DOCUMENTS_REVIEW      │  │ MOTOR_ACCIDENT        │
│ ADDITIONAL_INFO_REQ   │  │ MOTOR_THEFT           │
│ UNDER_ASSESSMENT      │  │ PROPERTY_DAMAGE       │
│ APPROVED              │  │ TRAVEL                │
│ PARTIALLY_APPROVED    │  │ LIFE_DEATH            │
│ REJECTED              │  │ LIFE_DISABILITY       │
│ PAYMENT_PROCESSING    │  └───────────────────────┘
│ SETTLED               │
│ CLOSED                │
│ UNDER_APPEAL          │
└───────────────────────┘
```

### 1.5. Payment Domain

```
┌──────────────────────────────────────────┐
│              <<entity>>                    │
│            Transaction                     │
├──────────────────────────────────────────┤
│ - id: UUID                                │
│ - referenceNumber: string                 │
│ - policyId: UUID | null                   │
│ - customerId: UUID                        │
│ - amount: Money                           │
│ - currency: string                        │
│ - type: TransactionType                   │
│ - method: PaymentMethod                   │
│ - gateway: PaymentGateway                 │
│ - gatewayReference: string | null         │
│ - gatewayResponse: JSON | null            │
│ - status: TransactionStatus               │
│ - paidAt: Date | null                     │
│ - expiresAt: Date                         │
│ - metadata: JSON                          │
│ - createdAt: Date                         │
├──────────────────────────────────────────┤
│ + initiate(): string (paymentUrl)         │
│ + confirm(gatewayData): void              │
│ + fail(reason: string): void              │
│ + expire(): void                          │
│ + refund(amount: Money): Transaction      │
│ + isExpired(): boolean                    │
│ + isPending(): boolean                    │
└──────────────────────────────────────────┘

┌───────────────────────┐  ┌───────────────────────┐
│      <<enum>>          │  │      <<enum>>          │
│  TransactionStatus     │  │   PaymentMethod        │
├───────────────────────┤  ├───────────────────────┤
│ PENDING               │  │ VNPAY                 │
│ PROCESSING            │  │ MOMO                  │
│ SUCCESS               │  │ ZALOPAY               │
│ FAILED                │  │ BANK_TRANSFER         │
│ EXPIRED               │  │ CREDIT_CARD           │
│ REFUNDED              │  │ INSTALLMENT           │
└───────────────────────┘  └───────────────────────┘
```

---

## 2. Service Layer Classes

### 2.1. Service Interfaces

```
┌──────────────────────────────────────────┐
│           <<interface>>                    │
│          IAuthService                      │
├──────────────────────────────────────────┤
│ + register(dto: RegisterDTO): User        │
│ + login(dto: LoginDTO): AuthResult        │
│ + logout(userId: string): void            │
│ + verifyOTP(email, otp): boolean          │
│ + resetPassword(token, password): void    │
│ + refreshToken(token): TokenPair          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│           <<interface>>                    │
│        IQuoteService                       │
├──────────────────────────────────────────┤
│ + generate(dto: QuoteRequestDTO): Quote   │
│ + getMultiInsurer(dto): Quote[]           │
│ + customize(id, changes): Quote           │
│ + getById(id: string): Quote              │
│ + save(quote: Quote): Quote               │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│           <<interface>>                    │
│        IPolicyService                      │
├──────────────────────────────────────────┤
│ + create(dto: CreatePolicyDTO): Policy    │
│ + activate(id, paymentId): Policy         │
│ + cancel(id, reason): CancelResult        │
│ + renew(id, options): Policy              │
│ + endorse(id, changes): Policy            │
│ + getByCustomer(customerId): Policy[]     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│           <<interface>>                    │
│       IPaymentGatewayAdapter               │
├──────────────────────────────────────────┤
│ + createPaymentUrl(req): PaymentUrl       │
│ + verifyCallback(data): Verification      │
│ + queryStatus(txnId): TxnStatus           │
│ + refund(txnId, amount): RefundResult     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│           <<interface>>                    │
│        IInsurerAdapter                     │
├──────────────────────────────────────────┤
│ + getQuote(req: QuoteReq): QuoteResp      │
│ + issuePolicy(req): PolicyResp            │
│ + submitClaim(req): ClaimResp             │
│ + getStatus(refId): StatusResp            │
│ + cancelPolicy(refId): CancelResp         │
└──────────────────────────────────────────┘
```

### 2.2. Repository Interfaces

```
┌──────────────────────────────────────────┐
│           <<interface>>                    │
│       IBaseRepository<T>                   │
├──────────────────────────────────────────┤
│ + findById(id: string): T | null          │
│ + findAll(filters, pagination): Page<T>   │
│ + create(entity: T): T                    │
│ + update(id: string, data): T             │
│ + delete(id: string): void                │
│ + count(filters): number                  │
└──────────────────────────────────────────┘
          △
          │ implements
          │
┌─────────┴────────────────────────────────┐
│           <<class>>                        │
│   UserRepository extends BaseRepository    │
├──────────────────────────────────────────┤
│ + findByEmail(email: string): User | null │
│ + findByPhone(phone: string): User | null │
│ + findByIdNumber(idNum): User | null      │
│ + updateLastLogin(userId): void           │
│ + lockAccount(userId, until): void        │
└──────────────────────────────────────────┘
```

---

## 3. Design Patterns Applied

### 3.1. Factory Pattern (Adapter Creation)

```
┌──────────────────────────────────────────┐
│           <<class>>                        │
│      InsurerAdapterFactory                 │
├──────────────────────────────────────────┤
│ - adapters: Map<string, IInsurerAdapter>  │
├──────────────────────────────────────────┤
│ + getAdapter(insurerId): IInsurerAdapter  │
│ + registerAdapter(id, adapter): void      │
│ + getAllAdapters(): IInsurerAdapter[]      │
└──────────────────────────────────────────┘
          │ creates
          │
          ▼
┌──────────────────────┐
│  <<interface>>        │
│  IInsurerAdapter      │
└──────────┬───────────┘
           │
     ┌─────┼──────────┐
     │     │          │
     ▼     ▼          ▼
┌────────┐┌────────┐┌────────┐
│BảoViệt ││  PVI   ││Liberty │
│Adapter ││Adapter ││Adapter │
└────────┘└────────┘└────────┘
```

### 3.2. Strategy Pattern (Pricing)

```
┌──────────────────────────────────────────┐
│           <<interface>>                    │
│        IPricingStrategy                    │
├──────────────────────────────────────────┤
│ + calculate(input: PricingInput): Money   │
└──────────────────────────────────────────┘
          △
          │
    ┌─────┼────────────────┐
    │     │                │
    ▼     ▼                ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│MotorPricing│ │HealthPricing│ │LifePricing │
│Strategy    │ │Strategy     │ │Strategy    │
└────────────┘ └────────────┘ └────────────┘
```

### 3.3. Observer Pattern (Events)

```
┌──────────────────────────────────────────┐
│           <<interface>>                    │
│         IEventHandler<T>                   │
├──────────────────────────────────────────┤
│ + handle(event: T): Promise<void>         │
└──────────────────────────────────────────┘
          △
          │
    ┌─────┼────────────────────────────┐
    │     │                            │
    ▼     ▼                            ▼
┌─────────────────┐ ┌─────────────────────────────┐
│SendWelcomeEmail │ │ActivatePolicyOnPayment      │
│Handler          │ │Handler                       │
│                 │ │                               │
│handles:         │ │handles:                       │
│CustomerRegistered│ │PaymentConfirmed              │
└─────────────────┘ └─────────────────────────────┘
```
