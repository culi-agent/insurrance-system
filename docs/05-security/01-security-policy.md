# Security Policy - Chính Sách Bảo Mật

---

## 1. Tổng quan

### 1.1. Mục đích
Tài liệu này định nghĩa chính sách bảo mật toàn diện cho Insurance System Platform, đảm bảo bảo vệ dữ liệu khách hàng, tài sản hệ thống và tuân thủ các quy định pháp luật Việt Nam.

### 1.2. Phạm vi áp dụng
- Toàn bộ hệ thống Insurance Platform (Frontend, Backend, Database, Infrastructure)
- Tất cả nhân viên, đối tác, và nhà thầu có quyền truy cập hệ thống
- Dữ liệu khách hàng, dữ liệu tài chính, dữ liệu nghiệp vụ bảo hiểm

### 1.3. Đối tượng áp dụng

| Đối tượng | Trách nhiệm |
|-----------|-------------|
| Development Team | Tuân thủ secure coding, code review |
| Operations Team | Quản lý infrastructure, monitoring |
| Security Team | Audit, penetration testing, incident response |
| Management | Phê duyệt chính sách, cấp quyền |
| Partners (Insurers) | Tuân thủ API security, data handling |
| Third-party Vendors | Tuân thủ hợp đồng bảo mật |

---

## 2. Phân loại dữ liệu (Data Classification)

### 2.1. Mức độ phân loại

| Level | Classification | Mô tả | Ví dụ |
|-------|---------------|--------|--------|
| L1 | **PUBLIC** | Thông tin công khai | Trang web, sản phẩm bảo hiểm, FAQ |
| L2 | **INTERNAL** | Thông tin nội bộ | Quy trình, tài liệu kỹ thuật |
| L3 | **CONFIDENTIAL** | Thông tin mật | Dữ liệu khách hàng, hợp đồng |
| L4 | **RESTRICTED** | Thông tin tối mật | Mật khẩu, khóa bảo mật, dữ liệu thanh toán |

### 2.2. Xử lý theo mức phân loại

| Action | PUBLIC | INTERNAL | CONFIDENTIAL | RESTRICTED |
|--------|--------|----------|--------------|------------|
| Storage | Standard | Encrypted at rest | AES-256 | AES-256 + HSM |
| Transmission | HTTPS | HTTPS | TLS 1.3 | TLS 1.3 + mTLS |
| Access Control | Open | Role-based | Need-to-know | MFA + Approval |
| Logging | Basic | Standard | Full audit | Full audit + alert |
| Retention | Indefinite | 3 years | 10 years | Per regulation |
| Disposal | Standard delete | Secure delete | Crypto-erase | Physical destroy |

---

## 3. Access Control Policy

### 3.1. Nguyên tắc chung
- **Principle of Least Privilege (PoLP)**: Chỉ cấp quyền tối thiểu cần thiết
- **Need-to-Know**: Truy cập dựa trên nhu cầu công việc
- **Separation of Duties**: Phân tách quyền hạn (dev không có quyền production)
- **Zero Trust**: Không tin tưởng mặc định, luôn xác thực

### 3.2. Role-Based Access Control (RBAC)

| Role | System Access | Data Access | Admin Functions |
|------|--------------|-------------|-----------------|
| Super Admin | Full | All | All |
| System Admin | Infrastructure | L1-L3 | User management, config |
| Security Admin | Security tools | Audit logs | Security config, alerts |
| Developer | Dev/Staging env | L1-L2 (test data) | Deploy to dev/staging |
| QA Engineer | Staging/UAT | L1-L2 (test data) | Test execution |
| Support Agent | Support portal | L1-L3 (assigned customers) | Ticket management |
| Claims Handler | Claims system | L1-L3 (assigned claims) | Claims processing |
| Finance | Finance portal | L1-L3 (financial data) | Payment reconciliation |
| Partner API | API Gateway | L1-L3 (contracted scope) | None |

### 3.3. Authentication Requirements

| User Type | Method | MFA | Session Timeout | Max Sessions |
|-----------|--------|-----|-----------------|--------------|
| Customer | Email/Phone + Password | Optional (SMS/Email OTP) | 30 min idle / 24h max | 3 devices |
| Admin Staff | SSO (Google Workspace) | Mandatory (TOTP/Hardware Key) | 15 min idle / 8h max | 1 device |
| Developer | SSO + VPN | Mandatory (Hardware Key) | 15 min idle / 8h max | 1 device |
| Partner API | API Key + OAuth 2.0 | N/A (IP whitelist) | Token: 1h | N/A |
| Service-to-Service | mTLS + JWT | N/A | Token: 5 min | N/A |

### 3.4. Password Policy

| Requirement | Customer | Staff/Admin |
|-------------|----------|-------------|
| Minimum Length | 8 characters | 12 characters |
| Complexity | 1 uppercase + 1 number | 1 uppercase + 1 lowercase + 1 number + 1 special |
| History | Last 5 passwords | Last 12 passwords |
| Expiry | Never (encourage change) | 90 days |
| Lockout | 5 failed → 30 min lock | 3 failed → 15 min lock + alert |
| Recovery | OTP to email/phone | Admin approval + MFA |

---

## 4. Network Security Policy

### 4.1. Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    WAF (CloudFront)    │  ← DDoS Protection
                    │    + Rate Limiting     │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    Load Balancer       │  ← SSL Termination
                    │    (ALB)              │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                   │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌────────▼───────┐
    │  Public Subnet  │  │  Public    │  │  Public        │
    │  (Frontend CDN) │  │  (API GW)  │  │  (Bastion)     │
    └────────────────┘  └─────┬──────┘  └────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                   │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌────────▼───────┐
    │ Private Subnet  │  │  Private   │  │  Private       │
    │ (App Servers)   │  │  (Workers) │  │  (Internal)    │
    └────────────────┘  └────────────┘  └────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                   │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌────────▼───────┐
    │ Data Subnet     │  │  Data      │  │  Data          │
    │ (PostgreSQL)    │  │  (Redis)   │  │  (Elasticsearch)│
    └────────────────┘  └────────────┘  └────────────────┘
```

### 4.2. Firewall Rules

| Source | Destination | Port | Protocol | Action | Justification |
|--------|-------------|------|----------|--------|---------------|
| Internet | WAF/CDN | 443 | HTTPS | Allow | Public access |
| WAF | ALB | 443 | HTTPS | Allow | Filtered traffic |
| ALB | App Servers | 3000 | HTTP | Allow | Internal comm |
| App Servers | Database | 5432 | PostgreSQL | Allow | Data access |
| App Servers | Redis | 6379 | Redis | Allow | Cache access |
| App Servers | Elasticsearch | 9200 | HTTP | Allow | Search |
| VPN | Bastion | 22 | SSH | Allow | Admin access |
| Bastion | All Private | * | * | Allow | Maintenance |
| ALL | ALL | * | * | **Deny** | Default deny |

### 4.3. Network Segmentation
- **DMZ**: WAF, Load Balancer, CDN
- **Application Zone**: API servers, Worker processes
- **Data Zone**: Databases, Cache, Search (no direct internet access)
- **Management Zone**: Bastion, Monitoring, CI/CD (VPN only)

---

## 5. Application Security Policy

### 5.1. Secure Development Lifecycle (SDL)

| Phase | Security Activity | Tools | Responsible |
|-------|-------------------|-------|-------------|
| Design | Threat Modeling | STRIDE, Draw.io | Security + Architect |
| Coding | Secure Coding Guidelines | ESLint Security, SonarQube | Developer |
| Code Review | Security Review | GitHub PR + Checklist | Peer + Security |
| Testing | SAST + DAST | SonarQube, OWASP ZAP | QA + Security |
| Build | Dependency Scan | Snyk, npm audit | CI/CD Pipeline |
| Deploy | Container Scan | Trivy, ECR Scan | DevOps |
| Runtime | WAF + RASP | AWS WAF, DataDog | Operations |
| Monitor | Log Analysis | ELK, CloudWatch | Security + Ops |

### 5.2. Secure Coding Standards

#### Input Validation
- Validate all input on server-side (never trust client)
- Use allowlists over denylists
- Sanitize HTML output (XSS prevention)
- Parameterized queries (SQL Injection prevention)
- File upload: validate type, size, content

#### Output Encoding
- HTML encode all dynamic content
- JSON encode API responses
- URL encode parameters
- Use Content Security Policy (CSP) headers

#### Error Handling
- Never expose stack traces in production
- Use generic error messages for users
- Log detailed errors server-side
- Custom error pages (no default framework errors)

### 5.3. API Security

| Control | Implementation |
|---------|---------------|
| Authentication | JWT Bearer Token (RS256) |
| Authorization | Scope-based permissions per endpoint |
| Rate Limiting | 100 req/min (user), 1000 req/min (partner) |
| Input Validation | JSON Schema validation, OpenAPI spec |
| Output Filtering | Response field filtering per role |
| Versioning | URL versioning (/api/v1/) |
| CORS | Whitelist specific origins |
| Request Size | Max 10MB (file upload), 1MB (JSON) |
| Timeout | 30s request timeout |
| Logging | All requests logged (no sensitive data) |

---

## 6. Data Protection Policy

### 6.1. Encryption Standards

| Context | Algorithm | Key Size | Key Rotation |
|---------|-----------|----------|--------------|
| Data at Rest | AES-256-GCM | 256-bit | Annual |
| Data in Transit | TLS 1.3 | 256-bit | Certificate: Annual |
| Password Hashing | bcrypt | 12 rounds | N/A |
| Token Signing | RS256 | 2048-bit RSA | 6 months |
| API Key | SHA-256 | 256-bit | Per request (HMAC) |
| File Encryption | AES-256-CBC | 256-bit | Per file |
| Database Field | AES-256-GCM | 256-bit | Annual |

### 6.2. Key Management
- **Key Storage**: AWS KMS (Hardware Security Module backed)
- **Key Access**: Only application service roles
- **Key Rotation**: Automated via AWS KMS policy
- **Key Backup**: Multi-region replication
- **Key Destruction**: Scheduled deletion with 30-day recovery window

### 6.3. Personal Data Protection (PDPA Compliance)

| Principle | Implementation |
|-----------|---------------|
| Lawful Collection | Explicit consent before data collection |
| Purpose Limitation | Data used only for stated purposes |
| Data Minimization | Collect only necessary data |
| Accuracy | Allow users to update/correct data |
| Storage Limitation | Auto-delete per retention policy |
| Security | Encryption, access control, monitoring |
| Accountability | DPO appointed, regular audits |

---

## 7. Incident Response Policy

### 7.1. Severity Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **SEV-1** (Critical) | Active breach, data loss, service down | 15 minutes | Data breach, ransomware, full outage |
| **SEV-2** (High) | Potential breach, partial service impact | 1 hour | Suspicious access, DDoS, partial outage |
| **SEV-3** (Medium) | Security vulnerability, no active exploit | 4 hours | Vulnerability found, config issue |
| **SEV-4** (Low) | Minor issue, no immediate risk | 24 hours | Policy violation, audit finding |

### 7.2. Incident Response Process

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│ Detect  │──▶│ Classify │──▶│ Contain   │──▶│Eradicate │──▶│ Recover  │
│ & Alert │   │ & Notify │   │ & Isolate │   │ & Fix    │   │ & Learn  │
└─────────┘   └──────────┘   └───────────┘   └──────────┘   └──────────┘
    │              │               │               │              │
    ▼              ▼               ▼               ▼              ▼
 Monitoring    Severity        Block access    Patch/Fix     Restore
 Alerts        Assessment     Preserve logs   Remove threat  Post-mortem
 User report   Notification   Backup data     Verify clean   Update policy
```

### 7.3. Communication Plan

| Audience | SEV-1 | SEV-2 | SEV-3 | SEV-4 |
|----------|-------|-------|-------|-------|
| Security Team | Immediate | 15 min | 4 hours | Daily report |
| CTO/VP Engineering | 15 min | 1 hour | Daily report | Weekly report |
| CEO | 30 min | 4 hours | Weekly | Monthly |
| Legal/Compliance | 1 hour | 4 hours | As needed | Quarterly |
| Affected Customers | 24 hours | 48 hours | N/A | N/A |
| Regulators | 72 hours (PDPA) | As required | N/A | N/A |
| Public/Media | As needed | N/A | N/A | N/A |

---

## 8. Business Continuity & Disaster Recovery

### 8.1. Recovery Objectives

| System | RTO | RPO | Priority |
|--------|-----|-----|----------|
| Customer Portal | 1 hour | 5 min | P1 |
| Payment Processing | 30 min | 0 (real-time) | P0 |
| API Services | 1 hour | 5 min | P1 |
| Claims Processing | 4 hours | 15 min | P2 |
| Admin Panel | 8 hours | 1 hour | P3 |
| Reporting | 24 hours | 1 hour | P4 |

### 8.2. Backup Strategy
- **Database**: Continuous replication + 6-hour snapshots (30-day retention)
- **File Storage**: S3 cross-region replication
- **Configuration**: Infrastructure as Code (Terraform) in version control
- **Secrets**: AWS Secrets Manager with multi-region
- **Testing**: Monthly backup restoration test

---

## 9. Compliance Requirements

### 9.1. Regulatory Framework

| Regulation | Scope | Requirements | Status |
|-----------|-------|--------------|--------|
| PDPA (Vietnam) | Personal data | Consent, retention, breach notification | Required |
| PCI-DSS v4.0 | Payment data | Tokenization, no card storage | Required |
| Insurance Act | Insurance operations | Licensing, reporting, data retention | Required |
| AML/KYC | Identity verification | eKYC, watchlist screening, reporting | Required |
| Cybersecurity Law (Vietnam) | System security | Local storage, incident reporting | Required |

### 9.2. Audit Schedule

| Audit Type | Frequency | Scope | Auditor |
|-----------|-----------|-------|---------|
| Internal Security Audit | Quarterly | Full system | Security Team |
| External Penetration Test | Semi-annual | Full system | Third-party |
| Compliance Audit | Annual | Regulatory requirements | External auditor |
| Code Security Review | Every sprint | New code changes | Dev + Security |
| Infrastructure Audit | Monthly | Cloud configuration | DevOps + Security |
| Vendor Security Assessment | Annual | Third-party services | Security Team |

---

## 10. Policy Enforcement

### 10.1. Violations & Consequences

| Severity | Example | Consequence |
|----------|---------|-------------|
| Minor | Forgot to lock screen | Warning + training |
| Moderate | Shared credentials | Written warning + access review |
| Major | Bypassed security controls | Suspension + investigation |
| Critical | Intentional data breach | Termination + legal action |

### 10.2. Policy Review
- **Review Frequency**: Quarterly review, annual major revision
- **Change Management**: All changes require Security Lead + CTO approval
- **Communication**: All staff notified of policy changes within 5 business days
- **Training**: Annual security awareness training (mandatory)
- **Acknowledgment**: All staff must sign policy acknowledgment annually

---

## 11. Contact & Escalation

| Role | Contact | Availability |
|------|---------|-------------|
| Security Team | security@insurance-platform.vn | 24/7 on-call |
| CISO | ciso@insurance-platform.vn | Business hours |
| DPO (Data Protection Officer) | dpo@insurance-platform.vn | Business hours |
| Incident Hotline | +84-xxx-xxx-xxx | 24/7 |
| Bug Bounty | bugbounty@insurance-platform.vn | Continuous |

---

*Document Version: 1.0*
*Last Updated: 2024-01*
*Next Review: 2024-04*
*Owner: Chief Information Security Officer (CISO)*
