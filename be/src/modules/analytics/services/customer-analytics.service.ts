import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface CustomerAnalyticsReport {
  overview: {
    total_customers: number;
    active_customers: number;
    new_customers_this_month: number;
    new_customers_last_month: number;
    growth_rate: number; // percentage
    avg_customer_age: number;
    avg_policies_per_customer: number;
  };
  retention: {
    overall_retention_rate: number;
    monthly_retention: Array<{ month: string; retained: number; churned: number; rate: number }>;
    cohort_analysis: Array<{
      cohort_month: string;
      total_customers: number;
      retention_by_month: Array<{ month_number: number; retained_count: number; rate: number }>;
    }>;
  };
  acquisition: {
    by_channel: Array<{ channel: string; count: number; percentage: number; avg_ltv: number }>;
    by_month: Array<{ month: string; count: number; cost_per_acquisition?: number }>;
    conversion_from_quote: number;
  };
  engagement: {
    avg_session_duration: number;
    avg_pages_per_session: number;
    active_users_daily: number;
    active_users_weekly: number;
    active_users_monthly: number;
    engagement_by_feature: Array<{ feature: string; usage_count: number; unique_users: number }>;
  };
  demographics: {
    by_age_group: Array<{ age_group: string; count: number; percentage: number; avg_premium: number }>;
    by_gender: Array<{ gender: string; count: number; percentage: number }>;
    by_location: Array<{ location: string; count: number; percentage: number }>;
    by_occupation: Array<{ occupation: string; count: number; percentage: number }>;
  };
  churn: {
    churn_rate: number;
    at_risk_customers: number;
    churn_reasons: Array<{ reason: string; count: number; percentage: number }>;
    predicted_churn_next_30_days: number;
  };
}

export interface CustomerRetentionData {
  month: string;
  starting_customers: number;
  ending_customers: number;
  new_customers: number;
  churned_customers: number;
  retention_rate: number;
  churn_rate: number;
}

export class CustomerAnalyticsService {
  /**
   * Get comprehensive customer analytics report
   */
  async getCustomerReport(dateRange?: { start_date: string; end_date: string }): Promise<CustomerAnalyticsReport> {
    const startDate = dateRange?.start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const [overview, retention, acquisition, engagement, demographics, churn] = await Promise.all([
      this.getOverviewMetrics(startDate, endDate),
      this.getRetentionMetrics(startDate, endDate),
      this.getAcquisitionMetrics(startDate, endDate),
      this.getEngagementMetrics(startDate, endDate),
      this.getDemographicMetrics(),
      this.getChurnMetrics(),
    ]);

    return { overview, retention, acquisition, engagement, demographics, churn };
  }

  /**
   * Get retention data by month
   */
  async getMonthlyRetention(months: number = 12): Promise<CustomerRetentionData[]> {
    const results: CustomerRetentionData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const prevMonthStart = new Date(monthStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

      const data = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE created_at < $2 AND (end_date > $1 OR status = 'active')) as starting_customers,
          (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE created_at < $3 AND (end_date > $2 OR status = 'active')) as ending_customers,
          (SELECT COUNT(DISTINCT customer_id) FROM customer WHERE created_at >= $1 AND created_at < $2) as new_customers
      `, [monthStart.toISOString(), monthEnd.toISOString(), monthEnd.toISOString()]);

      const d = data[0];
      const starting = parseInt(d.starting_customers) || 0;
      const ending = parseInt(d.ending_customers) || 0;
      const newCust = parseInt(d.new_customers) || 0;
      const churned = Math.max(0, starting + newCust - ending);

      results.push({
        month: monthStart.toISOString().slice(0, 7),
        starting_customers: starting,
        ending_customers: ending,
        new_customers: newCust,
        churned_customers: churned,
        retention_rate: starting > 0 ? Math.round(((starting - churned) / starting) * 100) : 100,
        churn_rate: starting > 0 ? Math.round((churned / starting) * 100) : 0,
      });
    }

    return results;
  }

  /**
   * Get customer cohort analysis
   */
  async getCohortAnalysis(cohortMonths: number = 6): Promise<any[]> {
    const cohorts = [];

    for (let i = cohortMonths - 1; i >= 0; i--) {
      const cohortStart = new Date();
      cohortStart.setMonth(cohortStart.getMonth() - i, 1);
      cohortStart.setHours(0, 0, 0, 0);

      const cohortEnd = new Date(cohortStart);
      cohortEnd.setMonth(cohortEnd.getMonth() + 1);

      // Get customers who joined in this cohort month
      const cohortCustomers = await AppDataSource.query(
        `SELECT id FROM customer WHERE created_at >= $1 AND created_at < $2`,
        [cohortStart.toISOString(), cohortEnd.toISOString()]
      );

      const customerIds = cohortCustomers.map((c: any) => c.id);
      if (customerIds.length === 0) continue;

      const retentionByMonth: Array<{ month_number: number; retained_count: number; rate: number }> = [];

      // Check retention for each subsequent month
      for (let m = 1; m <= i + 1 && m <= 6; m++) {
        const checkStart = new Date(cohortStart);
        checkStart.setMonth(checkStart.getMonth() + m);
        const checkEnd = new Date(checkStart);
        checkEnd.setMonth(checkEnd.getMonth() + 1);

        const retained = await AppDataSource.query(
          `SELECT COUNT(DISTINCT customer_id) as count
           FROM policy
           WHERE customer_id = ANY($1) AND status = 'active' AND created_at < $2`,
          [customerIds, checkEnd.toISOString()]
        );

        const retainedCount = parseInt(retained[0]?.count) || 0;
        retentionByMonth.push({
          month_number: m,
          retained_count: retainedCount,
          rate: Math.round((retainedCount / customerIds.length) * 100),
        });
      }

      cohorts.push({
        cohort_month: cohortStart.toISOString().slice(0, 7),
        total_customers: customerIds.length,
        retention_by_month: retentionByMonth,
      });
    }

    return cohorts;
  }

  // ============ Private Methods ============

  private async getOverviewMetrics(startDate: string, endDate: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = startOfMonth;

    const data = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM customer) as total_customers,
        (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE status = 'active') as active_customers,
        (SELECT COUNT(*) FROM customer WHERE created_at >= $1) as new_this_month,
        (SELECT COUNT(*) FROM customer WHERE created_at >= $2 AND created_at < $3) as new_last_month,
        (SELECT COALESCE(AVG(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth))), 0) FROM customer WHERE date_of_birth IS NOT NULL) as avg_age,
        (SELECT COALESCE(AVG(policy_count), 0) FROM (SELECT COUNT(*) as policy_count FROM policy GROUP BY customer_id) sub) as avg_policies
    `, [startOfMonth, startOfLastMonth, endOfLastMonth]);

    const d = data[0];
    const newThisMonth = parseInt(d.new_this_month) || 0;
    const newLastMonth = parseInt(d.new_last_month) || 1;

    return {
      total_customers: parseInt(d.total_customers) || 0,
      active_customers: parseInt(d.active_customers) || 0,
      new_customers_this_month: newThisMonth,
      new_customers_last_month: newLastMonth,
      growth_rate: Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100),
      avg_customer_age: Math.round(parseFloat(d.avg_age) || 0),
      avg_policies_per_customer: Math.round((parseFloat(d.avg_policies) || 0) * 10) / 10,
    };
  }

  private async getRetentionMetrics(startDate: string, endDate: string) {
    const monthlyRetention = await this.getMonthlyRetention(12);
    const cohortAnalysis = await this.getCohortAnalysis(6);

    const avgRetention = monthlyRetention.length > 0
      ? Math.round(monthlyRetention.reduce((sum, m) => sum + m.retention_rate, 0) / monthlyRetention.length)
      : 0;

    return {
      overall_retention_rate: avgRetention,
      monthly_retention: monthlyRetention.map(m => ({
        month: m.month,
        retained: m.starting_customers - m.churned_customers,
        churned: m.churned_customers,
        rate: m.retention_rate,
      })),
      cohort_analysis: cohortAnalysis,
    };
  }

  private async getAcquisitionMetrics(startDate: string, endDate: string) {
    // By channel (source)
    const byChannel = await AppDataSource.query(`
      SELECT 
        COALESCE(source, 'direct') as channel,
        COUNT(*) as count
      FROM customer
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY COALESCE(source, 'direct')
      ORDER BY count DESC
    `, [startDate, endDate]);

    const totalByChannel = byChannel.reduce((s: number, c: any) => s + parseInt(c.count), 0) || 1;

    // By month
    const byMonth = await AppDataSource.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM customer
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `, [startDate, endDate]);

    // Conversion from quote
    const conversionData = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(DISTINCT customer_id) FROM quotation WHERE created_at BETWEEN $1 AND $2) as quoted,
        (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE created_at BETWEEN $1 AND $2) as purchased
    `, [startDate, endDate]);
    const quoted = parseInt(conversionData[0]?.quoted) || 1;
    const purchased = parseInt(conversionData[0]?.purchased) || 0;

    return {
      by_channel: byChannel.map((c: any) => ({
        channel: c.channel,
        count: parseInt(c.count),
        percentage: Math.round((parseInt(c.count) / totalByChannel) * 100),
        avg_ltv: 0, // Would need more complex calculation
      })),
      by_month: byMonth.map((m: any) => ({
        month: m.month,
        count: parseInt(m.count),
      })),
      conversion_from_quote: Math.round((purchased / quoted) * 100),
    };
  }

  private async getEngagementMetrics(startDate: string, endDate: string) {
    // Feature usage from audit log
    const featureUsage = await AppDataSource.query(`
      SELECT 
        action as feature,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_log
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY action
      ORDER BY usage_count DESC
      LIMIT 10
    `, [startDate, endDate]);

    // Active users
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const activeUsers = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(DISTINCT user_id) FROM audit_log WHERE created_at >= $1) as dau,
        (SELECT COUNT(DISTINCT user_id) FROM audit_log WHERE created_at >= $2) as wau,
        (SELECT COUNT(DISTINCT user_id) FROM audit_log WHERE created_at >= $3) as mau
    `, [dayAgo, weekAgo, monthAgo]);

    return {
      avg_session_duration: 0, // Would need session tracking
      avg_pages_per_session: 0,
      active_users_daily: parseInt(activeUsers[0]?.dau) || 0,
      active_users_weekly: parseInt(activeUsers[0]?.wau) || 0,
      active_users_monthly: parseInt(activeUsers[0]?.mau) || 0,
      engagement_by_feature: featureUsage.map((f: any) => ({
        feature: f.feature,
        usage_count: parseInt(f.usage_count),
        unique_users: parseInt(f.unique_users),
      })),
    };
  }

  private async getDemographicMetrics() {
    // By age group
    const byAge = await AppDataSource.query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) < 25 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) < 45 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) < 55 THEN '45-54'
          ELSE '55+'
        END as age_group,
        COUNT(*) as count,
        COALESCE(AVG(sub.avg_premium), 0) as avg_premium
      FROM customer c
      LEFT JOIN (
        SELECT customer_id, AVG(premium_amount) as avg_premium FROM policy GROUP BY customer_id
      ) sub ON sub.customer_id = c.id
      WHERE c.date_of_birth IS NOT NULL
      GROUP BY age_group
      ORDER BY age_group
    `);

    const totalByAge = byAge.reduce((s: number, a: any) => s + parseInt(a.count), 0) || 1;

    // By gender
    const byGender = await AppDataSource.query(`
      SELECT COALESCE(gender, 'unknown') as gender, COUNT(*) as count
      FROM customer GROUP BY COALESCE(gender, 'unknown')
    `);
    const totalByGender = byGender.reduce((s: number, g: any) => s + parseInt(g.count), 0) || 1;

    // By location
    const byLocation = await AppDataSource.query(`
      SELECT COALESCE(city, 'Không xác định') as location, COUNT(*) as count
      FROM customer GROUP BY COALESCE(city, 'Không xác định')
      ORDER BY count DESC LIMIT 10
    `);
    const totalByLocation = byLocation.reduce((s: number, l: any) => s + parseInt(l.count), 0) || 1;

    // By occupation
    const byOccupation = await AppDataSource.query(`
      SELECT COALESCE(occupation, 'Không xác định') as occupation, COUNT(*) as count
      FROM customer GROUP BY COALESCE(occupation, 'Không xác định')
      ORDER BY count DESC LIMIT 10
    `);
    const totalByOccupation = byOccupation.reduce((s: number, o: any) => s + parseInt(o.count), 0) || 1;

    return {
      by_age_group: byAge.map((a: any) => ({
        age_group: a.age_group,
        count: parseInt(a.count),
        percentage: Math.round((parseInt(a.count) / totalByAge) * 100),
        avg_premium: Math.round(parseFloat(a.avg_premium)),
      })),
      by_gender: byGender.map((g: any) => ({
        gender: g.gender,
        count: parseInt(g.count),
        percentage: Math.round((parseInt(g.count) / totalByGender) * 100),
      })),
      by_location: byLocation.map((l: any) => ({
        location: l.location,
        count: parseInt(l.count),
        percentage: Math.round((parseInt(l.count) / totalByLocation) * 100),
      })),
      by_occupation: byOccupation.map((o: any) => ({
        occupation: o.occupation,
        count: parseInt(o.count),
        percentage: Math.round((parseInt(o.count) / totalByOccupation) * 100),
      })),
    };
  }

  private async getChurnMetrics() {
    // Churn rate based on policies not renewed
    const churnData = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE status = 'expired' 
         AND end_date > NOW() - INTERVAL '90 days'
         AND customer_id NOT IN (SELECT customer_id FROM policy WHERE status = 'active')) as churned,
        (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE end_date > NOW() - INTERVAL '90 days') as total_eligible
    `);

    const churned = parseInt(churnData[0]?.churned) || 0;
    const totalEligible = parseInt(churnData[0]?.total_eligible) || 1;

    // At risk customers (from RFM)
    const atRisk = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM customer_rfm_score 
      WHERE rfm_segment IN ('At Risk', 'Cant Lose', 'About to Sleep')
    `);

    // Churn reasons (from cancellation data)
    const reasons = await AppDataSource.query(`
      SELECT 
        COALESCE(cancellation_reason, 'Không rõ') as reason,
        COUNT(*) as count
      FROM policy
      WHERE status = 'cancelled' AND cancelled_at > NOW() - INTERVAL '180 days'
      GROUP BY COALESCE(cancellation_reason, 'Không rõ')
      ORDER BY count DESC
      LIMIT 5
    `);
    const totalReasons = reasons.reduce((s: number, r: any) => s + parseInt(r.count), 0) || 1;

    return {
      churn_rate: Math.round((churned / totalEligible) * 100),
      at_risk_customers: parseInt(atRisk[0]?.count) || 0,
      churn_reasons: reasons.map((r: any) => ({
        reason: r.reason,
        count: parseInt(r.count),
        percentage: Math.round((parseInt(r.count) / totalReasons) * 100),
      })),
      predicted_churn_next_30_days: Math.round(churned * 0.3), // Simple prediction
    };
  }
}
