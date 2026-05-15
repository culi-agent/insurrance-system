# 04 - Testing & QA Documentation

Tài liệu kiểm thử và đảm bảo chất lượng cho Insurance System Platform.

---

## Cấu trúc thư mục

```
04-testing-qa/
├── README.md
├── 01-test-planning/
│   ├── 01-test-plan.md              # Kế hoạch kiểm thử tổng thể
│   ├── 02-test-strategy.md          # Chiến lược kiểm thử
│   └── 03-qa-checklist.md           # Danh sách kiểm tra chất lượng
├── 02-testing-documents/
│   ├── 01-test-cases.md             # Các trường hợp kiểm thử chi tiết
│   ├── 02-test-scenarios.md         # Kịch bản kiểm thử theo module
│   └── 03-regression-test-suite.md  # Bộ kiểm thử hồi quy (Smoke/Sanity/Full)
├── 03-uat-documents/
│   └── 01-uat-plan.md              # Kế hoạch UAT và kịch bản chấp nhận
└── 04-reports/
    ├── 01-bug-report-template.md          # Mẫu báo cáo lỗi
    ├── 02-test-report-template.md         # Mẫu báo cáo kiểm thử
    ├── 03-coverage-report-template.md     # Mẫu báo cáo phạm vi kiểm thử
    ├── 04-performance-test-report-template.md  # Mẫu báo cáo hiệu năng
    └── 05-security-test-report-template.md     # Mẫu báo cáo bảo mật
```

---

## Tổng quan

| Folder | Nội dung | Audience |
|--------|----------|----------|
| 01-test-planning | Kế hoạch, chiến lược, checklist | QA Team, PM, Tech Lead |
| 02-testing-documents | Test cases, scenarios, regression suite | QA Engineers, Developers |
| 03-uat-documents | UAT plan, acceptance criteria | Business Team, PO, End Users |
| 04-reports | Templates cho các loại báo cáo | QA Team, Stakeholders |

---

## Quy trình sử dụng

1. **Bắt đầu dự án:** Review Test Plan + Test Strategy
2. **Mỗi sprint:** Sử dụng QA Checklist + viết/update Test Cases
3. **Trước release:** Chạy Regression Test Suite
4. **UAT phase:** Follow UAT Plan
5. **Sau mỗi test cycle:** Điền các Report templates
6. **Khi phát hiện bug:** Sử dụng Bug Report Template
