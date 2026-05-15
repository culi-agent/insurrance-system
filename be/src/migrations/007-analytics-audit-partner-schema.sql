-- =============================================
-- Sprint 12: Analytics, Audit Logs & Partner Management Schema
-- =============================================

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL,
    user_email          VARCHAR(255),
    user_role           VARCHAR(30),
    action              VARCHAR(50) NOT NULL,
    resource_type       VARCHAR(50) NOT NULL,
    resource_id         UUID,
    details             JSONB DEFAULT '{}',
    ip_address          VARCHAR(50),
    user_agent          TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner/Insurer management table
CREATE TABLE IF NOT EXISTS partner (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(50) NOT NULL UNIQUE,
    type                VARCHAR(30) NOT NULL DEFAULT 'insurer',
    
    -- Contact
    contact_name        VARCHAR(200),
    contact_email       VARCHAR(255),
    contact_phone       VARCHAR(20),
    
    -- Integration
    api_endpoint        VARCHAR(500),
    commission_rate     DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status              VARCHAR(30) DEFAULT 'active',
    config              JSONB DEFAULT '{}',
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_partner_code ON partner(code);
CREATE INDEX idx_partner_type ON partner(type);
CREATE INDEX idx_partner_status ON partner(status);

-- Seed partner data (insurers)
INSERT INTO partner (id, name, code, type, commission_rate, status) VALUES
    (uuid_generate_v4(), 'Bảo Minh', 'bao-minh', 'insurer', 15.0, 'active'),
    (uuid_generate_v4(), 'Bảo Việt', 'bao-viet', 'insurer', 12.5, 'active'),
    (uuid_generate_v4(), 'PVI', 'pvi', 'insurer', 14.0, 'active'),
    (uuid_generate_v4(), 'Dai-ichi Life', 'dai-ichi', 'insurer', 18.0, 'active'),
    (uuid_generate_v4(), 'Manulife', 'manulife', 'insurer', 20.0, 'active')
ON CONFLICT (code) DO NOTHING;
