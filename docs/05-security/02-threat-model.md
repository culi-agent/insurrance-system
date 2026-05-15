# Threat Model - Mô Hình Mối Đe Dọa

---

## 1. Tổng quan

### 1.1. Mục đích
Tài liệu này phân tích các mối đe dọa bảo mật đối với Insurance System Platform sử dụng phương pháp STRIDE, xác định attack surface, đánh giá rủi ro và đề xuất biện pháp giảm thiểu.

### 1.2. Phạm vi
- Customer-facing web application (Frontend)
- Backend API services
- Database và Storage systems
- Third-party integrations (Payment, Insurer APIs, eKYC)
- Internal admin systems
- Infrastructure (AWS Cloud)

---

## 2. System Architecture Overview

### 2.1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARIES                                 │
│                                                                           │
│  ┌─── EXTERNAL (Untrusted) ──────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  [Customers]  [Partners]  [Attackers]  [Bots]                      │  │
│  │       │            │           │          │                         │  │
│  └───────┼────────────┼───────────┼──────────┼────────────────────────┘  │
│          │            │           │          │                            │
│  ════════╪════════════╪═══════════╪══════════╪═══ BOUNDARY 1 ═══════════ │
│          │            │           │          │                            │
│  ┌─── DMZ ───────────────────────────────────────────────────────────┐  │
│  │  [WAF] [CDN] [Load Balancer] [API Gateway]                        │  │
│  └───────────────────────────────┬───────────────────────────────────┘  │
│                                   │                                       │
│  ════════════════════════════════╪═══════════ BOUNDARY 2 ═══════════════ │
│                                   │                                       │
│  ┌─── APPLICATION ZONE ─────────┼───────────────────────────────────┐  │
│  │  [Web App] [API Server] [Worker] [Scheduler]                      │  │
│  └───────────────────────────────┬───────────────────────────────────┘  │
│                                   │                                       │
│  ════════════════════════════════╪═══════════ BOUNDARY 3 ═══════════════ │
│                                   │                                       │
│  ┌─── DATA ZONE ────────────────┼───────────────────────────────────┐  │
│  │  [PostgreSQL] [Redis] [S3] [Elasticsearch]                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Data Flow Diagram (DFD)

```
                    ┌──────────┐
                    │ Customer │
                    └────┬─────┘
                         │ (1) HTTPS Request
                         ▼
                    ┌──────────┐
                    │   WAF    │ ── (2) Filter malicious traffic
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ API GW   │ ── (3) Auth, Rate Limit, Route
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌──────────┐ ┌────────┐ ┌────────┐
        │ Auth Svc │ │Quote   │ │Claims  │ ── (4) Process Logic
        └────┬─────┘ │Service │ │Service │
             │        └───┬────┘ └───┬────┘
             │            │          │
             ▼            ▼          ▼
        ┌──────────────────────────────────┐
        │          PostgreSQL DB            │ ── (5) Store/Retrieve
        └──────────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │       External Services           │ ── (6) Integration
        │ [Payment GW] [Insurer API] [eKYC]│
        └──────────────────────────────────┘
```

---

## 3. STRIDE Threat Analysis

### 3.1. Spoofing (Giả mạo danh tính)

| ID | Threat | Target | Likelihood | Impact | Risk |
|----|--------|--------|-----------|--------|------|
| S-01 | Credential stuffing attack | Customer login | HIGH | HIGH | CRITICAL |
| S-02 | Session hijacking (stolen JWT) | Authenticated sessions | MEDIUM | HIGH | HIGH |
| S-03 | Phishing (fake login page) | Customer credentials | HIGH | HIGH | CRITICAL |
| S-04 | API key theft from partner | Partner API access | MEDIUM | HIGH | HIGH |
| S-05 | Admin account compromise | Admin panel | LOW | CRITICAL | HIGH |
| S-06 | Service impersonation (internal) | Microservice communication | LOW | HIGH | MEDIUM |

**Mitigations:**

| Threat ID | Mitigation | Priority |
|-----------|-----------|----------|
| S-01 | Rate limiting (5 attempts/30min), CAPTCHA after 3 fails, breached password check | P0 |
| S-02 | Short-lived tokens (15min), HttpOnly + Secure cookies, token binding | P0 |
| S-03 | Email-based login alerts, domain monitoring, user education | P1 |
| S-04 | IP whitelist, key rotation, mutual TLS, usage monitoring | P0 |
| S-05 | Hardware MFA, IP restriction, privileged access management | P0 |
| S-06 | mTLS between services, service mesh (Istio), JWT verification | P1 |

### 3.2. Tampering (Giả mạo dữ liệu)

| ID | Threat | Target | Likelihood | Impact | Risk |
|----|--------|--------|-----------|--------|------|
| T-01 | Modify quote/premium amount | Payment flow | MEDIUM | CRITICAL | HIGH |
| T-02 | Alter claim documents | Claims processing | MEDIUM | HIGH | HIGH |
| T-03 | SQL Injection | Database queries | MEDIUM | CRITICAL | CRITICAL |
| T-04 | Parameter manipulation (IDOR) | API endpoints | HIGH | HIGH | CRITICAL |
| T-05 | Man-in-the-middle (API traffic) | Data in transit | LOW | HIGH | MEDIUM |
| T-06 | Modify audit logs | Log storage | LOW | HIGH | MEDIUM |

**Mitigations:**

| Threat ID | Mitigation | Priority |
|-----------|-----------|----------|
| T-01 | Server-side price calculation, signed quotes, integrity checks | P0 |
| T-02 | Document hash verification, immutable storage, audit trail | P0 |
| T-03 | Parameterized queries (ORM), input validation, WAF rules | P0 |
| T-04 | Authorization check on every resource, ownership validation | P0 |
| T-05 | TLS 1.3 everywhere, certificate pinning (mobile), HSTS | P1 |
| T-06 | Append-only log storage, separate log service, integrity monitoring | P1 |

### 3.3. Repudiation (Chối bỏ hành động)

| ID | Threat | Target | Likelihood | Impact | Risk |
|----|--------|--------|-----------|--------|------|
| R-01 | Customer denies purchase transaction | Policy issuance | MEDIUM | MEDIUM | MEDIUM |
| R-02 | Admin denies configuration change | System config | LOW | HIGH | MEDIUM |
| R-03 | Partner denies quote/policy data | Insurer integration | LOW | MEDIUM | LOW |
| R-04 | User denies claim submission | Claims | MEDIUM | MEDIUM | MEDIUM |

**Mitigations:**

| Threat ID | Mitigation | Priority |
|-----------|-----------|----------|
| R-01 | Digital signature, OTP confirmation, full audit log with timestamps | P1 |
| R-02 | All changes logged with user identity, approval workflow | P1 |
| R-03 | Signed API requests, request/response logging, timestamps | P2 |
| R-04 | Submission confirmation email/SMS, signed documents, IP logging | P1 |

### 3.4. Information Disclosure (Lộ thông tin)

| ID | Threat | Target | Likelihood | Impact | Risk |
|----|--------|--------|-----------|--------|------|
| I-01 | PII data breach (CCCD, health data) | Customer database | MEDIUM | CRITICAL | CRITICAL |
| I-02 | Exposed API keys/secrets in code | Source code repository | MEDIUM | CRITICAL | CRITICAL |
| I-03 | Verbose error messages | API responses | HIGH | MEDIUM | HIGH |
| I-04 | Unprotected backups | Database backups | LOW | CRITICAL | HIGH |
| I-05 | Insecure direct object reference | API endpoints | HIGH | HIGH | CRITICAL |
| I-06 | Log data containing sensitive info | Log storage | MEDIUM | HIGH | HIGH |

**Mitigations:**

| Threat ID | Mitigation | Priority |
|-----------|-----------|----------|
| I-01 | Encryption at rest (AES-256), access control, DLP, monitoring | P0 |
| I-02 | Secrets management (AWS SM), git-secrets hook, secret scanning | P0 |
| I-03 | Generic error responses, structured error codes, server-side logging only | P0 |
| I-04 | Encrypted backups, access logging, separate backup credentials | P1 |
| I-05 | UUID for IDs, ownership check on every request, API authorization | P0 |
| I-06 | Log sanitization, PII masking in logs, log access control | P1 |

### 3.5. Denial of Service (Từ chối dịch vụ)

| ID | Threat | Target | Likelihood | Impact | Risk |
|----|--------|--------|-----------|--------|------|
| D-01 | DDoS attack (volumetric) | Public endpoints | HIGH | HIGH | CRITICAL |
| D-02 | Application-layer DoS | Quote generation API | MEDIUM | HIGH | HIGH |
| D-03 | Database resource exhaustion | PostgreSQL | LOW | CRITICAL | HIGH |
| D-04 | Storage exhaustion (file upload) | S3/File storage | MEDIUM | MEDIUM | MEDIUM |
| D-05 | Third-party service unavailability | Payment/Insurer APIs | MEDIUM | HIGH | HIGH |

**Mitigations:**

| Threat ID | Mitigation | Priority |
|-----------|-----------|----------|
| D-01 | AWS Shield + CloudFront, rate limiting, geo-blocking | P0 |
| D-02 | Per-user rate limiting, request queuing, circuit breaker | P0 |
| D-03 | Connection pooling, query timeout, read replicas, caching | P1 |
| D-04 | File size limits, quota per user, virus scanning | P1 |
| D-05 | Circuit breaker, fallback responses, multi-provider | P1 |

### 3.6. Elevation of Privilege (Leo thang đặc quyền)

| ID | Threat | Target | Likelihood | Impact | Risk |
|----|--------|--------|-----------|--------|------|
| E-01 | Customer accesses other customer data | API authorization | HIGH | HIGH | CRITICAL |
| E-02 | Regular user gains admin access | Admin functions | LOW | CRITICAL | HIGH |
| E-03 | Partner accesses unauthorized data scope | Partner API | MEDIUM | HIGH | HIGH |
| E-04 | Container escape in cloud | Infrastructure | LOW | CRITICAL | HIGH |
| E-05 | JWT token manipulation | Authentication | MEDIUM | HIGH | HIGH |

**Mitigations:**

| Threat ID | Mitigation | Priority |
|-----------|-----------|----------|
| E-01 | Resource ownership validation on every request, UUID + user binding | P0 |
| E-02 | Strict RBAC, admin routes isolated, privilege escalation monitoring | P0 |
| E-03 | Scoped API keys, data access audit, contract enforcement | P1 |
| E-04 | Container hardening, non-root, read-only filesystem, security groups | P1 |
| E-05 | RS256 signing (asymmetric), token validation, short expiry | P0 |

---

## 4. Attack Surface Analysis

### 4.1. External Attack Surface

| Surface | Exposure | Risk Level | Controls |
|---------|----------|-----------|----------|
| Web Application (HTTPS) | Public | HIGH | WAF, CSP, input validation |
| REST API (/api/v1/*) | Public (authenticated) | HIGH | JWT auth, rate limiting, validation |
| Partner API | Semi-public (IP restricted) | MEDIUM | API key + OAuth, IP whitelist |
| WebSocket (notifications) | Authenticated | MEDIUM | Token validation, message validation |
| Email links (password reset) | Public | MEDIUM | Token expiry, one-time use |
| File Upload endpoints | Authenticated | HIGH | Type validation, size limit, virus scan |

### 4.2. Internal Attack Surface

| Surface | Exposure | Risk Level | Controls |
|---------|----------|-----------|----------|
| Admin Panel | VPN + MFA | MEDIUM | IP whitelist, hardware MFA, audit |
| Database (PostgreSQL) | Private subnet | LOW | Security groups, encrypted, no public IP |
| Redis Cache | Private subnet | LOW | AUTH required, no public IP |
| S3 Buckets | Private (presigned URLs) | MEDIUM | Bucket policies, encryption, logging |
| CI/CD Pipeline | Internal | MEDIUM | Branch protection, signed commits |
| Service-to-Service | Internal network | LOW | mTLS, service mesh |

---

## 5. Threat Scenarios (Attack Trees)

### 5.1. Scenario: Unauthorized Access to Customer Data

```
GOAL: Access other customer's PII/policy data
├── [OR] Exploit Authentication
│   ├── Credential stuffing (leaked passwords)
│   ├── Session hijacking (XSS → steal token)
│   └── Brute force (weak password)
│
├── [OR] Exploit Authorization (IDOR)
│   ├── Enumerate sequential IDs (GET /api/policies/123)
│   ├── Modify request parameters
│   └── Bypass ownership check
│
├── [OR] Exploit Application Vulnerability
│   ├── SQL Injection → dump database
│   ├── SSRF → access internal services
│   └── Path traversal → access files
│
└── [OR] Social Engineering
    ├── Phishing support agent
    ├── Impersonate customer to support
    └── Compromise partner account
```

### 5.2. Scenario: Financial Fraud

```
GOAL: Manipulate payment/premium amounts
├── [OR] Modify Transaction
│   ├── Intercept and modify API request (quote → purchase)
│   ├── Race condition in payment processing
│   └── Replay old (cheaper) quote
│
├── [OR] Fake Claims
│   ├── Submit fraudulent claim documents
│   ├── Inflate claim amount
│   └── Multiple claims for same incident
│
└── [OR] Commission Fraud
    ├── Fake policy creation + cancellation
    ├── Inflate partner transactions
    └── Manipulate reconciliation data
```

### 5.3. Scenario: System Disruption

```
GOAL: Disrupt insurance platform availability
├── [OR] DDoS
│   ├── Volumetric (flood bandwidth)
│   ├── Protocol (SYN flood)
│   └── Application (slow HTTP, quote generation spam)
│
├── [OR] Data Destruction
│   ├── SQL injection → DELETE/DROP
│   ├── Ransomware via compromised admin
│   └── Insider threat (disgruntled employee)
│
└── [OR] Supply Chain
    ├── Compromised npm dependency
    ├── Compromised Docker image
    └── Compromised CI/CD pipeline
```

---

## 6. Risk Matrix

### 6.1. Overall Risk Assessment

| Risk Level | Count | Priority |
|-----------|-------|----------|
| CRITICAL | 7 | Immediate remediation |
| HIGH | 10 | Remediate within 30 days |
| MEDIUM | 8 | Remediate within 90 days |
| LOW | 3 | Accept or remediate in next quarter |

### 6.2. Top 10 Risks (Prioritized)

| Rank | Threat | Risk | Status | Owner |
|------|--------|------|--------|-------|
| 1 | PII Data Breach (I-01) | CRITICAL | In Progress | Security Lead |
| 2 | SQL Injection (T-03) | CRITICAL | Mitigated (ORM) | Dev Lead |
| 3 | IDOR - Unauthorized data access (E-01) | CRITICAL | In Progress | Dev Lead |
| 4 | Credential Stuffing (S-01) | CRITICAL | Partial | Security Lead |
| 5 | DDoS Attack (D-01) | CRITICAL | Mitigated (Shield) | DevOps |
| 6 | Secrets in Code (I-02) | CRITICAL | Mitigated (SM) | DevOps |
| 7 | Payment Manipulation (T-01) | CRITICAL | In Progress | Dev Lead |
| 8 | Admin Account Compromise (S-05) | HIGH | Mitigated (MFA) | Security |
| 9 | JWT Manipulation (E-05) | HIGH | Mitigated (RS256) | Dev Lead |
| 10 | Application DoS (D-02) | HIGH | Partial | DevOps |

---

## 7. Security Controls Summary

### 7.1. Preventive Controls

| Control | Purpose | Implementation |
|---------|---------|---------------|
| WAF | Block malicious requests | AWS WAF + managed rules |
| Input Validation | Prevent injection | JSON Schema + Zod |
| RBAC | Prevent unauthorized access | Custom middleware + DB |
| Encryption | Protect data confidentiality | AES-256, TLS 1.3 |
| Rate Limiting | Prevent abuse | Express rate-limit + Redis |
| CSP Headers | Prevent XSS | Helmet.js |

### 7.2. Detective Controls

| Control | Purpose | Implementation |
|---------|---------|---------------|
| Audit Logging | Track all actions | Structured logging + ELK |
| IDS/IPS | Detect intrusion | AWS GuardDuty |
| Anomaly Detection | Detect unusual patterns | CloudWatch Anomaly |
| Vulnerability Scanning | Find weaknesses | Snyk + OWASP ZAP |
| File Integrity Monitoring | Detect tampering | AWS Config |

### 7.3. Corrective Controls

| Control | Purpose | Implementation |
|---------|---------|---------------|
| Auto-scaling | Handle traffic spikes | AWS Auto Scaling |
| Circuit Breaker | Isolate failures | Custom + libraries |
| Auto-ban | Block attackers | WAF + Lambda |
| Backup/Restore | Recover from data loss | Automated snapshots |
| Incident Response | Handle security events | Runbooks + PagerDuty |

---

## 8. Review & Update

| Activity | Frequency | Trigger |
|----------|-----------|---------|
| Threat Model Review | Quarterly | Scheduled |
| Update after major feature | Per release | New feature with security impact |
| Post-incident update | After SEV-1/2 | Security incident |
| Architecture change | As needed | Infrastructure change |
| Annual comprehensive review | Yearly | Compliance requirement |

---

*Document Version: 1.0*
*Last Updated: 2024-01*
*Methodology: STRIDE + Attack Trees*
*Owner: Security Architect*
