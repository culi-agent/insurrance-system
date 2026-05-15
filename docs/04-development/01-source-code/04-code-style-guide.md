# Code Style Guide

## Tổng quan

Tài liệu này định nghĩa quy tắc code style cho dự án Insurance System, áp dụng cho cả Backend (Node.js/TypeScript) và Frontend (React/TypeScript).

---

## 1. Quy tắc chung

### Formatting

| Rule | Value |
|------|-------|
| Indentation | 2 spaces |
| Max line length | 100 characters |
| Quotes | Single quotes (`'`) |
| Semicolons | Có |
| Trailing comma | ES5 (objects, arrays) |
| End of file | Newline |
| Bracket spacing | `{ key: value }` |

### File Structure

```typescript
// 1. Imports (grouped & ordered)
import { Module } from 'framework';          // Framework imports
import { Service } from 'third-party';       // Third-party imports
import { MyService } from '@/services';      // Internal imports (alias)
import { helper } from './utils';            // Relative imports

// 2. Constants
const MAX_RETRIES = 3;

// 3. Types/Interfaces
interface PolicyData {
  id: string;
  name: string;
}

// 4. Main logic (class/function)
export class PolicyService { ... }

// 5. Helper functions (private)
function validateInput(data: PolicyData): boolean { ... }
```

---

## 2. TypeScript Rules

### Type Safety

```typescript
// ✅ ALWAYS: Use explicit return types for public methods
export function calculatePremium(age: number, type: InsuranceType): number {
  return age * RATE_MAP[type];
}

// ✅ ALWAYS: Use interfaces for object shapes
interface CreatePolicyDTO {
  customerId: string;
  type: InsuranceType;
  startDate: Date;
  endDate: Date;
  coverageAmount: number;
}

// ❌ NEVER: Use 'any'
function processData(data: any): any { }

// ✅ INSTEAD: Use 'unknown' with type guards
function processData(data: unknown): PolicyData {
  if (isPolicyData(data)) {
    return data;
  }
  throw new Error('Invalid data format');
}

// ✅ USE: Enums for fixed sets of values
enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

// ✅ USE: Type narrowing
type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
```

### Null Handling

```typescript
// ✅ Use optional chaining
const city = customer?.address?.city;

// ✅ Use nullish coalescing
const name = customer.displayName ?? customer.fullName ?? 'Unknown';

// ✅ Use non-null assertion ONLY when certain
const element = document.getElementById('root')!;

// ❌ AVOID: Non-null assertion without certainty
const data = response.body!.data!.items!;
```

---

## 3. Backend Specific Rules

### API Controllers

```typescript
// ✅ Controller pattern
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  async createPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreatePolicyDTO;
      const result = await this.policyService.create(dto);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Policy created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Layer

```typescript
// ✅ Service pattern
export class PolicyService {
  constructor(
    private readonly policyRepo: PolicyRepository,
    private readonly premiumCalculator: PremiumCalculator,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreatePolicyDTO): Promise<Policy> {
    // Validation
    this.validatePolicy(dto);

    // Business logic
    const premium = this.premiumCalculator.calculate(dto);

    // Persistence
    const policy = await this.policyRepo.save({
      ...dto,
      premium,
      status: PolicyStatus.DRAFT,
    });

    // Side effects
    await this.notificationService.sendPolicyCreated(policy);

    return policy;
  }
}
```

### Error Handling

```typescript
// ✅ Custom error classes
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: string,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, `${resource} with id ${id} not found`, 'RESOURCE_NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}
```

---

## 4. Frontend Specific Rules

### Component Structure

```tsx
// ✅ Functional component pattern
import { useState, useCallback } from 'react';
import { PolicyCard } from '@/components/PolicyCard';
import { usePolicy } from '@/hooks/usePolicy';
import type { Policy } from '@/types';

interface PolicyListProps {
  customerId: string;
  onSelect: (policy: Policy) => void;
}

export const PolicyList: React.FC<PolicyListProps> = ({ customerId, onSelect }) => {
  const [filter, setFilter] = useState<string>('');
  const { data: policies, isLoading } = usePolicy(customerId);

  const filteredPolicies = useMemo(
    () => policies?.filter(p => p.name.includes(filter)) ?? [],
    [policies, filter],
  );

  const handleSelect = useCallback((policy: Policy) => {
    onSelect(policy);
  }, [onSelect]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <SearchInput value={filter} onChange={setFilter} />
      {filteredPolicies.map(policy => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          onClick={() => handleSelect(policy)}
        />
      ))}
    </div>
  );
};
```

### Hook Patterns

```typescript
// ✅ Custom hook pattern
export function usePolicy(customerId: string) {
  return useQuery({
    queryKey: ['policies', customerId],
    queryFn: () => policyApi.getByCustomer(customerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ✅ Form hook pattern
export function usePolicyForm() {
  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      type: '',
      coverageAmount: 0,
    },
  });

  return form;
}
```

### TailwindCSS Guidelines

```tsx
// ✅ Use utility classes, keep readable
<button className="
  px-4 py-2 
  bg-blue-600 hover:bg-blue-700 
  text-white font-medium rounded-lg
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Submit
</button>

// ✅ Extract repeated patterns into components
// DON'T create @apply utilities for simple patterns
// DO create reusable components instead
```

---

## 5. Naming Conventions Summary

| Element | Convention | Example |
|---------|-----------|---------|
| Files (general) | kebab-case | `policy-service.ts` |
| Files (components) | PascalCase | `PolicyCard.tsx` |
| Files (hooks) | camelCase | `usePolicy.ts` |
| Classes | PascalCase | `PolicyService` |
| Interfaces | PascalCase | `CreatePolicyDTO` |
| Types | PascalCase | `PolicyStatus` |
| Functions | camelCase | `calculatePremium` |
| Variables | camelCase | `policyList` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Enums | PascalCase | `ClaimStatus` |
| Enum Values | UPPER_SNAKE_CASE | `PENDING` |
| CSS Classes | kebab-case (Tailwind) | `text-blue-600` |
| Database Tables | snake_case | `insurance_policies` |
| Database Columns | snake_case | `created_at` |
| API Endpoints | kebab-case | `/api/v1/insurance-policies` |
| Environment Variables | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## 6. ESLint & Prettier Configuration

### ESLint Rules (Key)

```json
{
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

---

## 7. Comments & Documentation

```typescript
/**
 * Calculate insurance premium based on customer profile and policy type.
 *
 * @param age - Customer's age at policy start date
 * @param type - Type of insurance policy
 * @param coverage - Coverage amount in VND
 * @returns Premium amount in VND (annual)
 * @throws {ValidationError} If age is below minimum for policy type
 *
 * @example
 * const premium = calculatePremium(30, InsuranceType.LIFE, 1_000_000_000);
 * // Returns: 25_000_000
 */
export function calculatePremium(
  age: number,
  type: InsuranceType,
  coverage: number,
): number {
  // Implementation
}

// ✅ Use comments to explain WHY, not WHAT
// Business rule: Customers above 60 have 1.5x premium multiplier
const multiplier = age > 60 ? 1.5 : 1.0;

// ❌ Don't state the obvious
// Set age to 30
const age = 30;
```

---

## Enforcement

- **Pre-commit hook**: Tự động chạy ESLint + Prettier
- **CI Pipeline**: Fail build nếu có lint errors
- **Code Review**: Reviewers kiểm tra adherence to style guide
- **IDE Setup**: Recommended extensions cho VS Code (ESLint, Prettier)
