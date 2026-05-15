# Logging Strategy - Chiến Lược Logging

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Logging Stack | Winston + Fluent Bit + Elasticsearch + Kibana |

---

## 1. Tổng Quan Logging Architecture

### 1.1. Logging Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       LOGGING PIPELINE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  APPLICATION                COLLECTION           STORAGE & ANALYSIS      │
│  ───────────                ──────────           ──────────────────      │
│                                                                           │
│  ┌──────────┐           ┌──────────────┐       ┌──────────────────┐    │
│  │  App Pod │──stdout──▶│  Fluent Bit  │──────▶│  Elasticsearch   │    │
│  │ (Winston)│           │  (DaemonSet) │       │  (OpenSearch)    │    │
│  └──────────┘           └──────────────┘       └────────┬─────────┘    │
│                                │                         │              │
│  ┌──────────┐                  │                         ▼              │
│  │  Nginx   │──stdout──────────┤              ┌──────────────────┐    │
│  │  Ingress │                  │              │     Kibana        │    │
│  └──────────┘                  │              │  (Visualization)  │    │
│                                │              └──────────────────┘    │
│  ┌──────────┐                  │                                      │
│  │  System  │──journal─────────┤              ┌──────────────────┐    │
│  │  Logs    │                  └─────────────▶│  CloudWatch Logs │    │
│  └──────────┘                    (backup)     │  (Long-term)     │    │
│                                               └──────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Log Categories

| Category | Source | Purpose | Retention |
|----------|--------|---------|-----------|
| Application Logs | Microservices (Winston) | Debug, business logic | 30 days (hot), 90 days (warm) |
| Access Logs | NGINX Ingress, ALB | Traffic analysis, security | 90 days |
| Audit Logs | Application (write operations) | Compliance, security | 5 years |
| System Logs | Kubernetes, OS | Infrastructure health | 14 days |
| Security Logs | WAF, GuardDuty | Threat detection | 1 year |

---

## 2. Log Format & Standards

### 2.1. Structured Log Format (JSON)

```json
{
  "timestamp": "2026-05-15T10:30:45.123Z",
  "level": "info",
  "service": "auth-service",
  "version": "1.5.2",
  "environment": "production",
  "traceId": "abc123def456",
  "spanId": "span789",
  "requestId": "req-uuid-here",
  "userId": "user-uuid",
  "method": "POST",
  "path": "/api/v1/auth/login",
  "statusCode": 200,
  "duration": 145,
  "message": "User login successful",
  "metadata": {
    "ip": "103.x.x.x",
    "userAgent": "Mozilla/5.0...",
    "region": "HCM"
  }
}
```

### 2.2. Log Levels

| Level | Code | Usage | Example |
|-------|------|-------|---------|
| `error` | 0 | Unhandled errors, system failures | DB connection lost, payment gateway timeout |
| `warn` | 1 | Recoverable issues, deprecations | Rate limit approaching, retry attempt |
| `info` | 2 | Business events, state changes | User registered, policy issued, claim submitted |
| `http` | 3 | HTTP request/response logging | API call completed, external API response |
| `debug` | 4 | Detailed debugging info | Cache hit/miss, query execution details |

### 2.3. Winston Configuration

```typescript
// src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
  ],
});

// Add request context
export const createRequestLogger = (requestId: string, traceId: string) => {
  return logger.child({ requestId, traceId });
};

export default logger;
```

### 2.4. Log Level Per Environment

| Environment | Default Level | Adjustable | Storage |
|-------------|--------------|------------|---------|
| Development | debug | Yes (env var) | Console only |
| Staging | debug | Yes | Elasticsearch (7 days) |
| Production | info | Yes (hot-reload) | Elasticsearch (30 days) + CloudWatch |

---

## 3. Logging Best Practices

### 3.1. What To Log

```
✅ DO LOG:
├── All API requests (method, path, status, duration)
├── Authentication events (login, logout, failed attempts)
├── Business transactions (policy created, claim submitted, payment)
├── Error details with stack traces
├── External service calls (request + response time + status)
├── Database slow queries (> 100ms)
├── Cache operations (hit/miss ratio)
├── Queue operations (enqueue, dequeue, failed)
├── Configuration changes
└── Security events (permission denied, suspicious activity)

❌ DO NOT LOG:
├── Passwords or tokens (even hashed)
├── Full credit card numbers (mask: ****1234)
├── CCCD numbers (mask: ***456789)
├── Personal health information (PHI) in detail
├── Full request/response bodies (only in debug level)
├── High-frequency metrics data (use Prometheus instead)
└── Secrets, API keys, connection strings
```

### 3.2. PII Masking Rules

```typescript
// src/utils/log-sanitizer.ts
const MASK_PATTERNS = {
  email: (val: string) => val.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
  phone: (val: string) => val.replace(/(.{4})(.*)(.{3})/, '$1****$3'),
  cccd: (val: string) => val.replace(/(.{3})(.*)(.{4})/, '$1*****$3'),
  cardNumber: (val: string) => `****${val.slice(-4)}`,
};

// Usage in logs:
logger.info('Payment processed', {
  userId: user.id,              // OK: UUID
  email: mask.email(user.email), // Masked: th***@gmail.com
  cardNumber: mask.cardNumber(card), // Masked: ****1234
  amount: payment.amount,        // OK: not PII
});
```

### 3.3. Correlation & Tracing

```typescript
// Middleware to inject trace context
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuid();
  const traceId = req.headers['x-trace-id'] || uuid();

  req.logger = createRequestLogger(requestId, traceId);

  // Propagate to downstream services
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-trace-id', traceId);

  next();
});
```

---

## 4. Log Collection (Fluent Bit)

### 4.1. Fluent Bit DaemonSet Configuration

```yaml
# fluent-bit-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: logging
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         5
        Log_Level     info
        Daemon        off
        Parsers_File  parsers.conf

    [INPUT]
        Name              tail
        Tag               kube.*
        Path              /var/log/containers/*.log
        Parser            docker
        DB                /var/log/flb_kube.db
        Mem_Buf_Limit     50MB
        Skip_Long_Lines   On
        Refresh_Interval  10

    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
        Merge_Log           On
        Keep_Log            Off
        K8S-Logging.Parser  On
        K8S-Logging.Exclude On

    [FILTER]
        Name    modify
        Match   kube.*
        Add     cluster insurance-system-prod
        Add     region ap-southeast-1

    [OUTPUT]
        Name            es
        Match           kube.*
        Host            opensearch.internal.insurance-system.vn
        Port            9200
        Index           app-logs
        Type            _doc
        Logstash_Format On
        Logstash_Prefix app-logs
        Retry_Limit     3
        tls             On
        tls.verify      Off
        HTTP_User       ${ES_USER}
        HTTP_Passwd     ${ES_PASSWORD}

    [OUTPUT]
        Name              cloudwatch_logs
        Match             kube.*
        region            ap-southeast-1
        log_group_name    /insurance-system/production
        log_stream_prefix app-
        auto_create_group true
```

### 4.2. Log Parsing

```yaml
  parsers.conf: |
    [PARSER]
        Name        docker
        Format      json
        Time_Key    time
        Time_Format %Y-%m-%dT%H:%M:%S.%LZ

    [PARSER]
        Name        app_json
        Format      json
        Time_Key    timestamp
        Time_Format %Y-%m-%dT%H:%M:%S.%LZ
```

---

## 5. Log Storage & Retention

### 5.1. Elasticsearch Index Strategy

| Index Pattern | Rotation | Retention (Hot) | Retention (Warm) | Delete |
|---------------|----------|-----------------|------------------|--------|
| app-logs-* | Daily | 7 days | 30 days | 90 days |
| access-logs-* | Daily | 7 days | 30 days | 90 days |
| audit-logs-* | Daily | 30 days | 365 days | 5 years (Glacier) |
| security-logs-* | Daily | 30 days | 365 days | 5 years (Glacier) |
| system-logs-* | Daily | 3 days | 14 days | 30 days |

### 5.2. Index Lifecycle Management (ILM)

```json
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d"
          },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "set_priority": { "priority": 0 }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

---

## 6. Log Analysis & Dashboards

### 6.1. Kibana Dashboards

| Dashboard | Purpose | Key Visualizations |
|-----------|---------|-------------------|
| Service Overview | Health of all services | Log volume, error rate by service |
| Error Analysis | Deep-dive into errors | Top errors, error trends, stack traces |
| API Performance | Request metrics | Latency distribution, slow endpoints |
| Security | Threat monitoring | Failed logins, blocked requests, anomalies |
| Business Events | Transaction tracking | Policies sold, claims submitted, payments |
| Audit Trail | Compliance | Who changed what, when |

### 6.2. Useful Kibana Queries (KQL)

```
# Find all errors in auth-service last hour
level: "error" AND service: "auth-service"

# Find slow API requests (> 1 second)
duration > 1000 AND level: "http"

# Track a specific user's actions
userId: "uuid-here"

# Find failed login attempts
message: "login failed" AND service: "auth-service"

# Trace a request across services
traceId: "trace-uuid-here"

# Find 5xx responses
statusCode >= 500

# Database slow queries
message: "slow query" AND duration > 100
```
