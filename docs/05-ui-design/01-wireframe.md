# Wireframes - Khung Giao Diện

---

## 1. Tổng Quan Wireframe

### 1.1. Wireframe Coverage

| Page | Priority | Status |
|------|----------|--------|
| Homepage | P0 | Defined |
| Product Listing | P0 | Defined |
| Product Detail | P0 | Defined |
| Quote Form | P0 | Defined |
| Quote Results / Comparison | P0 | Defined |
| Purchase Wizard | P0 | Defined |
| Customer Dashboard | P0 | Defined |
| Claims Submission | P0 | Defined |
| Admin Dashboard | P1 | Defined |
| Login / Register | P0 | Defined |

---

## 2. Homepage Wireframe

### 2.1. Desktop (1440px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                    │
│ ┌─────┐  [Logo]   [Sản phẩm ▼] [Về chúng tôi] [Blog]  🔍  [Đăng nhập]│
│ └─────┘                                                    [Đăng ký]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  HERO SECTION (Full-width, 500px height)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                                                                      │ │
│  │   "Bảo hiểm dễ dàng                                                │ │
│  │    Bảo vệ vững chắc"                                                │ │
│  │                                                                      │ │
│  │   So sánh giá từ 10+ công ty bảo hiểm                              │ │
│  │   Mua online trong 5 phút                                           │ │
│  │                                                                      │ │
│  │   [ Tôi cần bảo hiểm... ▼ ]  [Nhận báo giá →]                     │ │
│  │                                                                      │ │
│  │   ✓ 100,000+ khách hàng  ✓ 10+ đối tác  ✓ Bồi thường < 48h       │ │
│  │                                                                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  INSURANCE CATEGORIES (Grid 4 columns)                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  🚗     │  │  🏥     │  │  👤     │  │  ✈️     │              │
│  │ Xe cơ   │  │ Sức khỏe│  │ Nhân thọ│  │ Du lịch │              │
│  │ giới    │  │          │  │          │  │          │              │
│  │ Từ 350K │  │ Từ 2.5M │  │ Từ 5M   │  │ Từ 100K │              │
│  │ [Xem →] │  │ [Xem →] │  │ [Xem →] │  │ [Xem →] │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                             │
│  │  🏠     │  │  💼     │  │  🛡️    │                             │
│  │ Tài sản │  │ Doanh   │  │ Trách   │                             │
│  │          │  │ nghiệp  │  │ nhiệm   │                             │
│  │ Từ 1M   │  │ Từ 10M  │  │ Từ 2M   │                             │
│  │ [Xem →] │  │ [Xem →] │  │ [Xem →] │                             │
│  └──────────┘  └──────────┘  └──────────┘                             │
│                                                                           │
│  HOW IT WORKS (3 steps)                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │
│  │  ① So sánh    │  │  ② Mua online  │  │  ③ Được bảo vệ │           │
│  │  Xem giá từ   │  │  Thanh toán    │  │  Nhận HĐ ngay  │           │
│  │  nhiều công ty │  │  trong 5 phút  │  │  Claim nhanh   │           │
│  └────────────────┘  └────────────────┘  └────────────────┘           │
│                                                                           │
│  PARTNER LOGOS (Scrollable)                                              │
│  [BaoViet] [PVI] [Prudential] [Manulife] [AIA] [Liberty] [FWD]        │
│                                                                           │
│  TESTIMONIALS (Carousel)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐⭐  "Mua BH xe trong 3 phút, nhanh hơn đặt GrabFood"    │ │
│  │ - Nguyễn V., 28 tuổi, Developer                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  CTA SECTION                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Chưa biết cần bảo hiểm gì?                                        │ │
│  │  [Làm bài quiz 2 phút → Nhận gợi ý phù hợp]                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                                    │
│ [Logo] [Về chúng tôi] [Sản phẩm] [Blog] [FAQ] [Liên hệ]              │
│ [Facebook] [Zalo] [LinkedIn]  |  Giấy phép #xxx  |  © 2026            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Mobile (375px)

```
┌─────────────────────────────┐
│ ☰  [Logo]         🔍  👤  │
├─────────────────────────────┤
│                              │
│  "Bảo hiểm dễ dàng         │
│   Bảo vệ vững chắc"        │
│                              │
│  [Tôi cần bảo hiểm... ▼]   │
│  [  Nhận báo giá ngay  →]  │
│                              │
│  ✓ 100K+ KH  ✓ 10+ đối tác│
├─────────────────────────────┤
│                              │
│  Chọn loại bảo hiểm:       │
│  ┌───────────┐ ┌───────────┐│
│  │ 🚗 Xe   │ │ 🏥 SK   ││
│  │ Từ 350K  │ │ Từ 2.5M  ││
│  └───────────┘ └───────────┘│
│  ┌───────────┐ ┌───────────┐│
│  │ 👤 NT   │ │ ✈️ DL   ││
│  │ Từ 5M    │ │ Từ 100K  ││
│  └───────────┘ └───────────┘│
│  [Xem tất cả →]            │
│                              │
├─────────────────────────────┤
│  Cách hoạt động:           │
│  ① So sánh giá             │
│  ② Mua online 5 phút       │
│  ③ Được bảo vệ ngay        │
├─────────────────────────────┤
│  Đối tác: [logo] [logo]... │
├─────────────────────────────┤
│  ⭐⭐⭐⭐⭐                │
│  "Claim nhanh, 2 ngày..."  │
│  - Trần H., 35 tuổi        │
├─────────────────────────────┤
│  [Làm quiz → Nhận gợi ý]  │
├─────────────────────────────┤
│ FOOTER (collapsed)          │
│ [Links] [Social] [Legal]    │
└─────────────────────────────┘
```

---

## 3. Quote Results / Comparison Wireframe

### 3.1. Desktop

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Kết quả báo giá: BH Sức khỏe cho Nguyễn V., 28 tuổi                  │
│  Tìm thấy 5 gói phù hợp    [Sắp xếp: Giá thấp nhất ▼]  [Lọc ▼]     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ ★ GIÁ TỐT NHẤT                                                     │ │
│  │ ┌────────┐                                                          │ │
│  │ │[Logo]  │  Bảo Việt - Gói Bạc              4,200,000 VND/năm     │ │
│  │ │BaoViet │  ✓ Nội trú 200M  ✓ Ngoại trú 20M   ⭐ 4.3 (125)      │ │
│  │ └────────┘  ✓ Network: 500+ BV                                     │ │
│  │             [Xem chi tiết]           [So sánh □]  [Mua ngay →]     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ ┌────────┐                                                          │ │
│  │ │[Logo]  │  PVI - Gói Standard              5,500,000 VND/năm     │ │
│  │ │PVI     │  ✓ Nội trú 300M  ✓ Ngoại trú 30M   ⭐ 4.1 (89)       │ │
│  │ └────────┘  ✓ Network: 400+ BV                                     │ │
│  │             [Xem chi tiết]           [So sánh □]  [Mua ngay →]     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ ★ PHỔ BIẾN NHẤT                                                    │ │
│  │ ┌────────┐                                                          │ │
│  │ │[Logo]  │  AIA - Gói Gold                  7,800,000 VND/năm     │ │
│  │ │AIA     │  ✓ Nội trú 500M  ✓ Ngoại trú 50M   ⭐ 4.5 (210)      │ │
│  │ └────────┘  ✓ Nha khoa  ✓ Thai sản                                │ │
│  │             [Xem chi tiết]           [So sánh □]  [Mua ngay →]     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ─── COMPARISON TRAY (Floating bottom) ────────────────────────────────  │
│  │ So sánh: [BaoViet Bạc ✕] [AIA Gold ✕]     [So sánh ngay (2)] │  │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Purchase Wizard Wireframe

### 4.1. Step Progress

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ●────────●────────●────────○────────○                                  │
│  Thông tin  eKYC   Xem lại   Thanh     Hoàn                            │
│  cá nhân           & Ký     toán       tất                              │
│                                                                           │
│  Step 1/5: Thông tin cá nhân                                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Sản phẩm đã chọn:                                                  │ │
│  │ AIA Gold - BH Sức khỏe | 7,800,000 VND/năm                        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Họ và tên *         [_________________________________]                │
│  Ngày sinh *         [DD/MM/YYYY              📅]                       │
│  Giới tính *         ○ Nam  ○ Nữ                                       │
│  Số CCCD *           [_________________________________]                │
│  Email *             [_________________________________]                │
│  Số điện thoại *     [+84 ___________________________]                  │
│  Địa chỉ *          [_________________________________]                │
│                                                                           │
│  □ Người được bảo hiểm khác với người mua                              │
│                                                                           │
│                                       [← Quay lại]  [Tiếp tục →]       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Customer Dashboard Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER  [Logo]  [Dashboard] [Hợp đồng] [Claims] [Thanh toán]  [Avatar]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Xin chào, Hương! 👋                                                   │
│                                                                           │
│  OVERVIEW CARDS                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ 3          │  │ 1          │  │ 0          │  │ 12/2026    │       │
│  │ Hợp đồng  │  │ Sắp hết    │  │ Claims     │  │ Thanh toán │       │
│  │ active     │  │ hạn        │  │ đang xử lý │  │ tiếp theo  │       │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘       │
│                                                                           │
│  HỢP ĐỒNG CỦA TÔI                                         [Xem tất cả]│
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 🏥 BH Sức khỏe - AIA Gold        ACTIVE ●                         │ │
│  │    HĐ #AIA-2026-001234 | Hết hạn: 15/05/2027                      │ │
│  │    [Xem chi tiết] [Claim] [Gia hạn]                                │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │ 🚗 BH Xe máy - Bảo Việt          ACTIVE ●                         │ │
│  │    HĐ #BV-2026-005678 | Hết hạn: 01/03/2027                       │ │
│  │    [Xem chi tiết] [Claim] [Gia hạn]                                │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │ ⚠️ BH Du lịch - Liberty           EXPIRING (15 ngày)              │ │
│  │    HĐ #LB-2026-003456 | Hết hạn: 30/05/2026                       │ │
│  │    [Xem chi tiết] [Gia hạn ngay →]                                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  HOẠT ĐỘNG GẦN ĐÂY                                                     │
│  • 10/05 - Thanh toán phí BH sức khỏe: 7,800,000 VND ✓                │
│  • 05/05 - Claim #CL-001 approved: 5,200,000 VND                      │
│  • 01/05 - Nhắc nhở: BH du lịch sắp hết hạn                          │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Claims Submission Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Yêu cầu bồi thường                                                    │
│                                                                           │
│  ●────────●────────○────────○                                           │
│  Chọn HĐ   Chi tiết  Tài liệu  Xác nhận                               │
│                                                                           │
│  Step 2: Chi tiết sự kiện                                               │
│                                                                           │
│  Loại sự kiện *     [Nằm viện (nội trú)          ▼]                   │
│                                                                           │
│  Tên bệnh viện *    [Bệnh viện Đại học Y Dược    ▼]                   │
│                                                                           │
│  Ngày nhập viện *   [15/04/2026          📅]                           │
│  Ngày xuất viện *   [18/04/2026          📅]                           │
│                                                                           │
│  Chẩn đoán *        [Viêm phổi cấp              ]                     │
│                                                                           │
│  Mô tả điều trị *                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Nhập viện điều trị 3 ngày, dùng kháng sinh IV, chụp X-quang...    │ │
│  │                                                                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Tổng chi phí *     [15,200,000            ] VND                       │
│  Số tiền yêu cầu * [15,200,000            ] VND                       │
│                                                                           │
│  ℹ️ Mức miễn thường: 2,000,000 VND                                     │
│  ℹ️ Số tiền dự kiến được chi trả: 13,200,000 VND                      │
│                                                                           │
│                                       [← Quay lại]  [Tiếp tục →]       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile S | 320px | Single column, stacked |
| Mobile | 375px | Single column, cards full-width |
| Tablet | 768px | 2-column grid, side panel |
| Desktop | 1024px | Full layout, sidebar |
| Desktop L | 1440px | Max-width container, centered |

---

## 8. Wireframe Annotations

### 8.1. Interaction Notes
- All forms: Real-time validation (on blur)
- CTA buttons: Primary = filled blue, Secondary = outlined
- Cards: Hover state = slight elevation + border color
- Mobile: Swipe gestures for carousels
- Comparison: Sticky header on scroll
- Dashboard: Pull-to-refresh on mobile
