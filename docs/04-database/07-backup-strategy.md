# Backup Strategy - Chiến Lược Sao Lưu

---

## 1. Tổng quan

Tài liệu này định nghĩa chiến lược backup và disaster recovery cho database hệ thống Insurance System Platform.

**Targets:**
- **RTO (Recovery Time Objective):** < 1 giờ
- **RPO (Recovery Point Objective):** < 5 phút
- **Backup Retention:** 30 ngày (rolling)
- **Availability:** 99.9% uptime

---

## 2. Backup Types

### 2.1. Tổng quan các loại backup

| Type | Frequency | Method | Retention | RPO | RTO |
|------|-----------|--------|-----------|-----|-----|
| Continuous WAL | Real-time | Streaming replication | 7 days | ~0 | < 5 min |
| Automated Snapshot | Every 6 hours | pg_basebackup | 30 days | 6 hours | < 30 min |
| Daily Full Backup | Daily 2:00 AM | pg_dump (logical) | 30 days | 24 hours | < 1 hour |
| Weekly Full Backup | Sunday 3:00 AM | pg_basebackup + WAL | 90 days | 7 days | < 2 hours |
| Monthly Archive | 1st of month | Full + compress | 1 year | 30 days | < 4 hours |

### 2.2. Backup Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BACKUP ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     Streaming      ┌──────────────┐
│   Primary    │ ──── Replication ──▶│   Replica    │
│   (Write)    │                     │   (Read)     │
└──────┬───────┘                     └──────────────┘
       │
       │ WAL Archiving
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  WAL Archive │     │   S3 Bucket  │     │  Cross-Region│
│  (Local NFS) │────▶│  (Primary)   │────▶│  S3 Bucket   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            │ Lifecycle Policy
                            ▼
                     ┌──────────────┐
                     │  S3 Glacier  │ (> 90 days)
                     │  (Archive)   │
                     └──────────────┘
```

---

## 3. Continuous Replication (WAL)

### 3.1. Configuration

```ini
# postgresql.conf - Primary
wal_level = replica
max_wal_senders = 5
wal_keep_size = '2GB'
archive_mode = on
archive_command = 'aws s3 cp %p s3://insurance-db-backups/wal/%f --sse AES256'
archive_timeout = 60

# Replication slots (prevent WAL deletion before replica catches up)
max_replication_slots = 5
```

```ini
# postgresql.conf - Replica
hot_standby = on
primary_conninfo = 'host=primary-db port=5432 user=replicator password=xxx'
restore_command = 'aws s3 cp s3://insurance-db-backups/wal/%f %p'
recovery_target_timeline = 'latest'
```

### 3.2. Monitoring

```sql
-- Check replication lag
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn,
    pg_wal_lsn_diff(sent_lsn, replay_lsn) AS byte_lag
FROM pg_stat_replication;

-- Alert if lag > 1MB
-- Threshold: byte_lag > 1048576
```

---

## 4. Automated Snapshots (Every 6 Hours)

### 4.1. AWS RDS Automated Backup

```bash
# AWS RDS handles this automatically when configured
# Settings:
#   Backup retention: 30 days
#   Backup window: Preferred 02:00-02:30 UTC+7
#   Multi-AZ: enabled (synchronous replica)
```

### 4.2. Self-managed (pg_basebackup)

```bash
#!/bin/bash
# /scripts/backup-snapshot.sh
# Schedule: Every 6 hours via cron

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/snapshots/${TIMESTAMP}"
S3_BUCKET="s3://insurance-db-backups/snapshots"

echo "$(date): Starting snapshot backup..."

# Create base backup
pg_basebackup \
    -h localhost \
    -U backup_user \
    -D "${BACKUP_DIR}" \
    -Ft \
    -z \
    -Xs \
    --checkpoint=fast \
    --label="snapshot_${TIMESTAMP}"

# Upload to S3
aws s3 sync "${BACKUP_DIR}" "${S3_BUCKET}/${TIMESTAMP}/" \
    --sse AES256 \
    --storage-class STANDARD_IA

# Cleanup local (keep last 4 = 24h)
find /backups/snapshots -maxdepth 1 -type d -mtime +1 -exec rm -rf {} \;

echo "$(date): Snapshot backup completed: ${TIMESTAMP}"
```

### 4.3. Cron Schedule

```cron
# /etc/cron.d/db-backup
0 2,8,14,20 * * * postgres /scripts/backup-snapshot.sh >> /var/log/backup.log 2>&1
```

---

## 5. Daily Logical Backup

### 5.1. Full Database Dump

```bash
#!/bin/bash
# /scripts/backup-daily.sh
# Schedule: Daily 2:00 AM

TIMESTAMP=$(date +%Y%m%d)
BACKUP_FILE="/backups/daily/insurance_db_${TIMESTAMP}.sql.gz"
S3_BUCKET="s3://insurance-db-backups/daily"

echo "$(date): Starting daily logical backup..."

# Logical backup with pg_dump
pg_dump \
    -h localhost \
    -U backup_user \
    -d insurance_db \
    --format=custom \
    --compress=9 \
    --verbose \
    --file="${BACKUP_FILE}"

# Verify backup integrity
pg_restore --list "${BACKUP_FILE}" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Backup verification failed!"
    # Send alert
    curl -X POST "$SLACK_WEBHOOK" -d '{"text":"❌ DB Backup verification FAILED!"}'
    exit 1
fi

# Upload to S3
aws s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/${TIMESTAMP}/" --sse AES256

# Per-table backup for critical tables
for TABLE in customer policy claim payment; do
    pg_dump -h localhost -U backup_user -d insurance_db \
        --table="${TABLE}" \
        --format=custom \
        --compress=9 \
        --file="/backups/daily/tables/${TABLE}_${TIMESTAMP}.dump"
    
    aws s3 cp "/backups/daily/tables/${TABLE}_${TIMESTAMP}.dump" \
        "${S3_BUCKET}/${TIMESTAMP}/tables/" --sse AES256
done

# Cleanup local (keep 7 days)
find /backups/daily -type f -mtime +7 -delete

echo "$(date): Daily backup completed. Size: $(du -h ${BACKUP_FILE} | cut -f1)"
```

### 5.2. Schema-Only Backup

```bash
# Backup schema separately (useful for migration verification)
pg_dump \
    -h localhost \
    -U backup_user \
    -d insurance_db \
    --schema-only \
    --file="/backups/daily/schema_${TIMESTAMP}.sql"
```

---

## 6. Disaster Recovery Procedures

### 6.1. Scenario: Primary Database Failure

```
┌─────────────────────────────────────────────────────────────┐
│              FAILOVER PROCEDURE (< 5 minutes)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: Detect failure (automated health check)              │
│          - Connection refused / timeout > 30s                 │
│          - Replication lag > 5 minutes                        │
│                                                               │
│  Step 2: Promote replica to primary                           │
│          pg_ctl promote -D /var/lib/postgresql/data           │
│          OR: AWS RDS automatic failover (Multi-AZ)            │
│                                                               │
│  Step 3: Update DNS/connection string                         │
│          - Update application config                          │
│          - Flush connection pools                             │
│                                                               │
│  Step 4: Verify data integrity                                │
│          - Run consistency checks                             │
│          - Verify latest transactions                         │
│                                                               │
│  Step 5: Create new replica from promoted primary             │
│          - Setup streaming replication                         │
│          - Verify replication lag = 0                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 6.2. Scenario: Data Corruption / Accidental Delete

```bash
#!/bin/bash
# Point-in-Time Recovery (PITR)

# Step 1: Identify the target time (before corruption)
TARGET_TIME="2026-03-15 14:30:00+07"

# Step 2: Stop the corrupted instance
pg_ctl stop -D /var/lib/postgresql/data

# Step 3: Restore base backup
LATEST_BACKUP=$(aws s3 ls s3://insurance-db-backups/snapshots/ | sort | tail -1 | awk '{print $2}')
aws s3 sync "s3://insurance-db-backups/snapshots/${LATEST_BACKUP}" /var/lib/postgresql/data/

# Step 4: Configure recovery
cat > /var/lib/postgresql/data/recovery.signal << EOF
EOF

cat >> /var/lib/postgresql/data/postgresql.conf << EOF
restore_command = 'aws s3 cp s3://insurance-db-backups/wal/%f %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# Step 5: Start PostgreSQL (will replay WAL to target time)
pg_ctl start -D /var/lib/postgresql/data

# Step 6: Verify
psql -c "SELECT pg_is_in_recovery();" # Should be false after promotion
psql -c "SELECT MAX(created_at) FROM policy;" # Verify data timeline
```

### 6.3. Scenario: Complete Region Failure

| Step | Action | Duration | Responsible |
|------|--------|----------|-------------|
| 1 | Detect failure | < 5 min | Monitoring (auto) |
| 2 | Activate DR plan | 5 min | On-call engineer |
| 3 | Restore from cross-region S3 | 15-30 min | Automated script |
| 4 | Apply WAL logs | 5-10 min | Automated |
| 5 | Update DNS to DR region | 5 min | DevOps |
| 6 | Verify application connectivity | 5 min | QA/Dev |
| 7 | Notify stakeholders | 5 min | Ops Manager |
| **Total** | | **< 1 hour** | |

---

## 7. Backup Verification

### 7.1. Automated Verification (Weekly)

```bash
#!/bin/bash
# /scripts/verify-backup.sh
# Schedule: Every Sunday 4:00 AM

LATEST_BACKUP=$(find /backups/daily -name "*.sql.gz" | sort | tail -1)
RESTORE_DB="insurance_db_verify"

echo "$(date): Starting backup verification..."

# Create temporary database
createdb -U postgres "${RESTORE_DB}"

# Restore backup
pg_restore \
    -U postgres \
    -d "${RESTORE_DB}" \
    --no-owner \
    --no-privileges \
    "${LATEST_BACKUP}"

# Run integrity checks
psql -U postgres -d "${RESTORE_DB}" << 'SQL'
-- Check row counts match expected ranges
DO $$
DECLARE
    customer_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO customer_count FROM customer;
    SELECT COUNT(*) INTO policy_count FROM policy;
    
    IF customer_count < 1000 THEN
        RAISE EXCEPTION 'Customer count too low: %', customer_count;
    END IF;
    IF policy_count < 500 THEN
        RAISE EXCEPTION 'Policy count too low: %', policy_count;
    END IF;
    
    RAISE NOTICE 'Verification passed. Customers: %, Policies: %', customer_count, policy_count;
END $$;

-- Check FK integrity
SELECT COUNT(*) as orphan_policies 
FROM policy p 
LEFT JOIN customer c ON p.customer_id = c.id 
WHERE c.id IS NULL;
SQL

# Cleanup
dropdb -U postgres "${RESTORE_DB}"

echo "$(date): Backup verification completed successfully"
```

### 7.2. Verification Checklist

| Check | Frequency | Automated |
|-------|-----------|-----------|
| Backup file exists & non-zero | Every backup | Yes |
| pg_restore --list succeeds | Daily | Yes |
| Full restore to test DB | Weekly | Yes |
| Row count within expected range | Weekly | Yes |
| FK integrity check | Weekly | Yes |
| Application connectivity test | Monthly | No |
| Full DR drill | Quarterly | No |

---

## 8. Retention Policy

### 8.1. Storage Tiers

| Tier | Storage | Retention | Cost | Access Time |
|------|---------|-----------|------|-------------|
| Hot | Local SSD / EBS | 24 hours | $$$ | Instant |
| Warm | S3 Standard-IA | 30 days | $$ | < 1 min |
| Cold | S3 Glacier | 90 days - 1 year | $ | 3-5 hours |
| Archive | S3 Glacier Deep | 1 - 7 years | ¢ | 12 hours |

### 8.2. Lifecycle Rules

```json
{
  "Rules": [
    {
      "ID": "wal-retention",
      "Filter": {"Prefix": "wal/"},
      "Status": "Enabled",
      "Expiration": {"Days": 7}
    },
    {
      "ID": "snapshot-to-ia",
      "Filter": {"Prefix": "snapshots/"},
      "Status": "Enabled",
      "Transitions": [
        {"Days": 7, "StorageClass": "STANDARD_IA"},
        {"Days": 30, "StorageClass": "GLACIER"}
      ],
      "Expiration": {"Days": 90}
    },
    {
      "ID": "daily-retention",
      "Filter": {"Prefix": "daily/"},
      "Status": "Enabled",
      "Transitions": [
        {"Days": 30, "StorageClass": "GLACIER"}
      ],
      "Expiration": {"Days": 365}
    },
    {
      "ID": "monthly-archive",
      "Filter": {"Prefix": "monthly/"},
      "Status": "Enabled",
      "Transitions": [
        {"Days": 90, "StorageClass": "GLACIER_DEEP_ARCHIVE"}
      ],
      "Expiration": {"Days": 2555}
    }
  ]
}
```

---

## 9. Security

### 9.1. Backup Encryption

| Layer | Method | Key Management |
|-------|--------|---------------|
| At Rest (S3) | AES-256 (SSE-S3) | AWS managed |
| In Transit | TLS 1.3 | Auto |
| Backup Files | GPG encryption | Vault-managed keys |
| WAL Archives | pg_crypto | DB-level encryption |

### 9.2. Access Control

```
Backup User (PostgreSQL):
  - ROLE: backup_user
  - PRIVILEGES: SELECT on all tables, REPLICATION
  - NO write access to production data

S3 Bucket Policy:
  - Write: Only backup service role
  - Read: Only restore service role + admin
  - Delete: Only admin with MFA
  - Versioning: Enabled (prevent accidental delete)
```

---

## 10. Monitoring & Alerting

### 10.1. Alerts

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| Backup Failed | Exit code != 0 | Critical | PagerDuty + Slack |
| Backup Skipped | No backup in 8 hours | High | Slack |
| Replication Lag | > 1 MB or > 5 min | High | PagerDuty |
| S3 Upload Failed | Upload error | Critical | PagerDuty |
| Disk Space Low | Backup disk > 80% | Medium | Slack |
| Verification Failed | Integrity check error | Critical | PagerDuty + Email |

### 10.2. Metrics Dashboard

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Last successful backup | < 6h ago | 6-12h ago | > 12h ago |
| Backup size trend | ±10% | ±25% | ±50% |
| Replication lag | < 100KB | 100KB-1MB | > 1MB |
| Restore test result | Pass | - | Fail |
| S3 storage usage | < 500GB | 500GB-1TB | > 1TB |
