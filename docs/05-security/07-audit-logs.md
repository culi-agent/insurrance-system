# Audit Logs - Nhật Ký Kiểm Toán

---

## 1. Tổng quan

### 1.1. Mục đích
Tài liệu này định nghĩa chiến lược audit logging cho Insurance System Platform, bao gồm các sự kiện cần ghi log, format, lưu trữ, phân tích và quy trình review để đảm bảo truy vết (traceability) và tuân thủ quy định.

### 1.2. Nguyên tắc

| Nguyên tắc | Mô tả |
|------------|--------|
| **Completeness** | Ghi log tất cả hành động quan trọng |
| **Integrity** | Log không thể bị sửa đổi hoặc xóa |
| **Confidentiality** | Log không chứa dữ liệu nhạy cảm (passwords, PII raw) |
| **Availability** | Log luôn accessible khi cần điều tra |
| **Timeliness** | Log được ghi real-time, không delay |
| **Non-repudiation** | Log đủ thông tin để chứng minh ai làm gì, khi nào |

---

## 2. Audit Events Classification

### 2.1. Event Categories

| Category | Priority | Retention | Examples |
|----------|----------|-----------|----------|
| **Security Events** | Critical | 5 years | Login, auth failure, privilege change |
| **Data Access Events** | High | 5 years | View/export PII, database queries |
| **Transaction Events** | Critical | 7 years | Payment, policy issuance, claims |
| **Administrative Events** | High | 5 years | Config change, user management |
| **System Events** | Medium | 1 year | Deployments, health checks, errors |
| **Business Events** | High | 10 years | Policy lifecycle, underwriting decisions |

### 2.2. Security Events (Must Log)

| Event | Trigger | Severity | Alert |
|-------|---------|----------|-------|
| Successful login | User authenticates | INFO | No |
| Failed login attempt | Wrong credentials | WARNING | After 3 attempts |
| Account lockout | 5 failed attempts | HIGH | Yes (immediate) |
| Password change | User changes password | INFO | Email notification |
| Password reset | Reset flow completed | INFO | Email notification |
| MFA enabled/disabled | MFA settings changed | WARNING | Yes |
| Session created | New session | INFO | No |
| Session invalidated | Logout or timeout | INFO | No |
| Privilege escalation attempt | Unauthorized access | CRITICAL | Yes (immediate) |
| API key created/revoked | Key management | WARNING | Yes |
| Admin login | Admin authenticates | WARNING | Yes |
| Suspicious IP access | Unknown location | WARNING | Yes |
| Token refresh | JWT refreshed | INFO | No |
| Concurrent session detection | Multiple logins | WARNING | Optional |

### 2.3. Data Access Events

| Event | Trigger | Severity | Alert |
|-------|---------|----------|-------|
| PII viewed | Staff views customer PII | INFO | Anomaly detection |
| PII exported | Bulk data export | HIGH | Yes |
| Health data accessed | View medical info | WARNING | Yes |
| Financial data accessed | View payment details | WARNING | Anomaly detection |
| Database query (bulk) | Query returns > 100 records | WARNING | Yes |
| Document downloaded | Policy/claim docs | INFO | No |
| Search query | Search customer data | INFO | Anomaly detection |
| Data modification | Update customer record | INFO | No |
| Data deletion | Delete/anonymize data | HIGH | Yes |
| Cross-tenant access | Access other org data | CRITICAL | Yes (immediate) |

### 2.4. Transaction Events

| Event | Trigger | Severity | Alert |
|-------|---------|----------|-------|
| Quote generated | Price calculated | INFO | No |
| Policy created | New policy issued | INFO | No |
| Policy cancelled | Customer/system cancels | WARNING | No |
| Payment initiated | Payment flow starts | INFO | No |
| Payment success | Transaction confirmed | INFO | No |
| Payment failed | Transaction declined | WARNING | No |
| Payment refunded | Refund processed | HIGH | Yes |
| Claim submitted | New claim filed | INFO | No |
| Claim approved | Claim decision | INFO | No |
| Claim rejected | Claim decision | INFO | No |
| Claim payout | Money transferred | HIGH | Yes |
| Commission calculated | Commission processed | INFO | No |
| High-value transaction | Amount > threshold | HIGH | Yes |

### 2.5. Administrative Events

| Event | Trigger | Severity | Alert |
|-------|---------|----------|-------|
| User created | New staff account | WARNING | Yes |
| User deactivated | Staff account disabled | WARNING | Yes |
| Role changed | Permission modification | HIGH | Yes |
| Configuration changed | System settings update | HIGH | Yes |
| Feature flag toggled | Feature enabled/disabled | WARNING | Yes |
| Deployment executed | New version deployed | INFO | No |
| Backup created | Scheduled/manual backup | INFO | No |
| Backup restored | Data restoration | CRITICAL | Yes |
| Secret rotated | Credential rotation | WARNING | Yes |
| Infrastructure change | Cloud resource modified | WARNING | Yes |
| Rule engine updated | Business rules changed | HIGH | Yes |
| Partner onboarded | New insurer integrated | WARNING | Yes |

---

## 3. Audit Log Format

### 3.1. Standard Log Schema

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "event_id": "evt_abc123def456",
  "trace_id": "trace_xyz789",
  "event_type": "security.login.success",
  "category": "security",
  "severity": "INFO",
  "actor": {
    "id": "usr_12345",
    "type": "customer",
    "email_hash": "sha256:abc...",
    "ip_address": "103.x.x.x",
    "user_agent": "Mozilla/5.0...",
    "session_id": "sess_xyz"
  },
  "target": {
    "type": "session",
    "id": "sess_new123"
  },
  "action": {
    "name": "login",
    "method": "password",
    "result": "success"
  },
  "context": {
    "service": "auth-service",
    "environment": "production",
    "version": "1.2.3",
    "region": "ap-southeast-1"
  },
  "metadata": {
    "mfa_used": true,
    "login_method": "email",
    "device_fingerprint": "fp_abc123"
  },
  "risk_score": 10
}
```

### 3.2. Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 | ✅ | UTC timestamp with milliseconds |
| `event_id` | UUID | ✅ | Unique event identifier |
| `trace_id` | String | ✅ | Request correlation ID |
| `event_type` | String | ✅ | Hierarchical event type (category.subcategory.action) |
| `category` | Enum | ✅ | security, data_access, transaction, admin, system |
| `severity` | Enum | ✅ | INFO, WARNING, HIGH, CRITICAL |
| `actor.id` | String | ✅ | User/service performing action |
| `actor.type` | Enum | ✅ | customer, admin, system, partner, service |
| `actor.ip_address` | String | ✅ | Source IP (for non-system actors) |
| `target.type` | String | ✅ | Resource type affected |
| `target.id` | String | ✅ | Resource identifier |
| `action.name` | String | ✅ | Action performed |
| `action.result` | Enum | ✅ | success, failure, denied, error |
| `context.service` | String | ✅ | Originating service name |
| `context.environment` | String | ✅ | Environment (prod/staging/dev) |
| `metadata` | Object | ❌ | Additional event-specific data |
| `risk_score` | Integer | ❌ | Calculated risk score (0-100) |

### 3.3. PII Masking Rules

| Data Type | Raw Value | Logged Value | Method |
|-----------|-----------|--------------|--------|
| Email | user@example.com | u***@e***.com | Partial mask |
| Phone | 0901234567 | 090***4567 | Partial mask |
| CCCD | 079123456789 | 079***6789 | Partial mask |
| Name | Nguyễn Văn A | Hash (SHA-256) | Hash |
| Card Number | Never stored | N/A | N/A |
| Password | Never logged | N/A | N/A |
| IP Address | 103.1.2.3 | 103.1.2.3 | Full (not PII) |
| User ID | usr_12345 | usr_12345 | Full (pseudonymous) |

---

## 4. Logging Architecture

### 4.1. Infrastructure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUDIT LOGGING ARCHITECTURE                          │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ API Server  │  │  Worker     │  │   Admin     │                 │
│  │ (audit log) │  │ (audit log) │  │ (audit log) │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                 │                 │                         │
│         ▼                 ▼                 ▼                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              CloudWatch Logs (Real-time)                      │    │
│  │              Log Group: /insurance/audit/*                    │    │
│  └──────────────────────────────┬──────────────────────────────┘    │
│                                  │                                    │
│              ┌───────────────────┼───────────────────┐               │
│              │                   │                   │               │
│              ▼                   ▼                   ▼               │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ Kinesis Firehose │  │ CloudWatch   │  │ Lambda           │     │
│  │ → S3 (Archive)   │  │ Alarms       │  │ (Real-time alert)│     │
│  └────────┬─────────┘  └──────────────┘  └──────────────────┘     │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │ S3 Bucket        │  ← Immutable (Object Lock)                   │
│  │ (Long-term store)│  ← Encrypted (SSE-KMS)                       │
│  │ Lifecycle:       │  ← Lifecycle: Standard → IA → Glacier        │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │ Elasticsearch    │  ← Search & Analysis                          │
│  │ (OpenSearch)     │  ← Dashboards & Visualization                │
│  │ Retention: 90d   │  ← Real-time querying                        │
│  └──────────────────┘                                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2. Storage & Retention

| Storage Tier | Duration | Purpose | Access |
|-------------|----------|---------|--------|
| CloudWatch Logs | 30 days | Real-time monitoring, alerts | Immediate |
| Elasticsearch | 90 days | Search, analysis, dashboards | < 1 second |
| S3 Standard | 1 year | Recent audit queries | Minutes |
| S3 Infrequent Access | 1-3 years | Compliance queries | Minutes |
| S3 Glacier | 3-10 years | Long-term compliance archive | Hours |

### 4.3. Integrity Protection

| Control | Implementation | Purpose |
|---------|---------------|---------|
| Immutable storage | S3 Object Lock (Compliance mode) | Prevent deletion/modification |
| Write-once | Append-only log streams | Prevent tampering |
| Hash chain | Each log entry includes hash of previous | Detect tampering |
| Separate access | Log writers ≠ log readers ≠ log deleters | Separation of duties |
| Cross-account | Logs replicated to security account | Protect from insider |
| Timestamping | AWS timestamp + NTP sync | Accurate timeline |
| Digital signature | Log batches signed with KMS | Non-repudiation |

---

## 5. Alerting & Monitoring

### 5.1. Alert Rules

| Alert Name | Condition | Severity | Notification |
|-----------|-----------|----------|-------------|
| Brute Force | > 10 failed logins / 5min / IP | HIGH | PagerDuty + Slack |
| Privilege Escalation | Any unauthorized admin access | CRITICAL | PagerDuty + SMS |
| Mass Data Access | > 1000 PII records accessed / hour | CRITICAL | PagerDuty + SMS |
| Unusual Admin Activity | Admin action outside business hours | WARNING | Slack |
| High-value Transaction | Single transaction > 500M VND | HIGH | Slack + Email |
| Multiple Account Lockouts | > 5 lockouts / 10min | HIGH | PagerDuty |
| Data Export | Any bulk data export | HIGH | Slack + Email |
| Config Change | Production config modified | WARNING | Slack |
| New Admin Created | New admin user account | WARNING | Email to CISO |
| Failed MFA | > 3 failed MFA / user / hour | WARNING | Slack |
| Audit Log Gap | No logs received for > 5 min | CRITICAL | PagerDuty |
| Unusual API Pattern | Request pattern deviation > 3 sigma | WARNING | Slack |

### 5.2. Dashboard Metrics

| Dashboard | Metrics | Refresh |
|-----------|---------|---------|
| Security Overview | Login success/fail rate, lockouts, MFA usage | Real-time |
| Access Patterns | PII access frequency, top accessors, anomalies | 5 min |
| Transaction Monitor | Payment volume, high-value alerts, fraud signals | Real-time |
| Compliance | DSAR requests, consent changes, data deletions | Hourly |
| System Health | Log volume, error rate, latency | Real-time |
| Admin Activity | Config changes, user management, deployments | Real-time |

---

## 6. Audit Log Query Examples

### 6.1. Common Investigation Queries

#### Find all actions by a specific user
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "actor.id": "usr_12345" } },
        { "range": { "timestamp": { "gte": "2024-01-01", "lte": "2024-01-31" } } }
      ]
    }
  },
  "sort": [{ "timestamp": "desc" }]
}
```

#### Find all failed login attempts from an IP
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "event_type": "security.login.failure" } },
        { "term": { "actor.ip_address": "103.1.2.3" } }
      ]
    }
  }
}
```

#### Find all high-value transactions
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "category": "transaction" } },
        { "range": { "metadata.amount": { "gte": 500000000 } } }
      ]
    }
  }
}
```

#### Find all data access events for a customer's data
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "category": "data_access" } },
        { "term": { "target.id": "customer_67890" } }
      ]
    }
  }
}
```

### 6.2. Compliance Queries

#### DSAR - All data access for a customer (PDPA requirement)
```json
{
  "query": {
    "bool": {
      "should": [
        { "term": { "actor.id": "usr_customer123" } },
        { "term": { "target.id": "usr_customer123" } }
      ]
    }
  },
  "sort": [{ "timestamp": "asc" }]
}
```

#### Monthly admin activity report
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "actor.type": "admin" } },
        { "range": { "timestamp": { "gte": "2024-01-01", "lte": "2024-01-31" } } }
      ]
    }
  },
  "aggs": {
    "by_admin": { "terms": { "field": "actor.id" } },
    "by_action": { "terms": { "field": "action.name" } }
  }
}
```

---

## 7. Implementation Guide

### 7.1. Audit Logger Service

```typescript
// services/audit-logger.ts (Conceptual)

interface AuditEvent {
  eventType: string;
  category: 'security' | 'data_access' | 'transaction' | 'admin' | 'system';
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  actor: {
    id: string;
    type: 'customer' | 'admin' | 'system' | 'partner' | 'service';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
  target: {
    type: string;
    id: string;
  };
  action: {
    name: string;
    result: 'success' | 'failure' | 'denied' | 'error';
  };
  metadata?: Record<string, any>;
}

class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      event_id: generateUUID(),
      trace_id: getTraceId(),
      context: {
        service: process.env.SERVICE_NAME,
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION,
        region: process.env.AWS_REGION,
      },
    };

    // Mask PII before logging
    const maskedEvent = this.maskPII(enrichedEvent);

    // Send to CloudWatch (async, non-blocking)
    await this.cloudWatchClient.putLogEvents(maskedEvent);

    // Trigger alert if needed
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      await this.alertService.trigger(maskedEvent);
    }
  }

  private maskPII(event: any): any {
    // Mask email, phone, CCCD in metadata
    // Never log passwords, tokens, or secrets
    return event;
  }
}
```

### 7.2. Middleware Integration

```typescript
// middleware/audit.middleware.ts (Conceptual)

function auditMiddleware(eventType: string, category: string) {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Capture response
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;

      auditLogger.log({
        eventType,
        category,
        severity: success ? 'INFO' : 'WARNING',
        actor: {
          id: req.user?.id || 'anonymous',
          type: req.user?.role || 'customer',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          sessionId: req.session?.id,
        },
        target: {
          type: req.params.resource || 'api',
          id: req.params.id || req.path,
        },
        action: {
          name: `${req.method} ${req.route?.path}`,
          result: success ? 'success' : 'failure',
        },
        metadata: {
          statusCode: res.statusCode,
          duration,
          requestId: req.headers['x-request-id'],
        },
      });

      return originalSend.call(this, body);
    };

    next();
  };
}
```

---

## 8. Audit Review Process

### 8.1. Regular Review Schedule

| Review Type | Frequency | Reviewer | Focus |
|-----------|-----------|----------|-------|
| Daily Security Review | Daily | Security Engineer | Failed logins, alerts, anomalies |
| Weekly Access Review | Weekly | Security Lead | PII access patterns, admin actions |
| Monthly Compliance Review | Monthly | Compliance Officer | Data handling, consent, retention |
| Quarterly Deep Dive | Quarterly | Security Team + External | Full audit trail analysis |
| Annual Audit | Annual | External Auditor | Regulatory compliance verification |

### 8.2. Review Checklist

#### Daily Review
- [ ] Review all CRITICAL/HIGH severity alerts
- [ ] Check for unusual login patterns
- [ ] Verify no audit log gaps
- [ ] Review new admin account creations
- [ ] Check high-value transaction alerts

#### Weekly Review
- [ ] Review PII access frequency by staff member
- [ ] Check for unusual data export activities
- [ ] Verify configuration changes are authorized
- [ ] Review failed API authentication attempts
- [ ] Check partner API usage patterns

#### Monthly Review
- [ ] Generate compliance metrics report
- [ ] Review data retention compliance
- [ ] Audit admin privilege assignments
- [ ] Review third-party access patterns
- [ ] Verify log integrity (hash chain)
- [ ] Check log storage costs and optimize

---

## 9. Compliance Mapping

### 9.1. Regulatory Requirements for Audit Logs

| Regulation | Requirement | Our Implementation |
|-----------|-------------|-------------------|
| PDPA (NĐ 13) | Track all PII access and processing | data_access category events |
| Luật An ninh mạng | System logs minimum 12 months | CloudWatch 30d + S3 5 years |
| Luật KDBH | Policy/claims records 10 years | Transaction events archived |
| AML/KYC | Transaction monitoring and reporting | Transaction + risk scoring |
| PCI-DSS | Access to cardholder data environment | N/A (SAQ-A, no card data) |
| ISO 27001 A.8.15 | Logging and monitoring | Full audit system |

---

*Document Version: 1.0*
*Last Updated: 2024-01*
*Owner: Security Team + DevOps*
*Review Frequency: Quarterly*
