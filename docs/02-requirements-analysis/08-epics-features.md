# Epics & Features - Danh Sách Tính Năng Theo Epic

---

## 1. Epic Overview Map

```
┌────────────────────────────────────────────────────────────────────┐
│                    INSURANCE SYSTEM - EPIC MAP                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MVP (Month 1-3)                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ E1: Auth    │ │ E2: Product │ │ E3: Quote   │ │ E4: Purchase│  │
│  │ & Users     │ │ Discovery   │ │ Engine      │ │ & Payment   │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                      │
│  V1.0 (Month 4-6)                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ E5: Policy  │ │ E6: Claims  │ │ E7: Admin   │ │ E8: Notifi- │  │
│  │ Management  │ │ Processing  │ │ Panel       │ │ cations     │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                      │
│  V1.5 (Month 7-9)                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│  │ E9: AI &    │ │ E10: Partner│ │ E11: Report │                   │
│  │ Recommend   │ │ Integration │ │ & Analytics │                   │
│  └─────────────┘ └─────────────┘ └─────────────┘                   │
│                                                                      │
│  V2.0 (Month 10-12)                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│  │ E12: B2B &  │ │ E13: Mobile │ │ E14: Loyalty│                   │
│  │ Enterprise  │ │ App         │ │ & Referral  │                   │
│  └─────────────┘ └─────────────┘ └─────────────┘                   │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Epics

### Epic 1: Authentication & User Management

| Field | Value |
|-------|-------|
| Epic ID | E1 |
| Title | Authentication & User Management |
| Priority | P0 |
| Release | MVP |
| Story Points | 34 |
| Sprint | Sprint 1-2 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F1.1 | Email/Phone Registration | P0 | 5 |
| F1.2 | Login (Email/Phone + Password) | P0 | 3 |
| F1.3 | Social Login (Google, Facebook) | P1 | 5 |
| F1.4 | Password Reset (Email/SMS OTP) | P0 | 3 |
| F1.5 | Email/Phone Verification (OTP) | P0 | 3 |
| F1.6 | Profile Management | P0 | 5 |
| F1.7 | Session Management (JWT) | P0 | 3 |
| F1.8 | Role-Based Access Control | P0 | 5 |
| F1.9 | Account Deactivation | P2 | 2 |

**Dependencies:** None (foundation)

---

### Epic 2: Product Discovery & Catalog

| Field | Value |
|-------|-------|
| Epic ID | E2 |
| Title | Product Discovery & Catalog |
| Priority | P0 |
| Release | MVP |
| Story Points | 39 |
| Sprint | Sprint 1-3 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F2.1 | Product Category Pages (7 categories) | P0 | 5 |
| F2.2 | Product Listing with Cards | P0 | 5 |
| F2.3 | Product Detail Page | P0 | 8 |
| F2.4 | Product Search (full-text) | P1 | 5 |
| F2.5 | Product Filters (price, insurer, features) | P1 | 5 |
| F2.6 | Product Comparison (2-4 products) | P1 | 8 |
| F2.7 | Product Reviews & Ratings | P2 | 3 |

**Dependencies:** Product data from insurer partners (E10)

---

### Epic 3: Quotation Engine

| Field | Value |
|-------|-------|
| Epic ID | E3 |
| Title | Quotation Engine |
| Priority | P0 |
| Release | MVP |
| Story Points | 55 |
| Sprint | Sprint 2-4 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F3.1 | Motor Insurance Quote Form | P0 | 8 |
| F3.2 | Health Insurance Quote Form | P0 | 13 |
| F3.3 | Travel Insurance Quote Form | P0 | 5 |
| F3.4 | Life Insurance Quote Form | P1 | 13 |
| F3.5 | Multi-Insurer Quote Aggregation | P0 | 8 |
| F3.6 | Quote Comparison View | P0 | 5 |
| F3.7 | Save Quote / Email Quote | P1 | 3 |
| F3.8 | Quote Validity Management (30 days) | P1 | 2 |
| F3.9 | Coverage Customization (real-time price) | P0 | 5 |

**Dependencies:** E10 (Insurer API integration for real-time pricing)

---

### Epic 4: Purchase & Payment

| Field | Value |
|-------|-------|
| Epic ID | E4 |
| Title | Purchase & Payment |
| Priority | P0 |
| Release | MVP |
| Story Points | 52 |
| Sprint | Sprint 3-5 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F4.1 | Purchase Wizard (multi-step form) | P0 | 8 |
| F4.2 | eKYC Integration (CCCD OCR) | P0 | 8 |
| F4.3 | Application Form (personal, insured, beneficiary) | P0 | 8 |
| F4.4 | Auto-Underwriting Engine | P0 | 13 |
| F4.5 | VNPay Payment Integration | P0 | 5 |
| F4.6 | Momo Payment Integration | P0 | 3 |
| F4.7 | ZaloPay Payment Integration | P1 | 3 |
| F4.8 | Bank Transfer (Virtual Account) | P1 | 3 |
| F4.9 | E-Signature (OTP-based) | P0 | 5 |
| F4.10 | Policy Document Generation (PDF) | P0 | 5 |
| F4.11 | Payment Confirmation & Receipt | P0 | 3 |
| F4.12 | Installment Payment | P2 | 8 |

**Dependencies:** E1 (Auth), E3 (Quote), E10 (Insurer API)

---

### Epic 5: Policy Management

| Field | Value |
|-------|-------|
| Epic ID | E5 |
| Title | Policy Management |
| Priority | P0 |
| Release | V1.0 |
| Story Points | 34 |
| Sprint | Sprint 5-7 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F5.1 | Customer Dashboard (policy overview) | P0 | 5 |
| F5.2 | Policy List & Detail View | P0 | 5 |
| F5.3 | Policy Document Download | P0 | 2 |
| F5.4 | Policy Renewal (online) | P0 | 8 |
| F5.5 | Auto-Renewal (opt-in) | P1 | 5 |
| F5.6 | Policy Cancellation & Refund | P0 | 5 |
| F5.7 | Policy Endorsement (changes) | P2 | 5 |
| F5.8 | Renewal Reminders (email/SMS) | P0 | 3 |

**Dependencies:** E4 (Purchase), E8 (Notifications)

---

### Epic 6: Claims Processing

| Field | Value |
|-------|-------|
| Epic ID | E6 |
| Title | Claims Processing |
| Priority | P0 |
| Release | V1.0 |
| Story Points | 47 |
| Sprint | Sprint 6-8 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F6.1 | Claim Submission Form (by product type) | P0 | 8 |
| F6.2 | Document Upload (multi-file, drag-drop) | P0 | 5 |
| F6.3 | Claim Status Tracking (timeline) | P0 | 5 |
| F6.4 | Claims Communication Thread | P1 | 5 |
| F6.5 | Admin Claims Queue & Assignment | P0 | 8 |
| F6.6 | Claims Assessment & Decision | P0 | 8 |
| F6.7 | Claims Settlement (bank transfer) | P0 | 5 |
| F6.8 | Fast-track Claims (auto-approve < 5M) | P2 | 5 |
| F6.9 | Claims Appeal Process | P2 | 3 |

**Dependencies:** E5 (Policy), E7 (Admin Panel), E10 (Insurer API)

---

### Epic 7: Admin Panel

| Field | Value |
|-------|-------|
| Epic ID | E7 |
| Title | Admin Panel |
| Priority | P0 |
| Release | V1.0 |
| Story Points | 55 |
| Sprint | Sprint 4-8 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F7.1 | Admin Dashboard (KPIs, charts) | P0 | 8 |
| F7.2 | Product Management (CRUD) | P0 | 8 |
| F7.3 | Customer Management | P0 | 5 |
| F7.4 | Policy Management (admin view) | P0 | 5 |
| F7.5 | Claims Management (queue, process) | P0 | 8 |
| F7.6 | Partner/Insurer Management | P0 | 5 |
| F7.7 | User & Role Management | P0 | 5 |
| F7.8 | Content Management (pages, FAQ) | P2 | 5 |
| F7.9 | Audit Log Viewer | P1 | 3 |
| F7.10 | System Configuration | P1 | 3 |

**Dependencies:** E1 (Auth/RBAC)

---

### Epic 8: Notifications

| Field | Value |
|-------|-------|
| Epic ID | E8 |
| Title | Notification System |
| Priority | P0 |
| Release | V1.0 |
| Story Points | 21 |
| Sprint | Sprint 5-6 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F8.1 | Email Notifications (SendGrid) | P0 | 5 |
| F8.2 | SMS Notifications (OTP + alerts) | P0 | 3 |
| F8.3 | In-App Notification Center | P1 | 5 |
| F8.4 | Notification Templates Management | P1 | 3 |
| F8.5 | Notification Preferences (per user) | P1 | 3 |
| F8.6 | Scheduled Notifications (reminders) | P0 | 2 |

**Dependencies:** E1 (User data), External email/SMS services

---

### Epic 9: AI & Recommendations

| Field | Value |
|-------|-------|
| Epic ID | E9 |
| Title | AI & Product Recommendations |
| Priority | P1 |
| Release | V1.5 |
| Story Points | 34 |
| Sprint | Sprint 9-12 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F9.1 | Product Recommendation Engine | P1 | 13 |
| F9.2 | Personalized Homepage | P2 | 5 |
| F9.3 | "Customers also bought" suggestions | P2 | 3 |
| F9.4 | Coverage Gap Analysis | P1 | 8 |
| F9.5 | Smart Form Pre-fill | P2 | 5 |

---

### Epic 10: Partner Integration

| Field | Value |
|-------|-------|
| Epic ID | E10 |
| Title | Partner Integration |
| Priority | P0 |
| Release | MVP → V2.0 (progressive) |
| Story Points | 47 |
| Sprint | Sprint 2-10 (continuous) |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F10.1 | Insurer API Integration Framework | P0 | 13 |
| F10.2 | Insurer #1 Integration (full) | P0 | 8 |
| F10.3 | Insurer #2 Integration | P0 | 8 |
| F10.4 | Insurer #3 Integration | P0 | 8 |
| F10.5 | Payment Gateway Integration Layer | P0 | 5 |
| F10.6 | eKYC Provider Integration | P0 | 5 |
| F10.7 | Partner Portal (self-service) | P2 | 8 |

---

### Epic 11: Reporting & Analytics

| Field | Value |
|-------|-------|
| Epic ID | E11 |
| Title | Reporting & Analytics |
| Priority | P1 |
| Release | V1.5 |
| Story Points | 26 |
| Sprint | Sprint 9-11 |

**Features:**
| Feature ID | Feature | Priority | Points |
|-----------|---------|----------|--------|
| F11.1 | Sales Reports | P0 | 5 |
| F11.2 | Customer Analytics | P1 | 5 |
| F11.3 | Product Performance Reports | P1 | 3 |
| F11.4 | Financial Reports (commission, P&L) | P0 | 5 |
| F11.5 | Claims Analytics | P2 | 3 |
| F11.6 | Custom Report Builder | P2 | 5 |
| F11.7 | Export (CSV, PDF) | P1 | 2 |

---

## 3. Feature Dependencies Graph

```
E1 (Auth) ──────────────────────────────┐
    │                                    │
    ├──→ E2 (Products) ──→ E3 (Quote) ──┼──→ E4 (Purchase)
    │                                    │         │
    ├──→ E7 (Admin) ─────────────────────┤         ├──→ E5 (Policy)
    │                                    │         │         │
    └──→ E8 (Notifications) ────────────┘         │         ├──→ E6 (Claims)
                                                   │         │
E10 (Partner) ─────────────────────────────────────┘         │
                                                              │
E9 (AI) ←── E5 + E11 ←── E6 ─────────────────────────────────┘
```

---

## 4. Release Plan Summary

| Release | Epics | Total Points | Duration | Team Size |
|---------|-------|-------------|----------|-----------|
| MVP | E1, E2, E3, E4, E10 (partial) | ~180 | 10-12 weeks | 8 devs |
| V1.0 | E5, E6, E7, E8 | ~157 | 8-10 weeks | 10 devs |
| V1.5 | E9, E10 (complete), E11 | ~107 | 8 weeks | 12 devs |
| V2.0 | E12, E13, E14 | ~120 | 10 weeks | 15 devs |
