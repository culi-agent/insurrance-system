-- =============================================
-- Sprint 4: Purchase Flow & Payment Schema
-- =============================================

-- Purchase/Order table
CREATE TABLE IF NOT EXISTS purchase_order (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        VARCHAR(50) NOT NULL UNIQUE,
    customer_id         UUID NOT NULL REFERENCES customer(id),
    quotation_id        UUID REFERENCES quotation(id),
    product_id          UUID NOT NULL REFERENCES product(id),
    insurer_id          UUID NOT NULL REFERENCES insurer(id),
    insurance_type      VARCHAR(50) NOT NULL,

    -- Wizard step tracking
    current_step        INTEGER DEFAULT 1,
    total_steps         INTEGER DEFAULT 5,
    wizard_data         JSONB DEFAULT '{}',

    -- Personal info
    applicant_info      JSONB NOT NULL DEFAULT '{}',
    beneficiary_info    JSONB DEFAULT '[]',

    -- eKYC
    ekyc_status         VARCHAR(20) DEFAULT 'pending',
    ekyc_data           JSONB DEFAULT '{}',
    ekyc_verified_at    TIMESTAMP WITH TIME ZONE,

    -- Underwriting
    underwriting_status VARCHAR(20) DEFAULT 'pending',
    underwriting_result JSONB DEFAULT '{}',
    underwriting_at     TIMESTAMP WITH TIME ZONE,

    -- Premium
    premium_amount      DECIMAL(15,2) NOT NULL,
    discount_amount     DECIMAL(15,2) DEFAULT 0,
    tax_amount          DECIMAL(15,2) DEFAULT 0,
    total_amount        DECIMAL(15,2) NOT NULL,

    -- Status
    status              VARCHAR(30) DEFAULT 'draft',
    status_history      JSONB DEFAULT '[]',

    -- Timestamps
    submitted_at        TIMESTAMP WITH TIME ZONE,
    completed_at        TIMESTAMP WITH TIME ZONE,
    cancelled_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment table
CREATE TABLE IF NOT EXISTS payment (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number      VARCHAR(50) NOT NULL UNIQUE,
    order_id            UUID NOT NULL REFERENCES purchase_order(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),

    -- Payment details
    amount              DECIMAL(15,2) NOT NULL,
    currency            VARCHAR(10) DEFAULT 'VND',
    payment_method      VARCHAR(30) NOT NULL,
    payment_gateway     VARCHAR(30) NOT NULL,

    -- Gateway response
    gateway_transaction_id  VARCHAR(200),
    gateway_response    JSONB DEFAULT '{}',
    gateway_url         TEXT,

    -- Status
    status              VARCHAR(20) DEFAULT 'pending',
    paid_at             TIMESTAMP WITH TIME ZONE,
    failed_at           TIMESTAMP WITH TIME ZONE,
    refunded_at         TIMESTAMP WITH TIME ZONE,
    refund_amount       DECIMAL(15,2),

    -- Metadata
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    metadata            JSONB DEFAULT '{}',

    -- Timestamps
    expires_at          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy table
CREATE TABLE IF NOT EXISTS policy (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number       VARCHAR(50) NOT NULL UNIQUE,
    order_id            UUID NOT NULL REFERENCES purchase_order(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    product_id          UUID NOT NULL REFERENCES product(id),
    insurer_id          UUID NOT NULL REFERENCES insurer(id),

    -- Policy details
    insurance_type      VARCHAR(50) NOT NULL,
    plan_name           VARCHAR(200),
    coverage_details    JSONB NOT NULL DEFAULT '{}',

    -- Insured info
    insured_info        JSONB NOT NULL DEFAULT '{}',
    beneficiary_info    JSONB DEFAULT '[]',

    -- Premium
    premium_amount      DECIMAL(15,2) NOT NULL,
    payment_frequency   VARCHAR(20) DEFAULT 'one_time',

    -- Dates
    effective_date      DATE NOT NULL,
    expiry_date         DATE NOT NULL,
    issued_date         DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Documents
    policy_document_url TEXT,
    certificate_url     TEXT,

    -- Status
    status              VARCHAR(20) DEFAULT 'active',

    -- E-signature
    signature_status    VARCHAR(20) DEFAULT 'pending',
    signed_at           TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata            JSONB DEFAULT '{}',

    -- Timestamps
    renewed_from_id     UUID REFERENCES policy(id),
    cancelled_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_number ON purchase_order(order_number);
CREATE INDEX idx_order_customer ON purchase_order(customer_id);
CREATE INDEX idx_order_status ON purchase_order(status);
CREATE INDEX idx_order_created ON purchase_order(created_at DESC);

CREATE INDEX idx_payment_number ON payment(payment_number);
CREATE INDEX idx_payment_order ON payment(order_id);
CREATE INDEX idx_payment_customer ON payment(customer_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_gateway_txn ON payment(gateway_transaction_id);

CREATE INDEX idx_policy_number ON policy(policy_number);
CREATE INDEX idx_policy_customer ON policy(customer_id);
CREATE INDEX idx_policy_status ON policy(status);
CREATE INDEX idx_policy_dates ON policy(effective_date, expiry_date);
CREATE INDEX idx_policy_created ON policy(created_at DESC);
