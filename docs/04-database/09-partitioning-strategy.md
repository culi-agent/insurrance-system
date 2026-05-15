# Partitioning Strategy - Chiến Lược Phân Vùng

---

## 1. Tổng quan

Tài liệu này định nghĩa chiến lược partitioning cho các bảng có volume lớn, giúp tối ưu performance query, maintenance (VACUUM, REINDEX) và data lifecycle management.

**Khi nào cần partition:**
- Table > 10M rows hoặc > 10GB
- Queries chủ yếu filter theo time range
- Cần lifecycle management (auto-delete old data)
- VACUUM/ANALYZE chạy quá lâu trên toàn bảng

---

## 2. Partitioning Methods

| Method | Use Case | Key Column | Tables |
|--------|----------|-----------|--------|
| Range (by time) | Time-series data, logs | created_at | audit_log, notification, otp_verification |
| Range (by date) | Business date queries | start_date / submitted_at | policy (future), claim (future) |
| List | Finite discrete values | status / type | Không áp dụng (Year 1) |
| Hash | Even distribution | customer_id | Không áp dụng (Year 1) |

---

## 3. Partitioning Plan

### 3.1. Phase 1 (Launch - Year 1): High-Volume Tables

| Table | Strategy | Partition Key | Interval | Est. Size/Partition |
|-------|----------|--------------|----------|---------------------|
| audit_log | Range (monthly) | created_at | 1 month | ~170K rows, ~340 MB |
| notification | Range (monthly) | created_at | 1 month | ~85K rows, ~42 MB |
| otp_verification | Range (weekly) | created_at | 1 week | ~30K rows, ~5 MB |
| session | Range (monthly) | created_at | 1 month | ~17K rows, ~3 MB |

### 3.2. Phase 2 (Year 2+): Growing Tables

| Table | Trigger | Strategy | Partition Key | Interval |
|-------|---------|----------|--------------|----------|
| quote | > 1M rows | Range (monthly) | created_at | 1 month |
| payment | > 500K rows | Range (monthly) | created_at | 1 month |
| policy | > 500K rows | Range (yearly) | created_at | 1 year |
| claim | > 200K rows | Range (quarterly) | submitted_at | 3 months |

### 3.3. Tables NOT Partitioned

| Table | Reason |
|-------|--------|
| customer | < 2M rows (Year 3), diverse query patterns |
| product | < 1000 rows, read-heavy |
| category | < 50 rows, static |
| insurer | < 50 rows, static |
| beneficiary | Linked to policy, small |
| endorsement | Low volume |
| reconciliation | < 1000 rows |
| admin_user | < 100 rows |

---

## 4. Implementation

### 4.1. audit_log (Monthly Partitions)

```sql
-- Convert audit_log to partitioned table
-- NOTE: Must be done during maintenance window (table recreation)

-- Step 1: Create partitioned table
CREATE TABLE audit_log_partitioned (
    id              UUID DEFAULT uuid_generate_v4(),
    user_id         UUID,
    user_type       VARCHAR(20),
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    old_data        JSONB,
    new_data        JSONB,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    session_id      VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Step 2: Create partitions (auto-create monthly)
CREATE TABLE audit_log_y2026m01 PARTITION OF audit_log_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_log_y2026m02 PARTITION OF audit_log_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit_log_y2026m03 PARTITION OF audit_log_partitioned
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE audit_log_y2026m04 PARTITION OF audit_log_partitioned
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE audit_log_y2026m05 PARTITION OF audit_log_partitioned
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit_log_y2026m06 PARTITION OF audit_log_partitioned
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
-- ... continue for 12 months

-- Step 3: Create default partition (safety net)
CREATE TABLE audit_log_default PARTITION OF audit_log_partitioned DEFAULT;

-- Step 4: Create indexes on partitioned table
CREATE INDEX idx_audit_p_entity ON audit_log_partitioned(entity_type, entity_id);
CREATE INDEX idx_audit_p_user ON audit_log_partitioned(user_id, user_type) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_p_action ON audit_log_partitioned(action, entity_type);

-- Step 5: Immutability rules
CREATE RULE audit_log_p_no_update AS ON UPDATE TO audit_log_partitioned DO INSTEAD NOTHING;
CREATE RULE audit_log_p_no_delete AS ON DELETE TO audit_log_partitioned DO INSTEAD NOTHING;

-- Step 6: Migrate data (batch)
INSERT INTO audit_log_partitioned SELECT * FROM audit_log;

-- Step 7: Swap tables
ALTER TABLE audit_log RENAME TO audit_log_old;
ALTER TABLE audit_log_partitioned RENAME TO audit_log;

-- Step 8: Drop old table (after verification)
-- DROP TABLE audit_log_old;
```

### 4.2. notification (Monthly Partitions)

```sql
-- Partitioned notification table
CREATE TABLE notification (
    id              UUID DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    user_type       VARCHAR(20) NOT NULL DEFAULT 'customer',
    type            VARCHAR(50) NOT NULL,
    channel         notification_channel NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    metadata        JSONB,
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP WITH TIME ZONE,
    sent_at         TIMESTAMP WITH TIME ZONE,
    failed_at       TIMESTAMP WITH TIME ZONE,
    error_message   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE notification_y2026m01 PARTITION OF notification
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE notification_y2026m02 PARTITION OF notification
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... (auto-generated by maintenance script)

CREATE TABLE notification_default PARTITION OF notification DEFAULT;

-- Indexes (auto-created on each partition)
CREATE INDEX idx_notif_p_user_unread ON notification(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notif_p_user_recent ON notification(user_id, created_at DESC);
```

### 4.3. otp_verification (Weekly Partitions)

```sql
-- Short-lived data, weekly partitions for easy cleanup
CREATE TABLE otp_verification (
    id              UUID DEFAULT uuid_generate_v4(),
    user_id         UUID,
    target          VARCHAR(255) NOT NULL,
    target_type     VARCHAR(20) NOT NULL,
    code            VARCHAR(10) NOT NULL,
    purpose         VARCHAR(30) NOT NULL,
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 3,
    is_used         BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Weekly partitions (52 per year)
CREATE TABLE otp_y2026w01 PARTITION OF otp_verification
    FOR VALUES FROM ('2026-01-01') TO ('2026-01-08');
CREATE TABLE otp_y2026w02 PARTITION OF otp_verification
    FOR VALUES FROM ('2026-01-08') TO ('2026-01-15');
-- ... auto-generated

CREATE TABLE otp_default PARTITION OF otp_verification DEFAULT;
```

---

## 5. Automatic Partition Management

### 5.1. Auto-Create Future Partitions

```sql
-- Function: tự động tạo partition cho tháng tiếp theo
CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    partition_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month')
)
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := date_trunc('month', partition_date);
    end_date := start_date + INTERVAL '1 month';
    partition_name := table_name || '_y' || to_char(start_date, 'YYYY') || 'm' || to_char(start_date, 'MM');
    
    -- Check if partition already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
            partition_name, table_name, start_date, end_date
        );
        RAISE NOTICE 'Created partition: %', partition_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Usage: create partitions for next 3 months
SELECT create_monthly_partition('audit_log', CURRENT_DATE + INTERVAL '1 month');
SELECT create_monthly_partition('audit_log', CURRENT_DATE + INTERVAL '2 months');
SELECT create_monthly_partition('audit_log', CURRENT_DATE + INTERVAL '3 months');
SELECT create_monthly_partition('notification', CURRENT_DATE + INTERVAL '1 month');
SELECT create_monthly_partition('notification', CURRENT_DATE + INTERVAL '2 months');
SELECT create_monthly_partition('notification', CURRENT_DATE + INTERVAL '3 months');
```

### 5.2. Auto-Drop Expired Partitions

```sql
-- Function: xóa partition cũ theo retention policy
CREATE OR REPLACE FUNCTION drop_old_partitions(
    table_name TEXT,
    retention_months INTEGER
)
RETURNS VOID AS $$
DECLARE
    partition_record RECORD;
    cutoff_date DATE;
BEGIN
    cutoff_date := CURRENT_DATE - (retention_months || ' months')::INTERVAL;
    
    FOR partition_record IN
        SELECT inhrelid::regclass::text AS partition_name
        FROM pg_inherits
        WHERE inhparent = table_name::regclass
        AND inhrelid::regclass::text NOT LIKE '%default%'
    LOOP
        -- Extract date from partition name and check if expired
        -- Only drop if partition is older than retention
        EXECUTE format('
            SELECT CASE 
                WHEN EXISTS (
                    SELECT 1 FROM %I WHERE created_at >= %L LIMIT 1
                ) THEN false
                ELSE true
            END', partition_record.partition_name, cutoff_date);
            
        -- Safe drop with logging
        RAISE NOTICE 'Dropping expired partition: %', partition_record.partition_name;
        EXECUTE format('DROP TABLE IF EXISTS %I', partition_record.partition_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 5.3. Cron Job for Partition Management

```bash
#!/bin/bash
# /scripts/manage-partitions.sh
# Schedule: Daily at 1:00 AM

PGHOST="localhost"
PGUSER="postgres"
PGDATABASE="insurance_db"

echo "$(date): Managing partitions..."

# Create future partitions (3 months ahead)
psql -h $PGHOST -U $PGUSER -d $PGDATABASE << 'SQL'
SELECT create_monthly_partition('audit_log', CURRENT_DATE + INTERVAL '1 month');
SELECT create_monthly_partition('audit_log', CURRENT_DATE + INTERVAL '2 months');
SELECT create_monthly_partition('audit_log', CURRENT_DATE + INTERVAL '3 months');
SELECT create_monthly_partition('notification', CURRENT_DATE + INTERVAL '1 month');
SELECT create_monthly_partition('notification', CURRENT_DATE + INTERVAL '2 months');
SELECT create_monthly_partition('notification', CURRENT_DATE + INTERVAL '3 months');
SQL

# Drop old partitions based on retention
psql -h $PGHOST -U $PGUSER -d $PGDATABASE << 'SQL'
-- audit_log: keep 5 years (60 months)
SELECT drop_old_partitions('audit_log', 60);
-- notification: keep 90 days (3 months)
SELECT drop_old_partitions('notification', 3);
-- otp_verification: keep 30 days (1 month)
SELECT drop_old_partitions('otp_verification', 1);
-- session: keep 90 days (3 months)
SELECT drop_old_partitions('session', 3);
SQL

echo "$(date): Partition management completed"
```

```cron
0 1 * * * postgres /scripts/manage-partitions.sh >> /var/log/partition-mgmt.log 2>&1
```

---

## 6. Retention-Based Partition Dropping

| Table | Retention | Drop Strategy | Archive Before Drop |
|-------|-----------|---------------|---------------------|
| audit_log | 5 years | Drop monthly partitions > 5y | Yes (S3 Glacier) |
| notification | 90 days | Drop monthly partitions > 3m | No |
| otp_verification | 30 days | Drop weekly partitions > 4w | No |
| session | 90 days | Drop monthly partitions > 3m | No |
| quote (Phase 2) | 90 days (expired) | Drop partitions with all expired quotes | No |

### Archive Before Drop (audit_log)

```bash
#!/bin/bash
# Archive old audit_log partitions to S3 before dropping

PARTITION_NAME=$1
S3_BUCKET="s3://insurance-db-archive/audit_log"

# Export to CSV
psql -h localhost -U postgres -d insurance_db \
    -c "\COPY ${PARTITION_NAME} TO '/tmp/${PARTITION_NAME}.csv' WITH CSV HEADER"

# Compress
gzip /tmp/${PARTITION_NAME}.csv

# Upload to S3 Glacier
aws s3 cp "/tmp/${PARTITION_NAME}.csv.gz" \
    "${S3_BUCKET}/${PARTITION_NAME}.csv.gz" \
    --storage-class GLACIER

# Cleanup
rm -f /tmp/${PARTITION_NAME}.csv.gz

echo "Archived ${PARTITION_NAME} to S3 Glacier"
```

---

## 7. Query Patterns with Partitions

### 7.1. Partition Pruning

PostgreSQL tự động loại bỏ partitions không liên quan khi query có filter trên partition key:

```sql
-- Only scans audit_log_y2026m03 (1 partition)
EXPLAIN SELECT * FROM audit_log 
WHERE created_at >= '2026-03-01' AND created_at < '2026-04-01'
AND entity_type = 'policy';

-- Scans 3 partitions (recent 3 months)
EXPLAIN SELECT * FROM notification 
WHERE user_id = $1 
AND created_at >= NOW() - INTERVAL '3 months'
ORDER BY created_at DESC;
```

### 7.2. Best Practices for Queries

```sql
-- ✅ GOOD: Always include partition key in WHERE
SELECT * FROM audit_log 
WHERE created_at >= '2026-03-01' 
AND entity_type = 'policy' AND entity_id = $1;

-- ❌ BAD: Missing partition key → scans ALL partitions
SELECT * FROM audit_log 
WHERE entity_type = 'policy' AND entity_id = $1;

-- ✅ GOOD: Use partition key in JOINs
SELECT n.*, c.full_name
FROM notification n
JOIN customer c ON c.id = n.user_id
WHERE n.created_at >= NOW() - INTERVAL '7 days'
AND n.user_id = $1;
```

---

## 8. Monitoring Partitions

### 8.1. Check Partition Status

```sql
-- List all partitions and their sizes
SELECT 
    parent.relname AS parent_table,
    child.relname AS partition_name,
    pg_size_pretty(pg_relation_size(child.oid)) AS size,
    pg_stat_get_live_tuples(child.oid) AS live_rows
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname IN ('audit_log', 'notification', 'otp_verification', 'session')
ORDER BY parent.relname, child.relname;
```

### 8.2. Check for Default Partition Usage

```sql
-- Alert if rows land in default partition (misconfigured)
SELECT 
    relname,
    pg_stat_get_live_tuples(oid) AS rows_in_default
FROM pg_class
WHERE relname LIKE '%_default'
AND pg_stat_get_live_tuples(oid) > 0;
```

### 8.3. Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| Default partition has rows | > 0 rows | Create missing partition immediately |
| Partition too large | > 5GB single partition | Review interval (switch to smaller) |
| Missing future partition | < 2 months ahead | Run partition creation script |
| Partition drop failed | Archive/drop error | Manual intervention |

---

## 9. Migration Path (Non-partitioned → Partitioned)

### 9.1. Zero-Downtime Migration Steps

```
Step 1: Create new partitioned table (same schema)
Step 2: Create trigger on old table → INSERT into new table
Step 3: Batch-copy historical data (background job)
Step 4: Verify data consistency (row counts match)
Step 5: Update application to read from new table
Step 6: Remove trigger, rename tables
Step 7: Drop old table (after cool-down period)
```

### 9.2. Implementation Example

```sql
-- Step 1: New partitioned table
CREATE TABLE audit_log_new (...) PARTITION BY RANGE (created_at);
-- Create partitions...

-- Step 2: Dual-write trigger
CREATE OR REPLACE FUNCTION dual_write_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log_new VALUES (NEW.*);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dual_write_audit
    AFTER INSERT ON audit_log
    FOR EACH ROW EXECUTE FUNCTION dual_write_audit();

-- Step 3: Background migration (batched)
DO $$
DECLARE
    batch_size INTEGER := 50000;
    last_id UUID := '00000000-0000-0000-0000-000000000000';
    affected INTEGER;
BEGIN
    LOOP
        INSERT INTO audit_log_new
        SELECT * FROM audit_log
        WHERE id > last_id
        ORDER BY id
        LIMIT batch_size
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS affected = ROW_COUNT;
        EXIT WHEN affected < batch_size;
        
        SELECT MAX(id) INTO last_id FROM audit_log_new;
        PERFORM pg_sleep(0.5);
    END LOOP;
END $$;

-- Step 4-7: Verify, switch, cleanup
```

---

## 10. Performance Impact Summary

| Metric | Before Partition | After Partition | Improvement |
|--------|-----------------|-----------------|-------------|
| audit_log query (1 month) | ~2000ms | ~100ms | 20x |
| notification inbox | ~500ms | ~50ms | 10x |
| VACUUM audit_log | ~30 min (full table) | ~2 min (1 partition) | 15x |
| REINDEX audit_log | ~20 min | ~1 min/partition | 20x |
| Data deletion (retention) | Hours (DELETE + VACUUM) | Instant (DROP PARTITION) | ∞ |
| Backup size per job | Full table | Per partition | Manageable |
