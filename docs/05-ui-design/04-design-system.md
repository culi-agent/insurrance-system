# Design System - Hệ Thống Thiết Kế

---

## 1. Design Tokens

### 1.1. Color Palette

#### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary-50` | #EFF6FF | Background tints |
| `--color-primary-100` | #DBEAFE | Light backgrounds |
| `--color-primary-200` | #BFDBFE | Borders, dividers |
| `--color-primary-300` | #93C5FD | Disabled states |
| `--color-primary-400` | #60A5FA | Icons secondary |
| `--color-primary-500` | #3B82F6 | Primary interactive |
| `--color-primary-600` | #2563EB | Buttons, links |
| `--color-primary-700` | #1D4ED8 | Hover states |
| `--color-primary-800` | #1E40AF | Active/pressed |
| `--color-primary-900` | #1E3A8A | Dark text on light |

#### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success-500` | #22C55E | Success states, confirmations |
| `--color-success-50` | #F0FDF4 | Success backgrounds |
| `--color-warning-500` | #F59E0B | Warnings, pending states |
| `--color-warning-50` | #FFFBEB | Warning backgrounds |
| `--color-error-500` | #EF4444 | Errors, destructive |
| `--color-error-50` | #FEF2F2 | Error backgrounds |
| `--color-info-500` | #06B6D4 | Info, tips |
| `--color-info-50` | #ECFEFF | Info backgrounds |

#### Neutral Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-gray-50` | #F9FAFB | Page backgrounds |
| `--color-gray-100` | #F3F4F6 | Card backgrounds |
| `--color-gray-200` | #E5E7EB | Borders |
| `--color-gray-300` | #D1D5DB | Disabled borders |
| `--color-gray-400` | #9CA3AF | Placeholder text |
| `--color-gray-500` | #6B7280 | Secondary text |
| `--color-gray-600` | #4B5563 | Body text |
| `--color-gray-700` | #374151 | Headings |
| `--color-gray-800` | #1F2937 | Primary text |
| `--color-gray-900` | #111827 | Darkest text |

#### Accent Colors (Product Categories)
| Category | Color | Hex |
|----------|-------|-----|
| Motor | Orange | #F97316 |
| Health | Green | #10B981 |
| Life | Purple | #8B5CF6 |
| Travel | Sky | #0EA5E9 |
| Property | Amber | #D97706 |
| Business | Indigo | #6366F1 |
| Liability | Rose | #F43F5E |

### 1.2. Typography

#### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 48px | 56px | Bold (700) | Hero headlines |
| `--text-h1` | 36px | 44px | Bold (700) | Page titles |
| `--text-h2` | 28px | 36px | Semibold (600) | Section titles |
| `--text-h3` | 22px | 30px | Semibold (600) | Card titles |
| `--text-h4` | 18px | 26px | Semibold (600) | Subsections |
| `--text-body-lg` | 18px | 28px | Regular (400) | Lead text |
| `--text-body` | 16px | 24px | Regular (400) | Body text |
| `--text-body-sm` | 14px | 20px | Regular (400) | Secondary text |
| `--text-caption` | 12px | 16px | Medium (500) | Labels, captions |
| `--text-overline` | 11px | 16px | Semibold (600) | Overline, badges |

#### Mobile Type Scale
| Token | Desktop | Mobile |
|-------|---------|--------|
| `--text-display` | 48px | 32px |
| `--text-h1` | 36px | 28px |
| `--text-h2` | 28px | 22px |
| `--text-h3` | 22px | 18px |
| `--text-body-lg` | 18px | 16px |

### 1.3. Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing (icon gaps) |
| `--space-2` | 8px | Compact elements |
| `--space-3` | 12px | Related elements |
| `--space-4` | 16px | Standard element gap |
| `--space-5` | 20px | Card internal padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large section gaps |
| `--space-10` | 40px | Page section margins |
| `--space-12` | 48px | Major section separation |
| `--space-16` | 64px | Page top/bottom padding |
| `--space-20` | 80px | Hero padding |

### 1.4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements (badges) |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, containers |
| `--radius-xl` | 16px | Large cards, modals |
| `--radius-2xl` | 24px | Feature sections |
| `--radius-full` | 9999px | Pill buttons, avatars |

### 1.5. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.07) | Cards, dropdowns |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modals, popovers |
| `--shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) | Floating elements |

### 1.6. Breakpoints

| Token | Value | Description |
|-------|-------|-------------|
| `--bp-sm` | 640px | Small devices (landscape phones) |
| `--bp-md` | 768px | Medium devices (tablets) |
| `--bp-lg` | 1024px | Large devices (desktops) |
| `--bp-xl` | 1280px | Extra large (wide desktops) |
| `--bp-2xl` | 1440px | Max content width |

---

## 2. Component Library

### 2.1. Buttons

| Variant | Class | Usage |
|---------|-------|-------|
| Primary | `btn-primary` | Main actions (Submit, Buy, Continue) |
| Secondary | `btn-secondary` | Secondary actions (Cancel, Back) |
| Outline | `btn-outline` | Tertiary actions (Compare, Save) |
| Ghost | `btn-ghost` | Minimal actions (Learn more, Details) |
| Danger | `btn-danger` | Destructive (Cancel policy, Delete) |
| Link | `btn-link` | Text-style links with padding |

**Sizes:**
| Size | Height | Padding | Font |
|------|--------|---------|------|
| `btn-sm` | 32px | 8px 12px | 13px |
| `btn-md` | 40px | 10px 16px | 14px |
| `btn-lg` | 48px | 12px 24px | 16px |
| `btn-xl` | 56px | 16px 32px | 18px |

### 2.2. Form Inputs

| Component | Variants |
|-----------|----------|
| Text Input | Default, with icon, with addon (prefix/suffix) |
| Select | Single select, multi-select, searchable |
| Checkbox | Single, group |
| Radio | Single, group, card-style |
| Toggle | On/Off with label |
| Textarea | Auto-resize, with character count |
| Date Picker | Single date, date range |
| File Upload | Drag-drop zone, camera button |
| Slider | Single value, range |
| OTP Input | 6-digit segmented |

**Input Anatomy:**
```
[Label *]                              [Optional helper icon]
┌─────────────────────────────────────────────────────────┐
│ [Icon]  Placeholder text                         [Icon] │
└─────────────────────────────────────────────────────────┘
Helper text or error message

Specs:
- Height: 44px (mobile: 48px for touch)
- Border: 1px solid gray-300
- Border-radius: 8px
- Padding: 12px 16px
- Label: 14px, semibold, gray-700, mb-4px
- Helper: 12px, regular, gray-500
- Error: 12px, regular, red-500, with ⚠️ icon
```

### 2.3. Cards

| Type | Usage |
|------|-------|
| Product Card | Category listing, product grid |
| Quote Card | Quote results, comparison |
| Policy Card | Dashboard policy list |
| Stat Card | Dashboard metrics |
| Info Card | Informational blocks |

### 2.4. Navigation

| Component | Usage |
|-----------|-------|
| Top Nav Bar | Main site navigation |
| Side Nav | Admin panel |
| Tab Bar | Content sections within page |
| Breadcrumbs | Page hierarchy |
| Pagination | List pages |
| Stepper | Multi-step forms |

### 2.5. Feedback

| Component | Usage |
|-----------|-------|
| Toast | Success/error/info notifications |
| Alert Banner | Page-level messages |
| Modal | Confirmations, important actions |
| Tooltip | Contextual help |
| Progress Bar | File uploads, claim status |
| Skeleton | Content loading |
| Empty State | No data available |

---

## 3. Iconography

### 3.1. Icon System
- **Library**: Heroicons (outline + solid)
- **Size**: 16px, 20px, 24px, 32px, 48px
- **Style**: Outline (default), Solid (active/selected states)
- **Color**: Inherit from text color

### 3.2. Custom Icons (Insurance-specific)

| Icon | Usage | Style |
|------|-------|-------|
| Shield check | Active policy / protected | Duotone, green |
| Shield alert | Expiring policy | Duotone, orange |
| Stethoscope | Health insurance | Outline |
| Car | Motor insurance | Outline |
| Plane | Travel insurance | Outline |
| Home | Property insurance | Outline |
| Users | Family/Group | Outline |
| Document | Policy/Contract | Outline |
| Clipboard check | Claim | Outline |
| Wallet | Payment | Outline |

---

## 4. Layout Patterns

### 4.1. Page Templates

**Template 1: Marketing Page (Homepage, About)**
```
[Header]
[Hero Section - full width]
[Content sections - max-width 1200px, centered]
[CTA Section - full width background]
[Footer]
```

**Template 2: Listing Page (Products, Results)**
```
[Header]
[Breadcrumb]
[Filter bar]
[Grid/List content - max-width 1200px]
[Pagination]
[Footer]
```

**Template 3: Form Page (Quote, Purchase)**
```
[Header - simplified]
[Progress stepper]
[Form content - max-width 680px, centered]
[Sticky CTA bar (mobile)]
[Footer - minimal]
```

**Template 4: Dashboard Page**
```
[Header with user menu]
[Tab/Side navigation]
[Content area - fluid width]
[No footer (app-style)]
```

### 4.2. Grid System
- Container max-width: 1200px
- Columns: 12
- Gutter: 24px (desktop), 16px (mobile)
- Margin: Auto (centered)

---

## 5. Accessibility Standards

### 5.1. Color Contrast

| Text Size | Minimum Ratio | Standard |
|-----------|--------------|----------|
| Body text (< 18px) | 4.5:1 | WCAG AA |
| Large text (≥ 18px bold) | 3:1 | WCAG AA |
| UI components | 3:1 | WCAG AA |
| Focus indicators | 3:1 | WCAG AA |

### 5.2. Interactive Elements

| Requirement | Implementation |
|-------------|---------------|
| Focus visible | 2px blue ring on all interactive elements |
| Touch target | Minimum 44×44px on mobile |
| Keyboard nav | Tab order follows visual order |
| Skip link | "Skip to content" hidden link |
| ARIA labels | All icons, images, complex widgets |
| Error announce | aria-live regions for form errors |
| Loading state | aria-busy, screen reader announcement |

### 5.3. Content

| Requirement | Implementation |
|-------------|---------------|
| Alt text | All informative images |
| Heading hierarchy | Proper H1→H6 nesting |
| Link text | Descriptive (not "click here") |
| Form labels | Associated with inputs |
| Error messages | Specific and actionable |
| Language | lang="vi" attribute on HTML |
