import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../../../shared/errors/AppError';

export interface LoyaltyAccount {
  id: string;
  customer_id: string;
  total_points: number;
  available_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetime_points: number;
  created_at: string;
}

export interface PointTransaction {
  id: string;
  customer_id: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'adjust';
  points: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: any;
  points_reward: number;
}

export interface CustomerBadge {
  badge: Badge;
  earned_at: string;
}

export interface RedemptionOption {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: 'discount' | 'gift' | 'upgrade' | 'cashback';
  value: number;
  status: string;
}

export class LoyaltyService {
  /**
   * Get or create loyalty account
   */
  async getAccount(customerId: string): Promise<LoyaltyAccount> {
    let account = await AppDataSource.query(
      `SELECT * FROM loyalty_account WHERE customer_id = $1`, [customerId]
    );

    if (account.length === 0) {
      const id = uuidv4();
      await AppDataSource.query(
        `INSERT INTO loyalty_account (id, customer_id, total_points, available_points, tier, lifetime_points, created_at, updated_at)
         VALUES ($1, $2, 0, 0, 'bronze', 0, NOW(), NOW())`,
        [id, customerId]
      );
      account = [{ id, customer_id: customerId, total_points: 0, available_points: 0, tier: 'bronze', lifetime_points: 0, created_at: new Date().toISOString() }];
    }

    return account[0];
  }

  /**
   * Earn points
   */
  async earnPoints(customerId: string, points: number, description: string, referenceType?: string, referenceId?: string): Promise<PointTransaction> {
    const txId = uuidv4();

    await AppDataSource.query(
      `INSERT INTO loyalty_transaction (id, customer_id, type, points, description, reference_type, reference_id, created_at)
       VALUES ($1, $2, 'earn', $3, $4, $5, $6, NOW())`,
      [txId, customerId, points, description, referenceType || null, referenceId || null]
    );

    await AppDataSource.query(
      `UPDATE loyalty_account SET total_points = total_points + $1, available_points = available_points + $1, lifetime_points = lifetime_points + $1, updated_at = NOW() WHERE customer_id = $2`,
      [points, customerId]
    );

    // Check tier upgrade
    await this.checkTierUpgrade(customerId);

    logger.info(`[Loyalty] Earned: customer=${customerId}, points=${points}, desc=${description}`);

    return { id: txId, customer_id: customerId, type: 'earn', points, description, reference_type: referenceType, reference_id: referenceId, created_at: new Date().toISOString() };
  }

  /**
   * Redeem points
   */
  async redeemPoints(customerId: string, optionId: string): Promise<{ success: boolean; message: string; reward?: any }> {
    const option = await AppDataSource.query(
      `SELECT * FROM loyalty_redemption_option WHERE id = $1 AND status = 'active'`, [optionId]
    );
    if (option.length === 0) throw new ValidationError('Phần thưởng không khả dụng');

    const account = await this.getAccount(customerId);
    if (account.available_points < option[0].points_required) {
      throw new ValidationError(`Không đủ điểm. Cần ${option[0].points_required} điểm, hiện có ${account.available_points} điểm.`);
    }

    // Deduct points
    const txId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO loyalty_transaction (id, customer_id, type, points, description, reference_type, reference_id, created_at)
       VALUES ($1, $2, 'redeem', $3, $4, 'redemption', $5, NOW())`,
      [txId, customerId, -option[0].points_required, `Đổi: ${option[0].name}`, optionId]
    );

    await AppDataSource.query(
      `UPDATE loyalty_account SET available_points = available_points - $1, updated_at = NOW() WHERE customer_id = $2`,
      [option[0].points_required, customerId]
    );

    // Generate reward
    const rewardId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO loyalty_reward (id, customer_id, option_id, reward_type, reward_value, code, status, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW() + INTERVAL '30 days', NOW())`,
      [rewardId, customerId, optionId, option[0].category, option[0].value, this.generateRewardCode()]
    );

    logger.info(`[Loyalty] Redeemed: customer=${customerId}, option=${option[0].name}, points=${option[0].points_required}`);

    return { success: true, message: `Đổi thành công! ${option[0].name}`, reward: { id: rewardId, name: option[0].name, value: option[0].value } };
  }

  /**
   * Get point history
   */
  async getPointHistory(customerId: string, page: number = 1, limit: number = 20): Promise<{ transactions: PointTransaction[]; total: number }> {
    const offset = (page - 1) * limit;
    const [transactions, countResult] = await Promise.all([
      AppDataSource.query(
        `SELECT * FROM loyalty_transaction WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
      ),
      AppDataSource.query(`SELECT COUNT(*) as total FROM loyalty_transaction WHERE customer_id = $1`, [customerId]),
    ]);
    return { transactions, total: parseInt(countResult[0]?.total) || 0 };
  }

  /**
   * Get redemption options
   */
  async getRedemptionOptions(customerId: string): Promise<RedemptionOption[]> {
    const account = await this.getAccount(customerId);
    const options = await AppDataSource.query(
      `SELECT * FROM loyalty_redemption_option WHERE status = 'active' ORDER BY points_required ASC`
    );
    return options.map((o: any) => ({ ...o, can_redeem: account.available_points >= o.points_required }));
  }

  /**
   * Award badge to customer
   */
  async awardBadge(customerId: string, badgeId: string): Promise<CustomerBadge | null> {
    // Check if already earned
    const existing = await AppDataSource.query(
      `SELECT id FROM customer_badge WHERE customer_id = $1 AND badge_id = $2`,
      [customerId, badgeId]
    );
    if (existing.length > 0) return null;

    const badge = await AppDataSource.query(`SELECT * FROM loyalty_badge WHERE id = $1`, [badgeId]);
    if (badge.length === 0) return null;

    await AppDataSource.query(
      `INSERT INTO customer_badge (id, customer_id, badge_id, earned_at) VALUES ($1, $2, $3, NOW())`,
      [uuidv4(), customerId, badgeId]
    );

    // Award bonus points for badge
    if (badge[0].points_reward > 0) {
      await this.earnPoints(customerId, badge[0].points_reward, `Badge: ${badge[0].name}`, 'badge', badgeId);
    }

    return { badge: badge[0], earned_at: new Date().toISOString() };
  }

  /**
   * Get customer badges
   */
  async getCustomerBadges(customerId: string): Promise<CustomerBadge[]> {
    const badges = await AppDataSource.query(`
      SELECT b.*, cb.earned_at
      FROM customer_badge cb
      JOIN loyalty_badge b ON cb.badge_id = b.id
      WHERE cb.customer_id = $1
      ORDER BY cb.earned_at DESC
    `, [customerId]);
    return badges.map((b: any) => ({ badge: { id: b.id, name: b.name, description: b.description, icon: b.icon, category: b.category, criteria: b.criteria, points_reward: b.points_reward }, earned_at: b.earned_at }));
  }

  /**
   * Check and process badge achievements
   */
  async checkBadgeAchievements(customerId: string): Promise<CustomerBadge[]> {
    const earnedBadges: CustomerBadge[] = [];

    // Get all badges and customer stats
    const [badges, stats] = await Promise.all([
      AppDataSource.query(`SELECT * FROM loyalty_badge WHERE status = 'active'`),
      this.getCustomerStats(customerId),
    ]);

    for (const badge of badges) {
      const criteria = badge.criteria || {};
      let earned = false;

      switch (criteria.type) {
        case 'policies_count':
          earned = stats.policies_count >= (criteria.value || 1);
          break;
        case 'total_premium':
          earned = stats.total_premium >= (criteria.value || 0);
          break;
        case 'referrals_count':
          earned = stats.referrals_count >= (criteria.value || 1);
          break;
        case 'claims_approved':
          earned = stats.claims_approved >= (criteria.value || 1);
          break;
        case 'tenure_months':
          earned = stats.tenure_months >= (criteria.value || 12);
          break;
        case 'products_diversity':
          earned = stats.product_types >= (criteria.value || 3);
          break;
      }

      if (earned) {
        const result = await this.awardBadge(customerId, badge.id);
        if (result) earnedBadges.push(result);
      }
    }

    return earnedBadges;
  }

  /**
   * Get referral tiers
   */
  async getReferralTiers(customerId: string): Promise<any> {
    const account = await this.getAccount(customerId);
    const referralCount = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM referral WHERE referrer_id = $1 AND status = 'completed'`, [customerId]
    );
    const count = parseInt(referralCount[0]?.count) || 0;

    const tiers = [
      { tier: 1, required: 1, reward: 100000, label: 'Người giới thiệu mới' },
      { tier: 2, required: 5, reward: 150000, label: 'Người giới thiệu tích cực' },
      { tier: 3, required: 10, reward: 200000, label: 'Đại sứ thương hiệu' },
      { tier: 4, required: 25, reward: 300000, label: 'Đại sứ vàng' },
      { tier: 5, required: 50, reward: 500000, label: 'Đại sứ kim cương' },
    ];

    const currentTier = tiers.filter(t => count >= t.required).pop() || tiers[0];
    const nextTier = tiers.find(t => count < t.required);

    return {
      referral_count: count,
      current_tier: currentTier,
      next_tier: nextTier,
      progress: nextTier ? Math.round((count / nextTier.required) * 100) : 100,
      total_earned: count * currentTier.reward,
    };
  }

  // ============ Private Methods ============

  private async checkTierUpgrade(customerId: string): Promise<void> {
    const account = await AppDataSource.query(
      `SELECT lifetime_points, tier FROM loyalty_account WHERE customer_id = $1`, [customerId]
    );
    if (account.length === 0) return;

    const points = account[0].lifetime_points;
    let newTier = 'bronze';
    if (points >= 100000) newTier = 'platinum';
    else if (points >= 50000) newTier = 'gold';
    else if (points >= 20000) newTier = 'silver';

    if (newTier !== account[0].tier) {
      await AppDataSource.query(
        `UPDATE loyalty_account SET tier = $1, updated_at = NOW() WHERE customer_id = $2`,
        [newTier, customerId]
      );
      logger.info(`[Loyalty] Tier upgrade: customer=${customerId}, ${account[0].tier} → ${newTier}`);
    }
  }

  private async getCustomerStats(customerId: string): Promise<any> {
    const result = await AppDataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM policy WHERE customer_id = $1) as policies_count,
        (SELECT COALESCE(SUM(premium_amount), 0) FROM policy WHERE customer_id = $1) as total_premium,
        (SELECT COUNT(*) FROM referral WHERE referrer_id = $1 AND status = 'completed') as referrals_count,
        (SELECT COUNT(*) FROM claim c JOIN policy p ON c.policy_id = p.id WHERE p.customer_id = $1 AND c.status = 'approved') as claims_approved,
        (SELECT EXTRACT(MONTH FROM AGE(NOW(), created_at)) FROM customer WHERE id = $1) as tenure_months,
        (SELECT COUNT(DISTINCT pr.insurance_type) FROM policy p JOIN product pr ON p.product_id = pr.id WHERE p.customer_id = $1) as product_types
    `, [customerId]);
    return result[0] || {};
  }

  private generateRewardCode(): string {
    return `RWD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
}
