-- =============================================
-- Insurance System - Initial Schema Migration
-- Sprint 1: Core Infrastructure
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- TABLE: customer
-- =============================================
CREATE TABLE IF NOT EXISTS customer (
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
    kyc_status        VARCHAR(20) DEFAULT 'pending',
    kyc_data          JSONB,
    avatar_url        VARCHAR(500),
    language          VARCHAR(5) DEFAULT 'vi',
    status            VARCHAR(20) DEFAULT 'active',
    role              VARCHAR(20) DEFAULT 'customer',
    email_verified    BOOLEAN DEFAULT FALSE,
    phone_verified    BOOLEAN DEFAULT FALSE,
    last_login_at     TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customer_email ON customer(email);
CREATE INDEX idx_customer_phone ON customer(phone);
CREATE INDEX idx_customer_status ON customer(status);

-- =============================================
-- TABLE: customer_social_account
-- =============================================
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
);

CREATE INDEX idx_social_customer ON customer_social_account(customer_id);

-- =============================================
-- TABLE: session
-- =============================================
CREATE TABLE IF NOT EXISTS session (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL,
    device_info     VARCHAR(255),
    ip_address      VARCHAR(45),
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_customer ON session(customer_id);
CREATE INDEX idx_session_token ON session(refresh_token);

-- =============================================
-- TABLE: category
-- =============================================
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
);

CREATE INDEX idx_category_slug ON category(slug);
CREATE INDEX idx_category_parent ON category(parent_id);

-- =============================================
-- TABLE: insurer
-- =============================================
CREATE TABLE IF NOT EXISTS insurer (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        VARCHAR(500),
    website         VARCHAR(255),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    api_config      JSONB,
    status          VARCHAR(20) DEFAULT 'active',
    rating          FLOAT DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insurer_code ON insurer(code);
CREATE INDEX idx_insurer_slug ON insurer(slug);

-- =============================================
-- TABLE: product
-- =============================================
CREATE TABLE IF NOT EXISTS product (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL UNIQUE,
    category_id         UUID NOT NULL REFERENCES category(id),
    insurer_id          UUID NOT NULL REFERENCES insurer(id),
    description         TEXT,
    short_description   VARCHAR(500),
    benefits            JSONB,
    exclusions          JSONB,
    pricing_rules       JSONB,
    eligibility         JSONB,
    terms_url           VARCHAR(500),
    brochure_url        VARCHAR(500),
    min_age             INTEGER DEFAULT 0,
    max_age             INTEGER DEFAULT 100,
    min_premium         DECIMAL(15,2) DEFAULT 0,
    max_premium         DECIMAL(15,2),
    rating              FLOAT DEFAULT 0,
    review_count        INTEGER DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'active',
    sort_order          INTEGER DEFAULT 0,
    metadata            JSONB,
    is_featured         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_slug ON product(slug);
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_insurer ON product(insurer_id);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_featured ON product(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_product_name_trgm ON product USING gin (name gin_trgm_ops);
