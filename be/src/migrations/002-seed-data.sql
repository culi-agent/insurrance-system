-- =============================================
-- Seed Data - Insurance System Sprint 1
-- =============================================

-- Categories (7 loại bảo hiểm chính)
INSERT INTO category (id, name, slug, description, icon, sort_order) VALUES
  (uuid_generate_v4(), 'Bảo hiểm xe cơ giới', 'bao-hiem-xe', 'Bảo hiểm trách nhiệm dân sự và vật chất xe', 'car', 1),
  (uuid_generate_v4(), 'Bảo hiểm sức khỏe', 'bao-hiem-suc-khoe', 'Bảo hiểm chi phí y tế và nằm viện', 'health', 2),
  (uuid_generate_v4(), 'Bảo hiểm du lịch', 'bao-hiem-du-lich', 'Bảo hiểm tai nạn và rủi ro khi du lịch', 'travel', 3),
  (uuid_generate_v4(), 'Bảo hiểm nhân thọ', 'bao-hiem-nhan-tho', 'Bảo hiểm tích lũy và bảo vệ tài chính gia đình', 'life', 4),
  (uuid_generate_v4(), 'Bảo hiểm nhà ở', 'bao-hiem-nha-o', 'Bảo hiểm tài sản và hỏa hoạn cho nhà ở', 'home', 5),
  (uuid_generate_v4(), 'Bảo hiểm tai nạn', 'bao-hiem-tai-nan', 'Bảo hiểm tai nạn cá nhân 24/7', 'accident', 6),
  (uuid_generate_v4(), 'Bảo hiểm doanh nghiệp', 'bao-hiem-doanh-nghiep', 'Giải pháp bảo hiểm toàn diện cho doanh nghiệp', 'business', 7);

-- Insurers (Các công ty bảo hiểm đối tác)
INSERT INTO insurer (id, name, code, slug, description, logo_url, website, status, rating) VALUES
  (uuid_generate_v4(), 'Bảo Việt', 'BAOVIET', 'bao-viet', 'Tập đoàn Bảo Việt - Công ty bảo hiểm lớn nhất Việt Nam', '/logos/baoviet.png', 'https://baoviet.com.vn', 'active', 4.5),
  (uuid_generate_v4(), 'PVI Insurance', 'PVI', 'pvi-insurance', 'Bảo hiểm PVI - Thành viên PetroVietnam', '/logos/pvi.png', 'https://pvi.com.vn', 'active', 4.3),
  (uuid_generate_v4(), 'Bảo Minh', 'BAOMINH', 'bao-minh', 'Tổng Công ty Bảo Minh', '/logos/baominh.png', 'https://baominh.com.vn', 'active', 4.2),
  (uuid_generate_v4(), 'MIC Insurance', 'MIC', 'mic-insurance', 'Bảo hiểm Quân đội (MIC)', '/logos/mic.png', 'https://mic.vn', 'active', 4.1),
  (uuid_generate_v4(), 'Prudential Vietnam', 'PRUDENTIAL', 'prudential', 'Prudential Vietnam - Bảo hiểm nhân thọ hàng đầu', '/logos/prudential.png', 'https://prudential.com.vn', 'active', 4.6),
  (uuid_generate_v4(), 'Manulife Vietnam', 'MANULIFE', 'manulife', 'Manulife Vietnam - Giải pháp tài chính toàn diện', '/logos/manulife.png', 'https://manulife.com.vn', 'active', 4.4);
