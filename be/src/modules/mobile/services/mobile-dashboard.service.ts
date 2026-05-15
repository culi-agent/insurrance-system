import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface MobileDashboardOverview {
  customer: {
    name: string;
    email: string;
    member_since: string;
    coverage_score: number; // 0-100
  };
  summary: {
    active_policies: number;
    pending_claims: number;
    total_coverage: number;
    next_renewal_date?: string;
    next_renewal_product?: string;
  };
  recent_activities: Array<{
    type: 'policy_issued' | 'claim_submitted' | 'claim_updated' | 'payment_made' | 'renewal_due';
    title: string;
    description: string;
    date: string;
    reference_id: string;
  }>;
  quick_actions: Array<{
    action: string;
    label: string;
    icon: string;
    available: boolean;
  }>;
}

export interface MobilePolicySummary {
  id: string;
  policy_number: string;
  product_name: string;
  insurance_type: string;
  insurer_name: string;
  insurer_logo?: string;
  status: string;
  premium_amount: number;
  coverage_amount: number;
  start_date: string;
  end_date: string;
  days_until_expiry: number;
  is_renewable: boolean;
  next_payment_date?: string;
}

export interface MobileClaimSummary {
  id: string;
  claim_number: string;
  policy_number: string;
  product_name: string;
  insurance_type: string;
  status: string;
  claim_amount: number;
  approved_amount?: number;
  submitted_date: string;
  last_updated: string;
  progress_percentage: number;
}

export class MobileDashboardService {
  /**
   * Get mobile dashboard overview (optimized for mobile)
   */
  async getDashboardOverview(customerId: string): Promise<MobileDashboardOverview> {
    // Get customer info
    const customerResult = await AppDataSource.query(
      `SELECT full_name, email, created_at FROM customer WHERE id = $1`,
      [customerId]
    );
    const customer = customerResult[0];

    // Get policy summary
    const policySummary = await AppDataSource.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_policies,
        COALESCE(SUM(CASE WHEN status = 'active' THEN premium_amount * 100 ELSE 0 END), 0) as total_coverage
      FROM policy WHERE customer_id = $1
    `, [customerId]);

    // Get pending claims count
    const claimsSummary = await AppDataSource.query(`
      SELECT COUNT(*) as pending_claims
      FROM claim WHERE customer_id = $1 AND status IN ('submitted', 'under_review', 'processing')
    `, [customerId]);

    // Next renewal
    const nextRenewal = await AppDataSource.query(`
      SELECT p.end_date, pr.name as product_name
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      WHERE p.customer_id = $1 AND p.status = 'active' AND p.end_date > NOW()
      ORDER BY p.end_date ASC
      LIMIT 1
    `, [customerId]);

    // Recent activities (last 10)
    const activities = await this.getRecentActivities(customerId, 10);

    // Coverage score calculation
    const coverageScore = await this.calculateCoverageScore(customerId);

    return {
      customer: {
        name: customer?.full_name || 'Khách hàng',
        email: customer?.email || '',
        member_since: customer?.created_at || new Date().toISOString(),
        coverage_score: coverageScore,
      },
      summary: {
        active_policies: parseInt(policySummary[0]?.active_policies) || 0,
        pending_claims: parseInt(claimsSummary[0]?.pending_claims) || 0,
        total_coverage: parseFloat(policySummary[0]?.total_coverage) || 0,
        next_renewal_date: nextRenewal[0]?.end_date || undefined,
        next_renewal_product: nextRenewal[0]?.product_name || undefined,
      },
      recent_activities: activities,
      quick_actions: [
        { action: 'new_quote', label: 'Báo giá mới', icon: 'calculator', available: true },
        { action: 'submit_claim', label: 'Nộp yêu cầu bồi thường', icon: 'file-text', available: parseInt(policySummary[0]?.active_policies) > 0 },
        { action: 'renew_policy', label: 'Gia hạn hợp đồng', icon: 'refresh-cw', available: !!nextRenewal[0] },
        { action: 'contact_support', label: 'Liên hệ hỗ trợ', icon: 'headphones', available: true },
        { action: 'view_documents', label: 'Tài liệu', icon: 'folder', available: true },
      ],
    };
  }

  /**
   * Get policies list for mobile (paginated, with filters)
   */
  async getPolicies(customerId: string, options: { status?: string; page?: number; limit?: number }): Promise<{ policies: MobilePolicySummary[]; total: number }> {
    const { status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.customer_id = $1`;
    const params: any[] = [customerId];

    if (status && status !== 'all') {
      params.push(status);
      whereClause += ` AND p.status = $${params.length}`;
    }

    const [policies, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT p.id, p.policy_number, pr.name as product_name, pr.insurance_type,
               COALESCE(i.name, 'N/A') as insurer_name, i.logo_url as insurer_logo,
               p.status, p.premium_amount,
               COALESCE((p.coverage_details->>'sum_insured')::numeric, p.premium_amount * 100) as coverage_amount,
               p.start_date, p.end_date,
               EXTRACT(DAY FROM p.end_date - NOW())::int as days_until_expiry,
               ip.next_payment_date
        FROM policy p
        JOIN product pr ON p.product_id = pr.id
        LEFT JOIN insurer i ON p.insurer_id = i.id
        LEFT JOIN installment_plan ip ON ip.policy_id = p.id AND ip.status = 'active'
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),
      AppDataSource.query(
        `SELECT COUNT(*) as total FROM policy p ${whereClause}`,
        params
      ),
    ]);

    return {
      policies: policies.map((p: any) => ({
        id: p.id,
        policy_number: p.policy_number,
        product_name: p.product_name,
        insurance_type: p.insurance_type,
        insurer_name: p.insurer_name,
        insurer_logo: p.insurer_logo,
        status: p.status,
        premium_amount: parseFloat(p.premium_amount),
        coverage_amount: parseFloat(p.coverage_amount),
        start_date: p.start_date,
        end_date: p.end_date,
        days_until_expiry: p.days_until_expiry || 0,
        is_renewable: p.days_until_expiry <= 60 && p.status === 'active',
        next_payment_date: p.next_payment_date || undefined,
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Get claims list for mobile (paginated)
   */
  async getClaims(customerId: string, options: { status?: string; page?: number; limit?: number }): Promise<{ claims: MobileClaimSummary[]; total: number }> {
    const { status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE c.customer_id = $1`;
    const params: any[] = [customerId];

    if (status && status !== 'all') {
      params.push(status);
      whereClause += ` AND c.status = $${params.length}`;
    }

    const [claims, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT c.id, c.claim_number, p.policy_number, pr.name as product_name,
               pr.insurance_type, c.status, c.claim_amount, c.approved_amount,
               c.created_at as submitted_date, c.updated_at as last_updated
        FROM claim c
        JOIN policy p ON c.policy_id = p.id
        JOIN product pr ON p.product_id = pr.id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),
      AppDataSource.query(
        `SELECT COUNT(*) as total FROM claim c ${whereClause}`,
        params
      ),
    ]);

    return {
      claims: claims.map((c: any) => ({
        id: c.id,
        claim_number: c.claim_number,
        policy_number: c.policy_number,
        product_name: c.product_name,
        insurance_type: c.insurance_type,
        status: c.status,
        claim_amount: parseFloat(c.claim_amount) || 0,
        approved_amount: c.approved_amount ? parseFloat(c.approved_amount) : undefined,
        submitted_date: c.submitted_date,
        last_updated: c.last_updated,
        progress_percentage: this.getClaimProgress(c.status),
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Get policy detail for mobile
   */
  async getPolicyDetail(customerId: string, policyId: string) {
    const policy = await AppDataSource.query(`
      SELECT p.*, pr.name as product_name, pr.insurance_type, pr.description as product_description,
             COALESCE(i.name, 'N/A') as insurer_name, i.logo_url as insurer_logo,
             i.phone as insurer_phone, i.email as insurer_email
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN insurer i ON p.insurer_id = i.id
      WHERE p.id = $1 AND p.customer_id = $2
    `, [policyId, customerId]);

    if (policy.length === 0) return null;

    const p = policy[0];

    // Get beneficiaries
    const beneficiaries = await AppDataSource.query(
      `SELECT * FROM beneficiary WHERE policy_id = $1 ORDER BY percentage DESC`,
      [policyId]
    );

    // Get related claims
    const claims = await AppDataSource.query(
      `SELECT id, claim_number, status, claim_amount, created_at FROM claim WHERE policy_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [policyId]
    );

    // Get payment history
    const payments = await AppDataSource.query(
      `SELECT id, amount, status, payment_method, paid_at, created_at 
       FROM payment WHERE order_id IN (SELECT id FROM purchase_order WHERE customer_id = $1)
       ORDER BY created_at DESC LIMIT 10`,
      [customerId]
    );

    return {
      id: p.id,
      policy_number: p.policy_number,
      product_name: p.product_name,
      insurance_type: p.insurance_type,
      product_description: p.product_description,
      insurer: {
        name: p.insurer_name,
        logo: p.insurer_logo,
        phone: p.insurer_phone,
        email: p.insurer_email,
      },
      status: p.status,
      premium_amount: parseFloat(p.premium_amount),
      coverage_details: p.coverage_details || {},
      start_date: p.start_date,
      end_date: p.end_date,
      beneficiaries,
      recent_claims: claims,
      payment_history: payments,
      documents: [
        { type: 'policy', name: 'Hợp đồng bảo hiểm', url: `/api/v1/mobile/documents/policy/${policyId}` },
        { type: 'certificate', name: 'Giấy chứng nhận', url: `/api/v1/mobile/documents/certificate/${policyId}` },
      ],
    };
  }

  // ============ Private Methods ============

  private async getRecentActivities(customerId: string, limit: number) {
    const activities: any[] = [];

    // Recent policies
    const recentPolicies = await AppDataSource.query(`
      SELECT p.id, p.policy_number, pr.name as product_name, p.created_at
      FROM policy p JOIN product pr ON p.product_id = pr.id
      WHERE p.customer_id = $1
      ORDER BY p.created_at DESC LIMIT 3
    `, [customerId]);

    for (const pol of recentPolicies) {
      activities.push({
        type: 'policy_issued',
        title: 'Hợp đồng mới',
        description: `${pol.product_name} - ${pol.policy_number}`,
        date: pol.created_at,
        reference_id: pol.id,
      });
    }

    // Recent claims
    const recentClaims = await AppDataSource.query(`
      SELECT c.id, c.claim_number, c.status, c.created_at, c.updated_at
      FROM claim c WHERE c.customer_id = $1
      ORDER BY c.updated_at DESC LIMIT 3
    `, [customerId]);

    for (const claim of recentClaims) {
      activities.push({
        type: claim.created_at === claim.updated_at ? 'claim_submitted' : 'claim_updated',
        title: claim.created_at === claim.updated_at ? 'Yêu cầu bồi thường mới' : 'Cập nhật yêu cầu',
        description: `${claim.claim_number} - ${this.getClaimStatusText(claim.status)}`,
        date: claim.updated_at,
        reference_id: claim.id,
      });
    }

    // Recent payments
    const recentPayments = await AppDataSource.query(`
      SELECT pay.id, pay.amount, pay.paid_at
      FROM payment pay
      JOIN purchase_order po ON pay.order_id = po.id
      WHERE po.customer_id = $1 AND pay.status = 'paid'
      ORDER BY pay.paid_at DESC LIMIT 3
    `, [customerId]);

    for (const payment of recentPayments) {
      activities.push({
        type: 'payment_made',
        title: 'Thanh toán thành công',
        description: `${(parseFloat(payment.amount) / 1000000).toFixed(1)} triệu VND`,
        date: payment.paid_at,
        reference_id: payment.id,
      });
    }

    // Sort by date desc and limit
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  private async calculateCoverageScore(customerId: string): Promise<number> {
    const policies = await AppDataSource.query(`
      SELECT insurance_type, status FROM policy WHERE customer_id = $1 AND status = 'active'
    `, [customerId]);

    if (policies.length === 0) return 0;

    // Score based on coverage diversity
    const categories = new Set(policies.map((p: any) => p.insurance_type));
    const essentialCategories = ['health', 'life', 'motor', 'property'];
    const coveredEssentials = essentialCategories.filter(c => categories.has(c)).length;

    return Math.min(100, Math.round((coveredEssentials / essentialCategories.length) * 80 + policies.length * 5));
  }

  private getClaimProgress(status: string): number {
    const progressMap: Record<string, number> = {
      submitted: 20,
      under_review: 40,
      processing: 60,
      approved: 80,
      settled: 100,
      rejected: 100,
      withdrawn: 100,
    };
    return progressMap[status] || 10;
  }

  private getClaimStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      submitted: 'Đã nộp',
      under_review: 'Đang xem xét',
      processing: 'Đang xử lý',
      approved: 'Đã duyệt',
      settled: 'Đã thanh toán',
      rejected: 'Từ chối',
      withdrawn: 'Đã rút',
    };
    return statusMap[status] || status;
  }
}
