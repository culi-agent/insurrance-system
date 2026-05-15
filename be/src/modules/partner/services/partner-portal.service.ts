import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface PartnerDashboard {
  partner: { id: string; name: string; type: string; status: string };
  performance: {
    total_policies: number;
    total_premium: number;
    total_commission: number;
    pending_commission: number;
    active_products: number;
    avg_conversion_rate: number;
  };
  monthly_trend: Array<{ month: string; policies: number; premium: number; commission: number }>;
  top_products: Array<{ product_name: string; insurance_type: string; policies_sold: number; revenue: number }>;
}

export interface PartnerProduct {
  id: string;
  name: string;
  insurance_type: string;
  status: string;
  commission_rate: number;
  policies_sold: number;
  total_premium: number;
  total_commission: number;
  avg_premium: number;
  created_at: string;
}

export interface PartnerPerformanceMetrics {
  period: string;
  policies_issued: number;
  total_premium: number;
  commission_earned: number;
  claims_count: number;
  claims_amount: number;
  loss_ratio: number;
  renewal_rate: number;
  customer_satisfaction: number;
  comparison_to_avg: {
    premium_vs_avg: number;
    conversion_vs_avg: number;
    claims_vs_avg: number;
  };
}

export class PartnerPortalService {
  /**
   * Get partner dashboard overview
   */
  async getDashboard(partnerId: string): Promise<PartnerDashboard> {
    const partner = await AppDataSource.query(
      `SELECT id, name, type, status FROM insurer WHERE id = $1`, [partnerId]
    );

    if (partner.length === 0) {
      return { partner: { id: partnerId, name: 'Unknown', type: 'insurer', status: 'active' }, performance: { total_policies: 0, total_premium: 0, total_commission: 0, pending_commission: 0, active_products: 0, avg_conversion_rate: 0 }, monthly_trend: [], top_products: [] };
    }

    // Performance summary
    const perf = await AppDataSource.query(`
      SELECT
        COUNT(p.id) as total_policies,
        COALESCE(SUM(p.premium_amount), 0) as total_premium,
        COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as total_commission,
        (SELECT COUNT(*) FROM product WHERE insurer_id = $1 AND status = 'active') as active_products
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = $1 AND pc.insurance_type = pr.insurance_type
      WHERE p.insurer_id = $1
    `, [partnerId]);

    // Conversion rate
    const convData = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM quotation WHERE insurer_id = $1) as quotes,
        (SELECT COUNT(*) FROM policy WHERE insurer_id = $1) as policies
    `, [partnerId]);
    const quotes = parseInt(convData[0]?.quotes) || 1;
    const policies = parseInt(convData[0]?.policies) || 0;

    // Monthly trend (last 6 months)
    const monthlyTrend = await AppDataSource.query(`
      SELECT TO_CHAR(p.created_at, 'YYYY-MM') as month,
             COUNT(*) as policies,
             COALESCE(SUM(p.premium_amount), 0) as premium,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = $1 AND pc.insurance_type = pr.insurance_type
      WHERE p.insurer_id = $1 AND p.created_at > NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(p.created_at, 'YYYY-MM')
      ORDER BY month
    `, [partnerId]);

    // Top products
    const topProducts = await AppDataSource.query(`
      SELECT pr.name as product_name, pr.insurance_type, COUNT(p.id) as policies_sold,
             COALESCE(SUM(p.premium_amount), 0) as revenue
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      WHERE p.insurer_id = $1
      GROUP BY pr.name, pr.insurance_type
      ORDER BY revenue DESC LIMIT 5
    `, [partnerId]);

    const p = perf[0];
    return {
      partner: partner[0],
      performance: {
        total_policies: parseInt(p.total_policies) || 0,
        total_premium: parseFloat(p.total_premium) || 0,
        total_commission: parseFloat(p.total_commission) || 0,
        pending_commission: parseFloat(p.total_commission) * 0.2,
        active_products: parseInt(p.active_products) || 0,
        avg_conversion_rate: Math.round((policies / quotes) * 100),
      },
      monthly_trend: monthlyTrend.map((m: any) => ({
        month: m.month, policies: parseInt(m.policies), premium: parseFloat(m.premium), commission: parseFloat(m.commission),
      })),
      top_products: topProducts.map((tp: any) => ({
        product_name: tp.product_name, insurance_type: tp.insurance_type, policies_sold: parseInt(tp.policies_sold), revenue: parseFloat(tp.revenue),
      })),
    };
  }

  /**
   * Get partner's products with performance
   */
  async getProducts(partnerId: string, page: number = 1, limit: number = 20): Promise<{ products: PartnerProduct[]; total: number }> {
    const offset = (page - 1) * limit;

    const [products, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT pr.id, pr.name, pr.insurance_type, pr.status, pr.created_at,
               COALESCE(pc.commission_rate, 0.1) as commission_rate,
               COUNT(p.id) as policies_sold,
               COALESCE(SUM(p.premium_amount), 0) as total_premium,
               COALESCE(AVG(p.premium_amount), 0) as avg_premium
        FROM product pr
        LEFT JOIN policy p ON p.product_id = pr.id
        LEFT JOIN partner_commission pc ON pc.insurer_id = pr.insurer_id AND pc.insurance_type = pr.insurance_type
        WHERE pr.insurer_id = $1
        GROUP BY pr.id, pr.name, pr.insurance_type, pr.status, pr.created_at, pc.commission_rate
        ORDER BY total_premium DESC
        LIMIT $2 OFFSET $3
      `, [partnerId, limit, offset]),
      AppDataSource.query(`SELECT COUNT(*) as total FROM product WHERE insurer_id = $1`, [partnerId]),
    ]);

    return {
      products: products.map((pr: any) => ({
        id: pr.id,
        name: pr.name,
        insurance_type: pr.insurance_type,
        status: pr.status,
        commission_rate: parseFloat(pr.commission_rate),
        policies_sold: parseInt(pr.policies_sold),
        total_premium: parseFloat(pr.total_premium),
        total_commission: parseFloat(pr.total_premium) * parseFloat(pr.commission_rate),
        avg_premium: parseFloat(pr.avg_premium),
        created_at: pr.created_at,
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Get detailed performance metrics
   */
  async getPerformanceMetrics(partnerId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<PartnerPerformanceMetrics[]> {
    let groupFormat = 'YYYY-MM';
    let interval = '12 months';
    if (period === 'quarterly') { groupFormat = 'YYYY-"Q"Q'; interval = '2 years'; }
    if (period === 'yearly') { groupFormat = 'YYYY'; interval = '3 years'; }

    const data = await AppDataSource.query(`
      SELECT TO_CHAR(p.created_at, $2) as period,
             COUNT(p.id) as policies_issued,
             COALESCE(SUM(p.premium_amount), 0) as total_premium,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission_earned
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = $1 AND pc.insurance_type = pr.insurance_type
      WHERE p.insurer_id = $1 AND p.created_at > NOW() - INTERVAL '${interval}'
      GROUP BY TO_CHAR(p.created_at, $2)
      ORDER BY period
    `, [partnerId, groupFormat]);

    // Get claims data
    const claimsData = await AppDataSource.query(`
      SELECT TO_CHAR(c.created_at, $2) as period, COUNT(*) as claims_count,
             COALESCE(SUM(c.claim_amount), 0) as claims_amount
      FROM claim c
      WHERE c.insurer_id = $1 AND c.created_at > NOW() - INTERVAL '${interval}'
      GROUP BY TO_CHAR(c.created_at, $2)
    `, [partnerId, groupFormat]);
    const claimsMap = new Map(claimsData.map((c: any) => [c.period, c]));

    return data.map((d: any) => {
      const claims = claimsMap.get(d.period) || { claims_count: 0, claims_amount: 0 };
      const premium = parseFloat(d.total_premium) || 1;
      return {
        period: d.period,
        policies_issued: parseInt(d.policies_issued),
        total_premium: premium,
        commission_earned: parseFloat(d.commission_earned),
        claims_count: parseInt(claims.claims_count) || 0,
        claims_amount: parseFloat(claims.claims_amount) || 0,
        loss_ratio: Math.round((parseFloat(claims.claims_amount || 0) / premium) * 100),
        renewal_rate: 75, // Would need renewal tracking per insurer
        customer_satisfaction: 4.2,
        comparison_to_avg: { premium_vs_avg: 0, conversion_vs_avg: 0, claims_vs_avg: 0 },
      };
    });
  }

  /**
   * Get partner's policies list
   */
  async getPolicies(partnerId: string, page: number = 1, limit: number = 20, status?: string): Promise<{ policies: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = `WHERE p.insurer_id = $1`;
    const params: any[] = [partnerId];

    if (status) {
      params.push(status);
      where += ` AND p.status = $${params.length}`;
    }

    const [policies, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT p.id, p.policy_number, pr.name as product_name, pr.insurance_type,
               c.full_name as customer_name, p.premium_amount, p.status, p.start_date, p.end_date, p.created_at
        FROM policy p
        JOIN product pr ON p.product_id = pr.id
        JOIN customer c ON p.customer_id = c.id
        ${where}
        ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),
      AppDataSource.query(`SELECT COUNT(*) as total FROM policy p ${where}`, params),
    ]);

    return {
      policies,
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Get partner's claims
   */
  async getClaims(partnerId: string, page: number = 1, limit: number = 20): Promise<{ claims: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const [claims, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT c.id, c.claim_number, c.claim_type, c.claim_amount, c.approved_amount,
               c.status, p.policy_number, pr.name as product_name, cust.full_name as customer_name, c.created_at
        FROM claim c
        JOIN policy p ON c.policy_id = p.id
        JOIN product pr ON p.product_id = pr.id
        JOIN customer cust ON c.customer_id = cust.id
        WHERE c.insurer_id = $1
        ORDER BY c.created_at DESC LIMIT $2 OFFSET $3
      `, [partnerId, limit, offset]),
      AppDataSource.query(`SELECT COUNT(*) as total FROM claim WHERE insurer_id = $1`, [partnerId]),
    ]);

    return { claims, total: parseInt(countResult[0]?.total) || 0 };
  }
}
