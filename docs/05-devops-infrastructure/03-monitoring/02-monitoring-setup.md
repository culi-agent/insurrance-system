# Monitoring Setup - Thiết Lập Giám Sát

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Monitoring Stack | Prometheus + Grafana + AWS CloudWatch |

---

## 1. Monitoring Architecture

### 1.1. Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MONITORING ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  DATA SOURCES              COLLECTION            VISUALIZATION           │
│  ────────────              ──────────            ─────────────           │
│                                                                           │
│  ┌──────────┐          ┌──────────────┐       ┌──────────────┐         │
│  │App Metrics│─────────▶│  Prometheus  │──────▶│   Grafana    │         │
│  │(/metrics) │          │  (Scraping)  │       │ (Dashboards) │         │
│  └──────────┘          └──────────────┘       └──────────────┘         │
│                                │                      │                  │
│  ┌──────────┐                  │               ┌──────────────┐         │
│  │Node Exp. │──────────────────┤               │AlertManager  │         │
│  │(System)  │                  │               │(Notifications)│        │
│  └──────────┘                  │               └──────┬───────┘         │
│                                │                      │                  │
│  ┌──────────┐                  │               ┌──────┴───────┐         │
│  │kube-state│──────────────────┘               │   PagerDuty  │         │
│  │-metrics  │                                  │   Slack      │         │
│  └──────────┘                                  │   Email      │         │
│                                                └──────────────┘         │
│  ┌──────────┐          ┌──────────────┐                                 │
│  │AWS Infra │─────────▶│  CloudWatch  │──────▶ CloudWatch Alarms       │
│  │(RDS,Redis│          │  (AWS native)│                                 │
│  │ ALB,etc) │          └──────────────┘                                 │
│  └──────────┘                                                            │
│                                                                           │
│  ┌──────────┐          ┌──────────────┐                                 │
│  │ App Code │─────────▶│   AWS X-Ray  │──────▶ Service Map & Traces    │
│  │(Tracing) │          │  (Dist.Trace)│                                 │
│  └──────────┘          └──────────────┘                                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Monitoring Stack Components

| Component | Role | Deployment | Storage |
|-----------|------|-----------|---------|
| Prometheus | Metrics collection & storage | EKS (StatefulSet) | 15 days local + Thanos (long-term) |
| Grafana | Visualization & dashboards | EKS (Deployment) | PostgreSQL (dashboard configs) |
| AlertManager | Alert routing & deduplication | EKS (Deployment) | ConfigMap |
| Node Exporter | Host-level metrics | EKS (DaemonSet) | N/A (scraped by Prometheus) |
| kube-state-metrics | Kubernetes object metrics | EKS (Deployment) | N/A |
| Blackbox Exporter | Endpoint probing (uptime) | EKS (Deployment) | N/A |
| AWS CloudWatch | AWS service metrics | Managed | 15 months (default) |
| AWS X-Ray | Distributed tracing | SDK + Daemon | 30 days |

---

## 2. Metrics Collection

### 2.1. Application Metrics (Custom)

```typescript
// src/metrics/prometheus.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

const register = new Registry();

// HTTP Request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'path', 'status_code', 'service'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code', 'service'],
  registers: [register],
});

// Business metrics
export const policiesCreated = new Counter({
  name: 'business_policies_created_total',
  help: 'Total policies created',
  labelNames: ['product_type', 'insurer'],
  registers: [register],
});

export const claimsSubmitted = new Counter({
  name: 'business_claims_submitted_total',
  help: 'Total claims submitted',
  labelNames: ['type', 'status'],
  registers: [register],
});

export const paymentAmount = new Histogram({
  name: 'business_payment_amount_vnd',
  help: 'Payment amounts in VND',
  labelNames: ['method', 'status'],
  buckets: [100000, 500000, 1000000, 5000000, 10000000, 50000000],
  registers: [register],
});

// Infrastructure metrics
export const dbConnectionPool = new Gauge({
  name: 'db_connection_pool_size',
  help: 'Database connection pool size',
  labelNames: ['state'], // active, idle, waiting
  registers: [register],
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_name'],
  registers: [register],
});

export const externalApiDuration = new Histogram({
  name: 'external_api_duration_ms',
  help: 'External API call duration',
  labelNames: ['provider', 'operation', 'status'],
  buckets: [100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 2.2. Infrastructure Metrics

| Source | Metrics | Scrape Interval |
|--------|---------|-----------------|
| Node Exporter | CPU, Memory, Disk, Network per node | 15s |
| kube-state-metrics | Pod status, Deployment replicas, Job status | 30s |
| cAdvisor | Container CPU, Memory, I/O | 15s |
| Blackbox Exporter | HTTP probe (latency, status, cert expiry) | 30s |
| CloudWatch | RDS, ElastiCache, ALB, S3 metrics | 60s |

### 2.3. Prometheus Scrape Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Application services
  - job_name: 'insurance-services'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: namespace
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: replace
        target_label: service

  # Node Exporter
  - job_name: 'node-exporter'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - action: replace
        source_labels: [__address__]
        regex: '(.*):.*'
        replacement: '${1}:9100'
        target_label: __address__

  # Blackbox (endpoint probing)
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://api.insurance-system.vn/health
          - https://www.insurance-system.vn
          - https://admin.insurance-system.vn
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

---

## 3. Grafana Dashboards

### 3.1. Dashboard Inventory

| Dashboard | Audience | Refresh | Key Panels |
|-----------|----------|---------|------------|
| System Overview | DevOps, On-call | 30s | Health status, error rate, latency |
| Service Detail | Developers | 30s | Per-service metrics, error details |
| Infrastructure | DevOps | 1m | Node resources, cluster health |
| Business KPIs | Product, Management | 5m | Policies sold, revenue, conversion |
| Database | DBA, DevOps | 30s | Connections, queries, replication lag |
| Redis | DevOps | 30s | Memory, hit rate, commands/sec |
| Deployment Monitor | DevOps | 10s | Canary progress, rollout status |
| SLA Report | Management | 1h | Uptime, response time SLA |

### 3.2. System Overview Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTEM OVERVIEW DASHBOARD                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Row 1: STATUS PANELS (Single Stat)                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Uptime  │ │ Request │ │  Error  │ │ Latency │ │  Active │    │
│  │ 99.95%  │ │ 1.2K/s  │ │  0.03%  │ │  125ms  │ │  Users  │    │
│  │   🟢    │ │   🟢    │ │   🟢    │ │   🟢    │ │  2,450  │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│                                                                       │
│  Row 2: REQUEST RATE & ERROR RATE (Time Series)                      │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐ │
│  │  Requests/sec by Service     │ │  Error Rate by Service        │ │
│  │  ┌─────────────────────────┐ │ │  ┌─────────────────────────┐ │ │
│  │  │ ~~~auth~~~              │ │ │  │ ___auth___              │ │ │
│  │  │ ---product---           │ │ │  │                         │ │ │
│  │  │ ...policy...            │ │ │  │        threshold: 1%    │ │ │
│  │  └─────────────────────────┘ │ │  └─────────────────────────┘ │ │
│  └──────────────────────────────┘ └──────────────────────────────┘ │
│                                                                       │
│  Row 3: LATENCY (Heatmap + Percentiles)                             │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐ │
│  │  Latency Heatmap             │ │  P50 / P95 / P99             │ │
│  │  (color = request count)     │ │  ┌─────────────────────────┐ │ │
│  │                              │ │  │ p50: 45ms               │ │ │
│  │                              │ │  │ p95: 125ms              │ │ │
│  │                              │ │  │ p99: 450ms              │ │ │
│  │                              │ │  └─────────────────────────┘ │ │
│  └──────────────────────────────┘ └──────────────────────────────┘ │
│                                                                       │
│  Row 4: INFRASTRUCTURE                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ CPU Usage   │ │ Memory      │ │ Pod Status  │ │ Network I/O │ │
│  │ (per node)  │ │ (per node)  │ │ (donut)     │ │ (bytes/sec) │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3. Key Prometheus Queries (PromQL)

```promql
# Request rate (per service)
sum(rate(http_requests_total[5m])) by (service)

# Error rate percentage
sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
/
sum(rate(http_requests_total[5m])) by (service) * 100

# Latency P95
histogram_quantile(0.95,
  sum(rate(http_request_duration_ms_bucket[5m])) by (le, service)
)

# Latency P99
histogram_quantile(0.99,
  sum(rate(http_request_duration_ms_bucket[5m])) by (le, service)
)

# Active pods per service
count(kube_pod_status_phase{phase="Running"}) by (pod)

# CPU usage percentage per node
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage percentage per node
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Database connections (active)
pg_stat_activity_count{state="active"}

# Redis memory usage
redis_memory_used_bytes / redis_memory_max_bytes * 100

# External API success rate
sum(rate(external_api_duration_ms_count{status="success"}[5m])) by (provider)
/
sum(rate(external_api_duration_ms_count[5m])) by (provider) * 100
```

---

## 4. Health Checks

### 4.1. Health Check Endpoints

```typescript
// /health/live - Kubernetes liveness probe
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// /health/ready - Kubernetes readiness probe
app.get('/health/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: process.memoryUsage().heapUsed < MAX_HEAP,
  };

  const isReady = Object.values(checks).every(Boolean);
  res.status(isReady ? 200 : 503).json({ status: isReady ? 'ready' : 'not ready', checks });
});

// /health/detailed - Full health report (internal only)
app.get('/health/detailed', authMiddleware('admin'), async (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok', latency: '2ms', connections: { active: 5, idle: 15 } },
      redis: { status: 'ok', latency: '1ms', memory: '45%' },
      externalApis: {
        vnpay: { status: 'ok', lastCheck: '2s ago' },
        sendgrid: { status: 'ok', lastCheck: '5s ago' },
      },
    },
  });
});
```

### 4.2. External Endpoint Monitoring

| Endpoint | Check Type | Interval | Timeout | Alert If |
|----------|-----------|----------|---------|----------|
| https://api.insurance-system.vn/health | HTTP 200 | 30s | 5s | 2 failures |
| https://www.insurance-system.vn | HTTP 200 | 60s | 10s | 3 failures |
| https://admin.insurance-system.vn | HTTP 200 | 60s | 10s | 3 failures |
| DNS: insurance-system.vn | DNS resolve | 60s | 5s | 1 failure |
| TLS cert expiry | Certificate | 6h | - | < 30 days |

---

## 5. Distributed Tracing (AWS X-Ray)

### 5.1. Tracing Configuration

```typescript
// src/config/tracing.ts
import * as AWSXRay from 'aws-xray-sdk';

// Instrument HTTP clients
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

// Instrument AWS SDK
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

// Instrument Express
app.use(AWSXRay.express.openSegment('auth-service'));

// Custom subsegments for business logic
const processPayment = async (paymentData) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment('processPayment');

  try {
    subsegment.addAnnotation('paymentMethod', paymentData.method);
    subsegment.addMetadata('amount', paymentData.amount);

    const result = await paymentGateway.charge(paymentData);
    subsegment.close();
    return result;
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
    throw error;
  }
};

app.use(AWSXRay.express.closeSegment());
```

### 5.2. Trace Visualization

```
Request: POST /api/v1/policies/purchase
Total Duration: 2.3s

├── auth-service (validate token)         [15ms]
├── quote-service (validate quote)        [45ms]
├── policy-service (create policy)        [120ms]
│   ├── Database INSERT                   [25ms]
│   └── Redis SET (cache)                 [3ms]
├── payment-service (process payment)     [1800ms]  ⚠️ Slow
│   ├── VNPay API call                    [1650ms]  ⚠️
│   └── Database UPDATE                   [15ms]
├── document-service (generate PDF)       [250ms]
│   └── S3 PUT                            [80ms]
└── notification-service (send email)     [50ms]
    └── SendGrid API                      [35ms]
```
