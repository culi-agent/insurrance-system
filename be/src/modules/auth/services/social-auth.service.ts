import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Customer } from '../entities/Customer';
import { CustomerSocialAccount } from '../entities/CustomerSocialAccount';
import { Session } from '../entities/Session';
import { TokenService, TokenPayload } from './token.service';
import { UnauthorizedError, ConflictError, ValidationError } from '../../../shared/errors/AppError';

export interface SocialProfile {
  provider: 'google' | 'facebook';
  provider_id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export interface FacebookProfile {
  id: string;
  email: string;
  name: string;
  picture?: { data?: { url?: string } };
}

export class SocialAuthService {
  private customerRepo: Repository<Customer>;
  private socialAccountRepo: Repository<CustomerSocialAccount>;
  private sessionRepo: Repository<Session>;

  constructor() {
    this.customerRepo = AppDataSource.getRepository(Customer);
    this.socialAccountRepo = AppDataSource.getRepository(CustomerSocialAccount);
    this.sessionRepo = AppDataSource.getRepository(Session);
  }

  /**
   * Verify Google ID token and extract profile
   */
  async verifyGoogleToken(idToken: string): Promise<SocialProfile> {
    try {
      // In production, use google-auth-library to verify the token
      // For now, decode the JWT payload (simplified for Sprint 1)
      const payload = JSON.parse(
        Buffer.from(idToken.split('.')[1], 'base64').toString(),
      ) as GoogleTokenPayload;

      if (!payload.email || !payload.sub) {
        throw new ValidationError('Invalid Google token payload');
      }

      return {
        provider: 'google',
        provider_id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar_url: payload.picture,
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new UnauthorizedError('Invalid Google token');
    }
  }

  /**
   * Verify Facebook access token and get profile
   */
  async verifyFacebookToken(accessToken: string): Promise<SocialProfile> {
    try {
      // In production, call Facebook Graph API to verify token
      // GET https://graph.facebook.com/me?fields=id,name,email,picture&access_token=...
      // For Sprint 1, we accept the token payload directly from frontend
      // Frontend should call FB API and pass profile data
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
      );

      if (!response.ok) {
        throw new UnauthorizedError('Invalid Facebook token');
      }

      const profile = (await response.json()) as FacebookProfile;

      if (!profile.email) {
        throw new ValidationError(
          'Facebook account must have an email address',
        );
      }

      return {
        provider: 'facebook',
        provider_id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.picture?.data?.url,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Failed to verify Facebook token');
    }
  }

  /**
   * Handle social login/registration
   * - If social account exists → login
   * - If email exists but no social link → link account (auto for social login)
   * - If email is new → create new account
   */
  async socialLogin(profile: SocialProfile, ipAddress?: string, deviceInfo?: string) {
    // Check if social account already linked
    const existingSocial = await this.socialAccountRepo.findOne({
      where: { provider: profile.provider, providerId: profile.provider_id },
      relations: ['customer'],
    });

    let customer: Customer;

    if (existingSocial) {
      // Existing social account → login directly
      customer = existingSocial.customer;
    } else {
      // Check if email already exists
      const existingCustomer = await this.customerRepo.findOne({
        where: { email: profile.email },
      });

      if (existingCustomer) {
        // Link social account to existing customer
        customer = existingCustomer;
        await this.linkSocialAccount(customer.id, profile);
      } else {
        // Create new customer from social profile
        customer = await this.createSocialCustomer(profile);
      }
    }

    // Check account status
    if (customer.status !== 'active') {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }

    // Update last login
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

    // Create session
    await this.createSession(customer.id, refreshToken, ipAddress, deviceInfo);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
      is_new_user: !existingSocial,
      user: {
        id: customer.id,
        email: customer.email,
        full_name: customer.fullName,
        role: customer.role,
        avatar_url: customer.avatarUrl,
        kyc_status: customer.kycStatus,
      },
    };
  }

  private async createSocialCustomer(profile: SocialProfile): Promise<Customer> {
    // Create customer without password (social-only account)
    const customer = this.customerRepo.create({
      email: profile.email,
      phone: `+84000000000`, // Placeholder - user must update later
      passwordHash: '', // No password for social accounts
      fullName: profile.name,
      avatarUrl: profile.avatar_url,
      status: 'active',
      emailVerified: true, // Email verified via social provider
      phoneVerified: false,
      role: 'customer',
    });

    const saved = await this.customerRepo.save(customer);

    // Link social account
    await this.linkSocialAccount(saved.id, profile);

    return saved;
  }

  private async linkSocialAccount(customerId: string, profile: SocialProfile): Promise<void> {
    const socialAccount = this.socialAccountRepo.create({
      customerId,
      provider: profile.provider,
      providerId: profile.provider_id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatar_url,
    });

    await this.socialAccountRepo.save(socialAccount);
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return this.sessionRepo.save(session);
  }

  /**
   * Get linked social accounts for a customer
   */
  async getSocialAccounts(customerId: string) {
    const accounts = await this.socialAccountRepo.find({
      where: { customerId },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      provider: acc.provider,
      email: acc.email,
      name: acc.name,
      avatar_url: acc.avatarUrl,
      linked_at: acc.createdAt,
    }));
  }

  /**
   * Unlink a social account
   */
  async unlinkSocialAccount(customerId: string, provider: string) {
    const account = await this.socialAccountRepo.findOne({
      where: { customerId, provider },
    });

    if (!account) {
      throw new ConflictError(`No ${provider} account linked`);
    }

    // Ensure customer has password or another social account
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    const otherAccounts = await this.socialAccountRepo.count({
      where: { customerId },
    });

    if (!customer?.passwordHash && otherAccounts <= 1) {
      throw new ConflictError(
        'Cannot unlink the only login method. Please set a password first.',
      );
    }

    await this.socialAccountRepo.remove(account);
    return { message: `${provider} account unlinked successfully` };
  }
}
