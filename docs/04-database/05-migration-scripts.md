# Migration Scripts - Kịch Bản Migration

---

## 1. Tổng quan

Tài liệu này mô tả chiến lược migration cho database, bao gồm quy trình, naming convention, và các migration scripts theo thứ tự thực thi.

**ORM:** TypeORM  
**Migration Tool:** TypeORM CLI  
**Naming Convention:** `{timestamp}-{description}.ts`  
**Strategy:** Incremental migrations, zero-downtime deployments

---

## 2. Migration Strategy

### 2.1. Principles

| Principle | Description |
|-----------|-------------|
| Forward-only | Không sử dụng rollback trong production, tạo migration mới để fix |
| Idempotent | Migration có thể chạy lại mà không lỗi (IF NOT EXISTS) |
| Small & Focused | Mỗi migration chỉ thực hiện 1 thay đổi logic |
| Zero-downtime | Không lock tables, không breaking changes |
| Reversible | Mỗi migration phải có `down()` method |
| Tested | Chạy trên staging trước khi production |

### 2.2. Naming Convention

```
Format: {YYYYMMDDHHMMSS}-{Action}{Entity}.ts
Examples:
  20260101000001-CreateCustomerTable.ts
  20260101000002-CreateCategoryTable.ts
  20260115100000-AddPhoneIndexToCustomer.ts
  20260201090000-AlterPolicyAddLapsedAt.ts
```

### 2.3. Execution Order

Migrations phải chạy theo đúng thứ tự dependency:
1. Extensions & Types
2. Independent tables (category, insurer, admin_user)
3. Dependent tables (customer, product)
4. Relationship tables (quote, policy)
5. Child tables (claim, payment, beneficiary)
6. Utility tables (notification, audit_log, session, otp)
7. Indexes & Constraints
8. Functions & Triggers

---

## 3. Migration Scripts

### 3.1. Migration 001: Extensions & Custom Types

```typescript
// 20260101000001-CreateExtensionsAndTypes.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExtensionsAndTypes20260101000001 implements MigrationInterface {
    name = '20260101000001-CreateExtensionsAndTypes';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

        // Custom Types
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE product_status AS ENUM ('draft', 'active', 'suspended', 'archived');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE quote_status AS ENUM ('active', 'expired', 'converted');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE policy_status AS ENUM ('pending', 'active', 'expired', 'cancelled', 'lapsed', 'renewed');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE payment_frequency AS ENUM ('annual', 'semi_annual', 'quarterly', 'monthly');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE claim_status AS ENUM (
                    'submitted', 'assigned', 'documents_review',
                    'additional_info_required', 'under_assessment',
                    'approved', 'partially_approved', 'rejected',
                    'payment_processing', 'settled', 'closed', 'appealed'
                );
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE claim_priority AS ENUM ('low', 'medium', 'high', 'critical');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'refunded', 'expired');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE payment_method AS ENUM ('ewallet', 'card', 'bank_transfer', 'installment');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app', 'push');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'operator', 'claims_handler', 'finance');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE insurer_status AS ENUM ('active', 'inactive', 'onboarding', 'suspended');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE reconciliation_status AS ENUM ('draft', 'confirmed', 'settled');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE IF EXISTS reconciliation_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS insurer_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS admin_role`);
        await queryRunner.query(`DROP TYPE IF EXISTS notification_channel`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_method`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS claim_priority`);
        await queryRunner.query(`DROP TYPE IF EXISTS claim_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_frequency`);
        await queryRunner.query(`DROP TYPE IF EXISTS policy_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS quote_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS product_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS kyc_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS customer_status`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "pg_trgm"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "unaccent"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
```

### 3.2. Migration 002: Admin User Table

```typescript
// 20260101000002-CreateAdminUserTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminUserTable20260101000002 implements MigrationInterface {
    name = '20260101000002-CreateAdminUserTable';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS admin_user (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email           VARCHAR(255) NOT NULL UNIQUE,
                password_hash   VARCHAR(255) NOT NULL,
                full_name       VARCHAR(100) NOT NULL,
                role            admin_role NOT NULL,
                permissions     JSONB,
                phone           VARCHAR(20),
                avatar_url      VARCHAR(500),
                is_active       BOOLEAN DEFAULT TRUE,
                mfa_enabled     BOOLEAN DEFAULT FALSE,
                mfa_secret      VARCHAR(255),
                last_login_at   TIMESTAMP WITH TIME ZONE,
                last_login_ip   VARCHAR(45),
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS admin_user`);
    }
}
```

### 3.3. Migration 003: Customer Table

```typescript
// 20260101000003-CreateCustomerTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerTable20260101000003 implements MigrationInterface {
    name = '20260101000003-CreateCustomerTable';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS customer (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email           VARCHAR(255) NOT NULL UNIQUE,
                phone           VARCHAR(20) NOT NULL UNIQUE,
                password_hash   VARCHAR(255) NOT NULL,
                full_name       VARCHAR(100) NOT NULL,
                date_of_birth   DATE,
                gender          VARCHAR(10),
                id_number       VARCHAR(20),
                id_number_type  VARCHAR(20) DEFAULT 'cccd',
                address         JSONB,
                kyc_status      kyc_status DEFAULT 'pending',
                kyc_data        JSONB,
                avatar_url      VARCHAR(500),
                language        VARCHAR(5) DEFAULT 'vi',
                status          customer_status DEFAULT 'active',
                email_verified  BOOLEAN DEFAULT FALSE,
                phone_verified  BOOLEAN DEFAULT FALSE,
                last_login_at   TIMESTAMP WITH TIME ZONE,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                deleted_at      TIMESTAMP WITH TIME ZONE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS customer_family_member (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
                full_name       VARCHAR(100) NOT NULL,
                relationship    VARCHAR(30) NOT NULL,
                date_of_birth   DATE,
                gender          VARCHAR(10),
                id_number       VARCHAR(20),
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS customer_social_account (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
                provider        VARCHAR(20) NOT NULL,
                provider_id     VARCHAR(255) NOT NULL,
                email           VARCHAR(255),
                name            VARCHAR(100),
                avatar_url      VARCHAR(500),
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(provider, provider_id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS customer_social_account`);
        await queryRunner.query(`DROP TABLE IF EXISTS customer_family_member`);
        await queryRunner.query(`DROP TABLE IF EXISTS customer`);
    }
}
```



### 3.4. Migration 004: Category & Insurer Tables

```typescript
// 20260101000004-CreateCategoryInsurerTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryInsurerTables20260101000004 implements MigrationInterface {
    name = '20260101000004-CreateCategoryInsurerTables';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS category (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name            VARCHAR(100) NOT NULL,
                slug            VARCHAR(100) NOT NULL UNIQUE,
                description     TEXT,
                icon            VARCHAR(50),
                parent_id       UUID REFERENCES category(id) ON DELETE SET NULL,
                sort_order      INTEGER DEFAULT 0,
                is_active       BOOLEAN DEFAULT TRUE,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS insurer (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name            VARCHAR(200) NOT NULL,
                code            VARCHAR(20) NOT NULL UNIQUE,
                logo_url        VARCHAR(500),
                description     TEXT,
                api_endpoint    VARCHAR(500),
                api_config      JSONB,
                commission_rate JSONB,
                contact_info    JSONB,
                status          insurer_status DEFAULT 'onboarding',
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS insurer`);
        await queryRunner.query(`DROP TABLE IF EXISTS category`);
    }
}
```

### 3.5. Migration 005: Product Table

```typescript
// 20260101000005-CreateProductTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTable20260101000005 implements MigrationInterface {
    name = '20260101000005-CreateProductTable';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS product (
                id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                category_id         UUID NOT NULL REFERENCES category(id),
                insurer_id          UUID NOT NULL REFERENCES insurer(id),
                name                VARCHAR(200) NOT NULL,
                slug                VARCHAR(200) NOT NULL UNIQUE,
                short_description   VARCHAR(500),
                description         TEXT,
                benefits            JSONB,
                exclusions          JSONB,
                pricing_rules       JSONB,
                eligibility         JSONB,
                documents           JSONB,
                min_age             INTEGER DEFAULT 0,
                max_age             INTEGER DEFAULT 100,
                min_sum_insured     BIGINT,
                max_sum_insured     BIGINT,
                waiting_period_days INTEGER DEFAULT 0,
                cooling_off_days    INTEGER DEFAULT 21,
                status              product_status DEFAULT 'draft',
                rating              DECIMAL(3,2) DEFAULT 0.00,
                total_sold          INTEGER DEFAULT 0,
                sort_order          INTEGER DEFAULT 0,
                created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS product`);
    }
}
```

### 3.6. Migration 006: Quote Table

```typescript
// 20260101000006-CreateQuoteTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuoteTable20260101000006 implements MigrationInterface {
    name = '20260101000006-CreateQuoteTable';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS quote (
                id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                customer_id         UUID REFERENCES customer(id) ON DELETE SET NULL,
                product_id          UUID NOT NULL REFERENCES product(id),
                insurer_id          UUID NOT NULL REFERENCES insurer(id),
                quote_number        VARCHAR(30) NOT NULL UNIQUE,
                input_data          JSONB NOT NULL,
                coverage_options    JSONB,
                premium_annual      BIGINT NOT NULL,
                premium_monthly     BIGINT,
                sum_insured         BIGINT NOT NULL,
                deductible          BIGINT DEFAULT 0,
                benefits_summary    JSONB,
                exclusions_summary  JSONB,
                valid_until         TIMESTAMP WITH TIME ZONE NOT NULL,
                status              quote_status DEFAULT 'active',
                converted_policy_id UUID,
                created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS quote`);
    }
}
```

### 3.7. Migration 007: Policy & Related Tables

```typescript
// 20260101000007-CreatePolicyTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePolicyTables20260101000007 implements MigrationInterface {
    name = '20260101000007-CreatePolicyTables';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS policy (
                id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                customer_id         UUID NOT NULL REFERENCES customer(id),
                product_id          UUID NOT NULL REFERENCES product(id),
                insurer_id          UUID NOT NULL REFERENCES insurer(id),
                quote_id            UUID REFERENCES quote(id) ON DELETE SET NULL,
                policy_number       VARCHAR(30) NOT NULL UNIQUE,
                status              policy_status DEFAULT 'pending',
                start_date          DATE NOT NULL,
                end_date            DATE NOT NULL,
                issued_date         DATE,
                premium_total       BIGINT NOT NULL,
                premium_frequency   payment_frequency DEFAULT 'annual',
                installment_amount  BIGINT,
                next_due_date       DATE,
                sum_insured         BIGINT NOT NULL,
                deductible          BIGINT DEFAULT 0,
                coverage_details    JSONB,
                insured_persons     JSONB,
                riders              JSONB,
                document_url        VARCHAR(500),
                auto_renewal        BOOLEAN DEFAULT FALSE,
                renewal_date        DATE,
                cancelled_at        TIMESTAMP WITH TIME ZONE,
                cancellation_reason TEXT,
                lapsed_at           TIMESTAMP WITH TIME ZONE,
                created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT chk_policy_dates CHECK (end_date > start_date)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS beneficiary (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                policy_id       UUID NOT NULL REFERENCES policy(id) ON DELETE CASCADE,
                full_name       VARCHAR(100) NOT NULL,
                relationship    VARCHAR(30) NOT NULL,
                percentage      DECIMAL(5,2) NOT NULL,
                date_of_birth   DATE,
                id_number       VARCHAR(20),
                phone           VARCHAR(20),
                email           VARCHAR(255),
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT chk_percentage CHECK (percentage > 0 AND percentage <= 100)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS endorsement (
                id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                policy_id           UUID NOT NULL REFERENCES policy(id),
                endorsement_number  VARCHAR(30) NOT NULL UNIQUE,
                type                VARCHAR(50) NOT NULL,
                description         TEXT,
                changes             JSONB NOT NULL,
                premium_adjustment  BIGINT DEFAULT 0,
                effective_date      DATE NOT NULL,
                status              VARCHAR(20) DEFAULT 'pending',
                approved_by         UUID,
                approved_at         TIMESTAMP WITH TIME ZONE,
                document_url        VARCHAR(500),
                created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS policy_document (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                policy_id       UUID NOT NULL REFERENCES policy(id) ON DELETE CASCADE,
                type            VARCHAR(50) NOT NULL,
                name            VARCHAR(200) NOT NULL,
                file_url        VARCHAR(500) NOT NULL,
                file_size       INTEGER,
                mime_type       VARCHAR(50),
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        -- Sequences for number generation
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS policy_number_seq START 1 INCREMENT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS policy_number_seq`);
        await queryRunner.query(`DROP TABLE IF EXISTS policy_document`);
        await queryRunner.query(`DROP TABLE IF EXISTS endorsement`);
        await queryRunner.query(`DROP TABLE IF EXISTS beneficiary`);
        await queryRunner.query(`DROP TABLE IF EXISTS policy`);
    }
}
```

### 3.8. Migration 008: Claim Tables

```typescript
// 20260101000008-CreateClaimTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClaimTables20260101000008 implements MigrationInterface {
    name = '20260101000008-CreateClaimTables';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS claim (
                id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                policy_id               UUID NOT NULL REFERENCES policy(id),
                customer_id             UUID NOT NULL REFERENCES customer(id),
                handler_id              UUID REFERENCES admin_user(id) ON DELETE SET NULL,
                claim_number            VARCHAR(30) NOT NULL UNIQUE,
                type                    VARCHAR(30) NOT NULL,
                status                  claim_status DEFAULT 'submitted',
                priority                claim_priority DEFAULT 'medium',
                event_date              DATE NOT NULL,
                event_description       TEXT NOT NULL,
                event_location          VARCHAR(255),
                third_party_involved    BOOLEAN DEFAULT FALSE,
                police_report_number    VARCHAR(50),
                claimed_amount          BIGINT NOT NULL,
                assessed_amount         BIGINT,
                approved_amount         BIGINT,
                deductible_applied      BIGINT DEFAULT 0,
                net_settlement          BIGINT,
                decision                VARCHAR(20),
                decision_reason         TEXT,
                decided_at              TIMESTAMP WITH TIME ZONE,
                settled_at              TIMESTAMP WITH TIME ZONE,
                bank_account            JSONB,
                submitted_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT chk_claim_amount CHECK (claimed_amount > 0)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS claim_document (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                claim_id        UUID NOT NULL REFERENCES claim(id) ON DELETE CASCADE,
                type            VARCHAR(50) NOT NULL,
                file_name       VARCHAR(200) NOT NULL,
                file_url        VARCHAR(500) NOT NULL,
                file_size       INTEGER,
                mime_type       VARCHAR(50),
                is_verified     BOOLEAN DEFAULT FALSE,
                verified_by     UUID,
                verified_at     TIMESTAMP WITH TIME ZONE,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS claim_note (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                claim_id        UUID NOT NULL REFERENCES claim(id) ON DELETE CASCADE,
                user_id         UUID NOT NULL,
                user_type       VARCHAR(20) NOT NULL DEFAULT 'admin',
                content         TEXT NOT NULL,
                is_internal     BOOLEAN DEFAULT TRUE,
                attachments     JSONB,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS claim_status_history (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                claim_id        UUID NOT NULL REFERENCES claim(id) ON DELETE CASCADE,
                status_from     claim_status,
                status_to       claim_status NOT NULL,
                changed_by      UUID,
                changed_by_type VARCHAR(20) DEFAULT 'system',
                note            TEXT,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1 INCREMENT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS claim_number_seq`);
        await queryRunner.query(`DROP TABLE IF EXISTS claim_status_history`);
        await queryRunner.query(`DROP TABLE IF EXISTS claim_note`);
        await queryRunner.query(`DROP TABLE IF EXISTS claim_document`);
        await queryRunner.query(`DROP TABLE IF EXISTS claim`);
    }
}
```

### 3.9. Migration 009: Payment & Reconciliation Tables

```typescript
// 20260101000009-CreatePaymentTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTables20260101000009 implements MigrationInterface {
    name = '20260101000009-CreatePaymentTables';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS payment (
                id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                policy_id               UUID REFERENCES policy(id),
                customer_id             UUID NOT NULL REFERENCES customer(id),
                claim_id                UUID REFERENCES claim(id),
                reference_number        VARCHAR(50) NOT NULL UNIQUE,
                type                    VARCHAR(30) NOT NULL,
                amount                  BIGINT NOT NULL,
                currency                VARCHAR(3) DEFAULT 'VND',
                status                  payment_status DEFAULT 'pending',
                method                  payment_method,
                provider                VARCHAR(30),
                gateway_transaction_id  VARCHAR(100),
                gateway_response        JSONB,
                paid_at                 TIMESTAMP WITH TIME ZONE,
                expires_at              TIMESTAMP WITH TIME ZONE,
                refund_amount           BIGINT,
                refunded_at             TIMESTAMP WITH TIME ZONE,
                refund_reason           TEXT,
                retry_count             INTEGER DEFAULT 0,
                metadata                JSONB,
                created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT chk_payment_amount CHECK (amount > 0)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS reconciliation (
                id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                insurer_id          UUID NOT NULL REFERENCES insurer(id),
                period_month        INTEGER NOT NULL,
                period_year         INTEGER NOT NULL,
                total_gwp           BIGINT NOT NULL DEFAULT 0,
                total_commission    BIGINT NOT NULL DEFAULT 0,
                net_payable         BIGINT NOT NULL DEFAULT 0,
                transaction_count   INTEGER DEFAULT 0,
                discrepancies       JSONB,
                status              reconciliation_status DEFAULT 'draft',
                confirmed_by        UUID,
                confirmed_at        TIMESTAMP WITH TIME ZONE,
                settled_at          TIMESTAMP WITH TIME ZONE,
                notes               TEXT,
                created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(insurer_id, period_month, period_year)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS reconciliation`);
        await queryRunner.query(`DROP TABLE IF EXISTS payment`);
    }
}
```



### 3.10. Migration 010: System Tables

```typescript
// 20260101000010-CreateSystemTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSystemTables20260101000010 implements MigrationInterface {
    name = '20260101000010-CreateSystemTables';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS notification (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS session (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id         UUID NOT NULL,
                user_type       VARCHAR(20) NOT NULL DEFAULT 'customer',
                refresh_token   VARCHAR(500) NOT NULL UNIQUE,
                device_info     JSONB,
                ip_address      VARCHAR(45),
                is_active       BOOLEAN DEFAULT TRUE,
                expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_used_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS otp_verification (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id         UUID,
                target          VARCHAR(255) NOT NULL,
                target_type     VARCHAR(20) NOT NULL,
                code            VARCHAR(10) NOT NULL,
                purpose         VARCHAR(30) NOT NULL,
                attempts        INTEGER DEFAULT 0,
                max_attempts    INTEGER DEFAULT 3,
                is_used         BOOLEAN DEFAULT FALSE,
                expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS otp_verification`);
        await queryRunner.query(`DROP TABLE IF EXISTS session`);
        await queryRunner.query(`DROP TABLE IF EXISTS audit_log`);
        await queryRunner.query(`DROP TABLE IF EXISTS notification`);
    }
}
```

### 3.11. Migration 011: Indexes

```typescript
// 20260101000011-CreateIndexes.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIndexes20260101000011 implements MigrationInterface {
    name = '20260101000011-CreateIndexes';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Customer
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_status ON customer(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_kyc ON customer(kyc_status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_created ON customer(created_at)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_active ON customer(id) WHERE deleted_at IS NULL`);

        // Product
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_insurer ON product(insurer_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_status ON product(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_active ON product(id) WHERE status = 'active'`);

        // Quote
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quote_customer ON quote(customer_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quote_product ON quote(product_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quote_status ON quote(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_quote_valid ON quote(valid_until) WHERE status = 'active'`);

        // Policy
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_policy_customer ON policy(customer_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_policy_product ON policy(product_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_policy_insurer ON policy(insurer_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_policy_status ON policy(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_policy_end_date ON policy(end_date)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_policy_due_date ON policy(next_due_date) WHERE status = 'active'`);

        // Claim
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claim_policy ON claim(policy_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claim_customer ON claim(customer_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claim_handler ON claim(handler_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claim_status ON claim(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_claim_submitted ON claim(submitted_at)`);

        // Payment
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_policy ON payment(policy_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_customer ON payment(customer_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_created ON payment(created_at)`);

        // Notification
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notif_user ON notification(user_id, user_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notif_unread ON notification(user_id, is_read) WHERE is_read = FALSE`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notif_created ON notification(created_at)`);

        // Audit Log
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, user_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at)`);

        // Session
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_session_user ON session(user_id, user_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_session_expires ON session(expires_at)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_session_active ON session(user_id) WHERE is_active = TRUE`);

        // OTP
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_otp_target ON otp_verification(target, purpose)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verification(expires_at)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all indexes (reverse order)
        const indexes = [
            'idx_otp_expires', 'idx_otp_target',
            'idx_session_active', 'idx_session_expires', 'idx_session_user',
            'idx_audit_created', 'idx_audit_entity', 'idx_audit_user',
            'idx_notif_created', 'idx_notif_unread', 'idx_notif_user',
            'idx_payment_created', 'idx_payment_status', 'idx_payment_customer', 'idx_payment_policy',
            'idx_claim_submitted', 'idx_claim_status', 'idx_claim_handler', 'idx_claim_customer', 'idx_claim_policy',
            'idx_policy_due_date', 'idx_policy_end_date', 'idx_policy_status', 'idx_policy_insurer', 'idx_policy_product', 'idx_policy_customer',
            'idx_quote_valid', 'idx_quote_status', 'idx_quote_product', 'idx_quote_customer',
            'idx_product_active', 'idx_product_status', 'idx_product_insurer', 'idx_product_category',
            'idx_customer_active', 'idx_customer_created', 'idx_customer_kyc', 'idx_customer_status',
        ];
        for (const idx of indexes) {
            await queryRunner.query(`DROP INDEX IF EXISTS ${idx}`);
        }
    }
}
```

### 3.12. Migration 012: Functions & Triggers

```typescript
// 20260101000012-CreateFunctionsAndTriggers.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFunctionsAndTriggers20260101000012 implements MigrationInterface {
    name = '20260101000012-CreateFunctionsAndTriggers';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // updated_at trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);

        // Apply to all tables with updated_at
        const tables = [
            'customer', 'customer_family_member', 'category', 'insurer',
            'product', 'quote', 'policy', 'beneficiary', 'endorsement',
            'claim', 'payment', 'reconciliation', 'admin_user'
        ];
        for (const table of tables) {
            await queryRunner.query(`
                DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
                CREATE TRIGGER update_${table}_updated_at
                    BEFORE UPDATE ON ${table}
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
            `);
        }

        // Beneficiary percentage check
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_beneficiary_total()
            RETURNS TRIGGER AS $$
            DECLARE total_pct DECIMAL(5,2);
            BEGIN
                SELECT COALESCE(SUM(percentage), 0) INTO total_pct
                FROM beneficiary
                WHERE policy_id = NEW.policy_id AND id != COALESCE(NEW.id, uuid_generate_v4());
                IF (total_pct + NEW.percentage) > 100 THEN
                    RAISE EXCEPTION 'Total beneficiary percentage exceeds 100%%';
                END IF;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS check_beneficiary_percentage ON beneficiary;
            CREATE TRIGGER check_beneficiary_percentage
                BEFORE INSERT OR UPDATE ON beneficiary
                FOR EACH ROW EXECUTE FUNCTION check_beneficiary_total()
        `);

        // Number generation functions
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION generate_policy_number()
            RETURNS VARCHAR(30) AS $$
            DECLARE
                seq_val BIGINT;
                year_month VARCHAR(6);
            BEGIN
                seq_val := nextval('policy_number_seq');
                year_month := to_char(NOW(), 'YYYYMM');
                RETURN 'POL-' || year_month || '-' || LPAD(seq_val::TEXT, 6, '0');
            END;
            $$ LANGUAGE plpgsql
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION generate_claim_number()
            RETURNS VARCHAR(30) AS $$
            DECLARE
                seq_val BIGINT;
                year_month VARCHAR(6);
            BEGIN
                seq_val := nextval('claim_number_seq');
                year_month := to_char(NOW(), 'YYYYMM');
                RETURN 'CLM-' || year_month || '-' || LPAD(seq_val::TEXT, 6, '0');
            END;
            $$ LANGUAGE plpgsql
        `);

        // Audit log immutability
        await queryRunner.query(`
            CREATE OR REPLACE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING
        `);
        await queryRunner.query(`
            CREATE OR REPLACE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP RULE IF EXISTS audit_log_no_delete ON audit_log`);
        await queryRunner.query(`DROP RULE IF EXISTS audit_log_no_update ON audit_log`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS generate_claim_number`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS generate_policy_number`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS check_beneficiary_percentage ON beneficiary`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_beneficiary_total`);

        const tables = [
            'customer', 'customer_family_member', 'category', 'insurer',
            'product', 'quote', 'policy', 'beneficiary', 'endorsement',
            'claim', 'payment', 'reconciliation', 'admin_user'
        ];
        for (const table of tables) {
            await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}`);
        }
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
    }
}
```

---

## 4. Migration Commands

### 4.1. TypeORM CLI Commands

```bash
# Generate migration from entity changes
npx typeorm migration:generate -n MigrationName

# Create empty migration
npx typeorm migration:create -n MigrationName

# Run pending migrations
npx typeorm migration:run

# Revert last migration
npx typeorm migration:revert

# Show migration status
npx typeorm migration:show
```

### 4.2. Environment-Specific

```bash
# Development
NODE_ENV=development npx typeorm migration:run

# Staging
NODE_ENV=staging npx typeorm migration:run

# Production (with confirmation)
NODE_ENV=production npx typeorm migration:run
```

---

## 5. Migration Best Practices

### 5.1. Zero-Downtime Migration Rules

| Rule | Do | Don't |
|------|-----|-------|
| Add column | `ALTER TABLE ADD COLUMN ... DEFAULT NULL` | Add NOT NULL without default |
| Remove column | Deploy code first (ignore column) → then DROP | DROP column while code still reads it |
| Rename column | Add new → Copy data → Deploy code → Drop old | Direct RENAME |
| Add index | `CREATE INDEX CONCURRENTLY` | `CREATE INDEX` (locks table) |
| Change type | Add new column → migrate data → swap | `ALTER COLUMN TYPE` on large table |

### 5.2. Large Table Migrations

```sql
-- For tables > 1M rows, use batched updates
DO $$
DECLARE
    batch_size INTEGER := 10000;
    affected INTEGER;
BEGIN
    LOOP
        UPDATE target_table
        SET new_column = computed_value
        WHERE new_column IS NULL
        LIMIT batch_size;
        
        GET DIAGNOSTICS affected = ROW_COUNT;
        EXIT WHEN affected = 0;
        
        PERFORM pg_sleep(0.1); -- Reduce load
    END LOOP;
END $$;
```

### 5.3. Rollback Strategy

| Scenario | Strategy |
|----------|----------|
| Migration fails mid-way | TypeORM auto-rollback transaction |
| Need to undo production migration | Create new forward migration to reverse |
| Data corruption | Restore from backup + replay migrations |
| Schema conflict | Fix in new migration, never edit existing |
