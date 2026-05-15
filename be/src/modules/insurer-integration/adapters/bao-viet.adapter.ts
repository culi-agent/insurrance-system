import {
  BaseInsurerAdapter,
  QuoteRequest,
  QuoteResponse,
  PolicyRequest,
  PolicyResponse,
  ClaimRequest,
  ClaimResponse,
  InsurerHealth,
} from './base.adapter';
import { logger } from '../../../shared/utils/logger';

/**
 * Bao Viet Insurance - Adapter Implementation
 * Simulated integration for development/testing.
 * In production, this would call Bao Viet's actual API.
 */
export class BaoVietAdapter extends BaseInsurerAdapter {
  readonly insurerCode = 'BAO_VIET';
  readonly insurerName = 'Bảo Việt';
  readonly supportedTypes = ['motor', 'health', 'travel', 'property', 'life'];

  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    super();
    this.baseUrl = config?.baseUrl || process.env.BAO_VIET_API_URL || 'https://api.baoviet.com.vn';
    this.apiKey = config?.apiKey || process.env.BAO_VIET_API_KEY || '';
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    logger.info(`[BaoViet] Generating quote for ${request.insurance_type}`);

    // Simulated pricing logic
    const basePremium = this.calculateBasePremium(request);
    const discount = basePremium * 0.05; // 5% early-bird discount
    const tax = (basePremium - discount) * 0.1; // 10% VAT
    const totalPremium = basePremium - discount + tax;

    return {
      insurer_code: this.insurerCode,
      insurer_name: this.insurerName,
      product_name: `Bảo Việt - ${this.getProductName(request.insurance_type)}`,
      base_premium: basePremium,
      discount,
      tax,
      total_premium: totalPremium,
      premium_breakdown: [
        { item: 'Phí bảo hiểm cơ bản', amount: basePremium },
        { item: 'Giảm giá đặt sớm (5%)', amount: -discount },
        { item: 'VAT (10%)', amount: tax },
      ],
      coverage_details: this.getCoverageDetails(request),
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      metadata: {
        provider: 'bao_viet',
        quote_ref: `BV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    };
  }

  async issuePolicy(request: PolicyRequest): Promise<PolicyResponse> {
    logger.info(`[BaoViet] Issuing policy for quote ${request.quote_id}`);

    // Simulated policy issuance
    const policyNumber = `BV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return {
      policy_number: policyNumber,
      status: 'active',
      document_url: `https://docs.baoviet.com.vn/policy/${policyNumber}.pdf`,
      effective_date: request.start_date,
      expiry_date: request.end_date,
      metadata: {
        issued_at: new Date().toISOString(),
        insurer: this.insurerCode,
      },
    };
  }

  async submitClaim(request: ClaimRequest): Promise<ClaimResponse> {
    logger.info(`[BaoViet] Submitting claim for policy ${request.policy_number}`);

    return {
      claim_number: `BV-CLM-${Date.now()}`,
      status: 'submitted',
      estimated_settlement: request.amount_claimed * 0.8,
      message: 'Yêu cầu bồi thường đã được tiếp nhận. Chúng tôi sẽ xử lý trong 3-5 ngày làm việc.',
    };
  }

  async healthCheck(): Promise<InsurerHealth> {
    const start = Date.now();
    // Simulated health check
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start + Math.random() * 50,
      last_checked: new Date(),
      message: 'All systems operational',
    };
  }

  private calculateBasePremium(request: QuoteRequest): number {
    const typeMultipliers: Record<string, number> = {
      motor: 1.0,
      health: 1.5,
      travel: 0.5,
      property: 1.2,
      life: 2.0,
    };
    const multiplier = typeMultipliers[request.insurance_type] || 1.0;
    const baseAmount = 2000000; // 2M VND base
    return baseAmount * multiplier;
  }

  private getProductName(type: string): string {
    const names: Record<string, string> = {
      motor: 'Bảo hiểm xe cơ giới toàn diện',
      health: 'Bảo hiểm sức khỏe An Tâm',
      travel: 'Bảo hiểm du lịch Toàn Cầu',
      property: 'Bảo hiểm nhà tư nhân',
      life: 'Bảo hiểm nhân thọ Phú Quý',
    };
    return names[type] || 'Bảo hiểm toàn diện';
  }

  private getCoverageDetails(request: QuoteRequest) {
    const coverage: Record<string, any[]> = {
      motor: [
        { name: 'Thiệt hại vật chất xe', sum_insured: 500000000, description: 'Bồi thường thiệt hại vật chất xe' },
        { name: 'Trách nhiệm dân sự', sum_insured: 150000000, description: 'TNDS bắt buộc' },
        { name: 'Tai nạn lái xe', sum_insured: 50000000, description: 'Bảo hiểm tai nạn cho lái xe' },
      ],
      health: [
        { name: 'Nội trú', sum_insured: 200000000, description: 'Chi phí nằm viện' },
        { name: 'Ngoại trú', sum_insured: 50000000, description: 'Chi phí khám ngoại trú' },
        { name: 'Phẫu thuật', sum_insured: 300000000, description: 'Chi phí phẫu thuật' },
      ],
      travel: [
        { name: 'Chi phí y tế', sum_insured: 1000000000, description: 'Chi phí y tế ở nước ngoài' },
        { name: 'Hành lý', sum_insured: 30000000, description: 'Mất/hư hỏng hành lý' },
        { name: 'Hủy chuyến', sum_insured: 50000000, description: 'Chi phí hủy chuyến' },
      ],
    };
    return coverage[request.insurance_type] || [];
  }
}
