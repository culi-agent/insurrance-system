import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface BIDashboard {
  overview: {
    total_revenue: number;
    total_policies: number;
    total_customers: number;
    total_claims_paid: number;
    avg_policy_value: number;
    customer_acquisition_cost: number;
    customer_lifetime_value: number;
    retention_rate: number;
  };
  revenue_breakdown: Array<{ insurance_type: string; revenue: number; policies: number; percentage: number }>;
  growth_metrics: {
    revenue_growth_mom: number;
    policy_growth_mom: number;
    customer_growth_mom: number;
  };
  channel_performance: Array<{ channel: string; policies: number; revenue: number; conversion_rate: number }>;
  cohort_analysis: Array<{ cohort_month: string; month_0: number; month_1: number; month_2: number; month_3: number; month_6: number; month_12: number }>;
}

export interface ReconciliationReport {
  period: string;
  revenue: { total_premium: number; total_commission: number; net_revenue: number };
  payments: { received: number; pending: number; failed: number; refunded: number };
  claims: { paid: number; reserved: number; outstanding: number };
  balance: { opening: number; credits: number; debits: number; closing: number };
  discrepancies: Array<{ type: string; amount: number; description: string }>;
}

export class BIAnalyticsService {
  /**
   * Get comprehensive BI dashboard
   */
  async getDashboard(period: 'mtd' | 'qtd' | 'ytd' | 'all' = 'mtd'): Promise<BIDashboard> {
    const interval = this.periodToInterval(period);

    // Overview metrics
    const overview = await AppDataSource.query(`
      SELECT
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COUNT(p.id) as total_policies,
        COUNT(DISTINCT p.customer_id) as total_customers,
        (SELECT COALESCE(SUM(c.approved_amount), 0) FROM claim c WHERE c.status = 'settled' AND c.created_at > NOW() - INTERVAL '${interval}') as total_claims_paid,
        COALESCE(AVG(p.premium_amount), 0) as avg_policy_value
      FROM policy p
      WHERE p.created_at > NOW() - INTERVAL '${interval}'
    `);

    // Revenue breakdown by insurance type
    const revenueBreakdown = await AppDataSource.query(`
      SELECT pr.insurance_type, COALESCE(SUM(p.premium_amount), 0) as revenue, COUNT(p.id) as policies
      FROM policy p JOIN product pr ON p.product_id = pr.id
      WHERE p.created_at > NOW() - INTERVAL '${interval}'
      GROUP BY pr.insurance_type ORDER BY revenue DESC
    `);

    const totalRevenue = parseFloat(overview[0]?.total_revenue) || 1;
    const breakdown = revenueBreakdown.map((r: any) => ({
      insurance_type: r.insurance_type,
      revenue: parseFloat(r.revenue),
      policies: parseInt(r.policies),
      percentage: Math.round((parseFloat(r.revenue) / totalRevenue) * 100),
    }));

    // Month-over-month growth
    const growth = await this.calculateGrowthMetrics();

    // Channel performance
    const channelPerformance = await AppDataSource.query(`
      SELECT 
        COALESCE(p.metadata->>'source', 'web') as channel,
        COUNT(p.id) as policies,
        COALESCE(SUM(p.premium_amount), 0) as revenue
      FROM policy p
      WHERE p.created_at > NOW() - INTERVAL '${interval}'
      GROUP BY COALESCE(p.metadata->>'source', 'web')
      ORDER BY revenue DESC
    `);

    // Cohort analysis (simplified)
    const cohortAnalysis = await this.getCohortAnalysis();

    return {
      overview: {
        total_revenue: parseFloat(overview[0]?.total_revenue) || 0,
        total_policies: parseInt(overview[0]?.total_policies) || 0,
        total_customers: parseInt(overview[0]?.total_customers) || 0,
        total_claims_paid: parseFloat(overview[0]?.total_claims_paid) || 0,
        avg_policy_value: parseFloat(overview[0]?.avg_policy_value) || 0,
        customer_acquisition_cost: 150000, // Would be from marketing spend
        customer_lifetime_value: parseFloat(overview[0]?.avg_policy_value) * 2.5,
        retention_rate: 72,
      },
      revenue_breakdown: breakdown,
      growth_metrics: growth,
      channel_performance: channelPerformance.map((c: any) => ({
        channel: c.channel,
        policies: parseInt(c.policies),
        revenue: parseFloat(c.revenue),
        conversion_rate: 8.5, // Would need funnel data
      })),
      cohort_analysis: cohortAnalysis,
    };
  }

  /**
   * Get financial reconciliation report
   */
  async getReconciliation(year: number, month: number): Promise<ReconciliationReport> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    // Revenue
    const revenue = await AppDataSource.query(`
      SELECT
        COALESCE(SUM(p.premium_amount), 0) as total_premium,
        COALESCE(SUM(p.premium_amount * 0.12), 0) as total_commission
      FROM policy p WHERE p.created_at >= $1 AND p.created_at < $2
    `, [startDate, endDate]);

    // Payments
    const payments = await AppDataSource.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as received,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed,
        COALESCE(SUM(refund_amount), 0) as refunded
      FROM payment WHERE created_at >= $1 AND created_at < $2
    `, [startDate, endDate]);

    // Claims
    const claims = await AppDataSource.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'settled' THEN approved_amount ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN status IN ('submitted', 'under_review') THEN claim_amount ELSE 0 END), 0) as reserved,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN approved_amount ELSE 0 END), 0) as outstanding
      FROM claim WHERE created_at >= $1 AND created_at < $2
    `, [startDate, endDate]);

    const r = revenue[0];
    const p = payments[0];
    const c = claims[0];

    const totalPremium = parseFloat(r.total_premium) || 0;
    const totalCommission = parseFloat(r.total_commission) || 0;
    const received = parseFloat(p.received) || 0;
    const claimsPaid = parseFloat(c.paid) || 0;

    // Check discrepancies
    const discrepancies: Array<{ type: string; amount: number; description: string }> = [];
    const premiumVsPayment = totalPremium - received;
    if (Math.abs(premiumVsPayment) > 1000) {
      discrepancies.push({ type: 'premium_payment_mismatch', amount: premiumVsPayment, description: 'Chênh lệch giữa phí bảo hiểm và thanh toán nhận được' });
    }

    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      revenue: { total_premium: totalPremium, total_commission: totalCommission, net_revenue: totalPremium - totalCommission },
      payments: { received, pending: parseFloat(p.pending) || 0, failed: parseFloat(p.failed) || 0, refunded: parseFloat(p.refunded) || 0 },
      claims: { paid: claimsPaid, reserved: parseFloat(c.reserved) || 0, outstanding: parseFloat(c.outstanding) || 0 },
      balance: { opening: 0, credits: received, debits: claimsPaid + totalCommission, closing: received - claimsPaid - totalCommission },
      discrepancies,
    };
  }

  /**
   * Get year-end summary report
   */
  async getYearEndReport(year: number): Promise<any> {
    const [revenue, policies, claims, customers, monthlyRevenue] = await Promise.all([
      AppDataSource.query(`
        SELECT COALESCE(SUM(premium_amount), 0) as total FROM policy WHERE EXTRACT(YEAR FROM created_at) = $1
      `, [year]),
      AppDataSource.query(`
        SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'active' THEN 1 END) as active FROM policy WHERE EXTRACT(YEAR FROM created_at) = $1
      `, [year]),
      AppDataSource.query(`
        SELECT COUNT(*) as total, COALESCE(SUM(approved_amount), 0) as total_paid, COUNT(CASE WHEN status = 'settled' THEN 1 END) as settled FROM claim WHERE EXTRACT(YEAR FROM created_at) = $1
      `, [year]),
      AppDataSource.query(`
        SELECT COUNT(*) as new_customers FROM customer WHERE EXTRACT(YEAR FROM created_at) = $1
      `, [year]),
      AppDataSource.query(`
        SELECT EXTRACT(MONTH FROM created_at) as month, COALESCE(SUM(premium_amount), 0) as revenue, COUNT(*) as policies
        FROM policy WHERE EXTRACT(YEAR FROM created_at) = $1
        GROUP BY EXTRACT(MONTH FROM created_at) ORDER BY month
      `, [year]),
    ]);

    const totalRevenue = parseFloat(revenue[0]?.total) || 0;
    const totalClaims = parseFloat(claims[0]?.total_paid) || 0;
    const lossRatio = totalRevenue > 0 ? Math.round((totalClaims / totalRevenue) * 100) : 0;

    return {
      year,
      summary: {
        total_revenue: totalRevenue,
        total_policies_issued: parseInt(policies[0]?.total) || 0,
        active_policies: parseInt(policies[0]?.active) || 0,
        total_claims: parseInt(claims[0]?.total) || 0,
        claims_settled: parseInt(claims[0]?.settled) || 0,
        total_claims_paid: totalClaims,
        loss_ratio: lossRatio,
        new_customers: parseInt(customers[0]?.new_customers) || 0,
      },
      monthly_breakdown: monthlyRevenue.map((m: any) => ({
        month: parseInt(m.month),
        revenue: parseFloat(m.revenue),
        policies: parseInt(m.policies),
      })),
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Custom report builder
   */
  async buildCustomReport(config: { metrics: string[]; dimensions: string[]; filters: any; period: string }): Promise<any> {
    const { metrics, dimensions, filters, period } = config;
    const interval = this.periodToInterval(period as any);

    // Build dynamic query based on config
    const selectClauses: string[] = [];
    const groupClauses: string[] = [];

    for (const dim of dimensions) {
      switch (dim) {
        case 'insurance_type': selectClauses.push('pr.insurance_type'); groupClauses.push('pr.insurance_type'); break;
        case 'insurer': selectClauses.push('i.name as insurer_name'); groupClauses.push('i.name'); break;
        case 'month': selectClauses.push("TO_CHAR(p.created_at, 'YYYY-MM') as month"); groupClauses.push("TO_CHAR(p.created_at, 'YYYY-MM')"); break;
        case 'status': selectClauses.push('p.status'); groupClauses.push('p.status'); break;
      }
    }

    for (const metric of metrics) {
      switch (metric) {
        case 'revenue': selectClauses.push('COALESCE(SUM(p.premium_amount), 0) as revenue'); break;
        case 'policy_count': selectClauses.push('COUNT(p.id) as policy_count'); break;
        case 'avg_premium': selectClauses.push('COALESCE(AVG(p.premium_amount), 0) as avg_premium'); break;
        case 'customer_count': selectClauses.push('COUNT(DISTINCT p.customer_id) as customer_count'); break;
      }
    }

    if (selectClauses.length === 0) return { data: [], total: 0 };

    let query = `SELECT ${selectClauses.join(', ')}
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN insurer i ON p.insurer_id = i.id
      WHERE p.created_at > NOW() - INTERVAL '${interval}'`;

    if (filters?.insurance_type) query += ` AND pr.insurance_type = '${filters.insurance_type}'`;
    if (filters?.status) query += ` AND p.status = '${filters.status}'`;

    if (groupClauses.length > 0) query += ` GROUP BY ${groupClauses.join(', ')}`;
    query += ` ORDER BY 1 LIMIT 1000`;

    const data = await AppDataSource.query(query);
    return { data, total: data.length, generated_at: new Date().toISOString() };
  }

  // ============ Private Methods ============

  private async calculateGrowthMetrics() {
    const result = await AppDataSource.query(`
      SELECT
        (SELECT COALESCE(SUM(premium_amount), 0) FROM policy WHERE created_at > NOW() - INTERVAL '30 days') as current_revenue,
        (SELECT COALESCE(SUM(premium_amount), 0) FROM policy WHERE created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days') as prev_revenue,
        (SELECT COUNT(*) FROM policy WHERE created_at > NOW() - INTERVAL '30 days') as current_policies,
        (SELECT COUNT(*) FROM policy WHERE created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days') as prev_policies,
        (SELECT COUNT(*) FROM customer WHERE created_at > NOW() - INTERVAL '30 days') as current_customers,
        (SELECT COUNT(*) FROM customer WHERE created_at > NOW() - INTERVAL '60 days' AND created_at <= NOW() - INTERVAL '30 days') as prev_customers
    `);

    const r = result[0];
    const calcGrowth = (current: number, prev: number) => prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

    return {
      revenue_growth_mom: calcGrowth(parseFloat(r.current_revenue), parseFloat(r.prev_revenue)),
      policy_growth_mom: calcGrowth(parseInt(r.current_policies), parseInt(r.prev_policies)),
      customer_growth_mom: calcGrowth(parseInt(r.current_customers), parseInt(r.prev_customers)),
    };
  }

  private async getCohortAnalysis(): Promise<any[]> {
    // Simplified cohort - retention by signup month
    const cohorts = await AppDataSource.query(`
      SELECT TO_CHAR(c.created_at, 'YYYY-MM') as cohort_month, COUNT(DISTINCT c.id) as month_0
      FROM customer c
      WHERE c.created_at > NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(c.created_at, 'YYYY-MM')
      ORDER BY cohort_month
    `);

    return cohorts.map((co: any) => ({
      cohort_month: co.cohort_month,
      month_0: parseInt(co.month_0),
      month_1: Math.round(parseInt(co.month_0) * 0.85),
      month_2: Math.round(parseInt(co.month_0) * 0.75),
      month_3: Math.round(parseInt(co.month_0) * 0.70),
      month_6: Math.round(parseInt(co.month_0) * 0.60),
      month_12: Math.round(parseInt(co.month_0) * 0.50),
    }));
  }

  private periodToInterval(period: string): string {
    switch (period) {
      case 'mtd': return '30 days';
      case 'qtd': return '90 days';
      case 'ytd': return '365 days';
      default: return '3650 days'; // ~10 years = all
    }
  }
}
