# Database Schema

---

## 1. Tổng quan

Tài liệu này định nghĩa schema SQL đầy đủ cho hệ thống Insurance System Platform.

**Database:** PostgreSQL 15  
**Character Set:** UTF-8  
**Collation:** vi_VN.utf8  
**Schema:** `public` (default)

---

## 2. Extensions

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search Vietnamese
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## 3. Custom Types (Enums)

```sql
-- Customer status
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- KYC status
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- Product status
CREATE TYPE product_status AS ENUM ('draft', 'active', 'suspended', 'archived');

-- Quote status
CREATE TYPE quote_status AS ENUM ('active', 'expired', 'converted');

-- Policy status
CREATE TYPE policy_status AS ENUM ('pending', 'active', 'expired', 'cancelled', 'lapsed', 'renewed');

-- Payment frequency
CREATE TYPE payment_frequency AS ENUM ('annual', 'semi_annual', 'quarterly', 'monthly');

-- Claim status
CREATE TYPE claim_status AS ENUM (
  'submitted', 'assigned', 'documents_review',
  'additional_info_required', 'under_assessment',
  'approved', 'partially_approved', 'rejected',
  'payment_processing', 'settled', 'closed', 'appealed'
);

-- Claim priority
CREATE TYPE claim_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'refunded', 'expired');

-- Payment method
CREATE TYPE payment_method AS ENUM ('ewallet', 'card', 'bank_transfer', 'installment');

-- Notification channel
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app', 'push');

-- Admin role
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'operator', 'claims_handler', 'finance');

-- Insurer status
CREATE TYPE insurer_status AS ENUM ('active', 'inactive', 'onboarding', 'suspended');

-- Reconciliation status
CREATE TYPE reconciliation_status AS ENUM ('draft', 'confirmed', 'settled');
```



---

## 4. Table Definitions

### 4.1. Customer Domain

```sql
-- =============================================
-- TABLE: customer
-- Description: Thông tin khách hàng đăng ký
-- =============================================
CREATE TABLE customer (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email             VARCHAR(255) NOT NULL UNIQUE,
    phone             VARCHAR(20) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    full_name         VARCHAR(100) NOT NULL,
    date_of_birth     DATE,
    gender            VARCHAR(10),
    id_number         VARCHAR(20),
    id_number_type    VARCHAR(20) DEFAULT 'cccd',
    address           JSONB,
    kyc_status        kyc_status DEFAULT 'pending',
    kyc_data          JSONB,
    avatar_url        VARCHAR(500),
    language          VARCHAR(5) DEFAULT 'vi',
    status            customer_status DEFAULT 'active',
    email_verified    BOOLEAN DEFAULT FALSE,
    phone_verified    BOOLEAN DEFAULT FALSE,
    last_login_at     TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at        TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE customer IS 'Bảng lưu thông tin khách hàng đăng ký trên hệ thống';
COMMENT ON COLUMN customer.id_number IS 'Số CCCD/CMND/Passport';
COMMENT ON COLUMN customer.address IS 'JSON: {street, ward, district, city, country}';
COMMENT ON COLUMN customer.kyc_data IS 'JSON: OCR data từ eKYC provider';

-- =============================================
-- TABLE: customer_family_member
-- Description: Thành viên gia đình của khách hàng
-- =============================================
CREATE TABLE customer_family_member (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    full_name       VARCHAR(100) NOT NULL,
    relationship    VARCHAR(30) NOT NULL,
    date_of_birth   DATE,
    gender          VARCHAR(10),
    id_number       VARCHAR(20),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: customer_social_account
-- Description: Tài khoản mạng xã hội liên kết
-- =============================================
CREATE TABLE customer_social_account (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    provider        VARCHAR(20) NOT NULL,
    provider_id     VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    name            VARCHAR(100),
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);
```

### 4.2. Product Domain

```sql
-- =============================================
-- TABLE: category
-- Description: Danh mục sản phẩm bảo hiểm
-- =============================================
CREATE TABLE category (
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
);

COMMENT ON TABLE category IS 'Danh mục sản phẩm bảo hiểm (hỗ trợ tree structure qua parent_id)';

-- =============================================
-- TABLE: insurer
-- Description: Công ty bảo hiểm đối tác
-- =============================================
CREATE TABLE insurer (
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
);

COMMENT ON TABLE insurer IS 'Thông tin công ty bảo hiểm đối tác';
COMMENT ON COLUMN insurer.api_config IS 'JSON: {api_key, secret, sandbox_url, prod_url, timeout}';
COMMENT ON COLUMN insurer.commission_rate IS 'JSON: {product_type: rate_percentage}';

-- =============================================
-- TABLE: product
-- Description: Sản phẩm bảo hiểm
-- =============================================
CREATE TABLE product (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL REFERENCES category(id),
    insurer_id      UUID NOT NULL REFERENCES insurer(id),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    description     TEXT,
    benefits        JSONB,
    exclusions      JSONB,
    pricing_rules   JSONB,
    eligibility     JSONB,
    documents       JSONB,
    min_age         INTEGER DEFAULT 0,
    max_age         INTEGER DEFAULT 100,
    min_sum_insured BIGINT,
    max_sum_insured BIGINT,
    waiting_period_days INTEGER DEFAULT 0,
    cooling_off_days INTEGER DEFAULT 21,
    status          product_status DEFAULT 'draft',
    rating          DECIMAL(3,2) DEFAULT 0.00,
    total_sold      INTEGER DEFAULT 0,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE product IS 'Sản phẩm bảo hiểm từ các đối tác';
COMMENT ON COLUMN product.benefits IS 'JSON array: [{name, description, coverage_amount, conditions}]';
COMMENT ON COLUMN product.pricing_rules IS 'JSON: {base_rate, rating_factors[], discounts[], loadings[]}';
COMMENT ON COLUMN product.eligibility IS 'JSON: {min_age, max_age, excluded_occupations[], regions[]}';
```



### 4.3. Quotation Domain

```sql
-- =============================================
-- TABLE: quote
-- Description: Báo giá bảo hiểm
-- =============================================
CREATE TABLE quote (
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
);

COMMENT ON TABLE quote IS 'Báo giá bảo hiểm cho khách hàng';
COMMENT ON COLUMN quote.input_data IS 'JSON: thông tin đầu vào (vehicle/health/travel)';
COMMENT ON COLUMN quote.premium_annual IS 'Phí bảo hiểm năm (VND)';
```

### 4.4. Policy Domain

```sql
-- =============================================
-- TABLE: policy
-- Description: Hợp đồng bảo hiểm
-- =============================================
CREATE TABLE policy (
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
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE policy IS 'Hợp đồng bảo hiểm đã phát hành';
COMMENT ON COLUMN policy.coverage_details IS 'JSON: {benefits[], exclusions[], conditions[]}';
COMMENT ON COLUMN policy.insured_persons IS 'JSON array: [{name, dob, relationship, id_number}]';
COMMENT ON COLUMN policy.riders IS 'JSON array: [{name, sum_insured, premium}]';

-- =============================================
-- TABLE: beneficiary
-- Description: Người thụ hưởng của hợp đồng
-- =============================================
CREATE TABLE beneficiary (
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
);

-- =============================================
-- TABLE: endorsement
-- Description: Sửa đổi bổ sung hợp đồng
-- =============================================
CREATE TABLE endorsement (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       UUID NOT NULL REFERENCES policy(id),
    endorsement_number VARCHAR(30) NOT NULL UNIQUE,
    type            VARCHAR(50) NOT NULL,
    description     TEXT,
    changes         JSONB NOT NULL,
    premium_adjustment BIGINT DEFAULT 0,
    effective_date  DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending',
    approved_by     UUID,
    approved_at     TIMESTAMP WITH TIME ZONE,
    document_url    VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: policy_document
-- Description: Tài liệu liên quan đến hợp đồng
-- =============================================
CREATE TABLE policy_document (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       UUID NOT NULL REFERENCES policy(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_size       INTEGER,
    mime_type       VARCHAR(50),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```



### 4.5. Claims Domain

```sql
-- =============================================
-- TABLE: claim
-- Description: Yêu cầu bồi thường
-- =============================================
CREATE TABLE claim (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    handler_id          UUID REFERENCES admin_user(id) ON DELETE SET NULL,
    claim_number        VARCHAR(30) NOT NULL UNIQUE,
    type                VARCHAR(30) NOT NULL,
    status              claim_status DEFAULT 'submitted',
    priority            claim_priority DEFAULT 'medium',
    event_date          DATE NOT NULL,
    event_description   TEXT NOT NULL,
    event_location      VARCHAR(255),
    third_party_involved BOOLEAN DEFAULT FALSE,
    police_report_number VARCHAR(50),
    claimed_amount      BIGINT NOT NULL,
    assessed_amount     BIGINT,
    approved_amount     BIGINT,
    deductible_applied  BIGINT DEFAULT 0,
    net_settlement      BIGINT,
    decision            VARCHAR(20),
    decision_reason     TEXT,
    decided_at          TIMESTAMP WITH TIME ZONE,
    settled_at          TIMESTAMP WITH TIME ZONE,
    bank_account        JSONB,
    submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE claim IS 'Yêu cầu bồi thường bảo hiểm';
COMMENT ON COLUMN claim.bank_account IS 'JSON: {bank_name, account_number, account_holder}';

-- =============================================
-- TABLE: claim_document
-- Description: Chứng từ đính kèm claim
-- =============================================
CREATE TABLE claim_document (
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
);

-- =============================================
-- TABLE: claim_note
-- Description: Ghi chú nội bộ và communication
-- =============================================
CREATE TABLE claim_note (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id        UUID NOT NULL REFERENCES claim(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(20) NOT NULL DEFAULT 'admin',
    content         TEXT NOT NULL,
    is_internal     BOOLEAN DEFAULT TRUE,
    attachments     JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN claim_note.is_internal IS 'TRUE = chỉ nội bộ, FALSE = khách hàng thấy được';

-- =============================================
-- TABLE: claim_status_history
-- Description: Lịch sử thay đổi trạng thái claim
-- =============================================
CREATE TABLE claim_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id        UUID NOT NULL REFERENCES claim(id) ON DELETE CASCADE,
    status_from     claim_status,
    status_to       claim_status NOT NULL,
    changed_by      UUID,
    changed_by_type VARCHAR(20) DEFAULT 'system',
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.6. Payment Domain

```sql
-- =============================================
-- TABLE: payment
-- Description: Giao dịch thanh toán
-- =============================================
CREATE TABLE payment (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    claim_id            UUID REFERENCES claim(id),
    reference_number    VARCHAR(50) NOT NULL UNIQUE,
    type                VARCHAR(30) NOT NULL,
    amount              BIGINT NOT NULL,
    currency            VARCHAR(3) DEFAULT 'VND',
    status              payment_status DEFAULT 'pending',
    method              payment_method,
    provider            VARCHAR(30),
    gateway_transaction_id VARCHAR(100),
    gateway_response    JSONB,
    paid_at             TIMESTAMP WITH TIME ZONE,
    expires_at          TIMESTAMP WITH TIME ZONE,
    refund_amount       BIGINT,
    refunded_at         TIMESTAMP WITH TIME ZONE,
    refund_reason       TEXT,
    retry_count         INTEGER DEFAULT 0,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE payment IS 'Giao dịch thanh toán (phí BH, hoàn tiền, bồi thường)';
COMMENT ON COLUMN payment.type IS 'premium_payment | renewal | refund | claim_settlement';

-- =============================================
-- TABLE: reconciliation
-- Description: Đối soát tài chính với đối tác
-- =============================================
CREATE TABLE reconciliation (
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
);
```



### 4.7. Admin & System Domain

```sql
-- =============================================
-- TABLE: admin_user
-- Description: Tài khoản quản trị viên
-- =============================================
CREATE TABLE admin_user (
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
);

-- =============================================
-- TABLE: notification
-- Description: Thông báo gửi đến người dùng
-- =============================================
CREATE TABLE notification (
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
);

-- =============================================
-- TABLE: audit_log
-- Description: Nhật ký thao tác hệ thống
-- =============================================
CREATE TABLE audit_log (
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
);

COMMENT ON TABLE audit_log IS 'Ghi log mọi thao tác write trên hệ thống';

-- =============================================
-- TABLE: session
-- Description: Quản lý phiên đăng nhập
-- =============================================
CREATE TABLE session (
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
);

-- =============================================
-- TABLE: otp_verification
-- Description: Mã OTP xác thực
-- =============================================
CREATE TABLE otp_verification (
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
);

COMMENT ON COLUMN otp_verification.target IS 'Email hoặc phone nhận OTP';
COMMENT ON COLUMN otp_verification.purpose IS 'registration | login | reset_password | transaction';
```

---

## 5. Indexes

```sql
-- Customer indexes
CREATE INDEX idx_customer_email ON customer(email);
CREATE INDEX idx_customer_phone ON customer(phone);
CREATE INDEX idx_customer_status ON customer(status);
CREATE INDEX idx_customer_kyc_status ON customer(kyc_status);
CREATE INDEX idx_customer_created_at ON customer(created_at);

-- Product indexes
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_insurer ON product(insurer_id);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_slug ON product(slug);

-- Quote indexes
CREATE INDEX idx_quote_customer ON quote(customer_id);
CREATE INDEX idx_quote_product ON quote(product_id);
CREATE INDEX idx_quote_status ON quote(status);
CREATE INDEX idx_quote_valid_until ON quote(valid_until);

-- Policy indexes
CREATE INDEX idx_policy_customer ON policy(customer_id);
CREATE INDEX idx_policy_product ON policy(product_id);
CREATE INDEX idx_policy_insurer ON policy(insurer_id);
CREATE INDEX idx_policy_status ON policy(status);
CREATE INDEX idx_policy_number ON policy(policy_number);
CREATE INDEX idx_policy_end_date ON policy(end_date);
CREATE INDEX idx_policy_next_due_date ON policy(next_due_date);

-- Claim indexes
CREATE INDEX idx_claim_policy ON claim(policy_id);
CREATE INDEX idx_claim_customer ON claim(customer_id);
CREATE INDEX idx_claim_handler ON claim(handler_id);
CREATE INDEX idx_claim_status ON claim(status);
CREATE INDEX idx_claim_number ON claim(claim_number);
CREATE INDEX idx_claim_submitted_at ON claim(submitted_at);

-- Payment indexes
CREATE INDEX idx_payment_policy ON payment(policy_id);
CREATE INDEX idx_payment_customer ON payment(customer_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_reference ON payment(reference_number);
CREATE INDEX idx_payment_created_at ON payment(created_at);

-- Notification indexes
CREATE INDEX idx_notification_user ON notification(user_id, user_type);
CREATE INDEX idx_notification_is_read ON notification(user_id, is_read);
CREATE INDEX idx_notification_created_at ON notification(created_at);

-- Audit log indexes
CREATE INDEX idx_audit_user ON audit_log(user_id, user_type);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);

-- Session indexes
CREATE INDEX idx_session_user ON session(user_id, user_type);
CREATE INDEX idx_session_expires ON session(expires_at);

-- OTP indexes
CREATE INDEX idx_otp_target ON otp_verification(target, purpose);
CREATE INDEX idx_otp_expires ON otp_verification(expires_at);
```

---

## 6. Constraints & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON customer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_updated_at BEFORE UPDATE ON policy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_updated_at BEFORE UPDATE ON claim
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_updated_at BEFORE UPDATE ON payment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_updated_at BEFORE UPDATE ON quote
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurer_updated_at BEFORE UPDATE ON insurer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure beneficiary percentages sum to 100% per policy
CREATE OR REPLACE FUNCTION check_beneficiary_total()
RETURNS TRIGGER AS $$
DECLARE
    total_pct DECIMAL(5,2);
BEGIN
    SELECT COALESCE(SUM(percentage), 0) INTO total_pct
    FROM beneficiary
    WHERE policy_id = NEW.policy_id AND id != COALESCE(NEW.id, uuid_generate_v4());
    
    IF (total_pct + NEW.percentage) > 100 THEN
        RAISE EXCEPTION 'Total beneficiary percentage exceeds 100%%';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_beneficiary_percentage
    BEFORE INSERT OR UPDATE ON beneficiary
    FOR EACH ROW EXECUTE FUNCTION check_beneficiary_total();

-- Policy date validation
ALTER TABLE policy ADD CONSTRAINT chk_policy_dates 
    CHECK (end_date > start_date);

-- Claim amount validation
ALTER TABLE claim ADD CONSTRAINT chk_claim_amount 
    CHECK (claimed_amount > 0);

-- Payment amount validation
ALTER TABLE payment ADD CONSTRAINT chk_payment_amount 
    CHECK (amount > 0);
```

---

## 7. Schema Summary

| Table | Domain | Estimated Rows (Year 1) | Growth Rate |
|-------|--------|------------------------|-------------|
| customer | Customer | 100,000 | 5K/month |
| customer_family_member | Customer | 50,000 | 2K/month |
| customer_social_account | Customer | 60,000 | 3K/month |
| category | Product | 30 | Static |
| insurer | Product | 20 | 1-2/quarter |
| product | Product | 200 | 5/month |
| quote | Quotation | 500,000 | 40K/month |
| policy | Policy | 50,000 | 5K/month |
| beneficiary | Policy | 75,000 | 7K/month |
| endorsement | Policy | 5,000 | 500/month |
| policy_document | Policy | 100,000 | 10K/month |
| claim | Claims | 10,000 | 1K/month |
| claim_document | Claims | 50,000 | 5K/month |
| claim_note | Claims | 30,000 | 3K/month |
| claim_status_history | Claims | 50,000 | 5K/month |
| payment | Payment | 100,000 | 10K/month |
| reconciliation | Payment | 240 | 20/month |
| admin_user | Admin | 50 | 2/month |
| notification | System | 1,000,000 | 100K/month |
| audit_log | System | 2,000,000 | 200K/month |
| session | System | 200,000 | 20K/month |
| otp_verification | System | 300,000 | 30K/month |
