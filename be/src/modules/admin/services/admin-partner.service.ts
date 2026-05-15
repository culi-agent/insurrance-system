import { AppDataSource } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface PartnerInput {
  name: string;
  code: string;
  type: 'insurer' | 'payment_gateway' | 'service_provider';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  api_endpoint?: string;
  commission_rate?: number;
  status?: string;
  config?: Record<string, any>;
}

export class AdminPartnerService {
  /**
   * List all partners/insurers
   */
  async listPartners(page = 1, perPage = 20, type?: string, status?: string) {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    const offset = (page - 1) * perPage;

    const countResult = await AppDataSource.query(
      `SELECT COUNT(*) as total FROM partner ${whereClause}`, params
    );

    const data = await AppDataSource.query(
      `SELECT * FROM partner ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, perPage, offset]
    );

    return {
      data: data.map(this.formatPartner),
      total: parseInt(countResult[0]?.total) || 0,
      page,
      per_page: perPage,
    };
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(partnerId: string) {
    const result = await AppDataSource.query(
      `SELECT * FROM partner WHERE id = $1`, [partnerId]
    );

    if (result.length === 0) throw new NotFoundError('Partner không tìm thấy');

    // Get partner performance
    const performance = await AppDataSource.query(`
      SELECT 
        COUNT(*) as total_policies,
        COALESCE(SUM(premium_amount), 0) as total_revenue,
        COUNT(*) FILTER (WHERE status = 'active') as active_policies
      FROM policy WHERE insurer_id = $1
    `, [partnerId]);

    return {
      ...this.formatPartner(result[0]),
      performance: {
        total_policies: parseInt(performance[0]?.total_policies) || 0,
        total_revenue: parseFloat(performance[0]?.total_revenue) || 0,
        active_policies: parseInt(performance[0]?.active_policies) || 0,
      },
    };
  }

  /**
   * Create partner
   */
  async createPartner(input: PartnerInput) {
    const id = uuidv4();

    await AppDataSource.query(
      `INSERT INTO partner (id, name, code, type, contact_name, contact_email, contact_phone, api_endpoint, commission_rate, status, config, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        id, input.name, input.code, input.type,
        input.contact_name || null, input.contact_email || null, input.contact_phone || null,
        input.api_endpoint || null, input.commission_rate || 0,
        input.status || 'active', JSON.stringify(input.config || {}),
      ]
    );

    logger.info(`[Partner] Created partner: ${input.name} (${input.code})`);

    return { id, ...input, status: input.status || 'active' };
  }

  /**
   * Update partner
   */
  async updatePartner(partnerId: string, input: Partial<PartnerInput>) {
    const existing = await AppDataSource.query(`SELECT * FROM partner WHERE id = $1`, [partnerId]);
    if (existing.length === 0) throw new NotFoundError('Partner không tìm thấy');

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) { updates.push(`name = $${paramIndex++}`); params.push(input.name); }
    if (input.contact_name !== undefined) { updates.push(`contact_name = $${paramIndex++}`); params.push(input.contact_name); }
    if (input.contact_email !== undefined) { updates.push(`contact_email = $${paramIndex++}`); params.push(input.contact_email); }
    if (input.contact_phone !== undefined) { updates.push(`contact_phone = $${paramIndex++}`); params.push(input.contact_phone); }
    if (input.api_endpoint !== undefined) { updates.push(`api_endpoint = $${paramIndex++}`); params.push(input.api_endpoint); }
    if (input.commission_rate !== undefined) { updates.push(`commission_rate = $${paramIndex++}`); params.push(input.commission_rate); }
    if (input.status !== undefined) { updates.push(`status = $${paramIndex++}`); params.push(input.status); }
    if (input.config !== undefined) { updates.push(`config = $${paramIndex++}`); params.push(JSON.stringify(input.config)); }

    if (updates.length === 0) throw new ValidationError('Không có dữ liệu để cập nhật');

    updates.push(`updated_at = NOW()`);

    await AppDataSource.query(
      `UPDATE partner SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      [...params, partnerId]
    );

    logger.info(`[Partner] Updated partner: ${partnerId}`);
    return this.getPartnerById(partnerId);
  }

  /**
   * Get partner performance report
   */
  async getPartnerPerformance(dateRange?: { start_date: string; end_date: string }) {
    const startDate = dateRange?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const performance = await AppDataSource.query(`
      SELECT 
        p.insurer_id,
        COALESCE(pr.name, 'Unknown') as partner_name,
        COUNT(*) as policies_sold,
        COALESCE(SUM(p.premium_amount), 0) as revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium,
        COUNT(*) FILTER (WHERE p.status = 'active') as active_policies,
        COUNT(*) FILTER (WHERE p.status = 'cancelled') as cancelled_policies
      FROM policy p
      LEFT JOIN partner pr ON p.insurer_id = pr.id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY p.insurer_id, pr.name
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    return performance.map((p: any) => ({
      partner_id: p.insurer_id,
      partner_name: p.partner_name,
      policies_sold: parseInt(p.policies_sold),
      revenue: parseFloat(p.revenue),
      avg_premium: parseFloat(p.avg_premium),
      active_policies: parseInt(p.active_policies),
      cancelled_policies: parseInt(p.cancelled_policies),
      cancellation_rate: parseInt(p.policies_sold) > 0
        ? (parseInt(p.cancelled_policies) / parseInt(p.policies_sold)) * 100
        : 0,
    }));
  }

  private formatPartner(row: any) {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type,
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      api_endpoint: row.api_endpoint,
      commission_rate: row.commission_rate,
      status: row.status,
      config: row.config,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
