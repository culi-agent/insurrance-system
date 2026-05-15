# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi nhận trong file này.

Format tuân theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Quy tắc Versioning

### Semantic Versioning: `MAJOR.MINOR.PATCH`

| Thành phần | Khi nào tăng | Ví dụ |
|-----------|-------------|-------|
| **MAJOR** | Breaking changes, API không tương thích ngược | 1.0.0 → 2.0.0 |
| **MINOR** | Thêm feature mới, backward-compatible | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes, backward-compatible | 1.0.0 → 1.0.1 |

### Pre-release versions

```
1.0.0-alpha.1    → Internal testing
1.0.0-beta.1     → External testing
1.0.0-rc.1       → Release candidate
1.0.0            → Production release
```

---

## Changelog Format

### Categories

- **Added**: Tính năng mới
- **Changed**: Thay đổi tính năng hiện có
- **Deprecated**: Tính năng sắp bị loại bỏ
- **Removed**: Tính năng đã bị loại bỏ
- **Fixed**: Bug fixes
- **Security**: Vulnerabilities đã fix

### Template

```markdown
## [Version] - YYYY-MM-DD

### Added
- Mô tả tính năng mới (#issue-number)

### Changed
- Mô tả thay đổi (#issue-number)

### Fixed
- Mô tả bug đã fix (#issue-number)
```

---

## [Unreleased]

### Added
- Initial project setup với monorepo structure (be + fe)
- Backend: Express + TypeScript + TypeORM boilerplate
- Frontend: React + TypeScript + Vite boilerplate
- Documentation structure (Vision, Requirements, Business Analysis)
- Development documentation

### Planned
- User authentication & authorization module
- Policy management CRUD operations
- Premium calculation engine
- Payment integration
- Customer portal
- Admin dashboard
- Notification system (Email/SMS)
- Report generation

---

## [1.0.0-alpha.1] - 2024-01-15

### Added
- Project initialization
- Backend skeleton with Express.js and TypeScript
- Frontend skeleton with React, Vite, and TailwindCSS
- Basic project documentation
- Git workflow setup
- CI/CD pipeline configuration

---

## Quy trình cập nhật Changelog

### Khi nào cập nhật?

1. **Mỗi Pull Request** → Thêm entry vào `[Unreleased]`
2. **Khi release** → Move entries từ `[Unreleased]` sang version mới
3. **Hotfix** → Thêm entry với version patch mới

### Ai chịu trách nhiệm?

- **Developer**: Thêm entry cho mỗi PR
- **Tech Lead**: Review changelog khi merge
- **Release Manager**: Chuẩn bị changelog cho release

### Mẹo viết Changelog tốt

```markdown
# ✅ Tốt - Rõ ràng, có context
- Added policy search with filters by type, status, and date range (#123)
- Fixed premium calculation error for customers above age 60 (#456)

# ❌ Tệ - Mơ hồ, không có context
- Fixed bug
- Updated code
- Added new feature
```

### Quy tắc

1. Viết cho **người dùng cuối** và **developer** đều hiểu được
2. Mỗi entry phải có **issue/PR reference**
3. Sắp xếp theo **mức độ quan trọng** (important first)
4. Sử dụng **present tense** cho tiếng Anh
5. Giữ mô tả **ngắn gọn nhưng đủ ý**

---

## Links

- [Full Diff](../../) - So sánh giữa các versions
- [Release Notes](../../releases) - Chi tiết từng release
- [Migration Guide](./migration/) - Hướng dẫn upgrade giữa major versions
