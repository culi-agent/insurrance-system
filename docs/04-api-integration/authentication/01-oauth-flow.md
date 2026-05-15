# OAuth Flow Documentation

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| OAuth Version | OAuth 2.0 (RFC 6749) |
| Authorization Server | `https://auth.insurance-system.vn` |
| Token Format | JWT (RFC 7519) |
| PKCE Support | Yes (RFC 7636) |

---

## 1. Tổng quan

### 1.1. OAuth 2.0 Flows được hỗ trợ

| Flow | Sử dụng cho | Security Level |
|------|-------------|----------------|
| **Authorization Code + PKCE** | Web app (SPA), Mobile app | High |
| **Client Credentials** | Service-to-service (M2M), Partner APIs | High |
| **Resource Owner Password** | First-party mobile app (legacy) | Medium |
| **Refresh Token** | Renew access token | High |

### 1.2. OAuth Endpoints

| Endpoint | URL | Mô tả |
|----------|-----|--------|
| Authorization | `GET /oauth/authorize` | User consent screen |
| Token | `POST /oauth/token` | Exchange code/credentials for tokens |
| Refresh | `POST /oauth/refresh` | Refresh access token |
| Revoke | `POST /oauth/revoke` | Revoke token |
| UserInfo | `GET /oauth/userinfo` | Get authenticated user info |
| JWKS | `GET /.well-known/jwks.json` | Public keys for JWT verification |
| Discovery | `GET /.well-known/openid-configuration` | OpenID Connect discovery |

---

## 2. Flow 1: Authorization Code + PKCE (Recommended)

### 2.1. Khi nào sử dụng

- Web application (SPA - React/Vue/Angular)
- Mobile application (future)
- Third-party applications tích hợp với Insurance System

### 2.2. Flow Diagram

```
┌────────┐                              ┌────────────────┐          ┌────────────┐
│  User  │                              │  Client App    │          │  Auth      │
│(Browser)│                              │  (Frontend)    │          │  Server    │
└───┬────┘                              └───────┬────────┘          └─────┬──────┘
    │                                           │                         │
    │  1. Click "Login"                         │                         │
    │──────────────────────────────────────────▶│                         │
    │                                           │                         │
    │                 2. Generate code_verifier + code_challenge           │
    │                                           │                         │
    │  3. Redirect to /oauth/authorize          │                         │
    │◀──────────────────────────────────────────│                         │
    │                                           │                         │
    │  4. Show login/consent page               │                         │
    │──────────────────────────────────────────────────────────────────▶ │
    │                                           │                         │
    │  5. User authenticates                    │                         │
    │──────────────────────────────────────────────────────────────────▶ │
    │                                           │                         │
    │  6. Redirect with authorization_code      │                         │
    │◀──────────────────────────────────────────────────────────────────  │
    │                                           │                         │
    │  7. Extract code from URL                 │                         │
    │──────────────────────────────────────────▶│                         │
    │                                           │                         │
    │                 8. POST /oauth/token       │                         │
    │                    (code + code_verifier)  │                         │
    │                                           │────────────────────────▶│
    │                                           │                         │
    │                 9. Return tokens           │                         │
    │                    (access + refresh)      │                         │
    │                                           │◀────────────────────────│
    │                                           │                         │
    │  10. Authenticated! Store tokens          │                         │
    │◀──────────────────────────────────────────│                         │
    │                                           │                         │
```

### 2.3. Step-by-Step Implementation

#### Step 1: Generate PKCE Parameters

```typescript
// Generate code_verifier (43-128 characters, URL-safe)
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// Generate code_challenge from code_verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
```

#### Step 2: Authorization Request

```
GET https://auth.insurance-system.vn/oauth/authorize
  ?response_type=code
  &client_id=app_client_id
  &redirect_uri=https://insurance-system.vn/callback
  &scope=read:profile write:profile read:policies write:policies
  &state=random_state_string
  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  &code_challenge_method=S256
```

**Parameters:**

| Param | Required | Mô tả |
|-------|----------|--------|
| `response_type` | Yes | Always `code` |
| `client_id` | Yes | Application client ID |
| `redirect_uri` | Yes | Registered callback URL |
| `scope` | Yes | Space-separated scopes |
| `state` | Yes | CSRF protection (random string) |
| `code_challenge` | Yes | PKCE challenge |
| `code_challenge_method` | Yes | Always `S256` |

#### Step 3: User Authentication

Auth server hiển thị login page. User nhập credentials hoặc chọn social login.

#### Step 4: Authorization Callback

```
HTTP 302 Found
Location: https://insurance-system.vn/callback
  ?code=AUTH_CODE_HERE
  &state=random_state_string
```

#### Step 5: Exchange Code for Tokens

```
POST https://auth.insurance-system.vn/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_HERE
&redirect_uri=https://insurance-system.vn/callback
&client_id=app_client_id
&code_verifier=ORIGINAL_CODE_VERIFIER
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": "read:profile write:profile read:policies write:policies",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Flow 2: Client Credentials (Machine-to-Machine)

### 3.1. Khi nào sử dụng

- Insurer partner APIs gọi đến Insurance System
- Backend service-to-service communication
- Cron jobs, background workers
- Automated systems (không có user context)

### 3.2. Flow Diagram

```
┌────────────────┐                    ┌────────────────┐
│  Partner       │                    │  Auth Server   │
│  Backend       │                    │                │
└───────┬────────┘                    └───────┬────────┘
        │                                     │
        │  1. POST /oauth/token               │
        │     (client_id + client_secret)     │
        │────────────────────────────────────▶│
        │                                     │
        │  2. Validate credentials            │
        │                                     │
        │  3. Return access_token             │
        │◀────────────────────────────────────│
        │                                     │
        │  4. Call API with Bearer token      │
        │────────────────────────────────────▶│ (Resource Server)
        │                                     │
```

### 3.3. Token Request

```
POST https://auth.insurance-system.vn/oauth/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=client_credentials
&scope=partner:read partner:write
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "partner:read partner:write"
}
```

**Note:** Client Credentials flow KHÔNG trả về refresh_token.

---

## 4. Flow 3: Refresh Token

### 4.1. Khi nào sử dụng

- Access token hết hạn (15 phút)
- Duy trì session mà không cần user re-authenticate
- Silent token renewal trong SPA

### 4.2. Request

```
POST https://auth.insurance-system.vn/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=CURRENT_REFRESH_TOKEN
&client_id=app_client_id
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJ...(new access token)",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "eyJ...(new refresh token)",
  "scope": "read:profile write:profile read:policies"
}
```

### 4.3. Refresh Token Rotation

- Mỗi lần refresh → cả access_token VÀ refresh_token đều mới
- Old refresh token bị invalidate ngay lập tức
- Nếu old refresh token bị sử dụng lại → revoke toàn bộ session (possible theft)

---

## 5. Social Login (Google / Facebook)

### 5.1. Google OAuth Flow

```
┌────────┐     ┌──────────┐     ┌────────┐     ┌────────────┐
│  User  │────▶│ Platform │────▶│ Google │────▶│ Auth Server│
│        │     │ Frontend │     │ OAuth  │     │ (verify)   │
└────────┘     └──────────┘     └────────┘     └────────────┘
                                     │
                                     ▼
                              Google ID Token
                                     │
                                     ▼
                    Platform verifies → Create/Link account
                                     │
                                     ▼
                         Issue Platform JWT tokens
```

#### Google OAuth Configuration

| Field | Value |
|-------|-------|
| Authorization URL | `https://accounts.google.com/o/oauth2/v2/auth` |
| Token URL | `https://oauth2.googleapis.com/token` |
| Scopes | `openid profile email` |
| Client ID | `{GOOGLE_CLIENT_ID}` |
| Redirect URI | `https://insurance-system.vn/auth/google/callback` |

#### Backend Token Verification

```typescript
// Verify Google ID token
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    email_verified: payload.email_verified,
    google_id: payload.sub,
  };
}
```

### 5.2. Facebook OAuth Flow

| Field | Value |
|-------|-------|
| Authorization URL | `https://www.facebook.com/v18.0/dialog/oauth` |
| Token URL | `https://graph.facebook.com/v18.0/oauth/access_token` |
| Scopes | `email,public_profile` |
| App ID | `{FACEBOOK_APP_ID}` |
| Redirect URI | `https://insurance-system.vn/auth/facebook/callback` |

---

## 6. Token Lifecycle

### 6.1. Token Expiration

| Token | Expiration (Normal) | Expiration (Remember Me) |
|-------|---------------------|--------------------------|
| Access Token | 15 phút | 15 phút |
| Refresh Token | 7 ngày | 30 ngày |
| ID Token | 15 phút | 15 phút |
| Authorization Code | 5 phút | 5 phút |

### 6.2. Token Revocation

```
POST https://auth.insurance-system.vn/oauth/revoke
Content-Type: application/x-www-form-urlencoded

token=REFRESH_TOKEN_TO_REVOKE
&token_type_hint=refresh_token
&client_id=app_client_id
```

**Revocation Triggers:**
- User logout
- Password change
- Account compromised
- Admin force logout
- Session limit exceeded

### 6.3. Session Management

| Rule | Value |
|------|-------|
| Max concurrent sessions | 5 devices |
| Inactive session timeout | 30 days (refresh token expiry) |
| Force logout on password change | Yes (all sessions) |
| New device notification | Yes (email) |

---

## 7. Scopes

### 7.1. Available Scopes

| Scope | Mô tả | Granted To |
|-------|--------|-----------|
| `openid` | OpenID Connect identity | All users |
| `profile` | Basic profile info | All users |
| `email` | Email address | All users |
| `read:profile` | Read customer profile | Customers |
| `write:profile` | Update customer profile | Customers |
| `read:policies` | View policies | Customers, Admins |
| `write:policies` | Create/modify policies | Customers, Admins |
| `read:claims` | View claims | Customers, Admins |
| `write:claims` | Submit/modify claims | Customers, Admins |
| `read:payments` | View payment history | Customers, Admins |
| `write:payments` | Initiate payments | Customers, Admins |
| `read:quotes` | View quotes | Customers, Admins |
| `write:quotes` | Create quotes | Customers, Admins |
| `admin` | Full admin access | Admin users only |
| `partner:read` | Partner read access | Insurer partners |
| `partner:write` | Partner write access | Insurer partners |

### 7.2. Scope Validation

- Scopes được kiểm tra tại Resource Server (API Gateway)
- Token chỉ chứa scopes đã được user consent
- Admin scopes chỉ cấp cho users có role admin
- Partner scopes chỉ cấp cho client credentials flow

---

## 8. Security Best Practices

### 8.1. PKCE (Proof Key for Code Exchange)

| Requirement | Mô tả |
|-------------|--------|
| Bắt buộc cho | Public clients (SPA, mobile) |
| Method | S256 (SHA-256) - plain không được phép |
| code_verifier length | 43-128 characters |
| Charset | `[A-Z] / [a-z] / [0-9] / - . _ ~` |

### 8.2. State Parameter

- PHẢI sử dụng `state` parameter
- Random, unpredictable value (min 32 bytes)
- Stored in session/localStorage trước khi redirect
- Verified sau khi callback
- Prevent CSRF attacks

### 8.3. Token Storage (Frontend)

| Storage | Access Token | Refresh Token | Recommendation |
|---------|-------------|---------------|----------------|
| Memory (variable) | ✅ Best | ❌ Lost on refresh | Access token |
| HttpOnly Cookie | ✅ Good | ✅ Best | Refresh token |
| localStorage | ⚠️ XSS risk | ❌ Never | Avoid |
| sessionStorage | ⚠️ XSS risk | ❌ Never | Avoid |

**Recommended Pattern:**
- Access token: In-memory (JavaScript variable)
- Refresh token: HttpOnly, Secure, SameSite=Strict cookie
- On page load: Silent refresh to get new access token

### 8.4. Additional Security Measures

| Measure | Implementation |
|---------|---------------|
| CORS | Restrict to known origins |
| Content Security Policy | Strict CSP headers |
| Token binding | Bind token to device fingerprint (future) |
| DPoP | Demonstrating Proof of Possession (future) |

---

## 9. Error Responses

| Error | HTTP Code | Mô tả |
|-------|-----------|--------|
| `invalid_request` | 400 | Missing/invalid parameters |
| `invalid_client` | 401 | Client authentication failed |
| `invalid_grant` | 400 | Invalid code or refresh token |
| `unauthorized_client` | 403 | Client not authorized for grant type |
| `unsupported_grant_type` | 400 | Grant type not supported |
| `invalid_scope` | 400 | Invalid or excessive scope |
| `access_denied` | 403 | User denied consent |
| `server_error` | 500 | Internal server error |

**Error Response Format:**
```json
{
  "error": "invalid_grant",
  "error_description": "The authorization code has expired",
  "error_uri": "https://developer.insurance-system.vn/docs/errors#invalid_grant"
}
```

---

## 10. OpenID Connect Discovery

```
GET https://auth.insurance-system.vn/.well-known/openid-configuration
```

```json
{
  "issuer": "https://auth.insurance-system.vn",
  "authorization_endpoint": "https://auth.insurance-system.vn/oauth/authorize",
  "token_endpoint": "https://auth.insurance-system.vn/oauth/token",
  "userinfo_endpoint": "https://auth.insurance-system.vn/oauth/userinfo",
  "jwks_uri": "https://auth.insurance-system.vn/.well-known/jwks.json",
  "revocation_endpoint": "https://auth.insurance-system.vn/oauth/revoke",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "client_credentials", "refresh_token"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "profile", "email", "read:profile", "write:profile", "read:policies", "write:policies"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post", "none"],
  "code_challenge_methods_supported": ["S256"]
}
```
