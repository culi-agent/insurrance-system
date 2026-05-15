import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface CustomerProfile {
  id: string;
  age: number;
  gender: string;
  marital_status?: string;
  dependents?: number;
  annual_income?: number;
  occupation?: string;
  existing_policies?: Array<{
    insurance_type: string;
    sum_assured: number;
    status: string;
  }>;
}

export interface Recommendation {
  product_id: string;
  product_name: string;
  insurance_type: string;
  score: number; // 0-100
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggested_coverage: number;
  estimated_premium: number;
}

export interface CoverageGapAnalysis {
  customer_id: string;
  current_coverage: {
    life: number;
    health: number;
    motor: number;
    property: number;
    total: number;
  };
  recommended_coverage: {
    life: number;
    health: number;
    motor: number;
    property: number;
    total: number;
  };
  gaps: Array<{
    category: string;
    current: number;
    recommended: number;
    gap: number;
    gap_percentage: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    suggestion: string;
  }>;
  overall_score: number; // 0-100 (100 = fully covered)
}

export class RecommendationService {
  /**
   * Get personalized product recommendations
   */
  async getRecommendations(customerId: string): Promise<Recommendation[]> {
    const profile = await this.getCustomerProfile(customerId);
    if (!profile) return this.getDefaultRecommendations();

    const recommendations: Recommendation[] = [];

    // Rule-based recommendations
    const lifeRec = this.evaluateLifeInsuranceNeed(profile);
    if (lifeRec) recommendations.push(lifeRec);

    const healthRec = this.evaluateHealthInsuranceNeed(profile);
    if (healthRec) recommendations.push(healthRec);

    const motorRec = this.evaluateMotorInsuranceNeed(profile);
    if (motorRec) recommendations.push(motorRec);

    const travelRec = this.evaluateTravelInsuranceNeed(profile);
    if (travelRec) recommendations.push(travelRec);

    const propertyRec = this.evaluatePropertyInsuranceNeed(profile);
    if (propertyRec) recommendations.push(propertyRec);

    const paRec = this.evaluatePersonalAccidentNeed(profile);
    if (paRec) recommendations.push(paRec);

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    // ML enhancement: adjust scores based on similar customers' purchases
    const enhancedRecs = await this.enhanceWithCollaborativeFiltering(customerId, recommendations);

    logger.info(`[Recommendation] Generated ${enhancedRecs.length} recommendations for customer ${customerId}`);
    return enhancedRecs.slice(0, 5); // Top 5
  }

  /**
   * Get "customers also bought" suggestions
   */
  async getAlsoBought(insuranceType: string, productId?: string): Promise<Array<{ product_name: string; insurance_type: string; buy_rate: number }>> {
    // Find what other customers who bought this type also purchased
    const results = await AppDataSource.query(`
      SELECT 
        p2.insurance_type,
        COUNT(DISTINCT p2.customer_id) as buyer_count,
        (SELECT COUNT(DISTINCT customer_id) FROM policy WHERE insurance_type = $1) as total_buyers
      FROM policy p1
      JOIN policy p2 ON p1.customer_id = p2.customer_id AND p1.insurance_type != p2.insurance_type
      WHERE p1.insurance_type = $1
      GROUP BY p2.insurance_type
      ORDER BY buyer_count DESC
      LIMIT 5
    `, [insuranceType]);

    return results.map((r: any) => ({
      product_name: this.getInsuranceTypeName(r.insurance_type),
      insurance_type: r.insurance_type,
      buy_rate: parseInt(r.total_buyers) > 0
        ? Math.round((parseInt(r.buyer_count) / parseInt(r.total_buyers)) * 100)
        : 0,
    }));
  }

  /**
   * Analyze coverage gaps for a customer
   */
  async analyzeCoverageGaps(customerId: string): Promise<CoverageGapAnalysis> {
    const profile = await this.getCustomerProfile(customerId);
    const annualIncome = profile?.annual_income || 300000000; // Default 300M VND

    // Get current coverage
    const policies = await AppDataSource.query(`
      SELECT insurance_type, SUM(premium_amount) as total_premium,
             MAX(CASE WHEN coverage_details->>'sum_insured' IS NOT NULL 
                  THEN (coverage_details->>'sum_insured')::numeric ELSE premium_amount * 100 END) as sum_assured
      FROM policy
      WHERE customer_id = $1 AND status = 'active'
      GROUP BY insurance_type
    `, [customerId]);

    const currentCoverage = {
      life: 0,
      health: 0,
      motor: 0,
      property: 0,
      total: 0,
    };

    for (const p of policies) {
      const type = p.insurance_type as keyof typeof currentCoverage;
      if (type in currentCoverage) {
        currentCoverage[type] = parseFloat(p.sum_assured) || 0;
      }
      currentCoverage.total += parseFloat(p.sum_assured) || 0;
    }

    // Calculate recommended coverage
    const age = profile?.age || 35;
    const dependents = profile?.dependents || 0;

    const recommendedCoverage = {
      life: this.recommendLifeCoverage(annualIncome, age, dependents),
      health: this.recommendHealthCoverage(annualIncome, age),
      motor: 100000000, // 100M standard
      property: annualIncome * 2,
      total: 0,
    };
    recommendedCoverage.total = Object.values(recommendedCoverage).reduce((a, b) => a + b, 0) - recommendedCoverage.total;

    // Analyze gaps
    const gaps = [];
    const categories = ['life', 'health', 'motor', 'property'] as const;

    for (const cat of categories) {
      const current = currentCoverage[cat];
      const recommended = recommendedCoverage[cat];
      const gap = Math.max(0, recommended - current);
      const gapPct = recommended > 0 ? (gap / recommended) * 100 : 0;

      if (gap > 0) {
        gaps.push({
          category: cat,
          current,
          recommended,
          gap,
          gap_percentage: Math.round(gapPct),
          priority: this.getGapPriority(cat, gapPct),
          suggestion: this.getGapSuggestion(cat, gap, gapPct),
        });
      }
    }

    // Overall coverage score
    const totalCurrent = currentCoverage.total;
    const totalRecommended = recommendedCoverage.total;
    const overallScore = totalRecommended > 0
      ? Math.min(100, Math.round((totalCurrent / totalRecommended) * 100))
      : 0;

    return {
      customer_id: customerId,
      current_coverage: currentCoverage,
      recommended_coverage: recommendedCoverage,
      gaps: gaps.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      overall_score: overallScore,
    };
  }

  // ============ Private methods ============

  private async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    const customer = await AppDataSource.query(
      `SELECT * FROM customer WHERE id = $1`, [customerId]
    );

    if (customer.length === 0) return null;

    const c = customer[0];
    const age = c.date_of_birth
      ? Math.floor((Date.now() - new Date(c.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 35;

    // Get existing policies
    const policies = await AppDataSource.query(
      `SELECT insurance_type, premium_amount as sum_assured, status FROM policy WHERE customer_id = $1`,
      [customerId]
    );

    return {
      id: customerId,
      age,
      gender: c.gender || 'male',
      marital_status: c.marital_status,
      dependents: c.dependents || 0,
      annual_income: c.annual_income,
      occupation: c.occupation,
      existing_policies: policies,
    };
  }

  private evaluateLifeInsuranceNeed(profile: CustomerProfile): Recommendation | null {
    const hasLife = profile.existing_policies?.some(p => p.insurance_type === 'life' && p.status === 'active');
    if (hasLife) return null;

    let score = 50;
    if (profile.age >= 25 && profile.age <= 55) score += 20;
    if (profile.dependents && profile.dependents > 0) score += 20;
    if (profile.marital_status === 'married') score += 10;

    const suggestedCoverage = (profile.annual_income || 300000000) * 10;

    return {
      product_id: 'life-endowment',
      product_name: 'Bảo hiểm nhân thọ hỗn hợp',
      insurance_type: 'life',
      score: Math.min(100, score),
      reason: profile.dependents && profile.dependents > 0
        ? `Bạn có ${profile.dependents} người phụ thuộc. BH nhân thọ đảm bảo tài chính cho gia đình.`
        : 'BH nhân thọ vừa bảo vệ vừa tích lũy tài chính dài hạn.',
      priority: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low',
      suggested_coverage: suggestedCoverage,
      estimated_premium: Math.round(suggestedCoverage * 0.025), // ~2.5% of SA
    };
  }

  private evaluateHealthInsuranceNeed(profile: CustomerProfile): Recommendation | null {
    const hasHealth = profile.existing_policies?.some(p => p.insurance_type === 'health' && p.status === 'active');
    if (hasHealth) return null;

    let score = 60; // Health is always recommended
    if (profile.age >= 35) score += 15;
    if (profile.age >= 45) score += 10;

    return {
      product_id: 'health-comprehensive',
      product_name: 'Bảo hiểm sức khỏe toàn diện',
      insurance_type: 'health',
      score: Math.min(100, score),
      reason: 'Chi phí y tế ngày càng tăng. BH sức khỏe giúp bạn được chăm sóc tốt nhất.',
      priority: 'high',
      suggested_coverage: 500000000,
      estimated_premium: profile.age >= 40 ? 15000000 : 8000000,
    };
  }

  private evaluateMotorInsuranceNeed(profile: CustomerProfile): Recommendation | null {
    const hasMotor = profile.existing_policies?.some(p => p.insurance_type === 'motor' && p.status === 'active');
    if (hasMotor) return null;

    return {
      product_id: 'motor-comprehensive',
      product_name: 'Bảo hiểm xe toàn diện',
      insurance_type: 'motor',
      score: 45,
      reason: 'Bảo vệ phương tiện và trách nhiệm dân sự khi tham gia giao thông.',
      priority: 'medium',
      suggested_coverage: 100000000,
      estimated_premium: 3000000,
    };
  }

  private evaluateTravelInsuranceNeed(profile: CustomerProfile): Recommendation | null {
    return {
      product_id: 'travel-international',
      product_name: 'Bảo hiểm du lịch quốc tế',
      insurance_type: 'travel',
      score: 30,
      reason: 'Bảo vệ bạn trong mọi chuyến đi nước ngoài.',
      priority: 'low',
      suggested_coverage: 50000000,
      estimated_premium: 500000,
    };
  }

  private evaluatePropertyInsuranceNeed(profile: CustomerProfile): Recommendation | null {
    let score = 35;
    if (profile.annual_income && profile.annual_income > 500000000) score += 15;

    return {
      product_id: 'home-comprehensive',
      product_name: 'Bảo hiểm nhà ở',
      insurance_type: 'property',
      score,
      reason: 'Bảo vệ tài sản nhà ở trước thiên tai, hỏa hoạn và trộm cắp.',
      priority: 'medium',
      suggested_coverage: (profile.annual_income || 300000000) * 3,
      estimated_premium: 2000000,
    };
  }

  private evaluatePersonalAccidentNeed(profile: CustomerProfile): Recommendation | null {
    const hasPA = profile.existing_policies?.some(p => p.insurance_type === 'personal_accident' && p.status === 'active');
    if (hasPA) return null;

    let score = 55;
    if (profile.occupation && ['driver', 'construction', 'delivery'].includes(profile.occupation)) score += 20;

    return {
      product_id: 'pa-standard',
      product_name: 'Bảo hiểm tai nạn cá nhân',
      insurance_type: 'personal_accident',
      score,
      reason: 'Chi trả khi xảy ra tai nạn bất ngờ. Phí rất thấp, quyền lợi cao.',
      priority: 'medium',
      suggested_coverage: 500000000,
      estimated_premium: 1000000,
    };
  }

  private async enhanceWithCollaborativeFiltering(customerId: string, recommendations: Recommendation[]): Promise<Recommendation[]> {
    // Simple collaborative filtering: boost recommendations based on what similar customers bought
    try {
      const similarPurchases = await AppDataSource.query(`
        SELECT p2.insurance_type, COUNT(*) as count
        FROM policy p1
        JOIN policy p2 ON p1.customer_id != p2.customer_id
        WHERE p1.customer_id = $1
          AND p2.insurance_type NOT IN (SELECT insurance_type FROM policy WHERE customer_id = $1)
        GROUP BY p2.insurance_type
        ORDER BY count DESC
        LIMIT 3
      `, [customerId]);

      for (const sp of similarPurchases) {
        const rec = recommendations.find(r => r.insurance_type === sp.insurance_type);
        if (rec) {
          rec.score = Math.min(100, rec.score + 10);
        }
      }
    } catch (error) {
      // Silently fail - enhancement is optional
    }

    return recommendations;
  }

  private recommendLifeCoverage(annualIncome: number, age: number, dependents: number): number {
    let multiplier = 10;
    if (age < 35) multiplier = 12;
    if (age > 50) multiplier = 7;
    if (dependents > 2) multiplier += 3;
    return annualIncome * multiplier;
  }

  private recommendHealthCoverage(annualIncome: number, age: number): number {
    if (age > 50) return 1000000000;
    if (age > 40) return 500000000;
    return 300000000;
  }

  private getGapPriority(category: string, gapPct: number): 'critical' | 'high' | 'medium' | 'low' {
    if (category === 'life' && gapPct > 80) return 'critical';
    if (category === 'health' && gapPct > 80) return 'critical';
    if (gapPct > 80) return 'high';
    if (gapPct > 50) return 'medium';
    return 'low';
  }

  private getGapSuggestion(category: string, gap: number, gapPct: number): string {
    const gapFormatted = (gap / 1000000).toFixed(0);
    const suggestions: Record<string, string> = {
      life: `Bạn cần thêm ${gapFormatted} triệu VND BH nhân thọ để đảm bảo tài chính gia đình.`,
      health: `Nên bổ sung ${gapFormatted} triệu VND BH sức khỏe để trang trải chi phí y tế.`,
      motor: `Xe của bạn chưa được bảo hiểm đầy đủ. Nên mua thêm BH xe toàn diện.`,
      property: `Tài sản nhà ở chưa được bảo vệ. Nên mua BH nhà với mức ${gapFormatted} triệu.`,
    };
    return suggestions[category] || `Thiếu hụt ${gapPct}% bảo hiểm ${category}.`;
  }

  private getInsuranceTypeName(type: string): string {
    const names: Record<string, string> = {
      life: 'BH Nhân thọ', health: 'BH Sức khỏe', motor: 'BH Xe',
      travel: 'BH Du lịch', property: 'BH Nhà', personal_accident: 'BH Tai nạn',
    };
    return names[type] || type;
  }

  private getDefaultRecommendations(): Recommendation[] {
    return [
      { product_id: 'health-comprehensive', product_name: 'BH Sức khỏe toàn diện', insurance_type: 'health', score: 85, reason: 'BH sức khỏe là nhu cầu thiết yếu.', priority: 'high', suggested_coverage: 500000000, estimated_premium: 10000000 },
      { product_id: 'life-endowment', product_name: 'BH Nhân thọ hỗn hợp', insurance_type: 'life', score: 75, reason: 'Bảo vệ tài chính và tích lũy dài hạn.', priority: 'high', suggested_coverage: 1000000000, estimated_premium: 25000000 },
      { product_id: 'motor-comprehensive', product_name: 'BH Xe toàn diện', insurance_type: 'motor', score: 60, reason: 'Bảo vệ phương tiện giao thông.', priority: 'medium', suggested_coverage: 100000000, estimated_premium: 3000000 },
    ];
  }
}
