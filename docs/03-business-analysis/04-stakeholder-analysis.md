# Stakeholder Analysis - Phân Tích Các Bên Liên Quan

---

## 1. Stakeholder Map

```
                        HIGH INFLUENCE
                             │
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         │   MANAGE CLOSELY  │   KEEP SATISFIED  │
         │                   │                   │
         │  • CEO/Founders   │  • Investors      │
         │  • CTO            │  • Regulatory     │
HIGH     │  • Insurance      │    Body           │
INTEREST │    Partners       │  • Board of       │
         │  • End Customers  │    Directors      │
         │  • Product Team   │                   │
         │                   │                   │
─────────┼───────────────────┼───────────────────┼─────────
         │                   │                   │
         │   KEEP INFORMED   │   MONITOR         │
         │                   │                   │
LOW      │  • Dev Team       │  • Competitors    │
INTEREST │  • Customer       │  • Media          │
         │    Support        │  • General        │
         │  • Marketing      │    Public         │
         │  • Legal Team     │                   │
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                        LOW INFLUENCE
```

---

## 2. Detailed Stakeholder Profiles

### 2.1. Internal Stakeholders

#### SH-001: CEO / Founders

| Attribute | Detail |
|-----------|--------|
| **Role** | Strategic decision maker, Company representative |
| **Interest** | Company success, growth, profitability, market position |
| **Influence** | Very High - Final decision authority |
| **Expectations** | - MVP delivery within timeline |
| | - Product-market fit validation |
| | - Clear path to profitability |
| | - Investor-ready metrics |
| **Communication** | Weekly exec summary, Monthly board report |
| **Risks** | Misaligned priorities, scope creep from top |
| **Management Strategy** | Regular 1:1, transparent progress reports, early flag risks |

---

#### SH-002: CTO / Tech Lead

| Attribute | Detail |
|-----------|--------|
| **Role** | Technical architecture, engineering leadership |
| **Interest** | System quality, scalability, security, team productivity |
| **Influence** | High - Technical decisions, architecture |
| **Expectations** | - Clean architecture, maintainable code |
| | - Security & compliance from day 1 |
| | - Scalable infrastructure |
| | - High engineering velocity |
| **Communication** | Daily standup, Sprint planning, Architecture reviews |
| **Risks** | Over-engineering, technology debt |
| **Management Strategy** | Involve in all technical decisions, architecture reviews |

---

#### SH-003: Product Manager

| Attribute | Detail |
|-----------|--------|
| **Role** | Product ownership, requirements, prioritization |
| **Interest** | User satisfaction, feature delivery, market fit |
| **Influence** | High - Feature prioritization, user experience |
| **Expectations** | - Clear requirements met |
| | - UX quality standards |
| | - Data-driven decisions |
| | - Fast iteration cycle |
| **Communication** | Daily standup, Sprint review, User research sessions |
| **Risks** | Scope creep, conflicting stakeholder requests |
| **Management Strategy** | Clear prioritization framework, regular user feedback |

---

#### SH-004: Engineering Team

| Attribute | Detail |
|-----------|--------|
| **Role** | Design, develop, test, deploy system |
| **Interest** | Clear requirements, good tools, professional growth |
| **Influence** | Medium - Implementation decisions, velocity |
| **Expectations** | - Clear user stories & acceptance criteria |
| | - Adequate time for quality work |
| | - Modern tech stack |
| | - CI/CD and DevOps support |
| **Communication** | Daily standup, Sprint ceremonies, Tech talks |
| **Risks** | Burnout, turnover, knowledge silos |
| **Management Strategy** | Proper sprint planning, knowledge sharing, fair workload |

---

#### SH-005: Customer Support Team

| Attribute | Detail |
|-----------|--------|
| **Role** | Handle customer inquiries, resolve issues |
| **Interest** | Good tools, clear processes, customer satisfaction |
| **Influence** | Low-Medium - Feedback on pain points |
| **Expectations** | - Admin tools for efficient operation |
| | - Knowledge base & FAQs |
| | - Escalation paths clear |
| | - Integration with ticketing system |
| **Communication** | Weekly sync, Monthly feedback session |
| **Risks** | Overwhelmed at launch, insufficient training |
| **Management Strategy** | Early involvement in UAT, training before launch |

---

#### SH-006: Marketing Team

| Attribute | Detail |
|-----------|--------|
| **Role** | Customer acquisition, brand building, content |
| **Interest** | Platform features for marketing, analytics, SEO |
| **Influence** | Medium - Impact on growth metrics |
| **Expectations** | - SEO-friendly platform |
| | - Landing page builder/CMS |
| | - Analytics & tracking integration |
| | - Referral system |
| **Communication** | Bi-weekly sync, Campaign planning |
| **Risks** | Unmet marketing automation needs |
| **Management Strategy** | Include marketing requirements early, provide analytics access |

---

### 2.2. External Stakeholders

#### SH-007: Insurance Company Partners (Insurers)

| Attribute | Detail |
|-----------|--------|
| **Role** | Product providers, underwriters, claims settlers |
| **Interest** | New distribution channel, qualified leads, low cost |
| **Influence** | Very High - Without them, no products to sell |
| **Expectations** | - Quality leads, high conversion |
| | - Brand representation standards |
| | - Accurate product information |
| | - Timely premium settlement |
| | - Compliance with regulations |
| **Communication** | Monthly partner review, Quarterly business review |
| **Risks** | Partner churn, API instability, slow integration |
| **Management Strategy** | Dedicated partner manager, SLA agreements, regular QBR |

**Key Insurance Partners (Target):**
| # | Company | Type | Priority | Products |
|---|---------|------|----------|----------|
| 1 | Bảo Việt | State-owned | High | All categories |
| 2 | PVI | Non-life leader | High | Motor, property, cargo |
| 3 | Prudential VN | Life leader | High | Life, health |
| 4 | Manulife VN | Life | Medium | Life, investment-linked |
| 5 | Bảo Minh | Non-life | Medium | Motor, travel, property |
| 6 | AIA Vietnam | Life/Health | High | Health, life |
| 7 | Liberty Insurance | Non-life | Medium | Motor, travel |
| 8 | FWD Vietnam | Life/Health | Medium | Life, health |
| 9 | PTI | Non-life | Medium | Motor, property |
| 10 | MSIG Vietnam | Non-life | Low | Business, cargo |

---

#### SH-008: End Customers (B2C)

| Attribute | Detail |
|-----------|--------|
| **Role** | Primary users, revenue source |
| **Interest** | Easy purchase, fair price, good coverage, fast claims |
| **Influence** | High (collective) - Market determines success |
| **Expectations** | - Simple, fast experience (< 5 min) |
| | - Transparent pricing, no hidden fees |
| | - Fair and fast claims settlement |
| | - Good customer support |
| | - Data privacy & security |
| **Communication** | In-app feedback, Surveys (NPS), Social media, Reviews |
| **Risks** | Low adoption, trust issues, competitor switch |
| **Management Strategy** | User research, NPS tracking, rapid response to feedback |

**Customer Segments:**
| Segment | Size | Key Needs | Priority |
|---------|------|-----------|----------|
| Young Professionals (25-35) | 8M | Motor, Health, Travel | P0 |
| Young Families (30-45) | 6M | Health, Life, Home | P0 |
| Middle-aged (45-60) | 4M | Life, Health, Retirement | P1 |
| SME Owners | 800K | Business, Group, Liability | P1 |
| Students (18-24) | 5M | Travel, Accident | P2 |

---

#### SH-009: Enterprise Clients (B2B)

| Attribute | Detail |
|-----------|--------|
| **Role** | Corporate customers buying group insurance |
| **Interest** | Employee benefits, cost efficiency, easy management |
| **Influence** | Medium-High - High revenue per account |
| **Expectations** | - Competitive group rates |
| | - Easy employee management |
| | - HR portal integration |
| | - Consolidated billing |
| | - Dedicated account manager |
| **Communication** | Account manager, Quarterly reviews |
| **Risks** | Long sales cycle, competitor pricing |
| **Management Strategy** | B2B sales team, tailored solutions, SLA guarantees |

---

#### SH-010: Regulatory Bodies

| Attribute | Detail |
|-----------|--------|
| **Role** | Oversight, licensing, consumer protection |
| **Interest** | Compliance, consumer protection, market stability |
| **Influence** | Very High - Can shut down operations |
| **Expectations** | - Full regulatory compliance |
| | - Proper licensing |
| | - Consumer data protection |
| | - Transparent practices |
| | - Regular reporting |
| **Communication** | Formal reporting, Compliance audits, Pre-consultations |
| **Risks** | License rejection, regulatory changes, penalties |
| **Management Strategy** | Legal team, proactive compliance, regular consultations |

**Regulatory Bodies:**
| Body | Jurisdiction | Requirements |
|------|-------------|-------------|
| Bộ Tài chính (MOF) | Insurance industry oversight | Business license, compliance |
| Cục Quản lý Giám sát BH | Insurance supervision | Broker/Agent license |
| Ngân hàng Nhà nước (SBV) | Payment services | Payment license (if applicable) |
| Bộ Công Thương | E-commerce | E-commerce registration |
| Bộ TT&TT | Data protection | PDPA compliance |

---

#### SH-011: Investors

| Attribute | Detail |
|-----------|--------|
| **Role** | Capital providers, strategic advisors |
| **Interest** | ROI, growth metrics, market position, exit potential |
| **Influence** | High - Funding decisions, board seats |
| **Expectations** | - Clear growth trajectory |
| | - Efficient capital deployment |
| | - Strong unit economics |
| | - Competitive moat |
| | - Regular transparent reporting |
| **Communication** | Monthly investor update, Quarterly board meeting |
| **Risks** | Missed targets, market downturn, competition |
| **Management Strategy** | Transparent reporting, early communication of challenges |

---

#### SH-012: Payment Service Providers

| Attribute | Detail |
|-----------|--------|
| **Role** | Enable online payment processing |
| **Interest** | Transaction volume, fees, integration quality |
| **Influence** | Medium - Payment is critical but alternatives exist |
| **Expectations** | - Integration compliance |
| | - Transaction volume commitments |
| | - Security standards (PCI-DSS) |
| **Communication** | Technical support channel, Quarterly review |
| **Risks** | Service outage, fee increases, API changes |
| **Management Strategy** | Multiple providers (redundancy), SLA monitoring |

---

## 3. RACI Matrix

| Decision/Activity | CEO | CTO | PM | Eng | Support | Partner | Legal |
|-------------------|-----|-----|-----|-----|---------|---------|-------|
| Product Strategy | A | C | R | I | I | C | I |
| Technical Architecture | I | A | C | R | I | I | I |
| Feature Prioritization | C | C | A | R | C | C | I |
| Partner Selection | A | C | C | I | I | R | C |
| Pricing/Commission | A | I | R | I | I | C | C |
| Security/Compliance | I | A | I | R | I | I | C |
| Go-to-Market | A | I | R | I | C | C | I |
| Claims Process Design | C | I | A | R | C | C | C |
| Customer Experience | C | I | A | R | C | I | I |
| Budget Allocation | A | C | C | I | I | I | I |

**Legend:** R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 4. Communication Plan

| Stakeholder | Method | Frequency | Content | Owner |
|-------------|--------|-----------|---------|-------|
| CEO/Board | Report + Meeting | Monthly | KPIs, progress, risks | PM |
| CTO | Standup + Review | Daily/Weekly | Tech decisions, blockers | Tech Lead |
| Product Team | Sprint Ceremonies | Bi-weekly | Stories, velocity, demos | PM |
| Engineering | Standup + Retro | Daily/Bi-weekly | Tasks, blockers, improvements | Tech Lead |
| Insurance Partners | Business Review | Monthly | Performance, pipeline, issues | BD Manager |
| Customers | Newsletter + In-app | Monthly | Updates, tips, promotions | Marketing |
| Investors | Update Email | Monthly | Metrics, milestones, asks | CEO |
| Regulatory | Formal Report | Quarterly | Compliance status, incidents | Legal |
| Support Team | Sync Meeting | Weekly | Issues, feedback, training | Ops Manager |

---

## 5. Stakeholder Engagement Strategy

### Priority Actions (First 3 Months)

| # | Action | Stakeholder | Owner | Timeline |
|---|--------|-------------|-------|----------|
| 1 | Sign 3 insurance partner contracts | Insurers | BD | Month 1-2 |
| 2 | Complete regulatory pre-consultation | Regulatory | Legal | Month 1 |
| 3 | Hire core engineering team (8 people) | Team | CTO/HR | Month 1-2 |
| 4 | Secure seed funding | Investors | CEO | Month 1 |
| 5 | Customer research (50 interviews) | Customers | PM | Month 1-2 |
| 6 | Payment gateway integration approval | Payment PSPs | CTO | Month 2 |
| 7 | Beta user recruitment (500 users) | Customers | Marketing | Month 3 |
| 8 | Staff training (support, operations) | Team | Ops | Month 3 |
