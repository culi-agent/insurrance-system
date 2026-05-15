# Mockup Specifications - Đặc Tả Thiết Kế Giao Diện

---

## 1. Mockup Overview

### 1.1. Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Clarity** | Mọi element phải có mục đích rõ ràng |
| **Trust** | Sử dụng partner logos, certifications, social proof |
| **Speed** | Minimal clicks to value (quote < 3 clicks) |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Consistency** | Design system áp dụng toàn bộ |

### 1.2. Screen Inventory

| Category | Screens | Priority |
|----------|---------|----------|
| Public Pages | Homepage, About, Blog, FAQ | P0 |
| Product Pages | Category, Listing, Detail, Compare | P0 |
| Quote Flow | Form (by product), Results, Comparison | P0 |
| Purchase Flow | Application, eKYC, Review, Payment, Success | P0 |
| Customer Portal | Dashboard, Policies, Claims, Payments, Profile | P0 |
| Admin Panel | Dashboard, Products, Claims, Users, Reports | P1 |
| Auth Pages | Login, Register, Forgot Password, Verify | P0 |
| Error/Empty | 404, 500, Empty states, Loading | P1 |

---

## 2. Key Screen Mockup Specs

### 2.1. Homepage - Hero Section

**Visual Design:**
```
Background: Gradient overlay on lifestyle image (family/professional)
Colors: Primary blue (#1E40AF) gradient to lighter (#3B82F6)
Typography:
  - Headline: Inter Bold, 48px/56px (desktop), 32px/40px (mobile)
  - Subheadline: Inter Regular, 20px/28px, white 80% opacity
  - CTA: Inter Semibold, 16px, white on orange button
Image: Happy Vietnamese family/young professional, authentic feel
```

**Components:**
| Element | Spec |
|---------|------|
| Search dropdown | 480px wide, 48px height, rounded-lg, white bg, shadow-md |
| CTA Button | 200px × 48px, bg-orange-500, rounded-full, hover:shadow-lg |
| Trust badges | Inline flex, 14px text, white, checkmark icon |
| Partner strip | Auto-scroll, grayscale logos (color on hover), 60px height |

---

### 2.2. Product Category Cards

**Card Design:**
```
┌──────────────────────────┐
│      [Icon: 48×48]       │
│                          │
│   Bảo hiểm Sức khỏe     │  ← Inter Semibold, 18px, gray-900
│                          │
│   Bảo vệ chi phí khám   │  ← Inter Regular, 14px, gray-500
│   chữa bệnh cho bạn     │
│   và gia đình            │
│                          │
│   Từ 2,500,000 VND/năm  │  ← Inter Bold, 16px, blue-600
│                          │
│   [Xem sản phẩm →]      │  ← Text button, blue-600
│                          │
└──────────────────────────┘

Specs:
- Width: 280px (desktop), 100% (mobile)
- Padding: 24px
- Border: 1px solid gray-200
- Border-radius: 16px
- Hover: shadow-lg, border-blue-200, translateY(-2px)
- Icon: Duotone style, blue-600 primary color
```

---

### 2.3. Quote Result Cards

**Card Design - Standard:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌────────┐                                                      │
│  │ [Logo] │  Bảo Việt - Gói Bạc                                │
│  │ 64×64  │  ⭐ 4.3 (125 đánh giá)                             │
│  └────────┘                                                      │
│─────────────────────────────────────────────────────────────────│
│                                                                   │
│  ✓ Nội trú: 200,000,000 VND        ✓ Network: 500+ bệnh viện  │
│  ✓ Ngoại trú: 20,000,000 VND       ✓ Chờ: 30 ngày            │
│  ✗ Nha khoa                          ✗ Thai sản                 │
│                                                                   │
│─────────────────────────────────────────────────────────────────│
│                                                                   │
│  4,200,000 VND/năm         [□ So sánh]  [ Mua ngay → ]         │
│  (350,000 VND/tháng)                                             │
│                                                                   │
│  [Xem chi tiết ▼]                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Specs:
- Width: 100% (max 800px)
- Padding: 20px 24px
- Border: 1px solid gray-200
- Border-radius: 12px
- Shadow: shadow-sm
- Badge "GIÁ TỐT NHẤT": bg-green-100, text-green-800, 12px
- Badge "PHỔ BIẾN": bg-orange-100, text-orange-800, 12px
- Price: Inter Bold, 24px, blue-700
- Monthly: Inter Regular, 14px, gray-500
- CTA: 140px × 44px, bg-blue-600, white, rounded-lg
- Checkmark: text-green-500, 16px
- Cross: text-red-400, 16px
```

---

### 2.4. Purchase Success Page

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    ✅ (animated checkmark)                        │
│                                                                   │
│              Chúc mừng! Bạn đã được bảo vệ!                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Số hợp đồng: AIA-2026-001234                              │ │
│  │  Sản phẩm: AIA Gold - BH Sức khỏe                          │ │
│  │  Hiệu lực: 15/05/2026 - 14/05/2027                         │ │
│  │  Phí: 7,800,000 VND/năm                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [📄 Tải hợp đồng PDF]    [📱 Xem trong Dashboard]            │
│                                                                   │
│  ℹ️ Email xác nhận đã gửi đến: h****@gmail.com                 │
│                                                                   │
│  ── Tiếp theo ──                                                 │
│  • Tải app để quản lý BH tiện hơn                               │
│  • Xem hướng dẫn sử dụng quyền lợi                             │
│  • Tìm bệnh viện trong network                                  │
│                                                                   │
│  ── Bạn có thể quan tâm ──                                      │
│  [BH Du lịch] [BH Tai nạn]   (cross-sell)                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Specs:
- Checkmark: Lottie animation, 120×120, green-500
- Heading: Inter Bold, 28px, gray-900
- Info card: bg-gray-50, rounded-xl, p-20
- PDF button: outlined, blue-600, with icon
- Dashboard button: filled, blue-600, primary CTA
```

---

### 2.5. Claims Status Tracking

**Timeline Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Claim #CL-2026-001234                                           │
│  BH Sức khỏe - AIA Gold | Nội trú                              │
│  Số tiền yêu cầu: 15,200,000 VND                               │
│                                                                   │
│  ●──── Đã nộp (15/05/2026 10:30)                               │
│  │     "Yêu cầu đã được tiếp nhận"                             │
│  │                                                               │
│  ●──── Đang xem xét (15/05/2026 14:00)                         │
│  │     "Hồ sơ đang được kiểm tra"                              │
│  │                                                               │
│  ●──── Đã phê duyệt (17/05/2026 16:00)                         │
│  │     "Phê duyệt: 13,200,000 VND"                             │
│  │     (Trừ miễn thường: 2,000,000 VND)                        │
│  │                                                               │
│  ◐──── Đang chuyển khoản                                        │
│        "Dự kiến: 19/05/2026"                                    │
│        Vào TK: Vietcombank ***1234                              │
│                                                                   │
│  Dự kiến hoàn tất: 2 ngày nữa                                  │
│  ┌─────────────────────────────┐                                │
│  │ ████████████████░░░░ 75%   │                                │
│  └─────────────────────────────┘                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Specs:
- Timeline dot (complete): 12px, bg-green-500
- Timeline dot (active): 12px, bg-blue-500, pulse animation
- Timeline dot (pending): 12px, bg-gray-300
- Timeline line: 2px, gray-200 (complete: green-200)
- Status text: Inter Semibold, 14px
- Detail text: Inter Regular, 13px, gray-600
- Progress bar: h-8px, bg-blue-500, rounded-full
```

---

## 3. Component States

### 3.1. Button States

| State | Visual |
|-------|--------|
| Default | bg-blue-600, text-white, shadow-sm |
| Hover | bg-blue-700, shadow-md, cursor-pointer |
| Active/Pressed | bg-blue-800, shadow-none, scale(0.98) |
| Loading | bg-blue-600, opacity-80, spinner icon |
| Disabled | bg-gray-300, text-gray-500, cursor-not-allowed |

### 3.2. Input States

| State | Visual |
|-------|--------|
| Default | border-gray-300, bg-white |
| Focus | border-blue-500, ring-2 ring-blue-200 |
| Filled | border-gray-300, text-gray-900 |
| Error | border-red-500, ring-2 ring-red-200, error message below |
| Success | border-green-500, checkmark icon right |
| Disabled | bg-gray-100, text-gray-400 |

### 3.3. Card States

| State | Visual |
|-------|--------|
| Default | border-gray-200, shadow-sm |
| Hover | border-blue-200, shadow-md, translateY(-2px) |
| Selected | border-blue-500, ring-2 ring-blue-200, bg-blue-50 |
| Disabled | opacity-50, pointer-events-none |

---

## 4. Animation & Micro-interactions

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade in + slide up | 300ms | ease-out |
| Card hover | Lift + shadow | 200ms | ease-in-out |
| Button press | Scale down | 100ms | ease-in |
| Toast notification | Slide in from top | 300ms | spring |
| Modal open | Fade + scale from 95% | 200ms | ease-out |
| Skeleton loading | Pulse animation | 1.5s | infinite |
| Success checkmark | Lottie animation | 800ms | - |
| Progress bar | Width transition | 500ms | ease-out |
| Comparison tray | Slide up from bottom | 300ms | ease-out |
| Price update | Number counter animation | 400ms | ease-out |

---

## 5. Empty States & Loading

### 5.1. Empty State Template

```
┌─────────────────────────────────────┐
│                                      │
│         [Illustration 200×200]       │
│                                      │
│     Chưa có hợp đồng nào           │  ← Inter Semibold, 20px
│                                      │
│     Bắt đầu bảo vệ bản thân       │  ← Inter Regular, 14px, gray-500
│     bằng cách mua bảo hiểm         │
│     phù hợp                         │
│                                      │
│     [Tìm bảo hiểm →]              │  ← Primary button
│                                      │
└─────────────────────────────────────┘
```

### 5.2. Loading Skeleton

```
┌─────────────────────────────────────┐
│ ┌────┐  ████████████████            │  ← shimmer animation
│ │░░░░│  ████████████                │
│ └────┘  ██████                      │
│                                      │
│ ████████████████████████████████    │
│ ████████████████████████            │
│                                      │
│ ██████████           [░░░░░░░░░]   │
└─────────────────────────────────────┘
```

---

## 6. Responsive Behavior

### 6.1. Navigation

| Viewport | Behavior |
|----------|----------|
| Desktop (>1024px) | Full horizontal nav, all items visible |
| Tablet (768-1023px) | Condensed nav, dropdown for submenu |
| Mobile (<768px) | Hamburger menu, full-screen overlay |

### 6.2. Grid Layouts

| Content | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Category cards | 4 columns | 2 columns | 2 columns |
| Product listing | 3 columns | 2 columns | 1 column |
| Quote results | 1 column (wide) | 1 column | 1 column |
| Dashboard cards | 4 columns | 2 columns | 2 columns (small) |
| Comparison table | Side-by-side | Horizontal scroll | Horizontal scroll |
