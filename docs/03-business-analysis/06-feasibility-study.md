# Feasibility Study - Nghiên Cứu Khả Thi

---

## 1. Executive Summary

### 1.1. Kết luận
Dựa trên phân tích toàn diện về thị trường, kỹ thuật, tài chính, vận hành và pháp lý, dự án Insurance System Platform được đánh giá **KHẢ THI** với các điều kiện:

| Dimension | Feasibility | Confidence | Key Condition |
|-----------|-------------|-----------|---------------|
| Market | ✅ Feasible | 80% | Customer adoption > 3% conversion |
| Technical | ✅ Feasible | 90% | Team capability + insurer API access |
| Financial | ✅ Feasible | 75% | Secure Series A within 6 months |
| Operational | ✅ Feasible | 85% | Hire key roles within 2 months |
| Legal/Regulatory | ⚠️ Conditional | 70% | Obtain broker license pre-launch |
| **Overall** | **✅ GO** | **80%** | **Address legal risk early** |

---

## 2. Market Feasibility

### 2.1. Market Size Analysis

**Vietnam Insurance Market:**
| Metric | Value | Source |
|--------|-------|--------|
| Total market size (2025) | ~$10B GWP | ISA Report |
| Annual growth rate | 15-20% | Industry forecast |
| Insurance penetration | ~3.5% of GDP | World Bank |
| Life insurance | ~60% of market | ISA |
| Non-life insurance | ~40% of market | ISA |
| Online insurance penetration | < 3% of total | Estimate |

**Digital Insurance Opportunity:**
| Segment | Market Size | Online Potential (5yr) | Our Target (3yr) |
|---------|-------------|----------------------|------------------|
| Motor (compulsory + voluntary) | $2B | 15% = $300M | $30M |
| Health (individual) | $1.5B | 10% = $150M | $15M |
| Travel | $200M | 30% = $60M | $10M |
| Life | $6B | 5% = $300M | $20M |
| Property | $500M | 10% = $50M | $5M |
| **Total addressable** | **$10.2B** | **$860M** | **$80M** |

### 2.2. Customer Demand Validation

**Evidence of demand:**
1. **Internet penetration**: 79% (78M users), growing
2. **E-commerce growth**: 25% YoY, people comfortable buying online
3. **Fintech adoption**: 60M+ e-wallet users (MoMo, ZaloPay)
4. **Insurance awareness**: Increasing post-COVID
5. **Pain with traditional**: Complaints about agent pressure, lack of transparency

**Survey Data (secondary research):**
- 65% of millennials prefer researching insurance online
- 45% would buy insurance online if trusted platform exists
- #1 barrier: Trust (52%), #2: Complexity (31%), #3: Price uncertainty (17%)

### 2.3. Competitive Landscape

| Competitor | Strength | Weakness | Threat Level |
|-----------|----------|----------|-------------|
| Bảo Việt Direct | Brand, market share | Poor UX, slow, single provider | Medium |
| Saladin | Good tech, VC-backed | Limited products, small team | High |
| PapaInsure | Mobile-first | Very early stage, limited features | Low |
| Tiki Insurance | User base (20M+) | Not core business, limited commitment | Medium |
| Traditional agents | Trust, relationships | High cost, limited scalability | Low |

**Competitive Advantage Assessment:**
- ✅ All-in-one platform (no competitor has this yet)
- ✅ Multi-insurer comparison
- ✅ Tech-first approach with AI recommendation
- ⚠️ Need to build trust quickly (new brand)
- ⚠️ Need to onboard insurers (existing relationships help)

### 2.4. Market Feasibility Conclusion

> **FEASIBLE** - Large growing market with clear pain points and low online penetration. First-mover advantage in comprehensive InsurTech platform. Key risk: customer trust and adoption speed.

---

## 3. Technical Feasibility

### 3.1. Technology Assessment

| Component | Technology | Maturity | Risk | Availability |
|-----------|-----------|----------|------|-------------|
| Web Frontend | React + TypeScript | Mature | Low | Abundant talent |
| Backend API | Node.js + Express | Mature | Low | Abundant talent |
| Database | PostgreSQL | Mature | Low | Well-supported |
| Cache | Redis | Mature | Low | Well-supported |
| Cloud | AWS | Mature | Low | Available in region |
| Payment | VNPay/Momo API | Mature | Low | Documented APIs |
| eKYC | FPT.AI / VNPT | Mature | Medium | Local providers |
| PDF Generation | Puppeteer/PDFKit | Mature | Low | Open source |
| Email | SendGrid | Mature | Low | Global service |
| SMS | FPT Telecom | Mature | Low | Local provider |

### 3.2. Integration Feasibility

| Integration | API Availability | Complexity | Timeline |
|------------|-----------------|-----------|----------|
| VNPay | Well-documented REST API | Low | 1-2 weeks |
| Momo | Documented REST API | Low | 1-2 weeks |
| ZaloPay | Documented REST API | Low | 1-2 weeks |
| eKYC (FPT.AI) | REST API + SDK | Medium | 2-3 weeks |
| Insurer APIs | Varies (REST/SOAP) | High | 4-8 weeks each |
| SendGrid | Well-documented | Low | 1 week |
| SMS Gateway | REST API | Low | 1 week |

**Insurer API Challenge:**
- Some insurers have modern APIs → Easy integration
- Some use SOAP/XML → Need adapter layer
- Some have no API → Manual process / build custom middleware
- **Mitigation**: Start with API-ready insurers, build adapters for others

### 3.3. Performance Feasibility

| Requirement | Solution | Confidence |
|-------------|----------|-----------|
| 10K concurrent users | AWS Auto-scaling, load balancer | 95% |
| < 500ms API response | Redis cache, DB optimization, CDN | 90% |
| 99.9% uptime | Multi-AZ, auto-failover, health checks | 90% |
| Real-time quotes | Parallel API calls, caching, fallback | 85% |
| Secure data handling | AES-256, TLS 1.3, AWS KMS | 95% |

### 3.4. Team Capability

**Required Skills:**
| Skill | Required | Available in Market | Hiring Difficulty |
|-------|----------|--------------------|--------------------|
| React/TypeScript Frontend | 3-4 devs | High | Easy |
| Node.js/Express Backend | 3-4 devs | High | Easy |
| PostgreSQL/Redis | 1-2 devs | Medium | Medium |
| DevOps/Cloud (AWS) | 1-2 devs | Medium | Medium |
| UI/UX Design | 1-2 | Medium | Medium |
| Product Management | 1-2 | Medium | Medium |
| Insurance domain expert | 1 | Low | Hard |
| Security specialist | 1 | Low | Hard |

### 3.5. Technical Feasibility Conclusion

> **FEASIBLE** - All core technologies are mature and well-supported. Main challenge is insurer API integration variety. Talent is available in Vietnam market. Estimated build time: 3 months for MVP with team of 8-10.

---

## 4. Financial Feasibility

### 4.1. Development Cost Estimate

**Phase 1: MVP (Month 1-3)**
| Category | Monthly Cost | 3-Month Total |
|----------|-------------|---------------|
| Engineering (8 people × 40M avg) | 320M | 960M |
| Product & Design (3 people) | 120M | 360M |
| Cloud Infrastructure | 30M | 90M |
| Tools & Services | 20M | 60M |
| Office & Operations | 50M | 150M |
| Legal & Compliance | 30M | 90M |
| **Subtotal** | **570M** | **1,710M** |

**Phase 2: V1.0 (Month 4-6)**
| Category | Monthly Cost | 3-Month Total |
|----------|-------------|---------------|
| Engineering (12 people) | 480M | 1,440M |
| Product, Design, QA (5 people) | 200M | 600M |
| Marketing & Growth | 500M | 1,500M |
| Cloud & Services | 50M | 150M |
| Operations & Support (5 people) | 150M | 450M |
| Office & Misc | 80M | 240M |
| **Subtotal** | **1,460M** | **4,380M** |

**Total Year 1 Estimated Cost: 15-20 tỷ VND**

### 4.2. Revenue Projections

**Revenue Model: Commission-based**

| Month | Policies Sold | Avg Premium | GWP | Commission (25%) | Revenue |
|-------|-------------|-------------|-----|-----------------|---------|
| 4 | 200 | 3M | 600M | 150M | 150M |
| 5 | 500 | 3M | 1.5B | 375M | 375M |
| 6 | 1,000 | 3.5M | 3.5B | 875M | 875M |
| 7 | 1,500 | 3.5M | 5.25B | 1.3B | 1.3B |
| 8 | 2,000 | 4M | 8B | 2B | 2B |
| 9 | 3,000 | 4M | 12B | 3B | 3B |
| 10 | 4,000 | 4.5M | 18B | 4.5B | 4.5B |
| 11 | 5,000 | 4.5M | 22.5B | 5.6B | 5.6B |
| 12 | 6,000 | 5M | 30B | 7.5B | 7.5B |
| **Year 1 Total** | **~23,200** | - | **~101B** | **~25.3B** | **~25.3B** |

*Note: Revenue ramps up from Month 4 (post-launch). Actual numbers depend on PMF.*

### 4.3. Unit Economics

| Metric | Conservative | Base Case | Optimistic |
|--------|-------------|-----------|-----------|
| CAC | 300K VND | 200K VND | 150K VND |
| Avg Revenue per Policy | 750K VND | 1M VND | 1.5M VND |
| Avg Policies per Customer | 1.2 | 1.5 | 2.0 |
| Customer LTV (3-year) | 2.7M VND | 4.5M VND | 9M VND |
| LTV/CAC Ratio | 9x | 22.5x | 60x |
| Payback Period | 5 months | 3 months | 1.5 months |
| Gross Margin | 55% | 65% | 75% |

### 4.4. Break-Even Analysis

| Scenario | Break-Even Point | Monthly Revenue Needed | Policies/Month Needed |
|----------|-----------------|----------------------|---------------------|
| Conservative | Month 24 | 1.5B | 2,000 |
| Base Case | Month 18 | 1.2B | 1,500 |
| Optimistic | Month 12 | 1B | 1,200 |

### 4.5. Funding Requirements

| Round | Amount | Use | Timeline |
|-------|--------|-----|----------|
| Seed | $500K (12.5B VND) | MVP development, initial team | Pre-launch |
| Series A | $3M (75B VND) | Growth, marketing, scale team | Month 6-9 |
| Series B | $15M (375B VND) | Market leadership, expansion | Month 18-24 |

### 4.6. Financial Feasibility Conclusion

> **FEASIBLE** - Unit economics are attractive (LTV/CAC > 10x in base case). Break-even achievable in 18-24 months. Requires $500K seed + $3M Series A. Key risk: revenue ramp speed and CAC management.

---

## 5. Operational Feasibility

### 5.1. Organization Readiness

| Area | Current State | Required State | Gap | Action |
|------|-------------|---------------|-----|--------|
| Team | Founding team (3) | Core team (20) | -17 | Aggressive hiring Month 1-2 |
| Process | Ad-hoc | Agile/Scrum | Gap | Implement from Day 1 |
| Tools | Basic | Full stack | Gap | Setup in Sprint 1 |
| Knowledge | General tech | Insurance + tech | Gap | Hire domain expert |
| Operations | None | 24/7 support ready | Gap | Hire ops by Month 3 |

### 5.2. Operational Model

**Day-to-day Operations:**
| Function | Headcount (Launch) | Tools | SLA |
|----------|-------------------|-------|-----|
| Customer Support | 5 | Zendesk, Live chat | < 2 min response |
| Claims Processing | 3 | Admin panel | < 7 days settlement |
| Partner Management | 2 | CRM | Monthly reviews |
| Finance/Reconciliation | 2 | Admin panel + Excel | Monthly close D+5 |
| Tech Operations | 2 | Monitoring, On-call | 99.9% uptime |

### 5.3. Key Operational Challenges

| Challenge | Severity | Solution |
|-----------|----------|----------|
| 24/7 customer support | High | Chatbot for off-hours, escalation for urgent |
| Claims expertise | High | Hire ex-insurance claims professionals |
| Regulatory reporting | Medium | Automate reports, compliance officer |
| Peak load management | Medium | Auto-scaling, capacity planning |
| Partner coordination | Medium | Dedicated partner managers, SLA tracking |

### 5.4. Operational Feasibility Conclusion

> **FEASIBLE** - Standard operational model for InsurTech. Key is hiring insurance domain experts early. Operations can scale with automation (claims bot, auto-underwriting).

---

## 6. Legal & Regulatory Feasibility

### 6.1. Required Licenses & Permits

| License/Permit | Issuing Body | Timeline | Difficulty | Status |
|---------------|-------------|----------|-----------|--------|
| Giấy phép môi giới BH | Bộ Tài chính | 3-6 months | High | Not started |
| Đăng ký kinh doanh | Sở KH&ĐT | 2-4 weeks | Low | Not started |
| Đăng ký website TMĐT | Bộ Công thương | 2-4 weeks | Low | Not started |
| Thông báo hoạt động ứng dụng | Bộ TT&TT | 4-8 weeks | Medium | Not started |

### 6.2. Key Legal Requirements

| Requirement | Law/Regulation | Compliance Approach |
|-------------|---------------|-------------------|
| Vốn pháp định môi giới BH | Luật KDBH 2022 | Đảm bảo vốn ≥ 4 tỷ VND |
| Nhân sự có chứng chỉ | Thông tư BTC | Tuyển người có chứng chỉ môi giới |
| Bảo vệ dữ liệu cá nhân | NĐ 13/2023 PDPA | Privacy policy, consent, DPO |
| Chống rửa tiền | Luật PCRT | KYC verification, transaction monitoring |
| Hợp đồng điện tử | Luật GDĐT | E-signature comply with regulations |
| Quảng cáo BH | Thông tư BTC | Review ad content pre-publish |
| Lưu trữ dữ liệu | NĐ 13/2023 | Store data in Vietnam |

### 6.3. Legal Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| License delay > 6 months | 30% | Critical | Alternative: partner with licensed broker |
| PDPA non-compliance penalty | 10% | High | Hire DPO, conduct DPIA |
| Contract dispute with insurer | 20% | Medium | Clear SLA, legal review all contracts |
| Customer legal complaint | 30% | Medium | Clear T&C, dispute resolution process |

### 6.4. Legal Feasibility Conclusion

> **CONDITIONALLY FEASIBLE** - Must obtain broker license before launch. Timeline is 3-6 months which may delay launch. Mitigation: partner with existing licensed entity initially while own license is processed.

---

## 7. Schedule Feasibility

### 7.1. Critical Path

```
Month 1 ──▶ Month 2 ──▶ Month 3 ──▶ Month 4 ──▶ Month 5 ──▶ Month 6
  │            │            │            │            │            │
  ▼            ▼            ▼            ▼            ▼            ▼
[Hire Team] [Core Dev]   [MVP Dev]   [Launch]   [Iterate]   [Scale]
[Legal]     [Partner     [Payment    [Growth]   [Health    [Life
 Start]      Sign]        Integr]               Ins]       Ins]
[Arch       [Insurer     [QA/UAT]
 Design]     API Dev]
```

### 7.2. Schedule Risk Assessment

| Milestone | Planned | Risk of Delay | Impact if Delayed |
|-----------|---------|---------------|-------------------|
| Team hired (core) | Month 1 | Medium (30%) | 2-4 week delay all |
| Architecture complete | Week 2 | Low (10%) | Minor |
| First insurer integrated | Month 2 | High (40%) | MVP delay |
| Payment gateway live | Month 2.5 | Low (15%) | MVP delay |
| MVP Launch | Month 3 | Medium (35%) | Revenue delay |
| License obtained | Month 3-6 | High (40%) | Cannot operate legally |

### 7.3. Schedule Feasibility Conclusion

> **FEASIBLE with buffer** - 3-month MVP timeline is aggressive but achievable with experienced team. Recommend 4-month plan with 1-month buffer. License timeline is the biggest unknown.

---

## 8. Overall Recommendation

### 8.1. Go/No-Go Decision

| Criteria | Weight | Score (1-10) | Weighted |
|----------|--------|-------------|----------|
| Market opportunity | 25% | 8 | 2.0 |
| Technical feasibility | 20% | 9 | 1.8 |
| Financial viability | 20% | 7 | 1.4 |
| Operational readiness | 15% | 7 | 1.05 |
| Legal/Regulatory | 15% | 6 | 0.9 |
| Competitive position | 5% | 7 | 0.35 |
| **Total** | **100%** | - | **7.5/10** |

### 8.2. Recommendation: **GO** ✅

**With conditions:**
1. Secure broker license path (own or partner) within 2 months
2. Sign at least 2 insurer partners within 2 months
3. Raise seed funding ($500K) within 1 month
4. Hire core team (8 engineers + PM + insurance expert) within 2 months

### 8.3. Immediate Next Steps

| # | Action | Owner | Deadline | Priority |
|---|--------|-------|----------|----------|
| 1 | Engage insurance lawyer, start license process | CEO | Week 1 | Critical |
| 2 | Begin hiring (post job listings) | CEO/CTO | Week 1 | Critical |
| 3 | Pitch seed investors | CEO | Week 1-4 | Critical |
| 4 | Contact top 5 insurers for partnership | BD | Week 1-2 | High |
| 5 | Finalize technology architecture | CTO | Week 2 | High |
| 6 | Setup development environment & CI/CD | CTO | Week 2 | High |
| 7 | Customer research (interviews) | PM | Week 1-4 | High |
| 8 | Register company & business license | Legal | Week 1 | High |
