import bcrypt from 'bcryptjs';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { OtpService } from '../../../src/modules/auth/services/otp.service';
import { TokenService } from '../../../src/modules/auth/services/token.service';
import { AppDataSource } from '../../../src/config/database';
import {
  ConflictError,
  UnauthorizedError,
  AccountLockedError,
  NotFoundError,
  ValidationError,
} from '../../../src/shared/errors/AppError';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/modules/auth/services/otp.service');
jest.mock('../../../src/modules/auth/services/token.service');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let mockCustomerRepo: any;
  let mockSessionRepo: any;

  beforeEach(() => {
    mockCustomerRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockSessionRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      if (entity.name === 'Customer' || entity === require('../../../src/modules/auth/entities/Customer').Customer) {
        return mockCustomerRepo;
      }
      return mockSessionRepo;
    });

    authService = new AuthService();
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      phone: '+84912345678',
      password: 'Password1!',
      full_name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);
      mockCustomerRepo.create.mockReturnValue({ id: 'uuid-1', ...registerData });
      mockCustomerRepo.save.mockResolvedValue({ id: 'uuid-1', ...registerData, fullName: registerData.full_name });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (OtpService.generateOtp as jest.Mock).mockReturnValue('123456');
      (OtpService.storeOtp as jest.Mock).mockImplementation(() => {});
      (OtpService.sendEmailOtp as jest.Mock).mockResolvedValue(undefined);
      (OtpService.sendSmsOtp as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(registerData);

      expect(result.id).toBe('uuid-1');
      expect(result.email).toBe(registerData.email);
      expect(result.status).toBe('pending_verification');
      expect(result.verification.email_sent).toBe(true);
      expect(result.verification.sms_sent).toBe(true);
    });

    it('should throw ConflictError if email already exists', async () => {
      mockCustomerRepo.findOne.mockResolvedValueOnce({ id: 'existing', email: registerData.email });

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
      await expect(authService.register(registerData)).rejects.toThrow('Email đã được sử dụng');
    });

    it('should throw ConflictError if phone already exists', async () => {
      mockCustomerRepo.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 'existing', phone: registerData.phone }); // phone check

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
    });

    it('should hash password with correct rounds', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);
      mockCustomerRepo.create.mockReturnValue({ id: 'uuid-1' });
      mockCustomerRepo.save.mockResolvedValue({ id: 'uuid-1', fullName: 'Test' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (OtpService.generateOtp as jest.Mock).mockReturnValue('123456');
      (OtpService.storeOtp as jest.Mock).mockImplementation(() => {});
      (OtpService.sendEmailOtp as jest.Mock).mockResolvedValue(undefined);
      (OtpService.sendSmsOtp as jest.Mock).mockResolvedValue(undefined);

      await authService.register(registerData);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, expect.any(Number));
    });

    it('should generate and send OTP on registration', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);
      mockCustomerRepo.create.mockReturnValue({ id: 'uuid-1' });
      mockCustomerRepo.save.mockResolvedValue({ id: 'uuid-1', fullName: 'Test' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (OtpService.generateOtp as jest.Mock).mockReturnValue('654321');
      (OtpService.storeOtp as jest.Mock).mockImplementation(() => {});
      (OtpService.sendEmailOtp as jest.Mock).mockResolvedValue(undefined);
      (OtpService.sendSmsOtp as jest.Mock).mockResolvedValue(undefined);

      await authService.register(registerData);

      expect(OtpService.generateOtp).toHaveBeenCalled();
      expect(OtpService.storeOtp).toHaveBeenCalledWith(`otp:${registerData.email}`, '654321');
      expect(OtpService.sendEmailOtp).toHaveBeenCalledWith(registerData.email, '654321');
      expect(OtpService.sendSmsOtp).toHaveBeenCalledWith(registerData.phone, '654321');
    });
  });

  describe('login', () => {
    const loginData = {
      email_or_phone: 'user@example.com',
      password: 'Password1!',
      remember_me: false,
    };

    const mockCustomer = {
      id: 'uuid-1',
      email: 'user@example.com',
      phone: '+84912345678',
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      status: 'active',
      role: 'customer',
      kycStatus: 'pending',
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
    };

    it('should login successfully with valid credentials', async () => {
      mockCustomerRepo.findOne.mockResolvedValue({ ...mockCustomer });
      mockCustomerRepo.save.mockResolvedValue({ ...mockCustomer });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (TokenService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (TokenService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      mockSessionRepo.create.mockReturnValue({});
      mockSessionRepo.save.mockResolvedValue({});

      const result = await authService.login(loginData);

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBe('refresh-token');
      expect(result.token_type).toBe('Bearer');
      expect(result.user.email).toBe(mockCustomer.email);
    });

    it('should throw UnauthorizedError for non-existent user', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for wrong password', async () => {
      mockCustomerRepo.findOne.mockResolvedValue({ ...mockCustomer });
      mockCustomerRepo.save.mockResolvedValue({ ...mockCustomer });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should increment failed login attempts on wrong password', async () => {
      const customer = { ...mockCustomer, failedLoginAttempts: 0 };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      mockCustomerRepo.save.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow();
      expect(mockCustomerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ failedLoginAttempts: 1 }),
      );
    });

    it('should lock account after max failed attempts', async () => {
      const customer = { ...mockCustomer, failedLoginAttempts: 4 };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      mockCustomerRepo.save.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow();
      expect(mockCustomerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('should throw AccountLockedError for locked account', async () => {
      const lockedCustomer = {
        ...mockCustomer,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 min in future
      };
      mockCustomerRepo.findOne.mockResolvedValue(lockedCustomer);

      await expect(authService.login(loginData)).rejects.toThrow(AccountLockedError);
    });

    it('should throw UnauthorizedError for inactive account', async () => {
      const inactiveCustomer = { ...mockCustomer, status: 'inactive' };
      mockCustomerRepo.findOne.mockResolvedValue(inactiveCustomer);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(loginData)).rejects.toThrow('Tài khoản đã bị vô hiệu hóa');
    });

    it('should reset failed attempts on successful login', async () => {
      const customer = { ...mockCustomer, failedLoginAttempts: 3 };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      mockCustomerRepo.save.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (TokenService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (TokenService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      mockSessionRepo.create.mockReturnValue({});
      mockSessionRepo.save.mockResolvedValue({});

      await authService.login(loginData);

      expect(mockCustomerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ failedLoginAttempts: 0 }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      const mockDecoded = { id: 'uuid-1', email: 'test@example.com', role: 'customer' };
      (TokenService.verifyRefreshToken as jest.Mock).mockReturnValue(mockDecoded);
      mockSessionRepo.findOne.mockResolvedValue({
        refreshToken: 'old-refresh-token',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      mockSessionRepo.save.mockResolvedValue({});
      mockSessionRepo.create.mockReturnValue({});
      (TokenService.generateAccessToken as jest.Mock).mockReturnValue('new-access-token');
      (TokenService.generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');

      const result = await authService.refreshToken('old-refresh-token');

      expect(result.access_token).toBe('new-access-token');
      expect(result.refresh_token).toBe('new-refresh-token');
      expect(result.token_type).toBe('Bearer');
    });

    it('should throw UnauthorizedError for invalid refresh token', async () => {
      (TokenService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for revoked session', async () => {
      (TokenService.verifyRefreshToken as jest.Mock).mockReturnValue({ id: 'uuid-1', email: 'test@example.com', role: 'customer' });
      mockSessionRepo.findOne.mockResolvedValue(null); // No active session

      await expect(authService.refreshToken('revoked-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for expired session', async () => {
      (TokenService.verifyRefreshToken as jest.Mock).mockReturnValue({ id: 'uuid-1', email: 'test@example.com', role: 'customer' });
      mockSessionRepo.findOne.mockResolvedValue({
        refreshToken: 'expired-token',
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000), // Already expired
      });
      mockSessionRepo.save.mockResolvedValue({});

      await expect(authService.refreshToken('expired-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should revoke old session when refreshing', async () => {
      const oldSession = {
        refreshToken: 'old-token',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      (TokenService.verifyRefreshToken as jest.Mock).mockReturnValue({ id: 'uuid-1', email: 'test@example.com', role: 'customer' });
      mockSessionRepo.findOne.mockResolvedValue(oldSession);
      mockSessionRepo.save.mockResolvedValue({});
      mockSessionRepo.create.mockReturnValue({});
      (TokenService.generateAccessToken as jest.Mock).mockReturnValue('new-access');
      (TokenService.generateRefreshToken as jest.Mock).mockReturnValue('new-refresh');

      await authService.refreshToken('old-token');

      expect(mockSessionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRevoked: true }),
      );
    });
  });

  describe('logout', () => {
    it('should revoke specific session when refresh token provided', async () => {
      mockSessionRepo.update.mockResolvedValue({ affected: 1 });

      const result = await authService.logout('uuid-1', 'refresh-token');

      expect(mockSessionRepo.update).toHaveBeenCalledWith(
        { customerId: 'uuid-1', refreshToken: 'refresh-token' },
        { isRevoked: true },
      );
      expect(result.message).toBe('Logged out successfully');
    });

    it('should revoke all sessions when no refresh token provided', async () => {
      mockSessionRepo.update.mockResolvedValue({ affected: 3 });

      const result = await authService.logout('uuid-1');

      expect(mockSessionRepo.update).toHaveBeenCalledWith(
        { customerId: 'uuid-1' },
        { isRevoked: true },
      );
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('forgotPassword', () => {
    it('should return generic message even if account does not exist', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      const result = await authService.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('Nếu tài khoản tồn tại');
    });

    it('should send OTP if account exists', async () => {
      const customer = { id: 'uuid-1', email: 'user@example.com', phone: '+84912345678' };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      (OtpService.generateOtp as jest.Mock).mockReturnValue('999999');
      (OtpService.storeOtp as jest.Mock).mockImplementation(() => {});
      (OtpService.sendEmailOtp as jest.Mock).mockResolvedValue(undefined);
      (OtpService.sendSmsOtp as jest.Mock).mockResolvedValue(undefined);

      await authService.forgotPassword('user@example.com');

      expect(OtpService.storeOtp).toHaveBeenCalledWith('reset:user@example.com', '999999');
      expect(OtpService.sendEmailOtp).toHaveBeenCalledWith('user@example.com', '999999');
    });
  });

  describe('resetPassword', () => {
    const resetData = {
      email: 'user@example.com',
      otp: '123456',
      new_password: 'NewPassword1!',
    };

    it('should reset password successfully with valid OTP', async () => {
      const customer = { id: 'uuid-1', email: 'user@example.com', passwordHash: 'old', failedLoginAttempts: 3 };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      (OtpService.verifyOtp as jest.Mock).mockReturnValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockCustomerRepo.save.mockResolvedValue(customer);
      mockSessionRepo.update.mockResolvedValue({ affected: 2 });

      const result = await authService.resetPassword(resetData);

      expect(result.message).toContain('thành công');
      expect(mockSessionRepo.update).toHaveBeenCalledWith(
        { customerId: 'uuid-1' },
        { isRevoked: true },
      );
    });

    it('should throw NotFoundError for non-existent email', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      await expect(authService.resetPassword(resetData)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid OTP', async () => {
      mockCustomerRepo.findOne.mockResolvedValue({ id: 'uuid-1', email: 'user@example.com' });
      (OtpService.verifyOtp as jest.Mock).mockReturnValue(false);

      await expect(authService.resetPassword(resetData)).rejects.toThrow(ValidationError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const customer = { id: 'uuid-1', passwordHash: 'current-hash' };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockCustomerRepo.save.mockResolvedValue(customer);

      const result = await authService.changePassword('uuid-1', {
        current_password: 'OldPassword1!',
        new_password: 'NewPassword1!',
      });

      expect(result.message).toContain('thành công');
    });

    it('should throw UnauthorizedError for wrong current password', async () => {
      const customer = { id: 'uuid-1', passwordHash: 'current-hash' };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword('uuid-1', {
          current_password: 'wrong',
          new_password: 'NewPassword1!',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      await expect(
        authService.changePassword('uuid-nonexist', {
          current_password: 'any',
          new_password: 'NewPassword1!',
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const customer = {
        id: 'uuid-1',
        email: 'user@example.com',
        phone: '+84912345678',
        fullName: 'Test User',
        dateOfBirth: null,
        gender: 'male',
        address: null,
        kycStatus: 'pending',
        avatarUrl: null,
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date(),
      };
      mockCustomerRepo.findOne.mockResolvedValue(customer);

      const result = await authService.getProfile('uuid-1');

      expect(result.id).toBe('uuid-1');
      expect(result.email).toBe('user@example.com');
      expect(result.full_name).toBe('Test User');
    });

    it('should throw NotFoundError for non-existent user', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      await expect(authService.getProfile('uuid-nonexist')).rejects.toThrow(NotFoundError);
    });
  });
});
