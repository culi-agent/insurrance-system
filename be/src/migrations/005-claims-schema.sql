-- =============================================
-- Sprint 10: Claims Submission Portal Schema
-- =============================================

CREATE TABLE IF NOT EXISTS claim (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number        VARCHAR(50) NOT NULL UNIQUE,
    policy_id           UUID NOT NULL REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    insurance_type      VARCHAR(50) NOT NULL,

    -- Claim details
    claim_type          VARCHAR(50) NOT NULL,
    incident_date       DATE NOT NULL,
    incident_description TEXT NOT NULL,
    claim_amount        DECIMAL(15,2),
    approved_amount     DECIMAL(15,2),

    -- Status
    status              VARCHAR(30) DEFAULT 'submitted',
    assigned_to         UUID,
    priority            VARCHAR(10) DEFAULT 'normal',

    -- Documents
    documents           JSONB DEFAULT '[]',

    -- Communication
    messages            JSONB DEFAULT '[]',

    -- Assessment
    assessment          JSONB DEFAULT '{}',
    decision_reason     TEXT,
    decided_at          TIMESTAMP WITH TIME ZONE,
    decided_by          UUID,

    -- Settlement
    settlement_method   VARCHAR(30),
    settlement_account  JSONB DEFAULT '{}',
    settled_at          TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preference (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    channel             VARCHAR(20) NOT NULL,
    event               VARCHAR(50) NOT NULL,
    enabled             BOOLEAN DEFAULT true,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, channel, event)
);

-- Indexes
CREATE INDEX idx_claim_number ON claim(claim_number);
CREATE INDEX idx_claim_customer ON claim(customer_id);
CREATE INDEX idx_claim_policy ON claim(policy_id);
CREATE INDEX idx_claim_status ON claim(status);
CREATE INDEX idx_claim_assigned ON claim(assigned_to);
CREATE INDEX idx_claim_created ON claim(created_at DESC);
CREATE INDEX idx_notif_pref_customer ON notification_preference(customer_id);
