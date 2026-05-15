# Security Test Report Template - Mẫu Báo Cáo Kiểm Thử Bảo Mật

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |

---

## 1. Report Summary

| Field | Value |
|-------|-------|
| Test Date | [DD/MM/YYYY] |
| Build/Version | [v0.1.x] |
| Environment | Staging |
| Tools | OWASP ZAP, Snyk, SonarQube, GitLeaks |
| Scope | Full application scan |
| Executed By | [Security Engineer] |
| Status | ☐ Pass / ☐ Fail / ☐ Conditional |

---

## 2. Executive Summary

**Overall Security Posture:** ☐ Secure / ☐ Acceptable / ☐ At Risk / ☐ Critical

**Findings Summary:**

| Severity | Count | Fixed | Open | Accepted Risk |
|----------|-------|-------|------|---------------|
| Critical | --- | --- | --- | --- |
| High | --- | --- | --- | --- |
| Medium | --- | --- | --- | --- |
| Low | --- | --- | --- | --- |
| Informational | --- | --- | --- | --- |
| **Total** | **---** | **---** | **---** | **---** |

**Compliance Status:**

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP Top 10 | ☐ Compliant / ☐ Non-compliant | |
| PCI-DSS (Payment) | ☐ Compliant / ☐ Non-compliant | |
| PDPA (Data Protection) | ☐ Compliant / ☐ Non-compliant | |
| Insurance Regulations | ☐ Compliant / ☐ Non-compliant | |

---

## 3. Scan Results - OWASP Top 10 (2021)

### A01: Broken Access Control

| Test | Result | Details |
|------|--------|---------|
| IDOR (Insecure Direct Object Reference) | ☐ Pass / ☐ Fail | |
| Privilege Escalation (vertical) | ☐ Pass / ☐ Fail | |
| Privilege Escalation (horizontal) | ☐ Pass / ☐ Fail | |
| Missing Function Level Access Control | ☐ Pass / ☐ Fail | |
| CORS Misconfiguration | ☐ Pass / ☐ Fail | |
| Directory Traversal | ☐ Pass / ☐ Fail | |
| Force Browsing | ☐ Pass / ☐ Fail | |

**Findings:**
| # | Finding | Severity | URL/Endpoint | Status |
|---|---------|----------|-------------|--------|
| | | | | |

---

### A02: Cryptographic Failures

| Test | Result | Details |
|------|--------|---------|
| TLS Version (≥ 1.2) | ☐ Pass / ☐ Fail | |
| Certificate Validity | ☐ Pass / ☐ Fail | |
| Sensitive Data in URL | ☐ Pass / ☐ Fail | |
| Data Encryption at Rest | ☐ Pass / ☐ Fail | |
| Weak Cipher Suites | ☐ Pass / ☐ Fail | |
| Password Hashing (bcrypt) | ☐ Pass / ☐ Fail | |
| Sensitive Data in Logs | ☐ Pass / ☐ Fail | |
| PII Exposure in API Response | ☐ Pass / ☐ Fail | |

**Findings:**
| # | Finding | Severity | Status |
|---|---------|----------|--------|
| | | | |

---

### A03: Injection

| Test | Result | Details |
|------|--------|---------|
| SQL Injection (all inputs) | ☐ Pass / ☐ Fail | |
| NoSQL Injection | ☐ Pass / ☐ Fail | |
| OS Command Injection | ☐ Pass / ☐ Fail | |
| LDAP Injection | ☐ Pass / ☐ Fail | N/A |
| XSS - Reflected | ☐ Pass / ☐ Fail | |
| XSS - Stored | ☐ Pass / ☐ Fail | |
| XSS - DOM-based | ☐ Pass / ☐ Fail | |
| SSRF (Server-Side Request Forgery) | ☐ Pass / ☐ Fail | |
| Template Injection | ☐ Pass / ☐ Fail | |

**Findings:**
| # | Finding | Severity | Input/Field | Status |
|---|---------|----------|------------|--------|
| | | | | |

---

### A04: Insecure Design

| Test | Result | Details |
|------|--------|---------|
| Business Logic Flaws | ☐ Pass / ☐ Fail | |
| Missing Rate Limiting | ☐ Pass / ☐ Fail | |
| Race Conditions | ☐ Pass / ☐ Fail | |
| Insufficient Validation | ☐ Pass / ☐ Fail | |
| Abuse Case Testing | ☐ Pass / ☐ Fail | |

**Business Logic Tests:**
| # | Test Case | Result | Details |
|---|-----------|--------|---------|
| 1 | Negative payment amount | ☐ Pass / ☐ Fail | |
| 2 | Quote manipulation (price change) | ☐ Pass / ☐ Fail | |
| 3 | Policy start date in past | ☐ Pass / ☐ Fail | |
| 4 | Claim amount > sum insured | ☐ Pass / ☐ Fail | |
| 5 | Double payment submission | ☐ Pass / ☐ Fail | |
| 6 | Skip underwriting step | ☐ Pass / ☐ Fail | |
| 7 | Access cancelled policy features | ☐ Pass / ☐ Fail | |

---

### A05: Security Misconfiguration

| Test | Result | Details |
|------|--------|---------|
| Default Credentials | ☐ Pass / ☐ Fail | |
| Unnecessary Features Enabled | ☐ Pass / ☐ Fail | |
| Error Messages (Stack Traces) | ☐ Pass / ☐ Fail | |
| Directory Listing | ☐ Pass / ☐ Fail | |
| Unnecessary HTTP Methods | ☐ Pass / ☐ Fail | |
| Security Headers | ☐ Pass / ☐ Fail | |
| Cloud Storage Permissions | ☐ Pass / ☐ Fail | |

**Security Headers Check:**
| Header | Expected | Actual | Status |
|--------|----------|--------|--------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains | | ☐ |
| Content-Security-Policy | [policy] | | ☐ |
| X-Content-Type-Options | nosniff | | ☐ |
| X-Frame-Options | DENY or SAMEORIGIN | | ☐ |
| X-XSS-Protection | 0 (rely on CSP) | | ☐ |
| Referrer-Policy | strict-origin-when-cross-origin | | ☐ |
| Permissions-Policy | [policy] | | ☐ |
| Cache-Control | no-store (for sensitive) | | ☐ |

---

### A06: Vulnerable and Outdated Components

| Test | Result | Details |
|------|--------|---------|
| Known Vulnerability Scan (Snyk) | ☐ Pass / ☐ Fail | |
| Outdated Dependencies | ☐ Pass / ☐ Fail | |
| EOL Components | ☐ Pass / ☐ Fail | |
| License Compliance | ☐ Pass / ☐ Fail | |

**Vulnerable Dependencies Found:**
| Package | Version | Vulnerability | Severity | Fix Available | Status |
|---------|---------|---------------|----------|---------------|--------|
| | | | | | |
| | | | | | |

---

### A07: Identification and Authentication Failures

| Test | Result | Details |
|------|--------|---------|
| Brute Force Protection | ☐ Pass / ☐ Fail | |
| Credential Stuffing Protection | ☐ Pass / ☐ Fail | |
| Weak Password Allowed | ☐ Pass / ☐ Fail | |
| Session Fixation | ☐ Pass / ☐ Fail | |
| Session Timeout | ☐ Pass / ☐ Fail | |
| JWT Token Validation | ☐ Pass / ☐ Fail | |
| Token Expiration | ☐ Pass / ☐ Fail | |
| MFA Bypass | ☐ Pass / ☐ Fail | |
| Password Reset Flaws | ☐ Pass / ☐ Fail | |
| Account Enumeration | ☐ Pass / ☐ Fail | |

---

### A08: Software and Data Integrity Failures

| Test | Result | Details |
|------|--------|---------|
| Insecure Deserialization | ☐ Pass / ☐ Fail | |
| CI/CD Pipeline Security | ☐ Pass / ☐ Fail | |
| Unsigned Updates/Packages | ☐ Pass / ☐ Fail | |
| Integrity Verification | ☐ Pass / ☐ Fail | |

---

### A09: Security Logging and Monitoring Failures

| Test | Result | Details |
|------|--------|---------|
| Login Attempts Logged | ☐ Pass / ☐ Fail | |
| Failed Auth Logged | ☐ Pass / ☐ Fail | |
| High-value Transactions Logged | ☐ Pass / ☐ Fail | |
| Logs Protected from Tampering | ☐ Pass / ☐ Fail | |
| Alerting Configured | ☐ Pass / ☐ Fail | |
| Audit Trail Complete | ☐ Pass / ☐ Fail | |
| PII Not in Logs | ☐ Pass / ☐ Fail | |

---

### A10: Server-Side Request Forgery (SSRF)

| Test | Result | Details |
|------|--------|---------|
| URL Input Validation | ☐ Pass / ☐ Fail | |
| Internal Network Access | ☐ Pass / ☐ Fail | |
| Cloud Metadata Access | ☐ Pass / ☐ Fail | |
| File Schema Access | ☐ Pass / ☐ Fail | |

---

## 4. Application-Specific Security Tests

### 4.1. Payment Security

| Test | Result | Details |
|------|--------|---------|
| Payment amount tampering (client-side) | ☐ Pass / ☐ Fail | |
| Payment replay attack | ☐ Pass / ☐ Fail | |
| Callback URL spoofing | ☐ Pass / ☐ Fail | |
| Card data never stored | ☐ Pass / ☐ Fail | |
| Payment token security | ☐ Pass / ☐ Fail | |
| Refund manipulation | ☐ Pass / ☐ Fail | |

### 4.2. File Upload Security

| Test | Result | Details |
|------|--------|---------|
| Malicious file upload (webshell) | ☐ Pass / ☐ Fail | |
| File type validation bypass | ☐ Pass / ☐ Fail | |
| Oversized file (DoS) | ☐ Pass / ☐ Fail | |
| Path traversal in filename | ☐ Pass / ☐ Fail | |
| Stored file access control | ☐ Pass / ☐ Fail | |
| Content-type validation | ☐ Pass / ☐ Fail | |

### 4.3. API Security

| Test | Result | Details |
|------|--------|---------|
| Rate limiting enforced | ☐ Pass / ☐ Fail | |
| API key rotation | ☐ Pass / ☐ Fail | |
| Mass assignment | ☐ Pass / ☐ Fail | |
| Excessive data exposure | ☐ Pass / ☐ Fail | |
| Broken object level authorization | ☐ Pass / ☐ Fail | |
| Input size limits | ☐ Pass / ☐ Fail | |
| GraphQL-specific (if applicable) | ☐ Pass / ☐ Fail / ☐ N/A | |

### 4.4. Data Protection (PDPA Compliance)

| Test | Result | Details |
|------|--------|---------|
| Consent collection before data processing | ☐ Pass / ☐ Fail | |
| Data minimization | ☐ Pass / ☐ Fail | |
| Right to access (data export) | ☐ Pass / ☐ Fail | |
| Right to erasure (data deletion) | ☐ Pass / ☐ Fail | |
| Data breach notification capability | ☐ Pass / ☐ Fail | |
| Cross-border data transfer controls | ☐ Pass / ☐ Fail | |
| Data retention enforcement | ☐ Pass / ☐ Fail | |

---

## 5. Vulnerability Details

### 5.1. Critical Findings

#### VULN-001: [Title]

| Field | Value |
|-------|-------|
| Severity | Critical |
| CVSS Score | --- |
| Category | OWASP A0X |
| Affected URL/Component | |
| Description | |
| Impact | |
| Steps to Reproduce | |
| Evidence | [Screenshot/Request/Response] |
| Remediation | |
| Status | ☐ Open / ☐ Fixed / ☐ Accepted Risk |

---

### 5.2. High Findings

#### VULN-002: [Title]

| Field | Value |
|-------|-------|
| Severity | High |
| CVSS Score | --- |
| Category | OWASP A0X |
| Affected URL/Component | |
| Description | |
| Impact | |
| Remediation | |
| Status | ☐ Open / ☐ Fixed / ☐ Accepted Risk |

---

## 6. Static Analysis Results (SAST)

### 6.1. SonarQube Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Security Hotspots | --- | 0 critical | ☐ |
| Vulnerabilities | --- | 0 | ☐ |
| Security Rating | --- | A | ☐ |
| Code Smells (security-related) | --- | < 10 | ☐ |

### 6.2. Snyk Scan Results

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Direct Dependencies | --- | --- | --- | --- |
| Transitive Dependencies | --- | --- | --- | --- |
| License Issues | --- | --- | --- | --- |

### 6.3. Secret Detection (GitLeaks)

| Finding | Status |
|---------|--------|
| Hardcoded API keys | ☐ None found / ☐ Found |
| Database credentials | ☐ None found / ☐ Found |
| JWT secrets | ☐ None found / ☐ Found |
| Third-party tokens | ☐ None found / ☐ Found |
| Private keys | ☐ None found / ☐ Found |

---

## 7. Remediation Plan

### 7.1. Immediate Actions (Before Release)

| # | Vulnerability | Severity | Owner | ETA | Status |
|---|--------------|----------|-------|-----|--------|
| 1 | | Critical | | | |
| 2 | | High | | | |
| 3 | | High | | | |

### 7.2. Short-term (Post-Release, Sprint +1)

| # | Vulnerability | Severity | Owner | ETA |
|---|--------------|----------|-------|-----|
| 1 | | Medium | | |
| 2 | | Medium | | |

### 7.3. Accepted Risks

| # | Vulnerability | Severity | Justification | Reviewed By | Expiry |
|---|--------------|----------|--------------|-------------|--------|
| 1 | | | | | |

---

## 8. Recommendations

### 8.1. Security Improvements

| # | Recommendation | Priority | Effort |
|---|---------------|----------|--------|
| 1 | Implement WAF (Web Application Firewall) | High | Medium |
| 2 | Add security headers automation in CI | High | Low |
| 3 | Implement DAST in CI pipeline | Medium | Medium |
| 4 | Schedule quarterly penetration testing | High | High |
| 5 | Security awareness training for developers | Medium | Low |
| 6 | Implement bug bounty program | Low | Medium |

### 8.2. Monitoring Improvements

| # | Recommendation | Priority |
|---|---------------|----------|
| 1 | Alert on multiple failed login attempts from same IP | High |
| 2 | Alert on unusual payment patterns | High |
| 3 | Alert on admin actions outside business hours | Medium |
| 4 | Monitor for data exfiltration patterns | High |

---

## 9. Conclusion

**Security Assessment:** ☐ Ready for Production / ☐ Conditional / ☐ Not Ready

**Conditions for Release (if conditional):**
1. [Condition]
2. [Condition]

**Next Security Assessment:** [Date - typically quarterly or before major release]

---

## 10. Sign-Off

| Role | Name | Date |
|------|------|------|
| Security Engineer | | |
| Tech Lead | | |
| QA Lead | | |
| CTO / Security Officer | | |
