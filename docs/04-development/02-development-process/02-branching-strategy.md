# Branching Strategy

## Tổng quan

Dự án Insurance System áp dụng mô hình **Modified Git Flow** với các branch có mục đích rõ ràng, đảm bảo code quality và deployment stability.

---

## Branch Types

### Long-lived Branches

| Branch | Mục đích | Deploy to | Protected |
|--------|---------|-----------|-----------|
| `main` | Production code | Production | ✅ |
| `develop` | Integration branch | Staging | ✅ |

### Short-lived Branches

| Type | Pattern | Tạo từ | Merge vào | Lifetime |
|------|---------|--------|-----------|----------|
| Feature | `feature/<name>` | `develop` | `develop` | ≤ 1 tuần |
| Bug Fix | `fix/<name>` | `develop` | `develop` | ≤ 3 ngày |
| Hotfix | `hotfix/<name>` | `main` | `main` + `develop` | ≤ 1 ngày |
| Release | `release/<version>` | `develop` | `main` + `develop` | ≤ 3 ngày |
| Docs | `docs/<name>` | `develop` | `develop` | ≤ 3 ngày |
| Refactor | `refactor/<name>` | `develop` | `develop` | ≤ 1 tuần |
| Experiment | `experiment/<name>` | `develop` | `develop` hoặc delete | Flexible |

---

## Naming Convention

### Format

```
<type>/<short-description>
```

### Rules

1. Sử dụng **lowercase** và **kebab-case**
2. Mô tả ngắn gọn, tối đa **50 ký tự**
3. Có thể thêm **issue number** nếu cần

### Ví dụ

```bash
# Features
feature/add-policy-search
feature/user-authentication
feature/premium-calculator
feature/INS-123-payment-integration

# Bug Fixes
fix/login-validation-error
fix/premium-rounding-issue
fix/INS-456-email-notification

# Hotfixes
hotfix/payment-gateway-crash
hotfix/security-token-leak

# Releases
release/1.0.0
release/1.1.0-beta

# Documentation
docs/api-documentation
docs/development-guide

# Refactoring
refactor/auth-service-cleanup
refactor/database-queries-optimization
```

### Anti-patterns ❌

```bash
# Quá ngắn, không rõ ý
feature/fix
feature/update

# Quá dài
feature/add-new-policy-search-functionality-with-advanced-filters-and-sorting

# Sai format
Feature/AddPolicySearch
FEATURE/add_policy_search
feature/Add Policy Search
```

---

## Branch Protection Rules

### `main` Branch

| Rule | Giá trị |
|------|---------|
| Require PR before merge | ✅ |
| Required approvals | 2 |
| Dismiss stale approvals | ✅ |
| Require status checks | ✅ (CI pass) |
| Require branch up to date | ✅ |
| Include administrators | ✅ |
| Allow force push | ❌ |
| Allow deletion | ❌ |

### `develop` Branch

| Rule | Giá trị |
|------|---------|
| Require PR before merge | ✅ |
| Required approvals | 1 |
| Dismiss stale approvals | ✅ |
| Require status checks | ✅ (CI pass) |
| Require branch up to date | ❌ |
| Include administrators | ❌ |
| Allow force push | ❌ |
| Allow deletion | ❌ |

---

## Branch Lifecycle

### Feature Branch Lifecycle

```
┌─────────────────────────────────────────────────┐
│                Feature Branch                     │
├─────────────────────────────────────────────────┤
│                                                   │
│  1. CREATE        git checkout -b feature/xxx     │
│       ↓                                           │
│  2. DEVELOP       commits + pushes                │
│       ↓                                           │
│  3. SYNC          rebase develop                  │
│       ↓                                           │
│  4. PR            create pull request             │
│       ↓                                           │
│  5. REVIEW        code review + CI                │
│       ↓                                           │
│  6. MERGE         squash merge → develop          │
│       ↓                                           │
│  7. DELETE         cleanup branch                 │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Release Branch Lifecycle

```
┌─────────────────────────────────────────────────┐
│                Release Branch                     │
├─────────────────────────────────────────────────┤
│                                                   │
│  1. CREATE        from develop (feature freeze)   │
│       ↓                                           │
│  2. STABILIZE     bug fixes only                  │
│       ↓                                           │
│  3. TEST          QA on staging                   │
│       ↓                                           │
│  4. FINALIZE      version bump + changelog        │
│       ↓                                           │
│  5. MERGE         → main (tag) + → develop        │
│       ↓                                           │
│  6. DELETE         cleanup branch                 │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Merge Strategies

| Scenario | Strategy | Reason |
|----------|----------|--------|
| Feature → develop | **Squash merge** | Clean history, 1 commit per feature |
| Fix → develop | **Squash merge** | Clean history |
| Release → main | **Merge commit** | Preserve release context |
| Hotfix → main | **Merge commit** | Preserve hotfix context |
| Release/Hotfix → develop | **Merge commit** | Preserve history |

### Squash Merge Message Format

```
feat(policy): add policy search with advanced filters (#123)

- Implement search API endpoint with pagination
- Add filter by type, status, date range
- Include unit tests for search service
```

---

## Stale Branch Policy

### Quy tắc

| Điều kiện | Hành động |
|-----------|----------|
| Branch > 7 ngày không có commit | Warning notification |
| Branch > 14 ngày không có commit | Auto-close PR, notify owner |
| Branch > 30 ngày không có commit | Auto-delete branch |
| Merged branches | Auto-delete sau merge |

### Exceptions

- `release/*` branches có thể tồn tại đến khi release hoàn tất
- `experiment/*` branches có thể request extension

---

## Environments Mapping

```
Branch          → Environment      → URL
─────────────────────────────────────────────────
main            → Production       → insurance.example.com
develop         → Staging          → staging.insurance.example.com
release/*       → UAT              → uat.insurance.example.com
feature/*       → Preview (auto)   → pr-123.insurance.example.com
```

---

## Quick Reference

```bash
# Tạo feature mới
git checkout develop && git pull
git checkout -b feature/my-feature

# Sync với develop
git fetch origin
git rebase origin/develop

# Ready to merge
git push -u origin feature/my-feature
# → Create PR on GitHub

# Sau khi merge
git checkout develop && git pull
git branch -d feature/my-feature
```
