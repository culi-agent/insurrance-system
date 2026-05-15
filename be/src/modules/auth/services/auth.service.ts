import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { env } from '../../../config/environment';
import { Customer } from '../entities/Customer';
import { Session } from '../entities/Session';
import { TokenService, TokenPayload } from './token.service';
import { OtpService } from './otp.service';
import {
  ConflictError,
  UnauthorizedError,
  AccountLockedError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors/AppError';

export class AuthService {
  private customerRepo: Repository<Customer>;
  private sessionRepo: Repository<Session>;

  constructor() {
    this.customerRepo = AppDataSource.getRepository(Customer);
    this.sessionRepo = AppDataSource.getRepository(Session);
  }

  async register(data: {
    email: string;
    phone: string;
    password: string;
    full_name: string;
  }) {
    // Check if email or phone already exists
    const existingEmail = await this.customerRepo.findOne({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictError('Email đã được sử dụng');
    }

    const existingPhone = await this.customerRepo.findOne({
      where: { phone: data.phone },
    });
    if (existingPhone) {
      throw new ConflictError('Số điện thoại đã được sử dụng');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    // Create customer
    const customer = this.customerRepo.create({
      email: data.email,
      phone: data.phone,
      passwordHash,
      fullName: data.full_name,
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
    });

    const saved = await this.customerRepo.save(customer);

    // Generate and send OTP
    const otp = OtpService.generateOtp();
    OtpService.storeOtp(`otp:${data.email}`, otp);

    // Send OTP via email and SMS (async, non-blocking)
    OtpService.sendEmailOtp(data.email, otp);
    OtpService.sendSmsOtp(data.phone, otp);

    return {
      id: saved.id,
      email: saved.email,
      phone: saved.phone,
      full_name: saved.fullName,
      status: 'pending_verification',
      verification: {
        email_sent: true,
        sms_sent: true,
        expires_at: new Date(Date.now() + env.OTP_EXPIRES_IN * 1000).toISOString(),
      },
    };
  }

  async verifyOtp(data: { email: string; otp: string; channel: string }) {
    const customer = await this.customerRepo.findOne({
      where: { email: data.email },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const isValid = OtpService.verifyOtp(`otp:${data.email}`, data.otp);
    if (!isValid) {
      throw new ValidationError('OTP không hợp lệ hoặc đã hết hạn');
    }

    // Update verification status
    if (data.channel === 'email') {
      customer.emailVerified = true;
    } else {
      customer.phoneVerified = true;
    }
    await this.customerRepo.save(customer);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = TokenService.generateRefreshToken(tokenPayload);

    // Save session
    await this.createSession(customer.id, refreshToken);

    return {
      verified: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes
    };
  }

  async login(data: {
    email_or_phone: string;
    password: string;
    remember_me: boolean;
    ip_address?: string;
    device_info?: string;
  }) {
    // Find user by email or phone
    const customer = await this.customerRepo.findOne({
      where: [
        { email: data.email_or_phone },
        { phone: data.email_or_phone },
      ],
    });

    if (!customer) {
      throw new UnauthorizedError('Email/phone hoặc password không đúng');
    }

    // Check if account is locked
    if (customer.lockedUntil && new Date() < customer.lockedUntil) {
      throw new AccountLockedError(
        `Tài khoản bị khóa. Vui lòng thử lại sau ${env.LOCK_DURATION_MINUTES} phút`,
      );
    }

    // Check account status
    if (customer.status !== 'active') {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, customer.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts
      customer.failedLoginAttempts += 1;

      if (customer.failedLoginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
        customer.lockedUntil = new Date(
          Date.now() + env.LOCK_DURATION_MINUTES * 60 * 1000,
        );
      }
      await this.customerRepo.save(customer);

      throw new UnauthorizedError('Email/phone hoặc password không đúng');
    }

    // Reset failed attempts on successful login
    customer.failedLoginAttempts = 0;
    customer.lockedUntil = undefined;
    customer.lastLoginAt = new Date();
    await this.customerRepo.save(customer);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = TokenService.generateRefreshToken(tokenPayload);

    // Save session
    await this.createSession(
      customer.id,
      refreshToken,
      data.ip_address,
      data.device_info,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        id: customer.id,
        email: customer.email,
        full_name: customer.fullName,
        role: customer.role,
        kyc_status: customer.kycStatus,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let decoded: TokenPayload;
    try {
      decoded = TokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Check session exists and is not revoked
    const session = await this.sessionRepo.findOne({
      where: { refreshToken, isRevoked: false },
    });

    if (!session) {
      throw new UnauthorizedError('Session không tồn tại hoặc đã bị thu hồi');
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      session.isRevoked = true;
      await this.sessionRepo.save(session);
      throw new UnauthorizedError('Session đã hết hạn');
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    const newAccessToken = TokenService.generateAccessToken(tokenPayload);
    const newRefreshToken = TokenService.generateRefreshToken(tokenPayload);

    // Revoke old session, create new one
    session.isRevoked = true;
    await this.sessionRepo.save(session);
    await this.createSession(decoded.id, newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Revoke specific session
      await this.sessionRepo.update(
        { customerId: userId, refreshToken },
        { isRevoked: true },
      );
    } else {
      // Revoke all sessions
      await this.sessionRepo.update({ customerId: userId }, { isRevoked: true });
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(emailOrPhone: string) {
    const customer = await this.customerRepo.findOne({
      where: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!customer) {
      // For security, don't reveal if account exists
      return { message: 'Nếu tài khoản tồn tại, bạn sẽ nhận được OTP' };
    }

    const otp = OtpService.generateOtp();
    OtpService.storeOtp(`reset:${customer.email}`, otp);

    OtpService.sendEmailOtp(customer.email, otp);

    return { message: 'Nếu tài khoản tồn tại, bạn sẽ nhận được OTP' };
  }

  async getProfile(userId: string) {
    const customer = await this.customerRepo.findOne({
      where: { id: userId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return {
      id: customer.id,
      email: customer.email,
      phone: customer.phone,
      full_name: customer.fullName,
      date_of_birth: customer.dateOfBirth,
      gender: customer.gender,
      address: customer.address,
      kyc_status: customer.kycStatus,
      avatar_url: customer.avatarUrl,
      email_verified: customer.emailVerified,
      phone_verified: customer.phoneVerified,
      created_at: customer.createdAt,
    };
  }

  private async createSession(
    customerId: string,
    refreshToken: string,
    ipAddress?: string,
    deviceInfo?: string,
  ) {
    const session = this.sessionRepo.create({
      customerId,
      refreshToken,
      ipAddress,
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    return this.sessionRepo.save(session);
  }
}
