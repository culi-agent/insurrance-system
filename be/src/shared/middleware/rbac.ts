import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

/**
 * RBAC - Role-Based Access Control Middleware
 * Sprint 2: S2-05
 *
 * Roles hierarchy:
 * - superadmin: Full system access
 * - admin: Product/customer management, reports
 * - partner: Limited to their own insurer products
 * - customer: Self-service operations
 */

export type Role = 'superadmin' | 'admin' | 'partner' | 'customer';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// Permission matrix by role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  superadmin: [
    { resource: '*', action: 'manage' },
  ],
  admin: [
    { resource: 'products', action: 'manage' },
    { resource: 'categories', action: 'manage' },
    { resource: 'insurers', action: 'manage' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'update' },
    { resource: 'quotations', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'dashboard', action: 'read' },
  ],
  partner: [
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'quotations', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'profile', action: 'manage' },
  ],
  customer: [
    { resource: 'products', action: 'read' },
    { resource: 'categories', action: 'read' },
    { resource: 'quotations', action: 'create' },
    { resource: 'quotations', action: 'read' },
    { resource: 'profile', action: 'manage' },
    { resource: 'policies', action: 'read' },
  ],
};

/**
 * Check if a role has a specific permission
 */
function hasPermission(role: Role, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  return permissions.some((perm) => {
    // Wildcard resource
    if (perm.resource === '*' && perm.action === 'manage') return true;
    // Exact match
    if (perm.resource === resource && perm.action === action) return true;
    // Manage includes all actions
    if (perm.resource === resource && perm.action === 'manage') return true;
    return false;
  });
}

/**
 * Middleware: Require specific roles
 */
export function requireRoles(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role as Role;
    if (!roles.includes(userRole) && userRole !== 'superadmin') {
      return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này'));
    }

    next();
  };
}

/**
 * Middleware: Require specific permission on resource
 */
export function requirePermission(resource: string, action: Permission['action']) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role as Role;
    if (!hasPermission(userRole, resource, action)) {
      return next(
        new ForbiddenError(
          `Bạn không có quyền ${action} trên ${resource}`,
        ),
      );
    }

    next();
  };
}

/**
 * Middleware: Owner-only access (user can only access their own resources)
 */
export function requireOwnerOrAdmin(userIdParam: string = 'id') {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role as Role;
    const resourceUserId = req.params[userIdParam];

    // Admin and superadmin can access all resources
    if (userRole === 'superadmin' || userRole === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req.user.id !== resourceUserId) {
      return next(new ForbiddenError('Bạn chỉ có thể truy cập tài nguyên của mình'));
    }

    next();
  };
}

export { hasPermission, ROLE_PERMISSIONS };
