import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ReferralConfig {
  id: string;
  program_name: string;
  referrer_reward_amount: number;
  referee_reward_amount: number;
  reward_type: string;
  min_purchase_amount: number;
  max_referrals: number;
  is_active: boolean;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id?: string;
  referral_code: string;
  status: string;
  referrer_reward: number;
  referee_reward: number;
  reward_type: string;
  reward_status: string;
  registered_at?: Date;
  first_purchase_at?: Date;
  created_at: Date;
}

export class ReferralService {
  /**
   * Generate referral code for customer
   */
  async generateReferralCode(customerId: string): Promise<{ referral_code: string; referral_link: string }> {
    // Check if customer already has a referral code
    const existing = await AppDataSource.query(
      `SELECT referral_code FROM referral WHERE referrer_id = $1 AND status = 'pending' LIMIT 1`,
      [customerId]
    );

    if (existing.length > 0) {
      return {
        referral_code: existing[0].referral_code,
        referral_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${existing[0].referral_code}`,
      };
    }

    // Check max referrals
    const config = await this.getActiveConfig();
    const referralCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM referral WHERE referrer_id = $1`,
      [customerId]
    );

    if (parseInt(referralCount[0].count) >= config.max_referrals) {
      throw new ValidationError(`Bạn đã đạt giới hạn ${config.max_referrals} lượt giới thiệu`);
    }

    // Generate unique code
    const code = this.generateCode(customerId);

    await AppDataSource.query(
      `INSERT INTO referral (id, referrer_id, referral_code, status, referrer_reward, referee_reward, reward_type, reward_status)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, 'pending')`,
      [uuidv4(), customerId, code, config.referrer_reward_amount, config.referee_reward_amount, config.reward_type]
    );

    logger.info(`[Referral] Generated code ${code} for customer ${customerId}`);

    return {
      referral_code: code,
      referral_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${code}`,
    };
  }

  /**
   * Register referee (when someone uses referral link to register)
   */
  async registerReferee(referralCode: string, refereeId: string): Promise<void> {
    const referral = await AppDataSource.query(
      `SELECT * FROM referral WHERE referral_code = $1 AND status = 'pending'`,
      [referralCode]
    );

    if (referral.length === 0) {
      logger.warn(`[Referral] Invalid or used code: ${referralCode}`);
      return;
    }

    if (referral[0].referrer_id === refereeId) {
      logger.warn(`[Referral] Self-referral attempted: ${referralCode}`);
      return;
    }

    await AppDataSource.query(
      `UPDATE referral SET referee_id = $1, status = 'registered', registered_at = NOW(), updated_at = NOW() WHERE referral_code = $2`,
      [refereeId, referralCode]
    );

    logger.info(`[Referral] Referee ${refereeId} registered with code ${referralCode}`);
  }

  /**
   * Complete referral (when referee makes first purchase)
   */
  async completeReferral(refereeId: string, purchaseAmount: number): Promise<void> {
    const referral = await AppDataSource.query(
      `SELECT * FROM referral WHERE referee_id = $1 AND status = 'registered'`,
      [refereeId]
    );

    if (referral.length === 0) return;

    const config = await this.getActiveConfig();

    if (purchaseAmount < config.min_purchase_amount) {
      logger.info(`[Referral] Purchase ${purchaseAmount} below minimum ${config.min_purchase_amount}`);
      return;
    }

    await AppDataSource.query(
      `UPDATE referral SET status = 'completed', first_purchase_at = NOW(), reward_status = 'eligible', updated_at = NOW() WHERE referee_id = $1 AND status = 'registered'`,
      [refereeId]
    );

    logger.info(`[Referral] Completed for referee ${refereeId}, purchase: ${purchaseAmount}`);
  }

  /**
   * Get referral statistics for customer
   */
  async getReferralStats(customerId: string) {
    const stats = await AppDataSource.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status IN ('pending', 'registered', 'completed', 'rewarded')) as total_referrals,
        COUNT(*) FILTER (WHERE status = 'registered') as registered,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'rewarded') as rewarded,
        COALESCE(SUM(referrer_reward) FILTER (WHERE reward_status = 'paid'), 0) as total_earned
      FROM referral WHERE referrer_id = $1`,
      [customerId]
    );

    const activeCode = await AppDataSource.query(
      `SELECT referral_code FROM referral WHERE referrer_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [customerId]
    );

    const config = await this.getActiveConfig();

    return {
      referral_code: activeCode[0]?.referral_code || null,
      referral_link: activeCode[0]?.referral_code
        ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${activeCode[0].referral_code}`
        : null,
      stats: {
        total_referrals: parseInt(stats[0].total_referrals) || 0,
        registered: parseInt(stats[0].registered) || 0,
        completed: parseInt(stats[0].completed) || 0,
        rewarded: parseInt(stats[0].rewarded) || 0,
        total_earned: parseFloat(stats[0].total_earned) || 0,
      },
      program: {
        referrer_reward: config.referrer_reward_amount,
        referee_reward: config.referee_reward_amount,
        reward_type: config.reward_type,
        max_referrals: config.max_referrals,
      },
    };
  }

  /**
   * Get list of referrals for customer
   */
  async getMyReferrals(customerId: string, page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;

    const referrals = await AppDataSource.query(
      `SELECT r.*, c.email as referee_email, c.full_name as referee_name
       FROM referral r
       LEFT JOIN customer c ON r.referee_id = c.id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [customerId, perPage, offset]
    );

    const countResult = await AppDataSource.query(
      `SELECT COUNT(*) as total FROM referral WHERE referrer_id = $1`,
      [customerId]
    );

    return {
      data: referrals.map((r: any) => ({
        id: r.id,
        referral_code: r.referral_code,
        referee_name: r.referee_name || 'Chưa đăng ký',
        referee_email: r.referee_email ? this.maskEmail(r.referee_email) : null,
        status: r.status,
        reward_amount: r.referrer_reward,
        reward_status: r.reward_status,
        registered_at: r.registered_at,
        first_purchase_at: r.first_purchase_at,
        created_at: r.created_at,
      })),
      total: parseInt(countResult[0].total),
      page,
      per_page: perPage,
    };
  }

  private async getActiveConfig(): Promise<ReferralConfig> {
    const configs = await AppDataSource.query(
      `SELECT * FROM referral_program_config WHERE is_active = true ORDER BY created_at DESC LIMIT 1`
    );

    if (configs.length === 0) {
      return {
        id: '',
        program_name: 'Default',
        referrer_reward_amount: 100000,
        referee_reward_amount: 50000,
        reward_type: 'cash',
        min_purchase_amount: 500000,
        max_referrals: 50,
        is_active: true,
      };
    }

    return configs[0];
  }

  private generateCode(customerId: string): string {
    const prefix = customerId.slice(0, 4).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `REF-${prefix}-${random}`;
  }

  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    const masked = name.slice(0, 2) + '***' + name.slice(-1);
    return `${masked}@${domain}`;
  }
}
