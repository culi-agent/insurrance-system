-- Sprint 16-17-18 Database Schema & Indexes
-- Migration: 010-sprint16-17-18-schema.sql

-- ============================================================
-- SPRINT 16: Mobile, Push Notifications, Segmentation, Reports
-- ============================================================

-- Device Registration (Push Notifications)
CREATE TABLE IF NOT EXISTS device_registration (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  device_token TEXT NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  device_id VARCHAR(255) NOT NULL,
  app_version VARCHAR(20),
  os_version VARCHAR(20),
  device_model VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, device_id)
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES customer(id),
  preferences JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification History
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer RFM Scores (Segmentation)
CREATE TABLE IF NOT EXISTS customer_rfm_score (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES customer(id),
  recency_score INT NOT NULL CHECK (recency_score BETWEEN 1 AND 5),
  frequency_score INT NOT NULL CHECK (frequency_score BETWEEN 1 AND 5),
  monetary_score INT NOT NULL CHECK (monetary_score BETWEEN 1 AND 5),
  rfm_segment VARCHAR(50) NOT NULL,
  total_score INT NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Customer Segments
CREATE TABLE IF NOT EXISTS customer_segment (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'custom',
  criteria JSONB NOT NULL DEFAULT '{}',
  customer_count INT DEFAULT 0,
  avg_ltv NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Report Exports
CREATE TABLE IF NOT EXISTS report_export (
  id UUID PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL,
  format VARCHAR(10) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  size_bytes INT DEFAULT 0,
  filters JSONB DEFAULT '{}',
  generated_by UUID REFERENCES customer(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Form History (Smart Pre-fill)
CREATE TABLE IF NOT EXISTS customer_form_history (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  insurance_type VARCHAR(50) NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Partner Commission Rates
CREATE TABLE IF NOT EXISTS partner_commission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurer_id UUID NOT NULL REFERENCES insurer(id),
  insurance_type VARCHAR(50) NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(insurer_id, insurance_type)
);

-- ============================================================
-- SPRINT 17: Claims Documents, Messages, Campaigns, CMS
-- ============================================================

-- Claim Documents
CREATE TABLE IF NOT EXISTS claim_document (
  id UUID PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES claim(id),
  type VARCHAR(30) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT DEFAULT 0,
  mime_type VARCHAR(100),
  description TEXT,
  captured_at TIMESTAMP,
  location JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claim Timeline Events
CREATE TABLE IF NOT EXISTS claim_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claim(id),
  event_type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Claim Messages (Communication Thread)
CREATE TABLE IF NOT EXISTS claim_message (
  id UUID PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES claim(id),
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'handler', 'system')),
  sender_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Settings
CREATE TABLE IF NOT EXISTS customer_settings (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES customer(id),
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Account Deletion Requests
CREATE TABLE IF NOT EXISTS account_deletion_request (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(id),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Recommendation Behavior Tracking
CREATE TABLE IF NOT EXISTS recommendation_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id),
  signal_type VARCHAR(30) NOT NULL,
  insurance_type VARCHAR(50),
  product_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendation Interactions
CREATE TABLE IF NOT EXISTS recommendation_interaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id),
  recommendation_id VARCHAR(255),
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendation Log
CREATE TABLE IF NOT EXISTS recommendation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaign (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_id UUID,
  segment_id UUID,
  segment_name VARCHAR(255),
  customer_ids JSONB DEFAULT '[]',
  personalization JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  recipient_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  unsubscribed_count INT DEFAULT 0,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_template (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject_template VARCHAR(500),
  html_template TEXT,
  category VARCHAR(50),
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Send Log
CREATE TABLE IF NOT EXISTS email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaign(id),
  customer_id UUID,
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent',
  error TEXT,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  clicked_link TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Notifications
CREATE TABLE IF NOT EXISTS scheduled_notification (
  id UUID PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customer(id),
  policy_id UUID,
  channel VARCHAR(10) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  template_data JSONB NOT NULL DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CMS Pages
CREATE TABLE IF NOT EXISTS cms_page (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  category VARCHAR(20) NOT NULL DEFAULT 'page',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  meta_title VARCHAR(255),
  meta_description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CMS FAQ
CREATE TABLE IF NOT EXISTS cms_faq (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'string',
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission Payments
CREATE TABLE IF NOT EXISTS commission_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policy(id),
  insurer_id UUID REFERENCES insurer(id),
  amount NUMERIC(15,2),
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SPRINT 18: Performance Indexes
-- ============================================================

-- Core table indexes for performance
CREATE INDEX IF NOT EXISTS idx_policy_customer_id ON policy(customer_id);
CREATE INDEX IF NOT EXISTS idx_policy_insurer_id ON policy(insurer_id);
CREATE INDEX IF NOT EXISTS idx_policy_product_id ON policy(product_id);
CREATE INDEX IF NOT EXISTS idx_policy_status ON policy(status);
CREATE INDEX IF NOT EXISTS idx_policy_end_date ON policy(end_date);
CREATE INDEX IF NOT EXISTS idx_policy_created_at ON policy(created_at);
CREATE INDEX IF NOT EXISTS idx_policy_customer_status ON policy(customer_id, status);

CREATE INDEX IF NOT EXISTS idx_claim_customer_id ON claim(customer_id);
CREATE INDEX IF NOT EXISTS idx_claim_policy_id ON claim(policy_id);
CREATE INDEX IF NOT EXISTS idx_claim_insurer_id ON claim(insurer_id);
CREATE INDEX IF NOT EXISTS idx_claim_status ON claim(status);
CREATE INDEX IF NOT EXISTS idx_claim_created_at ON claim(created_at);

CREATE INDEX IF NOT EXISTS idx_quotation_customer_id ON quotation(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_product_id ON quotation(product_id);
CREATE INDEX IF NOT EXISTS idx_quotation_status ON quotation(status);
CREATE INDEX IF NOT EXISTS idx_quotation_created_at ON quotation(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_customer_id ON payment(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_paid_at ON payment(paid_at);

CREATE INDEX IF NOT EXISTS idx_purchase_order_customer_id ON purchase_order(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_status ON purchase_order(status);

CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);
CREATE INDEX IF NOT EXISTS idx_customer_created_at ON customer(created_at);

CREATE INDEX IF NOT EXISTS idx_product_insurance_type ON product(insurance_type);
CREATE INDEX IF NOT EXISTS idx_product_insurer_id ON product(insurer_id);
CREATE INDEX IF NOT EXISTS idx_product_status ON product(status);

-- New tables indexes
CREATE INDEX IF NOT EXISTS idx_device_reg_customer ON device_registration(customer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notification_history_customer ON notification_history(customer_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notification_history_created ON notification_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfm_segment ON customer_rfm_score(rfm_segment);
CREATE INDEX IF NOT EXISTS idx_claim_document_claim ON claim_document(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_message_claim ON claim_message(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_timeline_claim ON claim_timeline(claim_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notification_status ON scheduled_notification(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notification_customer ON scheduled_notification(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_status ON email_campaign(status);
CREATE INDEX IF NOT EXISTS idx_email_send_log_campaign ON email_send_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_rec_behavior_customer ON recommendation_behavior(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_page_slug ON cms_page(slug);
CREATE INDEX IF NOT EXISTS idx_cms_faq_category ON cms_faq(category, is_published);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_form_history_customer ON customer_form_history(customer_id, insurance_type);

-- Partial indexes for active records (performance boost)
CREATE INDEX IF NOT EXISTS idx_policy_active ON policy(customer_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_claim_pending ON claim(customer_id) WHERE status IN ('submitted', 'under_review', 'processing');
CREATE INDEX IF NOT EXISTS idx_scheduled_pending ON scheduled_notification(scheduled_at) WHERE status = 'pending';

-- Audit log index
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
