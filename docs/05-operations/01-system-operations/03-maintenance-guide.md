# Maintenance Guide - Hướng dẫn bảo trì hệ thống

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Tổng quan bảo trì

### 1.1. Mục đích

Tài liệu này cung cấp hướng dẫn chi tiết về các hoạt động bảo trì định kỳ và đột xuất cho hệ thống Insurance System, đảm bảo hệ thống hoạt động ổn định, an toàn và hiệu suất cao.

### 1.2. Phân loại bảo trì

| Loại | Mô tả | Tần suất | Downtime |
|------|--------|----------|----------|
| Preventive (Phòng ngừa) | Bảo trì định kỳ ngăn ngừa sự cố | Hàng tuần/tháng | Thường không |
| Corrective (Khắc phục) | Sửa lỗi phát sinh | Khi cần | Có thể có |
| Adaptive (Thích ứng) | Cập nhật theo thay đổi môi trường | Hàng tháng/quý | Maintenance window |
| Perfective (Cải tiến) | Nâng cao hiệu suất | Hàng quý | Maintenance window |

### 1.3. Maintenance Windows

| Window | Schedule | Duration | Scope |
|--------|----------|----------|-------|
| Weekly | Chủ nhật 02:00 - 04:00 UTC+7 | 2 hours | Minor updates, patches |
| Monthly | Chủ nhật đầu tháng 01:00 - 05:00 UTC+7 | 4 hours | Major updates, DB maintenance |
| Quarterly | Theo lịch thông báo | 6-8 hours | Infrastructure upgrades |
| Emergency | As needed | Variable | Critical fixes |

---

## 2. Bảo trì Database

### 2.1. Lịch bảo trì Database

| Task | Frequency | Impact | Duration |
|------|-----------|--------|----------|
| VACUUM ANALYZE | Daily (auto, 03:00) | Minimal | 15-30 min |
| Reindex | Monthly | Low | 1-2 hours |
| Statistics update | Weekly (auto) | Minimal | 5-10 min |
| Table bloat check | Weekly | None | 5 min |
| Slow query review | Weekly | None | Manual review |
| Backup verification | Monthly | None (separate env) | 1-2 hours |
| Failover test | Quarterly | 30-60s downtime | 15 min |
| Version upgrade | Semi-annually | Maintenance window | 2-4 hours |

### 2.2. VACUUM & Maintenance

```bash
# Auto-vacuum settings (postgresql.conf)
autovacuum = on
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05

# Manual VACUUM cho large tables
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "VACUUM (VERBOSE, ANALYZE) policies;"
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "VACUUM (VERBOSE, ANALYZE) claims;"
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "VACUUM (VERBOSE, ANALYZE) payments;"

# Check table bloat
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT schemaname, tablename, 
   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
   pg_size_pretty(pg_table_size(schemaname||'.'||tablename)) as table_size
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
   LIMIT 20;"
```

### 2.3. Index Maintenance

```bash
# Check index usage
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch,
   pg_size_pretty(pg_relation_size(indexrelid)) as size
   FROM pg_stat_user_indexes
   ORDER BY idx_scan ASC LIMIT 20;"

# Find unused indexes (candidates for removal)
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT indexrelname, relname, idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
   ORDER BY pg_relation_size(indexrelid) DESC;"

# Reindex (CONCURRENTLY to avoid locks)
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "REINDEX INDEX CONCURRENTLY idx_policies_customer_id;"
```

### 2.4. Data Archival

| Table | Archive Condition | Archive Destination | Frequency |
|-------|------------------|--------------------|-----------| 
| audit_logs | > 90 days old | S3 (Parquet) | Monthly |
| notifications | > 60 days old, read | S3 (CSV) | Monthly |
| session_logs | > 30 days old | S3 (compressed) | Weekly |
| quote_history | > 180 days old, not converted | S3 (Parquet) | Quarterly |
| payment_logs | > 365 days old | S3 (Parquet) + Glacier | Annually |

```bash
# Archive old audit logs
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "COPY (SELECT * FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days')
   TO PROGRAM 'aws s3 cp - s3://insurance-archive/audit_logs/$(date +%Y%m).csv'
   WITH CSV HEADER;"

# Delete archived records
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';"

# VACUUM after large deletes
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "VACUUM ANALYZE audit_logs;"
```

---

## 3. Bảo trì Application Services

### 3.1. Container Image Updates

| Task | Frequency | Process |
|------|-----------|---------|
| Base image update | Monthly | Rebuild with latest base |
| Dependency update | Bi-weekly | npm audit fix, update packages |
| Security patch | As needed (CVE) | Immediate rebuild + deploy |
| Runtime upgrade (Node.js) | Quarterly | Test → Staging → Prod |

```bash
# Check for outdated dependencies
npm outdated --production

# Security audit
npm audit --production
npm audit fix

# Check container vulnerabilities
trivy image insurance-api:latest
trivy image insurance-web:latest

# Update base images
docker pull node:20-alpine
docker build -t insurance-api:v{new_version} .
```

### 3.2. Log Rotation & Cleanup

| Log Type | Retention | Storage | Rotation |
|----------|-----------|---------|----------|
| Application logs | 30 days | ELK Stack | Daily rotation |
| Access logs | 90 days | S3 | Daily rotation |
| Error logs | 180 days | ELK + S3 | Daily rotation |
| Audit logs | 7 years | S3 + Glacier | Monthly archive |
| Debug logs | 7 days | Local | Hourly rotation |

```bash
# Check log storage usage
kubectl exec -it elasticsearch-0 -n logging -- \
  curl -s localhost:9200/_cat/indices?v | sort -k 4 -hr | head -20

# Delete old indices
curator_cli delete_indices \
  --filter_list '[{"filtertype":"age","source":"name","timestring":"%Y.%m.%d","unit":"days","unit_count":30}]'

# Force merge old indices (save space)
curl -X POST "elasticsearch:9200/logs-2026.04.*/_forcemerge?max_num_segments=1"
```

### 3.3. Health Check Maintenance

```bash
# Verify all health endpoints
services=("auth" "policy" "claims" "payment" "quote" "notification")
for svc in "${services[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" https://api.insurance.vn/$svc/health)
  echo "$svc: $status"
done

# Deep health check (includes dependency checks)
curl -s https://api.insurance.vn/health/deep | jq .
# Expected output:
# {
#   "status": "healthy",
#   "database": "connected",
#   "redis": "connected",
#   "queue": "connected",
#   "external_apis": { "vnpay": "up", "ekyc": "up" }
# }
```

---

## 4. Bảo trì Infrastructure

### 4.1. Kubernetes Cluster Maintenance

| Task | Frequency | Impact | Notes |
|------|-----------|--------|-------|
| Node OS patching | Monthly | Rolling (no downtime) | Drain → Patch → Uncordon |
| K8s version upgrade | Quarterly | Brief API server restart | Follow AWS EKS guide |
| etcd compaction | Weekly (auto) | None | Managed by EKS |
| Certificate rotation | Auto (before expiry) | None | cert-manager handles |
| Resource quota review | Monthly | None | Adjust if needed |
| PV/PVC cleanup | Monthly | None | Remove orphaned |

```bash
# Check cluster version
kubectl version --short

# Check node status and versions
kubectl get nodes -o wide

# Check for pending upgrades (EKS)
aws eks describe-update --name insurance-prod-cluster --update-id {update-id}

# Node patching (rolling)
for node in $(kubectl get nodes -o name); do
  echo "Patching $node..."
  kubectl drain $node --ignore-daemonsets --delete-emptydir-data
  # AWS SSM patching
  aws ssm send-command --instance-ids {id} --document-name AWS-RunPatchBaseline
  kubectl uncordon $node
  sleep 60  # Wait for pods to stabilize
done

# Cleanup orphaned PVCs
kubectl get pvc -n production | grep -v Bound
```

### 4.2. Network Maintenance

| Task | Frequency | Tool | Notes |
|------|-----------|------|-------|
| SSL certificate check | Daily (auto) | cert-manager | Alert if < 30 days |
| DNS health check | Every 5 min | Route53 health checks | Auto-failover |
| CDN cache purge | As needed | CloudFront | After content update |
| Security group audit | Monthly | AWS Config | Remove unused rules |
| WAF rule update | Monthly | AWS WAF | Update threat patterns |
| Network ACL review | Quarterly | Manual | Least privilege |

```bash
# Check SSL certificates
echo | openssl s_client -servername insurance.vn -connect insurance.vn:443 2>/dev/null | \
  openssl x509 -noout -enddate

# CDN cache invalidation
aws cloudfront create-invalidation \
  --distribution-id $CF_DISTRIBUTION_ID \
  --paths "/*"

# Check WAF blocked requests
aws wafv2 get-sampled-requests \
  --web-acl-arn $WAF_ARN \
  --rule-metric-name BlockedRequests \
  --scope REGIONAL \
  --time-window StartTime=$(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ),EndTime=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --max-items 20
```

### 4.3. Storage Maintenance

```bash
# Check S3 bucket sizes
aws s3 ls --summarize --human-readable s3://insurance-documents/
aws s3 ls --summarize --human-readable s3://insurance-backups/

# Apply lifecycle policies (already configured)
# - documents: Standard → IA after 90 days → Glacier after 365 days
# - backups: Delete after 90 days (except monthly: keep 1 year)
# - logs: Delete after retention period

# Check EBS volumes usage
aws ec2 describe-volumes \
  --filters "Name=tag:Environment,Values=production" \
  --query 'Volumes[*].{ID:VolumeId,Size:Size,State:State}' \
  --output table

# Clean up unused EBS snapshots (> 90 days, not attached)
aws ec2 describe-snapshots --owner-ids self \
  --query 'Snapshots[?StartTime<`2026-02-15`].SnapshotId' \
  --output text | xargs -I {} aws ec2 delete-snapshot --snapshot-id {}
```

---

## 5. Bảo trì Security

### 5.1. Security Maintenance Schedule

| Task | Frequency | Owner | Duration |
|------|-----------|-------|----------|
| Dependency vulnerability scan | Per deploy (CI) | Automated | 5 min |
| Container image scan | Per build (CI) | Automated | 5 min |
| OWASP ZAP scan | Weekly | Security team | 2 hours |
| Penetration test | Quarterly | External vendor | 1-2 weeks |
| Access key rotation | Every 90 days | DevOps | 30 min |
| Secret rotation | Every 90 days | DevOps | 1 hour |
| IAM policy review | Monthly | Security + DevOps | 2 hours |
| Firewall rule review | Monthly | DevOps | 1 hour |
| Compliance audit | Annually | External auditor | 2-4 weeks |

### 5.2. Secret Rotation

```bash
# Rotate database passwords
# 1. Generate new password
NEW_DB_PASS=$(openssl rand -base64 32)

# 2. Update RDS password
aws rds modify-db-instance \
  --db-instance-identifier insurance-prod-primary \
  --master-user-password "$NEW_DB_PASS"

# 3. Update Kubernetes secret
kubectl create secret generic db-credentials -n production \
  --from-literal=password="$NEW_DB_PASS" \
  --dry-run=client -o yaml | kubectl apply -f -

# 4. Rolling restart services to pick up new secret
kubectl rollout restart deployment/policy-service -n production
kubectl rollout restart deployment/claims-service -n production
kubectl rollout restart deployment/payment-service -n production

# Rotate API keys (external services)
# 1. Generate new key in provider portal
# 2. Update Kubernetes secret
kubectl edit secret external-api-keys -n production
# 3. Rolling restart affected services

# Rotate JWT signing keys
# 1. Add new key (dual-key period)
# 2. Deploy with both keys valid
# 3. Wait for all old tokens to expire (24h)
# 4. Remove old key
```

### 5.3. Certificate Management

| Certificate | Type | Auto-Renew | Expiry Alert |
|-------------|------|------------|--------------|
| *.insurance.vn | Wildcard SSL | Yes (cert-manager) | 30 days |
| API mutual TLS | Client cert | No (manual) | 60 days |
| Code signing | Internal | No (manual) | 90 days |
| JWT signing key | Internal | Scheduled (90 days) | 14 days |

---

## 6. Bảo trì Monitoring & Alerting

### 6.1. Monitoring System Maintenance

| Task | Frequency | Action |
|------|-----------|--------|
| Dashboard review | Monthly | Update/add dashboards for new services |
| Alert rule tuning | Bi-weekly | Adjust thresholds, reduce noise |
| Metric cardinality check | Monthly | Prune high-cardinality metrics |
| Log ingestion rate | Weekly | Ensure within limits |
| Retention policy check | Quarterly | Adjust based on storage/cost |
| Grafana plugin updates | Monthly | Update compatible plugins |

### 6.2. Alert Tuning Process

```
Alert Noise Reduction Process:
1. Review alert frequency (last 30 days)
2. Identify noisy alerts (> 5 fires/week without action)
3. For each noisy alert:
   a. Is the threshold too sensitive? → Adjust
   b. Is it a known issue? → Suppress until fixed
   c. Is it not actionable? → Convert to dashboard metric
   d. Is it duplicate? → Consolidate
4. Document changes in alert changelog
5. Review after 1 week
```

---

## 7. Bảo trì Performance

### 7.1. Performance Baseline

| Metric | Baseline | Warning | Critical | Measurement |
|--------|----------|---------|----------|-------------|
| API p50 latency | 50ms | 100ms | 200ms | Daily average |
| API p95 latency | 200ms | 500ms | 1000ms | Daily average |
| API p99 latency | 500ms | 1000ms | 2000ms | Daily average |
| DB query time (avg) | 10ms | 50ms | 100ms | Per query |
| Page load time | 1.5s | 3s | 5s | Web vitals |
| Throughput | 1000 rps | - | - | Peak capacity |

### 7.2. Performance Maintenance Tasks

| Task | Frequency | Action |
|------|-----------|--------|
| Query performance review | Weekly | Check slow query log, optimize |
| Cache hit ratio check | Daily | Ensure > 90% hit ratio |
| CDN performance check | Weekly | Review cache hit ratio, latency |
| Load test | Monthly | Simulate peak traffic (2x normal) |
| Stress test | Quarterly | Find breaking point |
| Database query plan review | Bi-weekly | EXPLAIN ANALYZE on key queries |
| Frontend performance audit | Monthly | Lighthouse, Core Web Vitals |

```bash
# Quick performance check
echo "=== API Latency (last 1h) ==="
# Query from monitoring: http_request_duration_seconds{quantile="0.95"}

echo "=== Cache Hit Ratio ==="
redis-cli -h $REDIS_HOST INFO stats | grep hit_rate

echo "=== DB Active Queries ==="
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

echo "=== Queue Depth ==="
aws sqs get-queue-attributes --queue-url $QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages --output text
```

---

## 8. Planned Maintenance Procedure

### 8.1. Pre-Maintenance Checklist

```
□ Maintenance window approved (Change Management)
□ Stakeholders notified (48h in advance for planned)
□ Status page updated with scheduled maintenance
□ Rollback plan documented and reviewed
□ Backup completed and verified
□ On-call team aware and available
□ Communication channels ready (#maintenance Slack)
□ Monitoring dashboards open
□ Customer-facing notification sent (email/in-app)
□ Support team briefed
```

### 8.2. During Maintenance

```
□ Enable maintenance mode (if needed)
□ Verify traffic redirected to maintenance page
□ Execute maintenance tasks per plan
□ Verify each step before proceeding
□ Document any deviations from plan
□ Test critical paths after changes
□ Monitor system metrics
□ Keep stakeholders updated every 30 minutes
```

### 8.3. Post-Maintenance Checklist

```
□ All services healthy (health checks pass)
□ Smoke tests pass
□ Performance metrics within baseline
□ Error rates normal
□ Business metrics normal (orders, signups)
□ Status page updated: "Maintenance complete"
□ Stakeholders notified: "Maintenance successful"
□ Maintenance report documented
□ Any follow-up items ticketed
□ On-call team briefed on changes made
```

### 8.4. Maintenance Communication Template

```
Subject: [Scheduled Maintenance] Insurance System - {Date}

Dear Customers/Team,

We will be performing scheduled maintenance on our system.

Maintenance Window:
- Start: {Date} {Time} (Vietnam time, UTC+7)
- End: {Date} {Time} (Vietnam time, UTC+7)
- Duration: approximately {X} hours

Impact:
- {Description of impact}
- {Which services affected}
- {Workarounds if any}

What we're doing:
- {Brief description of maintenance work}

No action required from you.
We apologize for any inconvenience.

Best regards,
Insurance System Operations Team
```

---

## 9. Automation & Tooling

### 9.1. Automated Maintenance Tasks

| Task | Tool | Schedule | Alert on Failure |
|------|------|----------|-----------------|
| DB vacuum | pg_cron | Daily 03:00 | Yes (PagerDuty) |
| Log rotation | Logrotate / Filebeat | Hourly | Yes (Slack) |
| Backup | AWS Backup | Daily 02:00 | Yes (PagerDuty) |
| Certificate renewal | cert-manager | Auto (30 days before) | Yes (PagerDuty) |
| Security scan | Trivy (CI/CD) | Per deploy | Yes (Slack) |
| Dependency audit | npm audit (CI/CD) | Per deploy | Yes (Slack) |
| Dead letter queue check | CloudWatch alarm | Every 5 min | Yes (if > 100 msgs) |
| Disk cleanup | CronJob | Weekly | Yes (Slack) |

### 9.2. Maintenance Scripts

```
/scripts/
├── maintenance/
│   ├── db-vacuum.sh            # Database vacuum
│   ├── db-reindex.sh           # Reindex tables
│   ├── archive-old-data.sh     # Archive old records
│   ├── rotate-secrets.sh       # Secret rotation
│   ├── cleanup-logs.sh         # Log cleanup
│   ├── cleanup-images.sh       # Old container image cleanup
│   ├── backup-verify.sh        # Verify backup integrity
│   ├── ssl-check.sh            # Check SSL certificate expiry
│   ├── health-check-all.sh     # Deep health check all services
│   └── performance-baseline.sh # Collect performance baseline
```

---

## 10. Phê duyệt

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |
| DevOps Lead | | | |
| Engineering Manager | | | |
