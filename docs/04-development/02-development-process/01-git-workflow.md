# Git Workflow

## Tổng quan

Dự án Insurance System sử dụng **Git Flow** đã được tùy chỉnh, kết hợp giữa Git Flow truyền thống và trunk-based development để phù hợp với quy mô team và tốc độ phát triển.

---

## Workflow Diagram

```
main (production)
  │
  ├── release/1.0.0 ─────────────────────── → tag v1.0.0 → merge → main
  │                                              │
  ├── develop (integration)                      │
  │     │                                        │
  │     ├── feature/add-policy-search ──── → PR → develop
  │     ├── feature/payment-integration ── → PR → develop
  │     └── fix/login-validation ───────── → PR → develop
  │
  └── hotfix/payment-crash ────────────────── → PR → main + develop
```

---

## Branches chính

### `main` (Production)

- Luôn ở trạng thái **production-ready**
- Chỉ nhận merge từ `release/*` hoặc `hotfix/*`
- Mỗi merge tạo một **tag** version
- **Protected branch**: không ai push trực tiếp

### `develop` (Integration)

- Branch tích hợp cho development
- Nhận merge từ tất cả feature/fix branches
- Tự động deploy lên **staging environment**
- **Protected branch**: yêu cầu PR + review

---

## Quy trình làm việc hàng ngày

### 1. Bắt đầu Feature mới

```bash
# Đảm bảo develop mới nhất
git checkout develop
git pull origin develop

# Tạo feature branch
git checkout -b feature/add-claim-submission

# Làm việc...
git add .
git commit -m "feat(claims): add claim submission form"

# Push lên remote
git push -u origin feature/add-claim-submission
```

### 2. Cập nhật branch với develop

```bash
# Rebase với develop mới nhất (preferred)
git checkout feature/add-claim-submission
git fetch origin
git rebase origin/develop

# Hoặc merge nếu branch đã shared
git merge origin/develop
```

### 3. Tạo Pull Request

```bash
# Đảm bảo code clean
npm run lint
npm run test
npm run build

# Push final changes
git push origin feature/add-claim-submission

# Tạo PR trên GitHub: feature/add-claim-submission → develop
```

### 4. Sau khi PR được merge

```bash
# Switch về develop
git checkout develop
git pull origin develop

# Xóa branch local
git branch -d feature/add-claim-submission

# Xóa branch remote (nếu chưa auto-delete)
git push origin --delete feature/add-claim-submission
```

---

## Quy trình Release

### 1. Tạo Release Branch

```bash
# Từ develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Cập nhật version
npm version 1.2.0 --no-git-tag-version
# Update CHANGELOG.md
```

### 2. Testing & Bug Fixes trên Release Branch

```bash
# Fix bugs trực tiếp trên release branch
git commit -m "fix(release): correct premium calculation rounding"
```

### 3. Hoàn tất Release

```bash
# Merge vào main
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge ngược về develop
git checkout develop
git merge --no-ff release/1.2.0
git push origin develop

# Xóa release branch
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```

---

## Quy trình Hotfix

### Khi nào sử dụng Hotfix?

- Bug critical trên production
- Security vulnerability
- Data corruption issue

### Quy trình

```bash
# Tạo hotfix từ main
git checkout main
git pull origin main
git checkout -b hotfix/fix-payment-crash

# Fix bug
git commit -m "fix(payment): resolve crash on concurrent payments"

# Merge vào main
git checkout main
git merge --no-ff hotfix/fix-payment-crash
git tag -a v1.1.1 -m "Hotfix: payment crash"
git push origin main --tags

# Merge vào develop
git checkout develop
git merge --no-ff hotfix/fix-payment-crash
git push origin develop

# Cleanup
git branch -d hotfix/fix-payment-crash
```

---

## Quy tắc quan trọng

### DO ✅

- Luôn tạo branch từ `develop` cho features
- Rebase trước khi tạo PR (giữ history clean)
- Viết commit messages theo Conventional Commits
- Squash commits không cần thiết trước khi merge
- Pull request phải có description rõ ràng
- Delete branch sau khi merge

### DON'T ❌

- Push trực tiếp lên `main` hoặc `develop`
- Force push lên shared branches
- Merge branch chưa qua review
- Để branch tồn tại quá 1 tuần không merge
- Commit trực tiếp lên release branch (trừ bug fixes)

---

## Git Hooks (Husky)

### Pre-commit

```bash
# Chạy tự động trước mỗi commit
- Lint staged files (lint-staged)
- Format code (prettier)
- Type check (tsc --noEmit)
```

### Commit-msg

```bash
# Validate commit message format
- Conventional Commits format check
```

### Pre-push

```bash
# Chạy trước khi push
- Run unit tests
- Build check
```

---

## Conflict Resolution

### Quy trình giải quyết conflict

1. **Pull/Rebase** latest changes từ target branch
2. **Resolve** conflicts manually
3. **Test** sau khi resolve
4. **Commit** resolution
5. **Push** và update PR

### Tips

```bash
# Xem files bị conflict
git status

# Dùng tool để resolve
git mergetool

# Abort nếu cần
git rebase --abort
git merge --abort
```

---

## Tham khảo

- [Conventional Commits](../02-development-process/03-commit-convention.md)
- [Branching Strategy](../02-development-process/02-branching-strategy.md)
- [Pull Request Template](../02-development-process/04-pull-request-template.md)
