# Troubleshooting Guide - Hướng dẫn xử lý sự cố

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Tên dự án | Insurance System - Hệ thống bán bảo hiểm trực tuyến |
| Phiên bản | 1.0 |
| Ngày tạo | 2026-05-15 |
| Tác giả | Insurance System Team |
| Trạng thái | Draft |

---

## 1. Phương pháp xử lý sự cố

### 1.1. Quy trình chung

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Identify │──▶│ Classify │──▶│ Diagnose │──▶│  Resolve │──▶│ Verify   │
│ Problem  │   │ Severity │   │ Root Cause│  │          │   │ & Close  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### 1.2. Diagnostic Tools

| Tool | Purpose | Access |
|------|---------|--------|
| Grafana | Metrics & dashboards | https://grafana.internal.insurance.vn |
| Kibana | Log search & analysis | https://kibana.internal.insurance.vn |
| PagerDuty | Alert history | https://pagerduty.com/insurance |
| kubectl | Pod/service inspection | CLI (VPN required) |
| AWS Console | Infrastructure status | IAM role access |
| Sentry | Error tracking | https://sentry.insurance.vn |

---

## 2. Sự cố Authentication & User Access

### 2.1. Người dùng không thể đăng nhập

**Triệu chứng**: User báo "Sai mật khẩu" hoặc "Không thể đăng nhập"

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Sai mật khẩu | Kiểm tra số lần thử | Hướng dẫn reset password |
| Account bị khóa | Check `users.locked_at` | Unlock: `UPDATE users SET locked_at=NULL, failed_attempts=0 WHERE email='{email}'` |
| OTP expired | Check thời gian gửi OTP | Gửi lại OTP mới |
| Auth service down | Check health endpoint | Restart auth service |
| JWT token expired | Check token expiry | User đăng nhập lại |
| Session invalidated | Check Redis session | Clear session, đăng nhập lại |

```bash
# Kiểm tra trạng thái account
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT id, email, status, locked_at, failed_attempts, last_login_at
   FROM users WHERE email = '{user_email}';"

# Kiểm tra auth service logs
kubectl logs -l app=auth-service -n production --since=10m | grep "{user_email}"

# Unlock account
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "UPDATE users SET locked_at = NULL, failed_attempts = 0 
   WHERE email = '{user_email}' AND locked_at IS NOT NULL;"
```

### 2.2. OTP không nhận được

**Triệu chứng**: User không nhận SMS/Email OTP

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| SMS provider down | Check provider status | Switch to backup provider |
| Email in spam | Khuyên user check spam | Whitelist domain |
| Phone number sai format | Validate in DB | Cập nhật số đúng |
| Rate limit | Check send count | Wait 5 min hoặc override |
| Notification queue backlog | Check SQS depth | Scale consumers |

```bash
# Kiểm tra OTP đã gửi chưa
kubectl logs -l app=notification-service -n production --since=30m | \
  grep "{phone_number_or_email}"

# Kiểm tra queue
aws sqs get-queue-attributes --queue-url $NOTIFICATION_QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages

# Manual resend OTP (emergency)
curl -X POST https://api.insurance.vn/internal/auth/resend-otp \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "{user_id}", "channel": "sms"}'
```

### 2.3. eKYC Verification Failed

**Triệu chứng**: "Xác minh danh tính thất bại"

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Ảnh CCCD mờ/tối | Check uploaded images | Hướng dẫn chụp lại |
| OCR confidence thấp | Check eKYC logs | Manual review queue |
| eKYC service timeout | Check external API | Retry hoặc manual verify |
| CCCD hết hạn | Check expiry date | Yêu cầu CCCD mới |
| Face match failed | Check liveness score | Retry với ánh sáng tốt hơn |

```bash
# Check eKYC request status
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT id, user_id, status, confidence_score, error_message, created_at
   FROM ekyc_verifications 
   WHERE user_id = '{user_id}' 
   ORDER BY created_at DESC LIMIT 5;"

# Check eKYC provider logs
kubectl logs -l app=auth-service -n production --since=1h | grep "ekyc" | grep "{user_id}"

# Manual approve (khi có bằng chứng hợp lệ)
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "UPDATE ekyc_verifications SET status = 'approved', reviewed_by = 'admin:{admin_id}'
   WHERE id = '{verification_id}';"
```

---

## 3. Sự cố Quote & Product

### 3.1. Quote không hiển thị kết quả

**Triệu chứng**: User nhập thông tin nhưng không thấy báo giá

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Insurer API down | Circuit breaker status | Wait for recovery |
| Invalid input data | Check request payload | Validate và fix input |
| Product inactive | Check product status | Activate product |
| Quote service overloaded | Check CPU/memory | Scale up service |
| Timeout từ insurer | Check response times | Increase timeout / cache |
| All insurers declined | Check underwriting rules | Review eligibility |

```bash
# Check quote service health
curl -s https://api.insurance.vn/quote/health | jq .

# Check circuit breakers
curl -s https://api.insurance.vn/internal/circuit-breakers | jq .

# Check recent quote errors
kubectl logs -l app=quote-service -n production --since=15m | \
  grep -i "error\|timeout\|failed"

# Check insurer API response times
kubectl logs -l app=quote-service -n production --since=1h | \
  grep "insurer_response_time" | awk '{print $NF}' | sort -n | tail -10

# Test specific quote request
curl -X POST https://api.insurance.vn/internal/quote/test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_type": "motor", "insurer": "insurer_a", "test_data": true}'
```

### 3.2. Giá báo sai / không khớp

**Triệu chứng**: Giá hiển thị khác với giá partner confirm

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Rate table outdated | Check last sync time | Trigger rate sync |
| Discount logic error | Check discount rules | Fix business logic |
| Currency/rounding issue | Check calculation | Fix rounding logic |
| Stale cache | Check Redis cache | Clear quote cache |
| Insurer updated rates | Compare with API response | Sync new rates |

```bash
# Clear quote cache cho specific product
redis-cli -h $REDIS_HOST DEL "quote:rate:{product_id}:{insurer_id}"

# Force rate sync
curl -X POST https://api.insurance.vn/internal/rates/sync \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"insurer_id": "{insurer_id}"}'

# Compare our price vs insurer direct
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT q.id, q.our_premium, q.insurer_premium, q.discount_applied
   FROM quotes q WHERE q.id = '{quote_id}';"
```

---

## 4. Sự cố Payment

### 4.1. Thanh toán thất bại

**Triệu chứng**: User nhận thông báo "Thanh toán không thành công"

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Insufficient balance | Gateway error code | Thông báo user nạp tiền |
| Gateway timeout | Check gateway status | Retry / alternative method |
| Invalid card info | Error detail | User nhập lại thông tin |
| 3DS authentication failed | Check 3DS logs | Retry, hướng dẫn user |
| Duplicate transaction | Check transaction ID | Verify status, refund if needed |
| Amount mismatch | Compare quote vs payment | Regenerate payment link |
| Bank declined | Bank error code | User liên hệ ngân hàng |

```bash
# Check payment transaction
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT id, order_id, amount, status, gateway, gateway_response_code, 
   error_message, created_at
   FROM payments 
   WHERE order_id = '{order_id}' 
   ORDER BY created_at DESC;"

# Check gateway logs
kubectl logs -l app=payment-service -n production --since=30m | \
  grep "{order_id}"

# Query gateway for transaction status
curl -X GET "https://api.insurance.vn/internal/payment/check-status/{transaction_id}" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 4.2. Thanh toán thành công nhưng policy chưa phát hành

**Triệu chứng**: User đã thanh toán nhưng không nhận được hợp đồng

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Webhook chưa nhận | Check webhook logs | Manual trigger |
| Policy issuance queue stuck | Check queue depth | Process manually |
| Insurer API down | Check insurer status | Queue for retry |
| Data validation error | Check policy creation logs | Fix data, retry |
| PDF generation failed | Check PDF service | Regenerate PDF |

```bash
# Check payment confirmed but policy pending
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT p.id as payment_id, p.status as payment_status,
   pol.id as policy_id, pol.status as policy_status
   FROM payments p
   LEFT JOIN policies pol ON p.order_id = pol.order_id
   WHERE p.order_id = '{order_id}';"

# Check if webhook received
kubectl logs -l app=payment-service -n production --since=2h | \
  grep "webhook" | grep "{transaction_id}"

# Manual policy issuance trigger
curl -X POST "https://api.insurance.vn/internal/policy/issue" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "{order_id}", "force": true}'

# Regenerate policy PDF
curl -X POST "https://api.insurance.vn/internal/policy/{policy_id}/regenerate-pdf" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 4.3. Hoàn tiền (Refund) Issues

```bash
# Check refund status
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT id, payment_id, amount, status, gateway_refund_id, error_message
   FROM refunds WHERE payment_id = '{payment_id}';"

# Manual refund initiation
curl -X POST "https://api.insurance.vn/internal/payment/refund" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "{payment_id}",
    "amount": {amount},
    "reason": "{reason}",
    "approved_by": "{admin_id}"
  }'

# Check refund with gateway
curl -X GET "https://api.insurance.vn/internal/payment/refund-status/{refund_id}" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 5. Sự cố Claims

### 5.1. Không thể submit claim

**Triệu chứng**: User báo lỗi khi nộp yêu cầu bồi thường

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| File upload failed | Check file size/type | Hướng dẫn resize/convert |
| Policy expired/inactive | Check policy status | Thông báo user |
| Claims service error | Check service logs | Restart/fix |
| Duplicate claim | Check existing claims | Thông báo claim đã tồn tại |
| Missing required fields | Check validation errors | Hướng dẫn bổ sung |

```bash
# Check policy eligibility for claim
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT id, status, start_date, end_date, product_type
   FROM policies WHERE id = '{policy_id}' AND status = 'active';"

# Check claims service errors
kubectl logs -l app=claims-service -n production --since=30m | \
  grep -i "error" | grep "{user_id}"

# Check file upload issues
kubectl logs -l app=claims-service -n production --since=30m | \
  grep "upload" | grep -i "error\|failed"
```

### 5.2. Claim bị kẹt ở trạng thái processing

**Triệu chứng**: Claim status không thay đổi sau thời gian dài

```bash
# Find stuck claims
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT id, status, assigned_to, updated_at,
   NOW() - updated_at as stuck_duration
   FROM claims 
   WHERE status IN ('submitted', 'reviewing', 'assessing')
   AND updated_at < NOW() - INTERVAL '48 hours'
   ORDER BY updated_at ASC;"

# Check assigned handler workload
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT assigned_to, count(*) as open_claims
   FROM claims WHERE status NOT IN ('approved', 'rejected', 'closed')
   GROUP BY assigned_to ORDER BY open_claims DESC;"

# Reassign stuck claims
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "UPDATE claims SET assigned_to = '{new_handler_id}', 
   updated_at = NOW(), notes = notes || '\nReassigned due to SLA breach'
   WHERE id = '{claim_id}';"

# Send SLA breach alert
curl -X POST "https://api.insurance.vn/internal/claims/sla-alert" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"claim_ids": ["{claim_id}"]}'
```

---

## 6. Sự cố Policy Management

### 6.1. Policy renewal failed

**Triệu chứng**: Auto-renewal không thực hiện được

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Payment method expired | Check card expiry | Notify user to update |
| Insufficient funds | Check payment error | Retry after 24h |
| Insurer declined renewal | Check insurer response | Manual review |
| Renewal job failed | Check cron logs | Re-run job |
| Policy conditions changed | Check underwriting | New application needed |

```bash
# Check failed renewals
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT p.id, p.policy_number, p.end_date, r.status, r.error_message
   FROM policies p
   JOIN renewal_attempts r ON p.id = r.policy_id
   WHERE r.status = 'failed' AND p.end_date < NOW() + INTERVAL '7 days'
   ORDER BY p.end_date ASC;"

# Check renewal cron job status
kubectl get cronjobs -n production | grep renewal
kubectl get jobs -n production | grep renewal | tail -5

# Manual renewal trigger
curl -X POST "https://api.insurance.vn/internal/policy/{policy_id}/renew" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 6.2. Policy document không tải được

```bash
# Check S3 object existence
aws s3 ls s3://insurance-documents/policies/{policy_id}/

# Check PDF generation logs
kubectl logs -l app=policy-service -n production --since=1h | \
  grep "pdf" | grep "{policy_id}"

# Regenerate policy document
curl -X POST "https://api.insurance.vn/internal/policy/{policy_id}/regenerate-pdf" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check S3 permissions
aws s3api get-object-acl \
  --bucket insurance-documents \
  --key "policies/{policy_id}/policy.pdf"
```

---

## 7. Sự cố Performance

### 7.1. Website chậm / timeout

**Diagnostic Steps:**

```bash
# Step 1: Check overall system health
curl -s https://api.insurance.vn/health/deep | jq .

# Step 2: Identify bottleneck layer
# Check API latency
kubectl top pods -n production --sort-by=cpu | head -10

# Step 3: Check database
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT count(*) as active_queries, 
   max(NOW() - query_start) as longest_query
   FROM pg_stat_activity WHERE state = 'active';"

# Step 4: Check Redis
redis-cli -h $REDIS_HOST INFO stats | grep -E "keyspace_hits|keyspace_misses"

# Step 5: Check external API latency
kubectl logs -l app=api-gateway -n production --since=5m | \
  grep "upstream_response_time" | awk '{print $NF}' | sort -n | tail -10

# Step 6: Check for resource saturation
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### 7.2. Specific Endpoint Slow

```bash
# Find slow endpoints (from access logs)
kubectl logs -l app=api-gateway -n production --since=30m | \
  awk '{if($NF > 2000) print $0}' | head -20

# Check specific endpoint
curl -w "\nTotal: %{time_total}s\nConnect: %{time_connect}s\nTTFB: %{time_starttransfer}s\n" \
  -s -o /dev/null https://api.insurance.vn/{endpoint}

# Check if query is the bottleneck
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT query, calls, mean_exec_time, total_exec_time
   FROM pg_stat_statements 
   WHERE query LIKE '%{table_name}%'
   ORDER BY mean_exec_time DESC LIMIT 5;"

# Check query plan
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) {slow_query};"
```

---

## 8. Sự cố Notification

### 8.1. Email không gửi được

| Nguyên nhân | Kiểm tra | Giải pháp |
|-------------|----------|-----------|
| Email provider down | Check provider status | Switch to backup (SES) |
| Rate limit exceeded | Check send count | Wait / increase limit |
| Email bounced | Check bounce list | Remove from list |
| Template error | Check template rendering | Fix template |
| Queue backlog | Check SQS depth | Scale consumers |

```bash
# Check notification service
kubectl logs -l app=notification-service -n production --since=30m | \
  grep -i "email" | grep -i "error\|failed\|bounce"

# Check email delivery status
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT status, count(*) FROM notifications
   WHERE channel = 'email' AND created_at > NOW() - INTERVAL '1 hour'
   GROUP BY status;"

# Resend failed notifications
curl -X POST "https://api.insurance.vn/internal/notifications/retry" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"notification_ids": ["{id1}", "{id2}"]}'
```

### 8.2. SMS không gửi được

```bash
# Check SMS provider balance/status
kubectl logs -l app=notification-service -n production --since=30m | \
  grep -i "sms" | grep -i "error"

# Check SMS delivery rate
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT status, count(*) FROM notifications
   WHERE channel = 'sms' AND created_at > NOW() - INTERVAL '1 hour'
   GROUP BY status;"

# Switch SMS provider
kubectl set env deployment/notification-service -n production SMS_PROVIDER=backup_provider
kubectl rollout restart deployment/notification-service -n production
```

---

## 9. Sự cố Infrastructure

### 9.1. Disk Space Full

```bash
# Check disk usage across nodes
kubectl exec -it {pod} -n production -- df -h

# Find large files/directories
kubectl exec -it {pod} -n production -- du -sh /var/log/* | sort -rh | head -10

# Quick cleanup: old logs
kubectl exec -it {pod} -n production -- find /var/log -name "*.log" -mtime +7 -delete

# Check PVC usage
kubectl get pvc -n production
kubectl exec -it {pod} -n production -- df -h /data

# Expand EBS volume (if needed)
aws ec2 modify-volume --volume-id {vol-id} --size {new_size_gb}
```

### 9.2. High Memory Usage / OOM

```bash
# Check which pods are using most memory
kubectl top pods -n production --sort-by=memory | head -10

# Check for memory leaks (growing over time)
# Compare with historical: Grafana memory dashboard

# Check OOMKilled events
kubectl get events -n production | grep OOM

# Increase memory limit (temporary)
kubectl patch deployment {service} -n production -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"{container}","resources":{"limits":{"memory":"2Gi"}}}]}}}}'

# Long-term: investigate memory leak
kubectl exec -it {pod} -n production -- node --inspect=0.0.0.0:9229
# Connect with Chrome DevTools for heap snapshot
```

---

## 10. Quick Diagnostic Commands

### 10.1. System Health Check (1 minute)

```bash
#!/bin/bash
echo "=== System Health Check ==="
echo ""
echo "--- Services ---"
kubectl get pods -n production | grep -v Running | grep -v Completed
echo ""
echo "--- Resource Usage ---"
kubectl top nodes
echo ""
echo "--- Recent Events ---"
kubectl get events -n production --sort-by='.lastTimestamp' | tail -10
echo ""
echo "--- API Health ---"
curl -s https://api.insurance.vn/health | jq .
echo ""
echo "--- Error Rate (last 5m) ---"
kubectl logs -l app=api-gateway -n production --since=5m | grep -c "5[0-9][0-9]"
echo ""
echo "--- DB Connections ---"
psql -h $DB_HOST -U $DB_USER -d insurance_prod -c \
  "SELECT count(*) FROM pg_stat_activity;"
```

### 10.2. Escalation Guide

| Level | When to Escalate | To Whom | Method |
|-------|-----------------|---------|--------|
| L1 → L2 | Cannot resolve in 15 min | Senior Engineer | Slack + mention |
| L2 → L3 | Service impact > 30 min | DevOps Lead | Phone + Slack |
| L3 → Management | P1 incident > 1 hour | CTO | Phone call |
| Any → Security | Suspected breach | Security Lead | Phone + immediate |

---

## 11. Phê duyệt

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |
| Support Lead | | | |
| Engineering Manager | | | |
