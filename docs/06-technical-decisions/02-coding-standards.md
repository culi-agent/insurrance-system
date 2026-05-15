# Coding Standards - Quy Chuẩn Viết Code

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Áp dụng | Toàn bộ team development |

---

## 1. General Coding Standards

### 1.1. Code Formatting

| Rule | Setting |
|------|---------|
| Indentation | 2 spaces (không dùng tabs) |
| Max line length | 100 characters |
| End of file | Single newline |
| Trailing whitespace | Không cho phép |
| Semicolons | Bắt buộc (TypeScript) |
| Quotes | Single quotes (strings), Double quotes (JSX attributes) |
| Trailing commas | Always (ES5+) |
| Bracket spacing | Yes `{ key: value }` |

### 1.2. File Organization

```
Thứ tự trong một file TypeScript:

1. Imports (grouped & sorted)
   - External packages (node_modules)
   - Internal modules (@/shared, @/modules)
   - Relative imports (./local)

2. Type/Interface definitions

3. Constants

4. Main export (class/function/component)

5. Helper functions (private)

6. Default export (if applicable)
```

### 1.3. Import Order

```typescript
// 1. Node built-in modules
import path from 'path';
import fs from 'fs';

// 2. External packages
import express from 'express';
import { Repository } from 'typeorm';

// 3. Internal shared modules
import { Logger } from '@/shared/logger';
import { AppError } from '@/shared/exceptions';

// 4. Internal modules (same feature)
import { UserRepository } from '../repositories/user.repository';

// 5. Relative imports
import { RegisterDTO } from './dtos/register.dto';
```

---

## 2. TypeScript Standards

### 2.1. Type Definitions

```typescript
// ✅ GOOD: Use interfaces for objects
interface User {
  id: string;
  email: string;
  fullName: string;
}

// ✅ GOOD: Use type for unions, intersections, primitives
type UserStatus = 'active' | 'inactive' | 'locked';
type ID = string;

// ✅ GOOD: Use enums for fixed sets with runtime values
enum ClaimStatus {
  SUBMITTED = 'submitted',
  ASSIGNED = 'assigned',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// ❌ BAD: Using 'any'
const data: any = fetchData(); // NEVER use 'any'

// ✅ GOOD: Use 'unknown' and narrow
const data: unknown = fetchData();
if (isUser(data)) {
  // now data is typed as User
}
```

### 2.2. Strict TypeScript Rules

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2.3. Function Signatures

```typescript
// ✅ GOOD: Explicit return types for public functions
async function createUser(dto: CreateUserDTO): Promise<User> {
  // ...
}

// ✅ GOOD: Use readonly for input parameters
function calculatePremium(factors: readonly RatingFactor[]): Money {
  // ...
}

// ✅ GOOD: Named parameters for 3+ args
interface CreatePolicyParams {
  customerId: string;
  productId: string;
  quoteId: string;
  coverageOptions: CoverageOptions;
}

function createPolicy(params: CreatePolicyParams): Promise<Policy> {
  // ...
}

// ❌ BAD: Too many positional parameters
function createPolicy(customerId: string, productId: string, quoteId: string, ...): Promise<Policy>
```

---

## 3. Backend Standards (Node.js/Express)

### 3.1. Controller Pattern

```typescript
// ✅ Standard Controller pattern
export class PolicyController {
  constructor(private policyService: IPolicyService) {}

  /**
   * Create a new policy from a quote
   * POST /api/v1/policies
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateBody(req.body, CreatePolicySchema);
      const userId = req.user.id; // from auth middleware

      const policy = await this.policyService.create(userId, dto);

      res.status(201).json({
        success: true,
        data: policy,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error); // pass to error handler
    }
  }
}
```

### 3.2. Service Pattern

```typescript
// ✅ Standard Service pattern
export class PolicyService implements IPolicyService {
  constructor(
    private policyRepo: IPolicyRepository,
    private quoteService: IQuoteService,
    private eventBus: IEventBus,
    private logger: Logger,
  ) {}

  async create(userId: string, dto: CreatePolicyDTO): Promise<Policy> {
    // 1. Validate business rules
    const quote = await this.quoteService.getById(dto.quoteId);
    if (!quote || quote.isExpired()) {
      throw new BusinessError('QUOTE_EXPIRED', 'Quote đã hết hạn');
    }

    // 2. Execute business logic
    const policy = Policy.create({
      customerId: userId,
      productId: quote.productId,
      ...dto,
    });

    // 3. Persist
    const saved = await this.policyRepo.save(policy);

    // 4. Emit domain event
    await this.eventBus.publish(new PolicyCreatedEvent(saved));

    // 5. Log
    this.logger.info('Policy created', { policyId: saved.id, userId });

    return saved;
  }
}
```

### 3.3. Error Handling

```typescript
// ✅ Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(details: any) {
    super(400, 'VALIDATION_ERROR', 'Invalid input data', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} with id ${id} not found`);
  }
}

export class BusinessError extends AppError {
  constructor(code: string, message: string) {
    super(422, code, message);
  }
}

// ✅ Global error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    // Unknown error - log full error, return generic message
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 3.4. API Response Format

```typescript
// ✅ Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}
```

---

## 4. Frontend Standards (React)

### 4.1. Component Structure

```typescript
// ✅ Standard functional component
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types
interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  isCompared?: boolean;
}

// Component
export function ProductCard({ product, onSelect, isCompared = false }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = useCallback(() => {
    onSelect(product.id);
  }, [product.id, onSelect]);

  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600 mt-1">{product.shortDescription}</p>
      <button
        onClick={handleSelect}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Chọn sản phẩm
      </button>
    </div>
  );
}
```

### 4.2. Custom Hooks

```typescript
// ✅ Custom hook for data fetching
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

// ✅ Custom hook for mutations
export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePolicyDTO) => policyApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Tạo hợp đồng thành công!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
```

### 4.3. State Management (Zustand)

```typescript
// ✅ Zustand store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

---

## 5. Database Standards

### 5.1. Naming Conventions (PostgreSQL)

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `users`, `policies`, `claim_documents` |
| Columns | snake_case | `full_name`, `created_at`, `policy_number` |
| Primary Key | `id` (UUID) | `id UUID PRIMARY KEY` |
| Foreign Key | `{table_singular}_id` | `customer_id`, `policy_id` |
| Indexes | `idx_{table}_{columns}` | `idx_policies_customer_id` |
| Unique | `uq_{table}_{columns}` | `uq_users_email` |
| Constraints | `ck_{table}_{description}` | `ck_policies_status` |

### 5.2. Migration Standards

```typescript
// ✅ Migration naming: {timestamp}-{description}.ts
// Example: 1715760000000-create-users-table.ts

export class CreateUsersTable1715760000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_phone ON users(phone);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}
```

---

## 6. Git Standards

### 6.1. Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Refactoring (no feature change) |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Build, CI, dependencies |

**Examples:**
```
feat(auth): implement JWT refresh token rotation
fix(payment): handle VNPay timeout callback correctly
docs(api): add OpenAPI spec for quotes endpoint
refactor(policy): extract underwriting logic to separate service
```

### 6.2. Branch Naming

```
<type>/<ticket-id>-<short-description>

Examples:
feature/INS-123-user-registration
bugfix/INS-456-payment-timeout
hotfix/INS-789-security-patch
docs/INS-101-api-documentation
refactor/INS-202-extract-pricing-engine
```

### 6.3. Pull Request Standards

- Title: Same format as commit message
- Description: What, Why, How + Testing done
- Max 400 lines changed per PR (prefer smaller PRs)
- Must have at least 1 approval
- All CI checks must pass
- No merge conflicts

---

## 7. Testing Standards

### 7.1. Test File Naming

```
src/modules/auth/services/auth.service.ts
src/modules/auth/services/auth.service.spec.ts       (unit test)
src/modules/auth/services/auth.service.integration.ts (integration test)
```

### 7.2. Test Structure (AAA Pattern)

```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens when credentials are valid', async () => {
      // Arrange
      const dto: LoginDTO = { email: 'test@example.com', password: 'Password1!' };
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(dto);

      // Assert
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw when user not found', async () => {
      // Arrange
      const dto: LoginDTO = { email: 'nonexist@example.com', password: 'Pass1!' };
      mockUserRepo.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(dto)).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### 7.3. Coverage Requirements

| Layer | Minimum Coverage |
|-------|-----------------|
| Services (business logic) | 80% |
| Controllers | 70% |
| Utilities | 90% |
| Integration tests | 60% (critical paths) |
| E2E tests | Key user journeys |

---

## 8. Code Review Checklist

- [ ] Code follows naming conventions
- [ ] No `any` types (use `unknown` + type guards)
- [ ] Error handling is proper (no swallowed errors)
- [ ] No sensitive data in logs (PII masked)
- [ ] Input validation present
- [ ] SQL injection safe (parameterized queries)
- [ ] Unit tests added for new logic
- [ ] No hardcoded values (use constants/config)
- [ ] API responses follow standard format
- [ ] No console.log (use Logger)
- [ ] Proper HTTP status codes
- [ ] Documentation updated (if API changed)
