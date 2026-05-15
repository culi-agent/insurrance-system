# Contributing Guide

## Chào mừng đến với Insurance System!

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án. Tài liệu này sẽ hướng dẫn bạn quy trình đóng góp code một cách hiệu quả.

## Mục lục

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Submission Guidelines](#submission-guidelines)

---

## Code of Conduct

### Nguyên tắc cơ bản

- **Tôn trọng**: Tôn trọng ý kiến và đóng góp của mọi người
- **Xây dựng**: Đưa ra feedback mang tính xây dựng
- **Hợp tác**: Sẵn sàng hỗ trợ đồng nghiệp
- **Chất lượng**: Luôn hướng tới code chất lượng cao
- **Trách nhiệm**: Chịu trách nhiệm với code mình viết

### Hành vi không chấp nhận

- Sử dụng ngôn ngữ xúc phạm
- Trolling hoặc comment mang tính tấn công cá nhân
- Public hoặc private harassment
- Push code chưa qua review lên branch chính

---

## Getting Started

### 1. Fork & Clone

```bash
# Clone repository
git clone <repository-url>
cd insurrance-system

# Add upstream remote
git remote add upstream <upstream-url>
```

### 2. Setup Development Environment

```bash
# Backend
cd be
cp .env.example .env
npm install

# Frontend
cd ../fe
npm install
```

### 3. Verify Setup

```bash
# Backend - should start without errors
cd be && npm run dev

# Frontend - should start without errors
cd fe && npm run dev
```

### 4. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### Quy trình đóng góp

```
1. Tạo Issue (nếu chưa có)
       ↓
2. Assign Issue cho bản thân
       ↓
3. Tạo Feature Branch
       ↓
4. Viết code + Tests
       ↓
5. Commit với Conventional Commits
       ↓
6. Push & Tạo Pull Request
       ↓
7. Code Review
       ↓
8. Merge vào develop
```

### Quy tắc Branch

| Loại | Format | Ví dụ |
|------|--------|-------|
| Feature | `feature/short-description` | `feature/add-policy-search` |
| Bug fix | `fix/short-description` | `fix/login-validation-error` |
| Hotfix | `hotfix/short-description` | `hotfix/payment-crash` |
| Docs | `docs/short-description` | `docs/api-documentation` |
| Refactor | `refactor/short-description` | `refactor/auth-service` |

---

## Coding Standards

### TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types
interface PolicyResponse {
  id: string;
  policyNumber: string;
  status: PolicyStatus;
  createdAt: Date;
}

// ❌ DON'T: Use 'any' type
function processData(data: any): any { ... }

// ✅ DO: Use enums for fixed values
enum PolicyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ✅ DO: Use descriptive variable names
const activePolicies = policies.filter(p => p.status === PolicyStatus.ACTIVE);

// ❌ DON'T: Use abbreviations
const ap = p.filter(x => x.s === 'ACTIVE');
```

### File Organization

```
// Backend file structure
src/
├── modules/
│   └── policy/
│       ├── policy.controller.ts
│       ├── policy.service.ts
│       ├── policy.model.ts
│       ├── policy.routes.ts
│       ├── policy.validation.ts
│       ├── policy.types.ts
│       └── __tests__/
│           ├── policy.controller.test.ts
│           └── policy.service.test.ts
```

### Naming Conventions

| Item | Convention | Ví dụ |
|------|-----------|-------|
| Files | kebab-case | `policy-service.ts` |
| Classes | PascalCase | `PolicyService` |
| Interfaces | PascalCase + prefix 'I' (optional) | `PolicyResponse` |
| Functions | camelCase | `calculatePremium()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variables | camelCase | `policyList` |
| Enums | PascalCase | `PolicyStatus` |
| Components (React) | PascalCase | `PolicyCard.tsx` |

---

## Testing Requirements

### Coverage yêu cầu

| Layer | Minimum Coverage |
|-------|-----------------|
| Services (Business Logic) | 80% |
| Controllers | 70% |
| Utils | 90% |
| Components (FE) | 70% |

### Loại test yêu cầu

1. **Unit Tests**: Cho mọi service và utility function
2. **Integration Tests**: Cho API endpoints
3. **Component Tests**: Cho React components (nếu có logic phức tạp)

### Test Naming Convention

```typescript
describe('PolicyService', () => {
  describe('calculatePremium', () => {
    it('should return correct premium for life insurance with age 30', () => {
      // Arrange
      const input = { type: 'LIFE', age: 30, coverage: 1000000 };
      
      // Act
      const result = policyService.calculatePremium(input);
      
      // Assert
      expect(result).toBe(25000);
    });

    it('should throw error when age is below minimum', () => {
      // ...
    });
  });
});
```

---

## Submission Guidelines

### Trước khi tạo PR

- [ ] Code đã pass lint: `npm run lint`
- [ ] Tests đã pass: `npm run test`
- [ ] Build thành công: `npm run build`
- [ ] Đã viết/cập nhật tests cho code mới
- [ ] Đã cập nhật documentation nếu cần
- [ ] Commit messages tuân thủ Conventional Commits
- [ ] Branch đã rebase với develop mới nhất

### Pull Request Template

Khi tạo PR, đảm bảo:

1. **Title** rõ ràng, mô tả thay đổi chính
2. **Description** chi tiết những gì đã thay đổi và tại sao
3. **Screenshots** cho UI changes
4. **Testing** mô tả cách test
5. **Related Issues** link tới issue liên quan

### Review Process

1. Ít nhất **2 approvals** từ team members
2. Tất cả comments phải được resolved
3. CI/CD pipeline phải pass
4. Không có merge conflicts

### Sau khi merge

- Delete feature branch
- Verify deployment (nếu auto-deploy)
- Close related issues
- Thông báo team nếu có breaking changes

---

## Câu hỏi?

Nếu bạn có bất kỳ câu hỏi nào, hãy:

1. Kiểm tra tài liệu trong `/docs`
2. Hỏi trong channel #dev-insurance trên Slack
3. Tạo Discussion trên GitHub

Cảm ơn bạn đã đóng góp! 🚀
