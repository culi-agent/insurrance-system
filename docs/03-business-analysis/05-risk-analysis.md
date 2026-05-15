# Risk Analysis - Phân Tích Rủi Ro

---

## 1. Risk Assessment Framework

### 1.1. Risk Matrix

```
                    IMPACT
        ┌─────┬─────┬─────┬─────┬─────┐
        │  1  │  2  │  3  │  4  │  5  │
        │Very │ Low │ Med │High │Very │
        │Low  │     │     │     │High │
   ┌────┼─────┼─────┼─────┼─────┼─────┤
 5 │V.H │  5  │ 10  │ 15  │ 20  │ 25  │ ← CRITICAL
   ├────┼─────┼─────┼─────┼─────┼─────┤
 4 │High│  4  │  8  │ 12  │ 16  │ 20  │ ← HIGH
P  ├────┼─────┼─────┼─────┼─────┼─────┤
R  │ 3  │  3  │  6  │  9  │ 12  │ 15  │ ← MEDIUM
O  │Med │     │     │     │     │     │
B  ├────┼─────┼─────┼─────┼─────┼─────┤
   │ 2  │  2  │  4  │  6  │  8  │ 10  │ ← LOW
   │Low │     │     │     │     │     │
   ├────┼─────┼─────┼─────┼─────┼─────┤
 1 │V.L │  1  │  2  │  3  │  4  │  5  │ ← MINIMAL
   └────┴─────┴─────┴─────┴─────┴─────┘

Score 15-25: Critical (Immediate action required)
Score 8-14:  High (Action plan within 1 week)
Score 4-7:   Medium (Monitor and plan)
Score 1-3:   Low (Accept and monitor)
```

---

## 2. Risk Register

### 2.1. Strategic & Business Risks

| ID | Risk | Probability | Impact | Score | Category |
|----|------|-------------|--------|-------|----------|
| R-001 | Giấy phép kinh doanh bị từ chối hoặc delay | 2 | 5 | 10 | Regulatory |
| R-002 | Không tìm được đủ đối tác bảo hiểm | 2 | 5 | 10 | Partnership |
| R-003 | Thị trường không chấp nhận mua BH online | 3 | 4 | 12 | Market |
| R-004 | Đối thủ lớn ra mắt sản phẩm tương tự | 4 | 3 | 12 | Competition |
| R-005 | Không đạt product-market fit | 3 | 5 | 15 | Product |
| R-006 | Hết vốn trước khi break-even | 2 | 5 | 10 | Financial |
| R-007 | Thay đổi quy định bảo hiểm bất lợi | 2 | 4 | 8 | Regulatory |
| R-008 | Partner rút lui sau khi đã launch | 2 | 4 | 8 | Partnership |

---

### 2.2. Technical & Product Risks

| ID | Risk | Probability | Impact | Score | Category |
|----|------|-------------|--------|-------|----------|
| R-101 | Data breach / lộ thông tin khách hàng | 2 | 5 | 10 | Security |
| R-102 | System downtime kéo dài (> 4h) | 2 | 4 | 8 | Technical |
| R-103 | Insurer API không ổn định / thay đổi | 3 | 3 | 9 | Integration |
| R-104 | Payment gateway lỗi trong peak hours | 2 | 4 | 8 | Technical |
| R-105 | Performance degradation khi scale | 3 | 3 | 9 | Technical |
| R-106 | Technical debt tích lũy quá nhiều | 4 | 3 | 12 | Technical |
| R-107 | Lỗi tính giá bảo hiểm (pricing bug) | 2 | 5 | 10 | Product |
| R-108 | eKYC accuracy thấp, chặn user hợp lệ | 3 | 3 | 9 | Product |

---

### 2.3. Operational Risks

| ID | Risk | Probability | Impact | Score | Category |
|----|------|-------------|--------|-------|----------|
| R-201 | Claims processing chậm, khách hàng phản hồi xấu | 3 | 4 | 12 | Operations |
| R-202 | Không tuyển đủ nhân sự chất lượng | 3 | 3 | 9 | HR |
| R-203 | Key person departure (CTO/PM) | 2 | 4 | 8 | HR |
| R-204 | Customer support quá tải khi launch | 4 | 3 | 12 | Operations |
| R-205 | Fraud/gian lận bảo hiểm qua platform | 3 | 4 | 12 | Fraud |
| R-206 | Financial reconciliation errors | 2 | 4 | 8 | Finance |
| R-207 | Communication breakdown với partners | 2 | 3 | 6 | Operations |

---

### 2.4. External Risks

| ID | Risk | Probability | Impact | Score | Category |
|----|------|-------------|--------|-------|----------|
| R-301 | Suy thoái kinh tế, giảm nhu cầu BH | 2 | 3 | 6 | Economic |
| R-302 | Thiên tai/dịch bệnh gây rush claims | 2 | 4 | 8 | External |
| R-303 | Negative press/PR crisis | 2 | 4 | 8 | Reputation |
| R-304 | DDoS attack | 2 | 3 | 6 | Security |
| R-305 | Cloud provider outage (AWS) | 1 | 4 | 4 | Technical |
| R-306 | Thay đổi chính sách payment gateway | 2 | 3 | 6 | External |

---

## 3. Top Risks - Detailed Mitigation Plans

### R-005: Không đạt Product-Market Fit (Score: 15 - CRITICAL)

| Attribute | Detail |
|-----------|--------|
| **Description** | Sản phẩm không đáp ứng nhu cầu thực sự của thị trường, khách hàng không chấp nhận mua BH online |
| **Root Causes** | - Thiếu user research; - UX phức tạp; - Giá không cạnh tranh; - Thiếu trust |
| **Impact** | - Không có revenue; - Burn cash; - Team morale drop; - Investor confidence loss |
| **Early Warning Signs** | - Low conversion rate (< 1%); - High bounce rate; - Negative NPS; - Low repeat purchase |

**Mitigation Plan:**
| # | Action | Owner | Timeline | Status |
|---|--------|-------|----------|--------|
| 1 | Conduct 50+ customer interviews before MVP | PM | Month 1-2 | Planned |
| 2 | Launch with minimal product (motor + travel) to validate | PM | Month 3 | Planned |
| 3 | A/B test pricing and UX extensively | PM/Eng | Month 3-6 | Planned |
| 4 | Weekly user feedback sessions | PM | Ongoing | Planned |
| 5 | Pivot-ready: maintain flexible architecture | CTO | Ongoing | Planned |
| 6 | Set clear PMF metrics (NPS > 40, 40% organic) | PM | Month 1 | Planned |

**Contingency:** If no PMF after 6 months → Pivot to B2B/white-label model

---

### R-003: Thị trường không chấp nhận mua BH online (Score: 12 - HIGH)

| Attribute | Detail |
|-----------|--------|
| **Description** | Người Việt vẫn prefer mua BH qua đại lý/agent, không trust online |
| **Root Causes** | - Văn hóa cần tư vấn trực tiếp; - Thiếu trust online; - Sản phẩm BH phức tạp |
| **Impact** | - Low conversion; - High CAC; - Cannot achieve scale |
| **Early Warning Signs** | - Cart abandonment > 80%; - "Need to talk to someone" feedback |

**Mitigation Plan:**
| # | Action | Owner | Timeline |
|---|--------|-------|----------|
| 1 | Hybrid model: online + phone consultation | PM | Launch |
| 2 | Build trust signals (reviews, certifications, partner logos) | Marketing | Month 1-3 |
| 3 | Start with simple products (motor compulsory) that don't need much trust | PM | MVP |
| 4 | Video consultation option for complex products | PM | Month 6 |
| 5 | Money-back guarantee / easy cancellation prominent | PM | Launch |
| 6 | Social proof: customer testimonials, press coverage | Marketing | Month 3+ |

---

### R-001: Giấy phép kinh doanh bị từ chối/delay (Score: 10 - HIGH)

| Attribute | Detail |
|-----------|--------|
| **Description** | Không nhận được giấy phép môi giới/đại lý BH đúng hạn |
| **Root Causes** | - Quy trình xin phép phức tạp; - Thiếu điều kiện; - Thay đổi quy định |
| **Impact** | - Cannot legally operate; - Delay launch 3-6 months; - Wasted development cost |

**Mitigation Plan:**
| # | Action | Owner | Timeline |
|---|--------|-------|----------|
| 1 | Engage insurance lawyer from Day 1 | CEO/Legal | Immediately |
| 2 | Pre-consultation with Cục QLGSBH | CEO/Legal | Month 1 |
| 3 | Prepare application documents early | Legal | Month 1-2 |
| 4 | Plan B: Partner with existing licensed broker | BD | Month 2 |
| 5 | Comply with all capital requirements | CFO | Month 1 |

---

### R-101: Data Breach (Score: 10 - HIGH)

| Attribute | Detail |
|-----------|--------|
| **Description** | Lộ thông tin cá nhân khách hàng (CCCD, health data, financial info) |
| **Root Causes** | - Code vulnerabilities; - Misconfigured infrastructure; - Insider threat; - Third-party breach |
| **Impact** | - Legal liability; - Customer trust destroyed; - Regulatory penalties; - Media crisis |

**Mitigation Plan:**
| # | Action | Owner | Timeline |
|---|--------|-------|----------|
| 1 | Encryption at rest (AES-256) for all PII | CTO | Sprint 1 |
| 2 | HTTPS/TLS 1.3 for all communications | CTO | Sprint 1 |
| 3 | Regular penetration testing (quarterly) | CTO | Month 3, ongoing |
| 4 | OWASP Top 10 compliance in development | Eng Team | Ongoing |
| 5 | Security training for all developers | CTO | Month 1, quarterly |
| 6 | Data access audit logs | Eng Team | Sprint 2 |
| 7 | Incident response plan documented | CTO/Legal | Month 2 |
| 8 | Bug bounty program (post-launch) | CTO | Month 6 |
| 9 | SOC 2 Type II certification | CTO | Month 12 |

---

### R-205: Fraud/Gian lận bảo hiểm (Score: 12 - HIGH)

| Attribute | Detail |
|-----------|--------|
| **Description** | Gian lận khi mua BH hoặc claim (fake documents, staged accidents) |
| **Root Causes** | - Weak verification; - Auto-approval too broad; - Organized fraud rings |
| **Impact** | - Financial loss; - Higher premiums for genuine customers; - Partner trust erosion |

**Mitigation Plan:**
| # | Action | Owner | Timeline |
|---|--------|-------|----------|
| 1 | eKYC verification for all purchases | CTO | MVP |
| 2 | Document verification in claims process | Ops | MVP |
| 3 | Fraud scoring model (rule-based initially) | CTO/PM | Month 6 |
| 4 | Velocity checks (multiple claims in short period) | Eng | Month 4 |
| 5 | Cross-reference claims with industry database | Ops | Month 9 |
| 6 | Manual review for claims > 10M VND | Ops | MVP |
| 7 | AI-based fraud detection (ML model) | CTO | Year 2 |

---

## 4. Risk Response Strategies

| Strategy | When to Use | Example |
|----------|------------|---------|
| **Avoid** | Eliminate the risk entirely | Don't store card numbers (use tokenization) |
| **Mitigate** | Reduce probability or impact | Regular security audits, multi-provider |
| **Transfer** | Shift risk to third party | Insurance for cyber risk, SLA with providers |
| **Accept** | Risk is low or unavoidable | Minor competitor features, cosmetic bugs |

---

## 5. Risk Monitoring & Review

### 5.1. Risk Dashboard Metrics

| Metric | Red | Yellow | Green |
|--------|-----|--------|-------|
| System Uptime | < 99% | 99-99.5% | > 99.5% |
| Security Incidents | Any critical | Minor (patched < 24h) | None |
| Customer Complaints | > 5%/day increase | 2-5% increase | Stable/decreasing |
| Conversion Rate | < 1% | 1-2% | > 3% |
| Claims Fraud Rate | > 5% | 2-5% | < 2% |
| Partner API Uptime | < 95% | 95-99% | > 99% |
| Cash Runway | < 3 months | 3-6 months | > 6 months |
| NPS | < 0 | 0-30 | > 30 |

### 5.2. Review Cadence

| Review Type | Frequency | Participants | Output |
|-------------|-----------|-------------|--------|
| Risk Status Update | Weekly | PM, CTO, Ops | Updated risk register |
| Risk Assessment | Monthly | Leadership team | Risk report to board |
| Security Review | Monthly | CTO, Security team | Vulnerability report |
| Compliance Audit | Quarterly | Legal, CTO, Ops | Audit report |
| Full Risk Review | Quarterly | All stakeholders | Updated strategy |
| Incident Post-mortem | Per incident | Relevant team | Lessons learned |

---

## 6. Business Continuity Plan (BCP)

### 6.1. Disaster Scenarios

| Scenario | RTO | RPO | Response |
|----------|-----|-----|----------|
| Server failure (single) | 5 min | 0 | Auto-failover to replica |
| Data center outage | 1 hour | 5 min | Failover to secondary AZ |
| Database corruption | 2 hours | 6 hours | Restore from backup |
| DDoS attack | 30 min | 0 | WAF + CDN + scale up |
| Payment gateway down | 5 min | 0 | Switch to backup provider |
| Complete data loss | 4 hours | 6 hours | Restore from off-site backup |
| Key staff unavailable | 1 day | N/A | Cross-training, documentation |

### 6.2. Incident Severity Levels

| Level | Definition | Response Time | Escalation |
|-------|-----------|---------------|------------|
| SEV-1 (Critical) | System down, data breach | 15 min | CTO + CEO immediately |
| SEV-2 (High) | Major feature broken, payment issues | 1 hour | CTO + PM |
| SEV-3 (Medium) | Feature degraded, workaround exists | 4 hours | Team Lead |
| SEV-4 (Low) | Minor bug, cosmetic issue | 24 hours | Engineer |
