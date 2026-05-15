/**
 * Product Comparison & Recommendation Engine
 * Sprint 9: S9-01 to S9-04
 */
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Product } from '../entities/Product';

export interface ComparisonResult {
  products: Array<{
    id: string;
    name: string;
    insurer: string;
    plan_type: string;
    premium: number;
    coverage_limit: number;
    features: string[];
    rating: number;
    pros: string[];
    cons: string[];
  }>;
  comparison_matrix: Record<string, Record<string, any>>;
  recommendation?: { product_id: string; reason: string };
}

export interface RecommendationInput {
  customer_age?: number;
  budget?: number;
  insurance_type: string;
  priorities?: string[]; // e.g., ['price', 'coverage', 'brand']
  family_size?: number;
}

export class ComparisonService {
  private productRepo: Repository<Product>;

  constructor() {
    this.productRepo = AppDataSource.getRepository(Product);
  }

  /**
   * Compare multiple products side-by-side
   */
  async compareProducts(productIds: string[]): Promise<ComparisonResult> {
    const products = await this.productRepo.find({
      where: productIds.map(id => ({ id })),
      relations: ['category', 'insurer'],
    });

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      insurer: p.insurer?.name || '',
      plan_type: p.metadata?.plan_type || 'standard',
      premium: p.minPremium || 0,
      coverage_limit: p.metadata?.coverage_limit || 0,
      features: p.benefits?.features || [],
      rating: p.rating || 4.0,
      pros: p.benefits?.pros || ['Uy tín', 'Bồi thường nhanh'],
      cons: p.benefits?.cons || ['Phí cao hơn'],
    }));

    // Build comparison matrix
    const matrix: Record<string, Record<string, any>> = {};
    const attributes = ['premium', 'coverage_limit', 'rating', 'insurer'];
    for (const attr of attributes) {
      matrix[attr] = {};
      for (const product of formattedProducts) {
        matrix[attr][product.id] = (product as any)[attr];
      }
    }

    // Simple recommendation: best value (coverage/premium ratio)
    let recommendation: ComparisonResult['recommendation'];
    if (formattedProducts.length > 0) {
      const best = formattedProducts.reduce((prev, curr) => {
        const prevRatio = (prev.coverage_limit || prev.premium * 100) / (prev.premium || 1);
        const currRatio = (curr.coverage_limit || curr.premium * 100) / (curr.premium || 1);
        return currRatio > prevRatio ? curr : prev;
      });
      recommendation = { product_id: best.id, reason: 'Tỷ lệ quyền lợi/phí tốt nhất' };
    }

    return { products: formattedProducts, comparison_matrix: matrix, recommendation };
  }

  /**
   * Get personalized product recommendations
   */
  async getRecommendations(input: RecommendationInput): Promise<Array<{
    product_id: string;
    product_name: string;
    insurer_name: string;
    score: number;
    reasons: string[];
    premium: number;
  }>> {
    // Fetch active products for the insurance type
    const queryBuilder = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.insurer', 'i')
      .where('p.status = :status', { status: 'active' });

    if (input.insurance_type) {
      queryBuilder.andWhere('c.slug LIKE :type', { type: `%${input.insurance_type}%` });
    }

    const products = await queryBuilder.orderBy('p.rating', 'DESC').take(20).getMany();

    // Score each product
    const scored = products.map(product => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Budget match
      if (input.budget && product.minPremium) {
        if (product.minPremium <= input.budget) {
          score += 20;
          reasons.push('Phù hợp ngân sách');
        } else if (product.minPremium <= input.budget * 1.2) {
          score += 10;
          reasons.push('Gần ngân sách');
        }
      }

      // Rating bonus
      if (product.rating && product.rating >= 4.5) {
        score += 15;
        reasons.push('Đánh giá cao từ khách hàng');
      }

      // Featured bonus
      if (product.isFeatured) {
        score += 10;
        reasons.push('Sản phẩm nổi bật');
      }

      // Age eligibility
      if (input.customer_age) {
        if (product.minAge && product.maxAge) {
          if (input.customer_age >= product.minAge && input.customer_age <= product.maxAge) {
            score += 5;
          }
        }
      }

      // Priority bonuses
      if (input.priorities?.includes('price') && product.minPremium && input.budget) {
        const savings = input.budget - product.minPremium;
        if (savings > 0) {
          score += Math.min(15, Math.floor(savings / input.budget * 30));
          reasons.push('Tiết kiệm chi phí');
        }
      }

      if (input.priorities?.includes('brand')) {
        score += 5;
        reasons.push('Thương hiệu uy tín');
      }

      return {
        product_id: product.id,
        product_name: product.name,
        insurer_name: product.insurer?.name || '',
        score: Math.min(100, score),
        reasons: reasons.length > 0 ? reasons : ['Phù hợp với nhu cầu'],
        premium: product.minPremium || 0,
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
  }

  /**
   * Expire quotes past validity
   */
  async expireOldQuotes(): Promise<number> {
    const result = await AppDataSource.query(`
      UPDATE quotation SET status = 'expired'
      WHERE status = 'quoted' AND valid_until < NOW()
    `);
    return result?.length || 0;
  }
}
