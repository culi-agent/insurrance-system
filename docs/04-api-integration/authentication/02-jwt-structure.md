# JWT Structure - Cấu Trúc JSON Web Token

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Standard | RFC 7519 (JWT), RFC 7515 (JWS) |
| Algorithm | RS256 (RSA + SHA-256) |
| Key Size | 2048-bit RSA |
| Key Rotation | Every 90 days |

---

## 1. Tổng quan

### 1.1. JWT trong Insurance System

```
┌─────────────────────────────────────────────────────────────┐
│                        JWT TOKEN                              │
│                                                               │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  HEADER  │ .  │   PAYLOAD    │ .  │    SIGNATURE     │  │
│  │          │    │   (Claims)   │    │                  │  │
│  │ alg:RS256│    │ sub, role,   │    │ RSA-SHA256(      │  │
│  │ typ:JWT  │    │ permissions, │    │   header.payload,│  │
│  │ kid:key1 │    │ exp, iat...  │    │   private_key    │  │
│  │          │    │              │    │ )                │  │
│  └──────────┘    └──────────────┘    └──────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Token Types

| Token | Purpose | Lifetime | Stored |
|-------|---------|----------|--------|
| **Access Token** | API authorization | 15 phút | Memory (frontend) |
| **Refresh Token** | Renew access token | 7-30 ngày | HttpOnly cookie |
| **ID Token** | User identity (OIDC) | 15 phút | Memory (frontend) |

---

## 2. Access Token Structure

### 2.1. Header

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-2026-05-01"
}
```

| Field | Mô tả |
|-------|--------|
| `alg` | Signing algorithm (RS256 = RSA + SHA-256) |
| `typ` | Token type (always JWT) |
| `kid` | Key ID - identify which public key to use for verification |

### 2.2. Payload (Claims)

```json
{
  "iss": "https://auth.insurance-system.vn",
  "sub": "user_uuid_123",
  "aud": "https://api.insurance-system.vn",
  "exp": 1715769900,
  "iat": 1715769000,
  "nbf": 1715769000,
  "jti": "token_unique_id_abc",
  "type": "access",
  "role": "customer",
  "permissions": [
    "read:profile",
    "write:profile",
    "read:policies",
    "write:policies",
    "read:claims",
    "write:claims",
    "read:payments",
    "write:payments"
  ],
  "kyc_status": "verified",
  "session_id": "sess_uuid_456",
  "client_id": "app_frontend"
}
```

### 2.3. Claim Definitions

#### Registered Claims (RFC 7519)

| Claim | Type | Required | Mô tả |
|-------|------|----------|--------|
| `iss` | string | ✅ | Issuer - Auth server URL |
| `sub` | string (UUID) | ✅ | Subject - User ID |
| `aud` | string/array | ✅ | Audience - API server URL |
| `exp` | number (Unix) | ✅ | Expiration time |
| `iat` | number (Unix) | ✅ | Issued at |
| `nbf` | number (Unix) | ✅ | Not valid before |
| `jti` | string (UUID) | ✅ | JWT ID (unique, for revocation) |

#### Custom Claims (Insurance System)

| Claim | Type | Required | Mô tả |
|-------|------|----------|--------|
| `type` | string | ✅ | Token type: `access` / `refresh` / `id` |
| `role` | string | ✅ | User role: `customer` / `admin` / `operator` / `partner` |
| `permissions` | string[] | ✅ | Array of granted permissions |
| `kyc_status` | string | ⬜ | KYC status: `pending` / `verified` / `rejected` |
| `session_id` | string (UUID) | ✅ | Session identifier |
| `client_id` | string | ✅ | OAuth client that requested the token |
| `partner_id` | string (UUID) | ⬜ | Partner ID (for partner tokens only) |
| `org_id` | string (UUID) | ⬜ | Organization ID (B2B, future) |

---

## 3. Refresh Token Structure

### 3.1. Payload

```json
{
  "iss": "https://auth.insurance-system.vn",
  "sub": "user_uuid_123",
  "aud": "https://auth.insurance-system.vn",
  "exp": 1716373800,
  "iat": 1715769000,
  "jti": "refresh_token_unique_id",
  "type": "refresh",
  "session_id": "sess_uuid_456",
  "client_id": "app_frontend",
  "scope": "read:profile write:profile read:policies write:policies",
  "rotation_counter": 3
}
```

### 3.2. Refresh Token Specific Claims

| Claim | Type | Mô tả |
|-------|------|--------|
| `scope` | string | Original granted scopes |
| `rotation_counter` | number | Số lần đã rotate (detect reuse) |

### 3.3. Refresh Token Security

- Stored as opaque reference in database (JWT + DB hybrid)
- Each refresh creates new pair (rotation)
- Old refresh token immediately invalidated
- Reuse detection → revoke all tokens in family

---

## 4. ID Token Structure (OpenID Connect)

### 4.1. Payload

```json
{
  "iss": "https://auth.insurance-system.vn",
  "sub": "user_uuid_123",
  "aud": "app_client_id",
  "exp": 1715769900,
  "iat": 1715769000,
  "auth_time": 1715768900,
  "nonce": "random_nonce_from_request",
  "at_hash": "hash_of_access_token",
  "type": "id",
  "email": "user@example.com",
  "email_verified": true,
  "name": "Nguyễn Văn A",
  "phone_number": "+84901234567",
  "phone_number_verified": true,
  "picture": null,
  "updated_at": 1715769000
}
```

### 4.2. ID Token Specific Claims

| Claim | Mô tả |
|-------|--------|
| `auth_time` | Thời điểm user thực sự authenticate |
| `nonce` | Replay prevention (from authorization request) |
| `at_hash` | Access token hash (binding) |
| `email` | User email |
| `email_verified` | Email đã xác minh |
| `name` | Full name |
| `phone_number` | Phone (E.164 format) |
| `phone_number_verified` | Phone đã xác minh |

---

## 5. Partner Token Structure

### 5.1. Client Credentials Token (Partner/M2M)

```json
{
  "iss": "https://auth.insurance-system.vn",
  "sub": "partner_client_id",
  "aud": "https://api.insurance-system.vn",
  "exp": 1715772600,
  "iat": 1715769000,
  "jti": "partner_token_id",
  "type": "access",
  "role": "partner",
  "partner_id": "partner_uuid_789",
  "partner_name": "Bảo Việt",
  "permissions": [
    "partner:read",
    "partner:write",
    "partner:quotes",
    "partner:policies",
    "partner:claims"
  ],
  "client_id": "baoviet_api_client",
  "rate_limit_tier": "partner_premium"
}
```

### 5.2. Partner Specific Claims

| Claim | Type | Mô tả |
|-------|------|--------|
| `partner_id` | UUID | Partner organization ID |
| `partner_name` | string | Partner display name |
| `rate_limit_tier` | string | Rate limit tier applied |

---

## 6. Token Signing & Verification

### 6.1. Key Management

| Aspect | Giá trị |
|--------|---------|
| Algorithm | RS256 (RSA-PKCS1-v1_5 + SHA-256) |
| Key Size | 2048-bit minimum (4096-bit recommended) |
| Key Rotation | Every 90 days |
| Active Keys | 2 (current + previous for graceful rotation) |
| Storage | AWS KMS / HashiCorp Vault |

### 6.2. JWKS (JSON Web Key Set)

```
GET https://auth.insurance-system.vn/.well-known/jwks.json
```

```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-2026-05-01",
      "alg": "RS256",
      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM...",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-2026-02-01",
      "alg": "RS256",
      "n": "1hMkFVrFhH5PEsO2OYlCX4BHhwOlvEIdKN8kF0t7...",
      "e": "AQAB"
    }
  ]
}
```

### 6.3. Token Verification (Resource Server)

```typescript
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://auth.insurance-system.vn/.well-known/jwks.json',
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err) return callback(err);
    const signingKey = key!.getPublicKey();
    callback(null, signingKey);
  });
}

async function verifyToken(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: 'https://auth.insurance-system.vn',
      audience: 'https://api.insurance-system.vn',
      clockTolerance: 30, // 30s tolerance
    }, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as JWTPayload);
    });
  });
}
```

---

## 7. Token Size Considerations

### 7.1. Size Breakdown

| Component | Approximate Size |
|-----------|-----------------|
| Header (base64) | ~80 bytes |
| Payload (base64) | ~400-600 bytes |
| Signature (base64) | ~340 bytes |
| **Total** | **~800-1100 bytes** |

### 7.2. Size Optimization Rules

| Rule | Mô tả |
|------|--------|
| Short claim names | Use abbreviations where standard (e.g., `sub`, `iss`) |
| No sensitive data | Never put PII (email, phone) in access token |
| Minimal permissions | Only include relevant permissions |
| No redundant data | Don't duplicate info available via API |
| Reference over embed | Use IDs, not full objects |

---

## 8. Security Considerations

### 8.1. What NOT to Put in JWT

| ❌ Never Include | Lý do |
|-----------------|--------|
| Password hash | Security risk |
| Full PII (address, DOB) | Privacy, token size |
| Financial data | Sensitive |
| Secrets/API keys | Security risk |
| Large datasets | Performance |

### 8.2. Token Revocation Strategy

Vì JWT là stateless, revocation cần cơ chế bổ sung:

```
┌─────────────────────────────────────────┐
│         TOKEN REVOCATION METHODS          │
├─────────────────────────────────────────┤
│                                           │
│  1. Short-lived access tokens (15 min)   │
│     → Hết hạn tự nhiên                   │
│                                           │
│  2. Refresh token revocation (DB)        │
│     → Delete from DB → cannot refresh    │
│                                           │
│  3. Token blacklist (Redis)              │
│     → Check jti against blacklist        │
│     → TTL = remaining token lifetime     │
│                                           │
│  4. Version claim                        │
│     → Increment user token_version       │
│     → Reject tokens with old version     │
│                                           │
└─────────────────────────────────────────┘
```

**Implementation: Redis Blacklist**
```typescript
async function isTokenRevoked(jti: string): Promise<boolean> {
  const revoked = await redis.get(`revoked:${jti}`);
  return revoked !== null;
}

async function revokeToken(jti: string, expiresAt: number): Promise<void> {
  const ttl = expiresAt - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`revoked:${jti}`, ttl, '1');
  }
}
```

### 8.3. Clock Skew Handling

- Server-side: Accept tokens with ±30s clock tolerance
- Client-side: Refresh token 60s before expiry (buffer)
- NTP sync required on all servers

---

## 9. Token Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      TOKEN LIFECYCLE                               │
│                                                                     │
│  Login                                                             │
│    │                                                               │
│    ▼                                                               │
│  Access Token (15 min) ──── API Calls ──── Expired?               │
│    │                                          │                    │
│    │                                    Yes   │   No               │
│    │                                    │     │   │                │
│    │                                    ▼     │   ▼                │
│    │                              Refresh     │  Continue          │
│    │                              Token       │                    │
│    │                                │         │                    │
│    │                                ▼         │                    │
│    │                          New Access      │                    │
│    │                          Token           │                    │
│    │                                          │                    │
│  Refresh Token (7-30 days) ──── Expired? ─── Yes ──▶ Re-login    │
│                                                                     │
│  Logout → Revoke all tokens                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```
