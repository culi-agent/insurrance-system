-- =============================================
-- Sprint 15: Home Insurance & A/B Testing Schema
-- =============================================

-- A/B Testing experiments
CREATE TABLE IF NOT EXISTS ab_experiment (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    feature_key         VARCHAR(100) NOT NULL,
    status              VARCHAR(30) DEFAULT 'draft',
    variants            JSONB NOT NULL DEFAULT '[]',
    traffic_percentage  INT DEFAULT 100,
    start_date          TIMESTAMP WITH TIME ZONE,
    end_date            TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Testing user assignments
CREATE TABLE IF NOT EXISTS ab_assignment (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id       UUID NOT NULL REFERENCES ab_experiment(id),
    user_id             VARCHAR(100) NOT NULL,
    variant_id          UUID NOT NULL,
    assigned_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(experiment_id, user_id)
);

-- A/B Testing events
CREATE TABLE IF NOT EXISTS ab_event (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id       UUID NOT NULL REFERENCES ab_experiment(id),
    variant_id          UUID NOT NULL,
    user_id             VARCHAR(100) NOT NULL,
    event_type          VARCHAR(30) NOT NULL,
    event_name          VARCHAR(100),
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ab_experiment_feature ON ab_experiment(feature_key);
CREATE INDEX idx_ab_experiment_status ON ab_experiment(status);
CREATE INDEX idx_ab_assignment_experiment ON ab_assignment(experiment_id);
CREATE INDEX idx_ab_assignment_user ON ab_assignment(user_id);
CREATE INDEX idx_ab_event_experiment ON ab_event(experiment_id);
CREATE INDEX idx_ab_event_variant ON ab_event(variant_id);
CREATE INDEX idx_ab_event_user ON ab_event(user_id);
CREATE INDEX idx_ab_event_type ON ab_event(event_type);
CREATE INDEX idx_ab_event_created ON ab_event(created_at);
