-- =============================================
-- Sprint 14: Installment Payment & Recommendation Schema
-- =============================================

-- Installment payment plans
CREATE TABLE IF NOT EXISTS installment_plan (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id           UUID NOT NULL REFERENCES policy(id),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    total_amount        DECIMAL(15,2) NOT NULL,
    frequency           VARCHAR(20) NOT NULL,
    total_installments  INT NOT NULL,
    paid_installments   INT DEFAULT 0,
    next_payment_date   DATE,
    next_payment_amount DECIMAL(15,2),
    modal_factor        DECIMAL(5,4) DEFAULT 1.0,
    installments        JSONB DEFAULT '[]',
    status              VARCHAR(30) DEFAULT 'active',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation history (for ML training)
CREATE TABLE IF NOT EXISTS recommendation_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id         UUID NOT NULL REFERENCES customer(id),
    product_id          VARCHAR(100),
    insurance_type      VARCHAR(50),
    score               INT,
    reason              TEXT,
    action              VARCHAR(20) DEFAULT 'shown',
    clicked_at          TIMESTAMP WITH TIME ZONE,
    purchased_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer attributes for recommendations
ALTER TABLE customer ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS dependents INT DEFAULT 0;
ALTER TABLE customer ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);

-- Indexes
CREATE INDEX idx_installment_policy ON installment_plan(policy_id);
CREATE INDEX idx_installment_customer ON installment_plan(customer_id);
CREATE INDEX idx_installment_status ON installment_plan(status);
CREATE INDEX idx_installment_next_date ON installment_plan(next_payment_date);
CREATE INDEX idx_recommendation_log_customer ON recommendation_log(customer_id);
CREATE INDEX idx_recommendation_log_action ON recommendation_log(action);
