# Navigation Flow - Luồng Điều Hướng

---

## 1. Global Navigation Structure

### 1.1. Primary Navigation (Header)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  [Logo]   Sản phẩm ▼   Về chúng tôi   Blog   FAQ   🔍   [Đăng nhập]  │
│                                                            [Đăng ký]    │
│                                                                           │
│  └── Sản phẩm (Mega menu)                                               │
│      ┌───────────────────────────────────────────────────────────────┐   │
│      │ BH Xe cơ giới    │ BH Sức khỏe      │ BH Nhân thọ          │   │
│      │ • TNDS bắt buộc  │ • Cá nhân        │ • Bảo hiểm tử vong   │   │
│      │ • Toàn diện      │ • Gia đình       │ • Hỗn hợp            │   │
│      │ • Người ngồi xe  │ • Bệnh hiểm nghèo│ • Liên kết đầu tư    │   │
│      ├───────────────────┼──────────────────┼───────────────────────┤   │
│      │ BH Du lịch       │ BH Tài sản       │ BH Doanh nghiệp      │   │
│      │ • Trong nước     │ • Nhà ở          │ • BH nhóm            │   │
│      │ • Quốc tế       │ • Cháy nổ        │ • Tài sản DN         │   │
│      │                  │                   │ • Hàng hóa           │   │
│      ├───────────────────┴──────────────────┴───────────────────────┤   │
│      │ [🔍 Không biết chọn gì? Làm quiz gợi ý →]                  │   │
│      └───────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Authenticated Navigation

```
GUEST:
[Logo]   Sản phẩm ▼   Về chúng tôi   Blog   FAQ   🔍   [Đăng nhập] [Đăng ký]

LOGGED IN:
[Logo]   Sản phẩm ▼   Về chúng tôi   Blog   FAQ   🔍   🔔(3)  [Avatar ▼]
                                                                    │
                                                          ┌─────────┴──────────┐
                                                          │ 👤 Tài khoản       │
                                                          │ 📋 Hợp đồng của tôi│
                                                          │ 📄 Claims          │
                                                          │ 💳 Thanh toán      │
                                                          │ ⚙️ Cài đặt        │
                                                          │ ─────────────────── │
                                                          │ 🚪 Đăng xuất       │
                                                          └────────────────────┘
```

### 1.3. Mobile Navigation

```
HAMBURGER MENU (☰)                    BOTTOM TAB BAR
┌──────────────────────┐              ┌───────────────────────────────┐
│ [Logo]         [✕]   │              │  🏠    🔍    📋    🔔    👤  │
│                       │              │ Trang  Tìm   HĐ   Thông Tài │
│ Sản phẩm       [▶]  │              │ chủ   kiếm  của   báo  khoản│
│ Về chúng tôi         │              │              tôi              │
│ Blog                  │              └───────────────────────────────┘
│ FAQ                   │
│ ──────────────────── │              Notes:
│ 📋 Hợp đồng của tôi │              • Bottom tab = authenticated only
│ 📄 Claims            │              • "HĐ của tôi" = Dashboard shortcut
│ 💳 Thanh toán        │              • Badge on 🔔 for unread count
│ ⚙️ Cài đặt          │              • Active tab = filled icon + blue
│ ──────────────────── │
│ 🚪 Đăng xuất        │
└──────────────────────┘
```

---

## 2. Page-Level Navigation

### 2.1. Dashboard Navigation (Authenticated)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (site-wide)                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ TAB NAVIGATION (horizontal):                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │Tổng quan│ │Hợp đồng│ │ Claims │ │Thanh   │ │Tài liệu│ │Cài đặt│   │
│ │ ●       │ │        │ │        │ │toán    │ │        │ │        │   │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                                           │
│ CONTENT AREA                                                             │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                                                                      │ │
│ │  [Active Tab Content]                                                │ │
│ │                                                                      │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Admin Panel Navigation

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ADMIN HEADER: [Logo] Admin Panel                    [🔔] [Admin Name ▼]│
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                           │
│  SIDEBAR     │  CONTENT AREA                                           │
│              │                                                           │
│  📊 Dashboard│  [Breadcrumb: Admin > Claims > #CL-001]                 │
│  📦 Sản phẩm │                                                          │
│    • Danh sách│  ┌─────────────────────────────────────────────────┐   │
│    • Thêm mới│  │                                                  │   │
│  👥 Khách hàng│ │  [Page Content]                                  │   │
│  📋 Hợp đồng │  │                                                  │   │
│  📄 Claims ● │  │                                                  │   │
│    • Queue    │  │                                                  │   │
│    • Xử lý   │  └─────────────────────────────────────────────────┘   │
│  💳 Tài chính│                                                          │
│  🤝 Đối tác  │                                                          │
│  📈 Báo cáo  │                                                          │
│  👤 Users    │                                                          │
│  ⚙️ Cài đặt │                                                          │
│              │                                                           │
│  [Collapse ◀]│                                                           │
│              │                                                           │
└──────────────┴──────────────────────────────────────────────────────────┘

Sidebar Specs:
• Width: 240px (expanded), 64px (collapsed)
• Active item: bg-blue-50, text-blue-700, left border 3px blue
• Badge (●): red dot for items needing attention
• Collapsible on desktop (icon-only mode)
• Hidden on mobile (hamburger to open)
```

---

## 3. Breadcrumb Patterns

### 3.1. Breadcrumb Structure

| Page | Breadcrumb |
|------|-----------|
| Homepage | (none) |
| Category | Trang chủ > Bảo hiểm Sức khỏe |
| Product Detail | Trang chủ > BH Sức khỏe > AIA Gold |
| Quote Results | Trang chủ > BH Sức khỏe > Báo giá |
| Purchase | Trang chủ > BH Sức khỏe > AIA Gold > Mua |
| Dashboard | (none - app context) |
| Policy Detail | Dashboard > Hợp đồng > #AIA-2026-001 |
| Claim Detail | Dashboard > Claims > #CL-2026-001 |
| Admin - Claims | Admin > Claims > Queue |
| Admin - Claim Detail | Admin > Claims > #CL-2026-001 |

### 3.2. Breadcrumb Rules
- Maximum 4 levels displayed
- Truncate middle items on mobile (Home > ... > Current)
- Last item is current page (not clickable, bold)
- Separator: ">" (chevron icon)
- Click any parent to navigate back

---

## 4. Navigation Patterns

### 4.1. Multi-Step Form Navigation

```
Progress Bar (always visible at top):
●━━━━━●━━━━━●━━━━━○━━━━━○
1.Info  2.eKYC 3.Review 4.Pay  5.Done

Rules:
• Can go BACK to any completed step (click on ●)
• Cannot skip FORWARD past current step
• Current step highlighted (blue ●)
• Completed steps: green ● with checkmark
• Future steps: gray ○
• Mobile: step numbers + current label only (save space)

Sticky Footer (mobile):
┌─────────────────────────────────────────┐
│  [← Quay lại]              [Tiếp tục →]│
└─────────────────────────────────────────┘
```

### 4.2. Tab Navigation Pattern

```
Horizontal Tabs (used in Dashboard, Product Detail):

┌──────────┬──────────┬──────────┬──────────┐
│  Tab 1   │  Tab 2 ● │  Tab 3   │  Tab 4   │
│ (active) │          │          │          │
├──────────┴──────────┴──────────┴──────────┤
│ ═══════                                    │  ← Blue underline on active
│                                            │
│  [Tab 1 content]                           │
│                                            │
└────────────────────────────────────────────┘

Specs:
• Active: text-blue-600, border-bottom 2px blue-600
• Inactive: text-gray-500, hover:text-gray-700
• Badge (●): red dot for notifications/new items
• Horizontal scroll on mobile (if > 4 tabs)
• No page reload (SPA tab switch)
```

### 4.3. Filter Navigation (Product Listing)

```
DESKTOP: Sidebar filters
┌────────────────┬───────────────────────────────────────┐
│ FILTERS        │  [Results: 24 sản phẩm]  [Sort: ▼]  │
│                │                                       │
│ Loại BH       │  ┌─────┐ ┌─────┐ ┌─────┐           │
│ □ Nội trú     │  │Card1│ │Card2│ │Card3│           │
│ ☑ Ngoại trú   │  └─────┘ └─────┘ └─────┘           │
│ □ Nha khoa    │  ┌─────┐ ┌─────┐ ┌─────┐           │
│               │  │Card4│ │Card5│ │Card6│           │
│ Công ty BH    │  └─────┘ └─────┘ └─────┘           │
│ □ Bảo Việt    │                                       │
│ ☑ AIA         │                                       │
│ □ PVI         │                                       │
│               │                                       │
│ Giá/năm       │                                       │
│ [●━━━━━━━━●]  │                                       │
│ 1M  -  20M   │                                       │
│               │                                       │
│ [Xóa bộ lọc] │                                       │
└────────────────┴───────────────────────────────────────┘

MOBILE: Bottom sheet filters
┌─────────────────────────────────────┐
│ [Active filters as chips: ☑AIA ✕]  │
│ [🔽 Bộ lọc]  [Sort: Giá thấp ▼]  │
├─────────────────────────────────────┤
│ [Results grid]                      │
└─────────────────────────────────────┘

Click "Bộ lọc" → Bottom sheet slides up with filter options
```

---

## 5. Deep Linking & URL Structure

### 5.1. URL Patterns

| Page | URL Pattern | Example |
|------|------------|---------|
| Homepage | `/` | / |
| Category | `/bao-hiem/:category` | /bao-hiem/suc-khoe |
| Product | `/san-pham/:slug` | /san-pham/aia-gold-suc-khoe |
| Quote | `/bao-gia/:category` | /bao-gia/xe-may |
| Quote Results | `/bao-gia/:category/ket-qua` | /bao-gia/suc-khoe/ket-qua |
| Compare | `/so-sanh?ids=a,b,c` | /so-sanh?ids=aia-gold,bv-bac |
| Purchase | `/mua/:productId/step/:step` | /mua/aia-gold/step/2 |
| Dashboard | `/dashboard` | /dashboard |
| Policy Detail | `/hop-dong/:id` | /hop-dong/AIA-2026-001 |
| Claim | `/claims/:id` | /claims/CL-2026-001 |
| Blog | `/blog/:slug` | /blog/huong-dan-mua-bh |
| Admin | `/admin/:section` | /admin/claims |

### 5.2. Query Parameters

| Parameter | Usage | Example |
|-----------|-------|---------|
| `?ref=` | Referral tracking | ?ref=friend123 |
| `?utm_*` | Marketing tracking | ?utm_source=google |
| `?sort=` | Sort preference | ?sort=price_asc |
| `?filter=` | Active filters | ?filter=insurer:aia,type:inpatient |
| `?page=` | Pagination | ?page=2 |
| `?redirect=` | Post-login redirect | ?redirect=/mua/aia-gold |

---

## 6. Navigation Accessibility

### 6.1. Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter/Space | Activate button/link |
| Escape | Close modal/dropdown/menu |
| Arrow keys | Navigate within menu/tabs/radio |
| Home/End | First/last item in list |

### 6.2. Focus Management

| Scenario | Focus Behavior |
|----------|---------------|
| Page load | Focus on main heading (h1) |
| Modal open | Focus trapped inside modal, first focusable element |
| Modal close | Return focus to trigger element |
| Tab switch | Focus on tab panel content |
| Form error | Focus on first error field |
| Toast appear | Announced via aria-live (no focus steal) |
| Step navigation | Focus on step heading |

### 6.3. Skip Links

```html
<a href="#main-content" class="skip-link">Bỏ qua navigation</a>
<a href="#search" class="skip-link">Đi đến tìm kiếm</a>
```

---

## 7. Navigation State Management

### 7.1. Active States

| Element | Active Indicator |
|---------|-----------------|
| Main nav item | Blue text + bottom border |
| Sidebar item | Blue bg + left border |
| Tab | Blue text + bottom border |
| Bottom tab (mobile) | Blue icon + label |
| Breadcrumb current | Bold, not clickable |
| Step (completed) | Green check + clickable |
| Step (current) | Blue dot + label |

### 7.2. Loading States During Navigation

| Navigation Type | Loading Indicator |
|----------------|-------------------|
| Page transition | Top progress bar (NProgress style) |
| Tab switch | Content skeleton |
| Filter apply | Inline spinner + results update |
| Search | Debounce 300ms + skeleton results |
| Infinite scroll | Bottom spinner + "Đang tải thêm..." |
| Form submit | Button loading state |
