import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface FinancialReport {
  summary: {
    total_revenue: number;
    total_commission: number;
    total_claims_paid: number;
    net_profit: number;
    profit_margin: number;
    operating_expenses: number;
    loss_ratio: number;
    expense_ratio: number;
    combined_ratio: number;
  };
  revenue: {
    by_month: Array<{ month: string; premium_revenue: number; commission_earned: number; net: number }>;
    by_insurance_type: Array<{ type: string; revenue: number; percentage: number }>;
    by_insurer: Array<{ insurer_name: string; revenue: number; commission: number; commission_rate: number }>;
    by_payment_method: Array<{ method: string; amount: number; count: number }>;
  };
  commission: {
    total_earned: number;
    pending: number;
    paid: number;
    by_insurer: Array<{ insurer_id: string; insurer_name: string; policies_sold: number; gross_premium: number; commission_rate: number; commission_amount: number; status: string }>;
    by_product_type: Array<{ insurance_type: string; gross_premium: number; avg_commission_rate: number; commission_amount: number }>;
    monthly_trend: Array<{ month: string; commission_earned: number; commission_paid: number }>;
  };
  profit_loss: {
    period: string;
    income: {
      premium_revenue: number;
      commission_income: number;
      investment_income: number;
      other_income: number;
      total_income: number;
    };
    expenses: {
      claims_paid: number;
      claims_reserved: number;
      operating_expenses: number;
      marketing_expenses: number;
      technology_expenses: number;
      staff_expenses: number;
      other_expenses: number;
      total_expenses: number;
    };
    net_income: number;
    profit_margin: number;
  };
  cash_flow: {
    inflows: Array<{ category: string; amount: number }>;
    outflows: Array<{ category: string; amount: number }>;
    net_cash_flow: number;
    opening_balance: number;
    closing_balance: number;
  };
}

export interface CommissionStatement {
  insurer_id: string;
  insurer_name: string;
  period: string;
  policies: Array<{
    policy_number: string;
    product_name: string;
    customer_name: string;
    premium_amount: number;
    commission_rate: number;
    commission_amount: number;
    issue_date: string;
    status: string;
  }>;
  total_premium: number;
  total_commission: number;
  payment_status: 'pending' | 'invoiced' | 'paid';
  payment_date?: string;
}

export class FinancialReportService {
  /**
   * Get comprehensive financial report
   */
  async getFinancialReport(dateRange?: { start_date: string; end_date: string }): Promise<FinancialReport> {
    const startDate = dateRange?.start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end_date || new Date().toISOString();

    const [summary, revenue, commission, profitLoss, cashFlow] = await Promise.all([
      this.getSummary(startDate, endDate),
      this.getRevenueBreakdown(startDate, endDate),
      this.getCommissionReport(startDate, endDate),
      this.getProfitLoss(startDate, endDate),
      this.getCashFlow(startDate, endDate),
    ]);

    return { summary, revenue, commission, profit_loss: profitLoss, cash_flow: cashFlow };
  }

  /**
   * Get commission statement for a specific insurer
   */
  async getCommissionStatement(insurerId: string, period: string): Promise<CommissionStatement> {
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const insurer = await AppDataSource.query(
      `SELECT id, name FROM insurer WHERE id = $1`, [insurerId]
    );

    const policies = await AppDataSource.query(`
      SELECT p.policy_number, pr.name as product_name, c.full_name as customer_name,
             p.premium_amount, 
             COALESCE(pc.commission_rate, 0.1) as commission_rate,
             p.premium_amount * COALESCE(pc.commission_rate, 0.1) as commission_amount,
             p.created_at as issue_date, p.status
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      JOIN customer c ON p.customer_id = c.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      WHERE p.insurer_id = $1 AND p.created_at BETWEEN $2 AND $3
      ORDER BY p.created_at DESC
    `, [insurerId, startDate, endDate]);

    const totalPremium = policies.reduce((s: number, p: any) => s + parseFloat(p.premium_amount), 0);
    const totalCommission = policies.reduce((s: number, p: any) => s + parseFloat(p.commission_amount), 0);

    return {
      insurer_id: insurerId,
      insurer_name: insurer[0]?.name || 'Unknown',
      period,
      policies: policies.map((p: any) => ({
        policy_number: p.policy_number,
        product_name: p.product_name,
        customer_name: p.customer_name,
        premium_amount: parseFloat(p.premium_amount),
        commission_rate: parseFloat(p.commission_rate),
        commission_amount: parseFloat(p.commission_amount),
        issue_date: p.issue_date,
        status: p.status,
      })),
      total_premium: totalPremium,
      total_commission: totalCommission,
      payment_status: 'pending',
    };
  }

  /**
   * Get monthly P&L summary
   */
  async getMonthlyPnL(months: number = 12): Promise<Array<{ month: string; revenue: number; expenses: number; net_income: number; margin: number }>> {
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const data = await AppDataSource.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END), 0) as revenue,
          COALESCE((SELECT SUM(approved_amount) FROM claim WHERE status = 'settled' AND updated_at >= $1 AND updated_at < $2), 0) as claims_paid
      `, [monthStart.toISOString(), monthEnd.toISOString()]);

      const revenue = parseFloat(data[0]?.revenue) || 0;
      const claimsPaid = parseFloat(data[0]?.claims_paid) || 0;
      const operatingExpenses = revenue * 0.15; // Estimated 15% operating
      const totalExpenses = claimsPaid + operatingExpenses;
      const netIncome = revenue - totalExpenses;

      results.push({
        month: monthStart.toISOString().slice(0, 7),
        revenue,
        expenses: totalExpenses,
        net_income: netIncome,
        margin: revenue > 0 ? Math.round((netIncome / revenue) * 100) : 0,
      });
    }

    return results;
  }

  // ============ Private Methods ============

  private async getSummary(startDate: string, endDate: string) {
    const data = await AppDataSource.query(`
      SELECT
        COALESCE((SELECT SUM(amount) FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2), 0) as total_revenue,
        COALESCE((SELECT SUM(approved_amount) FROM claim WHERE status = 'settled' AND updated_at BETWEEN $1 AND $2), 0) as total_claims_paid
    `, [startDate, endDate]);

    const totalRevenue = parseFloat(data[0]?.total_revenue) || 0;
    const totalClaimsPaid = parseFloat(data[0]?.total_claims_paid) || 0;

    // Commission estimate (avg 10% of premiums)
    const commissionData = await AppDataSource.query(`
      SELECT COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as total_commission
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      WHERE p.created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    const totalCommission = parseFloat(commissionData[0]?.total_commission) || totalRevenue * 0.1;
    const operatingExpenses = totalRevenue * 0.15;
    const netProfit = totalRevenue - totalClaimsPaid - operatingExpenses;
    const lossRatio = totalRevenue > 0 ? (totalClaimsPaid / totalRevenue) * 100 : 0;
    const expenseRatio = totalRevenue > 0 ? (operatingExpenses / totalRevenue) * 100 : 0;

    return {
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      total_claims_paid: totalClaimsPaid,
      net_profit: netProfit,
      profit_margin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
      operating_expenses: operatingExpenses,
      loss_ratio: Math.round(lossRatio),
      expense_ratio: Math.round(expenseRatio),
      combined_ratio: Math.round(lossRatio + expenseRatio),
    };
  }

  private async getRevenueBreakdown(startDate: string, endDate: string) {
    // By month
    const byMonth = await AppDataSource.query(`
      SELECT TO_CHAR(paid_at, 'YYYY-MM') as month,
             SUM(amount) as premium_revenue
      FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
      ORDER BY month
    `, [startDate, endDate]);

    // By insurance type
    const byType = await AppDataSource.query(`
      SELECT pr.insurance_type as type, COALESCE(SUM(p.premium_amount), 0) as revenue
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY pr.insurance_type
      ORDER BY revenue DESC
    `, [startDate, endDate]);
    const totalTypeRevenue = byType.reduce((s: number, t: any) => s + parseFloat(t.revenue), 0) || 1;

    // By insurer
    const byInsurer = await AppDataSource.query(`
      SELECT i.name as insurer_name,
             COALESCE(SUM(p.premium_amount), 0) as revenue,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission,
             COALESCE(AVG(pc.commission_rate), 0.1) as commission_rate
      FROM policy p
      JOIN insurer i ON p.insurer_id = i.id
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY i.name
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    // By payment method
    const byPayment = await AppDataSource.query(`
      SELECT payment_method as method, SUM(amount) as amount, COUNT(*) as count
      FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2
      GROUP BY payment_method ORDER BY amount DESC
    `, [startDate, endDate]);

    return {
      by_month: byMonth.map((m: any) => {
        const revenue = parseFloat(m.premium_revenue);
        const commission = revenue * 0.1;
        return { month: m.month, premium_revenue: revenue, commission_earned: commission, net: revenue - commission };
      }),
      by_insurance_type: byType.map((t: any) => ({
        type: t.type,
        revenue: parseFloat(t.revenue),
        percentage: Math.round((parseFloat(t.revenue) / totalTypeRevenue) * 100),
      })),
      by_insurer: byInsurer.map((i: any) => ({
        insurer_name: i.insurer_name,
        revenue: parseFloat(i.revenue),
        commission: parseFloat(i.commission),
        commission_rate: Math.round(parseFloat(i.commission_rate) * 100),
      })),
      by_payment_method: byPayment.map((p: any) => ({
        method: p.method,
        amount: parseFloat(p.amount),
        count: parseInt(p.count),
      })),
    };
  }

  private async getCommissionReport(startDate: string, endDate: string) {
    // Total commission
    const totalData = await AppDataSource.query(`
      SELECT 
        COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as total_earned,
        COALESCE(SUM(CASE WHEN cp.status = 'paid' THEN p.premium_amount * COALESCE(pc.commission_rate, 0.1) ELSE 0 END), 0) as paid
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      LEFT JOIN commission_payment cp ON cp.policy_id = p.id
      WHERE p.created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    const totalEarned = parseFloat(totalData[0]?.total_earned) || 0;
    const paid = parseFloat(totalData[0]?.paid) || 0;

    // By insurer
    const byInsurer = await AppDataSource.query(`
      SELECT i.id as insurer_id, i.name as insurer_name,
             COUNT(p.id) as policies_sold,
             COALESCE(SUM(p.premium_amount), 0) as gross_premium,
             COALESCE(AVG(pc.commission_rate), 0.1) as commission_rate,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission_amount
      FROM insurer i
      LEFT JOIN policy p ON p.insurer_id = i.id AND p.created_at BETWEEN $1 AND $2
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = i.id AND pc.insurance_type = pr.insurance_type
      GROUP BY i.id, i.name
      HAVING COUNT(p.id) > 0
      ORDER BY commission_amount DESC
    `, [startDate, endDate]);

    // By product type
    const byProductType = await AppDataSource.query(`
      SELECT pr.insurance_type,
             COALESCE(SUM(p.premium_amount), 0) as gross_premium,
             COALESCE(AVG(pc.commission_rate), 0.1) as avg_commission_rate,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission_amount
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY pr.insurance_type
      ORDER BY commission_amount DESC
    `, [startDate, endDate]);

    // Monthly trend
    const monthlyTrend = await AppDataSource.query(`
      SELECT TO_CHAR(p.created_at, 'YYYY-MM') as month,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission_earned
      FROM policy p
      LEFT JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(p.created_at, 'YYYY-MM')
      ORDER BY month
    `, [startDate, endDate]);

    return {
      total_earned: totalEarned,
      pending: totalEarned - paid,
      paid,
      by_insurer: byInsurer.map((i: any) => ({
        insurer_id: i.insurer_id,
        insurer_name: i.insurer_name,
        policies_sold: parseInt(i.policies_sold),
        gross_premium: parseFloat(i.gross_premium),
        commission_rate: Math.round(parseFloat(i.commission_rate) * 100),
        commission_amount: parseFloat(i.commission_amount),
        status: 'pending',
      })),
      by_product_type: byProductType.map((pt: any) => ({
        insurance_type: pt.insurance_type,
        gross_premium: parseFloat(pt.gross_premium),
        avg_commission_rate: Math.round(parseFloat(pt.avg_commission_rate) * 100),
        commission_amount: parseFloat(pt.commission_amount),
      })),
      monthly_trend: monthlyTrend.map((m: any) => ({
        month: m.month,
        commission_earned: parseFloat(m.commission_earned),
        commission_paid: parseFloat(m.commission_earned) * 0.8, // Estimate 80% paid
      })),
    };
  }

  private async getProfitLoss(startDate: string, endDate: string) {
    const revenueData = await AppDataSource.query(`
      SELECT COALESCE(SUM(amount), 0) as premium_revenue
      FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    const claimsData = await AppDataSource.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'settled' THEN approved_amount ELSE 0 END), 0) as claims_paid,
        COALESCE(SUM(CASE WHEN status IN ('approved', 'processing') THEN claim_amount ELSE 0 END), 0) as claims_reserved
      FROM claim WHERE created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    const premiumRevenue = parseFloat(revenueData[0]?.premium_revenue) || 0;
    const commissionIncome = premiumRevenue * 0.1;
    const totalIncome = premiumRevenue + commissionIncome;

    const claimsPaid = parseFloat(claimsData[0]?.claims_paid) || 0;
    const claimsReserved = parseFloat(claimsData[0]?.claims_reserved) || 0;
    const operatingExpenses = premiumRevenue * 0.08;
    const marketingExpenses = premiumRevenue * 0.05;
    const technologyExpenses = premiumRevenue * 0.03;
    const staffExpenses = premiumRevenue * 0.07;
    const otherExpenses = premiumRevenue * 0.02;
    const totalExpenses = claimsPaid + claimsReserved + operatingExpenses + marketingExpenses + technologyExpenses + staffExpenses + otherExpenses;

    const netIncome = totalIncome - totalExpenses;

    return {
      period: `${startDate.slice(0, 10)} - ${endDate.slice(0, 10)}`,
      income: {
        premium_revenue: premiumRevenue,
        commission_income: commissionIncome,
        investment_income: 0,
        other_income: 0,
        total_income: totalIncome,
      },
      expenses: {
        claims_paid: claimsPaid,
        claims_reserved: claimsReserved,
        operating_expenses: operatingExpenses,
        marketing_expenses: marketingExpenses,
        technology_expenses: technologyExpenses,
        staff_expenses: staffExpenses,
        other_expenses: otherExpenses,
        total_expenses: totalExpenses,
      },
      net_income: netIncome,
      profit_margin: totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0,
    };
  }

  private async getCashFlow(startDate: string, endDate: string) {
    // Inflows
    const premiumInflow = await AppDataSource.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const premiumAmount = parseFloat(premiumInflow[0]?.total) || 0;

    const inflows = [
      { category: 'Premium thu được', amount: premiumAmount },
      { category: 'Hoa hồng đối tác', amount: premiumAmount * 0.02 },
      { category: 'Thu nhập khác', amount: 0 },
    ];

    // Outflows
    const claimsOutflow = await AppDataSource.query(
      `SELECT COALESCE(SUM(approved_amount), 0) as total FROM claim WHERE status = 'settled' AND updated_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const claimsAmount = parseFloat(claimsOutflow[0]?.total) || 0;

    const outflows = [
      { category: 'Chi trả bồi thường', amount: claimsAmount },
      { category: 'Chi phí vận hành', amount: premiumAmount * 0.08 },
      { category: 'Chi phí marketing', amount: premiumAmount * 0.05 },
      { category: 'Chi phí nhân sự', amount: premiumAmount * 0.07 },
      { category: 'Chi phí công nghệ', amount: premiumAmount * 0.03 },
    ];

    const totalInflows = inflows.reduce((s, i) => s + i.amount, 0);
    const totalOutflows = outflows.reduce((s, o) => s + o.amount, 0);

    return {
      inflows,
      outflows,
      net_cash_flow: totalInflows - totalOutflows,
      opening_balance: 0, // Would come from accounting system
      closing_balance: totalInflows - totalOutflows,
    };
  }
}
