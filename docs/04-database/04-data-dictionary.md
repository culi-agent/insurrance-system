# Data Dictionary - Từ Điển Dữ Liệu

---

## 1. Tổng quan

Tài liệu này định nghĩa chi tiết từng column trong database, bao gồm kiểu dữ liệu, constraints, giá trị mặc định, mô tả nghiệp vụ và ví dụ dữ liệu.

---

## 2. Table: customer

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính, định danh duy nhất | `a1b2c3d4-...` |
| 2 | email | VARCHAR(255) | NO | - | Email đăng ký, UNIQUE | `minh@gmail.com` |
| 3 | phone | VARCHAR(20) | NO | - | SĐT format +84, UNIQUE | `+84901234567` |
| 4 | password_hash | VARCHAR(255) | NO | - | Bcrypt hash (12 rounds) | `$2b$12$...` |
| 5 | full_name | VARCHAR(100) | NO | - | Họ tên đầy đủ (Unicode) | `Nguyễn Văn Minh` |
| 6 | date_of_birth | DATE | YES | NULL | Ngày sinh | `1995-03-15` |
| 7 | gender | VARCHAR(10) | YES | NULL | Giới tính | `male` / `female` / `other` |
| 8 | id_number | VARCHAR(20) | YES | NULL | Số CCCD/CMND/Passport | `079095012345` |
| 9 | id_number_type | VARCHAR(20) | YES | 'cccd' | Loại giấy tờ tùy thân | `cccd` / `cmnd` / `passport` |
| 10 | address | JSONB | YES | NULL | Địa chỉ đầy đủ | `{"street":"...","city":"..."}` |
| 11 | kyc_status | kyc_status | YES | 'pending' | Trạng thái xác minh danh tính | `pending` / `verified` / `rejected` |
| 12 | kyc_data | JSONB | YES | NULL | Dữ liệu OCR từ eKYC | `{"confidence":0.95,...}` |
| 13 | avatar_url | VARCHAR(500) | YES | NULL | URL ảnh đại diện | `https://s3.../avatar.jpg` |
| 14 | language | VARCHAR(5) | YES | 'vi' | Ngôn ngữ ưa thích | `vi` / `en` |
| 15 | status | customer_status | YES | 'active' | Trạng thái tài khoản | `active` / `suspended` |
| 16 | email_verified | BOOLEAN | YES | FALSE | Email đã xác thực | `true` / `false` |
| 17 | phone_verified | BOOLEAN | YES | FALSE | SĐT đã xác thực | `true` / `false` |
| 18 | last_login_at | TIMESTAMPTZ | YES | NULL | Thời điểm đăng nhập gần nhất | `2026-01-15 10:30:00+07` |
| 19 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo tài khoản | `2026-01-01 08:00:00+07` |
| 20 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật gần nhất | `2026-01-15 10:30:00+07` |
| 21 | deleted_at | TIMESTAMPTZ | YES | NULL | Thời điểm xóa mềm (NULL = active) | `NULL` |

---

## 3. Table: category

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | name | VARCHAR(100) | NO | - | Tên danh mục | `Bảo hiểm Sức khỏe` |
| 3 | slug | VARCHAR(100) | NO | - | Slug URL-friendly, UNIQUE | `health-insurance` |
| 4 | description | TEXT | YES | NULL | Mô tả danh mục | `Các sản phẩm BH sức khỏe...` |
| 5 | icon | VARCHAR(50) | YES | NULL | Tên icon hoặc emoji | `health` / `🏥` |
| 6 | parent_id | UUID | YES | NULL | FK → category(id), danh mục cha | `NULL` (root) |
| 7 | sort_order | INTEGER | YES | 0 | Thứ tự hiển thị | `1`, `2`, `3` |
| 8 | is_active | BOOLEAN | YES | TRUE | Hiển thị trên website | `true` |
| 9 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-01 00:00:00+07` |
| 10 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-01 00:00:00+07` |

---

## 4. Table: insurer

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | name | VARCHAR(200) | NO | - | Tên công ty bảo hiểm | `Bảo Việt Nhân Thọ` |
| 3 | code | VARCHAR(20) | NO | - | Mã viết tắt, UNIQUE | `BVNT` |
| 4 | logo_url | VARCHAR(500) | YES | NULL | URL logo | `https://s3.../bvnt.png` |
| 5 | description | TEXT | YES | NULL | Mô tả công ty | `Thành lập 1965...` |
| 6 | api_endpoint | VARCHAR(500) | YES | NULL | Base URL API integration | `https://api.baoviet.com/v1` |
| 7 | api_config | JSONB | YES | NULL | Cấu hình API (encrypted) | `{"api_key":"..."}` |
| 8 | commission_rate | JSONB | YES | NULL | Tỷ lệ hoa hồng theo loại SP | `{"health":25.0}` |
| 9 | contact_info | JSONB | YES | NULL | Thông tin liên hệ đối tác | `{"email":"...","phone":"..."}` |
| 10 | status | insurer_status | YES | 'onboarding' | Trạng thái đối tác | `active` / `onboarding` |
| 11 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-01 00:00:00+07` |
| 12 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-01 00:00:00+07` |

---

## 5. Table: product

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | category_id | UUID | NO | - | FK → category(id) | `...` |
| 3 | insurer_id | UUID | NO | - | FK → insurer(id) | `...` |
| 4 | name | VARCHAR(200) | NO | - | Tên sản phẩm | `An Tâm Sống Khỏe` |
| 5 | slug | VARCHAR(200) | NO | - | Slug UNIQUE | `an-tam-song-khoe` |
| 6 | short_description | VARCHAR(500) | YES | NULL | Mô tả ngắn (listing) | `BH sức khỏe toàn diện...` |
| 7 | description | TEXT | YES | NULL | Mô tả chi tiết | `...` |
| 8 | benefits | JSONB | YES | NULL | Danh sách quyền lợi | `[{"name":"..."}]` |
| 9 | exclusions | JSONB | YES | NULL | Danh sách loại trừ | `[{"description":"..."}]` |
| 10 | pricing_rules | JSONB | YES | NULL | Quy tắc tính phí | `{"base_rate":350000}` |
| 11 | eligibility | JSONB | YES | NULL | Điều kiện tham gia | `{"min_age":18}` |
| 12 | documents | JSONB | YES | NULL | Tài liệu SP (PDF URLs) | `{"tac_url":"..."}` |
| 13 | min_age | INTEGER | YES | 0 | Tuổi tối thiểu | `18` |
| 14 | max_age | INTEGER | YES | 100 | Tuổi tối đa | `65` |
| 15 | min_sum_insured | BIGINT | YES | NULL | STBH tối thiểu (VND) | `100000000` |
| 16 | max_sum_insured | BIGINT | YES | NULL | STBH tối đa (VND) | `5000000000` |
| 17 | waiting_period_days | INTEGER | YES | 0 | Thời gian chờ (ngày) | `30` |
| 18 | cooling_off_days | INTEGER | YES | 21 | Thời gian hủy miễn phí | `21` |
| 19 | status | product_status | YES | 'draft' | Trạng thái SP | `active` / `draft` |
| 20 | rating | DECIMAL(3,2) | YES | 0.00 | Đánh giá trung bình (1-5) | `4.25` |
| 21 | total_sold | INTEGER | YES | 0 | Tổng số đã bán | `1250` |
| 22 | sort_order | INTEGER | YES | 0 | Thứ tự hiển thị | `1` |
| 23 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-01 00:00:00+07` |
| 24 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-03-15 14:00:00+07` |



---

## 6. Table: quote

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | customer_id | UUID | YES | NULL | FK → customer(id), NULL = guest | `...` / `NULL` |
| 3 | product_id | UUID | NO | - | FK → product(id) | `...` |
| 4 | insurer_id | UUID | NO | - | FK → insurer(id) | `...` |
| 5 | quote_number | VARCHAR(30) | NO | - | Mã báo giá, UNIQUE | `QUO-20260115-A3F9K2` |
| 6 | input_data | JSONB | NO | - | Dữ liệu đầu vào từ form | `{"age":30,"vehicle":"Honda"}` |
| 7 | coverage_options | JSONB | YES | NULL | Tùy chọn coverage đã chọn | `{"sum_insured":500000000}` |
| 8 | premium_annual | BIGINT | NO | - | Phí BH năm (VND) | `3500000` |
| 9 | premium_monthly | BIGINT | YES | NULL | Phí BH tháng (VND) | `320000` |
| 10 | sum_insured | BIGINT | NO | - | Số tiền bảo hiểm (VND) | `500000000` |
| 11 | deductible | BIGINT | YES | 0 | Mức miễn thường (VND) | `2000000` |
| 12 | benefits_summary | JSONB | YES | NULL | Tóm tắt quyền lợi | `[{"name":"...","amount":...}]` |
| 13 | exclusions_summary | JSONB | YES | NULL | Tóm tắt loại trừ | `["Pre-existing conditions"]` |
| 14 | valid_until | TIMESTAMPTZ | NO | - | Hạn hiệu lực báo giá | `2026-02-14 23:59:59+07` |
| 15 | status | quote_status | YES | 'active' | Trạng thái quote | `active` / `expired` / `converted` |
| 16 | converted_policy_id | UUID | YES | NULL | Policy ID nếu đã mua | `...` / `NULL` |
| 17 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-15 10:00:00+07` |
| 18 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-15 10:00:00+07` |

---

## 7. Table: policy

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | customer_id | UUID | NO | - | FK → customer(id) | `...` |
| 3 | product_id | UUID | NO | - | FK → product(id) | `...` |
| 4 | insurer_id | UUID | NO | - | FK → insurer(id) | `...` |
| 5 | quote_id | UUID | YES | NULL | FK → quote(id) | `...` / `NULL` |
| 6 | policy_number | VARCHAR(30) | NO | - | Số hợp đồng, UNIQUE | `POL-202601-000042` |
| 7 | status | policy_status | YES | 'pending' | Trạng thái HĐ | `active` / `expired` |
| 8 | start_date | DATE | NO | - | Ngày bắt đầu hiệu lực | `2026-01-15` |
| 9 | end_date | DATE | NO | - | Ngày hết hiệu lực | `2027-01-15` |
| 10 | issued_date | DATE | YES | NULL | Ngày phát hành | `2026-01-15` |
| 11 | premium_total | BIGINT | NO | - | Tổng phí BH năm (VND) | `3500000` |
| 12 | premium_frequency | payment_frequency | YES | 'annual' | Tần suất đóng phí | `annual` / `monthly` |
| 13 | installment_amount | BIGINT | YES | NULL | Số tiền mỗi kỳ (VND) | `320000` |
| 14 | next_due_date | DATE | YES | NULL | Ngày đóng phí tiếp theo | `2026-04-15` |
| 15 | sum_insured | BIGINT | NO | - | Số tiền bảo hiểm (VND) | `500000000` |
| 16 | deductible | BIGINT | YES | 0 | Mức miễn thường (VND) | `2000000` |
| 17 | coverage_details | JSONB | YES | NULL | Chi tiết bảo hiểm | `{"benefits":[...],"exclusions":[...]}` |
| 18 | insured_persons | JSONB | YES | NULL | Danh sách người được BH | `[{"name":"...","dob":"..."}]` |
| 19 | riders | JSONB | YES | NULL | Quyền lợi bổ sung | `[{"name":"CI","premium":500000}]` |
| 20 | document_url | VARCHAR(500) | YES | NULL | URL file hợp đồng PDF | `https://s3.../pol-xxx.pdf` |
| 21 | auto_renewal | BOOLEAN | YES | FALSE | Tự động gia hạn | `true` / `false` |
| 22 | renewal_date | DATE | YES | NULL | Ngày gia hạn dự kiến | `2027-01-01` |
| 23 | cancelled_at | TIMESTAMPTZ | YES | NULL | Thời điểm hủy | `NULL` |
| 24 | cancellation_reason | TEXT | YES | NULL | Lý do hủy | `Khách hàng yêu cầu` |
| 25 | lapsed_at | TIMESTAMPTZ | YES | NULL | Thời điểm mất hiệu lực | `NULL` |
| 26 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-15 10:00:00+07` |
| 27 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-15 10:00:00+07` |

---

## 8. Table: claim

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | policy_id | UUID | NO | - | FK → policy(id) | `...` |
| 3 | customer_id | UUID | NO | - | FK → customer(id) | `...` |
| 4 | handler_id | UUID | YES | NULL | FK → admin_user(id), người xử lý | `...` / `NULL` |
| 5 | claim_number | VARCHAR(30) | NO | - | Mã yêu cầu, UNIQUE | `CLM-202603-000015` |
| 6 | type | VARCHAR(30) | NO | - | Loại claim | `health` / `motor` / `death` |
| 7 | status | claim_status | YES | 'submitted' | Trạng thái xử lý | `submitted` / `approved` |
| 8 | priority | claim_priority | YES | 'medium' | Mức ưu tiên | `low` / `medium` / `high` |
| 9 | event_date | DATE | NO | - | Ngày xảy ra sự kiện | `2026-03-10` |
| 10 | event_description | TEXT | NO | - | Mô tả sự kiện | `Nhập viện do viêm phổi...` |
| 11 | event_location | VARCHAR(255) | YES | NULL | Địa điểm xảy ra | `BV Chợ Rẫy, TP.HCM` |
| 12 | third_party_involved | BOOLEAN | YES | FALSE | Có bên thứ 3 liên quan | `false` |
| 13 | police_report_number | VARCHAR(50) | YES | NULL | Số biên bản công an | `BA-2026-12345` |
| 14 | claimed_amount | BIGINT | NO | - | Số tiền yêu cầu (VND) | `15000000` |
| 15 | assessed_amount | BIGINT | YES | NULL | Số tiền đánh giá (VND) | `12000000` |
| 16 | approved_amount | BIGINT | YES | NULL | Số tiền phê duyệt (VND) | `10000000` |
| 17 | deductible_applied | BIGINT | YES | 0 | Mức miễn thường áp dụng | `2000000` |
| 18 | net_settlement | BIGINT | YES | NULL | Số tiền thực chi (VND) | `8000000` |
| 19 | decision | VARCHAR(20) | YES | NULL | Quyết định cuối | `approved` / `rejected` |
| 20 | decision_reason | TEXT | YES | NULL | Lý do quyết định | `Đủ điều kiện bồi thường` |
| 21 | decided_at | TIMESTAMPTZ | YES | NULL | Thời điểm quyết định | `2026-03-18 15:00:00+07` |
| 22 | settled_at | TIMESTAMPTZ | YES | NULL | Thời điểm giải quyết xong | `2026-03-20 09:00:00+07` |
| 23 | bank_account | JSONB | YES | NULL | TK nhận bồi thường | `{"bank":"VCB","number":"..."}` |
| 24 | submitted_at | TIMESTAMPTZ | YES | NOW() | Thời điểm nộp claim | `2026-03-12 08:00:00+07` |
| 25 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo record | `2026-03-12 08:00:00+07` |
| 26 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-03-18 15:00:00+07` |

---

## 9. Table: payment

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | policy_id | UUID | YES | NULL | FK → policy(id) | `...` |
| 3 | customer_id | UUID | NO | - | FK → customer(id) | `...` |
| 4 | claim_id | UUID | YES | NULL | FK → claim(id), cho settlement | `...` / `NULL` |
| 5 | reference_number | VARCHAR(50) | NO | - | Mã giao dịch, UNIQUE | `PAY-PRM-1705312000-X7K2` |
| 6 | type | VARCHAR(30) | NO | - | Loại giao dịch | `premium_payment` / `refund` |
| 7 | amount | BIGINT | NO | - | Số tiền (VND) | `3500000` |
| 8 | currency | VARCHAR(3) | YES | 'VND' | Loại tiền tệ | `VND` |
| 9 | status | payment_status | YES | 'pending' | Trạng thái GD | `success` / `failed` |
| 10 | method | payment_method | YES | NULL | Phương thức thanh toán | `ewallet` / `card` |
| 11 | provider | VARCHAR(30) | YES | NULL | Nhà cung cấp cổng TT | `vnpay` / `momo` / `zalopay` |
| 12 | gateway_transaction_id | VARCHAR(100) | YES | NULL | Mã GD từ gateway | `VNP14325678` |
| 13 | gateway_response | JSONB | YES | NULL | Response đầy đủ từ gateway | `{"code":"00","message":"..."}` |
| 14 | paid_at | TIMESTAMPTZ | YES | NULL | Thời điểm thanh toán thành công | `2026-01-15 10:05:00+07` |
| 15 | expires_at | TIMESTAMPTZ | YES | NULL | Hạn thanh toán (15 min) | `2026-01-15 10:15:00+07` |
| 16 | refund_amount | BIGINT | YES | NULL | Số tiền hoàn (VND) | `3000000` |
| 17 | refunded_at | TIMESTAMPTZ | YES | NULL | Thời điểm hoàn tiền | `NULL` |
| 18 | refund_reason | TEXT | YES | NULL | Lý do hoàn tiền | `Hủy trong cooling-off` |
| 19 | retry_count | INTEGER | YES | 0 | Số lần retry (recurring) | `0` / `1` / `2` |
| 20 | metadata | JSONB | YES | NULL | Thông tin bổ sung | `{"ip":"...","device":"..."}` |
| 21 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-15 10:00:00+07` |
| 22 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-15 10:05:00+07` |



---

## 10. Table: beneficiary

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | policy_id | UUID | NO | - | FK → policy(id) | `...` |
| 3 | full_name | VARCHAR(100) | NO | - | Họ tên người thụ hưởng | `Trần Thị Lan` |
| 4 | relationship | VARCHAR(30) | NO | - | Mối quan hệ với chủ HĐ | `spouse` / `child` / `parent` |
| 5 | percentage | DECIMAL(5,2) | NO | - | Tỷ lệ thụ hưởng (%) | `50.00` |
| 6 | date_of_birth | DATE | YES | NULL | Ngày sinh | `1997-08-20` |
| 7 | id_number | VARCHAR(20) | YES | NULL | Số CCCD | `079097012345` |
| 8 | phone | VARCHAR(20) | YES | NULL | Số điện thoại | `+84912345678` |
| 9 | email | VARCHAR(255) | YES | NULL | Email | `lan@gmail.com` |
| 10 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-15 10:00:00+07` |
| 11 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-15 10:00:00+07` |

---

## 11. Table: admin_user

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | email | VARCHAR(255) | NO | - | Email admin, UNIQUE | `admin@insurance.vn` |
| 3 | password_hash | VARCHAR(255) | NO | - | Bcrypt hash | `$2b$12$...` |
| 4 | full_name | VARCHAR(100) | NO | - | Họ tên | `Lê Quản Trị` |
| 5 | role | admin_role | NO | - | Vai trò | `admin` / `operator` |
| 6 | permissions | JSONB | YES | NULL | Quyền chi tiết | `{"claims":"rw","policies":"r"}` |
| 7 | phone | VARCHAR(20) | YES | NULL | SĐT | `+84901234567` |
| 8 | avatar_url | VARCHAR(500) | YES | NULL | URL avatar | `https://s3.../admin.jpg` |
| 9 | is_active | BOOLEAN | YES | TRUE | Tài khoản hoạt động | `true` |
| 10 | mfa_enabled | BOOLEAN | YES | FALSE | Đã bật MFA | `true` / `false` |
| 11 | mfa_secret | VARCHAR(255) | YES | NULL | Secret key MFA (encrypted) | `encrypted_value` |
| 12 | last_login_at | TIMESTAMPTZ | YES | NULL | Đăng nhập gần nhất | `2026-01-15 08:00:00+07` |
| 13 | last_login_ip | VARCHAR(45) | YES | NULL | IP đăng nhập gần nhất | `192.168.1.100` |
| 14 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo | `2026-01-01 00:00:00+07` |
| 15 | updated_at | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật | `2026-01-15 08:00:00+07` |

---

## 12. Table: audit_log

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | user_id | UUID | YES | NULL | ID người thực hiện | `...` / `NULL` (system) |
| 3 | user_type | VARCHAR(20) | YES | NULL | Loại user | `customer` / `admin` / `system` |
| 4 | action | VARCHAR(50) | NO | - | Hành động | `create` / `update` / `delete` |
| 5 | entity_type | VARCHAR(50) | NO | - | Loại entity bị tác động | `policy` / `claim` / `customer` |
| 6 | entity_id | UUID | YES | NULL | ID entity bị tác động | `...` |
| 7 | old_data | JSONB | YES | NULL | Dữ liệu trước thay đổi | `{"status":"pending"}` |
| 8 | new_data | JSONB | YES | NULL | Dữ liệu sau thay đổi | `{"status":"active"}` |
| 9 | ip_address | VARCHAR(45) | YES | NULL | IP address | `203.162.4.190` |
| 10 | user_agent | TEXT | YES | NULL | Browser/client info | `Mozilla/5.0...` |
| 11 | session_id | VARCHAR(100) | YES | NULL | Session ID | `sess_abc123...` |
| 12 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm ghi log | `2026-01-15 10:00:00+07` |

---

## 13. Table: notification

| # | Column | Type | Nullable | Default | Description | Example |
|---|--------|------|----------|---------|-------------|---------|
| 1 | id | UUID | NO | uuid_generate_v4() | Khóa chính | `...` |
| 2 | user_id | UUID | NO | - | ID người nhận | `...` |
| 3 | user_type | VARCHAR(20) | NO | 'customer' | Loại user | `customer` / `admin` |
| 4 | type | VARCHAR(50) | NO | - | Loại thông báo | `payment_success` / `claim_update` |
| 5 | channel | notification_channel | NO | - | Kênh gửi | `email` / `sms` / `in_app` |
| 6 | title | VARCHAR(200) | NO | - | Tiêu đề | `Thanh toán thành công` |
| 7 | content | TEXT | NO | - | Nội dung | `Bạn đã thanh toán 3.5M...` |
| 8 | metadata | JSONB | YES | NULL | Dữ liệu bổ sung | `{"policy_id":"...","amount":...}` |
| 9 | is_read | BOOLEAN | YES | FALSE | Đã đọc (in_app) | `false` |
| 10 | read_at | TIMESTAMPTZ | YES | NULL | Thời điểm đọc | `NULL` |
| 11 | sent_at | TIMESTAMPTZ | YES | NULL | Thời điểm gửi thành công | `2026-01-15 10:01:00+07` |
| 12 | failed_at | TIMESTAMPTZ | YES | NULL | Thời điểm gửi thất bại | `NULL` |
| 13 | error_message | TEXT | YES | NULL | Lỗi khi gửi thất bại | `NULL` |
| 14 | created_at | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo (queued) | `2026-01-15 10:00:00+07` |

---

## 14. Enum Values Reference

### 14.1. customer_status
| Value | Description |
|-------|-------------|
| `active` | Tài khoản hoạt động bình thường |
| `inactive` | Tài khoản tạm ngưng (user tự deactivate) |
| `suspended` | Bị khóa bởi admin |
| `deleted` | Đã xóa mềm |

### 14.2. policy_status
| Value | Description |
|-------|-------------|
| `pending` | Chờ thanh toán/phát hành |
| `active` | Đang có hiệu lực |
| `expired` | Hết hạn (end_date < today) |
| `cancelled` | Đã hủy (user/admin) |
| `lapsed` | Mất hiệu lực do không đóng phí |
| `renewed` | Đã gia hạn (policy cũ) |

### 14.3. claim_status
| Value | Description |
|-------|-------------|
| `submitted` | Đã nộp, chờ assign |
| `assigned` | Đã phân công handler |
| `documents_review` | Đang xem xét chứng từ |
| `additional_info_required` | Cần bổ sung thông tin |
| `under_assessment` | Đang đánh giá |
| `approved` | Đã phê duyệt toàn bộ |
| `partially_approved` | Phê duyệt một phần |
| `rejected` | Từ chối |
| `payment_processing` | Đang xử lý thanh toán |
| `settled` | Đã giải quyết xong |
| `closed` | Đã đóng |
| `appealed` | Khách hàng khiếu nại |

### 14.4. payment_status
| Value | Description |
|-------|-------------|
| `pending` | Chờ thanh toán |
| `processing` | Đang xử lý tại gateway |
| `success` | Thanh toán thành công |
| `failed` | Thanh toán thất bại |
| `refunded` | Đã hoàn tiền |
| `expired` | Hết hạn (timeout) |

### 14.5. payment_method
| Value | Description |
|-------|-------------|
| `ewallet` | Ví điện tử (Momo, ZaloPay) |
| `card` | Thẻ ATM/Visa/Mastercard |
| `bank_transfer` | Chuyển khoản ngân hàng |
| `installment` | Trả góp qua đối tác |

### 14.6. admin_role
| Value | Description | Permissions |
|-------|-------------|-------------|
| `super_admin` | Toàn quyền hệ thống | All |
| `admin` | Quản trị chung | CRUD all entities |
| `operator` | Vận hành | Read all, Update policies/claims |
| `claims_handler` | Xử lý claims | CRUD claims, Read policies |
| `finance` | Tài chính | Read/Update payments, reconciliation |
