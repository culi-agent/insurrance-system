import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  type: 'rfm' | 'behavioral' | 'demographic' | 'value' | 'custom';
  criteria: SegmentCriteria;
  customer_count: number;
  avg_ltv: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  rfm?: {
    recency_min?: number; // days since last purchase
    recency_max?: number;
    frequency_min?: number;
    frequency_max?: number;
    monetary_min?: number;
    monetary_max?: number;
  };
  demographic?: {
    age_min?: number;
    age_max?: number;
    gender?: string[];
    location?: string[];
    occupation?: string[];
  };
  behavioral?: {
    insurance_types?: string[];
    has_active_policy?: boolean;
    has_claims?: boolean;
    last_active_days?: number;
    login_frequency?: 'daily' | 'weekly' | 'monthly' | 'inactive';
  };
  value?: {
    ltv_min?: number;
    ltv_max?: number;
    total_premium_min?: number;
    total_premium_max?: number;
    policies_count_min?: number;
    policies_count_max?: number;
  };
}

export interface RFMScore {
  customer_id: string;
  recency_score: number; // 1-5
  frequency_score: number; // 1-5
  monetary_score: number; // 1-5
  rfm_segment: string;
  total_score: number;
}

export interface CustomerSegmentProfile {
  customer_id: string;
  full_name: string;
  email: string;
  rfm_score: RFMScore;
  ltv: number;
  churn_risk: 'low' | 'medium' | 'high' | 'critical';
  segments: string[];
  last_purchase_date?: string;
  total_policies: number;
  total_spent: number;
}

export class CustomerSegmentationService {
  /**
   * Run RFM analysis for all customers
   */
  async runRFMAnalysis(): Promise<{ total_analyzed: number; segments: Record<string, number> }> {
    // Get customer purchase data
    const customerData = await AppDataSource.query(`
      SELECT 
        c.id as customer_id,
        EXTRACT(DAY FROM NOW() - MAX(p.created_at))::int as recency_days,
        COUNT(p.id) as frequency,
        COALESCE(SUM(p.premium_amount), 0) as monetary
      FROM customer c
      LEFT JOIN policy p ON p.customer_id = c.id AND p.status IN ('active', 'expired')
      GROUP BY c.id
      HAVING COUNT(p.id) > 0
    `);

    if (customerData.length === 0) {
      return { total_analyzed: 0, segments: {} };
    }

    // Calculate quintiles for R, F, M
    const recencyValues = customerData.map((d: any) => parseInt(d.recency_days) || 0).sort((a: number, b: number) => a - b);
    const frequencyValues = customerData.map((d: any) => parseInt(d.frequency)).sort((a: number, b: number) => a - b);
    const monetaryValues = customerData.map((d: any) => parseFloat(d.monetary)).sort((a: number, b: number) => a - b);

    const recencyQuintiles = this.calculateQuintiles(recencyValues);
    const frequencyQuintiles = this.calculateQuintiles(frequencyValues);
    const monetaryQuintiles = this.calculateQuintiles(monetaryValues);

    const segmentCounts: Record<string, number> = {};

    // Score each customer
    for (const customer of customerData) {
      const recency = parseInt(customer.recency_days) || 0;
      const frequency = parseInt(customer.frequency);
      const monetary = parseFloat(customer.monetary);

      // Recency: lower is better (score 5 = most recent)
      const rScore = 6 - this.getQuintileScore(recency, recencyQuintiles);
      const fScore = this.getQuintileScore(frequency, frequencyQuintiles);
      const mScore = this.getQuintileScore(monetary, monetaryQuintiles);

      const segment = this.getRFMSegmentName(rScore, fScore, mScore);
      segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;

      // Save RFM scores
      await AppDataSource.query(
        `INSERT INTO customer_rfm_score (id, customer_id, recency_score, frequency_score, monetary_score, rfm_segment, total_score, calculated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (customer_id) DO UPDATE SET
           recency_score = $3, frequency_score = $4, monetary_score = $5,
           rfm_segment = $6, total_score = $7, calculated_at = NOW()`,
        [uuidv4(), customer.customer_id, rScore, fScore, mScore, segment, rScore + fScore + mScore]
      );
    }

    logger.info(`[Segmentation] RFM analysis completed: ${customerData.length} customers analyzed`);
    return { total_analyzed: customerData.length, segments: segmentCounts };
  }

  /**
   * Get customer segments overview
   */
  async getSegmentsOverview(): Promise<{ segments: Array<{ name: string; count: number; avg_monetary: number; description: string }> }> {
    const results = await AppDataSource.query(`
      SELECT 
        rfm_segment as name,
        COUNT(*) as count,
        COALESCE(AVG(monetary_score * 1000000), 0) as avg_monetary
      FROM customer_rfm_score
      GROUP BY rfm_segment
      ORDER BY COUNT(*) DESC
    `);

    const segmentDescriptions: Record<string, string> = {
      'Champions': 'Khách hàng tốt nhất - mua nhiều, gần đây, giá trị cao',
      'Loyal Customers': 'Khách hàng trung thành - mua thường xuyên',
      'Potential Loyalists': 'Khách hàng tiềm năng - mới mua, có thể trở thành loyal',
      'Recent Customers': 'Khách hàng mới - mới mua gần đây',
      'Promising': 'Khách hàng hứa hẹn - mua vài lần, tiềm năng tăng',
      'Need Attention': 'Cần chú ý - trước đây mua nhiều, đang giảm',
      'About to Sleep': 'Sắp rời bỏ - lâu không mua',
      'At Risk': 'Có nguy cơ rời bỏ - giá trị cao nhưng lâu không mua',
      'Cant Lose': 'Không thể mất - giá trị rất cao nhưng đang inactive',
      'Hibernating': 'Ngủ đông - lâu không hoạt động',
      'Lost': 'Đã mất - rất lâu không mua',
    };

    return {
      segments: results.map((r: any) => ({
        name: r.name,
        count: parseInt(r.count),
        avg_monetary: parseFloat(r.avg_monetary),
        description: segmentDescriptions[r.name] || r.name,
      })),
    };
  }

  /**
   * Get customers by segment
   */
  async getCustomersBySegment(segmentName: string, page: number = 1, limit: number = 50): Promise<{ customers: CustomerSegmentProfile[]; total: number }> {
    const offset = (page - 1) * limit;

    const [customers, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT c.id as customer_id, c.full_name, c.email,
               rfm.recency_score, rfm.frequency_score, rfm.monetary_score,
               rfm.rfm_segment, rfm.total_score,
               COUNT(p.id) as total_policies,
               COALESCE(SUM(p.premium_amount), 0) as total_spent,
               MAX(p.created_at) as last_purchase_date
        FROM customer c
        JOIN customer_rfm_score rfm ON rfm.customer_id = c.id
        LEFT JOIN policy p ON p.customer_id = c.id
        WHERE rfm.rfm_segment = $1
        GROUP BY c.id, c.full_name, c.email, rfm.recency_score, rfm.frequency_score, 
                 rfm.monetary_score, rfm.rfm_segment, rfm.total_score
        ORDER BY rfm.total_score DESC
        LIMIT $2 OFFSET $3
      `, [segmentName, limit, offset]),
      AppDataSource.query(
        `SELECT COUNT(*) as total FROM customer_rfm_score WHERE rfm_segment = $1`,
        [segmentName]
      ),
    ]);

    return {
      customers: customers.map((c: any) => ({
        customer_id: c.customer_id,
        full_name: c.full_name,
        email: c.email,
        rfm_score: {
          customer_id: c.customer_id,
          recency_score: c.recency_score,
          frequency_score: c.frequency_score,
          monetary_score: c.monetary_score,
          rfm_segment: c.rfm_segment,
          total_score: c.total_score,
        },
        ltv: this.estimateLTV(parseFloat(c.total_spent), parseInt(c.total_policies)),
        churn_risk: this.assessChurnRisk(c.recency_score, c.frequency_score),
        segments: [c.rfm_segment],
        last_purchase_date: c.last_purchase_date,
        total_policies: parseInt(c.total_policies),
        total_spent: parseFloat(c.total_spent),
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Create custom segment with criteria
   */
  async createCustomSegment(name: string, description: string, criteria: SegmentCriteria): Promise<CustomerSegment> {
    const id = uuidv4();
    const query = this.buildSegmentQuery(criteria);

    const countResult = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM customer c WHERE ${query.where}`,
      query.params
    );

    const customerCount = parseInt(countResult[0]?.count) || 0;

    await AppDataSource.query(
      `INSERT INTO customer_segment (id, name, description, type, criteria, customer_count, created_at, updated_at)
       VALUES ($1, $2, $3, 'custom', $4, $5, NOW(), NOW())`,
      [id, name, description, JSON.stringify(criteria), customerCount]
    );

    return {
      id,
      name,
      description,
      type: 'custom',
      criteria,
      customer_count: customerCount,
      avg_ltv: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Get all saved segments
   */
  async listSegments(): Promise<CustomerSegment[]> {
    const segments = await AppDataSource.query(
      `SELECT * FROM customer_segment ORDER BY customer_count DESC`
    );

    return segments.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      type: s.type,
      criteria: s.criteria,
      customer_count: s.customer_count,
      avg_ltv: s.avg_ltv || 0,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  }

  /**
   * Get customer IDs for a segment (for campaigns/notifications)
   */
  async getSegmentCustomerIds(segmentId: string): Promise<string[]> {
    const segment = await AppDataSource.query(
      `SELECT criteria FROM customer_segment WHERE id = $1`,
      [segmentId]
    );

    if (segment.length === 0) return [];

    const query = this.buildSegmentQuery(segment[0].criteria);
    const customers = await AppDataSource.query(
      `SELECT c.id FROM customer c WHERE ${query.where}`,
      query.params
    );

    return customers.map((c: any) => c.id);
  }

  /**
   * Calculate customer lifetime value
   */
  async calculateCustomerLTV(customerId: string): Promise<{ ltv: number; projected_annual: number; retention_probability: number }> {
    const data = await AppDataSource.query(`
      SELECT 
        COUNT(p.id) as total_policies,
        COALESCE(SUM(p.premium_amount), 0) as total_spent,
        EXTRACT(DAY FROM NOW() - MIN(p.created_at))::int as customer_days,
        COUNT(DISTINCT DATE_TRUNC('year', p.created_at)) as active_years
      FROM policy p
      WHERE p.customer_id = $1
    `, [customerId]);

    const d = data[0];
    const totalSpent = parseFloat(d.total_spent) || 0;
    const customerDays = parseInt(d.customer_days) || 1;
    const totalPolicies = parseInt(d.total_policies) || 0;

    // Simple LTV calculation: avg spend per year * expected years
    const annualSpend = totalSpent / (customerDays / 365);
    const retentionProbability = Math.min(0.95, 0.5 + (totalPolicies * 0.1));
    const expectedYears = 1 / (1 - retentionProbability);
    const ltv = annualSpend * expectedYears;

    return {
      ltv: Math.round(ltv),
      projected_annual: Math.round(annualSpend),
      retention_probability: Math.round(retentionProbability * 100) / 100,
    };
  }

  // ============ Private Methods ============

  private calculateQuintiles(sortedValues: number[]): number[] {
    const len = sortedValues.length;
    return [
      sortedValues[Math.floor(len * 0.2)] || 0,
      sortedValues[Math.floor(len * 0.4)] || 0,
      sortedValues[Math.floor(len * 0.6)] || 0,
      sortedValues[Math.floor(len * 0.8)] || 0,
    ];
  }

  private getQuintileScore(value: number, quintiles: number[]): number {
    if (value <= quintiles[0]) return 1;
    if (value <= quintiles[1]) return 2;
    if (value <= quintiles[2]) return 3;
    if (value <= quintiles[3]) return 4;
    return 5;
  }

  private getRFMSegmentName(r: number, f: number, m: number): string {
    const total = r + f + m;

    if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
    if (f >= 4 && m >= 3) return 'Loyal Customers';
    if (r >= 4 && f >= 2 && f <= 4) return 'Potential Loyalists';
    if (r >= 4 && f <= 2) return 'Recent Customers';
    if (r >= 3 && f >= 2 && m >= 2) return 'Promising';
    if (r === 3 && f >= 3) return 'Need Attention';
    if (r === 2 && f >= 2) return 'About to Sleep';
    if (r <= 2 && f >= 4 && m >= 4) return 'Cant Lose';
    if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
    if (r <= 2 && f <= 2) return 'Hibernating';
    return 'Lost';
  }

  private estimateLTV(totalSpent: number, totalPolicies: number): number {
    // Simple LTV estimation: total spent * retention multiplier
    const retentionMultiplier = 1 + Math.min(totalPolicies * 0.3, 2);
    return Math.round(totalSpent * retentionMultiplier);
  }

  private assessChurnRisk(recencyScore: number, frequencyScore: number): 'low' | 'medium' | 'high' | 'critical' {
    const combined = recencyScore + frequencyScore;
    if (combined >= 8) return 'low';
    if (combined >= 6) return 'medium';
    if (combined >= 4) return 'high';
    return 'critical';
  }

  private buildSegmentQuery(criteria: SegmentCriteria): { where: string; params: any[] } {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIdx = 1;

    if (criteria.demographic) {
      const d = criteria.demographic;
      if (d.age_min) {
        conditions.push(`EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth)) >= $${paramIdx++}`);
        params.push(d.age_min);
      }
      if (d.age_max) {
        conditions.push(`EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth)) <= $${paramIdx++}`);
        params.push(d.age_max);
      }
      if (d.gender && d.gender.length > 0) {
        conditions.push(`c.gender = ANY($${paramIdx++})`);
        params.push(d.gender);
      }
    }

    if (criteria.value) {
      const v = criteria.value;
      if (v.total_premium_min) {
        conditions.push(`c.id IN (SELECT customer_id FROM policy GROUP BY customer_id HAVING SUM(premium_amount) >= $${paramIdx++})`);
        params.push(v.total_premium_min);
      }
      if (v.policies_count_min) {
        conditions.push(`c.id IN (SELECT customer_id FROM policy GROUP BY customer_id HAVING COUNT(*) >= $${paramIdx++})`);
        params.push(v.policies_count_min);
      }
    }

    if (criteria.behavioral) {
      const b = criteria.behavioral;
      if (b.has_active_policy !== undefined) {
        if (b.has_active_policy) {
          conditions.push(`c.id IN (SELECT customer_id FROM policy WHERE status = 'active')`);
        } else {
          conditions.push(`c.id NOT IN (SELECT customer_id FROM policy WHERE status = 'active')`);
        }
      }
      if (b.insurance_types && b.insurance_types.length > 0) {
        conditions.push(`c.id IN (SELECT customer_id FROM policy p JOIN product pr ON p.product_id = pr.id WHERE pr.insurance_type = ANY($${paramIdx++}))`);
        params.push(b.insurance_types);
      }
    }

    if (criteria.rfm) {
      const rfm = criteria.rfm;
      if (rfm.recency_min !== undefined) {
        conditions.push(`c.id IN (SELECT customer_id FROM customer_rfm_score WHERE recency_score >= $${paramIdx++})`);
        params.push(rfm.recency_min);
      }
      if (rfm.frequency_min !== undefined) {
        conditions.push(`c.id IN (SELECT customer_id FROM customer_rfm_score WHERE frequency_score >= $${paramIdx++})`);
        params.push(rfm.frequency_min);
      }
      if (rfm.monetary_min !== undefined) {
        conditions.push(`c.id IN (SELECT customer_id FROM customer_rfm_score WHERE monetary_score >= $${paramIdx++})`);
        params.push(rfm.monetary_min);
      }
    }

    return { where: conditions.join(' AND '), params };
  }
}
