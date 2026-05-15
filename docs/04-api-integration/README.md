# 04 - API & Integration Documentation

Tài liệu thiết kế API và tích hợp hệ thống cho Insurance System Platform.

---

## Cấu trúc thư mục

```
04-api-integration/
├── README.md                          (Tài liệu này)
├── api/
│   ├── 01-api-specification.md        (OpenAPI / Swagger Docs)
│   ├── 02-endpoint-documentation.md   (Chi tiết các endpoints)
│   └── 03-api-versioning-policy.md    (Chính sách versioning)
├── integration/
│   ├── 01-webhook-documentation.md    (Webhook events & payloads)
│   ├── 02-event-contract.md           (Event-driven contracts)
│   ├── 03-message-queue-topics.md     (Message queue design)
│   └── 04-third-party-integration.md  (Tích hợp bên thứ 3)
└── authentication/
    ├── 01-oauth-flow.md               (OAuth 2.0 flows)
    ├── 02-jwt-structure.md            (JWT token design)
    ├── 03-permission-matrix.md        (Ma trận quyền)
    └── 04-rbac-design.md              (Role-Based Access Control)
```

---

## Tổng quan

| Mục | Mô tả |
|-----|--------|
| **API Style** | RESTful API, JSON over HTTPS |
| **Auth** | OAuth 2.0 + JWT Bearer Token |
| **Versioning** | URI versioning (`/api/v1/...`) |
| **Documentation** | OpenAPI 3.1 (Swagger) |
| **Event System** | Webhooks + Message Queue (RabbitMQ) |
| **Rate Limiting** | Token bucket, per-client |

---

## Quick Links

- [API Specification (OpenAPI)](./api/01-api-specification.md)
- [Endpoint Documentation](./api/02-endpoint-documentation.md)
- [API Versioning Policy](./api/03-api-versioning-policy.md)
- [Webhook Documentation](./integration/01-webhook-documentation.md)
- [Event Contract](./integration/02-event-contract.md)
- [Message Queue Topics](./integration/03-message-queue-topics.md)
- [Third-party Integration](./integration/04-third-party-integration.md)
- [OAuth Flow](./authentication/01-oauth-flow.md)
- [JWT Structure](./authentication/02-jwt-structure.md)
- [Permission Matrix](./authentication/03-permission-matrix.md)
- [RBAC Design](./authentication/04-rbac-design.md)
