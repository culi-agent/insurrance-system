import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../src/modules/auth/controllers/auth.controller';
import { AuthenticatedRequest } from '../../../src/shared/types';

// Mock the services
jest.mock('../../../src/modules/auth/services/auth.service');
jest.mock('../../../src/modules/auth/services/social-auth.service');
jest.mock('../../../src/shared/utils/response');

import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { SocialAuthService } from '../../../src/modules/auth/services/social-auth.service';
import { ApiResponse } from '../../../src/shared/utils/response';

describe('AuthController', () => {
  let controller: AuthController;
  let mockReq: Partial<Request & AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockSocialAuthService: jest.Mocked<SocialAuthService>;

  beforeEach(() => {
    mockReq = {
      body: {},
      headers: {},
      params: {},
      ip: '127.0.0.1',
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    controller = new AuthController();

    // Get mocked instances
    mockAuthService = (controller as any).authService;
    mockSocialAuthService = (controller as any).socialAuthService;
  });

  describe('register', () => {
    it('should call authService.register and return 201', async () => {
      const registerData = {
        email: 'user@example.com',
        phone: '+84912345678',
        password: 'Password1!',
        full_name: 'Test User',
      };
      mockReq.body = registerData;

      const mockResult = { id: 'uuid-1', status: 'pending_verification' };
      mockAuthService.register = jest.fn().mockResolvedValue(mockResult);

      await controller.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(ApiResponse.created).toHaveBeenCalledWith(mockRes, mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Registration failed');
      mockAuthService.register = jest.fn().mockRejectedValue(error);
      mockReq.body = {};

      await controller.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should call authService.login with request data including IP and user-agent', async () => {
      mockReq.body = { email_or_phone: 'user@example.com', password: 'Pass1!' };
      mockReq.ip = '192.168.1.1';
      mockReq.headers = { 'user-agent': 'TestBrowser/1.0' };

      const mockResult = { access_token: 'token', user: { id: 'uuid-1' } };
      mockAuthService.login = jest.fn().mockResolvedValue(mockResult);

      await controller.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          email_or_phone: 'user@example.com',
          password: 'Pass1!',
          ip_address: '192.168.1.1',
          device_info: 'TestBrowser/1.0',
        }),
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, mockResult);
    });

    it('should call next with error on login failure', async () => {
      const error = new Error('Login failed');
      mockAuthService.login = jest.fn().mockRejectedValue(error);
      mockReq.body = { email_or_phone: 'user@test.com', password: 'wrong' };

      await controller.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken with token from body', async () => {
      mockReq.body = { refresh_token: 'valid-refresh-token' };
      const mockResult = { access_token: 'new-token', refresh_token: 'new-refresh' };
      mockAuthService.refreshToken = jest.fn().mockResolvedValue(mockResult);

      await controller.refreshToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, mockResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user ID', async () => {
      mockReq.user = { id: 'uuid-1', email: 'test@test.com', role: 'customer' };
      mockReq.body = { refresh_token: 'token-to-revoke' };
      const mockResult = { message: 'Logged out successfully' };
      mockAuthService.logout = jest.fn().mockResolvedValue(mockResult);

      await controller.logout(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockAuthService.logout).toHaveBeenCalledWith('uuid-1', 'token-to-revoke');
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, mockResult);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with authenticated user ID', async () => {
      mockReq.user = { id: 'uuid-1', email: 'test@test.com', role: 'customer' };
      const mockProfile = { id: 'uuid-1', email: 'test@test.com', full_name: 'Test User' };
      mockAuthService.getProfile = jest.fn().mockResolvedValue(mockProfile);

      await controller.getProfile(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('uuid-1');
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should call authService.updateProfile with user ID and body data', async () => {
      mockReq.user = { id: 'uuid-1', email: 'test@test.com', role: 'customer' };
      mockReq.body = { full_name: 'Updated Name' };
      const mockResult = { id: 'uuid-1', full_name: 'Updated Name' };
      mockAuthService.updateProfile = jest.fn().mockResolvedValue(mockResult);

      await controller.updateProfile(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('uuid-1', { full_name: 'Updated Name' });
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, mockResult);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with user ID and passwords', async () => {
      mockReq.user = { id: 'uuid-1', email: 'test@test.com', role: 'customer' };
      mockReq.body = { current_password: 'Old1!', new_password: 'New1!' };
      const mockResult = { message: 'Password changed' };
      mockAuthService.changePassword = jest.fn().mockResolvedValue(mockResult);

      await controller.changePassword(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('uuid-1', {
        current_password: 'Old1!',
        new_password: 'New1!',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      mockReq.body = { email_or_phone: 'user@example.com' };
      const mockResult = { message: 'OTP sent' };
      mockAuthService.forgotPassword = jest.fn().mockResolvedValue(mockResult);

      await controller.forgotPassword(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      mockReq.body = { email: 'user@example.com', otp: '123456', new_password: 'New1!' };
      const mockResult = { message: 'Password reset' };
      mockAuthService.resetPassword = jest.fn().mockResolvedValue(mockResult);

      await controller.resetPassword(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockReq.body);
    });
  });

  describe('socialLogin', () => {
    it('should handle google social login', async () => {
      mockReq.body = { provider: 'google', token: 'google-id-token' };
      mockReq.ip = '127.0.0.1';
      mockReq.headers = { 'user-agent': 'Chrome/100' };

      const mockProfile = { provider: 'google', provider_id: '123', email: 'g@google.com', name: 'G User' };
      const mockResult = { access_token: 'token', user: { id: 'uuid-1' } };

      mockSocialAuthService.verifyGoogleToken = jest.fn().mockResolvedValue(mockProfile);
      mockSocialAuthService.socialLogin = jest.fn().mockResolvedValue(mockResult);

      await controller.socialLogin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSocialAuthService.verifyGoogleToken).toHaveBeenCalledWith('google-id-token');
      expect(mockSocialAuthService.socialLogin).toHaveBeenCalledWith(
        mockProfile,
        '127.0.0.1',
        'Chrome/100',
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, mockResult);
    });

    it('should handle facebook social login', async () => {
      mockReq.body = { provider: 'facebook', token: 'fb-access-token' };
      mockReq.ip = '127.0.0.1';
      mockReq.headers = { 'user-agent': 'Safari/16' };

      const mockProfile = { provider: 'facebook', provider_id: '456', email: 'fb@test.com', name: 'FB User' };
      const mockResult = { access_token: 'token', user: { id: 'uuid-2' } };

      mockSocialAuthService.verifyFacebookToken = jest.fn().mockResolvedValue(mockProfile);
      mockSocialAuthService.socialLogin = jest.fn().mockResolvedValue(mockResult);

      await controller.socialLogin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSocialAuthService.verifyFacebookToken).toHaveBeenCalledWith('fb-access-token');
    });
  });

  describe('getSocialAccounts', () => {
    it('should get social accounts for authenticated user', async () => {
      mockReq.user = { id: 'uuid-1', email: 'test@test.com', role: 'customer' };
      const mockAccounts = [{ provider: 'google', email: 'g@google.com' }];
      mockSocialAuthService.getSocialAccounts = jest.fn().mockResolvedValue(mockAccounts);

      await controller.getSocialAccounts(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockSocialAuthService.getSocialAccounts).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('unlinkSocialAccount', () => {
    it('should unlink social account', async () => {
      mockReq.user = { id: 'uuid-1', email: 'test@test.com', role: 'customer' };
      mockReq.params = { provider: 'google' };
      const mockResult = { message: 'google account unlinked successfully' };
      mockSocialAuthService.unlinkSocialAccount = jest.fn().mockResolvedValue(mockResult);

      await controller.unlinkSocialAccount(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockSocialAuthService.unlinkSocialAccount).toHaveBeenCalledWith('uuid-1', 'google');
    });
  });
});
