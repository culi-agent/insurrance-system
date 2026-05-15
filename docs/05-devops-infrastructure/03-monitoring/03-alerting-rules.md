# Alerting Rules - Quy Tắc Cảnh Báo

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Hệ thống | Insurance System Platform |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Alert Tools | Prometheus AlertManager + Grafana Alerts |

---

## 1. Alert Severity Levels

### 1.1. Severity Definitions

| Severity | Response Time | Notification Channel | Action Required |
|----------|--------------|---------------------|-----------------|
| **Critical (P1)** | < 5 minutes | PagerDuty + Slack + SMS | Immediate response, wake up on-call |
| **High (P2)** | < 15 minutes | PagerDuty + Slack | Respond within business hours (or immediately if impact) |
| **Warning (P3)** | < 1 hour | Slack (#alerts) | Investigate during business hours |
| **Info (P4)** | Next business day | Slack (#monitoring) | Review and plan |

### 1.2. Notification Routing

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'
  slack_api_url: 'https://hooks.slack.com/services/xxx'

route:
  receiver: 'default-slack'
  group_by: ['alertname', 'service', 'namespace']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      repeat_interval: 5m
    - match:
        severity: high
      receiver: 'pagerduty-high'
      repeat_interval: 30m
    - match:
        severity: warning
      receiver: 'slack-warnings'
      repeat_interval: 4h
    - match:
        severity: info
      receiver: 'slack-info'
      repeat_interval: 12h

receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '<P1-SERVICE-KEY>'
        severity: critical
    slack_configs:
      - channel: '#incidents'
        title: '🔴 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'pagerduty-high'
    pagerduty_configs:
      - service_key: '<P2-SERVICE-KEY>'
        severity: error
    slack_configs:
      - channel: '#alerts'
        title: '🟠 HIGH: {{ .GroupLabels.alertname }}'

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#alerts'
        title: '🟡 WARNING: {{ .GroupLabels.alertname }}'

  - name: 'slack-info'
    slack_configs:
      - channel: '#monitoring'
        title: 'ℹ️ INFO: {{ .GroupLabels.alertname }}'

  - name: 'default-slack'
    slack_configs:
      - channel: '#monitoring'
```

---

## 2. Application Alerts

### 2.1. Error Rate Alerts

```yaml
groups:
  - name: application.errors
    rules:
      # Critical: Service error rate > 5%
      - alert: HighErrorRate_Critical
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service) * 100 > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.service }} error rate > 5%"
          description: "Error rate is {{ $value | printf \"%.2f\" }}% for {{ $labels.service }}"
          runbook: "https://wiki.internal/runbooks/high-error-rate"

      # High: Service error rate > 1%
      - alert: HighErrorRate_Warning
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service) * 100 > 1
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Service {{ $labels.service }} error rate > 1%"
          description: "Error rate is {{ $value | printf \"%.2f\" }}% for {{ $labels.service }}"

      # Warning: Any 5xx errors detected
      - alert: ErrorsDetected
        expr: |
          sum(increase(http_requests_total{status_code=~"5.."}[10m])) by (service) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Service {{ $labels.service }} has 5xx errors"
```

### 2.2. Latency Alerts

```yaml
  - name: application.latency
    rules:
      # Critical: P95 latency > 3s
      - alert: HighLatency_Critical
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_ms_bucket[5m])) by (le, service)
          ) > 3000
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.service }} P95 latency > 3s"
          description: "P95 latency is {{ $value | printf \"%.0f\" }}ms"
          runbook: "https://wiki.internal/runbooks/high-latency"

      # High: P95 latency > 1s
      - alert: HighLatency_Warning
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_ms_bucket[5m])) by (le, service)
          ) > 1000
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Service {{ $labels.service }} P95 latency > 1s"

      # Warning: P99 latency > 5s
      - alert: VeryHighLatency_P99
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_ms_bucket[5m])) by (le, service)
          ) > 5000
        for: 5m
        labels:
          severity: warning
```

### 2.3. Availability Alerts

```yaml
  - name: application.availability
    rules:
      # Critical: Service is down
      - alert: ServiceDown
        expr: up{job="insurance-services"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.service }} is DOWN"
          description: "No healthy instances of {{ $labels.service }}"
          runbook: "https://wiki.internal/runbooks/service-down"

      # Critical: Health check endpoint unreachable
      - alert: EndpointDown
        expr: probe_success{job="blackbox-http"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Endpoint {{ $labels.instance }} is unreachable"

      # High: Pod crash looping
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 * 5 > 3
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Pod {{ $labels.pod }} is crash looping"
          description: "{{ $labels.pod }} has restarted {{ $value | printf \"%.0f\" }} times in 15m"

      # Warning: Not enough replicas
      - alert: DeploymentReplicasMismatch
        expr: |
          kube_deployment_spec_replicas != kube_deployment_status_available_replicas
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Deployment {{ $labels.deployment }} has replica mismatch"
```

---

## 3. Infrastructure Alerts

### 3.1. Node & Cluster Alerts

```yaml
  - name: infrastructure.nodes
    rules:
      # Critical: Node CPU > 90%
      - alert: NodeHighCPU
        expr: |
          100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Node {{ $labels.instance }} CPU > 90%"

      # High: Node Memory > 85%
      - alert: NodeHighMemory
        expr: |
          (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 85
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Node {{ $labels.instance }} memory > 85%"

      # Warning: Node Disk > 80%
      - alert: NodeDiskSpace
        expr: |
          (1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Node {{ $labels.instance }} disk > 80%"

      # Critical: Node NotReady
      - alert: NodeNotReady
        expr: kube_node_status_condition{condition="Ready",status="true"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Node {{ $labels.node }} is NotReady"
```

### 3.2. Database Alerts

```yaml
  - name: infrastructure.database
    rules:
      # Critical: DB connections exhausted
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connections at {{ $value | printf \"%.0f\" }}%"
          runbook: "https://wiki.internal/runbooks/db-connections"

      # High: Replication lag > 30s
      - alert: DatabaseReplicationLag
        expr: pg_replication_lag_seconds > 30
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Database replication lag: {{ $value }}s"

      # Warning: Slow queries increasing
      - alert: DatabaseSlowQueries
        expr: rate(pg_stat_activity_count{state="active",wait_event_type="Lock"}[5m]) > 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Increasing slow/locked queries in database"

      # Critical: DB disk space > 85%
      - alert: DatabaseDiskSpace
        expr: aws_rds_free_storage_space_bytes / aws_rds_allocated_storage_bytes * 100 < 15
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Database disk space < 15% remaining"
```

### 3.3. Redis Alerts

```yaml
  - name: infrastructure.redis
    rules:
      # Critical: Redis memory > 90%
      - alert: RedisHighMemory
        expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Redis memory usage > 90%"

      # High: Redis connections high
      - alert: RedisHighConnections
        expr: redis_connected_clients > 5000
        for: 5m
        labels:
          severity: high

      # Warning: Redis hit rate low
      - alert: RedisLowHitRate
        expr: |
          redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total) * 100 < 80
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Redis cache hit rate below 80%"

      # Critical: Redis down
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is DOWN"
```

---

## 4. Business Alerts

### 4.1. Business Metric Alerts

```yaml
  - name: business.metrics
    rules:
      # High: Payment failure rate > 10%
      - alert: PaymentFailureRateHigh
        expr: |
          sum(rate(business_payment_amount_vnd_count{status="failed"}[15m]))
          /
          sum(rate(business_payment_amount_vnd_count[15m])) * 100 > 10
        for: 5m
        labels:
          severity: high
          team: payments
        annotations:
          summary: "Payment failure rate > 10%"
          description: "Current failure rate: {{ $value | printf \"%.1f\" }}%"

      # Warning: No policies created in 1 hour (during business hours)
      - alert: NoPoliciesCreated
        expr: |
          sum(increase(business_policies_created_total[1h])) == 0
          and ON() hour() >= 8 and hour() <= 18
        for: 30m
        labels:
          severity: warning
          team: product
        annotations:
          summary: "No policies created in the last hour"

      # High: External API (insurer) down
      - alert: ExternalAPIDown
        expr: |
          sum(rate(external_api_duration_ms_count{status="error"}[5m])) by (provider)
          /
          sum(rate(external_api_duration_ms_count[5m])) by (provider) * 100 > 50
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "External API {{ $labels.provider }} error rate > 50%"

      # Warning: Quote generation slow
      - alert: QuoteGenerationSlow
        expr: |
          histogram_quantile(0.95,
            sum(rate(external_api_duration_ms_bucket{operation="get_quote"}[5m])) by (le)
          ) > 10000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Quote generation P95 > 10 seconds"
```

---

## 5. SLA Monitoring

### 5.1. SLA Targets & Recording Rules

```yaml
  - name: sla.recording
    rules:
      # Record: Availability (uptime)
      - record: sla:availability:ratio_5m
        expr: |
          avg(up{job="insurance-services"})

      # Record: Request success rate
      - record: sla:success_rate:ratio_5m
        expr: |
          1 - (
            sum(rate(http_requests_total{status_code=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          )

      # Record: Latency SLA (% requests < 500ms)
      - record: sla:latency_compliance:ratio_5m
        expr: |
          sum(rate(http_request_duration_ms_bucket{le="500"}[5m]))
          /
          sum(rate(http_request_duration_ms_count[5m]))

  - name: sla.alerts
    rules:
      # Critical: Monthly SLA at risk (< 99.9%)
      - alert: SLAAtRisk
        expr: |
          avg_over_time(sla:availability:ratio_5m[24h]) < 0.999
        for: 30m
        labels:
          severity: critical
        annotations:
          summary: "SLA at risk - availability below 99.9%"
          description: "24h rolling availability: {{ $value | printf \"%.4f\" }}"

      # High: Error budget burning fast
      - alert: ErrorBudgetBurning
        expr: |
          1 - avg_over_time(sla:success_rate:ratio_5m[1h]) > 0.001 * 24
        for: 15m
        labels:
          severity: high
        annotations:
          summary: "Error budget burning at accelerated rate"
```

### 5.2. SLA Targets

| Metric | Target | Alert At | Measurement Window |
|--------|--------|----------|-------------------|
| Availability (uptime) | 99.9% | < 99.95% (warning), < 99.9% (critical) | Monthly |
| API Success Rate | 99.5% | < 99.7% (warning), < 99.5% (critical) | Daily |
| API Latency P95 | < 500ms | > 500ms (warning), > 1000ms (critical) | 5-minute window |
| Page Load Time | < 3s | > 3s (warning), > 5s (critical) | Hourly |
| Payment Success Rate | > 95% | < 95% (warning), < 90% (critical) | Hourly |

---

## 6. Alert Maintenance

### 6.1. Silencing Rules

```yaml
# Silence during planned maintenance
matchers:
  - name: alertname
    value: ".*"
  - name: namespace
    value: "production"
startsAt: "2026-05-20T02:00:00+07:00"
endsAt: "2026-05-20T04:00:00+07:00"
createdBy: "devops-team"
comment: "Planned maintenance window - EKS upgrade"
```

### 6.2. Alert Tuning Process

| Step | Action | Frequency |
|------|--------|-----------|
| 1 | Review alert fatigue metrics | Weekly |
| 2 | Identify noisy alerts (fire > 5x/week without action) | Weekly |
| 3 | Adjust thresholds or add `for` duration | As needed |
| 4 | Remove redundant alerts | Monthly |
| 5 | Add new alerts for recent incidents | After each post-mortem |
| 6 | Review on-call load balance | Monthly |
