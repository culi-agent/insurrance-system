/**
 * Dai-ichi Life Insurance Adapter (#5 - Health & Life Partner)
 */
import { BaseInsurerAdapter, QuoteRequest, QuoteResponse, InsurerConfig } from './base.adapter';

export class DaiIchiAdapter extends BaseInsurerAdapter {
  constructor() {
    const config: InsurerConfig = {
      code: 'dai_ichi',
      name: 'Dai-ichi Life Việt Nam',
      base_url: process.env.DAIICHI_API_URL || 'https://api.dai-ichi-life.com.vn',
      api_key: process.env.DAIICHI_API_KEY || 'demo_key',
      timeout: 10000,
      supported_products: ['health', 'life'],
    };
    super(config);
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    await this.simulateDelay(350, 850);

    if (request.insurance_type === 'health') {
      return this.calculateHealthQuote(request);
    }
    throw new Error(`Dai-ichi does not support ${request.insurance_type}`);
  }

  private calculateHealthQuote(request: QuoteRequest): QuoteResponse {
    const inputData = request.input_data || {};
    const planType = request.coverage_options?.plan_type || 'standard';
    const membersCount = inputData.members_count || 1;

    const planRates: Record<string, number> = {
      basic: 3800000,
      standard: 8500000,
      premium: 17000000,
      platinum: 33000000,
    };

    const basePerPerson = planRates[planType] || 8500000;
    const basePremium = basePerPerson * membersCount;
    const discount = membersCount >= 3 ? basePremium * 0.08 : 0;
    const tax = Math.round((basePremium - discount) * 0.1);
    const total = basePremium - discount + tax;

    return {
      insurer_code: this.config.code,
      insurer_name: this.config.name,
      product_name: 'Dai-ichi - An Tâm Sống Khỏe',
      base_premium: basePremium,
      discount,
      tax,
      total_premium: total,
      premium_breakdown: { per_person: basePerPerson, members: membersCount, base: basePremium, discount, vat: tax },
      coverage_details: [
        { name: 'Nội trú & phẫu thuật', coverage_amount: 1800000000, description: 'Tối đa 1.8 tỷ/năm' },
        { name: 'Ngoại trú', coverage_amount: 120000000, description: 'Tối đa 120 triệu/năm' },
        { name: 'Nha khoa', coverage_amount: 12000000, description: 'Tối đa 12 triệu/năm' },
        { name: 'Thai sản', coverage_amount: 70000000, description: 'Chờ 9 tháng' },
        { name: 'Tai nạn cá nhân', coverage_amount: 300000000, description: 'Tối đa 300 triệu' },
      ],
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        quote_ref: `DI-HLT-${Date.now()}`,
        rating: 4.4,
        features: ['Bảo lãnh viện phí', 'Mạng lưới 250+ bệnh viện', 'Tích lũy không bồi thường', 'Gia hạn trọn đời'],
      },
    };
  }

  async submitApplication(_request: any): Promise<any> {
    return { success: true, application_ref: `DI-APP-${Date.now()}`, status: 'submitted' };
  }

  async getApplicationStatus(ref: string): Promise<any> {
    return { ref, status: 'approved' };
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
  }
}
