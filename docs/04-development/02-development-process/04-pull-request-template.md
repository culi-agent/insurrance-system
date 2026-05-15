# Pull Request Template

## Tổng quan

Tài liệu này định nghĩa template và quy tắc cho Pull Request trong dự án Insurance System.

---

## PR Template

Sử dụng template sau khi tạo Pull Request trên GitHub:

```markdown
## 📋 Description

<!-- Mô tả ngắn gọn thay đổi chính -->

### What does this PR do?
- 

### Why is this change needed?
- 

---

## 🔗 Related Issues

<!-- Link tới issues liên quan -->
- Closes #
- Refs #

---

## 🔄 Type of Change

<!-- Đánh dấu loại thay đổi -->
- [ ] 🆕 Feature (tính năng mới)
- [ ] 🐛 Bug fix (sửa lỗi)
- [ ] 🔨 Refactor (không thay đổi functionality)
- [ ] 📝 Documentation (chỉ thay đổi docs)
- [ ] 🎨 Style (formatting, không ảnh hưởng logic)
- [ ] ⚡ Performance (cải thiện hiệu suất)
- [ ] 🧪 Test (thêm/sửa tests)
- [ ] 🔧 Config/Build (CI/CD, build tools)
- [ ] ⚠️ Breaking Change (thay đổi không backward-compatible)

---

## 📸 Screenshots / Demo

<!-- Nếu có thay đổi UI, thêm screenshots -->

| Before | After |
|--------|-------|
| (screenshot) | (screenshot) |

---

## 🧪 Testing

### How has this been tested?
<!-- Mô tả cách đã test -->
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

### Test instructions
<!-- Steps để reviewer có thể verify -->
1. 
2. 
3. 

---

## ✅ Checklist

### Code Quality
- [ ] Code tuân thủ style guide của project
- [ ] Không có `console.log` hoặc debug code
- [ ] Không có `any` type trong TypeScript
- [ ] Error handling đầy đủ
- [ ] Không có hardcoded values (dùng constants/config)

### Testing
- [ ] Unit tests đã pass
- [ ] Đã thêm tests cho logic mới
- [ ] Test coverage không giảm

### Documentation
- [ ] Code có comments cho logic phức tạp
- [ ] API documentation đã cập nhật (nếu có)
- [ ] CHANGELOG đã cập nhật
- [ ] README đã cập nhật (nếu cần)

### Deployment
- [ ] Migrations đã được review
- [ ] Environment variables mới đã document
- [ ] Không có breaking changes (hoặc đã document)
- [ ] Backward compatible

---

## 📝 Additional Notes

<!-- Bất kỳ thông tin bổ sung cho reviewer -->

---

## 🚀 Deployment Notes

<!-- Có cần thao tác đặc biệt khi deploy không? -->
- [ ] Cần chạy migration
- [ ] Cần thêm environment variables
- [ ] Cần update infrastructure
- [ ] Không cần thao tác đặc biệt
```

---

## PR Rules

### Title Format

```
<type>(<scope>): <short description> (#issue-number)
```

**Ví dụ:**
```
feat(policy): add policy search with filters (#123)
fix(auth): resolve token refresh race condition (#456)
docs(api): update payment endpoint documentation (#789)
```

### Size Guidelines

| Size | Lines Changed | Review Time | Recommendation |
|------|--------------|-------------|----------------|
| XS | 1-10 | 5 min | ✅ Ideal |
| S | 11-50 | 15 min | ✅ Good |
| M | 51-200 | 30 min | ⚠️ Acceptable |
| L | 201-500 | 1 hour | ⚠️ Consider splitting |
| XL | 500+ | 2+ hours | ❌ Must split |

### Quy tắc

1. **Một PR = Một mục đích**: Không mix feature + refactor + bug fix
2. **Nhỏ nhất có thể**: Dễ review, dễ revert, ít risk
3. **Self-contained**: PR phải có thể deploy độc lập
4. **Tested**: Phải có evidence là code hoạt động

---

## Review Process

### Workflow

```
Developer tạo PR
       ↓
Auto-assign reviewers (CODEOWNERS)
       ↓
CI/CD pipeline chạy
       ↓
Reviewers review code
       ↓
Developer address feedback
       ↓
Re-review (nếu có changes lớn)
       ↓
Approve (min 1-2 approvals)
       ↓
Merge (squash merge)
       ↓
Auto-delete branch
```

### Reviewer Assignment

| Module | Primary Reviewer | Backup |
|--------|-----------------|--------|
| Backend - Auth | Tech Lead | Senior BE |
| Backend - Business Logic | Senior BE | Tech Lead |
| Frontend - UI | Senior FE | FE Dev |
| Frontend - State | Senior FE | Tech Lead |
| Database | Tech Lead | DBA |
| DevOps | DevOps Lead | Tech Lead |

### Response Time SLA

| Priority | First Review | Approval |
|----------|-------------|----------|
| Critical (hotfix) | 2 hours | 4 hours |
| High | 4 hours | 1 business day |
| Normal | 1 business day | 2 business days |
| Low (docs) | 2 business days | 3 business days |

---

## Labels

| Label | Color | Mô tả |
|-------|-------|--------|
| `feature` | 🟢 green | Tính năng mới |
| `bug` | 🔴 red | Bug fix |
| `docs` | 🔵 blue | Documentation |
| `refactor` | 🟡 yellow | Code refactoring |
| `breaking` | 🟠 orange | Breaking change |
| `needs-review` | 🟣 purple | Cần review |
| `WIP` | ⚪ gray | Work in progress |
| `ready-to-merge` | 🟢 green | Đã approved, sẵn sàng merge |
| `blocked` | 🔴 red | Bị block bởi issue khác |

---

## GitHub Actions Integration

### Required Checks

```yaml
# .github/workflows/pr-check.yml
name: PR Checks
on:
  pull_request:
    branches: [develop, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:coverage
      - name: Check coverage threshold
        run: |
          # Fail if coverage < 70%
```

---

## CODEOWNERS File

```
# .github/CODEOWNERS

# Default - Tech Lead reviews everything
* @tech-lead

# Backend
/be/src/modules/auth/ @senior-be @tech-lead
/be/src/modules/policy/ @senior-be
/be/src/modules/payment/ @senior-be @tech-lead

# Frontend
/fe/src/components/ @senior-fe
/fe/src/pages/ @senior-fe
/fe/src/stores/ @senior-fe @tech-lead

# Infrastructure
/docker/ @devops-lead
/.github/ @devops-lead @tech-lead

# Documentation
/docs/ @tech-lead
```
