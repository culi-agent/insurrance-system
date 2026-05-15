# Code Review Checklist

## Tổng quan

Tài liệu này cung cấp checklist chi tiết cho quá trình code review, giúp reviewer đánh giá PR một cách nhất quán và toàn diện.

---

## Review Mindset

### Nguyên tắc

1. **Tôn trọng**: Code review là về code, không phải con người
2. **Xây dựng**: Đề xuất giải pháp, không chỉ chỉ ra vấn đề
3. **Học hỏi**: Mỗi review là cơ hội học từ nhau
4. **Kịp thời**: Review trong thời gian SLA
5. **Rõ ràng**: Comment phải actionable và cụ thể

### Comment Types

| Prefix | Ý nghĩa | Bắt buộc fix? |
|--------|---------|---------------|
| `[MUST]` | Vấn đề phải fix trước merge | ✅ Yes |
| `[SHOULD]` | Strongly recommended | ⚠️ Preferred |
| `[COULD]` | Nice to have | ❌ Optional |
| `[QUESTION]` | Cần clarification | - |
| `[NIT]` | Nitpick, cosmetic | ❌ Optional |
| `[PRAISE]` | Khen code tốt | - |

---

## Checklist cho Reviewer

### 1. Correctness (Tính đúng đắn)

- [ ] Logic có đúng với requirements không?
- [ ] Edge cases đã được handle chưa?
- [ ] Error handling có đầy đủ không?
- [ ] Race conditions có thể xảy ra không?
- [ ] Null/undefined đã check chưa?
- [ ] Boundary conditions (empty arrays, zero values, max values)?
- [ ] Off-by-one errors?

### 2. Security

- [ ] Input validation đầy đủ (SQL injection, XSS)?
- [ ] Authentication check ở đúng chỗ?
- [ ] Authorization/permission check?
- [ ] Sensitive data có bị expose trong logs không?
- [ ] API keys/secrets có hardcode không?
- [ ] CORS configuration đúng?
- [ ] Rate limiting cho sensitive endpoints?
- [ ] Data sanitization trước khi lưu DB?

### 3. Performance

- [ ] N+1 query problem?
- [ ] Unnecessary database calls?
- [ ] Missing database indexes cho queries mới?
- [ ] Large payload response (cần pagination)?
- [ ] Memory leaks (event listeners, subscriptions)?
- [ ] Unnecessary re-renders (React)?
- [ ] Caching opportunities?
- [ ] Async operations có parallel khi có thể?

### 4. Code Quality

- [ ] Tuân thủ style guide?
- [ ] DRY - không duplicate code?
- [ ] Single Responsibility Principle?
- [ ] Naming rõ ràng, self-documenting?
- [ ] Complexity hợp lý (< 10 cyclomatic)?
- [ ] Functions ngắn gọn (< 30 lines)?
- [ ] Không có dead code hoặc commented-out code?
- [ ] Magic numbers → named constants?

### 5. Architecture & Design

- [ ] Đúng layer (controller → service → repository)?
- [ ] Separation of concerns?
- [ ] Dependency injection đúng?
- [ ] Interface/abstraction phù hợp?
- [ ] Consistent với patterns hiện tại của project?
- [ ] Không introduce circular dependencies?
- [ ] API design RESTful và consistent?

### 6. Testing

- [ ] Unit tests cho business logic mới?
- [ ] Test cases cover happy path + error path?
- [ ] Edge cases được test?
- [ ] Tests có meaningful assertions?
- [ ] Test names mô tả rõ behavior?
- [ ] Không depend on test execution order?
- [ ] Mocks/stubs phù hợp?
- [ ] Coverage không giảm?

### 7. Documentation

- [ ] Complex logic có comments giải thích WHY?
- [ ] Public APIs có JSDoc/documentation?
- [ ] README updated nếu có setup changes?
- [ ] API docs updated cho endpoints mới?
- [ ] CHANGELOG entry đã thêm?
- [ ] Migration guide cho breaking changes?

### 8. TypeScript Specific

- [ ] Không sử dụng `any` type?
- [ ] Types/interfaces đầy đủ và chính xác?
- [ ] Generic types có constraints?
- [ ] Union types thay vì enum khi phù hợp?
- [ ] Type guards cho type narrowing?
- [ ] Return types explicit cho public methods?
- [ ] Proper use of `readonly` khi cần?

### 9. React Specific (Frontend)

- [ ] Component size hợp lý (< 200 lines)?
- [ ] Props interface đầy đủ?
- [ ] `useEffect` dependencies đúng?
- [ ] `useMemo`/`useCallback` khi cần thiết (không premature)?
- [ ] State management phù hợp (local vs global)?
- [ ] Loading/error states handled?
- [ ] Accessibility (a11y) attributes?
- [ ] Responsive design?
- [ ] Key prop cho lists?

### 10. API & Database

- [ ] API response format nhất quán?
- [ ] HTTP status codes đúng?
- [ ] Validation ở cả client và server?
- [ ] Database migrations reversible?
- [ ] Indexes cho foreign keys và queries?
- [ ] Transaction handling cho operations liên quan?
- [ ] Data integrity constraints?

---

## Review Flow

### Step-by-step Review Process

```
1. Đọc PR description & related issue
       ↓
2. Check high-level: file changes, architecture
       ↓
3. Review code chi tiết (theo checklist)
       ↓
4. Run code locally (nếu cần)
       ↓
5. Verify tests pass
       ↓
6. Leave comments
       ↓
7. Submit review (Approve / Request Changes / Comment)
```

### Khi nào Approve?

✅ Approve khi:
- Tất cả `[MUST]` items đã resolved
- Logic đúng và tested
- Không có security concerns
- Code quality acceptable

### Khi nào Request Changes?

❌ Request Changes khi:
- Có bugs rõ ràng
- Security vulnerabilities
- Missing critical tests
- Architecture concerns lớn
- Breaking existing functionality

---

## Comment Examples

### Good Comments ✅

```markdown
[MUST] This query doesn't have pagination. With potentially thousands 
of policies per customer, this could cause memory issues and slow response.

Suggestion: Add cursor-based pagination:
```typescript
const policies = await this.policyRepo.find({
  where: { customerId },
  take: limit,
  skip: offset,
  order: { createdAt: 'DESC' },
});
```
```

```markdown
[SHOULD] Consider extracting this validation logic into a separate 
`PolicyValidator` class. It's getting complex and would be easier to test.
```

```markdown
[PRAISE] Nice use of the Strategy pattern here for premium calculation! 
Makes it very easy to add new insurance types in the future.
```

### Bad Comments ❌

```markdown
# Too vague
This is wrong.

# No suggestion
This code is not clean.

# Condescending
You should know better than to use any here.

# Nitpicking on style (should be caught by linter)
Use single quotes here.
```

---

## Review Metrics

### Team Targets

| Metric | Target |
|--------|--------|
| Time to first review | < 4 hours |
| Time to approval | < 1 business day |
| Review rounds | ≤ 2 rounds |
| Comments per PR (avg) | 3-8 comments |
| PR rejection rate | < 10% |

### Review Quality Indicators

- **Bugs found in production** ↓ = Review effective
- **Review turnaround time** ↓ = Team responsive
- **PR size** ↓ = Better quality reviews
- **Re-review rounds** ↓ = Clear communication

---

## Quick Reference for Authors

### Before Requesting Review

```markdown
✅ Pre-review self-check:
- [ ] Đã self-review code changes
- [ ] lint & tests pass
- [ ] PR description đầy đủ
- [ ] PR size hợp lý (< 200 LOC preferred)
- [ ] Không include unrelated changes
- [ ] Branch up-to-date với target
```

### Responding to Feedback

1. **Acknowledge** mọi comment (react hoặc reply)
2. **Fix** hoặc **explain** lý do không fix
3. **Resolve** conversations sau khi address
4. **Re-request** review sau khi update
