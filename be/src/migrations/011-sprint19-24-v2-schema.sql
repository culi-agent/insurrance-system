-- ============================================================
-- SPRINT 19-24: V2.0 Phase Database Schema
-- B2B, API v2, White-label, Loyalty, Security, BI Analytics
-- ============================================================

-- ============================================================
-- SPRINT 19: Enterprise / B2B
-- ============================================================

-- Enterprise Account
CREATE TABLE IF NOT EXISTS enterprise_account (
  id UUID PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  tax_code VARCHAR(50) NOT NULL UNIQUE,
  business_type VARCHAR(30) NOT NULL,
  industry VARCHAR(100),
  company_size VARCHAR(20) NOT NULL,
  address JSONB DEFAULT '{}',
  contact_person VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  employee_count INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pending_verification',
  plan VARCHAR(20) DEFAULT 'basic',
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enterprise Employees
CREATE TABLE IF NOT EXISTS enterprise_employee (
  id UUID PRIMARY KEY,
  enterprise_id UUID NOT NULL REFERENCES enterprise_account(id),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  id_number VARCHAR(30),
  department VARCHAR(100),
  position VARCHAR(100),
  join_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Insurance Quotes
CREATE TABLE IF NOT EXISTS group_insurance_quote (
  id UUID PRIMARY KEY,
  enterprise_id UUID NOT NULL REFERENCES enterprise_account(id),
  insurance_type VARCHAR(50) NOT NULL,
  plan_level VARCHAR(20) NOT NULL,
  employee_count INT NOT NULL,
  employee_ids JSONB DEFAULT '[]',
  coverage_options JSONB DEFAULT '{}',
  base_premium_per_person NUMERIC(15,2),
  volume_discount_rate NUMERIC(5,4) DEFAULT 0,
  total_premium NUMERIC(15,2),
  discounted_premium NUMERIC(15,2),
  payment_frequency VARCHAR(20),
  include_dependents BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'valid',
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enterprise Orders (bulk purchases)
CREATE TABLE IF NOT EXISTS enterprise_order (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  enterprise_id UUID NOT NULL REFERENCES enterprise_account(id),
  quote_id UUID REFERENCES group_insurance_quote(id),
  employee_count INT DEFAULT 0,
  policies_issued INT DEFAULT 0,
  total_amount NUMERIC(15,2),
  payment_method VARCHAR(30),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enterprise Invoices
CREATE TABLE IF NOT EXISTS enterprise_invoice (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  enterprise_id UUID NOT NULL REFERENCES enterprise_account(id),
  order_id UUID REFERENCES enterprise_order(id),
  amount NUMERIC(15,2) NOT NULL,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  due_date DATE,
  paid_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  po_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add enterprise_id to customer and policy tables
ALTER TABLE customer ADD COLUMN IF NOT EXISTS enterprise_id UUID REFERENCES enterprise_account(id);
ALTER TABLE customer ADD COLUMN IF NOT EXISTS enterprise_role VARCHAR(20);
ALTER TABLE policy ADD COLUMN IF NOT EXISTS enterprise_id UUID REFERENCES enterprise_account(id);

-- ============================================================
-- SPRINT 20: Business Insurance & API v2
-- ============================================================

-- Business Insurance Quotes
CREATE TABLE IF NOT EXISTS business_insurance_quote (
  id UUID PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprise_account(id),
  quote_type VARCHAR(30) NOT NULL, -- property, liability, interruption
  input_data JSONB NOT NULL DEFAULT '{}',
  annual_premium NUMERIC(15,2),
  status VARCHAR(20) DEFAULT 'valid',
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Partners
CREATE TABLE IF NOT EXISTS api_partner (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  api_secret_hash VARCHAR(255) NOT NULL,
  webhook_url TEXT,
  rate_limit INT DEFAULT 1000,
  scopes JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  environment VARCHAR(20) NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Usage Log
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES api_partner(id),
  endpoint VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT,
  response_time_ms INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE IF NOT EXISTS webhook_event (
  id UUID PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES api_partner(id),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  signature VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP,
  delivered_at TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SPRINT 21: White-label & Bancassurance
-- ============================================================

-- White-label Configuration
CREATE TABLE IF NOT EXISTS whitelabel_config (
  id UUID PRIMARY KEY,
  partner_id VARCHAR(255),
  partner_name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  branding JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  contact JSONB DEFAULT '{}',
  seo JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bancassurance Partners
CREATE TABLE IF NOT EXISTS bancassurance_partner (
  id UUID PRIMARY KEY,
  bank_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(50) NOT NULL UNIQUE,
  integration_type VARCHAR(20) NOT NULL DEFAULT 'api',
  api_endpoint TEXT,
  commission_rate NUMERIC(5,4) DEFAULT 0.15,
  products JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bancassurance Sales
CREATE TABLE IF NOT EXISTS bancassurance_sale (
  id UUID PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES bancassurance_partner(id),
  bank_code VARCHAR(50) NOT NULL,
  customer_data JSONB NOT NULL DEFAULT '{}',
  product_id UUID,
  premium_amount NUMERIC(15,2),
  commission_amount NUMERIC(15,2),
  policy_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SPRINT 22: Loyalty, Chatbot, Surveys, Fraud Detection
-- ============================================================

-- Loyalty Account
CREATE TABLE IF NOT EXISTS loyalty_account (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES customer(id),
  total_points INT DEFAULT 0,
  available_points INT DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze',
  lifetime_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transaction (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  type VARCHAR(20) NOT NULL, -- earn, redeem, expire, bonus, adjust
  points INT NOT NULL,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty Badges
CREATE TABLE IF NOT EXISTS loyalty_badge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  category VARCHAR(50),
  criteria JSONB DEFAULT '{}',
  points_reward INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Badges (earned)
CREATE TABLE IF NOT EXISTS customer_badge (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  badge_id UUID NOT NULL REFERENCES loyalty_badge(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, badge_id)
);

-- Loyalty Redemption Options
CREATE TABLE IF NOT EXISTS loyalty_redemption_option (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  category VARCHAR(20) NOT NULL, -- discount, gift, upgrade, cashback
  value NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty Rewards (redeemed)
CREATE TABLE IF NOT EXISTS loyalty_reward (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  option_id UUID REFERENCES loyalty_redemption_option(id),
  reward_type VARCHAR(20),
  reward_value NUMERIC(15,2),
  code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fraud Analysis
CREATE TABLE IF NOT EXISTS fraud_analysis (
  id UUID PRIMARY KEY,
  claim_id UUID NOT NULL UNIQUE REFERENCES claim(id),
  overall_score INT DEFAULT 0,
  risk_level VARCHAR(20) DEFAULT 'low',
  flags JSONB DEFAULT '[]',
  recommendation VARCHAR(30),
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_session (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customer(id),
  status VARCHAR(20) DEFAULT 'active',
  topic VARCHAR(100),
  satisfaction_rating INT,
  feedback TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_message (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_session(id),
  customer_id UUID,
  role VARCHAR(10) NOT NULL, -- user, bot, agent
  content TEXT NOT NULL,
  intent VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Surveys
CREATE TABLE IF NOT EXISTS survey (
  id UUID PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- nps, csat, ces, custom
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  trigger_event VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_response (
  id UUID PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES survey(id),
  customer_id UUID NOT NULL REFERENCES customer(id),
  answers JSONB NOT NULL DEFAULT '[]',
  nps_score INT,
  csat_score INT,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add verification columns to claim_document
ALTER TABLE claim_document ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20);
ALTER TABLE claim_document ADD COLUMN IF NOT EXISTS verification_confidence INT;
ALTER TABLE claim_document ADD COLUMN IF NOT EXISTS verification_issues JSONB DEFAULT '[]';

-- ============================================================
-- SPRINT 23-24: Performance Indexes & Additional Tables
-- ============================================================

-- Enterprise indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_tax_code ON enterprise_account(tax_code);
CREATE INDEX IF NOT EXISTS idx_enterprise_status ON enterprise_account(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_emp_enterprise ON enterprise_employee(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_emp_status ON enterprise_employee(enterprise_id, status);
CREATE INDEX IF NOT EXISTS idx_enterprise_emp_dept ON enterprise_employee(enterprise_id, department);
CREATE INDEX IF NOT EXISTS idx_group_quote_enterprise ON group_insurance_quote(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_order_enterprise ON enterprise_order(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_invoice_enterprise ON enterprise_invoice(enterprise_id, status);
CREATE INDEX IF NOT EXISTS idx_customer_enterprise ON customer(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_policy_enterprise ON policy(enterprise_id);

-- API v2 indexes
CREATE INDEX IF NOT EXISTS idx_api_partner_key ON api_partner(api_key);
CREATE INDEX IF NOT EXISTS idx_api_partner_status ON api_partner(status);
CREATE INDEX IF NOT EXISTS idx_api_usage_partner ON api_usage_log(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_log(endpoint, method);
CREATE INDEX IF NOT EXISTS idx_webhook_partner ON webhook_event(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_webhook_status ON webhook_event(status, created_at);

-- White-label indexes
CREATE INDEX IF NOT EXISTS idx_whitelabel_domain ON whitelabel_config(domain);
CREATE INDEX IF NOT EXISTS idx_bancassurance_code ON bancassurance_partner(bank_code);
CREATE INDEX IF NOT EXISTS idx_bancassurance_sale_partner ON bancassurance_sale(partner_id);

-- Loyalty indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_customer ON loyalty_account(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tier ON loyalty_account(tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_customer ON loyalty_transaction(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_type ON loyalty_transaction(type);
CREATE INDEX IF NOT EXISTS idx_customer_badge_customer ON customer_badge(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_reward_customer ON loyalty_reward(customer_id, status);

-- Fraud indexes
CREATE INDEX IF NOT EXISTS idx_fraud_claim ON fraud_analysis(claim_id);
CREATE INDEX IF NOT EXISTS idx_fraud_risk ON fraud_analysis(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_score ON fraud_analysis(overall_score DESC);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_session_customer ON chat_session(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_status ON chat_session(status);
CREATE INDEX IF NOT EXISTS idx_chat_message_session ON chat_message(session_id, created_at);

-- Survey indexes
CREATE INDEX IF NOT EXISTS idx_survey_trigger ON survey(trigger_event, status);
CREATE INDEX IF NOT EXISTS idx_survey_response_survey ON survey_response(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_customer ON survey_response(customer_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_nps ON survey_response(nps_score) WHERE nps_score IS NOT NULL;

-- Business insurance index
CREATE INDEX IF NOT EXISTS idx_biz_quote_enterprise ON business_insurance_quote(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_biz_quote_type ON business_insurance_quote(quote_type, status);

-- Partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_active_rewards ON loyalty_reward(customer_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_api_partner_active ON api_partner(api_key) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_enterprise_active ON enterprise_account(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_webhook_pending ON webhook_event(partner_id) WHERE status = 'pending';

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed loyalty badges
INSERT INTO loyalty_badge (name, description, icon, category, criteria, points_reward) VALUES
  ('Khách hàng mới', 'Mua hợp đồng đầu tiên', 'star', 'milestone', '{"type": "policies_count", "value": 1}', 100),
  ('Nhà bảo vệ', 'Sở hữu 3 loại bảo hiểm khác nhau', 'shield', 'diversity', '{"type": "products_diversity", "value": 3}', 500),
  ('Khách hàng trung thành', 'Thành viên trên 12 tháng', 'heart', 'tenure', '{"type": "tenure_months", "value": 12}', 300),
  ('Đại sứ', 'Giới thiệu 5 bạn bè thành công', 'users', 'referral', '{"type": "referrals_count", "value": 5}', 1000),
  ('VIP', 'Tổng phí trên 50 triệu', 'crown', 'premium', '{"type": "total_premium", "value": 50000000}', 2000)
ON CONFLICT DO NOTHING;

-- Seed loyalty redemption options
INSERT INTO loyalty_redemption_option (name, description, points_required, category, value) VALUES
  ('Giảm 5% phí bảo hiểm', 'Áp dụng cho lần mua tiếp theo', 500, 'discount', 5),
  ('Giảm 10% phí bảo hiểm', 'Áp dụng cho lần mua tiếp theo', 1000, 'discount', 10),
  ('Voucher 100.000đ', 'Quy đổi thành tiền mặt', 1500, 'cashback', 100000),
  ('Voucher 500.000đ', 'Quy đổi thành tiền mặt', 5000, 'cashback', 500000),
  ('Nâng cấp gói Premium', 'Nâng cấp gói bảo hiểm 1 bậc', 3000, 'upgrade', 1),
  ('Quà tặng đặc biệt', 'Quà tặng từ đối tác', 2000, 'gift', 200000)
ON CONFLICT DO NOTHING;

-- Seed default surveys
INSERT INTO survey (id, type, title, questions, trigger_event, status) VALUES
  (gen_random_uuid(), 'nps', 'Mức độ hài lòng chung', '[{"id": "q1", "text": "Trên thang 0-10, bạn có giới thiệu chúng tôi cho bạn bè?", "type": "scale", "required": true}, {"id": "q2", "text": "Bạn có góp ý gì để chúng tôi cải thiện?", "type": "text", "required": false}]', 'policy_purchased', 'active'),
  (gen_random_uuid(), 'csat', 'Đánh giá dịch vụ bồi thường', '[{"id": "q1", "text": "Bạn đánh giá trải nghiệm bồi thường bao nhiêu sao?", "type": "rating", "required": true}, {"id": "q2", "text": "Điều gì bạn muốn cải thiện?", "type": "text", "required": false}]', 'claim_settled', 'active')
ON CONFLICT DO NOTHING;
