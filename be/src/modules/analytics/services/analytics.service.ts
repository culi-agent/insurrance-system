import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface KPIWidgets {
  total_policies: number;
  active_policies: number;
  total_revenue: number;
  total_claims: number;
  claims_ratio: number;
  new_customers_this_month: number;
  conversion_rate: number;
  average_premium: number;
}

export interface SalesReport {
  period: string;
  total_sales: number;
  total_revenue: number;
  policies_issued: number;
  avg_premium: number;
  by_product: Array<{ insurance_type: string; count: number; revenue: number }>;
  by_insurer: Array<{ insurer_id: string; insurer_name: string; count: number; revenue: number }>;
}

export interface ConversionFunnel {
  visitors: number;
  quote_started: number;
  quote_completed: number;
  purchase_started: number;
  payment_initiated: number;
  payment_completed: number;
  policy_issued: number;
  rates: {
    quote_start_rate: number;
    quote_completion_rate: number;
    purchase_rate: number;
    payment_rate: number;
    overall_conversion: number;
  };
}

export class AnalyticsService {
  /**
   * Get KPI widgets for admin dashboard
   */
  async getKPIWidgets(): Promise<KPIWidgets> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total and active policies
    const policyStats = await AppDataSource.query(`
      SELECT 
        COUNT(*) as total_policies,
        COUNT(*) FILTER (WHERE status = 'active') as active_policies,
        COALESCE(AVG(premium_amount), 0) as average_premium
      FROM policy
    `);

    // Total revenue
    const revenueStats = await AppDataSource.query(`
      SELECT COALESCE(SUM(amount), 0) as total_revenue
      FROM payment WHERE status = 'paid'
    `);

    // Claims stats
    const claimsStats = await AppDataSource.query(`
      SELECT 
        COUNT(*) as total_claims,
        COUNT(*) FILTER (WHERE status IN ('approved', 'settled')) as approved_claims
      FROM claim
    `);

    // New customers this month
    const customerStats = await AppDataSource.query(`
      SELECT COUNT(*) as new_customers
      FROM customer WHERE created_at >= $1
    `, [startOfMonth]);

    // Conversion rate (orders completed / quotations)
    const conversionStats = await AppDataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM quotation) as total_quotes,
        (SELECT COUNT(*) FROM purchase_order WHERE status = 'completed') as completed_orders
    `);

    const totalQuotes = parseInt(conversionStats[0]?.total_quotes) || 1;
    const completedOrders = parseInt(conversionStats[0]?.completed_orders) || 0;

    return {
      total_policies: parseInt(policyStats[0]?.total_policies) || 0,
      active_policies: parseInt(policyStats[0]?.active_policies) || 0,
      total_revenue: parseFloat(revenueStats[0]?.total_revenue) || 0,
      total_claims: parseInt(claimsStats[0]?.total_claims) || 0,
      claims_ratio: parseInt(policyStats[0]?.total_policies) > 0
        ? (parseInt(claimsStats[0]?.total_claims) / parseInt(policyStats[0]?.total_policies)) * 100
        : 0,
      new_customers_this_month: parseInt(customerStats[0]?.new_customers) || 0,
      conversion_rate: (completedOrders / totalQuotes) * 100,
      average_premium: parseFloat(policyStats[0]?.average_premium) || 0,
    };
  }

  /**
   * Get sales reports (daily/weekly/monthly)
   */
  async getSalesReport(period: 'daily' | 'weekly' | 'monthly', dateRange?: DateRange): Promise<SalesReport[]> {
    const now = new Date();
    let startDate: string;
    let groupFormat: string;

    switch (period) {
      case 'daily':
        startDate = dateRange?.start_date || new Date(now.setDate(now.getDate() - 30)).toISOString();
        groupFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        startDate = dateRange?.start_date || new Date(now.setDate(now.getDate() - 90)).toISOString();
        groupFormat = 'IYYY-IW';
        break;
      case 'monthly':
        startDate = dateRange?.start_date || new Date(now.setMonth(now.getMonth() - 12)).toISOString();
        groupFormat = 'YYYY-MM';
        break;
    }

    const endDate = dateRange?.end_date || new Date().toISOString();

    // Sales by period
    const salesByPeriod = await AppDataSource.query(`
      SELECT 
        TO_CHAR(p.created_at, $1) as period,
        COUNT(*) as policies_issued,
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM policy p
      WHERE p.created_at BETWEEN $2 AND $3
      GROUP BY TO_CHAR(p.created_at, $1)
      ORDER BY period DESC
    `, [groupFormat, startDate, endDate]);

    // By product type
    const byProduct = await AppDataSource.query(`
      SELECT 
        insurance_type,
        COUNT(*) as count,
        COALESCE(SUM(premium_amount), 0) as revenue
      FROM policy
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY insurance_type
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    // By insurer
    const byInsurer = await AppDataSource.query(`
      SELECT 
        p.insurer_id,
        COALESCE(i.name, 'Unknown') as insurer_name,
        COUNT(*) as count,
        COALESCE(SUM(p.premium_amount), 0) as revenue
      FROM policy p
      LEFT JOIN insurer i ON p.insurer_id = i.id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY p.insurer_id, i.name
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    return salesByPeriod.map((row: any) => ({
      period: row.period,
      total_sales: parseInt(row.policies_issued),
      total_revenue: parseFloat(row.total_revenue),
      policies_issued: parseInt(row.policies_issued),
      avg_premium: parseFloat(row.avg_premium),
      by_product: byProduct.map((p: any) => ({
        insurance_type: p.insurance_type,
        count: parseInt(p.count),
        revenue: parseFloat(p.revenue),
      })),
      by_insurer: byInsurer.map((i: any) => ({
        insurer_id: i.insurer_id,
        insurer_name: i.insurer_name,
        count: parseInt(i.count),
        revenue: parseFloat(i.revenue),
      })),
    }));
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(dateRange?: DateRange): Promise<ConversionFunnel> {
    const startDate = dateRange?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const funnelData = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM quotation WHERE created_at BETWEEN $1 AND $2) as quote_started,
        (SELECT COUNT(*) FROM quotation WHERE status IN ('quoted', 'accepted', 'converted') AND created_at BETWEEN $1 AND $2) as quote_completed,
        (SELECT COUNT(*) FROM purchase_order WHERE created_at BETWEEN $1 AND $2) as purchase_started,
        (SELECT COUNT(*) FROM payment WHERE created_at BETWEEN $1 AND $2) as payment_initiated,
        (SELECT COUNT(*) FROM payment WHERE status = 'paid' AND created_at BETWEEN $1 AND $2) as payment_completed,
        (SELECT COUNT(*) FROM policy WHERE created_at BETWEEN $1 AND $2) as policy_issued
    `, [startDate, endDate]);

    const data = funnelData[0];
    const quoteStarted = parseInt(data.quote_started) || 0;
    const quoteCompleted = parseInt(data.quote_completed) || 0;
    const purchaseStarted = parseInt(data.purchase_started) || 0;
    const paymentInitiated = parseInt(data.payment_initiated) || 0;
    const paymentCompleted = parseInt(data.payment_completed) || 0;
    const policyIssued = parseInt(data.policy_issued) || 0;

    // Estimate visitors (3x of quote started)
    const visitors = quoteStarted * 3;

    return {
      visitors,
      quote_started: quoteStarted,
      quote_completed: quoteCompleted,
      purchase_started: purchaseStarted,
      payment_initiated: paymentInitiated,
      payment_completed: paymentCompleted,
      policy_issued: policyIssued,
      rates: {
        quote_start_rate: visitors > 0 ? (quoteStarted / visitors) * 100 : 0,
        quote_completion_rate: quoteStarted > 0 ? (quoteCompleted / quoteStarted) * 100 : 0,
        purchase_rate: quoteCompleted > 0 ? (purchaseStarted / quoteCompleted) * 100 : 0,
        payment_rate: purchaseStarted > 0 ? (paymentCompleted / purchaseStarted) * 100 : 0,
        overall_conversion: visitors > 0 ? (policyIssued / visitors) * 100 : 0,
      },
    };
  }

  /**
   * Get revenue breakdown
   */
  async getRevenueBreakdown(dateRange?: DateRange) {
    const startDate = dateRange?.start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const monthly = await AppDataSource.query(`
      SELECT 
        TO_CHAR(paid_at, 'YYYY-MM') as month,
        COUNT(*) as transactions,
        COALESCE(SUM(amount), 0) as revenue
      FROM payment 
      WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
      ORDER BY month
    `, [startDate, endDate]);

    return {
      monthly_revenue: monthly.map((m: any) => ({
        month: m.month,
        transactions: parseInt(m.transactions),
        revenue: parseFloat(m.revenue),
      })),
      total_revenue: monthly.reduce((sum: number, m: any) => sum + parseFloat(m.revenue), 0),
      total_transactions: monthly.reduce((sum: number, m: any) => sum + parseInt(m.transactions), 0),
    };
  }
}
