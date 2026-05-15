# Seed Data - Dữ Liệu Khởi Tạo

---

## 1. Tổng quan

Tài liệu này định nghĩa dữ liệu seed ban đầu cho hệ thống, bao gồm dữ liệu tham chiếu (reference data), dữ liệu test, và quy trình seeding cho các môi trường khác nhau.

---

## 2. Seed Strategy

### 2.1. Environments

| Environment | Seed Type | Data Volume | Sensitive Data |
|-------------|-----------|-------------|----------------|
| Development | Full (reference + fake data) | ~1000 records/table | Fake PII |
| Staging | Reference + realistic volume | ~10000 records/table | Anonymized from prod |
| Production | Reference data only | Minimal | Real credentials |
| Testing | Minimal + specific scenarios | ~100 records/table | Fake PII |

### 2.2. Execution Order

```
1. category (independent)
2. insurer (independent)
3. admin_user (independent)
4. product (depends on: category, insurer)
5. customer (independent, dev/staging only)
6. quote (depends on: customer, product - dev/staging only)
7. policy (depends on: customer, product - dev/staging only)
8. claim (depends on: policy - dev/staging only)
9. payment (depends on: policy - dev/staging only)
```

---

## 3. Reference Data (All Environments)

### 3.1. Categories

```sql
-- Seed: categories (danh mục sản phẩm bảo hiểm)
INSERT INTO category (id, name, slug, description, icon, parent_id, sort_order, is_active) VALUES
-- Root categories
('11111111-1111-1111-1111-000000000001', 'Bảo hiểm Nhân thọ', 'life-insurance', 'Các sản phẩm bảo hiểm nhân thọ', 'heart', NULL, 1, true),
('11111111-1111-1111-1111-000000000002', 'Bảo hiểm Sức khỏe', 'health-insurance', 'Các sản phẩm bảo hiểm sức khỏe', 'health', NULL, 2, true),
('11111111-1111-1111-1111-000000000003', 'Bảo hiểm Xe cơ giới', 'motor-insurance', 'Bảo hiểm xe máy và ô tô', 'car', NULL, 3, true),
('11111111-1111-1111-1111-000000000004', 'Bảo hiểm Tài sản', 'property-insurance', 'Bảo hiểm nhà ở và tài sản', 'home', NULL, 4, true),
('11111111-1111-1111-1111-000000000005', 'Bảo hiểm Du lịch', 'travel-insurance', 'Bảo hiểm du lịch trong và ngoài nước', 'plane', NULL, 5, true),
('11111111-1111-1111-1111-000000000006', 'Bảo hiểm Trách nhiệm', 'liability-insurance', 'Bảo hiểm trách nhiệm dân sự', 'shield', NULL, 6, true),
('11111111-1111-1111-1111-000000000007', 'Bảo hiểm Doanh nghiệp', 'business-insurance', 'Giải pháp bảo hiểm cho doanh nghiệp', 'building', NULL, 7, true),

-- Sub-categories: Nhân thọ
('11111111-1111-1111-1111-000000000101', 'Bảo hiểm Tử vong', 'term-life', 'Bảo hiểm tử vong có thời hạn', 'term', '11111111-1111-1111-1111-000000000001', 1, true),
('11111111-1111-1111-1111-000000000102', 'Bảo hiểm Hỗn hợp', 'endowment', 'Bảo hiểm hỗn hợp (sinh kỳ + tử kỳ)', 'endow', '11111111-1111-1111-1111-000000000001', 2, true),
('11111111-1111-1111-1111-000000000103', 'Liên kết đầu tư', 'unit-linked', 'Bảo hiểm liên kết quỹ đầu tư', 'invest', '11111111-1111-1111-1111-000000000001', 3, true),

-- Sub-categories: Sức khỏe
('11111111-1111-1111-1111-000000000201', 'Nội trú', 'inpatient', 'Bảo hiểm nằm viện', 'bed', '11111111-1111-1111-1111-000000000002', 1, true),
('11111111-1111-1111-1111-000000000202', 'Ngoại trú', 'outpatient', 'Bảo hiểm khám ngoại trú', 'clinic', '11111111-1111-1111-1111-000000000002', 2, true),
('11111111-1111-1111-1111-000000000203', 'Bệnh hiểm nghèo', 'critical-illness', 'Bảo hiểm bệnh hiểm nghèo', 'alert', '11111111-1111-1111-1111-000000000002', 3, true),
('11111111-1111-1111-1111-000000000204', 'Thai sản', 'maternity', 'Bảo hiểm thai sản', 'baby', '11111111-1111-1111-1111-000000000002', 4, true),

-- Sub-categories: Xe cơ giới
('11111111-1111-1111-1111-000000000301', 'TNDS bắt buộc', 'compulsory-motor', 'Bảo hiểm TNDS bắt buộc xe cơ giới', 'mandatory', '11111111-1111-1111-1111-000000000003', 1, true),
('11111111-1111-1111-1111-000000000302', 'Vật chất xe', 'comprehensive-motor', 'Bảo hiểm vật chất xe toàn diện', 'full', '11111111-1111-1111-1111-000000000003', 2, true),
('11111111-1111-1111-1111-000000000303', 'Người ngồi trên xe', 'passenger', 'Bảo hiểm tai nạn người ngồi trên xe', 'person', '11111111-1111-1111-1111-000000000003', 3, true),

-- Sub-categories: Du lịch
('11111111-1111-1111-1111-000000000501', 'Du lịch trong nước', 'domestic-travel', 'Bảo hiểm du lịch nội địa', 'domestic', '11111111-1111-1111-1111-000000000005', 1, true),
('11111111-1111-1111-1111-000000000502', 'Du lịch quốc tế', 'international-travel', 'Bảo hiểm du lịch quốc tế', 'international', '11111111-1111-1111-1111-000000000005', 2, true);
```

### 3.2. Insurers

```sql
-- Seed: insurers (đối tác bảo hiểm)
INSERT INTO insurer (id, name, code, logo_url, description, status, commission_rate) VALUES
('22222222-2222-2222-2222-000000000001', 'Bảo Việt Nhân Thọ', 'BVNT', '/logos/bao-viet.png', 'Tập đoàn Bảo Việt - CTCP Bảo hiểm nhân thọ lớn nhất Việt Nam', 'active',
  '{"life": 35.0, "health_individual": 25.0, "health_group": 18.0}'::jsonb),

('22222222-2222-2222-2222-000000000002', 'Manulife Việt Nam', 'MNLF', '/logos/manulife.png', 'Manulife - Tập đoàn tài chính bảo hiểm hàng đầu Canada', 'active',
  '{"life": 38.0, "health_individual": 28.0, "critical_illness": 30.0}'::jsonb),

('22222222-2222-2222-2222-000000000003', 'Prudential Việt Nam', 'PRDL', '/logos/prudential.png', 'Prudential - Tập đoàn bảo hiểm Anh Quốc', 'active',
  '{"life": 36.0, "health_individual": 26.0, "unit_linked": 20.0}'::jsonb),

('22222222-2222-2222-2222-000000000004', 'PVI Insurance', 'PVI', '/logos/pvi.png', 'PVI - Bảo hiểm phi nhân thọ lớn nhất Việt Nam', 'active',
  '{"motor_compulsory": 15.0, "motor_comprehensive": 22.0, "property": 20.0, "travel": 30.0}'::jsonb),

('22222222-2222-2222-2222-000000000005', 'Bảo Minh', 'BMI', '/logos/bao-minh.png', 'Tổng CTCP Bảo Minh - BH phi nhân thọ uy tín', 'active',
  '{"motor_compulsory": 18.0, "motor_comprehensive": 24.0, "property": 22.0, "travel": 28.0}'::jsonb),

('22222222-2222-2222-2222-000000000006', 'Liberty Insurance', 'LBRT', '/logos/liberty.png', 'Liberty Mutual - Tập đoàn bảo hiểm Hoa Kỳ', 'active',
  '{"motor_comprehensive": 25.0, "health_individual": 27.0, "travel": 32.0}'::jsonb),

('22222222-2222-2222-2222-000000000007', 'AIA Việt Nam', 'AIA', '/logos/aia.png', 'AIA - Tập đoàn bảo hiểm nhân thọ lớn nhất Châu Á', 'active',
  '{"life": 37.0, "health_individual": 27.0, "critical_illness": 32.0}'::jsonb),

('22222222-2222-2222-2222-000000000008', 'Bảo hiểm BSH', 'BSH', '/logos/bsh.png', 'BSH - Bảo hiểm Sài Gòn - Hà Nội', 'active',
  '{"motor_compulsory": 16.0, "motor_comprehensive": 20.0, "travel": 25.0}'::jsonb);
```

### 3.3. Admin Users

```sql
-- Seed: admin users (tài khoản quản trị)
-- Password cho dev/staging: Admin@123456 (bcrypt hash)
INSERT INTO admin_user (id, email, password_hash, full_name, role, is_active, mfa_enabled) VALUES
('33333333-3333-3333-3333-000000000001', 'superadmin@insurance.vn',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'System Admin', 'super_admin', true, true),

('33333333-3333-3333-3333-000000000002', 'admin@insurance.vn',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Nguyễn Quản Trị', 'admin', true, false),

('33333333-3333-3333-3333-000000000003', 'claims@insurance.vn',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Trần Claims Handler', 'claims_handler', true, false),

('33333333-3333-3333-3333-000000000004', 'finance@insurance.vn',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Lê Tài Chính', 'finance', true, false),

('33333333-3333-3333-3333-000000000005', 'operator@insurance.vn',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Phạm Vận Hành', 'operator', true, false);
```



### 3.4. Sample Products

```sql
-- Seed: products (sản phẩm mẫu)
INSERT INTO product (id, category_id, insurer_id, name, slug, short_description, min_age, max_age, min_sum_insured, max_sum_insured, status, benefits, pricing_rules) VALUES

-- Motor Insurance - TNDS bắt buộc
('44444444-4444-4444-4444-000000000001',
  '11111111-1111-1111-1111-000000000301', -- TNDS bắt buộc
  '22222222-2222-2222-2222-000000000004', -- PVI
  'TNDS Xe máy PVI', 'tnds-xe-may-pvi',
  'Bảo hiểm trách nhiệm dân sự bắt buộc xe máy', 18, 70, 10000000, 150000000, 'active',
  '[{"name":"Thiệt hại về người","coverage_amount":150000000,"conditions":["Tối đa 150 triệu/người/vụ"]},{"name":"Thiệt hại về tài sản","coverage_amount":50000000,"conditions":["Tối đa 50 triệu/vụ"]}]'::jsonb,
  '{"base_rate":66000,"currency":"VND","rating_factors":[{"factor":"vehicle_type","values":[{"value":"motorcycle","multiplier":1.0},{"value":"electric","multiplier":0.9}]}]}'::jsonb),

-- Health Insurance
('44444444-4444-4444-4444-000000000002',
  '11111111-1111-1111-1111-000000000201', -- Nội trú
  '22222222-2222-2222-2222-000000000001', -- Bảo Việt
  'An Tâm Sống Khỏe', 'an-tam-song-khoe',
  'Bảo hiểm sức khỏe toàn diện nội trú + ngoại trú', 0, 65, 100000000, 2000000000, 'active',
  '[{"name":"Nội trú","coverage_amount":1000000000,"conditions":["Phòng đơn tiêu chuẩn"]},{"name":"Phẫu thuật","coverage_amount":500000000,"conditions":["Bao gồm phẫu thuật trong ngày"]},{"name":"Ngoại trú","coverage_amount":30000000,"conditions":["Tối đa 500K/lần khám"]}]'::jsonb,
  '{"base_rate":5000000,"currency":"VND","rating_factors":[{"factor":"age","ranges":[{"min":0,"max":17,"multiplier":0.8},{"min":18,"max":30,"multiplier":1.0},{"min":31,"max":45,"multiplier":1.4},{"min":46,"max":55,"multiplier":2.0},{"min":56,"max":65,"multiplier":3.0}]},{"factor":"smoking","values":[{"value":true,"multiplier":1.4},{"value":false,"multiplier":1.0}]}]}'::jsonb),

-- Travel Insurance
('44444444-4444-4444-4444-000000000003',
  '11111111-1111-1111-1111-000000000502', -- Du lịch quốc tế
  '22222222-2222-2222-2222-000000000005', -- Bảo Minh
  'Travel Care International', 'travel-care-international',
  'Bảo hiểm du lịch quốc tế toàn cầu', 1, 70, 500000000, 3000000000, 'active',
  '[{"name":"Chi phí y tế","coverage_amount":2000000000,"conditions":["Toàn cầu, 24/7"]},{"name":"Hủy chuyến","coverage_amount":50000000,"conditions":["Do bệnh, tai nạn"]},{"name":"Mất hành lý","coverage_amount":30000000,"conditions":["Tối đa 10 triệu/món"]}]'::jsonb,
  '{"base_rate":150000,"currency":"VND","unit":"per_day","rating_factors":[{"factor":"destination","values":[{"value":"asia","multiplier":1.0},{"value":"europe","multiplier":1.5},{"value":"americas","multiplier":1.8}]},{"factor":"age","ranges":[{"min":1,"max":17,"multiplier":0.7},{"min":18,"max":60,"multiplier":1.0},{"min":61,"max":70,"multiplier":2.5}]}]}'::jsonb),

-- Life Insurance
('44444444-4444-4444-4444-000000000004',
  '11111111-1111-1111-1111-000000000101', -- Term life
  '22222222-2222-2222-2222-000000000007', -- AIA
  'AIA Tương Lai Vững Chắc', 'aia-tuong-lai-vung-chac',
  'Bảo hiểm nhân thọ có thời hạn - phí thấp, bảo vệ cao', 18, 55, 500000000, 10000000000, 'active',
  '[{"name":"Tử vong mọi nguyên nhân","coverage_amount":null,"conditions":["100% STBH"]},{"name":"Tử vong do tai nạn","coverage_amount":null,"conditions":["200% STBH"]},{"name":"Thương tật toàn bộ vĩnh viễn","coverage_amount":null,"conditions":["100% STBH"]}]'::jsonb,
  '{"base_rate":1500000,"currency":"VND","per_billion_sum_insured":true,"rating_factors":[{"factor":"age","ranges":[{"min":18,"max":30,"multiplier":1.0},{"min":31,"max":40,"multiplier":1.5},{"min":41,"max":50,"multiplier":2.5},{"min":51,"max":55,"multiplier":4.0}]},{"factor":"gender","values":[{"value":"male","multiplier":1.2},{"value":"female","multiplier":1.0}]},{"factor":"smoking","values":[{"value":true,"multiplier":1.5},{"value":false,"multiplier":1.0}]}]}'::jsonb);
```

---

## 4. Development Seed Data

### 4.1. Sample Customers (Dev/Staging Only)

```sql
-- Seed: customers (dữ liệu giả cho dev)
-- Password: User@123456
INSERT INTO customer (id, email, phone, password_hash, full_name, date_of_birth, gender, id_number, kyc_status, status, email_verified, phone_verified) VALUES
('55555555-5555-5555-5555-000000000001', 'minh.nguyen@gmail.com', '+84901234001',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Nguyễn Văn Minh', '1995-03-15', 'male', '079095001234', 'verified', 'active', true, true),

('55555555-5555-5555-5555-000000000002', 'huong.tran@gmail.com', '+84901234002',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Trần Thị Hương', '1990-08-22', 'female', '079090005678', 'verified', 'active', true, true),

('55555555-5555-5555-5555-000000000003', 'tuan.le@gmail.com', '+84901234003',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Lê Anh Tuấn', '1984-11-05', 'male', '079084009012', 'verified', 'active', true, true),

('55555555-5555-5555-5555-000000000004', 'linh.pham@gmail.com', '+84901234004',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Phạm Thùy Linh', '1998-01-30', 'female', '079098003456', 'pending', 'active', true, false),

('55555555-5555-5555-5555-000000000005', 'duc.vo@gmail.com', '+84901234005',
  '$2b$12$LJ3m4sMN6X9Xr8kVJ5L5XeJhR7YKmGKW9t1mG8x7z3N5v1kK6K4W',
  'Võ Minh Đức', '1992-06-18', 'male', '079092007890', 'verified', 'active', true, true);
```

### 4.2. Sample Policies (Dev/Staging Only)

```sql
-- Seed: policies
INSERT INTO policy (id, customer_id, product_id, insurer_id, policy_number, status, start_date, end_date, issued_date, premium_total, premium_frequency, sum_insured, auto_renewal) VALUES
('66666666-6666-6666-6666-000000000001',
  '55555555-5555-5555-5555-000000000001', -- Minh
  '44444444-4444-4444-4444-000000000001', -- TNDS xe máy
  '22222222-2222-2222-2222-000000000004', -- PVI
  'POL-202601-000001', 'active', '2026-01-15', '2027-01-15', '2026-01-15',
  66000, 'annual', 150000000, true),

('66666666-6666-6666-6666-000000000002',
  '55555555-5555-5555-5555-000000000001', -- Minh
  '44444444-4444-4444-4444-000000000002', -- Sức khỏe
  '22222222-2222-2222-2222-000000000001', -- Bảo Việt
  'POL-202601-000002', 'active', '2026-01-20', '2027-01-20', '2026-01-20',
  5000000, 'quarterly', 500000000, true),

('66666666-6666-6666-6666-000000000003',
  '55555555-5555-5555-5555-000000000002', -- Hương
  '44444444-4444-4444-4444-000000000004', -- Nhân thọ
  '22222222-2222-2222-2222-000000000007', -- AIA
  'POL-202602-000003', 'active', '2026-02-01', '2036-02-01', '2026-02-01',
  15000000, 'annual', 2000000000, false),

('66666666-6666-6666-6666-000000000004',
  '55555555-5555-5555-5555-000000000003', -- Tuấn
  '44444444-4444-4444-4444-000000000003', -- Travel
  '22222222-2222-2222-2222-000000000005', -- Bảo Minh
  'POL-202603-000004', 'expired', '2026-03-01', '2026-03-15', '2026-03-01',
  2250000, 'annual', 2000000000, false);
```

### 4.3. Sample Claims (Dev/Staging Only)

```sql
-- Seed: claims
INSERT INTO claim (id, policy_id, customer_id, handler_id, claim_number, type, status, priority, event_date, event_description, claimed_amount, submitted_at) VALUES
('77777777-7777-7777-7777-000000000001',
  '66666666-6666-6666-6666-000000000002', -- Policy sức khỏe Minh
  '55555555-5555-5555-5555-000000000001', -- Minh
  '33333333-3333-3333-3333-000000000003', -- Claims handler
  'CLM-202603-000001', 'health', 'under_assessment', 'medium',
  '2026-03-10', 'Nhập viện BV Chợ Rẫy do viêm phổi cấp, điều trị 5 ngày',
  15000000, '2026-03-12 08:30:00+07'),

('77777777-7777-7777-7777-000000000002',
  '66666666-6666-6666-6666-000000000001', -- Policy xe máy Minh
  '55555555-5555-5555-5555-000000000001', -- Minh
  NULL, -- Chưa assign
  'CLM-202604-000002', 'motor', 'submitted', 'low',
  '2026-04-05', 'Va chạm nhẹ tại ngã tư Lê Lợi - Pasteur, hư yếm xe',
  3000000, '2026-04-06 10:00:00+07');
```

### 4.4. Sample Payments (Dev/Staging Only)

```sql
-- Seed: payments
INSERT INTO payment (id, policy_id, customer_id, reference_number, type, amount, status, method, provider, paid_at) VALUES
('88888888-8888-8888-8888-000000000001',
  '66666666-6666-6666-6666-000000000001',
  '55555555-5555-5555-5555-000000000001',
  'PAY-PRM-20260115-X001', 'premium_payment', 66000, 'success', 'ewallet', 'momo', '2026-01-15 10:05:00+07'),

('88888888-8888-8888-8888-000000000002',
  '66666666-6666-6666-6666-000000000002',
  '55555555-5555-5555-5555-000000000001',
  'PAY-PRM-20260120-X002', 'premium_payment', 1250000, 'success', 'card', 'vnpay', '2026-01-20 14:30:00+07'),

('88888888-8888-8888-8888-000000000003',
  '66666666-6666-6666-6666-000000000003',
  '55555555-5555-5555-5555-000000000002',
  'PAY-PRM-20260201-X003', 'premium_payment', 15000000, 'success', 'bank_transfer', 'vnpay', '2026-02-01 09:00:00+07'),

('88888888-8888-8888-8888-000000000004',
  '66666666-6666-6666-6666-000000000004',
  '55555555-5555-5555-5555-000000000003',
  'PAY-PRM-20260301-X004', 'premium_payment', 2250000, 'success', 'ewallet', 'zalopay', '2026-03-01 16:45:00+07');
```

---

## 5. Seed Script (TypeORM)

### 5.1. Seed Runner

```typescript
// src/database/seeds/seed-runner.ts
import { DataSource } from "typeorm";
import { seedCategories } from "./01-categories.seed";
import { seedInsurers } from "./02-insurers.seed";
import { seedAdminUsers } from "./03-admin-users.seed";
import { seedProducts } from "./04-products.seed";
import { seedCustomers } from "./05-customers.seed";
import { seedPolicies } from "./06-policies.seed";
import { seedClaims } from "./07-claims.seed";
import { seedPayments } from "./08-payments.seed";

export async function runSeeds(dataSource: DataSource): Promise<void> {
    const env = process.env.NODE_ENV || 'development';
    
    console.log(`🌱 Running seeds for environment: ${env}`);
    
    // Reference data (all environments)
    await seedCategories(dataSource);
    await seedInsurers(dataSource);
    await seedAdminUsers(dataSource);
    await seedProducts(dataSource);
    
    // Test data (dev/staging only)
    if (env !== 'production') {
        await seedCustomers(dataSource);
        await seedPolicies(dataSource);
        await seedClaims(dataSource);
        await seedPayments(dataSource);
    }
    
    console.log(`✅ Seeds completed successfully`);
}
```

### 5.2. NPM Scripts

```json
{
  "scripts": {
    "seed": "ts-node src/database/seeds/seed-runner.ts",
    "seed:prod": "NODE_ENV=production ts-node src/database/seeds/seed-runner.ts",
    "seed:fresh": "npm run migration:run && npm run seed",
    "db:reset": "npm run schema:drop && npm run migration:run && npm run seed"
  }
}
```

---

## 6. Data Generation (Large Volume Testing)

### 6.1. Faker Script cho Load Testing

```typescript
// src/database/seeds/generate-volume-data.ts
import { faker } from '@faker-js/faker/locale/vi';

export function generateCustomers(count: number) {
    return Array.from({ length: count }, () => ({
        email: faker.internet.email(),
        phone: `+849${faker.string.numeric(8)}`,
        password_hash: '$2b$12$placeholder',
        full_name: faker.person.fullName(),
        date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender: faker.helpers.arrayElement(['male', 'female']),
        id_number: `079${faker.string.numeric(9)}`,
        kyc_status: faker.helpers.arrayElement(['pending', 'verified']),
        status: 'active',
        email_verified: true,
        phone_verified: true,
    }));
}

export function generatePolicies(customerIds: string[], productIds: string[]) {
    return customerIds.map(customerId => ({
        customer_id: customerId,
        product_id: faker.helpers.arrayElement(productIds),
        policy_number: `POL-${faker.string.numeric(6)}-${faker.string.numeric(6)}`,
        status: faker.helpers.weightedArrayElement([
            { value: 'active', weight: 60 },
            { value: 'expired', weight: 25 },
            { value: 'cancelled', weight: 10 },
            { value: 'lapsed', weight: 5 },
        ]),
        start_date: faker.date.past({ years: 2 }),
        premium_total: faker.number.int({ min: 500000, max: 50000000 }),
        sum_insured: faker.number.int({ min: 100000000, max: 5000000000 }),
    }));
}
```

### 6.2. Volume Targets for Staging

| Table | Target Records | Generation Time |
|-------|---------------|-----------------|
| customer | 100,000 | ~2 min |
| product | 200 | manual seed |
| quote | 500,000 | ~5 min |
| policy | 50,000 | ~3 min |
| claim | 10,000 | ~1 min |
| payment | 100,000 | ~3 min |
| notification | 1,000,000 | ~10 min |
| audit_log | 2,000,000 | ~15 min |
