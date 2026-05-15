-- =============================================
-- Sprint 11: Claims Settlement, Policy Renewal & Referral Schema
-- =============================================

-- Settlement tracking
CREATE TABLE IF NOT EXISTS claim_settlement (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claim(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    settlement_amount   DECIMAL(15,2) NOT NULL,
    settlement_method   VARCHAR(30) NOT NULL DEFAULT 'bank_transfer',
    
    -- Bank details
    bank_name           VARCHAR(100),
    bank_branch         VARCHAR(200),
    account_number      VARCHAR(50),
    account_holder      VARCHAR(200),
    
    -- Status
    status              VARCHAR(30) DEFAULT 'pending',
    transaction_ref     VARCHAR(100),
    
    -- Timestamps
    initiated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at        TIMESTAMP WITH TIME ZONE,
    completed_at        TIMESTAMP WITH TIME ZONE,
    failed_at           TIMESTAMP WITH TIME ZONE,
    failure_reason      TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims appeal
CREATE TABLE IF NOT EXISTS claim_appeal (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id            UUID NOT NULL REFERENCES claim(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    appeal_reason       TEXT NOT NULL,
    supporting_documents JSONB DEFAULT '[]',
    status              VARCHAR(30) DEFAULT 'submitted',
    review_notes        TEXT,
    reviewed_by         UUID,
    reviewed_at         TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy renewal
CREATE TABLE IF NOT EXISTS policy_renewal (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_policy_id  UUID NOT NULL REFERENCES policy(id),
    new_policy_id       UUID REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    
    -- Renewal details
    renewal_type        VARCHAR(20) NOT NULL DEFAULT 'manual',
    coverage_changes    JSONB DEFAULT '{}',
    old_premium         DECIMAL(15,2),
    new_premium         DECIMAL(15,2),
    discount_amount     DECIMAL(15,2) DEFAULT 0,
    
    -- Status
    status              VARCHAR(30) DEFAULT 'pending',
    payment_status      VARCHAR(30) DEFAULT 'unpaid',
    
    -- Dates
    renewal_date        DATE,
    new_effective_date  DATE,
    new_expiry_date     DATE,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-renewal settings
CREATE TABLE IF NOT EXISTS auto_renewal_setting (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policy(id) UNIQUE,
    customer_id         UUID NOT NULL REFERENCES customer(id),
    enabled             BOOLEAN DEFAULT false,
    payment_method      VARCHAR(30),
    payment_token       TEXT,
    last_reminder_sent  TIMESTAMP WITH TIME ZONE,
    next_renewal_date   DATE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renewal reminders log
CREATE TABLE IF NOT EXISTS renewal_reminder (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    reminder_type       VARCHAR(20) NOT NULL,
    days_before_expiry  INT NOT NULL,
    channel             VARCHAR(20) NOT NULL,
    sent_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at           TIMESTAMP WITH TIME ZONE,
    clicked_at          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy cancellation & refund
CREATE TABLE IF NOT EXISTS policy_cancellation (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    cancellation_reason TEXT NOT NULL,
    cancellation_type   VARCHAR(20) NOT NULL DEFAULT 'customer_request',
    
    -- Refund
    refund_eligible     BOOLEAN DEFAULT false,
    refund_amount       DECIMAL(15,2) DEFAULT 0,
    refund_method       VARCHAR(30),
    refund_status       VARCHAR(30) DEFAULT 'pending',
    refund_processed_at TIMESTAMP WITH TIME ZONE,
    refund_transaction_ref VARCHAR(100),
    
    -- Pro-rata calculation
    days_used           INT,
    total_days          INT,
    daily_rate          DECIMAL(15,2),
    
    -- Status
    status              VARCHAR(30) DEFAULT 'pending',
    approved_by         UUID,
    approved_at         TIMESTAMP WITH TIME ZONE,
    
    cancelled_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral program
CREATE TABLE IF NOT EXISTS referral (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id         UUID NOT NULL REFERENCES customer(id),
    referee_id          UUID REFERENCES customer(id),
    referral_code       VARCHAR(20) NOT NULL UNIQUE,
    
    -- Status
    status              VARCHAR(30) DEFAULT 'pending',
    
    -- Reward
    referrer_reward     DECIMAL(15,2) DEFAULT 0,
    referee_reward      DECIMAL(15,2) DEFAULT 0,
    reward_type         VARCHAR(30) DEFAULT 'cash',
    reward_status       VARCHAR(30) DEFAULT 'pending',
    reward_paid_at      TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    registered_at       TIMESTAMP WITH TIME ZONE,
    first_purchase_at   TIMESTAMP WITH TIME ZONE,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral program settings
CREATE TABLE IF NOT EXISTS referral_program_config (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_name        VARCHAR(100) NOT NULL,
    referrer_reward_amount DECIMAL(15,2) DEFAULT 100000,
    referee_reward_amount  DECIMAL(15,2) DEFAULT 50000,
    reward_type         VARCHAR(30) DEFAULT 'cash',
    min_purchase_amount DECIMAL(15,2) DEFAULT 0,
    max_referrals       INT DEFAULT 50,
    is_active           BOOLEAN DEFAULT true,
    start_date          DATE,
    end_date            DATE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to claim table for settlement
ALTER TABLE claim ADD COLUMN IF NOT EXISTS settlement_amount DECIMAL(15,2);
ALTER TABLE claim ADD COLUMN IF NOT EXISTS appeal_status VARCHAR(30);

-- Add columns to policy for renewal tracking
ALTER TABLE policy ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT false;
ALTER TABLE policy ADD COLUMN IF NOT EXISTS renewal_count INT DEFAULT 0;
ALTER TABLE policy ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Indexes
CREATE INDEX idx_settlement_claim ON claim_settlement(claim_id);
CREATE INDEX idx_settlement_customer ON claim_settlement(customer_id);
CREATE INDEX idx_settlement_status ON claim_settlement(status);
CREATE INDEX idx_appeal_claim ON claim_appeal(claim_id);
CREATE INDEX idx_appeal_status ON claim_appeal(status);
CREATE INDEX idx_renewal_policy ON policy_renewal(original_policy_id);
CREATE INDEX idx_renewal_customer ON policy_renewal(customer_id);
CREATE INDEX idx_renewal_status ON policy_renewal(status);
CREATE INDEX idx_auto_renewal_policy ON auto_renewal_setting(policy_id);
CREATE INDEX idx_auto_renewal_date ON auto_renewal_setting(next_renewal_date);
CREATE INDEX idx_reminder_policy ON renewal_reminder(policy_id);
CREATE INDEX idx_cancellation_policy ON policy_cancellation(policy_id);
CREATE INDEX idx_cancellation_status ON policy_cancellation(status);
CREATE INDEX idx_referral_referrer ON referral(referrer_id);
CREATE INDEX idx_referral_code ON referral(referral_code);
CREATE INDEX idx_referral_status ON referral(status);

-- Seed referral program config
INSERT INTO referral_program_config (program_name, referrer_reward_amount, referee_reward_amount, reward_type, min_purchase_amount, max_referrals, is_active)
VALUES ('Chương trình giới thiệu bạn bè', 100000, 50000, 'cash', 500000, 50, true)
ON CONFLICT DO NOTHING;
