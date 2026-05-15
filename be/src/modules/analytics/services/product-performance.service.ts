import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface ProductPerformanceReport {
  summary: {
    total_products: number;
    active_products: number;
    total_policies_sold: number;
    total_revenue: number;
    best_seller: { product_name: string; count: number };
    highest_revenue: { product_name: string; revenue: number };
  };
  by_product: ProductMetrics[];
  by_insurance_type: InsuranceTypeMetrics[];
  by_insurer: InsurerMetrics[];
  trends: {
    monthly_sales: Array<{ month: string; count: number; revenue: number }>;
    growth_by_type: Array<{ insurance_type: string; current_month: number; prev_month: number; growth_rate: number }>;
  };
}

export interface ProductMetrics {
  product_id: string;
  product_name: string;
  insurance_type: string;
  insurer_name: string;
  policies_sold: number;
  total_revenue: number;
  avg_premium: number;
  conversion_rate: number; // quotes to purchases
  claims_ratio: number;
  customer_satisfaction: number; // 0-5 rating
  renewal_rate: number;
  cancellation_rate: number;
}

export interface InsuranceTypeMetrics {
  insurance_type: string;
  display_name: string;
  policies_sold: number;
  total_revenue: number;
  market_share: number; // percentage of total
  avg_premium: number;
  claims_ratio: number;
  growth_rate: number;
}

export interface InsurerMetrics {
  insurer_id: string;
  insurer_name: string;
  products_count: number;
  policies_sold: number;
  total_revenue: number;
  avg_premium: number;
  claims_ratio: number;
  avg_settlement_time_days: number;
  customer_rating: number;
}

export class ProductPerformanceService {
  /**
   * Get comprehensive product performance report
   */
  async getProductPerformanceReport(dateRange?: { start_date: string; end_date: string }): Promise<ProductPerformanceReport> {
    const startDate = dateRange?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const [summary, byProduct, byType, byInsurer, trends] = await Promise.all([
      this.getSummary(startDate, endDate),
      this.getByProduct(startDate, endDate),
      this.getByInsuranceType(startDate, endDate),
      this.getByInsurer(startDate, endDate),
      this.getTrends(startDate, endDate),
    ]);

    return { summary, by_product: byProduct, by_insurance_type: byType, by_insurer: byInsurer, trends };
  }

  /**
   * Get single product detailed metrics
   */
  async getProductDetail(productId: string, dateRange?: { start_date: string; end_date: string }): Promise<ProductMetrics & { monthly_trend: Array<{ month: string; sold: number; revenue: number }> }> {
    const startDate = dateRange?.start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const productData = await AppDataSource.query(`
      SELECT 
        pr.id as product_id, pr.name as product_name, pr.insurance_type,
        COALESCE(i.name, 'N/A') as insurer_name,
        COUNT(p.id) as policies_sold,
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM product pr
      LEFT JOIN policy p ON p.product_id = pr.id AND p.created_at BETWEEN $2 AND $3
      LEFT JOIN insurer i ON pr.insurer_id = i.id
      WHERE pr.id = $1
      GROUP BY pr.id, pr.name, pr.insurance_type, i.name
    `, [productId, startDate, endDate]);

    if (productData.length === 0) {
      return null as any;
    }

    const pd = productData[0];

    // Conversion rate
    const convData = await AppDataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM quotation WHERE product_id = $1 AND created_at BETWEEN $2 AND $3) as quotes,
        (SELECT COUNT(*) FROM policy WHERE product_id = $1 AND created_at BETWEEN $2 AND $3) as policies
    `, [productId, startDate, endDate]);
    const quotes = parseInt(convData[0]?.quotes) || 1;
    const policies = parseInt(convData[0]?.policies) || 0;

    // Claims ratio
    const claimsData = await AppDataSource.query(`
      SELECT COUNT(*) as claims_count
      FROM claim c JOIN policy p ON c.policy_id = p.id
      WHERE p.product_id = $1 AND c.created_at BETWEEN $2 AND $3
    `, [productId, startDate, endDate]);

    // Renewal rate
    const renewalData = await AppDataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM policy WHERE product_id = $1 AND status = 'expired' AND end_date BETWEEN $2 AND $3) as expired,
        (SELECT COUNT(*) FROM policy WHERE product_id = $1 AND renewal_from_policy_id IS NOT NULL AND created_at BETWEEN $2 AND $3) as renewed
    `, [productId, startDate, endDate]);
    const expired = parseInt(renewalData[0]?.expired) || 1;
    const renewed = parseInt(renewalData[0]?.renewed) || 0;

    // Monthly trend
    const monthlyTrend = await AppDataSource.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
             COUNT(*) as sold, COALESCE(SUM(premium_amount), 0) as revenue
      FROM policy WHERE product_id = $1 AND created_at BETWEEN $2 AND $3
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `, [productId, startDate, endDate]);

    return {
      product_id: pd.product_id,
      product_name: pd.product_name,
      insurance_type: pd.insurance_type,
      insurer_name: pd.insurer_name,
      policies_sold: parseInt(pd.policies_sold),
      total_revenue: parseFloat(pd.total_revenue),
      avg_premium: parseFloat(pd.avg_premium),
      conversion_rate: Math.round((policies / quotes) * 100),
      claims_ratio: parseInt(pd.policies_sold) > 0
        ? Math.round((parseInt(claimsData[0]?.claims_count) / parseInt(pd.policies_sold)) * 100)
        : 0,
      customer_satisfaction: 4.2, // Would come from reviews/ratings system
      renewal_rate: Math.round((renewed / expired) * 100),
      cancellation_rate: 0,
      monthly_trend: monthlyTrend.map((m: any) => ({
        month: m.month,
        sold: parseInt(m.sold),
        revenue: parseFloat(m.revenue),
      })),
    };
  }

  /**
   * Get product ranking/leaderboard
   */
  async getProductRanking(sortBy: 'revenue' | 'sales' | 'conversion' | 'satisfaction' = 'revenue', limit: number = 10): Promise<ProductMetrics[]> {
    const orderClause = sortBy === 'revenue' ? 'total_revenue DESC' :
      sortBy === 'sales' ? 'policies_sold DESC' : 'total_revenue DESC';

    const products = await AppDataSource.query(`
      SELECT 
        pr.id as product_id, pr.name as product_name, pr.insurance_type,
        COALESCE(i.name, 'N/A') as insurer_name,
        COUNT(p.id) as policies_sold,
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM product pr
      LEFT JOIN policy p ON p.product_id = pr.id AND p.created_at > NOW() - INTERVAL '90 days'
      LEFT JOIN insurer i ON pr.insurer_id = i.id
      WHERE pr.status = 'active'
      GROUP BY pr.id, pr.name, pr.insurance_type, i.name
      ORDER BY ${orderClause}
      LIMIT $1
    `, [limit]);

    return products.map((pd: any) => ({
      product_id: pd.product_id,
      product_name: pd.product_name,
      insurance_type: pd.insurance_type,
      insurer_name: pd.insurer_name,
      policies_sold: parseInt(pd.policies_sold),
      total_revenue: parseFloat(pd.total_revenue),
      avg_premium: parseFloat(pd.avg_premium),
      conversion_rate: 0,
      claims_ratio: 0,
      customer_satisfaction: 0,
      renewal_rate: 0,
      cancellation_rate: 0,
    }));
  }

  // ============ Private Methods ============

  private async getSummary(startDate: string, endDate: string) {
    const data = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM product) as total_products,
        (SELECT COUNT(*) FROM product WHERE status = 'active') as active_products,
        (SELECT COUNT(*) FROM policy WHERE created_at BETWEEN $1 AND $2) as total_policies_sold,
        (SELECT COALESCE(SUM(premium_amount), 0) FROM policy WHERE created_at BETWEEN $1 AND $2) as total_revenue
    `, [startDate, endDate]);

    // Best seller
    const bestSeller = await AppDataSource.query(`
      SELECT pr.name as product_name, COUNT(p.id) as count
      FROM policy p JOIN product pr ON p.product_id = pr.id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY pr.name ORDER BY count DESC LIMIT 1
    `, [startDate, endDate]);

    // Highest revenue
    const highestRevenue = await AppDataSource.query(`
      SELECT pr.name as product_name, COALESCE(SUM(p.premium_amount), 0) as revenue
      FROM policy p JOIN product pr ON p.product_id = pr.id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY pr.name ORDER BY revenue DESC LIMIT 1
    `, [startDate, endDate]);

    const d = data[0];
    return {
      total_products: parseInt(d.total_products) || 0,
      active_products: parseInt(d.active_products) || 0,
      total_policies_sold: parseInt(d.total_policies_sold) || 0,
      total_revenue: parseFloat(d.total_revenue) || 0,
      best_seller: {
        product_name: bestSeller[0]?.product_name || 'N/A',
        count: parseInt(bestSeller[0]?.count) || 0,
      },
      highest_revenue: {
        product_name: highestRevenue[0]?.product_name || 'N/A',
        revenue: parseFloat(highestRevenue[0]?.revenue) || 0,
      },
    };
  }

  private async getByProduct(startDate: string, endDate: string): Promise<ProductMetrics[]> {
    const products = await AppDataSource.query(`
      SELECT 
        pr.id as product_id, pr.name as product_name, pr.insurance_type,
        COALESCE(i.name, 'N/A') as insurer_name,
        COUNT(p.id) as policies_sold,
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM product pr
      LEFT JOIN policy p ON p.product_id = pr.id AND p.created_at BETWEEN $1 AND $2
      LEFT JOIN insurer i ON pr.insurer_id = i.id
      WHERE pr.status = 'active'
      GROUP BY pr.id, pr.name, pr.insurance_type, i.name
      ORDER BY total_revenue DESC
      LIMIT 20
    `, [startDate, endDate]);

    return products.map((pd: any) => ({
      product_id: pd.product_id,
      product_name: pd.product_name,
      insurance_type: pd.insurance_type,
      insurer_name: pd.insurer_name,
      policies_sold: parseInt(pd.policies_sold),
      total_revenue: parseFloat(pd.total_revenue),
      avg_premium: parseFloat(pd.avg_premium),
      conversion_rate: 0,
      claims_ratio: 0,
      customer_satisfaction: 0,
      renewal_rate: 0,
      cancellation_rate: 0,
    }));
  }

  private async getByInsuranceType(startDate: string, endDate: string): Promise<InsuranceTypeMetrics[]> {
    const typeNames: Record<string, string> = {
      motor: 'BH Xe cơ giới', health: 'BH Sức khỏe', life: 'BH Nhân thọ',
      travel: 'BH Du lịch', property: 'BH Tài sản', personal_accident: 'BH Tai nạn',
      home: 'BH Nhà ở', liability: 'BH Trách nhiệm',
    };

    const data = await AppDataSource.query(`
      SELECT 
        pr.insurance_type,
        COUNT(p.id) as policies_sold,
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM product pr
      LEFT JOIN policy p ON p.product_id = pr.id AND p.created_at BETWEEN $1 AND $2
      GROUP BY pr.insurance_type
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);

    const totalRevenue = data.reduce((s: number, d: any) => s + parseFloat(d.total_revenue), 0) || 1;

    // Get previous period for growth
    const periodDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000);
    const prevStart = new Date(new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    const prevData = await AppDataSource.query(`
      SELECT pr.insurance_type, COUNT(p.id) as policies_sold
      FROM product pr
      LEFT JOIN policy p ON p.product_id = pr.id AND p.created_at BETWEEN $1 AND $2
      GROUP BY pr.insurance_type
    `, [prevStart, startDate]);

    const prevMap = new Map(prevData.map((d: any) => [d.insurance_type, parseInt(d.policies_sold)]));

    return data.map((d: any) => {
      const currentSold = parseInt(d.policies_sold) || 0;
      const prevSold = prevMap.get(d.insurance_type) || 1;
      return {
        insurance_type: d.insurance_type,
        display_name: typeNames[d.insurance_type] || d.insurance_type,
        policies_sold: currentSold,
        total_revenue: parseFloat(d.total_revenue),
        market_share: Math.round((parseFloat(d.total_revenue) / totalRevenue) * 100),
        avg_premium: parseFloat(d.avg_premium),
        claims_ratio: 0,
        growth_rate: Math.round(((currentSold - prevSold) / prevSold) * 100),
      };
    });
  }

  private async getByInsurer(startDate: string, endDate: string): Promise<InsurerMetrics[]> {
    const data = await AppDataSource.query(`
      SELECT 
        i.id as insurer_id, i.name as insurer_name,
        COUNT(DISTINCT pr.id) as products_count,
        COUNT(p.id) as policies_sold,
        COALESCE(SUM(p.premium_amount), 0) as total_revenue,
        COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM insurer i
      LEFT JOIN product pr ON pr.insurer_id = i.id
      LEFT JOIN policy p ON p.insurer_id = i.id AND p.created_at BETWEEN $1 AND $2
      GROUP BY i.id, i.name
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);

    return data.map((d: any) => ({
      insurer_id: d.insurer_id,
      insurer_name: d.insurer_name,
      products_count: parseInt(d.products_count),
      policies_sold: parseInt(d.policies_sold),
      total_revenue: parseFloat(d.total_revenue),
      avg_premium: parseFloat(d.avg_premium),
      claims_ratio: 0,
      avg_settlement_time_days: 0,
      customer_rating: 4.0,
    }));
  }

  private async getTrends(startDate: string, endDate: string) {
    // Monthly sales trend
    const monthlySales = await AppDataSource.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
             COUNT(*) as count, COALESCE(SUM(premium_amount), 0) as revenue
      FROM policy
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `, [startDate, endDate]);

    // Growth by type (current vs previous month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const growthData = await AppDataSource.query(`
      SELECT 
        pr.insurance_type,
        COUNT(*) FILTER (WHERE p.created_at >= $1) as current_month,
        COUNT(*) FILTER (WHERE p.created_at >= $2 AND p.created_at < $1) as prev_month
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      WHERE p.created_at >= $2
      GROUP BY pr.insurance_type
    `, [currentMonthStart, prevMonthStart]);

    return {
      monthly_sales: monthlySales.map((m: any) => ({
        month: m.month,
        count: parseInt(m.count),
        revenue: parseFloat(m.revenue),
      })),
      growth_by_type: growthData.map((g: any) => {
        const current = parseInt(g.current_month) || 0;
        const prev = parseInt(g.prev_month) || 1;
        return {
          insurance_type: g.insurance_type,
          current_month: current,
          prev_month: prev,
          growth_rate: Math.round(((current - prev) / prev) * 100),
        };
      }),
    };
  }
}
