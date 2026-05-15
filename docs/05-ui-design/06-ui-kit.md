# UI Kit - Bộ Công Cụ Giao Diện

---

## 1. UI Kit Overview

### 1.1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | TailwindCSS | 3.x |
| Components | Custom (headless UI base) | - |
| Icons | Heroicons + custom | 2.x |
| Animation | Framer Motion | 10.x |
| Forms | React Hook Form + Zod | - |
| Charts | Recharts | 2.x |

### 1.2. Component Categories

```
ui-kit/
├── primitives/           # Base building blocks
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Toggle
│   ├── Textarea
│   └── Slider
├── layout/              # Structure components
│   ├── Container
│   ├── Grid
│   ├── Stack
│   ├── Divider
│   └── Spacer
├── navigation/          # Nav components
│   ├── Navbar
│   ├── Sidebar
│   ├── Tabs
│   ├── Breadcrumbs
│   ├── Pagination
│   └── Stepper
├── data-display/        # Show information
│   ├── Card
│   ├── Badge
│   ├── Avatar
│   ├── Table
│   ├── List
│   ├── Timeline
│   ├── Stat
│   └── Tag
├── feedback/            # User feedback
│   ├── Alert
│   ├── Toast
│   ├── Modal
│   ├── Tooltip
│   ├── Popover
│   ├── Progress
│   ├── Skeleton
│   └── Spinner
├── forms/               # Form patterns
│   ├── FormField
│   ├── FormGroup
│   ├── DatePicker
│   ├── FileUpload
│   ├── OTPInput
│   ├── SearchInput
│   └── CurrencyInput
└── insurance/           # Domain-specific
    ├── QuoteCard
    ├── PolicyCard
    ├── ClaimCard
    ├── ComparisonTable
    ├── PriceDisplay
    ├── CoverageList
    ├── InsurerLogo
    └── StatusBadge
```

---

## 2. Primitive Components

### 2.1. Button Component

```typescript
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Usage Examples:
<Button variant="primary" size="lg">Mua ngay</Button>
<Button variant="outline" size="md" leftIcon={<CompareIcon />}>So sánh</Button>
<Button variant="primary" size="lg" isLoading>Đang xử lý...</Button>
<Button variant="danger" size="md">Hủy hợp đồng</Button>
```

**Tailwind Classes:**
| Variant | Classes |
|---------|---------|
| primary | `bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800` |
| secondary | `bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300` |
| outline | `border border-blue-600 text-blue-600 hover:bg-blue-50` |
| ghost | `text-blue-600 hover:bg-blue-50` |
| danger | `bg-red-600 text-white hover:bg-red-700` |
| link | `text-blue-600 underline hover:text-blue-800 p-0` |

---

### 2.2. Input Component

```typescript
interface InputProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
}

// Usage:
<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  isRequired
  error={errors.email?.message}
/>
```

---

### 2.3. Select Component

```typescript
interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
  isRequired?: boolean;
  error?: string;
}

// Usage:
<Select
  label="Loại xe"
  options={vehicleTypes}
  placeholder="Chọn loại xe"
  isRequired
/>
```

---

## 3. Domain-Specific Components

### 3.1. QuoteCard

```typescript
interface QuoteCardProps {
  insurer: {
    name: string;
    logo: string;
    rating: number;
    reviewCount: number;
  };
  product: {
    name: string;
    tier: string;
  };
  premium: {
    annual: number;
    monthly: number;
  };
  benefits: {
    label: string;
    value: string;
    included: boolean;
  }[];
  badge?: 'best-value' | 'popular' | 'recommended';
  onCompare: () => void;
  onBuy: () => void;
  onDetail: () => void;
}
```

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Badge: "GIÁ TỐT NHẤT"]                            │
│                                                       │
│ [Logo 48px]  Insurer Name - Product Tier             │
│              ⭐ 4.3 (125 đánh giá)                  │
│                                                       │
│ ──────────────────────────────────────────────────── │
│ ✓ Benefit 1: Value    ✓ Benefit 2: Value           │
│ ✓ Benefit 3: Value    ✗ Benefit 4: Not included    │
│ ──────────────────────────────────────────────────── │
│                                                       │
│ 4,200,000 VND/năm     [□ So sánh]  [Mua ngay →]   │
│ (350,000/tháng)                                      │
│                                                       │
│ [▼ Xem chi tiết]                                    │
└──────────────────────────────────────────────────────┘
```

---

### 3.2. PolicyCard

```typescript
interface PolicyCardProps {
  policy: {
    id: string;
    number: string;
    product: string;
    insurer: { name: string; logo: string };
    status: 'active' | 'expiring' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string;
    premium: number;
    icon: string; // category icon
  };
  actions: {
    onView: () => void;
    onClaim?: () => void;
    onRenew?: () => void;
  };
}
```

---

### 3.3. ComparisonTable

```typescript
interface ComparisonTableProps {
  products: {
    id: string;
    insurer: { name: string; logo: string };
    productName: string;
    premium: number;
    features: Record<string, string | boolean>;
    badge?: string;
  }[];
  featureGroups: {
    groupName: string;
    features: { key: string; label: string; type: 'text' | 'boolean' | 'currency' }[];
  }[];
  onBuy: (productId: string) => void;
  onRemove: (productId: string) => void;
}
```

---

### 3.4. StatusBadge

```typescript
interface StatusBadgeProps {
  status: 'active' | 'expiring' | 'expired' | 'cancelled' |
          'pending' | 'approved' | 'rejected' | 'processing';
  size?: 'sm' | 'md';
}

// Color mapping:
const statusColors = {
  active: 'bg-green-100 text-green-800',
  expiring: 'bg-orange-100 text-orange-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800',
};
```

---

### 3.5. PriceDisplay

```typescript
interface PriceDisplayProps {
  amount: number;
  frequency: 'annual' | 'monthly' | 'quarterly';
  originalAmount?: number; // for showing discount
  currency?: string; // default: VND
  size?: 'sm' | 'md' | 'lg';
}

// Rendering:
// Large: "7,800,000 VND/năm" (bold, 24px)
// Small: "(650,000 VND/tháng)" (regular, 14px, gray)
// Discount: "8,500,000" (strikethrough) → "7,800,000 VND" + "-8%" badge
```

---

## 4. Layout Components

### 4.1. Stepper (Multi-step Form)

```typescript
interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number; // 0-indexed
  orientation?: 'horizontal' | 'vertical';
}

// Visual:
// ●━━━━━●━━━━━●━━━━━○━━━━━○
// Done   Done  Current  Todo   Todo
```

---

### 4.2. Timeline (Claims Tracking)

```typescript
interface TimelineProps {
  events: {
    title: string;
    description: string;
    timestamp: string;
    status: 'complete' | 'active' | 'pending';
    icon?: React.ReactNode;
  }[];
}
```

---

## 5. Utility Components

### 5.1. CurrencyInput

```typescript
interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
}

// Features:
// - Auto-format with thousands separator (.)
// - Currency suffix (VND)
// - Min/Max validation
// - Increment/decrement buttons (optional)
```

### 5.2. FileUpload

```typescript
interface FileUploadProps {
  label: string;
  accept: string[]; // ['image/jpeg', 'image/png', 'application/pdf']
  maxFiles: number;
  maxSizeBytes: number;
  onUpload: (files: File[]) => Promise<void>;
  enableCamera?: boolean; // mobile: open camera directly
  helperText?: string;
}

// Features:
// - Drag & drop zone
// - Camera capture (mobile)
// - File list with progress
// - Preview thumbnails
// - Remove uploaded files
// - Error handling (size, type, count)
```

---

## 6. Implementation Notes

### 6.1. Component Architecture

```
src/
├── components/
│   ├── ui/              # Primitive UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   └── ...
│   ├── domain/          # Insurance-specific components
│   │   ├── QuoteCard/
│   │   ├── PolicyCard/
│   │   └── ...
│   └── layout/          # Layout components
│       ├── Header/
│       ├── Footer/
│       └── ...
├── hooks/               # Custom hooks
│   ├── useQuote.ts
│   ├── usePolicy.ts
│   └── usePayment.ts
├── styles/              # Global styles
│   ├── globals.css
│   └── tailwind.config.ts
└── lib/                 # Utilities
    ├── formatCurrency.ts
    ├── formatDate.ts
    └── validators.ts
```

### 6.2. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `QuoteCard.tsx` |
| Hook files | camelCase with `use` | `useQuote.ts` |
| Utility files | camelCase | `formatCurrency.ts` |
| CSS classes | kebab-case | `quote-card-container` |
| Props interfaces | PascalCase + Props | `QuoteCardProps` |
| Event handlers | `on` + Action | `onBuy`, `onCompare` |

### 6.3. State Management Patterns

| State Type | Solution |
|-----------|----------|
| Server state | TanStack React Query |
| Form state | React Hook Form |
| Global UI state | Zustand |
| URL state | React Router (searchParams) |
| Component state | useState / useReducer |
