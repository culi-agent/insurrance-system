# RBAC Design - Role-Based Access Control

## Thông tin tài liệu

| Field | Value |
|-------|-------|
| Phiên bản | 1.0 |
| RBAC Model | Hierarchical RBAC (NIST Level 2) |
| Ngày tạo | 2026-05-15 |

---

## 1. Tổng quan RBAC

### 1.1. RBAC Model Selection

Insurance System sử dụng **Hierarchical RBAC** (RBAC2 theo NIST):

```
┌─────────────────────────────────────────────────────────────┐
│                    RBAC HIERARCHY                              │
│                                                               │
│                    ┌──────────┐                               │
│                    │  Admin   │ (inherits all)                │
│                    └────┬─────┘                               │
│                         │                                     │
│            ┌────────────┼────────────┐                       │
│            ▼            ▼            ▼                       │
│      ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│      │ Operator │ │ Finance  │ │ Content  │                │
│      └────┬─────┘ └────┬─────┘ │ Manager  │                │
│           │             │       └────┬─────┘                │
│           │             │            │                       │
│           ▼             ▼            ▼                       │
│      ┌──────────────────────────────────┐                   │
│      │           Viewer                  │                   │
│      └──────────────────────────────────┘                   │
│                                                               │
│      ┌──────────┐              ┌──────────┐                 │
│      │ Customer │ (separate)   │ Partner  │ (separate)      │
│      └──────────┘              └──────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Core Concepts

| Concept | Mô tả |
|---------|--------|
| **User** | Tài khoản đã đăng ký trong hệ thống |
| **Role** | Tập hợp permissions gắn với chức năng |
| **Permission** | Quyền thực hiện một action trên resource |
| **Resource** | Đối tượng được bảo vệ (policy, claim, payment) |
| **Action** | Hành động trên resource (read, create, update, delete) |
| **Scope** | Phạm vi data (own, all, partner) |
| **Constraint** | Điều kiện bổ sung (KYC, amount, time) |

---

## 2. Data Model

### 2.1. Entity Relationship

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐
│   User   │──N:M─▶│  User_Role   │◀──N:M─│     Role     │
│          │       │              │       │              │
│ - id     │       │ - user_id    │       │ - id         │
│ - email  │       │ - role_id    │       │ - name       │
│ - status │       │ - granted_at │       │ - description│
└──────────┘       │ - granted_by │       │ - level      │
                   │ - expires_at │       │ - active     │
                   └──────────────┘       └──────┬───────┘
                                                  │
                                                  │ N:M
                                                  ▼
                                          ┌──────────────┐
                                          │Role_Permission│
                                          │              │
                                          │ - role_id    │
                                          │ - permission │
                                          │   _id        │
                                          └──────┬───────┘
                                                  │
                                                  │ N:1
                                                  ▼
                                          ┌──────────────┐
                                          │  Permission  │
                                          │              │
                                          │ - id         │
                                          │ - code       │
                                          │ - resource   │
                                          │ - action     │
                                          │ - scope      │
                                          │ - description│
                                          └──────────────┘
```

### 2.2. Database Schema

```sql
-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0, -- hierarchy level
  is_system BOOLEAN DEFAULT false,  -- cannot be deleted
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,  -- e.g. "policies:read"
  resource VARCHAR(50) NOT NULL,       -- e.g. "policies"
  action VARCHAR(50) NOT NULL,         -- e.g. "read"
  scope VARCHAR(20) DEFAULT 'own',     -- own, all, partner
  description TEXT,
  module VARCHAR(50),                  -- grouping
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission mapping
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES users(id)
);

-- User-Role mapping
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ,              -- optional expiry
  scope_data JSONB                     -- e.g. {"partner_id": "uuid"}
);

-- Role hierarchy
CREATE TABLE role_hierarchy (
  parent_role_id UUID REFERENCES roles(id),
  child_role_id UUID REFERENCES roles(id),
  PRIMARY KEY (parent_role_id, child_role_id)
);
```

---

## 3. Role Definitions

### 3.1. Customer Role

```json
{
  "name": "customer",
  "display_name": "Khách hàng",
  "level": 0,
  "is_system": true,
  "permissions": [
    "profile:read",
    "profile:write",
    "quotes:create",
    "quotes:read",
    "quotes:write",
    "policies:read",
    "policies:write",
    "claims:create",
    "claims:read",
    "claims:write",
    "payments:create",
    "payments:read",
    "payments:write",
    "notifications:read",
    "notifications:write",
    "documents:create",
    "documents:read",
    "documents:delete"
  ],
  "scope": "own",
  "constraints": {
    "data_access": "own_data_only",
    "kyc_required_for": ["policies:write", "claims:create", "payments:create"]
  }
}
```

### 3.2. Admin Role

```json
{
  "name": "admin",
  "display_name": "Quản trị viên",
  "level": 100,
  "is_system": true,
  "permissions": ["*"],
  "scope": "all",
  "constraints": {
    "max_users": 5,
    "requires_2fa": true,
    "ip_whitelist": true
  }
}
```

### 3.3. Operator Role

```json
{
  "name": "operator",
  "display_name": "Nhân viên vận hành",
  "level": 50,
  "is_system": true,
  "permissions": [
    "admin:dashboard",
    "admin:customers:read",
    "admin:customers:write",
    "admin:policies:read",
    "admin:claims:read",
    "admin:claims:assign",
    "admin:claims:decide",
    "admin:reports:read",
    "notifications:read",
    "notifications:write",
    "documents:create",
    "documents:read",
    "policies:read",
    "claims:read",
    "claims:write",
    "payments:read"
  ],
  "scope": "all",
  "constraints": {
    "claim_approval_limit": 10000000,
    "refund_limit": 5000000,
    "requires_2fa": true
  }
}
```

### 3.4. Partner Role

```json
{
  "name": "partner",
  "display_name": "Đối tác bảo hiểm",
  "level": 30,
  "is_system": true,
  "permissions": [
    "partner:products:read",
    "partner:products:write",
    "partner:policies:read",
    "partner:claims:read",
    "partner:claims:write",
    "partner:finance:read",
    "partner:reports:read",
    "partner:webhooks:read",
    "partner:webhooks:write"
  ],
  "scope": "partner",
  "constraints": {
    "data_access": "own_insurer_data_only",
    "requires_api_key": true
  }
}
```

### 3.5. Finance Role

```json
{
  "name": "finance",
  "display_name": "Nhân viên tài chính",
  "level": 40,
  "is_system": true,
  "permissions": [
    "admin:dashboard",
    "admin:policies:read",
    "admin:partners:read",
    "admin:reports:read",
    "payments:read",
    "payments:refund",
    "partner:finance:read"
  ],
  "scope": "all",
  "constraints": {
    "pii_access": "limited",
    "requires_2fa": true
  }
}
```

### 3.6. Content Manager Role

```json
{
  "name": "content_mgr",
  "display_name": "Quản lý nội dung",
  "level": 30,
  "is_system": true,
  "permissions": [
    "admin:products:read",
    "admin:products:write",
    "admin:dashboard",
    "documents:create",
    "documents:read"
  ],
  "scope": "all",
  "constraints": {
    "resource_types": ["products", "content", "documents"]
  }
}
```

### 3.7. Viewer Role

```json
{
  "name": "viewer",
  "display_name": "Người xem",
  "level": 10,
  "is_system": true,
  "permissions": [
    "admin:dashboard",
    "admin:customers:read",
    "admin:policies:read",
    "admin:claims:read",
    "admin:reports:read"
  ],
  "scope": "all",
  "constraints": {
    "pii_access": "masked",
    "read_only": true
  }
}
```

---

## 4. Role Assignment Rules

### 4.1. Assignment Rules

| Rule | Mô tả |
|------|--------|
| Default role | Mọi user mới đều có role `customer` |
| Single primary role | User có 1 primary role (customer HOẶC internal) |
| Multiple roles | Internal users có thể có nhiều roles (operator + finance) |
| Admin-only assignment | Chỉ Admin mới gán được role cho người khác |
| Self-assignment prohibited | Không ai tự nâng role cho mình |
| Audit trail | Mọi role change đều được log |
| Temporary roles | Role có thể có `expires_at` |

### 4.2. Role Transitions

```
┌─────────────────────────────────────────────────────────┐
│                  ROLE ASSIGNMENT FLOW                      │
│                                                           │
│  New User → customer (automatic)                         │
│                                                           │
│  Internal Staff:                                          │
│    Admin creates account → assigns role(s)               │
│    Admin → Operator (demotion: requires approval)        │
│    Viewer → Operator (promotion: requires admin)         │
│                                                           │
│  Partner:                                                │
│    BD team creates partner account                       │
│    Admin assigns partner role + scope (insurer_id)       │
│                                                           │
│  Termination:                                            │
│    Admin deactivates account → revoke all tokens         │
│    Role removal → immediate permission revocation        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Permission Resolution Algorithm

### 5.1. Resolution Flow

```typescript
async function checkPermission(
  user: User,
  requiredPermission: string,
  resource?: any
): Promise<boolean> {
  // 1. Get all user roles (including inherited)
  const roles = await getUserRolesWithHierarchy(user.id);

  // 2. Get all permissions from roles
  const permissions = await getPermissionsFromRoles(roles);

  // 3. Check wildcard
  if (permissions.includes('*')) return true;

  // 4. Check exact permission
  if (!permissions.includes(requiredPermission)) return false;

  // 5. Check scope (row-level)
  const scope = getPermissionScope(roles, requiredPermission);
  if (scope === 'own' && resource) {
    if (!isOwnedByUser(resource, user)) return false;
  }
  if (scope === 'partner' && resource) {
    if (!isBelongsToPartner(resource, user.partner_id)) return false;
  }

  // 6. Check constraints
  const constraints = getConstraints(roles);
  if (!satisfiesConstraints(constraints, resource)) return false;

  return true;
}
```

### 5.2. Hierarchy Resolution

```typescript
async function getUserRolesWithHierarchy(userId: string): Promise<Role[]> {
  // Get directly assigned roles
  const directRoles = await db.userRoles.findByUser(userId);

  // Get all child roles (inherited)
  const allRoles = new Set<Role>();
  for (const role of directRoles) {
    allRoles.add(role);
    const children = await getChildRoles(role.id);
    children.forEach(child => allRoles.add(child));
  }

  return Array.from(allRoles);
}
```

### 5.3. Conflict Resolution

| Scenario | Rule |
|----------|------|
| User has multiple roles | Union of all permissions (most permissive) |
| Permission in one role, denied in another | Allow wins (additive model) |
| Role expired | Permissions removed immediately |
| Account suspended | All permissions revoked |

---

## 6. Constraints System

### 6.1. Constraint Types

| Type | Mô tả | Ví dụ |
|------|--------|-------|
| **KYC Gate** | Yêu cầu KYC verified | Purchase, claim submission |
| **Amount Limit** | Giới hạn số tiền | Claim approval ≤ 10M |
| **Time Window** | Chỉ trong thời gian nhất định | Cancellation within cooling-off |
| **2FA Required** | Yêu cầu xác thực 2 lớp | Admin actions |
| **IP Whitelist** | Chỉ từ IP cho phép | Admin, Partner API |
| **Approval Chain** | Cần nhiều người approve | Claim > 100M |
| **Rate Limit** | Giới hạn frequency | Quote creation |

### 6.2. Constraint Configuration

```json
{
  "role": "operator",
  "constraints": [
    {
      "type": "amount_limit",
      "action": "claims:decide",
      "max_amount": 10000000,
      "currency": "VND",
      "escalate_to": "admin"
    },
    {
      "type": "2fa_required",
      "actions": ["admin:claims:decide", "payments:refund"],
      "method": "otp"
    },
    {
      "type": "working_hours",
      "timezone": "Asia/Ho_Chi_Minh",
      "hours": { "start": "08:00", "end": "18:00" },
      "days": ["mon", "tue", "wed", "thu", "fri"]
    }
  ]
}
```

---

## 7. Audit & Compliance

### 7.1. Audit Events

Tất cả actions liên quan đến RBAC được log:

| Event | Data Logged |
|-------|-------------|
| `rbac.role.assigned` | user_id, role_id, granted_by, timestamp |
| `rbac.role.revoked` | user_id, role_id, revoked_by, reason, timestamp |
| `rbac.permission.granted` | role_id, permission_id, granted_by |
| `rbac.permission.revoked` | role_id, permission_id, revoked_by |
| `rbac.access.granted` | user_id, permission, resource, timestamp |
| `rbac.access.denied` | user_id, permission, resource, reason, timestamp |
| `rbac.constraint.triggered` | user_id, constraint_type, action, timestamp |

### 7.2. Audit Log Schema

```json
{
  "id": "uuid",
  "timestamp": "2026-05-15T10:30:00.000Z",
  "event_type": "rbac.access.denied",
  "actor": {
    "user_id": "uuid",
    "role": "operator",
    "ip": "10.0.1.100"
  },
  "action": {
    "permission": "admin:claims:decide",
    "resource_type": "claim",
    "resource_id": "uuid"
  },
  "result": "denied",
  "reason": "amount_limit_exceeded",
  "details": {
    "claim_amount": 50000000,
    "operator_limit": 10000000
  }
}
```

### 7.3. Compliance Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Access Review | Monthly | All users and their roles |
| Permission Usage | Weekly | Which permissions used, by whom |
| Denied Access | Daily | All access denied events |
| Role Changes | Real-time | Alert on role assignments |
| Privileged Actions | Real-time | Admin actions log |

---

## 8. API Endpoints for RBAC Management

### 8.1. Role Management (Admin only)

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `GET /admin/rbac/roles` | GET | List all roles |
| `POST /admin/rbac/roles` | POST | Create custom role |
| `GET /admin/rbac/roles/:id` | GET | Role details + permissions |
| `PUT /admin/rbac/roles/:id` | PUT | Update role |
| `DELETE /admin/rbac/roles/:id` | DELETE | Delete custom role |
| `GET /admin/rbac/roles/:id/users` | GET | Users with this role |

### 8.2. Permission Management

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `GET /admin/rbac/permissions` | GET | List all permissions |
| `POST /admin/rbac/roles/:id/permissions` | POST | Add permission to role |
| `DELETE /admin/rbac/roles/:id/permissions/:pid` | DELETE | Remove permission |

### 8.3. User Role Assignment

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `GET /admin/users/:id/roles` | GET | User's roles |
| `POST /admin/users/:id/roles` | POST | Assign role to user |
| `DELETE /admin/users/:id/roles/:role_id` | DELETE | Remove role from user |

### 8.4. Access Check (Utility)

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `POST /admin/rbac/check` | POST | Check if user has permission |
| `GET /admin/rbac/my-permissions` | GET | Current user's effective permissions |

---

## 9. Implementation Guidelines

### 9.1. Caching Strategy

```typescript
// Permission cache (Redis)
// Key: user:{user_id}:permissions
// TTL: 5 minutes
// Invalidate on: role change, permission change, logout

class PermissionCache {
  async getPermissions(userId: string): Promise<string[]> {
    const cached = await redis.get(`user:${userId}:permissions`);
    if (cached) return JSON.parse(cached);

    const permissions = await resolvePermissions(userId);
    await redis.setex(
      `user:${userId}:permissions`,
      300, // 5 min TTL
      JSON.stringify(permissions)
    );
    return permissions;
  }

  async invalidate(userId: string): Promise<void> {
    await redis.del(`user:${userId}:permissions`);
  }

  async invalidateRole(roleId: string): Promise<void> {
    // Invalidate all users with this role
    const userIds = await getUsersByRole(roleId);
    const pipeline = redis.pipeline();
    userIds.forEach(id => pipeline.del(`user:${id}:permissions`));
    await pipeline.exec();
  }
}
```

### 9.2. Performance Considerations

| Concern | Solution |
|---------|----------|
| Permission check on every request | Redis cache (5 min TTL) |
| Role hierarchy traversal | Pre-compute and cache |
| Large permission sets in JWT | Include only essential permissions |
| Database queries | Materialized view for user → permissions |
| Cache invalidation | Event-driven (role change → invalidate) |

### 9.3. Testing

```typescript
// Permission test examples
describe('RBAC', () => {
  it('customer can only read own policies', async () => {
    const customer = await createCustomer();
    const ownPolicy = await createPolicy({ customer_id: customer.id });
    const otherPolicy = await createPolicy({ customer_id: 'other_uuid' });

    // Should succeed
    const res1 = await api.get(`/policies/${ownPolicy.id}`, customer.token);
    expect(res1.status).toBe(200);

    // Should fail
    const res2 = await api.get(`/policies/${otherPolicy.id}`, customer.token);
    expect(res2.status).toBe(403);
  });

  it('operator cannot approve claims over limit', async () => {
    const operator = await createOperator();
    const claim = await createClaim({ amount: 50000000 }); // 50M > 10M limit

    const res = await api.patch(
      `/admin/claims/${claim.id}/decision`,
      { decision: 'approved' },
      operator.token
    );
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('AMOUNT_LIMIT_EXCEEDED');
  });
});
```

---

## 10. Migration & Rollout Plan

### 10.1. Phase 1: Core RBAC (MVP)

- [x] Define roles: customer, admin, operator, partner
- [ ] Implement permission middleware
- [ ] Database schema + seed data
- [ ] JWT includes role + basic permissions
- [ ] Admin UI for role assignment

### 10.2. Phase 2: Advanced Features

- [ ] Custom roles (admin-created)
- [ ] Constraints system (amount limits, 2FA)
- [ ] Audit logging
- [ ] Permission caching (Redis)
- [ ] Role hierarchy

### 10.3. Phase 3: Enterprise Features

- [ ] Organization/tenant support (B2B)
- [ ] Delegated administration
- [ ] Approval workflows
- [ ] Compliance reports
- [ ] ABAC integration (attribute-based, future)
