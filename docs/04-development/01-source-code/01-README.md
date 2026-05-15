# README Documentation Guide

## Mục đích

Tài liệu này hướng dẫn cách viết và duy trì file README cho dự án Insurance System, đảm bảo tính nhất quán và đầy đủ thông tin cho developer mới.

## Cấu trúc README tiêu chuẩn

### 1. Project Title & Badge

```markdown
# Insurance System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
```

### 2. Mô tả ngắn gọn

- Tóm tắt dự án trong 1-2 câu
- Nêu rõ mục đích chính của hệ thống
- Liệt kê các tính năng chính

### 3. Cấu trúc thư mục

```
insurrance-system/
├── be/                     # Backend API Server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration
│   │   └── index.ts        # Entry point
│   ├── tests/              # Unit & Integration tests
│   ├── package.json
│   └── tsconfig.json
├── fe/                     # Frontend Web Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── stores/         # State management (Zustand)
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Root component
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # Project documentation
│   ├── 01-vision-strategy/
│   ├── 02-requirements-analysis/
│   ├── 03-business-analysis/
│   └── 04-development/
└── README.md
```

### 4. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.x + 5.x |
| Build Tool | Vite | 5.x |
| UI Styling | TailwindCSS | 3.x |
| State Management | Zustand | 4.x |
| Backend | Node.js + Express | 20.x + 4.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 15.x |
| Cache | Redis | 7.x |
| Message Queue | RabbitMQ | 3.x |
| Authentication | JWT + bcrypt | - |

### 5. Prerequisites

```markdown
## Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- PostgreSQL >= 15.x
- Redis >= 7.x
- Git >= 2.x
```

### 6. Quick Start

```markdown
## Quick Start

# Clone repository
git clone <repository-url>
cd insurrance-system

# Backend setup
cd be
cp .env.example .env
npm install
npm run dev

# Frontend setup (new terminal)
cd fe
npm install
npm run dev
```

### 7. Scripts Reference

#### Backend Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Chạy server với hot-reload |
| Build | `npm run build` | Build TypeScript → JavaScript |
| Start | `npm run start` | Chạy production build |
| Lint | `npm run lint` | Kiểm tra code style |
| Test | `npm run test` | Chạy unit tests |

#### Frontend Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Chạy Vite dev server |
| Build | `npm run build` | Build production |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Kiểm tra code style |

### 8. API Documentation

```markdown
## API Documentation

- Base URL: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: `docs/postman/`
```

### 9. License & Contact

```markdown
## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contact

- Team Lead: [name] - [email]
- Repository: [GitHub URL]
```

## Quy tắc cập nhật README

1. **Khi thêm dependency mới** → Cập nhật Tech Stack
2. **Khi thay đổi cấu trúc thư mục** → Cập nhật Directory Structure
3. **Khi thêm script mới** → Cập nhật Scripts Reference
4. **Khi thay đổi setup process** → Cập nhật Quick Start
5. **Mỗi release mới** → Cập nhật version badges

## Checklist README

- [ ] Title và mô tả rõ ràng
- [ ] Badges cập nhật
- [ ] Cấu trúc thư mục chính xác
- [ ] Tech stack đầy đủ
- [ ] Hướng dẫn cài đặt hoạt động
- [ ] Scripts được document
- [ ] Link tới tài liệu chi tiết
- [ ] Thông tin license và contact
