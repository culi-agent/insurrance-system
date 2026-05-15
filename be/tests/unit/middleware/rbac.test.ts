import { Request, Response, NextFunction } from 'express';
import {
  requireRoles,
  requirePermission,
  requireOwnerOrAdmin,
  hasPermission,
  ROLE_PERMISSIONS,
  Role,
} from '../../../src/shared/middleware/rbac';
import { ForbiddenError, UnauthorizedError } from '../../../src/shared/errors/AppError';
import { AuthenticatedRequest } from '../../../src/shared/types';

describe('RBAC Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      user: undefined,
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('hasPermission', () => {
    it('superadmin should have access to everything', () => {
      expect(hasPermission('superadmin', 'products', 'create')).toBe(true);
      expect(hasPermission('superadmin', 'customers', 'delete')).toBe(true);
      expect(hasPermission('superadmin', 'anything', 'manage')).toBe(true);
    });

    it('admin should have manage access to products', () => {
      expect(hasPermission('admin', 'products', 'create')).toBe(true);
      expect(hasPermission('admin', 'products', 'read')).toBe(true);
      expect(hasPermission('admin', 'products', 'update')).toBe(true);
      expect(hasPermission('admin', 'products', 'delete')).toBe(true);
    });

    it('admin should have read/update access to customers', () => {
      expect(hasPermission('admin', 'customers', 'read')).toBe(true);
      expect(hasPermission('admin', 'customers', 'update')).toBe(true);
      expect(hasPermission('admin', 'customers', 'delete')).toBe(false);
    });

    it('partner should have read/update access to products', () => {
      expect(hasPermission('partner', 'products', 'read')).toBe(true);
      expect(hasPermission('partner', 'products', 'update')).toBe(true);
      expect(hasPermission('partner', 'products', 'create')).toBe(false);
      expect(hasPermission('partner', 'products', 'delete')).toBe(false);
    });

    it('customer should have read-only access to products', () => {
      expect(hasPermission('customer', 'products', 'read')).toBe(true);
      expect(hasPermission('customer', 'products', 'create')).toBe(false);
      expect(hasPermission('customer', 'products', 'update')).toBe(false);
      expect(hasPermission('customer', 'products', 'delete')).toBe(false);
    });

    it('customer should be able to create quotations', () => {
      expect(hasPermission('customer', 'quotations', 'create')).toBe(true);
      expect(hasPermission('customer', 'quotations', 'read')).toBe(true);
    });

    it('customer should have manage access to their profile', () => {
      expect(hasPermission('customer', 'profile', 'create')).toBe(true);
      expect(hasPermission('customer', 'profile', 'read')).toBe(true);
      expect(hasPermission('customer', 'profile', 'update')).toBe(true);
    });

    it('should return false for unknown role', () => {
      expect(hasPermission('unknown' as Role, 'products', 'read')).toBe(false);
    });
  });

  describe('requireRoles', () => {
    it('should pass for user with required role', () => {
      mockReq.user = { id: 'uuid-1', email: 'admin@test.com', role: 'admin' };

      const middleware = requireRoles('admin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass for superadmin regardless of required roles', () => {
      mockReq.user = { id: 'uuid-1', email: 'super@test.com', role: 'superadmin' };

      const middleware = requireRoles('admin', 'partner');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError for unauthorized role', () => {
      mockReq.user = { id: 'uuid-1', email: 'customer@test.com', role: 'customer' };

      const middleware = requireRoles('admin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next with UnauthorizedError when no user', () => {
      mockReq.user = undefined;

      const middleware = requireRoles('admin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should accept any of multiple required roles', () => {
      mockReq.user = { id: 'uuid-1', email: 'partner@test.com', role: 'partner' };

      const middleware = requireRoles('admin', 'partner');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requirePermission', () => {
    it('should pass when user has required permission', () => {
      mockReq.user = { id: 'uuid-1', email: 'admin@test.com', role: 'admin' };

      const middleware = requirePermission('products', 'create');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError when user lacks permission', () => {
      mockReq.user = { id: 'uuid-1', email: 'customer@test.com', role: 'customer' };

      const middleware = requirePermission('products', 'create');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next with UnauthorizedError when no user', () => {
      mockReq.user = undefined;

      const middleware = requirePermission('products', 'read');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('superadmin should pass any permission check', () => {
      mockReq.user = { id: 'uuid-1', email: 'super@test.com', role: 'superadmin' };

      const middleware = requirePermission('anything', 'delete');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireOwnerOrAdmin', () => {
    it('should pass when user is the resource owner', () => {
      mockReq.user = { id: 'uuid-1', email: 'user@test.com', role: 'customer' };
      mockReq.params = { id: 'uuid-1' };

      const middleware = requireOwnerOrAdmin();
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass when user is admin (even if not owner)', () => {
      mockReq.user = { id: 'uuid-admin', email: 'admin@test.com', role: 'admin' };
      mockReq.params = { id: 'uuid-other' };

      const middleware = requireOwnerOrAdmin();
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass when user is superadmin (even if not owner)', () => {
      mockReq.user = { id: 'uuid-super', email: 'super@test.com', role: 'superadmin' };
      mockReq.params = { id: 'uuid-other' };

      const middleware = requireOwnerOrAdmin();
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError when user is not owner and not admin', () => {
      mockReq.user = { id: 'uuid-1', email: 'user@test.com', role: 'customer' };
      mockReq.params = { id: 'uuid-other' };

      const middleware = requireOwnerOrAdmin();
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should use custom param name for user ID', () => {
      mockReq.user = { id: 'uuid-1', email: 'user@test.com', role: 'customer' };
      mockReq.params = { userId: 'uuid-1' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with UnauthorizedError when no user', () => {
      mockReq.user = undefined;
      mockReq.params = { id: 'uuid-1' };

      const middleware = requireOwnerOrAdmin();
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('ROLE_PERMISSIONS structure', () => {
    it('should define permissions for all roles', () => {
      expect(ROLE_PERMISSIONS).toHaveProperty('superadmin');
      expect(ROLE_PERMISSIONS).toHaveProperty('admin');
      expect(ROLE_PERMISSIONS).toHaveProperty('partner');
      expect(ROLE_PERMISSIONS).toHaveProperty('customer');
    });

    it('superadmin should have wildcard permission', () => {
      const superPerms = ROLE_PERMISSIONS.superadmin;
      expect(superPerms).toContainEqual({ resource: '*', action: 'manage' });
    });

    it('admin should have dashboard read access', () => {
      const adminPerms = ROLE_PERMISSIONS.admin;
      expect(adminPerms).toContainEqual({ resource: 'dashboard', action: 'read' });
    });

    it('customer should have policies read access', () => {
      const customerPerms = ROLE_PERMISSIONS.customer;
      expect(customerPerms).toContainEqual({ resource: 'policies', action: 'read' });
    });
  });
});
