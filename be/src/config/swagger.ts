import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './environment';

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'Insurance System API',
    version: '2.0.0',
    description: `
# Insurance System API Documentation

Hệ thống bảo hiểm trực tuyến - REST API documentation.

## Authentication

Tất cả các endpoint bảo mật đều yêu cầu JWT Bearer token trong header Authorization.

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Token Flow:
1. **Login** → Nhận access_token (15m) + refresh_token (7d)
2. **Access expired** → Gọi /refresh-token với refresh_token
3. **Refresh expired** → User phải login lại

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| VALIDATION_ERROR | 400 | Dữ liệu gửi lên không hợp lệ |
| UNAUTHORIZED | 401 | Chưa xác thực hoặc token hết hạn |
| FORBIDDEN | 403 | Không đủ quyền |
| NOT_FOUND | 404 | Tài nguyên không tồn tại |
| CONFLICT | 409 | Xung đột dữ liệu (duplicate) |
| ACCOUNT_LOCKED | 423 | Tài khoản bị khóa |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded |

## Rate Limiting

- Global: 100 requests/minute
- Auth endpoints: 5 requests/minute
- Login: 10 requests/minute

## Pagination

Các endpoint trả về danh sách đều hỗ trợ pagination:
- \`page\`: Trang hiện tại (default: 1)
- \`per_page\`: Số item/trang (default: 20, max: 100)

Response bao gồm object \`pagination\` với metadata.
    `,
    contact: {
      name: 'Insurance System Team',
      email: 'dev@insurance-system.vn',
    },
    license: {
      name: 'Private',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Development server',
    },
    {
      url: 'https://api.insurance-system.vn',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from /api/v1/auth/login',
      },
    },
    schemas: {
      // ========== Common Schemas ==========
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'string' },
                  },
                },
              },
            },
          },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },
      Meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          request_id: { type: 'string', format: 'uuid' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 100 },
          page: { type: 'integer', example: 1 },
          per_page: { type: 'integer', example: 20 },
          total_pages: { type: 'integer', example: 5 },
          has_next: { type: 'boolean', example: true },
          has_prev: { type: 'boolean', example: false },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: {} },
          pagination: { $ref: '#/components/schemas/Pagination' },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },

      // ========== Auth Schemas ==========
      RegisterRequest: {
        type: 'object',
        required: ['email', 'phone', 'password', 'confirm_password', 'full_name', 'agree_terms'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          phone: { type: 'string', pattern: '^\\+84[0-9]{9,10}$', example: '+84912345678' },
          password: { type: 'string', minLength: 8, example: 'Password1!' },
          confirm_password: { type: 'string', example: 'Password1!' },
          full_name: { type: 'string', minLength: 2, maxLength: 100, example: 'Nguyen Van A' },
          agree_terms: { type: 'boolean', example: true },
        },
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          phone: { type: 'string' },
          full_name: { type: 'string' },
          status: { type: 'string', example: 'pending_verification' },
          verification: {
            type: 'object',
            properties: {
              email_sent: { type: 'boolean' },
              sms_sent: { type: 'boolean' },
              expires_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email_or_phone', 'password'],
        properties: {
          email_or_phone: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'Password1!' },
          remember_me: { type: 'boolean', default: false },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          token_type: { type: 'string', example: 'Bearer' },
          expires_in: { type: 'integer', example: 900, description: 'Access token TTL in seconds' },
          user: { $ref: '#/components/schemas/UserInfo' },
        },
      },
      UserInfo: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          full_name: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin', 'partner', 'superadmin'] },
          kyc_status: { type: 'string', enum: ['pending', 'verified', 'rejected', 'expired'] },
        },
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', minLength: 6, maxLength: 6, example: '123456' },
          channel: { type: 'string', enum: ['email', 'sms'], default: 'email' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string' },
        },
      },
      RefreshTokenResponse: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          token_type: { type: 'string', example: 'Bearer' },
          expires_in: { type: 'integer', example: 900 },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email_or_phone'],
        properties: {
          email_or_phone: { type: 'string', example: 'user@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'new_password', 'confirm_password'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', minLength: 6, maxLength: 6 },
          new_password: { type: 'string', minLength: 8 },
          confirm_password: { type: 'string' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['current_password', 'new_password', 'confirm_password'],
        properties: {
          current_password: { type: 'string' },
          new_password: { type: 'string', minLength: 8 },
          confirm_password: { type: 'string' },
        },
      },
      SocialLoginRequest: {
        type: 'object',
        required: ['provider', 'token'],
        properties: {
          provider: { type: 'string', enum: ['google', 'facebook'] },
          token: { type: 'string', description: 'ID token (Google) or access token (Facebook)' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          full_name: { type: 'string', minLength: 2, maxLength: 100 },
          date_of_birth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          id_number: { type: 'string', maxLength: 20 },
          id_number_type: { type: 'string', enum: ['cccd', 'cmnd', 'passport'] },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              ward: { type: 'string' },
              district: { type: 'string' },
              city: { type: 'string' },
              province: { type: 'string' },
            },
          },
          avatar_url: { type: 'string', format: 'uri' },
          language: { type: 'string', enum: ['vi', 'en'] },
        },
      },
      CustomerProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          phone: { type: 'string' },
          full_name: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date', nullable: true },
          gender: { type: 'string', nullable: true },
          address: { type: 'object', nullable: true },
          kyc_status: { type: 'string' },
          avatar_url: { type: 'string', nullable: true },
          email_verified: { type: 'boolean' },
          phone_verified: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      ResendOtpRequest: {
        type: 'object',
        required: ['email', 'type'],
        properties: {
          email: { type: 'string', format: 'email' },
          type: { type: 'string', enum: ['verify', 'reset'] },
        },
      },

      // ========== Product Schemas ==========
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          short_description: { type: 'string' },
          category_id: { type: 'string', format: 'uuid' },
          insurer_id: { type: 'string', format: 'uuid' },
          benefits: { type: 'array', items: { type: 'object' } },
          exclusions: { type: 'array', items: { type: 'object' } },
          pricing_rules: { type: 'object' },
          eligibility: { type: 'object' },
          terms_url: { type: 'string' },
          brochure_url: { type: 'string' },
          min_age: { type: 'integer' },
          max_age: { type: 'integer' },
          min_premium: { type: 'number' },
          max_premium: { type: 'number' },
          status: { type: 'string', enum: ['draft', 'active', 'suspended', 'archived'] },
          sort_order: { type: 'integer' },
          is_featured: { type: 'boolean' },
          category: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
            },
          },
          insurer: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              code: { type: 'string' },
            },
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          parent_id: { type: 'string', format: 'uuid', nullable: true },
          sort_order: { type: 'integer' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Insurer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          code: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          logo_url: { type: 'string' },
          website: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          rating: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      // ========== Admin Schemas ==========
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'slug', 'category_id', 'insurer_id'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 200 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          category_id: { type: 'string', format: 'uuid' },
          insurer_id: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
          short_description: { type: 'string', maxLength: 500 },
          benefits: { type: 'array', items: { type: 'object' } },
          exclusions: { type: 'array', items: { type: 'object' } },
          pricing_rules: { type: 'object' },
          eligibility: { type: 'object' },
          terms_url: { type: 'string', format: 'uri' },
          brochure_url: { type: 'string', format: 'uri' },
          min_age: { type: 'integer', minimum: 0, maximum: 100 },
          max_age: { type: 'integer', minimum: 0, maximum: 100 },
          min_premium: { type: 'number', minimum: 0 },
          max_premium: { type: 'number', minimum: 0 },
          status: { type: 'string', enum: ['draft', 'active', 'suspended', 'archived'] },
          sort_order: { type: 'integer' },
          is_featured: { type: 'boolean' },
          metadata: { type: 'object' },
        },
      },
      UpdateCustomerStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          customers: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              active: { type: 'integer' },
            },
          },
          products: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              active: { type: 'integer' },
            },
          },
          categories: { type: 'integer' },
          insurers: { type: 'integer' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'UNAUTHORIZED', message: 'Access token is required' },
              meta: { timestamp: '2024-01-01T00:00:00.000Z', request_id: 'uuid' },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này' },
              meta: { timestamp: '2024-01-01T00:00:00.000Z', request_id: 'uuid' },
            },
          },
        },
      },
      ValidationError: {
        description: 'Request body validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: [{ field: 'email', message: 'Email format không hợp lệ', code: 'INVALID_FIELD' }],
              },
              meta: { timestamp: '2024-01-01T00:00:00.000Z', request_id: 'uuid' },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Products', description: 'Insurance product catalog (public)' },
    { name: 'Quotations', description: 'Quote generation & management' },
    { name: 'Purchase', description: 'Policy purchase & payment' },
    { name: 'Claims', description: 'Insurance claims management' },
    { name: 'Renewal', description: 'Policy renewal' },
    { name: 'Referrals', description: 'Referral program' },
    { name: 'Recommendations', description: 'Product recommendations' },
    { name: 'Mobile', description: 'Mobile-optimized endpoints' },
    { name: 'Admin', description: 'Administration (requires admin/superadmin role)' },
    { name: 'Admin - Analytics', description: 'Analytics & reports' },
    { name: 'Partner', description: 'Partner portal' },
    { name: 'Enterprise', description: 'Enterprise / B2B features' },
    { name: 'Loyalty', description: 'Loyalty & rewards program' },
    { name: 'Chatbot', description: 'AI Chatbot' },
  ],
  paths: {},
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  // Scan route files for JSDoc annotations
  apis: [
    './src/modules/**/routes/*.ts',
    './src/docs/swagger-paths.ts',
    './src/docs/swagger-admin-paths.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
