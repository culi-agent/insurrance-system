import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface SystemConfig {
  [key: string]: any;
}

export interface ConfigEntry {
  key: string;
  value: any;
  category: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updated_at: string;
  updated_by?: string;
}

export class SystemConfigService {
  private cache: Map<string, any> = new Map();

  async get(key: string, defaultValue?: any): Promise<any> {
    if (this.cache.has(key)) return this.cache.get(key);
    const r = await AppDataSource.query(`SELECT value, type FROM system_config WHERE key = $1`, [key]);
    if (r.length === 0) return defaultValue;
    const val = this.parseValue(r[0].value, r[0].type);
    this.cache.set(key, val);
    return val;
  }

  async set(key: string, value: any, category: string, description: string, type: string, updatedBy: string): Promise<void> {
    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await AppDataSource.query(
      `INSERT INTO system_config (key, value, category, description, type, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, category = $3, description = $4, type = $5, updated_by = $6, updated_at = NOW()`,
      [key, strValue, category, description, type, updatedBy]
    );
    this.cache.set(key, value);
    logger.info(`[Config] Updated: ${key} by ${updatedBy}`);
  }

  async getAll(category?: string): Promise<ConfigEntry[]> {
    let query = `SELECT * FROM system_config`;
    const params: any[] = [];
    if (category) { query += ` WHERE category = $1`; params.push(category); }
    query += ` ORDER BY category, key`;
    const rows = await AppDataSource.query(query, params);
    return rows.map((r: any) => ({ key: r.key, value: this.parseValue(r.value, r.type), category: r.category, description: r.description, type: r.type, updated_at: r.updated_at, updated_by: r.updated_by }));
  }

  async getByCategory(category: string): Promise<Record<string, any>> {
    const entries = await this.getAll(category);
    const result: Record<string, any> = {};
    for (const e of entries) result[e.key] = e.value;
    return result;
  }

  async delete(key: string): Promise<void> {
    await AppDataSource.query(`DELETE FROM system_config WHERE key = $1`, [key]);
    this.cache.delete(key);
  }

  async getCategories(): Promise<string[]> {
    const r = await AppDataSource.query(`SELECT DISTINCT category FROM system_config ORDER BY category`);
    return r.map((row: any) => row.category);
  }

  /** Initialize default configs if not exist */
  async initDefaults(): Promise<void> {
    const defaults: Array<{ key: string; value: any; category: string; description: string; type: string }> = [
      { key: 'app.maintenance_mode', value: false, category: 'app', description: 'Bật/tắt chế độ bảo trì', type: 'boolean' },
      { key: 'app.version', value: '1.5.0', category: 'app', description: 'Phiên bản API hiện tại', type: 'string' },
      { key: 'app.min_mobile_version', value: '1.0.0', category: 'app', description: 'Phiên bản mobile tối thiểu', type: 'string' },
      { key: 'payment.vnpay_enabled', value: true, category: 'payment', description: 'Bật/tắt VNPay', type: 'boolean' },
      { key: 'payment.momo_enabled', value: true, category: 'payment', description: 'Bật/tắt Momo', type: 'boolean' },
      { key: 'payment.zalopay_enabled', value: true, category: 'payment', description: 'Bật/tắt ZaloPay', type: 'boolean' },
      { key: 'notification.renewal_days', value: [30, 14, 7, 3, 1], category: 'notification', description: 'Nhắc gia hạn trước X ngày', type: 'json' },
      { key: 'notification.email_enabled', value: true, category: 'notification', description: 'Bật/tắt email', type: 'boolean' },
      { key: 'notification.sms_enabled', value: true, category: 'notification', description: 'Bật/tắt SMS', type: 'boolean' },
      { key: 'quotation.expiry_days', value: 30, category: 'quotation', description: 'Báo giá hết hạn sau X ngày', type: 'number' },
      { key: 'quotation.max_comparison', value: 4, category: 'quotation', description: 'Số SP tối đa so sánh', type: 'number' },
      { key: 'claims.fast_track_limit', value: 5000000, category: 'claims', description: 'Giới hạn fast-track (VND)', type: 'number' },
      { key: 'claims.auto_approve_enabled', value: true, category: 'claims', description: 'Bật auto-approve claims nhỏ', type: 'boolean' },
      { key: 'security.max_login_attempts', value: 5, category: 'security', description: 'Số lần đăng nhập sai tối đa', type: 'number' },
      { key: 'security.session_timeout_hours', value: 24, category: 'security', description: 'Phiên hết hạn sau X giờ', type: 'number' },
      { key: 'security.otp_expiry_minutes', value: 5, category: 'security', description: 'OTP hết hạn sau X phút', type: 'number' },
    ];

    for (const d of defaults) {
      const exists = await AppDataSource.query(`SELECT 1 FROM system_config WHERE key = $1`, [d.key]);
      if (exists.length === 0) {
        const strValue = typeof d.value === 'object' ? JSON.stringify(d.value) : String(d.value);
        await AppDataSource.query(
          `INSERT INTO system_config (key, value, category, description, type, updated_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [d.key, strValue, d.category, d.description, d.type]
        );
      }
    }
  }

  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'number': return Number(value);
      case 'boolean': return value === 'true';
      case 'json': try { return JSON.parse(value); } catch { return value; }
      default: return value;
    }
  }
}
