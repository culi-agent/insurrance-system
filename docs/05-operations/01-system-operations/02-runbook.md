# Runbook - Sổ tay vận hành

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Tổng quan hệ thống

### 1.1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────┐     ┌──────────┐     ┌──────────────────────────────┐     │
│  │  Users  │────▶│   CDN    │────▶│        Load Balancer          │     │
│  └─────────┘     │(CloudFront)    │        (ALB/NLB)             │     │
│                   └──────────┘     └──────────┬───────────────────┘     │
│                                                │                         │
│                          ┌─────────────────────┼──────────────────┐     │
│                          ▼                     ▼                  ▼     │
│                   ┌────────────┐      ┌────────────┐     ┌──────────┐ │
│                   │ Web App    │      │  API       │     │  Admin   │ │
│                   │ (Next.js)  │      │  Gateway   │     │  Portal  │ │
│                   └────────────┘      └─────┬──────┘     └──────────┘ │
│                                              │                         │
│                   ┌──────────────────────────┼────────────────────┐   │
│                   ▼            ▼             ▼          ▼         ▼   │
│            ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────┐│
│            │  Auth    │ │  Policy  │ │  Claims  │ │Payment │ │Quote││
│            │ Service  │ │ Service  │ │ Service  │ │Service │ │Svc  ││
│            └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └──┬──┘│
│                 │            │            │            │         │   │
│                 ▼            ▼            ▼            ▼         ▼   │
│            ┌─────────────────────────────────────────────────────────┐│
│            │              PostgreSQL (Primary + Replica)              ││
│            └─────────────────────────────────────────────────────────┘│
│            ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│            │  Redis   │  │   S3     │  │  SQS/    │                  │
│            │  Cache   │  │ Storage  │  │  Queue   │                  │
│            └──────────┘  └──────────┘  └──────────┘                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Service Inventory

| Service | Port | Health Check | Repository | Owner |
|---------|------|-------------|------------|-------|
| API Gateway | 8080 | /health | insurance-api-gateway | Platform Team |
| Auth Service | 8081 | /health | insurance-auth | Platform Team |
| Policy Service | 8082 | /health | insurance-policy | Policy Team |
| Claims Service | 8083 | /health | insurance-claims | Claims Team |
| Payment Service | 8084 | /health | insurance-payment | Payment Team |
| Quote Service | 8085 | /health | insurance-quote | Product Team |
| Notification Service | 8086 | /health | insurance-notification | Platform Team |
| Web Frontend | 3000 | / | insurance-web | Frontend Team |
| Admin Portal | 3001 | / | insurance-admin | Frontend Team |

### 1.3. Infrastructure Details

| Component | Provider | Region | Configuration |
|-----------|----------|--------|--------------|
| Kubernetes | AWS EKS | ap-southeast-1 | 3 node groups, auto-scaling |
| Database | AWS RDS PostgreSQL | ap-southeast-1a/b | Multi-AZ, db.r6g.xlarge |
| Cache | AWS ElastiCache Redis | ap-southeast-1 | Cluster mode, r6g.large |
| Storage | AWS S3 | ap-southeast-1 | Standard + Glacier |
| CDN | AWS CloudFront | Global | Custom domain, SSL |
| Queue | AWS SQS | ap-southeast-1 | Standard + FIFO queues |
| DNS | AWS Route 53 | Global | Health check enabled |
| Monitoring | DataDog / Grafana | - | Full stack |
| Logging | ELK Stack | ap-southeast-1 | 30-day retention |

---

## 2. Runbook: Service Restart Procedures

### 2.1. Restart Single Service

**When**: Service unresponsive, memory leak, stuck process

```bash
# 1. Check current status
kubectl get pods -l app={service-name} -n production

# 2. Check pod logs before restart
kubectl logs -l app={service-name} -n production --tail=100

# 3. Rolling restart (zero downtime)
kubectl rollout restart deployment/{service-name} -n production

# 4. Monitor rollout
kubectl rollout status deployment/{service-name} -n production

# 5. Verify health
curl -s https://api.insurance.vn/{service}/health | jq .

# 6. Check new pod logs
kubectl logs -l app={service-name} -n production --tail=50 -f
```

### 2.2. Restart All Services

**When**: Major configuration change, platform-wide issue

```bash
# 1. Notify team
# Post in #operations: "Restarting all services - reason: {reason}"

# 2. Enable maintenance page
kubectl apply -f manifests/maintenance-mode.yaml

# 3. Restart services in order (dependencies first)
kubectl rollout restart deployment/auth-service -n production
sleep 30
kubectl rollout restart deployment/policy-service -n production
kubectl rollout restart deployment/claims-service -n production
kubectl rollout restart deployment/payment-service -n production
kubectl rollout restart deployment/quote-service -n production
sleep 30
kubectl rollout restart deployment/api-gateway -n production

# 4. Verify all healthy
kubectl get pods -n production
curl -s https://api.insurance.vn/health | jq .

# 5. Disable maintenance page
kubectl delete -f manifests/maintenance-mode.yaml

# 6. Notify team: "All services restarted successfully"
```

---

## 3. Runbook: Database Operations

### 3.1. Database Connection Issues

**Symptoms**: Connection timeout errors, "too many connections", slow queries

```bash
# 1. Check current connections
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT count(*) as total, state FROM pg_stat_activity GROUP BY state;"

# 2. Check max connections
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c "SHOW max_connections;"

# 3. Kill idle connections (> 10 minutes)
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';"

# 4. Check for long-running queries
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state != 'idle' AND query_start < NOW() - INTERVAL '5 minutes'
   ORDER BY duration DESC;"

# 5. If needed, restart connection pool
kubectl rollout restart deployment/{service-name} -n production
```

### 3.2. Database Failover

**When**: Primary DB unresponsive, replication lag > 30s

```bash
# 1. Check replication status
aws rds describe-db-instances --db-instance-identifier insurance-prod-primary \
  --query 'DBInstances[0].DBInstanceStatus'

# 2. Check replication lag
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name ReplicaLag \
  --dimensions Name=DBInstanceIdentifier,Value=insurance-prod-replica

# 3. Initiate failover (RDS Multi-AZ auto-failover)
aws rds reboot-db-instance \
  --db-instance-identifier insurance-prod-primary \
  --force-failover

# 4. Monitor failover progress (typically 60-120 seconds)
watch -n 5 "aws rds describe-db-instances \
  --db-instance-identifier insurance-prod-primary \
  --query 'DBInstances[0].DBInstanceStatus'"

# 5. Verify application connectivity
kubectl logs -l app=policy-service -n production --tail=20

# 6. Update status page & notify team
```

### 3.3. Database Backup & Restore

```bash
# Manual backup
pg_dump -h $DB_HOST -U $DB_USER -d insurance_prod -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Restore to specific point in time (RDS)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier insurance-prod-primary \
  --target-db-instance-identifier insurance-prod-restore-$(date +%Y%m%d) \
  --restore-time "2026-05-15T10:00:00Z"

# Verify restored instance
psql -h $RESTORED_DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT count(*) FROM policies WHERE created_at > '2026-05-15';"
```

---

## 4. Runbook: Payment Service Issues

### 4.1. Payment Gateway Timeout

**Symptoms**: Users cannot complete payment, timeout errors in logs

```bash
# 1. Check payment service health
curl -s https://api.insurance.vn/payment/health | jq .

# 2. Check gateway connectivity
curl -s -o /dev/null -w "%{http_code} %{time_total}s" \
  https://sandbox.vnpay.vn/health

# 3. Check recent payment errors
kubectl logs -l app=payment-service -n production --tail=200 | grep -i "error\|timeout"

# 4. Check payment success rate (last 30 min)
# Query monitoring: payment_success_rate{service="payment"} [30m]

# 5. If gateway is down:
#    a. Enable alternative payment method
kubectl apply -f manifests/payment-fallback.yaml
#    b. Update status page
#    c. Contact gateway support

# 6. If our service issue:
kubectl rollout restart deployment/payment-service -n production
```

### 4.2. Payment Reconciliation Mismatch

**When**: Mismatch between our records and gateway records

```bash
# 1. Export our transaction records
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "COPY (SELECT * FROM payments 
   WHERE created_at BETWEEN '2026-05-14' AND '2026-05-15'
   AND status = 'completed') TO STDOUT WITH CSV HEADER;" > our_records.csv

# 2. Download gateway records (VNPay portal or API)
# Manual: Download from merchant portal

# 3. Run reconciliation script
python scripts/reconcile_payments.py \
  --our-file our_records.csv \
  --gateway-file vnpay_records.csv \
  --date 2026-05-14

# 4. Review mismatches
# Output: reconciliation_report_20260514.csv

# 5. For each mismatch:
#    - Gateway SUCCESS + Our PENDING → Update our record
#    - Gateway FAILED + Our SUCCESS → Investigate, possibly refund
#    - Missing in gateway → Re-query gateway API
```

---

## 5. Runbook: Cache (Redis) Operations

### 5.1. Redis Memory Full

**Symptoms**: Redis OOM errors, increased latency, cache misses

```bash
# 1. Check Redis memory usage
redis-cli -h $REDIS_HOST INFO memory | grep used_memory_human

# 2. Check eviction policy
redis-cli -h $REDIS_HOST CONFIG GET maxmemory-policy

# 3. Find large keys
redis-cli -h $REDIS_HOST --bigkeys

# 4. Check key distribution by prefix
redis-cli -h $REDIS_HOST --scan --pattern "session:*" | wc -l
redis-cli -h $REDIS_HOST --scan --pattern "quote:*" | wc -l
redis-cli -h $REDIS_HOST --scan --pattern "cache:*" | wc -l

# 5. Clear expired/stale caches
redis-cli -h $REDIS_HOST SCAN 0 MATCH "cache:quote:*" COUNT 1000 | \
  xargs redis-cli -h $REDIS_HOST DEL

# 6. If critical - flush non-essential caches
redis-cli -h $REDIS_HOST EVAL "
  local keys = redis.call('keys', 'cache:product:*')
  for i,k in ipairs(keys) do redis.call('del', k) end
  return #keys
" 0

# 7. Scale Redis if needed
# AWS Console: Modify ElastiCache → increase node type
```

### 5.2. Redis Connection Issues

```bash
# 1. Test connectivity
redis-cli -h $REDIS_HOST PING

# 2. Check client connections
redis-cli -h $REDIS_HOST INFO clients

# 3. Check connected clients list
redis-cli -h $REDIS_HOST CLIENT LIST | wc -l

# 4. Kill idle clients (> 300 seconds)
redis-cli -h $REDIS_HOST CLIENT KILL IDLE 300

# 5. Restart services with connection pools
kubectl rollout restart deployment/auth-service -n production
kubectl rollout restart deployment/quote-service -n production
```

---

## 6. Runbook: Queue/Message Processing

### 6.1. Queue Backlog (SQS)

**Symptoms**: Messages accumulating, notifications delayed

```bash
# 1. Check queue depth
aws sqs get-queue-attributes \
  --queue-url $QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages

# 2. Check dead letter queue
aws sqs get-queue-attributes \
  --queue-url $DLQ_URL \
  --attribute-names ApproximateNumberOfMessages

# 3. Check consumer health
kubectl get pods -l app=notification-service -n production
kubectl logs -l app=notification-service -n production --tail=50

# 4. Scale up consumers
kubectl scale deployment/notification-service -n production --replicas=5

# 5. Monitor queue drain
watch -n 10 "aws sqs get-queue-attributes \
  --queue-url $QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages \
  --output text"

# 6. Once drained, scale back down
kubectl scale deployment/notification-service -n production --replicas=2
```

### 6.2. Dead Letter Queue Processing

```bash
# 1. Count DLQ messages
aws sqs get-queue-attributes --queue-url $DLQ_URL \
  --attribute-names ApproximateNumberOfMessages

# 2. Sample messages from DLQ
aws sqs receive-message --queue-url $DLQ_URL --max-number-of-messages 5 | jq .

# 3. Analyze failure pattern
# Look for common error types

# 4. Fix underlying issue first

# 5. Redrive messages back to main queue
aws sqs start-message-move-task \
  --source-arn $DLQ_ARN \
  --destination-arn $MAIN_QUEUE_ARN
```

---

## 7. Runbook: SSL/TLS Certificate Issues

### 7.1. Certificate Expiring

**When**: Certificate expires in < 7 days

```bash
# 1. Check certificate expiry
echo | openssl s_client -servername insurance.vn -connect insurance.vn:443 2>/dev/null | \
  openssl x509 -noout -dates

# 2. Check cert-manager status (if using)
kubectl get certificates -n production
kubectl describe certificate insurance-tls -n production

# 3. Force renewal (cert-manager)
kubectl delete secret insurance-tls -n production
# cert-manager will auto-request new cert

# 4. Manual renewal (if not using cert-manager)
# a. Generate CSR
# b. Submit to CA
# c. Download new cert
# d. Update secret
kubectl create secret tls insurance-tls \
  --cert=fullchain.pem --key=privkey.pem -n production --dry-run=client -o yaml | \
  kubectl apply -f -

# 5. Restart ingress
kubectl rollout restart deployment/ingress-nginx-controller -n ingress

# 6. Verify
curl -vI https://insurance.vn 2>&1 | grep "expire date"
```

---

## 8. Runbook: Kubernetes Operations

### 8.1. Node Not Ready

```bash
# 1. Check node status
kubectl get nodes
kubectl describe node {node-name}

# 2. Check node conditions
kubectl get node {node-name} -o jsonpath='{.status.conditions}' | jq .

# 3. Drain node (move pods to other nodes)
kubectl drain {node-name} --ignore-daemonsets --delete-emptydir-data

# 4. Check affected pods
kubectl get pods -A -o wide | grep {node-name}

# 5. If EC2 instance issue - terminate and let ASG replace
aws ec2 terminate-instances --instance-ids {instance-id}

# 6. Verify new node joins cluster
watch kubectl get nodes

# 7. Uncordon if node recovered
kubectl uncordon {node-name}
```

### 8.2. Pod CrashLoopBackOff

```bash
# 1. Check pod status
kubectl get pod {pod-name} -n production
kubectl describe pod {pod-name} -n production

# 2. Check logs
kubectl logs {pod-name} -n production --previous
kubectl logs {pod-name} -n production

# 3. Common causes & fixes:
# a. OOMKilled → Increase memory limit
kubectl patch deployment {deployment} -n production -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"{container}","resources":{"limits":{"memory":"1Gi"}}}]}}}}'

# b. Config error → Check configmap/secret
kubectl get configmap {name} -n production -o yaml
kubectl get secret {name} -n production -o yaml

# c. Dependency not ready → Check dependent services
kubectl get pods -n production | grep -v Running

# 4. Force recreate pod
kubectl delete pod {pod-name} -n production
```

### 8.3. Horizontal Pod Autoscaler Issues

```bash
# 1. Check HPA status
kubectl get hpa -n production
kubectl describe hpa {hpa-name} -n production

# 2. Check metrics server
kubectl top pods -n production
kubectl top nodes

# 3. Manual scale if HPA not responding
kubectl scale deployment/{service} -n production --replicas={count}

# 4. Fix HPA
kubectl patch hpa {hpa-name} -n production -p \
  '{"spec":{"minReplicas":2,"maxReplicas":10,"targetCPUUtilizationPercentage":70}}'
```

---

## 9. Runbook: External Service Failures

### 9.1. Insurer API Down

**Impact**: Cannot generate quotes, issue policies for affected insurer

```bash
# 1. Verify insurer API status
curl -s -o /dev/null -w "%{http_code}" https://api.insurer-a.com/health

# 2. Check circuit breaker status
curl -s https://api.insurance.vn/internal/circuit-breakers | jq .

# 3. If insurer confirmed down:
#    a. Circuit breaker should auto-open
#    b. Verify quotes exclude this insurer
#    c. Update status on product pages

# 4. Notify affected teams
# Post: "Insurer A API is down. Quotes/policies for Insurer A unavailable."

# 5. Monitor recovery
watch -n 30 "curl -s -o /dev/null -w '%{http_code}' https://api.insurer-a.com/health"

# 6. When recovered, verify circuit breaker closes
# Circuit breaker auto-closes after 5 successful health checks
```

### 9.2. eKYC Service Down

**Impact**: Users cannot complete identity verification

```bash
# 1. Check eKYC service
curl -s https://api.ekyc-provider.com/health

# 2. Enable manual KYC fallback
kubectl set env deployment/auth-service -n production EKYC_FALLBACK=true

# 3. Notify customer support team
# "eKYC auto-verification unavailable. Manual verification queue active."

# 4. Monitor recovery and disable fallback
kubectl set env deployment/auth-service -n production EKYC_FALLBACK=false
```

### 9.3. Email/SMS Provider Down

**Impact**: Notifications not sending, OTP not delivered

```bash
# 1. Check provider status
curl -s https://api.sendgrid.com/v3/status

# 2. Switch to backup provider
kubectl set env deployment/notification-service -n production \
  EMAIL_PROVIDER=ses \
  SMS_PROVIDER=twilio_backup

# 3. Process queued notifications
kubectl scale deployment/notification-service -n production --replicas=5

# 4. Revert when primary recovered
kubectl set env deployment/notification-service -n production \
  EMAIL_PROVIDER=sendgrid \
  SMS_PROVIDER=twilio
```

---

## 10. Runbook: Performance Issues

### 10.1. High Latency

```bash
# 1. Identify slow endpoints
# Grafana: API latency dashboard → sort by p95

# 2. Check database slow queries
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT query, calls, mean_exec_time, total_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC LIMIT 10;"

# 3. Check for resource saturation
kubectl top pods -n production --sort-by=cpu
kubectl top pods -n production --sort-by=memory

# 4. Check external dependency latency
# Grafana: External API latency panel

# 5. Quick fixes:
# a. Scale up pods
kubectl scale deployment/{service} -n production --replicas={n+2}

# b. Clear cache if stale
redis-cli -h $REDIS_HOST FLUSHDB

# c. Add missing index (if query issue identified)
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "CREATE INDEX CONCURRENTLY idx_{table}_{column} ON {table}({column});"
```

### 10.2. High Error Rate

```bash
# 1. Identify error patterns
kubectl logs -l app={service} -n production --since=10m | grep -i "error" | sort | uniq -c | sort -rn | head -20

# 2. Check for recent deployments
kubectl rollout history deployment/{service} -n production

# 3. If related to recent deployment → Rollback
kubectl rollout undo deployment/{service} -n production

# 4. If not deployment related:
# a. Check external dependencies
# b. Check resource limits
# c. Check for data issues

# 5. Enable debug logging temporarily
kubectl set env deployment/{service} -n production LOG_LEVEL=debug
# Remember to disable after investigation
kubectl set env deployment/{service} -n production LOG_LEVEL=info
```

---

## 11. Quick Reference

### 11.1. Important URLs

| Service | URL | Notes |
|---------|-----|-------|
| Production | https://insurance.vn | Main website |
| Admin Portal | https://admin.insurance.vn | Internal only |
| API Docs | https://api.insurance.vn/docs | Swagger UI |
| Monitoring | https://grafana.internal.insurance.vn | Dashboards |
| Alerting | https://pagerduty.com/insurance | On-call schedule |
| Logs | https://kibana.internal.insurance.vn | ELK Stack |
| CI/CD | https://github.com/insurance-system/actions | GitHub Actions |
| Status Page | https://status.insurance.vn | Public status |

### 11.2. Emergency Contacts

| Role | Contact | Escalation Time |
|------|---------|-----------------|
| On-Call Primary | PagerDuty rotation | Immediate |
| On-Call Secondary | PagerDuty rotation | After 10 min |
| DevOps Lead | Phone + Slack | P1/P2 only |
| CTO | Phone | P1 only |
| AWS Support | Enterprise support | Infrastructure issues |
| VNPay Support | Hotline + Email | Payment issues |
| eKYC Provider | Email + Phone | Verification issues |

### 11.3. Common Commands Cheat Sheet

```bash
# Kubernetes
kubectl get pods -n production                    # List all pods
kubectl logs -f {pod} -n production              # Follow logs
kubectl exec -it {pod} -n production -- sh       # Shell into pod
kubectl port-forward {pod} 8080:8080 -n prod     # Port forward

# Database
psql -h $DB_HOST -U $DB_USER -d insurance_prod   # Connect to DB
pg_dump -h $DB_HOST -U $DB_USER -d insurance_prod # Backup

# Redis
redis-cli -h $REDIS_HOST INFO                     # Redis info
redis-cli -h $REDIS_HOST MONITOR                  # Monitor commands

# AWS
aws ecs list-services --cluster production        # List services
aws logs tail /aws/ecs/production --follow        # Follow logs
aws rds describe-db-instances                     # DB status
```
