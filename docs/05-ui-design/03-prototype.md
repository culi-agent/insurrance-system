# Prototype Specification - Đặc Tả Prototype

---

## 1. Prototype Strategy

### 1.1. Prototype Types

| Type | Purpose | Fidelity | Tool | When |
|------|---------|----------|------|------|
| Paper Prototype | Concept validation | Low | Paper/Whiteboard | Week 1 |
| Clickable Wireframe | Flow validation | Medium | Figma | Week 2-3 |
| Interactive Prototype | Usability testing | High | Figma + Protopie | Week 3-4 |
| Functional Prototype | Dev handoff | High | React (Storybook) | Week 5+ |

### 1.2. Key Flows to Prototype

| # | Flow | Screens | Priority | Test Goal |
|---|------|---------|----------|-----------|
| 1 | Motor insurance quick buy | 6 screens | P0 | Validate < 5 min purchase |
| 2 | Health insurance quote + compare | 8 screens | P0 | Test comparison UX |
| 3 | Claims submission | 5 screens | P0 | Validate ease of filing |
| 4 | User registration + onboarding | 4 screens | P0 | Measure drop-off points |
| 5 | Dashboard + policy management | 5 screens | P1 | Test findability |
| 6 | AI recommendation quiz | 4 screens | P1 | Validate usefulness |

---

## 2. Flow 1: Motor Insurance Quick Purchase

### 2.1. Screen Flow

```
[1. Landing/Category] → [2. Vehicle Form] → [3. Quote Results]
        │                                          │
        │                                          ▼
        │                              [4. Personal Info + eKYC]
        │                                          │
        │                                          ▼
        │                              [5. Review & Confirm]
        │                                          │
        │                                          ▼
        │                              [6. Payment → Success]
```

### 2.2. Interaction Specifications

**Screen 1→2: Category to Form**
- Trigger: Click "BH Xe cơ giới" card or "Nhận báo giá"
- Transition: Slide left (300ms)
- Entry animation: Form fields appear with stagger (50ms delay each)

**Screen 2→3: Form to Results**
- Trigger: Click "Xem giá" after valid form
- Loading: Skeleton cards with "Đang tìm giá tốt nhất..." (2-4s)
- Transition: Fade in results one by one (200ms stagger)
- Micro-interaction: Price counter animation from 0 to final value

**Screen 3→4: Select to Application**
- Trigger: Click "Mua ngay" on preferred quote
- Pre-condition: Must be logged in (show login modal if not)
- Transition: Slide left, pre-fill data from account

**Screen 4→5: Application to Review**
- Trigger: Complete form + eKYC
- Auto-save: Form data saved every 30s
- Transition: Slide left with progress bar update

**Screen 5→6: Confirm to Payment**
- Trigger: Check T&C box + Click "Thanh toán"
- Redirect: To payment gateway (VNPay/MoMo)
- On return: Show processing → Success animation (Lottie)

### 2.3. Error Handling in Prototype

| Error Case | Response |
|-----------|----------|
| Form validation fail | Inline red error, scroll to first error |
| eKYC fail (OCR) | "Không thể đọc. Thử lại hoặc nhập thủ công" |
| Payment timeout | "Thanh toán chưa hoàn tất. Thử lại?" |
| Network error | Toast: "Mất kết nối. Dữ liệu đã được lưu." |
| Quote expired | Modal: "Báo giá hết hạn. Tạo báo giá mới?" |

---

## 3. Flow 2: Health Insurance Quote + Compare

### 3.1. Multi-step Quote Form

```
Step 1: Basic Info (1 screen)
├── Age (auto from DOB)
├── Gender (2 options)
├── Location (dropdown)
└── Plan type: Individual ○ / Family ○

Step 2: Health Declaration (1 screen, conditional)
├── Pre-existing conditions (multi-select chips)
├── Smoking (Yes/No toggle)
├── BMI calculator (height + weight)
└── Skip option: "Tôi khỏe mạnh, không có bệnh nền"

Step 3: Coverage Selection (1 screen)
├── Sum insured slider (100M → 1B)
├── Scope toggles: Nội trú ✓ | Ngoại trú ○ | Nha khoa ○
├── Deductible dropdown (0 / 2M / 5M)
└── Real-time price preview at bottom

→ Loading → Results (comparison page)
```

### 3.2. Comparison Interaction

**Prototype Behavior:**
- Select up to 4 products for comparison (checkbox on cards)
- Floating bar appears at bottom: "So sánh X sản phẩm"
- Click "So sánh" → Full-screen comparison table
- Table: Sticky left column (criteria), horizontal scroll for products
- Highlight differences: Green = better, Red = worse
- "Tốt nhất cho bạn" badge on recommended product
- Each column has "Mua ngay" CTA

---

## 4. Flow 3: Claims Submission

### 4.1. Step-by-Step Flow

```
[1. Select Policy] → [2. Event Details] → [3. Upload Docs] → [4. Review & Submit] → [5. Confirmation]
```

### 4.2. Upload Interaction

**Photo Upload Component:**
```
┌─────────────────────────────────────────┐
│                                          │
│  Tải lên chứng từ                       │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │  📷      │  │  📁      │            │
│  │  Chụp    │  │  Chọn    │            │
│  │  ảnh     │  │  file    │            │
│  └──────────┘  └──────────┘            │
│                                          │
│  Đã tải lên:                            │
│  ┌──────────────────────────────────┐   │
│  │ 📄 hoa-don.pdf (2.3MB)    [✕]  │   │
│  │ 📷 receipt-01.jpg (1.1MB) [✕]  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ℹ️ Tối đa 10 files, mỗi file < 10MB  │
│  Định dạng: JPG, PNG, PDF              │
│                                          │
└─────────────────────────────────────────┘

Interactions:
- Drag & drop supported (desktop)
- Camera opens directly (mobile)
- Preview thumbnail on upload
- Upload progress bar per file
- Click thumbnail to preview full
- Remove with confirmation
```

---

## 5. Prototype Testing Plan

### 5.1. Test Scenarios

| # | Scenario | Task | Success Criteria | Time Limit |
|---|----------|------|-----------------|-----------|
| 1 | Buy motor insurance | Complete purchase from homepage | Task completed, < 5 min | 7 min |
| 2 | Compare health plans | Get quotes and compare 3 plans | Can identify cheapest + best value | 5 min |
| 3 | Submit a claim | File a health claim with documents | Submitted without help | 5 min |
| 4 | Find policy info | Check coverage details of a policy | Found correct info | 2 min |
| 5 | Cancel a policy | Cancel and understand refund | Completed + understood refund | 3 min |

### 5.2. Metrics to Collect

| Metric | How | Target |
|--------|-----|--------|
| Task completion rate | Pass/Fail | > 85% |
| Time on task | Timer | Within time limit |
| Error rate | Count of wrong actions | < 2 per task |
| SUS Score | Post-test survey | > 70 |
| Satisfaction | 1-5 rating per task | > 4.0 |
| NPS | "Would you recommend?" | > 30 |

### 5.3. Participants

| Group | Count | Profile | Recruitment |
|-------|-------|---------|-------------|
| Young professionals | 4 | 25-32, tech-savvy | Social media |
| Parents | 4 | 30-42, family-focused | Facebook groups |
| First-timers | 2 | 22-25, no insurance | University |
| Older adults | 2 | 45-55, moderate digital | Referral |
| **Total** | **12** | - | - |

---

## 6. Handoff Specifications

### 6.1. Figma to Development

| Deliverable | Content | Format |
|-------------|---------|--------|
| Design files | All screens + states | Figma link |
| Component library | Reusable components | Figma library |
| Specs | Spacing, sizes, colors | Auto-generated (Figma Dev Mode) |
| Assets | Icons, illustrations, images | SVG + PNG exports |
| Animations | Motion specs | Protopie / Lottie files |
| Documentation | Interaction notes | Figma annotations |

### 6.2. Component Naming Convention

```
Pattern: [Category]/[Component]/[Variant]/[State]

Examples:
- Button/Primary/Large/Default
- Button/Primary/Large/Hover
- Input/Text/Default/Empty
- Input/Text/Default/Error
- Card/QuoteResult/Standard/Default
- Card/QuoteResult/BestValue/Hover
- Navigation/Header/Desktop/LoggedIn
- Navigation/Header/Mobile/LoggedOut
```
