# Style Guide - Hướng Dẫn Phong Cách

---

## 1. Brand Identity

### 1.1. Logo Usage

| Usage | Specification |
|-------|--------------|
| Primary logo | Full color on white/light backgrounds |
| Reversed logo | White on dark/colored backgrounds |
| Minimum size | 120px width (digital), 30mm (print) |
| Clear space | Equal to height of "I" in logo on all sides |
| Forbidden | Don't stretch, rotate, add effects, change colors |

### 1.2. Brand Colors

| Color | Primary Use | Hex | RGB |
|-------|------------|-----|-----|
| **Insurance Blue** | Primary brand color | #2563EB | 37, 99, 235 |
| **Trust Navy** | Headers, dark text | #1E3A8A | 30, 58, 138 |
| **Action Orange** | CTAs, highlights | #F97316 | 249, 115, 22 |
| **Success Green** | Confirmations, positive | #22C55E | 34, 197, 94 |
| **Clean White** | Backgrounds, space | #FFFFFF | 255, 255, 255 |
| **Soft Gray** | Backgrounds, subtle | #F9FAFB | 249, 250, 251 |

### 1.3. Brand Voice & Tone

| Attribute | We Are | We Are Not |
|-----------|--------|-----------|
| **Friendly** | Warm, approachable, conversational | Overly casual, slang |
| **Clear** | Simple, jargon-free, direct | Vague, ambiguous |
| **Trustworthy** | Honest, transparent, reliable | Pushy, salesy |
| **Knowledgeable** | Helpful, informative, confident | Condescending, arrogant |
| **Empathetic** | Understanding, supportive | Cold, robotic |

---

## 2. Writing Style

### 2.1. UI Copy Guidelines

| Context | Do | Don't |
|---------|-----|-------|
| Buttons | "Nhận báo giá", "Mua ngay" | "Click here", "Submit" |
| Errors | "Vui lòng nhập email hợp lệ" | "Invalid input" |
| Empty states | "Chưa có hợp đồng nào. Bắt đầu bảo vệ bản thân!" | "No data" |
| Loading | "Đang tìm giá tốt nhất..." | "Loading..." |
| Success | "Chúc mừng! Bạn đã được bảo vệ!" | "Success" |
| Confirm | "Bạn chắc chắn muốn hủy?" | "Are you sure?" |

### 2.2. Insurance Terminology - Plain Language

| Technical Term | Plain Vietnamese |
|---------------|-----------------|
| Premium | Phí bảo hiểm |
| Sum Insured | Số tiền bảo hiểm tối đa |
| Deductible | Mức bạn tự chi trả |
| Copay | Phần bạn đồng chi trả (%) |
| Exclusion | Trường hợp KHÔNG được bảo hiểm |
| Waiting Period | Thời gian chờ (chưa được dùng quyền lợi) |
| Endorsement | Thay đổi hợp đồng |
| Rider | Quyền lợi bổ sung (thêm tiền) |
| Underwriting | Xét duyệt hồ sơ |
| Claim | Yêu cầu bồi thường |
| Policy | Hợp đồng bảo hiểm |
| Beneficiary | Người thụ hưởng |
| Grace period | Thời gian gia hạn đóng phí |

### 2.3. Number & Date Formatting

| Type | Format | Example |
|------|--------|---------|
| Currency | X,XXX,XXX VND | 7,800,000 VND |
| Short currency | X.XM | 7.8M VND |
| Date | DD/MM/YYYY | 15/05/2026 |
| Date (display) | DD Tháng MM, YYYY | 15 Tháng 05, 2026 |
| Relative date | X ngày trước | 3 ngày trước |
| Percentage | XX% | 25% |
| Phone | +84 XXX XXX XXXX | +84 909 123 456 |

---

## 3. Visual Style

### 3.1. Photography

| Usage | Style | Notes |
|-------|-------|-------|
| Hero images | Authentic Vietnamese people, warm lighting | Avoid stock-photo feel |
| Product imagery | Clean, simple, on-brand colors | Use illustrations for abstract concepts |
| Testimonials | Real customer photos (with consent) | Natural, not posed |
| Blog/Content | High quality, relevant, diverse | Include Vietnamese context |

**Photo Guidelines:**
- Diverse representation (age, gender, ethnicity)
- Natural settings (home, office, street in VN)
- Warm, optimistic mood
- Avoid: overly corporate, staged, Western-only imagery

### 3.2. Illustrations

| Style | Usage |
|-------|-------|
| Flat illustrations | Empty states, onboarding, features |
| Duotone icons | Category icons, process steps |
| Line art | Decorative, background patterns |
| Spot illustrations | Error pages, loading states |

**Illustration Palette:**
- Primary: Blue-600 + Blue-200 (duotone)
- Accent: Orange-500 for highlights
- Background: Gray-100
- Skin tones: Diverse Vietnamese skin tones

### 3.3. Data Visualization

| Chart Type | Usage | Colors |
|-----------|-------|--------|
| Bar chart | Revenue comparison, monthly stats | Primary blue gradient |
| Line chart | Trends, time series | Blue-500 line, blue-100 fill |
| Pie/Donut | Distribution (product mix, channel) | Category colors |
| Progress | Completion, status | Green (complete), Blue (in-progress) |
| Stat card | Single KPI with trend | Green ↑ or Red ↓ indicator |

---

## 4. Motion & Animation

### 4.1. Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Instant | 0-100ms | - | Checkbox, toggle |
| Fast | 100-200ms | ease-out | Button hover, tooltip |
| Normal | 200-300ms | ease-in-out | Page transitions, modals |
| Slow | 300-500ms | ease-out | Complex animations, celebrations |
| Deliberate | 500ms+ | custom | Success animations, onboarding |

### 4.2. Animation Principles

| Principle | Implementation |
|-----------|---------------|
| **Purposeful** | Every animation serves UX (not decoration) |
| **Natural** | Ease-out for entrances, ease-in for exits |
| **Responsive** | Reduce motion for `prefers-reduced-motion` |
| **Subtle** | Keep it small - slight scale, gentle fade |
| **Consistent** | Same elements animate the same way everywhere |

### 4.3. Common Patterns

| Pattern | When | Animation |
|---------|------|-----------|
| Page enter | New page loads | Fade in (200ms) + slide up (8px) |
| Card hover | Mouse enters card | translateY(-2px) + shadow increase (200ms) |
| Modal open | Action triggers modal | Backdrop fade in + modal scale from 95% (200ms) |
| Toast appear | Notification shown | Slide in from top right (300ms) + auto-dismiss (5s) |
| Skeleton | Content loading | Pulse opacity 0.5→1 (1.5s, infinite) |
| Price change | Quote updates | Counter animation (400ms) |
| Status change | Claim status | Dot pulse + checkmark draw (500ms) |

---

## 5. Responsive Design Rules

### 5.1. Mobile-First Approach

```
/* Base styles = Mobile */
.component { ... }

/* Tablet override */
@media (min-width: 768px) { ... }

/* Desktop override */
@media (min-width: 1024px) { ... }
```

### 5.2. Touch Targets

| Element | Minimum Size | Spacing |
|---------|-------------|---------|
| Buttons | 44 × 44px | 8px between |
| Links (in text) | 44px height area | - |
| Form inputs | 48px height | 12px between |
| List items | 48px height | - |
| Close buttons | 44 × 44px | 12px from edge |

### 5.3. Content Priority (Mobile)

| Priority | Content | Treatment |
|----------|---------|-----------|
| P1 | Primary CTA, key info | Always visible |
| P2 | Supporting info | Collapsible/accordion |
| P3 | Secondary content | Below fold or hidden |
| P4 | Nice-to-have | Desktop only or deep link |

---

## 6. Dark Mode (Future)

### 6.1. Color Mapping

| Light Mode | Dark Mode | Token |
|-----------|-----------|-------|
| White (#FFFFFF) | Gray-900 (#111827) | `--bg-primary` |
| Gray-50 (#F9FAFB) | Gray-800 (#1F2937) | `--bg-secondary` |
| Gray-900 (#111827) | White (#FFFFFF) | `--text-primary` |
| Gray-600 (#4B5563) | Gray-300 (#D1D5DB) | `--text-secondary` |
| Blue-600 (#2563EB) | Blue-400 (#60A5FA) | `--color-accent` |
| Gray-200 (#E5E7EB) | Gray-700 (#374151) | `--border-color` |

---

## 7. Dos and Don'ts

### 7.1. Layout

| ✅ Do | ❌ Don't |
|-------|---------|
| Consistent spacing using design tokens | Mix arbitrary pixel values |
| White space for breathing room | Cramped layouts |
| Clear visual hierarchy | Everything same weight |
| Mobile-first responsive | Desktop-first scaling down |
| Max-width containers | Full-width text lines |

### 7.2. Typography

| ✅ Do | ❌ Don't |
|-------|---------|
| Use Inter font family consistently | Mix multiple fonts |
| Follow type scale (don't invent sizes) | Random font sizes |
| Maximum 3 font weights per page | Every weight available |
| Line length 50-80 characters | Lines too long or short |
| Sufficient line height (1.5 for body) | Tight leading for paragraphs |

### 7.3. Color

| ✅ Do | ❌ Don't |
|-------|---------|
| Use semantic color tokens | Hardcode hex values |
| Ensure contrast ratios (WCAG AA) | Low contrast text |
| Consistent color meanings (red=error) | Random color assignments |
| Limit to 3-4 colors per screen | Rainbow of colors |
| Use color + icon for status (not color alone) | Rely only on color for info |
