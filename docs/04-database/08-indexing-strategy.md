# Indexing Strategy - Chiến Lược Đánh Index

---

## 1. Tổng quan

Tài liệu này định nghĩa chiến lược indexing cho database, bao gồm các loại index, quy tắc đánh index, và kế hoạch tối ưu performance.

**Target:** Database query time < 50ms (P95) theo NFR requirements.

---

## 2. Index Types trong PostgreSQL

| Type | Use Case | Example |
|------|----------|---------|
| B-tree (default) | Equality, range queries, sorting | `WHERE status = 'active'` |
| Hash | Equality only (ít dùng) | `WHERE id = $1` |
| GIN | JSONB, full-text search, arrays | `WHERE benefits @> '{}'` |
| GiST | Geometric, full-text, range types | Geolocation queries |
| BRIN | Large tables with natural ordering | `WHERE created_at > $1` |
| Partial | Subset of rows | `WHERE status = 'active'` index only active |
| Covering | Include extra columns | Avoid heap lookup |
| Composite | Multi-column queries | `WHERE customer_id = $1 AND status = $2` |

---

## 3. Index Plan by Table

### 3.1. customer

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `pk_customer` | id | B-tree (PK) | Primary key lookup | `findById()` |
| `uq_customer_email` | email | B-tree (UNIQUE) | Login, uniqueness | `WHERE email = $1` |
| `uq_customer_phone` | phone | B-tree (UNIQUE) | Login, uniqueness | `WHERE phone = $1` |
| `idx_customer_status` | status | B-tree | Filter by status | `WHERE status = 'active'` |
| `idx_customer_kyc` | kyc_status | B-tree | KYC queue | `WHERE kyc_status = 'pending'` |
| `idx_customer_created` | created_at | B-tree | Sorting, reporting | `ORDER BY created_at DESC` |
| `idx_customer_active` | id | B-tree (Partial) | Active customers only | `WHERE deleted_at IS NULL` |
| `idx_customer_name_trgm` | full_name | GIN (pg_trgm) | Fuzzy search | `WHERE full_name ILIKE '%minh%'` |
| `idx_customer_id_number` | id_number | B-tree | KYC lookup | `WHERE id_number = $1` |

```sql
-- Primary & Unique (auto-created)
-- Already created via table definition

-- Performance indexes
CREATE INDEX idx_customer_status ON customer(status);
CREATE INDEX idx_customer_kyc ON customer(kyc_status);
CREATE INDEX idx_customer_created ON customer(created_at DESC);
CREATE INDEX idx_customer_active ON customer(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customer_name_trgm ON customer USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_customer_id_number ON customer(id_number) WHERE id_number IS NOT NULL;
```

---

### 3.2. product

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `pk_product` | id | B-tree (PK) | Primary key | `findById()` |
| `uq_product_slug` | slug | B-tree (UNIQUE) | URL lookup | `WHERE slug = $1` |
| `idx_product_category` | category_id | B-tree | Category listing | `WHERE category_id = $1` |
| `idx_product_insurer` | insurer_id | B-tree | Partner products | `WHERE insurer_id = $1` |
| `idx_product_status` | status | B-tree | Active products | `WHERE status = 'active'` |
| `idx_product_active_listing` | (category_id, status, sort_order) | B-tree (Composite) | Catalog page | Combined filter + sort |
| `idx_product_benefits` | benefits | GIN | Benefit search | `WHERE benefits @> '[{"name":"..."}]'` |
| `idx_product_search` | (name, short_description) | GIN (trgm) | Full-text search | `ILIKE '%keyword%'` |

```sql
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_insurer ON product(insurer_id);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_active_listing ON product(category_id, sort_order) WHERE status = 'active';
CREATE INDEX idx_product_benefits ON product USING gin(benefits);
CREATE INDEX idx_product_search ON product USING gin(
    (name || ' ' || COALESCE(short_description, '')) gin_trgm_ops
);
```

---

### 3.3. quote

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `pk_quote` | id | B-tree (PK) | Primary key | `findById()` |
| `uq_quote_number` | quote_number | B-tree (UNIQUE) | Quote lookup | `WHERE quote_number = $1` |
| `idx_quote_customer` | customer_id | B-tree | Customer quotes | `WHERE customer_id = $1` |
| `idx_quote_product` | product_id | B-tree | Product quotes | `WHERE product_id = $1` |
| `idx_quote_active` | (customer_id, status) | B-tree (Partial) | Active quotes | `WHERE status = 'active'` |
| `idx_quote_expiry` | valid_until | B-tree | Expiry cleanup | `WHERE valid_until < NOW()` |
| `idx_quote_created` | created_at | BRIN | Time-series queries | Reporting, cleanup |

```sql
CREATE INDEX idx_quote_customer ON quote(customer_id);
CREATE INDEX idx_quote_product ON quote(product_id);
CREATE INDEX idx_quote_active ON quote(customer_id, valid_until) WHERE status = 'active';
CREATE INDEX idx_quote_expiry ON quote(valid_until) WHERE status = 'active';
CREATE INDEX idx_quote_created ON quote USING brin(created_at);
```

---

### 3.4. policy

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `pk_policy` | id | B-tree (PK) | Primary key | `findById()` |
| `uq_policy_number` | policy_number | B-tree (UNIQUE) | Policy lookup | `WHERE policy_number = $1` |
| `idx_policy_customer` | customer_id | B-tree | Customer policies | `WHERE customer_id = $1` |
| `idx_policy_customer_active` | (customer_id, status) | B-tree | Dashboard | Active policies per customer |
| `idx_policy_product` | product_id | B-tree | Product analytics | `WHERE product_id = $1` |
| `idx_policy_insurer` | insurer_id | B-tree | Partner reporting | `WHERE insurer_id = $1` |
| `idx_policy_status` | status | B-tree | Status filter | `WHERE status = 'active'` |
| `idx_policy_end_date` | end_date | B-tree | Expiry/renewal | `WHERE end_date < $1` |
| `idx_policy_due_date` | next_due_date | B-tree (Partial) | Payment reminders | Active policies with due dates |
| `idx_policy_renewal` | (auto_renewal, end_date) | B-tree (Partial) | Auto-renewal batch | Upcoming renewals |
| `idx_policy_insurer_status` | (insurer_id, status, created_at) | B-tree | Reconciliation | Partner reporting |

```sql
CREATE INDEX idx_policy_customer ON policy(customer_id);
CREATE INDEX idx_policy_customer_active ON policy(customer_id, status) WHERE status = 'active';
CREATE INDEX idx_policy_product ON policy(product_id);
CREATE INDEX idx_policy_insurer ON policy(insurer_id);
CREATE INDEX idx_policy_status ON policy(status);
CREATE INDEX idx_policy_end_date ON policy(end_date) WHERE status = 'active';
CREATE INDEX idx_policy_due_date ON policy(next_due_date) WHERE status = 'active' AND next_due_date IS NOT NULL;
CREATE INDEX idx_policy_renewal ON policy(end_date) WHERE status = 'active' AND auto_renewal = TRUE;
CREATE INDEX idx_policy_insurer_status ON policy(insurer_id, status, created_at DESC);
```

---

### 3.5. claim

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `pk_claim` | id | B-tree (PK) | Primary key | `findById()` |
| `uq_claim_number` | claim_number | B-tree (UNIQUE) | Claim lookup | `WHERE claim_number = $1` |
| `idx_claim_policy` | policy_id | B-tree | Policy claims | `WHERE policy_id = $1` |
| `idx_claim_customer` | customer_id | B-tree | Customer claims | `WHERE customer_id = $1` |
| `idx_claim_handler` | handler_id | B-tree | Handler queue | `WHERE handler_id = $1` |
| `idx_claim_status` | status | B-tree | Status filter | `WHERE status = 'submitted'` |
| `idx_claim_queue` | (status, priority, submitted_at) | B-tree | Claims queue | Sorted work queue |
| `idx_claim_unassigned` | (status, submitted_at) | B-tree (Partial) | Auto-assign | `WHERE handler_id IS NULL` |
| `idx_claim_sla` | (status, submitted_at) | B-tree | SLA monitoring | Time-based alerts |

```sql
CREATE INDEX idx_claim_policy ON claim(policy_id);
CREATE INDEX idx_claim_customer ON claim(customer_id);
CREATE INDEX idx_claim_handler ON claim(handler_id) WHERE handler_id IS NOT NULL;
CREATE INDEX idx_claim_status ON claim(status);
CREATE INDEX idx_claim_queue ON claim(status, priority DESC, submitted_at ASC);
CREATE INDEX idx_claim_unassigned ON claim(submitted_at) WHERE status = 'submitted' AND handler_id IS NULL;
CREATE INDEX idx_claim_sla ON claim(status, submitted_at) WHERE status NOT IN ('closed', 'settled');
```

---

### 3.6. payment

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `pk_payment` | id | B-tree (PK) | Primary key | `findById()` |
| `uq_payment_ref` | reference_number | B-tree (UNIQUE) | Idempotency check | `WHERE reference_number = $1` |
| `idx_payment_policy` | policy_id | B-tree | Policy payments | `WHERE policy_id = $1` |
| `idx_payment_customer` | customer_id | B-tree | Customer history | `WHERE customer_id = $1` |
| `idx_payment_status` | status | B-tree | Status filter | `WHERE status = 'pending'` |
| `idx_payment_gateway` | gateway_transaction_id | B-tree | Webhook lookup | Gateway callbacks |
| `idx_payment_created` | created_at | BRIN | Time-series | Reporting |
| `idx_payment_pending_expiry` | expires_at | B-tree (Partial) | Timeout cleanup | Pending payments to expire |
| `idx_payment_reconcile` | (status, paid_at) | B-tree (Partial) | Reconciliation | Monthly settlement |

```sql
CREATE INDEX idx_payment_policy ON payment(policy_id);
CREATE INDEX idx_payment_customer ON payment(customer_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_gateway ON payment(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX idx_payment_created ON payment USING brin(created_at);
CREATE INDEX idx_payment_pending_expiry ON payment(expires_at) WHERE status = 'pending';
CREATE INDEX idx_payment_reconcile ON payment(paid_at) WHERE status = 'success';
```

---

### 3.7. notification

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `idx_notif_user_unread` | (user_id, is_read) | B-tree (Partial) | Inbox unread | `WHERE user_id = $1 AND is_read = FALSE` |
| `idx_notif_user_recent` | (user_id, created_at) | B-tree | Inbox listing | `ORDER BY created_at DESC LIMIT 20` |
| `idx_notif_created` | created_at | BRIN | Cleanup, partition | Time-based queries |

```sql
CREATE INDEX idx_notif_user_unread ON notification(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_user_recent ON notification(user_id, created_at DESC);
CREATE INDEX idx_notif_created ON notification USING brin(created_at);
```

---

### 3.8. audit_log

| Index Name | Columns | Type | Purpose | Query Pattern |
|------------|---------|------|---------|---------------|
| `idx_audit_entity` | (entity_type, entity_id) | B-tree | Entity history | `WHERE entity_type = $1 AND entity_id = $2` |
| `idx_audit_user` | (user_id, user_type) | B-tree | User activity | `WHERE user_id = $1` |
| `idx_audit_created` | created_at | BRIN | Time-series | Compliance queries |
| `idx_audit_action` | (action, entity_type) | B-tree | Action analysis | Security investigation |

```sql
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id, user_type) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_created ON audit_log USING brin(created_at);
CREATE INDEX idx_audit_action ON audit_log(action, entity_type);
```

---

## 4. JSONB Indexing Strategy

### 4.1. GIN Indexes for JSONB

```sql
-- Product benefits (search by benefit name)
CREATE INDEX idx_product_benefits_gin ON product USING gin(benefits jsonb_path_ops);

-- Product pricing rules (query specific factors)
CREATE INDEX idx_product_pricing_gin ON product USING gin(pricing_rules jsonb_path_ops);

-- Claim bank account (lookup by account number)
CREATE INDEX idx_claim_bank ON claim USING gin(bank_account jsonb_path_ops);

-- Customer address (filter by city)
CREATE INDEX idx_customer_address ON customer USING gin(address jsonb_path_ops);
```

### 4.2. Expression Indexes for JSONB

```sql
-- Index specific JSONB field for common queries
CREATE INDEX idx_customer_city ON customer((address->>'city'));
CREATE INDEX idx_policy_coverage_type ON policy((coverage_details->>'type'));
```

### 4.3. Query Examples

```sql
-- Find products with specific benefit
SELECT * FROM product 
WHERE benefits @> '[{"name": "Nội trú"}]'::jsonb;

-- Find customers in HCMC
SELECT * FROM customer 
WHERE address @> '{"city": "TP. Hồ Chí Minh"}'::jsonb;

-- Find policies with specific rider
SELECT * FROM policy 
WHERE riders @> '[{"name": "Critical Illness"}]'::jsonb;
```

---

## 5. Full-Text Search Strategy

### 5.1. Product Search

```sql
-- Create text search configuration for Vietnamese
CREATE TEXT SEARCH CONFIGURATION vietnamese (COPY = simple);

-- GIN index for full-text search
CREATE INDEX idx_product_fts ON product USING gin(
    to_tsvector('simple', 
        COALESCE(name, '') || ' ' || 
        COALESCE(short_description, '') || ' ' || 
        COALESCE(description, '')
    )
);

-- Search query
SELECT *, ts_rank(
    to_tsvector('simple', name || ' ' || COALESCE(short_description, '')),
    plainto_tsquery('simple', 'sức khỏe toàn diện')
) AS rank
FROM product
WHERE to_tsvector('simple', name || ' ' || COALESCE(short_description, ''))
    @@ plainto_tsquery('simple', 'sức khỏe toàn diện')
ORDER BY rank DESC;
```

### 5.2. Trigram Search (Fuzzy Matching)

```sql
-- Enable trigram extension (already in extensions)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy search on customer name
SELECT * FROM customer
WHERE full_name % 'Nguyên Van Minh'  -- similarity search
ORDER BY similarity(full_name, 'Nguyên Van Minh') DESC
LIMIT 10;

-- Fuzzy search with ILIKE (uses GIN trgm index)
SELECT * FROM customer
WHERE full_name ILIKE '%minh%';
```

---

## 6. Index Maintenance

### 6.1. Regular Maintenance Tasks

```sql
-- Reindex bloated indexes (weekly, during low traffic)
REINDEX INDEX CONCURRENTLY idx_policy_customer;
REINDEX INDEX CONCURRENTLY idx_payment_status;

-- Check index bloat
SELECT 
    schemaname, tablename, indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find unused indexes
SELECT 
    schemaname, tablename, indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pk_%'
AND indexrelname NOT LIKE 'uq_%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 6.2. Monitoring Queries

```sql
-- Slow queries that might need indexes
SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- > 100ms
ORDER BY total_exec_time DESC
LIMIT 20;

-- Table scan ratio (should be < 10% for indexed tables)
SELECT 
    relname,
    seq_scan,
    idx_scan,
    CASE WHEN (seq_scan + idx_scan) > 0 
        THEN round(100.0 * seq_scan / (seq_scan + idx_scan), 2)
        ELSE 0
    END as seq_scan_pct
FROM pg_stat_user_tables
WHERE (seq_scan + idx_scan) > 100
ORDER BY seq_scan_pct DESC;
```

### 6.3. Maintenance Schedule

| Task | Frequency | Window | Impact |
|------|-----------|--------|--------|
| ANALYZE | Daily (auto) | - | Minimal |
| VACUUM | Daily (auto) | - | Minimal |
| VACUUM FULL | Monthly | Sunday 3-5 AM | Table lock |
| REINDEX CONCURRENTLY | Weekly | Sunday 2-3 AM | Low |
| Check unused indexes | Monthly | - | None (read-only) |
| Review slow queries | Weekly | - | None (read-only) |

---

## 7. Performance Benchmarks

### 7.1. Expected Query Performance

| Query Type | Without Index | With Index | Target |
|------------|--------------|------------|--------|
| Customer by email | ~500ms (seq scan) | < 1ms | < 5ms |
| Active policies for customer | ~200ms | < 5ms | < 10ms |
| Claims queue (paginated) | ~1000ms | < 10ms | < 50ms |
| Product catalog (filtered) | ~300ms | < 20ms | < 50ms |
| Payment by reference | ~800ms | < 1ms | < 5ms |
| Audit log by entity | ~2000ms | < 50ms | < 100ms |
| Notification inbox | ~500ms | < 10ms | < 20ms |

### 7.2. Index Size Estimates (Year 1)

| Table | Data Size | Total Index Size | Ratio |
|-------|-----------|-----------------|-------|
| customer (100K) | ~150 MB | ~80 MB | 53% |
| product (200) | ~1 MB | ~2 MB | 200% |
| quote (500K) | ~1 GB | ~400 MB | 40% |
| policy (50K) | ~150 MB | ~120 MB | 80% |
| claim (10K) | ~20 MB | ~15 MB | 75% |
| payment (100K) | ~150 MB | ~100 MB | 67% |
| notification (1M) | ~500 MB | ~200 MB | 40% |
| audit_log (2M) | ~4 GB | ~1 GB | 25% |
| **Total** | **~6.5 GB** | **~2 GB** | **31%** |
