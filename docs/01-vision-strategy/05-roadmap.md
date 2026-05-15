# Product Roadmap - Lộ Trình Sản Phẩm

## 1. High-Level Roadmap (3-Year View)

```
═══════════════════════════════════════════════════════════════════════════
                         INSURANCE SYSTEM ROADMAP
═══════════════════════════════════════════════════════════════════════════

YEAR 1 (2026)                    YEAR 2 (2027)               YEAR 3 (2028)
─────────────────────────────────────────────────────────────────────────

PHASE 1: Foundation     PHASE 2: Growth      PHASE 3: Scale    PHASE 4: Ecosystem
(Q1-Q2)                (Q3-Q4)              (Q1-Q2)           (Q3-Q4+)

┌─────────────┐     ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│ MVP Launch  │     │ Product      │    │ B2B Launch   │   │ SEA          │
│ Motor + Health│   │ Expansion    │    │ Mobile App   │   │ Expansion    │
│ Travel      │     │ Life Ins     │    │ Open API     │   │ Embedded Ins │
│ Payment     │     │ Home Ins     │    │ White-label  │   │ Blockchain   │
│ Basic Claims│     │ AI Engine    │    │ Bancassurance│   │ IoT          │
└─────────────┘     └──────────────┘    └──────────────┘   └──────────────┘
```

## 2. Detailed Quarterly Roadmap - Year 1

### Q1/2026 (Tháng 1-3): MVP Development & Launch

#### Sprint 1-2 (Week 1-4): Core Infrastructure
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| User Auth | Registration, Login, JWT | P0 | 2 weeks |
| Product Catalog | Insurance products listing | P0 | 2 weeks |
| Database Schema | Core domain models | P0 | 1 week |
| API Gateway | Routing, rate limiting | P0 | 1 week |
| CI/CD Pipeline | Automated deployment | P0 | 1 week |
| Admin Panel (basic) | Product management | P1 | 2 weeks |

#### Sprint 3-4 (Week 5-8): Motor Insurance
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| Motor Quote Engine | Price calculation | P0 | 2 weeks |
| Vehicle Information Form | Data collection | P0 | 1 week |
| Insurer Integration #1 | API connection | P0 | 2 weeks |
| Insurer Integration #2 | Second partner | P0 | 2 weeks |
| Policy Issuance | Generate policy document | P0 | 1 week |
| Email Notifications | Confirmation, receipts | P1 | 1 week |

#### Sprint 5-6 (Week 9-12): Payment & Launch
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| VNPay Integration | Payment gateway | P0 | 1 week |
| Momo Integration | Payment gateway | P0 | 1 week |
| Travel Insurance | Simple product launch | P1 | 2 weeks |
| Customer Dashboard | Policy management | P0 | 2 weeks |
| Landing Pages | Marketing pages | P0 | 1 week |
| QA & Bug fixes | Testing, stabilization | P0 | 2 weeks |
| **MVP LAUNCH** | Go-live | P0 | - |

### Q2/2026 (Tháng 4-6): Health Insurance & Growth

#### Sprint 7-8 (Week 13-16): Health Insurance
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| Health Quote Engine | Multi-plan pricing | P0 | 2 weeks |
| Health Declaration Form | Medical questionnaire | P0 | 2 weeks |
| Auto-underwriting (basic) | Rule-based approval | P0 | 2 weeks |
| Waiting Period Logic | Business rules | P0 | 1 week |
| Health Insurer Integration | 3 partners | P0 | 3 weeks |

#### Sprint 9-10 (Week 17-20): Comparison & UX
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| Multi-insurer Comparison | Side-by-side compare | P0 | 2 weeks |
| Product Recommendation | Basic algorithm | P1 | 2 weeks |
| Improved Onboarding | User flow optimization | P1 | 1 week |
| ZaloPay Integration | Payment gateway | P1 | 1 week |
| Customer Support Chat | Live chat integration | P0 | 1 week |
| Performance Optimization | Load time, caching | P1 | 1 week |

#### Sprint 11-12 (Week 21-24): Claims & Retention
| Feature | Description | Priority | Effort |
|---------|-------------|----------|--------|
| Claims Submission Portal | Online claim filing | P0 | 2 weeks |
| Document Upload | Photos, receipts | P0 | 1 week |
| Claims Tracking | Status updates | P0 | 1 week |
| Renewal Reminders | Automated emails/SMS | P1 | 1 week |
| Referral Program | Invite & earn | P1 | 2 weeks |
| Analytics Dashboard (admin) | Business metrics | P1 | 2 weeks |

### Q3/2026 (Tháng 7-9): Life Insurance & AI

| Feature | Timeline | Priority |
|---------|----------|----------|
| Life Insurance Products | Week 25-30 | P0 |
| AI Recommendation Engine v1 | Week 27-32 | P0 |
| Personal Accident Insurance | Week 29-32 | P1 |
| Home Insurance | Week 31-34 | P1 |
| Advanced Underwriting Rules | Week 25-28 | P0 |
| Mobile App (MVP) | Week 25-36 | P0 |
| A/B Testing Framework | Week 28-30 | P1 |
| Customer Segmentation | Week 30-33 | P1 |

### Q4/2026 (Tháng 10-12): Business Insurance & Scale

| Feature | Timeline | Priority |
|---------|----------|----------|
| Business Insurance Products | Week 37-42 | P0 |
| Group Health Insurance | Week 39-44 | P0 |
| Liability Insurance | Week 41-44 | P1 |
| Enterprise Dashboard | Week 37-40 | P0 |
| API v2 (Partner Integration) | Week 38-42 | P0 |
| Advanced Analytics & BI | Week 40-44 | P1 |
| Mobile App v1.0 Launch | Week 43-44 | P0 |
| Performance & Security Audit | Week 45-48 | P0 |

## 3. Feature Priority Matrix

### MoSCoW Prioritization

#### Must Have (P0)
- User registration & authentication
- Product catalog & pricing
- Online quote generation
- Policy purchase & payment
- Policy management dashboard
- Basic claims submission
- Email/SMS notifications
- Admin panel (product, user management)
- Multi-insurer integration (3+)
- Security (encryption, HTTPS, auth)

#### Should Have (P1)
- Multi-insurer comparison
- AI product recommendation
- Mobile app
- Live chat support
- Referral program
- Renewal automation
- Document upload for claims
- Advanced analytics

#### Could Have (P2)
- Chatbot/virtual assistant
- Video call consultation
- Telematics integration
- Health tracking
- Gamification/rewards
- Social features

#### Won't Have (this year)
- Blockchain verification
- IoT integration
- International expansion
- Cryptocurrency payment
- Peer-to-peer insurance

## 4. Technical Milestones

| Milestone | Date | Criteria |
|-----------|------|----------|
| Architecture Complete | Week 2 | Tech stack finalized, infrastructure ready |
| Database Design Complete | Week 3 | All core entities, relationships defined |
| API v1 Spec Complete | Week 4 | OpenAPI spec, all endpoints documented |
| MVP Feature Freeze | Week 10 | No new features, only bug fixes |
| MVP Launch | Week 12 | Production deployment, monitoring live |
| 99.9% Uptime Achieved | Week 16 | Proven stability over 4 weeks |
| Mobile App Beta | Week 32 | TestFlight/Internal testing |
| API v2 Launch | Week 42 | Partner-ready, documented |
| Security Audit Pass | Week 46 | ISO 27001 preparation complete |

## 5. Dependencies & Risks

### Critical Dependencies
```
MVP Launch
├── Insurer API access (2+ partners signed)
├── Payment gateway approval (VNPay, Momo)
├── Legal/compliance clearance
├── Cloud infrastructure provisioned
└── Team fully staffed (core roles)

Health Insurance Launch
├── Medical underwriting rules from partners
├── Health declaration form approved
├── Regulatory approval for health products
└── Claims process agreement with partners

Mobile App Launch
├── Core platform stable (< 5 bugs/week)
├── API performance optimized (< 200ms)
├── Push notification infrastructure
└── App store approval
```

### Risk Register

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| Insurer API delays | High | Medium | Start integration early, have backup partners | CTO |
| Regulatory rejection | Critical | Low | Legal counsel, pre-discussions with regulator | CEO |
| Key hire departure | High | Medium | Competitive compensation, knowledge sharing | HR |
| Security breach | Critical | Low | Pen testing, bug bounty, encryption | CISO |
| Market downturn | Medium | Medium | Lean operations, runway management | CFO |

## 6. Release Strategy

### Release Cadence
- **Major releases**: Monthly (new features, products)
- **Minor releases**: Weekly (improvements, optimizations)
- **Hotfixes**: As needed (< 4 hours for critical)
- **Mobile releases**: Bi-weekly

### Feature Flags & Rollout
```
New Feature Rollout:
1. Internal testing (team) - 1 week
2. Beta users (5%) - 1 week
3. Gradual rollout (25% → 50% → 100%) - 2 weeks
4. General availability - announce
```
