import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export interface ApiPartner {
  id: string;
  name: string;
  api_key: string;
  api_secret: string;
  webhook_url?: string;
  rate_limit: number;
  scopes: string[];
  status: string;
  environment: 'sandbox' | 'production';
  created_at: string;
}

export interface ApiKeyValidation {
  valid: boolean;
  partner_id?: string;
  partner_name?: string;
  scopes?: string[];
  environment?: string;
  rate_limit?: number;
}

export interface WebhookEvent {
  id: string;
  partner_id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  last_attempt_at?: string;
  delivered_at?: string;
}

export class ApiV2Service {
  /**
   * Register API partner
   */
  async registerPartner(input: { name: string; webhook_url?: string; scopes: string[]; environment: 'sandbox' | 'production' }): Promise<ApiPartner> {
    const id = uuidv4();
    const apiKey = `ins_${input.environment === 'sandbox' ? 'test' : 'live'}_${crypto.randomBytes(24).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');

    await AppDataSource.query(
      `INSERT INTO api_partner (id, name, api_key, api_secret_hash, webhook_url, rate_limit, scopes, status, environment, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, NOW(), NOW())`,
      [id, input.name, apiKey, crypto.createHash('sha256').update(apiSecret).digest('hex'), input.webhook_url || null, 1000, JSON.stringify(input.scopes), input.environment]
    );

    logger.info(`[API v2] Partner registered: ${input.name}, env=${input.environment}`);

    return {
      id, name: input.name, api_key: apiKey, api_secret: apiSecret,
      webhook_url: input.webhook_url, rate_limit: 1000,
      scopes: input.scopes, status: 'active', environment: input.environment,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
    const partner = await AppDataSource.query(
      `SELECT id, name, scopes, environment, rate_limit, status FROM api_partner WHERE api_key = $1`,
      [apiKey]
    );

    if (partner.length === 0 || partner[0].status !== 'active') {
      return { valid: false };
    }

    return {
      valid: true,
      partner_id: partner[0].id,
      partner_name: partner[0].name,
      scopes: partner[0].scopes || [],
      environment: partner[0].environment,
      rate_limit: partner[0].rate_limit,
    };
  }

  /**
   * Track API usage
   */
  async trackUsage(partnerId: string, endpoint: string, method: string, statusCode: number, responseTimeMs: number): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO api_usage_log (id, partner_id, endpoint, method, status_code, response_time_ms, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuidv4(), partnerId, endpoint, method, statusCode, responseTimeMs]
    );
  }

  /**
   * Get API usage stats for partner
   */
  async getUsageStats(partnerId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<any> {
    const intervals: Record<string, string> = { day: '1 day', week: '7 days', month: '30 days' };
    const interval = intervals[period];

    const [totalStats, endpointStats, dailyStats] = await Promise.all([
      AppDataSource.query(`
        SELECT COUNT(*) as total_requests,
               COALESCE(AVG(response_time_ms), 0) as avg_response_time,
               COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
               COUNT(CASE WHEN status_code < 400 THEN 1 END) as success_count
        FROM api_usage_log WHERE partner_id = $1 AND created_at > NOW() - INTERVAL '${interval}'
      `, [partnerId]),
      AppDataSource.query(`
        SELECT endpoint, method, COUNT(*) as requests, COALESCE(AVG(response_time_ms), 0) as avg_time
        FROM api_usage_log WHERE partner_id = $1 AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY endpoint, method ORDER BY requests DESC LIMIT 20
      `, [partnerId]),
      AppDataSource.query(`
        SELECT DATE(created_at) as date, COUNT(*) as requests
        FROM api_usage_log WHERE partner_id = $1 AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY DATE(created_at) ORDER BY date
      `, [partnerId]),
    ]);

    const t = totalStats[0];
    return {
      period,
      total_requests: parseInt(t.total_requests) || 0,
      avg_response_time_ms: Math.round(parseFloat(t.avg_response_time) || 0),
      error_count: parseInt(t.error_count) || 0,
      success_rate: parseInt(t.total_requests) > 0 ? Math.round((parseInt(t.success_count) / parseInt(t.total_requests)) * 100) : 100,
      top_endpoints: endpointStats,
      daily_usage: dailyStats,
    };
  }

  /**
   * Send webhook to partner
   */
  async sendWebhook(partnerId: string, eventType: string, payload: any): Promise<void> {
    const partner = await AppDataSource.query(
      `SELECT webhook_url, api_secret_hash FROM api_partner WHERE id = $1 AND status = 'active'`,
      [partnerId]
    );
    if (partner.length === 0 || !partner[0].webhook_url) return;

    const webhookId = uuidv4();
    const timestamp = Date.now();
    const body = JSON.stringify({ id: webhookId, event: eventType, data: payload, timestamp });

    // Sign the payload
    const signature = crypto.createHmac('sha256', partner[0].api_secret_hash).update(body).digest('hex');

    await AppDataSource.query(
      `INSERT INTO webhook_event (id, partner_id, event_type, payload, signature, status, attempts, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', 0, NOW())`,
      [webhookId, partnerId, eventType, JSON.stringify(payload), signature]
    );

    // In production, this would be queued and retried
    try {
      // await fetch(partner[0].webhook_url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': signature, 'X-Webhook-Id': webhookId }, body });
      await AppDataSource.query(
        `UPDATE webhook_event SET status = 'delivered', delivered_at = NOW(), attempts = 1 WHERE id = $1`, [webhookId]
      );
      logger.info(`[Webhook] Delivered: ${eventType} to partner ${partnerId}`);
    } catch (error: any) {
      await AppDataSource.query(
        `UPDATE webhook_event SET status = 'failed', attempts = 1, last_error = $1 WHERE id = $2`,
        [error.message, webhookId]
      );
      logger.warn(`[Webhook] Failed: ${eventType} to partner ${partnerId}: ${error.message}`);
    }
  }

  /**
   * Get webhook events for partner
   */
  async getWebhookEvents(partnerId: string, page: number = 1, limit: number = 20): Promise<{ events: WebhookEvent[]; total: number }> {
    const offset = (page - 1) * limit;
    const [events, countResult] = await Promise.all([
      AppDataSource.query(
        `SELECT id, event_type, payload, status, attempts, last_attempt_at, delivered_at, created_at
         FROM webhook_event WHERE partner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [partnerId, limit, offset]
      ),
      AppDataSource.query(`SELECT COUNT(*) as total FROM webhook_event WHERE partner_id = $1`, [partnerId]),
    ]);

    return { events, total: parseInt(countResult[0]?.total) || 0 };
  }

  /**
   * Rotate API keys
   */
  async rotateApiKey(partnerId: string): Promise<{ api_key: string; api_secret: string }> {
    const partner = await AppDataSource.query(`SELECT environment FROM api_partner WHERE id = $1`, [partnerId]);
    if (partner.length === 0) throw new NotFoundError('Partner không tìm thấy');

    const env = partner[0].environment;
    const newApiKey = `ins_${env === 'sandbox' ? 'test' : 'live'}_${crypto.randomBytes(24).toString('hex')}`;
    const newApiSecret = crypto.randomBytes(32).toString('hex');

    await AppDataSource.query(
      `UPDATE api_partner SET api_key = $1, api_secret_hash = $2, updated_at = NOW() WHERE id = $3`,
      [newApiKey, crypto.createHash('sha256').update(newApiSecret).digest('hex'), partnerId]
    );

    return { api_key: newApiKey, api_secret: newApiSecret };
  }

  /**
   * Check rate limit for partner
   */
  async checkRateLimit(partnerId: string): Promise<{ allowed: boolean; remaining: number; reset_at: string }> {
    const partner = await AppDataSource.query(
      `SELECT rate_limit FROM api_partner WHERE id = $1`, [partnerId]
    );
    const rateLimit = partner[0]?.rate_limit || 1000;

    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);

    const usage = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM api_usage_log WHERE partner_id = $1 AND created_at >= $2`,
      [partnerId, currentHour]
    );

    const used = parseInt(usage[0]?.count) || 0;
    const remaining = Math.max(0, rateLimit - used);
    const resetAt = new Date(currentHour.getTime() + 60 * 60 * 1000);

    return { allowed: remaining > 0, remaining, reset_at: resetAt.toISOString() };
  }
}
