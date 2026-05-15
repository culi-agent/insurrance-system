# Non-Functional Requirements (NFR) - Yêu Cầu Phi Chức Năng

---

## 1. Performance Requirements

### 1.1. Response Time

| Operation | Target (P95) | Max Acceptable | Measurement |
|-----------|-------------|----------------|-------------|
| Page Load (FCP) | < 1.5s | 3s | Lighthouse |
| Page Load (LCP) | < 2.5s | 4s | Lighthouse |
| API Response (simple) | < 200ms | 500ms | Server logs |
| API Response (complex) | < 500ms | 1s | Server logs |
| Quote Generation | < 3s | 10s | Application |
| Search Results | < 500ms | 1s | Application |
| PDF Generation | < 3s | 5s | Application |
| File Upload (10MB) | < 5s | 10s | Application |
| Payment Redirect | < 2s | 5s | Application |
| Database Query | < 50ms | 200ms | DB monitoring |

### 1.2. Throughput

| Metric | Normal Load | Peak Load | Stress |
|--------|-------------|-----------|--------|
| Concurrent Users | 5,000 | 10,000 | 20,000 |
| API Requests/sec | 500 | 1,000 | 2,000 |
| Transactions/day | 50,000 | 100,000 | 200,000 |
| Quotes/hour | 5,000 | 10,000 | 15,000 |
| Payments/hour | 500 | 1,000 | 2,000 |

### 1.3. Resource Utilization

| Resource | Normal | Alert | Critical |
|----------|--------|-------|----------|
| CPU Usage | < 60% | > 75% | > 90% |
| Memory Usage | < 70% | > 80% | > 90% |
| Disk Usage | < 60% | > 75% | > 85% |
| Network Bandwidth | < 50% | > 70% | > 85% |
| Database Connections | < 60% | > 75% | > 90% |

---

## 2. Scalability Requirements

### 2.1. Horizontal Scaling
- Application tier: Auto-scale from 2 to 20 instances
- Scale-up trigger: CPU > 70% for 5 minutes
- Scale-down trigger: CPU < 30% for 15 minutes
- Load balancer: Distribute traffic evenly (round-robin/least-connections)
- Stateless design: No server-side session affinity required

### 2.2. Data Scaling
- Database: Read replicas (1 primary + 2 read replicas)
- Sharding strategy: By customer_id (future, when > 10M records)
- Cache layer: Redis cluster (3 nodes)
- File storage: S3 with CloudFront CDN
- Search: Elasticsearch cluster (3 nodes)

### 2.3. Growth Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Registered Users | 100K | 500K | 2M |
| Active Policies | 50K | 250K | 1M |
| Monthly Transactions | 100K | 500K | 2M |
| Data Storage | 50GB | 200GB | 1TB |
| Document Storage | 100GB | 500GB | 2TB |
| API Calls/day | 1M | 5M | 20M |

---

## 3. Security Requirements

### 3.1. Authentication & Authorization

| Requirement | Implementation |
|-------------|---------------|
| Password Policy | Min 8 chars, complexity requirements |
| Password Storage | bcrypt with 12 salt rounds |
| Session Tokens | JWT (RS256), short-lived (15min access, 7d refresh) |
| MFA | OTP via SMS/Email (optional customer, mandatory admin) |
| Account Lockout | 5 failed attempts → 30 min lock |
| Session Management | Single active session per device type |
| API Authentication | JWT Bearer token + API Key (partners) |
| Admin Access | IP whitelist + VPN + MFA |

### 3.2. Data Protection

| Data Type | At Rest | In Transit | Access Control |
|-----------|---------|-----------|----------------|
| PII (name, CCCD, DOB) | AES-256 encryption | TLS 1.3 | Role-based |
| Financial (payment, bank) | AES-256 + tokenization | TLS 1.3 | Strict role-based |
| Health data | AES-256 encryption | TLS 1.3 | Need-to-know |
| Documents (scans, photos) | AES-256 encryption | TLS 1.3 | Owner + authorized |
| Passwords | bcrypt hash | TLS 1.3 | No plaintext access |
| Session tokens | N/A (memory) | TLS 1.3 | HttpOnly cookies |

### 3.3. Application Security (OWASP Top 10)

| Vulnerability | Mitigation |
|--------------|------------|
| A01: Broken Access Control | RBAC, resource ownership check, CORS |
| A02: Cryptographic Failures | TLS 1.3, AES-256, secure key management |
| A03: Injection | Parameterized queries, input validation, ORM |
| A04: Insecure Design | Threat modeling, security reviews |
| A05: Security Misconfiguration | Hardened defaults, automated scanning |
| A06: Vulnerable Components | Dependency scanning (Snyk), auto-update |
| A07: Authentication Failures | Rate limiting, MFA, secure session |
| A08: Software/Data Integrity | Signed deployments, CI/CD security |
| A09: Logging/Monitoring Failures | Centralized logging, alerting, audit trail |
| A10: SSRF | URL validation, network segmentation |

### 3.4. Compliance Security

| Standard | Requirement | Implementation |
|----------|-------------|---------------|
| PCI-DSS | Card data handling | Tokenization via gateway (never store card) |
| PDPA (Vietnam) | Data protection | Consent management, data minimization |
| Insurance Regs | Data retention | 10-year retention for policies |
| AML/KYC | Identity verification | eKYC integration, watchlist screening |

---

## 4. Availability & Reliability

### 4.1. Availability Targets

| Component | Target | Max Downtime/Year |
|-----------|--------|-------------------|
| Customer-facing web | 99.9% | 8.76 hours |
| API services | 99.9% | 8.76 hours |
| Payment processing | 99.95% | 4.38 hours |
| Admin panel | 99.5% | 43.8 hours |
| Background jobs | 99% | 87.6 hours |

### 4.2. Disaster Recovery

| Metric | Target | Implementation |
|--------|--------|---------------|
| RTO (Recovery Time Objective) | < 1 hour | Automated failover |
| RPO (Recovery Point Objective) | < 5 minutes | Continuous replication |
| Backup Frequency | Every 6 hours | Automated snapshots |
| Backup Retention | 30 days | Rolling backups |
| DR Testing | Quarterly | Simulated failover |
| Geographic Redundancy | Multi-AZ | AWS multi-AZ |

### 4.3. Fault Tolerance

| Scenario | Handling |
|----------|----------|
| Single server failure | Auto-replace instance, traffic rerouted |
| Database failure | Automatic failover to replica (< 60s) |
| Cache failure | Graceful degradation (bypass cache) |
| Payment gateway down | Show alternative methods, retry later |
| Insurer API down | Show cached quotes, mark as "indicative" |
| CDN failure | Fallback to origin |
| Third-party service down | Circuit breaker pattern, fallback response |

---

## 5. Usability Requirements

### 5.1. General Usability

| Requirement | Target |
|-------------|--------|
| Learnability | New user complete purchase without help |
| Task completion rate | > 85% for quote generation |
| Error rate | < 5% form submission errors |
| User satisfaction | SUS score > 70 |
| Help documentation | Contextual help on every page |
| Error messages | Clear, actionable, non-technical |

### 5.2. Accessibility (WCAG 2.1 Level AA)

| Criterion | Requirement |
|-----------|-------------|
| Perceivable | Alt text, captions, color contrast (4.5:1) |
| Operable | Keyboard navigation, no time limits, skip links |
| Understandable | Clear language, consistent navigation, error prevention |
| Robust | Valid HTML, ARIA labels, screen reader compatible |

### 5.3. Internationalization

| Feature | Support |
|---------|---------|
| Primary language | Vietnamese (vi-VN) |
| Secondary language | English (en-US) |
| Number format | Vietnamese (1.000.000 VND) |
| Date format | DD/MM/YYYY |
| Currency | VND (primary), USD (display only) |
| Text direction | LTR |
| Character encoding | UTF-8 |

---

## 6. Maintainability

### 6.1. Code Quality

| Metric | Target |
|--------|--------|
| Code coverage (unit tests) | > 80% |
| Code coverage (integration) | > 60% |
| Technical debt ratio | < 5% |
| Cyclomatic complexity | < 15 per function |
| Duplication | < 3% |
| Documentation coverage | > 70% (public APIs) |

### 6.2. Deployment

| Metric | Target |
|--------|--------|
| Deployment frequency | Daily (automated) |
| Lead time for changes | < 1 day |
| Change failure rate | < 5% |
| Mean time to recovery | < 30 minutes |
| Rollback time | < 5 minutes |
| Zero-downtime deployment | Required |

### 6.3. Monitoring & Observability

| Layer | Tool | Metrics |
|-------|------|---------|
| Infrastructure | CloudWatch / Prometheus | CPU, memory, disk, network |
| Application | APM (DataDog/NewRelic) | Response time, errors, throughput |
| Business | Custom dashboards | Revenue, conversions, claims |
| Logs | ELK Stack | Application logs, audit logs |
| Alerts | PagerDuty/OpsGenie | Critical issues, SLA breach |
| Uptime | Pingdom/UptimeRobot | Endpoint availability |

---

## 7. Compatibility

### 7.1. Browser Support

| Browser | Versions | Priority |
|---------|----------|----------|
| Chrome | Latest 2 | P0 |
| Safari | Latest 2 | P0 |
| Firefox | Latest 2 | P1 |
| Edge | Latest 2 | P1 |
| Samsung Internet | Latest | P2 |
| Opera | Latest | P2 |

### 7.2. Device Support

| Device Type | Screen Size | Priority |
|-------------|-------------|----------|
| Mobile | 320px - 767px | P0 |
| Tablet | 768px - 1023px | P1 |
| Desktop | 1024px - 1920px | P0 |
| Large Desktop | > 1920px | P2 |

### 7.3. Network Conditions

| Condition | Target |
|-----------|--------|
| 4G (10 Mbps) | Full functionality, < 3s load |
| 3G (1.5 Mbps) | Core functionality, < 8s load |
| Slow 3G (400 Kbps) | Basic functionality, < 15s load |
| Offline | Cached pages viewable, sync when online |

---

## 8. Legal & Regulatory

### 8.1. Data Residency
- All customer data MUST be stored in Vietnam
- Cloud provider: AWS Asia Pacific (Singapore) with Vietnam edge locations
- No cross-border data transfer without explicit consent
- Backup data also in Vietnam region

### 8.2. Data Retention

| Data Category | Retention | Post-Retention |
|--------------|-----------|----------------|
| Policy data | 10 years after expiry | Anonymize + archive |
| Claims data | 10 years after settlement | Anonymize + archive |
| Customer PII | Account life + 5 years | Delete |
| Payment records | 7 years | Archive |
| Audit logs | 5 years | Archive |
| Marketing consent | Until withdrawal + 1 year | Delete |
| Website analytics | 3 years | Aggregate |

### 8.3. Privacy Requirements
- Consent management (opt-in for marketing)
- Right to access (data export within 30 days)
- Right to rectification
- Right to erasure (with regulatory exceptions)
- Data breach notification (within 72 hours)
- Privacy impact assessment (for new features)
- Data Processing Agreement with all vendors
