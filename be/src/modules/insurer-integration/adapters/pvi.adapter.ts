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
 * PVI Insurance - Adapter Implementation
 * Simulated integration for development/testing.
 */
export class PviAdapter extends BaseInsurerAdapter {
  readonly insurerCode = 'PVI';
  readonly insurerName = 'PVI Insurance';
  readonly supportedTypes = ['motor', 'health', 'travel', 'property', 'business'];

  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    super();
    this.baseUrl = config?.baseUrl || process.env.PVI_API_URL || 'https://api.pvi.com.vn';
    this.apiKey = config?.apiKey || process.env.PVI_API_KEY || '';
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    logger.info(`[PVI] Generating quote for ${request.insurance_type}`);

    const basePremium = this.calculateBasePremium(request);
    const discount = basePremium * 0.08; // 8% online discount
    const tax = (basePremium - discount) * 0.1;
    const totalPremium = basePremium - discount + tax;

    return {
      insurer_code: this.insurerCode,
      insurer_name: this.insurerName,
      product_name: `PVI - ${this.getProductName(request.insurance_type)}`,
      base_premium: basePremium,
      discount,
      tax,
      total_premium: totalPremium,
      premium_breakdown: [
        { item: 'Phí bảo hiểm cơ bản', amount: basePremium },
        { item: 'Giảm giá mua online (8%)', amount: -discount },
        { item: 'VAT (10%)', amount: tax },
      ],
      coverage_details: this.getCoverageDetails(request),
      valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      metadata: {
        provider: 'pvi',
        quote_ref: `PVI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    };
  }

  async issuePolicy(request: PolicyRequest): Promise<PolicyResponse> {
    logger.info(`[PVI] Issuing policy for quote ${request.quote_id}`);

    const policyNumber = `PVI-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return {
      policy_number: policyNumber,
      status: 'active',
      document_url: `https://docs.pvi.com.vn/policy/${policyNumber}.pdf`,
      effective_date: request.start_date,
      expiry_date: request.end_date,
      metadata: {
        issued_at: new Date().toISOString(),
        insurer: this.insurerCode,
      },
    };
  }

  async submitClaim(request: ClaimRequest): Promise<ClaimResponse> {
    logger.info(`[PVI] Submitting claim for policy ${request.policy_number}`);

    return {
      claim_number: `PVI-CLM-${Date.now()}`,
      status: 'submitted',
      estimated_settlement: request.amount_claimed * 0.85,
      message: 'Hồ sơ bồi thường đã được tiếp nhận.',
    };
  }

  async healthCheck(): Promise<InsurerHealth> {
    const start = Date.now();
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start + Math.random() * 30,
      last_checked: new Date(),
      message: 'OK',
    };
  }

  private calculateBasePremium(request: QuoteRequest): number {
    const typeMultipliers: Record<string, number> = {
      motor: 0.9,
      health: 1.4,
      travel: 0.45,
      property: 1.1,
      business: 2.5,
    };
    const multiplier = typeMultipliers[request.insurance_type] || 1.0;
    const baseAmount = 2200000; // 2.2M VND base
    return baseAmount * multiplier;
  }

  private getProductName(type: string): string {
    const names: Record<string, string> = {
      motor: 'Xe An Toàn Plus',
      health: 'Sức Khỏe Vàng',
      travel: 'Du Lịch An Tâm',
      property: 'Nhà An Toàn',
      business: 'Doanh Nghiệp Bền Vững',
    };
    return names[type] || 'Bảo hiểm PVI';
  }

  private getCoverageDetails(request: QuoteRequest) {
    const coverage: Record<string, any[]> = {
      motor: [
        { name: 'Thiệt hại vật chất', sum_insured: 600000000, description: 'Bồi thường toàn bộ/một phần' },
        { name: 'TNDS bắt buộc', sum_insured: 150000000, description: 'Theo quy định pháp luật' },
        { name: 'Mất cắp toàn bộ', sum_insured: 400000000, description: 'Bồi thường mất cắp' },
      ],
      health: [
        { name: 'Nội trú', sum_insured: 250000000, description: 'Chi phí điều trị nội trú' },
        { name: 'Ngoại trú', sum_insured: 60000000, description: 'Chi phí khám chữa bệnh' },
        { name: 'Nha khoa', sum_insured: 10000000, description: 'Chi phí nha khoa' },
      ],
      travel: [
        { name: 'Y tế quốc tế', sum_insured: 2000000000, description: 'Chi phí y tế toàn cầu' },
        { name: 'Hành lý', sum_insured: 40000000, description: 'Mất mát hành lý' },
        { name: 'Trễ chuyến', sum_insured: 10000000, description: 'Bồi thường trễ chuyến bay' },
      ],
    };
    return coverage[request.insurance_type] || [];
  }
}
