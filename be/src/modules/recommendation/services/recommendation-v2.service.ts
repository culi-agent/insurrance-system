import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface RecommendationV2 {
  product_id: string;
  product_name: string;
  insurance_type: string;
  insurer_name: string;
  score: number; // 0-100 composite score
  scores_breakdown: {
    rule_based: number;
    collaborative: number;
    behavioral: number;
    contextual: number;
    lifecycle: number;
  };
  reason: string;
  reasons_detail: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggested_coverage: number;
  estimated_premium: number;
  confidence: number; // 0-100
  tags: string[];
}

export interface BehaviorSignal {
  type: 'page_view' | 'quote_started' | 'quote_completed' | 'comparison_viewed' | 'product_clicked' | 'search';
  insurance_type?: string;
  product_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RecommendationContext {
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  day_of_week: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  device: 'mobile' | 'desktop' | 'tablet';
  recent_life_events?: string[]; // e.g., 'new_car', 'marriage', 'new_baby', 'new_home'
}

export class RecommendationV2Service {
  /**
   * Get ML-enhanced recommendations (v2)
   */
  async getRecommendations(customerId: string, context?: Partial<RecommendationContext>): Promise<RecommendationV2[]> {
    // Gather all signals
    const [profile, behaviorHistory, purchaseHistory, similarCustomers, lifecycleStage] = await Promise.all([
      this.getCustomerProfile(customerId),
      this.getBehaviorHistory(customerId),
      this.getPurchaseHistory(customerId),
      this.findSimilarCustomers(customerId),
      this.determineLifecycleStage(customerId),
    ]);

    const recommendations: RecommendationV2[] = [];
    const existingTypes = new Set(purchaseHistory.map(p => p.insurance_type));

    // Get all available product types
    const productTypes = ['health', 'life', 'motor', 'travel', 'property', 'personal_accident', 'home'];

    for (const type of productTypes) {
      const ruleScore = this.calculateRuleBasedScore(profile, type, existingTypes);
      const collaborativeScore = this.calculateCollaborativeScore(similarCustomers, type, existingTypes);
      const behavioralScore = this.calculateBehavioralScore(behaviorHistory, type);
      const contextualScore = this.calculateContextualScore(context || {}, type, profile);
      const lifecycleScore = this.calculateLifecycleScore(lifecycleStage, type, existingTypes);

      // Weighted composite score
      const weights = { rule: 0.25, collaborative: 0.25, behavioral: 0.20, contextual: 0.15, lifecycle: 0.15 };
      const compositeScore = Math.round(
        ruleScore * weights.rule +
        collaborativeScore * weights.collaborative +
        behavioralScore * weights.behavioral +
        contextualScore * weights.contextual +
        lifecycleScore * weights.lifecycle
      );

      if (compositeScore > 20) { // Only include if score > 20
        const product = await this.getBestProductForType(type);
        if (!product) continue;

        const reasons = this.generateReasons(profile, type, {
          ruleScore, collaborativeScore, behavioralScore, contextualScore, lifecycleScore
        }, lifecycleStage, behaviorHistory);

        recommendations.push({
          product_id: product.id,
          product_name: product.name,
          insurance_type: type,
          insurer_name: product.insurer_name,
          score: compositeScore,
          scores_breakdown: {
            rule_based: ruleScore,
            collaborative: collaborativeScore,
            behavioral: behavioralScore,
            contextual: contextualScore,
            lifecycle: lifecycleScore,
          },
          reason: reasons[0] || '',
          reasons_detail: reasons,
          priority: this.scoreToPriority(compositeScore),
          suggested_coverage: this.suggestCoverage(type, profile),
          estimated_premium: this.estimatePremium(type, profile),
          confidence: this.calculateConfidence(ruleScore, collaborativeScore, behavioralScore),
          tags: this.generateTags(type, compositeScore, lifecycleStage),
        });
      }
    }

    // Sort by composite score
    recommendations.sort((a, b) => b.score - a.score);

    // Log for ML feedback loop
    await this.logRecommendations(customerId, recommendations.slice(0, 5));

    return recommendations.slice(0, 5);
  }

  /**
   * Track user behavior for recommendation improvement
   */
  async trackBehavior(customerId: string, signal: BehaviorSignal): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO recommendation_behavior (id, customer_id, signal_type, insurance_type, product_id, metadata, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [customerId, signal.type, signal.insurance_type || null, signal.product_id || null, JSON.stringify(signal.metadata || {})]
    );
  }

  /**
   * Track recommendation interaction (click, dismiss, purchase)
   */
  async trackInteraction(customerId: string, recommendationId: string, action: 'viewed' | 'clicked' | 'dismissed' | 'purchased'): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO recommendation_interaction (id, customer_id, recommendation_id, action, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [customerId, recommendationId, action]
    );

    // Update recommendation model feedback
    if (action === 'purchased') {
      logger.info(`[RecV2] Positive feedback: customer=${customerId} purchased from recommendation`);
    }
  }

  /**
   * Get trending products (popular this week/month)
   */
  async getTrendingProducts(limit: number = 5): Promise<Array<{ product_id: string; product_name: string; insurance_type: string; purchase_count: number; trend_direction: 'up' | 'down' | 'stable' }>> {
    const currentWeek = await AppDataSource.query(`
      SELECT p.product_id, pr.name as product_name, pr.insurance_type, COUNT(*) as purchase_count
      FROM policy p JOIN product pr ON p.product_id = pr.id
      WHERE p.created_at > NOW() - INTERVAL '7 days'
      GROUP BY p.product_id, pr.name, pr.insurance_type
      ORDER BY purchase_count DESC LIMIT $1
    `, [limit]);

    const prevWeek = await AppDataSource.query(`
      SELECT product_id, COUNT(*) as count
      FROM policy
      WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
      GROUP BY product_id
    `);
    const prevMap = new Map(prevWeek.map((p: any) => [p.product_id, parseInt(p.count)]));

    return currentWeek.map((p: any) => {
      const current = parseInt(p.purchase_count);
      const prev = prevMap.get(p.product_id) || 0;
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        insurance_type: p.insurance_type,
        purchase_count: current,
        trend_direction: current > prev * 1.1 ? 'up' : current < prev * 0.9 ? 'down' : 'stable' as any,
      };
    });
  }

  // ============ ML Scoring Methods ============

  private calculateRuleBasedScore(profile: any, type: string, existing: Set<string>): number {
    if (existing.has(type)) return 10; // Already has this type

    let score = 30; // Base
    const age = profile.age || 35;
    const income = profile.annual_income || 300000000;
    const dependents = profile.dependents || 0;

    switch (type) {
      case 'health':
        score += 30; // Everyone needs health
        if (age > 35) score += 15;
        if (age > 50) score += 10;
        break;
      case 'life':
        if (dependents > 0) score += 25;
        if (age >= 25 && age <= 55) score += 20;
        if (profile.marital_status === 'married') score += 10;
        break;
      case 'motor':
        score += 15;
        break;
      case 'property':
      case 'home':
        if (income > 500000000) score += 20;
        if (age > 30) score += 10;
        break;
      case 'travel':
        if (income > 300000000) score += 10;
        break;
      case 'personal_accident':
        score += 20; // Low cost, high value
        if (profile.occupation && ['driver', 'construction', 'delivery'].includes(profile.occupation)) score += 25;
        break;
    }

    return Math.min(100, score);
  }

  private calculateCollaborativeScore(similarCustomers: any[], type: string, existing: Set<string>): number {
    if (existing.has(type)) return 5;
    if (similarCustomers.length === 0) return 30;

    const purchasedCount = similarCustomers.filter(c => c.insurance_types.includes(type)).length;
    const rate = purchasedCount / similarCustomers.length;

    return Math.min(100, Math.round(rate * 100));
  }

  private calculateBehavioralScore(behavior: any[], type: string): number {
    if (behavior.length === 0) return 20;

    const relevantBehavior = behavior.filter(b => b.insurance_type === type);
    if (relevantBehavior.length === 0) return 10;

    let score = 20;
    for (const b of relevantBehavior) {
      switch (b.signal_type) {
        case 'quote_started': score += 25; break;
        case 'quote_completed': score += 35; break;
        case 'comparison_viewed': score += 20; break;
        case 'product_clicked': score += 15; break;
        case 'page_view': score += 5; break;
        case 'search': score += 10; break;
      }
    }

    // Recency boost: more recent = higher score
    const mostRecent = relevantBehavior[0];
    if (mostRecent) {
      const hoursSince = (Date.now() - new Date(mostRecent.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) score += 20;
      else if (hoursSince < 72) score += 10;
    }

    return Math.min(100, score);
  }

  private calculateContextualScore(context: Partial<RecommendationContext>, type: string, profile: any): number {
    let score = 30;

    // Seasonal relevance
    if (context.season === 'summer' && type === 'travel') score += 25;
    if (context.season === 'winter' && type === 'health') score += 10;

    // Life events
    if (context.recent_life_events) {
      if (context.recent_life_events.includes('new_car') && type === 'motor') score += 40;
      if (context.recent_life_events.includes('marriage') && type === 'life') score += 30;
      if (context.recent_life_events.includes('new_baby') && (type === 'life' || type === 'health')) score += 30;
      if (context.recent_life_events.includes('new_home') && (type === 'home' || type === 'property')) score += 40;
    }

    // Device context
    if (context.device === 'mobile' && type === 'travel') score += 5; // Travel often bought on mobile

    return Math.min(100, score);
  }

  private calculateLifecycleScore(stage: string, type: string, existing: Set<string>): number {
    if (existing.has(type)) return 5;

    const stageRecommendations: Record<string, string[]> = {
      'new_customer': ['health', 'motor', 'personal_accident'],
      'single_policy': ['health', 'life', 'personal_accident'],
      'multi_policy': ['property', 'home', 'travel'],
      'mature_customer': ['life', 'property'],
      'high_value': ['life', 'property', 'home'],
      'at_risk': ['health'], // Retention-focused
    };

    const recommended = stageRecommendations[stage] || [];
    if (recommended.includes(type)) return 70;
    return 20;
  }

  // ============ Helper Methods ============

  private async getCustomerProfile(customerId: string): Promise<any> {
    const customer = await AppDataSource.query(
      `SELECT *, EXTRACT(YEAR FROM AGE(NOW(), date_of_birth))::int as age FROM customer WHERE id = $1`,
      [customerId]
    );
    return customer[0] || { age: 35 };
  }

  private async getBehaviorHistory(customerId: string): Promise<any[]> {
    return AppDataSource.query(
      `SELECT * FROM recommendation_behavior WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [customerId]
    );
  }

  private async getPurchaseHistory(customerId: string): Promise<any[]> {
    return AppDataSource.query(
      `SELECT pr.insurance_type, p.premium_amount, p.created_at
       FROM policy p JOIN product pr ON p.product_id = pr.id
       WHERE p.customer_id = $1`,
      [customerId]
    );
  }

  private async findSimilarCustomers(customerId: string): Promise<any[]> {
    // Find customers with similar age/income who have more policies
    const profile = await this.getCustomerProfile(customerId);
    const age = profile.age || 35;

    const similar = await AppDataSource.query(`
      SELECT c.id, array_agg(DISTINCT pr.insurance_type) as insurance_types
      FROM customer c
      JOIN policy p ON p.customer_id = c.id
      JOIN product pr ON p.product_id = pr.id
      WHERE c.id != $1
        AND EXTRACT(YEAR FROM AGE(NOW(), c.date_of_birth)) BETWEEN $2 AND $3
        AND p.status = 'active'
      GROUP BY c.id
      HAVING COUNT(p.id) >= 2
      LIMIT 100
    `, [customerId, age - 5, age + 5]);

    return similar;
  }

  private async determineLifecycleStage(customerId: string): Promise<string> {
    const data = await AppDataSource.query(`
      SELECT COUNT(*) as policy_count, COALESCE(SUM(premium_amount), 0) as total_spent,
             MIN(created_at) as first_purchase
      FROM policy WHERE customer_id = $1
    `, [customerId]);

    const d = data[0];
    const policyCount = parseInt(d.policy_count) || 0;
    const totalSpent = parseFloat(d.total_spent) || 0;

    if (policyCount === 0) return 'new_customer';
    if (policyCount === 1) return 'single_policy';
    if (totalSpent > 50000000) return 'high_value';
    if (policyCount >= 3) return 'mature_customer';
    return 'multi_policy';
  }

  private async getBestProductForType(type: string): Promise<any | null> {
    const products = await AppDataSource.query(`
      SELECT pr.id, pr.name, COALESCE(i.name, 'N/A') as insurer_name
      FROM product pr
      LEFT JOIN insurer i ON pr.insurer_id = i.id
      WHERE pr.insurance_type = $1 AND pr.status = 'active'
      ORDER BY pr.created_at DESC LIMIT 1
    `, [type]);
    return products[0] || null;
  }

  private generateReasons(profile: any, type: string, scores: any, lifecycle: string, behavior: any[]): string[] {
    const reasons: string[] = [];

    if (scores.ruleScore > 60) {
      const ruleReasons: Record<string, string> = {
        health: `Ở độ tuổi ${profile.age || 35}, bảo hiểm sức khỏe là ưu tiên hàng đầu`,
        life: profile.dependents > 0 ? `Có ${profile.dependents} người phụ thuộc cần được bảo vệ tài chính` : 'Bảo vệ tài chính dài hạn cho bạn và gia đình',
        motor: 'Bảo vệ phương tiện di chuyển hàng ngày',
        property: 'Bảo vệ tài sản có giá trị lớn',
        home: 'An toàn cho ngôi nhà trước rủi ro bất ngờ',
        personal_accident: 'Chi phí thấp, quyền lợi cao khi gặp tai nạn',
        travel: 'Yên tâm trong mọi chuyến đi',
      };
      reasons.push(ruleReasons[type] || '');
    }

    if (scores.collaborativeScore > 50) {
      reasons.push(`${scores.collaborativeScore}% khách hàng tương tự đã chọn sản phẩm này`);
    }

    if (scores.behavioralScore > 50) {
      reasons.push('Dựa trên lịch sử tìm kiếm và xem sản phẩm của bạn');
    }

    if (scores.lifecycleScore > 50) {
      reasons.push('Phù hợp với giai đoạn hiện tại của bạn');
    }

    return reasons.filter(r => r.length > 0);
  }

  private scoreToPriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private suggestCoverage(type: string, profile: any): number {
    const income = profile.annual_income || 300000000;
    const coverageMap: Record<string, number> = {
      health: 500000000,
      life: income * 10,
      motor: 100000000,
      property: income * 3,
      home: income * 3,
      travel: 50000000,
      personal_accident: 500000000,
    };
    return coverageMap[type] || 200000000;
  }

  private estimatePremium(type: string, profile: any): number {
    const age = profile.age || 35;
    const premiumMap: Record<string, number> = {
      health: age > 40 ? 15000000 : 8000000,
      life: 25000000,
      motor: 3000000,
      property: 2000000,
      home: 2500000,
      travel: 500000,
      personal_accident: 1000000,
    };
    return premiumMap[type] || 5000000;
  }

  private calculateConfidence(rule: number, collab: number, behavior: number): number {
    // Higher variance = lower confidence
    const scores = [rule, collab, behavior];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(30, Math.min(95, Math.round(100 - stdDev)));
  }

  private generateTags(type: string, score: number, lifecycle: string): string[] {
    const tags: string[] = [];
    if (score >= 80) tags.push('hot');
    if (lifecycle === 'new_customer') tags.push('starter');
    if (type === 'health' || type === 'life') tags.push('essential');
    if (type === 'personal_accident') tags.push('affordable');
    if (type === 'travel') tags.push('seasonal');
    return tags;
  }

  private async logRecommendations(customerId: string, recommendations: RecommendationV2[]): Promise<void> {
    try {
      await AppDataSource.query(
        `INSERT INTO recommendation_log (id, customer_id, recommendations, created_at)
         VALUES (gen_random_uuid(), $1, $2, NOW())`,
        [customerId, JSON.stringify(recommendations.map(r => ({ product_id: r.product_id, score: r.score, type: r.insurance_type })))]
      );
    } catch (e) {
      // Non-critical, don't fail
    }
  }
}
