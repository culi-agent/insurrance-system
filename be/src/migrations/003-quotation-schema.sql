-- =============================================
-- Quotation Table - Sprint 1: Quote Engine
-- =============================================

CREATE TABLE IF NOT EXISTS quotation (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number        VARCHAR(50) NOT NULL UNIQUE,
    customer_id         UUID REFERENCES customer(id) ON DELETE SET NULL,
    product_id          UUID NOT NULL REFERENCES product(id),
    insurer_id          UUID NOT NULL REFERENCES insurer(id),
    insurance_type      VARCHAR(50) NOT NULL,
    input_data          JSONB NOT NULL,
    coverage_options    JSONB NOT NULL,
    premium             DECIMAL(15,2) NOT NULL,
    base_premium        DECIMAL(15,2) NOT NULL,
    discount            DECIMAL(15,2),
    tax                 DECIMAL(15,2),
    total_premium       DECIMAL(15,2) NOT NULL,
    premium_breakdown   JSONB,
    status              VARCHAR(20) DEFAULT 'pending',
    valid_until         TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotation_number ON quotation(quote_number);
CREATE INDEX idx_quotation_customer ON quotation(customer_id);
CREATE INDEX idx_quotation_status ON quotation(status);
CREATE INDEX idx_quotation_type ON quotation(insurance_type);
CREATE INDEX idx_quotation_created ON quotation(created_at DESC);
