import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../../../src/shared/middleware/authenticate';
import { UnauthorizedError } from '../../../src/shared/errors/AppError';
import { AuthenticatedRequest } from '../../../src/shared/types';

describe('Authentication Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined,
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should set req.user for valid access token', () => {
      const payload = { id: 'uuid-1', email: 'test@example.com', role: 'customer' };
      const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'test-access-secret', {
        expiresIn: '15m',
      });
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user!.id).toBe(payload.id);
      expect(mockReq.user!.email).toBe(payload.email);
      expect(mockReq.user!.role).toBe(payload.role);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with UnauthorizedError when no auth header', () => {
      mockReq.headers = {};

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError for malformed auth header', () => {
      mockReq.headers = { authorization: 'InvalidFormat token123' };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError for expired token', () => {
      const payload = { id: 'uuid-1', email: 'test@example.com', role: 'customer' };
      const expiredToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'test-access-secret', {
        expiresIn: '-1s',
      });
      mockReq.headers = { authorization: `Bearer ${expiredToken}` };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError for token with wrong secret', () => {
      const payload = { id: 'uuid-1', email: 'test@example.com', role: 'customer' };
      const badToken = jwt.sign(payload, 'wrong-secret', { expiresIn: '15m' });
      mockReq.headers = { authorization: `Bearer ${badToken}` };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError for empty bearer token', () => {
      mockReq.headers = { authorization: 'Bearer ' };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('authorize', () => {
    it('should pass for user with allowed role', () => {
      mockReq.user = { id: 'uuid-1', email: 'admin@test.com', role: 'admin' };

      const middleware = authorize('admin', 'superadmin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with UnauthorizedError for user without allowed role', () => {
      mockReq.user = { id: 'uuid-1', email: 'customer@test.com', role: 'customer' };

      const middleware = authorize('admin', 'superadmin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError when no user in request', () => {
      mockReq.user = undefined;

      const middleware = authorize('admin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should accept multiple roles', () => {
      mockReq.user = { id: 'uuid-1', email: 'partner@test.com', role: 'partner' };

      const middleware = authorize('admin', 'partner', 'superadmin');
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
