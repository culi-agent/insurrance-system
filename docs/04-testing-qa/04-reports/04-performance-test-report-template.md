# Performance Test Report Template - Mẫu Báo Cáo Kiểm Thử Hiệu Năng

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
| Environment | Staging (production-equivalent) |
| Tool | K6 / Artillery / Lighthouse |
| Duration | [Total test duration] |
| Executed By | [Performance Engineer] |
| Status | ☐ Pass / ☐ Fail / ☐ Conditional |

---

## 2. Test Infrastructure

### 2.1. System Under Test (SUT)

| Component | Specification |
|-----------|--------------|
| Application Servers | [Instance type × count] |
| Database | [PostgreSQL - instance type, replicas] |
| Cache | [Redis - instance type, cluster] |
| Load Balancer | [Type, algorithm] |
| CDN | [CloudFront configuration] |
| Auto-scaling | [Min/Max instances, triggers] |

### 2.2. Load Generator

| Setting | Value |
|---------|-------|
| Tool | K6 v0.47+ |
| Generator Location | [Region - same as SUT] |
| Generator Instances | [Count × spec] |
| Network | [Bandwidth] |

---

## 3. Test Scenarios & Results

### 3.1. Load Test - Normal Traffic (5,000 users)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Virtual Users | 5,000 concurrent | --- | - |
| Duration | 30 minutes | --- | - |
| Total Requests | - | --- | - |
| Avg Response Time | < 300ms | ---ms | ☐ Pass / ☐ Fail |
| P95 Response Time | < 500ms | ---ms | ☐ Pass / ☐ Fail |
| P99 Response Time | < 1000ms | ---ms | ☐ Pass / ☐ Fail |
| Throughput (req/s) | ≥ 500 | --- | ☐ Pass / ☐ Fail |
| Error Rate | < 0.1% | ---% | ☐ Pass / ☐ Fail |
| CPU Usage (avg) | < 60% | ---% | ☐ Pass / ☐ Fail |
| Memory Usage (avg) | < 70% | ---% | ☐ Pass / ☐ Fail |

### 3.2. Load Test - Peak Traffic (10,000 users)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Virtual Users | 10,000 concurrent | --- | - |
| Duration | 15 minutes | --- | - |
| Total Requests | - | --- | - |
| Avg Response Time | < 500ms | ---ms | ☐ Pass / ☐ Fail |
| P95 Response Time | < 1000ms | ---ms | ☐ Pass / ☐ Fail |
| P99 Response Time | < 2000ms | ---ms | ☐ Pass / ☐ Fail |
| Throughput (req/s) | ≥ 1,000 | --- | ☐ Pass / ☐ Fail |
| Error Rate | < 1% | ---% | ☐ Pass / ☐ Fail |
| CPU Usage (peak) | < 85% | ---% | ☐ Pass / ☐ Fail |
| Memory Usage (peak) | < 85% | ---% | ☐ Pass / ☐ Fail |
| Auto-scale triggered | Yes | ☐ Yes / ☐ No | ☐ Pass / ☐ Fail |

### 3.3. Stress Test (Ramp to Breaking Point)

| Metric | Result |
|--------|--------|
| Breaking Point | --- concurrent users |
| Max Throughput | --- req/s |
| First Error At | --- users |
| Error Rate at Break | ---% |
| Recovery Time | --- seconds |
| Degradation Pattern | Gradual / Sudden |

**Ramp Profile:**
```
Users: 0 → 5K → 10K → 15K → 20K → [breaking point]
Time:  0    5m    10m    15m    20m    25m
```

### 3.4. Endurance (Soak) Test

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Virtual Users | 5,000 | --- | - |
| Duration | 4 hours | --- | - |
| Memory at Start | - | ---MB | - |
| Memory at End | - | ---MB | - |
| Memory Leak | No increase > 10% | ---% | ☐ Pass / ☐ Fail |
| Response Time Degradation | < 10% increase | ---% | ☐ Pass / ☐ Fail |
| Error Rate Over Time | Stable | ---% | ☐ Pass / ☐ Fail |
| DB Connection Pool | Stable | ---/--- | ☐ Pass / ☐ Fail |

### 3.5. Spike Test

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Spike From | 1,000 users | --- | - |
| Spike To | 15,000 users | --- | - |
| Spike Duration | 60 seconds | --- | - |
| Recovery Time | < 30 seconds | ---s | ☐ Pass / ☐ Fail |
| Errors During Spike | < 5% | ---% | ☐ Pass / ☐ Fail |
| Auto-scale Response | < 2 min | ---s | ☐ Pass / ☐ Fail |

---

## 4. API Endpoint Performance

### 4.1. Response Time by Endpoint

| Endpoint | Method | P50 | P90 | P95 | P99 | Target | Status |
|----------|--------|-----|-----|-----|-----|--------|--------|
| /api/auth/login | POST | ---ms | ---ms | ---ms | ---ms | < 200ms | ☐ |
| /api/auth/register | POST | ---ms | ---ms | ---ms | ---ms | < 500ms | ☐ |
| /api/products | GET | ---ms | ---ms | ---ms | ---ms | < 200ms | ☐ |
| /api/products/:id | GET | ---ms | ---ms | ---ms | ---ms | < 200ms | ☐ |
| /api/quotes/motor | POST | ---ms | ---ms | ---ms | ---ms | < 3000ms | ☐ |
| /api/quotes/health | POST | ---ms | ---ms | ---ms | ---ms | < 3000ms | ☐ |
| /api/purchases | POST | ---ms | ---ms | ---ms | ---ms | < 1000ms | ☐ |
| /api/claims | POST | ---ms | ---ms | ---ms | ---ms | < 500ms | ☐ |
| /api/claims/:id | GET | ---ms | ---ms | ---ms | ---ms | < 200ms | ☐ |
| /api/payments/init | POST | ---ms | ---ms | ---ms | ---ms | < 2000ms | ☐ |
| /api/policies | GET | ---ms | ---ms | ---ms | ---ms | < 200ms | ☐ |
| /api/admin/dashboard | GET | ---ms | ---ms | ---ms | ---ms | < 500ms | ☐ |

### 4.2. Slowest Endpoints (Top 5)

| # | Endpoint | P95 | Root Cause | Recommendation |
|---|----------|-----|-----------|----------------|
| 1 | | ---ms | | |
| 2 | | ---ms | | |
| 3 | | ---ms | | |
| 4 | | ---ms | | |
| 5 | | ---ms | | |

---

## 5. Frontend Performance (Lighthouse)

### 5.1. Core Web Vitals

| Page | LCP | FID | CLS | FCP | TTI | Score |
|------|-----|-----|-----|-----|-----|-------|
| Homepage | ---s | ---ms | --- | ---s | ---s | --- |
| Product Listing | ---s | ---ms | --- | ---s | ---s | --- |
| Product Detail | ---s | ---ms | --- | ---s | ---s | --- |
| Quote Form | ---s | ---ms | --- | ---s | ---s | --- |
| Quote Results | ---s | ---ms | --- | ---s | ---s | --- |
| Purchase Form | ---s | ---ms | --- | ---s | ---s | --- |
| Dashboard | ---s | ---ms | --- | ---s | ---s | --- |
| Claims Form | ---s | ---ms | --- | ---s | ---s | --- |
| Admin Dashboard | ---s | ---ms | --- | ---s | ---s | --- |

**Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.5s
- TTI (Time to Interactive): < 3.5s

### 5.2. Bundle Size

| Asset | Size (gzipped) | Target | Status |
|-------|---------------|--------|--------|
| Main JS bundle | ---KB | < 200KB | ☐ |
| Vendor bundle | ---KB | < 300KB | ☐ |
| CSS bundle | ---KB | < 50KB | ☐ |
| Total initial load | ---KB | < 500KB | ☐ |

---

## 6. Database Performance

### 6.1. Query Performance

| Query/Operation | Avg Time | P95 | Target | Status |
|-----------------|----------|-----|--------|--------|
| User lookup (by email) | ---ms | ---ms | < 10ms | ☐ |
| Product listing (with filters) | ---ms | ---ms | < 50ms | ☐ |
| Quote calculation | ---ms | ---ms | < 100ms | ☐ |
| Policy creation | ---ms | ---ms | < 50ms | ☐ |
| Claims listing (admin) | ---ms | ---ms | < 50ms | ☐ |
| Dashboard aggregation | ---ms | ---ms | < 200ms | ☐ |
| Report generation | ---ms | ---ms | < 1000ms | ☐ |

### 6.2. Database Metrics Under Load

| Metric | Normal | Peak Load | Limit |
|--------|--------|-----------|-------|
| Active Connections | --- | --- | --- (pool max) |
| Queries/sec | --- | --- | - |
| Avg Query Time | ---ms | ---ms | < 50ms |
| Slow Queries (>200ms) | --- | --- | 0 |
| Cache Hit Ratio | ---% | ---% | > 90% |
| Disk I/O | --- | --- | - |

---

## 7. Resource Utilization

### 7.1. Server Resources (Under Peak Load)

| Server | CPU Avg | CPU Peak | RAM Avg | RAM Peak | Network |
|--------|---------|----------|---------|----------|---------|
| App Server 1 | ---% | ---% | ---% | ---% | ---Mbps |
| App Server 2 | ---% | ---% | ---% | ---% | ---Mbps |
| DB Primary | ---% | ---% | ---% | ---% | ---Mbps |
| DB Replica | ---% | ---% | ---% | ---% | ---Mbps |
| Redis | ---% | ---% | ---% | ---% | ---Mbps |

### 7.2. Auto-Scaling Behavior

| Event | Trigger | Time to Scale | New Instances | Recovery |
|-------|---------|---------------|---------------|----------|
| Scale Up | CPU > 70% | ---s | --- | ---s |
| Scale Down | CPU < 30% | ---s | --- | - |

---

## 8. Bottlenecks & Issues Found

### 8.1. Identified Bottlenecks

| # | Component | Issue | Impact | Severity | Recommendation |
|---|-----------|-------|--------|----------|----------------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

### 8.2. Performance Comparison with Previous Build

| Metric | Previous | Current | Delta | Acceptable |
|--------|----------|---------|-------|-----------|
| Avg Response Time | ---ms | ---ms | +/- ---ms | ☐ |
| P95 Response Time | ---ms | ---ms | +/- ---ms | ☐ |
| Throughput | --- req/s | --- req/s | +/- --- | ☐ |
| Error Rate | ---% | ---% | +/- ---% | ☐ |

---

## 9. Recommendations

### 9.1. Immediate Actions (Before Release)

| # | Recommendation | Priority | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | | P1 | | |
| 2 | | P1 | | |

### 9.2. Short-term Improvements

| # | Recommendation | Priority | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | | P2 | | |
| 2 | | P2 | | |

### 9.3. Long-term Optimizations

| # | Recommendation | Priority | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | | P3 | | |
| 2 | | P3 | | |

---

## 10. Conclusion

**Overall Performance Status:** ☐ Meets Requirements / ☐ Partially Meets / ☐ Does Not Meet

**Summary:**
```
[Key findings and conclusion]
```

**Sign-Off:**

| Role | Name | Date |
|------|------|------|
| Performance Engineer | | |
| Tech Lead | | |
| QA Lead | | |
