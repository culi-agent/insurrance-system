# Information Architecture - Kiến Trúc Thông Tin

---

## 1. Site Map

### 1.1. Complete Site Map

```
Insurance System
│
├── 🏠 Homepage
│   ├── Hero + Quick Quote
│   ├── Categories Grid
│   ├── How It Works
│   ├── Partners
│   ├── Testimonials
│   └── CTA (Quiz / Get Started)
│
├── 📦 Sản phẩm (Products)
│   ├── BH Xe cơ giới (/bao-hiem/xe-co-gioi)
│   │   ├── TNDS Bắt buộc
│   │   ├── Toàn diện (Comprehensive)
│   │   └── Người ngồi trên xe
│   ├── BH Sức khỏe (/bao-hiem/suc-khoe)
│   │   ├── Cá nhân
│   │   ├── Gia đình
│   │   └── Bệnh hiểm nghèo
│   ├── BH Nhân thọ (/bao-hiem/nhan-tho)
│   │   ├── Tử vong
│   │   ├── Hỗn hợp
│   │   └── Liên kết đầu tư
│   ├── BH Du lịch (/bao-hiem/du-lich)
│   │   ├── Trong nước
│   │   └── Quốc tế
│   ├── BH Tài sản (/bao-hiem/tai-san)
│   │   ├── Nhà ở
│   │   └── Cháy nổ
│   ├── BH Trách nhiệm (/bao-hiem/trach-nhiem)
│   └── BH Doanh nghiệp (/bao-hiem/doanh-nghiep)
│       ├── BH Nhóm
│       ├── Tài sản DN
│       └── Hàng hóa
│
├── 📄 Trang sản phẩm chi tiết (/san-pham/:slug)
│   ├── Overview (benefits, price from)
│   ├── Chi tiết quyền lợi
│   ├── Exclusions
│   ├── Bảng giá
│   ├── Điều khoản (T&C download)
│   ├── Quy trình claim
│   ├── Reviews
│   └── FAQ
│
├── 💰 Báo giá (/bao-gia)
│   ├── Chọn loại BH
│   ├── Form nhập thông tin
│   ├── Kết quả (multi-insurer)
│   └── So sánh chi tiết
│
├── 🛒 Mua hàng (/mua/:productId)
│   ├── Step 1: Thông tin cá nhân
│   ├── Step 2: eKYC
│   ├── Step 3: Health Declaration (if applicable)
│   ├── Step 4: Review & Sign
│   ├── Step 5: Thanh toán
│   └── Success Page
│
├── 👤 Tài khoản (/dashboard)
│   ├── Tổng quan (Overview)
│   ├── Hợp đồng (/hop-dong)
│   │   ├── Danh sách
│   │   └── Chi tiết (/hop-dong/:id)
│   │       ├── Thông tin HĐ
│   │       ├── Coverage
│   │       ├── Lịch sử thanh toán
│   │       ├── Documents
│   │       └── Actions (Renew, Cancel, Claim)
│   ├── Claims (/claims)
│   │   ├── Danh sách claims
│   │   ├── Nộp claim mới
│   │   └── Chi tiết claim (/claims/:id)
│   ├── Thanh toán (/payments)
│   │   ├── Lịch sử
│   │   └── Phương thức đã lưu
│   ├── Tài liệu (/documents)
│   └── Cài đặt (/settings)
│       ├── Thông tin cá nhân
│       ├── Bảo mật (đổi MK, 2FA)
│       ├── Thông báo (preferences)
│       └── Ngôn ngữ
│
├── 📖 Nội dung (Content)
│   ├── Về chúng tôi (/ve-chung-toi)
│   ├── Blog (/blog)
│   │   ├── Listing (categories, search)
│   │   └── Article (/blog/:slug)
│   ├── FAQ (/faq)
│   ├── Đối tác (/doi-tac)
│   └── Liên hệ (/lien-he)
│
├── 🔐 Auth Pages
│   ├── Đăng nhập (/dang-nhap)
│   ├── Đăng ký (/dang-ky)
│   ├── Quên mật khẩu (/quen-mat-khau)
│   └── Xác minh OTP (/xac-minh)
│
├── ⚙️ Admin Panel (/admin)
│   ├── Dashboard
│   ├── Sản phẩm (CRUD)
│   ├── Khách hàng
│   ├── Hợp đồng
│   ├── Claims (Queue + Process)
│   ├── Tài chính (Reconciliation)
│   ├── Đối tác
│   ├── Nội dung (CMS)
│   ├── Báo cáo
│   ├── Users & Roles
│   └── Cài đặt hệ thống
│
└── 📄 Legal Pages
    ├── Điều khoản sử dụng (/dieu-khoan)
    ├── Chính sách bảo mật (/chinh-sach-bao-mat)
    └── Giấy phép (/giay-phep)
```

---

## 2. Content Hierarchy

### 2.1. Priority Levels

| Level | Content Type | Location | Visibility |
|-------|-------------|----------|-----------|
| L1 - Critical | Primary CTA, Key messages | Above fold | Always visible |
| L2 - Important | Product info, pricing, benefits | First scroll | Immediately accessible |
| L3 - Supporting | Details, comparisons, reviews | Below fold | On demand |
| L4 - Reference | T&C, legal, fine print | Footer / expandable | Available but not prominent |

### 2.2. Homepage Content Hierarchy

```
L1 (Above fold):
├── Value proposition headline
├── Primary CTA (Get quote)
├── Trust badges (stats, partner count)
└── Category quick links

L2 (First scroll):
├── Insurance categories (7 cards)
├── How it works (3 steps)
└── Partner logos

L3 (Second scroll):
├── Customer testimonials
├── Featured blog posts
├── Quiz CTA

L4 (Footer):
├── Site links
├── Legal links
├── Contact info
└── Social media
```

### 2.3. Product Detail Content Hierarchy

```
L1 (Above fold):
├── Product name + Insurer logo
├── Star rating + review count
├── Price "from" + CTA "Nhận báo giá"
└── Top 3 key benefits (icons)

L2 (Tabs section):
├── Tab: Quyền lợi (default open)
│   └── Benefits table with coverage amounts
├── Tab: Exclusions
│   └── Clear list of what's NOT covered
├── Tab: Bảng giá
│   └── Price grid by age/coverage
└── Tab: Quy trình claim
    └── Step-by-step claim guide

L3 (Below tabs):
├── Customer reviews (sortable)
├── FAQ section (expandable)
├── Similar products
└── "Không chắc? Chat với tư vấn viên"

L4 (Accessible via link):
├── Full T&C document (PDF download)
├── Policy wording document
└── Network hospital list
```

---

## 3. Taxonomy & Categorization

### 3.1. Product Taxonomy

```
Level 1: Insurance Line (Nhóm BH)
└── Level 2: Product Type (Loại sản phẩm)
    └── Level 3: Specific Product (Sản phẩm cụ thể)
        └── Level 4: Plan/Tier (Gói)

Example:
BH Sức khỏe (L1)
└── Cá nhân (L2)
    └── AIA Health Shield (L3)
        ├── Bạc (L4)
        ├── Vàng (L4)
        └── Kim cương (L4)
```

### 3.2. Content Tags

| Tag Category | Values |
|-------------|--------|
| Insurance Line | motor, health, life, travel, property, liability, business |
| Audience | individual, family, corporate, first-timer |
| Life Stage | young-professional, parent, retiree, student |
| Content Type | guide, comparison, news, story, faq |
| Complexity | simple, moderate, complex |
| Action | buy, renew, claim, compare, learn |

### 3.3. Search & Discovery

**Search Scope:**
| Content | Searchable | Weight |
|---------|-----------|--------|
| Product name | Yes | High |
| Product category | Yes | High |
| Insurer name | Yes | Medium |
| Benefits/features | Yes | Medium |
| Blog titles | Yes | Low |
| FAQ questions | Yes | Medium |
| Policy number | Yes (auth only) | High |
| Claim number | Yes (auth only) | High |

**Search Results Grouping:**
```
Search: "sức khỏe gia đình"

Sản phẩm (3)
├── AIA Gold - BH Sức khỏe Gia đình
├── Bảo Việt - BH Sức khỏe Family
└── PVI - Family Health Plan

Bài viết (2)
├── "Top 5 gói BH sức khỏe cho gia đình 2026"
└── "So sánh BH sức khỏe gia đình: Nên chọn gì?"

FAQ (1)
└── "Làm sao chọn BH sức khỏe phù hợp cho gia đình?"
```

---

## 4. Page Templates

### 4.1. Template Types

| Template | Used For | Key Sections |
|----------|----------|-------------|
| **Marketing** | Homepage, About, Landing | Hero, Features, Social proof, CTA |
| **Listing** | Categories, Search results | Filter, Grid/List, Pagination |
| **Detail** | Product, Policy, Claim | Header info, Tabs, Actions, Related |
| **Form** | Quote, Purchase, Claims | Progress, Form fields, Summary, CTA |
| **Dashboard** | Customer/Admin panels | Stats, Lists, Quick actions |
| **Content** | Blog, FAQ, Legal | Title, Body, Sidebar, Navigation |
| **Auth** | Login, Register | Centered form, Brand, Social login |
| **Error** | 404, 500, Empty | Illustration, Message, Action |

### 4.2. Template Structure

**Marketing Template:**
```
[Header]
[Hero: Full-width, high impact visual + CTA]
[Feature Sections: alternating left/right with visuals]
[Social Proof: testimonials, stats, logos]
[CTA Section: Final conversion push]
[Footer]
```

**Listing Template:**
```
[Header]
[Breadcrumb]
[Page Title + Result count]
[Filter Bar / Sidebar]
[Content Grid: Cards with consistent structure]
[Pagination / Load More]
[Footer]
```

**Form Template:**
```
[Simplified Header: Logo + Exit/Help]
[Progress Indicator: Steps 1-N]
[Form Content: Max-width 680px, centered]
  - Section title
  - Input groups
  - Inline validation
  - Helper text
[Sticky Footer: Back + Continue buttons]
```

---

## 5. Content Strategy

### 5.1. Content Model: Product

| Field | Type | Required | Display |
|-------|------|----------|---------|
| name | String | Yes | Title |
| slug | String | Yes | URL |
| category | Taxonomy | Yes | Breadcrumb, Filter |
| insurer | Relation | Yes | Logo, Name |
| short_description | String (160 char) | Yes | Card, Meta |
| long_description | Rich Text | Yes | Detail page |
| benefits | Array[{icon, title, description, value}] | Yes | Benefits section |
| exclusions | Array[{description}] | Yes | Exclusions tab |
| pricing_table | JSON | Yes | Pricing tab |
| min_price | Number | Yes | "Từ X VND" |
| rating | Number (1-5) | Computed | Stars |
| review_count | Number | Computed | "(X đánh giá)" |
| documents | Array[{name, url}] | Yes | Downloads |
| faq | Array[{question, answer}] | No | FAQ section |
| status | Enum | Yes | Published/Draft |
| eligibility | JSON | Yes | Business rules |

### 5.2. Content Model: Blog Post

| Field | Type | Required |
|-------|------|----------|
| title | String | Yes |
| slug | String | Yes |
| excerpt | String (300 char) | Yes |
| body | Rich Text | Yes |
| featured_image | Image | Yes |
| category | Taxonomy | Yes |
| tags | Array[String] | No |
| author | Relation | Yes |
| published_at | DateTime | Yes |
| read_time | Number (minutes) | Computed |
| related_products | Array[Product] | No |

---

## 6. Information Grouping (Card Sorting Results)

### 6.1. How Users Group Insurance Types

```
Research Finding: Users naturally group by "What am I protecting?"

Group 1: "Bảo vệ con người" (Protecting people)
├── BH Sức khỏe
├── BH Nhân thọ
├── BH Tai nạn cá nhân
└── BH Thai sản

Group 2: "Bảo vệ tài sản" (Protecting assets)
├── BH Xe cơ giới
├── BH Nhà ở
├── BH Tài sản
└── BH Cháy nổ

Group 3: "Bảo vệ khi đi" (Protecting activities)
├── BH Du lịch
├── BH Hàng hóa vận chuyển
└── BH Trách nhiệm

Group 4: "Bảo vệ công việc" (Protecting business)
├── BH Doanh nghiệp
├── BH Nhóm nhân viên
├── BH Trách nhiệm nghề nghiệp
└── BH Gián đoạn kinh doanh
```

### 6.2. Navigation Labels (A/B Test Results)

| Option A (Insurance jargon) | Option B (User language) ✓ Winner |
|------------------------------|----------------------------------|
| Motor Insurance | BH Xe cơ giới |
| Health Insurance | BH Sức khỏe |
| Life Insurance | BH Nhân thọ |
| General Insurance | BH Phi nhân thọ ❌ Confusing |
| — | BH Du lịch ✓ Specific |
| — | BH Tài sản ✓ Specific |
| — | BH Doanh nghiệp ✓ Specific |

**Decision**: Use specific category names (Option B) as primary navigation.

---

## 7. Cross-linking Strategy

### 7.1. Related Content Links

| From Page | Link To | Relationship |
|-----------|---------|-------------|
| Product Detail | Similar products (same category) | Alternative |
| Product Detail | Complementary products | Cross-sell |
| Blog Post | Related products | Contextual |
| Dashboard | Recommended products | Personalized |
| Claim Success | Rate experience, refer friend | Engagement |
| Quote Results | Blog: "How to choose" | Educational |
| Empty Dashboard | Product catalog | Onboarding |

### 7.2. Contextual Help Links

| Context | Help Content |
|---------|-------------|
| Health Declaration form | "Tại sao chúng tôi hỏi?" tooltip |
| Exclusions section | "Nếu tôi đã có bệnh này?" link to FAQ |
| Deductible selection | "Mức miễn thường là gì?" explainer |
| Claims form | "Tài liệu cần thiết" checklist |
| Price display | "Giá này đã bao gồm gì?" breakdown |
| Comparison table | "Không biết chọn gì? Chat với tư vấn" |

---

## 8. Personalization Layers

### 8.1. Guest Personalization

| Signal | Personalization |
|--------|----------------|
| UTM source (e.g., travel blog) | Show travel insurance first |
| Search keyword | Pre-select category |
| Geolocation (city) | Show local insurer options |
| Device (mobile) | Simplify forms |
| Time of day | Adjust CTA messaging |
| Returning visitor | Show "Tiếp tục báo giá" |

### 8.2. Authenticated Personalization

| Data | Personalization |
|------|----------------|
| Age | Relevant product recommendations |
| Existing policies | Cross-sell gaps |
| Family info | Family plan suggestions |
| Claims history | Renewal pricing |
| Browse history | "Xem gần đây" section |
| Lifecycle stage | Relevant content |

---

## 9. Error Architecture

### 9.1. Error Page Hierarchy

| Code | Page | Message | Action |
|------|------|---------|--------|
| 404 | Not Found | "Trang bạn tìm không tồn tại" | Search, Home, Popular links |
| 403 | Forbidden | "Bạn không có quyền truy cập" | Login, Home |
| 500 | Server Error | "Có lỗi xảy ra. Chúng tôi đang khắc phục" | Retry, Home, Contact |
| Offline | No Connection | "Mất kết nối internet" | Retry when online |
| Maintenance | Planned | "Hệ thống đang bảo trì. Quay lại sau 30 phút" | Status page link |

### 9.2. Empty State Content

| Context | Message | Action |
|---------|---------|--------|
| No policies | "Chưa có hợp đồng nào" | "Tìm bảo hiểm phù hợp →" |
| No claims | "Chưa có yêu cầu bồi thường nào" | "Cách nộp claim" link |
| No search results | "Không tìm thấy '{keyword}'" | Suggestions, categories |
| No notifications | "Tất cả đã đọc!" | - |
| Filtered to empty | "Không có SP phù hợp bộ lọc" | "Xóa bộ lọc" button |
