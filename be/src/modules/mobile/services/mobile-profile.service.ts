import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { ValidationError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export interface MobileProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  id_number?: string;
  address?: string;
  city?: string;
  occupation?: string;
  marital_status?: string;
  annual_income?: number;
  verified: boolean;
  kyc_status: string;
  created_at: string;
  stats: {
    total_policies: number;
    active_policies: number;
    total_claims: number;
    total_spent: number;
    member_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

export interface ProfileUpdateInput {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  occupation?: string;
  marital_status?: string;
  annual_income?: number;
  avatar_url?: string;
}

export interface AppSettings {
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'system';
  biometric_login: boolean;
  auto_renew_default: boolean;
  currency_display: 'VND' | 'USD';
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  notification_sound: boolean;
  haptic_feedback: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  biometric_enabled: boolean;
  last_password_change?: string;
  active_sessions: Array<{
    id: string;
    device: string;
    platform: string;
    last_active: string;
    is_current: boolean;
  }>;
  login_history: Array<{
    date: string;
    device: string;
    ip_address: string;
    success: boolean;
  }>;
}

export class MobileProfileService {
  /**
   * Get full profile for mobile
   */
  async getProfile(customerId: string): Promise<MobileProfile> {
    const customer = await AppDataSource.query(
      `SELECT * FROM customer WHERE id = $1`, [customerId]
    );

    if (customer.length === 0) {
      throw new ValidationError('Tài khoản không tồn tại');
    }

    const c = customer[0];

    // Get stats
    const stats = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM policy WHERE customer_id = $1) as total_policies,
        (SELECT COUNT(*) FROM policy WHERE customer_id = $1 AND status = 'active') as active_policies,
        (SELECT COUNT(*) FROM claim WHERE customer_id = $1) as total_claims,
        (SELECT COALESCE(SUM(premium_amount), 0) FROM policy WHERE customer_id = $1) as total_spent
    `, [customerId]);

    const s = stats[0];
    const totalSpent = parseFloat(s.total_spent) || 0;

    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      avatar_url: c.avatar_url,
      date_of_birth: c.date_of_birth ? new Date(c.date_of_birth).toISOString().slice(0, 10) : undefined,
      gender: c.gender,
      id_number: c.id_number ? this.maskIdNumber(c.id_number) : undefined,
      address: c.address,
      city: c.city,
      occupation: c.occupation,
      marital_status: c.marital_status,
      annual_income: c.annual_income,
      verified: c.kyc_status === 'verified',
      kyc_status: c.kyc_status || 'pending',
      created_at: c.created_at,
      stats: {
        total_policies: parseInt(s.total_policies) || 0,
        active_policies: parseInt(s.active_policies) || 0,
        total_claims: parseInt(s.total_claims) || 0,
        total_spent: totalSpent,
        member_tier: this.calculateTier(totalSpent, parseInt(s.total_policies) || 0),
      },
    };
  }

  /**
   * Update profile
   */
  async updateProfile(customerId: string, input: ProfileUpdateInput): Promise<MobileProfile> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    const allowedFields: (keyof ProfileUpdateInput)[] = [
      'full_name', 'phone', 'date_of_birth', 'gender', 'address',
      'city', 'occupation', 'marital_status', 'annual_income', 'avatar_url',
    ];

    for (const field of allowedFields) {
      if (input[field] !== undefined) {
        updates.push(`${field} = $${paramIdx++}`);
        values.push(input[field]);
      }
    }

    if (updates.length === 0) {
      return this.getProfile(customerId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(customerId);

    await AppDataSource.query(
      `UPDATE customer SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    logger.info(`[Profile] Updated: customer=${customerId}, fields=${Object.keys(input).join(',')}`);
    return this.getProfile(customerId);
  }

  /**
   * Change password
   */
  async changePassword(customerId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const customer = await AppDataSource.query(
      `SELECT password_hash FROM customer WHERE id = $1`, [customerId]
    );

    if (customer.length === 0) {
      throw new ValidationError('Tài khoản không tồn tại');
    }

    // In production, use bcrypt.compare
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, customer[0].password_hash);
    if (!isValid) {
      throw new ValidationError('Mật khẩu hiện tại không đúng');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await AppDataSource.query(
      `UPDATE customer SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [hashedPassword, customerId]
    );

    logger.info(`[Profile] Password changed: customer=${customerId}`);
    return { success: true, message: 'Đổi mật khẩu thành công' };
  }

  /**
   * Get app settings
   */
  async getSettings(customerId: string): Promise<AppSettings> {
    const result = await AppDataSource.query(
      `SELECT settings FROM customer_settings WHERE customer_id = $1`,
      [customerId]
    );

    if (result.length === 0) {
      return this.getDefaultSettings();
    }

    return { ...this.getDefaultSettings(), ...result[0].settings };
  }

  /**
   * Update app settings
   */
  async updateSettings(customerId: string, settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings(customerId);
    const updated = { ...current, ...settings };

    await AppDataSource.query(
      `INSERT INTO customer_settings (id, customer_id, settings, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (customer_id) DO UPDATE SET settings = $3, updated_at = NOW()`,
      [uuidv4(), customerId, JSON.stringify(updated)]
    );

    return updated;
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(customerId: string): Promise<SecuritySettings> {
    const customer = await AppDataSource.query(
      `SELECT two_factor_enabled, password_changed_at FROM customer WHERE id = $1`,
      [customerId]
    );

    // Active sessions
    const sessions = await AppDataSource.query(
      `SELECT id, device_info, platform, last_active_at, created_at
       FROM session WHERE customer_id = $1 AND is_active = true
       ORDER BY last_active_at DESC LIMIT 10`,
      [customerId]
    );

    // Login history
    const loginHistory = await AppDataSource.query(
      `SELECT created_at as date, device_info as device, ip_address, success
       FROM login_history WHERE customer_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [customerId]
    );

    // Check if biometric is enabled
    const biometric = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM device_registration 
       WHERE customer_id = $1 AND is_active = true`,
      [customerId]
    );

    return {
      two_factor_enabled: customer[0]?.two_factor_enabled || false,
      biometric_enabled: parseInt(biometric[0]?.count) > 0,
      last_password_change: customer[0]?.password_changed_at || undefined,
      active_sessions: sessions.map((s: any) => ({
        id: s.id,
        device: s.device_info || 'Unknown device',
        platform: s.platform || 'unknown',
        last_active: s.last_active_at,
        is_current: false, // Would be determined by current session token
      })),
      login_history: loginHistory.map((l: any) => ({
        date: l.date,
        device: l.device || 'Unknown',
        ip_address: l.ip_address || '***',
        success: l.success,
      })),
    };
  }

  /**
   * Logout from specific session
   */
  async logoutSession(customerId: string, sessionId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE session SET is_active = false, ended_at = NOW() WHERE id = $1 AND customer_id = $2`,
      [sessionId, customerId]
    );
  }

  /**
   * Logout from all sessions
   */
  async logoutAllSessions(customerId: string, exceptSessionId?: string): Promise<{ logged_out: number }> {
    let query = `UPDATE session SET is_active = false, ended_at = NOW() WHERE customer_id = $1 AND is_active = true`;
    const params: any[] = [customerId];

    if (exceptSessionId) {
      query += ` AND id != $2`;
      params.push(exceptSessionId);
    }

    const result = await AppDataSource.query(query, params);
    return { logged_out: result?.rowCount || 0 };
  }

  /**
   * Delete account request
   */
  async requestAccountDeletion(customerId: string, reason: string): Promise<{ request_id: string; message: string }> {
    const requestId = uuidv4();

    await AppDataSource.query(
      `INSERT INTO account_deletion_request (id, customer_id, reason, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW())`,
      [requestId, customerId, reason]
    );

    logger.info(`[Profile] Account deletion requested: customer=${customerId}`);

    return {
      request_id: requestId,
      message: 'Yêu cầu xóa tài khoản đã được ghi nhận. Chúng tôi sẽ xử lý trong 30 ngày. Bạn có thể hủy yêu cầu bất cứ lúc nào.',
    };
  }

  // ============ Private Methods ============

  private maskIdNumber(idNumber: string): string {
    if (idNumber.length <= 4) return '****';
    return '***' + idNumber.slice(-4);
  }

  private calculateTier(totalSpent: number, totalPolicies: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (totalSpent >= 100000000 || totalPolicies >= 10) return 'platinum';
    if (totalSpent >= 50000000 || totalPolicies >= 5) return 'gold';
    if (totalSpent >= 20000000 || totalPolicies >= 3) return 'silver';
    return 'bronze';
  }

  private getDefaultSettings(): AppSettings {
    return {
      language: 'vi',
      theme: 'system',
      biometric_login: false,
      auto_renew_default: true,
      currency_display: 'VND',
      date_format: 'DD/MM/YYYY',
      notification_sound: true,
      haptic_feedback: true,
    };
  }
}
