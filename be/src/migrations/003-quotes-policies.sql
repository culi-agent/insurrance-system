-- =============================================
-- Migration 003: Quote & Policy Tables
-- Sprint 2: Motor Insurance & Policy Issuance
-- =============================================

-- =============================================
-- TABLE: quote_request
-- =============================================
CREATE TABLE IF NOT EXISTS quote_request (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID REFERENCES customer(id) ON DELETE SET NULL,
    product_type    VARCHAR(30) NOT NULL,
    input_data      JSONB NOT NULL,
    ip_address      VARCHAR(45),
    quotes_count    INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_request_customer ON quote_request(customer_id);
CREATE INDEX idx_quote_request_type ON quote_request(product_type);

-- =============================================
-- TABLE: quote
-- =============================================
CREATE TABLE IF NOT EXISTS quote (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id         UUID REFERENCES customer(id) ON DELETE SET NULL,
    product_id          UUID NOT NULL,
    insurer_id          UUID NOT NULL REFERENCES insurer(id),
    quote_number        VARCHAR(30) NOT NULL UNIQUE,
    product_type        VARCHAR(30) NOT NULL,
    input_data          JSONB NOT NULL,
    coverage_options    JSONB,
    premium_annual      BIGINT NOT NULL,
    premium_monthly     BIGINT,
    sum_insured         BIGINT NOT NULL,
    deductible          BIGINT DEFAULT 0,
    benefits_summary    JSONB,
    exclusions_summary  JSONB,
    pricing_breakdown   JSONB,
    valid_until         TIMESTAMP WITH TIME ZONE NOT NULL,
    status              VARCHAR(20) DEFAULT 'active',
    converted_policy_id UUID,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_customer ON quote(customer_id);
CREATE INDEX idx_quote_number ON quote(quote_number);
CREATE INDEX idx_quote_status ON quote(status);
CREATE INDEX idx_quote_insurer ON quote(insurer_id);
CREATE INDEX idx_quote_valid ON quote(valid_until) WHERE status = 'active';

-- =============================================
-- TABLE: policy
-- =============================================
CREATE TABLE IF NOT EXISTS policy (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number       VARCHAR(30) NOT NULL UNIQUE,
    customer_id         UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL,
    insurer_id          UUID NOT NULL REFERENCES insurer(id),
    quote_id            UUID REFERENCES quote(id),
    product_type        VARCHAR(30) NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending',
    insured_info        JSONB NOT NULL,
    coverage_details    JSONB NOT NULL,
    premium_annual      BIGINT NOT NULL,
    premium_monthly     BIGINT,
    payment_frequency   VARCHAR(20) DEFAULT 'annual',
    sum_insured         BIGINT NOT NULL,
    deductible          BIGINT DEFAULT 0,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    activated_at        TIMESTAMP WITH TIME ZONE,
    cancelled_at        TIMESTAMP WITH TIME ZONE,
    cancellation_reason VARCHAR(255),
    document_url        VARCHAR(500),
    certificate_url     VARCHAR(500),
    payment_id          UUID,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_policy_customer ON policy(customer_id);
CREATE INDEX idx_policy_number ON policy(policy_number);
CREATE INDEX idx_policy_status ON policy(status);
CREATE INDEX idx_policy_insurer ON policy(insurer_id);
CREATE INDEX idx_policy_dates ON policy(start_date, end_date);
CREATE INDEX idx_policy_expiring ON policy(end_date) WHERE status = 'active';

-- =============================================
-- TABLE: beneficiary
-- =============================================
CREATE TABLE IF NOT EXISTS beneficiary (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       UUID NOT NULL REFERENCES policy(id) ON DELETE CASCADE,
    full_name       VARCHAR(100) NOT NULL,
    relationship    VARCHAR(30) NOT NULL,
    date_of_birth   DATE,
    gender          VARCHAR(10),
    id_number       VARCHAR(20),
    phone           VARCHAR(20),
    percentage      DECIMAL(5,2) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_beneficiary_policy ON beneficiary(policy_id);
