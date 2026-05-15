# Insurance System - Hệ Thống Bán Bảo Hiểm Toàn Diện

## Tổng quan

Hệ thống bán tất cả các loại bảo hiểm trực tuyến, bao gồm:
- Bảo hiểm nhân thọ (Life Insurance)
- Bảo hiểm sức khỏe (Health Insurance)
- Bảo hiểm xe cơ giới (Motor Insurance)
- Bảo hiểm tài sản (Property Insurance)
- Bảo hiểm du lịch (Travel Insurance)
- Bảo hiểm trách nhiệm dân sự (Liability Insurance)
- Bảo hiểm doanh nghiệp (Business Insurance)

## Cấu trúc dự án (Monolith)

```
insurrance-system/
├── be/                     # Backend (API Server)
│   ├── src/
│   ├── package.json
│   └── ...
├── fe/                     # Frontend (Web Application)
│   ├── src/
│   ├── package.json
│   └── ...
├── docs/                   # Documentation
│   ├── 01-vision-strategy/
│   ├── 02-requirements-analysis/
│   └── 03-business-analysis/
└── README.md
```

## Công nghệ sử dụng

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Message Queue | RabbitMQ |
| Documentation | Markdown + PlantUML |

## Bắt đầu

### Backend
```bash
cd be
npm install
npm run dev
```

### Frontend
```bash
cd fe
npm install
npm run dev
```

## Tài liệu

Xem thư mục `/docs` để biết chi tiết về:
- Vision & Strategy
- Requirements Analysis
- Business Analysis

## License

MIT
